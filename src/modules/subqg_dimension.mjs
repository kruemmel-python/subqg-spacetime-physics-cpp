/** Finite-size graph volume-growth audit. No ambient coordinates are used for SubQG. */
import { IntrinsicWorld } from './subqg_intrinsic.mjs';

export function adjacency(nodeCount, edges) {
  if (!Number.isInteger(nodeCount) || nodeCount < 0) throw new RangeError('nodeCount');
  const out = Array.from({length: nodeCount}, () => new Set());
  for (const edge of edges) {
    const {a,b} = edge;
    if (![a,b].every(Number.isInteger) || a < 0 || b < 0 || a >= nodeCount || b >= nodeCount || a === b) throw new RangeError('edge');
    out[a].add(b); out[b].add(a);
  }
  return out.map(s => [...s].sort((a,b)=>a-b));
}

export function graphDistances(adj, source) {
  if (!Number.isInteger(source) || source < 0 || source >= adj.length) throw new RangeError('source');
  const d = Array(adj.length).fill(Infinity); d[source]=0;
  const queue=[source];
  for(let i=0;i<queue.length;i++) for(const v of adj[queue[i]]) if(d[v]===Infinity){d[v]=d[queue[i]]+1;queue.push(v);}
  return d;
}

export function estimateDimension(adj, {sources=32,minRadius=1,excludeSaturated=true}={}) {
  if (!Number.isInteger(sources) || sources<1) throw new RangeError('sources');
  const n=adj.length;
  if(n===0)return {nodeCount:0, sampled:0, estimates:[], median:null, reason:'empty'};
  const selected=Array.from({length:Math.min(n,sources)},(_,i)=>Math.floor((i+0.5)*n/Math.min(n,sources)));
  const estimates=[]; const diagnostics=[];
  for(const source of selected){
    const ds=graphDistances(adj,source), reachable=ds.filter(Number.isFinite).length;
    const eccentricity=Math.max(...ds.filter(Number.isFinite));
    const samples=[];
    for(let r=minRadius;r<=eccentricity;r++){
      const volume=ds.filter(x=>x<=r).length;
      if(r>0 && volume>1 && (!excludeSaturated || volume<reachable))samples.push([Math.log(r),Math.log(volume)]);
    }
    const mx=samples.reduce((s,p)=>s+p[0],0)/Math.max(1,samples.length);
    const my=samples.reduce((s,p)=>s+p[1],0)/Math.max(1,samples.length);
    const den=samples.reduce((s,p)=>s+(p[0]-mx)**2,0);
    const slope=samples.length>=2 && den>1e-12 ? samples.reduce((s,p)=>s+(p[0]-mx)*(p[1]-my),0)/den : null;
    if(slope!==null)estimates.push(slope);
    diagnostics.push({source,reachable,eccentricity,fitRadii:samples.length,slope});
  }
  const sorted=estimates.toSorted((a,b)=>a-b);
  const median=sorted.length ? (sorted[Math.floor((sorted.length-1)/2)]+sorted[Math.floor(sorted.length/2)])/2 : null;
  return {nodeCount:n,sampled:selected.length,validFits:sorted.length,median,range:sorted.length?[sorted[0],sorted.at(-1)]:null,diagnostics,reason:sorted.length?'finite-size effective graph volume-growth exponent':'insufficient unsaturated radii'};
}

export function buildControl(kind,n){
  if(!Number.isInteger(n)||n<3)throw new RangeError('n');
  const edges=[];
  if(kind==='cycle')for(let i=0;i<n;i++)edges.push({a:i,b:(i+1)%n});
  else if(kind==='clique')for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)edges.push({a:i,b:j});
  else if(kind==='grid'){
    const side=Math.floor(Math.sqrt(n));
    for(let y=0;y<side;y++)for(let x=0;x<side;x++){
      const i=y*side+x;
      if(x+1<side)edges.push({a:i,b:i+1});
      if(y+1<side)edges.push({a:i,b:i+side});
    }
    return adjacency(side*side,edges);
  } else throw new RangeError('kind');
  return adjacency(n,edges);
}

export function auditWorld({seed=42,steps=300,threshold=0.42,linkThreshold=0.54,maxNodes=180,sources=32}={}){
  const world=new IntrinsicWorld({seed,threshold,linkThreshold,maxNodes});world.run(steps);
  const adj=adjacency(world.nodes.length,world.links.values());
  return {seed,steps,threshold,linkThreshold,nodes:world.nodes.length,links:world.links.size,faces:world.faces.size,dimension:estimateDimension(adj,{sources})};
}
