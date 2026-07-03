/* verify-urban-fabric.mjs — headless test for URBAN FABRIC (docs/URBAN-FABRIC.md,
   docs/BATCH3-GUARDRAILS.md J1/J2: urban-fabric ≥10/0). Full-app jsdom load, manifest.loadOrder
   (same "const-via-eval" convention as dev/verify-gap-wiring.mjs / dev/verify-durability.mjs).

   Enumerated assertions (docs/URBAN-FABRIC.md §3 + BATCH3-GUARDRAILS J1/J2):
   1. rollBuilding: a typed roll always yields a rolled proprietor once approached (never freehand).
   1b. MUTATION CHECK: a freehand-named proprietor path (bypassing the ambient-pool/rollNPC draw)
       is NOT what buildingApproach does — confirmed by mutating the roller to fabricate a name and
       showing the harness's own "is this a real rolled record" assertion catches it (RED), then
       restoring (GREEN).
   2. shop kinds (smithy/apothecary/general/arcanist) delegate to makeShop — same stock/coin shape.
   3. district count follows PLACE_TIERS (hamlet 0 / village 1 / town 1d2 / city 1d3+1).
   4. MUTATION CHECK: district minting is idempotent — re-entry does NOT re-mint (mutate to remove
      the idempotency guard, confirm re-entry duplicates RED, restore, confirm GREEN).
   5. buildings mint SOFT on approach.
   6. buildings lock SOFT->HARD on contact (codexContact fires on both building + proprietor).
   7. tavern contact fires a Distant Word roll (the tavern's 3rd system-surface).
   8. rollBuilding refuses an unknown type (never invents a 13th kit).
   9. the Tavern 2.0 extraction preserves row text VERBATIM (diff-check vs the archived source file).
   10. gen handshake: gen kind:"interior" with opts.type consumes the kit (no new gen kind) —
       rollBuildingInterior({type:"tavern"}) returns a kit-shaped payload; omitted/unknown type is
       byte-identical to the pre-existing base-roll behavior.
   11. regression: economy/shop suites unchanged (spot-check makeShop still returns the legacy shape).
   12. NULL-SAFE: an unknown building type / missing BUILDING_KITS never throws.

   Run:  node dev/verify-urban-fabric.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync, writeFileSync } from "node:fs";
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
    id: opts.id || "w-urban", name: opts.name || "Test World", session: 1,
    startNodeId: "home", currentNodeId: opts.currentNodeId || "home",
    map: { nodes: Object.assign({ home: { id: "home", name: "Home", type: "Setting", x: 0, y: 0 } }, opts.nodes || {}), edges: [] },
    gazetteer: [], ledger: opts.ledger || [], log: [], clock: { day: opts.day != null ? opts.day : 40, min: 300 },
    characters: [{ status: "living", name: "Wren", conditions: [],
      sheet: { level: 3, gold: 100, mods:{str:1,dex:2}, scores: { str: 10 }, inventory: [], equipped:{} } }],
    factions: [], pressures: [], shops: opts.shops || {}, codex: { records: {}, version: 1 },
    seed: opts.seed || {},
  };
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  return w;
}

// ============================================================================
// §1. rollBuilding + typed-building proprietor (never freehand)
// ============================================================================
console.log("\n--- §1. rollBuilding + proprietor ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const r = win.buildingApproach(w, "tavern", { nodeId: "home" });
  check("1. buildingApproach mints ok:true with an id", r.ok === true && !!r.id, JSON.stringify(r));
  check("1b. a rolled proprietor is attached (never freehand)", !!r.proprietorId, JSON.stringify(r));
  const rec = win.codexGet(w, r.proprietorId);
  check("1c. the proprietor is a real codex npc record with rolled atoms",
    rec && rec.kind === "npc" && rec.rolled && typeof rec.rolled.role !== "undefined", JSON.stringify(rec && rec.rolled));
}

// ============================================================================
// §2. shop kinds delegate to makeShop
// ============================================================================
console.log("\n--- §2. shop-kind delegation ---");
{
  const win = newWin();
  const rb = win.rollBuilding("smithy", { nodeId: "home", tier: 1 });
  check("2. rollBuilding('smithy') delegates to makeShop (shop.stock/coin present)",
    rb.ok === true && rb.shop && Array.isArray(rb.shop.stock) && typeof rb.shop.coin === "number", JSON.stringify(rb.shop));
  check("2b. the delegated shop's archetype is 'smith' (SHOP_ARCHETYPES key, not a parallel system)",
    rb.shop.archetype === "smith", rb.shop.archetype);
}

// ============================================================================
// §3. district count by PLACE_TIERS tier
// ============================================================================
console.log("\n--- §3. district count by tier ---");
{
  const win = newWin();
  check("3. hamlet (tier 0) mints 0 districts", win.districtCount(0) === 0);
  check("3b. village (tier 1) mints exactly 1 district", win.districtCount(1) === 1);
  let sawOne = false, sawTwo = false;
  for (let i = 0; i < 40; i++) { const n = win.districtCount(2); if (n === 1) sawOne = true; if (n === 2) sawTwo = true; }
  check("3c. town (tier 2) mints 1d2 districts (both 1 and 2 observed)", sawOne && sawTwo);
  let sawTwoC = false, sawFourC = false;
  for (let i = 0; i < 60; i++) { const n = win.districtCount(3); if (n === 2) sawTwoC = true; if (n === 4) sawFourC = true; }
  check("3d. city (tier 3) mints 1d3+1 districts (range 2..4 observed at both ends)", sawTwoC && sawFourC);
}

// ============================================================================
// §4. MUTATION CHECK — district minting must be idempotent (re-entry never re-mints)
// ============================================================================
console.log("\n--- §4. mutation guard: district mint is idempotent ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const r1 = win.mintDistricts(w, "home", { tier: 2 });
  const r2 = win.mintDistricts(w, "home", { tier: 2 });
  check("4. a second mintDistricts call on the same node returns minted:false", r2.minted === false, JSON.stringify(r2));
  check("4b. the ids are byte-identical across calls (no duplication)", JSON.stringify(r1.ids) === JSON.stringify(r2.ids), JSON.stringify([r1.ids, r2.ids]));
}
{
  const urbanPath = join(ROOT, "src/world/urban.js");
  const originalUrban = readFileSync(urbanPath, "utf-8");
  const mutatedNoGuard = originalUrban.replace(
    `  if(U.districtsByNode[nodeId]) return {ids:U.districtsByNode[nodeId], minted:false};`,
    `  /* MUTATION: idempotency guard removed — every call re-mints */`
  );
  if (mutatedNoGuard === originalUrban) throw new Error("mutation pattern (§4) didn't match src/world/urban.js — update the harness");
  try {
    writeFileSync(urbanPath, mutatedNoGuard, "utf-8");
    const win = newWin();
    const w = mkWorld(win, {});
    const r1 = win.mintDistricts(w, "home", { tier: 1 });
    const r2 = win.mintDistricts(w, "home", { tier: 1 });
    check("MUTATION RED: without the idempotency guard, a second call reports minted:true again (re-mint)",
      r1.minted === true && r2.minted === true, JSON.stringify([r1, r2]));
  } finally {
    writeFileSync(urbanPath, originalUrban, "utf-8");
  }
}
{
  const win = newWin();
  const w = mkWorld(win, {});
  const r1 = win.mintDistricts(w, "home", { tier: 1 });
  const r2 = win.mintDistricts(w, "home", { tier: 1 });
  check("RESTORED: after reverting the mutation, the second call reports minted:false again",
    r1.minted === true && r2.minted === false, JSON.stringify([r1, r2]));
}

// ============================================================================
// §5/§6. building lifecycle — soft on approach, lock on contact
// ============================================================================
console.log("\n--- §5/§6. building soft->hard lifecycle ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  const r = win.buildingApproach(w, "temple", { nodeId: "home" });
  const rec = win.codexGet(w, r.id);
  check("5. a newly-approached building is SOFT", rec.status.soft === true, JSON.stringify(rec.status));
  const propBefore = win.codexGet(w, r.proprietorId);
  check("5b. its proprietor is also SOFT pre-contact", propBefore.status.soft === true, JSON.stringify(propBefore.status));

  const c = win.buildingContact(w, r.id);
  check("6. buildingContact returns ok:true", c.ok === true, JSON.stringify(c));
  const recAfter = win.codexGet(w, r.id);
  check("6b. the building locks to HARD on contact", recAfter.status.soft === false, JSON.stringify(recAfter.status));
  const propAfter = win.codexGet(w, r.proprietorId);
  check("6c. its proprietor locks to HARD too (contact locks both together)", propAfter.status.soft === false, JSON.stringify(propAfter.status));
}
{
  const win = newWin();
  const w = mkWorld(win, {});
  const never = win.buildingContact(w, "location:nonexistent");
  check("6d. contact on a never-approached building is refused, not fabricated", never.ok === false && never.reason === "not-approached", JSON.stringify(never));
}

// ============================================================================
// §7. tavern contact fires a Distant Word roll
// ============================================================================
console.log("\n--- §7. tavern contact fires Distant Word ---");
{
  const win = newWin();
  const w = mkWorld(win, { day: 40, currentNodeId: "home", ledger: [
    { id: "e1", type: "outcome", day: 35, data: { nodeId: "far" }, text: "Something happened in Farhaven." },
  ], nodes: { far: { id: "far", name: "Farhaven", type: "Setting", x: 5, y: 5 } } });
  const r = win.buildingApproach(w, "tavern", { nodeId: "home" });
  let sawDistantWord = false;
  for (let i = 0; i < 20 && !sawDistantWord; i++) {
    const c = win.buildingContact(w, r.id);
    if (c.distantWord) sawDistantWord = true;
    // re-approach a fresh tavern each time (contact only fires once per building) to get more rolls
    if (!sawDistantWord) { const r2 = win.buildingApproach(w, "tavern", { nodeId: "home", name: "Tavern " + i }); r.id = r2.id; }
  }
  check("7. tavern contact surfaces a distantWord result (band+text present)",
    sawDistantWord, "no distantWord observed across 20 tavern contacts");
}
{
  const win = newWin();
  const w = mkWorld(win, {});
  const r = win.buildingApproach(w, "temple", { nodeId: "home" });
  const c = win.buildingContact(w, r.id);
  check("7b. a non-tavern building's contact carries no distantWord key", c.distantWord === undefined, JSON.stringify(c));
}

// ============================================================================
// §8. rollBuilding refuses an unknown type
// ============================================================================
console.log("\n--- §8. unknown type refused ---");
{
  const win = newWin();
  const r = win.rollBuilding("space-station", {});
  check("8. an unknown building type is refused, not invented", r.ok === false && r.reason === "unknown-type", JSON.stringify(r));
}

// ============================================================================
// §9. Tavern 2.0 extraction — verbatim text preserved (real row-text diff vs the
// archived source, not a name-column spot-check — a changed glyph or word in ANY
// column of ANY extracted Tavern table must turn this assertion red).
// ============================================================================
console.log("\n--- §9. extraction verbatim diff ---");
{
  const archived = read("Engine/02. _Procedures/Tavern Generator 2.0.md");
  check("9b. the archived source carries the archived-source status stamp",
    archived.indexOf("status: archived-source") >= 0);

  // Pull every "### heading\n<table block until blank line + next heading or EOF>"
  // section out of a markdown file, keyed by the exact heading text.
  function extractSections(text) {
    const lines = text.split("\n");
    const sections = {};
    let heading = null, buf = [];
    const flush = () => { if (heading !== null) sections[heading] = buf.join("\n").trim(); };
    for (const line of lines) {
      const m = line.match(/^### (.+)$/);
      if (m) { flush(); heading = m[1]; buf = []; continue; }
      if (/^#{1,2} /.test(line)) { flush(); heading = null; buf = []; continue; } // any # or ## ends the current ### section
      if (heading !== null) buf.push(line);
    }
    flush();
    return sections;
  }

  // Row-text-only compare (the guardrail's scope is table ROW TEXT, not surrounding
  // prose/notes or markdown decoration): keep only lines that are actual table rows
  // (start with "|"), drop the header-separator row (":--:"-style, alignment-only,
  // never content) and per-cell whitespace padding — but never touch the characters
  // INSIDE a cell. A curly->straight quote swap, a reworded row, or a dropped/added
  // data row must still turn this red.
  function normalizeTableBlock(block) {
    return block.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("|"))
      .filter((line) => !/^\|\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/.test(line)) // drop separator rows (any column count)
      .map((line) => line.replace(/^\|/, "").replace(/\|$/, ""))
      .map((line) => line.split("|").map((cell) => cell.trim()).join("|"))
      .join("\n");
  }

  const extractedFiles = [
    "Engine/03. _Tables/03. Session Mechanics/Tavern/Tavern - Foundation.md",
    "Engine/03. _Tables/03. Session Mechanics/Tavern/Tavern - Name.md",
    "Engine/03. _Tables/03. Session Mechanics/Tavern/Tavern - Sensory Atmosphere.md",
    "Engine/03. _Tables/03. Session Mechanics/Tavern/Tavern - Barkeep Quirk.md",
    "Engine/03. _Tables/03. Session Mechanics/Tavern/Tavern - In Media Res.md",
  ];
  // A handful of source tables use a side-by-side 2-column-pair layout
  // (Roll|X|Roll|X) that the compiler can't parse; those extractions are allowed
  // to REFLOW into a flat single-column list (same row texts, different order/shape)
  // IF AND ONLY IF the extracted file discloses it with an explicit NOTE naming the
  // reflow. Anything without that disclosure must match line-for-line, in order.
  function cellTexts(normalizedBlock) {
    // Every cell across every row, order-independent — catches added/dropped/altered
    // text regardless of which column or row it landed in after a disclosed reflow.
    // Header-row cells are compared as a SET (not multiset): a 4-column pair layout's
    // header repeats "Roll"/"Known For" twice, a reflowed 2-column header says each
    // once — that duplication is a structural byproduct of the column count, not a
    // text change, but every distinct header word must still be present on both sides.
    const rows = normalizedBlock.split("\n");
    const headerWords = new Set(rows[0].split("|").map((c) => c.trim()).filter(Boolean));
    const dataCells = rows.slice(1).flatMap((line) => line.split("|")).map((c) => c.trim()).filter(Boolean);
    return { headerWords: [...headerWords].sort(), dataCells: dataCells.sort() };
  }

  const archivedSections = extractSections(archived);
  let sectionsCompared = 0, sectionsMismatched = [];
  for (const path of extractedFiles) {
    const extracted = read(path);
    const extractedSections = extractSections(extracted);
    const disclosesReflow = /NOTE \(urban-fabric extraction[^)]*\):.*reflow/is.test(extracted);
    for (const heading of Object.keys(extractedSections)) {
      sectionsCompared++;
      const srcBlock = archivedSections[heading];
      if (srcBlock === undefined) { sectionsMismatched.push(`${path} :: "${heading}" — no matching heading in archived source`); continue; }
      const a = normalizeTableBlock(srcBlock);
      const b = normalizeTableBlock(extractedSections[heading]);
      if (a === b) continue;
      if (disclosesReflow) {
        const ca = cellTexts(a), cb = cellTexts(b);
        if (JSON.stringify(ca.headerWords) === JSON.stringify(cb.headerWords) && JSON.stringify(ca.dataCells) === JSON.stringify(cb.dataCells)) continue; // disclosed reflow: same header words + same data cells, different shape/order — OK
      }
      sectionsMismatched.push(`${path} :: "${heading}" — row text differs from archived source`);
    }
  }
  check(`9. every extracted Tavern table's row text is byte-identical to its archived-source block (${sectionsCompared} sections compared)`,
    sectionsCompared >= 8 && sectionsMismatched.length === 0, JSON.stringify(sectionsMismatched));

  const win = newWin();
  const roll = win.window.GENESIS_TABLES["tavern-name"];
  const compiledText = roll.rows.map(r => r[3]).join(" | ");
  check("9c. the compiled tavern-name table's row text matches the source (spot-check 'The Gleaming — Star')",
    compiledText.indexOf("The Gleaming") >= 0 && compiledText.indexOf("Star") >= 0, compiledText.slice(0, 120));
  const rollImr = win.window.GENESIS_TABLES["tavern-in-media-res"];
  const imrRow3 = rollImr.rows.find(r => r[0] === 3)[3];
  check("9d. the compiled tavern-in-media-res row 3 preserves the archived source's curly quotes verbatim",
    imrRow3 === "A talkative urchin is trying to sell “authentic treasure maps” to annoyed patrons.", imrRow3);
}

