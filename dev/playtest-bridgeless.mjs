/* ============================================================================
   BRIDGELESS PLAYTEST HARNESS — the AUTOMATED-PLAYTEST Layer-1 loop, headless.
   ----------------------------------------------------------------------------
   docs/AUTOMATED-PLAYTEST.md specs the loop as AI-player × real-DM-stack × Chrome
   × the bridge. This harness runs the SAME loop with the transport removed: it
   loads the REAL genesis.html modules in jsdom (the exact technique
   verify-dm-events.mjs / verify-combat-lifecycle.mjs / the chase driver use to
   prove production code) and calls the REAL seam directly — dmResolveTurnRoute(),
   dmPrepareTurn(), applyResponse(), applyEvent(), dmRollFor()/resolveBranch(), cgBind(), bindWorld().

   No bridge, no Chrome, no model call inside this file. The two SEATS (DM, Player)
   are Sonnet subagents driven by the orchestrator; this harness is the ENGINE +
   the SCRIBE only — it adjudicates and it logs, it never authors narration or a
   player decision, and it never fabricates a die (dmRollFor pulls a real RNG d20).

   State persists to <dir>/state.json between invocations (each subcommand is a
   fresh process — jsdom can't survive across orchestrator turns). We own
   persistence ourselves (saveU/postState/fetch are stubbed) so nothing needs a
   browser IndexedDB or the mailbox.

   SUBCOMMANDS
     init     --dir D --brief '{...}'   roll a world + build an L1 PC; print opening
     import   --dir D --state @state.json
                                        import a browser U snapshot, migrate a copy, preserve source
     digest   --dir D --action '...' [--opts '{...}']
                                        prepare the production route/receipt/beat turn
     apply    --dir D --response '{...}'  apply the DM's TurnResponse (events+narration)
     roll     --dir D                    player rolls the pending check (real RNG) + resolve
     playerview --dir D                  what the player has seen (narration + sheet)
     dmstate  --dir D                    what the DM sees behind the screen (ledger/codex/fronts)

   JSON args may be passed inline or as @<path> (read the file) or '-' (stdin).
   ============================================================================ */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readFileSync as rf } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

// ---- module source: tables + every manifest module in load order ------------
const man = JSON.parse(read("manifest.json"));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
// var U / var GS live in the classic-scripts global scope; `var` at top level of an
// indirect eval binds onto the global object (window), so we can read/write win.U / win.GS.
const harness = `var U={worlds:{},activeWorldId:null,revealed:{},souls:[]}; var SEED=null;`;

const DOM_HTML = `<!doctype html><html><body>
  <div id="worldView"></div><div id="toast"></div><div id="stages"></div>
  <div id="bindbar"></div><input id="worldName"><input id="cgName"><input id="charName">
  <div class="modal-bg" id="bardoModal"><div class="modal"><div id="bardoBody"></div></div></div>
</body></html>`;

// functions that touch the DOM heavily, the network, or the render tree — stubbed to
// no-ops so the harness is robust headless. We are NOT testing render/persistence here
// (gauntlet G6/G8 own those); we exercise the seam + the mutators.
const STUBS = ["renderWorld","wakeReveal","postState","saveU","toast","showTab","dieRoll",
  "animateDie","streamDMText","diceOverlay","renderCharge","renderBardo","renderShelf",
  "dmBridgeDown","renderCodexPanel","renderMap","paintCard","renderShelfSouls"];

