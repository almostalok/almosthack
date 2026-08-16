export interface EventEnvelope<TPayload = unknown> {
  /** Unique event identifier */
  id: string;
  /** Explicit past-tense domain event name (e.g. "UserCreated", "SubmissionSubmitted") */
  type: string;
  /** Explicit numeric event version (e.g. 1) */
  version: number;
  /** ISO 8601 UTC timestamp string when the event occurred */
  occurredAt: string;
  /** Correlation ID for tracing across request → domain operation → event → worker job */
  correlationId: string;
  /** Optional ID of the actor initiating the operation */
  actorId?: string;
  /** Optional organization identifier associated with the event */
  organizationId?: string;
  /** Optional aggregate domain entity type */
  aggregateType?: string;
  /** Optional aggregate domain entity identifier */
  aggregateId?: string;
  /** Strongly typed payload */
  payload: TPayload;
}

export interface CreateEventEnvelopeOptions<TPayload> {
  id?: string;
  type: string;
  version?: number;
  occurredAt?: string | Date;
  correlationId: string;
  actorId?: string;
  organizationId?: string;
  aggregateType?: string;
  aggregateId?: string;
  payload: TPayload;
}
