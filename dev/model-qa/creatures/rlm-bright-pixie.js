/* dev/model-qa/creatures/rlm-bright-pixie.js — the PIXIE landmark table (HUMANOID Tiny fey +
   WINGED insect-wing family), Tiny, CR 1/8, realm bright-kingdom, authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, bright-w1 cell 5, port 5355).
   Core identity: a candy-coated sugar-shard pixie, tiny winged fey, pure mischief — UNARMED glee,
   deliberately distinct from the gloom sprite (which is armed with a drawn needle-sword and dives
   in a tight combat lean). The pixie carries nothing; both hands are thrown wide trailing sparkle
   motes instead of a weapon. Bespoke to the render key "pixie" (frame:"pixie" in
   data/realm-bestiary.js, "sugar-shard pixie giggling above dog-whistle pitch").

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID Tiny fey torso/head/limbs per ANATOMY-CANON — a compact loft, TIPPED SIDEWAYS
        (barrel-roll roll axis, not the sprite's forward dive pitch) so the whole figure reads as
        mid-cartwheel through the air.
     2. SIGNATURE — two pairs of bright insect wing panes (fore + hind, WINGED family: leading-edge
        spar strut + membrane pane + a visible vein-line crossing it) built candy-bright/near-white
        with a rainbow-tinted spar so they carry the model's loudest high-value zone (law 3).
     3. SPARKLE MOTES — 3-4 small bright floating dots trailing from both flung-wide hands, the
        SECOND high-value zone (candy-sugar shrapnel read, unarmed — no blade anywhere on this
        model, the deliberate anti-sprite distinction).
     4. Small round candy-sweet fey face, mid-giggle (open small mouth, not the sprite's plain
        closed watchful line) — pointed ears break the head silhouette.
     5. Both hands thrown WIDE open, fingers spread, at opposite low/high diagonals (not one
        cocked-back sword arm) — the giggling barrel-roll's counterweight pair.
     6. Legs bent and tucked to the side (knees pulled up, following the roll), not dangling or
        trailing straight back — the sideways tip reads through the whole silhouette, torso AND
        limbs.
     7. Candy palette — sugar-pink/mint/lemon garb + pale sugar-white skin against dark void,
        rainbow-glint accents on the wing spars and motes (bright-kingdom carnival register per
        data/realm-bestiary.js, CORE identity color leads: candy-coated, not generic fey-green).

   POSE SENTENCE: caught mid-giggle in a barrel-roll — the whole body tipped hard sideways (roll
   axis, cx growing with y instead of the sprite's forward-dive cz), knees tucked up and in toward
   the roll, both hands thrown wide open at opposite diagonals trailing bright sparkle motes, all
   four wings caught at different beat angles mid-spin, hovering ~0.3u above the tile — never a
   vertical standing hover.

   SPINE-GESTURE SENTENCE (ANATOMY-CANON POSE-ANATOMY law 1): the pelvis->chest->skull line is one
   continuous lateral C-curve baked into cx-per-band (hip cx=0 -> crown cx pushed hard to one side),
   the tuck-roll's actual gesture line; arms hang off that curve at bent shoulder/elbow/wrist arcs
   (~110-130deg), never straight sticks, and the shoulders/hips counter-tilt against each other
   (law 3/4) so the barrel-roll doesn't read as a stiff mannequin pitched over.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. All geometry authored in absolute world coordinates (no local pt()-offset frame),
   following the sprite's proven wave-1 pattern. Imported by ps1-sheet.html (SETS['bright-w1'],
   cell 5, fn buildPixie). */
import { THREE, V, quad, tube, stack, blob } from '../probe-lib.js';
import { buildBase, BASE_P } from '../parts.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one clawless finger stub — pale, short, spread open (no gripping curl, unarmed hands) */
function finger(base, dir, len, hex){
  const d = norm(dir);
  const tip = base.clone().addScaledVector(d, len);
  tube(base, tip, 0.013, 0.006, 3, hex, { capB: { hex } });
}

