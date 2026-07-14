/* Verify D0 — THE STATE PRIMITIVE (docs/STAGE-D-WAVE-SPECS.md "D0", BEAUTY-WAVE-5.md S0-3/Law 6).
   Modeled on dev/verify-dm-events.mjs: loads every module in real manifest load order into one
   jsdom global scope (classic scripts, one eval — the const-via-eval gotcha), then drives
   applyEvent(w, {type:"state_transition", ...}) directly and asserts the mutation/degrade contract.

   D0 ships BEFORE D1 (the archetype state-list registry) and D2 (the real plan.interactables[]
   binding) land, so this harness supplies BOTH synthetic placed entities (on a fake w.prep node,
   matching the shape dmFindInteractable resolves — sourceRef-keyed, mirroring D2's eventual field)
   and a synthetic archetype→state-list table (window.INTERACTABLE_ARCHETYPE_STATES, matching the
   classic-globals convention D1's own registry will use).

   Run:  node dev/verify-state-primitive.mjs
   (jsdom per-environment in a scratch dir — JSDOM_HOME override, see CLAUDE.md "headless test".) */
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

check("applyEvent + dmFindInteractable + dmArchetypeStates + dmEntityState present after full load",
  typeof win.applyEvent === "function" && typeof win.dmFindInteractable === "function"
  && typeof win.dmArchetypeStates === "function" && typeof win.dmEntityState === "function");

// --- a minimal world with an active walk (mirrors the shape prep.js's own nodes carry) ---
const world = {
  id: "w-d0", name: "D0 Harness World", characters: [], gazetteer: [], log: [], ledger: [],
  clock: { day: 1, min: 0 }, session: 1, map: { nodes: {}, edges: [] }, currentNodeId: null,
  factions: [], pressures: [], revealed: {}, dmlog: [],
  prep: { activeWalkId: "n-1", nodes: { "n-1": { interactables: [
    { sourceRef: "door-1", archetype: "door", state: "shut", name: "the iron door" },
    { sourceRef: "chest-1", archetype: "chest", name: "a battered strongbox" },   // no explicit state — default path
    { sourceRef: "widget-1", archetype: "qa-unrostered-widget", state: "dormant", name: "a strange device" },   // §4: an archetype NO registry lists — the no-state-list degrade
  ] } } },
};
win.U.worlds[world.id] = world;
win.U.activeWorldId = world.id;
const ledgerLen = () => (world.ledger || []).length;
const findEnt = (ref) => world.prep.nodes["n-1"].interactables.find((it) => it.sourceRef === ref);

// === RED-FIRST proof (recorded manually alongside this file — see dev-log below) ===
// Before this unit registered state_transition (DM_EVENT_TYPES + the applyEvent case), the SAME
// event hit the default branch: ok:false, reason "unknown-type:state_transition", no mutation, no
// ledger growth. That run was captured against the pre-registration dm.js via `git stash` (this
// file is untracked so it survives the stash) — see the session report for the transcript. This
// harness now asserts the POST-registration contract permanently (the ongoing regression guard for
// the "unknown types still no-op" half of the contract is check group 1 below, using a type that
// really is unregistered).

// === 1. unknown type still a safe no-op (the forward-compatible baseline state_transition itself
//         relied on before it was registered — kept green so nothing can silently regress it) ===
{ const before = ledgerLen();
  const r = win.applyEvent(world, { type: "totally_unregistered_type", payload: {}, source: "declared" });
  check("an unregistered type is still a safe no-op (ok:false, ledger unmoved)",
    r.ok === false && ledgerLen() === before, JSON.stringify(r)); }

// === 2. entity not found -> quiet no-op (pre-D2 default; also a stale/typo'd ref) ===
{ const before = ledgerLen();
  const r = win.applyEvent(world, { type: "state_transition", payload: { entityRef: "no-such-door", to: "open" }, source: "declared" });
  check("unknown entityRef -> ok:false reason:'no-such-entity', ledger unmoved",
    r.ok === false && r.reason === "no-such-entity" && ledgerLen() === before, JSON.stringify(r)); }

