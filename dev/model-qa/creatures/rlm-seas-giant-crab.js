/* dev/model-qa/creatures/rlm-seas-giant-crab.js — the GIANT CRAB landmark table (ARTHROPOD family,
   crab variant, Small, CR 1/8, realm high-seas), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000
   tri band (2026-07-08 foundry pilot, seas-w1 cell 3, port 5253). Core identity: the render key
   "giant-crab" (frame:"giant-crab" in data/realm-bestiary.js — matches the "Gull-Picked Corpse Crab",
   Small/CR 1/8, "Scavenging tideline crab drawn to the recently dead"). Bespoke to the chassis;
   other giant-crab-frame reskins (e.g. the Medium "Reef-Crawling Giant Crab") ride it narratively.

   ANATOMY DEVIATION FROM ANATOMY-CANON's spider/insect ARTHROPOD write-up (intentional, per the
   DIRECTION brief): a crab's body is ONE wide flat carapace mass, not the pinched two/three-part
   spider/insect body — so the carapace is authored as a single flattened-dome loft instead of a
   pinched waist. The family's other tells are kept in full: radial leg pairs splaying outward with
   the signature spider-knee tent-pole silhouette (femur up-and-out -> tibia down past vertical ->
   thin tarsus foot), flat-shaded low-poly tube legs.

   FEATURE CHECKLIST (the ~950-1300 budget buys):
     1. ARTHROPOD carapace — a single wide flat dome loft (rx notably > rz, flattened height), the
        widest band at the leg-root line, tapering up to a domed cap and down to a dark underside
        rim. Whole body torques a touch toward +x as it rises (cx drift band-to-band) — the lean of
        a body already committed to a lateral rush, not a level idle disc.
     2. 4 leg pairs (8 legs total) mounted at the carapace's widest rim, each the family's tent-pole
        arch: femur rises up-and-out past the shell's own top edge (knees ABOVE the shell line, the
        ANATOMY-CANON reading cue), tibia bends down past vertical, a thin tarsus foot angles to the
        ground. The leading (+x) side's legs reach further out and are planted more forward than the
        trailing (-x) side's, which stay gathered close under the body — the two-sided asymmetric
        stride that sells a sideways scuttle rather than a level stand.
     3. SIGNATURE — ONE oversized crusher claw on the leading (+x) side, raised open: a thick merus/
        carpus arm reaching up and forward to a big rounded crusher palm (propodus), then two long
        tapering pincer tines (fixed + movable/dactyl) held in a wide open V. Both tines run the
        PALE high-value tone (law 3 lands directly on the signature) with a small dark tip point,
        the "pale inner edge = high-value" DIRECTION brief beat.
     4. The small claw — trailing (-x) side, much smaller scale, tucked low and close against the
        body, tines nearly shut (a tight closed gap, not the big claw's open V) — the asymmetric
        counterweight law 5 wants (an idle held-in limb next to the loud threat display).
     5. Eyestalks — two short stalks off the carapace's front-center rim, canting forward-and-out,
        each capped with a pale eye (dark pupil nudged forward) — the second, cheaper "this is alive
        and watching" tell alongside the claw.
     6. Mottled shell texture — a few scattered bump nodules on the carapace top (cheap value/texture
        beat) plus a small dark mandible patch at the front-center underside — countable features,
        not padding.

   POSE SENTENCE: the threat-scuttle — carapace held HIGH on legs mid-sideways-rush toward its own
   leading (+x) side, that side's four legs splayed wide and planted forward while the trailing side
   gathers tight underneath, the oversized crusher claw thrown up and open on the leading shoulder as
   a threat display while the small claw stays tucked low and closed against the body — never a level
   idle stand, always the half-second of the scuttle-and-raise itself.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['seas-w1'], cell 3, fn buildGiantCrab). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

/* an eye = pale sphere + a dark pupil nudged toward dir=[dx,dy,dz] (cosmic-set/medusa idiom). */
function eye(cx, cy, cz, r, dir, pale, pupil){
  blob(cx, cy, cz, r, r, r, pale, 6, 4);
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0] / n, dy = dir[1] / n, dz = dir[2] / n;
  blob(cx + dx * r * 0.60, cy + dy * r * 0.60, cz + dz * r * 0.60, r * 0.50, r * 0.50, r * 0.50, pupil, 5, 3);
}

/* one walking leg: root (carapace rim) -> knee (femur peak, ABOVE the shell line) -> ankle (tibia
   bend, down past vertical) -> foot (thin tarsus, ground). Three tapering tube segments = the
   ANATOMY-CANON arthropod tent-pole tell. */
