/* GENESIS MODULE — src/engine/monster-tactics.js — MONSTER TACTICS (docs/MONSTER-TACTICS.md).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   §0 Adam's forks (LOCKED): morale is BINDING (the script rolls it; fight-on/flee/surrender/rout is
   mechanical fact, the DM narrates HOW) — trash autoplay is YES (foe CR <= AUTOPLAY_CR_MAX with no
   custom d10 table and not the encounter's named leader resolves its own turn through the built resolver).

   PURE + DETERMINISTIC where the math is (mirrors engine.combat/engine.social/engine.check): every
   function here operates ONLY on the passed transient combat/foe objects, never on w/U/GS directly — the
   orchestration layer (world/dm.js applyEvent) calls these and commits ledger lines / GS.combat mutations.
   Reads rollDie/pick (engine.core), moveBand/resolveAttack/cmRollDamage/applyDamage/CM_BANDS (engine.combat),
   resolveSaveCheck (engine.check) at call time.

   §1 proposeTactic — every foe turn gets a ROLLED intent via the anti-drift ladder: (1) the creature's own
   custom d10 table (Adam's 95, verbatim in data/bestiary.js) — roll it, the row IS the tactic; (2) the walk
   archetype's rolled Behavior text (foe.behavior — normalized at the walk→combat boundary, engine.combat
   combatFromEncounter) reused as the standing disposition; (3) the state-machine fallback. Output is
   ADVISORY ({action,targetHint,rationale,source}) — the DM narrates from it or overrides freely.

   §2 Morale — BINDING. moraleTrigger detects the once-per-fight-per-side/foe triggers; rollMorale resolves
   the WIS save (script-rolled, open) against MORALE_DC (+/- MORALE_MODS by creature type) and, on a fail,
   rolls the d6 disposition table. GS.combat.moraleFlags (caller-owned) is the once-per-trigger memory.

   §3 Trash autoplay — autoplayEligible gates CR <= AUTOPLAY_CR_MAX, no customTables, not the leader, and
   not dm.noAutoplay; resolveFoeTurn composes proposeTactic -> the built resolver (resolveAttack/cmRollDamage/
   applyDamage) into one open-rolled result the caller (world/dm.js) turns into ledger lines + hp_changed. */

/* ---- §4 tunable constants (provisional — tune with xpReport sessions, per the spec's build plan) ---- */
const AUTOPLAY_CR_MAX = 1;             // foe CR <= this AND no custom table AND not the leader -> autoplay
const MORALE_DC = 10;                  // the WIS-save-vs-fear base DC (init, per §2)
// discipline/fanaticism by SRD creature type (foe.creatureType, threaded in cmFoeFrom): undead/constructs
// don't fear death (auto-pass, no roll needed) — beasts break early (a -2 penalty, easier to rout).
const MORALE_MODS = { undead: "auto-pass", construct: "auto-pass", beast: -2 };

/* ============================================================================
   §1 — proposeTactic: source-priority ladder, ADVISORY output
   ============================================================================ */

/* roll a creature's own custom d10 table (Adam's authored tables, carried verbatim on the BESTIARY entry
   as customTables:[{heading,die,rows:["| d10 | Col1 | Col2 |", "|:--|:--|:--|", "| **3** | ... | ... |", ...]}]).
   Picks the FIRST table (the primary tactic/behavior table for that creature), rolls its die, and returns
   the matching row's text as the tactic rationale. Returns null when the foe carries no custom table. */
function ctRollCustomTable(foe){
  const tables = foe && foe.customTables;
  if(!tables || !tables.length) return null;
  const t = tables[0];
  const rows = (t.rows || []).filter(r => /^\|\s*\*\*\d+/.test(r));   // data rows only (skip the header + divider)
  if(!rows.length) return null;
  const dieMatch = /d(\d+)/i.exec(t.die || "d10");
  const sides = dieMatch ? parseInt(dieMatch[1], 10) : rows.length;
  const roll = rollDie(sides || rows.length);
  // rows are keyed by their own bolded index (**N**), not necessarily the array position — match on it,
  // falling back to positional (roll-1) when a table is short a row (never throws on a malformed table).
  const row = rows.find(r => new RegExp("\\*\\*" + roll + "\\*\\*").test(r)) || rows[Math.min(roll, rows.length) - 1];
  return { roll, sides, heading: t.heading || null, row: row || null };
}

