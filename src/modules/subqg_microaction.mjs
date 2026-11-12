import {ActionWorld} from './subqg_action.mjs';

/** V8: explicitly postulated overlap-weighted effective action.
 * The coupling weights are computed from SubQG internal amplitudes/phases,
 * not fitted to spatial coordinates. This is a model ansatz, not a derivation
 * of Einstein gravity, Lorentz invariance, or a microscopic quantum action.
 */
export class MicroActionWorld extends ActionWorld {
  constructor(options={}) {
    super(options);
    this.overlapFloor=options.overlapFloor??0.05;
    if(!Number.isFinite(this.overlapFloor)||this.overlapFloor<=0||this.overlapFloor>1)
      throw new RangeError('overlapFloor must lie in (0,1]');
  }
  _microSystem(){
    const edges=this.edgesOrdered();
    const keys=edges.map(e=>this.key(e.a,e.b));
    const incident=new Map();
    edges.forEach((e,i)=>{for(const id of [e.a,e.b]){
      if(!incident.has(id))incident.set(id,[]);
      incident.get(id).push(i);
    }});
    const pairs=[];
    for(const [id,indices] of incident){
      const node=this.nodes[id];
      for(let i=0;i<indices.length;i++)for(let j=i+1;j<indices.length;j++){
        const ei=edges[indices[i]],ej=edges[indices[j]];
        const ni=this.nodes[ei.a===id?ei.b:ei.a];
        const nj=this.nodes[ej.a===id?ej.b:ej.a];
        const correlation=Math.min(1,Math.max(this.overlapFloor,
          0.5*(this.overlap(node,ni)+this.overlap(node,nj))));
        pairs.push([indices[i],indices[j],this.stiffness*correlation]);
      }
    }
    const source=edges.map(e=>-this.sourceCoupling*e.strength*
      ((this.mass.get(e.a)??0)+(this.mass.get(e.b)??0)));
    const x=keys.map(k=>this.logMetric.get(k)??0);
    return {edges,keys,pairs,source,x};
  }
  _matvec(s,x){
    const out=x.map(v=>this.anchor*v);
    for(const [i,j,w] of s.pairs){const d=w*(x[i]-x[j]);out[i]+=d;out[j]-=d;}
    return out;
  }
  _energy(s,x){
    let a=0;
    for(let i=0;i<x.length;i++)a+=0.5*this.anchor*x[i]**2-s.source[i]*x[i];
    for(const [i,j,w] of s.pairs)a+=0.5*w*(x[i]-x[j])**2;
    return a;
  }
  microAction(){const s=this._microSystem();return this._energy(s,s.x);}
  /** Matrix-free conjugate gradient. The positive anchor makes H SPD.
   * Bounds are checked, not silently projected: a bounded solution requires
   * a different constrained optimizer.
   */
  solveMicroAction({iterations=3000,tolerance=1e-10}={}){
    if(!Number.isInteger(iterations)||iterations<1||!Number.isFinite(tolerance)||tolerance<=0)
      throw new RangeError('invalid solver parameters');
    const s=this._microSystem(),n=s.x.length;
    let x=s.x.slice(),r=s.source.map((v,i)=>v-this._matvec(s,x)[i]);
    let p=r.slice(),rr=r.reduce((a,v)=>a+v*v,0),used=0;
    const initialAction=this._energy(s,x);
    for(let k=0;k<iterations&&Math.sqrt(rr)>tolerance;k++){
      const Ap=this._matvec(s,p),den=p.reduce((a,v,i)=>a+v*Ap[i],0);
      if(!(den>0))throw new Error('action Hessian is not positive definite');
      const alpha=rr/den;
      x=x.map((v,i)=>v+alpha*p[i]);
      r=r.map((v,i)=>v-alpha*Ap[i]);
      const next=r.reduce((a,v)=>a+v*v,0);
      used++;
      if(Math.sqrt(next)<=tolerance){rr=next;break;}
      const beta=next/rr;
      p=r.map((v,i)=>v+beta*p[i]);rr=next;
    }
    const residual=s.source.map((v,i)=>v-this._matvec(s,x)[i]);
    const norm=Math.hypot(...residual);
    const boundsOk=x.every(v=>v>=this.minLog-1e-12&&v<=this.maxLog+1e-12);
    if(!boundsOk)throw new RangeError('unconstrained minimum exceeds metric bounds');
    s.keys.forEach((key,i)=>this.logMetric.set(key,x[i]));
    return {edges:n,interactionPairs:s.pairs.length,iterations:used,
      residual:norm,converged:norm<=tolerance*10,
      initialAction,finalAction:this._energy(s,x),
      meanLength:n?x.reduce((a,v)=>a+Math.exp(v),0)/n:0};
  }
}
