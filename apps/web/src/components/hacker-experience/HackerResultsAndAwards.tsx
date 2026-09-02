'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Medal,
  Stamp,
  ExternalLink,
  Download,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { CertificateItem } from '../certificates/certificates-types';

export interface HackerResultsAndAwardsProps {
  isPublished: boolean;
  rank?: number;
  totalTeams?: number;
  score?: number;
  awards?: string[];
  certificates: CertificateItem[];
}

export const HackerResultsAndAwards: React.FC<HackerResultsAndAwardsProps> = ({
  isPublished,
  rank = 12,
  totalTeams = 140,
  score = 88.5,
  awards = ['Track Finalist: Core Infrastructure', 'Top 10% Implementation Benchmark'],
  certificates = [],
}) => {
  if (!isPublished) {
    return (
      <div className="p-8 text-center rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] space-y-3 text-left">
        <div className="flex items-center gap-2 text-[#785A12]">
          <Trophy className="w-5 h-5" />
          <h3 className="font-heading font-extrabold text-base text-[#171914]">
            Official Results Pending
          </h3>
        </div>
        <p className="text-xs font-mono text-[#6D7068]">
          Judges are currently reviewing submissions. Official rankings, awards, and credentials will appear here once finalized by the organizers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Placement & Score Banner */}
      <div className="p-6 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCDDD3] pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E2EBDD] border border-[#B8CEB0] text-[#028051]">
              OFFICIAL RESULTS
            </span>
            <h3 className="text-xl font-heading font-extrabold text-[#171914]">
              Team Standing & Score
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#6D7068] block">
                Overall Rank
              </span>
              <span className="text-2xl font-heading font-extrabold text-[#028051]">
                #{rank}{' '}
                <span className="text-xs font-mono text-[#6D7068] font-normal">
                  / {totalTeams}
                </span>
              </span>
            </div>

            <div className="h-8 w-px bg-[#DCDDD3]" />

            <div className="text-right">
              <span className="text-[10px] font-mono text-[#6D7068] block">
                Calibrated Score
              </span>
              <span className="text-2xl font-heading font-extrabold text-[#171914]">
                {score}
                <span className="text-xs font-mono text-[#6D7068] font-normal">
                  /100
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Awards Badges */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#6D7068] uppercase block">
            Accreditations & Honors
          </span>
          <div className="flex flex-wrap gap-2.5">
            {awards.map((aw, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 rounded-[6px] bg-[#FFF4DC] border border-[#F0D597] text-[#785A12] text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Medal className="w-4 h-4 text-[#785A12]" />
                <span>{aw}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Certificates */}
      {certificates.length > 0 && (
        <div className="p-6 rounded-[12px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCDDD3] pb-3">
            <div className="flex items-center gap-2 text-[#028051]">
              <Stamp className="w-5 h-5" />
              <h3 className="font-heading font-extrabold text-base text-[#171914]">
                Verified Credentials & Certificates
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3] space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading font-extrabold text-xs text-[#171914]">
                      {cert.title}
                    </h4>
                    <span className="text-[10px] font-mono text-[#028051] font-bold">
                      VERIFIED
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#6D7068]">
                    ID: {cert.verificationId}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#DCDDD3]">
                  <Link
                    href={`/certificates/${cert.id}`}
                    className="text-xs font-mono text-[#028051] hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>View & Verify</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <a
                    href={cert.verificationUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-[#FFFDF8] border border-[#DCDDD3] text-xs font-mono text-[#171914] flex items-center gap-1 hover:border-[#028051]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
