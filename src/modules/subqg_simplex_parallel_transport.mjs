import { extractCausalManifoldSector } from './subqg_collective_spin2_hessian.mjs';
import { tensorPolarizationBasis } from './subqg_simplex_gauge_bridge.mjs';
import { MicroActionWorld } from './subqg_microaction.mjs';

const subtractVector = (a, b) => a.map((value, i) => value - b[i]);
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const unit = value => {
  const length = Math.hypot(...value);
  if (!(length > 0)) throw new RangeError('cannot normalize zero vector');
  return value.map(component => component / length);
};
const transpose = matrix => matrix[0].map((_, j) => matrix.map(row => row[j]));
const multiply = (a, b) => a.map(row => b[0].map((_, j) =>
  row.reduce((sum, value, k) => sum + value * b[k][j], 0)));
const matrixVector = (matrix, vector) => matrix.map(row => dot(row, vector));
const determinant3 = matrix =>
  matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
  matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
  matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
const maxAbs = values => Math.max(0, ...values.flat(Infinity).map(Math.abs));
const tensorInner = (a, b) => a.flat().reduce((sum, value, index) => sum + value * b.flat()[index], 0);
const identity3 = () => [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

function directedBondRotation(sector, bond, from, to) {
  if (!((from === bond.i && to === bond.j) || (from === bond.j && to === bond.i))) {
    throw new RangeError('directed transport must follow the selected dual bond');
  }
  return sharedFaceFrameTransport(
    sector.cells[to], sector.orientations[to],
    sector.cells[from], sector.orientations[from], bond.face
  ).rotationBToA;
}

function treePath(treeAdjacency, start, end) {
  const parent = Array(treeAdjacency.length).fill(-1);
  const queue = [start];
  parent[start] = start;
  for (let cursor = 0; cursor < queue.length && parent[end] < 0; cursor++) {
    for (const next of treeAdjacency[queue[cursor]]) if (parent[next] < 0) {
      parent[next] = queue[cursor];
      queue.push(next);
    }
  }
  if (parent[end] < 0) throw new Error('spanning tree does not connect the dual sector');
  const path = [end];
  while (path.at(-1) !== start) path.push(parent[path.at(-1)]);
  return path.reverse();
}

function rotationAxis(rotation, angle) {
  if (angle < 1e-10) return [1, 0, 0];
  const antisymmetric = [
    rotation[2][1] - rotation[1][2],
    rotation[0][2] - rotation[2][0],
    rotation[1][0] - rotation[0][1]
  ];
  if (Math.hypot(...antisymmetric) > 1e-10) return unit(antisymmetric);
  const shifted = rotation.map((row, i) => row.map((value, j) => value - (i === j ? 1 : 0)));
  const candidates = [
    cross(shifted[0], shifted[1]),
    cross(shifted[0], shifted[2]),
    cross(shifted[1], shifted[2])
  ].sort((left, right) => Math.hypot(...right) - Math.hypot(...left));
  return unit(candidates[0]);
}

export function orientedRegularTetrahedronCoordinates(orientation = 1) {
  if (![1, -1].includes(orientation)) throw new RangeError('orientation must be +1 or -1');
  const root3 = Math.sqrt(3);
  return [
    [0, 0, 0],
    [1, 0, 0],
    [0.5, root3 / 2, 0],
    [0.5, 1 / (2 * root3), orientation * Math.sqrt(2 / 3)]
  ];
}

function faceFrame(points) {
  const first = unit(subtractVector(points[1], points[0]));
  const rawSecond = subtractVector(points[2], points[0]);
  const second = unit(rawSecond.map((value, i) => value - dot(rawSecond, first) * first[i]));
  const normal = unit(cross(first, second));
  return transpose([first, second, normal]);
}

/** SO(3) map taking vectors in cell B's local frame into cell A's frame. */
export function sharedFaceFrameTransport(cellA, orientationA, cellB, orientationB, face) {
  if (!Array.isArray(cellA) || cellA.length !== 4 || !Array.isArray(cellB) || cellB.length !== 4) {
    throw new RangeError('cells must contain four vertices');
  }
  const vertices = typeof face === 'string' ? face.split(':').map(Number) : face;
  if (!Array.isArray(vertices) || vertices.length !== 3 ||
      vertices.some(vertex => !cellA.includes(vertex) || !cellB.includes(vertex))) {
    throw new RangeError('face must be shared by both cells');
  }
  const coordinatesA = orientedRegularTetrahedronCoordinates(orientationA);
  const coordinatesB = orientedRegularTetrahedronCoordinates(orientationB);
  const pointsA = vertices.map(vertex => coordinatesA[cellA.indexOf(vertex)]);
  const pointsB = vertices.map(vertex => coordinatesB[cellB.indexOf(vertex)]);
  const frameA = faceFrame(pointsA);
  const frameB = faceFrame(pointsB);
  const rotationBToA = multiply(frameA, transpose(frameB));
  const orthogonality = multiply(rotationBToA, transpose(rotationBToA));
  const identity = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const faceMatchResidual = Math.max(...vertices.slice(1).flatMap((_, index) => {
    const deltaA = subtractVector(pointsA[index + 1], pointsA[0]);
    const deltaB = subtractVector(pointsB[index + 1], pointsB[0]);
    const mapped = matrixVector(rotationBToA, deltaB);
    return mapped.map((value, component) => Math.abs(value - deltaA[component]));
  }));
  return {
    rotationBToA,
    determinant: determinant3(rotationBToA),
    orthogonalityResidual: maxAbs(orthogonality.map((row, i) =>
      row.map((value, j) => value - identity[i][j]))),
    faceMatchResidual
  };
}

export function spinTwoFrameTransport(rotationBToA, directionInA = [0.3, -0.4, 0.5]) {
  const directionA = unit(directionInA);
  const directionB = matrixVector(transpose(rotationBToA), directionA);
  const basisA = tensorPolarizationBasis(directionA);
  const basisB = tensorPolarizationBasis(directionB);
  const transportedB = [basisB.plus, basisB.cross].map(tensor =>
    multiply(multiply(rotationBToA, tensor), transpose(rotationBToA)));
  const mixing = [basisA.plus, basisA.cross].map(target =>
    transportedB.map(source => tensorInner(target, source) / 2));
  const orthogonality = multiply(mixing, transpose(mixing));
  return {
    directionInA: directionA,
    directionInB: directionB,
    polarizationMixingBToA: mixing,
    mixingDeterminant: mixing[0][0] * mixing[1][1] - mixing[0][1] * mixing[1][0],
    mixingOrthogonalityResidual: maxAbs([
      [orthogonality[0][0] - 1, orthogonality[0][1]],
      [orthogonality[1][0], orthogonality[1][1] - 1]
    ])
  };
}

/**
 * Gauge-invariant connection audit on a deterministic fundamental-cycle basis.
 * Non-identity loop holonomy is path dependence and therefore discrete curvature,
 * not a transport failure. This does not yet identify the holonomy with an
 * Einstein/Regge curvature tensor or fix its physical length scale.
 */
export function canonicalDualHolonomyAudit(world) {
  const sector = extractCausalManifoldSector(world);
  const vertexCount = sector.cells.length;
  const adjacency = Array.from({ length: vertexCount }, () => []);
  sector.dualBonds.forEach((bond, edge) => {
    adjacency[bond.i].push({ vertex: bond.j, edge });
    adjacency[bond.j].push({ vertex: bond.i, edge });
  });
  const parent = Array(vertexCount).fill(-1);
  const treeEdges = new Set();
  if (vertexCount > 0) {
    const queue = [0];
    parent[0] = 0;
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      const ordered = [...adjacency[current]].sort((a, b) => a.vertex - b.vertex || a.edge - b.edge);
      for (const next of ordered) if (parent[next.vertex] < 0) {
        parent[next.vertex] = current;
        treeEdges.add(next.edge);
        queue.push(next.vertex);
      }
    }
  }
  const connected = vertexCount > 0 && parent.every(value => value >= 0);
  const treeAdjacency = Array.from({ length: vertexCount }, () => []);
  for (const edge of treeEdges) {
    const bond = sector.dualBonds[edge];
    treeAdjacency[bond.i].push(bond.j);
    treeAdjacency[bond.j].push(bond.i);
  }
  const loops = [];
  sector.dualBonds.forEach((closingBond, edge) => {
    if (treeEdges.has(edge)) return;
    const vertices = treePath(treeAdjacency, closingBond.i, closingBond.j);
    let holonomy = identity3();
    for (let index = 0; index + 1 < vertices.length; index++) {
      const from = vertices[index];
      const to = vertices[index + 1];
      const treeEdge = adjacency[from].find(item => item.vertex === to && treeEdges.has(item.edge));
      holonomy = multiply(directedBondRotation(sector, sector.dualBonds[treeEdge.edge], from, to), holonomy);
    }
    holonomy = multiply(
      directedBondRotation(sector, closingBond, closingBond.j, closingBond.i), holonomy);
    const trace = holonomy[0][0] + holonomy[1][1] + holonomy[2][2];
    const angle = Math.acos(Math.max(-1, Math.min(1, (trace - 1) / 2)));
    const axis = rotationAxis(holonomy, angle);
    const orthogonality = multiply(holonomy, transpose(holonomy));
    const orthogonalityResidual = maxAbs(orthogonality.map((row, i) =>
      row.map((value, j) => value - (i === j ? 1 : 0))));
    const determinantError = Math.abs(determinant3(holonomy) - 1);
    const spinTwo = spinTwoFrameTransport(holonomy, axis);
    const spinTwoDoubleAngleResidual = Math.abs(
      (spinTwo.polarizationMixingBToA[0][0] + spinTwo.polarizationMixingBToA[1][1]) / 2 -
      Math.cos(2 * angle)
    );
    loops.push({
      closingDualBond: edge,
      dualEdges: vertices.length,
      angleRadians: angle,
      trace,
      axis,
      orthogonalityResidual,
      determinantError,
      spinTwoDoubleAngleResidual
    });
  });
  const angles = loops.map(loop => loop.angleRadians);
  const nontrivial = loops.filter(loop => loop.angleRadians > 1e-10);
  const maximumSO3ClosureResidual = Math.max(0, ...loops.map(loop =>
    Math.max(loop.orthogonalityResidual, loop.determinantError)));
  const maximumSpinTwoDoubleAngleResidual = Math.max(0, ...loops.map(loop => loop.spinTwoDoubleAngleResidual));
  return {
    selectedCells: vertexCount,
    dualBonds: sector.dualBonds.length,
    connected,
    spanningTreeEdges: treeEdges.size,
    cycleRank: sector.dualBonds.length - vertexCount + (connected ? 1 : 0),
    fundamentalLoopsTested: loops.length,
    nontrivialHolonomies: nontrivial.length,
    trivialHolonomies: loops.length - nontrivial.length,
    minimumHolonomyAngleRadians: angles.length > 0 ? Math.min(...angles) : 0,
    maximumHolonomyAngleRadians: Math.max(0, ...angles),
    meanHolonomyAngleRadians: angles.length > 0 ? angles.reduce((sum, value) => sum + value, 0) / angles.length : 0,
    maximumSO3ClosureResidual,
    maximumSpinTwoDoubleAngleResidual,
    holonomyConnectionMathematicallyClosed:
      connected && loops.length > 0 && loops.length === sector.dualBonds.length - vertexCount + 1 &&
      maximumSO3ClosureResidual < 1e-12 && maximumSpinTwoDoubleAngleResidual < 1e-12,
    nontrivialDiscreteCurvatureDetected: nontrivial.length > 0,
    globallyPathIndependent: nontrivial.length === 0,
    pathDependenceInterpretation: 'non-identity closed-loop holonomy is the discrete curvature observable',
    einsteinReggeCurvatureMatchingDerived: false,
    loops
  };
}

