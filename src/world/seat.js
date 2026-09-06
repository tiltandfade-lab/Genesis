/* GENESIS MODULE — src/world/seat.js — THE SEAT (docs/DM-SEAT.md §5.1 feat/seat-app-module).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The API-direct DM transport: assembles a message array (§2), POSTs it to the bridge's `/seat`
   proxy route (built by a SEPARATE unit — feat/seat-bridge-proxy — this module never talks to a
   provider directly, never holds a key), streams the SSE narration into the feed as it arrives,
   and validates+applies the TurnResponse JSON only once the stream closes (§3, "stream-then-apply
   ordering" — events NEVER apply mid-stream). Same TurnRequest/TurnResponse envelope as the mailbox
   (docs/DM-BRIDGE.md) — DIET/ROLL-BRANCHES/ON-DEMAND-GEN transfer unchanged; only the transport and
   the message-assembly differ.

   TRANSPORT SELECTION (the settings toggle, §5.1): `w.dm.transport` is the persisted per-world flag,
   `"mailbox"` (default, unchanged behavior) or `"seat"`. Mirrors how every other GS/w flag toggle in
   this codebase works — a plain string/bool on the persisted world object, flipped by a Menu button,
   read at the single call site that needs to branch (world.dm's sendTurn). Adding the seat must NOT
   change one byte of the mailbox path when the flag is absent/mailbox — see dm.js's sendTurn branch.

   SEAT-PROMPT.md (§2) doesn't exist yet either (a FRONTIER-authored unit, docs/DM-SEAT.md §5 item 4).
   seatBoot() fetches it once per session with a clean degrade: missing file → the seat is disabled
   (toast, and sendTurn's branch falls back to the mailbox) rather than sending a request with no
   system prompt. */

const SEAT_PROMPT_PATH = "docs/SEAT-PROMPT.md";
const SEAT_WINDOW_TURNS = 12;          // §2 "rolling window ~12 exchanges" — older turns fold into ONE summary block
const SEAT_ROUTE = "/seat";            // same-origin bridge proxy route (feat/seat-bridge-proxy's job to serve)

/* ============================================================
   1. TRANSPORT SELECTION — the settings toggle
   ============================================================ */

/* Is the seat the active transport for this world? Default OFF (mailbox) — an absent/unrecognized
   flag NEVER accidentally activates the seat (fail toward the well-tested path). */
function seatEnabled(w){
  return !!(w && w.dm && w.dm.transport === "seat");
}

/* Flip the toggle. Mirrors toggleMenu/toggleSheetSection's shape (render.js): a plain state flip +
   persist + re-render, wired to a Menu button. Refuses to switch TO the seat if boot hasn't loaded a
   prompt (seatReady) — never strand the player on a transport with nothing to say. Switching back to
   the mailbox always succeeds (the safe direction). */
function seatToggleTransport(){
  const w = activeWorld(); if(!w) return;
  w.dm = w.dm || {};
  const turningOn = w.dm.transport !== "seat";
  if(turningOn && !seatReady()){
    toast("The seat has no prompt loaded yet — staying on the mailbox. (docs/SEAT-PROMPT.md missing?)");
    return;
  }
  w.dm.transport = turningOn ? "seat" : "mailbox";
  // a transport switch starts a fresh rolling window — turns composed under one transport's history
  // shape shouldn't bleed into the other's prefix. HOTFIX-QUEUE-2026-07-06 H7 (7d): seatResetSession
  // clears summary too — a bare window/bootstrapped reset used to leave s.summary alive, so a
  // transport round-trip resurrected stale summarized history.
  seatResetSession();
  saveU(U);
  toast(turningOn ? "DM seat: on (API-direct)" : "DM seat: off (mailbox)");
  renderWorld();
}

/* ============================================================
   2. SEAT-PROMPT.md — fetched once, byte-identical every call (§2 cache discipline)
   ============================================================ */

/* GS.seat holds the transient per-session seat state (mirrors GS.dm's shape): the fetched system
   prompt text, the rolling window of {role,content} turns, a monotonic summary of evicted turns, and
   the bootstrap-sent flag (session bootstrap rides ONCE — docs/DM-SEAT.md §2 "user 1"). Never persisted
   (GS is transient, like GS.dm) — a reload re-fetches the prompt and re-bootstraps, same posture as the
   mailbox's loop-restart-re-reads-bootstrap discipline (DM-BRIDGE.md digest-diet section). */
