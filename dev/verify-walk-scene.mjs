/* dev/verify-walk-scene.mjs — docs/WALK-NATIVE-A.md WDV-1 verify harness.

   walkSceneFrom (src/engine/walk-scene.js) is pure engine data code — no THREE/DOM/RNG/world writes
   (same discipline as src/engine/place-projection.js, whose own harness dev/verify-walk-card-
   projection.mjs this file's "load the real modules, in document order" convention is copied from).
   This harness additionally MINTS REAL walks (dungeon/urban/wilderness) off tables.js + the actual
   roller modules — the exact recipe dev/verify-walk.mjs already proves works standalone (2802/0) —
   because WDV-1's own spec calls for driving walkSceneFrom off real rolled data, not only hand-built
   fixtures. All modules load into ONE `new Function` scope, in the SAME order genesis.html's
   <script> tags load them (tables.js -> walk.js -> dungeon-walk.js -> wild-walk.js -> wiring-a.js ->
   wiring-b.js -> place-projection.js -> walk-scene.js), so every `typeof foo==="function"` opportunistic
   call inside the rollers resolves exactly the way it does in the real app.

   RED-FIRST checks 1/2/3 (docs/WALK-NATIVE-A.md WDV-1 Verify list): this file's own mutation hooks
   (see MUTATIONS below) monkey-patch a single named internal helper INSIDE the loaded sandbox copy of
   walk-scene.js (never the committed source file) to reproduce exactly the broken behavior the gate
   exists to catch, confirms the check goes red under that mutation, then the real MUTATIONS-off path
   proves the same check green — mirrors dev/verify-dungeon-walkbind.mjs's own "stub the seam to a
   no-op, prove red, restore, prove green" technique.

   Run:            node dev/verify-walk-scene.mjs             (green — the real, unmutated module)
   Red-first proof: node dev/verify-walk-scene.mjs --red-1     (provenance completeness, mutated red)
                    node dev/verify-walk-scene.mjs --red-2     (atmo isolation, mutated red)
                    node dev/verify-walk-scene.mjs --red-3     (hidden gating, mutated red)
   Each --red-N run asserts check N FAILS under its mutation (an unexpected pass under mutation is
   itself a harness failure — the proof that the gate is actually load-bearing). */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const RED = process.argv[2] || null; // null | "--red-1" | "--red-2" | "--red-3"

// ─── MUTATIONS — appended to the loaded source ONLY when a --red-N flag is passed. Each monkey-
// patches one internal helper of the just-loaded (sandboxed) walk-scene.js copy, reproducing exactly
// the broken shape its gate exists to catch. The committed src/engine/walk-scene.js is never touched. */
const MUTATIONS = {
  "--red-1": `
    // RED-1 (provenance completeness, gate 14.3): stub the "areaType" structure lane to emit an
    // entry with NO sourceRef at all — check 1 must catch the missing/incomplete provenance.
    var __origEmitField1 = wsEmitField;
    wsEmitField = function(scene, ctx, fieldPath, laneKey, role, fields, rollRefKey, overlayRef){
      if(fieldPath === "areaType"){ scene[laneKey].push(Object.assign({ role: role }, fields)); return; }
      return __origEmitField1(scene, ctx, fieldPath, laneKey, role, fields, rollRefKey, overlayRef);
    };
  `,
  "--red-2": `
    // RED-2 (atmo isolation, gate 14.5): route every atmosphere-role entry into dressing[] instead —
    // check 2 must catch sensory/atmo geometry leaking outside atmosphere[].
    var __origEmitField2 = wsEmitField;
    wsEmitField = function(scene, ctx, fieldPath, laneKey, role, fields, rollRefKey, overlayRef){
      var lk = (role === "atmosphere") ? "dressing" : laneKey;
      return __origEmitField2(scene, ctx, fieldPath, lk, role, fields, rollRefKey, overlayRef);
    };
  `,
  "--red-3": `
    // RED-3 (hidden gating, gate 14.4): always promote "loot" to its visible lane, ignoring the
    // reveal gate entirely — check 3 must catch an unrevealed loot fact leaking into citizens[].
    var __origHiddenField3 = wsHiddenField;
    wsHiddenField = function(scene, ctx, fieldKey, value, promote){
      if(fieldKey === "loot" && value != null){
        var rollRef = wsRollRef(ctx.segment, fieldKey);
        var sourceRef = wsSourceRef(ctx.walkId, ctx.segNum, fieldKey, rollRef, null);
        var p = promote(value);
        wsEmit(scene, p.lane, Object.assign({ role: p.role, sourceRef: sourceRef }, p.fields || {}));
        return;
      }
      return __origHiddenField3(scene, ctx, fieldKey, value, promote);
    };
  `
};

