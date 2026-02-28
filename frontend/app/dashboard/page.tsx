'use client';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Task, TaskFilters, Pagination } from '../../types';
import { tasksApi } from '../../lib/services';
import TaskCard from '../../components/TaskCard';
import TaskModal from '../../components/TaskModal';
import StatsBar from '../../components/StatsBar';
import FilterBar from '../../components/FilterBar';
import PaginationComp from '../../components/Pagination';
import styles from './page.module.css';

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [filters, setFilters] = useState<TaskFilters>({ page: 1, limit: 9, sortBy: 'createdAt', sortOrder: 'desc' });
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await tasksApi.getTasks(filters);
            setTasks(res.data.data?.tasks || []);
            setPagination(res.data.data?.pagination || null);
        } catch {
            toast.error('Failed to load tasks.');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCreateTask = () => { setEditingTask(null); setShowModal(true); };
    const handleEditTask = (task: Task) => { setEditingTask(task); setShowModal(true); };

    const handleSaveTask = async (data: {
        title: string; description?: string; status?: string; priority?: string; dueDate?: string | null;
    }) => {
        try {
            if (editingTask) {
                await tasksApi.updateTask(editingTask.id, data);
                toast.success('Task updated!');
            } else {
                await tasksApi.createTask(data);
                toast.success('Task created!');
            }
            setShowModal(false);
            fetchTasks();
        } catch {
            toast.error('Failed to save task.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await tasksApi.deleteTask(id);
            toast.success('Task deleted.');
            fetchTasks();
        } catch {
            toast.error('Failed to delete task.');
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const res = await tasksApi.toggleTask(id);
            const updatedTask = res.data.data?.task;
            setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask! : t)));
            toast.success(`Status: ${updatedTask?.status.replace('_', ' ')}`);
        } catch {
            toast.error('Failed to update status.');
        }
    };

    const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const totalTasks = pagination?.total ?? tasks.length;
    const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
    const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

    return (
        <div className={styles.page}>
            {/* ─── Header ─── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>My Tasks</h1>
                    <p className={styles.subtitle}>
                        {totalTasks === 0 ? 'No tasks yet' : `${totalTasks} task${totalTasks !== 1 ? 's' : ''} total`}
                    </p>
                </div>
                <button id="create-task-btn" className="btn btn-primary" onClick={handleCreateTask}>
                    <span>+</span> New Task
                </button>
            </div>

            {/* ─── Stats ─── */}
            <StatsBar
                total={totalTasks}
                pending={pendingCount}
                inProgress={inProgressCount}
                completed={completedCount}
            />

            {/* ─── Filters ─── */}
            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            {/* ─── Task Grid ─── */}
            {isLoading ? (
                <div className={styles.skeletonGrid}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={styles.skeletonCard}>
                            <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 12 }} />
                            <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 16 }} />
                            <div className="skeleton" style={{ height: 48, width: '100%', marginBottom: 16 }} />
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div className="skeleton" style={{ height: 24, width: 70, borderRadius: 999 }} />
                                <div className="skeleton" style={{ height: 24, width: 60, borderRadius: 999 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : tasks.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📋</div>
                    <h3 className={styles.emptyTitle}>
                        {filters.search || filters.status || filters.priority ? 'No tasks match your filters' : 'No tasks yet'}
                    </h3>
                    <p className={styles.emptyDesc}>
                        {filters.search || filters.status || filters.priority
                            ? 'Try adjusting your search or filters.'
                            : 'Create your first task to get started!'}
                    </p>
                    {!filters.search && !filters.status && !filters.priority && (
                        <button className="btn btn-primary" onClick={handleCreateTask}>
                            + Create Task
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.taskGrid}>
                    {tasks.map((task, i) => (
                        <div key={task.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}>
                            <TaskCard
                                task={task}
                                onEdit={() => handleEditTask(task)}
                                onDelete={() => handleDelete(task.id)}
                                onToggle={() => handleToggle(task.id)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Pagination ─── */}
            {pagination && pagination.totalPages > 1 && (
                <PaginationComp pagination={pagination} onPageChange={handlePageChange} />
            )}

            {/* ─── Task Modal ─── */}
            {showModal && (
                <TaskModal
                    task={editingTask}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveTask}
                />
            )}
        </div>
    );
}
