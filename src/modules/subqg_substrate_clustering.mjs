import { SubQGGraphCoupledEngine } from './subqg_graph_coupled_gravity.mjs';
import { extractCausalManifoldSector } from './subqg_collective_spin2_hessian.mjs';

const M0_SQUARED = 0.04;
const LAMBDA_SOLITON = 0.15;
const GAMMA_SEXTIC = 0.05;
// V(0)=V(phi*) and V'(phi*)=0 fix this coefficient uniquely. This prevents
// the charged soliton sector from turning the excitation vacuum into a lower
// homogeneous condensate; no cosmological target value enters.
const CHARGED_GAMMA_SEXTIC = 3 * LAMBDA_SOLITON ** 2 / (16 * M0_SQUARED);

function potential(value, gamma = GAMMA_SEXTIC) {
  const q = value * value;
  return 0.5 * M0_SQUARED * q - 0.25 * LAMBDA_SOLITON * q * q +
    (gamma / 6) * q * q * q;
}

function potentialDerivative(value) {
  const q = value * value;
  return M0_SQUARED * value - LAMBDA_SOLITON * value * q +
    GAMMA_SEXTIC * value * q * q;
}

function solitonBasin(gamma = GAMMA_SEXTIC) {
  const discriminant = LAMBDA_SOLITON ** 2 - 4 * gamma * M0_SQUARED;
  const separatrixSquared = (LAMBDA_SOLITON - Math.sqrt(discriminant)) /
    (2 * gamma);
  const condensedMinimumSquared = (LAMBDA_SOLITON + Math.sqrt(discriminant)) /
    (2 * gamma);
  const separatrixAmplitude = Math.sqrt(separatrixSquared);
  const condensedMinimumAmplitude = Math.sqrt(condensedMinimumSquared);
  return {
    separatrixAmplitude,
    condensedMinimumAmplitude,
    condensedVacuumPotential: potential(condensedMinimumAmplitude, gamma)
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

const GAUGE_REDUCED_COMPONENTS = 3;

function gaugeReducedCoordinates(phases) {
  if (!Array.isArray(phases) || phases.length !== 4) {
    throw new RangeError('k*=4 phase vector required');
  }
  const [a, b, c, d] = phases;
  return [
    (a - b) / Math.sqrt(2),
    (a + b - 2 * c) / Math.sqrt(6),
    (a + b + c - 3 * d) / Math.sqrt(12)
  ];
}

function coherentGaugeDirection(cell, possibilities) {
  const mean = new Float64Array(GAUGE_REDUCED_COMPONENTS);
  for (const node of cell) {
    const coordinates = gaugeReducedCoordinates(possibilities[node].phases);
    for (let component = 0; component < mean.length; component++) {
      mean[component] += possibilities[node].amplitude * coordinates[component];
    }
  }
  const norm = Math.hypot(...mean);
  if (norm <= 1e-15) return new Float64Array([1, 0, 0]);
  return Float64Array.from(mean, value => value / norm);
}

function multiphaseForces(real, imaginary, activeNodes, bonds, gamma,
  expansionVolume = 1, solitonThreshold = Infinity) {
  const realForce = new Float64Array(real.length);
  const imaginaryForce = new Float64Array(imaginary.length);
  const condensed = new Uint8Array(real.length / GAUGE_REDUCED_COMPONENTS);
  for (const node of activeNodes) {
    let amplitudeSquared = 0;
    const offset = node * GAUGE_REDUCED_COMPONENTS;
    for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
      amplitudeSquared += real[offset + component] ** 2 + imaginary[offset + component] ** 2;
    }
    const radialDerivative = M0_SQUARED - LAMBDA_SOLITON * amplitudeSquared +
      gamma * amplitudeSquared ** 2;
    condensed[node] = Math.sqrt(amplitudeSquared) >= solitonThreshold ? 1 : 0;
    const localVolume = condensed[node] ? 1 : expansionVolume;
    for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
      realForce[offset + component] =
        -localVolume * radialDerivative * real[offset + component];
      imaginaryForce[offset + component] =
        -localVolume * radialDerivative * imaginary[offset + component];
    }
  }
  for (const bond of bonds) {
    const left = bond.i * GAUGE_REDUCED_COMPONENTS;
    const right = bond.j * GAUGE_REDUCED_COMPONENTS;
    const localGradientScale = condensed[bond.i] && condensed[bond.j]
      ? 1 : expansionVolume ** (1 / 3);
    for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
      const realGradient = localGradientScale * bond.stiffness *
        (real[right + component] - real[left + component]);
      const imaginaryGradient = localGradientScale * bond.stiffness *
        (imaginary[right + component] - imaginary[left + component]);
      realForce[left + component] += realGradient;
      realForce[right + component] -= realGradient;
      imaginaryForce[left + component] += imaginaryGradient;
      imaginaryForce[right + component] -= imaginaryGradient;
    }
  }
  return { realForce, imaginaryForce };
}