function seatState(){
  if(!GS.seat) GS.seat = { promptText: null, promptTried: false, window: [], summary: null, bootstrapped: false };
  return GS.seat;
}

function seatReady(){
  const s = seatState();
  return !!s.promptText;
}

/* Reset the per-session conversation state (window/summary/bootstrapped/stream) — keeps the
   fetched prompt (promptText/promptTried: per-BOOT, not per-session; byte-identical anyway).
   HOTFIX-QUEUE-2026-07-06 H7: called on world entry/session start/end (7a) and by
   seatToggleTransport (7d) so a new world/session never replays the previous one's window or
   summary and always re-sends the bootstrap block. */
function seatResetSession(){
  const s = seatState();
  s.window = []; s.summary = null; s.bootstrapped = false;
  s.streamText = null; s.streaming = false;
}

/* Fetch docs/SEAT-PROMPT.md once per session. Clean degrade (§ spec): a missing file does NOT throw
   into the caller's turn-send path — it disables the seat (promptText stays null; seatReady() false;
   seatToggleTransport refuses to switch on) and toasts once. Idempotent: a second call before the
   first resolves reuses the in-flight promise; a call after success is a no-op resolve. */
function seatBoot(){
  const s = seatState();
  if(s.promptText) return Promise.resolve(s.promptText);
  if(s._bootPromise) return s._bootPromise;
  s._bootPromise = fetch(SEAT_PROMPT_PATH, { cache: "no-store" })
    .then(r => { if(!r.ok) throw new Error("seat prompt "+r.status); return r.text(); })
    .then(text => { s.promptText = text; s.promptTried = true; return text; })
    .catch(e => {
      s.promptText = null; s.promptTried = true;
      console.warn("[seat] SEAT-PROMPT.md unavailable — seat disabled, mailbox stays the path:", e);
      toast("DM seat unavailable (no prompt file) — using the mailbox.");
      return null;
    })
    .finally(() => { s._bootPromise = null; });
  return s._bootPromise;
}

/* ============================================================
   3. MESSAGE ASSEMBLY (§2) — prefix byte-stability + window slide
   ============================================================ */

/* The session-bootstrap block (§2 "user 1"): the prep handoff + opening digest, sent ONCE per session
   (mirrors dmDigest's foundingTurn / tiylLifeDigest send-once discipline elsewhere in this codebase).
   Best-effort — a missing copyPrepHandoff-style bundle degrades to just the opening digest text; the
   seat still works with less orientation rather than failing to boot. */
function seatBootstrapContent(w){
  const parts = [];
  // prepHandoff(w) (src/world/prep.js) is the SAME text the manual clipboard fallback (copyPrepHandoff)
  // already hands a DM — reused verbatim rather than re-deriving a second bootstrap shape. Always
  // returns a string (a "(no prep staged…)" placeholder when nothing's staged, never null/throws).
  if(typeof prepHandoff === "function") parts.push(prepHandoff(w));
  else if(w.prep && w.prep.bundle) parts.push("PREP BUNDLE (bootstrap):\n" + JSON.stringify(w.prep.bundle));
  parts.push("SESSION OPENING DIGEST:\n" + JSON.stringify(dmDigest()));
  return parts.join("\n\n");
}

/* Fold the oldest evicted turns of the rolling window into ONE compact summary line. §1 fork 4: "one
   FAST-model call per eviction" is the ideal (a real distillation) — this module has no model call of
   its own to spend on it (the seat proxy is the only model-calling surface, and spending a call on
   summarization mid-turn would violate the "one call per turn" rule, §1). So: a deterministic,
   zero-inference concatenation of the evicted exchanges' first lines, monotonically appended (never
   re-summarized), preserving the cache-prefix-stability discipline (§2 "no timestamps/randomness in
   the prefix; history appended monotonically"). A real distillation call is a documented later upgrade
   (uncertainty, not a broken contract) — this keeps the prefix byte-stable and the window bounded,
   which is what §4's tests actually gate on. */