// === 3. missing entityRef entirely -> structured no-op, never throws ===
{ let threw = false, r = null;
  try { r = win.applyEvent(world, { type: "state_transition", payload: { to: "open" }, source: "declared" }); }
  catch (e) { threw = true; }
  check("missing entityRef -> ok:false reason:'no-entity-ref', never throws",
    !threw && r && r.ok === false && r.reason === "no-entity-ref", JSON.stringify(r)); }

// === 4. no state list known for the archetype -> quiet no-op, entity's state field untouched
//        (never a blind write without a known state list).
//        FIXTURE FIX 2026-07-14 (red-first: this section WENT RED on the D0+D1 integrated tree —
//        18/4 at merge cbc90402..33fe8537): the original fixture simulated "registry absent (pre-D1)"
//        via `door-1` + asserting `win.INTERACTABLE_ARCHETYPE_STATES === undefined`. Post-D1 that
//        simulation is IMPOSSIBLE in a full-app load: data/interactables.js declares the table as a
//        top-level lexical `const`, which SHADOWS any window property — dm.js saw the real door list,
//        the "absent" transition genuinely applied (correct behavior!), and the mutated door-1
//        cascaded into three downstream `from` assertions. Same degrade path, robust form: an
//        UNROSTERED archetype (no registry lists it, real or synthetic) hits the identical
//        no-state-list branch whether or not D1's registry is loaded. Behavior unweakened. ===
{ const before = ledgerLen(), ent = findEnt("widget-1"), stateBefore = ent.state;
  const r = win.applyEvent(world, { type: "state_transition", payload: { entityRef: "widget-1", to: "active" }, source: "declared" });
  check("unrostered archetype (no state list known) -> ok:false reason:'no-state-list', ledger unmoved, entity.state untouched",
    r.ok === false && r.reason === "no-state-list" && ledgerLen() === before && ent.state === stateBefore, JSON.stringify(r)); }

// --- from here on, the harness supplies the D1 archetype state-list table (synthetic — D1 owns
//     the real one) so the validate/apply paths can be exercised. ---
win.INTERACTABLE_ARCHETYPE_STATES = { door: ["shut", "ajar", "open", "broken"], chest: ["closed", "open", "looted"] };

// === 5. dmEntityState — default state resolves safely for an entity with none ===
{ const chest = findEnt("chest-1"), states = win.INTERACTABLE_ARCHETYPE_STATES.chest;
  check("dmEntityState: entity with no explicit .state resolves the archetype's first (rest) state",
    win.dmEntityState(chest, states) === "closed", win.dmEntityState(chest, states));
  const doorEnt = findEnt("door-1");
  check("dmEntityState: an entity WITH an explicit .state returns its own value, not the default",
    win.dmEntityState(doorEnt, win.INTERACTABLE_ARCHETYPE_STATES.door) === "shut"); }
{ // an entity/archetype the table doesn't cover at all -> null, never throws
  let threw = false, out;
  try { out = win.dmEntityState({ archetype: "unknown-archetype" }, win.dmArchetypeStates("unknown-archetype")); }
  catch (e) { threw = true; }
  check("dmEntityState: unknown archetype resolves to null, never throws", !threw && out === null, out); }

// === 6. invalid `to` state -> REJECTED LOUDLY (no silent write), archetype list IS known here ===
{ const warnings = [];
  const origWarn = win.console.warn;
  win.console.warn = (...args) => { warnings.push(args.join(" ")); origWarn.apply(win.console, args); };
  const before = ledgerLen(), ent = findEnt("door-1"), stateBefore = ent.state;
  const r = win.applyEvent(world, { type: "state_transition", payload: { entityRef: "door-1", to: "molten" }, source: "declared" });
  win.console.warn = origWarn;
  check("invalid `to` ('molten' not in door's state list) -> ok:false reason:'invalid-state'",
    r.ok === false && r.reason === "invalid-state", JSON.stringify(r));
  check("invalid `to` -> NO silent write: entity.state unchanged", ent.state === stateBefore, ent.state);
  check("invalid `to` -> ledger unmoved (no phantom outcome line)", ledgerLen() === before);
  check("invalid `to` -> rejection is LOUD (console.warn fired)", warnings.some((w) => /state_transition rejected/.test(w)), JSON.stringify(warnings)); }

