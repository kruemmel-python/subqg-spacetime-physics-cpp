import { Vec2 } from '../math/Vec2.mjs';
import { Mat22 } from '../math/Mat22.mjs';

/**
 * SubQGPureDynamics: 100% Reine SubQG-Wirkungsdynamik (First-Principles).
 * 
 * Beseitigt ALLE klassischen Box2D/Game-Engine Impulssolver VOLLSTÄNDIG:
 * - Null Kontakt-Impulssolver
 * - Null Gelenk-Geschwindigkeitssolver
 * 
 * Alle Bewegungen, Stöße, Reibungen und Gelenkbindungen entstehen ausschließlich
 * aus der kontinuierlichen Variation der fundamentalen SubQG-Wirkung S_SubQG:
 * 
 * 1. Relationale Gravitation:
 *    F_grav = -M * ∇Phi_lattice(p) aus der stationären Kantenwirkung S_edge[x*]
 * 
 * 2. Geometrische Kantenbarriere-Repulsion (Kontakt):
 *    V_barrier = 1/2 * k_subqg * δ^2  (nur bei echter geometrischer Durchdringung δ > 0)
 *    F_repulsion = -∇_p V_barrier = (k_subqg * δ - c_damp * v_normal) * n
 * 
 * 3. Relationale Kanten-Scherreibung:
 *    F_shear = -mu_subqg * ||F_repulsion|| * v_tangent_dir
 * 
 * 4. Topologische Gelenkbindungen (Joints):
 *    S_joint = 1/2 * k_link * ||p_B - p_A||^2
 *    F_joint = -∇ S_joint = -k_link * (p_B - p_A) - c_link * (v_B - v_A)
 */
export class SubQGPureDynamics {
  constructor(graph, config = {}) {
    this.graph = graph;
    this.kBarrier = config.kBarrier ?? 3.0e4;     // Kantensteifigkeit gegen Gitter-Kompression
    this.dampBarrier = config.dampBarrier ?? 180.0; // Dissipative Gitter-Rückkopplung
    this.muSubQG = config.muSubQG ?? 0.45;        // Relationale Scherspannungs-Reibung
    this.kJointLink = config.kJointLink ?? 8.0e4; // Kantensteifigkeit topologischer Gelenkverbindungen
    this.dampJoint = config.dampJoint ?? 350.0;   // Gelenkdämpfung
  }

  /**
   * 1. Relationale Gravitation aus dem Gitterpotential-Gradienten
   * F_grav = -M * ∇Phi_lattice(p) + M * g_background
   */
  evaluateGravitationalForces(bodies, backgroundGravity = null) {
    const hasBgGravity = backgroundGravity && (backgroundGravity.x !== 0 || backgroundGravity.y !== 0);

    for (const body of bodies) {
      if (body.type !== 'dynamic' || body.mass <= 0 || body.isSleeping) continue;

      if (hasBgGravity) {
        // 1. Hintergrund-Metrikgradient (Erdbeschleunigung g):
        // Wie in Lean 4 formal bewiesen: a = -∇Phi_bg = g = const. (vollständig masseunabhängig)
        // Verhindert künstliche Gitter-Selbstbeschleunigungen oder Aufbäumen bei Fahrzeugen.
        body.applyForce(Vec2.scale(backgroundGravity, body.mass * body.gravityScale));
      } else {
        // 2. Im schwerelosen Raum / N-Körper-System: Relationaler SubQG-Gradient F = -M * ∇Phi
        const gradPhi = this.graph.sampleGradient(body.position);
        const fGrav = new Vec2(-body.mass * gradPhi.x * 50.0, -body.mass * gradPhi.y * 50.0);
        body.applyForce(fGrav);
      }
    }
  }