/* one bright insect wing: leading-edge spar (root->mid->tip tapering) + a double-sided pane
   trailing off the spar (2 quads x2 windings so it survives every turnaround, per the sprite's
   R4 critic fix) + one vein-strut tube crossing the pane. dir = spar direction (root->tip); the
   trailing (width) direction is a true perpendicular derived via cross product so projected area
   survives the dimetric camera regardless of spar heading. */
function brightWing(root, dir, len, width, hexPane, hexSpar, hexVein){
  const d = norm(dir);
  const upRef = Math.abs(d.y) > 0.85 ? V(0, 0, 1) : V(0, 1, 0);
  const s = new THREE.Vector3().crossVectors(d, upRef).normalize();
  const mid = root.clone().addScaledVector(d, len * 0.58);
  const tip = root.clone().addScaledVector(d, len);
  tube(root, mid, 0.017, 0.012, 4, hexSpar);
  tube(mid, tip, 0.012, 0.005, 4, hexSpar, { capB: { hex: hexSpar } });
  const trailRoot = root.clone().addScaledVector(s, width * 0.50).addScaledVector(V(0, -0.010, 0), 1);
  const trailMid = mid.clone().addScaledVector(s, width * 0.95).addScaledVector(V(0, -0.018, 0), 1);
  const trailTip = tip.clone().addScaledVector(s, width * 0.22).addScaledVector(V(0, -0.010, 0), 1);
  quad(root, mid, trailMid, trailRoot, hexPane, 0.05);
  quad(trailRoot, trailMid, mid, root, hexPane, 0.05);
  quad(mid, tip, trailTip, trailMid, hexPane, 0.05);
  quad(trailMid, trailTip, tip, mid, hexPane, 0.05);
  const veinA = root.clone().lerp(trailRoot, 0.55).addScaledVector(d, len * 0.06);
  const veinB = mid.clone().lerp(trailMid, 0.85);
  tube(veinA, veinB, 0.010, 0.006, 3, hexVein);
}

