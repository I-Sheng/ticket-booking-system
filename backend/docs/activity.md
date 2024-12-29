## /activities routes

<details>
<summary><code>POST</code> <code><b>/create</b></code> 

<code>(Create a new activity, 建立活動時會根據 region capacity 事先把票建好)</code></summary>

##### Headers

> | key           | value          | description         |
> | ------------- | -------------- | ------------------- |
> | Authorization | `Bearer token` | The JWT token       |

##### Body (application/form-data)

> | key               | required | data type | description                                     |
> | ----------------- | -------- | --------- | ----------------------------------------------- |
> | on_sale_date      | true     | string    | Date when tickets go on sale (ISO 8601 format) |
> | start_time        | true     | string    | Start time of the activity (ISO 8601 format)   |
> | end_time          | true     | string    | End time of the activity (ISO 8601 format)     |
> | title             | true     | string    | Title of the activity                          |
> | content           | true    | string    | Description or content of the activity         |
> | cover_img         | true    | file      | Cover image file                               |
> | price_level_img   | true    | file      | Price level image file                         |
> | arena_id          | true     | string    | UUID of the arena hosting the activity         |
> | regions           | true     | array     | Array of region objects (see below for details) |

##### Region Object (part of `regions` array)
Regions Example (JSON):

```json
[
  {
    "region_name": "VIP",
    "region_price": 300,
    "region_capacity": 100
  },
  {
    "region_name": "General Admission",
    "region_price": 100,
    "region_capacity": 500
  }
]
```

> | key              | required | data type | description                       |
> | ---------------- | -------- | --------- | --------------------------------- |
> | region_name      | true     | string    | Name of the region               |
> | region_price     | true     | number    | Price for the region             |
> | region_capacity  | true     | number    | Capacity of the region (seats)   |
##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `201`     | `application/json` | `{"message": "Activity created successfully", "activity": activity(see example below), "regions": region[]}`    |
> | `400`     | `application/json` | `{"error": "Invalid request data"}`                    |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

```json
// activity example
{
    "_id": "uuid",
    "on_sale_date": "2025-01-01T04:00:00.000Z",
    "start_time": "2025-01-20T04:00:00.000Z",
    "end_time": "2025-01-20T07:00:00.000Z",
    "title": "concertABC",
    "content": "qwerasd",
    "cover_img": {
        "type": "Buffer",
        "data": [...]
    },
    "price_level_img": {
        "type": "Buffer",
        "data": [...]
    },
    "arena_id": "uuid",
    "creator_id": "uuid",
    "is_archived": false,
}
```

</details>

---

<details>
<summary><code>POST</code> <code><b>/regions/:activity_id</b></code> 

<code>(Add a region to an activity)</code></summary>

##### Headers

> | key           | value          | description         |
> | ------------- | -------------- | ------------------- |
> | Authorization | `Bearer token` | The JWT token       |

##### Path Parameters

> | key          | required | data type | description                     |
> | ------------ | -------- | --------- | ------------------------------- |
> | activity_id  | true     | string    | UUID of the activity            |

##### Body (application/json)

> | key               | required | data type | description                      |
> | ----------------- | -------- | --------- | -------------------------------- |
> | region_name       | true     | string    | Name of the region              |
> | region_price      | true     | number    | Price for the region            |
> | region_capacity   | true     | number    | Capacity of the region (seats)  |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `201`     | `application/json` | `{"message": "Region and tickets added successfully", "region":region}` |
> | `400`     | `application/json` | `{"error": "Invalid request data"}`                    |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>GET</code> <code><b>/list</b></code> 

<code>(List all activities, except which is archived)</code></summary>

##### Query Parameters

> | key      | required | data type | description                         |
> | -------- | -------- | --------- | ----------------------------------- |
> | arena_id | false    | string    | Filter activities by arena UUID     |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"activities": activity[]}`                              |
> | `404`     | `application/json` | `{"error": "No activities found"}`                     |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>GET</code> <code><b>/:activity_id</b></code> 

<code>(Get an activity and its regions by activity_id)</code></summary>

##### Path Parameters

> | key          | required | data type | description                     |
> | ------------ | -------- | --------- | ------------------------------- |
> | activity_id  | true     | string    | UUID of the activity to retrieve |

##### Responses

> | http code | content-type       | response                                                   |
> | --------- | ------------------ | --------------------------------------------------------- |
> | `200`     | `application/json` | `{"message": "Activity and regions retrieved successfully", "activity": activity}` |
> | `404`     | `application/json` | `{"error": "Activity not found"}`                         |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                      |

```json
// 200 response example
{
    "message":"...",
    "activity":
    {
        "_id": "uuid",
        "on_sale_date": "2025-01-01T04:00:00.000Z",
        "start_time": "2025-01-20T04:00:00.000Z",
        "end_time": "2025-01-20T07:00:00.000Z",
        "title": "concertABC",
        "content": "qwerasd",
        "cover_img": {
            "type": "Buffer",
            "data": [...]
        },
        "price_level_img": {
            "type": "Buffer",
            "data": [...]
        },
        "arena_id": "uuid",
        "creator_id": "uuid",
        "is_archived": false,
        "regions": [
            {
                "region_name": "VIP",
                "region_price": 300,
                "region_capacity": 100
            }, 
        ]
    }
}
```

</details>

---

<details> <summary><code>GET</code> <code><b>/creator/:creator_id</b></code> 

<code>(Get all activities created by a specific creator, including archived activities)</code></summary>
### Headers

> | Key           | Value              | Description       |
> | ------------- | ------------------ | ----------------- |
> | Authorization | `Bearer token` | The JWT token       |

### Path Parameters

> | Key          | Required | Data Type | Description                           |
> | ------------ | -------- | --------- | ------------------------------------- |
> | creator_id   | true     | string    | UUID of the creator to filter results |

### Responses

> | HTTP Code | Content-Type       | Response                                                                 |
> | --------- | ------------------ | ------------------------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Activities retrieved successfully", "activities": [...]}` |
> | `404`     | `application/json` | `{"error": "No activities found for the given creator"}`                |
> | `500`     | `application/json` | `{"error": "Internal Server Error"}`                                    |

