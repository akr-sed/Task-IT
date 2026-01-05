# 🔐 Authentication API

Base URL: `/api/auth`

## Overview

The Authentication API handles user registration, email verification, login, logout, password management, and profile operations.

---

## Endpoints

### User Registration

#### `POST /signup`

Register a new user account. Creates a temporary user and sends email verification code.

**Rate Limit:** 8 requests per hour

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation:**
| Field | Rules |
|-------|-------|
| name | Required, 3-50 characters, trimmed |
| email | Required, valid email format |
| password | Required, minimum 8 characters |

**Response (201 Created):**
```json
{
  "message": "Signup successful! Please check your email for verification code",
  "tempUser": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-12-25T10:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Please provide name, email, and password" |
| 400 | "Email is already registered" |
| 500 | "Internal server error" |

---

### Email Verification

#### `POST /verify-email`

Verify email address using the 6-digit code sent via email. On success, creates permanent user and returns JWT token.

**Rate Limit:** 10 requests per hour

**Request Headers:**
```
X-Device-Id: <unique-device-id>
X-Device-Name: <browser-name>
X-Device-OsVersion: <os-version>
```

**Request Body:**
```json
{
  "tempUserId": "507f1f77bcf86cd799439011",
  "verificationCode": 123456
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Please provide tempUserId and verification code" |
| 400 | "Invalid or expired verification code" |
| 400 | "User registration has expired. Please sign up again." |

---

#### `POST /verify-email/resend-verification-code`

Resend verification code to email.

**Rate Limit:** 10 requests per hour

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If that email is registered, a verification code has been sent."
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 429 | "Please wait 60 seconds before requesting another code." |

---

### Login

#### `POST /login`

Authenticate user and receive JWT token.

**Rate Limit:** 5 requests per 15 minutes

**Request Headers:**
```
X-Device-Id: <unique-device-id>
X-Device-Name: <browser-name>
X-Device-OsVersion: <os-version>
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Please provide email and password" |
| 400 | "Invalid email or password" |
| 429 | "Too many login attempts. Please try again later." |

---

### Logout

#### `POST /logout`

Invalidate the current session token.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "No token provided" |
| 404 | "Session not found" |

---

### Password Reset

#### `POST /reset-password`

Request password reset. Sends 6-digit code to email.

**Rate Limit:** 3 requests per hour

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If that email is registered, a reset code has been sent."
}
```

---

#### `POST /reset-password/verify`

Verify the password reset code.

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "email": "john@example.com",
  "resetCode": 123456
}
```

**Response (200 OK):**
```json
{
  "message": "Reset code verified",
  "userId": "507f1f77bcf86cd799439012",
  "resetToken": "a1b2c3d4e5f6g7h8i9j0..."
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Please provide email and reset code" |
| 400 | "Invalid email or reset code" |
| 400 | "Invalid or expired reset code" |

---

#### `POST /reset-password/new`

Set new password using the reset token. Auto-logs in the user.

**Rate Limit:** 5 requests per 15 minutes

**Request Headers:**
```
X-Device-Id: <unique-device-id>
X-Device-Name: <browser-name>
X-Device-OsVersion: <os-version>
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439012",
  "resetToken": "a1b2c3d4e5f6g7h8i9j0...",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Please provide userId, resetToken, and new password" |
| 400 | "User not found" |
| 400 | "Reset token is invalid or expired. Please restart the password reset process." |
| 400 | "Invalid reset token" |

---

### Password Change

#### `POST /change-password`

Change password (authenticated users).

**Authorization:** Required (Bearer Token)

**Rate Limit:** 3 requests per hour

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Current password and new password are required" |
| 400 | "New password must be at least 8 characters long" |
| 400 | "Current password is incorrect" |
| 404 | "User not found" |

---

### User Profile

#### `GET /:userId`

Get user information by ID.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-12-25T10:30:00.000Z"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "User ID is required" |
| 404 | "User not found" |

---

#### `POST /batch`

Get multiple users by IDs.

**Authorization:** Required (Bearer Token)

**Request Body:**
```json
{
  "userIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ]
}
```

---

#### `PUT /profile`

Update user profile (name only).

**Authorization:** Required (Bearer Token)

**Request Body:**
```json
{
  "name": "John Updated"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Updated",
    "email": "john@example.com",
    "createdAt": "2024-12-25T10:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Name is required" |
| 400 | "Name must be between 3 and 50 characters" |
| 404 | "User not found" |

---

### Email Change

#### `POST /email/request-change`

Request email change. Sends verification code to NEW email.

**Authorization:** Required (Bearer Token)

**Rate Limit:** 3 requests per day

**Request Body:**
```json
{
  "newEmail": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Verification code sent to new email address",
  "email": "newemail@example.com"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "New email is required" |
| 400 | "Invalid email format" |
| 400 | "Email is already in use" |

---

#### `POST /email/verify-change`

Verify email change with code.

**Authorization:** Required (Bearer Token)

**Rate Limit:** 10 requests per hour

**Request Body:**
```json
{
  "verificationCode": 123456,
  "newEmail": "newemail@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Email updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "newemail@example.com",
    "createdAt": "2024-12-25T10:30:00.000Z"
  }
}
```

---

### Account Deletion

#### `POST /account/request-deletion`

Request account deletion. Sends verification code.

**Authorization:** Required (Bearer Token)

**Request Body:** None

**Response (200 OK):**
```json
{
  "message": "Verification code sent to your email"
}
```

---

#### `POST /account/verify-deletion`

Verify and permanently delete account.

**Authorization:** Required (Bearer Token)

**Request Body:**
```json
{
  "verificationCode": 123456
}
```

**Response (200 OK):**
```json
{
  "message": "Account deleted successfully"
}
```

**Cleanup Actions:**
- Delete all user sessions
- Delete all verification codes
- Delete sent invites
- Delete received invites
- Transfer project ownership or delete projects
- Remove from project memberships
- Delete user's comments
- Unassign user's tasks
- Delete user record

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

---

## JWT Token

### Token Structure
- Algorithm: HS256
- Expiry: 30 days
- Payload: `{ userId: string }`

### Usage
Include in Authorization header:
```
Authorization: Bearer <token>
```

---

*Last Updated: December 2025*
