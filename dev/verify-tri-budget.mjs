/* Verify SHAPE-WAVE UNIT 1 — THE TRI-BUDGET HARNESS (REFERENCE-DIRECTION.md L13, Adam 2026-07-03:
   "each pilot figure lands in 150-350 tris"). Assembles each of the 16 PILOT figures (dev/model-qa/
   pilot.json) HEADLESS — no THREE, no WebGL, no jsdom-canvas — by replicating theater-boot.js's
   buildFigureFromRecipe box-composition against the PURE part library (src/ui/theater-parts.js) + the
   generated recipes (data/model-recipes.js) + the loadout-mirror (theater-data.js's pcRecipeFrom for
   the 3 PC fixtures), and SUMS each part-box's triangle count via theater-parts.js's SHAPE_TRIS table
   (the single source of primitive tri budgets, kept in lockstep with theater-boot.js's geometryForSpec
   segment choices). Asserts every pilot figure's total lands in [150, 350].

   WHY 150-350 (the harness window, wider than Adam's 250-300 TARGET): the target is the tuned
   sweet-spot U2's shape pass aims each figure at; the harness window is the GUARDRAIL around it — a
   figure below 150 reads as a thin box-stack (the §7b prop-miss), above 350 is over-budget for the
   PSX board. U2-U6 pull the thin pilots (spider/swarm/ooze/stalker start ~48-120 today) UP into the
   window and keep the fat ones (~250-264) under 350. This harness is the GREEN gate that proves it.

   COMPOSITION MIRROR (must stay faithful to theater-boot.js's buildFigureFromRecipe): base body +
   (biped-family) 2 legs + 2 arms + (quad-family) 4 legs + every recipe module. The three PC loadout
   fixtures go through pcRecipeFrom (the real loadout mirror) so a fixture's weapon/armor modules count
   too — the same recipe shape buildFigureFromRecipe consumes. Deterministic (no randomness); two runs
   are byte-identical.

   RED-FIRST (per the unit's build-ladder note): run with TRI_BUDGET_FAT=1 to inject a deliberately
   FAT primitive (a 200-tri phantom box) into every figure — every pilot then blows past 350 and the
   harness goes RED, proving the ceiling check is load-bearing. Without it, the real green run.

   Run:  node dev/verify-tri-budget.mjs
         TRI_BUDGET_FAT=1 node dev/verify-tri-budget.mjs   (the deliberate-RED proof) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const LO = 150, HI = 600;             // the overall window (Adam's TIERED budget ruling, 2026-07-03)
const FAT = process.env.TRI_BUDGET_FAT === "1"; // the deliberate-RED proof

/* THE TIERED BUDGET (Adam, 2026-07-03): "don't artificially squeeze the wolf/rex-class or the PC
   fixtures to hit 300 — spend the loops where the reference wireframes spend them." Per-tier ceilings:
     - swarm members  30-60 each  (a whole swarm of 8-14 stays under ~800 total)
     - common minis   250-400
     - PC / boss / large-creature  400-600  (the 3 loadout fixtures, ogre, dragon-kin, large flyers)
   The overall window is [150, 600]; per-tier CEILINGS are asserted on top. A figure's tier is by slug
   (below). This replaces the flat 350 ceiling — the primitive layer's guardrail is now the tiered
   ceiling (still proven load-bearing by TRI_BUDGET_FAT: a +200 phantom blows every tier). */
const TIER = {
  // large / PC / boss — allowed up to 600 (spend loops on joints/neck/wings/tail/silhouette).
  large: { hi: 600, slugs: new Set([
    "loadout:fighter-greatsword", "loadout:ranger-bow", "loadout:wizard-staff",
    "ogre", "pseudodragon", "giant-bat"   // dragon-kin + the large flyer are hero-tier reads
  ]) },
  // swarm — the whole scatter is one figure here (its 8-14 members summed); a swarm may run richer,
  // capped generously under ~800 total (per-member 30-60).
  swarm: { hi: 800, slugs: new Set(["swarm-of-rats"]) }
  // everything else -> common (ceiling 400).
};
const COMMON_HI = 400;
function tierFor(slug){
  if(TIER.large.slugs.has(slug)) return { name: "large", hi: TIER.large.hi };
  if(TIER.swarm.slugs.has(slug)) return { name: "swarm", hi: TIER.swarm.hi };
  return { name: "common", hi: COMMON_HI };
}

/* THE FLOOR (>=150) is a hard gate — EXCEPT for creatures whose dedicated downstream shape-wave unit
   hasn't landed yet. U1 ships the vocabulary + this harness; the swarm instances (U3), the ooze blob
   (U5), and the aberration rebuild (U6) lift these three off their thin box-stacks. (giant-spider is
   lifted by U2's arced legs — dropped from this list once U2 lands.) Each downstream unit DELETES its
   own slug the moment its rebuild clears the floor — a self-closing punch-list, never a permanent
   waiver. A slug clearing the floor while still listed is REPORTED (over-waived) so a stale entry can't
   hide. Swarm members are exempt from the 150 floor by their own tier (a swarm member is 30-60). */
