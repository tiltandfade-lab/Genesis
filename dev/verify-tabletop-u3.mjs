/* Verify TABLETOP-UNITS.md §U3 — Blank-piece fallback + ambient presence (co-location)
   (TABLETOP-VISION.md §2's parity condition + §9.6 gate + §9.3 anti-drift containment).

   TWO independent layers, tested with the tool proper to each:
     SECTION A — src/ui/theater-figures.js's resolveWholeObject blank-piece chain. Plain Node ESM
       import (no jsdom needed — theater-figures.js carries no bare "three" import, same discipline
       dev/verify-theater-figures.mjs already relies on), plus a source-text scan of src/ui/theater-
       boot.js proving the actual render call sites (figureFor, the prop-resolution path,
       mountLightProp) wire pieceKind correctly.
     SECTION B — src/world/dm.js's ambientPresence digest field + src/world/codex.js's shared
       codexAmbientPresenceFor derivation. jsdom, real genesis.html classic modules in document
       order (the established convention — see dev/verify-tabletop-u1.mjs/u2.mjs's own header),
       because the call-identity spy needs a real global execution context (top-level `function`
       declarations become mutable window properties under jsdom's runScripts:"dangerously";
       a `new Function(...)` sandbox's local functions are NOT externally reassignable, so that
       lighter harness style — dev/verify-digest-diet.mjs's own pattern — can't support the spy).

   Checks (§9.6/§9.3/§2 the fallback-chain law "never absent, never blocks"):
     A1 registry carries blank:figure / blank:prop with module/fn/discR
     A2/A3 resolveWholeObject(unknownKey,"figure"|"prop") -> the matching blank:* entry, NEVER null
     A4 resolveWholeObject(falsy key, "figure"|"prop") -> still the blank entry (never null)
     A5 resolveWholeObject("wolf") (no pieceKind) — exact hit unaffected by the new param
     A6 [RED-FIRST-GUARD] resolveWholeObject(unknownKey) (no pieceKind) -> still null — the ORIGINAL
        contract every existing caller (mountLightProp's "light:" lookups, ref-bestiary.js's
        provenance reads) depends on; this is the regression the whole unit must not cause
     A7 loadWholeObjectBuilders resolves real callable builders for both blank entries; the builder
        contract (resetGeom/build/getBuffers shape, tri-count floor, bbox bound) holds for both
     A8 the never-blocks law over a spread of unrelated garbage keys
     A-WIRING figureFor/[props path] call resolveWholeObject/wholeObjectGeometryFor WITH a pieceKind
        argument ("figure"/"prop"); mountLightProp does NOT (preserves its legitimate null-on-miss)
     A-MUTATION [RED-FIRST]: delete the blank:figure registry entry in-memory -> resolveWholeObject
        (unknownKey,"figure") is falsy, never throws (the cuboid-fallback consumer guard still
        degrades cleanly) — then restored.

     B1 node-scene ambientPresence: N soft ambient npc records at w.currentNodeId -> digest carries
        {count:N, texture:<string>}
     B2 §9.6(b): codex_contact on one ambient -> count drops by 1; the contacted record itself now
        rides the FULL here-set (codex.js:417 rule 1, pre-existing behavior, reused as the "digest-
        visible" proof for the promoted piece)
     B3 §9.6(c): zero ambients -> ambientPresence:null (no aggregate line, nothing would stage)
     B4 activeWalkDigest's own ambientPresence sibling of `cast`, computed for the walk's node
     B5 independence: the node-scene field and the walk field read DIFFERENT node ids and don't
        conflate counts
     B6 wiring: DM_DIGEST_KEYS + dm-contract.json both carry "ambientPresence" (contract parity)
     B-§9.3: an UNTOUCHED ambient record never appears in the full codex[] this turn (still
        suppressed, codex.js:415 UNTOUCHED) while its count is visible via ambientPresence — "a
        staged figure with no digest-side presence is a hard failure" restated as: the presence
        line is never absent when the (to-be-staged, post-U4) records exist.
     B-CALL-IDENTITY SPY: patch window.codexAmbientPresenceFor with a counting wrapper; drive BOTH
        consumers (the node-scene dmDigest field AND activeWalkDigest's field) in one session;
        assert the spy intercepted BOTH calls — i.e. both consumers reach the identical function
        reference, not two independently-written filters that happen to agree on output.
     B-MUTATION [RED-FIRST]: source-mutate dm.js so the node-scene call site is rewired to a decoy
        function (codexAmbientPresenceForDRIFT, NOT the shared one) instead of codexAmbientPresenceFor
        — reload, repeat the identical spy-patch experiment, and show the spy now intercepts only
        ONE of the two consumers (the walk one) instead of both: the call-identity check catches a
        consumer that stopped sharing the boundary function. Then restore and reconfirm both-green.

   Run:  node dev/verify-tabletop-u3.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// SECTION A — resolveWholeObject blank-piece chain (plain Node ESM, no jsdom)
// ============================================================================
console.log("=== SECTION A: theater-figures.js blank-piece fallback ===");
{
  const FIGURES_URL = pathToFileURL(join(ROOT, "src/ui/theater-figures.js")).href;
  const Figures = await import(FIGURES_URL);
  const { WHOLE_OBJECT_REGISTRY, resolveWholeObject, loadWholeObjectBuilders } = Figures;

  console.log("\n--- A1: registry entries ---");
  check("blank:figure is registered with module/fn/discR",
    !!WHOLE_OBJECT_REGISTRY["blank:figure"] && typeof WHOLE_OBJECT_REGISTRY["blank:figure"].module === "string"
      && typeof WHOLE_OBJECT_REGISTRY["blank:figure"].fn === "string" && typeof WHOLE_OBJECT_REGISTRY["blank:figure"].discR === "number", "");
  check("blank:prop is registered with module/fn/discR",
    !!WHOLE_OBJECT_REGISTRY["blank:prop"] && typeof WHOLE_OBJECT_REGISTRY["blank:prop"].module === "string"
      && typeof WHOLE_OBJECT_REGISTRY["blank:prop"].fn === "string" && typeof WHOLE_OBJECT_REGISTRY["blank:prop"].discR === "number", "");

  console.log("\n--- A2/A3: a genuine miss resolves to the matching blank entry, NEVER null ---");
  const UNKNOWN = "definitely-not-a-real-creature-slug-u3";
  check("resolveWholeObject(unknown,\"figure\") === WHOLE_OBJECT_REGISTRY[\"blank:figure\"]",
    resolveWholeObject(UNKNOWN, "figure") === WHOLE_OBJECT_REGISTRY["blank:figure"], "");
  check("resolveWholeObject(unknown,\"prop\") === WHOLE_OBJECT_REGISTRY[\"blank:prop\"]",
    resolveWholeObject(UNKNOWN, "prop") === WHOLE_OBJECT_REGISTRY["blank:prop"], "");

  console.log("\n--- A4: falsy key + pieceKind still resolves the blank entry ---");
  check("resolveWholeObject(null,\"figure\") -> blank:figure (never null)",
    resolveWholeObject(null, "figure") === WHOLE_OBJECT_REGISTRY["blank:figure"], "");
  check("resolveWholeObject(undefined,\"prop\") -> blank:prop (never null)",
    resolveWholeObject(undefined, "prop") === WHOLE_OBJECT_REGISTRY["blank:prop"], "");
  check("resolveWholeObject(\"\",\"figure\") -> blank:figure (never null)",
    resolveWholeObject("", "figure") === WHOLE_OBJECT_REGISTRY["blank:figure"], "");

  console.log("\n--- A5: exact hit unaffected by the new param ---");
  check("resolveWholeObject(\"wolf\") still resolves the direct entry (no pieceKind)",
    resolveWholeObject("wolf") === WHOLE_OBJECT_REGISTRY["wolf"], "");
  check("resolveWholeObject(\"wolf\",\"figure\") ALSO resolves the direct entry (exact beats blank)",
    resolveWholeObject("wolf", "figure") === WHOLE_OBJECT_REGISTRY["wolf"], "");

  console.log("\n--- A6 [RED-FIRST-GUARD]: the ORIGINAL null-on-miss contract, no pieceKind ---");
  check("resolveWholeObject(unknown) with NO pieceKind is still null — the regression guard for "
      + "mountLightProp's \"light:\" lookups + ref-bestiary.js's provenance reads",
    resolveWholeObject(UNKNOWN) === null, String(resolveWholeObject(UNKNOWN)));
  check("resolveWholeObject(null) with no pieceKind is still null", resolveWholeObject(null) === null, "");

  console.log("\n--- A7: builder contract for both blank entries ---");
  await new Promise((resolve) => loadWholeObjectBuilders(resolve));
  check("blank:figure resolved a real callable builder after loadWholeObjectBuilders settles",
    typeof WHOLE_OBJECT_REGISTRY["blank:figure"].build === "function", "");
  check("blank:prop resolved a real callable builder after loadWholeObjectBuilders settles",
    typeof WHOLE_OBJECT_REGISTRY["blank:prop"].build === "function", "");
  {
    const probeLib = await import(pathToFileURL(join(ROOT, "dev/model-qa/probe-lib.js")).href);
    for (const key of ["blank:figure", "blank:prop"]) {
      const entry = WHOLE_OBJECT_REGISTRY[key];
      probeLib.resetGeom();
      let threw = false;
      try { entry.build(); } catch (e) { threw = true; }
      const { POS, COL, CHAN } = probeLib.getBuffers();
      const triCount = POS.length / 9;
      const okShape = !threw && POS.length % 9 === 0 && POS.length === COL.length && CHAN.length === triCount;
      check(key + ": builder runs without throwing + well-formed buffer shape", okShape, "threw=" + threw);
      check(key + ": tri count in [120,2600] (" + triCount + ")", triCount >= 120 && triCount <= 2600, String(triCount));
      let minY = Infinity;
      for (let i = 1; i < POS.length; i += 3) { if (POS[i] < minY) minY = POS[i]; }
      const okBBoxY = key.startsWith("prop:") ? (minY <= 0.08) : (minY >= -0.08 && minY <= 0.08);
      check(key + ": bbox min.y within the spec's bound (" + minY.toFixed(5) + ")", okBBoxY, "");
    }
  }

  console.log("\n--- A8: the never-blocks law over a spread of unrelated garbage keys ---");
  const garbage = ["", "xyz-nope", "prop:totally-unregistered-part", "class:not-a-real-class", "🙃", "0", "null", "undefined"];
  const allFigureNonNull = garbage.every((k) => resolveWholeObject(k, "figure") != null);
  const allPropNonNull = garbage.every((k) => resolveWholeObject(k, "prop") != null);
  check("every garbage key resolves non-null for pieceKind:\"figure\"", allFigureNonNull, "");
  check("every garbage key resolves non-null for pieceKind:\"prop\"", allPropNonNull, "");

  console.log("\n--- A-WIRING: the real render call sites pass pieceKind (source-text scan) ---");
  // THEATER SPLIT B3 (2026-07-25; docs/FABLE-THEATER-BOOT-SPLIT-BRIEF.md): figureFor moved VERBATIM
  // into src/ui/theater-figure-build.js; the props path (setBoard) and mountLightProp's deliberately
  // pieceKind-less lookup stayed in theater-boot.js. Reading the COMPOSITE keeps all five call-site
  // scans below anchored on the real source of their own call site — same regexes, same jobs.
  // THEATER SPLIT B9 (2026-07-25): the props path travelled with setBoard into
  // src/ui/theater-tabletop.js; mountLightProp stayed in theater-boot.js. Adding the tabletop realizer
  // to the SAME composite keeps the two props-path scans anchored on the real source of their own call
  // site — same regexes, same jobs.
  const bootSrc = read("src/ui/theater-boot.js")
    + "\n/* [verify-tabletop-u3 composite boundary — src/ui/theater-figure-build.js follows] */\n"
    + read("src/ui/theater-figure-build.js")
    + "\n/* [verify-tabletop-u3 composite boundary — src/ui/theater-tabletop.js follows] */\n"
    + read("src/ui/theater-tabletop.js");
  check("figureFor's whole-object gate calls resolveWholeObject(wKey, \"figure\")",
    /resolveWholeObject\(wKey,\s*"figure"\)/.test(bootSrc), "");
  check("figureFor's geometry call passes \"figure\" through wholeObjectGeometryFor",
    /wholeObjectGeometryFor\(wKey,\s*false,\s*"figure"\)/.test(bootSrc), "");
  check("the props path calls resolveWholeObject(wPropKey, \"prop\")",
    /resolveWholeObject\(wPropKey,\s*"prop"\)/.test(bootSrc), "");
  // QF-B1 (2026-07-14, PLAY-LENS P0 #4): this call site grew an optional 4th arg (wRetint — a
  // realm-prop's authored partParams.retint, threaded through to wholeObjectRetintColorBuffer) —
  // the regex now tolerates ANY trailing args after "prop" rather than requiring the call to end
  // there, since the fact this check actually verifies (pieceKind:"prop" is passed) is unchanged.
  check("the props path's geometry call passes \"prop\" through wholeObjectGeometryFor",
    /wholeObjectGeometryFor\(wPropKey,\s*false,\s*"prop"[^)]*\)/.test(bootSrc), "");
  check("mountLightProp's lookup deliberately carries NO pieceKind (light: profiles legitimately miss)",
    /const entry = resolveWholeObject\(wKey\);/.test(bootSrc), "");

  console.log("\n--- A-MUTATION [RED-FIRST]: blank:figure entry removed -> falls to undefined, no throw ---");
  const savedBlankFigure = WHOLE_OBJECT_REGISTRY["blank:figure"];
  delete WHOLE_OBJECT_REGISTRY["blank:figure"];
  let mutThrew = false, mutResult;
  try { mutResult = resolveWholeObject(UNKNOWN, "figure"); } catch (e) { mutThrew = true; }
  check("A-MUTATION RED: blank:figure deleted -> resolveWholeObject(unknown,\"figure\") is falsy, no throw",
    !mutThrew && !mutResult, "threw=" + mutThrew + " result=" + JSON.stringify(mutResult));
  WHOLE_OBJECT_REGISTRY["blank:figure"] = savedBlankFigure;
  check("A-MUTATION GREEN (restored): resolveWholeObject(unknown,\"figure\") resolves blank:figure again",
    resolveWholeObject(UNKNOWN, "figure") === savedBlankFigure, "");
}

