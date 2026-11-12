import { Vec2 } from '../math/Vec2.mjs';

/**
 * SubQGInspector: Extrahiert Metrik-, Wirkungs- und Kausal-Zustände
 * aus dem internen SubQG-Hintergrundgitter für wissenschaftliche Audits,
 * Spiel-Shader und visuelle Heatmaps.
 */
export class SubQGInspector {
  constructor(world) {
    this.world = world;
  }

  /**
   * Berechnet die vollständige Energie- und Aktionsbilanz des Gesamtsystems
   */
  computeFullEnergyAudit() {
    let kineticEnergy = 0.0;
    let rotationalEnergy = 0.0;
    let potentialEnergy = 0.0;
    const g = Math.abs(this.world.getGravity().y);

    for (const body of this.world.bodies) {
      if (body.type === 'dynamic' && body.mass > 0) {
        kineticEnergy += 0.5 * body.mass * body.velocity.lengthSq();
        rotationalEnergy += 0.5 * body.inertia * body.angularVelocity * body.angularVelocity;
        potentialEnergy += body.mass * g * Math.max(0, body.position.y);
      }
    }

    const mechanicalTotal = kineticEnergy + rotationalEnergy + potentialEnergy;
    const diag = this.world.getSubQGDiagnostics();

    return {
      kineticEnergy,
      rotationalEnergy,
      potentialEnergy,
      mechanicalTotal,
      subqgEdgeAction: diag.totalEdgeAction,
      maxMetricStrain: diag.maxStrain,
      activeEdges: diag.edgeCount,
      activeNodes: diag.nodeCount,
      stepTimeMs: diag.stepTimeMs
    };
  }

  /**
   * Extrahiert ein 2D Dichte- und Deformations-Grid für Visualisierung
   */
  extractMetricHeatmap(resolution = 32) {
    const graph = this.world.subqgGraph;
    const spanX = graph.extentX * 2;
    const spanY = graph.extentY * 2;
    const stepX = spanX / resolution;
    const stepY = spanY / resolution;

    const grid = [];
    for (let j = 0; j < resolution; j++) {
      const row = [];
      const y = -graph.extentY + j * stepY;
      for (let i = 0; i < resolution; i++) {
        const x = -graph.extentX + i * stepX;
        const phi = graph.samplePotential(new Vec2(x, y));
        row.push(phi);
      }
      grid.push(row);
    }

    return {
      resolution,
      spanX,
      spanY,
      grid
    };
  }
}
