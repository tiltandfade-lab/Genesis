/* dev/model-qa/creatures/rlm-gloom-specter.js — the SPECTER landmark table (HUMANOID family,
   upper-body-only, Medium, CR 1, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000
   tri band (2026-07-08 foundry pilot). Drowned grudge haunting the storm drains / hanging-tree
   haunt re-living its last minute — this one body doubles as the NEAREST_SUB base for ghost,
   banshee, poltergeist, and greater-shadow.

   FEATURE CHECKLIST (the ~1.1-1.4k budget buys):
     1. HUMANOID torso dissolving below the ribs — no legs; a solid chest/shoulder/neck loft that
        just STOPS at a ragged hem, no taper-to-a-point (the hem has to read torn, not "wearing a
        skirt").
     2. Exposed rib bones breaking through the tattered chest — the skeletal-humanoid tell that
        keeps the anatomy read even though the lower body is gone.
     3. Gaunt skull-face — pinched hollow cheeks (a NARROWER band between the wider jaw and brow
        bands, not a smooth taper), hollow dark eye sockets each carrying one small eerie glow
        pinprick (the value-contrast payload law 3 needs), a gaping vertical mouth.
     4. Reaching clawed hands — pale, elongated 4-finger claws, the second high-value zone (law 3),
        asymmetric: the leading arm reaches high-and-far, the trailing arm is lower/more bent (the
        mid-lunge asymmetry law 5 wants).
     5. SIGNATURE — 6 ragged tatter-streamers trailing off the torn hem, tapering to points near the
        ground, lengths graded longest-at-the-back to shortest-at-the-front (the torso leans into
        the reach, so the tatters drag out behind it) — this is the loud, exaggerated feature that
        reads "ghost" in silhouette alone.
     6. Forward-leaning spine with the head thrown BACK (reeling) — the "last minute" pose: not a
        floating T-pose, a haunt caught mid-lunge with its head snapped back in a silent scream.

   POSE SENTENCE: a drowned grudge lunging forward with both clawed hands reaching, spine driving
   into the reach while its head snaps back in a silent scream and its torn lower half streams out
   behind it like smoke dragged by its own momentum — never at rest, never at attention.

   Opacity (shadow-like, ~0.45) is an engine/material-level spawn property, not authored in this
   geometry — the model is built to read SOLID at full alpha per law 3; the engine dims it later.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0 (the streamer tips hover just above 0 — a haunt doesn't stand). Imported by
   ps1-sheet.html (SETS['foundry-pilot'], cell 1). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

/* a hollow socket: dark blob + one small glow pinprick nudged toward dir=[dx,dy,dz] — the inverse
   of the cosmic-set eye() (socket reads empty, the glow is the only spark of value in it). */
function hollowEye(cx, cy, cz, r, dir, socket, glow){
  blob(cx, cy, cz, r, r, r * 0.82, socket, 6, 4);
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0] / n, dy = dir[1] / n, dz = dir[2] / n;
  blob(cx + dx * r * 0.5, cy + dy * r * 0.5, cz + dz * r * 0.5, r * 0.22, r * 0.22, r * 0.22, glow, 4, 2);
}

/* a rib bone: two short tubes meeting at a raised center point — a cheap arc across the chest.
   Radius kept at/above the 0.04u feature floor (law 3) and painted in the PALE bone color (not the
   dark torso fill) so it actually breaks through instead of dissolving into the chest at 1/3-res.
   SECOND-PASS FIX (flag: the 3 arcs rendered as one amorphous tan blob — only the camera-near apex
   caught light while the end points sat flush against the torso surface, so the engine shaded each
   arc as a bright dot fading into dark torso instead of a lit ridge). Two changes: (1) the end
   points now sit at frontZ*0.48 instead of *0.30 — a +z bias that pulls the WHOLE arc toward the
   camera, not just its center, so light rakes the full ridge; (2) each rib now takes its own
   boneHex/boneHexDk pair (called with a distinct tone per rib below) so the three read as separate
   ridges even where they're close in y, instead of one same-toned mass. */
