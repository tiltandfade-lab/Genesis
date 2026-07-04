/* dev/model-qa/creatures/mon-otyugh.js — the OTYUGH (bespoke ABERRATION, Large refuse-beast).
   CREATURE-MODELS-P2.md Wave 3: a squat bloated lumpy body on THREE stumpy legs, a huge fanged
   maw opening in the front of the body, and TWO long tentacles topped with leaf-like flaps plus a
   smaller eye-stalk rising above. Filth-brown warty hide (VS desaturated). Whole-object grammar:
   one function, one geometry frame, no anchors, no eye quads (dark socket recess only).
   Large size: base disc r=0.55, body kept within the disc footprint (rise in +y, not sprawl). */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildOtyugh(){
  /* ---------- PALETTE (VS desaturated — filth-brown, mottled warty hide) ---------- */
  const P = {
    hide:0x554630, hideDk:0x392e1e, hideLt:0x695840,        // filth-brown warty hide
    mottleA:0x473a26, mottleB:0x5f5038,                      // mottled body patches
    wart:0x2e2416,                                            // dark wart bumps
    maw:0x1c1410, tooth:0x7a7460, tongueGut:0x4a2418,        // maw interior / fangs / gut-red throat
    tentacle:0x4e4128, tentacleDk:0x362b1a,                  // tentacle stalks
    flap:0x5a4e34, flapDk:0x3c3220,                           // leaf-like flap
    eyeStalk:0x473a26, socket:0x120d08,                       // eye-stalk + dark socket recess
    claw:0x241d14,
    disc:0x453a2c, discTop:0x534532,
  };
  setChannels({ [P.hide]:'skin', [P.hideDk]:'skin', [P.hideLt]:'skin',
    [P.mottleA]:'skin', [P.mottleB]:'skin', [P.tooth]:'bone', [P.claw]:'bone' });

  /* ---------- LANDMARKS — squat bloated barrel centered near origin, low to the ground. ---------- */
  const bY = 0.30;                                   // body-center height (squat, low)
  const S = {
    rear:   V(0,      bY-0.02, -0.30),
    flankL: V(-0.24,  bY+0.02, -0.06),
    belly:  V(0,      bY+0.05,  0.06),
    flankR: V(0.24,   bY+0.02, -0.06),
    fore:   V(0,      bY-0.02,  0.30),
  };

  /* ---------- BODY — a bloated lumpy barrel loft, wider than tall, warty mottled hide. ---------- */
  {
    const n = 10, ph = Math.PI/n;
    const bands = [
      {y:bY-0.10, cz:-0.32, rx:0.235, rz:0.220, hex:P.hideDk},
      {y:bY+0.06, cz:-0.10, rx:0.320, rz:0.300, hex:P.hide},
      {y:bY+0.10, cz: 0.10, rx:0.345, rz:0.320, hex:P.mottleA},   // widest — bloated gut
      {y:bY+0.02, cz: 0.28, rx:0.275, rz:0.260, hex:P.hide},
      {y:bY-0.06, cz: 0.42, rx:0.170, rz:0.160, hex:P.hideDk},    // narrows toward the maw
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[0], V(0, bY-0.24, -0.40), P.hideDk, true);

    /* mottled dorsal patches + wart bumps scattered on the upper barrel */
    const warts = [[-0.16,bY+0.20,-0.12],[0.10,bY+0.22,0.02],[-0.06,bY+0.18,0.20],
                   [0.20,bY+0.14,-0.02],[-0.22,bY+0.10,0.10],[0.05,bY+0.24,-0.24]];
    for(const [wx,wy,wz] of warts){
      const base = V(wx,wy,wz);
      const tip  = V(wx*1.08, wy+0.045, wz*1.08);
      tube(base, tip, 0.032, 0.006, 5, P.wart, {capB:{hex:P.wart, lift:0.004}});
    }
  }

  /* ---------- MAW — a huge fanged opening in the FRONT of the body (+z face). ---------- */
  {
    const mC = V(0, bY-0.02, 0.44);
    const mw = 0.185, mh = 0.150;
    /* dark maw interior recess */
    quad(V(-mw,mC.y+mh,mC.z), V(mw,mC.y+mh,mC.z), V(mw*0.88,mC.y-mh,mC.z+0.05), V(-mw*0.88,mC.y-mh,mC.z+0.05), P.maw, 0.02);
    quad(V(-mw*0.6,mC.y-mh*0.4,mC.z+0.10), V(mw*0.6,mC.y-mh*0.4,mC.z+0.10),
         V(mw*0.5,mC.y-mh*0.9,mC.z+0.02), V(-mw*0.5,mC.y-mh*0.9,mC.z+0.02), P.tongueGut, 0.03);
    /* jaw rim lips top/bottom */
    quad(V(-mw*1.05,mC.y+mh*1.05,mC.z-0.02), V(mw*1.05,mC.y+mh*1.05,mC.z-0.02),
         V(mw,mC.y+mh,mC.z), V(-mw,mC.y+mh,mC.z), P.hideDk, 0.04);
    quad(V(-mw*0.9,mC.y-mh*1.1,mC.z-0.01), V(mw*0.9,mC.y-mh*1.1,mC.z-0.01),
         V(mw*0.88,mC.y-mh,mC.z+0.05), V(-mw*0.88,mC.y-mh,mC.z+0.05), P.hideDk, 0.04);
    /* fangs — a row of jagged teeth top + bottom around the rim */
    const toothRow = (yTop, count, upper) => {
      for(let i=0;i<count;i++){
        const t = (i+0.5)/count;
        const x = -mw*0.85 + t*mw*1.7;
        const rootY = yTop;
        const tipY  = upper ? yTop - 0.070 - 0.02*Math.abs(t-0.5) : yTop + 0.060 + 0.015*Math.abs(t-0.5);
        const rb = V(x, rootY, mC.z+0.03);
        const tp = V(x, tipY,  mC.z+0.045);
        tube(rb, tp, 0.020, 0.004, 4, P.tooth, {capB:{hex:P.tooth, lift:0.003}});
      }
    };
    toothRow(mC.y+mh*0.92, 6, true);
    toothRow(mC.y-mh*0.95, 5, false);
  }

  /* ---------- LEGS — THREE stumpy legs (tripod stance: two front-ish, one rear-center). ---------- */
  {
    const stumpLeg=(hipX, hipZ, footX, footZ)=>{
      const hip  = V(hipX, bY-0.14, hipZ);
      const knee = V(hipX*1.05, 0.16, hipZ*0.9 + (footZ-hipZ)*0.4);
      const foot = V(footX, 0.045, footZ);
      tube(hip, knee, 0.100, 0.085, 7, P.hide, {capA:{hex:P.hideDk}});
      tube(knee, foot, 0.085, 0.070, 7, P.mottleB, {capB:{hex:P.hideDk, lift:0.010}});
      /* short stubby toes/claws */
      for(const dx of [-0.05,0,0.05]){
        const cb = V(foot.x+dx, 0.045, foot.z+0.02);
        const ct = V(foot.x+dx*1.3, 0.010, foot.z+0.07);
        tube(cb, ct, 0.020, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    stumpLeg(-0.22, 0.20,  -0.30, 0.36);   // front-left
    stumpLeg( 0.22, 0.20,   0.30, 0.36);   // front-right
    stumpLeg( 0.00,-0.34,   0.00,-0.46);   // rear-center
  }

  /* ---------- TENTACLES — TWO long ones topped with leaf-like flaps, rising from the back. ---------- */
  {
    const growTentacle=(rootX, rootZ, lean)=>{
      const r0 = V(rootX, bY+0.14, rootZ);
      const r1 = V(rootX+lean*0.06, bY+0.34, rootZ-0.04);
      const r2 = V(rootX+lean*0.10, bY+0.56, rootZ-0.10);
      const r3 = V(rootX+lean*0.12, bY+0.76, rootZ-0.14);
      const tip= V(rootX+lean*0.13, bY+0.90, rootZ-0.16);
      tube(r0, r1, 0.075, 0.062, 7, P.tentacle,   {capA:{hex:P.tentacleDk}});
      tube(r1, r2, 0.062, 0.048, 7, P.tentacleDk, {});
      tube(r2, r3, 0.048, 0.034, 6, P.tentacle,   {});
      tube(r3, tip,0.034, 0.020, 6, P.tentacleDk, {capB:{hex:P.tentacleDk, lift:0.006}});
      /* leaf-like flap atop the tentacle: two broad tapering quads splayed from the tip */
      for(const s of [-1,1]){
        const base = tip.clone().add(V(0,-0.01,0));
        const mid  = V(tip.x + s*0.09, tip.y+0.05, tip.z - 0.02);
        const edge = V(tip.x + s*0.16, tip.y+0.02, tip.z + 0.05);
        const back = V(tip.x + s*0.06, tip.y-0.03, tip.z + 0.06);
        quad(base, mid, edge, back, s>0?P.flap:P.flapDk, 0.05);
      }
    };
    growTentacle(-0.14, -0.14, -1);
    growTentacle( 0.14, -0.14,  1);

    /* smaller EYE-STALK rising above/between the tentacles, ending in a dark socket recess. */
    {
      const e0 = V(0, bY+0.18, -0.06);
      const e1 = V(0.01, bY+0.42, -0.09);
      const e2 = V(0.02, bY+0.64, -0.11);
      const head= V(0.02, bY+0.74, -0.12);
      tube(e0, e1, 0.048, 0.038, 6, P.eyeStalk, {capA:{hex:P.tentacleDk}});
      tube(e1, e2, 0.038, 0.030, 6, P.eyeStalk, {});
      tube(e2, head,0.030, 0.030, 6, P.eyeStalk, {capB:{hex:P.eyeStalk, lift:0.018}});
      /* dark socket recess — a sunken dark quad, NOT a painted eye */
      const fwd = V(0,0,-1);
      const c = head.clone().add(V(0,0.006,-0.026));
      quad(c.clone().add(V(-0.018,0.014,0)), c.clone().add(V(0.018,0.014,0)),
           c.clone().add(V(0.014,-0.014,0.006)), c.clone().add(V(-0.014,-0.014,0.006)), P.socket, 0.02);
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
