'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import styles from '../login/auth.module.css';

export default function RegisterPage() {
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPass, setShowPass] = useState(false);

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
        if (!form.email) errs.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
        if (!form.password) errs.password = 'Password is required';
        else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
            errs.password = 'Must have uppercase, lowercase, and a number';
        if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
        return errs;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setIsLoading(true);
        try {
            await register(form.name, form.email, form.password);
            toast.success('Account created! Welcome to TaskFlow 🎉');
        } catch (err) {
            const error = err as AxiosError<{ message: string; errors?: { field: string; message: string }[] }>;
            const apiErrors = error?.response?.data?.errors;
            if (apiErrors?.length) {
                const mapped: Record<string, string> = {};
                apiErrors.forEach((e) => { mapped[e.field] = e.message; });
                setErrors(mapped);
            } else {
                toast.error(error?.response?.data?.message || 'Registration failed. Please try again.');
            }
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
                    <h2 className={styles.authTitle}>Create account</h2>
                    <p className={styles.authSubtitle}>Start organizing your life today</p>
                </div>
                <form onSubmit={handleSubmit} noValidate className={styles.form}>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Full name</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>👤</span>
                            <input id="name" type="text" value={form.name} onChange={set('name')} placeholder="John Doe" autoComplete="name" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>✉</span>
                            <input id="email" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>🔒</span>
                            <input id="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Min. 8 chars, A-Z, a-z, 0-9" autoComplete="new-password" style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }} />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>{showPass ? '👁' : '👁‍🗨'}</button>
                        </div>
                        {errors.password && <span className="form-error">{errors.password}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm" className="form-label">Confirm password</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>🔒</span>
                            <input id="confirm" type={showPass ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} placeholder="Repeat your password" autoComplete="new-password" style={{ paddingLeft: '2.5rem' }} />
                        </div>
                        {errors.confirm && <span className="form-error">{errors.confirm}</span>}
                    </div>
                    <button type="submit" className={'btn btn-primary btn-lg ' + styles.submitBtn} disabled={isLoading}>
                        {isLoading ? <><span className="spinner" />Creating account…</> : 'Create Account'}
                    </button>
                </form>
                <p className={styles.switchText}>
                    Already have an account?{' '}
                    <Link href="/login" className={styles.switchLink}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
