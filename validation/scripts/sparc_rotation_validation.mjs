import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { subqgDualStrainAcceleration } from '../../src/modules/subqg_dual_strain_gravity.mjs';
import { SubQGGraphCoupledEngine } from '../../src/modules/subqg_graph_coupled_gravity.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const validationRoot = path.resolve(scriptDir, '..');
const dataDir = path.join(validationRoot, 'data', 'raw', 'SPARC_Rotmod_LTG');
const catalogPath = path.join(validationRoot, 'data', 'raw', 'SPARC_Lelli2016c.mrt');
const resultDir = path.join(validationRoot, 'results');
const resultPath = path.join(resultDir, 'sparc_rotation_validation.json');

const accelerationUnit = 1e6 / 3.085677581491367e19; // (km/s)^2/kpc -> m/s^2
const diskMassToLight = 0.5;
const bulgeMassToLight = 0.7;
const systematicFloorDex = 0.05;
const massToLightPriorDex = 0.1;

function parseCatalog(filePath) {
  const catalog = new Map();
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const fields = line.trim().split(/\s+/);
    if (fields.length < 18) continue;
    const distance = Number(fields[2]);
    const distanceError = Number(fields[3]);
    const inclination = Number(fields[5]);
    const inclinationError = Number(fields[6]);
    const quality = Number(fields[17]);
    if (![distance, distanceError, inclination, inclinationError, quality].every(Number.isFinite)) continue;
    catalog.set(fields[0], { distance, distanceError, inclination, inclinationError, quality });
  }
  return catalog;
}

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

function parseGalaxy(filePath, catalog) {
  const name = path.basename(filePath).replace(/_rotmod\.dat$/, '');
  const metadata = catalog.get(name);
  if (!metadata) throw new Error(`Missing SPARC catalog row for ${name}`);
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
    rows.push({
      name,
      radius,
      observedVelocity,
      velocityError,
      gasVelocity,
      diskVelocity,
      bulgeVelocity,
      gbar,
      gobs,
      sigmaDex
    });
  }
  return { name, split: splitForGalaxy(name), metadata, rows };
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

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function nuisanceState(galaxy, z) {
  const { distance, distanceError, inclination, inclinationError } = galaxy.metadata;
  const hasBulge = galaxy.rows.some(row => row.bulgeVelocity !== 0);
  const distanceAdjusted = Math.max(0.01, distance + z[2] * distanceError);
  const inclinationAdjusted = clamp(inclination + z[3] * inclinationError, 5, 89.5);
  return {
    diskMassToLight: diskMassToLight * 10 ** (massToLightPriorDex * z[0]),
    bulgeMassToLight: bulgeMassToLight * 10 ** (massToLightPriorDex * (hasBulge ? z[1] : 0)),
    distanceAdjusted,
    inclinationAdjusted,
    distanceRatio: distanceAdjusted / distance,
    inclinationVelocityRatio:
      Math.sin(inclination * Math.PI / 180) / Math.sin(inclinationAdjusted * Math.PI / 180),
    hasBulge
  };
}

function profiledGalaxyRows(galaxy, predictor, parameter, z) {
  const state = nuisanceState(galaxy, z);
  return galaxy.rows.map(row => {
    const baryonicVelocitySquared = state.distanceRatio * (
      row.gasVelocity * Math.abs(row.gasVelocity) +
      state.diskMassToLight * row.diskVelocity ** 2 +
      state.bulgeMassToLight * row.bulgeVelocity ** 2
    );
    const adjustedRadius = row.radius * state.distanceRatio;
    const gbar = baryonicVelocitySquared / adjustedRadius * accelerationUnit;
    const adjustedObservedVelocity = row.observedVelocity * state.inclinationVelocityRatio;
    const gobs = adjustedObservedVelocity ** 2 / adjustedRadius * accelerationUnit;
    const predicted = gbar > 0 ? predictor(gbar, parameter) : Number.NaN;
    const residualDex = gbar > 0 ? Math.log10(predicted) - Math.log10(gobs) : 1e6;
    return { ...row, gbar, gobs, predicted, residualDex };
  });
}

function nuisanceObjective(galaxy, predictor, parameter, z, intrinsicScatterDex = 0) {
  const rows = profiledGalaxyRows(galaxy, predictor, parameter, z);
  const dataChiSquare = rows.reduce(
    (sum, row) => sum + (row.residualDex / Math.hypot(row.sigmaDex, intrinsicScatterDex)) ** 2,
    0
  );
  const hasBulge = rows.some(row => row.bulgeVelocity !== 0);
  const priorChiSquare = z[0] ** 2 + (hasBulge ? z[1] ** 2 : 0) + z[2] ** 2 + z[3] ** 2;
  return { objective: dataChiSquare + priorChiSquare, dataChiSquare, priorChiSquare, rows };
}