function seatFoldSummary(s, evicted){
  if(!evicted.length) return;
  const lines = evicted.map(t => "· " + t.role + ": " + String(t.content).slice(0, 140).replace(/\s+/g," "));
  s.summary = (s.summary ? s.summary + "\n" : "") + lines.join("\n");
}

/* Push one exchange (player turn OR DM reply) onto the rolling window, sliding + folding when it grows
   past SEAT_WINDOW_TURNS. Called by seatSend (player) and seatApplyResponse (DM) so the window always
   reflects exactly what was sent/received — never re-derived from dmlog (dmlog is the PLAYER-FACING
   feed incl. system lines; the window is the LLM-facing exchange history, a different shape). */
function seatWindowPush(role, content){
  const s = seatState();
  s.window.push({ role, content });
  if(s.window.length > SEAT_WINDOW_TURNS){
    const evicted = s.window.splice(0, s.window.length - SEAT_WINDOW_TURNS);
    seatFoldSummary(s, evicted);
  }
}

/* Assemble the full message array for this turn (§2's four-part shape). Returns
   { system, messages:[{role,content}] } — provider-agnostic (the bridge proxy adapts to whichever
   wire shape SEAT_PROVIDER needs; this module never speaks provider dialect, per §1's proxy fork).
   PREFIX BYTE-STABILITY (§4 gate 1): system + bootstrap + summary are IDENTICAL byte-for-byte across
   calls within a session (no timestamps/randomness woven in) — only the trailing window + "this turn"
   message change call to call, so a caching provider's prefix hit rate stays high. */
function seatAssembleMessages(w, turnPayload){
  const s = seatState();
  const messages = [];
  if(!s.bootstrapped){
    messages.push({ role: "user", content: seatBootstrapContent(w) });
    s.bootstrapped = true;
  }
  if(s.summary) messages.push({ role: "user", content: "EARLIER THIS SESSION (summary):\n" + s.summary });
  s.window.forEach(t => messages.push({ role: t.role, content: t.content }));
  messages.push({ role: "user", content: JSON.stringify(turnPayload) });
  return { system: s.promptText || "", messages };
}

/* ============================================================
   4. THE EVENT VOCABULARY — the declared DM_EVENT_TYPES registry
   (docs/SEAT-ADAPTER.md §2 D6 + docs/DM-CONTRACT-ARTIFACT.md §3 R2 — both units landed the
   same replacement of the old applyEvent-toString regex; this is their union)
   ============================================================ */

/* The vocabulary IS the declared registry. DM_EVENT_TYPES (src/world/dm.js) is the single source
   of truth, already parity-guarded against applyEvent's switch by dev/verify-dm-seam.mjs —
   deriving it a second time by regexing applyEvent's source (the old implementation) was the
   drift-prone duplicate GPT-5.5 flagged (breaks under bind/minification/refactor; the registry
   doesn't). Cacheless by choice: a fresh slice per call can never go stale after a registry patch. */
function seatEventVocabulary(){
  return (typeof DM_EVENT_TYPES !== "undefined" && Array.isArray(DM_EVENT_TYPES)) ? DM_EVENT_TYPES.slice() : [];
}

/* ============================================================
   5. VALIDATION (§3) — parse, schema-gate, drop unknown events
   ============================================================ */

const SEAT_RETRY_INSTRUCTION = "Reply with ONLY the TurnResponse JSON — no prose, no code fences, no explanation before or after.";

/* Extract the first {...} JSON block from raw text, tolerating markdown fences and stray prose around
   it (§3 step 1: "extract the first {...} JSON block (tolerate fences/prose slips)"). Returns the
   parsed object, or null if nothing in the text parses as a JSON object. */
function seatExtractJson(text){
  if(!text) return null;
  // prefer a fenced ```json ... ``` block if present (common model habit even when told not to).
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [];
  if(fence) candidates.push(fence[1]);
  // else/also: the first balanced-looking {...} span (greedy from first { to last } is good enough —
  // TurnResponse is always the one JSON object in the reply; the model isn't asked to emit two).
  const first = text.indexOf("{"), last = text.lastIndexOf("}");
  if(first >= 0 && last > first) candidates.push(text.slice(first, last+1));
  for(const c of candidates){
    try{ const j = JSON.parse(c); if(j && typeof j === "object") return j; }catch(e){ /* try next candidate */ }
  }
  return null;
}

