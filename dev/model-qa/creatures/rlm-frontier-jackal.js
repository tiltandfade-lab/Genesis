/* dev/model-qa/creatures/rlm-frontier-jackal.js — the JACKAL landmark table (QUADRUPED-DIGITIGRADE
   family, Medium, CR 1/4, realm frontier), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri
   band (foundry pilot, frontier-w2 cell 2). Core identity: the DESERT JACKAL — a dry-wash livestock
   raider, smaller and leaner than any wolf, with ears out of proportion to its skull. Bespoke to the
   render key "jackal"; frontier reskins ride this chassis.

   FEATURE CHECKLIST (the ~1,000-2,000 budget buys):
     1. QUADRUPED-DIGITIGRADE torso per ANATOMY-CANON POSE-ANATOMY: an exaggerated-LEAN barrel —
        tucked waist (narrower than the rib/chest bands), a visible pale rib-hint strip along the
        flank, deep-chest front carried low into a genuine belly tuck at the loin — the "wolf-not-
        sheep" read pushed further gaunt.
     2. SIGNATURE — the giant ears: oversized upright triangular ears, noticeably larger relative
        to the skull than a wolf's, with a bright pale-inner patch (the law-3 high-value zone,
        >=140 RGB) facing forward/down into the skulking circle.
     3. Hind legs — true Z-zigzag digitigrade per canon: thigh hip->stifle DOWN-and-FORWARD,
        tibia stifle->hock DOWN-and-BACK with the hock set HIGH (~0.35-0.40H) and behind the
        stifle, metatarsus hock->paw NEAR-VERTICAL. Front legs — near-straight columns, elbow
        tucked close under the chest, much straighter than the hind.
     4. Pose — the skulking circle: spine carried LOW (mid-slink height, not standing-tall), head
        level with the spine line (not lifted), one foreleg lifted mid-step off the ground plane
        (a genuine raised paw, not a 4-square stance), huge ears pricked forward-up.
     5. High-value zone — pale throat/belly strip running the full underside (chest through loin)
        plus the pale ear-inner patches; both sit well above the dark hide/void so the signature
        reads at a squint.
     6. Low, level tail carried down-and-back (not raised) — the wary/skulking read, not an
        alert stance.

   POSE SENTENCE: the skulking circle — spine held low at mid-slink height with the head carried
   level to the spine (never lifted proud), one foreleg raised mid-step clear of the ground plane,
   huge ears pricked sharply forward-up, tail low and trailing — the beat of a jackal circling a
   flock at range, never a standing-square, at-attention pose.

   SPINE-GESTURE SENTENCE: the spine runs a shallow, near-level curve from a low-carried tail base
   through a gaunt tucked-waist loin, up through a deep-but-lean chest, into a neck that stays LOW
   and level (not arched up) to a head held on the spine line — no proud lifted head, no plumb-
   line mannequin — with the lifted foreleg's hip/shoulder line breaking the four-square stance.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w2'], cell 2, fn buildJackal). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildJackal(){
  /* ---------- PALETTE (dry-wash tan/dun hide, pale throat/belly + ear-inner high-value zone,
     frontier-desaturated warm) ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's ears were nearly invisible (single-sided
     quads backface-culled from this camera on the mirrored -x side, and undersized) and the
     legs/tail sank into a value close to the disc — the whole stance vanished. Fixed below:
     ears now emit BOTH windings (double-sided) and are bigger with a brighter inner patch;
     hideDk/leg tones lifted a full step off the disc; the whole frame raised higher off the
     ground plane so the leg zigzag has room to read instead of overlapping the torso mass. */
  const P = {
    hide: 0xa8905c, hideDk: 0x88724a, hideLt: 0xc0a473,
    rib: 0x968060,
    belly: 0xe0cea4, throat: 0xecdcb4,
    snout: 0x4a3e2a, mouth: 0x231d16, tooth: 0xc4b696,
    earOuter: 0x8c7248, earInner: 0xf0e0b4,
    eye: 0x1c1712,
    claw: 0x2a2318,
    disc: 0x4a4230, discTop: 0x584f38,
  };

  /* ---------- LANDMARKS — spine along +z, low mid-slink carry (lower than a standing wolf but
     raised enough off the ground plane for the leg zigzag to read), gaunt lean frame ~0.90u
     long, head level with the spine (not lifted). ---------- */
  const spY = 0.34;
  const S = {
    tailBase: V(0, spY - 0.01, -0.46),
    rump:     V(0, spY + 0.03, -0.32),
    loin:     V(0, spY + 0.02, -0.12),   // tucked-waist band — narrower here
    mid:      V(0, spY + 0.04,  0.06),
    shldr:    V(0, spY + 0.03,  0.24),
    neck:     V(0, spY + 0.055, 0.40),
    headB:    V(0, spY + 0.065, 0.50),   // level with spine, not lifted
  };

  /* ---------- BODY — gaunt tucked-waist barrel: loin band is the narrowest point (the tuck),
     rib/chest bands wider, a visible pale rib-hint strip along the flank. ---------- */
  tube(S.rump,  S.loin,  0.140, 0.108, 8, P.hide,   { phase: Math.PI / 8, capA: { hex: P.hideDk, lift: 0.02 } });
  tube(S.loin,  S.mid,   0.108, 0.150, 8, P.rib,    { phase: Math.PI / 8 });   // the tuck -> chest expansion
  tube(S.mid,   S.shldr, 0.150, 0.140, 8, P.hide,   { phase: Math.PI / 8 });
  tube(S.shldr, S.neck,  0.140, 0.088, 8, P.hideDk, { phase: Math.PI / 8 });
  tube(S.neck,  S.headB, 0.088, 0.068, 8, P.hide,   { phase: Math.PI / 8 });

  /* pale throat/belly strip — high-value zone (law 3), full underside chest-through-loin */
  {
    const by = spY - 0.075;
    quad(V(-0.075, by, -0.30), V(0.075, by, -0.30), V(0.065, by + 0.02, 0.34), V(-0.065, by + 0.02, 0.34), P.belly, 0.04);
    quad(V(-0.045, by + 0.01, 0.20), V(0.045, by + 0.01, 0.20), V(0.038, by + 0.03, 0.40), V(-0.038, by + 0.03, 0.40), P.throat, 0.04);
  }
  /* rib-hint strip on the flank — the gaunt tuck read */
  for (const s of [-1, 1]) {
    quad(V(s * 0.095, spY + 0.05, -0.06), V(s * 0.135, spY + 0.06, -0.20),
      V(s * 0.125, spY - 0.01, -0.20), V(s * 0.085, spY - 0.02, -0.06), P.rib, 0.07);
  }

  /* ---------- HEAD — carried level with the spine, narrow canid wedge, HUGE alert ears. ---------- */
  {
    const n = 8, ph = Math.PI / n;
    const bands = [
      { y: spY + 0.02, cz: 0.48, rx: 0.062, rz: 0.068, hex: P.hide },
      { y: spY + 0.075, cz: 0.51, rx: 0.070, rz: 0.072, hex: P.hide },
      { y: spY + 0.125, cz: 0.48, rx: 0.052, rz: 0.058, hex: P.hideDk },
    ];
    const rings = bands.map(b => ring(V(0, b.y, b.cz), V(0, 1, 0), b.rx, b.rz, n, ph));
    stitch(rings, b => bands[b].hex);
    capFan(rings.at(-1), V(0, spY + 0.16, 0.48), P.hideDk);

    /* SNOUT — narrow tapering muzzle, level */
    const snB = V(0, spY + 0.035, 0.48);
    const snM = V(0, spY + 0.015, 0.60);
    const snT = V(0, spY - 0.002, 0.70);
    tube(snB, snM, 0.050, 0.032, n, P.hide, { raz: 0.046, rbz: 0.026, phase: ph });
    tube(snM, snT, 0.032, 0.016, n, P.snout, { raz: 0.026, rbz: 0.013, phase: ph, capB: { hex: P.mouth, lift: 0.006 } });
    quad(V(-0.028, spY - 0.01, 0.53), V(0.028, spY - 0.01, 0.53), V(0.017, spY - 0.02, 0.68), V(-0.017, spY - 0.02, 0.68), P.mouth, 0.03);
    for (const s of [-1, 1]) quad(V(s * 0.015, spY - 0.02, 0.57), V(s * 0.020, spY - 0.02, 0.57), V(s * 0.018, spY - 0.04, 0.58), V(s * 0.013, spY - 0.04, 0.58), P.tooth, 0.02);
    /* dark deep eye sockets, no eye whites */
    for (const s of [-1, 1]) quad(V(s * 0.032, spY + 0.10, 0.50), V(s * 0.048, spY + 0.10, 0.49), V(s * 0.044, spY + 0.075, 0.495), V(s * 0.030, spY + 0.075, 0.50), P.eye, 0.03);

    /* EARS — the signature: exaggerated oversized upright ears, pricked forward-up, with a
       bright pale-inner patch (>=140 RGB, law 3) facing forward-down into the circle. Built as
       two-face wedges (outer + inner), each face emitted BOTH windings (double-sided) so the
       mirrored -x side can't backface-cull away from this camera — the r1 near-invisibility. */
    const dquad = (a, b, c, d, hex, j) => { quad(a, b, c, d, hex, j); quad(d, c, b, a, hex, j); };
    for (const s of [-1, 1]) {
      const eb   = V(s * 0.050, spY + 0.185, 0.450);
      const efr  = V(s * 0.014, spY + 0.185, 0.495);
      const tipA = V(s * 0.095, spY + 0.46, 0.38);
      const tipB = V(s * 0.026, spY + 0.455, 0.425);
      /* outer face — bigger, taller than r1 */
      dquad(eb, V(s * 0.004, spY + 0.185, 0.505), tipB, tipA, P.earOuter, 0.05);
      /* inner face — pale high-value patch, offset slightly forward/inward so it reads distinct */
      dquad(V(s * 0.036, spY + 0.19, 0.465), efr, V(s * 0.022, spY + 0.44, 0.430), V(s * 0.066, spY + 0.445, 0.400), P.earInner, 0.04);
    }
  }

  /* ---------- LEGS — quadruped-digitigrade per ANATOMY-CANON: hind = true Z-zigzag (thigh
     down-forward to a high stifle, tibia down-back to a HIGH backward hock, metatarsus near-
     vertical to paw); front = near-straight column, elbow tucked under the chest. ONE foreleg
     lifted mid-step (the skulking circle) — a genuine raised paw off the ground plane. ---------- */
  {
    /* HIND leg — Z-zigzag digitigrade. Landmarks re-solved against the raised spY=0.34 so the
       full thigh->stifle->hock->paw chain has room below the torso instead of overlapping it. */
    const hindLeg = (hipX, hipZ, hex) => {
      const hip    = V(hipX, spY - 0.02, hipZ);
      const stifle = V(hipX * 1.08, 0.190, hipZ + 0.095);   // down-and-forward, high (~0.55H)
      const hock   = V(hipX * 1.16, 0.110, hipZ - 0.060);   // down-and-back, HIGH (~0.35H), behind stifle
      const paw    = V(hipX * 1.10, 0.020, hipZ - 0.030);   // near-vertical to ground
      tube(hip, stifle, 0.056, 0.044, 6, hex, { capA: { hex: P.hideDk } });
      tube(stifle, hock, 0.044, 0.032, 6, P.hideDk);
      tube(hock, paw, 0.032, 0.024, 5, P.hideDk, { capB: { hex: P.claw, lift: 0.006 } });
    };
    hindLeg(-0.092, -0.30, P.hide);
    hindLeg( 0.092, -0.30, P.hide);

    /* FRONT legs — near-straight column, elbow tucked close under chest. Right (+x) planted;
       left (-x) LIFTED mid-step, clear of the ground plane — the signature pose beat. */
    const shX = 0.094, shZ = 0.235;
    // PLANTED front leg (+x)
    {
      const sh  = V(shX, spY - 0.02, shZ);
      const el  = V(shX * 1.02, 0.170, shZ + 0.015);
      const wr  = V(shX * 1.00, 0.060, shZ + 0.005);
      const paw = V(shX * 1.00, 0.018, shZ + 0.010);
      tube(sh, el, 0.050, 0.040, 6, P.hide, { capA: { hex: P.hideDk } });
      tube(el, wr, 0.040, 0.028, 6, P.hideDk);
      tube(wr, paw, 0.028, 0.023, 5, P.hideDk, { capB: { hex: P.claw, lift: 0.005 } });
    }
    // LIFTED front leg (-x) — raised mid-step, paw clear of the ground/disc, slight forward reach
    {
      const sh  = V(-shX, spY - 0.02, shZ);
      const el  = V(-shX * 1.05, 0.160, shZ + 0.080);
      const wr  = V(-shX * 1.02, 0.095, shZ + 0.120);
      const paw = V(-shX * 0.98, 0.070, shZ + 0.140);   // stays lifted off ground (y=0)
      tube(sh, el, 0.050, 0.040, 6, P.hide, { capA: { hex: P.hideDk } });
      tube(el, wr, 0.040, 0.028, 6, P.hideDk);
      tube(wr, paw, 0.028, 0.023, 5, P.hideDk, { capB: { hex: P.claw, lift: 0.005 } });
    }
  }

  /* ---------- TAIL — low, level, trailing back (the wary/skulking read, not raised/alert) ---------- */
  {
    const t0 = S.tailBase;
    const t1 = V(0.02, spY - 0.04, -0.62);
    const t2 = V(0.04, spY - 0.075, -0.75);
    const tip = V(0.06, spY - 0.10, -0.86);
    tube(t0, t1, 0.048, 0.036, 6, P.hide, { capA: { hex: P.hideDk } });
    tube(t1, t2, 0.036, 0.022, 6, P.hideDk, {});
    tube(t2, tip, 0.022, 0.007, 6, P.hideDk, { capB: { hex: P.hideDk, lift: 0.005 } });
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
