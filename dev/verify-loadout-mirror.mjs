/* Verify MODEL-GRAMMAR G3 (docs/MODEL-GRAMMAR.md §2) — the loadout mirror + condition modules.
   Pure jsdom harness over the real classic-script chain (manifest.json's loadOrder, same
   convention as dev/verify-theater-data.mjs / dev/verify-model-grammar.mjs's §7.7 section) —
   pcRecipeFrom/theaterConditionModsFrom are pure functions in src/engine/theater-data.js with
   zero GL coupling, so no browser is needed to exercise them.

   Red-first checks:
     1. A fixture sheet with a greatsword equipped at mainHand -> pcRecipeFrom emits a
        sword-slab module at anchor "mainHand".
     2. Swap mainHand to a shortbow -> the module list no longer carries sword-slab; it carries
        bow-arcs at mainHand instead (the part REPLACES, doesn't accumulate).
     3. A shield equipped at offHand -> shield-slab module at anchor "offHand".
     4. Unarmed (no mainHand item) -> zero mainHand-anchored weapon module.
     5. A caster class (e.g. Wizard) keeps robe-skirt regardless of what's in mainHand (a caster
        wielding a dagger still gets robe-skirt AND the dagger module — the class rule governs
        silhouette, not the weapon read).
     6. A non-caster class does NOT get robe-skirt.
     7. Armor category bands: light armor -> no chest-plate/pauldrons-at-shoulders-as-plate (light
        band's own module set), heavy armor -> the full chest-plate+pauldrons+helm-crest set.
     8. Conditions as modules: a prone fixture (holder.conditions:["prone"]) carries a rotation
        mod (~80deg in radians) via theaterConditionModsFrom; a burning foe (conditions:["burning"])
        carries an ember-flecks attach mod; restrained carries a shield-slab attach mod at "base".
     9. Determinism: two independent pcRecipeFrom calls on an identical fixture produce
        byte-identical (JSON-equal) recipes.
     10. theaterUnitsFrom wiring: a live combat object with pcRef.equipped set produces a pc unit
         carrying a non-null pcRecipe with the right module; a pcRef with no `equipped` field
         degrades to pcRecipe:null (never worse than today — falls through to the archetype
         builder unchanged). Same check for an ally carrying its own equipped/inventory.
     11. MUTATION PROOF: neuter the equipped read (delete the fixture's equipped.mainHand) ->
         the sword-slab assertion goes RED, proving check 1 is load-bearing, not vacuously true.
     Regressions: verify-model-grammar / verify-model-parts / verify-theater-data / verify-items /
     check-manifest, run as subprocess gates.

   Run:  node dev/verify-loadout-mirror.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleTypedPaths = new Set(man.modules.filter(m => m.type === "module").map(m => m.path));
const moduleSrc = man.loadOrder
  .filter((p) => p.endsWith(".js") && !moduleTypedPaths.has(p))
  .map(read).join("\n;\n");

function freshWin(){
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(`var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;\n` + moduleSrc);
  return win;
}

// ============================================================================
// fixture builders
// ============================================================================
function sheetWith(opts){
  opts = opts || {};
  const inventory = [];
  const equipped = { mainHand: null, offHand: null, armor: null };
  if(opts.mainHand){ inventory.push({ id: "mh1", name: opts.mainHand }); equipped.mainHand = "mh1"; }
  if(opts.offHand){ inventory.push({ id: "oh1", name: opts.offHand }); equipped.offHand = "oh1"; }
  if(opts.armor){ inventory.push({ id: "ar1", name: opts.armor }); equipped.armor = "ar1"; }
  return { name: "Fixture", equipped, inventory };
}

console.log("=== §2 pcRecipeFrom: the loadout mirror ===");
{
  const win = freshWin();

  // check 1 — greatsword -> sword-slab at mainHand
  const swordRecipe = win.pcRecipeFrom(sheetWith({ mainHand: "Greatsword" }), "Fighter");
  const swordMod = swordRecipe.modules.find(m => m.anchor === "mainHand");
  check("greatsword equipped -> sword-slab module at mainHand",
    !!swordMod && swordMod.part === "sword-slab", JSON.stringify(swordRecipe.modules));

  // check 2 — swap to shortbow -> bow-arcs replaces sword-slab (not both)
  const bowRecipe = win.pcRecipeFrom(sheetWith({ mainHand: "Shortbow" }), "Fighter");
  const bowMod = bowRecipe.modules.find(m => m.anchor === "mainHand");
  check("swap to shortbow -> bow-arcs module at mainHand",
    !!bowMod && bowMod.part === "bow-arcs", JSON.stringify(bowRecipe.modules));
  check("swap to shortbow -> no leftover sword-slab module",
    !bowRecipe.modules.some(m => m.part === "sword-slab"), JSON.stringify(bowRecipe.modules));

  // check 3 — shield equips at offHand
  const shieldRecipe = win.pcRecipeFrom(sheetWith({ mainHand: "Longsword", offHand: "Shield" }), "Fighter");
  const shieldMod = shieldRecipe.modules.find(m => m.anchor === "offHand");
  check("shield equipped -> shield-slab module at offHand",
    !!shieldMod && shieldMod.part === "shield-slab", JSON.stringify(shieldRecipe.modules));

  // check 4 — unarmed -> no mainHand weapon module
  const unarmedRecipe = win.pcRecipeFrom(sheetWith({}), "Fighter");
  check("unarmed (no mainHand item) -> no mainHand weapon module",
    !unarmedRecipe.modules.some(m => m.anchor === "mainHand"), JSON.stringify(unarmedRecipe.modules));

  // check 5 — caster class keeps robe-skirt regardless of weapon
  const casterDagger = win.pcRecipeFrom(sheetWith({ mainHand: "Dagger" }), "Wizard");
  check("caster (Wizard) wielding a dagger -> carries robe-skirt at base",
    casterDagger.modules.some(m => m.part === "robe-skirt" && m.anchor === "base"),
    JSON.stringify(casterDagger.modules));
  check("caster (Wizard) wielding a dagger -> STILL carries the dagger-slabs module",
    casterDagger.modules.some(m => m.part === "dagger-slabs" && m.anchor === "mainHand"),
    JSON.stringify(casterDagger.modules));

  // check 6 — non-caster does NOT get robe-skirt
  const fighterRecipe = win.pcRecipeFrom(sheetWith({ mainHand: "Longsword" }), "Fighter");
  check("non-caster (Fighter) -> no robe-skirt module",
    !fighterRecipe.modules.some(m => m.part === "robe-skirt"), JSON.stringify(fighterRecipe.modules));

  // check 7 — armor bands: light -> no plate; heavy -> full chest-plate+pauldrons+helm-crest set
  const lightRecipe = win.pcRecipeFrom(sheetWith({ armor: "Leather Armor" }), "Rogue");
  check("light armor (category 'Light Armor') -> no chest-plate/helm-crest module",
    !lightRecipe.modules.some(m => m.part === "chest-plate" || m.part === "helm-crest"),
    JSON.stringify(lightRecipe.modules));
  const heavyRecipe = win.pcRecipeFrom(sheetWith({ armor: "Plate Armor" }), "Fighter");
  const heavyParts = heavyRecipe.modules.map(m => m.part);
  check("heavy armor (category 'Heavy Armor') -> full chest-plate+pauldrons+helm-crest set",
    ["chest-plate", "pauldrons", "helm-crest"].every(p => heavyParts.includes(p)),
    JSON.stringify(heavyRecipe.modules));

  // check 9 — determinism
  const r1 = win.pcRecipeFrom(sheetWith({ mainHand: "Warhammer", armor: "Chain Mail" }), "Cleric");
  const r2 = win.pcRecipeFrom(sheetWith({ mainHand: "Warhammer", armor: "Chain Mail" }), "Cleric");
  check("pcRecipeFrom is deterministic (two calls, identical fixture -> JSON-equal)",
    JSON.stringify(r1) === JSON.stringify(r2), JSON.stringify(r1) + " vs " + JSON.stringify(r2));
}

// ============================================================================
// §2 conditions as modules
// ============================================================================
console.log("\n=== §2 theaterConditionModsFrom: conditions as modules ===");
{
  const win = freshWin();

  const proneMods = win.theaterConditionModsFrom({ conditions: ["prone"] });
  const rotMod = proneMods.find(m => m.kind === "rotation");
  check("prone -> a rotation mod (~80deg)",
    !!rotMod && Math.abs(rotMod.angle - (80 * Math.PI / 180)) < 1e-9, JSON.stringify(proneMods));

  const burningMods = win.theaterConditionModsFrom({ conditions: ["burning"] });
  const emberMod = burningMods.find(m => m.kind === "attach" && m.part === "ember-flecks");
  check("burning -> an ember-flecks attach mod",
    !!emberMod, JSON.stringify(burningMods));

  const restrainedMods = win.theaterConditionModsFrom({ conditions: ["restrained"] });
  const bandMod = restrainedMods.find(m => m.kind === "attach" && m.anchor === "base");
  check("restrained -> a binding-band attach mod at base",
    !!bandMod, JSON.stringify(restrainedMods));

  // structured-entry shape (engine.conditions' {condition,ttl,appliedRound}) resolves identically
  // to the bare-string shape, via the same condName normalizer the digest already uses.
  const structuredMods = win.theaterConditionModsFrom({ conditions: [{ condition: "prone", ttl: { rounds: 1 } }] });
  check("structured condition entry ({condition,ttl}) resolves the same as a bare string",
    structuredMods.some(m => m.kind === "rotation"), JSON.stringify(structuredMods));

  // a holder with no conditions field, or an unrelated condition, contributes nothing (never throws).
  const noneMods = win.theaterConditionModsFrom({});
  check("a holder with no conditions -> empty mods array (never throws)",
    Array.isArray(noneMods) && noneMods.length === 0, JSON.stringify(noneMods));
  const unrelatedMods = win.theaterConditionModsFrom({ conditions: ["poisoned"] });
  check("an unrelated condition (poisoned, no visual opinion here) -> empty mods array",
    Array.isArray(unrelatedMods) && unrelatedMods.length === 0, JSON.stringify(unrelatedMods));
}

// ============================================================================
// theaterUnitsFrom wiring — pcRecipe + conditionMods actually reach the unit object
// ============================================================================
console.log("\n=== theaterUnitsFrom wiring (pcRecipe / conditionMods on real units) ===");
{
  const win = freshWin();
  const combat1 = {
    grid: { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"] },
    pc: { band: "melee", lane: "C" },
    pcRef: {
      class: "Fighter", creatureType: "humanoid",
      equipped: { mainHand: "mh1", offHand: null, armor: null },
      inventory: [{ id: "mh1", name: "Greataxe" }],
      conditionsRef: { conditions: ["prone"] }
    },
    foes: []
  };
  const units1 = win.theaterUnitsFrom(combat1);
  const pcUnit1 = units1.units.find(u => u.id === "pc");
  check("a pcRef with equipped -> unit.pcRecipe is non-null and carries an axe-wedge module",
    !!pcUnit1 && !!pcUnit1.pcRecipe && pcUnit1.pcRecipe.modules.some(m => m.part === "axe-wedge"),
    JSON.stringify(pcUnit1 && pcUnit1.pcRecipe));
  check("the same pc unit carries conditionMods from conditionsRef (prone -> rotation mod)",
    !!pcUnit1 && pcUnit1.conditionMods.some(m => m.kind === "rotation"),
    JSON.stringify(pcUnit1 && pcUnit1.conditionMods));

  // a pcRef with NO equipped field (an older snapshot / narrow fixture) degrades to pcRecipe:null —
  // never worse than today, falls through to the archetype/silhouette builder unchanged.
  const combat2 = { grid: combat1.grid, pc: { band: "melee", lane: "C" }, pcRef: { class: "Fighter" }, foes: [] };
  const units2 = win.theaterUnitsFrom(combat2);
  const pcUnit2 = units2.units.find(u => u.id === "pc");
  check("a pcRef with no `equipped` field -> unit.pcRecipe is null (never worse than today)",
    !!pcUnit2 && pcUnit2.pcRecipe === null, JSON.stringify(pcUnit2));

  // an ally carrying its own equipped/inventory mirrors the same derivation.
  const combat3 = {
    grid: combat1.grid, pc: null,
    allies: [{ id: "ally1", class: "Wizard", band: "near", lane: "C",
      equipped: { mainHand: "sh1", offHand: null, armor: null },
      inventory: [{ id: "sh1", name: "Quarterstaff" }] }],
    foes: [{ fid: "f1", band: "far", lane: "C", name: "Bandit", conditions: ["burning"] }]
  };
  const units3 = win.theaterUnitsFrom(combat3);
  const allyUnit = units3.units.find(u => u.id === "ally1");
  check("an ally with its own equipped -> pcRecipe carries robe-skirt (Wizard) + staff-tipped",
    !!allyUnit && !!allyUnit.pcRecipe &&
    allyUnit.pcRecipe.modules.some(m => m.part === "robe-skirt") &&
    allyUnit.pcRecipe.modules.some(m => m.part === "staff-tipped"),
    JSON.stringify(allyUnit && allyUnit.pcRecipe));

  const foeUnit = units3.units.find(u => u.id === "f1");
  check("a burning foe carries an ember-flecks conditionMod",
    !!foeUnit && foeUnit.conditionMods.some(m => m.kind === "attach" && m.part === "ember-flecks"),
    JSON.stringify(foeUnit && foeUnit.conditionMods));
}

// ============================================================================
// MUTATION PROOF — neuter the equipped read, prove check 1 above is load-bearing.
// ============================================================================
console.log("\n=== MUTATION PROOF ===");
{
  const win = freshWin();
  const fixture = sheetWith({ mainHand: "Greatsword" });
  const before = win.pcRecipeFrom(fixture, "Fighter");
  check("(sanity) unmutated fixture DOES carry sword-slab", before.modules.some(m => m.part === "sword-slab"));

  // MUTATION: delete the equipped mainHand id -> the item resolution chain has nothing to look up,
  // so the sword-slab module must disappear.
  const mutated = sheetWith({ mainHand: "Greatsword" });
  delete mutated.equipped.mainHand;
  const after = win.pcRecipeFrom(mutated, "Fighter");
  check("MUTATION: deleting equipped.mainHand -> sword-slab module disappears (proves check 1 is load-bearing)",
    !after.modules.some(m => m.part === "sword-slab"), JSON.stringify(after.modules));
}

// ============================================================================
// Regressions
// ============================================================================
console.log("\n=== regressions: verify-model-grammar / verify-model-parts / verify-theater-data / verify-items / check-manifest ===");
function runGate(label, cmd, args){
  let out = "", failed = false;
  try {
    out = execFileSync(cmd, args, { cwd: ROOT, encoding: "utf-8" });
  } catch (e) {
    failed = true;
    out = (e.stdout || "") + (e.stderr || "");
  }
  check(label, !failed, out.split("\n").slice(-6).join(" | "));
}
runGate("dev/verify-model-grammar.mjs green (34/0)", "node", ["dev/verify-model-grammar.mjs"]);
runGate("dev/verify-model-parts.mjs green (176/0)", "node", ["dev/verify-model-parts.mjs"]);
runGate("dev/verify-theater-data.mjs green (unchanged)", "node", ["dev/verify-theater-data.mjs"]);
runGate("dev/verify-items.mjs green (123/0, unchanged)", "node", ["dev/verify-items.mjs"]);
runGate("build/check-manifest.py OK", "python3", ["build/check-manifest.py"]);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
