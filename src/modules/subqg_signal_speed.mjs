import {CausalWaveWorld} from './subqg_causal_waves.mjs';

/** Diagnostic only: threshold arrival speed in graph-distance / integrator-time units. */
export function intrinsicDistances(world, source) {
  const n=world.nodes.length;
  if(!Number.isInteger(source)||source<0||source>=n)throw new RangeError('invalid source');
  const adj=Array.from({length:n},()=>[]);
  for(const e of world.waveEdges){
    if(!(e.w>0))continue;
    const length=Math.exp(world.logMetric.get(world.key(e.a,e.b))??0);
    adj[e.a].push([e.b,length]);adj[e.b].push([e.a,length]);
  }
  const dist=Array(n).fill(Infinity),used=Array(n).fill(false);dist[source]=0;
  for(let step=0;step<n;step++){
    let u=-1;
    for(let i=0;i<n;i++)if(!used[i]&&(u<0||dist[i]<dist[u]))u=i;
    if(u<0||!Number.isFinite(dist[u]))break;
    used[u]=true;
    for(const [v,w] of adj[u])dist[v]=Math.min(dist[v],dist[u]+w);
  }
  return dist;
}

export function measureSignalSpeed(world,source,{dt=0.005,steps=200,threshold=1e-12,amplitude=1}={}){
  if(!(world instanceof CausalWaveWorld))throw new TypeError('expected CausalWaveWorld');
  if(!(Number.isInteger(steps)&&steps>0&&Number.isFinite(dt)&&dt>0&&Number.isFinite(threshold)&&threshold>0))throw new RangeError('invalid measurement parameters');
  world.threshold=threshold;
  world.initializeWaves({dt});
  const distances=intrinsicDistances(world,source);
  world.pulse(source,amplitude);
  for(let i=0;i<steps;i++)world.stepWave();
  const samples=world.arrivals.flatMap((a,i)=>a&&a.time>0&&Number.isFinite(distances[i])?[{node:i,distance:distances[i],arrival:a.time,speed:distances[i]/a.time,hops:world.hopDistances(source)[i]}]:[]);
  const speeds=samples.map(s=>s.speed).sort((a,b)=>a-b);
  const median=speeds.length?(speeds.length%2?speeds[(speeds.length-1)/2]:(speeds[speeds.length/2-1]+speeds[speeds.length/2])/2):null;
  return {source,dt,threshold,elapsed:steps*dt,arrived:samples.length,reachable:distances.filter(Number.isFinite).length-1,medianApparentSpeed:median,minApparentSpeed:speeds[0]??null,maxApparentSpeed:speeds.at(-1)??null,samples};
}

export function compareSignalSpeeds(makeWorld,{sources,dt=0.005,steps=200,threshold=1e-12}={}){
  if(!Array.isArray(sources)||!sources.length)throw new RangeError('sources required');
  const measurements=sources.map(source=>measureSignalSpeed(makeWorld(),source,{dt,steps,threshold}));
  return {measurements,medianSpread:measurements.every(x=>x.medianApparentSpeed!==null)?Math.max(...measurements.map(x=>x.medianApparentSpeed))/Math.min(...measurements.map(x=>x.medianApparentSpeed)):null};
}
