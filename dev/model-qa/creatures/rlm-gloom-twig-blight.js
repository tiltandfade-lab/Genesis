/* dev/model-qa/creatures/rlm-gloom-twig-blight.js — the TWIG BLIGHT landmark table (PLANT-HUMANOID
   family, Small, CR 1/2, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (2026-07-08 foundry pilot, gloom-w2 cell 5). Core identity: an animated twig creature — a burnt-corn
   poppet stitched with a stranger's hair, animated by the pinned name. Bespoke to the render key
   "twig-blight"; garnish (bark/knot tones) pulled from the gloom needle-blight kit where compatible,
   the chassis a gloom realm reskins narratively.

   FEATURE CHECKLIST (the ~1,000-1,300 budget buys):
     1. PLANT-HUMANOID torso — a bundle of bound twigs in humanoid arrangement (not a smooth bark
        trunk like the needle-blight): a narrow lashed-twig ribcage/waist stack, straw-and-hair
        "poppet stuffing" tufts poking between the bindings.
     2. Stick limbs with VISIBLE KNOTS/JOINTS — each limb segment is a tapering twig tube with a
        harder knot-node ring at every joint (shoulder/elbow/wrist, hip/knee/ankle) so the joints
        read as tied-off knuckles, not a smooth stick.
     3. Splayed ROOT-TOES + twig-fan HANDS — each foot ends in 3 root-claw toes splaying out for
        grip; each hand ends in 4-5 thin twig fingers fanned wide (countable, per law 1).
     4. SIGNATURE — the pinned NAME-SCRAP on the chest: a pale rectangle of cloth/parchment pinned
        through the twig-ribcage with a dark twig-pin, sitting dead-center on the highest-contrast
        value in the model (law 3's high-value zone lands ON the signature).
     5. Straw poppet head — a rough straw-tuft ball skull with a stitched hair-knot crown (dark
        "hair of a stranger" tied at the top), two dark button-hole eyes, no mouth (the flavor:
        animated by the pinned name, not a face).
     6. A dragging back leg (bent, trailing, root-toes scraping) against the forward-planted lead
        leg — the asymmetric marionette-lurch stance.

   POSE SENTENCE: a marionette lurch — the lead leg planted forward under a torso pitched off-
   balance, the trailing leg dragging behind with its root-toes scraping the ground, both stick arms
   reaching straight out ahead at chest height with twig-fan fingers splayed, the straw head lolled
   to one side on a slack neck-twig — never standing at attention, always mid-stagger toward
   whatever the pinned name commands it to reach.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 5, fn buildTwigBlight). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

/* one twig limb segment: a tapering tube with a harder KNOT ring at the joint end (a short stubby
   bulge-tube right before the next segment) so every joint reads as a tied-off knuckle, per the
   feature checklist's "visible knots/joints" (law 1 — a countable joint, not a smooth stick). */
function twigSeg(a, b, ra, rb, hex, hexKnot){
  const axis = new THREE.Vector3().subVectors(b, a).normalize();
  const knotA = a.clone().addScaledVector(axis, ra * 1.6);
  tube(a, knotA, ra, ra * 1.25, 5, hexKnot); // knot bulge at the near joint
  tube(knotA, b, ra * 0.92, rb, 5, hex);
}

/* one twig-fan finger: two thin tapering segments, base -> knuckle knot -> point tip. */
function twigFinger(base, dir, len, hex, hexKnot){
  const dn = norm(dir);
  const knuckle = base.clone().addScaledVector(dn, len * 0.42);
  const tip = base.clone().addScaledVector(dn, len);
  tube(base, knuckle, 0.014, 0.011, 4, hexKnot);
  tube(knuckle, tip, 0.011, 0.004, 4, hex, { capB: { hex } });
}

/* one root-toe: a short splayed claw stub. */
function rootToe(base, dir, len, hex){
  const dn = norm(dir);
  const tip = base.clone().addScaledVector(dn, len);
  tube(base, tip, 0.016, 0.006, 4, hex, { capB: { hex } });
}

