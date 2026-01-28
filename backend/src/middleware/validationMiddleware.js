import { body, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 * If validation fails, returns 400 with error details
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: "Validation failed",
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Password strength regex:
 * At least 8 characters
 * At least 1 lowercase
 * At least 1 uppercase
 * At least 1 number
 * At least 1 special character
 */
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateSignup = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Invalid email address')
        .normalizeEmail(),

    body('password')
        .matches(STRONG_PASSWORD_REGEX)
        .withMessage('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character (@$!%*?&)')
        .notEmpty(),

    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .escape(), // Prevent XSS

    handleValidationErrors
];

export const validateLogin = [
    body('email').trim().isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

export const validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .escape(),

    body('githubUsername')
        .optional()
        .trim()
        .matches(/^[a-zA-Z0-9-]+$/)
        .withMessage('Invalid GitHub username format')
        .escape(),

    handleValidationErrors
];

export const validateCreatePod = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Pod name must be between 3 and 50 characters')
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
        .escape(),

    handleValidationErrors
];

export const validateCreateTask = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({ max: 100 })
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
        .escape(),

    // Due date validation (optional)
    body('dueAt')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format')
        .toDate(),

    handleValidationErrors
];
