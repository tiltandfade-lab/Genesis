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
   advantage ("adv"/"dis"), cover (half/three-quarters/full → the 5.5 AC bonus), nat-20 crit / nat-1 miss.
   CONDITIONS (docs/SRD-MECHANIZATION.md §3): when o.attacker/o.target combatants are supplied, the
   advantage/disadvantage is AUTO-DERIVED from their conditions (conditionAdvDis) — the DM no longer
   states "you have disadvantage," the engine returns it in `advDerived`. An explicit o.advantage combines
   with the derived one (a source of each cancels, per RAW). o.range = "melee"|"ranged" for prone's
   asymmetry. When the roll is engine-rolled (no o.d20), the net advantage steers cmRollD20. */
function resolveAttack(o){
  o = o || {};
  // derive condition-based advantage/disadvantage from the two combatants (§3), then net it with any
  // explicit o.advantage — a single adv AND a single dis cancel to a straight roll (SRD 2024).
  let advDerived = null, advSources = null;
  if((o.attacker || o.target) && typeof conditionAdvDis === "function"){
    const d = conditionAdvDis({ actor: o.attacker, target: o.target, kind: "attack", range: o.range || "melee" });
    advDerived = d.advantage; advSources = d.sources;
  }
  let netAdv = o.advantage || null;
  if(advDerived){
    if(!netAdv) netAdv = advDerived;
    else if(netAdv !== advDerived) netAdv = null;   // explicit adv + derived dis (or vice-versa) → cancel
  }
  const nat = cmRollD20({ d20: o.d20, advantage: netAdv });
  const cov = cmCoverBonus(o.cover);
  if(cov === "full") return { hit: false, crit: false, natural: nat, fullCover: true, damage: 0, breakdown: [], advantage: netAdv, advDerived, advSources };
  const total = nat + (o.atkBonus || 0);
  const ac = (o.targetAC || 10) + (cov || 0);
  const crit = (nat === 20) || !!o.crit;
  const autoMiss = (nat === 1);
  const hit = !autoMiss && (crit || total >= ac);
  let damage = 0, breakdown = [];
  if(hit){ const r = cmRollDamage(o.dmg, crit); damage = r.total; breakdown = r.breakdown; }
  return { hit, crit, autoMiss, natural: nat, total, targetAC: ac, damage, breakdown, advantage: netAdv, advDerived, advSources };
}

/* ITEMS (docs/ITEMS.md) — the ONE name→definition lookup into data/items.js's ITEMS_BY_NAME. itemKey
   mirrors the generator's norm() for the names the index actually uses: fold the Unicode right-quote to
   ASCII, collapse whitespace, trim, lowercase — otherwise a name carrying a curly apostrophe ("Thieves'
   Tools") never finds its (straight-apostrophe) key. (JS \s and Python \s differ on a few exotic control
   codepoints, but item names are clean ASCII, so the fold is exact in practice.) Shared by render/combat/
   dm so the normalization lives in one place. */
function itemKey(name){ return String(name || "").replace(/’/g, "'").replace(/\s+/g, " ").trim().toLowerCase(); }
function itemDef(name){ return (typeof ITEMS_BY_NAME !== "undefined") ? (ITEMS_BY_NAME[itemKey(name)] || null) : null; }

/* CONGRUENCE (docs/ITEMS.md §E) — the magic reference catalog + default enchantment overlay, keyed
   like the mundane index. `magicDef` looks a magic item up; `enchOf` reads the per-instance overlay
   (inst.ench wins; if absent, the catalog's default ench for a known magic name is used). `baseDef`
   is the ONE resolver combat/AC use: a magic instance's BASE mechanics come from ITEMS_BY_NAME via
   inst.base (a "+1 Longsword" resolves "Longsword"); a mundane instance just resolves its own name. */
function magicDef(name){ return (typeof MAGIC_ITEMS_BY_NAME !== "undefined") ? (MAGIC_ITEMS_BY_NAME[itemKey(name)] || null) : null; }
function enchOf(inst){
  if(!inst) return null;
  if(inst.ench) return inst.ench;
  const md = magicDef(inst.name);
  if(md && md.ench){ const e = JSON.parse(JSON.stringify(md.ench)); if(md.attunement) e.attunement = true; return e; }   // fold the catalog's requires-attunement flag in
  return null;
}
function baseDef(inst){ return inst ? itemDef(inst.base || inst.name) : null; }

/* ATTUNEMENT GATING (docs/ITEMS.md §E) — the enchantment overlay's MECHANICAL benefit applies only when
   the item is usable: an item that REQUIRES attunement (`ench.attunement`) confers nothing until the PC
   has attuned to that instance (`inst.attuned`). Returns the live overlay, or null when it's dormant.
   A `broken` instance also confers no magic (mirrors the base-item broken rule). */
