/* dev/model-qa/creatures/rlm-gloom-mummy.js — the MUMMY (realm gloom, Undead, CR 3, Medium),
   authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry pilot). Realm
   entry "Ashfall Mummy Curate" (data/realm-bestiary.js, gloom): a sect elder mummified alive as
   punishment, still shepherding a congregation that stopped listening centuries ago. Core identity
   = bandage-wrapped undead, HUMANOID family (PC-kit-grammar proportions, ANATOMY-CANON §HUMANOID —
   gaunt under the wrappings). Whole-object grammar: one function, one geometry frame, no anchors.
   Spine +z (front), up +y, ground y=0, base disc r=0.42 (Medium).

   FEATURE CHECKLIST (the ~1.3-1.5k budget buys):
     1. Gaunt HUMANOID torso/limb loft, banded in alternating pale/shadow wrap tones so the body
        itself reads "wound in cloth" even before the strap geometry lands (no smooth mannequin).
     2. Countable diagonal wrap-straps — 4 distinct cross-body bandage bands (chest X-cross + a
        waist band) laid OVER the torso loft as separate tube geometry, plus ring-strap bands
        around each upper arm/thigh/shin — each one a countable strip, not a texture (law 1).
     3. Wrapped skull — a pale head loft with two sunken DARK eye pits (hollow, no glow — a
        mummy's curse is old and cold, not a ghost's spark) and one dark vertical gap at the
        mouth where the linen has pulled loose mid-word — the high-value pale wrap against the
        dark gaps is the law-3 payload. Head is CANTED off-axis (the sermon head-tilt, not level).
     4. SIGNATURE — one arm thrown straight overhead, wrist snapped back, fingers splayed stiff
        in a preaching/blessing gesture — the loud silhouette break named in the pose sentence.
     5. Loose trailing bandage streamers — 5 unraveling strip-ends dragging off the raised wrist,
        the torso hem, and one ankle, tapering to worn points (echoes the specter tatter grammar,
        distinct palette so it reads as its own feature, not torso continuation).
     6. Weight-shifted stance — forward leg planted and turned out, trailing leg bent and rolled
        onto its toe — a body caught leaning into its own gesture, not standing at attention.

   POSE SENTENCE: an elder mummy caught mid-sermon, one bandage-wrapped arm thrown straight
   overhead with its stiff fingers splayed in a blessing no one is left to receive, head canted
   back and to the side as if mid-word, weight rocked forward onto its planted leg while its
   unraveling wrappings drag loose off the raised wrist and hem — preaching to an empty room,
   never at attention. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

/* one wrap-strap: a tapering tube from A to B, mid-value between the pale/shadow torso tones so
   it reads as an overlaid strip without swallowing the body loft under it. */
function wrapStrap(a, b, r0, r1, hex){
  tube(a, b, r0, r1, 5, hex);
}

/* one ring-strap: a flat double-ring band hugging a limb at height y, radius rx/rz — a cheap
   countable "wrapped here" tell on an otherwise plain limb tube. */
function ringStrap(cx, y, cz, rx, rz, hex){
  const r1 = ring(V(cx, y - 0.018, cz), V(0, 1, 0), rx, rz, 7);
  const r2 = ring(V(cx, y + 0.018, cz), V(0, 1, 0), rx * 0.98, rz * 0.98, 7);
  stitch([r1, r2], () => hex);
}

/* one stiff mummified finger: two blocky segments (wrapped, not clawed) tapering to a worn tip. */
function wrapFinger(base, dir, len, pale, tip){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0] / n, dy = dir[1] / n, dz = dir[2] / n;
  const mid = V(base.x + dx * len * 0.55, base.y + dy * len * 0.55, base.z + dz * len * 0.55);
  const end = V(base.x + dx * len, base.y + dy * len, base.z + dz * len);
  tube(base, mid, 0.020, 0.015, 4, pale);
  tube(mid, end, 0.015, 0.008, 4, tip, { capB: { hex: tip } });
}

/* one loose trailing streamer: 3 tapering segments with a slight twist, worn/dark tip. */
function streamer(root, dir, len, twist, hexA, hexB){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0] / n, dy = dir[1] / n, dz = dir[2] / n;
  const p0 = V(root.x, root.y, root.z);
  const p1 = V(p0.x + dx * len * 0.32,             p0.y + dy * len * 0.32,             p0.z + dz * len * 0.32);
  const p2 = V(p0.x + dx * len * 0.68 + twist,      p0.y + dy * len * 0.68,             p0.z + dz * len * 0.68 - twist * 0.4);
  const p3 = V(p0.x + dx * len       + twist * 1.7, p0.y + dy * len,                    p0.z + dz * len       - twist * 0.7);
  tube(p0, p1, 0.058, 0.046, 6, hexA);
  tube(p1, p2, 0.046, 0.038, 6, hexA);
  tube(p2, p3, 0.038, 0.030, 6, hexB, { capB: { hex: hexB } });
}

