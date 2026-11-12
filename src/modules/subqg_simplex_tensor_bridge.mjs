function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

function symmetricThree(name, matrix) {
  if (!Array.isArray(matrix) || matrix.length !== 3) throw new RangeError(`${name} must be 3x3`);
  for (let i = 0; i < 3; i++) {
    if (!Array.isArray(matrix[i]) || matrix[i].length !== 3) throw new RangeError(`${name} must be 3x3`);
    for (let j = 0; j < 3; j++) finite(`${name}[${i}][${j}]`, matrix[i][j]);
    for (let j = 0; j < 3; j++) {
      if (Math.abs(matrix[i][j] - matrix[j][i]) > 1e-12) throw new RangeError(`${name} must be symmetric`);
    }
  }
}

const KEYS = Object.freeze(['d01', 'd02', 'd03', 'd12', 'd13', 'd23']);

function sixFinite(name, values, { positive = false } = {}) {
  if (!values || typeof values !== 'object') throw new RangeError(`${name} must contain six components`);
  for (const key of KEYS) {
    finite(`${name}.${key}`, values[key]);
    if (positive && values[key] <= 0) throw new RangeError(`${name}.${key} must be positive`);
  }
}

/**
 * Coordinate-free simplex identity.  For three edge vectors from vertex 0,
 * the six squared edge lengths of a tetrahedron determine their Gram metric:
 * G_ij = (d_0i + d_0j - d_ij)/2.
 */
export function tetrahedronGramFromSquaredLengths(squaredLengths) {
  sixFinite('squaredLengths', squaredLengths, { positive: true });
  const { d01, d02, d03, d12, d13, d23 } = squaredLengths;
  return [
    [d01, (d01 + d02 - d12) / 2, (d01 + d03 - d13) / 2],
    [(d01 + d02 - d12) / 2, d02, (d02 + d03 - d23) / 2],
    [(d01 + d03 - d13) / 2, (d02 + d03 - d23) / 2, d03]
  ];
}

/** Exact inverse of tetrahedronGramFromSquaredLengths. */
export function tetrahedronSquaredLengthsFromGram(gram) {
  symmetricThree('gram', gram);
  return {
    d01: gram[0][0],
    d02: gram[1][1],
    d03: gram[2][2],
    d12: gram[0][0] + gram[1][1] - 2 * gram[0][1],
    d13: gram[0][0] + gram[2][2] - 2 * gram[0][2],
    d23: gram[1][1] + gram[2][2] - 2 * gram[1][2]
  };
}

/** Linearized version; perturbations may have either sign. */
export function metricPerturbationFromSquaredLengthPerturbations(delta) {
  sixFinite('delta', delta);
  const { d01, d02, d03, d12, d13, d23 } = delta;
  return [
    [d01, (d01 + d02 - d12) / 2, (d01 + d03 - d13) / 2],
    [(d01 + d02 - d12) / 2, d02, (d02 + d03 - d23) / 2],
    [(d01 + d03 - d13) / 2, (d02 + d03 - d23) / 2, d03]
  ];
}

/** Exact inverse linear map from a local symmetric metric perturbation. */
export function squaredLengthPerturbationsFromMetric(deltaMetric) {
  symmetricThree('deltaMetric', deltaMetric);
  return tetrahedronSquaredLengthsFromGram(deltaMetric);
}

export function tetrahedralCells(world) {
  if (!world || !Array.isArray(world.nodes) || !world.links || typeof world.links.values !== 'function') {
    throw new TypeError('world must expose nodes and undirected links');
  }
  const adjacency = Array.from({ length: world.nodes.length }, () => new Set());
  for (const edge of world.links.values()) {
    if (!Number.isInteger(edge.a) || !Number.isInteger(edge.b) || !adjacency[edge.a] || !adjacency[edge.b]) {
      throw new RangeError('link endpoint outside node set');
    }
    adjacency[edge.a].add(edge.b);
    adjacency[edge.b].add(edge.a);
  }
  const cells = [];
  for (let a = 0; a < adjacency.length; a++) {
    for (const b of adjacency[a]) if (b > a) {
      for (const c of adjacency[a]) if (c > b && adjacency[b].has(c)) {
        for (const d of adjacency[a]) if (d > c && adjacency[b].has(d) && adjacency[c].has(d)) {
          cells.push([a, b, c, d]);
        }
      }
    }
  }
  return cells;
}

export function tetrahedralCliques(world, { exampleLimit = 8 } = {}) {
  if (!Number.isInteger(exampleLimit) || exampleLimit < 0) throw new RangeError('exampleLimit must be a nonnegative integer');
  const cells = tetrahedralCells(world);
  return { count: cells.length, examples: cells.slice(0, exampleLimit) };
}

export function simplexTensorKinematicsAudit(world) {
  const cells = tetrahedralCliques(world);
  const probe = [
    [0.2, 0.03, -0.04],
    [0.03, -0.1, 0.05],
    [-0.04, 0.05, -0.1]
  ];
  const encoded = squaredLengthPerturbationsFromMetric(probe);
  const reconstructed = metricPerturbationFromSquaredLengthPerturbations(encoded);
  const maxRoundTripResidual = Math.max(...probe.flatMap((row, i) =>
    row.map((value, j) => Math.abs(value - reconstructed[i][j]))));
  return {
    relationalConstruction: 'tetrahedron Gram metric from six squared edge lengths',
    ambientCoordinatesRequired: false,
    tetrahedralCliques: cells.count,
    examples: cells.examples,
    scalarEdgeComponentsPerCell: 6,
    independentSymmetricSpatialMetricComponents: 6,
    edgeToMetricLinearMapDeterminant: -1 / 8,
    exactLinearMapInvertible: true,
    maxRoundTripResidual,
    localSymmetricTensorKinematicsDerived: cells.count > 0 && maxRoundTripResidual < 1e-12,
    newFundamentalDegreesOfFreedomAdded: false,
    masslessGaugeDynamicsDerived: false,
    spacetimeSpinTwoMatchingComplete: false
  };
}