</details>

---

<details>
<summary><code>PATCH</code> <code><b>/:activity_id</b></code> 

<code>(Update activity details except regions, e.g. title, image...)</code></summary>

##### Headers

> | key           | value          | description         |
> | ------------- | -------------- | ------------------- |
> | Authorization | `Bearer token` | The JWT token       |

##### Path Parameters

> | key          | required | data type | description                     |
> | ------------ | -------- | --------- | ------------------------------- |
> | activity_id  | true     | string    | UUID of the activity            |

##### Body (application/json or form-data)

> | key               | required | data type | description                      |
> | ----------------- | -------- | --------- | -------------------------------- |
> | title             | false    | string    | Updated title of the activity   |
> | content           | false    | string    | Updated content of the activity |
> | on_sale_date      | false    | string    | Updated on-sale date (ISO 8601) |
> | start_time        | false    | string    | Updated start time (ISO 8601)   |
> | end_time          | false    | string    | Updated end time (ISO 8601)     |
> | cover_img         | false    | file      | Updated cover image             |
> | price_level_img   | false    | file      | Updated price level image       |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Activity updated successfully", "activity": activity}`    |
> | `400`     | `application/json` | `{"error": "Invalid request data"}`                    |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>PATCH</code> <code><b>/archive/:activity_id</b></code> 

<code>(Archive an activity，主辦方可在活動結束後將其 archived，該活動就不會出現在首頁上)</code></summary>

##### Headers

> | key           | value          | description         |
> | ------------- | -------------- | ------------------- |
> | Authorization | `Bearer token` | The JWT token       |

##### Path Parameters

> | key          | required | data type | description                     |
> | ------------ | -------- | --------- | ------------------------------- |
> | activity_id  | true     | string    | UUID of the activity            |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Activity archived successfully", ...}`   |
> | `400`     | `application/json` | `{"error": "Activity already archived"}`               |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>PATCH</code> <code><b>/regions/:region_id</b></code> 

<code>(Update region details, 若有修改 region_capacity, 事先建好的票數也會一起更動)</code></summary>

##### Headers

> | key           | value          | description         |
> | ------------- | -------------- | ------------------- |
> | Authorization | `Bearer token` | The JWT token       |

##### Path Parameters

> | key          | required | data type | description                     |
> | ------------ | -------- | --------- | ------------------------------- |
> | region_id    | true     | string    | UUID of the region              |

##### Body (application/json)

> | key               | required | data type | description                                      |
> | ----------------- | -------- | --------- | ------------------------------------------------ |
> | region_name       | false    | string    | New name of the region                          |
> | region_price      | false    | number    | New price for the region                        |
> | region_capacity   | false    | number    | New capacity of the region (number of seats)    |


##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Region and tickets updated successfully", "region": region}` |
> | `400`     | `application/json` | `{"error": "Invalid request data or operation not allowed"}` |
> | `403`     | `application/json` | `{"error": "Only the creator can update the region"}`  |
> | `404`     | `application/json` | `{"error": "Region or activity not found"}`            |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>

---

<details>
<summary><code>DELETE</code> <code><b>/regions/:region_id</b></code> 

<code>(Delete a region, 也會一併把該區的票刪除)</code></summary>

##### Headers

> | key           | value          | description         |
> | ------------- | -------------- | ------------------- |
> | Authorization | `Bearer token` | The JWT token       |

##### Path Parameters

> | key          | required | data type | description                     |
> | ------------ | -------- | --------- | ------------------------------- |
> | region_id    | true     | string    | UUID of the region              |

##### Responses

> | http code | content-type       | response                                               |
> | --------- | ------------------ | ------------------------------------------------------ |
> | `200`     | `application/json` | `{"message": "Region and associated tickets deleted successfully", "region": region}` |
> | `400`     | `application/json` | `{"error": "Invalid request data"}`                    |
> | `500`     | `application/json` | `{"error": "Internal server error"}`                   |

</details>