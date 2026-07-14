/* dev/model-qa/creatures/mon-dragon.js — THE YOUNG RED DRAGON (whole-object FLAGSHIP monster).
   REBUILD (2026-07-08, foundry pilot). Highest-leverage body in the game: this rig stands in for
   EVERY chromatic/metallic dragon render key (43 total, wyrmling→ancient) — anatomy + wing rig
   correctness here pays out across the whole family. Whole-object grammar: one function, one
   geometry frame, no anchors. Y-up, spine +z (front/head faces +z, the game-dimetric cam favours),
   ground y=0, one landmark table (S / neckPath / WSH). Large-plus base disc r=0.62.

   FEATURE CHECKLIST (what the budget buys — from the flavor line "the apex predator of its realm,
   caught mid-roar, wings thrown open to blot out the sky"):
     1. Strut-skeleton WINGS, half-flared with dihedral (arm-analog: humerus→forearm→wrist, 4
        finger spars fanning wide + forward-cupped, scalloped membrane bays between — NEVER a flat
        fabric panel; see docs/ANATOMY-CANON WINGED).
     2. A long S-neck drawn BACK and UP over the shoulders — the cobra-coil wind-up, not a forward
        reach — carrying a reared-back head with jaws thrown wide (mid-roar/pre-breath).
     3. A wide-open toothed maw with a bright ember-glow at the throat (the pre-breath tell — the
        one loud warm accent against the cool dark scales).
     4. Full quadruped anatomy: deep chest + shoulder hump, coiled heavy rear haunches, all four
        feet planted (digitigrade, clawed) — braced for the breath, not standing at attention.
     5. Spinal ridge plates skull→tail; diamond scale accents on the flanks; a heavy coiling tail
        swept clear of the rear legs.
   POSE SENTENCE: a young red dragon braced on all fours, chest thrust forward, wings thrown half
   open with dihedral to either side, neck coiled back and the head reared up with jaws wide open —
   the half-second before the breath weapon fires, not a static perched mini.

   ANATOMY / the lessons, all at once:
     - FOUR legs planted (digitigrade, clawed): front pair more upright + forward, rear haunches
       coiled + heavy (the wolf-haunch technique). All four feet grounded (wolf lesson).
     - Deep-chested horizontal BODY loft (+z forward) with a defined SHOULDER HUMP.
     - A LONG NECK rising in a clean S-curve (snake rise-path technique — never near-vertical,
       every segment keeps a z-component so the ring frame never pinches), but this S sweeps BACK
       over the hump/wing-roots before the head end swings forward again — the wind-up coil, not a
       forward-reaching "looking at you" neck. Head reared up + jaws thrown wide: layered brow
       ridges, amber slit eyes, a WIDE-parted toothed maw with a throat ember-glow, twin swept
       horns + cheek spikes, nostril hints.
     - TWO great WINGS HALF-FLARED with dihedral (bat/gargoyle spar+membrane, ANATOMY-CANON WINGED
       family): shoulder→elbow→wrist leading spar built as real tube geometry FIRST, then 4 finger
       spars fanning wide, up and forward-cupped (caught-air read) with membrane quads fully
       between them, trailing edge scalloped by the fan itself. Rooted at the SHOULDERS.
     - A heavy TAIL sweeping around the disc edge in a partial coil (snake curve technique), rooted
       at the HIP and clear of the rear legs in back view (dragonborn lesson), ending in a spade tip.
     - A SPINAL RIDGE of small back-plates from skull to tail tip; a warm cream-gold belly-plate
       band; darker diamond scale accents scattered on the flanks/haunches.
   Palette: deep ember reds (VS-desaturated — brick and char, never neon), warm cream-gold belly,
   char-black horn/claw, amber-gold eyes + a bright orange throat-glow as the ONE hot accent.
   Imported by mon-dragon-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildYoungDragon(){
  /* ---------- PALETTE (VS desaturated ember reds; cream-gold belly; char keratin; amber eyes) ---------- */
  const P = {
    hide:0x8a2214, hideDk:0x5e1509, hideLt:0xb43a1e,                 /* brick-red dorsal scale */
    hideMoss:0x9c3a17,                                                /* mid flank burnt orange-red */
    belly:0xe8c07a, bellyDk:0xc79a52,                                 /* warm cream-gold belly plate */
    scale:0x40120a, scaleLt:0x4d190e,                                 /* dark diamond scale accents */
    ridge:0x360d05, ridgeLt:0x7a2410,                                 /* spinal back-plates */
    horn:0x241a14, hornTip:0x120c08, claw:0x110d09,                   /* char keratin horns / talons */
    membrane:0x9c2c12, membraneLt:0xd9611f, membraneDk:0x5e1608,      /* wing skin; lit underside; shadow */
    spar:0x3a140a,                                                    /* wing finger-bone spars */
    eye:0xffb020, eyeDk:0x1a0f05, teeth:0xf0e6c8,                     /* amber-gold slit eye; dark slit; ivory teeth */
    maw:0x2a0a06, nostril:0x1c0904, glow:0xffb347,                    /* dark maw; nostril; pre-breath ember glow */
    disc:0x463f34, discTop:0x554d40,
  };

  /* ======================================================================================
     LANDMARKS. Front = +z (head + chest face +z, the direction the game-dimetric cam favours);
     back/hips = -z. Shoulder hump sits high near the fore-body; the chest is deep and forward,
     thrust out for the roar.
     ====================================================================================== */
  const shY = 1.02;                        /* shoulder-line spine height (top of the hump) */
  const S = {
    rump:  V(0, 0.98, -0.60),              /* high coiled haunch, well back */
    loin:  V(0, 0.94, -0.34),
    back:  V(0, 1.00, -0.06),              /* mid back */
    hump:  V(0, shY+0.05, 0.16),           /* SHOULDER HUMP — the top of the deep chest, raised */
    chest: V(0, 0.90, 0.34),              /* deep chest, forward + a touch lower, thrust out */
    breast:V(0, 0.74, 0.44),              /* lower breast where the neck springs up */
  };

  /* ======================================================================================
     BODY — one horizontal loft along the spine samples above. Deep chest, tucked loin, a raised
     shoulder hump. Cross-sections wider-than-... actually taller-and-deep (a barrel chest). The
     hump band is lifted + fattened. Belly verts get a pale plate tone below. Diamond scale
     accents get scattered as a second pass on the flanks.
     ====================================================================================== */
  {
    const n=8, ph=Math.PI/n;
    /* chained tubes down the spine so the trunk can arc (hump up, breast down-forward). */
    tube(S.rump,  S.loin,  0.215, 0.250, n, P.hideDk, {phase:ph, capA:{hex:P.hideDk, lift:0.02}});
    tube(S.loin,  S.back,  0.250, 0.280, n, P.hide,   {phase:ph});
    tube(S.back,  S.hump,  0.280, 0.300, n, P.hide,   {phase:ph});   /* rising into the hump */
    tube(S.hump,  S.chest, 0.300, 0.255, n, P.hide,   {phase:ph});   /* deep chest, forward + down */
    tube(S.chest, S.breast,0.255, 0.150, n, P.hideMoss,{phase:ph});  /* narrowing to the neck spring */

    /* BRISKET / UNDERBELLY — a SOLID ventral loft that CLOSES the barrel underside so no hollow
       shows through between the leg pairs (iter-3 left a see-through cavity there). A chain of
       belly rings hangs below the spine loft along the ventral midline, each ring's TOP tucked up
       into the body and BOTTOM forming the rounded belly floor; the down-facing verts are pale
       scutes, the up-facing tuck is dark hide. This is a real closed surface, not a floating plate. */
    {
      const bn=8, bph=Math.PI/bn;
      /* belly cross-sections in the x-y plane (axis +z), hung along the ventral midline breast→loin */
      const rings2=[
        {y:0.80, z:0.46, rx:0.16, ry:0.12}, {y:0.71, z:0.28, rx:0.24, ry:0.15},
        {y:0.69, z:0.06, rx:0.27, ry:0.16}, {y:0.71, z:-0.16, rx:0.25, ry:0.15},
        {y:0.77, z:-0.38, rx:0.20, ry:0.13},
      ].map(b=> ring(V(0, b.y, b.z), V(0,0,1), b.rx, b.ry, bn, bph));
      const colFn=(band,i)=>{
        const rng=rings2[band], ys=rng.map(v=>v.y), minY=Math.min(...ys), maxY=Math.max(...ys);
        const isBelly=(rng[i].y - minY) < (maxY-minY)*0.5;
        return isBelly ? (band%2===0?P.belly:P.bellyDk) : P.hideMoss;
      };
      stitch(rings2, colFn);
      capFan(rings2[0], V(0,0.80,0.52), P.hideMoss);
      capFan(rings2[rings2.length-1], V(0,0.78,-0.44), P.hideMoss, true);
    }
    /* a few cross-ridges on the belly floor (scute segmentation) */
    for(const z of [0.30, 0.10, -0.10, -0.28]){
      quad(V(-0.16,0.548,z+0.015), V(0.16,0.548,z+0.015), V(0.16,0.540,z-0.015), V(-0.16,0.540,z-0.015), P.bellyDk, 0.03);
    }

    /* DIAMOND SCALE ACCENTS — small dark diamond quads scattered on the flanks + haunches (both
       sides), proud of the hide surface, for scaly texture without a full displacement build. */
    const diamond=(cx,cy,cz,s,sz)=>{
      const o=0.004; /* proud of the surface */
      quad(V(cx-sz*0.5, cy, cz+o*s), V(cx, cy+sz*0.5, cz+o*s), V(cx+sz*0.5, cy, cz+o*s), V(cx, cy-sz*0.5, cz+o*s), P.scale, 0.05);
    };
    for(const s of [-1,1]){
      diamond(s*0.29, 0.99, -0.02, s, 0.10);
      diamond(s*0.30, 0.86,  0.14, s, 0.09);
      diamond(s*0.28, 1.08,  0.10, s, 0.08);
      diamond(s*0.25, 0.90, -0.30, s, 0.10);
      diamond(s*0.27, 1.02, -0.34, s, 0.08);
    }
  }

  /* ======================================================================================
     NECK — a long S-curve from the breast that sweeps BACK over the hump/wing-roots (the wind-up
     coil for the roar), then swings the head end forward again so the reared-back head still reads
     toward the game-dimetric camera. Authored as a swept path of ring cross-sections (snake rise
     technique): every segment keeps a healthy z-offset so the axis stays diagonal and the ring
     frame never pinches.
     ====================================================================================== */
  const neckPath = [
    { p:V(0, 0.80, 0.46), r:0.155 },   /* neck root at the breast, thrust forward */
    { p:V(0, 1.06, 0.46), r:0.142 },   /* rises off the chest wall */
    { p:V(0, 1.34, 0.30), r:0.128 },   /* begins sweeping BACK */
    { p:V(0, 1.62, 0.02), r:0.114 },   /* continues back, over the hump */
    { p:V(0, 1.86,-0.22), r:0.100 },   /* arch crest — well back over the wing roots (the coil) */
    { p:V(0, 2.00,-0.30), r:0.092 },   /* upper neck, rearing */
    { p:V(0, 2.10,-0.18), r:0.086 },   /* head end — reared UP and swinging back toward +z (roar) */
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
      const rx=cur.r*0.96, rz=cur.r*1.04;   /* a touch deeper than wide */
      rings.push(ring(cur.p, axis, rx, rz, NSEG, Math.PI/NSEG));
    }
    /* dorsal darker / ventral (belly) paler per ring */
    const colFn=(b,i)=>{
      const rng=rings[b], ys=rng.map(v=>v.y), minY=Math.min(...ys), maxY=Math.max(...ys);
      const isBelly=(rng[i].y - minY) < (maxY-minY)*0.34;
      return isBelly ? P.bellyDk : (b>=4 ? P.hideMoss : P.hide);
    };
    stitch(rings, colFn);
    capFan(rings[0], neckPath[0].p.clone().add(V(0,-0.02,-0.02)), P.hideMoss, true);
    neckEnd = neckPath[neckPath.length-1].p;
    neckAxis = new THREE.Vector3().subVectors(neckEnd, neckPath[neckPath.length-2].p).normalize();
  }

  /* ======================================================================================
     HEAD — a wedge skull reared up (~2.0-2.3u), built in a local frame off the neck axis (which
     now points up-and-forward, the reared-back roar angle). Layered brow ridges over amber slit
     eyes; a WIDE-parted toothed maw with a bright ember-glow at the throat (the pre-breath tell);
     twin swept-back horns + 2-3 cheek spikes; nostril hints.
     ====================================================================================== */
  {
    const fwd=neckAxis.clone();                                        /* head points along the neck */
    const side=new THREE.Vector3().crossVectors(V(0,1,0), fwd).normalize();
    const up=new THREE.Vector3().crossVectors(fwd, side).normalize();
    const HC=neckEnd.clone().addScaledVector(fwd, 0.10);               /* head center out along the neck */

    const seg=(along, offUp=0)=> HC.clone().addScaledVector(fwd, along).addScaledVector(up, offUp);
    const ell=(c,w,h,n=8)=>{ const pts=[];
      for(let k=0;k<n;k++){ const a=Math.PI/n + k/n*Math.PI*2;
        pts.push(c.clone().addScaledVector(side, Math.cos(a)*w).addScaledVector(up, Math.sin(a)*h)); }
      return pts; };

    /* skull loft: neck-join → heavy brow (widest+tallest) → cheek → muzzle base. */
    const rJoin = ell(seg(-0.10,  0.00), 0.098, 0.090);
    const rSkull= ell(seg(-0.02,  0.02), 0.128, 0.110);   /* cranium */
    const rBrow = ell(seg( 0.05,  0.03), 0.140, 0.096);   /* BROW RIDGE — widest, hooding the eyes */
    const rCheek= ell(seg( 0.12, -0.01), 0.120, 0.082);   /* cheeks, narrowing */
    const rMuz  = ell(seg( 0.20, -0.03), 0.086, 0.062);   /* muzzle base */
    stitch([rJoin, rSkull, rBrow, rCheek, rMuz],
      (b)=> b===2 ? P.hide : (b===0? P.hideMoss : P.hide));
    capFan(rJoin, seg(-0.14, -0.01), P.hideMoss, true);   /* close the neck-join back */

    /* MUZZLE — a forward wedge from the muzzle-base ring, WIDE-parted into an UPPER and LOWER jaw
       (mid-roar) with a dark maw + a bright ember-glow + ivory teeth between them. The lower jaw
       drops much further than a resting bite (roar/pre-breath, not a closed snout). */
    /* upper jaw wedge */
    const uB=ell(seg(0.22, 0.005), 0.082, 0.056), uM=ell(seg(0.31, 0.02), 0.062, 0.040), uT=ell(seg(0.39, 0.03), 0.034, 0.024);
    stitch([uB,uM,uT], ()=>P.hide);
    capFan(uT, seg(0.44, 0.035), P.hideMoss);
    /* lower jaw wedge — dropped WIDE OPEN (roar), hinges well below the upper */
    const lB=ell(seg(0.22,-0.115), 0.070, 0.044), lM=ell(seg(0.29,-0.165), 0.052, 0.032), lT=ell(seg(0.35,-0.195), 0.030, 0.020);
    stitch([lB,lM,lT], ()=>P.hideMoss);
    capFan(lT, seg(0.39,-0.205), P.bellyDk);
    /* dark maw gash between the wide-open jaws */
    {
      const m0=seg(0.24, 0.010), m1=seg(0.33,-0.150);
      quad(m0.clone().addScaledVector(side,0.058), m1.clone().addScaledVector(side,0.040),
           m1.clone().addScaledVector(side,-0.040), m0.clone().addScaledVector(side,-0.058), P.maw, 0.02);
    }
    /* PRE-BREATH EMBER GLOW — the loud warm accent, in the open throat (the value-contrast law: one
       high-value zone ON the signature). PASS-2 CRITIC FIX: r1 sized this at 0.048 (barely over the
       0.04u feature floor) and tucked it at along=0.28 — at 1/3-res + dither it dissolved to nothing;
       the render's brightest warm zone ended up being the incidental belly patch instead of the
       signature. Bumped near 2x bigger (still cheap — a blob's radius doesn't add tris) and moved
       forward/centered in the jaw gap (along 0.28->0.30, offUp -0.075->-0.06) so it sits in the mouth
       OPENING instead of deep in the throat, where the dimetric camera can actually see it. */
    blob(...seg(0.30,-0.06).toArray(), 0.09, 0.085, 0.09, P.glow, 6, 3);
    /* teeth — a row of small ivory fangs along the upper gum line, pointing down into the wide gap */
    for(const s of [-1,1]){
      for(const [along,w,h] of [[0.25,0.011,0.038],[0.29,0.010,0.032],[0.33,0.009,0.024]]){
        const g=seg(along,-0.010).addScaledVector(side, s*(w+0.032));
        const t=seg(along,-0.010-h).addScaledVector(side, s*(w+0.030));
        quad(g.clone().addScaledVector(side,-w), g.clone().addScaledVector(side,w), t, t, P.teeth, 0.02);
      }
    }
    /* a couple of lower fangs too, jutting up from the dropped jaw */
    for(const s of [-1,1]){
      const g=seg(0.27,-0.150).addScaledVector(side, s*0.040);
      const t=seg(0.27,-0.115).addScaledVector(side, s*0.038);
      quad(g.clone().addScaledVector(side,-0.008), g.clone().addScaledVector(side,0.008), t, t, P.teeth, 0.02);
    }

    /* BROW RIDGES — layered: two heavy ridge quads over each eye, stacked, jutting forward+up. */
    for(const s of [-1,1]){
      const b0=seg(0.055,0.020).addScaledVector(side, s*0.070);
      const b1=seg(0.115,0.055).addScaledVector(side, s*0.115);
      const b2=seg(0.145,0.020).addScaledVector(side, s*0.100);
      quad(b0, b1, b2, b2, P.hideDk, 0.05);                          /* upper brow ledge */
      const c0=seg(0.075,-0.010).addScaledVector(side, s*0.095);
      const c1=seg(0.120,0.020).addScaledVector(side, s*0.128);
      const c2=seg(0.150,-0.020).addScaledVector(side, s*0.108);
      quad(c0, c1, c2, c2, P.hideMoss, 0.05);                        /* lower brow shelf */
    }
    /* NOSTRIL HINTS — two small dark dots near the muzzle tip, on the top of the upper jaw. */
    for(const s of [-1,1]){
      const nc=seg(0.36,0.048).addScaledVector(side, s*0.026);
      quad(nc.clone().addScaledVector(side,-0.010).addScaledVector(fwd,-0.008),
           nc.clone().addScaledVector(side, 0.010).addScaledVector(fwd,-0.008),
           nc.clone().addScaledVector(side, 0.008).addScaledVector(fwd, 0.008),
           nc.clone().addScaledVector(side,-0.008).addScaledVector(fwd, 0.008), P.nostril, 0.0);
    }

    /* TWIN HORNS — two swept-back horns from the rear of the skull, a tapering tube chain curving
       back (-along) + out + a touch up, tips levelling off. */
    for(const s of [-1,1]){
      const h0=HC.clone().addScaledVector(fwd,-0.06).addScaledVector(side, s*0.088).addScaledVector(up, 0.070);
      const h1=h0.clone().addScaledVector(fwd,-0.16).addScaledVector(side, s*0.040).addScaledVector(up, 0.070);
      const h2=h1.clone().addScaledVector(fwd,-0.20).addScaledVector(side, s*0.020).addScaledVector(up, 0.010);
      const h3=h2.clone().addScaledVector(fwd,-0.16).addScaledVector(side, s*0.010).addScaledVector(up,-0.030);
      tube(h0,h1,0.040,0.030,6,P.horn,{capA:{hex:P.hideDk}});
      tube(h1,h2,0.030,0.020,6,P.horn);
      tube(h2,h3,0.020,0.008,6,P.hornTip,{capB:{hex:P.hornTip, lift:0.01}});
    }
    /* CHEEK SPIKES — 2-3 smaller keratin spikes jutting back+out from the jaw/cheek each side. */
    for(const s of [-1,1]){
      const specs=[[0.02,-0.02,0.10],[ -0.02,-0.06,0.12],[0.06,0.02,0.09]];
      for(const [along,offU,outS] of specs){
        const a=HC.clone().addScaledVector(fwd,along).addScaledVector(side, s*outS).addScaledVector(up, offU);
        const b=a.clone().addScaledVector(fwd,-0.09).addScaledVector(side, s*0.045).addScaledVector(up,-0.010);
        tube(a,b,0.020,0.005,5,P.horn,{capB:{hex:P.hornTip, lift:0.008}});
      }
    }
  }

  /* ======================================================================================
     SPINAL RIDGE — a row of small back-plates (upright diamond/triangle quads) marching down the
     dorsal midline from the skull, along the neck, over the hump + back, to the tail (tail plates
     added inside the tail block). Each plate straddles the top of the body at its z.
     ====================================================================================== */
  {
    const plate=(y,z,h,w)=>{
      quad(V(-w, y, z+0.02), V(w, y, z+0.02), V(0, y+h, z), V(0, y+h, z), P.ridge, 0.05);
      quad(V(-w, y, z-0.02), V(w, y, z-0.02), V(0, y+h, z), V(0, y+h, z), P.ridgeLt, 0.05);
    };
    /* neck plates (follow the neck path tops) */
    for(const s of neckPath){ plate(s.p.y + s.r*0.9, s.p.z, 0.055, 0.022); }
    /* body plates along the back (hump → rump) */
    const bodyPlates=[[shY+0.34,0.16,0.075],[shY+0.30,-0.02,0.070],[shY+0.24,-0.20,0.060],[shY+0.18,-0.40,0.052],[shY+0.10,-0.58,0.044]];
    for(const [y,z,h] of bodyPlates){ plate(y, z, h, 0.028); }
  }

  /* ======================================================================================
     WINGS — HALF-FLARED with dihedral (bat/gargoyle spar+membrane, ANATOMY-CANON WINGED family).
     Rooted at the shoulders behind the hump. A strong shoulder→elbow→wrist leading spar built as
     real tube geometry FIRST, then 4 finger spars fan WIDE, lifted with dihedral and forward-
     cupped (the "caught air" read) with membrane quads fully between them — the trailing edge
     scallops naturally from the fan spacing. Symmetric, thrown open around the roaring head.
     ====================================================================================== */
  const WSH = V(0, shY+0.10, -0.02);       /* wing root, behind/above the shoulder hump */
  function wing(s){
    const arm=P.hideDk;
    /* Leading-edge arm bones: shoulder → ELBOW (up+out) → WRIST held HIGH + WIDE — the wrist is
       the apex of the half-flared wing, from which the finger-spar fan opens with dihedral. */
    const EL = V(s*0.34, WSH.y+0.40, WSH.z-0.06);
    const WR = V(s*0.68, WSH.y+0.74, WSH.z-0.10);
    tube(WSH, EL, 0.076, 0.054, 6, arm, {capA:{hex:P.hide}});   /* upper arm bone (leading-edge spar) */
    tube(EL, WR, 0.054, 0.038, 6, arm);                          /* forearm to the wrist */
    /* thumb claw hook at the wrist apex (the clawed wing-finger, up-front) */
    tube(WR, V(WR.x+s*0.06, WR.y+0.14, WR.z+0.06), 0.020, 0.006, 5, P.spar, {capB:{hex:P.claw, lift:0.01}});
    /* FOUR FINGER SPARS radiating from the wrist in a WIDE, LIFTED FAN (half-flared, dihedral).
       #1 leading sweeps up-and-forward (the arch crest, cupping air toward the viewer), #2/#3
       reach OUT and slightly up (dihedral — never drooping level), #4 trailing drops back to the
       low corner but stays clear of the ground. Wide tip spread + the up-lift is what reads as
       "thrown open," distinct from the old folded-lifted rig. */
    const F = [
      V(WR.x + s*0.30, WR.y+0.42, WR.z+0.34),   /* #1 leading — up + far forward (arch crest, cupped) */
      V(WR.x + s*0.62, WR.y+0.26, WR.z+0.14),   /* #2 — up-out, dihedral */
      V(WR.x + s*0.82, WR.y+0.02, WR.z-0.12),   /* #3 — out + level (widest reach) */
      V(WR.x + s*0.66, WR.y-0.28, WR.z-0.46),   /* #4 trailing — down-back (low sail corner) */
    ];
    for(const f of F) tube(WR, f, 0.026, 0.007, 5, P.spar, {capB:{hex:P.claw, lift:0.012}});
    /* membrane roots hem the sail back to the body (shoulder fore + flank aft) so it reads attached. */
    const ROOTFORE = V(s*0.14, shY+0.16, WSH.z+0.06);        /* up at the shoulder */
    const ROOTAFT  = V(s*0.12, shY-0.14, WSH.z-0.26);        /* down at the flank/back */
    /* MEMBRANE CELLS — one web panel per consecutive spar pair, hemmed to the body at the ends, so
       the whole surface between wrist / all four finger tips / body is filled. Front pass (mid
       ember-red) + a paler dipped back pass (lit underside — the warm signature colour). Each bay
       gets a DROOP vertex pulled back toward the wrist + sagged down between the two bounding tips
       (never a taut straight chord) so the trailing edge reads as a row of CONCAVE scallops, not
       the banned flat-sheet failure mode (ANATOMY-CANON WINGED #1). */
    const bays = [ [ROOTFORE, F[0]], [F[0], F[1]], [F[1], F[2]], [F[2], F[3]], [F[3], ROOTAFT] ];
    for(const [b,c] of bays){
      const droop = b.clone().add(c).multiplyScalar(0.5).lerp(WR, 0.32).add(V(0,-0.055,0));
      quad(WR, b, droop, droop, P.membrane, 0.05);                                    /* outer bay, half A */
      quad(WR, droop, c, c, P.membrane, 0.05);                                        /* outer bay, half B */
      const dz=V(0,-0.012,0);
      quad(WR.clone().add(dz), droop.clone().add(dz), b.clone().add(dz), b.clone().add(dz), P.membraneLt, 0.05); /* lit underside, half A */
      quad(WR.clone().add(dz), c.clone().add(dz), droop.clone().add(dz), droop.clone().add(dz), P.membraneLt, 0.05); /* lit underside, half B */
    }
    /* darker membrane-vein quads along a couple of spars (wing depth read) */
    quad(WR, F[1], F[1].clone().add(V(-s*0.02,-0.03,0)), WR.clone().add(V(-s*0.02,-0.03,0)), P.membraneDk, 0.03);
    quad(WR, F[3], F[3].clone().add(V(0,0.03,0.02)), WR.clone().add(V(0,0.03,0.02)), P.membraneDk, 0.03);
  }
  wing(+1);
  wing(-1);

  /* ======================================================================================
     LEGS — FOUR, digitigrade + clawed, all four feet grounded on the disc. FRONT pair more
     upright + forward (weight-bearing under the deep chest); REAR haunches coiled + heavy (the
     wolf big-haunch technique). Each: thick upper (haunch/shoulder) → slim shank → clawed foot.
     ====================================================================================== */
  {
    const GROUND=0.075;   /* foot pads rest here, on the disc top */
    const leg=(hip, kneeXZ, footX, footZ, rear)=>{
      const upR  = rear ? 0.150 : 0.115;    /* rear haunch is much fatter */
      const midR = rear ? 0.090 : 0.070;
      const kneeY= rear ? 0.58 : 0.52;
      const knee = V(kneeXZ.x, kneeY, kneeXZ.z);
      const ankle= V(footX*0.92, 0.22, footZ*0.94);
      const foot = V(footX, GROUND+0.03, footZ);
      tube(hip, knee, upR, midR, 6, rear?P.hideDk:P.hide);            /* thick upper */
      if(rear) blob(knee.x,knee.y,knee.z, 0.11,0.10,0.10, P.hideDk, 6, 4);  /* coiled haunch mass */
      tube(knee, ankle, 0.060, 0.048, 6, P.hideMoss);                 /* slim shank */
      tube(ankle, foot, 0.052, 0.048, 6, P.hideDk, {capB:{hex:P.hideDk, lift:0.006}});  /* pastern */
      /* three clawed toes fanning forward onto the disc (front toes; a back dew-claw) */
      for(const tx of [-0.045,0,0.045]){
        const toeA=V(foot.x+tx*0.5, GROUND+0.01, foot.z);
        const toeB=V(foot.x+tx, GROUND, foot.z+0.11);
        tube(toeA, toeB, 0.024,0.010,4,P.hideMoss,{capB:{hex:P.claw, lift:0.012}});   /* pale-ivory talon */
      }
      tube(foot, V(foot.x, GROUND, foot.z-0.07), 0.018,0.008,4,P.hideDk,{capB:{hex:P.claw, lift:0.008}});  /* dew-claw back */
    };
    /* FRONT legs — upright + forward, under the deep chest (z ~ +0.30), braced for the breath. */
    leg(V(-0.20, 0.86, 0.30), V(-0.26,0,0.34), -0.28, 0.42, false);
    leg(V( 0.20, 0.86, 0.30), V( 0.26,0,0.34),  0.28, 0.42, false);
    /* REAR legs — coiled heavy haunches, feet planted wide + back (z ~ -0.40). */
    leg(V(-0.22, 0.92, -0.46), V(-0.34,0,-0.30), -0.36, -0.34, true);
    leg(V( 0.22, 0.92, -0.46), V( 0.34,0,-0.30),  0.36, -0.34, true);
  }

  /* ======================================================================================
     TAIL — a heavy tapering tail rooted at the HIP (low + behind the rump, clear of the rear legs)
     sweeping AROUND the disc edge in a partial coil (snake curve technique), ending in a spade/ridge
     tip. Kept well outboard of the rear feet so it doesn't cross a leg in back view.
     ====================================================================================== */
  {
    const root = V(0.06, 0.90, -0.66);      /* at the rump, low + behind the body */
    const t1   = V(0.34, 0.78, -0.70);      /* swings OUT to +x early + WIDE of the right rear foot */
    const t2   = V(0.58, 0.58, -0.54);      /* clearly outboard (right foot at x~0.36) */
    const t3   = V(0.66, 0.40, -0.28);      /* curls around the disc edge toward +z */
    const t4   = V(0.62, 0.26,  0.04);
    const t5   = V(0.50, 0.16,  0.30);
    const tip  = V(0.34, 0.115, 0.46);      /* spade tip resting on the disc, curling toward the front */
    tube(root, t1, 0.165, 0.140, 8, P.hideDk, {phase:Math.PI/8, capA:{hex:P.hideDk, lift:0.02}});
    tube(t1,   t2, 0.140, 0.112, 8, P.hide,   {phase:Math.PI/8});
    tube(t2,   t3, 0.112, 0.084, 8, P.hide,   {phase:Math.PI/8});
    tube(t3,   t4, 0.084, 0.058, 8, P.hideMoss,{phase:Math.PI/8});
    tube(t4,   t5, 0.058, 0.036, 8, P.hideMoss,{phase:Math.PI/8});
    tube(t5,   tip,0.036, 0.018, 8, P.hideDk, {phase:Math.PI/8, capB:{hex:P.hideDk, lift:0.008}});
    /* SPADE TIP — two flat fin quads flaring off the last segment (a ridged spade). */
    {
      const a=t5, b=tip, dir=new THREE.Vector3().subVectors(tip,t5).normalize();
      const sideV=new THREE.Vector3().crossVectors(V(0,1,0),dir).normalize();
      quad(b.clone().addScaledVector(sideV,0.06), b.clone().addScaledVector(dir,0.10),
           b.clone().addScaledVector(sideV,-0.06), b.clone().addScaledVector(V(0,1,0),0.06), P.ridge, 0.04);
      quad(a.clone().addScaledVector(V(0,1,0),0.02), b.clone().addScaledVector(V(0,1,0),0.10),
           b.clone().addScaledVector(dir,0.06), a.clone().addScaledVector(dir,0.04), P.ridgeLt, 0.04);
    }
    /* tail spinal plates — small ridge plates riding the top of the tail curve */
    const tailPts=[t1,t2,t3,t4,t5];
    for(let i=0;i<tailPts.length;i++){
      const pt=tailPts[i], h=0.05*(1-i*0.14);
      quad(pt.clone().add(V(-0.03,0,0.03)), pt.clone().add(V(0.03,0,0.03)),
           pt.clone().add(V(0,h,0)), pt.clone().add(V(0,h,0)), P.ridge, 0.05);
    }
  }

  /* ======================================================================================
     BASE DISC — LARGE-plus: r=0.62 (commands the square). Shared style.
     ====================================================================================== */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.62, 0.62, 20);
    const r2=ring(V(0,0.058,0), V(0,1,0), 0.60, 0.60, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.060,0), P.discTop);
  }
}
