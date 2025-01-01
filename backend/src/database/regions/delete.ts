import { query } from '../database'

export async function deleteRegion(region_id: string) {
  const qstring = `
    DELETE FROM regions
    WHERE _id = $1
    RETURNING *;
  `

  try {
    const result = await query(qstring, [region_id])
    if (result.rowCount === 0) {
      return { error: 'Region not found' }
    }
    return { message: 'Region deleted successfully', region: result.rows[0] } // Include deleted region details
  } catch (error) {
    console.error('Error deleting region:', error)
    return { error: 'Failed to delete region' }
  }
}

export async function deleteRegionAndTickets(region_id: string) {
  try {
    // Start transaction
    await query('BEGIN', [])

    // Delete associated tickets
    const deleteTicketsQuery = `
      DELETE FROM tickets
      WHERE region_id = $1;
    `
    await query(deleteTicketsQuery, [region_id])

    // Delete the region
    const regionResult = await deleteRegion(region_id)
    if ('error' in regionResult) {
      await query('ROLLBACK', [])
      return regionResult
    }

    // Commit transaction
    await query('COMMIT', [])
    return {
      message: 'Region and associated tickets deleted successfully',
      region: regionResult.region,
    }
  } catch (error) {
    console.error('Error deleting region and tickets:', error)
    await query('ROLLBACK', [])
    return { error: 'Failed to delete region and tickets' }
  }
}
