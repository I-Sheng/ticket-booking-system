// Import necessary modules
import express from "express";
import Redis from "ioredis";
import Redlock from "redlock";

const app = express();
app.use(express.json());

const redis = new Redis();
const redlock = new Redlock([redis], {
  retryCount: 5,
  retryDelay: 200, // in ms
});

const TICKET_KEY_PREFIX = "ticket:";
const getRedisKey = (ticket_id: string) => `${TICKET_KEY_PREFIX}${ticket_id}`;

// Reserve Ticket API
app.post("/reserveTicket", async (req, res) => {
  const { ticket_id, user_id } = req.body;

  if (!ticket_id || !user_id) {
    return res
      .status(400)
      .json({ error: "ticket_id and user_id are required" });
  }

  const key = getRedisKey(ticket_id);

  try {
    // Acquire a lock
    const lock = await redlock.acquire([`lock:${key}`], 10000); // Lock for 10 seconds

    try {
      // Fetch the ticket data from Redis
      const ticketData = await redis.hgetall(key);

      if (!ticketData || ticketData.status !== "empty") {
        return res.status(400).json({ error: "Ticket is not available" });
      }

      // Update the ticket status and associate it with the user
      await redis.hmset(key, {
        ...ticketData,
        status: "reserved",
        user_id,
        reserver_time: new Date().toISOString(),
      });

      res.status(200).json({ message: "Ticket reserved successfully" });
    } finally {
      // Release the lock
      await lock.release();
    }
  } catch (error: any) {
    if (error.name === "LockError") {
      return res
        .status(423)
        .json({ error: "Could not acquire lock, please try again" });
    }
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