function loadSandbox(){
  const src = [
    read("tables.js"),
    read("src/engine/walk.js"),
    read("src/engine/dungeon-walk.js"),
    read("src/engine/wild-walk.js"),
    read("src/world/wiring-a.js"),
    read("src/world/wiring-b.js"),
    read("src/engine/place-projection.js"),
    read("src/engine/walk-scene.js")
  ].join("\n;\n");
  const tail = RED && MUTATIONS[RED] ? MUTATIONS[RED] : "";
  const body = src + "\n;\n" + tail + "\n;return { rollDungeonWalk, rollUrbanWalk, rollWildernessWalk, walkSceneFrom, walkSceneProjectionFrom };";
  const factory = new Function("window", body);
  return factory({});
}

let pass = 0, fail = 0;
function check(name, ok, detail){
  if(ok){ pass++; console.log("PASS", name); }
  else { fail++; console.error("FAIL", name, detail !== undefined ? JSON.stringify(detail) : ""); }
}
// for red-mode: we WANT the check to fail. `redCheck` inverts the pass/fail bookkeeping so a script
// exit code of 0 always means "the harness behaved as documented" (mutation broke it / real code green).
function redCheck(name, ok){
  if(!ok){ pass++; console.log("RED-CONFIRMED", name, "(failed as expected under mutation)"); }
  else { fail++; console.error("RED-NOT-PROVEN", name, "(unexpectedly PASSED under mutation — gate is not load-bearing)"); }
}

const A = loadSandbox();

// ─── mint real walks (same recipe as dev/verify-walk.mjs) ────────────────────────────────────────
const dungeonWalk = A.rollDungeonWalk({ topology: "The Spine", segCount: 4, tier: 2 });
const urbanWalk = A.rollUrbanWalk({ topology: "The Trail", segCount: 4, tier: 2 });
const wildWalk = A.rollWildernessWalk({ legCount: 4, tier: 2 });

const dungeonSeg = dungeonWalk.segments.find((s) => s.num === 2); // a regular mid room, 2 exits
const dungeonFinale = dungeonWalk.segments.find((s) => s.isFinale);
const urbanSeg = urbanWalk.segments.find((s) => !s.isFinale);
const wildSeg = wildWalk.segments.find((s) => !s.isFinale);

