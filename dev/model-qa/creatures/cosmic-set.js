/* dev/model-qa/creatures/cosmic-set.js — COSMIC realm bespoke set, authored at the ~1.5k-tri budget.
   The extra polygons over the old ~400-tri creatures are spent on EXPRESSION (eyes, tentacles, wrong-
   angle facets — each creature's LOUD signature), never on smoothing. Whole-object grammar: one
   function each, one geometry frame, no anchors. Spine +z (front), up +y, ground y=0.
   Imported by ps1-sheet.html (SETS.cosmic) -> rendered through the real engine PS1 shader.
   Signatures (docs/ANATOMY-CANON "reading cue" discipline): shoggoth=budding eyes · larva=tentacle
   crown · creeper=non-Euclidean facets · mite=crystal shards + one gaze-eye · pilgrim=reshaping face. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

/* an eye = pale sphere + a dark pupil nudged toward dir=[dx,dy,dz]. The budget-carrying detail. */
function eye(cx, cy, cz, r, dir, pale, pupil, glow){
  blob(cx, cy, cz, r, r, r, pale, 6, 4);
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0]/n, dy = dir[1]/n, dz = dir[2]/n;
  blob(cx + dx*r*0.62, cy + dy*r*0.62, cz + dz*r*0.62, r*0.52, r*0.52, r*0.52, pupil, 5, 3);
  if(glow) blob(cx + dx*r*0.86, cy + dy*r*0.86, cz + dz*r*0.86, r*0.20, r*0.20, r*0.20, glow, 4, 2);
}

/* ---------------- 1. SHOGGOTH SPAWNLING — eye-budding protoplasmic mass ---------------- */
export function buildShoggothSpawnling(){
  const P = { proto:0x53614a, protoDk:0x3e4a38, wet:0x74855e, pale:0xcfc9b2, pupil:0x181820, glow:0x9fd08a, mouth:0x241f26 };
  // lumpy protoplasm — overlapping jittered blobs = one shifting mass
  blob(0, 0.42, 0, 0.42, 0.40, 0.40, P.proto, 10, 6);
  blob(-0.19, 0.30, 0.13, 0.23, 0.21, 0.21, P.protoDk, 8, 5);
  blob(0.21, 0.35, -0.11, 0.25, 0.23, 0.23, P.proto, 8, 5);
  blob(0.04, 0.64, 0.05, 0.21, 0.19, 0.19, P.wet, 8, 5);
  blob(-0.05, 0.20, -0.06, 0.24, 0.16, 0.22, P.protoDk, 8, 4);
  // SIGNATURE — eyes budding all over, spiral-scattered on the surface (deterministic)
  const N = 17;
  for(let i=0;i<N;i++){
    const t = (i+0.5)/N, ang = t*Math.PI*2*3.39, cy = 0.12 + 0.66*t;
    const band = Math.sqrt(Math.max(0.02, 1 - (2*t-1)*(2*t-1)));
    const rr = 0.40*band;
    const cx = Math.cos(ang)*rr, cz = Math.sin(ang)*rr;
    const r = 0.045 + 0.032*((i*7)%5)/5;
    eye(cx, cy, cz, r, [Math.cos(ang), 0.25, Math.sin(ang)], P.pale, P.pupil, (i%4===0)?P.glow:0);
  }
  // a couple of dark toothless mouths (slits)
  quad(V(-0.10,0.36,0.38), V(0.08,0.34,0.39), V(0.06,0.30,0.40), V(-0.09,0.31,0.39), P.mouth, 0.03);
  quad(V(0.14,0.52,-0.34), V(0.26,0.50,-0.31), V(0.24,0.46,-0.31), V(0.13,0.47,-0.33), P.mouth, 0.03);
}

