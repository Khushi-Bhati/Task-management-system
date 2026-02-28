'use client';
import { useState } from 'react';
import { Task } from '../types';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import styles from './TaskCard.module.css';

const STATUS_MAP = {
    PENDING: { label: 'Pending', cls: 'badge-pending', icon: '⏳' },
    IN_PROGRESS: { label: 'In Progress', cls: 'badge-progress', icon: '🔄' },
    COMPLETED: { label: 'Completed', cls: 'badge-completed', icon: '✅' },
};

const PRIORITY_MAP = {
    LOW: { label: 'Low', cls: 'badge-low', dot: '#6ee7b7' },
    MEDIUM: { label: 'Medium', cls: 'badge-medium', dot: '#fcd34d' },
    HIGH: { label: 'High', cls: 'badge-high', dot: '#fca5a5' },
};

interface Props {
    task: Task;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggle }: Props) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    const status = STATUS_MAP[task.status] || STATUS_MAP.PENDING;
    const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM;

    const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'COMPLETED';

    const handleDelete = () => {
        if (confirmDelete) {
            onDelete();
        } else {
            setConfirmDelete(true);
            setTimeout(() => setConfirmDelete(false), 3000);
        }
    };

    return (
        <div className={`${styles.card} ${task.status === 'COMPLETED' ? styles.completed : ''}`}>
            {/* ─── Card Header ─── */}
            <div className={styles.header}>
                <div className={styles.badges}>
                    <span className={`badge ${status.cls}`}>
                        {status.icon} {status.label}
                    </span>
                    <span className={`badge ${priority.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: priority.dot, display: 'inline-block' }} />
                        {priority.label}
                    </span>
                </div>
                <div className={styles.actions}>
                    <button
                        id={`toggle-${task.id}`}
                        className={'btn btn-ghost btn-icon ' + styles.actionBtn}
                        onClick={onToggle}
                        title="Toggle status"
                    >
                        {task.status === 'COMPLETED' ? '↺' : '→'}
                    </button>
                    <button
                        id={`edit-${task.id}`}
                        className={'btn btn-ghost btn-icon ' + styles.actionBtn}
                        onClick={onEdit}
                        title="Edit task"
                    >
                        ✎
                    </button>
                    <button
                        id={`delete-${task.id}`}
                        className={`btn btn-icon ${styles.actionBtn} ${confirmDelete ? styles.deleteConfirm : styles.deleteBtn}`}
                        onClick={handleDelete}
                        title={confirmDelete ? 'Click again to confirm delete' : 'Delete task'}
                    >
                        {confirmDelete ? '⚠' : '🗑'}
                    </button>
                </div>
            </div>

            {/* ─── Content ─── */}
            <div className={styles.content}>
                <h3 className={`${styles.title} ${task.status === 'COMPLETED' ? styles.strikethrough : ''}`}>
                    {task.title}
                </h3>
                {task.description && (
                    <p className={styles.description}>{task.description}</p>
                )}
            </div>

            {/* ─── Footer ─── */}
            <div className={styles.footer}>
                <span className={styles.meta} title={format(new Date(task.createdAt), 'PPpp')}>
                    📅 {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                </span>
                {task.dueDate && (
                    <span className={`${styles.dueDate} ${isOverdue ? styles.overdue : ''}`}>
                        {isOverdue ? '⚠ Overdue: ' : '🗓 Due: '}
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                )}
            </div>
        </div>
    );
}
