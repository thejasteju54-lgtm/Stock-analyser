import { describe, it, expect } from 'vitest';
import { ResearchEvidenceGraph } from '../../../src/domain/dataAcquisition/ResearchEvidenceGraph';

describe('Phase 21 — Research Evidence Graph & Provenance Lineage', () => {
  it('constructs a directed evidence graph with node additions and lineage retrieval', () => {
    const graph = new ResearchEvidenceGraph();

    // 1. Add Company Node
    graph.addNode({
      id: 'comp_bel',
      type: 'COMPANY',
      label: 'Bharat Electronics',
      data: { symbol: 'BEL', sector: 'DEFENCE' },
      sourceTier: 1,
    });

    // 2. Add Document Node
    graph.addNode({
      id: 'doc_ar24',
      type: 'DOCUMENT',
      label: 'Audited Annual Report FY24',
      data: { period: 'FY24', pages: 180 },
      sourceTier: 1,
    });

    // 3. Add Metric Node
    graph.addNode({
      id: 'metric_rev_fy24',
      type: 'METRIC',
      label: 'Revenue FY24 (₹20,268 Cr)',
      data: { value: 20268, unit: 'INR_CR' },
      sourceTier: 1,
    });

    // 4. Add Calculation Node
    graph.addNode({
      id: 'calc_ebitda_margin',
      type: 'CALCULATION',
      label: 'EBITDA Margin (24.6%)',
      data: { formula: 'EBITDA / Revenue' },
    });

    // Connect edges
    graph.addEdge({ fromNodeId: 'comp_bel', toNodeId: 'doc_ar24', edgeType: 'SUPPORTED_BY' });
    graph.addEdge({ fromNodeId: 'doc_ar24', toNodeId: 'metric_rev_fy24', edgeType: 'DERIVED_FROM' });
    graph.addEdge({ fromNodeId: 'metric_rev_fy24', toNodeId: 'calc_ebitda_margin', edgeType: 'DEPENDS_ON' });

    expect(graph.getAllNodes().length).toBe(4);
    expect(graph.getAllEdges().length).toBe(3);

    // Test Lineage Retrieval from Calculation Node
    const lineage = graph.getLineage('calc_ebitda_margin');
    expect(lineage.nodes.map((n) => n.id)).toContain('calc_ebitda_margin');
    expect(lineage.nodes.map((n) => n.id)).toContain('metric_rev_fy24');
    expect(lineage.nodes.map((n) => n.id)).toContain('doc_ar24');
    expect(lineage.nodes.map((n) => n.id)).toContain('comp_bel');
  });
});
