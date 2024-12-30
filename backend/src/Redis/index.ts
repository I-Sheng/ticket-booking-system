import Redis from "ioredis";
import { Pool } from "pg";

// Define the interface for the ticket object
export type Ticket = {
  ticket_id: string;
  user_id: string | null;
  status: string;
  activity_id: string;
  region_id: string;
  seat_number: string;
};

// Initialize Redis client
const redis = new Redis();

// Initialize PostgreSQL client
const pool = new Pool({
  user: "your_user",
  host: "your_host",
  database: "your_database",
  password: "your_password",
  port: 5432, // default PostgreSQL port
});

// Define the Redis key namespace for tickets
const TICKET_KEY_PREFIX = "ticket:";

// Helper function to generate the Redis key for a ticket
const getRedisKey = (ticket_id: string) => `${TICKET_KEY_PREFIX}${ticket_id}`;

// Helper function to generate the Redis index key for region and status
const getRegionStatusKey = (region_id: string, status: string) =>
  `region:${region_id}:status:${status}`;

// Create a ticket with indexing
export const createTicket = async (ticket: Ticket): Promise<void> => {
  const key = getRedisKey(ticket.ticket_id);
  const regionStatusKey = getRegionStatusKey(ticket.region_id, ticket.status);

  await redis.hset(key, {
    ticket_id: ticket.ticket_id,
    user_id: ticket.user_id || "",
    status: ticket.status,
    activity_id: ticket.activity_id,
    region_id: ticket.region_id,
    seat_number: ticket.seat_number,
  });

  // Add ticket_id to region and status index
  await redis.sadd(regionStatusKey, ticket.ticket_id);
};

// Read a ticket
export const readTicket = async (ticket_id: string): Promise<Ticket | null> => {
  const key = getRedisKey(ticket_id);
  const data = await redis.hgetall(key);

  if (Object.keys(data).length === 0) {
    return null; // Ticket not found
  }

  return {
    ticket_id: data.ticket_id,
    user_id: data.user_id || null,
    status: data.status,
    activity_id: data.activity_id,
    region_id: data.region_id,
    seat_number: data.seat_number,
  };
};

// Update a ticket with re-indexing
export const updateTicket = async (
  ticket_id: string,
  updates: Partial<Ticket>
): Promise<void> => {
  const key = getRedisKey(ticket_id);
  const existingTicket = await readTicket(ticket_id);

  if (!existingTicket) {
    throw new Error(`Ticket with id ${ticket_id} not found`);
  }

  const updatedTicket = {
    ...existingTicket,
    ...updates,
    user_id: updates.user_id || existingTicket.user_id || "",
  };

  const oldRegionStatusKey = getRegionStatusKey(
    existingTicket.region_id,
    existingTicket.status
  );
  const newRegionStatusKey = getRegionStatusKey(
    updatedTicket.region_id,
    updatedTicket.status
  );

  await redis.hset(key, {
    ticket_id: updatedTicket.ticket_id,
    user_id: updatedTicket.user_id || "",
    status: updatedTicket.status,
    activity_id: updatedTicket.activity_id,
    region_id: updatedTicket.region_id,
    seat_number: updatedTicket.seat_number,
  });

  // Update indices if region or status has changed
  if (oldRegionStatusKey !== newRegionStatusKey) {
    await redis.srem(oldRegionStatusKey, ticket_id);
    await redis.sadd(newRegionStatusKey, ticket_id);
  }
};

// Delete a ticket with index cleanup
export const deleteTicket = async (ticket_id: string): Promise<void> => {
  const ticket = await readTicket(ticket_id);

  if (!ticket) {
    return; // No ticket to delete
  }

  const key = getRedisKey(ticket_id);
  const regionStatusKey = getRegionStatusKey(ticket.region_id, ticket.status);

  await redis.del(key);
  await redis.srem(regionStatusKey, ticket_id);
};

// Read tickets by region with status "empty"
export const readRegion = async (region_id: string): Promise<string[]> => {
  const regionStatusKey = getRegionStatusKey(region_id, "empty");
  return await redis.smembers(regionStatusKey);
};

// Migrate tickets from Redis to PostgreSQL
export const migrateTicketsToPostgres = async (): Promise<void> => {
  const keys = await redis.keys(`${TICKET_KEY_PREFIX}*`);

  for (const key of keys) {
    const ticket = await redis.hgetall(key);

    if (!ticket.ticket_id) continue;

    const query = `
      INSERT INTO ticket (ticket_id, user_id, status, activity_id, region_id, seat_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (ticket_id) DO UPDATE
      SET user_id = EXCLUDED.user_id,
          status = EXCLUDED.status,
          activity_id = EXCLUDED.activity_id,
          region_id = EXCLUDED.region_id,
          seat_number = EXCLUDED.seat_number;
    `;

    await pool.query(query, [
      ticket.ticket_id,
      ticket.user_id || null,
      ticket.status,
      ticket.activity_id,
      ticket.region_id,
      ticket.seat_number,
    ]);
  }

  console.log("Migration completed successfully.");
};

// Example usage (uncomment to test)
// (async () => {
//   await migrateTicketsToPostgres();
// })();
