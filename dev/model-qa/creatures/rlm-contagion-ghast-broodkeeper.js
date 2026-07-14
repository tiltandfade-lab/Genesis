/* dev/model-qa/creatures/rlm-contagion-ghast-broodkeeper.js — CONTAGION GHAST BROODKEEPER (ash
   realm, Medium Undead, CR 7). Read: a deliberate rot-cultivating ghast — a hunched, patient
   figure tending clusters of pallid fungal egg-sacs grown on its own emaciated frame, mottled
   rot-grey skin with weeping contagion boils, long deliberate grasping claws, a distended
   swollen abdomen webbed with fungal growth, jaw hanging slack. VS-desaturated ash palette with
   sickly pale-fungal accent (the one desaturated "glow"). NO eye quads — hollow sunken sockets
   only. Whole-object grammar: one function, one merged frame, no anchors. Medium size, base
   disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildContagionGhastBroodkeeper(){
  const P = {
    rot:0x565844, rotDk:0x343528, rotLt:0x6c6e54,
    boil:0x7a6038, boilDk:0x4c3c22,
    fungal:0xa0a078, fungalDk:0x707050, fungalGlow:0xc4c294,
    sac:0xb8b088, sacDk:0x847c5c,
    claw:0x38352a, tooth:0x8c8468, mouth:0x1c1a15,
    ooze:0x6a6a38,
    disc:0x443f36, discTop:0x524b3e,
  };

  const L = {
    hipY:0.52, waistY:0.66, ribY:0.80, chestY:0.92, shldY:1.00, neckY:1.05,
    jawY:1.10, browY:1.20, crownY:1.28,
    shoulderX:0.185,
  };

  /* ---------- LEGS — hunched, patient, deliberate crouch stance. ---------- */
  {
    const hipL=V(-0.12,L.hipY-0.02,0.02), kneeL=V(-0.15,0.34,0.10), ankL=V(-0.13,0.09,0.02);
    const hipR=V(0.12,L.hipY-0.02,-0.02), kneeR=V(0.15,0.34,-0.10), ankR=V(0.13,0.09,-0.02);
    tube(hipL,kneeL,0.088,0.062,6,P.rot);
    tube(kneeL,ankL,0.060,0.040,6,P.rotDk);
    tube(hipR,kneeR,0.088,0.062,6,P.rot);
    tube(kneeR,ankR,0.060,0.040,6,P.rotDk);
    // weeping boils on the calves
    for(const [x,y] of [[-0.14,0.24],[0.14,0.20]]) blob(x,y,0.05,0.022,0.018,0.016,P.boil,4,3);
    // clawed feet
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.04,ank.z);
      tube(heel.clone().add(V(0,0,-0.02)), heel.clone().add(V(0,0,0.14)), 0.058,0.044,5,P.rotDk,{capA:{hex:P.rot}});
      for(const dx of [-0.02,0.02]) tube(V(heel.x+dx,0.03,heel.z+0.13),V(heel.x+dx*1.5,0.008,heel.z+0.20),0.014,0.004,4,P.claw,{capB:{hex:P.claw,lift:0.003}});
    }
  }

  /* ---------- TORSO — emaciated, hunched, with a DISTENDED swollen abdomen webbed in fungal growth. ---------- */
  stack([
    {y:L.hipY,   rx:0.145, rz:0.135, hex:P.rotDk, cz:0.02},
    {y:L.waistY, rx:0.195, rz:0.185, hex:P.rot,   cz:0.03},  // the swollen distended abdomen
    {y:L.ribY,   rx:0.150, rz:0.130, hex:P.rotLt, cz:0.01},
    {y:L.chestY, rx:0.130, rz:0.110, hex:P.rot,   cz:0.0},
    {y:L.shldY,  rx:0.150, rz:0.115, hex:P.rotLt, cz:-0.02},
    {y:L.neckY,  rx:0.062, rz:0.058, hex:P.rotDk, cz:-0.03},
  ], 8, {capTop:{hex:P.rotDk, lift:0.005}});
  // fungal webbing across the distended abdomen
  for(let i=0;i<4;i++){
    const a=i/3*Math.PI*0.9-0.3;
    quad(V(Math.cos(a)*0.16,L.waistY+0.05,0.10+Math.sin(a)*0.02),V(Math.cos(a)*0.19,L.waistY-0.06,0.11+Math.sin(a)*0.02),
         V(Math.cos(a)*0.15,L.waistY-0.10,0.09),V(Math.cos(a)*0.12,L.waistY+0.01,0.09), P.fungalDk, 0.07);
  }
  // pallid FUNGAL EGG-SACS clustered on the abdomen and shoulder
  for(const [x,y,z] of [[0.10,L.waistY-0.02,0.20],[-0.08,L.waistY+0.03,0.19],[0.02,L.hipY+0.06,0.21],[-0.14,L.shldY-0.04,0.06]]){
    blob(x,y,z,0.048,0.055,0.048,P.sac,6,4);
  }
  for(const [x,y,z] of [[0.10,L.waistY-0.02,0.20],[-0.08,L.waistY+0.03,0.19]]) blob(x,y,z+0.01,0.014,0.012,0.010,P.fungalGlow,4,3); // pale sac-glow tips
  // weeping contagion boils across the ribs/chest
  for(const [x,y] of [[0.06,L.ribY+0.02],[-0.05,L.chestY-0.01],[0.08,L.chestY+0.02]]) blob(x,y,0.13,0.020,0.016,0.014,P.boilDk,4,3);

  /* ---------- HEAD — gaunt, slack jaw hanging, hollow sunken sockets. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.062, rz:0.058, hex:P.rot},
      {y:L.jawY+0.07, rx:0.068, rz:0.064, hex:P.rotLt},
      {y:L.browY,  rx:0.058, rz:0.052, hex:P.rotDk},
      {y:L.crownY, rx:0.044, rz:0.040, hex:P.rotDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.crownY+0.015,0.0), P.rotDk);
    // hollow sunken sockets (no eye quads)
    for(const s of [-1,1]) blob(s*0.026,L.browY-0.005,0.052,0.014,0.011,0.008,P.mouth,4,3);
    // slack hanging jaw
    quad(V(-0.032,L.jawY-0.005,0.052),V(0.032,L.jawY-0.005,0.052),V(0.030,L.jawY-0.075,0.045),V(-0.030,L.jawY-0.075,0.045),P.mouth,0.03);
    for(const s of [-1,1]) quad(V(s*0.014,L.jawY-0.01,0.052),V(s*0.020,L.jawY-0.01,0.052),V(s*0.018,L.jawY-0.03,0.053),V(s*0.012,L.jawY-0.03,0.053),P.tooth,0.02);
    // fungal growth patch on the scalp
    blob(0.02,L.crownY+0.02,0.0,0.03,0.02,0.026,P.fungal,4,3);
  }

  /* ---------- ARMS — long deliberate grasping claws, tending posture (reaching toward the sacs). ---------- */
  {
    const S=V(L.shoulderX,L.shldY-0.02,0.0), E=V(0.24,0.72,0.20), W=V(0.20,0.50,0.30);
    tube(S,E,0.052,0.040,6,P.rot);
    tube(E,W,0.040,0.026,6,P.rotDk);
    const S2=V(-L.shoulderX,L.shldY-0.02,0.0), E2=V(-0.22,0.66,0.14), W2=V(-0.16,0.48,0.08);
    tube(S2,E2,0.052,0.040,6,P.rot);
    tube(E2,W2,0.040,0.026,6,P.rotDk);
    // long grasping claw-fingers, splayed as if tending
    for(const hand of [W,W2]){
      for(const [dx,dy,dz] of [[0.03,-0.05,0.05],[0.0,-0.06,0.06],[-0.03,-0.05,0.05]]){
        tube(hand, V(hand.x+dx,hand.y+dy,hand.z+dz), 0.014,0.004,4,P.claw,{capB:{hex:P.claw,lift:0.003}});
      }
    }
  }

  /* ---------- base disc (Medium r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
