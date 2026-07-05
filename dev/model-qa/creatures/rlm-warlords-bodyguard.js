/* dev/model-qa/creatures/rlm-warlords-bodyguard.js — WARLORD'S BODYGUARD (ash realm, Medium
   Humanoid, CR 7). Read: a silent seat-loyal bodyguard — heavily armored in matched scrap-plate
   over dark leather, a full closed helm with a single narrow vision-slit (no face shown), a
   short brutal cleaver-shield combo held ready, rigid at-attention stance, a torn cloth sash in
   the warlord's colors tied at the shoulder. VS-desaturated ash palette: dull gunmetal plate,
   dark oiled leather, one faded sash-color accent. NO eye quads — the vision-slit is a dark line
   only. Whole-object grammar: one function, one merged frame, no anchors. Medium size, base
   disc r=0.42. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildWarlordsBodyguard(){
  const P = {
    plate:0x4e4a40, plateDk:0x2e2b25, plateLt:0x666050,
    leather:0x342c22, leatherDk:0x201a14, leatherLt:0x453a2c,
    slit:0x100e0b,
    sash:0x7a3020, sashDk:0x4c1e14,
    rivet:0x1c1a16,
    shield:0x565046, shieldDk:0x322f28,
    blade:0x5c5850, bladeDk:0x38352e, haft:0x342b20,
    disc:0x443f36, discTop:0x524b3e,
  };

  const L = {
    hipY:0.60, waistY:0.72, ribY:0.90, chestY:1.04, shldY:1.16, neckY:1.22,
    jawY:1.28, browY:1.40, crownY:1.48,
    shoulderX:0.230,
  };

  /* ---------- LEGS — rigid at-attention stance, matched armored greaves. ---------- */
  {
    const hipL=V(-0.13,L.hipY-0.02,0), kneeL=V(-0.135,0.34,0.02), ankL=V(-0.135,0.09,0.0);
    const hipR=V(0.13,L.hipY-0.02,0), kneeR=V(0.135,0.34,-0.02), ankR=V(0.135,0.09,0.0);
    tube(hipL,kneeL,0.125,0.092,6,P.leather);
    tube(kneeL,ankL,0.088,0.068,6,P.plate);
    tube(hipR,kneeR,0.125,0.092,6,P.leather);
    tube(kneeR,ankR,0.088,0.068,6,P.plate);
    for(const [x,y] of [[-0.135,0.24],[0.135,0.24]]) quad(V(x-0.018,y,0.05),V(x+0.018,y,0.05),V(x+0.014,y-0.10,0.045),V(x-0.014,y-0.10,0.045),P.plateDk,0.04);
    for(const ank of [ankL,ankR]){
      const heel=V(ank.x,0.05,ank.z);
      tube(heel.clone().add(V(0,0,-0.03)), heel.clone().add(V(0,0,0.17)), 0.088,0.070,6,P.plateDk,{capA:{hex:P.leather}});
    }
  }

  /* ---------- TORSO — matched breastplate over dark leather, rigid + upright. ---------- */
  stack([
    {y:L.hipY,   rx:0.155, rz:0.132, hex:P.leatherDk},
    {y:L.waistY, rx:0.168, rz:0.142, hex:P.leather},
    {y:L.ribY,   rx:0.178, rz:0.148, hex:P.plate},
    {y:L.chestY, rx:0.188, rz:0.140, hex:P.plateLt},
    {y:L.shldY,  rx:0.222, rz:0.148, hex:P.plate},
    {y:L.neckY,  rx:0.082, rz:0.078, hex:P.plateDk},
  ], 8, {capTop:{hex:P.plateDk, lift:0.006}});
  // rivet rows across the breastplate
  for(const [x,y] of [[-0.10,L.chestY],[0.10,L.chestY-0.02],[0.0,L.ribY+0.02],[-0.06,L.shldY-0.04],[0.08,L.shldY-0.06]]) quad(V(x-0.012,y,0.145),V(x+0.012,y,0.145),V(x+0.01,y-0.018,0.14),V(x-0.01,y-0.018,0.14),P.rivet,0.02);
  // torn sash in the warlord's colors, tied at the shoulder, hanging to the hip
  quad(V(0.05,L.shldY+0.02,0.10), V(0.14,L.shldY-0.01,0.06), V(0.10,L.hipY-0.02,-0.02), V(0.02,L.hipY+0.02,0.03), P.sash, 0.06);
  quad(V(0.07,L.hipY+0.02,-0.01), V(0.11,L.hipY-0.02,-0.03), V(0.09,L.hipY-0.12,-0.02), V(0.055,L.hipY-0.08,0.0), P.sashDk, 0.07); // frayed tip
  for(const s of [-1,1]) blob(s*L.shoulderX,L.shldY+0.02,0.0, 0.095,0.068,0.088,P.plateLt,6,3);

  /* ---------- HEAD — full closed helm, single narrow vision-slit, no face shown. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.jawY,   rx:0.084, rz:0.080, hex:P.plate},
      {y:L.jawY+0.09, rx:0.090, rz:0.086, hex:P.plateLt},
      {y:L.browY,  rx:0.082, rz:0.072, hex:P.plateDk},
      {y:L.crownY, rx:0.068, rz:0.062, hex:P.plateDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0,L.crownY+0.02,0.0), P.plateDk);
    // narrow vision-slit — a single dark line, no face
    quad(V(-0.055,L.browY-0.005,0.072),V(0.055,L.browY-0.005,0.072),V(0.050,L.browY-0.02,0.070),V(-0.050,L.browY-0.02,0.070), P.slit, 0.02);
    // closed jaw-plate, no mouth shown
    quad(V(-0.05,L.jawY,0.075),V(0.05,L.jawY,0.075),V(0.045,L.jawY-0.055,0.07),V(-0.045,L.jawY-0.055,0.07),P.plateDk,0.03);
    // rivet seam ring around the helm base
    for(let i=0;i<6;i++){ const a=ph+i/6*Math.PI*2; quad(V(Math.cos(a)*0.086,L.jawY+0.10,Math.sin(a)*0.082),V(Math.cos(a)*0.086+0.008,L.jawY+0.10,Math.sin(a)*0.082),V(Math.cos(a)*0.086+0.006,L.jawY+0.09,Math.sin(a)*0.078),V(Math.cos(a)*0.086-0.002,L.jawY+0.09,Math.sin(a)*0.078),P.rivet,0.02); }
  }

  /* ---------- ARMS — a short cleaver in one hand, a scrap-metal buckler shield in the other. ---------- */
  {
    const S=V(L.shoulderX,L.shldY-0.03,0.0), E=V(0.24,0.78,0.16), W=V(0.16,0.44,0.26);
    tube(S,E,0.075,0.058,6,P.leather);
    tube(E,W,0.058,0.045,6,P.plate,{capB:{hex:P.plateDk,lift:0.005}});
    const S2=V(-L.shoulderX,L.shldY-0.03,0.0), E2=V(-0.22,0.72,0.20), W2=V(-0.16,0.42,0.28);
    tube(S2,E2,0.075,0.058,6,P.leather);
    tube(E2,W2,0.058,0.045,6,P.plate,{capB:{hex:P.plateDk,lift:0.005}});

    // short cleaver held ready (right)
    const hB=V(0.15,0.42,0.28), hT=V(0.19,0.30,0.36);
    tube(hB,hT,0.022,0.017,5,P.haft);
    quad(V(0.15,0.32,0.36),V(0.30,0.26,0.38),V(0.28,0.12,0.42),V(0.16,0.18,0.40), P.blade, 0.05);
    quad(V(0.17,0.24,0.38),V(0.25,0.20,0.40),V(0.24,0.14,0.41),V(0.18,0.18,0.39), P.bladeDk, 0.05);

    // buckler shield strapped to the left forearm
    const shC=V(-0.17,0.42,0.30);
    const r1=ring(shC, V(0,0,1), 0.11, 0.11, 8, Math.PI/8);
    const r2=ring(V(shC.x,shC.y,shC.z-0.025), V(0,0,1), 0.105, 0.105, 8, Math.PI/8);
    stitch([r1,r2], ()=>P.shield);
    capFan(r1, V(shC.x,shC.y,shC.z+0.01), P.shieldDk);
  }

  /* ---------- base disc (Medium r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
