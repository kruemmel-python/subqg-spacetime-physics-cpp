import { deriveGaugeReducedPhaseSpaceClosure } from './subqg_substrate_clustering.mjs';

const C_KM_PER_SECOND = 299792.458;
const PHOTON_DENSITY_H2_AT_2_7255_K = 2.469e-5;
const PLANCK_ACOUSTIC_SCALE_100 = 1.04110;
const PLANCK_ACOUSTIC_SCALE_SIGMA_100 = 0.00031;

// Polynomial surrogates along the frozen SubQG closure
// Omega_network/Omega_b = 6/1.12.  The acoustic-angle surface was trained on
// 143 CAMB points and checked on a disjoint 120-point grid over
// 0.019 <= omega_b <= 0.025 and 60 <= H0 <= 80.  The one-dimensional sound
// horizons depend on the physical early-time densities, not independently on
// H0.  x is (omega_b - 0.022)/0.003.
// This is a numerical evaluator of standard photon-baryon thermodynamics,
// not a fitted SubQG parameter or a particle-dark-matter assumption.
const RECOMBINATION_SURROGATE = Object.freeze({
  physicalBaryonDensityRange: [0.019, 0.025],
  hubbleConstantRange: [60, 80],
  lastScatteringRedshift: [-0.0009672761722664406, 0.004206199784396376,
    -0.03478177009979536, 0.283525523950148, -2.4381698458092376,
    1090.1909479483943],
  lastScatteringSoundHorizonMpc: [-0.000027313509090903,
    0.00136368655137676, -0.02287245532977335, 0.37333982861422815,
    -6.527704512481928, 145.27404233709638],
  acousticAngleTerms: [[0, 0], [0, 1], [1, 0], [0, 2], [1, 1], [2, 0],
    [0, 3], [1, 2], [2, 1], [3, 0], [0, 4], [1, 3], [2, 2], [3, 1], [4, 0]],
  acousticAngle100: [1.0476597729180468, 0.02950377112839254,
    0.00941608520022003, -0.000871075212832341, -0.0005302139109603506,
    -0.0019275367584340938, 0.00004504052646833004,
    0.00003533522815296074, -0.000010727527245102864,
    0.00022514684586515623, -0.000002610602654275554,
    -0.0000028684678038961447, -0.0000010886136019572223,
    0.000003869485619239159, -0.000024755420120425864],
  dragSoundHorizonMpc: [-0.0006293175877626142, 0.004201116863181056,
    -0.043412519053438715, 0.5391856053578561, -7.7117367396652865,
    148.0781030592048],
  maximumRelativeGridError: 1.1e-6
});

function evaluatePolynomial(coefficients, x) {
  return coefficients.reduce((value, coefficient) => value * x + coefficient, 0);
}

function evaluateAcousticAngleSurrogate(physicalBaryonDensity, hubbleConstant) {
  const x = (physicalBaryonDensity - 0.022) / 0.003;
  const y = (hubbleConstant - 70) / 10;
  return RECOMBINATION_SURROGATE.acousticAngle100.reduce((sum, coefficient, index) => {
    const [xPower, yPower] = RECOMBINATION_SURROGATE.acousticAngleTerms[index];
    return sum + coefficient * x ** xPower * y ** yPower;
  }, 0);
}

function onFrozenSubQGClosureLine(background) {
  return Math.abs(background.lambdaRatio - 1.12) < 1e-12 &&
    Math.abs((background.omegaMatter - background.omegaMassiveNeutrino) /
      background.omegaB - (1 + 6 / 1.12)) < 1e-12;
}

function simpsonIntegral(fn, lower, upper, intervals = 8192) {
  if (!Number.isFinite(lower) || !Number.isFinite(upper) || upper < lower ||
      !Number.isInteger(intervals) || intervals < 2) {
    throw new RangeError('invalid integration controls');
  }
  if (lower === upper) return 0;
  const n = intervals % 2 === 0 ? intervals : intervals + 1;
  const step = (upper - lower) / n;
  let sum = fn(lower) + fn(upper);
  for (let index = 1; index < n; index++) {
    sum += (index % 2 === 0 ? 2 : 4) * fn(lower + index * step);
  }
  return sum * step / 3;
}

function darkEnergyScale(a, w0, wa) {
  return a ** (-3 * (1 + w0 + wa)) * Math.exp(-3 * wa * (1 - a));
}

/**
 * Effective homogeneous fluid description of the already derived SubQG
 * sectors.  It does not introduce a particle dark-matter component: the
 * pressureless network contribution is fixed by the gauge-reduced 6/lambda
 * closure.  The physical baryon density is an external BBN calibration.
 */
