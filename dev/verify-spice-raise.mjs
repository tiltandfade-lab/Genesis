/* verify-spice-raise.mjs — headless test for SPICE-RAISE (docs/SPICE-RAISE.md, SPEC-LOCKED
   2026-07-06): the band-first roll layer at region-tier weights supersedes the flat 66/20/9/4/1
   walk-spice curve as PLAY distribution (row layout stays an authoring-coverage floor only).

   RED-FIRST per the spec's §7 build-order contract: this harness is written and run against the
   UN-FIXED tree first (capturing the old-curve numbers in the failure messages), THEN §3's edit
   sites are applied and the harness is re-run for green. 12 checks:

   1. Baseline curve moved (mutation check — BUG-01 lesson: assert the VALUE moved, not just that
      a symbol exists). 2. rim tier shares. 3. fray2 tier shares. 4. band-first defeats the
      authored layout (rollTableSpiced vs a paired flat rollTable control on the same table).
      5. rollTableAtBand row/band/bandTarget shape. 6. step-down ruling on a fixture table.
      7. spiceTierAt boundaries. 8. gate shares (walkIsStrangePlus/walkIsVolatilePlus).
      9. walk assembly stamps GS.walkSpiceTier + walk.spiceTier. 10. fraySpiceFloor retired.
      11. regionEnsure mints spiceTier+rim at rim coords, write-once. 12. digest carries spiceTier.

   Loads EVERY module in manifest load order (+ tables.js) into one jsdom global scope — same
   "const-via-eval" pattern as dev/verify-regions.mjs / dev/verify-walk-refresh.mjs (jsdom resolved
   per CLAUDE.md "headless test"; override JSDOM_HOME if not at ~/.genesis-jsdom).
   Run: node dev/verify-spice-raise.mjs   (from repo root) */
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
// top-level `const` (SPICE_ORDER, SPICE_WEIGHTS, FRAY_*) don't attach to jsdom's `window` under
// win.eval (same gotcha documented in verify-regions.mjs/verify-gen.mjs) — thin accessor wrappers
// expose them to the harness without changing production code.
const accessors = "function __spiceWeights(){return (typeof SPICE_WEIGHTS!=='undefined')?SPICE_WEIGHTS:null;} " +
  "function __frayD(){return FRAY_D;} function __fray1(){return FRAY_1;} function __fray2(){return FRAY_2;}";
const srcText = read("tables.js") + "\n;\n" + moduleSrc + "\n;\n" + accessors;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

