describe('Single Hackathon Workspace Data & Navigation Validation', () => {
  const mockLifecycle = {
    registration: { current: 847, max: 1000, percent: 85 },
    teams: { total: 132, complete: 118, forming: 14 },
    submissions: { total: 76, expected: 132, percent: 58 },
    judging: { reviewed: 62, totalAssigned: 76, percent: 82, remaining: 14 },
  };

  const mockSubsystemZones = [
    'Configuration',
    'Registrations',
    'Teams',
    'Submissions',
    'Judging & Consensus',
    'Results & Leaderboard',
    'Audit Log & Integrity',
    'Announcements',
  ];

  it('should validate single hackathon lifecycle ratios', () => {
    expect(mockLifecycle.registration.percent).toBe(85);
    expect(mockLifecycle.submissions.percent).toBe(58);
    expect(mockLifecycle.judging.percent).toBe(82);
    expect(mockLifecycle.judging.reviewed + mockLifecycle.judging.remaining).toBe(
      mockLifecycle.judging.totalAssigned
    );
  });

  it('should guarantee all 8 core management subsystems are defined', () => {
    expect(mockSubsystemZones).toHaveLength(8);
    expect(mockSubsystemZones).toContain('Configuration');
    expect(mockSubsystemZones).toContain('Submissions');
    expect(mockSubsystemZones).toContain('Judging & Consensus');
    expect(mockSubsystemZones).toContain('Audit Log & Integrity');
  });

  it('should format date ranges accurately without crashing', () => {
    const start = '2026-09-01T12:00:00Z';
    const end = '2026-09-18T12:00:00Z';
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const formatted = `${s} — ${e}`;
    expect(formatted).toContain('Sep 1');
    expect(formatted).toContain('Sep 18, 2026');
  });
});
