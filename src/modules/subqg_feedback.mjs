import {GravityWorld} from './subqg_gravity.mjs';

/** Stage 4: bounded, reversible metric–potential feedback on an intrinsic graph.
 * A phenomenological numerical experiment, not Einstein dynamics.
 * Internal clocks still advance only when new faces form (inherited step()).
 */
export class FeedbackWorld extends GravityWorld {
  constructor(options={}) {
    super(options);
    this.feedback=options.feedback??0.12;
    this.relaxation=options.relaxation??0.18;
    this.minLength=options.minLength??0.25;
    this.maxLength=options.maxLength??3;
    for(const [name,v] of Object.entries({feedback:this.feedback,relaxation:this.relaxation,minLength:this.minLength,maxLength:this.maxLength}))
      if(!Number.isFinite(v)||v<=0)throw new RangeError(`${name} must be positive and finite`);
    if(this.relaxation>1||this.minLength>=this.maxLength)throw new RangeError('invalid feedback bounds');
    this.metric=new Map();this.dynamics=[];
  }
  edgeLength(edge){return this.metric.get(this.key(edge.a,edge.b))??super.edgeLength(edge);}
  initializeMetric(){
    for(const edge of this.links.values()){
      const k=this.key(edge.a,edge.b);
      if(!this.metric.has(k))this.metric.set(k,Math.max(this.minLength,Math.min(this.maxLength,super.edgeLength(edge))));
    }
  }
  /** One deterministic solver-relaxation update; the graph topology is held fixed. */
  evolve({G=1,iterations=1800,tolerance=1e-9}={}){
    this.initializeMetric();
    const before=this.solvePotential({G,iterations,tolerance});
    if(!before.converged)throw new Error(`potential solver did not converge (residual ${before.residual})`);
    const updates=new Map();let change=0;
    for(const edge of this.links.values()){
      const k=this.key(edge.a,edge.b),old=this.metric.get(k);
      const base=1/(1+this.coupling*((this.mass.get(edge.a)??0)+(this.mass.get(edge.b)??0)));
      // Only potential differences matter; a uniform gauge shift has no effect.
      const gradient=Math.abs(before.potential[edge.a]-before.potential[edge.b]);
      const target=Math.max(this.minLength,Math.min(this.maxLength,base/(1+this.feedback*gradient)));
      const next=old+this.relaxation*(target-old);
      updates.set(k,next);change=Math.max(change,Math.abs(next-old));
    }
    this.metric=updates;
    const after=this.solvePotential({G,iterations,tolerance});
    if(!after.converged)throw new Error(`updated potential solver did not converge (residual ${after.residual})`);
    const row={iteration:this.dynamics.length+1,change,residual:after.residual,meanLength:updates.size?[...updates.values()].reduce((a,b)=>a+b,0)/updates.size:0,
      potentialSpan:after.potential.length?Math.max(...after.potential)-Math.min(...after.potential):0,
      massTotal:[...this.mass.values()].reduce((a,b)=>a+b,0),clockTotal:[...this.clocks.values()].reduce((a,b)=>a+b,0)};
    this.dynamics.push(row);return row;
  }
  evolveMany(n,opts={}){if(!Number.isInteger(n)||n<0)throw new RangeError('invalid iteration count');return Array.from({length:n},()=>this.evolve(opts));}
  feedbackSnapshot(){return {...this.gravitySnapshot(),metric:[...this.metric.entries()],dynamics:this.dynamics};}
}
