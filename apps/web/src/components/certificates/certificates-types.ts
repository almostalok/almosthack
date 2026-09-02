export type CertificateType =
  | 'PARTICIPATION'
  | 'FINALIST'
  | 'WINNER'
  | 'TRACK_WINNER'
  | 'SPECIAL_AWARD';

export type CertificateStatus =
  | 'ELIGIBLE'
  | 'PENDING'
  | 'GENERATING'
  | 'ISSUED'
  | 'FAILED'
  | 'REVOKED';

export interface CertificateItem {
  id: string;
  hackathonId: string;
  hackathonName: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantAvatar?: string;
  teamId?: string;
  teamName?: string;
  type: CertificateType;
  title: string;
  status: CertificateStatus;
  issuedAt?: string;
  verificationId: string;
  verificationUrl: string;
  signatureHash: string;
  awardName?: string;
  trackName?: string;
  pdfUrl?: string;
  failureReason?: string;
  revocationReason?: string;
  revokedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CertificateSummaryMetrics {
  totalEligible: number;
  totalIssued: number;
  totalPending: number;
  totalGenerating: number;
  totalFailed: number;
  totalRevoked: number;
}

export interface CertificateFilterState {
  search: string;
  status: string; // 'ALL' | 'ISSUED' | 'PENDING' | 'GENERATING' | 'FAILED' | 'REVOKED'
  type: string; // 'ALL' | 'PARTICIPATION' | 'FINALIST' | 'WINNER' | 'TRACK_WINNER' | 'SPECIAL_AWARD'
  trackId: string;
  page: number;
  pageSize: number;
}
