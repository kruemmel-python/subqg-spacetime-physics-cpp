import {JointActionWorld} from './subqg_joint_action.mjs';

/** V10: conservative graph-wave toy model. Simulation steps are external
 * integration parameters, NOT emergent physical time. No Lorentz invariance.
 * Fixed topology; edge weights are inherited from SubQG overlap and metric.
 */
export class WaveWorld extends JointActionWorld {
  constructor(options={}) {
    super(options);
    this.waveSpeed=options.waveSpeed??1;
    if(!(Number.isFinite(this.waveSpeed)&&this.waveSpeed>0))throw new RangeError('waveSpeed must be positive');
    this.displacement=[];this.velocity=[];this.waveEdges=[];this.waveDt=null;
  }
  initializeWaves({dt=null}={}) {
    const n=this.nodes.length;
    this.displacement=Array(n).fill(0);this.velocity=Array(n).fill(0);
    this.waveEdges=this.edgesOrdered().map(e=>{
      const length=Math.exp(this.logMetric.get(this.key(e.a,e.b))??0);
      return {a:e.a,b:e.b,w:this.waveSpeed**2*e.strength/(length*length)};
    });
    const degrees=Array(n).fill(0);
    for(const e of this.waveEdges){degrees[e.a]+=e.w;degrees[e.b]+=e.w;}
    const maxDegree=Math.max(0,...degrees);
    const safe=maxDegree?1/Math.sqrt(2*maxDegree):1;
    this.waveDt=dt??safe;
    if(!(Number.isFinite(this.waveDt)&&this.waveDt>0&&this.waveDt<=safe*(1+1e-12)))
      throw new RangeError(`dt exceeds conservative stability bound ${safe}`);
    return {nodes:n,edges:this.waveEdges.length,dt:this.waveDt,stabilityBound:safe};
  }
  _accelerations(u){
    const a=Array(u.length).fill(0);
    for(const e of this.waveEdges){const f=e.w*(u[e.b]-u[e.a]);a[e.a]+=f;a[e.b]-=f;}
    return a;
  }
  pulse(id,amplitude=1){
    if(!Number.isInteger(id)||id<0||id>=this.displacement.length||!Number.isFinite(amplitude))throw new RangeError('invalid pulse');
    this.displacement[id]+=amplitude;
  }
  stepWave(){
    if(this.waveDt===null)throw new Error('initializeWaves first');
    const dt=this.waveDt,a0=this._accelerations(this.displacement);
    const vhalf=this.velocity.map((v,i)=>v+0.5*dt*a0[i]);
    this.displacement=this.displacement.map((u,i)=>u+dt*vhalf[i]);
    const a1=this._accelerations(this.displacement);
    this.velocity=vhalf.map((v,i)=>v+0.5*dt*a1[i]);
    return this.waveEnergy();
  }
  waveEnergy(){
    let kinetic=0,potential=0;
    for(const v of this.velocity)kinetic+=0.5*v*v;
    for(const e of this.waveEdges)potential+=0.5*e.w*(this.displacement[e.a]-this.displacement[e.b])**2;
    return {kinetic,potential,total:kinetic+potential};
  }
  hopDistances(start){
    const dist=Array(this.nodes.length).fill(Infinity);dist[start]=0;
    const queue=[start];let head=0;
    const adj=Array.from({length:this.nodes.length},()=>[]);
    for(const e of this.waveEdges){adj[e.a].push(e.b);adj[e.b].push(e.a);}
    while(head<queue.length){const a=queue[head++];for(const b of adj[a])if(dist[b]===Infinity){dist[b]=dist[a]+1;queue.push(b);}}
    return dist;
  }
}
