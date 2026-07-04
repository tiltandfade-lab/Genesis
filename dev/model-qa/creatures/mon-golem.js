/* dev/model-qa/creatures/mon-golem.js — the GOLEM: a CONSTRUCT that walks. Whole-object grammar:
   one function, one geometry frame, no anchors. Where the gargoyle is LIVING STONE holding a pose,
   the golem is FITTED MASONRY on the move — a massive (~2.0u) figure whose every limb reads as
   carved SEGMENTS with visible SEAM GAPS between the blocks (the construct signature: it was
   assembled, not born). A small head set LOW between enormous shoulder blocks; knuckles-forward
   heavy fists; faint carved RUNE marks glowing dim amber on the chest; cracked weathering chips at
   the edges. Brown granite (distinct from the gargoyle's cool grey). No held item — it IS the
   weapon. Stands square, arms slightly out: a wall that walks.
   Imported by mon-golem-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGolem(){
  /* ---------- PALETTE (BROWN granite — warmer/earthier than the gargoyle's cool grey) ---------- */
  const P = {
    stone:0x6e6153, stoneDk:0x554a3e, stoneDkr:0x3d352c,     // brown granite body, mid + shadow
    stoneLt:0x877868, chip:0xa89684,                          // lit granite; pale chipped weathering
    seam:0x2a241d,                                            // the deep dark seam-gaps between blocks
    rune:0xd8952e, runeDk:0x8a5e1c,                           // dim amber carved runes (glow)
    eye:0xc47a24, eyeCore:0xe8a84a,                           // dim amber-lit eyes (same forge-glow)
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — a MASSIVE square construct (~2.0u tall). Head set LOW between enormous
     shoulder blocks; heavy square hips; short thick legs; long heavy arms slightly out. ---------- */
  const L = {
    hipY:0.86, waistY:1.02, chestY:1.28, shldY:1.56,
    neckY:1.60, headY:1.74, headTopY:1.98,
    hipHalf:0.24, shoulderX:0.46,
  };

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

  /* ===== HIPS + PELVIS BLOCK — a heavy square base course. ===== */
  stack([
    {y:L.hipY-0.06, rx:0.26, rz:0.21, hex:P.stoneDk},
    {y:L.hipY+0.06, rx:0.28, rz:0.22, hex:P.stone},
  ], 4, {phase:Math.PI/4, capBot:{hex:P.stoneDkr, lift:0.01}});
  // the deep seam between the pelvis course and the torso
  { const r=ring(V(0,L.waistY-0.02,0), V(0,1,0), 0.255,0.20, 4, Math.PI/4);
    const r2=ring(V(0,L.waistY+0.02,0), V(0,1,0), 0.245,0.195, 4, Math.PI/4);
    stitch([r,r2], ()=>P.seam); }

  /* ===== TORSO — a massive blocky trunk in TWO stacked courses (chest block + belly block) with a
     dark seam band between them (fitted masonry, not one smooth loft). Square cross-section. ===== */
  stack([
    {y:L.waistY+0.03, rx:0.245, rz:0.195, hex:P.stoneDk},   // belly course
    {y:L.chestY-0.10, rx:0.30,  rz:0.235, hex:P.stone},
    {y:L.chestY+0.04, rx:0.335, rz:0.255, hex:P.stone},     // chest course — broad
    {y:L.shldY-0.06,  rx:0.315, rz:0.235, hex:P.stoneLt},   // upper chest into the shoulder yoke
  ], 4, {phase:Math.PI/4});
  // the chest/belly seam gap (thin — a joint line, not a belt band)
  { const r=ring(V(0,L.chestY-0.125,0), V(0,1,0), 0.298,0.238, 4, Math.PI/4);
    const r2=ring(V(0,L.chestY-0.105,0), V(0,1,0), 0.298,0.238, 4, Math.PI/4);
    stitch([r,r2], ()=>P.seam); }

  /* ===== SHOULDER BLOCKS — ENORMOUS square pauldron masses flanking the small head, the golem's
     dominant silhouette mass. Each a big stone box tilted slightly out, sitting above the arms. ===== */
  for(const s of [-1,1]){
    const cx = s*L.shoulderX;
    stack([
      {y:L.shldY-0.12, rx:0.19, rz:0.20, cx:cx, hex:P.stoneDk},
      {y:L.shldY+0.02, rx:0.215, rz:0.225, cx:cx, hex:P.stone},
      {y:L.shldY+0.14, rx:0.185, rz:0.195, cx:cx, hex:P.stoneLt},
    ], 4, {phase:Math.PI/4, capTop:{hex:P.stoneDk, lift:0.01}, capBot:{hex:P.stoneDkr}});
    // a chipped pale corner knocked off the top-outer edge of each shoulder (weathering)
    quad(V(cx+s*0.20, L.shldY+0.14, 0.10), V(cx+s*0.20, L.shldY+0.02, 0.10),
         V(cx+s*0.10, L.shldY+0.14, 0.19), V(cx+s*0.10, L.shldY+0.14, 0.19), P.chip, 0.03);
  }

  /* ===== HEAD — SMALL, set LOW between the shoulder blocks. A blocky carved skull-block with a
     heavy brow, a dim amber-lit eye band, and a squared jaw. Dwarfed by the shoulders. ===== */
  {
    // short thick neck block
    segment(V(0,L.shldY-0.10,0.01), V(0,L.neckY+0.04,0.02), 0.11,0.10, P.stoneDk, {gap:0.02});
    const n=4, ph=Math.PI/4, cy=L.headY, cz=0.02;
    const bands=[
      {y:cy-0.10, rx:0.135, rz:0.140, hex:P.stone},     // jaw block
      {y:cy-0.00, rx:0.155, rz:0.150, hex:P.stone},     // cheek
      {y:cy+0.09, rx:0.150, rz:0.135, hex:P.stoneDk},   // heavy brow
      {y:cy+0.18, rx:0.120, rz:0.110, hex:P.stoneDk},   // crown
    ];
    const rings=bands.map(b=>ring(V(0,b.y,cz), V(0,1,0), b.rx, b.rz, n, ph));
    for(const i of [1,2]){ rings[2][i].z += 0.030; rings[2][i].y -= 0.016; }   // brow hoods the eyes
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(0, L.headTopY, cz-0.01), P.stoneDkr);
    // seam across the brow (the head was carved in courses too)
    { const r=ring(V(0,cy+0.04,cz), V(0,1,0), 0.152,0.140, n, ph);
      const r2=ring(V(0,cy+0.07,cz), V(0,1,0), 0.150,0.136, n, ph);
      stitch([r,r2], ()=>P.seam); }

    /* EYES — a dim amber-lit pair under the heavy brow (the forge-fire inside the construct). Small,
       intentional, with a brighter core. Set in dark carved sockets. */
    for(const s of [-1,1]){
      const ex=s*0.070, ey=cy+0.020, ez=cz+0.150;
      quad(V(ex-0.030,ey-0.020,ez-0.010), V(ex+0.030,ey-0.020,ez-0.010),
           V(ex+0.028,ey+0.022,ez-0.018), V(ex-0.028,ey+0.022,ez-0.018), P.stoneDkr, 0.03);  // socket
      quad(V(ex-0.018,ey-0.012,ez), V(ex+0.018,ey-0.012,ez),
           V(ex+0.018,ey+0.013,ez-0.005), V(ex-0.018,ey+0.013,ez-0.005), P.eye, 0.0);          // amber eye
      quad(V(ex-0.008,ey-0.004,ez+0.004), V(ex+0.008,ey-0.004,ez+0.004),
           V(ex+0.008,ey+0.006,ez+0.001), V(ex-0.008,ey+0.006,ez+0.001), P.eyeCore, 0.0);      // hot core
    }
    // a grim squared mouth-slot (a dark carved line)
    quad(V(-0.045,cy-0.10,cz+0.14), V(0.045,cy-0.10,cz+0.14),
         V(0.042,cy-0.13,cz+0.135), V(-0.042,cy-0.13,cz+0.135), P.stoneDkr, 0.02);
  }

  /* ===== CHEST RUNES — 3 small carved rune marks glowing dim amber, set into the chest course.
     Each a little quad with a darker carved channel behind it (recessed into the stone). ===== */
  {
    const rz = 0.258;   // proud of the chest front plane
    const marks = [
      {x:0.0,  y:L.chestY+0.06, w:0.045, h:0.070},   // center, tallest
      {x:-0.11, y:L.chestY-0.01, w:0.038, h:0.055},
      {x: 0.11, y:L.chestY-0.01, w:0.038, h:0.055},
    ];
    for(const m of marks){
      // recessed dark carved channel behind the glyph
      quad(V(m.x-m.w-0.006, m.y-m.h-0.006, rz-0.01), V(m.x+m.w+0.006, m.y-m.h-0.006, rz-0.01),
           V(m.x+m.w+0.006, m.y+m.h+0.006, rz-0.02), V(m.x-m.w-0.006, m.y+m.h+0.006, rz-0.02), P.runeDk, 0.02);
      /* an ANGULAR arcane glyph (a leaning stem + a diagonal slash — reads as a carved rune, NOT a
         cross). A thin quad stem and a thin diagonal quad. */
      // leaning vertical stem
      quad(V(m.x-m.w*0.22, m.y-m.h, rz), V(m.x+m.w*0.10, m.y-m.h, rz),
           V(m.x+m.w*0.28, m.y+m.h, rz), V(m.x-m.w*0.04, m.y+m.h, rz), P.rune, 0.0);
      // a diagonal slash crossing it (upper-left to mid-right)
      quad(V(m.x-m.w, m.y+m.h*0.55, rz), V(m.x-m.w*0.55, m.y+m.h*0.75, rz),
           V(m.x+m.w, m.y-m.h*0.25, rz), V(m.x+m.w*0.55, m.y-m.h*0.45, rz), P.rune, 0.0);
    }
  }

  /* ===== ARMS — long, HEAVY, built of block SEGMENTS with seam gaps: upper-arm block, forearm
     block, then a huge knuckles-forward fist. Held slightly OUT from the body (square wall stance),
     hanging to about knee height. ===== */
  {
    const arm=(sign)=>{
      const S  = V(sign*(L.shoulderX-0.02), L.shldY-0.16, 0.02);   // socket under the shoulder block
      const E  = V(sign*0.58, L.waistY+0.02, 0.06);                // elbow, held out
      const W  = V(sign*0.56, L.hipY-0.14, 0.10);                  // wrist low (to about knee height)
      segment(S, E, 0.135, 0.115, P.stone, {gap:0.04});            // upper-arm block
      segment(E, W, 0.115, 0.100, P.stoneDk, {gap:0.04});          // forearm block
      // a stone elbow-cap block bridging the seam (a fitted joint piece)
      stack([
        {y:E.y-0.05, rx:0.10, rz:0.10, cx:E.x, cz:E.z, hex:P.stoneDk},
        {y:E.y+0.05, rx:0.11, rz:0.11, cx:E.x, cz:E.z, hex:P.stoneLt},
      ], 4, {phase:Math.PI/4});
      // HUGE knuckles-forward FIST — a heavy stone block + a row of 4 squared knuckle-ridges facing DOWN/FWD
      const fistC = V(W.x, W.y-0.10, W.z+0.03);
      stack([
        {y:fistC.y+0.09, rx:0.135, rz:0.140, cx:fistC.x, cz:fistC.z, hex:P.stone},
        {y:fistC.y-0.02, rx:0.150, rz:0.155, cx:fistC.x, cz:fistC.z, hex:P.stoneLt},
        {y:fistC.y-0.11, rx:0.130, rz:0.135, cx:fistC.x, cz:fistC.z, hex:P.stoneDk},
      ], 4, {phase:Math.PI/4, capBot:{hex:P.stoneDkr, lift:0.01}, capTop:{hex:P.stoneDk}});
      // knuckle ridges — 4 small blocks on the forward-down face (knuckles pointing forward)
      for(const kx of [-0.09,-0.03,0.03,0.09]){
        const k=V(fistC.x+kx, fistC.y-0.03, fistC.z+0.14);
        segment(k, k.clone().add(V(0,-0.02,0.06)), 0.028,0.022, P.stoneLt, {gap:0.005});
      }
      // a chipped pale weathering facet on the forearm edge
      quad(V(sign*0.62, L.waistY-0.10, 0.14), V(sign*0.62, L.waistY-0.22, 0.14),
           V(sign*0.52, L.waistY-0.16, 0.18), V(sign*0.52, L.waistY-0.16, 0.18), P.chip, 0.03);
    };
    arm(-1);
    arm( 1);
  }

  /* ===== LEGS — SHORT, THICK, square pillar legs built of block segments with seam gaps: thigh
     block + shin block + a heavy squared FOOT slab. Planted wide + square (the wall's footing). ===== */
  {
    const leg=(sign)=>{
      const hip = V(sign*L.hipHalf, L.hipY-0.10, 0.0);
      const knee= V(sign*(L.hipHalf+0.02), 0.50, 0.02);
      const ank = V(sign*(L.hipHalf+0.02), 0.16, 0.0);
      segment(hip, knee, 0.155, 0.135, P.stoneDk, {gap:0.04});     // thigh block
      // knee-cap joint block bridging the seam
      stack([
        {y:knee.y-0.05, rx:0.12, rz:0.12, cx:knee.x, cz:knee.z, hex:P.stoneDk},
        {y:knee.y+0.05, rx:0.13, rz:0.13, cx:knee.x, cz:knee.z, hex:P.stoneLt},
      ], 4, {phase:Math.PI/4});
      segment(knee, ank, 0.135, 0.120, P.stone, {gap:0.04});       // shin block
      // heavy squared FOOT slab (a fitted plinth-block foot), toes forward
      stack([
        {y:0.02, rx:0.145, rz:0.175, cx:ank.x, cz:ank.z+0.05, hex:P.stoneDk},
        {y:0.11, rx:0.130, rz:0.150, cx:ank.x, cz:ank.z+0.03, hex:P.stone},
      ], 4, {phase:Math.PI/4, capBot:{hex:P.stoneDkr, lift:0.01}, capTop:{hex:P.stoneDk}});
      // a chipped corner off the front of the foot
      quad(V(ank.x-0.10, 0.06, ank.z+0.22), V(ank.x+0.10, 0.06, ank.z+0.22),
           V(ank.x+0.06, 0.02, ank.z+0.18), V(ank.x-0.06, 0.02, ank.z+0.18), P.chip, 0.03);
    };
    leg(-1);
    leg( 1);
  }

  /* base disc — Large piece (r=0.48), brown-stone rim. The golem stands square ON it. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
