import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  canonicalRelationalBackgroundAudit,
  deriveSubstrateClusteringClosure,
  museDarkIIIHScalingAudit
} from '../../src/modules/subqg_cosmology.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'cosmology_validation.json');
const result = {
  schemaVersion: 3,
  relationalBackground: canonicalRelationalBackgroundAudit(),
  substrateClusteringClosure: deriveSubstrateClusteringClosure(),
  museDarkIII: museDarkIIIHScalingAudit()
};
fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  resultPath,
  relationalBackground: {
    sampleCount: result.relationalBackground.sampleCount,
    finalSpatialCellVolume: result.relationalBackground.finalSpatialCellVolume,
    maximumNormalizedClockDisagreement: result.relationalBackground.maximumNormalizedClockDisagreement,
    backgroundScaleFactorKinematicsConstructed:
      result.relationalBackground.backgroundScaleFactorKinematicsConstructed,
    uniqueGlobalRelationalTimeDerived: result.relationalBackground.uniqueGlobalRelationalTimeDerived
  },
  substrateClusteringClosure: result.substrateClusteringClosure.verdict,
  comparison: result.museDarkIII.comparison,
  verdict: result.museDarkIII.verdict
}, null, 2));
