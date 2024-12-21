import { query } from '../database';

export async function createRegion(data: {
  activity_id: string;
  region_name: string;
  region_price: number;
  region_capacity: number;
}) {
  const qstring = `
    INSERT INTO regions (activity_id, region_name, region_price, region_capacity)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [data.activity_id, data.region_name, data.region_price, data.region_capacity];

  try {
    const result = await query(qstring, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating region:', error);
    return { error: 'Failed to create region' };
  }
}
