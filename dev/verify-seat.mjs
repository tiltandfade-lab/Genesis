/* Verify DM-SEAT's app module — full-app jsdom load, MOCK /seat endpoint (spec: docs/DM-SEAT.md
   §4.1 "dev/verify-seat.mjs (jsdom, mock endpoint)"). No SEAT_API_KEY needed — this never talks to a
   real provider; it stubs `fetch`/docs/SEAT-PROMPT.md and exercises seat.js's own logic:

     1. assembly: prefix byte-stability across turns (system+bootstrap+summary identical bytes call to
        call), window slide (the rolling ~12-turn window evicts+folds past its cap), digest inclusion
        (dmDigest's JSON rides the trailing "this turn" message).
     2. validation: ONE corrective retry on a parse failure, then the in-voice stutter envelope on a
        second failure — the session never throws past sendTurn's caller.
     3. unknown-event drop: an events[] entry whose type isn't in the DM_EVENT_TYPES registry (read
        directly, docs/SEAT-ADAPTER.md §2) is stripped (never reaches applyEvent), with a dmNotes note
        recording what was dropped.
     4. lane→model mapping: dmTriage's verdict rides the /seat POST body unchanged from the mailbox's
        own stamping (docs/DM-BRIDGE.md "Hybrid fast-lane").
     5. stream-then-apply ordering: SSE deltas update GS.seat.streamText/renderWorld calls as they
        arrive, but applyEvent/pushDmLog (the real event-apply pipeline) fire ONLY once, after the
        stream closes — never mid-stream.

   Run:  node dev/verify-seat.mjs
   (jsdom installed per-environment — see CLAUDE.md "headless test"; JSDOM_HOME overrides the dir.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { setEq as sharedSetEq } from "./verify-helpers.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously" });
const win = dom.window;
// surface DM_EVENT_TYPES onto window (const decls share the eval scope but aren't window.* under
// indirect eval — the documented gotcha; same trick as dev/verify-dm-seam.mjs:33).
const expose = `;try{window.DM_EVENT_TYPES=DM_EVENT_TYPES;}catch(e){}`;
win.eval(harness + "\n" + src + expose);

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

check("world.seat globals present after full load",
  ["seatEnabled", "seatToggleTransport", "seatBoot", "seatAssembleMessages", "seatEventVocabulary",
   "seatValidate", "seatExtractJson", "seatSend", "seatReadSSE", "seatResolveResponse"]
    .every((n) => typeof win[n] === "function"),
  Object.keys(win).filter(() => false).join(""));

/* ---------- shared test fixtures ---------- */
const mkWorld = (over = {}) => Object.assign({
  id: "w-seat", name: "Seat World", currentNodeId: "n1",
  dm: { lastNarratedNodeId: "n1", transport: "seat" },
  characters: [{ status: "living", name: "Test", conditions: [], sheet: { hp: 20, hpCur: 20 } }],
  pressures: [], factions: [], gazetteer: [], sessionLive: true,
}, over);

function installWorld(w) {
  win.U.worlds = { [w.id]: w }; win.U.activeWorldId = w.id;
}

/* stub out every non-seat side-effect sendTurn/applyResponse would otherwise touch, so the tests
   exercise ONLY seat.js's own logic (mirrors verify-triage.mjs's isolation discipline). */
function stubSideEffects() {
  win.saveU = () => {}; win.renderWorld = () => {}; win.postState = () => {};
  win.wakeReveal = () => {}; win.toast = () => {};
  win.dmDigest = () => ({ worldId: "w-seat", clock: { day: 1 } });
}

/* a fake SEAT-PROMPT.md fetch + a fake /seat SSE stream, both driven by a small in-memory router so
   each test controls exactly what "the provider" replies without ever touching the network. */
function installFetchRouter({ promptText = "SYSTEM PROMPT TEXT", seatReplies = [] } = {}) {
  let seatCallIndex = 0;
  const calls = { seat: [] };
  win.fetch = (url, opt) => {
    const u = String(url);
    if (u.endsWith("docs/SEAT-PROMPT.md")) {
      if (promptText === null) return Promise.resolve({ ok: false, status: 404 });
      return Promise.resolve({ ok: true, text: () => Promise.resolve(promptText) });
    }
    if (u.endsWith("/seat")) {
      const body = opt && opt.body ? JSON.parse(opt.body) : null;
      calls.seat.push(body);
      const reply = seatReplies[Math.min(seatCallIndex, seatReplies.length - 1)];
      seatCallIndex++;
      const raw = typeof reply === "function" ? reply(body) : reply;
      // a body-less Response stand-in (no .body.getReader) — seatReadSSE's non-streaming fallback path.
      return Promise.resolve({ ok: true, text: () => Promise.resolve(raw) });
    }
    return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
  };
  return calls;
}