function ribArc(y, dip, halfW, frontZ, boneHex, boneHexDk){
  const left = V(-halfW, y, frontZ * 0.48);
  const center = V(0, y - dip, frontZ);
  const right = V(halfW, y, frontZ * 0.48);
  tube(left, center, 0.044, 0.056, 5, boneHex, { capA: { hex: boneHexDk } });
  tube(center, right, 0.056, 0.044, 5, boneHex, { capB: { hex: boneHexDk } });
}

/* one clawed finger: two tapering segments, pale base into a dark claw tip. */
function finger(base, dir, len, pale, claw){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0] / n, dy = dir[1] / n, dz = dir[2] / n;
  const mid = V(base.x + dx * len * 0.55, base.y + dy * len * 0.55, base.z + dz * len * 0.55);
  const tip = V(base.x + dx * len, base.y + dy * len, base.z + dz * len);
  tube(base, mid, 0.016, 0.011, 4, pale);
  tube(mid, tip, 0.011, 0.003, 4, claw, { capB: { hex: claw } });
}

/* one tatter-streamer off the torso hem: 3 tapering segments to a near-point tip, a slight twist
   partway down so it reads as trailing cloth/flesh rather than a straight icicle.
   R2 CRITIC FIX: every radius kept >=0.042 (was tapering to 0.006, well under the law-3 0.04u
   floor — the tip was geometrically dissolving, not just dim). */
function streamer(root, dir, len, twist, hexA, hexB){
  const p0 = V(root.x, root.y, root.z);
  const p1 = V(p0.x + dir[0] * len * 0.32,               p0.y + dir[1] * len * 0.32,               p0.z + dir[2] * len * 0.32);
  const p2 = V(p0.x + dir[0] * len * 0.68 + twist,        p0.y + dir[1] * len * 0.68,               p0.z + dir[2] * len * 0.68 - twist * 0.4);
  const p3 = V(p0.x + dir[0] * len       + twist * 1.7,   p0.y + dir[1] * len,                      p0.z + dir[2] * len       - twist * 0.7);
  tube(p0, p1, 0.082, 0.062, 6, hexA);
  tube(p1, p2, 0.062, 0.048, 6, hexA);
  tube(p2, p3, 0.048, 0.042, 6, hexB, { capB: { hex: hexB } });
}

