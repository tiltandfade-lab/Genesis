/* Verify MODEL-GRAMMAR G1 (docs/MODEL-GRAMMAR.md §1/§2) + G4 (dev/model-coverage-report.md class-(c))
   — src/ui/theater-parts.js, the part library (42 G1 parts + 17 G4 walk-table props = 59). PURE LAYER
   ONLY: a plain Node ESM `import` of theater-parts.js is enough to exercise every check here — the
   module has ZERO THREE/window/document coupling of its own (§1: "this file composes nothing
   itself... zero THREE/window/document coupling"), so no jsdom/browser stub is needed, mirroring
   dev/verify-theater-verbs.mjs PART A's same "sealed ES-module, pure logic" pattern.

   RED-FIRST CHECKS (per the unit's build-ladder note):
     1. Inventory completeness — every §1-listed part name (all 42 G1 parts across 7 categories, PLUS
        the 17 G4 props named in dev/model-coverage-report.md's class-(c) list) exists in PARTS and is
        callable — 59 total.
     2. Every part returns a valid box list: each entry has box{w,h,d}>0, pos{x,y,z} numeric,
        rot{x,y,z} numeric, and the list length is within the §1 budget (<=6 boxes/part) — checked for
        the 17 new G4 props too (same budget, same validator, no separate rule).
     3. Every BODY part (BODY_PART_NAMES) exports the full §2 ANCHOR_NAMES set on `.anchors`, each a
        well-formed {pos,rot} transform. (G4 adds zero bodies — props carry no anchor contract.)
     4. Every non-body (module) part declares `.expectedAnchor` — informational metadata, but its
        presence + membership in ANCHOR_NAMES is checked (catches an authoring typo like "mainhand").
        (G4's 17 are props, same as G1's original 7 — no `.expectedAnchor` expected of any prop.)
     5. Determinism: two calls to the SAME part with the SAME params produce byte-identical (JSON-
        equal) box lists — §1's "deterministic, no randomness inside parts" rule, checked directly
        rather than just asserted in a comment. Covers all 59, including the 17 new G4 props.
     6. The 9 archetype compositions (the SAME part calls theater-boot.js's build* functions make,
        re-derived here against the pure PARTS registry so this check needs no THREE/DOM stub) stay
        under the 24-box hero/T1.5 budget (BATTLE-THEATER §3's "keep every figure under ~24 boxes").
     7. MUTATION CHECK: delete an anchor key from a body's `.anchors` object -> the anchor-completeness
        assertion (check 3) must go RED, proving it's actually load-bearing and not vacuously true.
     8. G4: every one of the 17 new props is independently name-checked present + callable (a stronger
        assertion than "included in the 59 count," which a count alone can't distinguish from an old
        part silently vanishing and a new one silently appearing at the same total).

   Run:  node dev/verify-model-parts.mjs */
import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PARTS_URL = pathToFileURL(join(ROOT, "src/ui/theater-parts.js")).href;

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const Parts = await import(PARTS_URL);

// ============================================================================
// §1 THE FULL INVENTORY — the doc's own kebab-case list, by category, as the single ground truth
// this harness checks PARTS against (independent of theater-parts.js's own PARTS keys, so a typo'd
// key in the module itself still gets caught rather than the check trivially agreeing with itself).
// ============================================================================
// UNIT 2 adds torso-tapered (a 9th body — the V-taper biped variant) + maw-open (a 6th head — the
// open predator jaw). Both are additive (torso-biped/head-snout are NOT removed — recipes reference
// parts by name), so the inventory grows 59 -> 61.
const BODIES = ["torso-biped", "torso-tapered", "torso-biped-huge", "torso-quad", "blob-mass", "thorax-abdomen",
  "serpent-coil", "swarm-scatter", "horror-mass"];
const LIMBS = ["arm-tapered", "leg-tapered", "leg-spider", "wing-slab", "tail-segments", "fin-ridge"];
const HEADS = ["head-round", "head-snout", "head-horned", "head-skull", "head-eyeless", "maw-open"];
const WEAPONS = ["sword-slab", "axe-wedge", "spear-pole", "bow-arcs", "staff-tipped", "shield-slab",
  "dagger-slabs", "club-mass"];
