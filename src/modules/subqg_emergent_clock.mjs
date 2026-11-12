// FPV-4: An oscillator clock exists only when a bound relational normal mode exists.
// This is a conditional diagnostic, NOT a proof that time is created by bonding.
import {buildBonds,integrate} from './subqg_fpv.mjs';
import {clockAngle,unwrapAngle} from './subqg_internal_clock.mjs';
export function clockSector(phases,{threshold=0.7,k=1,m=1}={}) {
  const bonds=buildBonds(phases,threshold);
  if(phases.length!==2) throw Error('Two-element sector only');
  if(bonds.length===0) return {available:false,reason:'no coupled relative normal mode',bonds};
  const omega=Math.sqrt(2*k*bonds[0].w/m);
  return {available:true,bonds,omega};
}
export function probe(phases,{threshold=0.7,q=[1,-1],p=[0,0],dt=0.002,steps=1000,k=1,m=1}={}) {
  if(!(dt>0)||!Number.isInteger(steps)||steps<0||q.length!==2||p.length!==2) throw Error('Invalid probe');
  const sector=clockSector(phases,{threshold,k,m});
  const startEnergy=p.reduce((s,x)=>s+x*x/(2*m),0);
  if(!sector.available) return {...sector,clock:null,diagnostic:'No periodic relational mode; external numerical steps still exist'};
  const state={q,p,bonds:sector.bonds,m,k};
  let initial;
  try {initial=clockAngle(state);} catch(e) {return {...sector,available:false,clock:null,reason:e.message};}
  let last=initial.angle;
  let monotonicViolations=0;
  let maxRadiusDrift=0;
  for(let i=0;i<steps;i++) {
    // integrate one step, using only existing q,p; never create a clock coordinate
    const result=integrate(state.q,state.p.map(x=>x/m),sector.bonds,{dt,steps:1,k,m});
    state.q=result.q; state.p=result.v.map(x=>x*m);
    const current=clockAngle(state);
    const next=unwrapAngle(last,current.angle);
    if(next<last-1e-12) monotonicViolations++;
    last=next;
    maxRadiusDrift=Math.max(maxRadiusDrift,Math.abs(current.radius-initial.radius));
  }
  return {...sector,clock:{tau:(last-initial.angle)/initial.omega,monotonicViolations,maxRadiusDrift,referenceIntegrationTime:dt*steps},startEnergy};
}
export function experiment(){
  const scenarios={bonded:probe([0,0]),unbonded:probe([0,Math.PI]),zeroAmplitude:probe([0,0],{q:[0,0]}),nearThresholdBonded:probe([0,1.1]),nearThresholdUnbonded:probe([0,1.2])};
  return {model:'Conditional relational oscillator clock',scenarios,verdict:'The mode exists only with nonzero bond and excitation, but its activation is a consequence of a chosen graph threshold and harmonic action, not an independently derived birth of physical time.',limitations:['Phase overlap and threshold are prescribed','Dynamics uses an external integration parameter','A nonperiodic system might still support other clocks','No quantum measurement, Lorentz limit or gravity prediction']};
}
