import { query } from '../database'

export async function listRegions(activity_id: string) {
  const qstring = `
    SELECT * FROM regions WHERE activity_id = $1;
  `

  try {
    const result = await query(qstring, [activity_id])

    if (result.rowCount === 0) {
      return { error: 'No regions found for the given activity' }
    }
    return result.rows
  } catch (error) {
    console.error('Error listing regions:', error)
    return { error: 'Failed to fetch regions' }
  }
}

export async function getRegionById(region_id: string) {
  const qstring = `
    SELECT *
    FROM regions
    WHERE _id = $1;
  `

  try {
    const result = await query(qstring, [region_id])
    if (result.rowCount === 0) {
      return { error: 'Region not found' }
    }
    return result.rows[0] // Return the region details
  } catch (error) {
    console.error('Error fetching region by ID:', error)
    return { error: 'Failed to fetch region' }
  }
}
