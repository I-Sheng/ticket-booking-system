import { query } from '../database'
import { createTicket } from '../tickets/post' // Helper function to create tickets
import { deleteExcessTickets } from '../tickets/delete' // Helper function to delete tickets

export async function updateRegion(data: {
  region_id: string
  region_name?: string
  region_price?: number
  region_capacity?: number
}) {
  const fields = []
  const values = []
  let index = 1

  // Build dynamic query for regions table
  if (data.region_name) {
    fields.push(`region_name = $${index++}`)
    values.push(data.region_name)
  }
  if (data.region_price !== undefined) {
    fields.push(`region_price = $${index++}`)
    values.push(data.region_price)
  }
  if (data.region_capacity !== undefined) {
    fields.push(`region_capacity = $${index++}`)
    values.push(data.region_capacity)
  }

  if (fields.length === 0) {
    return { error: 'No fields to update' }
  }

  const qstring = `
    UPDATE regions
    SET ${fields.join(', ')}
    WHERE _id = $${index}
    RETURNING *;
  `
  values.push(data.region_id)

  try {
    // Start transaction
    await query('BEGIN', [])

    // Update region
    const result = await query(qstring, values)
    if (result.rowCount === 0) {
      await query('ROLLBACK', [])
      return { error: 'Region not found' }
    }

    const updatedRegion = result.rows[0]

    // Only handle capacity changes for tickets
    if (data.region_capacity !== undefined) {
      const capacityDifference =
        data.region_capacity - updatedRegion.region_capacity

      if (capacityDifference > 0) {
        // Add new tickets
        for (let i = 1; i <= capacityDifference; i++) {
          const ticket = await createTicket({
            user_id: null,
            activity_id: updatedRegion.activity_id,
            region_id: data.region_id,
            seat_number: updatedRegion.region_capacity + i,
            is_paid: false,
          })
          if ('error' in ticket) {
            await query('ROLLBACK', [])
            return { error: 'Failed to create additional tickets.' }
          }
        }
      } else if (capacityDifference < 0) {
        // Remove excess tickets
        const deleteResult = await deleteExcessTickets(
          data.region_id,
          data.region_capacity
        )
        if ('error' in deleteResult) {
          await query('ROLLBACK', [])
          return { error: deleteResult.error }
        }
      }
    }

    // Commit transaction
    await query('COMMIT', [])
    return updatedRegion
  } catch (error) {
    console.error('Error updating region:', error)
    await query('ROLLBACK', [])
    return { error: 'Failed to update region' }
  }
}
