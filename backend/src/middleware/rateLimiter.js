import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Skip rate limiting for successful requests to avoid penalizing normal usage
    skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 5 minutes per User Email (or IP)
 */
export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 5, // Limit to 5 attempts per windowMs
    keyGenerator: (req) => {
        // Use normalized email as key if present (for "per user ID" limiting), otherwise fall back to IP
        const email = req.body && req.body.email ? String(req.body.email).toLowerCase().trim() : req.ip;
        return email;
    },
    message: {
        error: 'Too many login attempts. Please try again after 5 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins/signups
});

/**
 * Rate limiter for GitHub sync operations
 * 10 requests per hour per IP
 */
export const syncLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 sync requests per hour
    message: {
        error: 'Too many sync requests. Please wait before syncing again.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for AI operations (expensive)
 * 20 requests per hour per IP
 */
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 AI requests per hour
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
    max: 30, // Limit each IP to 30 search requests per minute
    message: {
        error: 'Too many search requests. Please slow down.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
