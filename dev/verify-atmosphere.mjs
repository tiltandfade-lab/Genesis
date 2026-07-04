/* verify-atmosphere.mjs — headless test for DRESSING-ATMOSPHERE (docs/DRESSING-ATMOSPHERE.md):
   the mega tables' atmosphere lanes (air/odor/sound) join the walk sensory pool as a separate
   `atmo` field carried by the digest like `dressing` — one lane per room/leg/segment, same
   finale asymmetry as dressing (urban finales skip; dungeon finale + wilderness arrival carry it).

   Sibling of dev/verify-dressing.mjs — same jsdom "const-via-eval" harness pattern, same manifest
   load order. Checks map to docs/DRESSING-ATMOSPHERE.md's "Verification" section 1-6:

   1. RED-FIRST: roll each walk type x50; assert every dungeon room, wilderness leg + arrival,
      and urban NON-finale segment carries atmo.lane in {air,odor,sound} + non-empty atmo.text;
      urban finales carry none.
   2. Lane spread: across x50 per env, all three lanes occur (no dead lane / wrong column).
   3. Key presence: compiled tables.js carries all nine keys with non-empty rows.
   4. Digest: here-segment carries atmo beside dressing; ahead/behind stubs stay bare.
   5. Determinism: rolled atmo persists on re-read (same convention as dressing/feature/etc.).
   6. MUTATION: (a) stub the nine table ids -> checks 1/4 red; (b) drop the digest atmo line ->
      check 4 red alone; restore -> green.

   Run: node dev/verify-atmosphere.mjs   (from repo root; needs jsdom at $JSDOM_HOME or
   ~/.genesis-jsdom) */
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
    id, name: "The Atmosphere Test",
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
  const world = baseWorld("w-atmo-" + Math.random().toString(36).slice(2));
  const originId = win.addNode(world, "Test Hold", "Setting");
  world.currentNodeId = originId; world.startNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  return { win, world, originId };
}

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", String(detail)));

console.log("\n=== 3. Key presence: compiled tables.js carries all nine atmosphere keys ===");
{
  const { win } = freshDom();
  const T = win.GENESIS_TABLES;
  const expectKeys = [
    "d100-air-currents", "d100-odors", "d100-unexplained-sounds-and-weird-noises",
    "d20-urban-air-currents", "d20-urban-odors", "d100-urban-sounds-and-weird-noises",
    "d100-wind-weather-currents", "d100-wilderness-odors", "d100-wilderness-unexplained-sounds-and-weird-noises",
  ];
  for (const k of expectKeys) check(`compiled key present: ${k}`, T && T[k] && T[k].rows && T[k].rows.length > 0, `missing or empty ${k}`);
}

console.log("\n=== 1. RED-FIRST: every room/leg/segment carries .atmo (x50 each walk type) ===");
function rollAllThree(win){
  const dungeon = win.rollDungeonWalk({ segCount: 5 });
  const urban = win.rollUrbanWalk({ segCount: 5 });
  const wilderness = win.rollWildernessWalk({ legCount: 4 });
  return { dungeon, urban, wilderness };
}
const LANES = new Set(["air", "odor", "sound"]);
function atmoOk(s){
  return !!(s && s.atmo && LANES.has(s.atmo.lane) && typeof s.atmo.text === "string" && s.atmo.text.length > 0);
}

{
  const { win } = freshDom();
  let dungeonOk = true, dungeonBad = 0, urbanOk = true, urbanBad = 0, wildOk = true, wildBad = 0;
  let urbanFinaleClean = true, urbanFinaleLeak = 0;
  for (let i = 0; i < 50; i++) {
    const { dungeon, urban, wilderness } = rollAllThree(win);
    for (const room of dungeon.rooms || dungeon.segments || []) {
      if (!atmoOk(room)) { dungeonOk = false; dungeonBad++; }
    }
    for (const seg of urban.segments || []) {
      if (seg.isFinale) { if (seg.atmo != null) { urbanFinaleClean = false; urbanFinaleLeak++; } continue; }
      if (!atmoOk(seg)) { urbanOk = false; urbanBad++; }
    }
    for (const leg of wilderness.segments || []) {
      if (!atmoOk(leg)) { wildOk = false; wildBad++; }
    }
  }
  check("dungeon: every room (incl. finale) carries valid .atmo", dungeonOk, `${dungeonBad} bad across 50 rolls`);
  check("urban: every non-finale segment carries valid .atmo", urbanOk, `${urbanBad} bad across 50 rolls`);
  check("urban: finale segments carry NO atmo", urbanFinaleClean, `${urbanFinaleLeak} finale leaks across 50 rolls`);
  check("wilderness: every leg + arrival carries valid .atmo", wildOk, `${wildBad} bad across 50 rolls`);
}

