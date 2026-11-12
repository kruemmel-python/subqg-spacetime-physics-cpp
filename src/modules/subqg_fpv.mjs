// FPV-1: Minimal falsifiable discrete action model. No background spatial coordinates.
// Fundamental phases define overlap; overlap selects bonds, not a physical distance.
export function overlap(a,b) { return (1 + Math.cos(a-b))/2; }
export function buildBonds(phases,threshold=0.7) {
  if (!Array.isArray(phases)||phases.some(x=>!Number.isFinite(x))||!Number.isFinite(threshold)||threshold<0||threshold>1) throw Error('Invalid phases or threshold');
  const bonds=[];
  for(let i=0;i<phases.length;i++) for(let j=i+1;j<phases.length;j++) {
    const w=overlap(phases[i],phases[j]);
    if(w>=threshold) bonds.push({i,j,w});
  }
  return bonds;
}
// S = integral dt [m/2 sum dot(q_i)^2 - k/2 sum_b w_b(q_i-q_j)^2]
// Euler-Lagrange: m ddot(q_i) = -k sum_j w_ij(q_i-q_j).
// q is a dynamical field on the relational graph; t is EXTERNAL numerical time.
export function force(q,bonds,k=1,m=1) {
  if(!(k>0&&m>0)||q.some(x=>!Number.isFinite(x))) throw Error('Invalid parameters');
  const a=new Array(q.length).fill(0);
  for(const {i,j,w} of bonds) {
    if(i<0||j>=q.length||i>=j||!Number.isFinite(w)||w<0) throw Error('Invalid bond');
    const f=k*w*(q[j]-q[i])/m; a[i]+=f;a[j]-=f;
  }
  return a;
}
export function energy(q,v,bonds,k=1,m=1) {
  let e=0;
  for(let i=0;i<q.length;i++) e+=0.5*m*v[i]**2;
  for(const {i,j,w} of bonds) e+=0.5*k*w*(q[i]-q[j])**2;
  return e;
}
export function integrate(q0,v0,bonds,{dt=0.01,steps=1000,k=1,m=1}={}) {
  if(q0.length!==v0.length||!Number.isInteger(steps)||steps<0||!(dt>0)) throw Error('Invalid integration');
  let q=[...q0],v=[...v0],a=force(q,bonds,k,m);
  for(let s=0;s<steps;s++) {
    for(let i=0;i<q.length;i++) q[i]+=dt*v[i]+0.5*dt*dt*a[i];
    const next=force(q,bonds,k,m);
    for(let i=0;i<v.length;i++) v[i]+=0.5*dt*(a[i]+next[i]);
    a=next;
  }
  return {q,v,energy:energy(q,v,bonds,k,m)};
}
export function analyticTwoNode(w,k,m,t) {
  const omega=Math.sqrt(2*k*w/m);
  return {q:[Math.cos(omega*t),-Math.cos(omega*t)],v:[-omega*Math.sin(omega*t),omega*Math.sin(omega*t)],omega};
}
export function experiment() {
  const phases=[0,0]; const bonds=buildBonds(phases,0.7);
  const initialQ=[1,-1], initialV=[0,0], initialEnergy=energy(initialQ,initialV,bonds);
  const runs=[0.08,0.04,0.02,0.01].map(dt=>{
    const steps=Math.round(2/dt), t=steps*dt;
    const numerical=integrate(initialQ,initialV,bonds,{dt,steps});
    const analytic=analyticTwoNode(1,1,1,t);
    const error=Math.hypot(...numerical.q.map((x,i)=>x-analytic.q[i]))/Math.sqrt(2);
    return {dt,t,error,energyDrift:Math.abs(numerical.energy-initialEnergy)/initialEnergy};
  });
  // Null model: phases orthogonal -> no bonds above threshold, no wave transfer.
  const nullBonds=buildBonds([0,Math.PI],0.7);
  const nullRun=integrate([1,-1],[0,0],nullBonds,{dt:0.01,steps:200});
  return {claim:'Numerical dynamics follows a postulated relational action, not a derived law of nature',bonds,bondCount:bonds.length,analyticOmega:Math.SQRT2,runs,nullModel:{bondCount:nullBonds.length,q:nullRun.q},physicalTimeEmergent:false,gravityDerived:false};
}
