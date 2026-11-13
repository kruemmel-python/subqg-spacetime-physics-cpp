import { SubQGGraphCoupledEngine } from './subqg_graph_coupled_gravity.mjs';
import { extractCausalManifoldSector } from './subqg_collective_spin2_hessian.mjs';

const M0_SQUARED = 0.04;
const LAMBDA_SOLITON = 0.15;
const GAMMA_SEXTIC = 0.05;

function potential(value) {
  const q = value * value;
  return 0.5 * M0_SQUARED * q - 0.25 * LAMBDA_SOLITON * q * q +
    (GAMMA_SEXTIC / 6) * q * q * q;
}

function potentialDerivative(value) {
  const q = value * value;
  return M0_SQUARED * value - LAMBDA_SOLITON * value * q +
    GAMMA_SEXTIC * value * q * q;
}

function solitonBasin() {
  const discriminant = LAMBDA_SOLITON ** 2 - 4 * GAMMA_SEXTIC * M0_SQUARED;
  const separatrixSquared = (LAMBDA_SOLITON - Math.sqrt(discriminant)) /
    (2 * GAMMA_SEXTIC);
  const condensedMinimumSquared = (LAMBDA_SOLITON + Math.sqrt(discriminant)) /
    (2 * GAMMA_SEXTIC);
  const separatrixAmplitude = Math.sqrt(separatrixSquared);
  const condensedMinimumAmplitude = Math.sqrt(condensedMinimumSquared);
  return {
    separatrixAmplitude,
    condensedMinimumAmplitude,
    condensedVacuumPotential: potential(condensedMinimumAmplitude)
  };
}

function regressSlope(points) {
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  if (!(denominator > 0)) return null;
  return points.reduce((sum, point) =>
    sum + (point.x - meanX) * (point.y - meanY), 0) / denominator;
}

function force(psi, activeNodes, bonds) {
  const result = new Float64Array(psi.length);
  for (const node of activeNodes) result[node] = -potentialDerivative(psi[node]);
  for (const bond of bonds) {
    const gradient = bond.stiffness * (psi[bond.j] - psi[bond.i]);
    result[bond.i] += gradient;
    result[bond.j] -= gradient;
  }
  return result;
}

function evolveStage(psi, momentum, activeNodes, bonds, { steps, dt }) {
  for (let step = 0; step < steps; step++) {
    let currentForce = force(psi, activeNodes, bonds);
    for (const node of activeNodes) momentum[node] += 0.5 * dt * currentForce[node];
    for (const node of activeNodes) psi[node] += dt * momentum[node];
    currentForce = force(psi, activeNodes, bonds);
    for (const node of activeNodes) momentum[node] += 0.5 * dt * currentForce[node];
  }
}

function partitionEnergy(psi, momentum, activeNodes, bonds, basin) {
  const local = new Float64Array(psi.length);
  for (const node of activeNodes) {
    const condensed = Math.abs(psi[node]) >= basin.separatrixAmplitude;
    const reference = condensed ? basin.condensedVacuumPotential : 0;
    local[node] = 0.5 * momentum[node] ** 2 + potential(psi[node]) - reference;
  }
  for (const bond of bonds) {
    const gradientEnergy = 0.5 * bond.stiffness * (psi[bond.i] - psi[bond.j]) ** 2;
    local[bond.i] += 0.5 * gradientEnergy;
    local[bond.j] += 0.5 * gradientEnergy;
  }
  let solitonEnergy = 0;
  let nonCondensedEnergy = 0;
  let solitonNodes = 0;
  for (const node of activeNodes) {
    if (Math.abs(psi[node]) >= basin.separatrixAmplitude) {
      solitonEnergy += local[node];
      solitonNodes++;
    } else {
      nonCondensedEnergy += local[node];
    }
  }
  return { solitonEnergy, nonCondensedEnergy, solitonNodes };
}