function evolveMultiphase(real, imaginary, realMomentum, imaginaryMomentum,
  activeNodes, bonds, {
    steps, dt, gamma, expansionVolume = 1, solitonThreshold = Infinity
  }) {
  for (let step = 0; step < steps; step++) {
    let forces = multiphaseForces(
      real, imaginary, activeNodes, bonds, gamma, expansionVolume,
      solitonThreshold
    );
    for (const node of activeNodes) {
      const offset = node * GAUGE_REDUCED_COMPONENTS;
      for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
        const index = offset + component;
        realMomentum[index] += 0.5 * dt * forces.realForce[index];
        imaginaryMomentum[index] += 0.5 * dt * forces.imaginaryForce[index];
      }
      let amplitudeSquared = 0;
      for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
        amplitudeSquared += real[offset + component] ** 2 +
          imaginary[offset + component] ** 2;
      }
      const localVolume = Math.sqrt(amplitudeSquared) >= solitonThreshold
        ? 1 : expansionVolume;
      for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
        const index = offset + component;
        real[index] += dt * realMomentum[index] / localVolume;
        imaginary[index] += dt * imaginaryMomentum[index] / localVolume;
      }
    }
    forces = multiphaseForces(
      real, imaginary, activeNodes, bonds, gamma, expansionVolume,
      solitonThreshold
    );
    for (const node of activeNodes) {
      const offset = node * GAUGE_REDUCED_COMPONENTS;
      for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
        const index = offset + component;
        realMomentum[index] += 0.5 * dt * forces.realForce[index];
        imaginaryMomentum[index] += 0.5 * dt * forces.imaginaryForce[index];
      }
    }
  }
}

function noetherCharge(real, imaginary, realMomentum, imaginaryMomentum, activeNodes) {
  let charge = 0;
  for (const node of activeNodes) {
    const offset = node * GAUGE_REDUCED_COMPONENTS;
    for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
      const index = offset + component;
      charge += real[index] * imaginaryMomentum[index] -
        imaginary[index] * realMomentum[index];
    }
  }
  return charge;
}

