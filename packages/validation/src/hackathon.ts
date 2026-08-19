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

export const normalizeStringArray = (arr: string[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of arr) {
    const trimmed = item.trim();
    if (trimmed.length === 0) continue;
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }
  return result;
};

const stringArraySchema = (maxItemLen: number, label: string) =>
  z
    .array(
      z
        .string()
        .trim()
        .min(1, { message: `${label} entry cannot be empty` })
        .max(maxItemLen, { message: `${label} entry cannot exceed ${maxItemLen} characters` })
    )
    .max(50, { message: `Cannot specify more than 50 ${label.toLowerCase()}s` })
    .transform((val) => normalizeStringArray(val));

export const updateHackathonConfigurationSchema = z
  .object({
    participationMode: z
      .enum(['INDIVIDUAL', 'TEAM', 'BOTH'], {
        errorMap: () => ({ message: 'Invalid participationMode value' }),
      })
      .optional(),
    minTeamSize: z
      .number()
      .int()
      .min(1, { message: 'minTeamSize must be at least 1' })
      .max(100, { message: 'minTeamSize cannot exceed 100' })
      .nullable()
      .optional(),
    maxTeamSize: z
      .number()
      .int()
      .min(1, { message: 'maxTeamSize must be at least 1' })
      .max(100, { message: 'maxTeamSize cannot exceed 100' })
      .nullable()
      .optional(),
    eligibilityType: z
      .enum(['OPEN', 'STUDENTS_ONLY', 'INVITE_ONLY'], {
        errorMap: () => ({ message: 'Invalid eligibilityType value' }),
      })
      .optional(),
    allowedBranches: stringArraySchema(100, 'Branch').optional(),
    allowedColleges: stringArraySchema(150, 'College').optional(),
    graduationYearFrom: z
      .number()
      .int()
      .min(1900, { message: 'graduationYearFrom must be at or after 1900' })
      .max(2200, { message: 'graduationYearFrom must be at or before 2200' })
      .nullable()
      .optional(),
    graduationYearTo: z
      .number()
      .int()
      .min(1900, { message: 'graduationYearTo must be at or after 1900' })
      .max(2200, { message: 'graduationYearTo must be at or before 2200' })
      .nullable()
      .optional(),
    aiUsagePolicy: z
      .enum(['ALLOWED', 'RESTRICTED', 'PROHIBITED'], {
        errorMap: () => ({ message: 'Invalid aiUsagePolicy value' }),
      })
      .optional(),
    aiDisclosureRequired: z.boolean().optional(),
    preExistingCodePolicy: z
      .enum(['PROHIBITED', 'ALLOWED', 'ALLOWED_WITH_DISCLOSURE'], {
        errorMap: () => ({ message: 'Invalid preExistingCodePolicy value' }),
      })
      .optional(),
    openSourcePolicy: z
      .enum(['ALLOWED', 'ALLOWED_WITH_ATTRIBUTION', 'RESTRICTED', 'PROHIBITED'], {
        errorMap: () => ({ message: 'Invalid openSourcePolicy value' }),
      })
      .optional(),
    githubRequired: z.boolean().optional(),
    repositoryPolicy: z
      .enum(['PLATFORM_MANAGED', 'EXTERNAL_ALLOWED'], {
        errorMap: () => ({ message: 'Invalid repositoryPolicy value' }),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (
        data.minTeamSize !== undefined &&
        data.minTeamSize !== null &&
        data.maxTeamSize !== undefined &&
        data.maxTeamSize !== null
      ) {
        return data.minTeamSize <= data.maxTeamSize;
      }
      return true;
    },
    {
      message: 'minTeamSize must be less than or equal to maxTeamSize',
      path: ['maxTeamSize'],
    }
  )
  .refine(
    (data) => {
      if (
        data.graduationYearFrom !== undefined &&
        data.graduationYearFrom !== null &&
        data.graduationYearTo !== undefined &&
        data.graduationYearTo !== null
      ) {
        return data.graduationYearFrom <= data.graduationYearTo;
      }
      return true;
    },
    {
      message: 'graduationYearFrom must be less than or equal to graduationYearTo',
      path: ['graduationYearTo'],
    }
  );

export type UpdateHackathonConfigurationSchema = z.infer<
  typeof updateHackathonConfigurationSchema
>;

export const updateHackathonRulesSchema = z.object({
  rulesMarkdown: z
    .string()
    .max(100000, { message: 'rulesMarkdown cannot exceed 100,000 characters' })
    .nullable()
    .optional(),
});

export type UpdateHackathonRulesSchema = z.infer<
  typeof updateHackathonRulesSchema
>;

export const trackSlugSchema = z
  .string()
  .trim()
  .min(1, { message: 'Slug must be at least 1 character long' })
  .max(100, { message: 'Slug cannot exceed 100 characters' })
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens, and cannot start or end with a hyphen',
  });

