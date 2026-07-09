/* dev/model-qa/creatures/rlm-frontier-tough.js — the TOUGH landmark table (HUMANOID family,
   Medium, CR 1/4, realm frontier), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band
   (foundry pilot, frontier-w1 cell 8). Core identity: the SALOON BRAWLER — fights better drunk,
   unarmed, swinging. Bespoke to the render key "tough"; the frontier reskin (Whiskey-Nerve
   Brawler — cheap saloon muscle, cr 1/4, per data/realm-bestiary.js) rides this chassis.

   FEATURE CHECKLIST (the ~1,300-1,700 budget buys):
     1. HUMANOID torso per ANATOMY-CANON POSE-ANATOMY: beefy no-taper barrel (big gut, thick
        chest, no waist) built with a genuine FULL SPINE TWIST — shoulders rotate ~46 degrees
        further around the vertical axis than the hips (law 5's amendment: the spine carries the
        gesture, authored as a real per-band rotation, not a lean).
     2. SIGNATURE — the haymaker wind-up: the rear fist cocked low and back behind the hip,
        loaded; the lead arm bent and probing forward at chest height, feeling the range.
        Rolled shirt-sleeves (pale bare forearms breaking from dark sleeve fabric at the elbow)
        carry the signature's high-value zone on both arms.
     3. Chin tucked down and turned back toward the target — the head only partially follows the
        shoulder twist, so the drunk brawler is still eyeing his mark past a lowered brow.
     4. Face — flushed drunk-red cheeks (the law-3 high-value patch), a furrowed dark brow, a
        snarling open mouth baring teeth, no hair (a shaved/bald bar-tough head).
     5. Suspender straps + open shirt collar breaking the pale shirt torso, and a dark belt/
        waistband line separating shirt from trousers — cheap saloon-muscle costuming.
     6. Staggered drunk-wide stance: the lead leg planted forward and bent, the rear leg
        splayed wide and back, feet turned out, wider and less braced than a sober fighter's
        stance — reads as unsteady, not drilled.

   POSE SENTENCE: the haymaker wind-up — torso coiled in a full spine twist, rear fist
   drawn back low behind the hip loaded to swing, lead arm bent forward at chest height
   probing the range, chin tucked and turned back to watch the mark, weight staggered wide and
   uneven across a drunk-loose stance — the beat right before the punch lands, never a squared,
   at-attention stance.

   SPINE-GESTURE SENTENCE: the spine runs a near-square hip band up through an accelerating
   twist to a shoulder band rotated ~46 degrees further around the vertical axis than the hips
   (rear shoulder pulled back, lead shoulder driven forward), then the neck/head partially
   untwists back toward the target and tucks down — so the trace hips-to-skull is a coiled
   spiral, not a plumb line, with the rear leg splayed wide as the twist's counterweight and the
   lead leg bent to carry the forward-loaded weight.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['frontier-w1'], cell 8, fn buildTough). */
import { THREE, V, quad, tube, ring, stitch, capFan, stack } from '../probe-lib.js';

