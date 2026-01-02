## Overview

```
Users ──────┬──► owns Projects ──┬──► Tasks (comments live inside)
            │                    ├──► Invites (expire after 30 days)
            └──► member of ──────┘
                                 └──► Logs (notifications)

Users also have:
├── Sessions (login tokens 30-day expiry)
├── Codes (verification stuff expires in 10min)
└── TempUsers (people who haven t verified email yet)
```
---

## How Things Connect

| From    | To            | Type         | Field             |
|---------|---------------|--------------|-------------------|
| User    | Projects      | One-to-Many  | `ownedBy`         |
| User    | Projects      | Many-to-Many | `members[]` array |
| Project | Tasks         | One-to-Many  | `projectId`       |
| User    | Tasks         | One-to-Many  | `assignedTo`      |
| Task    | Comments      | One-to-Many  | embedded in task  |
| User    | Notifications | One-to-Many  | `userAssigned`    |
| User    | Sessions      | One-to-Many  | `userId`          |
| Project | Invites       | One-to-Many  | `projectId`       |
