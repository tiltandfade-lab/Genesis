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

// 6. knowledge gating — Powers/Pressures + Gazetteer show only what the character knows
const gw = {
  id: "w-gate", name: "Gatetest",
  seed: { master: { name: "The Hub", desc: "x" } },
  characters: [{ status: "living", name: "PC", entry: { standingFaction: "The Knowns" } }],
  log: [], ledger: [], dmlog: [{ role: "dm", text: "opened" }],
  clock: { day: 1, min: 360, session: 1 }, session: 1,
  map: { nodes: { "the-hub": { id: "the-hub", name: "The Hub", type: "Setting" } }, edges: [] },
  currentNodeId: "the-hub",
  factions: [{ id: "f1", name: "The Knowns", dominant: true, agenda: "a", method: "b", clock: { size: 6, filled: 0 } },
             { id: "f2", name: "The Hidden", dominant: false, agenda: "a", method: "b", clock: { size: 6, filled: 0 } }],
  pressures: [{ id: "p1", kind: "internal", danger: "a creeping rot", clock: { size: 6, filled: 0 } }],
  gazetteer: [{ type: "Setting", name: "The Hub", desc: "x" }, { type: "Place", name: "Far Vale", desc: "y" },
              { type: "Myth", name: "Old Lie", desc: "z" }],
  revealed: { powers: true, gaz: true }, region: {},
};
win.U.worlds["w-gate"] = gw; win.U.activeWorldId = "w-gate";
win.initKnown(gw);
check("initKnown: PC's standing faction is known", gw.factions.find(f => f.id === "f1").known === true);
check("initKnown: other faction stays hidden", gw.factions.find(f => f.id === "f2").known === false);
check("initKnown: pressures hidden by default", gw.pressures[0].known === false);
check("initKnown: current Setting is known", gw.gazetteer.find(g => g.name === "The Hub").known === true);
check("initKnown: unvisited place hidden", gw.gazetteer.find(g => g.name === "Far Vale").known === false);
const powHtml = win.renderPowers(gw);
check("renderPowers shows the known faction", /The Knowns/.test(powHtml));
check("renderPowers hides the unknown faction", !/The Hidden/.test(powHtml), "leaked hidden faction");
check("renderPowers hides unknown pressure", !/creeping rot/.test(powHtml), "leaked hidden pressure");
check("gazPanel shows known place only", win.gazPanel(gw).includes("The Hub") && !win.gazPanel(gw).includes("Far Vale"));
check("gazKnown counts only known", win.gazKnown(gw).length === 1);
// the DM lever: a discovery event with reveal flips a hidden power → known
win.applyEvent(gw, { type: "discovery", payload: { what: "a banner", reveal: { factions: ["The Hidden"], pressures: ["a creeping rot"] } }, source: "declared" });
check("discovery reveal flips a faction known", gw.factions.find(f => f.id === "f2").known === true);
check("discovery reveal flips a pressure known", gw.pressures[0].known === true);
check("after reveal, renderPowers shows it", /The Hidden/.test(win.renderPowers(gw)));

// 7. panel toggle — clicking the open panel collapses it
win.GS.gamePanel = null;
win.openPanel("powers"); check("openPanel opens a closed panel", win.GS.gamePanel === "powers");
win.openPanel("powers"); check("openPanel collapses the same open panel", win.GS.gamePanel === null);
win.openPanel("map"); win.openPanel("ledger"); check("openPanel switches between panels", win.GS.gamePanel === "ledger");

// 8. roll-request persistence across reload — applyResponse persists to w.dm; renderWorld rehydrates GS.dm
const rw = win.U.worlds["w-test"]; win.U.activeWorldId = "w-test"; rw.dmlog = [];
rw.seed = { master: rw.seed.master, smell: { name: "herbs" }, sound: { name: "dogs" }, arch: { name: "brick" },
  taboo: { name: "t", desc: "d" }, myth: { name: "m", desc: "d" } };   // dmDigest reads these
win.applyResponse({ turnId: "t-x", narration: "n", events: [], rollRequest: { skill: "Insight", ability: "wis", dcHidden: true }, ask: null });
check("applyResponse persists rollReq to w.dm", !!(rw.dm && rw.dm.rollReq && rw.dm.rollReq.skill === "Insight"));
win.GS.dm.rollReq = null; win.GS.dm.ask = null;   // simulate a reload wiping transient GS
win.renderWorld();
check("renderWorld rehydrates GS.dm.rollReq from w.dm after reload", win.GS.dm.rollReq && win.GS.dm.rollReq.skill === "Insight");
win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ turnId: "t-y" }) });
win.dmDigest = () => ({ worldId: "w-test" });   // stub: not what this assertion tests
win.sendTurn("(I roll Insight: 14)", [{ label: "Insight", total: 14 }]);
check("sendTurn clears the persisted rollReq (new turn supersedes)", rw.dm.rollReq == null);

// 9. resume the in-flight turn poll after a reload (w.dm.pendingTurnId → re-attach poll)
rw.dm = { rollReq: null, ask: null, pendingTurnId: "t-inflight" };
win.GS.dm.pending = false; win.GS.dm.turnId = null; win.GS.dm.poll = null;
let resumedWith = null; win.pollResponse = (id) => { resumedWith = id; };   // capture the resume
win.renderWorld();
check("renderWorld resumes the in-flight poll after reload", resumedWith === "t-inflight");
check("resume set GS.dm.pending", win.GS.dm.pending === true && win.GS.dm.turnId === "t-inflight");
// and it does NOT re-resume once already pending
resumedWith = null; win.renderWorld();
check("resume does not double-fire while pending", resumedWith === null);

