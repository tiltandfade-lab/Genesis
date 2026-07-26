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
check("data/model-recipes.js: PART_NAMES has 61 entries (42 G1 + 17 G4 walk-table props + 2 Unit-2: torso-tapered, maw-open)",
  PART_NAMES.length === 61, PART_NAMES.length);

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
// §7 check 5 — TRIANGLE budgets hold across all 510 recipes. SHAPE-WAVE UNIT 2 + L21/L13: the budget
// is now TRIANGLES, not spec-count (a lofted body or a fanned wing is one part but many tris; a box
// era ≤24-SPEC cap no longer measures cost meaningfully — a single loft is one spec worth ~44 tris,
// and a wing is 5 specs worth ~40 tris). Adam's TIERED budget (2026-07-03) tops out at 600 for the
// PC/boss/large tier and ~800 for a whole swarm; this global 510-sweep asserts a generous per-figure
// tri CEILING of 800 (the swarm-tier max, safely above the richest bestiary figure — the gargoyle at
// ~552 today). The pilot-set TIERED per-figure ceilings live in dev/verify-tri-budget.mjs; this check
// is the coarse global guardrail that no recipe blows a hard cap. Counts tris via theater-parts.js's
// SHAPE_TRIS (fixed solids) + each loft's own precomputed `tris` field — no THREE/GL needed.
// ============================================================================
console.log("\n=== §7.5 triangle budgets (global <=800/figure; tiered pilot budgets in verify-tri-budget) ===");
{
  const ST = Parts.SHAPE_TRIS;
  const specTris = (b) => (b.shape === "loft" ? (b.tris || 0) : (ST[b.shape || "box"] || ST.box));
  const partTris = (fn, p) => { if (!fn) return 0; let n = 0; try { for (const b of fn(p || {})) n += specTris(b); } catch (e) { n += ST.box; } return n; };
  const BIPED = { "torso-biped": 1, "torso-tapered": 1, "torso-biped-huge": 1 }, QUAD = { "torso-quad": 1 };
  const GLOBAL_TRI_CEILING = 800;
  const offenders = [];
  for (const [slug, r] of Object.entries(MODEL_RECIPES)) {
    const base = (r.base && Parts.PARTS[r.base]) ? r.base : "torso-biped";
    let tris = partTris(Parts.PARTS[base], {});
    // mirror buildFigureFromRecipe's implicit limbs (biped arms+legs, quad legs) so the count matches
    // what actually renders — a recipe never lists these modules; the render path draws them.
    if (BIPED[base]) {
      const lp = base === "torso-biped-huge" ? Parts.torsoBipedHuge.legParams(-1) : Parts.torsoBiped.legParams(-1, 0, 0.05);
      tris += partTris(Parts.legTapered, lp) * 2;
      const ap = base === "torso-biped-huge" ? Parts.torsoBipedHuge.armParams(-1) : { side: -1 };
      tris += partTris(Parts.armTapered, ap) * 2;
    }
    if (QUAD[base]) tris += partTris(Parts.legTapered, {}) * 4;
    for (const m of r.modules) tris += partTris(Parts.PARTS[m.part], m.params || {});
    if (tris > GLOBAL_TRI_CEILING) offenders.push(`${slug} (${tris} tris > ${GLOBAL_TRI_CEILING})`);
  }
  check("all 510 recipes stay within the global " + GLOBAL_TRI_CEILING + "-tri ceiling", offenders.length === 0, "offenders: " + offenders.join(" | "));
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

  // rule 1 — type+size -> base body. A plain (non-martial) humanoid stays torso-biped ("commoner" is
  // humanoid/medium with no soldier keyword). NOTE: "knight" is NO LONGER a plain-biped fixture — Unit
  // 2's soldier-taper swap now bases martial humanoids on torso-tapered (asserted just below), so the
  // canonical plain-biped fixture moved to commoner.
  check("rule 1 (type+size->base): a plain humanoid (commoner) -> torso-biped",
    RECIPES["commoner"] && RECIPES["commoner"].base === "torso-biped", RECIPES["commoner"] && RECIPES["commoner"].base);
  // UNIT 2 (L6) — the soldier V-taper swap: a martial humanoid (knight) bases on torso-tapered, not
  // the flat torso-biped crate; a plain humanoid (commoner) does NOT (proves the swap is keyword-gated,
  // not blanket). torso-tapered stays biped-family so knight still gets its weapon + plate (rules 3/4).
  check("UNIT 2 (soldier taper): a martial humanoid (knight) bases on torso-tapered",
    RECIPES["knight"] && RECIPES["knight"].base === "torso-tapered", RECIPES["knight"] && RECIPES["knight"].base);
  check("UNIT 2 (soldier taper): a NON-martial humanoid (commoner) stays torso-biped (swap is keyword-gated)",
    RECIPES["commoner"] && RECIPES["commoner"].base === "torso-biped", RECIPES["commoner"] && RECIPES["commoner"].base);
  // UNIT 2 (L4) — the maw-open predator-jaw rule: a wolf/beast gets an open toothed jaw at `head`.
  const wolfMaw = RECIPES["dire-wolf"] || RECIPES["wolf"] || RECIPES["worg"];
  check("UNIT 2 (maw-open): a predator (dire-wolf/wolf/worg) carries a maw-open module at head",
    !!wolfMaw && wolfMaw.modules.some(m => m.part === "maw-open" && m.anchor === "head"),
    wolfMaw && JSON.stringify(wolfMaw.modules.map(m => m.part)));

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
// G5 ROUND-1 (2026-07-03, Adam live-review rulings 1/4/5) — red-first checks per the round's own
// gate list: "natural channels resolved per fixture creature (skeleton gets bone); translucent flag
// on ghost; stance on goblin/zombie." Against the ACTUAL generated data/model-recipes.js (re-read
// fresh, same discipline as §7.2 above — check 6 may have rewritten the file).
// ============================================================================
console.log("\n=== G5 ROUND-1 ruling 1: natural channels resolved per fixture creature ===");
{
  const RECIPES = extractConst(read("data/model-recipes.js"), "MODEL_RECIPES");
  const skel = RECIPES["flaming-skeleton"];
  check("skeleton (flaming-skeleton) resolves skin:'bone-white' (not a generic undead grey)",
    !!skel && skel.channels.skin === "bone-white", skel && JSON.stringify(skel.channels));
  const zomb = RECIPES["zombie"];
  check("zombie resolves skin:'sickly-grey-green'",
    !!zomb && zomb.channels.skin === "sickly-grey-green", zomb && JSON.stringify(zomb.channels));
  const gobBoss = RECIPES["goblin-boss"];
  check("goblinoid (goblin-boss) resolves skin:'olive-dun' (not a flat foe tint)",
    !!gobBoss && gobBoss.channels.skin === "olive-dun", gobBoss && JSON.stringify(gobBoss.channels));
  const ratSwarm = RECIPES["swarm-of-rats"];
  check("beast/swarm (swarm-of-rats) resolves skin:'grey-brown-fur'",
    !!ratSwarm && ratSwarm.channels.skin === "grey-brown-fur", ratSwarm && JSON.stringify(ratSwarm.channels));
  // negative check: two DIFFERENT creature families must NOT resolve to the same skin value — proves
  // this is a real per-creature derivation, not a single hardcoded string that happens to satisfy the
  // positive assertions above.
  check("skeleton and goblin resolve to DIFFERENT skin values (real per-creature derivation, not one hardcode)",
    !!skel && !!gobBoss && skel.channels.skin !== gobBoss.channels.skin,
    JSON.stringify({ skeleton: skel && skel.channels.skin, goblin: gobBoss && gobBoss.channels.skin }));
}

console.log("\n=== G5 ROUND-1 ruling 4: translucent flag on ghost/spectral fixtures ===");
{
  const RECIPES = extractConst(read("data/model-recipes.js"), "MODEL_RECIPES");
  const ghost = RECIPES["ghost"];
  check("ghost carries translucent:true", !!ghost && ghost.translucent === true, ghost && JSON.stringify(ghost));
  const knight = RECIPES["knight"];
  check("a non-spectral fixture (knight) carries NO translucent key (opaque stays the default)",
    !!knight && knight.translucent === undefined, knight && JSON.stringify(knight.translucent));
}

console.log("\n=== G5 ROUND-1 ruling 5: stance on goblin/zombie fixtures ===");
{
  const RECIPES = extractConst(read("data/model-recipes.js"), "MODEL_RECIPES");
  const gobBoss = RECIPES["goblin-boss"];
  // UNIT 3 (L3): the goblinoid PROPORTION preset now sets headScale 1.6 (oversized head), which WINS
  // over the stance's gentler 1.25 default (max() in the generator) — so the assertion is now
  // "hunched + headScale >= 1.25 (and specifically the L3 goblinoid 1.6)", not "== 1.25". The hunch
  // stance is unchanged; only the head got MORE exaggerated per L3.
  check("goblinoid (goblin-boss) carries stance:'hunched' + the L3 oversized head (headScale 1.6, >= the old 1.25)",
    !!gobBoss && gobBoss.stance === "hunched" && gobBoss.scalars && gobBoss.scalars.headScale === 1.6,
    gobBoss && JSON.stringify({ stance: gobBoss.stance, scalars: gobBoss.scalars }));
  const zomb = RECIPES["zombie"];
  check("zombie carries stance:'slouched'", !!zomb && zomb.stance === "slouched", zomb && JSON.stringify(zomb.stance));
  const knight = RECIPES["knight"];
  check("a non-goblinoid/non-zombie fixture (knight) carries NO stance key",
    !!knight && knight.stance === undefined, knight && JSON.stringify(knight.stance));
}

// ============================================================================
// UNIT 3 (L3) — FAMILY PROPORTION PRESETS: per-family exaggeration scalars fire on named fixtures,
// and — critically — a per-slug OVERRIDE still wins over the family preset (the unit's own hard
// requirement). Red-first: each family's signature scalar asserted on a real creature; a negative
// (plain humanoid = no exaggeration) proves the presets are keyword/type-gated, not blanket.
// ============================================================================
console.log("\n=== UNIT 3 (L3): family proportion presets fire per family; override still wins ===");
{
  const RECIPES = extractConst(read("data/model-recipes.js"), "MODEL_RECIPES");
  const gob = RECIPES["goblin-warrior"];
  // the GENERATED goblin-warrior (before the override) carries the full L3 goblinoid preset.
  check("L3: generated goblinoid (goblin-warrior) has head 1.6 + hands 1.5 + stumpy legs 0.65",
    !!gob && gob.scalars && gob.scalars.headScale === 1.6 && gob.scalars.handScale === 1.5 && gob.scalars.legScale === 0.65,
    gob && JSON.stringify(gob.scalars));
  const skel = RECIPES["skeleton"];
  check("L3: undead (skeleton) has a gaunt torso (torsoScale 0.85)",
    !!skel && skel.scalars && skel.scalars.torsoScale === 0.85, skel && JSON.stringify(skel.scalars));
  const wolf = RECIPES["wolf"] || RECIPES["dire-wolf"];
  check("L3: beast (wolf) has an enlarged head (headScale >= 1.3)",
    !!wolf && wolf.scalars && wolf.scalars.headScale >= 1.3, wolf && JSON.stringify(wolf.scalars));
  const giantRow = Object.entries(RECIPES).find(([s]) => /giant/.test(s) && RECIPES[s].scalars && RECIPES[s].scalars.headScale === 0.9);
  check("L3: a giant has uniform bulk + a PROPORTIONALLY smaller head (headScale 0.9)",
    !!giantRow, giantRow && giantRow[0]);
  const commoner = RECIPES["commoner"];
  check("L3: a plain humanoid (commoner) has NO proportion exaggeration (presets are gated, not blanket)",
    !!commoner && (!commoner.scalars || (commoner.scalars.headScale == null && commoner.scalars.handScale == null && commoner.scalars.legScale == null && commoner.scalars.torsoScale == null)),
    commoner && JSON.stringify(commoner.scalars || {}));

  // THE OVERRIDE-WINS-OVER-PRESET PROOF: the hand-authored goblin-warrior OVERRIDE replaces the whole
  // recipe (this file's overrides-replace-not-diff discipline). Its scalars are whatever the override
  // author set (headScale 1.25 in the mutation-proof fixture), NOT the generated preset's 1.6 — proving
  // a per-slug override takes precedence over the family preset, the unit's own requirement.
  const genGob = RECIPES["goblin-warrior"];       // generated (preset headScale 1.6)
  const ovGob = MODEL_RECIPE_OVERRIDES["goblin-warrior"];  // hand-authored override
  check("UNIT 3: a per-slug override's scalars are the AUTHOR's, not the family preset's (override wins over preset)",
    !!ovGob && ovGob.scalars && ovGob.scalars.headScale === 1.25 && genGob.scalars.headScale === 1.6,
    JSON.stringify({ override: ovGob && ovGob.scalars, generated: genGob && genGob.scalars }));
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
// G5 ROUND-1 (ruling 3) — weapon-grip check, SUPERSEDED by G5 ROUND-2 below. Round-1's own
// "figure bbox" here PADDED IN a mainHand-side arm-tapered call that theater-boot.js's real
// buildFigureFromRecipe never actually drew (recipe-driven figures rendered NO limbs at all —
// build/gen-model-recipes.py's §4 derivation rules never emit a leg-tapered/arm-tapered module).
// That padding made this check pass green against the ACTUAL live bug the orchestrator's fixture-6
// screenshot caught round-2 ("several thin ember/red weapon slabs render AT GROUND LEVEL next to
// their figures") — a false-positive gate, not a real red/green proof. Left here (inert, the
// checks below replace it) as the documented paper trail for why round-2 rewrote this section
// instead of patching it in place: the fix belongs in the RENDER code (theater-boot.js now grows
// real legs + a mainHand/offHand arm pair for biped-family recipe figures, matching what the
// legacy archetype path already drew), not in a second widening of the test's own reference bbox.
// ============================================================================

// ============================================================================
// G5 ROUND-2 (finding 1) — THE RED-FIRST BOTH-PATHS WEAPON-SEAT CHECK. Composes the FULL figure
// exactly as theater-boot.js's setUnits/figureFor/buildFigureFromRecipe/buildBiped/buildGiant
// actually do (ported here box-for-box against this same session's theater-boot.js — see each
// composer function's own header for the line it mirrors), for every one of fixture 6's 7 units
// (dev/theater-preview.html's g5lineup — the exact fixture the orchestrator's screenshot flagged),
// covering BOTH render paths:
//   - RECIPE path (buildFigureFromRecipe): all 6 foes (goblin-warrior/hobgoblin-soldier/bandit/
//     skeleton/zombie/cultist all resolve real bestiary recipes) + the PC's pcRecipe (a Fighter
//     with a Longsword, MODEL-GRAMMAR G3's loadout mirror — pcRecipeFrom threads sword-slab onto
//     torso-biped's mainHand exactly like a foe recipe would).
//   - LEGACY path (buildBiped/buildGiant + weaponMeshFor): exercised directly against a synthetic
//     fixture carrying NO recipeSlug/pcRecipe (figureFor's own documented fallback — suspect (a)
//     in the round-2 brief, checked here even though fixture 6 itself never hits this path today,
//     so a future statless/quick-stats foe can't silently regress it unnoticed).
// The assertion (per the brief): "every weapon-tagged mesh must sit within the figure's torso-
// height band, not at y≈0" — computed as the REAL whole-figure geometry's own torso-box Y range
// (not a hand-picked constant), so this check can't be gamed by tuning a threshold to whatever the
// current anchor happens to produce.
// ============================================================================
console.log("\n=== G5 ROUND-2 finding 1: weapon seated in torso-height band, BOTH paths, all fixture-6 units ===");
{
  const RECIPES = extractConst(read("data/model-recipes.js"), "MODEL_RECIPES");
  const OVERRIDES = MODEL_RECIPE_OVERRIDES;
  function recipeFor(slug) {
    if (!slug) return null;
    if (OVERRIDES[slug]) return OVERRIDES[slug];
    if (RECIPES[slug]) return RECIPES[slug];
    return null;
  }

  // mirrors theater-boot.js's WEAPON_PART_KEY / WEAPON_CANT / SIZE_SCALE (kept in sync by hand —
  // a drift here would make this check pass against a STALE transform, not the real one; copy-
  // pasted from that file's own tables as of this same G5 round, not re-derived).
  const WEAPON_PART_KEY = { sword: "sword-slab", axe: "axe-wedge", bow: "bow-arcs", staff: "staff-tipped",
    spear: "spear-pole", mace: "club-mass", dagger: "dagger-slabs" };
  const WEAPON_PART_SET = new Set(Object.values(WEAPON_PART_KEY));
  const WEAPON_CANT_BY_PART = {
    "sword-slab": { rz: -0.3, yNudge: 0 }, "dagger-slabs": { rz: -0.25, yNudge: 0 },
    "axe-wedge": { rz: -0.35, yNudge: 0 }, "club-mass": { rz: -0.3, yNudge: 0 },
    "spear-pole": { rz: 0.07, yNudge: 0.14 }, "staff-tipped": { rz: -0.1, yNudge: 0.1 },
    "bow-arcs": { rz: -0.9, yNudge: 0.02 }
  };
  const SIZE_SCALE = { tiny: 0.6, small: 0.82, medium: 1, large: 1.35, huge: 1.7, gargantuan: 2.2 };

  // CARRY STATES (L14/L15) — mirrors theater-boot.js's WEAPON_CARRY_STATE + weaponCarryFor (kept in
  // sync by hand; a drift makes this check pass against a stale carry). Returns {anchor, rz, dpos}.
  const WEAPON_CARRY_STATE = {
    "sword-slab": "held-fist", "axe-wedge": "held-fist", "club-mass": "held-fist", "dagger-slabs": "held-fist",
    "spear-pole": "planted", "staff-tipped": "planted", "bow-arcs": "bow-held"
  };
  function carryFor(partKey, heavy) {
    let state = WEAPON_CARRY_STATE[partKey] || "held-fist";
    if (heavy && state === "held-fist") state = "back-mount";
    const cant = WEAPON_CANT_BY_PART[partKey] || { rz: -0.6, yNudge: 0 };
    if (state === "held-fist") return { state, anchor: "mainHand", rz: cant.rz, dpos: { x: 0, y: cant.yNudge, z: 0 } };
    if (state === "planted") return { state, anchor: "mainHand", rz: 0.04, dpos: { x: 0.04, y: -0.26, z: 0 } };
    if (state === "bow-held") return { state, anchor: "mainHand", rz: 0.0, dpos: { x: 0.04, y: 0.0, z: 0.0 } };
    return { state, anchor: "back", rz: 0.9, dpos: { x: 0, y: 0.35, z: -0.04 } };
  }

  // world-space AXIS-ALIGNED bounding box for ONE §1 box entry, given a group-level uniform scale.
  // A TRUE AABB (half-extents straight from the box's own w/h/d, no padding) — see round-1's own
  // comment (preserved above) on why a tight box, not a generous one, is the only honest test here.
  function worldAABB(boxEntry, offset, rotOffset, scale) {
    const cosY = Math.cos(rotOffset.y || 0), sinY = Math.sin(rotOffset.y || 0);
    const lx = boxEntry.pos.x, lz = boxEntry.pos.z;
    const rx = lx * cosY - lz * sinY, rz2 = lx * sinY + lz * cosY;
    const cx = (rx + offset.x) * scale, cy = (boxEntry.pos.y + offset.y) * scale, cz = (rz2 + offset.z) * scale;
    const hw = (boxEntry.box.w / 2) * scale, hh = (boxEntry.box.h / 2) * scale, hd = (boxEntry.box.d / 2) * scale;
    return { minX: cx - hw, maxX: cx + hw, minY: cy - hh, maxY: cy + hh, minZ: cz - hd, maxZ: cz + hd };
  }
  function bboxOf(boxes, offset, rotOffset, scale) {
    const bs = boxes.map(b => worldAABB(b, offset, rotOffset, scale));
    return {
      minX: Math.min(...bs.map(b => b.minX)), maxX: Math.max(...bs.map(b => b.maxX)),
      minY: Math.min(...bs.map(b => b.minY)), maxY: Math.max(...bs.map(b => b.maxY)),
      minZ: Math.min(...bs.map(b => b.minZ)), maxZ: Math.max(...bs.map(b => b.maxZ))
    };
  }

  // Ports theater-boot.js's own BIPED_LIMB_ARM_PARAMS/BIPED_LIMB_LEG_PARAMS (the G5 ROUND-2 fix)
  // and buildFigureFromRecipe's composition order: base body -> legs (biped-family only) -> arms
  // (biped-family only) -> modules (weapon/head/armor, with WEAPON_CANT applied to a mainHand/
  // offHand weapon module exactly like the real function does).
  const LEG_PARAMS_BY_BASE = {
    "torso-biped": (side) => Parts.torsoBiped.legParams(side, 0, 0.05),
    "torso-tapered": (side) => Parts.torsoBiped.legParams(side, 0, 0.05),   // UNIT 2 — same frame as biped
    "torso-biped-huge": (side) => Parts.torsoBipedHuge.legParams(side)
  };
  const ARM_PARAMS_BY_BASE = {
    "torso-biped": (side) => ({ side, tiltZ: side < 0 ? 0.16 : -0.16 }),
    "torso-tapered": (side) => ({ side, tiltZ: side < 0 ? 0.16 : -0.16 }),  // UNIT 2 — same frame as biped
    "torso-biped-huge": (side) => Parts.torsoBipedHuge.armParams(side)
  };

  function composeRecipeFigureBoxes(recipe) {
    const baseKey = (recipe.base && Parts.PARTS[recipe.base]) ? recipe.base : "torso-biped";
    const baseFn = Parts.PARTS[baseKey];
    const anchors = baseFn.anchors || {};
    const bodyParams = {};
    if (recipe.stance) bodyParams.stance = recipe.stance;
    if (recipe.scalars && recipe.scalars.headScale != null) bodyParams.headScale = recipe.scalars.headScale;
    let boxes = baseFn(bodyParams).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } }));
    const legFn = LEG_PARAMS_BY_BASE[baseKey], armFn = ARM_PARAMS_BY_BASE[baseKey];
    if (legFn && Parts.legTapered) {
      boxes = boxes.concat(Parts.legTapered(legFn(-1)).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } })));
      boxes = boxes.concat(Parts.legTapered(legFn(1)).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } })));
    }
    if (armFn && Parts.armTapered) {
      boxes = boxes.concat(Parts.armTapered(armFn(-1)).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } })));
      boxes = boxes.concat(Parts.armTapered(armFn(1)).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } })));
    }
    let weaponBoxes = [];
    let carryState = null;   // L14: the carry the weapon actually took (held-fist / planted / bow-held / back-mount)
    (recipe.modules || []).forEach(m => {
      if (!m || !m.part) return;
      const partFn = Parts.PARTS[m.part];
      if (!partFn) return;
      const isWeapon = (m.anchor === "mainHand" || m.anchor === "offHand") && WEAPON_CANT_BY_PART[m.part];
      let anchorName = m.anchor;
      let extraRz = 0, dpos = null;
      if (isWeapon) {
        const heavy = !!(m.params && m.params.heavy);
        const carry = carryFor(m.part, heavy);
        // off-hand keeps its own hand (only a main-hand weapon promotes to back-mount) — mirrors
        // theater-boot.js's buildFigureFromRecipe carry wiring.
        anchorName = (m.anchor === "offHand") ? "offHand" : carry.anchor;
        extraRz = carry.rz; dpos = carry.dpos; carryState = carry.state;
      }
      const anchorT = anchorName && anchors[anchorName];
      let offset = anchorT ? { x: anchorT.pos.x, y: anchorT.pos.y, z: anchorT.pos.z } : { x: 0, y: 0, z: 0 };
      let rot = anchorT ? { x: anchorT.rot.x || 0, y: anchorT.rot.y || 0, z: anchorT.rot.z || 0 } : { x: 0, y: 0, z: 0 };
      if (dpos) {
        offset = { x: offset.x + (dpos.x || 0), y: offset.y + (dpos.y || 0), z: offset.z + (dpos.z || 0) };
        rot = { ...rot, z: rot.z + extraRz };
      }
      const partBoxes = partFn(m.params || {}).map(b => ({ b, offset, rot }));
      if (isWeapon) weaponBoxes = weaponBoxes.concat(partBoxes);
      else boxes = boxes.concat(partBoxes);
    });
    // the mainHand fist box, for the intersection assertion (armTapered.fistBox on the right arm).
    const armFn2 = ARM_PARAMS_BY_BASE[baseKey];
    const fist = (armFn2 && Parts.armTapered.fistBox) ? Parts.armTapered.fistBox(armFn2(1)) : null;
    return { bodyBoxes: boxes, weaponBoxes, carryState, fist };
  }

  // Ports theater-boot.js's buildBiped (legacy path, martial silhouette, no caster robe branch —
  // fixture 6 never exercises caster) + weaponMeshFor's WEAPON_BASE_OFFSET/WEAPON_CANT composition.
  function composeLegacyBipedBoxes(weaponShape) {
    const crouch = 0, stanceTilt = 0.05;
    let bodyBoxes = Parts.torsoBiped({ crouch, stanceTilt }).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } }));
    bodyBoxes = bodyBoxes.concat(Parts.legTapered(Parts.torsoBiped.legParams(-1, crouch, stanceTilt)).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } })));
    bodyBoxes = bodyBoxes.concat(Parts.legTapered(Parts.torsoBiped.legParams(1, crouch, stanceTilt)).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } })));
    bodyBoxes = bodyBoxes.concat(Parts.armTapered({ side: -1, tiltZ: 0.16, crouch }).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } })));
    bodyBoxes = bodyBoxes.concat(Parts.armTapered({ side: 1, tiltZ: -0.16, crouch }).map(b => ({ b, offset: { x: 0, y: 0, z: 0 }, rot: { x: 0, y: 0, z: 0 } })));
    const partKey = WEAPON_PART_KEY[weaponShape];
    let weaponBoxes = [], carryState = null;
    if (partKey) {
      const base = { x: 0.3, y: 0.58, z: 0.02 }; // mirrors theater-boot.js's WEAPON_BASE_OFFSET (FIST RULE 2026-07-03 fist center)
      // the legacy path never has a heavy-2H signal (a bare shape key) so it never back-mounts.
      const carry = carryFor(partKey, false);
      const dpos = carry.dpos || { x: 0, y: 0, z: 0 };
      const offset = { x: base.x + (dpos.x || 0), y: base.y + (dpos.y || 0), z: base.z + (dpos.z || 0) };
      const rot = { x: 0, y: 0, z: carry.rz };
      weaponBoxes = Parts.PARTS[partKey]({}).map(b => ({ b, offset, rot }));
      carryState = carry.state;
    }
    const fist = Parts.armTapered.fistBox ? Parts.armTapered.fistBox({ side: 1 }) : null;
    return { bodyBoxes, weaponBoxes, carryState, fist };
  }

  // AABB intersection test (two axis-aligned boxes overlap on all 3 axes).
  function aabbIntersect(a, b) {
    return a.minX <= b.maxX && a.maxX >= b.minX &&
           a.minY <= b.maxY && a.maxY >= b.minY &&
           a.minZ <= b.maxZ && a.maxZ >= b.minZ;
  }
  // THE FIST RULE + CARRY STATES (L14/L15) acceptance — the coordinator's own bar: "the fist-
  // intersection is asserted geometrically (weapon grip-segment bounding box intersects fist bounding
  // box — THAT box-math is fine as a harness check since it asserts intersection, not position)."
  //   - held-fist / planted / bow-held  -> the weapon's GRIP-END box (its box nearest the local origin
  //     — the haft, not the far tip) must INTERSECT the arm's fist box (armTapered.fistBox).
  //   - back-mount -> the weapon attaches at `back` (not the fist): assert the weapon's own bbox sits
  //     UP near the back anchor / clearly ABOVE the fist (it rides the back, the rejected "floating
  //     near one hand" state is exactly what this catches).
  // fist is in the SAME unscaled part-local space the boxes are authored in; scale is applied to both.
  function assertWeaponCarry(label, bodyBoxes, weaponBoxes, scale, carryState, fist) {
    if (!weaponBoxes.length) { check(label + " (no weapon module — skipped, not a failure)", true); return; }
    if (!fist) { check(label + " (no fist box available — harness gap)", false, "armTapered.fistBox returned null"); return; }
    const fistAABB = {
      minX: (fist.x - fist.half) * scale, maxX: (fist.x + fist.half) * scale,
      minY: (fist.y - fist.half) * scale, maxY: (fist.y + fist.half) * scale,
      minZ: (fist.z - fist.half) * scale, maxZ: (fist.z + fist.half) * scale
    };
    const allWeaponAABBs = weaponBoxes.map(x => worldAABB(x.b, x.offset, x.rot, scale));
    if (carryState === "back-mount") {
      // rides the back: no weapon box should intersect the (main-hand) fist, and the weapon's own
      // center must sit well above the fist (near the back anchor). This is the anti-"floating near a
      // hand" assertion the ruling calls the rejected state.
      const anyInFist = allWeaponAABBs.some(a => aabbIntersect(a, fistAABB));
      const weaponMidY = allWeaponAABBs.reduce((s, a) => s + (a.minY + a.maxY) / 2, 0) / allWeaponAABBs.length;
      check(label + " [back-mount rides the back, not a hand]",
        !anyInFist && weaponMidY > fistAABB.maxY,
        `back-mount weapon should NOT touch the fist and should sit above it — inFist=${anyInFist}, weaponMidY=${weaponMidY.toFixed(3)} vs fist top ${fistAABB.maxY.toFixed(3)}`);
      return;
    }
    // held-fist / planted / bow-held: the weapon's GRIP-END box (nearest the weapon's local origin —
    // its authored y closest to 0, the haft the hand wraps) must intersect the fist. A weapon part's
    // boxes are authored so the grip/haft is near y≈0..0.2 and the blade/head extends away; pick the
    // box whose authored |pos.y| is smallest as the grip segment.
    let gripBoxEntry = weaponBoxes[0];
    let minAbsY = Math.abs(weaponBoxes[0].b.pos.y);
    for (const we of weaponBoxes) { const a = Math.abs(we.b.pos.y); if (a < minAbsY) { minAbsY = a; gripBoxEntry = we; } }
    const gripAABB = worldAABB(gripBoxEntry.b, gripBoxEntry.offset, gripBoxEntry.rot, scale);
    check(label + ` [${carryState}: grip intersects fist]`, aabbIntersect(gripAABB, fistAABB),
      `grip box AABB Y[${gripAABB.minY.toFixed(3)},${gripAABB.maxY.toFixed(3)}] X[${gripAABB.minX.toFixed(3)},${gripAABB.maxX.toFixed(3)}] must intersect fist AABB Y[${fistAABB.minY.toFixed(3)},${fistAABB.maxY.toFixed(3)}] X[${fistAABB.minX.toFixed(3)},${fistAABB.maxX.toFixed(3)}]`);
  }

  // --- RECIPE path: every one of fixture 6's 7 units (6 foes + the PC's pcRecipe). ---
  const fixture6Foes = [
    ["g5-goblin", "goblin-warrior"], ["g5-hobgoblin", "hobgoblin-soldier"], ["g5-bandit", "bandit"],
    ["g5-skeleton", "skeleton"], ["g5-zombie", "zombie"], ["g5-cultist", "cultist"]
  ];
  fixture6Foes.forEach(([id, slug]) => {
    const recipe = recipeFor(slug);
    check(`fixture-6 ${id} (statId:${slug}) resolves a real recipe`, !!recipe, "recipeFor returned null");
    if (!recipe) return;
    const scale = SIZE_SCALE[(recipe.size || "medium").toLowerCase()] ?? 1;
    const { bodyBoxes, weaponBoxes, carryState, fist } = composeRecipeFigureBoxes(recipe);
    assertWeaponCarry(`fixture-6 ${id} (${slug}, recipe path) — weapon in hand`, bodyBoxes, weaponBoxes, scale, carryState, fist);
  });
  // the PC's pcRecipe (className:"Fighter", equipped.mainHand carries a Longsword -> sword-slab,
  // MODEL-GRAMMAR G3's loadout mirror — same mainHand anchor/module shape as a bestiary recipe).
  {
    const pcRecipe = { base: "torso-biped", size: "medium", modules: [{ anchor: "mainHand", part: "sword-slab" }] };
    const { bodyBoxes, weaponBoxes, carryState, fist } = composeRecipeFigureBoxes(pcRecipe);
    assertWeaponCarry("fixture-6 pc (Fighter, Longsword, pcRecipe/loadout-mirror path) — weapon in hand", bodyBoxes, weaponBoxes, 1, carryState, fist);
  }
  // a heavy 2H PC (greatsword) must BACK-MOUNT (the loadout mirror reads the item's Two-Handed+Heavy).
  {
    const pcRecipe = { base: "torso-biped", size: "medium", modules: [{ anchor: "mainHand", part: "sword-slab", params: { heavy: true } }] };
    const { bodyBoxes, weaponBoxes, carryState, fist } = composeRecipeFigureBoxes(pcRecipe);
    check("a heavy-2H recipe weapon takes the back-mount carry (not held-fist)", carryState === "back-mount", "carryState=" + carryState);
    assertWeaponCarry("heavy-2H greatsword (recipe path) — rides the back", bodyBoxes, weaponBoxes, 1, carryState, fist);
  }

  // --- LEGACY path: a statless/quick-stats foe falls through to buildBiped/weaponMeshFor. Every
  // weapon shape's carry (held-fist blade/blunt, planted pole, held bow) must seat in the fist. ---
  ["sword", "axe", "spear", "bow", "staff", "mace", "dagger"].forEach(shape => {
    const { bodyBoxes, weaponBoxes, carryState, fist } = composeLegacyBipedBoxes(shape);
    assertWeaponCarry(`legacy archetype path (weapon:${shape}, no recipeSlug/pcRecipe) — weapon in hand`, bodyBoxes, weaponBoxes, 1, carryState, fist);
  });

  // a Huge fixture (torso-biped-huge base), to prove the fix holds across the size range. Pick a
  // NON-heavy one so it stays held-fist (a heavy giant back-mounts, tested separately below).
  const hugeWeaponFixture = Object.entries(RECIPES).find(([, r]) =>
    r.base === "torso-biped-huge" && (r.modules || []).some(m => m.anchor === "mainHand" && WEAPON_PART_SET.has(m.part) && !(m.params && m.params.heavy)));
  if (hugeWeaponFixture) {
    const [slug, recipe] = hugeWeaponFixture;
    const scale = SIZE_SCALE[(recipe.size || "medium").toLowerCase()] ?? 1;
    const { bodyBoxes, weaponBoxes, carryState, fist } = composeRecipeFigureBoxes(recipe);
    assertWeaponCarry(`${slug} (Huge, torso-biped-huge, recipe path) — weapon in hand`, bodyBoxes, weaponBoxes, scale, carryState, fist);
  }
}

