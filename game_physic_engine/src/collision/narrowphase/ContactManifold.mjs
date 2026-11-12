import { Vec2 } from '../../math/Vec2.mjs';

/**
 * ContactPoint: Einzelner Kontaktpunkt in der Kontakt-Manifold
 */
export class ContactPoint {
  constructor(point = new Vec2(0, 0), penetration = 0) {
    this.point = point.clone();         // Weltposition des Kontakts
    this.penetration = penetration;     // Eindringtiefe (> 0 bei Überlappung)
    this.normalImpulse = 0.0;           // Akkumulierter Normal-Impuls für Warm-Starting
    this.tangentImpulse = 0.0;          // Akkumulierter Tangential-(Reibungs-)Impuls
    this.rA = new Vec2(0, 0);           // Hebelarm vom Schwerpunkt A: point - posA
    this.rB = new Vec2(0, 0);           // Hebelarm vom Schwerpunkt B: point - posB
    this.normalMass = 0.0;              // Effektive Masse in Normalenrichtung: 1 / (mA^-1 + mB^-1 + (rA x n)^2 / IA + (rB x n)^2 / IB)
    this.tangentMass = 0.0;             // Effektive Masse in Tangentenrichtung
    this.bias = 0.0;                    // Baumgarte-Geschwindigkeits-Bias + Restitutions-Bias
  }
}

/**
 * ContactManifold: Repräsentiert die Berührungsfläche / Kontaktpunkte zwischen zwei Körpern
 */
export class ContactManifold {
  constructor(bodyA, bodyB, shapeA, shapeB) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.shapeA = shapeA;
    this.shapeB = shapeB;
    this.normal = new Vec2(0, 1);       // Einheitsnormale von A nach B
    this.tangent = new Vec2(-1, 0);     // Tangente orthogonal zur Normale
    this.points = [];                   // Array von ContactPoint (1 oder 2 Punkte)
    this.friction = 0.3;
    this.restitution = 0.0;
    this.isTrigger = shapeA.isTrigger || shapeB.isTrigger;
  }

  addPoint(point, penetration) {
    this.points.push(new ContactPoint(point, penetration));
  }

  get key() {
    const idA = this.bodyA.id;
    const idB = this.bodyB.id;
    return idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
  }
}
