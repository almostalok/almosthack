import { z } from 'zod';

export const calculateResultsSchema = z.object({
  forceRecalculate: z.boolean().optional().default(false),
});

export const approveResultsSchema = z.object({
  notes: z.string().max(1000).optional(),
});

export const publishResultsSchema = z.object({
  notifyParticipants: z.boolean().optional().default(false),
});

export const leaderboardQuerySchema = z.object({
  trackId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export type CalculateResultsInput = z.infer<typeof calculateResultsSchema>;
export type ApproveResultsInput = z.infer<typeof approveResultsSchema>;
export type PublishResultsInput = z.infer<typeof publishResultsSchema>;
export type LeaderboardQueryInput = z.infer<typeof leaderboardQuerySchema>;
