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

function maximum(values, fallback = 0) {
  let result = fallback;
  for (const value of values) if (value > result) result = value;
  return result;
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
    maximumFaceIncidence: maximum(counts),
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
    maximumFaceIncidence: maximum(best.faceCounts.values())
  };
}

function connectedComponents(cellCount, bonds) {
  const adjacency = Array.from({ length: cellCount }, () => []);
  for (const bond of bonds) {
    adjacency[bond.i].push(bond.j);
    adjacency[bond.j].push(bond.i);
  }
  const seen = new Set();
  const components = [];
  for (let start = 0; start < cellCount; start++) if (!seen.has(start)) {
    const component = [start];
    seen.add(start);
    for (let cursor = 0; cursor < component.length; cursor++) {
      for (const next of adjacency[component[cursor]]) if (!seen.has(next)) {
        seen.add(next);
        component.push(next);
      }
    }
    components.push(component);
  }
  return components.sort((left, right) => right.length - left.length || left[0] - right[0]);
}

function canonicalCellBirthOrder(world, cells) {
  const linkBirth = new Map([...world.links.entries()].map(([key, edge]) => [key, edge.born]));
  const linkKey = (a, b) => a < b ? `${a}:${b}` : `${b}:${a}`;
  const birth = cell => {
    const ticks = [];
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
      const tick = linkBirth.get(linkKey(cell[i], cell[j]));
      if (!Number.isInteger(tick)) throw new Error('tetrahedral edge has no canonical birth tick');
      ticks.push(tick);
    }
    return Math.max(...ticks);
  };
  return cells.map((cell, index) => ({ index, birth: birth(cell), key: cell.join(':') }))
    .sort((left, right) => left.birth - right.birth || left.key.localeCompare(right.key));
}

function orientationRequirements(index, faces, faceCells, selected, orientations) {
  const requirements = [];
  for (let omitted = 0; omitted < 4; omitted++) {
    const face = faces[index][omitted];
    for (const neighbor of faceCells.get(face)) if (selected.has(neighbor)) {
      const neighborOmitted = faces[neighbor].indexOf(face);
      const parity = (omitted - neighborOmitted) % 2 === 0 ? 1 : -1;
      requirements.push(-orientations.get(neighbor) * parity);
    }
  }
  return requirements;
}

/** Parameter-free selection from canonical link-birth order. */
export function extractCausalManifoldSector(world) {
  const cells = tetrahedralCells(world);
  if (cells.length === 0) return {
    cells: [], originalCellIndices: [], orientations: [], dualBonds: [], vertices: 0,
    faceIncidenceHistogram: {}, connected: false, orientable: false,
    maximumFaceIncidence: 0, acceptedAcrossAllComponents: 0,
    acceptedOriginalCellIndices: [], componentSizes: [],
    selectionRule: 'canonical link-birth order; lexicographic tie break; face incidence <= 2; consistent induced orientation; largest face-connected sector',
    fittedParameters: 0,
    selectionRandomSeedUsed: false
  };
  const { faces, faceCells } = incidence(cells);
  const order = canonicalCellBirthOrder(world, cells);
  const selected = new Set();
  const orientations = new Map();
  const faceCounts = new Map();
  for (const { index } of order) {
    if (!faces[index].every(face => (faceCounts.get(face) ?? 0) < 2)) continue;
    const requirements = orientationRequirements(index, faces, faceCells, selected, orientations);
    if (requirements.length > 0 && !requirements.every(value => value === requirements[0])) continue;
    selected.add(index);
    orientations.set(index, requirements[0] ?? 1);
    for (const face of faces[index]) faceCounts.set(face, (faceCounts.get(face) ?? 0) + 1);
  }
  const accepted = [...selected];
  const acceptedLocal = new Map(accepted.map((original, index) => [original, index]));
  const acceptedBonds = [];
  for (const [face, count] of faceCounts) if (count === 2) {
    const pair = faceCells.get(face).filter(index => selected.has(index));
    if (pair.length === 2) acceptedBonds.push({
      i: acceptedLocal.get(pair[0]), j: acceptedLocal.get(pair[1]), w: 1, face
    });
  }
  const components = connectedComponents(accepted.length, acceptedBonds);
  const largest = components[0] ?? [];
  const retainedAcceptedIndices = new Set(largest);
  const retainedOriginal = largest.map(index => accepted[index]);
  const retainedLocal = new Map(retainedOriginal.map((original, index) => [original, index]));
  const retainedFaceCounts = new Map();
  for (const original of retainedOriginal) {
    for (const face of faces[original]) retainedFaceCounts.set(face, (retainedFaceCounts.get(face) ?? 0) + 1);
  }
  const dualBonds = acceptedBonds
    .filter(bond => retainedAcceptedIndices.has(bond.i) && retainedAcceptedIndices.has(bond.j))
    .map(bond => ({
      i: retainedLocal.get(accepted[bond.i]), j: retainedLocal.get(accepted[bond.j]), w: bond.w, face: bond.face
    }));
  const selectedCells = retainedOriginal.map(index => cells[index]);
  return {
    cells: selectedCells,
    originalCellIndices: retainedOriginal,
    orientations: retainedOriginal.map(index => orientations.get(index)),
    dualBonds,
    vertices: new Set(selectedCells.flat()).size,
    faceIncidenceHistogram: histogram([...retainedFaceCounts.values()]),
    connected: selectedCells.length > 0 && connectedComponents(selectedCells.length, dualBonds).length === 1,
    orientable: retainedOriginal.every(index => orientations.has(index)),
    maximumFaceIncidence: maximum(retainedFaceCounts.values()),
    acceptedAcrossAllComponents: accepted.length,
    acceptedOriginalCellIndices: accepted,
    componentSizes: components.map(component => component.length),
    selectionRule: 'canonical link-birth order; lexicographic tie break; face incidence <= 2; consistent induced orientation; largest face-connected sector',
    fittedParameters: 0,
    selectionRandomSeedUsed: false
  };
}