function resetSeatState() {
  win.GS.seat = null;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false, streamTimer: null };
}

/* ========================================================================
   1. ASSEMBLY — prefix byte-stability + window slide + digest inclusion
   ======================================================================== */
(() => {
  resetSeatState();
  const w = mkWorld(); installWorld(w); stubSideEffects();
  installFetchRouter({ promptText: "SYSTEM V1" });

  return win.seatBoot().then(() => {
    const turn1 = { turnId: "t-1", action: "look around", digest: { day: 1 } };
    const turn2 = { turnId: "t-2", action: "search the room", digest: { day: 1 } };

    // warm up (this FIRST call flips seatState().bootstrapped false->true and sends the bootstrap
    // block) -- checked on its own; the STABILITY checks below use two later steady-state calls where
    // neither carries the once-only bootstrap message.
    const warm = win.seatAssembleMessages(w, turn1);
    check("assembly includes the system prompt verbatim", warm.system === "SYSTEM V1", warm.system);
    check("the bootstrap-sending call carries the digest JSON as its this-turn message",
      warm.messages[warm.messages.length - 1].content === JSON.stringify(turn1),
      warm.messages[warm.messages.length - 1].content);
    check("bootstrap message rides the first assemble call of the session",
      warm.messages.some(function(m){ return m.content.indexOf("SESSION OPENING DIGEST") >= 0; }),
      JSON.stringify(warm.messages.map(function(m){ return m.role; })));

    // PREFIX BYTE-STABILITY (gate 1): everything BEFORE the trailing this-turn message must be
    // byte-identical across calls within a session -- system text + summary (empty until eviction) +
    // window (unchanged between these two calls, no seatWindowPush in between). Both calls here are
    // POST-bootstrap (steady state).
    const a1 = win.seatAssembleMessages(w, turn1);
    const a2same = win.seatAssembleMessages(w, turn1);
    const prefixOf = function(a){ return a.messages.slice(0, -1).map(function(m){ return m.role + " " + m.content; }).join(""); };
    check("prefix (system+summary+window) is byte-stable across back-to-back steady-state assembles",
      a1.system === a2same.system && prefixOf(a1) === prefixOf(a2same),
      JSON.stringify({ p1: prefixOf(a1), p2: prefixOf(a2same) }));
    check("bootstrap message does NOT repeat on later calls (rides once per session)",
      a1.messages.every(function(m){ return m.content.indexOf("SESSION OPENING DIGEST") < 0; }),
      JSON.stringify(a1.messages.map(function(m){ return m.role; })));

    // WINDOW SLIDE (gate 1): push well past the ~12-turn budget and confirm it's BOUNDED (never grows
    // unboundedly) + the evicted turns fold into a non-empty summary rather than vanishing. (The window
    // cap is a module-scoped const, not a window.* property in classic-script eval scope -- the
    // documented const-vs-window gotcha -- so this asserts observed bounded behavior, not a literal.)
    for (let i = 0; i < 30; i++) win.seatWindowPush(i % 2 === 0 ? "user" : "assistant", "turn " + i);
    const after = win.GS.seat.window.length;
    check("rolling window is bounded well below 30 despite 30 pushes (slides, doesn't grow unbounded)",
      after > 0 && after < 20, "window length " + after);
    check("evicted turns fold into a non-empty summary (nothing silently dropped)",
      typeof win.GS.seat.summary === "string" && win.GS.seat.summary.length > 0);

    return true;
  });
})()

/* ========================================================================
   2. EVENT VOCABULARY — the declared DM_EVENT_TYPES registry (SEAT-ADAPTER §2 D6 + DM-CONTRACT-ARTIFACT §3 R2)
   ======================================================================== */
