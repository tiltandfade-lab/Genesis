/* Verify the Critical-Magnitude engine (docs/CRIT-MAGNITUDE.md) — full-app jsdom load + compiled tables.js.
   Asserts: the band table (§1) maps natural+magnitude → tier/lensCount for both success and the INVERTED
   failure ladder; only nat 20/1 trigger; lenses are drawn DISTINCT from the right table; the row-1 place
   lens routes into the Myth suite (myth-seeds); Mythic flags canon; and the crit_outcome event writes the
   right Ledger line (canon for Mythic, outcome otherwise) through the real applyEvent runtime.

   Run:  node dev/verify-crit.mjs   (jsdom per-env in ~/.genesis-jsdom — see CLAUDE.md) */
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
const dom = new JSDOM(`<!doctype html><html><body><div id="worldView"></div></body></html>`,
  { runScripts: "dangerously", url: "http://localhost/" });
const win = dom.window;
win.eval(read("tables.js") + "\nvar U={worlds:{},activeWorldId:null,revealed:{}};\n" + src);

let pass = 0, fail = 0;
const check = (n, c, d = "") => c ? (pass++, console.log("  ✓", n)) : (fail++, console.log("  ✗", n, "—", d));

// globals present
check("tables.js has the lens + myth tables",
  win.GENESIS_TABLES && win.GENESIS_TABLES["mythic-success-lenses"] && win.GENESIS_TABLES["mythic-failure-lenses"] && win.GENESIS_TABLES["myth-seeds"]);
for (const f of ["rollCritMagnitude","critBand","critDrawLenses"]) check(`global ${f}`, typeof win[f] === "function");

// ── only nat 20/1 trigger ────────────────────────────────────────────────────
check("non-crit naturals return null", win.rollCritMagnitude(15) === null && win.rollCritMagnitude(2) === null);

// ── band table (§1) — success ladder. critBand is PURE (a range; the roller realizes the count). ──
const sB = (mag) => win.critBand(20, mag);
check("critBand is pure (no roll): same inputs → identical band", JSON.stringify(sB(17)) === JSON.stringify(sB(17)));
check("20 + 1–10 → standard, 0 lenses", sB(1).tier === "standard" && sB(10).lensMax === 0);
check("20 + 11–14 → amplified-minor, 1 lens", sB(11).tier === "amplified-minor" && sB(14).lensMin === 1 && sB(14).lensMax === 1);
check("20 + 15–19 → amplified-major, 2–3 lenses", sB(17).tier === "amplified-major" && sB(17).lensMin === 2 && sB(17).lensMax === 3);
check("20/20 → mythic cascade (3), planar, canon-tier", sB(20).tier === "mythic" && sB(20).lensMin === 3 && sB(20).lensMax === 3 && sB(20).scope === "planar" && sB(20).cascade === true);

// ── band table — failure ladder runs INVERTED (lower is worse) ───────────────
const fB = (mag) => win.critBand(1, mag);
check("1 + 11–20 → standard, 0 lenses", fB(20).tier === "standard" && fB(11).lensMax === 0);
check("1 + 7–10 → amplified-minor, 1 lens", fB(7).tier === "amplified-minor" && fB(10).lensMin === 1 && fB(10).lensMax === 1);
check("1 + 2–6 → amplified-major, 2–3 lenses", fB(3).tier === "amplified-major" && fB(3).lensMin === 2 && fB(3).lensMax === 3);
check("1/1 → mythic cascade (3), canon-tier", fB(1).tier === "mythic" && fB(1).lensMin === 3 && fB(1).lensMax === 3 && fB(1).cascade === true);

// the roller realizes the count within the band range (amplified-major → 2 or 3 across samples)
{ const counts = new Set();
  for (let i = 0; i < 60; i++) counts.add(win.rollCritMagnitude(20, { magnitude: 17 }).lensCount);
  check("amplified-major resolves to 2 OR 3 lenses across samples", [...counts].every(n => n === 2 || n === 3) && counts.size === 2); }

// ── full roll: standard crit draws no lenses ─────────────────────────────────
{ const r = win.rollCritMagnitude(20, { magnitude: 5 });
  check("standard success: 0 lenses, not canon", r.tier === "standard" && r.lenses.length === 0 && r.canon === false); }

// ── lenses are drawn DISTINCT, from the right table, mythic = canon ───────────
{ let allDistinct = true, fromSuccess = true;
  for (let i = 0; i < 40; i++) {
    const r = win.rollCritMagnitude(20, { magnitude: 20 });   // mythic success → 3 lenses
    const rows = r.lenses.map(l => l.row);
    if (new Set(rows).size !== rows.length) allDistinct = false;
    if (r.lenses.some(l => !l.lens)) fromSuccess = false;
    if (!r.canon) fromSuccess = false;
  }
  check("mythic success: 3 distinct lenses every time (no dupes)", allDistinct);
  check("mythic success: lenses populated + canon flagged", fromSuccess); }