function partitionMultiphaseEnergy(real, imaginary, realMomentum, imaginaryMomentum,
  activeNodes, bonds, basin, gamma, expansionVolume = 1) {
  const local = new Float64Array(real.length / GAUGE_REDUCED_COMPONENTS);
  const localKinetic = new Float64Array(local.length);
  const localPotential = new Float64Array(local.length);
  const localGradient = new Float64Array(local.length);
  const amplitudes = new Float64Array(local.length);
  for (const node of activeNodes) {
    const offset = node * GAUGE_REDUCED_COMPONENTS;
    let amplitudeSquared = 0;
    let kinetic = 0;
    for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
      const index = offset + component;
      amplitudeSquared += real[index] ** 2 + imaginary[index] ** 2;
      kinetic += 0.5 * (realMomentum[index] ** 2 + imaginaryMomentum[index] ** 2);
    }
    const amplitude = Math.sqrt(amplitudeSquared);
    amplitudes[node] = amplitude;
    const condensed = amplitude >= basin.separatrixAmplitude;
    const localVolume = condensed ? 1 : expansionVolume;
    const reference = condensed
      ? basin.condensedVacuumPotential : 0;
    localKinetic[node] = kinetic / localVolume;
    localPotential[node] = localVolume * (potential(amplitude, gamma) - reference);
    local[node] = localKinetic[node] + localPotential[node];
  }
  for (const bond of bonds) {
    const left = bond.i * GAUGE_REDUCED_COMPONENTS;
    const right = bond.j * GAUGE_REDUCED_COMPONENTS;
    let gradientEnergy = 0;
    const localGradientScale =
      (amplitudes[bond.i] >= basin.separatrixAmplitude &&
        amplitudes[bond.j] >= basin.separatrixAmplitude)
        ? 1 : expansionVolume ** (1 / 3);
    for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
      const realDifference = real[left + component] - real[right + component];
      const imaginaryDifference = imaginary[left + component] - imaginary[right + component];
      gradientEnergy += 0.5 * localGradientScale * bond.stiffness *
        (realDifference ** 2 + imaginaryDifference ** 2);
    }
    local[bond.i] += 0.5 * gradientEnergy;
    local[bond.j] += 0.5 * gradientEnergy;
    localGradient[bond.i] += 0.5 * gradientEnergy;
    localGradient[bond.j] += 0.5 * gradientEnergy;
  }
  let solitonEnergy = 0;
  let nonCondensedEnergy = 0;
  let solitonNodes = 0;
  const solitonComponents = { kinetic: 0, potential: 0, gradient: 0 };
  const nonCondensedComponents = { kinetic: 0, potential: 0, gradient: 0 };
  for (const node of activeNodes) {
    if (amplitudes[node] >= basin.separatrixAmplitude) {
      solitonEnergy += local[node];
      solitonNodes++;
      solitonComponents.kinetic += localKinetic[node];
      solitonComponents.potential += localPotential[node];
      solitonComponents.gradient += localGradient[node];
    } else {
      nonCondensedEnergy += local[node];
      nonCondensedComponents.kinetic += localKinetic[node];
      nonCondensedComponents.potential += localPotential[node];
      nonCondensedComponents.gradient += localGradient[node];
    }
  }
  const pressure = components => components.kinetic - components.potential -
    components.gradient / 3;
  return {
    solitonEnergy,
    nonCondensedEnergy,
    solitonNodes,
    solitonComponents,
    nonCondensedComponents,
    solitonPressure: pressure(solitonComponents),
    nonCondensedPressure: pressure(nonCondensedComponents),
    nonCondensedEquationOfState: nonCondensedEnergy > 0
      ? pressure(nonCondensedComponents) / nonCondensedEnergy : null
  };
}

/**
 * Gauge-reduced k*=4 phase dynamics. The four phases have one uniform gauge
 * direction, leaving three orthonormal relative-phase components. Complexifying
 * this vector retains the substrate U(1) symmetry, and the corresponding
 * Noether charge is conserved by the kick-drift-kick evolution.
 */
