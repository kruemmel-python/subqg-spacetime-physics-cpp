import test from 'node:test';
import assert from 'node:assert/strict';
import {EmergenceWorld} from '../src/modules/subqg_emergence.mjs';
test('deterministic replay',()=>{
 const a=new EmergenceWorld({seed:123}),b=new EmergenceWorld({seed:123});
 assert.deepEqual(a.run(250),b.run(250));
});
test('no geometry or time without intersections',()=>{
 const w=new EmergenceWorld({seed:3,threshold:1.01});w.run(250);
 assert.equal(w.events.length,0);assert.equal(w.faces.size,0);assert.equal(w.clock,0);
});
test('faces have three distinct nodes and nonzero area',()=>{
 const w=new EmergenceWorld({seed:42,threshold:0.2,radius:0.3});w.run(250);
 assert.ok(w.faces.size>0);
 for(const f of w.faces.values()){assert.equal(new Set(f.ids).size,3);assert.ok(f.area>1e-5);}
 assert.equal(w.clock,w.faces.size);
});
test('clock does not advance on ticks without new micro-faces',()=>{
 const w=new EmergenceWorld({seed:17,threshold:0.4});
 for(const state of w.run(250))if(state.formed===0){const previous=state.clock;assert.equal(state.clock,previous);}
 const replay=new EmergenceWorld({seed:17,threshold:0.4});let previous=0;
 for(const state of replay.run(250)){assert.equal(state.clock-previous,state.formed);previous=state.clock;}
});
