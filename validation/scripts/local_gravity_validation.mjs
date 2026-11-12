import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SubQGGraphCoupledEngine } from '../../src/modules/subqg_graph_coupled_gravity.mjs';
import {
  combinedIndependentUncertainty,
  standardizedResidual,
  universalFreeFallPrediction
} from '../../src/modules/subqg_local_gravity.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'local_gravity_validation.json');
const engine = new SubQGGraphCoupledEngine();

// Published MICROSCOPE mean orbital frequency and test-mass properties.
const earthMu = 3.986004418e14;
const orbitalFrequencyHz = 0.16818e-3;
const meanMotion = 2 * Math.PI * orbitalFrequencyHz;
const orbitalRadius = Math.cbrt(earthMu / meanMotion ** 2);
const microscopeField = earthMu / orbitalRadius ** 2;
const microscopeMassesKg = [0.401706, 0.300939]; // Pt/Rh and Ti/Al/V, respectively.
const microscopeObservedEta = -1.5e-15;
const microscopeStatSigma = 2.3e-15;
const microscopeSystSigma = 1.5e-15;
const microscopeCombinedSigma = combinedIndependentUncertainty(microscopeStatSigma, microscopeSystSigma);
const freeFall = universalFreeFallPrediction(microscopeField, microscopeMassesKg);
const microscopeFlux = engine.predictPhysicalAccelerationFromBaryonic(microscopeField);
const microscopeDeficitBound = engine.boundMicroChannelDeficit(microscopeFlux.gSubQGDimless);

// IERS mean equatorial gravity is used only to quantify how deeply a
// supported terrestrial experiment lies in the model's saturated regime.
const laboratoryBackground = 9.7803278;
const laboratoryFlux = engine.predictPhysicalAccelerationFromBaryonic(laboratoryBackground);
const laboratoryDeficitBound = engine.boundMicroChannelDeficit(laboratoryFlux.gSubQGDimless);
const inverseSquarePercentLevelCompatible =
  laboratoryDeficitBound.log10UpperBound < -2 &&
  laboratoryDeficitBound.log10DerivativeUpperBound < -2;
const microscopeResidualSigma = standardizedResidual(0, microscopeObservedEta, microscopeCombinedSigma);

const result = {
  schemaVersion: 1,
  theoryPrediction: {
    forceLaw: 'F_metric = objectNorm * fieldGradient; inertialMass = objectNorm',
    acceleration: 'F_metric / inertialMass = fieldGradient',
    eotvosParameter: 0,
    formalTheorem: 'SubQG.universal_free_fall_eotvos_zero',
    theoremScope: 'Any two nonzero packet-density functions in the same nonzero constant metric gradient.'
  },
  microscope: {
    source: {
      citation: 'Touboul et al. (2022), MICROSCOPE mission final results',
      arxiv: '2209.15487',
      compositionPair: 'Ti/Al/V versus Pt/Rh',
      meanOrbitalFrequencyHz: orbitalFrequencyHz
    },
    earthConstantsSource: {
      citation: 'IERS Conventions, Table 1.1 numerical standards',
      url: 'https://iers-conventions.obspm.fr/conventions/content/tn36.pdf'
    },
    fixedInputs: {
      earthMuMetersCubedPerSecondSquared: earthMu,
      testMassesKg: microscopeMassesKg
    },
    derivedEnvironment: {
      orbitalRadiusMeters: orbitalRadius,
      earthFieldMetersPerSecondSquared: microscopeField,
      conductivity: microscopeFlux.conductivity,
      analyticLog10UpperBoundOnConductivityDeficit: microscopeDeficitBound.log10UpperBound,
      analyticLog10UpperBoundOnConductivityDerivative: microscopeDeficitBound.log10DerivativeUpperBound
    },
    observation: {
      eta: microscopeObservedEta,
      statisticalOneSigma: microscopeStatSigma,
      systematicOneSigma: microscopeSystSigma,
      combinedOneSigmaAssumingIndependence: microscopeCombinedSigma
    },
    prediction: {
      eta: freeFall.maxAbsoluteEta,
      standardizedResidual: microscopeResidualSigma
    }
  },
  inverseSquare: {
    source: {
      citation: 'Lee et al. (2020), New Test of the Gravitational 1/r^2 Law at Separations down to 52 micrometers',
      arxiv: '2002.11761',
      separationRangeMeters: [52e-6, 3e-3],
      publishedConclusion: 'Newtonian gravity gives an excellent fit; alpha=1 Yukawa ranges must be below 38.6 micrometers at 95% confidence.'
    },
    terrestrialEnvironment: {
      reference: 'IERS Conventions, mean equatorial gravity',
      backgroundAccelerationMetersPerSecondSquared: laboratoryBackground,
      conductivity: laboratoryFlux.conductivity,
      analyticLog10UpperBoundOnConductivityDeficit: laboratoryDeficitBound.log10UpperBound,
      analyticLog10UpperBoundOnConductivityDerivative: laboratoryDeficitBound.log10DerivativeUpperBound
    },
    prediction: {
      underTotalGradientClosure: 'The microscopic conductivity and its derivative are indistinguishable from unity; incremental laboratory gravity is Newtonian inverse-square.',
      newYukawaTerm: false,
      publishedSensitivityScale: 'percent-level determination of Newtonian gravity at about 50 micrometers',
      compatibilityCriterion: 'both conductivity-deficit and derivative bounds below 1e-2',
      compatibleWithPublishedNullResult: inverseSquarePercentLevelCompatible
    }
  },
  verdict: {
    microscopeCompatibleWithinFiveSigma: Math.abs(microscopeResidualSigma) <= 5,
    inverseSquarePublishedConstraintCompatible: inverseSquarePercentLevelCompatible,
    conditionalLocalGravityGatePassed: Math.abs(microscopeResidualSigma) <= 5 && inverseSquarePercentLevelCompatible,
    fullG4Closed: false,
    openDerivation: 'The canonical packet model proves universality for arbitrary density profiles, but it does not yet derive from Standard-Model microphysics that chemically different Ti and Pt bodies map only to that universal density coupling. A direct nonlinear reconstruction of the Eot-Wash apparatus geometry is also open.'
  }
};

fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, verdict: result.verdict, microscope: result.microscope }, null, 2));
