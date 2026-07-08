/* dev/model-qa/creatures/rlm-gloom-crawling-claw.js — the CRAWLING CLAW (gloom, Tiny undead,
   CR 1/4), authored under docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (2026-07-08 foundry
   pilot). A severed charnel-wall hand scrabbling homeward. Core identity: a severed animate
   hand — NOT a spider, NOT a humanoid — anatomy read quasi-ARTHROPOD per docs/ANATOMY-CANON.md
   (five fingers stand in for the family's radial legs, each with a spider-knee arch peaking
   ABOVE the palm body, per the ARTHROPOD "knees-above-the-body" reading cue). No matching
   data/realm-bestiary.js entry exists yet (this is a NEW unit) — garnish improvised from the
   task flavor line rather than pulled from an existing row.

   FEATURE CHECKLIST (the ~1.1-1.5k budget buys):
     1. Palm body — a flattened, knuckle-ridged mass (NOT a round ball): wide across, shallow
        top-to-bottom, tapering toward the wrist. The countable knuckle ridge across its top face
        (four bumps, one per non-thumb finger root) is the anatomy tell that keeps this reading
        "hand," not "bug body."
     2. Five fingers as radial arthropod legs — each a 3-segment tent-pole (metacarpal → knuckle-
        arch "knee" peaking ABOVE the palm → distal phalanx down to a dark nail tip), splayed
        outward from the palm rim per the ARTHROPOD family canon (never parallel rails).
     3. Countable knuckle segments — a small knob at each finger's mid-joint (the "knee") AND at
        the palm-root joint, so every finger reads as jointed bone, not a smooth tapering horn.
     4. SIGNATURE — the raw wrist stump: a ragged, torn-flesh stump trailing off the palm's back
        edge, dragging low near the ground, with one pale bone spike (radius) poking clear of the
        torn meat — the loud, exaggerated feature named directly in the flavor line.
     5. Value contrast (law 3) — pale bone/skin across the whole hand (palm, finger segments,
        knuckle knobs, stump bone-spike) against DARK nails and dark torn-stump flesh, so the
        signature (stump) and the anatomy tell (fingers) both carry a lit zone.
     6. A small shadow-pool base disc (Tiny, r=0.24) grounding the scuttle without adding a body
        the flavor line doesn't call for.

   POSE SENTENCE: caught mid-scuttle, three fingers planted and driving it forward while the other
   two claw high into the air reaching for the next hold, the ragged wrist-stump dragging low and
   trailing behind — never a splayed, resting starfish, always a hand hauling itself home.

   Whole-object grammar: one exported build fn, probe-lib primitives only, spine +z (the direction
   of travel — reaching fingers point +z, wrist stump trails -z), ground y=0, one landmark table,
   no anchors. Tiny size, footprint kept tight (bbox well under a Small creature's). Imported by
   ps1-sheet.html (SETS['gloom-w1'], cell 10). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

/* one finger = a radial arthropod leg: 3 segments, 2 bends, knees-above-the-body — sized so the
   knee and tip both clear the palm's OWN silhouette (R1 CRITIC FIX: the first pass kept every
   joint within ~0.07-0.19u of the palm rim, so the whole hand read as one round blob with the
   fingers invisibly tucked underneath it — law 2 failure). Distances below are deliberately large
   relative to the palm radius (0.100u) so every finger reads as a distinct spider-knee tent-pole
   breaking the outline, per ANATOMY-CANON ARTHROPOD's "knees peaking over the back" reading cue.
   root  = point on the palm rim the finger springs from (already ON the palm surface).
   dir   = normalized-ish outward direction (xz) the finger reaches toward.
   planted: true = weight-bearing, tip drives down to the ground, splayed OUT to the side; false =
   raised, arcs UP-and-FORWARD well clear of the palm's top, clawing at open air (the "two raised
   reaching" half of the pose — R1 CRITIC FIX: now high AND far enough forward to read as reaching,
   not just a taller copy of the planted legs). */
