/**
 * ScenarioComparisonCard.tsx
 * Phase 13 — Side-by-Side Comparison Matrix Contrasting Bear vs Base vs Bull
 * across Key Operational, Financial, Cash Flow, Return, and Valuation Metrics.
 */

import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ScenarioReport } from '../../domain/scenarios/ScenarioTypes';

interface ScenarioComparisonCardProps {
  report: ScenarioReport;
}

export const ScenarioComparisonCard: React.FC<ScenarioComparisonCardProps> = ({ report }) => {
  const comp = report.comparison;

  return (
    <Card
      title="Scenario Comparison & Distribution Matrix"
      subtitle="Comparative summary contrasting Bear Case, Base Case, and Bull Case across 3-year visible horizons."
    >
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-xs text-left border-collapse font-sans">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Analytical Dimension</th>
              <th className="py-2.5 px-4 font-semibold text-center text-rose-400 bg-rose-950/20">Bear Case</th>
              <th className="py-2.5 px-4 font-semibold text-center text-cyan-400 bg-cyan-950/20">Base Case</th>
              <th className="py-2.5 px-4 font-semibold text-center text-emerald-400 bg-emerald-950/20">Bull Case</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
            {/* Probability */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 px-4 font-sans font-medium text-slate-100">Assigned Probability</td>
              <td className="py-2.5 px-4 text-center">
                <Badge variant="bearish">{comp.scenarioProbabilityDisplay.BEAR}</Badge>
              </td>
              <td className="py-2.5 px-4 text-center">
                <Badge variant="cyan">{comp.scenarioProbabilityDisplay.BASE}</Badge>
              </td>
              <td className="py-2.5 px-4 text-center">
                <Badge variant="bullish">{comp.scenarioProbabilityDisplay.BULL}</Badge>
              </td>
            </tr>

            {/* 3Y Revenue CAGR */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 px-4 font-sans text-slate-300">3-Year Revenue CAGR</td>
              <td className="py-2.5 px-4 text-center text-rose-300">+{comp.revenueCagr3Yr.BEAR}%</td>
              <td className="py-2.5 px-4 text-center text-cyan-300">+{comp.revenueCagr3Yr.BASE}%</td>
              <td className="py-2.5 px-4 text-center text-emerald-300">+{comp.revenueCagr3Yr.BULL}%</td>
            </tr>

            {/* EBITDA Margin */}
            <tr className="hover:bg-slate-800/30 bg-slate-900/20">
              <td className="py-2.5 px-4 font-sans text-slate-300">EBITDA Margin</td>
              <td className="py-2.5 px-4 text-center">{comp.ebitdaMarginAvg.BEAR}%</td>
              <td className="py-2.5 px-4 text-center">{comp.ebitdaMarginAvg.BASE}%</td>
              <td className="py-2.5 px-4 text-center">{comp.ebitdaMarginAvg.BULL}%</td>
            </tr>

            {/* Year 3 PAT */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 px-4 font-sans text-slate-300">Year 3 PAT (INR Cr)</td>
              <td className="py-2.5 px-4 text-center">{comp.patYear3.BEAR.toLocaleString('en-IN')}</td>
              <td className="py-2.5 px-4 text-center">{comp.patYear3.BASE.toLocaleString('en-IN')}</td>
              <td className="py-2.5 px-4 text-center">{comp.patYear3.BULL.toLocaleString('en-IN')}</td>
            </tr>

            {/* Year 3 EPS */}
            <tr className="hover:bg-slate-800/30 bg-slate-900/20">
              <td className="py-2.5 px-4 font-sans text-slate-300">Year 3 EPS (INR)</td>
              <td className="py-2.5 px-4 text-center text-amber-400">₹{comp.epsYear3.BEAR.toFixed(2)}</td>
              <td className="py-2.5 px-4 text-center text-amber-400">₹{comp.epsYear3.BASE.toFixed(2)}</td>
              <td className="py-2.5 px-4 text-center text-amber-400">₹{comp.epsYear3.BULL.toFixed(2)}</td>
            </tr>

            {/* Year 3 FCF */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2.5 px-4 font-sans text-slate-300">Year 3 Free Cash Flow (INR Cr)</td>
              <td className="py-2.5 px-4 text-center text-rose-300">{comp.fcfYear3.BEAR.toLocaleString('en-IN')}</td>
              <td className="py-2.5 px-4 text-center text-emerald-300">{comp.fcfYear3.BASE.toLocaleString('en-IN')}</td>
              <td className="py-2.5 px-4 text-center text-emerald-300">{comp.fcfYear3.BULL.toLocaleString('en-IN')}</td>
            </tr>

            {/* Year 3 ROCE */}
            <tr className="hover:bg-slate-800/30 bg-slate-900/20">
              <td className="py-2.5 px-4 font-sans text-slate-300">Year 3 ROCE</td>
              <td className="py-2.5 px-4 text-center">{comp.roceYear3.BEAR !== null ? `${comp.roceYear3.BEAR}%` : 'N/A'}</td>
              <td className="py-2.5 px-4 text-center">{comp.roceYear3.BASE !== null ? `${comp.roceYear3.BASE}%` : 'N/A'}</td>
              <td className="py-2.5 px-4 text-center">{comp.roceYear3.BULL !== null ? `${comp.roceYear3.BULL}%` : 'N/A'}</td>
            </tr>

            {/* Justified Valuation */}
            <tr className="hover:bg-slate-800/30 font-bold border-t border-slate-700 bg-slate-900/50">
              <td className="py-3 px-4 font-sans text-slate-100">Scenario Valuation Range</td>
              <td className="py-3 px-4 text-center text-rose-400">{comp.valuationRangeDisplay.BEAR}</td>
              <td className="py-3 px-4 text-center text-cyan-400">{comp.valuationRangeDisplay.BASE}</td>
              <td className="py-3 px-4 text-center text-emerald-400">{comp.valuationRangeDisplay.BULL}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};
