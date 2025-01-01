import { query } from "../database";

export async function updateTicket(data: {
  ticket_id: string;
  user_id: string | undefined | null;
  is_paid?: boolean;
  seat_number?: number;
  created_at?: Date;
}) {
  const fields = [];
  const values = [];
  let index = 1;

  if (data.is_paid !== undefined) {
    fields.push(`is_paid = $${index++}`);
    values.push(data.is_paid);
  }
  if (data.seat_number !== undefined) {
    fields.push(`seat_number = $${index++}`);
    values.push(data.seat_number);
  }
  if (data.user_id !== undefined) {
    fields.push(`user_id = $${index++}`);
    values.push(data.user_id);
  }
  if (data.created_at !== undefined) {
    fields.push(`created_at = $${index++}`);
    values.push(data.created_at);
  }

  if (fields.length === 0) {
    return { error: "No fields to update" };
  }

  const qstring = `
    UPDATE tickets
    SET ${fields.join(", ")}
    WHERE _id = $${index}
    RETURNING *;
  `;
  values.push(data.ticket_id);

  try {
    // 開啟交易
    await query("BEGIN", []);

    const result = await query(qstring, values);

    if (result.rowCount === 0) {
      // 若找不到票，回滾交易
      await query("ROLLBACK", []);
      return { error: "Ticket not found" };
    }

    // 提交交易
    await query("COMMIT", []);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating ticket:", error);

    // 若發生錯誤，回滾交易
    await query("ROLLBACK", []);
    return { error: "Failed to update ticket" };
  }
}