function boot(state) {
  const dom = new JSDOM(DOM_HTML, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  // top-level `const`/`let` share the classic-scripts lexical scope but are NOT window
  // properties under indirect eval (function declarations ARE). Surface the consts the
  // harness reads directly — appended to the SAME eval so it sees those bindings.
  const EXPOSE = ["STAGES","SPECIES","CLASSES","BACKGROUNDS","CLASS_SKILLS","CLASS_KIT","CLASS_CASTING","ABIL","SPELLS_SLIM"];
  const expose = ";" + EXPOSE.map(n => `try{window.${n}=${n};}catch(e){}`).join("");
  win.eval(harness + "\n" + srcText + "\n" + expose);
  win.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  win.fetch = () => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
  // STATE-HYGIENE-EVAL §2: deterministic replays. --seed <int> swaps the window's RNG for
  // mulberry32(seed) so a fixture scores byte-identically run-over-run. Absent = live RNG,
  // exactly as before (playtest sessions keep real dice).
  if (args && args.seed != null) {
    let s = (parseInt(args.seed, 10) >>> 0) || 1;
    win.Math.random = () => { s |= 0; s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  for (const n of STUBS) { try { win.eval(`typeof ${n}==="function" && (${n}=function(){});`); } catch (_) {} }
  // sendTurn is the bare/crit-fall-through path out of dmRollFor — capture instead of POST.
  win.eval(`sendTurn=function(action,rolls){ globalThis.__pendingRoll={action:action,rolls:rolls||[]}; return Promise.resolve("t-stub"); };`);
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false, telemetry: [] };
  win.GS.combat = null; win.GS.chase = null; win.GS.gamePanel = null; win.GS.prevPanel = undefined;
  win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  if (state) {
    win.U = state.U;
    win.U.activeWorldId = state.U.activeWorldId;
    // Match genesis.html boot: additive/idempotent save migrations run before any resumed turn.
    // This is load-bearing for corpus continuations that intentionally import older state shapes.
    Object.values(win.U.worlds || {}).forEach(w => { if (typeof win.migrateWorld === "function") win.migrateWorld(w); });
    Object.assign(win.GS.dm, state.gs.dm || {});
    // JSON parsing produces independent w.combat and GS.combat copies. Select the latest saved
    // runtime copy, then bind it back onto the world so every event and the next process see one
    // combat object. Before this, round_tick could advance GS while leaving persisted w.combat stale.
    const savedRuntimeCombat = state.gs.combat || null;
    win.GS.combat = null;
    win.GS.chase = state.gs.chase || null;
    // Browser renderWorld performs this after a reload/world switch. The headless harness stubs the
    // renderer, so invoke the same rebind explicitly before preparing the next turn.
    const active = win.activeWorld();
    if (active && savedRuntimeCombat && savedRuntimeCombat.active) active.combat = savedRuntimeCombat;
    if (active && active.combat && typeof win.combatRehydrate === "function") win.combatRehydrate(active);
  }
  return win;
}

function stateSnapshot(win) {
  return {
    U: win.U,
    gs: { dm: win.GS.dm, combat: win.GS.combat || null, chase: win.GS.chase || null },
  };
}
function save(dir, win) {
  const state = stateSnapshot(win);
  // drop functions/undefined; the world graph is plain data (normally idb-serialized)
  writeFileSync(join(dir, "state.json"), JSON.stringify(state, (k, v) => (typeof v === "function" ? undefined : v)));
}
function load(dir) {
  return JSON.parse(readFileSync(join(dir, "state.json"), "utf-8"));
}
function savePacket(dir, kind, turnId, value) {
  if (!dir || !turnId || value == null) return;
  const packetDir = join(dir, "packets");
  mkdirSync(packetDir, { recursive: true });
  const safeId = String(turnId).replace(/[^a-zA-Z0-9._-]+/g, "-");
  writeFileSync(join(packetDir, kind + "-" + safeId + ".json"), JSON.stringify(value, null, 2) + "\n");
}

// ---- arg parsing ------------------------------------------------------------
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) { a[argv[i].slice(2)] = argv[i + 1]; i++; }
  }
  return a;
}
function readJSON(v) {
  if (v == null) return null;
  if (v === "-") return JSON.parse(readFileSync(0, "utf-8"));
  if (v.startsWith("@")) return JSON.parse(rf(v.slice(1), "utf-8"));
  return JSON.parse(v);
}
// write, then exit ONLY after stdout has flushed to the pipe — jsdom leaves timers alive so the
// process won't exit on its own, but a bare process.exit(0) races the write and truncates larger
// payloads (playerview/dmstate). The write callback fires post-flush, so exit here is safe.
function out(obj) { process.stdout.write(JSON.stringify(obj, null, 2) + "\n", () => process.exit(0)); }

// ============================================================================
// import — copy a browser U snapshot into harness persistence and run real save migrations.
// ============================================================================
function cmdImport(dir, raw) {
  mkdirSync(dir, { recursive: true });
  const U0=raw&&raw.U?raw.U:raw;
  if(!U0||!U0.worlds)throw new Error("import requires a browser U/state snapshot with worlds");
  const win=boot({U:JSON.parse(JSON.stringify(U0)),gs:{dm:{},combat:null,chase:null}});
  save(dir,win);
  const w=win.activeWorld(), custody=w&&w.itemCustody;
  const bound=w&&typeof win.codexOf==="function"
    ? Object.values(win.codexOf(w).records||{}).filter(r=>r&&r.source&&r.source.type==="bound-item").map(r=>r.id) : [];
  out({ok:true,dir,world:w&&w.name||null,itemCustodyVersion:custody&&custody.version||null,
    custodyIntents:custody?Object.values(custody.items||{}).map(r=>r.intent||null):[],boundItemIds:bound});
}

