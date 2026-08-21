/**
 * AnalysisDependencyGraph.ts
 * Phase 15 — Single Canonical Analysis Dependency Graph & Invalidation Engine.
 * Programmatically maps all direct, derived, and transitive dependencies across Phases 5–14.
 */

export type PhaseNodeId =
  | 'PHASE_5_CALCULATIONS'
  | 'PHASE_6_FUNDAMENTAL'
  | 'PHASE_7_FORENSIC'
  | 'PHASE_8_MANAGEMENT'
  | 'PHASE_9_VALUATION'
  | 'PHASE_10_TECHNICAL'
  | 'PHASE_11_NEWS_INDUSTRY'
  | 'PHASE_12_CATALYSTS_RISKS'
  | 'PHASE_13_SCENARIOS'
  | 'PHASE_14_VERDICT'
  | 'PHASE_15_REPORT';

export type UpstreamInputCategory =
  | 'ANNUAL_REPORT_FILING'
  | 'CONCALL_TRANSCRIPT'
  | 'MARKET_PRICE_TICK'
  | 'TECHNICAL_CHART_OHLCV'
  | 'CORPORATE_NEWS_EVENT'
  | 'REGULATORY_FILING'
  | 'SHAREHOLDING_PATTERN'
  | 'VALUATION_ASSUMPTION_OVERRIDE'
  | 'MANAGEMENT_GUIDANCE_UPDATE'
  | 'INDUSTRY_SECTOR_DATA';

export interface DependencyEdge {
  from: PhaseNodeId;
  to: PhaseNodeId;
  nature:
    | 'CALCULATION_INPUT'
    | 'RISK_SYNTHESIS'
    | 'GOVERNANCE_WEIGHT'
    | 'PROBABILITY_DERIVATION'
    | 'DECISION_EVIDENCE';
}

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  cycleDetected: boolean;
  unreachablePhases: PhaseNodeId[];
  totalEdges: number;
}

export class AnalysisDependencyGraph {
  public static readonly ALL_PHASES: PhaseNodeId[] = [
    'PHASE_5_CALCULATIONS',
    'PHASE_6_FUNDAMENTAL',
    'PHASE_7_FORENSIC',
    'PHASE_8_MANAGEMENT',
    'PHASE_9_VALUATION',
    'PHASE_10_TECHNICAL',
    'PHASE_11_NEWS_INDUSTRY',
    'PHASE_12_CATALYSTS_RISKS',
    'PHASE_13_SCENARIOS',
    'PHASE_14_VERDICT',
    'PHASE_15_REPORT',
  ];

  public static readonly EDGES: DependencyEdge[] = [
    // Phase 5 downstream
    { from: 'PHASE_5_CALCULATIONS', to: 'PHASE_6_FUNDAMENTAL', nature: 'CALCULATION_INPUT' },
    { from: 'PHASE_5_CALCULATIONS', to: 'PHASE_7_FORENSIC', nature: 'CALCULATION_INPUT' },
    { from: 'PHASE_5_CALCULATIONS', to: 'PHASE_8_MANAGEMENT', nature: 'CALCULATION_INPUT' },
    { from: 'PHASE_5_CALCULATIONS', to: 'PHASE_9_VALUATION', nature: 'CALCULATION_INPUT' },
    { from: 'PHASE_5_CALCULATIONS', to: 'PHASE_13_SCENARIOS', nature: 'CALCULATION_INPUT' },

    // Phase 6 downstream
    { from: 'PHASE_6_FUNDAMENTAL', to: 'PHASE_12_CATALYSTS_RISKS', nature: 'RISK_SYNTHESIS' },
    { from: 'PHASE_6_FUNDAMENTAL', to: 'PHASE_13_SCENARIOS', nature: 'PROBABILITY_DERIVATION' },
    { from: 'PHASE_6_FUNDAMENTAL', to: 'PHASE_14_VERDICT', nature: 'DECISION_EVIDENCE' },

    // Phase 7 downstream (Forensics feeds Management tension, Valuation adj, Risks, Scenarios, and Verdict)
    { from: 'PHASE_7_FORENSIC', to: 'PHASE_8_MANAGEMENT', nature: 'GOVERNANCE_WEIGHT' },
    { from: 'PHASE_7_FORENSIC', to: 'PHASE_9_VALUATION', nature: 'CALCULATION_INPUT' },
    { from: 'PHASE_7_FORENSIC', to: 'PHASE_12_CATALYSTS_RISKS', nature: 'RISK_SYNTHESIS' },
    { from: 'PHASE_7_FORENSIC', to: 'PHASE_13_SCENARIOS', nature: 'CALCULATION_INPUT' },
    { from: 'PHASE_7_FORENSIC', to: 'PHASE_14_VERDICT', nature: 'DECISION_EVIDENCE' },

    // Phase 8 downstream
    { from: 'PHASE_8_MANAGEMENT', to: 'PHASE_12_CATALYSTS_RISKS', nature: 'RISK_SYNTHESIS' },
    { from: 'PHASE_8_MANAGEMENT', to: 'PHASE_13_SCENARIOS', nature: 'PROBABILITY_DERIVATION' },
    { from: 'PHASE_8_MANAGEMENT', to: 'PHASE_14_VERDICT', nature: 'DECISION_EVIDENCE' },

    // Phase 9 downstream
    { from: 'PHASE_9_VALUATION', to: 'PHASE_13_SCENARIOS', nature: 'CALCULATION_INPUT' },
    { from: 'PHASE_9_VALUATION', to: 'PHASE_14_VERDICT', nature: 'DECISION_EVIDENCE' },

    // Phase 10 downstream
    { from: 'PHASE_10_TECHNICAL', to: 'PHASE_14_VERDICT', nature: 'DECISION_EVIDENCE' },

    // Phase 11 downstream
    { from: 'PHASE_11_NEWS_INDUSTRY', to: 'PHASE_12_CATALYSTS_RISKS', nature: 'RISK_SYNTHESIS' },
    { from: 'PHASE_11_NEWS_INDUSTRY', to: 'PHASE_13_SCENARIOS', nature: 'PROBABILITY_DERIVATION' },
    { from: 'PHASE_11_NEWS_INDUSTRY', to: 'PHASE_14_VERDICT', nature: 'DECISION_EVIDENCE' },

    // Phase 12 downstream
    { from: 'PHASE_12_CATALYSTS_RISKS', to: 'PHASE_13_SCENARIOS', nature: 'PROBABILITY_DERIVATION' },
    { from: 'PHASE_12_CATALYSTS_RISKS', to: 'PHASE_14_VERDICT', nature: 'DECISION_EVIDENCE' },

    // Phase 13 downstream
    { from: 'PHASE_13_SCENARIOS', to: 'PHASE_14_VERDICT', nature: 'DECISION_EVIDENCE' },

    // Phase 14 downstream
    { from: 'PHASE_14_VERDICT', to: 'PHASE_15_REPORT', nature: 'DECISION_EVIDENCE' },
  ];