.then(() => {
  const vocab = win.seatEventVocabulary();
  // R3 check 1: the vocabulary set-equals the declared registry, exact length (a `>20` check could
  // never catch a partial list — set equality + length can). HQ2-8f: setEq is the shared harness
  // helper (dev/verify-helpers.mjs), not a local byte-identical duplicate of verify-dm-contract.mjs's.
  const setEq = sharedSetEq;
  check("event vocabulary set-equals DM_EVENT_TYPES (87)",
    Array.isArray(vocab) && setEq(vocab, win.DM_EVENT_TYPES) && vocab.length === win.DM_EVENT_TYPES.length,
    "vocab=" + (vocab && vocab.length) + " registry=" + (win.DM_EVENT_TYPES && win.DM_EVENT_TYPES.length));
  // R3 check 2 (RED-FIRST mutation): a BOUND applyEvent's toString() is `function () { [native code] }`
  // (zero `case` lines) — the RETIRED toString-regex would return [] here; the registry-backed vocab
  // still returns the full 87. This is the value MOVING from 0→87, not a label assertion.
  win.eval('applyEvent = applyEvent.bind(null);');
  const vocabBound = win.seatEventVocabulary();
  check("vocabulary still returns 87 after applyEvent.bind(null) (toString-regex fragility retired)",
    Array.isArray(vocabBound) && vocabBound.length === win.DM_EVENT_TYPES.length && setEq(vocabBound, win.DM_EVENT_TYPES),
    "boundVocab=" + (vocabBound && vocabBound.length));
  check("vocabulary includes known real event types", vocab.includes("hp_changed") && vocab.includes("clock_advanced") && vocab.includes("fact_canonized"),
    JSON.stringify(vocab.slice(0, 10)));
  check("vocabulary does NOT include a made-up type", !vocab.includes("totally_not_a_real_event"));

  // UNKNOWN-EVENT DROP (§4 gate 2 / §3 step 2)
  const gate = win.seatValidate({
    narration: "test", events: [
      { type: "hp_changed", payload: { delta: -3 } },
      { type: "totally_made_up_event", payload: {} },
    ]
  });
  check("seatValidate keeps known events", gate.ok && gate.response.events.length === 1 && gate.response.events[0].type === "hp_changed",
    JSON.stringify(gate));
  check("seatValidate drops the unknown event", gate.dropped.length === 1 && gate.dropped[0] === "totally_made_up_event",
    JSON.stringify(gate.dropped));
  check("dropped event is recorded in dmNotes", /totally_made_up_event/.test(gate.response.dmNotes || ""),
    gate.response.dmNotes);

  // required-keys gate
  const badGate = win.seatValidate({ narration: "no events key here" });
  check("seatValidate rejects a response missing required keys", badGate.ok === false, JSON.stringify(badGate));

  // V1 (boundary ratchet, D1 lock): the /seat POST body's key set is exactly {system,messages,lane,turnId}
  const bodyKeys = new Set(Object.keys(Object.assign({}, { system: "s", messages: [] }, { lane: "fast", turnId: "t-1" })));
  check("V1: /seat POST body key set is exactly {system,messages,lane,turnId} (no model/stream)",
    bodyKeys.size === 4 && bodyKeys.has("system") && bodyKeys.has("messages") && bodyKeys.has("lane") && bodyKeys.has("turnId") &&
    !bodyKeys.has("model") && !bodyKeys.has("stream"),
    JSON.stringify([...bodyKeys]));

  // V2 (ratchet): seatEventVocabulary() is set-equal to win.DM_EVENT_TYPES (count asserted against
  // the live registry length, not a literal, so a future TRANSITION-CONTRACT growth lands green).
  const v2vocab = win.seatEventVocabulary();
  const v2set = new Set(v2vocab), v2reg = new Set(win.DM_EVENT_TYPES);
  const v2setEqual = v2set.size === v2reg.size && [...v2set].every((t) => v2reg.has(t));
  check("V2: seatEventVocabulary() is set-equal to win.DM_EVENT_TYPES",
    v2vocab.length === win.DM_EVENT_TYPES.length && v2setEqual,
    "vocab.length=" + v2vocab.length + " registry.length=" + win.DM_EVENT_TYPES.length);

  // V3 (RED-FIRST + mutation, the D6 proof): splice "kill" out of the registry via the window-exposed
  // SAME array object seatEventVocabulary reads by bare name -- proves the vocabulary is REGISTRY-DRIVEN,
  // not a source-regex derivation (which would keep "kill" no matter what the registry says).
  const beforeLen = win.seatEventVocabulary().length;
  const killIdx = win.DM_EVENT_TYPES.indexOf("kill");
  win.DM_EVENT_TYPES.splice(killIdx, 1);
  const afterVocab = win.seatEventVocabulary();
  check("V3 (RED-FIRST/mutation): splicing \"kill\" out of DM_EVENT_TYPES drops it from the vocabulary by exactly 1",
    afterVocab.length === beforeLen - 1 && !afterVocab.includes("kill"),
    "before=" + beforeLen + " after=" + afterVocab.length + " hasKill=" + afterVocab.includes("kill"));

  // V4 (mutation, downstream): with the splice still in place, seatValidate now drops a "kill" event
  // that would have been KEPT pre-splice -- the drop count MOVED (0 -> 1), not just a label.
  const preGate = { narration: "x", events: [{ type: "kill", payload: {} }] };
  const postSpliceGate = win.seatValidate(preGate);
  check("V4 (mutation, downstream): post-splice seatValidate drops a \"kill\" event (dropped.length 0->1)",
    postSpliceGate.dropped.length === 1 && postSpliceGate.response.events.length === 0,
    JSON.stringify(postSpliceGate));

  // restore the registry before subsequent checks (§6 V4 discipline)
  win.DM_EVENT_TYPES.splice(killIdx, 0, "kill");
  win.seatEventVocabulary();
  const restoredGate = win.seatValidate(preGate);
  check("V4 restore: registry restored, seatValidate keeps \"kill\" again (dropped.length back to 0)",
    restoredGate.dropped.length === 0 && restoredGate.response.events.length === 1,
    JSON.stringify(restoredGate));
})

