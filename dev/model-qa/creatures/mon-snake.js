/* dev/model-qa/creatures/mon-snake.js — GIANT CONSTRICTOR SNAKE landmark table (SERPENTINE family,
   Huge, CR 2, realm core), REBUILT under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (2026-07-08 foundry pilot, rebuild-w3 cell 5). Flavor: 18 instances + the whole naga/couatl
   line — the big crusher. Preserves the prior pass's palette intent (olive-brown dorsal, dark
   diamond banding, pale belly) and its "coil stack + raised strike head" signature; the geometry
   is rebuilt for the strike-rise pose (TWO stacked coils, front third lifted in an S, jaw agape
   showing fangs) instead of the old spiral-in coil + closed snout.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. SERPENTINE body per ANATOMY-CANON — one continuous tapered D-cross-section tube,
        near-constant girth through the front two-thirds, late taper to a fine tail tip (never a
        carrot cone), authored pre-coiled on the disc.
     2. TWO STACKED COILS — an outer ground loop with an inner loop resting ON TOP of it (offset
        up), so the coil reads as a stack, not a flat spiral.
     3. STRIKE-RISE — the front third peels off the coil stack in a clear S-curve, climbing well
        above the coils before the head, the whole fore-body coiled back then thrust up (the
        pre-strike load, not a lazy lean).
     4. SIGNATURE — the pale belly-scale ladder (high-value law-3 zone) running the FULL tube,
        coil to jaw, set against the dark olive/diamond dorsal so it reads as one long light seam.
     5. Jaw AGAPE — head thrown open at a wide hinge angle with two curved fangs jutting from the
        upper jaw and a dark open gullet, the strike-about-to-land expression (law 5), replacing
        the prior closed-mouth/tongue-only head.
     6. Amber slit eyes + a subtle flattened hood flare behind the jaw hinge (naga/couatl-line
        tell, kept from the prior pass).

   POSE SENTENCE: coiled in two stacked ground loops, the front third rears up in a taut S and
   flings the jaw wide with fangs bared — the instant before the strike lands, not a resting coil.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z, up +y, ground
   y=0. Imported by ps1-sheet.html (SETS['rebuild-w3'], cell 5, fn buildGiantSnake). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGiantSnake(){
  /* ---------- PALETTE (VS desaturated — olive-brown back, pale belly, dark diamond banding;
     carried over from the prior pass, belly pushed brighter so the ladder pops at 1/3-res). ---------- */
  const P = {
    body:0x6a6338, bodyDk:0x4c4728, bodyLt:0x7c7446,        /* olive-brown dorsal */
    diamond:0x2f2c18, diamondLt:0x40361c,                    /* dark diamond-back banding */
    belly:0xd8cca0, bellyDk:0xb0a67c,                        /* pale underside ladder — the signature, near-white */
    headTop:0x5e5730, headLt:0x726a3c,                       /* wedge head slightly darker/warmer */
    hood:0x54502c,                                           /* flared hood hint */
    eye:0xd89a24, eyeDk:0x1a140a,                            /* amber eye + slit */
    mouth:0x1c1410, gullet:0x120a0a, fang:0xe8dfc4,          /* dark maw, near-black gullet, pale fangs */
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- THE SPINE PATH — one continuous centerline, sampled densely.
     Two stacked ground loops (outer ring, inner ring resting ON TOP of the outer — offset up in
     y, not spiraling flat-in), then the fore-body peels up off the inner loop into an S-curve
     rise ending at the agape head. ---------- */
  const path = [];   /* {p:Vector3, r:radius, t:0..1 along body (for banding)} */

  const TAIL_R = 0.032, MID_R = 0.155, NECK_R = 0.135;
  const OUTER_Y = 0.115, INNER_Y = 0.225;   /* inner loop stacked ABOVE the outer — the coil-stack read */

  /* --- Outer ground loop: tail tip to ~3/4 around, thickening toward mid-body. --- */
  const OUTER_SAMP = 26;
  const outerTurn = 1.02 * Math.PI * 2;      /* a touch over one loop so the ends overlap for the stack join */
  const outerStart = Math.PI * 0.10;
  const rOuter = 0.545;
  for(let i=0;i<=OUTER_SAMP;i++){
    const f = i/OUTER_SAMP;
    const ang = outerStart + f*outerTurn;
    const thick = TAIL_R + (MID_R-TAIL_R)*Math.min(1, f*1.25);
    /* the loop isn't a perfect circle — pinched slightly on the -z side so the inner loop has
       room to rest on top without perfectly concentric rings (reads as coiled, not turned lathe) */
    const rad = rOuter - 0.05*Math.sin(ang*0.5);
    path.push({ p:V(Math.cos(ang)*rad, OUTER_Y + f*0.02, Math.sin(ang)*rad), r:thick, t:f*0.30 });
  }

  /* --- Inner ground loop: rests ON TOP of the outer loop (higher y, smaller radius), thickening
     to peak mid-body girth, then handing off to the rise. --- */
  const INNER_SAMP = 24;
  const innerTurn = 0.92 * Math.PI * 2;
  const lastOuter = path[path.length-1];
  const innerStart = Math.atan2(lastOuter.p.z, lastOuter.p.x) + 0.10;
  const rInner = 0.330;
  for(let i=0;i<=INNER_SAMP;i++){
    const f = i/INNER_SAMP;
    const ang = innerStart + f*innerTurn;
    const thick = MID_R * (0.86 + 0.14*Math.sin(f*Math.PI));   /* peaks mid-loop, the heaviest part of the body */
    const rad = rInner - 0.03*Math.cos(ang*0.7);
    path.push({ p:V(Math.cos(ang)*rad, INNER_Y + f*0.05, Math.sin(ang)*rad), r:thick, t:0.30 + f*0.30 });
  }

  /* --- Rising fore-body: peels up off the inner loop's end in a taut S toward the agape head.
     Stays diagonal (never near-vertical) so the swept ring frame doesn't snap into an hourglass
     twist; the neck bows back (-z) then thrusts forward (+z) into the strike. --- */
  const lastInner = path[path.length-1].p;
  const RISE_KEY = [
    { p:V(lastInner.x*0.80, INNER_Y+0.09, lastInner.z*0.80 - 0.07), r:MID_R*1.00, t:0.61 },
    { p:V(lastInner.x*0.50, INNER_Y+0.24, lastInner.z*0.50 - 0.15), r:MID_R*0.96, t:0.66 },
    { p:V(0.16,             INNER_Y+0.46, -0.34),                    r:MID_R*0.90, t:0.73 },  /* leans back, belly of the S — pushed further for a real read */
    { p:V(0.07,             INNER_Y+0.70, -0.42),                    r:NECK_R*1.05, t:0.80 },  /* furthest back (-z), coiled load */
    { p:V(-0.03,            INNER_Y+0.92, -0.22),                    r:NECK_R*0.98, t:0.87 },  /* neck drives forward again — the fore-swing of the S */
    { p:V(-0.05,            INNER_Y+1.08, 0.06),                     r:NECK_R*0.90, t:0.93 },  /* upper neck — thrusting toward strike, stays thick (muscled, not a post) */
    { p:V(-0.05,            INNER_Y+1.16, 0.22),                     r:NECK_R*0.80, t:0.98 },  /* base of head, out past the coil, low+forward */
  ];
  /* PASS-2 FIX: densify the rise via lerp so (a) the swept tube's S-curve reads as a smooth
     bend instead of a near-straight thin post between sparse keyframes, and (b) the belly-ladder
     patches below (which now ride every rise sample) chain into a continuous seam instead of
     scattered dots — the r4 render showed both failures: a flagpole-thin neck and 1-2 isolated
     floating rungs instead of the "full tube" signature ladder. */
  const RISE = [];
  const RISE_SUB = 2;
  for(let k=0;k<RISE_KEY.length;k++){
    RISE.push(RISE_KEY[k]);
    if(k < RISE_KEY.length-1){
      const a = RISE_KEY[k], b = RISE_KEY[k+1];
      for(let s=1;s<=RISE_SUB;s++){
        const f = s/(RISE_SUB+1);
        RISE.push({
          p:V(a.p.x+(b.p.x-a.p.x)*f, a.p.y+(b.p.y-a.p.y)*f, a.p.z+(b.p.z-a.p.z)*f),
          r:a.r+(b.r-a.r)*f, t:a.t+(b.t-a.t)*f
        });
      }
    }
  }
  for(const s of RISE) path.push(s);

  /* ---------- LOFT THE BODY — ring cross-sections along the path, stitched.
     D cross-section: wider (rx) than tall (rz slightly less), flat-ish belly underside where the
     pale ladder rides. Banding: alternating dark diamond segments over the olive dorsal. ---------- */
  const NSEG = 8;
  let rings;
  {
    rings = [];
    for(let i=0;i<path.length;i++){
      const cur = path[i];
      const nxt = path[Math.min(i+1, path.length-1)].p;
      const prv = path[Math.max(i-1, 0)].p;
      const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
      const rx = cur.r * 1.05, rz = cur.r * 0.92;
      rings.push(ring(cur.p, axis, rx, rz, NSEG, Math.PI/NSEG));
    }
    const colFn = (b, i) => {
      const t = path[b].t;
      const band = Math.floor(t * 22) % 2 === 0;
      const rng = rings[b];
      const ys = rng.map(v=>v.y);
      const minY = Math.min(...ys);
      const isBelly = (rng[i].y - minY) < (Math.max(...ys)-minY)*0.30;
      if(isBelly) return band ? P.bellyDk : P.belly;          /* pale belly ladder — the full-tube signature */
      return band ? P.diamond : P.body;                        /* dark diamond vs olive dorsal */
    };
    stitch(rings, colFn);
    capFan(rings[0], path[0].p.clone(), P.bodyDk, true);
  }

  /* R2 SELF-CORRECTION (post r1 engine render): the r1 capture showed the belly ladder reading
     fine on the flat-ish ground coils but the rising neck column (near-vertical axis, key light
     at (5,9,7)) sampled near-black at (400,400)/(390,420) — the ring's own lowest-y vert stops
     correlating with the LIT face once the tube axis tips toward vertical, so colFn's belly
     detection silently drops out exactly where the S-rise needs the ladder most. Fixed with
     explicit proud patches offset toward the key-light direction (the same "surface-riding
     patch" trick used on rlm-gloom-yuan-ti-abomination.js) at every rise sample plus every third
     coil sample, so the pale ladder survives regardless of local ring geometry. */
  {
    /* R3 SELF-CORRECTION (post r2 engine render): r2's patches were too large/proud (floating
       white shards). R3 pulled the offset in to 0.55x radius to fix that — but that buried them
       INSIDE the loft's own surface (rings sit at ~1.0x radius), so they vanished entirely
       (identical render to r1). R4: offset back OUT to just past the surface (0.99x — riding
       proud by a hair, not floating), patch kept small (a slim rung, not a shard). */
    const LIGHT = new THREE.Vector3(5,9,7).normalize();
    const beltPatch = (center, axis, r, hex) => {
      const perp = LIGHT.clone().addScaledVector(axis, -LIGHT.dot(axis));
      if(perp.lengthSq() < 1e-6) perp.set(1,0,0); else perp.normalize();
      const upv = new THREE.Vector3().crossVectors(axis, perp).normalize();
      const p = center.clone().addScaledVector(perp, r*0.99);
      const w = r*0.40, h = r*0.62;   /* PASS-2: taller rung so adjacent rise samples overlap into one ladder */
      quad(
        p.clone().addScaledVector(upv,-w).addScaledVector(axis,-h*0.45),
        p.clone().addScaledVector(upv, w).addScaledVector(axis,-h*0.45),
        p.clone().addScaledVector(upv, w*0.65).addScaledVector(axis, h*0.60),
        p.clone().addScaledVector(upv,-w*0.65).addScaledVector(axis, h*0.60),
        hex, 0.03
      );
    };
    const riseFrom = OUTER_SAMP+1+INNER_SAMP+1;
    for(let i=0;i<path.length;i++){
      const isRise = i >= riseFrom;
      if(!isRise && (i % 5 !== 0)) continue;                      /* every 5th coil sample */
      /* PASS-2 FIX: every rise sample now gets a patch (was every-other) — with RISE densified
         above this chains into a continuous belly seam instead of 1-2 isolated dots. */
      const cur = path[i];
      const nxt = path[Math.min(i+1, path.length-1)].p;
      const prv = path[Math.max(i-1, 0)].p;
      const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
      const band = Math.floor(cur.t * 22) % 2 === 0;
      beltPatch(cur.p, axis, cur.r, band ? P.bellyDk : P.belly);
    }
  }

  /* ---------- HEAD — jaw agape, thrown open toward the strike target, fangs bared.
     Built as a short widening-then-splitting frame: a solid lower jaw continuing the neck axis,
     and an upper jaw hinged open at a wide angle above it (the gullet is the dark gap between). ---------- */
  const neckEnd = path[path.length-1].p;
  const neckPrev = path[path.length-2].p;
  const HAXIS = new THREE.Vector3().subVectors(neckEnd, neckPrev).normalize();
  {
    const fwd = HAXIS.clone();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), fwd).normalize();
    const up = new THREE.Vector3().crossVectors(fwd, side).normalize();
    const HC = neckEnd.clone();

    const seg = (along, offY=0) => HC.clone().addScaledVector(fwd, along).addScaledVector(up, offY);
    const ell = (c, w, h, n=8) => {
      const pts=[];
      for(let k=0;k<n;k++){ const a=Math.PI/n + k/n*Math.PI*2;
        pts.push(c.clone().addScaledVector(side, Math.cos(a)*w).addScaledVector(up, Math.sin(a)*h)); }
      return pts;
    };

    /* --- LOWER JAW: continues the neck axis, drops slightly, narrows to a blunt chin. --- */
    const rNeckJoin = ell(seg(-0.03, -0.01), 0.070, 0.055);
    const rJawMid    = ell(seg( 0.06, -0.05), 0.068, 0.040);
    const rChin      = ell(seg( 0.13, -0.075), 0.040, 0.024);
    stitch([rNeckJoin, rJawMid, rChin], (b)=> b===0 ? P.headTop : P.headLt);
    capFan(rChin, seg(0.155,-0.080), P.headLt);
    capFan(rNeckJoin, seg(-0.06,-0.01), P.headTop, true);

    /* --- UPPER JAW: hinged open at a wide angle above the lower jaw — its own axis tilts up+fwd
       from the hinge point so the gap between upper and lower reads as an open gape, not a seam. --- */
    const hinge = seg(-0.02, 0.045);
    const upFwd = fwd.clone().addScaledVector(up, 0.95).normalize();     /* upper-jaw axis: steep up+forward */
    const upSeg = (along, lift=0) => hinge.clone().addScaledVector(upFwd, along).addScaledVector(up, lift);
    const rUpBack = ell(upSeg(0.00, 0.02), 0.078, 0.050);
    const rUpCheek= ell(upSeg(0.075, 0.03), 0.100, 0.058);                /* widest — cheek/hood-flare zone */
    const rUpMid  = ell(upSeg(0.145, 0.03), 0.070, 0.040);
    const rUpSnout= ell(upSeg(0.205, 0.02), 0.036, 0.022);
    stitch([rUpBack, rUpCheek, rUpMid, rUpSnout], (b)=> b===1 ? P.headLt : P.headTop);
    capFan(rUpSnout, upSeg(0.235, 0.010), P.headLt);
    capFan(rUpBack, upSeg(-0.03, 0.01), P.headTop, true);

    /* --- GULLET: a dark near-black wedge filling the open gap between the two jaws (the "the
       mouth is actually open" read — value-contrast law-3 compliant: near-black is fine here
       because it's bounded by pale fangs + headLt jaw surfaces on both sides, not floating alone). --- */
    {
      const g0 = seg(-0.005, 0.01);
      const g1 = seg(0.115, -0.03);
      const g2 = upSeg(0.13, 0.015);
      const g3 = seg(0.02, 0.03);
      quad(g0.clone().addScaledVector(side, 0.045), g1.clone().addScaledVector(side, 0.030),
           g2.clone().addScaledVector(side, 0.035), g3.clone().addScaledVector(side, 0.045), P.gullet, 0.02);
      quad(g0.clone().addScaledVector(side, -0.045), g3.clone().addScaledVector(side, -0.045),
           g2.clone().addScaledVector(side, -0.035), g1.clone().addScaledVector(side, -0.030), P.gullet, 0.02);
    }

    /* --- FANGS: two curved pale tubes jutting down from the upper jaw into the gape — the loud
       countable feature that sells "jaw agape" at a squint. --- */
    for(const s of [-1,1]){
      const root = upSeg(0.095, -0.005).addScaledVector(side, s*0.028);
      const tip  = seg(0.075, -0.045).addScaledVector(side, s*0.018);
      tube(root, tip, 0.013, 0.003, 4, P.fang, { capB:{hex:P.fang} });
    }

    /* --- HOOD HINT: two flat flared quads sweeping out+back from the upper-jaw cheeks. --- */
    for(const s of [-1,1]){
      const cIn  = upSeg(0.03, 0.01).addScaledVector(side, s*0.095);
      const cOut = upSeg(0.00, -0.01).addScaledVector(side, s*0.175);
      const cBk  = upSeg(-0.05, 0.00).addScaledVector(side, s*0.115);
      quad(cIn, cOut, cBk, cBk, P.hood, 0.05);
    }

    /* --- EYES: amber slit eyes on the upper jaw/cheek, angled forward-down toward the strike. --- */
    for(const s of [-1,1]){
      const ec = upSeg(0.05, 0.045).addScaledVector(side, s*0.058);
      quad(ec.clone().addScaledVector(up,0.010).addScaledVector(side,s*0.012),
           ec.clone().addScaledVector(up,0.010).addScaledVector(side,-s*0.012),
           ec.clone().addScaledVector(up,-0.010).addScaledVector(side,-s*0.012),
           ec.clone().addScaledVector(up,-0.010).addScaledVector(side,s*0.012), P.eye, 0.01);
      quad(ec.clone().addScaledVector(up,0.004).addScaledVector(side,s*0.005).addScaledVector(fwd,0.002),
           ec.clone().addScaledVector(up,0.004).addScaledVector(side,-s*0.005).addScaledVector(fwd,0.002),
           ec.clone().addScaledVector(up,-0.004).addScaledVector(side,-s*0.005).addScaledVector(fwd,0.002),
           ec.clone().addScaledVector(up,-0.004).addScaledVector(side,s*0.005).addScaledVector(fwd,0.002), P.eyeDk, 0.005);
    }
  }

  /* ---------- BASE DISC (Huge — r=0.68, matches the coil stack's ~0.6u extent) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 18);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.66, 0.66, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
