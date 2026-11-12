// FPV-6: two interacting clocks. A single four-degree-of-freedom Hamiltonian,
// with weak cross-coupling. No clock synchronization rule is inserted.
import {unwrapAngle} from './subqg_internal_clock.mjs';
const W_A=Math.sqrt(2), W_B=Math.sqrt(2*0.85);
export function createSystem({coupling=0.04, amplitudeA=1,amplitudeB=0.8}={}) {
  if(![coupling,amplitudeA,amplitudeB].every(Number.isFinite)||coupling<0||amplitudeA<=0||amplitudeB<=0) throw Error('Invalid system');
  return {q:[amplitudeA,-amplitudeA,amplitudeB,-amplitudeB],v:[0,0,0,0],coupling};
}
export function forces(s) {
  const f=[0,0,0,0];
  for(const [i,j,k] of [[0,1,1],[2,3,0.85],[1,2,s.coupling]]) {
    const d=k*(s.q[i]-s.q[j]);f[i]-=d;f[j]+=d;
  }
  return f;
}
export function energy(s){
  const kinetic=s.v.reduce((a,x)=>a+x*x/2,0);
  return kinetic+0.5*(s.q[0]-s.q[1])**2+0.425*(s.q[2]-s.q[3])**2+0.5*s.coupling*(s.q[1]-s.q[2])**2;
}
export function step(s,h){
  if(!(h>0&&Number.isFinite(h)))throw Error('Invalid step');
  const a=forces(s),q=s.q.map((x,i)=>x+h*s.v[i]+h*h*a[i]/2);
  const tmp={...s,q};const b=forces(tmp);
  return {...tmp,v:s.v.map((x,i)=>x+h*(a[i]+b[i])/2)};
}
function angle(s,offset,omega){
  const x=(s.q[offset]-s.q[offset+1])/2;
  const y=-(s.v[offset]-s.v[offset+1])/(2*omega);
  if(Math.hypot(x,y)<1e-10) return null;
  return Math.atan2(y,x);
}
export function run({coupling=0.04,dt=0.002,steps=1000,lapse=1}={}){
  if(!Number.isInteger(steps)||steps<1||!(dt>0)||!(lapse>0))throw Error('Invalid integration');
  let s=createSystem({coupling}), a=angle(s,0,W_A),b=angle(s,2,W_B);
  let a0=a,b0=b,violations=0;const samples=[{lambda:0,tauA:0,tauB:0,q:[...s.q]}];
  const E0=energy(s);
  for(let n=1;n<=steps;n++){
    s=step(s,dt*lapse);
    const pa=angle(s,0,W_A),pb=angle(s,2,W_B);
    if(pa===null||pb===null) return {available:false,reason:'clock amplitude vanished'};
    const na=unwrapAngle(a,pa),nb=unwrapAngle(b,pb);
    if(na<a-1e-10||nb<b-1e-10) violations++;
    a=na;b=nb;
    samples.push({lambda:n*dt,tauA:(a-a0)/W_A,tauB:(b-b0)/W_B,q:[...s.q]});
  }
  return {available:true,coupling,elapsedParameter:steps*dt*lapse,initialEnergy:E0,finalEnergy:energy(s),energyDrift:(energy(s)-E0)/E0,monotonicViolations:violations,final:samples.at(-1),samples};
}
// Compare q as a function of the internal clock, not at a shared numerical step.
export function interpolateAt(samples,clock,target){
  if(!['tauA','tauB'].includes(clock)||!Number.isFinite(target))throw Error('Invalid relational query');
  for(let i=1;i<samples.length;i++){
    const a=samples[i-1],b=samples[i];
    if(a[clock]<=target&&target<=b[clock]&&b[clock]>a[clock]){
      const f=(target-a[clock])/(b[clock]-a[clock]);
      return {tauOther:a[clock==='tauA'?'tauB':'tauA']*(1-f)+b[clock==='tauA'?'tauB':'tauA']*f,q:a.q.map((x,j)=>x*(1-f)+b.q[j]*f)};
    }
  }
  return null;
}
export function experiment(){
  const uncoupled=run({coupling:0});
  const coupled=run({coupling:0.04});
  const refined=run({coupling:0.04,dt:0.001,steps:2000});
  const gauge=run({coupling:0.04,dt:0.001,steps:1000,lapse:2});
  const target=1.5;
  const a=interpolateAt(coupled.samples,'tauA',target);
  const b=interpolateAt(coupled.samples,'tauB',target);
  const ar=interpolateAt(refined.samples,'tauA',target);
  const ag=interpolateAt(gauge.samples,'tauA',target);
  return {model:'FPV-6 coupled oscillator clocks',uncoupled:{final:uncoupled.final,energyDrift:uncoupled.energyDrift},coupled:{final:coupled.final,energyDrift:coupled.energyDrift,monotonicViolations:coupled.monotonicViolations},refined:{final:refined.final,energyDrift:refined.energyDrift,monotonicViolations:refined.monotonicViolations},relational:{target,a,b,refinedA:ar,gaugeA:ag},verdict:'Interaction changes the clock relation; no universal synchronization emerges. Internal clock readings are phase conventions calibrated using the assumed oscillator Hamiltonian.',limitations:['Shared numerical evolution parameter remains','Cross coupling and harmonic action are postulated','Not a derivation of physical spacetime or gravity']};
}