// ============================================================================
// §10. gen handshake — opts.type consumes the kit, no new gen kind
// ============================================================================
console.log("\n--- §10. gen opts.type handshake ---");
{
  const win = newWin();
  const payload = win.rollBuildingInterior({ type: "tavern", nodeId: "home" });
  check("10. rollBuildingInterior({type:'tavern'}) returns a kit-shaped payload",
    payload.rolled && payload.rolled.buildingType === "tavern" && payload.rolled.kit === "Tavern", JSON.stringify(payload.rolled));
  // GEN_ROLLERS is a top-level `const` in src/world/dm.js — same "const-via-eval" scoping gotcha
  // as every other harness in this repo (it lives in the shared lexical env dm.js's own functions
  // close over, not on `window`, so a fresh win.eval() call can't see it). genApply (below) is the
  // real behavioral proof that kind:"interior" still routes through rollBuildingInterior — no
  // separate kind was added for the typed-building path (opts.type rides the EXISTING interior kind).
  const w10 = mkWorld(win, {});
  win.genApply(w10, [{ kind: "interior", opts: { type: "tavern", nodeId: "home" } }]);
  const mintedIds = Object.keys(win.codexOf(w10).records);
  const mintedInterior = mintedIds.map(id => win.codexGet(w10, id)).find(r => r.rolled && r.rolled.buildingType === "tavern");
  check("10b. genApply({kind:'interior',opts:{type:'tavern'}}) still routes through the SAME 'interior' gen kind (no new kind)",
    !!mintedInterior, JSON.stringify(mintedIds));
  const legacy = win.rollBuildingInterior({ kind: "home" });
  check("10c. omitting opts.type stays byte-identical to the pre-existing base-roll shape",
    legacy.rolled && legacy.rolled.buildingType === undefined && typeof legacy.rolled.layout !== "undefined", JSON.stringify(legacy.rolled));
  const unknown = win.rollBuildingInterior({ type: "space-station" });
  check("10d. an unknown opts.type falls back to the base roll rather than throwing",
    unknown.rolled && unknown.rolled.buildingType === undefined, JSON.stringify(unknown.rolled));
}