// ============================================================================
// SECTION B — dm.js ambientPresence + codex.js's shared codexAmbientPresenceFor (jsdom)
// ============================================================================
console.log("\n=== SECTION B: ambientPresence digest wiring (jsdom, classic modules) ===");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const CLASSIC_FILES = man.loadOrder.filter((p) => p.endsWith(".js"));
const moduleSrc = CLASSIC_FILES.map(read).join("\n;\n");
const TABLES_SRC = read("tables.js");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null; var GS={dm:{},combat:{active:false}};
  function toast(){} function renderWorld(){} function wakeReveal(){}`;

function freshWin(customSrc) {
  const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`,
    { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + (customSrc || (TABLES_SRC + "\n;\n" + moduleSrc)));
  return win;
}

function freshWorld(over) {
  return Object.assign({
    id: "w1", name: "Test World", session: 1, currentNodeId: "home",
    map: { nodes: { home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, edges: [] },
    ledger: [], clock: { day: 1, min: 600 }, dmlog: [{ role: "player", text: "already-going" }], dm: {}, gazetteer: [],
    characters: [{ status: "living", name: "Wren", conditions: [], sheet: { level: 3, hp: 20, hpCur: 20, mods: {}, skillProfs: [] } }],
    factions: [], pressures: [],
    seed: { master: { name: "Test Realm", desc: "d" }, smell: { name: "s" }, sound: { name: "n" }, arch: { name: "a" },
      taboo: { name: "t", desc: "td" }, myth: { name: "m", desc: "md" } },
  }, over || {});
}
function stubActiveWorld(win, w) { win.U.worlds[w.id] = w; win.U.activeWorldId = w.id; }
function addAmbient(win, w, nodeId, n, startIdx) {
  const ids = [];
  for (let i = (startIdx || 0); i < (startIdx || 0) + n; i++) {
    const id = "npc:ambient-" + nodeId + "-" + i;
    win.codexAdd(w, { id, kind: "npc", name: "Ambient " + i, provenance: "rolled",
      status: { soft: true, at: nodeId }, dm: { ambient: true } });
    ids.push(id);
  }
  return ids;
}

{
  console.log("\n--- B1: node-scene ambientPresence ---");
  const win = freshWin();
  const w = freshWorld();
  stubActiveWorld(win, w);
  addAmbient(win, w, "home", 3);
  let d = win.dmDigest();
  check("d.ambientPresence.count === 3 for 3 soft ambients at currentNodeId",
    d.ambientPresence && d.ambientPresence.count === 3, JSON.stringify(d.ambientPresence));
  check("d.ambientPresence.texture is a non-empty place-tier stock phrase (no names)",
    d.ambientPresence && typeof d.ambientPresence.texture === "string" && d.ambientPresence.texture.length > 0
      && !/Ambient \d/.test(d.ambientPresence.texture), JSON.stringify(d.ambientPresence));

  console.log("\n--- B2: codex_contact drops the count; the contacted record rides full ---");
  const contactedId = "npc:ambient-home-0";
  win.codexContact(w, contactedId);
  d = win.dmDigest();
  check("count drops from 3 to 2 after contacting one ambient", d.ambientPresence && d.ambientPresence.count === 2, JSON.stringify(d.ambientPresence));
  check("the newly-contacted record now rides the FULL codex set (rule 1, pre-existing)",
    Array.isArray(d.codex) && d.codex.some((r) => r.id === contactedId), JSON.stringify(d.codex && d.codex.map((r) => r.id)));

  console.log("\n--- B3: zero ambients -> null ---");
  const w3 = freshWorld();
  stubActiveWorld(win, w3);
  const d3 = win.dmDigest();
  check("d.ambientPresence is null with no ambient records at all", d3.ambientPresence === null, JSON.stringify(d3.ambientPresence));

  console.log("\n--- B-§9.3: an untouched ambient stays out of the full codex[] while its aggregate rides ---");
  const w4 = freshWorld();
  stubActiveWorld(win, w4);
  addAmbient(win, w4, "home", 1);
  // ack the mint itself (simulate "already acked through this turn", same convention as
  // dev/verify-digest-diet.mjs §7.1) so rule 4's touchedSeq>ackSeq delta doesn't independently
  // carry the fresh record full — isolating rule 1's untouchedAmbient exclusion, the thing under test.
  w4.dm.digestAckSeq = win.codexOf(w4).seq;
  const d4 = win.dmDigest();
  check("the untouched ambient record itself does NOT appear in the full codex[] (still suppressed)",
    Array.isArray(d4.codex) ? !d4.codex.some((r) => r.id === "npc:ambient-home-0") : true, JSON.stringify(d4.codex));
  check("...but its aggregate presence line IS visible (count:1) — the digest rises to match the table",
    d4.ambientPresence && d4.ambientPresence.count === 1, JSON.stringify(d4.ambientPresence));
}

// ============================================================================
// B4/B5 — activeWalkDigest's own ambientPresence (needs a real active walk)
// ============================================================================
{
  console.log("\n--- B4/B5: activeWalkDigest's ambientPresence sibling of `cast` ---");
  const win = freshWin();
  const w = freshWorld();
  stubActiveWorld(win, w);
  win.startPrep(w);
  const urbanId = Object.keys(w.prep.nodes).find((id) => w.prep.nodes[id].env === "urban");
  check("startPrep minted an urban frontier node to test against", !!urbanId, JSON.stringify(Object.keys(w.prep.nodes || {})));
  if (urbanId) {
    win.lockOnContact(w, urbanId);
    addAmbient(win, w, urbanId, 2);
    // a DIFFERENT ambient count at "home" (currentNodeId) proves the two fields don't conflate
    addAmbient(win, w, "home", 3);
    const d = win.dmDigest();
    check("d.activeWalk is present (the walk locked)", !!d.activeWalk, "");
    check("d.activeWalk.ambientPresence.count === 2 (the walk NODE's own ambients)",
      d.activeWalk && d.activeWalk.ambientPresence && d.activeWalk.ambientPresence.count === 2, JSON.stringify(d.activeWalk && d.activeWalk.ambientPresence));
    check("d.ambientPresence.count === 3 (the CURRENT node's ambients — independent of the walk field)",
      d.ambientPresence && d.ambientPresence.count === 3, JSON.stringify(d.ambientPresence));
  }
}

console.log("\n--- B6: DM_DIGEST_KEYS + dm-contract.json parity ---");
{
  const dmSrc = read("src/world/dm.js");
  check("DM_DIGEST_KEYS lists \"ambientPresence\"", /DM_DIGEST_KEYS\s*=\s*\[[^\]]*"ambientPresence"[^\]]*\]/.test(dmSrc), "");
  const contract = JSON.parse(read("dm-contract.json"));
  check("dm-contract.json digest.topLevelKeys includes \"ambientPresence\"",
    Array.isArray(contract.digest && contract.digest.topLevelKeys) && contract.digest.topLevelKeys.includes("ambientPresence"),
    JSON.stringify(contract.digest && contract.digest.topLevelKeys));
  check("dm-contract.json digest.notes carries an \"ambientPresence\" clause",
    contract.digest && contract.digest.notes && typeof contract.digest.notes.ambientPresence === "string", "");
}

