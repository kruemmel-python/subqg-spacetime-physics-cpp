import {GeodesicWorld} from './subqg_geodesic.mjs';
/** Stage 6: causal partial order from face-formation events.
 * No global physical time is assumed; tick is only an external generation index.
 * The causal rule is a modeling postulate, not derived quantum gravity.
 */
export class CausalWorld extends GeodesicWorld {
  constructor(options={}) {super(options);this.events=[];this.lastEventByNode=new Map();this.eventClocks=new Map();}
  step(){
    const before=new Set(this.faces.keys());
    const row=super.step();
    for(const [key,face] of this.faces){
      if(before.has(key))continue;
      const parents=[...new Set(face.ids.map(id=>this.lastEventByNode.get(id)).filter(x=>x!==undefined))].sort((a,b)=>a-b);
      const id=this.events.length;
      const depth=parents.length?1+Math.max(...parents.map(p=>this.events[p].depth)):1;
      const event={id,face:key,nodes:[...face.ids],parents,depth};
      this.events.push(event);
      for(const node of face.ids){this.lastEventByNode.set(node,id);this.eventClocks.set(node,(this.eventClocks.get(node)??0)+1);}
    }
    return {...row,events:this.events.length};
  }
  ancestors(id){
    if(!Number.isInteger(id)||id<0||id>=this.events.length)throw new RangeError('invalid event');
    const seen=new Set(),stack=[...this.events[id].parents];
    while(stack.length){const x=stack.pop();if(seen.has(x))continue;seen.add(x);stack.push(...this.events[x].parents);}
    return seen;
  }
  relation(a,b){
    if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=this.events.length||b>=this.events.length)throw new RangeError('invalid event');
    if(a===b)return 'same';
    if(this.ancestors(b).has(a))return 'before';
    if(this.ancestors(a).has(b))return 'after';
    return 'spacelike'; // incomparable in the postulated causal partial order
  }
  causalSnapshot(){return {events:this.events,localClocks:[...this.eventClocks],maxDepth:Math.max(0,...this.events.map(e=>e.depth))};}
}
