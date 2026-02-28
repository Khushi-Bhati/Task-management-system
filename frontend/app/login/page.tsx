'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import styles from './auth.module.css';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPass, setShowPass] = useState(false);

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
        if (!password) errs.password = 'Password is required';
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setIsLoading(true);
        try {
            await login(email, password);
            toast.success('Welcome back!');
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            toast.error(error?.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.bgOrb1} />
            <div className={styles.bgOrb2} />
            <div className={styles.authCard + ' animate-scaleIn'}>
                <div className={styles.brand}>
                    <div className={styles.brandIcon}>✦</div>
                    <h1 className={styles.brandName}>TaskFlow</h1>
                </div>
                <div className={styles.authHeader}>
                    <h2 className={styles.authTitle}>Welcome back</h2>
                    <p className={styles.authSubtitle}>Sign in to your account to continue</p>
                </div>
                <form onSubmit={handleSubmit} noValidate className={styles.form}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>✉</span>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                style={{ paddingLeft: '2.5rem' }}
                            />
                        </div>
                        {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>🔒</span>
                            <input
                                id="password"
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                            />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                                {showPass ? '👁' : '👁‍🗨'}
                            </button>
                        </div>
                        {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>
                    <button type="submit" className={'btn btn-primary btn-lg ' + styles.submitBtn} disabled={isLoading}>
                        {isLoading ? <><span className="spinner" />Signing in…</> : 'Sign In'}
                    </button>
                </form>
                <p className={styles.switchText}>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className={styles.switchLink}>Create one free</Link>
                </p>
            </div>
        </div>
    );
}
