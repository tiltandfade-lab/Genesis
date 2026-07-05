/* dev/model-qa/creatures/rlm-blightborn-roc.js — BLIGHTBORN ROC (ash realm, Gargantuan, CR 11).
   Read: a radiation-grown monstrous carrion bird — a colossal ratite-adjacent raptor silhouette
   (thick body, long powerful neck, hooked carrion beak) but hide-mottled with mutation-growth
   nodules, patchy irradiated plumage falling out in bald scar patches, oversized ragged wings
   spread wide, talons overgrown and cracked. Whole-object grammar: one function, one merged
   frame, no anchors. NO eye quads — dark socket recesses only. Gargantuan: base disc r=0.72. */
import { THREE, V, quad, tube, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';

export function buildBlightbornRoc(){
  /* ---------- PALETTE (VS-desaturated irradiated brown-grey plumage, mutation-growth sickly hues) - */
  const P = {
    plum:0x6e6656, plumDk:0x4c4638, plumLt:0x827a68,
    bald:0x8a7c62, baldDk:0x5e5344,             // bald irradiated scar-patches (feather loss)
    growth:0x7a8256, growthDk:0x525a38,          // sickly mutation nodules
    neck:0x6a6252, neckDk:0x4a4436,
    bill:0x3a352c, billEdge:0x171410,
    socket:0x120f0b,
    leg:0x3e3830, legDk:0x2a251f, claw:0x191510, clawCrack:0x6c3a20,
    wing:0x5c5546, wingDk:0x3e3930, wingLt:0x6e6656,
    disc:0x4a4438, discTop:0x585247,
  };
  setChannels({
    [P.plum]:'fur',[P.plumDk]:'fur',[P.plumLt]:'fur',[P.neck]:'fur',[P.neckDk]:'fur',
    [P.wing]:'fur',[P.wingDk]:'fur',[P.wingLt]:'fur',
    [P.bill]:'bone',[P.billEdge]:'bone',[P.leg]:'scale',[P.legDk]:'scale',[P.claw]:'bone',
  });

  /* ---------- LANDMARKS — colossal ratite-adjacent frame, long neck raised, spine ~1.3u tall ---------- */
  const S = {
    tailBase: V(0, 1.10, -0.44),
    rump:     V(0, 1.20, -0.20),
    loin:     V(0, 1.30,  0.04),
    body:     V(0, 1.36,  0.24),
    shldr:    V(0, 1.34,  0.42),
    neckB:    V(0, 1.58,  0.46),
    neckM:    V(0, 1.94,  0.38),
    neckT:    V(0, 2.24,  0.26),
    headB:    V(0, 2.36,  0.22),
  };

  /* ---------- BODY — big bulky ovoid torso, patchy irradiated plumage, bald scar patches. ---------- */
  tube(S.tailBase, S.rump,  0.40, 0.56, 10, P.plumDk, {phase:Math.PI/10, capA:{hex:P.plumDk, lift:0.02}});
  tube(S.rump,     S.loin,  0.56, 0.62, 10, P.plum,   {phase:Math.PI/10});
  tube(S.loin,     S.body,  0.62, 0.58, 10, P.growth, {phase:Math.PI/10});
  tube(S.body,     S.shldr, 0.58, 0.44, 10, P.plum,   {phase:Math.PI/10});
  /* bald irradiated scar-patches (feather loss) across the flank */
  for(const [y,z] of [[1.24,-0.02],[1.38,0.20]]){
    quad(V(-0.24,y,z), V(0.24,y,z), V(0.20,y+0.16,z+0.14), V(-0.20,y+0.16,z+0.14), P.bald, 0.07);
  }
  /* sickly mutation-growth nodules studding the back */
  for(const [x,y,z,r] of [[0.16,1.42,0.02,0.09],[-0.14,1.36,-0.14,0.07],[0.04,1.46,0.22,0.08]]){
    blob(x,y,z, r,r*0.85,r, P.growth, 6, 4);
    blob(x,y+r*0.4,z, r*0.4,r*0.4,r*0.4, P.growthDk, 5, 3);
  }
  /* pale-ish irradiated belly underside */
  quad(V(-0.32,0.86,-0.30), V(0.32,0.86,-0.30), V(0.28,0.94,0.32), V(-0.28,0.94,0.32), P.baldDk, 0.06);

  /* ---------- HAUNCH MASSES — thick thighs bulking the hips. ---------- */
  for(const s of [-1,1]){
    const hipTop = V(s*0.26, 1.18, -0.08);
    const hipBot = V(s*0.34, 0.78, -0.02);
    tube(hipTop, hipBot, 0.28, 0.20, 8, P.plum, {phase:Math.PI/8});
  }

  /* ---------- NECK — long, upright, patchy bald plumage, carries the head high. ---------- */
  tube(S.shldr, S.neckB, 0.38, 0.26, 8, P.neck,   {phase:Math.PI/8});
  tube(S.neckB, S.neckM, 0.26, 0.185,8, P.neckDk, {phase:Math.PI/8});
  tube(S.neckM, S.neckT, 0.185,0.148,8, P.neck,   {phase:Math.PI/8});
  tube(S.neckT, S.headB, 0.148,0.128,8, P.bald,   {phase:Math.PI/8});

  /* ---------- HEAD — blocky skull, dark socket recesses, heavy hooked carrion beak. ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:S.headB.y-0.04, cz:S.headB.z+0.02, rx:0.148, rz:0.166, hex:P.neckDk},
      {y:S.headB.y+0.13, cz:S.headB.z+0.05, rx:0.172, rz:0.192, hex:P.plum},
      {y:S.headB.y+0.26, cz:S.headB.z+0.02, rx:0.128, rz:0.146, hex:P.plumDk},
    ];
    const rings = bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, S.headB.y+0.33, S.headB.z), P.plumDk);
    /* dark socket recesses (no eye quads) */
    for(const s of [-1,1]){
      quad(V(s*0.096,S.headB.y+0.13,S.headB.z+0.17), V(s*0.128,S.headB.y+0.13,S.headB.z+0.15),
           V(s*0.125,S.headB.y+0.06,S.headB.z+0.15), V(s*0.093,S.headB.y+0.06,S.headB.z+0.17), P.socket, 0.02);
    }
    /* heavy hooked carrion beak, thick + curving sharply down */
    const bB = V(0, S.headB.y+0.10, S.headB.z+0.18);
    const bM = V(0, S.headB.y+0.00, S.headB.z+0.46);
    const bT = V(0, S.headB.y-0.18, S.headB.z+0.62);
    tube(bB, bM, 0.128, 0.088, n, P.bill, {raz:0.096, rbz:0.062, phase:ph});
    tube(bM, bT, 0.088, 0.030, n, P.billEdge, {raz:0.062, rbz:0.022, phase:ph, capB:{hex:P.billEdge, lift:0.006}});
    /* hooked underside curve at the tip */
    quad(V(-0.024,S.headB.y-0.18,S.headB.z+0.58), V(0.024,S.headB.y-0.18,S.headB.z+0.58),
         V(0.014,S.headB.y-0.26,S.headB.z+0.66), V(-0.014,S.headB.y-0.26,S.headB.z+0.66), P.bill, 0.03);
  }

  /* ---------- WINGS — oversized, ragged, spread wide (the Gargantuan flying silhouette). ---------- */
  {
    const wing=(sx)=>{
      const root = V(sx*0.30, 1.42, 0.24);
      const elbow= V(sx*0.90, 1.30, 0.06);
      const wtip = V(sx*1.62, 0.94, -0.20);
      tube(root, elbow, 0.180, 0.120, 7, P.wing, {phase:Math.PI/7});
      tube(elbow, wtip, 0.120, 0.040, 7, P.wingDk, {phase:Math.PI/7, capB:{hex:P.wingDk, lift:0.01}});
      /* ragged trailing feather fan off the wing */
      for(let i=0;i<5;i++){
        const t = i/4;
        const base = root.clone().lerp(wtip, 0.35+t*0.6);
        const tip  = base.clone().add(V(sx*(0.18+t*0.10), -0.22-t*0.10, -0.10-t*0.06));
        tube(base, tip, 0.05-t*0.02, 0.012, 5, i%2?P.wingLt:P.wingDk, {capB:{hex:P.wingDk, lift:0.006}});
      }
      /* bald patch of missing feathers mid-wing (irradiated) */
      quad(elbow.clone().add(V(sx*-0.06,0.10,0.04)), elbow.clone().add(V(sx*0.10,0.10,0.02)),
           elbow.clone().add(V(sx*0.08,-0.06,0.0)), elbow.clone().add(V(sx*-0.08,-0.06,0.02)), P.bald, 0.06);
    };
    wing(1); wing(-1);
  }

  /* ---------- LEGS — thick scaled legs, overgrown cracked talons planted for a ground stance. ---------- */
  {
    const legPair=(hipX)=>{
      const hip  = V(hipX, 0.76, -0.02);
      const knee = V(hipX*1.15, 0.42, 0.08);
      const ankle= V(hipX*1.05, 0.16, -0.02);
      const foot = V(hipX*1.05, 0.032, 0.08);
      tube(hip, knee,  0.195, 0.125, 8, P.leg,   {phase:Math.PI/8});
      tube(knee, ankle,0.125, 0.068, 8, P.legDk, {phase:Math.PI/8});
      tube(ankle, foot,0.068, 0.052, 6, P.legDk, {phase:Math.PI/6});
      /* three-toe splayed, overgrown cracked talons */
      const toes=[[-0.13,0.20],[0.0,0.26],[0.13,0.20]];
      for(const [dx,dz] of toes){
        const cb = V(foot.x, 0.036, foot.z);
        const ct = V(foot.x+dx, 0.004, foot.z+dz);
        tube(cb, ct, 0.032, 0.010, 4, P.claw, {capB:{hex:P.clawCrack, lift:0.004}});
      }
    };
    legPair(-0.26);
    legPair( 0.26);
  }

  /* ---------- TAIL — a bunched fan of ragged mutation-mottled feathers off the rump. ---------- */
  {
    const t0 = S.tailBase;
    for(const [dx,dy,dz] of [[-0.20,0.08,-0.28],[0,0.14,-0.34],[0.20,0.08,-0.28],[0,-0.03,-0.24]]){
      const tip = V(t0.x+dx, t0.y+dy, t0.z+dz);
      tube(t0, tip, 0.14, 0.028, 5, P.plumDk, {phase:Math.PI/5, capB:{hex:P.growthDk, lift:0.005}});
    }
  }

  /* ---------- base disc (Gargantuan: r=0.72) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.72, 0.72, 22);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.70, 0.70, 22);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.061,0), P.discTop);
  }
}
