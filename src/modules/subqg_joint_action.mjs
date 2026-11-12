import {MicroActionWorld} from './subqg_microaction.mjs';

/** V9: joint variational toy model for microscopic phase and emergent metric.
 * Phases are internal angular variables; coordinates and physical time are absent.
 * The functional is POSTULATED, not derived from quantum field theory.
 * Topology is fixed during minimization, so no new causal events are created.
 */
export class JointActionWorld extends MicroActionWorld {
  constructor(options={}) {
    super(options);
    this.phaseStiffness=options.phaseStiffness??0.15;
    this.phasePin=options.phasePin??0.1;
    this.phaseMetricCoupling=options.phaseMetricCoupling??0.08;
    for(const [name,value] of Object.entries({phaseStiffness:this.phaseStiffness,phasePin:this.phasePin,phaseMetricCoupling:this.phaseMetricCoupling}))
      if(!Number.isFinite(value)||value<0)throw new RangeError(`${name} must be finite and nonnegative`);
    this.phaseState=new Map();
  }
  static angle(x){return Math.atan2(Math.sin(x),Math.cos(x));}
  _state(){
    const s=this._microSystem();
    const phases=this.nodes.map(n=>this.phaseState.get(n.id)??n.phase);
    const original=this.nodes.map(n=>n.phase);
    return {...s,phases,original};
  }
  _evaluateJoint(s,x,p){
    let energy=this._energy(s,x);
    const gx=this._matvec(s,x).map((v,i)=>v-s.source[i]);
    const gp=p.map(()=>0);
    for(let i=0;i<p.length;i++){
      const d=JointActionWorld.angle(p[i]-s.original[i]);
      energy+=this.phasePin*(1-Math.cos(d));
      gp[i]+=this.phasePin*Math.sin(d);
    }
    for(let i=0;i<s.edges.length;i++){
      const edge=s.edges[i],a=edge.a,b=edge.b;
      const delta=p[a]-p[b],cos=Math.cos(delta),sin=Math.sin(delta);
      const k=this.phaseStiffness*edge.strength;
      energy+=k*(1-cos);
      gp[a]+=k*sin;gp[b]-=k*sin;
      // Metric-phase term is nonnegative, vanishes for x=0 or aligned phases.
      const factor=this.phaseMetricCoupling*edge.strength;
      energy+=factor*x[i]*x[i]*(1-cos);
      gx[i]+=2*factor*x[i]*(1-cos);
      gp[a]+=factor*x[i]*x[i]*sin;
      gp[b]-=factor*x[i]*x[i]*sin;
    }
    return {energy,gx,gp};
  }
  jointAction(){const s=this._state();return this._evaluateJoint(s,s.x,s.phases).energy;}
  solveJoint({iterations=1200,tolerance=1e-8}={}){
    if(!Number.isInteger(iterations)||iterations<1||!Number.isFinite(tolerance)||tolerance<=0)throw new RangeError('invalid solver options');
    const s=this._state();let x=s.x.slice(),p=s.phases.slice();
    const initial=this._evaluateJoint(s,x,p).energy;
    let used=0,converged=false;
    for(let iter=0;iter<iterations;iter++){
      const current=this._evaluateJoint(s,x,p);
      const dx=current.gx.map((g,i)=>((x[i]<=this.minLog&&g>0)||(x[i]>=this.maxLog&&g<0))?0:g);
      const norm=Math.max(0,...dx.map(Math.abs),...current.gp.map(Math.abs));
      if(norm<=tolerance){converged=true;break;}
      let step=0.5,accepted=false;
      for(let trial=0;trial<45;trial++){
        const xx=x.map((v,i)=>Math.max(this.minLog,Math.min(this.maxLog,v-step*dx[i])));
        const pp=p.map((v,i)=>JointActionWorld.angle(v-step*current.gp[i]));
        const next=this._evaluateJoint(s,xx,pp).energy;
        if(next<=current.energy+1e-12-1e-4*step*(dx.reduce((z,v)=>z+v*v,0)+current.gp.reduce((z,v)=>z+v*v,0))){x=xx;p=pp;accepted=true;break;}
        step*=0.5;
      }
      if(!accepted)break;
      used++;
    }
    const final=this._evaluateJoint(s,x,p);
    s.keys.forEach((key,i)=>this.logMetric.set(key,x[i]));
    p.forEach((phase,i)=>this.phaseState.set(i,phase));
    return {nodes:p.length,edges:x.length,iterations:used,converged,
      initialAction:initial,finalAction:final.energy,
      maxGradient:Math.max(0,...final.gx.map(Math.abs),...final.gp.map(Math.abs)),
      meanLength:x.length?x.reduce((z,v)=>z+Math.exp(v),0)/x.length:0};
  }
}
