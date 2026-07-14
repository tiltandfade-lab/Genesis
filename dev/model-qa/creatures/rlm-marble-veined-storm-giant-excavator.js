/* dev/model-qa/creatures/rlm-marble-veined-storm-giant-excavator.js — MARBLE-VEINED STORM GIANT
   EXCAVATOR (lost-world, Huge Giant, CR 13). Read: a towering storm giant, skin like veined
   marble (pale grey-blue shot through with darker mineral streaks), standing sentinel-still over
   a quarry pit, one hand resting on a massive stone spade planted point-down in the rubble.
   Huge scale (bigger frame than the hill giant — a taller, more regal build), a crown of
   close-cropped stone-grey hair, storm-blue eyes REMOVED per the eye ruling (socket shapes
   only). VS-desaturated marble-blue/grey palette. Whole-object grammar: one function, one
   frame, no anchors. Huge size, base disc r=0.68. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildMarbleVeinedStormGiantExcavator(){
  const P = {
    skin:0x8f9aa0, skinDk:0x66727a, skinLt:0xacb6ba,
    vein:0x4a5860, veinDk:0x33404a,
    hair:0x6a6e70, hairDk:0x484c4e,
    cloth:0x3c4a54, clothDk:0x28323a, clothLt:0x546470,
    spade:0x5a5850, spadeDk:0x3c3a34, spadeLt:0x76726a,
    dirt:0x4c4232, dirtDk:0x342c20,
    disc:0x4a4038, discTop:0x585047,
  };

  const L = {
    hipY:1.24, waistY:1.44, ribY:1.72, chestY:1.96, shldY:2.14, neckY:2.24,
    hipHalf:0.290, shoulderX:0.600,
    jawY:2.36, cheekY:2.50, browY:2.64, crownY:2.76, headTopY:2.86,
  };

  /* stands tall, regal, barely a lean — a sentinel, not a slump */
  const stand=(p)=>p;

  /* ---------- STONE SPADE — planted point-down beside the giant, its haft under the right hand. ---------- */
  const GRIP = V(0.68, 1.86, 0.20);
  const TIP  = V(0.86, 0.02, 0.14);
  const TOP  = V(0.52, 2.70, 0.08);
  const HAFT = new THREE.Vector3().subVectors(TOP, GRIP).normalize();
  {
    tube(TIP, GRIP.clone().addScaledVector(HAFT,-0.16), 0.070, 0.095, 7, P.spadeDk);
    tube(GRIP.clone().addScaledVector(HAFT,-0.16), GRIP.clone().addScaledVector(HAFT,0.16), 0.098, 0.100, 7, P.spade);
    tube(GRIP.clone().addScaledVector(HAFT,0.16), TOP, 0.100, 0.070, 7, P.spadeLt, {capB:{hex:P.spadeDk, lift:0.02}});
    // the broad spade blade near the tip
    const bladeC=TIP.clone().addScaledVector(HAFT,0.28);
    const up=V(0,1,0), u=new THREE.Vector3().crossVectors(up,HAFT).normalize();
    quad(bladeC.clone().addScaledVector(u,-0.16), bladeC.clone().addScaledVector(u,0.16),
         bladeC.clone().addScaledVector(HAFT,0.22).addScaledVector(u,0.10),
         bladeC.clone().addScaledVector(HAFT,0.22).addScaledVector(u,-0.10), P.spadeDk, 0.05);
    // dirt clod at the buried tip
    blob(TIP.x, TIP.y+0.06, TIP.z, 0.13, 0.09, 0.12, P.dirt, 6, 3);
    blob(TIP.x+0.10, TIP.y+0.10, TIP.z-0.06, 0.07, 0.05, 0.06, P.dirtDk, 5, 3);
  }

  /* ---------- TORSO — tall, regal, marble-veined skin. ---------- */
  const torsoRings = stack([
    {y:L.hipY,   rx:0.360, rz:0.320, hex:P.skinDk},
    {y:L.waistY, rx:0.380, rz:0.340, hex:P.skin},
    {y:L.ribY,   rx:0.420, rz:0.340, hex:P.skinLt},
    {y:L.chestY, rx:0.460, rz:0.310, hex:P.skin},
    {y:L.shldY,  rx:0.560, rz:0.330, hex:P.skinLt},
    {y:L.neckY,  rx:0.220, rz:0.210, hex:P.skinDk},
  ], 8, {xform:stand, capTop:{hex:P.skinDk, lift:0.008}});
  /* marble vein streaks across chest + shoulders */
  for(const [x0,y0,x1,y1] of [[-0.18,L.chestY-0.06,-0.06,L.ribY+0.04],[0.20,L.shldY-0.06,0.10,L.chestY],[-0.30,L.shldY,-0.14,L.ribY-0.02]]){
    quad(V(x0,y0,0.30), V(x0+0.02,y0,0.30), V(x1+0.02,y1,0.28), V(x1,y1,0.28), P.vein, 0.06);
  }

  /* ---------- STORM-CLOTH kilt/wrap — dark blue-grey draped over the hips. ---------- */
  {
    stack([
      {y:L.waistY+0.02, rx:0.400, rz:0.350, hex:P.cloth},
      {y:L.hipY-0.02,   rx:0.410, rz:0.360, hex:P.clothDk},
      {y:L.hipY-0.30,   rx:0.420, rz:0.380, hex:P.clothLt},
    ], 8, {xform:stand});
  }

  /* ---------- HEAD — regal, close-cropped stone-grey hair, socket-only (no eye quads). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.235, rz:0.225, hex:P.skinLt},
      {y:L.cheekY, rx:0.245, rz:0.235, hex:P.skin},
      {y:L.browY,  rx:0.225, rz:0.200, hex:P.skin},
      {y:L.crownY, rx:0.190, rz:0.175, hex:P.hairDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]) rings[2][i].z += 0.02;
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.headTopY,0.0), P.hairDk);
    /* eye sockets — carved hollow shapes only, no orb/quad */
    for(const s of [-1,1]){
      const c=V(s*0.09,L.browY-0.02,0.19);
      blob(c.x,c.y,c.z,0.035,0.025,0.02,P.veinDk,5,3);
    }
    /* jaw */
    tube(V(0,L.jawY+0.01,0.03), V(0,L.jawY-0.14,0.19), 0.235,0.155,6,P.skinLt,{raz:0.20,rbz:0.11,capB:{hex:P.skinDk}});
    /* close-cropped hair cap */
    for(const s of [-1,1]){
      const c=V(s*0.14,L.crownY+0.02,-0.02);
      blob(c.x,c.y,c.z,0.10,0.05,0.10,P.hair,5,3);
    }
    blob(0,L.crownY+0.03,-0.02,0.14,0.06,0.13,P.hair,6,3);
  }

  /* ---------- ARMS — right resting on the spade haft; left hangs loose, watchful. ---------- */
  {
    const S=V(L.shoulderX-0.04,L.shldY-0.02,0.02), E=V(0.66,1.98,0.14);
    tube(S,E,0.185,0.145,6,P.skin);
    tube(E, GRIP.clone().addScaledVector(HAFT,-0.02), 0.145,0.115,6,P.skinDk);
    tube(GRIP.clone().addScaledVector(HAFT,-0.12), GRIP.clone().addScaledVector(HAFT,0.12), 0.13,0.12,6,P.skinLt);

    const S2=V(-L.shoulderX+0.04,L.shldY-0.02,0.02), E2=V(-0.60,1.44,0.08), W2=V(-0.56,0.94,0.14);
    tube(S2,E2,0.185,0.145,6,P.skin);
    tube(E2,W2,0.145,0.115,6,P.skinDk);
    blob(W2.x,W2.y-0.05,W2.z+0.05,0.13,0.10,0.11,P.skinLt,6,3);
  }

  /* ---------- LEGS — thick, planted wide, standing guard over the pit. ---------- */
  {
    const hipL=V(-L.hipHalf,L.hipY-0.03,0.0), kneeL=V(-0.44,0.70,0.10), ankL=V(-0.46,0.14,0.06);
    const hipR=V(L.hipHalf,L.hipY-0.03,0.0), kneeR=V(0.44,0.70,-0.06), ankR=V(0.46,0.14,-0.10);
    tube(hipL,kneeL,0.260,0.190,6,P.skin);
    tube(kneeL,ankL,0.180,0.130,6,P.skinDk);
    tube(hipR,kneeR,0.260,0.190,6,P.skin);
    tube(kneeR,ankR,0.180,0.130,6,P.skinDk);
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.06,ank.z);
      tube(heel.clone().add(V(0,0,-0.04)), heel.clone().add(V(0,0,0.26)), 0.150,0.110,6,P.skin, {capA:{hex:P.skinDk}});
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 18);
    const r2=ring(V(0,0.062,0), V(0,1,0), 0.66, 0.66, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.065,0), P.discTop);
  }
}
