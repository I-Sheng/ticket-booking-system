import express from 'express'
import {
  listActivities,
  getActivityById,
  listActivitiesByCreatorId,
} from '../../database/activities/get'
import { listRegions } from '../../database/regions/get'
import { jwtProtect, hostProtect } from '../middleware'

const router = express.Router()

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
    console.error('Error in GET /activities/:activity_id:', error)
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

export default router
