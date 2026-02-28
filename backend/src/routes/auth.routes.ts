import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
    registerValidation,
    loginValidation,
    refreshValidation,
} from '../validators';

const router = Router();

// POST /api/auth/register
router.post('/register', registerValidation, validate, register);

// POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// POST /api/auth/refresh
router.post('/refresh', refreshValidation, validate, refresh);

// POST /api/auth/logout (requires auth)
router.post('/logout', authenticate, logout);

// GET /api/auth/me (requires auth)
router.get('/me', authenticate, getMe);

export default router;
