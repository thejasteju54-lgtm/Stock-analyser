/**
 * RealCompanyValidationEngine.ts
 * Phase 16 — Real-Company Invariant Validation & Ingestion Quality Gate.
 * Runs deterministic assertion verification across all 5 sector archetypes.
 */

import { RealCompanyFrozenFixture, ExpectedFixtureInvariant } from './RealCompanyFixtureTypes';

export interface InvariantEvaluationResult {
  metric: string;
  period: string;
  operator: string;
  expected: string;
  actual: string;
  passed: boolean;
  explanation: string;
}

export interface InvariantValidationReport {
  fixtureId: string;
  symbol: string;
  totalInvariants: number;
  passedInvariants: number;
  failedInvariants: number;
  allPassed: boolean;
  results: InvariantEvaluationResult[];
}

export class RealCompanyValidationEngine {
  public static validateFixture(fixture: RealCompanyFrozenFixture): InvariantValidationReport {
    const results: InvariantEvaluationResult[] = [];
    const stmt = fixture.canonicalStatement as unknown as Record<string, unknown>;
    const sh = fixture.shareholding as unknown as Record<string, unknown>;
    const mkt = fixture.marketPrice as unknown as Record<string, unknown>;

    for (const inv of fixture.invariants) {
      let actualValue: unknown = undefined;

      // Extract actual value based on metric name
      switch (inv.metric) {
        case 'REVENUE':
          actualValue = stmt['revenue'];
          break;
        case 'REVENUE_INR':
          actualValue = stmt['revenueInr'];
          break;
        case 'PAT':
          actualValue = stmt['pat'];
          break;
        case 'EBITDA':
          actualValue = stmt['ebitda'];
          break;
        case 'EBITDA_MARGIN':
          if (typeof stmt['revenue'] === 'number' && typeof stmt['ebitda'] === 'number') {
            actualValue = Number(((stmt['ebitda'] / stmt['revenue']) * 100).toFixed(2));
          }
          break;
        case 'OPERATING_MARGIN':
          actualValue = stmt['operatingMarginPercent'];
          break;
        case 'FCF':
          actualValue = stmt['fcf'];
          break;
        case 'CFO':
          actualValue = stmt['cfo'];
          break;
        case 'PROMOTER_PLEDGE':
          actualValue = sh['promoterPledgePercentOfPromoterHolding'];
          break;
        case 'NET_INTEREST_INCOME':
          actualValue = stmt['netInterestIncome'];
          break;
        case 'NIM':
          actualValue = stmt['netInterestMarginPercent'];
          break;
        case 'GNPA_RATIO':
          actualValue = stmt['grossNpaRatioPercent'];
          break;
        case 'CET1_RATIO':
          actualValue = stmt['cet1RatioPercent'];
          break;
        case 'CRAR':
          actualValue = stmt['crarPercent'];
          break;
        case 'PRICE':
          actualValue = mkt['rawPrice'];
          break;
        default:
          actualValue = stmt[inv.metric] || sh[inv.metric] || mkt[inv.metric];
      }

      const res = this.evaluateSingleInvariant(inv, actualValue);
      results.push(res);
    }

    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.length - passedCount;

    return {
      fixtureId: fixture.fixtureId,
      symbol: fixture.companyIdentity.symbol,
      totalInvariants: results.length,
      passedInvariants: passedCount,
      failedInvariants: failedCount,
      allPassed: failedCount === 0,
      results,
    };
  }

  private static evaluateSingleInvariant(
    inv: ExpectedFixtureInvariant,
    actual: unknown
  ): InvariantEvaluationResult {
    const numActual = typeof actual === 'number' ? actual : undefined;

    switch (inv.operator) {
      case 'EQUALS': {
        const passed = actual === inv.expectedValue;
        return {
          metric: inv.metric,
          period: inv.period,
          operator: 'EQUALS',
          expected: String(inv.expectedValue),
          actual: String(actual),
          passed,
          explanation: passed
            ? `Exact match (${actual} == ${inv.expectedValue}).`
            : `Expected ${inv.expectedValue}, but got ${actual}.`,
        };
      }

      case 'GREATER_THAN': {
        const passed = numActual !== undefined && numActual > (inv.expectedValue as number);
        return {
          metric: inv.metric,
          period: inv.period,
          operator: 'GREATER_THAN',
          expected: `> ${inv.expectedValue}`,
          actual: String(actual),
          passed,
          explanation: passed
            ? `Passed: ${actual} > ${inv.expectedValue}.`
            : `Failed: ${actual} is not > ${inv.expectedValue}.`,
        };
      }

      case 'LESS_THAN': {
        const passed = numActual !== undefined && numActual < (inv.expectedValue as number);
        return {
          metric: inv.metric,
          period: inv.period,
          operator: 'LESS_THAN',
          expected: `< ${inv.expectedValue}`,
          actual: String(actual),
          passed,
          explanation: passed
            ? `Passed: ${actual} < ${inv.expectedValue}.`
            : `Failed: ${actual} is not < ${inv.expectedValue}.`,
        };
      }

      case 'RANGE': {
        const range = inv.expectedValue as [number, number];
        const passed = numActual !== undefined && numActual >= range[0] && numActual <= range[1];
        return {
          metric: inv.metric,
          period: inv.period,
          operator: 'RANGE',
          expected: `[${range[0]}, ${range[1]}]`,
          actual: String(actual),
          passed,
          explanation: passed
            ? `Passed: ${actual} lies within [${range[0]}, ${range[1]}].`
            : `Failed: ${actual} lies outside [${range[0]}, ${range[1]}].`,
        };
      }

      case 'IS_ASSESSABLE': {
        const passed = actual !== undefined && actual !== null;
        return {
          metric: inv.metric,
          period: inv.period,
          operator: 'IS_ASSESSABLE',
          expected: 'ASSESSABLE',
          actual: passed ? 'ASSESSABLE' : 'NOT_ASSESSABLE',
          passed,
          explanation: passed ? 'Metric is fully assessable.' : 'Metric is missing or unassessable.',
        };
      }

      default:
        return {
          metric: inv.metric,
          period: inv.period,
          operator: String(inv.operator),
          expected: String(inv.expectedValue),
          actual: String(actual),
          passed: false,
          explanation: `Unknown invariant operator: ${inv.operator}`,
        };
    }
  }
}
