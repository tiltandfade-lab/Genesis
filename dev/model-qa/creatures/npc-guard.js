/* dev/model-qa/creatures/npc-guard.js — the town-watch guard (whole-object NPC, REBUILD 2026-07-08
   under docs/MODEL-FOUNDRY.md, foundry pilot rebuild-w3 cell 2). Core identity: municipal watch —
   must read lighter than a veteran fighter, more official than a bandit. Palette intent PRESERVED
   from the prior pass (drab undyed gambeson, worn steel, no house colors) but geometry rebuilt for
   the challenge pose and a tabard (the "official" tell a bandit wouldn't wear).

   FEATURE CHECKLIST (the ~1,100-1,700 budget buys):
     1. HUMANOID torso per ANATOMY-CANON — gambeson loft w/ quilt-stripe bands, torso torqued
        forward (band cz drift) so the whole spine leans into the challenge instead of standing flat.
     2. TABARD — a surcoat overlay (front+back panel, side-open) with a trim border and a small
        blazon patch at the chest: the "official watch" tell that reads as municipal, not brigand.
     3. SIGNATURE — the HALBERD: haft, axe-blade (flat crescent, high value), top spike, and a back
        fluke/hook, braced DIAGONALLY across the body in both hands — barring the way. This is the
        outline-changing feature (law 2): the bar of steel crossing the whole silhouette.
     4. KETTLE-BRIM HELM — wide flat brim ringing the head at brow height + a low dome crown
        (signature retained from the prior pass, geometry rebuilt clean).
     5. Pose legs — weight forward onto a braced front leg (bent knee, planted wide), back leg
        trailing straighter: the "holding the line" stance, not at-attention.
     6. Belt + plain boots — small municipal-watch utility beats (buckle, no house colors).

   POSE SENTENCE: caught in the instant of the challenge — weight rolled forward onto a braced
   front leg, chin up, both hands driving the halberd's haft diagonally across the body so the
   axe-blade bars the passage at chest height, an immovable line rather than a standing sentry.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w3'], cell 2, fn buildGuard). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';
import { humanoidRig, BASE_P, buildHead, buildBase } from '../parts.js';

export function buildGuard(){
  /* ---------- PALETTE (drab municipal — undyed gambeson, worn steel, no house colors) ---------- */
  const P = Object.assign({}, BASE_P, {
    gambeson:0x8a7a54, gambesonDk:0x6b5d3f, stripe:0x796a49,
    tabard:0x8a3430, tabardDk:0x62211f, blazon:0xc4a94a,
    leather:0x4e3d2a, leatherDk:0x3a2d1f,
    steel:0x8f959a, steelDk:0x656b70, wood:0x5a4326, woodDk:0x3f2f1a,
    trouser:0x5b5244, boot:0x3c3226,
  });

  /* ---------- RIG — same landmarks as humanoid.js ---------- */
  const L = humanoidRig();
  const LEAN = 0.045; /* forward torso torque applied per band as y rises, weight-forward read */

  /* HALBERD FIRST — braced diagonally across the body, butt low-left near the hip, blade high-right
     near head height, held forward of the torso (barring the way). The shaft is ground truth; both
     resting fists derive from grip points along it. */
  const BUTT=V(-0.44,0.50,0.40), TIP=V(0.64,1.14,0.34);
  const SDIR=new THREE.Vector3().subVectors(TIP,BUTT).normalize();
  const GRIP_FRONT=BUTT.clone().addScaledVector(SDIR,0.86);   /* right hand, high, near the blade */
  const GRIP_BACK =BUTT.clone().addScaledVector(SDIR,0.32);   /* left hand, low, leverage */
  {
    const headBase=TIP.clone().addScaledVector(SDIR,-0.22);
    tube(BUTT, headBase, 0.026,0.022,6,P.wood,{capA:{hex:P.woodDk}});
    const up=V(0,0,1), su=new THREE.Vector3().crossVectors(up,SDIR).normalize(), sv=new THREE.Vector3().crossVectors(SDIR,su).normalize();

    /* top spike: tapering blade to a point, straight off the haft's axis */
    const bl=(t,w,th)=>{ const c=headBase.clone().addScaledVector(SDIR,t);
      return [c.clone().addScaledVector(su,w), c.clone().addScaledVector(sv,th), c.clone().addScaledVector(su,-w), c.clone().addScaledVector(sv,-th)]; };
    const s0=bl(0.0,0.024,0.018), s1=bl(0.06,0.032,0.020), s2=bl(0.14,0.018,0.010), s3=bl(0.19,0.007,0.005);
    stitch([s0,s1,s2,s3], (b)=> b<2?P.steelDk:P.steel);
    capFan(s3, headBase.clone().addScaledVector(SDIR,0.24), P.steel);
    tube(headBase.clone().addScaledVector(SDIR,-0.02), headBase, 0.028,0.025,6,P.steelDk);

    /* AXE BLADE — a flat crescent off the su-negative side, high value (bright steel, the
       silhouette-changer). Built as a fan of quads from the haft out to a curved outer edge. */
    {
      const root=headBase.clone().addScaledVector(SDIR,0.02);
      const c0=root.clone().addScaledVector(su,-0.02);
      const c1=root.clone().addScaledVector(SDIR,0.04).addScaledVector(su,-0.15);
      const c2=root.clone().addScaledVector(SDIR,0.12).addScaledVector(su,-0.21);
      const c3=root.clone().addScaledVector(SDIR,0.19).addScaledVector(su,-0.16);
      const c4=root.clone().addScaledVector(SDIR,0.20).addScaledVector(su,-0.03);
      const thick=sv.clone().multiplyScalar(0.010);
      const fF=[c0.clone().add(thick), c1.clone().add(thick), c2.clone().add(thick), c3.clone().add(thick), c4.clone().add(thick)];
      const fB=[c0.clone().sub(thick), c1.clone().sub(thick), c2.clone().sub(thick), c3.clone().sub(thick), c4.clone().sub(thick)];
      quad(fF[0],fF[1],fF[2],fF[3], P.steel, 0.05);
      quad(fF[0],fF[3],fF[4],fF[4], P.steel, 0.05);
      quad(fB[1],fB[0],fB[3],fB[2], P.steelDk, 0.05);
      quad(fB[3],fB[0],fB[4],fB[4], P.steelDk, 0.05);
      /* thin edge band so the blade reads with volume from the side */
      quad(fF[0],fF[1],fB[1],fB[0], P.steelDk, 0.03);
      quad(fF[1],fF[2],fB[2],fB[1], P.steel, 0.03);
      quad(fF[2],fF[3],fB[3],fB[2], P.steel, 0.03);
      quad(fF[3],fF[4],fB[4],fB[3], P.steelDk, 0.03);
    }

    /* BACK FLUKE — a small backward-curving hook opposite the axe, the halberd's third tell */
    {
      const root=headBase.clone().addScaledVector(SDIR,0.03);
      const h0=root.clone().addScaledVector(su,0.02);
      const h1=root.clone().addScaledVector(SDIR,-0.03).addScaledVector(su,0.10);
      const h2=root.clone().addScaledVector(SDIR,-0.02).addScaledVector(su,0.15);
      quad(h0.clone().add(sv.clone().multiplyScalar(0.008)), h1.clone().add(sv.clone().multiplyScalar(0.008)), h2, h2, P.steelDk, 0.05);
      quad(h1.clone().sub(sv.clone().multiplyScalar(0.008)), h0.clone().sub(sv.clone().multiplyScalar(0.008)), h2, h2, P.steel, 0.05);
    }
  }

  /* torso — quilted gambeson loft, forward-torqued (cz grows with y = leaning into the challenge) */
  stack([
    {y:L.hipY,   rx:0.205, rz:0.155, cz:0.00,        hex:P.gambesonDk},
    {y:L.waistY, rx:0.178, rz:0.132, cz:LEAN*0.3,    hex:P.gambeson},
    {y:0.855,    rx:0.198, rz:0.148, cz:LEAN*0.5,    hex:P.stripe},
    {y:L.ribY,   rx:0.208, rz:0.155, cz:LEAN*0.65,   hex:P.gambeson},
    {y:0.965,    rx:0.222, rz:0.162, cz:LEAN*0.8,    hex:P.stripe},
    {y:L.chestY, rx:0.232, rz:0.168, cz:LEAN*0.95,   hex:P.gambeson},
    {y:1.055,    rx:0.236, rz:0.158, cz:LEAN*1.05,   hex:P.stripe},
    {y:L.shldY,  rx:0.236, rz:0.155, cz:LEAN*1.1,    hex:P.gambeson},
    {y:L.neckY,  rx:0.085, rz:0.080, cz:LEAN*1.15,   hex:P.skinDk},
  ], 8, {capTop:{hex:P.skinDk, lift:0.005}});

  /* TABARD — a surcoat overlay: front + back rectangular panels, side-open, trim border + a small
     blazon patch at the chest. The "official watch" read a bandit wouldn't have. */
  {
    const cz0=LEAN*0.95, hw=0.175, y0=0.60, y1=L.shldY-0.02;
    const fz=0.178+cz0, bz=-0.165+cz0;
    /* front panel */
    quad(V(-hw,y0,fz), V(hw,y0,fz), V(hw,y1,fz), V(-hw,y1,fz), P.tabard, 0.05);
    quad(V(-hw,y0,fz-0.006), V(-hw,y1,fz-0.006), V(hw,y1,fz-0.006), V(hw,y0,fz-0.006), P.tabardDk, 0.05);
    /* back panel */
    quad(V(hw,y0,bz), V(-hw,y0,bz), V(-hw,y1,bz), V(hw,y1,bz), P.tabard, 0.05);
    /* side trim edges */
    quad(V(-hw,y0,fz), V(-hw,y1,fz), V(-hw,y1,bz), V(-hw,y0,bz), P.tabardDk, 0.03);
    quad(V(hw,y1,fz), V(hw,y0,fz), V(hw,y0,bz), V(hw,y1,bz), P.tabardDk, 0.03);
    /* hem trim (bright, ground-level value beat) */
    quad(V(-hw,y0,fz), V(hw,y0,fz), V(hw,y0-0.03,fz-0.01), V(-hw,y0-0.03,fz-0.01), P.blazon, 0.04);
    /* blazon patch — a small bright diamond at the chest */
    const bcz=fz+0.003, by=0.86+cz0*0;
    quad(V(0,by+0.05,bcz), V(0.045,by,bcz), V(0,by-0.05,bcz), V(-0.045,by,bcz), P.blazon, 0.06);
  }

  /* skirt of the gambeson (short, quilted, plain hem) — follows the same lean as the torso base */
  stack([
    {y:0.50, rx:0.230, rz:0.180, cz:-0.01, hex:P.gambesonDk},
    {y:0.62, rx:0.215, rz:0.165, cz:0.00,  hex:P.stripe},
    {y:L.hipY-0.01, rx:0.195, rz:0.148, cz:0.00, hex:P.gambeson},
  ], 8, {});

  /* wide leather belt with a plain iron buckle */
  stack([
    {y:0.775, rx:0.188, rz:0.148, hex:P.leather},
    {y:0.835, rx:0.185, rz:0.145, hex:P.leatherDk},
  ], 8, {});
  quad(V(-0.030,0.782,0.152), V(0.030,0.782,0.152), V(0.030,0.828,0.148), V(-0.030,0.828,0.148), P.steelDk, 0.02);

  /* head — shared module, chin lifted slightly (the "head up" pose beat) */
  buildHead(L, P, {xform:(p)=>{
    const t = Math.max(0, (p.y - L.jawY) / (L.headTopY - L.jawY));
    return V(p.x, p.y + t*0.018, p.z + LEAN*1.15 + t*0.02);
  }});

  /* KETTLE-BRIM HELM — a wide flat brim ringing the whole head at brow height + a low dome crown. */
  {
    const n=10, ph=Math.PI/n, hcz=LEAN*1.15+0.02;
    const brimOuter=ring(V(0,L.browY+0.02,hcz), V(0,1,0), 0.205, 0.195, n, ph);
    const brimInner=ring(V(0,L.browY+0.02,hcz), V(0,1,0), 0.118, 0.112, n, ph);
    stitch([brimInner,brimOuter], ()=>P.steel);
    stitch([brimOuter,brimInner], ()=>P.steelDk);
    const domeBands=[
      {y:L.browY+0.015, rx:0.116, rz:0.110, hex:P.steelDk},
      {y:L.browY+0.06,  rx:0.122, rz:0.116, hex:P.steel},
      {y:L.crownY+0.03, rx:0.104, rz:0.096, hex:P.steel},
      {y:L.headTopY+0.02, rx:0.052, rz:0.048, hex:P.steelDk},
    ];
    const domeRings=domeBands.map(b=>ring(V(0,b.y,hcz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(domeRings, b=>domeBands[b].hex);
    capFan(domeRings.at(-1), V(0, L.headTopY+0.06, hcz), P.steelDk);
  }

  /* arms — right (front) hand drives high near the blade, left (back) hand anchors low: the
     two-handed brace across the body. */
  {
    const S=V(L.shoulderX, L.shldY-0.01, LEAN*1.1), E=V(0.32,1.06,0.20+LEAN*0.5);
    tube(S,E,0.076,0.060,6,P.gambeson);
    tube(E,GRIP_FRONT,0.056,0.046,6,P.leather,{capB:{hex:P.skin}});
    tube(GRIP_FRONT.clone().add(V(-0.045,0.05,-0.02)), GRIP_FRONT.clone().add(V(0.045,-0.05,0.02)), 0.048,0.044,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});

    const S2=V(-L.shoulderX, L.shldY-0.01, LEAN*1.1), E2=V(-0.24,0.72,0.24+LEAN*0.3);
    tube(S2,E2,0.076,0.060,6,P.gambeson);
    tube(E2,GRIP_BACK,0.056,0.046,6,P.leather,{capB:{hex:P.skin}});
    tube(GRIP_BACK.clone().add(V(-0.045,0.05,-0.02)), GRIP_BACK.clone().add(V(0.045,-0.05,0.02)), 0.048,0.044,6,P.skin,{capA:{hex:P.skin},capB:{hex:P.skin}});
  }

  /* legs — weight FORWARD onto a braced front (right) leg, back (left) leg trailing straighter:
     the "holding the line" stance, not an at-rest sentry. */
  {
    const hipL=V(-L.hipHalf, L.hipY-0.01, -0.02), kneeL=V(-0.17,0.42,-0.10), ankL=V(-0.15,0.085,-0.16);
    const hipR=V( L.hipHalf, L.hipY-0.01,  0.02), kneeR=V( 0.22,0.38, 0.22), ankR=V( 0.22,0.085, 0.30);
    tube(hipL,kneeL,0.086,0.060,6,P.trouser);
    tube(kneeL,ankL,0.056,0.040,6,P.trouser);
    tube(hipR,kneeR,0.090,0.062,6,P.trouser);
    tube(kneeR,ankR,0.058,0.042,6,P.trouser);
    for(const [ank,toeDir] of [[ankL,V(0.05,0,1)], [ankR,V(0.02,0,1)]]){
      stack([
        {y:0.012, rx:0.066, rz:0.073, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.11,  rx:0.058, rz:0.060, cx:ank.x, cz:ank.z, hex:P.boot},
        {y:0.16,  rx:0.064, rz:0.064, cx:ank.x, cz:ank.z, hex:P.leatherDk},
      ], 6, {capTop:{hex:P.leatherDk, lift:0.005}, capBot:{hex:P.boot, lift:0.0}});
      const toeA=V(ank.x,0.05,ank.z), d=toeDir.clone().normalize();
      tube(toeA, toeA.clone().addScaledVector(d,0.13), 0.053,0.040,6,P.boot, {capB:{hex:P.boot, lift:0.014}, raz:0.046, rbz:0.032});
    }
  }

  /* base disc — shared module */
  buildBase(P);
}