export function buildSpecter(){
  /* ---------- PALETTE (VS desaturated; drowned-slate body, pale grudge face/hands) ---------- */
  const P = {
    body:0x4c5768, bodyLt:0x606c7e, bodyDk:0x353e4c,        // torso / sleeves — cold slate, lifted off black
    // R2 CRITIC FIX: streamers were reusing P.body/P.bodyDk (identical to the torso, so they read
    // as a continuation of the shirt, not a distinct signature) and tapered into a near-black tip
    // that vanished against the void — both are law-3 failures. tatterA/A2 now sit clearly ABOVE
    // body/bodyLt in value; tatterB (the tip) is lifted to a pale mist tone so the signature's high
    // -value zone is at the streamer tips, echoing the pale face/hands (law 3: light where the
    // feature is).
    tatterA:0x6f7c96, tatterA2:0x54617a, tatterB:0x9fadc0,
    pale:0xcdd6d2, paleDk:0x9aa6a0,                         // face + hands — the pale grudge flesh
    // exposed ribs — SECOND-PASS FIX: 3 distinct tones (was one bone/boneDk pair shared by all
    // three arcs, which read as one same-toned blob) so each rib is its own bright ridge, brightest
    // at top (nearest the light) grading down.
    bone:0xdcd3b6, boneDk:0xa39c81,
    bone2:0xc9c2a8, boneDk2:0x938c72,
    bone3:0xb3ab8e, boneDk3:0x7d7660,
    socket:0x0d1013, glow:0xa8f0c4,                         // hollow eyes + eerie value-contrast spark
    mouth:0x0a0c0f, claw:0x74827c,
  };

  /* ---------- LANDMARKS — forward-leaning spine (cz grows with height), head snaps back at the
     top (cz falls again past the neck). No hips/legs: the torso just ends at tailY, ragged. ---------- */
  const L = {
    tailY:0.52, waistY:0.66, ribY:0.84, chestY:0.98, shldY:1.08, neckY:1.14,
    jawY:1.17, cheekY:1.235, browY:1.30, crownY:1.36,
    shoulderX:0.185,
  };

  /* trunk (one loft, ragged hem -> neck). No capBot — the open hem is where streamers root;
     no capTop — the neck disappears up into the head bands. */
  const torsoRings = stack([
    { y:L.tailY,  rx:0.150, rz:0.115, cz:0.000, hex:P.bodyDk },
    { y:L.waistY, rx:0.168, rz:0.128, cz:0.020, hex:P.body },
    { y:L.ribY,   rx:0.182, rz:0.140, cz:0.045, hex:P.body },
    { y:L.chestY, rx:0.196, rz:0.150, cz:0.070, hex:P.bodyLt },
    { y:L.shldY,  rx:0.205, rz:0.140, cz:0.095, hex:P.body },
    { y:L.neckY,  rx:0.070, rz:0.068, cz:0.110, hex:P.paleDk },
  ], 10, {});

  /* exposed rib bones breaking through the torn chest — 3 arcs.
     R2 CRITIC FIX: vertical gap widened 0.08->~0.10-0.10 apart (was clustering into one blob in
     the engine render instead of 3 countable arcs — law 1).
     SECOND-PASS FIX: gap widened again to ~0.13 apart, the dip deepened (more visible curve per
     rib instead of a near-flat bump) and each arc now carries its own bone tone (see palette) plus
     the ribArc()-internal +z bias, so the three separate into distinct lit ridges instead of one
     amorphous tan mass. */
  ribArc(L.chestY - 0.02, 0.018, 0.118, 0.250, P.bone,  P.boneDk);
  ribArc(L.chestY - 0.15, 0.015, 0.132, 0.230, P.bone2, P.boneDk2);
  ribArc(L.chestY - 0.28, 0.013, 0.144, 0.205, P.bone3, P.boneDk3);

  /* skull-face — gaunt: PINCHED cheeks (narrower band than jaw/brow either side of it), head
     bands walk BACKWARD in cz past the neck (the "thrown back" reel). */
  const headRings = stack([
    { y:L.jawY,   rx:0.078, rz:0.082, cz:0.090, hex:P.pale },
    { y:L.cheekY, rx:0.058, rz:0.066, cz:0.058, hex:P.paleDk },
    { y:L.browY,  rx:0.082, rz:0.078, cz:0.015, hex:P.pale },
    { y:L.crownY, rx:0.066, rz:0.060, cz:-0.035, hex:P.paleDk },
  ], 8, { capTop:{ hex:P.paleDk, lift:0.02 } });

  /* hollow eye sockets — dark, one glow pinprick each, gazing up-and-forward (the head is thrown
     back so the eyes still track the reach). */
  hollowEye(-0.032, 1.268, 0.070, 0.026, [-0.3, 0.35, 1], P.socket, P.glow);
  hollowEye( 0.032, 1.268, 0.070, 0.026, [ 0.3, 0.35, 1], P.socket, P.glow);

  /* gaping vertical mouth — a silent scream, wide and dark. */
  quad(V(-0.026, 1.205, 0.098), V(0.026, 1.205, 0.098), V(0.020, 1.130, 0.092), V(-0.020, 1.130, 0.092), P.mouth, 0.02);
  quad(V(-0.020, 1.150, 0.093), V(0.020, 1.150, 0.093), V(0.014, 1.128, 0.088), V(-0.014, 1.128, 0.088), P.mouth, 0.02);

  /* torn shoulder tatters — a few flat dark flaps hanging off the shoulder line, cheap extra
     silhouette break so the shoulders read ragged, not tailored. */
  for(const s of [-1, 1]){
    const bx = s * 0.20, by = L.shldY - 0.01, bz = 0.085;
    quad(V(bx, by, bz), V(bx + s*0.05, by, bz - 0.03), V(bx + s*0.09, by - 0.16, bz - 0.05), V(bx + s*0.02, by - 0.10, bz + 0.01), P.tatterA, 0.05);
  }

  /* SIGNATURE — reaching clawed arms. LEADING (left, s=-1): high, far forward. TRAILING (right,
     s=1): lower, more bent — the mid-lunge asymmetry. */
  {
    const shoulderL = V(-L.shoulderX, L.shldY - 0.005, 0.095);
    const elbowL    = V(-0.27, 1.05, 0.34);
    const wristL    = V(-0.30, 1.10, 0.62);
    tube(shoulderL, elbowL, 0.055, 0.044, 6, P.body);
    tube(elbowL, wristL, 0.042, 0.028, 6, P.bodyDk);
    blob(wristL.x, wristL.y, wristL.z, 0.038, 0.032, 0.034, P.pale, 6, 4);
    const fingerDirsL = [[-0.55,0.30,0.85],[-0.15,0.35,1.0],[0.20,0.30,0.95],[0.50,0.15,0.80]];
    for(const d of fingerDirsL) finger(wristL, d, 0.14, P.pale, P.claw);

    const shoulderR = V(L.shoulderX, L.shldY - 0.005, 0.095);
    const elbowR    = V(0.28, 0.92, 0.22);
    const wristR    = V(0.33, 0.80, 0.38);
    tube(shoulderR, elbowR, 0.055, 0.044, 6, P.body);
    tube(elbowR, wristR, 0.042, 0.028, 6, P.bodyDk);
    blob(wristR.x, wristR.y, wristR.z, 0.036, 0.030, 0.032, P.pale, 6, 4);
    const fingerDirsR = [[-0.45,0.10,0.90],[-0.10,0.20,1.0],[0.25,0.10,0.92],[0.55,-0.05,0.75]];
    for(const d of fingerDirsR) finger(wristR, d, 0.13, P.pale, P.claw);
  }

  /* SIGNATURE — 6 ragged tatter-streamers off the torn hem, graded longest (back) to shortest
     (front) since the lean drags the dissolving lower body out behind it. Root points come straight
     off the torso's bottom ring so they seat at the hem by construction. */
  {
    const hem = torsoRings[0]; // 10 points, the tailY ring
    const order = hem.map((p, i) => i).sort((a, b) => hem[a].z - hem[b].z); // back(-z) -> front(+z)
    const chosen = [order[0], order[1], order[2], order[4], order[7], order[9]];
    chosen.forEach((idx, k) => {
      const root = hem[idx];
      const t = k / (chosen.length - 1);           // 0 = longest/back, 1 = shortest/front
      const len = 0.54 - 0.38 * t;
      // R2 CRITIC FIX: outX spread widened (1.15 -> 1.6) so the 6 streamers fan out into open
      // void instead of bunching directly behind the torso, where they read as one dark mass.
      const outX = root.x * 1.6;
      const dir = [outX, -0.76 - 0.08 * ((idx % 3) / 3), -0.50 - 0.20 * t];
      const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
      const dU = [dir[0] / n, dir[1] / n, dir[2] / n];
      const twist = (idx % 2) ? 0.05 : -0.045;
      // R2 CRITIC FIX: was P.body/P.bodyDk (identical to the torso — the signature was
      // camouflaged against its own silhouette). Now P.tatterA/A2, a value distinctly lifted off
      // the torso, tip is P.tatterB (pale) instead of the old near-black — the streamers are now
      // the model's second high-value zone, not its darkest, most-hidden one.
      streamer(root, dU, len, twist, (k % 2) ? P.tatterA : P.tatterA2, P.tatterB);
    });
  }
}
