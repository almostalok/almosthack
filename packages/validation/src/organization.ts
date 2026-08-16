import { z } from 'zod';
import { OrganizationRole } from '@almosthack/types';

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const safeUrlSchema = z
  .string()
  .trim()
  .url({ message: 'Invalid URL format' })
  .refine((url) => !url.toLowerCase().startsWith('javascript:'), {
    message: 'javascript: URLs are not allowed for security reasons',
  })
  .refine((url) => !url.toLowerCase().startsWith('data:'), {
    message: 'data: URLs are not allowed for security reasons',
  })
  .refine((url) => !url.toLowerCase().startsWith('file:'), {
    message: 'file: URLs are not allowed for security reasons',
  })
  .refine((url) => /^https?:\/\//i.test(url), {
    message: 'URL must use HTTP or HTTPS protocol',
  });

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Organization name must be at least 2 characters long' })
    .max(100, { message: 'Organization name cannot exceed 100 characters' }),
  slug: z
    .string()
    .trim()
    .min(3, { message: 'Slug must be at least 3 characters long' })
    .max(50, { message: 'Slug cannot exceed 50 characters' })
    .regex(slugRegex, {
      message: 'Slug must consist only of lowercase letters, numbers, and single hyphens (e.g. "my-org")',
    })
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, { message: 'Description cannot exceed 500 characters' })
    .nullable()
    .optional(),
  websiteUrl: safeUrlSchema.nullable().optional(),
  logoUrl: safeUrlSchema.nullable().optional(),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = createOrganizationSchema.partial();

export type UpdateOrganizationSchema = z.infer<typeof updateOrganizationSchema>;

export const deleteOrganizationSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .min(1, { message: 'Confirmation matching organization slug is required' }),
});

export type DeleteOrganizationSchema = z.infer<typeof deleteOrganizationSchema>;

export const addMemberSchema = z.object({
  userId: z.string().uuid({ message: 'Valid target user ID (UUID) is required' }),
  role: z
    .enum([OrganizationRole.ADMIN, OrganizationRole.MEMBER], {
      errorMap: () => ({ message: 'Member role must be either ADMIN or MEMBER' }),
    })
    .default(OrganizationRole.MEMBER),
});

export type AddMemberSchema = z.infer<typeof addMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum([OrganizationRole.ADMIN, OrganizationRole.MEMBER], {
    errorMap: () => ({ message: 'Member role must be either ADMIN or MEMBER' }),
  }),
});

export type UpdateMemberRoleSchema = z.infer<typeof updateMemberRoleSchema>;

export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().uuid({ message: 'Valid new owner user ID (UUID) is required' }),
});

export type TransferOwnershipSchema = z.infer<typeof transferOwnershipSchema>;
