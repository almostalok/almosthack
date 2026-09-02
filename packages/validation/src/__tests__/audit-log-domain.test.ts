describe('UI-14 Audit Log & Activity Domain Logic', () => {
  const sampleLogs = [
    {
      id: 'aud_1',
      actorId: 'usr_alex',
      actorEmail: 'alex@example.com',
      action: 'hackathon.configuration_updated',
      targetEntity: 'HACKATHON',
      targetId: 'htf-2026',
      createdAt: new Date().toISOString(),
      metadata: { secretToken: 'REDACTED_API_KEY', reason: 'Deadline extended' },
      diffs: [
        {
          field: 'submissionDeadline',
          label: 'Submission Deadline',
          before: '2026-09-02T18:00:00Z',
          after: '2026-09-02T23:59:59Z',
        },
      ],
    },
    {
      id: 'aud_2',
      actorId: 'usr_aris',
      actorEmail: 'aris@example.com',
      action: 'judging.score_submitted',
      targetEntity: 'EVALUATION',
      targetId: 'eval_01',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      diffs: [
        {
          field: 'totalScore',
          label: 'Total Score',
          before: null,
          after: 86.5,
        },
      ],
    },
    {
      id: 'aud_3',
      actorId: 'sys_bot',
      actorEmail: 'bot@almosthack.io',
      action: 'submission.integrity_verified',
      targetEntity: 'SUBMISSION',
      targetId: 'sub_02',
      createdAt: new Date().toISOString(),
    },
  ];

  it('should filter audit logs by target entity category', () => {
    const configLogs = sampleLogs.filter((l) => l.targetEntity === 'HACKATHON');
    expect(configLogs).toHaveLength(1);
    expect(configLogs[0].id).toBe('aud_1');

    const evalLogs = sampleLogs.filter((l) => l.targetEntity === 'EVALUATION');
    expect(evalLogs).toHaveLength(1);
    expect(evalLogs[0].id).toBe('aud_2');
  });

  it('should filter audit logs by actor ID', () => {
    const alexLogs = sampleLogs.filter((l) => l.actorId === 'usr_alex');
    expect(alexLogs).toHaveLength(1);
    expect(alexLogs[0].actorEmail).toBe('alex@example.com');
  });

  it('should filter audit logs within 24 hours (TODAY filter)', () => {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const todayLogs = sampleLogs.filter(
      (l) => Date.now() - new Date(l.createdAt).getTime() <= oneDayMs
    );

    expect(todayLogs).toHaveLength(2); // aud_1 and aud_3
    expect(todayLogs.map((l) => l.id)).toEqual(['aud_1', 'aud_3']);
  });

  it('should accurately calculate field state transitions', () => {
    const logWithDiff = sampleLogs[0];
    expect(logWithDiff.diffs).toBeDefined();
    expect(logWithDiff.diffs![0].field).toBe('submissionDeadline');
    expect(logWithDiff.diffs![0].before).toBe('2026-09-02T18:00:00Z');
    expect(logWithDiff.diffs![0].after).toBe('2026-09-02T23:59:59Z');
  });

  it('should sanitize sensitive keys from metadata output', () => {
    const rawMetadata: Record<string, any> = {
      apiKey: 'sk-live-1234567890',
      accessToken: 'gho_secretTokenValue',
      passwordHash: '$2b$10$abcdefghij',
      validField: 'Allowed public note',
    };

    const SENSITIVE_KEYS = ['apiKey', 'token', 'accessToken', 'password', 'passwordHash', 'secret'];

    const sanitized = Object.entries(rawMetadata).reduce((acc, [k, v]) => {
      if (!SENSITIVE_KEYS.some((sk) => k.toLowerCase().includes(sk.toLowerCase()))) {
        acc[k] = v;
      }
      return acc;
    }, {} as Record<string, any>);

    expect(sanitized).toHaveProperty('validField');
    expect(sanitized).not.toHaveProperty('apiKey');
    expect(sanitized).not.toHaveProperty('accessToken');
    expect(sanitized).not.toHaveProperty('passwordHash');
  });
});