function enchActive(inst){
  if(!inst) return null;
  if((inst.conditions || []).indexOf("broken") >= 0) return null;
  const e = enchOf(inst);
  if(!e) return null;
  if(e.attunement && !inst.attuned) return null;
  return e;
}
/* count the instances the PC is currently attuned to (the SRD max-3 cap is enforced at the attune event). */
function attunedCount(inventory){ return (inventory || []).filter(it => it.attuned).length; }

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
  const def = baseDef(inst);                             // CONGRUENCE: base mechanics off inst.base||inst.name (docs/ITEMS.md §E)
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
  // VERSATILE GRIP (docs/ITEMS.md Decision 1): a main-hand Versatile weapon uses its two-handed die when
  // gripped 2h. Two-handing needs a FREE off-hand; with the off-hand free the grip DEFAULTS to 2h (bigger
  // die), and the player can override to 1h via equipped.grip. An occupied off-hand forces the 1h base die.
  const offOccupied = !!(equipped && equipped.offHand);
  const twoHandable = slot === "mainHand" && def.versatile && !offOccupied;
  const grip = twoHandable ? ((equipped && equipped.grip === "1h") ? "1h" : "2h") : "1h";
  const dice = (grip === "2h" && def.versatile) ? def.versatile : def.damage;
  // the per-instance enchantment overlay (attunement-gated): +N adds to damage AND to-hit; a damageRider is an extra clause.
  const ench = enchActive(inst) || {};
  const magicBonus = ench.bonus || 0;
  const dmg = [{ n: dice.n, die: dice.die, bonus: (def.damage.bonus || 0) + dmgMod + magicBonus, type: def.damage.type }];
  if(ench.damageRider) dmg.push({ n: ench.damageRider.n, die: ench.damageRider.die, bonus: ench.damageRider.bonus || 0, type: ench.damageRider.type });
  return {
    weaponName: inst.name || def.name, baseName: def.name, properties: props, finesse, ranged, grip,
    magicBonus, atkBonus: magicBonus, rider: ench.damageRider || null, dmg
  };
}

/* ITEMS (docs/ITEMS.md) — the PC's Armor Class from what they're WEARING. PURE (same flat-args
   convention as cmEquippedDamage). 5.5e armor math: Light = base + full DEX; Medium = base + min(DEX,2)
   (dexCap); Heavy = base, no DEX; a Shield in the off-hand adds its flat bonus on top. Unworn → the
   10 + DEX unarmored default (matches the creator's baseline; class unarmored-defense like Barbarian/
   Monk is a separate, pre-existing gap not modeled here). Magic-item AC bonuses, when they exist, fold
   in here. Returns a number. */
function cmEquippedAC(equipped, inventory, mods){
  const dex = (mods && mods.dex) || 0;
  const instOf = id => id && (inventory || []).find(it => it.id === id) || null;
  let ac = 10 + dex;                                       // unarmored default
  const aInst = instOf(equipped && equipped.armor), aDef = baseDef(aInst), aEnch = enchActive(aInst) || {};
  if(aDef && aDef.ac && aDef.ac.base != null){
    ac = aDef.ac.dexMod
      ? aDef.ac.base + Math.min(dex, aDef.ac.dexCap != null ? aDef.ac.dexCap : Infinity)   // light (no cap) / medium (cap)
      : aDef.ac.base;                                      // heavy — no DEX
    ac += (aEnch.bonus || 0) + (aEnch.acBonus || 0);       // CONGRUENCE: magic armor +N / acBonus overlay (docs/ITEMS.md §E)
  }
  const oInst = instOf(equipped && equipped.offHand), oDef = baseDef(oInst), oEnch = enchActive(oInst) || {};  // a shield lives in the off-hand slot
  if(oDef && oDef.ac && oDef.ac.shieldBonus) ac += oDef.ac.shieldBonus + (oEnch.bonus || 0) + (oEnch.acBonus || 0);
  return ac;
}

/* The sheet's full AC = armor/shield/DEX (cmEquippedAC) + flat bonuses (sh.acBonus — e.g. the Iron Skin
   feat's +1). The ONE canonical recompute every AC write site calls, so AC is always re-derived from
   current equipment + bonuses rather than incrementally nudged (which broke when a DEX bump rippled onto
   no-DEX heavy armor). PURE — returns a number; the caller assigns it to sh.ac. */
