# /auth routes

### **Register**

<details>
<summary><code>POST</code> <code><b>/register</b></code> <code>(Register a new user)</code></summary>

##### Body (application/json or application/x-www-form-urlencoded)

| key            | required | data type | description         |
| -------------- | -------- | --------- | ------------------- |
| `email`        | true     | string    | User's email        |
| `password`     | true     | string    | User's password     |
| `phone_number` | true     | string    | User's phone number |
| `role`         | true     | string    | "user" or "host"    |
| `username`     | true     | string    | User's name         |

##### Responses

| http code | content-type       | response                                     |
| --------- | ------------------ | -------------------------------------------- |
| `201`     | `application/json` | `{"email": "user's email", "id": "user_id"}` |
| `409`     | `text/plain`       | `User already exists`                        |
| `500`     | `text/plain`       | `Internal server error`                      |

</details>

---

### **Login**

<details>
<summary><code>POST</code> <code><b>/login</b></code> <code>(Authenticate user)</code></summary>

##### Body (application/json or application/x-www-form-urlencoded)

| key        | required | data type | description     |
| ---------- | -------- | --------- | --------------- |
| `email`    | true     | string    | User's email    |
| `password` | true     | string    | User's password |

##### Responses

| http code | content-type       | response                                                                                                   |
| --------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `200`     | `application/json` | `{"email": "user's email", "username": "user's name", "role": "user" \| "host", jwtToken: "Bearer token"}` |
| `401`     | `text/plain`       | `Invalid credentials`                                                                                      |
| `404`     | `text/plain`       | `User not found`                                                                                           |
| `500`     | `text/plain`       | `Internal server error`                                                                                    |

</details>

---

### **Get User Info**

<details>
<summary><code>GET</code> <code><b>/userinfo</b></code> <code>(Retrieve user information)</code></summary>

##### Headers

| key             | required | data type | description             |
| --------------- | -------- | --------- | ----------------------- |
| `Authorization` | true     | string    | Bearer token from login |

##### Responses

| http code | content-type       | response                                                                                                         |
| --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `200`     | `application/json` | `{"email": "user's email", "username": "user's name", "role": "user" \| "host", "phone_number": "user's phone"}` |
| `401`     | `text/plain`       | `No token provided`                                                                                              |
| `403`     | `text/plain`       | `Invalid token`                                                                                                  |
| `404`     | `text/plain`       | `User not found`                                                                                                 |

</details>

---

### **Update User Info**

<details>
<summary><code>PUT</code> <code><b>/</b></code> <code>(Update user information)</code></summary>

##### Headers

| key             | required | data type | description             |
| --------------- | -------- | --------- | ----------------------- |
| `Authorization` | true     | string    | Bearer token from login |

##### Body (application/json)

| key            | required | data type | description          |
| -------------- | -------- | --------- | -------------------- |
| `username`     | false    | string    | User's updated name  |
| `phone_number` | false    | string    | User's updated phone |

##### Responses

| http code | content-type       | response                                                                                                                  |
| --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `200`     | `application/json` | `{"email": "user's email", "username": "user's updated name", "role": "user" \| "host", "phone_number": "updated phone"}` |
| `401`     | `text/plain`       | `No token provided`                                                                                                       |
| `403`     | `text/plain`       | `Invalid token`                                                                                                           |
| `500`     | `text/plain`       | `Internal server error`                                                                                                   |

</details>
