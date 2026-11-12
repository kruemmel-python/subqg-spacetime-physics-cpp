/** v22: scale-resolved slopes of weighted intrinsic ball volumes. */
import {IntrinsicWorld} from './subqg_intrinsic.mjs';
import {adjacency} from './subqg_dimension.mjs';
import {boundedAffinity} from './subqg_link_audit.mjs';
import {degreePreservingNull} from './subqg_topology_audit.mjs';
import {weightedAdjacency,ballProfile} from './subqg_metric_scaling.mjs';

export function windowSlopes(profiles,{minLogSpan=0.08}={}) {
 if(!Array.isArray(profiles)||profiles.length<4) throw new RangeError('at least four samples required');
 const data=profiles.filter(p=>Number.isFinite(p.radius)&&p.radius>0&&Number.isFinite(p.meanVolume)&&p.meanVolume>0).sort((a,b)=>a.radius-b.radius);
 if(data.length<4)return {windows:[],plateau:null};
 const windows=[];
 for(const [label,start,end] of [['local',0,Math.floor(data.length/3)+1],['middle',Math.floor(data.length/3),Math.ceil(2*data.length/3)+1],['large',Math.floor(2*data.length/3),data.length]]) {
  const chunk=data.slice(start,end);const x=chunk.map(p=>Math.log(p.radius)),y=chunk.map(p=>Math.log(p.meanVolume));
  const span=Math.max(...x)-Math.min(...x),mx=x.reduce((a,b)=>a+b,0)/x.length,my=y.reduce((a,b)=>a+b,0)/y.length;
  const den=x.reduce((a,b)=>a+(b-mx)**2,0);
  const slope=span>=minLogSpan&&den>1e-12?x.reduce((a,b,i)=>a+(b-mx)*(y[i]-my),0)/den:null;
  windows.push({label,slope,logSpan:span,points:chunk.length});
 }
 const slopes=windows.map(w=>w.slope);
 const plateau=slopes.every(Number.isFinite)&&Math.max(...slopes)-Math.min(...slopes)<0.25;
 return {windows,plateau};
}
export function runScaleWindows({caps=[60,120,240],seeds=[11,23,42],steps=2400,maxDegree=6,sources=12}={}) {
 const samples=[];const quantiles=Array.from({length:19},(_,i)=>.05+i*.045);
 for(const cap of caps)for(const seed of seeds){
  const world=new IntrinsicWorld({seed,threshold:.42,linkThreshold:.54,maxNodes:cap});world.run(steps);
  const base=boundedAffinity(world.nodes,maxDegree),nullAdj=degreePreservingNull(base,seed+7001).adj;
  const original=adjacency(world.nodes.length,world.links.values());
  const weights=[];for(let i=0;i<base.length;i++)for(const j of base[i])if(i<j)weights.push(1/Math.max(.05,world.overlap(world.nodes[i],world.nodes[j])));
  const nullMap=new Map();let k=0;for(let i=0;i<nullAdj.length;i++)for(const j of nullAdj[i])if(i<j)nullMap.set(`${i}:${j}`,weights[k++]);
  for(const [rule,adj] of [['original',original],['bounded',base],['null',nullAdj]]){
   const weight=(i,j)=>rule==='null'?nullMap.get(`${Math.min(i,j)}:${Math.max(i,j)}`):1/Math.max(.05,world.overlap(world.nodes[i],world.nodes[j]));
   const profile=ballProfile(weightedAdjacency(adj,weight),{sources,quantiles});
   samples.push({cap,seed,rule,nodes:adj.length,meanDegree:adj.reduce((s,a)=>s+a.length,0)/Math.max(1,adj.length),...windowSlopes(profile.profiles)});
  }
 }
 const groups=[];
 for(const cap of caps)for(const rule of ['original','bounded','null']){
  const selected=samples.filter(s=>s.cap===cap&&s.rule===rule);
  const windows=['local','middle','large'].map(label=>{
   const values=selected.map(s=>s.windows.find(w=>w.label===label)?.slope).filter(Number.isFinite);
   const mean=values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
   const sd=values.length>1?Math.sqrt(values.reduce((a,b)=>a+(b-mean)**2,0)/(values.length-1)):null;
   return {label,mean,sd,n:values.length};
  });
  groups.push({cap,rule,meanNodes:selected.reduce((a,s)=>a+s.nodes,0)/selected.length,plateauCount:selected.filter(s=>s.plateau).length,windows});
 }
 return {parameters:{caps,seeds,steps,maxDegree,sources,quantiles},groups,samples,limitations:['Finite graph radii and quantile windows can bias local slopes','A plateau is an operational diagnostic, not proof of spatial dimension','Random control preserves degree sequence, but not clustering']};
}
