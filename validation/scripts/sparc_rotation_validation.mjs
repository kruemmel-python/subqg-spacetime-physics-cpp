import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { subqgDualStrainAcceleration } from '../../src/modules/subqg_dual_strain_gravity.mjs';
import { SubQGGraphCoupledEngine } from '../../src/modules/subqg_graph_coupled_gravity.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const validationRoot = path.resolve(scriptDir, '..');
const dataDir = path.join(validationRoot, 'data', 'raw', 'SPARC_Rotmod_LTG');
const resultDir = path.join(validationRoot, 'results');
const resultPath = path.join(resultDir, 'sparc_rotation_validation.json');

const accelerationUnit = 1e6 / 3.085677581491367e19; // (km/s)^2/kpc -> m/s^2
const diskMassToLight = 0.5;
const bulgeMassToLight = 0.7;
const systematicFloorDex = 0.05;

function fnv1a(text) {
  let hash = 0x811c9dc5;
  for (const character of text) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function splitForGalaxy(name) {
  return fnv1a(name) % 5 === 0 ? 'holdout' : 'training';
}

function parseGalaxy(filePath) {
  const name = path.basename(filePath).replace(/_rotmod\.dat$/, '');
  const rows = [];
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const values = trimmed.split(/\s+/).map(Number);
    if (values.length < 8 || values.some(value => !Number.isFinite(value))) continue;
    const [radius, observedVelocity, velocityError, gasVelocity, diskVelocity, bulgeVelocity] = values;
    if (radius <= 0 || observedVelocity <= 0 || velocityError <= 0) continue;

    // SPARC velocity components add in acceleration space. A negative gas
    // contribution retains its sign through V*|V|.
    const baryonicVelocitySquared =
      gasVelocity * Math.abs(gasVelocity) +
      diskMassToLight * diskVelocity * diskVelocity +
      bulgeMassToLight * bulgeVelocity * bulgeVelocity;
    if (baryonicVelocitySquared <= 0) continue;

    const gbar = baryonicVelocitySquared / radius * accelerationUnit;
    const gobs = observedVelocity * observedVelocity / radius * accelerationUnit;
    const statisticalDex = 2 * velocityError / observedVelocity / Math.log(10);
    const sigmaDex = Math.hypot(statisticalDex, systematicFloorDex);
    rows.push({ name, radius, gbar, gobs, sigmaDex });
  }
  return { name, split: splitForGalaxy(name), rows };
}

function empiricalRarPrediction(gbar, a0) {
  return gbar / (1 - Math.exp(-Math.sqrt(gbar / a0)));
}

function newtonPrediction(gbar) {
  return gbar;
}

