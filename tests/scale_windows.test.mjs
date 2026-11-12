import test from 'node:test';import assert from 'node:assert/strict';
import {windowSlopes,runScaleWindows} from '../src/modules/subqg_scale_windows.mjs';
test('reject too few samples',()=>assert.throws(()=>windowSlopes([]),RangeError));
test('power law dimension two',()=>{const p=Array.from({length:19},(_,i)=>({radius:Math.exp(i*.2),meanVolume:3*Math.exp(i*.4)}));const x=windowSlopes(p);assert.ok(x.windows.every(w=>Math.abs(w.slope-2)<1e-9));assert.equal(x.plateau,true);});
test('non power law does not produce plateau',()=>{const p=Array.from({length:19},(_,i)=>({radius:Math.exp(i*.2),meanVolume:Math.exp(i*.1+i*i*.015)}));assert.equal(windowSlopes(p).plateau,false);});
test('invalid profiles ignored safely',()=>{const p=Array.from({length:19},(_,i)=>({radius:i===0?0:i,meanVolume:i+1}));assert.equal(windowSlopes(p).windows.length,3);});
test('deterministic small ensemble',()=>{const args={caps:[40],seeds:[42],steps:600,sources:5};assert.deepEqual(runScaleWindows(args),runScaleWindows(args));});
test('all three graph families included',()=>{const x=runScaleWindows({caps:[40],seeds:[42],steps:600,sources:5});assert.deepEqual(x.groups.map(g=>g.rule),['original','bounded','null']);});
