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

---

## Users & Projects

People can own projects or just be members. We keep members as an array inside the project doc since there's usually not that many and we always need them together.

```javascript
// Get all projects someone can access
Project.find({
  $or: [
    { ownedBy: userId },
    { 'members.id': userId }
  ]
})

// Add project with member details
Project.findById(projectId).populate('members.id', 'name email')
```
---

## Projects & Tasks

Pretty straightforward - tasks belong to projects.

```javascript
// All tasks in a project
Task.find({ projectId })

// With filters
Task.find({ 
  projectId,
  status: 'in progress',
  assignedTo: userId
})
```

---