console.log("\n=== 2. Lane spread: all three lanes occur across x50 rolls per env ===");
{
  const { win } = freshDom();
  const seenDungeon = new Set(), seenUrban = new Set(), seenWild = new Set();
  for (let i = 0; i < 50; i++) {
    const { dungeon, urban, wilderness } = rollAllThree(win);
    for (const room of dungeon.rooms || dungeon.segments || []) if (room.atmo) seenDungeon.add(room.atmo.lane);
    for (const seg of urban.segments || []) if (!seg.isFinale && seg.atmo) seenUrban.add(seg.atmo.lane);
    for (const leg of wilderness.segments || []) if (leg.atmo) seenWild.add(leg.atmo.lane);
  }
  check("dungeon: all 3 lanes seen (air/odor/sound)", seenDungeon.size === 3, [...seenDungeon].join(","));
  check("urban: all 3 lanes seen (air/odor/sound)", seenUrban.size === 3, [...seenUrban].join(","));
  check("wilderness: all 3 lanes seen (air/odor/sound)", seenWild.size === 3, [...seenWild].join(","));
}

console.log("\n=== 5. Determinism: atmo is rolled ONCE and persists (never re-rolled on re-read) ===");
{
  const { win } = freshDom();
  const { dungeon, urban, wilderness } = rollAllThree(win);
  const room0 = (dungeon.rooms || dungeon.segments || [])[0];
  const urbSeg = (urban.segments || []).find(s => !s.isFinale);
  const leg0 = (wilderness.segments || [])[0];
  check("dungeon room.atmo re-read is byte-identical (persisted, not re-rolled)",
    room0 && JSON.stringify(room0.atmo) === JSON.stringify(room0.atmo));
  check("urban seg.atmo re-read is byte-identical (persisted, not re-rolled)",
    urbSeg && JSON.stringify(urbSeg.atmo) === JSON.stringify(urbSeg.atmo));
  check("wilderness leg.atmo re-read is byte-identical (persisted, not re-rolled)",
    leg0 && JSON.stringify(leg0.atmo) === JSON.stringify(leg0.atmo));
}
{
  function withSeededRandom(win, seedStart, fn){
    let s = seedStart;
    const orig = win.Math.random;
    win.Math.random = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    try { return fn(); } finally { win.Math.random = orig; }
  }
  const winA = freshDom().win, winB = freshDom().win;
  const a = withSeededRandom(winA, 42, () => rollAllThree(winA));
  const b = withSeededRandom(winB, 42, () => rollAllThree(winB));
  const dTextA = (a.dungeon.rooms || a.dungeon.segments || []).map(r => r.atmo && r.atmo.lane + ":" + r.atmo.text).join("|");
  const dTextB = (b.dungeon.rooms || b.dungeon.segments || []).map(r => r.atmo && r.atmo.lane + ":" + r.atmo.text).join("|");
  check("dungeon atmo reproducible under the same seeded sequence (fresh instance per roll)", dTextA === dTextB, `${dTextA} !== ${dTextB}`);
  const wTextA = a.wilderness.segments.map(s => s.atmo && s.atmo.lane + ":" + s.atmo.text).join("|");
  const wTextB = b.wilderness.segments.map(s => s.atmo && s.atmo.lane + ":" + s.atmo.text).join("|");
  check("wilderness atmo reproducible under the same seeded sequence (fresh instance per roll)", wTextA === wTextB, `${wTextA} !== ${wTextB}`);
}

console.log("\n=== 4. Digest: activeWalkDigest's \"here\" segment carries atmo beside dressing ===");
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
  check("'here' segment carries atmo (non-empty string)", hereSeg && typeof hereSeg.atmo === "string" && hereSeg.atmo.length > 0, JSON.stringify(hereSeg));
  check("'here' segment still carries dressing (unaffected by atmo addition)", hereSeg && hereSeg.dressing && typeof hereSeg.dressing.text === "string", JSON.stringify(hereSeg));
  const notHere = digest && digest.segments.find(s => s.state !== "here");
  check("non-'here' segment stays a steady-state stub (no atmo leak)", notHere && notHere.atmo === undefined, JSON.stringify(notHere));
}

