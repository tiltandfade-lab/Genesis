/* dev/model-qa/creatures/rlm-shared-rat.js — RAT (cross-realm shared body, QUADRUPED rodent, Tiny, CR 0).
   Read: ordinary rat, not the giant-rat — lab-runoff chitin-plated vermin, chrome-dull carapace
   skin over a hunched-arc back. Signature = the naked segmented tail (longer than the body) +
   the full-sprint bolt stretch. Whole-object grammar, one merged frame, no anchors, no eye quads
   (dark sockets only). Neutral core identity — no single realm's palette gimmick.

   FEATURE CHECKLIST:
   - hunched-arc rodent back (spine bows up over shoulders/hips, chief anatomy tell)
   - naked ringed tail, longer than the body, streaming straight back off the disc
   - flat swept ears (bolt-pose, not alert-upright)
   - pale tail + pale feet + pale ear-inner = the high-value zone (>=140 RGB on the signature)
   - chitin-plated skin: hard-edged dull plates on back/flank, not soft fur
   - tight Tiny footprint (whole animal < r=0.42 shared disc, legs tucked to the sprint line)

   POSE SENTENCE: the bolt — full sprint stretch low to the disc, spine drawn out flat-and-low
   with the hunch riding at the shoulders, forelegs reaching, hindlegs driving, tail streaming
   dead straight behind, ears pinned flat.
   SPINE-GESTURE SENTENCE: one continuous low arc from nose to tail-base — down at the snout,
   cresting at the shoulder hunch, dipping through the loin, launching straight back into the tail —
   read first, before any single leg or plate detail. */
import { THREE, V as V0, quad, tube as tube0, ring as ring0, stitch, capFan } from '../probe-lib.js';