// ============================================================================
// B-CALL-IDENTITY SPY + B-MUTATION — the two consumers share ONE function, by identity
// ============================================================================
console.log("\n--- B-CALL-IDENTITY SPY: both consumers reach the identical global function ---");
function runSpyScenario(win) {
  const w = freshWorld();
  stubActiveWorld(win, w);
  win.startPrep(w);
  const urbanId = Object.keys(w.prep.nodes).find((id) => w.prep.nodes[id].env === "urban");
  win.lockOnContact(w, urbanId);
  addAmbient(win, w, urbanId, 1);
  addAmbient(win, w, "home", 1);

  const real = win.codexAmbientPresenceFor;
  let spyCalls = 0;
  win.codexAmbientPresenceFor = function () { spyCalls++; return real.apply(this, arguments); };
  const d = win.dmDigest();
  return { spyCalls, d };
}
{
  const win = freshWin();
  const { spyCalls, d } = runSpyScenario(win);
  check("clean tree: the patched slot is hit by BOTH consumers (spyCalls === 2) — node-scene + activeWalk",
    spyCalls === 2, "spyCalls=" + spyCalls);
  check("...and both branches still produced correct output through the spy (sanity, not vacuous)",
    d.ambientPresence && d.ambientPresence.count === 1 && d.activeWalk && d.activeWalk.ambientPresence && d.activeWalk.ambientPresence.count === 1,
    JSON.stringify({ top: d.ambientPresence, walk: d.activeWalk && d.activeWalk.ambientPresence }));
}

