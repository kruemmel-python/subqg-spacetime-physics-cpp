/**
 * SubQGContactBridge: Verbindet die mikroskopische relationale Kantensteifigkeit
 * des SubQG-Gitters mit der makroskopischen Impulskollisions-Dynamik.
 * 
 * Wenn zwei Körper kollidieren, bewirkt die Überlappung ihrer SubQG-Wellenfunktionen
 * eine drastische Zunahme der Kantenverzerrung, was mikroskopisch als steiles
 * elastisches Repulsionspotential V(delta) = 1/2 k * delta^2 in Erscheinung tritt.
 */
export class SubQGContactBridge {
  constructor(config = {}) {
    this.edgeStiffness = config.edgeStiffness ?? 1e6; // N/m
    this.edgeDamping = config.edgeDamping ?? 1e3;     // Ns/m
    this.baumgarteFactor = config.baumgarteFactor ?? 0.2; // Positionskorrektur-Faktor
    this.slop = config.slop ?? 0.005; // 5 mm erlaubte Penetration ohne Drift
  }

  /**
   * Kombiniert Materialeigenschaften nach SubQG-Mittelungsregeln
   */
  combineMaterials(matA, matB) {
    // Reibung: geometrisches Mittel sqrt(mu_A * mu_B)
    const friction = Math.sqrt(matA.friction * matB.friction);
    // Bounciness / Restitution: maximaler oder geometrischer elastischer Stoßfaktor
    const restitution = Math.max(matA.restitution, matB.restitution);
    // Dichte: Durchschnitt
    const density = (matA.density + matB.density) * 0.5;

    return { friction, restitution, density };
  }

  /**
   * Berechnet den Baumgarte-Geschwindigkeits-Offset zur Korrektur von Überlappungen
   */
  computePenetrationBias(penetration, dt) {
    if (penetration <= this.slop) return 0.0;
    return (this.baumgarteFactor / Math.max(dt, 1e-4)) * (penetration - this.slop);
  }
}
