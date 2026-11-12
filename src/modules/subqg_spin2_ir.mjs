const ETA = Object.freeze([-1, 1, 1, 1]);

function vector4(name, value) {
  if (!Array.isArray(value) || value.length !== 4 || value.some(x => !Number.isFinite(x))) {
    throw new RangeError(`${name} must contain four finite components`);
  }
}

function symmetric4(name, value) {
  if (!Array.isArray(value) || value.length !== 4) throw new RangeError(`${name} must be 4x4`);
  for (let i = 0; i < 4; i++) {
    vector4(`${name}[${i}]`, value[i]);
    for (let j = 0; j < 4; j++) {
      if (Math.abs(value[i][j] - value[j][i]) > 1e-12) throw new RangeError(`${name} must be symmetric`);
    }
  }
}

const zeroMatrix = () => Array.from({ length: 4 }, () => Array(4).fill(0));
const lower = vector => vector.map((value, index) => ETA[index] * value);

export function minkowskiNormSquared(vectorContravariant) {
  vector4('vectorContravariant', vectorContravariant);
  return vectorContravariant.reduce((sum, value, index) => sum + ETA[index] * value * value, 0);
}

/**
 * Momentum-space linearized Einstein tensor for a symmetric perturbation
 * h_(mu nu), using signature (-,+,+,+). It is the Euler-Lagrange operator of
 * the massless Fierz-Pauli action and annihilates pure gauge perturbations.
 */
export function linearizedEinsteinTensorFourier(hCovariant, kContravariant) {
  symmetric4('hCovariant', hCovariant);
  vector4('kContravariant', kContravariant);
  const kCovariant = lower(kContravariant);
  const kSquared = minkowskiNormSquared(kContravariant);
  const trace = ETA.reduce((sum, sign, index) => sum + sign * hCovariant[index][index], 0);
  const hMixed = zeroMatrix();
  const hContravariant = zeroMatrix();
  for (let mu = 0; mu < 4; mu++) for (let nu = 0; nu < 4; nu++) {
    hMixed[mu][nu] = ETA[mu] * hCovariant[mu][nu];
    hContravariant[mu][nu] = ETA[mu] * ETA[nu] * hCovariant[mu][nu];
  }
  let doubleDivergence = 0;
  for (let alpha = 0; alpha < 4; alpha++) for (let beta = 0; beta < 4; beta++) {
    doubleDivergence += kCovariant[alpha] * kCovariant[beta] * hContravariant[alpha][beta];
  }
  const tensor = zeroMatrix();
  for (let mu = 0; mu < 4; mu++) for (let nu = 0; nu < 4; nu++) {
    let divergenceMu = 0;
    let divergenceNu = 0;
    for (let sigma = 0; sigma < 4; sigma++) {
      divergenceMu += kCovariant[sigma] * kCovariant[mu] * hMixed[sigma][nu];
      divergenceNu += kCovariant[sigma] * kCovariant[nu] * hMixed[sigma][mu];
    }
    const etaMuNu = mu === nu ? ETA[mu] : 0;
    tensor[mu][nu] = 0.5 * (
      -divergenceMu - divergenceNu + kSquared * hCovariant[mu][nu] +
      kCovariant[mu] * kCovariant[nu] * trace +
      etaMuNu * (doubleDivergence - kSquared * trace)
    );
  }
  return { tensor, kSquared, trace, maxResidual: Math.max(...tensor.flat().map(Math.abs)) };
}

/** h_(mu nu) = k_mu xi_nu + k_nu xi_mu, a pure gauge direction. */
export function pureGaugePerturbation(kContravariant, xiContravariant) {
  vector4('kContravariant', kContravariant);
  vector4('xiContravariant', xiContravariant);
  const kCovariant = lower(kContravariant);
  const xiCovariant = lower(xiContravariant);
  const h = zeroMatrix();
  for (let mu = 0; mu < 4; mu++) for (let nu = 0; nu < 4; nu++) {
    h[mu][nu] = kCovariant[mu] * xiCovariant[nu] + kCovariant[nu] * xiCovariant[mu];
  }
  return h;
}

/** Two-polarization transverse-traceless plane wave moving along +z. */
export function transverseTracelessPlaneWave({ waveNumber, plus = 1, cross = 0, speed = 1 } = {}) {
  for (const [name, value] of Object.entries({ waveNumber, plus, cross, speed })) {
    if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  }
  if (waveNumber <= 0 || speed <= 0) throw new RangeError('waveNumber and speed must be positive');
  const h = zeroMatrix();
  h[1][1] = plus;
  h[2][2] = -plus;
  h[1][2] = h[2][1] = cross;
  const k = [speed * waveNumber, 0, 0, waveNumber];
  const fieldEquation = linearizedEinsteinTensorFourier(h, k);
  return {
    kContravariant: k,
    hCovariant: h,
    polarizations: { plus, cross },
    dispersion: { omega: k[0], waveNumber, massSquared: -fieldEquation.kSquared },
    transverse: k.every((_, mu) => {
      for (let nu = 0; nu < 4; nu++) {
        let contraction = 0;
        for (let alpha = 0; alpha < 4; alpha++) contraction += k[alpha] * h[alpha][nu];
        if (Math.abs(contraction) > 1e-12) return false;
      }
      return true;
    }),
    traceless: Math.abs(fieldEquation.trace) < 1e-12,
    fieldEquation
  };
}

export function spinTwoInfraredAudit() {
  const plus = transverseTracelessPlaneWave({ waveNumber: 0.7, plus: 1, cross: 0 });
  const cross = transverseTracelessPlaneWave({ waveNumber: 0.7, plus: 0, cross: 1 });
  const arbitraryK = [1.3, 0.2, -0.4, 0.7];
  const gauge = pureGaugePerturbation(arbitraryK, [0.3, -0.5, 0.8, 0.1]);
  const gaugeEquation = linearizedEinsteinTensorFourier(gauge, arbitraryK);
  return {
    effectiveAction: 'massless Fierz-Pauli quadratic action',
    independentPhysicalPolarizations: 2,
    plusModeOnShell: plus.fieldEquation.maxResidual < 1e-12,
    crossModeOnShell: cross.fieldEquation.maxResidual < 1e-12,
    masslessDispersion: Math.abs(plus.dispersion.massSquared) < 1e-12,
    transverseTraceless: plus.transverse && plus.traceless && cross.transverse && cross.traceless,
    pureGaugeNullDirection: gaugeEquation.maxResidual < 1e-12,
    infraredClosureSelfConsistent:
      plus.fieldEquation.maxResidual < 1e-12 && cross.fieldEquation.maxResidual < 1e-12 &&
      Math.abs(plus.dispersion.massSquared) < 1e-12 && gaugeEquation.maxResidual < 1e-12,
    microscopicMatchingStatus: 'not yet derived from the anchored scalar SubQG microaction'
  };
}
