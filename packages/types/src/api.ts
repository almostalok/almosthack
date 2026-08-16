/**
 * Standard API Success Response Contract
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    requestId?: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    totalCount?: number;
    totalPages?: number;
  };
}

/**
 * Standard API Error Detail Structure
 */
export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
}

/**
 * Standard API Error Response Envelope
 */
export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorDetail;
}
