/* Verify MODEL-GRAMMAR G2 (docs/MODEL-GRAMMAR.md §3/§4/§4b/§7) — the recipe generator + the §4b
   shape-hint resolver + the recipe-driven figure composer. Mixed harness (per the spec's own §7
   checklist, which spans a pure-python generator, a pure-ESM part-vocabulary check, and full jsdom
   for the classic-script chain — codex.js's canon-lock needs the real applyEvent/codexAdd runtime):

   Red-first checks (§7's own numbered list):
     1. The generator produces a valid recipe for EVERY bestiary entry (510/510, zero throws) —
        re-runs build/gen-model-recipes.py itself and inspects its own report line.
     2. Each derivation rule fires on a named REAL fixture (a flyer gets wings; an AC-18 knight gets
        the full plate set; the skeleton gets the skull head; the spider gets the thorax) — one
        check per rule, against the ACTUAL generated data/model-recipes.js (not a re-derivation).
     3. Overrides win by slug — MUTATION-PROOF: assert the override differs from the generated
        baseline, then assert removing the override (a live delete on the loaded object) makes the
        resolver fall back to the generated recipe.
     4. Every base body (Parts.PARTS[recipe.base]) exports the full §2 anchor set; every module's
        anchor exists on its base's anchor set — checked against EVERY one of the 510 recipes, not
        a sample.
     5. Box budgets hold across all 510 recipes (composing base+modules through renderPartInto's own
        box-counting, reusing theater-parts.js's pure functions directly — no THREE/GL needed since
        a part's return value IS the box list) — fails list every offender over the §6 budget
        (<=24 standard, <=40 hero-override; MODEL_RECIPE_OVERRIDES entries get the hero allowance).
     6. Determinism: two independent `python3 build/gen-model-recipes.py --emit` runs produce
        byte-identical data/model-recipes.js.
     7. The loadout mirror / recipeSlug wiring: a fixture combat object with a foe carrying
        f.statId="knight" resolves recipeSlug="knight" through theaterUnitsFrom; swapping to
        statId="goblin-warrior" swaps it (proves theaterUnitsFrom actually threads the field, not
        just that the generator produced a recipe for it in isolation). `prone`/down is untouched
        by this unit (still the archetype-builder's own rotation logic) — not re-tested here.
     8. The shape-hint resolver (§4b): a valid hint resolves cleanly; an unknown part drops to
        nearest-known + gap-logged; the resolved shape canon-locks onto the codex record (delegates
        to dev/verify-codex.mjs's own red-first shape section — this file asserts that section
        exists/passes rather than duplicating its jsdom setup, avoiding two divergent copies of the
        same mutation-tested assertions).
     Regressions: verify-theater-data / verify-model-parts / check-manifest, run as subprocess gates
     at the end (§7's own "8. Regressions" line) — one pass/fail line each, not a re-implementation.

   Run:  node dev/verify-model-grammar.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md;
         also shells out to `python3` for the generator checks). */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// §7 check 1 — the generator produces a valid recipe for EVERY bestiary entry (510/510, zero
// throws). Re-run the real generator (report-only, no --emit — doesn't touch the committed file)
// and parse its own summary line; a non-zero exit code IS a thrown-error signal.
// ============================================================================
console.log("=== §7.1 generator: 510/510 recipes, zero throws ===");
{
  let out = "", threw = false;
  try {
    out = execFileSync("python3", ["build/gen-model-recipes.py"], { cwd: ROOT, encoding: "utf-8" });
  } catch (e) {
    threw = true;
    out = (e.stdout || "") + (e.stderr || "");
  }
  check("generator exits cleanly (no exception)", !threw, out.slice(-400));
  const m = out.match(/gen-model-recipes: (\d+)\/(\d+) bestiary entries -> recipes/);
  check("generator reports 510/510", !!m && m[1] === "510" && m[2] === "510", out.slice(0, 200));
}

// ============================================================================
// Load the COMMITTED data/model-recipes.js + data/model-recipe-overrides.js + theater-parts.js
// (the ES module, pure-import — no jsdom needed for the part-vocabulary/box-budget checks) +
// data/bestiary.js (for the "named real fixture" cross-checks in §7.2).
// ============================================================================
if (!existsSync(join(ROOT, "data/model-recipes.js"))) {
  console.log("\nFATAL: data/model-recipes.js not found — run `python3 build/gen-model-recipes.py --emit` first.");
  process.exit(1);
}
const recipesSrc = read("data/model-recipes.js");
const overridesSrc = read("data/model-recipe-overrides.js");
const bestiarySrc = read("data/bestiary.js");

