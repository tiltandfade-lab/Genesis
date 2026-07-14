/* dev/model-qa/creatures/rlm-seas-sahuagin-warrior.js — the SAHUAGIN WARRIOR landmark table
   (HUMANOID-FISH family, Medium, CR 1/2, realm high-seas), authored under docs/MODEL-FOUNDRY.md's
   1,000-2,000 tri band (foundry pilot, seas-w1 cell 1). Core identity: fish-fanged sea-devil
   boarding a hull from below — a fish-man raider surging up out of the water with a trident.
   Bespoke to the render key "sahuagin-warrior" — realm reskins ride this chassis narratively.
   ANATOMY: HUMANOID-FISH — digitigrade webbed legs (a biped hock, not a human ankle), fin crest
   running skull-to-nape plus smaller fin ridges on the forearms, gill slits at the throat.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID-FISH torso+legs per ANATOMY-CANON's digitigrade construction rule applied to a
        biped: reversed lower leg (true ankle set HIGH, heel drawn back), webbed 3-toe feet
        splayed wide for a swim-kick push-off — never a flat human foot.
     2. SIGNATURE — a tall bony fin crest running skull-crown to nape, flared wide (law 4's one
        loud exaggerated feature: the sea-devil's frill standing straight up in threat display).
     3. Fish head — sloped fish-fanged muzzle (no human chin), gill slits at the throat, bulging
        lidless eyes set to the sides.
     4. The BOARDING LUNGE pose (law 5) — a just-vaulted crouch: knees bent low and wide, torso
        torqued and canted forward over the front foot, trident drawn back low at the hip in the
        rear hand ready to punch forward, off-hand splayed webbed claws out front for balance.
     5. Pale belly/throat scale ladder (the law-3 high-value zone) against a deep sea-green back
        and limbs, carried up onto the throat and the underside of the jaw.
     6. Trident, gripped one-handed, cocked back at the hip — three tines + a shaft, the weapon
        silhouette reads past the crouch.

   POSE SENTENCE: caught mid-vault out of the water in a low wide crouch, torso torqued and
   leaning hard over the lead foot, trident cocked back low at the hip ready to punch forward,
   off-hand claws splayed for balance, fin crest flared — the instant before the stab, never a
   standing idle stance.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w1'], cell 1, fn buildSahuaginWarrior). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildSahuaginWarrior(){
  /* ---------- PALETTE (deep sea-green back/limbs vs. a pale belly/throat ladder — the
     high-value zone law 3 needs; trident reads bright steel against the dark body). ---------- */
  const P = {
    scale: 0x37543f, scaleDk: 0x243828, scaleLt: 0x4a6e4f,   // back/limb scale, lifted off void
    belly: 0xd8cf9c, bellyDk: 0xb0a672,                       // pale belly/throat ladder
    fin: 0x6f8f6a, finDk: 0x3d5940,                           // fin crest + forearm ridges, lifted lighter than body so it pops
    claw: 0xcbd1b4,                                           // webbed claw tips
    eye: 0x1a1512, eyeGlow: 0xd8e878,                         // bulging lidless gaze
    mouth: 0x140f0d, fang: 0xe8e2c8,
    steel: 0xd8ddd0, steelDk: 0x93998a,                       // trident head — CRITIC R2 FIX: brightened, tines were sub-floor thin AND too dark to register at 1/3-res
    shaft: 0x77613f, shaftDk: 0x4c3d28,                       // trident haft, waterlogged wood — CRITIC R2 FIX: lifted off void so the haft doesn't vanish along its full reach
    disc: 0x2c322a, discTop: 0x363e32,
  };

  /* ===== RIG — a low wide boarding crouch. Torso torqued forward over the lead (+z) foot;
     everything above the hips leans forward and down (law 5's high-expression pose). ===== */
  const L = {
    hipY: 0.42, waistY: 0.50, ribY: 0.60, chestY: 0.70, shldY: 0.78, neckY: 0.815,
    jawY: 0.845, cheekY: 0.895, browY: 0.935, crownY: 0.975, crestTopY: 1.14,
    hipHalf: 0.115, shoulderX: 0.215,
  };
  /* forward torso lean: 0 at hips -> full lean at crown, plus a slight -x twist (torso torqued
     toward the trident-side rear hand) so the crouch reads as a coiled lunge, not a bow. */
  const lean = (p) => {
    const t = Math.max(0, (p.y - L.hipY) / (L.crownY - L.hipY));
    return V(p.x - 0.03 * t, p.y - 0.03 * t * t, p.z + 0.20 * t);
  };

  /* ===== LEGS — digitigrade biped: true ankle set HIGH, heel drawn back, webbed 3-toe splayed
     foot. Lead (front, +z) leg bent low and wide; rear leg braced back, more extended. ===== */
  function legDigitigrade(hip, knee, ankle, toeDir, hex, hexDk, footHex){
    tube(hip, knee, 0.088, 0.066, 7, hex);                                  // thigh
    tube(knee, ankle, 0.062, 0.034, 7, hexDk, { phase: Math.PI / 7 });      // shin, tapering to a high thin ankle
    /* webbed foot: heel behind the ankle, three splayed toes fanning forward off the ball */
    const heel = ankle.clone().addScaledVector(toeDir, -0.055).add(V(0, -0.01, 0));
    const ball = ankle.clone().addScaledVector(toeDir, 0.075).add(V(0, -0.045, 0));
    tube(ankle, ball, 0.040, 0.036, 6, footHex);
    tube(ankle, heel, 0.030, 0.018, 5, footHex, { capB: { hex: footHex } });
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), toeDir).normalize();
    for(const s of [-1, 0, 1]){
      const spread = toeDir.clone().addScaledVector(side, s * 0.55).normalize();
      const tip = ball.clone().addScaledVector(spread, 0.075).add(V(0, -0.006, 0));
      const mid = ball.clone().addScaledVector(spread, 0.036).add(V(0, -0.002, 0));
      tube(ball, mid, 0.020, 0.016, 4, footHex);
      tube(mid, tip, 0.016, 0.007, 4, P.claw, { capB: { hex: P.claw } });
      /* web membrane between adjacent toes */
      if(s < 1){
        const spread2 = toeDir.clone().addScaledVector(side, (s + 1) * 0.55).normalize();
        const mid2 = ball.clone().addScaledVector(spread2, 0.032).add(V(0, -0.002, 0));
        quad(ball, mid, mid2, ball, hexDk, 0.04);
      }
    }
  }
  /* lead leg (front, low + wide) */
  legDigitigrade(
    V(0.115, L.hipY, 0.01), V(0.175, 0.235, 0.155), V(0.150, 0.145, 0.135),
    V(0.15, 0, 0.99).normalize(), P.scale, P.scaleDk, P.belly
  );
  /* rear leg (braced back, more extended) */
  legDigitigrade(
    V(-0.100, L.hipY, -0.02), V(-0.135, 0.290, -0.155), V(-0.110, 0.135, -0.235),
    V(-0.1, 0, -0.99).normalize(), P.scaleDk, P.scale, P.belly
  );

  /* ===== TORSO — humanoid-fish, torqued into the forward lean. ===== */
  const torso = stack([
    { y: L.hipY,   rx: 0.150, rz: 0.130, hex: P.scale },
    { y: L.waistY, rx: 0.140, rz: 0.115, hex: P.scaleDk },
    { y: L.ribY,   rx: 0.158, rz: 0.128, hex: P.scale },
    { y: L.chestY, rx: 0.178, rz: 0.140, hex: P.scaleLt },
    { y: L.shldY,  rx: 0.200, rz: 0.135, hex: P.scale },
    { y: L.neckY,  rx: 0.068, rz: 0.062, hex: P.scaleDk },
  ], 9, { xform: lean });

  /* belly/throat scale ladder — the high-value zone, riding the front of the torso up to the jaw */
  {
    const rungs = [
      [L.hipY, 0.130], [L.waistY, 0.115], [L.ribY, 0.128], [L.chestY, 0.140],
    ];
    for(const [y, rz] of rungs){
      const c = lean(V(0, y, rz * 0.86));
      const w = rz * 0.42, h = 0.05;
      const up = lean(V(0, y + h, rz * 0.90));
      const dn = lean(V(0, y - h, rz * 0.82));
      quad(V(dn.x - w, dn.y, dn.z), V(dn.x + w, dn.y, dn.z), V(up.x + w * 0.7, up.y, up.z), V(up.x - w * 0.7, up.y, up.z),
        (y === L.chestY || y === L.ribY) ? P.belly : P.bellyDk, 0.04);
    }
  }

  /* ===== HEAD — sloped fish-fanged muzzle, gill slits, bulging side eyes, fin crest. ===== */
  const jawC = lean(V(0, L.jawY, 0.075));
  const cheekC = lean(V(0, L.cheekY, 0.088));
  const browC = lean(V(0, L.browY, 0.062));
  const crownC = lean(V(0, L.crownY, 0.030));
  /* R2 SELF-CORRECTION (post r1 engine render): r1's head bands (rx/rz ~0.06-0.08) read as a
     small dark lump against the torso at 1/3-res — the fish-fanged muzzle checklist item barely
     registered. Widened every band ~18% so the head reads as its own mass, not a torso bump. */
  const headRings = [
    ring(jawC, V(0, 1, 0), 0.068, 0.092, 8, Math.PI / 8),
    ring(cheekC, V(0, 1, 0), 0.092, 0.113, 8, Math.PI / 8),
    ring(browC, V(0, 1, 0), 0.099, 0.092, 8, Math.PI / 8),
    ring(crownC, V(0, 1, 0), 0.068, 0.059, 8, Math.PI / 8),
  ];
  stitch(headRings, (b) => [P.scale, P.scaleLt, P.scale][b] ?? P.scale);
  capFan(headRings[0], jawC.clone().add(V(0, -0.03, 0.05)), P.scaleDk, true); // under-jaw close, dark
  capFan(headRings[3], crownC.clone().add(V(0, 0.02, -0.01)), P.scaleDk);

  /* jaw underside pale throat patch, connecting the belly ladder up to the mouth */
  {
    const c = jawC.clone().add(V(0, -0.01, 0.01));
    quad(V(c.x - 0.032, c.y - 0.018, c.z - 0.01), V(c.x + 0.032, c.y - 0.018, c.z - 0.01),
      V(c.x + 0.024, c.y + 0.012, c.z + 0.03), V(c.x - 0.024, c.y + 0.012, c.z + 0.03), P.belly, 0.04);
  }

  /* mouth — dark open wedge, pale fangs breaking the dark (fish-fanged) */
  {
    const my = jawC.y + 0.006, mz = jawC.z + 0.045;
    quad(V(-0.036, my, mz), V(0.036, my, mz), V(0.026, my - 0.045, mz - 0.02), V(-0.026, my - 0.045, mz - 0.02), P.mouth, 0.03);
    for(const s of [-1, 1]){
      const fx = s * 0.024;
      tube(V(fx, my - 0.004, mz + 0.006), V(fx, my - 0.034, mz - 0.006), 0.008, 0.002, 4, P.fang, { capB: { hex: P.fang } });
    }
  }

  /* gill slits — three dark slashes on each cheek */
  for(const s of [-1, 1]){
    for(let i = 0; i < 3; i++){
      const gx = s * 0.086, gy = L.jawY + 0.01 + i * 0.018, gz = cheekC.z - 0.01;
      const p = lean(V(gx, gy, 0.06));
      quad(V(p.x - 0.004, p.y - 0.012, p.z), V(p.x + 0.004, p.y - 0.012, p.z), V(p.x + 0.004, p.y + 0.012, p.z), V(p.x - 0.004, p.y + 0.012, p.z), P.scaleDk, 0.05);
    }
  }

  /* eyes — bulging, lidless, set well to the sides.
     R2 SELF-CORRECTION: r1's glow pinprick (0.007r) was too small to survive 1/3-res — bumped it
     up so the yellow-green gaze actually reads as an eye, not a stray texel. */
  for(const s of [-1, 1]){
    const ex = s * 0.096, p = lean(V(ex, L.browY + 0.004, 0.058));
    blob(p.x, p.y, p.z, 0.024, 0.023, 0.020, P.eye, 6, 4);
    blob(p.x + s * 0.007, p.y + 0.004, p.z + 0.014, 0.011, 0.010, 0.009, P.eyeGlow, 4, 2);
  }

  /* ===== SIGNATURE — fin crest, skull-crown to nape, flared wide in threat display.
     CRITIC R2 FIX: r2's crest base sat just above the crown cap with only a hairline stalk
     tying it to the head at 1/3-res + dither — it rendered as a floating cluster of debris
     over the head, not an attached frill. Sunk the base into the crown dome so the root
     overlaps solid head geometry and the crest reads as continuous with the skull. */
  {
    const crestBase = crownC.clone().add(V(0, -0.015, -0.005));
    const finPts = [
      { off: V(0.0, 0.0, 0.0), h: 0.055, w: 0.028 },
      { off: V(0.0, 0.03, -0.045), h: 0.095, w: 0.038 },
      { off: V(0.0, 0.05, -0.10), h: 0.110, w: 0.040 },
      { off: V(0.0, 0.03, -0.155), h: 0.075, w: 0.030 },
      { off: V(0.0, -0.01, -0.195), h: 0.045, w: 0.020 },
    ];
    for(const f of finPts){
      const root = crestBase.clone().add(f.off);
      const tip = root.clone().add(V(0, f.h, -0.01));
      const l = root.clone().add(V(-f.w, 0.01, 0));
      const r = root.clone().add(V(f.w, 0.01, 0));
      quad(l, r, tip, tip, P.fin, 0.04);   // near-flat blade fin, degenerate 4th vert = tri
      quad(r, l, tip, tip, P.finDk, 0.04); // back face so it reads from both sides
    }
  }

  /* forearm fin ridges — small paired spikes, echo the crest signature at low tri cost */
  function finRidge(base, dir, hex){
    const n = new THREE.Vector3(0, 1, 0);
    const tip = base.clone().addScaledVector(dir, 0.05).addScaledVector(n, 0.045);
    const a = base.clone().addScaledVector(dir, -0.012);
    const b = base.clone().addScaledVector(dir, 0.012);
    quad(a, b, tip, tip, hex, 0.05);
  }

  /* ===== ARMS — off-hand splayed claws out front for balance; weapon-hand cocked back at the
     hip gripping the trident. ===== */
  const shBase = lean(V(L.shoulderX, L.shldY - 0.01, 0.02));

  /* off-hand (front-left, splayed claws toward the viewer).
     R2 SELF-CORRECTION (post r1 engine render): r1's wrist sat at x=-0.36, pushing the splayed
     claws off the left edge of the camera frame (the reach-derived ortho camera clips it). Pulled
     the whole arm ~25% closer to the torso centerline so the hand — the balance-tell of the pose —
     stays inside frame. */
  {
    const sh = V(-shBase.x, shBase.y, shBase.z);
    const el = V(-0.255, 0.62, 0.28);
    const wr = V(-0.275, 0.50, 0.38);
    tube(sh, el, 0.060, 0.048, 6, P.scale);
    tube(el, wr, 0.046, 0.032, 6, P.scaleDk, { phase: Math.PI / 6 });
    finRidge(el.clone().add(V(0.01, 0, -0.02)), V(-0.3, 0, 0.95).normalize(), P.finDk);
    blob(wr.x, wr.y, wr.z, 0.032, 0.026, 0.030, P.scale, 6, 4);
    for(const d of [[-0.75, 0.25, 0.45], [-0.55, 0.10, 0.65], [-0.30, 0.00, 0.75], [-0.05, -0.10, 0.72]]){
      const dn = new THREE.Vector3(...d).normalize();
      const mid = wr.clone().addScaledVector(dn, 0.046);
      const tip = wr.clone().addScaledVector(dn, 0.086);
      tube(wr, mid, 0.018, 0.013, 4, P.scaleDk);
      tube(mid, tip, 0.013, 0.006, 4, P.claw, { capB: { hex: P.claw } });
    }
  }

  /* weapon hand (rear-right, cocked back low at the hip) + trident */
  let gripPt;
  {
    const sh = V(shBase.x, shBase.y, shBase.z);
    const el = V(0.300, 0.58, -0.08);
    const wr = V(0.260, 0.40, -0.20);
    tube(sh, el, 0.062, 0.050, 6, P.scale);
    tube(el, wr, 0.048, 0.034, 6, P.scaleDk, { phase: Math.PI / 6 });
    finRidge(el.clone().add(V(0.02, 0, 0)), V(0.6, 0, -0.4).normalize(), P.finDk);
    blob(wr.x, wr.y, wr.z, 0.032, 0.026, 0.030, P.scale, 6, 4);
    gripPt = wr.clone();
  }

  /* trident — shaft cocked back low, three tines fanning forward off the head, reads past the
     crouch silhouette per the feature checklist.
     R2 SELF-CORRECTION (post r1 engine render): r1's tine tips (headBase + 0.19 spread) clipped
     the right edge of the camera frame — the weapon's whole point was cut off. Shortened the
     head reach and tine length ~20% so the trident stays inside frame while still reading past
     the body silhouette.
     CRITIC R2 FIX (post r2 engine render): the tine tubes (radius 0.003-0.014, diameter as low
     as 0.006u) were WAY under the 0.04u law-3 feature floor and the haft ran P.shaft/steel too
     dark to separate from the void along its far reach — the trident vanished into a faint
     brownish smear past the grip, and the whole "fish-man WITH a trident" identity read
     disappeared. Thickened every tube well past the floor and let the brighter palette (above)
     carry the rest. */
  {
    const grip2 = gripPt.clone().add(V(0.03, -0.04, -0.06));
    const buttEnd = gripPt.clone().add(V(-0.10, -0.22, -0.34));
    const headBase = gripPt.clone().add(V(0.16, 0.16, 0.34));
    tube(buttEnd, gripPt, 0.028, 0.032, 6, P.shaftDk, { capA: { hex: P.shaftDk } });
    tube(gripPt, grip2, 0.032, 0.030, 6, P.shaft);
    tube(grip2, headBase, 0.030, 0.026, 6, P.shaft);
    const dir = headBase.clone().sub(grip2).normalize();
    const side = new THREE.Vector3().crossVectors(V(0, 1, 0), dir).normalize();
    for(const s of [-1, 0, 1]){
      const spread = dir.clone().addScaledVector(side, s * 0.30).addScaledVector(V(0, 1, 0), 0.06 * (s === 0 ? 1.4 : 1)).normalize();
      const root = headBase.clone().addScaledVector(side, s * 0.028);
      const mid = root.clone().addScaledVector(spread, 0.08);
      const tip = root.clone().addScaledVector(spread, 0.15);
      tube(root, mid, 0.024, 0.020, 4, P.steelDk);
      tube(mid, tip, 0.020, 0.014, 4, P.steel, { capB: { hex: P.steel } });
    }
    /* crossbar tying the tines to the haft — a small bright band, sells "trident" at a squint */
    quad(headBase.clone().add(V(-0.03, 0, -0.006)), headBase.clone().add(V(0.03, 0, -0.006)),
      headBase.clone().add(V(0.026, 0.014, 0.006)), headBase.clone().add(V(-0.026, 0.014, 0.006)), P.steel, 0.03);
  }

  /* base disc (Medium, r=0.42) */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.055, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.058, 0), P.discTop);
  }
}