const ARMOR = ["pauldrons", "chest-plate", "helm-crest", "robe-skirt"];
const FX = ["ember-flecks", "glow-halo", "drip-tendrils", "bone-protrusions"];
const PROPS = ["crate", "cart", "pillar-broken", "shrine-block", "tree-bare", "rubble-scatter", "banner-pole"];
// MODEL-GRAMMAR G4 (dev/model-coverage-report.md class-(c)) — the 17-part walk-table prop list, in
// the report's own numbering order. Same category as PROPS above (no anchor contract).
const PROPS_G4 = ["statue-figure", "table-slab", "chain-drape", "cage-frame", "basin-block", "web-mass",
  "arch-frame", "coffin-slab", "vine-tangle", "mushroom-cluster", "well-shaft", "ladder-rungs",
  "furnace-block", "gear-cluster", "tent-canopy", "bell-mass", "throne-seat"];
const ALL_PARTS = [...BODIES, ...LIMBS, ...HEADS, ...WEAPONS, ...ARMOR, ...FX, ...PROPS, ...PROPS_G4];
const NON_BODY_MODULES = [...LIMBS, ...HEADS, ...WEAPONS, ...ARMOR, ...FX]; // props carry no anchor contract (§1: props mount at a world/prop-slot position, not a body anchor)

console.log("=== §1 inventory completeness (" + ALL_PARTS.length + " parts) ===");
check("§1+G4+Unit2 inventory is exactly 61 parts (9 bodies + 6 limbs + 6 heads + 8 weapons + 4 armor + 4 FX + 7 G1 props + 17 G4 props)",
  ALL_PARTS.length === 61, "got " + ALL_PARTS.length);

ALL_PARTS.forEach((name) => {
  const fn = Parts.PARTS[name];
  check("PARTS[\"" + name + "\"] exists and is a function", typeof fn === "function", typeof fn);
});

check("PARTS registry has no EXTRA keys beyond the §1 inventory",
  Object.keys(Parts.PARTS).every((k) => ALL_PARTS.includes(k)),
  "extra: " + Object.keys(Parts.PARTS).filter((k) => !ALL_PARTS.includes(k)).join(","));

check("BODY_PART_NAMES matches the §1 bodies list exactly",
  JSON.stringify([...Parts.BODY_PART_NAMES].sort()) === JSON.stringify([...BODIES].sort()),
  JSON.stringify(Parts.BODY_PART_NAMES));

check("ANCHOR_NAMES is the frozen 7-name §2 set",
  JSON.stringify(Parts.ANCHOR_NAMES) === JSON.stringify(["mainHand", "offHand", "back", "head", "shoulders", "base", "mount"]),
  JSON.stringify(Parts.ANCHOR_NAMES));

// ============================================================================
// §1 box-list validity + budget (<=6 boxes/part)
// ============================================================================
console.log("\n=== §1 box-list validity + <=6-box budget per part ===");

function isFiniteNum(v){ return typeof v === "number" && Number.isFinite(v); }

// SHAPE-WAVE UNIT 2 + L21: BODY parts compose the whole creature core off the primitive/loft layer now
// (a horse-topology quadruped: trunk + haunch + chest + neck loft + head + brow + ears + tail), so the
// box-era ≤6-spec cap doesn't bind them — bodies get a higher spec budget; MODULE parts (limbs/heads/
// weapons/armor/FX/props) stay ≤6, keeping the "one concern, few parts" discipline where it belongs.
const BODY_SPEC_BUDGET = 12;
function validateBoxList(name, boxes){
  if(!Array.isArray(boxes)) return "not an array";
  if(boxes.length === 0) return "empty (a part must draw something)";
  const budget = Parts.BODY_PART_NAMES && Parts.BODY_PART_NAMES.includes(name) ? BODY_SPEC_BUDGET : 6;
  if(boxes.length > budget) return "budget exceeded: " + boxes.length + " specs (>" + budget + ")";
  for(let i = 0; i < boxes.length; i++){
    const b = boxes[i];
    if(!b || !b.box || !b.pos || !b.rot) return "entry " + i + " missing box/pos/rot";
    if(!isFiniteNum(b.box.w) || !isFiniteNum(b.box.h) || !isFiniteNum(b.box.d) ||
       b.box.w <= 0 || b.box.h <= 0 || b.box.d <= 0) return "entry " + i + " has a non-positive/non-finite box dim";
    if(!isFiniteNum(b.pos.x) || !isFiniteNum(b.pos.y) || !isFiniteNum(b.pos.z)) return "entry " + i + " has a non-finite pos";
    if(!isFiniteNum(b.rot.x) || !isFiniteNum(b.rot.y) || !isFiniteNum(b.rot.z)) return "entry " + i + " has a non-finite rot";
  }
  return null;
}