// ============================================================================
// init — roll a world, build a level-1 PC from the player's picks
// ============================================================================
function cmdInit(dir, brief) {
  mkdirSync(dir, { recursive: true });
  const win = boot(null);
  const { GS } = win;

  // 1) roll the world skeleton (STAGES) — the same rolls startGenesis fires, minus DOM/timers.
  GS.SEED = {};
  for (const s of win.STAGES) {
    if (s.triad) {
      const draw = (avoid) => { let r, t = 0; do { r = win.lookup(s.t); t++; } while (avoid.some(x => x && x.name === r.name) && t < 8); return r; };
      const aa = draw([]); const bb = draw([aa]); GS.SEED[s.key] = [aa, bb];
      GS.SEED.nearby = [aa, bb];
    } else {
      GS.SEED[s.key] = win.lookup(s.t);
    }
  }
  // bindWorld reads #worldName; set the player's chosen world name (falls back to the rolled setting)
  win.document.getElementById("worldName").value = (brief.worldName || "").trim();
  win.bindWorld();
  const w = win.activeWorld();

  // 2) build the PC from the player's high-level picks; harness rolls the dice + auto-fills sub-picks.
  const validSpecies = Object.keys(win.SPECIES);
  const validClass = Object.keys(win.CLASSES);
  const validBg = Object.keys(win.BACKGROUNDS);
  const pick = (want, list, fb) => (list.indexOf(want) >= 0 ? want : fb);
  const species = pick(brief.species, validSpecies, "Human");
  const cls = pick(brief.class, validClass, "Fighter");
  const bg = pick(brief.background, validBg, "Soldier");

  GS.CGEN = {
    species, class: cls, background: bg,
    pronouns: brief.pronouns || "they",
    name: (brief.charName || "").trim() || win.randomCharName(species),
    skills: [], languages: [], cantrips: [], spells: [], featPick: { skills: [], cantrips: [], spells: [] },
    toolPicks: {}, lifeGold: 0, life: null,
  };
  // scores: real 4d6-drop-lowest ×6, assigned by class priority, background bumps applied.
  win.cgRollScores();   // → rolledScores + cgAssign() + cgFinalScores()
  // class skills: take the class's allowed count off the front of its list (a legal auto-pick).
  const cs = win.CLASS_SKILLS[cls];
  if (cs) GS.CGEN.skills = cs.from.slice(0, cs.n);
  // kit: first listed kit for the class.
  const kits = win.CLASS_KIT[cls];
  if (kits && kits.length) GS.CGEN.kit = kits[0].id;
  // caster? auto-pick cantrips + level-1 spells off the real lists.
  if (win.CLASS_CASTING && win.CLASS_CASTING[cls]) win.cgSpellsAuto();

  win.cgBind();   // builds the sheet, equips gear, seeds "This Is Your Life", pushes into w.characters
  win.beginSession();   // session 0 → 1; Day 1

  save(dir, win);
  const c = w.characters[w.characters.length - 1];
  out({
    ok: true, dir,
    world: { id: w.id, name: w.name, setting: w.seed.master, location: win.nodeName(w, w.currentNodeId),
      clock: w.clock, session: w.session },
    pc: { name: c.name, pronouns: c.pronouns, headline: c.headline,
      species: c.sheet.species, class: c.sheet.class, background: c.sheet.background, feat: c.sheet.feat,
      level: c.sheet.level, hp: c.sheet.hp, ac: c.sheet.ac, scores: c.sheet.scores, mods: c.sheet.mods,
      saveProfs: c.sheet.saveProfs, skillProfs: c.sheet.skillProfs, gold: c.sheet.gold,
      inventory: (c.sheet.inventory || []).map(i => i.name + (i.qty > 1 ? " ×" + i.qty : "")),
      cantrips: c.sheet.cantrips, spells: c.sheet.spells },
    lifeSeeds: (c.seeds || []).length,
    note: brief.worldConcept ? "player concept: " + brief.worldConcept : null,
  });
}

// ============================================================================
// digest — log the player's action, build the digest the DM will read
// ============================================================================
function cmdDigest(dir, action, rolls, opts) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  // Browser renderWorld applies an inactive-world response when its owner becomes active again. The
  // harness stubs rendering, so perform that activation step explicitly before preparing a new turn.
  if (w && w.dm && w.dm.queuedResponse && !win.GS.dm.pending) win.applyResponse(w.dm.queuedResponse);
  const carriedRoll = (w.dm && w.dm.pendingRoll) || null;
  const outgoingRollReq = (w.dm && w.dm.rollReq) || null;
  const resolved = win.dmResolveTurnRoute(w, action, opts || {}, Date.now());
  const prepared = win.dmPrepareTurn(w, action, rolls || [], opts || {}, resolved);
  const turn = prepared.turn;

  // Match sendTurn's local-fact branch exactly: no digest, no provider envelope, and the
  // authoritative local line lands immediately. dmApplyLocalTurn is synchronous before its
  // resolved Promise is returned, so the state can be snapshotted here without a transport.
  if (prepared.route.mode === "local-fact") {
    win.dmApplyLocalTurn(w, prepared, opts || {});
    const localLine = (w.dmlog || []).filter(l => l.role === "dm").slice(-1)[0] || null;
    savePacket(dir, "turn", turn.turnId, turn);
    savePacket(dir, "response", turn.turnId, { turnId: turn.turnId, local: true,
      narration: localLine ? localLine.text : null, route: prepared.route });
    save(dir, win);
    out({ turnId: turn.turnId, local: true, localNarration: localLine ? localLine.text : null,
      lane: null, laneReasons: [], route: prepared.route, receipt: null,
      lastResolution: turn.lastResolution || null, pendingRoll: carriedRoll,
      clearedRollReq: outgoingRollReq, digestBytes: 0, digest: null, turn });
    return;
  }

  // Transport-free twin of sendTurn's persistent in-flight staging. The route, receipt, digest,
  // lane, and TurnRequest itself all came from the shared production preparation seam above; this
  // block only records the pending mailbox lifecycle that applyResponse consumes later.
  if (!(opts && opts.hidden)) win.pushDmLog(w, "player", action, { rolls: rolls || [], turnId: turn.turnId });
  w.dm = w.dm || {};
  // HQ3-D3 (SET-05-NOTE-A footgun): capture BOTH before the null below — a mid-roll digest must not
  // silently drop a persisted crit fall-through, and any unrolled rollReq it clears here should be
  // echoed back so the runner can restore it. w.dm.pendingRoll itself is left untouched — this is a
  // peek, not a clear point (the clear point is applyResponse's w.dm rebuild).
  w.dm.rollReq = null; w.dm.ask = null; w.dm.pendingTurnId = turn.turnId; w.dm.lastResolution = null;
  w.dm.pendingTurnRequest = JSON.parse(JSON.stringify(turn)); w.dm.pendingTurnPause = null;
  w.dm.pendingReceipt = prepared.receipt || null;
  w.dm.pendingAckSeq = typeof win.codexOf === "function" ? (win.codexOf(w).seq || 0) : (w.dm.pendingAckSeq || 0);
  w.dm.pendingTurnMeta = win.dmTurnMeta(prepared, "mailbox");
  win.GS.dm.lastTurnMeta = w.dm.pendingTurnMeta;
  win.GS.dm.pending = true; win.GS.dm.turnId = turn.turnId; win.GS.dm.turnStart = prepared.startedAt;
  savePacket(dir, "turn", turn.turnId, turn);
  save(dir, win);
  out({ turnId: turn.turnId, local: false, lane: turn.lane, laneReasons: turn.laneReasons,
    route: prepared.route, receipt: prepared.receipt || null,
    lastResolution: turn.lastResolution || null, pendingRoll: carriedRoll, clearedRollReq: outgoingRollReq,
    digestBytes: win.jsonBytes(turn.digest), digest: turn.digest, turn });
}

