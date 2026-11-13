import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  auditDesiDR2Bao,
  auditPlanckAcousticScale,
  deriveSubQGFluidBackground,
  evolveSubQGLinearGrowth,
  photonBaryonDragHorizon,
  profileBbnCalibratedDesiBao,
  profileBbnDesiPlanckAcousticScale
} from '../../src/modules/subqg_cosmological_background.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const validationRoot = path.resolve(here, '..');
const dataRoot = path.join(validationRoot, 'data');

function dataLines(filename) {
  return fs.readFileSync(path.join(dataRoot, filename), 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
}

const observations = dataLines('desi_dr2_bao_mean.txt').map(line => {
  const [z, value, quantity] = line.split(/\s+/);
  return { z: Number(z), value: Number(value), quantity };
});
const covariance = dataLines('desi_dr2_bao_cov.txt').map(line =>
  line.split(/\s+/).map(Number));

const background = deriveSubQGFluidBackground();
const dragHorizon = photonBaryonDragHorizon(background);
const bao = auditDesiDR2Bao(background, observations, covariance);
const cmbAcousticScale = auditPlanckAcousticScale(background);
const profiledBbnBao = profileBbnCalibratedDesiBao({ observations, covariance });
const profiledBbnBaoCmb = profileBbnDesiPlanckAcousticScale({
  observations, covariance
});
const growth = evolveSubQGLinearGrowth(background, {
  sampleRedshifts: [0, 0.5, 0.8, 1, 1.5, 2]
});
const result = {
  schemaVersion: 1,
  generatedBy: 'validation/scripts/subqg_background_bao_validation.mjs',
  model: {
    ontology: background.ontology,
    targetCosmologyUsed: background.targetCosmologyUsed,
    bbnCalibration: background.bbnCalibration,
    lambdaRatio: background.lambdaRatio,
    networkToBaryonEnergyRatio: background.networkToBaryonEnergyRatio,
    omegaB: background.omegaB,
    omegaSubEffective: background.omegaSubEffective,
    omegaMassiveNeutrino: background.omegaMassiveNeutrino,
    omegaMatter: background.omegaMatter,
    omegaRadiation: background.omegaRadiation,
    omegaVacuum: background.omegaVacuum,
    h: background.h,
    hubbleConstantKmPerSecMpc: background.hubbleConstantKmPerSecMpc,
    w0: background.w0,
    wa: background.wa,
    soundHorizonDragMpc: dragHorizon.soundHorizonMpc
  },
  bao,
  cmbAcousticScale,
  profiledBbnBao,
  profiledBbnBaoCmb,
  growth,
  verdict: {
    backgroundClosureConstructed: true,
    desiDR2BaoAtBbnCentralValuePassed: bao.passesOnePercentGoodnessOfFit,
    jointBbnDesiBaoProfilePassed: profiledBbnBao.passesOnePercentGoodnessOfFit,
    planckAcousticScaleAtBbnCentralValuePassed:
      cmbAcousticScale.passesThreeSigma,
    jointBbnDesiPlanckAcousticProfilePassed:
      profiledBbnBaoCmb.passesOnePercentGoodnessOfFit,
    perturbationGrowthEquationImplemented: true,
    growthAmplitudePredicted: false,
    cosmologyGatePassed: false,
    status: profiledBbnBaoCmb.passesOnePercentGoodnessOfFit
      ? 'JOINT_BBN_DESI_PLANCK_ACOUSTIC_PROFILE_PASSED_FULL_CMB_AND_GROWTH_AMPLITUDE_OPEN'
      : 'FROZEN_BACKGROUND_JOINT_BBN_DESI_PLANCK_ACOUSTIC_PROFILE_NOT_PASSED',
    requiredNextImplementation: profiledBbnBaoCmb.passesOnePercentGoodnessOfFit
      ? 'Derive the primordial SubQG perturbation amplitude and full transfer spectrum.'
      : 'Derive vacuum-sector evolution from the SubQG action, freeze it before looking at the data, and retest the same BBN+DESI+Planck compressed likelihood.'
  },
  sources: [
    {
      title: 'DESI DR2 Results II: Measurements of Baryon Acoustic Oscillations and Cosmological Constraints',
      arxiv: '2503.14738'
    },
    {
      title: 'Official DESI DR2 Gaussian BAO likelihood',
      repository: 'https://github.com/CobayaSampler/bao_data/tree/master/desi_bao_dr2',
      commit: 'bb0c1c9009dc76d1391300e169e8df38fd1096db'
    },
    {
      title: 'The 2024 BBN baryon abundance update',
      arxiv: '2401.15054',
      physicalBaryonDensity: '0.02218 +/- 0.00055'
    },
    {
      title: 'Planck 2018 results VI: Cosmological parameters',
      arxiv: '1807.06209',
      acousticScale100: '1.04110 +/- 0.00031'
    },
    {
      title: 'CAMB Notes',
      url: 'https://camb.info/readme.html',
      role: 'recombination-reference solver only; no runtime dependency'
    }
  ]
};

const resultPath = path.join(validationRoot, 'results',
  'subqg_background_bao_validation.json');
fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, model: result.model, verdict: result.verdict,
  chiSquareAtBbnMean: bao.chiSquare,
  pValueAtBbnMean: bao.pValue,
  profiledJointChiSquare: profiledBbnBao.jointChiSquare,
  profiledJointPValue: profiledBbnBao.pValue,
  cmbResidualSigmaAtBbnMean: cmbAcousticScale.residualSigma,
  profiledBbnBaoCmbJointChiSquare: profiledBbnBaoCmb.jointChiSquare,
  profiledBbnBaoCmbJointPValue: profiledBbnBaoCmb.pValue }, null, 2));
