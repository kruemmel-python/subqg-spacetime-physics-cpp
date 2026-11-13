import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {
  auditDesiDR2Bao,
  auditPlanckAcousticScale,
  auditSubQGStructureAmplitude,
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
  assert(Math.abs(background.omegaSubEffective / background.omegaB - 6 / 1.12) < 1e-14);
  assert(Math.abs(background.physicalMassiveNeutrinoDensity - 0.000644) < 1e-15);
  assert.equal(background.hubbleConstantKmPerSecMpc, 70);
  assert.match(background.backgroundParameterization, /independent H0/);
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
  assert(Math.abs(cmb.predicted100ThetaStar - 1.048218) < 2e-5);
  assert.equal(cmb.passesThreeSigma, false);
});

test('official DESI covariance accepts the non-circular two-parameter background', () => {
  const { observations, covariance } = desiData();
  const background = deriveSubQGFluidBackground();
  const bao = auditDesiDR2Bao(background, observations, covariance);
  const joint = profileBbnDesiPlanckAcousticScale({
    observations, covariance, iterations: 48
  });
  assert.equal(observations.length, 13);
  assert.equal(bao.passesOnePercentGoodnessOfFit, true);
  assert.equal(joint.fittedSubQGClosureParameters, 0);
  assert.equal(joint.profiledExternalNuisanceParameters, 1);
  assert.equal(joint.fittedBackgroundIntegrationConstants, 1);
  assert.equal(joint.passesOnePercentGoodnessOfFit, true);
  assert(joint.pValue > 0.59 && joint.pValue < 0.62);
  assert(Math.abs(joint.bestHubbleConstantKmPerSecMpc - 68.109) < 0.02);
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

test('CMB-normalized SubQG growth passes independent late-time amplitudes', () => {
  const background = deriveSubQGFluidBackground({
    physicalBaryonDensity: 0.021713659171953156,
    hubbleConstantKmPerSecMpc: 68.10892024421489
  });
  const audit = auditSubQGStructureAmplitude(background, {
    sigma8AtZero: 0.7976812707673815
  });
  assert.equal(audit.particleNBodySimulationUsed, false);
  assert.equal(audit.lateTimeAmplitudeFitted, false);
  assert.equal(audit.allIndependentStructureChecksPassThreeSigma, true);
  assert(Math.abs(audit.comparisons.desiDr1FullShapeSigma8.residualSigma) < 1.4);
  assert(Math.abs(audit.comparisons.desY3S8.residualSigma) < 1.3);
  assert(Math.abs(audit.comparisons.sptClusterAbundanceS8.residualSigma) < 0.1);
  assert(Math.abs(audit.comparisons.desiDr1PeculiarVelocityFsigma8.residualSigma) < 0.5);
});
