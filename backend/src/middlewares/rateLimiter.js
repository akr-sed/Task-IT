import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Compute a sane retry-after value even if resetTime is missing
const getRetryAfterSeconds = (req, fallbackSeconds) => {
  const resetTime = req.rateLimit?.resetTime;
  if (resetTime instanceof Date) {
    const diffMs = resetTime.getTime() - Date.now();
    return Math.max(1, Math.ceil(diffMs / 1000));
  }

  const windowMs = req.rateLimit?.windowMs;
  if (typeof windowMs === "number") {
    return Math.max(1, Math.ceil(windowMs / 1000));
  }

  return fallbackSeconds;
};

const buildLimiter = ({ windowMs, max, message, fallbackSeconds, skip, keyGenerator }) =>
  rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skip,
    keyGenerator,
    handler: (req, res) => {
      const retryAfter = getRetryAfterSeconds(req, fallbackSeconds);

      res.status(429).json({
        message,
        retryAfter,
      });
    },
  });

// Login rate limiter - 5 attempts per 15 minutes
export const loginLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
  fallbackSeconds: 15 * 60,
});

// Signup rate limiter - 8 signups per hour
export const signupLimiter = buildLimiter({
  skip: (req) => req.method == "OPTIONS",
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: "Too many signup attempts. Please try again after 1 hour.",
  fallbackSeconds: 60 * 60,
  keyGenerator: (req) => {
  const normalizedIP = ipKeyGenerator(req);
  return `${normalizedIP}-${req.body?.email || "unknown"}`;
}

});

// Password reset request limiter - 3 requests per hour
export const passwordResetRequestLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many password reset requests. Please try again after 1 hour.",
  fallbackSeconds: 60 * 60,
});

// Password reset verification limiter - 5 attempts per 15 minutes
export const passwordResetVerifyLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many verification attempts. Please try again after 15 minutes.",
  fallbackSeconds: 15 * 60,
});

// Email verification limiter - 10 attempts per hour
export const emailVerificationLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many verification attempts. Please try again after 1 hour.",
  fallbackSeconds: 60 * 60,
});

// General API limiter - 100 requests per 15 minutes (for general protection)
export const generalLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:
    "Too many requests. Please slow down and try again after 15 minutes.",
  fallbackSeconds: 15 * 60,
});

// Password change limiter - 3 changes per hour (for authenticated users)
export const passwordChangeLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many password change attempts. Please try again after 1 hour.",
  fallbackSeconds: 60 * 60,
});

// Email change limiter - 3 changes per day
export const emailChangeLimiter = buildLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 3,
  message: "Too many email change requests. Please try again after 24 hours.",
  fallbackSeconds: 24 * 60 * 60,
});