function profileGalaxy(galaxy, predictor, parameter, intrinsicScatterDex = 0) {
  const dimensions = galaxy.rows.some(row => row.bulgeVelocity !== 0) ? [0, 1, 2, 3] : [0, 2, 3];
  const z = [0, 0, 0, 0];
  let best = nuisanceObjective(galaxy, predictor, parameter, z, intrinsicScatterDex);
  let step = 1;
  for (let iteration = 0; iteration < 40 && step >= 0.015625; iteration++) {
    let improved = false;
    for (const dimension of dimensions) {
      for (const direction of [-1, 1]) {
        const candidate = [...z];
        candidate[dimension] = clamp(candidate[dimension] + direction * step, -5, 5);
        const evaluated = nuisanceObjective(galaxy, predictor, parameter, candidate, intrinsicScatterDex);
        if (evaluated.objective + 1e-10 < best.objective) {
          z.splice(0, z.length, ...candidate);
          best = evaluated;
          improved = true;
        }
      }
    }
    if (!improved) step /= 2;
  }
  const state = nuisanceState(galaxy, z);
  return {
    name: galaxy.name,
    z,
    nuisance: {
      diskMassToLight: state.diskMassToLight,
      bulgeMassToLight: state.bulgeMassToLight,
      distanceMpc: state.distanceAdjusted,
      inclinationDegrees: state.inclinationAdjusted
    },
    ...best
  };
}

function logGamma(value) {
  const coefficients = [
    676.5203681218851, -1259.1392167224028, 771.3234287776531,
    -176.6150291621406, 12.507343278686905, -0.13857109526572012,
    9.984369578019572e-6, 1.5056327351493116e-7
  ];
  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  }
  let z = value - 1;
  let x = 0.9999999999998099;
  for (let index = 0; index < coefficients.length; index++) {
    x += coefficients[index] / (z + index + 1);
  }
  const t = z + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function regularizedGammaQ(shape, value) {
  if (value === 0) return 1;
  const epsilon = 1e-14;
  if (value < shape + 1) {
    let term = 1 / shape;
    let sum = term;
    for (let n = 1; n < 10000; n++) {
      term *= value / (shape + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * epsilon) break;
    }
    const p = sum * Math.exp(-value + shape * Math.log(value) - logGamma(shape));
    return Math.max(0, Math.min(1, 1 - p));
  }
  let b = value + 1 - shape;
  let c = 1 / Number.MIN_VALUE;
  let d = 1 / b;
  let h = d;
  for (let index = 1; index < 10000; index++) {
    const an = -index * (index - shape);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < Number.MIN_VALUE) d = Number.MIN_VALUE;
    c = b + an / c;
    if (Math.abs(c) < Number.MIN_VALUE) c = Number.MIN_VALUE;
    d = 1 / d;
    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < epsilon) break;
  }
  return Math.max(0, Math.min(1,
    Math.exp(-value + shape * Math.log(value) - logGamma(shape)) * h));
}

function profiledMetrics(
  galaxies,
  predictor,
  parameter,
  fittedGlobalParameters = 0,
  intrinsicScatterDex = 0
) {
  const profiles = galaxies.map(
    galaxy => profileGalaxy(galaxy, predictor, parameter, intrinsicScatterDex)
  );
  const rows = profiles.flatMap(profile => profile.rows);
  const dataChiSquare = profiles.reduce((sum, profile) => sum + profile.dataChiSquare, 0);
  const priorChiSquare = profiles.reduce((sum, profile) => sum + profile.priorChiSquare, 0);
  const nuisanceParameters = profiles.reduce(
    (sum, profile) => sum + (profile.rows.some(row => row.bulgeVelocity !== 0) ? 4 : 3),
    0
  );
  const priorConstraints = nuisanceParameters;
  const augmentedDof = Math.max(
    1,
    rows.length + priorConstraints - nuisanceParameters - fittedGlobalParameters
  );
  const augmentedChiSquare = dataChiSquare + priorChiSquare;
  return {
    galaxies: galaxies.length,
    points: rows.length,
    nuisanceParameters,
    priorConstraints,
    dataChiSquare,
    priorChiSquare,
    augmentedChiSquare,
    augmentedDof,
    augmentedReducedChiSquare: (dataChiSquare + priorChiSquare) / augmentedDof,
    goodnessOfFitPValue: regularizedGammaQ(augmentedDof / 2, augmentedChiSquare / 2),
    intrinsicScatterDex,
    rmsDex: Math.sqrt(rows.reduce((sum, row) => sum + row.residualDex ** 2, 0) / rows.length),
    medianAbsoluteResidualDex: median(rows.map(row => Math.abs(row.residualDex))),
    fractionWithinTwoSigma: rows.filter(row => Math.abs(row.residualDex) <= 2 * row.sigmaDex).length / rows.length,
    maximumAbsoluteNuisancePull: Math.max(...profiles.flatMap(profile => profile.z.map(Math.abs))),
    profiles: profiles.map(profile => ({
      name: profile.name,
      z: profile.z,
      nuisance: profile.nuisance,
      dataChiSquare: profile.dataChiSquare,
      priorChiSquare: profile.priorChiSquare
    }))
  };
}

