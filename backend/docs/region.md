## /regions routes

<details>
<summary><code>POST</code> <code><b>/create</b></code> <code>(Create a new region)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json or application/x-www-form-urlencoded)

> | key              | required | data type | description                            |
> | ---------------- | -------- | --------- | -------------------------------------- |
> | activity_id      | true     | string    | UUID of the associated activity        |
> | region_name      | true     | string    | Name of the region                     |
> | region_price     | true     | integer   | Price for the region                   |
> | region_capacity  | true     | integer   | Capacity of the region                 |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `201`     | `application/json` | `{"message": "Region created successfully", ...}`      |
> | `400`     | `application/json` | `{"error": "Invalid request data"}`                    |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>GET</code> <code><b>/list</b></code> <code>(List all regions for a specific activity)</code></summary>

##### Query Parameters

> | key          | required | data type | description                     |
> | ------------ | -------- | --------- | ------------------------------- |
> | activity_id  | true     | string    | UUID of the associated activity |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"regions": [ ... ]}`                                 |
> | `404`     | `application/json` | `{"error": "No regions found for the given activity"}` |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>PATCH</code> <code><b>/update</b></code> <code>(Update a region)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json)

> | key              | required | data type | description                            |
> | ---------------- | -------- | --------- | -------------------------------------- |
> | region_id        | true     | string    | UUID of the region to update           |
> | region_name      | false    | string    | Updated name of the region             |
> | region_price     | false    | integer   | Updated price for the region           |
> | region_capacity  | false    | integer   | Updated capacity of the region         |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Region updated successfully", ...}`      |
> | `404`     | `application/json` | `{"error": "Region not found"}`                        |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>DELETE</code> <code><b>/delete</b></code> <code>(Delete a region)</code></summary>

##### Headers

> | key           | value          | description   |
> | ------------- | -------------- | ------------- |
> | Authorization | `Bearer token` | The JWT token |

##### Body (application/json or application/x-www-form-urlencoded)

> | key          | required | data type | description                            |
> | ------------ | -------- | --------- | -------------------------------------- |
> | region_id    | true     | string    | UUID of the region to delete           |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Region deleted successfully"}`           |
> | `404`     | `application/json` | `{"error": "Region not found"}`                        |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>
