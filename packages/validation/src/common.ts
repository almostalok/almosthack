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
