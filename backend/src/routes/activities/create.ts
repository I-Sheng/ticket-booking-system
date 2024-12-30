import express from 'express'
import multer from 'multer'
import { createActivityWithRegions } from '../../database/activities/post'
import { jwtProtect, hostProtect } from '../middleware'
import { createTicket } from '../../database/tickets/post'

const router = express.Router()
const upload = multer()

router.post(
  '/create',
  jwtProtect,
  hostProtect,
  async (req, res, next) => {
    // 保存解碼的數據，避免被 multer 覆蓋
    const decoded = req.body.decoded
    upload.fields([{ name: 'cover_img' }, { name: 'price_level_img' }])(
      req,
      res,
      (err) => {
        if (err) {
          return next(err) // 如果文件處理出現錯誤，轉交給錯誤處理程序
        }
        // 恢復 decoded 數據到 req.body
        req.body.decoded = decoded
        next()
      }
    )
  },
  async (req, res) => {
    try {
      const creatorId = req.body.decoded._id // 從 req.body 取出解碼的 _id
      console.log(req.body.decoded)
      const {
        on_sale_date,
        start_time,
        end_time,
        title,
        content,
        arena_id,
        regions,
      } = req.body

      // 確保 decoded 信息存在
      if (!req.body.decoded || !req.body.decoded._id) {
        return res
          .status(403)
          .json({ error: 'Invalid token or missing user information.' })
      }

      // Validate dates
      const now = new Date()
      if (new Date(on_sale_date) <= now) {
        return res
          .status(400)
          .json({ error: 'on_sale_date must be in the future.' })
      }
      if (new Date(start_time) <= new Date(on_sale_date)) {
        return res
          .status(400)
          .json({ error: 'start_time must be after on_sale_date.' })
      }
      if (new Date(end_time) <= new Date(start_time)) {
        return res
          .status(400)
          .json({ error: 'end_time must be after start_time.' })
      }

      // Validate regions
      if (!regions || !Array.isArray(regions) || regions.length === 0) {
        return res
          .status(400)
          .json({ error: 'At least one region must be provided.' })
      }

      for (const region of regions) {
        if (
          !region.region_name ||
          !region.region_price ||
          !region.region_capacity
        ) {
          return res.status(400).json({
            error:
              'Each region must have a region_name, region_price, and region_capacity.',
          })
        }
        if (region.region_price <= 0 || region.region_capacity <= 0) {
          return res
            .status(400)
            .json({ error: 'Region price and capacity must be positive.' })
        }
      }

      // Get images
      const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined
      const coverImg = files?.['cover_img']?.[0]?.buffer || null
      const priceLevelImg = files?.['price_level_img']?.[0]?.buffer || null

      // Call database function to create activity and regions
      const result = await createActivityWithRegions({
        on_sale_date,
        start_time,
        end_time,
        title,
        content,
        cover_img: coverImg,
        price_level_img: priceLevelImg,
        arena_id,
        creator_id: creatorId,
        regions,
      })

      if ('error' in result) {
        return res.status(400).json({ error: result.error })
      }

      // Generate tickets for each region
      const tickets = []
      for (const region of result.regions) {
        for (
          let seatNumber = 1;
          seatNumber <= region.region_capacity;
          seatNumber++
        ) {
          const ticket = await createTicket({
            user_id: null, // Ticket not assigned to any user initially
            activity_id: result.activity._id,
            region_id: region._id,
            seat_number: seatNumber,
            is_paid: false, // Default to unpaid
          })

          if ('error' in ticket) {
            throw new Error(`Failed to create ticket: ${ticket.error}`)
          }
          tickets.push(ticket)
        }
      }

      return res.status(201).json({
        message: 'Activity and tickets created successfully',
        activity: result.activity,
        regions: result.regions,
        //tickets: tickets,
      })
    } catch (error) {
      console.error('Error in POST /activities/create:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

export default router