function allLaneEntries(scene){
  return [].concat(
    scene.structure, scene.connections, scene.surfaces, scene.practicals, scene.citizens,
    scene.interactables, scene.dressing, scene.conditions, scene.atmosphere, scene.hidden,
    scene.traces, scene.removals
  );
}
function laneNames(){
  return ["structure", "connections", "surfaces", "practicals", "citizens", "interactables",
    "dressing", "conditions", "atmosphere", "hidden", "traces", "removals"];
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CHECK 1 — ⊗ RED-FIRST provenance completeness (gate 14.3)
// ══════════════════════════════════════════════════════════════════════════════════════════════
(function check1(){
  const scene = A.walkSceneFrom({ walkId: "frontier:node-1", walk: dungeonWalk, segment: dungeonSeg, overlay: null, spatialRoom: null, live: {} });
  const entries = allLaneEntries(scene);
  const everyEntryHasSourceRef = entries.every((e) => e && e.sourceRef && typeof e.sourceRef.fieldPath === "string" && e.sourceRef.fieldPath.length > 0);
  const everySourceRefInFieldRefs = entries.every((e) => scene.fieldRefs.indexOf(e.sourceRef) >= 0);
  const hasEntries = entries.length > 5; // sanity: the room actually produced real content

  if(RED === "--red-1"){
    redCheck("1 provenance completeness (RED-FIRST proof)", everyEntryHasSourceRef && everySourceRefInFieldRefs);
    return;
  }
  check("1 provenance completeness: every entry has a non-empty sourceRef.fieldPath", everyEntryHasSourceRef);
  check("1 provenance completeness: every sourceRef appears in fieldRefs", everySourceRefInFieldRefs);
  check("1 provenance completeness: the scene actually has real content (sanity)", hasEntries, entries.length);
})();

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CHECK 2 — ⊗ RED-FIRST atmo isolation (gate 14.5)
// ══════════════════════════════════════════════════════════════════════════════════════════════
(function check2(){
  const scenes = [
    A.walkSceneFrom({ walkId: "w1", walk: dungeonWalk, segment: dungeonSeg, overlay: null, spatialRoom: null, live: {} }),
    A.walkSceneFrom({ walkId: "w2", walk: urbanWalk, segment: urbanSeg, overlay: null, spatialRoom: null, live: {} }),
    A.walkSceneFrom({ walkId: "w3", walk: wildWalk, segment: wildSeg, overlay: null, spatialRoom: null, live: {} })
  ];
  const ATMO_FIELDS = ["sensory", "atmo", "backgroundEvent"];
  let atmoCount = 0, leaks = 0;
  scenes.forEach((scene) => {
    atmoCount += scene.atmosphere.length;
    ["structure", "connections", "surfaces", "practicals", "citizens", "interactables", "dressing", "conditions", "traces", "removals"].forEach((lane) => {
      scene[lane].forEach((e) => { if(e && e.sourceRef && ATMO_FIELDS.indexOf(e.sourceRef.fieldPath) >= 0) leaks++; });
    });
  });
  const hasAtmo = atmoCount > 0;
  const zeroLeaks = leaks === 0;

  if(RED === "--red-2"){
    redCheck("2 atmo isolation (RED-FIRST proof)", zeroLeaks);
    return;
  }
  check("2 atmo isolation: sensory/atmo/backgroundEvent produce real atmosphere[] entries", hasAtmo, atmoCount);
  check("2 atmo isolation: zero atmo-field entries leak outside atmosphere[]", zeroLeaks, leaks);
})();

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CHECK 3 — ⊗ RED-FIRST hidden gating (gate 14.4)
// ══════════════════════════════════════════════════════════════════════════════════════════════
(function check3(){
  const hiddenId = "S" + dungeonSeg.num + ".loot";
  const before = A.walkSceneFrom({ walkId: "w1", walk: dungeonWalk, segment: dungeonSeg, overlay: null, spatialRoom: null, live: {} });
  const hiddenHasLoot = before.hidden.some((e) => e.fieldKey === "loot");
  const citizensHaveLoot = before.citizens.some((e) => e.sourceRef && e.sourceRef.fieldPath === "loot");

  if(RED === "--red-3"){
    redCheck("3 hidden gating (RED-FIRST proof — unrevealed loot must stay out of citizens[])", hiddenHasLoot && !citizensHaveLoot);
    return;
  }
  check("3 hidden gating: unrevealed loot lands in hidden[] only", hiddenHasLoot);
  check("3 hidden gating: unrevealed loot emits no citizens[] entry", !citizensHaveLoot);

  const after = A.walkSceneFrom({ walkId: "w1", walk: dungeonWalk, segment: dungeonSeg, overlay: null, spatialRoom: null, live: { discoveredSecrets: [hiddenId] } });
  const promotedToCitizens = after.citizens.some((e) => e.sourceRef && e.sourceRef.fieldPath === "loot");
  const stillInHidden = after.hidden.some((e) => e.fieldKey === "loot");
  check("3 hidden gating: revealing (live.discoveredSecrets) promotes loot into citizens[]", promotedToCitizens);
  check("3 hidden gating: revealed loot no longer sits in hidden[]", !stillInHidden);

  // same promotion, via overlay.revealedSecrets instead of live.discoveredSecrets
  const afterOverlay = A.walkSceneFrom({ walkId: "w1", walk: dungeonWalk, segment: dungeonSeg, overlay: { revealedSecrets: [hiddenId] }, spatialRoom: null, live: {} });
  check("3 hidden gating: overlay.revealedSecrets also promotes loot", afterOverlay.citizens.some((e) => e.sourceRef && e.sourceRef.fieldPath === "loot"));

  // secret (dungeon-only) follows the same gate, promoting to interactables[]
  const secretHiddenId = "S" + dungeonSeg.num + ".secret";
  const secretBefore = A.walkSceneFrom({ walkId: "w1", walk: dungeonWalk, segment: dungeonSeg, overlay: null, spatialRoom: null, live: {} });
  check("3 hidden gating: unrevealed secret lands in hidden[] only", secretBefore.hidden.some((e) => e.fieldKey === "secret"));
  check("3 hidden gating: unrevealed secret emits no interactables[] entry", !secretBefore.interactables.some((e) => e.sourceRef && e.sourceRef.fieldPath === "secret"));
  const secretAfter = A.walkSceneFrom({ walkId: "w1", walk: dungeonWalk, segment: dungeonSeg, overlay: null, spatialRoom: null, live: { discoveredSecrets: [secretHiddenId] } });
  check("3 hidden gating: revealing promotes secret into interactables[]", secretAfter.interactables.some((e) => e.sourceRef && e.sourceRef.fieldPath === "secret"));
})();

if(RED){
  // in red mode, only checks 1-3 above matter — report and exit now.
  console.log(`\n${pass} passed, ${fail} failed (RED mode: ${RED})`);
  process.exit(fail ? 1 : 0);
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CHECK 4 — determinism (gate 14.2)
// ══════════════════════════════════════════════════════════════════════════════════════════════
(function check4(){
  const a = A.walkSceneFrom({ walkId: "w1", walk: dungeonWalk, segment: dungeonSeg, overlay: null, spatialRoom: null, live: {} });
  const b = A.walkSceneFrom({ walkId: "w1", walk: dungeonWalk, segment: dungeonSeg, overlay: null, spatialRoom: null, live: {} });
  check("4 determinism: same inputs twice -> byte-identical WalkScene", JSON.stringify(a) === JSON.stringify(b));

  // shuffled explicit-deck card order -> same WalkScene (walkSceneProjectionFrom's own priority sort
  // is the thing that makes card order irrelevant; this proves walkSceneFrom inherits that guarantee).
  const deckWalk = {
    environment: "dungeon", topology: "The Spine",
    deck: {
      cards: [
        { id: "hazard", sourceRef: "S3.hazard", homeSegNum: 3, role: "hazard", mechanical: true, visual: { weight: 2 } },
        { id: "shrine", sourceRef: "S3.feature", homeSegNum: 3, role: "centerpiece", centerpiece: true, visual: { weight: 3, slug: "fantasy-shrine", position: { x: 2, y: 2 } } },
        { id: "rubble", sourceRef: "S3.dressing", homeSegNum: 3, role: "dressing", visual: { weight: 1 } }
      ],
      assignments: [
        { cardId: "hazard", homeSegNum: 3, lane: "stageNow" },
        { cardId: "shrine", homeSegNum: 3, lane: "stageNow" },
        { cardId: "rubble", homeSegNum: 3, lane: "stageNow" }
      ]
    }
  };
  const deckSeg = { num: 3, id: "r3", label: "", isFinale: false, exits: [], secret: null, loot: null };
  const shuffledWalk = Object.assign({}, deckWalk, { deck: Object.assign({}, deckWalk.deck, { cards: deckWalk.deck.cards.slice().reverse() }) });
  const sceneOrig = A.walkSceneFrom({ walkId: "d1", walk: deckWalk, segment: deckSeg, overlay: null, spatialRoom: null, live: {} });
  const sceneShuffled = A.walkSceneFrom({ walkId: "d1", walk: shuffledWalk, segment: deckSeg, overlay: null, spatialRoom: null, live: {} });
  check("4 determinism: shuffled deck.cards[] input order -> identical WalkScene output", JSON.stringify(sceneOrig) === JSON.stringify(sceneShuffled));
})();

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CHECK 5 — raw immutability (gate 14.1)
// ══════════════════════════════════════════════════════════════════════════════════════════════
(function check5(){
  function deepFreeze(o, seen){
    seen = seen || new Set();
    if(o === null || typeof o !== "object" || seen.has(o)) return o;
    seen.add(o);
    Object.getOwnPropertyNames(o).forEach((k) => deepFreeze(o[k], seen));
    return Object.freeze(o);
  }
  const walkCopy = JSON.parse(JSON.stringify(dungeonWalk));
  const segCopy = walkCopy.segments.find((s) => s.num === 2);
  const overlayCopy = { revealedSecrets: [], traces: [{ id: "t1", name: "scorch mark" }], removed: [], decals: [] };
  const beforeWalkJson = JSON.stringify(walkCopy);
  const beforeSegJson = JSON.stringify(segCopy);
  const beforeOverlayJson = JSON.stringify(overlayCopy);
  deepFreeze(walkCopy); deepFreeze(segCopy); deepFreeze(overlayCopy);

  let threw = null;
  try {
    A.walkSceneFrom({ walkId: "w1", walk: walkCopy, segment: segCopy, overlay: overlayCopy, spatialRoom: null, live: {} });
  } catch(e){ threw = e; }
  check("5 raw immutability: walkSceneFrom completes without throwing on frozen inputs", threw === null, threw && String(threw));
  check("5 raw immutability: frozen walk unchanged after the call", JSON.stringify(walkCopy) === beforeWalkJson);
  check("5 raw immutability: frozen segment unchanged after the call", JSON.stringify(segCopy) === beforeSegJson);
  check("5 raw immutability: frozen overlay unchanged after the call", JSON.stringify(overlayCopy) === beforeOverlayJson);
})();

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CHECK 6 — graph fidelity (gate 14.6)
// ══════════════════════════════════════════════════════════════════════════════════════════════
(function check6(){
  // gate 14.6 is scoped to the graph edges themselves (segment.exits[] -> connections[]); a segment
  // may ALSO carry a non-graph connection fact (urban's own `transition` field — "street mouth,
  // threshold, stair", contract §6 — a distinct concept from the exit graph) which legitimately adds
  // its own connections[] entry alongside the exit-derived ones. Filter to the exit-sourced subset
  // (fieldPath "exits[N]") before counting, so this check proves the graph-fidelity claim precisely:
  // N exits -> exactly N exit-derived connections, no invented neighbor room, nothing dropped either.
  [dungeonSeg, dungeonFinale, urbanSeg, wildSeg].forEach((seg, i) => {
    const walk = i < 2 ? dungeonWalk : (i === 2 ? urbanWalk : wildWalk);
    const scene = A.walkSceneFrom({ walkId: "w1", walk: walk, segment: seg, overlay: null, spatialRoom: null, live: {} });
    const exitCount = Array.isArray(seg.exits) ? seg.exits.length : 0;
    const exitConnections = scene.connections.filter((c) => c.sourceRef && /^exits\[\d+\]/.test(c.sourceRef.fieldPath));
    check(`6 graph fidelity: seg ${seg.id} — ${exitCount} exits -> exactly ${exitCount} exit-derived connections`, exitConnections.length === exitCount, exitConnections.length);
    const knownTargets = new Set((seg.exits || []).map((e) => e.num));
    const noInvented = exitConnections.every((c) => knownTargets.has(c.targetSegNum));
    check(`6 graph fidelity: seg ${seg.id} — no invented neighbor room`, noInvented);
  });
})();

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CHECK 7 — card-lane parity (no dropped cast/interactable; sourceRef preserved)
// ══════════════════════════════════════════════════════════════════════════════════════════════
(function check7(){
  const walk = {
    environment: "dungeon", topology: "The Spine",
    deck: {
      cards: [
        { id: "watcher", sourceRef: "S3.encounter", homeSegNum: 3, role: "cast", mechanical: true, visual: { weight: 2, slug: "fantasy-watcher", position: { x: 1, y: 1 } } },
        { id: "lever", sourceRef: "S3.object", homeSegNum: 3, role: "interactable", mechanical: true, visual: { weight: 1, slug: "fantasy-lever", position: { x: 3, y: 3 } } }
      ],
      assignments: [
        { cardId: "watcher", homeSegNum: 3, lane: "stageNow" },
        { cardId: "lever", homeSegNum: 3, lane: "stageNow" }
      ]
    }
  };
  const seg = { num: 3, id: "r3", label: "", isFinale: false, exits: [], secret: null, loot: null };
  const scene = A.walkSceneFrom({ walkId: "d1", walk: walk, segment: seg, overlay: null, spatialRoom: null, live: {} });
  const castEntry = scene.citizens.find((c) => c.id === "watcher");
  const interEntry = scene.interactables.find((c) => c.id === "lever");
  check("7 card-lane parity: stageNow cast card appears in citizens[]", !!castEntry);
  check("7 card-lane parity: cast card's sourceRef.fieldPath preserves the dealt sourceRef verbatim", !!castEntry && castEntry.sourceRef.fieldPath === "S3.encounter");
  check("7 card-lane parity: stageNow interactable card appears in interactables[]", !!interEntry);
  check("7 card-lane parity: interactable card's sourceRef.fieldPath preserves the dealt sourceRef verbatim", !!interEntry && interEntry.sourceRef.fieldPath === "S3.object");
})();

// ══════════════════════════════════════════════════════════════════════════════════════════════
// CHECK 8 — check-manifest RESULT: OK
// ══════════════════════════════════════════════════════════════════════════════════════════════
(function check8(){
  let out = "";
  let ok = true;
  try {
    out = execFileSync("python3", ["build/check-manifest.py"], { cwd: ROOT, encoding: "utf8" });
  } catch(e){
    ok = false;
    out = (e.stdout || "") + (e.stderr || "");
  }
  check("8 check-manifest.py ends RESULT: OK", ok && /RESULT: OK\s*$/.test(out.trim()), out.trim().split("\n").slice(-3).join(" | "));
})();

console.log(`\n${pass} passed, ${fail} failed`);
if(fail) process.exit(1);
