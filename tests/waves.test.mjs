import test from 'node:test';
import assert from 'node:assert/strict';
import {WaveWorld} from '../src/modules/subqg_waves.mjs';
function make(){const w=new WaveWorld({seed:42});w.run(250);assert.ok(w.edgesOrdered().length>0);return w;}
test('initially no wave energy',()=>{const w=make();w.initializeWaves();assert.equal(w.waveEnergy().total,0);});
test('stability guard rejects excessive dt',()=>{const w=make();const s=w.initializeWaves();assert.throws(()=>w.initializeWaves({dt:s.stabilityBound*1.01}),RangeError);});
test('a pulse cannot affect nodes beyond one graph hop in one step',()=>{const w=make();w.initializeWaves();const src=w.edgesOrdered()[0].a;const d=w.hopDistances(src);w.pulse(src);w.stepWave();for(let i=0;i<d.length;i++)if(d[i]>1)assert.equal(w.displacement[i],0);});
test('isolated components do not exchange signals',()=>{const w=make();w.initializeWaves();const src=w.edgesOrdered()[0].a;const d=w.hopDistances(src);w.pulse(src);for(let j=0;j<12;j++)w.stepWave();for(let i=0;i<d.length;i++)if(!Number.isFinite(d[i]))assert.equal(w.displacement[i],0);});
test('wave energy is approximately conserved',()=>{const w=make();w.initializeWaves({dt:0.005});w.pulse(w.edgesOrdered()[0].a);const initial=w.waveEnergy().total;for(let j=0;j<500;j++)w.stepWave();assert.ok(Math.abs(w.waveEnergy().total-initial)/initial<0.01);});
test('repeatable seeded propagation',()=>{const a=make(),b=make();a.initializeWaves();b.initializeWaves();const id=a.edgesOrdered()[0].a;a.pulse(id);b.pulse(id);for(let j=0;j<10;j++){a.stepWave();b.stepWave();}assert.deepEqual(a.displacement,b.displacement);});
test('wave solver does not advance local causal clocks',()=>{const w=make();w.initializeWaves();const before=JSON.stringify([...w.eventClocks]);w.pulse(w.edgesOrdered()[0].a);w.stepWave();assert.equal(JSON.stringify([...w.eventClocks]),before);});
test('metric perturbation changes wave coefficients',()=>{const w=make();const e=w.edgesOrdered()[0],k=w.key(e.a,e.b);w.initializeWaves();const before=w.waveEdges[0].w;w.logMetric.set(k,Math.log(1.2));w.initializeWaves();assert.ok(w.waveEdges[0].w<before);});
