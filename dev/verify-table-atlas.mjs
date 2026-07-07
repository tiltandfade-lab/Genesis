/* Verify the Table Atlas — Reference Shelf app #3 (docs/TABLE-ATLAS.md unit U2) — over a full jsdom
   load: every classic module in manifest loadOrder, real data (TABLE_ATLAS_DATA / TABLE_USAGE /
   GENESIS_TABLES from tables.js), same convention as dev/verify-battle-stage.mjs /
   dev/verify-dm-events.mjs (const-via-eval: concatenate every module into ONE eval so top-level
   consts share scope across files).

   Every assertion below checks a VALUE THAT MOVED, not a label (docs/TABLE-ATLAS.md "Regression —
   U2 (RED-FIRST, mutation-asserting)"):
     1. Band histogram is real and covers BOTH band-source paths (architecture-material via
        row[5][0], place-traits via row[2]) — a naive row[2]-only histogram would report all-zero
        bands + unbanded===12 for architecture-material; that wrong value is the RED this test kills.
     2. Wiring joins through TABLE_USAGE (place-secret, verified WIRED via codex-roll.js — see the
        U0 harness's note on why npc-role is NOT the right WIRED example in this corpus).
     3. Roll-count soft-degrade: no ROLL_COUNTS -> "—"; ROLL_COUNTS={npc-role:7} -> renders 7.
     4. Expand proof: registering the Atlas (already done via genesis.html's <script> load) leaves
        THREE REFERENCE_APPS entries with zero edits to reference-shelf.js.
     5. Sort mutation: sorting by roll-count ascending actually reorders the rendered list.

   Run:  node dev/verify-table-atlas.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

const man = JSON.parse(read("manifest.json"));
// every CLASSIC module in real load order (module-type entries, e.g. ref-bestiary.js, are ES
// modules loaded via their own <script type="module"> tag — excluded here same as every other
// jsdom harness in this repo, per each harness's own header note).
const moduleIds = new Set(man.modules.filter((m) => m.type === "module").map((m) => m.path));
const moduleSrc = man.loadOrder
  .filter((p) => p.endsWith(".js") && !moduleIds.has(p))
  .map(read)
  .join("\n;\n");

// GENESIS_TABLES is normally provided by tables.js (a generated, non-manifest artifact per
// check-manifest.py's own `known={"tables.js"}` exemption) — read the real compiled corpus so
// the detail-panel row lookup exercises real data, not a stub.
const tablesJs = read("tables.js");

function freshDom() {
  const dom = new JSDOM(
    `<!doctype html><html><body>
      <div id="refShelf" class="refshelf-overlay" role="dialog" aria-modal="true" hidden>
        <div class="refshelf-shell">
          <div class="refshelf-head"><div id="refShelfTitle"></div></div>
          <div id="refShelfBody"></div>
        </div>
      </div>
      <div id="panel-start" class="active"></div>
      <div id="startView"></div>
    </body></html>`,
    { runScripts: "dangerously" }
  );
  const win = dom.window;
  // minimal harness globals a full renderStart()/showTab() call chain might touch — mirrors the
  // other verify-*.mjs harnesses' "const harness" convention (DM-events harness, battle-stage harness).
  win.eval(`var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;
    function renderStart(){ /* no-op stub: this harness doesn't need the real start-screen paint,
      only that referenceShelfRegister's re-invoke doesn't throw when it calls this */ }`);
  win.eval(tablesJs);
  // top-level `const` in a classic <script> shares lexical scope with subsequent same-scope
  // classic scripts in a REAL browser (the whole app's architecture depends on this — CLAUDE.md),
  // and jsdom's win.eval() correctly replicates that WITHIN one eval call — but (unlike `var`/
  // function declarations) a `const` binding never attaches to `window`, so the Node side can't
  // read it back via `win.CONST_NAME` afterward. Republish the ones this harness inspects onto
  // `window` in the SAME eval call — pure test-scaffolding, changes no app behavior (mirrors the
  // real src/ui/ref-globals-bridge.js's own republish idiom, just for harness introspection).
  win.eval(moduleSrc + `
    ;window.TABLE_ATLAS_DATA = (typeof TABLE_ATLAS_DATA!=="undefined") ? TABLE_ATLAS_DATA : undefined;
    window.TABLE_USAGE = (typeof TABLE_USAGE!=="undefined") ? TABLE_USAGE : undefined;
    window.REFERENCE_APPS = (typeof REFERENCE_APPS!=="undefined") ? REFERENCE_APPS : undefined;
  `);
  return win;
}

// ---------------------------------------------------------------------------------------------
// 1. Band histogram — both source paths.
// ---------------------------------------------------------------------------------------------
{
  const win = freshDom();
  const TAD = win.TABLE_ATLAS_DATA;
  check("TABLE_ATLAS_DATA is a real object (not a stub)", TAD && typeof TAD === "object" && Object.keys(TAD).length > 100);

  // Path B: architecture-material — band carried at row[5][0], row[2] empty.
  const am = TAD["architecture-material"];
  check("architecture-material entry exists", !!am);
  check("architecture-material.bands.Grounded === 8", am && am.bands.Grounded === 8, am && am.bands.Grounded);
  check("architecture-material.bands.Textured === 3", am && am.bands.Textured === 3, am && am.bands.Textured);
  check("architecture-material.bands.Strange === 1", am && am.bands.Strange === 1, am && am.bands.Strange);
  check("architecture-material.bands.Volatile === 0", am && am.bands.Volatile === 0, am && am.bands.Volatile);
  check("architecture-material.bands.Mythic === 0", am && am.bands.Mythic === 0, am && am.bands.Mythic);
  // the naive row[2]-only red this kills: unbanded would wrongly read 12, every band 0
  check("architecture-material.bands.unbanded !== 12 (the wrong-red value)", am && am.bands.unbanded !== 12, am && am.bands.unbanded);

  // Path A: place-traits — band carried at row[2] (a real Band header).
  const pt = TAD["place-traits"];
  check("place-traits entry exists", !!pt);
  check("place-traits.bands.Grounded === 66", pt && pt.bands.Grounded === 66, pt && pt.bands.Grounded);
  check("place-traits.bands.Mythic === 1", pt && pt.bands.Mythic === 1, pt && pt.bands.Mythic);
}

// ---------------------------------------------------------------------------------------------
// 2. Wiring joins through TABLE_USAGE.
// ---------------------------------------------------------------------------------------------
{
  const win = freshDom();
  const TAD = win.TABLE_ATLAS_DATA;
  const ps = TAD["place-secret"];
  check("place-secret entry exists", !!ps);
  check('place-secret.wiring === "WIRED"', ps && ps.wiring === "WIRED", ps && ps.wiring);
  check("place-secret.consumers.code contains codex-roll.js",
    ps && Array.isArray(ps.consumers.code) && ps.consumers.code.includes("codex-roll.js"),
    ps && JSON.stringify(ps.consumers));
}

// ---------------------------------------------------------------------------------------------
// 3. Roll-count soft-degrade.
// ---------------------------------------------------------------------------------------------
{
  // (a) no ROLL_COUNTS global at all -> renders "—", never throws.
  const win = freshDom();
  win.eval("delete window.ROLL_COUNTS;"); // ensure absent regardless of data/roll-counts.js's committed state
  let threw = null;
  let html = "";
  try {
    win._refAtlasSelect("place-secret");
    html = win.document.getElementById("refShelfBody").innerHTML;
  } catch (e) { threw = e; }
  check("no throw when ROLL_COUNTS is absent", threw === null, threw && threw.message);
  check('renders "—" for roll count when ROLL_COUNTS is absent', html.includes(">—<") || html.includes("no roll data"), html.slice(0, 400));

  // (b) ROLL_COUNTS={"place-secret":7} -> the rendered row shows 7 (the value MOVED from — to 7).
  const win2 = freshDom();
  win2.eval('window.ROLL_COUNTS = {"place-secret": 7};');
  win2._refAtlasSelect("place-secret");
  const html2 = win2.document.getElementById("refShelfBody").innerHTML;
  check("renders 7 once ROLL_COUNTS.place-secret = 7 (value moved from — to 7)", />7<|"fired 7 times/.test(html2), html2.slice(0, 400));
}

// ---------------------------------------------------------------------------------------------
// 4. Expand proof — three REFERENCE_APPS entries, zero edits to reference-shelf.js.
// ---------------------------------------------------------------------------------------------
{
  const win = freshDom();
  const apps = win.REFERENCE_APPS;
  // NOTE: this harness's moduleSrc concat deliberately excludes ES-module manifest entries (see
  // the moduleIds filter above) — src/ui/ref-bestiary.js (Monster Manual) is one, because it
  // `import`s three.js via an import map jsdom's plain eval can't resolve. So THIS harness only
  // ever sees the two CLASSIC apps (Wiki registers at genesis.html load, Atlas is this unit) —
  // Monster Manual's own registration is proven live in-browser (REFERENCE-SHELF.md's own S1
  // verification) and by the manifest's <script type="module"> + mustFollow gate in
  // check-manifest.py, not by this jsdom concat. The expand-proof this harness CAN prove: adding
  // the Atlas as a second classic registrant required ZERO edits to reference-shelf.js, and its
  // entry is registered with the right shape.
  check("REFERENCE_APPS has 2 classic entries (Wiki + Table Atlas; Monster Manual is ES-module-only, excluded from this jsdom concat)",
    Array.isArray(apps) && apps.length === 2, apps && apps.map((a) => a.id).join(","));
  check("Table Atlas entry present with the right shape", apps.some((a) => a.id === "atlas" && a.label === "Table Atlas" && typeof a.mount === "function" && typeof a.teardown === "function"));
  check("Wiki entry still present too (registering Atlas didn't clobber it)", apps.some((a) => a.id === "wiki"));
  // reference-shelf.js itself was not touched by this spec (grep the actual source we loaded)
  const shelfSrc = read("src/ui/reference-shelf.js");
  check("src/ui/reference-shelf.js has no 'atlas' string baked in (framework stayed generic)", !shelfSrc.includes("atlas"));
}

// ---------------------------------------------------------------------------------------------
// 5. Sort mutation — sort by roll-count ascending actually reorders the list.
// ---------------------------------------------------------------------------------------------
{
  const win = freshDom();
  win.eval('window.ROLL_COUNTS = {"place-secret": 999, "architecture-material": 1};');
  win._refAtlasSetSort("rollCount");
  // ascending direction (toggle once from the default desc)
  win._refAtlasToggleSortDir();
  const body = win.document.getElementById("refShelfBody");
  const rows = Array.prototype.slice.call(body.querySelectorAll(".refatlas-row"));
  check("the list rendered at least 2 rows to sort", rows.length > 1, rows.length);
  const names = rows.map((r) => r.querySelector(".refatlas-row-name").textContent);
  const idxArch = names.indexOf("Architecture Material");
  const idxSecret = names.findIndex((n) => n.toLowerCase().includes("secret"));
  check("ascending roll-count sort actually reordered (Architecture Material [1] appears before Place-Secret [999])",
    idxArch !== -1 && idxSecret !== -1 && idxArch < idxSecret,
    `arch@${idxArch} secret@${idxSecret}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
