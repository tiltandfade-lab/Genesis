/* Verify CONCENTRATION (docs/SRD-MECHANIZATION.md §2) + the full spell index. Pure Node (vm) for the
   engine math; a jsdom section for the applyEvent wiring (cast / concentration_start / concentration_broken
   / hp_changed damage-save). Covers:
     - the FULL 339-spell index generated correctly (concentration/ritual flags, save shape, by-name lookup)
     - recast auto-drops the prior concentration
     - the damage-save DC math: max(10, floor(damage/2)) — the boundary
     - concentrationDamageSave breaks on a failed CON save, holds on a success (player's open d20)
     - 0-HP auto-break + incapacitating-condition auto-break
     - ritual eligibility off the index
     - integration: `cast{concentration}` drops prior; a ritual cast adds 10 min + skips the slot;
       hp_changed to a concentrating PC surfaces the required save / auto-breaks at 0 HP
     - HQ3-C5 (SET-06-F2/SET-08-F3) lifecycle + visibility:
       - spellDurationMinutes(name) boundary table (minute/hour/round parsing + the unindexed default)
       - concentrationTick: advanceClock past the stamped duration auto-breaks (cause "duration") +
         ledgers it; short of the duration, holds
       - concentrationRestClear: a completed long rest clears active concentration (cause "long-rest")
       - the digest ships pc.concentration {spell,sinceDay,sinceMin,expiresInMin}, omitted when not
         concentrating

   Run:  node dev/verify-concentration.mjs */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf-8");
let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// ── engine context (vm) ─────────────────────────────────────────────────────────
const SKILL_ABILITY_SRC = "const " + read("data/srd-creator.js").match(/SKILL_ABILITY=\{[^}]*\};/)[0];
const ctx = { console };
vm.createContext(ctx);
vm.runInContext(read("data/spells.js") + "\n" + SKILL_ABILITY_SRC + "\n" + read("src/engine/core.js") + "\n" +
  read("src/engine/combat.js") + "\n" + read("src/engine/check.js") + "\n" +
  read("src/engine/conditions.js") + "\n" + read("src/engine/concentration.js") +
  "\n;globalThis.__api={SPELLS,SPELLS_BY_NAME,spellIndexByName,spellIsConcentration,spellDurationMinutes,startConcentration," +
  "breakConcentration,isConcentrating,concentrationSaveDC,concentrationDamageSave,concentrationAutoBreak,ritualEligible," +
  "concentrationTick,concentrationRestClear};", ctx);
const A = ctx.__api;

// ── A. the FULL spell index ──────────────────────────────────────────────────────
check("index: 339 spells", A.SPELLS.length === 339);
check("index: fireball is level 3, non-concentration, DEX save", (() => { const s = A.spellIndexByName("Fireball"); return s && s.level === 3 && s.concentration === false && s.save && s.save.ability === "dex"; })());
check("index: hold person is concentration + WIS save", (() => { const s = A.spellIndexByName("Hold Person"); return s && s.concentration === true && s.save.ability === "wis"; })());
check("index: bless is concentration", A.spellIndexByName("Bless").concentration === true);
check("index: alarm is a ritual", A.spellIndexByName("Alarm").ritual === true);
check("index: normalized lookup folds a curly apostrophe / case", A.spellIndexByName("MAGE HAND") != null);
check("index: unindexed name → null (graceful)", A.spellIndexByName("Xyzzy's Spurious Bolt") === null);
check("spellIsConcentration reads the flag", A.spellIsConcentration("Bless") === true && A.spellIsConcentration("Fireball") === false);

// ── B. start / recast auto-drop ──────────────────────────────────────────────────
const sh = { mods: { con: 2 }, profBonus: 2, saveProfs: ["con"], hpCur: 20, hp: 20 };
const s1 = A.startConcentration(sh, "Bless", 1);
check("start: sets sh.concentration, nothing dropped", A.isConcentrating(sh) && sh.concentration.spell === "Bless" && s1.dropped === null);
const s2 = A.startConcentration(sh, "Hold Person", 2);
check("recast: auto-drops the prior (Bless), sets the new (Hold Person)", s2.dropped === "Bless" && sh.concentration.spell === "Hold Person");