// ============================================================================
// apply — apply the DM's TurnResponse through the real applyResponse runtime
// ============================================================================
function cmdApply(dir, resp, turnIdOverride) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  // --turnId is useful when replaying a preserved adjudication against a freshly digested turn: the
  // response body stays immutable evidence while the identity gate still receives the NEW staged id.
  resp.turnId = turnIdOverride || resp.turnId || w.dm.pendingTurnId || win.GS.dm.turnId;
  // Freeze the exact staged state before any response mutates it. A bad adjudication can now be
  // inspected and rolled back without reconstructing clocks, combatants, or pending-turn metadata.
  savePacket(dir, "state-before", resp.turnId, stateSnapshot(win));
  savePacket(dir, "response", resp.turnId, resp);
  if (win.GS.dm.turnStart == null) win.GS.dm.turnStart = Date.now();
  const contract = win.validateTurnResponse(resp);
  const dmLinesBefore=(w.dmlog||[]).filter(l=>l.role==="dm").length;
  const responseResult=win.applyResponse(resp); // identity-gates, then applies/logs or queues
  const rq = win.GS.dm.rollReq || (w.dm && w.dm.rollReq) || null;
  const telem = (win.GS.dm.telemetry || []).slice(-1)[0] || null;
  save(dir, win);
  const c = w.characters.filter(x => x.status === "living").slice(-1)[0];
  // STATE-HYGIENE-EVAL §3-D2: applyResponse rides applied=[{type,res}] on the dm log line
  // (src/world/dm.js:489) — surface it so the scorer reads the ENGINE's verdicts, never re-derives.
  const dmLines=(w.dmlog||[]).filter(l=>l.role==="dm");
  const lastDm = dmLines.length>dmLinesBefore ? dmLines.slice(-1)[0] : {};
  out({
    ok: contract.ok && !(responseResult&&responseResult.ok===false), contractErrors: contract.errors,
    responseResult,
    appliedEvents: (resp.events || []).map(e => e.type),
    appliedResults: lastDm.applied || [],
    rollRequest: rq,
    pc: c ? { name: c.name, hp: (c.sheet.hpCur != null ? c.sheet.hpCur : c.sheet.hp) + "/" + c.sheet.hp,
      conditions: c.conditions || c.sheet.conditions || [], xp: c.sheet.xp, level: c.sheet.level, status: c.status } : null,
    location: win.nodeName(w, w.currentNodeId), clock: w.clock,
    ledgerTail: win.ledgerOf(w).slice(-4).map(e => e.text),
    telemetry: telem,
  });
}

