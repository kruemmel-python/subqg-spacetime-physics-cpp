import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  einsteinRadiusRelativeToGammaOne,
  lensingStrengthRelativeToGammaOne,
  singleMetricNoSlipClosure
} from '../../src/modules/subqg_weak_field_metric.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'lensing_ppn_validation.json');

// Cao et al. (2017), ApJ 835, 92: 80 observed galaxy-scale strong lenses.
// These are published posterior summaries, not a re-fit of unavailable image
// pixels. Future raw-catalog validation must supersede this aggregate gate.
const observed = Object.freeze({
  gamma: 0.995,
  lower68: 0.047,
  upper68: 0.037,
  systematicEnvelope68: [0.845, 1.240],
  lenses: 80
});

function evaluate(name, gamma, derivationStatus) {
  const sigma = gamma >= observed.gamma ? observed.upper68 : observed.lower68;
  const zAsymmetricGaussian = (gamma - observed.gamma) / sigma;
  return {
    name,
    gamma,
    derivationStatus,
    lensingStrengthRelativeToGammaOne: lensingStrengthRelativeToGammaOne(gamma),
    einsteinRadiusRelativeToGammaOne: einsteinRadiusRelativeToGammaOne(gamma),
    zAsymmetricGaussian,
    insidePublished68StatisticalInterval:
      gamma >= observed.gamma - observed.lower68 && gamma <= observed.gamma + observed.upper68,
    insidePublishedSystematicEnvelope:
      gamma >= observed.systematicEnvelope68[0] && gamma <= observed.systematicEnvelope68[1]
  };
}

const closure = singleMetricNoSlipClosure();
const candidates = {
  subqgSingleMetricNoSlip: evaluate('SubQG single-metric/no-slip candidate', closure.gamma, closure.status),
  flatSpatialNewtonian: evaluate('time-potential with flat spatial metric', 0, 'comparison'),
  conformalNoLensing: evaluate('gamma=-1 no-lensing limit', -1, 'comparison')
};

const result = {
  schemaVersion: 1,
  source: {
    title: 'Test of parametrized post-Newtonian gravity with galaxy-scale strong lensing systems',
    authors: 'Cao et al.',
    year: 2017,
    doi: '10.3847/1538-4357/835/1/92',
    arxiv: '1701.00357',
    sample: '80 mass-selected observed lenses from SLACS, BELLS, LSD and SL2S'
  },
  publishedConstraint: {
    ...observed,
    confidence: '68% statistical interval for fixed fiducial lens-structure parameters',
    systematicWarning: 'Authors report approximately 25% systematics from density slope, anisotropy and light profile.'
  },
  weakFieldRelation: {
    metric: 'ds^2 = -(1-2U/c^2)c^2dt^2 + (1+2*gamma*U/c^2)dl^2',
    einsteinRadiusScaling: 'theta_E(gamma)/theta_E(gamma=1) = sqrt((1+gamma)/2)'
  },
  closure,
  candidates,
  conclusion: {
    observationalCompatibilityOfNoSlipCandidate: candidates.subqgSingleMetricNoSlip.insidePublished68StatisticalInterval,
    rejectsFlatSpatialMetricAtAbsoluteZGreaterThan20: Math.abs(candidates.flatSpatialNewtonian.zAsymmetricGaussian) > 20,
    evidenceGatePassed: false,
    reason: 'gamma=1 is empirically compatible but is still a conditional no-slip closure, not yet derived from the canonical SubQG microaction.'
  }
};

fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, candidates, conclusion: result.conclusion }, null, 2));
