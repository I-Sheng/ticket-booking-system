# /tickets routes

<details>
<summary><code>POST</code> <code><b>/create</b></code> <code>(Create a new ticket)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token`ˆ | The JWT token|

##### Body (application/json or application/x-www-form-urlencoded)

> | key          | required | data type | description                      |
> | ------------ | -------- | --------- | ---------------------------------|
> | user_id      | true     | string    | UUID of the user                 |
> | activity_id  | true     | string    | UUID of the activity             |
> | region_id    | true     | string    | UUID of the region               |
> | seat_number  | true     | integer   | Seat number for the ticket       |
> | is_paid      | false    | boolean   | Payment status of the ticket     |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `201`     | `application/json` | `{"message": "Ticket created successfully", ...}`      |
> | `400`     | `application/json` | `{"error": "Invalid request data"}`                    |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>GET</code> <code><b>/list</b></code> <code>(List all tickets for a user)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Query Parameters

> | key     | required | data type | description            |
> | ------- | -------- | --------- | ---------------------- |
> | user_id | true     | string    | UUID of the user       |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"tickets": [ ... ]}`                                 |
> | `404`     | `application/json` | `{"error": "User not found or no tickets available"}`  |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>GET</code> <code><b>/list-by-activity</b></code> <code>(List all tickets for an activity)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Query Parameters

> | key          | required | data type | description                |
> | ------------ | -------- | --------- | -------------------------- |
> | activity_id  | true     | string    | UUID of the activity       |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"tickets": [ ... ]}`                                 |
> | `404`     | `application/json` | `{"error": "Activity not found or no tickets found"}`  |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>PATCH</code> <code><b>/update</b></code> <code>(Update a ticket)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json)

> | key         | required | data type | description                   |
> | ----------- | -------- | --------- | ----------------------------- |
> | ticket_id   | true     | string    | UUID of the ticket to update  |
> | is_paid     | false    | boolean   | Updated payment status        |
> | seat_number | false    | integer   | Updated seat number           |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Ticket updated successfully", ...}`      |
> | `404`     | `application/json` | `{"error": "Ticket not found"}`                        |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>DELETE</code> <code><b>/delete</b></code> <code>(Delete a ticket)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json or application/x-www-form-urlencoded)

> | key        | required | data type | description                   |
> | ---------- | -------- | --------- | ----------------------------- |
> | ticket_id  | true     | string    | UUID of the ticket to delete  |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Ticket deleted successfully"}`           |
> | `404`     | `application/json` | `{"error": "Ticket not found"}`                        |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>
