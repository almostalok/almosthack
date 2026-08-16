import { CookieOptions } from 'express';

export const SESSION_COOKIE_NAME = 'almosthack_session';
export const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const getSessionCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_LIFETIME_MS,
});
