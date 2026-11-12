import { tetrahedralCells } from './subqg_simplex_tensor_bridge.mjs';
import { MicroActionWorld } from './subqg_microaction.mjs';

function cellFaces(cell) {
  return Array.from({ length: 4 }, (_, omitted) =>
    cell.filter((_, index) => index !== omitted).join(':'));
}

function incidence(cells) {
  const faces = cells.map(cellFaces);
  const faceCells = new Map();
  faces.forEach((keys, cellIndex) => keys.forEach(key => {
    if (!faceCells.has(key)) faceCells.set(key, []);
    faceCells.get(key).push(cellIndex);
  }));
  return { faces, faceCells };
}

function histogram(values) {
  const out = {};
  for (const value of values) out[value] = (out[value] ?? 0) + 1;
  return out;
}

export function tetrahedralIncidenceAudit(world) {
  const cells = tetrahedralCells(world);
  const { faceCells } = incidence(cells);
  const counts = [...faceCells.values()].map(value => value.length);
  return {
    tetrahedralCells: cells.length,
    uniqueTriangularFaces: faceCells.size,
    faceIncidenceHistogram: histogram(counts),
    boundaryFaces: counts.filter(value => value === 1).length,
    manifoldInteriorFaces: counts.filter(value => value === 2).length,
    nonManifoldFaces: counts.filter(value => value > 2).length,
    maximumFaceIncidence: Math.max(0, ...counts),
    fullCliqueComplexIsFaceManifold: counts.every(value => value <= 2)
  };
}

function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffled(values, random) {
  const result = values.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Deterministically extracts a connected orientable tetrahedral
 * pseudomanifold with boundary.  No triangular face may have incidence > 2,
 * and induced orientations on every shared face are opposite.
 */
export function extractOrientableManifoldSubcomplex(world, {
  trials = 1000, searchSeed = 123456789
} = {}) {
  if (!Number.isInteger(trials) || trials < 1) throw new RangeError('trials must be a positive integer');
  const cells = tetrahedralCells(world);
  if (cells.length === 0) return {
    cells: [], originalCellIndices: [], orientations: [], dualBonds: [],
    faceIncidenceHistogram: {}, connected: false, orientable: false
  };
  const { faces, faceCells } = incidence(cells);
  const random = lcg(searchSeed);
  let best = null;
  for (let trial = 0; trial < trials; trial++) {
    const chosen = [];
    const selected = new Set();
    const orientations = new Map();
    const faceCounts = new Map();
    const frontier = new Set();
    const add = (index, orientation) => {
      selected.add(index);
      orientations.set(index, orientation);
      chosen.push(index);
      for (const face of faces[index]) {
        faceCounts.set(face, (faceCounts.get(face) ?? 0) + 1);
        for (const neighbor of faceCells.get(face)) if (!selected.has(neighbor)) frontier.add(neighbor);
      }
      frontier.delete(index);
    };
    const requiredOrientation = index => {
      if (!faces[index].every(face => (faceCounts.get(face) ?? 0) < 2)) return null;
      const requirements = [];
      for (let omitted = 0; omitted < 4; omitted++) {
        const face = faces[index][omitted];
        for (const neighbor of faceCells.get(face)) if (selected.has(neighbor)) {
          const neighborOmitted = faces[neighbor].indexOf(face);
          const parity = (omitted - neighborOmitted) % 2 === 0 ? 1 : -1;
          requirements.push(-orientations.get(neighbor) * parity);
        }
      }
      return requirements.length > 0 && requirements.every(value => value === requirements[0])
        ? requirements[0] : null;
    };
    add(Math.floor(random() * cells.length), 1);
    while (true) {
      let feasible = [...frontier]
        .map(index => [index, requiredOrientation(index)])
        .filter(([, orientation]) => orientation !== null);
      if (feasible.length === 0) break;
      feasible = shuffled(feasible, random);
      feasible.sort(([left], [right]) =>
        faces[right].reduce((sum, face) => sum + (faceCounts.get(face) ?? 0), 0) -
        faces[left].reduce((sum, face) => sum + (faceCounts.get(face) ?? 0), 0));
      add(feasible[0][0], feasible[0][1]);
    }
    if (!best || chosen.length > best.chosen.length) best = { chosen, orientations, faceCounts };
  }
  const localIndex = new Map(best.chosen.map((original, index) => [original, index]));
  const dualBonds = [];
  for (const [face, count] of best.faceCounts) if (count === 2) {
    const pair = faceCells.get(face).filter(index => localIndex.has(index));
    if (pair.length !== 2) throw new Error('internal face does not have exactly two selected cells');
    dualBonds.push({ i: localIndex.get(pair[0]), j: localIndex.get(pair[1]), w: 1, face });
  }
  const selectedCells = best.chosen.map(index => cells[index]);
  return {
    cells: selectedCells,
    originalCellIndices: best.chosen,
    orientations: best.chosen.map(index => best.orientations.get(index)),
    dualBonds,
    vertices: new Set(selectedCells.flat()).size,
    faceIncidenceHistogram: histogram([...best.faceCounts.values()]),
    connected: selectedCells.length > 0 && dualBonds.length >= selectedCells.length - 1,
    orientable: best.orientations.size === selectedCells.length,
    maximumFaceIncidence: Math.max(0, ...best.faceCounts.values())
  };
}

export function applyDualGraphHessian(amplitudes, bonds, stiffness = 1) {
  if (!Array.isArray(amplitudes) || amplitudes.some(value => !Number.isFinite(value))) {
    throw new RangeError('amplitudes must be finite');
  }
  if (!Number.isFinite(stiffness) || stiffness <= 0) throw new RangeError('stiffness must be positive');
  const result = Array(amplitudes.length).fill(0);
  for (const { i, j, w } of bonds) {
    if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 ||
        i >= amplitudes.length || j >= amplitudes.length || i === j || !Number.isFinite(w) || w < 0) {
      throw new RangeError('invalid dual bond');
    }
    const force = stiffness * w * (amplitudes[i] - amplitudes[j]);
    result[i] += force;
    result[j] -= force;
  }
  return result;
}

