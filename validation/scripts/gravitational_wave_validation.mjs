import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { directGravitationalWaveAudit } from '../../src/modules/subqg_gw_observations.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'gravitational_wave_validation.json');
const audit = directGravitationalWaveAudit();

const result = {
  schemaVersion: 1,
  fixedSubqgInfraredPrediction: audit.prediction,
  observations: {
    propagationSpeed: {
      source: 'Abbott et al. (2017), Gravitational Waves and Gamma-Rays from a Binary Neutron Star Merger: GW170817 and GRB 170817A',
      arxiv: '1710.05834',
      observedArrivalDelaySeconds: 1.74,
      observedArrivalDelayOneSigmaSeconds: 0.05,
      fractionalSpeedDifferenceInterval: [audit.speedConstraint.lower, audit.speedConstraint.upper],
      prediction: audit.prediction.fractionalSpeedDifferenceFromLight,
      compatible: audit.speedConstraint.compatible
    },
    dispersion: {
      gwtc3: {
        source: 'LIGO-Virgo-KAGRA (2021), Tests of General Relativity with GWTC-3',
        arxiv: '2112.06861',
        credibility: 0.9,
        gravitonMassUpperEvPerC2: audit.dispersionConstraints.gwtc3.upperEvPerC2,
        prediction: audit.prediction.gravitonMassEvPerC2,
        compatible: audit.dispersionConstraints.gwtc3.compatible
      },
      gwtc4: {
        source: 'LIGO-Virgo-KAGRA (2026), Tests of General Relativity with GWTC-4.0',
        arxiv: '2603.19020',
        credibility: 0.9,
        gravitonMassUpperEvPerC2: audit.dispersionConstraints.gwtc4.upperEvPerC2,
        prediction: audit.prediction.gravitonMassEvPerC2,
        compatible: audit.dispersionConstraints.gwtc4.compatible
      }
    },
    polarization: {
      gw170814: {
        source: 'Abbott et al. (2017), A Three-Detector Observation of Gravitational Waves from a Binary Black Hole Coalescence',
        doi: '10.1103/PhysRevLett.119.141101',
        tensorVsVectorBayesFactorLower: audit.polarizationConstraints.gw170814TensorVsVectorBayesFactorLower,
        tensorVsScalarBayesFactorLower: audit.polarizationConstraints.gw170814TensorVsScalarBayesFactorLower,
        scope: 'Comparison of pure tensor, pure vector and pure scalar hypotheses; not a bound on every small mixed-polarization admixture.'
      },
      gwtc4: {
        source: 'LIGO-Virgo-KAGRA (2026), GWTC-4.0 tests overview',
        arxiv: '2603.19019',
        confidentEvents: 91,
        nonTensorEvidenceFound: audit.polarizationConstraints.gwtc4NonTensorEvidence
      },
      predictedModes: audit.prediction.polarizationModes,
      compatible: audit.polarizationConstraints.compatible
    }
  },
  verdict: {
    speedCompatible: audit.speedConstraint.compatible,
    dispersionCompatible: audit.dispersionConstraints.gwtc3.compatible && audit.dispersionConstraints.gwtc4.compatible,
    polarizationCompatible: audit.polarizationConstraints.compatible,
    directG6ObservablesPassed: audit.allDirectObservablesCompatible,
    fullG6Closed: audit.fullMicroscopicDerivationClosed,
    openDerivation: 'The normalized massless spin-2 source sector has not yet been derived from the anchored scalar canonical SubQG microaction.'
  }
};

fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, verdict: result.verdict }, null, 2));
