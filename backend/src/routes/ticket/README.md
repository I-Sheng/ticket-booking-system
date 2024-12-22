### API Documentation: Ticket CRUD Operations

#### reserveTicket

**Endpoint:** `POST /tickets/reserve`

**Description:**
Reserves a ticket for a specific user, ensuring the ticket is held temporarily until purchase confirmation.

**Request:**

- **Headers:**

  - `Content-Type: application/json`

- **Body:**

```json
{
  "userId": "<string>",
  "eventId": "<string>",
  "quantity": <number>
}
```

**Response:**

- **Success (200):**

```json
{
  "success": true,
  "reservationId": "<string>",
  "expiresAt": "<Timestamp>"
}
```

- **Error (400):**

```json
{
  "success": false,
  "message": "Invalid request parameters."
}
```

- **Error (500):**

```json
{
  "success": false,
  "message": "Internal server error."
}
```

#### buyTicket

**Endpoint:** `POST /tickets/buy`

**Description:**
Confirms the purchase of a reserved ticket and deducts the ticket quantity from availability.

**Request:**

- **Headers:**

  - `Content-Type: application/json`

- **Body:**

```json
{
  "reservationId": "<string>",
  "paymentDetails": {
    "method": "<string>",
    "cardNumber": "<string>",
    "expiry": "<string>",
    "cvv": "<string>"
  }
}
```

**Response:**

- **Success (200):**

```json
{
  "success": true,
  "ticketId": "<string>",
  "details": {
    "eventId": "<string>",
    "seatNumber": "<string>"
  }
}
```

- **Error (400):**

```json
{
  "success": false,
  "message": "Invalid reservation ID or payment details."
}
```

- **Error (500):**

```json
{
  "success": false,
  "message": "Internal server error."
}
```

#### deleteTicket

**Endpoint:** `DELETE /tickets/:ticketId`

**Description:**
Deletes a ticket purchase record and makes the ticket available again if within cancellation policy.

**Request:**

- **Headers:**

  - `Authorization: Bearer <token>`

- **Params:**
  - `ticketId`: `<string>` (required)

**Response:**

- **Success (200):**

```json
{
  "success": true,
  "message": "Ticket successfully deleted."
}
```

- **Error (404):**

```json
{
  "success": false,
  "message": "Ticket not found."
}
```

- **Error (500):**

```json
{
  "success": false,
  "message": "Internal server error."
}
```

#### ticketLeft

**Endpoint:** `GET /tickets/availability/:eventId`

**Description:**
Checks the number of tickets remaining for a specific event.

**Request:**

- **Headers:**

  - `Authorization: Bearer <token>`

- **Params:**
  - `eventId`: `<string>` (required)

**Response:**

- **Success (200):**

```json
{
  "success": true,
  "eventId": "<string>",
  "ticketsLeft": <number>
}
```

- **Error (404):**

```json
{
  "success": false,
  "message": "Event not found."
}
```

- **Error (500):**

```json
{
  "success": false,
  "message": "Internal server error."
}
```

### Notes:

- Ensure authentication headers are provided for `deleteTicket` and `ticketLeft` endpoints.
- Reservation expiry times should be monitored by the client to avoid automatic cancellation of unpurchased tickets.
