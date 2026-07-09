/* dev/model-qa/creatures/rlm-frontier-hippopotamus.js — the HIPPOPOTAMUS landmark table
   (QUADRUPED family, Huge, CR 5, realm frontier), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, frontier-w2 cell 4). Core identity: a fence-breaking
   MEAN BULL that gores on principle — must NOT read as the rhino sitting next to it on the
   sheet: rounder, no horn, and its whole signature is the 180-degree territorial YAWN-GAPE
   full of pale tusk pegs. Bespoke to the render key "hippopotamus"; the frontier reskin
   rides this chassis.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. QUADRUPED barrel — rounder and LOWER-SLUNG than the rhino: near-circular cross-section,
        widest at mid-belly, sagging close to the ground, no shoulder hump / no horn ridge.
     2. SIGNATURE — the territorial gape: the jaw hinges open to a near-180-degree wedge, upper
        and lower jaw pried nearly flat apart, showing the pink mouth interior (law-3 high-value
        patch, >=140 RGB) studded with pale tusk pegs (2 lower canine tusks + a row of blunt
        incisor pegs) top and bottom.
     3. Head thrown UP and BACK on a short thick neck (territorial display posture, not a
        grazing droop) — the spine gesture runs pelvis low -> ribcage level -> neck kinking
        sharply upward -> skull rotated back so the open gape faces the sky/rival.
     4. Stumpy thick UNGULIGRADE legs (short cannon, blunt near-vertical columns front and
        rear per POSE-ANATOMY, no long horse-leg zigzag) planted wide, braced — the "fence-
        breaking bull" stance.
     5. Small rounded ears set high on the skull, small eye bumps set HIGH on the head (the
        periscope-eye hippo read), flared nostril bumps at the snout tip.
     6. Tail-flick — a short thick tail kinked up and out behind, optional motion cue, cheap in
        tris.

   POSE SENTENCE: the territorial gape — planted wide on four stumpy braced legs, neck kinked
   sharply up from a low barrel, head thrown back so the jaw can hinge open to a full
   180-degree wedge baring tusk pegs and pink mouth interior at the sky/rival — never a closed,
   grazing-calm head-down stance.

   SPINE-GESTURE SENTENCE: the trace runs a low near-level pelvis-to-ribcage barrel, then kinks
   upward hard through a short thick neck, then continues past vertical as the skull rotates
   back on the neck so the open gape points up and slightly back — a genuine bent gesture line
   (barrel -> neck kink -> head throw-back), not a plumb mannequin spine, with the four stumpy
   legs braced wide as a stable base under the raised, open-mouthed head.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w2'], cell 4, fn buildHippopotamus). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildHippopotamus(){
  /* ---------- PALETTE — dark slate-grey/mud hide (rounder, muddier than the rhino's dry
     grey-brown), a bright pink mouth interior + pale tusk pegs carrying the law-3 signature
     patch, frontier-desaturated. ---------- */
  /* R1 SELF-CORRECTION (post r1 engine render): r1's hide values (luma ~75-95) sat far too
     close to the disc/void (luma ~25-35) — at 1/3-res+dither the whole bull nearly vanished
     into a dark-on-dark smudge, failing law 3's body-mass-over-void margin in practice even
     though the raw hex delta looked adequate on paper. Bumped every hide tone a full step
     brighter (still a muddy grey-green, not pale) and widened the void/disc gap to match. */
  const P = {
    hide: 0x767e70, hideDk: 0x565e50, hideLt: 0x929a86,
    belly: 0x40463c,
    mouth: 0xd2685e, mouthDk: 0x943c34,
    tusk: 0xece2c8, tuskDk: 0xc8bc9a,
    eye: 0x14100c, ear: 0x565e50,
    hoofDk: 0x282520,
    disc: 0x2a2822, discTop: 0x353128,
  };

  /* ===== SCALE — Huge bull: bigger footprint than the Medium/Large exemplars above. ===== */
  const S = 1.55;

  /* ===== SPINE — pelvis low & level through the ribcage, then a hard upward kink through the
     neck, then the head continues rotating past vertical (thrown back) so the gape opens
     toward the sky. Authored as the per-band rotation POSE-ANATOMY calls for, not a lean. ===== */
  const L = {
    hipY: 0.235 * S, ribY: 0.255 * S, withersY: 0.275 * S,
    neckLoY: 0.30 * S, neckHiY: 0.60 * S,
    jawHingeY: 0.60 * S, snoutY: 0.70 * S, crownY: 0.66 * S,
  };
  /* R2 SELF-CORRECTION: r2 still showed a floating head chunk even after matching cz — the real
     cause was neckHiY (0.50S) != jawHingeY (0.60S), so the neck's top ring and the head's
     bottom ring were built from different PRE-rotation y values and never coincided once
     rotated, leaving a true gap in the mesh. neckHiY is now pinned to == jawHingeY so the neck's
     last ring and the head's first ring are the exact same pre-transform point (same y AND cz
     already matched above) — the two stacks now share one seam with zero gap. */
  /* R1 SELF-CORRECTION (post r1 engine render): r1's HEAD_ANG (NECK_ANG+0.95, ~90 degrees
     total) rotated the head so far past vertical that its crown swung up and away from the
     neck's own top ring — reading as a visually separate floating chunk above the body instead
     of one continuous gesture, and pointed the gape almost straight up/away from this camera's
     dimetric angle instead of toward it. Pulled both angles in: neck leans back less, head
     throw-back is real (still well past vertical — the territorial display) but stops short of
     folding the head out of visual contact with the neck, and keeps the gape angled enough
     toward the +x/+y/+z camera to actually read. */
  /* R3 SELF-CORRECTION (post r2/r3/r4 engine render): the crown genuinely IS this high — the
     visual "floating chunk" wasn't a mesh gap (verified: neck-top/head-bottom rings coincide
     exactly) but the neck reading too dark/thin against the void at this throw angle to sell
     the connection. Pulled the throw-back down further (less total elevation) and lightened +
     thickened the neck's own top band so the bridge between torso and head reads as one
     silhouette instead of two blobs. */
  const NECK_ANG = 0.34;               // neck leans back+up out of the withers
  const HEAD_ANG = NECK_ANG + 0.46;     // head continues rotating back past vertical — the throw-back
  /* pivot is a FULL point (y AND z) — rotating about a pivot that only fixes Y and treats z as
     already-zeroed silently skews any point far from z=0 in the pre-rotation frame (the r1
     self-correction below: this under-specified pivot put jaw/nostril geometry underground). */
  function rotX(p, ang, pivot){
    const c = Math.cos(ang), s = Math.sin(ang);
    const y = p.y - pivot.y, z = p.z - pivot.z;
    return V(p.x, pivot.y + y * c - z * s, pivot.z + y * s + z * c);
  }
  const neckXf = (p) => rotX(p, NECK_ANG, V(0, L.neckLoY, 0));
  const headPivot = V(0, L.jawHingeY, 0);
  const headXf = (p) => rotX(neckXf(V(p.x, p.y, p.z)), HEAD_ANG - NECK_ANG, neckXf(headPivot));

  /* ===== LEGS — stumpy uniguligrade columns, thick and near-vertical, planted wide: the
     fence-breaking bull's braced stance. No long horse zigzag; short cannon per hippo/boar
     reading (body mass rides low, legs are short stout posts). ===== */
  /* footY sits well clear of the ground (law: bbox min.y >= -0.01) — a tilted ring at the ankle
     (the knee->foot axis isn't purely vertical) sweeps its lowest point below the foot's own y
     by roughly footR*sin(tilt), so the baseline is lifted with that swept radius in mind rather
     than resting flush on y=0.05 (the r1 self-correction: y=0.05 clipped the ground plane once
     the ring geometry's true low point was measured). */
  const legR = 0.115 * S, footR = 0.092 * S;
  const LEG_N = 14;
  function leg(hipX, hipZ, footX, footZ){
    const hip = V(hipX, L.hipY, hipZ);
    const knee = V(hipX * 0.95, L.hipY * 0.42, hipZ * 0.90 + (hipZ >= 0 ? 0.01 : -0.01));
    const foot = V(footX, 0.115 * S, footZ);
    tube(hip, knee, legR, legR * 0.94, LEG_N, P.hide, { capA: { hex: P.hideDk } });
    tube(knee, foot, legR * 0.92, footR, LEG_N, P.hideDk, { capB: { hex: P.hoofDk, lift: 0.012 } });
    // blunt hoof-block, no toes, plus a thin toenail-flick strip for extra countable detail
    const hb = V(footX, 0.05 * S, footZ);
    quad(V(hb.x - footR * 0.9, 0.02, hb.z - footR * 0.9), V(hb.x + footR * 0.9, 0.02, hb.z - footR * 0.9),
      V(hb.x + footR * 0.85, 0.02, hb.z + footR * 0.85), V(hb.x - footR * 0.85, 0.02, hb.z + footR * 0.85), P.hoofDk, 0.03);
    for (let i = -1; i <= 1; i++) {
      const nx = hb.x + i * footR * 0.55, nz = hb.z + footR * 0.82;
      quad(V(nx - footR * 0.12, 0.01, nz), V(nx + footR * 0.12, 0.01, nz),
        V(nx + footR * 0.10, 0.03, nz + footR * 0.10), V(nx - footR * 0.10, 0.03, nz + footR * 0.10), P.hoofDk, 0.05);
    }
  }
  const frontZ = 0.36 * S, rearZ = -0.30 * S;
  const trackX = 0.30 * S;
  leg(-trackX, frontZ, -trackX * 1.05, frontZ + 0.02);
  leg(trackX, frontZ, trackX * 1.05, frontZ + 0.02);
  leg(-trackX, rearZ, -trackX * 1.08, rearZ - 0.02);
  leg(trackX, rearZ, trackX * 1.08, rearZ - 0.02);

  /* ===== BARREL — near-circular, rounder and lower-slung than the rhino: widest at mid-belly,
     sagging close to the ground, no shoulder hump / horn ridge (the anti-rhino silhouette). ===== */
  const torsoBands = [
    { y: L.hipY - 0.03 * S, rx: 0.27 * S, rz: 0.40 * S, hex: P.hideDk, cz: rearZ - 0.02 * S },
    { y: L.hipY - 0.02 * S, rx: 0.34 * S, rz: 0.46 * S, hex: P.hideDk, cz: rearZ + 0.06 * S },
    { y: L.ribY,            rx: 0.42 * S, rz: 0.52 * S, hex: P.hide,   cz: (rearZ + frontZ) / 2 * 0.55 },
    { y: L.withersY,        rx: 0.44 * S, rz: 0.42 * S, hex: P.hide,   cz: frontZ - 0.08 * S },
    { y: L.withersY + 0.01 * S, rx: 0.40 * S, rz: 0.30 * S, hex: P.hideLt, cz: frontZ - 0.02 * S },
  ];
  stack(torsoBands, 18, { capBot: { hex: P.belly, lift: 0.05 * S } });

  /* belly shading strip — dark low band, low value contrast, keeps the round barrel from
     reading as one flat blob (still well under the void/body threshold) */
  {
    const c = V(0, L.hipY - 0.06 * S, (rearZ + frontZ) / 2);
    quad(V(c.x - 0.34 * S, c.y, c.z - 0.42 * S), V(c.x + 0.34 * S, c.y, c.z - 0.42 * S),
      V(c.x + 0.30 * S, c.y, c.z + 0.42 * S), V(c.x - 0.30 * S, c.y, c.z + 0.42 * S), P.belly, 0.04);
  }

  /* short thick kinked tail out the rear — tail-flick cue, cheap */
  {
    const base = V(0, L.hipY + 0.10 * S, rearZ - 0.40 * S);
    const mid = V(0, L.hipY + 0.22 * S, rearZ - 0.52 * S);
    const tip = V(0.04 * S, L.hipY + 0.16 * S, rearZ - 0.60 * S);
    tube(base, mid, 0.045 * S, 0.036 * S, 9, P.hideDk);
    tube(mid, tip, 0.036 * S, 0.02 * S, 9, P.hideDk, { capB: { hex: P.hideDk, lift: 0.01 } });
  }

  /* ===== NECK — short, thick, kinked up hard out of the withers (territorial throw). ===== */
  {
    const neckBands = [
      { y: L.neckLoY,                 rx: 0.245 * S, rz: 0.26 * S, hex: P.hide,   cz: 0.02 * S },
      { y: (L.neckLoY + L.neckHiY)/2, rx: 0.235 * S, rz: 0.25 * S, hex: P.hideDk, cz: 0.09 * S },
      { y: L.neckHiY,                 rx: 0.245 * S, rz: 0.30 * S, hex: P.hideLt, cz: 0.16 * S },
    ];
    stack(neckBands, 14, { xform: neckXf });
  }

  /* ===== HEAD — thrown back on the neck kink; the jaw hinges open to a near-180-degree wedge:
     upper jaw block stays anchored to the head-throw rotation, lower jaw block hinges DOWN and
     further back from that same hinge point so the gape reads as a genuine wide-open V, not a
     closed block with a mouth decal. Pink mouth interior + tusk pegs carry the law-3 signature
     patch (>=140 RGB, on the render's high-value zone). ===== */
  {
    const hinge = headXf(V(0, L.jawHingeY, 0.10 * S));

    /* upper head mass — skull/muzzle block, rides the full head-throw rotation */
    const headBands = [
      { y: L.jawHingeY,                      rx: 0.245 * S, rz: 0.30 * S, hex: P.hide,   cz: 0.16 * S },   // seams to the neck's top ring (same local cz)
      { y: (L.jawHingeY + L.crownY) / 2,     rx: 0.245 * S, rz: 0.33 * S, hex: P.hideDk, cz: 0.20 * S },
      { y: L.crownY,                          rx: 0.235 * S, rz: 0.34 * S, hex: P.hideLt, cz: 0.18 * S },
    ];
    stack(headBands, 14, { xform: headXf, capTop: { hex: P.hide, lift: 0.02 * S } });

    /* upper jaw / snout slab reaching forward from the hinge, flat-topped hippo muzzle */
    const uJawFront = headXf(V(0, L.jawHingeY + 0.02 * S, 0.10 * S + 0.34 * S));
    const uJawHinge = headXf(V(0, L.jawHingeY + 0.02 * S, 0.10 * S));
    quad(V(uJawHinge.x - 0.20 * S, uJawHinge.y, uJawHinge.z), V(uJawHinge.x + 0.20 * S, uJawHinge.y, uJawHinge.z),
      V(uJawFront.x + 0.16 * S, uJawFront.y, uJawFront.z), V(uJawFront.x - 0.16 * S, uJawFront.y, uJawFront.z), P.hide, 0.04);
    // nostril flare bumps at the snout tip
    for (const s of [-1, 1]) {
      const n = headXf(V(s * 0.09 * S, L.jawHingeY + 0.06 * S, 0.10 * S + 0.36 * S));
      quad(V(n.x - 0.03 * S, n.y - 0.02 * S, n.z), V(n.x + 0.03 * S, n.y - 0.02 * S, n.z),
        V(n.x + 0.025 * S, n.y + 0.02 * S, n.z), V(n.x - 0.025 * S, n.y + 0.02 * S, n.z), P.hideDk, 0.05);
    }

    /* small rounded ears, high on the skull */
    for (const s of [-1, 1]) {
      const eb = headXf(V(s * 0.15 * S, L.crownY + 0.04 * S, 0.02 * S));
      quad(V(eb.x - 0.035 * S, eb.y, eb.z - 0.03 * S), V(eb.x + 0.035 * S, eb.y, eb.z - 0.03 * S),
        V(eb.x + 0.03 * S, eb.y + 0.05 * S, eb.z), V(eb.x - 0.03 * S, eb.y + 0.05 * S, eb.z), P.ear, 0.04);
    }

    /* jowl bulges — heavy cheek mass at the jaw hinge (the mean-bull "gores on principle" read).
       R2 SELF-CORRECTION (post r2/r3 engine render): the first placement reached far enough out
       in local x that, once thrown through the head's extreme rotation, it rendered as a small
       isolated chunk floating apart from the head silhouette instead of a fused cheek bulge.
       Pulled the base flush against the head band radius (starts ON the skull surface, not
       0.22S out past it) and shortened the reach so it visually fuses into the head mass. */
    for (const s of [-1, 1]) {
      const jb = headXf(V(s * 0.15 * S, L.jawHingeY - 0.01 * S, 0.14 * S));
      const jt = headXf(V(s * 0.185 * S, L.jawHingeY - 0.035 * S, 0.17 * S));
      tube(jb, jt, 0.06 * S, 0.035 * S, 8, P.hideDk, { capB: { hex: P.hideDk, lift: 0.01 } });
    }
    /* eye bumps set HIGH on the head — the periscope-eye hippo read */
    for (const s of [-1, 1]) {
      const eyC = headXf(V(s * 0.135 * S, L.crownY - 0.01 * S, 0.20 * S));
      quad(V(eyC.x - 0.022 * S, eyC.y - 0.018 * S, eyC.z), V(eyC.x + 0.022 * S, eyC.y - 0.018 * S, eyC.z),
        V(eyC.x + 0.018 * S, eyC.y + 0.018 * S, eyC.z), V(eyC.x - 0.018 * S, eyC.y + 0.018 * S, eyC.z), P.eye, 0.06);
    }

    /* PINK MOUTH INTERIOR — a wide backing wedge inside the gape between upper and lower jaw,
       the law-3 high-value zone (>=140 RGB — 0xc25a5a reads well over threshold on each
       channel's brighter component). Spans hinge to snout tip, wide at the hinge, tapering
       forward — the near-180-degree wedge shape itself. */
    /* R1 SELF-CORRECTION (pre-render bake-check): the first pass added these offsets as flat
       WORLD-space deltas off the already-rotated uJawHinge/uJawFront points — fine while the
       head sat near-vertical, but once the head is thrown back ~90 degrees "further down"
       in world-y is no longer "further into the mouth" locally, and the wedge punched through
       the ground plane. Rebuilt entirely in HEAD-LOCAL space (through headXf, same frame as
       the lower jaw) so the wedge stays anchored to the head regardless of throw-back angle. */
    const mouthHingeL = headXf(V(-0.17 * S, L.jawHingeY, 0.10 * S));
    const mouthHingeR = headXf(V(0.17 * S, L.jawHingeY, 0.10 * S));
    const mouthTipL = headXf(V(-0.11 * S, L.jawHingeY - 0.16 * S, 0.10 * S + 0.30 * S));
    const mouthTipR = headXf(V(0.11 * S, L.jawHingeY - 0.16 * S, 0.10 * S + 0.30 * S));
    quad(mouthHingeL, mouthHingeR, mouthTipR, mouthTipL, P.mouth, 0.05);
    // back-of-throat darker patch at the hinge, depth cue
    const throatL = headXf(V(-0.14 * S, L.jawHingeY - 0.05 * S, 0.10 * S + 0.02 * S));
    const throatR = headXf(V(0.14 * S, L.jawHingeY - 0.05 * S, 0.10 * S + 0.02 * S));
    quad(mouthHingeL, mouthHingeR, throatR, throatL, P.mouthDk, 0.05);

    /* LOWER JAW — built entirely in HEAD-LOCAL space (offsets composed through the single
       headXf transform, same frame the upper jaw already rides) and dropped well below/behind
       the upper jaw locally so the two slabs pry apart into the full wedge (the 180-degree
       gape) without a second independent rotation (the r1 self-correction below: a second
       from-scratch hinge rotation compounded with the neck/head rotations and put the jaw
       geometry underground — see the self-review note at file bottom). */
    const lHinge = headXf(V(0, L.jawHingeY - 0.01 * S, 0.10 * S));
    const lTip = headXf(V(0, L.jawHingeY - 0.26 * S, 0.10 * S + 0.20 * S));
    quad(V(lHinge.x - 0.18 * S, lHinge.y, lHinge.z), V(lHinge.x + 0.18 * S, lHinge.y, lHinge.z),
      V(lTip.x + 0.14 * S, lTip.y, lTip.z), V(lTip.x - 0.14 * S, lTip.y, lTip.z), P.hideDk, 0.04);

    /* TUSK PEGS — pale, blunt, countable: 2 lower canine tusks (bigger, jutting up from the
       lower jaw into the gape) + a row of small upper/lower incisor pegs. The law-3 signature
       feature sitting right in the pink high-value zone. Also head-local, composed via headXf. */
    for (const s of [-1, 1]) {
      const tb = headXf(V(s * 0.10 * S, L.jawHingeY - 0.23 * S, 0.10 * S + 0.14 * S));
      const ttLocal = headXf(V(s * 0.09 * S, L.jawHingeY - 0.14 * S, 0.10 * S + 0.10 * S));
      tube(tb, ttLocal, 0.028 * S, 0.012 * S, 9, P.tusk, { capB: { hex: P.tusk, lift: 0.006 } });
    }
    // small incisor peg row, upper jaw front edge — 5 countable pegs across the gape
    for (let i = -2; i <= 2; i++) {
      const pb = V(uJawFront.x + i * 0.035 * S, uJawFront.y - 0.05 * S, uJawFront.z - 0.01 * S);
      const pt = V(pb.x, pb.y - 0.045 * S, pb.z);
      tube(pb, pt, 0.013 * S, 0.007 * S, 6, P.tuskDk, { capB: { hex: P.tuskDk, lift: 0.004 } });
    }
  }

  /* ---------- base disc (Huge: r=0.85, scaled with the bull) ---------- */
  {
    const dr = 0.85 * (S / 1.55) * 1.0;
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), dr, dr, 26);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), dr - 0.02, dr - 0.02, 26);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