// ── C. damage-save DC math (the max(10, floor(dmg/2)) boundary) ──────────────────
check("saveDC: 10 damage → floor 5, but min 10", A.concentrationSaveDC(10) === 10);
check("saveDC: 18 damage → floor 9, but min 10", A.concentrationSaveDC(18) === 10);
check("saveDC: 20 damage → floor 10 (the boundary where it exceeds 10)", A.concentrationSaveDC(20) === 10);
check("saveDC: 22 damage → 11", A.concentrationSaveDC(22) === 11);
check("saveDC: 30 damage → 15", A.concentrationSaveDC(30) === 15);
check("saveDC: 0 damage → 10 floor", A.concentrationSaveDC(0) === 10);

// ── D. concentrationDamageSave — break on fail, hold on success (player's open d20) ─
const dh = { mods: { con: 3 }, profBonus: 2, saveProfs: ["con"], hpCur: 30, hp: 30, concentration: { spell: "Bless", castRound: 1 } };
const good = A.concentrationDamageSave(dh, 10, { d20: 15 });  // DC 10, 15+3+2=20 → success
check("damageSave: a successful CON save HOLDS concentration", good.required && !good.broken && A.isConcentrating(dh));
const bad = A.concentrationDamageSave(dh, 30, { d20: 3 });    // DC 15, 3+3+2=8 → fail
check("damageSave: a FAILED CON save BREAKS concentration", bad.required && bad.broken && bad.spell === "Bless" && !A.isConcentrating(dh));
const none = A.concentrationDamageSave({ mods: {} }, 10, { d20: 20 });
check("damageSave: not concentrating → no save required", none.required === false);

// ── E. auto-break: 0 HP + incapacitating condition ──────────────────────────────
const zh = { mods: { con: 2 }, hpCur: 0, hp: 20, concentration: { spell: "Bless" }, conditions: [] };
check("autoBreak: 0 HP breaks concentration", A.concentrationAutoBreak(zh).broken === true && !A.isConcentrating(zh));
const ih = { mods: { con: 2 }, hpCur: 15, hp: 20, concentration: { spell: "Bless" }, conditions: [{ condition: "stunned", ttl: { rounds: 1 } }] };
check("autoBreak: an incapacitating condition (stunned) breaks concentration", A.concentrationAutoBreak(ih, ih).broken === true && !A.isConcentrating(ih));
const fine = { mods: { con: 2 }, hpCur: 15, hp: 20, concentration: { spell: "Bless" }, conditions: [{ condition: "poisoned", ttl: { rounds: 1 } }] };
check("autoBreak: a non-incapacitating condition (poisoned) does NOT break", A.concentrationAutoBreak(fine, fine).broken === false && A.isConcentrating(fine));

// ── F. ritual eligibility ────────────────────────────────────────────────────────
check("ritual: Alarm is ritual-eligible", A.ritualEligible("Alarm") === true);
check("ritual: Fireball is NOT ritual-eligible", A.ritualEligible("Fireball") === false);

// ── F2. HQ3-C5 — spellDurationMinutes boundary table (verified against the real data/spells.js text,
//        not the spec's illustrative numbers — "Dominate Person" reads "Concentration, up to 1 minute"
//        in the actual index, so 1 is the true value here, not the spec's example) ─────────────────────
check("duration: Hold Person (1 minute) → 1", A.spellDurationMinutes("Hold Person") === 1);
check("duration: Bless (1 minute) → 1", A.spellDurationMinutes("Bless") === 1);
check("duration: Detect Magic (10 minutes) → 10", A.spellDurationMinutes("Detect Magic") === 10);
check("duration: Suggestion (8 hours) → 480", A.spellDurationMinutes("Suggestion") === 480);
check("duration: Tsunami (6 rounds) → ceil(6*6/60)=1 (min-1 floor)", A.spellDurationMinutes("Tsunami") === 1);
check("duration: an unindexed/unparseable name → the 10-min default", A.spellDurationMinutes("Xyzzy's Spurious Bolt") === 10);

