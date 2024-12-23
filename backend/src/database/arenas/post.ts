import { query } from '../database';

export async function createArena(data: { title: string; address: string; capacity: number }) {
  const qstring = `
    INSERT INTO arenas (title, address, capacity)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [data.title, data.address, data.capacity];

  try {
    const result = await query(qstring, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating arena:', error);
    return { error: 'Failed to create arena' };
  }
}
