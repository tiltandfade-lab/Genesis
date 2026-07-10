/* Verify PLACE-GEN.md ADDENDUM §7 unit 10 — DM digest exposure: the digest's location LINE gains
   archetype label + GRID-LAW dims (in feet) + a compact dressing summary (<=3 prop names) when
   w.currentNodeId is bound to a typed place record (the SAME theaterNodeSourceFor lookup
   src/world/render.js's tray uses — "one derivation, prose and tray can never disagree").

   Full-app jsdom load (manifest loadOrder), same convention as dev/verify-place-tray.mjs/
   dev/verify-place-dressing.mjs — needs render.js (theaterNodeSourceFor) and place-skins.js
   (sceneDressingForPlace) loaded, which dev/verify-digest-diet.mjs's narrower eval harness does not.

   Checks:
     (a) typed-node fixture (gloom Watering-hole, archetypeKey 2): dmDigest().location contains the
         archetype label AND the dims in feet (dims.w*5 x dims.d*5, GRID LAW: dims are CELL counts)
         AND is <=120 bytes longer than the untyped baseline string.
     (b) untyped-node fixture (no codex place mint at all): dmDigest().location is BYTE-IDENTICAL to
         the pre-unit-10 golden (nodeName(w,id) alone) — zero bytes added.
     (c) 50-record budget: the SAME measurement dev/verify-digest-diet.mjs's own size guard runs,
         with a typed node bound at w.currentNodeId in the mix — total digest still stays under its
         12 KB budget.
     (d) MUTATION (shown RED then restored): stub theaterNodeSourceFor to always return null (the
         mapOf/codexGet lookup failing) -> (a) fails (location degrades to the bare name) — proves
         the digest actually reads the tray's own record lookup, not a parallel copy.

   RED-FIRST (a): captured failing against a stash of the pre-unit-10 dm.js (location was a bare
   nodeName() string with no archetype/dims/dressing rider at all) — see the task report for both
   console tails (red capture + green capture after `dmDigestLocationLine` landed).

   Run:  node dev/verify-place-digest.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const CLASSIC_FILES = man.loadOrder.filter((p) => p.endsWith(".js"));
const moduleSrc = CLASSIC_FILES.map(read).join("\n;\n");
const TABLES_SRC = read("tables.js");
const srcText = TABLES_SRC + "\n;\n" + moduleSrc;

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// A minted gloom Watering-hole place record (same shape family as verify-place-tray.mjs's fixture;
// archetypeKey 2 = Watering-hole, matching SCENE_DRESSING_BY_ARCHETYPE row 2's propNames).
const TYPED_RECORD = {
  id: "loc:fixture-watering-hole", kind: "location", name: "The Drowned Lamp", provenance: "rolled",
  rolled: { archetypeKey: 2, archetypeLabel: "Watering-hole", space: "roomy",
    dims: { w: 4, d: 3 }, staff: { min: 1, max: 2 }, cast: { anchorCls: "service", ambientCls: ["labor"] } },
  fields: { desc: "a sunken tavern", type: "Watering-hole" },
  dm: { itemsPool: "realm-items-gloom", dressing: { props: "gloom", surfaces: "gloom" } },
  status: { soft: true, at: "n1" }
};
const UNTYPED_RECORD = { id: "loc:untyped", kind: "location", name: "The Drowned Lamp", rolled: {}, status: { at: "n2" } };

const harness = `
  var localStorage={getItem:()=>null,setItem:()=>{}};
  var U={worlds:{},activeWorldId:null,revealed:{}};
  var SEED=null;
  function toast(){} function wakeReveal(){}
`;

function freshWin(customSrc) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || srcText));
  return win;
}

function freshWorld(nodeId, codexId, records) {
  return {
    id: "w1", name: "Test World", session: 1, currentNodeId: nodeId,
    map: { nodes: { [nodeId]: { id: nodeId, name: "The Drowned Lamp", type: "Setting", x: 0, y: 0, codexId } }, edges: [] },
    codex: { records, seq: 1 },
    ledger: [], clock: { day: 1, min: 600 }, dmlog: [], dm: {}, gazetteer: [],
    characters: [{ status: "living", name: "Wren", conditions: [], sheet: { level: 3, hp: 20, hpCur: 20, mods: {}, skillProfs: [] } }],
    factions: [], pressures: [],
    seed: { master: { name: "Test Realm", desc: "d" }, smell: { name: "s" }, sound: { name: "n" }, arch: { name: "a" },
            taboo: { name: "t", desc: "td" }, myth: { name: "m", desc: "md" } }
  };
}

function bootWorld(win, w) {
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

console.log("PLACE-DIGEST verify (ADDENDUM §7 unit 10)\n");

// ============================================================================
// (b) FIRST — establish the untyped baseline byte length (the pre-unit-10 golden).
// ============================================================================
let untypedBytes, untypedLocation;
{
  const win = freshWin();
  const w = bootWorld(win, freshWorld("n2", "loc:untyped", { "loc:untyped": UNTYPED_RECORD }));
  const d = win.dmDigest();
  untypedLocation = d.location;
  untypedBytes = Buffer.byteLength(d.location, "utf8");
  console.log("\n(b) untyped node -> digest.location is byte-identical to the bare node name");
  check("b1. location === bare node name (no archetype/dims/dressing rider)", d.location === "The Drowned Lamp", d.location);
  check("b2. zero bytes added vs the pre-unit-10 golden (name alone)", untypedBytes === Buffer.byteLength("The Drowned Lamp", "utf8"), untypedBytes);
}

// no codex binding at all (bare unmapped node) -> nodeName's own "an unmapped place" fallback, untouched.
{
  const win = freshWin();
  const w = { id: "w1", name: "T", currentNodeId: "nope", map: { nodes: {}, edges: [] }, codex: { records: {} },
    ledger: [], clock: { day: 1, min: 600 }, dmlog: [], dm: {}, gazetteer: [], characters: [], factions: [], pressures: [],
    seed: { master: { name: "R", desc: "d" }, smell: { name: "s" }, sound: { name: "n" }, arch: { name: "a" },
            taboo: { name: "t", desc: "td" }, myth: { name: "m", desc: "md" } } };
  bootWorld(win, w);
  const d = win.dmDigest();
  // nodeName(w,id): a truthy id with no map entry returns the id itself (existing, untouched
  // behavior) — this fixture asserts unit 10 doesn't perturb that path, not nodeName's own contract.
  check("b3. no node bound at all -> untouched nodeName fallback (id echoed back, unit 10 doesn't touch this path)",
    d.location === "nope", d.location);
}

// ============================================================================
// (a) typed-node fixture: label + dims(ft) present, <=120 B added.
// ============================================================================
let typedLocation, typedBytes;
{
  const win = freshWin();
  const w = bootWorld(win, freshWorld("n1", TYPED_RECORD.id, { [TYPED_RECORD.id]: TYPED_RECORD }));
  const d = win.dmDigest();
  typedLocation = d.location;
  typedBytes = Buffer.byteLength(d.location, "utf8");
  console.log("\n(a) typed node (gloom Watering-hole) -> digest.location gains label+dims+dressing");
  check("a1. location contains the archetype label", typedLocation.includes("Watering-hole"), typedLocation);
  check("a2. location contains the dims IN FEET (dims.w*5 x dims.d*5 = 20x15, not the raw 4x3 cell count)",
    typedLocation.includes("20x15 ft"), typedLocation);
  check("a3. location still leads with the node/place name (prose stays readable)", typedLocation.startsWith("The Drowned Lamp"), typedLocation);
  const added = typedBytes - untypedBytes;
  check(`a4. <=120 bytes added over the untyped baseline (measured ${added} B)`, added > 0 && added <= 120,
    `typed=${typedBytes} B, untyped=${untypedBytes} B, added=${added} B — "${typedLocation}"`);
}

// ============================================================================
// (c) 50-record budget: the SAME size-guard measurement verify-digest-diet.mjs runs, with a typed
//     place bound at the current node in the mix — total digest stays under its 12 KB budget.
// ============================================================================
{
  console.log("\n(c) 50-record digest-diet budget still holds with a typed node in the mix");
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const SEEDS = [1, 2, 3, 4, 5];
  const measured = [];
  const win = freshWin();
  const w = bootWorld(win, freshWorld("n1", TYPED_RECORD.id, { [TYPED_RECORD.id]: TYPED_RECORD }));
  for (const seed of SEEDS) {
    win.eval(`Math.random = (${mulberry32.toString()})(${seed});`);
    for (let i = 0; i < 50; i++) {
      win.codexAdd(w, {
        id: "npc:filler" + i, kind: "npc", name: "Filler NPC " + i, provenance: "rolled",
        fields: { desc: "a rolled filler NPC with some ordinary flavor text, nothing special", occupation: "vagrant" },
        dm: { secret: "nothing much" }, status: { at: i % 7 === 0 ? "n1" : "elsewhere-" + i }
      });
    }
    w.dm.digestAckSeq = win.codexOf(w).seq;
    win.eval(`Math.random = Math.random;`); // restore left to the outer process boundary (jsdom-scoped, no cross-contamination)
    const d = win.dmDigest();
    const bytes = Buffer.byteLength(JSON.stringify(d), "utf8");
    measured.push(bytes);
    // reset codex for next seed iteration (avoid compounding 250 records across 5 seeds)
    w.codex = { records: {}, seq: 1 };
    w.map.nodes["n1"].codexId = TYPED_RECORD.id;
    w.codex.records[TYPED_RECORD.id] = TYPED_RECORD;
  }
  const sorted = measured.slice().sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  check(`c1. median digest size (50 records + typed node) stays < 12 KB (median ${median} B — draws: ${measured.join(", ")})`,
    median < 12 * 1024, `median=${median}`);
}

// ============================================================================
// (d) MUTATION (shown RED then restored): stub theaterNodeSourceFor -> null -> (a) fails.
// ============================================================================
{
  console.log("\n(d) MUTATION — stub theaterNodeSourceFor() to always return null (proves (a) is a real check)");
  const stubbedSrc = TABLES_SRC + "\n;\n" + moduleSrc.replace(
    "function theaterNodeSourceFor(w,nodeId){",
    "function theaterNodeSourceFor(w,nodeId){ return null; } function __unused_theaterNodeSourceFor(w,nodeId){"
  );
  check("d0. mutation harness: the theaterNodeSourceFor def line is present verbatim (sanity)",
    stubbedSrc !== (TABLES_SRC + "\n;\n" + moduleSrc));
  const win = freshWin(stubbedSrc);
  const w = bootWorld(win, freshWorld("n1", TYPED_RECORD.id, { [TYPED_RECORD.id]: TYPED_RECORD }));
  const d = win.dmDigest();
  check("d1. MUTATION: with theaterNodeSourceFor stubbed null, location degrades to the bare name (harness catches the regression)",
    d.location === "The Drowned Lamp", d.location);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
