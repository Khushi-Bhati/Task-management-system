import { body } from 'express-validator';

export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

export const refreshValidation = [
    body('refreshToken')
        .notEmpty().withMessage('Refresh token is required'),
];

export const createTaskValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Task title is required')
        .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),

    body('status')
        .optional()
        .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Status must be PENDING, IN_PROGRESS, or COMPLETED'),

    body('priority')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be LOW, MEDIUM, or HIGH'),

    body('dueDate')
        .optional()
        .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
];

export const updateTaskValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),

    body('status')
        .optional()
        .isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']).withMessage('Status must be PENDING, IN_PROGRESS, or COMPLETED'),

    body('priority')
        .optional()
        .isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Priority must be LOW, MEDIUM, or HIGH'),

    body('dueDate')
        .optional()
        .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
];
