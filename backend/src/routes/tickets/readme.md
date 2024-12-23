
# `/tickets` Routes

<details>
<summary><code>POST</code> <code><b>/reserve</b></code> <code>(Reserve a ticket)</code></summary>

##### Headers

> | key            | value             | description                   |
> | -------------- | ----------------- | ----------------------------- |
> | Content-Type   | `application/json`| Specifies the content type    |

##### Body (application/json)

> | key       | required | data type | description                       |
> | --------- | -------- | --------- | --------------------------------- |
> | userId    | true     | string    | UUID of the user                  |
> | eventId   | true     | string    | UUID of the event                 |
> | quantity  | true     | number    | Number of tickets to reserve      |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"success": true, "reservationId": "...", ...}`       |
> | `400`     | `application/json` | `{"success": false, "message": "Invalid parameters"}`  |
> | `500`     | `application/json` | `{"success": false, "message": "Internal server error"}`|

</details>

---

<details>
<summary><code>POST</code> <code><b>/buy</b></code> <code>(Buy a reserved ticket)</code></summary>

##### Headers

> | key            | value             | description                   |
> | -------------- | ----------------- | ----------------------------- |
> | Content-Type   | `application/json`| Specifies the content type    |

##### Body (application/json)

> | key            | required | data type | description                       |
> | -------------- | -------- | --------- | --------------------------------- |
> | reservationId  | true     | string    | UUID of the ticket reservation    |
> | paymentDetails | true     | object    | Payment method and details        |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"success": true, "ticketId": "...", ...}`            |
> | `400`     | `application/json` | `{"success": false, "message": "Invalid data"}`        |
> | `500`     | `application/json` | `{"success": false, "message": "Internal server error"}`|

</details>

---

<details>
<summary><code>DELETE</code> <code><b>/tickets/:ticketId</b></code> <code>(Delete a ticket)</code></summary>

##### Headers

> | key            | value              | description                |
> | -------------- | ------------------ | -------------------------- |
> | Authorization  | `Bearer <token>`   | The JWT token for auth     |

##### Params

> | key        | required | data type | description                     |
> | ---------- | -------- | --------- | ------------------------------- |
> | ticketId   | true     | string    | UUID of the ticket to delete    |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"success": true, "message": "Deleted successfully"}` |
> | `404`     | `application/json` | `{"success": false, "message": "Ticket not found"}`    |
> | `500`     | `application/json` | `{"success": false, "message": "Internal server error"}`|

</details>

---

<details>
<summary><code>GET</code> <code><b>/availability/:eventId</b></code> <code>(Check ticket availability)</code></summary>

##### Headers

> | key            | value              | description                |
> | -------------- | ------------------ | -------------------------- |
> | Authorization  | `Bearer <token>`   | The JWT token for auth     |

##### Params

> | key        | required | data type | description                     |
> | ---------- | -------- | --------- | ------------------------------- |
> | eventId    | true     | string    | UUID of the event               |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"success": true, "ticketsLeft": ...}`               |
> | `404`     | `application/json` | `{"success": false, "message": "Event not found"}`    |
> | `500`     | `application/json` | `{"success": false, "message": "Internal server error"}`|

</details>

---
