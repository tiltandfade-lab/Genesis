/* Verify the wake → prep-cinematic → fade-in flow (feat/wake-prep-cinematic).
   Full-app jsdom load (every module in manifest order, one eval — the const-via-eval gotcha).
   Asserts: the new globals exist; the #wakePrep overlay toggles via wakeShowPrep/wakeReveal gated
   on GS.wakePrep; auto-prep fires on wake (startPrep stages a bundle); and renderWorld NO LONGER
   emits the raw entry-bundle data dump for a freshly-woken character (the DM narration is the intro).

   Run:  node dev/verify-wake-prep.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

// include the real overlay markup + worldView so the cinematic toggles + renderWorld can mount
const dom = new JSDOM(`<!doctype html><html><body>
  <div id="worldView"></div><div id="toast"></div><div id="wakeFade"></div>
  <div id="wakePrep"><div class="wp-inner">
    <div class="wp-title" id="wpTitle">Entering the world…</div>
    <div class="wp-sub" id="wpSub">…</div></div></div>
</body></html>`, { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.fetch = () => new Promise(() => {});   // stub: never resolves, so autoOpenScene posts but doesn't lift
win.eval(harness + "\n" + src);
win.showTab = () => {};   // stub: tab-panel DOM isn't mounted in this minimal harness

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// 1. new globals present
for (const f of ["wakeIntoWorld", "autoOpenScene", "wakeShowPrep", "wakeReveal", "startPrep"])
  check(`global ${f} defined`, typeof win[f] === "function");
check("GS.wakePrep initialised false", win.GS.wakePrep === false);

// 2. a world with a freshly-woken character carrying an entry bundle (no dmlog yet)
const world = {
  id: "w-test", name: "Saltrest", createdAt: 0,
  seed: { master: { name: "The Canal-Knot", desc: "a low city of canals" } },
  characters: [{ status: "living", name: "Pendleton", entry: {
    why: "drawn by a rumor", standingFaction: "The Charcoal Syndicate", standing: "kin", foot: "a letter",
    tension: { danger: "something preys from beneath" },
    bundle: { enemies: [{ text: "a guard captain" }], friends: [{ text: "the Syndicate" }],
      complications: [{ text: "a rivalry" }], things: [{ text: "a sealed letter" }], places: [{ text: "the Quarry" }] } } }],
  log: [], ledger: [], dmlog: [],
  clock: { day: 1, min: 360, session: 1 }, session: 1,
  map: { nodes: { "the-canal-knot": { id: "the-canal-knot", name: "The Canal-Knot", type: "Setting" } }, edges: [] },
  currentNodeId: "the-canal-knot", factions: [], pressures: [], revealed: { ledger: true }, region: {},
};
win.U.worlds["w-test"] = world; win.U.activeWorldId = "w-test";

// 3. renderWorld must NOT contain the raw data-dump markers now
win.renderWorld();
const html = win.document.getElementById("worldView").innerHTML;
check("renderWorld emits no 'The Opening' dump heading", !/The Opening/.test(html), "dump heading present");
check("renderWorld emits no 'Complications' label", !/Complications/.test(html), "bundle label present");
check("renderWorld still renders the DM feed", /dm-feed|The DM is silent|dm-pending/.test(html), "no DM feed");

// 4. the prep cinematic toggles, gated on GS.wakePrep
win.GS.wakePrep = true; win.wakeShowPrep(world);
const prep = win.document.getElementById("wakePrep");
check("wakeShowPrep raises overlay (.on)", prep.classList.contains("on"));
check("wakeShowPrep titles with the world name", win.document.getElementById("wpTitle").textContent === "Saltrest");
win.wakeReveal();
check("wakeReveal lifts overlay", !prep.classList.contains("on"));
check("wakeReveal cleared GS.wakePrep", win.GS.wakePrep === false);
// guard: wakeReveal is a no-op when not waking
prep.classList.add("on"); win.GS.wakePrep = false; win.wakeReveal();
check("wakeReveal no-ops when GS.wakePrep is false", prep.classList.contains("on"));
prep.classList.remove("on");

// 5. auto-prep on wake: wakeIntoWorld stages a prep bundle (startPrep) + raises the cinematic
world.dmlog = []; world.prep = undefined;
win.wakeIntoWorld();
check("wakeIntoWorld auto-ran Session-Prep (w.prep.bundle staged)", !!(world.prep && world.prep.bundle),
  "no prep bundle after wake");
check("wakeIntoWorld raised the prep cinematic", win.GS.wakePrep === true && prep.classList.contains("on"));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