export function buildRat(){
  /* ---------- SCALE — Tiny lore-body legibility-boosted against the shared r=0.42 disc, per
     the bright-pixie convention (docs/MODEL-FOUNDRY.md, "authored bigger to fill the disc despite
     being Tiny"). All positions run through V() (auto-scaled); all tube/ring radii run through
     rs() explicitly since they're separate numeric params, not vectors. ---------- */
  const SCALE = 1.9;
  const V = (x,y,z) => V0(x*SCALE, y*SCALE, z*SCALE);
  const rs = v => v*SCALE;
  const tube = (a,b,ra,rb,n,hex,opts={}) => {
    const o = {...opts};
    if(o.raz!=null) o.raz = rs(o.raz);
    if(o.rbz!=null) o.rbz = rs(o.rbz);
    if(o.capA) o.capA = {...o.capA, lift: o.capA.lift!=null ? rs(o.capA.lift) : undefined};
    if(o.capB) o.capB = {...o.capB, lift: o.capB.lift!=null ? rs(o.capB.lift) : undefined};
    return tube0(a,b, rs(ra), rs(rb), n, hex, o);
  };
  const ring = (c, axis, rx, rz, n, phase) => ring0(c, axis, rs(rx), rs(rz), n, phase);

  /* ---------- PALETTE (chrome-dull chitin, VS-desaturated, pale sprint tells — brightened for
     Law-3 body-mass contrast against the (10,9,8) void floor) ---------- */
  const P = {
    chit:0x62685f, chitDk:0x3d4139, chitLt:0x777d70,
    plate:0x7a8071, plateDk:0x494e43,
    belly:0x968c78, snout:0x35372f, mouth:0x1c1d18, tooth:0xd8d2ba,
    ear:0x484c42, earIn:0xbfb09c,
    tail:0xa4977f, tailDk:0x7d7361, tailPale:0xcdc0a4,
    foot:0xbfb09c, claw:0x201f19, void_:0x141410,
    disc:0x2e302b, discTop:0x3a3d36,
  };

  /* ---------- LANDMARKS — spine along +z, sprint-stretched, hunch riding at shoulders ----------
     Tiny body ~0.42u nose-to-tailbase in lore-scale units (pre-SCALE), enlarged for legibility
     against the shared r=0.42 disc — same convention as the pixie/mastiff sheet-mates. */
  const spY = 0.075;
  const S = {
    tailBase: V(0, spY-0.010, -0.185),
    rump:     V(0, spY-0.004, -0.135),
    loin:     V(0, spY+0.010, -0.060),
    shldr:    V(0, spY+0.040,  0.020),   /* hunch crest — highest point of the spine */
    neck:     V(0, spY+0.020,  0.095),
    headB:    V(0, spY+0.018,  0.140),
  };

  /* ---------- BODY — hunched-arc barrel, low-slung and stretched (the bolt) ---------- */
  tube(S.rump,  S.loin,  0.048, 0.058, 8, P.chit,    {phase:Math.PI/8, capA:{hex:P.chitDk, lift:0.010}});
  tube(S.loin,  S.shldr, 0.058, 0.064, 8, P.plate,   {phase:Math.PI/8});
  tube(S.shldr, S.neck,  0.064, 0.044, 8, P.chit,    {phase:Math.PI/8});
  tube(S.neck,  S.headB, 0.044, 0.036, 8, P.chitDk,  {phase:Math.PI/8});

  /* dorsal highlight strip riding the hunch crest — breaks the mass, sells the arc under the
     dimetric key light (R2 fix: r1's body read as a shadowed formless clump). */
  quad(V(-0.018,spY+0.062,-0.05), V(0.018,spY+0.062,-0.05), V(0.014,spY+0.066,0.03), V(-0.014,spY+0.066,0.03), P.chitLt, 0.03);

  /* pale belly strip — glimpsed low, sprint-stretch underside */
  {
    const by = spY-0.028;
    quad(V(-0.032,by,-0.115), V(0.032,by,-0.115), V(0.028,by+0.006,0.075), V(-0.028,by+0.006,0.075), P.belly, 0.03);
  }

  /* hard-edged chitin plate seams on back — the "not fur" tell */
  for(let i=0;i<3;i++){
    const z = -0.09 + i*0.06;
    quad(V(-0.030,spY+0.045-i*0.003,z), V(0.030,spY+0.045-i*0.003,z), V(0.026,spY+0.032-i*0.003,z+0.03), V(-0.026,spY+0.032-i*0.003,z+0.03), P.plateDk, 0.04);
  }

  /* ---------- HEAD — small wedge, tapering snout, flat swept ears ---------- */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:spY+0.015, cz:0.135, rx:0.034, rz:0.036, hex:P.chit},
      {y:spY+0.030, cz:0.148, rx:0.038, rz:0.038, hex:P.chit},
      {y:spY+0.044, cz:0.135, rx:0.028, rz:0.030, hex:P.chitDk},
    ];
    const rings=bands.map(b=>ring(V(0,b.y,b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(rings, b=>bands[b].hex);
    capFan(rings.at(-1), V(0, spY+0.058, 0.135), P.chitDk);

    /* SNOUT — narrow tapering to a point */
    const snB = V(0, spY+0.018, 0.150);
    const snM = V(0, spY+0.010, 0.183);
    const snT = V(0, spY+0.004, 0.205);
    tube(snB, snM, 0.024, 0.014, n, P.chit,  {raz:0.020, rbz:0.011, phase:ph});
    tube(snM, snT, 0.014, 0.006, n, P.snout, {raz:0.011, rbz:0.005, phase:ph, capB:{hex:P.mouth, lift:0.003}});
    /* dark mouth line + a hint of incisor */
    quad(V(-0.012,spY-0.004,0.158), V(0.012,spY-0.004,0.158), V(0.007,spY-0.008,0.196), V(-0.007,spY-0.008,0.196), P.mouth, 0.02);
    for(const s of [-1,1]) quad(V(s*0.006,spY-0.008,0.178), V(s*0.008,spY-0.008,0.178), V(s*0.007,spY-0.018,0.182), V(s*0.005,spY-0.018,0.182), P.tooth, 0.01);
    /* dark deep sockets (no eye quads) */
    for(const s of [-1,1]) quad(V(s*0.014,spY+0.052,0.144), V(s*0.020,spY+0.052,0.140), V(s*0.018,spY+0.040,0.142), V(s*0.013,spY+0.040,0.145), P.void_, 0.02);

    /* EARS — flat, swept back (bolt-pose, not alert) — pale inner = high-value zone */
    for(const s of [-1,1]){
      const eb    = V(s*0.024, spY+0.062, 0.118);
      const eTipA = V(s*0.052, spY+0.050, 0.078);
      const eTipB = V(s*0.014, spY+0.048, 0.086);
      quad(eb, V(s*0.010,spY+0.062,0.126), eTipB, eTipA, P.ear, 0.03);
      /* pale inner-ear sliver, inset toward the head */
      quad(V(s*0.020,spY+0.058,0.116), V(s*0.014,spY+0.056,0.106), V(s*0.026,spY+0.050,0.088), V(s*0.034,spY+0.052,0.094), P.earIn, 0.02);
    }
  }

  /* ---------- LEGS — small digitigrade, sprint-tucked (forelegs reach, hindlegs drive) ----------
     pale feet = second high-value tell, matched to the tail-pale value. */
  {
    const leg=(hipX, hipZ, footZoff, kneeYlift, hex)=>{
      const hip   = V(hipX, spY+0.010, hipZ);
      const knee  = V(hipX*1.05, 0.040+kneeYlift, hipZ + footZoff*0.45);
      const ankle = V(hipX*1.02, 0.018, hipZ + footZoff*0.78);
      const foot  = V(hipX*1.0,  0.004, hipZ + footZoff);
      tube(hip, knee,  0.020, 0.014, 6, hex);
      tube(knee, ankle,0.014, 0.010, 6, P.chitDk);
      tube(ankle, foot,0.010, 0.010, 5, P.foot, {capB:{hex:P.claw, lift:0.003}});
    };
    /* forelegs — reaching forward, low, splayed out past the body line for silhouette read */
    leg(-0.046, 0.080, 0.105, 0.006, P.chit);
    leg( 0.046, 0.080, 0.105, 0.006, P.chit);
    /* hindlegs — driving back, coiled, splayed wide */
    leg(-0.052,-0.105,-0.090,-0.006, P.chit);
    leg( 0.052,-0.105,-0.090,-0.006, P.chit);
  }

  /* ---------- TAIL — the signature: naked, ringed, longer than the body, streaming dead straight ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.006, spY-0.018, -0.26);
    const t2 = V(0.010, spY-0.022, -0.34);
    const t3 = V(0.013, spY-0.025, -0.41);
    const tip= V(0.015, spY-0.027, -0.465);
    tube(t0, t1, 0.020, 0.014, 6, P.tail,     {capA:{hex:P.tailDk}});
    tube(t1, t2, 0.014, 0.010, 6, P.tailPale, {});
    tube(t2, t3, 0.010, 0.007, 6, P.tail,     {});
    tube(t3, tip,0.007, 0.003, 6, P.tailPale, {capB:{hex:P.tailPale, lift:0.002}});
    /* ring segmentation ticks along the tail — the "naked/scaled" read */
    for(let i=0;i<6;i++){
      const t = i/5;
      const yy = spY-0.016 - t*0.011;
      const zz = -0.23 - t*0.25;
      const rr = 0.017 - t*0.012;
      quad(V(-rr*0.6,yy,zz), V(rr*0.6,yy,zz), V(rr*0.5,yy-0.006,zz+0.01), V(-rr*0.5,yy-0.006,zz+0.01), P.tailDk, 0.02);
    }
  }

  /* ---------- base disc (shared r=0.42 tile, per Tiny convention — UNSCALED, uses V0 directly) ---------- */
  {
    const r1=ring0(V0(0,0.002,0), V0(0,1,0), 0.42, 0.42, 16);
    const r2=ring0(V0(0,0.020,0), V0(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V0(0,0.022,0), P.discTop);
  }
}