export function deriveSubQGFluidBackground({
  lambdaRatio = 1.12,
  omegaB = null,
  hubbleConstantKmPerSecMpc = 70,
  physicalBaryonDensity = 0.02218,
  physicalBaryonDensitySigma = 0.00055,
  cmbTemperatureKelvin = 2.7255,
  effectiveRelativisticSpecies = 3.046,
  physicalMassiveNeutrinoDensity = 0.000644,
  w0 = -1,
  wa = 0
} = {}) {
  for (const [name, value] of Object.entries({
    lambdaRatio, physicalBaryonDensity, physicalBaryonDensitySigma,
    cmbTemperatureKelvin, effectiveRelativisticSpecies,
    physicalMassiveNeutrinoDensity, hubbleConstantKmPerSecMpc, w0, wa
  })) {
    if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  }
  if (lambdaRatio <= 1 || physicalBaryonDensity <= 0 ||
      physicalBaryonDensitySigma <= 0 || cmbTemperatureKelvin <= 0 ||
      effectiveRelativisticSpecies < 0 || physicalMassiveNeutrinoDensity < 0 ||
      hubbleConstantKmPerSecMpc <= 0 ||
      (omegaB !== null && (!Number.isFinite(omegaB) || omegaB <= 0))) {
    throw new RangeError('invalid SubQG background controls');
  }
  const closure = deriveGaugeReducedPhaseSpaceClosure({ lambdaRatio });
  const legacyOmegaBParameterization = omegaB !== null;
  const h = legacyOmegaBParameterization
    ? Math.sqrt(physicalBaryonDensity / omegaB)
    : hubbleConstantKmPerSecMpc / 100;
  const resolvedHubbleConstant = 100 * h;
  const resolvedOmegaB = physicalBaryonDensity / h ** 2;
  const omegaSubEffective = resolvedOmegaB * closure.networkExcitationEnergyRatio;
  const omegaMassiveNeutrino = physicalMassiveNeutrinoDensity / h ** 2;
  const omegaMatter = resolvedOmegaB + omegaSubEffective + omegaMassiveNeutrino;
  const physicalPhotonDensity = PHOTON_DENSITY_H2_AT_2_7255_K *
    (cmbTemperatureKelvin / 2.7255) ** 4;
  const omegaPhoton = physicalPhotonDensity / h ** 2;
  const massiveNeutrinoEffectiveSpecies = physicalMassiveNeutrinoDensity > 0
    ? effectiveRelativisticSpecies / 3
    : 0;
  const masslessRelativisticSpecies = effectiveRelativisticSpecies -
    massiveNeutrinoEffectiveSpecies;
  const omegaMasslessRadiation = omegaPhoton *
    (1 + 0.22710731766 * masslessRelativisticSpecies);
  const omegaMassiveNeutrinoRelativistic = omegaPhoton * 0.22710731766 *
    massiveNeutrinoEffectiveSpecies;
  const neutrinoTransitionScaleFactor = omegaMassiveNeutrino > 0
    ? omegaMassiveNeutrinoRelativistic / omegaMassiveNeutrino
    : 0;
  const omegaRadiation = omegaMasslessRadiation +
    omegaMassiveNeutrinoRelativistic;
  const omegaVacuum = 1 - omegaMatter - omegaMasslessRadiation;
  if (!(omegaVacuum > 0)) throw new RangeError('flat closure leaves no positive vacuum sector');

  const expansionRateSquared = a => {
    if (!Number.isFinite(a) || a <= 0) throw new RangeError('scale factor must be positive');
    const massiveNeutrinoScale = omegaMassiveNeutrino === 0 ? 0 :
      omegaMassiveNeutrino / a ** 3 *
      Math.sqrt(1 + (neutrinoTransitionScaleFactor / a) ** 2) /
      Math.sqrt(1 + neutrinoTransitionScaleFactor ** 2);
    const clusteringMatter = omegaMatter - omegaMassiveNeutrino;
    return omegaMasslessRadiation / a ** 4 + clusteringMatter / a ** 3 +
      massiveNeutrinoScale +
      omegaVacuum * darkEnergyScale(a, w0, wa);
  };
  const expansionRate = a => Math.sqrt(expansionRateSquared(a));
  const hubbleRatioAtRedshift = z => {
    if (!Number.isFinite(z) || z < 0) throw new RangeError('redshift must be non-negative');
    return expansionRate(1 / (1 + z));
  };
  const comovingDistanceMpc = z => {
    if (!Number.isFinite(z) || z < 0) throw new RangeError('redshift must be non-negative');
    const lower = 1 / (1 + z);
    return C_KM_PER_SECOND / resolvedHubbleConstant *
      simpsonIntegral(a => 1 / (a * a * expansionRate(a)), lower, 1);
  };
  const hubbleDistanceMpc = z => C_KM_PER_SECOND /
    (resolvedHubbleConstant * hubbleRatioAtRedshift(z));
  const volumeDistanceMpc = z => {
    const dm = comovingDistanceMpc(z);
    const dh = hubbleDistanceMpc(z);
    return (z * dm * dm * dh) ** (1 / 3);
  };
  return {
    schemaVersion: 1,
    ontology: 'SubQG pressureless phase-network fluid plus baryonic solitons; no particle dark-matter component',
    targetCosmologyUsed: false,
    bbnCalibration: {
      physicalBaryonDensity,
      physicalBaryonDensitySigma
    },
    lambdaRatio,
    networkToBaryonEnergyRatio: closure.networkExcitationEnergyRatio,
    omegaB: resolvedOmegaB,
    omegaSubEffective,
    omegaMassiveNeutrino,
    physicalMassiveNeutrinoDensity,
    omegaMatter,
    omegaPhoton,
    omegaRadiation,
    omegaMasslessRadiation,
    omegaMassiveNeutrinoRelativistic,
    neutrinoTransitionScaleFactor,
    omegaVacuum,
    h,
    hubbleConstantKmPerSecMpc: resolvedHubbleConstant,
    backgroundParameterization: legacyOmegaBParameterization
      ? 'legacy Omega_b plus physical omega_b (H0 derived)'
      : 'physical omega_b plus independent H0 integration constant (Omega_b derived)',
    w0,
    wa,
    closure,
    expansionRateSquared,
    expansionRate,
    hubbleRatioAtRedshift,
    comovingDistanceMpc,
    hubbleDistanceMpc,
    volumeDistanceMpc
  };
}

