/* dev/model-qa/creatures/rlm-bright-homunculus.js — the HOMUNCULUS landmark table (HUMANOID
   Tiny + WINGED bat family per docs/ANATOMY-CANON.md), Tiny, CR 0, realm bright-kingdom,
   authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, bright-w1 cell 9,
   port 5359). Core identity: the alchemist-built winged servant gremlin — a spindly gray-green
   underbite gargoyle caught mid-report to its master. Bespoke to the render key "homunculus"
   (frame:"homunculus" in data/realm-bestiary.js, bright-kingdom carnival register on a
   naturally drab construct skin — the fey-touched sparking-kitten flavor rides as accent glints,
   never repaints the core gray-green identity).

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID Tiny torso/head/limbs, spindly and gaunt (thin tubes, no bulk) — a small
        gray-green stitched-hide construct body, gargoyle-crouched low on bent knees.
     2. SIGNATURE — the gargoyle crouch: hips dropped near the disc edge, both clawed feet
        gripping the rim, knees pulled up past hip height (bat-crouch, not a human squat), spine
        curved forward in one continuous C from tailbone to skull so the whole figure leans out
        over the edge like a roof ornament caught listening.
     3. SIGNATURE — oversized ears + eyes: two huge bat-pinna ears fanned wide off the skull
        (the loudest silhouette break, law 4) and two huge round eyes set low and wide on the
        small face (law-3 high-value zone, near-white sclera + a bright ember iris).
     4. Fanged underbite jaw — the lower jaw juts forward past the upper, a single row of small
        under-fangs visible, head craned WAY forward past the knees mid-whisper toward its master.
     5. One arm raised, index finger extended straight up beside the jaw (the "I have news"
        whisper gesture) — elbow bent per POSE-ANATOMY law 2, never a straight ram. The other
        arm braces down, clawed hand gripping the disc rim, completing the counterpose (law 4)
        that keeps the far-forward lean from reading as falling.
     6. Folded bat wings mounted high on the back (WINGED family: leading-edge spar + scalloped
        membrane bays + a vein-strut), pulled in HALF-folded per the family's static-mini default
        but with the near wing's tip flared slightly open so the membrane-edge signature still
        reads at a squint, not collapsed to a fin.
     7. Bright-kingdom accent glints — a few small spark/ember motes at the wing-tip and raised
        fingertip (the "fey-touched sparking kitten" carnival read), kept SMALL so they garnish
        the construct-gray core palette rather than repainting it.

   POSE SENTENCE: the perched report — crouched gargoyle-low on the disc's edge, both taloned
   feet gripping the rim, knees hiked high past the hips, spine arched in one forward C-curve
   carrying the head WAY out past the knees mid-whisper, one clawed hand braced flat on the rim
   (the counterweight) while the other arm bends up beside the jaw with a single finger raised —
   never an at-attention perch; always the half-second before the report lands.

   SPINE-GESTURE SENTENCE (ANATOMY-CANON POSE-ANATOMY law 1): the pelvis->chest->skull line is
   one continuous forward-leaning C-curve baked into cz-per-band (hip cz=0 -> crown cz pushed
   hard forward past the knees), the crouch-and-lean's actual gesture line; both arms hang off
   that curve at bent shoulder/elbow/wrist arcs (~100-140deg, never straight sticks), and the
   raised-hand shoulder rides up per law 3 while the bracing arm/legs supply the counterpose
   (law 4) so the far-forward lean reads as balanced, not toppling.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front — the
   whisper-lean direction), up +y, ground y=0. All geometry authored in absolute world
   coordinates, following the pixie/sprite wave-1 pattern. Imported by ps1-sheet.html
   (SETS['bright-w1'], cell 9, fn buildHomunculus). */
import { THREE, V, quad, tube, stack, blob } from '../probe-lib.js';
import { buildBase, BASE_P } from '../parts.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one clawed finger — thin, spread, tipped darker (grip/point read) */
function claw(base, dir, len, hex, hexTip){
  const d = norm(dir);
  const mid = base.clone().addScaledVector(d, len * 0.55);
  const tip = base.clone().addScaledVector(d, len);
  tube(base, mid, 0.011, 0.008, 3, hex);
  tube(mid, tip, 0.008, 0.003, 3, hexTip, { capB: { hex: hexTip } });
}

/* one folded bat wing: leading-edge spar (root->mid->tip, Z-folded back per the family's static
   default) + a scalloped membrane pane hung off it (2 quads x2 windings, survives every
   turnaround) + one vein-strut. openAmt (0..1) flares the tip open so the near wing can read a
   touch more spread than the far wing without going full-spread. */
