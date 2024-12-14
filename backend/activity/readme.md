## /activities routes

<details>
<summary><code>POST</code> <code><b>/create</b></code> <code>(Create a new activity)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json or application/x-www-form-urlencoded)

> | key               | required | data type | description                          |
> | ----------------- | -------- | --------- | ------------------------------------ |
> | on_sale_date      | true     | string    | Date when tickets go on sale (YYYY-MM-DD) |
> | start_time        | true     | string    | Start time of the activity (ISO 8601) |
> | end_time          | true     | string    | End time of the activity (ISO 8601)   |
> | title             | true     | string    | Title of the activity                |
> | content           | false    | string    | Description or content of the activity |
> | cover_img         | false    | string    | URL of the cover image               |
> | price_level_img   | false    | string    | URL of the price level image         |
> | arena_id          | true     | string    | UUID of the arena hosting the activity |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `201`     | `application/json` | `{"message": "Activity created successfully", ...}`    |
> | `400`     | `application/json` | `{"error": "Invalid request data"}`                    |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>GET</code> <code><b>/list</b></code> <code>(List all activities)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Query Parameters

> | key      | required | data type | description                         |
> | -------- | -------- | --------- | ----------------------------------- |
> | arena_id | false    | string    | Filter activities by arena UUID     |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"activities": [ ... ]}`                              |
> | `404`     | `application/json` | `{"error": "No activities found"}`                     |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>GET</code> <code><b>/get/:activity_id</b></code> <code>(Get an activity by its ID)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Path Parameters

> | key          | required | data type | description                     |
> | ------------ | -------- | --------- | ------------------------------- |
> | activity_id  | true     | string    | UUID of the activity to retrieve |

##### Responses

> | http code | content-type       | response                                                   |
> | --------- | ------------------ | --------------------------------------------------------- |
> | `200`     | `application/json` | `{"_id": "...", "title": "...", "start_time": "...", ...}` |
> | `404`     | `application/json` | `{"error": "Activity not found"}`                         |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                      |

</details>

---

<details>
<summary><code>PATCH</code> <code><b>/update</b></code> <code>(Update an activity)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json)

> | key               | required | data type | description                          |
> | ----------------- | -------- | --------- | ------------------------------------ |
> | activity_id       | true     | string    | UUID of the activity to update      |
> | on_sale_date      | false    | string    | Updated on-sale date (YYYY-MM-DD)   |
> | start_time        | false    | string    | Updated start time (ISO 8601)       |
> | end_time          | false    | string    | Updated end time (ISO 8601)         |
> | title             | false    | string    | Updated title of the activity       |
> | content           | false    | string    | Updated content of the activity     |
> | cover_img         | false    | string    | Updated URL of the cover image      |
> | price_level_img   | false    | string    | Updated URL of the price level image|
> | arena_id          | false    | string    | Updated UUID of the arena hosting the activity |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Activity updated successfully", ...}`    |
> | `404`     | `application/json` | `{"error": "Activity not found"}`                      |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>DELETE</code> <code><b>/delete</b></code> <code>(Delete an activity)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json or application/x-www-form-urlencoded)

> | key          | required | data type | description                   |
> | ------------ | -------- | --------- | ----------------------------- |
> | activity_id  | true     | string    | UUID of the activity to delete|

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Activity deleted successfully"}`         |
> | `404`     | `application/json` | `{"error": "Activity not found"}`                      |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>
