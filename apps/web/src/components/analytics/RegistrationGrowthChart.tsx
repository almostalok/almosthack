'use client';

import React, { useState } from 'react';
import { Users, TrendingUp, Table as TableIcon } from 'lucide-react';
import { RegistrationTrendPoint } from './analytics-types';

export interface RegistrationGrowthChartProps {
  data: RegistrationTrendPoint[];
  viewMode?: 'CHARTS' | 'TABLES';
}

export const RegistrationGrowthChart: React.FC<RegistrationGrowthChartProps> = ({
  data,
  viewMode = 'CHARTS',
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<RegistrationTrendPoint | null>(null);

  const maxCumulative = Math.max(...data.map((p) => p.cumulative), 100);
  const minCumulative = 0;

  // SVG dimensions
  const width = 600;
  const height = 180;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((p, idx) => {
    const x = paddingX + (idx / (data.length - 1 || 1)) * chartWidth;
    const y =
      paddingTop +
      chartHeight -
      ((p.cumulative - minCumulative) / (maxCumulative - minCumulative || 1)) * chartHeight;
    return { x, y, data: p };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
      : '';

  return (
    <div className="p-5 rounded-[10px] bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#028051]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase text-[#171914] tracking-wider">
              Registration Growth Velocity
            </h3>
            <p className="text-[11px] text-[#6D7068] font-body">
              Daily signups and cumulative verified builder enrollment.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[10px] text-[#6D7068]">Current Total:</span>
          <span className="font-heading font-extrabold text-sm text-[#028051]">
            {data[data.length - 1]?.cumulative || 0} Builders
          </span>
        </div>
      </div>

      {viewMode === 'TABLES' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-[#171914]">
            <thead className="bg-[#F7F4EA] border-b border-[#DCDDD3] text-[10px] uppercase font-bold text-[#6D7068]">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Daily Signups</th>
                <th className="px-3 py-2 text-right">Cumulative Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD3]/70">
              {data.map((row) => (
                <tr key={row.date} className="hover:bg-[#F7F4EA]/50">
                  <td className="px-3 py-2">{row.label}</td>
                  <td className="px-3 py-2 font-bold text-[#028051]">+{row.daily}</td>
                  <td className="px-3 py-2 text-right font-bold">{row.cumulative}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative w-full h-[180px] select-none">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#028051" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#028051" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.5, 1].map((ratio) => {
                const y = paddingTop + chartHeight * ratio;
                const val = Math.round(maxCumulative * (1 - ratio));
                return (
                  <g key={ratio}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="#DCDDD3"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={paddingX - 6}
                      y={y + 3}
                      fill="#6D7068"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area & Line */}
              <path d={areaD} fill="url(#regGrad)" />
              <path
                d={pathD}
                fill="none"
                stroke="#028051"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points & Interactive Tooltip Target */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.date === pt.data.date ? 4.5 : 2.5}
                    fill={hoveredPoint?.date === pt.data.date ? '#028051' : '#FFFDF8'}
                    stroke="#028051"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all duration-100"
                    onMouseEnter={() => setHoveredPoint(pt.data)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Bottom Date Labels */}
                  {idx % Math.ceil(data.length / 7) === 0 && (
                    <text
                      x={pt.x}
                      y={height - 8}
                      fill="#6D7068"
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {pt.data.label}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div className="absolute top-2 right-2 p-2 bg-[#171914] text-[#FFFDF8] rounded-[6px] text-[10px] font-mono shadow-md pointer-events-none">
                <span className="font-bold block">{hoveredPoint.label}</span>
                <span className="text-[#A2E3C4] block">
                  +{hoveredPoint.daily} daily ({hoveredPoint.cumulative} total)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
