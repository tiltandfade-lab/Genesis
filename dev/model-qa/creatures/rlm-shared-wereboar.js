/* dev/model-qa/creatures/rlm-shared-wereboar.js — the WEREBOAR landmark table (HUMANOID-BOAR
   HYBRID family, Medium, CR 4, CROSS-REALM shared body), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, catchall-w1 cell 4). CROSS-REALM SHARED BODY: authored to
   the neutral core identity — the tusked bristle-back hybrid, no single realm's palette gimmick.
   Completes the were-trio with werewolf (rlm-gloom-werewolf.js) / wererat (rlm-broken-fang-
   wererat-tomb-rat.js). FLAVOR: lab-escapee brute, stitched tissue (chrome-skin undertone in the
   fur/scar palette, not a literal metal skin).

   ANATOMY: hybrid rig — bipedal HUMANOID stance carrying the boar's proportion dial from
   ANATOMY-CANON's UNGULIGRADE section, INVERTED per canon: front-heavy, a massive humped
   shoulder/neck mass as the tallest point, small weak hips, short thick legs. Front limbs are
   humanoid arms (fists), not front hooves — the hybrid reads "boar torso grafted onto a man,"
   not "boar on two legs."

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. FRONT-HEAVY HUMPED TORSO (ANATOMY-CANON boar dial, chief capture criterion, law 4):
        massive humped shoulder/neck mass as the single tallest point, ribcage flaring wide and
        deep, the spine sloping DOWN from the hump to small narrow hips — the exact inversion of
        a human's level shoulder-to-hip proportion.
     2. SIGNATURE — the tusked snout head: a low heavy wedge skull (no real neck — head runs
        straight into the shoulder hump), a blunt tusked snout, two curved upward-hooking tusks
        breaking the jawline, small deep-set eyes, triangular pricked ears.
     3. Bristle ridge — a row of coarse spine tufts riding the back edge of the hump/neck/spine,
        breaking the humanoid silhouette into boar territory (the wererat/werewolf convention).
     4. Humanoid arms ending in clenched fists (this hybrid doesn't have front hooves) — both
        held low and back behind the body, cocked for the charge, thick and stocky, matching the
        front-heavy read rather than lean human proportions.
     5. Short thick legs (~0.35-0.40H per canon), stubby cloven-hoof feet, small weak hips/rump —
        the "small hips" half of the boar dial, load-bearing but visually minor against the hump.
     6. Costume/curse tells — patchy stitched scarring across the flank (the lab-escapee "stitched
        tissue" read), a torn strap/collar remnant at the throat.

   POSE SENTENCE: the gore-charge wind-up — head lowered tusks-first with the whole spine's hump
   thrust forward-and-down over it, one shoulder dropped lower than the other (the coming charge's
   lead side), both fists clenched low and pulled back behind the hips, weight cocked back onto
   the rear leg a heartbeat before the launch — never an at-attention pig standing upright, always
   the bull about to run you down.

   SPINE-GESTURE SENTENCE: the spine runs from small hips tilted back (weight-loading the rear
   leg) up through a steepening forward lean to the humped shoulder mass, which drops asymmetric
   (one side lower — the charging lead shoulder), then the head continues the forward-down line
   past the shoulders, tusks leading the whole gesture — a single downhill diagonal from tail to
   tusk-tip, the loudest line in the silhouette, with both fists trailing low-and-back as the
   counterweight that reads "about to launch," never a plumb-line torso with acting arms.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['catchall-w1'], cell 4, fn buildWereboar). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack, blob } from '../probe-lib.js';
import { buildBase } from '../parts.js';

function norm(dir){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return V(dir[0] / n, dir[1] / n, dir[2] / n);
}

export function buildWereboar(){
  /* ---------- PALETTE (neutral cross-realm register — dirty umber bristle hide vs. bright pale
     tusk/eye/scar-seam tones so the signature clears the void per law 3; no single realm's
     gimmick colors). ---------- */
  /* R1 CRITIC FIX: r1 render read too dark/murky overall — the whole hide ladder sat too close
     together in value and too low, so the body mass barely cleared the void even though the hex
     values technically passed law 3's floor (the werewolf R2 lesson: lift the WHOLE ladder, not
     just the signature). Lifted hide/hideDk/hideLt across the board, brightened the eye and
     thickened the tusks so both clear the void and read as two distinct hooks from the front. */
  const P = {
    hide: 0xa8916c, hideDk: 0x7c684c, hideLt: 0xc4ad82,   // bristle-hide body mass (R1: lifted)
    snout: 0xc8ac82, snoutDk: 0x967a56,                    // dedicated bright tone for the head signature (R1: lifted)
    tusk: 0xf5ecd6, tuskDk: 0xd4c6a4,
    mouth: 0x160f0c, nose: 0x201812,
    eye: 0xf05838, eyeGlow: 0xffa068,                       // hot lab-glow red eyes (R1: brighter)
    fist: 0x847052, fistDk: 0x5a4c38,                       // stocky humanoid fists (R1: lifted off hide)
    hoof: 0x362c20,
    scar: 0x9c8264, stitch: 0xc4b090,                       // stitched-tissue lab-escapee tell
    strap: 0x3c3226,
    disc: 0x2a251e, discTop: 0x342c22,
  };

  /* ===== SPINE — small hips tilted back, steepening forward lean into a humped, asymmetric-drop
     shoulder mass, head continuing the forward-down diagonal past it (tusks lead). ===== */
  const L = {
    hipY: 0.30, waistY: 0.46, ribY: 0.63, humpY: 0.82, shldY: 0.90, neckY: 0.86,
  };
  /* cz drifts FORWARD (+z) as y rises — the downhill charge-lean diagonal, hips held back. */
  const spineCz = { hip: -0.03, waist: 0.02, rib: 0.09, hump: 0.18, shld: 0.20 };

  /* torso: small narrow hips -> flaring ribcage -> the humped shoulder mass (tallest point, per
     canon's "front-heavy, humped shoulders as the tallest point"). */
  const torsoRings = stack([
    { y: L.hipY,   rx: 0.130, rz: 0.110, cz: spineCz.hip,   hex: P.hideDk },
    { y: L.waistY, rx: 0.165, rz: 0.145, cz: spineCz.waist, hex: P.hide },
    { y: L.ribY,   rx: 0.225, rz: 0.205, cz: spineCz.rib,   hex: P.hideLt },
    { y: L.humpY,  rx: 0.255, rz: 0.230, cz: spineCz.hump,  hex: P.hide },
  ], 10, {});
  /* one shoulder dropped lower than the other — the charging lead side (screen +x drops). */
  {
    const leadHump = ring(V(0.10, L.humpY - 0.055, spineCz.hump + 0.02), V(0, 1, 0), 0.230, 0.205, 10, Math.PI / 10);
    const trailHump = ring(V(-0.06, L.shldY, spineCz.shld), V(0, 1, 0), 0.195, 0.175, 10, Math.PI / 10);
    stitch([torsoRings.at(-1), leadHump], () => P.hide);
    stitch([leadHump, trailHump], () => P.hideDk);
    capFan(trailHump, V(-0.04, L.shldY + 0.03, spineCz.shld + 0.02), P.hideDk);
    var humpCrown = leadHump; // reused as the fore-point the head continues from
  }

  /* bristle ridge — coarse spine tufts riding the back edge (-z) of the rib/hump bands, breaking
     the humanoid silhouette into boar territory (were-trio convention). */
  {
    const ridgeBands = [
      { y: L.ribY,  cz: spineCz.rib,  rz: 0.205 },
      { y: L.humpY, cz: spineCz.hump, rz: 0.230 },
      { y: L.humpY + 0.06, cz: spineCz.hump + 0.03, rz: 0.190 },
    ];
    ridgeBands.forEach((b) => {
      const root = V(0, b.y, b.cz - b.rz);
      const tip = V(0, b.y + 0.09, b.cz - b.rz - 0.05);
      tube(root, tip, 0.030, 0.008, 4, P.hideDk, { raz: 0.06, rbz: 0.014, capB: { hex: P.hideDk } });
    });
  }

  /* stitched-tissue lab-escapee tell — patchy scar seams on the flank. */
  {
    quad(V(-0.22, L.ribY + 0.02, spineCz.rib - 0.05), V(-0.09, L.ribY + 0.08, spineCz.rib - 0.02),
         V(-0.11, L.ribY - 0.08, spineCz.rib + 0.02), V(-0.24, L.ribY - 0.10, spineCz.rib - 0.04), P.scar, 0.05);
    for(let i = 0; i < 3; i++){
      const t = i / 2, x = -0.22 + t * 0.11, y = L.ribY - 0.05 + t * 0.10;
      quad(V(x - 0.012, y, spineCz.rib - 0.05), V(x + 0.012, y, spineCz.rib - 0.05),
           V(x + 0.008, y - 0.014, spineCz.rib - 0.048), V(x - 0.008, y - 0.014, spineCz.rib - 0.048), P.stitch, 0.02);
    }
    /* torn strap/collar remnant at the throat */
    const c0 = ring(V(0, L.neckY - 0.02, spineCz.hump + 0.05), V(0, 1, 0), 0.13, 0.11, 8, Math.PI / 8);
    const c1 = ring(V(0, L.neckY + 0.04, spineCz.hump + 0.06), V(0, 1, 0), 0.125, 0.105, 8, Math.PI / 8);
    stitch([c0, c1], () => P.strap, { 0: [2, 3] });
  }

  /* ===== HEAD — low heavy wedge, no real neck (runs straight into the hump), continuing the
     forward-down charge diagonal, tusks leading. ===== */
  const headBaseC = V(0.06, L.humpY + 0.03, spineCz.hump + 0.10);
  const skull = stack([
    { y: headBaseC.y,        rx: 0.115, rz: 0.120, cz: headBaseC.z,        hex: P.snoutDk },
    { y: headBaseC.y - 0.03, rx: 0.125, rz: 0.130, cz: headBaseC.z + 0.06, hex: P.snout },
    { y: headBaseC.y - 0.06, rx: 0.095, rz: 0.100, cz: headBaseC.z + 0.15, hex: P.snoutDk },
  ], 8, {});
  const crownC = V(0.06, headBaseC.y + 0.01, headBaseC.z + 0.02);

  /* blunt tusked snout — low, forward, leading the charge diagonal. */
  const snoutBase = V(0.06, headBaseC.y - 0.06, headBaseC.z + 0.15);
  const snoutTip = snoutBase.clone().addScaledVector(norm([0, -0.18, 0.98]), 0.16);
  tube(snoutBase, snoutTip, 0.095, 0.075, 8, P.snout, { capB: { hex: P.nose } });
  quad(snoutTip.clone().add(V(-0.03, 0.01, 0)), snoutTip.clone().add(V(0.03, 0.01, 0)),
       snoutTip.clone().add(V(0.018, -0.02, 0.01)), snoutTip.clone().add(V(-0.018, -0.02, 0.01)), P.nose, 0.02);

  /* jaw/mouth void beneath the snout */
  quad(snoutBase.clone().add(V(-0.07, -0.05, -0.02)), snoutBase.clone().add(V(0.07, -0.05, -0.02)),
       snoutTip.clone().add(V(0.04, -0.03, 0)), snoutTip.clone().add(V(-0.04, -0.03, 0)), P.mouth, 0.02);

  /* two curved upward-hooking tusks breaking the jawline — the signature, dedicated bright tone.
     R1 CRITIC FIX: r1's tusks were thin (0.026 base) and swept mostly INTO the head (small +x/-x
     lateral component), so only one survived vertex-snap as a faint sliver. Thickened the base,
     pushed the lateral hook wider so BOTH clear the snout's silhouette from the front. */
  for(const s of [-1, 1]){
    const tBase = snoutBase.clone().add(V(s * 0.065, -0.06, 0.06));
    const tMid = tBase.clone().addScaledVector(norm([s * 0.7, 0.20, 0.75]), 0.11);
    const tTip = tMid.clone().addScaledVector(norm([s * 0.85, 0.85, 0.20]), 0.085);
    tube(tBase, tMid, 0.034, 0.026, 5, P.tusk);
    tube(tMid, tTip, 0.026, 0.008, 5, P.tuskDk, { capB: { hex: P.tuskDk } });
  }

  /* small deep-set hot eyes, angled forward-down (tracking the target of the charge). R1: enlarged
     — the r1 render's eye dissolved to a single dim pixel. */
  for(const s of [-1, 1]){
    const ex = 0.06 + s * 0.075, ey = headBaseC.y + 0.005, ez = headBaseC.z + 0.03;
    blob(ex, ey, ez, 0.028, 0.025, 0.022, P.eye, 6, 4);
    blob(ex + s * 0.007, ey, ez + 0.009, 0.015, 0.015, 0.013, P.eyeGlow, 4, 2);
  }

  /* triangular pricked ears, seated on the skull crown per the ear-construction rule (surface,
     real 3D volume, 3 side faces). */
  for(const s of [-1, 1]){
    const cx = crownC.x + s * 0.075, ez = crownC.z - 0.02;
    const a = V(cx - 0.035, crownC.y, ez - 0.03);
    const b = V(cx + 0.035, crownC.y, ez + 0.015);
    const c = V(cx + 0.005, crownC.y, ez + 0.035);
    const apex = V(cx + s * 0.015, crownC.y + 0.095, ez - 0.01);
    quad(a, b, apex, apex, P.snout, 0.03);
    quad(b, c, apex, apex, P.snoutDk, 0.03);
    quad(c, a, apex, apex, P.snout, 0.03);
  }

  /* ===== ARMS — humanoid, both fists held LOW and BACK behind the hips, cocked for the charge
     (this hybrid keeps humanoid front limbs, not front hooves). Stocky, thick — matching the
     front-heavy read, not lean human proportions. ===== */
  /* R1 CRITIC FIX: r1's fists (elbow/wrist pulled to x~0.25-0.29) sat almost entirely BEHIND the
     torso from the render camera, so the whole arm signature vanished into the silhouette.
     Widened the lateral reach (elbow/wrist x pushed out past the hip band's own radius, the
     vampire-spawn/werewolf-proven fix for "limb hidden under torso") so both fists break clear
     of the body outline while still reading low-and-back. */
  {
    for(const s of [-1, 1]){
      const sh = V(s * 0.235, L.shldY - 0.05, spineCz.shld - 0.02);
      const el = V(s * 0.340, L.hipY + 0.08, spineCz.hip - 0.08);
      const wr = V(s * 0.330, L.hipY - 0.08, spineCz.hip - 0.18);
      tube(sh, el, 0.068, 0.052, 6, P.hide);
      tube(el, wr, 0.050, 0.038, 6, P.hideDk);
      blob(wr.x, wr.y, wr.z, 0.046, 0.040, 0.042, P.fist, 6, 4);
      /* stubby clenched knuckles */
      for(const d of [[0.25, -0.30, -0.85], [0.05, -0.42, -0.90], [-0.15, -0.38, -0.86], [-0.32, -0.22, -0.78]]){
        const dn = norm([s * d[0], d[1], d[2]]);
        const end = wr.clone().addScaledVector(dn, 0.045);
        tube(wr, end, 0.020, 0.013, 4, P.fistDk, { capB: { hex: P.fistDk } });
      }
    }
  }

  /* ===== LEGS — short and thick per canon (~0.35-0.40H), small weak hips/rump, bipedal stance,
     weight cocked onto the REAR leg (screen -z, trailing) a heartbeat before the launch. Stubby
     cloven-hoof feet, no digitigrade zigzag (this is the humanoid-stance dial, not the quadruped
     family). ===== */
  {
    const legDef = [
      { s: -1, hipZ: spineCz.hip + 0.02, footZ: 0.18, kneeZ: 0.10, thick: 1.05 },  // lead/front, weight-light
      { s:  1, hipZ: spineCz.hip - 0.06, footZ: -0.16, kneeZ: -0.06, thick: 1.15 }, // rear/trail, weight-loaded
    ];
    for(const d of legDef){
      const hip = V(d.s * 0.10, L.hipY, d.hipZ);
      const knee = V(d.s * 0.115, L.hipY - 0.15, d.kneeZ);
      const foot = V(d.s * 0.11, 0.045, d.footZ);
      tube(hip, knee, 0.075 * d.thick, 0.058 * d.thick, 6, P.hide);
      tube(knee, foot, 0.056 * d.thick, 0.040 * d.thick, 6, P.hideDk, { capB: { hex: P.hideDk } });
      /* stubby cloven hoof — a short foot block split down the middle */
      const ball = V(foot.x, 0.025, foot.z + 0.045);
      tube(foot, ball, 0.038, 0.032, 6, P.hoof);
      for(const cx of [-0.014, 0.014]){
        quad(V(ball.x + cx - 0.012, 0.006, ball.z), V(ball.x + cx + 0.012, 0.006, ball.z),
             V(ball.x + cx + 0.008, 0.002, ball.z + 0.028), V(ball.x + cx - 0.008, 0.002, ball.z + 0.028), P.hoof, 0.02);
      }
    }
  }

  /* base disc (Medium: r=0.42) */
  buildBase(P);
}
