import Redis from "ioredis";
import express from "express";
import { updateTicket } from "../database/tickets/update";
import "dotenv/config";
import { v4 as uuidv4 } from "uuid";

const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD as string;
const router = express.Router();

// Define the interface for the ticket object
export type Ticket = {
  ticket_id: string; // Changed to UUID format
  user_id: string | null;
  status: string;
  activity_id: string;
  region_id: string;
  seat_number: string;
  reserver_time: Date;
};

// Initialize Redis client
const redis = new Redis();

// Define the Redis key namespace for tickets
const TICKET_KEY_PREFIX = "ticket:";

// Helper functions
const getRedisKey = (ticket_id: string) => `${TICKET_KEY_PREFIX}${ticket_id}`;
const getRegionStatusKey = (region_id: string, status: string) =>
  `region:${region_id}:status:${status}`;

// API endpoints
router.post("/tickets", async (req, res) => {
  const ticket: Ticket = {
    ...req.body,
    ticket_id: uuidv4(), // Generate a UUID for ticket_id
  };
  const key = getRedisKey(ticket.ticket_id);
  const regionStatusKey = getRegionStatusKey(ticket.region_id, ticket.status);

  try {
    await redis.hset(key, {
      ticket_id: ticket.ticket_id,
      user_id: ticket.user_id || "",
      status: ticket.status,
      activity_id: ticket.activity_id,
      region_id: ticket.region_id,
      seat_number: ticket.seat_number,
      reserver_time: ticket.reserver_time,
    });

    await redis.sadd(regionStatusKey, ticket.ticket_id);
    res
      .status(201)
      .send({
        message: "Ticket created successfully.",
        ticket_id: ticket.ticket_id,
      });
  } catch (error) {
    res.status(500).send({ error: "Failed to create ticket." });
  }
});

router.get("/tickets/:id", async (req, res) => {
  const ticket_id = req.params.id;
  const key = getRedisKey(ticket_id);

  try {
    const data = await redis.hgetall(key);

    if (Object.keys(data).length === 0) {
      res.status(404).send({ error: "Ticket not found." });
      return;
    }

    const ticket: Ticket = {
      ticket_id: data.ticket_id,
      user_id: data.user_id || null,
      status: data.status,
      activity_id: data.activity_id,
      region_id: data.region_id,
      seat_number: data.seat_number,
      reserver_time: new Date(data.reserver_time),
    };

    res.status(200).send(ticket);
  } catch (error) {
    res.status(500).send({ error: "Failed to read ticket." });
  }
});

router.put("/tickets/:id", async (req, res) => {
  const ticket_id = req.params.id;
  const updates: Partial<Ticket> = req.body;
  const key = getRedisKey(ticket_id);

  try {
    const existingTicket = await redis.hgetall(key);

    if (Object.keys(existingTicket).length === 0) {
      res.status(404).send({ error: "Ticket not found." });
      return;
    }

    const updatedTicket = {
      ...existingTicket,
      ...updates,
    };

    await redis.hset(key, updatedTicket);
    res.status(200).send({ message: "Ticket updated successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to update ticket." });
  }
});

router.delete("/tickets/:id", async (req, res) => {
  const ticket_id = req.params.id;
  const key = getRedisKey(ticket_id);

  try {
    const ticket = await redis.hgetall(key);

    if (Object.keys(ticket).length === 0) {
      res.status(404).send({ error: "Ticket not found." });
      return;
    }

    const regionStatusKey = getRegionStatusKey(ticket.region_id, ticket.status);
    await redis.del(key);
    await redis.srem(regionStatusKey, ticket_id);

    res.status(200).send({ message: "Ticket deleted successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete ticket." });
  }
});

router.get("/regions/:id/tickets", async (req, res) => {
  const region_id = req.params.id;
  const regionStatusKey = getRegionStatusKey(region_id, "empty");

  try {
    const tickets = await redis.smembers(regionStatusKey);
    res.status(200).send(tickets);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch tickets by region." });
  }
});

router.post("/migrate", async (req, res) => {
  try {
    const keys = await redis.keys(`${TICKET_KEY_PREFIX}*`);

    for (const key of keys) {
      const ticket = await redis.hgetall(key);

      if (!ticket.ticket_id) continue;

      const dataToUpdate: {
        ticket_id: string;
        is_paid?: boolean;
        seat_number?: number;
      } = {
        ticket_id: ticket.ticket_id,
        seat_number: Number(ticket.seat_number),
      };

      if (ticket.status === "paid") {
        dataToUpdate.is_paid = true;
      }

      await updateTicket(dataToUpdate);
    }

    res.status(200).send({ message: "Migration completed successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to migrate tickets." });
  }
});

export default router;
