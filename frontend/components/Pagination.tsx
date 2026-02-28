import { Pagination as PaginationType } from '../types';
import styles from './Pagination.module.css';

interface Props {
    pagination: PaginationType;
    onPageChange: (page: number) => void;
}

export default function Pagination({ pagination, onPageChange }: Props) {
    const { page, totalPages } = pagination;

    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push('...');
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
        if (page < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div className={styles.wrapper}>
            <button
                id="prev-page-btn"
                className={'btn btn-secondary btn-sm ' + styles.navBtn}
                onClick={() => onPageChange(page - 1)}
                disabled={!pagination.hasPrevPage}
            >
                ← Prev
            </button>
            <div className={styles.pages}>
                {pages.map((p, i) =>
                    p === '...' ? (
                        <span key={`ellipsis-${i}`} className={styles.ellipsis}>…</span>
                    ) : (
                        <button
                            key={p}
                            id={`page-${p}-btn`}
                            className={`btn btn-sm ${styles.pageBtn} ${p === page ? styles.active : ''}`}
                            onClick={() => onPageChange(p as number)}
                        >
                            {p}
                        </button>
                    )
                )}
            </div>
            <button
                id="next-page-btn"
                className={'btn btn-secondary btn-sm ' + styles.navBtn}
                onClick={() => onPageChange(page + 1)}
                disabled={!pagination.hasNextPage}
            >
                Next →
            </button>
        </div>
    );
}
