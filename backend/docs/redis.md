# Tickets API Documentation

---

### **Create Ticket**

<details>
<summary><code>POST</code> <code><b>/tickets</b></code> <code>(Create a new ticket)</code></summary>

##### Body (application/json)

| key             | required | data type | description                |
| --------------- | -------- | --------- | -------------------------- |
| `user_id`       | false    | string    | ID of the user             |
| `status`        | true     | string    | Status of the ticket       |
| `activity_id`   | true     | string    | Associated activity ID     |
| `region_id`     | true     | string    | Associated region ID       |
| `seat_number`   | true     | string    | Seat number for the ticket |
| `reserver_time` | true     | Date      | Reservation time           |

##### Responses

| http code | content-type       | response                                                                     |
| --------- | ------------------ | ---------------------------------------------------------------------------- |
| `201`     | `application/json` | `{"message": "Ticket created successfully.", "ticket_id": "generated UUID"}` |
| `500`     | `application/json` | `{"error": "Failed to create ticket."}`                                      |

</details>

---

### **Read Ticket**

<details>
<summary><code>GET</code> <code><b>/tickets/:id</b></code> <code>(Retrieve ticket information)</code></summary>

##### Parameters

| key  | required | data type | description            |
| ---- | -------- | --------- | ---------------------- |
| `id` | true     | string    | The UUID of the ticket |

##### Responses

| http code | content-type       | response                                                                      |
| --------- | ------------------ | ----------------------------------------------------------------------------- |
| `200`     | `application/json` | `{"ticket_id": "UUID", "user_id": "user ID", "status": "ticket status", ...}` |
| `404`     | `application/json` | `{"error": "Ticket not found."}`                                              |
| `500`     | `application/json` | `{"error": "Failed to read ticket."}`                                         |

</details>

---

### **Update Ticket**

<details>
<summary><code>PUT</code> <code><b>/tickets/:id</b></code> <code>(Update ticket information)</code></summary>

##### Parameters

| key  | required | data type | description            |
| ---- | -------- | --------- | ---------------------- |
| `id` | true     | string    | The UUID of the ticket |

##### Body (application/json)

| key             | required | data type | description                |
| --------------- | -------- | --------- | -------------------------- |
| `user_id`       | false    | string    | ID of the user             |
| `status`        | false    | string    | Status of the ticket       |
| `activity_id`   | false    | string    | Associated activity ID     |
| `region_id`     | false    | string    | Associated region ID       |
| `seat_number`   | false    | string    | Seat number for the ticket |
| `reserver_time` | false    | Date      | Reservation time           |

##### Responses

| http code | content-type       | response                                      |
| --------- | ------------------ | --------------------------------------------- |
| `200`     | `application/json` | `{"message": "Ticket updated successfully."}` |
| `404`     | `application/json` | `{"error": "Ticket not found."}`              |
| `500`     | `application/json` | `{"error": "Failed to update ticket."}`       |

</details>

---

### **Delete Ticket**

<details>
<summary><code>DELETE</code> <code><b>/tickets/:id</b></code> <code>(Delete a ticket)</code></summary>

##### Parameters

| key  | required | data type | description            |
| ---- | -------- | --------- | ---------------------- |
| `id` | true     | string    | The UUID of the ticket |

##### Responses

| http code | content-type       | response                                      |
| --------- | ------------------ | --------------------------------------------- |
| `200`     | `application/json` | `{"message": "Ticket deleted successfully."}` |
| `404`     | `application/json` | `{"error": "Ticket not found."}`              |
| `500`     | `application/json` | `{"error": "Failed to delete ticket."}`       |

</details>

---

### **Get Tickets by Region**

<details>
<summary><code>GET</code> <code><b>/regions/:id/tickets</b></code> <code>(Retrieve tickets by region)</code></summary>

##### Parameters

| key  | required | data type | description   |
| ---- | -------- | --------- | ------------- |
| `id` | true     | string    | The region ID |

##### Responses

| http code | content-type       | response                                |
| --------- | ------------------ | --------------------------------------- |
| `200`     | `application/json` | `["ticket_id_1", "ticket_id_2", ...]`   |
| `500`     | `application/json` | `{"error": "Failed to fetch tickets."}` |

</details>

---

### **Migrate Tickets**

<details>
<summary><code>POST</code> <code><b>/migrate</b></code> <code>(Migrate tickets to PostgreSQL)</code></summary>

##### Responses

| http code | content-type       | response                                           |
| --------- | ------------------ | -------------------------------------------------- |
| `200`     | `application/json` | `{"message": "Migration completed successfully."}` |
| `500`     | `application/json` | `{"error": "Failed to migrate tickets."}`          |

</details>
