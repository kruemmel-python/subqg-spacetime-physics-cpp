/** V21: weighted intrinsic ball growth. Distances are graph distances, not spacetime intervals. */
import {IntrinsicWorld} from './subqg_intrinsic.mjs';
import {adjacency} from './subqg_dimension.mjs';
import {boundedAffinity} from './subqg_link_audit.mjs';
import {degreePreservingNull,validateGraph} from './subqg_topology_audit.mjs';

export function weightedAdjacency(adj, weights=()=>1){
 validateGraph(adj);
 return adj.map((ns,i)=>ns.map(j=>{const w=weights(i,j);if(!Number.isFinite(w)||w<=0)throw new RangeError('edge weight must be positive');return {to:j,w};}));
}
export function shortestWeighted(graph,source){
 if(!Number.isInteger(source)||source<0||source>=graph.length)throw new RangeError('invalid source');
 const d=Array(graph.length).fill(Infinity),used=new Uint8Array(graph.length);d[source]=0;
 for(let step=0;step<graph.length;step++){
  let u=-1;for(let i=0;i<d.length;i++)if(!used[i]&&(u<0||d[i]<d[u]))u=i;
  if(u<0||!Number.isFinite(d[u]))break;used[u]=1;
  for(const {to,w} of graph[u])if(d[u]+w<d[to])d[to]=d[u]+w;
 }
 return d;
}
export function ballProfile(graph,{sources=12,quantiles=[.15,.25,.35,.45,.55,.65]}={}){
 const n=graph.length;if(!n)return {dimension:null,profiles:[],sourceCount:0};
 const chosen=Array.from({length:Math.min(n,sources)},(_,i)=>Math.floor((i+.5)*n/Math.min(n,sources)));
 const distances=chosen.map(s=>shortestWeighted(graph,s));
 const finite=distances.flatMap(ds=>ds.filter(v=>Number.isFinite(v)&&v>0)).sort((a,b)=>a-b);
 if(finite.length<12)return {dimension:null,profiles:[],sourceCount:chosen.length};
 const profiles=quantiles.map(q=>{
  const radius=finite[Math.min(finite.length-1,Math.floor(q*(finite.length-1)))];
  const volumes=distances.map(ds=>ds.filter(d=>d<=radius).length);
  return {radius,meanVolume:volumes.reduce((a,b)=>a+b,0)/volumes.length};
 });
 const valid=profiles.filter(p=>p.radius>0&&p.meanVolume>1);
 const x=valid.map(p=>Math.log(p.radius)),y=valid.map(p=>Math.log(p.meanVolume));
 const mx=x.reduce((a,b)=>a+b,0)/x.length,my=y.reduce((a,b)=>a+b,0)/y.length;
 const den=x.reduce((a,v)=>a+(v-mx)**2,0),dimension=den>1e-12?x.reduce((a,v,i)=>a+(v-mx)*(y[i]-my),0)/den:null;
 return {dimension,profiles,sourceCount:chosen.length};
}
export function runMetricScaling({caps=[60,120,240],seeds=[11,23,42],steps=2400,maxDegree=6,sources=12}={}){
 const samples=[];
 for(const cap of caps)for(const seed of seeds){
  const world=new IntrinsicWorld({seed,threshold:.42,linkThreshold:.54,maxNodes:cap});world.run(steps);
  const original=adjacency(world.nodes.length,world.links.values());
  const bounded=boundedAffinity(world.nodes,maxDegree);
  const nullGraph=degreePreservingNull(bounded,seed+7001).adj;
  const boundedWeights=[];for(let i=0;i<bounded.length;i++)for(const j of bounded[i])if(i<j)boundedWeights.push(1/Math.max(.05,world.overlap(world.nodes[i],world.nodes[j])));
  const nullKeys=[];for(let i=0;i<nullGraph.length;i++)for(const j of nullGraph[i])if(i<j)nullKeys.push(`${i}:${j}`);
  const nullWeightMap=new Map(nullKeys.map((key,i)=>[key,boundedWeights[i]]));
  for(const [rule,adj] of [['original',original],['bounded',bounded],['null',nullGraph]]){
   const edgeWeights=(i,j)=>rule==='null'?nullWeightMap.get(`${Math.min(i,j)}:${Math.max(i,j)}`):1/Math.max(.05,world.overlap(world.nodes[i],world.nodes[j]));
   const graph=weightedAdjacency(adj,edgeWeights);
   const measurement=ballProfile(graph,{sources});
   samples.push({cap,seed,rule,nodes:adj.length,meanDegree:adj.reduce((a,b)=>a+b.length,0)/Math.max(1,adj.length),...measurement});
  }
 }
 const groups=[];
 for(const cap of caps)for(const rule of ['original','bounded','null']){
  const set=samples.filter(s=>s.cap===cap&&s.rule===rule&&s.dimension!==null);
  const mean=set.reduce((a,s)=>a+s.dimension,0)/Math.max(1,set.length);
  const sd=set.length>1?Math.sqrt(set.reduce((a,s)=>a+(s.dimension-mean)**2,0)/(set.length-1)):null;
  groups.push({cap,rule,n:set.length,meanDimension:set.length?mean:null,sd,meanNodes:set.reduce((a,s)=>a+s.nodes,0)/Math.max(1,set.length)});
 }
 return {parameters:{caps,seeds,steps,maxDegree,sources},groups,samples,warning:'Finite-graph fitted exponents are not physical spatial dimensions. Null control has unit edge weights.'};
}