function calibrateIntrinsicScatter(galaxies, predictor, parameter, fittedGlobalParameters) {
  let left = 0;
  let right = 0.25;
  let best = null;
  for (let iteration = 0; iteration < 8; iteration++) {
    const intrinsicScatterDex = (left + right) / 2;
    const metrics = profiledMetrics(
      galaxies,
      predictor,
      parameter,
      fittedGlobalParameters,
      intrinsicScatterDex
    );
    best = { intrinsicScatterDex, metrics };
    if (metrics.augmentedReducedChiSquare > 1) left = intrinsicScatterDex;
    else right = intrinsicScatterDex;
  }
  return best;
}

function fitProfiledA0(galaxies, predictor, initialLogA0, intrinsicScatterDex = 0) {
  const cache = new Map();
  const evaluate = logA0 => {
    const key = logA0.toFixed(12);
    if (!cache.has(key)) {
      const a0 = 10 ** logA0;
      cache.set(key, {
        logA0,
        a0,
        metrics: profiledMetrics(galaxies, predictor, a0, 1, intrinsicScatterDex)
      });
    }
    return cache.get(key);
  };
  let left = initialLogA0 - 0.7;
  let right = initialLogA0 + 0.7;
  const ratio = (Math.sqrt(5) - 1) / 2;
  let x1 = right - ratio * (right - left);
  let x2 = left + ratio * (right - left);
  let f1 = evaluate(x1);
  let f2 = evaluate(x2);
  for (let iteration = 0; iteration < 14; iteration++) {
    if (f1.metrics.augmentedChiSquare < f2.metrics.augmentedChiSquare) {
      right = x2;
      x2 = x1;
      f2 = f1;
      x1 = right - ratio * (right - left);
      f1 = evaluate(x1);
    } else {
      left = x1;
      x1 = x2;
      f1 = f2;
      x2 = left + ratio * (right - left);
      f2 = evaluate(x2);
    }
  }
  return [...cache.values()].sort(
    (a, b) => a.metrics.augmentedChiSquare - b.metrics.augmentedChiSquare
  )[0];
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

if (!fs.existsSync(dataDir) || !fs.existsSync(catalogPath)) {
  throw new Error('SPARC data missing. Run: npm run validation:fetch:sparc');
}

const catalog = parseCatalog(catalogPath);
if (catalog.size !== 175) throw new Error(`Expected 175 SPARC catalog rows, found ${catalog.size}`);
const galaxyFiles = fs.readdirSync(dataDir)
  .filter(name => name.endsWith('_rotmod.dat'))
  .sort()
  .map(name => path.join(dataDir, name));
const galaxies = galaxyFiles.map(filePath => parseGalaxy(filePath, catalog))
  .filter(galaxy => galaxy.rows.length > 0);
const training = galaxies.filter(galaxy => galaxy.split === 'training');
const holdout = galaxies.filter(galaxy => galaxy.split === 'holdout');

const subqgFit = fitA0(training, subqgDualStrainAcceleration);
const rarFit = fitA0(training, empiricalRarPrediction);
const graphEngine = new SubQGGraphCoupledEngine();
const microscopicFluxPrediction = gbar =>
  graphEngine.predictPhysicalAccelerationFromBaryonic(gbar).acceleration;
const c = 299792458;
const megaparsec = 3.085677581491367e22;
const subqgInitialProfiledFit = fitProfiledA0(
  training,
  subqgDualStrainAcceleration,
  subqgFit.log10A0
);
const subqgInitialScatter = calibrateIntrinsicScatter(
  training,
  subqgDualStrainAcceleration,
  subqgInitialProfiledFit.a0,
  2
);
const subqgProfiledFit = fitProfiledA0(
  training,
  subqgDualStrainAcceleration,
  subqgInitialProfiledFit.logA0,
  subqgInitialScatter.intrinsicScatterDex
);
const subqgScatter = calibrateIntrinsicScatter(
  training,
  subqgDualStrainAcceleration,
  subqgProfiledFit.a0,
  2
);
const rarInitialProfiledFit = fitProfiledA0(
  training,
  empiricalRarPrediction,
  rarFit.log10A0
);
const rarInitialScatter = calibrateIntrinsicScatter(
  training,
  empiricalRarPrediction,
  rarInitialProfiledFit.a0,
  2
);
const rarProfiledFit = fitProfiledA0(
  training,
  empiricalRarPrediction,
  rarInitialProfiledFit.logA0,
  rarInitialScatter.intrinsicScatterDex
);
const rarScatter = calibrateIntrinsicScatter(
  training,
  empiricalRarPrediction,
  rarProfiledFit.a0,
  2
);
const newtonScatter = calibrateIntrinsicScatter(training, newtonPrediction, null, 1);
const hierarchicalNuisanceProfile = {
  method: {
    likelihood: 'Gaussian residuals in log10 acceleration with a 0.05 dex measurement floor and a training-calibrated intrinsic-scatter term frozen before holdout evaluation',
    distancePrior: 'Gaussian SPARC D +/- e_D',
    inclinationPrior: 'Gaussian SPARC Inc +/- e_Inc',
    massToLightPriors: 'lognormal: disk 0.5 and bulge 0.7, both sigma=0.1 dex',
    transformations: 'R\u2032=R D\u2032/D; Vk\u2032=Vk sqrt(D\u2032/D); Vobs\u2032=Vobs sin(i)/sin(i\u2032)',
    split: 'The galaxy holdout remains untouched by the global a0 fit; nuisance priors are external measurements.',
    fairness: 'The identical nuisance likelihood and priors are applied to SubQG dual strain, RAR and Newton.'
  },
  subqgDualStrain: {
    fittedA0MetersPerSecondSquared: subqgProfiledFit.a0,
    fittedIntrinsicScatterDex: subqgScatter.intrinsicScatterDex,
    training: subqgScatter.metrics,
    holdout: profiledMetrics(
      holdout,
      subqgDualStrainAcceleration,
      subqgProfiledFit.a0,
      0,
      subqgScatter.intrinsicScatterDex
    )
  },
  empiricalRarReference: {
    fittedA0MetersPerSecondSquared: rarProfiledFit.a0,
    fittedIntrinsicScatterDex: rarScatter.intrinsicScatterDex,
    training: rarScatter.metrics,
    holdout: profiledMetrics(
      holdout,
      empiricalRarPrediction,
      rarProfiledFit.a0,
      0,
      rarScatter.intrinsicScatterDex
    )
  },
  newton: {
    fittedIntrinsicScatterDex: newtonScatter.intrinsicScatterDex,
    training: newtonScatter.metrics,
    holdout: profiledMetrics(holdout, newtonPrediction, null, 0, newtonScatter.intrinsicScatterDex)
  }
};
hierarchicalNuisanceProfile.verdict = {
  criterion: 'frozen holdout augmented chi-square p >= 0.05',
  subqgAbsoluteHoldoutPassed:
    hierarchicalNuisanceProfile.subqgDualStrain.holdout.goodnessOfFitPValue >= 0.05,
  newtonAbsoluteHoldoutRejected:
    hierarchicalNuisanceProfile.newton.holdout.goodnessOfFitPValue < 0.05,
  subqgCompetitiveWithEmpiricalRar:
    Math.abs(
      hierarchicalNuisanceProfile.subqgDualStrain.holdout.rmsDex -
      hierarchicalNuisanceProfile.empiricalRarReference.holdout.rmsDex
    ) < 0.01,
  gateG2Passed: false
};
hierarchicalNuisanceProfile.verdict.gateG2Passed =
  hierarchicalNuisanceProfile.verdict.subqgAbsoluteHoldoutPassed &&
  hierarchicalNuisanceProfile.verdict.newtonAbsoluteHoldoutRejected &&
  hierarchicalNuisanceProfile.verdict.subqgCompetitiveWithEmpiricalRar;

const result = {
  schemaVersion: 1,
  data: {
    source: 'SPARC Rotmod_LTG.zip',
    sha256: '0A80CC90714828CC28B7DD57923576714D209F2490328C087C4A4AD607FAF588',
    catalogSource: 'SPARC_Lelli2016c.mrt (Zenodo archival DOI 10.5281/zenodo.16284118)',
    catalogSha256: '5AA0501F6B0D881FA579030E315E7B5B6EF561A5BD3A07472F9929C7E5728243',
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
  hierarchicalNuisanceProfile,
  interpretation: {
    scope: 'External galaxy-rotation holdout with a symmetric hierarchical nuisance profile',
    proofOfRealWorldGravity: false,
    caveats: [
      'The reported nuisance calculation is a maximum-posterior profile, not a full posterior integral.',
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
console.log(`Profiled SubQG holdout augmented reduced chi-square: ${hierarchicalNuisanceProfile.subqgDualStrain.holdout.augmentedReducedChiSquare.toFixed(5)}`);
console.log(`Profiled RAR holdout augmented reduced chi-square: ${hierarchicalNuisanceProfile.empiricalRarReference.holdout.augmentedReducedChiSquare.toFixed(5)}`);
console.log(`Result: ${resultPath}`);
