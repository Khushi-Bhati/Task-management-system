import { Router } from 'express';
import {
    getTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTaskValidation, updateTaskValidation } from '../validators';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET /api/tasks       - list tasks with pagination, filter, search
// POST /api/tasks      - create a new task
router
    .route('/')
    .get(getTasks)
    .post(createTaskValidation, validate, createTask);

// GET    /api/tasks/:id  - get single task
// PATCH  /api/tasks/:id  - update task
// DELETE /api/tasks/:id  - delete task
router
    .route('/:id')
    .get(getTask)
    .patch(updateTaskValidation, validate, updateTask)
    .delete(deleteTask);

// PATCH /api/tasks/:id/toggle - toggle task status
router.patch('/:id/toggle', toggleTaskStatus);

export default router;
