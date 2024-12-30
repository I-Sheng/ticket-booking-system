import {
  createTicket,
  readTicket,
  updateTicket,
  deleteTicket,
  readRegion,
  migrateTicketsToPostgres,
} from "./index"; // Update with the actual module name
import { Ticket } from "./index"; // Import Ticket type from index
import Redis from "ioredis";
import { Pool, QueryResult } from "pg";

jest.mock("ioredis");
jest.mock("pg");

const mockRedis = new Redis() as jest.Mocked<Redis>;
const mockPool = new Pool() as jest.Mocked<Pool>;

beforeEach(() => {
  jest.clearAllMocks();

  // Default mock behavior
  mockRedis.hgetall.mockResolvedValue({});
  mockRedis.keys.mockResolvedValue([]);
  mockRedis.hset.mockResolvedValue(1);
  mockRedis.sadd.mockResolvedValue(1);
  mockRedis.smembers.mockResolvedValue([]);
  mockRedis.del.mockResolvedValue(1);
});

describe("Ticket CRUD Operations", () => {
  it("should create a ticket", async () => {
    const ticket: Ticket = {
      ticket_id: "1",
      user_id: null,
      status: "empty",
      activity_id: "activity1",
      region_id: "region1",
      seat_number: "A1",
    };

    await createTicket(ticket);

    expect(mockRedis.hset).toHaveBeenCalledWith("ticket:1", {
      ticket_id: "1",
      user_id: "",
      status: "empty",
      activity_id: "activity1",
      region_id: "region1",
      seat_number: "A1",
    });
    expect(mockRedis.sadd).toHaveBeenCalledWith(
      "region:region1:status:empty",
      "1"
    );
  });

  it("should read a ticket", async () => {
    mockRedis.hgetall.mockResolvedValue({
      ticket_id: "1",
      user_id: "",
      status: "empty",
      activity_id: "activity1",
      region_id: "region1",
      seat_number: "A1",
    });

    const ticket = await readTicket("1");

    expect(mockRedis.hgetall).toHaveBeenCalledWith("ticket:1");
    expect(ticket).toEqual({
      ticket_id: "1",
      user_id: null,
      status: "empty",
      activity_id: "activity1",
      region_id: "region1",
      seat_number: "A1",
    });
  });

  it("should update a ticket", async () => {
    mockRedis.hgetall.mockResolvedValue({
      ticket_id: "1",
      user_id: "",
      status: "empty",
      activity_id: "activity1",
      region_id: "region1",
      seat_number: "A1",
    });

    await updateTicket("1", { status: "reserved" });

    expect(mockRedis.hset).toHaveBeenCalledWith("ticket:1", {
      ticket_id: "1",
      user_id: "",
      status: "reserved",
      activity_id: "activity1",
      region_id: "region1",
      seat_number: "A1",
    });
    expect(mockRedis.sadd).toHaveBeenCalledWith(
      "region:region1:status:reserved",
      "1"
    );
  });

  it("should delete a ticket", async () => {
    mockRedis.hgetall.mockResolvedValue({
      ticket_id: "1",
      user_id: "",
      status: "empty",
      activity_id: "activity1",
      region_id: "region1",
      seat_number: "A1",
    });

    await deleteTicket("1");

    expect(mockRedis.del).toHaveBeenCalledWith("ticket:1");
  });

  it('should read tickets by region with status "empty"', async () => {
    mockRedis.smembers.mockResolvedValue(["1", "2"]);

    const tickets = await readRegion("region1");

    expect(mockRedis.smembers).toHaveBeenCalledWith(
      "region:region1:status:empty"
    );
    expect(tickets).toEqual(["1", "2"]);
  });

  it("should migrate tickets from Redis to PostgreSQL", async () => {
    mockRedis.keys.mockResolvedValue(["ticket:1"]);
    mockRedis.hgetall.mockResolvedValue({
      ticket_id: "1",
      user_id: "",
      status: "empty",
      activity_id: "activity1",
      region_id: "region1",
      seat_number: "A1",
    });
    mockPool.query.mockImplementation(
      async () =>
        ({
          rows: [],
          rowCount: 0,
          command: "INSERT",
          oid: 0,
          fields: [],
        }) as QueryResult
    );

    await migrateTicketsToPostgres();

    expect(mockRedis.keys).toHaveBeenCalledWith("ticket:*");
    expect(mockRedis.hgetall).toHaveBeenCalledWith("ticket:1");
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO ticket"),
      ["1", null, "empty", "activity1", "region1", "A1"]
    );
  });
});
