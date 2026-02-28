import styles from './StatsBar.module.css';

interface Props {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
}

export default function StatsBar({ total, pending, inProgress, completed }: Props) {
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const stats = [
        { label: 'Total', value: total, color: 'var(--accent-primary)', icon: '📊' },
        { label: 'Pending', value: pending, color: '#94a3b8', icon: '⏳' },
        { label: 'In Progress', value: inProgress, color: '#22d3ee', icon: '🔄' },
        { label: 'Completed', value: completed, color: '#34d399', icon: '✅' },
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.statsGrid}>
                {stats.map((stat) => (
                    <div key={stat.label} className={styles.statCard}>
                        <span className={styles.statIcon}>{stat.icon}</span>
                        <div className={styles.statContent}>
                            <span className={styles.statValue} style={{ color: stat.color }}>{stat.value}</span>
                            <span className={styles.statLabel}>{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>
            {total > 0 && (
                <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>Overall Progress</span>
                        <span className={styles.progressValue}>{completionRate}%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${completionRate}%` }} />
                    </div>
                </div>
            )}
        </div>
    );
}
