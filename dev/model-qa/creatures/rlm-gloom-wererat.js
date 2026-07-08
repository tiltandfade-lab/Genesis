/* dev/model-qa/creatures/rlm-gloom-wererat.js — the WERERAT hybrid (whole-object grammar), authored
   under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot). Medium, CR 2-4,
   realm gloom. Two riding flavors, one chassis: a freshly bitten victim terrified of itself, or the
   sewer relic-fixer who bites debtors (data/realm-bestiary.js "Marrow-Bound Wererat Broker"). Core
   identity per the brief: hybrid rat-man — a HUMANOID torso on DIGITIGRADE rat legs (ANATOMY-CANON
   QUADRUPED-DIGITIGRADE hind-leg Z-zigzag math, ported to a biped stance), topped with a rat skull,
   trailing a naked pink tail.

   FEATURE CHECKLIST (the ~1.1-1.5k budget buys):
     1. HUMANOID torso — a hunched man's ribcage/shoulders under a ragged shirt, narrow waist, the
        "was human" read that keeps this a HYBRID and not a giant rat.
     2. Rat skull head — a wedge cranium tapering to a long pointed snout, whiskers, two long
        curved incisors, small round ears — the ANATOMY-CANON rodent-skull tell.
     3. DIGITIGRADE rat legs — the money structure: hip->thigh(down-fwd)->stifle->shank(down-back)
        ->HIGH hock->near-vertical metatarsal->clawed toes. Reverse-jointed, standing on the toes.
     4. Naked pink-grey tail — long, hairless, segmented rings, whip-curled low behind for balance.
     5. SIGNATURE — one very human LEFT hand clutching its own rat muzzle in horror (5 human
        fingers, no claws), against a clawed, splayed RIGHT hand — the freshly-cursed asymmetry the
        brief calls for. This is the loud exaggerated feature (law 4): correctness (rat legs/skull)
        PLUS the one human hand that breaks the animal read.
     6. Pale high-value zones on the muzzle/tail/hands (law 3) against a dark grimy fur/shirt body.

   POSE SENTENCE: cornered in a half-crouch, weight sunk low and back as if against a wall, the human
   left hand clamped over its own rat mouth in horror while the right hand claws out splayed toward
   whatever cornered it — caught mid-recoil, never at attention.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w1'], cell 6, PORT 5206). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildWererat(){
  /* ---------- PALETTE (VS desaturated; grimy fur/shirt body, pale muzzle/hands/tail as the
     high-value signature zones per law 3) ---------- */
  const P = {
    fur:0x534a3c, furDk:0x362f26, furLt:0x6d6250,           // grimy fur across shoulders/neck/head
    shirt:0x463c30, shirtDk:0x2e2820, shirtLt:0x59503f,     // ragged human shirt over the torso
    skin:0xc9a583, skinDk:0x9c7c5c,                          // the ONE human hand — pale against fur
    muzzle:0xb8a68c, muzzleDk:0x8c7a62,                      // pale rat snout (high-value zone)
    mouth:0x1c1712, tooth:0xe4dcc0,
    ear:0x4a4032, earIn:0x6a5748,
    eye:0x120e0a, eyeGlow:0xc23a2a,                          // small feral red eye glints
    tail:0xb08e82, tailDk:0x7a5f56,                          // naked pink-grey tail (high-value)
    claw:0x1a1610, nail:0xd8cca8,
    disc0:0x453b30, discTop:0x554839,
  };

  /* ---------- LANDMARKS — a low CORNERED crouch: hips sunk, torso pitched back and down, weight on
     the haunches. Digitigrade legs mean the hock sits high off the disc. ---------- */
  const L = {
    hipY:0.51, waistY:0.66, ribY:0.78, chestY:0.90, shldY:1.00, neckY:1.05,
    hipHalf:0.135, shoulderX:0.220,
    headMidY:1.09,
  };

  /* recoil lean: pitched back-and-down about the hips (cowering away from whatever cornered it).
     R2 CRITIC FIX: hipY sunk (0.56->0.51) + angle deepened (-0.34->-0.44) so the crouch reads as
     "sunk low and back" instead of a near-upright stance (pose law failure on the R1 render). */
  const recoil = (p)=>{
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(1,0,0), -0.44);
    return q.add(V(0, L.hipY - 0.03, 0));
  };

  /* ---------- TORSO — hunched human ribcage under a ragged shirt. Narrower than the werewolf (this
     is a man's frame, not a monster's), V-taper waist to shoulders. ---------- */
  const torsoRings = stack([
    {y:L.hipY,   rx:0.150, rz:0.130, hex:P.shirtDk},
    {y:L.waistY, rx:0.140, rz:0.120, hex:P.shirt},
    {y:L.ribY,   rx:0.172, rz:0.140, hex:P.shirtLt},
    {y:L.chestY, rx:0.190, rz:0.150, hex:P.shirt},
    {y:L.shldY,  rx:0.205, rz:0.150, hex:P.fur},              // fur takes over at the shoulders/neck
    {y:L.neckY,  rx:0.115, rz:0.105, hex:P.furDk},
  ], 8, {xform:recoil, capTop:{hex:P.furDk, lift:0.006}});

  /* torn shirt hem flaps at the waist — a couple of ragged points, cheap silhouette break */
  for(const [ang,len] of [[-2.2,0.14],[-0.6,0.18],[0.9,0.12],[2.4,0.16]]){
    const r=0.148, bx=Math.cos(ang)*r, bz=Math.sin(ang)*r*0.9;
    const top=recoil(V(bx, L.hipY-0.02, bz));
    const tip=recoil(V(bx*1.05, L.hipY-0.02-len, bz*1.05));
    quad(top.clone().add(V(-0.03,0,0)), top.clone().add(V(0.03,0,0)), tip, tip, P.shirtDk, 0.06);
  }

  /* ---------- RAT SKULL HEAD — wedge cranium into a long pointed snout, level-forward on the
     recoiled neck (chin tucked, cowering, not held high). ---------- */
  {
    const n=8, ph=Math.PI/n;
    const HY = L.headMidY, HZ = 0.06;
    const bands=[
      {y:HY-0.05, cz:HZ,      rx:0.098, rz:0.100, hex:P.fur},
      {y:HY+0.02, cz:HZ+0.01, rx:0.112, rz:0.108, hex:P.furLt},
      {y:HY+0.08, cz:HZ-0.02, rx:0.092, rz:0.086, hex:P.furDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph)).map(r=>r.map(recoil));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), recoil(V(0,HY+0.13,HZ-0.03)), P.furDk);

    /* long pointed snout — pale (the muzzle high-value zone, law 3) */
    const snB=recoil(V(0,HY-0.04,HZ+0.09)), snM=recoil(V(0,HY-0.06,HZ+0.22)), snT=recoil(V(0,HY-0.075,HZ+0.34));
    tube(snB, snM, 0.078, 0.056, n, P.muzzle, {raz:0.082, rbz:0.058, phase:ph});
    tube(snM, snT, 0.056, 0.020, n, P.muzzleDk, {raz:0.058, rbz:0.022, phase:ph, capB:{hex:P.mouth, lift:0.006}});
    /* nose tip */
    quad(recoil(V(-0.010,HY-0.075,HZ+0.335)), recoil(V(0.010,HY-0.075,HZ+0.335)),
         recoil(V(0.007,HY-0.062,HZ+0.325)), recoil(V(-0.007,HY-0.062,HZ+0.325)), P.mouth, 0.02);

    /* jaw slit + two long curved incisors */
    quad(recoil(V(-0.045,HY-0.095,HZ+0.10)), recoil(V(0.045,HY-0.095,HZ+0.10)),
         recoil(V(0.026,HY-0.11,HZ+0.24)), recoil(V(-0.026,HY-0.11,HZ+0.24)), P.mouth, 0.03);
    for(const s of [-1,1]){
      const ib=recoil(V(s*0.020,HY-0.10,HZ+0.14)), it=recoil(V(s*0.026,HY-0.045,HZ+0.155));
      tube(ib, it, 0.011, 0.003, 4, P.tooth, {capB:{hex:P.tooth, lift:0.003}});
    }

    /* small round ears, wide-set */
    for(const s of [-1,1]){
      const eb=recoil(V(s*0.075,HY+0.10,HZ-0.02)), et=recoil(V(s*0.115,HY+0.19,HZ-0.05));
      tube(eb, et, 0.042, 0.006, 6, P.ear, {raz:0.036, rbz:0.005, capB:{hex:P.ear, lift:0.006}});
      const inB=recoil(V(s*0.072,HY+0.115,HZ-0.012)), inT=recoil(V(s*0.104,HY+0.185,HZ-0.038));
      quad(inB.clone().add(V(-0.01,0,0)), inB.clone().add(V(0.01,0,0)), inT, inT, P.earIn, 0.03);
    }

    /* small feral eyes — dark socket + a red glint (value contrast on a mostly dark skull) */
    for(const s of [-1,1]){
      const ec=recoil(V(s*0.068, HY+0.045, HZ+0.075));
      blob(ec.x, ec.y, ec.z, 0.020, 0.020, 0.016, P.eye, 5, 3);
      const gl=recoil(V(s*0.070, HY+0.047, HZ+0.088));
      blob(gl.x, gl.y, gl.z, 0.008, 0.008, 0.006, P.eyeGlow, 4, 2);
    }

    /* whiskers — thin ticks off the snout */
    for(const s of [-1,1]) for(let i=0;i<2;i++){
      const wb=recoil(V(s*0.03,HY-0.03-i*0.015,HZ+0.22));
      const wt=recoil(V(s*0.13,HY-0.02-i*0.02,HZ+0.24+i*0.03));
      tube(wb,wt,0.004,0.001,3,P.furLt);
    }
  }

  /* ---------- ARMS — the SIGNATURE asymmetry. LEFT (human, s=-1): a pale human hand clamped over
     its own muzzle in horror, 5 countable fingers, no claws. RIGHT (s=1): clawed and splayed,
     lashing out toward whatever cornered it. ---------- */
  {
    /* LEFT — human hand clutching the muzzle. R1 CRITIC FIX: the elbow/wrist targets were authored
       in raw (un-recoiled) world space while the head geometry is built through recoil() — the two
       landed in different frames, so the hand read as reaching out into empty space instead of
       touching the snout. Elbow/wrist are now tucked CLOSE and derived in the SAME recoiled frame
       the head landmarks use (snout mid ~= recoil(0,HY-0.06,HZ+0.22)), so the palm presses directly
       against the muzzle by construction. */
    const S = recoil(V(-L.shoulderX, L.shldY-0.02, 0.02));
    const E = recoil(V(-0.145, 0.98, 0.14));                  // elbow tucked close to the ribs
    const W = recoil(V(-0.045, 1.05, 0.19));                  // wrist right at the snout's near cheek
    tube(S, E, 0.058, 0.048, 6, P.fur);                       // furred upper arm
    tube(E, W, 0.044, 0.034, 6, P.skinDk);                    // forearm bares to human skin
    /* palm block pressed flat against the muzzle side. R2 CRITIC FIX: palm pushed further out to
       -x (-0.015->-0.065) so it pokes clear of the muzzle's own rx(~0.078) profile instead of being
       swallowed inside the snout's silhouette — the hand needs its own readable bump (law 2). */
    const palmC = recoil(V(-0.065, 1.055, 0.235));
    tube(W, palmC, 0.048, 0.046, 6, P.skin, {capA:{hex:P.skin}});
    /* 5 short human fingers WRAPPING the snout — spread over/around it so contact reads, no claws.
       R2 CRITIC FIX: bulked past the ~0.04u minimum feature floor (law 3) — was 0.011-0.014 radius,
       thin enough to dissolve at 1/3-res; the R1 render showed no visible fingers at all. */
    const fdirs=[[0.9,0.35,0.15],[0.6,0.55,0.55],[0.15,0.60,0.75],[-0.25,0.35,0.85],[0.55,-0.35,0.55]];
    for(const d of fdirs){
      const n=Math.hypot(d[0],d[1],d[2]);
      const dir=V(d[0]/n,d[1]/n,d[2]/n);
      const mid=palmC.clone().addScaledVector(dir,0.055);
      const tip=palmC.clone().addScaledVector(dir,0.095);
      tube(palmC, mid, 0.021, 0.017, 4, P.skin);
      tube(mid, tip, 0.017, 0.010, 4, P.skinDk, {capB:{hex:P.skinDk, lift:0.005}});
    }

    /* RIGHT — clawed, splayed, lashing OUT AND UP wide of the body so the silhouette breaks clearly.
       R2 CRITIC FIX: E2/W2 were authored in RAW world space while the shoulder is recoil()-pitched
       (the same frame-mismatch class already fixed on the left hand in R1) — the kink between a
       recoiled shoulder and an un-recoiled elbow/wrist produced the long straight diagonal spar that
       swallowed the whole right side of the R1 render. Now recoil()-consistent AND driven UP+OUT past
       the shoulder line so the claw breaks the silhouette above/beside the torso instead of drooping
       across it. Base tube brightened to P.muzzle (was furDk, same tone as the torso — invisible)
       so the second signature zone actually carries a high-value read (law 3). */
    const S2 = recoil(V(L.shoulderX, L.shldY-0.02, 0.02));
    const E2 = recoil(V(0.40, L.shldY+0.02, 0.14));
    const W2 = recoil(V(0.58, L.shldY+0.06, 0.22));
    tube(S2, E2, 0.058, 0.048, 6, P.fur);
    tube(E2, W2, 0.046, 0.036, 6, P.muzzle);
    const palmR = recoil(V(0.68, L.shldY+0.08, 0.26));
    tube(W2, palmR, 0.040, 0.038, 6, P.muzzle, {capA:{hex:P.muzzle}});
    const cdirs=[[0.55,0.45,0.55],[0.35,0.55,0.30],[0.10,0.55,0.10],[-0.20,0.40,0.25]];
    for(const d of cdirs){
      const n=Math.hypot(d[0],d[1],d[2]);
      const dir=V(d[0]/n,d[1]/n,d[2]/n);
      const mid=palmR.clone().addScaledVector(dir,0.075);
      const tip=palmR.clone().addScaledVector(dir,0.130);
      tube(palmR, mid, 0.018, 0.013, 4, P.muzzle);
      tube(mid, tip, 0.013, 0.005, 4, P.claw, {capB:{hex:P.claw, lift:0.004}});
    }
  }

  /* ---------- DIGITIGRADE RAT LEGS — the ANATOMY-CANON hind-leg Z-zigzag ported to a biped: thigh
     down-and-forward to the stifle, shank down-and-back to a HIGH hock, near-vertical metatarsal to
     clawed toes. Sunk low into the cornered crouch (hips low, knees driven forward). ---------- */
  {
    const leg=(hipX, s)=>{
      const hip   = recoil(V(hipX, L.hipY-0.02, 0.0));
      const stifle= V(hipX + s*0.03, 0.31, 0.16);              // R2: knee bent lower for the sunk crouch
      const hock  = V(hipX + s*0.015, 0.17, -0.06);            // HOCK swings back, held high
      const toe   = V(hipX + s*0.010, 0.045, 0.12);            // near-vertical metatarsal to the toes
      tube(hip, stifle, 0.078, 0.058, 6, P.fur);                // thigh
      tube(stifle, hock, 0.058, 0.040, 6, P.furDk);             // shank, down-and-back
      tube(hock, toe, 0.038, 0.030, 6, P.fur);                  // metatarsal, near-vertical
      /* clawed toes */
      const paw=V(toe.x, 0.03, toe.z+0.03);
      tube(toe, paw, 0.030, 0.026, 6, P.furDk, {capB:{hex:P.furDk, lift:0.004}});
      for(const cx of [-0.016,0,0.016]){
        tube(V(paw.x+cx,0.024,paw.z+0.02), V(paw.x+cx,0.006,paw.z+0.05), 0.007,0.002,3,P.claw,{capB:{hex:P.claw,lift:0.002}});
      }
    };
    leg(-L.hipHalf, -1);
    leg( L.hipHalf,  1);
  }

  /* ---------- NAKED TAIL — long, hairless, pale pink-grey, segmented rings, curled low behind for
     balance in the crouch (the signature per the brief, alongside the human hand). ---------- */
  {
    /* R2 CRITIC FIX: was a near-straight run from the recoiled root to raw-space points, reading as a
       long diagonal spar to the ground rather than "curled low behind" — pulled the reach in and
       curved the last two segments back UP so the tail actually hooks into a curl instead of lancing
       out flat. */
    const root = recoil(V(0.02, L.hipY+0.02, -0.14));
    const t1 = V(0.08, 0.28, -0.28), t2 = V(0.15, 0.14, -0.40), t3 = V(0.14, 0.10, -0.48), tip = V(0.06, 0.15, -0.50);
    tube(root, t1, 0.044, 0.032, 7, P.tail, {capA:{hex:P.tailDk}});
    tube(t1, t2, 0.032, 0.022, 7, P.tail);
    tube(t2, t3, 0.022, 0.013, 6, P.tailDk);
    tube(t3, tip, 0.013, 0.005, 6, P.tailDk, {capB:{hex:P.tailDk, lift:0.003}});
    /* a couple of ring-segment ticks, the naked-tail texture cue */
    for(const [a,b] of [[t1,t2],[t2,t3]]){
      const mid=a.clone().lerp(b,0.5);
      quad(mid.clone().add(V(-0.02,0.015,0)), mid.clone().add(V(0.02,0.015,0)),
           mid.clone().add(V(0.017,-0.015,0)), mid.clone().add(V(-0.017,-0.015,0)), P.tailDk, 0.05);
    }
  }

  /* ---------- base disc (Medium r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc0);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
