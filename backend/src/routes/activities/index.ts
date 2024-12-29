import express from 'express'
import multer from 'multer'
import regionsRouter from './regions'
import {
  listActivities,
  getActivityById,
  listActivitiesByCreatorId,
} from '../../database/activities/get'
import { createActivityWithRegions } from '../../database/activities/post'
import { updateActivity } from '../../database/activities/update'
import { listRegions } from '../../database/regions/get'
import { jwtProtect, hostProtect } from '../middleware'

const router = express.Router()
const upload = multer()

router.use('/regions', regionsRouter)

// Create a new activity
import { createTicket } from '../../database/tickets/post'

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
    regionsRouter
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

// List all active activities
router.get('/list', async (req, res) => {
  try {
    const { arena_id } = req.query
    const result = await listActivities(arena_id as string)

    if ('error' in result) {
      return res.status(404).json({ error: result.error })
    }

    // Process images to convert binary data into Base64
    const activitiesWithImages = result.map((activity: any) => ({
      ...activity,
      cover_img: activity.cover_img
        ? `data:image/jpeg;base64,${activity.cover_img.toString('base64')}`
        : null,
      price_level_img: activity.price_level_img
        ? `data:image/jpeg;base64,${activity.price_level_img.toString(
            'base64'
          )}`
        : null,
    }))

    return res.status(200).json({ activities: activitiesWithImages })
  } catch (error) {
    console.error('Error in GET /activities/list:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// get the activities by id
router.get('/:activity_id', async (req, res) => {
  try {
    const { activity_id } = req.params

    // Fetch activity details
    const activity = await getActivityById(activity_id)
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' })
    }

    // Fetch regions for the activity
    const regions = await listRegions(activity_id)

    if ('error' in regions) {
      return res.status(404).json({ error: regions.error })
    }

    // Combine activity details and regions in the response
    return res.status(200).json({
      message: 'Activity and regions retrieved successfully',
      activity: {
        ...activity,
        regions: regions, // Add regions to the activity response
      },
    })
  } catch (error) {
    console.error('Error in GET /:activity_id:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Get all activities by a specific creator
router.get(
  '/creator/:creator_id',
  jwtProtect,
  hostProtect,
  async (req, res) => {
    try {
      const { creator_id } = req.params

      // Fetch activities created by the specified creator
      const activities = await listActivitiesByCreatorId(creator_id)

      if ('error' in activities) {
        return res.status(404).json({ error: activities.error })
      }

      return res.status(200).json({
        message: 'Activities retrieved successfully',
        activities: activities,
      })
    } catch (error) {
      console.error('Error in GET /activities/creator/:creator_id:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// update the activity information except region, e.g. title, content, start_time...
router.patch(
  '/:activity_id',
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
      const { on_sale_date, start_time, end_time, title, content } = req.body

      // 確保 decoded 信息存在
      if (!req.body.decoded || !req.body.decoded._id) {
        return res
          .status(403)
          .json({ error: 'Invalid token or missing user information.' })
      }
      const { activity_id } = req.params

      // Fetch the activity details
      const activity = await getActivityById(activity_id)
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' })
      }

      // Ensure the requester is the creator
      //const { decoded } = req.body // Extract the authenticated user from the request
      if (activity.creator_id !== creatorId) {
        return res
          .status(403)
          .json({ error: 'Only the creator can update the activity.' })
      }
      //const { title, content, on_sale_date, start_time, end_time } = req.body

      const now = new Date()
      const onSaleDate = new Date(activity.on_sale_date)

      // Validate fields restricted to updates before the on-sale date
      if (now >= onSaleDate) {
        if (
          title !== undefined ||
          on_sale_date !== undefined ||
          start_time !== undefined ||
          end_time !== undefined
        ) {
          return res.status(400).json({
            error:
              'Title, on-sale date, start time, and end time can only be updated before the on-sale date.',
          })
        }
      }

      // Validate updated fields
      if (on_sale_date && new Date(on_sale_date) <= now) {
        return res.status(400).json({
          error: 'The new on-sale date must be in the future.',
        })
      }

      if (
        start_time &&
        new Date(start_time) <= new Date(on_sale_date || activity.on_sale_date)
      ) {
        return res.status(400).json({
          error: 'The start time must be after the on-sale date.',
        })
      }

      if (
        end_time &&
        new Date(end_time) <= new Date(start_time || activity.start_time)
      ) {
        return res.status(400).json({
          error: 'The end time must be after the start time.',
        })
      }

      // Prepare the update object
      const updateFields: { [key: string]: any } = {}
      if (title !== undefined) updateFields.title = title
      if (content !== undefined) updateFields.content = content
      if (on_sale_date !== undefined) updateFields.on_sale_date = on_sale_date
      if (start_time !== undefined) updateFields.start_time = start_time
      if (end_time !== undefined) updateFields.end_time = end_time
      // Handle image uploads
      const files = req.files as {
        [fieldname: string]: Express.Multer.File[]
      }
      if (files?.cover_img?.[0]) {
        updateFields.cover_img = files.cover_img[0].buffer // Binary data for cover_img
      }
      if (files?.price_level_img?.[0]) {
        updateFields.price_level_img = files.price_level_img[0].buffer // Binary data for price_level_img
      }

      // Update the activity in the database
      const updatedActivity = await updateActivity({
        activity_id, // Pass the activity ID
        ...updateFields, // Spread the fields to update
      })
      if ('error' in updatedActivity) {
        return res.status(400).json({ error: updatedActivity.error })
      }

      return res.status(200).json({
        message: 'Activity updated successfully',
        activity: updatedActivity,
      })
    } catch (error) {
      console.error('Error in PATCH /:activity_id:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

// delete(archive) an activity
router.patch(
  '/:activity_id/archive',
  jwtProtect,
  hostProtect,
  async (req, res) => {
    try {
      const { activity_id } = req.params

      // Fetch the activity details
      const activity = await getActivityById(activity_id)
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found.' })
      }

      // Ensure the requester is the creator
      const { decoded } = req.body // Extract the authenticated user from the request
      if (activity.creator_id !== decoded._id) {
        return res
          .status(403)
          .json({ error: 'Only the creator can archive the activity.' })
      }

      // Check if the activity is already archived
      if (activity.is_archived) {
        return res.status(400).json({ error: 'Activity is already archived.' })
      }

      // Update the activity's `is_archived` field to `true`
      const updatedActivity = await updateActivity({
        activity_id,
        is_archived: true,
      })

      if ('error' in updatedActivity) {
        return res.status(400).json({ error: updatedActivity.error })
      }

      return res.status(200).json({
        message: 'Activity archived successfully.',
        activity: updatedActivity,
      })
    } catch (error) {
      console.error('Error in PATCH /:activity_id/archive:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)
export default router
