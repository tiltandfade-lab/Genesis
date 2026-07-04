/* dev/model-qa/creatures/mon-snake.js — the giant-constrictor landmark table (SERPENTINE family debut).
   Whole-object grammar: one function, one geometry frame, no anchors. A board-piece COILED pose —
   a single long tapering tube path spirals inward on the base disc in two flat ground loops (each
   loop resting on/overlapping the last, its height offset slightly so the body visibly FLOWS as one
   continuous mass, not stacked donuts), then the fore-body rises ~0.9u in an S-curve to a poised
   wedge HEAD with a flattened hood hint, amber eye dots, and a forked tongue.
   The READ: a heavy constrictor poised to strike, coils reading as ONE body.
   Imported by both mon-snake-probe.html (render) and export-obj.mjs (Blender export). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildGiantSnake(){
  /* ---------- PALETTE (VS desaturated — olive-brown back, pale belly, dark diamond banding) ---------- */
  const P = {
    body:0x6a6338, bodyDk:0x4c4728, bodyLt:0x7c7446,        /* olive-brown dorsal */
    diamond:0x2f2c18, diamondLt:0x40361c,                    /* dark diamond-back banding */
    belly:0xb0a681, bellyDk:0x8c8266,                        /* pale underside bands */
    headTop:0x5e5730, headLt:0x726a3c,                       /* wedge head slightly darker/warmer */
    hood:0x54502c,                                           /* flared hood hint */
    eye:0xc88a1e, eyeDk:0x1a140a,                            /* amber eye + slit */
    mouth:0x241a14, tongue:0x8a2f2a,                         /* dark maw, dusky-red tongue */
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- THE SPINE PATH — one continuous centerline, sampled densely.
     A serpent is authored as a single swept tube: I build a list of centerline points with a
     per-point radius, then loft ring cross-sections along it. The path does TWO flat inward
     ground loops (spiraling toward the disc center, radius shrinking, each turn's y nudged up a
     hair so it climbs OVER the previous loop rather than intersecting it flat), then peels UP
     off the coil into an S-curve fore-body that ends at the poised head. ---------- */
  const path = [];   /* {p:Vector3, r:radius, t:0..1 along body (for banding)} */

  const TAIL_R = 0.020, MID_R = 0.098, NECK_R = 0.070, GROUND = 0.075;
  /* --- Ground coils: an inward Archimedean spiral, 2 full loops, sampled fine. --- */
  const COIL_SAMP = 70;                 /* samples across the two ground loops */
  const turns = 2.15;                   /* a touch past two full loops so the tail tucks under */
  const rOuter = 0.355, rInner = 0.150; /* spiral outer radius (near disc edge r=0.42) -> inner */
  const spiralStart = Math.PI*0.15;     /* where the tail tip begins on the outer ring */
  for(let i=0;i<=COIL_SAMP;i++){
    const f = i/COIL_SAMP;                                   /* 0=tail tip .. 1=end of coils */
    const ang = spiralStart + f*turns*Math.PI*2;             /* winds inward */
    const rad = rOuter + (rInner-rOuter)*f;                  /* radius shrinks toward center */
    /* body thickens from the thin tail toward the mid-body over the coils */
    const thick = TAIL_R + (MID_R-TAIL_R)*Math.min(1, f*1.15);
    /* each successive wrap climbs a little: y rises by ~one body-diameter per full turn so the
       inner loop rests ON TOP of the outer one (overlap read), not punched through it flat. */
    const climb = GROUND + f*turns*0.052;
    path.push({ p:V(Math.cos(ang)*rad, climb, Math.sin(ang)*rad), r:thick, t:f*0.62 });
  }

  /* --- Rising fore-body: peels up off the inner coil in an S-curve toward the strike head.
     Starts where the coil ended (inner, ~center), climbs to ~0.9u, weaving fore/back in z so the
     neck reads as a poised S, not a straight pole. --- */
  const lastCoil = path[path.length-1].p;
  /* The S-curve is authored to NEVER go near-vertical (that snapped the ring frame into an
     hourglass twist in iter-1). Every rise segment keeps a healthy z-component so the swept
     axis stays diagonal, and the neck bows back (-z) then forward (+z) for a clear poised S.
     Dense sampling keeps the loft smooth. */
  const RISE = [
    /* bridging sample: a low, gentle lift that keeps the axis close to the coil's tangent so the
       ring frame doesn't snap (the hourglass pinch in iter-2). It carries the spiral's exit
       direction upward smoothly before the steeper rise begins. */
    { p:V(lastCoil.x*0.82, GROUND+0.03, lastCoil.z*0.82 + 0.06), r:MID_R*1.00, t:0.632 },
    { p:V(lastCoil.x*0.60, GROUND+0.10, lastCoil.z*0.60 + 0.10), r:MID_R*1.00, t:0.65 },
    { p:V(lastCoil.x*0.28, GROUND+0.24, -0.14),                   r:MID_R*0.94, t:0.71 },  /* leans back, belly of S */
    { p:V(0.00,            GROUND+0.40, -0.22),                   r:MID_R*0.84, t:0.78 },  /* furthest back (-z) */
    { p:V(0.00,            GROUND+0.58, -0.20),                   r:MID_R*0.72, t:0.84 },  /* neck starts forward again */
    { p:V(0.00,            GROUND+0.74, -0.14),                   r:NECK_R*0.92, t:0.90 }, /* rises, staying back over the coil */
    { p:V(0.00,            GROUND+0.86, -0.08),                   r:NECK_R*0.78, t:0.95 }, /* upper neck — over disc center */
    { p:V(0.00,            GROUND+0.93, -0.02),                   r:NECK_R*0.64, t:0.98 }, /* base of head — F1 (2nd pass): pulled
                                                                     back to ~disc CENTER (z≈0) and risen taller/steeper, so the
                                                                     head + the forward snout reach now land OVER the coil footprint
                                                                     (a physical mini balances on the heavy coil), not past the rim. */
  ];
  for(const s of RISE) path.push(s);

  /* ---------- LOFT THE BODY — ring cross-sections along the path, stitched.
     Cross-section is slightly WIDER than tall (rz>ry a touch) to read as a heavy belly-down body;
     bottom of each ring is flattened where it rests on the ground/coil below. Banding: alternate
     dark diamond-back segments; belly gets a pale hex on the down-facing verts. ---------- */
  const NSEG = 8;                                             /* verts per cross-section ring */
  {
    const rings = [];
    for(let i=0;i<path.length;i++){
      const cur = path[i];
      const nxt = path[Math.min(i+1, path.length-1)].p;
      const prv = path[Math.max(i-1, 0)].p;
      const axis = new THREE.Vector3().subVectors(nxt, prv).normalize();
      /* elliptical cross-section: wider (u) than tall (v) => heavy body */
      const rx = cur.r * 1.06, rz = cur.r * 0.90;
      const rng = ring(cur.p, axis, rx, rz, NSEG, Math.PI/NSEG);
      rings.push(rng);
    }
    /* per-band coloring: diamond banding alternates along t; belly verts (lowest y in each ring)
       painted pale. Ring vert with the smallest y is the "down" vert (belly). */
    const colFn = (b, i) => {
      const t = path[b].t;
      const band = Math.floor(t * 26) % 2 === 0;               /* alternating dark/olive segments */
      /* identify belly verts: the two lowest-y verts of this ring */
      const rng = rings[b];
      const ys = rng.map(v=>v.y);
      const minY = Math.min(...ys);
      const isBelly = (rng[i].y - minY) < (Math.max(...ys)-minY)*0.28;
      if(isBelly) return band ? P.bellyDk : P.belly;          /* pale belly bands underside */
      return band ? P.diamond : P.body;                        /* dark diamond vs olive back */
    };
    stitch(rings, colFn);
    /* cap the tail tip (start of path) and the neck end (head takes over there) */
    capFan(rings[0], path[0].p.clone().add(V(0,0,0)), P.bodyDk, true);
  }

  /* ---------- HEAD — a poised wedge on the neck end, with a flattened hood hint.
     Built as a short tapering ring stack oriented along the neck's forward+up axis, front verts
     pushed into a blunt snout. Sits at the top of the rise, angled to look forward+down (strike). ---------- */
  const neckEnd = path[path.length-1].p;                      /* base of head */
  const neckPrev = path[path.length-2].p;
  const HAXIS = new THREE.Vector3().subVectors(neckEnd, neckPrev).normalize();  /* head points this way */
  {
    /* build a local frame at the head: forward = HAXIS, up ~ world-up projected, side = f×up */
    const fwd = HAXIS.clone();
    const side = new THREE.Vector3().crossVectors(V(0,1,0), fwd).normalize();
    const up = new THREE.Vector3().crossVectors(fwd, side).normalize();
    const HC = neckEnd.clone().addScaledVector(fwd, 0.075);   /* head center, out along the neck */

    /* wedge head: cross-sections from the neck (round) widening at the cheeks then tapering to a
       blunt snout. Each "ring" is an ellipse in the (side,up) plane at a position along fwd. */
    const seg = (along, w, h, offY=0) =>
      HC.clone().addScaledVector(fwd, along).addScaledVector(up, offY);
    const ell = (c, w, h, n=8) => {
      const pts=[];
      for(let k=0;k<n;k++){ const a=Math.PI/n + k/n*Math.PI*2;
        pts.push(c.clone().addScaledVector(side, Math.cos(a)*w).addScaledVector(up, Math.sin(a)*h)); }
      return pts;
    };
    const rBack = ell(seg(-0.055,0,0), 0.088, 0.070);          /* neck join */
    const rCheek= ell(seg( 0.010,0,0, -0.006), 0.115, 0.078);  /* widest — cheeks / hood-flare zone, flattened top */
    const rMid  = ell(seg( 0.065,0,0, -0.010), 0.088, 0.056);  /* narrowing */
    const rSnout= ell(seg( 0.120,0,0, -0.016), 0.048, 0.034);  /* blunt snout ring */
    stitch([rBack, rCheek, rMid, rSnout], (b)=> b===0 ? P.headTop : (b===1? P.headLt : P.headTop));
    /* close the snout front with a blunt cap (the nose) */
    const snoutTip = seg(0.150,0,0,-0.020);
    capFan(rSnout, snoutTip, P.headLt);
    /* close the back against the neck */
    capFan(rBack, seg(-0.075,0,0), P.headTop, true);

    /* --- HOOD HINT: two flat flared quads sweeping out+back from the cheeks, a subtle cobra-hood
       suggestion (not a full hood). Flattened, angled slightly down-back. --- */
    for(const s of [-1,1]){
      const cIn  = seg(0.005,0,0).addScaledVector(side, s*0.100).addScaledVector(up,-0.004);
      const cOut = seg(-0.020,0,0).addScaledVector(side, s*0.185).addScaledVector(up,-0.030);
      const cBk  = seg(-0.060,0,0).addScaledVector(side, s*0.120).addScaledVector(up,-0.020);
      quad(cIn, cOut, cBk, cBk, P.hood, 0.05);
    }

    /* --- EYES: amber dots high on the head sides, near the cheek ring, proud of the surface. --- */
    for(const s of [-1,1]){
      const ec = seg(0.020,0,0).addScaledVector(side, s*0.092).addScaledVector(up, 0.028);
      const eu = up, es = side;
      const e = (a,b)=> ec.clone().addScaledVector(es, s*a).addScaledVector(eu, b);
      quad(e(-0.014,-0.011), e(0.014,-0.011), e(0.014,0.013), e(-0.014,0.013), P.eye, 0.0);
      /* tiny dark slit pupil dot centered */
      quad(e(-0.004,-0.006), e(0.004,-0.006), e(0.004,0.007), e(-0.004,0.007), P.eyeDk, 0.0);
    }

    /* --- MOUTH LINE: a thin dark quad along the snout underside (the maw seam). --- */
    {
      const m0 = seg(0.040,0,0).addScaledVector(up,-0.030);
      const m1 = seg(0.135,0,0).addScaledVector(up,-0.022);
      quad(m0.clone().addScaledVector(side,0.030), m1.clone().addScaledVector(side,0.014),
           m1.clone().addScaledVector(side,-0.014), m0.clone().addScaledVector(side,-0.030), P.mouth, 0.03);
    }

    /* --- FORKED TONGUE: two tiny diverging tubes flicking from the snout tip. --- */
    {
      const base = snoutTip.clone().addScaledVector(fwd, 0.010).addScaledVector(up,-0.014);
      const stem = base.clone().addScaledVector(fwd, 0.045);
      tube(base, stem, 0.010, 0.007, 4, P.tongue);           /* single stem */
      for(const s of [-1,1]){
        const fork = stem.clone().addScaledVector(fwd, 0.045).addScaledVector(side, s*0.030).addScaledVector(up,0.006);
        tube(stem, fork, 0.007, 0.002, 4, P.tongue, {capB:{hex:P.tongue}});   /* diverging fork tine */
      }
    }
  }

  /* ---------- BASE DISC (Medium — r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