export const createTrackSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(150, { message: 'Name cannot exceed 150 characters' }),
  slug: trackSlugSchema.optional(),
  shortDescription: z
    .string()
    .trim()
    .max(300, { message: 'Short description cannot exceed 300 characters' })
    .nullable()
    .optional(),
  description: z
    .string()
    .trim()
    .max(10000, { message: 'Description cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  displayOrder: z
    .number()
    .int()
    .min(0, { message: 'displayOrder must be at least 0' })
    .max(10000, { message: 'displayOrder cannot exceed 10,000' })
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateTrackSchema = z.infer<typeof createTrackSchema>;

export const updateTrackSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(150, { message: 'Name cannot exceed 150 characters' })
    .optional(),
  slug: trackSlugSchema.optional(),
  shortDescription: z
    .string()
    .trim()
    .max(300, { message: 'Short description cannot exceed 300 characters' })
    .nullable()
    .optional(),
  description: z
    .string()
    .trim()
    .max(10000, { message: 'Description cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  displayOrder: z
    .number()
    .int()
    .min(0, { message: 'displayOrder must be at least 0' })
    .max(10000, { message: 'displayOrder cannot exceed 10,000' })
    .optional(),
  isActive: z.boolean().optional(),
});

export type UpdateTrackSchema = z.infer<typeof updateTrackSchema>;

export const reorderItemSchema = z.object({
  id: z.string().uuid({ message: 'Item id must be a valid UUID' }),
  displayOrder: z
    .number()
    .int()
    .min(0, { message: 'displayOrder must be at least 0' })
    .max(10000, { message: 'displayOrder cannot exceed 10,000' }),
});

export const reorderTracksSchema = z
  .object({
    items: z
      .array(reorderItemSchema)
      .min(1, { message: 'items array cannot be empty' })
      .max(100, { message: 'Cannot reorder more than 100 tracks in a single batch' }),
  })
  .refine(
    (data) => {
      const ids = new Set(data.items.map((i) => i.id));
      return ids.size === data.items.length;
    },
    {
      message: 'Track IDs in reorder batch must be unique',
      path: ['items'],
    }
  );

export type ReorderTracksSchema = z.infer<typeof reorderTracksSchema>;

export const challengeResourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Resource title cannot be empty' })
    .max(150, { message: 'Resource title cannot exceed 150 characters' }),
  url: safeUrlSchema,
});

export type ChallengeResourceSchema = z.infer<typeof challengeResourceSchema>;

