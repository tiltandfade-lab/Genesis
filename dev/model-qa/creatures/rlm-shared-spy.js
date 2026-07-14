/* dev/model-qa/creatures/rlm-shared-spy.js — the SPY landmark table (HUMANOID family, Medium,
   CR 1, CROSS-REALM shared body), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry pilot, catchall-w1 cell 6). Core identity: the double-agent snitch feeding both sides
   (noir skin) — trench coat, low hat, everything concealed. Bespoke to the render key "spy";
   realm reskins ride this chassis — authored NEUTRAL, no single realm's palette gimmick.

   FEATURE CHECKLIST (the ~700-1100 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: coat-wrapped build, a lateral lean-gesture
        spine (not a plumb column) — the torso banks sideways as if a shoulder rests on an unseen
        wall, hips counter-pushed the other way for a real weight-bearing lean, not a static stand.
     2. SIGNATURE A — the FACE-VOID: a high popped collar wrapping the jaw + a low hat brim
        throwing a hard shadow band across the brow, leaving only a dark void where the face
        should read, punctuated by two small bright glint-eye points (law-3 high-value pinpricks
        against the void, >=140 RGB, >=0.04u so they survive 1/3-res).
     3. SIGNATURE B — the HALF-HIDDEN ENVELOPE: a pale (high-value) envelope shape caught
        mid-slip into the coat's inner lapel, one hand's fingers overlapping its near edge —
        the "feeding both sides" tell.
     4. Ankles crossed — the weight-bearing leg planted straight, the off leg crossed in front at
        the ankle, toe down, knee still bent (POSE-ANATOMY law 2) — the loitering-on-the-corner
        read, never a squared stance.
     5. Both hands read as pocketed by default (one forearm disappears into a coat pocket slit at
        the hip); the exception is the envelope hand, caught in the act rather than concealed.
     6. Costume breaks: a belted trench coat with tied-off belt tails hanging loose, triangular
        lapels breaking the coat's column, a short hat crown above the brim.

   POSE SENTENCE: the corner lean-and-glance — a shoulder banked into an unseen wall with the
   hips counter-pushed out for balance, ankles crossed in idle loitering, the collar cinched up
   and the hat brim dropped low so the face vanishes into shadow except two glint-eyes, the head
   snapped hard around over the leaning shoulder in an over-the-shoulder glance back toward the
   camera, one hand caught mid-slip tucking a pale envelope into the coat's inner lapel while the
   other stays pocketed — never an at-attention parade stand.

   SPINE-GESTURE SENTENCE: the spine runs from a hip band pushed away from the wall (the
   counterpose foot planted under it) up through a lateral bank toward the wall at the shoulder
   band (the leaning shoulder), then the neck/head reverses hard back the other way — a full
   yaw snap opposite the lean — so the trace hips-to-skull is a shallow lateral C-lean at the
   torso capped by a sharp counter-twist at the neck, the envelope hand's bent elbow and the
   crossed-ankle leg supplying the secondary counterweights that keep the silhouette alive
   rather than a plumb column with acting limbs bolted on.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['catchall-w1'], cell 6, fn buildSpy). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildSpy(){
  /* ---------- PALETTE (neutral noir — desaturated coat/hat browns-grays, no single realm's
     gimmick color; the envelope + glint-eyes carry the ONLY high-value law-3 zones). ---------- */
  const P = {
    /* R2 SECOND-PASS SELF-CORRECTION (post r1 flag: "very dark overall — below the law-3 body
       floor"): lifted the coat/hat families two value-steps (still desaturated/drab, just no
       longer reading as near-black at 1/3-res+dither) and repurposed the hatband ring from a
       near-void accent into a genuinely PALE value break; envelope pushed brighter so the
       "feeding both sides" tell survives the engine grade per law 3 (>=140 RGB signature zones). */
    coat: 0x686153, coatDk: 0x4a4438, coatHi: 0x847c68,
    lapel: 0x262320,
    belt: 0x1c1a16,
    hat: 0x504a3e, hatDk: 0x38332a, hatBand: 0xc8bc98,
    void: 0x140f0c, voidDeep: 0x0a0908,
    glint: 0xe8e2c8, glintHi: 0xffffff,
    pants: 0x2c2a24, pantsDk: 0x1c1a16,
    shoe: 0x201c16, shoeDk: 0x100e0a,
    skin: 0x9c7250, skinDk: 0x6c4c34,
    envelope: 0xf0e4c0, envelopeDk: 0xc0b080, envelopeSeal: 0x8a2c22,
    disc: 0x36312a, discTop: 0x423b32,
  };

  function clamp01(v){ return Math.min(1, Math.max(0, v)); }
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }

  /* ===== SPINE — lateral lean-and-counterpose: hip pushes away from the wall (+x), shoulder
     banks INTO the wall (-x), with a shallow yaw carrying the torso half-turned; the head then
     snaps back the OTHER way in a hard over-the-shoulder glance. ===== */
  const L = {
    hipY: 0.40, waistY: 0.52, ribY: 0.63, chestY: 0.74, shldY: 0.845, neckY: 0.90,
    jawY: 0.955, browY: 1.01, crownY: 1.05,
  };
  /* R2 SELF-CORRECTION (post r1 engine render): r1's lean (X: 0.045/-0.095, YAW: 0.10/0.38)
     read as a near-plumb column at 1/3-res — the "leaning on a wall" pose sentence never
     survived the squint. Widened the lateral bank and the yaw spread so the torso genuinely
     banks off-axis instead of standing square. */
  const HIP_X = 0.075, SHLD_X = -0.155;                 // lateral bank: hip out, shoulder into the wall
  const HIP_YAW = 0.14, SHLD_YAW = 0.52;                 // torso opens as it rises, half-turning away
  const HEAD_YAW = SHLD_YAW - 1.15;                      // hard counter-snap back toward camera (the glance)
  function lean(p){
    const t = clamp01((p.y - L.hipY) / (L.shldY - L.hipY));
    const r = rotY(p, HIP_YAW + t * (SHLD_YAW - HIP_YAW));
    const x = HIP_X + t * (SHLD_X - HIP_X);
    return V(r.x + x, r.y, r.z);
  }
  const shldBase = lean(V(0, L.shldY, 0));
  const headXf = (p) => { const r = rotY(p, HEAD_YAW); return V(r.x + shldBase.x, r.y, r.z + shldBase.z + 0.01); };

  /* ===== LEGS — ankles crossed. Stance leg (+x) planted straight under the counterpose hip;
     crossed leg (-x) swings in front, toe down, knee still bent (POSE-ANATOMY law 2). ===== */
  {
    // STANCE leg (+x, weight-bearing, planted under the pushed-out hip)
    const hipS = lean(V(0.085, L.hipY, 0.01));
    const kneeS = V(0.115, 0.215, 0.03);
    const footS = V(0.125, 0.028, 0.045);
    tube(hipS, kneeS, 0.088, 0.076, 8, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeS, footS, 0.066, 0.050, 8, P.pantsDk, { capB: { hex: P.shoe, lift: 0.014 } });
    quad(V(footS.x + 0.044, footS.y - 0.012, footS.z - 0.01), V(footS.x - 0.044, footS.y - 0.012, footS.z - 0.01),
      V(footS.x - 0.038, footS.y + 0.012, footS.z + 0.10), V(footS.x + 0.038, footS.y + 0.012, footS.z + 0.10), P.shoe, 0.04);

    // CROSSED leg (-x hip, swings across to +x in front, toe down, heel lifted) — R2: widened
    // the cross-over reach so the crossed foot clears the stance foot's silhouette instead of
    // overlapping it into a single leg-mass blob.
    const hipC = lean(V(-0.075, L.hipY, -0.005));
    const kneeC = V(-0.01, 0.185, 0.135);
    const footC = V(0.145, 0.052, 0.20);
    tube(hipC, kneeC, 0.084, 0.072, 8, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeC, footC, 0.062, 0.044, 8, P.pantsDk, { capB: { hex: P.shoeDk, lift: 0.012 } });
    /* toe-down foot — heel raised, ball of the shoe touching, the idle-lean tell */
    quad(V(footC.x + 0.034, footC.y - 0.02, footC.z - 0.02), V(footC.x - 0.034, footC.y - 0.02, footC.z - 0.02),
      V(footC.x - 0.028, footC.y - 0.048, footC.z + 0.08), V(footC.x + 0.028, footC.y - 0.048, footC.z + 0.08), P.shoeDk, 0.04);
  }

  /* ===== COAT / TORSO — a belted trench, lateral bank carried up the whole stack. ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.175, rz: 0.155, hex: P.coatDk },
    { y: L.waistY, rx: 0.190, rz: 0.170, hex: P.belt },
    { y: L.ribY,   rx: 0.205, rz: 0.180, hex: P.coat },
    { y: L.chestY, rx: 0.212, rz: 0.176, hex: P.coat },
    { y: L.shldY,  rx: 0.218, rz: 0.166, hex: P.coatHi },
    { y: L.neckY,  rx: 0.072, rz: 0.066, hex: P.coatDk },
  ];
  stack(torsoBands, 9, { xform: lean });

  /* coat hem — flared panels breaking the column, ending mid-thigh so the crossed ankles read
     clean below it */
  {
    const hipC = lean(V(0, L.hipY - 0.01, 0));
    const a1 = lean(V(-0.19, L.hipY - 0.03, -0.06));
    const a2 = lean(V(-0.24, L.hipY - 0.22, -0.02));
    const a3 = lean(V(-0.02, L.hipY - 0.20, 0.02));
    quad(V(hipC.x, hipC.y, hipC.z), V(a1.x, a1.y, a1.z), V(a2.x, a2.y, a2.z), V(a3.x, a3.y, a3.z), P.coatDk, 0.05);

    const b1 = lean(V(0.18, L.hipY - 0.02, 0.03));
    const b2 = lean(V(0.22, L.hipY - 0.19, 0.10));
    const b3 = lean(V(0.02, L.hipY - 0.19, 0.06));
    quad(V(hipC.x, hipC.y, hipC.z), V(b1.x, b1.y, b1.z), V(b2.x, b2.y, b2.z), V(b3.x, b3.y, b3.z), P.coat, 0.05);
  }

  /* triangular lapels — costume-break, framing the chest where the envelope shows */
  {
    const top = lean(V(-0.045, L.shldY - 0.02, 0.09));
    const mid = lean(V(0.055, L.chestY - 0.03, 0.115));
    const low = lean(V(-0.01, L.waistY + 0.02, 0.10));
    quad(V(top.x, top.y, top.z), V(mid.x, mid.y, mid.z), V(low.x, low.y, low.z), V(top.x - 0.02, top.y - 0.03, top.z), P.lapel, 0.05);
  }

  /* belt — tied off with tails hanging loose (noir tell) */
  {
    const c = lean(V(0.02, L.waistY, 0.155));
    quad(V(c.x - 0.10, c.y - 0.018, c.z), V(c.x + 0.10, c.y - 0.018, c.z),
      V(c.x + 0.10, c.y + 0.018, c.z), V(c.x - 0.10, c.y + 0.018, c.z), P.belt, 0.03);
    const tailTop = lean(V(0.06, L.waistY - 0.02, 0.16));
    const tailBot = V(tailTop.x + 0.01, tailTop.y - 0.135, tailTop.z + 0.01);
    quad(V(tailTop.x - 0.018, tailTop.y, tailTop.z), V(tailTop.x + 0.018, tailTop.y, tailTop.z),
      V(tailBot.x + 0.014, tailBot.y, tailBot.z), V(tailBot.x - 0.014, tailBot.y, tailBot.z), P.belt, 0.04);
  }

  /* ===== HIGH COLLAR — wraps up around the jaw, obscuring the lower face into the void. ===== */
  {
    const lowRing = ring(lean(V(0, L.shldY + 0.015, 0)), V(0, 1, 0), 0.095, 0.088, 10, Math.PI / 10);
    const hiRing = ring(headXf(V(0, L.jawY - 0.005, -0.01)), V(0, 1, 0), 0.088, 0.082, 10, Math.PI / 10);
    stitch([lowRing, hiRing], () => P.coatDk);
    /* front collar points, popped up past the jawline */
    for (const s of [-1, 1]) {
      const base = headXf(V(s * 0.05, L.jawY + 0.01, 0.06));
      const tip = headXf(V(s * 0.065, L.jawY + 0.075, 0.045));
      quad(V(base.x - 0.02, base.y - 0.02, base.z), V(base.x + 0.02, base.y - 0.02, base.z),
        V(tip.x, tip.y, tip.z), V(tip.x, tip.y, tip.z), P.coat, 0.05);
    }
  }

  /* ===== HEAD — SIGNATURE A: the face-void. Skin only barely implied at the jaw; the brow
     down to the collar-top reads as a dark shadow void punched by two glint-eye points. ===== */
  {
    const jaw = headXf(V(0, L.jawY, 0.045));
    quad(V(jaw.x - 0.028, jaw.y - 0.01, jaw.z), V(jaw.x + 0.028, jaw.y - 0.01, jaw.z),
      V(jaw.x + 0.024, jaw.y + 0.03, jaw.z + 0.01), V(jaw.x - 0.024, jaw.y + 0.03, jaw.z + 0.01), P.skinDk, 0.05);

    /* the void — a dark wedge from brow-shadow down to the popped collar, punched by the brim */
    const voidTop = headXf(V(0, L.browY - 0.01, 0.055));
    const voidBot = headXf(V(0, L.jawY + 0.015, 0.05));
    quad(V(voidTop.x - 0.05, voidTop.y, voidTop.z), V(voidTop.x + 0.05, voidTop.y, voidTop.z),
      V(voidBot.x + 0.045, voidBot.y, voidBot.z), V(voidBot.x - 0.045, voidBot.y, voidBot.z), P.void, 0.03);

    /* R2 SELF-CORRECTION (post r1 engine render): r1's glint-eyes (0.024u wide) sat under the
       0.04u law-3 floor and vanished entirely at 1/3-res + dither — the face-void signature
       never reached the render. Widened to 0.05u, pulled further forward (+z) clear of the
       brim shadow so they read as two hot points instead of dissolving into the void mass. */
    for (const s of [-1, 1]) {
      /* second-pass: vertical extent was 0.028u, under the 0.04u law-3 floor — widened to 0.04u
         tall so the glint survives 1/3-res+dither as a genuine hot point, not a sliver. */
      const e = headXf(V(s * 0.028, L.browY - 0.035, 0.088));
      quad(V(e.x - 0.026, e.y - 0.02, e.z), V(e.x + 0.026, e.y - 0.02, e.z),
        V(e.x + 0.022, e.y + 0.02, e.z + 0.01), V(e.x - 0.022, e.y + 0.02, e.z + 0.01), P.glintHi, 0.01);
    }

    /* skull cap under the hat, dark, minimal — the hat/void carry the read */
    const skullBands = [
      { y: L.browY, rx: 0.084, rz: 0.078, hex: P.voidDeep },
      { y: L.crownY, rx: 0.072, rz: 0.066, hex: P.hatDk },
    ];
    stack(skullBands, 8, { xform: headXf });
  }

  /* ===== HAT — low brim dropped over the eyes, short crown above it. ===== */
  {
    const brimC = headXf(V(0, L.browY + 0.02, 0.005));
    const brimRing = ring(brimC, V(0, 1, 0), 0.155, 0.145, 12, Math.PI / 12);
    /* brim underside (dark, casts the shadow) then a thin top edge (slightly lit) */
    const brimInner = ring(headXf(V(0, L.browY + 0.03, 0.005)), V(0, 1, 0), 0.078, 0.072, 12, Math.PI / 12);
    stitch([brimInner, brimRing], () => P.hatDk);
    capFan(brimRing, headXf(V(0, L.browY + 0.018, 0.005)), P.hat, true);

    const bandRing = ring(headXf(V(0, L.browY + 0.035, 0.005)), V(0, 1, 0), 0.076, 0.070, 12, Math.PI / 12);
    stitch([brimInner, bandRing], () => P.hatBand);

    const crownRing = ring(headXf(V(0, L.crownY + 0.05, -0.005)), V(0, 1, 0), 0.066, 0.060, 12, Math.PI / 12);
    stitch([bandRing, crownRing], () => P.hat);
    capFan(crownRing, headXf(V(0, L.crownY + 0.075, -0.005)), P.hatDk);
  }

  /* ===== ARMS — POSE-ANATOMY: shoulders ride, elbows bend 100-150deg. Pocket arm (+x, weight
     side) disappears into a coat pocket slit; envelope arm (-x) bends up to the lapel, caught
     mid-slip. ===== */

  /* POCKET arm (+x) — forearm angles into a pocket slit at the hip, hand hidden */
  {
    const sh = lean(V(0.19, L.shldY - 0.01, 0.01));
    const el = V(0.235, 0.635, 0.075);
    const wr = V(0.185, 0.475, 0.13);
    tube(sh, el, 0.052, 0.046, 8, P.coat);
    tube(el, wr, 0.042, 0.036, 8, P.coatDk, { phase: Math.PI / 6 });
    /* pocket slit the forearm vanishes into */
    const pk = lean(V(0.15, 0.475, 0.135));
    quad(V(pk.x - 0.032, pk.y - 0.01, pk.z), V(pk.x + 0.032, pk.y - 0.01, pk.z),
      V(pk.x + 0.028, pk.y + 0.022, pk.z + 0.006), V(pk.x - 0.028, pk.y + 0.022, pk.z + 0.006), P.void, 0.03);
  }

  /* ENVELOPE arm (-x) — bends up, elbow tucked, hand at the lapel mid-slip */
  const shE = lean(V(-0.185, L.shldY - 0.02, -0.005));
  const elE = V(-0.215, 0.615, 0.075);
  const wrE = V(-0.075, 0.685, 0.135);
  tube(shE, elE, 0.05, 0.044, 8, P.coat);
  tube(elE, wrE, 0.04, 0.034, 8, P.skinDk, { phase: Math.PI / 6 });
  quad(V(wrE.x - 0.02, wrE.y - 0.018, wrE.z), V(wrE.x + 0.02, wrE.y - 0.018, wrE.z),
    V(wrE.x + 0.016, wrE.y + 0.02, wrE.z + 0.012), V(wrE.x - 0.016, wrE.y + 0.02, wrE.z + 0.012), P.skin, 0.04);

  /* ===== SIGNATURE B — the half-hidden envelope, pale (law-3 high value), caught mid-slip
     into the lapel gap right where the envelope hand sits. ===== */
  {
    /* R2 SELF-CORRECTION: r1's envelope (0.06u wide) read as a barely-visible brown smudge
       against the coat at similar mid-value — widened + pulled forward off the chest so the
       pale color actually breaks from the coat mass, per law 3. */
    const eTop = V(wrE.x + 0.015, wrE.y + 0.06, wrE.z + 0.04);
    const eBot = V(eTop.x - 0.008, eTop.y - 0.11, eTop.z - 0.01);
    quad(V(eTop.x - 0.05, eTop.y, eTop.z), V(eTop.x + 0.05, eTop.y, eTop.z),
      V(eBot.x + 0.044, eBot.y, eBot.z), V(eBot.x - 0.044, eBot.y, eBot.z), P.envelope, 0.03);
    quad(V(eTop.x - 0.044, eTop.y - 0.015, eTop.z + 0.004), V(eTop.x + 0.01, eTop.y - 0.015, eTop.z + 0.004),
      V(eTop.x - 0.004, eTop.y - 0.065, eTop.z + 0.004), V(eTop.x - 0.04, eTop.y - 0.045, eTop.z + 0.004), P.envelopeSeal, 0.02);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
