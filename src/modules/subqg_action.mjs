import {CausalWorld} from './subqg_causal.mjs';

/** Stage 7: explicitly specified discrete variational metric model.
 * The action is a research ansatz, NOT derived from the SubQG microphysics.
 * x_e=log(length_e/base_e); A=1/2 k sum(x_e-x_f)^2 over incident edges
 * + 1/2 mu sum x_e^2 - sum J_e x_e, J_e=-alpha(m_a+m_b).
 * Positive mu gives a unique minimizer, absent constraints.
 */
export class ActionWorld extends CausalWorld {
  constructor(options={}) {
    super(options);
    this.stiffness=options.stiffness??0.4;
    this.anchor=options.anchor??1;
    this.sourceCoupling=options.sourceCoupling??0.1;
    this.minLog=options.minLog??-1;
    this.maxLog=options.maxLog??1;
    for(const [k,v] of Object.entries({stiffness:this.stiffness,anchor:this.anchor,sourceCoupling:this.sourceCoupling,minLog:this.minLog,maxLog:this.maxLog}))
      if(!Number.isFinite(v))throw new RangeError(`${k} must be finite`);
    if(this.stiffness<0||this.anchor<=0||this.sourceCoupling<0||this.minLog>=this.maxLog||this.minLog>0||this.maxLog<0)
      throw new RangeError('invalid action parameters');
    this.logMetric=new Map();
  }
  edgeLength(edge){return Math.exp(this.logMetric.get(this.key(edge.a,edge.b))??0);}
  edgesOrdered(){return [...this.links.values()].sort((a,b)=>this.key(a.a,a.b).localeCompare(this.key(b.a,b.b)));}
  _setup(){
    const edges=this.edgesOrdered(), keys=edges.map(e=>this.key(e.a,e.b));
    const incident=new Map();
    edges.forEach((e,i)=>{for(const node of [e.a,e.b]){if(!incident.has(node))incident.set(node,[]);incident.get(node).push(i);}});
    const pairs=[];
    for(const indices of incident.values())for(let a=0;a<indices.length;a++)for(let b=a+1;b<indices.length;b++)pairs.push([indices[a],indices[b]]);
    const sources=edges.map(e=>-this.sourceCoupling*((this.mass.get(e.a)??0)+(this.mass.get(e.b)??0)));
    const x=keys.map(k=>this.logMetric.get(k)??0);
    return {edges,keys,pairs,sources,x};
  }
  _evaluate(s,x){
    let action=0;const gradient=x.map((v,i)=>this.anchor*v-s.sources[i]);
    for(let i=0;i<x.length;i++)action+=0.5*this.anchor*x[i]*x[i]-s.sources[i]*x[i];
    for(const [i,j] of s.pairs){const d=x[i]-x[j];action+=0.5*this.stiffness*d*d;gradient[i]+=this.stiffness*d;gradient[j]-=this.stiffness*d;}
    return {action,gradient};
  }
  action(){const s=this._setup();return this._evaluate(s,s.x).action;}
  /** Projected gradient descent with monotone Armijo backtracking. */
  minimize({iterations=1000,tolerance=1e-9}={}){
    if(!Number.isInteger(iterations)||iterations<1||!Number.isFinite(tolerance)||tolerance<=0)throw new RangeError('invalid minimizer settings');
    const s=this._setup();let x=s.x.slice(),initial=this._evaluate(s,x).action,iterationsUsed=0;
    for(let it=0;it<iterations;it++){
      const {action,gradient}=this._evaluate(s,x);
      const projected=gradient.map((g,i)=>(x[i]<=this.minLog&&g>0)||(x[i]>=this.maxLog&&g<0)?0:g);
      const maxGrad=Math.max(0,...projected.map(Math.abs));
      if(maxGrad<tolerance)break;
      let step=1,accepted=false;
      for(let trial=0;trial<45;trial++){
        const y=x.map((v,i)=>Math.max(this.minLog,Math.min(this.maxLog,v-step*projected[i])));
        const next=this._evaluate(s,y).action;
        if(next<=action+1e-12-1e-4*step*projected.reduce((sum,g)=>sum+g*g,0)){
          x=y;accepted=true;break;
        }
        step*=0.5;
      }
      if(!accepted)break;
      iterationsUsed++;
    }
    s.keys.forEach((k,i)=>this.logMetric.set(k,x[i]));
    const final=this._evaluate(s,x);
    const projected=final.gradient.map((g,i)=>(x[i]<=this.minLog+1e-12&&g>0)||(x[i]>=this.maxLog-1e-12&&g<0)?0:g);
    return {initialAction:initial,finalAction:final.action,iterations:iterationsUsed,projectedGradient:Math.max(0,...projected.map(Math.abs)),edgeCount:x.length,meanLength:x.length?x.reduce((a,v)=>a+Math.exp(v),0)/x.length:0};
  }
}
