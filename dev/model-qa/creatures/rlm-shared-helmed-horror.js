/* dev/model-qa/creatures/rlm-shared-helmed-horror.js — the HELMED HORROR (shared render key
   "helmed-horror", Medium, CR 4, CONSTRUCT — cross-realm shared body). Ridden by FOUR realm
   reskins (arcade claw-machine grabber, clockwork dancer, angle-enforcer, boiler-plate
   enforcer) — authored to the NEUTRAL core identity only, no single realm's palette gimmicks:
   a hollow flying suit of ornate plate, more ELEGANT than a lumbering animated-armor golem.
   Foundry pilot, catchall-w1, cell 1.

   FEATURE CHECKLIST (the ~1,300-1,900 budget buys):
     1. HOLLOW PLATE CONSTRUCTION — the suit is built as separate front/back plate shells with a
        visible GAP between them at the ribs and pelvis (never a solid stack) so the near-black
        void (10,9,8) shows THROUGH the suit — the "nobody's home" tell law 4 demands for a
        construct that is armor and nothing else.
     2. SIGNATURE A — the empty helm's GLOW SLIT: a single bright horizontal line (>=140 RGB,
        law 3's high-value zone) inside an otherwise dark, gapped visor — the only "face."
     3. Winged pauldrons — each shoulder flares into three raked blade-vanes (ornate, not bulky),
        distinctly larger/more decorative than a common suit's shoulder guard.
     4. SIGNATURE B — the greatsword, held point-down in both gauntlets below the bowed helm, a
        bright fuller line running its face (second high-value zone, carries the descent's
        downward gesture line to its tip).
     5. Fanned plate gaps — breastplate/backplate/tassets sit slightly open/splayed (not
        flush-sealed) as if the suit is loosely reassembled mid-flight, each gap showing the void.
     6. Ornate edge trim — a bright metal bevel along every plate's outer edge (pauldrons, helm
        brow, greaves) so the silhouette reads as fine craftsmanship, not a crude box golem.

   POSE SENTENCE: the sentinel descent — hovering mid-fall toward a target, plates fanned
   slightly open by the drop, the greatsword held point-down in both gauntlets directly below
   the bowed glow-slit helm, legs trailing loose and bent behind/below as the suit settles out
   of its dive — never standing at attention, always caught mid-descent.

   SPINE-GESTURE SENTENCE: the spine runs from a pelvis-plate band pitched forward-and-down,
   up through a ribcage gap to a shoulder band that leans further forward over the blade, then
   the neck gap continues the same forward pitch into the bowed helm looking straight down at
   the sword point — one continuous forward-tipping curve, hips-to-helm, with the trailing bent
   legs as the counter-mass behind it and the greatsword extending the curve's line below.

   ANATOMY: CONSTRUCT/HOLLOW-PLATE family (no organic skeleton) — hover flag: whole suit floats
   ~0.15u clear of the ground with a ground-shadow pool disc at y~0.03-0.06 so bbox min.y lands
   in [-0.01,0.08] per docs/MODEL-FOUNDRY.md's hover convention.

   Whole-object grammar: one exported fn, probe-lib primitives only, spine +z, ground y=0, no
   anchors. Imported by ps1-sheet.html (SETS['catchall-w1'], cell 1, fn buildHelmedHorror). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack, blob } from '../probe-lib.js';

export function buildHelmedHorror(){
  const P = {
    plate: 0x8a92a0, plateDk: 0x5c6472,           // main ornate plate — cool steel
    plateLt: 0xb8c0cc,                            // ornate edge-trim bevel (law 3/6 high-value)
    plateFar: 0xe2e7ee,                           // R2: far-shoulder gusset — the facing-normal-dimmed
                                                   // face needs a near-white base to still clear the
                                                   // law-3 body-mass floor after shading knocks it down
    void: 0x0a0908, voidLt: 0x161418,             // starfield-void interior — the gap reveal
    glow: 0xf0feff, glowCore: 0xffffff,           // SIGNATURE A — the helm slit (>=140 RGB); R2:
                                                   // pushed glow toward near-white cyan (was 0xd8fbff)
    gauntlet: 0x707886, gauntletDk: 0x484f5c,
    blade: 0x9aa2ac, bladeDk: 0x6a7078,
    fuller: 0xe4eaf0,                              // SIGNATURE B — the sword's bright fuller line
    hilt: 0x4a3c28, hiltDk: 0x2e2418, pommel: 0xc8b468,
    trim: 0xd4b04c, trimDk: 0x8a6e2c,              // gold ornate accents
    shadow: 0x120f10, shadowTop: 0x1c1719,
  };

  const HOVER = 0.17;   // whole suit lift — the descent altitude
  const lift = (p) => V(p.x, p.y + HOVER, p.z);

  /* ---------- ground-shadow pool — the hover-unit grounding convention (bbox min.y target
     [-0.01,0.08]); the shadow sits directly under the sword point, the descent's focal line. ---------- */
  {
    const r1 = ring(V(0, 0.006, 0.02), V(0, 1, 0), 0.30, 0.24, 14);
    const r2 = ring(V(0, 0.05, 0.02), V(0, 1, 0), 0.24, 0.19, 14);
    stitch([r1, r2], () => P.shadow);
    capFan(r2, V(0, 0.055, 0.02), P.shadowTop);
  }

  /* ===== SPINE FRAME — forward-pitching descent curve, pelvis to helm. All bands defined in
     LOCAL suit space (y=0 at the hover origin), then lift() applies the +HOVER float. ===== */
  const L = {
    hipY: 0.42, ribY: 0.62, chestY: 0.80, shldY: 0.98, neckY: 1.06, jawY: 1.12, crownY: 1.20,
  };
  const PITCH = 0.62;   // forward pitch (radians-ish lean via z-shear), grows with height
  function pitch(p){
    const t = Math.max(0, (p.y - L.hipY) / (L.crownY - L.hipY));
    const lean = t * t * PITCH * 0.30;   // eases in — hips near-vertical, helm bowed hardest
    return V(p.x, p.y - lean * 0.15, p.z + lean);
  }
  const xf = (p) => lift(pitch(p));

  /* ===== PELVIS PLATE — a shallow open-front tasset band, hip-slung, gap at the front seam
     (void shows through). ===== */
  {
    const bands = [
      { y: L.hipY - 0.06, rx: 0.135, rz: 0.115, hex: P.plateDk },
      { y: L.hipY + 0.05, rx: 0.150, rz: 0.125, hex: P.plate },
    ];
    stack(bands.map(b => ({ ...b })), 10, { xform: xf, skip: { 0: [0, 1] } });
    // interior void glimpse through the front gap
    const a = xf(V(-0.06, L.hipY - 0.04, 0.11)), b = xf(V(0.06, L.hipY - 0.04, 0.11));
    const c = xf(V(0.05, L.hipY + 0.04, 0.10)), d = xf(V(-0.05, L.hipY + 0.04, 0.10));
    quad(a, b, c, d, P.void, 0.02);
  }

  /* ===== TRAILING LEGS — bent, loose, dangling behind/below as counter-mass to the forward
     dive; hollow greaves (thin tubes) with an ankle gap void, feet loose/pointed, not planted. ===== */
  for(const s of [-1, 1]){
    const hip = xf(V(s * 0.095, L.hipY - 0.02, -0.02));
    const knee = V(hip.x + s * 0.03, hip.y - 0.20, hip.z - 0.09);
    const ankle = V(hip.x + s * 0.05, hip.y - 0.34, hip.z - 0.02);
    const toe = V(hip.x + s * 0.045, hip.y - 0.37, hip.z + 0.10);
    tube(hip, knee, 0.062, 0.048, 8, P.plate, { capA: { hex: P.plateDk } });
    tube(knee, ankle, 0.046, 0.032, 8, P.plateDk, { capB: { hex: P.trim, lift: 0.01 } });
    tube(ankle, toe, 0.036, 0.020, 6, P.gauntletDk, { capB: { hex: P.gauntletDk } });
  }

  /* ===== RIBCAGE / BREASTPLATE + BACKPLATE — the hollow read's centerpiece: two SEPARATE
     ornate shells (front + back) with a real gap at each side seam, void showing through both
     gaps (law 1 hollow construction). ===== */
  {
    const chestFront = [
      xf(V(-0.185, L.ribY, 0.14)), xf(V(0.185, L.ribY, 0.14)),
      xf(V(0.205, L.chestY, 0.155)), xf(V(-0.205, L.chestY, 0.155)),
    ];
    quad(chestFront[0], chestFront[1], chestFront[2], chestFront[3], P.plate, 0.05);
    // ornate ridge trim down the sternum
    const ra = xf(V(-0.02, L.ribY, 0.152)), rb = xf(V(0.02, L.ribY, 0.152));
    const rc = xf(V(0.017, L.chestY, 0.165)), rd = xf(V(-0.017, L.chestY, 0.165));
    quad(ra, rb, rc, rd, P.trim, 0.04);

    const backPlate = [
      xf(V(-0.175, L.ribY, -0.135)), xf(V(0.175, L.ribY, -0.135)),
      xf(V(0.19, L.chestY, -0.145)), xf(V(-0.19, L.chestY, -0.145)),
    ];
    quad(backPlate[1], backPlate[0], backPlate[3], backPlate[2], P.plateDk, 0.05);

    // side gaps: void visible between chest-front and back-plate on both flanks
    for(const s of [-1, 1]){
      const fa = xf(V(s * 0.185, L.ribY, 0.14)), fb = xf(V(s * 0.205, L.chestY, 0.155));
      const ba = xf(V(s * 0.175, L.ribY, -0.135)), bb = xf(V(s * 0.19, L.chestY, -0.145));
      quad(s > 0 ? fa : ba, s > 0 ? ba : fa, s > 0 ? bb : fb, s > 0 ? fb : bb, P.void, 0.02);
    }
    // faint interior far-wall so the gap doesn't read as a pure hole (starfield-void dark, law 3 floor)
    const fw = [xf(V(-0.05, L.ribY + 0.02, 0)), xf(V(0.05, L.ribY + 0.02, 0)),
      xf(V(0.045, L.chestY - 0.02, 0)), xf(V(-0.045, L.chestY - 0.02, 0))];
    quad(fw[0], fw[1], fw[2], fw[3], P.voidLt, 0.06);
  }

  /* ===== WINGED PAULDRONS — each shoulder flares into 3 raked blade-vanes fanning OUT and
     BACK (never up past the helm — r1 self-correction below), ornate and distinctly larger
     than a common shoulder guard (law 2 feature checklist #3). R1 SELF-CORRECTION: the first
     pass let the tallest vane rise above the helm (read as a stray antenna/bird-head) and used
     a flat dark hex on one shoulder that vanished into the void (law 3 failure). Fixed: vanes
     now stay BELOW crown height and fan outward/backward only, and BOTH shoulders use the same
     bright outer face (P.plate) with only the thin inner gusset going dark, so neither side
     disappears against the void.
     R2 SELF-CORRECTION (flag: far pauldron still goes dark — facing-normal artifact): probed the
     actual visible winding per shoulder — with this pitched pose/camera the s>0 (far) shoulder
     shows its INNER GUSSET face to camera (the "outer" P.plate quad is back-facing/culled there),
     while the s<0 (near) shoulder shows its outer face as intended. So the far side was reading
     P.plateDk under directional dimming — near-invisible against the void. Fix: the far shoulder's
     camera-facing gusset now uses P.plateFar (near-white steel) so it still clears the law-3
     body-mass floor after shading; the near shoulder is untouched (its outer face already reads
     fine). ===== */
  for(const s of [-1, 1]){
    const root = xf(V(s * 0.195, L.shldY - 0.015, 0.02));
    const vaneLens = [0.185, 0.145, 0.105];
    for(let i = 0; i < 3; i++){
      const rake = 0.55 + i * 0.28;          // each vane rakes further back, outward not upward
      const drop = 0.02 + i * 0.045;         // and sits progressively LOWER (never above the root)
      const len = vaneLens[i];
      const tip = xf(V(s * (0.195 + len * 0.95), L.shldY - 0.015 - drop, 0.02 - len * rake));
      const wA = xf(V(s * (0.205 + i * 0.015), L.shldY + 0.05 - i * 0.015, 0.06 - i * 0.02));
      const wB = xf(V(s * (0.205 + i * 0.015), L.shldY - 0.06 - i * 0.02, -0.01 - i * 0.03));
      quad(wA, tip, wB, root, P.plate, 0.05);           // bright outer face — near shoulder (law 3)
      quad(root, wB, tip, wA, s > 0 ? P.plateFar : P.plateDk, 0.06);   // R2: far shoulder's camera-
                                                          // facing gusset brightened to compensate
      // bright edge-trim bevel hugging the vane's outer (leading) rake — a slim second strip
      // offset toward the void side so it reads as a distinct bright line, not a doubled face
      const wAedge = V(wA.x, wA.y - 0.01, wA.z);
      const tipEdge = V(tip.x, tip.y - 0.008, tip.z);
      quad(wA, tip, tipEdge, wAedge, P.plateLt, 0.03);
    }
  }

  /* ===== NECK GAP + BOWED HELM — the neck is an open void gap (no gorget plate), the helm
     itself hollow with the glow-slit as its only feature (SIGNATURE A). ===== */
  {
    const neckA = xf(V(-0.06, L.neckY - 0.02, 0.03)), neckB = xf(V(0.06, L.neckY - 0.02, 0.03));
    const neckC = xf(V(0.05, L.jawY - 0.01, 0.02)), neckD = xf(V(-0.05, L.jawY - 0.01, 0.02));
    quad(neckA, neckB, neckC, neckD, P.void, 0.02);

    // helm shell — an elongated ornate dome bowed forward with the pitch, capped and lightly
    // faceted (not a smooth sphere) so it reads as forged plate
    const helmC = xf(V(0, (L.jawY + L.crownY) / 2, 0.10));
    const dome = ring(V(helmC.x, helmC.y - 0.06, helmC.z - 0.02), V(0, 1, 0), 0.095, 0.11, 10, Math.PI / 10);
    const domeTop = ring(V(helmC.x, helmC.y + 0.03, helmC.z - 0.01), V(0, 1, 0), 0.075, 0.085, 10, Math.PI / 10);
    stitch([dome, domeTop], () => P.plate);
    capFan(domeTop, V(helmC.x, helmC.y + 0.075, helmC.z - 0.01), P.plateDk);
    capFan(dome, V(helmC.x, helmC.y - 0.10, helmC.z + 0.01), P.plateDk, true);
    // brow trim bevel
    const brow = ring(V(helmC.x, helmC.y - 0.02, helmC.z - 0.015), V(0, 1, 0), 0.098, 0.113, 10, Math.PI / 10);
    stitch([dome, brow], () => P.plateLt);

    // GLOW SLIT — the sole face, a bright horizontal band across the front of the visor void.
    // R2 SELF-CORRECTION (flag: slit faint at scale): probed with a debug hex swap and found the
    // slit's quad winding (TL,TR,BR,BL) produced a normal facing -z — BACK-FACING/culled from this
    // camera, i.e. it rendered NOTHING at all (not merely dim). Reordered to (BL,BR,TR,TL) to match
    // the chestFront quad's working +z-facing winding. Also: the brow ring's front surface sits at
    // z~helmC.z+0.113, so the old slit at z+0.105 sat FLUSH/recessed against the dome instead of
    // reading proud of it — enlarged the band and pushed it to z+0.135, clear of the dome surface.
    const slitY = helmC.y - 0.015;
    const sa = V(helmC.x - 0.10, slitY + 0.028, helmC.z + 0.135);
    const sb = V(helmC.x + 0.10, slitY + 0.028, helmC.z + 0.135);
    const sc = V(helmC.x + 0.10, slitY - 0.028, helmC.z + 0.135);
    const sd = V(helmC.x - 0.10, slitY - 0.028, helmC.z + 0.135);
    // dark void recess behind the slit (the "empty helm" read) then the bright glow line in front
    // — all three quads reordered (d,c,b,a) for the corrected +z-facing winding.
    quad(V(sd.x, sd.y - 0.02, sd.z - 0.045), V(sc.x, sc.y - 0.02, sc.z - 0.045),
      V(sb.x, sb.y + 0.02, sb.z - 0.045), V(sa.x, sa.y + 0.02, sa.z - 0.045), P.void, 0.02);
    quad(sd, sc, sb, sa, P.glow, 0.03);
    quad(V(sd.x + 0.012, sd.y - 0.006, sd.z + 0.002), V(sc.x - 0.012, sc.y - 0.006, sc.z + 0.002),
      V(sb.x - 0.012, sb.y + 0.006, sb.z + 0.002), V(sa.x + 0.012, sa.y + 0.006, sa.z + 0.002), P.glowCore, 0.02);
  }

  /* ===== ARMS + GAUNTLETS — both gauntlets grip the greatsword's crossguard directly below
     the bowed helm, elbows bent (~110-140deg), shoulders riding the pauldrons (POSE-ANATOMY 2/3). ===== */
  const gripPoint = xf(V(0, L.hipY + 0.10, 0.22));
  for(const s of [-1, 1]){
    const shoulder = xf(V(s * 0.195, L.shldY - 0.03, 0.03));
    const elbow = V(shoulder.x + s * 0.02, shoulder.y - 0.16, shoulder.z + 0.10);
    const wrist = V(gripPoint.x + s * 0.045, gripPoint.y + 0.01, gripPoint.z - 0.01);
    tube(shoulder, elbow, 0.058, 0.048, 8, P.plate, { capA: { hex: P.plateDk } });
    tube(elbow, wrist, 0.046, 0.040, 8, P.plateDk, { capB: { hex: P.gauntlet, lift: 0.014 } });
    blob(wrist.x, wrist.y, wrist.z, 0.05, 0.045, 0.05, P.gauntlet, 7, 4);
  }

  /* ===== GREATSWORD — held point-down, hanging from the gripPoint straight toward the ground
     (the descent's downward gesture line extended to its tip), a bright fuller carrying the
     signature the full length of the blade (SIGNATURE B). ===== */
  {
    const guard = V(gripPoint.x, gripPoint.y - 0.06, gripPoint.z + 0.01);
    const tip = V(gripPoint.x - 0.01, guard.y - 0.58, gripPoint.z + 0.05);
    const sections = [
      { t: 0.00, w: 0.052, th: 0.014 },
      { t: 0.30, w: 0.044, th: 0.012 },
      { t: 0.62, w: 0.032, th: 0.009 },
      { t: 0.88, w: 0.018, th: 0.006 },
    ];
    const along = (t) => V(guard.x + (tip.x - guard.x) * t, guard.y + (tip.y - guard.y) * t, guard.z + (tip.z - guard.z) * t);
    const rings = sections.map(sec => {
      const c = along(sec.t);
      return [V(c.x - sec.w, c.y, c.z), V(c.x, c.y, c.z + sec.th), V(c.x + sec.w, c.y, c.z), V(c.x, c.y, c.z - sec.th)];
    });
    for(let i = 0; i < rings.length - 1; i++){
      const a = rings[i], b = rings[i + 1];
      quad(a[0], a[1], b[1], b[0], P.fuller, 0.03);   // bright fuller face — always toward camera
      quad(a[1], a[2], b[2], b[1], P.blade, 0.05);
      quad(a[2], a[3], b[3], b[2], P.bladeDk, 0.05);
      quad(a[3], a[0], b[0], b[3], P.blade, 0.05);
    }
    capFan(rings.at(-1), tip, P.fuller);
    // crossguard — a squat bar perpendicular to the blade at the guard end
    const gx = 0.10, gy = 0.018;
    quad(V(guard.x - gx, guard.y - gy, guard.z), V(guard.x + gx, guard.y - gy, guard.z),
      V(guard.x + gx, guard.y + gy, guard.z), V(guard.x - gx, guard.y + gy, guard.z), P.trim, 0.04);
    quad(V(guard.x - gx, guard.y, guard.z - 0.02), V(guard.x + gx, guard.y, guard.z - 0.02),
      V(guard.x + gx, guard.y, guard.z + 0.02), V(guard.x - gx, guard.y, guard.z + 0.02), P.trimDk, 0.04);
    // hilt above the guard, up into the gripped hands
    tube(guard, V(guard.x, guard.y + 0.09, guard.z), 0.026, 0.022, 6, P.hilt, {});
    blob(guard.x, guard.y + 0.10, guard.z, 0.028, 0.026, 0.028, P.pommel, 6, 3);
  }
}
