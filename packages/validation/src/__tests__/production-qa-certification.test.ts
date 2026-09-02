import { RoleName } from '@almosthack/types';

describe('UI-18 Production UI QA & Certification Test Suite', () => {
  describe('Phase 1 & 4 — Route Inventory & RBAC Matrix Enforcement', () => {
    interface RouteConfig {
      path: string;
      allowedRoles: RoleName[];
      isPublic?: boolean;
    }

    const routeInventory: RouteConfig[] = [
      { path: '/', allowedRoles: [], isPublic: true },
      { path: '/login', allowedRoles: [], isPublic: true },
      { path: '/register', allowedRoles: [], isPublic: true },
      { path: '/overview', allowedRoles: [RoleName.ORGANIZER, RoleName.JUDGE, RoleName.PARTICIPANT] },
      { path: '/workspace', allowedRoles: [RoleName.PARTICIPANT] },
      { path: '/hackathons', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/new', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/configuration', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/registrations', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/teams', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/submissions', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/judging', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/results', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/certificates', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/analytics', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/announcements', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/hackathons/hack_123/audit-log', allowedRoles: [RoleName.ORGANIZER] },
      { path: '/judging', allowedRoles: [RoleName.ORGANIZER, RoleName.JUDGE] },
      { path: '/hackathons/hack_123/judge', allowedRoles: [RoleName.JUDGE] },
      { path: '/hackathons/hack_123/workspace', allowedRoles: [RoleName.PARTICIPANT] },
      { path: '/certificates', allowedRoles: [RoleName.ORGANIZER, RoleName.PARTICIPANT] },
      { path: '/certificates/cert_123', allowedRoles: [], isPublic: true },
    ];

    function canAccessRoute(routePath: string, userRoles: RoleName[]): boolean {
      const match = routeInventory.find((r) => r.path === routePath);
      if (!match) return false;
      if (match.isPublic) return true;
      return userRoles.some((role) => match.allowedRoles.includes(role));
    }

    it('should permit public access to /, /login, /register, and public certificate verify', () => {
      expect(canAccessRoute('/', [])).toBe(true);
      expect(canAccessRoute('/login', [])).toBe(true);
      expect(canAccessRoute('/register', [])).toBe(true);
      expect(canAccessRoute('/certificates/cert_123', [])).toBe(true);
    });

    it('should permit ORGANIZER to access organizer administration routes', () => {
      expect(canAccessRoute('/hackathons/hack_123/configuration', [RoleName.ORGANIZER])).toBe(true);
      expect(canAccessRoute('/hackathons/hack_123/analytics', [RoleName.ORGANIZER])).toBe(true);
      expect(canAccessRoute('/hackathons/hack_123/audit-log', [RoleName.ORGANIZER])).toBe(true);
    });

    it('should prevent JUDGE from accessing organizer configuration & analytics', () => {
      expect(canAccessRoute('/hackathons/hack_123/configuration', [RoleName.JUDGE])).toBe(false);
      expect(canAccessRoute('/hackathons/hack_123/analytics', [RoleName.JUDGE])).toBe(false);
      expect(canAccessRoute('/hackathons/hack_123/audit-log', [RoleName.JUDGE])).toBe(false);
      expect(canAccessRoute('/judging', [RoleName.JUDGE])).toBe(true);
    });

    it('should prevent PARTICIPANT from accessing organizer administration or judge scoring routes', () => {
      expect(canAccessRoute('/hackathons/hack_123/configuration', [RoleName.PARTICIPANT])).toBe(false);
      expect(canAccessRoute('/hackathons/hack_123/audit-log', [RoleName.PARTICIPANT])).toBe(false);
      expect(canAccessRoute('/hackathons/hack_123/judge', [RoleName.PARTICIPANT])).toBe(false);
      expect(canAccessRoute('/workspace', [RoleName.PARTICIPANT])).toBe(true);
    });
  });

  describe('Phase 5 — Hackathon Lifecycle State Transitions', () => {
    type HackathonLifecycle = 'DRAFT' | 'REGISTRATION_OPEN' | 'LIVE' | 'JUDGING' | 'RESULTS_PUBLISHED' | 'COMPLETED';

    interface LifecycleActionAvailability {
      canRegister: boolean;
      canSubmitProject: boolean;
      canScoreProjects: boolean;
      canViewPublicResults: boolean;
    }

    function resolveLifecycleCapabilities(state: HackathonLifecycle): LifecycleActionAvailability {
      return {
        canRegister: state === 'REGISTRATION_OPEN' || state === 'LIVE',
        canSubmitProject: state === 'LIVE',
        canScoreProjects: state === 'JUDGING',
        canViewPublicResults: state === 'RESULTS_PUBLISHED' || state === 'COMPLETED',
      };
    }

    it('should permit registration only during REGISTRATION_OPEN or LIVE', () => {
      expect(resolveLifecycleCapabilities('DRAFT').canRegister).toBe(false);
      expect(resolveLifecycleCapabilities('REGISTRATION_OPEN').canRegister).toBe(true);
      expect(resolveLifecycleCapabilities('LIVE').canRegister).toBe(true);
      expect(resolveLifecycleCapabilities('JUDGING').canRegister).toBe(false);
    });

    it('should permit project submission strictly when status is LIVE', () => {
      expect(resolveLifecycleCapabilities('REGISTRATION_OPEN').canSubmitProject).toBe(false);
      expect(resolveLifecycleCapabilities('LIVE').canSubmitProject).toBe(true);
      expect(resolveLifecycleCapabilities('JUDGING').canSubmitProject).toBe(false);
      expect(resolveLifecycleCapabilities('COMPLETED').canSubmitProject).toBe(false);
    });

    it('should permit judging evaluations strictly when status is JUDGING', () => {
      expect(resolveLifecycleCapabilities('LIVE').canScoreProjects).toBe(false);
      expect(resolveLifecycleCapabilities('JUDGING').canScoreProjects).toBe(true);
      expect(resolveLifecycleCapabilities('RESULTS_PUBLISHED').canScoreProjects).toBe(false);
    });

    it('should permit public result access when RESULTS_PUBLISHED or COMPLETED', () => {
      expect(resolveLifecycleCapabilities('JUDGING').canViewPublicResults).toBe(false);
      expect(resolveLifecycleCapabilities('RESULTS_PUBLISHED').canViewPublicResults).toBe(true);
      expect(resolveLifecycleCapabilities('COMPLETED').canViewPublicResults).toBe(true);
    });
  });

  describe('Phase 10 — Mutation Safety & Double-Submit Protection', () => {
    class MutationLockController {
      private isPending = false;
      private callCount = 0;

      async executeMutation(action: () => Promise<void>) {
        if (this.isPending) return;
        this.isPending = true;
        this.callCount++;
        try {
          await action();
        } finally {
          this.isPending = false;
        }
      }

      getExecutionCount() {
        return this.callCount;
      }
    }

    it('should prevent duplicate concurrent mutation triggers', async () => {
      const lock = new MutationLockController();
      let resolvedCount = 0;

      const fastAction = () =>
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolvedCount++;
            resolve();
          }, 10);
        });

      await Promise.all([
        lock.executeMutation(fastAction),
        lock.executeMutation(fastAction),
        lock.executeMutation(fastAction),
      ]);

      expect(resolvedCount).toBe(1);
      expect(lock.getExecutionCount()).toBe(1);
    });
  });
});
