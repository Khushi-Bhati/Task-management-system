import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validate = (req: Request, _res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((err) => ({
            field: err.type === 'field' ? (err as { path: string }).path : 'general',
            message: err.msg,
        }));
        return next(new ValidationError('Validation failed', formattedErrors));
    }
    next();
};
