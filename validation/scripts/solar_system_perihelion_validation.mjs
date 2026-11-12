import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SubQGGraphCoupledEngine } from '../../src/modules/subqg_graph_coupled_gravity.mjs';
import {
  dualStrainAnomalousAcceleration,
  secularPerihelionPrecession
} from '../../src/modules/subqg_solar_system.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const validationRoot = path.resolve(scriptDir, '..');
const resultPath = path.join(validationRoot, 'results', 'solar_system_perihelion_validation.json');
const sparcResultPath = path.join(validationRoot, 'results', 'sparc_rotation_validation.json');
const AU = 149597870700;
const solarMu = 1.32712440018e20;

// JPL approximate J2000 elements (1800-2050 table) and INPOP10a Table 5.
const planets = [
  { name: 'Mercury', aAu: 0.38709927, e: 0.20563593, inpop: [0.4, 0.6], epm: [-2, 3] },
  { name: 'Venus', aAu: 0.72333566, e: 0.00677672, inpop: [0.2, 1.5], epm: [2.6, 1.6] },
  { name: 'Earth-Moon barycenter', aAu: 1.00000261, e: 0.01671123, inpop: [-0.2, 0.9], epm: [0.19, 0.19] },
  { name: 'Mars', aAu: 1.52371034, e: 0.09339410, inpop: [-0.04, 0.15], epm: [-0.020, 0.037] },
  { name: 'Jupiter', aAu: 5.20288700, e: 0.04838624, inpop: [-41, 42], epm: [58.7, 28.3] },
  { name: 'Saturn', aAu: 9.53667594, e: 0.05386179, inpop: [0.15, 0.65], epm: [-0.32, 0.47] }
];

if (!fs.existsSync(sparcResultPath)) throw new Error('SPARC result missing. Run npm run validation:sparc');
const sparc = JSON.parse(fs.readFileSync(sparcResultPath, 'utf8'));
const frozenA0 = sparc.models.subqgDualStrain.fittedA0MetersPerSecondSquared;
const graphEngine = new SubQGGraphCoupledEngine();

const rows = planets.map(planet => {
  const semiMajorAxis = planet.aAu * AU;
  const dual = secularPerihelionPrecession({
    semiMajorAxis,
    eccentricity: planet.e,
    centralMu: solarMu,
    anomalousInwardAcceleration: gNewton => dualStrainAnomalousAcceleration(gNewton, frozenA0)
  });

  // The minimum Newtonian field occurs at aphelion. The runtime reaches its
  // high-field clamp there; retain the analytic exponential deficit bound so
  // floating-point saturation is not confused with a mathematical identity.
  const aphelion = semiMajorAxis * (1 + planet.e);
  const minimumGNewton = solarMu / aphelion ** 2;
  const microscopicAtMinimumField = graphEngine.predictPhysicalAccelerationFromBaryonic(minimumGNewton);
  const microscopicDeficitBound = graphEngine.boundMicroChannelDeficit(microscopicAtMinimumField.gSubQGDimless);
  const microscopicSaturated = microscopicAtMinimumField.conductivity === 1;
  const microscopicPrediction = microscopicSaturated ? 0 : null;

  return {
    planet: planet.name,
    orbitalElements: { semiMajorAxisAu: planet.aAu, eccentricity: planet.e },
    inpop10a: { supplementaryPerihelionMasPerCentury: planet.inpop[0], oneSigmaMasPerCentury: planet.inpop[1] },
    epm2011: { supplementaryPerihelionMasPerCentury: planet.epm[0], oneSigmaMasPerCentury: planet.epm[1] },
    subqgDualStrain: {
      predictedMasPerCentury: dual.milliarcsecondsPerCentury,
      residualSigmaInpop10a: (dual.milliarcsecondsPerCentury - planet.inpop[0]) / planet.inpop[1],
      residualSigmaEpm2011: (dual.milliarcsecondsPerCentury - planet.epm[0]) / planet.epm[1],
      minAnomalousAccelerationMetersPerSecondSquared: dual.minAnomalousAcceleration,
      maxAnomalousAccelerationMetersPerSecondSquared: dual.maxAnomalousAcceleration
    },
    subqgMicroscopicFlux: {
      minimumGNewtonMetersPerSecondSquared: minimumGNewton,
      conductivityAtMinimumField: microscopicAtMinimumField.conductivity,
      accelerationAtMinimumField: microscopicAtMinimumField.acceleration,
      saturatedAcrossOrbit: microscopicSaturated,
      analyticLog10UpperBoundOnConductivityDeficit: microscopicDeficitBound.log10UpperBound,
      analyticLog10UpperBoundOnConductivityDerivative: microscopicDeficitBound.log10DerivativeUpperBound,
      predictedMasPerCentury: microscopicPrediction,
      residualSigmaInpop10a: microscopicPrediction === null ? null : (microscopicPrediction - planet.inpop[0]) / planet.inpop[1],
      residualSigmaEpm2011: microscopicPrediction === null ? null : (microscopicPrediction - planet.epm[0]) / planet.epm[1]
    }
  };
});

const maxAbsSigma = model => Math.max(...rows.flatMap(row => [
  Math.abs(row[model].residualSigmaInpop10a ?? Infinity),
  Math.abs(row[model].residualSigmaEpm2011 ?? Infinity)
]));
const result = {
  schemaVersion: 1,
  sources: {
    observations: {
      citation: 'Fienga et al. (2011), INPOP10a, Table 5',
      doi: '10.1007/s10569-011-9377-8',
      arxiv: '1108.5546',
      units: 'milliarcseconds per Julian century',
      interpretation: 'Intervals inducing less than 5% degradation of post-fit residuals while refitting planetary initial conditions, solar GM and asteroid densities.'
    },
    independentReplication: {
      citation: 'Pitjeva & Pitjev (2013), EPM2011 additional perihelion precessions, Table 4',
      arxiv: '1306.3043',
      observations: 678000,
      units: 'converted from milliarcseconds per year to milliarcseconds per Julian century'
    },
    orbitalElements: {
      citation: 'JPL Solar System Dynamics, Approximate Positions of the Planets, J2000 elements valid 1800-2050',
      url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html'
    }
  },
  fixedInputs: {
    a0MetersPerSecondSquared: frozenA0,
    a0Origin: 'SPARC training subset; not fitted to Solar-System data',
    solarMuMetersCubedPerSecondSquared: solarMu,
    astronomicalUnitMeters: AU,
    numericalOrbitSamples: 65536
  },
  rows,
  verdict: {
    dualStrainMaxAbsoluteResidualSigma: maxAbsSigma('subqgDualStrain'),
    dualStrainCompatibleWithinFiveSigmaAllPlanets: maxAbsSigma('subqgDualStrain') <= 5,
    microscopicFluxMaxAbsoluteResidualSigma: maxAbsSigma('subqgMicroscopicFlux'),
    microscopicFluxCompatibleWithinFiveSigmaAllPlanets: maxAbsSigma('subqgMicroscopicFlux') <= 5,
    methodologicalConclusion: 'The frozen algebraic dual-strain surrogate is tested separately from the pre-existing microscopic flux law. No Solar-System parameter is fitted.'
  }
};

fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, rows, verdict: result.verdict }, null, 2));
