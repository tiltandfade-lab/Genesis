/* dev/model-qa/creatures/rlm-frontier-gorgon.js — the GORGON landmark table (QUADRUPED-
   UNGULIGRADE family per docs/ANATOMY-CANON.md, but the CONSTRUCT variant — overlapping iron
   plates with visible seams stand in for hide/muscle), Large, CR 5, realm frontier, authored
   under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, frontier-w2 cell 7, port
   5337). Core identity: the forged iron bull — a construct built in a bull's shape, breathing
   petrifying dust through nostril vents, not a living animal. Bespoke to the render key
   "gorgon"; realm reskins ride this chassis.

   FEATURE CHECKLIST (the ~1,400-1,700 budget buys):
     1. UNGULIGRADE quadruped rig per ANATOMY-CANON: square horse-proportioned barrel torso
        (H~=L), deep-narrow chest, near-vertical straight FRONT legs vs. the angular Z-zigzag
        HIND legs (hip->femur->stifle-forward->tibia->hock-backward->cannon->hoof) — that
        contrast is the anatomy read, construct skin or not.
     2. SIGNATURE — the plate seams: the torso/neck/haunch are built as overlapping iron BANDS
        (each band a distinct radius step + a dark seam line at the overlap), not a smooth
        loft, so the "riveted armor plates" identity reads at the silhouette's own surface.
     3. Two forward-swept horns off a low, heavy bull skull-wedge (no antlers — horns are
        solid tapered cones, a construct's cast fixtures, not organic keratin).
     4. Two pale petrifying-dust nostril cones jetting forward-down from the muzzle vents —
        the "breathing dust" beat, built as translucent-pale flared cones so they land as a
        distinct light shape ahead of the lowered head.
     5. One foreleg raised and pawing/raking the ground (the pre-charge tell) with the hoof
        cocked back off the ground plane, the opposite hind leg driving the counterpose brace.
     6. Cool-grey iron value ladder (law-3 high-value zone) — dark gunmetal flanks against
        bright polished-edge highlights riding every plate's top rim + the horns, so the
        signature (seams+horns) carries the brightest tones; explicitly COOL grey-blue, not
        warm ochre/brown, so it reads METAL against the stone-golem masonry read.

   POSE SENTENCE: the pre-charge paw — head lowered level with the chest, near the ground, one
   foreline raised and raking forward-down at the dirt (hoof cocked, cannon bent), the driving
   hind leg on the same side braced hard back in its hock-zigzag while the opposite fore/hind
   plant square, weight rocked forward onto the chest, twin dust jets streaming low off the
   nostrils — the half-second before the charge, never a static at-attention stand.

   POSE NOTE (per ANATOMY-CANON POSE-ANATOMY, adapted for a quadruped): the "spine" here is the
   pelvis->withers->skull topline curve — it is NOT a level plumb line: the skull is carried
   LOW (dropped ~0.30H below the withers, chin near the paw) so the topline reads as a
   committed forward-diving arc, not a horse standing square. The raised pawing foreleg bends
   visibly at the carpus (~120deg, not a straight column) per law 2; the raking hind leg's
   hock is the sharp counterpose bend driving the weight forward, and the two planted limbs on
   the opposite side are the tripod-equivalent brace that keeps the forward-rocked weight from
   toppling — the quadruped counterpose analog of law 4.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0, spine +z
   (head faces +z, tail -z). Imported by ps1-sheet.html (SETS['frontier-w2'], cell 7, fn
   buildGorgon). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}
function lerp(a, b, t){ return a.clone().lerp(b, t); }

export function buildGorgon(){
  /* ---------- PALETTE (cool gunmetal-grey flanks vs bright polished-edge highlights on every
     plate rim + the horns — the law-3 high-value zone rides the signature; deliberately COOL
     blue-grey so it reads METAL against stone-golem masonry browns). ---------- */
  /* R1 SELF-REVIEW FIX (post r1 engine render): the whole gunmetal ladder (lum ~45-99) read as
     a near-black-blue blob almost merged into the (10,9,8) void — law 3's body-mass-over-void
     floor failed outright, and the dark seam lines (0x171b1f) laid over an already-dark iron
     base compounded into mud. Body mass base value roughly doubled across the board (cool
     blue-grey hue KEPT so it still reads metal, not stone); seams stay dark but now contrast
     against a genuinely lit body instead of disappearing with it. */
  const P = {
    iron: 0x7a8794, ironDk: 0x565f6a, ironLt: 0x9fadb8,     // gunmetal barrel flanks, brightened
    seam: 0x22262b,                                          // dark overlap seam line, now contrasts
    edge: 0xd8e1e7, edgeBr: 0xf5f9fb,                         // polished plate-rim highlight, highest value
    leg:  0x808d99, legDk: 0x5c6570,                          // front/hind leg iron, brightened
    hoof: 0x2a2f35,                                           // dark blunt hoof wedge, no toes
    horn: 0xe2dbca, hornDk: 0xb8ae98,                         // cast bone-pale horn cones
    dust: 0xdcebf2, dustDk: 0xaecad9,                          // R2: cool pale blue-white dust — was a
                                                                // warm cream indistinguishable from the
                                                                // horn's bone-tan; the jets need their own
                                                                // material read to separate from the horns
    rivet: 0xb6c0ca,                                          // small bright rivet studs on seams
    eye: 0x1a140e, eyeGlow: 0xf0a03a,                         // ember-forge eye glow, brightened
    disc: 0x1c2126, discTop: 0x232a30,
  };

  /* ===== RIG — the pelvis->withers->skull topline is the gesture line, dropped forward and
     down toward the head (pre-charge dive) instead of level. dive() carries every torso/neck/
     head/horn/eye point through the same forward-down tilt so the whole body reads as one
     committed lean, not a level barrel with a bowed neck glued on. ===== */
  /* R2 SECONDPASS FIX (flag: "reads as a slumped sleeping mass"): the r1 pivot (near the withers,
     z=0.05, close to the chest) put most of the skull/neck z-distance on the FAR side of the
     pivot from the withers, so the rotation math folded the neck-base UP above the withers and
     only barely dropped the muzzle below it (~0.11u) — the topline came out lumpy/flat instead of
     a clean raised-chest-to-lowered-head arc, reading as a compressed curled mass. Moving the
     pivot forward+up (closer to the actual withers peak) and cutting the angle back gives a
     monotonic descending topline: withers/chest peak highest, neck/head drop well below it,
     hindquarters taper down toward the tail — the "coiled to charge" silhouette the pose sentence
     describes, verified point-by-point before re-baking. */
  const DIVE_DEG = 8;                // topline drop toward the head (+z, down)
  const DIVE_PIVOT = V(0, 0.66, 0.28);   // pivots at the withers peak — chest/withers stay raised
  /* LIFT — a small uniform world-y bias applied to every dive()-carried point (body/neck/head/
     horns/eyes/dust/tail). Legs are grounded independently via explicit world targets below and
     are unaffected by this bias, so nudging the whole dived silhouette up clears the floor
     without touching leg placement. */
  const LIFT = 0.09;
  function dive(p){
    const rel = V(p.x, p.y - DIVE_PIVOT.y, p.z - DIVE_PIVOT.z);
    const r = -DIVE_DEG * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    // rotate around X axis: +z (forward) tips down toward -y
    const ry = rel.y * c - rel.z * s;
    const rz = rel.y * s + rel.z * c;
    return V(rel.x + DIVE_PIVOT.x, ry + DIVE_PIVOT.y + LIFT, rz + DIVE_PIVOT.z);
  }

  /* ===== BODY — square horse-proportioned barrel (H~=L), deep-narrow chest, built as
     overlapping PLATE BANDS: each band steps radius then a dark seam quad rides the overlap,
     so the "riveted iron plates" signature lives in the torso surface itself, not decals. ===== */
  const bodyBands = [
    { y: 0.30, z: 0.62,  rx: 0.30, rz: 0.44, hex: P.ironDk },   // chest/brisket, deep
    { y: 0.50, z: 0.55,  rx: 0.33, rz: 0.50, hex: P.iron },
    { y: 0.62, z: 0.30,  rx: 0.36, rz: 0.56, hex: P.ironLt },   // withers plate, brightest flank band
    { y: 0.60, z: 0.00,  rx: 0.34, rz: 0.54, hex: P.iron },
    { y: 0.52, z: -0.35, rx: 0.30, rz: 0.44, hex: P.ironDk },   // haunch, tucked
    { y: 0.40, z: -0.58, rx: 0.20, rz: 0.28, hex: P.ironDk },   // rump taper
  ];
  {
    const n = 10;
    const rings = bodyBands.map(b => ring(V(0, b.y, b.z), V(0, 0, 1), b.rx, b.rz, n, Math.PI / n));
    // dive() only bends the y/z of each ring point, keep x untouched — build local then transform
    const divedRings = rings.map(r => r.map(p => dive(p)));
    stitch(divedRings, (b) => bodyBands[b].hex);
    capFan(divedRings[0], dive(V(0, bodyBands[0].y - 0.02, bodyBands[0].z + 0.06)), P.ironDk, true);
    capFan(divedRings.at(-1), dive(V(0, bodyBands.at(-1).y - 0.03, bodyBands.at(-1).z - 0.06)), P.ironDk);
    /* seam lines — a thin dark ring riding the leading edge of each band step (the overlap
       shadow), plus small bright rivet studs at 4 points per seam so the plates read riveted,
       not painted stripes. R2 SECONDPASS FIX (flag: "the iron does not read as METAL"): the
       feature checklist promised "bright polished-edge highlights riding every plate's top rim"
       but only the dark underside shadow was ever built — no actual highlight existed, so the
       whole barrel read as flat-lit cloth. Added a thin edgeBr strip riding the TOP of each band
       step (the dorsal/back-seam rim, opposite the dark shadow) — that's the specular-edge cue
       that makes overlapping plates read as polished metal instead of a painted blob. */
    for(let bi = 1; bi < divedRings.length - 1; bi++){
      const ringPts = divedRings[bi];
      for(let i = 0; i < n; i++){
        const i2 = (i + 1) % n;
        quad(ringPts[i], ringPts[i2], ringPts[i2].clone().add(V(0, -0.018, 0)), ringPts[i].clone().add(V(0, -0.018, 0)), P.seam, 0.05);
        quad(ringPts[i].clone().add(V(0, 0.014, 0)), ringPts[i2].clone().add(V(0, 0.014, 0)), ringPts[i2], ringPts[i], P.edgeBr, 0.03);
      }
      if(bi % 2 === 1){
        for(let k = 0; k < 4; k++){
          const idx = Math.floor((k / 4) * n);
          const p = ringPts[idx];
          blob(p.x, p.y - 0.006, p.z, 0.014, 0.012, 0.014, P.rivet, 4, 3);
        }
      }
    }
  }

  /* ===== NECK — thick low-slung iron cylinder carrying the dive from the withers down to
     the skull, no organic arch (a construct's neck is a solid forged column, not a bull's
     muscled arch), plated the same way as the torso. ===== */
  const neckA = dive(V(0, 0.60, 0.60));
  const neckB = dive(V(0, 0.40, 0.98));
  tube(neckA, neckB, 0.27, 0.20, 10, P.iron, {});
  {
    const midLocal = V(0, 0.50, 0.79);
    const mid = dive(midLocal);
    const seamRing = ring(mid, dive(V(0, 0.40, 0.98)).clone().sub(dive(V(0, 0.60, 0.60))).normalize(), 0.235, 0.235, 10, Math.PI / 10);
    for(let i = 0; i < 10; i++){
      const i2 = (i + 1) % 10;
      quad(seamRing[i], seamRing[i2], seamRing[i2].clone().add(V(0, -0.016, 0)), seamRing[i].clone().add(V(0, -0.016, 0)), P.seam, 0.05);
      quad(seamRing[i].clone().add(V(0, 0.012, 0)), seamRing[i2].clone().add(V(0, 0.012, 0)), seamRing[i2], seamRing[i], P.edgeBr, 0.03);
    }
  }

  /* ===== HEAD — low heavy bull skull-wedge carried at the bottom of the dive (chin near the
     ground, per the pose sentence), two forward-swept cast-iron horns, ember eyes, twin
     petrifying-dust nostril cones jetting forward-down. ===== */
  const skullBands = [
    { y: 0.36, z: 0.98, rx: 0.19, rz: 0.14, hex: P.iron },
    { y: 0.34, z: 1.14, rx: 0.20, rz: 0.20, hex: P.ironLt },   // brow plate, bright
    { y: 0.24, z: 1.30, rx: 0.14, rz: 0.16, hex: P.iron },
    { y: 0.18, z: 1.42, rx: 0.085, rz: 0.11, hex: P.ironDk },   // muzzle, dark, low
  ];
  {
    const n = 8;
    const rings = skullBands.map(b => ring(V(0, b.y, b.z), V(0, 0, 1), b.rx, b.rz, n, Math.PI / n).map(dive));
    stitch(rings, (b) => skullBands[b].hex);
    capFan(rings.at(-1), dive(V(0, skullBands.at(-1).y - 0.01, skullBands.at(-1).z + 0.05)), P.ironDk);
  }

  /* horns — two forward-swept solid cast cones off the brow plate, the "cast fixture" read
     (thick base, tapering to a sharp point, no organic ridging). */
  function horn(rootLocal, tipLocal){
    const root = dive(rootLocal), tip = dive(tipLocal);
    // R2 SECONDPASS FIX (flag: "make the horns pop"): tip radius 0.010 (0.02u diameter) sat
    // under the law-3 0.04u feature floor and dissolved at 1/3-res; widened to clear it while
    // keeping the tapered cast-cone silhouette.
    tube(root, tip, 0.075, 0.022, 6, P.horn, { capB: { hex: P.hornDk } });
    // bright edge stripe along the top of the horn (law-3 high value on the signature)
    const upOff = V(0, 0.02, 0);
    quad(root.clone().add(upOff), tip.clone().add(V(0, 0.006, 0)), tip.clone().add(V(0, 0.006, 0)), root.clone().add(upOff), P.edgeBr, 0.05);
  }
  horn(V(0.15, 0.42, 1.06), V(0.42, 0.30, 1.52));
  horn(V(-0.15, 0.42, 1.06), V(-0.42, 0.30, 1.52));

  /* eyes — ember-forge glow set into the skull, low and forward-facing per the lowered-head
     pose. */
  for(const side of [1, -1]){
    const local = V(side * 0.115, 0.32, 1.16);
    const p = dive(local);
    blob(p.x, p.y, p.z, 0.026, 0.024, 0.020, P.eye, 6, 4);
    const g = dive(local.clone().add(V(side * 0.006, 0.002, 0.014)));
    blob(g.x, g.y, g.z, 0.013, 0.012, 0.010, P.eyeGlow, 4, 2);
  }

  /* nostril dust jets — two pale flared cones streaming forward-down off the muzzle vents,
     the "breathing petrifying dust" beat, distinct light shapes ahead of the lowered head.
     R2 SECONDPASS FIX (flag: "make ... dust jets pop"): the old cream tone sat right next to
     the horn's bone-tan (same warm pale family) so the two signatures smeared into one
     indistinct pale cluster at the head; recolored cool blue-white (see palette) and pushed the
     tip further forward-down so the plume clears the horn silhouette entirely instead of
     overlapping it in screen space. */
  function dustJet(rootLocal, dirLocal, hex){
    const root = dive(rootLocal);
    const dir = norm(dirLocal);
    const mid = root.clone().addScaledVector(dir, 0.17).add(V(0, -0.035, 0));
    const tip = root.clone().addScaledVector(dir, 0.38).add(V(0, -0.06, 0));
    mid.y = Math.max(mid.y, 0.09);
    tip.y = Math.max(tip.y, 0.09);
    tube(root, mid, 0.032, 0.052, 6, hex);
    tube(mid, tip, 0.052, 0.075, 6, hex, { capB: { hex } });
  }
  dustJet(V(0.045, 0.185, 1.44), [0.15, -0.15, 1], P.dust);
  dustJet(V(-0.045, 0.185, 1.44), [-0.15, -0.15, 1], P.dustDk);

  /* ===== LEGS — UNGULIGRADE contrast per ANATOMY-CANON: front = near-vertical straight
     column; hind = angular Z-zigzag (stifle forward-high, hock backward-high, long cannon).
     One foreleg raised/pawing (the pre-charge tell), its same-side hind leg the driving brace
     (hock deep-bent), the opposite fore/hind planted square as the counterpose tripod. ===== */
  /* NOTE: legs are built in TRUE WORLD SPACE, not carried through dive() — dive() rotates
     around a pivot near the withers, and a leg root far along +/-z from that pivot picks up a
     large spurious vertical offset from the rotation (the r1 bug: min.y ended up -0.38u).
     Instead each leg's hip is the dive()-transformed shoulder/haunch point (a single point close
     to the pivot reads fine), and every joint below the hip is placed by explicit WORLD y/z
     targets so hooves land exactly on the ground plane regardless of the body's forward dive. */
  function frontLeg(hipLocal, hex, hexDk, pawing){
    const hip = dive(hipLocal);
    if(!pawing){
      // straight planted column: shoulder -> carpus -> hoof, near-vertical, hoof ON the ground
      const carpus = V(hip.x, 0.24, hip.z + 0.02);
      const hoofTop = V(hip.x, 0.10, hip.z + 0.04);
      const hoofTip = V(hip.x, 0.05, hip.z + 0.10);
      tube(hip, carpus, 0.075, 0.058, 6, hex);
      tube(carpus, hoofTop, 0.055, 0.048, 6, hexDk);
      tube(hoofTop, hoofTip, 0.050, 0.052, 5, P.hoof, { capB: { hex: P.hoof } });
    } else {
      // pawing/raking: carpus bends ~120deg, hoof lifts and rakes forward, held OFF the ground
      const carpus = V(hip.x, 0.20, hip.z + 0.14);
      const hoofTop = V(hip.x, 0.09, hip.z + 0.32);
      const hoofTip = V(hip.x, 0.07, hip.z + 0.42);
      tube(hip, carpus, 0.075, 0.058, 6, hex);
      tube(carpus, hoofTop, 0.055, 0.048, 6, hexDk);
      tube(hoofTop, hoofTip, 0.050, 0.052, 5, P.hoof, { capB: { hex: P.hoof } });
    }
  }
  function hindLeg(hipLocal, hex, hexDk, driving){
    const hip = dive(hipLocal);
    // stifle sits forward-high & tucked, hock is the sharp backward bend, long near-vertical
    // cannon down to a planted hoof — all placed in world space off the hip.
    const stifle = V(hip.x, hip.y - 0.16, hip.z + 0.12);
    const hock = driving
      ? V(hip.x, 0.23, hip.z - 0.18)   // deep-bent, driving push back
      : V(hip.x, 0.25, hip.z - 0.10);
    const cannonBot = V(hip.x, 0.08, hip.z + (driving ? -0.02 : 0.02));
    const hoofTip = V(hip.x, 0.04, cannonBot.z + 0.06);
    tube(hip, stifle, 0.088, 0.066, 6, hex);
    tube(stifle, hock, 0.062, 0.050, 6, hexDk);
    tube(hock, cannonBot, 0.048, 0.040, 6, hex);
    tube(cannonBot, hoofTip, 0.044, 0.046, 5, P.hoof, { capB: { hex: P.hoof } });
  }

  // fore-right (+x) pawing (the raised, raking leg — the signature pose beat)
  frontLeg(V(0.20, 0.44, 0.62), P.leg, P.legDk, true);
  // fore-left (-x) planted square (counterpose brace)
  frontLeg(V(-0.20, 0.44, 0.62), P.legDk, P.leg, false);
  // hind-right (+x) driving hard (deep hock, matches the pawing fore on the same side)
  hindLeg(V(0.19, 0.44, -0.42), P.legDk, P.leg, true);
  // hind-left (-x) planted square (the other half of the counterpose tripod)
  hindLeg(V(-0.19, 0.44, -0.42), P.leg, P.legDk, false);

  /* ===== TAIL — short stiff iron whip, cast not hair. Root is dive()-carried (close to the
     pivot, safe); mid/tip are placed in WORLD space off that root (same reasoning as the legs
     above — a raw local offset run back through dive() at this z-distance from the pivot
     over-rotates and drove the tail tip below true ground, the r1 bug). ===== */
  {
    const root = dive(V(0, 0.46, -0.66));
    const mid = V(root.x, root.y - 0.10, root.z - 0.16);
    const tip = V(root.x + 0.08, root.y - 0.16, root.z - 0.28);
    tube(root, mid, 0.045, 0.030, 5, P.ironDk);
    tube(mid, tip, 0.028, 0.010, 5, P.iron, { capB: { hex: P.hornDk } });
  }

  /* base disc (Large: r=0.62) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.62, 0.62, 20);
    const r2 = ring(V(0, 0.05, 0), V(0, 1, 0), 0.60, 0.60, 20);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.053, 0), P.discTop);
  }
}
