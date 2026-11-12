import test from 'node:test';
import assert from 'node:assert/strict';
import {CausalWaveWorld} from '../src/modules/subqg_causal_waves.mjs';
import {intrinsicDistances,measureSignalSpeed,compareSignalSpeeds} from '../src/modules/subqg_signal_speed.mjs';
function activeSource(w){return w.edgesOrdered()[0].a;}
function build(){const w=new CausalWaveWorld({seed:42});w.run(120);w.solveJoint({iterations:500});return w;}
test('distance from source is zero',()=>{const w=build();w.initializeWaves({dt:.005});assert.equal(intrinsicDistances(w,0)[0],0);});
test('graph distance is symmetric',()=>{const w=build();w.initializeWaves({dt:.005});const a=intrinsicDistances(w,0);for(let i=0;i<a.length;i++)if(Number.isFinite(a[i]))assert.ok(Math.abs(intrinsicDistances(w,i)[0]-a[i])<1e-8);});
test('unreachable nodes stay infinite',()=>{const w=build();w.initializeWaves({dt:.005});const d=intrinsicDistances(w,0);assert.equal(d.length,w.nodes.length);assert.ok(d.every(x=>x>=0));});
test('arrival speed has positive finite values',()=>{const m=measureSignalSpeed(build(),activeSource(build()),{steps:100});assert.ok(m.arrived>0);assert.ok(m.samples.every(x=>x.speed>0&&Number.isFinite(x.speed)));});
test('repeatable speed measurements',()=>{const a=measureSignalSpeed(build(),activeSource(build()),{steps:80});const b=measureSignalSpeed(build(),activeSource(build()),{steps:80});assert.deepEqual(a,b);});
test('zero duration rejected',()=>assert.throws(()=>measureSignalSpeed(build(),activeSource(build()),{steps:0}),RangeError));
test('refinement yields comparable speed statistic',()=>{const a=measureSignalSpeed(build(),activeSource(build()),{dt:.01,steps:100});const b=measureSignalSpeed(build(),activeSource(build()),{dt:.005,steps:200});assert.ok(a.medianApparentSpeed>0&&b.medianApparentSpeed>0);});
test('source comparison returns distinct diagnostics',()=>{const a=compareSignalSpeeds(build,{sources:[activeSource(build()),build().edgesOrdered()[0].b],steps:100});assert.equal(a.measurements.length,2);});
