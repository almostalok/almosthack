'use client';

import React, { useState } from 'react';
import { Card } from '@almosthack/ui';
import { RegistrationDataPoint } from './dashboard-mock-data';

export interface RegistrationChartProps {
  history: {
    '7d': RegistrationDataPoint[];
    '30d': RegistrationDataPoint[];
    'all': RegistrationDataPoint[];
  };
}

export const RegistrationChart: React.FC<RegistrationChartProps> = ({ history }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<RegistrationDataPoint | null>(null);

  const activePoints = history[timeframe];
  const maxCumulative = Math.max(...activePoints.map((p) => p.cumulative), 100);
  const minCumulative = Math.min(...activePoints.map((p) => p.cumulative), 0);

  // SVG dimensions
  const width = 560;
  const height = 180;
  const paddingX = 35;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  // Compute coordinate mapping
  const points = activePoints.map((p, idx) => {
    const x = paddingX + (idx / (activePoints.length - 1 || 1)) * chartWidth;
    const y =
      paddingTop +
      chartHeight -
      ((p.cumulative - minCumulative) / (maxCumulative - minCumulative || 1)) * chartHeight;
    return { x, y, data: p };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  return (
    <Card className="p-5 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCDDD3]/70 mb-4">
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#171914]">
            Registration Velocity
          </h3>
          <p className="text-[11px] font-body text-[#6D7068]">
            Cumulative builder sign-ups & verification flow
          </p>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex items-center gap-1 bg-[#F7F4EA] p-0.5 rounded-[6px] border border-[#DCDDD3] self-start sm:self-auto">
          {(['7d', '30d', 'all'] as const).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-[#FFFDF8] text-[#171914] shadow-2xs border border-[#DCDDD3]'
                  : 'text-[#6D7068] hover:text-[#171914]'
              }`}
            >
              {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label="Registrations over time line graph"
        >
          {/* Subtle Grid Lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="#DCDDD3"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight / 2}
            x2={width - paddingX}
            y2={paddingTop + chartHeight / 2}
            stroke="#DCDDD3"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <line
            x1={paddingX}
            y1={paddingTop + chartHeight}
            x2={width - paddingX}
            y2={paddingTop + chartHeight}
            stroke="#DCDDD3"
            strokeWidth="1"
          />

          {/* Fill Area */}
          <path d={areaD} fill="#E2EBDD" fillOpacity="0.45" />

          {/* Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#028051"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.date === pt.data.date ? 5 : 3.5}
                fill={hoveredPoint?.date === pt.data.date ? '#028051' : '#FFFDF8'}
                stroke="#028051"
                strokeWidth="2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredPoint(pt.data)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* X Axis Labels */}
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] font-mono fill-[#6D7068]"
              >
                {pt.data.date}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-[#171914] text-white px-2.5 py-1.5 rounded-[6px] text-xs font-mono shadow-md pointer-events-none animate-in fade-in duration-100">
            <span className="text-[#03A066] font-bold">{hoveredPoint.cumulative}</span> total (
            <span className="text-zinc-300">+{hoveredPoint.count}</span> on {hoveredPoint.date})
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[#6D7068] pt-2 border-t border-[#DCDDD3]/40 mt-1">
        <span>Active pace: ~24 builders / day</span>
        <span className="text-[#028051] font-bold">100% Identity Verified</span>
      </div>
    </Card>
  );
};
