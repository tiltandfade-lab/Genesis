/* GENESIS MODULE — src/engine/combat.js — the theater-of-the-mind 5.5 combat RESOLVER (docs/COMBAT.md).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   THE SCRIPT OWNS THE NUMBERS, the DM owns the decisions (COMBAT.md, the central split). These functions
   are the numbers: creature resolution (name → stat block), side-based initiative, attack/save/damage math,
   HP/condition/range-band tracking. PURE + DETERMINISTIC where the math is — they operate ONLY on the
   passed transient combat objects (never on `w` / `U` / the codex), and the dice-bearing primitives accept
   an optional pre-rolled d20 so the PLAYER's open roll drives the PC's attacks (dice transparency — the
   engine never rolls FOR the player) while the engine rolls the monsters'. The event surface
   (encounter_resolved / kill) is emitted by the orchestration layer (world/dm.js applyEvent) from
   combatOutcomeEvents — engine.combat never calls up into the world. Reads BESTIARY (engine data) +
   crXp (engine.advancement) at call time. */

const CM_BANDS = ["melee", "near", "far", "out"];     // the four range bands; index = distance from the PC

function cmSlug(s){ return String(s || "").toLowerCase().replace(/^(the|a|an)\s+/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

/* select the d20 for an attack/save: a supplied roll (the PC's open d20) wins; else the engine rolls,
   honoring advantage ("adv" → max of 2d20) / disadvantage ("dis" → min). Shared by resolveAttack + resolveSave. */
function cmRollD20(o){
  o = o || {};
  if(o.d20 != null) return o.d20;
  if(o.advantage === "adv") return Math.max(rollDie(20), rollDie(20));
  if(o.advantage === "dis") return Math.min(rollDie(20), rollDie(20));
  return rollDie(20);
}

/* a combat foe object from a parsed BESTIARY entry (label overrides the display name — e.g. the rolled
   threat string kept while the stats come from a CR-band fallback). */
function cmFoeFrom(entry, label){
  if(!entry) return null;
  return {
    name: label || entry.name, statId: entry.id || null, cr: (entry.cr != null ? entry.cr : null),
    xp: (entry.xp != null ? entry.xp : (typeof crXp === "function" ? crXp(entry.cr) : 0)),
    ac: entry.ac, maxHp: entry.hp, hp: entry.hp, init: (entry.init != null ? entry.init : 0),
    abilities: entry.abilities || {}, saves: entry.saves || {}, pb: entry.pb || 2,
    resist: entry.resist || [], immune: entry.immune || [], vuln: entry.vuln || [], condImmune: entry.condImmune || [],
    actions: entry.actions || [], traits: entry.traits || [], bonus: entry.bonus || [],
    reactions: entry.reactions || [], legendary: entry.legendary || [], customTables: entry.customTables || [],
    role: entry.role || null, habitat: entry.habitat || [], factionFit: entry.factionFit || [],
    conditions: [], band: "near", down: false
  };
}

/* DMG-style benchmark numbers for a STATLESS walk-on by CR (the §"quick-stats fallback") — so the DM never
   invents a generic guard/merchant's stats mid-scene. Rough monotone-by-CR curve; the real bestiary is
   always preferred. */
function cmQuickStats(name, cr){
  let n = (cr == null) ? 0.25 : (typeof cr === "number" ? cr : (parseFloat(cr) || 0.25));
  const ac = Math.round(13 + n / 3), hp = Math.max(1, Math.round(15 + 15 * n)), atk = Math.round(3 + n / 2);
  const dmgAvg = Math.max(1, Math.round(5 + 4 * n));
  return {
    name: name || "Walk-on", statId: null, cr: n, xp: (typeof crXp === "function" ? crXp(n) : 0),
    ac, maxHp: hp, hp, init: 1, abilities: {}, saves: {}, pb: Math.max(2, Math.round(2 + n / 4)),
    resist: [], immune: [], vuln: [], condImmune: [],
    actions: [{ name: "Strike", kind: "melee", atk, reach: 5, dmg: [{ n: 0, die: 0, bonus: dmgAvg, type: null }],
                text: "Strike +" + atk + ", " + dmgAvg + " damage" }],
    traits: [], bonus: [], reactions: [], legendary: [], customTables: [],
    role: "walk-on", habitat: [], factionFit: [], conditions: [], band: "near", down: false, quickStats: true
  };
}

/* THE THREAT→STAT-BLOCK RESOLVER (COMBAT.md, Layer 2). The walk layer's creature names come from the
   threat-identity tables, not the asset library — so bridge them: exact/normalized name → CR-band fallback
   (filtered by role/habitat/factionFit when known) → quick-stats. Always returns a combat foe object. */
function resolveCreature(name, hint){
  hint = hint || {};
  if(typeof BESTIARY === "undefined") return cmQuickStats(name, hint.cr);
  const want = cmSlug(name);
  if(want && BESTIARY[want]) return cmFoeFrom(BESTIARY[want]);
  if(want){
    for(const id in BESTIARY){ if(id === want || cmSlug(BESTIARY[id].name) === want) return cmFoeFrom(BESTIARY[id]); }
  }
  const byCR = cmPickByCR(hint);                       // 2. CR-band fallback, keeping the rolled name as a label
  if(byCR) return cmFoeFrom(byCR, name);
  return cmQuickStats(name, hint.cr);                  // 3. statless benchmark
}

/* pick a BESTIARY entry near hint.cr, preferring matches on role / habitat / factionFit. */
function cmPickByCR(hint){
  if(hint.cr == null || typeof BESTIARY_BY_CR === "undefined" || typeof BESTIARY === "undefined") return null;
  const target = (typeof hint.cr === "number") ? hint.cr : (parseFloat(hint.cr) || 0);
  const keys = Object.keys(BESTIARY_BY_CR).map(Number).filter(k => !isNaN(k)).sort((a, b) => Math.abs(a - target) - Math.abs(b - target));
  for(const k of keys.slice(0, 4)){                    // widen outward from the target CR
    const ids = BESTIARY_BY_CR[String(k)] || BESTIARY_BY_CR[k];
    if(!ids) continue;
    let pool = ids.map(id => BESTIARY[id]).filter(Boolean);
    const filt = pool.filter(e =>
      (!hint.role || e.role === hint.role) &&
      (!hint.habitat || (e.habitat || []).indexOf(hint.habitat) >= 0) &&
      (!hint.faction || (e.factionFit || []).indexOf(hint.faction) >= 0));
    const use = filt.length ? filt : pool;
    if(use.length) return (typeof pick === "function") ? pick(use) : use[0];
  }
  return null;
}

/* SIDE-BASED INITIATIVE (COMBAT.md): one roll for the PC side, one for the enemy side. Ties → PC (the
   solo-friendly bias). Accepts pre-rolled d20s (the PC's open roll) or rolls its own. */
function rollInitiative(pcMod, foeMod, pcRoll, foeRoll){
  const a = (pcRoll != null ? pcRoll : rollDie(20)) + (pcMod || 0);
  const b = (foeRoll != null ? foeRoll : rollDie(20)) + (foeMod || 0);
  return { first: (a >= b) ? "pc" : "enemy", pc: a, enemy: b };
}

function cmCoverBonus(cover){
  if(cover === "full") return "full";
  if(cover === "three-quarters" || cover === "3/4") return 5;
  if(cover === "half") return 2;
  return 0;
}

/* roll a damage spec [{n,die,bonus,type}] → {total, breakdown:[{type,amount}]}. 5.5 crit doubles the dice
   (not the flat bonus). A diceless clause (n:0,die:0) contributes its bonus as flat damage. */
function cmRollDamage(spec, crit){
  spec = spec || []; let total = 0; const breakdown = [];
  for(const c of spec){
    let amt = c.bonus || 0;
    const dice = (c.n || 0) * (crit ? 2 : 1);
    for(let i = 0; i < dice; i++) amt += rollDie(c.die || 1);
    amt = Math.max(0, amt);
    total += amt; breakdown.push({ type: c.type || null, amount: amt });
  }
  return { total, breakdown };
}

/* RESOLVE ONE ATTACK. d20 supplied = the PC's open roll; omitted = the engine rolls (a foe). Honors
   advantage ("adv"/"dis"), cover (half/three-quarters/full → the 5.5 AC bonus), nat-20 crit / nat-1 miss. */
function resolveAttack(o){
  o = o || {};
  const nat = cmRollD20(o);
  const cov = cmCoverBonus(o.cover);
  if(cov === "full") return { hit: false, crit: false, natural: nat, fullCover: true, damage: 0, breakdown: [] };
  const total = nat + (o.atkBonus || 0);
  const ac = (o.targetAC || 10) + (cov || 0);
  const crit = (nat === 20) || !!o.crit;
  const autoMiss = (nat === 1);
  const hit = !autoMiss && (crit || total >= ac);
  let damage = 0, breakdown = [];
  if(hit){ const r = cmRollDamage(o.dmg, crit); damage = r.total; breakdown = r.breakdown; }
  return { hit, crit, autoMiss, natural: nat, total, targetAC: ac, damage, breakdown };
}

/* ITEMS (docs/ITEMS.md) — resolve the PC's equipped-weapon damage spec from data/items.js's
   ITEMS_BY_NAME, the fix for "the DM has to recall the weapon's dice from memory." PURE: takes the
   already-sliced equipped/inventory/mods (never the full sheet/world — mirrors resolveAttack's
   convention of the caller passing flat numbers, not reaching up a layer). Returns null when the slot
   is empty or the equipped instance doesn't resolve against the index — the caller falls back to a
   DM-supplied o.dmg, exactly like today; never invents a number for an unindexed item.
   Honors the SRD base two-weapon-fighting rule (equipment.md "Light" property — not a feat, the
   floor rule): mainHand always adds the ability modifier (Finesse weapons use the better of STR/DEX);
   offHand requires a Light weapon and adds the modifier ONLY if it's negative. */
function cmEquippedDamage(equipped, inventory, mods, slot){
  const itemId = equipped && equipped[slot];
  if(!itemId) return null;
  const inst = (inventory || []).find(it => it.id === itemId);
  if(!inst) return null;
  const def = (typeof ITEMS_BY_NAME !== "undefined") ? ITEMS_BY_NAME[String(inst.name || "").trim().toLowerCase()] : null;
  if(!def || !def.damage) return null;                  // unindexed / non-weapon — caller falls back to manual o.dmg
  const props = def.properties || [];
  const finesse = props.indexOf("Finesse") >= 0;
  const ranged = (def.category || "").indexOf("Ranged") >= 0;
  const str = (mods && mods.str) || 0, dex = (mods && mods.dex) || 0;
  let dmgMod = ranged ? dex : (finesse ? Math.max(str, dex) : str);
  if(slot === "offHand"){
    if(props.indexOf("Light") < 0) return null;          // the base rule's extra attack requires a Light weapon
    dmgMod = dmgMod < 0 ? dmgMod : 0;                     // "...unless that modifier is negative" (equipment.md, Light property)
  }
  return {
    weaponName: def.name, properties: props, finesse, ranged,
    dmg: [{ n: def.damage.n, die: def.damage.die, bonus: (def.damage.bonus || 0) + dmgMod, type: def.damage.type }]
  };
}

/* RESOLVE A SAVING THROW. d20 supplied = the target's open roll (if it's the PC); omitted = engine roll. */
function resolveSave(o){
  o = o || {};
  const nat = cmRollD20(o);
  const total = nat + (o.saveMod || 0);
  return { success: total >= (o.dc || 0), natural: nat, total, dc: o.dc || 0 };
}

/* APPLY DAMAGE to a combatant — mutates the passed transient object (resist halves, immune zeroes, vuln
   doubles by damage type), clamps HP to 0, sets `down`. Returns {applied, hp, down}. For the PC, the
   orchestrator routes the result through the existing hp_changed event (resources clamp + death narration). */
function applyDamage(c, amount, type){
  if(!c) return { applied: 0, hp: 0, down: false };
  let amt = Math.max(0, amount | 0);
  type = (type || "").toLowerCase();
  if(type){
    if((c.immune || []).indexOf(type) >= 0) amt = 0;
    else if((c.resist || []).indexOf(type) >= 0) amt = Math.floor(amt / 2);
    else if((c.vuln || []).indexOf(type) >= 0) amt = amt * 2;
  }
  c.hp = Math.max(0, (c.hp == null ? c.maxHp : c.hp) - amt);
  c.down = c.hp <= 0;
  return { applied: amt, hp: c.hp, down: c.down };
}

/* MOVE between range bands — mutates the passed combatant's `band`. dir = "closer" | "farther"; a Dash
   moves two bands. Clamped Melee↔Out. Returns the new band. */
function moveBand(c, dir, dash){
  if(!c) return null;
  const i = CM_BANDS.indexOf(c.band || "near");
  const step = (dir === "closer" ? -1 : 1) * (dash ? 2 : 1);
  const j = Math.max(0, Math.min(CM_BANDS.length - 1, (i < 0 ? 1 : i) + step));
  c.band = CM_BANDS[j];
  return c.band;
}

/* normalize a foe spec (a name string, or {name,cr,role,habitat,faction,victimClass,factionId,statId,band})
   into a resolved combat foe object. */
function cmResolveFoe(f, hint){
  hint = hint || {};
  let foe;
  if(typeof f === "string") foe = resolveCreature(f, hint);
  else if(f && f.statId && typeof BESTIARY !== "undefined" && BESTIARY[f.statId]) foe = cmFoeFrom(BESTIARY[f.statId], f.name);
  else foe = resolveCreature((f && f.name) || String(f), {
    cr: (f && f.cr != null) ? f.cr : hint.cr, role: (f && f.role) || hint.role,
    habitat: (f && f.habitat) || hint.habitat, faction: (f && f.faction) || hint.faction });
  if(f && typeof f === "object"){
    if(f.victimClass) foe.victimClass = f.victimClass;
    if(f.factionId) foe.factionId = f.factionId;
    if(f.band) foe.band = f.band;
    if(f.codexId) foe.codexId = f.codexId;
  }
  if(!foe.victimClass) foe.victimClass = "monster";
  return foe;
}

/* START A FIGHT — builds the transient combat object (COMBAT.md, GS.combat). Resolves every foe to real
   stats, rolls side-based initiative. PURE: returns the object; the caller stashes it in GS.combat (the
   engine never writes app state). `pc` carries {init|mods.dex}; `foes` = specs; `objectiveRef` gates XP. */
function combatStart(o){
  o = o || {};
  const hint = o.hint || {};
  const foes = (o.foes || []).map((f, i) => { const foe = cmResolveFoe(f, hint); foe.fid = "f" + (i + 1); return foe; });
  const pc = o.pc || {};
  const pcInit = (pc.init != null) ? pc.init : ((pc.mods && pc.mods.dex) || 0);
  const foeInit = foes.length ? Math.max.apply(null, foes.map(f => f.init || 0)) : 0;
  const ini = rollInitiative(pcInit, foeInit, o.pcRoll, o.foeRoll);
  return {
    active: true, round: 1, first: ini.first, side: ini.first, initiative: ini,
    pcRef: pc, pc: { band: "melee" }, foes,
    objectiveRef: o.objectiveRef || null, method: o.method || "combat",
    scene: o.scene || { cover: {}, hazards: [], exits: [] }, ledgerRefs: []
  };
}

/* build foe specs from a walk-layer encounter (the wire from walk.js → combat). `enc.creatures` (urban/
   dungeon) or `enc.creature` (wilderness) are name strings; ctx carries cr/role/habitat/faction/factionId/
   victimClass for the resolver fallback + escalation tagging. Returns resolved combat foes (or null).
   NB: `ctx.factionId` must be a key `findClockTarget` resolves (the faction's NAME / a front's danger, slug-
   matched), NOT an opaque codex/UUID — else the kill→clock_advanced escalation logs as untracked + no-ops. */
function combatFromEncounter(enc, ctx){
  ctx = ctx || {};
  if(!enc || !enc.isEnemy) return null;
  let names = [];
  if(Array.isArray(enc.creatures)) names = enc.creatures.map(c => ({ name: c.creature, slot: c.slot }));
  else if(enc.creature) names = [{ name: enc.creature }];
  return names.map(n => {
    const f = resolveCreature(n.name, { cr: ctx.cr, role: ctx.role, habitat: ctx.habitat, faction: ctx.faction });
    if(ctx.factionId) f.factionId = ctx.factionId;
    f.victimClass = ctx.victimClass || (ctx.factionId ? "hostile" : "monster");
    return f;
  });
}

/* derive the EVENT-CONTRACT payloads from a finished fight (COMBAT.md, the event surface). The orchestrator
   (world/dm.js applyEvent) emits these: one encounter_resolved (foes carry CR → CR-XP pricing) + one kill
   per downed foe (victimClass + factionId → DIFFICULTY escalation). The engine derives; the world commits. */
function combatOutcomeEvents(combat, o){
  o = o || {};
  const foes = (combat && combat.foes) || [];
  const down = foes.filter(f => f.down);
  // XP prices from the foes actually DEFEATED (down), not everyone faced — so fleeing a fight after
  // dropping one of three doesn't bank CR-XP for the two that walked away (the grind/exploit vector),
  // and a fight talked/snuck past pays no combat XP. Matches the kill events + ADVANCEMENT.md.
  const encounter = { type: "encounter_resolved", source: "declared", payload: {
    foes: down.map(f => ({ cr: f.cr, victimClass: f.victimClass || "monster" })),
    method: o.method || (combat && combat.method) || "combat",
    objectiveRef: (combat && combat.objectiveRef) || o.objectiveRef || null,
    outcome: o.outcome || "resolved"
  } };
  const kills = down.map(f => ({ type: "kill", source: "declared", payload: {
    victimClass: f.victimClass || "monster", factionId: f.factionId || null, victimId: f.codexId || null
  } }));
  return { encounter, kills };
}