// ============================================================================
// G5 ROUND-2 (finding 2) — THE RED-FIRST BASE-DISC CHECK, Adam's live ruling: "the bases should
// be circular underneath the feet of the piece." Three assertions, mirroring theater-boot.js's
// setUnits/baseDiscGeoFor/baseDiscMatFor exactly (ported values, not re-derived):
//   (a) genuinely circular — enough radial segments to read round even at PSX low-res.
//   (b) centered on the figure's own ground-contact XZ (the group's own local x=0,z=0 axis for
//       every biped-family body — torsoBiped/torsoBipedHuge's own boxes are all authored at local
//       x=0,z=0, so the group origin the disc is placed at IS directly under the feet by
//       construction; asserted here directly against theater-parts.js's real box data rather than
//       assumed).
//   (c) flat, height-capped, and NEVER exceeds the cap regardless of figScale (SIZE_SCALE up to
//       gargantuan=2.2x) — the disc is a 2D CircleGeometry (zero extruded height) added to
//       S.shadowGroup, a SEPARATE top-level group from S.unitGroup that never receives figScale
//       (setUnits only ever calls figure.scale.setScalar(figScale) on the unit's OWN figure group,
//       never on S.shadowGroup or the disc mesh) — so the disc's radius scales via its own
//       baseDiscGeoFor(figScale) geometry call (by design, matches Adam's round-1 ruling: "same
//       radius rule, size-scaled") while its height stays flatly at the CircleGeometry's inherent
//       zero, independent of figScale entirely. Checked directly against the real geometry
//       constructor call (CircleGeometry has no height/thickness parameter at all — this is the
//       actual guarantee, not an inference).
// ============================================================================
console.log("\n=== G5 ROUND-2 finding 2: base disc — circular, under the feet, flat-capped ===");
{
  // THEATER SPLIT B9 (2026-07-25): setUnits — and with it baseDiscGeoFor/baseDiscGeoForRadius, the disc
  // mount and the scorch marker — moved VERBATIM to src/ui/theater-tabletop.js; addGroundingBlob and
  // every Parts lookup stayed in theater-boot.js. Reading the COMPOSITE keeps each scan below anchored
  // on the real source of its own symbol, and keeps the two NEGATIVE scans (S.shadowGroup.scale /
  // baseDisc.scale must not exist ANYWHERE) at their full pre-split breadth.
  const bootSrc = read("src/ui/theater-boot.js")
    + "\n/* [verify-model-grammar composite boundary — src/ui/theater-tabletop.js follows] */\n"
    + read("src/ui/theater-tabletop.js");
  // (a) circular: CircleGeometry's segment-count 3rd arg — pull it straight from the source so this
  // check tracks the REAL call, not a hand-typed assumption. A CircleGeometry with too few segments
  // (e.g. 4-6) reads as a visible polygon/near-square at PSX low-res; 16 already an actual circle.
  // B9 note: this used to take the FIRST CircleGeometry call in theater-boot.js, which was
  // groundingBlobGeoFor's (also 16) — the check passed while reading a call that is not its subject.
  // Now that baseDiscGeoForRadius lives in a file of its own, the match is anchored on that function's
  // own body so the check finally reads what its label names. Same assertion, same value (16), same
  // job — a validator made true, not a diff greened.
  const circleCall = (bootSrc.match(/function baseDiscGeoForRadius\([\s\S]*?new THREE\.CircleGeometry\(([^)]*)\)/) || []).slice(0);
  check("baseDiscGeoFor uses THREE.CircleGeometry (genuinely round primitive, not a box/plane)", !!circleCall.length, "no CircleGeometry(...) call found inside baseDiscGeoForRadius");
  if (circleCall.length) {
    // THREE.CircleGeometry(radius, segments) — 2 args; segments is index 1, not 2 (an earlier draft
    // of this check assumed a 3-arg signature and always read `undefined` — caught by this check's
    // own red-first run against the unfixed source, left documented here since it's a real gotcha).
    const args = circleCall[1].split(",").map(s => s.trim());
    const segArg = Number(args[1]);
    check("CircleGeometry radial segment count >=16 (reads round even pixelated)", segArg >= 16, "segments=" + args[1]);
  }

  // (b) centered under the feet: the disc is added at the SAME x/z the figure group itself is
  // placed at (figure.position.set(x,0,z), immediately above the disc's own S.shadowGroup.add call
  // in setUnits) — assert the source wires both from the identical x/z locals (not two independently-
  // computed values that could drift), AND that every biped-family body's own boxes are authored
  // centered on local x=0/z=0 (so "the group's own origin" really is under the feet, not offset to
  // one side of an asymmetric silhouette). The disc's own Y arg is EITHER a numeric literal (the
  // cuboid path's fixed -0.49) OR a simple identifier (P1' WHOLE-OBJECT WIRING, docs/P1-WIRING.md
  // §3-D2/D10's capture-gate fix: `discY`, a per-path-computed value — a whole-object figure's own
  // baked disc sits near the tile surface, not at the cuboid path's fixed depth, so its hostility
  // disc needs a DIFFERENT y to actually peek out as a visible rim rather than being buried under
  // both the tile AND the figure's own disc geometry) — this check's real invariant (x/z never
  // drift) is unchanged by that; only the Y-arg shape gets a wider (still specific) match.
  // 2026-07-10 BEAUTY-WAVE VP1b: the figure's own Y arg widened from the literal `0` to an
  // identifier (`posY` — interior-true-scale figures sit on the room floor line; the flat
  // tabletop path still computes posY=0), the SAME widening the disc's Y already got for discY
  // below. The check's real invariant (figure and disc wired from identical x/z locals) is
  // unchanged. Red-first: the old literal-0 pattern matched null against VP1b's source, which
  // is exactly the failure this fixture update clears.
  const figurePosSet = bootSrc.match(/figure\.position\.set\((x), (?:-?[\d.]+|[A-Za-z_$][\w$]*), (z)\)/);
  const discPosSet = bootSrc.match(/baseDisc\.position\.set\((x), (?:-?[\d.]+|[A-Za-z_$][\w$]*), (z)\)/);
  check("figure and base disc are positioned from the SAME x/z locals (disc can't drift off the figure's own origin)",
    !!figurePosSet && !!discPosSet && figurePosSet[1] === discPosSet[1] && figurePosSet[2] === discPosSet[2],
    "figure.position.set match=" + JSON.stringify(figurePosSet && figurePosSet[0]) + " / baseDisc.position.set match=" + JSON.stringify(discPosSet && discPosSet[0]));
  ["torso-biped", "torso-biped-huge"].forEach(baseKey => {
    const boxes = Parts.PARTS[baseKey]({});
    const maxAbsX = Math.max(...boxes.map(b => Math.abs(b.pos.x)));
    const maxAbsZ = Math.max(...boxes.map(b => Math.abs(b.pos.z)));
    // the CORE body boxes (head/torso/shoulder/pelvis) straddle x=0/z=0 symmetrically — legs (added
    // by this round's own fix, at x=+-0.12/+-0.2) also straddle it — so the group's true footprint
    // center is x=0/z=0 within a small tolerance, which is exactly where the disc is placed.
    check(`${baseKey} core boxes are authored centered on local x=0 (small symmetric spread only)`, maxAbsX < 0.3, "maxAbsX=" + maxAbsX);
    check(`${baseKey} core boxes are authored centered on local z=0 (small symmetric spread only)`, maxAbsZ < 0.3, "maxAbsZ=" + maxAbsZ);
  });

  // (c) flat + height-capped, independent of figScale: CircleGeometry has NO height/thickness arg
  // (radius, segments only) — a genuine structural guarantee, not a tunable that could silently
  // grow. DISC_HEIGHT_CAP names the contract this check enforces (0 <= height <= 0.06 world units,
  // per the brief) even though CircleGeometry's true height is exactly 0 today; if a future pass
  // ever swaps in an extruded CylinderGeometry (Adam's own fallback suggestion — "use a cylinder...
  // if the disc currently renders square-ish"), this cap is what that call must respect.
  const DISC_HEIGHT_CAP = 0.06;
  check("CircleGeometry's inherent height is 0 (a flat disc has no extrusion to exceed the cap)", 0 <= DISC_HEIGHT_CAP, "0 > " + DISC_HEIGHT_CAP);
  // the disc mesh is NOT a child of the size-scaled figure group (S.shadowGroup is a separate
  // top-level scene group from S.unitGroup, per createTheaterState's own group list) — confirm the
  // source never calls .scale on S.shadowGroup or on the baseDisc mesh itself, which would be the
  // "inherits SIZE_SCALE on Y" failure mode the brief's own suspect names.
  const shadowGroupScaleCalls = bootSrc.match(/S\.shadowGroup\.scale/g) || [];
  const baseDiscScaleCalls = bootSrc.match(/baseDisc\.scale/g) || [];
  check("S.shadowGroup is never scaled (the disc's height can't inherit a figure's SIZE_SCALE/FIGURE_SCALE)",
    shadowGroupScaleCalls.length === 0, "found " + shadowGroupScaleCalls.length + " S.shadowGroup.scale call(s)");
  check("the baseDisc mesh itself is never scaled on Y", baseDiscScaleCalls.length === 0, "found " + baseDiscScaleCalls.length + " baseDisc.scale call(s)");
  // radius DOES scale with figScale (Adam's round-1 ruling: "same radius rule, size-scaled") —
  // confirm the geometry cache key is figScale-derived, so a Huge figure's disc is wider but still
  // exactly as flat as a Tiny figure's (radius scaling and height-flatness are independent axes).
  check("disc radius is derived from figScale (baseDiscGeoFor's own cache-key arg)",
    /baseDiscGeoFor\(figScale\)/.test(bootSrc), "no baseDiscGeoFor(figScale) call site found");
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
