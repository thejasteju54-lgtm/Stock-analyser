export interface OpportunityScoringPolicy {
  version: string;
  weights: {
    momentum: number;      // 0.15
    fundamentals: number;  // 0.20
    catalysts: number;     // 0.20
    valuation: number;     // 0.15
    technical: number;     // 0.10
    sector: number;        // 0.05
    news: number;          // 0.05
    volume: number;        // 0.05
    dataConfidence: number;// 0.05
  };
  riskPenalties: {
    low: number;      // 0
    medium: number;   // 8
    high: number;     // 18
    critical: number; // 35
  };
  maxPenaltyCap: number; // 40
}

export class OpportunityPolicyRegistry {
  public static readonly CURRENT_VERSION = 'v1.0.0';

  private static policies: Record<string, OpportunityScoringPolicy> = {
    'v1.0.0': {
      version: 'v1.0.0',
      weights: {
        momentum: 0.15,
        fundamentals: 0.20,
        catalysts: 0.20,
        valuation: 0.15,
        technical: 0.10,
        sector: 0.05,
        news: 0.05,
        volume: 0.05,
        dataConfidence: 0.05,
      },
      riskPenalties: {
        low: 0,
        medium: 8,
        high: 18,
        critical: 35,
      },
      maxPenaltyCap: 40,
    },
  };

  public static getPolicy(version: string = this.CURRENT_VERSION): OpportunityScoringPolicy {
    return this.policies[version] || this.policies[this.CURRENT_VERSION];
  }
}
