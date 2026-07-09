/* dev/model-qa/creatures/rlm-frontier-performer.js — the PERFORMER landmark table (HUMANOID
   family, Medium, CR 1/2, realm frontier), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000
   tri band (foundry pilot, frontier-w1 cell 9). Core identity: the showman rogue — a smooth
   card-palming cheat, quick with a hideout knife (data/realm-bestiary.js "Poker-Table Cheat").
   Bespoke to the render key "performer"; the frontier reskin (teal waistcoat, rolled sleeves +
   garters, no hat — a table-side hustler, not a trail-worn thug) rides this chassis.

   FEATURE CHECKLIST (the ~1,400-1,700 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: slim build (narrow ribcage, nipped waist,
        no bulk) in a fitted teal waistcoat over a pale rolled-sleeve shirt — light on the feet.
     2. SIGNATURE — the card fan: a spread of five pale (high-value) cards fanned wide off the
        sweeping hand, one loud readable cue, law-4's exaggerated feature taken straight off the
        flavor line ("Smooth card-palming cheat").
     3. SECOND SIGNATURE — the hideout knife, palmed low and hidden behind the back in the
        off-hand, a dark blade with a thin steel edge-glint (the "quick with a knife" other half
        of the flavor line).
     4. Face — slicked side-parted hair, a thin grin and small glinting eyes, chin lifted to look
        up at the mark mid-bow (the showman flourish, not a blank faceless thug).
     5. Pale shirt sleeves + brass sleeve-garters + the near-white card fan as the law-3
        high-value zone, lifted off the dark teal/charcoal body so the signature carries value
        contrast even dithered.
     6. One leg crossed behind the other, heel raised, toe pointed — the courtly showman's bow
        footwork, never a squared at-attention stance.

   POSE SENTENCE: the reveal — a mid-flourish showman's bow, deep bend at the waist with the
   spine pulled into a C-curve, one leg crossed behind the other with the heel lifted, one arm
   swept wide fanning the pale cards out to the side while the other palms the hideout knife
   tucked low and hidden behind the back, chin lifted to grin up at the mark — never a standing
   idle stance.

   SPINE-GESTURE SENTENCE: the spine runs the planted-leg hip (settled back-and-low as
   counterweight) up through a deepening forward C-curve at the waist/ribcage/chest, the
   shoulders riding forward and the card-arm shoulder lifting further with the sweep, to a neck
   that keeps curving down-and-forward before the head counter-rotates back up at the very top
   of the curve to grin at the audience — a continuous hook, not a plumb line, with both elbows
   bent through the whole gesture (card arm ~120° at the sweep, knife arm ~90° tucked behind).

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w1'], cell 9, fn buildPerformer). */
import { THREE, V, quad, tube, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildPerformer(){
  /* ---------- PALETTE (dark teal waistcoat + charcoal trousers vs. a pale shirt/card-fan
     high-value ladder — the law-3 zone the sleeves + garters + cards carry; frontier-dusty
     desaturated, distinct from the bandit-enforcer's brown coat and the card-sharp-killer's
     burgundy vest). ---------- */
  /* R3 SELF-CORRECTION (post r2 engine render): the trousers (0x3a342c) sampled almost
     identical to the disc/ground tile (0x36312a) — the legs vanished completely into the
     ground, reading as a floating torso with no visible connection to the base (the exact
     dark-on-dark law-3 failure the foundry docs call out). Lifted trousers/boots a full step
     off the void and off the disc's hue so the legs stay legible against the ground plane. */
  const P = {
    vest: 0x2c5850, vestDk: 0x1c3a34, vestLt: 0x3c7268,
    shirt: 0xe4d8b4, shirtDk: 0xb8ab84,
    trous: 0x5c5142, trousDk: 0x413a2e,
    skin: 0xb28a62, skinDk: 0x7e5e40,
    hair: 0x241f1a, hairLt: 0x322a22,
    brass: 0xdcb85c, brassDk: 0x9c7e3c,
    card: 0xefe8d0, cardDk: 0xc4bb9c, cardRed: 0x9a3a3a, cardPip: 0x2a2420,
    knife: 0x2e2b28, knifeDk: 0x1c1a18, steel: 0xd0d2c8,
    boot: 0x3a3024, bootDk: 0x241d16,
    eye: 0x1c1712, mouth: 0x140f0d,
    disc: 0x231e17, discTop: 0x2c261d,
  };

  /* ===== RIG — deep forward-bow C-curve. Rings stay horizontal (per the bandit-enforcer
     convention); only each band's CENTER moves along the curve, which reads the bend without
     needing per-ring axis rotation. bendPoint(h) walks the unbent-spine height h (0 at the hip
     pivot) out along a progressively steepening forward arc; the head band gets a small counter
     correction so the chin lifts back up at the top of the curve (the showman's grin-up).
     R2 SELF-CORRECTION (post r1 engine render): r1's 72-degree max bend + a large -0.35rad head
     counter-correction combined to read as the figure lying flat/prone in mid-air rather than
     bowing — the head ended up nearly level with the hips instead of dipping down first. Pulled
     the max bend back to 55 degrees, lengthened the unbent spine (0.52 -> 0.64, a taller, less
     squat standing frame), and shrank the head counter-correction (-0.35 -> -0.12rad) so the
     head still visibly dips through the bow before the small grin-up glint at the very top.
     PASS-2 CRITIC CORRECTION (post r4 engine render): the r2 fix overcorrected. Because
     bendPoint's height term is h*cos(a) with a always < 90 degrees, ANY bend angle below 90
     degrees leaves height strictly increasing with h — the formula can only ever LEAN the rod
     forward, never fold it, so the head was mathematically guaranteed to land ABOVE the hip
     (measured: head y=0.767 vs hip y=0.34, i.e. 0.43 units higher than standing weight, plus
     0.48 forward) — a "diving/leaning" read, not a bow, and it read in-engine as a floating
     upper-body cluster disconnected from the legs. Deepened maxBend 55 -> 83 degrees (1.45rad)
     and headExtra -0.12 -> -0.20rad so the curve now genuinely folds: height rises hip->waist
     ->rib->chest (the small of the back), then FALLS chest->shoulder->neck as the fold deepens
     (0.606 -> 0.571 -> 0.509), with the head ticking back up only slightly (0.542) for the
     grin-up — a real hook/C-curve instead of a monotonic lean, head now only 0.20 above hip
     instead of 0.43. ===== */
  const hipY = 0.34, pivotZ = -0.012;
  const maxBend = 1.45; // 83 degrees — a genuine fold past the shallow-lean threshold
  const spineLen = 0.64;
  const headExtra = -0.20; // the grin-up glint, sized to the deeper base bend
  function bendAngle(t){ return maxBend * Math.pow(t, 1.15); }
  function bendPoint(h, extra = 0){
    const t = h / spineLen;
    const a = bendAngle(t) + extra;
    return V(0, hipY + h * Math.cos(a), pivotZ + h * Math.sin(a));
  }
  const hipC = bendPoint(0);
  const waistC = bendPoint(0.14);
  const ribC = bendPoint(0.28);
  const chestC = bendPoint(0.40);
  const shldC = bendPoint(0.50);
  const neckC = bendPoint(0.57);
  const headC = bendPoint(0.64, headExtra); // chin-lift counter-rotation — the grin-up flourish

  /* ---------- LEGS — front leg planted and bent, taking the bowed weight; rear leg crossed
     BEHIND it, heel lifted, toe pointed (the courtly showman's footwork, law 5's pose). ---- */
  {
    // FRONT leg (right, +x): weight-bearing, bent knee, ball of the foot planted forward.
    const hipF = V(0.085, hipY, -0.020);
    const kneeF = V(0.140, 0.175, 0.140);
    const footF = V(0.122, 0.026, 0.220);
    tube(hipF, kneeF, 0.062, 0.052, 8, P.trousDk, { capA: { hex: P.trous } });
    tube(kneeF, footF, 0.052, 0.040, 8, P.trous, { capB: { hex: P.boot, lift: 0.014 } });
    quad(V(footF.x - 0.030, footF.y, footF.z - 0.02), V(footF.x + 0.030, footF.y, footF.z - 0.02),
         V(footF.x + 0.024, footF.y + 0.006, footF.z + 0.075), V(footF.x - 0.024, footF.y + 0.006, footF.z + 0.075), P.boot, 0.04);
    /* boot-top cuff ring + a small brass buckle strap — a countable detail at the ankle */
    {
      const cuff = ring(V(footF.x, footF.y + 0.060, footF.z - 0.06), V(0, 1, 0), 0.050, 0.046, 8, Math.PI / 8);
      const cuff2 = ring(V(footF.x, footF.y + 0.088, footF.z - 0.06), V(0, 1, 0), 0.046, 0.042, 8, Math.PI / 8);
      stitch([cuff, cuff2], () => P.bootDk);
      quad(V(footF.x - 0.02, footF.y + 0.070, footF.z + 0.0), V(footF.x + 0.02, footF.y + 0.070, footF.z + 0.0),
           V(footF.x + 0.018, footF.y + 0.058, footF.z + 0.006), V(footF.x - 0.018, footF.y + 0.058, footF.z + 0.006), P.brass, 0.04);
    }

    // REAR leg (left, -x): crosses BEHIND and across to the far side, heel raised, toe pointed.
    const hipR = V(-0.085, hipY, -0.030);
    const kneeR = V(-0.020, 0.160, -0.120);
    const footR = V(0.062, 0.052, -0.190);
    tube(hipR, kneeR, 0.056, 0.046, 8, P.trousDk, { capA: { hex: P.trous } });
    tube(kneeR, footR, 0.046, 0.032, 8, P.trous, { capB: { hex: P.boot, lift: 0.010 } });
    quad(V(footR.x - 0.020, footR.y, footR.z - 0.015), V(footR.x + 0.020, footR.y, footR.z - 0.015),
         V(footR.x + 0.010, footR.y - 0.006, footR.z - 0.075), V(footR.x - 0.010, footR.y - 0.006, footR.z - 0.075), P.boot, 0.04);
    {
      const cuff = ring(V(footR.x, footR.y + 0.056, footR.z - 0.02), V(0, 1, 0), 0.044, 0.040, 8, Math.PI / 8);
      const cuff2 = ring(V(footR.x, footR.y + 0.080, footR.z - 0.02), V(0, 1, 0), 0.040, 0.036, 8, Math.PI / 8);
      stitch([cuff, cuff2], () => P.bootDk);
    }
  }

  /* ---------- TORSO — slim build, nipped waist, teal waistcoat over a pale shirt, following
     the deep forward C-curve. ---------- */
  {
    const n = 9, ph = Math.PI / 9;
    const bands = [
      { c: hipC,   rx: 0.118, rz: 0.108, hex: P.trous },
      { c: waistC, rx: 0.094, rz: 0.084, hex: P.vestDk },
      { c: ribC,   rx: 0.122, rz: 0.106, hex: P.vest },
      { c: chestC, rx: 0.132, rz: 0.112, hex: P.vestLt },
      { c: shldC,  rx: 0.140, rz: 0.104, hex: P.vest },
      { c: neckC,  rx: 0.060, rz: 0.056, hex: P.skinDk },
    ];
    const rings = bands.map(b => ring(b.c, V(0, 1, 0), b.rx, b.rz, n, ph));
    stitch(rings, (i) => bands[i].hex);

    /* pale shirt wedge showing through the open waistcoat front, brass buttons climbing it —
       the vest's own high-value tell, distinct from the card-fan/knife signatures. */
    quad(V(-0.052, chestC.y + 0.02, chestC.z + 0.116), V(0.052, chestC.y + 0.02, chestC.z + 0.116),
         V(0.066, waistC.y - 0.01, waistC.z + 0.096), V(-0.066, waistC.y - 0.01, waistC.z + 0.096), P.shirt, 0.035);
    for(let i = 0; i < 4; i++){
      const t = i / 3;
      const y = waistC.y + t * (chestC.y - waistC.y);
      const z = waistC.z + t * (chestC.z - waistC.z) + 0.10;
      quad(V(-0.011, y - 0.010, z), V(0.011, y - 0.010, z), V(0.009, y + 0.010, z), V(-0.009, y + 0.010, z), P.brass, 0.045);
    }

    /* watch chain — a small draped loop off the vest, fob dangling — a second countable brass
       flourish (law 1: tris as points of expression) at low tri cost. */
    {
      const a0 = V(waistC.x - 0.05, waistC.y + 0.03, waistC.z + 0.098);
      const a1 = V(waistC.x - 0.01, waistC.y - 0.01, waistC.z + 0.112);
      const a2 = V(waistC.x + 0.04, waistC.y + 0.02, waistC.z + 0.098);
      tube(a0, a1, 0.007, 0.007, 4, P.brass);
      tube(a1, a2, 0.007, 0.007, 4, P.brass);
      blob(a1.x, a1.y - 0.018, a1.z, 0.012, 0.014, 0.010, P.brassDk, 5, 3);
    }

    /* waistcoat collar points at the throat, a small readable lapel-tip pair */
    for(const s of [-1, 1]){
      const cy = shldC.y + 0.010, cz = shldC.z + 0.098;
      quad(V(s * 0.018, cy, cz), V(s * 0.052, cy - 0.028, cz + 0.006),
           V(s * 0.040, cy - 0.050, cz - 0.006), V(s * 0.014, cy - 0.026, cz - 0.004), P.vestDk, 0.04);
    }

    /* belt ring at the hip, brass buckle facing front — a second value-contrast beat low on
       the silhouette, and a countable feature in its own right. */
    {
      const b0 = ring(V(hipC.x, hipC.y + 0.030, hipC.z), V(0, 1, 0), 0.122, 0.112, n, ph);
      const b1 = ring(V(hipC.x, hipC.y + 0.008, hipC.z), V(0, 1, 0), 0.124, 0.114, n, ph);
      stitch([b0, b1], () => P.trousDk);
      quad(V(hipC.x - 0.022, hipC.y + 0.032, hipC.z + 0.112), V(hipC.x + 0.022, hipC.y + 0.032, hipC.z + 0.112),
           V(hipC.x + 0.020, hipC.y + 0.006, hipC.z + 0.114), V(hipC.x - 0.020, hipC.y + 0.006, hipC.z + 0.114), P.brass, 0.03);
    }

    /* twin side button-columns flanking the open front (the enforcer had one column; the
       showman's cut runs a matched pair, both catching the high-value light). */
    for(const s of [-1, 1]){
      for(let i = 0; i < 3; i++){
        const t = i / 2;
        const y = waistC.y + 0.02 + t * (shldC.y - waistC.y - 0.04);
        const z = waistC.z + t * (shldC.z - waistC.z) + 0.088;
        quad(V(s * 0.058 - 0.009, y - 0.009, z), V(s * 0.058 + 0.009, y - 0.009, z),
             V(s * 0.058 + 0.007, y + 0.009, z), V(s * 0.058 - 0.007, y + 0.009, z), P.brassDk, 0.05);
      }
    }
  }

  /* ---------- HEAD — slicked side-part hair, small glinting eyes, thin grin — the showman
     looking up at the mark from the bottom of the bow, not a blank faceless thug. ---------- */
  {
    const n = 8, ph = Math.PI / 8;
    const bands = [
      { c: neckC, rx: 0.098, rz: 0.090, hex: P.skinDk },
      { c: bendPoint(0.625, headExtra), rx: 0.108, rz: 0.098, hex: P.skin },
      { c: bendPoint(0.675, headExtra), rx: 0.086, rz: 0.080, hex: P.hair },
    ];
    const rings = bands.map(b => ring(b.c, V(0, 1, 0), b.rx, b.rz, n, ph));
    stitch(rings, (i) => bands[i].hex);
    capFan(rings[2], bendPoint(0.705, headExtra), P.hairLt);

    /* small ears — real 3D volume (3 side faces), seated from the skull surface per the
       cross-family construction rule, not buried in the center. */
    const earC = bendPoint(0.645, headExtra);
    for(const s of [-1, 1]){
      const root = V(earC.x + s * 0.100, earC.y + 0.006, earC.z + 0.006);
      const tip = V(earC.x + s * 0.122, earC.y + 0.010, earC.z + 0.010);
      const top = V(earC.x + s * 0.098, earC.y + 0.026, earC.z + 0.010);
      const bot = V(earC.x + s * 0.098, earC.y - 0.018, earC.z + 0.010);
      quad(root, tip, top, root, P.skinDk, 0.05);
      quad(root, bot, tip, root, P.skin, 0.05);
    }

    /* slicked side-part hair patch + a thin grin + small glinting eyes, all riding the
       up-tilted (grin-up) face plane. */
    const faceC = bendPoint(0.645, headExtra);
    quad(V(faceC.x - 0.05, faceC.y + 0.028, faceC.z + 0.088), V(faceC.x + 0.05, faceC.y + 0.028, faceC.z + 0.088),
         V(faceC.x + 0.04, faceC.y + 0.052, faceC.z + 0.075), V(faceC.x - 0.04, faceC.y + 0.052, faceC.z + 0.075), P.hair, 0.03);
    for(const s of [-1, 1]){
      blob(faceC.x + s * 0.032, faceC.y + 0.006, faceC.z + 0.086, 0.011, 0.010, 0.009, P.eye, 4, 3);
    }
    quad(V(faceC.x - 0.032, faceC.y - 0.030, faceC.z + 0.088), V(faceC.x + 0.032, faceC.y - 0.030, faceC.z + 0.088),
         V(faceC.x + 0.026, faceC.y - 0.014, faceC.z + 0.094), V(faceC.x - 0.026, faceC.y - 0.014, faceC.z + 0.094), P.mouth, 0.04);
  }

  /* ---------- ARMS — card-fan arm swept wide (shoulder rides up with the sweep, elbow bent
     ~120 degrees); knife arm bent sharply and tucked hidden behind the back (elbow bent
     ~90 degrees), per POSE-ANATOMY laws 2-3. ---------- */
  {
    /* CARD-FAN arm (right, +x): shoulder lifts and pushes out with the sweep, elbow bent wide,
       wrist flung out to the side fanning five pale cards — the loud signature.
       R2 SELF-CORRECTION (post r1 engine render): the reach out to x=0.54 (plus the card fan
       past x=0.7) blew the model's own bbox out to nearly 3x the disc radius — the auto-frame
       camera zoomed out to fit it, so the actual torso/legs read as a tiny smear and the whole
       silhouette read as "a long horizontal arm," not a bowing person (law 2 failure). Pulled
       the elbow/wrist in by roughly half so the sweep stays a readable gesture off a
       recognizable body instead of swallowing it. */
    const shC = V(shldC.x + 0.140, shldC.y + 0.032, shldC.z - 0.006);
    const elC = V(0.255, shldC.y + 0.058, shldC.z + 0.048);
    const wrC = V(0.335, shldC.y + 0.014, shldC.z - 0.006);
    tube(shC, elC, 0.048, 0.040, 8, P.shirt, { capA: { hex: P.vest } });
    tube(elC, wrC, 0.040, 0.030, 8, P.shirt, { capB: { hex: P.skin, lift: 0.010 } });
    /* brass sleeve-garter cinching the rolled sleeve mid-forearm */
    quad(V(elC.x - 0.026, elC.y - 0.014, elC.z), V(elC.x + 0.026, elC.y - 0.014, elC.z),
         V(elC.x + 0.024, elC.y + 0.014, elC.z + 0.01), V(elC.x - 0.024, elC.y + 0.014, elC.z + 0.01), P.brass, 0.04);
    /* palm block + four splayed fingers gripping the cards from below — countable digits, the
       law-1 "tris as points of expression" idiom, cheap at n=4 tube segments each. */
    blob(wrC.x, wrC.y - 0.006, wrC.z, 0.026, 0.020, 0.022, P.skin, 5, 3);
    for(let i = 0; i < 4; i++){
      const a = -0.30 + i * 0.20;
      const root = V(wrC.x + Math.sin(a) * 0.014, wrC.y - 0.020, wrC.z + Math.cos(a) * 0.006);
      const tip = V(wrC.x + Math.sin(a) * 0.052, wrC.y - 0.052, wrC.z + Math.cos(a) * 0.018);
      tube(root, tip, 0.011, 0.006, 4, P.skin, { capB: { hex: P.skin } });
    }
    for(let i = 0; i < 5; i++){
      const a = -0.42 + i * 0.24;
      const tip = V(wrC.x + Math.cos(a) * 0.11, wrC.y + Math.sin(a) * 0.10 + 0.02, wrC.z + 0.015 - i * 0.008);
      quad(V(wrC.x - 0.012, wrC.y - 0.006, wrC.z), V(wrC.x + 0.012, wrC.y - 0.006, wrC.z),
           V(tip.x + 0.032, tip.y + 0.052, tip.z), V(tip.x - 0.032, tip.y + 0.052, tip.z),
           (i === 2) ? P.cardRed : P.card, 0.035);
      quad(V(tip.x - 0.014, tip.y + 0.020, tip.z + 0.002), V(tip.x + 0.014, tip.y + 0.020, tip.z + 0.002),
           V(tip.x + 0.010, tip.y + 0.034, tip.z + 0.002), V(tip.x - 0.010, tip.y + 0.034, tip.z + 0.002), P.cardPip, 0.05);
    }

    /* KNIFE arm (left, -x): elbow bent sharply, forearm curls back and DOWN behind the torso —
       hand palming the hideout blade low and hidden behind the back, no shoulder lift (this
       arm hides, it doesn't perform). */
    const shK = V(shldC.x - 0.132, shldC.y - 0.008, shldC.z - 0.010);
    const elK = V(-0.150, waistC.y + 0.050, waistC.z - 0.050);
    const wrK = V(-0.045, hipC.y + 0.040, hipC.z - 0.080);
    tube(shK, elK, 0.046, 0.038, 8, P.vest, { capA: { hex: P.vestDk } });
    tube(elK, wrK, 0.038, 0.028, 8, P.shirt, { capB: { hex: P.skin, lift: 0.010 } });
    quad(V(elK.x - 0.024, elK.y - 0.012, elK.z), V(elK.x + 0.024, elK.y - 0.012, elK.z),
         V(elK.x + 0.022, elK.y + 0.012, elK.z + 0.01), V(elK.x - 0.022, elK.y + 0.012, elK.z + 0.01), P.brass, 0.04);
    /* fist knuckle block + three curled fingers wrapping the grip — a second countable-digit
       cluster (law 1), gripping FROM the hidden side so the knuckles read even tucked. */
    blob(wrK.x, wrK.y - 0.004, wrK.z - 0.010, 0.024, 0.019, 0.020, P.skin, 5, 3);
    for(let i = 0; i < 3; i++){
      const a = -0.22 + i * 0.20;
      const root = V(wrK.x + Math.sin(a) * 0.012, wrK.y - 0.018, wrK.z - 0.010 + Math.cos(a) * 0.010);
      const tip = V(wrK.x + Math.sin(a) * 0.030, wrK.y - 0.044, wrK.z - 0.028 + Math.cos(a) * 0.014);
      tube(root, tip, 0.010, 0.006, 4, P.skin, { capB: { hex: P.skin } });
    }

    /* the hideout knife, palmed flat against the wrist, blade trailing back along the forearm —
       dark grip, a thin steel edge-glint (the law-3 floor: kept a real 0.028-diameter taper). */
    const bladeBase = V(wrK.x - 0.012, wrK.y - 0.006, wrK.z - 0.030);
    const bladeTip = V(wrK.x - 0.028, wrK.y - 0.010, wrK.z - 0.110);
    tube(wrK, bladeBase, 0.026, 0.022, 4, P.knifeDk, { capA: { hex: P.knife } });
    tube(bladeBase, bladeTip, 0.022, 0.006, 4, P.steel, { capB: { hex: P.steel } });
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
