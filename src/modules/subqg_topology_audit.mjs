/** v20: topology audit with exact-degree null models. No embedded coordinates. */
import {IntrinsicWorld} from './subqg_intrinsic.mjs';
import {adjacency} from './subqg_dimension.mjs';
import {boundedAffinity} from './subqg_link_audit.mjs';

function rng(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
export function validateGraph(adj){
 const n=adj.length;
 for(let i=0;i<n;i++){
  const seen=new Set();
  for(const j of adj[i])if(!Number.isInteger(j)||j<0||j>=n||j===i||seen.has(j)||!adj[j]?.includes(i))throw new Error('invalid undirected simple graph');else seen.add(j);
 }
 return true;
}
export function degreePreservingNull(adj,seed=42,attemptFactor=30){
 validateGraph(adj);
 const n=adj.length,sets=adj.map(a=>new Set(a)),edges=[];
 for(let a=0;a<n;a++)for(const b of sets[a])if(a<b)edges.push([a,b]);
 const random=rng(seed),attempts=Math.floor(edges.length*attemptFactor);let swaps=0;
 if(edges.length<2)return {adj:adj.map(a=>[...a]),swaps,attempts:0};
 for(let t=0;t<attempts;t++){
  const i=Math.floor(random()*edges.length),j=Math.floor(random()*edges.length);
  if(i===j)continue;
  const [a,b]=edges[i],[c,d]=edges[j];
  if(new Set([a,b,c,d]).size!==4)continue;
  const [u,v]=random()<.5?[a,d]:[a,c];
  const [w,z]=u===a&&v===d?[c,b]:[b,d];
  if(sets[u].has(v)||sets[w].has(z))continue;
  sets[a].delete(b);sets[b].delete(a);sets[c].delete(d);sets[d].delete(c);
  sets[u].add(v);sets[v].add(u);sets[w].add(z);sets[z].add(w);
  edges[i]=u<v?[u,v]:[v,u];edges[j]=w<z?[w,z]:[z,w];swaps++;
 }
 return {adj:sets.map(s=>[...s].sort((a,b)=>a-b)),swaps,attempts};
}
export function topologyMetrics(adj,{maxSources=32}={}){
 validateGraph(adj);const n=adj.length,degrees=adj.map(a=>a.length),degreeSum=degrees.reduce((a,b)=>a+b,0);
 let triangles3=0,triplets=0,localSum=0,localCount=0;
 const sets=adj.map(a=>new Set(a));
 for(let i=0;i<n;i++){
  const neighbors=adj[i],k=neighbors.length;triplets+=k*(k-1)/2;
  if(k<2)continue;
  let closed=0;
  for(let x=0;x<k;x++)for(let y=x+1;y<k;y++)if(sets[neighbors[x]].has(neighbors[y]))closed++;
  triangles3+=closed;localSum+=closed/(k*(k-1)/2);localCount++;
 }
 const visited=new Uint8Array(n),components=[];
 for(let i=0;i<n;i++)if(!visited[i]){
  const nodes=[i];visited[i]=1;
  for(let q=0;q<nodes.length;q++)for(const v of adj[nodes[q]])if(!visited[v]){visited[v]=1;nodes.push(v);}
  components.push(nodes);
 }
 components.sort((a,b)=>b.length-a.length);
 const giant=components[0]??[],sampleCount=Math.min(giant.length,maxSources);
 const sources=sampleCount===giant.length?giant:Array.from({length:sampleCount},(_,i)=>giant[Math.floor((i+.5)*giant.length/sampleCount)]);
 let totalDistance=0,pairs=0,maxDistance=0;
 for(const source of sources){
  const dist=new Int32Array(n).fill(-1),queue=[source];dist[source]=0;
  for(let q=0;q<queue.length;q++)for(const v of adj[queue[q]])if(dist[v]<0){dist[v]=dist[queue[q]]+1;queue.push(v);}
  for(const v of giant)if(v!==source&&dist[v]>=0){totalDistance+=dist[v];pairs++;maxDistance=Math.max(maxDistance,dist[v]);}
 }
 return {nodes:n,edges:degreeSum/2,meanDegree:n?degreeSum/n:0,degreeVariance:n?degrees.reduce((s,k)=>s+(k-degreeSum/n)**2,0)/n:0,
  components:components.length,largestFraction:n?giant.length/n:0,transitivity:triplets?triangles3/triplets:0,
  meanLocalClustering:localCount?localSum/localCount:0,meanShortestPath:pairs?totalDistance/pairs:null,
  sampledDiameter:maxDistance,sampledSources:sources.length};
}
export function runTopologyAudit({caps=[60,120,240],seeds=[11,23,42],steps=2400,maxDegree=6,maxSources=24,rewireFactor=30}={}){
 const samples=[];
 for(const cap of caps)for(const seed of seeds){
  const world=new IntrinsicWorld({seed,threshold:.42,linkThreshold:.54,maxNodes:cap});world.run(steps);
  const original=adjacency(world.nodes.length,world.links.values());
  const bounded=boundedAffinity(world.nodes,maxDegree);
  for(const [rule,graph] of [['original',original],['bounded',bounded]]){
   const control=degreePreservingNull(graph,seed+7001,rewireFactor);
   samples.push({cap,seed,rule:'subqg-'+rule,...topologyMetrics(graph,{maxSources})});
   samples.push({cap,seed,rule:'degree-null-'+rule,swaps:control.swaps,...topologyMetrics(control.adj,{maxSources})});
  }
 }
 const groups=[];
 for(const cap of caps)for(const rule of ['subqg-original','degree-null-original','subqg-bounded','degree-null-bounded']){
  const subset=samples.filter(x=>x.cap===cap&&x.rule===rule);
  const mean=key=>subset.reduce((s,x)=>s+(x[key]??0),0)/subset.length;
  groups.push({cap,rule,n:subset.length,nodes:mean('nodes'),degree:mean('meanDegree'),clustering:mean('meanLocalClustering'),transitivity:mean('transitivity'),path:mean('meanShortestPath'),giant:mean('largestFraction'),swaps:rule.startsWith('degree-null')?mean('swaps'):null});
 }
 return {parameters:{caps,seeds,steps,maxDegree,maxSources,rewireFactor},groups,samples};
}
