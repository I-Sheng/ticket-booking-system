// Import necessary modules
import Redis from "ioredis";
import { updateTicket } from "./database/tickets/update";
import { updateRedisTicket } from "./redis/index";

const redis = new Redis();
const TICKET_KEY_PREFIX = "ticket:";

// Function to refund tickets after an hour
async function refundExpiredTickets() {
  try {
    // Get all ticket keys from Redis
    const keys = await redis.keys(`${TICKET_KEY_PREFIX}*`);

    for (const key of keys) {
      const ticket = await redis.hgetall(key);
      if (ticket.user_id === null || ticket.user_id === undefined) {
        continue;
      }

      if (ticket.status === "reserved") {
        const reserveTime = new Date(ticket.reserver_time);
        const currentTime = new Date();
        const timeDiff =
          (currentTime.getTime() - reserveTime.getTime()) / 1000 / 60; // Difference in minutes

        if (timeDiff > 60) {
          // Refund the ticket
          await updateRedisTicket(ticket.ticket_id, {
            status: "empty",
            user_id: null,
          });

          await updateTicket({
            ticket_id: ticket.ticket_id,
            user_id: null,
            is_paid: false,
          });

          console.log(`Refunded ticket: ${ticket.ticket_id}`);
        }
      }
    }
  } catch (error) {
    console.error("Error while refunding expired tickets:", error);
  }
}

// Schedule the function to run every minute
setInterval(refundExpiredTickets, 60000);

console.log("Ticket refund service running...");
