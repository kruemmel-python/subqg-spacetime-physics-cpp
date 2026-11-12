/** v23: preregistered alternative relational link rules; no spatial coordinates. */
import {IntrinsicWorld} from './subqg_intrinsic.mjs';
import {boundedAffinity} from './subqg_link_audit.mjs';
import {degreePreservingNull,topologyMetrics,validateGraph} from './subqg_topology_audit.mjs';
import {weightedAdjacency,ballProfile} from './subqg_metric_scaling.mjs';
import {windowSlopes} from './subqg_scale_windows.mjs';

function strength(a,b){return Math.sqrt(Math.max(0,a.amp*b.amp))*Math.max(0,Math.cos(a.phase-b.phase));}
export function relationalLinks(nodes,{maxDegree=6,mode='affinity',triadicWeight=.5}={}){
 if(!Number.isInteger(maxDegree)||maxDegree<1||!['affinity','phase-local','triadic'].includes(mode)||!Number.isFinite(triadicWeight)||triadicWeight<0)throw new RangeError('rule parameters');
 if(mode==='affinity')return boundedAffinity(nodes,maxDegree);
 const n=nodes.length,sets=Array.from({length:n},()=>new Set()),candidates=[];
 for(let i=0;i<n;i++)for(let j=0;j<i;j++){
  const affinity=strength(nodes[i],nodes[j]);
  const phaseDistance=Math.acos(Math.cos(nodes[i].phase-nodes[j].phase));
  const score=mode==='phase-local'?affinity/(1+phaseDistance):affinity;
  candidates.push({i,j,score});
 }
 if(mode==='phase-local')candidates.sort((a,b)=>b.score-a.score||a.i-b.i||a.j-b.j);
 else candidates.sort((a,b)=>a.i-b.i||a.j-b.j);
 if(mode==='triadic'){
  // Deterministic growing graph: candidates only attach the next node to previous nodes.
  for(let i=1;i<n;i++){
   const choices=candidates.filter(c=>c.i===i).map(c=>{
    let common=0;for(const x of sets[c.j])if(sets[i].has(x))common++;
    return {...c,score:c.score+triadicWeight*common};
   }).sort((a,b)=>b.score-a.score||a.j-b.j);
   for(const c of choices){if(sets[i].size>=maxDegree)break;if(sets[c.j].size>=maxDegree)continue;sets[i].add(c.j);sets[c.j].add(i);}
  }
 }else for(const c of candidates)if(sets[c.i].size<maxDegree&&sets[c.j].size<maxDegree){sets[c.i].add(c.j);sets[c.j].add(c.i);}
 const result=sets.map(s=>[...s].sort((a,b)=>a-b));validateGraph(result);return result;
}
export function runLocalRuleAudit({caps=[60,120,240],seeds=[11,23,42],steps=2400,maxDegree=6,sources=12}={}){
 const samples=[],quantiles=Array.from({length:19},(_,i)=>.05+i*.045);
 for(const cap of caps)for(const seed of seeds){
  const world=new IntrinsicWorld({seed,threshold:.42,linkThreshold:.54,maxNodes:cap});world.run(steps);
  for(const mode of ['affinity','phase-local','triadic']){
   const adj=relationalLinks(world.nodes,{maxDegree,mode});
   const control=degreePreservingNull(adj,seed+7001,12).adj;
   for(const [rule,graph] of [[mode,adj],[`${mode}-null`,control]]){
    const metrics=topologyMetrics(graph,{maxSources:sources});
    const weights=weightedAdjacency(graph,(i,j)=>1/Math.max(.05,world.overlap(world.nodes[i],world.nodes[j])));
    const profile=ballProfile(weights,{sources,quantiles});
    const slopes=windowSlopes(profile.profiles);
    samples.push({cap,seed,rule,...metrics,plateau:slopes.plateau,windows:slopes.windows});
   }
  }
 }
 const groups=[];
 for(const cap of caps)for(const rule of ['affinity','phase-local','triadic','affinity-null','phase-local-null','triadic-null']){
  const rows=samples.filter(s=>s.cap===cap&&s.rule===rule);
  const mean=fn=>{const values=rows.map(fn).filter(Number.isFinite);return values.length?values.reduce((a,b)=>a+b,0)/values.length:null;};
  groups.push({cap,rule,n:rows.length,nodes:mean(x=>x.nodes),degree:mean(x=>x.meanDegree),clustering:mean(x=>x.meanLocalClustering),path:mean(x=>x.meanShortestPath),giant:mean(x=>x.largestFraction),plateauCount:rows.filter(x=>x.plateau).length,local:mean(x=>x.windows[0]?.slope),middle:mean(x=>x.windows[1]?.slope),large:mean(x=>x.windows[2]?.slope)});
 }
 return {parameters:{caps,seeds,steps,maxDegree,sources,quantiles},groups,samples,limitations:['Link rules are explicit hypotheses, not derived physics','Triadic score uses deterministic sequential growth','Finite graph scale fits are biased and not physical dimensions','No post hoc tuning to target dimension three']};
}
