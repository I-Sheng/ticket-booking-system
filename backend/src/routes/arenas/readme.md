## /arenas routes

<details>
<summary><code>POST</code> <code><b>/create</b></code> <code>(Create a new arena)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json or application/x-www-form-urlencoded)

> | key       | required | data type | description              |
> | --------- | -------- | --------- | ------------------------ |
> | title     | true     | string    | Title of the arena       |
> | address   | true     | string    | Address of the arena     |
> | capacity  | true     | integer   | Capacity of the arena    |

##### Responses

> | http code | content-type       | response                                              |
> | --------- | ------------------ | ----------------------------------------------------- |
> | `201`     | `application/json` | `{"message": "Arena created successfully", ...}`     |
> | `400`     | `application/json` | `{"error": "Invalid request data"}`                  |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                 |

</details>

---

<details>
<summary><code>GET</code> <code><b>/list</b></code> <code>(List all arenas)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Query Parameters

> | key       | required | data type | description              |
> | --------- | -------- | --------- | ------------------------ |
> | none      |          |           |                         |

##### Responses

> | http code | content-type       | response                                              |
> | --------- | ------------------ | ----------------------------------------------------- |
> | `200`     | `application/json` | `{"arenas": [ ... ]}`                                |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                 |

</details>

---

<details>
<summary><code>GET</code> <code><b>/arena/:arena_id</b></code> <code>(Get arena information by arena_id)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Path Parameters

> | key       | required | data type | description          |
> | --------- | -------- | --------- | -------------------- |
> | arena_id  | true     | string    | UUID of the arena    |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"_id": "uuid", "title": "...", "address": "...", ...}` |
> | `404`     | `application/json` | `{"error": "Arena not found"}`                        |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>PATCH</code> <code><b>/update</b></code> <code>(Update an arena)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json)

> | key        | required | data type | description                      |
> | ---------- | -------- | --------- | -------------------------------- |
> | arena_id   | true     | string    | UUID of the arena to update      |
> | title      | false    | string    | Updated title of the arena       |
> | address    | false    | string    | Updated address of the arena     |
> | capacity   | false    | integer   | Updated capacity of the arena    |

##### Responses

> | http code | content-type       | response                                              |
> | --------- | ------------------ | ----------------------------------------------------- |
> | `200`     | `application/json` | `{"message": "Arena updated successfully", ...}`     |
> | `404`     | `application/json` | `{"error": "Arena not found"}`                       |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                 |

</details>

---

<details>
<summary><code>DELETE</code> <code><b>/delete</b></code> <code>(Delete an arena)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json or application/x-www-form-urlencoded)

> | key        | required | data type | description              |
> | ---------- | -------- | --------- | ------------------------ |
> | arena_id   | true     | string    | UUID of the arena to delete |

##### Responses

> | http code | content-type       | response                                              |
> | --------- | ------------------ | ----------------------------------------------------- |
> | `200`     | `application/json` | `{"message": "Arena deleted successfully"}`          |
> | `404`     | `application/json` | `{"error": "Arena not found"}`                       |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                 |

</details>
