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

## Tasks & Comments

Comments are embedded right inside tasks. We did it this way because you never really need comments without the task they belong to.

```javascript
// Add one
Task.findByIdAndUpdate(taskId, {
  $push: { comments: newComment }
})

// Remove one
Task.findByIdAndUpdate(taskId, {
  $pull: { comments: { _id: commentId } }
})
```

---

## Notifications

Stored in the Logs collection. Nothing fancy.

```javascript
// Get recent notifications
Log.find({ userAssigned: userId })
  .sort({ createdAt: -1 })
  .limit(20)

// How many unread?
Log.countDocuments({ userAssigned: userId, isRead: false })

// Mark all read
Log.updateMany(
  { userAssigned: userId, isRead: false },
  { isRead: true }
)
```

## Sessions

Track who's logged in where.

```javascript
// All sessions for someone
Session.find({ userId: userId.toString() })

// Check if token works
Session.findOne({ token: authToken })

// Logout everywhere
Session.deleteMany({ userId: userId.toString() })
```
## Cleaning Up When Deleting Stuff

### When you delete a project:

```javascript
await Task.deleteMany({ projectId: project._id });
await Invite.deleteMany({ projectId: project._id });
await Log.deleteMany({ projectId: project._id });
await Project.findByIdAndDelete(projectId);
```

### When you delete a user:

```javascript
await Session.deleteMany({ userId: user._id.toString() });
await Log.deleteMany({ userAssigned: user._id });
await Project.updateMany(
  { 'members.id': user._id },
  { $pull: { members: { id: user._id } } }
);
await Task.updateMany(
  { assignedTo: user._id },
  { assignedTo: null }
);
await User.findByIdAndDelete(userId);
```

Don't forget to handle their owned projects first though.

---
## Why Embedded vs Referenced?

| Data                           | How                 | Why |
|--------------------------------|---------------------|-----|
| Members                        | Embedded in Project | Few of them, always need them together |
| Comments                       | Embedded in Task    | Never query them alone |
| Tasks                          | Separate collection | Could be thousands, need to filter/paginate |
| Notifications                  | Separate collection | Paginated, queried on their own |
| Sessions                       | Separate collection | Checked constantly for auth |

---

## Member Operations (Atomic)

```javascript
// Add someone
await Project.findByIdAndUpdate(projectId, {
  $addToSet: { members: { id: userId, role: 'member' } }
});

// Change their role
await Project.findOneAndUpdate(
  { _id: projectId, 'members.id': userId },
  { $set: { 'members.$.role': newRole } }
);

// Remove them
await Project.findByIdAndUpdate(projectId, {
  $pull: { members: { id: userId } }
});
```
