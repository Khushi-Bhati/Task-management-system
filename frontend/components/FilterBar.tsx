'use client';
import { useState, useCallback, useEffect } from 'react';
import { TaskFilters } from '../types';
import styles from './FilterBar.module.css';

interface Props {
    filters: TaskFilters;
    onFilterChange: (f: Partial<TaskFilters>) => void;
}

export default function FilterBar({ filters, onFilterChange }: Props) {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchValue !== filters.search) {
                onFilterChange({ search: searchValue || undefined });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchValue]); // eslint-disable-line

    const clearAll = () => {
        setSearchValue('');
        onFilterChange({ status: undefined, priority: undefined, search: undefined, sortBy: 'createdAt', sortOrder: 'desc' });
    };

    const hasFilters = filters.status || filters.priority || filters.search;

    return (
        <div className={styles.wrapper}>
            <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    id="search-input"
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search tasks by title…"
                    className={styles.searchInput}
                />
                {searchValue && (
                    <button className={styles.clearSearch} onClick={() => setSearchValue('')}>✕</button>
                )}
            </div>

            <div className={styles.filters}>
                <select
                    id="status-filter"
                    value={filters.status || ''}
                    onChange={(e) => onFilterChange({ status: (e.target.value as TaskFilters['status']) || undefined })}
                    className={styles.select}
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">⏳ Pending</option>
                    <option value="IN_PROGRESS">🔄 In Progress</option>
                    <option value="COMPLETED">✅ Completed</option>
                </select>

                <select
                    id="priority-filter"
                    value={filters.priority || ''}
                    onChange={(e) => onFilterChange({ priority: (e.target.value as TaskFilters['priority']) || undefined })}
                    className={styles.select}
                >
                    <option value="">All Priorities</option>
                    <option value="LOW">🟢 Low</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HIGH">🔴 High</option>
                </select>

                <select
                    id="sort-filter"
                    value={`${filters.sortBy}:${filters.sortOrder}`}
                    onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split(':');
                        onFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
                    }}
                    className={styles.select}
                >
                    <option value="createdAt:desc">Newest First</option>
                    <option value="createdAt:asc">Oldest First</option>
                    <option value="dueDate:asc">Due Date ↑</option>
                    <option value="dueDate:desc">Due Date ↓</option>
                    <option value="title:asc">Title A-Z</option>
                    <option value="title:desc">Title Z-A</option>
                    <option value="priority:desc">Priority High</option>
                </select>

                {hasFilters && (
                    <button id="clear-filters-btn" className={'btn btn-ghost btn-sm ' + styles.clearBtn} onClick={clearAll}>
                        ✕ Clear
                    </button>
                )}
            </div>
        </div>
    );
}
