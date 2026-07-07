/* Verify DEATH SAVES + TEMP HP + MASSIVE DAMAGE (docs/SRD-MECHANIZATION.md §4). Pure Node (vm) for the
   engine math; a jsdom section for the applyEvent wiring (hp_changed / death_save / temp_hp). Covers:
     - 3-success / 3-fail boundaries; nat 20 = revive+1hp+clear; nat 1 = two fails
     - damage-at-0 auto-fail (one, or two on a crit/melee-adjacent)
     - a heal above 0 clears the tracker
     - 3-fail routes to "dead" (the caller hands off to Death & Rebirth via killCharacter)
     - massive-damage instant death (overkill ≥ maxHp), skipping death saves entirely
     - temp HP: absorbs damage FIRST, does NOT stack (takes the higher), doesn't heal, cleared on a long rest
     - integration: hp_changed → starts tracker at 0 HP; death_save event; temp_hp event; rest clears temp HP

   Run:  node dev/verify-death-saves.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── engine context (vm) — death.js needs applyHpDelta (engine.resources) at call-time ──
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(read("src/engine/resources.js") + "\n" + read("src/engine/death.js") +
  "\n;globalThis.__api={startDeathSaves,clearDeathSaves,resolveDeathSave,autoFailDeathSave," +
  "grantTempHp,clearTempHp,applyDamageWithTemp,isMassiveDamage,applyHpDelta};", ctx);
const A = ctx.__api;

// ── A. tracker lifecycle ─────────────────────────────────────────────────────────
{
  const sh = {};
  const t = A.startDeathSaves(sh);
  check("startDeathSaves: initializes {succ:0,fail:0}", t.succ === 0 && t.fail === 0 && sh.deathSaves === t);
  const t2 = A.startDeathSaves(sh);
  check("startDeathSaves: idempotent (doesn't reset an in-progress sequence)", t2 === t);
  A.clearDeathSaves(sh);
  check("clearDeathSaves: nulls the tracker", sh.deathSaves === null);
}

// ── B. resolveDeathSave — boundaries ─────────────────────────────────────────────
{
  const sh = { hp: 20 };
  const r1 = A.resolveDeathSave(sh, 12);
  check("d20=12 (>=10) → success, continue", r1.outcome === "success" && r1.succ === 1 && r1.fail === 0);
  const r2 = A.resolveDeathSave(sh, 9);
  check("d20=9 (<10) → fail", r2.outcome === "fail" && r2.succ === 1 && r2.fail === 1);
}
{
  const sh = { hp: 20 };
  const r = A.resolveDeathSave(sh, 1);
  check("nat 1 → TWO fails in one roll", r.fail === 2 && r.outcome === "fail");
}
{
  const sh = { hp: 20, hpCur: 0 };
  const r = A.resolveDeathSave(sh, 20);
  check("nat 20 → revive: +1 HP, clears tracker, outcome 'revived'", r.outcome === "revived" && r.hpCur === 1 && sh.deathSaves === null);
}
{
  // 3 successes → stable
  const sh = { hp: 20 };
  A.resolveDeathSave(sh, 15); A.resolveDeathSave(sh, 11);
  const r = A.resolveDeathSave(sh, 18);
  check("3rd success → stable, tracker clears", r.outcome === "stable" && r.succ === 3 && sh.deathSaves === null);
}
{
  // 3 failures → dead
  const sh = { hp: 20 };
  A.resolveDeathSave(sh, 5); A.resolveDeathSave(sh, 2);
  const r = A.resolveDeathSave(sh, 8);
  check("3rd failure → dead", r.outcome === "dead" && r.fail === 3);
}
{
  // mixed nat-1 pushing straight to dead from 1 prior fail
  const sh = { hp: 20 };
  A.resolveDeathSave(sh, 4);              // 1 fail
  const r = A.resolveDeathSave(sh, 1);    // nat 1 = +2 fails → 3 total → dead
  check("a nat-1 that crosses the 3-fail line → dead immediately", r.outcome === "dead" && r.fail === 3);
}

// ── C. damage-at-0 auto-fail (one; two on crit/melee-adjacent) ──────────────────
{
  const sh = { hp: 20 };
  A.startDeathSaves(sh);
  const r1 = A.autoFailDeathSave(sh, {});
  check("damage at 0 HP: plain auto-fail = 1", r1.fail === 1 && r1.outcome === "fail");
  const r2 = A.autoFailDeathSave(sh, { crit: true });
  check("damage at 0 HP: a CRIT auto-fail = 2 more (total 3) → dead", r2.fail === 3 && r2.outcome === "dead");
}
{
  const sh = { hp: 20 };
  A.startDeathSaves(sh);
  const r = A.autoFailDeathSave(sh, { meleeAdjacent: true });
  check("damage at 0 HP: melee-adjacent auto-fail = 2", r.fail === 2);
}

// ── D. MASSIVE DAMAGE instant death ──────────────────────────────────────────────
check("isMassiveDamage: overkill >= maxHp → true", A.isMassiveDamage(20, 20) === true);
check("isMassiveDamage: overkill 19 < maxHp 20 → false", A.isMassiveDamage(19, 20) === false);
check("isMassiveDamage: overkill 0 → false", A.isMassiveDamage(0, 20) === false);
check("isMassiveDamage: maxHp 0 (defensive) → false", A.isMassiveDamage(50, 0) === false);

// ── E. TEMP HP — absorb-first, no-stack, doesn't heal, cleared on long rest ──────
{
  const sh = { hp: 20, hpCur: 20 };
  const g1 = A.grantTempHp(sh, 5);
  check("grantTempHp: sets tempHp to 5", g1.to === 5 && sh.tempHp === 5);
  const g2 = A.grantTempHp(sh, 3);
  check("grantTempHp: does NOT stack — a lower grant is ignored (stays 5)", g2.to === 5 && sh.tempHp === 5);
  const g3 = A.grantTempHp(sh, 8);
  check("grantTempHp: a HIGHER grant replaces (not adds) — 8, not 13", g3.to === 8 && sh.tempHp === 8);
}
{
  const sh = { hp: 20, hpCur: 20, tempHp: 5 };
  const r = A.applyDamageWithTemp(sh, 3);
  check("applyDamageWithTemp: damage under the temp pool is fully absorbed, hpCur unchanged", r.tempSpent === 3 && sh.tempHp === 2 && sh.hpCur === 20, JSON.stringify(r));
}
{
  const sh = { hp: 20, hpCur: 20, tempHp: 5 };
  const r = A.applyDamageWithTemp(sh, 12);
  check("applyDamageWithTemp: spends the whole temp pool then deducts the remainder from hpCur",
    r.tempSpent === 5 && sh.tempHp === 0 && sh.hpCur === 13, JSON.stringify(r));
}
{
  const sh = { hp: 10, hpCur: 5, tempHp: 0 };
  const r = A.applyDamageWithTemp(sh, 20);
  check("applyDamageWithTemp: overkill computed correctly (20 dmg vs 5 hp → overkill 15)", r.overkill === 15 && sh.hpCur === 0, JSON.stringify(r));
  check("applyDamageWithTemp: droppedTo0 reported", r.droppedTo0 === true);
}
{
  const sh = { hp: 20, hpCur: 20, tempHp: 9 };
  A.clearTempHp(sh);
  check("clearTempHp: zeroes the pool (a long rest doesn't carry temp HP)", sh.tempHp === 0);
}

// ── F. INTEGRATION through applyEvent (jsdom full load) ──────────────────────────
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const man = JSON.parse(read("manifest.json"));
const srcAll = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div>
  <div class="modal-bg" id="bardoModal"><div class="modal bardo-modal"><div id="bardoBody"></div></div></div>
  </body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
dom.window.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcAll);
// HOTFIX-QUEUE-2026-07-07 orchestrator extension to HQ2-10 — flake-proofing: the "a long rest clears
// temp HP" check (below) drives applyEvent(rest:"long") -> restRiders -> restRiskRoll
// (src/world/wiring-a.js), which rolls a live Math.random() interruptChance gate; a severe+interrupted
// roll skips restRecover (incl. clearTempHp) entirely, found flaking ~5-10% during HQ2-2. Install a
// deterministic mulberry32 generator as the window's Math.random (idiom copied verbatim from
// dev/playtest-bridgeless.mjs's --seed path), seeded BEFORE any scenario in this section rolls, with
// the default seed chosen so the long-rest path lands non-interrupted (deterministic-green).
// --seed=<int> overrides.
const __seedArg = process.argv.find((a) => a.startsWith("--seed="));
const RNG_SEED = __seedArg ? (parseInt(__seedArg.slice(7), 10) >>> 0) || 1 : 20260707;
(function installSeededRandom(win, seed){
  let s = seed >>> 0;
  win.Math.random = () => {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})(dom.window, RNG_SEED);
const win = dom.window;
const world = {
  id: "w-death", name: "Death Test", gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 360 },
  map: { nodes: {}, edges: [] }, currentNodeId: null, revealed: {}, dmlog: [], pressures: [], factions: [],
  characters: [{ id: "hero1", status: "living", name: "Hero", conditions: [],
    sheet: { class: "Fighter", level: 5, xp: 0, mods: { con: 1 }, hp: 20, hpCur: 20 } }],
};
win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
const sheet = world.characters[0].sheet;

// dropping to 0 HP (non-massive) starts the tracker
win.applyEvent(world, { type: "hp_changed", payload: { delta: -20 }, source: "declared" });
check("integration: hp_changed to exactly 0 starts the death-save tracker", sheet.deathSaves && sheet.deathSaves.fail === 0, JSON.stringify(sheet.deathSaves));

// damage WHILE at 0 auto-fails
const autoR = win.applyEvent(world, { type: "hp_changed", payload: { delta: -1 }, source: "declared" });
check("integration: damage while already at 0 auto-fails (via hp_changed's wasDown branch)", autoR.deathSave && autoR.deathSave.fail === 1, JSON.stringify(autoR));

// a heal above 0 clears the tracker
win.applyEvent(world, { type: "hp_changed", payload: { delta: 5 }, source: "declared" });
check("integration: a heal above 0 clears the death-save tracker", sheet.deathSaves === null);

// death_save event: the player's open roll
sheet.hpCur = 0; win.applyEvent === win.applyEvent; // (no-op line to keep block shape consistent)
const dsRes = win.applyEvent(world, { type: "death_save", payload: { d20: 20 }, source: "declared" });
check("integration: death_save{d20:20} revives to 1 HP + clears tracker", dsRes.outcome === "revived" && sheet.hpCur === 1 && sheet.deathSaves === null);

// massive damage — instant death, skips saves entirely
sheet.hpCur = 20; sheet.hp = 20;
const massiveRes = win.applyEvent(world, { type: "hp_changed", payload: { delta: -45 }, source: "declared" });
check("integration: a 45-dmg hit on a 20-max-HP PC is massive damage → instant death (no tracker)", massiveRes.instantDeath === true && !sheet.deathSaves, JSON.stringify(massiveRes));

// killCharacter (Death & Rebirth) marks the old PC dead and expects a NEW living PC for play to
// continue — mint a fresh one (mirrors how the real flow proceeds) so the temp-HP/rest checks below
// have a living sheet to act on, same as any post-rebirth turn.
world.characters.push({ id: "hero2", status: "living", name: "Successor", conditions: [],
  sheet: { class: "Fighter", level: 1, xp: 0, mods: { con: 1 }, hp: 20, hpCur: 20 } });
const sheet2 = world.characters[world.characters.length - 1].sheet;

// temp_hp event
win.applyEvent(world, { type: "temp_hp", payload: { n: 6 }, source: "declared" });
check("integration: temp_hp{n:6} sets sh.tempHp", sheet2.tempHp === 6);
// damage now spends temp first
win.applyEvent(world, { type: "hp_changed", payload: { delta: -4 }, source: "declared" });
check("integration: hp_changed damage spends temp HP first (4 of 6 → tempHp 2, hpCur unchanged)", sheet2.tempHp === 2 && sheet2.hpCur === 20, JSON.stringify({tempHp:sheet2.tempHp,hpCur:sheet2.hpCur}));

// a long rest clears temp HP
win.applyEvent(world, { type: "rest", payload: { kind: "long" }, source: "declared" });
check("integration: a long rest clears temp HP", sheet2.tempHp === 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