const SEAT_REQUIRED_KEYS = ["narration", "events"];

/* Schema-gate a parsed TurnResponse (§3 step 2): required keys present, events is an array, every
   events[].type is in the live vocabulary (unknown types DROPPED with a dmNotes note — applyEvent
   itself is already fuzz-hardened against garbage, but the seat is the FIRST firewall, per the spec).
   Returns { ok, response, dropped:[...] } — response is the (possibly event-filtered) object, or null
   if the required-keys gate itself fails (caller retries/falls to the error envelope). */
function seatValidate(parsed){
  if(!parsed || typeof parsed !== "object") return { ok:false, response:null, dropped:[] };
  if(!SEAT_REQUIRED_KEYS.every(k => k in parsed)) return { ok:false, response:null, dropped:[] };
  const events = Array.isArray(parsed.events) ? parsed.events : [];
  const vocab = new Set(seatEventVocabulary());
  const kept = [], dropped = [];
  events.forEach(e => {
    if(e && e.type && vocab.has(e.type)) kept.push(e);
    else dropped.push(e && e.type || "(malformed)");
  });
  const response = Object.assign({}, parsed, { events: kept });
  if(dropped.length){
    response.dmNotes = (response.dmNotes ? response.dmNotes + " " : "") +
      "[seat: dropped unknown event type(s): " + dropped.join(", ") + "]";
  }
  return { ok:true, response, dropped };
}

/* The in-voice stutter envelope (§3 step 1, second-fail fallback): the session never crashes, the
   player sees an in-fiction beat asking them to try again rather than raw plumbing. */
function seatStutterEnvelope(turnId){
  return {
    turnId, narration: "(The world seems to hesitate — as if it heard you, but the words haven't reached it clean. Try again in a moment.)",
    events: [], rollRequest: null, ask: null, dmNotes: "seat-parse-fail"
  };
}

/* ============================================================
   6. THE SSE CLIENT — POST /seat, stream narration into the feed, apply at close
   ============================================================ */

/* Read a fetch Response's body as an SSE stream, calling onDelta(text) for every narration chunk as
   it arrives and resolving with the FULL concatenated raw text once the stream closes. Provider-
   agnostic on purpose: the bridge proxy (a separate unit) is expected to normalize whatever the
   upstream sends into simple `data: <chunk>\n\n` frames carrying either a plain text delta or a
   `{"delta":"..."}` JSON frame — this reader accepts either shape per-line so it doesn't have to be
   rebuilt when the proxy's exact framing is decided. `data: [DONE]` (the common SSE sentinel) ends the
   stream without erroring. */
function seatReadSSE(resp, onDelta){
  const reader = resp.body && resp.body.getReader ? resp.body.getReader() : null;
  if(!reader){
    // no streaming body (e.g. a test double or a non-streaming proxy fallback) — read it whole.
    return resp.text().then(text => { if(text) onDelta(text); return text; });
  }
  const decoder = new TextDecoder();
  let buf = "", full = "";
  function pump(){
    return reader.read().then(({ done, value }) => {
      if(done){
        if(buf.trim()) full += seatConsumeSSELine(buf, onDelta);
        return full;
      }
      buf += decoder.decode(value, { stream:true });
      const lines = buf.split("\n");
      buf = lines.pop();               // last (possibly partial) line stays buffered
      lines.forEach(line => { full += seatConsumeSSELine(line, onDelta); });
      return pump();
    });
  }
  return pump();
}

/* Parse one raw SSE line; if it carries a data payload, deliver the text delta to onDelta and return
   it (so the caller can also accumulate the full raw stream for the final JSON extraction). Non-data
   lines (blank keep-alives, `event:` lines, comments) return "". */
