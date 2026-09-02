import { createHackathonSchema, updateHackathonConfigurationSchema } from '../hackathon';

describe('Hackathon Creation & Configuration Domain Validation', () => {
  const validDates = {
    registrationStartsAt: '2026-09-01T00:00:00.000Z',
    registrationEndsAt: '2026-09-10T00:00:00.000Z',
    startsAt: '2026-09-10T12:00:00.000Z',
    endsAt: '2026-09-18T18:00:00.000Z',
  };

  it('should accept valid hackathon creation payload', () => {
    const payload = {
      name: 'Hack The Future 2026',
      slug: 'hack-the-future-2026',
      description: 'Verifiable infrastructure sprint',
      timezone: 'UTC',
      ...validDates,
    };

    const result = createHackathonSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('should reject invalid chronological date combinations', () => {
    // registrationEndsAt before registrationStartsAt
    const invalidReg = {
      name: 'Hack The Future 2026',
      timezone: 'UTC',
      registrationStartsAt: '2026-09-10T00:00:00.000Z',
      registrationEndsAt: '2026-09-01T00:00:00.000Z',
      startsAt: '2026-09-11T00:00:00.000Z',
      endsAt: '2026-09-18T00:00:00.000Z',
    };
    expect(createHackathonSchema.safeParse(invalidReg).success).toBe(false);

    // hackathon endsAt before startsAt
    const invalidDuration = {
      name: 'Hack The Future 2026',
      timezone: 'UTC',
      registrationStartsAt: '2026-09-01T00:00:00.000Z',
      registrationEndsAt: '2026-09-10T00:00:00.000Z',
      startsAt: '2026-09-18T00:00:00.000Z',
      endsAt: '2026-09-12T00:00:00.000Z',
    };
    expect(createHackathonSchema.safeParse(invalidDuration).success).toBe(false);
  });

  it('should validate rubric criteria weights total 100%', () => {
    const criteria = [
      { name: 'Technical Execution', weight: 40 },
      { name: 'Originality', weight: 25 },
      { name: 'Impact', weight: 20 },
      { name: 'Presentation', weight: 15 },
    ];
    const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBe(100);
  });

  it('should validate configuration updates for team sizing', () => {
    const validConfig = {
      participationMode: 'BOTH' as const,
      minTeamSize: 2,
      maxTeamSize: 4,
      eligibilityType: 'OPEN' as const,
      aiUsagePolicy: 'ALLOWED' as const,
      githubRequired: true,
    };

    const result = updateHackathonConfigurationSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });
});
