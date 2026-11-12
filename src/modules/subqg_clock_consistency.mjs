// FPV-5: Independent oscillator clocks; a stringent counterexample to universal time.
// Each clock is reconstructed solely from q,p of an isolated two-node subsystem.
import {buildBonds,integrate} from './subqg_fpv.mjs';
import {clockAngle,unwrapAngle} from './subqg_internal_clock.mjs';

export function makeClock(phaseDifference,{k=1,m=1,amplitude=1,threshold=0.7}={}) {
  if(![phaseDifference,k,m,amplitude,threshold].every(Number.isFinite)||k<=0||m<=0||amplitude<=0) throw Error('Invalid clock');
  const bonds=buildBonds([0,phaseDifference],threshold);
  if(bonds.length!==1) return null;
  const state={q:[amplitude,-amplitude],p:[0,0],bonds,k,m};
  const initial=clockAngle(state);
  return {state,initialAngle:initial.angle,angle:initial.angle,omega:initial.omega,elapsed:0};
}
export function advanceClock(clock,dt) {
  if(!clock||!Number.isFinite(dt)||dt<=0) throw Error('Invalid step');
  const s=clock.state;
  const next=integrate(s.q,s.p.map(x=>x/s.m),s.bonds,{dt,steps:1,k:s.k,m:s.m});
  s.q=next.q;s.p=next.v.map(x=>x*s.m);
  const a=clockAngle(s);
  clock.angle=unwrapAngle(clock.angle,a.angle);
  clock.elapsed=(clock.angle-clock.initialAngle)/clock.omega;
  return clock.elapsed;
}
export function compareClocks({phaseA=0,phaseB=0.8,dt=0.002,steps=1000}={}) {
  if(!Number.isInteger(steps)||steps<1||!Number.isFinite(dt)||dt<=0) throw Error('Invalid integration');
  const a=makeClock(phaseA),b=makeClock(phaseB);
  if(!a||!b) return {available:false,reason:'at least one clock has no bonded oscillatory sector'};
  let maxDisagreement=0;
  for(let i=0;i<steps;i++) {
    advanceClock(a,dt);advanceClock(b,dt);
    maxDisagreement=Math.max(maxDisagreement,Math.abs(a.elapsed-b.elapsed));
  }
  return {available:true,referenceParameter:dt*steps,clockA:a.elapsed,clockB:b.elapsed,
    disagreement:Math.abs(a.elapsed-b.elapsed),maxDisagreement,
    omegaA:a.omega,omegaB:b.omega,
    // Not a fundamental claim: frequencies are explicitly fixed by the harmonic action.
    universalTimeProven:false};
}
export function experiment(){
  const equal=compareClocks({phaseA:0,phaseB:0});
  const distinct=compareClocks({phaseA:0,phaseB:0.8});
  const refined=compareClocks({phaseA:0,phaseB:0.8,dt:0.001,steps:2000});
  const absent=compareClocks({phaseA:0,phaseB:Math.PI});
  return {model:'FPV-5 independent internal clock consistency',equal,distinct,refined,absent,
    verdict:'Two clock phases can each parametrize their oscillator motion, but the construction presupposes a harmonic action and a common numerical evolution parameter. This does not derive universal physical time.',
    limitations:['Phase-to-time calibration uses omega from the postulated action','Both clocks are integrated with a shared external numerical parameter','Clock comparison does not imply Lorentz invariance or quantum time emergence']};
}
