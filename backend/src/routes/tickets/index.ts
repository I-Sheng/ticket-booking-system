import Redis from "ioredis";
import Redlock from "redlock";
import express from "express";
import { jwtProtect } from "../middleware";
import { listTicketsByRegion } from "../../database/tickets/get";
import { updateTicket } from "../../database/tickets/update";
import { updateRedisTicket, readRedisRegion } from "../../redis/index";
import "dotenv/config";

const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD as string;

const redis = new Redis();
const redlock = new Redlock([redis], {
  retryCount: 10,
  retryDelay: 200, // Time in ms
});

const router = express.Router();
const TICKET_KEY_PREFIX = "ticket:";

async function reserveTicketFromId(
  ticket_id: string,
  user_id: string,
  res: express.Response
) {
  if (!ticket_id || !user_id) {
    res.status(400).json({ error: "Missing ticket_id or user_id" });
    return false;
  }

  const ticketKey = `${TICKET_KEY_PREFIX}${ticket_id}`;
  const lockKey = `lock:${ticketKey}`;
  const lockTTL = 5000; // Lock expiration time in milliseconds

  try {
    // Acquire the lock
    const lock = await redlock.acquire([lockKey], lockTTL);

    try {
      // Check the ticket's status in Redis
      const ticket = await redis.hgetall(ticketKey);

      if (ticket.status !== "empty") {
        res
          .status(400)
          .json({ error: "Ticket is not available for reservation" });
        return false;
      }

      // Reserve the ticket
      await updateRedisTicket(ticket_id, {
        status: "reserved",
        user_id,
        reserver_time: new Date().toISOString(),
      });

      await updateTicket({
        ticket_id: ticket_id,
        user_id: user_id,
        is_paid: false,
        seat_number: Number(ticket.seat_number),
      });

      res.status(200).json({ message: "Ticket reserved successfully" });
      return res;
    } finally {
      // Release the lock
      await lock.release();
    }
  } catch (error: any) {
    if (error.name === "LockError") {
      res.status(423).json({ error: "Resource is already locked" });
    } else {
      res.status(500).json({ error: error.message });
    }
    return res;
  }
}

router.post("/reserveTicket", jwtProtect, async (req, res) => {
  const { region_id } = req.body;
  const user_id: string = req.body.decoded._id;

  try {
    let ticketIdList: any = await readRedisRegion(region_id);
    if (ticketIdList.length === 0) {
      // Step 2: If no tickets found in Redis, fetch from database
      console.log("No tickets found in Redis, querying database...");
      ticketIdList = await listTicketsByRegion(region_id, false);
    }

    for (const ticket_id of ticketIdList) {
      const success = await reserveTicketFromId(ticket_id, user_id, res);
      if (success) {
        res = res;
        return; // Stop after successfully reserving a ticket
      }
    }

    res.status(404).json({ error: "No tickets available for reservation" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/buyTicket", jwtProtect, async (req, res) => {
  const { ticket_id } = req.body;
  const user_id: string = req.body.decoded._id;

  if (!ticket_id || !user_id) {
    return res.status(400).json({ error: "Missing ticket_id or user_id" });
  }

  const ticketKey = `${TICKET_KEY_PREFIX}${ticket_id}`;

  try {
    const lock = await redlock.acquire([`lock:${ticketKey}`], 5000);

    try {
      const ticket = await redis.hgetall(ticketKey);

      if (ticket.status !== "reserved" || ticket.user_id !== user_id) {
        throw new Error("Ticket is not available for purchase");
      }

      const time: Date = new Date();
      await updateRedisTicket(ticket_id, {
        status: "paid",
        reserver_time: time.toString(),
      });

      await updateTicket({
        ticket_id: ticket_id,
        user_id: user_id,
        is_paid: true,
        seat_number: Number(ticket.seat_number),
        created_at: time,
      });

      res.status(200).json({ message: "Ticket purchased successfully" });
    } finally {
      await lock.release();
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/refundTicket", jwtProtect, async (req, res) => {
  const { ticket_id } = req.body;
  const user_id: string = req.body.decoded._id;

  if (!ticket_id || !user_id) {
    return res.status(400).json({ error: "Missing ticket_id or user_id" });
  }

  const ticketKey = `${TICKET_KEY_PREFIX}${ticket_id}`;

  try {
    const lock = await redlock.acquire([`lock:${ticketKey}`], 5000);

    try {
      const ticket = await redis.hgetall(ticketKey);

      if (ticket.status !== "paid" || ticket.user_id !== user_id) {
        throw new Error("Ticket is not eligible for a refund");
      }

      await updateRedisTicket(ticket_id, {
        status: "empty",
        user_id: null,
        reserver_time: "null",
      });

      await updateTicket({
        ticket_id: ticket_id,
        user_id: null,
        is_paid: false,
      });

      res.status(200).json({ message: "Ticket refunded successfully" });
    } finally {
      await lock.release();
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