function physicalManifoldSector(microscopic, possibilityCount) {
  const orderedBonds = microscopic.bonds.slice().sort((left, right) =>
    right.resonance - left.resonance || left.i - right.i || left.j - right.j);
  const links = new Map(orderedBonds.map((bond, born) => {
    const a = Math.min(bond.i, bond.j);
    const b = Math.max(bond.i, bond.j);
    return [`${a}:${b}`, { a, b, born }];
  }));
  const world = {
    nodes: Array.from({ length: possibilityCount }, (_, id) => ({ id })),
    links
  };
  const manifold = extractCausalManifoldSector(world);
  const activeNodeSet = new Set(manifold.cells.flat());
  const physicalEdgeKeys = new Set();
  for (const cell of manifold.cells) for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      physicalEdgeKeys.add(`${Math.min(cell[i], cell[j])}:${Math.max(cell[i], cell[j])}`);
    }
  }
  const bondByKey = new Map(microscopic.bonds.map(bond => [
    `${Math.min(bond.i, bond.j)}:${Math.max(bond.i, bond.j)}`, bond
  ]));
  const cellBirth = cell => Math.max(...Array.from({ length: 4 }, (_, i) =>
    Array.from({ length: 4 }, (_, j) => j > i
      ? links.get(`${Math.min(cell[i], cell[j])}:${Math.max(cell[i], cell[j])}`).born
      : -1)).flat());
  const orderedCells = manifold.cells.slice().sort((left, right) =>
    cellBirth(left) - cellBirth(right) || left.join(':').localeCompare(right.join(':')));
  return {
    manifold,
    orderedCells,
    bondByKey,
    activeNodes: [...activeNodeSet].sort((a, b) => a - b),
    bonds: [...physicalEdgeKeys].map(key => bondByKey.get(key))
  };
}

/**
 * Target-free SubQG network experiment. It uses the lambda-controlled
 * variational percolation graph, the existing Genesis nonlinear field
 * potential, a basin boundary derived from dV/dpsi=0, and tetrahedron count as
 * relational volume. Neither the cosmological density ratio nor w enters.
 */
