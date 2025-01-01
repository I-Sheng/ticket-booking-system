import {
  createRedisTicket,
  readRedisTicket,
  updateRedisTicket,
  deleteRedisTicket,
  readRedisRegion,
  migrateTicketsToPostgres,
} from "./index";

describe("Index Functionality Tests", () => {
  describe("createTicket", () => {
    it("should create a ticket", async () => {
      const ticket = {
        ticket_id: "testTicket",
        user_id: null,
        status: "empty",
        activity_id: "activity1",
        region_id: "region1",
        seat_number: "3",
        reserver_time: new Date(),
      };

      await createRedisTicket(ticket);
      const result = await readRedisTicket(ticket.ticket_id);

      expect(result).not.toBeNull();
      expect(result?.ticket_id).toBe(ticket.ticket_id);
      expect(result?.status).toBe(ticket.status);
    });
  });

  describe("readTicket", () => {
    it("should read a ticket", async () => {
      const ticket_id = "testTicket";
      const ticket = await readRedisTicket(ticket_id);

      expect(ticket).not.toBeNull();
      expect(ticket?.ticket_id).toBe(ticket_id);
    });
  });

  describe("updateTicket", () => {
    it("should update a ticket", async () => {
      const updates = { status: "booked", seat_number: "2" };
      const ticket_id = "testTicket";

      await updateRedisTicket(ticket_id, updates);
      const updatedTicket = await readRedisTicket(ticket_id);

      expect(updatedTicket?.status).toBe("booked");
      expect(updatedTicket?.seat_number).toBe("2");
    });
  });

  describe("deleteTicket", () => {
    it("should delete a ticket", async () => {
      const ticket_id = "testTicket";

      await deleteRedisTicket(ticket_id);
      const deletedTicket = await readRedisTicket(ticket_id);

      expect(deletedTicket).toBeNull();
    });
  });

  describe("readRegion", () => {
    it("should read tickets by region with status empty", async () => {
      const region_id = "region1";
      const ticket = {
        ticket_id: "ticket1",
        user_id: null,
        status: "empty",
        activity_id: "activity1",
        region_id,
        seat_number: "1",
        reserver_time: new Date(),
      };

      await createRedisTicket(ticket);
      const tickets = await readRedisRegion(region_id);

      expect(tickets).toContain("ticket1");
    });
  });

  describe("migrateTicketsToPostgres", () => {
    it("should migrate tickets to PostgreSQL", async () => {
      await migrateTicketsToPostgres();

      // This is a placeholder assertion. Replace with actual checks in the PostgreSQL database.
      expect(true).toBe(true);
    });
  });
});
