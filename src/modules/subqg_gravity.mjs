import {IntrinsicWorld} from './subqg_intrinsic.mjs';

/** Stage 3: a phenomenological, intrinsic weighted graph and graph-Poisson field.
 * This is NOT a derivation of general relativity or dark matter.
 */
export class GravityWorld extends IntrinsicWorld {
  constructor(options={}) {
    super(options);
    this.mass=new Map();
    this.coupling=options.coupling??0.65;
    this.softening=options.softening??0.05;
    if(!Number.isFinite(this.coupling)||this.coupling<0)throw new RangeError('coupling must be finite and nonnegative');
    if(!Number.isFinite(this.softening)||this.softening<=0)throw new RangeError('softening must be positive');
  }
  setMass(id,value){
    if(!Number.isInteger(id)||id<0||id>=this.nodes.length)throw new RangeError('unknown node');
    if(!Number.isFinite(value)||value<0)throw new RangeError('mass must be finite and nonnegative');
    if(value===0)this.mass.delete(id);else this.mass.set(id,value);
  }
  // Intrinsic distance is defined by weighted graph paths, not coordinates.
  // An excitation changes edge lengths locally through endpoint masses.
  edgeLength(edge){
    const m=(this.mass.get(edge.a)??0)+(this.mass.get(edge.b)??0);
    return 1/(1+this.coupling*m);
  }
  weightedDistances(source){
    if(!Number.isInteger(source)||source<0||source>=this.nodes.length)throw new RangeError('unknown node');
    const n=this.nodes.length,d=Array(n).fill(Infinity),seen=new Set();d[source]=0;
    for(let k=0;k<n;k++){
      let u=-1;for(let i=0;i<n;i++)if(!seen.has(i)&&(u<0||d[i]<d[u]))u=i;
      if(u<0||!Number.isFinite(d[u]))break;
      seen.add(u);
      for(const edge of this.links.values()){
        const v=edge.a===u?edge.b:edge.b===u?edge.a:-1;
        if(v>=0)d[v]=Math.min(d[v],d[u]+this.edgeLength(edge));
      }
    }
    return d;
  }
  components(){
    const seen=new Set(),out=[];
    for(const node of this.nodes){
      if(seen.has(node.id))continue;
      const comp=[],q=[node.id];seen.add(node.id);
      for(let k=0;k<q.length;k++){
        const u=q[k];comp.push(u);
        for(const v of this.neighbors(u))if(!seen.has(v)){seen.add(v);q.push(v);}
      }
      out.push(comp.sort((a,b)=>a-b));
    }
    return out;
  }
  /** Solve L phi = -4*pi*G*(rho - component mean rho) with gauge mean(phi)=0.
   * Neutralization is mandatory on finite closed graphs (L has a zero mode).
   * Weighted conductance = 1/edgeLength. Uses deterministic Jacobi relaxation.
   */
  solvePotential({iterations=1800,tolerance=1e-10,G=1}={}){
    if(!Number.isInteger(iterations)||iterations<1||!Number.isFinite(tolerance)||tolerance<=0||!Number.isFinite(G)||G<0)throw new RangeError('invalid solver parameters');
    const n=this.nodes.length,phi=Array(n).fill(0),adj=Array.from({length:n},()=>[]);
    for(const edge of this.links.values()){
      const c=1/this.edgeLength(edge);adj[edge.a].push([edge.b,c]);adj[edge.b].push([edge.a,c]);
    }
    const components=this.components();
    const source=Array(n).fill(0);
    for(const comp of components){
      const mean=comp.reduce((s,i)=>s+(this.mass.get(i)??0),0)/comp.length;
      for(const i of comp)source[i]=-4*Math.PI*G*((this.mass.get(i)??0)-mean);
    }
    let residual=0,used=0;
    // Gauss-Seidel with per-component gauge fixing; each component has a zero mode.
    for(let it=0;it<iterations;it++){
      for(let i=0;i<n;i++){
        const sum=adj[i].reduce((s,[j,c])=>s+c,0);
        if(sum===0)continue;
        const neighbors=adj[i].reduce((s,[j,c])=>s+c*phi[j],0);
        phi[i]=(source[i]+neighbors)/sum;
      }
      for(const comp of components){
        const mean=comp.reduce((s,i)=>s+phi[i],0)/comp.length;
        for(const i of comp)phi[i]-=mean;
      }
      residual=0;
      for(let i=0;i<n;i++){
        const lap=adj[i].reduce((s,[j,c])=>s+c*(phi[i]-phi[j]),0);
        residual=Math.max(residual,Math.abs(lap-source[i]));
      }
      used=it+1;if(residual<tolerance)break;
    }
    return {potential:phi,residual,iterations:used,converged:residual<tolerance,source};
  }
  // A discrete edge gradient, not an observed gravitational acceleration.
  edgeField(edge,potential){return -(potential[edge.b]-potential[edge.a])/this.edgeLength(edge);}
  gravitySnapshot(){const solution=this.solvePotential();return {...this.snapshot(),masses:[...this.mass.entries()],lengths:[...this.links.values()].map(e=>({...e,length:this.edgeLength(e)})),...solution};}
}
