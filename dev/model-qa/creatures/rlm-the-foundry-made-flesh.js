/* dev/model-qa/creatures/rlm-the-foundry-made-flesh.js — THE FOUNDRY MADE FLESH (ash realm,
   Gargantuan biped, CR 16). Bespoke dressing on the iron-golem stat frame (no bespoke model exists
   yet): a massive (~2.4u) industrial mass where scorched factory machinery has fused WITH torn
   flesh and bone — riveted iron-plate torso sections bleeding raw sinew through the seams, a
   furnace-grate chest cavity glowing dull ember-orange through cracked plating, one arm a fused
   piston-ram, one arm ending in a giant crusher-claw, exposed bone-and-pipe ribs where the plating
   has torn away, a small fused skull-and-vent head sunk low between iron shoulder masses. Whole-
   object grammar, one merged frame, no anchors. NO eye quads — a dim vent-glow instead. VS-
   desaturated ash palette (rust iron, dead flesh grey, ember glow). Base disc r=0.72 (Gargantuan). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob, stack } from '../probe-lib.js';

export function buildTheFoundryMadeFlesh(){
  /* ---------- PALETTE (rust iron plate, dead fused flesh, dull ember glow) ---------- */
  const P = {
    iron:0x565349, ironDk:0x38362e, ironLt:0x6c6859,          // riveted iron plate
    rust:0x6b4a2e, rustDk:0x462f1c,                            // rust bloom on the plate
    flesh:0x6e5b52, fleshDk:0x453a34, fleshRaw:0x7a3d34,       // fused dead flesh + raw sinew
    bone:0x8a7f68, boneDk:0x5c5344,                            // exposed bone/pipe ribs
    pipe:0x4a4740, pipeDk:0x2e2c26,                             // rusted pipe/vent
    ember:0xb5601e, emberCore:0xe08a3a,                         // furnace-glow core
    seam:0x201e1a, disc:0x39352c, discTop:0x453f33,
  };

  /* ---------- LANDMARKS — a colossal fused mass, small head sunk low. ---------- */
  const L = {
    hipY:1.02, waistY:1.28, chestY:1.68, shldY:2.08,
    neckY:2.14, headY:2.32, headTopY:2.62,
    hipHalf:0.30, shoulderX:0.58,
  };

  /* helper: a plated segment with a torn-flesh seam gap instead of a clean joint */
  function segment(a, b, ra, rb, hex, opts = {}){
    const axis = new THREE.Vector3().subVectors(b, a).normalize();
    const gap = opts.gap ?? 0.035;
    const a2 = a.clone().addScaledVector(axis, gap);
    const b2 = b.clone().addScaledVector(axis, -gap);
    tube(a2, b2, ra, rb, 5, hex, {phase:Math.PI/5, raz:opts.raz??ra, rbz:opts.rbz??rb,
      capA:{hex:P.seam}, capB:{hex:opts.fleshCap?P.fleshRaw:P.seam, lift:0.012}});
  }

  /* ===== HIPS + PELVIS MASS ===== */
  stack([
    {y:L.hipY-0.08, rx:0.32, rz:0.26, hex:P.ironDk},
    {y:L.hipY+0.08, rx:0.34, rz:0.27, hex:P.iron},
  ], 5, {phase:Math.PI/5, capBot:{hex:P.rustDk, lift:0.01}});

  /* ===== TORSO — plated courses with a torn seam exposing raw fused flesh between them ===== */
  stack([
    {y:L.waistY+0.02, rx:0.30, rz:0.24, hex:P.ironDk},
    {y:L.chestY-0.16, rx:0.365,rz:0.285,hex:P.iron},
    {y:L.chestY+0.06, rx:0.40, rz:0.31, hex:P.ironLt},
    {y:L.shldY-0.08,  rx:0.38, rz:0.29, hex:P.iron},
  ], 5, {phase:Math.PI/5});
  /* torn seam band between chest and belly — raw sinew showing through */
  {
    const r=ring(V(0,L.chestY-0.19,0), V(0,1,0), 0.362,0.282, 5, Math.PI/5);
    const r2=ring(V(0,L.chestY-0.13,0), V(0,1,0), 0.362,0.282, 5, Math.PI/5);
    stitch([r,r2], ()=>P.fleshRaw);
  }

  /* ===== FURNACE-GRATE CHEST CAVITY — cracked plating with a dull ember-glow core visible within ===== */
  {
    const cz = 0.32, cy = L.chestY+0.02;
    quad(V(-0.20,cy+0.18,cz-0.06), V(0.20,cy+0.18,cz-0.06), V(0.16,cy-0.20,cz+0.02), V(-0.16,cy-0.20,cz+0.02), P.seam, 0.03);
    blob(0, cy-0.02, cz+0.02, 0.13, 0.15, 0.06, P.ember, 8, 5);
    blob(0, cy-0.02, cz+0.04, 0.07, 0.09, 0.04, P.emberCore, 6, 4);
    /* cracked grate bars across the glow */
    for(const gx of [-0.10,-0.03,0.04,0.11]){
      quad(V(gx,cy+0.15,cz+0.05), V(gx+0.02,cy+0.15,cz+0.05), V(gx+0.015,cy-0.16,cz+0.05), V(gx-0.005,cy-0.16,cz+0.05), P.pipeDk, 0.04);
    }
  }

  /* ===== EXPOSED BONE-AND-PIPE RIBS where the plating has torn away, on one flank ===== */
  {
    const sx = -1;
    for(let i=0;i<4;i++){
      const y0=L.waistY+0.10+i*0.13, cz0=0.10+i*0.02;
      tube(V(sx*0.30,y0,cz0-0.10), V(sx*0.36,y0+0.02,cz0+0.14), 0.028,0.020, 5, P.bone, {capB:{hex:P.boneDk, lift:0.006}});
    }
    quad(V(sx*0.24,L.waistY+0.02,0.02), V(sx*0.40,L.waistY+0.02,0.02), V(sx*0.38,L.chestY+0.10,0.10), V(sx*0.22,L.chestY+0.10,0.10), P.fleshDk, 0.06);
  }

  /* ===== SHOULDER MASSES — enormous fused iron-and-bone pauldrons flanking the small head ===== */
  for(const s of [-1,1]){
    const cx = s*L.shoulderX;
    stack([
      {y:L.shldY-0.16, rx:0.24, rz:0.25, cx:cx, hex:P.ironDk},
      {y:L.shldY+0.02, rx:0.27, rz:0.28, cx:cx, hex:P.iron},
      {y:L.shldY+0.18, rx:0.235,rz:0.24, cx:cx, hex:P.ironLt},
    ], 5, {phase:Math.PI/5, capTop:{hex:P.ironDk, lift:0.01}, capBot:{hex:P.rustDk}});
    /* rust bloom streak */
    quad(V(cx+s*0.22,L.shldY+0.16,0.08), V(cx+s*0.22,L.shldY+0.02,0.08), V(cx+s*0.12,L.shldY+0.16,0.20), V(cx+s*0.12,L.shldY+0.16,0.20), P.rust, 0.05);
  }

  /* ===== HEAD — small fused skull-and-vent, sunk low between the shoulders. Dim vent-glow, no eyes. ===== */
  {
    segment(V(0,L.shldY-0.14,0.01), V(0,L.neckY+0.05,0.02), 0.145,0.13, P.ironDk, {gap:0.03});
    const n=5, ph=Math.PI/5, cy=L.headY, cz=0.02;
    const bands=[
      {y:cy-0.13, rx:0.175, rz:0.180, hex:P.bone},
      {y:cy-0.01, rx:0.195, rz:0.190, hex:P.boneDk},
      {y:cy+0.11, rx:0.185, rz:0.170, hex:P.ironDk},
      {y:cy+0.22, rx:0.150, rz:0.140, hex:P.iron},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(0, L.headTopY, cz-0.01), P.ironDk);
    /* dim vent-glow where the eyes would be, deep-set */
    blob(-0.06, cy+0.03, cz+0.13, 0.03,0.025,0.02, P.ember, 5, 3);
    blob( 0.06, cy+0.03, cz+0.13, 0.03,0.025,0.02, P.ember, 5, 3);
    /* fused jaw grille */
    quad(V(-0.07,cy-0.13,cz+0.17), V(0.07,cy-0.13,cz+0.17), V(0.06,cy-0.18,cz+0.16), V(-0.06,cy-0.18,cz+0.16), P.pipeDk, 0.03);
    /* a small exhaust vent-pipe jutting from the crown */
    tube(V(0.05,cy+0.24,cz-0.04), V(0.09,cy+0.44,cz-0.08), 0.030,0.020, 5, P.pipe, {capB:{hex:P.emberCore, lift:0.008}});
  }

  /* ===== ARMS — LEFT: fused piston-ram; RIGHT: giant crusher-claw. Both heavy, hanging low. ===== */
  {
    /* LEFT — PISTON-RAM ARM */
    {
      const Sh = V(-(L.shoulderX-0.02), L.shldY-0.20, 0.02);
      const E  = V(-0.72, L.waistY+0.06, 0.08);
      const W  = V(-0.68, L.hipY-0.18, 0.14);
      segment(Sh, E, 0.165, 0.135, P.iron, {gap:0.05});
      segment(E, W, 0.135, 0.150, P.ironDk, {gap:0.05});
      /* the piston ram head — a blunt hydraulic cylinder capped in scorched iron */
      tube(W, V(W.x-0.02, W.y-0.28, W.z+0.10), 0.155, 0.10, 5, P.pipe, {capB:{hex:P.emberCore, lift:0.01}});
      quad(V(W.x-0.16,W.y-0.02,W.z+0.02), V(W.x+0.16,W.y-0.02,W.z+0.02), V(W.x+0.14,W.y-0.12,W.z+0.06), V(W.x-0.14,W.y-0.12,W.z+0.06), P.rust, 0.05);
    }
    /* RIGHT — CRUSHER-CLAW ARM */
    {
      const Sh = V(L.shoulderX-0.02, L.shldY-0.20, 0.02);
      const E  = V(0.72, L.waistY+0.06, 0.08);
      const W  = V(0.66, L.hipY-0.10, 0.16);
      segment(Sh, E, 0.165, 0.135, P.iron, {gap:0.05});
      segment(E, W, 0.135, 0.130, P.ironDk, {gap:0.05});
      /* two heavy crusher pincers */
      for(const s of [-1,1]){
        const pB = V(W.x+s*0.02, W.y-0.04, W.z+0.02);
        const pT = V(W.x+s*0.14, W.y-0.28, W.z+0.20);
        tube(pB, pT, 0.075, 0.03, 5, P.bone, {capB:{hex:P.boneDk, lift:0.008}});
      }
      quad(V(W.x-0.10,W.y+0.02,W.z), V(W.x+0.10,W.y+0.02,W.z), V(W.x+0.08,W.y-0.10,W.z+0.05), V(W.x-0.08,W.y-0.10,W.z+0.05), P.fleshRaw, 0.06);
    }
  }

  /* ===== LEGS — colossal squat pillar legs, plated with torn seams, heavy slab feet ===== */
  {
    const leg=(sign)=>{
      const hip = V(sign*L.hipHalf, L.hipY-0.12, 0.0);
      const knee= V(sign*(L.hipHalf+0.03), 0.62, 0.03);
      const ank = V(sign*(L.hipHalf+0.03), 0.20, 0.0);
      segment(hip, knee, 0.195, 0.165, P.ironDk, {gap:0.05});
      segment(knee, ank, 0.165, 0.145, P.iron, {gap:0.05});
      stack([
        {y:0.04, rx:0.185, rz:0.225, cx:ank.x, cz:ank.z+0.06, hex:P.ironDk},
        {y:0.15, rx:0.165, rz:0.195, cx:ank.x, cz:ank.z+0.03, hex:P.iron},
      ], 5, {phase:Math.PI/5, capBot:{hex:P.rustDk, lift:0.01}, capTop:{hex:P.ironDk}});
      /* torn flesh gap at the knee joint */
      const r=ring(V(knee.x,knee.y-0.03,knee.z), V(0,1,0), 0.16,0.16, 5, Math.PI/5);
      const r2=ring(V(knee.x,knee.y+0.03,knee.z), V(0,1,0), 0.155,0.155, 5, Math.PI/5);
      stitch([r,r2], ()=>P.fleshRaw);
    };
    leg(-1);
    leg( 1);
  }

  /* base disc — Gargantuan (r=0.72), rust-iron rim */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.065,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.068,0), P.discTop);
  }
}