export function buildTough(){
  /* ---------- PALETTE (pale shirt + suspenders vs. dark trousers — the law-3 high-value zone
     the shirt/collar/flushed-face/pale-forearms carry; frontier-desaturated, warm). ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's pants/boots sampled far too close to the
     disc/void — the legs and stance read as almost nothing below the torso, and the rear
     loaded fist (planted at -x,-z, the camera-far/back corner) was fully occluded by the torso
     mass, so the haymaker signature never reached the render. Lifted pants/boot a full step off
     the void (law 3), and swapped which arm sits on which side (see the arm block below) so the
     loaded fist sits on the near +x side where it clears the torso's silhouette instead of
     hiding directly behind it. */
  /* R3 CRITIC PASS (post r2 render, question d): r2's leg palette still sat within one value
     step of the disc (pants luma ~119 vs disc-top luma ~60 was the THEORY; r2's actual
     pants/pantsDk/boot were even darker than that, ~90-100 luma) — the whole staggered stance
     vanished into the shadow at 1/3-res+dither, so the "drunk-wide stance" half of the signature
     never read at all. Also r2's sleeve color (shirtDk, luma ~152) sat almost luma-identical to
     the bare-forearm skin tone (luma ~155), so the rolled-sleeve/forearm break — and with it any
     visible elbow joint — disappeared into one flat tube. Both fixed here: legs bumped a full
     step brighter (still darker than the shirt, still reads as trousers) and a dedicated dark
     P.sleeve (luma ~61) replaces shirtDk on the arms so the sleeve/forearm value break — and the
     elbow bend it sits on — survives the render. */
  const P = {
    shirt: 0xd8caa0, shirtDk: 0xa89870,
    pants: 0x8a7452, pantsDk: 0x64523a,
    boot: 0x7c6848, bootDk: 0x584a34,
    skin: 0xc4906a, skinDk: 0x8f6244, flush: 0xd67858,
    susp: 0x3a3226, buckle: 0xc4a852,
    sleeve: 0x4a3a26,
    mouth: 0x241a14, teeth: 0xe8dcc0,
    disc: 0x36312a, discTop: 0x423b32,
  };

  /* ===== SPINE — the full haymaker twist. Rings rotate about the vertical axis by an angle
     that grows from the hip (near-square) to the shoulder (~46 deg further), per POSE-ANATOMY's
     amended law 5: the spine curve is authored FIRST as this rotation, then everything hangs
     off it. ===== */
  const L = {
    hipY: 0.36, waistY: 0.50, ribY: 0.64, chestY: 0.78, shldY: 0.90, neckY: 0.965,
    jawY: 1.03, browY: 1.095, crownY: 1.14,
  };
  /* CAMERA NOTE: ps1-sheet's dimetric camera sits at +x/+y/+z looking at the origin, so +x/+z
     reads near-camera and -x/-z reads far-camera (the corner directly opposite the camera is
     the one that gets swallowed by the torso's own mass). The twist sign below is chosen so the
     REAR (loaded) shoulder rotates toward +x/-z (near-camera side, low, still reads in
     silhouette) and the LEAD shoulder rotates toward -x/+z (reaches forward toward the camera
     regardless of x-side, so it stays visible too). */
  const HIP_ANG = -0.10, SHLD_ANG = -(0.10 + 0.80);   // ~5.7deg -> ~51.4deg = ~46deg of twist
  const HEAD_ANG = SHLD_ANG + 0.52;                   // head partially untwists back toward the mark
  function rotY(p, ang){
    const c = Math.cos(ang), s = Math.sin(ang);
    return V(p.x * c - p.z * s, p.y, p.x * s + p.z * c);
  }
  function twist(p){
    const t = Math.min(1, Math.max(0, (p.y - L.hipY) / (L.shldY - L.hipY)));
    return rotY(p, HIP_ANG + t * (SHLD_ANG - HIP_ANG));
  }
  const headXf = (p) => rotY(p, HEAD_ANG);

  /* ===== LEGS — staggered drunk-wide stance. Lead (right, -x) planted forward and bent, taking
     the forward-loaded weight; rear (left, +x) splayed wide and back as the twist's
     counterweight, foot turned out, less braced than a sober fighter's stance. Sides match the
     twisted shoulders below (lead arm/leg both -x, rear/loaded arm/leg both +x, the near-camera
     side per the camera note above). ===== */
  {
    // LEAD leg (-x): forward, bent, weight-bearing
    const hipF = twist(V(-0.135, L.hipY, 0.01));
    const kneeF = V(-0.235, 0.205, 0.175);
    const footF = V(-0.215, 0.03, 0.320);
    tube(hipF, kneeF, 0.100, 0.082, 6, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeF, footF, 0.082, 0.062, 6, P.pantsDk, { capB: { hex: P.boot, lift: 0.018 } });
    // boot toe wedge
    quad(V(footF.x + 0.05, 0.015, footF.z + 0.02), V(footF.x - 0.05, 0.015, footF.z + 0.02),
      V(footF.x - 0.045, 0.045, footF.z + 0.09), V(footF.x + 0.045, 0.045, footF.z + 0.09), P.boot, 0.04);

    // REAR leg (+x): splayed wide, back, turned out — the drunk stagger, near-camera side
    const hipR = twist(V(0.135, L.hipY, -0.02));
    const kneeR = V(0.275, 0.185, -0.150);
    const footR = V(0.305, 0.03, -0.245);
    tube(hipR, kneeR, 0.095, 0.078, 6, P.pants, { capA: { hex: P.pantsDk } });
    tube(kneeR, footR, 0.078, 0.058, 6, P.pantsDk, { capB: { hex: P.boot, lift: 0.018 } });
    quad(V(footR.x + 0.05, 0.015, footR.z - 0.06), V(footR.x + 0.005, 0.015, footR.z + 0.02),
      V(footR.x + 0.010, 0.045, footR.z + 0.07), V(footR.x + 0.06, 0.045, footR.z - 0.01), P.bootDk, 0.04);
  }

  /* ===== TORSO — beefy no-waist-taper barrel (drunk-heavy build), twisted through the spine
     rotation. Belt/waistband breaks shirt from trousers; the gut is the widest, un-tapered
     band (the "bigger, softer, meaner-when-riled" read). ===== */
  const torsoBands = [
    { y: L.hipY,   rx: 0.185, rz: 0.165, hex: P.pants },
    { y: L.waistY, rx: 0.238, rz: 0.218, hex: P.shirtDk },   // belt line -> shirt begins, gut push
    { y: L.ribY,   rx: 0.248, rz: 0.205, hex: P.shirt },
    { y: L.chestY, rx: 0.252, rz: 0.198, hex: P.shirtDk },
    { y: L.shldY,  rx: 0.278, rz: 0.188, hex: P.shirt },     // widest — twisted shoulders
    { y: L.neckY,  rx: 0.096, rz: 0.088, hex: P.skinDk },
  ];
  stack(torsoBands, 8, { xform: twist });

  /* belt line — dark waistband breaking pants from shirt, with a bright buckle (a small
     high-value glint low on the twisted torso) */
  {
    const c = twist(V(0, L.hipY + 0.03, 0.185));
    quad(V(c.x - 0.09, c.y - 0.018, c.z), V(c.x + 0.09, c.y - 0.018, c.z),
      V(c.x + 0.09, c.y + 0.018, c.z), V(c.x - 0.09, c.y + 0.018, c.z), P.pantsDk, 0.04);
    quad(V(c.x - 0.022, c.y - 0.016, c.z + 0.006), V(c.x + 0.022, c.y - 0.016, c.z + 0.006),
      V(c.x + 0.022, c.y + 0.016, c.z + 0.006), V(c.x - 0.022, c.y + 0.016, c.z + 0.006), P.buckle, 0.03);
  }

  /* open shirt collar — pale V-notch at the throat, following the twist up to the neck */
  {
    const top = twist(V(0, L.shldY + 0.03, 0.145));
    const lo = twist(V(0, L.chestY - 0.02, 0.175));
    quad(V(top.x - 0.055, top.y, top.z), V(top.x + 0.055, top.y, top.z),
      V(lo.x + 0.018, lo.y, lo.z), V(lo.x - 0.018, lo.y, lo.z), P.skin, 0.04);
  }

  /* suspender straps — two dark straps riding the twisted shoulders down to the belt, a
     countable costume feature that also breaks up the pale shirt mass */
  for(const s of [-1, 1]){
    const top = twist(V(s * 0.075, L.shldY + 0.02, 0.03));
    const mid = twist(V(s * 0.10, L.chestY, 0.155));
    const bot = twist(V(s * 0.06, L.hipY + 0.03, 0.185));
    quad(V(top.x - 0.018, top.y, top.z), V(top.x + 0.018, top.y, top.z),
      V(mid.x + 0.016, mid.y, mid.z), V(mid.x - 0.016, mid.y, mid.z), P.susp, 0.04);
    quad(V(mid.x - 0.016, mid.y, mid.z), V(mid.x + 0.016, mid.y, mid.z),
      V(bot.x + 0.014, bot.y, bot.z), V(bot.x - 0.014, bot.y, bot.z), P.susp, 0.04);
  }

  /* ===== HEAD — chin tucked, partially untwisted back toward the mark. Flushed drunk cheeks
     (high-value), furrowed brow, open snarling mouth, bald/shaved. ===== */
  {
    const headBands = [
      { y: L.jawY,    rx: 0.108, rz: 0.100, hex: P.skinDk },
      { y: L.browY,   rx: 0.130, rz: 0.122, hex: P.skin },    // widest — jaw/cheek band
      { y: L.crownY,  rx: 0.100, rz: 0.092, hex: P.skinDk },
    ];
    stack(headBands, 8, { xform: headXf, capTop: { hex: P.skinDk, lift: 0.03 } });

    const jawC = headXf(V(0, L.jawY, 0.098));
    const browC = headXf(V(0, L.browY, 0.118));

    /* furrowed dark brow ridge */
    quad(V(jawC.x - 0.075, browC.y + 0.03, browC.z), V(jawC.x + 0.075, browC.y + 0.03, browC.z),
      V(jawC.x + 0.06, browC.y + 0.055, browC.z - 0.01), V(jawC.x - 0.06, browC.y + 0.055, browC.z - 0.01), P.skinDk, 0.03);

    /* flushed drunk cheeks — the law-3 high-value patch on the face */
    for(const s of [-1, 1]){
      const p = headXf(V(s * 0.085, L.browY - 0.01, 0.100));
      quad(V(p.x - 0.026, p.y - 0.022, p.z), V(p.x + 0.026, p.y - 0.022, p.z),
        V(p.x + 0.022, p.y + 0.022, p.z), V(p.x - 0.022, p.y + 0.022, p.z), P.flush, 0.05);
    }

    /* snarling open mouth, teeth baring */
    quad(V(jawC.x - 0.042, jawC.y - 0.052, jawC.z), V(jawC.x + 0.042, jawC.y - 0.052, jawC.z),
      V(jawC.x + 0.036, jawC.y - 0.012, jawC.z + 0.006), V(jawC.x - 0.036, jawC.y - 0.012, jawC.z + 0.006), P.mouth, 0.03);
    quad(V(jawC.x - 0.034, jawC.y - 0.020, jawC.z + 0.004), V(jawC.x + 0.034, jawC.y - 0.020, jawC.z + 0.004),
      V(jawC.x + 0.028, jawC.y - 0.010, jawC.z + 0.008), V(jawC.x - 0.028, jawC.y - 0.010, jawC.z + 0.008), P.teeth, 0.04);
  }

  /* ===== ARMS — POSE-ANATOMY law 2/3: shoulders ride with the twist, elbows always bent
     100-150 deg. Rolled shirt-sleeves (dark sleeve above the elbow, pale bare forearm below)
     carry the signature's high-value zone on both arms. ===== */

  /* LEAD arm (-x) — bent up into a guard at chest/chin height, probing the range, reaching
     toward the camera in +z so it stays clear of the silhouette regardless of x-side.
     R2 SELF-CORRECTION (post r1 engine render): r1's elbow/wrist placement put the whole arm
     nearly on the shoulder-wrist line, so it foreshortened to a near-straight diagonal in this
     camera's projection (a law-2 near-miss even though the raw 3D angle was technically bent).
     R3 CRITIC PASS (post r2 render, question d): r2's "fix" still read as a near-straight stub —
     a true 3D interior angle isn't enough if the bend plane is nearly edge-on to THIS camera
     (yaw45/el30 dimetric); measured r2's actual on-screen perpendicular deviation from the
     shoulder-wrist line at only ~17% of the arm's screen length, invisible under 1/3-res+dither.
     Re-solved numerically against the camera's actual right/up basis (elbow tucked down+forward
     close to the ribs, wrist folded back up to chest height) for a ~108 deg interior angle AND
     ~32% screen-space perpendicular deviation — a real zigzag on screen, not just in 3D. */
  {
    const sh = twist(V(-0.185, L.shldY - 0.005, 0.01));
    const el = V(-0.14, 0.76, 0.27);
    const wr = V(-0.20, 0.84, 0.44);
    tube(sh, el, 0.062, 0.052, 6, P.sleeve);                        // rolled sleeve, upper arm
    tube(el, wr, 0.048, 0.038, 6, P.skin, { phase: Math.PI / 6 });  // bare forearm, exposed
    /* loose lead fist */
    quad(V(wr.x - 0.026, wr.y - 0.026, wr.z), V(wr.x + 0.026, wr.y - 0.026, wr.z),
      V(wr.x + 0.022, wr.y + 0.026, wr.z + 0.018), V(wr.x - 0.022, wr.y + 0.026, wr.z + 0.018), P.skin, 0.04);
  }

  /* REAR arm (+x, the near-camera side) — drawn back low behind the hip, loaded, pushed well
     out past the torso's silhouette in x so the loaded fist clears the body instead of hiding
     directly behind it (r1 self-correction: the far-side placement fully occluded it).
     R3 CRITIC PASS (post r2 render, question d): r2's elbow/wrist read as one dead-straight
     stick on screen (measured ~16% perpendicular deviation — the 3D interior angle was real but
     the bend plane was nearly edge-on to this camera). Re-solved numerically against the
     camera's actual right/up basis: upper arm swings out and BACK, forearm folds forward-and-
     down to pull the fist in low behind the hip — a ~113 deg interior angle with ~39% screen-
     space perpendicular deviation, a real elbow corner on screen instead of a straight reach. */
  {
    const sh = twist(V(0.185, L.shldY - 0.005, -0.01));
    const el = V(0.28, 0.70, -0.36);
    const wr = V(0.14, 0.40, -0.40);
    tube(sh, el, 0.062, 0.052, 6, P.sleeve);
    tube(el, wr, 0.048, 0.038, 6, P.skin, { phase: Math.PI / 6 });
    /* loaded rear fist — lifted a shade brighter so it doesn't vanish into the dark pants/void
       behind the hip (law 3) */
    quad(V(wr.x - 0.028, wr.y - 0.028, wr.z), V(wr.x + 0.028, wr.y - 0.028, wr.z),
      V(wr.x + 0.024, wr.y + 0.028, wr.z - 0.018), V(wr.x - 0.024, wr.y + 0.028, wr.z - 0.018), P.skin, 0.04);
    quad(V(wr.x - 0.02, wr.y + 0.006, wr.z - 0.02), V(wr.x + 0.02, wr.y + 0.006, wr.z - 0.02),
      V(wr.x + 0.016, wr.y + 0.026, wr.z - 0.03), V(wr.x - 0.016, wr.y + 0.026, wr.z - 0.03), 0xdcc4a0, 0.05);
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.42, 0.42, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.40, 0.40, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
