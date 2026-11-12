import { spinTwoInfraredAudit } from './subqg_spin2_ir.mjs';

const NOMINAL_SOLAR_MASS_TIME_SECONDS = 4.925490947e-6;

function positive(name, value) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and positive`);
}

/** Leading 2.5PN Peters-Mathews quadrupole prediction for binary period decay. */
export function petersMathewsPeriodDerivative({
  massASolar,
  massBSolar,
  orbitalPeriodSeconds,
  eccentricity,
  solarMassTimeSeconds = NOMINAL_SOLAR_MASS_TIME_SECONDS
}) {
  positive('massASolar', massASolar);
  positive('massBSolar', massBSolar);
  positive('orbitalPeriodSeconds', orbitalPeriodSeconds);
  positive('solarMassTimeSeconds', solarMassTimeSeconds);
  if (!Number.isFinite(eccentricity) || eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError('eccentricity must lie in [0,1)');
  }
  const totalMassSolar = massASolar + massBSolar;
  const meanMotion = 2 * Math.PI / orbitalPeriodSeconds;
  const eccentricityEnhancement =
    (1 + (73 / 24) * eccentricity ** 2 + (37 / 96) * eccentricity ** 4) /
    (1 - eccentricity ** 2) ** 3.5;
  const periodDerivative =
    -(192 * Math.PI / 5) *
    (solarMassTimeSeconds * meanMotion) ** (5 / 3) *
    (massASolar * massBSolar / totalMassSolar ** (1 / 3)) *
    eccentricityEnhancement;
  return {
    periodDerivative,
    totalMassSolar,
    meanMotionRadiansPerSecond: meanMotion,
    eccentricityEnhancement,
    solarMassTimeSeconds
  };
}

/** Explicitly records what is and is not derived for the radiative bridge. */
export function binaryRadiationClosureAudit() {
  const infrared = spinTwoInfraredAudit();
  return {
    masslessDispersion: infrared.masslessDispersion,
    independentPhysicalPolarizations: infrared.independentPhysicalPolarizations,
    infraredClosureSelfConsistent: infrared.infraredClosureSelfConsistent,
    leadingQuadrupoleFormulaAvailable: true,
    universalSourceNormalizationFromCanonicalMicroaction: false,
    nonlinearStrongFieldCompletionFromCanonicalMicroaction: false,
    interpretation: 'The Peters-Mathews prediction is conditional on matching the canonical SubQG microaction to the normalized massless spin-2 source theory.'
  };
}