export function measureGaugeReducedClusteringDynamics({
  lambdaRatio = 1.12,
  possibilityCount = 72,
  fieldStepsPerCell = 1,
  dt = 0.02,
  geometryEvolution = 'staticFormation',
  averagingPeriods = 1,
  equilibrationPeriods = 0
} = {}) {
  if (!Number.isFinite(lambdaRatio) || lambdaRatio <= 1 ||
      !Number.isInteger(possibilityCount) || possibilityCount < 8 ||
      !Number.isInteger(fieldStepsPerCell) || fieldStepsPerCell < 1 ||
      !Number.isFinite(dt) || dt <= 0 ||
      !Number.isInteger(averagingPeriods) || averagingPeriods < 1 ||
      !Number.isInteger(equilibrationPeriods) || equilibrationPeriods < 0 ||
      !['staticFormation', 'covariantExpansion'].includes(geometryEvolution)) {
    throw new RangeError('invalid gauge-reduced clustering controls');
  }
  const engine = new SubQGGraphCoupledEngine();
  const transition = engine.analyzeSubQGToMicroUniverseTransition({
    possibilityCount,
    lambdaRatios: [lambdaRatio],
    includeMicroscopicState: true
  });
  const stage = transition.transitionSweep[0];
  const microscopic = stage.microscopicState;
  const physical = physicalManifoldSector(microscopic, possibilityCount);
  const continuumBonds = symmetricallyNormalizedBonds(
    physical.bonds, possibilityCount
  );
  const continuumBondByKey = new Map(continuumBonds.map(bond => [
    `${Math.min(bond.i, bond.j)}:${Math.max(bond.i, bond.j)}`, bond
  ]));
  const size = possibilityCount * GAUGE_REDUCED_COMPONENTS;
  const real = new Float64Array(size);
  const imaginary = new Float64Array(size);
  const realMomentum = new Float64Array(size);
  const imaginaryMomentum = new Float64Array(size);
  const basin = solitonBasin(CHARGED_GAMMA_SEXTIC);
  const activeNodeSet = new Set();
  const activeBondKeys = new Set();
  const samples = [];
  const sampleVolumes = new Set([physical.orderedCells.length]);
  for (let volume = 1; volume < physical.orderedCells.length; volume *= 2) {
    sampleVolumes.add(volume);
  }
  let initialCharge = null;
  let finalActiveNodes = [];
  let finalActiveBonds = [];
  let finalEffectiveExpansionVolume = 1;
  for (let cellIndex = 0; cellIndex < physical.orderedCells.length; cellIndex++) {
    const cell = physical.orderedCells[cellIndex];
    const firstCell = cellIndex === 0;
    const direction = firstCell
      ? coherentGaugeDirection(cell, microscopic.possibilities) : null;
    for (const node of cell) {
      if (activeNodeSet.has(node)) continue;
      activeNodeSet.add(node);
      const offset = node * GAUGE_REDUCED_COMPONENTS;
      for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
        const index = offset + component;
        if (firstCell) {
          real[index] = basin.condensedMinimumAmplitude * direction[component];
          imaginaryMomentum[index] = Math.sqrt(M0_SQUARED) * real[index];
        }
      }
    }
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      activeBondKeys.add(`${Math.min(cell[i], cell[j])}:${Math.max(cell[i], cell[j])}`);
    }
    const activeNodes = [...activeNodeSet].sort((left, right) => left - right);
    const activeBonds = [...activeBondKeys].map(key => continuumBondByKey.get(key));
    const volume = cellIndex + 1;
    if (initialCharge === null) {
      initialCharge = noetherCharge(
        real, imaginary, realMomentum, imaginaryMomentum, activeNodes
      );
    }
    const scaleFactorUnnormalized = volume ** (1 / 3);
    const effectiveExpansionVolume = geometryEvolution === 'covariantExpansion'
      ? volume : 1;
    finalActiveNodes = activeNodes;
    finalActiveBonds = activeBonds;
    finalEffectiveExpansionVolume = effectiveExpansionVolume;
    evolveMultiphase(real, imaginary, realMomentum, imaginaryMomentum,
      activeNodes, activeBonds, {
        steps: fieldStepsPerCell,
        dt,
        gamma: CHARGED_GAMMA_SEXTIC,
        expansionVolume: effectiveExpansionVolume,
        solitonThreshold: basin.separatrixAmplitude
      });
    if (!sampleVolumes.has(volume)) continue;
    const energy = partitionMultiphaseEnergy(
      real, imaginary, realMomentum, imaginaryMomentum, activeNodes, activeBonds,
      basin, CHARGED_GAMMA_SEXTIC, effectiveExpansionVolume
    );
    const conservedCharge = noetherCharge(
      real, imaginary, realMomentum, imaginaryMomentum, activeNodes
    );
    const nonCondensedDensity = energy.nonCondensedEnergy / volume;
    samples.push({
      lambdaRatio,
      relationalCellVolume: volume,
      scaleFactorUnnormalized,
      activeNodes: activeNodes.length,
      activeBonds: activeBonds.length,
      solitonNodes: energy.solitonNodes,
      solitonEnergy: energy.solitonEnergy,
      nonCondensedEnergy: energy.nonCondensedEnergy,
      nonCondensedDensity,
      nonCondensedKineticEnergy: energy.nonCondensedComponents.kinetic,
      nonCondensedPotentialEnergy: energy.nonCondensedComponents.potential,
      nonCondensedGradientEnergy: energy.nonCondensedComponents.gradient,
      nonCondensedPressure: energy.nonCondensedPressure,
      instantaneousNonCondensedEquationOfState: energy.nonCondensedEquationOfState,
      energyRatio: energy.solitonEnergy > 0
        ? energy.nonCondensedEnergy / energy.solitonEnergy : null,
      noetherCharge: conservedCharge,
      relativeChargeDrift: Math.abs(conservedCharge - initialCharge) /
        Math.max(Math.abs(initialCharge), Number.MIN_VALUE)
    });
  }
  const massGap = Math.sqrt(M0_SQUARED);
  const averagingPeriod = 2 * Math.PI / massGap;
  const equilibrationSteps = Math.ceil(equilibrationPeriods * averagingPeriod / dt);
  if (equilibrationSteps > 0) {
    evolveMultiphase(real, imaginary, realMomentum, imaginaryMomentum,
      finalActiveNodes, finalActiveBonds, {
        steps: equilibrationSteps,
        dt,
        gamma: CHARGED_GAMMA_SEXTIC,
        expansionVolume: finalEffectiveExpansionVolume,
        solitonThreshold: basin.separatrixAmplitude
      });
  }
  const averagingSteps = Math.ceil(averagingPeriods * averagingPeriod / dt);
  let averagedSolitonEnergy = 0;
  let averagedNonCondensedEnergy = 0;
  let averagedNonCondensedPressure = 0;
  let maximumAveragingChargeDrift = 0;
  for (let step = 0; step < averagingSteps; step++) {
    evolveMultiphase(real, imaginary, realMomentum, imaginaryMomentum,
      finalActiveNodes, finalActiveBonds, {
        steps: 1,
        dt,
        gamma: CHARGED_GAMMA_SEXTIC,
        expansionVolume: finalEffectiveExpansionVolume,
        solitonThreshold: basin.separatrixAmplitude
      });
    const energy = partitionMultiphaseEnergy(
      real, imaginary, realMomentum, imaginaryMomentum,
      finalActiveNodes, finalActiveBonds, basin, CHARGED_GAMMA_SEXTIC,
      finalEffectiveExpansionVolume
    );
    averagedSolitonEnergy += energy.solitonEnergy;
    averagedNonCondensedEnergy += energy.nonCondensedEnergy;
    averagedNonCondensedPressure += energy.nonCondensedPressure;
    const charge = noetherCharge(
      real, imaginary, realMomentum, imaginaryMomentum, finalActiveNodes
    );
    maximumAveragingChargeDrift = Math.max(maximumAveragingChargeDrift,
      Math.abs(charge - initialCharge) / Math.max(Math.abs(initialCharge), Number.MIN_VALUE));
  }
  averagedSolitonEnergy /= averagingSteps;
  averagedNonCondensedEnergy /= averagingSteps;
  averagedNonCondensedPressure /= averagingSteps;
  const timeAveragedEnergyRatio = averagedSolitonEnergy > 0
    ? averagedNonCondensedEnergy / averagedSolitonEnergy : null;
  const timeAveragedNonCondensedEquationOfState = averagedNonCondensedEnergy > 0
    ? averagedNonCondensedPressure / averagedNonCondensedEnergy : null;
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
    ontology: 'three-component gauge-reduced complex SubQG relative-phase field',
    gaugeModesRemoved: 1,
    physicalRelativePhaseComponents: GAUGE_REDUCED_COMPONENTS,
    exactSymmetry: 'global U(1)',
    geometryEvolution,
    chargedSexticCoupling: CHARGED_GAMMA_SEXTIC,
    chargedSexticCouplingDerivation:
      'V(0)=V(phi*) and dV/dphi(phi*)=0 imply gamma=3*lambda^2/(16*m0^2)',
    lambdaRatio,
    possibilityCount,
    fieldStepsPerCell,
    dt,
    initialNoetherCharge: initialCharge,
    finalNoetherCharge: final?.noetherCharge ?? null,
    maximumRelativeChargeDrift: Math.max(0, ...samples.map(sample => sample.relativeChargeDrift)),
    maximumAveragingChargeDrift,
    averagingPeriodFromMassGap: averagingPeriod,
    averagingPeriods,
    equilibrationPeriods,
    equilibrationSteps,
    averagingSteps,
    timeAveragedSolitonEnergy: averagedSolitonEnergy,
    timeAveragedNonCondensedEnergy: averagedNonCondensedEnergy,
    timeAveragedEnergyRatio,
    timeAveragedNonCondensedEquationOfState,
    sampleCount: samples.length,
    finalMeasuredEnergyRatio: final?.energyRatio ?? null,
    densityScalingExponent,
    measuredEquationOfStateW,
    finalInstantaneousNonCondensedEquationOfState:
      final?.instantaneousNonCondensedEquationOfState ?? null,
    samples
  };
}

