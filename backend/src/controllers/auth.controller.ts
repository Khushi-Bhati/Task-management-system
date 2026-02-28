import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    rotateRefreshToken,
    revokeAllUserTokens,
} from '../utils/jwt';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';

const SALT_ROUNDS = 12;

/**
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictError('An account with this email already exists.');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
            select: { id: true, name: true, email: true, createdAt: true },
        });

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = await generateRefreshToken(user.id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully.',
            data: { user, accessToken, refreshToken },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Use same message for security (don't reveal if email exists)
            throw new UnauthorizedError('Invalid email or password.');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid email or password.');
        }

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id, email: user.email });
        const refreshToken = await generateRefreshToken(user.id);

        res.json({
            success: true,
            message: 'Logged in successfully.',
            data: {
                user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/refresh
 */
export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        // Validate the refresh token (checks DB + expiry)
        const tokenRecord = await verifyRefreshToken(refreshToken);

        // Rotate: delete old token, issue new one
        const newRefreshToken = await rotateRefreshToken(refreshToken, tokenRecord.userId);

        // Issue new access token
        const newAccessToken = generateAccessToken({
            userId: tokenRecord.user.id,
            email: tokenRecord.user.email,
        });

        res.json({
            success: true,
            message: 'Tokens refreshed successfully.',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError('Not authenticated.');
        }

        // Revoke all refresh tokens for this user
        await revokeAllUserTokens(userId);

        res.json({
            success: true,
            message: 'Logged out successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError('Not authenticated.');
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
        });

        if (!user) {
            throw new NotFoundError('User not found.');
        }

        res.json({ success: true, data: { user } });
    } catch (error) {
        next(error);
    }
};
