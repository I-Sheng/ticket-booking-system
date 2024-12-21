import { query } from '../database';

export async function updateTicket(data: {
  ticket_id: string;
  is_paid?: boolean;
  seat_number?: number;
}) {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.is_paid !== undefined) {
    fields.push(`is_paid = $${index++}`);
    values.push(data.is_paid);
  }
  if (data.seat_number !== undefined) {
    fields.push(`seat_number = $${index++}`);
    values.push(data.seat_number);
  }

  if (fields.length === 0) {
    return { error: 'No fields to update' };
  }

  const qstring = `
    UPDATE tickets
    SET ${fields.join(', ')}
    WHERE _id = $${index}
    RETURNING *;
  `;
  values.push(data.ticket_id);

  try {
    const result = await query(qstring, values);
    if (result.rowCount === 0) {
      return { error: 'Ticket not found' };
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error updating ticket:', error);
    return { error: 'Failed to update ticket' };
  }
}
