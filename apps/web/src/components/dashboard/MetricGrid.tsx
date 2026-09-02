'use client';

import React from 'react';
import { MetricCard } from './MetricCard';
import { MetricItem } from './dashboard-mock-data';

export interface MetricGridProps {
  metrics: {
    registered: MetricItem;
    teams: MetricItem;
    submissions: MetricItem;
    judges: MetricItem;
  };
}

export const MetricGrid: React.FC<MetricGridProps> = ({ metrics }) => {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      aria-label="Organizer Key Metrics"
    >
      <MetricCard item={metrics.registered} />
      <MetricCard item={metrics.teams} />
      <MetricCard item={metrics.submissions} />
      <MetricCard item={metrics.judges} />
    </div>
  );
};
