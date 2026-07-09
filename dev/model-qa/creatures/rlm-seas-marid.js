/* dev/model-qa/creatures/rlm-seas-marid.js — the MARID landmark table (HUMANOID family, Huge,
   CR 13, realm high-seas), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry
   pilot, seas-w2 cell 6). Core identity: the water genie — hulking regal sea-lord, folkloric
   seabed afterlife given a keeper (data/realm-bestiary.js's "the Locker-Warden": vast, patient,
   the one who counts the dead as they settle). Bespoke to the render key "marid" — realm
   reskins ride this chassis narratively.

   FEATURE CHECKLIST (the ~1,300-1,600 budget buys):
     1. HUMANOID torso+legs at HUGE scale — heavy royal barrel build (broad chest, deep gut,
        wide seated haunches), bronze king's-band belt at the waist (the rank tell).
     2. SIGNATURE — coral crown: seven branching coral spikes bursting up off the brow/crown,
        the tallest front spike branching mid-height into a smaller offshoot, in a bright
        near-white-coral value against the deep sea-blue skin (law 3's chief high-value zone).
     3. Fish-scale forearms — each forearm built as three banded segments alternating pale/dark
        scale color from elbow to wrist, carried onto the clasped hands (law 4's one loud
        signature; law 3's second high-value zone).
     4. Conch-shell shoulder plate — one large nacre-pink shell dome over the right shoulder,
        spiral ridge lines, a pale interior aperture — armor read at a glance, asymmetric
        silhouette break.
     5. Low tide-pool base — a shallow water disc (dark pool floor + pale foam rim) instead of
        stone/dirt, in place of the standard base disc.
     6. THE SEATED POSE (law 5's sanctioned exception — stillness IS the menace) — seated
        forward on an unseen throne, elbows resting ON the raised knees, huge hands loosely
        clasped low between them, head bowed slightly forward but eyes up, looking straight at
        the viewer. Never a standing idle stance, never a war-pose — the one deliberate
        low-expression pose in the realm.

   POSE SENTENCE: seated forward on an unseen throne, hips high and back, both knees raised and
   planted wide in the tide pool, elbows dropped onto the knees, huge clasped hands hanging low
   between them, the head bowed just enough to tuck the chin — but the gaze stays locked level on
   whoever stands in front of it, patient power that has counted every name that ever sank here
   and isn't finished counting.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w2'], cell 6, fn buildMarid). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildMarid(){
  /* ---------- PALETTE (deep sea-blue royal skin vs. the coral-crown/scale-forearm/eye-glow
     high-value ladder law 3 needs; bronze king's-band + nacre shell lift the regalia off the
     body so the signature reads at a squint). ---------- */
  const P = {
    skin: 0x215b70, skinDk: 0x153e4c, skinLt: 0x347c92,     // deep teal-blue royal skin
    face: 0x5aa8bc, faceHi: 0x7cc4d4,                         // R4 CRITIC: face value-lifted clear
                                                                // of the torso family so the head
                                                                // silhouette reads at a squint
    scale: 0xa8d8cc, scaleDk: 0x4a8f88,                       // fish-scale forearm bands (high-value)
    coral: 0xe8724a, coralDk: 0xb8472a, coralHi: 0xffc09a,    // coral crown — the loud signature
    shell: 0xe8d4cc, shellDk: 0xb89a92,                       // conch-shell shoulder plate (nacre)
    bronze: 0xc4964a, bronzeDk: 0x8a6a30,                     // king's-band belt — the rank tell
    eye: 0x140f0d, eyeGlow: 0xf0d888,                         // patient gaze, a warm gold glow
    mouth: 0x140f0d,
    pool: 0x1c3c44, poolDeep: 0x142c32, foam: 0xaed8d2,       // low tide-pool base
  };

  /* ===== RIG — Huge scale, seated. All heights in world y; the whole upper body carries a mild
     forward lean (z creeps forward with height) that culminates in the head's extra bow, so the
     seated-forward silhouette reads without a literal chair. ===== */
  const L = {
    hipY: 0.58, waistY: 0.72, ribY: 0.88, chestY: 1.02, shldY: 1.14, neckY: 1.20,
    jawY: 1.27, cheekY: 1.34, browY: 1.40, crownY: 1.47, crestTopY: 1.90,
    kneeY: 0.40, ankleY: 0.14, footY: 0.03,
  };

  /* ===== LEGS — seated: hips high and back, knees raised forward, shins dropping down into the
     tide pool. Wide stout build (Huge royal haunches), blunt webbed feet. ===== */
  function legSeated(hip, knee, ankle, ballDir, hex, hexDk, footHex){
    tube(hip, knee, 0.190, 0.150, 8, hex);
    tube(knee, ankle, 0.150, 0.115, 8, hexDk, { phase: Math.PI / 8 });
    const ball = ankle.clone().addScaledVector(ballDir, 0.135).add(V(0, -0.045, 0));
    const heel = ankle.clone().addScaledVector(ballDir, -0.05).add(V(0, -0.025, 0));
    tube(ankle, ball, 0.058, 0.050, 6, footHex);
    tube(ankle, heel, 0.046, 0.030, 5, footHex, { capB: { hex: footHex } });
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), ballDir).normalize();
    for(const s of [-1, 0, 1]){
      const spread = ballDir.clone().addScaledVector(side, s * 0.5).normalize();
      const tip = ball.clone().addScaledVector(spread, 0.085).add(V(0, -0.008, 0));
      tube(ball, tip, 0.022, 0.010, 4, footHex, { capB: { hex: footHex } });
    }
  }
  legSeated(
    V(0.22, L.hipY, -0.03), V(0.29, L.kneeY, 0.40), V(0.26, L.ankleY, 0.34),
    V(0.15, 0, 0.99).normalize(), P.skin, P.skinDk, P.skinDk
  );
  legSeated(
    V(-0.22, L.hipY, -0.03), V(-0.29, L.kneeY, 0.40), V(-0.26, L.ankleY, 0.34),
    V(-0.15, 0, 0.99).normalize(), P.skinDk, P.skin, P.skinDk
  );

  /* ===== TORSO — heavy royal barrel build, mild forward lean baked into each band's z. ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.250, rz: 0.210, cz: -0.02, hex: P.skin },
    { y: L.waistY, rx: 0.232, rz: 0.190, cz: 0.02,  hex: P.skinDk },
    { y: L.ribY,   rx: 0.272, rz: 0.222, cz: 0.06,  hex: P.skin },
    { y: L.chestY, rx: 0.312, rz: 0.248, cz: 0.10,  hex: P.skinLt },
    { y: L.shldY,  rx: 0.352, rz: 0.230, cz: 0.13,  hex: P.skin },
    { y: L.neckY,  rx: 0.118, rz: 0.108, cz: 0.15,  hex: P.skinDk },
  ], 9);

  /* bronze king's-band belt at the waist — the regal tell, a thin ring sitting proud of the
     torso shell so it reads instead of getting buried in the shell radius (the sahuagin-baron
     belly-ladder lesson: keep decoration multipliers OUTSIDE the surrounding band's own rz). */
  {
    const c = V(0, L.hipY + 0.05, 0.00);
    const r1 = ring(c, V(0, 1, 0), 0.264, 0.222, 9, Math.PI / 9);
    const r2 = ring(V(0, L.hipY - 0.02, -0.02), V(0, 1, 0), 0.256, 0.214, 9, Math.PI / 9);
    stitch([r2, r1], () => P.bronze);
  }

  /* ===== HEAD — bowed slightly forward (chin tucked toward the chest) but the gaze stays level
     at the viewer; the coral crown reads OFF the brow/crown rings.
     R2 SELF-CORRECTION (post r1 engine render): the head sampled as buried inside the chest's
     own silhouette — the chest band's forward reach (cz 0.10, rz 0.248 -> front ~0.348) sat
     IN FRONT of the head rings (old max z ~0.205+radius), so the face vanished into the torso
     mass and the eyes never read at all. Head rings raised (jawY/crownY pushed up, clear of the
     shoulder band) and pushed forward well past the chest's front surface so the face pops
     clear of the body instead of sinking into the neck.
     R4 CRITIC FIX (fresh-context pass, post r2/r3 engine render): moving the shell clear of the
     face (R3) proved the face was STILL invisible even with nothing occluding it — the head
     rings were painted P.skin/P.skinLt, the SAME palette family as the torso they sit in front
     of, so at 1/3-res + dither there was no value break at the head/body boundary and the whole
     head silhouette read as a continuation of the torso mass (law 3 failure — a mid-value zone
     indistinguishable from its neighbor might as well not exist). Recolored the head rings to
     the new P.face/P.faceHi tones (a genuine value lift off the torso family, not just a hue
     shift) and enlarged the ring radii ~20% so the head reads as a proportionate head instead of
     a small nub lost in the crown/shoulder cluster. */
  const jawC = V(0, L.jawY, 0.30);
  const cheekC = V(0, L.cheekY, 0.35);
  const browC = V(0, L.browY, 0.33);
  const crownC = V(0, L.crownY, 0.27);
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.116, 0.152, 8, Math.PI / 8),
    ring(cheekC, V(0, 1, 0), 0.152, 0.178, 8, Math.PI / 8),
    ring(browC, V(0, 1, 0), 0.156, 0.144, 8, Math.PI / 8),
    ring(crownC, V(0, 1, 0), 0.108, 0.092, 8, Math.PI / 8),
  ];
  stitch(headRings, (b) => [P.face, P.faceHi, P.face][b] ?? P.face);
  capFan(headRings[3], crownC.clone().add(V(0, 0.018, -0.01)), P.skinDk);

  /* mouth — closed, patient, no war-cry (the seated pose IS the expression; the face stays
     still). A single dark line to give the jaw definition without competing with the crown. */
  {
    const my = jawC.y - 0.006, mz = jawC.z + 0.070;
    quad(V(-0.036, my - 0.012, mz - 0.01), V(0.036, my - 0.012, mz - 0.01),
      V(0.030, my + 0.010, mz), V(-0.030, my + 0.010, mz), P.mouth, 0.05);
  }

  /* eyes — set forward on the face (humanoid, not sahuagin-side), a warm patient gold gaze
     locked level at the viewer, the third high-value zone.
     R2 SELF-CORRECTION: pushed forward + enlarged with the head rings above so the glow clears
     the torso silhouette and actually reads instead of vanishing behind the brow ring's own
     surface. */
  for(const s of [-1, 1]){
    const p = V(s * 0.082, L.browY + 0.010, 0.335);
    blob(p.x, p.y, p.z, 0.034, 0.028, 0.024, P.eye, 6, 4);
    blob(p.x, p.y + 0.002, p.z + 0.018, 0.020, 0.017, 0.014, P.eyeGlow, 4, 2);
  }

  /* ===== SIGNATURE — coral crown, seven branching spikes off the brow/crown, tallest
     front-center spike carrying a mid-height offshoot branch. Near-white coral highlight tips
     carry the law-3 value ladder well clear of the void. ===== */
  {
    const crestBase = crownC.clone().add(V(0, 0.01, -0.01));
    const spikes = [
      { dir: V(0.00, 1.00, 0.20).normalize(), len: 0.43, w: 0.044, branch: true },
      { dir: V(0.34, 0.94, 0.05).normalize(), len: 0.33, w: 0.038 },
      { dir: V(-0.34, 0.94, 0.05).normalize(), len: 0.33, w: 0.038 },
      { dir: V(0.56, 0.80, -0.10).normalize(), len: 0.27, w: 0.032 },
      { dir: V(-0.56, 0.80, -0.10).normalize(), len: 0.27, w: 0.032 },
      { dir: V(0.24, 0.86, -0.40).normalize(), len: 0.21, w: 0.026 },
      { dir: V(-0.24, 0.86, -0.40).normalize(), len: 0.21, w: 0.026 },
    ];
    /* R4 CRITIC FIX: the old 0.03 root-spread clustered all seven spikes at almost one point,
       so they read as fingers fanning off a fist/hand rather than coral branching off a wide
       crown base — widened the spread to sit the roots around the crown ring's own radius. */
    for(const sp of spikes){
      const root = crestBase.clone().add(V(sp.dir.x * 0.075, 0, sp.dir.z * 0.045));
      const tip = root.clone().addScaledVector(sp.dir, sp.len);
      tube(root, tip, sp.w, sp.w * 0.30, 5, P.coral, { capB: { hex: P.coralHi } });
      if(sp.branch){
        const mid = root.clone().lerp(tip, 0.56);
        const branchDir = V(sp.dir.x + 0.6, sp.dir.y * 0.7, sp.dir.z - 0.3).normalize();
        const bTip = mid.clone().addScaledVector(branchDir, sp.len * 0.42);
        tube(mid, bTip, sp.w * 0.55, sp.w * 0.18, 4, P.coralDk, { capB: { hex: P.coralHi } });
      }
    }
    /* small coral clump nodules at the crown base, between the spike roots */
    for(const a of [0.5, 2.1, 3.7, 5.3]){
      const c = crestBase.clone().add(V(Math.cos(a) * 0.065, 0.01, Math.sin(a) * 0.045));
      blob(c.x, c.y, c.z, 0.024, 0.020, 0.022, P.coralDk, 5, 3);
    }
  }

  /* ===== SIGNATURE — conch-shell shoulder plate, right shoulder, spiral ridge texture.
     R2 SELF-CORRECTION: the shell's blob radius overlapped the right arm's shoulder-attachment
     point almost exactly, burying the arm's origin so the whole limb read as missing. Moved the
     shell UP and further OUTWARD onto the shoulder cap (clear of the arm socket below it).
     R3 CRITIC FIX (fresh-context pass, post r2 engine render): the R2 fix pushed the shell to
     shldY+0.13 = 1.27, which is EXACTLY jawY (1.27) — the shell sat at face height, right next
     to the head, and being the single largest+brightest shape in the model it visually swallowed
     the face: no eyes, no gaze, no head silhouette read at all in the render (the pose sentence's
     whole point — "the gaze stays locked level" — was invisible). Dropped the shell back down
     onto the shoulder cap proper (clear of jawY) and pulled it slightly smaller so it reads as
     armor riding the shoulder, not a second head-sized mass crowding the face. */
  {
    const c = V(0.41, L.shldY + 0.02, 0.10);
    blob(c.x, c.y, c.z, 0.135, 0.100, 0.122, P.shell, 7, 4);
    /* spiral ridge lines */
    for(let i = 0; i < 3; i++){
      const t = i / 3;
      const a0 = t * Math.PI * 1.6, a1 = a0 + 0.9;
      const r0 = 0.14 - t * 0.05, r1 = 0.11 - t * 0.05;
      const p0 = V(c.x + Math.cos(a0) * r0, c.y + Math.sin(a0) * r0 * 0.6, c.z + 0.06 - t * 0.02);
      const p1 = V(c.x + Math.cos(a1) * r1, c.y + Math.sin(a1) * r1 * 0.6, c.z + 0.06 - t * 0.02);
      quad(p0, p1, p1.clone().add(V(0, -0.014, 0)), p0.clone().add(V(0, -0.014, 0)), P.shellDk, 0.06);
    }
    /* pale interior aperture, near-white so the shell's opening reads bright against the plate */
    blob(c.x - 0.03, c.y - 0.01, c.z + 0.10, 0.045, 0.035, 0.032, 0xf4ece6, 5, 3);
  }

  /* ===== ARMS — SIGNATURE: elbows dropped ONTO the raised knees, fish-scale forearms banded
     pale/dark down to the clasped hands hanging low between the knees.
     R2 SELF-CORRECTION: the shoulder anchor sat almost flush with the torso's own shoulder-band
     surface, so the upper arm read as fused into the torso silhouette instead of a separate
     limb. Pushed the shoulder point outward and forward, clear of the body. ===== */
  const shBase = V(0.42, L.shldY - 0.03, 0.24);
  function armSeated(sh, elbow, wrist, hex, hexDk){
    tube(sh, elbow, 0.155, 0.128, 7, hex);
    /* forearm — three banded scale segments, elbow to wrist */
    const q1 = elbow.clone().lerp(wrist, 0.33);
    const q2 = elbow.clone().lerp(wrist, 0.66);
    tube(elbow, q1, 0.128, 0.104, 7, P.scale, { phase: Math.PI / 7 });
    tube(q1, q2, 0.104, 0.084, 7, P.scaleDk, { phase: Math.PI / 7 });
    tube(q2, wrist, 0.084, 0.066, 7, P.scale, { phase: Math.PI / 7 });
    return wrist;
  }
  const elbowR = V(0.31, L.kneeY + 0.06, 0.41);
  const elbowL = V(-0.31, L.kneeY + 0.06, 0.41);
  const clasp = V(0.0, 0.21, 0.47);
  const wristR = clasp.clone().add(V(0.055, 0.01, 0.0));
  const wristL = clasp.clone().add(V(-0.055, 0.01, 0.0));
  armSeated(shBase, elbowR, wristR, P.skin, P.skinDk);
  armSeated(V(-shBase.x, shBase.y, shBase.z), elbowL, wristL, P.skinDk, P.skin);

  /* clasped hands — two overlapping blobs at the clasp point, a few loosely-curled finger
     stubs so the hands read as "loosely clasped" rather than fused into one mitt. */
  for(const [wr, s] of [[wristR, 1], [wristL, -1]]){
    blob(wr.x, wr.y, wr.z, 0.062, 0.050, 0.058, P.skin, 6, 4);
    for(const f of [-1, 0, 1]){
      const dir = V(-s * 0.35 + f * 0.22, -0.55, 0.55).normalize();
      const tip = wr.clone().addScaledVector(dir, 0.075);
      tube(wr, tip, 0.020, 0.010, 4, P.scale, { capB: { hex: P.scale } });
    }
  }

  /* ===== low tide-pool base (Huge, r=0.68) — a shallow water disc instead of stone/dirt: dark
     pool floor rim, a pale foam lip carrying the fourth high-value zone. ===== */
  {
    const rFloor = ring(V(0, 0.006, 0), V(0, 1, 0), 0.68, 0.68, 18);
    const rLip = ring(V(0, 0.045, 0), V(0, 1, 0), 0.655, 0.655, 18);
    stitch([rFloor, rLip], () => P.pool);
    capFan(rLip, V(0, 0.048, 0), P.poolDeep);
    /* foam rim at the pool's outer edge */
    const rFoamIn = ring(V(0, 0.050, 0), V(0, 1, 0), 0.66, 0.66, 18);
    const rFoamOut = ring(V(0, 0.030, 0), V(0, 1, 0), 0.68, 0.68, 18);
    stitch([rFoamOut, rFoamIn], () => P.foam);
  }
}
