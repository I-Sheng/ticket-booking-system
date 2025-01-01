import { Redis } from "ioredis";
import Redlock from "redlock";

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

      // Book the seat by setting its status to "booked"
      await redis.set(`seat:${ticketId}:${seatId}`, "booked");

      // Simulate post-booking operations (e.g., save to database)
      await performPostBookingOperations(userId, ticketId, seatId);

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

async function performPostBookingOperations(
  userId: string,
  ticketId: string,
  seatId: string
): Promise<void> {
  // Simulate saving booking details to the database or additional processing
  console.log(
    `Saving booking details for user ${userId}, ticket ${ticketId}, seat ${seatId}`
  );
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate delay
}

//example
(async () => {
  const ticketId = "concert123";
  const seatId1 = "A1";
  const seatId2 = "A2";
  const user1 = "user1";
  const user2 = "user2";

  // Ensure Redis is ready
  await redis.ping();

  // Initialize seat statuses sequentially
  await redis.set(`seat:${ticketId}:${seatId1}`, "available");
  await redis.set(`seat:${ticketId}:${seatId2}`, "available");

  // Simulate concurrent bookings
  const booking1 = bookSeat(user1, ticketId, seatId1);
  const booking2 = bookSeat(user2, ticketId, seatId2);

  // Wait for both bookings to complete
  const results = await Promise.all([booking1, booking2]);

  // Log results
  results.forEach((result) => console.log(result.message));

  // Cleanup: Close Redis connection
  redis.disconnect();
})();
