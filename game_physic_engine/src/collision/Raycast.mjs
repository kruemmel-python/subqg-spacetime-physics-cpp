import { Vec2 } from '../math/Vec2.mjs';

/**
 * Ray: Repräsentiert einen physikalischen Abtaststrahl
 */
export class Ray {
  constructor(origin = new Vec2(0, 0), direction = new Vec2(1, 0), maxDistance = Infinity) {
    this.origin = origin.clone();
    this.direction = direction.clone().normalize();
    this.maxDistance = maxDistance;
  }
}

/**
 * RaycastHit: Detailliertes Treffer-Ergebnis eines Raycasts
 */
export class RaycastHit {
  constructor(body = null, shape = null, point = new Vec2(0, 0), normal = new Vec2(0, 1), fraction = 0) {
    this.body = body;
    this.shape = shape;
    this.point = point.clone();
    this.normal = normal.clone();
    this.fraction = fraction;
    this.distance = fraction; // Bei normalisierter Richtung ist fraction = Distanz
  }
}