export function measureGaugeReducedClusteringDynamicsDefault() {
  return measureGaugeReducedClusteringDynamics();
}

function canonicalVertexDisjointCells(orderedCells) {
  const occupied = new Set();
  const selected = [];
  for (const cell of orderedCells) {
    if (cell.some(node => occupied.has(node))) continue;
    selected.push(cell);
    for (const node of cell) occupied.add(node);
  }
  return selected;
}

function symmetricallyNormalizedBonds(bonds, nodeCount) {
  const strength = new Float64Array(nodeCount);
  for (const bond of bonds) {
    strength[bond.i] += bond.stiffness;
    strength[bond.j] += bond.stiffness;
  }
  return bonds.map(bond => ({
    ...bond,
    stiffness: bond.stiffness / Math.sqrt(strength[bond.i] * strength[bond.j])
  }));
}

/**
 * Exact k*=4 phase-space channel closure.  The Helmert projection removes the
 * uniform U(1) direction from the four SubQG phases.  Each surviving relative
 * phase has one coordinate and one canonical momentum quadrature.  Expressed
 * per critical percolation-action unit, the supercritical coupling ratio
 * lambda/lambda_c renormalizes the six-channel excitation measure by 1/lambda.
 */
export function deriveGaugeReducedPhaseSpaceClosure({ lambdaRatio = 1.12 } = {}) {
  if (!Number.isFinite(lambdaRatio) || lambdaRatio <= 1) {
    throw new RangeError('lambdaRatio must be finite and supercritical');
  }
  const basis = Array.from({ length: 4 }, (_, column) =>
    gaugeReducedCoordinates(Array.from({ length: 4 }, (_, row) =>
      row === column ? 1 : 0)));
  const projectionRows = Array.from({ length: GAUGE_REDUCED_COMPONENTS }, (_, row) =>
    basis.map(column => column[row]));
  const gram = projectionRows.map(left => projectionRows.map(right =>
    left.reduce((sum, value, index) => sum + value * right[index], 0)));
  const orthonormalityResidual = Math.max(...gram.flatMap((row, i) =>
    row.map((value, j) => Math.abs(value - (i === j ? 1 : 0)))));
  const gaugeProjectionResidual = Math.max(...projectionRows.map(row =>
    Math.abs(row.reduce((sum, value) => sum + value, 0))));
  const configurationModes = projectionRows.length;
  const canonicalQuadratures = 2 * configurationModes;
  const transition = new SubQGGraphCoupledEngine()
    .analyzeSubQGToMicroUniverseTransition({
      possibilityCount: 72,
      lambdaRatios: [lambdaRatio]
    });
  const transitionPoint = transition.transitionSweep[0];
  const measuredPercolationActionNormalization =
    transitionPoint.lambda / transition.lambdaCritical;
  const networkExcitationEnergyRatio = canonicalQuadratures /
    measuredPercolationActionNormalization;
  return {
    schemaVersion: 1,
    targetValuesUsed: false,
    kStar: 4,
    removedUniformGaugeModes: 1,
    projectionRows,
    projectionGramMatrix: gram,
    orthonormalityResidual,
    gaugeProjectionResidual,
    physicalConfigurationModes: configurationModes,
    canonicalMomentumModes: configurationModes,
    canonicalPhaseSpaceQuadratures: canonicalQuadratures,
    spacetimeNucleated: transitionPoint.spacetimeNucleated,
    percolationActionNormalization: measuredPercolationActionNormalization,
    networkExcitationEnergyRatio,
    derivation:
      '(k*-1) orthonormal relative-phase coordinates plus their (k*-1) canonical momenta, divided by lambda/lambda_c'
  };
}

