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


