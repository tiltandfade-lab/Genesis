/* dev/model-qa/creatures/mon-giantaxebeak.js — the GIANT AXE-BEAK (bespoke BIPED, Huge ratite).
   Same silhouette family as the axe-beak (flightless bird, long legs, long neck, big axe-beak
   bill) but HUGE and bulkier — a thick-bodied ostrich/cassowary-adjacent brute. Drab brown-grey
   mottled plumage, dark socket eyes (no eye quads), a heavy hooked axe-bill. Whole-object grammar:
   one function, one geometry frame, no anchors. Huge size: base disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildGiantAxeBeak(){
  /* ---------- PALETTE (VS desaturated; drab brown-grey mottled plumage) ---------- */
  const P = {
    plum:0x726a5a, plumDk:0x504a3d, plumLt:0x857d6c,           // drab brown-grey body plumage
    mottleA:0x5e5849, mottleB:0x776f5e,                         // dorsal mottle bands
    neck:0x736a58, neckDk:0x554f41,                             // paler sparse-feathered neck
    bill:0x453f36, billEdge:0x1a1712,                           // dark heavy axe-bill (horn)
    socket:0x14110d,                                            // dark eye socket recess
    leg:0x433d33, legDk:0x2e2a23, claw:0x1e1b16,                // scaled legs + talons
    disc:0x4a4038, discTop:0x585047,
  };
  setChannels({
    [P.plum]:'fur',[P.plumDk]:'fur',[P.plumLt]:'fur',[P.mottleA]:'fur',[P.mottleB]:'fur',
    [P.neck]:'fur',[P.neckDk]:'fur',
    [P.bill]:'bone',[P.billEdge]:'bone',
    [P.leg]:'scale',[P.legDk]:'scale',[P.claw]:'bone',
  });

  /* ---------- LANDMARKS — spine rises from a hunched rear to a tall upright neck; big+bulky. ---------- */
  const S = {
    tailBase: V(0, 0.86, -0.30),
    rump:     V(0, 0.92, -0.16),
    loin:     V(0, 0.98,  0.02),
    body:     V(0, 1.02,  0.16),
    shldr:    V(0, 1.00,  0.28),
    neckB:    V(0, 1.20,  0.30),
    neckM:    V(0, 1.52,  0.24),
    neckT:    V(0, 1.78,  0.16),
    headB:    V(0, 1.88,  0.14),
  };

  /* ---------- BODY — a big bulky ovoid torso loft, hunched forward, bulkier than a plain axe-beak. */
  tube(S.tailBase, S.rump,  0.30, 0.42, 10, P.plumDk, {phase:Math.PI/10, capA:{hex:P.plumDk, lift:0.02}});
  tube(S.rump,     S.loin,  0.42, 0.46, 10, P.plum,   {phase:Math.PI/10});
  tube(S.loin,     S.body,  0.46, 0.44, 10, P.mottleA,{phase:Math.PI/10});
  tube(S.body,     S.shldr, 0.44, 0.34, 10, P.plum,   {phase:Math.PI/10});
  /* dorsal mottle streaks along the back */
  {
    const seg=[[S.rump,S.loin],[S.loin,S.body],[S.body,S.shldr]];
    for(const [a,b] of seg){
      quad(V(-0.05,a.y+0.30,a.z), V(0.05,a.y+0.30,a.z), V(0.04,b.y+0.28,b.z), V(-0.04,b.y+0.28,b.z), P.mottleB, 0.05);
    }
  }
  /* pale-ish belly underside, low */
  quad(V(-0.24,0.66,-0.22), V(0.24,0.66,-0.22), V(0.20,0.72,0.24), V(-0.20,0.72,0.24), P.plumLt, 0.06);

  /* ---------- HAUNCH MASSES — thick thighs bulking the hips (bulkier than a normal axe-beak). ---------- */
  for(const s of [-1,1]){
    const hipTop = V(s*0.20, 0.94, -0.06);
    const hipBot = V(s*0.26, 0.62, -0.02);
    tube(hipTop, hipBot, 0.22, 0.16, 8, P.plum, {phase:Math.PI/8});
  }

  /* ---------- NECK — long, upright, sparser plumage; carries the big head high. ---------- */
  tube(S.shldr, S.neckB, 0.30, 0.20, 8, P.neck,   {phase:Math.PI/8});
  tube(S.neckB, S.neckM, 0.20, 0.145,8, P.neckDk, {phase:Math.PI/8});
  tube(S.neckM, S.neckT, 0.145,0.115,8, P.neck,   {phase:Math.PI/8});
  tube(S.neckT, S.headB, 0.115,0.100,8, P.neckDk, {phase:Math.PI/8});

  /* ---------- HEAD — blocky skull, dark socket recesses (no eye quads), heavy hooked AXE-BILL. */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y-0.03, cz:S.headB.z+0.02, rx:0.115, rz:0.130, hex:P.neckDk},
      {y:S.headB.y+0.10, cz:S.headB.z+0.04, rx:0.135, rz:0.150, hex:P.plum},
      {y:S.headB.y+0.20, cz:S.headB.z+0.02, rx:0.100, rz:0.115, hex:P.plumDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headB.y+0.26, S.headB.z), P.plumDk);

    /* dark socket recesses (shape, not painted quads) — small inset dark patches each side */
    for(const s of [-1,1]){
      quad(V(s*0.075,S.headB.y+0.10,S.headB.z+0.13), V(s*0.100,S.headB.y+0.10,S.headB.z+0.12),
           V(s*0.098,S.headB.y+0.05,S.headB.z+0.12), V(s*0.073,S.headB.y+0.05,S.headB.z+0.13), P.socket, 0.02);
    }

    /* HEAVY HOOKED AXE-BILL — thick wedge projecting forward, curving down to a hooked point. */
    const bB = V(0, S.headB.y+0.08, S.headB.z+0.14);
    const bM = V(0, S.headB.y+0.02, S.headB.z+0.34);
    const bT = V(0, S.headB.y-0.10, S.headB.z+0.46);
    tube(bB, bM, 0.100, 0.070, n, P.bill, {raz:0.075, rbz:0.050, phase:ph});
    tube(bM, bT, 0.070, 0.026, n, P.billEdge, {raz:0.050, rbz:0.020, phase:ph, capB:{hex:P.billEdge, lift:0.006}});
    /* the axe-flare — a flat bony crest fin along the top of the bill, the "axe" read */
    quad(V(0,S.headB.y+0.09,S.headB.z+0.16), V(0,S.headB.y+0.20,S.headB.z+0.20),
         V(0,S.headB.y+0.13,S.headB.z+0.36), V(0,S.headB.y+0.05,S.headB.z+0.32), P.billEdge, 0.04);
    /* hooked underside curve at the tip */
    quad(V(-0.02,S.headB.y-0.10,S.headB.z+0.44), V(0.02,S.headB.y-0.10,S.headB.z+0.44),
         V(0.012,S.headB.y-0.16,S.headB.z+0.50), V(-0.012,S.headB.y-0.16,S.headB.z+0.50), P.bill, 0.03);
  }

  /* ---------- LEGS — long, thick, scaled ratite legs planted wide; big three-toe talon feet. ---------- */
  {
    const legPair=(hipX)=>{
      const hip  = V(hipX, 0.60, -0.02);
      const knee = V(hipX*1.15, 0.34, 0.06);
      const ankle= V(hipX*1.05, 0.12, -0.02);
      const foot = V(hipX*1.05, 0.028, 0.06);
      tube(hip, knee,  0.150, 0.095, 8, P.leg,   {phase:Math.PI/8});
      tube(knee, ankle,0.095, 0.052, 8, P.legDk, {phase:Math.PI/8});
      tube(ankle, foot,0.052, 0.040, 6, P.legDk, {phase:Math.PI/6});
      /* three-toe splayed talon foot */
      const toes=[[-0.10,0.16],[0.0,0.20],[0.10,0.16]];
      for(const [dx,dz] of toes){
        const cb = V(foot.x, 0.030, foot.z);
        const ct = V(foot.x+dx, 0.004, foot.z+dz);
        tube(cb, ct, 0.024, 0.008, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
      }
    };
    legPair(-0.20);
    legPair( 0.20);
  }

  /* ---------- TAIL — a short bunched plume of stiff feather-tufts fanning back off the rump. ---------- */
  {
    const t0 = S.tailBase;
    for(const [dx,dy,dz] of [[-0.14,0.06,-0.20],[0,0.10,-0.24],[0.14,0.06,-0.20],[0,-0.02,-0.18]]){
      const tip = V(t0.x+dx, t0.y+dy, t0.z+dz);
      tube(t0, tip, 0.10, 0.02, 5, P.plumDk, {phase:Math.PI/5, capB:{hex:P.plumDk, lift:0.005}});
    }
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