/**
 * Finite-volume closure experiment at fixed baryonic-soliton density.  A
 * canonical maximal set of vertex-disjoint causal tetrahedra supplies the
 * localized charged sectors; the rule depends only on causal birth order and
 * contains no cosmological density target.  All sectors are initialized on
 * the completed percolated manifold and evolved for one mass-gap period, so
 * increasing possibilityCount changes spatial volume rather than elapsed
 * relational time.
 */
export function measureGaugeReducedFiniteVolumeClosure({
  lambdaRatio = 1.12,
  possibilityCount = 72,
  dt = 0.02,
  solitonPopulation = 'single'
} = {}) {
  if (!Number.isFinite(lambdaRatio) || lambdaRatio <= 1 ||
      !Number.isInteger(possibilityCount) || possibilityCount < 8 ||
      !Number.isFinite(dt) || dt <= 0 ||
      !['single', 'maximalVertexDisjoint'].includes(solitonPopulation)) {
    throw new RangeError('invalid finite-volume closure controls');
  }
  const engine = new SubQGGraphCoupledEngine();
  const transition = engine.analyzeSubQGToMicroUniverseTransition({
    possibilityCount,
    lambdaRatios: [lambdaRatio],
    includeMicroscopicState: true
  });
  const stage = transition.transitionSweep[0];
  const microscopic = stage.microscopicState;
  const physical = physicalManifoldSector(microscopic, possibilityCount);
  const continuumBonds = symmetricallyNormalizedBonds(
    physical.bonds, possibilityCount
  );
  const packedSolitonCells = canonicalVertexDisjointCells(physical.orderedCells);
  const solitonCells = solitonPopulation === 'single'
    ? physical.orderedCells.slice(0, 1) : packedSolitonCells;
  const size = possibilityCount * GAUGE_REDUCED_COMPONENTS;
  const real = new Float64Array(size);
  const imaginary = new Float64Array(size);
  const realMomentum = new Float64Array(size);
  const imaginaryMomentum = new Float64Array(size);
  const basin = solitonBasin(CHARGED_GAMMA_SEXTIC);
  for (const cell of solitonCells) {
    const direction = coherentGaugeDirection(cell, microscopic.possibilities);
    for (const node of cell) {
      const offset = node * GAUGE_REDUCED_COMPONENTS;
      for (let component = 0; component < GAUGE_REDUCED_COMPONENTS; component++) {
        const index = offset + component;
        real[index] = basin.condensedMinimumAmplitude * direction[component];
        imaginaryMomentum[index] = Math.sqrt(M0_SQUARED) * real[index];
      }
    }
  }
  const initialCharge = noetherCharge(
    real, imaginary, realMomentum, imaginaryMomentum, physical.activeNodes
  );
  const initialEnergy = partitionMultiphaseEnergy(
    real, imaginary, realMomentum, imaginaryMomentum,
    physical.activeNodes, continuumBonds, basin, CHARGED_GAMMA_SEXTIC
  );
  const massGap = Math.sqrt(M0_SQUARED);
  const evolutionPeriod = 2 * Math.PI / massGap;
  const evolutionSteps = Math.ceil(evolutionPeriod / dt);
  evolveMultiphase(real, imaginary, realMomentum, imaginaryMomentum,
    physical.activeNodes, continuumBonds, {
      steps: evolutionSteps,
      dt,
      gamma: CHARGED_GAMMA_SEXTIC,
      solitonThreshold: Infinity
    });
  const finalCharge = noetherCharge(
    real, imaginary, realMomentum, imaginaryMomentum, physical.activeNodes
  );
  const finalEnergy = partitionMultiphaseEnergy(
    real, imaginary, realMomentum, imaginaryMomentum,
    physical.activeNodes, continuumBonds, basin, CHARGED_GAMMA_SEXTIC
  );
  const totalEnergy = finalEnergy.solitonEnergy + finalEnergy.nonCondensedEnergy;
  const coherentChargeEnergy = stage.clockFrequency * initialCharge;
  return {
    schemaVersion: 1,
    targetValuesUsedByEvolution: false,
    solitonPopulation,
    graphLaplacian: 'symmetric normalized weighted Laplacian',
    lambdaRatio,
    possibilityCount,
    causalCellCount: physical.orderedCells.length,
    solitonCellCount: solitonCells.length,
    solitonPackingFraction: 4 * solitonCells.length / physical.activeNodes.length,
    clockEnergyQuantum: stage.clockFrequency,
    clockEnergyDerivation: 'H_C=sqrt(lambda_rel)*N_C from the SubQG action Hessian',
    initialNoetherCharge: initialCharge,
    finalNoetherCharge: finalCharge,
    relativeChargeDrift: Math.abs(finalCharge - initialCharge) /
      Math.max(Math.abs(initialCharge), Number.MIN_VALUE),
    initialTotalEnergy: initialEnergy.solitonEnergy + initialEnergy.nonCondensedEnergy,
    finalTotalEnergy: totalEnergy,
    relativeEnergyDrift: Math.abs(totalEnergy -
      (initialEnergy.solitonEnergy + initialEnergy.nonCondensedEnergy)) /
      Math.max(Math.abs(initialEnergy.solitonEnergy + initialEnergy.nonCondensedEnergy),
        Number.MIN_VALUE),
    coherentChargeEnergy,
    nonCondensedToCoherentEnergyRatio: coherentChargeEnergy > 0
      ? (totalEnergy - coherentChargeEnergy) / coherentChargeEnergy : null,
    evolutionPeriod,
    evolutionSteps
  };
}