// (empty — every pilot now clears its tier floor; U2-U6 lifted the four originally-thin creatures. A
// slug added here would be a self-closing punch-list item, but the shape wave cleared them all.)
const FLOOR_PENDING = new Set([]);

// ---- the pure part library (ESM) + its tri-budget table ---------------------------------------
const Parts = await import(pathToFileURL(join(ROOT, "src/ui/theater-parts.js")).href);
const SHAPE_TRIS = Parts.SHAPE_TRIS;

// ---- classic-script globals via jsdom (recipes + pcRecipeFrom) --------------------------------
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const man = JSON.parse(read("manifest.json"));
const moduleTypedPaths = new Set(man.modules.filter(m => m.type === "module").map(m => m.path));
const moduleSrc = man.loadOrder
  .filter((p) => p.endsWith(".js") && !moduleTypedPaths.has(p))
  .map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
// jsdom-const gotcha (memory: "jsdom-const-via-eval harness"): a top-level `const X = ...` in a
// win.eval creates a LEXICAL binding, NOT a window property — so `win.MODEL_RECIPES` is undefined even
// though it evaluated (functions like pcRecipeFrom hoist to global in sloppy eval, but consts don't).
// Append explicit re-exports IN THE SAME eval scope so the lexical consts get captured onto window.
win.eval(`var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;\n` + moduleSrc
  + `\n;window.MODEL_RECIPES=(typeof MODEL_RECIPES!=="undefined")?MODEL_RECIPES:{};`
  + `\n;window.MODEL_RECIPE_OVERRIDES=(typeof MODEL_RECIPE_OVERRIDES!=="undefined")?MODEL_RECIPE_OVERRIDES:{};`);
const RECIPES = win.MODEL_RECIPES || {};
const OVERRIDES = win.MODEL_RECIPE_OVERRIDES || {};
function recipeFor(slug){
  if(!slug) return null;
  if(OVERRIDES[slug]) return OVERRIDES[slug];
  if(RECIPES[slug]) return RECIPES[slug];
  return null;
}

// ---- the tri counter — mirrors buildFigureFromRecipe's box composition ------------------------
// a single §1 part's tri count = sum over its returned specs of the spec's tri count. Fixed box-solids
// read SHAPE_TRIS[shape]; a loft (variable tris) carries its own precomputed `tris` field (loftSpec).
function specTris(b){
  if(b.shape === "loft") return b.tris || 0;
  return SHAPE_TRIS[b.shape || "box"] || SHAPE_TRIS.box;
}
function partTris(partFn, params){
  if(!partFn) return 0;
  let n = 0;
  const boxes = partFn(params || {});
  for(const b of boxes){ n += specTris(b); }
  return n;
}
// which bases draw biped limbs / quad legs (mirrors theater-boot.js's BIPED_LIMB_*/QUAD_LIMB_LEG_SETS)
const BIPED_BASES = { "torso-biped": 1, "torso-tapered": 1, "torso-biped-huge": 1 };
const QUAD_BASES = { "torso-quad": 1 };
// the exact leg/arm param sets buildFigureFromRecipe uses (only the RETURNED SPEC COUNT/shape matters
// for tris, and scalars only tweak dims, never spec count — so plain default params suffice here).
function figureTris(recipe){
  if(!recipe) return 0;
  const base = (recipe.base && Parts.PARTS[recipe.base]) ? recipe.base : "torso-biped";
  // mirror buildFigureFromRecipe's bodyParams: a swarm recipe's member kind rides into the base body's
  // params (so a rat-member swarm counts its rat members, not the generic default).
  const baseParams = {};
  if(recipe.swarmMember) baseParams.member = recipe.swarmMember;
  let n = partTris(Parts.PARTS[base], baseParams);
  if(BIPED_BASES[base]){
    // 2 legs + 2 arms (arm-tapered draws its fist box by default — counted)
    const legP = (base === "torso-biped-huge")
      ? Parts.torsoBipedHuge.legParams(-1)
      : Parts.torsoBiped.legParams(-1, 0, 0.05);
    n += partTris(Parts.legTapered, legP) * 2;
    const armP = (base === "torso-biped-huge") ? Parts.torsoBipedHuge.armParams(-1) : { side: -1, tiltZ: 0.16 };
    n += partTris(Parts.armTapered, armP) * 2;
  }
  if(QUAD_BASES[base]){
    // 4 legs (buildFigureFromRecipe's QUAD_LIMB_LEG_SETS — default legTapered spec count is fixed)
    n += partTris(Parts.legTapered, {}) * 4;
  }
  (recipe.modules || []).forEach(m => {
    if(!m || !m.part) return;
    n += partTris(Parts.PARTS[m.part], m.params || {});
  });
  if(FAT) n += 200; // deliberate-RED injection: a phantom fat primitive blows the ceiling on every figure
  return n;
}