// === 7. valid transition APPLIES exactly once (fake-clock testable — no wall-clock dependency;
//        one applyEvent call, one write, one ledger line) ===
{ const ent = findEnt("door-1");
  const before = ledgerLen();
  const r = win.applyEvent(world, { type: "state_transition", payload: { entityRef: "door-1", to: "ajar", cause: "the party heaves it" }, source: "declared" });
  check("valid transition -> ok:true, entity.state 'shut'->'ajar'", r.ok === true && ent.state === "ajar", JSON.stringify(r) + " " + ent.state);
  check("valid transition -> from/to reported on the result (from derived from prior state)",
    r.from === "shut" && r.to === "ajar", JSON.stringify(r));
  check("valid transition -> fires exactly once: ledger grew by exactly 1 (not 0, not 2)",
    ledgerLen() === before + 1, `+${ledgerLen() - before}`);
  const last = world.ledger[world.ledger.length - 1];
  check("valid transition -> ledger line is an 'outcome'/'state' kind naming entityRef/from/to/cause",
    last && last.data && last.data.kind === "state" && last.data.entityRef === "door-1"
    && last.data.from === "shut" && last.data.to === "ajar" && last.data.cause === "the party heaves it",
    JSON.stringify(last)); }

// === 8. `from` omitted -> derived from the entity's CURRENT state (not the archetype default) ===
{ const ent = findEnt("door-1"); // currently "ajar" after test 7
  const r = win.applyEvent(world, { type: "state_transition", payload: { entityRef: "door-1", to: "open" }, source: "declared" });
  check("from omitted -> derives the CURRENT state ('ajar'), not the archetype's resting default ('shut')",
    r.ok === true && r.from === "ajar" && r.to === "open", JSON.stringify(r)); }

// === 9. default-state resolution feeds `from` for an entity that has never explicitly transitioned
//        (chest-1: no .state yet -> from should resolve to the archetype default 'closed') ===
{ const chest = findEnt("chest-1");
  const r = win.applyEvent(world, { type: "state_transition", payload: { entityRef: "chest-1", to: "open" }, source: "declared" });
  check("first-ever transition on an entity with no .state -> from resolves to the archetype default ('closed')",
    r.ok === true && r.from === "closed" && r.to === "open" && chest.state === "open", JSON.stringify(r)); }

// === 10. determinism — the default-state resolution is a pure function of (entity, states); two
//         entities in the same untouched archetype default identically, run after run ===
{ const s = ["intact", "defiled", "active"];
  const a = win.dmEntityState({ name: "shrine A" }, s), b = win.dmEntityState({ name: "shrine B" }, s);
  const a2 = win.dmEntityState({ name: "shrine A" }, s);
  check("determinism: two untouched entities of the same archetype resolve the SAME default state",
    a === b && a === "intact", `${a} ${b}`);
  check("determinism: re-resolving the same entity/state-list twice is byte-identical",
    a === a2); }

// === 11. gauntlet-adjacent hostile payload (fuzz-shape sanity — the real gauntlet-fuzz-events run
//          separately, but a quick in-harness smoke keeps this file self-checking) ===
{ const hostiles = [
    { type: "state_transition", payload: null },
    { type: "state_transition", payload: { entityRef: 12345, to: {} } },
    { type: "state_transition", payload: { entityRef: "door-1", to: null, cause: 999 } },
    { type: "state_transition" },
  ];
  let threw = false;
  hostiles.forEach((e) => { try { win.applyEvent(world, e); } catch (err) { threw = true; console.log("    threw on", JSON.stringify(e), err.message); } });
  check("hostile/malformed state_transition payloads never throw", !threw); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