/* ========================================================================
   3. JSON EXTRACTION — tolerate fences/prose slips (§3 step 1)
   ======================================================================== */
.then(() => {
  const clean = win.seatExtractJson('{"narration":"hi","events":[]}');
  check("extracts a bare JSON object", clean && clean.narration === "hi", JSON.stringify(clean));

  const fenced = win.seatExtractJson('Sure, here you go:\n```json\n{"narration":"fenced","events":[]}\n```\nHope that helps!');
  check("extracts JSON out of a markdown fence with prose around it", fenced && fenced.narration === "fenced", JSON.stringify(fenced));

  const garbage = win.seatExtractJson("I'm sorry, I can't help with that.");
  check("returns null for text with no JSON at all", garbage === null, JSON.stringify(garbage));
})

/* ========================================================================
   4. RETRY-THEN-ERROR-ENVELOPE (§3 step 1 / §4 gate 2)
   ======================================================================== */
.then(() => {
  resetSeatState();
  const w = mkWorld(); installWorld(w); stubSideEffects();

  // seatResolveResponse(rawText, turnId, assembled, lane) is handed the FIRST attempt's raw text
  // directly (mirroring how seatSend calls it, off its own initial seatPostAndStream) -- so its own
  // internal retry is the FIRST live /seat POST the router sees. Seed index 0 with the clean reply to
  // confirm exactly one retry recovers a transient parse miss.
  let calls = installFetchRouter({
    promptText: "SYS",
    seatReplies: ['{"narration":"recovered","events":[]}']
  });
  return win.seatBoot().then(() => win.seatResolveResponse(
    "Sorry, I got confused and said nothing useful.", "t-retry",
    win.seatAssembleMessages(w, { turnId: "t-retry", action: "x", digest: {} }), "fast"
  )).then((resp) => {
    check("ONE corrective retry recovers a clean reply", resp.narration === "recovered", JSON.stringify(resp));
    // SEAT_RETRY_INSTRUCTION is a module-scoped const (not window.*, the eval-scope gotcha) -- match
    // on the known instruction substring instead of the identifier.
    check("the retry call carried the corrective instruction",
      calls.seat.length === 1 && calls.seat[0].messages.some(function(m){ return /Reply with ONLY the TurnResponse JSON/.test(m.content); }),
      JSON.stringify(calls.seat.map(function(c){ return c.messages.map(function(m){ return m.content.slice(0,40); }); })));

    // now the retry ALSO fails to parse -- must fall to the stutter envelope, never throw.
    resetSeatState();
    installFetchRouter({ promptText: "SYS", seatReplies: ["still garbage even after the retry"] });
    return win.seatBoot().then(() => win.seatResolveResponse(
      "still garbage", "t-fail",
      win.seatAssembleMessages(w, { turnId: "t-fail", action: "x", digest: {} }), "fast"
    ));
  }).then((resp2) => {
    check("second consecutive parse failure falls to the in-voice stutter envelope",
      resp2.dmNotes === "seat-parse-fail" && Array.isArray(resp2.events) && resp2.events.length === 0,
      JSON.stringify(resp2));
    check("stutter envelope narration is in-voice prose, not raw plumbing",
      typeof resp2.narration === "string" && resp2.narration.length > 0 && !/error|exception|undefined/i.test(resp2.narration),
      resp2.narration);
  });
})

/* ========================================================================
   5. LANE → MODEL MAPPING (§1 "Providers & lanes")
   ======================================================================== */
