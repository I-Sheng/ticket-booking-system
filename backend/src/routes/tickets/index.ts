import Redis from "ioredis";
import Redlock from "redlock";
import express from "express";
import { jwtProtect } from "../middleware";
import { updateRedisTicket, Ticket } from "../../redis/index";
import "dotenv/config";

const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD as string;

const redis = new Redis();
const redlock = new Redlock([redis], {
  retryCount: 10,
  retryDelay: 200, // Time in ms
});

const router = express.Router();
const TICKET_KEY_PREFIX = "ticket:";

router.post("/reserveTicket", jwtProtect, async (req, res) => {
  console.log("enter reserver");
  const { ticket_id } = req.body;
  const user_id: string = req.body.decoded._id;
  console.log("ticket_id", ticket_id);
  console.log("user_id", user_id);

  if (!ticket_id || !user_id) {
    return res.status(400).json({ error: "Missing ticket_id or user_id" });
  }

  const ticketKey = `${TICKET_KEY_PREFIX}${ticket_id}`;

  try {
    await redlock.using([ticketKey], 50000, async () => {
      console.log(ticketKey);
      const ticket = await redis.hgetall(ticketKey);
      console.log("ticket", ticket);

      if (ticket.status !== "empty") {
        throw new Error("Ticket is not available for reservation");
      }

      console.log("after checking empty");
      await updateRedisTicket(ticket_id, {
        status: "reserved",
        user_id,
        reserver_time: new Date().toISOString(),
      });

      res.json({ message: "Ticket reserved successfully" });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/buyTicket", async (req, res) => {
  const { ticket_id } = req.body;
  const user_id: string = req.body.decoded._id;

  if (!ticket_id || !user_id) {
    return res.status(400).json({ error: "Missing ticket_id or user_id" });
  }

  const ticketKey = `${TICKET_KEY_PREFIX}${ticket_id}`;

  try {
    await redlock.using([ticketKey], 5000, async () => {
      const ticket = await redis.hgetall(ticketKey);

      if (ticket.status !== "reserved" || ticket.user_id !== user_id) {
        throw new Error("Ticket is not available for purchase");
      }

      await updateRedisTicket(ticket_id, {
        status: "sold",
      });

      res.json({ message: "Ticket purchased successfully" });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/refundTicket", async (req, res) => {
  const { ticket_id } = req.body;
  const user_id: string = req.body.decoded._id;

  if (!ticket_id || !user_id) {
    return res.status(400).json({ error: "Missing ticket_id or user_id" });
  }

  const ticketKey = `${TICKET_KEY_PREFIX}${ticket_id}`;

  try {
    await redlock.using([ticketKey], 5000, async () => {
      const ticket = await redis.hgetall(ticketKey);

      if (ticket.status !== "sold" || ticket.user_id !== user_id) {
        throw new Error("Ticket is not eligible for a refund");
      }

      await updateRedisTicket(ticket_id, {
        status: "empty",
        user_id: null,
        reserver_time: "null",
      });

      res.json({ message: "Ticket refunded successfully" });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
