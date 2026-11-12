import { Vec2 } from '../../math/Vec2.mjs';
import { AABB } from '../../math/AABB.mjs';
import { Material } from '../../dynamics/Material.mjs';

/**
 * Shape: Abstrakte Basisklasse für alle geometrischen Kollisionsformen.
 */
export class Shape {
  constructor(type = 'shape') {
    this.type = type;
    this.material = Material.default();
    this.isTrigger = false; // Sensor / Trigger: detektiert Überlappungen ohne physischen Stoß
    this.body = null;       // Zugehöriger RigidBody
    this.offset = new Vec2(0, 0); // Lokaler Versatz zum Schwerpunkt
  }

  setMaterial(material) {
    this.material = material;
    if (this.body) this.body._recomputeMassData();
    return this;
  }

  setTrigger(isTrigger) {
    this.isTrigger = isTrigger;
    return this;
  }

  setOffset(x, y) {
    this.offset.set(x, y);
    if (this.body) this.body._recomputeMassData();
    return this;
  }

  /**
   * Berechnet Masse und Trägheitsmoment für die gegebene Dichte
   * Gibt { mass, inertia } zurück
   */
  computeMassData(density) {
    throw new Error('computeMassData() must be implemented by subclass');
  }

  /**
   * Berechnet die weltraumbezogene AABB der Form unter Transformation T
   */
  computeAABB(transform) {
    throw new Error('computeAABB() must be implemented by subclass');
  }

  /**
   * Prüft, ob ein Weltpunkt innerhalb der Form liegt
   */
  testPoint(point, transform) {
    throw new Error('testPoint() must be implemented by subclass');
  }

  /**
   * Führt einen Raycast gegen die Form durch
   */
  raycast(ray, transform, maxDist) {
    throw new Error('raycast() must be implemented by subclass');
  }
}