// ── failure lenses come from the failure table (disjoint wording from success) ─
{ const succ = new Set(), fail_ = new Set();
  for (let i = 0; i < 40; i++) {
    win.rollCritMagnitude(20, { magnitude: 20 }).lenses.forEach(l => succ.add(l.lens));
    win.rollCritMagnitude(1,  { magnitude: 1  }).lenses.forEach(l => fail_.add(l.lens));
  }
  // the success table's row-2 "A person is permanently changed" must never appear among failure draws
  check("failure draws come from the failure table (not success)", ![...fail_].some(t => /permanently changed/.test(t || "")) && fail_.size > 0); }

// ── the place lens (row 1) routes into the Myth suite ────────────────────────
{ let sawHandoff = false, seededOnHandoff = true;
  for (let i = 0; i < 120 && !sawHandoff; i++) {
    const r = win.rollCritMagnitude(20, { magnitude: 20 });
    if (r.placeHandoff) { sawHandoff = true; if (!(r.mythSeed && r.mythSeed.text)) seededOnHandoff = false; }
  }
  check("a place-lens cascade eventually fires (row 1 reachable)", sawHandoff);
  check("place handoff rolls a myth-seed", seededOnHandoff); }

// ── crit_outcome event → Ledger (canon for Mythic, outcome otherwise) ────────
const w = { id: "wc", name: "Crit", ledger: [], clock: { day: 1, min: 360 }, gazetteer: [], factions: [], revealed: {} };
const myth = win.rollCritMagnitude(20, { magnitude: 20 });
const re1 = win.applyEvent(w, { type: "crit_outcome", payload: myth, source: "play" });
check("crit_outcome (mythic) returns canon:true", re1.ok && re1.canon === true);
check("crit_outcome (mythic) wrote a CANON ledger line", w.ledger.some(e => e.type === "canon" && e.data && e.data.kind === "crit" && /woven into the world/.test(e.text)));
const amp = win.rollCritMagnitude(1, { magnitude: 4 });   // amplified-major failure
const re2 = win.applyEvent(w, { type: "crit_outcome", payload: amp, source: "play" });
check("crit_outcome (amplified) returns canon:false", re2.ok && re2.canon === false);
check("crit_outcome (amplified) wrote an OUTCOME ledger line (not canon)", w.ledger.some(e => e.type === "outcome" && e.data && e.data.kind === "crit"));

// ══════════════════════════════════════════════════════════════════════════
// COMBAT CRITS JOIN THE MAGNITUDE SYSTEM (2026-07-03, Adam's ruling — "combat crits are still crits
// and the magnitude must be weighed — this is where it might actually matter the most!"). Red-first
// proofs per the wire spec: nat-20 attack carries magnitude; damage UNCHANGED by magnitude (the
// orthogonality proof — magnitude never adds damage); magnitude>=8 killing blow auto-obliterates
// (crit_outcome's own gate, now reachable from the attack path); nat-1 carries magnitude with no
// mechanical change (still a flat miss); non-crit attacks carry none.
// ══════════════════════════════════════════════════════════════════════════
console.log("\n=== combat crits join the magnitude system ===");

function makeCombatWorld(win){
  const world = {
    id: "w-combat-crit", name: "The Combat-Crit Test World",
    seed: { master: { name: "Test Redoubt", desc: "a place for asserting the seam" },
            smell:{name:"smoke"}, sound:{name:"wind"}, arch:{name:"stone"},
            taboo:{name:"t",desc:"d"}, myth:{name:"m",desc:"d"} },
    characters: [{ id: "c1", status: "living", name: "Borin Ashfist", headline: "a test soul", spark: "a test soul", pronouns: "he",
      sheet: {
        species: "Dwarf", class: "Barbarian", background: "Soldier", level: 5, xp: 6500,
        hp: 52, hpCur: 52, ac: 16, tempHp: 0,
        profBonus: 3, scores: { str: 18, con: 16, dex: 12 }, mods: { str: 4, con: 3, dex: 1 }, saveProfs: ["str","con"], skillProfs: ["Athletics"],
        passivePerception: 11, hitDie: "d12", gold: 20, feat: "Alert",
        conditions: [], exhaustion: 0, inspiration: false,
        cantrips: [], spells: [],
        inventory: [{ id:"w1", name:"Dagger", qty:1, conditions:[] }],
        equipped: { mainHand:"w1", offHand:null, armor:null }, pools: {},
      } }],
    gazetteer: [], log: [], ledger: [], clock: { day: 1, min: 480 }, session: 1,
    map: { nodes: {}, edges: [] }, currentNodeId: null,
    factions: [], pressures: [],
    revealed: { map: 1, powers: 1, ledger: 1, gaz: 1 }, dmlog: [],
  };
  const originId = win.addNode(world, "Test Redoubt", "Setting");
  world.currentNodeId = originId;
  win.U.worlds[world.id] = world;
  win.U.activeWorldId = world.id;
  win.GS.dm = { turnId: null, pending: false, poll: null, rollReq: null, ask: null, animate: false };
  win.GS.combat = null; win.GS.prevPanel = undefined; win.GS.chase = null;
  return world;
}

