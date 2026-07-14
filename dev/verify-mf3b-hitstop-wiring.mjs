/* Verify BEAUTY-WAVE-4B — MF-3b (wire hit-stop into the production ledger), 2026-07-11.
   Closes the WIRING LAW gap BW4 MF-3 left dormant: the hit-stop/recoil/crit-response MECHANISM
   (src/ui/theater-verbs.js + src/ui/standee-verbs.js) was built + tested but never reached in play,
   because the hp_changed ledger event carried no attacker id and never routed a crit to the crit-
   response verb. This unit threads attacker/crit through the CONTRACT (src/world/dm.js) and the
   RENDER DISPATCH (theaterFxFromLedger's case "hp" + theater-boot.js's play()) — MF-3's own mechanism
   is UNCHANGED (this file never edits theater-verbs.js's tween math, only the two small pure routing
   helpers this unit ADDS there — standeeVerbForHurt/recoilDirFromPositions — for testability, since
   theater-boot.js's own GL surface is browser-smoke-tested only, not jsdom/node-importable: a plain
   `import("./theater-boot.js")` in Node fails immediately with "window is not defined" (its top-level
   `window.Theater = {...}` assignments run at module-eval time) and "three" only resolves via the
   browser's own <script type="importmap"> in genesis.html — Node's ESM loader has no bare-specifier
   remap for it. See dev/verify-battle-stage.mjs's own header for the same finding: that harness STUBS
   window.Theater entirely rather than loading the real file for exactly this reason.).

   Part A (§1-§2) drives the PRODUCTION CONTRACT: a full jsdom load of every manifest module (same
   convention as dev/verify-dm-events.mjs), calling the REAL `applyEvent` — never a hand-built ledger
   entry — to prove the wiring reaches the ledger. RED-FIRST (§1's R-prefixed checks): the SAME harness
   is rebuilt with src/world/dm.js swapped for its content AT THE BRANCH BASE (the commit immediately
   before this unit's edits, docs/mf3b-spec's own merge commit — every other manifest module is
   identical at base and HEAD, so this isolates exactly this unit's dm.js edit), proving the assertion
   actually fails without it — not just cited, executed both ways.

   Part B (§3-§5) drives the PRODUCTION RENDER DISPATCH: the real theaterFxFromLedger (theater-verbs.js,
   plain Node ESM import — that file has zero DOM/THREE coupling of its own, per its own header) fed the
   REAL ledger entry §1 produced; then the real standeeVerbForHurt/recoilDirFromPositions (theater-
   boot.js's play() calls these SAME two functions — see that file's play(), which imports them from
   this module); then §5 proves the wire reaches MF-3's actual hit-stop mechanism end-to-end by driving
   playVerb("hurt",...) with the REAL attackerId theaterFxFromLedger derived from applyEvent's ledger
   entry (the WIRING LAW's "drive the production entry point, not triggerHitStop directly" — the entry
   point here is applyEvent, and every step after it is real production code, never re-implemented).

   Part C (§6) re-runs the full regression list BEAUTY-WAVE-4B specs: verify-mf3-impact-feel (47/0),
   verify-theater-verbs (100/0), verify-standee-verbs (71/0), verify-dm-events.mjs (the dm/combat event
   harness), gauntlet-fuzz-events.mjs, gauntlet-monkey.mjs, and check-manifest.py — every one run LIVE
   as a child process here, not cited from a prior run.

   Run:  node dev/verify-mf3b-hitstop-wiring.mjs
   (jsdom is installed per-environment in a scratch dir — see CLAUDE.md "headless test".
    Override with JSDOM_HOME=/path/to/dir containing node_modules/jsdom.) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

// the commit immediately before this unit's edits (docs/mf3b-spec's own merge — the BW4B spec landing,
// master tip when this branch was cut). src/ui/theater-boot.js/theater-verbs.js/standee-verbs.js are
// NOT in manifest.loadOrder (the sealed ES-module island, per CLAUDE.md) so only dm.js needs swapping
// to reconstruct the contract-fold base state.
const BASE = "86e706af";

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

// ----------------------------------------------------------------------------
// Part A bootstrap — every manifest module in one jsdom window, exactly dev/verify-dm-events.mjs's own
// convention, with an optional per-path source OVERRIDE (used below to reconstruct BASE's dm.js without
// a git checkout / touching the worktree).
// ----------------------------------------------------------------------------
const man = JSON.parse(read("manifest.json"));
function bootstrap(overrides) {
  overrides = overrides || {};
  const srcText = man.loadOrder.filter((p) => p.endsWith(".js"))
    .map((p) => (overrides[p] != null ? overrides[p] : read(p)))
    .join("\n;\n");
  const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, { runScripts: "dangerously" });
  const win = dom.window;
  // const-decl symbols share the eval's lexical scope but aren't window.* under indirect eval (the
  // documented gotcha — see dev/verify-dm-events.mjs's own `expose` line); surface the one this
  // harness inspects (§2) IN THE SAME eval call (a later, separate win.eval does NOT see this script's
  // top-level const bindings — verified live above before this fix).
  const expose = `;try{window.DM_EVENT_FIELDS=DM_EVENT_FIELDS;}catch(e){}`;
  win.eval(harness + "\n" + srcText + "\n" + expose);
  return win;
}
function baseSrc(path) {
  return execSync(`git show ${BASE}:${path}`, { cwd: ROOT }).toString();
}

function makeWorld() {
  return {
    id: "w-mf3b", name: "MF-3b Test World",
    seed: { master: { name: "Test Keep", desc: "a bare test room" }, smell: { name: "dust" },
            sound: { name: "silence" }, arch: { name: "plain stone" },
            taboo: { name: "none", desc: "none" }, myth: { name: "none", desc: "none" } },
    characters: [{ status: "living", name: "Test PC", headline: "a fighter", spark: "a fighter", pronouns: "they",
      sheet: { species: "Human", class: "Fighter", background: "Soldier", level: 3,
               hp: 30, hpCur: 30, ac: 15, tempHp: 0, profBonus: 2, scores: {}, mods: {}, saveProfs: [], skillProfs: [] } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 0 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null, factions: [], pressures: [], revealed: {}, dmlog: [],
  };
}
function runHpChanged(win, payload) {
  const world = makeWorld();
  win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null };
  const r = win.applyEvent(world, { type: "hp_changed", payload, source: "detected" });
  const hpEntries = win.ledgerOf(world).filter((x) => x.data && x.data.kind === "hp");
  return { r, entry: hpEntries[hpEntries.length - 1], world };
}

console.log("=== §1 CONTRACT FOLD — attacker+crit forwarded onto the hp ledger entry (RED-FIRST) ===");
let headEntryForPartB = null;
{
  const baseWin = bootstrap({ "src/world/dm.js": baseSrc("src/world/dm.js") });
  const { entry: baseEntry } = runHpChanged(baseWin, { delta: -6, attacker: "foe-1", crit: true });
  check(`R1a-RED. at BASE (${BASE}), applyEvent(hp_changed{attacker,crit}) — the ledger entry has NO attacker field`,
    !!baseEntry && baseEntry.data.attacker === undefined, JSON.stringify(baseEntry && baseEntry.data));
  check(`R1b-RED. at BASE (${BASE}), the ledger entry has NO crit field`,
    !!baseEntry && baseEntry.data.crit === undefined, JSON.stringify(baseEntry && baseEntry.data));

  const headWin = bootstrap();
  const { entry: headEntry } = runHpChanged(headWin, { delta: -6, attacker: "foe-1", crit: true });
  headEntryForPartB = headEntry;
  check("§1a. GREEN (HEAD): the hp ledger entry carries attacker:\"foe-1\"",
    !!headEntry && headEntry.data.attacker === "foe-1", JSON.stringify(headEntry && headEntry.data));
  check("§1b. GREEN (HEAD): the hp ledger entry carries crit:true",
    !!headEntry && headEntry.data.crit === true, JSON.stringify(headEntry && headEntry.data));

  // sibling check: an hp_changed with NO attacker/crit in the payload stays undefined on the ledger
  // entry (graceful dormancy for every pre-existing caller/hazard site — never injected/guessed).
  const { entry: bareEntry } = runHpChanged(headWin, { delta: -4 });
  check("§1c. an hp_changed with no attacker/crit in the payload leaves both undefined on the ledger (hazards stay dormant)",
    !!bareEntry && bareEntry.data.attacker === undefined && bareEntry.data.crit === undefined,
    JSON.stringify(bareEntry && bareEntry.data));
}

console.log("\n=== §2 ACCEPT-LIST — DM_EVENT_FIELDS.hp_changed accepts \"attacker\" (id passthrough, never num-coerced) ===");
{
  const win = bootstrap();
  check("§2a. DM_EVENT_FIELDS.hp_changed.accept includes \"attacker\"",
    win.DM_EVENT_FIELDS.hp_changed.accept.includes("attacker"), win.DM_EVENT_FIELDS.hp_changed.accept.join(","));
  check("§2b. DM_EVENT_FIELDS.hp_changed.num is UNCHANGED (still just [\"delta\"] — attacker is an id passthrough, never coerced)",
    JSON.stringify(win.DM_EVENT_FIELDS.hp_changed.num) === JSON.stringify(["delta"]), JSON.stringify(win.DM_EVENT_FIELDS.hp_changed.num));
}

// ----------------------------------------------------------------------------
// Part B — the REAL render dispatch: theater-verbs.js (plain Node ESM, zero DOM/THREE coupling of its
// own, per its own header) fed the REAL ledger entry §1 produced via applyEvent.
// ----------------------------------------------------------------------------
const verbsModUrl = pathToFileURL(join(ROOT, "src/ui/theater-verbs.js")).href;
const {
  theaterFxFromLedger, standeeVerbForHurt, recoilDirFromPositions,
  playVerb, tickTweens, triggerHitStop,
} = await import(verbsModUrl);

console.log("\n=== §3 RENDER DISPATCH — theaterFxFromLedger threads attackerId+crit off the REAL ledger entry ===");
{
  const fx = theaterFxFromLedger(headEntryForPartB);
  check("§3a. theaterFxFromLedger maps the real hp-crit ledger entry to verb:\"hurt\"", fx && fx.verb === "hurt", JSON.stringify(fx));
  check("§3b. opts.attackerId === \"foe-1\" (threaded from the ledger entry's own attacker field)",
    fx && fx.opts.attackerId === "foe-1", JSON.stringify(fx && fx.opts));
  check("§3c. opts.crit === true", fx && fx.opts.crit === true, JSON.stringify(fx && fx.opts));

  const STANDEE_MAP = Object.freeze({ hurt: "hit-damage", down: "fall-death" }); // theater-boot.js's own static map, mirrored here for the pure-function call
  const standeeVerb = standeeVerbForHurt(fx.verb, fx.opts, STANDEE_MAP);
  check("§3d. play()'s routing (standeeVerbForHurt) selects \"hit-crit\" for this ledger entry, NOT \"hit-damage\"",
    standeeVerb === "hit-crit", standeeVerb);
}
{
  // a non-crit hp entry (no attacker either — e.g. the pre-existing hazard shape) keeps hit-damage.
  const nonCritEntry = { type: "outcome", data: { kind: "hp", delta: -4, dropped: false } };
  const fx = theaterFxFromLedger(nonCritEntry);
  check("§3e. a non-crit hp entry with no attacker: opts.attackerId is undefined (graceful, no throw)", fx && fx.opts.attackerId === undefined, JSON.stringify(fx && fx.opts));
  const STANDEE_MAP = Object.freeze({ hurt: "hit-damage", down: "fall-death" });
  check("§3f. play()'s routing stays \"hit-damage\" for a non-crit hurt (unchanged default)",
    standeeVerbForHurt(fx.verb, fx.opts, STANDEE_MAP) === "hit-damage", standeeVerbForHurt(fx.verb, fx.opts, STANDEE_MAP));
}

console.log("\n=== §4 DISPATCH — attacker absent stays dormant (today's behavior, no throw) ===");
{
  const bareEntry = { type: "outcome", data: { kind: "hp", delta: -5, dropped: false } };
  const fx = theaterFxFromLedger(bareEntry);
  check("§4a. verb is still \"hurt\" with no attacker", fx && fx.verb === "hurt", JSON.stringify(fx));
  check("§4b. opts.attackerId is undefined (hit-stop won't fire — vHurt/runKeyframeVerb's own opts.attackerId!=null gate)",
    fx && fx.opts.attackerId === undefined, JSON.stringify(fx && fx.opts));
  const STANDEE_MAP = Object.freeze({ hurt: "hit-damage", down: "fall-death" });
  check("§4c. dispatch stays \"hit-damage\" (never hit-crit) when opts.crit is falsy/absent",
    standeeVerbForHurt(fx.verb, fx.opts, STANDEE_MAP) === "hit-damage");
}

console.log("\n=== §5 RECOIL GEOMETRY — recoilDirFromPositions (play()'s own math for the sprite path) ===");
{
  // attacker sits at -x of the target → recoil should point +x (away from the attacker), matching
  // dev/verify-mf3-impact-feel.mjs §3's own vHurt convention.
  const dir = recoilDirFromPositions({ x: 5, z: 0 }, { x: 0, z: 0 });
  check("§5a. recoilDir points +x (away from an attacker at -x)", dir && dir.x > 0, JSON.stringify(dir));
  check("§5b. recoilDir.z is 0 (attacker directly on the x-axis)", dir && Math.abs(dir.z) < 1e-9, JSON.stringify(dir));
  check("§5c. recoilDir is a UNIT vector (length 1)", dir && Math.abs(Math.hypot(dir.x, dir.z) - 1) < 1e-9, JSON.stringify(dir));
}
{
  check("§5d. recoilDirFromPositions(null, attackerPos) → null, no throw", recoilDirFromPositions(null, { x: 0, z: 0 }) === null);
  check("§5e. recoilDirFromPositions(targetPos, null) → null, no throw (attacker doesn't resolve)", recoilDirFromPositions({ x: 1, z: 1 }, null) === null);
  check("§5f. coincident positions (zero-length vector) → null, never NaN", recoilDirFromPositions({ x: 3, z: 3 }, { x: 3, z: 3 }) === null);
}

console.log("\n=== §6 LIVE HIT-STOP END-TO-END — driving applyEvent (the PRODUCTION entry point), not triggerHitStop directly ===");
{
  // Step 1: a REAL applyEvent call (not a hand-built ledger entry) produces the ledger data.
  const win = bootstrap();
  const { entry } = runHpChanged(win, { delta: -8, attacker: "atk-e2e", crit: false });
  check("§6a. the e2e ledger entry (from a real applyEvent call) carries attacker:\"atk-e2e\"",
    entry && entry.data.attacker === "atk-e2e", JSON.stringify(entry && entry.data));

  // Step 2: the REAL theaterFxFromLedger derives {verb,opts} from that entry — no hand-authored opts.
  const fx = theaterFxFromLedger(entry);
  check("§6b. theaterFxFromLedger derives opts.attackerId===\"atk-e2e\" from the e2e entry", fx && fx.opts.attackerId === "atk-e2e", JSON.stringify(fx && fx.opts));

  // Step 3: feed those REAL opts into the REAL vHurt (via playVerb) with a stub ctx carrying an
  // attacker tween tagged unitId:"atk-e2e" (theater-verbs.js's own findLatestTweenByUnitId convention,
  // same stub shape as dev/verify-mf3-impact-feel.mjs's §4) — assert the mechanism ACTUALLY freezes,
  // reusing MF-3's own freeze assertion (its own hit-stop hook, untouched by this unit).
  const attackerRec = {}, targetRec = {}, controlRec = {};
  const T0 = 5_000_000;
  const attackerTw = { start: T0 - 50, dur: 300, unitId: "atk-e2e", update: (t) => { attackerRec.t = t; }, onDone: null };
  const controlTw  = { start: T0,      dur: 100,                    update: (t) => { controlRec.t = t; }, onDone: null }; // a "world" tween — must keep ticking
  const ctx = {
    tweens: [attackerTw, controlTw],
    findUnit(id) { return null; }, // vHurt's own resolveUnit only needs `who` to resolve to a stub group; see below
  };
  // a minimal stub target group (vHurt's own contract: position + traverse + a colorable material)
  const targetGroup = {
    position: { x: 3, y: 0, z: 0, set(x,y,z){ this.x=x;this.y=y;this.z=z; } },
    traverse(fn){ fn(this); },
    material: { color: { r:1,g:1,b:1, clone(){ return { r:this.r,g:this.g,b:this.b, setRGB(r,g,b){this.r=r;this.g=g;this.b=b;} }; }, setRGB(r,g,b){ this.r=r;this.g=g;this.b=b; } }, transparent:false, opacity:1 },
  };
  ctx.findUnit = (id) => (id === fx.opts.who ? targetGroup : (id === "atk-e2e" ? { position: { x: 0, z: 0 } } : null));
  ctx.tweens = [attackerTw, controlTw];
  // theaterFxFromLedger's "hp" case sets opts.who=undefined for a PC hit (d.pc truthy) — give vHurt a
  // resolvable who for this end-to-end pass (matches a foe-hurt shape; the wiring under test —
  // attackerId/crit threading — is identical regardless of which side got hit).
  const opts = Object.assign({}, fx.opts, { who: "tgt-e2e", dur: 220 });
  ctx.findUnit = (id) => (id === "tgt-e2e" ? targetGroup : (id === "atk-e2e" ? { position: { x: 0, z: 0 } } : null));
  const ok = playVerb(ctx, "hurt", opts);
  check("§6c. playVerb(\"hurt\", opts) with the e2e-derived attackerId registers a tween", ok === true);
  const hurtTw = ctx.tweens[ctx.tweens.length - 1];
  check("§6d. the hurt tween got frozen (contact-frame hit-stop actually fired via the wire, not a direct triggerHitStop call)",
    hurtTw.__freezeUntil != null, hurtTw.__freezeUntil);
  check("§6e. the attacker's own tween (found by unitId:\"atk-e2e\") got frozen too — BOTH sides of the hit, per MF-3 bullet 1",
    attackerTw.__freezeUntil != null, attackerTw.__freezeUntil);

  tickTweens(ctx, T0 + 30);
  check("§6f. mid-freeze-window: the control (\"world\") tween KEEPS TICKING while the hit is frozen",
    Math.abs(controlRec.t - 0.3) < 1e-9, controlRec.t);
}

// ----------------------------------------------------------------------------
// Part C — regression: every suite the spec names, run LIVE as child processes.
// ----------------------------------------------------------------------------
console.log("\n=== §6(cont.)/§7 REGRESSION — the existing suites stay green (run live, not cited) ===");
function runSuite(label, cmd) {
  let out = "", ok = true;
  try { out = execSync(cmd, { cwd: ROOT, encoding: "utf-8", maxBuffer: 1024 * 1024 * 64 }); }
  catch (e) { ok = false; out = String(e.stdout || e.message); }
  return { label, ok, out, tail: out.trim().split("\n").slice(-1)[0] };
}
{
  const r = runSuite("mf3-impact-feel", "node dev/verify-mf3-impact-feel.mjs");
  check("§7a. dev/verify-mf3-impact-feel.mjs exits clean, 0 failed", r.ok && /\b0 failed\b/.test(r.tail), r.tail);
  console.log("    tail:", r.tail);
}
{
  const r = runSuite("theater-verbs", "node dev/verify-theater-verbs.mjs");
  check("§7b. dev/verify-theater-verbs.mjs exits clean, 0 failed", r.ok && /\b0 failed\b/.test(r.tail), r.tail);
  console.log("    tail:", r.tail);
}
{
  const r = runSuite("standee-verbs", "node dev/verify-standee-verbs.mjs");
  check("§7c. dev/verify-standee-verbs.mjs exits clean, 0 failed", r.ok && /\b0 failed\b/.test(r.tail), r.tail);
  console.log("    tail:", r.tail);
}
{
  const r = runSuite("dm-events", "node dev/verify-dm-events.mjs");
  check("§7d. dev/verify-dm-events.mjs (the dm/combat event harness) exits clean", r.ok, r.tail);
  console.log("    tail:", r.tail);
}
{
  const r = runSuite("gauntlet-fuzz-events", "node dev/gauntlet-fuzz-events.mjs");
  check("§7e. node dev/gauntlet-fuzz-events.mjs exits clean (incl. hostile hp_changed payloads with a bogus attacker type)", r.ok, r.tail);
  console.log("    tail:", r.tail);
}
{
  const r = runSuite("gauntlet-monkey", "node dev/gauntlet-monkey.mjs");
  check("§7f. node dev/gauntlet-monkey.mjs — 0 harness-aborted", r.ok, r.tail);
  console.log("    tail:", r.tail);
}
{
  const r = runSuite("check-manifest", "python3 build/check-manifest.py");
  check("§7g. python3 build/check-manifest.py — RESULT: OK", r.ok && /RESULT:\s*OK/.test(r.out), r.tail);
  console.log("    tail:", r.tail);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
