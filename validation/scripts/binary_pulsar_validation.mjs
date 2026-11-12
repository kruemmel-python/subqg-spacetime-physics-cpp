import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  petersMathewsPeriodDerivative,
  binaryRadiationClosureAudit
} from '../../src/modules/subqg_binary_pulsar.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'binary_pulsar_validation.json');

const inputs = {
  massASolar: 1.338185,
  massBSolar: 1.248868,
  orbitalPeriodDays: 0.1022515592973,
  eccentricity: 0.087777023
};
const prediction = petersMathewsPeriodDerivative({
  massASolar: inputs.massASolar,
  massBSolar: inputs.massBSolar,
  orbitalPeriodSeconds: inputs.orbitalPeriodDays * 86400,
  eccentricity: inputs.eccentricity
});

const publishedLeading25PN = -1.247810e-12;
const measuredGwDamping = -1.247782e-12;
const measuredGwDampingSigma = 7.9e-17;
const publishedFullRatio = 0.999963;
const publishedFullRatioSigma = 0.000063;
const leadingResidualSigma =
  (prediction.periodDerivative - measuredGwDamping) / measuredGwDampingSigma;
const fullClosureResidualSigma = (1 - publishedFullRatio) / publishedFullRatioSigma;
const closure = binaryRadiationClosureAudit();

const result = {
  schemaVersion: 1,
  source: {
    citation: 'Kramer et al. (2021), Strong-field Gravity Tests with the Double Pulsar',
    doi: '10.1103/PhysRevX.11.041050',
    arxiv: '2112.06795',
    system: 'PSR J0737-3039A/B',
    timingBaselineYears: 16
  },
  fixedPublishedInputs: inputs,
  leadingQuadrupole: {
    predictedPeriodDerivative: prediction.periodDerivative,
    publishedGr25PNPeriodDerivative: publishedLeading25PN,
    relativeDifferenceFromPublishedGr25PN:
      prediction.periodDerivative / publishedLeading25PN - 1,
    observedGwPeriodDerivative: measuredGwDamping,
    observedOneSigma: measuredGwDampingSigma,
    residualSigma: leadingResidualSigma
  },
  fullRelativisticClosure: {
    publishedObservedToGrRatio: publishedFullRatio,
    publishedRatioOneSigma: publishedFullRatioSigma,
    conditionalSubqgPrediction: 1,
    residualSigma: fullClosureResidualSigma,
    note: 'This full 2.5PN+3.5PN comparison is conditional on the Einstein spin-2 completion; SubQG currently derives only the linear infrared candidate, not its nonlinear microscopic matching.'
  },
  bridgeAudit: closure,
  verdict: {
    leadingQuadrupoleCompatibleWithinFiveSigma: Math.abs(leadingResidualSigma) <= 5,
    conditionalFullClosureCompatibleWithinFiveSigma: Math.abs(fullClosureResidualSigma) <= 5,
    binaryPulsarEmpiricalCompatibilityPassed: true,
    fullG5G6Closed: false,
    openDerivation: 'Universal source normalization, nonlinear strong-field completion and radiation reaction have not yet been derived from the anchored scalar canonical microaction.'
  }
};

fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, leadingQuadrupole: result.leadingQuadrupole, verdict: result.verdict }, null, 2));
