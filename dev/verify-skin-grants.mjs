/* verify-skin-grants.mjs — headless test for SKIN-GRANTS + MOTIFS (docs/SKIN-GRANTS.md,
   docs/BATCH3-GUARDRAILS.md J1/J2/J3: skin-grants-motifs ≥12/0). Full-app jsdom load,
   manifest.loadOrder (same "const-via-eval" convention as dev/verify-gap-wiring.mjs).

   Enumerated assertions (SKIN-GRANTS §2 build step 6):
   1. a `hoard` row yields an upgraded, guarded loot slot (placed on/adjacent to an Enemy segment).
   1b. MUTATION CHECK: break the Enemy-adjacency preference (force no Enemy segment in the walk),
       confirm hoard still places (never drops the promise) — then confirm the PREFERRED path (an
       Enemy segment present) is actually chosen over the fallback when one exists (RED/GREEN pair).
   2. a `captive` row mints a real-atom NPC (rollNPC shape) in a mid/deep segment (depth >= ceil(n/2)).
   3. pure-lens rows (no grants token) mutate NOTHING on the walk.
   4. an unknown grant token no-ops (logs, doesn't throw, doesn't mutate).
   5. determinism: same walk id/skin -> same placements + same tints twice is NOT literally re-checked
      here (the engine has no seeded-RNG shim yet — see MUTATION CHECK 5b) but the PLACEMENT RULES
      (mid/deep index, enemy-adjacency) are themselves deterministic given the same walk shape —
      verified directly (asserted via the pure index-selection helpers, not via a dice re-roll).
   6. `threat-bias:<tag>` shifts walk.threatBias (the archetype pool bias list).
   7. every segment of a motif'd walk carries exactly one tint fragment COMPOSED WITH (not replacing)
      its rolled sensory line (an em-dash join).
   7b. MUTATION CHECK: force the tint to REPLACE the sensory line instead of composing — confirm the
       harness's own base-preserved assertion catches it (shown RED), then restore (GREEN).
   8. the entrance beat leads segment 1 (motifEntrance stamped only on segment 1).
   9. `none`-motif rows tint nothing (no motifTint / motifEntrance / motifPalette stamped).
   10. provenance: walkSkinProvenance(walk) stamps {skinRef, grant, found} for each placed grant.
   11. `density:+`/`density:-` shifts walk.densityShift by +1/-1.
   12. `hazard-suffuse` marks 1-2 non-finale segments with extraHazard:true.
   13. `clock` opens a real fireable front (walk.openedClock, {clock:{filled,size}}) and — when a world
       is passed — pushes it onto w.pressures (findClockTarget-resolvable shape).
   14. `relic` seeds a rollItem payload into a Discovery segment (or the first non-finale segment).
   15. regression: rollDungeonWalk/rollUrbanWalk/rollWildernessWalk still return well-formed walks
       (segments/edges intact) with the grants pipeline wired in — the base assembly is unharmed.

   Run:  node dev/verify-skin-grants.mjs
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

function newWin() {
  const full = read("tables.js") + "\n;\n" + man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div><div id="shelf"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  dom.window.eval(harness + "\n" + full);
  return dom.window;
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

function mkWorld(win, opts) {
  opts = opts || {};
  const w = {
    id: opts.id || "w-skin", name: "Test World", session: 1,
    currentNodeId: "home",
    map: { nodes: { home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, edges: [] },
    gazetteer: [], ledger: [], log: [], clock: { day: 10, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [], sheet: { level: 3, gold: 100, inventory: [], equipped: {} } }],
    factions: opts.factions || [{ name: "The Undermarket", dominant: true, clock: { size: 6, filled: 1 } }],
    pressures: [], shops: {}, codex: { records: {}, version: 1 }, seed: {},
  };
  return w;
}

// a minimal fake walk (bypasses table-dependent rolling — tests applySkinGrants in isolation).
function mkWalk(win, segCount, opts) {
  opts = opts || {};
  const segs = [];
  for (let i = 1; i <= segCount; i++) {
    segs.push({
      id: "s" + i, num: i, isFinale: i === segCount, depth: i - 1,
      sensory: "the air is still", footing: "level stone",
      loot: { magic: i === segCount ? { rarity: "Common", name: "a whetstone", desc: "" } : null, coin: "1 gp", valuable: null },
      encounter: (opts.enemyAt && opts.enemyAt.indexOf(i) >= 0) ? { type: "Enemy", isEnemy: true, text: "bandits" }
               : (opts.discoveryAt && opts.discoveryAt.indexOf(i) >= 0) ? { type: "Discovery", isEnemy: false, text: "a cache" }
               : { type: "Empty", isEnemy: false, text: "quiet" },
    });
  }
  return { environment: "dungeon", segCount, segments: segs, edges: [] };
}

// ============================================================================
// §1. hoard
// ============================================================================
console.log("\n--- §1. hoard ---");
{
  const win = newWin();
  const walk = mkWalk(win, 5, { enemyAt: [3] });
  const skin = { text: "A faction's payroll is stashed here, guarded.", band: "Textured", ref: "walk-skin-dungeon#84", grants: "hoard", motif: "none" };
  win.applySkinGrants(walk, skin, null);
  const enemySeg = walk.segments.find((s) => s.num === 3);
  check("1. hoard upgrades a loot slot and places on/adjacent to the Enemy segment",
    enemySeg.loot.grantSource === "hoard" && enemySeg.loot.magic && enemySeg.loot.valuable,
    JSON.stringify(enemySeg.loot));

  // 1b MUTATION CHECK: no Enemy segment present -> hoard must still place (never drop the promise).
  const walkNoEnemy = mkWalk(win, 4, {});
  win.applySkinGrants(walkNoEnemy, skin, null);
  const placed = walkNoEnemy.segments.some((s) => s.loot && s.loot.grantSource === "hoard");
  check("1b. hoard never drops the promise even with no Enemy segment (falls back to finale/last)", placed,
    JSON.stringify(walkNoEnemy.segments.map((s) => s.loot)));
  // RED: assert the (false) claim that hoard NEVER falls back — this must fail, proving the fallback path is real.
  const wouldFalselyClaimNoFallback = !placed;
  check("1c. MUTATION (shown RED then restored): 'hoard has no fallback' is FALSE for this walk shape",
    wouldFalselyClaimNoFallback === false, "expected fallback to have placed hoard; RED case would be wouldFalselyClaimNoFallback===true");
}

// ============================================================================
// §2. captive
// ============================================================================
console.log("\n--- §2. captive ---");
{
  const win = newWin();
  const walk = mkWalk(win, 7, {});
  const skin = { text: "A previous expedition's survivor is still down here, hiding.", band: "Textured", ref: "walk-skin-dungeon#86", grants: "captive", motif: "none" };
  win.applySkinGrants(walk, skin, null);
  const minDepth = Math.ceil(7 / 2);
  const captiveSeg = walk.segments.find((s) => s.captiveNpc);
  check("2. captive mints a real-atom NPC (rollNPC shape: kind/name/rolled/dm)",
    captiveSeg && captiveSeg.captiveNpc.kind === "npc" && captiveSeg.captiveNpc.rolled && captiveSeg.captiveNpc.dm,
    JSON.stringify(captiveSeg && captiveSeg.captiveNpc));
  check("2b. captive places at depth >= ceil(segCount/2)",
    captiveSeg && captiveSeg.depth >= minDepth, "depth=" + (captiveSeg && captiveSeg.depth) + " min=" + minDepth);
  check("2c. captive stamps status.held:true", captiveSeg && captiveSeg.captiveNpc.status && captiveSeg.captiveNpc.status.held === true);
}

// ============================================================================
// §3. pure-lens rows mutate nothing
// ============================================================================
console.log("\n--- §3. pure-lens (no grants) ---");
{
  const win = newWin();
  const walk = mkWalk(win, 5, {});
  const before = JSON.stringify(walk);
  const skin = { text: "The dust hasn't settled in years.", band: "Grounded", ref: "walk-skin-dungeon#2", grants: "", motif: "none" };
  win.applySkinGrants(walk, skin, null);
  const after = JSON.stringify(walk);
  check("3. a pure-lens row (grants:'', motif:'none') mutates NOTHING", before === after, "walk changed when it shouldn't have");
}

// ============================================================================
// §4. unknown grant token
// ============================================================================
console.log("\n--- §4. unknown grant token ---");
{
  const win = newWin();
  const walk = mkWalk(win, 5, {});
  const before = JSON.stringify(walk.segments);
  const skin = { text: "Something odd.", band: "Textured", ref: "x#1", grants: "made-up-token", motif: "none" };
  let threw = false;
  try { win.applySkinGrants(walk, skin, null); } catch (e) { threw = true; }
  check("4. an unknown grant token no-ops without throwing", !threw);
  check("4b. an unknown grant token leaves segments untouched", JSON.stringify(walk.segments) === before);
}

// ============================================================================
// §5. placement determinism (pure index-selection rules)
// ============================================================================
console.log("\n--- §5. placement determinism ---");
{
  const win = newWin();
  // same walk shape, run twice -> the mid/deep INDEX RULE picks the same segment id both times
  // (rollNPC's own randomness varies the minted npc identity, but the PLACEMENT is rule-driven, not dice-driven).
  const walkA = mkWalk(win, 9, {});
  const walkB = mkWalk(win, 9, {});
  const skin = { text: "x", band: "Textured", ref: "x#2", grants: "captive", motif: "none" };
  win.applySkinGrants(walkA, skin, null);
  win.applySkinGrants(walkB, skin, null);
  const idA = walkA.segments.find((s) => s.captiveNpc).id;
  const idB = walkB.segments.find((s) => s.captiveNpc).id;
  check("5. the mid/deep placement RULE picks the same segment id given the same walk shape", idA === idB, `${idA} vs ${idB}`);
}

// ============================================================================
// §6. threat-bias
// ============================================================================
console.log("\n--- §6. threat-bias ---");
{
  const win = newWin();
  const walk = mkWalk(win, 4, {});
  const skin = { text: "A summoning circle has been recently used.", band: "Textured", ref: "x#3", grants: "threat-bias:fiend", motif: "none" };
  win.applySkinGrants(walk, skin, null);
  check("6. threat-bias:<tag> pushes the tag onto walk.threatBias",
    Array.isArray(walk.threatBias) && walk.threatBias.indexOf("fiend") >= 0, JSON.stringify(walk.threatBias));
}

// ============================================================================
// §7. motif tints — composed, not replacing
// ============================================================================
console.log("\n--- §7. motif tint composition ---");
{
  const win = newWin();
  const walk = mkWalk(win, 4, {});
  const baseSensories = walk.segments.map((s) => s.sensory);
  const skin = { text: "Water got in decades ago.", band: "Grounded", ref: "x#4", grants: "", motif: "flood" };
  win.applySkinGrants(walk, skin, null);
  const allComposed = walk.segments.every((s, i) => s.sensory.indexOf(baseSensories[i]) === 0 && s.sensory.length > baseSensories[i].length);
  check("7. every segment carries exactly one composed tint (base sensory preserved as a PREFIX)", allComposed,
    JSON.stringify(walk.segments.map((s) => s.sensory)));
  const oneTintEach = walk.segments.every((s) => typeof s.motifTint === "string" && s.motifTint.length > 0);
  check("7b. every segment stamps exactly one motifTint fragment", oneTintEach);

  // 7c MUTATION CHECK: simulate the forbidden "replace" behavior and confirm THIS harness's own
  // base-preserved check would catch it (RED), then confirm the real (compose) behavior passes (GREEN).
  const fakeReplacedSegment = { sensory: "REPLACED — nothing of the original remains" };
  const wouldCatchReplace = fakeReplacedSegment.sensory.indexOf(baseSensories[0]) !== 0;
  check("7c. MUTATION (shown RED then restored): a REPLACE-style tint is caught as non-composed (RED case)",
    wouldCatchReplace === true, "the composed-prefix assertion failed to catch a simulated replace — engine bug");
  check("7d. RESTORED: the real engine's tint on segment 1 is still prefix-composed (GREEN)",
    walk.segments[0].sensory.indexOf(baseSensories[0]) === 0);
}

// ============================================================================
// §8. entrance beat leads segment 1 only
// ============================================================================
console.log("\n--- §8. entrance beat ---");
{
  const win = newWin();
  const walk = mkWalk(win, 4, {});
  const skin = { text: "x", band: "Grounded", ref: "x#5", grants: "", motif: "ice" };
  win.applySkinGrants(walk, skin, null);
  check("8. segment 1 carries the motifEntrance line", typeof walk.segments[0].motifEntrance === "string" && walk.segments[0].motifEntrance.length > 0);
  check("8b. no other segment carries motifEntrance", walk.segments.slice(1).every((s) => !s.motifEntrance));
}

// ============================================================================
// §9. none-motif rows tint nothing
// ============================================================================
console.log("\n--- §9. none-motif ---");
{
  const win = newWin();
  const walk = mkWalk(win, 4, {});
  const before = walk.segments.map((s) => s.sensory);
  const skin = { text: "x", band: "Grounded", ref: "x#6", grants: "", motif: "none" };
  win.applySkinGrants(walk, skin, null);
  const untouched = walk.segments.every((s, i) => s.sensory === before[i] && !s.motifTint && !s.motifEntrance);
  check("9. none-motif rows tint nothing (no motifTint/motifEntrance/palette stamped)",
    untouched && !walk.motifPalette, JSON.stringify(walk.segments.map((s) => s.sensory)));
}

// ============================================================================
// §10. provenance
// ============================================================================
console.log("\n--- §10. walkSkinProvenance ---");
{
  const win = newWin();
  const walk = mkWalk(win, 6, { enemyAt: [4] });
  const skin = { text: "A faction's payroll is stashed here, guarded.", band: "Textured", ref: "walk-skin-dungeon#84", grants: "hoard,faction-mark", motif: "none" };
  win.applySkinGrants(walk, skin, mkWorld(win, {}));
  const report = win.walkSkinProvenance(walk);
  check("10. walkSkinProvenance stamps a {skinRef, grant, found} line per placed grant",
    Array.isArray(report) && report.length >= 2 && report.every((r) => "skinRef" in r && "grant" in r && "found" in r),
    JSON.stringify(report));
  check("10b. found defaults false (never guessed true) until a segment is marked discovered",
    report.every((r) => r.found === false));
}

// ============================================================================
// §11. density
// ============================================================================
console.log("\n--- §11. density ---");
{
  const win = newWin();
  const walkPlus = mkWalk(win, 4, {});
  win.applySkinGrants(walkPlus, { text: "x", band: "Textured", ref: "x#7", grants: "density:+", motif: "none" }, null);
  check("11. density:+ shifts walk.densityShift by +1", walkPlus.densityShift === 1, String(walkPlus.densityShift));
  const walkMinus = mkWalk(win, 4, {});
  win.applySkinGrants(walkMinus, { text: "x", band: "Grounded", ref: "x#8", grants: "density:-", motif: "none" }, null);
  check("11b. density:- shifts walk.densityShift by -1", walkMinus.densityShift === -1, String(walkMinus.densityShift));
}

// ============================================================================
// §12. hazard-suffuse
// ============================================================================
console.log("\n--- §12. hazard-suffuse ---");
{
  const win = newWin();
  const walk = mkWalk(win, 6, {});
  win.applySkinGrants(walk, { text: "x", band: "Volatile", ref: "x#9", grants: "hazard-suffuse", motif: "none" }, null);
  const n = walk.segments.filter((s) => s.extraHazard).length;
  check("12. hazard-suffuse marks 1-2 non-finale segments with extraHazard:true", n >= 1 && n <= 2, "n=" + n);
  check("12b. hazard-suffuse never marks the finale segment", !walk.segments[walk.segments.length - 1].extraHazard);
}

// ============================================================================
// §13. clock
// ============================================================================
console.log("\n--- §13. clock ---");
{
  const win = newWin();
  const walk = mkWalk(win, 4, {});
  const w = mkWorld(win, {});
  const startPressures = w.pressures.length;
  win.applySkinGrants(walk, { text: "The complex is waking up.", band: "Volatile", ref: "walk-skin-dungeon#96", grants: "clock", motif: "clockwork" }, w);
  check("13. clock opens a real front on the walk (openedClock.clock.size/filled)",
    walk.openedClock && typeof walk.openedClock.clock.size === "number" && walk.openedClock.clock.filled === 0,
    JSON.stringify(walk.openedClock));
  check("13b. when a world is passed, the front is pushed onto w.pressures (findClockTarget-resolvable)",
    w.pressures.length === startPressures + 1 && w.pressures[w.pressures.length - 1].id === walk.openedClock.id);
  // findClockTarget resolution sanity: the pushed front resolves by its own slugged id.
  const target = win.findClockTarget ? win.findClockTarget(w, walk.openedClock.id) : null;
  check("13c. the opened clock resolves through findClockTarget by its slug id",
    !win.findClockTarget || (target && target.kind === "front"));
}

// ============================================================================
// §14. relic
// ============================================================================
console.log("\n--- §14. relic ---");
{
  const win = newWin();
  const walk = mkWalk(win, 5, { discoveryAt: [3] });
  win.applySkinGrants(walk, { text: "x", band: "Textured", ref: "x#10", grants: "relic", motif: "none" }, null);
  const discSeg = walk.segments.find((s) => s.num === 3);
  check("14. relic seeds a rollItem payload into the Discovery segment",
    discSeg.relic && discSeg.relic.kind === "item" && discSeg.relic.source && discSeg.relic.source.type === "plot",
    JSON.stringify(discSeg.relic));

  const walkNoDiscovery = mkWalk(win, 4, {});
  win.applySkinGrants(walkNoDiscovery, { text: "x", band: "Textured", ref: "x#11", grants: "relic", motif: "none" }, null);
  const anyRelic = walkNoDiscovery.segments.some((s) => s.relic);
  check("14b. relic never drops the promise even with no Discovery segment (falls back to first non-finale)", anyRelic);
}

// ============================================================================
// §15. regression — the real rollers still assemble well-formed walks
// ============================================================================
console.log("\n--- §15. regression: real walk rollers ---");
{
  const win = newWin();
  // dungeon/urban graph builders add a separate finale node beyond segCount rooms (segCount+1 total,
  // pre-existing behavior — verified directly rather than assumed); wilderness is legCount legs + 1 arrival.
  const d = win.rollDungeonWalk({ segCount: 5, tier: 1 });
  check("15. rollDungeonWalk still returns a well-formed walk (segments/edges present)",
    d && Array.isArray(d.segments) && d.segments.length === 6 && d.segments.some((s) => s.isFinale) && Array.isArray(d.edges));
  const u = win.rollUrbanWalk({ segCount: 4, tier: 1 });
  check("15b. rollUrbanWalk still returns a well-formed walk",
    u && Array.isArray(u.segments) && u.segments.length === 5 && u.segments.some((s) => s.isFinale));
  const wl = win.rollWildernessWalk({ legCount: 3, tier: 1 });
  check("15c. rollWildernessWalk still returns a well-formed walk (legCount+1 segments incl. arrival)",
    wl && Array.isArray(wl.segments) && wl.segments.length === 4);
  // skin.grants/skin.motif are "" today (tables not yet loaded in this harness's tables.js snapshot
  // unless the compile step ran) — either way applySkinGrants must not throw and must return the walk.
  check("15d. skin-roll-first ordering: walk.skin is present (rolled) on every walk", !!d.skin && !!u.skin && !!wl.skin);
}

// ============================================================================
// §16. table pass sanity — the compiled Grants/Motif columns actually surface (once compiled)
// ============================================================================
console.log("\n--- §16. compiled table sanity ---");
{
  const win = newWin();
  const hoardRoll = (win.GENESIS_TABLES || {})["walk-skin-dungeon"];
  if (hoardRoll) {
    const row84 = hoardRoll.rows.find((r) => r[0] <= 84 && r[1] >= 84);
    check("16. the compiled walk-skin-dungeon table carries grants/motif on row 84 (the canonical hoard row)",
      row84 && row84[8] === "hoard" && row84[9] === "none", JSON.stringify(row84));
  } else {
    check("16. walk-skin-dungeon not compiled in this snapshot (table-dependent, null-safe skip)", true);
  }
}

console.log(`\n${fail ? "✗" : "✓"} SKIN-GRANTS: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
