import { query } from '../database'
import { createRegion } from '../regions/post'

export async function createActivityWithRegions(data: {
  on_sale_date: string
  start_time: string
  end_time: string
  title: string
  content: string
  cover_img: Buffer | null
  price_level_img: Buffer | null
  arena_id: string
  creator_id: string
  regions: {
    region_name: string
    region_price: number
    region_capacity: number
  }[]
}) {
  const activityQuery = `
    INSERT INTO activities (on_sale_date, start_time, end_time, title, content, cover_img, price_level_img, arena_id, creator_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `

  const activityValues = [
    data.on_sale_date,
    data.start_time,
    data.end_time,
    data.title,
    data.content,
    data.cover_img,
    data.price_level_img,
    data.arena_id,
    data.creator_id,
  ]

  try {
    // Start transaction
    await query('BEGIN', [])

    // Create activity
    const activityResult = await query(activityQuery, activityValues)
    const activity = activityResult.rows[0]

    if (!activity) {
      throw new Error('Failed to create activity')
    }

    // Create regions
    const regionResults = []
    for (const region of data.regions) {
      const regionResult = await createRegion({
        activity_id: activity._id,
        region_name: region.region_name,
        region_price: region.region_price,
        region_capacity: region.region_capacity,
      })
      if ('error' in regionResult) {
        throw new Error(regionResult.error)
      }
      regionResults.push(regionResult)
    }

    // Commit transaction
    await query('COMMIT', [])

    return { activity, regions: regionResults }
  } catch (error) {
    console.error('Error in createActivityWithRegions:', error)

    // Rollback transaction
    await query('ROLLBACK', [])
    return { error: 'Failed to create activity and regions' }
  }
}

// import { query } from '../database';
//
export async function createActivity(data: {
  on_sale_date: string
  start_time: string
  end_time: string
  title: string
  content?: string
  cover_img?: Buffer | null // Accept Buffer for binary data
  price_level_img?: Buffer | null // Accept Buffer for binary data
  arena_id: string
}) {
  const qstring = `
    INSERT INTO activities (on_sale_date, start_time, end_time, title, content, cover_img, price_level_img, arena_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `
  const values = [
    data.on_sale_date,
    data.start_time,
    data.end_time,
    data.title,
    data.content || null,
    data.cover_img || null, // Insert binary data
    data.price_level_img || null, // Insert binary data
    data.arena_id,
  ]

  try {
    const result = await query(qstring, values)
    return result.rows[0]
  } catch (error) {
    console.error('Error creating activity:', error)
    return { error: 'Failed to create activity' }
  }
}