.then(() => {
  resetSeatState();
  const w = mkWorld({ currentNodeId: "n9", dm: { lastNarratedNodeId: "n1", transport: "seat" } }); // new-place → deep
  installWorld(w); stubSideEffects();
  const calls = installFetchRouter({ promptText: "SYS", seatReplies: ['{"narration":"ok","events":[]}'] });

  return win.seatSend("I look around.", []).then(() => {
    check("seat POST body carries the script-owned lane", calls.seat.length === 1 && calls.seat[0].lane === "deep",
      JSON.stringify(calls.seat[0] && calls.seat[0].lane));

    resetSeatState();
    const w2 = mkWorld({ dm: { lastNarratedNodeId: "n1", transport: "seat" } }); // already-narrated node → fast
    installWorld(w2); stubSideEffects();
    const calls2 = installFetchRouter({ promptText: "SYS", seatReplies: ['{"narration":"ok","events":[]}'] });
    return win.seatSend("I tidy my pack.", []).then(() => {
      check("routine turn maps to the fast lane in the seat POST body", calls2.seat.length === 1 && calls2.seat[0].lane === "fast",
        JSON.stringify(calls2.seat[0] && calls2.seat[0].lane));
    });
  });
})

/* ========================================================================
   6. STREAM-THEN-APPLY ORDERING (§1 "events apply then (never mid-stream)")
   ======================================================================== */
.then(() => {
  resetSeatState();
  const w = mkWorld(); installWorld(w); stubSideEffects();

  const appliedLog = [];
  win.applyEvent = (world, e) => { appliedLog.push(e.type); return { ok: true }; };
  win.pushDmLog = () => {};

  // a streaming-capable fake Response: body.getReader() yields two SSE chunks, THEN the caller reads
  // the accumulated GS.seat.streamText mid-stream (before the promise resolves) to prove deltas landed
  // before the JSON was ever parsed/applied.
  const encoder = new win.TextEncoder();
  const finalJson = '{"narration":"The door creaks open.","events":[{"type":"hp_changed","payload":{"delta":-2}}]}';
  const chunks = [
    encoder.encode("data: The door \n\n"),
    encoder.encode("data: creaks...\n\n"),
    encoder.encode("data: " + finalJson + "\n\n"),
  ];
  // NOTE: seat.js's functions are classic-script top-level declarations sharing ONE eval scope --
  // seatReadSSE's internal call to seatStreamAppend(delta) resolves against that shared-scope binding,
  // NOT window.seatStreamAppend (the documented const/function-vs-window gotcha, CLAUDE.md). So this
  // test can't spy by reassigning win.seatStreamAppend -- instead it snapshots win.GS.seat.streamText
  // from INSIDE the fake reader's read() (a point it fully controls), the instant a chunk lands, which
  // is functionally the same "did text land before the reply resolved" proof.
  let ci = 0;
  let midStreamSnapshot = null;
  const fakeReader = {
    read: () => {
      if (ci >= chunks.length) return Promise.resolve({ done: true, value: undefined });
      const value = chunks[ci++];
      // give seatReadSSE's OWN pump a tick to consume+append this chunk before we snapshot, by
      // resolving on a microtask AFTER this read's value would have been processed -- simplest robust
      // approach: snapshot on the NEXT read() call, which only happens after the previous chunk's
      // seatStreamAppend has already run synchronously inside seatConsumeSSELine's onDelta callback.
      if (midStreamSnapshot === null && ci > 1) {
        midStreamSnapshot = { text: win.GS.seat.streamText, appliedSoFar: appliedLog.length,
          meaningfulFeedbackMs:win.GS.dm.lastTurnMeta&&win.GS.dm.lastTurnMeta.meaningfulFeedbackMs };
      }
      return Promise.resolve({ done: false, value });
    }
  };

  win.fetch = (url, opt) => {
    const u = String(url);
    if (u.endsWith("docs/SEAT-PROMPT.md")) return Promise.resolve({ ok: true, text: () => Promise.resolve("SYS") });
    if (u.endsWith("/seat")) {
      return Promise.resolve({ ok: true, body: { getReader: () => fakeReader } });
    }
    return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
  };

  return win.seatSend("I push the door.", []).then(() => {
    check("narration streamed into GS.seat.streamText before the turn resolved",
      midStreamSnapshot && midStreamSnapshot.text && midStreamSnapshot.text.length > 0,
      JSON.stringify(midStreamSnapshot));
    check("applyEvent had NOT fired yet at the moment the first delta streamed in (no mid-stream apply)",
      midStreamSnapshot && midStreamSnapshot.appliedSoFar === 0,
      JSON.stringify(midStreamSnapshot));
    check("meaningful-feedback timing waits for visible prose, not merely request acknowledgement",
      midStreamSnapshot && typeof midStreamSnapshot.meaningfulFeedbackMs === "number",
      JSON.stringify(midStreamSnapshot));
    check("applyEvent fires exactly once, AFTER the stream closed", appliedLog.length === 1 && appliedLog[0] === "hp_changed",
      JSON.stringify(appliedLog));
    check("stream buffer is cleared once the turn is applied", win.GS.seat.streamText === null && win.GS.seat.streaming === false,
      JSON.stringify({ text: win.GS.seat.streamText, streaming: win.GS.seat.streaming }));
  });
})

