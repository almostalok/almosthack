'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers/auth-provider';
import { ApiClientError } from '@almosthack/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = useState('');
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

    if (!name.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email address is required.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.push('/dashboard/overview');
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.code === 'EMAIL_ALREADY_EXISTS') {
          setErrorMsg('An account with this email address already exists.');
        } else {
          setErrorMsg(err.message || 'Registration failed. Please check inputs.');
        }
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An unexpected error occurred during registration.');
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
          Create Account
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Register as a participant on the Transparent Hackathon Operating System.
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
              <label htmlFor="name" className="block text-xs font-mono font-medium text-zinc-300 uppercase">
                Full Name
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none font-mono"
                  placeholder="Alice Smith"
                />
              </div>
            </div>

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
                Password (min 8 chars)
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
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
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs font-mono text-zinc-400">
            Already registered?{' '}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
