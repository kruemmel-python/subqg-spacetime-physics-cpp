/**
 * Material: Definiert physikalische Oberflächen- und Masseneigenschaften
 */
export class Material {
  constructor(config = {}) {
    this.density = config.density ?? 1.0;       // Dichte in kg/m² (für 2D)
    this.friction = config.friction ?? 0.3;     // Reibungskoeffizient mu (0.0 = reibungsfrei, 1.0 = hoch)
    this.restitution = config.restitution ?? 0.2; // Elastizität / Rückprall (0.0 = unelastisch, 1.0 = perfekt elastisch)
  }

  static default() {
    return new Material({ density: 1.0, friction: 0.3, restitution: 0.2 });
  }

  static wood() {
    return new Material({ density: 0.7, friction: 0.4, restitution: 0.15 });
  }

  static metal() {
    return new Material({ density: 7.8, friction: 0.2, restitution: 0.1 });
  }

  static rubber() {
    return new Material({ density: 1.2, friction: 0.8, restitution: 0.85 });
  }

  static ice() {
    return new Material({ density: 0.9, friction: 0.05, restitution: 0.1 });
  }

  static bouncy() {
    return new Material({ density: 1.0, friction: 0.2, restitution: 0.95 });
  }

  static stone() {
    return new Material({ density: 2.5, friction: 0.6, restitution: 0.05 });
  }
}
