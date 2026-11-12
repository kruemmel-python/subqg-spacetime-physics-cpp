/** Spectral dimension diagnostic using a lazy random walk, with no embedding coordinates. */
import { adjacency, auditWorld } from './subqg_dimension.mjs';
import { IntrinsicWorld } from './subqg_intrinsic.mjs';

export function spectralAudit(adj, {sources=24, maxSteps=80, laziness=0.5}={}) {
  const n=adj.length;
  if(!Number.isInteger(sources)||sources<1||!Number.isInteger(maxSteps)||maxSteps<4||!(laziness>0&&laziness<1))throw new RangeError('audit parameters');
  if(n===0)return {nodeCount:0, curves:[], dimension:null, reason:'empty graph'};
  for(let i=0;i<n;i++)for(const j of adj[i])if(!Number.isInteger(j)||j<0||j>=n||!adj[j].includes(i))throw new RangeError('undirected adjacency required');
  const selected=Array.from({length:Math.min(sources,n)},(_,i)=>Math.floor((i+0.5)*n/Math.min(sources,n)));
  const returns=Array(maxSteps+1).fill(0);
  for(const src of selected){
    let p=new Float64Array(n);p[src]=1;returns[0]+=1;
    for(let t=1;t<=maxSteps;t++){
      const next=new Float64Array(n);
      for(let u=0;u<n;u++)if(p[u]){
        const neighbors=adj[u];
        if(!neighbors.length)next[u]+=p[u];
        else {next[u]+=laziness*p[u];const portion=(1-laziness)*p[u]/neighbors.length;for(const v of neighbors)next[v]+=portion;}
      }
      p=next;returns[t]+=p[src];
    }
  }
  const curves=returns.slice(1).map((v,i)=>({step:i+1,returnProbability:v/selected.length}));
  // Local log derivative d_s(t)=-2 d log(P_return)/d log(t).
  const local=[];
  for(let t=2;t<maxSteps;t++){
    const a=curves[t-2],b=curves[t];
    if(a.returnProbability>0&&b.returnProbability>0)local.push({step:t,dimension:-2*Math.log(b.returnProbability/a.returnProbability)/Math.log(b.step/a.step)});
  }
  const window=local.filter(x=>x.step>=4&&x.step<=Math.min(16,Math.floor(maxSteps/2)));
  const vals=window.map(x=>x.dimension).filter(Number.isFinite).sort((a,b)=>a-b);
  const median=vals.length? (vals[Math.floor((vals.length-1)/2)]+vals[Math.floor(vals.length/2)])/2:null;
  return {nodeCount:n,sampled:selected.length,laziness,curves,local,dimension:median,window:[4,Math.min(16,Math.floor(maxSteps/2))],reason:'finite-size lazy-walk spectral diagnostic, not a continuum dimension'};
}
export function spectralWorld({seed=42,steps=300,threshold=0.42,linkThreshold=0.54,maxNodes=180,sources=24,maxSteps=80}={}){
 const world=new IntrinsicWorld({seed,threshold,linkThreshold,maxNodes});world.run(steps);
 const adj=adjacency(world.nodes.length,world.links.values());
 return {seed,steps,nodes:world.nodes.length,links:world.links.size,faces:world.faces.size,spectral:spectralAudit(adj,{sources,maxSteps})};
}
