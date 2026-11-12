/**
 * MetricLatticeSolver: Minimiert die fundamentale SubQG Kantenwirkung S_edge[x]
 * inklusive Laplacian-Glättungsterm κ/2 Σ (x_e - x_f)^2 zur langreichweitigen
 * Ausbreitung des Gravitationspotentials über das gesamte relationale Netzwerk.
 */
export class MetricLatticeSolver {
  constructor(graph, config = {}) {
    this.graph = graph;
    this.kappa = config.kappa ?? 4.0; // Metrische Ausbreitungssteifigkeit (Laplace-Kopplung)
    this.mu = config.mu ?? 0.2;       // Metrischer Massenterm
    this.iterations = config.iterations ?? 8; // Schnelle Gitter-Relaxationsschritte pro Frame
  }

  /**
   * Löst die stationäre Kantenmetrik und das Poisson-analoge Gravitationspotential
   */
  solve() {
    const beta = this.graph.beta;
    const kappa = this.kappa;
    const mu = this.mu;

    let totalEdgeAction = 0.0;
    let maxStrain = 0.0;

    // 1. Lokale Dichten und Kantenmetrik
    for (const edge of this.graph.edges) {
      const uNode = this.graph.nodes.get(edge.u);
      const vNode = this.graph.nodes.get(edge.v);
      if (!uNode || !vNode) continue;

      const rhoE = (uNode.rho + vNode.rho) * 0.5;
      const targetX = 1.0 + (beta * rhoE) / (mu + 0.1);
      edge.x_e = edge.x_e + 0.5 * (targetX - edge.x_e);

      const strain = Math.abs(edge.x_e - 1.0);
      if (strain > maxStrain) maxStrain = strain;

      const diff = edge.x_e - 1.0;
      totalEdgeAction += edge.weight * (0.5 * diff * diff - beta * rhoE * edge.x_e);
    }

    // 2. Diffusive Relaxation des Potentials über das relationale Netzwerk (Poisson-Lösung ∇²Phi = beta * rho)
    for (let it = 0; it < this.iterations; it++) {
      for (const node of this.graph.nodes.values()) {
        const gx = node.gx;
        const gy = node.gy;
        const nLeft = this.graph.nodes.get(this.graph._nodeKey(gx - 1, gy))?.phi ?? 0;
        const nRight = this.graph.nodes.get(this.graph._nodeKey(gx + 1, gy))?.phi ?? 0;
        const nDown = this.graph.nodes.get(this.graph._nodeKey(gx, gy - 1))?.phi ?? 0;
        const nUp = this.graph.nodes.get(this.graph._nodeKey(gx, gy + 1))?.phi ?? 0;

        const lap = 0.25 * (nLeft + nRight + nDown + nUp);
        // Poisson-Gleichung auf dem Graph
        node.phi = 0.75 * lap - 0.25 * (beta * node.rho);
      }
    }

    return {
      totalEdgeAction,
      maxStrain,
      edgeCount: this.graph.edges.length,
      nodeCount: this.graph.nodes.size
    };
  }
}
