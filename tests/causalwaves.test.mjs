import test from 'node:test';
import assert from 'node:assert/strict';
import {CausalWaveWorld,compareRefinement} from '../src/modules/subqg_causal_waves.mjs';
function build(){const w=new CausalWaveWorld({seed:42,threshold:1e-12});w.run(120);w.solveJoint({iterations:500});return w;}
test('wave events absent before any pulse',()=>{const w=build();w.initializeWaves({dt:.005});assert.equal(w.causalEvents.length,0);});
test('pulse generates initial local causal event',()=>{const w=build();w.initializeWaves({dt:.005});w.pulse(0);assert.equal(w.causalEvents.length,1);assert.equal(w.causalEvents[0].time,0);});
test('causal parents strictly precede children',()=>{const w=build();w.initializeWaves({dt:.005});w.pulse(0);for(let i=0;i<50;i++)w.stepWave();for(const e of w.causalEvents)for(const p of e.parents){assert.ok(p<e.id);assert.ok(w.causalEvents[p].time<e.time);}});
test('no duplicated arrivals',()=>{const w=build();w.initializeWaves({dt:.005});w.pulse(0);for(let i=0;i<80;i++)w.stepWave();assert.equal(new Set(w.causalEvents.map(e=>e.node)).size,w.causalEvents.length);});
test('zero pulse does not generate events',()=>{const w=build();w.initializeWaves({dt:.005});w.pulse(0,0);assert.equal(w.causalEvents.length,0);});
test('time parameter advances independently of event count',()=>{const w=build();w.initializeWaves({dt:.005});w.stepWave();assert.equal(w.integrationTime,.005);assert.equal(w.causalEvents.length,0);});
test('dt refinement improves displacement solution',()=>{const factory=()=>build();const source=build().edgesOrdered()[0].a;const a=compareRefinement(factory,{source,dt:.01,steps:50});const b=compareRefinement(factory,{source,dt:.005,steps:100});assert.ok(b.rmsDisplacementError<a.rmsDisplacementError);});
test('repeatability',()=>{const run=()=>{const w=build();w.initializeWaves({dt:.005});w.pulse(0);for(let i=0;i<30;i++)w.stepWave();return w.snapshot();};assert.deepEqual(run(),run());});
