/* dev/model-qa/creatures/rlm-seas-giant-octopus.js — the GIANT OCTOPUS landmark table
   (CEPHALOPOD family, Large, CR 1, realm high-seas), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (2026-07-08 foundry pilot, seas-w1 cell 2, port 5252). Core identity:
   trench-spawned tentacle-beast dragging sailors under. No CEPHALOPOD section exists yet in
   ANATOMY-CANON (family stub list doesn't even list it) — authored here from first-principles
   cephalopod structure (bulbous mantle, radial 8-arm ring, sucker-dot ladders, one huge eye)
   plus the cross-family construction rules (seat appendages from the surface, small features
   need real 3D volume, value contrast on the signature). Bespoke to the render key
   "giant-octopus" — realm reskins ride this chassis narratively.

   FEATURE CHECKLIST (baked at 1,002 tris — under band, every feature reads; no padding added):
     1. Bulbous mantle (the head-body mass) — a single tapering blob loft, reared up and back,
        NOT a round ball: wider at the base where the arms root, narrowing toward a blunt crown,
        with a slight forward hood-lean over the eye (the "reared" read law 5 wants).
     2. SIGNATURE — 8 countable radial arms (law 1: the arms ARE the budget), each a tapering
        3-segment tube, individually posed into three groups per the drag-under pose: 3 anchoring
        the base disc (splayed low, gripping the seabed), 3 reaching high at different curl
        heights/directions, 2 coiled mid-grab (a tight hook, as if already closed on prey).
     3. Pale sucker-dot ladders running the underside of every arm — small pale blobs in a single
        line down each arm's inner face, DENSEST near the mantle and thinning toward the tip
        (the high-value zone law 3 needs, set against the dusky mantle/arm topside).
     4. ONE huge eye, off-center on the mantle's front-upper face, pale sclera + dark slit pupil +
        a small glint — the single loud "wrongness" landmark per law 4, large enough to anchor
        the silhouette read even at 1/3-res.
     5. A short beak/siphon nub tucked under the mantle where the arms crown (small, dark,
        countable — sells "this is a mouth/jet" without spending real budget).
     6. Base disc arms get flared sucker-pad tips (slightly widened last segment) so the 3
        anchoring arms visibly grip rather than just taper to a point.

   POSE SENTENCE: mantle reared up and hooded over one huge eye, 3 arms splayed low and gripping
   the seabed disc, 3 arms flung high at staggered heights and curl-directions reaching for the
   surface, 2 arms coiled into a tight closing hook at mid-height as if already crushing a catch —
   the drag-under, never a resting radial idle.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w1'], cell 2, fn buildGiantOctopus). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one radial arm: base (mantle root, near ground) -> mid -> curl -> tip, 3 tapering tube
   segments + a line of pale sucker-dot blobs down the inner (underside-facing) face, densest
   near the root and thinning toward the tip. `flare` widens the last segment for the 3
   ground-gripping arms so they read as anchoring rather than just tapering to a point. */
function arm(base, mid, curl, tip, sideDir, hexTop, hexUnder, suckerHex, flare){
  const r0 = 0.075, r1 = 0.052, r2 = 0.030, r3 = flare ? 0.026 : 0.012;
  tube(base, mid, r0, r1, 6, hexTop, { capA: { hex: hexTop } });
  tube(mid, curl, r1, r2, 6, hexTop);
  tube(curl, tip, r2, r3, 6, hexUnder, { capB: { hex: hexUnder } });
  // sucker-dot ladder along the inner face — 3 cheap dots, root-dense, thinning toward the tip,
  // offset toward sideDir so they sit on the arm's inner (underside-facing) surface.
  const segs = [[base, mid], [mid, curl], [curl, tip]];
  const rr0 = [r0, r1, r2], rr1 = [r1, r2, r3];
  for(let s = 0; s < segs.length; s++){
    const [a, b] = segs[s];
    const t = 0.5;
    const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t, pz = a.z + (b.z - a.z) * t;
    const rr = (rr0[s] + (rr1[s] - rr0[s]) * t);
    const dr = 0.030 * (1 - s * 0.30);
    blob(px + sideDir.x * rr * 0.9, py + sideDir.y * rr * 0.9, pz + sideDir.z * rr * 0.9,
         dr, dr, dr, suckerHex, 4, 2);
  }
}