// ============================================================================
// recover-dodge-p0 — one-shot, assertion-guarded repair for the Brineglass soak finding.
//
// Turn t-msg6phgbpotj2 was resolved before ordinary foe_action attacks were wired to the PC's
// condition holder. Both spears therefore ignored Dodge; the second produced massive-damage death
// and immediately ran the bardo, multiplying one combat bug into clock/faction/corpse mutations.
// There was no pre-response snapshot yet (the finding is why cmdApply now writes one), so this
// command reverses ONLY the observed mutation set, refuses any state that does not match the frozen
// evidence, then recreates the prior turn's combat through the real combat_start event. The caller
// can digest the original player action again as a fresh turn after recovery.
// ============================================================================
function cmdRecoverDodgeP0(dir, turnId, priorResponse) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  const need = (cond, message) => { if (!cond) throw new Error("recover-dodge-p0 refused: " + message); };
  const id = turnId || "t-msg6phgbpotj2";
  const safeId = String(id).replace(/[^a-zA-Z0-9._-]+/g, "-");
  const turnPath = join(dir, "packets", "turn-" + safeId + ".json");
  const responsePath = join(dir, "packets", "response-" + safeId + ".json");
  const turn = JSON.parse(readFileSync(turnPath, "utf-8"));
  const taintedResponse = JSON.parse(readFileSync(responsePath, "utf-8"));
  const c = (w.characters || []).find(x => x.id === turn.digest.pc.id);

  need(turn.turnId === id && taintedResponse.turnId === id, "turn/response evidence does not match " + id);
  need(w.clock && w.clock.day === 10 && w.clock.min === 811, "expected tainted Day 10 13:31 clock");
  need(c && c.status === "fallen" && c.sheet && c.sheet.hpCur === 0, "expected Mira's tainted fallen/0 HP state");
  need(w.ledger && w.ledger.length === 122, "expected frozen 122-entry ledger");
  need(w.ledger[100] && w.ledger[100].data && w.ledger[100].data.kind === "combat-start", "missing clean combat-start checkpoint at ledger[100]");
  need(w.ledger[101] && w.ledger[101].data && w.ledger[101].data.kind === "action" && w.ledger[101].data.action === "dodge", "missing first tainted mutation at ledger[101]");
  need((w.dmlog || []).filter(l => l.turnId === id).length === 2, "expected exactly one player and one DM log line for tainted turn");
  need((win.GS.dm.telemetry || []).filter(t => t.turnId === id).length === 1, "expected exactly one telemetry row for tainted turn");
  need((w.dm.appliedTurnIds || []).filter(x => x === id).length === 1, "expected tainted turn in replay guard exactly once");
  const expectedClocks = { "The Crier's Circle": 2, "The Orchard-Wardens": 1, "The Alms-Bread Sisterhood": 0 };
  Object.entries(expectedClocks).forEach(([name, filled]) => {
    const f = (w.factions || []).find(x => x.name === name);
    need(f && f.clock && f.clock.filled === filled, "unexpected tainted faction clock for " + name);
  });
  need((w.pressures || []).every(p => !(p.clock && p.clock.filled > (p.kind === "internal" ? 1 : 0))), "unexpected pressure mutation outside frozen evidence");
  need((w.gazetteer || []).every(g => !g.fate), "unexpected gazetteer fate mutation outside frozen evidence");

  // Preserve the complete failure before touching the canonical save. The original turn packet stays
  // alongside these copies; the normal replay may overwrite response-<id> only if an operator chooses
  // to reuse that id, but response-tainted-<id> remains immutable evidence.
  savePacket(dir, "state-tainted", id, stateSnapshot(win));
  savePacket(dir, "response-tainted", id, taintedResponse);

  // Return to the completed state after turn 52 (ledger[100] is its valid combat-start line).
  w.ledger = w.ledger.slice(0, 101);
  w.dmlog = (w.dmlog || []).filter(l => l.turnId !== id);
  w.clock = { day: 1, min: 810 };
  win.GS.dm.telemetry = (win.GS.dm.telemetry || []).filter(t => t.turnId !== id);
  w.dm.appliedTurnIds = (w.dm.appliedTurnIds || []).filter(x => x !== id);

  const restoredClocks = { "The Crier's Circle": 1, "The Orchard-Wardens": 0, "The Alms-Bread Sisterhood": 1 };
  Object.entries(restoredClocks).forEach(([name, filled]) => {
    const f = w.factions.find(x => x.name === name); f.clock.filled = filled;
  });

  c.status = "living";
  c.sheet.hpCur = 6;
  delete c.sheet.tempHp;
  delete c.sheet.deathSaves;
  c.conditions = [];
  delete c.fellWhere;
  delete c.fellWhen;
  delete c.corpse;
  delete c.visions;
  delete c.fate;
  if (typeof win.refreshSaga === "function") win.refreshSaga(w, c);

  need(priorResponse && Array.isArray(priorResponse.events), "--priorResponse must be the clean turn-52 response");
  const start = priorResponse.events.find(e => e && e.type === "combat_start");
  need(start, "prior response has no combat_start event");
  win.GS.combat = null; w.combat = null;
  const rebuilt = win.applyEvent(w, start);
  need(rebuilt && rebuilt.ok && win.GS.combat && win.GS.combat.foes.length === 2, "combat reconstruction failed");
  need(w.ledger.length === 102 && w.ledger[101].data && w.ledger[101].data.kind === "combat-start", "combat reconstruction emitted unexpected ledger mutations");
  w.ledger = w.ledger.slice(0, 101); // retain the original, timestamped combat-start entry
  win.GS.combat.initiative = { first: "pc", pc: 14, enemy: 11 };
  win.GS.combat.first = "pc";
  win.GS.combat.side = "pc";
  w.combat = win.GS.combat;

  savePacket(dir, "recovery", id, {
    turnId: id,
    reason: "ordinary foe_action ignored the PC Dodge condition",
    restoredTo: "completed turn 52, immediately before the tainted player action",
    evidence: ["turn-" + safeId + ".json", "response-tainted-" + safeId + ".json", "state-tainted-" + safeId + ".json"],
    assertions: { ledgerCheckpoint: 101, clock: w.clock, pc: { id: c.id, status: c.status, hpCur: c.sheet.hpCur }, factionClocks: restoredClocks },
  });
  save(dir, win);
  out({ ok: true, recoveredTurnId: id, clock: w.clock, ledgerLength: w.ledger.length,
    dmlogLength: w.dmlog.length, pc: { name: c.name, status: c.status, hp: c.sheet.hpCur + "/" + c.sheet.hp },
    combat: { active: !!w.combat.active, first: w.combat.first, initiative: w.combat.initiative,
      foes: w.combat.foes.map(f => ({ fid: f.fid, name: f.name, hp: f.hp, band: f.band, lane: f.lane })), scene: w.combat.scene },
    next: "digest the preserved player action again; cmdApply will snapshot it automatically" });
}

