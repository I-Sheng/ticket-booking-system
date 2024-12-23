import { query } from '../database';

export async function updateArena(data: {
  arena_id: string;
  title?: string;
  address?: string;
  capacity?: number;
}) {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.title) {
    fields.push(`title = $${index++}`);
    values.push(data.title);
  }
  if (data.address) {
    fields.push(`address = $${index++}`);
    values.push(data.address);
  }
  if (data.capacity !== undefined) {
    fields.push(`capacity = $${index++}`);
    values.push(data.capacity);
  }

  if (fields.length === 0) {
    return { error: 'No fields to update' };
  }

  const qstring = `
    UPDATE arenas
    SET ${fields.join(', ')}
    WHERE _id = $${index}
    RETURNING *;
  `;
  values.push(data.arena_id);

  try {
    const result = await query(qstring, values);
    if (result.rowCount === 0) {
      return { error: 'Arena not found' };
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error updating arena:', error);
    return { error: 'Failed to update arena' };
  }
}
