describe('UI-16 Hacker Experience Domain Logic', () => {
  describe('Next Action Engine Logic', () => {
    function computeNextAction(state: {
      isRegistered: boolean;
      hasTeam: boolean;
      hasRepo: boolean;
      submissionStatus: 'NONE' | 'DRAFT' | 'SUBMITTED';
      isRequirementsMet: boolean;
      isResultsPublished: boolean;
    }) {
      if (!state.isRegistered) {
        return { type: 'COMPLETE_REGISTRATION', priority: 'URGENT' };
      }
      if (!state.hasTeam) {
        return { type: 'CREATE_OR_JOIN_TEAM', priority: 'HIGH' };
      }
      if (!state.hasRepo) {
        return { type: 'CONNECT_REPOSITORY', priority: 'HIGH' };
      }
      if (state.submissionStatus === 'DRAFT') {
        if (state.isRequirementsMet) {
          return { type: 'SUBMIT_PROJECT', priority: 'URGENT' };
        }
        return { type: 'COMPLETE_SUBMISSION', priority: 'NORMAL' };
      }
      if (state.isResultsPublished) {
        return { type: 'VIEW_RESULTS', priority: 'HIGH' };
      }
      return { type: 'AWAIT_JUDGING', priority: 'NORMAL' };
    }

    it('should recommend registration when user is not registered', () => {
      const action = computeNextAction({
        isRegistered: false,
        hasTeam: false,
        hasRepo: false,
        submissionStatus: 'NONE',
        isRequirementsMet: false,
        isResultsPublished: false,
      });
      expect(action.type).toBe('COMPLETE_REGISTRATION');
      expect(action.priority).toBe('URGENT');
    });

    it('should recommend team formation when registered but no team', () => {
      const action = computeNextAction({
        isRegistered: true,
        hasTeam: false,
        hasRepo: false,
        submissionStatus: 'NONE',
        isRequirementsMet: false,
        isResultsPublished: false,
      });
      expect(action.type).toBe('CREATE_OR_JOIN_TEAM');
      expect(action.priority).toBe('HIGH');
    });

    it('should recommend connecting repo when in team but repo is missing', () => {
      const action = computeNextAction({
        isRegistered: true,
        hasTeam: true,
        hasRepo: false,
        submissionStatus: 'DRAFT',
        isRequirementsMet: false,
        isResultsPublished: false,
      });
      expect(action.type).toBe('CONNECT_REPOSITORY');
    });

    it('should recommend final submission when all 6 requirements are met', () => {
      const action = computeNextAction({
        isRegistered: true,
        hasTeam: true,
        hasRepo: true,
        submissionStatus: 'DRAFT',
        isRequirementsMet: true,
        isResultsPublished: false,
      });
      expect(action.type).toBe('SUBMIT_PROJECT');
      expect(action.priority).toBe('URGENT');
    });

    it('should recommend viewing results when hackathon results are published', () => {
      const action = computeNextAction({
        isRegistered: true,
        hasTeam: true,
        hasRepo: true,
        submissionStatus: 'SUBMITTED',
        isRequirementsMet: true,
        isResultsPublished: true,
      });
      expect(action.type).toBe('VIEW_RESULTS');
    });
  });

  describe('Submission Requirements Checklist', () => {
    it('should calculate submission completion percentage accurately', () => {
      const form = {
        title: 'ByteForge Sync',
        description: 'Detailed architecture with WASM container execution engine...',
        trackId: 'trk_core_infra',
        repositoryUrl: 'https://github.com/byteforge/core',
        demoUrl: 'https://byteforge-demo.vercel.app',
        commitSha: '7f9c2a1e4b3d8c9a',
      };

      const checks = [
        { id: 'title', isComplete: !!form.title.trim() },
        { id: 'description', isComplete: form.description.length >= 20 },
        { id: 'track', isComplete: !!form.trackId },
        { id: 'repo', isComplete: !!form.repositoryUrl },
        { id: 'demo', isComplete: !!form.demoUrl.trim() },
        { id: 'commit', isComplete: !!form.commitSha },
      ];

      const completed = checks.filter((c) => c.isComplete).length;
      const percent = Math.round((completed / checks.length) * 100);

      expect(completed).toBe(6);
      expect(percent).toBe(100);
    });

    it('should flag incomplete when description is too short or missing fields', () => {
      const form = {
        title: 'Draft',
        description: 'Short',
        trackId: '',
        repositoryUrl: '',
        demoUrl: '',
        commitSha: '',
      };

      const checks = [
        { id: 'title', isComplete: !!form.title.trim() },
        { id: 'description', isComplete: form.description.length >= 20 },
        { id: 'track', isComplete: !!form.trackId },
        { id: 'repo', isComplete: !!form.repositoryUrl },
        { id: 'demo', isComplete: !!form.demoUrl.trim() },
        { id: 'commit', isComplete: !!form.commitSha },
      ];

      const completed = checks.filter((c) => c.isComplete).length;
      expect(completed).toBe(1); // only title is present
      expect(checks.every((c) => c.isComplete)).toBe(false);
    });
  });

  describe('Countdown & Timezone Handling', () => {
    it('should correctly prevent negative countdown numbers after expiry', () => {
      const pastDeadline = new Date(Date.now() - 1000 * 60 * 60).getTime();
      const now = Date.now();
      const diff = pastDeadline - now;

      const isExpired = diff <= 0;
      const days = isExpired ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = isExpired ? 0 : Math.floor((diff / (1000 * 60 * 60)) % 24);

      expect(isExpired).toBe(true);
      expect(days).toBe(0);
      expect(hours).toBe(0);
    });
  });
});