// Restore an archived harness snapshot through the normal boot/migration/rebind path. Preserve the
// state being replaced first, so rollback is itself recoverable and the triggering bug stays auditable.
function cmdRestore(dir, raw, label) {
  if (!raw || !raw.U || !raw.U.worlds) throw new Error("restore requires a harness state snapshot");
  const current = boot(load(dir));
  const evidenceId = label || ("restore-" + Date.now());
  savePacket(dir, "state-superseded", evidenceId, stateSnapshot(current));
  const restored = boot(JSON.parse(JSON.stringify(raw)));
  save(dir, restored);
  const w = restored.activeWorld();
  const c = (w.characters || []).filter(x => x.status === "living").slice(-1)[0] || null;
  out({ ok: true, evidenceId, world: w.name, clock: w.clock,
    pendingTurnId: w.dm && w.dm.pendingTurnId || null,
    pc: c ? { name: c.name, hp: c.sheet.hpCur + "/" + c.sheet.hp, conditions: c.conditions || [] } : null,
    combat: w.combat ? { round: w.combat.round, side: w.combat.side, first: w.combat.first,
      sharedWithRuntime: w.combat === restored.GS.combat } : null });
}

// Rebuild a still-unanswered freeform TurnRequest after a digest-code repair, retaining its identity
// and sole player transcript line. No mechanics or narration have landed yet; the superseded packet
// is archived before the pending request is replaced.
function cmdRefreshPending(dir) {
  const win = boot(load(dir));
  const w = win.activeWorld(), old = w.dm && w.dm.pendingTurnRequest;
  if (!old || !w.dm.pendingTurnId) throw new Error("refresh-pending requires an unanswered staged turn");
  if (!old.route || old.route.mode !== "freeform-ruling") throw new Error("refresh-pending refuses non-freeform mechanics receipts");
  if ((w.dmlog || []).filter(l => l.role === "player" && l.turnId === old.turnId).length !== 1 ||
      (w.dmlog || []).some(l => l.role === "dm" && l.turnId === old.turnId))
    throw new Error("refresh-pending requires exactly one player line and no DM line for the turn");
  const resolved = win.dmResolveTurnRoute(w, old.action, {}, Date.now());
  const prepared = win.dmPrepareTurn(w, old.action, old.rolls || [], {}, resolved);
  if (prepared.route.mode === "local-fact" && !prepared.receipt) {
    prepared.turn.turnId = old.turnId;
    savePacket(dir, "turn-superseded-" + Date.now(), old.turnId, old);
    savePacket(dir, "turn", old.turnId, prepared.turn);
    // The player line was already staged exactly once. Clear the mailbox lifecycle, then run the
    // production local resolver hidden so it appends only the answer and zero-cost telemetry.
    w.dm.pendingTurnId=null; w.dm.pendingTurnRequest=null; w.dm.pendingTurnPause=null;
    w.dm.pendingReceipt=null; w.dm.pendingTurnMeta=null; w.dm.pendingAckSeq=null;
    win.GS.dm.pending=false; win.GS.dm.turnId=null; win.GS.dm.turnStart=null;
    win.dmApplyLocalTurn(w,prepared,{hidden:true});
    const localLine=(w.dmlog||[]).filter(l=>l.role==="dm"&&l.turnId===old.turnId).slice(-1)[0]||null;
    savePacket(dir,"response",old.turnId,{turnId:old.turnId,local:true,
      narration:localLine?localLine.text:null,route:prepared.route});
    save(dir,win);
    out({ok:true,turnId:old.turnId,local:true,localNarration:localLine?localLine.text:null,
      digestBytes:0,digest:null,route:prepared.route,lane:null,laneReasons:[]});
    return;
  }
  if (prepared.route.mode !== "freeform-ruling" || prepared.receipt)
    throw new Error("refresh-pending route changed authority; only a safe local-fact conversion is automatic");
  prepared.turn.turnId = old.turnId;
  savePacket(dir, "turn-superseded-" + Date.now(), old.turnId, old);
  w.dm.pendingTurnRequest = JSON.parse(JSON.stringify(prepared.turn));
  w.dm.pendingTurnPause = null;
  w.dm.pendingReceipt = null;
  w.dm.pendingAckSeq = typeof win.codexOf === "function" ? (win.codexOf(w).seq || 0) : (w.dm.pendingAckSeq || 0);
  w.dm.pendingTurnMeta = win.dmTurnMeta(prepared, "mailbox");
  win.GS.dm.lastTurnMeta = w.dm.pendingTurnMeta;
  win.GS.dm.pending = true; win.GS.dm.turnId = old.turnId; win.GS.dm.turnStart = prepared.startedAt;
  savePacket(dir, "turn", old.turnId, prepared.turn);
  save(dir, win);
  out({ ok:true, turnId:old.turnId, digestBytes:win.jsonBytes(prepared.turn.digest), digest:prepared.turn.digest,
    route:prepared.turn.route, lane:prepared.turn.lane, laneReasons:prepared.turn.laneReasons });
}

