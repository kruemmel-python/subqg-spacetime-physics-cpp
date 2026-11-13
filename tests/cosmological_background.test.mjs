import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  auditDesiDR2Bao,
  auditPlanckAcousticScale,
  deriveSubQGFluidBackground,
  evolveSubQGLinearGrowth,
  photonBaryonDragHorizon,
  profileBbnDesiPlanckAcousticScale
} from '../src/modules/subqg_cosmological_background.mjs';

function dataLines(filename) {
  return fs.readFileSync(new URL(`../validation/data/${filename}`, import.meta.url), 'utf8')
    .split(/\r?\n/).map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function desiData() {
  const observations = dataLines('desi_dr2_bao_mean.txt').map(line => {
    const [z, value, quantity] = line.split(/\s+/);
    return { z: Number(z), value: Number(value), quantity };
  });
  const covariance = dataLines('desi_dr2_bao_cov.txt')
    .map(line => line.split(/\s+/).map(Number));
  return { observations, covariance };
}

test('SubQG background contains derived network closure and known neutrino sector', () => {
  const background = deriveSubQGFluidBackground();
  assert.equal(background.targetCosmologyUsed, false);
  assert(Math.abs(background.networkToBaryonEnergyRatio - 6 / 1.12) < 1e-14);
  assert(Math.abs(background.omegaSubEffective - 0.2641071428571428) < 1e-14);
  assert(Math.abs(background.physicalMassiveNeutrinoDensity - 0.000644) < 1e-15);
  assert(background.hubbleConstantKmPerSecMpc > 67 &&
    background.hubbleConstantKmPerSecMpc < 67.1);
  assert(background.comovingDistanceMpc(1) > 0);
  assert(background.comovingDistanceMpc(2) > background.comovingDistanceMpc(1));
});

test('recombination surrogate is precise and explicitly limited in scope', () => {
  const background = deriveSubQGFluidBackground();
  const ruler = photonBaryonDragHorizon(background);
  const cmb = auditPlanckAcousticScale(background);
  assert.match(ruler.method, /CAMB-verified/);
  assert(ruler.numericalMaximumRelativeGridError < 2e-6);
  assert.match(cmb.scope, /not a full CMB/);
  assert(Math.abs(cmb.predicted100ThetaStar - 1.03952) < 2e-5);
  assert.equal(cmb.passesThreeSigma, false);
});

test('official DESI covariance exposes the frozen-background joint tension', () => {
  const { observations, covariance } = desiData();
  const background = deriveSubQGFluidBackground();
  const bao = auditDesiDR2Bao(background, observations, covariance);
  const joint = profileBbnDesiPlanckAcousticScale({
    observations, covariance, iterations: 18
  });
  assert.equal(observations.length, 13);
  assert.equal(bao.passesOnePercentGoodnessOfFit, false);
  assert.equal(joint.fittedSubQGClosureParameters, 0);
  assert.equal(joint.profiledExternalNuisanceParameters, 1);
  assert.equal(joint.passesOnePercentGoodnessOfFit, false);
  assert(joint.pValue > 0.008 && joint.pValue < 0.01);
});

test('linear SubQG growth evolves the network fluid without N-body particles', () => {
  const growth = evolveSubQGLinearGrowth(deriveSubQGFluidBackground(), {
    steps: 2000, sampleRedshifts: [0, 1, 2]
  });
  assert.equal(growth.nBodyParticlesUsed, false);
  assert(Math.abs(growth.samples[0].normalizedGrowth - 1) < 1e-12);
  assert(growth.samples[2].normalizedGrowth < growth.samples[1].normalizedGrowth);
  assert(growth.samples[1].logarithmicGrowthRate > 0);
});
