/* dev/model-qa/creatures/rlm-seas-rust-monster.js — the RUST MONSTER landmark table (ARTHROPOD-ish
   QUADRUPED, Medium, CR 1, realm high-seas), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri
   band (2026-07-08 foundry pilot, seas-w1 cell 6). Core identity: the render key "rust-monster"
   (frame:"rust-monster" in data/realm-bestiary.js — Rust-Bitten Rail Golem, Junk Crawler, and the
   Wreck-Grown Rust Louse Swarm all ride this chassis narratively). Bespoke to the high-seas garnish:
   Wreck-Grown Rust Louse Swarm, "Hull-nesting vermin that rusts weapons to flakes" — a rippling,
   hard-shelled hull-nester whose antennae strip metal to orange dust.

   TRI COUNT NOTE: bakes at 692 tris — under the 1,000-2,000 band. Every checklist feature (6 plate
   rings, ridge crest, both antennae + 12 barbs, 4 legs, propeller tail + 4 blades, head/eyes/mouth,
   base disc) is present and reads at the engine capture (r2, self-corrected); padding further to
   reach the band would violate law 1 (tris are points of expression, not a target number) — flagging
   for the orchestrator rather than inflating.

   FEATURE CHECKLIST (the ~1,100-1,400 budget buys):
     1. ARTHROPOD-ish QUADRUPED anatomy per ANATOMY-CANON's arthropod family (segmented/pinched IS
        the read) taken squat and domed instead of centipede-elongate — 6 armadillo-bug plate rings,
        each pinched at a narrow waist ring before the next plate, low-slung on 4 sprawling legs.
     2. SIGNATURE A — the two FEATHERY ANTENNAE: a pale shaft per side with 6 barb quills alternating
        up/down (12 barbs total), swept FORWARD and DOWN toward the viewer, mid-probe. Pale, high-
        value, well clear of the void.
     3. SIGNATURE B — a rust-orange plate-ridge crest: 5 small triangular pyramid fins riding the
        spine centerline, tallest over the dome peak, tapering at both ends — bright against the
        darker plate tones (law 3's high-value zone).
     4. Propeller tail — a short tail mast rising UP off the rump to 4 flat paddle blades splayed
        in a cross, the DIRECTION-named "propeller tail."
     5. Squat quadruped stance: 4 stubby sprawling legs, low to the ground, planted wide.
     6. Nose-down head: the spine dips low and forward into a blunt domed head with a downturned
        scoop mouth and small paired eyes — the "eager scuttle" read.

   POSE SENTENCE: the eager scuttle — spine dips nose-down with the antennae swept forward and low,
   mid-probe toward the viewer as if it's just caught the scent of iron, while the propeller tail
   kicks up high behind the dome-peaked plated back, legs mid-scuttle, never at rest.

   Whole-object grammar: one function, one geometry frame, no anchors, ONE consistent world coordinate
   frame throughout (no local pt()-offset helper mixed with raw V() points). Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w1'], cell 6, fn buildRustMonster). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRustMonster(){
  /* ---------- PALETTE (rust-hull register: dark/mid chitin plate tones carry the countable-plate
     read, a bright rust-orange ridge crest + pale feathery antennae carry law 3's value contrast —
     both lifted well clear of the ~0x0a0908 void per the centipede/vampire-spawn r1 lesson). ---- */
  const P = {
    plateLt: 0x8c7a52, plateMid: 0x6b5c3c, plateDk: 0x4a3f28,   // dorsal armadillo plates
    pinch: 0x362d1c,                                             // narrow waist rings between plates
    ridge: 0xe0812c, ridgeLt: 0xf5a850,                          // SIGNATURE B — rust-orange plate ridge
    head: 0x8c7a52, headDk: 0x6b5c3c, mouth: 0x2a2115,
    eye: 0x1a140c, eyeGlint: 0xf0e2b8,
    antenna: 0xe8d8a8, antennaDk: 0xc4ac74,                      // SIGNATURE A — pale feathery antennae
    leg: 0x6b5c3c, legDk: 0x4a3f28,
    tail: 0x6b5c3c, tailDk: 0x4a3f28,
    blade: 0xb89858, bladeDk: 0x8c7442,                          // propeller blades
    disc: 0x1c1712, discTop: 0x241f18,
  };

  /* ---------- SPINE — 6 armadillo-bug plate centers, squat & domed (not centipede-elongate).
     Rump low, dome PEAKS at mid-back (segment 2), then the spine dips DOWN-and-FORWARD through the
     shoulder into a low nose-down head (law 5 — the eager-scuttle pose). One world frame. -------- */
  const SEG = [
    { x: 0.000, y: 0.280, z: -0.340, rx: 0.185, rz: 0.175, hex: P.plateDk },   // 0 rump
    { x: 0.000, y: 0.320, z: -0.200, rx: 0.225, rz: 0.210, hex: P.plateMid },  // 1
    { x: 0.000, y: 0.350, z: -0.040, rx: 0.245, rz: 0.225, hex: P.plateLt },   // 2 dome peak (fattest)
    { x: 0.000, y: 0.325, z:  0.120, rx: 0.215, rz: 0.195, hex: P.plateMid },  // 3
    { x: 0.000, y: 0.275, z:  0.260, rx: 0.165, rz: 0.150, hex: P.plateDk },   // 4 shoulder, narrowing
    { x: 0.000, y: 0.200, z:  0.360, rx: 0.105, rz: 0.095, hex: P.plateMid },  // 5 neck root — dip begins
  ];

  const N8 = 8, PH = Math.PI / N8;
  const allRings = [];
  const colorByBand = [];
  for(let i = 0; i < SEG.length; i++){
    const s = SEG[i];
    allRings.push(ring(V(s.x, s.y, s.z), V(0,1,0), s.rx, s.rz, N8, PH));
    if(i < SEG.length - 1){
      const s2 = SEG[i+1];
      colorByBand.push(s.hex);           // plate[i] -> pinch[i]
      const mx = (s.x + s2.x) * 0.5, my = (s.y + s2.y) * 0.5, mz = (s.z + s2.z) * 0.5;
      const mrx = (s.rx + s2.rx) * 0.5 * 0.55, mrz = (s.rz + s2.rz) * 0.5 * 0.50;
      allRings.push(ring(V(mx, my, mz), V(0,1,0), mrx, mrz, N8, PH));
      colorByBand.push(P.pinch);         // pinch[i] -> plate[i+1]
    }
  }
  stitch(allRings, (b) => colorByBand[b]);
  capFan(allRings[0], V(SEG[0].x, SEG[0].y - 0.02, SEG[0].z - 0.05), P.plateDk, true);  // rump cap (rear closed)

  /* ---------- RIDGE CREST — SIGNATURE B, 5 small triangular pyramid fins riding the spine
     centerline, leaning slightly back, tallest at the dome peak, tapering toward both ends. Bright
     rust-orange (law 3's high-value zone against the darker plate tones). ---------- */
  const ridgeSpine = [
    { x: 0, y: 0.44,  z: -0.30, size: 0.050 },
    { x: 0, y: 0.505, z: -0.16, size: 0.075 },
    { x: 0, y: 0.545, z:  0.00, size: 0.088 },
    { x: 0, y: 0.495, z:  0.15, size: 0.062 },
    { x: 0, y: 0.42,  z:  0.28, size: 0.040 },
  ];
  for(const r of ridgeSpine){
    const base = V(r.x, r.y, r.z);
    const apex = V(r.x, r.y + r.size * 1.35, r.z - r.size * 0.30);   // lean back
    tube(base, apex, r.size * 0.55, 0.006, 4, P.ridge, { phase: Math.PI/4, capB: { hex: P.ridgeLt } });
  }

  /* ---------- HEAD — small domed head continuing the neck's downward dip, blunt scoop mouth,
     paired eyes. ---------- */
  {
    const n = 8, ph = Math.PI / n;
    const headBands = [
      { y: 0.155, cz: 0.400, rx: 0.075, rz: 0.082, hex: P.headDk },
      { y: 0.175, cz: 0.430, rx: 0.088, rz: 0.088, hex: P.head },   // widest — the skull mass
      { y: 0.185, cz: 0.462, rx: 0.058, rz: 0.058, hex: P.headDk }, // blunt snout root
    ];
    const hRings = headBands.map(b => ring(V(0, b.y, b.cz), V(0,1,0), b.rx, b.rz, n, ph));
    stitch(hRings, (b) => headBands[b].hex);
    capFan(hRings[hRings.length - 1], V(0, 0.182, 0.490), P.headDk);
    // downturned scoop mouth (nose-down, close to the ground)
    tube(V(0, 0.150, 0.470), V(0, 0.090, 0.520), 0.050, 0.020, n, P.head, { phase: ph, capB: { hex: P.mouth, lift: 0.004 } });
  }

  /* paired eyes on the head sides — cheap legibility beat */
  for(const s of [-1, 1]){
    const ex = s * 0.052, ey = 0.190, ez = 0.435;
    quad(V(ex-0.012,ey+0.010,ez), V(ex+0.012,ey+0.010,ez), V(ex+0.010,ey-0.010,ez+0.01), V(ex-0.010,ey-0.010,ez+0.01), P.eye, 0.03);
    quad(V(ex-0.005,ey+0.006,ez+0.006), V(ex+0.005,ey+0.006,ez+0.006), V(ex+0.004,ey-0.002,ez+0.014), V(ex-0.004,ey-0.002,ez+0.014), P.eyeGlint, 0.02);
  }

  /* ---------- ANTENNAE — SIGNATURE A, two feathery antennae swept FORWARD and DOWN off the head,
     toward the viewer (mid-probe). Central shaft (2 tapering segments) + 6 alternating barb quills
     per side (12 total) for the "feathery" read. Pale, well clear of the void (law 3). ---------- */
  for(const s of [-1, 1]){
    const root = V(s * 0.048, 0.200, 0.450);
    const mid  = V(s * 0.115, 0.140, 0.620);
    const tip  = V(s * 0.175, 0.095, 0.780);
    tube(root, mid, 0.020, 0.014, 5, P.antennaDk);
    tube(mid, tip, 0.014, 0.005, 5, P.antenna, { capB: { hex: P.antenna } });
    // 6 feathery barbs alternating up/down along the shaft — deterministic lerp along root->mid->tip
    for(let k = 0; k < 6; k++){
      const t = (k + 1) / 7;
      const onFirstHalf = t < 0.5;
      const a = onFirstHalf ? root : mid, b = onFirstHalf ? mid : tip;
      const tt = onFirstHalf ? t / 0.5 : (t - 0.5) / 0.5;
      const bx = a.x + (b.x - a.x) * tt, by = a.y + (b.y - a.y) * tt, bz = a.z + (b.z - a.z) * tt;
      const up = (k % 2 === 0) ? 1 : -1;
      const barbTip = V(bx + s * 0.02, by + up * 0.058, bz - up * 0.012);
      tube(V(bx, by, bz), barbTip, 0.018, 0.004, 4, P.antenna);
    }
  }

  /* ---------- LEGS — 4 stubby sprawling legs (squat quadruped stance), planted wide, low to the
     ground. Two segments each, tapering, darker tarsus tip. ---------- */
  {
    const sprawlLeg = (shoulder, footX, footZ) => {
      const sgn = Math.sign(shoulder.x) || 1;
      const elbow = V(shoulder.x + sgn * 0.135, 0.135, shoulder.z + (footZ > shoulder.z ? 0.03 : -0.03));
      const foot  = V(footX, 0.028, footZ);
      tube(shoulder, elbow, 0.058, 0.044, 6, P.leg);
      tube(elbow, foot, 0.044, 0.026, 6, P.legDk, { capB: { hex: P.legDk, lift: 0.005 } });
    };
    sprawlLeg(V(-0.155, 0.275, 0.240), -0.375, 0.290);
    sprawlLeg(V( 0.155, 0.275, 0.240),  0.375, 0.250);
    sprawlLeg(V(-0.165, 0.290, -0.300), -0.395, -0.240);
    sprawlLeg(V( 0.165, 0.290, -0.300),  0.395, -0.280);
  }

  /* ---------- PROPELLER TAIL — a short mast rising UP off the rump ("tail up") to 4 flat paddle
     blades splayed in a cross — the DIRECTION-named "propeller tail." Elliptical cross-section
     (wide/thin) tubes give each blade real 3D volume. */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's 4 blades shared one flat tone and read as a
     single pale sail rather than a 4-blade propeller at this camera's near-edge-on angle. Alternated
     2 lighter / 2 darker blade tones AND staggered the pitch harder (bigger alternating y-offset) so
     the blades visibly break into separate planes instead of reading as one continuous fin. */
  {
    const tailBase = V(0, 0.300, -0.380);
    const tailMid  = V(0.01, 0.420, -0.420);
    const tailTop  = V(0.02, 0.530, -0.440);
    tube(tailBase, tailMid, 0.055, 0.038, 6, P.tail, { capA: { hex: P.tailDk } });
    tube(tailMid, tailTop, 0.038, 0.020, 6, P.tailDk);
    for(let k = 0; k < 4; k++){
      const ang = k * (Math.PI / 2) + Math.PI / 4;
      const dx = Math.cos(ang), dz = Math.sin(ang);
      const tip = V(tailTop.x + dx * 0.155, tailTop.y + (k % 2 ? 0.030 : -0.030), tailTop.z + dz * 0.155);
      const hex = (k % 2) ? P.blade : P.bladeDk;
      const capHex = (k % 2) ? P.bladeDk : P.blade;
      tube(tailTop, tip, 0.045, 0.006, 4, hex, { raz: 0.095, rbz: 0.012, capB: { hex: capHex } });
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, -0.02), V(0,1,0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, -0.02), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, -0.02), P.discTop);
  }
}