/** Accurate pre-recombination fit for the photon-baryon drag ruler. */
export function photonBaryonDragHorizon(background, {
  physicalMassiveRelicDensity = background?.physicalMassiveNeutrinoDensity ?? 0.000644
} = {}) {
  if (!background || !Number.isFinite(background.h) ||
      !Number.isFinite(physicalMassiveRelicDensity) || physicalMassiveRelicDensity < 0) {
    throw new RangeError('invalid drag-horizon inputs');
  }
  const physicalMatterDensity = background.omegaMatter * background.h ** 2;
  const physicalBaryonDensity = background.bbnCalibration.physicalBaryonDensity;
  const [minimum, maximum] = RECOMBINATION_SURROGATE.physicalBaryonDensityRange;
  const useFrozenClosureSurrogate = onFrozenSubQGClosureLine(background) &&
    physicalBaryonDensity >= minimum && physicalBaryonDensity <= maximum &&
    Math.abs(physicalMassiveRelicDensity - 0.000644) < 1e-12;
  const x = (physicalBaryonDensity - 0.022) / 0.003;
  const soundHorizonMpc = useFrozenClosureSurrogate
    ? evaluatePolynomial(RECOMBINATION_SURROGATE.dragSoundHorizonMpc, x)
    : 55.154 * Math.exp(-72.3 * (physicalMassiveRelicDensity + 0.0006) ** 2) /
      (physicalMatterDensity ** 0.25351 * physicalBaryonDensity ** 0.12807);
  return {
    soundHorizonMpc,
    physicalMatterDensity,
    physicalBaryonDensity,
    physicalMassiveRelicDensity,
    method: useFrozenClosureSurrogate
      ? 'CAMB-verified photon-baryon recombination surrogate on the frozen SubQG closure line; no particle dark matter'
      : 'general photon-baryon drag-horizon thermodynamic fit; the pressureless gravitating sector is the SubQG phase network, not particle CDM',
    numericalMaximumRelativeGridError: useFrozenClosureSurrogate
      ? RECOMBINATION_SURROGATE.maximumRelativeGridError
      : null
  };
}

/**
 * Compressed CMB acoustic-angle audit.  It tests the geometric peak scale;
 * it deliberately does not claim to replace a full TT/TE/EE spectrum.
 */
