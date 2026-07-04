/* dev/model-qa/creatures/mon-axebeak.js — the AXE BEAK (bespoke BIRD, flightless ratite, Large monstrosity).
   The read: a round feathered body carried HIGH on two long strong scaly legs, a long upright neck,
   and a big heavy AXE-shaped beak (the signature) — drab brown-grey plumage, pale beak. NO eye quads
   (house ruling reversed 2026-07-04 — sockets are shape, not painted eyes). Whole-object grammar:
   one function, one merged geometry frame, no anchors, no part-object transforms. Base disc r=0.55. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildAxeBeak(){
  /* ---------- PALETTE (VS desaturated; drab brown-grey plumage, pale horn beak) ---------- */
  const P = {
    plumeA:0x746b58, plumeB:0x5e5747, plumeDk:0x4a4638, plumeLt:0x857c68, // mottled body feathers
    ruff:0x716a58,                                                       // neck ruff feathers
    leg:0x8a7d5e, legDk:0x685d44,                                        // scaly legs
    claw:0x2a251d,
    beak:0xc8bd9e, beakDk:0x9c9276, beakEdge:0x5e5a48,                   // pale heavy horn beak
    socket:0x1c1915,                                                     // dark eye socket recess
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — spine roughly vertical-ish, body high on legs, long neck rising. ---------- */
  const hipY = 0.62;                              // hip height (long legs beneath)
  const S = {
    tailBase: V(0, 0.86, -0.20),
    rump:     V(0, 0.94, -0.08),
    back:     V(0, 0.98,  0.06),
    chest:    V(0, 0.92,  0.20),
    neckBase: V(0, 1.02,  0.16),
    neckMid:  V(0, 1.22,  0.10),
    neckTop:  V(0, 1.38,  0.06),
    headB:    V(0, 1.44,  0.10),
  };

  /* ---------- BODY — a round feathered barrel, egg-shaped, held above the hips. ---------- */
  tube(S.tailBase, S.rump,  0.20, 0.255, 9, P.plumeDk, {phase:Math.PI/9, capA:{hex:P.plumeDk, lift:0.02}});
  tube(S.rump,     S.back,  0.255, 0.260, 9, P.plumeA, {phase:Math.PI/9});
  tube(S.back,     S.chest, 0.260, 0.220, 9, P.plumeB, {phase:Math.PI/9});
  tube(S.chest,    S.neckBase, 0.220, 0.130, 9, P.plumeA, {phase:Math.PI/9});
  /* mottled flank patches — a couple of lighter feather-clump quads on the barrel */
  {
    quad(V(-0.24,0.90,-0.02), V(-0.10,0.92,-0.08), V(-0.12,0.78,-0.10), V(-0.26,0.78,-0.04), P.plumeLt, 0.06);
    quad(V(0.24,0.90,-0.02), V(0.10,0.92,-0.08), V(0.12,0.78,-0.10), V(0.26,0.78,-0.04), P.plumeLt, 0.06);
  }
  /* small stub tail — a fan of short feather quads at the rear */
  {
    const tb = V(0, 0.90, -0.22);
    for(const [dx,dy] of [[-0.10,0.06],[0,0.10],[0.10,0.06]]){
      quad(V(-0.02,0.86,-0.20), V(0.02,0.86,-0.20), V(dx+0.03,0.86+dy,-0.40), V(dx-0.03,0.86+dy,-0.40), P.plumeDk, 0.05);
    }
  }

  /* ---------- NECK — long, curving slightly forward, ringed with a ruffled feather collar. ---------- */
  tube(S.neckBase, S.neckMid, 0.130, 0.095, 8, P.ruff,   {phase:Math.PI/8});
  tube(S.neckMid,  S.neckTop, 0.095, 0.075, 8, P.plumeA, {phase:Math.PI/8});
  tube(S.neckTop,  S.headB,   0.075, 0.062, 8, P.plumeB, {phase:Math.PI/8});
  /* ruff collar — a ring of small upward feather tufts at the neck base */
  {
    const n=8, ph=Math.PI/n;
    const rc = ring(V(0,1.05,0.15), V(0,1,0), 0.155, 0.150, n, ph);
    for(let i=0;i<n;i++){
      const p = rc[i];
      const tip = V(p.x*1.25, p.y+0.09, p.z*1.25);
      quad(V(p.x*0.9,p.y-0.02,p.z*0.9), V(p.x*1.1,p.y-0.02,p.z*1.1), tip, tip, P.ruff, 0.06);
    }
  }

  /* ---------- HEAD + the signature AXE-shaped BEAK. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:1.40, cz:0.10, rx:0.075, rz:0.078, hex:P.plumeB},
      {y:1.47, cz:0.11, rx:0.082, rz:0.080, hex:P.plumeA},
      {y:1.53, cz:0.10, rx:0.066, rz:0.062, hex:P.plumeDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, 1.58, 0.10), P.plumeDk);

    /* dark eye socket recesses (shape only — NOT painted eye quads) */
    for(const s of [-1,1]){
      const cb = V(s*0.070, 1.475, 0.14);
      const ct = V(s*0.058, 1.475, 0.155);
      tube(cb, ct, 0.020, 0.006, 5, P.socket, {capB:{hex:P.socket, lift:0.002}});
    }

    /* AXE BEAK — heavy upper mandible flaring into a broad flat blade with a hooked tip;
       thinner lower mandible beneath. The blade fans out sideways like an axe-head. */
    const beakBaseU = V(0, 1.485, 0.17);
    const beakMidU  = V(0, 1.46,  0.34);
    const beakTipU  = V(0, 1.44,  0.46);
    tube(beakBaseU, beakMidU, 0.062, 0.052, 7, P.beak, {raz:0.052, rbz:0.040, phase:ph});
    /* the axe-blade flare — two big flat quads flaring out +x/-x from the mid-beak, tapering to the hook tip */
    {
      const bl = V(-0.135, 1.475, 0.36);   // left blade tip
      const br = V( 0.135, 1.475, 0.36);   // right blade tip
      const top = V(0, 1.505, 0.33);
      const bot = V(0, 1.435, 0.33);
      quad(top, br, beakTipU, beakMidU, P.beak, 0.05);
      quad(top, beakMidU, beakTipU, bl, P.beak, 0.05);
      quad(bot, beakMidU, beakTipU, br, P.beakDk, 0.05);
      quad(bot, bl, beakTipU, beakMidU, P.beakDk, 0.05);
      /* hooked downward tip past the blade */
      const hookTip = V(0, 1.375, 0.52);
      quad(beakTipU, br, hookTip, hookTip, P.beakEdge, 0.04);
      quad(beakTipU, bl, hookTip, hookTip, P.beakEdge, 0.04);
    }
    /* lower mandible — thinner, straighter, meeting under the upper beak */
    const lowBase = V(0, 1.435, 0.16);
    const lowTip  = V(0, 1.405, 0.40);
    tube(lowBase, lowTip, 0.048, 0.020, 6, P.beakDk, {raz:0.040, rbz:0.014, phase:ph, capB:{hex:P.beakEdge, lift:0.006}});
  }

  /* ---------- LEGS — long, strong, scaly ratite legs; thigh feathered near the body, then bare
     scaly shank down to a splayed 3-toe clawed foot. Wide stance for stability on the disc. ---------- */
  {
    const strongLeg=(hipX, footX, footZ)=>{
      const hip   = V(hipX, hipY+0.06, 0.02);
      const knee  = V(hipX*1.15, hipY-0.22, 0.10);
      const ankle = V(hipX*1.05, 0.30, footZ*0.4);
      const foot  = V(footX, 0.05, footZ);
      tube(hip, knee, 0.105, 0.070, 7, P.plumeDk, {capA:{hex:P.plumeDk, lift:0.02}});   // feathered thigh
      tube(knee, ankle, 0.068, 0.042, 7, P.leg);                                        // scaly shank
      tube(ankle, foot, 0.040, 0.028, 6, P.legDk, {capB:{hex:P.legDk, lift:0.006}});     // lower shank
      /* 3-toe splayed clawed foot */
      const side = Math.sign(foot.x||1);
      for(const [dx,dz] of [[side*0.075,0.05],[0,0.09],[-side*0.06,0.05]]){
        const cb = V(foot.x, 0.045, foot.z);
        const ct = V(foot.x+dx, 0.012, foot.z+dz);
        tube(cb, ct, 0.017, 0.006, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    strongLeg(-0.13, -0.20, 0.06);
    strongLeg( 0.13,  0.20, 0.06);
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