// the ONLY wrapper keys this reader recognizes as "this SSE frame is metadata, not narration text"
// (e.g. a `{"usage":{...}}` accounting frame some providers interleave). Deliberately narrow: the
// model's actual reply is a raw JSON object (the TurnResponse itself) streamed as TEXT — a payload
// like `{"narration":"...","events":[]}` must NOT be mistaken for a wrapper frame and swallowed, or
// the seat's real reply silently vanishes (the bug this allowlist exists to prevent). Only a payload
// whose SOLE top-level key is one of these is treated as non-text; anything else (including a bare
// JSON object with unrecognized keys) passes through as a literal text delta.
const SEAT_SSE_WRAPPER_KEYS = ["usage", "ping", "keepalive"];
function seatConsumeSSELine(line, onDelta){
  // trim only the LINE-terminating \r (a bare \n split may leave a trailing \r on some transports) —
  // NEVER the payload's own trailing whitespace, which is often a real word-boundary space the model
  // just streamed (SSE-per-spec strips at most one LEADING space after "data:", never trailing content).
  const l = line.replace(/\r$/, "");
  const trimmedForSniff = l.trim();
  if(!trimmedForSniff || trimmedForSniff.startsWith(":")) return "";
  if(!trimmedForSniff.startsWith("data:")) return "";
  const idx = l.indexOf("data:");
  let payload = l.slice(idx + 5);
  if(payload.startsWith(" ")) payload = payload.slice(1);   // strip exactly one leading space, per SSE
  if(payload === "[DONE]") return "";
  let delta = payload;
  try{
    const j = JSON.parse(payload);
    if(j && typeof j.delta === "string") delta = j.delta;
    else if(j && typeof j.text === "string") delta = j.text;
    else if(j && typeof j === "object" && !Array.isArray(j)){
      const keys = Object.keys(j);
      if(keys.length && keys.every(k => SEAT_SSE_WRAPPER_KEYS.indexOf(k) >= 0)) return "";   // a known metadata-only frame — nothing to stream
      // else: an unrecognized JSON shape (almost certainly the model's own TurnResponse text,
      // chunked) — fall through and stream the raw payload as-is, exactly like plain text.
    }
  }catch(e){ /* plain-text data line — use as-is */ }
  if(delta) onDelta(delta);
  return delta;
}

/* THE SEAT SEND — the seat's counterpart to dm.js's sendTurn. Same signature/contract shape as far as
   the caller (sendTurn's branch) is concerned: assembles the turn payload identically to the mailbox
   (dmDigest/lane stamping reused verbatim — DIET/ROLL-BRANCHES/ON-DEMAND-GEN transfer unchanged, per
   §1), POSTs to the bridge's /seat proxy, streams narration into the feed AS IT ARRIVES (GS.dm.pending
   stays true, but each delta calls seatStreamAppend so the player sees words land in real time — the
   "first words ~1-2s" promise), and — critically — does NOT parse/apply the TurnResponse JSON until
   the stream closes (§1 "events apply then (never mid-stream)"). On a parse failure it retries ONCE
   with a corrective instruction appended (§3 step 1); a second failure returns the stutter envelope
   rather than throwing. */
