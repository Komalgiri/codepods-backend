import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    keyGenerator: (req) => ipKeyGenerator(req), // ✅ IPv6-safe
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 5 minutes per Email (or fallback to IP)
 */
export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5,
    keyGenerator: (req) => {
        const email = req.body?.email?.toLowerCase().trim();

        // Prefer user identity over IP
        if (email) {
            return `email:${email}`;
        }

        // Fallback to IPv6-safe IP key
        return ipKeyGenerator(req);
    },
    message: {
        error: 'Too many login attempts. Please try again after 5 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't penalize successful logins
});

/**
 * Rate limiter for GitHub sync operations
 * 10 requests per hour per IP
 */
export const syncLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    keyGenerator: (req) => ipKeyGenerator(req),
    message: {
        error: 'Too many sync requests. Please wait before syncing again.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for AI operations (expensive endpoints)
 * 20 requests per hour per IP
 */
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    keyGenerator: (req) => ipKeyGenerator(req),
    message: {
        error: 'Too many AI requests. Please wait before generating more roadmaps.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for search operations
 * 30 requests per minute per IP
 */
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    keyGenerator: (req) => ipKeyGenerator(req),
    message: {
        error: 'Too many search requests. Please slow down.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