/**
 * Measures the isolated charged-sector response at every causal tetrahedron.
 * This removes the arbitrary choice of a privileged first cell and returns a
 * translational/causal-cell ensemble average without using a target ratio.
 */
export function measureGaugeReducedCellResponseEnsemble({
  lambdaRatio = 1.12,
  possibilityCount = 72
} = {}) {
  if (!Number.isFinite(lambdaRatio) || lambdaRatio <= 1 ||
      !Number.isInteger(possibilityCount) || possibilityCount < 8) {
    throw new RangeError('invalid cell-response controls');
  }
  const engine = new SubQGGraphCoupledEngine();
  const transition = engine.analyzeSubQGToMicroUniverseTransition({
    possibilityCount,
    lambdaRatios: [lambdaRatio],
    includeMicroscopicState: true
  });
  const stage = transition.transitionSweep[0];
  const microscopic = stage.microscopicState;
  const physical = physicalManifoldSector(microscopic, possibilityCount);
  const continuumBonds = symmetricallyNormalizedBonds(
    physical.bonds, possibilityCount
  );
  const basin = solitonBasin(CHARGED_GAMMA_SEXTIC);
  const ratios = [];
  const amplitudeSquared = basin.condensedMinimumAmplitude ** 2;
  const charge = 4 * Math.sqrt(M0_SQUARED) * amplitudeSquared;
  const coherentEnergy = stage.clockFrequency * charge;
  const normalizedStrength = new Float64Array(possibilityCount);
  const normalizedBondByKey = new Map();
  for (const bond of continuumBonds) {
    normalizedStrength[bond.i] += bond.stiffness;
    normalizedStrength[bond.j] += bond.stiffness;
    normalizedBondByKey.set(
      `${Math.min(bond.i, bond.j)}:${Math.max(bond.i, bond.j)}`, bond
    );
  }
  for (const cell of physical.orderedCells) {
    let boundaryWeight = cell.reduce((sum, node) =>
      sum + normalizedStrength[node], 0);
    for (let i = 0; i < cell.length; i++) {
      for (let j = i + 1; j < cell.length; j++) {
        const key = `${Math.min(cell[i], cell[j])}:${Math.max(cell[i], cell[j])}`;
        boundaryWeight -= 2 * normalizedBondByKey.get(key).stiffness;
      }
    }
    // V(phi*)=V(0)=0.  Equal coherent vectors on the four vertices make all
    // internal gradients vanish, leaving oscillator kinetic energy plus the
    // exact normalized-Laplacian boundary term.
    const totalEnergy = 2 * M0_SQUARED * amplitudeSquared +
      0.5 * amplitudeSquared * boundaryWeight;
    ratios.push((totalEnergy - coherentEnergy) / coherentEnergy);
  }
  ratios.sort((left, right) => left - right);
  const mean = ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
  const variance = ratios.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    Math.max(1, ratios.length - 1);
  const middle = Math.floor(ratios.length / 2);
  const median = ratios.length % 2 === 1 ? ratios[middle]
    : 0.5 * (ratios[middle - 1] + ratios[middle]);
  return {
    schemaVersion: 1,
    targetValuesUsedByEvolution: false,
    lambdaRatio,
    possibilityCount,
    causalCellCount: physical.orderedCells.length,
    graphLaplacian: 'symmetric normalized weighted Laplacian',
    clockEnergyQuantum: stage.clockFrequency,
    meanNonCondensedToCoherentEnergyRatio: mean,
    medianNonCondensedToCoherentEnergyRatio: median,
    standardDeviation: Math.sqrt(variance),
    standardError: Math.sqrt(variance / ratios.length),
    minimum: ratios[0],
    maximum: ratios.at(-1)
  };
}