// 10. word-by-word streaming of a fresh DM reply
check("streamDMText defined", typeof win.streamDMText === "function");
rw.dmlog = []; win.U.activeWorldId = "w-test"; win.GS.dm.pending = false; win.GS.dm.poll = null;
win.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
const sample = "The shrine breathes cold salt air.";
win.applyResponse({ turnId: "t-stream", narration: sample, events: [], rollRequest: null, ask: null });
const sEl = win.document.getElementById("dmStream");
check("fresh DM reply renders a #dmStream span carrying the full text", !!sEl && sEl.getAttribute("data-full") === sample);
check("streaming span starts empty (animates in)", !!sEl && sEl.textContent === "");
check("animate flag consumed after render", win.GS.dm.animate === false);
await new Promise((r) => setTimeout(r, 24 * sample.split(/(\s+)/).length + 400));
const sEl2 = win.document.getElementById("dmStream");
check("stream fills to the full narration", !!sEl2 && sEl2.textContent === sample);

// 11. **bold** markdown rendering (static + after streaming) and safety
check("mdBold defined", typeof win.mdBold === "function");
check("mdBold converts **x** to <b>", win.mdBold(win.escHtml("a **key** here")) === "a <b>key</b> here");
check("mdBold leaves unclosed ** literal", win.mdBold(win.escHtml("a **key")) === "a **key");
rw.dmlog = []; win.GS.dm.pending = false; win.GS.dm.poll = null;
const boldSample = "She took a **key**.";
win.applyResponse({ turnId: "t-bold", narration: boldSample, events: [], rollRequest: null, ask: null });
await new Promise((r) => setTimeout(r, 24 * boldSample.split(/(\s+)/).length + 500));
const bEl = win.document.getElementById("dmStream");
check("streamed narration renders **bold** as <b>", !!bEl && /<b>key<\/b>/.test(bEl.innerHTML));

// 12. OPENING-OVERLAY TEARDOWN (shakedown SD-001/SD-002, fix/opening-overlay-teardown) — reproduce the
// EXACT bardo→play handoff sequence (bardoFound raises #wakeFade BEFORE bindWorld/cgBind run; cgBind
// ends by calling wakeIntoWorld) against the real overlay markup mounted at the top of this file, and
// assert BOTH overlays are actually gone from the DOM once narration lands — not just that the right
// functions exist. Also proves the "second sendTurn never fires" symptom (dead send button) is really
// a stale-render symptom: a subsequent sendTurn() must actually issue its POST.
{
  const fadeEl = win.document.getElementById("wakeFade");
  const prepEl = win.document.getElementById("wakePrep");

  // --- 12a. the #wakeFade curtain bardoFound() raises must be down once the world view has woken in ---
  fadeEl.classList.add("on"); prepEl.classList.remove("on");   // simulate bardoFound()'s "black out" curtain
  win.GS.wakePrep = false;
  win.fetch = () => new Promise(() => {});   // bridge call never resolves in this check — only the fade matters here
  win.wakeIntoWorld();
  check("wakeIntoWorld (open-eyes handoff) tears down #wakeFade unconditionally",
    !fadeEl.classList.contains("on"), "black curtain still up — SD-001 regression");

  // --- 12b. applyResponse must ALWAYS lift #wakePrep and clear GS.dm.pending, even when event-apply throws ---
  const origApplyEvent = win.applyEvent;
  win.applyEvent = () => { throw new Error("simulated mid-apply failure (e.g. a malformed opening-scene event)"); };
  fadeEl.classList.remove("on");
  prepEl.classList.add("on"); win.GS.wakePrep = true;          // simulate wakeShowPrep() having raised the loading screen
  win.GS.dm.pending = true;                                     // simulate sendTurn's in-flight state (send button disabled)
  rw.dmlog = [];
  let threw = false;
  try { win.applyResponse({ turnId: "t-throws", narration: "The DM opens the scene.", events: [{ type: "hp_changed" }], rollRequest: null, ask: null }); }
  catch (e) { threw = true; }
  check("applyResponse does not let a mid-apply throw escape (try/finally swallows it)", !threw);
  check("applyResponse lifts #wakePrep even when applyEvent throws mid-turn", !prepEl.classList.contains("on"),
    "prep cinematic still up — SD-001 regression (player stranded on 'The DM is dreaming your arrival…')");
  check("applyResponse clears GS.dm.pending even when applyEvent throws mid-turn", win.GS.dm.pending === false);
  win.applyEvent = origApplyEvent;

  // --- 12c. after that throwing turn, a SUBSEQUENT sendTurn() must actually issue its POST (SD-002:
  // the shakedown observed the input clear but no POST /turn ever fire for the player's next action) ---
  let turnPosted = false;
  win.fetch = (url) => { if (String(url).includes("/turn")) turnPosted = true;
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ turnId: "t-next" }) }); };
  win.dmDigest = () => ({ worldId: rw.id });
  win.GS.dm.poll = null;
  win.sendTurn("(I look around.)", []);
  check("a sendTurn AFTER a throwing applyResponse still issues its POST /turn (SD-002 — not dead)", turnPosted);

  // --- 12d. the happy path (no throw) still lifts the cinematic exactly as before ---
  prepEl.classList.add("on"); win.GS.wakePrep = true; win.GS.dm.pending = true; rw.dmlog = [];
  win.applyResponse({ turnId: "t-ok", narration: "Clean morning light.", events: [], rollRequest: null, ask: null });
  check("applyResponse still lifts #wakePrep on the ordinary happy path", !prepEl.classList.contains("on"));
  check("applyResponse still clears GS.dm.pending on the ordinary happy path", win.GS.dm.pending === false);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
