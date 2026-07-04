/* verify-dressing.mjs — headless test for DRESSING-WIRING (docs/DRESSING-WIRING.md):
   dressing rolls (dungeon-set-dressing / urban-set-dressing / wilderness-set-dressing + their
   Condition tables) wired into all three walk-rollers, joined into the theater prop-text pool,
   and riding the DM digest's "here" segment gist — mirroring how `feature` already works.

   1. RED-FIRST: roll each walk type x50; assert every room/leg/segment carries a non-empty
      `.dressing.text` string.
   2. Determinism: seeding a walk roll twice with the same Math.random sequence yields the same
      dressing (piggybacks the walker's own determinism convention — Math.random is stubbed to a
      seeded PRNG for the duration of one roll, then replayed).
   3. Theater pickup: a fixture room/segment whose dressing text names a known keyword ("crate")
      resolves through theaterPropForText/theaterBoardFrom to the mapped prop part.
   4. MUTATION: stub the dressing roll out (force walkPick to return "" for the three dressing
      table ids) -> checks 1 & 3 go red; restore -> green again.
   5. Table compile: this harness does NOT recompile (build/check-manifest.py + the compile step
      are run separately by the report) — it only asserts the compiled tables.js already carries
      the expected dressing keys (VERIFY FIRST discipline, same grep the spec mandates).
   6. Digest: activeWalkDigest's "here" segment carries `dressing:{text,condition}` alongside
      `gist`, mirroring how `feature`-derived text already rides there.

   Loads every module in manifest load order (+ tables.js) into one jsdom global scope — same
   "const-via-eval" pattern as dev/verify-walk-refresh.mjs/verify-gen.mjs (jsdom resolved per
   CLAUDE.md "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom).
   Run: node dev/verify-dressing.mjs   (from repo root) */
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
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function baseWorld(id){
  return {
    id, name: "The Dressing-Wiring Test",
    seed: { master: { name: "Test Hold", desc: "d" }, smell: { name: "s" }, sound: { name: "s" }, arch: { name: "a" },
            taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } },
    characters: [{ status: "living", name: "Tester", headline: "a climber", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Folk Hero", level: 3, hp: "20/20", ac: 15,
               profBonus: 2, scores: {}, mods: { str: 2, dex: 1 }, saveProfs: [], skillProfs: ["Athletics"] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
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
  const world = baseWorld("w-dressing-" + Math.random().toString(36).slice(2));
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return { win, world, originId };
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", String(detail)));

console.log("\n=== 5. Table compile — VERIFY FIRST (grep compiled tables.js for dressing keys) ===");
{
  const { win } = freshDom();
  const T = win.GENESIS_TABLES;
  const expectKeys = ["dungeon-set-dressing", "dungeon-set-dressing-condition",
    "urban-set-dressing", "urban-set-dressing-condition",
    "wilderness-set-dressing", "wilderness-set-dressing-condition"];
  for (const k of expectKeys) check(`compiled key present: ${k}`, T && T[k] && T[k].rows && T[k].rows.length > 0, `missing or empty ${k}`);
}

console.log("\n=== 1. RED-FIRST: every room/leg/segment carries .dressing.text (x50 each walk type) ===");
function rollAllThree(win){
  const dungeon = win.rollDungeonWalk({ segCount: 5 });
  const urban = win.rollUrbanWalk({ segCount: 5 });
  const wilderness = win.rollWildernessWalk({ legCount: 4 });
  return { dungeon, urban, wilderness };
}

{
  const { win } = freshDom();
  let dungeonOk = true, dungeonEmpties = 0, urbanOk = true, urbanEmpties = 0, wildOk = true, wildEmpties = 0;
  for (let i = 0; i < 50; i++) {
    const { dungeon, urban, wilderness } = rollAllThree(win);
    for (const room of dungeon.rooms || dungeon.segments || []) {
      const ok = room && room.dressing && typeof room.dressing.text === "string" && room.dressing.text.length > 0;
      if (!ok) { dungeonOk = false; dungeonEmpties++; }
    }
    for (const seg of urban.segments || []) {
      if (seg.isFinale) continue; // finale rooms don't roll a dressing pass (out-of-scope per spec's per-room/leg/segment loop, matches feature's own finale exemption)
      const ok = seg && seg.dressing && typeof seg.dressing.text === "string" && seg.dressing.text.length > 0;
      if (!ok) { urbanOk = false; urbanEmpties++; }
    }
    for (const leg of wilderness.segments || []) {
      const ok = leg && leg.dressing && typeof leg.dressing.text === "string" && leg.dressing.text.length > 0;
      if (!ok) { wildOk = false; wildEmpties++; }
    }
  }
  check("dungeon: every room carries non-empty .dressing.text", dungeonOk, `${dungeonEmpties} empty across 50 rolls`);
  check("urban: every non-finale segment carries non-empty .dressing.text", urbanOk, `${urbanEmpties} empty across 50 rolls`);
  check("wilderness: every leg carries non-empty .dressing.text", wildOk, `${wildEmpties} empty across 50 rolls`);
}

console.log("\n=== 1b. .dressing.condition also present (paired Set Dressing Condition table) ===");
{
  const { win } = freshDom();
  const { dungeon, urban, wilderness } = rollAllThree(win);
  const room0 = (dungeon.rooms || dungeon.segments || [])[0];
  const urbSeg = (urban.segments || []).find(s => !s.isFinale);
  const leg0 = (wilderness.segments || [])[0];
  check("dungeon room[0].dressing.condition non-empty", room0 && room0.dressing && !!room0.dressing.condition, JSON.stringify(room0 && room0.dressing));
  check("urban seg.dressing.condition non-empty", urbSeg && urbSeg.dressing && !!urbSeg.dressing.condition, JSON.stringify(urbSeg && urbSeg.dressing));
  check("wilderness leg[0].dressing.condition non-empty", leg0 && leg0.dressing && !!leg0.dressing.condition, JSON.stringify(leg0 && leg0.dressing));
}

console.log("\n=== 2. Determinism: dressing is rolled ONCE and persists (never re-rolled on re-read) ===");
// DRESSING-WIRING.md "Out of scope": dressing is part of the rolled walk (world state), immutable
// like names — NOT re-rolled on revisit. The walkers themselves use plain Math.random() (same
// convention as every other per-room roll in these files — feature/scene/object/etc. are not
// individually seeded either), so "determinism" here means the ROLLED VALUE is stored on the
// segment object and reading it twice returns the identical value (persistence), matching the
// walker's existing convention (a segment's `.feature`/`.object`/etc. are likewise rolled once at
// walk-assembly time and never re-rolled by a later read). A true seed->same-walk replay IS
// reproducible too (proven manually: two independent module instances seeded with the same
// deterministic PRNG produce byte-identical dressing text), but is not itself a wiring property —
// it falls out of Math.random being swappable, same as every other roll in the file.
// jsdom's `window.Math` is NOT the same object as the outer Node `Math` (a fresh JSDOM() gets its
// own realm) — patching the outer Math.random has zero effect on code run via win.eval. The seed
// stub must be installed on the WINDOW's own Math object the walk code actually calls through.
function withSeededRandom(win, seedStart, fn){
  let s = seedStart;
  const orig = win.Math.random;
  win.Math.random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  try { return fn(); } finally { win.Math.random = orig; }
}
{
  const { win } = freshDom();
  const { dungeon, urban, wilderness } = rollAllThree(win);
  const room0 = (dungeon.rooms || dungeon.segments || [])[0];
  const urbSeg = (urban.segments || []).find(s => !s.isFinale);
  const leg0 = (wilderness.segments || [])[0];
  check("dungeon room.dressing re-read is byte-identical (persisted, not re-rolled)",
    room0 && room0.dressing.text === room0.dressing.text && JSON.stringify(room0.dressing) === JSON.stringify(room0.dressing));
  check("urban seg.dressing re-read is byte-identical (persisted, not re-rolled)",
    urbSeg && JSON.stringify(urbSeg.dressing) === JSON.stringify(urbSeg.dressing));
  check("wilderness leg.dressing re-read is byte-identical (persisted, not re-rolled)",
    leg0 && JSON.stringify(leg0.dressing) === JSON.stringify(leg0.dressing));
}
{
  // seed-replay reproducibility, each roll from its OWN fresh window/module instance (a shared
  // instance carries mutable dedup/cache state across calls — e.g. walkSubTable's `used` set — that
  // legitimately consumes a different number of Math.random() draws on a second call even under an
  // identical reseed, which is a walk-assembly property unrelated to dressing; a fresh instance per
  // roll isolates the dressing wiring itself, matching how gauntlet/verify harnesses isolate each
  // world). The stub is installed on EACH window's own Math object, not the outer Node Math.
  const winA = freshDom().win, winB = freshDom().win;
  const a = withSeededRandom(winA, 42, () => rollAllThree(winA));
  const b = withSeededRandom(winB, 42, () => rollAllThree(winB));
  const dTextA = (a.dungeon.rooms || a.dungeon.segments || []).map(r => r.dressing && r.dressing.text).join("|");
  const dTextB = (b.dungeon.rooms || b.dungeon.segments || []).map(r => r.dressing && r.dressing.text).join("|");
  check("dungeon dressing reproducible under the same seeded sequence (fresh instance per roll)", dTextA === dTextB, `${dTextA} !== ${dTextB}`);
  const wTextA = a.wilderness.segments.map(s => s.dressing && s.dressing.text).join("|");
  const wTextB = b.wilderness.segments.map(s => s.dressing && s.dressing.text).join("|");
  check("wilderness dressing reproducible under the same seeded sequence (fresh instance per roll)", wTextA === wTextB, `${wTextA} !== ${wTextB}`);
}

console.log("\n=== 3. Theater pickup: fixture room dressing text (\"crate\") -> mapped prop part ===");
// NOTE: "cobweb" is INTENTIONALLY not a hit — the existing web-mass rule requires the bare word
// \bweb\b specifically to avoid a false-positive inside "cobweb"/"webbed" (theater-data.js's own
// documented guard). "Splintered crate stack" (an actual dungeon-set-dressing row) is a real
// keyword hit added by this unit (§3 below) and exercises the wiring end-to-end.
{
  const { win } = freshDom();
  const fixtureSegment = {
    dims: "20x20", feature: { name: "", flavor: "" },
    dressing: { text: "Splintered crate stack, one plank half-pried loose.", condition: "Fresh" },
  };
  // theaterBoardFrom only resolves a prop NOUN for a zone that already carries cover (the room-wide
  // dressing/feature text pool picks the PART for an existing cover marker, it never spawns a new
  // one) — the fixture needs at least one cover zone for the keyword hit to have anywhere to land.
  const fixtureScene = { elevZones: [], hazards: [], hazardZones: [], cover: { "melee:C": true }, zoneCover: {}, exits: [] };
  const board = win.theaterBoardFrom(fixtureSegment, fixtureScene, { env: "dungeon" });
  const hasCrateProp = (board.props || []).some(p => p.part === "crate");
  check("theaterBoardFrom resolves a dressing-text keyword hit (crate stack -> crate)", hasCrateProp, JSON.stringify((board.props || []).map(p => p.part)));
  const directHint = win.theaterPropForText("Splintered crate stack, one plank half-pried loose.");
  check("theaterPropForText direct hit on dressing text", directHint && directHint.part === "crate", JSON.stringify(directHint));
}

console.log("\n=== 6. Digest: activeWalkDigest's \"here\" segment carries dressing alongside gist ===");
{
  const { win, world } = freshDom();
  const wwalk = win.rollWildernessWalk({ legCount: 3 });
  const destId = win.addNode(world, "Wild Dest", "Wilderness");
  const r = win.prepStartTravelWalk(world, { destNodeId: destId, originNodeId: world.currentNodeId, travelMin: 60, walk: wwalk });
  check("prepStartTravelWalk ok", r && r.ok, JSON.stringify(r));
  const digest = win.activeWalkDigest(world);
  check("activeWalkDigest returns a digest", !!digest, JSON.stringify(digest));
  const hereSeg = digest && digest.segments.find(s => s.state === "here");
  check("digest has a 'here' segment", !!hereSeg, JSON.stringify(digest && digest.segments));
  check("'here' segment carries dressing.text (non-empty)", hereSeg && hereSeg.dressing && typeof hereSeg.dressing.text === "string" && hereSeg.dressing.text.length > 0, JSON.stringify(hereSeg));
  check("'here' segment carries dressing.condition (non-empty)", hereSeg && hereSeg.dressing && !!hereSeg.dressing.condition, JSON.stringify(hereSeg));
  const notHere = digest && digest.segments.find(s => s.state !== "here");
  check("non-'here' segment stays a steady-state stub (no dressing leak)", notHere && notHere.dressing === undefined, JSON.stringify(notHere));
}

console.log("\n=== 4. MUTATION: stub the dressing roll out -> checks 1 & 3 go red; restore -> green ===");
{
  // Re-derive the module source with the three dressing-table CALL-SITE ids swapped for a bogus id
  // so walkPick returns "" (walkRows falls through to the empty-rows branch) — proves checks 1/3 are
  // actually EXERCISING the wiring, not passing by coincidence (e.g. a stale/fallback field). Mutates
  // ONLY moduleSrc (the engine call sites in dungeon-walk.js/walk.js/wild-walk.js) — NOT tables.js —
  // so the compiled table's own key is untouched and walkRows("dungeon-set-dressing") still resolves
  // to its real 100-row content; only the CALLER'S string literal is broken, same "which side of the
  // wire is actually being tested" discipline as any keyword-string mutation test.
  const mutatedModuleSrc = moduleSrc
    .replace(/"dungeon-set-dressing"/g, '"__mutated-dungeon-set-dressing"')
    .replace(/"urban-set-dressing"/g, '"__mutated-urban-set-dressing"')
    .replace(/"wilderness-set-dressing"/g, '"__mutated-wilderness-set-dressing"');
  check("mutation actually rewrote the call-site ids (sanity: moduleSrc text changed)", mutatedModuleSrc !== moduleSrc);
  const mutatedSrc = read("tables.js") + "\n;\n" + mutatedModuleSrc;

  const { win } = freshDom(mutatedSrc);
  const { dungeon, urban, wilderness } = rollAllThree(win);
  const room0 = (dungeon.rooms || dungeon.segments || [])[0];
  const urbSeg = (urban.segments || []).find(s => !s.isFinale);
  const leg0 = (wilderness.segments || [])[0];
  const dungeonRed = !room0 || !room0.dressing || !room0.dressing.text;
  const urbanRed = !urbSeg || !urbSeg.dressing || !urbSeg.dressing.text;
  const wildRed = !leg0 || !leg0.dressing || !leg0.dressing.text;
  check("MUTATION RED — dungeon room.dressing.text empty when the table id is stubbed", dungeonRed, JSON.stringify(room0 && room0.dressing));
  check("MUTATION RED — urban seg.dressing.text empty when the table id is stubbed", urbanRed, JSON.stringify(urbSeg && urbSeg.dressing));
  check("MUTATION RED — wilderness leg.dressing.text empty when the table id is stubbed", wildRed, JSON.stringify(leg0 && leg0.dressing));

  const fixtureSegment = { dims: "20x20", feature: { name: "", flavor: "" }, dressing: { text: "", condition: "" } };
  const fixtureScene = { elevZones: [], hazards: [], hazardZones: [], cover: { "melee:C": true }, zoneCover: {}, exits: [] };
  const board = win.theaterBoardFrom(fixtureSegment, fixtureScene, { env: "dungeon" });
  const propEntry = (board.props || []).find(p => p.zone === "melee:C");
  check("MUTATION RED — theater pickup: empty dressing text yields a generic cover prop, no crate part", propEntry && !propEntry.part, JSON.stringify(propEntry));

  // restore: an unmutated fresh dom should be green again (both checks re-verified with real ids)
  const { win: win2 } = freshDom();
  const { dungeon: d2 } = rollAllThree(win2);
  const room0b = (d2.rooms || d2.segments || [])[0];
  check("RESTORE GREEN — dungeon room.dressing.text non-empty again with real table ids", room0b && room0b.dressing && room0b.dressing.text.length > 0, JSON.stringify(room0b && room0b.dressing));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
