import express from 'express'
import { getRegionById } from '../../../database/regions/get'

const router = express.Router()

router.get('/:region_id', async (req, res) => {
  try {
    const { region_id } = req.params

    // Fetch region details using the helper function
    const region = await getRegionById(region_id)

    // Handle errors if the region is not found
    if ('error' in region) {
      return res.status(404).json({ error: region.error })
    }

    // Return the region details
    return res.status(200).json({
      message: 'Region retrieved successfully',
      region: region,
    })
  } catch (error) {
    console.error('Error in GET /:region_id:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router
