import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TaskFlow — Elegant Task Management',
  description: 'Organize, prioritize, and complete your tasks efficiently with TaskFlow.',
  keywords: ['task management', 'productivity', 'todo', 'tasks'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1e1e2e',
                color: '#e2e8f0',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#1e1e2e' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#1e1e2e' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