// ============================================================================
// roll — the player rolls the pending check openly (real RNG); resolve locally
// ============================================================================
function cmdRoll(dir) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  const rq = win.GS.dm.rollReq || (w.dm && w.dm.rollReq) || null;
  if (!rq) {
    // HQ3-D3: no live rollReq queued, but a prior fall-through may still be persisted (a process
    // boundary since the nat-20/nat-1 fell through) — surface it instead of silently reporting nothing.
    const carried = (w.dm && w.dm.pendingRoll) || null;
    if (carried) { out({ ok: true, resolvedLocally: false, liveResolutionNeeded: true, pending: carried, recovered: true }); return; }
    out({ ok: false, reason: "no pending rollRequest" }); return;
  }
  win.GS.dm.rollReq = rq;
  globalThis.__pendingRoll = null; win.__pendingRoll = null;
  const before = win.ledgerOf(w).length;
  const dmLogBefore = w.dmlog.length;
  if (rq.dice) {
    win.dmRollDice(rq.dice, rq.label || null);   // free dice (damage/heal) — rides next turn
  } else {
    win.dmRollFor(rq.skill || null, rq.ability || null, rq.adv || null);
  }
  const pending = win.__pendingRoll || globalThis.__pendingRoll || null;   // set = fell through to live (bare/nat20/nat1)
  const newDmLines = w.dmlog.slice(dmLogBefore);
  const resolvedLine = newDmLines.filter(l => l.role === "dm").slice(-1)[0] || null;
  const c = w.characters.filter(x => x.status === "living").slice(-1)[0];
  save(dir, win);
  const result={
    ok: true,
    resolvedLocally: !pending,
    liveResolutionNeeded: !!pending,      // orchestrator: feed pending.action to the DM as a follow-up turn
    pending: pending,                     // { action:"(I roll Athletics: 17)", rolls:[...] }
    recovered: false,                     // symmetry with the no-rollReq/carried-pendingRoll recovery path above
    resolution: w.dm && w.dm.lastResolution ? w.dm.lastResolution : null,
    branchNarration: resolvedLine ? resolvedLine.text : null,
    newLedger: win.ledgerOf(w).slice(before).map(e => e.text),
    pc: c ? { name: c.name, hp: (c.sheet.hpCur != null ? c.sheet.hpCur : c.sheet.hp) + "/" + c.sheet.hp,
      conditions: c.conditions || c.sheet.conditions || [], status: c.status } : null,
  };
  savePacket(dir, "roll", (result.resolution&&result.resolution.turnId)||"unresolved-"+Date.now(),
    {request:rq,result});
  out(result);
}

// ============================================================================
// playerview — the story as the player has experienced it (no DM-only data)
// ============================================================================
function cmdPlayerView(dir) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  const c = w.characters.filter(x => x.status === "living").slice(-1)[0];
  const transcript = (w.dmlog || []).map(l => ({
    role: l.role, text: l.text,
    rolls: (l.meta && l.meta.rolls) ? l.meta.rolls.map(r => r.label + " = " + r.total) : undefined,
  }));
  out({
    world: w.name, location: win.nodeName(w, w.currentNodeId),
    clock: w.clock, session: w.session,
    pc: c ? {
      name: c.name, headline: c.headline, pronouns: c.pronouns,
      species: c.sheet.species, class: c.sheet.class, background: c.sheet.background, level: c.sheet.level,
      hp: (c.sheet.hpCur != null ? c.sheet.hpCur : c.sheet.hp) + "/" + c.sheet.hp, ac: c.sheet.ac,
      conditions: c.conditions || c.sheet.conditions || [], xp: c.sheet.xp, gold: c.sheet.gold,
      inventory: (c.sheet.inventory || []).map(i => i.name + (i.qty > 1 ? " ×" + i.qty : "")),
      status: c.status,
    } : null,
    knownPlaces: (w.map && w.map.nodes) ? Object.values(w.map.nodes).filter(n => n.seen).map(n => n.name) : [],
    transcript,
  });
}

// ============================================================================
// dmstate — the world behind the screen (what the DM/engine holds)
// ============================================================================
function cmdDmState(dir) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  const codex = (typeof win.codexOf === "function") ? win.codexOf(w) : null;
  out({
    world: w.name, setting: w.seed.master, clock: w.clock, session: w.session,
    factions: (w.factions || []).map(f => ({ name: f.name, dominant: f.dominant, agenda: f.agenda,
      method: f.method, clock: f.clock.filled + "/" + f.clock.size })),
    fronts: (w.pressures || []).map(p => ({ kind: p.kind, danger: p.danger, doom: p.doom,
      truth: p.real ? p.real.text : null, clock: p.clock.filled + "/" + p.clock.size, closed: !!p.closed })),
    myth: w.seed.myth, taboo: w.seed.taboo,
    gazetteer: (w.gazetteer || []).map(g => ({ type: g.type, name: g.name, desc: g.desc })),
    codex: codex ? Object.values(codex.records || {}).map(r => ({ id: r.id, kind: r.kind, name: r.name,
      tier: r.tier, dmOnly: r.dmOnly || null, links: (r.links || []).map(l => l.to || l) })) : [],
    ledger: win.ledgerOf(w).map(e => ({ type: e.type, day: e.day, min: e.min, text: e.text })),
    dmlog: (w.dmlog || []).map(l => ({ role: l.role, text: l.text })),
  });
}

// ============================================================================
// patch — apply raw events directly (source:"declared"), NO transcript line.
// Route-around for the confirmed resolveBranch/validateEvent regression: branch events
// stamped source:"branch" no-op in production, so a resolved branch's mechanical effects
// are dropped. This lets the harness re-land those effects to keep the session coherent,
// while the finding is reported. (Not a fix to production — a scribe-side compensation.)
// ============================================================================
function cmdPatch(dir, events) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  const applied = (events || []).map(e => {
    const ev = Object.assign({}, e, { source: "declared" });
    return { type: ev.type, res: win.applyEvent(w, ev) };
  });
  save(dir, win);
  out({ ok: true, applied });
}

