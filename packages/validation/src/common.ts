import { z } from 'zod';

/**
 * Shared primitive ID schema validating standard UUID v4 / string identifier contract.
 */
export const idParamSchema = z.string().uuid({ message: 'Invalid unique identifier format. Must be a valid UUID.' });

export const flexIdParamSchema = z
  .string()
  .min(1, { message: 'Identifier cannot be empty' })
  .max(128, { message: 'Identifier exceeds maximum allowed length' });

/**
 * Shared pagination and query parameter validation contract.
 */
export const paginationQuerySchema = z.object({
  page: z
    .coerce
    .number()
    .int()
    .min(1, { message: 'Page number must be at least 1' })
    .default(1),
  limit: z
    .coerce
    .number()
    .int()
    .min(1, { message: 'Limit must be at least 1' })
    .max(100, { message: 'Limit cannot exceed 100 items per page' })
    .default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  search: z.string().max(100).optional(),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/**
 * Shared API response metadata schema.
 */
export const apiResponseMetaSchema = z.object({
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
  totalCount: z.number().int().optional(),
  totalPages: z.number().int().optional(),
});

export type ApiResponseMeta = z.infer<typeof apiResponseMetaSchema>;

const safeUrlSchema = z
  .string()
  .trim()
  .url({ message: 'Invalid URL format' })
  .refine((url) => !url.toLowerCase().startsWith('javascript:'), {
    message: 'javascript: URLs are not allowed for security reasons',
  })
  .refine((url) => /^https?:\/\//i.test(url), {
    message: 'URL must use HTTP or HTTPS protocol',
  });

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name cannot exceed 100 characters' })
    .optional(),
  avatarUrl: safeUrlSchema.nullable().optional(),
  bio: z
    .string()
    .trim()
    .max(500, { message: 'Bio cannot exceed 500 characters' })
    .nullable()
    .optional(),
  college: z
    .string()
    .trim()
    .max(150, { message: 'College name cannot exceed 150 characters' })
    .nullable()
    .optional(),
  branch: z
    .string()
    .trim()
    .max(100, { message: 'Branch name cannot exceed 100 characters' })
    .nullable()
    .optional(),
  graduationYear: z
    .number()
    .int()
    .min(1950, { message: 'Graduation year must be at or after 1950' })
    .max(2100, { message: 'Graduation year must be at or before 2100' })
    .nullable()
    .optional(),
  skills: z
    .array(
      z
        .string()
        .trim()
        .max(50, { message: 'Individual skill length cannot exceed 50 characters' })
    )
    .max(30, { message: 'Cannot add more than 30 skills' })
    .optional(),
  githubUsername: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, {
      message: 'Invalid GitHub username format',
    })
    .nullable()
    .optional(),
  linkedinUrl: safeUrlSchema.nullable().optional(),
  portfolioUrl: safeUrlSchema.nullable().optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