function leg(root, knee, ankle, foot, hexA, hexB){
  tube(root, knee, 0.034, 0.024, 5, hexA);
  tube(knee, ankle, 0.024, 0.017, 5, hexA);
  tube(ankle, foot, 0.017, 0.012, 5, hexB, { capB: { hex: hexB } });
}

export function buildGiantCrab(){
  /* ---------- PALETTE (dull mottled tideline register — a scavenger's shell, not a bright reef
     color; the pale claw tines are the ONE loud high-value beat law 3 needs). ---------- */
  const P = {
    shell: 0x8a7a52, shellDk: 0x5f5236, shellLt: 0xa89768,      // mottled olive-brown carapace
    legOuter: 0x6b5c3c, legTip: 0x8a7a52,                        // leg segments
    clawBase: 0x5f5236, clawPalm: 0x4a3f28,                      // claw arm + crusher palm (darker vs. pale tines)
    clawPale: 0xe8dcb0, clawTip: 0x2a2016,                       // SIGNATURE pale tines + dark point
    eyeStalk: 0x8a7a52, eyeWhite: 0xd8cf9a, pupil: 0x1c1610,
    mouth: 0x241c14,
    disc: 0x30281c, discTop: 0x3c3224,
  };

  /* ===== CARAPACE — single wide flat dome loft, widest at the leg-root rim, a subtle +x torque
     band-to-band (the body already leaning into its own rush direction, not a level idle disc). */
  stack([
    { y: 0.155, cx: 0.000, rx: 0.280, rz: 0.190, hex: P.shellDk },   // underside rim
    { y: 0.235, cx: 0.012, rx: 0.335, rz: 0.225, hex: P.shell },     // widest — leg/claw root line
    { y: 0.300, cx: 0.028, rx: 0.280, rz: 0.185, hex: P.shell },     // domes up
    { y: 0.340, cx: 0.042, rx: 0.155, rz: 0.105, hex: P.shellLt },   // top
  ], 10, { phase: Math.PI / 10, capTop: { hex: P.shellLt, lift: 0.018 }, capBot: { hex: P.shellDk, lift: 0.020 } });

  /* mottled shell bump nodules — cheap scattered texture beats, not padding (countable features). */
  blob(-0.06, 0.335, 0.05, 0.032, 0.020, 0.030, P.shellDk, 5, 3);
  blob(0.09, 0.330, -0.06, 0.028, 0.018, 0.026, P.shellLt, 5, 3);
  blob(-0.10, 0.300, -0.10, 0.024, 0.016, 0.022, P.shellDk, 5, 3);

  /* small dark mandible/mouth patch, front-center underside of the carapace. */
  quad(V(-0.028, 0.215, 0.205), V(0.028, 0.215, 0.205), V(0.020, 0.195, 0.195), V(-0.020, 0.195, 0.195), P.mouth, 0.03);

  /* ===== EYESTALKS — two short stalks off the front-center rim, canting forward-and-out, each
     capped with a pale watching eye (the cheap "alive" tell alongside the claw). ===== */
  /* R2 SELF-CORRECTION: r1's stalks (x=+/-0.05, tip y=0.40) sat too close together and too tall —
     they read as one thin vertical spike, not two eyes. Widened the lateral spread and shortened/
     angled them further outward-and-forward so two distinct pale eye blobs separate on the render. */
  for(const s of [-1, 1]){
    const root = V(s * 0.075, 0.290, 0.185);
    const tip = V(s * 0.130, 0.355, 0.270);
    tube(root, tip, 0.024, 0.018, 6, P.eyeStalk);
    eye(tip.x + s * 0.012, tip.y + 0.006, tip.z + 0.012, 0.038, [s * 0.5, 0.15, 1], P.eyeWhite, P.pupil);
  }

  /* ===== LEGS — 4 pairs, mounted at the carapace's widest rim band (y=0.235). Leading (+x) side
     reaches wider and plants further forward (extend=1.0); trailing (-x) side gathers close
     underneath (extend=0.8) — the asymmetric stride that sells the sideways scuttle. ===== */
  {
    /* R2-CRITIC FIX: the trailing (-x) side's knees originally shared the leading side's knee
       height (y=0.365, the ANATOMY-CANON "above the shell line" tell) while only pulling in on
       x. From the capture camera that stacked 4 same-height, closely-spaced knee-points into a
       jagged "crown of spikes" silhouette along the back — reading as spines/a mohawk, not a
       crab, and burying the raised crusher claw as just one more spike in the row (law 2 + law 4
       failure). Trailing knees now sit LOWER (tucked down against the body, not up past the shell
       cap) so the silhouette's only tall element is the claw itself. */
    const legZs = [0.150, 0.050, -0.050, -0.150];
    for(const s of [-1, 1]){
      const extend = (s === 1) ? 1.00 : 0.80;
      const kneeY = (s === 1) ? 0.365 : 0.275;   // trailing side gathers LOW, not just close
      legZs.forEach((z, i) => {
        const fan = (i === 0) ? 0.05 : (i === legZs.length - 1) ? -0.05 : 0; // front/rear splay
        const root = V(s * 0.235, 0.235, z);
        const knee = V(s * 0.400 * extend, kneeY, z + fan * 1.4);
        const ankle = V(s * 0.365 * extend, 0.155, z + fan * 1.1);
        const foot = V(s * 0.440 * extend, 0.024, z + fan * 1.6);   // small ground clearance — ring
                                                                      // planes on an angled tube axis
                                                                      // can dip below the literal y,
                                                                      // so this keeps bbox min.y >= 0.
        leg(root, knee, ankle, foot, P.legOuter, P.legTip);
      });
    }
  }

  /* ===== SIGNATURE — the oversized crusher claw, leading (+x) shoulder, raised open: thick merus/
     carpus arm -> big rounded crusher palm -> two long pale tines held in a wide open V. ===== */
  /* R2 SELF-CORRECTION: r1's tines reached far forward (+z to 0.68-0.72), which blew out the
     bbox's z-extent and forced the auto-framed camera to zoom out — shrinking the whole creature
     (legs, eyes) in-frame and burying the open V in a crowded, distant silhouette. Pulled the
     claw's reach mostly UPWARD instead of forward (raised, not thrown out), widened the open V's
     angular spread so it reads unmistakably even compressed, and thickened/darkened the palm
     against the pale tines for a cleaner value break. */
  {
    const root = V(0.195, 0.255, 0.150);
    const elbow = V(0.310, 0.400, 0.170);
    const wrist = V(0.330, 0.530, 0.190);
    tube(root, elbow, 0.052, 0.044, 7, P.clawBase);
    tube(elbow, wrist, 0.044, 0.038, 7, P.clawBase);
    // crusher palm (propodus) — a big rounded mass, mostly vertical, the "crusher" bulk read.
    blob(0.350, 0.580, 0.210, 0.105, 0.095, 0.110, P.clawPalm, 7, 5);
    // fixed lower tine — held level-forward, pale full length, dark point tip.
    const fixedMid = V(0.400, 0.520, 0.330);
    const fixedTip = V(0.420, 0.495, 0.415);
    tube(V(0.380, 0.545, 0.280), fixedMid, 0.056, 0.036, 6, P.clawPale);
    tube(fixedMid, fixedTip, 0.036, 0.012, 6, P.clawTip, { capB: { hex: P.clawTip } });
    // movable dactyl tine — hinged upper, thrown WAY up-and-open (the raised threat display),
    // pale full length, dark point tip.
    const dactMid = V(0.310, 0.690, 0.300);
    const dactTip = V(0.275, 0.790, 0.335);
    tube(V(0.360, 0.660, 0.280), dactMid, 0.050, 0.030, 6, P.clawPale);
    tube(dactMid, dactTip, 0.030, 0.010, 6, P.clawTip, { capB: { hex: P.clawTip } });
    // hinge dot — cheap dark tell at the palm/tine junction.
    blob(0.365, 0.595, 0.280, 0.022, 0.022, 0.022, P.clawTip, 5, 3);
  }

  /* ===== the small claw — trailing (-x) shoulder, much smaller scale, tucked low and close, tines
     nearly shut — the idle asymmetric counterweight to the loud raised crusher. ===== */
  {
    const root = V(-0.190, 0.220, 0.140);
    const elbow = V(-0.260, 0.190, 0.200);
    const wrist = V(-0.280, 0.170, 0.270);
    tube(root, elbow, 0.026, 0.022, 6, P.clawBase);
    tube(elbow, wrist, 0.022, 0.018, 6, P.clawBase);
    blob(-0.290, 0.165, 0.300, 0.045, 0.035, 0.055, P.clawPalm, 6, 4);
    tube(V(-0.290, 0.145, 0.340), V(-0.285, 0.135, 0.400), 0.022, 0.007, 5, P.clawPale, { capB: { hex: P.clawTip } });
    tube(V(-0.290, 0.185, 0.340), V(-0.280, 0.200, 0.395), 0.020, 0.007, 5, P.clawPale, { capB: { hex: P.clawTip } });
  }

  /* base disc (Small footprint — between the Tiny 0.24 and Medium 0.42 patterns). */
  {
    const r1 = ring(V(0, 0.002, 0), V(0, 1, 0), 0.320, 0.320, 16);
    const r2 = ring(V(0, 0.045, 0), V(0, 1, 0), 0.300, 0.300, 16);
    stitch([r1, r2], () => P.disc);
    capFan(r2, V(0, 0.048, 0), P.discTop);
  }
}
