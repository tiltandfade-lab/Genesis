/* dev/model-qa/creatures/rlm-gloom-doppelganger.js — the DOPPELGANGER (HUMANOID family, Medium,
   CR 3, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08
   foundry pilot, gloom-w1 cell 1). A person worn like a coat, blinking wrong — face-thief caught
   between the borrowed elder it's impersonating and its true blank shape.

   FEATURE CHECKLIST (the tri budget buys these; ANATOMY-CANON HUMANOID proportions, lean/
   androgynous/grey — correct standing anatomy first, then the mid-shift split):
     1. Lean androgynous grey HUMANOID body — narrow waist, sloped shoulders, no sex/age markers,
        the anatomy chief-criterion read of "a person" before any signature kicks in.
     2. COMPOSED half (screen-left, -x): a normal human arm relaxed at its side, a 4-finger hand,
        a carved half-face (brow ridge, one dark eye socket, a short closed mouth line) — the
        borrowed elder's held posture.
     3. SIGNATURE A — the MELTING half (screen-right, +x): the arm stretches wrong, elbow sagging
        low and out, forearm elongating well past a natural humerus:forearm ratio down near the
        knee, ending in a fused no-finger paddle hand with two blunt nubs, drip-blobs sloughing
        off the forearm and wrist.
     4. SIGNATURE B — the blank half-face (screen-right, +x): smooth, featureless, lifted to a
        pale high-value tone (law 3's contrast payload) against the grey body and the darker
        composed-side socket — no eye, no mouth, one small darker glisten-drip on the cheek.
     5. Asymmetric mid-shift stance: the left leg planted normal and weight-bearing, the right leg
        softened, its foot losing definition into a shallow puddle-lip at the ground (small melt
        drips beside it) instead of a clean sole.
     6. Visible joint knobs (shoulder/elbow/knee/ankle) breaking the limb silhouettes into
        countable segments rather than smooth noodle-tubes.

   POSE SENTENCE: caught mid-shift between two identities — the left side still holds the
   borrowed elder's calm, weight settled on a planted leg with its arm relaxed at its side, while
   the right side is losing the shape: the arm sagging and stretching past where an elbow should
   stop it, the face gone slack and blank and faintly glistening, the trailing foot puddling
   instead of standing. Never a symmetric T-stance — the split IS the pose.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w1'], cell 1, fn buildDoppelganger). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';
import { buildBase } from '../parts.js';

/* one clawless finger (composed hand only): two tapering segments, pale base -> blunt tip. */
function finger(base, dir, len, hex){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0] / n, dy = dir[1] / n, dz = dir[2] / n;
  const mid = V(base.x + dx * len * 0.55, base.y + dy * len * 0.55, base.z + dz * len * 0.55);
  const tip = V(base.x + dx * len,        base.y + dy * len,        base.z + dz * len);
  tube(base, mid, 0.017, 0.013, 4, hex);
  tube(mid, tip, 0.013, 0.008, 4, hex, { capB: { hex } });
}

/* a small joint knob — breaks limbs into countable segments (law 6 / ANATOMY-CANON humanoid). */
function knob(p, r, hex){ blob(p.x, p.y, p.z, r, r * 0.88, r, hex, 5, 3); }

/* a small ground-melt drip: a squashed blob sitting low, near y=0. */
function meltDrip(x, z, r, hex){ blob(x, r * 0.5, z, r, r * 0.62, r, hex, 5, 3); }

