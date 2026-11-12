import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { museDarkIIIHScalingAudit } from '../../src/modules/subqg_cosmology.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resultPath = path.resolve(scriptDir, '..', 'results', 'cosmology_validation.json');
const result = museDarkIIIHScalingAudit();
fs.mkdirSync(path.dirname(resultPath), { recursive: true });
fs.writeFileSync(resultPath, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ resultPath, comparison: result.comparison, verdict: result.verdict }, null, 2));
