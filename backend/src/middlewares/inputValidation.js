import { body, validationResult } from "express-validator";

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({ message: messages.join(", ") });
  }
  next();
};

// Signup validation rules
export const validateSignup = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Name can only contain letters, spaces, hyphens, and apostrophes"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    // relax this for now # CHANGE LATER
    // .matches(/[A-Z]/)
    // .withMessage("Password must contain at least one uppercase letter")
    // .matches(/[a-z]/)
    // .withMessage("Password must contain at least one lowercase letter")
    // .matches(/[0-9]/)
    // .withMessage("Password must contain at least one number")
    // .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    // .withMessage("Password must contain at least one special character (!@#$%^&* etc."),
];

// Login validation rules
export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),
];

// Email verification validation rules
export const validateEmailVerification = [
  body("tempUserId")
    .trim()
    .notEmpty()
    .withMessage("Temporary user ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),

  body("verificationCode")
    .trim()
    .notEmpty()
    .withMessage("Verification code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits")
    .isNumeric()
    .withMessage("Verification code must contain only numbers"),
];

// Password reset request validation rules
export const validatePasswordResetRequest = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),
];

// Reset code verification validation rules
export const validateResetCodeVerification = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),

  body("resetCode")
    .trim()
    .notEmpty()
    .withMessage("Reset code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be 6 digits")
    .isNumeric()
    .withMessage("Reset code must contain only numbers"),
];

// Set new password validation rules
export const validateSetNewPassword = [
  body("userId")
    .trim()
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid user ID format"),

  body("resetToken")
    .trim()
    .notEmpty()
    .withMessage("Reset token is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    // relax this for now CHANGE LATER
    // .matches(/[A-Z]/)
    // .withMessage("Password must contain at least one uppercase letter")
    // .matches(/[a-z]/)
    // .withMessage("Password must contain at least one lowercase letter")
    // .matches(/[0-9]/)
    // .withMessage("Password must contain at least one number")
    // .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    // .withMessage("Password must contain at least one special character (!@#$%^&* etc."),
];

// Change password validation rules
export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    // relax this for now CHANGE LATER
    // .matches(/[A-Z]/)
    // .withMessage("Password must contain at least one uppercase letter")
    // .matches(/[a-z]/)
    // .withMessage("Password must contain at least one lowercase letter")
    // .matches(/[0-9]/)
    // .withMessage("Password must contain at least one number")
    // .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    // .withMessage("Password must contain at least one special character (!@#$%^&* etc.")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),
];

// Profile update validation rules
export const validateProfileUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Name can only contain letters, spaces, hyphens, and apostrophes"),
];

// Email change request validation rules
export const validateEmailChangeRequest = [
  body("newEmail")
    .trim()
    .notEmpty()
    .withMessage("New email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .toLowerCase(),
];

// Email change verification validation rules
export const validateEmailChangeVerification = [
  body("verificationCode")
    .trim()
    .notEmpty()
    .withMessage("Verification code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits")
    .isNumeric()
    .withMessage("Verification code must contain only numbers"),
];

// Account deletion verification validation rules
export const validateAccountDeletion = [
  body("verificationCode")
    .trim()
    .notEmpty()
    .withMessage("Verification code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits")
    .isNumeric()
    .withMessage("Verification code must contain only numbers"),
];
