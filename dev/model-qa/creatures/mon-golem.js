/* dev/model-qa/creatures/mon-golem.js — the STONE GOLEM (CONSTRUCT-HUMANOID family, Large, CR 10,
   realm core), REBUILT under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry
   pilot, rebuild-w2 cell 5). Core identity: fitted masonry given a body — built from countable
   quarried BLOCKS with visible dark joint seams, not a smooth statue. 33 flavor instances ride
   this chassis, so the masonry needs enough variety (mismatched course sizes, one cracked block)
   to read as assembled stone rather than a single casting. Palette intent kept from the pass-1
   original (warm BROWN granite, distinct from the gargoyle's cool grey); geometry replaced for
   the wrecking-swing pose (the pass-1 "square, arms slightly out" stance was a law-5 failure —
   at-attention on a creature whose whole point is a haymaker).

   FEATURE CHECKLIST (the ~1,000-2,000 budget buys):
     1. CONSTRUCT-HUMANOID torso/hip/shoulder masonry per the golem's own established grammar —
        each limb/torso segment a square-section BLOCK with a dark seam gap at every joint (fitted
        courses, not a loft). Mismatched course radii per band = "quarried, not cast."
     2. TORSO TWIST — the whole chest+shoulder+head assembly is yawed off the hips (the haymaker's
        torque), built by rotating the chest/shoulder/head landmark points around the vertical
        spine axis (rotYV). The rear (left) shoulder is pulled back, the lead (right) shoulder
        driven forward — the pose lives in the landmark table per law 5.
     3. SIGNATURE — a glowing amber RUNE-BAND: a full lit ring course across the chest (the
        high-value zone) carrying 5 carved glyphs, wider and brighter than the pass-1 three small
        marks, riding the twisted chest face so it reads from the 3/4 lead angle.
     4. BOULDER FISTS — both hands built as rounded low-poly boulders (blob, not a squared block)
        fused to the forearm, one driving FAR forward at chest height (the punch about to land),
        one trailing back and up (just released) — "boulder-fist" as the loud secondary read next
        to the rune-band.
     5. ONE CRACKED STONE — a jagged dark crack line across the left shoulder block (the anatomy
        family's "mismatched quarried stones, one cracked" requirement).
     6. Wide, staggered stance (lead foot forward, rear foot back) — the base a wrecking swing
        plants into, not a square idle stance.

   POSE SENTENCE — mid-haymaker: hips planted in a forward stagger, the whole torso torqued
   through the swing, the trailing arm just released high and back, the driving boulder-fist
   about to connect far out in front of the chest.

   Imported by mon-golem-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

/* rotate a point around the vertical spine axis (x=0,z=0) by `ang` radians — the torso-twist tool.
   Used both as a stack() xform (rotates whole ring courses) and directly on hand-placed V() points
   (arms/neck) so every twisted feature agrees on the same pivot. */
function rotYV(ang, p){
  const c = Math.cos(ang), s = Math.sin(ang);
  return V(p.x*c - p.z*s, p.y, p.x*s + p.z*c);
}

