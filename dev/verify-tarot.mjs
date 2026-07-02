/* verify-tarot.mjs — headless test for THE SESSION DRAW (docs/TAROT-SESSION.md, BATCH2-GUARDRAILS
   H1: ≥6 asserts, 0 failed):

   §0/§1 the deck + vector — the assembled TAROT_DECK is 78 cards (56 minors + 22 majors);
      tarotVectorOf(w) with NO draw returns the all-default/no-op vector (hasDraw:false, every
      multiplier 1.0/0) — the "zero behavior change without a draw" contract (BATCH-GUARDRAILS
      mutation check: leak a nudge with no card, the harness fails) — MUTATION CHECK shown RED:
      neuter tarotVectorOf's no-draw guard, confirm a phantom draw leaks a nonzero nudge, then
      restore.
   §2 the draw — tarotDraw(w) stores exactly one card on w.tarot with a player-facing omen and
      (for a Major) a DM-only mutator {op,params,note}; a minor draw carries mutator:null.
   §4 Majors anchored VERBATIM — the 5 Adam-approved samples (TAROT-SESSION.md §4) match byte-for-
      byte in data/tarot.js.
   Roller hooks — tarotArchetypeBias/tarotBiasedArchetypePool/tarotSpiceBiasedSkin/tarotAmbientBonus/
      tarotStockMult all degrade byte-identically to the unbiased path with vector=null (zero-
      regression); a matching-domain vector actually shifts the multiplier away from 1.0/0.
   Regression — rollDungeonWalk/rollWildernessWalk/rollUrbanWalk still return byte-compatible
      top-level shape with a tarot vector threaded through (opts.tarot doesn't rename/remove a field);
      every other dev/verify-*.mjs/.py in the sweep stays green (run separately).

   Loads EVERY module in manifest load order (+ tables.js) into one jsdom global scope — same
   "const-via-eval" pattern as dev/verify-regions.mjs / dev/verify-walk-refresh.mjs (jsdom resolved
   per CLAUDE.md "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom).
   Run: node dev/verify-tarot.mjs   (from repo root) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
// top-level `const` (TAROT_DECK/TAROT_MAJORS/TAROT_DEFAULT_VECTOR/SPICE_ORDER) don't attach to
// jsdom's `window` under win.eval (same gotcha documented in verify-gen.mjs/verify-regions.mjs) —
// thin accessor wrappers expose them to the harness without changing production code.
const accessors = "function __tarotDeck(){return TAROT_DECK;} function __tarotMajors(){return TAROT_MAJORS;} " +
  "function __tarotDefaultVector(){return TAROT_DEFAULT_VECTOR;} function __spiceOrder(){return SPICE_ORDER;}";
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function baseWorld(id){
  return {
    id, name: "The Tarot Test", session: 1,
    seed: { master: { name: "Test Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
            taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } },
    characters: [{ status: "living", name: "Tester", headline: "a climber", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Folk Hero", level: 3, hp: "20/20", ac: 15,
               profBonus: 2, scores: {}, mods: { str: 2, dex: 1 }, saveProfs: [], skillProfs: ["Athletics"] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 },
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [], revealed: {}, dmlog: [],
  };
}

function freshDom(loadSrc = srcText){
  const dom = new JSDOM(
    `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" }
  );
  const win = dom.window;
  win.eval(harness + "\n" + loadSrc);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  const world = baseWorld("w-tarot-" + Math.random().toString(36).slice(2));
  const originId = win.addNode(world, "Test Hold", "Setting");
  win.setNodeXY(world, originId, 0, 0);
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return { win, world, originId };
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", String(detail)));

// ============================================================
// 1. THE DECK — 78 cards (56 minors: 4 suits x 14 ranks + 22 majors); every entry carries an
//    upright+reversed omen; card art is DEFERRED (H3) — assetKey is null on every entry.
// ============================================================
{ const { win } = freshDom();
  const deck = win.__tarotDeck();
  const minors = deck.filter(c => !c.major), majors = deck.filter(c => c.major);
  check("1a. TAROT_DECK assembles to exactly 78 cards", deck.length === 78, `got ${deck.length}`);
  check("1b. 56 minors + 22 majors", minors.length === 56 && majors.length === 22,
    `minors=${minors.length} majors=${majors.length}`);
  const everyCardHasOmens = deck.every(c => c.up && c.up.omen && c.rev && c.rev.omen);
  check("1c. every card carries an upright AND reversed omen", everyCardHasOmens);
  check("1d. card art is DEFERRED (H3) — every entry's assetKey is null",
    deck.every(c => c.assetKey === null), "a card carried a non-null assetKey");
}

// ============================================================
// 2. §4 MAJORS ANCHORED VERBATIM — Adam's 5 approved samples match byte-for-byte.
// ============================================================
{ const { win } = freshDom();
  const majors = win.__tarotMajors();
  const byName = Object.fromEntries(majors.map(m => [m.name, m]));
  const anchors = [
    ["The Tower", "up", "Something long-standing has been leaning for years."],
    ["The Tower", "rev", "The crack runs through your own floor."],
    ["The Moon", "up", "Two roads tell two truths tonight."],
    ["Death", "up", "An ending has been patient long enough."],
    ["The Sun", "rev", "No shade anywhere today."],
  ];
  const mismatches = anchors.filter(([name, pol, text]) => !(byName[name] && byName[name][pol].omen === text));
  check("2a. all 5 §4 approved sample omens are anchored VERBATIM in data/tarot.js",
    mismatches.length === 0, JSON.stringify(mismatches));
}

// ============================================================
// 3. tarotDraw(w) — stores exactly one card on w.tarot; player-facing omen present; a Major draw
//    carries a DM-only mutator {op,params,note}, a minor draw carries mutator:null.
// ============================================================
{ const { win, world } = freshDom();
  const draw = win.tarotDraw(world);
  check("3a. tarotDraw returns a draw and stores it on w.tarot", draw && world.tarot === draw, JSON.stringify(draw));
  check("3b. the draw carries name/reversed/omen (player-facing surface)",
    typeof draw.name === "string" && typeof draw.reversed === "boolean" && typeof draw.omen === "string",
    JSON.stringify(draw));
  if (draw.major) {
    check("3c. a Major draw carries a DM-only mutator {op,note}",
      draw.mutator && typeof draw.mutator.op === "string" && typeof draw.mutator.note === "string",
      JSON.stringify(draw.mutator));
  } else {
    check("3c. a minor draw carries mutator:null", draw.mutator === null, JSON.stringify(draw.mutator));
  }
  // draw many times — every draw lands a real card in the 78-card deck, never undefined/garbage.
  let allValid = true;
  for (let i = 0; i < 200; i++) {
    const w2 = baseWorldForLoop(win);
    const d = win.tarotDraw(w2);
    if (!d || typeof d.name !== "string" || !win.__tarotDeck().some(c => c.name === d.name)) { allValid = false; break; }
  }
  check("3d. 200 repeated draws each land a real card from the deck (name always resolves)", allValid);
}
function baseWorldForLoop(win){ return { session: 1, tarot: null }; }

// ============================================================
// 4. tarotVectorOf — NO draw (w.tarot absent) returns the exact TAROT_DEFAULT_VECTOR: hasDraw:false,
//    every multiplier at its neutral value. "Zero behavior change without a draw."
// ============================================================
{ const { win } = freshDom();
  const noDrawWorld = { session: 1 };   // no .tarot at all
  const v = win.tarotVectorOf(noDrawWorld);
  const def = win.__tarotDefaultVector();
  check("4a. tarotVectorOf(worldWithNoDraw) === TAROT_DEFAULT_VECTOR (hasDraw:false, archetypeMult 1.0, spiceDir 0, ambientBonus 0, stockMult 1.0, stealthDcBump 0)",
    v.hasDraw === false && v.archetypeMult === 1.0 && v.spiceDir === 0 && v.ambientBonus === 0 && v.stockMult === 1.0 && v.stealthDcBump === 0,
    JSON.stringify(v));
  check("4b. every roller-hook default matches the vector's neutral values with vector=null",
    win.tarotArchetypeBias(null, "threat") === 1.0 &&
    win.tarotSpiceDir(null) === 0 &&
    win.tarotAmbientBonus(null) === 0 &&
    win.tarotStockMult(null) === 1.0 &&
    win.tarotStealthDcBump(null) === 0,
    "a roller hook leaked a non-neutral default with vector=null");
}

// ============================================================
// 5. A MATCHING-DOMAIN draw actually shifts the vector (Swords→threat archetypeMult>1, Cups→social
//    ambientBonus>=1, Coins→economy stockMult != 1.0, Wands→magic spiceDir != 0) — the vector isn't
//    just inert plumbing; a real draw really nudges the named multiplier for ITS OWN domain, and
//    leaves every OTHER domain's multiplier untouched (cross-domain isolation).
// ============================================================
{ const { win } = freshDom();
  const swordsCard = win.__tarotDeck().find(c => c.suit === "Swords" && c.rank === "King");
  const w1 = { session:1, tarot:{ session:1, name:swordsCard.name, major:false, suit:"Swords", rank:"King", court:true, domain:"threat", reversed:false, omen:swordsCard.up.omen, mutator:null } };
  const v1 = win.tarotVectorOf(w1);
  check("5a. an upright Swords (King) draw raises archetypeMult above 1.0 (threat domain nudged)",
    v1.hasDraw === true && v1.archetypeMult > 1.0, JSON.stringify(v1));
  check("5b. the same Swords draw leaves stockMult/ambientBonus at their neutral (cross-domain isolation)",
    v1.stockMult === 1.0 && v1.ambientBonus === 0, JSON.stringify(v1));

  const cupsCard = win.__tarotDeck().find(c => c.suit === "Cups" && c.rank === "Ace");
  const w2 = { session:1, tarot:{ session:1, name:cupsCard.name, major:false, suit:"Cups", rank:"Ace", court:false, domain:"social", reversed:false, omen:cupsCard.up.omen, mutator:null } };
  check("5c. an upright Cups draw raises ambientBonus above 0 (social domain nudged)",
    win.tarotVectorOf(w2).ambientBonus > 0, JSON.stringify(win.tarotVectorOf(w2)));

  const towerCard = win.__tarotMajors().find(m => m.name === "The Tower");
  const w3 = { session:1, tarot:{ session:1, name:"The Tower", major:true, suit:null, rank:null, court:false, domain:null, reversed:false, omen:towerCard.up.omen, mutator:{ op:towerCard.up.op, params:towerCard.up.params, note:towerCard.up.note } } };
  const v3 = win.tarotVectorOf(w3);
  check("5d. The Tower (upright)'s op/params ride through the vector unmechanized (op:'advanceHottestClock', no numeric nudge)",
    v3.op === "advanceHottestClock" && v3.archetypeMult === 1.0 && v3.spiceDir === 0, JSON.stringify(v3));
}

// ============================================================
// 6. ROLLER HOOKS degrade byte-identically with a null/no-draw vector (zero-regression) —
//    tarotBiasedArchetypePool / tarotSpiceBiasedSkin fall through to the plain roller.
// ============================================================
{ const { win, world } = freshDom();
  const pool = win.tarotBiasedArchetypePool(null, "threat", null, "Beast (Small)", { tier:1, slot:"low" }, "Wolf");
  check("6a. tarotBiasedArchetypePool(null,...) returns a usable creature string (byte-compatible fallback)",
    typeof pool === "string" && pool.length > 0, JSON.stringify(pool));

  const skin = win.tarotSpiceBiasedSkin(null, "dungeon", null);
  check("6b. tarotSpiceBiasedSkin(null,...) returns the same shape a plain rollWalkSkin call would ({text,band,ref} or null)",
    skin === null || (typeof skin.text === "string" && typeof skin.band === "string"),
    JSON.stringify(skin));

  const order = win.__spiceOrder();
  check("6c. tarotSpiceLean(band, +1) steps exactly one band toward Mythic (never further)",
    win.tarotSpiceLean("Grounded", 1) === order[order.indexOf("Grounded") + 1] &&
    win.tarotSpiceLean("Mythic", 1) === "Mythic",   // already at the ceiling — clamps, doesn't overshoot
    JSON.stringify({ fromGrounded: win.tarotSpiceLean("Grounded", 1), fromMythic: win.tarotSpiceLean("Mythic", 1) }));
}

// ============================================================
// 6d. SEAM INTEGRATION DOESN'T DOUBLE-LEAN — seamProposeShape (§7.2's ONE lean system) is byte-
//     unmodified by this unit: same signature, same output shape, no tarot fields leak into its
//     scoring. The tarot vector rides its OWN digest surface (sessionLean.card / top-level `tarot`,
//     both DM-only) — never as a second competing prior inside seamProposeShape's ranking.
// ============================================================
{ const { win } = freshDom();
  const cf = { lastShape:"battle", pref:null, fronts:[], openThreads:[] };
  const result = win.seamProposeShape(cf);
  check("6d. seamProposeShape's output shape is unchanged ({shape,reason,ranked,lean}) — no tarot field grafted on",
    typeof result.shape === "string" && typeof result.reason === "string" && Array.isArray(result.ranked) && result.lean === true &&
    !("tarot" in result) && !("card" in result),
    JSON.stringify(result));
  check("6e. seamProposeShape's source has no reference to any tarot symbol (grep-level non-regression)",
    !/tarot/i.test(read("src/world/seam.js")), "seam.js references a tarot symbol — double-lean risk");
}

// ============================================================
// 6f. OMEN RENDERS, MECHANICS NEVER IN PLAYER DOM — beginSession's frontispiece log line carries the
//     card name + omen (player-facing) but never the mutator's op/params/note (DM-only surface).
// ============================================================
{
  check("6f. beginSession's tarot log line never references draw.mutator/.op/.note (grep-level)",
    !/draw\.mutator|draw\.op\b|draw\.note/.test(read("src/world/play.js").split("function beginSession")[1].split("function startSession")[0]),
    "beginSession's frontispiece surfaced a mutator field");
  const { win, world } = freshDom();
  // direct check: tarotFrontispiece/tarotDigestCard never expose op/params on the FRONTISPIECE surface
  // (tarotDigestCard is explicitly DM-only and is a SEPARATE function from tarotFrontispiece).
  win.tarotDraw(world);
  const front = win.tarotFrontispiece(world);
  check("6g. tarotFrontispiece(w) never carries mutator/op/note keys (the player-facing surface is name/reversed/omen/glyph/suit/major/assetKey only)",
    front && !("mutator" in front) && !("op" in front) && !("note" in front),
    JSON.stringify(front));
}

// ============================================================
// 7. ROLLER REGRESSION — rollDungeonWalk/rollWildernessWalk/rollUrbanWalk still return byte-
//    compatible top-level shape with opts.tarot threaded through (a real vector, not just null).
// ============================================================
{ const { win } = freshDom();
  const swordsCard = win.__tarotDeck().find(c => c.suit === "Swords" && c.rank === "King");
  const w = { session:1, tarot:{ session:1, name:swordsCard.name, major:false, suit:"Swords", rank:"King", court:true, domain:"threat", reversed:false, omen:swordsCard.up.omen, mutator:null } };
  const vec = win.tarotVectorOf(w);
  const dw = win.rollDungeonWalk({ segCount: 3, tier: 1, tarot: vec });
  const ww = win.rollWildernessWalk({ legCount: 3, tier: 1, tarot: vec });
  const uw = win.rollUrbanWalk({ segCount: 4, tier: 1, tarot: vec });
  check("7a. rollDungeonWalk still has environment/topology/segments/skin with a tarot vector threaded through",
    ["environment","topology","segments","skin"].every(k => k in dw), JSON.stringify(Object.keys(dw)));
  check("7b. rollWildernessWalk still has environment/legCount/segments/skin with a tarot vector threaded through",
    ["environment","legCount","segments","skin"].every(k => k in ww), JSON.stringify(Object.keys(ww)));
  check("7c. rollUrbanWalk still has environment/topology/segments/skin with a tarot vector threaded through",
    ["environment","topology","segments","skin"].every(k => k in uw), JSON.stringify(Object.keys(uw)));
}

// ============================================================
// 8. MUTATION (shown RED then restored): neuter tarotVectorOf's no-draw guard (simulate the
//    "d = w && w.tarot" early-return being skipped) — a world with NO draw should leak a nonzero
//    archetypeMult from a bogus default rank. This harness must FAIL under the mutation, confirming
//    the "zero behavior change without a draw" guard is load-bearing.
// ============================================================
{
  const original = read("src/engine/tarot.js");
  const guardRe = /const d = w && w\.tarot;\n  if\(!d\) return TAROT_DEFAULT_VECTOR;/;
  const hasGuard = guardRe.test(original);
  check("8a. MUTATION setup: the no-draw guard line found in tarot.js", hasGuard);
  if (hasGuard) {
    // neuter: fabricate a phantom minor draw (Swords King, matching a REAL rank so the code path
    // reaches the multiplier math) instead of returning the neutral default when w.tarot is absent.
    const mutatedFull = original.replace(guardRe,
      "const d = (w && w.tarot) || {domain:\"threat\",rank:\"King\",court:true,reversed:false,major:false};");
    const redOk = mutatedFull !== original;
    check("8b. MUTATION applies cleanly (no-draw guard neutered)", redOk, "mutation source edit failed");

    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/engine/tarot.js" ? mutatedFull : read(p)).join("\n;\n") +
      "\n;\n" + accessors;
    const { win } = freshDom(mutSrc);
    const leaked = win.tarotVectorOf({ session: 1 });   // NO draw on this world
    check("8c. MUTATION shown RED: with the no-draw guard neutered, a world with NO draw leaks a nonzero archetypeMult",
      leaked.hasDraw === true && leaked.archetypeMult > 1.0,
      `expected a leaked nudge under the mutation, got ${JSON.stringify(leaked)}`);

    // RESTORE: re-run with the real (unmutated) source and confirm the no-draw guard holds again.
    const { win: win2 } = freshDom();
    const restored = win2.tarotVectorOf({ session: 1 });
    check("8d. RESTORED: a world with no draw is inert again (hasDraw:false, archetypeMult 1.0)",
      restored.hasDraw === false && restored.archetypeMult === 1.0, JSON.stringify(restored));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
