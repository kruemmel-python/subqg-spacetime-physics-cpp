/** v19: controlled link-rule comparison; no spatial coordinates. */
import {IntrinsicWorld} from './subqg_intrinsic.mjs';
import {adjacency} from './subqg_dimension.mjs';
import {analyzeGraph,summarize} from './subqg_spectral_ensemble.mjs';
import {graphDiagnostics} from './subqg_scaling.mjs';

export function boundedAffinity(nodes, maxDegree=6) {
 if(!Number.isInteger(maxDegree)||maxDegree<1)throw new RangeError('maxDegree');
 const adj=Array.from({length:nodes.length},()=>[]);
 const candidates=[];
 for(let i=0;i<nodes.length;i++)for(let j=0;j<i;j++){
  const a=nodes[i],b=nodes[j];
  const strength=Math.sqrt(a.amp*b.amp)*Math.max(0,Math.cos(a.phase-b.phase));
  candidates.push({i,j,strength});
 }
 candidates.sort((a,b)=>b.strength-a.strength||a.i-b.i||a.j-b.j);
 for(const {i,j} of candidates)if(adj[i].length<maxDegree&&adj[j].length<maxDegree){adj[i].push(j);adj[j].push(i);}
 return adj.map(row=>row.sort((a,b)=>a-b));
}
export function randomDegreeMatched(nodes, targetEdges, seed=123){
 if(!Number.isInteger(targetEdges)||targetEdges<0||targetEdges>nodes*(nodes-1)/2)throw new RangeError('targetEdges');
 let s=seed>>>0;const rand=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const adj=Array.from({length:nodes},()=>[]),edges=[];
 for(let i=0;i<nodes;i++)for(let j=0;j<i;j++)edges.push([i,j]);
 for(let i=0;i<targetEdges;i++){const j=i+Math.floor(rand()*(edges.length-i));[edges[i],edges[j]]=[edges[j],edges[i]];const [a,b]=edges[i];adj[a].push(b);adj[b].push(a);}
 return adj;
}
export function runLinkAudit({caps=[60,120,240],seeds=[11,23,42],steps=2400,maxDegree=6,sources=12,maxSteps=35}={}){
 if(!caps.length||!seeds.length||caps.some(x=>!Number.isInteger(x)||x<3))throw new RangeError('caps/seeds');
 const samples=[];
 for(const cap of caps)for(const seed of seeds){
  const w=new IntrinsicWorld({seed,threshold:0.42,linkThreshold:0.54,maxNodes:cap});w.run(steps);
  const native=adjacency(w.nodes.length,w.links.values());
  const bounded=boundedAffinity(w.nodes,maxDegree);
  const boundedEdges=graphDiagnostics(bounded).edges;
  const random=randomDegreeMatched(w.nodes.length,boundedEdges,seed+1000);
  for(const [rule,adj] of [['original',native],['bounded',bounded],['random-matched',random]]){
   const d=graphDiagnostics(adj);
   const spectral=analyzeGraph(adj,{sources,maxSteps,windows:[[4,12],[12,25]]});
   samples.push({cap,seed,rule,...d,largestFraction:d.nodes?d.largestComponent/d.nodes:0,dimensions:spectral.windows.map(w=>w.dimension)});
  }
 }
 const groups=[];
 for(const cap of caps)for(const rule of ['original','bounded','random-matched']){
  const x=samples.filter(s=>s.cap===cap&&s.rule===rule);
  groups.push({cap,rule,n:x.length,nodes:summarize(x.map(v=>v.nodes)),meanDegree:summarize(x.map(v=>v.meanDegree)),largestFraction:summarize(x.map(v=>v.largestFraction)),earlyDimension:summarize(x.map(v=>v.dimensions[0])),midDimension:summarize(x.map(v=>v.dimensions[1]))});
 }
 return {parameters:{caps,seeds,steps,maxDegree,sources,maxSteps},groups,samples};
}