function baseWorld(id){
  return {
    id, name: "The Spice Raise Test",
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
  const world = baseWorld("w-spice-" + Math.random().toString(36).slice(2));
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
// 1. Baseline curve moved — MUTATION CHECK: assert the VALUE moved (BUG-01 lesson), not merely that
//    a symbol exists. 20,000 draws of walkSpiceBand() with no GS tier set (-> "baseline").
// ============================================================
{ const { win } = freshDom();
  if (typeof win.GS !== "undefined") win.GS.walkSpiceTier = undefined;
  const N = 20000; const counts = {};
  for (let i = 0; i < N; i++) { const b = win.walkSpiceBand(); counts[b] = (counts[b] || 0) + 1; }
  const grounded = (counts.Grounded || 0) / N, mythic = (counts.Mythic || 0) / N;
  check("1. Baseline curve MOVED: Grounded share in [0.23,0.27] (OLD flat curve gave ~0.66) AND Mythic share in [0.065,0.095] (OLD gave ~0.01)",
    grounded >= 0.23 && grounded <= 0.27 && mythic >= 0.065 && mythic <= 0.095,
    `grounded=${grounded.toFixed(4)} (want ~0.25, old-code value observed ~0.66) mythic=${mythic.toFixed(4)} (want ~0.08, old-code value observed ~0.01)`);
}

// ============================================================
// 2. walkSpiceBand("rim") shares: zero Grounded, Volatile [0.42,0.48], Mythic [0.22,0.28].
// ============================================================
{ const { win } = freshDom();
  const N = 20000; const counts = {};
  for (let i = 0; i < N; i++) { const b = win.walkSpiceBand("rim"); counts[b] = (counts[b] || 0) + 1; }
  const grounded = counts.Grounded || 0, volatile_ = (counts.Volatile || 0) / N, mythic = (counts.Mythic || 0) / N;
  check("2. walkSpiceBand('rim'): Grounded===0, Volatile in [0.42,0.48], Mythic in [0.22,0.28]",
    grounded === 0 && volatile_ >= 0.42 && volatile_ <= 0.48 && mythic >= 0.22 && mythic <= 0.28,
    JSON.stringify({ grounded, volatile: volatile_, mythic }));
}

// ============================================================
// 3. spiceBandPick("fray2") shares: Grounded===0, Textured[.08,.12], Strange[.32,.38],
//    Volatile[.32,.38], Mythic[.17,.23].
// ============================================================
{ const { win } = freshDom();
  const hasFn = typeof win.spiceBandPick === "function";
  const N = 20000; const counts = {};
  if (hasFn) for (let i = 0; i < N; i++) { const b = win.spiceBandPick("fray2"); counts[b] = (counts[b] || 0) + 1; }
  const g = counts.Grounded || 0, t = (counts.Textured || 0) / N, s = (counts.Strange || 0) / N,
        v = (counts.Volatile || 0) / N, m = (counts.Mythic || 0) / N;
  check("3. spiceBandPick('fray2'): Grounded===0, Textured[.08,.12], Strange[.32,.38], Volatile[.32,.38], Mythic[.17,.23] (" +
    (hasFn ? "present" : "ABSENT — RED, pre-fix") + ")",
    hasFn && g === 0 && t >= 0.08 && t <= 0.12 && s >= 0.32 && s <= 0.38 && v >= 0.32 && v <= 0.38 && m >= 0.17 && m <= 0.23,
    JSON.stringify({ grounded: g, textured: t, strange: s, volatile: v, mythic: m }));
}

// ============================================================
// 4. Band-first defeats the authored layout — mutation on the COMPILED path: rollTableSpiced at
//    baseline produces bands close to 25/25/25/17/8 even though the table's own row layout is
//    66/20/9/4/1 (shown by a paired flat-roll control on the SAME table).
// ============================================================
{ const { win } = freshDom();
  const N = 10000; const spicedCounts = {}, flatCounts = {};
  const hasFn = typeof win.rollTableSpiced === "function";
  if (hasFn) {
    for (let i = 0; i < N; i++) {
      const r = win.rollTableSpiced("walk-skin-urban", "baseline");
      if (r) spicedCounts[r.band] = (spicedCounts[r.band] || 0) + 1;
    }
  }
  for (let i = 0; i < N; i++) {
    const r = win.rollTable("walk-skin-urban");
    if (r) flatCounts[r.band] = (flatCounts[r.band] || 0) + 1;
  }
  const target = { Grounded: 25, Textured: 25, Strange: 25, Volatile: 17, Mythic: 8 };
  const withinTol = Object.keys(target).every(b => {
    const share = ((spicedCounts[b] || 0) / N) * 100;
    return Math.abs(share - target[b]) <= 2.5;
  });
  check("4. rollTableSpiced('walk-skin-urban','baseline') bands within ±2.5pts of 25/25/25/17/8 (rollTableSpiced " +
    (hasFn ? "present" : "ABSENT — RED, pre-fix") + "); paired flat rollTable control on the same table shows the OLD layout share",
    hasFn && withinTol,
    `spiced=${JSON.stringify(spicedCounts)} flatControlGroundedShare=${((flatCounts.Grounded||0)/N).toFixed(3)} (expected ~0.66 — the table layout itself, unmoved)`);
}

// ============================================================
// 5. rollTableAtBand("walk-skin-urban","Mythic") — every result has band/bandTarget==="Mythic" and
//    total inside a row range whose row[2]==="Mythic".
// ============================================================
{ const { win } = freshDom();
  const hasFn = typeof win.rollTableAtBand === "function";
  let allMythic = false, allInRange = false;
  if (hasFn) {
    const draws = [];
    for (let i = 0; i < 50; i++) draws.push(win.rollTableAtBand("walk-skin-urban", "Mythic"));
    allMythic = draws.every(r => r && r.band === "Mythic" && r.bandTarget === "Mythic");
    const tableRows = win.eval("window.GENESIS_TABLES['walk-skin-urban'].rows");
    allInRange = draws.every(r => tableRows.some(row => row[2] === "Mythic" && r.total >= row[0] && r.total <= row[1]));
  }
  check("5. rollTableAtBand('walk-skin-urban','Mythic') 50 draws: band===bandTarget==='Mythic', total in a Mythic row range (" +
    (hasFn ? "present" : "ABSENT — RED, pre-fix") + ")",
    hasFn && allMythic && allInRange, `allMythic=${allMythic} allInRange=${allInRange}`);
}

// ============================================================
// 6. Step-down ruling: a fixture table with no Mythic row asked for Mythic serves its hottest
//    available band (Strange here), never invents heat, never returns null/throws.
// ============================================================
{ const { win } = freshDom();
  const hasFn = typeof win.rollTableAtBand === "function";
  let allStrange = false, allBandTargetMythic = false;
  if (hasFn) {
    win.eval(`window.GENESIS_TABLES["spice-raise-fixture"]={dice:"d10",rows:[[1,6,"Grounded","g",""],[7,9,"Textured","t",""],[10,10,"Strange","s",""]]};`);
    const draws = [];
    for (let i = 0; i < 20; i++) draws.push(win.rollTableAtBand("spice-raise-fixture", "Mythic"));
    allStrange = draws.every(r => r && r.band === "Strange");
    allBandTargetMythic = draws.every(r => r && r.bandTarget === "Mythic");
  }
  check("6. Step-down: fixture table with ceiling Strange asked for Mythic -> band==='Strange', bandTarget==='Mythic' (" +
    (hasFn ? "present" : "ABSENT — RED, pre-fix") + ")",
    hasFn && allStrange && allBandTargetMythic, `allStrange=${allStrange} allBandTargetMythic=${allBandTargetMythic}`);
}

// ============================================================
// 7. spiceTierAt boundaries: (10,0)->baseline, (16,0)->fray1, (29,0)->fray2, (41,0)->rim,
//    (null,null)->baseline.
// ============================================================
{ const { win } = freshDom();
  const hasFn = typeof win.spiceTierAt === "function";
  let results = null;
  if (hasFn) {
    results = {
      baseline: win.spiceTierAt(10, 0),
      fray1: win.spiceTierAt(16, 0),
      fray2: win.spiceTierAt(29, 0),
      rim: win.spiceTierAt(41, 0),
      nullCoords: win.spiceTierAt(null, null),
    };
  }
  check("7. spiceTierAt boundaries: (10,0)=baseline (16,0)=fray1 (29,0)=fray2 (41,0)=rim (null,null)=baseline (" +
    (hasFn ? "present" : "ABSENT — RED, pre-fix") + ")",
    hasFn && results.baseline === "baseline" && results.fray1 === "fray1" && results.fray2 === "fray2" &&
      results.rim === "rim" && results.nullCoords === "baseline",
    JSON.stringify(results));
}

// ============================================================
// 8. Gate shares: walkIsStrangePlus() baseline share in [.46,.54]; rim share in [.92,.98];
//    walkIsVolatilePlus("baseline") share in [.21,.29].
// ============================================================
{ const { win } = freshDom();
  const N = 2000;
  if (typeof win.GS !== "undefined") win.GS.walkSpiceTier = "baseline";
  let trueBaseline = 0;
  for (let i = 0; i < N; i++) if (win.walkIsStrangePlus()) trueBaseline++;
  if (typeof win.GS !== "undefined") win.GS.walkSpiceTier = "rim";
  let trueRim = 0;
  for (let i = 0; i < N; i++) if (win.walkIsStrangePlus()) trueRim++;
  const baselineShare = trueBaseline / N, rimShare = trueRim / N;
  const hasVolFn = typeof win.walkIsVolatilePlus === "function";
  let volShare = null;
  if (hasVolFn) {
    let trueVol = 0;
    for (let i = 0; i < N; i++) if (win.walkIsVolatilePlus("baseline")) trueVol++;
    volShare = trueVol / N;
  }
  check("8. Gate shares: walkIsStrangePlus baseline in [.46,.54], rim in [.92,.98]; walkIsVolatilePlus('baseline') in [.21,.29] (" +
    (hasVolFn ? "present" : "ABSENT — RED, pre-fix") + ")",
    baselineShare >= 0.46 && baselineShare <= 0.54 && rimShare >= 0.92 && rimShare <= 0.98 &&
      hasVolFn && volShare >= 0.21 && volShare <= 0.29,
    JSON.stringify({ baselineShare, rimShare, volShare }));
}

// ============================================================
// 9. Walk stamp: rollUrbanWalk({segCount:4}) (no world -> baseline path) returns walk.spiceTier
//    ==="baseline"; GS.walkSpiceTier==="baseline" after the call.
// ============================================================
{ const { win } = freshDom();
  if (typeof win.GS !== "undefined") win.GS.walkSpiceTier = "rim"; // pre-set to something ELSE, prove the stamp overwrites it
  const uw = win.rollUrbanWalk({ segCount: 4 });
  const hasField = "spiceTier" in uw;
  const gsVal = typeof win.GS !== "undefined" ? win.GS.walkSpiceTier : null;
  check("9. rollUrbanWalk (no world) stamps walk.spiceTier==='baseline' and GS.walkSpiceTier==='baseline' after the call",
    hasField && uw.spiceTier === "baseline" && gsVal === "baseline",
    `walk.spiceTier=${JSON.stringify(uw.spiceTier)} GS.walkSpiceTier=${JSON.stringify(gsVal)}`);
}

// ============================================================
// 10. fraySpiceFloor retired: typeof win.fraySpiceFloor === "undefined".
// ============================================================
{ const { win } = freshDom();
  check("10. fraySpiceFloor retired (typeof === 'undefined')", typeof win.fraySpiceFloor === "undefined",
    `typeof fraySpiceFloor === ${typeof win.fraySpiceFloor}`);
}

// ============================================================
// 11. regionEnsure at rim coords mints spiceTier==='rim' and rim===true; second call is a pure
//     cache read (write-once, no re-roll).
// ============================================================
{ const { win, world } = freshDom();
  const rec1 = win.regionEnsure(world, 45, 0);
  const rec2 = win.regionEnsure(world, 45, 0);
  check("11. regionEnsure at rim coords mints spiceTier==='rim' and rim===true; write-once (same object on 2nd call)",
    rec1 && rec1.spiceTier === "rim" && rec1.rim === true && rec1 === rec2,
    JSON.stringify({ spiceTier: rec1 && rec1.spiceTier, rim: rec1 && rec1.rim, sameObj: rec1 === rec2 }));
}

// ============================================================
// 12. Digest: with an active walk installed (verify-walk-refresh's §5b/§5c technique),
//     activeWalkDigest(w) carries spiceTier as a string in {baseline,fray1,fray2,rim}.
// ============================================================
{ const { win, world, originId } = freshDom();
  const uw = win.rollUrbanWalk({ segCount: 4, tier: 1 });
  const P = win.prepOf(world);
  P.nodes[originId] = { env: "urban", soft: false, locked: false, hook: null, walk: uw, cursor: null };
  win.walkSetActive(world, originId);
  const digest = win.activeWalkDigest(world);
  const ok = digest && typeof digest.spiceTier === "string" &&
    ["baseline", "fray1", "fray2", "rim"].indexOf(digest.spiceTier) >= 0;
  check("12. activeWalkDigest carries spiceTier as a string in {baseline,fray1,fray2,rim}",
    ok, JSON.stringify(digest && digest.spiceTier));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
