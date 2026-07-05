/* Verify the REFERENCE-SHELF.md unit S3 — the Wiki reference app.
   Spec: docs/REFERENCE-SHELF.md ("Registered app #2 — Wiki" + "gen-wiki.py — the parser contract").
   Pieces under test: build/gen-wiki.py, data/wiki.js (WIKI_INDEX), src/ui/ref-wiki.js.

   Loads EVERY module in manifest load order into one jsdom global scope (the const-via-eval
   convention — see dev/verify-reference-shelf.mjs / dev/verify-dm-events.mjs). Then:
     1. gen-wiki.py output sanity — WIKI_INDEX.length === 51, every entry has all 7 fields, every
        non-null spec resolves to a real docs/… path on disk.
     2. RED-FIRST — strip a **Spec:** field from a SCRATCH COPY of docs/ARCHITECTURE.md and prove
        gen-wiki.py HARD-FAILS (non-zero exit) against it; then re-run against the real, untouched
        file to prove it's green again (never leaves the repo's docs/ARCHITECTURE.md touched).
     3. Idempotency — run gen-wiki.py twice against the real source; data/wiki.js is byte-identical
        both times.
     4. App behavior — referenceShelfOpen('wiki') mounts src/ui/ref-wiki.js's app; the index renders
        grouped by layer; the free-text filter narrows the visible list; selecting a system renders
        its card; a spec link resolves to the real doc path.
     5. check-manifest.py — run separately, reported in the harness tail (not asserted here; the
        orchestrator's own run is authoritative — see this script's stdout note at the end).

   Run:  node dev/verify-wiki.mjs
   (jsdom is installed per-environment in a scratch dir — see CLAUDE.md "headless test".
    Override the dir with JSDOM_HOME=/path/to/dir containing node_modules/jsdom.) */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ============================================================================
// 0. compile fresh — run the real generator against the real source, so this
//    harness always checks live output, not a stale commit.
// ============================================================================
execFileSync("python3", ["build/gen-wiki.py"], { cwd: ROOT, stdio: "inherit" });

