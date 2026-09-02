'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import {
  TeamItem,
  TeamMemberItem,
  UnassignedParticipantItem,
  TeamMetrics,
  TeamFilterState,
  TeamStatus,
} from './teams-types';
import {
  MOCK_TEAMS,
  MOCK_UNASSIGNED_PARTICIPANTS,
  MOCK_TEAM_METRICS,
} from './teams-mock-data';

export interface UseTeamsOptions {
  hackathonId: string;
  initialFilters?: Partial<TeamFilterState>;
}

export function useTeams({ hackathonId, initialFilters }: UseTeamsOptions) {
  const queryClient = useQueryClient();

  // Local state for interactive preview
  const [localTeams, setLocalTeams] = useState<TeamItem[]>(MOCK_TEAMS);
  const [localUnassigned, setLocalUnassigned] = useState<UnassignedParticipantItem[]>(
    MOCK_UNASSIGNED_PARTICIPANTS
  );

  // Filters State
  const [filters, setFilters] = useState<TeamFilterState>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || 'ALL',
    sizeFilter: initialFilters?.sizeFilter || 'ALL',
    trackId: initialFilters?.trackId || 'ALL',
    tab: initialFilters?.tab || 'TEAMS',
    page: initialFilters?.page || 1,
    pageSize: initialFilters?.pageSize || 10,
  });

  // Selected team for drawer
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Modals state
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [addingMemberTeam, setAddingMemberTeam] = useState<TeamItem | null>(null);
  const [removingMemberData, setRemovingMemberData] = useState<{
    team: TeamItem;
    member: TeamMemberItem;
  } | null>(null);
  const [disbandingTeam, setDisbandingTeam] = useState<TeamItem | null>(null);
  const [assigningParticipant, setAssigningParticipant] = useState<UnassignedParticipantItem | null>(null);

  // Fetch hackathon configuration for team sizing boundaries
  const { data: config } = useQuery({
    queryKey: ['hackathon-config', hackathonId],
    queryFn: async () => {
      try {
        return await apiClient.getHackathonConfiguration(hackathonId);
      } catch {
        return {
          minTeamSize: 2,
          maxTeamSize: 4,
          participationMode: 'BOTH',
        };
      }
    },
    enabled: Boolean(hackathonId),
  });

  const minTeamSize = config?.minTeamSize ?? 2;
  const maxTeamSize = config?.maxTeamSize ?? 4;

  // Fetch tracks
  const { data: rawTracks = [] } = useQuery({
    queryKey: ['hackathon-tracks', hackathonId],
    queryFn: async () => {
      try {
        const res = await apiClient.getHackathonTracks(hackathonId);
        return Array.isArray(res) ? res : [];
      } catch {
        return [
          { id: 'trk_1', name: 'Open Innovation / Systems' },
          { id: 'trk_2', name: 'AI Safety & Intelligent Workflows' },
        ];
      }
    },
    enabled: Boolean(hackathonId),
  });

  const tracks = useMemo(() => {
    return rawTracks.length > 0
      ? rawTracks.map((t: any) => ({ id: t.id, name: t.name }))
      : [
          { id: 'trk_1', name: 'Open Innovation / Systems' },
          { id: 'trk_2', name: 'AI Safety & Intelligent Workflows' },
        ];
  }, [rawTracks]);

  // Fetch teams from server or fallback
  const {
    data: serverTeams,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['hackathon-teams', hackathonId],
    queryFn: async () => {
      try {
        // Query server if endpoint exists
        return localTeams;
      } catch {
        return localTeams;
      }
    },
    enabled: Boolean(hackathonId),
  });

  const allTeams = serverTeams || localTeams;

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    return allTeams.filter((t) => {
      // Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesTrack = t.trackName?.toLowerCase().includes(q) || false;
        const matchesCaptain = t.captain.name.toLowerCase().includes(q);
        const matchesMembers = t.members.some((m) =>
          m.name.toLowerCase().includes(q) || m.college?.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesTrack && !matchesCaptain && !matchesMembers) {
          return false;
        }
      }

      // Status
      if (filters.status !== 'ALL' && t.status !== filters.status) {
        return false;
      }

      // Track
      if (filters.trackId !== 'ALL' && t.trackId !== filters.trackId) {
        return false;
      }

      // Size Filter
      if (filters.sizeFilter === 'FULL' && t.memberCount < t.maxTeamSize) {
        return false;
      }
      if (filters.sizeFilter === 'HAS_SLOTS' && t.memberCount >= t.maxTeamSize) {
        return false;
      }
      if (filters.sizeFilter === 'BELOW_MIN' && t.memberCount >= t.minTeamSize) {
        return false;
      }

      return true;
    });
  }, [allTeams, filters]);

  // Paginated Teams
  const paginatedTeams = useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize;
    return filteredTeams.slice(start, start + filters.pageSize);
  }, [filteredTeams, filters.page, filters.pageSize]);

  const totalPages = Math.ceil(filteredTeams.length / filters.pageSize) || 1;

  // Filtered Unassigned Participants
  const filteredUnassigned = useMemo(() => {
    if (!filters.search.trim()) return localUnassigned;
    const q = filters.search.toLowerCase().trim();
    return localUnassigned.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.college.toLowerCase().includes(q)
    );
  }, [localUnassigned, filters.search]);

  // Compute Metrics
  const metrics: TeamMetrics = useMemo(() => {
    let complete = 0;
    let incomplete = 0;
    let solo = 0;
    let belowMin = 0;

    allTeams.forEach((t) => {
      if (t.status === 'ACTIVE' || t.status === 'LOCKED') {
        if (t.memberCount === 1) solo++;
        if (t.memberCount < t.minTeamSize) belowMin++;
        if (t.memberCount >= t.minTeamSize) complete++;
        else incomplete++;
      }
    });

    return {
      totalTeams: allTeams.filter((t) => t.status !== 'DISSOLVED').length,
      completeTeams: complete,
      incompleteTeams: incomplete,
      soloTeams: solo,
      unassignedParticipants: localUnassigned.length,
      belowMinTeams: belowMin,
    };
  }, [allTeams, localUnassigned]);

  // Selected Team for Drawer
  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return allTeams.find((t) => t.id === selectedTeamId) || null;
  }, [allTeams, selectedTeamId]);

  // Filter handlers
  const updateFilters = useCallback((updates: Partial<TeamFilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...updates,
      page: updates.page !== undefined ? updates.page : 1,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'ALL',
      sizeFilter: 'ALL',
      trackId: 'ALL',
      tab: 'TEAMS',
      page: 1,
      pageSize: 10,
    });
  }, []);

  // Mutation: Create Team
  const createTeamMutation = useMutation({
    mutationFn: async ({
      name,
      trackId,
      captainName,
    }: {
      name: string;
      trackId?: string;
      captainName: string;
    }) => {
      const track = tracks.find((tr) => tr.id === trackId);
      const newTeam: TeamItem = {
        id: `team_${Date.now()}`,
        hackathonId,
        name: name.trim(),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        trackId: trackId || undefined,
        trackName: track?.name || undefined,
        status: 'ACTIVE',
        sizeStatus: minTeamSize > 1 ? 'BELOW_MIN' : 'COMPLETE',
        memberCount: 1,
        minTeamSize,
        maxTeamSize,
        captain: {
          id: `mem_${Date.now()}`,
          userId: `usr_${Date.now()}`,
          name: captainName.trim() || 'Team Lead',
        },
        members: [
          {
            id: `mem_${Date.now()}`,
            userId: `usr_${Date.now()}`,
            name: captainName.trim() || 'Team Lead',
            username: captainName.toLowerCase().replace(/\s+/g, '_') || 'team_lead',
            email: `${captainName.toLowerCase().replace(/\s+/g, '.')}@hackathon.dev`,
            skills: ['Generalist'],
            role: 'CAPTAIN',
            status: 'ACTIVE',
            joinedAt: new Date().toISOString(),
          },
        ],
        invitations: [],
        submissionStatus: 'NONE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLocalTeams((prev) => [newTeam, ...prev]);
      return newTeam;
    },
    onSuccess: (newTeam) => {
      setIsCreateTeamOpen(false);
      setSelectedTeamId(newTeam.id);
      queryClient.invalidateQueries({ queryKey: ['hackathon-teams', hackathonId] });
    },
  });

  // Mutation: Add Member to Team
  const addMemberMutation = useMutation({
    mutationFn: async ({
      teamId,
      unassignedId,
    }: {
      teamId: string;
      unassignedId: string;
    }) => {
      const candidate = localUnassigned.find((u) => u.id === unassignedId);
      if (!candidate) throw new Error('Participant not found.');

      setLocalTeams((prev) =>
        prev.map((t) => {
          if (t.id === teamId) {
            const newMember: TeamMemberItem = {
              id: `mem_${Date.now()}`,
              userId: candidate.userId,
              name: candidate.name,
              username: candidate.username,
              email: candidate.email,
              college: candidate.college,
              branch: candidate.branch,
              skills: candidate.skills,
              role: 'MEMBER',
              status: 'ACTIVE',
              joinedAt: new Date().toISOString(),
            };
            const updatedMembers = [...t.members, newMember];
            const newCount = updatedMembers.length;
            const newSizeStatus =
              newCount >= t.maxTeamSize
                ? 'FULL'
                : newCount >= t.minTeamSize
                ? 'COMPLETE'
                : 'BELOW_MIN';

            return {
              ...t,
              members: updatedMembers,
              memberCount: newCount,
              sizeStatus: newSizeStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );

      // Remove from unassigned
      setLocalUnassigned((prev) => prev.filter((u) => u.id !== unassignedId));
      return { success: true };
    },
    onSuccess: () => {
      setAddingMemberTeam(null);
      setAssigningParticipant(null);
      queryClient.invalidateQueries({ queryKey: ['hackathon-teams', hackathonId] });
    },
  });

  // Mutation: Remove Member from Team
  const removeMemberMutation = useMutation({
    mutationFn: async ({
      teamId,
      memberId,
    }: {
      teamId: string;
      memberId: string;
    }) => {
      let removedMember: TeamMemberItem | undefined;

      setLocalTeams((prev) =>
        prev.map((t) => {
          if (t.id === teamId) {
            removedMember = t.members.find((m) => m.id === memberId);
            const remainingMembers = t.members.filter((m) => m.id !== memberId);
            const newCount = remainingMembers.length;
            const newSizeStatus =
              newCount >= t.maxTeamSize
                ? 'FULL'
                : newCount >= t.minTeamSize
                ? 'COMPLETE'
                : 'BELOW_MIN';

            return {
              ...t,
              members: remainingMembers,
              memberCount: newCount,
              sizeStatus: newSizeStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        })
      );

      // Add back to unassigned if member existed
      if (removedMember) {
        const unassignedCandidate: UnassignedParticipantItem = {
          id: `unassigned_${Date.now()}`,
          userId: removedMember.userId,
          name: removedMember.name,
          username: removedMember.username,
          email: removedMember.email,
          college: removedMember.college || 'University',
          branch: removedMember.branch || 'Engineering',
          skills: removedMember.skills,
          registeredAt: new Date().toISOString(),
        };
        setLocalUnassigned((prev) => [unassignedCandidate, ...prev]);
      }

      return { success: true };
    },
    onSuccess: () => {
      setRemovingMemberData(null);
      queryClient.invalidateQueries({ queryKey: ['hackathon-teams', hackathonId] });
    },
  });

  // Mutation: Toggle Team Lock
  const toggleLockMutation = useMutation({
    mutationFn: async (teamId: string) => {
      setLocalTeams((prev) =>
        prev.map((t) => {
          if (t.id === teamId) {
            const newStatus: TeamStatus = t.status === 'LOCKED' ? 'ACTIVE' : 'LOCKED';
            return { ...t, status: newStatus, updatedAt: new Date().toISOString() };
          }
          return t;
        })
      );
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hackathon-teams', hackathonId] });
    },
  });

  // Mutation: Dissolve / Disband Team
  const dissolveTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const targetTeam = localTeams.find((t) => t.id === teamId);
      if (targetTeam) {
        // Move all members to unassigned
        const newUnassigned = targetTeam.members.map((m) => ({
          id: `unassigned_${Date.now()}_${m.id}`,
          userId: m.userId,
          name: m.name,
          username: m.username,
          email: m.email,
          college: m.college || 'University',
          branch: m.branch || 'Engineering',
          skills: m.skills,
          registeredAt: new Date().toISOString(),
        }));

        setLocalUnassigned((prev) => [...newUnassigned, ...prev]);
      }

      setLocalTeams((prev) =>
        prev.map((t) => (t.id === teamId ? { ...t, status: 'DISSOLVED' as TeamStatus } : t))
      );

      return { success: true };
    },
    onSuccess: () => {
      setDisbandingTeam(null);
      setSelectedTeamId(null);
      queryClient.invalidateQueries({ queryKey: ['hackathon-teams', hackathonId] });
    },
  });

  return {
    teams: paginatedTeams,
    allFilteredCount: filteredTeams.length,
    unassignedParticipants: filteredUnassigned,
    unassignedCount: localUnassigned.length,
    metrics,
    tracks,
    filters,
    updateFilters,
    resetFilters,
    selectedTeam,
    selectedTeamId,
    setSelectedTeamId,
    // Sizing rules
    minTeamSize,
    maxTeamSize,
    // Modals
    isCreateTeamOpen,
    setIsCreateTeamOpen,
    addingMemberTeam,
    setAddingMemberTeam,
    removingMemberData,
    setRemovingMemberData,
    disbandingTeam,
    setDisbandingTeam,
    assigningParticipant,
    setAssigningParticipant,
    // Mutations
    createTeam: (name: string, trackId?: string, captainName = 'Lead') =>
      createTeamMutation.mutate({ name, trackId, captainName }),
    isCreatingTeam: createTeamMutation.isPending,
    addMemberToTeam: (teamId: string, unassignedId: string) =>
      addMemberMutation.mutate({ teamId, unassignedId }),
    isAddingMember: addMemberMutation.isPending,
    removeMemberFromTeam: (teamId: string, memberId: string) =>
      removeMemberMutation.mutate({ teamId, memberId }),
    isRemovingMember: removeMemberMutation.isPending,
    toggleTeamLock: (teamId: string) => toggleLockMutation.mutate(teamId),
    isTogglingLock: toggleLockMutation.isPending,
    dissolveTeam: (teamId: string) => dissolveTeamMutation.mutate(teamId),
    isDissolvingTeam: dissolveTeamMutation.isPending,
    // Query State
    isLoading,
    isError,
    error,
    refetch,
    totalPages,
  };
}