/* ---------------- 2. STAR-SPAT LARVA — bulbous head + tentacle crown ---------------- */
export function buildStarSpatLarva(){
  const P = { body:0x463f56, bodyDk:0x332e42, tent:0x554d68, tentDk:0x3f394e, beak:0x1d1a22, eye:0xbfe0c8, pupil:0x14201c, membrane:0x5f5675 };
  // bulbous cranium/body (Cthulhu-ish), tapering down to the tentacle root
  stack([
    {y:0.30, rx:0.20, rz:0.19, hex:P.bodyDk},
    {y:0.46, rx:0.27, rz:0.25, hex:P.body},
    {y:0.62, rx:0.30, rz:0.28, hex:P.body},
    {y:0.76, rx:0.25, rz:0.24, hex:P.body},
    {y:0.86, rx:0.15, rz:0.15, hex:P.membrane},
  ], 10, { phase:Math.PI/10, capTop:{hex:P.membrane, lift:0.04} });
  // a cluster of sickly eyes on the front of the head (5 — more of the star-spawn "wrongness")
  eye(0, 0.67, 0.28, 0.06, [0,0.1,1], P.eye, P.pupil, 0);
  eye(-0.13, 0.62, 0.23, 0.047, [-0.4,0,1], P.eye, P.pupil, 0);
  eye(0.13, 0.62, 0.23, 0.047, [0.4,0,1], P.eye, P.pupil, 0);
  eye(-0.07, 0.72, 0.24, 0.033, [-0.2,0.4,1], P.eye, P.pupil, 0);
  eye(0.08, 0.55, 0.25, 0.03, [0.3,-0.3,1], P.eye, P.pupil, 0);
  // a small hooked beak between/under the eyes
  capFan(ring(V(0,0.52,0.26), V(0,0,1), 0.05, 0.05, 6, 0), V(0,0.47,0.35), P.beak);
  // SIGNATURE — tentacle crown, 3 curling segments each so they hang and hook (10, budget-carrying)
  const T = 10;
  for(let i=0;i<T;i++){
    const ang = i/T*Math.PI*2 + Math.PI/T;
    const curl = (i%2)?0.05:-0.04;                    // alternate hook direction = writhing read
    const c=Math.cos(ang), s=Math.sin(ang);
    const b0=V(c*0.11,0.30,s*0.11), b1=V(c*0.22,0.17,s*0.22), b2=V(c*0.30+curl*s,0.06,s*0.30-curl*c), b3=V(c*0.31+curl*2*s,-0.02,s*0.31-curl*2*c);
    tube(b0, b1, 0.052, 0.04, 6, P.tent, {phase:Math.PI/6});
    tube(b1, b2, 0.04, 0.026, 6, P.tent, {phase:Math.PI/6});
    tube(b2, b3, 0.026, 0.012, 6, P.tentDk, {phase:Math.PI/6, capB:{hex:P.tentDk}});
  }
}

/* ---------------- 3. ANGLE-WRONG CREEPER — non-Euclidean: blades jutting every wrong way -------- */
export function buildAngleWrongCreeper(){
  const P = { core:0x231f30, blade:0x191524, blade2:0x2c2740, edgeA:0x8a4a9a, edgeB:0x3f8a9a, edgeC:0x9a8a4a, eye:0xd4bcec, pupil:0x120f1a };
  // small dark core the blades erupt from — kept low so the blades dominate the read
  blob(0, 0.40, 0, 0.15, 0.17, 0.15, P.core, 7, 4);
  // SIGNATURE — many angular BLADES radiating at CONTRADICTORY orientations (no gravity, no "up").
  // Each blade: a skewed 4-sided prism tapering to a point, dark faces + one bright iridescent edge.
  const B = 20;
  for(let i=0;i<B;i++){
    const a = i*2.3999, b = i*1.71 + 0.6;                 // deterministic scattered directions
    const dx = Math.cos(a)*Math.cos(b), dy = Math.sin(b), dz = Math.sin(a)*Math.cos(b);
    const len = 0.26 + 0.16*((i*5)%4)/4;
    const w = 0.045 + 0.022*((i*3)%3)/3;
    const base = V(dx*0.10, 0.40 + dy*0.10, dz*0.10);
    const tip  = V(dx*len*1.7, 0.40 + dy*len*1.7, dz*len*1.7);
    const axis = new THREE.Vector3(tip.x-base.x, tip.y-base.y, tip.z-base.z).normalize();
    const rTip  = ring(base, axis, w, w*0.45, 4, i*0.6);         // skewed blade cross-section
    const rBack = ring(V(dx*0.02,0.40+dy*0.02,dz*0.02), axis, w*1.15, w*0.55, 4, i*0.6);
    stitch([rBack, rTip], ()=> (i%2)?P.blade:P.blade2);
    capFan(rTip, tip, P.blade);
    quad(rTip[0], rTip[1], tip, tip, [P.edgeA,P.edgeB,P.edgeC][i%3], 0.03);   // bright edge seam
  }
  // eyes peering from the crevices between blades, each looking a contradictory way
  const E = 8;
  for(let i=0;i<E;i++){
    const a = i*1.93 + 0.4, b = i*1.29;
    const dx = Math.cos(a), dy = 0.15 + 0.55*Math.sin(b), dz = Math.sin(a);
    eye(dx*0.17, 0.40 + dy*0.15, dz*0.17, 0.038 + 0.016*(i%2), [dx,dy,dz], P.eye, P.pupil, (i%3===0)?P.edgeA:0);
  }
}

