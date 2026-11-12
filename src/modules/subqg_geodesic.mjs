import {FeedbackWorld} from './subqg_feedback.mjs';

/** Stage 5: force-free graph geodesics. Probe follows only intrinsic edge lengths.
 * A graph shortest path is a spatial analogue, NOT a timelike GR geodesic.
 */
export class GeodesicWorld extends FeedbackWorld {
  shortestPath(start, goal, {flat=false}={}) {
    const n=this.nodes.length;
    if(!Number.isInteger(start)||!Number.isInteger(goal)||start<0||goal<0||start>=n||goal>=n) throw new RangeError('invalid probe endpoints');
    const dist=Array(n).fill(Infinity), prev=Array(n).fill(-1),used=new Set();
    dist[start]=0;
    for(let step=0;step<n;step++) {
      let u=-1;
      for(let i=0;i<n;i++) if(!used.has(i)&&(u<0||dist[i]<dist[u]))u=i;
      if(u<0||!Number.isFinite(dist[u])||u===goal)break;
      used.add(u);
      for(const edge of this.links.values()) {
        const v=edge.a===u?edge.b:edge.b===u?edge.a:-1;
        if(v<0||used.has(v))continue;
        const length=flat?1:this.edgeLength(edge);
        if(!Number.isFinite(length)||length<=0)throw new Error('invalid metric');
        const next=dist[u]+length;
        if(next<dist[v]-1e-12){dist[v]=next;prev[v]=u;}
      }
    }
    if(!Number.isFinite(dist[goal]))return {path:[],length:Infinity,reachable:false};
    const path=[];
    for(let u=goal;u!==-1;u=prev[u])path.push(u);
    path.reverse();
    return {path,length:dist[goal],reachable:true};
  }
  comparePaths(start,goal){
    const flat=this.shortestPath(start,goal,{flat:true});
    const curved=this.shortestPath(start,goal);
    const changed=JSON.stringify(flat.path)!==JSON.stringify(curved.path);
    return {start,goal,flat,curved,changed};
  }
  /** All ordered endpoint pairs: measure path rerouting without adding a force. */
  pathSurvey({maxPairs=Infinity}={}){
    const rows=[];
    for(let i=0;i<this.nodes.length;i++)for(let j=i+1;j<this.nodes.length;j++){
      const r=this.comparePaths(i,j);
      if(r.flat.reachable&&r.curved.reachable)rows.push(r);
      if(rows.length>=maxPairs)return rows;
    }
    return rows;
  }
}
