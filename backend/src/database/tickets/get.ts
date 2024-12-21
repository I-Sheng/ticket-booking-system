import { query } from '../database';

export async function listTickets(user_id: string) {
  const qstring = `
    SELECT * FROM tickets WHERE user_id = $1;
  `;
  try {
    const result = await query(qstring, [user_id]);
    if (result.rowCount === 0) {
      return { error: 'No tickets found for this user' };
    }
    return result.rows;
  } catch (error) {
    console.error('Error listing tickets:', error);
    return { error: 'Failed to fetch tickets' };
  }
}

export async function listTicketsByActivity(activity_id: string) {
  const qstring = `
    SELECT * FROM tickets WHERE activity_id = $1;
  `;
  try {
    const result = await query(qstring, [activity_id]);
    if (result.rowCount === 0) {
      return { error: 'No tickets found for this activity' };
    }
    return result.rows;
  } catch (error) {
    console.error('Error listing tickets by activity:', error);
    return { error: 'Failed to fetch tickets' };
  }
}
