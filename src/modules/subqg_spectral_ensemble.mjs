/** Reproducible multi-seed spectral diagnostics with explicit finite-size caveats. */
import {spectralAudit} from './subqg_spectral.mjs';
import {adjacency} from './subqg_dimension.mjs';
import {IntrinsicWorld} from './subqg_intrinsic.mjs';

export function lattice(dimension, side) {
 if(![1,2,3].includes(dimension)||!Number.isInteger(side)||side<3)throw new RangeError('lattice');
 const n=side**dimension, adj=Array.from({length:n},()=>[]);
 for(let i=0;i<n;i++)for(let axis=0;axis<dimension;axis++){
  const stride=side**axis;
  if(Math.floor(i/stride)%side===side-1)continue;
  const j=i+stride;adj[i].push(j);adj[j].push(i);
 }
 return adj;
}
export function summarize(values) {
 const sorted=values.filter(Number.isFinite).toSorted((a,b)=>a-b);
 if(!sorted.length)return {count:0,median:null,mean:null,sd:null,min:null,max:null};
 const mean=sorted.reduce((a,b)=>a+b,0)/sorted.length;
 const sd=sorted.length>1?Math.sqrt(sorted.reduce((a,b)=>a+(b-mean)**2,0)/(sorted.length-1)):null;
 return {count:sorted.length,median:sorted[Math.floor((sorted.length-1)/2)]/2+sorted[Math.floor(sorted.length/2)]/2,mean,sd,min:sorted[0],max:sorted.at(-1)};
}
export function windowDimension(curves,lo,hi) {
 if(!Number.isInteger(lo)||!Number.isInteger(hi)||lo<1||hi<=lo)throw new RangeError('window');
 const points=curves.filter(x=>x.step>=lo&&x.step<=hi&&x.returnProbability>0);
 if(points.length<3)return null;
 const xs=points.map(x=>Math.log(x.step)),ys=points.map(x=>Math.log(x.returnProbability));
 const mx=xs.reduce((a,b)=>a+b,0)/xs.length,my=ys.reduce((a,b)=>a+b,0)/ys.length;
 const den=xs.reduce((a,b)=>a+(b-mx)**2,0);
 return den>0?-2*xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0)/den:null;
}
export function analyzeGraph(adj,{sources=24,maxSteps=60,windows=[[4,12],[12,28],[28,55]]}={}){
 const result=spectralAudit(adj,{sources,maxSteps});
 return {nodes:adj.length,windows:windows.map(([lo,hi])=>({range:[lo,hi],dimension:windowDimension(result.curves,lo,hi)})),returnTail:result.curves.at(-1)?.returnProbability??null};
}
export function ensemble({seeds=[11,23,42,71,101],steps=[300,600,900],maxNodes=180,linkThreshold=0.54,sources=24,maxSteps=60}={}){
 if(!seeds.length||!steps.length)throw new RangeError('ensemble');
 const samples=[];
 for(const count of steps)for(const seed of seeds){
  const world=new IntrinsicWorld({seed,threshold:0.42,linkThreshold,maxNodes});world.run(count);
  const adj=adjacency(world.nodes.length,world.links.values());
  samples.push({seed,steps:count,links:world.links.size,faces:world.faces.size,...analyzeGraph(adj,{sources,maxSteps})});
 }
 const groups=steps.map(count=>({steps:count,samples:samples.filter(x=>x.steps===count).length,dimensions:[0,1,2].map(i=>summarize(samples.filter(x=>x.steps===count).map(x=>x.windows[i].dimension)))}));
 return {parameters:{seeds,steps,maxNodes,linkThreshold,sources,maxSteps},groups,samples};
}
