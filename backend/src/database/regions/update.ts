import { query } from '../database';

export async function updateRegion(data: {
  region_id: string;
  region_name?: string;
  region_price?: number;
  region_capacity?: number;
}) {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.region_name) {
    fields.push(`region_name = $${index++}`);
    values.push(data.region_name);
  }
  if (data.region_price !== undefined) {
    fields.push(`region_price = $${index++}`);
    values.push(data.region_price);
  }
  if (data.region_capacity !== undefined) {
    fields.push(`region_capacity = $${index++}`);
    values.push(data.region_capacity);
  }

  if (fields.length === 0) {
    return { error: 'No fields to update' };
  }

  const qstring = `
    UPDATE regions
    SET ${fields.join(', ')}
    WHERE _id = $${index}
    RETURNING *;
  `;
  values.push(data.region_id);

  try {
    const result = await query(qstring, values);
    if (result.rowCount === 0) {
      return { error: 'Region not found' };
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error updating region:', error);
    return { error: 'Failed to update region' };
  }
}
