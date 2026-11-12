import test from 'node:test';
import assert from 'node:assert/strict';
import {WaveWorld} from '../src/modules/subqg_waves.mjs';
import {energyProfile,traceEnergyFront} from '../src/modules/subqg_energy_front.mjs';
function world(){const w=new WaveWorld({seed:42});w.run(300);return w;}
test('initial localized pulse energy is finite and at source',()=>{const w=world();w.initializeWaves({dt:.005});const source=w.edgesOrdered()[0].a;w.pulse(source);const p=energyProfile(w,source);assert.ok(p.total>0);assert.ok(p.radii.every(r=>r.radius!==null));});
test('local energy allocation equals global wave energy',()=>{const w=world();w.initializeWaves({dt:.005});const source=w.edgesOrdered()[0].a;w.pulse(source);for(let i=0;i<30;i++)w.stepWave();assert.ok(Math.abs(energyProfile(w,source).total-w.waveEnergy().total)<1e-9);});
test('quantile radii are ordered',()=>{const w=world();const source=w.edgesOrdered()[0].a;const r=traceEnergyFront(w,source,{steps:40,sampleEvery:10});for(const s of r.samples){const a=s.radii.map(q=>q.radius);assert.ok(a[0]<=a[1]&&a[1]<=a[2]);}});
test('zero energy has null radius',()=>{const w=world();w.initializeWaves({dt:.005});const p=energyProfile(w,0);assert.equal(p.total,0);assert.equal(p.meanRadius,null);});
test('invalid quantiles rejected',()=>{const w=world();w.initializeWaves({dt:.005});assert.throws(()=>energyProfile(w,0,[0]));});
test('reproducible front trace',()=>{const run=()=>{const w=world();return traceEnergyFront(w,w.edgesOrdered()[0].a,{steps:40,sampleEvery:10});};assert.deepEqual(run(),run());});
