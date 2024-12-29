import { query } from '../database'

export async function deleteExcessTickets(
  region_id: string,
  max_capacity: number
) {
  const qstring = `
    DELETE FROM tickets
    WHERE region_id = $1 AND seat_number > $2;
  `

  try {
    const result = await query(qstring, [region_id, max_capacity])
    return { deletedCount: result.rowCount } // Return the number of deleted rows
  } catch (error) {
    console.error('Error deleting excess tickets:', error)
    return { error: 'Failed to delete excess tickets.' }
  }
}
