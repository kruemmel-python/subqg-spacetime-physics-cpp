// FPV-2: Parametrized relational clock. C=P_T+H_graph-E=0.
// No preferred evolution parameter in the constraint; lambda remains a gauge label.
import {buildBonds, energy, force, analyticTwoNode} from './subqg_fpv.mjs';

export function initialConstraint(q,p,bonds,{m=1,k=1,E=0}={}) {
  if (!(m>0 && k>0) || q.length!==p.length) throw Error('Invalid initial state');
  const H=energy(q,p.map(x=>x/m),bonds,k,m);
  return {T:0,P:E-H,q:[...q],p:[...p],E,m,k,bonds};
}
export function constraint(s) {
  return s.P+energy(s.q,s.p.map(x=>x/s.m),s.bonds,s.k,s.m)-s.E;
}
// Symplectic velocity Verlet, with dT = lapse*dLambda. A lapse is a gauge choice.
export function gaugeStep(s,dLambda,lapse=1) {
  if(!(dLambda>0) || !(lapse>0) || !Number.isFinite(dLambda*lapse)) throw Error('Invalid gauge step');
  const dt=dLambda*lapse;
  const a=force(s.q,s.bonds,s.k,s.m);
  const q=s.q.map((x,i)=>x+dt*s.p[i]/s.m+0.5*dt*dt*a[i]);
  const next=force(q,s.bonds,s.k,s.m);
  const p=s.p.map((x,i)=>x+0.5*dt*s.m*(a[i]+next[i]));
  return {...s,T:s.T+dt,q,p};
}
export function evolveGauge(initial,segments) {
  let s=initial;
  for(const {dLambda,lapse,steps} of segments) {
    if(!Number.isInteger(steps)||steps<0) throw Error('Invalid steps');
    for(let i=0;i<steps;i++) s=gaugeStep(s,dLambda,lapse);
  }
  return s;
}
export function experiment() {
  const bonds=buildBonds([0,0],0.7);
  const s=initialConstraint([1,-1],[0,0],bonds);
  const gauges=[
    [{dLambda:0.005,lapse:1,steps:400}],
    [{dLambda:0.005,lapse:0.5,steps:400},{dLambda:0.005,lapse:1.5,steps:200}],
    [{dLambda:0.0025,lapse:2,steps:400}]
  ];
  // second schedule T=2.5; use 200 steps of 1.0 instead of 1.5 for T=2
  gauges[1][1]={dLambda:0.005,lapse:1,steps:200}; // T=1+1=2
  const results=gauges.map((segments,i)=>{
    const r=evolveGauge(s,segments),exact=analyticTwoNode(1,1,1,r.T);
    return {gauge:i,T:r.T,lambda:segments.reduce((a,x)=>a+x.dLambda*x.steps,0),q:r.q,relationalError:Math.max(...r.q.map((x,j)=>Math.abs(x-exact.q[j]))),constraintResidual:constraint(r)};
  });
  return {model:'C=P_T+H_graph-E=0',results,interpretation:'T is an explicitly introduced ideal clock degree of freedom; physical emergence of a clock is NOT derived.'};
}
