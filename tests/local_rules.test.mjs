import test from 'node:test';
import assert from 'node:assert/strict';
import {relationalLinks,runLocalRuleAudit} from '../src/modules/subqg_local_rules.mjs';
import {validateGraph} from '../src/modules/subqg_topology_audit.mjs';
const nodes=Array.from({length:14},(_,i)=>({amp:1+i*.02,phase:i*.19}));
for(const mode of ['affinity','phase-local','triadic']){
 test(`${mode} undirected and degree bounded`,()=>{const a=relationalLinks(nodes,{mode,maxDegree:4});assert.equal(validateGraph(a),true);assert.ok(a.every(x=>x.length<=4));});
 test(`${mode} deterministic`,()=>assert.deepEqual(relationalLinks(nodes,{mode}),relationalLinks(nodes,{mode})));
}
test('invalid mode rejected',()=>assert.throws(()=>relationalLinks(nodes,{mode:'invented'}),RangeError));
test('invalid degree rejected',()=>assert.throws(()=>relationalLinks(nodes,{maxDegree:0}),RangeError));
test('small audit yields all six matched families',()=>{const r=runLocalRuleAudit({caps:[20],seeds:[7],steps:160,sources:5});assert.equal(r.groups.length,6);assert.equal(r.samples.length,6);assert.ok(r.samples.every(x=>x.nodes>0));});
