# Entities

All entities extend `BaseEntity` which provides `id`, `createdAt`, `updatedAt`, and `deletedAt` (soft delete) fields.

---

## User

| Field        | Type     | Constraints        |
|--------------|----------|--------------------|
| id           | number   | PK, auto-increment |
| email        | string   | unique, required   |
| password     | string   | required, hashed   |
| firstName    | string   | required           |
| lastName     | string   | required           |
| refreshToken | string   | nullable           |
| createdAt    | Date     | auto-generated     |
| updatedAt    | Date     | auto-generated     |
| deletedAt    | Date     | nullable           |

**Module:** `UserModule`
**File:** `server/src/user/entities/user.entity.ts`

---

## Resource

Resource is a raw media or text for language learning. It will be converted into a Material when it is learning-ready.

| Field     | Type                              | Constraints                |
|-----------|-----------------------------------|----------------------------|
| id        | number                            | PK, auto-increment         |
| user_id   | number                            | required, FK to User       |
| name      | string                            | required                   |
| type      | enum: `text`, `url`, `image`, `video` | required              |
| content   | text                              | required                   |
| createdAt | Date                              | auto-generated             |
| updatedAt | Date                              | auto-generated             |
| deletedAt | Date                              | nullable                   |

**Resource types:**
- `text` - Ready for extraction
- `url` - Needs crawler + LLM cleanup before extraction
- `image` - Needs multimodal LLM for extraction
- `video` - Needs multimodal LLM for extraction

**Module:** `ResourceModule`
**File:** `server/src/resource/entities/resource.entity.ts`

---

## ResourceQueue

Resource processing queue entry. Tracks resources sent for AI processing.

| Field                      | Type                                        | Constraints                |
|----------------------------|---------------------------------------------|----------------------------|
| id                         | number                                      | PK, auto-increment         |
| resource_id                | number                                      | required, FK to Resource   |
| user_id                    | number                                      | required, FK to User       |
| status                     | enum: `pending`, `processing`, `completed`, `canceled`, `failed` | required, default: `pending` |
| retry_count                | number                                      | default: 0                 |
| last_processing_attempt_at | Date                                        | nullable                   |
| prompt                     | text                                        | required                   |
| createdAt                  | Date                                        | auto-generated             |
| updatedAt                  | Date                                        | auto-generated             |
| deletedAt                  | Date                                        | nullable                   |

**Module:** `ResourceQueueModule`
**File:** `server/src/resource-queue/entities/resource-queue.entity.ts`

---

## ResourceQueueLog

Log of each processing attempt for a resource queue entry.

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

**Module:** `ResourceQueueModule`
**File:** `server/src/resource-queue/entities/resource-queue-log.entity.ts`

---

## Material

Learning-ready material generated from AI processing of a resource.

| Field     | Type       | Constraints                |
|-----------|------------|----------------------------|
| id        | number     | PK, auto-increment         |
| resource_id | number   | required, FK to Resource   |
| user_id   | number     | required, FK to User       |
| name      | string     | required                   |
| vocabulary| text (JSON)| required                   |
| grammar   | text (JSON)| required                   |
| quiz      | text (JSON)| required                   |
| createdAt | Date       | auto-generated             |
| updatedAt | Date       | auto-generated             |
| deletedAt | Date       | nullable                   |

**vocabulary** JSON structure: list of sentences, each with word details and meanings.
**grammar** JSON structure: grammatical structures per sentence (referenced by index).
**quiz** JSON structure: MCQ questions with options and correct answer index.

**Module:** `MaterialModule`
**File:** `server/src/material/entities/material.entity.ts`

---

## VocabularyBank

Stores all known vocabulary and combinations. Auto-populated from materials.

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

**Module:** `VocabularyBankModule`
**File:** `server/src/vocabulary-bank/entities/vocabulary-bank.entity.ts`

---

## VocabularyBankReference

Self-referencing many-to-many for word building blocks (e.g., 水果 -> 水, 果).

| Field                  | Type   | Constraints        |
|------------------------|--------|--------------------|
| id                     | number | PK, auto-increment |
| vocabulary_id          | number | required, FK to VocabularyBank |
| referred_vocabulary_id | number | required, FK to VocabularyBank |

**Module:** `VocabularyBankModule`
**File:** `server/src/vocabulary-bank/entities/vocabulary-bank-reference.entity.ts`

---

## VocabularyBankSentence

Links vocabulary to material sentences as example sentences.

| Field          | Type   | Constraints        |
|----------------|--------|--------------------|
| id             | number | PK, auto-increment |
| vocabulary_id  | number | required, FK to VocabularyBank |
| material_id    | number | required, FK to Material |
| sentence_index | number | required           |

**Module:** `VocabularyBankModule`
**File:** `server/src/vocabulary-bank/entities/vocabulary-bank-sentence.entity.ts`