function batWing(root, dir, len, width, openAmt, hexPane, hexSpar, hexVein){
  const d = norm(dir);
  const upRef = Math.abs(d.y) > 0.85 ? V(0, 0, 1) : V(0, 1, 0);
  const s = new THREE.Vector3().crossVectors(d, upRef).normalize();
  const mid = root.clone().addScaledVector(d, len * 0.55);
  const tip = root.clone().addScaledVector(d, len);
  tube(root, mid, 0.014, 0.010, 4, hexSpar);
  tube(mid, tip, 0.010, 0.004, 4, hexSpar, { capB: { hex: hexSpar } });
  const flare = 0.35 + openAmt * 0.65;
  const trailRoot = root.clone().addScaledVector(s, width * 0.34 * flare).addScaledVector(V(0, -0.010, 0), 1);
  const trailMid = mid.clone().addScaledVector(s, width * 0.80 * flare).addScaledVector(V(0, -0.020, 0), 1);
  const trailTip = tip.clone().addScaledVector(s, width * 0.18 * flare).addScaledVector(V(0, -0.010, 0), 1);
  quad(root, mid, trailMid, trailRoot, hexPane, 0.05);
  quad(trailRoot, trailMid, mid, root, hexPane, 0.05);
  quad(mid, tip, trailTip, trailMid, hexPane, 0.05);
  quad(trailMid, trailTip, tip, mid, hexPane, 0.05);
  const veinA = root.clone().lerp(trailRoot, 0.55).addScaledVector(d, len * 0.05);
  const veinB = mid.clone().lerp(trailMid, 0.82);
  tube(veinA, veinB, 0.009, 0.005, 3, hexVein);
  return tip;
}

