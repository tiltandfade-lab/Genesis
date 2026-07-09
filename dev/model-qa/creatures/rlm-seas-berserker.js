/* dev/model-qa/creatures/rlm-seas-berserker.js — the BERSERKER landmark table (HUMANOID family,
   Medium, CR 2, realm high-seas), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (2026-07-08 foundry pilot, seas-w2 cell 7). Core identity: the frothing shirtless axe-fighter —
   starvation-mad deserter / first-wave boarding axeman. Realm-bestiary garnish from the "Doldrums-
   Drunk Deserter" entry (data/realm-bestiary.js, frame/model "berserker"): "his ribs show through a
   torn shirt... the flat, glassy focus of someone who jumped ship rather than starve... doesn't
   recognize rescue when it's offered — only threat." HUMANOID = the PC-kit grammar per ANATOMY-
   CANON's noted-for-completeness stub; built here bespoke to the "berserker" render key so realm
   reskins (Company Strikebreaker, Face-Paint Marauder, Chem-Huffer, Blackmail Photographer, Rib-
   Cracked Thrall-Sergeant, The Berserker elite) ride this chassis narratively. Distinct from the
   older theater-lens rlm-longship-berserker.js (low-ready axe, pelt mantle) — this is the death-
   oath OVERHEAD haul, no mantle, bare torso is the whole point.

   FEATURE CHECKLIST (baked to 617 tris — under the 1,000-2,000 band; law 1: under-band is fine when
   every feature reads, and padding to hit a number is banned):
     1. HUMANOID torso + legs per ANATOMY-CANON's PC-kit stub — lean-muscled bare torso (no shirt,
        the starvation-rib tell) over dark canvas trousers, a rope belt cinched at the waist, torso
        arched backward off the hips as the counterweight to the overhead haul.
     2. SIGNATURE — the overhead two-hand axe arc (law 4's one loud feature): both arms raised
        together, hands gripping a shared haft, hauling the boarding axe up and back into a full
        arch behind the skull — the death-oath windup, not a held-ready stance.
     3. Wild tangled hair — five uneven spike clumps radiating off the skull in different directions,
        the unkempt deserter's mane, none of it groomed into a single sweep.
     4. Gaunt scream face — jaw wrenched to its widest drop, hollow starvation-sunken cheeks, wide
        manic eyes, the mouth carrying the pose's loudest single beat.
     5. Bare torso skin ladder (law 3's high-value zone) riding pale ribs/abs up from the rope belt,
        against dark trousers below and the axe's dark iron head above — with only the honed blade
        edge lifted brighter than the skin, so signature and anatomy share the one lit zone.
     6. Braced lunge stance — front knee driven forward and bent, back leg trailing straight, weight
        rocking onto the front foot as the axe comes up: the boarding charge caught mid-stride, never
        a standing plant.

   POSE SENTENCE: braced in a forward lunge, front knee driven out and bent, weight rocking onto the
   forward foot, torso arched back off the hips as both hands haul a boarding axe up and back into a
   full overhead arch behind the skull, chest bared and thrown open to the coming blow, head wrenched
   back, jaw torn open into the widest scream of the death-oath — never a standing ready stance.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0, base disc r=0.42 (Medium). Imported by ps1-sheet.html (SETS['seas-w2'], cell 7, fn
   buildBerserker). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, setChannels } from '../probe-lib.js';

export function buildBerserker(){
  /* ---------- PALETTE (VS desaturated high-seas register; pale bare-skin torso is the ONE
     dominant high-value zone, honed axe edge the second smaller beat, everything else — trousers,
     hair, rope, iron — sits well below it so the signature and anatomy share the light). ---------- */
  const P = {
    skin: 0xc9a179, skinDk: 0x9c7a56, skinLt: 0xe0bd94,        // bare torso/arms — the law-3 high-value zone
    scarDk: 0x86643f,                                          // rib/ab shading lines
    trouser: 0x5c4e37, trouserDk: 0x3e3423, trouserLt: 0x7a6a4a, // worn canvas trousers (lifted off the void — R2)
    rope: 0x8a7043, ropeDk: 0x5e4a28,                          // rope belt
    hair: 0x3a3126, hairDk: 0x241e17,                          // wild tangled hair
    eye: 0x120e0a, eyeWhite: 0xdcd0b8,                         // wide manic gaze
    mouth: 0x160f0d, tooth: 0xd8cfb0, tongue: 0x7a2a24,
    wood: 0x7a5c3c, woodDk: 0x4e3c26,                          // axe haft — CRITIC-R2: lifted 2 tiers off the void,
                                                                 // R7's 0x4a3826/0x322418 sampled within ~20-50 RGB of
                                                                 // black and the whole haft vanished into the top void
    iron: 0x5c5d54, ironDk: 0x3a3b35,                          // axe head body — likewise lifted off near-black
    steel: 0xeef1e2,                                            // honed edge — the second high-value beat, brightened
    faceLt: 0xf2dcb4,                                           // CRITIC-R2: dedicated brightest tier for the FACE
                                                                 // only, so cheek/brow separate in value from the
                                                                 // arms (r7 shared one skin ladder across head+arms
                                                                 // and the whole overhead cluster fused into one blob)
    disc: 0x2c281f, discTop: 0x37311f,
  };
  setChannels({
    [P.skin]: 'skin', [P.skinDk]: 'skin', [P.skinLt]: 'skin', [P.scarDk]: 'skin',
    [P.trouser]: 'cloth', [P.trouserDk]: 'cloth', [P.trouserLt]: 'cloth',
    [P.rope]: 'leather', [P.ropeDk]: 'leather',
    [P.hair]: 'fur', [P.hairDk]: 'fur',
    [P.eye]: 'skin', [P.eyeWhite]: 'skin', [P.mouth]: 'skin', [P.tooth]: 'bone', [P.tongue]: 'skin',
    [P.wood]: 'wood', [P.woodDk]: 'wood',
    [P.iron]: 'metal', [P.ironDk]: 'metal', [P.steel]: 'metal',
    [P.faceLt]: 'skin',
  });

  /* ===== RIG — braced lunge, torso arched backward off the hips as the counterweight to the
     overhead haul (never a level frontal stand). ===== */
  const L = {
    hipY: 0.58, waistY: 0.70, ribY: 0.83, chestY: 0.96, shldY: 1.04, neckY: 1.09,
    jawY: 1.13, cheekY: 1.185, browY: 1.24, crownY: 1.31,
    hipHalf: 0.125, shoulderX: 0.185,
  };
  const arch = (p) => {
    const t = Math.max(0, (p.y - L.hipY) / (L.crownY - L.hipY));
    return V(p.x, p.y + 0.015 * t, p.z - 0.085 * t);
  };
  /* head gets the arch PLUS an extra backward tilt — the scream reads at the head, not just the spine.
     R2 SELF-CORRECTION (post r1 engine render): r1's head sat at nearly the SAME y/z neighborhood as
     the raised forearms (elbow y~1.32 vs crown y~1.33), so the whole overhead cluster read as one
     skin blob with no legible face — the head silhouette never separated from the arm/axe signature.
     Tilt eased back (-0.30 -> -0.20 rad) and a forward +z push added so the face sits CLOSER to the
     camera than the arms, which are now routed further out laterally (see arm rig below). */
  const headTilt = (p) => {
    const q = p.clone().sub(V(0, L.neckY, 0));
    q.applyAxisAngle(V(1, 0, 0), -0.20);
    const a = arch(q.add(V(0, L.neckY, 0)));
    return V(a.x, a.y, a.z + 0.05);
  };

  /* ===== LEGS — braced lunge: front leg (+z, right) driven forward and bent, back leg (-z, left)
     trailing straight, weight rocking onto the front foot. Dark canvas trousers hip->ankle, bare
     feet. ===== */
  {
    const hipR = V(L.hipHalf, L.hipY - 0.01, 0.02);
    const kneeR = V(0.215, 0.335, 0.285);
    const ankR = V(0.195, 0.075, 0.415);
    tube(hipR, kneeR, 0.072, 0.056, 6, P.trouserDk);
    tube(kneeR, ankR, 0.052, 0.036, 6, P.trouser, { phase: Math.PI / 6 });
    /* ragged rolled cuff at the ankle, bare shin peeking under it */
    tube(ankR, ankR.clone().add(V(0, -0.02, 0.01)), 0.040, 0.038, 6, P.trouserLt);

    const hipL = V(-L.hipHalf, L.hipY - 0.01, -0.02);
    const kneeL = V(-0.165, 0.225, -0.235);
    const ankL = V(-0.150, 0.075, -0.345);
    tube(hipL, kneeL, 0.070, 0.052, 6, P.trouserDk);
    tube(kneeL, ankL, 0.048, 0.034, 6, P.trouser, { phase: Math.PI / 6 });
    tube(ankL, ankL.clone().add(V(0, -0.015, -0.01)), 0.038, 0.036, 6, P.trouserLt);

    /* bare feet — heel + splayed toe stubs, front foot planted flat-forward, back foot on the ball.
       ballDrop keeps every generated point at/above y=0 (min.y>=-0.01 gate) for either ankle height. */
    function foot(ank, toeDir, hex, ballDrop){
      /* Math.max of two negative deltas picks the LESS-negative (smaller drop) — the tight
         constraint that keeps every generated point at/above y~0.01 regardless of ankle height. */
      const heelDrop = Math.max(-0.03, -ank.y + 0.045);
      const heel = ank.clone().addScaledVector(toeDir, -0.05).add(V(0, heelDrop, 0));
      const ballDropClamped = Math.max(-ballDrop, -ank.y + 0.045);
      const ball = ank.clone().addScaledVector(toeDir, 0.09).add(V(0, ballDropClamped, 0));
      tube(ank, ball, 0.040, 0.036, 6, hex);
      tube(ank, heel, 0.032, 0.020, 5, hex, { capB: { hex } });
      for(const s of [-1, 0, 1]){
        const tipDrop = Math.max(-0.006, -ball.y + 0.045);
        const tip = ball.clone().addScaledVector(toeDir, 0.045).add(V(s * 0.018, tipDrop, 0));
        tube(ball, tip, 0.014, 0.006, 3, hex, { capB: { hex: P.skinLt } });
      }
    }
    foot(ankR, V(0, 0, 1), P.skin, 0.055);
    foot(ankL, V(0, 0, -1), P.skinDk, 0.055);
  }

  /* ===== TORSO — bare lean-muscled build, arched back off the hips, the law-3 high-value zone. ===== */
  stack([
    { y: L.hipY,   rx: 0.135, rz: 0.115, hex: P.trouserDk },     // waistband of the trousers
    { y: L.waistY, rx: 0.128, rz: 0.108, hex: P.skinDk },
    { y: L.ribY,   rx: 0.150, rz: 0.118, hex: P.skin },
    { y: L.chestY, rx: 0.168, rz: 0.130, hex: P.skinLt },
    { y: L.shldY,  rx: 0.190, rz: 0.126, hex: P.skin },
    { y: L.neckY,  rx: 0.068, rz: 0.060, hex: P.skinDk },
  ], 9, { xform: arch });

  /* rope belt — a thin knotted tube ring at the waist, cinched over the trouser band */
  {
    const c = arch(V(0, L.hipY + 0.02, 0.0));
    const r1 = ring(c, V(0, 1, 0), 0.140, 0.120, 10, Math.PI / 10).map(arch);
    const r2 = ring(c.clone().add(V(0, 0.022, 0)), V(0, 1, 0), 0.138, 0.118, 10, Math.PI / 10).map(arch);
    stitch([r1, r2], () => P.rope);
    /* a short dangling knot-tail */
    const knotBase = arch(V(0.02, L.hipY + 0.01, 0.125));
    tube(knotBase, knotBase.clone().add(V(0.01, -0.08, 0.01)), 0.018, 0.007, 4, P.ropeDk, { capB: { hex: P.ropeDk } });
  }

  /* rib/ab shading lines — cheap countable muscle-definition ticks riding the bare torso */
  for(const [y, w] of [[L.ribY + 0.03, 0.075], [L.chestY - 0.03, 0.09], [L.waistY + 0.04, 0.055]]){
    const c = arch(V(0, y, 0.135));
    quad(V(c.x - w, c.y + 0.012, c.z), V(c.x + w, c.y + 0.012, c.z),
         V(c.x + w * 0.7, c.y - 0.012, c.z - 0.006), V(c.x - w * 0.7, c.y - 0.012, c.z - 0.006), P.scarDk, 0.05);
  }

  /* ===== HEAD — gaunt scream face, wild tangled hair.
     R5 SELF-CORRECTION (post r4 engine render, red debug-quad isolation confirmed the mouth was
     geometrically present but reduced to a couple of pixels): the head rings barely flared past the
     neck band's own radius (cheek rx=0.104 vs. neck rx=0.068 — only 53% wider), so head/neck/shoulder
     read as one continuous skin cylinder with no jaw/cheek silhouette bump to hang a face on, and the
     dark mouth cavity (0x160f0d) sat within ~12 RGB of the 0x0a0908 void per law 3. Head widened well
     past the neck (cheek rx=0.148, ~2.2x the neck) so it reads as a real head-shaped bulge, and a pale
     lip rim now frames the dark maw (the sea-hag convention) so "open mouth" reads even when the
     cavity itself blends toward the void. ===== */
  const jawC = headTilt(V(0, L.jawY, 0.085));
  const cheekC = headTilt(V(0, L.cheekY, 0.100));
  const browC = headTilt(V(0, L.browY, 0.086));
  const crownC = headTilt(V(0, L.crownY, 0.050));
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.118, 0.132, 8, Math.PI / 8),
    ring(cheekC, V(0, 1, 0), 0.140, 0.148, 8, Math.PI / 8),
    ring(browC, V(0, 1, 0), 0.132, 0.130, 8, Math.PI / 8),
    ring(crownC, V(0, 1, 0), 0.096, 0.090, 8, Math.PI / 8),
  ];
  /* CRITIC-R2: cheek+brow now carry the dedicated P.faceLt tier (brighter than any arm/torso skin
     tone) instead of the shared skin/skinDk/skinLt ladder — r7's head and raised-arm cluster used
     the exact same three tones with no value break at their shared boundary, so they read as one
     fused blob in the engine capture (confirmed on the zoomed crop: no separable head silhouette). */
  stitch(headRings, (b) => [P.skinDk, P.faceLt, P.faceLt, P.skinDk][b] ?? P.skin);
  capFan(headRings[3], crownC.clone().add(V(0, 0.018, -0.01)), P.hairDk);
  /* sunken starvation cheeks — pull two ring verts inward */
  for(const i of [0, 4]){ headRings[1][i].x *= 0.84; headRings[1][i].z *= 0.88; }

  /* jaw wrenched wide open — the loudest single beat (checklist item 4). A pale lip rim frames the
     dark cavity so the "open mouth" read survives even where the cavity color nears the void.
     R6 SELF-CORRECTION (post r6 engine render + clean-probe cross-check via mountSheet turnaround):
     the probe render showed the mouth as a legible small red patch, but the ENGINE (ps1-sheet)
     capture showed nothing at all at that pixel — because R5's head-widening (jaw rz=0.132) grew the
     ring's own front surface OUT PAST the mouth quad's old fixed z-offset (jawC.z+0.075), burying the
     whole mouth/tongue/teeth cluster INSIDE the skull mass, occluded from outside. Every z-offset
     below is now set to clear the jaw ring's own rz (0.132) with real margin. */
  {
    const my = jawC.y - 0.005, mz = jawC.z + 0.175;
    quad(V(-0.050, my + 0.026, mz + 0.006), V(0.050, my + 0.026, mz + 0.006),
         V(0.058, my - 0.078, mz - 0.014), V(-0.058, my - 0.078, mz - 0.014), P.skinLt, 0.04);
    quad(V(-0.040, my - 0.062, mz - 0.02), V(0.040, my - 0.062, mz - 0.02),
         V(0.048, my + 0.020, mz), V(-0.048, my + 0.020, mz), P.mouth, 0.03);
    quad(V(-0.018, my - 0.040, mz - 0.01), V(0.018, my - 0.040, mz - 0.01),
         V(0.024, my - 0.004, mz - 0.004), V(-0.024, my - 0.004, mz - 0.004), P.tongue, 0.04);
    for(const s of [-1, 1]){
      const fx = s * 0.033;
      tube(V(fx, my + 0.017, mz + 0.006), V(fx, my - 0.015, mz - 0.004), 0.008, 0.002, 3, P.tooth, { capB: { hex: P.tooth } });
    }
  }

  /* wide manic eyes — bright whites so the gaze reads even in a small render. Built off browC + a
     generous LOCAL forward offset (not re-run through headTilt with a raw z, which under-shot the
     brow ring's own rz=0.130 the same way the mouth did) so the whites clear the skull surface. */
  for(const s of [-1, 1]){
    const p = V(browC.x + s * 0.078, browC.y + 0.014, browC.z + 0.165);
    quad(V(p.x - 0.026, p.y + 0.016, p.z), V(p.x + 0.026, p.y + 0.016, p.z),
         V(p.x + 0.024, p.y - 0.018, p.z - 0.005), V(p.x - 0.024, p.y - 0.018, p.z - 0.005), P.eyeWhite, 0.04);
    tube(V(p.x, p.y - 0.002, p.z + 0.008), V(p.x, p.y - 0.002, p.z + 0.018), 0.012, 0.004, 4, P.eye, { capB: { hex: P.eye } });
  }

  /* wild tangled hair — five uneven spike clumps off the skull, no single sweep. Roots seated from
     the crown ring's own SURFACE (per ANATOMY-CANON's cross-family rule 2), not the center.
     R6 SELF-CORRECTION (post r5 neon isolation): the hair tips (crownY+0.21) reached to within 0.02u
     of the wrist grip (y~1.56) — head+hair and the raised-hand cluster occupied almost the SAME
     vertical band, so no matter how big the head got, it visually fused with the hand/axe blob.
     Hair shortened so its tallest tip stays a clear ~0.10-0.12u below the wrist, opening real air
     between the screaming face and the haul overhead. */
  for(const [dx, dy, dz, len] of [
    [-0.060, 0.030, -0.070, 0.095], [0.065, 0.028, -0.062, 0.085], [0.0, 0.042, -0.088, 0.115],
    [-0.095, 0.010, -0.014, 0.075], [0.095, 0.007, -0.007, 0.070],
  ]){
    const base = crownC.clone().add(V(dx * 0.85, dy, dz * 0.80));
    const tip = crownC.clone().add(V(dx * 1.7, dy + len, dz * 1.5));
    tube(base, tip, 0.026, 0.007, 4, (dx < 0) ? P.hair : P.hairDk, { capB: { hex: P.hairDk } });
  }

  /* ===== SIGNATURE — both arms raised together, hauling the axe up and back into a full overhead
     arch behind the skull.
     R3 SELF-CORRECTION (post r2 engine render, debug-color isolation confirmed the head was tiny
     and buried directly behind/inside the wrist cluster): r2 still converged the forearms in almost
     the SAME 3D neighborhood as the head/hair, so the much-thicker arm tubes visually swallowed the
     face. Elbows now rise nearly STRAIGHT UP from the shoulders, well OUTSIDE the head's x-radius
     (|x|>=0.30, clear of the head's ~0.09 max), framing the face like a window rather than crossing
     it; the wrists then converge to a grip lifted well ABOVE the hair tips (y=1.72+, vs. hair topping
     out ~1.5) so a visible dark gap of open air separates the screaming face from the haul overhead. */
  /* R4 SELF-CORRECTION (post r3 engine render): r3's overhead arc reached y~2.1, nearly 60% taller
     than the head/torso alone — the auto-frame camera zoomed out to fit that height, shrinking the
     head (and its mouth/eye/hair detail) to a handful of pixels at 1/3-res. Compacted the whole
     overhead haul so the grip sits just clear of the hair tips (not far above them) and the axe head
     stops well short of doubling the figure's height — the face now claims a real share of the frame. */
  const shR = arch(V(L.shoulderX, L.shldY - 0.01, 0.02));
  const elR = V(0.280, 1.18, 0.05);
  const wrR = V(0.115, 1.56, -0.045);
  tube(shR, elR, 0.062, 0.048, 6, P.skin);
  tube(elR, wrR, 0.046, 0.032, 6, P.skinDk, { phase: Math.PI / 6 });

  const shL = arch(V(-L.shoulderX, L.shldY - 0.01, 0.02));
  const elL = V(-0.270, 1.20, 0.03);
  const wrL = V(-0.100, 1.585, -0.06);
  /* CRITIC-R2: was P.skinLt — competed with the torso's own chest highlight and the new face tier
     for "brightest zone," muddying the value hierarchy. Arms now sit a step below both. */
  tube(shL, elL, 0.060, 0.046, 6, P.skin);
  tube(elL, wrL, 0.044, 0.030, 6, P.skinDk, { phase: Math.PI / 6 });

  /* AXE — shared haft gripped by both hands, angled up and back behind the skull, the head fanning
     into a broad blade with a bright honed edge (the second high-value beat). */
  {
    const gripLow = V(0.04, 1.61, 0.0);
    const gripHigh = V(0.02, 1.67, -0.06);
    const headBase = V(-0.02, 1.78, -0.165);
    const headTip = V(-0.05, 1.86, -0.225);
    /* CRITIC-R2: haft radii widened (0.024/0.022/0.018 -> 0.034/0.030/0.024) — at the r7 thickness the
       diagonal haft crossed well under the ~0.04u feature floor and, combined with the dark wood tones,
       dissolved to almost nothing at 1/3-res (confirmed via zoomed-crop inspection of berserker-r7.png:
       the whole overhead haul read as a faint near-black hairline). Widening is the fix on top of the
       value lift above — a thin light-colored line still dissolves; needs both. */
    tube(gripLow, gripHigh, 0.034, 0.030, 6, P.wood);
    tube(gripHigh, headBase, 0.030, 0.024, 6, P.woodDk);
    /* butt end continuing down past the grip along the back — reads as haft length in silhouette */
    tube(gripLow, gripLow.clone().add(V(0.03, -0.20, 0.045)), 0.030, 0.018, 5, P.woodDk, { capB: { hex: P.woodDk } });

    /* broad single blade — dark iron body, bright steel edge lifted clear of the void.
       CRITIC-R2: the honed-edge sliver widened ~1.6x (was hugging the 0.04u floor and vanished
       entirely in the r7 render — not one lit pixel visible on the whole axe head). */
    const eA = headBase.clone().add(V(0.045, 0.055, -0.03));
    const eB = headTip.clone().add(V(0.030, 0.075, -0.05));
    const eC = headTip.clone().add(V(-0.055, -0.020, 0.01));
    const eD = headBase.clone().add(V(-0.040, -0.010, 0.02));
    quad(eA, eB, eC, eD, P.iron, 0.05);
    /* honed edge sliver along the top curve of the blade */
    quad(eA, eB, eB.clone().add(V(0.032, 0.048, -0.024)), eA.clone().add(V(0.022, 0.038, -0.019)), P.steel, 0.03);
    /* dark spine/socket where the blade meets the haft */
    quad(headBase.clone().add(V(0.02, 0.02, -0.01)), headBase.clone().add(V(-0.02, 0.0, 0.015)),
         eD, eA, P.ironDk, 0.04);
  }

  /* ===== base disc (Medium: r=0.42) ===== */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.058, 0), P.discTop);
  }
}
