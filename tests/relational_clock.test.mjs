import test from 'node:test';
import assert from 'node:assert/strict';
import {buildBonds} from '../src/modules/subqg_fpv.mjs';
import {initialConstraint,constraint,gaugeStep,evolveGauge,experiment} from '../src/modules/subqg_relational_clock.mjs';
const bonds=buildBonds([0,0],0.7);
const initial=()=>initialConstraint([1,-1],[0,0],bonds);
test('constraint vanishes initially',()=>assert.ok(Math.abs(constraint(initial()))<1e-12));
test('no external spatial coordinates required',()=>assert.equal(bonds.length,1));
test('clock monotonic for positive lapse',()=>assert.equal(gaugeStep(initial(),0.1,2).T,0.2));
test('lapse changes gauge parameter but not clock evolution',()=>{
 const a=evolveGauge(initial(),[{dLambda:0.005,lapse:1,steps:400}]);
 const b=evolveGauge(initial(),[{dLambda:0.0025,lapse:2,steps:400}]);
 assert.ok(Math.abs(a.T-b.T)<1e-12);
 assert.ok(Math.max(...a.q.map((x,i)=>Math.abs(x-b.q[i])))<1e-12);
});
test('constraint remains close to zero with convergent integrator',()=>{
 const r=evolveGauge(initial(),[{dLambda:0.001,lapse:1,steps:2000}]);
 assert.ok(Math.abs(constraint(r))<2e-6);
});
test('analytical relational trajectory reproduced',()=>{
 const e=experiment();
 assert.ok(e.results.every(x=>x.relationalError<2e-5));
});
test('gauge label can differ while relational clock is same',()=>{
 const e=experiment();
 assert.ok(Math.abs(e.results[0].T-e.results[1].T)<1e-10);
 assert.notEqual(e.results[0].lambda,e.results[1].lambda);
});
test('invalid gauge steps rejected',()=>assert.throws(()=>gaugeStep(initial(),-1,1)));
test('missing clock is not silently called emergent',()=>assert.match(experiment().interpretation,/NOT derived/));