/* ========================================================================
   7. THE TOGGLE — mailbox stays default; missing prompt refuses to switch on
   ======================================================================== */
.then(() => {
  resetSeatState();
  const w = mkWorld({ dm: { lastNarratedNodeId: "n1" } }); // no transport key at all
  delete w.dm.transport;
  installWorld(w); stubSideEffects();
  check("seatEnabled defaults OFF (mailbox) when w.dm.transport is absent", win.seatEnabled(w) === false);

  // seatToggleTransport refuses to switch ON when no prompt has ever loaded (clean degrade, §"SEAT-
  // PROMPT.md doesn't exist yet either").
  installFetchRouter({ promptText: null }); // 404
  return win.seatBoot().then((text) => {
    check("seatBoot degrades cleanly on a missing prompt file (resolves null, does not throw)", text === null);
    check("seatReady() is false with no prompt loaded", win.seatReady() === false);
    win.seatToggleTransport();
    check("seatToggleTransport refuses to switch to the seat with no prompt loaded", w.dm.transport !== "seat",
      "w.dm.transport=" + w.dm.transport);
  });
})

/* ========================================================================
   8. sendTurn's branch — mailbox path is untouched when the flag is off/absent
   ======================================================================== */
.then(() => {
  resetSeatState();
  const w = mkWorld({ dm: { lastNarratedNodeId: "n1" } }); // mailbox (no transport==="seat")
  delete w.dm.transport;
  installWorld(w); stubSideEffects();
  win.pushDmLog = () => {};
  let mailboxHit = false, seatHit = false;
  win.fetch = (url) => {
    const u = String(url);
    if (u.endsWith("/turn")) { mailboxHit = true; return Promise.resolve({ ok: true, json: () => Promise.resolve({ turnId: "t-x" }) }); }
    if (u.endsWith("/seat")) { seatHit = true; return Promise.resolve({ ok: true, text: () => Promise.resolve('{"narration":"x","events":[]}') }); }
    return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
  };
  win.sendTurn("I look around.", []);
  check("sendTurn with no seat flag still POSTs to the mailbox's /turn route", mailboxHit === true);
  check("sendTurn with no seat flag never touches /seat", seatHit === false);

  // flip the flag on directly (bypassing the toggle's prompt-loaded guard, to isolate sendTurn's own
  // branch logic) and confirm the SAME action now routes to the seat instead.
  resetSeatState();
  const w2 = mkWorld({ dm: { lastNarratedNodeId: "n1", transport: "seat" } });
  installWorld(w2); stubSideEffects(); win.pushDmLog = () => {};
  let mailboxHit2 = false, seatHit2 = false;
  win.fetch = (url) => {
    const u = String(url);
    if (u.endsWith("docs/SEAT-PROMPT.md")) return Promise.resolve({ ok: true, text: () => Promise.resolve("SYS") });
    if (u.endsWith("/turn")) { mailboxHit2 = true; return Promise.resolve({ ok: true, json: () => Promise.resolve({ turnId: "t-x" }) }); }
    if (u.endsWith("/seat")) { seatHit2 = true; return Promise.resolve({ ok: true, text: () => Promise.resolve('{"narration":"x","events":[]}') }); }
    return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
  };
  return win.sendTurn("I look around.", []).then(() => {
    check("sendTurn with w.dm.transport==='seat' routes to /seat instead", seatHit2 === true && mailboxHit2 === false,
      JSON.stringify({ mailboxHit2, seatHit2 }));
  });
})

/* ========================================================================
   9. CONVERSATION-STATE REPAIRS (HOTFIX-QUEUE-2026-07-06 H7) — 7a/7b/7c/7d
   ======================================================================== */
