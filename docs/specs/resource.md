# Resource

## Overview

Resource is a raw media or text for language learning. It will be converted into a Material when it is learning-ready. All endpoints require authentication and are scoped to the authenticated user.

## Resource Types

| Type  | Description |
|-------|-------------|
| text  | Ready for extraction |
| url   | Needs a crawler to extract raw contents, then feed to LLM for cleanup, then extraction |
| image | Needs Multimodal LLM for extraction |
| video | Needs Multimodal LLM for extraction |

## Entities

### Resource

| Field     | Type                    | Constraints                        |
|-----------|-------------------------|------------------------------------|
| id        | number                  | PK, auto-increment                 |
| user_id   | number                  | required, FK to User               |
| name      | string                  | required                           |
| type      | enum (text/url/image/video) | required                       |
| content   | text                    | required (text content, URL, or MinIO path) |
| createdAt | Date                    | auto-generated                     |
| updatedAt | Date                    | auto-generated                     |
| deletedAt | Date                    | nullable, soft delete              |

## Endpoints

All endpoints require authentication via `Authorization: Bearer <accessToken>`.

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

## Guards

- `JwtAuthGuard` - Protects all resource endpoints

## Implementation

### Modules
- `ResourceModule` - Resource entity, service, and controller

### Files
- `server/src/resource/entities/resource.entity.ts`
- `server/src/resource/resource.service.ts`
- `server/src/resource/resource.controller.ts`
- `server/src/resource/resource.module.ts`
- `server/src/resource/dto/create-resource.dto.ts`
- `server/src/resource/dto/update-resource.dto.ts`
- `server/src/resource/resource.service.spec.ts`
