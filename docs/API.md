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

---

## Resource Queue

All resource queue endpoints require authentication (`Authorization: Bearer <accessToken>`) and are scoped to the authenticated user.

### GET /resource/queue

List all queued resources for the authenticated user.

**Response (200):**
```json
[
  {
    "id": 1,
    "resource_id": 1,
    "user_id": 1,
    "status": "pending",
    "retry_count": 0,
    "last_processing_attempt_at": null,
    "createdAt": "2026-06-21T00:00:00.000Z",
    "updatedAt": "2026-06-21T00:00:00.000Z"
  }
]
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token

### POST /resource/queue

Push a new resource for queue processing. Validates that the resource exists and is owned by the user.

**Request:**
```json
{
  "resource_id": 1
}
```

**Response (201):**
```json
{
  "id": 1,
  "resource_id": 1,
  "user_id": 1,
  "status": "pending",
  "retry_count": 0,
  "last_processing_attempt_at": null,
  "prompt": "Extract vocabulary and grammar from this text",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "updatedAt": "2026-06-21T00:00:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Resource not found or not owned by user

### DELETE /resource/queue/:resource_queue_id

Cancel a queued resource. Updates the queue entry status to `canceled` and marks any open log entries as canceled.

**Response (200):**
```json
{
  "id": 1,
  "resource_id": 1,
  "user_id": 1,
  "status": "canceled",
  "retry_count": 0,
  "last_processing_attempt_at": null,
  "prompt": "Extract vocabulary and grammar from this text",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "updatedAt": "2026-06-21T00:01:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Queue entry not found or not owned by user

---

## Material

All material endpoints require authentication (`Authorization: Bearer <accessToken>`) and are scoped to the authenticated user.

### GET /material

List all materials for the authenticated user.

**Response (200):**
```json
[
  {
    "id": 1,
    "resource_id": 1,
    "user_id": 1,
    "name": "My vocabulary list",
    "vocabulary": "[{\"sentence\":\"Hello world\",\"words\":[{\"word\":\"hello\",\"meaning\":\"greeting\"}]}]",
    "grammar": "[{\"sentence_index\":0,\"structures\":[\"Greeting\"]}]",
    "quiz": "[{\"question\":\"What does hello mean?\",\"options\":[\"greeting\",\"farewell\"],\"correct_index\":0}]",
    "createdAt": "2026-06-21T00:00:00.000Z",
    "updatedAt": "2026-06-21T00:00:00.000Z"
  }
]
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token

### GET /material/:id

Get a single material by ID. Only returns materials owned by the authenticated user.

**Response (200):**
```json
{
  "id": 1,
  "resource_id": 1,
  "user_id": 1,
  "name": "My vocabulary list",
  "vocabulary": "[{\"sentence\":\"Hello world\",\"words\":[{\"word\":\"hello\",\"meaning\":\"greeting\"}]}]",
  "grammar": "[{\"sentence_index\":0,\"structures\":[\"Greeting\"]}]",
  "quiz": "[{\"question\":\"What does hello mean?\",\"options\":[\"greeting\",\"farewell\"],\"correct_index\":0}]",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "updatedAt": "2026-06-21T00:00:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Material not found or not owned by user

### DELETE /material/:id

Soft-delete a material. Only allows deleting materials owned by the authenticated user.

**Response (200):**
```json
{
  "message": "Material deleted successfully"
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Material not found or not owned by user

---

## Vocabulary Bank

All vocabulary bank endpoints require authentication (`Authorization: Bearer <accessToken>`) and are scoped to the authenticated user.

### GET /vocabularies

List all vocabularies for the authenticated user. Excludes relationships.

**Response (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "original_word": "水果",
    "pronunciation": "shuǐguǒ",
    "meaning": "{\"en\":\"fruit\"}",
    "createdAt": "2026-06-21T00:00:00.000Z",
    "updatedAt": "2026-06-21T00:00:00.000Z"
  }
]
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token

### GET /vocabularies/:id

Get a single vocabulary by ID with its references and sentence links.

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "original_word": "水果",
  "pronunciation": "shuǐguǒ",
  "meaning": "{\"en\":\"fruit\"}",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "updatedAt": "2026-06-21T00:00:00.000Z",
  "references": [
    { "id": 1, "vocabulary_id": 1, "referred_vocabulary_id": 2 },
    { "id": 2, "vocabulary_id": 1, "referred_vocabulary_id": 3 }
  ],
  "sentences": [
    { "id": 1, "vocabulary_id": 1, "material_id": 1, "sentence_index": 0 }
  ]
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Vocabulary not found or not owned by user

### POST /vocabularies

Create a new vocabulary entry.

**Request:**
```json
{
  "original_word": "水果",
  "pronunciation": "shuǐguǒ",
  "meaning": "{\"en\":\"fruit\"}"
}
```

**Response (201):**
```json
{
  "id": 1,
  "user_id": 1,
  "original_word": "水果",
  "pronunciation": "shuǐguǒ",
  "meaning": "{\"en\":\"fruit\"}",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "updatedAt": "2026-06-21T00:00:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Missing or invalid token

### PUT /vocabularies/:id

Update a vocabulary entry.

**Request:**
```json
{
  "pronunciation": "shuǐguǒ (updated)"
}
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": 1,
  "original_word": "水果",
  "pronunciation": "shuǐguǒ (updated)",
  "meaning": "{\"en\":\"fruit\"}",
  "createdAt": "2026-06-21T00:00:00.000Z",
  "updatedAt": "2026-06-21T00:01:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Validation failed
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Vocabulary not found or not owned by user

### DELETE /vocabularies/:id

Delete a vocabulary entry and cascade delete its references and sentence links.

**Response (200):**
```json
{
  "message": "Vocabulary deleted successfully"
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - Vocabulary not found or not owned by user
