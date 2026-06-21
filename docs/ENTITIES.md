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
