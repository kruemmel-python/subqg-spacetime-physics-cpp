import { Vec2 } from '../../math/Vec2.mjs';

/**
 * SAT: Separating Axis Theorem (Satz von den trennenden Achsen)
 * für konvexe Polygone und Kisten inklusive Sutherland-Hodgman Kanten-Clipping.
 */
export class SAT {
  /**
   * Projiziert ein Polygon auf eine Achse und gibt [min, max] zurück
   */
  static projectPolygon(axis, vertices) {
    let min = axis.dot(vertices[0]);
    let max = min;
    for (let i = 1; i < vertices.length; i++) {
      const p = axis.dot(vertices[i]);
      if (p < min) min = p;
      if (p > max) max = p;
    }
    return [min, max];
  }

  /**
   * Findet die Achse mit minimaler Überlappung
   */
  static findMinOverlap(vertsA, normalsA, vertsB, normalsB) {
    let minOverlap = Infinity;
    let bestAxis = null;
    let bestIsA = true;

    // Teste Normalen von A
    for (let i = 0; i < normalsA.length; i++) {
      const axis = normalsA[i];
      const [minA, maxA] = SAT.projectPolygon(axis, vertsA);
      const [minB, maxB] = SAT.projectPolygon(axis, vertsB);

      if (maxA < minB || maxB < minA) {
        return { separating: true }; // Trennende Achse gefunden -> keine Kollision!
      }

      const overlap1 = maxA - minB;
      const overlap2 = maxB - minA;
      const overlap = Math.min(overlap1, overlap2);

      if (overlap < minOverlap) {
        minOverlap = overlap;
        bestAxis = axis;
        bestIsA = true;
      }
    }

    // Teste Normalen von B
    for (let i = 0; i < normalsB.length; i++) {
      const axis = normalsB[i];
      const [minA, maxA] = SAT.projectPolygon(axis, vertsA);
      const [minB, maxB] = SAT.projectPolygon(axis, vertsB);

      if (maxA < minB || maxB < minA) {
        return { separating: true };
      }

      const overlap1 = maxA - minB;
      const overlap2 = maxB - minA;
      const overlap = Math.min(overlap1, overlap2);

      if (overlap < minOverlap) {
        minOverlap = overlap;
        bestAxis = axis;
        bestIsA = false;
      }
    }

    return {
      separating: false,
      overlap: minOverlap,
      axis: bestAxis,
      isAxisFromA: bestIsA
    };
  }

  /**
   * Clippt Kantenpunkte gegen eine Ebene
   */
  static clipSegmentToLine(vIn, normal, offset) {
    const vOut = [];
    const d0 = normal.dot(vIn[0]) - offset;
    const d1 = normal.dot(vIn[1]) - offset;

    if (d0 <= 0.0) vOut.push(vIn[0]);
    if (d1 <= 0.0) vOut.push(vIn[1]);

    if (d0 * d1 < 0.0) {
      const alpha = d0 / (d0 - d1);
      const interp = Vec2.add(vIn[0], Vec2.scale(Vec2.sub(vIn[1], vIn[0]), alpha));
      vOut.push(interp);
    }

    return vOut;
  }

  /**
   * Findet Incident Edge (die am meisten antiparallel zur Referenz-Normalen ist)
   */
  static findIncidentEdge(refNormal, verts) {
    let minDot = Infinity;
    let incidentIndex = 0;
    const n = verts.length;

    for (let i = 0; i < n; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % n];
      const edge = Vec2.sub(p2, p1);
      const normal = new Vec2(edge.y, -edge.x).normalize();
      const dot = normal.dot(refNormal);
      if (dot < minDot) {
        minDot = dot;
        incidentIndex = i;
      }
    }

    const p1 = verts[incidentIndex];
    const p2 = verts[(incidentIndex + 1) % n];
    return [p1, p2];
  }

  /**
   * Kollisionstest zweier konvexer Polygone (oder Boxen)
   * Liefert { collision: boolean, normal: Vec2, points: Array<{ point: Vec2, depth: number }> }
   */
  static collidePolygons(vertsA, normalsA, posA, vertsB, normalsB, posB) {
    const result = SAT.findMinOverlap(vertsA, normalsA, vertsB, normalsB);
    if (result.separating) {
      return { collision: false };
    }

    let normal = result.axis.clone();
    // Stelle sicher, dass die Normale von A nach B zeigt
    const centerDir = Vec2.sub(posB, posA);
    if (normal.dot(centerDir) < 0) {
      normal.negate();
    }

    // Bestimme Referenz- und Incident-Polygon
    let refVerts, incVerts, refNormal;
    if (result.isAxisFromA) {
      refVerts = vertsA;
      incVerts = vertsB;
      refNormal = normal.clone();
    } else {
      refVerts = vertsB;
      incVerts = vertsA;
      refNormal = normal.clone().negate();
    }

    // Finde Referenzkante
    let maxDot = -Infinity;
    let refIndex = 0;
    const nRef = refVerts.length;
    for (let i = 0; i < nRef; i++) {
      const p1 = refVerts[i];
      const p2 = refVerts[(i + 1) % nRef];
      const edge = Vec2.sub(p2, p1);
      const edgeNorm = new Vec2(edge.y, -edge.x).normalize();
      const dot = edgeNorm.dot(refNormal);
      if (dot > maxDot) {
        maxDot = dot;
        refIndex = i;
      }
    }

    const refV1 = refVerts[refIndex];
    const refV2 = refVerts[(refIndex + 1) % nRef];
    const refEdge = Vec2.sub(refV2, refV1).normalize();
    const refTangent = refEdge.clone();

    // Incident Edge finden
    let incident = SAT.findIncidentEdge(refNormal, incVerts);

    // Klippe incident edge an den Seitenflächen der Referenzkante
    // 1. Klippe an refV1 entlang -refTangent
    incident = SAT.clipSegmentToLine(incident, refTangent.clone().negate(), -refTangent.dot(refV1));
    if (incident.length < 2) return { collision: false };

    // 2. Klippe an refV2 entlang refTangent
    incident = SAT.clipSegmentToLine(incident, refTangent, refTangent.dot(refV2));
    if (incident.length < 2) return { collision: false };

    // Behalte nur Punkte, die hinter der Referenzebene liegen
    const frontOffset = refNormal.dot(refV1);
    const contactPoints = [];

    for (const pt of incident) {
      const sep = refNormal.dot(pt) - frontOffset;
      if (sep <= 0.0) {
        const depth = -sep;
        // Punkt auf Referenzebene projizieren
        const contactPoint = result.isAxisFromA ? pt : Vec2.add(pt, Vec2.scale(normal, depth));
        contactPoints.push({
          point: contactPoint,
          depth: Math.max(depth, result.overlap)
        });
      }
    }

    if (contactPoints.length === 0) {
      // Fallback: mindestens 1 Kontaktpunkt mit minimaler Überlappung
      const mid = Vec2.lerp(posA, posB, 0.5);
      contactPoints.push({
        point: mid,
        depth: result.overlap
      });
    }

    return {
      collision: true,
      normal,
      points: contactPoints
    };
  }
}