export function dualGraphQuadraticAction(amplitudes, bonds, stiffness = 1) {
  const hessianTimesVector = applyDualGraphHessian(amplitudes, bonds, stiffness);
  return 0.5 * amplitudes.reduce((sum, value, index) =>
    sum + value * hessianTimesVector[index], 0);
}

export function collectiveSpinTwoHessianAudit(world) {
  const fullComplex = tetrahedralIncidenceAudit(world);
  const manifold = extractOrientableManifoldSubcomplex(world);
  const count = manifold.cells.length;
  const uniform = Array(count).fill(1);
  const uniformResidual = Math.max(0, ...applyDualGraphHessian(uniform, manifold.dualBonds).map(Math.abs));
  const probe = Array.from({ length: count }, (_, index) =>
    Math.sin(0.37 * index) + 0.2 * Math.cos(0.11 * index));
  const probeAction = dualGraphQuadraticAction(probe, manifold.dualBonds);
  return {
    fullComplex,
    selectedManifold: {
      tetrahedralCells: count,
      vertices: manifold.vertices,
      internalFacesAndDualBonds: manifold.dualBonds.length,
      faceIncidenceHistogram: manifold.faceIncidenceHistogram,
      maximumFaceIncidence: manifold.maximumFaceIncidence,
      connected: manifold.connected,
      orientable: manifold.orientable
    },
    constrainedCollectiveAction:
      'S_TT = sum_A[ m/2 sum_C (dq_C^A/dt)^2 - k/2 sum_<CD> w_CD(q_C^A-q_D^A)^2 ], A in {plus,cross}',
    reusesCanonicalFpvDirichletForm: true,
    onSiteMassTerm: 0,
    physicalPolarizations: 2,
    exactUniformHessianResidual: uniformResidual,
    exactFlatDeformationAction: dualGraphQuadraticAction(uniform, manifold.dualBonds),
    nonconstantProbeAction: probeAction,
    twoIndependentMasslessUniformModes: uniformResidual === 0 && count > 0 ? 2 : 0,
    hessianPositiveSemidefiniteOnProbe: probeAction >= 0,
    manifoldSupportedMasslessTTSector:
      manifold.connected && manifold.orientable && manifold.maximumFaceIncidence <= 2 &&
      uniformResidual === 0 && probeAction >= 0,
    dynamicSelectionOfThisSubcomplexDerived: false,
    fullCanonicalHessianMatchingClosed: false
  };
}

export function canonicalCollectiveSpinTwoHessianAudit() {
  const world = new MicroActionWorld({ seed: 42 });
  world.run(400);
  return collectiveSpinTwoHessianAudit(world);
}
