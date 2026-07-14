/* dev/model-qa/creatures/mon-wyvern.js — THE WYVERN — MODEL-FOUNDRY REBUILD (set rebuild-w2, cell 7).
   Large, CR 6, realm core; 22 instances (also stands in for the crocodile line pre-wave).
   Whole-object grammar: one function, one geometry frame, no anchors. Y-up. LARGE base disc (r=0.55).

   FEATURE CHECKLIST (the ~1.5k tris buy these, per ANATOMY-CANON §WINGED + the flavor line):
     1. TWO legs only, no forelegs — the anti-dragon tell (dragon = 4 legs + wings as a 3rd pair).
     2. WINGS = FORELIMBS, knuckle-walking: strut skeleton (leading-edge spar + fanning finger
        struts) planted wrist-down on the disc, scalloped membrane hung between the struts.
     3. Long thin raptor neck + narrow head with a swept CREST (no horns) — reads bird/lizard.
     4. Open jaws with top+bottom fangs — the mid-lunge bite, never a closed line.
     5. THE SIGNATURE: the tail whipped UP and OVER THE BACK scorpion-style, arcing forward until
        the barbed stinger is poised directly ABOVE THE HEAD — PALE keratin barb (the one bright
        value zone on a dark rust-brown body, law 3).
     6. Rust-brown dorsal hide / pale sandy throat-belly / dark diamond flank scales — the
        dragon-distinguishing palette (vs the dragon's forest green).

   POSE SENTENCE: braced on its wing-wrists and hind legs mid-strike, jaws torn open, the scorpion
   tail lashed up and forward so the pale stinger hangs poised directly over its own head — the
   sting-lash, not a resting stance.

   Authored DELIBERATELY to NOT read as the young green dragon (mon-dragon.js): TWO legs (no
   forelegs), wings-as-forelimbs knuckle-walk, a narrower crested (not horned) head, and the
   over-back-and-past-the-head scorpion tail vs the dragon's floor-wrapped tail.
   Imported by mon-wyvern-probe.html + the proof sheet / ps1-sheet rebuild-w2 cell 7. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildWyvern(){
  /* ---------- PALETTE (VS-desaturated RUST-BROWN scale; pale throat; keratin; amber eyes) ---------- */
  const P = {
    hide:0x7a4e30, hideDk:0x5a3922, hideLt:0x936046,                 /* rust-brown dorsal */
    hideMud:0x6a4328,                                                 /* mid flank brown */
    throat:0xc0a274, throatDk:0x9a815a,                              /* pale sandy throat/belly */
    scale:0x462b18, scaleLt:0x543420,                                /* dark scale accents */
    crest:0x8a3d2a, crestLt:0xb0563c,                                /* rusty-red raptor crest membrane */
    claw:0x2a231b, clawLt:0x453a2c,                                  /* keratin talons */
    barb:0xb8a678, barbTip:0xf2e8ce,                                 /* the stinger keratin — PALE (high-value signature zone, law 3) */
    membrane:0x6b452b, membraneLt:0xa07a52, membraneDk:0x4a3020,     /* wing skin; lit underside; shadow */
    spar:0x3f2c1c,                                                   /* wing finger-bone spars */
    eye:0xd39a28, eyeDk:0x140d06, teeth:0xd8cdae,                    /* amber slit eye; ivory teeth */
    maw:0x281812,
    disc:0x463f34, discTop:0x554d40,
  };

  /* ======================================================================================
     LANDMARKS. Front = +z (head + chest face +z). The body is SHALLOWER and more hunched than
     the dragon — a lean raptor, not a barrel-chested dragon. Only TWO legs (rear), planted under
     the hips; the wing-wrists take the fore-weight (knuckle-walk). Shoulder sits forward + high.
     ====================================================================================== */
  const shY = 0.94;
  const S = {
    rump:  V(0, 0.86, -0.50),
    loin:  V(0, 0.84, -0.26),
    back:  V(0, 0.90, -0.02),
    shldr: V(0, shY+0.02, 0.20),          /* shoulder — where the wings root, forward + up */
    chest: V(0, 0.80, 0.34),              /* shallow chest */
    breast:V(0, 0.66, 0.42),              /* lower breast where the long neck springs */
  };

  /* ======================================================================================
     BODY — one horizontal loft. Leaner + shallower than the dragon (a lizard, not a barrel).
     Rust-brown dorsal; a paler sandy throat/belly plate below. Dark scale accents on the flanks.
     ====================================================================================== */
  {
    const n=8, ph=Math.PI/n;
    tube(S.rump,  S.loin,  0.175, 0.200, n, P.hideDk, {phase:ph, capA:{hex:P.hideDk, lift:0.02}});
    tube(S.loin,  S.back,  0.200, 0.218, n, P.hide,   {phase:ph});
    tube(S.back,  S.shldr, 0.218, 0.222, n, P.hide,   {phase:ph});
    tube(S.shldr, S.chest, 0.222, 0.186, n, P.hide,   {phase:ph});
    tube(S.chest, S.breast,0.186, 0.115, n, P.hideMud,{phase:ph});

    /* PALE THROAT/BELLY — a ventral loft closing the underside, sandy pale (the throat signature). */
    {
      const bn=8, bph=Math.PI/bn;
      const rings2=[
        {y:0.72, z:0.44, rx:0.12, ry:0.10}, {y:0.63, z:0.26, rx:0.18, ry:0.12},
        {y:0.61, z:0.04, rx:0.20, ry:0.13}, {y:0.63, z:-0.18, rx:0.18, ry:0.12},
        {y:0.69, z:-0.36, rx:0.14, ry:0.10},
      ].map(b=> ring(V(0, b.y, b.z), V(0,0,1), b.rx, b.ry, bn, bph));
      const colFn=(band,i)=>{
        const rng=rings2[band], ys=rng.map(v=>v.y), minY=Math.min(...ys), maxY=Math.max(...ys);
        const isBelly=(rng[i].y - minY) < (maxY-minY)*0.5;
        return isBelly ? (band%2===0?P.throat:P.throatDk) : P.hideMud;
      };
      stitch(rings2, colFn);
      capFan(rings2[0], V(0,0.72,0.50), P.throat);              /* pale throat cap forward */
      capFan(rings2[rings2.length-1], V(0,0.70,-0.42), P.hideMud, true);
    }
    /* scute cross-ridges on the pale belly */
    for(const z of [0.26, 0.06, -0.14, -0.30]){
      quad(V(-0.13,0.492,z+0.013), V(0.13,0.492,z+0.013), V(0.13,0.484,z-0.013), V(-0.13,0.484,z-0.013), P.throatDk, 0.03);
    }
    /* dark diamond scale accents on the flanks */
    const diamond=(cx,cy,cz,s,sz)=>{
      const o=0.004;
      quad(V(cx-sz*0.5, cy, cz+o*s), V(cx, cy+sz*0.5, cz+o*s), V(cx+sz*0.5, cy, cz+o*s), V(cx, cy-sz*0.5, cz+o*s), P.scale, 0.05);
    };
    for(const s of [-1,1]){
      diamond(s*0.23, 0.90, -0.06, s, 0.09);
      diamond(s*0.22, 0.80,  0.12, s, 0.08);
      diamond(s*0.20, 0.82, -0.26, s, 0.09);
    }
  }

  /* ======================================================================================
     NECK — LONGER and THINNER than the dragon's (a lean serpent-raptor neck). A shallow S rising
     forward off the breast to a head held high + forward, looking DOWN at prey. Swept-path rings.
     ====================================================================================== */
  const neckPath = [
    { p:V(0, 0.70, 0.46), r:0.110 },   /* root at the breast */
    { p:V(0, 0.94, 0.52), r:0.100 },   /* rises forward */
    { p:V(0, 1.20, 0.48), r:0.090 },   /* up + a touch back */
    { p:V(0, 1.44, 0.40), r:0.082 },   /* the lean arch */
    { p:V(0, 1.62, 0.44), r:0.076 },   /* crest of the neck */
    { p:V(0, 1.66, 0.62), r:0.072 },   /* crooks FORWARD */
    { p:V(0, 1.58, 0.80), r:0.070 },   /* head end reaches OUT + slightly DOWN (predatory stoop) */
  ];
  let neckEnd, neckAxis;
  {
    const NSEG=8;
    const rings=[];
    for(let i=0;i<neckPath.length;i++){
      const cur=neckPath[i];
      const nxt=neckPath[Math.min(i+1, neckPath.length-1)].p;
      const prv=neckPath[Math.max(i-1,0)].p;
      const axis=new THREE.Vector3().subVectors(nxt,prv).normalize();
      const rx=cur.r*0.94, rz=cur.r*1.06;
      rings.push(ring(cur.p, axis, rx, rz, NSEG, Math.PI/NSEG));
    }
    const colFn=(b,i)=>{
      const rng=rings[b], ys=rng.map(v=>v.y), minY=Math.min(...ys), maxY=Math.max(...ys);
      const isBelly=(rng[i].y - minY) < (maxY-minY)*0.34;
      return isBelly ? P.throatDk : (b>=4 ? P.hideMud : P.hide);
    };
    stitch(rings, colFn);
    capFan(rings[0], neckPath[0].p.clone().add(V(0,-0.02,-0.02)), P.hideMud, true);
    neckEnd = neckPath[neckPath.length-1].p;
    neckAxis = new THREE.Vector3().subVectors(neckEnd, neckPath[neckPath.length-2].p).normalize();
  }

  /* ======================================================================================
     HEAD — a NARROW raptor skull (narrower than the dragon's broad wedge). NO horns — instead a
     smooth swept-back CREST (a bony/membrane fin) off the crown. Amber eyes, a long thin toothed
     snout parted. Meaner + dumber than the dragon: small braincase, big jaw.
     ====================================================================================== */
  {
    const fwd=neckAxis.clone();
    const side=new THREE.Vector3().crossVectors(V(0,1,0), fwd).normalize();
    const up=new THREE.Vector3().crossVectors(fwd, side).normalize();
    const HC=neckEnd.clone().addScaledVector(fwd, 0.08);

    const seg=(along, offUp=0)=> HC.clone().addScaledVector(fwd, along).addScaledVector(up, offUp);
    const ell=(c,w,h,n=8)=>{ const pts=[];
      for(let k=0;k<n;k++){ const a=Math.PI/n + k/n*Math.PI*2;
        pts.push(c.clone().addScaledVector(side, Math.cos(a)*w).addScaledVector(up, Math.sin(a)*h)); }
      return pts; };

    /* NARROW skull loft: join → small cranium → brow → cheek → snout base (all slimmer than dragon). */
    const rJoin = ell(seg(-0.09,  0.00), 0.076, 0.070);
    const rSkull= ell(seg(-0.02,  0.02), 0.092, 0.084);   /* small braincase */
    const rBrow = ell(seg( 0.05,  0.02), 0.098, 0.072);   /* modest brow over the eyes */
    const rCheek= ell(seg( 0.12, -0.01), 0.082, 0.060);
    const rSnout= ell(seg( 0.20, -0.02), 0.058, 0.046);   /* narrow snout base */
    stitch([rJoin, rSkull, rBrow, rCheek, rSnout],
      (b)=> b===2 ? P.hide : (b===0? P.hideMud : P.hide));
    capFan(rJoin, seg(-0.13, -0.01), P.hideMud, true);

    /* SNOUT — a long thin wedge parted into upper/lower jaw with a dark maw + teeth. Longer + thinner
       than the dragon's blunt muzzle (a raptor bite). */
    /* JAWS OPEN (pose law 5 — mid-lunge, not at rest): the lower jaw drops well clear of the
       upper snout so the maw reads as a wide-open bite, not a closed line. */
    const uB=ell(seg(0.22, 0.004), 0.054, 0.040), uM=ell(seg(0.32, 0.00), 0.040, 0.028), uT=ell(seg(0.42,-0.008), 0.022, 0.016);
    stitch([uB,uM,uT], ()=>P.hide);
    capFan(uT, seg(0.47,-0.012), P.hideMud);
    const lB=ell(seg(0.20,-0.088), 0.046, 0.028), lM=ell(seg(0.29,-0.110), 0.032, 0.020), lT=ell(seg(0.38,-0.126), 0.018, 0.012);
    stitch([lB,lM,lT], ()=>P.hideMud);
    capFan(lT, seg(0.42,-0.134), P.throatDk);
    /* dark maw gash — wide open between the dropped lower jaw and the upper snout */
    {
      const m0u=seg(0.24,-0.020), m1u=seg(0.38,-0.030), m0l=seg(0.22,-0.082), m1l=seg(0.36,-0.100);
      quad(m0u.clone().addScaledVector(side,0.034), m1u.clone().addScaledVector(side,0.016),
           m1l.clone().addScaledVector(side,-0.016), m0l.clone().addScaledVector(side,-0.034), P.maw, 0.02);
    }
    /* teeth — a row of thin ivory fangs along the upper snout, exposed by the dropped jaw */
    for(const s of [-1,1]){
      for(const [along,w,h] of [[0.27,0.008,0.036],[0.32,0.007,0.030],[0.37,0.006,0.022]]){
        const g=seg(along,-0.026).addScaledVector(side, s*(w+0.020));
        const t=seg(along,-0.026-h).addScaledVector(side, s*(w+0.018));
        quad(g.clone().addScaledVector(side,-w), g.clone().addScaledVector(side,w), t, t, P.teeth, 0.02);
      }
    }
    /* lower fangs — a shorter row on the dropped lower jaw, so the open bite reads top AND bottom */
    for(const s of [-1,1]){
      for(const [along,w,h] of [[0.24,0.007,0.020],[0.30,0.006,0.016]]){
        const g=seg(along,-0.090).addScaledVector(side, s*(w+0.016));
        const t=seg(along,-0.090+h).addScaledVector(side, s*(w+0.014));
        quad(g.clone().addScaledVector(side,-w), g.clone().addScaledVector(side,w), t, t, P.teeth, 0.02);
      }
    }
    /* small brow ledge over each eye (a scowl, NOT a horn) */
    for(const s of [-1,1]){
      const b0=seg(0.045,0.014).addScaledVector(side, s*0.056);
      const b1=seg(0.095,0.038).addScaledVector(side, s*0.086);
      const b2=seg(0.120,0.010).addScaledVector(side, s*0.074);
      quad(b0, b1, b2, b2, P.hideDk, 0.05);
    }

    /* nostril hints near the snout tip */
    for(const s of [-1,1]){
      const nc=seg(0.39,0.012).addScaledVector(side, s*0.018);
      quad(nc.clone().addScaledVector(side,-0.008).addScaledVector(fwd,-0.006),
           nc.clone().addScaledVector(side, 0.008).addScaledVector(fwd,-0.006),
           nc.clone().addScaledVector(side, 0.006).addScaledVector(fwd, 0.006),
           nc.clone().addScaledVector(side,-0.006).addScaledVector(fwd, 0.006), P.maw, 0.0);
    }

    /* ===== RAPTOR CREST — the anti-horn signature. A smooth swept-back FIN off the crown (a single
       membrane/bony crest fanning up + back), plus a small pair of trailing cheek fins. NO paired
       horns — one flat crest, so the head reads bird/lizard, not dragon. ===== */
    {
      const c0=HC.clone().addScaledVector(fwd,-0.02).addScaledVector(up, 0.070);   /* crest base at the crown */
      const cUp=HC.clone().addScaledVector(fwd,-0.12).addScaledVector(up, 0.200);   /* crest peak, swept back + up */
      const cBk=HC.clone().addScaledVector(fwd,-0.28).addScaledVector(up, 0.120);   /* trailing crest point, back */
      /* the crest fin — two thin membrane triangles (both faces), rusty-red */
      quad(c0.clone().addScaledVector(side, 0.010), cUp, cBk, c0.clone().addScaledVector(side, 0.010), P.crest, 0.05);
      quad(c0.clone().addScaledVector(side,-0.010), cBk, cUp, c0.clone().addScaledVector(side,-0.010), P.crestLt, 0.05);
      /* a spar rib along the leading edge of the crest so it has a bony spine */
      tube(c0, cUp, 0.018, 0.006, 4, P.hideDk, {capB:{hex:P.claw, lift:0.008}});
      /* small trailing cheek fins each side (raptor frill, not cheek spikes/horns) */
      for(const s of [-1,1]){
        const f0=HC.clone().addScaledVector(fwd,-0.04).addScaledVector(side, s*0.070).addScaledVector(up, 0.010);
        const f1=f0.clone().addScaledVector(fwd,-0.10).addScaledVector(side, s*0.050).addScaledVector(up,-0.020);
        const f2=f0.clone().addScaledVector(fwd,-0.06).addScaledVector(side, s*0.030).addScaledVector(up, 0.060);
        quad(f0, f1, f2, f2, P.crest, 0.05);
      }
    }
  }

  /* ======================================================================================
     SPINAL RIDGE — small back-plates down the neck + back to the tail (tail plates in the tail block).
     ====================================================================================== */
  {
    const plate=(y,z,h,w)=>{
      quad(V(-w, y, z+0.02), V(w, y, z+0.02), V(0, y+h, z), V(0, y+h, z), P.hideDk, 0.05);
      quad(V(-w, y, z-0.02), V(w, y, z-0.02), V(0, y+h, z), V(0, y+h, z), P.scaleLt, 0.05);
    };
    for(const s of neckPath){ plate(s.p.y + s.r*0.9, s.p.z, 0.042, 0.018); }
    const bodyPlates=[[shY+0.26,0.14,0.058],[shY+0.24,-0.04,0.054],[shY+0.18,-0.24,0.046],[shY+0.10,-0.44,0.038]];
    for(const [y,z,h] of bodyPlates){ plate(y, z, h, 0.022); }
  }

  /* ======================================================================================
     WINGS = ARMS. The wyvern has NO forelegs — the wings ARE the front limbs, in a KNUCKLE-WALK
     pose: the wing-WRIST spar is PLANTED ON THE DISC (like a bat crawling), taking fore-weight.
     From the grounded wrist, finger-spars fan UP + BACK holding a half-spread membrane sail that
     silhouettes above the back. Rooted at the shoulder. This grounded-wrist stance is the biggest
     tell that separates the wyvern from the dragon (whose wings float free and whose forelegs are
     separate). Symmetric.
     ====================================================================================== */
  const WSH = V(0, shY+0.06, 0.18);        /* wing root, at the shoulder, forward */
  const GROUND = 0.075;                     /* disc top — the wing-wrist knuckle plants here */
  function wing(s){
    const arm=P.hideDk;
    /* shoulder → ELBOW (out + up) → WRIST PLANTED ON THE DISC, well out to the side + forward.
       The elbow rides HIGH (the folded wing peak) while the wrist drops to the FLOOR — the
       knuckle-walk. */
    const EL = V(s*0.34, WSH.y+0.30, WSH.z-0.04);          /* elbow high + out (wing peak) */
    /* CRITIC pass-2: the wrist was planted at WSH.z+0.16 — far enough forward that the membrane
       sail fanning off it formed one flat frontal panel that occluded BOTH hind legs on-screen
       (law-2 silhouette failure: the anti-dragon two-legs tell didn't read at all). Pulled the
       wrist back toward the shoulder line so the sail sits over/beside the legs, not in front. */
    const WR = V(s*0.46, GROUND+0.02, WSH.z+0.04);         /* WRIST KNUCKLE on the disc */
    tube(WSH, EL, 0.076, 0.056, 6, arm, {capA:{hex:P.hide}});   /* humerus */
    tube(EL, WR, 0.050, 0.034, 6, arm);                          /* forearm down to the grounded wrist */
    /* the knuckle "hand" claw where the wrist meets the ground — a short planted talon + pad */
    tube(WR, V(WR.x+s*0.04, GROUND, WR.z+0.10), 0.026, 0.010, 5, P.hideMud, {capB:{hex:P.claw, lift:0.012}});
    tube(WR, V(WR.x-s*0.02, GROUND, WR.z-0.06), 0.020, 0.008, 5, P.hideMud, {capB:{hex:P.claw, lift:0.010}});
    /* the wing thumb-claw hooking up from the wrist (the classic wyvern wing-finger) */
    tube(WR, V(WR.x+s*0.06, WR.y+0.14, WR.z+0.04), 0.020, 0.006, 5, P.spar, {capB:{hex:P.claw, lift:0.01}});
    /* FINGER SPARS fan UP + BACK from the grounded wrist, opening the half-spread sail above the
       back. Because the wrist is LOW, the sail sweeps upward — a folded-but-lifted bat wing. */
    /* CRITIC pass-2: #1 used to reach WR.z+0.14 (forward of the wrist, toward the head) — the
       single biggest contributor to the sail blocking the legs. Pulled it back to the wrist depth
       so the sail's leading edge stops short of the torso instead of walling it off. */
    /* CRITIC pass-2 round 2: #3/#4 still hung LOW (y~0.40 and y~0.20 — leg height) and WIDE, so the
       lower half of the sail kept walling off the hind legs even after the round-1 pull-back.
       Lifted #3/#4 up toward the mid-back so the sail's lower edge clears leg-height and the two
       planted legs read below/beside it instead of behind it. */
    const F = [
      V(WR.x + s*0.10, WR.y+0.72, WR.z+0.02),   /* #1 leading — up, at the wrist line (not past it) */
      V(WR.x + s*0.40, WR.y+0.64, WR.z-0.06),   /* #2 up + out */
      V(WR.x + s*0.44, WR.y+0.54, WR.z-0.22),   /* #3 out + back, lifted clear of leg-height */
      V(WR.x + s*0.34, WR.y+0.36, WR.z-0.40),   /* #4 trailing — back, lifted clear of leg-height */
    ];
    for(const f of F) tube(WR, f, 0.026, 0.007, 5, P.spar, {capB:{hex:P.claw, lift:0.012}});
    /* membrane roots hemming the sail to the body (up at the shoulder fore; down at the flank aft) */
    const ROOTFORE = V(s*0.12, shY+0.20, WSH.z+0.02);
    const ROOTAFT  = V(s*0.10, shY-0.10, WSH.z-0.30);
    const cells = [
      [WR, ROOTFORE, F[0]],
      [WR, F[0], F[1]],
      [WR, F[1], F[2]],
      [WR, F[2], F[3]],
      [WR, F[3], ROOTAFT],
    ];
    for(const [a,b,c] of cells){
      quad(a, b, c, c, P.membrane, 0.05);
      const dz=V(0,-0.010,0);
      quad(a.clone().add(dz), c.clone().add(dz), b.clone().add(dz), b.clone().add(dz), P.membraneLt, 0.05);
    }
    quad(WR, F[1], F[1].clone().add(V(-s*0.02,0.03,0)), WR.clone().add(V(-s*0.02,0.03,0)), P.membraneDk, 0.03);
    quad(WR, F[3], F[3].clone().add(V(0,0.03,0.02)), WR.clone().add(V(0,0.03,0.02)), P.membraneDk, 0.03);
  }
  wing(+1);
  wing(-1);

  /* ======================================================================================
     LEGS — TWO ONLY (the rear/hind pair). Powerful digitigrade raptor legs planted under the hips,
     clawed feet on the disc, taking the main weight (the wing-wrists take the fore-weight). Big
     drumstick thigh → slim shank → three-taloned foot. NO front legs — that's the dragon.
     ====================================================================================== */
  {
    const leg=(hip, kneeXZ, footX, footZ)=>{
      const knee = V(kneeXZ.x, 0.50, kneeXZ.z);
      const ankle= V(footX*0.94, 0.20, footZ*0.94);
      const foot = V(footX, GROUND+0.03, footZ);
      /* DRUMSTICK THIGH — F1 backlog: the haunch read LUMPY because a fat 6-sided thigh tube and a
         separate low-res blob (6seg/4band) overlapped at the knee, faceting into overlapping bumps.
         Rebuilt as ONE continuous 12-sided lofted drumstick — a single ring stack along the hip→knee
         axis with a smooth mid-thigh bulge (the raptor haunch) swelling then tapering to a rounded
         knee — so the surface is unbroken (no tube-seam + no overlapping blob). */
      {
        const axis = new THREE.Vector3().subVectors(knee, hip).normalize();
        const prof = [   // [t along hip→knee, radius] — smooth swell then taper (drumstick)
          [0.00, 0.120], [0.20, 0.168], [0.42, 0.192], [0.66, 0.170], [0.86, 0.128], [1.00, 0.104],
        ];
        const rings = prof.map(([t,r]) => ring(hip.clone().lerp(knee, t), axis, r, r*0.90, 12, Math.PI/12));
        stitch(rings, ()=>P.hideDk);
        capFan(rings[0],  hip.clone().addScaledVector(axis,-0.03),  P.hideDk, true);   // rounded hip cap
        capFan(rings.at(-1), knee.clone().addScaledVector(axis,0.03), P.hideDk);        // rounded knee cap
      }
      tube(knee, ankle, 0.086, 0.066, 8, P.hideMud);                  /* thick shank (not a spindle) */
      tube(ankle, foot, 0.070, 0.060, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});  /* stout ankle/pastern */
      /* three forward talons + a back dew-claw (big raptor foot) */
      for(const tx of [-0.06,0,0.06]){
        const toeA=V(foot.x+tx*0.5, GROUND+0.01, foot.z);
        const toeB=V(foot.x+tx, GROUND, foot.z+0.15);
        tube(toeA, toeB, 0.032,0.012,4,P.hideMud,{capB:{hex:P.claw, lift:0.016}});
      }
      tube(foot, V(foot.x, GROUND, foot.z-0.09), 0.024,0.008,4,P.hideDk,{capB:{hex:P.claw, lift:0.010}});
    };
    /* the two hind legs, planted under the hips, feet forward-ish for a hunched crouch.
       CRITIC pass-2: widened + pushed the feet forward (was x=±0.32,z=0.04) so they clear the
       (now pulled-back) wing footprint and the two-legs anti-dragon tell actually reads on-screen
       instead of vanishing behind the wing sail. */
    leg(V(-0.22, 0.82, -0.30), V(-0.36,0,-0.10), -0.38, 0.14);
    leg(V( 0.22, 0.82, -0.30), V( 0.36,0,-0.10),  0.38, 0.14);
  }

  /* ======================================================================================
     TAIL — THE SIGNATURE. THE STING-LASH POSE: the tail whips up and OVER THE BACK like a scorpion
     and keeps arcing FORWARD until the barbed stinger is poised directly ABOVE THE HEAD, ready to
     strike down onto whatever the open jaws are facing. This forward-over-the-back-and-past-the-
     shoulders arc (vs the dragon's tail wrapping the disc floor) is the second big dragon-
     distinguishing tell, and the high-expression pose law (5): never at rest, always mid-strike.
     ====================================================================================== */
  {
    const root = V(0.0, 0.86, -0.60);       /* at the rump, low + behind */
    const t1   = V(0.06, 1.06, -0.64);      /* lifts UP + back */
    const t2   = V(0.04, 1.32, -0.52);      /* rising steeply */
    const t3   = V(-0.02, 1.54, -0.28);     /* the arch top, curling FORWARD over the back — a TIGHT
                                                hook, not a wide loop, so it keeps reading as a tail */
    const t4   = V(-0.02, 1.66, 0.06);      /* crest of the scorpion arc, past the spine */
    const t5   = V(0.02, 1.64, 0.36);       /* sweeping forward OVER the shoulders, toward the head */
    const stingBase = V(0.03, 1.58, 0.58);  /* the barb node poised directly ABOVE THE HEAD, striking-down-ready */
    tube(root, t1, 0.150, 0.128, 8, P.hideDk, {phase:Math.PI/8, capA:{hex:P.hideDk, lift:0.02}});
    tube(t1,   t2, 0.128, 0.104, 8, P.hide,   {phase:Math.PI/8});
    tube(t2,   t3, 0.104, 0.082, 8, P.hide,   {phase:Math.PI/8});
    tube(t3,   t4, 0.082, 0.062, 8, P.hideMud,{phase:Math.PI/8});
    tube(t4,   t5, 0.062, 0.048, 8, P.hideMud,{phase:Math.PI/8});
    tube(t5,   stingBase, 0.048, 0.040, 8, P.hideDk, {phase:Math.PI/8});
    /* THE STINGER — a prominent barbed WEDGE (not a long spike): a fat bulbous venom node, then a
       SHORT sharp barb curving down + forward, flanked by two back-swept barb hooks. Kept compact +
       high so it reads as a scorpion sting poised directly over the head, never a droopy spear.
       PALE keratin (bone/ivory) — the value-contrast law: this is the ONE bright zone on a dark-rust
       body, so the eye lands on the signature first. */
    {
      const node = stingBase;
      const tip  = V(0.02, 1.40, 0.80);                     /* SHORT barb: aimed DOWN + forward, poised over the head/jaws */
      /* fat venom-bulb node (the recognizable scorpion sting swelling) — enlarged (CRITIC pass-2:
         the engine render read the signature as a faint sliver, not the loud law-3 zone) so the
         PALE zone reads clearly at a squint. */
      blob(node.x, node.y-0.01, node.z, 0.108, 0.118, 0.100, P.barb, 7, 5);
      /* the barb spike — CRITIC pass-2: was tapering to r=0.003, well under the 0.04u feature
         floor (law 3), so it dissolved at 1/3-res and only the dim node showed. Floored the tip
         radius at 0.042 so the whole spike stays a visible pale wedge, not a vanishing needle. */
      tube(node, tip, 0.058, 0.042, 6, P.barb, {capB:{hex:P.barbTip, lift:0.02}});
      /* two prominent back-swept barb hooks off the node (the wicked barbed read) — same floor fix */
      for(const s of [-1,1]){
        const h0=V(node.x + s*0.05, node.y-0.02, node.z+0.03);
        const h1=V(node.x + s*0.15, node.y+0.10, node.z-0.06);   /* hooks OUT, back + up */
        tube(h0, h1, 0.026, 0.024, 4, P.barb, {capB:{hex:P.barbTip, lift:0.012}});
      }
    }
    /* tail spinal plates riding the top of the scorpion arc */
    const tailPts=[t1,t2,t3,t4,t5];
    for(let i=0;i<tailPts.length;i++){
      const pt=tailPts[i], h=0.045*(1-i*0.12);
      quad(pt.clone().add(V(-0.026,0.02,0.02)), pt.clone().add(V(0.026,0.02,0.02)),
           pt.clone().add(V(0,0.02+h,0)), pt.clone().add(V(0,0.02+h,0)), P.hideDk, 0.05);
    }
  }

  /* ======================================================================================
     BASE DISC — LARGE: r=0.55.
     ====================================================================================== */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 20);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.53, 0.53, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.060,0), P.discTop);
  }
}