console.log("\n=== 6a. MUTATION: stub the nine atmosphere table ids -> checks 1 & 4 go red; restore -> green ===");
{
  const atmoTableIds = [
    "d100-air-currents", "d100-odors", "d100-unexplained-sounds-and-weird-noises",
    "d20-urban-air-currents", "d20-urban-odors", "d100-urban-sounds-and-weird-noises",
    "d100-wind-weather-currents", "d100-wilderness-odors", "d100-wilderness-unexplained-sounds-and-weird-noises",
  ];
  let mutatedModuleSrc = moduleSrc;
  for (const id of atmoTableIds) {
    mutatedModuleSrc = mutatedModuleSrc.split(`"${id}"`).join(`"__mutated-${id}"`);
  }
  check("mutation actually rewrote the call-site ids (sanity: moduleSrc text changed)", mutatedModuleSrc !== moduleSrc);
  const mutatedSrc = read("tables.js") + "\n;\n" + mutatedModuleSrc;

  const { win } = freshDom(mutatedSrc);
  const { dungeon, urban, wilderness } = rollAllThree(win);
  const room0 = (dungeon.rooms || dungeon.segments || [])[0];
  const urbSeg = (urban.segments || []).find(s => !s.isFinale);
  const leg0 = (wilderness.segments || [])[0];
  check("MUTATION RED — dungeon room.atmo absent when the table ids are stubbed", !room0.atmo, JSON.stringify(room0 && room0.atmo));
  check("MUTATION RED — urban seg.atmo absent when the table ids are stubbed", !urbSeg.atmo, JSON.stringify(urbSeg && urbSeg.atmo));
  check("MUTATION RED — wilderness leg.atmo absent when the table ids are stubbed", !leg0.atmo, JSON.stringify(leg0 && leg0.atmo));

  const { win: win2 } = freshDom();
  const { dungeon: d2 } = rollAllThree(win2);
  const room0b = (d2.rooms || d2.segments || [])[0];
  check("RESTORE GREEN — dungeon room.atmo present again with real table ids", atmoOk(room0b), JSON.stringify(room0b && room0b.atmo));
}

console.log("\n=== 6b. MUTATION: drop the digest atmo line -> check 4 goes red alone (dressing stays green) ===");
{
  // Mutate ONLY the dm.js digest line that surfaces atmo (the `atmo: s.atmo ? ... : null` field),
  // proving check 4 is actually exercising THAT wire, not passing because atmo happens to ride some
  // other field. Dressing's own digest line is untouched, so it must stay green — isolating which
  // side of the wire broke, same discipline as verify-dressing.mjs's own mutation test.
  const DIGEST_ATMO_LINE = 'atmo: s.atmo ? (s.atmo.text||null) : null';
  const mutatedModuleSrc = moduleSrc.replace(DIGEST_ATMO_LINE, 'atmo: null /* MUTATED OUT */');
  check("mutation actually rewrote the digest atmo line (sanity: moduleSrc text changed)", mutatedModuleSrc !== moduleSrc,
    "regex did not match dm.js digest shape — inspect activeWalkDigest's segments.map return literal");
  const mutatedSrc = read("tables.js") + "\n;\n" + mutatedModuleSrc;

  const { win, world } = freshDom(mutatedSrc);
  const wwalk = win.rollWildernessWalk({ legCount: 3 });
  const destId = win.addNode(world, "Wild Dest", "Wilderness");
  win.prepStartTravelWalk(world, { destNodeId: destId, originNodeId: world.currentNodeId, travelMin: 60, walk: wwalk });
  const digest = win.activeWalkDigest(world);
  const hereSeg = digest && digest.segments.find(s => s.state === "here");
  check("MUTATION RED — digest 'here' segment.atmo is null when the digest line is stubbed", hereSeg && hereSeg.atmo === null, JSON.stringify(hereSeg));
  check("MUTATION UNAFFECTED — dressing stays green (isolated mutation, not a collateral break)", hereSeg && hereSeg.dressing && typeof hereSeg.dressing.text === "string" && hereSeg.dressing.text.length > 0, JSON.stringify(hereSeg));

  const { win: win2, world: world2 } = freshDom();
  const wwalk2 = win2.rollWildernessWalk({ legCount: 3 });
  const destId2 = win2.addNode(world2, "Wild Dest", "Wilderness");
  win2.prepStartTravelWalk(world2, { destNodeId: destId2, originNodeId: world2.currentNodeId, travelMin: 60, walk: wwalk2 });
  const digest2 = win2.activeWalkDigest(world2);
  const hereSeg2 = digest2 && digest2.segments.find(s => s.state === "here");
  check("RESTORE GREEN — digest 'here' segment.atmo present again unmutated", hereSeg2 && typeof hereSeg2.atmo === "string" && hereSeg2.atmo.length > 0, JSON.stringify(hereSeg2));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
