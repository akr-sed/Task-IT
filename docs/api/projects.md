# 📁 Projects API

Base URL: `/api/projects`

## Overview

The Projects API handles project creation, management, member invitations, role assignments, and ownership transfers.

---

## Endpoints

### Get All Projects

#### `GET /`

Fetch all projects where the authenticated user is owner or member.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "projects": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "project-alpha",
      "displayName": "Project Alpha",
      "description": "Main project for the team",
      "ownedBy": "507f1f77bcf86cd799439001",
      "members": [
        {
          "id": "507f1f77bcf86cd799439002",
          "role": "admin"
        },
        {
          "id": "507f1f77bcf86cd799439003",
          "role": "member"
        }
      ],
      "createdAt": "2024-12-25T10:30:00.000Z"
    }
  ]
}
```

---

### Get Project by ID

#### `GET /:projectId`

Get detailed information about a specific project.

**Authorization:** Required (Bearer Token)

**Permissions:** Member, Admin, or Owner

**Response (200 OK):**
```json
{
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "project-alpha",
    "displayName": "Project Alpha",
    "description": "Main project for the team",
    "ownedBy": "507f1f77bcf86cd799439001",
    "createdBy": "507f1f77bcf86cd799439001",
    "members": [
      {
        "id": "507f1f77bcf86cd799439002",
        "role": "admin"
      }
    ],
    "createdAt": "2024-12-25T10:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 403 | "You do not have access to this project" |
| 404 | "Project not found" |

---

### Create Project

#### `POST /`

Create a new project. The authenticated user becomes the owner.

**Authorization:** Required (Bearer Token)

**Request Body:**
```json
{
  "name": "project-alpha",
  "displayName": "Project Alpha",
  "description": "Main project for the team"
}
```

**Validation:**
| Field | Rules |
|-------|-------|
| name | Required, unique across all projects |
| displayName | Optional |
| description | Optional |

**Response (201 Created):**
```json
{
  "message": "Project created successfully",
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "project-alpha",
    "displayName": "Project Alpha",
    "description": "Main project for the team",
    "ownedBy": "507f1f77bcf86cd799439001",
    "createdBy": "507f1f77bcf86cd799439001",
    "members": [],
    "createdAt": "2024-12-25T10:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Project name is required" |
| 400 | "Project name already exists" |

---

### Edit Project

#### `PUT /:projectId`

Update project details.

**Authorization:** Required (Bearer Token)

**Permissions:** Admin or Owner (Level 2+)

**Request Body:**
```json
{
  "name": "project-alpha-v2",
  "displayName": "Project Alpha v2",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "message": "Project updated successfully",
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "project-alpha-v2",
    "displayName": "Project Alpha v2",
    "description": "Updated description",
    "ownedBy": "507f1f77bcf86cd799439001",
    "members": [],
    "createdAt": "2024-12-25T10:30:00.000Z"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Nothing to update" |
| 400 | "Project name already exists" |
| 403 | "You do not have permission to edit this project" |

**Notifications Triggered:**
- All project members receive "Project Updated" notification

---

### Delete Project

#### `DELETE /:projectId`

Permanently delete a project and all associated data.

**Authorization:** Required (Bearer Token)

**Permissions:** Owner only (Level 3)

**Request Body:**
```json
{
  "password": "userPassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Invalid password" |
| 403 | "You do not have permission to delete this project" |

**Cleanup Actions:**
- Delete all project tasks
- Delete all pending invitations
- Notify all former members

**Notifications Triggered:**
- All former members receive "Project Deleted" notification

---

### Invite User

#### `POST /:projectId/invite`

Invite a user to join the project via email.

**Authorization:** Required (Bearer Token)

**Permissions:** Owner only (Level 3)

**Request Body:**
```json
{
  "email": "newuser@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Invitation sent successfully"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Email must be provided for invitation" |
| 400 | "Invalid email format" |
| 400 | "You cannot send an invite to yourself" |
| 400 | "User is already a member of this project" |
| 400 | "An invitation has already been sent to this email" |
| 403 | "You don't have permission to invite users to this project" |

**Email Sent:**
- Invitation email with unique link to accept/decline

**Notifications Triggered:**
- Invited user receives "Project Invitation" notification (if registered)

---

### Get Invitation Details

#### `GET /:projectId/invite/:inviteId`

Get details about a project invitation (public - no auth required for preview).

**Authorization:** Not required

**Response (200 OK):**
```json
{
  "invitation": {
    "id": "507f1f77bcf86cd799439021",
    "projectId": "507f1f77bcf86cd799439011",
    "projectName": "Project Alpha",
    "inviterName": "John Doe",
    "inviterId": "507f1f77bcf86cd799439001",
    "invitedEmail": "newuser@example.com",
    "invitedUserId": "507f1f77bcf86cd799439005"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Invitation ID is required" |
| 404 | "Invitation not found or expired" |
| 404 | "Project no longer exists" |

---

### Accept Invitation

#### `POST /:projectId/invite/:inviteId/:inviteCode`

Accept a project invitation and join the project.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "message": "Invitation accepted successfully",
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "project-alpha",
    "displayName": "Project Alpha",
    "members": [
      {
        "id": "507f1f77bcf86cd799439005",
        "role": "member"
      }
    ]
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Invalid invite link" |
| 400 | "Invalid invite code" |
| 400 | "You are already a member of this project" |
| 403 | "This invitation is not for your account" |
| 403 | "This invitation is for a different email address" |
| 404 | "Invitation not found" |
| 404 | "Project not found" |

**Notifications Triggered:**
- Project owner and admins receive "New Team Member Joined" notification

---

### Decline Invitation

#### `POST /:projectId/invite/:inviteId/:inviteCode/decline`

Decline a project invitation.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "message": "You have successfully declined the invitation to Project Alpha",
  "project": {
    "id": "507f1f77bcf86cd799439011",
    "name": "project-alpha"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Invalid invitation details" |
| 400 | "Invalid invite code" |
| 403 | "You are not authorized to decline this invitation" |
| 404 | "Invitation not found or already expired" |
| 404 | "Project no longer exists" |

**Notifications Triggered:**
- Inviter receives "Invitation Declined" notification

---

### Get My Invitations

#### `GET /fetch-invites`

Get all pending invitations for the authenticated user.

**Authorization:** Required (Bearer Token)

**Response (200 OK):**
```json
{
  "invitations": [
    {
      "_id": "507f1f77bcf86cd799439021",
      "projectId": "507f1f77bcf86cd799439011",
      "invitedBy": "507f1f77bcf86cd799439001",
      "invitedEmail": "user@example.com",
      "invitedUserId": "507f1f77bcf86cd799439005",
      "inviteCode": "abc123def456"
    }
  ],
  "projectNames": {
    "507f1f77bcf86cd799439011": "Project Alpha"
  },
  "invitorNames": {
    "507f1f77bcf86cd799439021": "John Doe"
  },
  "invitorEmails": {
    "507f1f77bcf86cd799439021": "john@example.com"
  }
}
```

---

### Update Member Role

#### `PUT /:projectId/members/:memberId/role`

Change a member's role in the project.

**Authorization:** Required (Bearer Token)

**Permissions:** Owner only (Level 3)

**Request Body:**
```json
{
  "role": "admin"
}
```

**Allowed Roles:** `"admin"`, `"member"`

**Response (200 OK):**
```json
{
  "message": "Member role updated successfully",
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "members": [
      {
        "id": "507f1f77bcf86cd799439002",
        "role": "admin"
      }
    ]
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 403 | "You do not have permission to update member roles" |
| 404 | "Member not found in this project" |

**Notifications Triggered:**
- Affected member receives "Your Role Updated" notification
- Other admins receive "Member Role Updated" notification

---

### Remove Member

#### `DELETE /:projectId/:userId/delete`

Remove a member from the project.

**Authorization:** Required (Bearer Token)

**Permissions:** Admin or Owner (Level 2+)

**Response (200 OK):**
```json
{
  "message": "Member removed successfully",
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "members": []
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "User ID is required" |
| 403 | "You do not have permission to remove members from this project" |
| 404 | "Member not found in this project" |

**Notifications Triggered:**
- Removed member receives "Removed from Project" notification
- Admins receive "Member Removed" notification

---

### Transfer Ownership

#### `PUT /:projectId/transfer-owner`

Transfer project ownership to another member.

**Authorization:** Required (Bearer Token)

**Permissions:** Owner only (Level 3)

**Request Body:**
```json
{
  "newOwnerId": "507f1f77bcf86cd799439002",
  "password": "currentOwnerPassword"
}
```

**Response (200 OK):**
```json
{
  "message": "Project ownership transferred successfully",
  "project": {
    "_id": "507f1f77bcf86cd799439011",
    "ownedBy": "507f1f77bcf86cd799439002",
    "members": [
      {
        "id": "507f1f77bcf86cd799439001",
        "role": "admin"
      }
    ]
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| 400 | "Invalid password" |
| 403 | "You do not have permission to transfer ownership" |
| 404 | "New owner must be a member of the project" |

**Actions:**
- New owner is removed from members array (owners aren't in members)
- Previous owner is added to members as admin

**Notifications Triggered:**
- New owner receives "You're Now the Project Owner" notification
- All members receive "Project Ownership Changed" notification

---

## Permission Levels

| Level | Role | Access |
|-------|------|--------|
| 0 | Non-member | No access |
| 1 | Member | View project, update assigned task status |
| 2 | Admin | Create/edit/delete tasks, remove members |
| 3 | Owner | All permissions + delete project, invite, manage roles, transfer ownership |

---

*Last Updated: December 2025*
