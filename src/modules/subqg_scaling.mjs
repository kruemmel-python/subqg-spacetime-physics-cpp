/** v18: finite-size scaling, saturation and density diagnostics. */
import {IntrinsicWorld} from './subqg_intrinsic.mjs';
import {adjacency} from './subqg_dimension.mjs';
import {analyzeGraph,summarize,lattice} from './subqg_spectral_ensemble.mjs';

export function graphDiagnostics(adj) {
 const n=adj.length, degree=adj.map(a=>a.length);
 const seen=new Uint8Array(n); const sizes=[];
 for(let i=0;i<n;i++)if(!seen[i]){
  let size=0;const queue=[i];seen[i]=1;
  for(let h=0;h<queue.length;h++){const u=queue[h];size++;for(const v of adj[u])if(!seen[v]){seen[v]=1;queue.push(v);}}
  sizes.push(size);
 }
 return {nodes:n,edges:degree.reduce((a,b)=>a+b,0)/2,meanDegree:n?degree.reduce((a,b)=>a+b,0)/n:0,
  edgeDensity:n>1?degree.reduce((a,b)=>a+b,0)/(n*(n-1)):0,
  components:sizes.length,largestComponent:sizes.length?Math.max(...sizes):0};
}
export function runScaling({caps=[60,120,240,360],seeds=[11,23,42],steps=2400,linkThreshold=0.54,sources=16,maxSteps=45}={}){
 if(!caps.length||!seeds.length||caps.some(x=>!Number.isInteger(x)||x<3)||!Number.isInteger(steps)||steps<1)throw new RangeError('scaling parameters');
 const samples=[];
 for(const cap of caps)for(const seed of seeds){
  const world=new IntrinsicWorld({seed,threshold:0.42,linkThreshold,maxNodes:cap});world.run(steps);
  const adj=adjacency(world.nodes.length,world.links.values());
  const diagnostics=graphDiagnostics(adj),spectral=analyzeGraph(adj,{sources,maxSteps,windows:[[4,12],[12,25],[25,40]]});
  samples.push({cap,seed,steps,faces:world.faces.size,saturated:world.nodes.length===cap,...diagnostics,dimensions:spectral.windows.map(x=>x.dimension)});
 }
 const groups=caps.map(cap=>{const subset=samples.filter(x=>x.cap===cap);return {cap,n:subset.length,
  nodeCount:summarize(subset.map(x=>x.nodes)),meanDegree:summarize(subset.map(x=>x.meanDegree)),
  density:summarize(subset.map(x=>x.edgeDensity)),largestFraction:summarize(subset.map(x=>x.nodes?x.largestComponent/x.nodes:0)),
  dimensions:[0,1,2].map(i=>summarize(subset.map(x=>x.dimensions[i]))),saturated:subset.filter(x=>x.saturated).length};});
 return {parameters:{caps,seeds,steps,linkThreshold,sources,maxSteps},groups,samples};
}
export function controlScaling(){return [1,2,3].map(d=>({dimension:d,side:d===1?120:d===2?12:5,...graphDiagnostics(lattice(d,d===1?120:d===2?12:5)),spectral:analyzeGraph(lattice(d,d===1?120:d===2?12:5),{sources:16,maxSteps:45,windows:[[4,12],[12,25],[25,40]]}).windows.map(x=>x.dimension)}));}