export function canonicalSimplexParallelTransportAudit(world) {
  const sector = extractCausalManifoldSector(world);
  let maximumFrameOrthogonalityResidual = 0;
  let maximumFrameDeterminantError = 0;
  let maximumFaceMatchResidual = 0;
  let maximumPolarizationOrthogonalityResidual = 0;
  let maximumPolarizationDeterminantError = 0;
  for (const bond of sector.dualBonds) {
    const frame = sharedFaceFrameTransport(
      sector.cells[bond.i], sector.orientations[bond.i],
      sector.cells[bond.j], sector.orientations[bond.j], bond.face);
    const spinTwo = spinTwoFrameTransport(frame.rotationBToA);
    maximumFrameOrthogonalityResidual = Math.max(maximumFrameOrthogonalityResidual, frame.orthogonalityResidual);
    maximumFrameDeterminantError = Math.max(maximumFrameDeterminantError, Math.abs(frame.determinant - 1));
    maximumFaceMatchResidual = Math.max(maximumFaceMatchResidual, frame.faceMatchResidual);
    maximumPolarizationOrthogonalityResidual = Math.max(
      maximumPolarizationOrthogonalityResidual, spinTwo.mixingOrthogonalityResidual);
    maximumPolarizationDeterminantError = Math.max(
      maximumPolarizationDeterminantError, Math.abs(spinTwo.mixingDeterminant - 1));
  }
  return {
    selectedCells: sector.cells.length,
    sharedFacesTested: sector.dualBonds.length,
    construction: 'orientation-preserving SO(3) face-frame transport and induced two-polarization spin-2 transport',
    maximumFrameOrthogonalityResidual,
    maximumFrameDeterminantError,
    maximumFaceMatchResidual,
    maximumPolarizationOrthogonalityResidual,
    maximumPolarizationDeterminantError,
    localFrameTransportClosed:
      sector.dualBonds.length > 0 && maximumFrameOrthogonalityResidual < 1e-12 &&
      maximumFrameDeterminantError < 1e-12 && maximumFaceMatchResidual < 1e-12,
    spinTwoNormPreservingTransportClosed:
      maximumPolarizationOrthogonalityResidual < 1e-12 && maximumPolarizationDeterminantError < 1e-12,
    closedLoopHolonomyIncludedInThisLocalAudit: false,
    globalPathIndependenceExpectedInCurvedSector: false
  };
}

export function canonicalDualHolonomyAuditDefault() {
  const world = new MicroActionWorld({ seed: 42 });
  world.run(400);
  return canonicalDualHolonomyAudit(world);
}

export function canonicalSimplexParallelTransportAuditDefault() {
  const world = new MicroActionWorld({ seed: 42 });
  world.run(400);
  return canonicalSimplexParallelTransportAudit(world);
}
