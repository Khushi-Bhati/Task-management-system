'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully.');
    };

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    return (
        <nav className={styles.navbar}>
            <div className={styles.inner}>
                <Link href="/dashboard" className={styles.brand}>
                    <div className={styles.brandIcon}>✦</div>
                    <span className={styles.brandName}>TaskFlow</span>
                </Link>

                <div className={styles.right}>
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>{initials}</div>
                        <div className={styles.userText}>
                            <span className={styles.userName}>{user?.name}</span>
                            <span className={styles.userEmail}>{user?.email}</span>
                        </div>
                    </div>
                    <button
                        id="logout-btn"
                        onClick={handleLogout}
                        className={'btn btn-secondary btn-sm ' + styles.logoutBtn}
                    >
                        <span>→</span> Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