// ============================================================================
// 1. gen-wiki.py output sanity
// ============================================================================
{
  // every module, in real load order (classic <script> tags only)
  const man = JSON.parse(read("manifest.json"));
  const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
  const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
  // top-level `const WIKI_INDEX` (data/wiki.js) doesn't survive as a `window` property across a
  // fresh win.eval read — but a bridge assignment made INSIDE the same eval call closes over it
  // fine (the same gotcha CLAUDE.md's "const-via-eval" note covers). Bridge it out once, appended
  // after all module source in the single eval call.
  const bridge = `window.WIKI_INDEX = WIKI_INDEX;`;

  const html = `<!doctype html><html><body>
    <section id="panel-start" class="panel active"><div id="startView"></div></section>
    <div id="refShelf" role="dialog" aria-modal="true" aria-labelledby="refShelfTitle" hidden>
      <div class="refshelf-shell">
        <div class="refshelf-head">
          <button onclick="referenceShelfClose()">↩ Shelf</button>
          <div id="refShelfTitle"></div>
          <button onclick="referenceShelfClose()" aria-label="Close">✕</button>
        </div>
        <div id="refShelfBody"></div>
      </div>
    </div>
  </body></html>`;

  function freshDom() {
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const win = dom.window;
    win.eval(harness + "\n" + src + "\n" + bridge);
    return { dom, win };
  }

  const { win } = freshDom();

  check("WIKI_INDEX is defined", typeof win.WIKI_INDEX !== "undefined");
  check("WIKI_INDEX.length === 51", win.WIKI_INDEX.length === 51, String(win.WIKI_INDEX.length));

  const requiredFields = ["system", "slug", "layer", "whatItIs", "howItWorks", "livesIn", "spec"];
  const missingFieldEntries = win.WIKI_INDEX.filter(
    (e) => !requiredFields.every((f) => Object.prototype.hasOwnProperty.call(e, f))
  );
  check("every entry has all 7 fields", missingFieldEntries.length === 0,
    JSON.stringify(missingFieldEntries.map((e) => e.system)));

  const specEntries = win.WIKI_INDEX.filter((e) => e.spec != null);
  const badSpecs = specEntries.filter((e) => !existsSync(join(ROOT, e.spec)));
  check("every non-null spec matches a real docs/… path",
    badSpecs.length === 0, JSON.stringify(badSpecs.map((e) => [e.system, e.spec])));
  check("at least one entry has a null spec (the — case)",
    win.WIKI_INDEX.some((e) => e.spec === null));

  // ==========================================================================
  // 4. app behavior — mount via referenceShelfOpen('wiki'), inspect the DOM
  // ==========================================================================
  win.referenceShelfOpen("wiki");
  const body = win.document.getElementById("refShelfBody");
  check("referenceShelfOpen('wiki') mounts the app into #refShelfBody",
    body.innerHTML.includes("refwiki-root"), body.innerHTML.slice(0, 200));

  // index grouped by layer: every distinct layer label appears as a nav group heading
  const escAmp = (s) => s.replace(/&/g, "&amp;");
  const layers = [...new Set(win.WIKI_INDEX.map((e) => e.layer))];
  const navHtmlPreFilter = body.innerHTML;
  check("the nav lists every layer",
    layers.every((l) => navHtmlPreFilter.includes(escAmp(l))),
    layers.filter((l) => !navHtmlPreFilter.includes(escAmp(l))).join(", "));
  check("the nav lists every system name",
    win.WIKI_INDEX.every((e) => navHtmlPreFilter.includes(e.system.replace(/&/g, "&amp;"))),
    "some system name missing from nav");

  // no system selected yet -> the empty-state card
  check("no selection yet shows the empty-state card",
    body.innerHTML.includes("refwiki-card-empty"));

  // select a known system, assert its card renders whatItIs/howItWorks/livesIn/spec
  const sample = win.WIKI_INDEX.find((e) => e.spec != null);
  win._refWikiSelect(sample.slug);
  const cardHtml = win.document.getElementById("refShelfBody").innerHTML;
  check("selecting a system renders its card (title present)",
    cardHtml.includes(sample.system.replace(/&/g, "&amp;")), cardHtml.slice(0, 300));
  check("the card shows What it is / How it works / Lives in",
    cardHtml.includes("What it is.") && cardHtml.includes("How it works.") && cardHtml.includes("Lives in:"));
  check("a spec link resolves to the real doc path",
    cardHtml.includes(`href="${sample.spec}"`), sample.spec);

  // a null-spec system shows the stub instead of a link
  const nullSpecSample = win.WIKI_INDEX.find((e) => e.spec == null);
  win._refWikiSelect(nullSpecSample.slug);
  const stubCardHtml = win.document.getElementById("refShelfBody").innerHTML;
  check("a null-spec system shows the 'detail page coming' stub",
    stubCardHtml.includes("detail page coming") && stubCardHtml.includes("refwiki-detail-stub"));

  // filter narrows the visible list — pick a system with a name that's not a substring of others
  win._refWikiSelect(null);
  const target = win.WIKI_INDEX.find((e) => e.system.includes("Tarot"));
  win._refWikiSetFilter("Tarot");
  const filteredHtml = win.document.getElementById("refShelfBody").innerHTML;
  const otherSystem = win.WIKI_INDEX.find((e) => !e.system.includes("Tarot") && !e.whatItIs.includes("Tarot") && !e.howItWorks.includes("Tarot"));
  check("free-text filter narrows the list (matching system present, a clearly non-matching one absent)",
    filteredHtml.includes(target.system.replace(/&/g, "&amp;")) &&
    !filteredHtml.includes(otherSystem.system.replace(/&/g, "&amp;")),
    `target=${target.system} other=${otherSystem.system}`);

  // layer filter narrows to just that layer's systems
  win._refWikiSetFilter("");
  const oneLayer = layers[0];
  win._refWikiSetLayer(oneLayer);
  const layerFilteredHtml = win.document.getElementById("refShelfBody").innerHTML;
  const inLayer = win.WIKI_INDEX.filter((e) => e.layer === oneLayer);
  const outLayer = win.WIKI_INDEX.find((e) => e.layer !== oneLayer);
  check("layer filter narrows to the selected layer's systems",
    inLayer.every((e) => layerFilteredHtml.includes(e.system.replace(/&/g, "&amp;"))) &&
    !layerFilteredHtml.includes(outLayer.system.replace(/&/g, "&amp;")),
    `layer=${oneLayer}`);

  // teardown clears the mount
  win.referenceShelfClose();
  check("referenceShelfClose tears down the wiki app (body emptied)",
    win.document.getElementById("refShelfBody").innerHTML.trim() === "");
}