// ── F3. HQ3-C5 — concentrationTick: clock-expiry auto-break (vm-level, a hand-built minimal world) ──
function tickWorld(clock, sh) {
  return { characters: [{ status: "living", name: "Caster", sheet: sh }], clock, ledger: [] };
}
// stub the call-time deps concentrationTick/concentrationRestClear reach for (clockOf/addLedger) —
// this vm context never loaded src/world/state.js, so they don't exist without this shim.
ctx.clockOf = (w) => w.clock;
ctx.addLedger = (w, type, data, text) => { w.ledger.push({ type, data, text }); return w.ledger[w.ledger.length - 1]; };
const w1 = tickWorld({ day: 1, min: 0 }, { concentration: { spell: "Bless", sinceDay: 1, sinceMin: 0, durationMin: 1 } });
const notYet = A.concentrationTick(w1);
check("concentrationTick: elapsed < duration → holds", A.isConcentrating(w1.characters[0].sheet) && !notYet.expired);
w1.clock.min = 10; // 10 min elapsed, duration was 1 → expires
const expired = A.concentrationTick(w1);
check("concentrationTick: elapsed >= duration → auto-breaks (cause duration)", expired.expired === true && expired.spell === "Bless" && !A.isConcentrating(w1.characters[0].sheet));
check("concentrationTick: ledgers the lapse", w1.ledger.some(e => e.data.kind === "concentration" && e.data.cause === "duration" && e.data.broken === true));
const w2 = tickWorld({ day: 1, min: 5 }, { concentration: { spell: "Hold Person", sinceDay: 1, sinceMin: 0, durationMin: 30 } });
const held = A.concentrationTick(w2);
check("concentrationTick: well short of duration → not expired", held.expired === false && A.isConcentrating(w2.characters[0].sheet));
const w3 = tickWorld({ day: 1, min: 0 }, {}); // not concentrating at all
check("concentrationTick: not concentrating → no-op", A.concentrationTick(w3).expired === false);

// ── F4. HQ3-C5 — concentrationRestClear: a completed long rest clears active concentration ─────────
const w4 = tickWorld({ day: 2, min: 480 }, { concentration: { spell: "Bless", sinceDay: 2, sinceMin: 0, durationMin: 480 } });
const restingPC = { name: "Caster", sheet: w4.characters[0].sheet };
const restClear = A.concentrationRestClear(w4, restingPC);
check("concentrationRestClear: breaks an ACTIVE concentration (cause long-rest)", restClear.broken === true && restClear.spell === "Bless" && !A.isConcentrating(restingPC.sheet));
check("concentrationRestClear: ledgers the long-rest clear", w4.ledger.some(e => e.data.kind === "concentration" && e.data.cause === "long-rest" && e.data.broken === true));
const w5 = tickWorld({ day: 2, min: 480 }, {});
check("concentrationRestClear: not concentrating → no-op, no ledger line", A.concentrationRestClear(w5, { name: "Caster", sheet: w5.characters[0].sheet }).broken === false && w5.ledger.length === 0);

// ── G. INTEGRATION through applyEvent (jsdom full load) ───────────────────────────
const JSDOM_HOME = process.env.JSDOM_HOME || join(process.env.HOME, ".genesis-jsdom");
const { JSDOM } = createRequire(join(JSDOM_HOME, "package.json"))("jsdom");
const man = JSON.parse(read("manifest.json"));
const srcAll = man.loadOrder.filter((p) => p.endsWith(".js")).map(read).join("\n;\n");
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
dom.window.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + srcAll);
const win = dom.window;
const world = {
  id: "w-conc", name: "Conc Test", gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 360 },
  // dmlog non-empty ⇒ dmDigest's foundingTurn is false — sidesteps needing a full `seed` shape (§H
  // below is the only caller of dmDigest here; this harness isn't testing the founding-turn setting slice).
  map: { nodes: {}, edges: [] }, currentNodeId: null, revealed: {}, dmlog: [{ t: 0 }], pressures: [], factions: [],
  characters: [{ status: "living", name: "Caster", conditions: [],
    sheet: { class: "Cleric", level: 5, xp: 0, mods: { con: 2, wis: 3 }, profBonus: 3, saveProfs: ["wis", "con"], hp: 30, hpCur: 30, spellAbility: "wis", slots: [3, 3, 2, 0, 0, 0, 0, 0, 0], slotsMax: [3, 3, 2, 0, 0, 0, 0, 0, 0] } }],
};
win.U.worlds[world.id] = world; win.U.activeWorldId = world.id;
const sheet = world.characters[0].sheet;

