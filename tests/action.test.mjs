import test from 'node:test';
import assert from 'node:assert/strict';
import {ActionWorld} from '../src/modules/subqg_action.mjs';
function world(){const w=new ActionWorld({seed:42});for(let i=0;i<400;i++)w.step();return w;}
test('no source -> flat unit metric',()=>{const w=world();const r=w.minimize();assert.ok(Math.abs(r.meanLength-1)<1e-12);});
test('source decreases action and contracts nearby edges',()=>{const w=world();assert.ok(w.links.size>0);const e=[...w.links.values()][0];w.setMass(e.a,2);const r=w.minimize();assert.ok(r.finalAction<=r.initialAction+1e-8);assert.ok(w.edgeLength(e)<1);});
test('minimization is idempotent',()=>{const w=world();const e=[...w.links.values()][0];w.setMass(e.a,2);w.minimize();const a=w.action();w.minimize();assert.ok(Math.abs(w.action()-a)<1e-7);});
test('remove source recovers metric',()=>{const w=world();const e=[...w.links.values()][0];w.setMass(e.a,2);w.minimize();w.setMass(e.a,0);w.minimize();assert.ok(Math.abs(w.edgeLength(e)-1)<1e-6);});
test('identical seed and excitation reproduce solution',()=>{const a=world(),b=world();const e=[...a.links.values()][0];a.setMass(e.a,2);b.setMass(e.a,2);assert.deepEqual(a.minimize(),b.minimize());});
test('zero edges well-defined',()=>{const w=new ActionWorld();const r=w.minimize();assert.equal(r.edgeCount,0);assert.equal(r.finalAction,0);});
test('invalid parameters rejected',()=>{assert.throws(()=>new ActionWorld({anchor:0}),RangeError);assert.throws(()=>new ActionWorld({stiffness:-1}),RangeError);});
test('causal clocks unaffected by minimization',()=>{const w=world();const before=JSON.stringify(w.causalSnapshot());w.minimize();assert.equal(JSON.stringify(w.causalSnapshot()),before);});
