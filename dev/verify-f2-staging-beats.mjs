/* dev/verify-f2-staging-beats.mjs — VQ2-RESPEC.md §4 unit F2 (Sol P-D, ledger #11 — dev/play-lens/
   DEMAND-LEDGER.md row 4: "shop_open/shop_closed/long_rest/dungeon_complete all render the identical
   idle pedestal; the day-part label is the only tell"). Full-app jsdom load (same convention as
   dev/verify-advancement.mjs/dev/verify-battle-stage.mjs — real modules, real manifest.json loadOrder,
   no mocks of the modules under test).

   RED-FIRST (⊗): §1 proves TODAY's defect first — without a beat threaded through, trayFrom's idle
   branch produces a BYTE-IDENTICAL board regardless of which state (shop_open-context vs
   long_rest-context) the caller conceptually meant, matching the ledger's own finding exactly.

   Then GREEN: §2 shop_open/shop_closed (stable ids, shutter/lamp deltas), §3 long_rest (campfire/
   tent/bedroll + torchlit + "camp" cast arrangement / pc.seated), §4 walk_complete (walk-native
   projection of the REAL rolled feature/areaType only, zero invention when nothing rolled), §5
   provenance (every staged noun resolves to beat-grammar or a rolled field), §6 budgets (Sol P-D's
   <=4 props), §7 determinism, §8 the interior3d out-of-scope proof (F2's lane boundary), §9
   theaterBeatInputFor's own read-only flag derivation (the render.js wiring half), §10 the
   castFrom/arrangeTableau "camp" arrangement + shopOpen-still-wins priority.

   Run:  node dev/verify-f2-staging-beats.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md)
   Sweep (run separately, all expected green — see F2's unit report for the actual tail):
     node dev/verify-theater-shot.mjs        (107/0)
     node dev/verify-dungeon-interior.mjs    (288/0)
     node dev/verify-battle-stage.mjs        (51/0)
     node dev/verify-l2-census.mjs           (33/0)
     node dev/verify-walk-scene.mjs          (32/0)
     python3 build/check-manifest.py         (RESULT: OK) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗ FAIL:", n, d ? "— " + d : ""));

for (const f of ["trayFrom","theaterStageBeat","walkSceneBeatFor","castFrom","arrangeTableau","theaterBeatInputFor","theaterIdleBoardFrom"])
  check(`global ${f}`, typeof win[f] === "function", `missing ${f}`);

// ── §1 RED-FIRST: today's defect — without beat wiring, two conceptually-distinct states render
//    the identical idle pedestal (the exact ledger row-4 finding, reproduced deliberately) ──────────
{
  const optsNoBeat = { env: "urban", realms: ["frontier"] };
  const shopOpenCtx = win.trayFrom({ kind: "idle" }, null, optsNoBeat);      // no .beat field at all
  const longRestCtx = win.trayFrom({ kind: "idle" }, null, optsNoBeat);     // — pre-F2 caller shape
  check("⊗ RED: no-beat idle tray has ZERO props (the idle pedestal)", shopOpenCtx.props.length === 0);
  check("⊗ RED: shop_open-context and long_rest-context idle trays are byte-identical without beat wiring",
    JSON.stringify(shopOpenCtx) === JSON.stringify(longRestCtx));
}

// ── §2 shop_open / shop_closed ────────────────────────────────────────────────────────────────────
let shopOpenBoard, shopClosedBoard;
{
  const opts = { env: "urban", realms: ["frontier"] };
  shopOpenBoard = win.trayFrom({ kind: "idle", beat: { shopOpen: true } }, null, opts);
  check("shop_open classifies", shopOpenBoard.beatStage && shopOpenBoard.beatStage.beatId === "shop_open");
  check("shop_open stages 3 props (counter + 2 shelves, <= budget)", shopOpenBoard.beatStage.propIds.length === 3);
  check("shop_open ids: counter present", shopOpenBoard.beatStage.propIds.includes("beat:shop:counter"));
  check("shop_open ids: both shelves present", shopOpenBoard.beatStage.propIds.includes("beat:shop:shelf-1") && shopOpenBoard.beatStage.propIds.includes("beat:shop:shelf-2"));
  check("shop_open lamp lit (lamplit override)", shopOpenBoard.light && shopOpenBoard.light.profile === "lamplit" && shopOpenBoard.light.overridden === true);

  shopClosedBoard = win.trayFrom({ kind: "idle", beat: { shopHere: true } }, null, opts);
  check("shop_closed classifies", shopClosedBoard.beatStage && shopClosedBoard.beatStage.beatId === "shop_closed");
  check("shop_closed hides shelf-2 (thinner goods)", !shopClosedBoard.beatStage.propIds.includes("beat:shop:shelf-2"));
  check("shop_closed keeps counter (SAME id as shop_open — stable ids across states)", shopClosedBoard.beatStage.propIds.includes("beat:shop:counter"));
  check("shop_closed keeps shelf-1 (SAME id as shop_open)", shopClosedBoard.beatStage.propIds.includes("beat:shop:shelf-1"));
  check("shop_closed lamp OFF — no lamplit override (\"lamp 0\")", !(shopClosedBoard.light && shopClosedBoard.light.profile === "lamplit" && shopClosedBoard.light.overridden === true));
  // shop_open/shop_closed must visibly differ (the ledger's own acceptance bar)
  check("shop_open vs shop_closed VISIBLY differ (prop count or light differs)",
    shopOpenBoard.beatStage.propIds.length !== shopClosedBoard.beatStage.propIds.length ||
    JSON.stringify(shopOpenBoard.light) !== JSON.stringify(shopClosedBoard.light));

  // stable-id proof: the SAME literal id strings appear in both states' output (never a re-minted id)
  const sharedIds = shopOpenBoard.beatStage.propIds.filter(id => shopClosedBoard.beatStage.propIds.includes(id));
  check("stable ids: >=2 ids identical across shop_open<->shop_closed (counter + shelf-1)", sharedIds.length >= 2);
}

// ── §3 long_rest ──────────────────────────────────────────────────────────────────────────────────
let restBoard;
{
  const opts = { env: "wilderness", realms: ["frontier"] };
  restBoard = win.trayFrom({ kind: "idle", beat: { justRested: true } }, null, opts);
  check("long_rest classifies", restBoard.beatStage && restBoard.beatStage.beatId === "long_rest");
  check("long_rest stages 3 props (campfire-pit + tent + bedroll, <= budget)", restBoard.beatStage.propIds.length === 3);
  check("long_rest campfire-pit anchor present", restBoard.beatStage.propIds.includes("beat:rest:campfire-pit"));
  check("long_rest tent present", restBoard.beatStage.propIds.includes("beat:rest:tent"));
  check("long_rest bedroll present", restBoard.beatStage.propIds.includes("beat:rest:bedroll"));
  check("long_rest reads CAMP — torchlit practical (the fire's warm pool against dark ambient = the 'night ring' read)",
    restBoard.light && restBoard.light.profile === "torchlit" && restBoard.light.overridden === true);
  check("long_rest tray-side stamps 'camp' arrangement for castFrom's pc.seated", restBoard.beatArrangement === "camp");
}

// ── §4 walk_complete — walk-native law: project ONLY rolled fields, zero invention ──────────────────
{
  const finaleSegment = { num: 5, isFinale: true, areaType: "a vaulted ossuary", dims: "20x20",
    feature: { name: "a cracked stone altar", flavor: "ancient and scarred" } };
  const opts = { env: "dungeon", realms: ["gloom"] };
  const arrivalBoard = win.trayFrom({ kind: "idle",
    beat: { walkCompleteHere: true, finaleSegment, walkId: "w1", walk: { segments: [finaleSegment] } } }, null, opts);
  check("walk_complete classifies", arrivalBoard.beatStage && arrivalBoard.beatStage.beatId === "walk_complete");
  check("walk_complete stages exactly 1 prop (the rolled feature, no invented support)", arrivalBoard.beatStage.propIds.length === 1);
  check("walk_complete feature prop resolves via the EXISTING keyword vocabulary (altar -> shrine-block)",
    arrivalBoard.props.some(p => p.id === "beat:arrival:feature" && p.part === "shrine-block"));
  check("walk_complete stamps the rolled areaType's floor material (theaterFloorMaterial reuse)", !!arrivalBoard.floorMaterial);
  check("walk_complete does NOT force a light override (walk-native law: never invents a light)",
    !(arrivalBoard.light && arrivalBoard.light.overridden === true && arrivalBoard.beatStage.practical));
  // GROUNDING (found live: a play-lens capture showed the feature prop floating in the idle table's
  // permanently-empty void, no floor beneath it) — a real rolled field grounds a small floor patch so
  // the arrival reads as a PLACE, not a stray floating object.
  check("walk_complete GROUNDS the rolled feature — a small floor patch replaces the idle table's empty tiles",
    arrivalBoard.tiles.length === 9 && arrivalBoard.tiles.every(t => t.kind === "floor" && t.material === arrivalBoard.floorMaterial));

  // the "no invention" half: a bare finale segment with NEITHER areaType nor feature stages NOTHING
  const bareFinale = { num: 1, isFinale: true };
  const bareBoard = win.trayFrom({ kind: "idle",
    beat: { walkCompleteHere: true, finaleSegment: bareFinale, walkId: "w2", walk: { segments: [bareFinale] } } }, null, { env: "wilderness" });
  check("walk_complete with NO rolled fields stages ZERO props (never invents a default feature)", bareBoard.beatStage.propIds.length === 0);
  check("walk_complete with NO rolled areaType leaves floorMaterial untouched (no invention)", bareBoard.floorMaterial === null);
  check("walk_complete with NO rolled fields leaves tiles EMPTY too (no floor invented from nothing)", bareBoard.tiles.length === 0);

  // areaType-only finale (no feature card at all) — floorMaterial + grounding should STILL fire,
  // independent of whether a feature prop staged (the nested-if bug this restructure fixed).
  const areaOnlyFinale = { num: 2, isFinale: true, areaType: "a sunken chapel" };
  const areaOnlyBoard = win.trayFrom({ kind: "idle",
    beat: { walkCompleteHere: true, finaleSegment: areaOnlyFinale, walkId: "w3", walk: { segments: [areaOnlyFinale] } } }, null, { env: "dungeon" });
  check("walk_complete areaType-only (no feature card): floorMaterial STILL stamps", !!areaOnlyBoard.floorMaterial);
  check("walk_complete areaType-only: grounding STILL fires (not gated behind a feature prop existing)", areaOnlyBoard.tiles.length === 9);
  check("walk_complete areaType-only: zero props (no feature to project, none invented)", areaOnlyBoard.beatStage.propIds.length === 0);
}

// ── §5 provenance — every staged noun resolves to beat-grammar or a rolled field ─────────────────────
{
  const allBoards = [shopOpenBoard, shopClosedBoard, restBoard];
  let allProvenanced = true, kinds = new Set();
  allBoards.forEach(b => (b.beatStage.provenance || []).forEach(p => { kinds.add(p && p.kind); if (!p || !p.kind) allProvenanced = false; }));
  check("§5 every provenance entry carries a .kind (0 unprovenanced nouns)", allProvenanced);
  check("§5 provenance kinds are drawn only from {beat-grammar, rolled-field}", [...kinds].every(k => k === "beat-grammar" || k === "rolled-field"));
}

// ── §6 budgets (Sol P-D: <=4 props, 1 practical) ──────────────────────────────────────────────────
{
  check("§6 shop_open respects the <=4 prop budget", shopOpenBoard.beatStage.propIds.length <= 4);
  check("§6 shop_closed respects the <=4 prop budget", shopClosedBoard.beatStage.propIds.length <= 4);
  check("§6 long_rest respects the <=4 prop budget", restBoard.beatStage.propIds.length <= 4);
  check("§6 budget is recorded on board.beatStage.budget for external audit", shopOpenBoard.beatStage.budget && shopOpenBoard.beatStage.budget.maxProps === 4);
}

// ── §7 determinism — same (source,beat) snapshot -> byte-identical board ─────────────────────────────
{
  const opts = { env: "urban", realms: ["frontier"] };
  const a = win.trayFrom({ kind: "idle", beat: { shopOpen: true } }, null, opts);
  const b = win.trayFrom({ kind: "idle", beat: { shopOpen: true } }, null, opts);
  check("§7 determinism: two identical shop_open calls produce byte-identical boards", JSON.stringify(a) === JSON.stringify(b));
}

// ── §8 out-of-scope proof: the interior3d SpatialPlan branch is NEVER beat-staged (KS-3/F1 territory) ─
{
  const fakePlan = { rooms: [{ segNum: 1, cells: [] }], cells: {}, seed: 1 };
  const source = { kind: "interior", plan: fakePlan, segment: { num: 1, isFinale: false }, focusSegNum: 1,
    beat: { justRested: true } };
  let interiorBoard = null, threw = false;
  try { interiorBoard = win.trayFrom(source, null, { env: "dungeon" }); } catch (e) { threw = true; }
  check("§8 interior3d branch does not throw even with .beat present", !threw);
  check("§8 interior3d branch is NEVER beat-staged (no board.beatStage) — KS-3/F1 territory, out of F2 scope",
    !interiorBoard || interiorBoard.beatStage === undefined);
}

// ── §9 theaterBeatInputFor — the render.js read-only flag gatherer ───────────────────────────────────
{
  win.GS.gamePanel = "shop"; win.GS.activeShopId = "shop1";
  const wShop = { currentNodeId: "n1", shops: { shop1: { id: "shop1", nodeId: "n1" } }, characters: [] };
  const inShop = win.theaterBeatInputFor(wShop);
  check("§9 theaterBeatInputFor: shopOpen true when GS.gamePanel='shop'+activeShopId", inShop.shopOpen === true);
  check("§9 theaterBeatInputFor: shopHere false while shopOpen is true (mutually exclusive)", inShop.shopHere === false);
  win.GS.gamePanel = null; win.GS.activeShopId = null;

  const inShopClosed = win.theaterBeatInputFor(wShop);
  check("§9 theaterBeatInputFor: shopHere true when a shop is minted here and panel is closed", inShopClosed.shopHere === true && inShopClosed.shopOpen === false);

  const wNoShop = { currentNodeId: "n2", shops: {}, characters: [] };
  const inNoShop = win.theaterBeatInputFor(wNoShop);
  check("§9 theaterBeatInputFor: shopHere false at a node with no minted shop", inNoShop.shopHere === false);

  // justRested is an EDGE TRIGGER (found live via play-lens: restRiders stamps lastLongRest OFF the
  // PRE-advance clock, so an exact-clock-match test never fires in real play — see
  // theaterBeatInputFor's own header comment for the full account). GS.theaterBeatSeenRestStamp
  // remembers the last stamp already shown; justRested fires ONCE per NEW stamp, then self-clears.
  win.GS.theaterBeatSeenRestStamp = null;
  const wRested = { currentNodeId: "n3", shops: {}, clock: { day: 2, min: 960 }, // clock already advanced +480 past the stamp — the REAL post-rest shape
    characters: [{ status: "living", sheet: { lastLongRest: { day: 2, min: 480 } } }] };
  const inRested = win.theaterBeatInputFor(wRested);
  check("§9 theaterBeatInputFor: justRested true on the FIRST render after a NEW lastLongRest stamp (even though the clock has already moved past it)", inRested.justRested === true);

  const inRestedAgain = win.theaterBeatInputFor(wRested);
  check("§9 theaterBeatInputFor: justRested self-clears on the VERY NEXT render (same stamp, already shown)", inRestedAgain.justRested === false);

  const wRestedTwice = { currentNodeId: "n3", shops: {}, clock: { day: 3, min: 200 },
    characters: [{ status: "living", sheet: { lastLongRest: { day: 2, min: 1400 } } }] }; // a SECOND rest, later, a NEW stamp
  const inRestedTwice = win.theaterBeatInputFor(wRestedTwice);
  check("§9 theaterBeatInputFor: justRested fires AGAIN for a genuinely new (later) rest stamp", inRestedTwice.justRested === true);
  win.GS.theaterBeatSeenRestStamp = null; // reset for later sections of this harness

  const finale = { num: 3, isFinale: true, areaType: "a collapsed vault", feature: { name: "a shattered coffin" } };
  const wArrived = { currentNodeId: "n4", shops: {},
    prep: { nodes: { n4: { cursor: { done: true }, walk: { segments: [{ num: 1, isFinale: false }, finale] } } }, activeWalkId: null } };
  const inArrived = win.theaterBeatInputFor(wArrived);
  check("§9 theaterBeatInputFor: walkCompleteHere true when the current node's own walk is done", inArrived.walkCompleteHere === true);
  check("§9 theaterBeatInputFor: finaleSegment is the REAL rolled finale (not invented)", inArrived.finaleSegment && inArrived.finaleSegment.num === 3);

  const wMidWalk = { currentNodeId: "n5", shops: {},
    prep: { nodes: { n5: { cursor: { done: false }, walk: { segments: [] } } }, activeWalkId: "n5" } };
  const inMidWalk = win.theaterBeatInputFor(wMidWalk);
  check("§9 theaterBeatInputFor: walkCompleteHere false while the walk is still active", inMidWalk.walkCompleteHere === false);

  // §9b THE REAL BUG (found live via a play-lens capture card, not assumed): a FRONTIER dungeon/
  // wilderness walk's segments live in the session-prep BUNDLE (P.bundle.environments[pn.idx].walk),
  // NOT on pn.walk directly (that shape is TRAVEL-WALKS only, src/world/prep.js:726) — a first draft
  // read pn.walk directly and walkCompleteHere NEVER fired for a real frontier node (pl-015's
  // "dungeon-complete" capture was the bare PC on a black void). Fixed via walkOfFrontier(w,nodeId).
  // This fixture exercises THAT exact real shape — pn.walk absent, the walk only in the bundle.
  const bundleFinale = { num: 7, isFinale: true, areaType: "a flooded ossuary", feature: { name: "a drowned reliquary" } };
  const wArrivedBundle = { currentNodeId: "n6", shops: {},
    prep: { nodes: { n6: { idx: 0, cursor: { done: true } } }, activeWalkId: null,
      bundle: { environments: [ { walk: { segments: [{ num: 1, isFinale: false }, bundleFinale] } } ] } } };
  const inArrivedBundle = win.theaterBeatInputFor(wArrivedBundle);
  check("§9b THE REAL BUG'S FIX: walkCompleteHere true via the session-prep BUNDLE shape (pn.walk absent, walkOfFrontier's fallback)", inArrivedBundle.walkCompleteHere === true);
  check("§9b bundle-sourced finaleSegment is the REAL rolled finale (not invented)", inArrivedBundle.finaleSegment && inArrivedBundle.finaleSegment.num === 7);
}

// ── §10 castFrom/arrangeTableau — the "camp" arrangement (pc.seated) + shopOpen priority ─────────────
{
  const wPc = { characters: [{ name: "Sella", status: "living", sheet: { class: "Ranger", mods: {}, ac: 14, hp: 20, hpCur: 20, equipped: {}, inventory: [] } }] };
  const campUnits = win.castFrom(wPc, { hereNodeId: null, walking: false, shopOpen: false, beatId: "long_rest" });
  const pcUnit = campUnits.find(u => u.kind === "pc");
  check("§10 castFrom 'camp' arrangement: pc unit present", !!pcUnit);
  check("§10 castFrom 'camp' arrangement: pc.pose === 'seated'", pcUnit && pcUnit.pose === "seated");
  check("§10 castFrom 'camp' arrangement: pc band === 'seated'", pcUnit && pcUnit.band === "seated");

  // shopOpen still wins priority over a stray beatId (defensive — today's engine never sends both true)
  const shopUnits = win.castFrom(wPc, { hereNodeId: null, walking: false, shopOpen: true, beatId: "long_rest" });
  const pcShop = shopUnits.find(u => u.kind === "pc");
  check("§10 shopOpen still wins arrangement priority over a stray beatId (shopfront's own front-center band)", pcShop && pcShop.band === "front-center" && pcShop.pose === undefined);
}

// ── §11 REGRESSION (found via a live play-lens capture card, not assumed): resting AT a shop-bearing
//    settlement node has shopHere AND justRested both true — justRested must win, or the "we just
//    rested" beat silently loses to the ambient "there's a closed shop here" fact (pl-021's original
//    capture read as shop_closed, not camp — this is the exact regression that read caught) ──────────
{
  const restAtShop = win.walkSceneBeatFor({ shopOpen: false, shopHere: true, justRested: true, walkCompleteHere: false });
  check("§11 justRested wins over shopHere when both are true (resting at a shop-bearing node)", restAtShop && restAtShop.beatId === "long_rest");
  const openWinsOverRest = win.walkSceneBeatFor({ shopOpen: true, shopHere: false, justRested: true, walkCompleteHere: false });
  check("§11 shopOpen still wins over justRested (an active transaction outranks a just-happened rest)", openWinsOverRest && openWinsOverRest.beatId === "shop_open");
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
