import { deriveGaugeReducedPhaseSpaceClosure } from './subqg_substrate_clustering.mjs';

const C_KM_PER_SECOND = 299792.458;
const PHOTON_DENSITY_H2_AT_2_7255_K = 2.469e-5;
const PLANCK_ACOUSTIC_SCALE_100 = 1.04110;
const PLANCK_ACOUSTIC_SCALE_SIGMA_100 = 0.00031;

// Fifth-order minimax-like polynomial surrogates along the frozen SubQG
// closure line Omega_m/Omega_b = 1 + 6/1.12.  They reproduce a 25-point
// CAMB recombination reference grid over 0.019 <= omega_b <= 0.025.  x is
// (omega_b - 0.022)/0.003; coefficients are ordered highest power first.
// This is a numerical evaluator of standard photon-baryon thermodynamics,
// not a fitted SubQG parameter or a particle-dark-matter assumption.
const RECOMBINATION_SURROGATE = Object.freeze({
  physicalBaryonDensityRange: [0.019, 0.025],
  lastScatteringRedshift: [-0.0009672761722664406, 0.004206199784396376,
    -0.03478177009979536, 0.283525523950148, -2.4381698458092376,
    1090.1909479483943],
  lastScatteringSoundHorizonMpc: [-0.000027313509090903,
    0.00136368655137676, -0.02287245532977335, 0.37333982861422815,
    -6.527704512481928, 145.27404233709638],
  acousticAngle100: [0.0000031686855241360736, -0.000028388776384778766,
    0.00028172635219740193, -0.002833843153166393, 0.023288508250634075,
    1.0381332312631935],
  dragSoundHorizonMpc: [-0.0006293175877626142, 0.004201116863181056,
    -0.043412519053438715, 0.5391856053578561, -7.7117367396652865,
    148.0781030592048],
  maximumRelativeGridError: 1.1e-6
});

function evaluatePolynomial(coefficients, x) {
  return coefficients.reduce((value, coefficient) => value * x + coefficient, 0);
}

