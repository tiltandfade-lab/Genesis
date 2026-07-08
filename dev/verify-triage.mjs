/* Verify the HYBRID FAST-LANE TRIAGE classifier — full-app jsdom load (spec: docs/DM-BRIDGE.md
   §"Hybrid fast-lane"). dmTriage(w,action) is PURE (reads w + GS only), so we load every module in
   real order, build worlds, and assert the lane/model/reasons verdict across the routing cases:
     - default FAST for routine beats; DEEP on new-place / combat / jeopardy / clock-due / death;
     - the lastNarratedNodeId fallback (2nd turn at a narrated node is no longer "new-place");
     - GS.combat as a forward-compatible deep signal;
     - lane stamping is wired into the turn (sendTurn sets lane/laneModel/laneReasons) via a fetch stub.

   Run:  node dev/verify-triage.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
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

const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`, { runScripts: "dangerously" });
const win = dom.window;
win.eval(harness + "\n" + src);

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

check("dmTriage present after full load", typeof win.dmTriage === "function");

// minimal world factory: a living PC at a node the DM has already narrated (so "new-place" is OFF by default)
const mkWorld = (over = {}) => Object.assign({
  id: "w-t", currentNodeId: "n1",
  dm: { lastNarratedNodeId: "n1" },
  characters: [{ status: "living", name: "Test", conditions: [],
                 sheet: { hp: 20, hpCur: 20 } }],
  pressures: [], factions: [],
}, over);

const T = (w, action) => win.dmTriage(w, action);

// --- DEFAULT FAST ---
let r = T(mkWorld(), "I walk down the lane toward the well.");
check("routine action → fast/sonnet", r.lane === "fast" && r.model === "sonnet", JSON.stringify(r));
check("routine reason tagged", r.reasons.some(x => x.startsWith("routine:")), JSON.stringify(r.reasons));

r = T(mkWorld(), "I ponder the carving for a moment.");
check("non-routine but stakes-neutral → default-fast", r.lane === "fast" && r.reasons.includes("default-fast"), JSON.stringify(r.reasons));

// --- A: NEW PLACE ---
r = T(mkWorld({ currentNodeId: "n2" }), "I look around.");   // currentNodeId !== lastNarrated
check("arrival at un-narrated node → deep (new-place)", r.lane === "deep" && r.reasons.includes("new-place"), JSON.stringify(r));
r = T(mkWorld({ currentNodeId: "n2", dm: { lastNarratedNodeId: "n2" } }), "I look around.");
check("second turn at same node → fast (lastNarratedNodeId fallback)", r.lane === "fast", JSON.stringify(r.reasons));

// --- C: COMBAT ACTION ---
r = T(mkWorld(), "I attack the nearest cultist.");
check("combat verb → deep (combat-action)", r.lane === "deep" && r.model === "opus" && r.reasons.includes("combat-action"), JSON.stringify(r));
// targeted cast — single AND multi-word SRD spell names ("Fire Bolt", "Ray of Frost") must all match
r = T(mkWorld(), "I cast firebolt at the guard.");
check("cast (one word) at → deep", r.lane === "deep" && r.reasons.includes("combat-action"), JSON.stringify(r.reasons));
r = T(mkWorld(), "I cast fire bolt at the guard.");
check("cast TWO-word spell at → deep", r.lane === "deep" && r.reasons.includes("combat-action"), JSON.stringify(r.reasons));
r = T(mkWorld(), "I cast ray of frost at it.");
check("cast THREE-word spell at → deep", r.lane === "deep" && r.reasons.includes("combat-action"), JSON.stringify(r.reasons));
// idiom-dominant bare verbs were dropped → routine social/travel stays FAST
check("'strike a bargain' → fast (idiom not deep)", T(mkWorld(), "I strike a bargain with the merchant.").lane === "fast");
check("'swing by the tavern' → fast", T(mkWorld(), "I swing by the tavern.").lane === "fast");
check("'loose the strap' → fast", T(mkWorld(), "I loose the strap on my pack.").lane === "fast");

// HQ3-B4 — negation-scoping: a combat verb immediately preceded (within a small window) by a
// negator does not raise combat-action (SET-12-F1: "I make no move" / "I do NOT attack" cost
// false-positives). Real un-negated verbs, and the cast-at branch, must stay unaffected.
check("'I make no move toward him' → no combat-action (negated verb)",
  !T(mkWorld(), "I make no move toward him.").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "I make no move toward him.").reasons));
check("'I do not attack anyone' → no combat-action (negated verb)",
  !T(mkWorld(), "I do not attack anyone.").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "I do not attack anyone.").reasons));
check("'I lunge and stab the guard' → still combat-action (real attack unaffected)",
  T(mkWorld(), "I lunge and stab the guard.").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "I lunge and stab the guard.").reasons));
check("'cast fire bolt at the wolf' → still combat-action (cast-at branch unaffected)",
  T(mkWorld(), "cast fire bolt at the wolf").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "cast fire bolt at the wolf").reasons));
check("violence nouns with no verb never trip combat-action (unchanged; verb-only regex)",
  !T(mkWorld(), "He called me a saboteur and shook a knife.").reasons.includes("combat-action"),
  JSON.stringify(T(mkWorld(), "He called me a saboteur and shook a knife.").reasons));

// --- B: GS.combat forward-compat ---
win.GS.combat = { round: 1 };
r = T(mkWorld(), "I take a breath.");
check("GS.combat set → deep (combat-active)", r.lane === "deep" && r.reasons.includes("combat-active"), JSON.stringify(r));
win.GS.combat = null;
r = T(mkWorld(), "I take a breath.");
check("GS.combat cleared → back to fast", r.lane === "fast", JSON.stringify(r.reasons));

// --- D: JEOPARDY ---
r = T(mkWorld({ characters: [{ status: "living", conditions: [], sheet: { hp: 20, hpCur: 0 } }] }), "I crawl behind the pillar.");
check("downed PC → deep (pc-downed)", r.lane === "deep" && r.reasons.includes("pc-downed"), JSON.stringify(r));
r = T(mkWorld({ characters: [{ status: "living", conditions: [], sheet: { hp: 20, hpCur: 4 } }] }), "I sip my drink.");
check("PC under a quarter HP → deep (pc-bloodied)", r.lane === "deep" && r.reasons.includes("pc-bloodied"), JSON.stringify(r));
r = T(mkWorld({ characters: [{ status: "living", conditions: ["unconscious"], sheet: { hp: 20, hpCur: 12 } }] }), "...");
check("dire condition → deep (pc-condition)", r.lane === "deep" && r.reasons.includes("pc-condition"), JSON.stringify(r));

// --- E: CLOCK DUE ---
r = T(mkWorld({ pressures: [{ closed: false, clock: { filled: 4, size: 4 } }] }), "I order another ale.");
check("full doom clock → deep (clock-due)", r.lane === "deep" && r.reasons.includes("clock-due"), JSON.stringify(r));
r = T(mkWorld({ pressures: [{ closed: true, clock: { filled: 4, size: 4 } }] }), "I order another ale.");
check("CLOSED full clock → does not deep-lane", r.lane === "fast", JSON.stringify(r.reasons));
r = T(mkWorld({ pressures: [{ closed: false, clock: { filled: 2, size: 4 } }] }), "I order another ale.");
check("half-full clock → fast", r.lane === "fast", JSON.stringify(r.reasons));

// --- F: DEATH ---
r = T(mkWorld({ characters: [{ status: "dead" }] }), "...");
check("no living PC → deep (no-living-pc)", r.lane === "deep" && r.reasons.includes("no-living-pc"), JSON.stringify(r));

// --- stamping wired into sendTurn (stub fetch, capture the posted turn body) ---
(() => {
  const w = mkWorld({ name: "Stamp World" });
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  // isolate the stamping path: stub the heavy side-effects (digest/render/persist) so the test
  // exercises sendTurn's lane wiring, not the full digest/render stack (covered by verify-dm-events).
  win.dmDigest = () => ({}); win.renderWorld = () => {}; win.saveU = () => {}; win.pushDmLog = () => {};
  let captured = null;
  win.fetch = (url, opt) => {
    if (String(url).endsWith("/turn")) { try { captured = JSON.parse(opt.body); } catch {} return Promise.resolve({ ok: true, json: () => Promise.resolve({ turnId: captured && captured.turnId }) }); }
    return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
  };
  try {
    win.sendTurn("I attack the watchman.", []);
    check("sendTurn stamps lane onto the turn", captured && captured.lane === "deep" && captured.laneModel === "opus",
          JSON.stringify(captured && { lane: captured.lane, laneModel: captured.laneModel, laneReasons: captured.laneReasons }));
  } catch (e) {
    check("sendTurn stamps lane onto the turn", false, "threw: " + e.message);
  }
})();

// --- applyResponse defers lastNarratedNodeId while a rollRequest is pending (first-contact stays deep) ---
(() => {
  const w = mkWorld({ currentNodeId: "n2", dm: { lastNarratedNodeId: "n1" } });
  win.U.worlds[w.id] = w; win.U.activeWorldId = w.id;
  // stub the side-effects so applyResponse exercises only the marker logic
  win.pushDmLog = () => {}; win.saveU = () => {}; win.renderWorld = () => {};
  win.postState = () => {}; win.wakeReveal = () => {}; win.applyEvent = () => ({});
  win.GS.dm = win.GS.dm || {};

  // turn 1: DM hands back a rollRequest on arrival → scene NOT delivered → marker must NOT advance
  win.applyResponse({ narration: "You crest the ridge. Roll Perception.", rollRequest: { skill: "Perception" } });
  check("rollRequest-only response does NOT advance lastNarratedNodeId", w.dm.lastNarratedNodeId === "n1",
        "got " + w.dm.lastNarratedNodeId);
  check("→ so the roll-submit turn still deep-lanes the arrival", T(w, "(I roll Perception: 14)").reasons.includes("new-place"),
        JSON.stringify(T(w, "x").reasons));

  // turn 2: DM delivers the reveal with no pending roll → marker advances → node now 'narrated'
  win.applyResponse({ narration: "The watchtower stands gutted, ravens on its lintel." });
  check("settled response advances lastNarratedNodeId", w.dm.lastNarratedNodeId === "n2", "got " + w.dm.lastNarratedNodeId);
  check("→ next turn at the narrated node is fast", T(w, "I look around.").lane === "fast", JSON.stringify(T(w, "x").reasons));
})();

console.log(`\n${fail ? "✗" : "✓"} triage: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
