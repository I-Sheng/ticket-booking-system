import Redis from "ioredis";
import { updateTicket } from "../database/tickets/update";
import "dotenv/config";
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD as string;
// Define the interface for the ticket object
export type Ticket = {
  ticket_id: string;
  user_id: string | null;
  status: string;
  activity_id: string;
  region_id: string;
  seat_number: string;
  reserver_time: string;
};
// Initialize Redis client
const redis = new Redis();
// Define the Redis key namespace for tickets
const TICKET_KEY_PREFIX = "ticket:";
// Helper function to generate the Redis key for a ticket
export const getRedisKey = (ticket_id: string) =>
  `${TICKET_KEY_PREFIX}${ticket_id}`;
// Helper function to generate the Redis index key for region and status
const getRegionStatusKey = (region_id: string, status: string) =>
  `region:${region_id}:status:${status}`;
// Create a ticket with indexing
export const createRedisTicket = async (ticket: Ticket): Promise<void> => {
  const key = getRedisKey(ticket.ticket_id);
  const regionStatusKey = getRegionStatusKey(ticket.region_id, ticket.status);
  await redis.hset(key, {
    ticket_id: ticket.ticket_id,
    user_id: ticket.user_id || "",
    status: ticket.status,
    activity_id: ticket.activity_id,
    region_id: ticket.region_id,
    seat_number: ticket.seat_number,
    reserver_time: ticket.reserver_time,
  });
  // Add ticket_id to region and status index
  await redis.sadd(regionStatusKey, ticket.ticket_id);
};
// Read a ticket
export const readRedisTicket = async (
  ticket_id: string
): Promise<Ticket | null> => {
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
    reserver_time: data.reserver_time,
  };
};
// Update a ticket with re-indexing
export const updateRedisTicket = async (
  ticket_id: string,
  updates: Partial<Ticket>
): Promise<void> => {
  const key = getRedisKey(ticket_id);
  const existingTicket = await readRedisTicket(ticket_id);
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
export const deleteRedisTicket = async (ticket_id: string): Promise<void> => {
  const ticket = await readRedisTicket(ticket_id);
  if (!ticket) {
    return; // No ticket to delete
  }
  const key = getRedisKey(ticket_id);
  const regionStatusKey = getRegionStatusKey(ticket.region_id, ticket.status);
  await redis.del(key);
  await redis.srem(regionStatusKey, ticket_id);
};
// Read tickets by region with status "empty"
export const readRedisRegion = async (region_id: string): Promise<string[]> => {
  const regionStatusKey = getRegionStatusKey(region_id, "empty");
  return await redis.smembers(regionStatusKey);
};
// Migrate tickets from Redis to PostgreSQL
// export const migrateTicketsToPostgres = async (): Promise<void> => {
//   console.log("enter migrate");
//   const keys = await redis.keys(`${TICKET_KEY_PREFIX}*`);
//   for (const key of keys) {
//     const ticket = await redis.hgetall(key);
//     if (!ticket.ticket_id) continue;
//     const dataToUpdate: {
//       ticket_id: string;
//       is_paid?: boolean;
//       seat_number?: number;
//     } = {
//       ticket_id: ticket.ticket_id,
//       seat_number: Number(ticket.seat_number),
//     };
//     if (ticket.status === "paid") {
//       dataToUpdate.is_paid = true;
//     }
//     console.log(dataToUpdate);
//     const result = await updateTicket(dataToUpdate);
//     if (result.error) {
//       console.error(
//         `Failed to update ticket ${ticket.ticket_id}:`,
//         result.error
//       );
//     }
//   }
//   console.log("Migration completed successfully.");
// };
// Example usage (uncomment to test)
// (async () => {
//   await migrateTicketsToPostgres();
// })();
