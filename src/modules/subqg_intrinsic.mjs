/** SubQG stage 2: coordinate-free relational emergence.
 * Graph distance and curvature are intrinsic; simulation iterations are not physical time.
 */
export class IntrinsicWorld {
  constructor({seed=42,threshold=0.42,maxNodes=180,linkThreshold=0.54}={}) {
    this.seed=seed>>>0; this.threshold=threshold; this.linkThreshold=linkThreshold;
    this.maxNodes=maxNodes; this.tick=0; this.nodes=[]; this.links=new Map();
    this.faces=new Map(); this.clocks=new Map(); this.history=[];
  }
  random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
  key(a,b){return a<b?`${a}:${b}`:`${b}:${a}`;}
  // Amplitudes and phases are internal state, not positions in a pre-existing space.
  overlap(a,b){return Math.sqrt(a.amp*b.amp)*Math.max(0,Math.cos(a.phase-b.phase));}
  neighbors(id){const out=[];for(const e of this.links.values()){if(e.a===id)out.push(e.b);else if(e.b===id)out.push(e.a);}return out.sort((a,b)=>a-b);}
  step(){
    const tick=this.tick++;
    const a={amp:this.random(),phase:2*Math.PI*this.random()};
    const b={amp:this.random(),phase:2*Math.PI*this.random()};
    const overlap=this.overlap(a,b);
    let created=null, formed=0;
    if(overlap>this.threshold && this.nodes.length<this.maxNodes){
      const id=this.nodes.length;
      created={id,amp:Math.sqrt(a.amp*b.amp),phase:Math.atan2(Math.sin(a.phase)+Math.sin(b.phase),Math.cos(a.phase)+Math.cos(b.phase)),born:tick};
      this.nodes.push(created);
      for(let j=0;j<id;j++){
        const peer=this.nodes[j]; const strength=this.overlap(created,peer);
        if(strength>=this.linkThreshold)this.links.set(this.key(id,j),{a:j,b:id,strength,born:tick});
      }
      const ns=this.neighbors(id);
      for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){
        const u=ns[i],v=ns[j];if(!this.links.has(this.key(u,v)))continue;
        const faceKey=`${u}:${v}:${id}`;
        this.faces.set(faceKey,{ids:[u,v,id],born:tick});formed++;
        // Local event clock: one increment for each incident new face.
        for(const n of [u,v,id])this.clocks.set(n,(this.clocks.get(n)??0)+1);
      }
    }
    const state={tick,overlap,created:created?.id??null,formed,faces:this.faces.size,nodes:this.nodes.length,links:this.links.size,totalClock:[...this.clocks.values()].reduce((a,b)=>a+b,0)};
    this.history.push(state);return state;
  }
  run(n){return Array.from({length:n},()=>this.step());}
  distances(source){
    if(!Number.isInteger(source)||source<0||source>=this.nodes.length)throw new RangeError('Invalid node');
    const d=Array(this.nodes.length).fill(Infinity);d[source]=0;
    const q=[source];for(let i=0;i<q.length;i++){const u=q[i];for(const v of this.neighbors(u))if(d[v]===Infinity){d[v]=d[u]+1;q.push(v);}}
    return d;
  }
  // Combinatorial curvature proxy: triangle incidence relative to graph degree.
  // NOT Ricci curvature and NOT a gravitational field equation.
  curvatureProxy(id){
    const degree=this.neighbors(id).length;
    if(degree<2)return 0;
    let incident=0;for(const f of this.faces.values())if(f.ids.includes(id))incident++;
    return incident/(degree*(degree-1)/2);
  }
  snapshot(){return {tick:this.tick,nodes:this.nodes,links:[...this.links.values()],faces:[...this.faces.values()],clocks:[...this.clocks.entries()],curvature:this.nodes.map(n=>this.curvatureProxy(n.id))};}
}
