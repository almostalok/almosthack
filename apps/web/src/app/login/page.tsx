'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers/auth-provider';
import { ApiClientError } from '@almosthack/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      router.push('/dashboard/overview');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push('/dashboard/overview');
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        setErrorMsg(err.message || 'Invalid email or password.');
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An unexpected error occurred during login.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400 font-mono text-sm">
        Authenticating...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-black px-6 py-12 text-zinc-100 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="inline-block rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-400 uppercase tracking-widest">
          almosthack // identity
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-white font-mono">
          System Login
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Enter your participant credentials to access the operating system.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-zinc-800 bg-zinc-950 p-8 shadow-2xl rounded-lg">
          {errorMsg && (
            <div className="mb-6 rounded border border-rose-500/50 bg-rose-500/10 p-3 text-xs text-rose-400 font-mono">
              [ERROR] {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-mono font-medium text-zinc-300 uppercase">
                Email Address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                  placeholder="participant@domain.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-mono font-medium text-zinc-300 uppercase">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded bg-emerald-500 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider text-black transition-colors hover:bg-emerald-400 focus:outline-none disabled:opacity-50"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs font-mono text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-emerald-400 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
