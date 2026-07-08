/* Verify TABLETOP-UNITS.md §U5 — Overlay lanes: ambient (rolled) + trace (earned)
   (TABLETOP-VISION.md §5, §9.4 atmo sibling, the walk-away/walk-back reconciliation).

   jsdom, real genesis.html classic modules in document order (dev/verify-tabletop-u1..u4.mjs's own
   established convention).

   Checks:
     1. AMBIENT — overlaysFrom(segment): dressing.condition "cracked stonework" -> overlay-crack-web;
        dressing.condition "waterlogged" -> overlay-standing-water; wilderness footing "mossy hollow"
        -> overlay-moss-patch; signOfPassage.name "drag marks" -> overlay-drag-marks; unmatched text
        -> [] (blankness legal, no generic fallback).
     2. §9.4 SIBLING — a segment whose dressing.condition has no match but whose ATMO text names
        "pooled water" (and even the literal word "cracked") stages ZERO overlays — overlaysFrom
        never reads segment.atmo at all.
     3. MUTATION [RED-FIRST] — the dressing.text false-positive fixture: dressing.text contains a
        crack-web keyword but dressing.condition does not -> overlaysFrom returns [] on the real
        code (GREEN). Pointing overlaysFrom's dressing lane at `.text` instead of `.condition` (a
        source-mutated reimplementation) flips that SAME fixture to produce a crack-web overlay —
        proving the check bites.
     4. WIRING — theaterBoardBuild/trayFrom stages ambient overlays into `board.overlays` OUTSIDE
        combat (scene falsy) and NEVER adds the key at all when a real combat scene is present (the
        U1 byte-gate's own "same key set" contract — a mutation-adjacent regression guard).
     5. TRACE — combat_end (via applyEvent) writes downed-foe corpse traces onto the active walk's
        current segment overlay via the EXISTING walk_update path; the obliterated foe's ref lands
        in `removed`, not `traces`.
     6. RECONCILIATION — re-deriving the tray for the SAME room (walk away, walk back: just a fresh
        trayFrom call over the persisted segment+overlay, no re-roll) stages the surviving corpse as
        a toppled (`down:true`) unit in `board.corpses`, and does NOT re-stage the obliterated foe at
        all — the encounter does not resurrect as "alive."
     7. Fighting in the SAME room a second time accumulates traces (old + new), never overwrites.
     8. §9.1 purity: two trayFrom calls over the identical (segment+overlay) snapshot are
        byte-identical (JSON.stringify).

   Run:  node dev/verify-tabletop-u5.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const CLASSIC_FILES = man.loadOrder.filter((p) => p.endsWith(".js"));
const moduleSrc = CLASSIC_FILES.map(read).join("\n;\n");
const TABLES_SRC = read("tables.js");
const srcText = TABLES_SRC + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function freshWin(customSrc) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || srcText));
  return win;
}

// ============================================================================
// 1. AMBIENT keyword rules
// ============================================================================
{
  const win = freshWin();
  const crack = win.overlaysFrom({ dressing: { text: "a dusty banner", condition: "cracked stonework" } });
  check("1a. dressing.condition 'cracked stonework' -> overlay-crack-web",
    crack.length === 1 && crack[0].part === "overlay-crack-web", JSON.stringify(crack));

  const water = win.overlaysFrom({ dressing: { text: "", condition: "waterlogged" } });
  check("1b. dressing.condition 'waterlogged' -> overlay-standing-water",
    water.length === 1 && water[0].part === "overlay-standing-water", JSON.stringify(water));

  const moss = win.overlaysFrom({ footing: "a mossy hollow", dressing: { condition: null } });
  check("1c. wilderness footing 'a mossy hollow' -> overlay-moss-patch",
    moss.length === 1 && moss[0].part === "overlay-moss-patch", JSON.stringify(moss));

  const drag = win.overlaysFrom({ signOfPassage: { name: "drag marks", effect: "" }, dressing: { condition: null } });
  check("1d. signOfPassage.name 'drag marks' -> overlay-drag-marks",
    drag.length === 1 && drag[0].part === "overlay-drag-marks", JSON.stringify(drag));

  const none = win.overlaysFrom({ dressing: { condition: "pristine and orderly" }, footing: "packed dirt" });
  check("1e. unmatched text -> [] (blankness legal, no generic fallback)",
    Array.isArray(none) && none.length === 0, JSON.stringify(none));

  const multi = win.overlaysFrom({ dressing: { condition: "cracked" }, footing: "waterlogged mud",
    signOfPassage: { name: "drag marks" } });
  check("1f. three matching lanes at once -> three independent overlays (no single-hit cap)",
    multi.length === 3, JSON.stringify(multi));
}

// ============================================================================
// 2. §9.4 SIBLING — atmo never read, even when it names the SAME keywords
// ============================================================================
{
  const win = freshWin();
  const seg = { dressing: { text: "old rope", condition: "pristine and orderly" },
    footing: "packed dirt",
    atmo: { text: "the smell of pooled water and a cracked, mossy old drag mark hangs in the air" } };
  const hits = win.overlaysFrom(seg);
  check("2a. atmo naming every overlay keyword at once still stages ZERO overlays (atmo never read)",
    Array.isArray(hits) && hits.length === 0, JSON.stringify(hits));
}

// ============================================================================
// 3. MUTATION [RED-FIRST] — dressing.text vs dressing.condition
// ============================================================================
{
  const win = freshWin();
  const decoyFixture = { dressing: { text: "a cracked shrine stands here", condition: "pristine and orderly" } };
  const clean = win.overlaysFrom(decoyFixture);
  check("3a. GREEN (real code): dressing.text naming 'cracked' does NOT leak into an overlay (only .condition is read)",
    Array.isArray(clean) && clean.length === 0, JSON.stringify(clean));

  // source-mutated reimplementation: point the dressing lane at .text instead of .condition —
  // proves the check actually bites (an atmo-adjacent false positive would sail through unnoticed
  // if overlaysFrom secretly read the wrong field).
  const mutatedSrc = srcText.replace(
    'if(seg.dressing && typeof seg.dressing === "object" && typeof seg.dressing.condition === "string"){\n    lanes.push(seg.dressing.condition);\n  }',
    'if(seg.dressing && typeof seg.dressing === "object" && typeof seg.dressing.text === "string"){\n    lanes.push(seg.dressing.text);\n  }'
  );
  check("3b. sanity: the mutation actually rewrote the source text", mutatedSrc !== srcText);
  const mwin = freshWin(mutatedSrc);
  const mutated = mwin.overlaysFrom(decoyFixture);
  check("3c. MUTATION RED — reading .text instead of .condition DOES leak the false positive (overlay-crack-web)",
    mutated.length === 1 && mutated[0].part === "overlay-crack-web", JSON.stringify(mutated));
}

// ============================================================================
// 4. WIRING — board.overlays present outside combat only; NEVER added when scene is real
// ============================================================================
{
  const win = freshWin();
  const seg = { id: "wiring-1", num: 1, dims: "30' x 30'",
    feature: { name: "a quiet room", flavor: "" },
    dressing: { text: "old rope", condition: "cracked stonework" }, atmo: { text: "" }, light: null };

  const boardNoScene = win.trayFrom({ kind: "segment", segment: seg }, null, { env: "dungeon" });
  check("4a. no scene -> board.overlays exists and carries the crack-web hit",
    Array.isArray(boardNoScene.overlays) && boardNoScene.overlays.some(o => o.part === "overlay-crack-web"),
    JSON.stringify(boardNoScene.overlays));
  check("4b. no scene -> board.corpses exists (empty array, no overlay.traces on this segment)",
    Array.isArray(boardNoScene.corpses) && boardNoScene.corpses.length === 0);

  const realScene = { elevZones: [], hazardZones: [], zoneCover: {}, cover: {}, mods: [] };
  const boardWithScene = win.trayFrom({ kind: "segment", segment: seg }, realScene, { env: "dungeon" });
  check("4c. a REAL scene object -> board carries NO 'overlays' key at all (U1 byte-gate's key-set contract)",
    !("overlays" in boardWithScene), Object.keys(boardWithScene).join(","));
  check("4d. a REAL scene object -> board carries NO 'corpses' key at all",
    !("corpses" in boardWithScene), Object.keys(boardWithScene).join(","));
}

// ============================================================================
// 5+6+7+8 — the TRACE lane, end to end: combat_end write, walk-away/walk-back reconciliation,
// accumulation across two fights, §9.1 purity.
// ============================================================================
function makeWorld(win) {
  const world = {
    id: "w-u5", name: "The U5 Test Redoubt", characters: [{
      id: "c1", status: "living", name: "Test Soul",
      sheet: { species: "Human", class: "Fighter", level: 3, xp: 900, hp: 28, hpCur: 28, ac: 15,
        profBonus: 2, scores: { str: 14 }, mods: { str: 2 }, saveProfs: [], skillProfs: [],
        conditions: [], exhaustion: 0, inspiration: false, cantrips: [], spells: [],
        inventory: [], equipped: { mainHand: null, offHand: null, armor: null }, pools: {} }
    }], gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null, factions: [], pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = null; win.GS.menuOpen = false;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  // A minimal active-walk fixture, hand-built to satisfy prepOf/walkOfFrontier's lazy shape
  // (prep.js:377's own `if(pn.walk) return pn.walk;` early-return path) — no dependency on the
  // full frontier/bundle machinery, matching how prepStartTravelWalk stores a walk directly too.
  world.prep = {
    session: 0, bundle: null, overlays: {}, harvest: null, debt: [],
    activeWalkId: "node-fight-room",
    nodes: {
      "node-fight-room": {
        env: "dungeon", soft: false, locked: false, hook: null,
        walk: {
          environment: "dungeon", segCount: 1,
          segments: [{ id: "S1", num: 1, dims: "30' x 30'",
            feature: { name: "a quiet room", flavor: "" },
            dressing: { text: "old rope", condition: "cracked stonework" },
            atmo: { text: "" }, light: null }]
        },
        cursor: { current: 1, touched: [1], tickedSegs: [1] },
        segments: []   // pn.segments — the reskin/trace overlay array walk_update writes into
      }
    }
  };
  return world;
}

{
  const win = freshWin();
  const world = makeWorld(win);
  // NOTE: an explicit `statId` (not just a `name`+`cr` pair) is deliberate — cmResolveFoe's own
  // {statId,BESTIARY[statId]} branch is an EXACT deterministic lookup; a bare name that doesn't
  // match a bestiary entry verbatim falls through to cmPickByCR's RANDOMIZED CR-band pick (`pick`),
  // which would make this fixture's statId/zone assertions flaky run to run.
  win.applyEvent(world, { type: "combat_start", payload: { foes: [
    { statId: "goblin-warrior", name: "Goblin Warrior", cr: 0.5 },
    { statId: "goblin-boss", name: "Goblin Boss", cr: 1 }
  ] } });
  check("5a. combat_start produced two live foes", win.GS.combat && win.GS.combat.foes.length === 2,
    JSON.stringify(win.GS.combat && win.GS.combat.foes.map(f => f.fid)));

  // hand-flip the fight's outcome (bypassing real attack resolution — combat_end's own trace-write
  // reads only .down/.obliterated/.band/.lane/.statId, so simulating the END state is a faithful
  // fixture for THIS unit): foe f1 dies a normal death (stages a corpse), foe f2 is obliterated
  // (an elemental killing blow — src/world/dm.js's own existing DEAD-STATE doctrine).
  const f1 = win.GS.combat.foes[0], f2 = win.GS.combat.foes[1];
  f1.down = true; f1.hp = 0;
  f2.down = true; f2.hp = 0; f2.obliterated = true;
  const zoneF1 = f1.band + ":" + f1.lane;
  const zoneF2 = f2.band + ":" + f2.lane;
  const refF1 = f1.statId || f1.fid;
  const refF2 = f2.statId || f2.fid;

  win.applyEvent(world, { type: "combat_end", payload: { outcome: "resolved" } });
  check("5b. combat_end clears GS.combat", win.GS.combat === null);

  const pn = world.prep.nodes["node-fight-room"];
  const entry = (pn.segments || []).find(o => o.ref === "S1");
  check("5c. combat_end wrote a reskin/trace overlay entry for segment S1", !!entry, JSON.stringify(pn.segments));
  check("5d. the DOWNED-not-obliterated foe landed a corpse trace",
    !!entry && Array.isArray(entry.traces) && entry.traces.some(t => t.kind === "corpse" && t.ref === refF1 && t.zone === zoneF1),
    JSON.stringify(entry && entry.traces));
  check("5e. the OBLITERATED foe's ref landed in `removed`, NOT in `traces`",
    !!entry && Array.isArray(entry.removed) && entry.removed.indexOf(refF2) >= 0
      && !entry.traces.some(t => t.ref === refF2),
    JSON.stringify(entry));

  // ---- 6. RECONCILIATION: walk away, walk back — trayFrom re-derives the SAME persisted segment ----
  const mergedSeg = Object.assign({}, pn.walk.segments[0], { overlay: entry });
  const board1 = win.trayFrom({ kind: "segment", segment: mergedSeg }, null, { env: "dungeon" });
  check("6a. the surviving foe's corpse stages as a toppled (down:true) unit in board.corpses",
    board1.corpses.some(u => u.down === true && u.statId === refF1 && u.zone === zoneF1),
    JSON.stringify(board1.corpses));
  check("6b. the obliterated foe never stages at all (no ref match anywhere in board.corpses)",
    !board1.corpses.some(u => u.statId === refF2), JSON.stringify(board1.corpses));
  check("6c. exactly one corpse staged (encounter does NOT re-stage BOTH foes as alive/duplicated)",
    board1.corpses.length === 1, JSON.stringify(board1.corpses));

  // ---- 8. §9.1 purity: identical (segment+overlay) snapshot -> identical board ----
  const board2 = win.trayFrom({ kind: "segment", segment: mergedSeg }, null, { env: "dungeon" });
  check("8a. two trayFrom calls over the identical persisted segment+overlay are byte-identical",
    JSON.stringify(board1) === JSON.stringify(board2));

  // ---- 7. a SECOND fight in the SAME room accumulates (never overwrites) ----
  // Same deterministic-statId discipline as the first fight above.
  win.applyEvent(world, { type: "combat_start", payload: { foes: [
    { statId: "goblin-hexer", name: "Goblin Hexer", cr: 1 }
  ] } });
  const f3 = win.GS.combat.foes[0];
  f3.down = true; f3.hp = 0;
  const zoneF3 = f3.band + ":" + f3.lane, refF3 = f3.statId || f3.fid;
  win.applyEvent(world, { type: "combat_end", payload: { outcome: "resolved" } });
  const entry2 = (pn.segments || []).find(o => o.ref === "S1");
  check("7a. the FIRST fight's corpse trace is still present after a SECOND fight in the same room",
    entry2.traces.some(t => t.ref === refF1 && t.zone === zoneF1), JSON.stringify(entry2.traces));
  check("7b. the SECOND fight's corpse trace was appended, not overwritten",
    entry2.traces.some(t => t.ref === refF3 && t.zone === zoneF3), JSON.stringify(entry2.traces));
  check("7c. traces accumulate to exactly 2 (one obliterated foe stays out of traces across both fights)",
    entry2.traces.length === 2, JSON.stringify(entry2.traces));

  const mergedSeg2 = Object.assign({}, pn.walk.segments[0], { overlay: entry2 });
  const board3 = win.trayFrom({ kind: "segment", segment: mergedSeg2 }, null, { env: "dungeon" });
  check("7d. re-deriving the tray after the second fight stages BOTH surviving corpses",
    board3.corpses.length === 2, JSON.stringify(board3.corpses));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
