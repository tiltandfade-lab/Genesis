/* dev/model-qa/creatures/rlm-bright-gelatinous-cube.js — the GELATINOUS CUBE landmark table
   (AMORPHOUS-GEOMETRIC family — no ANATOMY-CANON stub exists for it, so this is authored from
   first principles off the DIRECTION brief, same posture as rlm-frontier-xorn.js's ELEMENTAL-
   RADIAL precedent), Large, CR 3, realm bright-kingdom, authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, bright-w1 cell 1, port 5351). Core identity: the dungeon
   cube — a translucent CUBE of ooze suspending its victims' remains inside it, mid-slide across
   the floor. Bespoke to the render key "gelatinous-cube" — the registry applies high opacity;
   the pale bubblegum-pink bright-kingdom skin below is the carnival-realm reskin riding the
   core translucent green-blue identity per the brief.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. AMORPHOUS-GEOMETRIC body — a cube, NOT a perfect one: slightly slumped (top face sagged
        inward at the corners like gelatin under its own weight), edges rounded/softened (never
        hard 90deg edges — a beveled-cube silhouette, ooze not stone), leaning off-vertical into
        its direction of travel per the DIRECTION brief.
     2. SIGNATURE — the mid-slide loom: the leading face (the one it's leaning/sliding toward)
        BULGES outward, a visible forward-swollen belly of ooze pressure, while the trailing
        face is slightly concave/pulled-thin — the whole cube reads as a single gelatinous mass
        caught mid-flow, not a static box.
     3. SUSPENDED CONTENTS x3 (the law-4 loud feature, the dungeon-cube's whole reason for being)
        floating at three different heights INSIDE the translucent body: a pale skeleton arm
        (bone-white, hand splayed) near the top, a corroded sword (dark blade, bright pommel)
        at mid-height, and a boot (dark leather) low near the base — each a small solid-color
        cluster of quads suspended in the cube's interior space, offset off-center so they read
        as tumbling/drifting, not stacked in a neat column.
     4. A thin brighter "surface tension" rim/edge-line along the cube's beveled edges — the
        law-3 high-value zone that isn't the interior contents, giving the ooze surface itself
        something to catch light on before the eye finds what's suspended inside.
     5. A few small surface bubbles/pustules (the acid-digestion tell) studding the leading
        bulging face, mid-size raised nubs breaking the flat planes so the surface reads wet and
        active rather than glassy.
     6. A subtle darker pool/smear at the base where the cube meets the floor (contact shadow +
        a thin trail of dissolved sludge behind it on the trailing side) — grounds the slide and
        reinforces the direction-of-travel read.

   POSE SENTENCE: the mid-slide loom — the whole cube tilted ~12deg off-vertical toward its
   direction of travel, leading face swollen forward with ooze pressure and studded with
   surface bubbles, trailing face pulled thin and trailing a faint sludge smear, the three
   suspended victims' remains (skeleton arm high, sword mid, boot low) drifting off-center
   inside the translucent mass — never a static resting cube, always the half-second it is
   pouring itself across the floor.

   POSE NOTE (per ANATOMY-CANON's POSE-ANATOMY, adapted for an AMORPHOUS body with no spine and
   no limbs, same adaptation the xorn table used for its radial body): this family's gesture
   line is the body's TILT AXIS (cube leaned off-vertical toward the bulging leading face) plus
   the leading-face bulge / trailing-face concavity pair, which stand in for a spine's forward
   lean and counterpose — a perfectly cubic, perfectly upright box would be the "T-stance"
   failure for this family; the lean + bulge + suspended-contents drift together carry the
   "high-expression moment" law the way bent elbows carry it for a jointed body.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0 (base of the
   cube sits on the floor; the tilt lifts one trailing-bottom corner slightly, so bbox min.y
   stays >= 0 by construction — the lean pivots around the leading-bottom edge). */
import { THREE, V, quad, blob } from '../probe-lib.js';

/* tilt a point about the X axis (leaning "forward" = toward +z) by degrees, pivoting around a
   given ground point so the leading-bottom edge stays planted at y=0. */
