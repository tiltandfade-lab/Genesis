/* dev/model-qa/creatures/rlm-gloom-werewolf.js — the WEREWOLF landmark table (HUMANOID-WOLF
   HYBRID family, Medium, CR 3, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000
   tri band (2026-07-08 foundry pilot, gloom-w2 cell 0). Bestiary frame "werewolf" (data/
   realm-bestiary.js's Trail-Boss / Wiseguy Werewolf entries, and any future gloom variant) rides
   this chassis narratively — bespoke to the CORE IDENTITY: the neighbor who wears the face of a
   wolf at midnight, swears every time will be the last.

   ANATOMY: hybrid rig, not a pure family — hind legs built per ANATOMY-CANON's QUADRUPED
   DIGITIGRADE section (4-segment Z-zigzag, hock set HIGH and BEHIND the stifle, near-vertical
   cannon to the paw), carrying a hunched HUMANOID torso mid-shift, topped with a wolf-skull head.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. DIGITIGRADE hind legs (ANATOMY-CANON's #1 most-failed structure, canon quoted verbatim):
        hip -> stifle (DOWN-and-FORWARD) -> hock (DOWN-and-BACK, HIGH ~0.35H, BEHIND the stifle,
        the sharp rearward bend) -> near-vertical metatarsus -> compact clawed paw. Bipedal stance,
        full body weight on this pair — anatomy is the chief capture criterion (law 4).
     2. SIGNATURE — the asymmetric mid-shift arms: the right arm is still a HUMAN clenched fist
        (unchanged proportions, pale skin), the left arm has ALREADY gone long and clawed (an
        elongated forearm, an oversized wolf-claw hand reaching well past the fist's reach). One
        loud exaggerated asymmetry (law 4) instead of two matched wolf arms.
     3. Open howling wolf-skull jaw — a tilted-up muzzle/lower-jaw pair (mid-howl, not a closed
        snarl), visible pale fangs breaking the dark mouth void — the high-value payload sitting
        directly on the signature (law 3). Triangular wide-set ears, amber glowing eyes.
     4. Torso arched BACK mid-transformation — spine bands drift backward (-z) as they rise, chest
        thrust up and back, a ridge of fur tufts along the spine breaking the humanoid silhouette
        into wolf territory as it climbs toward the shoulders.
     5. A torn pale shirt remnant at the waist/collar — the "neighbor" tell, the domestic clothing
        this used to be, shredded by the shift (cheap character beat, cheap silhouette break).
     6. Low sweeping wolf tail off the rump, built per ANATOMY-CANON's quadruped tail (base -> mid
        -> brush tip, low and back).

   POSE SENTENCE: caught mid-transformation rearing back on digitigrade wolf-legs, torso and chest
   arched up and back as the head snaps into a half-lifted howl with the jaw torn wide open, one
   arm still a clenched human fist held tight at the side while the other has already gone long
   and clawed and reaches out ahead of it — never a man in a wolf mask standing at attention,
   always caught in the half-second between the two forms.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 0, fn buildWerewolf). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { buildBase } from '../parts.js';

/* norm(): plain [x,y,z] array -> unit THREE.Vector3 (matches the medusa/vampire-spawn idiom). */
function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one clawed finger: two tapering segments, base -> dark claw tip. Kept >=0.010 at the tip so it
   clears the 0.04u-ish feature floor at the base and only the very point thins down (the
   vampire-spawn finger() idiom). */
function claw(base, dir, len, pale, tip){
  const dn = norm(dir);
  const mid = base.clone().addScaledVector(dn, len * 0.55);
  const end = base.clone().addScaledVector(dn, len);
  tube(base, mid, 0.020, 0.014, 4, pale);
  tube(mid, end, 0.014, 0.006, 4, tip, { capB: { hex: tip } });
}

/* one short human finger: stubbier, curled toward the palm (the clenched-fist read). */
function knuckle(base, dir, len, pale){
  const dn = norm(dir);
  const end = base.clone().addScaledVector(dn, len);
  tube(base, end, 0.017, 0.011, 4, pale, { capB: { hex: pale } });
}

