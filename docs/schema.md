# Database Schema

mongo + mongoose.


## Users collection.
----> stores verified user accounts. <----

Fields.           | Type.    | Description.
_id.              | ObjectId.| unique identifier for each record, auto-generated.
name.             | string.  | 3-50 chars.
email.            | string.  | unique email address for the user.
passwordHash.     | string.  | securely hashed user password, bcrypt.
resetToken.       | string.  | temporary token for password reset verification, pwd reset.
resetTokenExpiry. | date.    | when the password reset was requested.
createdAt.        | date.    | when the record was created.
**indexes:** email: faster searches, prevents duplicate emails.

**validation criterias:**
- name: spaces removed from edges, must contain 3-50 chars.
- email: must be  a valid email format.
- password: must at least contain 8 characters before its encryption.

**notes:**
- pre-save hook: automatically hashes the password before saving.

- strict mode: only defined fields are allowed. unknown fields will cause an error.


## Projects collection.
----> stores projects with owner, members, and roles. <----

Fields.      | Type.     | Descriptions.
_id.         | ObjectId. | unique.
name.        | string.   | unique.
displayName  | string.   | human-readable name for the display purposes.
description. | string.   | brief summary of the record.
ownedBy.     | ObjectId. | reference to the user who owns this record.
createdBy.   | ObjectId. | reference to the user who created this record.
members.     | array.    | list of associated user or items.
createdAt.   | date.     | date when the record was created.


**refs:**
- here in this case the ownedBy points to users.
- here in this case the createBy points to users.
- members[].id points to users


**indexes:** name: prevents duplicate project names, faster lookups.


**notes:**
- members: { id : ObjectId , role: 'admin' | 'member'}.
- owner is not included in members so check both for permissions.


## Tasks collection.
----> stores tasks linked to projects with status, priority, and comments. <----

**priority:** low / medium / high (medium is default)

Fields.      | Type.     | Descriptions.
_id.         | ObjectId. | unique.
projectId.   | ObjectId. | required as refs.
activity.    | string.   | activity label for the task.
title.       | string.   | task title, required.
description. | string.   | details about the task.
assignedTo.  | ObjectId. | reference to the user assigned to this task.
status.      | string.   | current state.
priority.    | string.   | task priority.
dueDate.     | date.     | deadline for the task.
createdAt.   | date.     | the date when created.
comments.    | array.    | list of comments on the task.

**notes:**
- every task belongs to one project.
- task can be assigned to one user or no one.
- here the comments are embedded inside the tasks.
    **why embedded?**
      - always loaded with tasks, avoid extra queries.
      - tasks won t have thousands of comments, so document size is fine.
- you can t search comments across tasks.
- no editing, you can only delete and repost instead.
-comments: [{
  _id: ObjectId,
  authorId: ObjectId,  // user ref
  text: String,
  createdAt: Date
}].

**status cases:**
- todo."default".
- in progress.
- done.
- to review.

**priority cases:** 
- low.
- medium."default".
- high.


## logs collection.
----> stores notifications and acitivity logs for users. <----

Fields.         | Type.     | Descriptions.
_id.            | ObjectId. | unique.
title.          | string.   | required.
content.        | string.   | required.
type.           | string.   | notification category, see types below. default: genereal.
userAssigned.   | ObjectId. | reference to the user receiving  the notification.
userCreated.    | ObjectId. | reference to the user who triggered the notification.
projectId.      | ObjectId. | reference to the related project. 
taskId.         | ObjectId. | reference to the related task.
prioriy.        | string.   | with different values.
isRead.         | boolean.  | wether the notification has been read, its default value is false.
link.           | string.   | url for navigation based on type and context.
createdAt.      | date.     | the date when this notification was created.

**task stuffs:**

- task_created.
- task_assigned.
- task_status_changed.
- task_ edited.
- task_deleted. 
- task_comment.

**project stuffs:**
- project_invite_sent.
- project_invite_accepted.
- project_invite_declined.
- project_member_removed.
- project_role_updated.
- project_ownership_transferred.
- project_edited.
- project_deleted.

**notes:**

- just using isRead boolean (default false). we dont track delivered vs sent vs whatever - if its in the db its delivered. isRead is for the unread badge in UI.
- link is computed based on type , projectId and taskeId.

**indexes:**
- notification_dedup_index : compound index on userAssigned , type , taskId , projectId , createdAtt. it is used to prevent duplicate notifications.


## codes collections.
----> temporary verification codes for signup, password, reset,ect. " auto-deletes after ten minutes". <----

Fields.    | Type.     | Descriptions.
_id.       | ObjectId. | unique.
userId.    | string.   | reference to the user this code belongs to.
code.      | number.   | verfication code, required. 
type.      | string.   | purpose: password , register , delete , email.
createdAt. | date.     | the date when this record was created, auto-expires after 10 mins.
note.      | string.   | optinal extra info.

**validations:**
- code is required.
- type can only be password, register, delete or email.

**strict mode:**
- ON, unknown fields will throw an error.

**notes:**
- codes are temporary and auto-deleted after ten minutes.
- it is used for secure user verification flows.


## invites collections.
----> stores pending project invitations "auto-deletes after 30 dsay". <----

Fields.        | Type.     | Descriptions.
_id.           | ObjectId. | unique. 
projectId.     | ObjectId. | reference to the project, required.
invitedUserId. | ObjectId. | reference to the invited user " if he has an account". 
invitedEmail.  | string.   | email of the invited person " if he hasnt an account yet" .
invitedBy.     | ObjectId. | reference to the user who sent the invite, required.
inviteCode.    | string.   | unique code to accept the invitation, requried.
createdAt.     | date.     | the date when this record was created, auto-expires after 30 days.

**validation:**
- projectId , invitedBy , inviteCode are required.
- either invitedUswerId or invitedEmail must be provided.
**strict mode:**
- ON, unknown filds will throw an error.

**notes:**
- supports inviting existing users or new users by email.
- invites expire after 30 days if not accepted.


## tempusers collection.
----> contains unverified signups until email verification "auto-deletes after ten mins". <----
Fields.       | Type.     | Descriptions.
_id.          | ObjectId. | unique.
name.         | string.   | required.
email.        | string.   | required, unique.
passwordHash. | string.   | hashed password, auto-hashed on save, required.
createdAt.    | date.     | the date when this record was created.

**indexes:**
- email: prevents duplicate signups.

**validations:**
- name : required, 3 - 50 chars.
- email : required, must match the email format.
- passwordHash : required.

**strict mode:**
- ON, unknown fields will throw an error.

**notes:**
- password is hashed automatically before saving.
- temporary storage for unverified signups.
- auto-delete after ten minutes if not verified.