// ============================================================================
// 2. RED-FIRST — strip a **Spec:** field from a SCRATCH COPY, prove hard-fail,
//    then prove the real file is untouched and still compiles green.
// ============================================================================
{
  const scratchDir = process.env.TMPDIR || "/tmp";
  const scratchArch = join(scratchDir, "genesis-verify-wiki-architecture.md");
  const scratchOut = join(scratchDir, "genesis-verify-wiki-out.js");

  const realArch = read("docs/ARCHITECTURE.md");
  const stripped = realArch.replace(
    "**Lives in:** `src/engine/compiled.js`, `tables.js`. **Spec:** docs/TABLE-EDIT-SAFETY.md",
    "**Lives in:** `src/engine/compiled.js`, `tables.js`."
  );
  check("(setup) the scratch replacement actually matched something",
    stripped !== realArch);
  writeFileSync(scratchArch, stripped);

  let redExitCode = 0;
  let redStderr = "";
  try {
    execFileSync(
      "python3",
      ["-c", `
import sys
sys.path.insert(0, "build")
import importlib.util
spec = importlib.util.spec_from_file_location("genwiki", "build/gen-wiki.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
mod.SRC_PATH = __import__("pathlib").Path("${scratchArch}")
mod.OUT_PATH = __import__("pathlib").Path("${scratchOut}")
mod.main()
`],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] }
    );
  } catch (e) {
    redExitCode = e.status ?? 1;
    redStderr = (e.stderr || "").toString();
  }
  check("⊗ RED-FIRST: gen-wiki.py HARD-FAILS (non-zero exit) on a spec-stripped entry",
    redExitCode !== 0, `exit=${redExitCode}`);
  check("⊗ RED-FIRST: the failure names the offending system + missing field",
    redStderr.includes("Compiled-Tables Dice Engine") && redStderr.includes("Spec"), redStderr);

  // restore proof: the REAL docs/ARCHITECTURE.md was never touched by this test
  const realArchAfter = read("docs/ARCHITECTURE.md");
  check("the real docs/ARCHITECTURE.md was never modified by the red-first probe",
    realArchAfter === realArch);
}

// ============================================================================
// 3. Idempotency — run gen-wiki.py twice against the real source; byte-identical.
// ============================================================================
{
  const scratchDir = process.env.TMPDIR || "/tmp";
  const run1 = join(scratchDir, "genesis-verify-wiki-run1.js");
  const run2 = join(scratchDir, "genesis-verify-wiki-run2.js");

  execFileSync("python3", ["build/gen-wiki.py"], { cwd: ROOT, stdio: "ignore" });
  copyFileSync(join(ROOT, "data/wiki.js"), run1);
  execFileSync("python3", ["build/gen-wiki.py"], { cwd: ROOT, stdio: "ignore" });
  copyFileSync(join(ROOT, "data/wiki.js"), run2);

  const bytes1 = readFileSync(run1);
  const bytes2 = readFileSync(run2);
  check("idempotency: two consecutive gen-wiki.py runs produce byte-identical data/wiki.js",
    Buffer.compare(bytes1, bytes2) === 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
console.log("\nNOTE: run `python3 build/check-manifest.py` separately — this harness does not shell out to it as a hard assertion.");
process.exit(fail ? 1 : 0);