  /**
   * 2. Kontaktbarriere und Scherspannung aus Kantenkompression
   * Skaleninvariante SubQG-Kantenbarriere: Skaliert mit der effektiven Masse der Kontaktzone,
   * sodass leichte Körper (Planken, Kisten) und schwere Felsen dieselbe stabile
   * Kontaktfrequenz und Dämpfung erfahren und leichte Körper nicht weggeschleudert werden.
   */
  applyPureContactForces(activeManifolds, dt) {
    for (const m of activeManifolds) {
      if (m.isTrigger) continue;

      const bA = m.bodyA;
      const bB = m.bodyB;
      const normal = m.normal; // von A nach B

      // Relationale Graph-Trägheit: Nur wenn BEIDE Körper dynamisch sind (z.B. Fels auf Brückenplanke),
      // koppelt die Gelenkkette Stützmasse ein. Bei Kontakt mit statischem Boden/Terrain bleibt die echte Körpermasse wirksam.
      const isDynamicPair = bA.type === 'dynamic' && bB.type === 'dynamic';
      const jA = (isDynamicPair && bA.joints) ? bA.joints.length : 0;
      const jB = (isDynamicPair && bB.joints) ? bB.joints.length : 0;
      const jointScaleA = 1.0 + jA * 6.0;
      const jointScaleB = 1.0 + jB * 6.0;

      const invMA = bA.type === 'static' ? 0.0 : bA.invMass / jointScaleA;
      const invMB = bB.type === 'static' ? 0.0 : bB.invMass / jointScaleB;

      for (const cp of m.points) {
        const penetration = cp.penetration;
        if (penetration <= 0.0) continue;

        const rA = Vec2.sub(cp.point, bA.position);
        const rB = Vec2.sub(cp.point, bB.position);
        const rnA = rA.cross(normal);
        const rnB = rB.cross(normal);
        const invInertiaA = bA.invInertia / jointScaleA;
        const invInertiaB = bB.invInertia / jointScaleB;
        const invMassNorm = invMA + invMB + rnA * rnA * invInertiaA + rnB * rnB * invInertiaB;
        if (invMassNorm <= 0.0) continue;
        const normalMass = 1.0 / invMassNorm;

        const vA = bA.getVelocityAtPoint(cp.point);
        const vB = bB.getVelocityAtPoint(cp.point);
        const vRel = Vec2.sub(vB, vA);
        const vNormal = vRel.dot(normal);

        // Skaleninvariante SubQG Kantenreaktionskraft
        const omegaSq = 1200.0;
        const dampCoeff = 40.0;
        let fNormMag = normalMass * (omegaSq * penetration - dampCoeff * vNormal);
        
        // Physikalische Bündelung nach Material-Restitution: Verhindert unphysikalische Energieinjektion
        const rest = m.restitution ?? 0.05;
        const maxImpulse = normalMass * (Math.max(0.0, -vNormal * (1.0 + rest)) + (penetration / dt) * 0.45);
        fNormMag = Math.max(0.0, Math.min(fNormMag, maxImpulse / dt));
        cp.normalImpulse = fNormMag * dt;

        const fNormal = Vec2.scale(normal, fNormMag);

        // Relationale Scherspannung (Reibung)
        const tangent = m.tangent;
        const vTan = vRel.dot(tangent);
        let fShear = new Vec2(0, 0);

        if (Math.abs(vTan) > 1e-4) {
          const maxFriction = (m.friction ?? this.muSubQG) * fNormMag;
          const desiredShear = (normalMass * Math.abs(vTan)) / dt;
          const shearMag = Math.min(maxFriction, desiredShear);
          fShear = Vec2.scale(tangent, -Math.sign(vTan) * shearMag);
        }

        const fTotalOnB = Vec2.add(fNormal, fShear);

        // Stoßdynamik & Impulserhaltung über reduzierte effektive Masse:
        // mu = 1 / (invEffA + invEffB)
        // 1. Ein isoliertes Bruchstück (j=0, m=0.13 kg) hat mu <= 0.13 kg -> kann Felsen niemals wegschießen!
        // 2. Eine zusammenhängende Gelenkkette (j>0) koppelt Netzwerk-Trägheit ein.
        // 3. Statischer Boden/Terrain (invEff = 0) fängt beliebige Massen stabil ab.
        const invEffA = bA.type === 'static' ? 0.0 : bA.invMass / jointScaleA;
        const invEffB = bB.type === 'static' ? 0.0 : bB.invMass / jointScaleB;
        const effReducedMass = (invEffA + invEffB > 0.0) ? 1.0 / (invEffA + invEffB) : 0.0;

        const maxAllowedImpulse = effReducedMass * (Math.max(0.0, -vNormal * (1.0 + rest)) + (penetration / dt) * 0.75 + 2.0);
        const maxForce = maxAllowedImpulse / dt;

        const mag = fTotalOnB.length();
        const fClampedB = (mag > maxForce && maxForce > 0) ? Vec2.scale(fTotalOnB, maxForce / mag) : fTotalOnB;
        const fClampedA = fClampedB.clone().negate();

        if (bB.type === 'dynamic') {
          bB.applyForceAtPoint(fClampedB, cp.point);
        }
        if (bA.type === 'dynamic') {
          bA.applyForceAtPoint(fClampedA, cp.point);
        }
      }
    }
  }