function finger(root, dir, planted, pale, paleDk, nail, knob){
  const n = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  const dx = dir[0]/n, dz = dir[2]/n;

  // metacarpal: palm rim -> UP-and-OUT to the knuckle-knee (the arthropod "femur" segment).
  // Knee sits well clear of the palm's own top (~0.13u) for BOTH poses so it always breaks the
  // silhouette; raised fingers arch further still.
  const kneeY = planted ? 0.235 : 0.335;
  const knee = V(root.x + dx*0.155, kneeY, root.z + dz*0.155);
  tube(root, knee, 0.030, 0.023, 6, pale);
  blob(knee.x, knee.y, knee.z, 0.026, 0.023, 0.026, knob, 6, 4);   // countable knuckle knob #1

  // middle phalanx: knee bends back DOWN (planted) or FORWARD-and-UP (raised, reaching) toward
  // the tip (the "tibia" segment) — pushed well past the palm radius so tips clear the body too.
  const tipY = planted ? 0.006 : 0.405;                  // planted tips reach the ground; raised
                                                          // tips claw high into open air
  const tipOutXZ = planted ? 0.360 : 0.300;
  const midY = planted ? kneeY*0.55 : kneeY*1.12;
  const mid = V(root.x + dx*0.255, midY, root.z + dz*0.255 + (planted ? 0 : 0.06));
  tube(knee, mid, 0.023, 0.017, 5, paleDk);
  blob(mid.x, mid.y, mid.z, 0.018, 0.017, 0.018, knob, 5, 3);       // countable knuckle knob #2

  // distal phalanx + a THICK dark curled nail (R1 CRITIC FIX: was tapering to 0.001-0.003, well
  // under the 0.04u law-3 feature floor — the nails were dissolving instead of reading as the
  // dark contrast the pale hand needs). R2 CRITIC FIX: even the R1 fix's 0.012-0.017 phalanx and
  // 0.014-0.042 hook still measured under the 0.04u MINIMUM DIAMETER (radius*2), so the dark nails
  // were still too thin to survive the 1/3-res engine pass. Thickened both segments so the nail's
  // full diameter clears the floor at every point along its length, not just at the widest.
  const tip = V(root.x + dx*tipOutXZ, tipY, root.z + dz*tipOutXZ + (planted ? 0 : 0.10));
  tube(mid, tip, 0.023, 0.018, 5, pale);
  const hookDir = planted ? [dx*0.5, -0.55, dz*0.5+0.2] : [dx*0.3, 0.6, dz*0.3+0.6];
  const hn = Math.hypot(hookDir[0], hookDir[1], hookDir[2]) || 1;
  const hookTip = V(tip.x + hookDir[0]/hn*0.055, tip.y + hookDir[1]/hn*0.055, tip.z + hookDir[2]/hn*0.055);
  tube(tip, hookTip, 0.050, 0.022, 5, nail, { capB:{ hex:nail } });
}

