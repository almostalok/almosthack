import { EventEnvelope, CreateEventEnvelopeOptions } from './types';

function generateEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Factory helper to construct standard, typed event envelopes.
 */
export function createEventEnvelope<TPayload>(
  options: CreateEventEnvelopeOptions<TPayload>
): EventEnvelope<TPayload> {
  const {
    id = generateEventId(),
    type,
    version = 1,
    occurredAt = new Date().toISOString(),
    correlationId,
    actorId,
    organizationId,
    aggregateType,
    aggregateId,
    payload,
  } = options;

  if (!type || typeof type !== 'string' || type.trim().length === 0) {
    throw new Error('Event envelope requires a valid non-empty string event type.');
  }

  if (!correlationId || typeof correlationId !== 'string' || correlationId.trim().length === 0) {
    throw new Error('Event envelope requires a valid non-empty string correlationId.');
  }

  const isoTimestamp =
    occurredAt instanceof Date ? occurredAt.toISOString() : occurredAt;

  return {
    id,
    type,
    version,
    occurredAt: isoTimestamp,
    correlationId,
    ...(actorId ? { actorId } : {}),
    ...(organizationId ? { organizationId } : {}),
    ...(aggregateType ? { aggregateType } : {}),
    ...(aggregateId ? { aggregateId } : {}),
    payload,
  };
}

/**
 * Type guard verifying if an object conforms to the EventEnvelope contract structure.
 */
export function isEventEnvelope(obj: unknown): obj is EventEnvelope {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as EventEnvelope).id === 'string' &&
    typeof (obj as EventEnvelope).type === 'string' &&
    typeof (obj as EventEnvelope).version === 'number' &&
    typeof (obj as EventEnvelope).occurredAt === 'string' &&
    typeof (obj as EventEnvelope).correlationId === 'string' &&
    'payload' in obj
  );
}
