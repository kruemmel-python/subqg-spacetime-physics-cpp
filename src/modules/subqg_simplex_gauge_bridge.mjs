import {
  tetrahedronGramFromSquaredLengths,
  squaredLengthPerturbationsFromMetric,
  metricPerturbationFromSquaredLengthPerturbations
} from './subqg_simplex_tensor_bridge.mjs';
import { linearizedEinsteinTensorFourier } from './subqg_spin2_ir.mjs';

function vector3(name, value) {
  if (!Array.isArray(value) || value.length !== 3 || value.some(x => !Number.isFinite(x))) {
    throw new RangeError(`${name} must contain three finite components`);
  }
}

function symmetric3(name, value) {
  if (!Array.isArray(value) || value.length !== 3) throw new RangeError(`${name} must be 3x3`);
  for (let i = 0; i < 3; i++) {
    vector3(`${name}[${i}]`, value[i]);
    for (let j = 0; j < 3; j++) {
      if (Math.abs(value[i][j] - value[j][i]) > 1e-12) throw new RangeError(`${name} must be symmetric`);
    }
  }
}

const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const norm = value => Math.hypot(...value);
const scale = (value, factor) => value.map(x => x * factor);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const outer = (a, b) => a.map(x => b.map(y => x * y));
const transpose = matrix => matrix[0].map((_, j) => matrix.map(row => row[j]));
const multiply = (a, b) => a.map(row => b[0].map((_, j) =>
  row.reduce((sum, value, k) => sum + value * b[k][j], 0)));
const subtract = (a, b) => a.map((row, i) => row.map((value, j) => value - b[i][j]));
const add = (a, b) => a.map((row, i) => row.map((value, j) => value + b[i][j]));
const matrixScale = (a, factor) => a.map(row => row.map(value => value * factor));
const maxAbs = matrix => Math.max(...matrix.flat().map(Math.abs));

function unit(value, name) {
  vector3(name, value);
  const length = norm(value);
  if (!(length > 0)) throw new RangeError(`${name} must be nonzero`);
  return scale(value, 1 / length);
}

function choleskyLower(matrix) {
  symmetric3('backgroundGram', matrix);
  const lower = Array.from({ length: 3 }, () => Array(3).fill(0));
  for (let i = 0; i < 3; i++) for (let j = 0; j <= i; j++) {
    let residual = matrix[i][j];
    for (let k = 0; k < j; k++) residual -= lower[i][k] * lower[j][k];
    if (i === j) {
      if (!(residual > 0)) throw new RangeError('backgroundGram must be positive definite');
      lower[i][j] = Math.sqrt(residual);
    } else lower[i][j] = residual / lower[j][j];
  }
  return lower;
}

function inverseLower(lower) {
  const inverse = Array.from({ length: 3 }, () => Array(3).fill(0));
  for (let i = 0; i < 3; i++) {
    inverse[i][i] = 1 / lower[i][i];
    for (let j = 0; j < i; j++) {
      let sum = 0;
      for (let k = j; k < i; k++) sum += lower[i][k] * inverse[k][j];
      inverse[i][j] = -sum / lower[i][i];
    }
  }
  return inverse;
}

export function transverseTracelessProjector(spatialMetricPerturbation, waveVector) {
  symmetric3('spatialMetricPerturbation', spatialMetricPerturbation);
  const direction = unit(waveVector, 'waveVector');
  const identity = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const projector = subtract(identity, outer(direction, direction));
  const transverse = multiply(multiply(projector, spatialMetricPerturbation), projector);
  const transverseTrace = projector.reduce((sum, row, i) =>
    sum + row.reduce((inner, value, j) => inner + value * spatialMetricPerturbation[i][j], 0), 0);
  return subtract(transverse, matrixScale(projector, transverseTrace / 2));
}

export function spatialGaugePerturbation(waveVector, gaugeVector) {
  vector3('waveVector', waveVector);
  vector3('gaugeVector', gaugeVector);
  return add(outer(waveVector, gaugeVector), outer(gaugeVector, waveVector));
}

export function tensorPolarizationBasis(waveVector) {
  const direction = unit(waveVector, 'waveVector');
  const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const reference = axes.reduce((best, axis) =>
    Math.abs(dot(direction, axis)) < Math.abs(dot(direction, best)) ? axis : best, axes[0]);
  const first = unit(cross(direction, reference), 'polarization basis');
  const second = unit(cross(direction, first), 'polarization basis');
  return {
    direction,
    first,
    second,
    plus: subtract(outer(first, first), outer(second, second)),
    cross: add(outer(first, second), outer(second, first))
  };
}