/* the §1.3 state-machine fallback — deterministic, order-matters (first match wins), mirrors the spec's
   bullet list verbatim. `ctx` = {selfBloodied, allyAdjacent, ambusherUnseen, leaderDown, rangedAndPcClosed,
   pcZoneKey} — BATTLEMAP.md §4 build item 5: the flank/press proposals carry a real `zoneHint`
   ("band:lane") — the zone the foe should move INTO for the tactic to pay off mechanically (flank =
   the PC's own zone, so cmFlanked reads true once there; press = the same, closing to melee-share). A
   ranged retreat has no zoneHint (it's a band-farther move, not a specific zone the state machine picks
   — the DM/foe-autoplay chooses which farther zone). Null-safe: pcZoneKey absent (no combat/pc zone
   info passed) -> zoneHint stays null, exactly the pre-existing (zone-less) proposal shape. */
function ctStateMachine(foe, ctx){
  ctx = ctx || {};
  if(ctx.selfBloodied) return { action: "morale-check-pending", targetHint: null, zoneHint: null, rationale: "bloodied — nerve is tested" };
  if(foe && foe.role === "pack" && ctx.allyAdjacent) return { action: "flank", targetHint: "pc", zoneHint: ctx.pcZoneKey || null, rationale: "pack + ally adjacent — flank/knock prone" };
  if(foe && foe.role === "ambusher" && ctx.ambusherUnseen) return { action: "hold", targetHint: null, zoneHint: null, rationale: "ambusher, not yet seen — hold/hide" };
  if(ctx.leaderDown) return { action: "morale-check-pending", targetHint: null, zoneHint: null, rationale: "the leader is down" };
  if(ctx.rangedAndPcClosed) return { action: "retreat", targetHint: null, zoneHint: null, rationale: "ranged + the PC closed — retreat a band" };
  return { action: "press", targetHint: "pc", zoneHint: ctx.pcZoneKey || null, rationale: "press the attack" };
}

/* THE LADDER. Returns {action, targetHint, rationale, source} — ADVISORY (§1: rides digest.combat.proposals,
   never binds the DM). `combat` is the live GS.combat object (read-only here — proposeTactic never mutates). */
function proposeTactic(foe, combat){
  if(!foe) return null;
  // 1. the creature's own custom d10 table — the row IS the tactic.
  const custom = ctRollCustomTable(foe);
  if(custom) return {
    action: "custom-table", targetHint: "pc",
    rationale: (custom.row || "").replace(/^\|\s*\*\*\d+\*\*\s*\|\s*/, "").replace(/\s*\|\s*$/, ""),
    source: "custom-table", table: custom.heading, roll: custom.roll
  };
  // 2. the walk archetype's rolled Behavior hook (normalized onto foe.behavior at the walk->combat seam).
  if(foe.behavior) return { action: "behavior-hook", targetHint: "pc", rationale: foe.behavior, source: "behavior" };
  // 3. the state-machine fallback.
  const bloodied = foe.maxHp ? (foe.hp <= foe.maxHp / 2) : false;
  const foes = (combat && combat.foes) || [];
  const allyAdjacent = foes.some(f => f !== foe && f.band === foe.band && !f.down);
  const leader = foes.find(f => f.isLeader) || null;
  const pc = combat && combat.pc;
  const pcZoneKey = (pc && typeof cmZoneKey === "function") ? cmZoneKey(pc.band || "melee", pc.lane || "C") : null;
  const ctx = {
    selfBloodied: bloodied,
    allyAdjacent,
    ambusherUnseen: foe.role === "ambusher" && !foe.seen,
    leaderDown: !!(leader && leader.down),
    rangedAndPcClosed: (foe.actions || []).some(a => a.kind === "ranged") && foe.band === "melee",
    pcZoneKey
  };
  const sm = ctStateMachine(foe, ctx);
  return Object.assign({ source: "state-machine" }, sm);
}

/* map every LIVE (not down) foe -> its proposal — the shape docs/MONSTER-TACTICS.md §1 says rides
   digest.combat.proposals[] (DM-facing only; never rendered to the player — the DM-BRIDGE wiring for that
   digest field is frontier prose, out of this unit's scope; this is the pure data the caller attaches). */
function combatProposals(combat){
  if(!combat || !Array.isArray(combat.foes)) return [];
  return combat.foes.filter(f => !f.down).map(f => Object.assign({ fid: f.fid, name: f.name }, proposeTactic(f, combat) || {}));
}

