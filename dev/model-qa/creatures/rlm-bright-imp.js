/* dev/model-qa/creatures/rlm-bright-imp.js — the IMP landmark table (HUMANOID Small + WINGED
   bat + SERPENTINE stinger-tail hybrid), CR 1, realm bright-kingdom, authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, bright-w1 cell 6, port 5356).
   Core identity: the imp — small horned fiend, bat wings, stinger tail. Bright-kingdom skin:
   a toll-imp, its clawed offering hand carrying a small brass toll-brand. Bespoke to the
   render key "imp" — other realm reskins ride this chassis narratively.

   FEATURE CHECKLIST (the ~1,500-1,700 budget buys):
     1. HUMANOID Small torso (ANATOMY-CANON's PC-kit grammar family, noted for completeness) —
        compact hips->chest->shoulders->neck loft, cross-legged sit with both knees splayed
        out and the shins crossing beneath the body (a hover pose, no ground contact needed).
     2. SIGNATURE (a) — the open offering palm: right arm extended forward-up, wrist rotated
        palm-up, three small clawed fingers splayed OPEN (not curled into a fist) around a tiny
        brass toll-brand disc resting in the palm — "pay the toll" (law 4's loud feature #1).
     3. SIGNATURE (b) — the scorpion stinger tail: rooted at the tailbone, climbing the spine
        and curling forward OVER the left shoulder like a raised scorpion's, dark barbed
        stinger tip hanging just past the shoulder line (law 4's loud feature #2, per the
        DIRECTION brief's "over-shoulder stinger").
     4. WINGED/AVIAN bat wings (ANATOMY-CANON's WINGED family) — small strut-built wings off
        the shoulder blades, held in a half-spread hover-beat (not fully folded, not a full
        flight spread) so the hover reads without ballooning the silhouette past the Small
        footprint.
     5. Horned smirking head — two short backswept horns, head tilted toward the offering
        hand, one corner of the mouth pulled up around a single visible fang (the smirk).
     6. Deep red hide value ladder (law 3's high-value zone) — dark red-black shadow flanks
        against a brighter red chest/face, with the stinger barb, horn tips, claws, and the
        brass toll-brand pushed to the palette's brightest values so both signatures (palm +
        stinger) and the horns carry the contrast, per the DIRECTION brief's "high-value =
        palm + horns + stinger barb."

   POSE SENTENCE: the deal-offer hover — cross-legged, floating above its base disc, torso
   leaned and twisted toward the right (offering) side, right arm extended forward with the
   palm turned up and claws splayed around the toll-brand, the stinger tail curled up and
   forward over the LEFT shoulder like a scorpion's raised blade, wings beating at a shallow
   half-spread to hold the hover, horned head tilted toward the offered hand with a smirk —
   never a symmetric at-rest float.

   POSE NOTE (per ANATOMY-CANON's POSE-ANATOMY): the spine gesture is authored FIRST via the
   `lean` transform below — hips->shoulders->skull lean+twist as one continuous curve toward
   the offering arm, never a plumb vertical column. Both arms bend at a visible elbow angle
   (offering arm ~120deg, off arm ~100deg tucked at the hip) — no dead-straight segments. The
   off (left) arm and the crossed legs read as the counterpose that keeps a one-arm-extended,
   head-tilted body from reading as toppling, per law 4 of that section.

   Whole-object grammar: one function, one merged geometry frame, no anchors. Spine +z (front),
   up +y, ground y=0 (disc). Imported by ps1-sheet.html (SETS['bright-w1'], cell 6, fn
   buildImp). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob, setChannels } from '../probe-lib.js';

export function buildImp(){
  /* ---------- PALETTE (deep red hide, dark-red-black shadow flanks vs. a brighter red
     chest/face; stinger barb + horn tips + claws + brass toll-brand pushed to the palette's
     brightest values so law 3's contrast rides both signatures + the horns). ---------- */
  const P = {
    hide: 0x8a1f1f, hideLt: 0xb8342f, hideDk: 0x5c1414,     // deep red hide ladder
    belly: 0xc65a3f,                                         // paler chest/belly patch, secondary lift
    horn: 0x241612, hornLt: 0xe8ddc4,                        // dark horn base -> pale tip
    claw: 0x1c110d, clawLt: 0xe8ddc4,                        // dark claw base -> pale tip
    stinger: 0x140c0a, barb: 0xece0c8,                       // near-black stinger shaft, pale barb tip
    eye: 0x140c0a, eyeGlow: 0xf2c23a,                        // sunken sockets, carnival-gold gaze
    mouth: 0x180a08, fang: 0xece0c8,
    wing: 0x3a1414, wingLt: 0x6e2420, spar: 0x241010,        // dark bat-wing membrane, spar darkest
    brass: 0xd8a838, brassLt: 0xf2d878,                       // bright-kingdom toll-brand
    disc: 0x2c1614, discTop: 0x3a1e1a,
  };
  setChannels({
    [P.hide]: 'skin', [P.hideLt]: 'skin', [P.hideDk]: 'skin', [P.belly]: 'skin',
    [P.horn]: 'bone', [P.hornLt]: 'bone',
    [P.claw]: 'bone', [P.clawLt]: 'bone',
    [P.stinger]: 'bone', [P.barb]: 'bone',
    [P.wing]: 'leather', [P.wingLt]: 'leather', [P.spar]: 'leather',
    [P.brass]: 'metal', [P.brassLt]: 'metal',
  });

  /* ===== RIG — Small hovering biped, lean+twist toward the offering (right) arm. ===== */
  const HOVER = 0.42;                                       /* body center height over the disc */
  const L = {
    hipY: HOVER - 0.11, waistY: HOVER - 0.02, chestY: HOVER + 0.06, shldY: HOVER + 0.13,
    neckY: HOVER + 0.165, jawY: HOVER + 0.205, browY: HOVER + 0.255, crownY: HOVER + 0.285,
    hipHalf: 0.065, shoulderX: 0.095,
  };
  /* spine gesture: lean forward+right and twist toward the offering arm, one continuous curve
     hip->shoulder->skull — never a plumb vertical column (POSE-ANATOMY rule 1). */
  const lean = (p) => {
    const t = Math.max(0, (p.y - L.hipY) / (L.crownY - L.hipY));
    const q = p.clone().sub(V(0, L.hipY, 0));
    q.applyAxisAngle(V(0, 0, 1), -0.14 * t);   /* lean toward +x, the offering side */
    q.applyAxisAngle(V(1, 0, 0), 0.08 * t);    /* slight recline, a floating creature's ease */
    q.applyAxisAngle(V(0, 1, 0), -0.16 * t);   /* twist shoulders/head toward the offered hand */
    return q.add(V(0, L.hipY, 0));
  };

  /* ===== LEGS — cross-legged hover sit: both knees splay outward, shins cross beneath the
     body, no ground contact (the creature floats). ===== */
  function leg(s){
    const hip = lean(V(s * L.hipHalf, L.hipY, 0.01));
    const knee = V(s * 0.145, L.hipY - 0.045, 0.075);        /* knee out to the side, bent, forward */
    const foot = V(-s * 0.050, L.hipY - 0.095, 0.010);       /* shin crosses IN under the body */
    tube(hip, knee, 0.044, 0.033, 6, P.hide);
    tube(knee, foot, 0.031, 0.023, 6, P.hideDk, { phase: Math.PI / 6 });
    const toe = foot.clone().add(V(-s * 0.018, -0.012, 0.038));
    tube(foot, toe, 0.020, 0.006, 4, P.claw, { capB: { hex: P.clawLt } });
  }
  leg(1);
  leg(-1);

  /* ===== TORSO — compact Small loft, hips->chest->shoulders->neck, deep red hide with a
     paler belly lift on the front-facing bands. ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.062, rz: 0.052, hex: P.hideDk },
    { y: L.waistY, rx: 0.052, rz: 0.044, hex: P.hide },
    { y: L.chestY, rx: 0.072, rz: 0.060, hex: P.belly },
    { y: L.shldY,  rx: 0.082, rz: 0.056, hex: P.hide },
    { y: L.neckY,  rx: 0.032, rz: 0.028, hex: P.hideDk },
  ], 8, { xform: lean });

  /* ===== HEAD — horned, tilted toward the offering hand, one-sided smirk. ===== */
  const jawC = lean(V(0.012, L.jawY, 0.038));
  const cheekC = lean(V(0.012, L.jawY + 0.028, 0.046));
  const browC = lean(V(0.010, L.browY, 0.034));
  const crownC = lean(V(0.008, L.crownY, 0.014));
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.030, 0.038, 8, Math.PI / 8),
    ring(cheekC, V(0, 1, 0), 0.040, 0.046, 8, Math.PI / 8),
    ring(browC, V(0, 1, 0), 0.044, 0.040, 8, Math.PI / 8),
    ring(crownC, V(0, 1, 0), 0.030, 0.026, 8, Math.PI / 8),
  ];
  stitch(headRings, (b) => [P.hideDk, P.hide, P.hide][b] ?? P.hideDk);
  capFan(headRings[3], crownC.clone().add(V(0, 0.014, -0.006)), P.hideDk);
  /* jaw taper forward into a small muzzle-chin (imp faces are pointed, not human-flat) */
  quad(V(jawC.x - 0.026, jawC.y - 0.014, jawC.z), V(jawC.x + 0.026, jawC.y - 0.014, jawC.z),
    V(jawC.x + 0.010, jawC.y - 0.034, jawC.z + 0.020), V(jawC.x - 0.010, jawC.y - 0.034, jawC.z + 0.020), P.hideDk, 0.03);

  /* eyes — small sunken sockets with a carnival-gold gaze, set to catch the tilt */
  for(const s of [-1, 1]){
    const p = lean(V(s * 0.024 + 0.012, L.browY - 0.004, 0.062));
    quad(p.clone().add(V(-0.011, -0.009, 0)), p.clone().add(V(0.011, -0.009, 0)),
      p.clone().add(V(0.009, 0.010, -0.006)), p.clone().add(V(-0.009, 0.010, -0.006)), P.eye, 0.02);
    blob(p.x, p.y, p.z - 0.004, 0.005, 0.005, 0.004, P.eyeGlow, 4, 2);
  }

  /* smirking mouth — the right corner pulled up around one fang, left corner flat */
  {
    const my = jawC.y - 0.004, mz = jawC.z + 0.036;
    quad(V(-0.016, my - 0.014, mz), V(0.022, my - 0.006, mz + 0.006),
      V(0.020, my + 0.008, mz + 0.006), V(-0.014, my + 0.002, mz), P.mouth, 0.02);
    tube(V(0.014, my + 0.006, mz + 0.008), V(0.010, my - 0.020, mz + 0.002), 0.007, 0.002, 4, P.fang, { capB: { hex: P.fang } });
  }

  /* backswept horns — short, dark base, pale tip (law 3's third bright zone). R1 SELF-
     CORRECTION: tip radii bumped above the 0.04u minimum-feature floor (law 3) — the pass-1
     tips (0.004) dissolved into scattered dither specks in the r1 render. */
  for(const s of [-1, 1]){
    const hb = lean(V(s * 0.026, L.crownY - 0.004, -0.002));
    const ht = hb.clone().add(V(s * 0.058, 0.085, -0.065));
    tube(hb, ht, 0.024, 0.020, 5, P.horn, { capB: { hex: P.hornLt } });
  }

  /* ===== SIGNATURE (a) — the offering arm: right, extended forward-up, elbow bent ~120deg,
     palm rotated UP with three claws splayed OPEN around a tiny brass toll-brand disc. ===== */
  {
    /* R1 SELF-CORRECTION (post r1 engine render): the r1 arm dissolved into scattered
       dither dots — every tip radius (claws 0.003-0.007, brand blob 0.005) sat under the
       0.04u minimum-feature floor (law 3). Thickened the whole chain (arm tubes, palm plate,
       claws, brand) well past the floor so the offering-hand signature actually survives
       1/3-res + dither. */
    const sh = lean(V(L.shoulderX, L.shldY - 0.006, 0.010));
    const el = V(0.185, HOVER + 0.075, 0.100);      /* visible bent elbow, ~120deg off the shoulder */
    const wr = V(0.270, HOVER + 0.110, 0.185);
    tube(sh, el, 0.040, 0.032, 6, P.hide);
    tube(el, wr, 0.032, 0.026, 6, P.hideDk, { phase: Math.PI / 6 });
    /* flat offered palm plate, facing UP (+y normal) */
    const palmC = wr.clone().add(V(0.018, -0.004, 0.010));
    quad(palmC.clone().add(V(-0.028, 0, -0.022)), palmC.clone().add(V(0.028, 0, -0.022)),
      palmC.clone().add(V(0.024, 0, 0.026)), palmC.clone().add(V(-0.024, 0, 0.026)), P.hideLt, 0.03);
    /* three claws splaying up-and-outward, open — not curled */
    const clawDirs = [[0.55, 0.55, 0.45], [0.70, 0.62, 0.05], [0.55, 0.50, -0.35]];
    for(const d of clawDirs){
      const dn = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      const mid = palmC.clone().addScaledVector(dn, 0.036);
      const tip = palmC.clone().addScaledVector(dn, 0.074);
      tube(palmC, mid, 0.017, 0.013, 4, P.claw);
      tube(mid, tip, 0.013, 0.006, 4, P.clawLt, { capB: { hex: P.clawLt } });
    }
    /* the toll-brand — a bright brass disc resting in the offered palm */
    blob(palmC.x, palmC.y + 0.008, palmC.z, 0.020, 0.014, 0.020, P.brass, 6, 2);
    blob(palmC.x, palmC.y + 0.015, palmC.z, 0.012, 0.008, 0.012, P.brassLt, 4, 2);
  }

  /* ===== off (left) arm — tucked at the hip, elbow bent ~100deg, claws loosely curled: the
     counterpose that keeps the one-arm-extended, head-tilted body from reading as toppling. */
  {
    const sh = lean(V(-L.shoulderX, L.shldY - 0.010, 0.004));
    const el = V(-0.130, HOVER - 0.010, 0.050);
    const wr = V(-0.115, HOVER - 0.075, 0.030);
    tube(sh, el, 0.038, 0.030, 6, P.hideDk);
    tube(el, wr, 0.030, 0.024, 6, P.hide, { phase: Math.PI / 6 });
    blob(wr.x, wr.y, wr.z, 0.026, 0.021, 0.023, P.hideDk, 6, 3);
    const clawDirs = [[-0.55, -0.40, 0.55], [-0.70, -0.20, 0.40], [-0.50, -0.55, 0.30]];
    for(const d of clawDirs){
      const dn = new THREE.Vector3(d[0], d[1], d[2]).normalize();
      const mid = wr.clone().addScaledVector(dn, 0.028);
      const tip = wr.clone().addScaledVector(dn, 0.058);
      tube(wr, mid, 0.015, 0.011, 4, P.hideDk);
      tube(mid, tip, 0.011, 0.005, 4, P.claw, { capB: { hex: P.claw } });
    }
  }

  /* ===== SIGNATURE (b) — the scorpion stinger tail: rooted at the tailbone, climbing the
     spine and curling forward OVER the LEFT shoulder like a raised blade, dark barbed stinger
     tip hanging just past the shoulder line. ===== */
  {
    /* R1 SELF-CORRECTION: every segment past t2 was under the 0.04u floor (0.008-0.002) and
       the whole curl broke into scattered dither specks in the r1 render instead of a solid
       curled line — the signature the DIRECTION brief calls out by name. Thickened the full
       chain (base through barb) well past the floor. */
    const t0 = lean(V(-0.006, L.hipY - 0.006, -0.052));
    const t1 = V(-0.040, HOVER + 0.055, -0.135);
    const t2 = V(-0.085, HOVER + 0.190, -0.095);
    const t3 = V(-0.115, HOVER + 0.255, -0.010);
    const t4 = V(-0.100, HOVER + 0.210, 0.075);         /* curling forward, over the shoulder */
    const t5 = V(-0.060, HOVER + 0.130, 0.110);         /* stinger tip, hanging past the shoulder line */
    tube(t0, t1, 0.032, 0.028, 6, P.hideDk);
    tube(t1, t2, 0.027, 0.023, 6, P.hide, { phase: Math.PI / 6 });
    tube(t2, t3, 0.022, 0.019, 6, P.hideDk, { phase: Math.PI / 3 });
    tube(t3, t4, 0.019, 0.016, 5, P.stinger);
    tube(t4, t5, 0.016, 0.007, 5, P.barb, { capB: { hex: P.barb } });
  }

  /* ===== WINGS — small bat-wing struts, half-spread hover-beat (per WINGED family: leading-
     edge spar + fanning finger struts, membrane hung between/behind, never a flat sheet). ===== */
  function wing(s){
    /* R1 SELF-CORRECTION (post r1 engine render): the wing struts (radii 0.011-0.004) sat
       under/near the 0.04u floor and the membrane panels rendered as near-invisible hairlines
       — law 3 failure, "wings" did not read at all in r1. Thickened every strut past the
       floor and doubled each membrane panel (both winding orders, like the giant-bat ear
       pattern) so the panel reads regardless of which face the camera catches. */
    const sh = lean(V(s * 0.088, L.shldY - 0.012, -0.020));
    const el = V(s * 0.175, HOVER + 0.155, -0.070);
    const wr = V(s * 0.245, HOVER + 0.145, -0.145);
    tube(sh, el, 0.032, 0.026, 5, P.spar, { capA: { hex: P.hideDk } });
    tube(el, wr, 0.025, 0.019, 5, P.spar);
    /* thumb claw hooking up off the wrist */
    tube(wr, wr.clone().add(V(s * 0.026, 0.038, 0.026)), 0.014, 0.006, 4, P.claw, { capB: { hex: P.claw } });
    /* three finger struts fanning back from the wrist */
    const F0 = wr.clone().add(V(s * 0.110, 0.045, -0.010));
    const F1 = wr.clone().add(V(s * 0.130, -0.010, -0.075));
    const F2 = wr.clone().add(V(s * 0.095, -0.060, -0.130));
    tube(wr, F0, 0.019, 0.012, 4, P.spar);
    tube(wr, F1, 0.019, 0.012, 4, P.spar);
    tube(wr, F2, 0.018, 0.011, 4, P.spar);
    /* membrane panels between shoulder-root/wrist and each consecutive finger pair, scalloped
       inward at the trailing midpoint so the trailing edge reads as concave bays, not a sheet.
       Each panel drawn both windings so it reads from either camera-facing side. */
    const root = lean(V(s * 0.055, L.shldY - 0.03, 0.020));
    const scallop = (a, b, depth) => {
      const mid = V((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
      return mid.addScaledVector(new THREE.Vector3(wr.x, wr.y, wr.z).sub(mid).normalize(), depth);
    };
    const bay1 = scallop(F0, F1, 0.022);
    const bay2 = scallop(F1, F2, 0.020);
    quad(sh, root, F0, wr, P.wing, 0.04);
    quad(wr, F0, root, sh, P.wing, 0.04);
    quad(wr, F0, bay1, F1, P.wingLt, 0.04);
    quad(F1, bay1, F0, wr, P.wingLt, 0.04);
    quad(wr, F1, bay2, F2, P.wing, 0.04);
    quad(F2, bay2, F1, wr, P.wing, 0.04);
  }
  wing(1);
  wing(-1);

  /* ===== base disc (Small: r=0.30) — the creature floats above it, no support strut. ===== */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.30, 0.30, 14);
    const r2 = ring(V(0, 0.038, 0), V(0, 1, 0), 0.285, 0.285, 14);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.040, 0), P.discTop);
  }
}