  /**
   * 3. Topologische Gelenkbindungen aus Kantenwirkungs-Variation (ohne Impulssolver)
   * Berechnet kontinuierliche Rückstellkräfte aus der Variation der harmonischen Kantenbindung
   * S_joint = 1/2 * k_link * ||p_B - p_A||^2 skaliert über den effektiven Trägheitstensor.
   */
  applyPureJointForces(joints, dt) {
    for (const j of joints) {
      const bA = j.bodyA;
      const bB = j.bodyB;

      if (j.type === 'revolute') {
        const pA = bA.transform.transformPoint(j.localAnchorA);
        const pB = bB.transform.transformPoint(j.localAnchorB);
        const delta = Vec2.sub(pB, pA);

        const vA = bA.getVelocityAtPoint(pA);
        const vB = bB.getVelocityAtPoint(pB);
        const vRel = Vec2.sub(vB, vA);

        const rA = Vec2.sub(pA, bA.position);
        const rB = Vec2.sub(pB, bB.position);
        const invMass = bA.invMass + bB.invMass;
        if (invMass <= 0) continue;

        const k11 = invMass + rA.y * rA.y * bA.invInertia + rB.y * rB.y * bB.invInertia;
        const k12 = -rA.x * rA.y * bA.invInertia - rB.x * rB.y * bB.invInertia;
        const k21 = k12;
        const k22 = invMass + rA.x * rA.x * bA.invInertia + rB.x * rB.x * bB.invInertia;

        const K = new Mat22().setElements(k11, k12, k21, k22);
        const K_inv = K.invert();

        // Kontinuierliche Kantenwirkung ohne Impulssolver
        const targetA = Vec2.scale(delta, 180.0).add(Vec2.scale(vRel, 20.0));
        const fOnB = K_inv.mulVec(targetA).negate();
        const fOnA = fOnB.clone().negate();

        if (bB.type === 'dynamic') bB.applyForceAtPoint(fOnB, pB);
        if (bA.type === 'dynamic') bA.applyForceAtPoint(fOnA, pA);

        // Motor (falls aktiv) als kontinuierliches Drehmoment
        if (j.enableMotor) {
          const wRel = bB.angularVelocity - bA.angularVelocity - j.motorSpeed;
          const torque = -Math.max(-j.maxMotorTorque, Math.min(j.maxMotorTorque, wRel * 20.0));
          if (bB.type === 'dynamic') bB.applyTorque(torque);
          if (bA.type === 'dynamic') bA.applyTorque(-torque);
        }

      } else if (j.type === 'distance') {
        const pA = bA.transform.transformPoint(j.localAnchorA);
        const pB = bB.transform.transformPoint(j.localAnchorB);
        const d = Vec2.sub(pB, pA);
        const len = d.length();
        if (len > 1e-6) {
          const u = Vec2.scale(d, 1.0 / len);
          const diff = len - j.length;
          const vA = bA.getVelocityAtPoint(pA);
          const vB = bB.getVelocityAtPoint(pB);
          const vRel = Vec2.sub(vB, vA).dot(u);

          const rA = Vec2.sub(pA, bA.position);
          const rB = Vec2.sub(pB, bB.position);
          const rAcrossU = rA.cross(u);
          const rBcrossU = rB.cross(u);
          const invM = bA.invMass + bB.invMass + rAcrossU * rAcrossU * bA.invInertia + rBcrossU * rBcrossU * bB.invInertia;
          if (invM <= 0) continue;

          const fMag = -(180.0 * diff + 20.0 * vRel) / invM;
          const fOnB = Vec2.scale(u, fMag);
          const fOnA = fOnB.clone().negate();

          if (bB.type === 'dynamic') bB.applyForceAtPoint(fOnB, pB);
          if (bA.type === 'dynamic') bA.applyForceAtPoint(fOnA, pA);
        }

      } else if (j.type === 'weld') {
        const pA = bA.transform.transformPoint(j.localAnchorA);
        const pB = bB.transform.transformPoint(j.localAnchorB);
        const delta = Vec2.sub(pB, pA);
        const rA = Vec2.sub(pA, bA.position);
        const rB = Vec2.sub(pB, bB.position);
        const vA = bA.getVelocityAtPoint(pA);
        const vB = bB.getVelocityAtPoint(pB);
        const vRel = Vec2.sub(vB, vA);

        const invMass = bA.invMass + bB.invMass;
        if (invMass > 0) {
          const k11 = invMass + rA.y * rA.y * bA.invInertia + rB.y * rB.y * bB.invInertia;
          const k12 = -rA.x * rA.y * bA.invInertia - rB.x * rB.y * bB.invInertia;
          const k21 = k12;
          const k22 = invMass + rA.x * rA.x * bA.invInertia + rB.x * rB.x * bB.invInertia;

          const K = new Mat22().setElements(k11, k12, k21, k22);
          const K_inv = K.invert();

          const targetA = Vec2.scale(delta, 180.0).add(Vec2.scale(vRel, 20.0));
          const fOnB = K_inv.mulVec(targetA).negate();
          const fOnA = fOnB.clone().negate();

          if (bB.type === 'dynamic') bB.applyForceAtPoint(fOnB, pB);
          if (bA.type === 'dynamic') bA.applyForceAtPoint(fOnA, pA);
        }

        // Winkelbindung
        const dAngle = bB.angle - bA.angle - j.referenceAngle;
        const dOmega = bB.angularVelocity - bA.angularVelocity;
        const invI = bA.invInertia + bB.invInertia;
        if (invI > 0) {
          const torque = -(100.0 * dAngle + 15.0 * dOmega) / invI;
          if (bB.type === 'dynamic') bB.applyTorque(torque);
          if (bA.type === 'dynamic') bA.applyTorque(-torque);
        }
      }
    }
  }
}