  /**
   * Returns the exact set of downstream invalidated phases for an upstream input modification.
   */
  public static getInvalidatedPhasesForInput(input: UpstreamInputCategory): PhaseNodeId[] {
    const rootPhases: Record<UpstreamInputCategory, PhaseNodeId[]> = {
      ANNUAL_REPORT_FILING: ['PHASE_5_CALCULATIONS'],
      CONCALL_TRANSCRIPT: ['PHASE_8_MANAGEMENT'],
      MARKET_PRICE_TICK: ['PHASE_9_VALUATION', 'PHASE_10_TECHNICAL'],
      TECHNICAL_CHART_OHLCV: ['PHASE_10_TECHNICAL'],
      CORPORATE_NEWS_EVENT: ['PHASE_11_NEWS_INDUSTRY'],
      REGULATORY_FILING: ['PHASE_7_FORENSIC', 'PHASE_11_NEWS_INDUSTRY'],
      SHAREHOLDING_PATTERN: ['PHASE_7_FORENSIC', 'PHASE_8_MANAGEMENT'],
      VALUATION_ASSUMPTION_OVERRIDE: ['PHASE_9_VALUATION'],
      MANAGEMENT_GUIDANCE_UPDATE: ['PHASE_8_MANAGEMENT'],
      INDUSTRY_SECTOR_DATA: ['PHASE_11_NEWS_INDUSTRY'],
    };

    return this.getDownstreamTraversal(rootPhases[input]);
  }

  /**
   * Computes the complete transitive downstream closure of affected phases using BFS.
   */
  public static getDownstreamTraversal(roots: PhaseNodeId[]): PhaseNodeId[] {
    const visited = new Set<PhaseNodeId>();
    const queue = [...roots];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (!visited.has(current)) {
        visited.add(current);
        const children = this.EDGES.filter((e) => e.from === current).map((e) => e.to);
        queue.push(...children);
      }
    }

    return this.ALL_PHASES.filter((p) => visited.has(p));
  }

  /**
   * Returns the direct downstream consumers of a phase.
   */
  public static getDirectDownstreamPhases(phase: PhaseNodeId): PhaseNodeId[] {
    return this.EDGES.filter((e) => e.from === phase).map((e) => e.to);
  }

  /**
   * Returns the direct upstream dependencies of a phase.
   */
  public static getDirectUpstreamPhases(phase: PhaseNodeId): PhaseNodeId[] {
    return this.EDGES.filter((e) => e.to === phase).map((e) => e.from);
  }

  /**
   * Validates the graph topology against codebase phase contracts.
   */
  public static validateDependencyGraphAgainstPhaseContracts(): GraphValidationResult {
    const errors: string[] = [];

    // 1. Cycle detection via DFS
    const visited = new Set<PhaseNodeId>();
    const recStack = new Set<PhaseNodeId>();
    let cycleDetected = false;

    const dfsCycle = (node: PhaseNodeId) => {
      visited.add(node);
      recStack.add(node);

      const neighbors = this.EDGES.filter((e) => e.from === node).map((e) => e.to);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfsCycle(neighbor);
        } else if (recStack.has(neighbor)) {
          cycleDetected = true;
          errors.push(`Cycle detected involving edge ${node} -> ${neighbor}`);
        }
      }
      recStack.delete(node);
    };

    for (const phase of this.ALL_PHASES) {
      if (!visited.has(phase)) {
        dfsCycle(phase);
      }
    }

    // 2. Reachability check from the 3 root ingestion points
    const roots: PhaseNodeId[] = ['PHASE_5_CALCULATIONS', 'PHASE_10_TECHNICAL', 'PHASE_11_NEWS_INDUSTRY'];
    const reachable = new Set<PhaseNodeId>(this.getDownstreamTraversal(roots));
    const unreachablePhases = this.ALL_PHASES.filter((p) => !reachable.has(p));

    if (unreachablePhases.length > 0) {
      errors.push(`Unreachable phases detected from source roots: ${unreachablePhases.join(', ')}`);
    }

    return {
      isValid: errors.length === 0 && !cycleDetected,
      errors,
      cycleDetected,
      unreachablePhases,
      totalEdges: this.EDGES.length,
    };
  }
}