// representative params per part (defaults are fine for most; a few need non-default params to
// exercise their real call shape without erroring, e.g. leg-spider's count=0 division edge, or to
// request a budget-respecting SLICE of a part whose full/default extent is a caller composing
// multiple calls — serpent-coil/swarm-scatter's own header comments document the split-call pattern
// theater-boot.js's buildSerpent/buildSwarm actually use).
const SAMPLE_PARAMS = {
  "leg-spider": { side: 1, idx: 0, count: 4 },
  "tail-segments": { segCount: 3 },
  "serpent-coil": { totalSegs: 7, startIdx: 0, count: 4 },
  "swarm-scatter": { totalN: 9, startIdx: 0, count: 5 }
};

ALL_PARTS.forEach((name) => {
  const fn = Parts.PARTS[name];
  if(typeof fn !== "function") return; // already flagged above
  let boxes;
  try{ boxes = fn(SAMPLE_PARAMS[name] || {}); }
  catch(e){ check(name + " calls without throwing", false, e.message); return; }
  const err = validateBoxList(name, boxes);
  check(name + " returns a valid box list within the 6-box budget (" + (Array.isArray(boxes) ? boxes.length : "?") + " boxes)",
    !err, err || "");
});

// ============================================================================
// §2 the anchor contract — every BODY exports the full 7-name anchor set
// ============================================================================
console.log("\n=== §2 anchor contract — every body exports the full anchor set ===");

function anchorsAreWellFormed(anchors){
  if(!anchors || typeof anchors !== "object") return false;
  return Parts.ANCHOR_NAMES.every((name) => {
    const a = anchors[name];
    return a && a.pos && a.rot &&
      isFiniteNum(a.pos.x) && isFiniteNum(a.pos.y) && isFiniteNum(a.pos.z) &&
      isFiniteNum(a.rot.x) && isFiniteNum(a.rot.y) && isFiniteNum(a.rot.z);
  });
}

BODIES.forEach((name) => {
  const fn = Parts.PARTS[name];
  const anchors = fn && fn.anchors;
  check(name + " exports .anchors with all 7 §2 names (well-formed {pos,rot} transforms)",
    anchorsAreWellFormed(anchors),
    anchors ? "missing/malformed: " + Parts.ANCHOR_NAMES.filter((n) => !anchors[n]).join(",") : "no .anchors at all");
});

// ============================================================================
// module parts declare .expectedAnchor, and it names a real anchor
// ============================================================================
console.log("\n=== module parts declare .expectedAnchor (informational, checked for typos) ===");

NON_BODY_MODULES.forEach((name) => {
  const fn = Parts.PARTS[name];
  const ea = fn && fn.expectedAnchor;
  check(name + " declares .expectedAnchor as one of the 7 §2 anchor names",
    typeof ea === "string" && Parts.ANCHOR_NAMES.includes(ea),
    "got " + JSON.stringify(ea));
});

// ============================================================================
// determinism — two calls, same params, byte-identical (JSON-equal) output
// ============================================================================
console.log("\n=== determinism (§1: \"no randomness inside parts\") ===");

ALL_PARTS.forEach((name) => {
  const fn = Parts.PARTS[name];
  if(typeof fn !== "function") return;
  const params = SAMPLE_PARAMS[name] || { seed: 42, side: -1, crouch: 0.06, stanceTilt: 0.12,
    offsets: [0.3, -0.2, 0.5, -0.4, 0.1, -0.6], jitter: [0.1, -0.2, 0.3, -0.4, 0.5, -0.1, 0.2],
    zSeed: [0.1, -0.2, 0.3, -0.1, 0.2, -0.3, 0.1], yawSeed: [0.2, -0.1, 0.3, -0.2, 0.1, -0.3, 0.2],
    ring: [{ r: 0.02, s: 0.01, y: 0.02, rot: 0.3 }] };
  let a, b;
  try{ a = fn(params); b = fn(params); }
  catch(e){ check(name + " determinism call", false, e.message); return; }
  check(name + " produces byte-identical output across two calls with the same params",
    JSON.stringify(a) === JSON.stringify(b), "outputs differed");
});

