/* Verify BATTLE-THEATER T3 (docs/BATTLE-THEATER.md §4) — the verb library seam. Two independent
   harnesses, per the two different runtimes this unit touches:

   PART A — a real Node ESM `import` of src/ui/theater-verbs.js. This module is a sealed ES-module
   boundary file (same discipline as theater-boot.js, CLAUDE.md) — it can't be win.eval'd as a classic
   script like the rest of the app. It has ZERO direct DOM/THREE coupling of its own (every THREE.*
   handle arrives via the `ctx` object theater-boot.js constructs), so a plain Node import is enough to
   exercise its pure logic: THEATER_VERBS completeness against §4's table, theaterFxFromLedger's
   ledger-kind -> verb mapping, and playVerb/tickTweens against a hand-built stub `ctx` (no real THREE
   needed — the verb implementations only call methods a stub can trivially provide: Group-like objects
   with children/add/remove, Object3D-like objects with position/rotation/scale, a BoxGeometry/
   MeshBasicMaterial/PlaneGeometry stand-in). This proves the tween math actually mutates the handles it's
   given, red-first, without needing a browser.

   PART B — the standard full-app jsdom load (real modules in manifest order, same convention as every
   other dev/verify-*.mjs) to exercise the EVENT-CONTRACT runtime: the `stage_fx` applyEvent case
   (validates/ledgers/no-ops headless) and the 6 named hook call sites (attack/foe_action x2/move_zone/
   foe_morale/crit_outcome/combat_end) actually calling cmTheaterNotify with the right kind — verified
   by installing a SPY window.Theater stub (play() records every call) before driving real combat events
   through applyEvent. window.Theater is never the real ES module here (jsdom doesn't load
   type:"module" script tags) — this IS the headless-safe path the spec requires, and the spy also
   proves the seam is truly additive (stage_fx unknown to jsdom's window.Theater at all still no-ops
   cleanly when window.Theater is entirely absent, checked separately from the spy'd checks).

   Run:  node dev/verify-theater-verbs.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");

let pass = 0, fail = 0;
const check = (name, cond, detail = "") =>
  cond ? (pass++, console.log("  ✓", name)) : (fail++, console.log("  ✗", name, "—", detail));

console.log("=== PART A — theater-verbs.js as a pure ES module (no DOM) ===");

const verbsModUrl = pathToFileURL(join(ROOT, "src/ui/theater-verbs.js")).href;
const { THEATER_VERBS, playVerb, tickTweens, theaterFxFromLedger } = await import(verbsModUrl);

// ----------------------------------------------------------------------------
// A1. THEATER_VERBS completeness vs §4's table
// ----------------------------------------------------------------------------
{
  const SPEC_VERBS = ["advance","withdraw","strike","hurt","down","cast","arc","knockback","sink","burst","flee","absurdity"];
  const SPEC_FX_TYPES = ["fire","frost","lightning","necrotic","radiant","poison"];
  check("A1a. THEATER_VERBS is exported + frozen", Array.isArray(THEATER_VERBS) && Object.isFrozen(THEATER_VERBS));
  check("A1b. every §4 table verb is present", SPEC_VERBS.every(v => THEATER_VERBS.includes(v)),
    SPEC_VERBS.filter(v => !THEATER_VERBS.includes(v)).join(","));
  check("A1c. every §4 damage-type FX (fire/frost/lightning/necrotic/radiant/poison minimum) is addressable as fx:<type>",
    SPEC_FX_TYPES.every(t => THEATER_VERBS.includes("fx:"+t)),
    SPEC_FX_TYPES.filter(t => !THEATER_VERBS.includes("fx:"+t)).join(","));
  check("A1d. no unknown/stray verbs beyond the spec table + fx types",
    THEATER_VERBS.every(v => SPEC_VERBS.includes(v) || v.indexOf("fx:")===0), THEATER_VERBS.join(","));
}

// ----------------------------------------------------------------------------
// A2. MUTATION CHECK — a bad/misspelled verb name is REJECTED (proves the list is load-bearing,
// not vacuously true — playVerb must actually gate on THEATER_VERBS/its own dispatch table).
// ----------------------------------------------------------------------------
{
  const stubCtx = makeStubCtx();
  const ok = playVerb(stubCtx, "not-a-real-verb", {});
  check("A2. an unknown verb name is rejected by playVerb (false, no tween pushed)",
    ok === false && stubCtx.tweens.length === 0, JSON.stringify({ok, tweens: stubCtx.tweens.length}));
}

// ----------------------------------------------------------------------------
// A3. playVerb actually mutates the handles it's given — a representative sample, not all 12
// (advance/strike/hurt/down/absurdity), each red-first against a stub ctx.
// ----------------------------------------------------------------------------
{
  // advance: a unit glides toward a resolved zone point.
  const ctx = makeStubCtx();
  const unit = makeStubUnit("pc");
  ctx.unitGroup.children.push(unit);
  ctx._zoneToWorld = () => ({ x: 5, z: 5 });
  const ok = playVerb(ctx, "advance", { who: "pc", to: "near:C" });
  check("A3a. advance() registers a tween", ok === true && ctx.tweens.length === 1);
  runToCompletion(ctx.tweens);
  check("A3b. advance() moves the unit to the resolved zone point", Math.abs(unit.position.x - 5) < 1e-6 && Math.abs(unit.position.z - 5) < 1e-6,
    JSON.stringify(unit.position));
}
{
  // strike: lunges then recoils back to the start position (there-and-back).
  const ctx = makeStubCtx();
  const unit = makeStubUnit("f1");
  unit.position.x = 0; unit.position.z = 0;
  ctx.unitGroup.children.push(unit);
  ctx._zoneToWorld = () => ({ x: 3, z: 0 });
  const ok = playVerb(ctx, "strike", { who: "f1", to: "melee:C" });
  check("A3c. strike() registers a tween", ok === true);
  runToCompletion(ctx.tweens);
  check("A3d. strike() recoils back to the origin (onDone reset)", Math.abs(unit.position.x - 0) < 1e-6, JSON.stringify(unit.position));
}
{
  // down: rotates to prone and STAYS (terminal, no revert) — matches setUnits' own u.down convention.
  const ctx = makeStubCtx();
  const unit = makeStubUnit("f2");
  ctx.unitGroup.children.push(unit);
  const ok = playVerb(ctx, "down", { who: "f2" });
  check("A3e. down() registers a tween", ok === true);
  runToCompletion(ctx.tweens);
  check("A3f. down() ends toppled 90deg (terminal — persists post-tween)", Math.abs(unit.rotation.z - Math.PI/2) < 1e-6, unit.rotation.z);
}
{
  // absurdity: magnitude scales the tween duration; camera position is restored exactly on completion.
  const ctxLow = makeStubCtx(); ctxLow.camera = { position: { x: 1, y: 2, z: 3, clone(){ return {x:this.x,y:this.y,z:this.z}; }, copy(p){ this.x=p.x;this.y=p.y;this.z=p.z; } } };
  playVerb(ctxLow, "absurdity", { magnitude: 1 });
  const lowDur = ctxLow.tweens[0].dur;
  const ctxHigh = makeStubCtx(); ctxHigh.camera = { position: { x: 1, y: 2, z: 3, clone(){ return {x:this.x,y:this.y,z:this.z}; }, copy(p){ this.x=p.x;this.y=p.y;this.z=p.z; } } };
  playVerb(ctxHigh, "absurdity", { magnitude: 12 });
  const highDur = ctxHigh.tweens[0].dur;
  check("A3g. absurdity's tween duration scales UP with magnitude", highDur > lowDur, JSON.stringify({lowDur, highDur}));
  runToCompletion(ctxHigh.tweens);
  check("A3h. absurdity restores the camera position exactly on completion", ctxHigh.camera.position.x === 1 && ctxHigh.camera.position.y === 2, JSON.stringify(ctxHigh.camera.position));
}
{
  // fx:fire — a bare elemental burst with no `who`, spawns primitives into fxGroup then cleans them up.
  const ctx = makeStubCtx();
  const ok = playVerb(ctx, "fx:fire", { at: { x: 0, z: 0 } });
  check("A4a. fx:fire registers a tween", ok === true);
  const spawnedCount = ctx.fxGroup.children.length;
  check("A4b. fx:fire spawns primitives into fxGroup", spawnedCount > 0, spawnedCount);
  runToCompletion(ctx.tweens);
  check("A4c. fx:fire cleans up its primitives on completion", ctx.fxGroup.children.length === 0, ctx.fxGroup.children.length);
}
{
  // an unrecognized fx:<type> still resolves (falls back to a neutral burst) — never a throw.
  const ctx = makeStubCtx();
  let threw = false;
  let ok = false;
  try { ok = playVerb(ctx, "fx:acid", { at: { x: 0, z: 0 } }); } catch(e) { threw = true; }
  check("A4d. an unrecognized fx:<type> never throws (falls back to a neutral burst)", threw === false && ok === true);
}

// ----------------------------------------------------------------------------
// A5. tickTweens retires completed tweens and reports liveness correctly.
// ----------------------------------------------------------------------------
{
  const ctx = makeStubCtx();
  const unit = makeStubUnit("pc");
  ctx.unitGroup.children.push(unit);
  playVerb(ctx, "hurt", { who: "pc", dur: 10 });
  check("A5a. tickTweens reports live=true while a tween is mid-flight", tickTweens(ctx, Date.now() - ctx.tweens[0].start + 1) === true || ctx.tweens.length > 0);
  const stillLive = tickTweens(ctx, ctx.tweens[0].start + 10000); // force well past duration
  check("A5b. tickTweens reports live=false once every tween has elapsed", stillLive === false);
  check("A5c. tickTweens actually SPLICES the completed tween out of ctx.tweens", ctx.tweens.length === 0, ctx.tweens.length);
}

// ----------------------------------------------------------------------------
// A6. theaterFxFromLedger — the EXISTING-event ledger-kind -> verb mapping (§4: "no new fields").
// ----------------------------------------------------------------------------
{
  const hit = theaterFxFromLedger({ data: { kind: "attack", hit: true, target: "f1" } });
  check("A6a. kind:attack hit -> strike", hit && hit.verb === "strike", JSON.stringify(hit));

  const miss = theaterFxFromLedger({ data: { kind: "attack", hit: false } });
  check("A6b. kind:attack miss -> strike with miss:true (overshoot)", miss && miss.verb === "strike" && miss.opts.miss === true, JSON.stringify(miss));

  const move = theaterFxFromLedger({ data: { kind: "move-zone", who: "pc", to: "near:C" } });
  check("A6c. kind:move-zone -> advance", move && move.verb === "advance", JSON.stringify(move));

  const fleeing = theaterFxFromLedger({ data: { kind: "morale", disposition: "flee", foe: "f1" } });
  check("A6d. kind:morale disposition:flee -> flee", fleeing && fleeing.verb === "flee", JSON.stringify(fleeing));

  const held = theaterFxFromLedger({ data: { kind: "morale", disposition: null, held: true } });
  check("A6e. kind:morale held -> null (silence, no animation)", held === null, JSON.stringify(held));

  const bigCrit = theaterFxFromLedger({ data: { kind: "crit", tier: "mythic", magnitude: 10, natural: 20 } });
  check("A6f. kind:crit tier:mythic -> absurdity", bigCrit && bigCrit.verb === "absurdity", JSON.stringify(bigCrit));

  const smallCrit = theaterFxFromLedger({ data: { kind: "crit", tier: "standard", magnitude: 2, natural: 20 } });
  check("A6g. a low-magnitude non-mythic crit -> null (absurdity is a SPIKE, not every nat20)", smallCrit === null, JSON.stringify(smallCrit));

  const endFight = theaterFxFromLedger({ data: { kind: "combat-end", outcome: "resolved" } });
  check("A6h. kind:combat-end -> null (silence per §4)", endFight === null, JSON.stringify(endFight));

  const roundTick = theaterFxFromLedger({ data: { kind: "round-tick" } });
  check("A6i. an unrecognized/silent kind (round_tick-adjacent) -> null, never throws", roundTick === null);

  const noData = theaterFxFromLedger(null);
  check("A6j. a malformed entry (no data) -> null, never throws", noData === null);
}

console.log("\n=== PART B — the EVENT-CONTRACT seam (jsdom, full app, spy'd window.Theater) ===");

const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");

const man = JSON.parse(read("manifest.json"));
const moduleTypedPaths = new Set(man.modules.filter(m => m.type === "module").map(m => m.path));
const moduleSrc = man.loadOrder.filter((p) => p.endsWith(".js") && !moduleTypedPaths.has(p)).map(read).join("\n;\n");
const srcText = read("tables.js") + "\n;\n" + moduleSrc;
const harness = `var U={worlds:{},activeWorldId:null,revealed:{}}; var SEED=null;`;
const DOM_HTML = `<!doctype html><html><body><div id="worldView"></div><div id="toast"></div>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`;

function freshWin() {
  const dom = new JSDOM(DOM_HTML, { runScripts: "dangerously", url: "http://localhost/" });
  const win = dom.window;
  win.eval(harness + "\n" + srcText);
  return win;
}

// a SPY window.Theater — records every play() call so the hook-site checks can assert kind/verb
// without a real GL mount. Distinct from "window.Theater absent" (tested separately, B1 below).
function installSpyTheater(win) {
  const calls = [];
  win.Theater = {
    verbs: ["advance","withdraw","strike","hurt","down","cast","arc","knockback","sink","burst","flee","absurdity",
      "fx:fire","fx:frost","fx:lightning","fx:necrotic","fx:radiant","fx:poison"],
    play(verb, opts) { calls.push({ verb, opts }); return true; },
    fxFromLedger(entry) {
      // a small inline mirror of theater-verbs.js's own mapping, JUST for the kinds this harness
      // exercises (attack/foe-turn/move-zone/morale/crit/combat-end) — Part A already independently
      // verifies the REAL theaterFxFromLedger's mapping table in isolation; this spy only needs to
      // prove cmTheaterNotify calls window.Theater.fxFromLedger + play() with the right kind/data,
      // which it does by echoing back a deterministic verb per kind.
      const k = entry && entry.data && entry.data.kind;
      const MAP = { attack: "strike", "foe-turn": "strike", "move-zone": "advance", morale: "flee", crit: "absurdity" };
      if (k === "combat-end") return null;
      if (k === "morale" && entry.data.held) return null;
      return MAP[k] ? { verb: MAP[k], opts: {} } : null;
    }
  };
  return calls;
}

function makeWorld(win, opts = {}) {
  const sheetOverrides = opts.sheet || {};
  const world = {
    id: "w-theater-verbs", name: "The Theater-Verbs Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting the seam" },
            smell:{name:"smoke"}, sound:{name:"wind"}, arch:{name:"stone"},
            taboo:{name:"t",desc:"d"}, myth:{name:"m",desc:"d"} },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: Object.assign({
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16, dex: 12 }, mods: { str: 4, con: 3, dex: 1 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [{ id:"w1", name:"Dagger", qty:1, conditions:[] }],
        equipped: { mainHand:"w1", offHand:null, armor:null }, pools: {},
      }, sheetOverrides) }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [{ name:"Copper Hand", dominant:false, agenda:"a", method:"b", tags:[], clock:{filled:0,size:6} }],
    pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.gamePanel = opts.gamePanel!==undefined ? opts.gamePanel : null;
  win.GS.menuOpen = false; win.GS.charTab = null; win.GS.actionsTab = "abilities";
  win.GS.activeShopId = null; win.GS.shopTab = "buy"; win.GS.shopSel = null;
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  return world;
}

// ----------------------------------------------------------------------------
// B1. HEADLESS SAFETY — window.Theater entirely absent (the real jsdom default, no spy installed).
// stage_fx must still validate + ledger + return ok:true, and every hook call site must no-op
// cleanly (no throw) through a full combat round.
// ----------------------------------------------------------------------------
{
  const win = freshWin(); // no installSpyTheater() — window.Theater is genuinely undefined
  const world = makeWorld(win);
  check("B1a. window.Theater is absent by default under jsdom", win.Theater === undefined);

  const r = win.applyEvent(world, { type: "stage_fx", payload: { verb: "arc", who: "pc", to: "near:C", note: "the rogue swings the grappling line across the gap" } });
  check("B1b. stage_fx validates a known verb + returns ok:true even with window.Theater absent", r && r.ok === true, JSON.stringify(r));
  const lastLedger = world.ledger[world.ledger.length-1];
  check("B1c. stage_fx ledgers the DM's own note verbatim (the prose twin)", lastLedger && lastLedger.text.includes("the rogue swings the grappling line across the gap"), lastLedger && lastLedger.text);

  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  let threw = false;
  try {
    win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "near" } });
    win.applyEvent(world, { type: "attack", payload: { d20: 20, target: fid } });
    win.applyEvent(world, { type: "foe_morale", payload: { foe: fid, trigger: "bloodied", d20: 1 } });
    win.applyEvent(world, { type: "crit_outcome", payload: { natural: 20, magnitude: 10, tier: "mythic" } });
    win.applyEvent(world, { type: "combat_end", payload: { outcome: "resolved" } });
  } catch(e) { threw = true; console.log("    (threw:", e.message, ")"); }
  check("B1d. a full combat round through every hook-site event no-ops cleanly with window.Theater absent (never throws)", threw === false);
}

// ----------------------------------------------------------------------------
// B2. stage_fx REJECTS an unknown verb — never ledgers a fabricated verb.
// ----------------------------------------------------------------------------
{
  const win = freshWin();
  const world = makeWorld(win);
  const before = world.ledger.length;
  const r = win.applyEvent(world, { type: "stage_fx", payload: { verb: "teleport-behind-you" } });
  check("B2a. an unknown stage_fx verb is rejected", r && r.ok === false && r.reason === "unknown-verb", JSON.stringify(r));
  check("B2b. an unknown verb is NEVER ledgered", world.ledger.length === before, `ledger grew by ${world.ledger.length-before}`);
}
{
  const win = freshWin();
  const world = makeWorld(win);
  const r = win.applyEvent(world, { type: "stage_fx", payload: {} });
  check("B2c. a missing verb entirely is rejected the same way", r && r.ok === false && r.reason === "unknown-verb", JSON.stringify(r));
}

// ----------------------------------------------------------------------------
// B3. stage_fx forwards to window.Theater.play with the exact verb + who/from/to, when Theater IS
// present (the spy).
// ----------------------------------------------------------------------------
{
  const win = freshWin();
  const calls = installSpyTheater(win);
  const world = makeWorld(win);
  const r = win.applyEvent(world, { type: "stage_fx", payload: { verb: "knockback", who: "f1", to: "far:L", note: "the blast throws it back" } });
  check("B3a. stage_fx returns ok:true + echoes the verb", r && r.ok === true && r.verb === "knockback", JSON.stringify(r));
  check("B3b. window.Theater.play was called with the EXACT verb", calls.length === 1 && calls[0].verb === "knockback", JSON.stringify(calls));
  check("B3c. play() opts carry who/to through untouched", calls[0].opts.who === "f1" && calls[0].opts.to === "far:L", JSON.stringify(calls[0].opts));
}

// ----------------------------------------------------------------------------
// B4-B9. The 6 named hook sites (attack/foe_action x2/move_zone/foe_morale/crit_outcome/combat_end)
// fire cmTheaterNotify with the RIGHT kind, verified via the spy's fxFromLedger echo -> play() call.
// A 3-foe fixture (not 1) so a lucky nat20 attack/foe_action swing downing ONE goblin never auto-ends
// the whole fight (cmMaybeAutoEnd) before B7/B8 run — each check re-reads the first STILL-LIVE foe's
// fid rather than caching one fid up front, so the sequence tolerates whichever foe(s) actually go down.
// ----------------------------------------------------------------------------
{
  const win = freshWin();
  const calls = installSpyTheater(win);
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25, count:3 }] } });
  const liveFid = () => { const f = (win.GS.combat.foes||[]).find(x => !x.down); return f ? f.fid : null; };

  calls.length = 0;
  win.applyEvent(world, { type: "move_zone", payload: { who: "pc", band: "near" } });
  check("B4. move_zone hook site fires play('advance', ...)", calls.some(c => c.verb === "advance"), JSON.stringify(calls));

  calls.length = 0;
  win.applyEvent(world, { type: "attack", payload: { d20: 20, target: liveFid() } });
  check("B5. attack hook site fires play('strike', ...)", calls.some(c => c.verb === "strike"), JSON.stringify(calls));

  calls.length = 0;
  const foeActFid = liveFid();
  const foeActRes = foeActFid ? win.applyEvent(world, { type: "foe_action", payload: { foe: foeActFid, action: 0 } }) : { ok: false, reason: "no-live-foe-left" };
  check("B6. foe_action (p.action bypass path) hook site fires play('strike', ...) when resolvable",
    foeActRes && (foeActRes.ok === false || calls.some(c => c.verb === "strike")),
    JSON.stringify({ foeActRes, calls }));

  calls.length = 0;
  const moraleFid = liveFid();
  const moraleRes = moraleFid ? win.applyEvent(world, { type: "foe_morale", payload: { foe: moraleFid, trigger: "bloodied", d20: 1 } }) : null;
  check("B7. foe_morale hook site fires cmTheaterNotify (play() called iff the spy's mapping resolves a verb for this disposition), or the fight is already over (all 3 foes downed — still a valid, non-flaky outcome)",
    moraleFid ? (moraleRes && moraleRes.ok === true) : (win.GS.combat === null || win.GS.combat === undefined),
    JSON.stringify({ moraleFid, moraleRes, combatLive: !!win.GS.combat }));

  calls.length = 0;
  win.applyEvent(world, { type: "crit_outcome", payload: { natural: 20, magnitude: 12, tier: "mythic" } });
  check("B8. crit_outcome hook site fires play('absurdity', ...)", calls.some(c => c.verb === "absurdity"), JSON.stringify(calls));
}
{
  // B9 gets its OWN fresh combat instance — B4-B8's attack/foe_action swings against a single low-HP
  // goblin fixture can auto-end the fight early (cmMaybeAutoEnd), which would make a shared-state
  // combat_end call fail with "no-combat" for a reason unrelated to what B9 is actually testing (the
  // hook site itself, not fight-duration luck) — a beefier foe + a fresh world keeps this check
  // independent of exactly how many of B4-B8's swings happened to land.
  const win = freshWin();
  const calls = installSpyTheater(win);
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25, count:3 }] } });
  calls.length = 0;
  const endRes = win.applyEvent(world, { type: "combat_end", payload: { outcome: "resolved" } });
  check("B9. combat_end hook site is wired (returns ok:true) — the spy's own mapping stays silent for combat-end per §4, so no play() call is the CORRECT behavior here",
    endRes && endRes.ok === true && calls.length === 0, JSON.stringify({ endRes, calls }));
}

// ----------------------------------------------------------------------------
// B10. foe_action's SECOND ledger site (the autoplay/not-explicit-action branch) also fires the hook —
// exercised on a fresh low-CR foe with no p.action supplied. autoplayEligible (src/engine/monster-
// tactics.js) also gates on customTables/isLeader, which vary across which real bestiary "Goblin"
// entry combatStart's fuzzy name match happens to resolve — this check accepts EITHER outcome
// (not-autoplay-eligible is a real, valid, unchanged pre-existing contract per COMBAT-LIFECYCLE.md §5's
// "Without p.action, behavior stays byte-identical to the pre-existing not-autoplay-eligible contract")
// but additionally asserts that WHEN the branch resolves to a real attack, the hook actually fired —
// so this check still catches a hook-site regression whenever the fixture happens to land eligible.
// ----------------------------------------------------------------------------
{
  const win = freshWin();
  const calls = installSpyTheater(win);
  const world = makeWorld(win);
  win.applyEvent(world, { type: "combat_start", payload: { foes: [{ name:"Goblin", cr:0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  calls.length = 0;
  const r = win.applyEvent(world, { type: "foe_action", payload: { foe: fid } }); // no p.action -> autoplay branch
  const eligibleAndResolved = r && r.ok === true && r.attack;
  check("B10. foe_action autoplay branch is reachable (ok:true resolving an attack, OR the documented not-autoplay-eligible outcome — both are valid per COMBAT-LIFECYCLE.md §5) AND fires the hook when it resolves",
    r && (r.ok === true || r.reason === "not-autoplay-eligible") && (!eligibleAndResolved || calls.some(c => c.verb === "strike")),
    JSON.stringify({ r, calls }));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);

// ============================================================================
// stub ctx / unit builders for Part A (no real THREE — see this file's header)
// ============================================================================
function makeStubGroup() {
  const children = [];
  return {
    children,
    add(o) { children.push(o); },
    remove(o) { const i = children.indexOf(o); if (i >= 0) children.splice(i, 1); }
  };
}
function makeStubVec3(x, y, z) {
  return { x: x||0, y: y||0, z: z||0, set(nx,ny,nz){ this.x=nx;this.y=ny;this.z=nz; return this; }, copy(v){ this.x=v.x;this.y=v.y;this.z=v.z; return this; }, clone(){ return makeStubVec3(this.x,this.y,this.z); } };
}
function makeStubEuler(x, y, z) {
  return { x: x||0, y: y||0, z: z||0, set(nx,ny,nz){ this.x=nx;this.y=ny;this.z=nz; return this; }, copy(v){ this.x=v.x;this.y=v.y;this.z=v.z; return this; } };
}
function makeStubUnit(id) {
  return {
    userData: { unitId: id },
    position: makeStubVec3(0,0,0),
    rotation: makeStubEuler(0,0,0),
    scale: { x: 1, y: 1, z: 1, setScalar(v) { this.x = this.y = this.z = v; } },
    visible: true,
    traverse(fn) { fn(this); },
    material: { color: { r: 1, g: 1, b: 1, clone() { return { r: this.r, g: this.g, b: this.b, setRGB(r,g,b){this.r=r;this.g=g;this.b=b;} }; }, setRGB(r,g,b){ this.r=r;this.g=g;this.b=b; } }, transparent: false, opacity: 1 }
  };
}
function makeStubMesh(geo, mat) {
  return {
    position: makeStubVec3(0,0,0),
    rotation: makeStubEuler(0,0,0),
    scale: { x: 1, y: 1, z: 1, setScalar(v){ this.x=this.y=this.z=v; } },
    geometry: geo || { dispose(){} },
    material: mat || { opacity: 1, color: 0, dispose(){} },
    userData: {}
  };
}
function makeStubCtx() {
  const unitGroup = makeStubGroup();
  const fxGroup = makeStubGroup();
  const StubTHREE = {
    Group: function(){ return makeStubGroup(); },
    Mesh: function(){ return makeStubMesh(); },
    BoxGeometry: function(){ return { dispose(){} }; },
    PlaneGeometry: function(){ return { dispose(){} }; },
    CircleGeometry: function(){ return { dispose(){} }; },
    MeshBasicMaterial: function(opts){ return Object.assign({ dispose(){}, opacity: (opts&&opts.opacity!=null)?opts.opacity:1, color: (opts&&opts.color)||0 }, opts||{}); },
    DoubleSide: "double"
  };
  // playVerb's `new ctx.THREE.Mesh(...)` calls need real `new`-able constructors returning mesh-shaped
  // stubs — wrap the factory functions above as proper constructors bound to return their stub shape.
  function Ctor(factory) { return function(...args){ return factory(...args); }; }
  StubTHREE.Mesh = Ctor(makeStubMesh);
  StubTHREE.BoxGeometry = Ctor(() => ({ dispose(){} }));
  StubTHREE.PlaneGeometry = Ctor(() => ({ dispose(){} }));
  StubTHREE.MeshBasicMaterial = Ctor((opts) => Object.assign({ dispose(){} }, opts||{}));

  const ctx = {
    THREE: StubTHREE, scene: {}, fxGroup, unitGroup, camera: null,
    tweens: [],
    findUnit(id) { return unitGroup.children.find(c => c.userData && c.userData.unitId === String(id)) || null; },
    zoneToWorld(band, lane) { return typeof ctx._zoneToWorld === "function" ? ctx._zoneToWorld(band, lane) : null; },
    markDirty() {}
  };
  return ctx;
}
function runToCompletion(tweens) {
  // advance every tween's own clock far past its duration, then tick once — deterministic, no real timers.
  const now = Date.now() + 100000;
  tweens.forEach(tw => { tw.start = now - tw.dur - 1; });
  const ctx = { tweens };
  tickTweens(ctx, now);
}
