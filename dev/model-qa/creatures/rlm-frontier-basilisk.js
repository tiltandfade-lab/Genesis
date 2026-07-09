/* dev/model-qa/creatures/rlm-frontier-basilisk.js — the SAND-WASH BASILISK landmark table
   (REPTILE family, Medium, CR 3, realm frontier), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry-pilot, frontier-w1 cell 4). Core identity: the petrifying
   EIGHT-legged desert lizard denning a gravel wash — the leg count is the tell that separates
   it from any normal lizard, the glare is the kill.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. Heavy low-sprawl REPTILE torso, elbows-out stance (not the tucked digitigrade quadruped
        gait) — a thick barrel body riding low and close to the ground on eight countable legs.
     2. SIGNATURE — EIGHT legs (law 4's one loud exaggerated feature), four splayed pairs down
        the barrel, each a real 3-segment elbow-out chain, staggered mid-advance (not a static
        insect ring — legs read as WALKING, alternating up/down like a slow lizard crawl).
     3. Spined back ridge — a countable row of triangular spikes crown to tail-base, each spike
        real 3D volume (little pyramids, not slivers), the anatomy detail that reads reptile.
     4. Head aimed dead at the viewer, mouth open (petrifying hiss), the front third of the body
        RAISED off the ground (forelegs extended, chest lifted) — the glare pose.
     5. Glare eyes — two bright dull-gold lamps, the law-3 high-value zone, set forward on the
        raised head so they're the first thing the silhouette shows the viewer.
     6. Gravel-wash palette: dead grey-tan hide (the ground it dens in), darker belly/joints,
        pale horn claws, the gold eyes the only warm color in the model (per the bestiary desc).

   POSE SENTENCE: the petrifying glare — front third of the body raised off the gravel, head
   aimed dead at the viewer, jaw dropped open mid-hiss, all eight legs staggered mid-advance
   (left-front/right-mid-back planted, the rest lifting), spine ridge arched up through the
   raised chest — never a flat static crawl.

   SPINE-GESTURE SENTENCE: the spine runs a shallow rising C-curve from the tail-base up through
   the hips, cresting hardest at the lifted chest/shoulder line, then a short reverse-curve down
   into the raised neck before the head levels to aim at the viewer — the ridge spikes ride that
   curve and get taller as it climbs, so the arch itself reads as "rearing to strike," not a
   straight tube with a head glued on.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w1'], cell 4, fn buildBasilisk). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildBasilisk(){
  /* ---------- PALETTE (dead grey-tan gravel-wash hide; the gold glare-eyes are the ONLY warm
     color, per the bestiary line "the last warm color left in that dead grey wash"). ---------- */
  const P = {
    hide: 0x8c8270, hideDk: 0x625a4a, hideLt: 0xa89c82,   // back/limb hide, lifted off void
    belly: 0xc4b896, bellyDk: 0x998c6c,                    // pale-tan underbelly ladder (law-3 zone)
    spine: 0x6e6452, spineLt: 0x8c8068,                    // ridge spikes
    claw: 0xd8cdaa,                                        // horn claws
    eye: 0x1c1712, eyeGlow: 0xe0b840,                      // dull-gold glare lamps
    mouth: 0x241a14, tongue: 0xa8503c,
    disc: 0x4a4536, discTop: 0x5a5440,
  };

  /* ===== RIG — Medium reptile, low sprawl, front third RAISED (rearing glare). All Y values
     are absolute world height; the body sits low even at its raised peak (elbows-out never
     lifts a lizard as high as a digitigrade quadruped's legs would). ===== */
  const L = {
    tailY: 0.085, hipY: 0.100, midY: 0.135, chestY: 0.205, shldY: 0.235,
    neckY: 0.255, jawY: 0.285, browY: 0.305, crownY: 0.320,
    tailZ: -0.360, hipZ: -0.155, midZ: 0.010, chestZ: 0.175, headZ: 0.300,
    hipHalf: 0.115, chestHalf: 0.098,
  };

  /* ===== SPINE GESTURE — the shallow rising C-curve, authored first as a param table so every
     hung feature (ridge spikes, torso stack, head) reads off the SAME curve. ===== */
  const spineCurve = [
    { z: L.tailZ, y: L.tailY, rx: 0.058, rz: 0.240 },
    { z: L.hipZ,  y: L.hipY,  rx: 0.098, rz: 0.135 },
    { z: L.midZ,  y: L.midY,  rx: 0.108, rz: 0.150 },
    { z: L.chestZ,y: L.chestY,rx: 0.098, rz: 0.132 },
    { z: L.headZ * 0.72, y: L.shldY, rx: 0.062, rz: 0.078 },
  ];

  /* ===== LEGS — eight, elbows-out reptile chain (hip/shoulder -> elbow OUT-and-down -> wrist
     -> splayed 3-toe foot). Four pairs down the barrel, staggered advance: pair A+D lifted
     (mid-stride), pair B+C planted (weight-bearing) — the alternating crawl read. ===== */
  function legReptile(root, side, z, liftPhase, hex, hexDk){
    const lift = liftPhase ? 0.028 : 0;
    const rootP = V(side * (L.hipHalf * (z > 0 ? 0.86 : 1.0)), root, z);
    const elbow = V(side * (L.hipHalf * 2.30), root - 0.030 + lift, z + (liftPhase ? 0.032 : 0.006));
    const wrist = V(side * (L.hipHalf * 1.85), root - 0.060 + lift * 0.6, z + (liftPhase ? 0.062 : -0.006));
    const foot  = V(side * (L.hipHalf * 1.50), (liftPhase ? 0.034 : 0.012), z + (liftPhase ? 0.082 : -0.012));
    /* CRITIC FIX (round 2): the eight-leg signature (law 4) and the elbow joints (POSE-ANATOMY
       question d) were geometrically correct but invisible in the r1 render — hide/hideDk tube
       colors matched the torso+gravel-disc value too closely, so only the pale claw survived
       dithering and the connecting tube read as void (law-3 failure). Lift the whole leg chain
       onto the pale ladder (hideLt -> belly -> claw) so it reads as a bright limb against the
       darker torso and ground, restoring both the leg-count silhouette and the traceable elbow. */
    tube(rootP, elbow, 0.042, 0.032, 6, P.hideLt);
    tube(elbow, wrist, 0.030, 0.022, 6, P.belly, { phase: Math.PI / 6 });
    tube(wrist, foot, 0.021, 0.016, 5, P.bellyDk, { phase: Math.PI / 5 });
    const toeDir = V(side * 0.35, 0, 0.92);
    const side3 = new THREE.Vector3().crossVectors(V(0, 1, 0), toeDir).normalize();
    for(const s of [-1, 0, 1]){
      const spread = toeDir.clone().addScaledVector(side3, s * 0.5).normalize();
      const mid = foot.clone().addScaledVector(spread, 0.026).add(V(0, -0.002, 0));
      const tip = foot.clone().addScaledVector(spread, 0.052).add(V(0, -0.004, 0));
      tube(foot, mid, 0.015, 0.010, 4, hexDk);
      tube(mid, tip, 0.010, 0.003, 4, P.claw, { capB: { hex: P.claw } });
    }
  }
  /* four pairs, front to back: chest(A, lifted), shoulder-mid(B, planted), hip(C, planted),
     rear(D, lifted) — the diagonal stagger (front-left+rear-right lifted; the rest planted)
     reads as a genuine walking gait rather than a static insect star. */
  const legZs = [L.chestZ - 0.010, L.midZ + 0.045, L.midZ - 0.055, L.hipZ - 0.010];
  const legYs = [L.chestY - 0.020, L.midY - 0.010, L.midY - 0.010, L.hipY - 0.015];
  const liftMap = [true, false, false, true]; // left-side lift pattern; right side gets the inverse below
  for(let i = 0; i < 4; i++){
    legReptile(legYs[i], -1, legZs[i], liftMap[i], i % 2 === 0 ? P.hide : P.hideDk, P.hideDk);
    legReptile(legYs[i], 1, legZs[i], !liftMap[i], i % 2 === 0 ? P.hideDk : P.hide, P.hide);
  }

  /* ===== TORSO — heavy low-sprawl barrel, riding the spine curve, raised through the chest. */
  const torsoRings = spineCurve.map(b => ring(V(0, b.y, b.z), V(0, 1, 0), b.rx, b.rz, 9, Math.PI / 9));
  stitch(torsoRings, (b) => [P.hideDk, P.hide, P.hideLt, P.hide, P.hideDk][b] ?? P.hide);
  /* tail taper beyond the tail-base ring */
  {
    const tailTip = V(0, L.tailY + 0.006, L.tailZ - 0.150);
    tube(V(0, L.tailY, L.tailZ), tailTip, 0.058, 0.006, 7, P.hideDk, { capB: { hex: P.hideDk } });
  }

  /* pale belly ladder — the law-3 high-value zone, running the underside from hip to chest. */
  {
    const rungs = [
      [L.hipZ, L.hipY, L.hipHalf], [L.midZ, L.midY, 0.150], [L.chestZ, L.chestY, 0.132],
    ];
    for(const [z, y, rz] of rungs){
      const dn = V(0, y - rz * 0.62, z);
      const up = V(0, y - rz * 0.30, z);
      const w = rz * 0.44;
      quad(V(-w, dn.y, dn.z), V(w, dn.y, dn.z), V(w * 0.7, up.y, up.z), V(-w * 0.7, up.y, up.z), P.belly, 0.04);
    }
  }

  /* ===== SIGNATURE — spined back ridge, tail-base to skull, spikes RIDING the spine curve
     (taller where the curve crests at the chest, per the spine-gesture sentence). Each spike a
     real 3-face pyramid (ANATOMY-CANON small-feature rule) so it reads from every angle. ===== */
  {
    const ridgeZs = [];
    for(let t = 0; t <= 1; t += 1 / 10) ridgeZs.push(t);
    for(const t of ridgeZs){
      const z = L.tailZ + 0.06 + t * (L.headZ * 0.60 - (L.tailZ + 0.06));
      // interpolate y/rz along the authored spine curve
      let y = L.hipY, rz = 0.135;
      for(let i = 0; i < spineCurve.length - 1; i++){
        const a = spineCurve[i], b = spineCurve[i + 1];
        if(z >= a.z && z <= b.z){
          const u = (z - a.z) / (b.z - a.z || 1);
          y = a.y + (b.y - a.y) * u; rz = a.rz + (b.rz - a.rz) * u; break;
        }
      }
      const crest = Math.sin(t * Math.PI); // spikes taller mid-arch (the crest of the rise)
      const h = 0.028 + crest * 0.040;
      const base = V(0, y + rz * 0.72, z);
      const apex = V(0, base.y + h, z + 0.006);
      const bL = V(-0.020 - crest * 0.010, base.y, z - 0.014);
      const bR = V(0.020 + crest * 0.010, base.y, z - 0.014);
      const bB = V(0, base.y - 0.006, z + 0.018);
      quad(bL, bR, apex, apex, P.spineLt, 0.05);
      quad(bR, bB, apex, apex, P.spine, 0.05);
      quad(bB, bL, apex, apex, P.spine, 0.05);
    }
  }

  /* ===== HEAD — raised, aimed dead at the viewer, jaw open mid-hiss. ===== */
  const jawC = V(0, L.jawY, L.headZ);
  const browC = V(0, L.browY, L.headZ + 0.020);
  const crownC = V(0, L.crownY, L.headZ - 0.010);
  const neckC = V(0, L.neckY, L.headZ - 0.085);
  const headRings = [
    ring(neckC, V(0, 0, 1), 0.052, 0.058, 8, Math.PI / 8),
    ring(jawC, V(0, 0, 1), 0.062, 0.078, 8, Math.PI / 8),
    ring(browC, V(0, 0, 1), 0.058, 0.066, 8, Math.PI / 8),
    ring(crownC, V(0, 0, 1), 0.038, 0.040, 8, Math.PI / 8),
  ];
  stitch(headRings, (b) => [P.hideDk, P.hide, P.hideLt, P.hideDk][b] ?? P.hide);
  capFan(headRings[3], V(0, crownC.y + 0.020, crownC.z - 0.012), P.hideDk);
  /* snout cap — head aims dead FORWARD (+z), so the cap sits at max +z, not +y */
  capFan(headRings[1], V(0, jawC.y - 0.004, jawC.z + 0.032), P.hide, true);

  /* jaw dropped open, mid-hiss — a bright inner-mouth sliver + a forked tongue tip so "open"
     survives dithering (law 3 — dark-on-dark vanishes). */
  {
    const my = jawC.y - 0.020, mz = jawC.z + 0.026;
    quad(V(-0.036, my - 0.038, mz - 0.02), V(0.036, my - 0.038, mz - 0.02), V(0.048, my + 0.020, mz), V(-0.048, my + 0.020, mz), P.mouth, 0.03);
    quad(V(-0.018, my - 0.022, mz - 0.008), V(0.018, my - 0.022, mz - 0.008), V(0.024, my + 0.004, mz), V(-0.024, my + 0.004, mz), 0x7a2a1c, 0.04);
    for(const s of [-0.010, 0.010]){
      tube(V(s, my - 0.008, mz - 0.006), V(s, my - 0.034, mz - 0.030), 0.005, 0.001, 3, P.tongue, { capB: { hex: P.tongue } });
    }
    /* small horn fangs at the jaw corners, pale so they break the dark mouth line */
    for(const s of [-1, 1]){
      tube(V(s * 0.040, my + 0.012, mz + 0.006), V(s * 0.040, my - 0.014, mz - 0.006), 0.007, 0.001, 4, P.claw, { capB: { hex: P.claw } });
    }
  }

  /* glare eyes — the signature high-value zone, two bright dull-gold lamps set FORWARD on the
     raised head, aimed dead at the viewer (law 5's pose completing at the head). */
  for(const s of [-1, 1]){
    const p = V(s * 0.044, L.browY + 0.006, L.headZ + 0.024);
    blob(p.x, p.y, p.z, 0.017, 0.016, 0.014, P.eye, 6, 4);
    blob(p.x + s * 0.004, p.y + 0.002, p.z + 0.010, 0.009, 0.008, 0.007, P.eyeGlow, 5, 3);
  }

  /* brow ridge spikes — small, framing the glare (echoes the spine signature onto the head). */
  for(const s of [-1, 1]){
    const base = V(s * 0.052, L.browY + 0.010, L.headZ - 0.006);
    const apex = V(s * 0.052, base.y + 0.026, base.z - 0.010);
    quad(V(base.x - 0.012, base.y, base.z + 0.010), V(base.x + 0.012, base.y, base.z + 0.010), apex, apex, P.spineLt, 0.05);
    quad(V(base.x + 0.012, base.y, base.z + 0.010), V(base.x, base.y - 0.004, base.z - 0.014), apex, apex, P.spine, 0.05);
  }

  /* ===== base disc — the gravel wash it dens in ===== */
  {
    const discRings = stack([
      { y: 0.0, rx: 0.360, rz: 0.500, hex: P.disc },
      { y: 0.008, rx: 0.360, rz: 0.500, hex: P.discTop },
    ], 14);
    capFan(discRings[1], V(0, 0.0, 0.0), P.discTop);
  }
}
