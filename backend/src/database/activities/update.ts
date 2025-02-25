import { query } from '../database'

export async function updateActivity(data: {
  activity_id: string
  on_sale_date?: string
  start_time?: string
  end_time?: string
  title?: string
  content?: string
  cover_img?: Buffer | null // Updated type to handle binary data
  price_level_img?: Buffer | null // Updated type to handle binary data
  arena_id?: string
  is_archived?: boolean
}) {
  const fields = []
  const values = []
  let index = 1

  if (data.on_sale_date) {
    fields.push(`on_sale_date = $${index++}`)
    values.push(data.on_sale_date)
  }
  if (data.start_time) {
    fields.push(`start_time = $${index++}`)
    values.push(data.start_time)
  }
  if (data.end_time) {
    fields.push(`end_time = $${index++}`)
    values.push(data.end_time)
  }
  if (data.title) {
    fields.push(`title = $${index++}`)
    values.push(data.title)
  }
  if (data.content) {
    fields.push(`content = $${index++}`)
    values.push(data.content)
  }
  if (data.cover_img !== undefined) {
    fields.push(`cover_img = $${index++}`)
    values.push(data.cover_img) // Handles null for deletion or Buffer for update
  }
  if (data.price_level_img !== undefined) {
    fields.push(`price_level_img = $${index++}`)
    values.push(data.price_level_img) // Handles null for deletion or Buffer for update
  }
  if (data.arena_id) {
    fields.push(`arena_id = $${index++}`)
    values.push(data.arena_id)
  }
  if (data.is_archived) {
    fields.push(`is_archived = $${index++}`)
    values.push(data.is_archived)
  }

  if (fields.length === 0) {
    return { error: 'No fields to update' }
  }

  const qstring = `
    UPDATE activities
    SET ${fields.join(', ')}
    WHERE _id = $${index}
    RETURNING *;
  `
  values.push(data.activity_id)

  try {
    const result = await query(qstring, values)
    if (result.rowCount === 0) {
      return { error: 'Activity not found' }
    }
    return result.rows[0]
  } catch (error) {
    console.error('Error updating activity:', error)
    return { error: 'Failed to update activity' }
  }
}
