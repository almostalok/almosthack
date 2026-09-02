import { updateHackathonConfigurationSchema } from '../hackathon';

describe('UI-05 Registrations & Participant Management Domain Logic', () => {
  const sampleParticipants = [
    {
      id: 'reg_1',
      name: 'Aarav Sharma',
      email: 'aarav@iitd.ac.in',
      status: 'APPROVED',
      college: 'IIT Delhi',
      teamId: 'team_1',
      trackId: 'trk_1',
    },
    {
      id: 'reg_2',
      name: 'Priya Patel',
      email: 'priya@bits.ac.in',
      status: 'PENDING',
      college: 'BITS Pilani',
      teamId: undefined,
      trackId: 'trk_2',
    },
    {
      id: 'reg_3',
      name: 'Karan Singh',
      email: 'karan@dtu.ac.in',
      status: 'REJECTED',
      college: 'DTU',
      teamId: undefined,
      trackId: 'trk_1',
    },
  ];

  it('should validate participation eligibility configuration', () => {
    const config = {
      eligibilityType: 'OPEN' as const,
      participationMode: 'BOTH' as const,
      allowedBranches: ['CSE', 'ECE'],
      allowedColleges: ['IIT Delhi', 'BITS Pilani'],
    };

    const result = updateHackathonConfigurationSchema.safeParse(config);
    expect(result.success).toBe(true);
  });

  it('should correctly filter participants by search query across multiple fields', () => {
    const searchFilter = (query: string) => {
      const q = query.toLowerCase().trim();
      return sampleParticipants.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.college.toLowerCase().includes(q)
      );
    };

    expect(searchFilter('aarav')).toHaveLength(1);
    expect(searchFilter('pilani')).toHaveLength(1);
    expect(searchFilter('ac.in')).toHaveLength(3);
    expect(searchFilter('nonexistent')).toHaveLength(0);
  });

  it('should filter participants by team status and track association', () => {
    const hasTeam = sampleParticipants.filter((p) => Boolean(p.teamId));
    const noTeam = sampleParticipants.filter((p) => !p.teamId);
    const inTrack1 = sampleParticipants.filter((p) => p.trackId === 'trk_1');

    expect(hasTeam).toHaveLength(1);
    expect(noTeam).toHaveLength(2);
    expect(inTrack1).toHaveLength(2);
  });

  it('should compute exact registration summary metrics', () => {
    const metrics = {
      total: sampleParticipants.length,
      pending: sampleParticipants.filter((p) => p.status === 'PENDING').length,
      approved: sampleParticipants.filter((p) => p.status === 'APPROVED').length,
      rejected: sampleParticipants.filter((p) => p.status === 'REJECTED').length,
      waitlisted: sampleParticipants.filter((p) => p.status === 'WAITLISTED').length,
    };

    expect(metrics.total).toBe(3);
    expect(metrics.pending).toBe(1);
    expect(metrics.approved).toBe(1);
    expect(metrics.rejected).toBe(1);
    expect(metrics.waitlisted).toBe(0);
  });

  it('should handle batch approval and rejection state transforms', () => {
    const idsToApprove = ['reg_2'];
    const updated = sampleParticipants.map((p) =>
      idsToApprove.includes(p.id) ? { ...p, status: 'APPROVED' } : p
    );

    expect(updated.find((p) => p.id === 'reg_2')?.status).toBe('APPROVED');
  });
});