export function auditPlanckAcousticScale(background, {
  observed100ThetaStar = PLANCK_ACOUSTIC_SCALE_100,
  observedSigma100ThetaStar = PLANCK_ACOUSTIC_SCALE_SIGMA_100
} = {}) {
  if (!background || !onFrozenSubQGClosureLine(background) ||
      !Number.isFinite(observed100ThetaStar) ||
      !Number.isFinite(observedSigma100ThetaStar) || observedSigma100ThetaStar <= 0) {
    throw new RangeError('acoustic surrogate requires the frozen lambda=1.12 SubQG closure');
  }
  const physicalBaryonDensity = background.bbnCalibration.physicalBaryonDensity;
  const [minimum, maximum] = RECOMBINATION_SURROGATE.physicalBaryonDensityRange;
  const [minimumH0, maximumH0] = RECOMBINATION_SURROGATE.hubbleConstantRange;
  if (physicalBaryonDensity < minimum || physicalBaryonDensity > maximum) {
    throw new RangeError(`physical baryon density must be in [${minimum}, ${maximum}]`);
  }
  if (background.hubbleConstantKmPerSecMpc < minimumH0 ||
      background.hubbleConstantKmPerSecMpc > maximumH0) {
    throw new RangeError(`H0 must be in [${minimumH0}, ${maximumH0}]`);
  }
  const x = (physicalBaryonDensity - 0.022) / 0.003;
  const lastScatteringRedshift = evaluatePolynomial(
    RECOMBINATION_SURROGATE.lastScatteringRedshift, x);
  const soundHorizonMpc = evaluatePolynomial(
    RECOMBINATION_SURROGATE.lastScatteringSoundHorizonMpc, x);
  // The same recombination grid also carries the massive-neutrino transition
  // through the line-of-sight distance.  This avoids treating a 0.06 eV
  // neutrino as either pure radiation or pure matter near recombination.
  const baseline100ThetaStar = evaluateAcousticAngleSurrogate(
    physicalBaryonDensity, background.hubbleConstantKmPerSecMpc);
  const baselineComovingDistanceMpc = 100 * soundHorizonMpc /
    baseline100ThetaStar;
  let comovingAngularDiameterDistanceMpc = baselineComovingDistanceMpc;
  if (background.w0 !== -1 || background.wa !== 0) {
    const numericalBaseline = deriveSubQGFluidBackground({
      lambdaRatio: background.lambdaRatio,
      hubbleConstantKmPerSecMpc: background.hubbleConstantKmPerSecMpc,
      physicalBaryonDensity,
      physicalBaryonDensitySigma: background.bbnCalibration.physicalBaryonDensitySigma,
      physicalMassiveNeutrinoDensity: background.physicalMassiveNeutrinoDensity,
      w0: -1,
      wa: 0
    });
    const baselineNumericalDistance = numericalBaseline
      .comovingDistanceMpc(lastScatteringRedshift);
    const currentNumericalDistance = background
      .comovingDistanceMpc(lastScatteringRedshift);
    comovingAngularDiameterDistanceMpc = baselineComovingDistanceMpc *
      currentNumericalDistance / baselineNumericalDistance;
  }
  const predicted100ThetaStar = 100 * soundHorizonMpc /
    comovingAngularDiameterDistanceMpc;
  const residualSigma = (predicted100ThetaStar - observed100ThetaStar) /
    observedSigma100ThetaStar;
  return {
    schemaVersion: 1,
    observable: '100 theta_* = 100 r_s(z_*) / D_M(z_*)',
    scope: 'compressed acoustic geometry only; not a full CMB power-spectrum likelihood',
    fittedParametersToPlanck: 0,
    physicalBaryonDensity,
    lastScatteringRedshift,
    soundHorizonMpc,
    comovingAngularDiameterDistanceMpc,
    predicted100ThetaStar,
    observed100ThetaStar,
    observedSigma100ThetaStar,
    residualSigma,
    chiSquare: residualSigma ** 2,
    passesThreeSigma: Math.abs(residualSigma) <= 3,
    recombinationNumerics: {
      referenceSolver: 'CAMB',
      trainingGridPoints: 143,
      disjointValidationGridPoints: 120,
      physicalBaryonDensityRange: [minimum, maximum],
      hubbleConstantRange: [minimumH0, maximumH0],
      maximumRelativeGridError: RECOMBINATION_SURROGATE.maximumRelativeGridError,
      acousticAngleMaximumRelativeValidationError: 5.14e-7,
      physicalMassiveRelicDensity: 0.000644,
      summedNeutrinoMassEv: 0.06,
      effectiveRelativisticSpecies: 3.046
    }
  };
}

