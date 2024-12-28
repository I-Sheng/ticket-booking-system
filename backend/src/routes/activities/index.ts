import express from 'express'
import multer from 'multer'
import { listActivities, getActivityById } from '../../database/activities/get'
import { createActivity } from '../../database/activities/post'
import { createActivityWithRegions } from '../../database/activities/post'
import { createRegion } from '../../database/regions/post'
import { updateActivity } from '../../database/activities/update'
import { deleteActivity } from '../../database/activities/delete'
import { listRegions, getRegionById } from '../../database/regions/get'
import { updateRegion } from '../../database/regions/update'
import { deleteRegionAndTickets } from '../../database/regions/delete'
import { jwtProtect, hostProtect } from '../middleware'

const router = express.Router()
const upload = multer()

// Create a new activity
import { createTicket } from '../../database/tickets/post' // 假設 createTicket 函數位於此處

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

// add a new region of the activity
router.post(
  '/:activity_id/regions',
  jwtProtect,
  hostProtect,
  async (req, res) => {
    try {
      const { activity_id } = req.params // Extract activity ID from route
      const { region_name, region_price, region_capacity } = req.body // Extract region details from the request body
      const { decoded } = req.body // Extract user info from JWT

      // Validate inputs
      if (!region_name || !region_price || !region_capacity) {
        return res.status(400).json({
          error: 'region_name, region_price, and region_capacity are required.',
        })
      }

      if (region_price <= 0 || region_capacity <= 0) {
        return res.status(400).json({
          error: 'region_price and region_capacity must be positive values.',
        })
      }
      // Fetch activity details to validate time restrictions
      const activity = await getActivityById(activity_id)
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found' })
      }

      // Check if the user is the creator of the activity
      if (activity.creator_id !== decoded._id) {
        return res
          .status(403)
          .json({ error: 'Only the creator can add regions.' })
      }

      const now = new Date()
      const startTime = new Date(activity.start_time)

      // Check if the current time is before the activity's start time
      if (now >= startTime) {
        return res.status(400).json({
          error: 'Cannot add regions after the activity has started.',
        })
      }

      // Add the region to the activity
      const newRegion = await createRegion({
        activity_id,
        region_name,
        region_price,
        region_capacity,
      })

      if ('error' in newRegion) {
        return res.status(400).json({ error: newRegion.error })
      }

      // Automatically create tickets for the new region
      const tickets = []
      for (let seatNumber = 1; seatNumber <= region_capacity; seatNumber++) {
        const ticket = await createTicket({
          user_id: null, // Ticket not assigned to any user initially
          activity_id,
          region_id: newRegion._id,
          seat_number: seatNumber,
          is_paid: false, // Default to unpaid
        })

        if ('error' in ticket) {
          throw new Error(`Failed to create ticket: ${ticket.error}`)
        }

        tickets.push(ticket)
      }

      return res.status(201).json({
        message: 'Region and tickets added successfully',
        region: newRegion,
        // tickets: tickets,
      })
    } catch (error) {
      console.error('Error in POST /:activity_id/regions:', error)
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
router.patch(
  '/:activity_id/:region_id',
  jwtProtect,
  hostProtect,
  async (req, res) => {
    try {
      const { activity_id, region_id } = req.params
      const { region_name, region_price, region_capacity } = req.body

      // Validate inputs
      if (region_price !== undefined && region_price <= 0) {
        return res
          .status(400)
          .json({ error: 'region_price must be a positive value.' })
      }
      if (region_capacity !== undefined && region_capacity <= 0) {
        return res
          .status(400)
          .json({ error: 'region_capacity must be a positive value.' })
      }
      if (region_name !== undefined && typeof region_name !== 'string') {
        return res
          .status(400)
          .json({ error: 'region_name must be a valid string.' })
      }

      // Fetch activity details
      const activity = await getActivityById(activity_id)
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found.' })
      }

      const now = new Date()
      const onSaleDate = new Date(activity.on_sale_date)

      // Ensure the requester is the creator of the activity
      const { decoded } = req.body
      console.log(decoded._id)
      if (activity.creator_id != decoded._id) {
        return res
          .status(403)
          .json({ error: 'Only the creator can update the region.' })
      }

      // Ensure the update is done before the on-sale date
      if (now >= onSaleDate) {
        return res.status(400).json({
          error: 'Updates to regions are only allowed before the on-sale date.',
        })
      }

      // Prepare the update object
      const updateFields: { [key: string]: any } = {}
      if (region_name !== undefined) updateFields.region_name = region_name
      if (region_price !== undefined) updateFields.region_price = region_price
      if (region_capacity !== undefined)
        updateFields.region_capacity = region_capacity

      // Update the region in the database using updateRegion()
      const updatedRegion = await updateRegion({ region_id, ...updateFields })
      if ('error' in updatedRegion) {
        return res.status(400).json({ error: updatedRegion.error })
      }

      return res.status(200).json({
        message: 'Region and tickets updated successfully',
        region: updatedRegion,
      })
    } catch (error) {
      console.error('Error in PATCH /:activity_id/:region_id:', error)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
)

router.delete(
  '/:activity_id/:region_id',
  jwtProtect,
  hostProtect,
  async (req, res) => {
    try {
      const { activity_id, region_id } = req.params

      // Fetch the activity details
      const activity = await getActivityById(activity_id)
      if (!activity) {
        return res.status(404).json({ error: 'Activity not found.' })
      }

      const now = new Date()
      const onSaleDate = new Date(activity.on_sale_date)

      // Check if the current user is the creator of the activity
      const { decoded } = req.body // Extract authenticated user info from request
      if (activity.creator_id !== decoded._id) {
        return res
          .status(403)
          .json({ error: 'Only the creator can delete the region.' })
      }

      // Ensure the operation is done before the on-sale date
      if (now >= onSaleDate) {
        return res.status(400).json({
          error:
            'Regions can only be deleted before the activity goes on sale.',
        })
      }

      // Call the combined function to delete the region and tickets
      const deleteResult = await deleteRegionAndTickets(region_id)
      if ('error' in deleteResult) {
        return res.status(400).json({ error: deleteResult.error })
      }

      return res.status(200).json({
        message: 'Region and associated tickets deleted successfully',
        region: deleteResult.region, // Return the deleted region details
      })
    } catch (error) {
      console.error('Error in DELETE /:activity_id/:region_id:', error)
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