function residualRows(galaxies, predictor, parameter) {
  return galaxies.flatMap(galaxy => galaxy.rows.map(row => {
    const predicted = predictor(row.gbar, parameter);
    const residualDex = Math.log10(predicted) - Math.log10(row.gobs);
    return { ...row, predicted, residualDex };
  }));
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function metrics(galaxies, predictor, parameter, fittedParameters = 0) {
  const rows = residualRows(galaxies, predictor, parameter);
  const squared = rows.map(row => row.residualDex ** 2);
  const weightedSquared = rows.map(row => (row.residualDex / row.sigmaDex) ** 2);
  const chiSquare = weightedSquared.reduce((sum, value) => sum + value, 0);
  const dof = Math.max(1, rows.length - fittedParameters);
  const byGalaxy = new Map();
  for (const row of rows) {
    if (!byGalaxy.has(row.name)) byGalaxy.set(row.name, []);
    byGalaxy.get(row.name).push(row.residualDex);
  }
  const galaxyBiases = [...byGalaxy.entries()].map(([name, residuals]) => ({
    name,
    medianResidualDex: median(residuals),
    rmsDex: Math.sqrt(residuals.reduce((sum, value) => sum + value * value, 0) / residuals.length),
    points: residuals.length
  })).sort((a, b) => b.rmsDex - a.rmsDex);

  return {
    galaxies: galaxies.length,
    points: rows.length,
    rmsDex: Math.sqrt(squared.reduce((sum, value) => sum + value, 0) / rows.length),
    medianAbsoluteResidualDex: median(rows.map(row => Math.abs(row.residualDex))),
    meanBiasDex: rows.reduce((sum, row) => sum + row.residualDex, 0) / rows.length,
    chiSquare,
    reducedChiSquare: chiSquare / dof,
    fractionWithinOneSigma: rows.filter(row => Math.abs(row.residualDex) <= row.sigmaDex).length / rows.length,
    fractionWithinTwoSigma: rows.filter(row => Math.abs(row.residualDex) <= 2 * row.sigmaDex).length / rows.length,
    worstGalaxies: galaxyBiases.slice(0, 10)
  };
}

function fitA0(galaxies, predictor) {
  let best = null;
  for (let logA0 = -12.5; logA0 <= -8.5 + 1e-12; logA0 += 0.002) {
    const a0 = 10 ** logA0;
    const current = metrics(galaxies, predictor, a0, 1);
    if (!best || current.chiSquare < best.metrics.chiSquare) {
      best = { a0, log10A0: logA0, metrics: current };
    }
  }
  return best;
}

function perGalaxyMse(galaxies, predictor, parameter) {
  const grouped = new Map();
  for (const row of residualRows(galaxies, predictor, parameter)) {
    if (!grouped.has(row.name)) grouped.set(row.name, []);
    grouped.get(row.name).push(row.residualDex ** 2);
  }
  return new Map([...grouped.entries()].map(([name, values]) => [
    name,
    values.reduce((sum, value) => sum + value, 0) / values.length
  ]));
}

function pairedGalaxyBootstrap(galaxies, predictorA, parameterA, predictorB, parameterB, iterations = 20000) {
  const mseA = perGalaxyMse(galaxies, predictorA, parameterA);
  const mseB = perGalaxyMse(galaxies, predictorB, parameterB);
  const names = [...mseA.keys()].filter(name => mseB.has(name)).sort();
  const differences = names.map(name => mseA.get(name) - mseB.get(name));
  const observedMeanMseDifference = differences.reduce((sum, value) => sum + value, 0) / differences.length;
  let seed = 0x5ab9c3e1;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const bootstrap = [];
  for (let iteration = 0; iteration < iterations; iteration++) {
    let sum = 0;
    for (let draw = 0; draw < differences.length; draw++) {
      sum += differences[Math.floor(random() * differences.length)];
    }
    bootstrap.push(sum / differences.length);
  }
  bootstrap.sort((a, b) => a - b);
  const quantile = probability => bootstrap[Math.floor(probability * (bootstrap.length - 1))];
  return {
    unit: 'mean per-galaxy squared log10 residual difference (modelA - modelB)',
    galaxies: names.length,
    iterations,
    observedMeanMseDifference,
    confidenceInterval95: [quantile(0.025), quantile(0.975)],
    probabilityModelABetter: bootstrap.filter(value => value < 0).length / bootstrap.length
  };
}

if (!fs.existsSync(dataDir)) {
  throw new Error('SPARC data missing. Run: npm run validation:fetch:sparc');
}

const galaxyFiles = fs.readdirSync(dataDir)
  .filter(name => name.endsWith('_rotmod.dat'))
  .sort()
  .map(name => path.join(dataDir, name));
const galaxies = galaxyFiles.map(parseGalaxy).filter(galaxy => galaxy.rows.length > 0);
const training = galaxies.filter(galaxy => galaxy.split === 'training');
const holdout = galaxies.filter(galaxy => galaxy.split === 'holdout');

const subqgFit = fitA0(training, subqgDualStrainAcceleration);
const rarFit = fitA0(training, empiricalRarPrediction);
const graphEngine = new SubQGGraphCoupledEngine();
const microscopicFluxPrediction = gbar =>
  graphEngine.predictPhysicalAccelerationFromBaryonic(gbar).acceleration;
const c = 299792458;
const megaparsec = 3.085677581491367e22;

const result = {
  schemaVersion: 1,
  data: {
    source: 'SPARC Rotmod_LTG.zip',
    sha256: '0A80CC90714828CC28B7DD57923576714D209F2490328C087C4A4AD607FAF588',
    totalGalaxies: galaxies.length,
    totalPoints: galaxies.reduce((sum, galaxy) => sum + galaxy.rows.length, 0),
    trainingGalaxies: training.length,
    holdoutGalaxies: holdout.length,
    holdoutNames: holdout.map(galaxy => galaxy.name)
  },
  fixedAssumptions: {
    diskMassToLight,
    bulgeMassToLight,
    systematicFloorDex,
    split: 'FNV-1a(galaxy name) modulo 5; zero is holdout',
    noPerGalaxyFitting: true
  },
  models: {
    newton: {
      parameters: 0,
      training: metrics(training, newtonPrediction, null, 0),
      holdout: metrics(holdout, newtonPrediction, null, 0)
    },
    subqgDualStrain: {
      equation: 'sqrt(gbar^2 + gbar*a0)',
      parameters: 1,
      fittedA0MetersPerSecondSquared: subqgFit.a0,
      impliedHorizonMegaparsecForC2OverA0: c * c / subqgFit.a0 / megaparsec,
      training: subqgFit.metrics,
      holdout: metrics(holdout, subqgDualStrainAcceleration, subqgFit.a0, 0)
    },
    empiricalRarReference: {
      equation: 'gbar/(1-exp(-sqrt(gbar/a0)))',
      parameters: 1,
      fittedA0MetersPerSecondSquared: rarFit.a0,
      training: rarFit.metrics,
      holdout: metrics(holdout, empiricalRarPrediction, rarFit.a0, 0)
    },
    subqgMicroscopicFlux: {
      equation: 'C_SubQG(g)*g = gbar; C_SubQG from variational microchannel occupation',
      fittedCatalogParameters: 0,
      preExistingConstants: {
        threshold: graphEngine.threshold,
        h0KmPerSecMpc: 70.0,
        gRefModel: 0.28
      },
      methodologicalNote: 'a0 = phaseFraction*c*H0 is an existing cosmological bridge ansatz',
      training: metrics(training, microscopicFluxPrediction, null, 0),
      holdout: metrics(holdout, microscopicFluxPrediction, null, 0)
    }
  },
  pairedHoldoutComparisons: {
    subqgMinusNewton: pairedGalaxyBootstrap(
      holdout,
      subqgDualStrainAcceleration,
      subqgFit.a0,
      newtonPrediction,
      null
    ),
    subqgMinusEmpiricalRar: pairedGalaxyBootstrap(
      holdout,
      subqgDualStrainAcceleration,
      subqgFit.a0,
      empiricalRarPrediction,
      rarFit.a0
    ),
    microscopicFluxMinusNewton: pairedGalaxyBootstrap(
      holdout,
      microscopicFluxPrediction,
      null,
      newtonPrediction,
      null
    ),
    microscopicFluxMinusEmpiricalRar: pairedGalaxyBootstrap(
      holdout,
      microscopicFluxPrediction,
      null,
      empiricalRarPrediction,
      rarFit.a0
    )
  },
  interpretation: {
    scope: 'First external galaxy-rotation holdout test only',
    proofOfRealWorldGravity: false,
    caveats: [
      'Distance, inclination and mass-to-light uncertainties are not yet marginalized.',
      'The SPARC sample is not independent of the discovery of the radial-acceleration relation.',
      'Lensing, Solar-System, binary-pulsar, gravitational-wave and cosmological tests remain outstanding.'
    ]
  }
};

fs.mkdirSync(resultDir, { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);

console.log(`SPARC galaxies: ${galaxies.length} (${training.length} train, ${holdout.length} holdout)`);
console.log(`SPARC points: ${result.data.totalPoints}`);
console.log(`SubQG a0: ${subqgFit.a0.toExponential(6)} m/s^2`);
console.log(`SubQG holdout RMS: ${result.models.subqgDualStrain.holdout.rmsDex.toFixed(5)} dex`);
console.log(`RAR holdout RMS: ${result.models.empiricalRarReference.holdout.rmsDex.toFixed(5)} dex`);
console.log(`Microscopic-flux holdout RMS: ${result.models.subqgMicroscopicFlux.holdout.rmsDex.toFixed(5)} dex`);
console.log(`Newton holdout RMS: ${result.models.newton.holdout.rmsDex.toFixed(5)} dex`);
console.log(`Result: ${resultPath}`);
