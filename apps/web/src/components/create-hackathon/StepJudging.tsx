'use client';

import React, { useState } from 'react';
import { Card, Button, Input } from '@almosthack/ui';
import { Scale, Plus, Trash2, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export interface CriterionItem {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export interface StepJudgingData {
  criteria: CriterionItem[];
  scoreScale: number; // e.g. 10 or 100
  aiDisclosureRequired: boolean;
  minJudgesPerSubmission: number;
}

export interface StepJudgingProps {
  data: StepJudgingData;
  onChange: (data: Partial<StepJudgingData>) => void;
  errors: Record<string, string>;
}

export const StepJudging: React.FC<StepJudgingProps> = ({ data, onChange, errors }) => {
  const [newCritName, setNewCritName] = useState('');
  const [newCritWeight, setNewCritWeight] = useState(25);
  const [newCritDesc, setNewCritDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const totalWeight = data.criteria.reduce((acc, c) => acc + (Number(c.weight) || 0), 0);
  const isWeightValid = totalWeight === 100;

  const handleAddCriterion = () => {
    if (!newCritName.trim()) return;

    const newCriterion: CriterionItem = {
      id: `crit_${Date.now()}`,
      name: newCritName.trim(),
      weight: Number(newCritWeight) || 10,
      description: newCritDesc.trim() || 'Evaluates quality against standard rubric.',
    };

    onChange({ criteria: [...data.criteria, newCriterion] });
    setNewCritName('');
    setNewCritWeight(25);
    setNewCritDesc('');
    setIsAdding(false);
  };

  const handleUpdateWeight = (id: string, weight: number) => {
    onChange({
      criteria: data.criteria.map((c) => (c.id === id ? { ...c, weight } : c)),
    });
  };

  const handleRemoveCriterion = (id: string) => {
    onChange({
      criteria: data.criteria.filter((c) => c.id !== id),
    });
  };

  return (
    <Card className="p-6 bg-[#FFFDF8] border border-[#DCDDD3] shadow-xs text-left space-y-6">
      <div className="border-b border-[#DCDDD3] pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#171914]">
              Step 6: Double-Blind Judging & Rubric Weights
            </h2>
            <p className="text-xs text-[#6D7068] font-body mt-0.5">
              Configure weighted scoring criteria. The sum of all criteria weights must equal{' '}
              <strong className="font-mono text-[#028051]">100%</strong>.
            </p>
          </div>
          <span
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-[6px] border ${
              isWeightValid
                ? 'bg-[#E2EBDD] text-[#274535] border-[#B8CEB0]'
                : 'bg-[#FBE6E3] text-[#8B2C24] border-[#F3C9B2]'
            }`}
          >
            Total: {totalWeight}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Live Weight Progress Bar */}
        <div className="space-y-1.5 p-3 rounded-[8px] bg-[#F7F4EA] border border-[#DCDDD3]">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-[#6D7068] font-bold uppercase text-[10px]">
              Rubric Distribution Bar
            </span>
            <span
              className={`font-bold ${isWeightValid ? 'text-[#028051]' : 'text-[#8B2C24]'}`}
            >
              {totalWeight}% / 100%
            </span>
          </div>

          <div className="h-3 w-full bg-[#EAE7DC] rounded-full overflow-hidden flex">
            {data.criteria.map((c, i) => {
              const colors = ['bg-[#028051]', 'bg-[#2563EB]', 'bg-[#D97706]', 'bg-[#7C3AED]', 'bg-[#059669]'];
              const color = colors[i % colors.length];
              return (
                <div
                  key={c.id}
                  style={{ width: `${Math.min(100, Math.max(0, c.weight))}%` }}
                  className={`h-full ${color} transition-all`}
                  title={`${c.name}: ${c.weight}%`}
                />
              );
            })}
          </div>

          {!isWeightValid && (
            <p className="text-[11px] text-[#8B2C24] font-mono mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {totalWeight < 100
                ? `Need ${100 - totalWeight}% more to reach 100% total weight.`
                : `Exceeds 100% by ${totalWeight - 100}%. Please adjust criterion weights.`}
            </p>
          )}
        </div>

        {/* Criteria List */}
        <div className="space-y-2.5">
          {data.criteria.map((crit) => (
            <div
              key={crit.id}
              className="p-3 rounded-[8px] bg-[#FFFDF8] border border-[#DCDDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-xs font-heading font-bold text-[#171914] block">
                  {crit.name}
                </span>
                <span className="text-[11px] text-[#6D7068] font-body block truncate">
                  {crit.description}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-[#F7F4EA] border border-[#DCDDD3] rounded-[6px] px-2 py-1">
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={crit.weight}
                    onChange={(e) => handleUpdateWeight(crit.id, Number(e.target.value))}
                    className="w-12 bg-transparent text-xs font-mono font-bold text-[#171914] text-right focus:outline-none"
                  />
                  <span className="text-xs font-mono text-[#6D7068]">%</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCriterion(crit.id)}
                  className="p-1.5 rounded-[6px] hover:bg-[#FBE6E3] text-[#8B2C24] transition-colors cursor-pointer"
                  title="Remove Criterion"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Criterion */}
        {isAdding ? (
          <div className="p-4 rounded-[8px] bg-[#F7F4EA] border border-[#B8CEB0] space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-[#171914]">Add Criterion</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                  Criterion Name
                </label>
                <Input
                  placeholder="e.g. Design & User Experience"
                  value={newCritName}
                  onChange={(e) => setNewCritName(e.target.value)}
                  className="w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                  Weight (%)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={newCritWeight}
                  onChange={(e) => setNewCritWeight(Number(e.target.value))}
                  className="w-full text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase text-[#171914] mb-1">
                Evaluation Guidance
              </label>
              <textarea
                rows={2}
                placeholder="What should judges look for when assigning points?"
                value={newCritDesc}
                onChange={(e) => setNewCritDesc(e.target.value)}
                className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-body rounded-[8px] p-2 focus:outline-none focus:border-[#028051]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="text-xs font-mono h-8"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddCriterion}
                disabled={!newCritName.trim()}
                className="text-xs font-mono h-8 bg-[#028051]"
              >
                Save Criterion
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAdding(true)}
            leftIcon={<Plus className="w-4 h-4 text-[#028051]" />}
            className="w-full text-xs font-mono border-dashed border-[#B8CEB0] h-9 hover:bg-[#E2EBDD]/40"
          >
            Add Custom Criterion
          </Button>
        )}

        {/* Global Judging Policies */}
        <div className="pt-3 border-t border-[#DCDDD3] space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#171914] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#028051]" />
            Calibration & Integrity Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                Scoring Scale
              </label>
              <select
                value={data.scoreScale}
                onChange={(e) => onChange({ scoreScale: Number(e.target.value) })}
                className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051]"
              >
                <option value={10}>1 to 10 Points Scale (Standard Rubric)</option>
                <option value={100}>1 to 100 Points Scale (Granular Percentile)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold text-[#171914] mb-1">
                Min Judges per Submission
              </label>
              <select
                value={data.minJudgesPerSubmission}
                onChange={(e) => onChange({ minJudgesPerSubmission: Number(e.target.value) })}
                className="w-full bg-[#FFFDF8] border border-[#DCDDD3] text-[#171914] text-xs font-mono rounded-[8px] p-2.5 focus:outline-none focus:border-[#028051]"
              >
                <option value={2}>2 Judges (Minimum for Double-Blind Bias Check)</option>
                <option value={3}>3 Judges (Recommended for High-Stakes Finals)</option>
                <option value={4}>4 Judges (Consensus Engine with Outlier Pruning)</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-body text-[#171914] pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={data.aiDisclosureRequired}
              onChange={(e) => onChange({ aiDisclosureRequired: e.target.checked })}
              className="rounded border-[#DCDDD3] text-[#028051] focus:ring-[#028051] w-4 h-4"
            />
            <span>Mandatory AI Tool & Prompts Disclosure Required from Participants</span>
          </label>
        </div>
      </div>
    </Card>
  );
};