// ---- the pilot set -----------------------------------------------------------------------------
const pilot = JSON.parse(read("dev/model-qa/pilot.json"));
const PC_LOADOUT = {
  "fighter-greatsword": { className: "Fighter", weapon: "Greatsword", armor: "Chain Mail" },
  "ranger-bow": { className: "Ranger", weapon: "Longbow" },
  "wizard-staff": { className: "Wizard", weapon: "Quarterstaff" }
};
function loadoutRecipe(key){
  const spec = PC_LOADOUT[key];
  if(!spec || typeof win.pcRecipeFrom !== "function") return null;
  const inventory = [];
  const equipped = { mainHand: null, offHand: null, armor: null };
  if(spec.weapon){ inventory.push({ id: "mh1", name: spec.weapon }); equipped.mainHand = "mh1"; }
  if(spec.armor){ inventory.push({ id: "ar1", name: spec.armor }); equipped.armor = "ar1"; }
  return win.pcRecipeFrom({ name: "Fixture", equipped, inventory }, spec.className);
}

console.log("=== SHAPE-WAVE UNIT 1 — pilot tri budgets ([%d, %d]%s) ===", LO, HI, FAT ? "  [FAT-INJECT: expect RED]" : "");
const results = [];
for(const cell of pilot.cells){
  let recipe, label;
  if(cell.loadout){ recipe = loadoutRecipe(cell.loadout); label = cell.name + " (loadout:" + cell.loadout + ")"; }
  else { recipe = recipeFor(cell.slug); label = cell.name + " (" + cell.slug + ")"; }
  const tris = figureTris(recipe);
  results.push({ label, slug: cell.slug || ("loadout:" + cell.loadout), base: recipe && recipe.base, tris });
}

// the ACTUAL COUNTS, written to the harness output (per the brief: "write the actual counts"), with
// each figure's tier + its per-tier ceiling.
console.log("\n  --- actual tri counts (tiered budget) ---");
for(const r of results){
  const t = tierFor(r.slug);
  const floor = (t.name === "swarm") ? 30 : LO;
  const mark = (r.tris >= floor && r.tris <= t.hi) ? " " : (r.tris < floor ? "↓" : "↑");
  console.log(`  ${mark} ${String(r.tris).padStart(4)}  ${r.label}  [${t.name}, <=${t.hi}]`);
}
console.log("");

// the assertions. CEILING: the per-tier ceiling, hard for all. FLOOR: hard (>=150) EXCEPT FLOOR_PENDING
// slugs (a downstream unit owns lifting them) and swarm-tier members (floor 30). A pending slug that
// ALREADY clears the floor is reported so the allowlist can't silently over-waive.
for(const r of results){
  const t = tierFor(r.slug);
  const floor = (t.name === "swarm") ? 30 : LO;
  const pending = FLOOR_PENDING.has(r.slug);
  if(r.tris > t.hi){
    check(`${r.label}: ${r.tris} tris <= ${t.hi} (${t.name} CEILING)`, false, `${r.tris} over the ${t.name} ceiling (base=${r.base})`);
  } else if(r.tris >= floor){
    check(`${r.label}: ${r.tris} tris in [${floor},${t.hi}] (${t.name})`, true);
    if(pending) console.log(`     NOTE: ${r.slug} clears the floor but is still FLOOR-PENDING — its downstream unit should drop it from the allowlist.`);
  } else if(pending){
    pass++; console.log(`  ⋯ ${r.label}: ${r.tris} tris (below ${floor} — FLOOR-PENDING, owned by a downstream shape-wave unit)`);
  } else {
    check(`${r.label}: ${r.tris} tris >= ${floor} (${t.name} FLOOR)`, false, `${r.tris} below floor (base=${r.base})`);
  }
}

// determinism: a second assembly is byte-identical
{
  const again = pilot.cells.map(cell => {
    const recipe = cell.loadout ? loadoutRecipe(cell.loadout) : recipeFor(cell.slug);
    return figureTris(recipe);
  });
  const same = again.every((t, i) => t === results[i].tris);
  check("determinism: two assemblies produce identical tri counts", same);
}

// ---- regression subprocess gates ---------------------------------------------------------------
console.log("\n=== regression gates ===");
function gate(name, cmd, args){
  try{
    const out = execFileSync(cmd, args, { cwd: ROOT, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
    const ok = /RESULT: OK/.test(out) || /0 failed/.test(out) || /passed, 0 failed/.test(out);
    check(name, ok, out.trim().split("\n").slice(-2).join(" | "));
  }catch(e){
    check(name, false, (e.stdout || "") + (e.stderr || e.message));
  }
}
gate("build/check-manifest.py OK", "python3", ["build/check-manifest.py"]);
gate("verify-model-parts", "node", ["dev/verify-model-parts.mjs"]);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