export function measureSubstrateClusteringDynamics({
  lambdaRatio = 1.12,
  possibilityCount = 72,
  fieldStepsPerCell = 1,
  dt = 0.02
} = {}) {
  if (!Number.isFinite(lambdaRatio) || lambdaRatio <= 1 ||
      !Number.isInteger(possibilityCount) || possibilityCount < 8 ||
      !Number.isInteger(fieldStepsPerCell) || fieldStepsPerCell < 1 ||
      !Number.isFinite(dt) || dt <= 0) {
    throw new RangeError('invalid clustering-dynamics controls');
  }
  const engine = new SubQGGraphCoupledEngine();
  const transition = engine.analyzeSubQGToMicroUniverseTransition({
    possibilityCount,
    lambdaRatios: [lambdaRatio],
    includeMicroscopicState: true
  });
  const psi = new Float64Array(possibilityCount);
  const momentum = new Float64Array(possibilityCount);
  const initialized = new Uint8Array(possibilityCount);
  const basin = solitonBasin();
  const samples = [];

  const stage = transition.transitionSweep[0];
  const microscopic = stage.microscopicState;
  const physical = physicalManifoldSector(microscopic, possibilityCount);
  const activeNodeSet = new Set();
  const activeBondKeys = new Set();
  let seededInitialExcitation = false;
  const sampleVolumes = new Set([physical.orderedCells.length]);
  for (let volume = 1; volume < physical.orderedCells.length; volume *= 2) {
    sampleVolumes.add(volume);
  }
  for (let cellIndex = 0; cellIndex < physical.orderedCells.length; cellIndex++) {
    const cell = physical.orderedCells[cellIndex];
    for (const node of cell) {
      if (activeNodeSet.has(node)) continue;
      activeNodeSet.add(node);
      if (!seededInitialExcitation) {
        // The first causal 3-simplex chooses one of the two degenerate
        // condensed minima. The sign is fixed by its intrinsic phase
        // orientation; the amplitude follows from dV/dpsi=0, not a fit.
        const orientation = microscopic.possibilities[cell[0]].phases
          .find(value => Math.abs(value) > 1e-15) ?? 1;
        psi[node] = Math.sign(orientation) * basin.condensedMinimumAmplitude;
      } else {
        psi[node] = 0;
      }
      momentum[node] = 0;
      initialized[node] = 1;
    }
    seededInitialExcitation = true;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      activeBondKeys.add(`${Math.min(cell[i], cell[j])}:${Math.max(cell[i], cell[j])}`);
    }
    const activeNodes = [...activeNodeSet].sort((left, right) => left - right);
    const activeBonds = [...activeBondKeys].map(key => physical.bondByKey.get(key));
    evolveStage(psi, momentum, activeNodes, activeBonds, {
      steps: fieldStepsPerCell,
      dt
    });
    const volume = cellIndex + 1;
    if (!sampleVolumes.has(volume)) continue;
    const energy = partitionEnergy(psi, momentum, activeNodes, activeBonds, basin);
    const scaleFactorUnnormalized = volume ** (1 / 3);
    const nonCondensedDensity = energy.nonCondensedEnergy / volume;
    samples.push({
      lambdaRatio,
      orderParameterDelta: stage.orderParameterDelta,
      fullCliqueTetrahedra: stage.actualizedTetrahedra,
      activeNodes: activeNodes.length,
      activeBonds: activeBonds.length,
      relationalCellVolume: volume,
      scaleFactorUnnormalized,
      solitonNodes: energy.solitonNodes,
      solitonEnergy: energy.solitonEnergy,
      nonCondensedEnergy: energy.nonCondensedEnergy,
      nonCondensedDensity,
      energyRatio: energy.solitonEnergy > 0
        ? energy.nonCondensedEnergy / energy.solitonEnergy : null
    });
  }
  const finalScale = samples.at(-1)?.scaleFactorUnnormalized ?? 1;
  for (const sample of samples) sample.scaleFactor = sample.scaleFactorUnnormalized / finalScale;
  const regressionPoints = samples
    .filter(sample => sample.nonCondensedDensity > 0 && sample.scaleFactor > 0)
    .map(sample => ({ x: Math.log(sample.scaleFactor), y: Math.log(sample.nonCondensedDensity) }));
  const densityScalingExponent = regressionPoints.length >= 3
    ? regressSlope(regressionPoints) : null;
  const measuredEquationOfStateW = densityScalingExponent === null
    ? null : -1 - densityScalingExponent / 3;
  const final = samples.at(-1) ?? null;
  return {
    schemaVersion: 1,
    targetValuesUsedByEvolution: false,
    ontology: 'SubQG relative-phase network; no classical particles or N-body dynamics',
    lambdaRatio,
    possibilityCount,
    fieldStepsPerCell,
    dt,
    fieldInitialization:
      'the first causal tetrahedron occupies the phase-oriented nonzero minimum derived from dV/dpsi=0; subsequently actualized vertices enter in the psi=0 excitation vacuum',
    solitonProjector:
      '|psi| exceeds the lower nonzero stationary point of the existing sextic Genesis potential',
    solitonSeparatrixAmplitude: basin.separatrixAmplitude,
    condensedMinimumAmplitude: basin.condensedMinimumAmplitude,
    relationalVolumeDefinition:
      'tetrahedron count in the parameter-free causally ordered orientable manifold sector',
    sampleCount: samples.length,
    finalMeasuredEnergyRatio: final?.energyRatio ?? null,
    densityScalingExponent,
    measuredEquationOfStateW,
    samples
  };
}

export function measureSubstrateClusteringDynamicsDefault() {
  return measureSubstrateClusteringDynamics();
}