win.applyEvent(world, { type: "cast", payload: { spell: "Bless", concentration: true, level: 1 }, source: "declared" });
check("integration: cast{concentration} sets sh.concentration + spends the slot", sheet.concentration && sheet.concentration.spell === "Bless" && sheet.slots[0] === 2);
const recast = win.applyEvent(world, { type: "cast", payload: { spell: "Hold Person", concentration: true, level: 2 }, source: "declared" });
check("integration: recasting drops the prior concentration (Bless)", recast.droppedConcentration === "Bless" && sheet.concentration.spell === "Hold Person");
// HQ3-C5: the recast also stamped the clock + Hold Person's real 1-min duration — verify BEFORE any
// further clock advance (the ritual cast below moves the clock +10 min, which would otherwise lapse it
// via concentrationTick; that ordering dependency is exactly why these hp_changed checks run first).
check("integration: startConcentration stamped the clock + parsed duration", sheet.concentration.sinceDay === world.clock.day && sheet.concentration.sinceMin === world.clock.min && sheet.concentration.durationMin === 1);
// hp_changed to a concentrating PC surfaces the required save
const dmgRes = win.applyEvent(world, { type: "hp_changed", payload: { delta: -12 }, source: "declared" });
check("integration: damage to a concentrating PC surfaces the CON save (DC 10)", dmgRes.concentrationSave && dmgRes.concentrationSave.dc === 10 && dmgRes.concentrationSave.ability === "con");
// dropping to exactly 0 HP (non-massive) auto-breaks concentration + starts death saves
const downRes = win.applyEvent(world, { type: "hp_changed", payload: { delta: -18 }, source: "declared" });
check("integration: dropping to 0 HP auto-breaks concentration", downRes.concentrationBroken && downRes.concentrationBroken.cause === "0-hp" && !sheet.concentration);
check("integration: dropping to 0 HP starts the death-save tracker (§4)", downRes.deathSavesStarted === true && sheet.deathSaves && sheet.deathSaves.fail === 0);

// a ritual cast: +10 min, no slot spend (concentration is already null here — nothing to lapse)
const day0min = world.clock.min, slotsL1 = sheet.slots[0];
win.applyEvent(world, { type: "cast", payload: { spell: "Alarm", ritual: true }, source: "declared" });
check("integration: a ritual cast adds 10 minutes + skips the slot", world.clock.min === day0min + 10 && sheet.slots[0] === slotsL1);

// ── H. HQ3-C5 — clock-expiry via the REAL advanceClock hook (state.js) + digest visibility ─────────
sheet.hpCur = sheet.hp; // heal back up so a fresh concentration cast is meaningful
win.applyEvent(world, { type: "cast", payload: { spell: "Bless", concentration: true, level: 1 }, source: "declared" });
check("integration H: pc.concentration ships on the digest while concentrating", (() => {
  const d = win.dmDigest();
  return d && d.pc && d.pc.concentration && d.pc.concentration.spell === "Bless" && typeof d.pc.concentration.expiresInMin === "number";
})());
win.advanceClock(world, 600); // Bless is 1 min — 600 min blows well past it
check("integration H: advanceClock past duration auto-breaks concentration (real hook, not the vm stub)", !sheet.concentration);
check("integration H: the lapse is ledgered", world.ledger.some(e => e.data && e.data.kind === "concentration" && e.data.cause === "duration"));
check("integration H: the digest omits pc.concentration once not concentrating", win.dmDigest().pc.concentration === undefined);

// a completed long rest clears concentration (restRiders → concentrationRestClear). Stub restRiskRoll
// to force a non-interrupted roll — deterministic, matching the spec's stub-the-risk-roll harness note.
win.applyEvent(world, { type: "cast", payload: { spell: "Bless", concentration: true, level: 1 }, source: "declared" });
check("integration H: concentrating again ahead of the rest test", !!sheet.concentration);
const realRestRiskRoll = win.restRiskRoll;
win.restRiskRoll = () => ({ ok: true, class: "camp", text: "quiet", band: "green", severe: false, interrupted: false });
win.restRiders(world, { restKind: "long", dayScale: 0, via: "test" });
win.restRiskRoll = realRestRiskRoll;
check("integration H: a completed (non-interrupted) long rest clears concentration", !sheet.concentration);

// HQ3-C5 item 7 — the voluntary-drop path (concentration_broken{cause:"ended"}) ALREADY EXISTS; confirm
// (not rebuild) it still works after this unit's edits.
win.applyEvent(world, { type: "cast", payload: { spell: "Bless", concentration: true, level: 1 }, source: "declared" });
const voluntary = win.applyEvent(world, { type: "concentration_broken", payload: { cause: "ended" }, source: "declared" });
check("integration H: concentration_broken{cause:\"ended\"} — the voluntary-drop path — still works unchanged", voluntary.ok === true && !sheet.concentration);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
