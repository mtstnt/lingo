# API Endpoints

## Auth

All auth endpoints are public unless noted.

### POST /auth/register

Register a new user.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Errors:**
- `409 Conflict` - Email already registered

### POST /auth/login

Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

### POST /auth/refresh

Refresh access token. Requires valid refresh token in Authorization header.

**Headers:**
```
Authorization: Bearer <refreshToken>
```

**Response (200):**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

**Errors:**
- `401 Unauthorized` - Invalid or expired refresh token

### POST /auth/logout

Invalidate refresh token. Requires authentication.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me

Get current authenticated user. Requires authentication.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "john@example.com"
}
```

---

## Resource

All resource endpoints require authentication (`Authorization: Bearer <accessToken>`) and are scoped to the authenticated user.

### POST /resource

Create a new resource.

**Request:**
```json
{
  "name": "My vocabulary list",
  "type": "text",
  "content": "Hello, goodbye, thank you"
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "My vocabulary list",
  "type": "text",
  "content": "Hello, goodbye, thank you",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "updatedAt": "2026-06-21T00:00:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Missing or invalid token

### GET /resource

List all resources for the authenticated user.

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "My vocabulary list",
    "type": "text",
    "content": "Hello, goodbye, thank you",
    "createdAt": "2026-06-21T00:00:00.000Z",
    "updatedAt": "2026-06-21T00:00:00.000Z"
  }
]
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token

### GET /resource/:id

Get a single resource by ID. Only returns resources owned by the authenticated user.

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "My vocabulary list",
  "type": "text",
  "content": "Hello, goodbye, thank you",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "updatedAt": "2026-06-21T00:00:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found or not owned by user

### PATCH /resource/:id

Update a resource. Only allows updating resources owned by the authenticated user.

**Request:**
```json
{
  "name": "Updated vocabulary list",
  "content": "Hello, goodbye, thank you, please"
}
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Updated vocabulary list",
  "type": "text",
  "content": "Hello, goodbye, thank you, please",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "updatedAt": "2026-06-21T00:01:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found or not owned by user

### DELETE /resource/:id

Soft-delete a resource. Only allows deleting resources owned by the authenticated user.

**Response (200):**
```json
{
  "message": "Resource deleted successfully"
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found or not owned by user