// ============================================================================
// advance — route-around for the two engine gaps this playtest surfaced:
//   (1) no DM event advances the WORLD CLOCK (walk_advance moves a walk cursor; the `rest`
//       event restores resources; clock advance lives only in the UI's passTime → player-only).
//   (2) `discovery makeNode` creates a node but never relocates the PC (no "travel to node" event).
// So the DM's narrated time-passage + travel can't land mechanically. This applies them the way
// the real engine would on a proper move: departure-stamp the node being left, advance the clock,
// move currentNodeId + seeNode, and run worldTurn("revisit") so drift resolves lazily on arrival.
// Usage: advance --dir D [--minutes N] [--toNode "<node name>"]
//        advance --dir D --toClock "D:HH:MM"   (HQ3-D4: absolute set, backward-allowed, harness-only)
//        advance --dir D --toBand dawn|noon|dusk|night   (HQ3-D4: canonical band minute, keeps day)
// toClock/toBand are an ABSOLUTE set via direct assignment — NOT advanceClock (which fires wake
// logic; a backward set must not). Mutually exclusive with --minutes: if either is given, --minutes
// is ignored (L14/L15, docs/HQ3-D-STATE-CODEX-HARNESS.md).
// ============================================================================
const BAND_MIN = { dawn: 360, noon: 720, dusk: 1080, night: 1320 }; // L15 (state.js:59 timeOfDay bands)
function cmdAdvance(dir, minutes, toNodeName, toClock, toBand) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  const before = { day: w.clock.day, min: w.clock.min, node: win.nodeName(w, w.currentNodeId) };
  let setAbsolute = false;
  if (toClock) {
    const m = /^(\d+):(\d{1,2}):(\d{2})$/.exec(String(toClock).trim());
    if (!m) { out({ ok: false, reason: "bad --toClock (want \"D:HH:MM\")", got: toClock }); return; }
    const day = +m[1], hh = +m[2], mm = +m[3];
    if (hh > 23 || mm > 59) { out({ ok: false, reason: "HH 0-23, MM 0-59", got: toClock }); return; }
    w.clock.day = day; w.clock.min = hh * 60 + mm; setAbsolute = true;
  } else if (toBand) {
    const b = String(toBand).trim().toLowerCase();
    if (BAND_MIN[b] == null) { out({ ok: false, reason: "bad --toBand (dawn|noon|dusk|night)", got: toBand }); return; }
    w.clock.min = BAND_MIN[b]; setAbsolute = true; // keeps current day (L15)
  }
  if (!setAbsolute && minutes) win.advanceClock(w, minutes); // existing relative path unchanged
  let moved = null;
  if (toNodeName) {
    const nodes = w.map.nodes;
    let id = Object.keys(nodes).find(k => nodes[k].name === toNodeName);
    if (!id) { id = win.addNode(w, toNodeName, "Place"); }
    if (w.currentNodeId && typeof win.turnStampVisit === "function") win.turnStampVisit(w, w.currentNodeId); // stamp departure
    w.currentNodeId = id; win.seeNode(w, id);
    if (typeof win.worldTurn === "function") { try { win.worldTurn(w, "revisit", { nodeId: id }); } catch (_) {} }
    moved = nodes[id].name;
  }
  save(dir, win);
  out({ ok: true, before, after: { day: w.clock.day, min: w.clock.min, band: win.timeOfDay(w.clock.min), node: win.nodeName(w, w.currentNodeId) }, moved });
}

// ---- dispatch ---------------------------------------------------------------
// jsdom timers + the stubbed fetch/render chain can settle a promise AFTER the command has
// printed and saved; Node's default rejects-throw would exit 1 on that harmless tail. The op is
// synchronous and state is saved inside each cmd*, so once we've printed we exit(0) cleanly.
process.on("unhandledRejection", () => {});
const [, , cmd, ...rest] = process.argv;
const args = parseArgs(rest);
try {
  if (cmd === "init") cmdInit(args.dir, readJSON(args.brief) || {});
  else if (cmd === "import") cmdImport(args.dir, readJSON(args.state));
  else if (cmd === "digest") cmdDigest(args.dir, args.action || "(the player waits)", readJSON(args.rolls), readJSON(args.opts));
  else if (cmd === "apply") cmdApply(args.dir, readJSON(args.response), args.turnId || null);
  else if (cmd === "roll") cmdRoll(args.dir);
  else if (cmd === "playerview") cmdPlayerView(args.dir);
  else if (cmd === "dmstate") cmdDmState(args.dir);
  else if (cmd === "patch") cmdPatch(args.dir, readJSON(args.events));
  else if (cmd === "recover-dodge-p0") cmdRecoverDodgeP0(args.dir, args.turnId || null, readJSON(args.priorResponse));
  else if (cmd === "restore") cmdRestore(args.dir, readJSON(args.state), args.label || null);
  else if (cmd === "refresh-pending") cmdRefreshPending(args.dir);
  else if (cmd === "advance") cmdAdvance(args.dir, args.minutes ? parseInt(args.minutes, 10) : 0, args.toNode || null, args.toClock || null, args.toBand || null);
  else { process.stderr.write("unknown command: " + cmd + "\n"); process.exit(2); }
  // NOTE: no process.exit(0) here — each cmd* ends in out(), which exits after flushing stdout.
} catch (e) {
  process.stderr.write("[harness error] " + (e && e.stack ? e.stack : e) + "\n");
  process.exit(1);
}
