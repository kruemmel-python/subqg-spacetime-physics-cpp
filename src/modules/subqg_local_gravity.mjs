function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

export function eotvosParameter(accelerationA, accelerationB) {
  finite('accelerationA', accelerationA);
  finite('accelerationB', accelerationB);
  const denominator = accelerationA + accelerationB;
  if (denominator === 0) throw new RangeError('acceleration sum must be nonzero');
  return 2 * (accelerationA - accelerationB) / denominator;
}

/** Ideal constant-gradient prediction corresponding to the Lean theorem. */
export function universalFreeFallPrediction(fieldAcceleration, objectNorms) {
  finite('fieldAcceleration', fieldAcceleration);
  if (fieldAcceleration === 0) throw new RangeError('fieldAcceleration must be nonzero');
  if (!Array.isArray(objectNorms) || objectNorms.length < 2) {
    throw new RangeError('at least two object norms are required');
  }
  const objects = objectNorms.map((norm, index) => {
    if (!Number.isFinite(norm) || norm <= 0) throw new RangeError(`objectNorms[${index}] must be positive`);
    const metricForce = norm * fieldAcceleration;
    return {
      norm,
      metricForce,
      acceleration: fieldAcceleration,
      floatingPointForceOverNorm: metricForce / norm
    };
  });
  const pairwise = [];
  for (let a = 0; a < objects.length; a++) {
    for (let b = a + 1; b < objects.length; b++) {
      pairwise.push({ a, b, eta: eotvosParameter(objects[a].acceleration, objects[b].acceleration) });
    }
  }
  return { fieldAcceleration, objects, pairwise, maxAbsoluteEta: Math.max(...pairwise.map(pair => Math.abs(pair.eta))) };
}

export function combinedIndependentUncertainty(statistical, systematic) {
  if (!Number.isFinite(statistical) || statistical < 0) throw new RangeError('statistical uncertainty must be nonnegative');
  if (!Number.isFinite(systematic) || systematic < 0) throw new RangeError('systematic uncertainty must be nonnegative');
  return Math.hypot(statistical, systematic);
}

export function standardizedResidual(predicted, observed, uncertainty) {
  finite('predicted', predicted);
  finite('observed', observed);
  if (!Number.isFinite(uncertainty) || uncertainty <= 0) throw new RangeError('uncertainty must be positive');
  return (predicted - observed) / uncertainty;
}
