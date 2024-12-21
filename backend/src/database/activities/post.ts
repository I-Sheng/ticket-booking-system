import { query } from '../database';

export async function createActivity(data: {
  on_sale_date: string;
  start_time: string;
  end_time: string;
  title: string;
  content?: string;
  cover_img?: string;
  price_level_img?: string;
  arena_id: string;
}) {
  const qstring = `
    INSERT INTO activities (on_sale_date, start_time, end_time, title, content, cover_img, price_level_img, arena_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [
    data.on_sale_date,
    data.start_time,
    data.end_time,
    data.title,
    data.content || null,
    data.cover_img || null,
    data.price_level_img || null,
    data.arena_id,
  ];

  try {
    const result = await query(qstring, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating activity:', error);
    return { error: 'Failed to create activity' };
  }
}
