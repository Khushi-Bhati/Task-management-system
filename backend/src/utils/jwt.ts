import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { UnauthorizedError } from './errors';

export interface TokenPayload {
    userId: string;
    email: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

/**
 * Generate a short-lived Access Token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not defined');

    return jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    } as jwt.SignOptions);
};

/**
 * Generate a long-lived Refresh Token (UUID stored in DB)
 */
export const generateRefreshToken = async (userId: string): Promise<string> => {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
        data: {
            token,
            userId,
            expiresAt,
        },
    });

    return token;
};

/**
 * Verify an Access Token and return the payload
 */
export const verifyAccessToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) throw new Error('JWT_ACCESS_SECRET is not defined');

    try {
        const decoded = jwt.verify(token, secret) as TokenPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Access token has expired');
        }
        throw new UnauthorizedError('Invalid access token');
    }
};

/**
 * Verify a Refresh Token by checking the DB
 */
export const verifyRefreshToken = async (token: string) => {
    const refreshToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
    });

    if (!refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
        // Clean up expired token
        await prisma.refreshToken.delete({ where: { token } });
        throw new UnauthorizedError('Refresh token has expired');
    }

    return refreshToken;
};

/**
 * Rotate Refresh Token (delete old, create new)
 */
export const rotateRefreshToken = async (oldToken: string, userId: string): Promise<string> => {
    // Delete the old refresh token
    await prisma.refreshToken.delete({ where: { token: oldToken } });
    // Create a new one
    return generateRefreshToken(userId);
};

/**
 * Remove all refresh tokens for a user (logout everywhere)
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
    await prisma.refreshToken.deleteMany({ where: { userId } });
};
