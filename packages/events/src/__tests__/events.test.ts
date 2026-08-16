import { createEventEnvelope, isEventEnvelope } from '../envelope';

describe('Event Envelope Infrastructure', () => {
  it('should construct a valid event envelope with default version and generated ID', () => {
    const envelope = createEventEnvelope({
      type: 'InfrastructureTestExecuted',
      correlationId: 'req_corr_123',
      payload: { message: 'hello event' },
    });

    expect(envelope.id).toBeDefined();
    expect(typeof envelope.id).toBe('string');
    expect(envelope.id.length).toBeGreaterThan(0);
    expect(envelope.type).toBe('InfrastructureTestExecuted');
    expect(envelope.version).toBe(1);
    expect(envelope.correlationId).toBe('req_corr_123');
    expect(envelope.occurredAt).toBeDefined();
    expect(new Date(envelope.occurredAt).getTime()).not.toBeNaN();
    expect(envelope.payload).toEqual({ message: 'hello event' });
  });

  it('should preserve custom event ID, version, actorId, and timestamp', () => {
    const customTime = new Date('2026-08-16T12:00:00Z');
    const envelope = createEventEnvelope({
      id: 'custom_evt_999',
      type: 'OrganizationCreated',
      version: 2,
      occurredAt: customTime,
      correlationId: 'corr_xyz',
      actorId: 'usr_actor_1',
      organizationId: 'org_main',
      aggregateType: 'Organization',
      aggregateId: 'org_main',
      payload: { name: 'Acme Hackers' },
    });

    expect(envelope.id).toBe('custom_evt_999');
    expect(envelope.version).toBe(2);
    expect(envelope.occurredAt).toBe('2026-08-16T12:00:00.000Z');
    expect(envelope.actorId).toBe('usr_actor_1');
    expect(envelope.organizationId).toBe('org_main');
    expect(envelope.aggregateType).toBe('Organization');
    expect(envelope.aggregateId).toBe('org_main');
  });

  it('should validate structure using isEventEnvelope type guard', () => {
    const valid = createEventEnvelope({
      type: 'ScoreCalculated',
      correlationId: 'trace_1',
      payload: { score: 98 },
    });

    expect(isEventEnvelope(valid)).toBe(true);
    expect(isEventEnvelope(null)).toBe(false);
    expect(isEventEnvelope({ type: 'ScoreCalculated' })).toBe(false);
  });

  it('should throw when type or correlationId is missing', () => {
    expect(() =>
      createEventEnvelope({
        type: '',
        correlationId: 'corr_1',
        payload: {},
      })
    ).toThrow('valid non-empty string event type');

    expect(() =>
      createEventEnvelope({
        type: 'TestEvent',
        correlationId: '',
        payload: {},
      })
    ).toThrow('valid non-empty string correlationId');
  });
});