function seatSend(action, rolls, opts, prepared){
  const w = activeWorld(); if(!w) return Promise.reject("no world");
  if(w.dm&&w.dm.pendingTurnId)return Promise.reject(new Error("turn already pending: "+w.dm.pendingTurnId));
  // sendTurn normally hands us the already-routed/pre-resolved payload. The fallback keeps direct
  // seatSend harness calls on the same seam: no transport may resolve mechanics in a different order.
  const built=prepared&&prepared.turn?prepared:dmPrepareTurn(w,action,rolls,opts,
    dmResolveTurnRoute(w,action,opts,Date.now()));
  if(built.route.mode==="local-fact") return dmApplyLocalTurn(w,built,opts);
  const tri=built.tri, turnPayload=built.turn, turnId=turnPayload.turnId;
  // LANE→MODEL MAPPING (§1 "Providers & lanes"): the seat proxy needs to know which model to call —
  // the script-owned lane (dmTriage, unchanged from the mailbox) becomes a MODEL PARAMETER here instead
  // of runbook discipline a loop DM had to self-obey. "fast"→SEAT_MODEL_FAST, "deep"→SEAT_MODEL_DEEP;
  // the actual env-var resolution lives bridge-side (feat/seat-bridge-proxy) — the app just names the
  // lane, exactly as it already does for the mailbox's laneModel field.
  const seatLane = tri ? tri.lane : "fast";

  if(!(opts && opts.hidden)) pushDmLog(w, "player", action, { rolls: rolls || [], turnId });
  w.dm = w.dm || {}; w.dm.rollReq = null; w.dm.ask = null; w.dm.pendingTurnId = turnId; w.dm.lastResolution = null;
  w.dm.pendingTurnRequest=dmJsonClone(turnPayload); w.dm.pendingTurnPause=null;
  w.dm.pendingReceipt=built.receipt||null;
  w.dm.pendingAckSeq = (typeof codexOf === "function") ? (codexOf(w).seq || 0) : (w.dm.pendingAckSeq || 0);
  w.dm.pendingTurnMeta=dmTurnMeta(built,"seat");
  saveU(U);
  GS.dm.lastTurnMeta=w.dm.pendingTurnMeta;
  GS.dm.pending = true; GS.dm.turnId = turnId; GS.dm.turnStart = built.startedAt; GS.dm.rollReq = null; GS.dm.ask = null;
  seatState().streamText = "";      // the in-progress narration buffer this turn's stream fills
  renderWorld();

  // HOTFIX-QUEUE-2026-07-06 H7: capture the pre-assemble bootstrapped flag (7c bootstrap-restore) and
  // hold ONE assembled object for both the first POST and any retry (7b double-payload / 7c retry).
  const wasBootstrapped = seatState().bootstrapped;
  let assembled = null;
  let assistantPushed = false;   // HQ2-5: marks whether THIS turn pushed the assistant reply, so a
                                  // throw in seatApplyResponse (after the push) can unwind it too.
  return seatBoot().then(() => {
    if(!seatReady()) throw new Error("seat prompt unavailable");
    // 7b: assemble FIRST from the window WITHOUT this turn (seatAssembleMessages appends the payload
    // itself), THEN push it — the window now carries it for FUTURE turns, never doubling this one.
    assembled = seatAssembleMessages(w, turnPayload);
    seatWindowPush("user", JSON.stringify(turnPayload));
    return seatPostAndStream(assembled, seatLane, turnId);
  }).then(raw => {
    // 7c: reuse the SAME assembled object for the retry — re-assembling here would drop the (already
    // consumed) bootstrap and re-append the payload a third time.
    return seatResolveResponse(raw, turnId, assembled, seatLane);
  }).then(response => {
    seatWindowPush("assistant", response.narration || "");
    assistantPushed = true;   // HQ2-5: mark so a throw in seatApplyResponse can unwind it
    seatApplyResponse(response);
    return turnId;
  }).catch(e => {
    // 7c: unwind the state this failed turn consumed — pop the pre-pushed user turn so it never
    // pollutes the next attempt's window, and (only if THIS turn sent the bootstrap) restore
    // bootstrapped=false so the retry/next-turn re-sends it. A failed later turn leaves it true.
    const s = seatState();
    // HQ2-5: if seatApplyResponse threw AFTER the assistant reply was pushed (applyResponse's
    // try/finally lets an applyEvent throw propagate here), pop that assistant entry too —
    // flag-guarded so we only ever remove THIS turn's assistant entry, never a prior turn's.
    if(assistantPushed && s.window.length && s.window[s.window.length-1].role === "assistant") s.window.pop();
    const lastU = s.window[s.window.length-1];
    if(lastU && lastU.role === "user" && lastU.content === JSON.stringify(turnPayload)) s.window.pop();
    if(!wasBootstrapped) s.bootstrapped = false;
    seatBridgeDown(e);
    throw e;
  });
}

/* POST the assembled messages to the bridge's /seat proxy and stream the narration into the feed live
   (§1 "Streaming: narration streams into the feed as it generates"). Returns the full raw stream text
   for the caller to extract/parse the trailing TurnResponse JSON from. `retryNote`, when present, is
   appended as one more user message asking for a clean JSON-only reply (§3 step 1's ONE corrective
   retry) — a fresh POST, not a stream resume. */
