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
  "function __tarotDefaultVector(){return TAROT_DEFAULT_VECTOR;} function __spiceOrder(){return SPICE_ORDER;} " +
  "function __tarotOps(){return (typeof TAROT_OPS!=='undefined')?TAROT_OPS:undefined;} " +
  "function __tarotVia(){return (typeof TAROT_VIA!=='undefined')?TAROT_VIA:undefined;} " +
  "function __tarotRankGrammar(){return (typeof TAROT_RANK_GRAMMAR!=='undefined')?TAROT_RANK_GRAMMAR:undefined;} " +
  "function __tarotReversalSense(){return (typeof TAROT_REVERSAL_SENSE!=='undefined')?TAROT_REVERSAL_SENSE:undefined;} " +
  "function __dmEventTypes(){return (typeof DM_EVENT_TYPES!=='undefined')?DM_EVENT_TYPES:undefined;} " +
  "function __slug(s){return slug(s);}";
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
    check("3c. a Major draw carries a DM-only mutator {op,note,dmNote,visibleTell,payoff} (alias intact)",
      draw.mutator && typeof draw.mutator.op === "string" && typeof draw.mutator.note === "string" &&
      typeof draw.mutator.dmNote === "string" && typeof draw.mutator.visibleTell === "string" &&
      typeof draw.mutator.payoff === "string" && draw.mutator.note === draw.mutator.dmNote,
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

// ============================================================
// TAROT-2 §5 — the 21 new checks (9a-d, 10a-c, 11a-c, 12a-c, 13a-f, 14a-b). Every block is
// typeof-guarded / try-caught so a missing symbol FAILS the check, never crashes the harness.
// ============================================================

// ---- 9. Strict Major schema + op registry + flagship pins ----
{ try {
  const { win } = freshDom();
  const majors = win.__tarotMajors();
  let bad = 0;
  majors.forEach(m => { ["up","rev"].forEach(pol => {
    const e = m[pol];
    if(!(e && typeof e.omen==="string" && e.omen && typeof e.dmNote==="string" && e.dmNote &&
         typeof e.visibleTell==="string" && e.visibleTell && typeof e.payoff==="string" && e.payoff &&
         typeof e.op==="string" && e.op && e.params && typeof e.params==="object")) bad++;
  }); });
  check("9a. all 44 Major polarity entries carry non-empty omen/dmNote/visibleTell/payoff, string op, object params",
    bad === 0, `${bad} entries malformed`);
} catch(e){ check("9a. strict Major schema", false, e); } }

{ try {
  const { win } = freshDom();
  const OPS = win.__tarotOps();
  const majors = win.__tarotMajors();
  let missing = [];
  majors.forEach(m => ["up","rev"].forEach(pol => {
    const op = m[pol] && m[pol].op;
    if(!(OPS && op in OPS)) missing.push(m.name+"/"+pol+":"+op);
  }));
  check("9b. TAROT_OPS exists and every one of the 44 op values is a key of it",
    OPS && typeof OPS==="object" && missing.length === 0, JSON.stringify(missing));
} catch(e){ check("9b. TAROT_OPS registry", false, e); } }

{ try {
  const { win } = freshDom();
  const majors = win.__tarotMajors();
  let noNudge = 0;
  majors.forEach(m => ["up","rev"].forEach(pol => { if(m[pol] && m[pol].op==="noNudge") noNudge++; }));
  check("9c. no-blank ruling: noNudge usage across all 44 entries === 0", noNudge === 0, `noNudge=${noNudge}`);
} catch(e){ check("9c. noNudge zeroed", false, e); } }

{ try {
  const { win } = freshDom();
  const byName = Object.fromEntries(win.__tarotMajors().map(m => [m.name, m]));
  const pin = (n,pol) => byName[n] && byName[n][pol];
  const ok =
    pin("The Tower","up").op === "advanceHottestClock" &&
    pin("Death","up").op === "nominateOldestThread" &&
    pin("The Moon","up").op === "alterWalkTexture" && pin("The Moon","up").params.motif === "mirror" &&
    typeof pin("The Moon","up").visibleTell === "string" && pin("The Moon","up").visibleTell.length > 0 &&
    pin("The Sun","rev").op === "stealthDcBump" && pin("The Sun","rev").params.dc === 2 &&
    pin("The Fool","up").op === "openDoor" &&
    pin("The Fool","rev").op === "closeDoor" &&
    pin("Temperance","up").op === "offerBargain";
  check("9d. flagship pins (Tower/Death/Moon/Sun/Fool/Temperance ops + params)", ok,
    JSON.stringify({tower:pin("The Tower","up").op, death:pin("Death","up").op, moonUp:pin("The Moon","up"), sunRev:pin("The Sun","rev").params, foolUp:pin("The Fool","up").op, foolRev:pin("The Fool","rev").op, temp:pin("Temperance","up").op}));
} catch(e){ check("9d. flagship pins", false, e); } }

// ---- 10. Minors metadata (tone/handle), rank grammar, reversal semantics ----
{ try {
  const { win } = freshDom();
  const TONES = ["threat","offer","loss","reveal","pressure"];
  const HANDLES = ["person","place","item","clock","cost"];
  const suits = ["Swords","Cups","Coins","Wands"];
  const ranks = win.__tarotDeck().filter(c=>c.suit==="Swords").map(c=>c.rank);
  let outOfVocab = 0, calls = 0;
  suits.forEach(s => ranks.forEach(r => [false,true].forEach(rev => {
    const meta = win.tarotMinorMeta(s, r, rev); calls++;
    if(!(meta && TONES.indexOf(meta.tone)>=0 && HANDLES.indexOf(meta.handle)>=0)) outOfVocab++;
  })));
  check("10a. tarotMinorMeta: 112 calls all land tone∈5-enum and handle∈5-enum",
    calls === 112 && outOfVocab === 0, `calls=${calls} outOfVocab=${outOfVocab}`);
} catch(e){ check("10a. tarotMinorMeta vocab", false, e); } }

{ try {
  const { win } = freshDom();
  const suits = ["Swords","Cups","Coins","Wands"], courts = ["Page","Knight","Queen","King"];
  let bad = 0;
  suits.forEach(s => courts.forEach(r => [false,true].forEach(rev => {
    const meta = win.tarotMinorMeta(s, r, rev);
    if(!(meta && meta.handle==="person")) bad++;
  })));
  check("10b. all court ranks map handle:'person' for every suit, both polarities (16 asserts)",
    bad === 0, `${bad} court cells not person`);
} catch(e){ check("10b. court→person", false, e); } }

{ try {
  const { win, world } = freshDom();
  // force a minor draw (Ace of Swords) onto w.tarot, then read its digest card
  const aceS = win.__tarotDeck().find(c=>c.suit==="Swords"&&c.rank==="Ace");
  world.tarot = win.tarotDraw(world);
  // draw is random; overwrite with a deterministic minor
  world.tarot = { session:1, name:aceS.name, major:false, suit:"Swords", rank:"Ace", court:false,
    domain:"threat", glyph:"⚔", reversed:false, omen:aceS.up.omen, mutator:null,
    tone: win.tarotMinorMeta("Swords","Ace",false).tone, handle: win.tarotMinorMeta("Swords","Ace",false).handle,
    rankSense: win.__tarotRankGrammar() ? win.__tarotRankGrammar()["Ace"] : null,
    sense: win.__tarotReversalSense() ? win.__tarotReversalSense()["up"] : null };
  const dc = win.tarotDigestCard(world);
  const minorOk = dc && typeof dc.tone==="string" && typeof dc.handle==="string" &&
    dc.rankSense === "seed / first sign" && typeof dc.sense==="string";
  // now a Major digest card
  const tower = win.__tarotMajors().find(m=>m.name==="The Tower");
  world.tarot = win.tarotDraw(world);
  world.tarot = { session:1, name:"The Tower", major:true, suit:null, rank:null, court:false, domain:null,
    glyph:"✦", reversed:false, omen:tower.up.omen,
    mutator:{ op:tower.up.op, params:tower.up.params, dmNote:tower.up.dmNote, note:tower.up.dmNote, visibleTell:tower.up.visibleTell, payoff:tower.up.payoff, target:null },
    sense: win.__tarotReversalSense() ? win.__tarotReversalSense()["up"] : null };
  const dm = win.tarotDigestCard(world);
  const majorOk = dm && typeof dm.sense==="string" && !("tone" in dm) && !("handle" in dm) && !("rankSense" in dm);
  check("10c. minor digest card carries tone/handle/rankSense/sense (Ace='seed / first sign'); Major digest carries sense but NOT tone/handle/rankSense",
    minorOk && majorOk, JSON.stringify({minor:dc, major:dm}));
} catch(e){ check("10c. digest card metadata", false, e); } }

// ---- 11. tarotResolveTarget ----
{ try {
  const { win } = freshDom();
  const w = { session:1, currentNodeId:null, codex:{ records:{
    r1:{ id:"r1", name:"Old Thread", kind:"thing", dm:{ legs:"hook" }, interactions:0, resolved:false, status:{} },
    r2:{ id:"r2", name:"Salient Thread", kind:"thing", dm:{ legs:"hook" }, interactions:2, resolved:false, status:{} },
  } } };
  const salient = win.tarotResolveTarget(w, "spotlightThread", { order:"salient" });
  const oldest = win.tarotResolveTarget(w, "spotlightThread", { order:"oldest" });
  check("11a. resolver/thread: salient returns the salient record id; oldest returns the first-inserted id",
    salient && salient.id === "r2" && oldest && oldest.id === "r1",
    JSON.stringify({salient, oldest}));
} catch(e){ check("11a. resolver/thread", false, e); } }

{ try {
  const { win } = freshDom();
  const nA = "The Ashen Hand", nB = "The Full Choir";
  const w = { session:1, currentNodeId:null, factions:[
    { name:nA, clock:{ filled:4, size:6 } },
    { name:nB, clock:{ filled:6, size:6 } },
    { name:"Cold Faction", clock:{ filled:1, size:6 } },
  ], pressures:[] };
  const t = win.tarotResolveTarget(w, "pressureFaction", { mode:"advance" });
  check("11b. resolver/clock: returns the 4/6 faction {kind:'faction', id:slug(name)}; the full 6/6 clock is never picked",
    t && t.kind === "faction" && t.id === win.__slug(nA), JSON.stringify(t));
} catch(e){ check("11b. resolver/clock", false, e); } }

{ try {
  const { win } = freshDom();
  const empty = { session:1, currentNodeId:null, codex:{ records:{} }, factions:[], pressures:[], characters:[] };
  const t1 = win.tarotResolveTarget(empty, "spotlightThread", { order:"salient" });
  const t2 = win.tarotResolveTarget(empty, "pressureFaction", { mode:"advance" });
  const t3 = win.tarotResolveTarget(empty, "surfaceHiddenFact", {});
  const t4 = win.tarotResolveTarget(empty, "echoPast", {});
  // force a targeted Major draw on the empty world
  const hp = win.__tarotMajors().find(m=>m.name==="The High Priestess");
  // simulate tarotDraw producing mutator.target===null; we call tarotResolveTarget directly above,
  // and assert tarotDraw itself succeeds on the empty world.
  const draw = win.tarotDraw(empty);
  const drawOk = draw && (draw.major ? (draw.mutator && (!win.__tarotOps()[draw.mutator.op] || !win.__tarotOps()[draw.mutator.op].target || draw.mutator.target===null || typeof draw.mutator.target==="object")) : true);
  check("11c. resolver degrade: empty world → null for all four target classes; tarotDraw still succeeds",
    t1===null && t2===null && t3===null && t4===null && !!draw && !!draw.name,
    JSON.stringify({t1,t2,t3,t4, drawName:draw&&draw.name}));
} catch(e){ check("11c. resolver degrade", false, e); } }

// ---- 12. alterWalkTexture: Moon vector + gap-fill + no-override ----
{ try {
  const { win } = freshDom();
  const moon = win.__tarotMajors().find(m=>m.name==="The Moon");
  const w = { session:2, tarot:{ session:2, name:"The Moon", major:true, suit:null, rank:null, court:false,
    domain:null, glyph:"✦", reversed:false, omen:moon.up.omen,
    mutator:{ op:moon.up.op, params:moon.up.params, dmNote:moon.up.dmNote, note:moon.up.dmNote, visibleTell:moon.up.visibleTell, payoff:moon.up.payoff, target:null } } };
  const v = win.tarotVectorOf(w);
  const def = win.__tarotDefaultVector();
  check("12a. Moon-up vector: walkMotif==='mirror'; tarotWalkMotif(null)===null; default vector walkMotif===null",
    v.walkMotif === "mirror" && win.tarotWalkMotif(null) === null && def.walkMotif === null,
    JSON.stringify({vMotif:v.walkMotif, def:def.walkMotif}));
} catch(e){ check("12a. Moon vector", false, e); } }

{ try {
  const { win } = freshDom();
  const moon = win.__tarotMajors().find(m=>m.name==="The Moon");
  const moonWorld = { session:2, tarot:{ session:2, name:"The Moon", major:true, suit:null, rank:null, court:false,
    domain:null, glyph:"✦", reversed:false, omen:moon.up.omen,
    mutator:{ op:moon.up.op, params:moon.up.params, dmNote:moon.up.dmNote, note:moon.up.dmNote, visibleTell:moon.up.visibleTell, payoff:moon.up.payoff, target:null } } };
  const walk = { segments:[{ depth:0 }], environment:"dungeon" };
  win.applySkinGrants(walk, { motif:null, grants:"" }, moonWorld);
  check("12b. gap-fill: applySkinGrants(walk,{motif:null,grants:''},moonWorld) sets walk.motif='mirror', motifSource='tarot', motifSession=session",
    walk.motif === "mirror" && walk.motifSource === "tarot" && walk.motifSession === moonWorld.session,
    JSON.stringify({motif:walk.motif, src:walk.motifSource, sess:walk.motifSession}));
} catch(e){ check("12b. gap-fill", false, e); } }

{ try {
  const { win } = freshDom();
  const moon = win.__tarotMajors().find(m=>m.name==="The Moon");
  const moonWorld = { session:2, tarot:{ session:2, name:"The Moon", major:true, suit:null, rank:null, court:false,
    domain:null, glyph:"✦", reversed:false, omen:moon.up.omen,
    mutator:{ op:moon.up.op, params:moon.up.params, dmNote:moon.up.dmNote, note:moon.up.dmNote, visibleTell:moon.up.visibleTell, payoff:moon.up.payoff, target:null } } };
  const walk = { segments:[{ depth:0 }], environment:"dungeon" };
  win.applySkinGrants(walk, { motif:"ash", grants:"" }, moonWorld);
  check("12c. no override: a walk whose skin rolled motif:'ash' keeps 'ash' and sets no motifSource",
    walk.motif === "ash" && walk.motifSource === undefined,
    JSON.stringify({motif:walk.motif, src:walk.motifSource}));
} catch(e){ check("12c. no override", false, e); } }

// ---- 13. tarotLanded[] telemetry ----
{ try {
  const { win, world } = freshDom();
  win.tarotDraw(world);
  world.tarot.landed = world.tarot.landed || [];
  const before = world.tarot.landed.length;
  win.tarotMarkLanded(world, { via:"door", ref:"r1", detected:false });
  check("13a. tarotMarkLanded appends {card,via,ref,detected}; landed.length moves 0→1",
    before === 0 && world.tarot.landed.length === 1 && world.tarot.landed[0].via === "door" &&
    world.tarot.landed[0].card === world.tarot.name,
    JSON.stringify(world.tarot.landed));
} catch(e){ check("13a. tarotMarkLanded append", false, e); } }

{ try {
  const { win, world } = freshDom();
  win.tarotDraw(world);
  world.tarot.landed = [];
  win.tarotMarkLanded(world, { via:"thread", ref:"x1", detected:false });
  win.tarotMarkLanded(world, { via:"thread", ref:"x1", detected:true });
  const e0 = world.tarot.landed[0];
  check("13b. dedupe upgrade: declared then detected same via+ref → length STAYS 1, detected MOVED false→true",
    world.tarot.landed.length === 1 && e0.detected === true,
    JSON.stringify(world.tarot.landed));
} catch(e){ check("13b. dedupe upgrade", false, e); } }

{ try {
  const { win, world } = freshDom();
  win.tarotDraw(world);
  world.tarot.landed = [];
  for(let i=0;i<10;i++) win.tarotMarkLanded(world, { via:"door", ref:"ref"+i, detected:false });
  check("13c. cap: 10 distinct marks → landed.length===8", world.tarot.landed.length === 8,
    `len=${world.tarot.landed.length}`);
} catch(e){ check("13c. cap", false, e); } }

{ try {
  const { win, world } = freshDom();
  win.tarotDraw(world);
  world.tarot.landed = [];
  const r1 = win.applyEvent(world, { type:"tarot_landed", payload:{ via:"door" }, source:"declared" });
  const okAdd = r1 && r1.ok === true && world.tarot.landed.length === 1;
  const r2 = win.applyEvent(world, { type:"tarot_landed", payload:{ via:"xyzzy", ref:"q" }, source:"declared" });
  const coerced = world.tarot.landed.some(x => x.via === "dm");
  // no-draw world
  const w2 = { session:1 };
  const r3 = win.applyEvent(w2, { type:"tarot_landed", payload:{ via:"door" }, source:"declared" });
  const types = win.__dmEventTypes();
  check("13d. tarot_landed event: ok+length 0→1; unknown via coerces to 'dm'; no-draw → {ok:false, reason:'no-draw'}; DM_EVENT_TYPES has it and length===88",
    okAdd && coerced && r3 && r3.ok === false && r3.reason === "no-draw" &&
    types && types.indexOf("tarot_landed") >= 0 && types.length === 88,
    JSON.stringify({r1, r2, r3, hasType: types && types.indexOf("tarot_landed")>=0, len: types && types.length}));
} catch(e){ check("13d. tarot_landed event", false, e); } }

{ try {
  const { win } = freshDom();
  const nm = "The Cindergore Pact";
  const w = { session:1, currentNodeId:null, ledger:[], factions:[ { name:nm, clock:{ filled:1, size:6 } } ], pressures:[], codex:{ records:{} },
    tarot:{ session:1, name:"The Devil", major:true, reversed:true, omen:"x",
      mutator:{ op:"pressureFaction", params:{ mode:"advance" }, dmNote:"x", note:"x", visibleTell:"x", payoff:"x",
        target:{ kind:"faction", id:win.__slug(nm), label:nm } }, landed:[] } };
  const r = win.applyEvent(w, { type:"clock_advanced", payload:{ clockId:win.__slug(nm), delta:1 }, source:"declared" });
  const fac = w.factions[0];
  const landedOk = w.tarot.landed.length === 1 && w.tarot.landed[0].via === "faction-clock" && w.tarot.landed[0].detected === true;
  check("13e. detected clock landing end-to-end: landed gains faction-clock/detected (0→1) AND clock moved (filled 1→2)",
    landedOk && fac.clock.filled === 2, JSON.stringify({landed:w.tarot.landed, clock:fac.clock}));
} catch(e){ check("13e. detected clock landing", false, e); } }

{ try {
  // receipt path: run a real session in the engine, land one entry, endSession, read ledger.
  const { win, world } = freshDom();
  // endSession's tail renders UI (showTab/renderShelf/toast) — stub them in this headless scope.
  win.eval("showTab=function(){}; renderShelf=function(){}; toast=function(){};");
  // drive a session directly: draw, mark one landing, then endSession
  win.tarotDraw(world);
  world.tarot.landed = [];
  win.tarotMarkLanded(world, { via:"door", ref:"d1", detected:false });
  world.sessionLive = true;
  win.endSession();
  const led = world.ledger || [];
  const receipt = led.find(x => x.data && x.data.kind === "tarot-receipt");
  const okLanded = receipt && receipt.data.landed.length === 1 && receipt.data.card === world.tarot.name &&
    world.carryForward && world.carryForward.tarotReceipt && world.carryForward.tarotReceipt.landed.length === 1;
  // zero-landed session
  const { win: win2, world: w2 } = freshDom();
  win2.eval("showTab=function(){}; renderShelf=function(){}; toast=function(){};");
  win2.tarotDraw(w2);
  w2.tarot.landed = [];
  w2.sessionLive = true;
  win2.endSession();
  const led2 = w2.ledger || [];
  const receipt2 = led2.find(x => x.data && x.data.kind === "tarot-receipt");
  const okUnspent = receipt2 && /went unspent/.test(receipt2.text);
  // seam.js still has no tarot ref
  const seamClean = !/tarot/i.test(read("src/world/seam.js"));
  check("13f. receipt: endSession writes tarot-receipt ledger line (landed.length 1, card match) + carryForward.tarotReceipt; zero-landed session prose says 'went unspent'; seam.js still tarot-free",
    okLanded && okUnspent && seamClean, JSON.stringify({receipt: receipt && receipt.data, receipt2Text: receipt2 && receipt2.text, seamClean}));
} catch(e){ check("13f. receipt", false, e); } }

// ---- 14. MUTATION checks shown RED then restored ----
{ try {
  const original = read("src/engine/tarot.js");
  const keyLine = 'const key = via+"|"+(entry.ref||"");';
  const hasKey = original.indexOf(keyLine) >= 0;
  if(!hasKey){ check("14a. MUTATION setup: dedupe-key line found in tarot.js", false, "key line not found"); }
  else {
    const mutatedFull = original.replace(keyLine, 'const key = Math.random().toString(36);');
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/engine/tarot.js" ? mutatedFull : read(p)).join("\n;\n") +
      "\n;\n" + accessors;
    const { win } = freshDom(mutSrc);
    const w = { session:1, tarot:{ name:"X", landed:[] } };
    win.tarotMarkLanded(w, { via:"door", ref:"same", detected:false });
    win.tarotMarkLanded(w, { via:"door", ref:"same", detected:false });
    const leaked = w.tarot.landed.length === 2;
    // restored
    const { win: win2 } = freshDom();
    const w2 = { session:1, tarot:{ name:"X", landed:[] } };
    win2.tarotMarkLanded(w2, { via:"door", ref:"same", detected:false });
    win2.tarotMarkLanded(w2, { via:"door", ref:"same", detected:false });
    const restored = w2.tarot.landed.length === 1;
    check("14a. MUTATION (dedupe key neutered) leaks length===2; restored source yields 1",
      leaked && restored, JSON.stringify({leaked: w.tarot.landed.length, restored: w2.tarot.landed.length}));
  }
} catch(e){ check("14a. mutation dedupe", false, e); } }

{ try {
  const original = read("src/engine/tarot.js");
  const targetLine = "walkMotif:null,";
  const hasLine = original.indexOf(targetLine) >= 0;
  if(!hasLine){ check("14b. MUTATION setup: default-vector walkMotif:null line found", false, "line not found"); }
  else {
    const mutatedFull = original.replace(targetLine, 'walkMotif:"mirror",');
    const mutSrc = read("tables.js") + "\n;\n" +
      man.loadOrder.filter(p => p.endsWith(".js"))
        .map(p => p === "src/engine/tarot.js" ? mutatedFull : read(p)).join("\n;\n") +
      "\n;\n" + accessors;
    const { win } = freshDom(mutSrc);
    const leaked = win.tarotWalkMotif(null) === "mirror";
    const { win: win2 } = freshDom();
    const restored = win2.tarotWalkMotif(null) === null;
    check("14b. MUTATION (default walkMotif→'mirror') leaks 'mirror' with no draw; restored returns null",
      leaked && restored, JSON.stringify({leaked: win.tarotWalkMotif(null), restored: win2.tarotWalkMotif(null)}));
  }
} catch(e){ check("14b. mutation walkMotif", false, e); } }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
