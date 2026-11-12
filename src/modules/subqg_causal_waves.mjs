import {WaveWorld} from './subqg_waves.mjs';

/** V11: wave propagation with a causal event overlay.
 * Arrival events are defined by a threshold and a numerical time parameter.
 * The parameter is NOT derived physical time; the causal graph is an operational
 * diagnostic, not a Lorentzian spacetime.
 */
export class CausalWaveWorld extends WaveWorld {
  constructor(options={}) {
    super(options);
    this.threshold=options.threshold??1e-9;
    if(!(Number.isFinite(this.threshold)&&this.threshold>0))throw new RangeError('threshold must be positive');
    this.arrivals=[];
    this.causalEvents=[];
    this.integrationTime=0;
  }
  initializeWaves(options={}) {
    const result=super.initializeWaves(options);
    this.arrivals=Array(this.nodes.length).fill(null);
    this.causalEvents=[];
    this.integrationTime=0;
    return result;
  }
  pulse(id,amplitude=1) {
    super.pulse(id,amplitude);
    this.recordArrivals();
  }
  recordArrivals() {
    const adjacent=Array.from({length:this.nodes.length},()=>[]);
    for(const edge of this.waveEdges){adjacent[edge.a].push(edge.b);adjacent[edge.b].push(edge.a);}
    const pending=[];
    for(let i=0;i<this.displacement.length;i++){
      if(this.arrivals[i]===null && Math.abs(this.displacement[i])>=this.threshold)pending.push(i);
    }
    // Only prior events can be parents: simultaneous arrivals remain incomparable.
    const events=pending.map(node=>{
      const parents=adjacent[node].filter(j=>this.arrivals[j]!==null)
        .map(j=>this.arrivals[j].eventId).sort((a,b)=>a-b);
      return {id:this.causalEvents.length+pending.indexOf(node),node,time:this.integrationTime,parents};
    });
    for(const event of events){this.arrivals[event.node]={time:event.time,eventId:event.id};this.causalEvents.push(event);}
    return events;
  }
  stepWave(){
    const energy=super.stepWave();
    this.integrationTime+=this.waveDt;
    this.recordArrivals();
    return energy;
  }
  snapshot(){return {integrationTime:this.integrationTime,events:this.causalEvents,arrivals:this.arrivals};}
}

export function compareRefinement(makeWorld,{source,dt,steps,threshold=1e-9}={}) {
  if(!(Number.isFinite(dt)&&dt>0&&Number.isInteger(steps)&&steps>0))throw new RangeError('invalid integration schedule');
  const simulate=(h,n)=>{
    const world=makeWorld(threshold);
    world.initializeWaves({dt:h});world.pulse(source);
    for(let i=0;i<n;i++)world.stepWave();
    return world;
  };
  const coarse=simulate(dt,steps),fine=simulate(dt/2,steps*2);
  const n=coarse.displacement.length;
  const rms=Math.sqrt(coarse.displacement.reduce((sum,u,i)=>sum+(u-fine.displacement[i])**2,0)/Math.max(n,1));
  const norm=Math.sqrt(fine.displacement.reduce((sum,u)=>sum+u*u,0)/Math.max(n,1));
  const both=coarse.arrivals.map((a,i)=>a&&fine.arrivals[i]?i:-1).filter(i=>i>=0);
  const arrivalError=both.length?Math.max(...both.map(i=>Math.abs(coarse.arrivals[i].time-fine.arrivals[i].time))):null;
  return {dt,physicalTimeParameter:dt*steps,rmsDisplacementError:rms,relativeRmsError:rms/Math.max(norm,1e-15),maxArrivalTimeDifference:arrivalError,matchedArrivals:both.length,coarseEvents:coarse.causalEvents.length,fineEvents:fine.causalEvents.length};
}
