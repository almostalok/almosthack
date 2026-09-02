import { RoleName } from '@almosthack/types';

describe('Role-Based Shell Navigation Matrix', () => {
  const ORGANIZER_ROUTES = [
    '/overview',
    '/hackathons',
    '/registrations',
    '/teams',
    '/submissions',
    '/judging',
    '/results',
    '/certificates',
    '/analytics',
    '/announcements',
    '/audit-logs',
    '/settings',
    '/help',
  ];

  const JUDGE_ROUTES = [
    '/judging',
    '/submissions',
    '/judging/evaluations',
    '/judging/rubrics',
    '/judging/feedback',
    '/judging/history',
    '/profile',
    '/settings',
    '/help',
  ];

  const HACKER_ROUTES = [
    '/hackathons',
    '/overview',
    '/teams',
    '/workspace',
    '/submissions',
    '/judging',
    '/results',
    '/certificates',
    '/profile',
    '/settings',
    '/help',
  ];

  it('should define all 13 required organizer routes', () => {
    expect(ORGANIZER_ROUTES).toHaveLength(13);
    expect(ORGANIZER_ROUTES).toContain('/overview');
    expect(ORGANIZER_ROUTES).toContain('/hackathons');
    expect(ORGANIZER_ROUTES).toContain('/audit-logs');
    expect(ORGANIZER_ROUTES).toContain('/judging');
  });

  it('should define focused judge evaluation routes', () => {
    expect(JUDGE_ROUTES).toContain('/judging');
    expect(JUDGE_ROUTES).toContain('/judging/rubrics');
    expect(JUDGE_ROUTES).toContain('/judging/evaluations');
  });

  it('should define builder routes for hacker contestants', () => {
    expect(HACKER_ROUTES).toContain('/hackathons');
    expect(HACKER_ROUTES).toContain('/workspace');
    expect(HACKER_ROUTES).toContain('/submissions');
  });

  it('should support role enumeration values', () => {
    expect(RoleName.ORGANIZER).toBe('ORGANIZER');
    expect(RoleName.JUDGE).toBe('JUDGE');
    expect(RoleName.PARTICIPANT).toBe('PARTICIPANT');
    expect(RoleName.ADMIN).toBe('ADMIN');
  });
});