console.log("\n--- B-MUTATION [RED-FIRST]: one consumer rewired to a decoy function ---");
{
  const dmSrc = read("src/world/dm.js");
  const marker = "ambientPresence:(typeof codexAmbientPresenceFor===\"function\")?codexAmbientPresenceFor(w, w.currentNodeId):null,";
  if (!dmSrc.includes(marker)) {
    fail++; console.log("  ✗ B-MUTATION: node-scene call-site marker text not found verbatim — source drifted?");
  } else {
    // The decoy is a genuinely INDEPENDENT reimplementation (never delegates to the shared
    // function) — simulating a second consumer that drifted into its own filter instead of
    // sharing the one boundary. If it merely called through to codexAmbientPresenceFor internally,
    // the spy would still fire (indirectly) and this mutation would never go red.
    const decoyDecl = `\nfunction codexAmbientPresenceForDRIFT(w, id){
      if(!id || typeof codexOf!=="function") return null;
      var C=codexOf(w), count=0;
      Object.values(C.records||{}).forEach(function(r){
        if(r.dm && r.dm.ambient && r.status && r.status.soft && r.status.at===id) count++;
      });
      if(count<=0) return null;
      return { count: count, texture: "drifted-independent-filter" };
    }\n`;
    const mutatedMarker = "ambientPresence:(typeof codexAmbientPresenceForDRIFT===\"function\")?codexAmbientPresenceForDRIFT(w, w.currentNodeId):null,";
    const mutatedDmSrc = decoyDecl + dmSrc.replace(marker, mutatedMarker);
    const mutSrc = TABLES_SRC + "\n;\n" + CLASSIC_FILES.map((p) => (p === "src/world/dm.js" ? mutatedDmSrc : read(p))).join("\n;\n");
    const mwin = freshWin(mutSrc);
    const { spyCalls, d } = runSpyScenario(mwin);
    check("B-MUTATION RED: under the drift, the patched slot is hit only ONCE (the walk consumer) — "
        + "the node-scene consumer silently escaped to a different function, exactly the drift this check exists to catch",
      spyCalls === 1, "spyCalls=" + spyCalls);
    check("...yet the node-scene value STILL looks fine on its own (count:1) — proving \"equal values\" alone would have missed this",
      d.ambientPresence && d.ambientPresence.count === 1, JSON.stringify(d.ambientPresence));
  }
}
console.log("  (i) B-MUTATION restore: no in-memory mutation was made to the real dm.js — the mutated source only ever existed in a throwaway jsdom window.");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail > 0 ? 1 : 0);