export function buildGolem(){
  /* ---------- PALETTE (BROWN granite — warmer/earthier than the gargoyle's cool grey). LIGHTENED
     2026-07-08 self-correction round: the r1 render's brown-on-void values were too close to black
     (law 3 — the whole lower body vanished into the dark void). Primary surfaces pushed up to a
     lit warm tan so the silhouette holds; darks reserved for seams/shadow accents only. ---------- */
  const P = {
    stone:0x9c8a70, stoneDk:0x7a6a54, stoneDkr:0x584a39,      // lit tan granite body, mid + shadow
    stoneLt:0xc4ac86, chip:0xdcc59e,                          // bright-lit granite; pale chipped weathering
    seam:0x241d15,                                            // the deep dark seam-gaps between blocks
    crack:0x181209,                                           // the one cracked stone's fissure
    rune:0xffb840, runeDk:0x9a6a20, runeGlow:0xffe0a0,        // bright amber carved runes (glow — the signature)
    eye:0xc47a24, eyeCore:0xe8a84a,                           // dim amber-lit eyes (same forge-glow)
    disc:0x4a3f2e, discTop:0x5a4c38,
  };

  /* ---------- LANDMARKS — a MASSIVE square construct (~2.0u tall, Large). Head set LOW between
     enormous shoulder blocks; heavy square hips; short thick legs; long heavy arms. ---------- */
  const L = {
    hipY:0.86, waistY:1.02, chestY:1.28, shldY:1.56,
    neckY:1.60, headY:1.74, headTopY:1.98,
    hipHalf:0.24, shoulderX:0.46,
  };
  const TWIST = 0.36;   // radians — the torso-twist tool (chest+shoulders+head yawed off the hips).
                         // Reduced from 0.50 in the r1 self-correction: the larger angle broke the
                         // torso's vertical coherence at the sheet's dimetric camera angle.

  /* helper: a BLOCK SEGMENT — a stone box between a→b with a dark seam cap at each end, so a limb
     built of several of these reads as fitted masonry with visible joint gaps. `gap` shrinks the
     segment off each end to open the seam. Returns nothing (draws into the frame). */
  function segment(a, b, ra, rb, hex, opts = {}){
    const axis = new THREE.Vector3().subVectors(b, a).normalize();
    const gap = opts.gap ?? 0.03;
    const a2 = a.clone().addScaledVector(axis, gap);
    const b2 = b.clone().addScaledVector(axis, -gap);
    // 4-sided (square) cross-section reads as carved block, not a smooth tube
    tube(a2, b2, ra, rb, 4, hex, {phase:Math.PI/4, raz:opts.raz??ra, rbz:opts.rbz??rb,
      capA:{hex:P.seam}, capB:{hex:P.seam, lift:0.01}});
  }

  /* ===== HIPS + PELVIS BLOCK — a heavy square base course, THREE courses (mismatched radii —
     "quarried, not cast"). Un-rotated: the hips are the swing's planted anchor. ===== */
  stack([
    {y:L.hipY-0.10, rx:0.29, rz:0.24, hex:P.stoneDkr},   // low plinth course, widest
    {y:L.hipY-0.01, rx:0.26, rz:0.21, hex:P.stoneDk},
    {y:L.hipY+0.08, rx:0.275, rz:0.225, hex:P.stone},    // slightly mismatched vs the course below
  ], 4, {phase:Math.PI/4, capBot:{hex:P.stoneDkr, lift:0.01}});
  // the deep seam between the pelvis course and the torso
  { const r=ring(V(0,L.waistY-0.02,0), V(0,1,0), 0.255,0.20, 4, Math.PI/4);
    const r2=ring(V(0,L.waistY+0.02,0), V(0,1,0), 0.245,0.195, 4, Math.PI/4);
    stitch([r,r2], ()=>P.seam); }

  /* ===== BELLY COURSE — un-rotated (sits under the twist, the pivot base of the torso). ===== */
  stack([
    {y:L.waistY+0.03, rx:0.245, rz:0.195, hex:P.stoneDk},
    {y:L.chestY-0.10, rx:0.295, rz:0.230, hex:P.stone},
  ], 4, {phase:Math.PI/4});
  { const r=ring(V(0,L.chestY-0.125,0), V(0,1,0), 0.298,0.238, 4, Math.PI/4);
    const r2=ring(V(0,L.chestY-0.105,0), V(0,1,0), 0.298,0.238, 4, Math.PI/4);
    stitch([r,r2], ()=>P.seam); }

  /* ===== CHEST + SHOULDER YOKE — TWISTED off the hips (the haymaker's torque). Two courses,
     rotated around the vertical spine axis by TWIST. Mismatched radii per course. ===== */
  stack([
    {y:L.chestY+0.04, rx:0.335, rz:0.255, hex:P.stone},     // chest course — broad
    {y:L.shldY-0.06,  rx:0.310, rz:0.240, hex:P.stoneLt},   // upper chest into the shoulder yoke
  ], 4, {phase:Math.PI/4, xform:(p)=>rotYV(TWIST, p)});

  /* ===== SHOULDER BLOCKS — ENORMOUS square pauldron masses flanking the small head, twisted with
     the chest so the RIGHT (lead) shoulder drives forward and the LEFT (rear) shoulder pulls back —
     the dominant silhouette read of the swing. ===== */
  for(const s of [-1,1]){
    const cx = s*L.shoulderX;
    stack([
      {y:L.shldY-0.12, rx:0.19, rz:0.20, cx:cx, hex:P.stoneDk},
      {y:L.shldY+0.02, rx:0.215, rz:0.225, cx:cx, hex:P.stone},
      {y:L.shldY+0.14, rx:0.185, rz:0.195, cx:cx, hex:P.stoneLt},
    ], 4, {phase:Math.PI/4, capTop:{hex:P.stoneDk, lift:0.01}, capBot:{hex:P.stoneDkr},
      xform:(p)=>rotYV(TWIST, p)});
    // a chipped pale corner knocked off the top-outer edge of each shoulder (weathering)
    { const c=rotYV(TWIST, V(cx+s*0.20, L.shldY+0.14, 0.10));
      const c2=rotYV(TWIST, V(cx+s*0.20, L.shldY+0.02, 0.10));
      const c3=rotYV(TWIST, V(cx+s*0.10, L.shldY+0.14, 0.19));
      quad(c, c2, c3, c3, P.chip, 0.03); }
  }
  // ONE CRACKED STONE — a jagged dark fissure across the LEFT (rear) shoulder block.
  {
    const cx=-L.shoulderX;
    const a=rotYV(TWIST, V(cx-0.14, L.shldY+0.12, 0.09));
    const b=rotYV(TWIST, V(cx-0.02, L.shldY+0.02, 0.13));
    const c=rotYV(TWIST, V(cx-0.12, L.shldY-0.09, 0.10));
    const d=rotYV(TWIST, V(cx-0.16, L.shldY+0.00, 0.06));
    quad(a, b, b.clone(), d, P.crack, 0.0);
    quad(b, c, c.clone(), d, P.crack, 0.0);
  }

  /* ===== HEAD — SMALL, set LOW between the shoulder blocks, twisted with the torso (a little less
     than the chest — the head settles slightly toward square as it turns into the swing). ===== */
  {
    const HEAD_TWIST = TWIST*0.72;
    // short thick neck block, twisted socket to twisted head base
    segment(rotYV(TWIST, V(0,L.shldY-0.10,0.01)), rotYV(HEAD_TWIST, V(0,L.neckY+0.04,0.02)), 0.11,0.10, P.stoneDk, {gap:0.02});
    const n=4, ph=Math.PI/4, cy=L.headY, cz=0.02;
    const bands=[
      {y:cy-0.10, rx:0.135, rz:0.140, hex:P.stone},     // jaw block
      {y:cy-0.00, rx:0.155, rz:0.150, hex:P.stone},     // cheek
      {y:cy+0.09, rx:0.150, rz:0.135, hex:P.stoneDk},   // heavy brow
      {y:cy+0.18, rx:0.120, rz:0.110, hex:P.stoneDk},   // crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph).map(p=>rotYV(HEAD_TWIST,p)));
    for(const i of [1,2]){ rings[2][i].z += 0.030; rings[2][i].y -= 0.016; }   // brow hoods the eyes
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], rotYV(HEAD_TWIST, V(0, L.headTopY, cz-0.01)), P.stoneDkr);
    // seam across the brow (the head was carved in courses too)
    { const r=ring(V(0,cy+0.04,cz), V(0,1,0), 0.152,0.140, n, ph).map(p=>rotYV(HEAD_TWIST,p));
      const r2=ring(V(0,cy+0.07,cz), V(0,1,0), 0.150,0.136, n, ph).map(p=>rotYV(HEAD_TWIST,p));
      stitch([r,r2], ()=>P.seam); }

    /* EYES REMOVED 2026-07-04 (Adam: "across the board the eyes are in the wrong place so just
       get rid of them"). See dev/model-qa/REFERENCE-DIRECTION.md's dated reversal block. */
    // a grim squared mouth-slot (a dark carved line), twisted with the head
    { const m1=rotYV(HEAD_TWIST, V(-0.045,cy-0.10,cz+0.14));
      const m2=rotYV(HEAD_TWIST, V(0.045,cy-0.10,cz+0.14));
      const m3=rotYV(HEAD_TWIST, V(0.042,cy-0.13,cz+0.135));
      const m4=rotYV(HEAD_TWIST, V(-0.042,cy-0.13,cz+0.135));
      quad(m1, m2, m3, m4, P.stoneDkr, 0.02); }
  }

  /* ===== CHEST RUNE-BAND — the SIGNATURE. A full lit amber ring course spanning the chest (the
     high-value zone) plus 5 carved glyph marks riding its twisted front face. ===== */
  {
    // the glow ring itself — a bright course sitting PROUD of the chest face (larger radius, not
    // coplanar — r1 had it flush with the chest surface and it z-fought into invisibility)
    { const r=ring(V(0,L.chestY-0.01,0), V(0,1,0), 0.365,0.285, 4, Math.PI/4).map(p=>rotYV(TWIST,p));
      const r2=ring(V(0,L.chestY+0.08,0), V(0,1,0), 0.365,0.285, 4, Math.PI/4).map(p=>rotYV(TWIST,p));
      stitch([r,r2], ()=>P.runeGlow); }
    const rz = 0.262;   // proud of the chest front plane (LOCAL, pre-twist)
    const marks = [
      {x:0.0,   y:L.chestY+0.03, w:0.040, h:0.062},
      {x:-0.22, y:L.chestY+0.00, w:0.032, h:0.048},
      {x: 0.22, y:L.chestY+0.00, w:0.032, h:0.048},
      {x:-0.42, y:L.chestY-0.03, w:0.026, h:0.038},
      {x: 0.42, y:L.chestY-0.03, w:0.026, h:0.038},
    ];
    for(const m of marks){
      const T = (v)=>rotYV(TWIST, v);
      // recessed dark carved channel behind the glyph
      quad(T(V(m.x-m.w-0.006, m.y-m.h-0.006, rz-0.01)), T(V(m.x+m.w+0.006, m.y-m.h-0.006, rz-0.01)),
           T(V(m.x+m.w+0.006, m.y+m.h+0.006, rz-0.02)), T(V(m.x-m.w-0.006, m.y+m.h+0.006, rz-0.02)), P.runeDk, 0.02);
      /* an ANGULAR arcane glyph (a leaning stem + a diagonal slash — reads as a carved rune, NOT a
         cross). A thin quad stem and a thin diagonal quad. */
      quad(T(V(m.x-m.w*0.22, m.y-m.h, rz)), T(V(m.x+m.w*0.10, m.y-m.h, rz)),
           T(V(m.x+m.w*0.28, m.y+m.h, rz)), T(V(m.x-m.w*0.04, m.y+m.h, rz)), P.rune, 0.0);
      quad(T(V(m.x-m.w, m.y+m.h*0.55, rz)), T(V(m.x-m.w*0.55, m.y+m.h*0.75, rz)),
           T(V(m.x+m.w, m.y-m.h*0.25, rz)), T(V(m.x+m.w*0.55, m.y-m.h*0.45, rz)), P.rune, 0.0);
    }
  }

  /* ===== ARMS — the pose. Sockets are the TWISTED shoulder points (so both arms hang off the
     torqued yoke); RIGHT (lead) arm drives a boulder-fist far forward at chest height (the punch
     about to land); LEFT (rear) arm trails back and up (just released). Long block-segment
     upper-arm/forearm; each fist a rounded low-poly BOULDER (blob), not a squared block. ===== */
  {
    // RIGHT — driving arm (lead shoulder, pulled forward by the twist)
    {
      const S = rotYV(TWIST, V(L.shoulderX-0.02, L.shldY-0.16, 0.02));
      const E = V(0.64, 1.34, 0.58);
      const W = V(0.58, 1.26, 1.12);
      segment(S, E, 0.135, 0.115, P.stone, {gap:0.04});
      segment(E, W, 0.115, 0.095, P.stoneDk, {gap:0.04});
      stack([
        {y:E.y-0.05, rx:0.10, rz:0.10, cx:E.x, cz:E.z, hex:P.stoneDk},
        {y:E.y+0.05, rx:0.11, rz:0.11, cx:E.x, cz:E.z, hex:P.stoneLt},
      ], 4, {phase:Math.PI/4});
      // BOULDER FIST — rounded, driving forward
      blob(W.x, W.y, W.z+0.06, 0.165, 0.155, 0.175, P.stone, 6, 4);
      blob(W.x-0.02, W.y-0.06, W.z+0.02, 0.09, 0.08, 0.09, P.stoneDk, 6, 3);
      // flat chipped facets on the boulder (mismatched-stone read on the fist itself)
      quad(V(W.x+0.10,W.y+0.10,W.z+0.14), V(W.x+0.16,W.y+0.02,W.z+0.10),
           V(W.x+0.10,W.y-0.06,W.z+0.16), V(W.x+0.10,W.y-0.06,W.z+0.16), P.chip, 0.02);
    }
    // LEFT — trailing arm (rear shoulder, pulled back by the twist), swept up and behind
    {
      const S = rotYV(TWIST, V(-(L.shoulderX-0.02), L.shldY-0.16, 0.02));
      const E = V(-0.62, 1.50, -0.48);
      const W = V(-0.68, 1.64, -0.92);
      segment(S, E, 0.135, 0.115, P.stone, {gap:0.04});
      segment(E, W, 0.115, 0.095, P.stoneDk, {gap:0.04});
      stack([
        {y:E.y-0.05, rx:0.10, rz:0.10, cx:E.x, cz:E.z, hex:P.stoneDk},
        {y:E.y+0.05, rx:0.11, rz:0.11, cx:E.x, cz:E.z, hex:P.stoneLt},
      ], 4, {phase:Math.PI/4});
      // BOULDER FIST — rounded, trailing high behind
      blob(W.x, W.y, W.z-0.06, 0.155, 0.145, 0.165, P.stone, 6, 4);
      blob(W.x+0.02, W.y+0.05, W.z-0.02, 0.085, 0.075, 0.085, P.stoneLt, 6, 3);
      quad(V(W.x-0.10,W.y+0.09,W.z-0.13), V(W.x-0.15,W.y+0.01,W.z-0.09),
           V(W.x-0.09,W.y-0.06,W.z-0.15), V(W.x-0.09,W.y-0.06,W.z-0.15), P.chip, 0.02);
    }
  }

  /* ===== LEGS — SHORT, THICK, square pillar legs built of block segments with seam gaps: thigh
     block + shin block + a heavy squared FOOT slab. STAGGERED stance (lead/right foot forward,
     rear/left foot back) — the base the swing plants into, not a square idle stance. ===== */
  {
    /* PASS-2 CRITIC FIX (round 2, rebuild-w2 cell 5): the r1 render lost the whole stance — the
       staggered legs merged into one low-value blob against the (similarly warm-dark) base disc,
       so the "wide staggered stance" pose element (law 5) and a chunk of the anatomy silhouette
       (law 2) both vanished. Two changes: (1) legs pushed wider off the spine (hipHalf-relative
       stance widened) and the fore/aft stagger deepened so the two legs read as separate masses
       from the dimetric camera instead of one central column; (2) the FRONT-facing course of each
       leg segment promoted to P.stoneLt (the brightest granite value) so each pillar carries its
       own lit face — only the knee/ankle joints and foot underside stay dark, matching the
       chest/shoulders' light-course-over-dark-seam grammar instead of reading uniformly mid-dark. */
    const leg=(sign)=>{
      const lead = sign>0;             // right leg = lead (forward), left = rear (back)
      const zStep = lead ? 0.24 : -0.22;
      const stanceX = sign*(L.hipHalf+0.05);   // widened off the spine vs r1's tight column
      const hip = V(stanceX, L.hipY-0.10, 0.0);
      const knee= V(stanceX+sign*0.02, 0.50, zStep*0.55+0.02);
      const ank = V(stanceX+sign*0.02, 0.16, zStep);
      segment(hip, knee, 0.165, 0.140, P.stoneLt, {gap:0.04});     // thigh block — lit front face
      // knee-cap joint block bridging the seam
      stack([
        {y:knee.y-0.05, rx:0.13, rz:0.13, cx:knee.x, cz:knee.z, hex:P.stoneDk},
        {y:knee.y+0.05, rx:0.14, rz:0.14, cx:knee.x, cz:knee.z, hex:P.stoneLt},
      ], 4, {phase:Math.PI/4});
      segment(knee, ank, 0.145, 0.125, P.stoneLt, {gap:0.04});     // shin block — lit front face
      // heavy squared FOOT slab (a fitted plinth-block foot), toes forward
      stack([
        {y:0.02, rx:0.150, rz:0.180, cx:ank.x, cz:ank.z+0.05, hex:P.stoneDk},
        {y:0.11, rx:0.135, rz:0.155, cx:ank.x, cz:ank.z+0.03, hex:P.stone},
      ], 4, {phase:Math.PI/4, capBot:{hex:P.stoneDkr, lift:0.01}, capTop:{hex:P.stoneLt}});
      // a chipped corner off the front of the foot
      quad(V(ank.x-0.10, 0.06, ank.z+0.22), V(ank.x+0.10, 0.06, ank.z+0.22),
           V(ank.x+0.06, 0.02, ank.z+0.18), V(ank.x-0.06, 0.02, ank.z+0.18), P.chip, 0.03);
    };
    leg(-1);
    leg( 1);
  }

  /* base disc — Large piece (r=0.52), brown-stone rim. The golem's stance plants ON it. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.52, 0.52, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.50, 0.50, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
