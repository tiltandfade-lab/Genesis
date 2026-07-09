/* dev/model-qa/creatures/rlm-shared-haunting-revenant.js — HAUNTING REVENANT landmark table
   (HUMANOID family, Large, CR 10, CROSS-REALM shared body), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, catchall-w1 cell 9). Bestiary
   frame: the duel-killed revenant returning every noon / the bell-tower toller / the
   generational wreck-riser — CORE IDENTITY = the implacable returned dead: bigger than a ghost,
   tattered, dragging its death with it. Cross-realm shared body: authored to the neutral core
   identity only, no single realm's palette gimmicks (realm reskins ride this chassis).

   FEATURE CHECKLIST (the ~1,400-1,800 budget buys):
     1. HUMANOID Large half-corporeal anatomy — a solid, believable torso/shoulders/arms carried
        on real joints, but BELOW the knee the legs dissolve into ragged trailing streamers (the
        rlm-gloom-specter.js "torn hem, not a skirt" trick, applied to the legs rather than the
        whole lower torso — this one still has a torso-and-legs read, just an unraveling one).
     2. SIGNATURE — the dragged chain: a length of pale-linked iron chain gripped in the trailing
        (rear) fist and dragged taut behind it, sagging under its own weight before rising off the
        ground into the grip — the loudest high-value zone in the model (law 3), the one prop
        that reads "revenant" in silhouette alone.
     3. Gaunt hollow-eyed skull-face — sunken cheeks, one small cold glow pinprick in each
        socket, a grim downward glare (implacable, not startled — never a scream).
     4. Reaching lead arm (open clawed hand) balanced by the trailing dragging arm (fisted around
        the chain) — asymmetric mid-stride, never a symmetric zombie shamble.
     5. Tattered grave-cloth remnants — torn shroud strips hanging off the shoulders, breaking
        the torso silhouette and reinforcing the "returned dead, still in its burial rags" read.
     6. Costume breaks: a pale duel-scar death-wound gash across the chest, exposed ribs showing
        pale through one torn flank, elongated skeletal clawed fingers on both hands.

   POSE SENTENCE: the arrival — mid-stride out of nothing, the trailing arm hauled back taut on
   the dragged chain while the lead arm reaches forward with open clawed fingers, the torso
   driving into the reach as the head drops low and glares up through hollow sockets, the legs
   already dissolving to streamers below the knee as if the stride itself is unraveling it back
   into the space it came from — never an at-attention haunt, always the exact instant it steps
   through.

   SPINE-GESTURE SENTENCE: the spine runs from a hip band twisted toward the trailing (chain) arm,
   up through a forward-driving lean to a shoulder band that opens toward the reaching lead arm,
   then the neck continues past level and DROPS the head down and forward, chin low, eyes glaring
   up from under the brow — hips-to-skull traces a driving forward C-curve (twist at the hip,
   lean at the chest, drop at the head), the reaching arm's shoulder riding up while the trailing
   arm's shoulder is pulled back and down by the chain's weight (counterpose, law 4).

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. The dragged chain's trailing end and the leg streamer tips are the only geometry
   that reaches near the ground; the disc base sits at y=0 so bbox min.y lands in-band without a
   separate hover/shadow pool (this is a mid-stride ground haunt, not a levitator). Imported by
   ps1-sheet.html (SETS['catchall-w1'], cell 9, fn buildHauntingRevenant). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack, blob } from '../probe-lib.js';

/* one flattened oval chain-link: a single quad billboarded across dir, alternating "flat" /
   "edge-on" width so a short run reads as interlocked links (cheap — 1 quad/link) with the pale
   chain color carrying the law-3 high-value ladder down the drag. */
