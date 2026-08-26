'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers/auth-provider';
import { ApiClientError } from '@almosthack/api-client';
import { Button, Input, Card, Badge, Alert } from '@almosthack/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      router.push('/overview');
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
      router.push('/overview');
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
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4EA] text-[#6D7068] font-mono text-sm">
        Authenticating session...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#F7F4EA] px-6 py-12 text-[#171914] lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#355C45] rounded-[8px] flex items-center justify-center text-[#FFFDF8] font-extrabold font-heading text-base shadow-xs">
            AH
          </div>
          <Badge variant="accent" size="sm">
            almosthack // auth
          </Badge>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#171914] font-heading">
          System Login
        </h2>
        <p className="mt-2 text-sm text-[#6D7068] font-body">
          Enter your participant credentials to access the operating system.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="editorial" className="p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6">
              <Alert variant="destructive" title="Authentication Error">
                {errorMsg}
              </Alert>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="builder@domain.com"
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />

            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full font-mono text-xs uppercase tracking-wider"
              >
                Sign In
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs font-mono text-[#6D7068]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#355C45] font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