export function buildMummy(){
  /* ---------- PALETTE (dust-pale wrap against dark gaps; VS desaturated) ---------- */
  const P = {
    wrap:0xc7bb96, wrapLt:0xdccfa8, wrapDk:0x968a68, wrapSh:0x6d634a,   // torso/limb wrap tones — the high-value pale zone
    strap:0xb0a37c, strapDk:0x7f7355,                                    // the countable cross-body straps
    gap:0x201b14, gapDk:0x120f0a,                                        // eye pits, mouth void, wrap-gap shadows
    flesh:0x53442d, fleshDk:0x362a1a,                                    // dried skin glimpsed at wrist/ankle
    streamerA:0xb7ab88, streamerB:0x847a5c,                              // trailing loose ends — distinct from torso
    disc:0x3a3020, discTop:0x483c26,
    wrapHi:0xefe3bc,                                                     // P2 CRITIC FIX: the brightest tone in the palette,
                                                                          // reserved for the raised blessing hand only (law 3).
  };

  /* ---------- LANDMARKS (standing, weight rocked forward; head canted for the sermon tilt) ---------- */
  const L = {
    ankleY:0.075, kneeY:0.34, hipY:0.70, waistY:0.82, ribY:0.94, chestY:1.05, shldY:1.15, neckY:1.205,
    jawY:1.235, cheekY:1.295, browY:1.355, crownY:1.415,
    shoulderX:0.185, hipHalf:0.105,
  };

  /* ---------- torso: banded pale/shadow wrap tones (gaunt HUMANOID loft, ANATOMY-CANON) ---------- */
  const torsoRings = stack([
    { y:L.hipY,   rx:0.128, rz:0.098, cz:-0.005, hex:P.wrapDk },
    { y:L.waistY, rx:0.118, rz:0.090, cz:0.005,  hex:P.wrap },
    { y:L.ribY,   rx:0.150, rz:0.112, cz:0.020,  hex:P.wrapDk },
    { y:L.chestY, rx:0.170, rz:0.128, cz:0.035,  hex:P.wrapLt },
    { y:L.shldY,  rx:0.178, rz:0.120, cz:0.045,  hex:P.wrap },
    { y:L.neckY,  rx:0.066, rz:0.062, cz:0.050,  hex:P.wrapSh },
  ], 9, { capBot:{ hex:P.wrapSh, lift:0.02 } });

  /* ---------- countable cross-body wrap-straps: chest X-cross + one waist band ---------- */
  {
    const shL = V(-L.shoulderX * 0.9, L.shldY - 0.02, 0.10);
    const shR = V( L.shoulderX * 0.9, L.shldY - 0.02, 0.10);
    const hipL = V(-0.095, L.hipY + 0.03, 0.08);
    const hipR = V( 0.095, L.hipY + 0.03, 0.08);
    wrapStrap(shL, hipR, 0.038, 0.030, P.strap);
    wrapStrap(shR, hipL, 0.036, 0.028, P.strapDk);
    /* waist band — a full ring-strap around the narrow waist */
    ringStrap(0.005, L.waistY, 0.02, 0.122, 0.094, P.strap);
  }

  /* ---------- wrapped skull — CANTED back-and-to-side (sermon tilt), pale w/ dark eye pits ---------- */
  const tilt = { dx:0.044, dz:-0.028 };   // per-band lateral/back drift = the head cant
  const headRings = stack([
    { y:L.jawY,   rx:0.076, rz:0.080, cx:tilt.dx*0.35, cz:0.052 + tilt.dz*0.35, hex:P.wrap },
    { y:L.cheekY, rx:0.096, rz:0.100, cx:tilt.dx*0.65, cz:0.040 + tilt.dz*0.65, hex:P.wrapLt },
    { y:L.browY,  rx:0.088, rz:0.088, cx:tilt.dx*0.85, cz:0.020 + tilt.dz*0.85, hex:P.wrap },
    { y:L.crownY, rx:0.070, rz:0.066, cx:tilt.dx,       cz:-0.010 + tilt.dz,     hex:P.wrapDk },
  ], 8, { capTop:{ hex:P.wrapSh, lift:0.02 } });

  /* sunken eye pits — dark hollows, no glow (a mummy's curse is old and cold) */
  {
    const ey = L.cheekY + 0.006, ez = 0.118 + tilt.dz * 0.62;
    for(const s of [-1, 1]){
      blob(s * 0.034 + tilt.dx * 0.62, ey, ez, 0.024, 0.020, 0.018, P.gap, 6, 4);
      blob(s * 0.034 + tilt.dx * 0.62, ey, ez + 0.010, 0.010, 0.009, 0.008, P.gapDk, 4, 2);
    }
  }
  /* mouth gap — the linen pulled loose mid-word, a dark vertical void */
  quad(
    V(-0.020 + tilt.dx*0.4, L.jawY + 0.028, 0.128 + tilt.dz*0.4),
    V( 0.020 + tilt.dx*0.4, L.jawY + 0.028, 0.128 + tilt.dz*0.4),
    V( 0.015 + tilt.dx*0.4, L.jawY - 0.024, 0.118 + tilt.dz*0.4),
    V(-0.015 + tilt.dx*0.4, L.jawY - 0.024, 0.118 + tilt.dz*0.4),
    P.gap, 0.02
  );
  /* a torn wrap flap hanging off the jaw where the linen came loose — small silhouette break */
  quad(
    V(-0.028 + tilt.dx*0.4, L.jawY + 0.010, 0.130 + tilt.dz*0.4),
    V( 0.006 + tilt.dx*0.4, L.jawY + 0.006, 0.132 + tilt.dz*0.4),
    V( 0.010 + tilt.dx*0.4, L.jawY - 0.058, 0.112 + tilt.dz*0.4),
    V(-0.022 + tilt.dx*0.4, L.jawY - 0.050, 0.110 + tilt.dz*0.4),
    P.wrapSh, 0.05
  );

  /* ---------- SIGNATURE — one arm thrown straight overhead, preaching; the other lower, bent ---------- */
  let wristRaised;
  {
    /* RIGHT — raised: shoulder up-and-out, elbow high, wrist snapped back overhead, fingers splayed */
    const shR = V(L.shoulderX, L.shldY - 0.01, 0.06);
    const elR = V(0.235, 1.42, -0.02);
    const wrR = V(0.175, 1.665, 0.075);
    wristRaised = wrR;
    ringStrap(shR.x*0.6, L.shldY + 0.06, shR.z, 0.058, 0.052, P.strap);
    tube(shR, elR, 0.052, 0.040, 6, P.wrap);
    ringStrap((shR.x+elR.x)/2, (shR.y+elR.y)/2, (shR.z+elR.z)/2, 0.044, 0.040, P.strapDk);
    tube(elR, wrR, 0.038, 0.026, 6, P.wrapDk);
    blob(wrR.x, wrR.y, wrR.z, 0.032, 0.028, 0.030, P.flesh, 6, 4);
    /* P2 CRITIC FIX: R2's fan direction vectors were still Y-dominant (0.55-1.00), continuing the
       forearm's own up-screen trajectory (dimetric cam, yaw45/el30: screen-up ~= 0.87*Y-0.35*(X+Z))
       — so on the actual engine capture the 4 tubes read as ONE unbroken diagonal blade/spear
       extending the arm, not a splayed hand (law-2 fail, squint-test confirmed: reads as a warrior
       holding a weapon overhead). The pose sentence calls for the wrist SNAPPED BACK — bend the
       hand's plane away from the arm's vertical axis instead of continuing it: Y cut to 0.30-0.55,
       X/Z spread widened so each digit displaces distinctly in screen-right AND screen-up, opening
       real void gaps between them. Also promoted to P.wrapHi (the palette's single brightest tone)
       so the signature carries its own high-value zone instead of sharing the forearm's mid-tone. */
    const fanR = [
      { d:[-0.88,0.34,0.10], len:0.115, off:[-0.020,0.004,0.012] },
      { d:[-0.32,0.55,-0.34], len:0.150, off:[-0.006,0.012,-0.006] },
      { d:[0.26,0.48,-0.56], len:0.130, off:[0.008,0.010,-0.014] },
      { d:[0.80,0.30,-0.22], len:0.100, off:[0.020,0.002,-0.018] },
    ];
    for(const f of fanR){
      const base = V(wrR.x + f.off[0], wrR.y + f.off[1], wrR.z + f.off[2]);
      wrapFinger(base, f.d, f.len, P.wrapHi, P.fleshDk);
    }

    /* LEFT — lower, bent toward the chest, a quieter gesture (the mid-lunge asymmetry, law 5) */
    const shL = V(-L.shoulderX, L.shldY - 0.01, 0.06);
    const elL = V(-0.260, 0.965, 0.145);
    const wrL = V(-0.130, 1.055, 0.330);
    ringStrap(shL.x*0.6, L.shldY + 0.06, shL.z, 0.058, 0.052, P.strap);
    tube(shL, elL, 0.052, 0.040, 6, P.wrap);
    ringStrap((shL.x+elL.x)/2, (shL.y+elL.y)/2, (shL.z+elL.z)/2, 0.044, 0.040, P.strapDk);
    tube(elL, wrL, 0.038, 0.026, 6, P.wrapDk);
    blob(wrL.x, wrL.y, wrL.z, 0.030, 0.026, 0.028, P.flesh, 6, 4);
    const fanL = [[-0.30,0.35,0.90],[0.05,0.45,0.95],[0.35,0.30,0.85]];
    for(const d of fanL) wrapFinger(wrL, d, 0.105, P.wrap, P.fleshDk);
  }

  /* ---------- legs — weight rocked forward onto the planted leg, trailing leg rolled onto its toe ---------- */
  {
    /* RIGHT — forward, planted, turned slightly out (weight-bearing) */
    const hipR = V(L.hipHalf, L.hipY - 0.02, 0.0), kneeR = V(0.155, L.kneeY, 0.155), ankR = V(0.140, L.ankleY, 0.245);
    tube(hipR, kneeR, 0.062, 0.050, 6, P.wrap);
    ringStrap((hipR.x+kneeR.x)/2, (hipR.y+kneeR.y)/2, (hipR.z+kneeR.z)/2, 0.056, 0.050, P.strap);
    tube(kneeR, ankR, 0.046, 0.036, 6, P.wrapDk);
    ringStrap((kneeR.x+ankR.x)/2, (kneeR.y+ankR.y)/2, (kneeR.z+ankR.z)/2, 0.040, 0.036, P.strapDk);
    blob(ankR.x, 0.045, ankR.z + 0.05, 0.040, 0.026, 0.075, P.wrapSh, 6, 4);

    /* LEFT — trailing, bent, heel lifted (rolled onto the toe — mid-sermon rock, not a stiff stance) */
    const hipL = V(-L.hipHalf, L.hipY - 0.02, 0.0), kneeL = V(-0.145, 0.36, -0.135), ankL = V(-0.110, 0.115, -0.230);
    tube(hipL, kneeL, 0.062, 0.050, 6, P.wrap);
    ringStrap((hipL.x+kneeL.x)/2, (hipL.y+kneeL.y)/2, (hipL.z+kneeL.z)/2, 0.056, 0.050, P.strapDk);
    tube(kneeL, ankL, 0.046, 0.036, 6, P.wrapDk);
    ringStrap((kneeL.x+ankL.x)/2, (kneeL.y+ankL.y)/2, (kneeL.z+ankL.z)/2, 0.040, 0.036, P.strap);
    blob(ankL.x, 0.145, ankL.z - 0.03, 0.038, 0.024, 0.070, P.wrapSh, 6, 4);
  }

  /* ---------- SIGNATURE — loose trailing bandage streamers: raised wrist, hem, one ankle ---------- */
  {
    /* R2 CRITIC FIX: r1's streamers tucked in tight along the body/arm and vanished into the
       torso's own value range — pulled them OUT into open void space (wider lateral swing,
       longer) per the specter convention, so they clear the silhouette and actually read. */
    streamer(V(wristRaised.x + 0.02, wristRaised.y - 0.03, wristRaised.z - 0.01), [0.80, -0.55, -0.20], 0.42, 0.05, P.streamerA, P.streamerB);
    const hem = torsoRings[0];
    const order = hem.map((p, i) => i).sort((a, b) => hem[a].z - hem[b].z);
    const hemPicks = [order[0], order[Math.floor(hem.length/2)]];
    hemPicks.forEach((idx, k) => {
      const root = hem[idx];
      const dir = [root.x * 2.2 + (k ? 0.5 : -0.5), -0.80, -0.30 - 0.20*k];
      streamer(root, dir, 0.30 + 0.08*k, k ? -0.03 : 0.035, P.streamerA, P.streamerB);
    });
    streamer(V(-0.110, 0.115, -0.230), [-0.55, -0.45, -0.75], 0.26, -0.02, P.streamerB, P.streamerA);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.058, 0), P.discTop);
  }
}