function chainLink(c, dir, len, w, hex, edgeOn){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0] / n, dy = dir[1] / n, dz = dir[2] / n;
  const ax = new THREE.Vector3(dx, dy, dz);
  let perp = new THREE.Vector3().crossVectors(ax, edgeOn ? V(0, 0, 1) : V(0, 1, 0));
  if(perp.lengthSq() < 1e-6) perp = new THREE.Vector3().crossVectors(ax, V(1, 0, 0));
  perp.normalize().multiplyScalar(w);
  const half = len / 2;
  const a = V(c.x - dx * half, c.y - dy * half, c.z - dz * half);
  const b = V(c.x + dx * half, c.y + dy * half, c.z + dz * half);
  quad(V(a.x - perp.x, a.y - perp.y, a.z - perp.z), V(a.x + perp.x, a.y + perp.y, a.z + perp.z),
    V(b.x + perp.x, b.y + perp.y, b.z + perp.z), V(b.x - perp.x, b.y - perp.y, b.z - perp.z), hex, 0.02);
}

/* a hollow eye socket + one cold glow pinprick (rlm-gloom-specter.js hollowEye technique). */
function hollowEye(cx, cy, cz, r, dir, socket, glow){
  blob(cx, cy, cz, r, r, r * 0.82, socket, 6, 4);
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0] / n, dy = dir[1] / n, dz = dir[2] / n;
  blob(cx + dx * r * 0.5, cy + dy * r * 0.5, cz + dz * r * 0.5, r * 0.24, r * 0.24, r * 0.24, glow, 4, 2);
}

/* one clawed skeletal finger: two tapering segments, pale into a dark claw tip. */
function finger(base, dir, len, pale, claw){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0] / n, dy = dir[1] / n, dz = dir[2] / n;
  const mid = V(base.x + dx * len * 0.55, base.y + dy * len * 0.55, base.z + dz * len * 0.55);
  const tip = V(base.x + dx * len, base.y + dy * len, base.z + dz * len);
  tube(base, mid, 0.024, 0.018, 5, pale, {});
  tube(mid, tip, 0.018, 0.006, 5, claw, {});
}