export function buildHomunculus(){
  /* ---------- PALETTE (spindly gray-green construct-hide core, near-white oversized eyes with
     an ember-amber iris carrying the law-3 high-value zone, small bright-kingdom spark accents
     kept SMALL so they garnish rather than repaint the core identity). ---------- */
  const P = {
    hide: 0x7a9270, hideDk: 0x51694a, hideLt: 0x9cb388,     // gray-green stitched-hide skin
    belly: 0x8ea67f,                                          // paler underside band
    ear: 0x6b8362, earDk: 0x455a3e,                           // bat-pinna ears, slightly darker
    eyeWhite: 0xf2ede0, iris: 0xe8862c, pupil: 0x1a1108,       // huge eyes, near-white + ember iris
    mouth: 0x2a1810, fang: 0xf0e8d4,                          // dark maw, pale under-fangs
    claw: 0x3c4a36,                                            // dark talons, grip + rim
    wingPane: 0x4a5c44, wingEdge: 0x8ea67f, wingVein: 0xd88a3a, // dusky membrane, warm vein
    spark: 0xffe9a0, sparkDk: 0xffb84a,                        // small bright-kingdom accent motes
    ...BASE_P,
  };

  /* ---------- LANDMARKS — gargoyle crouch: hips low near the disc rim, forward C-curve carries
     cz (the whisper-lean, spine-first per POSE-ANATOMY law 1) hard forward from hip to crown.
     Overall crownY kept low (~0.62) — this is a CROUCH, not a stand. ---------- */
  const L = {
    hipY: 0.175, waistY: 0.240, chestY: 0.320, shldY: 0.390, neckY: 0.435,
    jawY: 0.455, cheekY: 0.500, browY: 0.545, crownY: 0.585,
  };
  const cz = { hip: 0.000, waist: 0.028, chest: 0.062, shld: 0.100, neck: 0.140,
               jaw: 0.168, cheek: 0.198, brow: 0.222, crown: 0.238 };
  const cx = { hip: 0.000, waist: 0.000, chest: 0.000, shld: 0.000, neck: 0.000,
               jaw: 0.000, cheek: 0.000, brow: 0.000, crown: 0.000 };
  /* whole rig perched toward the disc's +z edge, not centered — the "crouched on the disc edge"
     signature. Ground offset applied post-authoring via a shared bias added to every y=0-rooted
     point below (feet/rim grip). */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's legs ran an almost-straight hip->foot
     diagonal (the "knee" barely broke past the line), so the gargoyle crouch read as a plain
     stand; the raised finger was too thin to survive 1/3-res (a near-invisible hair above the
     head); the eyes read as small dots rather than the huge-eyed signature. All three widened
     below. EDGE_Z also pushed further so the perched-on-the-rim read is unmistakable. */
  const EDGE_Z = 0.110;                    // heights (L.*) unchanged; edge offset lives in cz only
  for(const k in cz) cz[k] += EDGE_Z;

  /* ===== TORSO — spindly gaunt loft, the forward-lean gesture riding cz per band. ===== */
  stack([
    { y: L.hipY,   rx: 0.052, rz: 0.048, cx: cx.hip,   cz: cz.hip,   hex: P.hideDk },
    { y: L.waistY, rx: 0.046, rz: 0.043, cx: cx.waist, cz: cz.waist, hex: P.belly },
    { y: L.chestY, rx: 0.050, rz: 0.046, cx: cx.chest, cz: cz.chest, hex: P.hide },
    { y: L.shldY,  rx: 0.058, rz: 0.040, cx: cx.shld,  cz: cz.shld,  hex: P.hideDk },
    { y: L.neckY,  rx: 0.024, rz: 0.022, cx: cx.neck,  cz: cz.neck,  hex: P.hide },
  ], 8, {});

  /* ===== HEAD — small gaunt skull, craned WAY forward (crown pushed furthest along cz), fanged
     underbite jaw jutting past the upper face. ===== */
  stack([
    { y: L.jawY,   rx: 0.030, rz: 0.040, cx: cx.jaw,   cz: cz.jaw + 0.014, hex: P.hide },  // underbite jut
    { y: L.cheekY, rx: 0.042, rz: 0.044, cx: cx.cheek, cz: cz.cheek,       hex: P.hide },
    { y: L.browY,  rx: 0.038, rz: 0.038, cx: cx.brow,  cz: cz.brow,        hex: P.hideLt },
    { y: L.crownY, rx: 0.026, rz: 0.026, cx: cx.crown, cz: cz.crown,       hex: P.hideDk },
  ], 8, {});

  /* under-fangs — small pale row on the jutting lower jaw */
  for(const s of [-1, -0.4, 0.4, 1]){
    const root = V(cx.jaw + s * 0.018, L.jawY - 0.006, cz.jaw + 0.050);
    const tip = V(cx.jaw + s * 0.016, L.jawY - 0.020, cz.jaw + 0.056);
    tube(root, tip, 0.006, 0.002, 3, P.fang, { capB: { hex: P.fang } });
  }
  /* dark mouth well behind the fang row */
  blob(cx.jaw, L.jawY - 0.002, cz.jaw + 0.040, 0.020, 0.012, 0.014, P.mouth, 5, 3);

  /* ===== EARS — huge bat-pinna, fanned wide off the skull (law-4 loudest silhouette break). ==== */
  for(const s of [-1, 1]){
    const base = V(cx.brow + s * 0.032, L.browY + 0.010, cz.brow - 0.006);
    const midOut = V(cx.brow + s * 0.098, L.browY + 0.060, cz.brow - 0.020);
    const tip = V(cx.brow + s * 0.135, L.browY + 0.118, cz.brow - 0.028);
    const innerMid = V(cx.brow + s * 0.070, L.browY + 0.058, cz.brow + 0.006);
    quad(base, midOut, tip, innerMid, P.ear, 0.03);
    quad(innerMid, tip, midOut, base, P.earDk, 0.03);
    // inner-ear dark cup for a touch of thickness/read
    quad(base, innerMid, midOut.clone().add(V(0, -0.010, s * -0.006)), base, P.earDk, 0.02);
  }

  /* ===== EYES — huge, round, low+wide on the face (law-3 high-value zone: near-white sclera,
     ember iris, dark pupil). ===== */
  for(const s of [-1, 1]){
    const c = V(cx.cheek + s * 0.031, L.cheekY + 0.006, cz.cheek + 0.038);
    blob(c.x, c.y, c.z, 0.027, 0.025, 0.018, P.eyeWhite, 6, 4);
    const iris = c.clone().addScaledVector(V(0, 0, 1), 0.012);
    blob(iris.x, iris.y, iris.z, 0.016, 0.016, 0.010, P.iris, 5, 3);
    const pupil = iris.clone().addScaledVector(V(0, 0, 1), 0.007);
    blob(pupil.x, pupil.y, pupil.z, 0.008, 0.008, 0.005, P.pupil, 4, 2);
  }

  /* ===== LEGS — gargoyle-crouch: the KNEE juts up and forward PAST both the hip and the foot
     (r2 fix — r1's near-straight hip->foot diagonal barely bent), taloned feet gripping the disc
     rim tucked back under the knee, not trailing further forward than it. ===== */
  for(const s of [-1, 1]){
    const hip = V(cx.hip + s * 0.040, L.hipY - 0.010, cz.hip + 0.010);
    const knee = V(cx.hip + s * 0.078, L.hipY + 0.085, cz.hip + 0.108);   // knee HIGH + far forward
    const foot = V(cx.hip + s * 0.052, L.hipY - 0.140, cz.hip + 0.062);   // foot tucked back under the knee
    tube(hip, knee, 0.027, 0.020, 5, P.hideDk);
    tube(knee, foot, 0.020, 0.013, 5, P.hide);
    blob(foot.x, foot.y, foot.z, 0.018, 0.013, 0.021, P.hideDk, 5, 3);
    for(const d of [[s * 0.35, -0.55, 0.75], [s * 0.05, -0.60, 0.80], [s * -0.30, -0.50, 0.72]])
      claw(foot, d, 0.036, P.claw, P.claw);
  }

  /* ===== ARMS — one braced flat gripping the rim (counterweight), one bent up beside the jaw
     with a single finger raised (POSE-ANATOMY law 2: bent elbow, ~110-130deg; law 3: raised
     shoulder rides up). ===== */
  /* bracing arm (-x side): shoulder drops, elbow bends, clawed hand flat against the rim */
  {
    const sh = V(cx.shld - 0.062, L.shldY - 0.004, cz.shld + 0.012);
    const el = V(cx.shld - 0.100, L.shldY - 0.062, cz.shld + 0.072);
    const wr = V(cx.shld - 0.078, L.shldY - 0.132, cz.shld + 0.128);
    tube(sh, el, 0.021, 0.016, 5, P.hideDk);
    tube(el, wr, 0.016, 0.010, 5, P.hide);
    blob(wr.x, wr.y, wr.z, 0.013, 0.010, 0.014, P.hideDk, 5, 3);
    for(const d of [[-0.45, -0.60, 0.70], [-0.05, -0.65, 0.75], [0.35, -0.55, 0.68]])
      claw(wr, d, 0.028, P.claw, P.claw);
  }
  /* raised arm (+x side): shoulder rides UP (law 3), elbow bent ~115deg, finger raised beside the
     jaw — the whisper gesture. */
  let fingerTip;
  {
    const sh = V(cx.shld + 0.062, L.shldY + 0.018, cz.shld + 0.010);      // shoulder rides up
    const el = V(cx.shld + 0.104, L.shldY + 0.072, cz.shld + 0.064);
    const wr = V(cx.shld + 0.082, L.shldY + 0.148, cz.shld + 0.126);       // wrist up beside jaw
    tube(sh, el, 0.021, 0.016, 5, P.hideDk);
    tube(el, wr, 0.016, 0.010, 5, P.hide);
    blob(wr.x, wr.y, wr.z, 0.012, 0.010, 0.013, P.hideDk, 5, 3);
    // three curled-back fingers + one extended raised index
    for(const d of [[0.30, -0.30, 0.55], [0.05, -0.40, 0.60]])
      claw(wr, d, 0.020, P.claw, P.claw);
    /* R2 FIX: r1's raised finger (r 0.009->0.004, len 0.052) dissolved to a near-invisible hair
       at 1/3-res — thickened and lengthened well past the 0.04u feature floor so the "one finger
       raised" whisper gesture actually survives the squint. */
    fingerTip = wr.clone().addScaledVector(norm([0.10, 1.0, 0.15]), 0.078);
    tube(wr, fingerTip, 0.015, 0.008, 4, P.hide, { capB: { hex: P.claw } });
  }

  /* ===== SIGNATURE — folded bat wings mounted high on the back, near wing's tip flared a touch
     open (WINGED family: spar + scalloped pane + vein-strut). ===== */
  let wingTipNear, wingTipFar;
  {
    const mountY = L.shldY + 0.028, mountZ = cz.shld - 0.048, mountX = cx.shld;
    wingTipNear = batWing(V(mountX + 0.052, mountY, mountZ), [0.55, 0.30, -0.78], 0.230, 0.120, 0.55, P.wingPane, P.wingEdge, P.wingVein);
    wingTipFar  = batWing(V(mountX - 0.052, mountY, mountZ), [-0.50, 0.22, -0.84], 0.220, 0.115, 0.20, P.wingPane, P.wingEdge, P.wingVein);
  }

  /* ===== bright-kingdom accent sparks — small motes at the raised fingertip + near wing-tip,
     the carnival-fey garnish on the construct-gray core identity (kept small, per the brief). == */
  {
    const m1 = fingerTip.clone().addScaledVector(V(0.03, 0.03, 0.02), 1);
    blob(m1.x, m1.y, m1.z, 0.012, 0.012, 0.012, P.spark, 4, 2);
    const m2 = wingTipNear.clone().addScaledVector(V(0.02, 0.01, -0.02), 1);
    blob(m2.x, m2.y, m2.z, 0.009, 0.009, 0.009, P.sparkDk, 4, 2);
  }

  /* base disc (buildBase's shared Medium-tile r=0.42 — the whole rig is offset toward +z via the
     EDGE_Z bias above so the crouch reads as perched on the disc's edge, not centered on it) */
  buildBase(P);
}
