'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className={styles.loadingScreen}>
                <div className={styles.loadingLogo}>
                    <div className={styles.loadingIcon}>✦</div>
                    <span>TaskFlow</span>
                </div>
                <div className="spinner" style={{ width: 32, height: 32, color: 'var(--accent-primary)' }} />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className={styles.layout}>
            <Navbar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