/* ============================================================================
   §2 — Morale: BINDING, script-rolled
   ============================================================================ */

/* detect a morale trigger for ONE foe against the live combat state. Returns the trigger key or null.
   Callers pass `side` = "foe" (the only side morale currently applies to — a foe's WIS save vs fear;
   PC morale isn't in scope per the spec). Checked ONCE per trigger per foe (the caller's moraleFlags
   memory gates re-firing — see moraleAlreadyFired/markMoraleFired below). */
function moraleTrigger(foe, combat){
  if(!foe || foe.down) return null;
  const foes = (combat && combat.foes) || [];
  const live = foes.filter(f => !f.down);
  const downCount = foes.length - live.length;
  if((live.length * 2) <= foes.length) return "side-bloodied";   // side is >=half down (independent of this foe's own HP — spec §2)
  const leader = foes.find(f => f.isLeader);
  if(leader && leader.down && !foe.isLeader) return "leader-down";
  const outnumbered = live.length < foes.length && live.length <= 1 && foes.length > 1;
  if(foe.maxHp && foe.hp <= foe.maxHp / 2 && outnumbered) return "bloodied-outnumbered";
  if(foe.fearEffect && (foe.fearEffect === "volatile" || foe.fearEffect === "mythic")) return "fear-effect";
  return null;
}

/* once-per-fight-per-trigger-per-foe memory — GS.combat.moraleFlags is the caller-owned store (a plain
   object the caller creates: {[fid]: {[trigger]: true}}). PURE helpers so this file never touches GS. */
function moraleAlreadyFired(flags, fid, trigger){ return !!(flags && flags[fid] && flags[fid][trigger]); }
function markMoraleFired(flags, fid, trigger){ flags = flags || {}; flags[fid] = flags[fid] || {}; flags[fid][trigger] = true; return flags; }

/* the WIS-save DC for a morale check: MORALE_DC +/- MORALE_MODS[creatureType]. "auto-pass" types
   (undead/constructs, §2) never roll — rollMorale short-circuits them below. */
function moraleDCFor(foe){
  const mod = foe && MORALE_MODS[foe.creatureType];
  if(mod === "auto-pass") return null;                   // signals auto-pass to the caller
  return MORALE_DC + (typeof mod === "number" ? mod : 0);
}

/* WIRING-SWEEP-B reconcile (docs/WIRING-MAP.md §B RECONCILES): `morale-outcome` (the authored d20,
   20 richer rows across Flee/Surrender/Parley/Fights-on) replaces the d6 table's FLAVOR TEXT only —
   the d6 BUCKET ITSELF is left untouched (flee 1-3 / surrender 4-5 / rout-panic 6), since that's the
   "built trigger" contract every existing caller (world/dm.js's foe_morale case) and the regression
   suite (dev/verify-monster-tactics.mjs's dispositionRoll-keyed fixtures) already pins down. Mapping:
   morale-outcome's "Flee" rows -> flee bucket, "Surrender"+"Parley" rows -> surrender bucket (both
   stop the fight and open dialogue — Parley already flows into SOCIAL's parley_open the same as a
   plain surrender), "Fights on" rows -> rout-panic (they're the table's own Textured/Strange-band
   escalation cluster — a failed-nerve foe that breaks into a berserk last stand rather than routing
   away reads as the SAME "cracked completely" bucket rout-panic already marks foe.routed for).
   moraleOutcomeFlavor(bucket) draws ONE morale-outcome row matching the bucket (reroll up to 8x on a
   miss — the table has no explicit bucket column, so this filters by the row's own leading category
   word); returns null (never fabricated prose) if the table isn't compiled or no row matches. */
function moraleOutcomeCategoryFor(bucket){
  if(bucket==="flee") return ["Flee"];
  if(bucket==="surrender") return ["Surrender","Parley"];
  return ["Fights on"];   // rout-panic
}
function moraleOutcomeFlavor(bucket){
  if(typeof rollTable!=="function") return null;
  const cats=moraleOutcomeCategoryFor(bucket);
  for(let t=0;t<8;t++){
    const r=rollTable("morale-outcome");
    if(!r) return null;
    const cell=(r.cells&&r.cells[1])||r.text||"";
    const cat=cell.split("—")[0].trim();
    if(cats.indexOf(cat)>=0) return { text:cell, band:r.band };
  }
  return null;
}

