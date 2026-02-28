'use client';
import { useState, useEffect } from 'react';
import { Task } from '../types';
import styles from './TaskModal.module.css';

interface Props {
    task: Task | null;
    onClose: () => void;
    onSave: (data: {
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string | null;
    }) => Promise<void>;
}

const defaultForm = {
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
};

export default function TaskModal({ task, onClose, onSave }: Props) {
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (task) {
            setForm({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
            });
        } else {
            setForm(defaultForm);
        }
        setErrors({});
    }, [task]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.title.trim()) errs.title = 'Title is required';
        if (form.title.trim().length > 200) errs.title = 'Title must be under 200 characters';
        if (form.description.length > 2000) errs.description = 'Description must be under 2000 characters';
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setIsSaving(true);
        try {
            await onSave({
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                status: form.status,
                priority: form.priority,
                dueDate: form.dueDate || null,
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal + ' animate-scaleIn'} role="dialog" aria-modal="true">
                {/* ─── Modal Header ─── */}
                <div className={styles.modalHeader}>
                    <div className={styles.headerLeft}>
                        <div className={styles.headerIcon}>{task ? '✎' : '+'}</div>
                        <h2 className={styles.modalTitle}>{task ? 'Edit Task' : 'New Task'}</h2>
                    </div>
                    <button id="close-modal-btn" className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
                </div>

                {/* ─── Form ─── */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="form-group">
                        <label htmlFor="task-title" className="form-label">Title <span style={{ color: 'var(--accent-danger)' }}>*</span></label>
                        <input
                            id="task-title"
                            type="text"
                            value={form.title}
                            onChange={set('title')}
                            placeholder="What needs to be done?"
                            autoFocus
                            maxLength={200}
                        />
                        {errors.title && <span className="form-error">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-description" className="form-label">Description</label>
                        <textarea
                            id="task-description"
                            value={form.description}
                            onChange={set('description')}
                            placeholder="Add details or notes about this task…"
                            rows={3}
                            maxLength={2000}
                            style={{ resize: 'vertical', minHeight: 80 }}
                        />
                        {errors.description && <span className="form-error">{errors.description}</span>}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                            {form.description.length}/2000
                        </span>
                    </div>

                    <div className={styles.row}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="task-status" className="form-label">Status</label>
                            <select id="task-status" value={form.status} onChange={set('status')}>
                                <option value="PENDING">⏳ Pending</option>
                                <option value="IN_PROGRESS">🔄 In Progress</option>
                                <option value="COMPLETED">✅ Completed</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label htmlFor="task-priority" className="form-label">Priority</label>
                            <select id="task-priority" value={form.priority} onChange={set('priority')}>
                                <option value="LOW">🟢 Low</option>
                                <option value="MEDIUM">🟡 Medium</option>
                                <option value="HIGH">🔴 High</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="task-duedate" className="form-label">Due Date</label>
                        <input
                            id="task-duedate"
                            type="date"
                            value={form.dueDate}
                            onChange={set('dueDate')}
                            min={new Date().toISOString().substring(0, 10)}
                        />
                    </div>

                    {/* ─── Actions ─── */}
                    <div className={styles.modalActions}>
                        <button type="button" id="cancel-modal-btn" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" id="save-task-btn" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? <><span className="spinner" />{task ? 'Saving…' : 'Creating…'}</> : (task ? 'Save Changes' : 'Create Task')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
