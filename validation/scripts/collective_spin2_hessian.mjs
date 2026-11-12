import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MicroActionWorld } from '../../src/modules/subqg_microaction.mjs';
import { collectiveSpinTwoHessianAudit } from '../../src/modules/subqg_collective_spin2_hessian.mjs';
import {
  canonicalDualHolonomyAudit,
  canonicalSimplexParallelTransportAudit
} from '../../src/modules/subqg_simplex_parallel_transport.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'collective_spin2_hessian.json');
const world = new MicroActionWorld({ seed: 42 });
world.run(400);
const audit = collectiveSpinTwoHessianAudit(world);
const parallelTransport = canonicalSimplexParallelTransportAudit(world);
const holonomy = canonicalDualHolonomyAudit(world);
const result = {
  schemaVersion: 1,
  canonicalGraph: { seed: 42, evolutionSteps: 400, nodes: world.nodes.length, edges: world.links.size },
  ...audit,
  parallelTransport,
  holonomy,
  verdict: {
    fullCliqueComplexAdmissibleAsSpatialManifold: audit.fullComplex.fullCliqueComplexIsFaceManifold,
    orientableManifoldSubcomplexExists: audit.selectedManifold.orientable,
    constrainedTTHessianMassless: audit.twoIndependentMasslessUniformModes === 2,
    constrainedTTHessianPositiveSemidefinite: audit.hessianPositiveSemidefiniteOnProbe,
    causalSelectionHasExactIncrementalVariationalForm:
      audit.selectionRuleHasExactIncrementalVariationalForm,
    selectionDerivedFromOriginalContinuousMicroaction:
      audit.selectionRuleDerivedFromOriginalContinuousMicroaction,
    localFrameTransportClosed: parallelTransport.localFrameTransportClosed,
    spinTwoNormPreservingTransportClosed: parallelTransport.spinTwoNormPreservingTransportClosed,
    closedLoopHolonomyConnectionDerived: holonomy.holonomyConnectionMathematicallyClosed,
    nontrivialDiscreteCurvatureDetected: holonomy.nontrivialDiscreteCurvatureDetected,
    einsteinReggeCurvatureMatchingDerived: holonomy.einsteinReggeCurvatureMatchingDerived,
    fullCanonicalDerivationClosed: audit.fullCanonicalHessianMatchingClosed,
    nextNecessaryProof:
      'Derive the exact incremental admissibility action from the original continuous microaction and match dimensionless loop holonomies to Regge/Einstein curvature with a physical length scale.'
  }
};
fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, selectedManifold: result.selectedManifold, verdict: result.verdict }, null, 2));
