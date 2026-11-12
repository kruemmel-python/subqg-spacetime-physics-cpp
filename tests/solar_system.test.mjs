import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dualStrainAnomalousAcceleration,
  dualStrainHighAccelerationLimit,
  secularPerihelionPrecession,
  constantRadialAccelerationPrecession
} from '../src/modules/subqg_solar_system.mjs';

test('stable dual-strain excess matches direct equation', () => {
  const g = 0.006;
  const a0 = 1.465548e-10;
  const direct = Math.sqrt(g * g + g * a0) - g;
  assert(Math.abs(dualStrainAnomalousAcceleration(g, a0) - direct) < 1e-18);
});

test('dual-strain excess approaches a0 over two at high acceleration', () => {
  const a0 = 1.2e-10;
  const excess = dualStrainAnomalousAcceleration(1, a0);
  assert(Math.abs(excess / dualStrainHighAccelerationLimit(a0) - 1) < 1e-9);
});

test('numerical Gauss average reproduces constant radial formula', () => {
  const parameters = { semiMajorAxis: 2.28e11, eccentricity: 0.0934, centralMu: 1.32712440018e20 };
  const acceleration = 7.3e-11;
  const numerical = secularPerihelionPrecession({
    ...parameters,
    samples: 32768,
    anomalousInwardAcceleration: () => acceleration
  });
  const analytic = constantRadialAccelerationPrecession({ ...parameters, acceleration });
  assert(Math.abs(numerical.radiansPerSecond / analytic.radiansPerSecond - 1) < 1e-12);
  assert(numerical.milliarcsecondsPerCentury < 0);
});

test('solar-system functions reject nonphysical inputs', () => {
  assert.throws(() => dualStrainAnomalousAcceleration(0, 1), RangeError);
  assert.throws(() => secularPerihelionPrecession({ semiMajorAxis: 1, eccentricity: 0, centralMu: 1, anomalousInwardAcceleration: () => 0 }), RangeError);
  assert.throws(() => constantRadialAccelerationPrecession({ semiMajorAxis: 1, eccentricity: 0, centralMu: 1, acceleration: 0 }), RangeError);
});
