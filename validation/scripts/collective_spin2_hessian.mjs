import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MicroActionWorld } from '../../src/modules/subqg_microaction.mjs';
import { collectiveSpinTwoHessianAudit } from '../../src/modules/subqg_collective_spin2_hessian.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'collective_spin2_hessian.json');
const world = new MicroActionWorld({ seed: 42 });
world.run(400);
const audit = collectiveSpinTwoHessianAudit(world);
const result = {
  schemaVersion: 1,
  canonicalGraph: { seed: 42, evolutionSteps: 400, nodes: world.nodes.length, edges: world.links.size },
  ...audit,
  verdict: {
    fullCliqueComplexAdmissibleAsSpatialManifold: audit.fullComplex.fullCliqueComplexIsFaceManifold,
    orientableManifoldSubcomplexExists: audit.selectedManifold.orientable,
    constrainedTTHessianMassless: audit.twoIndependentMasslessUniformModes === 2,
    constrainedTTHessianPositiveSemidefinite: audit.hessianPositiveSemidefiniteOnProbe,
    fullCanonicalDerivationClosed: audit.fullCanonicalHessianMatchingClosed,
    nextNecessaryProof:
      'Derive the manifold-subcomplex selection and parallel transport from the canonical dynamics rather than the deterministic extraction audit.'
  }
};
fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, selectedManifold: result.selectedManifold, verdict: result.verdict }, null, 2));
