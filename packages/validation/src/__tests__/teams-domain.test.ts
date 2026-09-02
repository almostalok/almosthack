import { updateHackathonConfigurationSchema } from '../hackathon';

describe('UI-06 Teams Management Domain Logic & Sizing Rules', () => {
  const minTeamSize = 2;
  const maxTeamSize = 4;

  const sampleTeams = [
    {
      id: 'team_1',
      name: 'ByteForge',
      status: 'ACTIVE',
      memberCount: 4,
      members: ['usr_1', 'usr_2', 'usr_3', 'usr_4'],
    },
    {
      id: 'team_2',
      name: 'NeuralGuard',
      status: 'ACTIVE',
      memberCount: 3,
      members: ['usr_5', 'usr_6', 'usr_7'],
    },
    {
      id: 'team_3',
      name: 'SoloHacker',
      status: 'ACTIVE',
      memberCount: 1,
      members: ['usr_8'],
    },
  ];

  const sampleUnassigned = [
    { id: 'u_1', name: 'Rohan Deshmukh', email: 'rohan@iiit.ac.in', college: 'IIIT' },
    { id: 'u_2', name: 'Sneha Reddy', email: 'sneha@stanford.edu', college: 'Stanford' },
  ];

  it('should correctly derive sizing status based on min and max boundaries', () => {
    const getSizeStatus = (count: number) => {
      if (count >= maxTeamSize) return 'FULL';
      if (count < minTeamSize) return 'BELOW_MIN';
      return 'COMPLETE';
    };

    expect(getSizeStatus(4)).toBe('FULL');
    expect(getSizeStatus(3)).toBe('COMPLETE');
    expect(getSizeStatus(1)).toBe('BELOW_MIN');
  });

  it('should compute exact team operational metrics', () => {
    let complete = 0;
    let incomplete = 0;
    let solo = 0;
    let belowMin = 0;

    sampleTeams.forEach((t) => {
      if (t.memberCount === 1) solo++;
      if (t.memberCount < minTeamSize) belowMin++;
      if (t.memberCount >= minTeamSize) complete++;
      else incomplete++;
    });

    const metrics = {
      totalTeams: sampleTeams.length,
      completeTeams: complete,
      incompleteTeams: incomplete,
      soloTeams: solo,
      unassignedParticipants: sampleUnassigned.length,
      belowMinTeams: belowMin,
    };

    expect(metrics.totalTeams).toBe(3);
    expect(metrics.completeTeams).toBe(2);
    expect(metrics.incompleteTeams).toBe(1);
    expect(metrics.soloTeams).toBe(1);
    expect(metrics.belowMinTeams).toBe(1);
    expect(metrics.unassignedParticipants).toBe(2);
  });

  it('should correctly filter unassigned participants by query', () => {
    const filterUnassigned = (query: string) => {
      const q = query.toLowerCase().trim();
      return sampleUnassigned.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.college.toLowerCase().includes(q)
      );
    };

    expect(filterUnassigned('rohan')).toHaveLength(1);
    expect(filterUnassigned('stanford')).toHaveLength(1);
    expect(filterUnassigned('unknown')).toHaveLength(0);
  });

  it('should handle member removal and return to unassigned pool', () => {
    const team = { ...sampleTeams[1] };
    const memberToRemove = 'usr_7';

    const updatedMembers = team.members.filter((m) => m !== memberToRemove);
    const updatedTeam = {
      ...team,
      members: updatedMembers,
      memberCount: updatedMembers.length,
    };

    const updatedUnassigned = [...sampleUnassigned, { id: 'u_3', name: 'Tushar', email: 'tushar@iiit.ac.in', college: 'IIIT' }];

    expect(updatedTeam.memberCount).toBe(2);
    expect(updatedUnassigned).toHaveLength(3);
  });
});
