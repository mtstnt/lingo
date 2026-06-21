# Authentication

## Overview

JWT-based authentication with access and refresh tokens.

## Entities

### User

| Field       | Type     | Constraints          |
|-------------|----------|----------------------|
| id          | number   | PK, auto-increment   |
| email       | string   | unique, required     |
| password    | string   | required, hashed     |
| firstName   | string   | required             |
| lastName    | string   | required             |
| refreshToken| string   | nullable             |
| createdAt   | Date     | auto-generated       |
| updatedAt   | Date     | auto-generated       |
| deletedAt   | Date     | nullable, soft delete|

## Endpoints

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

## Token Strategy

- **Access token**: 15 minute expiry, contains `sub` (user id) and `email`
- **Refresh token**: 7 day expiry, stored hashed in database
- Passwords hashed with bcrypt (10 rounds)
- Refresh tokens invalidated on logout

## Guards

- `JwtAuthGuard` - Protects routes requiring authentication
- `JwtRefreshGuard` - Protects the refresh token endpoint

## Implementation

### Modules
- `UserModule` - User entity and service
- `AuthModule` - Authentication logic, strategies, guards

### Files
- `server/src/user/entities/user.entity.ts`
- `server/src/user/user.service.ts`
- `server/src/user/user.module.ts`
- `server/src/auth/auth.service.ts`
- `server/src/auth/auth.controller.ts`
- `server/src/auth/auth.module.ts`
- `server/src/auth/strategies/jwt.strategy.ts`
- `server/src/auth/strategies/jwt-refresh.strategy.ts`
- `server/src/auth/guards/jwt-auth.guard.ts`
- `server/src/auth/guards/jwt-refresh.guard.ts`
- `server/src/auth/dto/register.dto.ts`
- `server/src/auth/dto/login.dto.ts`
- `server/src/auth/dto/auth-response.dto.ts`

### Environment Variables

```
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
```
