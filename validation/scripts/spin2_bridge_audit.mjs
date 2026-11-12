import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MicroActionWorld } from '../../src/modules/subqg_microaction.mjs';
import {
  linearizedSpinTwoStaticDustClosure,
  microToSpinTwoBridgeAudit
} from '../../src/modules/subqg_weak_field_metric.mjs';
import { spinTwoInfraredAudit } from '../../src/modules/subqg_spin2_ir.mjs';
import { simplexTensorKinematicsAudit } from '../../src/modules/subqg_simplex_tensor_bridge.mjs';
import { simplexRadiativeGaugeAudit } from '../../src/modules/subqg_simplex_gauge_bridge.mjs';
import { collectiveSpinTwoHessianAudit } from '../../src/modules/subqg_collective_spin2_hessian.mjs';
import {
  canonicalDualHolonomyAudit,
  canonicalSimplexParallelTransportAudit
} from '../../src/modules/subqg_simplex_parallel_transport.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'spin2_bridge_audit.json');

const world = new MicroActionWorld({ seed: 42 });
world.run(400);
const microscopicSpectrum = world.linearizedMetricSpectrumAudit();
const tensorKinematics = simplexTensorKinematicsAudit(world);
const radiativeGaugeBridge = simplexRadiativeGaugeAudit();
const collectiveHessian = collectiveSpinTwoHessianAudit(world);
const parallelTransport = canonicalSimplexParallelTransportAudit(world);
const holonomy = canonicalDualHolonomyAudit(world);
const effectiveSpinTwoSolution = linearizedSpinTwoStaticDustClosure(1e-9);
const bridge = microToSpinTwoBridgeAudit();
const infraredCandidate = spinTwoInfraredAudit();

const result = {
  schemaVersion: 1,
  question: 'Does the canonical SubQG microaction currently derive the massless spin-2 no-slip closure required by strong lensing?',
  exactHessianIdentity: 'v^T H v = anchor*||v||^2 + sum_(i,j) w_ij*(v_i-v_j)^2',
  formalTheorems: {
    massGap: 'SubQG.positive_anchor_excludes_zero_metric_mode',
    spinTwoNoSlip: 'SubQG.linearized_spin_two_static_dust_no_slip',
    gammaOne: 'SubQG.linearized_spin_two_static_dust_gamma_one'
  },
  microscopicSpectrum,
  tensorKinematics,
  radiativeGaugeBridge,
  collectiveHessian,
  parallelTransport,
  holonomy,
  effectiveSpinTwoSolution,
  infraredCandidate,
  bridge,
  verdict: {
    effectiveSpinTwoClosureGivesGammaOne: effectiveSpinTwoSolution.gamma === 1,
    canonicalMicroactionHasMasslessMode: microscopicSpectrum.hasMasslessMode,
    isolatedEdgeVariableIsDirectTensorField: microscopicSpectrum.hasSymmetricTensorStructure,
    collectiveEdgesDeriveLocalSymmetricSpatialTensor: tensorKinematics.localSymmetricTensorKinematicsDerived,
    tensorKinematicsAddsFundamentalDegreesOfFreedom: tensorKinematics.newFundamentalDegreesOfFreedomAdded,
    edgeDerivedRadiativeModesSolveFierzPauli: radiativeGaugeBridge.radiativeEdgeToSpinTwoBridgeClosed,
    orientableManifoldSubcomplexSupportsMasslessTTHessian:
      collectiveHessian.manifoldSupportedMasslessTTSector,
    causalManifoldSelectionIsParameterFree:
      collectiveHessian.causalParameterFreeSelectionImplemented,
    causalSelectionHasExactIncrementalVariationalForm:
      collectiveHessian.selectionRuleHasExactIncrementalVariationalForm,
    finiteLocalPenaltyReproducesEverySelectionDecision:
      collectiveHessian.selectionVariation.everyDecisionMinimizesFinitePenaltyAction,
    implementedFixedTopologyMicroactionNoGoProved:
      collectiveHessian.microscopicSelectionNoGo.noGoProved,
    selectionDerivedFromOriginalContinuousMicroaction:
      collectiveHessian.selectionRuleDerivedFromOriginalContinuousMicroaction,
    localSpinTwoParallelTransportClosed:
      parallelTransport.localFrameTransportClosed && parallelTransport.spinTwoNormPreservingTransportClosed,
    closedLoopHolonomyConnectionDerived: holonomy.holonomyConnectionMathematicallyClosed,
    nontrivialDiscreteCurvatureDetected: holonomy.nontrivialDiscreteCurvatureDetected,
    infraredCandidateSelfConsistent: infraredCandidate.infraredClosureSelfConsistent,
    derivationComplete: bridge.bridgeComplete && microscopicSpectrum.supportsMasslessSpinTwo,
    requiredChange: 'Extend the fixed-topology scalar microaction by microscopically derived occupancy/orientation dynamics and its local positive constraint penalty; then match holonomy to dimensionful curvature and derive universal source coupling.'
  }
};

fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, microscopicSpectrum, verdict: result.verdict }, null, 2));