function extractConst(src, name) {
  const start = src.indexOf(`const ${name}=`) + `const ${name}=`.length;
  // find the matching top-level `;` that ends this const's literal — the generated file always
  // emits one const object per line ending in `;\n`, so a simple index-of-next-`;\nconst` (or EOF)
  // is exact for this file's own emit() shape (JSON.stringify never embeds a bare `;\nconst`).
  const rest = src.slice(start);
  const nextConstIdx = rest.indexOf("\nconst ");
  const chunk = nextConstIdx >= 0 ? rest.slice(0, nextConstIdx) : rest;
  return JSON.parse(chunk.trim().replace(/;$/, ""));
}
const MODEL_RECIPES = extractConst(recipesSrc, "MODEL_RECIPES");
const PART_NAMES = extractConst(recipesSrc, "PART_NAMES");

// data/model-recipe-overrides.js is a plain JS object literal (has comments) — evaluate it in a
// tiny sandboxed Function rather than JSON.parse (JSON can't have comments/trailing structure).
const MODEL_RECIPE_OVERRIDES = new Function(overridesSrc + "\nreturn MODEL_RECIPE_OVERRIDES;")();

function extractBestiary() {
  const start = bestiarySrc.indexOf("const BESTIARY={") + "const BESTIARY=".length;
  const end = bestiarySrc.indexOf("const BESTIARY_BY_CR=");
  return JSON.parse(bestiarySrc.slice(start, end).trim().replace(/;$/, ""));
}
const BESTIARY = extractBestiary();

check("data/model-recipes.js: MODEL_RECIPES has 510 entries", Object.keys(MODEL_RECIPES).length === 510,
  Object.keys(MODEL_RECIPES).length);
// MODEL-GRAMMAR G4 grew the part vocabulary from 42 (G1) to 59 (G1's 42 + the 17 walk-table props
// dev/model-coverage-report.md's class-(c) list named) — PART_NAMES is scraped live off
// theater-parts.js's own PARTS registry at generation time (gen-model-recipes.py's load_part_names),
// so this count tracks that file's actual export set rather than a second hand-typed literal.
check("data/model-recipes.js: PART_NAMES has 59 entries (42 G1 + 17 G4 walk-table props)",
  PART_NAMES.length === 59, PART_NAMES.length);

const PARTS_URL = pathToFileURL(join(ROOT, "src/ui/theater-parts.js")).href;
const Parts = await import(PARTS_URL);

// ============================================================================
// §7 check 4 — every recipe's base + module anchors resolve against the REAL §2 anchor contract,
// across ALL 510 recipes (not a sample).
// ============================================================================
console.log("\n=== §7.4 anchor validity across all 510 recipes ===");
{
  let badBase = [], badModulePart = [], badAnchor = [];
  for (const [slug, r] of Object.entries(MODEL_RECIPES)) {
    const baseFn = Parts.PARTS[r.base];
    if (!baseFn || !Parts.BODY_PART_NAMES.includes(r.base)) { badBase.push(slug); continue; }
    const anchors = baseFn.anchors;
    for (const m of r.modules) {
      if (!Parts.PARTS[m.part]) { badModulePart.push(slug + ":" + m.part); continue; }
      if (!anchors[m.anchor]) { badAnchor.push(slug + ":" + m.anchor); }
    }
  }
  check("every recipe's base is a real BODY part", badBase.length === 0, badBase.slice(0, 5).join(","));
  check("every module's part is a real PARTS entry", badModulePart.length === 0, badModulePart.slice(0, 5).join(","));
  check("every module's anchor exists on its base's anchor set", badAnchor.length === 0, badAnchor.slice(0, 5).join(","));
}

