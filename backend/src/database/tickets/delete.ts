import { query } from '../database';

export async function deleteTicket(ticket_id: string) {
  const qstring = `
    DELETE FROM tickets WHERE _id = $1 RETURNING *;
  `;
  try {
    const result = await query(qstring, [ticket_id]);
    if (result.rowCount === 0) {
      return { error: 'Ticket not found' };
    }
    return { message: 'Ticket deleted successfully' };
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return { error: 'Failed to delete ticket' };
  }
}
