import { Redis } from "ioredis";
import Redlock from "redlock";
import { updateRedisTicket } from "../../redis/index"; // Adjust the path if necessary

// Initialize Redis client
const redis = new Redis();

// Initialize Redlock
const redlock = new Redlock([redis], {
  retryCount: 3, // Retry up to 3 times if lock acquisition fails
  retryDelay: 200, // Wait 200ms between retries
});

interface BookingResult {
  success: boolean;
  message: string;
}

async function bookSeat(
  userId: string,
  ticketId: string,
  seatId: string
): Promise<BookingResult> {
  const lockKey = `seat_lock:${ticketId}:${seatId}`; // Unique lock key for the specific seat
  const lockTTL = 5000; // Lock time-to-live in milliseconds

  try {
    // Acquire lock for the specific seat
    const lock = await redlock.acquire([lockKey], lockTTL);

    try {
      // Check the status of the seat in Redis
      const seatStatus = await redis.get(`seat:${ticketId}:${seatId}`);
      if (seatStatus === "booked") {
        return {
          success: false,
          message: `Seat ${seatId} for ticket ${ticketId} is already booked.`,
        };
      }

      // Update the ticket status using updateRedisTicket
      await updateRedisTicket(ticketId, {
        user_id: userId,
        status: "booked",
        seat_number: seatId,
      });

      return {
        success: true,
        message: `Seat ${seatId} successfully booked by user ${userId}.`,
      };
    } finally {
      // Always release the lock
      await lock.release();
    }
  } catch (err) {
    console.error("Error during booking operation:", err);
    return {
      success: false,
      message: "Failed to acquire lock or complete booking.",
    };
  }
}