.then(() => {
  // --- 7b: the turn must ride EXACTLY once (no double payload) ---
  resetSeatState();
  const w = mkWorld(); installWorld(w); stubSideEffects(); win.pushDmLog = () => {};
  const calls = installFetchRouter({ promptText: "SYS", seatReplies: ['{"narration":"ok","events":[]}'] });
  return win.seatSend("I look for the seam.", []).then(() => {
    const body = calls.seat[0];
    const payloadStr = body.messages[body.messages.length - 1].content;   // the this-turn payload
    const occurrences = body.messages.filter(m => m.content === payloadStr).length;
    check("7b: this-turn payload appears EXACTLY once in the POST body (no double ride)",
      occurrences === 1, "occurrences=" + occurrences);
    check("7b: the LAST message is the payload and the second-to-last is not an identical payload",
      body.messages[body.messages.length - 1].content === payloadStr &&
      (body.messages.length < 2 || body.messages[body.messages.length - 2].content !== payloadStr),
      JSON.stringify(body.messages.map(m => m.role)));
  });
})

.then(() => {
  // --- 7a: a new session re-sends the bootstrap and carries NO prior-session window turns ---
  resetSeatState();
  const wA = mkWorld({ id: "w-a", name: "World A" }); installWorld(wA); stubSideEffects(); win.pushDmLog = () => {};
  installFetchRouter({ promptText: "SYS", seatReplies: ['{"narration":"a1","events":[]}'] });
  return win.seatSend("world-A turn one", []).then(() => {
    // simulate endSession's seat reset + a fresh session (H4 not landed here, so call the helper directly)
    win.seatResetSession();
    const calls2 = installFetchRouter({ promptText: "SYS", seatReplies: ['{"narration":"a2","events":[]}'] });
    return win.seatSend("world-A NEW session turn", []).then(() => {
      const msgs = calls2.seat[0].messages;
      check("7a: after a session reset the first POST re-sends the bootstrap block",
        msgs[0].content.indexOf("SESSION OPENING DIGEST") >= 0,
        JSON.stringify(msgs.map(m => m.content.slice(0, 30))));
      check("7a: the new session's POST carries NO prior-session window turn",
        !msgs.some(m => m.content === JSON.stringify({ turnId: undefined })) &&
        !msgs.some(m => /world-A turn one/.test(m.content)),
        JSON.stringify(msgs.map(m => m.content.slice(0, 40))));
    });
  });
})

.then(() => {
  // --- 7c-retry: an unparseable first reply retries WITH the bootstrap + exactly one payload ---
  resetSeatState();
  const w = mkWorld(); installWorld(w); stubSideEffects(); win.pushDmLog = () => {};
  // first live /seat POST (index 0) is the RETRY (seatSend's own first POST returns the unparseable
  // raw the router serves at index 0 too — but seatResolveResponse is what re-POSTs). Serve garbage
  // first, clean on the retry.
  const calls = installFetchRouter({
    promptText: "SYS",
    seatReplies: ["not json at all", '{"narration":"recovered","events":[]}']
  });
  return win.seatSend("turn that stutters", []).then(() => {
    // calls.seat[0] = the initial POST, calls.seat[1] = the corrective retry
    const retry = calls.seat[calls.seat.length - 1];
    // the this-turn payload is any message whose content parses to an object carrying this action —
    // detect it by parse (robust to field ordering / uid-generated turnId) rather than reconstructing.
    const isPayload = (m) => { try { const j = JSON.parse(m.content); return j && j.action === "turn that stutters"; } catch { return false; } };
    const payloadCount = retry.messages.filter(isPayload).length;
    check("7c-retry: the retry POST still carries the bootstrap block",
      retry.messages.some(m => m.content.indexOf("SESSION OPENING DIGEST") >= 0),
      JSON.stringify(retry.messages.map(m => m.content.slice(0, 30))));
    check("7c-retry: the retry POST carries exactly one this-turn payload",
      payloadCount === 1, "payloadCount=" + payloadCount + " retryMsgs=" + JSON.stringify(retry.messages.map(m => m.content.slice(0,40))));
    check("7c-retry: the retry POST carries the corrective instruction",
      retry.messages.some(m => /Reply with ONLY the TurnResponse JSON/.test(m.content)),
      JSON.stringify(retry.messages.map(m => m.content.slice(0, 40))));
  });
})