export function buildWerewolf(){
  /* ---------- PALETTE (VS desaturated gloom register, matching rlm-gloom-medusa.js / rlm-gloom-
     vampire-spawn.js's convention: dark fur reads black-on-void, pale zones carry the value load
     for law 3 — the fists/fangs/eyes, right where the signature sits). ---------- */
  /* R2 CRITIC FIX (post r1 engine render): the whole body vanished into the void — the key light
     sits at (5,9,7) (front-up-right) but the "arched back" torso pose (see spineCz below) tilted
     every torso-band normal AWAY from it, so only fill+ambient (0.22+0.32) lit the coat instead of
     the 0.72 key; combined with a fairly dark base coat value, the silhouette read as pure black-
     on-void (the Creeper failure, law 3). Fixed two ways: lifted the whole fur ladder several
     steps brighter (so even the shadowed bands clear the void by a wide margin on their own), and
     (below) shrank the backward-lean magnitude so more of the torso's front surface still angles
     toward the key light/camera instead of turning fully away from both. */
  /* R3 CRITIC FIX (pass-2, fresh-context, this round): pixel-sampled every landmark in the actual
     r3 engine render against its projected screen position — jaw/muzzle/ears/eyes/tail/paws/claws
     ALL landed within a few RGB values of the VOID_BG clear color (0x0a0908), because every one of
     those identity-carrying features was painted with furDk/clawDk, the darkest tones in the
     palette (the R2 pass lifted the ladder but left the SIGNATURE riding the darkest tier — a
     second Creeper-class failure, law 3). Fix, following the medusa/vampire-spawn precedent (dark
     tones stay on body MASS only; every signature feature gets its own dedicated bright tone):
     added P.snout/P.snoutDk for the wolf-skull head (muzzle+jaw+ears — the "open howling jaw" IS
     the signature), and lifted fur/furDk/furLt/skin/clawDk/eye across the board so the digitigrade
     legs, tail and claws clear the void on their own instead of relying on a lucky key-light angle. */
  const P = {
    fur: 0x8f7a5c, furDk: 0x6b5a42, furLt: 0xab9673,      // desaturated brown-gray coat (R3: lifted well off void)
    snout: 0xa8916e, snoutDk: 0x7c6a4e,                   // R3 NEW — dedicated bright tone for the wolf-skull head (the signature)
    skin: 0xe0c6a0, skinDk: 0xb89a72,                     // the still-human fist + face patches (R3: lifted)
    clawDk: 0x453a2a,                                     // dark claw/nail tips (R3: lifted further off near-black)
    eye: 0xffcf66, eyeGlow: 0xffe896,                     // amber wolf eyes (R3: brighter still)
    tooth: 0xf5efe0, mouth: 0x140f0c, nose: 0x1c1613,
    shirt: 0xdcd2c2, shirtDk: 0xb2a794,                   // torn pale shirt remnant (R3: lifted)
    disc: 0x241f1a, discTop: 0x2e2820,
  };

  /* ---------- LANDMARKS — torso arches BACK as it rises (cz goes negative then the head snaps
     back up-and-forward into the howl): hips near-frontal over the leg zigzag, chest/shoulders
     drift back, head lifts. Never a flat vertical stack. ---------- */
  const L = {
    hipY: 0.85, waistY: 0.95, ribY: 1.06, chestY: 1.17, shldY: 1.30, neckY: 1.36,
    hipHalf: 0.135, shoulderX: 0.235,
  };
  /* R2 CRITIC FIX: the r1 lean (chest cz -0.095, shld -0.115) turned the torso's front surface
     fully away from the key light (5,9,7) — halved the magnitude so the arch still reads (the
     chest still drifts back relative to the hips) but enough front-facing surface survives to
     catch the key light instead of falling entirely to fill+ambient. */
  const spineCz = { hip: 0.00, waist: -0.010, rib: -0.026, chest: -0.045, shld: -0.055, neck: -0.040 };

  /* ===== TORSO — hunched-but-rearing loft, hips over the leg zigzag, chest arching up-and-back. */
  const torsoRings = stack([
    { y: L.hipY,   rx: 0.190, rz: 0.160, cz: spineCz.hip,   hex: P.furDk },
    { y: L.waistY, rx: 0.180, rz: 0.150, cz: spineCz.waist, hex: P.fur },
    { y: L.ribY,   rx: 0.190, rz: 0.158, cz: spineCz.rib,   hex: P.fur },
    { y: L.chestY, rx: 0.205, rz: 0.165, cz: spineCz.chest, hex: P.furLt },
    { y: L.shldY,  rx: 0.215, rz: 0.150, cz: spineCz.shld,  hex: P.fur },
    { y: L.neckY,  rx: 0.078, rz: 0.078, cz: spineCz.neck,  hex: P.furDk },
  ], 10, {});

  /* fur ridge — short tufts riding the spine's back edge (-z side of each rib/chest/shoulder
     band), breaking the humanoid silhouette into wolf territory as the arch climbs. */
  {
    const ridgeBands = [
      { y: L.ribY,   cz: spineCz.rib,   rz: 0.158 },
      { y: L.chestY, cz: spineCz.chest, rz: 0.165 },
      { y: L.shldY,  cz: spineCz.shld,  rz: 0.150 },
    ];
    ridgeBands.forEach((b, i) => {
      const root = V(0, b.y, b.cz - b.rz);
      const tip = V(0, b.y + 0.075, b.cz - b.rz - 0.045);
      tube(root, tip, 0.028, 0.008, 4, P.furDk, { raz: 0.055, rbz: 0.014, capB: { hex: P.furDk } });
    });
  }

  /* torn pale shirt remnant — a ragged collar band + two hanging shreds at the waist, the
     domestic-clothing tell (cheap silhouette break, cheap character beat). */
  {
    const c0 = ring(V(0, L.waistY - 0.03, spineCz.waist), V(0, 1, 0), 0.183, 0.153, 8, Math.PI / 8);
    const c1 = ring(V(0, L.waistY + 0.05, spineCz.waist + 0.01), V(0, 1, 0), 0.170, 0.142, 8, Math.PI / 8);
    stitch([c0, c1], () => P.shirt, { 0: [2, 3] }); // torn gap at one side
    for(const s of [-1, 1]){
      const root = V(s * 0.150, L.waistY - 0.02, spineCz.waist + 0.05);
      const mid = V(s * 0.175, L.hipY - 0.10, spineCz.waist + 0.02);
      const tip = V(s * 0.190, L.hipY - 0.22, spineCz.waist - 0.03);
      tube(root, mid, 0.045, 0.032, 4, P.shirtDk);
      tube(mid, tip, 0.032, 0.006, 4, P.shirtDk, { capB: { hex: P.shirtDk } });
    }
  }

  /* ===== HIND LEGS — digitigrade Z-zigzag per ANATOMY-CANON, load-bearing bipedal stance.
     hip -> stifle (fwd,down) -> hock (HIGH, BACK — behind the stifle) -> near-vertical cannon
     -> paw. Stance angles open ~110-150 deg at hip/stifle; the hock is the sharp rearward bend. */
  /* R2 CRITIC FIX: r1's stifle/hock/paw x (0.150/0.160/0.165) sat INSIDE the torso hip band's own
     radius (rx 0.190) — the legs rendered fully hidden behind/under the torso silhouette (the
     r2 render showed a single trapezoid mass, no zigzag at all). Widened the stance well past the
     torso radius (the vampire-spawn crouch's proven fix) so the digitigrade Z-bend actually breaks
     the silhouette instead of hiding straight under it. */
  {
    for(const s of [-1, 1]){
      const hip    = V(s * L.hipHalf, 0.85, -0.02);
      const stifle = V(s * 0.290,     0.56,  0.11);   // forward (+z) & down from hip, WIDE of the torso
      const hock   = V(s * 0.310,     0.30, -0.05);   // HIGH & BEHIND the stifle, WIDE
      const paw    = V(s * 0.290,     0.02,  0.03);   // near-vertical cannon, slight forward lean
      tube(hip, stifle, 0.088, 0.062, 7, P.fur);        // thigh — thick haunch
      tube(stifle, hock, 0.058, 0.044, 7, P.furDk);     // tibia — the backward run
      tube(hock, paw, 0.044, 0.028, 7, P.furDk);        // metatarsus/cannon
      /* compact clawed paw: a short foot block + three toe-claws */
      const ball = V(paw.x, 0.020, paw.z + 0.045);
      tube(paw, ball, 0.028, 0.024, 5, P.furDk);
      for(const tx of [-0.020, 0, 0.020]){
        const toeA = V(ball.x + tx * 0.7, 0.016, ball.z);
        const toeB = V(ball.x + tx, 0.004, ball.z + 0.050);
        tube(toeA, toeB, 0.013, 0.005, 4, P.furDk, { capB: { hex: P.clawDk } });
      }
    }
  }

  /* ===== TAIL — low sweeping brush off the rump, per ANATOMY-CANON quadruped tail (base -> mid
     -> tapered tip), rooted at the hip band's back edge. ===== */
  {
    const t0 = V(0, L.hipY - 0.06, spineCz.hip - 0.155);
    const t1 = V(0, 0.56, spineCz.hip - 0.320);
    const t2 = V(0, 0.28, spineCz.hip - 0.430);
    tube(t0, t1, 0.070, 0.050, 6, P.furDk, { phase: Math.PI / 6 });
    tube(t1, t2, 0.050, 0.014, 6, P.furDk, { phase: Math.PI / 6, capB: { hex: P.furDk } });
  }

  /* ===== HEAD — wolf skull rounding off the neck, then an explicit muzzle/jaw pair tilted UP
     for the mid-howl (not the horizontal canon muzzle — this creature's head is thrown BACK). ===== */
  const skullCz = spineCz.neck + 0.10; // skull sits forward of the neck top as the head lifts
  /* R3: the skull loft now rides P.snout/snoutDk (was furDk/fur/furDk) — the wolf-skull head IS
     the signature (open howling jaw), so it gets the dedicated bright tone, not the body's dark
     tier (the R3 header note explains why this was silently vanishing into the void). */
  const skull = stack([
    { y: L.neckY + 0.02, rx: 0.078, rz: 0.082, cz: spineCz.neck,       hex: P.snoutDk },
    { y: L.neckY + 0.09, rx: 0.096, rz: 0.100, cz: spineCz.neck + 0.02, hex: P.snout },
    { y: L.neckY + 0.15, rx: 0.082, rz: 0.084, cz: skullCz,             hex: P.snoutDk },
  ], 8, { capTop: { hex: P.snoutDk, lift: 0.020 } });

  const crownY = L.neckY + 0.15 + 0.02;
  const crownC = V(0, crownY, skullCz);

  /* ears — triangular pyramids seated on the skull crown (ANATOMY-CANON's ear-construction rule:
     seat from the surface, real 3D volume, 3 side faces so they read from every angle). */
  /* R3: taller apex (0.075->0.10) + wider base so the ear survives vertex-snap at this scale, and
     rerouted to snout/snoutDk (was fur/furDk) so it doesn't melt into the (now still-darker-than-
     snout) body-mass fur tone. */
  for(const sx of [-1, 1]){
    const cx = sx * 0.052, ez = crownC.z - 0.01;
    const a = V(cx - 0.032, crownY, ez - 0.032);
    const b = V(cx + 0.032, crownY, ez + 0.018);
    const c = V(cx, crownY, ez + 0.034);
    const apex = V(cx + sx * 0.010, crownY + 0.10, ez - 0.008);
    quad(a, b, apex, apex, P.snout, 0.03);
    quad(b, c, apex, apex, P.snoutDk, 0.03);
    quad(c, a, apex, apex, P.snout, 0.03);
  }

  /* amber glowing eyes — small blobs on the skull sides, angled up-and-forward (tracking the sky
     mid-howl). R3: enlarged (0.017->0.026) and pushed further proud of the skull surface (+0.058
     -> +0.075) — pixel-sampling the r3 render showed the old size dissolving at 1/3-res (under the
     0.04u feature floor, law 3), reading as the void instead of the amber signature. */
  for(const s of [-1, 1]){
    const ex = s * 0.050, ey = crownY - 0.035, ez = skullCz + 0.075;
    blob(ex, ey, ez, 0.026, 0.024, 0.020, P.eye, 6, 4);
    blob(ex, ey + 0.004, ez + 0.010, 0.012, 0.012, 0.011, P.eyeGlow, 4, 2);
  }

  /* upper muzzle — from the skull crown, tilted UP-and-forward into the howl (dir roughly 55 deg
     off horizontal). ===== */
  const muzzleBase = V(0, crownY - 0.01, skullCz + 0.05);
  const muzzleMid = muzzleBase.clone().addScaledVector(norm([0, 0.62, 0.79]), 0.135);
  const muzzleTip = muzzleMid.clone().addScaledVector(norm([0, 0.55, 0.84]), 0.140);
  /* R3: furDk -> snout/snoutDk — the muzzle is half the "open howling jaw" signature payload. */
  tube(muzzleBase, muzzleMid, 0.078, 0.055, 6, P.snout);
  tube(muzzleMid, muzzleTip, 0.055, 0.020, 6, P.snoutDk, { capB: { hex: P.nose } });

  /* lower jaw — dropped OPEN: hinges near the skull's jaw band, swings down-and-forward, ending
     well short of and below the muzzle tip so the gap between them reads as a genuine howling
     gape (the pale mouth void + fangs sit in that gap — law 3's payload on the signature). ===== */
  const jawHinge = V(0, L.neckY + 0.035, spineCz.neck + 0.045);
  const jawMid = jawHinge.clone().addScaledVector(norm([0, -0.20, 0.92]), 0.150);
  const jawTip = jawMid.clone().addScaledVector(norm([0, -0.10, 0.95]), 0.130);
  /* R3: furDk -> snout/snoutDk — the lower jaw is the other half of the howl signature. */
  tube(jawHinge, jawMid, 0.066, 0.046, 6, P.snout);
  tube(jawMid, jawTip, 0.046, 0.018, 6, P.snoutDk, { capB: { hex: P.snoutDk } });

  /* mouth void — a dark fan filling the gap between the upper muzzle underside and the lower jaw
     top, so the howl reads as a real open cavity, not two disconnected wedges. */
  quad(muzzleBase.clone().add(V(-0.055, -0.02, 0)), muzzleBase.clone().add(V(0.055, -0.02, 0)),
       jawHinge.clone().add(V(0.048, 0.02, 0)), jawHinge.clone().add(V(-0.048, 0.02, 0)), P.mouth, 0.02);
  quad(muzzleMid.clone().add(V(-0.040, -0.015, 0)), muzzleMid.clone().add(V(0.040, -0.015, 0)),
       jawMid.clone().add(V(0.034, 0.015, 0)), jawMid.clone().add(V(-0.034, 0.015, 0)), P.mouth, 0.02);

  /* fangs — pale, breaking the dark mouth void: two upper canines hanging from the muzzle
     underside, two lower canines rising from the jaw. */
  /* R3: fangs were 0.011/0.003 radius (0.022u diameter at the base) — under law 3's 0.04u floor,
     so they were dissolving at 1/3-res instead of "breaking the dark mouth void". Thickened +
     lengthened so the pale/dark payload actually survives the engine grade. */
  for(const s of [-1, 1]){
    const upBase = muzzleMid.clone().add(V(s * 0.030, -0.018, -0.01));
    const upTip = upBase.clone().addScaledVector(norm([0, -1, 0.15]), 0.095);
    tube(upBase, upTip, 0.020, 0.009, 4, P.tooth, { capB: { hex: P.tooth } });
    const loBase = jawMid.clone().add(V(s * 0.026, 0.014, -0.01));
    const loTip = loBase.clone().addScaledVector(norm([0, 1, -0.1]), 0.080);
    tube(loBase, loTip, 0.018, 0.008, 4, P.tooth, { capB: { hex: P.tooth } });
  }

  /* ===== ARMS — the asymmetric mid-shift. RIGHT (screen +x): still a HUMAN clenched fist, held
     tight at the side, unchanged proportions. LEFT (screen -x): already gone long and clawed,
     reaching well past the fist's reach. ===== */
  {
    /* right — human arm, clenched fist held at the side */
    const shR = V(L.shoulderX, L.shldY - 0.02, spineCz.shld + 0.06);
    const elR = V(0.290, 1.020, spineCz.shld - 0.02);
    const wrR = V(0.270, 0.800, spineCz.shld + 0.03);
    tube(shR, elR, 0.052, 0.040, 6, P.fur);
    tube(elR, wrR, 0.038, 0.026, 6, P.skinDk);
    blob(wrR.x, wrR.y, wrR.z, 0.032, 0.028, 0.030, P.skin, 6, 4);
    /* four curled knuckles — the clenched-fist read, short and stubby vs. the left hand's claws */
    for(const d of [[0.20, -0.30, 0.90], [0.05, -0.40, 0.95], [-0.12, -0.38, 0.92], [-0.28, -0.25, 0.85]])
      knuckle(wrR, d, 0.036, P.skin);

    /* left — elongated, already-clawed arm, reaching forward-out ahead of the body. R2: pulled
       the reach in a touch (was -0.480) — the r1 bbox came out unnecessarily wide, forcing the
       auto-frame camera to zoom out further and making the whole silhouette read smaller/darker. */
    const shL = V(-L.shoulderX, L.shldY - 0.02, spineCz.shld + 0.06);
    const elL = V(-0.350, 0.920, spineCz.shld + 0.15);
    const wrL = V(-0.440, 0.640, spineCz.shld + 0.36);
    tube(shL, elL, 0.056, 0.040, 6, P.fur);
    tube(elL, wrL, 0.040, 0.026, 6, P.furDk); // longer + thinner forearm than the human arm — "too long"
    blob(wrL.x, wrL.y, wrL.z, 0.038, 0.030, 0.036, P.furDk, 6, 4);
    const fingersL = [[0.55, -0.35, 0.75], [0.20, -0.45, 0.90], [-0.15, -0.40, 0.95], [-0.45, -0.25, 0.80]];
    for(const d of fingersL) claw(wrL, d, 0.135, P.skinDk, P.clawDk);
  }

  /* base disc (Medium: r=0.42) */
  buildBase(P);
}