/* ---------------- 4. GRAVEL-STAR MITE — crystal splinter cluster + one petrifying gaze-eye ------ */
export function buildGravelStarMite(){
  const P = { rock:0x655c52, rockDk:0x4a423a, crystal:0x8a7a9a, crystalLt:0xb4a6c4, iris:0xc8a848, pupil:0x2a1e08, glow:0xf0d060 };
  // central gravelly core
  blob(0, 0.30, 0, 0.24, 0.22, 0.24, P.rock, 8, 5);
  blob(0.06, 0.22, -0.05, 0.16, 0.14, 0.16, P.rockDk, 7, 4);
  // SIGNATURE part A — crystal shards radiating out (star-splinter), sharp faceted spikes.
  // 14 shards, longer + brighter, angled up/out in a burst so the "star" reads.
  const S = 14;
  for(let i=0;i<S;i++){
    const ang = i/S*Math.PI*2, up = 0.15 + 0.7*((i*3)%4)/4;
    const bx = Math.cos(ang)*0.16, bz = Math.sin(ang)*0.16, by = 0.24 + 0.14*Math.sin(i*1.7);
    const tx = Math.cos(ang)*(0.32+0.14*up), tz = Math.sin(ang)*(0.32+0.14*up), ty = by + 0.12 + 0.34*up;
    const hex = (i%2)?P.crystal:P.crystalLt;
    const axis = new THREE.Vector3(tx-bx,ty-by,tz-bz).normalize();
    const base = ring(V(bx,by,bz), axis, 0.05, 0.04, 4, Math.PI/4);
    capFan(base, V(tx,ty,tz), hex);
    stitch([base, ring(V(bx*0.55,by-0.05,bz*0.55), axis, 0.058,0.046,4,Math.PI/4)], ()=>hex);
    // a bright facet highlight on the sunward face
    quad(base[0], base[1], V(tx,ty,tz), V(tx,ty,tz), P.crystalLt, 0.04);
  }
  // SIGNATURE part B — one BIG petrifying gaze-eye dominating the front, glowing amber
  eye(0, 0.34, 0.24, 0.135, [0,0.05,1], P.crystalLt, P.pupil, P.glow);
  blob(0, 0.35, 0.33, 0.07,0.07,0.05, P.iris, 7, 4);          // amber iris
  blob(0, 0.35, 0.37, 0.028,0.028,0.028, P.pupil, 5, 3);      // deep pupil
}

/* ---------------- 5. ECHO-FACED PILGRIM — robed cultist, face reshaping toward its god ---------- */
export function buildEchoFacedPilgrim(){
  const P = { robe:0x4c463d, robeDk:0x352f29, hood:0x3d382f, flesh:0xc6bca0, fleshDk:0x94896f, weye:0x9a3f3f, wpupil:0x1a0e0e, mouth:0x201814 };
  // flowing robe (wide skirt lofted up to shoulders) — low, grounded
  stack([
    {y:0.02, rx:0.30, rz:0.26, hex:P.robeDk},
    {y:0.24, rx:0.27, rz:0.23, hex:P.robe},
    {y:0.50, rx:0.24, rz:0.20, hex:P.robe},
    {y:0.74, rx:0.235, rz:0.185, hex:P.robe},
    {y:0.92, rx:0.20, rz:0.16, hex:P.robeDk},   // shoulders
  ], 10, { phase:Math.PI/10 });
  // hood shell rising to a peak, open front
  stack([
    {y:0.92, rx:0.18, rz:0.16, hex:P.hood},
    {y:1.06, rx:0.155, rz:0.14, hex:P.hood},
    {y:1.18, rx:0.10, rz:0.095, hex:P.hood},
  ], 10, { phase:Math.PI/10, capTop:{hex:P.hood, lift:0.03} });
  // SIGNATURE — the reshaping face inside the hood: a pallid mask with TOO MANY features
  //   (a second eye-pair budding, a vertical mouth) sliding out of true.
  // robe fold ridges down the skirt (vertical tubes half-embedded) — cloth expression + budget
  for(let i=0;i<7;i++){
    const ang = i/7*Math.PI*2 + Math.PI/7, c=Math.cos(ang), s=Math.sin(ang);
    tube(V(c*0.29,0.04,s*0.24), V(c*0.205,0.70,s*0.165), 0.035, 0.022, 5, P.robeDk, {phase:Math.PI/5});
  }
  blob(0, 1.00, 0.115, 0.125, 0.145, 0.10, P.flesh, 8, 5);        // face mass, pushed forward in the hood
  eye(-0.045, 1.04, 0.17, 0.028, [-0.2,0,1], P.flesh, P.wpupil, 0);  // upper-left eye
  eye(0.045, 1.04, 0.17, 0.028, [0.2,0,1], P.flesh, P.wpupil, 0);    // upper-right eye
  eye(-0.02, 0.965, 0.185, 0.022, [-0.1,-0.3,1], P.weye, P.wpupil, 0); // budding 3rd eye (wrong, red)
  eye(0.055, 0.95, 0.16, 0.02, [0.5,-0.2,0.9], P.weye, P.wpupil, 0);  // 4th, sliding off to the side
  // a vertical mouth (the drowned-language tell)
  quad(V(-0.014,1.02,0.19), V(0.014,1.02,0.19), V(0.012,0.94,0.195), V(-0.012,0.94,0.195), P.mouth, 0.02);
  // sleeves / clasped hands hint at the front
  tube(V(-0.14,0.72,0.10), V(-0.05,0.52,0.20), 0.06, 0.05, 6, P.robeDk, {phase:Math.PI/6});
  tube(V(0.14,0.72,0.10), V(0.05,0.52,0.20), 0.06, 0.05, 6, P.robeDk, {phase:Math.PI/6});
  blob(0, 0.50, 0.22, 0.06, 0.05, 0.05, P.fleshDk, 6, 3);   // clasped hands
}