export function buildDoppelganger(){
  /* ---------- PALETTE (VS desaturated; cold identity-less grey body, split face values) ---------- */
  const P = {
    body: 0x767e85, bodyLt: 0x8b929a, bodyDk: 0x5f6771,     // torso / composed limb — neutral cold grey, lifted off the void
    melt: 0x66716f, meltDk: 0x4c5654, meltLt: 0x8a958f,     // the sagging/melting arm + drips — lifted so it doesn't vanish
    compFace: 0x767d80, compDk: 0x5c6366,                   // composed half-face (still carved, still grey)
    blankFace: 0xcdd3ce, blankLt: 0xdde2dc,                 // SIGNATURE B — the blank half, lifted pale
    glisten: 0xa8b0aa,                                       // the one darker drip-glisten on the blank cheek
    socket: 0x24282a, mouth: 0x24282a,                       // composed-side carved features (dark, subtle)
    disc: 0x2b2f2e, discTop: 0x363b39,
  };

  /* ---------- LANDMARKS (lean Medium humanoid, ~1.4u tall) ---------- */
  const L = {
    ankleY: 0.09, kneeY: 0.40, hipY: 0.72, pelvisY: 0.70,
    waistY: 0.84, ribY: 0.94, chestY: 1.03, shldY: 1.12, neckY: 1.17,
    jawY: 1.205, cheekY: 1.255, browY: 1.305, crownY: 1.35,
    shoulderX: 0.155, hipHalf: 0.085,
  };

  /* ===== TORSO — one lean loft, pelvis to neck. Uniform grey; anatomy carries the read, the
     split lives in the face/limbs only (law 4: get the body right first). ===== */
  stack([
    { y: L.pelvisY, rx: 0.095, rz: 0.075, cz: 0.000, hex: P.bodyDk },
    { y: L.waistY,  rx: 0.088, rz: 0.070, cz: 0.010, hex: P.body },
    { y: L.ribY,    rx: 0.108, rz: 0.085, cz: 0.020, hex: P.body },
    { y: L.chestY,  rx: 0.122, rz: 0.095, cz: 0.030, hex: P.bodyLt },
    { y: L.shldY,   rx: 0.135, rz: 0.090, cz: 0.038, hex: P.body },
    { y: L.neckY,   rx: 0.052, rz: 0.050, cz: 0.045, hex: P.bodyDk },
  ], 10, { capBot: { hex: P.bodyDk, lift: 0.02 } });

  /* ===== HEAD — built by hand (not stack()) so each quad can be colored per-side: composed
     (screen-left, -x, still-carved) vs blank (screen-right, +x, SIGNATURE B). ===== */
  {
    const n = 8, ph = Math.PI / n;
    const bands = [
      { y: L.jawY,   rx: 0.062, rz: 0.068, cz: 0.050 },
      { y: L.cheekY, rx: 0.072, rz: 0.075, cz: 0.065 },
      { y: L.browY,  rx: 0.075, rz: 0.070, cz: 0.050 },
      { y: L.crownY, rx: 0.062, rz: 0.058, cz: 0.015 },
    ];
    const rings = bands.map(b => ring(V(0, b.y, b.cz), V(0, 1, 0), b.rx, b.rz, n, ph));
    for(let b = 0; b < rings.length - 1; b++){
      for(let i = 0; i < n; i++){
        const i2 = (i + 1) % n;
        const avgX = (rings[b][i].x + rings[b][i2].x + rings[b + 1][i].x + rings[b + 1][i2].x) / 4;
        const hex = avgX >= 0 ? (b % 2 ? P.blankLt : P.blankFace) : (b % 2 ? P.compFace : P.compDk);
        quad(rings[b][i], rings[b][i2], rings[b + 1][i2], rings[b + 1][i], hex, 0.06);
      }
    }
    capFan(rings.at(-1), V(0, L.crownY + 0.02, 0.010), P.blankFace);

    /* composed half — one dark carved eye socket + a short closed mouth line (screen-left only). */
    blob(-0.040, L.cheekY + 0.028, 0.115, 0.020, 0.017, 0.014, P.socket, 5, 3);
    quad(V(-0.044, L.jawY + 0.018, 0.108), V(-0.014, L.jawY + 0.018, 0.108),
         V(-0.016, L.jawY + 0.006, 0.104), V(-0.042, L.jawY + 0.006, 0.104), P.mouth, 0.03);

    /* blank half — no eye, no mouth; one small darker glisten-drip low on the cheek (the
       "faintly glistening, dissolving" read from the pose sentence). */
    blob(0.048, L.cheekY - 0.010, 0.112, 0.024, 0.030, 0.018, P.glisten, 5, 3);
  }

  /* ===== LEFT (composed) ARM — relaxed at its side, normal proportions, 4-finger hand. ===== */
  {
    const sh = V(-L.shoulderX, L.shldY - 0.01, 0.020);
    const el = V(-0.205, 0.860, 0.045);
    const wr = V(-0.195, 0.650, 0.030);
    knob(sh, 0.050, P.body);
    tube(sh, el, 0.036, 0.030, 6, P.body);
    knob(el, 0.040, P.bodyDk);
    tube(el, wr, 0.030, 0.024, 6, P.body);
    knob(wr, 0.030, P.bodyDk);
    blob(wr.x, wr.y - 0.02, wr.z, 0.030, 0.026, 0.026, P.body, 6, 4);
    const fingerDirs = [[-0.18, -0.92, 0.10], [-0.05, -1.0, 0.06], [0.10, -0.98, 0.05], [0.24, -0.86, 0.02]];
    for(const d of fingerDirs) finger(V(wr.x, wr.y - 0.05, wr.z), d, 0.13, P.body);
  }

  /* ===== RIGHT (melting) ARM — SIGNATURE A. Elbow sags low + out, forearm elongates well past a
     natural ratio down near the knee, fused no-finger paddle hand, drip-blobs off the sag.
     CRITIC PASS-2 FIX: pass-1's el/wr/hd crept forward in +z as they dropped, which at this
     sheet's 45deg dimetric yaw cancels almost all of the +x lateral reach in screen space
     (screenX ~ x-z at yaw45) — the arm was rendering nearly on top of the torso/leg silhouette,
     invisible as a distinct limb. Pulled z back near zero/slightly behind and pushed x further
     out so the sag reads as a separate outward shape, and split the sag into a mid-value shaft +
     a lightened "glistening" forearm segment for its own value contrast (law 3), not just riding
     on the face's pale zone. ===== */
  {
    const sh = V(L.shoulderX, L.shldY - 0.01, 0.020);
    const el = V(0.360, 0.740, 0.020);
    const wr = V(0.430, 0.440, -0.010);
    const hd = V(0.460, 0.230, -0.030);
    knob(sh, 0.050, P.body);
    tube(sh, el, 0.038, 0.032, 6, P.melt);
    knob(el, 0.042, P.meltDk);
    tube(el, wr, 0.032, 0.027, 6, P.meltLt);
    tube(wr, hd, 0.027, 0.031, 6, P.meltDk);
    /* fused paddle hand — no fingers, two blunt nubs. */
    blob(hd.x, hd.y - 0.03, hd.z, 0.036, 0.048, 0.024, P.meltDk, 6, 4);
    tube(V(hd.x - 0.014, hd.y - 0.07, hd.z), V(hd.x - 0.020, hd.y - 0.11, hd.z + 0.01), 0.014, 0.009, 4, P.meltDk);
    tube(V(hd.x + 0.016, hd.y - 0.07, hd.z), V(hd.x + 0.022, hd.y - 0.11, hd.z - 0.01), 0.014, 0.009, 4, P.meltDk);
    /* drip-blobs sloughing off the elbow sag + forearm — the "sagging drip-shape" checklist item. */
    meltDrip(el.x + 0.03, el.z - 0.02, 0.026, P.meltLt);
    meltDrip((el.x + wr.x) / 2 + 0.02, (el.z + wr.z) / 2, 0.020, P.meltLt);
  }

  /* ===== LEGS — asymmetric mid-shift stance: LEFT planted/weight-bearing, RIGHT softened with a
     puddling foot instead of a clean sole. ===== */
  {
    /* LEFT — normal, planted, weight-bearing */
    const hipL = V(-L.hipHalf, L.hipY - 0.02, 0.000);
    const kneeL = V(-0.092, L.kneeY, 0.020);
    const ankL = V(-0.088, L.ankleY, 0.030);
    knob(hipL, 0.044, P.body);
    tube(hipL, kneeL, 0.040, 0.032, 7, P.body);
    knob(kneeL, 0.036, P.bodyDk);
    tube(kneeL, ankL, 0.032, 0.026, 7, P.body);
    knob(ankL, 0.028, P.bodyDk);
    tube(V(ankL.x, 0.040, ankL.z), V(ankL.x, 0.040, ankL.z + 0.115), 0.032, 0.020, 5, P.bodyDk, { capB: { hex: P.bodyDk } });

    /* RIGHT — softened stance, sagging knee, foot losing definition into a shallow puddle.
       CRITIC PASS-2 FIX: widened the outward reach (knee/ankle x) so the two legs clearly
       split into two silhouettes instead of one dark column (they read fused at the old
       narrow 0.10 spread), and lightened + enlarged the puddle blob so it stands out against
       the dark base disc instead of vanishing into it (law 3). */
    const hipR = V(L.hipHalf, L.hipY - 0.02, 0.000);
    const kneeR = V(0.150, L.kneeY - 0.02, 0.035);
    const ankR = V(0.160, L.ankleY + 0.02, 0.045);
    knob(hipR, 0.044, P.body);
    tube(hipR, kneeR, 0.040, 0.030, 7, P.melt);
    knob(kneeR, 0.034, P.meltDk);
    tube(kneeR, ankR, 0.030, 0.026, 7, P.melt);
    /* puddled foot — a shallow wide blob instead of a clean sole plate */
    blob(ankR.x, 0.028, ankR.z + 0.05, 0.072, 0.028, 0.088, P.melt, 6, 3);
    meltDrip(ankR.x + 0.090, ankR.z + 0.02, 0.022, P.meltLt);
    meltDrip(ankR.x + 0.050, ankR.z + 0.14, 0.018, P.meltLt);
  }

  /* base disc — shared module (grounds the figure; the puddle drips sit just outside its rim). */
  buildBase(P);
}
