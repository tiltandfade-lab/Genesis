/* ============================================================================
   BRIDGELESS PLAYTEST HARNESS — the AUTOMATED-PLAYTEST Layer-1 loop, headless.
   ----------------------------------------------------------------------------
   docs/AUTOMATED-PLAYTEST.md specs the loop as AI-player × real-DM-stack × Chrome
   × the bridge. This harness runs the SAME loop with the transport removed: it
   loads the REAL genesis.html modules in jsdom (the exact technique
   verify-dm-events.mjs / verify-combat-lifecycle.mjs / the chase driver use to
   prove production code) and calls the REAL seam directly — dmDigest(),
   applyResponse(), applyEvent(), dmRollFor()/resolveBranch(), cgBind(), bindWorld().

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
     digest   --dir D --action '...'     log the player line, build the DM's digest
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
    Object.assign(win.GS.dm, state.gs.dm || {});
    win.GS.combat = state.gs.combat || null;
    win.GS.chase = state.gs.chase || null;
  }
  return win;
}

function save(dir, win) {
  const state = {
    U: win.U,
    gs: { dm: win.GS.dm, combat: win.GS.combat || null, chase: win.GS.chase || null },
  };
  // drop functions/undefined; the world graph is plain data (normally idb-serialized)
  writeFileSync(join(dir, "state.json"), JSON.stringify(state, (k, v) => (typeof v === "function" ? undefined : v)));
}
function load(dir) {
  return JSON.parse(readFileSync(join(dir, "state.json"), "utf-8"));
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
function cmdDigest(dir, action, rolls) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  const tri = typeof win.dmTriage === "function" ? win.dmTriage(w, action) : null;
  const lastRes = (w.dm && w.dm.lastResolution) || null;
  const turnId = "t-" + win.uid();
  // match sendTurn's order: build the digest BEFORE the player line is logged, so the founding
  // turn (dmlog still empty) ships the setting/myth/life exactly once (src/world/dm.js sendTurn).
  const digest = win.dmDigest();
  win.pushDmLog(w, "player", action, { rolls: rolls || [], turnId });
  w.dm = w.dm || {};
  // HQ3-D3 (SET-05-NOTE-A footgun): capture BOTH before the null below — a mid-roll digest must not
  // silently drop a persisted crit fall-through, and any unrolled rollReq it clears here should be
  // echoed back so the runner can restore it. w.dm.pendingRoll itself is left untouched — this is a
  // peek, not a clear point (the clear point is applyResponse's w.dm rebuild).
  const carriedRoll = (w.dm && w.dm.pendingRoll) || null;
  const outgoingRollReq = (w.dm && w.dm.rollReq) || null;
  w.dm.rollReq = null; w.dm.ask = null; w.dm.pendingTurnId = turnId; w.dm.lastResolution = null;
  w.dm.pendingAckSeq = typeof win.codexOf === "function" ? (win.codexOf(w).seq || 0) : (w.dm.pendingAckSeq || 0);
  win.GS.dm.lastTurnMeta = { turnId, lane: tri ? tri.lane : null, laneModel: tri ? tri.model : null,
    digestBytes: win.jsonBytes(digest), turnBytes: win.jsonBytes({ turnId, action, rolls, digest }) };
  win.GS.dm.pending = true; win.GS.dm.turnId = turnId; win.GS.dm.turnStart = Date.now();
  save(dir, win);
  out({ turnId, lane: tri ? tri.lane : null, laneReasons: tri ? tri.reasons : null,
    lastResolution: lastRes, pendingRoll: carriedRoll, clearedRollReq: outgoingRollReq,
    digestBytes: win.jsonBytes(digest), digest });
}

// ============================================================================
// apply — apply the DM's TurnResponse through the real applyResponse runtime
// ============================================================================
function cmdApply(dir, resp) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  resp.turnId = resp.turnId || w.dm.pendingTurnId || win.GS.dm.turnId;
  if (win.GS.dm.turnStart == null) win.GS.dm.turnStart = Date.now();
  const contract = win.validateTurnResponse(resp);
  win.applyResponse(resp);   // validates, applyEvent's each event, logs the dm line, sets rollReq, mints gen
  const rq = win.GS.dm.rollReq || (w.dm && w.dm.rollReq) || null;
  const telem = (win.GS.dm.telemetry || []).slice(-1)[0] || null;
  save(dir, win);
  const c = w.characters.filter(x => x.status === "living").slice(-1)[0];
  // STATE-HYGIENE-EVAL §3-D2: applyResponse rides applied=[{type,res}] on the dm log line
  // (src/world/dm.js:489) — surface it so the scorer reads the ENGINE's verdicts, never re-derives.
  const lastDm = (w.dmlog || []).filter(l => l.role === "dm").slice(-1)[0] || {};
  out({
    ok: contract.ok, contractErrors: contract.errors,
    appliedEvents: (resp.events || []).map(e => e.type),
    appliedResults: lastDm.applied || [],
    rollRequest: rq,
    pc: c ? { name: c.name, hp: (c.sheet.hpCur != null ? c.sheet.hpCur : c.sheet.hp) + "/" + c.sheet.hp,
      conditions: c.sheet.conditions || [], xp: c.sheet.xp, level: c.sheet.level, status: c.status } : null,
    location: win.nodeName(w, w.currentNodeId), clock: w.clock,
    ledgerTail: win.ledgerOf(w).slice(-4).map(e => e.text),
    telemetry: telem,
  });
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
  out({
    ok: true,
    resolvedLocally: !pending,
    liveResolutionNeeded: !!pending,      // orchestrator: feed pending.action to the DM as a follow-up turn
    pending: pending,                     // { action:"(I roll Athletics: 17)", rolls:[...] }
    recovered: false,                     // symmetry with the no-rollReq/carried-pendingRoll recovery path above
    resolution: w.dm && w.dm.lastResolution ? w.dm.lastResolution : null,
    branchNarration: resolvedLine ? resolvedLine.text : null,
    newLedger: win.ledgerOf(w).slice(before).map(e => e.text),
    pc: c ? { name: c.name, hp: (c.sheet.hpCur != null ? c.sheet.hpCur : c.sheet.hp) + "/" + c.sheet.hp,
      conditions: c.sheet.conditions || [], status: c.status } : null,
  });
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
      conditions: c.sheet.conditions || [], xp: c.sheet.xp, gold: c.sheet.gold,
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
// ============================================================================
function cmdAdvance(dir, minutes, toNodeName) {
  const win = boot(load(dir));
  const w = win.activeWorld();
  const before = { day: w.clock.day, min: w.clock.min, node: win.nodeName(w, w.currentNodeId) };
  if (minutes) win.advanceClock(w, minutes);
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
  else if (cmd === "digest") cmdDigest(args.dir, args.action || "(the player waits)", readJSON(args.rolls));
  else if (cmd === "apply") cmdApply(args.dir, readJSON(args.response));
  else if (cmd === "roll") cmdRoll(args.dir);
  else if (cmd === "playerview") cmdPlayerView(args.dir);
  else if (cmd === "dmstate") cmdDmState(args.dir);
  else if (cmd === "patch") cmdPatch(args.dir, readJSON(args.events));
  else if (cmd === "advance") cmdAdvance(args.dir, args.minutes ? parseInt(args.minutes, 10) : 0, args.toNode || null);
  else { process.stderr.write("unknown command: " + cmd + "\n"); process.exit(2); }
  // NOTE: no process.exit(0) here — each cmd* ends in out(), which exits after flushing stdout.
} catch (e) {
  process.stderr.write("[harness error] " + (e && e.stack ? e.stack : e) + "\n");
  process.exit(1);
}