function invertMatrix(matrix) {
  const size = matrix.length;
  if (size === 0 || matrix.some(row => !Array.isArray(row) || row.length !== size)) {
    throw new RangeError('covariance must be a non-empty square matrix');
  }
  const work = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: size }, (_, j) => i === j ? 1 : 0)
  ]);
  for (let column = 0; column < size; column++) {
    let pivot = column;
    for (let row = column + 1; row < size; row++) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (Math.abs(work[pivot][column]) < 1e-18) throw new RangeError('singular covariance');
    [work[column], work[pivot]] = [work[pivot], work[column]];
    const divisor = work[column][column];
    for (let j = 0; j < 2 * size; j++) work[column][j] /= divisor;
    for (let row = 0; row < size; row++) {
      if (row === column) continue;
      const factor = work[row][column];
      for (let j = 0; j < 2 * size; j++) {
        work[row][j] -= factor * work[column][j];
      }
    }
  }
  return work.map(row => row.slice(size));
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
  for (let i = 0; i < coefficients.length; i++) x += coefficients[i] / (z + i + 1);
  const t = z + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function regularizedGammaQ(shape, value) {
  if (value < 0 || shape <= 0) throw new RangeError('invalid gamma arguments');
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
  for (let i = 1; i < 10000; i++) {
    const an = -i * (i - shape);
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

export function auditDesiDR2Bao(background, observations, covariance) {
  if (!background || !Array.isArray(observations) || observations.length === 0 ||
      !Array.isArray(covariance) || covariance.length !== observations.length) {
    throw new RangeError('invalid DESI BAO audit inputs');
  }
  const ruler = photonBaryonDragHorizon(background);
  const predictions = observations.map(observation => {
    const { z, quantity, value } = observation;
    const distance = quantity === 'DM_over_rs'
      ? background.comovingDistanceMpc(z)
      : quantity === 'DH_over_rs'
        ? background.hubbleDistanceMpc(z)
        : quantity === 'DV_over_rs'
          ? background.volumeDistanceMpc(z)
          : NaN;
    if (!Number.isFinite(distance) || !Number.isFinite(value)) {
      throw new RangeError(`invalid BAO observation ${quantity}`);
    }
    const predicted = distance / ruler.soundHorizonMpc;
    return { ...observation, predicted, residual: predicted - value };
  });
  const inverse = invertMatrix(covariance);
  let chiSquare = 0;
  for (let i = 0; i < predictions.length; i++) {
    for (let j = 0; j < predictions.length; j++) {
      chiSquare += predictions[i].residual * inverse[i][j] * predictions[j].residual;
    }
  }
  const degreesOfFreedom = predictions.length;
  const pValue = regularizedGammaQ(degreesOfFreedom / 2, chiSquare / 2);
  return {
    schemaVersion: 1,
    dataset: 'DESI DR2 BAO Gaussian likelihood, all seven redshift bins',
    fittedParametersToDesi: 0,
    soundHorizonMpc: ruler.soundHorizonMpc,
    chiSquare,
    degreesOfFreedom,
    reducedChiSquare: chiSquare / degreesOfFreedom,
    pValue,
    passesOnePercentGoodnessOfFit: pValue >= 0.01,
    predictions
  };
}

/**
 * Profiles the independently measured BBN physical baryon density as one
 * declared Gaussian nuisance calibration.  No SubQG closure parameter or
 * vacuum equation is changed by this operation.
 */
export function profileBbnCalibratedDesiBao({
  observations,
  covariance,
  bbnMean = 0.02218,
  bbnSigma = 0.00055,
  backgroundOptions = {},
  sigmaRange = 5,
  iterations = 72
} = {}) {
  if (!Array.isArray(observations) || !Array.isArray(covariance) ||
      !Number.isFinite(bbnMean) || !Number.isFinite(bbnSigma) || bbnSigma <= 0 ||
      !Number.isFinite(sigmaRange) || sigmaRange <= 0 ||
      !Number.isInteger(iterations) || iterations < 16) {
    throw new RangeError('invalid BBN profile controls');
  }
  const evaluate = physicalBaryonDensity => {
    const background = deriveSubQGFluidBackground({
      ...backgroundOptions,
      physicalBaryonDensity,
      physicalBaryonDensitySigma: bbnSigma
    });
    const bao = auditDesiDR2Bao(background, observations, covariance);
    const bbnPull = (physicalBaryonDensity - bbnMean) / bbnSigma;
    return {
      physicalBaryonDensity,
      background,
      bao,
      bbnPull,
      bbnChiSquare: bbnPull ** 2,
      jointChiSquare: bao.chiSquare + bbnPull ** 2
    };
  };
  let left = Math.max(Number.MIN_VALUE, bbnMean - sigmaRange * bbnSigma);
  let right = bbnMean + sigmaRange * bbnSigma;
  const golden = (Math.sqrt(5) - 1) / 2;
  let x1 = right - golden * (right - left);
  let x2 = left + golden * (right - left);
  let f1 = evaluate(x1);
  let f2 = evaluate(x2);
  for (let iteration = 0; iteration < iterations; iteration++) {
    if (f1.jointChiSquare < f2.jointChiSquare) {
      right = x2;
      x2 = x1;
      f2 = f1;
      x1 = right - golden * (right - left);
      f1 = evaluate(x1);
    } else {
      left = x1;
      x1 = x2;
      f1 = f2;
      x2 = left + golden * (right - left);
      f2 = evaluate(x2);
    }
  }
  const best = f1.jointChiSquare < f2.jointChiSquare ? f1 : f2;
  const degreesOfFreedom = observations.length + 1 - 1;
  const pValue = regularizedGammaQ(degreesOfFreedom / 2, best.jointChiSquare / 2);
  return {
    schemaVersion: 1,
    fittedSubQGClosureParameters: 0,
    profiledExternalNuisanceParameters: 1,
    bbnPrior: { mean: bbnMean, sigma: bbnSigma },
    bestPhysicalBaryonDensity: best.physicalBaryonDensity,
    bestBbnPull: best.bbnPull,
    bbnChiSquare: best.bbnChiSquare,
    baoChiSquare: best.bao.chiSquare,
    jointChiSquare: best.jointChiSquare,
    degreesOfFreedom,
    reducedChiSquare: best.jointChiSquare / degreesOfFreedom,
    pValue,
    passesOnePercentGoodnessOfFit: pValue >= 0.01,
    bestBackground: {
      omegaB: best.background.omegaB,
      omegaSubEffective: best.background.omegaSubEffective,
      omegaMatter: best.background.omegaMatter,
      omegaVacuum: best.background.omegaVacuum,
      h: best.background.h,
      hubbleConstantKmPerSecMpc: best.background.hubbleConstantKmPerSecMpc
    },
    bestBao: best.bao
  };
}

/**
 * Joint profile of the external BBN calibration and the independent H0
 * integration constant against BAO and the CMB acoustic angle.  The SubQG
 * closure ratio is fixed throughout; Omega_b is derived rather than inserted.
 */
export function profileBbnDesiPlanckAcousticScale({
  observations,
  covariance,
  bbnMean = 0.02218,
  bbnSigma = 0.00055,
  observed100ThetaStar = PLANCK_ACOUSTIC_SCALE_100,
  observedSigma100ThetaStar = PLANCK_ACOUSTIC_SCALE_SIGMA_100,
  backgroundOptions = {},
  sigmaRange = 5,
  iterations = 96,
  initialHubbleConstant = 70
} = {}) {
  if (!Array.isArray(observations) || !Array.isArray(covariance) ||
      !Number.isFinite(bbnMean) || !Number.isFinite(bbnSigma) || bbnSigma <= 0 ||
      !Number.isFinite(sigmaRange) || sigmaRange <= 0 ||
      !Number.isInteger(iterations) || iterations < 24 ||
      !Number.isFinite(initialHubbleConstant)) {
    throw new RangeError('invalid joint BBN-DESI-Planck profile controls');
  }
  const evaluate = (physicalBaryonDensity, hubbleConstantKmPerSecMpc) => {
    const background = deriveSubQGFluidBackground({
      ...backgroundOptions,
      physicalBaryonDensity,
      physicalBaryonDensitySigma: bbnSigma,
      omegaB: null,
      hubbleConstantKmPerSecMpc
    });
    const bao = auditDesiDR2Bao(background, observations, covariance);
    const cmb = auditPlanckAcousticScale(background, {
      observed100ThetaStar,
      observedSigma100ThetaStar
    });
    const bbnPull = (physicalBaryonDensity - bbnMean) / bbnSigma;
    const bbnChiSquare = bbnPull ** 2;
    return {
      physicalBaryonDensity, hubbleConstantKmPerSecMpc,
      background, bao, cmb, bbnPull, bbnChiSquare,
      jointChiSquare: bao.chiSquare + cmb.chiSquare + bbnChiSquare
    };
  };
  const [surrogateMinimum, surrogateMaximum] =
    RECOMBINATION_SURROGATE.physicalBaryonDensityRange;
  const baryonBounds = [
    Math.max(surrogateMinimum, bbnMean - sigmaRange * bbnSigma),
    Math.min(surrogateMaximum, bbnMean + sigmaRange * bbnSigma)
  ];
  const hubbleBounds = RECOMBINATION_SURROGATE.hubbleConstantRange;
  const clampPoint = point => [
    Math.max(baryonBounds[0], Math.min(baryonBounds[1], point[0])),
    Math.max(hubbleBounds[0], Math.min(hubbleBounds[1], point[1]))
  ];
  const valueAt = point => {
    const bounded = clampPoint(point);
    return evaluate(bounded[0], bounded[1]);
  };
  let simplex = [
    [bbnMean, initialHubbleConstant],
    [bbnMean + 0.0004, initialHubbleConstant],
    [bbnMean, initialHubbleConstant + 2]
  ].map(point => ({ point: clampPoint(point), result: valueAt(point) }));
  for (let iteration = 0; iteration < iterations; iteration++) {
    simplex.sort((left, right) => left.result.jointChiSquare - right.result.jointChiSquare);
    const centroid = [
      (simplex[0].point[0] + simplex[1].point[0]) / 2,
      (simplex[0].point[1] + simplex[1].point[1]) / 2
    ];
    const reflectedPoint = clampPoint([
      2 * centroid[0] - simplex[2].point[0],
      2 * centroid[1] - simplex[2].point[1]
    ]);
    const reflected = { point: reflectedPoint, result: valueAt(reflectedPoint) };
    if (reflected.result.jointChiSquare < simplex[0].result.jointChiSquare) {
      const expandedPoint = clampPoint([
        centroid[0] + 2 * (reflectedPoint[0] - centroid[0]),
        centroid[1] + 2 * (reflectedPoint[1] - centroid[1])
      ]);
      const expanded = { point: expandedPoint, result: valueAt(expandedPoint) };
      simplex[2] = expanded.result.jointChiSquare < reflected.result.jointChiSquare
        ? expanded : reflected;
    } else if (reflected.result.jointChiSquare < simplex[1].result.jointChiSquare) {
      simplex[2] = reflected;
    } else {
      const contractedPoint = clampPoint([
        centroid[0] + 0.5 * (simplex[2].point[0] - centroid[0]),
        centroid[1] + 0.5 * (simplex[2].point[1] - centroid[1])
      ]);
      const contracted = { point: contractedPoint, result: valueAt(contractedPoint) };
      if (contracted.result.jointChiSquare < simplex[2].result.jointChiSquare) {
        simplex[2] = contracted;
      } else {
        simplex = [simplex[0], ...simplex.slice(1).map(vertex => {
          const point = clampPoint([
            simplex[0].point[0] + 0.5 * (vertex.point[0] - simplex[0].point[0]),
            simplex[0].point[1] + 0.5 * (vertex.point[1] - simplex[0].point[1])
          ]);
          return { point, result: valueAt(point) };
        })];
      }
    }
  }
  simplex.sort((left, right) => left.result.jointChiSquare - right.result.jointChiSquare);
  const best = simplex[0].result;
  const degreesOfFreedom = observations.length + 2 - 2;
  const pValue = regularizedGammaQ(degreesOfFreedom / 2, best.jointChiSquare / 2);
  return {
    schemaVersion: 1,
    fittedSubQGClosureParameters: 0,
    profiledExternalNuisanceParameters: 1,
    fittedBackgroundIntegrationConstants: 1,
    observables: { desiBao: observations.length, bbnPrior: 1, cmbAcousticScale: 1 },
    bestPhysicalBaryonDensity: best.physicalBaryonDensity,
    bestHubbleConstantKmPerSecMpc: best.hubbleConstantKmPerSecMpc,
    bestBbnPull: best.bbnPull,
    bbnChiSquare: best.bbnChiSquare,
    baoChiSquare: best.bao.chiSquare,
    cmbChiSquare: best.cmb.chiSquare,
    cmbResidualSigma: best.cmb.residualSigma,
    jointChiSquare: best.jointChiSquare,
    degreesOfFreedom,
    reducedChiSquare: best.jointChiSquare / degreesOfFreedom,
    pValue,
    passesOnePercentGoodnessOfFit: pValue >= 0.01,
    bestBackground: {
      omegaMatter: best.background.omegaMatter,
      omegaVacuum: best.background.omegaVacuum,
      h: best.background.h,
      hubbleConstantKmPerSecMpc: best.background.hubbleConstantKmPerSecMpc
    },
    bestBao: best.bao,
    bestCmbAcousticScale: best.cmb
  };
}

/** Linear scalar growth of the pressureless SubQG network fluid. */
export function evolveSubQGLinearGrowth(background, {
  initialScaleFactor = 1e-3,
  steps = 12000,
  sampleRedshifts = [0, 0.5, 1, 2]
} = {}) {
  if (!background || !Number.isFinite(initialScaleFactor) || initialScaleFactor <= 0 ||
      initialScaleFactor >= 1 || !Number.isInteger(steps) || steps < 100 ||
      !Array.isArray(sampleRedshifts) || sampleRedshifts.some(z => z < 0)) {
    throw new RangeError('invalid growth controls');
  }
  const x0 = Math.log(initialScaleFactor);
  const dx = -x0 / steps;
  let x = x0;
  let growth = initialScaleFactor;
  let derivative = initialScaleFactor;
  const rhs = (atX, state) => {
    const a = Math.exp(atX);
    const epsilon = 1e-5;
    const ePlus = background.expansionRate(a * Math.exp(epsilon));
    const eMinus = background.expansionRate(a * Math.exp(-epsilon));
    const dLogH = (Math.log(ePlus) - Math.log(eMinus)) / (2 * epsilon);
    const omegaMatterAtA = background.omegaMatter / (a ** 3 *
      background.expansionRateSquared(a));
    return [state[1], -(2 + dLogH) * state[1] + 1.5 * omegaMatterAtA * state[0]];
  };
  const history = [{ a: Math.exp(x), growth, derivative }];
  for (let step = 0; step < steps; step++) {
    const state = [growth, derivative];
    const k1 = rhs(x, state);
    const k2 = rhs(x + dx / 2, state.map((value, i) => value + dx * k1[i] / 2));
    const k3 = rhs(x + dx / 2, state.map((value, i) => value + dx * k2[i] / 2));
    const k4 = rhs(x + dx, state.map((value, i) => value + dx * k3[i]));
    growth += dx * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]) / 6;
    derivative += dx * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]) / 6;
    x += dx;
    history.push({ a: Math.exp(x), growth, derivative });
  }
  const normalization = growth;
  const samples = sampleRedshifts.map(z => {
    const targetA = 1 / (1 + z);
    const index = Math.max(0, Math.min(history.length - 1,
      Math.round((Math.log(targetA) - x0) / dx)));
    const point = history[index];
    return {
      z,
      scaleFactor: point.a,
      normalizedGrowth: point.growth / normalization,
      logarithmicGrowthRate: point.derivative / point.growth,
      normalizedGrowthRateProduct: point.derivative / normalization
    };
  });
  return {
    schemaVersion: 1,
    ontology: 'linear perturbations of the conserved pressureless SubQG phase-network energy',
    nBodyParticlesUsed: false,
    initialScaleFactor,
    steps,
    samples
  };
}

