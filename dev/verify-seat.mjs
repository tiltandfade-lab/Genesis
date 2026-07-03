/* Verify DM-SEAT's app module — full-app jsdom load, MOCK /seat endpoint (spec: docs/DM-SEAT.md
   §4.1 "dev/verify-seat.mjs (jsdom, mock endpoint)"). No SEAT_API_KEY needed — this never talks to a
   real provider; it stubs `fetch`/docs/SEAT-PROMPT.md and exercises seat.js's own logic:

     1. assembly: prefix byte-stability across turns (system+bootstrap+summary identical bytes call to
        call), window slide (the rolling ~12-turn window evicts+folds past its cap), digest inclusion
        (dmDigest's JSON rides the trailing "this turn" message).
     2. validation: ONE corrective retry on a parse failure, then the in-voice stutter envelope on a
        second failure — the session never throws past sendTurn's caller.
     3. unknown-event drop: an events[] entry whose type isn't in applyEvent's own live vocabulary is
        stripped (never reaches applyEvent), with a dmNotes note recording what was dropped.
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

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const src = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;

const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div><div id="toast"></div></body></html>`, { runScripts: "dangerously" });
const win = dom.window;
win.eval(harness + "\n" + src);

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
   2. EVENT VOCABULARY — derived from applyEvent's live dispatch (§3.2)
   ======================================================================== */
.then(() => {
  const vocab = win.seatEventVocabulary(true);
  check("event vocabulary is derived (non-empty) from applyEvent's own source",
    Array.isArray(vocab) && vocab.length > 20, "found " + (vocab && vocab.length));
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
        midStreamSnapshot = { text: win.GS.seat.streamText, appliedSoFar: appliedLog.length };
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

.then(() => {
  console.log(`\n${fail ? "✗" : "✓"} seat: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})
.catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