export function buildGiantOctopus(){
  /* CRITIC FIX (pass-2, self-correction round): r1 render showed the arms blending into the
     mantle (near-identical dark-teal values, law 3) and folded too close to the body so the
     8-arm spread never broke the silhouette (law 2). Brightened the arm topside noticeably
     ABOVE the mantle (arms read as the lit, active limbs), pushed every arm group's reach
     radius/height further out from the mantle's own silhouette edge, enlarged + recentered the
     eye off the confusable belly patch, and moved the belly patch down out of the eye's way. */
  const P = {
    mantleTop: 0x3f515c, mantleDk: 0x252f36, mantleBelly: 0x6d8992,
    armTop: 0x5a7684, armUnder: 0x3d505a,
    sucker: 0xf0e0b8,
    eyeSclera: 0xf2e6c4, eyePupil: 0x120c0e, eyeGlint: 0xffffff,
    beak: 0x181214,
  };

  // 1. BULBOUS MANTLE — tapering blob loft, reared up and back over the arm crown, wider at
  // base (arm root) narrowing to a blunt hooded crown, slight forward lean at the top band.
  stack([
    { y: 0.28, rx: 0.30, rz: 0.28, cz: 0.02, hex: P.mantleDk },
    { y: 0.42, rx: 0.36, rz: 0.34, cz: 0.03, hex: P.mantleTop },
    { y: 0.58, rx: 0.38, rz: 0.35, cz: 0.02, hex: P.mantleTop },
    { y: 0.74, rx: 0.33, rz: 0.31, cz: 0.05, hex: P.mantleTop },
    { y: 0.88, rx: 0.22, rz: 0.21, cz: 0.09, hex: P.mantleDk },
  ], 10, { phase: Math.PI / 10, capTop: { hex: P.mantleDk, lift: 0.03 } });
  // pale underside/belly patch — moved DOWN near the arm crown (off the eye) so it never reads
  // as a second eye/mouth; still the value-contrast zone low on the front mantle face.
  blob(0.02, 0.20, 0.27, 0.13, 0.10, 0.06, P.mantleBelly, 6, 3);

  // 4. ONE HUGE EYE — centered high on the mantle's front face, hooded by the crown lean.
  // CRITIC FIX r2 (2nd self-correction pass): the r2 render showed a black gap/crescent next to
  // the eye — the flattened sclera blob poked PAST the mantle's local surface radius so the void
  // showed through the seam between the two unwelded meshes. Pulled the eye in to sit mostly
  // EMBEDDED (fuller round sclera, smaller z-offset) so it's fully backed by mantle mass, and
  // kept the pupil/glint close so nothing floats proud of the socket.
  // CRITIC FIX r4 (fresh-context pass-2): the r3 render showed the whole sclera+pupil+glint stack
  // reading as ONE undifferentiated pale smear (pixel-sampled — no dark pixel inside the pale
  // patch at all) — the pupil was too small and too close to the sclera surface to survive
  // dithering at 1/3-res, so "one huge eye" was reading as a shapeless skull-mark instead of an
  // eye. Enlarged the pupil substantially (was ~40% of sclera radius, now ~65%) and pushed it
  // further forward off the sclera surface so it casts as its own distinct dark disc rather than
  // blending into the cream sclera value.
  const eyeC = V(0.0, 0.64, 0.30);
  blob(eyeC.x, eyeC.y, eyeC.z, 0.16, 0.16, 0.15, P.eyeSclera, 7, 4);
  blob(eyeC.x, eyeC.y - 0.01, eyeC.z + 0.13, 0.10, 0.125, 0.075, P.eyePupil, 5, 3);
  blob(eyeC.x - 0.045, eyeC.y + 0.04, eyeC.z + 0.185, 0.028, 0.028, 0.024, P.eyeGlint, 4, 2);

  // 5. beak/siphon nub under the mantle where the arms crown
  capFan(ring(V(0.02, 0.24, 0.16), V(0, -1, 0.4), 0.045, 0.045, 6, 0), V(0.02, 0.15, 0.22), P.beak);

  // 2. SIGNATURE — 8 radial arms, three groups per the drag-under pose. Root ring sits just
  // above the ground at the mantle base, arms fan out radially then execute their group's move.
  // CRITIC FIX: every group's reach pushed further out (radius AND height) so each arm clears
  // the mantle's own silhouette edge (rx maxes at 0.38) instead of folding invisibly against it.
  const rootY = 0.14, rootR = 0.26;

  // GROUP A — 3 arms anchoring the base disc: splayed low + wide, gripping the seabed, flared tips.
  const anchorAngles = [200, 260, 320]; // degrees, rear-spread away from the eye-facing front
  for(const degA of anchorAngles){
    const a = degA * Math.PI / 180;
    const base = V(Math.cos(a) * rootR, rootY, Math.sin(a) * rootR);
    const mid  = V(Math.cos(a) * 0.58, 0.08, Math.sin(a) * 0.58);
    const curl = V(Math.cos(a) * 0.84, 0.05, Math.sin(a) * 0.84);
    const tip  = V(Math.cos(a) * 1.02, 0.045, Math.sin(a) * 1.02);
    const side = norm([-Math.sin(a), 0.3, Math.cos(a)]);
    arm(base, mid, curl, tip, side, P.armTop, P.armUnder, P.sucker, true);
  }

  // GROUP B — 3 arms flung high, staggered heights and curl-directions, reaching for the surface.
  const highSet = [
    { deg: 15,  h: 1.10, curlSign: 1 },
    { deg: 85,  h: 1.35, curlSign: -1 },
    { deg: 145, h: 1.18, curlSign: 1 },
  ];
  for(const hs of highSet){
    const a = hs.deg * Math.PI / 180;
    const base = V(Math.cos(a) * rootR, rootY, Math.sin(a) * rootR);
    const mid  = V(Math.cos(a) * 0.42, rootY + (hs.h - rootY) * 0.48, Math.sin(a) * 0.42);
    const curl = V(Math.cos(a) * 0.40 + hs.curlSign * 0.22, hs.h * 0.90, Math.sin(a) * 0.40 - hs.curlSign * 0.12);
    const tip  = V(Math.cos(a) * 0.22 + hs.curlSign * 0.44, hs.h, Math.sin(a) * 0.22 - hs.curlSign * 0.30);
    const side = norm([hs.curlSign, 0.2, 0]);
    arm(base, mid, curl, tip, side, P.armTop, P.armUnder, P.sucker, false);
  }

  // GROUP C — 2 arms coiled into a tight closing hook at mid-height, as if already crushing prey.
  const hookSet = [ { deg: 350, h: 0.48 }, { deg: 60, h: 0.56 } ];
  for(const hk of hookSet){
    const a = hk.deg * Math.PI / 180;
    const base = V(Math.cos(a) * rootR, rootY, Math.sin(a) * rootR);
    const mid  = V(Math.cos(a) * 0.56, hk.h, Math.sin(a) * 0.56 + 0.08);
    const curl = V(Math.cos(a) * 0.46, hk.h + 0.16, Math.sin(a) * 0.46 + 0.34);
    const tip  = V(Math.cos(a) * 0.26, hk.h + 0.04, Math.sin(a) * 0.26 + 0.46);
    const side = norm([0, 1, 0.2]);
    arm(base, mid, curl, tip, side, P.armTop, P.armUnder, P.sucker, false);
  }
}
