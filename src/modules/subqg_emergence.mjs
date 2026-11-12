/** SubQG emergence research extension. Simulation ticks are NOT physical time. */
export class EmergenceWorld {
  constructor({seed=42, threshold=0.55, radius=0.26, persistence=12}={}) {
    this.seed=seed>>>0; this.threshold=threshold; this.radius=radius; this.persistence=persistence;
    this.tick=0; this.events=[]; this.edges=new Map(); this.faces=new Map(); this.clock=0;
  }
  random(){this.seed=(Math.imul(1664525,this.seed)+1013904223)>>>0;return this.seed/4294967296;}
  distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
  step(){
    const tick=this.tick++;
    // Two fundamental excitations overlap when their finite support discs intersect.
    const a={x:this.random(),y:this.random()},b={x:this.random(),y:this.random()};
    const d=this.distance(a,b), overlap=Math.max(0,1-d/(2*this.radius));
    const event=overlap>this.threshold?{id:this.events.length,x:(a.x+b.x)/2,y:(a.y+b.y)/2,overlap,born:tick}:null;
    if(event && this.events.length < 300)this.events.push(event);
    else if(event) return {tick,overlap,event:null,formed:0,clock:this.clock,nodes:this.events.length,edges:this.edges.size,faces:this.faces.size,capacityReached:true};
    // Edges represent relational proximity; three mutually related nodes form a micro-face.
    if(event){for(const other of this.events.slice(0,-1)){
      if(this.distance(event,other)>this.radius*2.2)continue;
      const edgeKey=[other.id,event.id].join(':');this.edges.set(edgeKey,{a:other.id,b:event.id,born:tick});
    }}
    const adjacency=new Set(this.edges.keys());
    let formed=0;
    if(event){const neighbors=this.events.slice(0,-1).filter(n=>adjacency.has(`${n.id}:${event.id}`));
      for(let i=0;i<neighbors.length;i++)for(let j=i+1;j<neighbors.length;j++){
        const x=neighbors[i].id,y=neighbors[j].id;
        if(!adjacency.has(`${x}:${y}`))continue;
        const p=neighbors[i],q=neighbors[j];
        const area=Math.abs((q.x-p.x)*(event.y-p.y)-(q.y-p.y)*(event.x-p.x))/2;
        if(area<1e-5)continue;
        const key=`${x}:${y}:${event.id}`;
        this.faces.set(key,{ids:[x,y,event.id],born:tick,area});
        formed++;
      }
    }
    // A relational clock advances only on creation of a new micro-face.

    if(formed>0)this.clock+=formed;
    return {tick,overlap,event,formed,clock:this.clock,nodes:this.events.length,edges:this.edges.size,faces:this.faces.size};
  }
  run(n){const history=[];for(let i=0;i<n;i++)history.push(this.step());return history;}
  snapshot(){return {tick:this.tick,clock:this.clock,nodes:this.events,edges:[...this.edges.values()],faces:[...this.faces.values()]};}
}