function seatPostAndStream(assembled, lane, turnId, retryNote){
  const body = Object.assign({}, assembled, { lane, turnId });
  if(retryNote) body.messages = assembled.messages.concat([{ role: "user", content: retryNote }]);
  return fetch(SEAT_ROUTE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then(r => { if(GS.dm&&GS.dm.lastTurnMeta&&GS.dm.lastTurnMeta.requestAckMs==null)
        GS.dm.lastTurnMeta.requestAckMs=Date.now()-(GS.dm.lastTurnMeta.startedAt||Date.now());
      if(!r.ok) throw new Error("seat " + r.status); return r; })
    .then(r => seatReadSSE(r, delta => seatStreamAppend(delta)));
}

/* Append one streamed delta to the feed's live narration line (mirrors dm.js's applyResponse setting
   GS.dm.animate for the word-by-word render, but here the text arrives incrementally FOR REAL rather
   than being animated after the fact — render.js's streamDMText already knows how to paint a partial
   DM line; seat.js just keeps GS.seat.streamText current and re-renders). Cheap: renderWorld() is the
   same call every other transient UI update already makes. */
function seatStreamAppend(delta){
  if(delta && GS.dm&&GS.dm.lastTurnMeta&&GS.dm.lastTurnMeta.firstTokenMs==null)
    GS.dm.lastTurnMeta.firstTokenMs=Date.now()-(GS.dm.lastTurnMeta.startedAt||Date.now());
  const s = seatState();
  s.streamText = (s.streamText || "") + delta;
  // A provider's first token is often JSON punctuation. Count "meaningful feedback" only once at
  // least one non-whitespace narration character is actually present in the accumulated contract.
  const visible=String(s.streamText||"").trim();
  const narrationVisible=/"narration"\s*:\s*"\s*(?:\\.|[^"\\\s])/.test(s.streamText);
  const directProseVisible=!!visible && !/^[{[]/.test(visible); // normalized prose-delta adapters
  if(GS.dm&&GS.dm.lastTurnMeta&&GS.dm.lastTurnMeta.meaningfulFeedbackMs==null &&
     (narrationVisible||directProseVisible))
    GS.dm.lastTurnMeta.meaningfulFeedbackMs=Date.now()-(GS.dm.lastTurnMeta.startedAt||Date.now());
  s.streaming = true;
  renderWorld();
}

/* Parse+validate the raw stream text into a TurnResponse (§3), retrying once with a corrective
   instruction on a parse failure, and falling back to the stutter envelope on a second failure. This
   is the ONE place the seat's JSON is trusted — everything downstream (seatApplyResponse) receives an
   already-schema-gated object. */
function seatResolveResponse(raw, turnId, assembled, lane){
  const parsed = seatExtractJson(raw);
  const gate = seatValidate(parsed);
  if(gate.ok) return Promise.resolve(Object.assign({ turnId }, gate.response));
  // ONE corrective retry (§3 step 1) — a fresh call, same messages + the instruction appended.
  console.warn("[seat] TurnResponse parse/schema failed — retrying once with a corrective instruction");
  return seatPostAndStream(assembled, lane, turnId, SEAT_RETRY_INSTRUCTION).then(raw2 => {
    const parsed2 = seatExtractJson(raw2);
    const gate2 = seatValidate(parsed2);
    if(gate2.ok) return Object.assign({ turnId }, gate2.response);
    console.error("[seat] TurnResponse still unparseable after retry — the in-voice stutter envelope, session continues");
    return seatStutterEnvelope(turnId);
  });
}

/* Apply the validated TurnResponse through the SAME real pipeline the mailbox uses (dm.js's
   applyResponse) — the seat is a transport swap, not a second event-application implementation (the
   anti-drift rule: ONE implementation of the mutators/apply path). This also clears GS.seat.streamText/
   streaming and hands off to applyResponse's existing try/finally render+wakeReveal guarantee. */
function seatApplyResponse(r){
  const s = seatState(); s.streamText = null; s.streaming = false;
  applyResponse(r);
}

function seatBridgeDown(e){
  const turnId=GS.dm&&GS.dm.turnId;
  const s = seatState(); s.streamText = null; s.streaming = false;
  if(typeof dmPausePending==="function")dmPausePending(turnId,"seat-unreachable",
    "(The provider seat became unreachable. This exact TurnRequest is paused; it can be resumed through the bridge or explicitly abandoned.)");
  else GS.dm.pending=false;
  toast("DM seat unreachable — check dev/dm-bridge.py's /seat route, or switch back to the mailbox.");
}
