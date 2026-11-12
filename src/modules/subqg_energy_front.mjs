import {intrinsicDistances} from './subqg_signal_speed.mjs';

/** Energy transport diagnostic, not a causal or relativistic wavefront. */
export function energyProfile(world, source, quantiles=[0.5,0.9,0.99]) {
  if (!Number.isInteger(source) || source<0 || source>=world.nodes.length) throw new RangeError('invalid source');
  if (!Array.isArray(quantiles)||quantiles.some(q=>!Number.isFinite(q)||q<=0||q>1)) throw new RangeError('invalid quantiles');
  const dist=intrinsicDistances(world,source);
  const energy=world.velocity.map(v=>0.5*v*v);
  for(const {a,b,w} of world.waveEdges){const part=0.25*w*(world.displacement[a]-world.displacement[b])**2;energy[a]+=part;energy[b]+=part;}
  const entries=energy.map((value,node)=>({node,distance:dist[node],energy:value})).filter(e=>Number.isFinite(e.distance)).sort((a,b)=>a.distance-b.distance||a.node-b.node);
  const total=entries.reduce((s,e)=>s+e.energy,0);
  let acc=0;
  const cumulative=entries.map(e=>({...e,fraction:total>0?(acc+=e.energy)/total:0}));
  const radii=quantiles.map(q=>({quantile:q,radius:total>0?(cumulative.find(e=>e.fraction>=q-1e-13)?.distance??null):null}));
  const meanRadius=total>0?entries.reduce((s,e)=>s+e.energy*e.distance,0)/total:null;
  return {total,meanRadius,radii,entries:cumulative};
}

export function traceEnergyFront(world,source,{dt=0.005,steps=200,sampleEvery=20,quantiles=[0.5,0.9,0.99]}={}){
  if(!Number.isInteger(steps)||steps<0||!Number.isInteger(sampleEvery)||sampleEvery<1)throw new RangeError('invalid steps');
  world.initializeWaves({dt});world.pulse(source);
  const samples=[];
  for(let i=0;i<=steps;i++){
    if(i%sampleEvery===0||i===steps){const p=energyProfile(world,source,quantiles);samples.push({step:i,integratorTime:i*dt,totalEnergy:p.total,meanRadius:p.meanRadius,radii:p.radii});}
    if(i<steps)world.stepWave();
  }
  return {source,dt,steps,samples};
}