// ── resolveAttack: a natural 20 carries a magnitude atom ─────────────────────
{
  const r = win.resolveAttack({ d20: 20, atkBonus: 0, targetAC: 5, dmg: [{ n: 1, die: 8, bonus: 2 }] });
  check("nat-20 attack carries a magnitude atom (natural:20, success:true, tier set)",
    r.crit === true && r.magnitude && r.magnitude.natural === 20 && r.magnitude.success === true && !!r.magnitude.tier,
    JSON.stringify(r.magnitude));
}
// ── resolveAttack: a natural 1 carries a magnitude atom, mechanics unchanged (still a flat miss) ──
{
  const r = win.resolveAttack({ d20: 1, atkBonus: 100, targetAC: 5, dmg: [{ n: 1, die: 8, bonus: 2 }] });
  check("nat-1 attack is still a flat miss regardless of atkBonus (doctrine: magnitude never touches the hit/miss call)",
    r.hit === false && r.autoMiss === true);
  check("nat-1 attack carries a magnitude atom (natural:1, success:false) for DM narration, no mechanical effect",
    r.magnitude && r.magnitude.natural === 1 && r.magnitude.success === false && r.damage === 0,
    JSON.stringify(r.magnitude));
}
// ── orthogonality proof: damage is UNCHANGED by magnitude — same dmg spec, nat-20 crit doubles dice
// (SRD, unrelated to magnitude) but the magnitude die itself never adds a point of damage. Roll many
// nat-20s (a diceless flat-bonus dmg spec so damage is deterministic regardless of dice) and confirm
// every single one totals the SAME doubled-flat amount no matter what magnitude landed. ─────────────
{
  const totals = new Set(), mags = new Set();
  for(let i=0;i<60;i++){
    const r = win.resolveAttack({ d20: 20, atkBonus: 0, targetAC: 5, dmg: [{ n: 0, die: 0, bonus: 4 }] });
    totals.add(r.damage); mags.add(r.magnitude && r.magnitude.magnitude);
  }
  check("orthogonality: magnitude die value varies across samples (the spike is really rolling)", mags.size > 1, [...mags].join(","));
  check("orthogonality: damage is IDENTICAL across every magnitude value — magnitude never adds damage (diceless flat bonus, crit doubles dice not the flat bonus, so total stays 4 regardless of magnitude)",
    totals.size === 1 && [...totals][0] === 4, JSON.stringify({ totals: [...totals], mags: [...mags] }));
}
// ── non-crit attacks carry no magnitude ───────────────────────────────────────
{
  const r = win.resolveAttack({ d20: 12, atkBonus: 3, targetAC: 10, dmg: [{ n: 1, die: 6, bonus: 0 }] });
  check("a non-crit (natural 2-19) attack carries magnitude:null", r.magnitude === null, JSON.stringify(r.magnitude));
}
// ── pcAttack passes magnitude through (Object.assign spreads resolveAttack's return) ─────────────
{
  const w = makeCombatWorld(win);
  const sh = w.characters[0].sheet;
  const r = win.pcAttack(sh, { d20: 20, targetAC: 5 });
  check("pcAttack carries magnitude through from resolveAttack", r && r.magnitude && r.magnitude.natural === 20, JSON.stringify(r && r.magnitude));
}
// ── the `attack` applyEvent case: a nat-20 crit auto-emits crit_outcome, ledgers "CRITICAL (magnitude N)",
// and a magnitude>=8 killing blow against a confirmed-down foe auto-obliterates with ZERO extra DM action ──
{
  const w = makeCombatWorld(win);
  const r0 = win.applyEvent(w, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  check("combat_start ok (fixture sanity)", r0.ok === true, JSON.stringify(r0));
  const fid = win.GS.combat.foes[0].fid;
  const victimRef = win.GS.combat.foes[0];               // capture the live object BEFORE the kill — a
  victimRef.hp = 1; victimRef.maxHp = 1;                  // solo kill auto-ends combat (cmMaybeAutoEnd),
  w.ledger.length = 0;                                    // which nulls GS.combat; the object itself persists.
  const r = win.applyEvent(w, { type: "attack", payload: { d20: 20, magnitude: 15, target: fid } }); // 15 -> amplified-major/mythic-adjacent, well over the >=8 obliteration gate
  check("attack event: nat-20 crit result carries the resolved magnitude", r.ok === true && r.result && r.result.magnitude && r.result.magnitude.magnitude === 15, JSON.stringify(r.result && r.result.magnitude));
  const ledgerLine = w.ledger.find(e => e.data && e.data.kind === "attack");
  check("attack ledger line names the magnitude (\"CRITICAL (magnitude 15)\")", ledgerLine && /CRITICAL \(magnitude 15\)/.test(ledgerLine.text), JSON.stringify(ledgerLine && ledgerLine.text));
  const critLedgerLine = w.ledger.find(e => e.data && e.data.kind === "crit");
  check("attack auto-emitted crit_outcome — a matching crit-kind ledger line exists", !!critLedgerLine, JSON.stringify(w.ledger.map(e => e.data && e.data.kind)));
  check("magnitude>=8 KILLING blow auto-obliterates the foe with ZERO extra DM action (crit_outcome's own gate, reached from the attack path)",
    victimRef.down === true && victimRef.obliterated === true, JSON.stringify(victimRef));
}
// ── a magnitude<8 crit still kills but does NOT obliterate (the >=8 gate is load-bearing here too) ──
{
  const w = makeCombatWorld(win);
  win.applyEvent(w, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  const victimRef = win.GS.combat.foes[0];                // capture before the kill (solo kill auto-ends combat)
  victimRef.hp = 1; victimRef.maxHp = 1;
  const r = win.applyEvent(w, { type: "attack", payload: { d20: 20, magnitude: 3, target: fid } }); // magnitude 3 -> standard crit, under the gate
  check("a killing nat-20 with magnitude<8 downs the foe but does NOT obliterate (gate is load-bearing, not vacuous)",
    r.ok === true && victimRef.down === true && victimRef.obliterated !== true, JSON.stringify(victimRef));
}
// ── a nat-1 fumble on the attack path rides the ledger (for DM narration) with no mechanical effect ──
{
  const w = makeCombatWorld(win);
  win.applyEvent(w, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  const hpBefore = win.GS.combat.foes[0].hp;
  w.ledger.length = 0;
  const r = win.applyEvent(w, { type: "attack", payload: { d20: 1, magnitude: 1, target: fid } }); // 1/1 -> mythic fumble
  check("attack event: nat-1 fumble is still a miss (no damage), magnitude rides the result for narration only",
    r.ok === true && r.result.hit === false && r.result.damage === 0 && r.result.magnitude && r.result.magnitude.natural === 1, JSON.stringify(r.result));
  check("nat-1 fumble does not touch the foe's HP (no mechanical effect from the fumble's magnitude)",
    win.GS.combat.foes[0].hp === hpBefore);
  const critLedgerLine = w.ledger.find(e => e.data && e.data.kind === "crit");
  check("the fumble's magnitude still ledgers (via crit_outcome) so the DM can narrate it", !!critLedgerLine, JSON.stringify(w.ledger.map(e => e.data && e.data.kind)));
}
// ── a plain (non-crit) attack event carries no magnitude in its ledger line or result ─────────────
{
  const w = makeCombatWorld(win);
  win.applyEvent(w, { type: "combat_start", payload: { foes: [{ name: "Goblin", cr: 0.25 }] } });
  const fid = win.GS.combat.foes[0].fid;
  w.ledger.length = 0;
  const r = win.applyEvent(w, { type: "attack", payload: { d20: 12, target: fid } });
  check("a non-crit attack event carries magnitude:null on the result", r.ok === true && r.result.magnitude === null);
  const ledgerLine = w.ledger.find(e => e.data && e.data.kind === "attack");
  check("a non-crit attack's ledger line has no magnitude/tier and no CRITICAL tag", ledgerLine && ledgerLine.data.magnitude == null && ledgerLine.data.tier == null && !/CRITICAL/.test(ledgerLine.text), JSON.stringify(ledgerLine));
  check("a non-crit attack does NOT auto-emit a crit-kind ledger line", !w.ledger.some(e => e.data && e.data.kind === "crit"));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
