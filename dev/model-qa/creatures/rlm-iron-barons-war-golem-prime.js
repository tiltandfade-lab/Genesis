/* dev/model-qa/creatures/rlm-iron-barons-war-golem-prime.js — "Iron Baron's War-Golem Prime"
   (frontier realm, Huge construct, CR 13, disc r=0.68). A towering rail-yard colossus welded
   from three wrecked locomotive/engine hulks stacked into a rough humanoid frame: a boiler-drum
   torso, cowcatcher-plate shoulders, piston-driven arms ending in coupler-hook fists, smokestack
   "head" venting soot. VS-desaturated rust/soot-black iron palette, riveted plating. No eye
   quads — a single dim boiler-glow slit stands in for a face. Whole-object grammar. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildIronBaronsWarGolemPrime(){
  const P = {
    iron:0x413c36, ironDk:0x27231f, ironLt:0x59524a,        // rusted engine iron
    rust:0x6b4630, rustDk:0x452c1e, rivet:0x1c1916,
    boilerGlow:0x8a5a34, boilerGlowDk:0x5c3b22,             // dim furnace-slit glow (not a face)
    soot:0x1a1714, steam:0x6a6a62,
    disc:0x4a4038, discTop:0x584a3a,
  };

  /* landmark spine — a stacked-hulk colossus, wide + blocky */
  const S = {
    base:V(0,1.00,0), waist:V(0,1.42,0), boilerB:V(0,1.90,0.02), boilerT:V(0,2.55,0),
    shldr:V(0,2.80,0), stackB:V(0,2.95,-0.02), stackT:V(0,3.35,0),
  };

  /* legs — squat piston-driven trestle stumps */
  for(const s of [-1,1]){
    const hip=V(s*0.28,0.98,0), knee=V(s*0.30,0.55,0.04), foot=V(s*0.30,0.10,0.10);
    tube(hip,knee,0.30,0.24,8,P.iron,{phase:Math.PI/8});
    tube(knee,foot,0.24,0.28,8,P.ironDk,{phase:Math.PI/8,capB:{hex:P.ironDk,lift:0.03}});
    /* riveted plate seam */
    quad(V(hip.x-0.15,1.55,0.20), V(hip.x+0.15,1.55,0.20), V(hip.x+0.17,0.80,0.22), V(hip.x-0.17,0.80,0.22), P.rust, 0.05);
  }

  /* boiler-drum torso — the wrecked engine boiler, huge cylindrical barrel */
  tube(S.base, S.waist, 0.46, 0.52, 10, P.iron, {phase:Math.PI/10});
  tube(S.waist, S.boilerB, 0.52, 0.58, 10, P.ironLt, {phase:Math.PI/10});
  tube(S.boilerB, S.boilerT, 0.58, 0.48, 10, P.iron, {phase:Math.PI/10});
  tube(S.boilerT, S.shldr, 0.48, 0.42, 10, P.ironDk, {phase:Math.PI/10});
  /* rivet bands ringing the boiler */
  for(const yy of [1.55, 2.05, 2.35]){
    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2, rx=Math.cos(a)*0.50, rz=Math.sin(a)*0.50;
      quad(V(rx-0.02,yy-0.02,rz), V(rx+0.02,yy-0.02,rz), V(rx+0.02,yy+0.02,rz), V(rx-0.02,yy+0.02,rz), P.rivet, 0.02);
    }
  }
  /* dim boiler-glow slit standing in for a face (not eyes) */
  quad(V(-0.14,2.20,0.46), V(0.14,2.20,0.46), V(0.10,2.12,0.48), V(-0.10,2.12,0.48), P.boilerGlow, 0.06);
  quad(V(-0.10,2.19,0.47), V(0.10,2.19,0.47), V(0.07,2.14,0.485), V(-0.07,2.14,0.485), P.boilerGlowDk, 0.04);

  /* cowcatcher-plate shoulders — angled wedge plates flaring out */
  for(const s of [-1,1]){
    const sh=S.shldr;
    quad(V(sh.x,sh.y+0.10,sh.z-0.10), V(sh.x+s*0.55,sh.y+0.02,sh.z-0.06), V(sh.x+s*0.60,sh.y-0.30,sh.z+0.20), V(sh.x,sh.y-0.15,sh.z+0.18), P.rust, 0.05);
    quad(V(sh.x,sh.y+0.08,sh.z+0.10), V(sh.x+s*0.50,sh.y+0.00,sh.z+0.20), V(sh.x+s*0.55,sh.y-0.28,sh.z+0.44), V(sh.x,sh.y-0.14,sh.z+0.34), P.rustDk, 0.05);
  }

  /* smokestack "head" — venting soot, no face */
  tube(S.stackB, S.stackT, 0.20, 0.15, 8, P.ironDk, {phase:Math.PI/8});
  {
    const r1=ring(V(0,3.35,0),V(0,1,0),0.15,0.15,8);
    const r2=ring(V(0,3.44,0),V(0,1,0),0.20,0.20,8);
    stitch([r1,r2],()=>P.iron); capFan(r2, V(0,3.42,0), P.ironDk, true);
    /* soot puffs drifting off the stack lip */
    for(const [dx,dy,dz] of [[0.05,0.10,0.02],[-0.06,0.16,-0.03],[0.02,0.22,0.04]]){
      quad(V(dx-0.05,3.46+dy,dz), V(dx+0.05,3.46+dy,dz), V(dx+0.04,3.50+dy,dz+0.02), V(dx-0.04,3.50+dy,dz+0.02), P.soot, 0.10);
    }
  }

  /* PISTON-DRIVEN ARMS — telescoping cylinder shoulders down to coupler-hook fists */
  const pistonArm=(side)=>{
    const shoulder=V(side*0.55,2.70,0.10);
    const elbow=V(side*0.62,2.20,0.30);
    const cylBottom=V(side*0.60,1.75,0.42);
    const hook=V(side*0.56,1.48,0.52);
    tube(shoulder,elbow,0.20,0.17,7,P.iron,{phase:Math.PI/7});
    /* piston cylinder — a bright banded rod inset in the forearm tube */
    tube(elbow,cylBottom,0.17,0.14,7,P.ironLt,{phase:Math.PI/7});
    quad(V(elbow.x-0.05,elbow.y-0.05,elbow.z+0.15), V(elbow.x+0.05,elbow.y-0.05,elbow.z+0.15),
         V(cylBottom.x+0.04,cylBottom.y+0.05,cylBottom.z+0.18), V(cylBottom.x-0.04,cylBottom.y+0.05,cylBottom.z+0.18), P.rust, 0.05);
    /* coupler-hook fist — a heavy blunt hook, rail-coupler shape */
    tube(cylBottom, hook, 0.14, 0.11, 6, P.ironDk, {phase:Math.PI/6});
    const hookTip=V(hook.x, hook.y-0.16, hook.z+0.08);
    tube(hook, hookTip, 0.09, 0.05, 5, P.rust, {capB:{hex:P.rustDk, lift:0.02}});
    quad(V(hookTip.x-0.07,hookTip.y+0.02,hookTip.z), V(hookTip.x+0.07,hookTip.y+0.02,hookTip.z),
         V(hookTip.x+0.05,hookTip.y-0.10,hookTip.z+0.06), V(hookTip.x-0.05,hookTip.y-0.10,hookTip.z+0.06), P.rustDk, 0.05);
  };
  pistonArm(-1); pistonArm(1);

  /* base disc (Huge: r=0.68) */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
