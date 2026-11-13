import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  auditSubQGStructureAmplitude,
  deriveSubQGFluidBackground
} from '../../src/modules/subqg_cosmological_background.mjs';

const validationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsRoot = path.join(validationRoot, 'results');
const readResult = filename => JSON.parse(fs.readFileSync(
  path.join(resultsRoot, filename), 'utf8'));

const backgroundResult = readResult('subqg_background_bao_validation.json');
const cmbResult = readResult('subqg_cmb_spectrum_validation.json');
const profile = backgroundResult.profiledBbnBaoCmb;
const background = deriveSubQGFluidBackground({
  physicalBaryonDensity: profile.bestPhysicalBaryonDensity,
  hubbleConstantKmPerSecMpc: profile.bestHubbleConstantKmPerSecMpc
});
const audit = auditSubQGStructureAmplitude(background, {
  sigma8AtZero: cmbResult.model.sigma8
});
const result = {
  schemaVersion: 1,
  generatedBy: 'validation/scripts/subqg_structure_growth_validation.mjs',
  frozenInputs: {
    networkToBaryonRatio: background.networkToBaryonEnergyRatio,
    physicalBaryonDensity: profile.bestPhysicalBaryonDensity,
    hubbleConstantKmPerSecMpc: profile.bestHubbleConstantKmPerSecMpc,
    spectralIndex: cmbResult.model.spectralIndex,
    scalarAmplitude: cmbResult.model.scalarAmplitude,
    sigma8AtZero: cmbResult.model.sigma8
  },
  audit,
  verdict: {
    independentLateTimeStructurePassed:
      audit.allIndependentStructureChecksPassThreeSigma,
    primordialAmplitudeDerivedFromSubQGAction: false,
    status: audit.allIndependentStructureChecksPassThreeSigma
      ? 'CMB_NORMALIZED_SUBQG_GROWTH_PASSES_INDEPENDENT_STRUCTURE_PRIMORDIAL_ORIGIN_OPEN'
      : 'SUBQG_GROWTH_FAILS_INDEPENDENT_STRUCTURE'
  },
  sources: [
    { title: 'DESI 2024 V: Full-Shape Galaxy Clustering', arxiv: '2411.12021',
      observable: 'sigma8=0.842+/-0.034' },
    { title: 'DES Year 3 3x2pt cosmology', arxiv: '2105.13549',
      observable: 'S8=0.776+/-0.017' },
    { title: 'SPT clusters with DES and HST weak lensing II', arxiv: '2401.02075',
      observable: 'cluster abundance S8=0.795+/-0.029' },
    { title: 'DESI DR1 Peculiar Velocity consensus', arxiv: '2512.03230',
      observable: 'f sigma8(z=0.07)=0.450+/-0.055' }
  ]
};
const resultPath = path.join(resultsRoot, 'subqg_structure_growth_validation.json');
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, verdict: result.verdict,
  comparisons: audit.comparisons }, null, 2));