export const createChallengeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(150, { message: 'Name cannot exceed 150 characters' }),
  slug: trackSlugSchema.optional(),
  description: z
    .string()
    .trim()
    .max(10000, { message: 'Description cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  problemStatement: z
    .string()
    .trim()
    .min(5, { message: 'Problem statement must be at least 5 characters long' })
    .max(20000, { message: 'Problem statement cannot exceed 20,000 characters' }),
  requirements: z
    .string()
    .trim()
    .max(10000, { message: 'Requirements cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  constraints: z
    .string()
    .trim()
    .max(10000, { message: 'Constraints cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  expectedOutcome: z
    .string()
    .trim()
    .max(10000, { message: 'Expected outcome cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  resources: z
    .array(challengeResourceSchema)
    .max(20, { message: 'Cannot attach more than 20 resources to a challenge' })
    .optional(),
  displayOrder: z
    .number()
    .int()
    .min(0, { message: 'displayOrder must be at least 0' })
    .max(10000, { message: 'displayOrder cannot exceed 10,000' })
    .optional(),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
      errorMap: () => ({ message: 'Invalid challenge status' }),
    })
    .optional(),
});

export type CreateChallengeSchema = z.infer<typeof createChallengeSchema>;

export const updateChallengeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(150, { message: 'Name cannot exceed 150 characters' })
    .optional(),
  slug: trackSlugSchema.optional(),
  description: z
    .string()
    .trim()
    .max(10000, { message: 'Description cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  problemStatement: z
    .string()
    .trim()
    .min(5, { message: 'Problem statement must be at least 5 characters long' })
    .max(20000, { message: 'Problem statement cannot exceed 20,000 characters' })
    .optional(),
  requirements: z
    .string()
    .trim()
    .max(10000, { message: 'Requirements cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  constraints: z
    .string()
    .trim()
    .max(10000, { message: 'Constraints cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  expectedOutcome: z
    .string()
    .trim()
    .max(10000, { message: 'Expected outcome cannot exceed 10,000 characters' })
    .nullable()
    .optional(),
  resources: z
    .array(challengeResourceSchema)
    .max(20, { message: 'Cannot attach more than 20 resources to a challenge' })
    .optional(),
  displayOrder: z
    .number()
    .int()
    .min(0, { message: 'displayOrder must be at least 0' })
    .max(10000, { message: 'displayOrder cannot exceed 10,000' })
    .optional(),
  status: z
    .enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
      errorMap: () => ({ message: 'Invalid challenge status' }),
    })
    .optional(),
});

export type UpdateChallengeSchema = z.infer<typeof updateChallengeSchema>;

export const reorderChallengesSchema = z
  .object({
    items: z
      .array(reorderItemSchema)
      .min(1, { message: 'items array cannot be empty' })
      .max(200, { message: 'Cannot reorder more than 200 challenges in a single batch' }),
  })
  .refine(
    (data) => {
      const ids = new Set(data.items.map((i) => i.id));
      return ids.size === data.items.length;
    },
    {
      message: 'Challenge IDs in reorder batch must be unique',
      path: ['items'],
    }
  );

export type ReorderChallengesSchema = z.infer<typeof reorderChallengesSchema>;

// ==========================================
// S2-04: PARTICIPANT REGISTRATION SCHEMAS
// ==========================================

export const createParticipantRegistrationSchema = z.object({
  trackId: z.string().uuid({ message: 'trackId must be a valid UUID' }).nullable().optional(),
  challengeId: z.string().uuid({ message: 'challengeId must be a valid UUID' }).nullable().optional(),
});

export type CreateParticipantRegistrationSchema = z.infer<typeof createParticipantRegistrationSchema>;

export const updateParticipantRegistrationSchema = z.object({
  trackId: z.string().uuid({ message: 'trackId must be a valid UUID' }).nullable().optional(),
  challengeId: z.string().uuid({ message: 'challengeId must be a valid UUID' }).nullable().optional(),
});

export type UpdateParticipantRegistrationSchema = z.infer<typeof updateParticipantRegistrationSchema>;

// ==========================================
// S2-05: TEAMS & TEAM FORMATION SCHEMAS
// ==========================================

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Team name must be at least 2 characters' })
    .max(100, { message: 'Team name cannot exceed 100 characters' }),
  slug: z
    .string()
    .trim()
    .min(2, { message: 'Team slug must be at least 2 characters' })
    .max(120, { message: 'Team slug cannot exceed 120 characters' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must consist of lowercase alphanumeric characters separated by single hyphens',
    })
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, { message: 'Team description cannot exceed 1,000 characters' })
    .nullable()
    .optional(),
});

export type CreateTeamSchema = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Team name must be at least 2 characters' })
    .max(100, { message: 'Team name cannot exceed 100 characters' })
    .optional(),
  slug: z
    .string()
    .trim()
    .min(2, { message: 'Team slug must be at least 2 characters' })
    .max(120, { message: 'Team slug cannot exceed 120 characters' })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must consist of lowercase alphanumeric characters separated by single hyphens',
    })
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, { message: 'Team description cannot exceed 1,000 characters' })
    .nullable()
    .optional(),
});

export type UpdateTeamSchema = z.infer<typeof updateTeamSchema>;

