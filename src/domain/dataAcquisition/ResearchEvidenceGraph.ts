export type EvidenceNodeType =
  | 'COMPANY'
  | 'DOCUMENT'
  | 'CLAIM'
  | 'METRIC'
  | 'EVENT'
  | 'SOURCE'
  | 'CALCULATION'
  | 'VERDICT';

export type EvidenceEdgeType =
  | 'SUPPORTED_BY'
  | 'DERIVED_FROM'
  | 'CONTRADICTS'
  | 'SUPERSEDES'
  | 'CORROBORATES'
  | 'DEPENDS_ON'
  | 'INVALIDATES';

export interface EvidenceNode {
  id: string;
  type: EvidenceNodeType;
  label: string;
  data: Record<string, any>;
  sourceTier?: number;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NOT_ASSESSABLE';
}

export interface EvidenceEdge {
  fromNodeId: string;
  toNodeId: string;
  edgeType: EvidenceEdgeType;
  metadata?: Record<string, any>;
}

export class ResearchEvidenceGraph {
  private nodes: Map<string, EvidenceNode> = new Map();
  private edges: EvidenceEdge[] = [];

  addNode(node: EvidenceNode): void {
    this.nodes.set(node.id, node);
  }

  addEdge(edge: EvidenceEdge): void {
    this.edges.push(edge);
  }

  getNode(id: string): EvidenceNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): EvidenceNode[] {
    return Array.from(this.nodes.values());
  }

  getAllEdges(): EvidenceEdge[] {
    return [...this.edges];
  }

  /**
   * Retrieves the full upstream lineage trace for a specific node
   */
  getLineage(targetNodeId: string): { nodes: EvidenceNode[]; edges: EvidenceEdge[] } {
    const visitedNodes = new Set<string>();
    const resultNodes: EvidenceNode[] = [];
    const resultEdges: EvidenceEdge[] = [];

    const traverse = (nodeId: string) => {
      if (visitedNodes.has(nodeId)) return;
      visitedNodes.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        resultNodes.push(node);
      }

      // Find all incoming edges (supporting evidence)
      const incomingEdges = this.edges.filter((e) => e.toNodeId === nodeId);
      for (const edge of incomingEdges) {
        resultEdges.push(edge);
        traverse(edge.fromNodeId);
      }
    };

    traverse(targetNodeId);
    return { nodes: resultNodes, edges: resultEdges };
  }
}
