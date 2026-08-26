'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../providers/auth-provider';
import { ApiClientError } from '@almosthack/api-client';
import { Button, Input, Card, Badge, Alert } from '@almosthack/ui';

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
      router.push('/overview');
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
      router.push('/overview');
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
            almosthack // register
          </Badge>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#171914] font-heading">
          Create Account
        </h2>
        <p className="mt-2 text-sm text-[#6D7068] font-body">
          Register as a participant on the Transparent Hackathon Operating System.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card variant="editorial" className="p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6">
              <Alert variant="destructive" title="Registration Error">
                {errorMsg}
              </Alert>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alice Smith"
            />

            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="participant@domain.com"
            />

            <Input
              label="Password (min 8 chars)"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
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
                Complete Registration
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs font-mono text-[#6D7068]">
            Already registered?{' '}
            <Link href="/login" className="text-[#355C45] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