function leanZ(p, deg, pivot){
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const dx = p.x - pivot.x, dy = p.y - pivot.y, dz = p.z - pivot.z;
  const y2 = dy * c - dz * s;
  const z2 = dy * s + dz * c;
  return V(pivot.x + dx, pivot.y + y2, pivot.z + z2);
}

export function buildGelatinousCube(){
  /* ---------- PALETTE (bright-kingdom bubblegum-pink skin over the core translucent
     green-blue ooze identity per the brief; suspended contents pale/dark so they read as
     solid objects against the translucent body once the registry applies high opacity). ---- */
  const P = {
    body: 0xd67fc4, bodyLt: 0xf0aee0, bodyDk: 0x9b4f8f,   // bubblegum-pink translucent skin, ladder for the bulge/concave read
    rim: 0xffe6f7,                                          // bright surface-tension edge line — the law-3 high-value zone
    bubble: 0xffc9ef, bubbleDk: 0xc773ad,                   // surface bubbles/pustules on the leading face
    bone: 0xf2ead6, boneDk: 0xcfc4a6,                       // suspended skeleton arm
    swordBlade: 0x5c6470, swordDk: 0x3a4048, swordHilt: 0xe8c96a, // suspended sword — dark blade, bright pommel
    boot: 0x4a3626, bootDk: 0x2e2018,                       // suspended boot
    smear: 0x6a3560, pool: 0x4a2444,                        // trailing sludge smear + base contact shadow
  };
  const LEAN = 17;                        // degrees, leaning toward +z (direction of travel) —
                                           // r1/r2 self-review: 12deg read as near-vertical at
                                           // 1/3-res, bumped for the "mid-slide loom" to survive
                                           // the squint test without losing the grounded pivot
  const pivot = V(0, 0, 0.62);            // leading-bottom edge — stays planted at y=0
  /* gate fix: the 17deg lean swung a few off-center verts ~0.016u below ground — clamp to the
     floor (verify-theater-figures bbox gate requires min.y >= -0.01) */
  const T = (p) => { const q = leanZ(p, LEAN, pivot); q.y = Math.max(q.y, 0.002); return q; };

  const half = 0.62;                      // half-extent of the (pre-bulge) cube, ~1.24u tall/wide/deep

  /* ---------- 1. the beveled cube shell, built as 6 faces of 3x3 sub-quads so corners can
     sag and the leading/trailing faces can bulge/concave without distorting the whole box
     (per-vertex displacement on a subdivided face — "subdividing for a number" is banned, but
     here every extra vertex buys a real silhouette change: sag + bulge + concavity). -------- */
  const N = 3; // 3x3 grid per face -> lets corners sag independently of face centers
  function gridPoint(u, v, face){
    // u,v in [-1,1]; face: 'top','bot','front'(+z, leading),'back'(-z, trailing),'left','right'
    let x, y, z;
    if(face === 'top'){ x = u*half; y = half; z = v*half; }
    else if(face === 'bot'){ x = u*half; y = -half; z = v*half; }
    else if(face === 'front'){ x = u*half; y = v*half; z = half; }
    else if(face === 'back'){ x = u*half; y = v*half; z = -half; }
    else if(face === 'left'){ x = -half; y = v*half; z = u*half; }
    else { x = half; y = v*half; z = u*half; }

    // corner sag: top corners pull inward/down under gelatin weight
    if(face === 'top'){
      const cornerT = Math.max(Math.abs(u), Math.abs(v));
      if(cornerT > 0.5) y -= (cornerT - 0.5) * 0.22;
    }
    // leading (front, +z) face bulges outward toward center, most at mid-height
    if(face === 'front'){
      const r = Math.max(0, 1 - (u*u + (v*0.8)*(v*0.8)));
      z += r * 0.22;
    }
    // trailing (back, -z) face pulls thin/concave toward center
    if(face === 'back'){
      const r = Math.max(0, 1 - (u*u + (v*0.8)*(v*0.8)));
      z += r * 0.14; // pulls +z, i.e. inward since back is at -half
    }
    // soften vertical edges generally (round the box) by pulling side extremes in slightly
    if(face === 'left' || face === 'right'){
      const edge = Math.abs(v);
      if(edge > 0.75) { x *= 1 - (edge - 0.75) * 0.18 * Math.sign(x) * Math.sign(x); }
    }
    return V(x, y + half, z); // lift so bottom sits near y=0 pre-lean
  }
  function faceGrid(face){
    const rows = [];
    for(let j=0;j<=N;j++){
      const row = [];
      for(let i=0;i<=N;i++){
        const u = -1 + (2*i/N), v = -1 + (2*j/N);
        row.push(T(gridPoint(u, v, face)));
      }
      rows.push(row);
    }
    return rows;
  }
  function stitchFace(rows, hexBase, hexBulgeLt, isFront){
    // per-face winding is easy to get backwards on a beveled/displaced cube (the r1 render
    // proved it — half the shell backface-culled into two disconnected sails); draw BOTH
    // winding orders per quad so every face is visible from any camera angle, at the modest
    // cost of doubling the shell's own tri count (still well under band overall).
    for(let j=0;j<N;j++){
      for(let i=0;i<N;i++){
        const a = rows[j][i], b = rows[j][i+1], c = rows[j+1][i+1], d = rows[j+1][i];
        // brighten the front face center (the bulge) toward hexBulgeLt
        let hex = hexBase;
        if(isFront && i>0 && i<N && j>0 && j<N) hex = hexBulgeLt;
        quad(a, b, c, d, hex);
        quad(d, c, b, a, hex);
      }
    }
  }
  const top = faceGrid('top'), bot = faceGrid('bot');
  const front = faceGrid('front'), back = faceGrid('back');
  const left = faceGrid('left'), right = faceGrid('right');
  stitchFace(top, P.bodyLt, P.bodyLt, false);
  stitchFace(bot, P.bodyDk, P.bodyDk, false);
  stitchFace(front, P.body, P.bodyLt, true);   // leading face — brighter center, the bulge
  stitchFace(back, P.bodyDk, P.bodyDk, false); // trailing face — darker, concave
  stitchFace(left, P.body, P.body, false);
  stitchFace(right, P.body, P.body, false);

  /* ---------- 2. bright surface-tension rim along the 4 vertical edges (law-3 high-value
     zone, thin quads riding just outside the shell so they read as an edge highlight). ------ */
  function edgeStrip(faceA_i0j, faceB_i0j, hex){
    // faceA_i0j / faceB_i0j: arrays of column-0 points from two adjacent faces sharing an edge
    for(let j=0;j<N;j++){
      const a = faceA_i0j[j], b = faceA_i0j[j+1];
      const a2 = V(a.x+0.01,a.y,a.z+0.01), b2 = V(b.x+0.01,b.y,b.z+0.01);
      quad(a, a2, b2, b, hex, 0.03);
      quad(b, b2, a2, a, hex, 0.03);
    }
  }
  edgeStrip(front.map(r=>r[N]), right.map(r=>r[0]), P.rim);
  edgeStrip(front.map(r=>r[0]), left.map(r=>r[N]), P.rim);
  edgeStrip(back.map(r=>r[N]), left.map(r=>r[0]), P.rim);
  edgeStrip(back.map(r=>r[0]), right.map(r=>r[N]), P.rim);

  /* ---------- 3. surface bubbles/pustules on the leading (bulging) face — small raised
     nubs, law-3-sized (>=0.04u), studding the swollen center. ---------- */
  const bubbleSpots = [
    {u:-0.25,v:0.35,r:0.09}, {u:0.3,v:0.1,r:0.11}, {u:0.05,v:-0.3,r:0.08},
    {u:-0.4,v:-0.15,r:0.07}, {u:0.35,v:-0.4,r:0.07},
  ];
  bubbleSpots.forEach(function(spot){
    const base = gridPoint(spot.u, spot.v, 'front');
    const c = T(V(base.x, base.y, base.z + 0.03));
    blob(c.x, c.y, c.z, spot.r, spot.r, spot.r*0.7, P.bubble, 6, 3);
  });

  /* ---------- 4. suspended contents — skeleton arm (top), sword (mid), boot (low), each
     offset off-center so the trio drifts rather than stacks in a column. ---------- */
  // skeleton arm — a slender bone tube with a splayed hand, high in the cube
  (function skeletonArm(){
    const shoulder = T(V(-0.18, 0.90, -0.05));
    const elbow = T(V(-0.05, 0.72, 0.10));
    const wrist = T(V(0.10, 0.58, 0.02));
    function boneTube(a, b, r){
      const axis = new THREE.Vector3().subVectors(b, a).normalize();
      const up = Math.abs(axis.y) > 0.9 ? V(1,0,0) : V(0,1,0);
      const u = new THREE.Vector3().crossVectors(up, axis).normalize();
      const v = new THREE.Vector3().crossVectors(axis, u).normalize();
      const n = 5;
      function ringAt(p, rad){
        const pts = [];
        for(let i=0;i<n;i++){ const t = (i/n)*Math.PI*2;
          pts.push(V(p.x+u.x*Math.cos(t)*rad+v.x*Math.sin(t)*rad, p.y+u.y*Math.cos(t)*rad+v.y*Math.sin(t)*rad, p.z+u.z*Math.cos(t)*rad+v.z*Math.sin(t)*rad));
        }
        return pts;
      }
      const r1 = ringAt(a, r), r2 = ringAt(b, r);
      for(let i=0;i<n;i++){ const i2=(i+1)%n; quad(r1[i], r1[i2], r2[i2], r2[i], P.bone); }
    }
    boneTube(shoulder, elbow, 0.055);
    boneTube(elbow, wrist, 0.045);
    // splayed hand: 4 short finger nubs fanned from the wrist
    for(let f=0; f<4; f++){
      const ang = (f/3 - 0.5) * 0.9;
      const tip = T(V(wrist.x + Math.sin(ang)*0.13 - 0.0, wrist.y - 0.02, wrist.z + Math.cos(ang)*0.10));
      boneTube(V(wrist.x, wrist.y-0.0, wrist.z), tip, 0.02);
    }
  })();

  // sword — dark blade + bright pommel, mid-height, off-center opposite the arm
  (function sword(){
    const hilt = T(V(0.22, 0.62, 0.08));
    const tip = T(V(0.08, 0.20, -0.10));
    const mid = T(V(0.15, 0.40, -0.01));
    function bladeQuad(a, b, w, hex){
      const axis = new THREE.Vector3().subVectors(b, a).normalize();
      const side = new THREE.Vector3().crossVectors(axis, V(0,0,1)).normalize().multiplyScalar(w);
      quad(V(a.x-side.x,a.y-side.y,a.z-side.z), V(a.x+side.x,a.y+side.y,a.z+side.z),
           V(b.x+side.x,b.y+side.y,b.z+side.z), V(b.x-side.x,b.y-side.y,b.z-side.z), hex);
    }
    bladeQuad(hilt, mid, 0.045, P.swordBlade);
    bladeQuad(mid, tip, 0.03, P.swordDk);
    // crossguard
    quad(T(V(0.18,0.64,0.04)), T(V(0.26,0.64,0.12)), T(V(0.26,0.60,0.12)), T(V(0.18,0.60,0.04)), P.swordDk);
    // pommel — bright nub at the hilt end
    blob(hilt.x, hilt.y+0.04, hilt.z, 0.06, 0.06, 0.06, P.swordHilt, 6, 3);
  })();

  // boot — dark leather cluster, low near the base, off-center from both other items
  (function boot(){
    const c = T(V(-0.12, 0.18, 0.14));
    blob(c.x, c.y, c.z, 0.13, 0.09, 0.20, P.boot, 6, 4);
    blob(c.x-0.02, c.y+0.10, c.z-0.10, 0.08, 0.10, 0.10, P.bootDk, 6, 3); // ankle cuff, darker
  })();

  /* ---------- 5. base contact pool + trailing sludge smear — grounds the slide. ---------- */
  (function baseGround(){
    const pts = [
      V(-0.7,0.01,-0.55), V(0.7,0.01,-0.55), V(0.75,0.01,0.35), V(-0.75,0.01,0.35),
    ];
    quad(pts[0], pts[1], pts[2], pts[3], P.pool, 0.05);
    // trailing smear stretching behind (-z, away from lean direction)
    const s0 = V(-0.35,0.008,-0.55), s1 = V(0.35,0.008,-0.55), s2 = V(0.28,0.008,-1.05), s3 = V(-0.28,0.008,-1.05);
    quad(s0, s1, s2, s3, P.smear, 0.06);
  })();

  return { P };
}
