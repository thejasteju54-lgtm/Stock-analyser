import { describe, it, expect } from 'vitest';
import { ResearchFreshnessEngine } from '../../../src/domain/freshness/ResearchFreshnessEngine';
import { ResearchRefreshQueue } from '../../../src/domain/freshness/ResearchRefreshQueue';
import { createResearchProject } from '../../../src/domain/models/ResearchProject';
import { CompanyIdentity } from '../../../src/domain/models/Company';

describe('Phase 15 — Freshness Engine & Priority Refresh Queue', () => {
  const company: CompanyIdentity = {
    id: 'comp_1',
    displayName: 'Tata Motors Ltd',
    legalName: 'Tata Motors Limited',
    symbol: 'TATAMOTORS',
    isin: 'INE155A01022',
    exchange: 'NSE',
    sector: 'AUTOMOBILE',
    subsector: 'PASSENGER_CARS',
    marketCapCategory: 'LARGE_CAP',
    businessModel: 'NON_FINANCIAL_OPERATING',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  it('correctly assesses freshness and flags stale data categories', () => {
    const project = createResearchProject({ company });
    const oldDate = new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(); // 60 hours ago
    project.valuationAnalysis = { marketSnapshot: { priceDate: oldDate.split('T')[0] } } as any;

    const report = ResearchFreshnessEngine.assessProjectFreshness(project);
    const priceItem = report.items.find((i) => i.category === 'MARKET_PRICE');

    expect(priceItem?.isStale).toBe(true);
    expect(priceItem?.priority).toBe('HIGH');
    expect(report.hasStaleData).toBe(true);
  });

  it('enqueues and sorts refresh queue tasks by strict priority (CRITICAL > HIGH > MEDIUM > LOW)', () => {
    const queue = new ResearchRefreshQueue();

    queue.enqueue('proj_1', 'NEWS', 'LOW', 'Routine news scan');
    queue.enqueue('proj_1', 'MARKET_PRICE', 'CRITICAL', 'Price critically stale');
    queue.enqueue('proj_1', 'SHAREHOLDING', 'MEDIUM', 'Quarterly check');
    queue.enqueue('proj_1', 'TECHNICAL_DATA', 'HIGH', 'Stale OHLCV candle');

    const pending = queue.getPendingTasks();
    expect(pending[0].priority).toBe('CRITICAL');
    expect(pending[0].category).toBe('MARKET_PRICE');
    expect(pending[1].priority).toBe('HIGH');
    expect(pending[2].priority).toBe('MEDIUM');
    expect(pending[3].priority).toBe('LOW');

    // Complete a task
    queue.markCompleted(pending[0].taskId);
    expect(queue.getPendingTasks()).toHaveLength(3);
  });
});