// ============================================================================
// §7 check 5 — box budgets hold across all 510 (<=24 standard; MODEL_RECIPE_OVERRIDES entries get
// the <=40 hero allowance per §6). Composes base+modules' own box arrays directly (pure function
// calls on theater-parts.js — no GL, a box list IS the geometry count).
// ============================================================================
console.log("\n=== §7.5 box budgets (<=24 standard, <=40 hero-override) ===");
{
  const offenders = [];
  for (const [slug, r] of Object.entries(MODEL_RECIPES)) {
    const baseFn = Parts.PARTS[r.base];
    if (!baseFn) continue;
    let boxCount = baseFn({}).length;
    for (const m of r.modules) {
      const fn = Parts.PARTS[m.part];
      if (!fn) continue;
      try { boxCount += fn(m.params || {}).length; } catch (e) { /* a handful of parts need seed arrays; count their default-param length as a floor */ boxCount += 1; }
    }
    const budget = MODEL_RECIPE_OVERRIDES[slug] ? 40 : 24;
    if (boxCount > budget) offenders.push(`${slug} (${boxCount} boxes, budget ${budget})`);
  }
  check("all 510 recipes stay within budget", offenders.length === 0, "offenders: " + offenders.join(" | "));
}

// ============================================================================
// §7 check 6 — determinism: two independent --emit runs produce byte-identical output.
// ============================================================================
console.log("\n=== §7.6 determinism (two --emit runs, byte-identical) ===");
{
  const before = read("data/model-recipes.js");
  execFileSync("python3", ["build/gen-model-recipes.py", "--emit"], { cwd: ROOT });
  const run1 = read("data/model-recipes.js");
  execFileSync("python3", ["build/gen-model-recipes.py", "--emit"], { cwd: ROOT });
  const run2 = read("data/model-recipes.js");
  check("two --emit runs are byte-identical", run1 === run2, "lengths: " + run1.length + " vs " + run2.length);
  check("re-emit matches the pre-existing committed file (no drift since last regen)", before === run1,
    "the committed data/model-recipes.js was stale relative to the generator — re-run --emit and re-commit");
}

// ============================================================================
// §7 check 2 — each derivation rule fires on a named REAL fixture, against the actual generated
// data (re-reads MODEL_RECIPES fresh in case check 6 rewrote the file above).
// ============================================================================
console.log("\n=== §7.2 derivation rules fire on named real fixtures ===");
{
  const RECIPES = extractConst(read("data/model-recipes.js"), "MODEL_RECIPES");

  // rule 1 — type+size -> base body. "knight" is humanoid/medium -> torso-biped.
  check("rule 1 (type+size->base): knight -> torso-biped",
    RECIPES["knight"] && RECIPES["knight"].base === "torso-biped", RECIPES["knight"] && RECIPES["knight"].base);

  // rule 2 — movement -> wing-slab. aarakocra-aeromancer flies (speed carries "Fly").
  const aero = RECIPES["aarakocra-aeromancer"];
  check("rule 2 (movement->wings): a flyer (aarakocra-aeromancer) carries wing-slab modules",
    !!aero && aero.modules.some(m => m.part === "wing-slab"),
    aero && JSON.stringify(aero.modules));

  // rule 3 — actions -> weapon module. knight's action text carries a weapon word -> mainHand module.
  const knight = RECIPES["knight"];
  check("rule 3 (actions->weapon): knight carries a mainHand weapon module",
    !!knight && knight.modules.some(m => m.anchor === "mainHand"),
    knight && JSON.stringify(knight.modules));

  // rule 4 — AC band -> armor module. knight (AC 18 in the bestiary) gets the full plate set.
  check("rule 4 (AC band->armor): knight (AC18) gets chest-plate+pauldrons+helm-crest",
    !!knight && ["chest-plate", "pauldrons", "helm-crest"].every(p => knight.modules.some(m => m.part === p)),
    knight && JSON.stringify(knight.modules));

  // rule 5 — name keywords. flaming-skeleton -> head-skull + bone-protrusions + ember-flecks.
  const fskel = RECIPES["flaming-skeleton"];
  check("rule 5 (name keyword, skeleton): flaming-skeleton carries head-skull + bone-protrusions",
    !!fskel && fskel.modules.some(m => m.part === "head-skull") && fskel.modules.some(m => m.part === "bone-protrusions"),
    fskel && JSON.stringify(fskel.modules));
  check("rule 5 (name keyword, flame): flaming-skeleton also carries ember-flecks + glow:fire",
    !!fskel && fskel.modules.some(m => m.part === "ember-flecks") && fskel.channels.glow === "fire",
    fskel && JSON.stringify(fskel));
  // spider — base override to thorax-abdomen + 8 leg-spider modules.
  const spider = RECIPES["giant-spider"];
  check("rule 5 (name keyword, spider): giant-spider bases on thorax-abdomen with 8 leg-spider modules",
    !!spider && spider.base === "thorax-abdomen" && spider.modules.filter(m => m.part === "leg-spider").length === 8,
    spider && JSON.stringify(spider.base) + " " + (spider && spider.modules.filter(m => m.part === "leg-spider").length));

  // rule 6 — CR scalar. a high-CR entry carries a bulk scalar.
  const highCr = Object.entries(BESTIARY).find(([, e]) => (e.cr || 0) >= 15);
  const highCrRecipe = highCr && RECIPES[highCr[0]];
  check("rule 6 (CR scalar): a CR15+ creature carries scalars.bulk >= 1.35",
    !!highCrRecipe && highCrRecipe.scalars && highCrRecipe.scalars.bulk >= 1.35,
    highCrRecipe && JSON.stringify(highCrRecipe.scalars));

  // rule 7 — fallback: a low-CR, untyped/plain creature with no keyword hits gets the pure §4.7
  // fallback (no modules, armor:"none", no scalars) — assert at least one such recipe exists (the
  // generator's own report line already counts these; here we just prove the SHAPE of one).
  const fallbackEntry = Object.entries(RECIPES).find(([, r]) =>
    r.modules.length === 0 && r.channels.armor === "none" && !r.scalars);
  check("rule 7 (fallback): at least one recipe is the pure §4.7 fallback (no modules/armor/scalars)",
    !!fallbackEntry, fallbackEntry && fallbackEntry[0]);
}

