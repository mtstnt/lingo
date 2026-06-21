# Material

## Overview

Learning-ready materials generated from AI processing of resources. Materials contain structured vocabulary, grammar, and quiz data ready for use by the app and web app for learning.

## Entities

### Material

| Field       | Type       | Constraints                |
|-------------|------------|----------------------------|
| id          | number     | PK, auto-increment         |
| resource_id | number     | required, FK to Resource   |
| user_id     | number     | required, FK to User       |
| name        | string     | required                   |
| vocabulary  | text (JSON)| required                   |
| grammar     | text (JSON)| required                   |
| quiz        | text (JSON)| required                   |
| createdAt   | Date       | auto-generated             |
| updatedAt   | Date       | auto-generated             |
| deletedAt   | Date       | nullable                   |

### JSON Structures

**vocabulary** - List of sentences with word details:
```json
[
  {
    "sentence": "The quick brown fox",
    "words": [
      { "word": "quick", "meaning": "fast", "details": "adjective" }
    ]
  }
]
```

**grammar** - Grammatical structures per sentence (referenced by index):
```json
[
  {
    "sentence_index": 0,
    "structures": ["Article + Adjective + Adjective + Noun"]
  }
]
```

**quiz** - MCQ questions for comprehension testing:
```json
[
  {
    "question": "What does 'quick' mean?",
    "options": ["slow", "fast", "tall", "heavy"],
    "correct_index": 1
  }
]
```

## Endpoints

All endpoints require authentication via `Authorization: Bearer <accessToken>`.

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
    "vocabulary": "[...]",
    "grammar": "[...]",
    "quiz": "[...]",
    "createdAt": "2026-06-21T00:00:00.000Z",
    "updatedAt": "2026-06-21T00:00:00.000Z"
  }
]
```

### GET /material/:id

Get a single material by ID. Only returns materials owned by the authenticated user.

**Response (200):**
```json
{
  "id": 1,
  "resource_id": 1,
  "user_id": 1,
  "name": "My vocabulary list",
  "vocabulary": "[...]",
  "grammar": "[...]",
  "quiz": "[...]",
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

## Guards

- `JwtAuthGuard` - Protects all material endpoints

## Implementation

### Modules
- `MaterialModule` - Material entity, service, and controller

### Files
- `server/src/material/entities/material.entity.ts`
- `server/src/material/material.service.ts`
- `server/src/material/material.controller.ts`
- `server/src/material/material.module.ts`
- `server/src/material/material.service.spec.ts`
