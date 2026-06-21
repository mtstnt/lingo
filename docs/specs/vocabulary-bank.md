# Vocabulary Bank

## Overview

Vocabulary bank stores all known vocabulary and combinations of it. All new vocabs from a learned material are automatically added to the bank. Used by the mobile and web app to track learned words and enable review.

For CJK languages (Chinese, Japanese), it stores references to building blocks (e.g., 水果 -> 水, 果) so users can jump to component meanings. It also stores references to material sentences as example sentences.

## Entities

### VocabularyBank

| Field          | Type       | Constraints                |
|----------------|------------|----------------------------|
| id             | number     | PK, auto-increment         |
| user_id        | number     | required, FK to User       |
| original_word  | string     | required                   |
| pronunciation  | string     | required (pinyin, hiragana, or phonetic) |
| meaning        | text (JSON)| required                   |
| createdAt      | Date       | auto-generated             |
| updatedAt      | Date       | auto-generated             |
| deletedAt      | Date       | nullable                   |

### VocabularyBankReference

Self-referencing many-to-many for word building blocks.

| Field                  | Type   | Constraints        |
|------------------------|--------|--------------------|
| id                     | number | PK, auto-increment |
| vocabulary_id          | number | required, FK to VocabularyBank |
| referred_vocabulary_id | number | required, FK to VocabularyBank |

### VocabularyBankSentence

Links vocabulary to material sentences as example sentences.

| Field          | Type   | Constraints        |
|----------------|--------|--------------------|
| id             | number | PK, auto-increment |
| vocabulary_id  | number | required, FK to VocabularyBank |
| material_id    | number | required, FK to Material |
| sentence_index | number | required           |

## Auto-Population Flow

When a Material is created by the queue processor:

1. Parse the vocabulary JSON from the AI response
2. For each unique word across all sentences:
   - Upsert into VocabularyBank (find by `user_id` + `original_word`, or create)
   - Create a VocabularyBankSentence linking the word to the material sentence
3. For CJK words (Chinese/Japanese characters):
   - Decompose word into individual characters
   - Find existing character-level VocabularyBank entries
   - Create VocabularyBankReference entries from the compound word to each character

## Endpoints

All endpoints require authentication via `Authorization: Bearer <accessToken>`.

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

## Guards

- `JwtAuthGuard` - Protects all vocabulary bank endpoints

## Implementation

### Modules
- `VocabularyBankModule` - VocabularyBank, VocabularyBankReference, VocabularyBankSentence entities, service, and controller

### Files
- `server/src/vocabulary-bank/entities/vocabulary-bank.entity.ts`
- `server/src/vocabulary-bank/entities/vocabulary-bank-reference.entity.ts`
- `server/src/vocabulary-bank/entities/vocabulary-bank-sentence.entity.ts`
- `server/src/vocabulary-bank/vocabulary-bank.service.ts`
- `server/src/vocabulary-bank/vocabulary-bank.controller.ts`
- `server/src/vocabulary-bank/vocabulary-bank.module.ts`
- `server/src/vocabulary-bank/dto/create-vocabulary-bank.dto.ts`
- `server/src/vocabulary-bank/dto/update-vocabulary-bank.dto.ts`
- `server/src/vocabulary-bank/vocabulary-bank.service.spec.ts`
