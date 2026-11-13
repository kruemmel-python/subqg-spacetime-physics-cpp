import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { subqgDualStrainAcceleration } from '../../src/modules/subqg_dual_strain_gravity.mjs';
import { SubQGGraphCoupledEngine } from '../../src/modules/subqg_graph_coupled_gravity.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const validationRoot = path.resolve(scriptDir, '..');
const rawDir = path.join(validationRoot, 'data', 'raw');
const resultDir = path.join(validationRoot, 'results');
const sparcResultPath = path.join(resultDir, 'sparc_rotation_validation.json');
const resultPath = path.join(resultDir, 'little_things_validation.json');
const totalPath = path.join(rawDir, 'LITTLE_THINGS_rotdmbar.tsv');
const darkMatterPath = path.join(rawDir, 'LITTLE_THINGS_rotdm.tsv');

const accelerationUnit = 1e6 / 3.085677581491367e19;
const systematicFloorDex = 0.05;
const baryonicModelFloorDex = 0.10;
const radiusMatchToleranceKpc = 1e-4;

function parseVizieR(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing ${filePath}. Run: npm run validation:fetch:little-things`);
  }
  const lines = fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(line => line && !line.startsWith('#'));
  const header = lines[0].split('\t').map(value => value.trim());
  const expected = ['recno', 'Name', 'Type', 'R0.3', 'V0.3', 'R', 'V', 'e_V'];
  if (header.join('\t') !== expected.join('\t')) throw new Error(`Unexpected schema in ${filePath}`);
  return lines.slice(3).map(line => {
    const fields = line.split('\t').map(value => value.trim());
    const [recno, name, type, r03, v03, radiusScaled, velocityScaled, errorScaled] = fields;
    const radius = Number(r03) * Number(radiusScaled);
    const velocity = Number(v03) * Number(velocityScaled);
    const velocityError = Number(v03) * Number(errorScaled);
    return { recno: Number(recno), name, type, radius, velocity, velocityError };
  }).filter(row => row.type === 'Data' && row.radius > 0 && row.velocity > 0);
}

function reconstructGalaxies(totalRows, darkMatterRows) {
  const darkByGalaxy = new Map();
  for (const row of darkMatterRows) {
    if (!darkByGalaxy.has(row.name)) darkByGalaxy.set(row.name, []);
    darkByGalaxy.get(row.name).push({ ...row, used: false });
  }

  const stats = { matched: 0, nonPositiveBaryonic: 0, unmatchedTotal: 0 };
  const rowsByGalaxy = new Map();
  for (const total of totalRows) {
    const candidates = (darkByGalaxy.get(total.name) ?? [])
      .filter(row => !row.used)
      .map(row => ({ row, delta: Math.abs(row.radius - total.radius) }))
      .sort((a, b) => a.delta - b.delta);
    const match = candidates[0];
    if (!match || match.delta > radiusMatchToleranceKpc) {
      stats.unmatchedTotal += 1;
      continue;
    }
    match.row.used = true;
    stats.matched += 1;
    const baryonicVelocitySquared = total.velocity ** 2 - match.row.velocity ** 2;
    if (baryonicVelocitySquared <= 0) {
      stats.nonPositiveBaryonic += 1;
      continue;
    }
    const gbar = baryonicVelocitySquared / total.radius * accelerationUnit;
    const gobs = total.velocity ** 2 / total.radius * accelerationUnit;
    const statisticalDex = 2 * total.velocityError / total.velocity / Math.log(10);
    const sigmaDex = Math.hypot(statisticalDex, systematicFloorDex, baryonicModelFloorDex);
    const row = { name: total.name, radius: total.radius, gbar, gobs, sigmaDex };
    if (!rowsByGalaxy.has(total.name)) rowsByGalaxy.set(total.name, []);
    rowsByGalaxy.get(total.name).push(row);
  }
  stats.unmatchedDarkMatter = [...darkByGalaxy.values()].flat().filter(row => !row.used).length;
  return {
    galaxies: [...rowsByGalaxy.entries()].map(([name, rows]) => ({ name, rows })).sort((a, b) => a.name.localeCompare(b.name)),
    stats
  };
}

const newtonPrediction = gbar => gbar;
const empiricalRarPrediction = (gbar, a0) => gbar / (1 - Math.exp(-Math.sqrt(gbar / a0)));

function residualRows(galaxies, predictor, parameter) {
  return galaxies.flatMap(galaxy => galaxy.rows.map(row => {
    const predicted = predictor(row.gbar, parameter);
    return { ...row, residualDex: Math.log10(predicted) - Math.log10(row.gobs) };
  }));
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function metrics(galaxies, predictor, parameter) {
  const rows = residualRows(galaxies, predictor, parameter);
  const chiSquare = rows.reduce((sum, row) => sum + (row.residualDex / row.sigmaDex) ** 2, 0);
  const byGalaxy = new Map();
  for (const row of rows) {
    if (!byGalaxy.has(row.name)) byGalaxy.set(row.name, []);
    byGalaxy.get(row.name).push(row.residualDex);
  }
  const galaxyResiduals = [...byGalaxy.entries()].map(([name, residuals]) => ({
    name,
    points: residuals.length,
    rmsDex: Math.sqrt(residuals.reduce((sum, value) => sum + value ** 2, 0) / residuals.length),
    medianResidualDex: median(residuals)
  })).sort((a, b) => b.rmsDex - a.rmsDex);
  return {
    galaxies: galaxies.length,
    points: rows.length,
    rmsDex: Math.sqrt(rows.reduce((sum, row) => sum + row.residualDex ** 2, 0) / rows.length),
    medianAbsoluteResidualDex: median(rows.map(row => Math.abs(row.residualDex))),
    meanBiasDex: rows.reduce((sum, row) => sum + row.residualDex, 0) / rows.length,
    chiSquare,
    reducedChiSquare: chiSquare / rows.length,
    fractionWithinOneSigma: rows.filter(row => Math.abs(row.residualDex) <= row.sigmaDex).length / rows.length,
    fractionWithinTwoSigma: rows.filter(row => Math.abs(row.residualDex) <= 2 * row.sigmaDex).length / rows.length,
    worstGalaxies: galaxyResiduals.slice(0, 10)
  };
}

function perGalaxyMse(galaxies, predictor, parameter) {
  const grouped = new Map();
  for (const row of residualRows(galaxies, predictor, parameter)) {
    if (!grouped.has(row.name)) grouped.set(row.name, []);
    grouped.get(row.name).push(row.residualDex ** 2);
  }
  return new Map([...grouped].map(([name, values]) => [name, values.reduce((a, b) => a + b, 0) / values.length]));
}

function pairedGalaxyBootstrap(galaxies, predictorA, parameterA, predictorB, parameterB, iterations = 20000) {
  const mseA = perGalaxyMse(galaxies, predictorA, parameterA);
  const mseB = perGalaxyMse(galaxies, predictorB, parameterB);
  const differences = [...mseA.keys()].sort().map(name => mseA.get(name) - mseB.get(name));
  const observed = differences.reduce((a, b) => a + b, 0) / differences.length;
  let seed = 0x17f2a9c3;
  const random = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const bootstrap = [];
  for (let iteration = 0; iteration < iterations; iteration++) {
    let sum = 0;
    for (let draw = 0; draw < differences.length; draw++) sum += differences[Math.floor(random() * differences.length)];
    bootstrap.push(sum / differences.length);
  }
  bootstrap.sort((a, b) => a - b);
  const quantile = p => bootstrap[Math.floor(p * (bootstrap.length - 1))];
  return {
    unit: 'mean per-galaxy squared log10 residual difference (modelA - modelB)',
    galaxies: differences.length,
    iterations,
    observedMeanMseDifference: observed,
    confidenceInterval95: [quantile(0.025), quantile(0.975)],
    probabilityModelABetter: bootstrap.filter(value => value < 0).length / bootstrap.length
  };
}

if (!fs.existsSync(sparcResultPath)) throw new Error('SPARC result missing. Run: npm run validation:sparc');
const sparc = JSON.parse(fs.readFileSync(sparcResultPath, 'utf8'));
const frozenSubqgA0 =
  sparc.hierarchicalNuisanceProfile.subqgDualStrain.fittedA0MetersPerSecondSquared;
const frozenRarA0 =
  sparc.hierarchicalNuisanceProfile.empiricalRarReference.fittedA0MetersPerSecondSquared;
const totalRows = parseVizieR(totalPath);
const darkMatterRows = parseVizieR(darkMatterPath);
const { galaxies, stats } = reconstructGalaxies(totalRows, darkMatterRows);
if (galaxies.length === 0) throw new Error('No matched, physical LITTLE THINGS rows');

const graphEngine = new SubQGGraphCoupledEngine();
const microscopicFluxPrediction = gbar => graphEngine.predictPhysicalAccelerationFromBaryonic(gbar).acceleration;
const result = {
  schemaVersion: 1,
  data: {
    source: 'VizieR J/AJ/149/180 (Oh et al. 2015), rotdmbar and rotdm tables',
    semanticSha256: {
      rotdmbar: '50DC8DBA05E819F2744A5E9F9240C4B112DB686068653B1CC7D1CD7B350C18CE',
      rotdm: '3C6604FA8CB75CDD3B7465A7BDAE6BB6042D187EE64DAC062CCE1A8CBBBC9702'
    },
    totalDataRows: totalRows.length,
    darkMatterDataRows: darkMatterRows.length,
    matchedRows: stats.matched,
    retainedPhysicalRows: galaxies.reduce((sum, galaxy) => sum + galaxy.rows.length, 0),
    retainedGalaxies: galaxies.length,
    galaxyNames: galaxies.map(galaxy => galaxy.name),
    excluded: {
      nonPositiveReconstructedBaryonicVelocitySquared: stats.nonPositiveBaryonic,
      unmatchedTotalRows: stats.unmatchedTotal,
      unmatchedDarkMatterRows: stats.unmatchedDarkMatter
    }
  },
  protocol: {
    independentSurvey: true,
    fittedOnLittleThings: false,
    frozenFrom: 'SPARC training subset in sparc_rotation_validation.json',
    baryonicReconstruction: 'Vbar^2 = Vtotal^2 - Vdm^2 at matched physical radius',
    radiusMatchToleranceKpc,
    systematicFloorDex,
    baryonicModelFloorDex,
    caveat: 'The published DM-only curve is itself obtained by subtracting the authors baryonic mass model; reconstructed gbar is therefore model-correlated and its full covariance is unavailable in this table.'
  },
  models: {
    newton: { parametersFittedHere: 0, metrics: metrics(galaxies, newtonPrediction, null) },
    subqgDualStrain: {
      equation: 'sqrt(gbar^2 + gbar*a0)',
      parametersFittedHere: 0,
      frozenA0MetersPerSecondSquared: frozenSubqgA0,
      metrics: metrics(galaxies, subqgDualStrainAcceleration, frozenSubqgA0)
    },
    empiricalRarReference: {
      equation: 'gbar/(1-exp(-sqrt(gbar/a0)))',
      parametersFittedHere: 0,
      frozenA0MetersPerSecondSquared: frozenRarA0,
      metrics: metrics(galaxies, empiricalRarPrediction, frozenRarA0)
    },
    subqgMicroscopicFlux: {
      equation: 'C_SubQG(g)*g = gbar; C_SubQG from variational microchannel occupation',
      parametersFittedHere: 0,
      preExistingConstants: { threshold: graphEngine.threshold, h0KmPerSecMpc: 70, gRefModel: 0.28 },
      metrics: metrics(galaxies, microscopicFluxPrediction, null)
    }
  },
  pairedComparisons: {
    subqgDualStrainMinusNewton: pairedGalaxyBootstrap(galaxies, subqgDualStrainAcceleration, frozenSubqgA0, newtonPrediction, null),
    subqgDualStrainMinusEmpiricalRar: pairedGalaxyBootstrap(galaxies, subqgDualStrainAcceleration, frozenSubqgA0, empiricalRarPrediction, frozenRarA0),
    microscopicFluxMinusNewton: pairedGalaxyBootstrap(galaxies, microscopicFluxPrediction, null, newtonPrediction, null),
    microscopicFluxMinusEmpiricalRar: pairedGalaxyBootstrap(galaxies, microscopicFluxPrediction, null, empiricalRarPrediction, frozenRarA0)
  }
};

fs.mkdirSync(resultDir, { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, data: result.data, models: Object.fromEntries(Object.entries(result.models).map(([name, model]) => [name, model.metrics])) }, null, 2));
