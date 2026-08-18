import {
  idParamSchema,
  flexIdParamSchema,
  paginationQuerySchema,
} from '../common';
import {
  updateHackathonConfigurationSchema,
  updateHackathonRulesSchema,
  createTrackSchema,
  updateTrackSchema,
  reorderTracksSchema,
  challengeResourceSchema,
  createChallengeSchema,
  updateChallengeSchema,
  reorderChallengesSchema,
  createParticipantRegistrationSchema,
  updateParticipantRegistrationSchema,
  createTeamSchema,
  updateTeamSchema,
  inviteTeamMemberSchema,
  transferCaptaincySchema,
} from '../hackathon';

describe('Shared Validation Schemas', () => {
  describe('idParamSchema', () => {
    it('should validate valid UUIDs', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(idParamSchema.safeParse(validUuid).success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(idParamSchema.safeParse('not-a-uuid').success).toBe(false);
      expect(idParamSchema.safeParse('').success).toBe(false);
    });
  });

  describe('flexIdParamSchema', () => {
    it('should validate non-empty string IDs within 128 characters', () => {
      expect(flexIdParamSchema.safeParse('usr_12345').success).toBe(true);
      expect(flexIdParamSchema.safeParse('org_test_id').success).toBe(true);
    });

    it('should reject empty or overly long IDs', () => {
      expect(flexIdParamSchema.safeParse('').success).toBe(false);
      expect(flexIdParamSchema.safeParse('a'.repeat(129)).success).toBe(false);
    });
  });

  describe('paginationQuerySchema', () => {
    it('should apply defaults for missing optional fields', () => {
      const result = paginationQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should coerce string parameters into numbers', () => {
      const result = paginationQuerySchema.safeParse({ page: '3', limit: '50' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(50);
      }
    });

    it('should reject invalid page or limit values', () => {
      expect(paginationQuerySchema.safeParse({ page: 0 }).success).toBe(false);
      expect(paginationQuerySchema.safeParse({ limit: 101 }).success).toBe(false);
      expect(paginationQuerySchema.safeParse({ page: -5 }).success).toBe(false);
    });
  });

  describe('updateHackathonConfigurationSchema', () => {
    it('should validate valid configuration payload', () => {
      const payload = {
        participationMode: 'TEAM',
        minTeamSize: 2,
        maxTeamSize: 4,
        eligibilityType: 'STUDENTS_ONLY',
        allowedBranches: [' CSE ', 'cse', 'ECE'],
        allowedColleges: [' MIT ', 'mit'],
        graduationYearFrom: 2024,
        graduationYearTo: 2026,
        aiUsagePolicy: 'RESTRICTED',
        aiDisclosureRequired: true,
        preExistingCodePolicy: 'PROHIBITED',
        openSourcePolicy: 'ALLOWED_WITH_ATTRIBUTION',
        githubRequired: true,
        repositoryPolicy: 'PLATFORM_MANAGED',
      };

      const result = updateHackathonConfigurationSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.allowedBranches).toEqual(['CSE', 'ECE']);
        expect(result.data.allowedColleges).toEqual(['MIT']);
      }
    });

    it('should reject invalid team size invariant (min > max)', () => {
      const result = updateHackathonConfigurationSchema.safeParse({
        minTeamSize: 5,
        maxTeamSize: 2,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid graduation year invariant (from > to)', () => {
      const result = updateHackathonConfigurationSchema.safeParse({
        graduationYearFrom: 2028,
        graduationYearTo: 2024,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid enum values', () => {
      expect(
        updateHackathonConfigurationSchema.safeParse({
          participationMode: 'SUPER_TEAM',
        }).success
      ).toBe(false);
      expect(
        updateHackathonConfigurationSchema.safeParse({
          aiUsagePolicy: 'UNKNOWN',
        }).success
      ).toBe(false);
    });
  });

  describe('updateHackathonRulesSchema', () => {
    it('should accept valid rules markdown', () => {
      const result = updateHackathonRulesSchema.safeParse({
        rulesMarkdown: '# Official Rules',
      });
      expect(result.success).toBe(true);
    });

    it('should reject rules markdown exceeding 100,000 characters', () => {
      const longRules = 'a'.repeat(100001);
      const result = updateHackathonRulesSchema.safeParse({
        rulesMarkdown: longRules,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Track Validation Schemas (S2-03)', () => {
    it('should validate valid create track payload', () => {
      const res = createTrackSchema.safeParse({
        name: 'AI & Machine Learning',
        slug: 'ai-machine-learning',
        shortDescription: 'Build novel ML agents and applications',
        description: 'Comprehensive track description for AI agents.',
        displayOrder: 1,
        isActive: true,
      });
      expect(res.success).toBe(true);
    });

    it('should reject track with invalid slug characters or empty name', () => {
      expect(createTrackSchema.safeParse({ name: ' ' }).success).toBe(false);
      expect(createTrackSchema.safeParse({ name: 'Valid Track', slug: 'INVALID SLUG!' }).success).toBe(false);
    });

    it('should validate track reorder batch and reject duplicates', () => {
      const id1 = '123e4567-e89b-12d3-a456-426614174001';
      const id2 = '123e4567-e89b-12d3-a456-426614174002';
      const valid = reorderTracksSchema.safeParse({
        items: [
          { id: id1, displayOrder: 1 },
          { id: id2, displayOrder: 2 },
        ],
      });
      expect(valid.success).toBe(true);

      const duplicateIds = reorderTracksSchema.safeParse({
        items: [
          { id: id1, displayOrder: 1 },
          { id: id1, displayOrder: 2 },
        ],
      });
      expect(duplicateIds.success).toBe(false);
    });
  });

  describe('Challenge Validation Schemas (S2-03)', () => {
    it('should validate valid challenge resource and reject dangerous protocols', () => {
      expect(
        challengeResourceSchema.safeParse({
          title: 'Dataset API',
          url: 'https://datasets.example.com/api',
        }).success
      ).toBe(true);

      expect(
        challengeResourceSchema.safeParse({
          title: 'XSS Attack',
          url: 'javascript:alert(1)',
        }).success
      ).toBe(false);

      expect(
        challengeResourceSchema.safeParse({
          title: 'Data URI',
          url: 'data:text/html,<script>alert(1)</script>',
        }).success
      ).toBe(false);
    });

    it('should validate valid create challenge payload', () => {
      const res = createChallengeSchema.safeParse({
        name: 'Autonomous Code Reviewer',
        slug: 'autonomous-code-reviewer',
        problemStatement: 'Design an AI-driven agent capable of reviewing Git PRs.',
        requirements: 'Must output structured diff reviews in markdown.',
        constraints: 'Latency under 5 seconds.',
        expectedOutcome: 'A functioning CLI or GitHub Action.',
        resources: [
          { title: 'Doc', url: 'https://example.com/docs' },
        ],
        displayOrder: 1,
        status: 'DRAFT',
      });
      expect(res.success).toBe(true);
    });

    it('should reject challenge without problemStatement or with invalid status', () => {
      expect(createChallengeSchema.safeParse({ name: 'Challenge without Problem' }).success).toBe(false);
      expect(
        createChallengeSchema.safeParse({
          name: 'Challenge',
          problemStatement: 'Valid problem statement',
          status: 'INVALID_STATUS' as any,
        }).success
      ).toBe(false);
    });

    it('should validate challenge reorder batch', () => {
      const id1 = '123e4567-e89b-12d3-a456-426614174011';
      const id2 = '123e4567-e89b-12d3-a456-426614174012';
      const res = reorderChallengesSchema.safeParse({
        items: [
          { id: id1, displayOrder: 1 },
          { id: id2, displayOrder: 2 },
        ],
      });
      expect(res.success).toBe(true);
    });
  });

  describe('Participant Registration Validation Schemas (S2-04)', () => {
    const validTrackId = '123e4567-e89b-12d3-a456-426614174001';
    const validChallengeId = '123e4567-e89b-12d3-a456-426614174002';

    it('should accept empty payload, track-only, and track+challenge payload', () => {
      expect(createParticipantRegistrationSchema.safeParse({}).success).toBe(true);
      expect(
        createParticipantRegistrationSchema.safeParse({
          trackId: validTrackId,
        }).success
      ).toBe(true);
      expect(
        createParticipantRegistrationSchema.safeParse({
          trackId: validTrackId,
          challengeId: validChallengeId,
        }).success
      ).toBe(true);
    });

    it('should reject invalid UUIDs for trackId or challengeId', () => {
      expect(
        createParticipantRegistrationSchema.safeParse({
          trackId: 'not-a-uuid',
        }).success
      ).toBe(false);
      expect(
        createParticipantRegistrationSchema.safeParse({
          challengeId: 'not-a-uuid',
        }).success
      ).toBe(false);
    });

    it('should validate update participant registration payload', () => {
      expect(
        updateParticipantRegistrationSchema.safeParse({
          trackId: null,
          challengeId: null,
        }).success
      ).toBe(true);
      expect(
        updateParticipantRegistrationSchema.safeParse({
          trackId: validTrackId,
          challengeId: validChallengeId,
        }).success
      ).toBe(true);
    });
  });

  describe('Team Formation Validation Schemas (S2-05)', () => {
    const validUserId = '123e4567-e89b-12d3-a456-426614174003';
    const validMemberId = '123e4567-e89b-12d3-a456-426614174004';

    it('should validate valid team creation payload', () => {
      expect(
        createTeamSchema.safeParse({
          name: 'Quantum Hackers',
          slug: 'quantum-hackers',
          description: 'Building quantum algorithms.',
        }).success
      ).toBe(true);
    });

    it('should reject team creation with short/long name or invalid slug', () => {
      expect(createTeamSchema.safeParse({ name: 'A' }).success).toBe(false);
      expect(createTeamSchema.safeParse({ name: 'Valid Team', slug: 'INVALID SLUG!' }).success).toBe(false);
    });

    it('should validate team invitation payload by userId or email', () => {
      expect(inviteTeamMemberSchema.safeParse({ inviteeUserId: validUserId }).success).toBe(true);
      expect(inviteTeamMemberSchema.safeParse({ inviteeEmail: 'student@example.com' }).success).toBe(true);
      expect(inviteTeamMemberSchema.safeParse({}).success).toBe(false);
    });

    it('should validate transfer captaincy payload', () => {
      expect(transferCaptaincySchema.safeParse({ targetMemberId: validMemberId }).success).toBe(true);
      expect(transferCaptaincySchema.safeParse({ targetMemberId: 'invalid' }).success).toBe(false);
    });
  });
});




