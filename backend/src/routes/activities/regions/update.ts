import express from 'express'
import { updateRegion } from '../../../database/regions/update'
import { getActivityById } from '../../../database/activities/get'
import { getRegionById } from '../../../database/regions/get'
import { jwtProtect, hostProtect } from '../../middleware'

const router = express.Router()

//update specific region of an activity
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
    console.error('Error in PATCH /activities/regions/:region_id:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})
export default router