export function orthonormalPerturbationToSimplexGram(spatialMetricPerturbation, backgroundGram) {
  symmetric3('spatialMetricPerturbation', spatialMetricPerturbation);
  const lower = choleskyLower(backgroundGram);
  return multiply(multiply(lower, spatialMetricPerturbation), transpose(lower));
}

export function simplexGramPerturbationToOrthonormal(deltaGram, backgroundGram) {
  symmetric3('deltaGram', deltaGram);
  const inverse = inverseLower(choleskyLower(backgroundGram));
  return multiply(multiply(inverse, deltaGram), transpose(inverse));
}

export function simplexRadiativeGaugeAudit({
  waveVector = [0.3, -0.4, 0.5], plusAmplitude = 0.7, crossAmplitude = -0.2
} = {}) {
  vector3('waveVector', waveVector);
  if (!Number.isFinite(plusAmplitude) || !Number.isFinite(crossAmplitude)) {
    throw new RangeError('polarization amplitudes must be finite');
  }
  const waveNumber = norm(waveVector);
  if (!(waveNumber > 0)) throw new RangeError('waveVector must be nonzero');
  const basis = tensorPolarizationBasis(waveVector);
  const physical = add(matrixScale(basis.plus, plusAmplitude), matrixScale(basis.cross, crossAmplitude));
  const regularTetrahedronSquaredLengths = { d01: 1, d02: 1, d03: 1, d12: 1, d13: 1, d23: 1 };
  const backgroundGram = tetrahedronGramFromSquaredLengths(regularTetrahedronSquaredLengths);
  const deltaGram = orthonormalPerturbationToSimplexGram(physical, backgroundGram);
  const edgePerturbations = squaredLengthPerturbationsFromMetric(deltaGram);
  const reconstructedGram = metricPerturbationFromSquaredLengthPerturbations(edgePerturbations);
  const reconstructed = simplexGramPerturbationToOrthonormal(reconstructedGram, backgroundGram);
  const projected = transverseTracelessProjector(reconstructed, waveVector);
  const projectedAgain = transverseTracelessProjector(projected, waveVector);
  const direction = basis.direction;
  const transversalityResidual = Math.max(...[0, 1, 2].map(j => Math.abs(
    direction.reduce((sum, value, i) => sum + value * reconstructed[i][j], 0))));
  const traceResidual = Math.abs(reconstructed[0][0] + reconstructed[1][1] + reconstructed[2][2]);

  const gauge = spatialGaugePerturbation(waveVector, [0.11, -0.23, 0.37]);
  const gaugeDeltaGram = orthonormalPerturbationToSimplexGram(gauge, backgroundGram);
  const gaugeEdges = squaredLengthPerturbationsFromMetric(gaugeDeltaGram);
  const reconstructedGauge = simplexGramPerturbationToOrthonormal(
    metricPerturbationFromSquaredLengthPerturbations(gaugeEdges), backgroundGram);
  const gaugeProjectionResidual = maxAbs(transverseTracelessProjector(reconstructedGauge, waveVector));

  const spacetime = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) spacetime[i + 1][j + 1] = reconstructed[i][j];
  const fourWaveVector = [waveNumber, ...waveVector];
  const fieldEquation = linearizedEinsteinTensorFourier(spacetime, fourWaveVector);
  const edgeRoundTripResidual = maxAbs(subtract(reconstructed, physical));
  const ttIdempotenceResidual = maxAbs(subtract(projectedAgain, projected));
  const physicalProjectionResidual = maxAbs(subtract(projected, physical));
  return {
    construction: 'six scalar tetrahedron-edge perturbations -> local orthonormal metric -> TT spin-2 wave',
    background: 'regular relational tetrahedron',
    waveVector,
    edgePerturbations,
    physicalPolarizations: 2,
    edgeRoundTripResidual,
    transversalityResidual,
    traceResidual,
    physicalProjectionResidual,
    ttIdempotenceResidual,
    pureSpatialGaugeProjectionResidual: gaugeProjectionResidual,
    massSquared: -fieldEquation.kSquared,
    fierzPauliVacuumResidual: fieldEquation.maxResidual,
    radiativeEdgeToSpinTwoBridgeClosed:
      edgeRoundTripResidual < 1e-12 && transversalityResidual < 1e-12 && traceResidual < 1e-12 &&
      physicalProjectionResidual < 1e-12 && ttIdempotenceResidual < 1e-12 &&
      gaugeProjectionResidual < 1e-12 && Math.abs(fieldEquation.kSquared) < 1e-12 &&
      fieldEquation.maxResidual < 1e-12,
    canonicalAnchoredActionDerivationClosed: false
  };
}
