import express from 'express';
import { createRegion } from '../../../database/regions/post';
import { createTicket } from '../../../database/tickets/post';
import { getActivityById } from '../../../database/activities/get';
import { jwtProtect, hostProtect } from '../../middleware';

const router = express.Router();

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
    console.error('Error in POST /activities/region/:activity_id', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router;
