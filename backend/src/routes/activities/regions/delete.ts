import express from 'express'
import { deleteRegionAndTickets } from '../../../database/regions/delete'
import { getRegionById } from '../../../database/regions/get'
import { getActivityById } from '../../../database/activities/get'
import { jwtProtect, hostProtect } from '../../middleware'

const router = express.Router()

//delete specific region of an activity
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
    console.error('Error in DELETE /activities/regions/:region_id:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
