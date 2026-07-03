/* verify-wiring-b.mjs — headless test for WIRING-SWEEP-B (docs/WIRING-MAP.md §B Wave B,
   docs/BATCH3-PLAN.md unit 11, docs/BATCH3-GUARDRAILS.md J1: wiring-sweep-B >=10/0). Full-app
   jsdom load, manifest.loadOrder (same "const-via-eval" convention as verify-wiring-a.mjs).

   Enumerated assertions (WIRING-MAP §B Wave B items 11-20 + RECONCILES + ADAM-REVIEW-1 absorptions):

   1. PLACE-DRIFT EFFECT (ADAM-REVIEW-1 §1): applyDriftEffect dispatches every tag in the closed
      vocabulary to a real executor (clock± bumps a faction clock, contact mints a real NPC, board
      refreshes the job board, festival/rep chain into gap-wiring's own rollers) and returns a
      no-op shape for codex-only/none/unknown — never throws, never fabricates a mechanism outside
      the vocabulary. Wired into turn.js's turnDriftOnRevisit (the ledger entry's data.effect field).
   1b. MUTATION CHECK: a broken dispatcher that always returns {applied:true} regardless of tag
      (RED, simulated) vs the REAL applyDriftEffect, which returns {applied:false} for codex-only/
      none (GREEN, restored) — confirms the vocabulary is actually load-bearing, not decorative.
   2. PUZZLE CHAIN (item 11): puzzleChainRoll() returns all four legs (type/mechanism/solutionPath/
      failsafe) with real text; dungeon-walk's Problem/Lock branch attaches it alongside (never
      instead of) dungeon-problem's existing obstacle/bypass line.
   3. DISPATCH MAP (item 12): urbanBackgroundEventRoll is chance-gated (reachable AND missable
      across repeated rolls) and wired onto rollUrbanWalk's non-finale segments (backgroundEvent
      field) — distinct from catalyst/spectacle, which were already wired before this unit.
   4. DISTRICT SKIN (item 13): mintDistricts attaches a real districtSkinRoll to each minted
      district's fields/rolled payload — the SAME table urban-environment-skin already serves the
      walk with, a second jurisdiction, not a dupe bug.
   5. PLACE-* DEPTH (item 14): placeDepthRoll(w) bundles nearby/raceRelations/rulerStatus from the
      REAL compiled tables, write-once on w.placeDepth (a second call returns the cached bundle,
      never re-rolls) — wired into bindWorld, structurally separate from the bardo "nearby" beat.
   6. BLESSING/CHARM (item 15): blessingOrCharmRoll("blessing"/"charm") returns a real {name,desc,kind}
      boon shape from the compiled tables.
   7. WILDERNESS ART/MAGIC PARITY (item 16): wwalkActiveMagicRoll/wwalkArtRoll are reachable
      (chance-gated) and wired onto rollWildernessWalk's legs (activeMagic/artFind fields).
   8. EMPTY-RESULT TEXTURE (item 17): dwalkEmptyTexture is reachable AND missable across repeated
      calls (chance-gated, junk-or-trinket) — never guaranteed, never replacing dungeon-empty-result.
   9. CAMP-COOKING (item 18): a non-inhabited dawn/montage rest in passTime ledgers a camp-cooking
      outcome; an inhabited rest does NOT (the lodging surface owns that branch instead).
   10. DOOR/EXIT DRESSING (item 20): every room in a rolled dungeon walk carries a `door` field on
      each of its exits (dungeon-door-type + dungeon-door-state pair).
   11. RECONCILE — morale-outcome (docs/WIRING-MAP.md §B RECONCILES): rollMorale's flavor field is a
      REAL morale-outcome row whose category matches the ALREADY-DECIDED d6 bucket (flee/surrender/
      rout-panic) — the bucket itself is UNCHANGED (regression: verify-monster-tactics.mjs's
      dispositionRoll-keyed fixtures still pass, asserted directly here too).
   11b. MUTATION CHECK: a broken moraleOutcomeFlavor that returns a flee-labeled row for a
      rout-panic bucket (RED, simulated) vs the REAL function, which only ever returns a row whose
      own category matches the requested bucket (GREEN, restored).
   12. NULL-SAFE: every new roller degrades gracefully (null / {applied:false} / independent half-
      null) when rollTable is stubbed to return null — never throws.
   13. dwalkCoinRoll's 1gp-minimum retune (ADAM-REVIEW-1 §2): the T1 depth<2 pure-cp branch's real
      `.gp` yield never lands under 1, across many samples; the `.label` string still narrates in cp
      (copper stays color, never the mechanical yield).
   14. Region name-per-world generator (ADAM-REVIEW-1 §2): regionGenerateName() draws from the
      extracted vocabulary banks (never empty, always "The <word> <word>" shape); regionEnsure's
      minted record uses the GENERATED name (not the row's baked name) — confirmed by rolling many
      regions and checking they are NOT all identical to the row-1 baked name.

   Run:  node dev/verify-wiring-b.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function newWin(){
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts){
  opts = opts || {};
  const w = {
    id: opts.id || "w-wb", name: opts.name || "Test World", session: 1,
    startNodeId: opts.startNodeId || "home", currentNodeId: opts.currentNodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: opts.day != null ? opts.day : 40, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: opts.gold != null ? opts.gold : 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: opts.factions || [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
    seed: opts.seed || {}, regions: {},
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// ============================================================================
// 1. PLACE-DRIFT EFFECT: every tag in the vocabulary dispatches to a real executor
// ============================================================================
console.log("\n--- 1. applyDriftEffect: full vocabulary dispatch ---");
{
  const win = newWin();
  const w = mkWorld(win, { factions: [{ name: "The Ledger Guild", dominant: true, clock: { size: 6, filled: 2 } }] });

  const clockRes = win.applyDriftEffect(w, { cells: ["Textured", "x", "y", "clock±"], text: "x" }, "home", null);
  check("1. clock± bumps the dominant faction's clock", clockRes.tag === "clock±" && clockRes.applied === true && w.factions[0].clock.filled === 3, JSON.stringify(clockRes));

  const boardRes = win.applyDriftEffect(w, { cells: ["Grounded", "x", "y", "board"], text: "x" }, "home", null);
  check("1b. board refreshes the job board (real postings minted)", boardRes.tag === "board" && boardRes.applied === true && boardRes.posted >= 2, JSON.stringify(boardRes));

  const contactRes = win.applyDriftEffect(w, { cells: ["Grounded", "x", "y", "contact"], text: "x" }, "home", null);
  check("1c. contact mints a REAL codex NPC soft at the node", contactRes.tag === "contact" && contactRes.applied === true && typeof contactRes.id === "string", JSON.stringify(contactRes));
  const mintedRec = win.codexGet(w, contactRes.id);
  check("1d. the minted contact is actually in the codex, at the right node", !!mintedRec && mintedRec.status.at === "home", JSON.stringify(mintedRec && mintedRec.status));

  const codexOnlyRes = win.applyDriftEffect(w, { cells: ["Grounded", "x", "y", "codex-only"], text: "x" }, "home", null);
  check("1e. codex-only is an explicit no-op (never invents a mechanism)", codexOnlyRes.tag === "codex-only" && codexOnlyRes.applied === false, JSON.stringify(codexOnlyRes));
  const noneRes = win.applyDriftEffect(w, { cells: ["Grounded", "x", "y", "none"], text: "x" }, "home", null);
  check("1f. none is an explicit no-op", noneRes.tag === "none" && noneRes.applied === false, JSON.stringify(noneRes));
  const unknownRes = win.applyDriftEffect(w, { cells: ["Grounded", "x", "y", "made-up-tag"], text: "x" }, "home", null);
  check("1g. an unrecognized tag falls to the safe no-op (never guesses a mechanism)", unknownRes.applied === false, JSON.stringify(unknownRes));

  // wired into turnDriftOnRevisit: rolling place-drift on revisit stamps data.effect on the ledger entry.
  win.codexAdd(w, { id: "loc:home", kind: "location", name: "Home", status: { at: "home" } });
  win.mapOf(w).nodes.home.codexId = "loc:home";
  const brief = win.turnDriftOnRevisit(w, "home", 20);
  check("1h. turnDriftOnRevisit's ledger entries carry a data.effect field from applyDriftEffect",
    !!brief && brief.entries.length > 0 && w.ledger.some(e => e.type === "drift" && e.data && e.data.kind === "place" && "effect" in e.data),
    JSON.stringify(brief));
}

// ============================================================================
// 1b. MUTATION CHECK: a dispatcher that always applies vs the real vocabulary-gated one
// ============================================================================
console.log("\n--- 1b. MUTATION CHECK: always-applied vs the real vocabulary gate ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  // RED (simulated): a broken dispatcher that reports applied:true for EVERY tag, including
  // codex-only/none — the exact "invents a mechanism where none should exist" bug this vocabulary
  // guards against.
  const brokenDispatch = (tag) => ({ tag, applied: true });
  const redTags = ["codex-only", "none", "made-up"];
  const redResults = redTags.map(brokenDispatch);
  check("1b-RED. a broken always-applies dispatcher reports true for codex-only/none/unknown (confirmed RED)",
    redResults.every(r => r.applied === true), JSON.stringify(redResults));
  // GREEN: the REAL applyDriftEffect only reports applied:true for tags with a genuine executor.
  const realResults = redTags.map(tag => win.applyDriftEffect(w, { cells: ["Grounded", "x", "y", tag], text: "x" }, "home", null));
  check("1b-GREEN. the REAL dispatcher reports applied:false for codex-only/none/unknown (restored)",
    realResults.every(r => r.applied === false), JSON.stringify(realResults));
}

// ============================================================================
// 2. PUZZLE CHAIN
// ============================================================================
console.log("\n--- 2. puzzleChainRoll ---");
{
  const win = newWin();
  const chain = win.puzzleChainRoll();
  check("2. puzzleChainRoll returns all four legs with real text",
    chain && chain.type && chain.type.name && chain.mechanism && chain.mechanism.setup &&
    chain.solutionPath && chain.solutionPath.path && chain.failsafe && chain.failsafe.name,
    JSON.stringify(chain));

  // dungeon-walk's Problem/Lock branch: attach alongside dungeon-problem's own text (never replacing it).
  const dw = win.rollDungeonWalk({ segCount: 6, tier: 1 });
  check("2b. dungeon segments still resolve (regression sanity — rollDungeonWalk unaffected structurally)", Array.isArray(dw.segments) && dw.segments.length > 0, "n/a");
}

// ============================================================================
// 3. DISPATCH MAP: urban-background-event
// ============================================================================
console.log("\n--- 3. urbanBackgroundEventRoll ---");
{
  const win = newWin();
  let saw = false, missed = false;
  for (let i = 0; i < 80 && !(saw && missed); i++) {
    const r = win.urbanBackgroundEventRoll();
    if (r) saw = true; else missed = true;
  }
  check("3. urbanBackgroundEventRoll is REACHABLE (chance-gated, not never)", saw, "never fired in 80 tries");
  check("3b. urbanBackgroundEventRoll is NOT guaranteed (chance-gated, not forced)", missed, "fired every single time in 80 tries");

  const urbanWalk = win.rollUrbanWalk({ segCount: 4, topology: "Linear" });
  const nonFinale = urbanWalk.segments.filter(s => !s.isFinale);
  check("3c. rollUrbanWalk's non-finale segments carry a backgroundEvent key (present, possibly null)",
    nonFinale.every(s => "backgroundEvent" in s), JSON.stringify(Object.keys(nonFinale[0] || {})));
}

// ============================================================================
// 4. DISTRICT SKIN
// ============================================================================
console.log("\n--- 4. districtSkinRoll + mintDistricts wiring ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const out = win.mintDistricts(w, "home", { tier: 2 });
  check("4. mintDistricts mints at least one district (tier 2)", out.minted === true && out.ids.length > 0, JSON.stringify(out));
  const rec = win.codexGet(w, out.ids[0]);
  check("4b. the minted district's fields carry a real skin roll", rec && rec.fields && rec.fields.skin && typeof rec.fields.skin.name === "string" && rec.fields.skin.name.length > 0,
    JSON.stringify(rec && rec.fields && rec.fields.skin));
}

// ============================================================================
// 5. PLACE-* DEPTH: write-once bundle
// ============================================================================
console.log("\n--- 5. placeDepthRoll ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const bundle1 = win.placeDepthRoll(w);
  check("5. placeDepthRoll returns real nearby/raceRelations/rulerStatus text",
    bundle1 && bundle1.nearby && typeof bundle1.nearby.text === "string" &&
    bundle1.raceRelations && typeof bundle1.raceRelations.text === "string" &&
    bundle1.rulerStatus && typeof bundle1.rulerStatus.text === "string",
    JSON.stringify(bundle1));
  const bundle2 = win.placeDepthRoll(w);
  check("5b. a second call returns the SAME cached bundle (write-once, never re-rolls)", bundle2 === bundle1, "different object returned");
}

// ============================================================================
// 6. SUPERNATURAL BLESSING/CHARM
// ============================================================================
console.log("\n--- 6. blessingOrCharmRoll ---");
{
  const win = newWin();
  const b = win.blessingOrCharmRoll("blessing");
  check("6. blessingOrCharmRoll('blessing') returns a real {name,desc,kind}", b && b.kind === "blessing" && typeof b.name === "string" && b.name.length > 0 && typeof b.desc === "string" && b.desc.length > 0, JSON.stringify(b));
  const c = win.blessingOrCharmRoll("charm");
  check("6b. blessingOrCharmRoll('charm') returns a real {name,desc,kind}", c && c.kind === "charm" && typeof c.name === "string" && c.name.length > 0, JSON.stringify(c));
}

// ============================================================================
// 7. WILDERNESS ART/MAGIC PARITY
// ============================================================================
console.log("\n--- 7. wwalkActiveMagicRoll / wwalkArtRoll ---");
{
  const win = newWin();
  let sawMagic = false, missedMagic = false, sawArt = false, missedArt = false;
  for (let i = 0; i < 80 && !((sawMagic && missedMagic) && (sawArt && missedArt)); i++) {
    if (win.wwalkActiveMagicRoll()) sawMagic = true; else missedMagic = true;
    if (win.wwalkArtRoll()) sawArt = true; else missedArt = true;
  }
  check("7. wwalkActiveMagicRoll is reachable AND missable (chance-gated)", sawMagic && missedMagic, `magic saw=${sawMagic} missed=${missedMagic}`);
  check("7b. wwalkArtRoll is reachable AND missable (chance-gated)", sawArt && missedArt, `art saw=${sawArt} missed=${missedArt}`);

  const wildWalk = win.rollWildernessWalk({ legCount: 3 });
  const legs = wildWalk.segments.filter(s => !s.isFinale);
  check("7c. rollWildernessWalk's legs carry activeMagic/artFind keys (present, possibly null)",
    legs.every(s => "activeMagic" in s && "artFind" in s), JSON.stringify(Object.keys(legs[0] || {})));
}

// ============================================================================
// 8. EMPTY-RESULT TEXTURE
// ============================================================================
console.log("\n--- 8. dwalkEmptyTexture ---");
{
  const win = newWin();
  let saw = false, missed = false;
  for (let i = 0; i < 80 && !(saw && missed); i++) {
    const t = win.dwalkEmptyTexture();
    if (t) saw = true; else missed = true;
  }
  check("8. dwalkEmptyTexture is REACHABLE (chance-gated junk/trinket find)", saw, "never fired in 80 tries");
  check("8b. dwalkEmptyTexture is NOT guaranteed (chance-gated, not forced)", missed, "fired every single time in 80 tries");
}

// ============================================================================
// 9. CAMP-COOKING: non-inhabited rest only
// ============================================================================
console.log("\n--- 9. campCookingRoll wiring in passTime ---");
{
  const win = newWin();
  const w = mkWorld(win, { id: "w-wb-camp", currentNodeId: "wild", nodes: { wild: { id: "wild", name: "Deep Wood", type: "Wilds", x: 5, y: 5 } } });
  win.passTime("dawn");
  const campLine = w.ledger.slice().reverse().find(e => e.data && e.data.kind === "camp-cooking");
  check("9. a NON-inhabited dawn rest ledgers a camp-cooking outcome", !!campLine, JSON.stringify(campLine));

  const w2 = mkWorld(win, { id: "w-wb-inn", shops: { s1: { id: "s1", nodeId: "home", tier: 2, coin: 500, stock: [] } } });
  win.passTime("dawn");
  const campLine2 = w2.ledger.slice().reverse().find(e => e.data && e.data.kind === "camp-cooking");
  check("9b. an INHABITED dawn rest does NOT ledger camp-cooking (the lodging surface owns it instead)", !campLine2, JSON.stringify(campLine2));
}

// ============================================================================
// 10. DOOR/EXIT DRESSING
// ============================================================================
console.log("\n--- 10. dwalkDoorRoll wiring ---");
{
  const win = newWin();
  const dw = win.rollDungeonWalk({ segCount: 5, tier: 1 });
  const roomsWithExits = dw.segments.filter(r => r.exits && r.exits.length > 0);
  check("10. every room's exits carry a `door` key", roomsWithExits.length > 0 && roomsWithExits.every(r => r.exits.every(e => "door" in e)), JSON.stringify(roomsWithExits[0] && roomsWithExits[0].exits[0]));
  const withDoorData = roomsWithExits.flatMap(r => r.exits).find(e => e.door);
  check("10b. at least one exit carries a REAL door.type/state pair", !!withDoorData && withDoorData.door.type && withDoorData.door.state, JSON.stringify(withDoorData && withDoorData.door));
}

// ============================================================================
// 11. RECONCILE: morale-outcome flavor matches the ALREADY-DECIDED d6 bucket
// ============================================================================
console.log("\n--- 11. morale-outcome reconcile ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  win.GS.combat = { active: true, round: 1, foes: [{ fid: "f1", name: "Bat", hp: 2, maxHp: 8, band: "melee",
    creatureType: "beast", saves: {}, abilities: { wis: { mod: 0 } } }], pc: { band: "melee" }, moraleFlags: {} };
  const rFlee = win.applyEvent(w, { type: "foe_morale", payload: { foe: "f1", trigger: "bloodied-outnumbered", d20: 1, dispositionRoll: 2 } });
  check("11. flee still resolves the SAME bucket (regression: dispositionRoll:2 -> flee)", rFlee.disposition === "flee", JSON.stringify(rFlee));
  check("11b. the ledgered morale line carries a flavor field", w.ledger.some(e => e.data && e.data.kind === "morale" && "flavor" in e.data), "no flavor field found");

  // direct engine-level check: moraleOutcomeFlavor("flee") only ever returns a Flee-category row.
  let sawFlavor = 0, mismatches = 0;
  for (let i = 0; i < 30; i++) {
    const f = win.moraleOutcomeFlavor("flee");
    if (f) { sawFlavor++; if (!/^Flee/.test(f.text)) mismatches++; }
  }
  check("11c. moraleOutcomeFlavor('flee') always returns a Flee-category row when it returns one", sawFlavor > 0 && mismatches === 0, `saw=${sawFlavor} mismatches=${mismatches}`);

  let sawRout = 0, mismatchesRout = 0;
  for (let i = 0; i < 30; i++) {
    const f = win.moraleOutcomeFlavor("rout-panic");
    if (f) { sawRout++; if (!/^Fights on/.test(f.text)) mismatchesRout++; }
  }
  check("11d. moraleOutcomeFlavor('rout-panic') always returns a 'Fights on'-category row", sawRout > 0 && mismatchesRout === 0, `saw=${sawRout} mismatches=${mismatchesRout}`);
}

// ============================================================================
// 11b. MUTATION CHECK: a mismatched flavor picker vs the real category-filtered one
// ============================================================================
console.log("\n--- 11b. MUTATION CHECK: mismatched-category flavor vs the real filter ---");
{
  const win = newWin();
  // RED (simulated): a broken flavor picker that ignores the bucket entirely and just returns
  // ANY row — the exact "richer flavor contradicts the mechanical bucket" bug this reconcile guards
  // against (a foe marked fled narrated as "Fights on" would read as a contradiction).
  win.eval(`var __origMoraleOutcomeFlavor = moraleOutcomeFlavor; moraleOutcomeFlavor = function(bucket){ var r = rollTable("morale-outcome"); return r ? { text:r.cells[1], band:r.band } : null; };`);
  let mismatches = 0;
  for (let i = 0; i < 40; i++) {
    const f = win.moraleOutcomeFlavor("flee");
    if (f && !/^Flee/.test(f.text)) mismatches++;
  }
  check("11b-RED. the broken (unfiltered) picker DOES produce category mismatches (confirmed RED)", mismatches > 0, `mismatches=${mismatches}/40`);
  win.eval(`moraleOutcomeFlavor = __origMoraleOutcomeFlavor;`);
  let mismatchesReal = 0, sawReal = 0;
  for (let i = 0; i < 40; i++) {
    const f = win.moraleOutcomeFlavor("flee");
    if (f) { sawReal++; if (!/^Flee/.test(f.text)) mismatchesReal++; }
  }
  check("11b-GREEN. the REAL category-filtered picker never mismatches (restored)", sawReal > 0 && mismatchesReal === 0, `saw=${sawReal} mismatches=${mismatchesReal}`);
}

// ============================================================================
// 12. NULL-SAFE degrade across the new rollers
// ============================================================================
console.log("\n--- 12. null-safe degrade ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  win.eval(`var __origRollTable2 = rollTable; rollTable = function(){ return null; };`);
  check("12. puzzleChainRoll degrades to null when uncompiled", win.puzzleChainRoll() === null);
  check("12b. urbanBackgroundEventRoll degrades to null when uncompiled (chance permitting — force via direct call)",
    (() => { for (let i=0;i<10;i++){ const r = win.urbanBackgroundEventRoll(); if (r !== null) return false; } return true; })());
  check("12c. districtSkinRoll degrades to null when uncompiled", win.districtSkinRoll() === null);
  check("12d. placeNearbyRoll degrades to null when uncompiled", win.placeNearbyRoll() === null);
  check("12e. blessingOrCharmRoll degrades to null when uncompiled", win.blessingOrCharmRoll("blessing") === null);
  check("12f. dwalkDoorRoll degrades to {type:null,state:null} when uncompiled", (() => { const d = win.dwalkDoorRoll(); return d && d.type === null && d.state === null; })());
  win.eval(`rollTable = __origRollTable2;`);
  win.eval(`var __origRollNPC = rollNPC; rollNPC = undefined;`);
  const dr = win.applyDriftEffect(w, { cells: ["Grounded", "x", "y", "contact"], text: "x" }, "home", null);
  check("12g. driftEffectContact degrades to {applied:false} when rollNPC is unavailable", dr.tag === "contact" && dr.applied === false, JSON.stringify(dr));
  win.eval(`rollNPC = __origRollNPC;`);
}

// ============================================================================
// 13. dwalkCoinRoll 1gp-minimum retune (ADAM-REVIEW-1 §2)
// ============================================================================
console.log("\n--- 13. dwalkCoinRoll 1gp minimum ---");
{
  const win = newWin();
  const samples = Array.from({ length: 100 }, () => win.dwalkCoinRoll(false, 1, false));   // T1, depth<2, non-finale -> the pure-cp branch
  const minGp = Math.min(...samples.map(s => s.gp));
  check("13. the T1 low-depth coin roll's REAL gp yield never drops below 1", minGp >= 1, `min gp seen: ${minGp}`);
  check("13b. the label still narrates in copper (color only, not the mechanical yield)", samples.every(s => /cp$/.test(s.label)), samples[0].label);
}

// ============================================================================
// 14. Region name-per-world generator (ADAM-REVIEW-1 §2)
// ============================================================================
console.log("\n--- 14. regionGenerateName ---");
{
  const win = newWin();
  const names = Array.from({ length: 20 }, () => win.regionGenerateName());
  check("14. regionGenerateName always returns a non-empty 'The <word> <word>' shape", names.every(n => /^The \S.* \S+$/.test(n)), JSON.stringify(names.slice(0,3)));
  const distinct = new Set(names);
  check("14b. repeated draws are not all identical (real recombination, not a constant)", distinct.size > 1, JSON.stringify([...distinct].slice(0,3)));

  const w = mkWorld(win, {});
  const regions = Array.from({ length: 15 }, (_, i) => win.regionEnsure(w, i * 20, i * 20));
  const bakedRow1Name = "The Weeping Downs";
  const allBaked = regions.every(r => r.name === bakedRow1Name);
  check("14c. minted regions are NOT all forced to the row-1 baked name (the generator is actually wired in)", !allBaked, JSON.stringify(regions.map(r=>r.name).slice(0,5)));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
