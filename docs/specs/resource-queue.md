# Resource Queue

## Overview

Resource processing queue for sending resources to AI for processing. Resources are added to the queue as background jobs, and a Bull processor picks them up for AI processing.

## Entities

### ResourceQueue

| Field                      | Type                                                  | Constraints                |
|----------------------------|-------------------------------------------------------|----------------------------|
| id                         | number                                                | PK, auto-increment         |
| resource_id                | number                                                | required, FK to Resource   |
| user_id                    | number                                                | required, FK to User       |
| status                     | enum: `pending`, `processing`, `completed`, `canceled`, `failed` | required, default: `pending` |
| retry_count                | number                                                | default: 0                 |
| last_processing_attempt_at | Date                                                  | nullable                   |
| prompt                     | text                                                  | required                   |
| createdAt                  | Date                                                  | auto-generated             |
| updatedAt                  | Date                                                  | auto-generated             |
| deletedAt                  | Date                                                  | nullable                   |

### ResourceQueueLog

| Field              | Type                                  | Constraints                |
|--------------------|---------------------------------------|----------------------------|
| id                 | number                                | PK, auto-increment         |
| resource_queue_id  | number                                | required, FK to ResourceQueue |
| start_at           | Date                                  | required                   |
| end_at             | Date                                  | nullable                   |
| status             | enum: `completed`, `canceled`, `failed` | required                |
| status_info        | text                                  | nullable, error details    |
| response           | text (JSON)                           | nullable, AI response      |
| createdAt          | Date                                  | auto-generated             |
| updatedAt          | Date                                  | auto-generated             |
| deletedAt          | Date                                  | nullable                   |

## Queue Processing Flow

1. User creates a queue entry via `POST /resource/queue`
2. A Bull job is added to the `resource-processing` queue
3. The processor picks up the job:
   - Checks if entry is still `pending` (skip if `canceled`)
   - Checks if `retry_count < MAX_RETRIES` (default: 3)
   - Updates status to `processing`, sets `last_processing_attempt_at`
   - Creates a `ResourceQueueLog` entry with `start_at`
   - Calls AI (currently placeholder) to generate vocabulary, grammar, and quiz
   - On success: creates a `Material`, updates status to `completed`, updates log
   - On failure: increments `retry_count`, updates status to `failed`, updates log with error
4. If the user cancels via `DELETE /resource/queue/:id`, status is set to `canceled` and open log entries are closed

## Endpoints

All endpoints require authentication via `Authorization: Bearer <accessToken>`.

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

### POST /resource/queue

Push a new resource for queue processing.

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

Cancel a queued resource. Updates status to `canceled` and closes open log entries.

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

## Guards

- `JwtAuthGuard` - Protects all resource queue endpoints

## Implementation

### Modules
- `ResourceQueueModule` - ResourceQueue, ResourceQueueLog entities, service, controller, and processor

### Files
- `server/src/resource-queue/entities/resource-queue.entity.ts`
- `server/src/resource-queue/entities/resource-queue-log.entity.ts`
- `server/src/resource-queue/resource-queue.service.ts`
- `server/src/resource-queue/resource-queue.controller.ts`
- `server/src/resource-queue/resource-queue.processor.ts`
- `server/src/resource-queue/resource-queue.module.ts`
- `server/src/resource-queue/dto/create-resource-queue.dto.ts`
- `server/src/resource-queue/resource-queue.service.spec.ts`