export function buildPixie(){
  /* ---------- PALETTE (bright-kingdom candy register: sugar-pink/mint/lemon garb + pale sugar
     skin, rainbow-glint spar/vein accents so the wings + motes carry the loud high-value zones;
     no dark blade/hilt anywhere — unarmed). ---------- */
  const P = {
    skin: 0xf6dfc8, skinDk: 0xe0bb98,
    garb: 0xf25fa0, garbDk: 0xc23f7c,       // sugar-pink
    hair: 0x6b3fa0,                          // candy-violet hair, pops against pink garb
    eye: 0x2a1b2a, mouth: 0xb23a5a,
    wing: 0xf3fff6, wingEdge: 0x9be8c6, vein: 0xffd85b,  // near-white pane, mint edge, lemon vein
    mote: 0xfff6b0, moteDk: 0xffd85b,        // sparkle motes, brightest zone in the piece
    ...BASE_P,
  };

  /* ---------- LANDMARKS — hover ~0.30u above the tile. Body tipped SIDEWAYS (roll axis: cx grows
     with y, cz stays modest) instead of the sprite's forward-dive cz-only pitch — the deliberate
     barrel-roll distinction. Overall crownY ~0.95, scaled toward the sprite's Small-creature
     legibility convention against the shared r=0.42 base disc even though Tiny. ---------- */
  const L = {
    hipY: 0.415, waistY: 0.4925, chestY: 0.590, shldY: 0.665, neckY: 0.7225,
    jawY: 0.739, cheekY: 0.7865, browY: 0.8335, crownY: 0.8785,
  };
  /* cx = the lateral roll gesture (spine-first per POSE-ANATOMY law 1); cz stays small/steady.
     R2 CRITIC FIX (self-review of r1's engine render): r1's cx sweep read as a mild lean, not a
     barrel-roll — the torso stayed near-vertical and the legs splayed like a standing stride
     instead of tucking. Roll magnitude widened ~1.7x so the pelvis->crown line reads as a real
     lateral C-curve. */
  const cx = { hip: 0.000, waist: 0.046, chest: 0.104, shld: 0.164, neck: 0.212, jaw: 0.242, cheek: 0.280, brow: 0.312, crown: 0.341 };
  const cz = { hip: 0.010, waist: 0.020, chest: 0.028, shld: 0.030, neck: 0.030, jaw: 0.028, cheek: 0.024, brow: 0.018, crown: 0.010 };

  /* ===== TORSO — compact Tiny loft, the roll gesture riding cx per band (spine-first). ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.081, rz: 0.072, cx: cx.hip,   cz: cz.hip,   hex: P.garbDk },
    { y: L.waistY, rx: 0.075, rz: 0.066, cx: cx.waist, cz: cz.waist, hex: P.garb },
    { y: L.chestY, rx: 0.078, rz: 0.068, cx: cx.chest, cz: cz.chest, hex: P.garb },
    { y: L.shldY,  rx: 0.090, rz: 0.062, cx: cx.shld,  cz: cz.shld,  hex: P.garbDk },
    { y: L.neckY,  rx: 0.034, rz: 0.031, cx: cx.neck,  cz: cz.neck,  hex: P.skinDk },
  ], 8, {});

  /* ===== HEAD — small round candy-sweet skull loft, mid-giggle. ===== */
  const head = stack([
    { y: L.jawY,   rx: 0.041, rz: 0.047, cx: cx.jaw,   cz: cz.jaw,   hex: P.skin },
    { y: L.cheekY, rx: 0.054, rz: 0.056, cx: cx.cheek, cz: cz.cheek, hex: P.skin },
    { y: L.browY,  rx: 0.050, rz: 0.052, cx: cx.brow,  cz: cz.brow,  hex: P.skin },
    { y: L.crownY, rx: 0.037, rz: 0.035, cx: cx.crown, cz: cz.crown, hex: P.hair },
  ], 8, { capTop: { hex: P.hair, lift: 0.016 } });

  /* pointed ears — break the head silhouette (fey read) */
  for(const s of [-1, 1]){
    const base = V(cx.brow + s * 0.048, L.browY + 0.006, cz.brow + 0.010);
    const tip = V(cx.brow + s * 0.093, L.browY + 0.042, cz.brow - 0.030);
    const mid = V(cx.brow + s * 0.064, L.browY + 0.032, cz.brow - 0.006);
    quad(base, mid, tip, tip, P.skinDk, 0.035);
  }

  /* small dark eyes + an OPEN mid-giggle mouth (the sprite's plain closed line, inverted) */
  for(const s of [-1, 1])
    blob(cx.cheek + s * 0.021, L.cheekY + 0.010, cz.cheek + 0.051, 0.010, 0.010, 0.006, P.eye, 4, 2);
  blob(cx.jaw, L.jawY + 0.008, cz.jaw + 0.044, 0.016, 0.011, 0.007, P.mouth, 5, 2);

  /* ===== LEGS — bent and tucked up-and-in following the roll (knees pulled toward the body,
     never dangling/trailing straight), the roll's lateral cx carried through the limbs too. ===== */
  /* R2 CRITIC FIX: r1's knees/feet dropped straight down and splayed like a standing stride —
     pulled up and IN toward the hip (higher knee, foot tucked near the shin) so the tuck reads
     as a roll, not a stance. */
  for(const s of [-1, 1]){
    const hip = V(cx.hip + s * 0.062, L.hipY - 0.014, cz.hip + 0.016);
    const knee = V(cx.hip + s * 0.118, L.hipY - 0.060, cz.hip - 0.030);
    const foot = V(cx.hip + s * 0.082, L.hipY - 0.098, cz.hip + 0.028);
    tube(hip, knee, 0.034, 0.025, 5, P.garbDk);
    tube(knee, foot, 0.025, 0.015, 5, P.skin, { capB: { hex: P.skin } });
  }

  /* ===== ARMS — BOTH hands thrown wide open at opposite diagonals (the giggling counterweight
     pair; law 2's bent-elbow arc on each, no straight sticks, no weapon in either hand). ===== */
  const shR = V(cx.shld + 0.088, L.shldY - 0.006, cz.shld + 0.010);
  const elR = V(cx.shld + 0.150, L.shldY + 0.058, cz.shld - 0.078);
  const wrR = V(cx.shld + 0.198, L.shldY + 0.132, cz.shld - 0.032);
  tube(shR, elR, 0.030, 0.023, 5, P.garb);
  tube(elR, wrR, 0.023, 0.014, 5, P.skinDk);
  blob(wrR.x, wrR.y, wrR.z, 0.016, 0.015, 0.016, P.skin, 5, 3);
  for(const d of [[0.55, 0.55, -0.15], [0.70, 0.30, 0.10], [0.45, 0.15, 0.45]])
    finger(wrR, d, 0.040, P.skin);

  const shL = V(cx.shld - 0.088, L.shldY - 0.006, cz.shld + 0.010);
  const elL = V(cx.shld - 0.145, L.shldY - 0.072, cz.shld + 0.070);
  const wrL = V(cx.shld - 0.188, L.shldY - 0.148, cz.shld + 0.108);
  tube(shL, elL, 0.030, 0.023, 5, P.garb);
  tube(elL, wrL, 0.023, 0.014, 5, P.skinDk);
  blob(wrL.x, wrL.y, wrL.z, 0.016, 0.015, 0.016, P.skin, 5, 3);
  for(const d of [[-0.55, -0.40, 0.20], [-0.70, -0.15, -0.10], [-0.40, -0.05, -0.45]])
    finger(wrL, d, 0.040, P.skin);

  /* ===== SIGNATURE — four bright wings off the shoulders/back, two pairs at different beat
     angles, candy-bright panes carrying the model's loudest high-value zone (law 3). ===== */
  {
    const mountY = L.shldY + 0.020, mountZ = cz.shld - 0.062, mountX = cx.shld;
    brightWing(V(mountX - 0.066, mountY, mountZ), [-0.88, 0.44, -0.16], 0.290, 0.140, P.wing, P.wingEdge, P.vein);
    brightWing(V(mountX + 0.066, mountY, mountZ), [ 0.88, -0.30, -0.18], 0.290, 0.140, P.wing, P.wingEdge, P.vein);
    const mountY2 = L.shldY - 0.028, mountZ2 = cz.shld - 0.098, mountX2 = cx.shld;
    brightWing(V(mountX2 - 0.058, mountY2, mountZ2), [-0.92, 0.08, -0.20], 0.205, 0.100, P.wing, P.wingEdge, P.vein);
    brightWing(V(mountX2 + 0.058, mountY2, mountZ2), [ 0.94, 0.12, -0.18], 0.205, 0.100, P.wing, P.wingEdge, P.vein);
  }

  /* ===== SIGNATURE — 3-4 sparkle motes trailing off both flung-wide hands (the second
     high-value zone, unarmed — the deliberate anti-sprite/anti-blade read). ===== */
  {
    /* R2 CRITIC FIX: r1's motes sat close against the wrist and read as skin-tone smudges —
     * pushed further out along the fling direction and enlarged so they read as a distinct
     * trailing arc of light, not blob-on-hand. */
    const moteR = [
      wrR.clone().addScaledVector(V(0.085, 0.050, -0.030), 1),
      wrR.clone().addScaledVector(V(0.140, -0.030, 0.045), 1),
    ];
    const moteL = [
      wrL.clone().addScaledVector(V(-0.085, -0.038, 0.030), 1),
      wrL.clone().addScaledVector(V(-0.135, 0.045, -0.045), 1),
    ];
    let i = 0;
    for(const m of [...moteR, ...moteL]){
      const r = 0.024 - (i % 2) * 0.006;
      blob(m.x, m.y, m.z, r, r, r, i % 2 === 0 ? P.mote : P.moteDk, 5, 3);
      i++;
    }
  }

  /* base disc (Tiny, shares the standard r=0.42 tile — the hover clears it by ~0.15u) */
  buildBase(P);
}