export const inviteTeamMemberSchema = z
  .object({
    inviteeUserId: z.string().uuid({ message: 'inviteeUserId must be a valid UUID' }).optional(),
    inviteeEmail: z.string().email({ message: 'inviteeEmail must be a valid email address' }).optional(),
  })
  .refine((data) => data.inviteeUserId || data.inviteeEmail, {
    message: 'Either inviteeUserId or inviteeEmail must be provided',
  });

export type InviteTeamMemberSchema = z.infer<typeof inviteTeamMemberSchema>;

export const transferCaptaincySchema = z.object({
  targetMemberId: z.string().uuid({ message: 'targetMemberId must be a valid UUID' }),
});

export type TransferCaptaincySchema = z.infer<typeof transferCaptaincySchema>;

// ==========================================
// S2-06: GITHUB INTEGRATION & REPOSITORY SCHEMAS
// ==========================================

export const provisionRepositorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Repository name must be at least 2 characters' })
    .max(100, { message: 'Repository name cannot exceed 100 characters' })
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: 'Repository name can only contain alphanumeric characters, underscores, hyphens, and periods',
    })
    .optional(),
  isPrivate: z.boolean().optional().default(false),
});

export type ProvisionRepositorySchema = z.infer<typeof provisionRepositorySchema>;

export const connectRepositorySchema = z.object({
  owner: z
    .string()
    .trim()
    .min(1, { message: 'Repository owner is required' })
    .max(100, { message: 'Repository owner cannot exceed 100 characters' }),
  repo: z
    .string()
    .trim()
    .min(1, { message: 'Repository name is required' })
    .max(100, { message: 'Repository name cannot exceed 100 characters' }),
});

export type ConnectRepositorySchema = z.infer<typeof connectRepositorySchema>;

// ==========================================
// S3: SUBMISSIONS & JUDGING SCHEMAS
// ==========================================

export const createSubmissionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Submission title must be at least 3 characters' })
    .max(150, { message: 'Submission title cannot exceed 150 characters' }),
  description: z.string().trim().max(5000, { message: 'Description cannot exceed 5000 characters' }).optional().nullable(),
  trackId: z.string().uuid({ message: 'trackId must be a valid UUID' }).optional().nullable(),
  challengeId: z.string().uuid({ message: 'challengeId must be a valid UUID' }).optional().nullable(),
  repositoryId: z.string().uuid({ message: 'repositoryId must be a valid UUID' }).optional().nullable(),
  demoUrl: z.string().url({ message: 'demoUrl must be a valid URL' }).optional().nullable().or(z.literal('')),
  documentationUrl: z.string().url({ message: 'documentationUrl must be a valid URL' }).optional().nullable().or(z.literal('')),
});

export type CreateSubmissionSchema = z.infer<typeof createSubmissionSchema>;

export const updateSubmissionSchema = createSubmissionSchema.partial();
export type UpdateSubmissionSchema = z.infer<typeof updateSubmissionSchema>;

export const createJudgingCriterionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Criterion name must be at least 2 characters' })
    .max(100, { message: 'Criterion name cannot exceed 100 characters' }),
  description: z.string().trim().max(1000).optional().nullable(),
  weight: z.number().min(0.1).max(10.0).optional().default(1.0),
  maxScore: z.number().min(1.0).max(100.0).optional().default(10.0),
  displayOrder: z.number().int().min(0).optional().default(0),
});

export type CreateJudgingCriterionSchema = z.infer<typeof createJudgingCriterionSchema>;

export const assignJudgeSchema = z.object({
  judgeUserId: z.string().uuid({ message: 'judgeUserId must be a valid UUID' }),
  submissionId: z.string().uuid({ message: 'submissionId must be a valid UUID' }),
});

export type AssignJudgeSchema = z.infer<typeof assignJudgeSchema>;

export const evaluationScoreInputSchema = z.object({
  criterionId: z.string().uuid({ message: 'criterionId must be a valid UUID' }),
  score: z.number().min(0, { message: 'Score cannot be negative' }),
  comment: z.string().trim().max(1000).optional().nullable(),
});

export const submitEvaluationSchema = z.object({
  generalFeedback: z.string().trim().max(3000).optional().nullable(),
  scores: z.array(evaluationScoreInputSchema).min(1, { message: 'At least one criterion score is required' }),
});

export type SubmitEvaluationSchema = z.infer<typeof submitEvaluationSchema>;