function cmSheetAC(sh){
  if(!sh) return 10;
  const eq = sh.equipped || {};
  const wornAcBonus = (sh.inventory || []).reduce((sum, it) => {
    if(it.id === eq.armor || it.id === eq.offHand) return sum;   // already counted by cmEquippedAC
    const e = enchActive(it) || {};
    return sum + (e.acBonus || 0) + (e.bonus || 0);              // Ring/Cloak/Bracers of Protection etc.
  }, 0);
  return cmEquippedAC(eq, sh.inventory, sh.mods) + (sh.acBonus || 0) + wornAcBonus;
}

/* ITEMS (docs/ITEMS.md) — a sensible default loadout from an inventory: the worn armor (highest base),
   a shield (off-hand), and a primary weapon (first weapon, kit order = melee-first). PURE — returns a
   fresh {mainHand,offHand,armor} of instance ids (or nulls); the caller assigns it to sheet.equipped.
   Used at character creation and as a one-time migration backfill so AC reflects starting gear instead
   of defaulting to unarmored. Leaves off-hand empty unless a shield is present (dual-wielding a second
   weapon is a deliberate player/DM choice, not an auto-default). */
function defaultEquip(inventory){
  const eq = { mainHand: null, offHand: null, armor: null };
  let bestArmor = -1;
  (inventory || []).forEach(it => {
    const def = baseDef(it);                               // CONGRUENCE: a magic weapon/armor auto-equips off its base
    if(!def) return;
    if(def.kind === "weapon" && !eq.mainHand) eq.mainHand = it.id;
    else if(def.kind === "shield" && !eq.offHand) eq.offHand = it.id;
    else if(def.kind === "armor" && def.ac && def.ac.base != null && def.ac.base > bestArmor){ bestArmor = def.ac.base; eq.armor = it.id; }
  });
  return eq;
}

/* THE LIVE ATTACK PATH (docs/ITEMS.md) — the fix for "cmEquippedDamage is computed but nothing calls
   resolveAttack with it." Composes the PC's equipped weapon into a resolved attack: base+magic damage
   (cmEquippedDamage) + the to-hit (ability mod + proficiency + magic +N) → resolveAttack. `o.d20` = the
   player's open roll (dice transparency); omit only for a simulated swing. Returns null when the slot
   holds no INDEXED weapon (caller falls back to a DM-supplied manual attack, same convention as elsewhere).
   v1 simplification (flagged): assumes proficiency with the equipped weapon — true for a class's kit
   weapons; a non-proficient improvised weapon would overcount by the PB until weapon-proficiency data
   is wired. The attack ROLL uses the full ability mod even off-hand (only the DAMAGE omits it, per 5.5). */
function pcAttack(sh, o){
  o = o || {}; if(!sh) return null;
  const slot = o.slot || "mainHand";
  const ed = cmEquippedDamage(sh.equipped, sh.inventory, sh.mods, slot);
  if(!ed) return null;
  const mods = sh.mods || {}, str = mods.str || 0, dex = mods.dex || 0;
  const abilityMod = ed.ranged ? dex : (ed.finesse ? Math.max(str, dex) : str);
  const prof = sh.profBonus || 0;
  const atkBonus = abilityMod + prof + (ed.magicBonus || 0);
  const res = resolveAttack({ d20: o.d20, atkBonus, targetAC: o.targetAC, cover: o.cover, advantage: o.advantage, crit: o.crit, dmg: ed.dmg });
  return Object.assign({ weaponName: ed.weaponName, baseName: ed.baseName, atkBonus, abilityMod, prof, magicBonus: ed.magicBonus || 0, rider: ed.rider || null }, res);
}

/* ENCUMBRANCE (docs/ITEMS.md Decision 4 — "no barrelmancers") — canonical SRD Carrying Capacity, no
   variant. carryTotals sums instance weights (congruent: magic instances weigh their base). carryState
   returns the whole picture: over STR×15 (soft) → Speed drops to 5 ft (`speedCap`); you cannot carry over
   STR×30 (hard) at all (`overHard` — the anvil won't budge). Capacity keys off the STR SCORE (not the mod).
   PURE — the movement/combat layer reads speedCap; item_changed refuses an add that would breach hard. */
function carryTotals(inventory){
  return (inventory || []).reduce((sum, it) => { const d = baseDef(it); return sum + ((d && d.weight) || 0) * (it.qty || 1); }, 0);
}
function carryCapacity(sh){ const s = (sh && sh.scores && sh.scores.str) || 10; return { soft: s * 15, hard: s * 30 }; }
function carryState(sh){
  const weight = carryTotals(sh && sh.inventory);
  const cap = carryCapacity(sh);
  const tier = (weight > cap.hard) ? "over-hard" : (weight > cap.soft) ? "encumbered" : "ok";
  return { weight, soft: cap.soft, hard: cap.hard, tier, overHard: tier === "over-hard",
           encumbered: tier !== "ok", speedCap: tier === "ok" ? null : 5 };
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