// ============================================================================
// the 9 archetype compositions stay under the 24-box budget — re-derives the SAME part-call sequence
// theater-boot.js's build* functions make (kept in sync by hand; a drift here is a real regression
// signal even though it can't literally import theater-boot.js, which needs THREE/window).
// ============================================================================
console.log("\n=== the 9 archetype compositions stay under the 24-box budget (BATTLE-THEATER §3) ===");

function countBoxes(...calls){
  return calls.reduce((sum, [name, params]) => {
    const fn = Parts.PARTS[name];
    return sum + fn(params || {}).length;
  }, 0);
}

const ARCHETYPE_BOX_COUNTS = {
  biped: countBoxes(["torso-biped", { crouch: 0, stanceTilt: 0.05 }],
    ["leg-tapered", {}], ["leg-tapered", {}],
    ["arm-tapered", { side: -1 }], ["arm-tapered", { side: 1 }]), // + optional weapon/shield, not counted (opt-in extras)
  "biped-caster": countBoxes(["robe-skirt", {}], ["arm-tapered", { side: -1 }], ["arm-tapered", { side: 1 }]) + 3, // +3 for head/torso/shoulder slice
  quadruped: countBoxes(["torso-quad", {}],
    ["leg-tapered", {}], ["leg-tapered", {}], ["leg-tapered", {}], ["leg-tapered", {}]),
  flyer: countBoxes(["wing-slab", { side: -1 }], ["wing-slab", { side: 1 }],
    ["tail-segments", { segCount: 1 }], ["tail-segments", { segCount: 1 }]) + 3, // +3 inline body/head/beak
  serpent: countBoxes(["serpent-coil", { totalSegs: 7, startIdx: 0, count: 4 }],
    ["serpent-coil", { totalSegs: 7, startIdx: 4, count: 3 }]),
  swarm: countBoxes(["swarm-scatter", { totalN: 9, startIdx: 0, count: 5 }],
    ["swarm-scatter", { totalN: 9, startIdx: 5, count: 4 }]),
  giant: countBoxes(["torso-biped-huge", {}],
    ["leg-tapered", {}], ["leg-tapered", {}], ["arm-tapered", {}], ["arm-tapered", {}]),
  ooze: countBoxes(["blob-mass", {}]),
  arachnid: countBoxes(["thorax-abdomen", {}],
    ["leg-spider", { side: 1, idx: 0, count: 4 }], ["leg-spider", { side: 1, idx: 1, count: 4 }],
    ["leg-spider", { side: 1, idx: 2, count: 4 }], ["leg-spider", { side: 1, idx: 3, count: 4 }],
    ["leg-spider", { side: -1, idx: 0, count: 4 }], ["leg-spider", { side: -1, idx: 1, count: 4 }],
    ["leg-spider", { side: -1, idx: 2, count: 4 }], ["leg-spider", { side: -1, idx: 3, count: 4 }]),
  "amorphous-horror": countBoxes(["horror-mass", {}], ["drip-tendrils", { count: 5 }])
};

Object.entries(ARCHETYPE_BOX_COUNTS).forEach(([archetype, count]) => {
  check(archetype + " composition is under the 24-box budget (" + count + " boxes)", count <= 24, count + " boxes");
});

// ============================================================================
// MUTATION CHECK — delete an anchor key from a body's .anchors -> check 3's assertion must go RED,
// proving the anchor-completeness check is load-bearing and not vacuously true.
// ============================================================================
console.log("\n=== mutation check (proves the anchor-completeness check is load-bearing) ===");

{
  const victim = "torso-biped";
  const fn = Parts.PARTS[victim];
  const savedAnchors = fn.anchors;
  const mutated = Object.assign({}, savedAnchors);
  delete mutated.mount; // remove one required anchor
  fn.anchors = mutated;
  const stillPasses = anchorsAreWellFormed(fn.anchors);
  fn.anchors = savedAnchors; // restore immediately, before any other check can see the mutation
  check("MUTATION: removing torso-biped.anchors.mount makes the anchor-completeness check FAIL (red)",
    stillPasses === false, "check still passed after mutation — the assertion is vacuous");
}