export function buildTwigBlight(){
  /* ---------- PALETTE (dry-twig browns + straw + one pale high-value name-scrap — law 3's
     signature zone lands on the pale rectangle, the single brightest thing in the model). ---------- */
  /* R1 CRITIC FIX (post r1 engine render): the whole body below the neck read as one dark blob
     nearly fused with the void/disc — law-3 failure (the original twig/knot/straw tones sat too
     close to the void's near-black). Every body tone lifted substantially so the limb/torso
     silhouette separates from the dark disc and the void behind it; the name-scrap pushed brighter
     still so it stays the single highest-value zone. */
  const P = {
    twig: 0x7a6644, twigDk: 0x50432a, twigLt: 0x93805a,   // dry bound twig-bundle body (lifted)
    knot: 0x3a2c18,                                        // hard knot-nodes at joints
    straw: 0xac9358, strawDk: 0x7c683a,                    // poppet-stuffing straw tufts / head
    hair: 0x362c20,                                        // stitched stranger's-hair crown
    scrap: 0xf2e8d0, scrapPin: 0x4a3a22,                    // the pale pinned name-scrap (signature)
    eye: 0x140f0a,
    disc: 0x342a1c, discTop: 0x453824,
  };

  /* ---------- LANDMARKS (Small; lurching stance — lead leg forward-planted, torso pitched over it,
     trailing leg dragging back). ---------- */
  const L = {
    ankleY: 0.06, kneeY: 0.24, hipY: 0.46,
    waistY: 0.55, ribY: 0.66, chestY: 0.76, shldY: 0.84, neckY: 0.895,
    headY: 0.93, crownY: 1.01,
    hipHalf: 0.075, shoulderX: 0.135,
  };
  /* forward pitch: the whole spine leans +z (toward the reach) as it rises */
  const spineCz = { waist: 0.00, rib: 0.03, chest: 0.06, shld: 0.10, neck: 0.13 };

  /* ===== LEGS — lead (front-planted, nearer-vertical) vs trailing (bent, dragging). ===== */
  {
    // lead leg: hip -> knee (slight forward knot) -> ankle -> planted foot, weight-bearing
    const hipL = V(-0.055, L.hipY, 0.01);
    const kneeL = V(-0.045, L.kneeY, 0.075);
    const ankleL = V(-0.038, L.ankleY, 0.055);
    twigSeg(hipL, kneeL, 0.036, 0.027, P.twig, P.knot);
    twigSeg(kneeL, ankleL, 0.026, 0.020, P.twigDk, P.knot);
    const footL = V(-0.036, 0.024, 0.075);
    for(const d of [[-0.6, -0.15, 0.7], [0.05, -0.18, 0.9], [0.6, -0.15, 0.65]])
      rootToe(footL, d, 0.050, P.twigDk);

    // trailing leg: hip -> knee (bent higher) -> ankle -> dragging foot, root-toes scraping behind
    const hipT = V(0.058, L.hipY, -0.02);
    const kneeT = V(0.075, L.kneeY - 0.03, -0.10);
    const ankleT = V(0.070, L.ankleY + 0.02, -0.155);
    twigSeg(hipT, kneeT, 0.034, 0.024, P.twig, P.knot);
    twigSeg(kneeT, ankleT, 0.023, 0.017, P.twigDk, P.knot);
    const footT = V(0.068, 0.032, -0.185);
    for(const d of [[-0.55, -0.12, -0.75], [0.0, -0.15, -0.95], [0.55, -0.12, -0.75]])
      rootToe(footT, d, 0.046, P.twigDk);
  }

  /* ===== TORSO+HEAD — ONE continuous stack, waist up through the straw skull, per the proven
     medusa/vampire-spawn idiom (a separately-rotated head component left a real seam in r1-r5's
     engine renders even with a fat overlapping bridge tube — folding it into the SAME stack call
     guarantees the ring-to-ring stitch closes every band, no gap possible). The "lolled to one
     side" read comes from cx drift on the head bands instead of a post-hoc rotation. */
  const headCx = 0.075, headCz = spineCz.neck + 0.02;
  const torso = stack([
    { y: L.waistY, rx: 0.075, rz: 0.062, cz: spineCz.waist, hex: P.twigDk },
    { y: L.ribY,   rx: 0.082, rz: 0.068, cz: spineCz.rib,   hex: P.twig },
    { y: L.chestY, rx: 0.088, rz: 0.072, cz: spineCz.chest, hex: P.twigLt },
    { y: L.shldY,  rx: 0.080, rz: 0.066, cz: spineCz.shld,  hex: P.twig },
    { y: L.neckY,  rx: 0.030, rz: 0.028, cz: spineCz.neck,  hex: P.twigDk },
    { y: L.headY,        rx: 0.052, rz: 0.048, cx: headCx * 0.4, cz: headCz,          hex: P.straw },
    { y: L.headY + 0.045, rx: 0.058, rz: 0.052, cx: headCx,       cz: headCz + 0.01,  hex: P.straw },
    { y: L.crownY,       rx: 0.040, rz: 0.036, cx: headCx * 1.15, cz: headCz - 0.005, hex: P.strawDk },
  ], 8, { capTop: { hex: P.hair, lift: 0.018 } });
  const headC = V(headCx, L.headY + 0.045, headCz + 0.01); // reference for hair-tuft + eyes below

  /* straw stuffing tufts poking between the bindings — cheap silhouette-breaking detail at the waist
     and ribs (the "poppet" read), thin quad slivers, jittered directions. */
  {
    const tuftSpots = [
      [ 0.065, L.waistY + 0.01, spineCz.waist + 0.03], [-0.06,  L.waistY + 0.02, spineCz.waist - 0.02],
      [ 0.07,  L.ribY,          spineCz.rib + 0.02],    [-0.065, L.ribY - 0.02,  spineCz.rib - 0.03],
    ];
    for(const [x, y, z] of tuftSpots){
      const base = V(x, y, z);
      const dir = norm([x * 1.5, 0.6, z * 0.5 + 0.3]);
      const tip = base.clone().addScaledVector(dir, 0.05);
      const perp = V(0.006, 0.006, 0);
      quad(base.clone().sub(perp), base.clone().add(perp), tip, tip, P.straw, 0.08);
    }
  }

  /* lashing bindings — three thin dark twig-cord rings wrapped around the torso stack, cheap
     "bound bundle" tell that separates this from the needle-blight's smooth bark trunk. */
  {
    for(const y of [L.waistY + 0.03, L.ribY + 0.02, L.chestY - 0.02]){
      const c = V(0, y, spineCz.waist + (y - L.waistY) * (spineCz.chest / (L.chestY - L.waistY)));
      const r1 = ring(c, V(0, 1, 0), 0.086, 0.070, 6, Math.PI / 6);
      const r2 = ring(V(c.x, c.y + 0.012, c.z), V(0, 1, 0), 0.082, 0.066, 6, Math.PI / 6);
      stitch([r1, r2], () => P.knot);
    }
  }

  /* ===== SIGNATURE — the pinned name-scrap: a pale rectangle pinned dead-center on the chest with
     a dark twig-pin driven through it. The single highest-value zone in the model (law 3). ===== */
  {
    const cz = spineCz.chest;
    const cx0 = 0.0, cy0 = L.chestY - 0.01;
    const w = 0.052, h = 0.066;
    const a = V(cx0 - w, cy0 + h, cz + 0.075);
    const b = V(cx0 + w, cy0 + h, cz + 0.075);
    const c = V(cx0 + w, cy0 - h, cz + 0.072);
    const d = V(cx0 - w, cy0 - h, cz + 0.072);
    quad(a, b, c, d, P.scrap, 0.04);
    quad(d, c, b, a, P.scrap, 0.04); // back face so it reads from a turnaround, not just front
    // the dark twig-pin driven through, crossing the scrap
    const pinA = V(cx0 - 0.03, cy0 + 0.03, cz + 0.06);
    const pinB = V(cx0 + 0.032, cy0 - 0.026, cz + 0.09);
    tube(pinA, pinB, 0.008, 0.006, 4, P.scrapPin);
  }

  /* ===== HEAD DETAIL — the straw skull itself is now part of the continuous torso stack above
     (R4 CRITIC FIX — see the stack's comment). Here: the stitched hair-knot crown tuft + two dark
     button-hole eyes, no mouth (the flavor: animated by the pinned name, not a face). The cx drift
     baked into the stack bands already gives the "lolled to one side" read. ===== */
  {
    // stitched hair-knot crown — a small dark tied tuft on top
    const crownTop = V(headCx * 1.15, L.crownY + 0.03, headCz - 0.005);
    blob(crownTop.x, crownTop.y, crownTop.z, 0.022, 0.028, 0.022, P.hair, 6, 3);

    // two dark button-hole eyes, no mouth
    const eyY = L.headY + 0.045 - 0.01, eyCz = headCz + 0.01 + 0.045;
    for(const s of [-1, 1]){
      const p = V(headCx + s * 0.022, eyY, eyCz);
      quad(V(p.x - 0.008, p.y + 0.006, p.z), V(p.x + 0.008, p.y + 0.006, p.z),
           V(p.x + 0.006, p.y - 0.006, p.z - 0.003), V(p.x - 0.006, p.y - 0.006, p.z - 0.003), P.eye, 0.02);
    }
  }

  /* ===== ARMS — both stick arms reaching straight out ahead at chest height, twig-fan hands
     splayed, per the pose sentence (never at rest). Slight asymmetry: right leads a touch further. */
  {
    const shR = V(L.shoulderX, L.shldY - 0.01, spineCz.shld + 0.01);
    const elR = V(0.22, L.shldY - 0.02, spineCz.shld + 0.16);
    const wrR = V(0.36, L.shldY - 0.03, spineCz.shld + 0.30);
    twigSeg(shR, elR, 0.029, 0.022, P.twig, P.knot);
    twigSeg(elR, wrR, 0.021, 0.015, P.twigDk, P.knot);
    for(const d of [[0.35, 0.35, 0.85], [0.10, 0.25, 1.0], [-0.15, 0.15, 0.95], [-0.40, 0.05, 0.80]])
      twigFinger(wrR, d, 0.075, P.twig, P.knot);

    const shL = V(-L.shoulderX, L.shldY - 0.01, spineCz.shld + 0.00);
    const elL = V(-0.21, L.shldY - 0.03, spineCz.shld + 0.14);
    const wrL = V(-0.33, L.shldY - 0.05, spineCz.shld + 0.26);
    twigSeg(shL, elL, 0.028, 0.021, P.twig, P.knot);
    twigSeg(elL, wrL, 0.020, 0.014, P.twigDk, P.knot);
    for(const d of [[-0.35, 0.30, 0.85], [-0.10, 0.20, 1.0], [0.15, 0.10, 0.95], [0.38, 0.0, 0.80]])
      twigFinger(wrL, d, 0.070, P.twig, P.knot);
  }

  /* base disc (Small: r=0.32) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.32, 0.32, 16);
    const r2 = ring(V(0, 0.050, 0), V(0, 1, 0), 0.305, 0.305, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.053, 0), P.discTop);
  }
}