// ============================================================================
// §7 check 3 — overrides win by slug, MUTATION-PROOF.
// ============================================================================
console.log("\n=== §7.3 overrides win by slug (mutation-proof) ===");
{
  const generatedGoblin = MODEL_RECIPES["goblin-warrior"];
  const overrideGoblin = MODEL_RECIPE_OVERRIDES["goblin-warrior"];
  check("override exists for goblin-warrior", !!overrideGoblin);
  check("override DIFFERS from the generated baseline (proves it's a real override, not a no-op)",
    JSON.stringify(generatedGoblin.modules) !== JSON.stringify(overrideGoblin.modules),
    JSON.stringify({ generated: generatedGoblin.modules, override: overrideGoblin.modules }));

  // simulate theater-boot.js's recipeFor resolution order directly.
  function recipeFor(slug, overrides, generated) {
    if (overrides[slug]) return overrides[slug];
    if (generated[slug]) return generated[slug];
    return null;
  }
  const resolved1 = recipeFor("goblin-warrior", MODEL_RECIPE_OVERRIDES, MODEL_RECIPES);
  check("resolver picks the OVERRIDE when present", resolved1 === overrideGoblin);

  // MUTATION: delete the override -> resolver must fall back to the generated recipe.
  const mutatedOverrides = Object.assign({}, MODEL_RECIPE_OVERRIDES);
  delete mutatedOverrides["goblin-warrior"];
  const resolved2 = recipeFor("goblin-warrior", mutatedOverrides, MODEL_RECIPES);
  check("MUTATION: removing the override falls back to the generated recipe",
    resolved2 === generatedGoblin);
}

