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