export function buildHauntingRevenant(){
  /* ---------- PALETTE — neutral cross-realm dead-flesh grey, pale bone/chain (the law-3
     high-value payload), dark rag remnants. No single-realm palette gimmicks. ---------- */
  const P = {
    skin: 0x7c7a72, skinDk: 0x585650, skinLt: 0x96948a,
    bone: 0xd8d0bc, boneDk: 0xa89e84,
    rag: 0x4a4740, ragDk: 0x322f2a, ragLt: 0x605c52,
    chain: 0xe8e0c8, chainDk: 0x968c70,
    eyeSocket: 0x120f0c, eyeGlow: 0x9ad8c8,
    wound: 0xb8b0a0, mouth: 0x0e0c0a,
    disc: 0x2a2724, discTop: 0x36322c,
  };

  /* ===== SPINE — forward-driving C-curve: hip twists back toward the trailing chain arm, chest
     leans into the reach, head drops+glares. Scaled ~1.35x a Medium chassis for Large. ===== */
  const L = {
    hipY: 0.56, waistY: 0.74, ribY: 0.92, chestY: 1.10, shldY: 1.26, neckY: 1.35,
    jawY: 1.42, browY: 1.50, crownY: 1.56,
  };
  const HIP_ANG = -0.22, SHLD_ANG = 0.30;            // hip twists back(-), shoulders open toward the reach(+)
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }
  function twist(p){
    const t = Math.min(1, Math.max(0, (p.y - L.hipY) / (L.shldY - L.hipY)));
    const ang = HIP_ANG + t * (SHLD_ANG - HIP_ANG);
    const lean = t * 0.09;                           // forward chest lean climbing the spine
    const q = rotY(p, ang);
    return V(q.x, q.y, q.z + lean);
  }
  const HEAD_DROP_ANG = -0.34;                        // head pitches down+forward off the neck anchor
  const NECK_ANCHOR = twist(V(0, L.neckY, 0));         // continuity point: head hangs off the actual neck-top
  function headXf(p){
    const tw = twist(p);                               // same twist+lean as the shoulder band (t clamps to 1 above shldY)
    const cy = Math.cos(HEAD_DROP_ANG), sy = Math.sin(HEAD_DROP_ANG);
    const relY = tw.y - NECK_ANCHOR.y, relZ = tw.z - NECK_ANCHOR.z;
    const py = NECK_ANCHOR.y + relY * cy - relZ * sy;
    const pz = NECK_ANCHOR.z + relY * sy + relZ * cy;
    return V(tw.x, py, pz);
  }

  /* ===== BASE DISC — ground contact plane; chain tail + streamer tips are the only elements
     that reach it, so bbox min.y sits at the disc top without a hover-shadow pool. ===== */
  {
    const rim = ring(V(0, 0.006, 0), V(0, 1, 0), 0.30, 0.27, 10);
    const top = ring(V(0, 0.014, 0), V(0, 1, 0), 0.27, 0.24, 10);
    stitch([rim, top], () => P.disc);
    capFan(top, V(0, 0.014, 0), P.discTop);
  }

  /* ===== DISSOLVING LEGS — solid down to the knee, then unravel into 5 ragged trailing
     streamer-tendrils per leg (specter-hem trick applied to legs, not the whole lower torso),
     the trailing (rear) leg's streamers dragging further back to sell the unraveling stride. ===== */
  function dissolvingLeg(hipX, hipZ, knee, dragBack){
    const hip = twist(V(hipX, L.hipY, hipZ));
    tube(hip, knee, 0.100, 0.078, 8, P.rag, { capA: { hex: P.ragDk } });
    const shinEnd = V(knee.x + (hipX < 0 ? -0.01 : 0.01), knee.y - 0.09, knee.z + dragBack * 0.3);
    tube(knee, shinEnd, 0.078, 0.058, 7, P.ragDk, {});
    const n = 5;
    for(let i = 0; i < n; i++){
      const t = i / (n - 1);
      const spread = (t - 0.5) * 0.11;
      const len = 0.16 + (1 - Math.abs(t - 0.5) * 2) * 0.10;   // center streamers longest
      const root = V(shinEnd.x + spread * 0.6, shinEnd.y, shinEnd.z + spread * 0.4);
      const tip = V(root.x + spread * 1.4, Math.max(0.006, root.y - len), root.z + dragBack - spread * 0.5);
      tube(root, tip, 0.032, 0.007, 5, i % 2 === 0 ? P.ragLt : P.rag, { capB: { hex: P.bone, lift: 0.004 } });
    }
  }
  dissolvingLeg(-0.075, -0.02, V(-0.115, 0.30, -0.10), -0.10);   // trailing leg, drags back further
  dissolvingLeg(0.085, 0.05, V(0.150, 0.30, 0.135), 0.03);       // lead leg, striding forward

  /* ===== TORSO — believable solid anatomy carried on the twist; the wound gouge and rib patch
     are law-3/law-4 costume reads sitting ON the anatomy, not replacing it. ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.190, rz: 0.168, hex: P.ragDk },
    { y: L.waistY, rx: 0.205, rz: 0.178, hex: P.skinDk },
    { y: L.ribY,   rx: 0.222, rz: 0.188, hex: P.skin },
    { y: L.chestY, rx: 0.238, rz: 0.182, hex: P.skinDk },
    { y: L.shldY,  rx: 0.256, rz: 0.176, hex: P.skin },
    { y: L.neckY,  rx: 0.092, rz: 0.086, hex: P.skinDk },
  ];
  stack(torsoBands, 10, { xform: twist });

  /* duel-scar death wound — a pale bone-deep diagonal gash across the chest, the "how it died"
     tell, high-value against the dark skin fill. */
  {
    const a = twist(V(-0.10, L.chestY + 0.07, 0.175));
    const b = twist(V(0.09, L.ribY - 0.05, 0.165));
    tube(a, b, 0.026, 0.020, 5, P.wound, {});
  }

  /* exposed rib patch on the trailing flank — two pale bone arcs poking through torn skin, the
     skeletal-humanoid tell that keeps the "dead" read even under whole flesh. */
  {
    for(const dy of [-0.05, 0.03]){
      const l = twist(V(-0.235, L.ribY + 0.02 + dy, 0.02));
      const r = twist(V(-0.155, L.ribY + 0.04 + dy, 0.11));
      tube(l, r, 0.022, 0.022, 4, P.bone, {});
    }
  }

  /* tattered grave-cloth remnants — torn shroud strips off both shoulders, trailing down toward
     the dissolving legs; asymmetric lengths (chain-side shoulder hangs longer), the second
     silhouette-breaking costume layer. */
  for(const s of [-1, 1]){
    const top = twist(V(s * 0.24, L.shldY + 0.02, -0.04));
    const n = 3;
    for(let i = 0; i < n; i++){
      const t = i / (n - 1) - 0.5;
      const rootA = V(top.x + t * 0.04, top.y, top.z + t * 0.02);
      const len = 0.30 + (s < 0 ? 0.10 : 0);
      const tip = V(rootA.x + s * 0.03 * (1 + t), Math.max(0.01, rootA.y - len), rootA.z - 0.06 - t * 0.05);
      tube(rootA, tip, 0.034, 0.008, 5, i % 2 === 0 ? P.rag : P.ragLt, {});
    }
  }

  /* ===== ARMS — asymmetric: lead arm reaches forward-and-out with an open clawed hand;
     trailing arm hauls back taut, fist wrapped on the dragged chain, shoulder pulled down/back
     by the chain's weight (counterpose). Both bend at real elbows (100-150deg). ===== */
  let wrT;
  {
    // LEAD arm — reaches forward-and-out, open clawed hand
    const shL = twist(V(0.235, L.shldY - 0.01, 0.02));
    const elL = V(0.360, L.chestY - 0.10, 0.255);
    const wrL = V(0.415, L.ribY - 0.08, 0.400);
    tube(shL, elL, 0.076, 0.062, 8, P.skin, { capA: { hex: P.skinDk } });
    tube(elL, wrL, 0.058, 0.040, 8, P.bone, { capB: { hex: P.bone, lift: 0.01 } });
    const palmDir = [wrL.x - elL.x, wrL.y - elL.y, wrL.z - elL.z];
    const spread = [[-0.02, 0.01, 0], [0, 0.015, 0.01], [0.02, 0.01, 0.005], [0.035, -0.005, -0.005]];
    for(const [dx, dy, dz] of spread){
      finger(V(wrL.x + dx * 0.4, wrL.y + dy * 0.4, wrL.z + dz * 0.4),
        [palmDir[0] + dx * 2, palmDir[1] + dy * 2, palmDir[2] + dz * 2], 0.10, P.bone, P.boneDk);
    }

    // TRAILING arm — hauled back taut, fist wrapped on the chain, shoulder pulled back+down
    const shT = twist(V(-0.245, L.shldY - 0.03, -0.01));
    const elT = V(-0.335, L.waistY + 0.02, -0.155);
    wrT = V(-0.355, L.hipY - 0.06, -0.235);
    tube(shT, elT, 0.078, 0.062, 8, P.skin, { capA: { hex: P.skinDk } });
    tube(elT, wrT, 0.062, 0.046, 8, P.skinDk, { capB: { hex: P.skinDk, lift: 0.006 } });
    // fisted knuckle mass wrapped around the chain grip
    blob(wrT.x - 0.01, wrT.y - 0.01, wrT.z - 0.02, 0.052, 0.044, 0.05, P.skinDk, 6, 4);
  }

  /* ===== SIGNATURE — the dragged chain: from the trailing fist, sagging down under its own
     weight, then trailing back low behind the figure toward the ground — the loudest high-value
     zone in the model (law 3), 12 alternating pale/dark links, feature size well over 0.04u. ===== */
  {
    /* dragged low-and-to-the-side rather than straight back in z, so the sag+drag stays inside
       the silhouette from the primary dimetric camera instead of pushing the bbox depth out and
       forcing the sheet camera to zoom the whole figure down (round-2 self-review finding). */
    const grip = V(wrT.x - 0.03, wrT.y - 0.02, wrT.z - 0.05);
    const sagLow = V(grip.x - 0.15, 0.16, grip.z - 0.02);
    const dragEnd = V(grip.x - 0.30, 0.028, grip.z - 0.10);
    const ctrlA = V(grip.x - 0.10, 0.24, grip.z);
    const ctrlB = V(grip.x - 0.25, 0.07, grip.z - 0.05);
    // build a sagging-then-dragging path via 3 bezier-ish segments sampled into link centers
    const pathPts = [];
    const seg1 = 5, seg2 = 8;
    for(let i = 0; i <= seg1; i++){
      const t = i / seg1;
      const u = 1 - t;
      pathPts.push(V(
        u*u*grip.x + 2*u*t*ctrlA.x + t*t*sagLow.x,
        u*u*grip.y + 2*u*t*ctrlA.y + t*t*sagLow.y,
        u*u*grip.z + 2*u*t*ctrlA.z + t*t*sagLow.z));
    }
    for(let i = 1; i <= seg2; i++){
      const t = i / seg2;
      const u = 1 - t;
      pathPts.push(V(
        u*u*sagLow.x + 2*u*t*ctrlB.x + t*t*dragEnd.x,
        u*u*sagLow.y + 2*u*t*ctrlB.y + t*t*dragEnd.y,
        u*u*sagLow.z + 2*u*t*ctrlB.z + t*t*dragEnd.z));
    }
    for(let i = 0; i < pathPts.length - 1; i++){
      const a = pathPts[i], b = pathPts[i + 1];
      const c = V((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
      const dir = [b.x - a.x, b.y - a.y, b.z - a.z];
      const len = Math.hypot(dir[0], dir[1], dir[2]) * 1.15;
      chainLink(c, dir, len, 0.038, i % 2 === 0 ? P.chain : P.chainDk, i % 2 === 0);
    }
  }

  /* ===== HEAD — gaunt, hollow-eyed, jaw dropped low; head pitched down+forward off the neck,
     eyes glaring UP from under the brow (the implacable-glare read, not a scream). ===== */
  {
    const headBands = [
      { y: L.jawY,   rx: 0.086, rz: 0.082, hex: P.skinDk },
      { y: (L.jawY + L.browY) / 2, rx: 0.066, rz: 0.064, hex: P.skinDk },   // pinched hollow cheeks
      { y: L.browY,  rx: 0.098, rz: 0.090, hex: P.skin },
      { y: L.crownY, rx: 0.078, rz: 0.072, hex: P.skinDk },
    ];
    stack(headBands, 10, { xform: headXf, capTop: { hex: P.skinDk, lift: 0.018 } });

    const jawC = headXf(V(0, L.jawY, 0.078));
    const browC = headXf(V(0, L.browY, 0.088));

    /* gaping vertical mouth, jaw dropped */
    quad(V(jawC.x - 0.024, jawC.y - 0.010, jawC.z), V(jawC.x + 0.024, jawC.y - 0.010, jawC.z),
      V(jawC.x + 0.018, jawC.y - 0.060, jawC.z + 0.010), V(jawC.x - 0.018, jawC.y - 0.060, jawC.z + 0.010), P.mouth, 0.03);

    /* hollow eye sockets, glaring up from under the brow toward camera */
    for(const s of [-1, 1]){
      hollowEye(s * 0.042, browC.y - 0.006, browC.z + 0.010, 0.026, [s * 0.2, 0.5, 0.9], P.eyeSocket, P.eyeGlow);
    }

    /* torn hood/collar remnant — a ragged dark strip framing the crown/neck, the burial-rag tell
       carried up onto the head itself. */
    const hoodTop = ring(headXf(V(0, L.crownY + 0.02, 0.0)), V(0, 1, 0), 0.088, 0.082, 10);
    const hoodBase = ring(headXf(V(0, L.jawY - 0.05, 0.0)), V(0, 1, 0), 0.098, 0.092, 10, Math.PI / 10);
    stitch([hoodTop, hoodBase], () => P.rag);
  }
}