/**
 * Propagates a CMB-calibrated primordial amplitude through the SubQG network
 * growth equation and compares only with independent late-time amplitudes.
 */
export function auditSubQGStructureAmplitude(background, {
  sigma8AtZero,
  observations = {
    desiDr1FullShapeSigma8: { value: 0.842, sigma: 0.034 },
    desY3S8: { value: 0.776, sigma: 0.017 },
    sptClusterAbundanceS8: { value: 0.795, sigma: 0.029 },
    desiDr1PeculiarVelocityFsigma8: { z: 0.07, value: 0.450, sigma: 0.055 }
  }
} = {}) {
  if (!background || !Number.isFinite(sigma8AtZero) || sigma8AtZero <= 0 ||
      !observations || Object.values(observations).some(observation =>
        !Number.isFinite(observation.value) || !Number.isFinite(observation.sigma) ||
        observation.sigma <= 0)) {
    throw new RangeError('invalid structure-amplitude audit inputs');
  }
  const velocityRedshift = observations.desiDr1PeculiarVelocityFsigma8?.z ?? 0.07;
  const growth = evolveSubQGLinearGrowth(background, {
    sampleRedshifts: [0, velocityRedshift, 0.5, 1, 2]
  });
  const atVelocityRedshift = growth.samples.find(sample =>
    sample.z === velocityRedshift);
  const predictions = {
    desiDr1FullShapeSigma8: sigma8AtZero,
    desY3S8: sigma8AtZero * Math.sqrt(background.omegaMatter / 0.3),
    sptClusterAbundanceS8: sigma8AtZero * Math.sqrt(background.omegaMatter / 0.3),
    desiDr1PeculiarVelocityFsigma8:
      sigma8AtZero * atVelocityRedshift.normalizedGrowthRateProduct
  };
  const comparisons = Object.fromEntries(Object.entries(observations).map(([name, observed]) => {
    const predicted = predictions[name];
    const residualSigma = (predicted - observed.value) / observed.sigma;
    return [name, { ...observed, predicted, residualSigma,
      passesThreeSigma: Math.abs(residualSigma) <= 3 }];
  }));
  return {
    schemaVersion: 1,
    ontology: 'CMB-normalized linear perturbations of the pressureless SubQG phase network',
    particleNBodySimulationUsed: false,
    primordialAmplitudeFittedToCmb: true,
    lateTimeAmplitudeFitted: false,
    sigma8AtZero,
    comparisons,
    allIndependentStructureChecksPassThreeSigma:
      Object.values(comparisons).every(comparison => comparison.passesThreeSigma),
    growth
  };
}
