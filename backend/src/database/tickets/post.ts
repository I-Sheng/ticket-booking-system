import { query } from '../database';

export async function createTicket(data: {
  user_id: string | null;
  activity_id: string;
  region_id: string;
  seat_number: number;
  is_paid?: boolean;
}) {
  const qstring = `
    INSERT INTO tickets (user_id, activity_id, region_id, seat_number, is_paid)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [data.user_id, data.activity_id, data.region_id, data.seat_number, data.is_paid || false];

  try {
    const result = await query(qstring, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { error: 'Failed to create ticket' };
  }
}