function onFrozenSubQGClosureLine(background) {
  return Math.abs(background.lambdaRatio - 1.12) < 1e-12 &&
    Math.abs(background.omegaB - 0.0493) < 1e-12 &&
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
  omegaB = 0.0493,
  physicalBaryonDensity = 0.02218,
  physicalBaryonDensitySigma = 0.00055,
  cmbTemperatureKelvin = 2.7255,
  effectiveRelativisticSpecies = 3.046,
  physicalMassiveNeutrinoDensity = 0.000644,
  w0 = -1,
  wa = 0
} = {}) {
  for (const [name, value] of Object.entries({
    lambdaRatio, omegaB, physicalBaryonDensity, physicalBaryonDensitySigma,
    cmbTemperatureKelvin, effectiveRelativisticSpecies,
    physicalMassiveNeutrinoDensity, w0, wa
  })) {
    if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  }
  if (lambdaRatio <= 1 || omegaB <= 0 || physicalBaryonDensity <= 0 ||
      physicalBaryonDensitySigma <= 0 || cmbTemperatureKelvin <= 0 ||
      effectiveRelativisticSpecies < 0 || physicalMassiveNeutrinoDensity < 0) {
    throw new RangeError('invalid SubQG background controls');
  }
  const closure = deriveGaugeReducedPhaseSpaceClosure({ lambdaRatio });
  const h = Math.sqrt(physicalBaryonDensity / omegaB);
  const hubbleConstantKmPerSecMpc = 100 * h;
  const omegaSubEffective = omegaB * closure.networkExcitationEnergyRatio;
  const omegaMassiveNeutrino = physicalMassiveNeutrinoDensity / h ** 2;
  const omegaMatter = omegaB + omegaSubEffective + omegaMassiveNeutrino;
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
    return C_KM_PER_SECOND / hubbleConstantKmPerSecMpc *
      simpsonIntegral(a => 1 / (a * a * expansionRate(a)), lower, 1);
  };
  const hubbleDistanceMpc = z => C_KM_PER_SECOND /
    (hubbleConstantKmPerSecMpc * hubbleRatioAtRedshift(z));
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
    omegaB,
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
    hubbleConstantKmPerSecMpc,
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
  if (physicalBaryonDensity < minimum || physicalBaryonDensity > maximum) {
    throw new RangeError(`physical baryon density must be in [${minimum}, ${maximum}]`);
  }
  const x = (physicalBaryonDensity - 0.022) / 0.003;
  const lastScatteringRedshift = evaluatePolynomial(
    RECOMBINATION_SURROGATE.lastScatteringRedshift, x);
  const soundHorizonMpc = evaluatePolynomial(
    RECOMBINATION_SURROGATE.lastScatteringSoundHorizonMpc, x);
  // The same recombination grid also carries the massive-neutrino transition
  // through the line-of-sight distance.  This avoids treating a 0.06 eV
  // neutrino as either pure radiation or pure matter near recombination.
  const baseline100ThetaStar = evaluatePolynomial(
    RECOMBINATION_SURROGATE.acousticAngle100, x);
  const baselineComovingDistanceMpc = 100 * soundHorizonMpc /
    baseline100ThetaStar;
  let comovingAngularDiameterDistanceMpc = baselineComovingDistanceMpc;
  if (background.w0 !== -1 || background.wa !== 0) {
    const numericalBaseline = deriveSubQGFluidBackground({
      lambdaRatio: background.lambdaRatio,
      omegaB: background.omegaB,
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
      gridPoints: 25,
      physicalBaryonDensityRange: [minimum, maximum],
      maximumRelativeGridError: RECOMBINATION_SURROGATE.maximumRelativeGridError,
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

/** Joint profile of one external BBN calibration against BAO and CMB angle. */
export function profileBbnDesiPlanckAcousticScale({
  observations,
  covariance,
  bbnMean = 0.02218,
  bbnSigma = 0.00055,
  observed100ThetaStar = PLANCK_ACOUSTIC_SCALE_100,
  observedSigma100ThetaStar = PLANCK_ACOUSTIC_SCALE_SIGMA_100,
  backgroundOptions = {},
  sigmaRange = 5,
  iterations = 72
} = {}) {
  if (!Array.isArray(observations) || !Array.isArray(covariance) ||
      !Number.isFinite(bbnMean) || !Number.isFinite(bbnSigma) || bbnSigma <= 0 ||
      !Number.isFinite(sigmaRange) || sigmaRange <= 0 ||
      !Number.isInteger(iterations) || iterations < 16) {
    throw new RangeError('invalid joint BBN-DESI-Planck profile controls');
  }
  const evaluate = physicalBaryonDensity => {
    const background = deriveSubQGFluidBackground({
      ...backgroundOptions,
      physicalBaryonDensity,
      physicalBaryonDensitySigma: bbnSigma
    });
    const bao = auditDesiDR2Bao(background, observations, covariance);
    const cmb = auditPlanckAcousticScale(background, {
      observed100ThetaStar,
      observedSigma100ThetaStar
    });
    const bbnPull = (physicalBaryonDensity - bbnMean) / bbnSigma;
    const bbnChiSquare = bbnPull ** 2;
    return {
      physicalBaryonDensity, background, bao, cmb, bbnPull, bbnChiSquare,
      jointChiSquare: bao.chiSquare + cmb.chiSquare + bbnChiSquare
    };
  };
  const [surrogateMinimum, surrogateMaximum] =
    RECOMBINATION_SURROGATE.physicalBaryonDensityRange;
  let left = Math.max(surrogateMinimum, bbnMean - sigmaRange * bbnSigma);
  let right = Math.min(surrogateMaximum, bbnMean + sigmaRange * bbnSigma);
  const golden = (Math.sqrt(5) - 1) / 2;
  let x1 = right - golden * (right - left);
  let x2 = left + golden * (right - left);
  let f1 = evaluate(x1);
  let f2 = evaluate(x2);
  for (let iteration = 0; iteration < iterations; iteration++) {
    if (f1.jointChiSquare < f2.jointChiSquare) {
      right = x2; x2 = x1; f2 = f1;
      x1 = right - golden * (right - left); f1 = evaluate(x1);
    } else {
      left = x1; x1 = x2; f1 = f2;
      x2 = left + golden * (right - left); f2 = evaluate(x2);
    }
  }
  const best = f1.jointChiSquare < f2.jointChiSquare ? f1 : f2;
  const degreesOfFreedom = observations.length + 2 - 1;
  const pValue = regularizedGammaQ(degreesOfFreedom / 2, best.jointChiSquare / 2);
  return {
    schemaVersion: 1,
    fittedSubQGClosureParameters: 0,
    profiledExternalNuisanceParameters: 1,
    observables: { desiBao: observations.length, bbnPrior: 1, cmbAcousticScale: 1 },
    bestPhysicalBaryonDensity: best.physicalBaryonDensity,
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