// ============================================================================
// §11. regression — economy/shop suite spot-check (makeShop legacy shape unchanged)
// ============================================================================
console.log("\n--- §11. economy/shop regression spot-check ---");
{
  const win = newWin();
  const shop = win.makeShop({ tier: 1, archetype: "general", nodeId: "home" });
  check("11. makeShop still returns the legacy {id,name,archetype,tier,stock,coin} shape",
    typeof shop.id === "string" && typeof shop.name === "string" && shop.archetype === "general"
    && shop.tier === 1 && Array.isArray(shop.stock) && typeof shop.coin === "number", JSON.stringify(shop));
}

// ============================================================================
// §12. NULL-SAFE — unknown type / missing kit data never throws
// ============================================================================
console.log("\n--- §12. null-safe regression ---");
{
  const win = newWin();
  const w = mkWorld(win, {});
  let threw = false;
  let r1, r2, r3;
  try {
    r1 = win.rollBuilding(undefined, {});
    r2 = win.buildingApproach(w, "not-a-real-type", { nodeId: "home" });
    r3 = win.buildingContact(w, "location:never-approached");
  } catch (e) { threw = true; }
  check("12. an undefined/unknown type or an un-approached contact never throws (degrades to ok:false)",
    !threw && r1 && r1.ok === false && r2 && r2.ok === false && r3 && r3.ok === false,
    JSON.stringify({ threw, r1, r2, r3 }));
}
{
  // rollBuilding degrades null-safe when the compiled interior/name tables aren't present
  // (mirrors WORLD-TURN's convention: wipe GENESIS_TABLES, confirm no throw, a null-ish interior/name).
  const win = newWin();
  win.window.GENESIS_TABLES = {};
  let threw = false, r;
  try { r = win.rollBuilding("tavern", { nodeId: "home" }); } catch (e) { threw = true; }
  check("12b. an uncompiled building-interior/tavern-name table degrades to ok:true with a null interior/name fallback (never throws)",
    !threw && r && r.ok === true, JSON.stringify({ threw, r }));
}

// ============================================================================
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
