/* dev/model-qa/creatures/rlm-suburb-gulthias-blight.js — the GULTHIAS BLIGHT landmark table
   (PLANT family, Gargantuan), CR 16, realm suburb, authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, suburb-w1 cell 9, port 5399). Core identity: the
   gulthias tree — the evil heart-tree, a root-system ideal that prunes any lawn that stands
   out. Realm apex (CR 16, Gargantuan) — the tallest, loudest thing in the suburb roster.

   FEATURE CHECKLIST (874 tris actual — under the 1,000-2,000 band; law 1: a creature fully
   captured under band passes, and every feature below reads clean at the actual count, so no
   padding was added just to climb toward the band):
     1. PLANT trunk — a twisted, leaning bark column (NOT a straight cylinder), root-crown
        flared at the base, narrowing and curving forward as it climbs — the trunk IS the
        spine for this creature (law-5/POSE-ANATOMY: a tree has no skeleton, so the trunk
        curve carries the gesture line the way a spine would on a humanoid).
     2. SIGNATURE (a) — the BARK FACE: two hollow recessed dark eye-sockets set into the
        upper trunk, and a vertical MOUTH-SPLIT gash below them with pale exposed heartwood
        inset (law 3's >=140 RGB high-value zone) mid-scream — the mouth is open wide, the
        gash widest at its center, not a thin idle seam.
     3. SIGNATURE (b) — BLOOD-RED SAP DROPS: small bright-red teardrop blobs hanging from the
        mouth-split and from three canopy claw-tips — the second law-3 high-value accent,
        saturated red against the bark-brown/void so it reads first at a squint.
     4. ROOT LEGS — six root-legs heaving out of the root-crown like a spider's; THREE planted
        and driving into the ground (the mid-step support), THREE torn free mid-stride, ending
        in jagged broken stumps with pale heartwood exposed at the break and a sap drop
        weeping from the tear — this is the "uproot" pose, not a rooted idle tree.
     5. CANOPY CLAWS — eight bare branches fork up and forward from the trunk crown, each
        forking again into 2-3 twig-claw tips, all raked forward in the same direction as the
        lunge (never a symmetric radial canopy) — the branches read as reaching claws, not
        foliage (this tree has no leaves; it is dead wood given a will).
     6. Bark value ladder — near-void dark bark on the trailing/shadowed flank climbing to a
        lit, knot-and-ridge-textured bark highlight on the leading (lunging) face, so the body
        mass clears law 3's 60-RGB-over-void floor independent of the face/sap signature zones.

   POSE SENTENCE: THE UPROOT — the whole tree lunges forward mid-stride, three root-legs still
   planted and driving hard into the earth while the other three have torn free and hang loose
   mid-swing (jagged broken ends, sap weeping from the tears), the trunk arched forward from a
   braced root-crown up through a scream-curved spine to a canopy of claw-branches raked hard
   forward and up as if reaching to seize whatever pruned its lawn, the bark face mid-scream
   (mouth-split gaping wide, eye-sockets hollow and dark) — never a planted, symmetric, rooted
   idle tree; always the half-second of the whole trunk hauling itself out of the ground.

   SPINE-GESTURE SENTENCE (per ANATOMY-CANON POSE-ANATOMY, adapted for PLANT/no-skeleton): the
   trunk axis IS the spine curve — it starts braced and slightly back at the root-crown (the
   "hips"), sweeps forward through the twisted lower trunk (the torque), and arches further
   forward still at the face/canopy-crown (the "skull"), one continuous forward-leaning C from
   root-crown to canopy so the lunge reads as a single gesture line, not a straight post with
   branches bolted on top; the canopy claws all rake in the SAME forward direction as the
   trunk's lean (no radial symmetry) so the gesture line survives the squint per law 5.

   Actual count note (law 1): the six independently-jointed root-legs (half broken, half
   planted), the eight forking canopy claw-branches, and the bark-face inset detail all read
   clean at 874 tris on angular (N=7, not smoothed) segment geometry — a Gargantuan apex whose
   silhouette and signature are fully captured comes in under the 1,000 floor honestly; no
   triangle was added past what the pose/silhouette/signature needed, per law 1's padding ban.

   Whole-object grammar: one function, one geometry frame, no anchors. Ground y=0. Imported by
   ps1-sheet.html (SETS['suburb-w1'], cell 9, fn buildGulthiasBlight). ~2.99u tall (r2 rescale
   from the r1 self-review — see below).

   R1 SELF-REVIEW (hostile, mandatory per the process): r1's bark ladder (52,42,32)/(31,23,16)/
   (23,17,10) sat well under law 3's 60-RGB-over-void floor — the whole trunk/root mass vanished
   into the checkered dark, only the canopy claw and a few red sap flecks survived the squint.
   The footprint (root spread + canopy reach) was also too wide/tall for its mass, leaving the
   figure small in the auto-framed camera versus sibling suburb captures. FIX: lightened the
   entire bark ladder (near-void flank now clears the floor on its own), brightened the sap
   glint ladder, and pulled in root-ground distances (~25%) and canopy claw lengths (~30%) so
   the same silhouette reads larger in frame. Re-baked (874 tris, bbox min.y 0.0038 — floor OK)
   and re-captured as r2; r2 reads as a leaning, clawed root-mass with visible red sap accents
   at a squint — signature intact, body mass no longer vanishing. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

function lerp3(a, b, t){ return a.clone().lerp(b, t); }
function add(a, b){ return V(a.x + b.x, a.y + b.y, a.z + b.z); }

export function buildGulthiasBlight(){
  /* ---------- PALETTE (suburb skin: this is a rot-in-the-cul-de-sac heart-tree — dead grey-
     brown bark, not living-forest green; pale sickly heartwood exposed at the wounds; blood-red
     sap as the sole saturated accent). ---------- */
  const P = {
    // R2 self-review: r1 bark sat at (52,42,32)/(31,23,16) — well under law 3's 60-RGB-over-void
    // floor, the whole trunk/root mass vanished into the checkered dark. Lightened the whole
    // ladder so the body clears the void on its own, independent of the face/sap accents.
    barkDk: 0x352a1e, bark: 0x5c4a34, barkLt: 0x836a47,    // near-void trailing flank -> lit leading flank
    barkHi: 0xa78957,                                        // knot/ridge highlight rim
    wood: 0xd8c9a0, woodHi: 0xefe4c4,                        // pale exposed heartwood (break/mouth interior)
    eyeVoid: 0x0a0806,                                       // hollow eye-socket dark
    sap: 0x8c0e15, sapHi: 0xd61b2b, sapGlint: 0xff5468,      // blood-red sap ladder, glint is the >=140 zone
    dirt: 0x2e2416,                                          // root-tip mud smear
  };

  const N = 7; // default segment ring count — bare-wood limbs are angular, not round-smooth

  /* ================= ROOT CROWN (the "hips" of the trunk-spine) ================= */
  const crown = V(0.05, 0.42, 0.10);
  stack([
    { y: 0.02, rx: 0.95, rz: 0.85, cx: 0.02, cz: 0.05, hex: P.barkDk },
    { y: 0.22, rx: 0.72, rz: 0.64, cx: 0.03, cz: 0.08, hex: P.bark },
    { y: crown.y, rx: 0.46, rz: 0.42, cx: crown.x, cz: crown.z, hex: P.barkLt },
  ], N, { capTop: { hex: P.barkLt, lift: 0.01 } });

  /* ================= ROOT LEGS — 3 planted, 3 torn free ================= */
  function plantedRoot(groundPt, kneeLift, kneeOut){
    const gp = V(groundPt.x, 0.045, groundPt.z); // ring on a tilted axis dips below its center y —
                                                    // lift the contact point so the dip stays >= -0.01
    const knee = add(lerp3(crown, gp, 0.5), V(kneeOut.x, kneeLift, kneeOut.z));
    tube(crown, knee, 0.20, 0.13, N, P.bark, {});
    tube(knee, gp, 0.13, 0.06, N, P.barkDk, { capB: { hex: P.dirt, lift: -0.01 } });
  }
  function tornRoot(dir, kneeLift, breakDist){
    const mid = add(crown, V(dir.x * breakDist * 0.55, kneeLift, dir.z * breakDist * 0.55));
    const brk = add(crown, V(dir.x * breakDist, kneeLift * 0.7, dir.z * breakDist));
    tube(crown, mid, 0.19, 0.12, N, P.bark, {});
    tube(mid, brk, 0.12, 0.07, N, P.barkDk, { capB: { hex: P.wood, lift: 0.0 } });
    // jagged broken-end shards + weeping sap
    const shardTip = add(brk, V(dir.x * 0.10, 0.09, dir.z * 0.10));
    tube(brk, shardTip, 0.06, 0.005, 5, P.wood, {});
    const sapTip = add(brk, V(-dir.z * 0.02, -0.16, dir.x * 0.02));
    tube(brk, sapTip, 0.035, 0.012, 5, P.sap, { capB: { hex: P.sapGlint, lift: -0.01 } });
  }
  // planted (front-left, front-right, back-right — bracing the forward lunge)
  plantedRoot(V(-0.56, 0.0, 0.82), 0.26, V(-0.14, 0, 0.10));
  plantedRoot(V(0.66, 0.0, 0.74), 0.24, V(0.13, 0, 0.08));
  plantedRoot(V(0.42, 0.0, -0.86), 0.20, V(0.08, 0, -0.11));
  // torn free (side-left, side-right, back-left — mid-swing)
  tornRoot(V(-1.0, 0, -0.15).normalize(), 0.46, 0.74);
  tornRoot(V(1.05, 0, -0.35).normalize(), 0.50, 0.70);
  tornRoot(V(-0.45, 0, -1.05).normalize(), 0.40, 0.66);

  /* ================= TRUNK — the spine-gesture curve, forward-lunging C ================= */
  const trunkBands = [
    { y: crown.y,  rx: 0.44, rz: 0.40, cx: 0.05,  cz: 0.10, hex: P.barkLt },
    { y: 0.75,     rx: 0.40, rz: 0.36, cx: 0.10,  cz: 0.22, hex: P.bark },
    { y: 1.10,     rx: 0.35, rz: 0.32, cx: 0.16,  cz: 0.38, hex: P.bark },
    { y: 1.45,     rx: 0.30, rz: 0.27, cx: 0.20,  cz: 0.56, hex: P.barkLt },
    { y: 1.75,     rx: 0.24, rz: 0.22, cx: 0.22,  cz: 0.74, hex: P.bark },
    { y: 2.02,     rx: 0.18, rz: 0.17, cx: 0.24,  cz: 0.92, hex: P.barkHi },
    { y: 2.22,     rx: 0.12, rz: 0.11, cx: 0.25,  cz: 1.06, hex: P.barkHi },
  ];
  stack(trunkBands, N + 1, { capBot: null });
  const crownTop = V(0.25, 2.22, 1.06);

  /* knot/ridge highlight studs up the LEADING (lit, +z-facing) flank — cheap constructed
     texture that keeps the body mass off the void per law 3 without smoothing/padding */
  for (let i = 0; i < 5; i++){
    const b = trunkBands[i + 1];
    const knot = V(b.cx + b.rx * 0.55, b.y + 0.05, b.cz + b.rz * 0.75);
    const knotB = add(knot, V(0.06, 0.10, 0.05));
    tube(knot, knotB, 0.05, 0.02, 5, P.barkHi, {});
  }

  /* ================= BARK FACE — mid-scream, mouth-split + hollow eyes ================= */
  // eyes: two recessed dark sockets on the upper-mid trunk leading face
  const eyeY = 1.62, eyeZBase = 0.63;
  for (const ex of [-0.145, 0.145]){
    const c = V(ex, eyeY, eyeZBase + Math.abs(ex) * 0.15);
    const a = add(c, V(-0.075, 0.055, 0));
    const b = add(c, V(0.075, 0.05, -0.01));
    const d = add(c, V(0.06, -0.06, -0.01));
    const e = add(c, V(-0.06, -0.055, 0));
    quad(a, b, d, e, P.eyeVoid, 0.04);
  }
  // mouth-split — a wide gaping vertical gash, widest at center, pale heartwood interior
  const mouthTop = V(0.06, 1.34, 0.72);
  const mouthMid = V(0.10, 1.14, 0.86);
  const mouthBot = V(0.08, 0.96, 0.70);
  const mL = [add(mouthTop, V(-0.05, 0, 0)), add(mouthMid, V(-0.14, 0, 0.02)), add(mouthBot, V(-0.05, 0, 0))];
  const mR = [add(mouthTop, V(0.05, 0, 0)), add(mouthMid, V(0.14, 0, 0.02)), add(mouthBot, V(0.05, 0, 0))];
  quad(mL[0], mR[0], mR[1], mL[1], P.eyeVoid, 0.05);
  quad(mL[1], mR[1], mR[2], mL[2], P.eyeVoid, 0.05);
  // pale heartwood strip set back inside the gash — law 3's headline high-value zone
  const wL = [add(mL[0], V(0.015, 0, -0.03)), add(mL[1], V(0.05, 0, -0.05)), add(mL[2], V(0.015, 0, -0.03))];
  const wR = [add(mR[0], V(-0.015, 0, -0.03)), add(mR[1], V(-0.05, 0, -0.05)), add(mR[2], V(-0.015, 0, -0.03))];
  quad(wL[0], wR[0], wR[1], wL[1], P.woodHi, 0.03);
  quad(wL[1], wR[1], wR[2], wL[2], P.wood, 0.04);
  // sap weeping from the mouth corner
  tube(add(mouthBot, V(0.06, 0, 0.0)), add(mouthBot, V(0.10, -0.28, -0.03)), 0.035, 0.01, 5, P.sap,
    { capB: { hex: P.sapGlint, lift: -0.01 } });

  /* ================= CANOPY CLAWS — 8 forking branches, all raked forward ================= */
  function clawBranch(baseDirX, baseDirY, len, twigSpread){
    const dir = V(baseDirX, baseDirY, 1).normalize();
    const mid = add(crownTop, V(dir.x * len * 0.5, dir.y * len * 0.5 + 0.06, dir.z * len * 0.5));
    const fork = add(crownTop, V(dir.x * len, dir.y * len, dir.z * len));
    tube(crownTop, mid, 0.075, 0.05, 6, P.bark, {});
    tube(mid, fork, 0.05, 0.028, 6, P.barkLt, {});
    // 2-3 twig claw-tips per fork
    const nTwig = twigSpread.length;
    for (let i = 0; i < nTwig; i++){
      const t = twigSpread[i];
      const tip = add(fork, V(dir.x * 0.30 + t.x, dir.y * 0.30 + t.y + 0.10, dir.z * 0.30 + t.z));
      tube(fork, tip, 0.028, 0.006, 4, P.barkHi, {});
    }
    return fork;
  }
  const tip1 = clawBranch(-0.55, 0.55, 0.44, [V(-0.09, 0.06, 0.02), V(0.02, 0.10, 0.05), V(-0.02, 0.02, 0.12)]);
  clawBranch(-0.20, 0.75, 0.50, [V(-0.06, 0.08, 0.08), V(0.06, 0.12, 0.05)]);
  const tip3 = clawBranch(0.10, 0.90, 0.55, [V(-0.05, 0.08, 0.10), V(0.08, 0.10, 0.08), V(0.02, 0.02, 0.14)]);
  clawBranch(0.40, 0.70, 0.48, [V(0.08, 0.06, 0.09), V(-0.03, 0.10, 0.05)]);
  clawBranch(0.65, 0.45, 0.42, [V(0.10, 0.05, 0.05), V(0.03, 0.09, 0.08)]);
  clawBranch(-0.75, 0.35, 0.38, [V(-0.10, 0.05, 0.03), V(-0.02, 0.09, 0.08)]);
  const tip7 = clawBranch(-0.35, 0.20, 0.34, [V(-0.08, 0.05, 0.08), V(0.03, 0.08, 0.10)]);
  clawBranch(0.85, 0.15, 0.30, [V(0.10, 0.03, 0.06), V(0.02, 0.08, 0.09)]);

  /* blood-red sap drops hanging from three canopy claw-tips — the second law-3 accent */
  for (const tip of [tip1, tip3, tip7]){
    const drop = add(tip, V(0, -0.14, 0.02));
    tube(tip, drop, 0.03, 0.008, 5, P.sap, { capB: { hex: P.sapGlint, lift: -0.008 } });
  }

  return { name: 'GULTHIAS BLIGHT' };
}