/**
 * Exact incremental variational characterization of the causal selector.
 * At each birth step, n in {0,1} and o in {-1,+1} minimize
 *   Delta S_i(n,o) = -n + I_admissible(n,o),
 * where the indicator is zero for the manifold/orientation constraints and
 * +infinity otherwise.  This closes the variational form of the update rule;
 * it does not claim that the indicator action has already been derived from
 * the original continuous SubQG microaction.
 */
export function causalSelectionVariationalAudit(world) {
  const cells = tetrahedralCells(world);
  const { faces, faceCells } = incidence(cells);
  const order = canonicalCellBirthOrder(world, cells);
  const selected = new Set();
  const orientations = new Map();
  const faceCounts = new Map();
  let rejectedByFaceCapacity = 0;
  let rejectedByOrientationFrustration = 0;
  let freeOrientationGaugeChoices = 0;
  let forcedOrientationChoices = 0;
  let everyDecisionMinimizesIncrementalAction = true;
  let everyDecisionMinimizesFinitePenaltyAction = true;
  let cumulativeIncrementalAction = 0;
  for (const { index } of order) {
    const faceAdmissible = faces[index].every(face => (faceCounts.get(face) ?? 0) < 2);
    const requirements = orientationRequirements(index, faces, faceCells, selected, orientations);
    const plusAdmissible = faceAdmissible && requirements.every(value => value === 1);
    const minusAdmissible = faceAdmissible && requirements.every(value => value === -1);
    const saturatedFaceViolations = faces[index]
      .reduce((sum, face) => sum + ((faceCounts.get(face) ?? 0) >= 2 ? 1 : 0), 0);
    const orientationViolation = orientation => requirements
      .reduce((sum, required) => sum + (required === orientation ? 0 : 1), 0);
    const minimumViolation = saturatedFaceViolations + Math.min(
      orientationViolation(1), orientationViolation(-1));
    const includeMinimum = plusAdmissible || minusAdmissible ? -1 : Number.POSITIVE_INFINITY;
    const finitePenaltyIncludeAction = -1 + 2 * minimumViolation;
    const excludeAction = 0;
    const include = includeMinimum < excludeAction;
    if (!include) {
      if (!faceAdmissible) rejectedByFaceCapacity++;
      else rejectedByOrientationFrustration++;
      everyDecisionMinimizesIncrementalAction &&= excludeAction <= includeMinimum;
      everyDecisionMinimizesFinitePenaltyAction &&= excludeAction < finitePenaltyIncludeAction;
      continue;
    }
    const orientation = requirements[0] ?? 1;
    everyDecisionMinimizesIncrementalAction &&=
      (orientation === 1 ? plusAdmissible : minusAdmissible) && includeMinimum === -1;
    everyDecisionMinimizesFinitePenaltyAction &&= finitePenaltyIncludeAction < excludeAction;
    if (requirements.length === 0) freeOrientationGaugeChoices++;
    else forcedOrientationChoices++;
    selected.add(index);
    orientations.set(index, orientation);
    cumulativeIncrementalAction += includeMinimum;
    for (const face of faces[index]) faceCounts.set(face, (faceCounts.get(face) ?? 0) + 1);
  }
  const extracted = extractCausalManifoldSector(world);
  return {
    incrementalAction: 'Delta S_i(n_i,o_i) = -n_i + I_admissible(n_i,o_i), n_i in {0,1}, o_i in {-1,+1}',
    finiteLocalPenaltyAction:
      'Delta S_i^Lambda = -n_i + Lambda*n_i*[sum_f 1(c_f>=2) + sum_shared (1-o_i*r_ij)/2]',
    exactPenaltyCondition: 'Lambda > 1 because every forbidden inclusion has an integer violation count V_i >= 1',
    auditedFinitePenaltyLambda: 2,
    admissibilityIndicator:
      'I=0 iff every triangular face has incidence <=2 and every shared face has opposite induced orientation; otherwise I=+infinity',
    updateOrder: 'canonical link-birth tick, then lexicographic cell key',
    tetrahedralCellsConsidered: cells.length,
    acceptedCells: selected.size,
    rejectedCells: cells.length - selected.size,
    rejectedByFaceCapacity,
    rejectedByOrientationFrustration,
    freeOrientationGaugeChoices,
    forcedOrientationChoices,
    cumulativeIncrementalAction,
    everyDecisionMinimizesIncrementalAction,
    everyDecisionMinimizesFinitePenaltyAction,
    hardIndicatorIsInfinitePenaltyLimit: true,
    selectionMatchesCausalExtractor:
      selected.size === extracted.acceptedOriginalCellIndices.length &&
      [...selected].every((value, index) => value === extracted.acceptedOriginalCellIndices[index]),
    fittedParameters: 0,
    variationalCharacterizationClosed:
      everyDecisionMinimizesIncrementalAction &&
      everyDecisionMinimizesFinitePenaltyAction &&
      selected.size === extracted.acceptedOriginalCellIndices.length &&
      [...selected].every((value, index) => value === extracted.acceptedOriginalCellIndices[index]),
    derivedFromOriginalContinuousMicroaction: false
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
  const manifold = extractCausalManifoldSector(world);
  const selectionVariation = causalSelectionVariationalAudit(world);
  const microscopicSelectionNoGo = world.topologySelectionNoGoAudit();
  const count = manifold.cells.length;
  const uniform = Array(count).fill(1);
  const uniformResidual = Math.max(0, ...applyDualGraphHessian(uniform, manifold.dualBonds).map(Math.abs));
  const probe = Array.from({ length: count }, (_, index) =>
    Math.sin(0.37 * index) + 0.2 * Math.cos(0.11 * index));
  const probeAction = dualGraphQuadraticAction(probe, manifold.dualBonds);
  return {
    fullComplex,
    selectedManifold: {
      selectionRule: manifold.selectionRule,
      fittedParameters: manifold.fittedParameters,
      selectionRandomSeedUsed: manifold.selectionRandomSeedUsed,
      acceptedAcrossAllComponents: manifold.acceptedAcrossAllComponents,
      componentSizes: manifold.componentSizes,
      tetrahedralCells: count,
      vertices: manifold.vertices,
      internalFacesAndDualBonds: manifold.dualBonds.length,
      faceIncidenceHistogram: manifold.faceIncidenceHistogram,
      maximumFaceIncidence: manifold.maximumFaceIncidence,
      connected: manifold.connected,
      orientable: manifold.orientable
    },
    selectionVariation,
    microscopicSelectionNoGo,
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
    causalParameterFreeSelectionImplemented:
      manifold.fittedParameters === 0 && !manifold.selectionRandomSeedUsed,
    selectionRuleHasExactIncrementalVariationalForm: selectionVariation.variationalCharacterizationClosed,
    selectionRuleDerivedFromOriginalContinuousMicroaction:
      selectionVariation.derivedFromOriginalContinuousMicroaction,
    fullCanonicalHessianMatchingClosed: false
  };
}

export function canonicalCollectiveSpinTwoHessianAudit() {
  const world = new MicroActionWorld({ seed: 42 });
  world.run(400);
  return collectiveSpinTwoHessianAudit(world);
}
