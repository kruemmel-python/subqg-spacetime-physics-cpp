// FPV-3: internal phase clock extracted from existing graph degrees of freedom.
// No extra clock coordinate. Restricted to a nonzero-energy two-node oscillator.
import {buildBonds, analyticTwoNode} from './subqg_fpv.mjs';
import {initialConstraint, gaugeStep} from './subqg_relational_clock.mjs';

export function clockAngle(state) {
  const {q,p,bonds,m,k}=state;
  if(q.length!==2 || p.length!==2 || bonds.length!==1 || bonds[0].i!==0 || bonds[0].j!==1) throw Error('Clock sector requires a coupled two-node oscillator');
  const omega=Math.sqrt(2*k*bonds[0].w/m);
  if(!(omega>0)) throw Error('No oscillatory clock');
  const x=(q[0]-q[1])/2;
  const y=-(p[0]-p[1])/(2*m*omega);
  const radius=Math.hypot(x,y);
  if(!(radius>1e-10)) throw Error('Clock undefined at zero oscillation amplitude');
  return {angle:Math.atan2(y,x),radius,omega};
}
export function unwrapAngle(previousUnwrapped,nextPrincipal) {
  if(!Number.isFinite(previousUnwrapped)||!Number.isFinite(nextPrincipal)) throw Error('Invalid angle');
  const previousPrincipal=Math.atan2(Math.sin(previousUnwrapped),Math.cos(previousUnwrapped));
  let delta=nextPrincipal-previousPrincipal;
  if(delta>Math.PI) delta-=2*Math.PI;
  if(delta< -Math.PI) delta+=2*Math.PI;
  return previousUnwrapped+delta;
}
export function evolveInternalClock({dLambda,lapse,steps}={}) {
  if(!(dLambda>0&&lapse>0)||!Number.isInteger(steps)||steps<0) throw Error('Invalid evolution');
  const bonds=buildBonds([0,0]);
  let state=initialConstraint([1,-1],[0,0],bonds);
  const start=clockAngle(state);
  let unwrapped=start.angle;
  const samples=[{step:0,tau:0,q0:state.q[0]}];
  for(let i=1;i<=steps;i++) {
    state=gaugeStep(state,dLambda,lapse);
    const current=clockAngle(state);
    unwrapped=unwrapAngle(unwrapped,current.angle);
    samples.push({step:i,tau:(unwrapped-start.angle)/start.omega,q0:state.q[0]});
  }
  return {samples,final:state,clockTime:samples.at(-1).tau,lambda:dLambda*steps,omega:start.omega};
}
export function experiment() {
  const runs=[
    evolveInternalClock({dLambda:0.005,lapse:1,steps:400}),
    evolveInternalClock({dLambda:0.0025,lapse:2,steps:400}),
    evolveInternalClock({dLambda:0.0025,lapse:1,steps:800})
  ];
  const summary=runs.map((r,i)=>({gauge:i,lambda:r.lambda,clockTime:r.clockTime,q0:r.final.q[0],analyticError:Math.abs(r.final.q[0]-analyticTwoNode(1,1,1,r.clockTime).q[0]),maxMonotonicViolation:Math.max(0,...r.samples.slice(1).map((s,j)=>r.samples[j].tau-s.tau))}));
  return {method:'Internal oscillator phase from existing q,p; no added clock variable',summary,limitations:['Requires nonzero oscillator amplitude','Clock unwrap requires sufficiently small steps','Numerical evolution still uses an external integration parameter','Clock is not derived from creation of microplanes','No physical gravity or quantum-time emergence established']};
}