export function buildCrawlingClaw(){
  /* ---------- PALETTE (VS desaturated; pale bone/skin body, dark nails/stump-torn-flesh, one
     pale bone spike as the second high-value note poking out of the dark stump). ---------- */
  const P = {
    skin:0xcdc3a8, skinLt:0xdcd3b8, skinDk:0x9d9478,       // pale corpse-hand flesh (the body read)
    knob:0xb3a888,                                          // knuckle knobs — a shade down from
                                                              // skin so each joint still counts as
                                                              // its own faceted lump, not a smear
    nail:0x22201c,                                          // dark curled nails — law-3 dark zone
    stump:0x5a2420, stumpDk:0x3a1613,                       // ragged torn wrist meat (dark, high-
                                                              // contrast against the pale hand)
    bone:0xe6ddc0,                                          // the exposed radius spike — pale bone
                                                              // popping out of the dark stump, the
                                                              // signature's own lit zone (law 3)
    shadow:0x14110c, shadowTop:0x1c1811,
  };

  /* ---------- LANDMARKS — a flattened palm (wide X, shallow Y, shallow Z), knuckle ridge along
     its FRONT-top edge (+z, +y), tapering back toward the wrist stump (-z). ---------- */
  const L = {
    palmY: 0.075, palmHalfX: 0.115, palmHalfZ: 0.095,
    knuckleY: 0.115,
  };

  /* palm body — one loft: underside -> knuckle ridge (top-front) -> tapered wrist neck.
     R2 CRITIC FIX: rz was never set (defaulted to rx via probe-lib's ring()), so every band was
     a ROUND cross-section — the palm rendered as a spider-body ball, not a flattened hand (the
     silhouette read as "quadruped/bug," failing law 2 outright). rz now explicitly ~0.4x rx so
     the loft is wide-and-shallow (a real "back of a hand" profile); cz keeps the front/back
     center-line curve toward the wrist neck. */
  stack([
    { y:0.030, rx:0.090, rz:0.036, cz:0.010, cx:-0.010, hex:P.skinDk },   // underside (palm-down, dark)
    { y:0.075, rx:0.115, rz:0.046, cz:0.030, cx:-0.005, hex:P.skin   },   // widest — the palm's equator
    { y:L.knuckleY, rx:0.100, rz:0.042, cz:0.055, cx:0.000, hex:P.skinLt },// knuckle-ridge band, lit top face
    { y:0.100, rx:0.055, rz:0.024, cz:-0.055, cx:-0.045, hex:P.skinDk },  // tapers back toward the wrist neck
  ], 10, { capTop:{ hex:P.skinDk, lift:0.015 } });

  /* 4 knuckle bumps astride the ridge band — the countable "this is a hand" tell, one per
     non-thumb finger root (index/middle/ring/pinky), evenly spaced across the front-top edge. */
  {
    const xs = [-0.072, -0.024, 0.024, 0.072];
    for(const x of xs){
      blob(x, L.knuckleY + 0.012, 0.075, 0.024, 0.017, 0.020, P.skinLt, 6, 3);
    }
  }

  /* SIGNATURE — the raw wrist stump: torn dark meat trailing off the palm's back edge, dragging
     low near the ground, one pale bone spike (radius) poking clear of the ragged flesh.
     R1 CRITIC FIX: the whole stump was sized/placed almost inside the palm's own silhouette (same
     height band, short reach) so it read as a one-pixel dark fleck, not the loud named signature.
     Lengthened, thickened, and pulled UP-and-OUT to the side so the dark meat and the pale bone
     spike both clear the palm's outline independently (two separate value pops, law 3). */
  {
    /* R2 CRITIC FIX: the stump was small (0.068 max radius) and drifted -x toward the thumb/legs,
       so it got lost in the leg-cluster's shadow — the signature never popped (law 3 fail: it
       read as a faint maroon fleck, not the "loud" named feature). Enlarged ~30-40%, pulled
       straight back along -z (trailing behind the travel direction, per the pose sentence) with
       much less -x drift so it clears the leg silhouette on its own, unmissable dark mass. */
    const a = V(-0.040, 0.100, -0.090);   // where it leaves the palm
    const b = V(-0.075, 0.135, -0.240);   // mid-drag, held up off the ground (dragging, not buried)
    const c = V(-0.100, 0.095, -0.360);   // ragged trailing end
    tube(a, b, 0.088, 0.068, 7, P.stump);
    tube(b, c, 0.068, 0.044, 7, P.stumpDk, { capB:{ hex:P.stumpDk } });
    // torn-edge flaps — a few flat dark shards off the stump's rim so the terminus reads ragged,
    // not a clean-cut cylinder cap.
    for(const s of [-1, 1]){
      quad(V(c.x, c.y+0.032*s, c.z), V(c.x-0.03, c.y+0.05*s, c.z-0.03), V(c.x-0.08, c.y+0.02*s, c.z-0.08), V(c.x-0.05, c.y-0.02*s, c.z-0.05), P.stumpDk, 0.06);
    }
    // the exposed radius bone spike — pale, poking OUT of the dark meat, but now short and
    // anchored close to the stump mass (was reaching 0.185u up — nearly as tall as the whole
    // creature — so it read as a free-floating antenna/horn, stealing the silhouette's top read
    // away from the actual signature). Half the reach, angled back over the stump, thickened past
    // the 0.04u law-3 floor so it stays a clear pale accent ON the dark meat, not a separate motif.
    const boneTip = V(b.x - 0.035, b.y + 0.075, b.z - 0.055);
    tube(b, boneTip, 0.026, 0.013, 5, P.bone, { capB:{ hex:P.bone } });
  }

  /* SIGNATURE — five fingers as radial arthropod legs, splayed across the palm's front rim.
     THREE planted (thumb, ring, pinky — the wide stable spread) drive the scuttle; TWO raised
     (index, middle) claw high into the air reaching for the next hold — the mid-scuttle asymmetry
     the pose sentence calls for. Root points sit on the palm rim (already-on-the-surface, per the
     ANATOMY-CANON arthropod hip-on-carapace convention) so fingers meet the body by construction. */
  {
    const rim = (angDeg, hx, hz) => V(Math.cos(angDeg*Math.PI/180)*hx, L.palmY + 0.02, 0.03 + Math.sin(angDeg*Math.PI/180)*hz);
    // angle 0 = straight +z (dead ahead); negative = -x side, positive = +x side (mirrors thumb/pinky)
    // R2 CRITIC FIX: index/middle (the two raised, reaching fingers) had dirs [-0.42,0,0.95] and
    // [0,0,1.00] — only ~25deg apart — so in the dimetric view they read as one flat parallel
    // blade/wing shape instead of two distinct splayed digits. Index pulled further -x (wider
    // spread) so the two raised fingers visibly diverge, matching the planted trio's spread.
    const fingers = [
      { name:'thumb',  root: rim(-95, 0.100, 0.060), dir:[-0.85, 0, 0.35], planted:true  },
      { name:'index',  root: rim(-35, 0.100, 0.100), dir:[-0.72, 0, 0.70], planted:false },
      { name:'middle', root: rim(  0, 0.070, 0.100), dir:[ 0.00, 0, 1.00], planted:false },
      { name:'ring',   root: rim( 35, 0.100, 0.100), dir:[ 0.42, 0, 0.95], planted:true  },
      { name:'pinky',  root: rim( 80, 0.100, 0.060), dir:[ 0.90, 0, 0.30], planted:true  },
    ];
    for(const f of fingers){
      finger(f.root, f.dir, f.planted, P.skin, P.skinDk, P.nail, P.knob);
    }
  }

  /* ---------- shadow-pool base disc (Tiny, r=0.34 — sized to the planted-claw spread, not the
     palm alone; still a small Tiny footprint next to the Medium r=0.42 convention) ---------- */
  {
    const r1 = ring(V(0,0.002,0), V(0,1,0), 0.34, 0.34, 12);
    const r2 = ring(V(0,0.030,0), V(0,1,0), 0.32, 0.32, 12);
    stitch([r1, r2], ()=> P.shadow);
    capFan(r2, V(0,0.032,0), P.shadowTop);
  }
}