// ============================================================================
// G4 check 8 — every one of the 17 new props is independently name-checked present + callable +
// budget-valid, over and above the blanket ALL_PARTS loops above (a stronger assertion than the bare
// 59-count: catches "a new part silently replaced an old one at the same total" that a count alone
// can't distinguish).
// ============================================================================
console.log("\n=== §G4 all 17 new walk-table props present, callable, budget-valid ===");

PROPS_G4.forEach((name) => {
  const fn = Parts.PARTS[name];
  check("G4 prop \"" + name + "\" exists in PARTS and is a function", typeof fn === "function", typeof fn);
  if(typeof fn !== "function") return;
  let boxes;
  try{ boxes = fn({}); }
  catch(e){ check("G4 prop \"" + name + "\" calls with default params without throwing", false, e.message); return; }
  const err = validateBoxList(name, boxes);
  check("G4 prop \"" + name + "\" returns a valid box list within the 6-box budget (" + (Array.isArray(boxes) ? boxes.length : "?") + " boxes)",
    !err, err || "");
});

// ============================================================================
// FRAME RETARGET (2026-07-03, Adam's round-1 sheet review + director diagnosis) — the ROOT frame bug:
// limb parts were ported from the old archetype frame (shoulder line y≈0.56) into grammar torsos whose
// `shoulders` anchor is y=1.0, and the conversion never happened, so arms hung from the hip and the
// grip-seat saga chased that symptom. These checks lock the fix so it can't silently regress:
//   (1) arm-tapered hangs its arm FROM the shoulder line — the arm's TOP box must sit at ~the torso's
//       shoulders anchor Y (1.0 biped / 1.5 giant), NOT the old hip 0.56.
//   (2) the mainHand/offHand grip sits in the READY-GRIP band — below the shoulder line, ABOVE the
//       old hip band (0.56), and against the forearm the arm now actually draws (arm-tapered.wristY).
//   (3) wings (wing-slab) attach at shoulder-blade height, never above the head — the `back` anchor's Y
//       plus the wing's own yBase:0 (recipe wiring) sits below `shoulders`, never above `head`.
// Each is asserted against the REAL box/anchor data (not a hand-picked constant), so tuning the frame
// re-derives the expectation instead of going stale — and the caller box-math is NOT treated as visual
// proof (that happens post-merge via the capture rig, dev/model-qa/); these only prove the FRAME
// NUMBERS are internally consistent (arm top == shoulder line, grip on the forearm), which is exactly
// the class of regression box-math CAN catch.
// ============================================================================
console.log("\n=== FRAME RETARGET: arms hang from the shoulder line; grip on the forearm; wings at the shoulder blade ===");
{
  // SHAPE-WAVE UNIT 2 + L21: arm-tapered's shoulder segment is now a LOFT (a spec whose geometry sits at
  // its spine's own coordinates, not offset by pos — pos.y is 0, the spine carries the absolute y). Its
  // true TOP is pos.y + center.y + box.h/2 (center.y is the loft's spine midpoint). A plain box spec's
  // top stays pos.y + box.h/2. This helper reads the true top for either, so the "arm hangs from the
  // shoulder line" INTENT (the arm's top == the shoulder anchor) survives the box->loft rebuild.
  const specTop = (b) => (b.shape === "loft" ? (b.pos.y + (b.center ? b.center.y : 0) + b.box.h / 2)
                                             : (b.pos.y + b.box.h / 2));
  const bipedArm = Parts.armTapered({ side: 1 }); // default yStart = 1.0 (torsoBiped shoulder line)
  const bipedArmTop = specTop(bipedArm[0]);
  const bipedShoulderY = Parts.torsoBiped.anchors.shoulders.pos.y;
  check("arm-tapered (biped) hangs from the shoulder line, not the hip (arm top ~= shoulders.y=1.0, NOT 0.56)",
    Math.abs(bipedArmTop - bipedShoulderY) < 0.06 && bipedArmTop > 0.85,
    "arm top " + bipedArmTop.toFixed(3) + " vs shoulders.y " + bipedShoulderY);
  const giantArm = Parts.armTapered(Parts.torsoBipedHuge.armParams(1));
  const giantArmTop = specTop(giantArm[0]);
  const giantShoulderY = Parts.torsoBipedHuge.anchors.shoulders.pos.y;
  check("arm-tapered (giant) hangs from the giant shoulder line (arm top ~= shoulders.y=1.5)",
    Math.abs(giantArmTop - giantShoulderY) < 0.1 && giantArmTop > 1.3,
    "arm top " + giantArmTop.toFixed(3) + " vs shoulders.y " + giantShoulderY);

  // (2) THE FIST RULE (L14): the mainHand grip anchor sits AT / INSIDE the arm's own oversized FIST
  //     box — "in the hand" is geometric containment of the grip in the fist volume, not proximity to
  //     a bare point. Assert the grip anchor lies within the fist box's AABB (armTapered.fistBox), for
  //     BOTH bodies. (This SUPERSEDES the L11 "ready-grip band" checks — the grip is now at the fist,
  //     which is at the wrist/forearm-end; the fist wrapping it is what makes that read as held.)
  const grip = Parts.torsoBiped.anchors.mainHand.pos;
  const bipedFist = Parts.armTapered.fistBox({ side: 1 }); // right arm's fist (x=0.3, y=wrist)
  const gripInBipedFist = Math.abs(grip.x - bipedFist.x) <= bipedFist.half + 0.02 &&
    Math.abs(grip.y - bipedFist.y) <= bipedFist.half + 0.02;
  check("THE FIST RULE: torsoBiped mainHand grip anchor is inside the arm's fist box (geometric, not proximity)",
    gripInBipedFist, "grip (" + grip.x + "," + grip.y + ") vs fist center (" + bipedFist.x + "," + bipedFist.y + ") half " + bipedFist.half.toFixed(3));
  const giantGrip = Parts.torsoBipedHuge.anchors.mainHand.pos;
  const giantFist = Parts.armTapered.fistBox(Parts.torsoBipedHuge.armParams(1));
  const gripInGiantFist = Math.abs(giantGrip.x - giantFist.x) <= giantFist.half + 0.03 &&
    Math.abs(giantGrip.y - giantFist.y) <= giantFist.half + 0.03;
  check("THE FIST RULE: torsoBipedHuge mainHand grip anchor is inside the giant arm's fist box",
    gripInGiantFist, "grip (" + giantGrip.x + "," + giantGrip.y + ") vs fist center (" + giantFist.x + "," + giantFist.y + ") half " + giantFist.half.toFixed(3));

  // (3) wings at shoulder-blade height: the `back` anchor sits below `shoulders`, above the pelvis, and
  //     the wing module (yBase:0, recipe wiring) placed there never reaches above the `head` anchor.
  const backY = Parts.torsoBiped.anchors.back.pos.y;
  const headY = Parts.torsoBiped.anchors.head.pos.y;
  const shoulderY = Parts.torsoBiped.anchors.shoulders.pos.y;
  check("torsoBiped `back` (wing) anchor is at shoulder-blade height (below shoulders 1.0, well below head)",
    backY < shoulderY && backY < headY - 0.2 && backY > 0.5, "back.y " + backY);
  const wingAtBack = Parts.wingSlab({ side: 1, yBase: 0 }); // recipe wiring: yBase:0 so wing sits AT the anchor
  const wingTopAtBack = Math.max(...wingAtBack.map(b => backY + b.pos.y + b.box.h / 2));
  check("wing-slab attached at `back` (yBase:0) never reaches above the head anchor",
    wingTopAtBack < headY, "wing top " + wingTopAtBack.toFixed(3) + " vs head.y " + headY);

  // MUTATION: prove check (1) is load-bearing — force arm-tapered's yStart back to the OLD hip 0.56 and
  // confirm the "arm hangs from shoulder line" assertion would go RED.
  const oldFrameArm = Parts.armTapered({ side: 1, yStart: 0.56 });
  const oldFrameArmTop = specTop(oldFrameArm[0]);
  check("MUTATION: an arm authored at the OLD hip yStart (0.56) FAILS the shoulder-line check (proves it's load-bearing)",
    !(Math.abs(oldFrameArmTop - bipedShoulderY) < 0.06 && oldFrameArmTop > 0.85),
    "old-frame arm top " + oldFrameArmTop.toFixed(3) + " unexpectedly passed the shoulder-line check");
}

// ============================================================================
console.log("\n" + pass + " passed, " + fail + " failed");
if(fail > 0){ process.exit(1); }
