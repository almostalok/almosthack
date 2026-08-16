import { z } from 'zod';
import { safeUrlSchema } from './organization';

export function isValidIanaTimezone(tz: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export const slugSchema = z
  .string()
  .trim()
  .min(2, { message: 'Slug must be at least 2 characters long' })
  .max(60, { message: 'Slug cannot exceed 60 characters' })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens, and cannot start or end with a hyphen',
  });

export const timezoneSchema = z
  .string()
  .trim()
  .refine((tz) => isValidIanaTimezone(tz), {
    message: 'Invalid IANA timezone identifier (e.g. "Asia/Kolkata", "America/New_York", "UTC")',
  });

export const createHackathonSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(100, { message: 'Name cannot exceed 100 characters' }),
    slug: slugSchema.optional(),
    description: z
      .string()
      .trim()
      .max(2000, { message: 'Description cannot exceed 2000 characters' })
      .nullable()
      .optional(),
    logoUrl: safeUrlSchema.nullable().optional(),
    websiteUrl: safeUrlSchema.nullable().optional(),
    timezone: timezoneSchema.default('UTC'),
    registrationStartsAt: z.string().datetime({ message: 'registrationStartsAt must be a valid ISO 8601 UTC date string' }),
    registrationEndsAt: z.string().datetime({ message: 'registrationEndsAt must be a valid ISO 8601 UTC date string' }),
    startsAt: z.string().datetime({ message: 'startsAt must be a valid ISO 8601 UTC date string' }),
    endsAt: z.string().datetime({ message: 'endsAt must be a valid ISO 8601 UTC date string' }),
  })
  .refine(
    (data) => new Date(data.registrationStartsAt).getTime() < new Date(data.registrationEndsAt).getTime(),
    {
      message: 'registrationStartsAt must be strictly before registrationEndsAt',
      path: ['registrationStartsAt'],
    }
  )
  .refine(
    (data) => new Date(data.registrationEndsAt).getTime() <= new Date(data.startsAt).getTime(),
    {
      message: 'registrationEndsAt must be on or before startsAt',
      path: ['registrationEndsAt'],
    }
  )
  .refine(
    (data) => new Date(data.startsAt).getTime() < new Date(data.endsAt).getTime(),
    {
      message: 'startsAt must be strictly before endsAt',
      path: ['startsAt'],
    }
  );

export type CreateHackathonSchema = z.infer<typeof createHackathonSchema>;

export const updateHackathonSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { message: 'Name must be at least 2 characters long' })
      .max(100, { message: 'Name cannot exceed 100 characters' })
      .optional(),
    slug: slugSchema.optional(),
    description: z
      .string()
      .trim()
      .max(2000, { message: 'Description cannot exceed 2000 characters' })
      .nullable()
      .optional(),
    logoUrl: safeUrlSchema.nullable().optional(),
    websiteUrl: safeUrlSchema.nullable().optional(),
    timezone: timezoneSchema.optional(),
    registrationStartsAt: z.string().datetime({ message: 'registrationStartsAt must be a valid ISO 8601 UTC date string' }).optional(),
    registrationEndsAt: z.string().datetime({ message: 'registrationEndsAt must be a valid ISO 8601 UTC date string' }).optional(),
    startsAt: z.string().datetime({ message: 'startsAt must be a valid ISO 8601 UTC date string' }).optional(),
    endsAt: z.string().datetime({ message: 'endsAt must be a valid ISO 8601 UTC date string' }).optional(),
  });

export type UpdateHackathonSchema = z.infer<typeof updateHackathonSchema>;
