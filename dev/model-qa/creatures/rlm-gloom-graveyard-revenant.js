/* dev/model-qa/creatures/rlm-gloom-graveyard-revenant.js — GRAVEYARD REVENANT landmark table
   (HUMANOID family, Huge, CR 7, realm gloom), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000
   tri band (2026-07-08 foundry pilot, gloom-w2). Bestiary frame "graveyard-revenant" (realm entry
   "Vestry Revenant", data/realm-bestiary.js): a murdered sexton, swollen with grave-rot fury,
   clawing through churchyard soil with hands too big for the shovel that used to fit them — it
   will not stop turning earth until it finds whoever killed it.

   HUGE-EXCEPTION NOTE (docs/MODEL-FOUNDRY.md tri-band clause): this unit may run over the 2,000-tri
   ceiling — a Huge apex with an asymmetric swollen torso + a full digging rig (shovel, stamping
   foot, dirt spray) genuinely needs the extra geometry to read; every extra tri below is spent on
   one of the six checklist features below, never on padding/smoothing.

   FEATURE CHECKLIST (the budget buys):
     1. HUMANOID Huge swollen anatomy — a distended, LOPSIDED torso (one shoulder built higher and
        heavier than the other, belly bulged off-center) bent hard forward over a wide dig-brace
        stance (anatomy chief criterion: reads as a wrong-shaped mass of a man, never a clean giant).
     2. SIGNATURE — the shovel: a long worn wood handle gripped by both oversized hands, ending in a
        broad PALE worn steel blade driven into the earth — the blade carries the loudest high-value
        zone in the model (law 3), the one unmistakable prop that names the creature at a glance.
     3. Foot stamped flat on the blade's shoulder, driving it down — the front leg leaves the ground
        entirely to press the dig, tying legs+shovel into one continuous digging motion (never a
        static stance).
     4. Head wrenched up and back against the forward-bent spine, jaw dropped in a furious glare —
        the moment the digging is interrupted by whatever it just sensed (the high-expression beat;
        law 5). The neck arcs backward while the torso keeps driving forward — an active fight
        between the two halves of the pose, not a neutral hunch.
     5. Grave-dirt spray — small dark clod blobs flung up around the blade plus caked dirt patches on
        the forearms/knees, dark-on-pale-swollen-flesh value contrast (law 3) and the "still digging"
        tell.
     6. Ragged sexton's apron strap — a single torn dark cloth band crossing the swollen torso, the
        one relic of the man he used to be before the grave-rot took him.

   POSE SENTENCE: caught mid-thrust of the dig — torso driven forward and down over a wide brace, one
   massive boot stamped flat onto the shovel's shoulder to drive the pale blade into the churchyard
   dirt while both oversized hands haul the long handle down after it, and at the exact instant of
   the plunge the head snaps backward and up off the bent spine, jaw wrenched open in a furious
   glare toward whoever it just sensed — the digging doesn't stop, the fury just interrupts it for
   one look.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['gloom-w2'], cell 10). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildGraveyardRevenant(){
  /* ---------- PALETTE — sickly swollen grave-flesh, caked dirt, pale worn shovel steel (the
     signature's high-value payload), a scrap of rotted sexton's cloth. ---------- */
  const P = {
    skin:0x7c8266, skinDk:0x565c42, skinLt:0x9aa07c,     // grave-rot swollen flesh, sickly green-grey
    dirt:0x2e2419, dirtDk:0x1c150d, dirtLt:0x463521,      // caked/flung churchyard dirt — dark, low-value
    wood:0x5a4530, woodDk:0x3e3020,                       // shovel handle
    steel:0xece6d4, steelDk:0x9a927c,                     // SIGNATURE — pale worn blade, near-white
    cloth:0x2a2420, clothLt:0x3c332c,                     // ragged apron strap
    eye:0x1a1210, eyeGlow:0xd8a028,                       // furious glare
    mouth:0x100a08, teeth:0xcabf9c,
    nail:0x201a14,
    disc:0x4a4038, discTop:0x585047,
  };

  /* ---------- LANDMARKS — an S-curve: torso bends FORWARD (cz climbs hip->shoulder), then the
     neck/head arcs back UP (cz falls again, crown pulled behind the chest) — the fight between the
     dig-lean and the wrenched-back glare. Deliberately asymmetric shoulder heights (built as
     separate deltoid blobs below, not a symmetric ring) for the "one shoulder higher" swelling. ---- */
  const L = {
    hipY:1.05, waistY:1.26, ribY:1.46, chestY:1.62, shldY:1.72,
    hipHalf:0.300, shoulderX:0.420,
    neckY:1.62, jawY:1.75, cheekY:1.85, browY:1.95, crownY:2.05, headTopY:2.13,
  };

  /* ===== TORSO — swollen, lopsided, bent forward. Rib/waist bulge off-center (cx) toward the
     heavier (right, s=1) side; cz climbs through the stack = the forward dig-lean. ===== */
  const torsoRings = stack([
    { y:L.hipY,   rx:0.300, rz:0.260, cz:0.020, hex:P.skinDk },
    { y:L.waistY, rx:0.350, rz:0.300, cz:0.090, cx:0.015, hex:P.skin },
    { y:L.ribY,   rx:0.375, rz:0.320, cz:0.170, cx:0.030, hex:P.skinLt },
    { y:L.chestY, rx:0.330, rz:0.280, cz:0.250, cx:0.020, hex:P.skin },
    { y:L.shldY,  rx:0.260, rz:0.220, cz:0.300, hex:P.skinDk },
  ], 10, {});

  /* ragged sexton's apron strap — a single torn dark cloth band crossing the swollen torso corner
     to corner, the "used to be someone" relic.
     CRITIC R2 FIX (two failed attempts, both diagnosed by a red-debug swap of the quad's fill color
     then re-rendered): attempt 1 pushed the flat quad's z-depth out from 0.24-0.34 to ~0.46-0.54 to
     clear the torso shell's own front wall (surface z ≈ cz+rz ≈ 0.49-0.53 there) — necessary but not
     sufficient, still invisible. Attempt 2 (mis-diagnosed as a winding/backface-cull problem) got
     reverted. The debug render showed the true cause: a FLAT quad laid tangent to the torso's
     curved surface is nearly edge-on to this dimetric camera (its face normal ends up dominated by
     x/y, barely any z) — it doesn't get culled, it just projects to a hairline. Rebuilt as a small
     TUBE (a raised cord, like every limb/handle in this file) instead of a flat plane — a cylinder
     always presents a lit cross-section to camera regardless of viewing angle, so it can't go
     edge-on. Two segments hug the chest's curve (shoulder -> apex -> rib). */
  {
    const strapTop = V(-0.16, L.shldY+0.02, 0.50);
    const strapMid = V(-0.02, L.chestY-0.04, 0.565);
    const strapBot = V(0.14,  L.ribY-0.08,  0.44);
    tube(strapTop, strapMid, 0.026, 0.030, 5, P.cloth);
    tube(strapMid, strapBot, 0.030, 0.024, 5, P.cloth, { capB:{hex:P.clothLt} });
  }

  /* ===== DELTOIDS — the "one shoulder higher" swelling. Right (s=1) is bigger + built HIGHER than
     left (s=-1): the asymmetry a symmetric ring stack can't buy. ===== */
  // R2 SELF-CORRECTION: both deltoids read the same pale value family as the head (skinLt/skin),
  // so the head fused into one shapeless lump with the shoulder mass at a squint. Pushed BOTH
  // deltoids darker (skinDk) so the paler head pops clear above them (law 3: value contrast should
  // separate the readable parts, not just decorate them).
  const shR = V(L.shoulderX+0.02, L.shldY+0.09, 0.235);
  const shL = V(-L.shoulderX,     L.shldY-0.07, 0.215);
  blob(shR.x, shR.y, shR.z, 0.135, 0.115, 0.125, P.skinDk, 8, 5);
  blob(shL.x, shL.y, shL.z, 0.110, 0.095, 0.100, P.skinDk, 8, 5);

  /* ===== HEAD — the S-curve payoff: neck pulls back in from the chest's cz (0.30 -> 0.22), then
     jaw/cheek/brow/crown keep pulling back and UP (cz falling toward/through 0) while y climbs
     hard — the head wrenched backward off the forward-driving spine. ===== */
  const headRings = stack([
    { y:L.neckY,   rx:0.135, rz:0.130, cz:0.220, hex:P.skinDk },
    { y:L.jawY,    rx:0.165, rz:0.175, cz:0.100, hex:P.skinLt },
    { y:L.cheekY,  rx:0.190, rz:0.180, cz:0.045, hex:P.skinLt },
    { y:L.browY,   rx:0.170, rz:0.150, cz:0.010, hex:P.skinLt },
    { y:L.crownY,  rx:0.130, rz:0.110, cz:-0.030, hex:P.skinDk },
  ], 9, { capTop:{ hex:P.skinDk, lift:0.02 } });

  /* furious glaring eyes, sunk under a heavy swollen brow, angled up-and-back tracking whatever it
     sensed behind/above it */
  for(const s of [-1, 1]){
    const ex = s*0.062, ey = L.browY-0.01, ez = 0.020;
    blob(ex, ey, ez, 0.028, 0.024, 0.022, P.eye, 6, 4);
    blob(ex + s*0.010, ey + 0.006, ez + 0.014, 0.011, 0.011, 0.011, P.eyeGlow, 4, 2);
  }

  /* jaw dropped open in a furious glare — a dark gap plus a row of blunt teeth */
  quad(V(-0.062, L.cheekY-0.010, 0.075), V(0.062, L.cheekY-0.010, 0.075),
       V(0.050,  L.jawY-0.075,   0.045), V(-0.050, L.jawY-0.075,   0.045), P.mouth, 0.02);
  for(const s of [-1, 1]) for(const k of [0, 1]){
    const tx = s*(0.020 + k*0.022);
    tube(V(tx, L.cheekY-0.014, 0.078), V(tx, L.jawY-0.045, 0.058), 0.011, 0.006, 3, P.teeth, { capB:{hex:P.teeth} });
  }

  /* ===== LEGS — the dig brace. Back leg (s=-1) planted normal weight-bearing; front leg (s=1)
     leaves the ground, knee driving up and forward, foot flat-stamped on the shovel blade's
     shoulder (matches the blade's socket coords below — the pose's mechanical anchor point). ===== */
  {
    // back leg — planted, weight-bearing brace
    const hipB = V(-0.230, L.hipY-0.03, 0.040);
    const kneeB = V(-0.345, 0.560, 0.260);
    const ankB = V(-0.300, 0.075, 0.090);
    const toeB = V(-0.300, 0.050, 0.290);
    tube(hipB, kneeB, 0.135, 0.100, 8, P.skin);
    blob(kneeB.x, kneeB.y, kneeB.z, 0.075, 0.065, 0.065, P.dirt, 6, 4);   // caked dirt patch
    tube(kneeB, ankB, 0.096, 0.070, 8, P.skinDk);
    tube(ankB, toeB, 0.070, 0.048, 6, P.skinDk, { capB:{hex:P.skinDk} });

    // front leg — driving, foot stamped on the blade shoulder (y~0.20, matches shovel below)
    const hipF = V(0.245, L.hipY-0.02, 0.055);
    const kneeF = V(0.360, 0.680, 0.430);
    const ankF = V(0.190, 0.280, 0.600);
    const toeF = V(0.155, 0.190, 0.690);
    tube(hipF, kneeF, 0.140, 0.105, 8, P.skinLt);
    blob(kneeF.x, kneeF.y, kneeF.z, 0.062, 0.054, 0.054, P.dirt, 6, 4);   // caked dirt patch
    tube(kneeF, ankF, 0.098, 0.072, 8, P.skin);
    tube(ankF, toeF, 0.078, 0.062, 6, P.skinDk, { capB:{hex:P.skinDk} });
  }

  /* ===== SHOVEL — the signature. Long wood handle, both oversized hands hauling it down; the
     broad pale worn blade (the model's loudest high-value zone) driven into the earth right at the
     churchyard soil, its flanged "shoulder" exactly where the front foot stamps. ===== */
  // R2 SELF-CORRECTION (author pass): r1's blade (rx 0.115->0.018, tucked at z 0.575-0.64) sat
  // mostly BEHIND the front leg's own silhouette — widened + pushed forward past the leg's z-reach.
  // CRITIC R2 FIX (fresh-context pass): that widen still ran the blade shaft nearly PARALLEL to the
  // front ankle->toe tube (both drifting -x/+z/-y together), so the wide flanged-shoulder end (the
  // actual high-value payload) stayed screen-behind the shin mass — only the thin tapered tip-corner
  // escaped, a near-invisible sliver (verified: crop of the r2 render shows one white corner pixel
  // cluster, not a readable blade). Diverged the tip laterally (+x) AND further forward (+z) so the
  // shaft's screen-space direction splits away from the leg's instead of tracking it, widened the
  // taper (0.024->0.050 min radius, less needle-thin) so it survives 1/3-res dither even at the tip,
  // and grew the socket flange (0.145->0.170) since it's now clear of the shin and can carry more
  // of the "loudest high-value zone" real estate law 3 asks for.
  const bladeTip  = V(0.235, 0.018, 0.870);
  const bladeSock = V(0.150, 0.240, 0.620);   // the flanged shoulder — foot lands here
  const handleTop = V(-0.090, 1.430, 0.140);
  {
    // blade — flattened wedge (wide/thin cross-section, n=4), tapering to a driven point
    tube(bladeSock, bladeTip, 0.170, 0.050, 4, P.steel, { raz:0.042, rbz:0.017, capB:{hex:P.steel} });
    // worn scuffed step-ridge on the shoulder — the darker band the boot presses against
    blob(bladeSock.x, bladeSock.y+0.01, bladeSock.z-0.01, 0.090, 0.032, 0.070, P.steelDk, 6, 3);
    // socket collar + wood handle up to the grip
    tube(bladeSock, handleTop, 0.056, 0.032, 6, P.wood, { capB:{hex:P.woodDk, lift:0.02} });
  }

  /* both oversized hands hauling the handle — lower hand near the socket, upper hand near the top,
     rooted off the two lopsided shoulders (right/higher shoulder -> upper grip; left/lower
     shoulder -> lower grip, so the arm reach matches the shoulder that owns it). R2 SELF-CORRECTION:
     r1's elbow waypoints sat well OFF the handle's own line (x 0.13/0.01 vs the shaft's actual
     x~-0.006/0.009 at those heights), so the arms read as an independent "raised fist" flourish
     instead of two hands hauling a shaft. Elbow waypoints now sit ON the bladeSock->handleTop line. */
  {
    const gripLow  = V(0.058, 0.720, 0.400);
    const gripHigh = V(-0.065, 1.230, 0.215);
    // upper hand — off the higher right shoulder, elbow riding the shaft line
    tube(shR, V(-0.006, 0.980, 0.303), 0.088, 0.066, 7, P.skinLt);
    tube(V(-0.006, 0.980, 0.303), gripHigh, 0.066, 0.044, 7, P.skin);
    blob(gripHigh.x, gripHigh.y, gripHigh.z, 0.052, 0.044, 0.046, P.skinDk, 6, 4);
    // lower hand — off the lower left shoulder, elbow riding the shaft line
    tube(shL, V(0.009, 0.900, 0.332), 0.078, 0.058, 7, P.skinDk);
    tube(V(0.009, 0.900, 0.332), gripLow, 0.058, 0.040, 7, P.skin);
    blob(gripLow.x, gripLow.y, gripLow.z, 0.048, 0.040, 0.042, P.skinLt, 6, 4);
    // a couple of claw-nails per fist, cheap readability
    for(const g of [gripHigh, gripLow]) for(const s of [-1,1]){
      tube(V(g.x+s*0.03, g.y-0.01, g.z), V(g.x+s*0.045, g.y-0.035, g.z+0.03), 0.010, 0.004, 3, P.nail, { capB:{hex:P.nail} });
    }
  }

  /* grave-dirt spray — small dark clods flung up around the driven blade, the "still digging" tell.
     CRITIC R2 FIX: re-centered on the blade's new (diverged) tip position so the spray still reads
     as "flung off the impact point" rather than floating disconnected near the old tip. */
  {
    const spray = [
      [0.340, 0.066, 0.790, 0.032], [0.165, 0.051, 0.930, 0.026],
      [0.395, 0.106, 0.920, 0.022], [0.095, 0.034, 0.840, 0.024],
      [0.275, 0.136, 0.960, 0.018],
    ];
    for(const [x,y,z,r] of spray) blob(x, y, z, r, r*0.8, r, (r>0.026)?P.dirt:P.dirtLt, 5, 3);
  }

  /* ===== base disc (Huge stance, wide enough for the forward-braced dig footprint).
     CRITIC R2 FIX: widened slightly (0.62->0.68) so the un-occluded, further-forward blade tip +
     spray still land comfortably inside the footprint instead of floating past its edge. ===== */
  {
    const r1 = ring(V(0,0.002,0.12), V(0,1,0), 0.68, 0.68, 18);
    const r2 = ring(V(0,0.055,0.12), V(0,1,0), 0.66, 0.66, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0.12), P.discTop);
  }
}
