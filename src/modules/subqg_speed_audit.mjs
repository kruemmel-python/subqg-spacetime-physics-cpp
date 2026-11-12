import {intrinsicDistances, measureSignalSpeed} from './subqg_signal_speed.mjs';

/** Diagnostic audit: independent factors, no claim of a physical invariant speed. */
export function auditSignalSpeed(makeWorld, {sources, thresholds=[1e-10,1e-12,1e-14], dts=[0.01,0.005,0.0025], duration=1, amplitude=1}={}) {
  if(typeof makeWorld!=='function') throw new TypeError('world factory required');
  if(!Array.isArray(sources)||sources.length===0||new Set(sources).size!==sources.length) throw new RangeError('distinct sources required');
  if(!Number.isFinite(duration)||duration<=0||!Number.isFinite(amplitude)||amplitude===0) throw new RangeError('invalid duration or amplitude');
  for(const [name, values] of [['thresholds',thresholds],['dts',dts]]) {
    if(!Array.isArray(values)||values.length===0||values.some(x=>!Number.isFinite(x)||x<=0)) throw new RangeError(`invalid ${name}`);
  }
  const rows=[];
  for(const source of sources) for(const threshold of thresholds) for(const dt of dts) {
    const steps=Math.round(duration/dt);
    if(steps<1||Math.abs(steps*dt-duration)>1e-9) throw new RangeError('duration must be divisible by dt');
    const world=makeWorld();
    const m=measureSignalSpeed(world,source,{threshold,dt,steps,amplitude});
    const degree=world.waveEdges.filter(e=>e.a===source||e.b===source).length;
    const dist=intrinsicDistances(world,source);
    const reachable=dist.filter(Number.isFinite).length-1;
    rows.push({source,threshold,dt,degree,reachable,arrived:m.arrived,coverage:reachable?m.arrived/reachable:null,median:m.medianApparentSpeed,min:m.minApparentSpeed,max:m.maxApparentSpeed});
  }
  const baseThreshold=thresholds[Math.floor(thresholds.length/2)];
  const baseDt=dts[Math.floor(dts.length/2)];
  const baseline=rows.filter(r=>r.threshold===baseThreshold&&r.dt===baseDt&&r.median!==null);
  const medians=baseline.map(r=>r.median);
  const spread=medians.length>1?Math.max(...medians)/Math.min(...medians):null;
  const variation=(group)=>{
    const valid=group.filter(r=>r.median!==null);
    return valid.length>1?Math.max(...valid.map(r=>r.median))/Math.min(...valid.map(r=>r.median)):null;
  };
  return {rows,baseline:{threshold:baseThreshold,dt:baseDt,sourceSpread:spread},sensitivity:sources.map(source=>({source,thresholdSpread:variation(rows.filter(r=>r.source===source&&r.dt===baseDt)),dtSpread:variation(rows.filter(r=>r.source===source&&r.threshold===baseThreshold))})),limitations:['Threshold arrival is operational, not a causal light cone','Integrator time is not emergent physical time','Distances and couplings are model-defined','Topology is held fixed during propagation']};
}