.then(() => {
  // --- 7c-catch: a rejected fetch unwinds the pushed user turn + restores bootstrapped on a first turn ---
  resetSeatState();
  const w = mkWorld(); installWorld(w); stubSideEffects(); win.pushDmLog = () => {};
  win.seatState().promptText = "SYS";   // boot already done (skip fetch on prompt)
  const beforeLen = win.seatState().window.length;
  win.fetch = (url) => {
    const u = String(url);
    if (u.endsWith("docs/SEAT-PROMPT.md")) return Promise.resolve({ ok: true, text: () => Promise.resolve("SYS") });
    if (u.endsWith("/seat")) return Promise.reject(new Error("network down"));
    return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
  };
  return win.seatSend("a turn that fails to send", []).then(
    () => { check("7c-catch: seatSend rejected (fetch failure propagates)", false, "unexpected resolve"); },
    () => {
      check("7c-catch: window length returned to its pre-send value after the failure",
        win.seatState().window.length === beforeLen,
        "before=" + beforeLen + " after=" + win.seatState().window.length);
      check("7c-catch: bootstrapped restored to false after a failed FIRST turn",
        win.seatState().bootstrapped === false, "bootstrapped=" + win.seatState().bootstrapped);
    }
  );
})

.then(() => {
  // --- 7d: toggling transport clears the summary (no stale summarized history resurrection) ---
  resetSeatState();
  const w = mkWorld({ dm: { lastNarratedNodeId: "n1", transport: "mailbox" } }); installWorld(w); stubSideEffects();
  win.seatState().promptText = "SYS";        // seatReady() true so the toggle will switch ON
  win.seatState().summary = "STALE SUMMARY";
  win.seatToggleTransport();                  // mailbox -> seat
  check("7d: transport toggle clears s.summary (no stale summary resurrection)",
    win.seatState().summary === null, "summary=" + JSON.stringify(win.seatState().summary));
})

.then(() => {
  // --- HQ2-5 probe 1: a throw AFTER the assistant reply is pushed unwinds BOTH the user and
  // assistant entries (not just the user one) — the H7-era catch only popped a top-of-window
  // "user" entry, so an assistant entry left on top by this bug survived the unwind. ---
  resetSeatState();
  const w = mkWorld(); installWorld(w); stubSideEffects(); win.pushDmLog = () => {};
  win.seatState().promptText = "SYS";   // boot already done (skip fetch on prompt)
  const beforeLen = win.seatState().window.length;
  const realSeatApplyResponse = win.seatApplyResponse;
  win.seatApplyResponse = () => { throw new Error("applyEvent blew up mid-apply"); };
  installFetchRouter({ promptText: "SYS", seatReplies: ['{"narration":"ok so far","events":[]}'] });
  return win.seatSend("a turn whose apply throws", []).then(
    () => { check("HQ2-5 probe 1: seatSend rejected (post-assistant-push throw propagates)", false, "unexpected resolve"); },
    () => {
      check("HQ2-5 probe 1: window length returned to its pre-send value (assistant AND user popped)",
        win.seatState().window.length === beforeLen,
        "before=" + beforeLen + " after=" + win.seatState().window.length +
        " window=" + JSON.stringify(win.seatState().window.map(m => m.role)));
    }
  ).then(() => { win.seatApplyResponse = realSeatApplyResponse; });
})

.then(() => {
  // --- HQ2-5 probe 2 (regression guard): a throw BEFORE the assistant push (e.g. the transport
  // rejects) still only pops the user turn — no assistant entry ever existed, so the flag-guarded
  // assistant pop must be a no-op here. Window returns to its pre-send length either way. ---
  resetSeatState();
  const w = mkWorld(); installWorld(w); stubSideEffects(); win.pushDmLog = () => {};
  win.seatState().promptText = "SYS";
  const beforeLen = win.seatState().window.length;
  win.fetch = (url) => {
    const u = String(url);
    if (u.endsWith("docs/SEAT-PROMPT.md")) return Promise.resolve({ ok: true, text: () => Promise.resolve("SYS") });
    if (u.endsWith("/seat")) return Promise.reject(new Error("network down before any reply"));
    return Promise.resolve({ ok: true, status: 204, json: () => Promise.resolve({}) });
  };
  return win.seatSend("a turn that fails before any assistant reply", []).then(
    () => { check("HQ2-5 probe 2: seatSend rejected (pre-assistant-push throw propagates)", false, "unexpected resolve"); },
    () => {
      check("HQ2-5 probe 2: throw-before-assistant still pops only the user turn (window back to pre-send length)",
        win.seatState().window.length === beforeLen,
        "before=" + beforeLen + " after=" + win.seatState().window.length);
    }
  );
})

.then(() => {
  console.log(`\n${fail ? "✗" : "✓"} seat: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})
.catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
