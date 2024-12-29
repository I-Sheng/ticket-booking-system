import express from 'express'
import { getActivityById } from '../../../database/activities/get'
import { createRegion } from '../../../database/regions/post'
import { getRegionById } from '../../../database/regions/get'
import { updateRegion } from '../../../database/regions/update'
import { deleteRegionAndTickets } from '../../../database/regions/delete'
import { jwtProtect, hostProtect } from '../../middleware'

const router = express.Router()

// Create a new activity
import { createTicket } from '../../../database/tickets/post'

// add a new region of the activity
router.post('/:activity_id', jwtProtect, hostProtect, async (req, res) => {
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
})

router.patch('/:region_id', jwtProtect, hostProtect, async (req, res) => {
  try {
    const { region_id } = req.params
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
    const region = await getRegionById(region_id)
    const activity = await getActivityById(region.activity_id)
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
})

router.delete('/:region_id', jwtProtect, hostProtect, async (req, res) => {
  try {
    const { region_id } = req.params

    // Fetch the activity details
    const region = await getRegionById(region_id)
    const activity = await getActivityById(region.activity_id)
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
        error: 'Regions can only be deleted before the activity goes on sale.',
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
})

export default router