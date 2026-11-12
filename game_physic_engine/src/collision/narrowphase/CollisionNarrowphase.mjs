import { Vec2 } from '../../math/Vec2.mjs';
import { ContactManifold } from './ContactManifold.mjs';
import { SAT } from './SAT.mjs';

/**
 * CollisionNarrowphase: Präzise Kollisionserkennung und Manifold-Generierung
 * für alle Paarungen geometrischer Formen.
 */
export class CollisionNarrowphase {
  constructor(bridge) {
    this.bridge = bridge;
  }

  /**
   * Prüft zwei Formen auf Kollision und liefert ContactManifold oder null
   */
  collide(bodyA, bodyB, shapeA, shapeB) {
    const typeA = shapeA.type;
    const typeB = shapeB.type;

    // Sortiere Paare für kanonische Handler
    if (typeA === 'circle' && typeB === 'circle') {
      return this.collideCircleCircle(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'circle' && typeB === 'box') {
      return this.collideCircleBox(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'box' && typeB === 'circle') {
      return this.collideCircleBox(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'circle' && typeB === 'polygon') {
      return this.collideCirclePolygon(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'polygon' && typeB === 'circle') {
      return this.collideCirclePolygon(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'circle' && typeB === 'segment') {
      return this.collideCircleSegment(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'segment' && typeB === 'circle') {
      return this.collideCircleSegment(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'circle' && typeB === 'capsule') {
      return this.collideCircleCapsule(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'capsule' && typeB === 'circle') {
      return this.collideCircleCapsule(bodyB, bodyA, shapeB, shapeA, true);
    }

    // Box & Polygon Kombinationen (über SAT)
    if ((typeA === 'box' || typeA === 'polygon') && (typeB === 'box' || typeB === 'polygon')) {
      return this.collidePolyPoly(bodyA, bodyB, shapeA, shapeB);
    }

    // Segment vs Box / Polygon
    if (typeA === 'segment' && (typeB === 'box' || typeB === 'polygon')) {
      return this.collideSegmentPoly(bodyA, bodyB, shapeA, shapeB);
    }
    if ((typeA === 'box' || typeA === 'polygon') && typeB === 'segment') {
      return this.collideSegmentPoly(bodyB, bodyA, shapeB, shapeA, true);
    }

    // Capsule vs Box / Polygon / Capsule / Segment
    if (typeA === 'capsule' && (typeB === 'box' || typeB === 'polygon')) {
      return this.collideCapsulePoly(bodyA, bodyB, shapeA, shapeB);
    }
    if ((typeA === 'box' || typeA === 'polygon') && typeB === 'capsule') {
      return this.collideCapsulePoly(bodyB, bodyA, shapeB, shapeA, true);
    }
    if (typeA === 'capsule' && typeB === 'capsule') {
      return this.collideCapsuleCapsule(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'capsule' && typeB === 'segment') {
      return this.collideCapsuleSegment(bodyA, bodyB, shapeA, shapeB);
    }
    if (typeA === 'segment' && typeB === 'capsule') {
      return this.collideCapsuleSegment(bodyB, bodyA, shapeB, shapeA, true);
    }

    return null;
  }

  _initManifold(bodyA, bodyB, shapeA, shapeB, flip = false) {
    const m = flip
      ? new ContactManifold(bodyB, bodyA, shapeB, shapeA)
      : new ContactManifold(bodyA, bodyB, shapeA, shapeB);

    const comb = this.bridge.combineMaterials(shapeA.material, shapeB.material);
    m.friction = comb.friction;
    m.restitution = comb.restitution;
    return m;
  }

  /**
   * Kreis vs Kreis
   */
  collideCircleCircle(bodyA, bodyB, circleA, circleB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const centerB = bodyB.transform.transformPoint(circleB.offset);

    const delta = Vec2.sub(centerB, centerA);
    const distSq = delta.lengthSq();
    const rSum = circleA.radius + circleB.radius;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    let normal;
    if (dist > 1e-9) {
      normal = Vec2.scale(delta, 1.0 / dist);
    } else {
      normal = new Vec2(0, 1);
    }

    const penetration = rSum - dist;
    const contactPoint = Vec2.add(centerA, Vec2.scale(normal, circleA.radius - penetration * 0.5));

    const manifold = this._initManifold(bodyA, bodyB, circleA, circleB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(contactPoint, penetration);

    return manifold;
  }

  /**
   * Kreis vs Box
   */
  collideCircleBox(bodyA, bodyB, circleA, boxB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    // Bringe Kreiszentrum ins lokale Box-System
    const localCenter = bodyB.transform.inverseTransformPoint(centerA);
    const boxOffset = boxB.offset;

    // Nächsten Punkt auf der Kiste finden
    const cx = Math.max(boxOffset.x - boxB.hx, Math.min(boxOffset.x + boxB.hx, localCenter.x));
    const cy = Math.max(boxOffset.y - boxB.hy, Math.min(boxOffset.y + boxB.hy, localCenter.y));
    const closestLocal = new Vec2(cx, cy);

    let localDelta = Vec2.sub(localCenter, closestLocal);
    let distSq = localDelta.lengthSq();
    let inside = false;

    // Falls Zentrum innerhalb der Kiste liegt
    if (distSq < 1e-12) {
      inside = true;
      const dx1 = (boxOffset.x + boxB.hx) - localCenter.x;
      const dx2 = localCenter.x - (boxOffset.x - boxB.hx);
      const dy1 = (boxOffset.y + boxB.hy) - localCenter.y;
      const dy2 = localCenter.y - (boxOffset.y - boxB.hy);
      const minVal = Math.min(dx1, dx2, dy1, dy2);

      if (minVal === dx1) closestLocal.x = boxOffset.x + boxB.hx;
      else if (minVal === dx2) closestLocal.x = boxOffset.x - boxB.hx;
      else if (minVal === dy1) closestLocal.y = boxOffset.y + boxB.hy;
      else closestLocal.y = boxOffset.y - boxB.hy;

      localDelta = Vec2.sub(localCenter, closestLocal);
      distSq = localDelta.lengthSq();
    }

    if (!inside && distSq > circleA.radius * circleA.radius) {
      return null;
    }

    const dist = Math.sqrt(distSq);
    const worldClosest = bodyB.transform.transformPoint(closestLocal);

    let normal;
    let penetration;
    if (inside) {
      // Normale von A (Kreis) nach B (Box) -> zeigt in Kiste
      const localNorm = localDelta.normalize().negate();
      normal = bodyB.transform.transformVector(localNorm);
      penetration = circleA.radius + dist;
    } else {
      const localNorm = localDelta.normalize();
      // Normale von Kreis zu Box zeigt von A nach B -> localNorm invertieren
      normal = bodyB.transform.transformVector(localNorm).negate();
      penetration = circleA.radius - dist;
    }

    const manifold = this._initManifold(bodyA, bodyB, circleA, boxB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(worldClosest, penetration);

    return manifold;
  }

  /**
   * Kreis vs Polygon
   */
  collideCirclePolygon(bodyA, bodyB, circleA, polyB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const verts = polyB.getWorldVertices(bodyB.transform);
    const normals = polyB.getWorldNormals(bodyB.transform);
    const n = verts.length;

    let maxSep = -Infinity;
    let bestEdge = 0;

    for (let i = 0; i < n; i++) {
      const v = verts[i];
      const norm = normals[i];
      const sep = norm.dot(Vec2.sub(centerA, v));
      if (sep > circleA.radius) {
        return null; // Außerhalb des Radius
      }
      if (sep > maxSep) {
        maxSep = sep;
        bestEdge = i;
      }
    }

    const v1 = verts[bestEdge];
    const v2 = verts[(bestEdge + 1) % n];
    const edge = Vec2.sub(v2, v1);
    const edgeLenSq = edge.lengthSq();
    const toCenter = Vec2.sub(centerA, v1);
    const u = Math.max(0, Math.min(1, toCenter.dot(edge) / edgeLenSq));
    const closest = Vec2.add(v1, Vec2.scale(edge, u));

    const delta = Vec2.sub(closest, centerA);
    const distSq = delta.lengthSq();
    if (distSq > circleA.radius * circleA.radius) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : normals[bestEdge].clone();
    const penetration = circleA.radius - dist;

    const manifold = this._initManifold(bodyA, bodyB, circleA, polyB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(closest, penetration);

    return manifold;
  }

  /**
   * Kreis vs Liniensegment
   */
  collideCircleSegment(bodyA, bodyB, circleA, segB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const [w1, w2] = segB.getWorldEndpoints(bodyB.transform);
    const edge = Vec2.sub(w2, w1);
    const edgeLenSq = edge.lengthSq();

    const toCenter = Vec2.sub(centerA, w1);
    const t = Math.max(0, Math.min(1, toCenter.dot(edge) / edgeLenSq));
    const closest = Vec2.add(w1, Vec2.scale(edge, t));

    const delta = Vec2.sub(closest, centerA);
    const distSq = delta.lengthSq();
    const rSum = circleA.radius + segB.thickness;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;

    const manifold = this._initManifold(bodyA, bodyB, circleA, segB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(closest, penetration);

    return manifold;
  }

  /**
   * Kreis vs Kapsel
   */
  collideCircleCapsule(bodyA, bodyB, circleA, capB, flip = false) {
    const centerA = bodyA.transform.transformPoint(circleA.offset);
    const [p1, p2] = capB.getWorldEndpoints(bodyB.transform);
    const seg = Vec2.sub(p2, p1);
    const lenSq = seg.lengthSq();

    const t = Math.max(0, Math.min(1, Vec2.sub(centerA, p1).dot(seg) / lenSq));
    const closest = Vec2.add(p1, Vec2.scale(seg, t));

    const delta = Vec2.sub(closest, centerA);
    const distSq = delta.lengthSq();
    const rSum = circleA.radius + capB.radius;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;
    const contactPt = Vec2.add(centerA, Vec2.scale(normal, circleA.radius - penetration * 0.5));

    const manifold = this._initManifold(bodyA, bodyB, circleA, capB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(contactPt, penetration);

    return manifold;
  }

  /**
   * Polygon/Box vs Polygon/Box via SAT
   */
  collidePolyPoly(bodyA, bodyB, shapeA, shapeB, flip = false) {
    const vertsA = shapeA.getWorldVertices(bodyA.transform);
    const normalsA = shapeA.getWorldNormals(bodyA.transform);
    const vertsB = shapeB.getWorldVertices(bodyB.transform);
    const normalsB = shapeB.getWorldNormals(bodyB.transform);

    const satResult = SAT.collidePolygons(
      vertsA, normalsA, bodyA.position,
      vertsB, normalsB, bodyB.position
    );

    if (!satResult.collision) return null;

    const manifold = this._initManifold(bodyA, bodyB, shapeA, shapeB, flip);
    manifold.normal = flip ? satResult.normal.clone().negate() : satResult.normal;
    manifold.tangent = manifold.normal.perp();

    for (const pt of satResult.points) {
      manifold.addPoint(pt.point, pt.depth);
    }

    return manifold;
  }

  /**
   * Segment vs Box / Polygon
   */
  collideSegmentPoly(bodyA, bodyB, segA, polyB, flip = false) {
    // Segment als dünnes Polygon behandeln
    const [w1, w2] = segA.getWorldEndpoints(bodyA.transform);
    const edge = Vec2.sub(w2, w1);
    const norm = new Vec2(edge.y, -edge.x).normalize();
    const halfThick = segA.thickness * 0.5;

    const segVerts = [
      Vec2.add(w1, Vec2.scale(norm, halfThick)),
      Vec2.add(w2, Vec2.scale(norm, halfThick)),
      Vec2.sub(w2, Vec2.scale(norm, halfThick)),
      Vec2.sub(w1, Vec2.scale(norm, halfThick))
    ];
    const segNorms = [
      norm.clone(),
      edge.clone().normalize(),
      norm.clone().negate(),
      edge.clone().normalize().negate()
    ];

    const vertsB = polyB.getWorldVertices(bodyB.transform);
    const normalsB = polyB.getWorldNormals(bodyB.transform);

    const satResult = SAT.collidePolygons(
      segVerts, segNorms, bodyA.position,
      vertsB, normalsB, bodyB.position
    );

    if (!satResult.collision) return null;

    const manifold = this._initManifold(bodyA, bodyB, segA, polyB, flip);
    manifold.normal = flip ? satResult.normal.clone().negate() : satResult.normal;
    manifold.tangent = manifold.normal.perp();

    for (const pt of satResult.points) {
      manifold.addPoint(pt.point, pt.depth);
    }

    return manifold;
  }

  /**
   * Capsule vs Polygon/Box
   */
  collideCapsulePoly(bodyA, bodyB, capA, polyB, flip = false) {
    // Kapsel als Segment mit Radius r behandeln
    const [p1, p2] = capA.getWorldEndpoints(bodyA.transform);
    const seg = Vec2.sub(p2, p1);
    const vertsB = polyB.getWorldVertices(bodyB.transform);
    const normalsB = polyB.getWorldNormals(bodyB.transform);

    // Finde tiefsten Endpunkt oder projiziere Segment auf Polygon-Normalen
    let bestSep = -Infinity;
    let bestNorm = null;

    for (let i = 0; i < normalsB.length; i++) {
      const n = normalsB[i];
      const d1 = n.dot(Vec2.sub(p1, vertsB[i]));
      const d2 = n.dot(Vec2.sub(p2, vertsB[i]));
      const minD = Math.min(d1, d2);
      if (minD > capA.radius) {
        return null; // Trennung!
      }
      if (minD > bestSep) {
        bestSep = minD;
        bestNorm = n;
      }
    }

    // Wenn keine trennende Achse existiert, erstelle Kontakt
    const manifold = this._initManifold(bodyA, bodyB, capA, polyB, flip);
    const normal = bestNorm ? bestNorm.clone().negate() : new Vec2(0, -1);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();

    // Teste beide Kapsel-Endpunkte als Kreis-Kontakte
    for (const p of [p1, p2]) {
      let inside = true;
      let minPen = Infinity;
      let closestPt = null;

      for (let i = 0; i < vertsB.length; i++) {
        const v1 = vertsB[i];
        const v2 = vertsB[(i + 1) % vertsB.length];
        const edge = Vec2.sub(v2, v1);
        const norm = normalsB[i];
        const dist = norm.dot(Vec2.sub(p, v1));
        if (dist > capA.radius) {
          inside = false;
          break;
        }
        const pen = capA.radius - dist;
        if (pen < minPen) {
          minPen = pen;
          closestPt = Vec2.add(p, Vec2.scale(norm, -dist));
        }
      }

      if (inside && closestPt) {
        manifold.addPoint(closestPt, minPen);
      }
    }

    if (manifold.points.length === 0) {
      const mid = Vec2.lerp(p1, p2, 0.5);
      manifold.addPoint(mid, capA.radius - bestSep);
    }

    return manifold;
  }

  /**
   * Capsule vs Capsule
   */
  collideCapsuleCapsule(bodyA, bodyB, capA, capB, flip = false) {
    const [a1, a2] = capA.getWorldEndpoints(bodyA.transform);
    const [b1, b2] = capB.getWorldEndpoints(bodyB.transform);

    // Kürzesten Abstand zwischen zwei Raumsegmenten berechnen
    const segA = Vec2.sub(a2, a1);
    const segB = Vec2.sub(b2, b1);
    const r = Vec2.sub(a1, b1);

    const a = segA.dot(segA);
    const e = segB.dot(segB);
    const f = segB.dot(r);

    let s = 0.0;
    let t = 0.0;

    const c = segA.dot(r);
    const b = segA.dot(segB);
    const denom = a * e - b * b;

    if (denom !== 0.0) {
      s = Math.max(0.0, Math.min(1.0, (b * f - c * e) / denom));
    }

    t = (b * s + f) / e;
    if (t < 0.0) {
      t = 0.0;
      s = Math.max(0.0, Math.min(1.0, -c / a));
    } else if (t > 1.0) {
      t = 1.0;
      s = Math.max(0.0, Math.min(1.0, (b - c) / a));
    }

    const closestA = Vec2.add(a1, Vec2.scale(segA, s));
    const closestB = Vec2.add(b1, Vec2.scale(segB, t));

    const delta = Vec2.sub(closestB, closestA);
    const distSq = delta.lengthSq();
    const rSum = capA.radius + capB.radius;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;
    const pt = Vec2.add(closestA, Vec2.scale(normal, capA.radius - penetration * 0.5));

    const manifold = this._initManifold(bodyA, bodyB, capA, capB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(pt, penetration);

    return manifold;
  }

  /**
   * Capsule vs Segment
   */
  collideCapsuleSegment(bodyA, bodyB, capA, segB, flip = false) {
    // Ähnlich wie Capsule-Capsule mit Segment-Radius = segB.thickness
    const [a1, a2] = capA.getWorldEndpoints(bodyA.transform);
    const [b1, b2] = segB.getWorldEndpoints(bodyB.transform);

    const segA = Vec2.sub(a2, a1);
    const segB_vec = Vec2.sub(b2, b1);
    const r = Vec2.sub(a1, b1);

    const a = segA.dot(segA);
    const e = segB_vec.dot(segB_vec);
    const f = segB_vec.dot(r);

    let s = 0.0, t = 0.0;
    const c = segA.dot(r);
    const b = segA.dot(segB_vec);
    const denom = a * e - b * b;

    if (denom !== 0.0) s = Math.max(0.0, Math.min(1.0, (b * f - c * e) / denom));
    t = (b * s + f) / e;
    if (t < 0.0) { t = 0.0; s = Math.max(0.0, Math.min(1.0, -c / a)); }
    else if (t > 1.0) { t = 1.0; s = Math.max(0.0, Math.min(1.0, (b - c) / a)); }

    const closestA = Vec2.add(a1, Vec2.scale(segA, s));
    const closestB = Vec2.add(b1, Vec2.scale(segB_vec, t));

    const delta = Vec2.sub(closestB, closestA);
    const distSq = delta.lengthSq();
    const rSum = capA.radius + segB.thickness;

    if (distSq >= rSum * rSum) return null;

    const dist = Math.sqrt(distSq);
    const normal = dist > 1e-9 ? Vec2.scale(delta, 1.0 / dist) : new Vec2(0, 1);
    const penetration = rSum - dist;

    const manifold = this._initManifold(bodyA, bodyB, capA, segB, flip);
    manifold.normal = flip ? normal.clone().negate() : normal;
    manifold.tangent = manifold.normal.perp();
    manifold.addPoint(closestB, penetration);

    return manifold;
  }
}
