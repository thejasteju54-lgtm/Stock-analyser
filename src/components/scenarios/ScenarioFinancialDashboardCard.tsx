/**
 * ScenarioFinancialDashboardCard.tsx
 * Phase 13 — High-Density Financial Statement Progression Table
 * (Historical FY23/FY24 -> Projected Year 1, Year 3, Year 5, Terminal State).
 */

import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ScenarioModel } from '../../domain/scenarios/ScenarioTypes';

interface ScenarioFinancialDashboardCardProps {
  scenario: ScenarioModel;
}

export const ScenarioFinancialDashboardCard: React.FC<ScenarioFinancialDashboardCardProps> = ({
  scenario,
}) => {
  return (
    <Card
      title={`Forward Financial Projections — ${scenario.scenarioTitle}`}
      subtitle="Deterministic financial bridge spanning 1-year, 3-year, 5-year visible horizons and terminal steady state."
      action={
        <div className="flex items-center gap-2">
          <Badge
            variant={
              scenario.cashFlowProjection.cashConversionStatus === 'STRONG'
                ? 'bullish'
                : scenario.cashFlowProjection.cashConversionStatus === 'NORMAL'
                ? 'cyan'
                : 'warning'
            }
          >
            Cash Conversion: {scenario.cashFlowProjection.cashConversionStatus}
          </Badge>
        </div>
      }
    >
      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Financial Metric (INR Cr)</th>
              <th className="py-2.5 px-3 font-semibold text-right">FY24 (Actual)</th>
              {scenario.horizonStatements.map((h) => (
                <th key={h.horizon} className="py-2.5 px-3 font-semibold text-right text-cyan-400">
                  {h.yearLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200">
            {/* Revenue */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2 px-4 font-sans font-semibold text-slate-100">Revenue from Operations</td>
              <td className="py-2 px-3 text-right text-slate-400">
                {(scenario.horizonStatements[0].revenue / (1 + scenario.horizonStatements[0].revenueGrowthPercent / 100)).toFixed(1)}
              </td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right font-medium">
                  {h.revenue.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </td>
              ))}
            </tr>

            {/* Revenue Growth */}
            <tr className="hover:bg-slate-800/30 text-slate-400 text-[11px]">
              <td className="py-1.5 px-4 font-sans pl-6">YoY Growth (%)</td>
              <td className="py-1.5 px-3 text-right">—</td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-1.5 px-3 text-right text-emerald-400">
                  +{h.revenueGrowthPercent.toFixed(1)}%
                </td>
              ))}
            </tr>

            {/* EBITDA */}
            <tr className="hover:bg-slate-800/30 bg-slate-900/20">
              <td className="py-2 px-4 font-sans font-semibold text-slate-100">EBITDA</td>
              <td className="py-2 px-3 text-right text-slate-400">
                {(scenario.horizonStatements[0].ebitda / 1.1).toFixed(1)}
              </td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right font-medium">
                  {h.ebitda.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </td>
              ))}
            </tr>

            {/* EBITDA Margin */}
            <tr className="hover:bg-slate-800/30 text-slate-400 text-[11px]">
              <td className="py-1.5 px-4 font-sans pl-6">EBITDA Margin (%)</td>
              <td className="py-1.5 px-3 text-right">{scenario.marginProjection.ebitdaMarginPercent.toFixed(1)}%</td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-1.5 px-3 text-right text-cyan-300">
                  {scenario.marginProjection.ebitdaMarginPercent.toFixed(1)}%
                </td>
              ))}
            </tr>

            {/* EBIT */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2 px-4 font-sans text-slate-200">EBIT</td>
              <td className="py-2 px-3 text-right text-slate-400">—</td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right">
                  {h.ebit.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </td>
              ))}
            </tr>

            {/* PAT */}
            <tr className="hover:bg-slate-800/30 bg-slate-900/40">
              <td className="py-2 px-4 font-sans font-semibold text-slate-100">Profit After Tax (PAT)</td>
              <td className="py-2 px-3 text-right text-slate-400">
                {(scenario.horizonStatements[0].pat / 1.1).toFixed(1)}
              </td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right font-bold text-slate-100">
                  {h.pat.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </td>
              ))}
            </tr>

            {/* EPS */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2 px-4 font-sans text-slate-200">Diluted EPS (INR)</td>
              <td className="py-2 px-3 text-right text-slate-400">—</td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right text-amber-300 font-semibold">
                  ₹{h.eps.toFixed(2)}
                </td>
              ))}
            </tr>

            {/* OCF */}
            <tr className="hover:bg-slate-800/30 border-t border-slate-800">
              <td className="py-2 px-4 font-sans text-slate-200">Operating Cash Flow (OCF)</td>
              <td className="py-2 px-3 text-right text-slate-400">—</td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right text-emerald-400">
                  {h.ocf.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </td>
              ))}
            </tr>

            {/* Capex */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2 px-4 font-sans text-slate-400 pl-6">Total Capex</td>
              <td className="py-2 px-3 text-right text-slate-400">—</td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right text-rose-400/90">
                  -{h.capex.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </td>
              ))}
            </tr>

            {/* Free Cash Flow */}
            <tr className="hover:bg-slate-800/30 bg-slate-900/30">
              <td className="py-2 px-4 font-sans font-semibold text-slate-100">Free Cash Flow (FCF)</td>
              <td className="py-2 px-3 text-right text-slate-400">—</td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right font-bold text-emerald-300">
                  {h.fcf.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </td>
              ))}
            </tr>

            {/* Net Debt */}
            <tr className="hover:bg-slate-800/30 border-t border-slate-800">
              <td className="py-2 px-4 font-sans text-slate-200">Net Debt</td>
              <td className="py-2 px-3 text-right text-slate-400">—</td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right">
                  {h.netDebt.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                </td>
              ))}
            </tr>

            {/* ROCE */}
            <tr className="hover:bg-slate-800/30">
              <td className="py-2 px-4 font-sans text-slate-200">ROCE (%)</td>
              <td className="py-2 px-3 text-right text-slate-400">—</td>
              {scenario.horizonStatements.map((h) => (
                <td key={h.horizon} className="py-2 px-3 text-right text-cyan-300">
                  {h.rocePercent !== null ? `${h.rocePercent.toFixed(1)}%` : 'N/A'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};