/* ROLL MORALE — script-rolled, OPEN (mirrors the feed convention: "the pack's nerve: 7 — breaks"). d20
   omitted -> engine rolls (foes' dice are always engine-rolled, per COMBAT.md). Returns:
     {held, autoPass, natural, total, dc, disposition, rout, flavor}
   disposition (only set when held===false): "flee" (1-3) | "surrender" (4-5) | "rout-panic" (6) — the
   §2 d6 table (UNCHANGED — see the reconcile note above). `rout` is a convenience alias ===
   (disposition === "rout-panic"). `flavor` is the richer morale-outcome row text for that same
   bucket (null if the table isn't compiled — never a fabricated line). */
function rollMorale(foe, o){
  o = o || {};
  const dc = moraleDCFor(foe);
  if(dc == null) return { held: true, autoPass: true, natural: null, total: null, dc: null, disposition: null, rout: false };
  const wisMod = (foe && foe.abilities && foe.abilities.wis && typeof foe.abilities.wis.mod === "number") ? foe.abilities.wis.mod : 0;
  const proficient = !!(foe && foe.saves && typeof foe.saves.wis === "number");
  const proficiency = proficient ? (foe.saves.wis - wisMod) : 0;   // saves.wis on a BESTIARY entry is the FULL bonus; back out the raw prof add
  const res = (typeof resolveSaveCheck === "function")
    ? resolveSaveCheck({ mods: { wis: wisMod }, saveProfs: proficient ? ["wis"] : [], profBonus: proficiency }, "wis", dc, { d20: o.d20 })
    : { total: wisMod + rollDie(20), natural: 0, success: true, dc };
  if(res.success) return { held: true, autoPass: false, natural: res.natural, total: res.total, dc, disposition: null, rout: false };
  const d6 = (o.dispositionRoll != null) ? o.dispositionRoll : rollDie(6);
  const disposition = (d6 <= 3) ? "flee" : (d6 <= 5) ? "surrender" : "rout-panic";
  const flavor=moraleOutcomeFlavor(disposition);
  return { held: false, autoPass: false, natural: res.natural, total: res.total, dc, disposition, rout: disposition === "rout-panic", d6, flavor };
}

/* ============================================================================
   §3 — Trash autoplay
   ============================================================================ */

/* ELIGIBLE: foe CR <= AUTOPLAY_CR_MAX AND no custom d10 table AND not the encounter's named leader AND
   not flagged dm.noAutoplay (a DM-set escape hatch, docs/MONSTER-TACTICS.md §3 — the caller sets
   foe.dm = foe.dm || {}; foe.dm.noAutoplay = true via codex_update/response note; read here as a plain
   foe field so this stays PURE). */
function autoplayEligible(foe){
  if(!foe || foe.down) return false;
  if(foe.isLeader) return false;
  if(foe.customTables && foe.customTables.length) return false;
  if(foe.dm && foe.dm.noAutoplay) return false;
  const cr = (typeof foe.cr === "number") ? foe.cr : (parseFloat(foe.cr) || 0);
  return cr <= AUTOPLAY_CR_MAX;
}

/* RESOLVE ONE AUTOPLAYED FOE TURN — composes proposeTactic -> the built resolver into one open-rolled
   result (attack + damage rolled exactly as the player-facing spine does; PURE, mutates only the passed
   `foe`/`pc` combatant stubs, never w/GS). `pc` = {ac, conditions?} (the target's AC + condition holder,
   for conditionAdvDis parity with a PC-initiated attack). Returns {proposal, attack} or {proposal:null}
   when the foe has no resolvable attack action (a pure-caster/legendary-only foe — the caller/DM narrates
   manually, same no-invented-numbers convention as pcAttack's null return). */
function resolveFoeTurn(foe, combat, pc){
  const proposal = proposeTactic(foe, combat);
  const atkAction = (foe.actions || []).find(a => a.kind === "melee" || a.kind === "ranged") || (foe.actions || [])[0] || null;
  if(!atkAction || !atkAction.dmg) return { proposal, attack: null };
  const targetAC = (pc && pc.ac != null) ? pc.ac : 10;
  const res = resolveAttack({ atkBonus: atkAction.atk || 0, targetAC, dmg: atkAction.dmg, attacker: foe, target: pc, range: atkAction.kind === "ranged" ? "ranged" : "melee" });
  return { proposal, attack: res, actionName: atkAction.name || null };
}
