import { query } from "../database";

export async function listTickets(user_id: string) {
  const qstring = `
    SELECT * FROM tickets WHERE user_id = $1;
  `;
  try {
    const result = await query(qstring, [user_id]);
    if (result.rowCount === 0) {
      return { error: "No tickets found for this user" };
    }
    return result.rows;
  } catch (error) {
    console.error("Error listing tickets:", error);
    return { error: "Failed to fetch tickets" };
  }
}

export async function getTicketById(ticket_id: string, user_id: string) {
  const qstring = `
    SELECT * FROM tickets WHERE _id = $1 AND user_id = $2;
  `;
  try {
    const result = await query(qstring, [ticket_id, user_id]);
    if (result.rowCount === 0) {
      return null; // Return null if no ticket is found
    }
    return result.rows[0]; // Return single ticket
  } catch (error) {
    console.error('Error fetching ticket by ID:', error);
    return { error: 'Failed to fetch ticket' };
  }
}


export async function listTicketsByActivity(activity_id: string, is_paid?: string) {
  // Base query string
  let qstring = `SELECT * FROM tickets WHERE activity_id = $1`;
  const params: (string | boolean)[] = [activity_id];

  // Add filter for is_paid if provided
  if (is_paid !== undefined) {
    qstring += ` AND is_paid = $2`;
    params.push(is_paid === "true"); // Convert string to boolean
  }

  try {
    const result = await query(qstring, params);
    if (result.rowCount === 0) {
      return { error: "No tickets found for this activity" };
    }
    return result.rows;
  } catch (error) {
    console.error("Error listing tickets by activity:", error);
    return { error: "Failed to fetch tickets" };
  }
}

export async function listTicketsByRegion(
  region_id: string,
  is_paid?: boolean
) {
  // Base query string
  let qstring = `SELECT * FROM tickets WHERE region_id = $1`;
  const params: (string | boolean)[] = [region_id];

  // Add filter for is_paid if provided
  if (is_paid !== undefined) {
    qstring += ` AND is_paid = $2`;
    params.push(is_paid === true); // Convert string to boolean
  }

  try {
    const result = await query(qstring, params);
    return result.rows;
  } catch (error) {
    console.error("Error listing tickets by activity and region:", error);
    return { error: "Failed to fetch tickets" };
  }
}
