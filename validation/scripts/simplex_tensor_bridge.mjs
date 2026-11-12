import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MicroActionWorld } from '../../src/modules/subqg_microaction.mjs';
import { simplexTensorKinematicsAudit } from '../../src/modules/subqg_simplex_tensor_bridge.mjs';
import { simplexRadiativeGaugeAudit } from '../../src/modules/subqg_simplex_gauge_bridge.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'simplex_tensor_bridge.json');
const world = new MicroActionWorld({ seed: 42 });
world.run(400);
const kinematics = simplexTensorKinematicsAudit(world);
const spectrum = world.linearizedMetricSpectrumAudit();
const radiativeGaugeBridge = simplexRadiativeGaugeAudit();

const result = {
  schemaVersion: 1,
  question: 'Can the canonical scalar edge-length variables encode a local symmetric spatial metric without adding fundamental fields?',
  identity: 'G_ij = (d_0i + d_0j - d_ij)/2 for each relational tetrahedron',
  inverseIdentity: 'd_ij = G_ii + G_jj - 2 G_ij',
  canonicalGraph: {
    seed: 42,
    evolutionSteps: 400,
    nodes: world.nodes.length,
    edges: world.links.size,
    triangularFaces: world.faces.size
  },
  kinematics,
  radiativeGaugeBridge,
  existingScalarActionSpectrum: spectrum,
  verdict: {
    tensorKinematicsFromExistingEdgesDerived: kinematics.localSymmetricTensorKinematicsDerived,
    extraFundamentalTensorFieldNeededForKinematics: false,
    edgeDerivedTTModesSolveMasslessFierzPauli: radiativeGaugeBridge.radiativeEdgeToSpinTwoBridgeClosed,
    pureSpatialGaugeDirectionsRemovedByTTProjection:
      radiativeGaugeBridge.pureSpatialGaugeProjectionResidual < 1e-12,
    currentAnchoredActionSuppliesMasslessGaugeDynamics: spectrum.hasMasslessMode,
    microToSpinTwoBridgeComplete: kinematics.spacetimeSpinTwoMatchingComplete,
    nextNecessaryProof: 'Derive the now-identified TT/Fierz-Pauli operator as the collective Hessian and Lorentzian time evolution of the canonical action; the positive anchor still gaps the current static edge action.'
  }
};

fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, canonicalGraph: result.canonicalGraph, verdict: result.verdict }, null, 2));
