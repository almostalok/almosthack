export interface ApiClientErrorOptions {
  status: number;
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly requestId: string;
  public readonly details?: unknown;
  public readonly isApiClientError = true;

  constructor(options: ApiClientErrorOptions) {
    super(options.message);
    this.name = 'ApiClientError';
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.details = options.details;

    // Restore prototype chain for instanceof checks across transpilation targets
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }

  public toJSON() {
    return {
      name: this.name,
      status: this.status,
      code: this.code,
      message: this.message,
      requestId: this.requestId,
      details: this.details,
    };
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as ApiClientError).isApiClientError === true
  );
}