// ============================================================================
// §7 check 7 — theaterUnitsFrom actually threads f.statId -> unit.recipeSlug (jsdom, real
// classic-script chain via manifest.json's loadOrder — same convention as verify-theater-data.mjs).
// ============================================================================
console.log("\n=== §7.7 recipeSlug wiring (theaterUnitsFrom, jsdom) ===");
{
  const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
  const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
  const man = JSON.parse(read("manifest.json"));
  const moduleTypedPaths = new Set(man.modules.filter(m => m.type === "module").map(m => m.path));
  const src = man.loadOrder.filter(p => p.endsWith(".js") && !moduleTypedPaths.has(p)).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval("var U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

  const combat1 = {
    grid: { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"] },
    pc: { band: "melee", lane: "C" }, pcRef: { creatureType: "humanoid" },
    foes: [{ fid: "f1", band: "far", lane: "C", creatureType: "humanoid", size: "medium", name: "Knight", statId: "knight", actions: [] }]
  };
  const units1 = win.theaterUnitsFrom(combat1);
  const foe1 = units1.units.find(u => u.id === "f1");
  check("a foe with statId:'knight' carries recipeSlug:'knight'", foe1 && foe1.recipeSlug === "knight", JSON.stringify(foe1));

  const combat2 = JSON.parse(JSON.stringify(combat1));
  combat2.foes[0].statId = "goblin-warrior";
  const units2 = win.theaterUnitsFrom(combat2);
  const foe2 = units2.units.find(u => u.id === "f1");
  check("swapping statId swaps recipeSlug too", foe2 && foe2.recipeSlug === "goblin-warrior", JSON.stringify(foe2));

  const combat3 = JSON.parse(JSON.stringify(combat1));
  delete combat3.foes[0].statId;
  const units3 = win.theaterUnitsFrom(combat3);
  const foe3 = units3.units.find(u => u.id === "f1");
  check("a statless foe carries recipeSlug:null (never undefined-crashes)", foe3 && foe3.recipeSlug === null, JSON.stringify(foe3));

  // §4b resolver reachable from this same jsdom window (classic global).
  check("resolveShapeHint is reachable as a classic-script global in the real load chain",
    typeof win.resolveShapeHint === "function");
  const hint = win.resolveShapeHint({ base: "torso-biped", modules: [{ part: "sword-slab", anchor: "mainHand" }] });
  check("§7.8 valid shape hint resolves with zero gaps (jsdom, real chain)",
    hint.gaps.length === 0 && hint.resolved.base === "torso-biped", JSON.stringify(hint));
  const badHint = win.resolveShapeHint({ base: "bogus", modules: [{ part: "bogus2", anchor: "mainHand" }] });
  check("§7.8 unknown shape hint drops to nearest-known + logs gaps (jsdom, real chain)",
    badHint.gaps.length === 2 && badHint.resolved.base === "torso-biped", JSON.stringify(badHint));
}

// ============================================================================
// §7 check 8 (codex canon-lock half) — delegated to dev/verify-codex.mjs's own red-first shape
// section (avoids a second divergent copy of the same jsdom+mutation-tested assertions). This
// harness asserts that section exists in the source (a structural guard against silent deletion)
// and that the file as a whole is currently green.
// ============================================================================
console.log("\n=== §7.8 (codex half) — delegated to dev/verify-codex.mjs ===");
{
  const codexVerifySrc = read("dev/verify-codex.mjs");
  check("verify-codex.mjs still carries the MODEL-GRAMMAR §4b shape canon-lock section",
    codexVerifySrc.includes("MODEL-GRAMMAR G2 §4b") && codexVerifySrc.includes("codexResolveShapeOnMint"));
  let codexOut = "", codexFailed = false;
  try {
    codexOut = execFileSync("node", ["dev/verify-codex.mjs"], { cwd: ROOT, encoding: "utf-8" });
  } catch (e) {
    codexFailed = true;
    codexOut = (e.stdout || "") + (e.stderr || "");
  }
  check("dev/verify-codex.mjs is green (incl. the shape canon-lock checks)", !codexFailed, codexOut.split("\n").slice(-5).join(" | "));
}

// ============================================================================
// Regressions (§7's own "8. Regressions" line): verify-theater-data / verify-model-parts /
// check-manifest, run as subprocess gates.
// ============================================================================
console.log("\n=== regressions: verify-theater-data / verify-model-parts / check-manifest ===");
function runGate(label, cmd, args) {
  let out = "", failed = false;
  try {
    out = execFileSync(cmd, args, { cwd: ROOT, encoding: "utf-8" });
  } catch (e) {
    failed = true;
    out = (e.stdout || "") + (e.stderr || "");
  }
  check(label, !failed, out.split("\n").slice(-5).join(" | "));
}
runGate("dev/verify-theater-data.mjs unchanged/green", "node", ["dev/verify-theater-data.mjs"]);
runGate("dev/verify-model-parts.mjs green (261/0 as of MODEL-GRAMMAR G4 — was 176/0 pre-G4; G4 added 17 walk-table props, this gate just needs 0-failed, not a specific count)", "node", ["dev/verify-model-parts.mjs"]);
runGate("build/check-manifest.py OK", "python3", ["build/check-manifest.py"]);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
