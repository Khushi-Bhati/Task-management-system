import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '../utils/errors';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

const VALID_STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const VALID_PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

/**
 * GET /api/tasks
 * Supports: pagination, status filter, search by title
 */
export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new UnauthorizedError();

        // Pagination
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
        const skip = (page - 1) * limit;

        // Filtering & searching
        const status = req.query.status as TaskStatus | undefined;
        const priority = req.query.priority as Priority | undefined;
        const search = req.query.search as string | undefined;
        const sortBy = (req.query.sortBy as string) || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

        // Build where clause
        const where = {
            userId,
            ...(status && (VALID_STATUSES as string[]).includes(status) && { status }),
            ...(priority && (VALID_PRIORITIES as string[]).includes(priority) && { priority }),
            ...(search && {
                title: {
                    contains: search,
                },
            }),
        };

        // Valid sort fields
        const validSortFields = ['createdAt', 'updatedAt', 'title', 'dueDate', 'priority', 'status'];
        const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

        const [tasks, total] = await prisma.$transaction([
            prisma.task.findMany({
                where,
                orderBy: { [orderByField]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.task.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                tasks,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/tasks
 */
export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new UnauthorizedError();

        const { title, description, status, priority, dueDate } = req.body;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: status || 'PENDING',
                priority: priority || 'MEDIUM',
                dueDate: dueDate ? new Date(dueDate) : null,
                userId,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully.',
            data: { task },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/tasks/:id
 */
export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new UnauthorizedError();

        const { id } = req.params;

        const task = await prisma.task.findUnique({ where: { id } });

        if (!task) throw new NotFoundError('Task not found.');
        if (task.userId !== userId) throw new ForbiddenError('You do not have permission to access this task.');

        res.json({ success: true, data: { task } });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/tasks/:id
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new UnauthorizedError();

        const { id } = req.params;
        const { title, description, status, priority, dueDate } = req.body;

        // Ensure task exists and belongs to user
        const existingTask = await prisma.task.findUnique({ where: { id } });
        if (!existingTask) throw new NotFoundError('Task not found.');
        if (existingTask.userId !== userId) throw new ForbiddenError('You do not have permission to modify this task.');

        const task = await prisma.task.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(status !== undefined && { status }),
                ...(priority !== undefined && { priority }),
                ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
            },
        });

        res.json({
            success: true,
            message: 'Task updated successfully.',
            data: { task },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new UnauthorizedError();

        const { id } = req.params;

        const existingTask = await prisma.task.findUnique({ where: { id } });
        if (!existingTask) throw new NotFoundError('Task not found.');
        if (existingTask.userId !== userId) throw new ForbiddenError('You do not have permission to delete this task.');

        await prisma.task.delete({ where: { id } });

        res.json({
            success: true,
            message: 'Task deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/tasks/:id/toggle
 * Cycles: PENDING -> IN_PROGRESS -> COMPLETED -> PENDING
 */
export const toggleTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) throw new UnauthorizedError();

        const { id } = req.params;

        const existingTask = await prisma.task.findUnique({ where: { id } });
        if (!existingTask) throw new NotFoundError('Task not found.');
        if (existingTask.userId !== userId) throw new ForbiddenError('You do not have permission to modify this task.');

        // Status cycle map
        const statusCycle: Record<TaskStatus, TaskStatus> = {
            PENDING: 'IN_PROGRESS',
            IN_PROGRESS: 'COMPLETED',
            COMPLETED: 'PENDING',
        };

        const newStatus = statusCycle[existingTask.status as TaskStatus] ?? 'IN_PROGRESS';

        const task = await prisma.task.update({
            where: { id },
            data: { status: newStatus },
        });

        res.json({
            success: true,
            message: `Task status changed to ${newStatus}.`,
            data: { task },
        });
    } catch (error) {
        next(error);
    }
};
