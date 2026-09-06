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
const CM_LANES = ["L", "C", "R"];                     // BATTLEMAP.md §0/§1: the lateral lane axis, left/center/right

function cmSlug(s){ return String(s || "").toLowerCase().replace(/^(the|a|an)\s+/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

/* ============================================================================
   THE BATTLEMAP (docs/BATTLEMAP.md) — the 12-zone model. Position = band × lane.
   The script owns positions; the diorama renders TRUTH. Everything below is PURE
   (mirrors the rest of this file): reads/writes only the passed combat/combatant
   objects, never GS/w/U directly — the caller (world/dm.js) commits.
   ============================================================================ */

/* §1 dims parser: a segment's rolled "dims" string ("40' x 60'", "50' x 120' irregular",
   "15' x 50' gradual descent") -> the grid ceiling this room ALLOWS (never invents past the
   rolled geometry). Depth axis: 1 band per ~25 ft (min 1, max 4, per BATCH2-GUARDRAILS H3).
   Width axis: 1 lane per ~20 ft (min 1, max 3). Tolerant: the FIRST TWO integer feet values in
   the string win (order = depth then width, matching the walk tables' "L x W" convention).
   Unparseable/absent -> the full 4x3 (open wilderness / no rolled geometry to honor). */
function cmDimsToGrid(dims){
  const s = String(dims || "");
  const nums = s.match(/(\d+)\s*'/g);
  if(!nums || nums.length < 2) return { bands: 4, lanes: 3 };
  const feet = nums.slice(0, 2).map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n > 0);
  if(feet.length < 2) return { bands: 4, lanes: 3 };
  const [depthFt, widthFt] = feet;
  const bands = Math.max(1, Math.min(4, Math.ceil(depthFt / 25)));
  const lanes = Math.max(1, Math.min(3, Math.ceil(widthFt / 20)));
  return { bands, lanes };
}

/* PLACE-GEN.md ADDENDUM §A / §7 unit 11 — GRID-LAW combat derivation. When a fight's location is a
   node bound to a typed place record, the record's `rolled.dims` (footprint in 5-ft CELLS — GRID LAW:
   mint emits `dims:{w,d}` in cells, 1 tile = 1 cell = 5 ft) is EXACT geometry, not a guess: no reason to
   route it through the feet-text parser above. 1 band = 5 cells deep, 1 lane = 4 cells wide (the
   ADDENDUM's own arithmetic) — same clamps as cmDimsToGrid (bands 1-4, lanes 1-3) so a cell-derived grid
   and a text-derived grid are never structurally distinguishable downstream. Pure: {w,d} in, {bands,lanes}
   counts out, nothing else touched. Small rooms are HONEST — a 4x3-cell diner clamps to 1x1 (everyone in
   melee); the clamps' floor of 1 is the only floor, there is no padding-up of small spaces to a bigger grid. */
function cmGridFromCells(dims){
  if(!dims || !(dims.w > 0) || !(dims.d > 0)) return null;
  const bands = Math.max(1, Math.min(4, Math.ceil(dims.d / 5)));
  const lanes = Math.max(1, Math.min(3, Math.ceil(dims.w / 4)));
  return { bands, lanes };
}

/* §1 the zone grid for a room/segment: { bands:[...CM_BANDS subset from index 0], lanes:[...CM_LANES
   subset centered], rows } — derived from a {bands,lanes} COUNT pair (cmDimsToGrid's text-parse path or
   cmGridFromCells' cell-geometry path, whichever combatStart's caller resolved), seeded deterministically
   (same segment id -> same board, per BATTLEMAP.md §1 "placement is deterministic"). No RNG here at all —
   the shape is a pure function of the counts, so determinism is automatic (no seed consumption needed). */
function cmZoneGridFromCounts(g){
  const bands = CM_BANDS.slice(0, g.bands);
  // lane subset is CENTERED: 1 lane -> [C]; 2 lanes -> [L,C]... but 3 is the common/full case -> [L,C,R].
  const lanes = g.lanes >= 3 ? CM_LANES.slice() : g.lanes === 2 ? ["L", "C"] : ["C"];
  return { bands, lanes, bandCount: g.bands, laneCount: g.lanes };
}

/* text-parse path, unchanged in shape/behavior: absent/unparseable dims -> the full 4x3. */
function cmZoneGrid(dims){
  return cmZoneGridFromCounts(cmDimsToGrid(dims));
}

/* clamp a lane string to a valid CM_LANES member (defensive — never invents a 4th lane). */
function cmClampLane(lane){ return CM_LANES.indexOf(lane) >= 0 ? lane : "C"; }

/* Clamp serialized/resolved combatants into THIS room's actual grid. Bestiary defaults commonly put
   a foe at `near`; a 5×10-ft generated room may legally expose only `melee`. Leaving that default
   untouched creates an impossible combatant outside grid.bands and breaks movement/OA reasoning. */
function cmNormalizeCombatPlacement(combat){
  if(!combat)return combat;
  const grid=combat.grid||cmZoneGrid(null), bands=grid.bands||CM_BANDS, lanes=grid.lanes||CM_LANES;
  const bandOf=b=>{const i=CM_BANDS.indexOf(b);return bands[Math.min(i>=0?i:0,Math.max(0,bands.length-1))]||"melee";};
  const laneOf=l=>lanes.indexOf(l)>=0?l:(lanes.indexOf("C")>=0?"C":(lanes[0]||"C"));
  if(combat.pc){combat.pc.band=bandOf(combat.pc.band);combat.pc.lane=laneOf(combat.pc.lane);}
  (combat.foes||[]).forEach(f=>{f.band=bandOf(f.band);f.lane=laneOf(f.lane);});
  return combat;
}

/* select the d20 for an attack/save: a supplied roll (the PC's open d20) wins; else the engine rolls,
   honoring advantage ("adv" → max of 2d20) / disadvantage ("dis" → min). Shared by resolveAttack + resolveSave. */
function cmRollD20(o){
  o = o || {};
  // H3 (HOTFIX-QUEUE-2026-07-06): a non-finite/string d20 is repaired to a number, or falls
  // through to a real roll — the engine-level net for every cmRollD20 caller (no ledger here).
  if(o.d20 != null){ const n = Number(o.d20); if(Number.isFinite(n)) return n; }
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
    // MONSTER-TACTICS §2: the SRD creature-type tag (undead/construct/beast/…) — morale auto-pass reads
    // this. Lives at entry.tags.type (data/bestiary.js's gen-bestiary.py output), NOT a top-level
    // entry.type — reconciled against the real generated shape (a bare entry.type doesn't exist).
    creatureType: (entry.tags && entry.tags.type) || null,
    // BATTLE-THEATER §3 archetype pass 2: the SRD size tag (tiny/small/medium/large/huge/gargantuan),
    // same entry.tags home as creatureType above — theaterArchetypeFor's huge/gargantuan "giant" size
    // override reads this. Was previously never threaded onto the foe object at all (theater-data.js's
    // theaterArchetypeFor(f.creatureType, f.size) always saw undefined size in live combat).
    size: (entry.tags && entry.tags.size) || null,
    conditions: [], band: "near", down: false
  };
}

/* REALM-TRAITS-APPLY §2/§4 — the ONE action-text -> mechanics grammar in the codebase. A JS port of
   build/gen-bestiary.py's parse_action (same regex shapes, ported 1:1 so there is never a second damage-
   dice grammar to drift out of sync): pulls atk/dmg/saveDC/saveAbility/kind out of a hand-authored action
   string ("Attack Roll: +5, Hit: 7 (2d6) piercing damage" / "DC 13 Dexterity Saving Throw..."). Pure,
   returns {} (no fields) when nothing recognizable parses — the caller's "keep chassis mechanics" branch
   reads an empty parse as "text parsed to nothing." */
function cmParseActionText(text){
  text = String(text || "").replace(/−/g, "-").replace(/–/g, "-");
  const out = {};
  let mh = text.match(/Attack Roll:\s*([+-]\d+)/) || text.match(/([+-]\d+)\s*to hit/i);
  if(mh) out.atk = parseInt(mh[1], 10);
  const dmg = [];
  const DMG_TYPES = ["acid","bludgeoning","cold","fire","force","lightning","necrotic","piercing","poison","psychic","radiant","slashing","thunder"];
  const reDice = /\((\d+)d(\d+)(?:\s*([+-])\s*(\d+))?\)\s*([A-Za-z]+)/g;
  let dm;
  while((dm = reDice.exec(text))){
    const n = parseInt(dm[1], 10), die = parseInt(dm[2], 10);
    const bonus = (dm[4] ? parseInt(dm[4], 10) : 0) * (dm[3] === "-" ? -1 : 1);
    const typ = dm[5].toLowerCase();
    dmg.push({ n, die, bonus, type: DMG_TYPES.indexOf(typ) >= 0 ? typ : null });
  }
  if(!dmg.length){
    const mflat = text.match(/Hit:\s*\*?_?\s*(\d+)\s+([A-Za-z]+)\s+damage/);
    if(mflat){
      const typ = mflat[2].toLowerCase();
      dmg.push({ n: 0, die: 0, bonus: parseInt(mflat[1], 10), type: DMG_TYPES.indexOf(typ) >= 0 ? typ : null });
    }
  }
  if(dmg.length) out.dmg = dmg;
  let ms = text.match(/DC\s*(\d+)\s*([A-Za-z]+)\s+saving throw/i);
  let saveDC = null, saveAbility = null;
  if(ms){ saveDC = parseInt(ms[1], 10); saveAbility = ms[2].toLowerCase().slice(0, 3); }
  else {
    ms = text.match(/([A-Za-z]+) Saving Throw:\s*DC\s*(\d+)/);
    if(ms){ saveAbility = ms[1].toLowerCase().slice(0, 3); saveDC = parseInt(ms[2], 10); }
  }
  if(saveDC != null){ out.saveDC = saveDC; out.saveAbility = saveAbility; }
  // C3 — parse the range band directly out of authored action text (e.g. "range 80/320 ft.", "range 30 ft.")
  // so a ranged action classifies correctly even when the authoring never uses the literal word "Ranged" —
  // realm actions are authored freely; requiring a token is a silent authoring trap. Feeds the `|| out.range`
  // disjunct just below (previously always dead — out.range was never assigned anywhere in this function).
  const mr = text.match(/range\s+(\d+)(?:\/(\d+))?\s*ft/i);
  if(mr) out.range = { normal: parseInt(mr[1], 10), long: mr[2] != null ? parseInt(mr[2], 10) : parseInt(mr[1], 10) };
  if(/Melee/.test(text)) out.kind = "melee";
  else if(/Ranged/.test(text) || out.range) out.kind = "ranged";
  else if(out.saveDC != null) out.kind = "save";
  else if(out.atk != null && dmg.length) out.kind = "melee";
  return out;
}

/* REALM-TRAITS-APPLY §2 (the apply seam) — mutates a FRESH foe (construction-time only, never a live
   fight) with its realm creature's authored `traits` override ({hp?,ac?,note?,actions?:[{name,text,
   replaces?}]}). Null-safe/graceful-absent throughout (no traits data authored yet). Order of ops per
   spec §2:
     1. hp -> hp+hpMax (never resurrect a damaged foe — this only ever runs at construction);
        ac -> ac.
     2. actions, TWO PASSES (C2 fix — the ONLY way to guarantee an authored `replaces` ("the law") never
        gets silently dropped by processing order): PASS 1 applies every `replaces` entry that matches a
        chassis action, with NO budget check at all — a replacement never competes with additive entries
        for the action-economy cap, because it isn't growing the roster, it's overwriting a slot that
        already existed. A `replaces` entry whose target ISN'T found in the chassis (typo, or the entry
        legitimately has no chassis analog) is NOT silently downgraded to additive here — it's queued and
        logged (console.warn), then PASS 2 gives it one shot at landing additively under the hard budget,
        same as a true additive entry, so it's still capped-with-warning rather than gone without a trace.
        PASS 2 applies every additive entry (queued replace-misses + entries with no `replaces` at all)
        under the HARD `chassisCount+2` cap (the CR-budget law holds) — every entry that doesn't fit logs
        a console.warn naming what was capped. Nothing is EVER dropped without a console.warn.
        When a replace's own text parses to real mechanics (§2.2 divergence license — REALM-ENRICHMENT-
        WRITING's authored numbers are the law, CR-budgeted at authoring time), the parsed mechanics
        REPLACE the chassis's; text that parses to nothing keeps the chassis mechanics under the new name.
     3. note -> f.traitNote (DM-readable, no mechanics).
     4. f.traitsApplied = true (harness hook). */
function cmApplyTraits(f, traits){
  if(!f || !traits) return f;
  const chassisCount = Array.isArray(f.actions) ? f.actions.length : 0;
  if(traits.hp != null){ f.hp = traits.hp; f.hpMax = traits.hp; f.maxHp = traits.hp; }
  if(traits.ac != null) f.ac = traits.ac;
  if(Array.isArray(traits.actions) && traits.actions.length){
    f.actions = Array.isArray(f.actions) ? f.actions.slice() : [];
    const additiveQueue = [];
    // PASS 1 — every `replaces` entry that matches a chassis action lands NOW, no budget check. A miss
    // is logged and queued for pass 2 (never silently reclassified without a trace).
    traits.actions.forEach(entry => {
      if(!entry || !entry.name) return;
      if(!entry.replaces){ additiveQueue.push(entry); return; }
      const wantSlug = String(entry.replaces).toLowerCase();
      const idx = f.actions.findIndex(a => a && a.name && String(a.name).toLowerCase() === wantSlug);
      if(idx >= 0){
        const chassisAction = f.actions[idx];
        const parsed = entry.text ? cmParseActionText(entry.text) : {};
        const parsedHasMechanics = parsed.dmg || parsed.atk != null || parsed.saveDC != null;
        f.actions[idx] = parsedHasMechanics
          ? Object.assign({}, chassisAction, parsed, { name: entry.name, text: entry.text || chassisAction.text })
          : Object.assign({}, chassisAction, { name: entry.name, text: entry.text || chassisAction.text });
      } else {
        console.warn("[cmApplyTraits] replace target not found: " + entry.replaces + " (entry: " + entry.name + ")");
        additiveQueue.push(entry);
      }
    });
    // PASS 2 — additive entries (true additive + queued replace-misses) under the HARD chassisCount+2 cap.
    // Every drop is a console.warn — nothing silent.
    additiveQueue.forEach(entry => {
      if(f.actions.length < chassisCount + 2){
        f.actions.push({ name: entry.name, text: entry.text || "", kind: "other" });
      } else {
        console.warn("[cmApplyTraits] action dropped at chassisCount+2 cap: " + entry.name);
      }
    });
  }
  if(traits.note) f.traitNote = traits.note;
  f.traitsApplied = true;
  return f;
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

/* REVIEW-FIXES-0705 U6 — one shared BESTIARY-by-name/id lookup, replacing 5 copy-pasted
   "exact id OR cmSlug(name)" loops (walk-archetypes.js/monsterHabitatFit, dungeon-walk.js/
   dwalkActivity, walk.js/walkActivity, quest-hook.js/qhookResolveThreatCreature, and this file's
   own resolveCreature). Lazily builds a slug→id index on first call (avoids load-order coupling —
   BESTIARY may not exist yet at combat.js's own load time) and caches it module-level; O(1) after
   the first miss instead of O(510) every call. PURE REFACTOR — behavior-identical to the loops it
   replaces (same exact-id-first, then slug-of-name fallback). Returns the BESTIARY entry (or null),
   NOT a combat foe — callers that need a foe object still route through cmFoeFrom themselves. */
let CM_BESTIARY_SLUG_INDEX = null;
function bestiaryResolve(nameOrId){
  if(typeof BESTIARY === "undefined" || !nameOrId) return null;
  if(BESTIARY[nameOrId]) return BESTIARY[nameOrId];
  if(!CM_BESTIARY_SLUG_INDEX){
    CM_BESTIARY_SLUG_INDEX = {};
    for(const id in BESTIARY){ CM_BESTIARY_SLUG_INDEX[cmSlug(BESTIARY[id].name)] = id; }
  }
  const want = cmSlug(nameOrId);
  const id = want && CM_BESTIARY_SLUG_INDEX[want];
  return id ? BESTIARY[id] : null;
}

/* the first non-"any" activity on a resolved BESTIARY entry, or null (MONSTER-STORY-WIRING §2's
   "first non-any activity, else null" rule, previously duplicated in dwalkActivity/walkActivity). */
function bestiaryActivityOf(entry){
  if(!entry) return null;
  const acts = (entry.activity || []).filter(a => a !== "any");
  return acts.length ? acts[0] : null;
}

/* THE THREAT→STAT-BLOCK RESOLVER (COMBAT.md, Layer 2). The walk layer's creature names come from the
   threat-identity tables, not the asset library — so bridge them: exact/normalized name → CR-band fallback
   (filtered by role/habitat/factionFit when known) → quick-stats. Always returns a combat foe object. */
function resolveCreature(name, hint){
  hint = hint || {};
  if(typeof BESTIARY === "undefined") return cmQuickStats(name, hint.cr);
  const entry = bestiaryResolve(name);
  if(entry) return cmFoeFrom(entry);
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
   asymmetry. When the roll is engine-rolled (no o.d20), the net advantage steers cmRollD20.
   BATTLEMAP.md §1 THE FLANK RULE (LOCKED, melee-only): o.allies (the attacker's own side's roster) is
   consulted via cmFlanked — an ally sharing the target's zone grants advantage, folded into the SAME
   net as conditions (advFlank/advSources.flank). ELEVATION (§1, melee-only): o.attacker.elev truthy
   and o.target.elev falsy grants advantage (downhill strikes) — advElev/advSources.elev. Both are
   melee-only (o.range defaults "melee"; a ranged attack never reads flank/elevation here).
   CRIT-MAGNITUDE (docs/CRIT-MAGNITUDE.md, 2026-07-03 Adam's ruling — "combat crits are still crits and
   the magnitude must be weighed"): a NATURAL 20/1 on the attack die itself (never o.crit's forced-crit
   override — that's a rider/effect crit with no natural roll to spike from) also demands the SAME second
   d20 the skill-check path already rolls via crit.js's rollCritMagnitude — one magnitude engine, no
   parallel system. The result rides the return object as `magnitude` (the crit-outcome atom: tier/scope/
   lenses/canon/etc., or null off-crit) — ORTHOGONAL to damage: SRD mechanics are UNCHANGED here (crit
   still just doubles the dice via cmRollDamage below; a nat-1 is still a flat miss); magnitude never
   touches `damage`. o.magnitude lets a caller pass an already-rolled open d20 (dice transparency) through,
   exactly like o.d20 does for the attack roll itself. */
function resolveAttack(o){
  o = o || {};
  const range = o.range || "melee";
  // derive condition-based advantage/disadvantage from the two combatants (§3), then net it with any
  // explicit o.advantage — a single adv AND a single dis cancel to a straight roll (SRD 2024).
  let advDerived = null, advSources = null;
  if((o.attacker || o.target) && typeof conditionAdvDis === "function"){
    const d = conditionAdvDis({ actor: o.attacker, target: o.target, kind: "attack", range });
    advDerived = d.advantage; advSources = d.sources;
  }
  let netAdv = o.advantage || null;
  if(advDerived){
    if(!netAdv) netAdv = advDerived;
    else if(netAdv !== advDerived) netAdv = null;   // explicit adv + derived dis (or vice-versa) → cancel
  }
  // BATTLEMAP.md §1: flank + elevation are melee-only advantage sources, netted the same way (a single
  // dis source anywhere still cancels a single adv source — SRD 2024's flat "any adv + any dis = none").
  let advFlank = false, advElev = false;
  if(range === "melee"){
    if(o.target && cmFlanked(o.attacker, o.target, o.allies)) advFlank = true;
    if(o.attacker && o.target && o.attacker.elev && !o.target.elev) advElev = true;
  }
  if(advFlank || advElev){
    netAdv = (netAdv === "dis") ? null : "adv";   // a standing dis source cancels; else this grants/confirms adv
  }
  const nat = cmRollD20({ d20: o.d20, advantage: netAdv });
  // the magnitude die (CRIT-MAGNITUDE §1) fires off the NATURAL roll only — same gate rollCritMagnitude
  // itself enforces (natural 20/1 only; returns null otherwise), so a forced o.crit with no natural 20
  // never spikes. o.magnitude passes an already-rolled open d20 through (mirrors o.d20's contract).
  const magnitude = (typeof rollCritMagnitude === "function") ? rollCritMagnitude(nat, { magnitude: o.magnitude }) : null;
  const cov = cmCoverBonus(o.cover);
  if(cov === "full") return { hit: false, crit: false, natural: nat, fullCover: true, damage: 0, breakdown: [], advantage: netAdv, advDerived, advSources, advFlank, advElev, magnitude };
  const total = nat + (o.atkBonus || 0);
  const ac = (o.targetAC || 10) + (cov || 0);
  const crit = (nat === 20) || !!o.crit;
  const autoMiss = (nat === 1);
  const hit = !autoMiss && (crit || total >= ac);
  let damage = 0, breakdown = [];
  if(hit){ const r = cmRollDamage(o.dmg, crit); damage = r.total; breakdown = r.breakdown; }
  return { hit, crit, autoMiss, natural: nat, total, targetAC: ac, damage, breakdown, advantage: netAdv, advDerived, advSources, advFlank, advElev, magnitude };
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
  // DURABILITY-TRIO.md §2: a `rusted` mundane weapon steps its damage die down one size (never worse —
  // rustSteppedDie floors at the ladder's lowest rung). world.durability loads AFTER this file
  // (late-binding call, same convention engine.walk uses for engine.dungeon-walk's dwalkBudget).
  const rustedDie = ((inst.conditions || []).indexOf("rusted") >= 0 && typeof rustSteppedDie === "function")
    ? rustSteppedDie(dice.die) : dice.die;
  const dmg = [{ n: dice.n, die: rustedDie, bonus: (def.damage.bonus || 0) + dmgMod + magicBonus, type: def.damage.type }];
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
    ac += cmRustAcPenalty(aInst);                          // DURABILITY-TRIO.md §2: rusted armor −1 AC
  }
  const oInst = instOf(equipped && equipped.offHand), oDef = baseDef(oInst), oEnch = enchActive(oInst) || {};  // a shield lives in the off-hand slot
  if(oDef && oDef.ac && oDef.ac.shieldBonus){
    ac += oDef.ac.shieldBonus + (oEnch.bonus || 0) + (oEnch.acBonus || 0);
    ac += cmRustAcPenalty(oInst);                          // a rusted shield also loses 1 AC
  }
  return ac;
}
/* DURABILITY-TRIO.md §2 helper: −1 AC for a `rusted` instance, else 0. Isolated so cmEquippedAC's two
   call sites (armor + shield) stay a one-line addend each. */
function cmRustAcPenalty(inst){ return (inst && (inst.conditions || []).indexOf("rusted") >= 0) ? -1 : 0; }

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
  // BATTLEMAP.md §1: optional passthrough so the PC's attack can carry flank/elevation into resolveAttack
  // (attacker/target/allies/range) — every field defaults away cleanly when the caller omits them (the
  // pre-existing flat-targetAC contract is unchanged when o.target is absent).
  const res = resolveAttack({ d20: o.d20, atkBonus, targetAC: o.targetAC, cover: o.cover, advantage: o.advantage, crit: o.crit, dmg: ed.dmg,
    magnitude: o.magnitude, attacker: o.attacker, target: o.target, allies: o.allies, range: o.range });
  return Object.assign({ weaponName: ed.weaponName, baseName: ed.baseName, atkBonus, abilityMod, prof, magicBonus: ed.magicBonus || 0, rider: ed.rider || null }, res);
}

/* ENCUMBRANCE (docs/ITEMS.md Decision 4 — "no barrelmancers") — canonical SRD Carrying Capacity, no
   variant. carryTotals sums instance weights (congruent: magic instances weigh their base). carryState
   returns the whole picture: over STR×15 (soft) → Speed drops to 5 ft (`speedCap`); you cannot carry over
   STR×30 (hard) at all (`overHard` — the anvil won't budge). Capacity keys off the STR SCORE (not the mod).
   PURE — the movement/combat layer reads speedCap; item_changed refuses an add that would breach hard. */
// weight of ONE inventory instance — bundle items (bag-of-N gear) weigh their fixed bag total,
// qty ignored; everything else is per-unit × qty. THE one place instance-weight is computed
// (HQ3-A1 — carryTotals and the item_changed add-weight reducer both route through this).
function instWeight(inst){
  const d = baseDef(inst); if(!d) return 0;
  const w = (typeof d.weight === "number") ? d.weight : 0;
  return d.bundle ? w : w * (inst.qty || 1);
}
function carryTotals(inventory){
  return (inventory || []).reduce((sum, it) => sum + instWeight(it), 0);
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

/* §1 deterministic seeded scatter: a tiny string-hash so the SAME segment id always produces the SAME
   placement (BATTLEMAP.md §1: "re-entering a room rebuilds the same board"). No dependency on Math.random
   or the app's dice roller — pure function of the string, so it works identically in a fresh session. */
function cmSeedHash(s){
  s = String(s || "");
  let h = 0;
  for(let i = 0; i < s.length; i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

/* §2 THE MOVE VALIDATOR — `move_zone{who,band?,lane?}` (BATTLEMAP.md §2). Validates a requested zone
   move against the combatant's remaining zone-steps THIS turn (1, or 2 with Dash — mirrors moveBand's
   existing dash arg) and the room's own grid ceiling (never move into a band/lane the rolled room
   doesn't have). A band-STEP and a lane-STEP together (a diagonal) count as ONE move (BATTLEMAP.md §1).
   PURE: takes the mover + the grid + the requested delta, returns {ok, band, lane, reason?} — never
   mutates (caller applies band/lane on ok, mirrors moveBand's contract of the caller still calling it).
   `budget` = the zone-step allowance for THIS one move (default 1, 2 if o.dash) — a per-call cap, not a
   per-turn counter; it does NOT by itself stop a combatant re-calling this validator repeatedly in the
   same turn. The caller (world/dm.js's `move_zone` case) is what tracks whether this combatant already
   spent their turn's movement, via `mover.budget.moved` — the SAME flag combat-actions.js's Dash
   standardAction sets — checked BEFORE this validator ever runs and set after a real (non-zero-step)
   move succeeds. */
function moveZoneValidate(mover, grid, o){
  o = o || {};
  if(!mover) return { ok: false, reason: "no-combatant" };
  const g = grid || { bands: CM_BANDS.slice(), lanes: CM_LANES.slice() };
  const bands = g.bands || CM_BANDS;
  const lanes = g.lanes || CM_LANES;
  const curBandIdx = CM_BANDS.indexOf(mover.band || "melee");
  const curLaneIdx = CM_LANES.indexOf(mover.lane || "C");
  const wantBand = o.band != null ? o.band : mover.band;
  const wantLane = o.lane != null ? o.lane : mover.lane;
  const wantBandIdx = CM_BANDS.indexOf(wantBand);
  const wantLaneIdx = CM_LANES.indexOf(wantLane);
  if(wantBandIdx < 0) return { ok: false, reason: "bad-band" };
  if(wantLaneIdx < 0) return { ok: false, reason: "bad-lane" };
  if(bands.indexOf(wantBand) < 0) return { ok: false, reason: "band-not-in-room" };
  if(lanes.indexOf(wantLane) < 0) return { ok: false, reason: "lane-not-in-room" };
  const bandSteps = Math.abs(wantBandIdx - curBandIdx);
  const laneSteps = Math.abs(wantLaneIdx - curLaneIdx);
  // BATTLEMAP.md §1: "1 zone per move (band-step OR lane-step; diagonal = one move), 2 with Dash."
  // A single move covers ONE zone-step on EACH axis at most (a diagonal moves both axes together in
  // that one step) — so a legal move's per-axis step count can never exceed the move budget itself
  // (2 straight bands under Dash is fine; 2 bands AND 2 lanes at once is not a real diagonal, it's two
  // different diagonals' worth of ground — reject it as not-adjacent-enough-to-be-one-line-of-travel).
  const stepsNeeded = Math.max(bandSteps, laneSteps);
  const budget = (o.dash ? 2 : 1);
  if(stepsNeeded > budget) return { ok: false, reason: "too-far", stepsNeeded, budget };
  if(bandSteps > budget || laneSteps > budget) return { ok: false, reason: "not-adjacent" };
  return { ok: true, band: wantBand, lane: wantLane, bandSteps, laneSteps, leftMelee: (mover.band === "melee" && wantBand !== "melee") };
}

/* R8a — the ONE helper that carries a foe's STORY fields (realm/desc/realmRole/bossSlot/displaced/doing/
   spawnDisposition/nonHostile) plus the traits override, used by BOTH cmResolveFoe and combatFromEncounter
   so a future 6th story field is added exactly once instead of drifting between the two call sites.
   `spec` is a normalized bag: { realm, desc, realmRole, bossSlot, displaced, behavior, activity,
   spawnDisposition, nonHostile, traits }. All null-safe/additive — a spec with none of these fields leaves
   `foe` byte-identical to before this call.
   C1 — foe.traits keeps its ORIGINAL meaning (the chassis SRD trait array, e.g. Pack Tactics, stamped by
   cmFoeFrom/BESTIARY at construction). A realm creature's traits OVERRIDE BLOB is a different shape under
   the same key — previously overwritten onto foe.traits (self-documented latent bug); now the override
   blob is stamped on `foe.override` (provenance/debug) instead, and cmApplyTraits is called directly with
   the override blob (never re-reading it back off foe.traits). */
function cmStampFoeStory(foe, spec){
  if(!foe || !spec) return foe;
  if(spec.realm) foe.realm = spec.realm;
  if(spec.desc) foe.desc = spec.desc;
  if(spec.realmRole) foe.realmRole = spec.realmRole;
  if(spec.bossSlot) foe.bossSlot = true;
  if(spec.displaced) foe.displaced = true;
  const doing = spec.behavior || spec.activity || null;
  if(doing && !foe.doing) foe.doing = doing;
  if(spec.spawnDisposition) foe.spawnDisposition = spec.spawnDisposition;
  if(spec.nonHostile) foe.nonHostile = true;
  if(spec.traits){ foe.override = spec.traits; cmApplyTraits(foe, spec.traits); }
  return foe;
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
    // MONSTER-TACTICS §1 ladder step 2: the walk-layer encounter's rolled "Behavior" text (wilderness
    // enc.behavior / dungeon-boss bossBehavior / urban compT — the walk types don't share one field name,
    // so the caller normalizes to `f.behavior` before this — see combatFromEncounter).
    if(f.behavior) foe.behavior = f.behavior;
    // R8a / REALM-STORY-WIRING §1 / MONSTER-STORY-WIRING §1-3 / REALM-TRAITS-APPLY §1-2 — a combat_start
    // foe spec built off a realm-filtered walk slot (or a DM declaring one straight from the codex/walk
    // digest) carries the story fields alongside the usual name/statId — this is the OTHER foe-resolve
    // path (combatFromEncounter's own stamp only covers walk-derived encounters that go through IT;
    // combatStart→cmResolveFoe is what combat_start's applyEvent case actually calls), so it needs the
    // same cmStampFoeStory call combatFromEncounter makes, or a DM-declared realm foe silently loses its
    // story identity at the seam.
    cmStampFoeStory(foe, f);
  }
  if(!foe.victimClass) foe.victimClass = "monster";
  return foe;
}

/* §1 place a foe's LANE — deterministic (seeded by segment id + the foe's fid, never Math.random, so
   re-entering the same room rebuilds the same board per BATTLEMAP.md §1). Ambushers/ranged roles land
   off-lane (L/R) by default so they don't stack on the PC's melee lane; a "pack"/horde role SPREADS
   across all available lanes by index. Anything else defaults center (the common "it's just a guard"
   case). Clamped to the room's actual lane set (cmZoneGrid). */
function cmPlaceFoeLane(foe, idx, laneSet, seed){
  const lanes = (laneSet && laneSet.length) ? laneSet : CM_LANES;
  if(lanes.length <= 1) return lanes[0];
  if(foe && (foe.role === "pack" || foe.role === "horde")) return lanes[idx % lanes.length];
  if(foe && (foe.role === "ambusher" || foe.role === "skirmisher")){
    const off = lanes.filter(l => l !== "C");
    if(off.length) return off[(cmSeedHash(seed + ":" + (foe.fid || idx)) ) % off.length];
  }
  return "C";
}

/* START A FIGHT — builds the transient combat object (COMBAT.md, GS.combat). Resolves every foe to real
   stats, rolls side-based initiative. PURE: returns the object; the caller stashes it in GS.combat (the
   engine never writes app state). `pc` carries {init|mods.dex}; `foes` = specs; `objectiveRef` gates XP.
   BATTLEMAP.md §1: `o.segment` (optional) carries the rolled room's {dims, feature, hazard} — the zone
   grid derives from `o.segment.dims` (cmZoneGrid; absent/unparseable dims -> the full 4x3). `o.segmentId`
   (or o.segment.id) seeds the deterministic lane placement — omitted, placement still runs (seeded off
   an empty string) but won't reproduce identically across two different fights with no id supplied.
   PLACE-GEN.md ADDENDUM §A / §7 unit 11: `o.cellDims` (optional {w,d} in 5-ft CELLS) wins PRIORITY over
   `o.segment.dims` text — engine purity means combat.js never reads the codex/w itself, so the caller
   (world/dm.js's combat_start handler) resolves whether the fight's node is bound to a typed place record
   and passes the cell footprint IN, same as env/scene data already flows in above. No typed record (or a
   non-jsdom caller that never passes cellDims) -> the text-parse path is BYTE-IDENTICAL to before this unit. */
function combatStart(o){
  o = o || {};
  const hint = o.hint || {};
  const segment = o.segment || null;
  const cellGrid = o.cellDims ? cmGridFromCells(o.cellDims) : null;
  const grid = cellGrid ? cmZoneGridFromCounts(cellGrid) : cmZoneGrid(segment && segment.dims);
  const seed = o.segmentId || (segment && segment.id) || "";
  const foes = (o.foes || []).map((f, i) => {
    const foe = cmResolveFoe(f, hint); foe.fid = "f" + (i + 1);
    foe.lane = cmPlaceFoeLane(foe, i, grid.lanes, seed);
    return foe;
  });
  const pc = o.pc || {};
  const pcInit = (pc.init != null) ? pc.init : ((pc.mods && pc.mods.dex) || 0);
  const foeInit = foes.length ? Math.max.apply(null, foes.map(f => f.init || 0)) : 0;
  const ini = rollInitiative(pcInit, foeInit, o.pcRoll, o.foeRoll);
  // BATTLEMAP.md §1: ELEVATION + hidden hazard zones ride on `scene`, additive to the pre-existing
  // {cover,hazards,exits} shape (G0 minimal-diff — no existing scene consumer's fields are touched).
  //   elevZones: string[] of "band:lane" keys carrying a dais/balcony/perch/terrace (melee from one of
  //     these vs a target NOT on one gets resolveAttack's advElev — see cmZoneElev below).
  //   hazardZones: [{zone:"band:lane", kind, revealed}] — a trap/hazard anchored to a zone, HIDDEN
  //     (absent from the player-facing DOM) until `revealed` flips true (spotted/triggered — the DM
  //     holds placement via a `dm`-only note upstream of this transient object, per §1's "the DM holds
  //     placement via `dm`; the reveal is play").
  const scene = cmNormalizeScene(o.scene || { cover: {}, hazards: [], exits: [] });
  if(!scene.elevZones) scene.elevZones = [];
  if(!scene.hazardZones) scene.hazardZones = [];
  const combat = {
    active: true, round: 1, first: ini.first, side: ini.first, initiative: ini,
    pcRef: pc, pc: { band: "melee", lane: "C" }, foes,
    objectiveRef: o.objectiveRef || null, method: o.method || "combat",
    scene, ledgerRefs: [],
    grid, segment: segment || null
  };
  cmNormalizeCombatPlacement(combat);
  combat.pc.elev = cmZoneElev(combat, combat.pc.band, combat.pc.lane);
  foes.forEach(f => { f.elev = cmZoneElev(combat, f.band || "melee", f.lane || "C"); });
  return combat;
}

// The DM-facing event vocabulary naturally emits cover as either a zone-key map or a short list of
// named obstacles. Normalize the list at the engine/reload boundary; otherwise Object.keys(array)
// exposes "0", "1" to the digest/UI and the actual cover names disappear after a valid start.
function cmNormalizeScene(scene){
  scene=scene||{cover:{},hazards:[],exits:[]};
  if(Array.isArray(scene.cover)) scene.cover=scene.cover.reduce((acc,name)=>{
    if(name!=null&&String(name).trim())acc[String(name)]=true;
    return acc;
  },{});
  return scene;
}

/* is the zone "band:lane" flagged elevated (dais/balcony/perch/terrace) on this combat's scene? */
function cmZoneElev(combat, band, lane){
  const zones = (combat && combat.scene && combat.scene.elevZones) || [];
  return zones.indexOf(cmZoneKey(band, lane)) >= 0;
}
/* stamp a combatant's transient `.elev` flag from the scene's elevZones — call after any move (band/lane
   change) so resolveAttack's o.attacker.elev/o.target.elev reads stay current. Mutates `c`, returns it. */
function cmStampElev(combat, c){
  if(!c) return c;
  c.elev = cmZoneElev(combat, c.band || "melee", c.lane || "C");
  return c;
}
/* a hazard zone's visibility gate — hidden (absent from the player-facing DOM) until revealed. Pure
   read; the caller (render.js) filters combat.scene.hazardZones through this before rendering. */
function cmHazardVisible(hz){ return !!(hz && hz.revealed); }

/* §1 COVER MODIFIES CROSSING ATTACKS — `scene.zoneCover = {"band:lane": "half"|"three-quarters"|"full"}`
   is the target ZONE's own cover (a feature/terrain marker occupying or fronting that zone); an attack
   originating from a DIFFERENT zone than the target's "crosses" whatever cover the target's zone grants
   (an attacker sharing the target's exact zone has no cover between them — point-blank). Returns the
   cmCoverBonus-ready string/0, additive to any o.cover the caller already supplies (the caller/DM can
   still narrate an explicit one-off; this is the STANDING zone cover). Null-safe: no zoneCover entry ->
   no bonus, unaffected by everything else in this file. */
function cmZoneCover(combat, attacker, target){
  if(!attacker || !target) return 0;
  const sameZone = (attacker.band || "melee") === (target.band || "melee") && (attacker.lane || "C") === (target.lane || "C");
  if(sameZone) return 0;
  const zc = (combat && combat.scene && combat.scene.zoneCover) || {};
  return zc[cmZoneKey(target.band || "melee", target.lane || "C")] || 0;
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
  // REALM-WIRING §3/§4: a realm-filtered slot (src/engine/dungeon-walk.js's dwalkEncounter, in a
  // breach) stamps statId/modelKey/cr/realm alongside the usual `creature` name string — carried
  // through here so the resolver below can go straight to BESTIARY[statId] (the real reskin chassis)
  // instead of re-resolving `c.creature`'s REALM name through resolveCreature's slug match, which
  // would almost never hit BESTIARY (realm creature names aren't bestiary entries) and silently fall
  // to the CR-band placeholder, losing the frame/model linkage entirely. A normal (non-realm) slot
  // has none of these fields — undefined passes through as a harmless no-op below.
  if(Array.isArray(enc.creatures)) names = enc.creatures.map(c => ({ name: c.creature, slot: c.slot,
    statId: c.statId, modelKey: c.modelKey, cr: c.cr, realm: c.realm,
    desc: c.desc || null, realmRole: c.realmRole || null,
    // MONSTER-STORY-WIRING §1/§2/§3: dungeon/urban slots stamp bossSlot/activity/displaced directly
    // on the creature spec (no per-encounter behavior roll exists for these two walk types) — carried
    // through the same way statId/realm already are. Absent on a non-monster-story-wiring slot
    // (undefined passes through as a harmless no-op below).
    bossSlot: c.bossSlot || undefined, activity: c.activity || null, displaced: c.displaced || undefined,
    // ANOMALY LAW §2b: the rare per-slot friendly-spawn stamp (rollFriendlySpawn, dungeon-walk.js),
    // carried the same way bossSlot/displaced already are. Absent on the overwhelmingly common
    // ordinary slot (undefined passes through as a harmless no-op below).
    spawnDisposition: c.spawnDisposition || undefined, nonHostile: c.nonHostile || undefined,
    // REALM-TRAITS-APPLY §1: the realm creature's own traits override blob, carried the same way.
    traits: c.traits || null }));
  // REALM-WALK-WIRING §1: wilderness's single-creature shape (no multi-slot composition) carries the
  // SAME realm fields a realm-tagged array slot does — a non-realm encounter has none of these
  // (undefined passes through as a harmless no-op below, same as the array branch above).
  else if(enc.creature) names = [{ name: enc.creature,
    statId: enc.statId, modelKey: enc.modelKey, cr: enc.cr, realm: enc.realm,
    desc: enc.desc || null, realmRole: enc.realmRole || null,
    // MONSTER-STORY-WIRING §1/§2: wilderness's already-rolled `behavior` + the §1 displaced stamp
    // (no bossSlot — wilderness has no boss slot, a single "elite"-role pull per §0/§1).
    displaced: enc.displaced || undefined,
    // ANOMALY LAW §2b: wilderness's single-encounter friendly-spawn stamp, same pass-through as above.
    spawnDisposition: enc.spawnDisposition || undefined, nonHostile: enc.nonHostile || undefined,
    // REALM-TRAITS-APPLY §1: carried the same way as the array branch above.
    traits: enc.traits || null }];
  // TRAVEL-WALKS §1.7 / §4.5: a "Faction Clash" Enemy segment (wild-walk.js/dungeon-walk.js/walk.js)
  // carries `enc.factions` instead of `.creature`/`.creatures` — no other Enemy subtype does, so this
  // only engages when the two branches above found nothing. Shape is heterogeneous across the three
  // walk generators (bare category-name strings in dungeon-walk.js/walk.js; {name,creatures} objects
  // in wild-walk.js) — normalize both to one resolvable name per faction side so the clash is a
  // startable combat like every other Enemy segment, per the spec's plain reading ("an Enemy segment
  // feeds combatFromEncounter" — no Faction Clash carve-out).
  // fac.creatures is the raw authored wilderness-enemy-category CELL TEXT for that category
  // ("Wolves, Dire Wolves, Hell Hounds") — a COMMA-joined list, not a single creature name. Passing it
  // whole to resolveCreature can never match BESTIARY (cmSlug of the whole string), so it always fell
  // through to the statless placeholder (statId:null, cr:0.25). NB this is comma-delimited, NOT the
  // "A / B / C" slash-pool format resolveArchetypePool/walkPickFromPool split on elsewhere in this
  // file's wilderness-archetype callers — running it through those unchanged would silently fail to
  // split (single-element "authored" array) whenever their bestiary-floor branch fires, so split on
  // ',' ourselves first and resolve the live roster off ONE picked category-member name, mirroring
  // wwalkEncounter's live-roster intent without depending on a delimiter these cells don't use.
  else if(Array.isArray(enc.factions) && enc.factions.length){
    names = enc.factions.map(fac => {
      if(typeof fac === "string") return { name: fac };
      if(!fac) return null;
      const pool = fac.creatures || fac.name;
      if(!pool) return null;
      const members = String(pool).split(",").map(s => s.trim()).filter(Boolean);
      const picked = members.length
        ? ((typeof pick === "function") ? pick(members) : members[0])
        : pool;
      const label = (typeof resolveArchetypePool === "function")
        ? resolveArchetypePool(fac.name, { tier: ctx.tier || 1, biome: null, slot: null }, picked)
        : picked;
      return label ? { name: label } : null;
    }).filter(Boolean);
  }
  // MONSTER-TACTICS §1 ladder step 2: the walk layer's "rolled behavior" text lives under a different key
  // per walk type (wilderness: enc.behavior · dungeon boss: enc.bossBehavior · urban: enc.tactic) — normalize
  // to one string here so proposeTactic never has to know which walk produced the encounter.
  const behavior = enc.behavior || enc.bossBehavior || enc.tactic || null;
  return names.map(n => {
    // REALM-WIRING §4 — a realm-tagged slot resolves its STATS directly off statId (BESTIARY[statId],
    // the frame chassis) rather than re-resolving n.name (the realm creature's own name, which won't
    // slug-match any bestiary entry) through resolveCreature. cmFoeFrom's own `label` param is the
    // guard that makes the realm `name` override stick verbatim over the chassis's real name.
    const f = (n.statId && typeof BESTIARY !== "undefined" && BESTIARY[n.statId])
      ? cmFoeFrom(BESTIARY[n.statId], n.name)
      : resolveCreature(n.name, { cr: ctx.cr, role: ctx.role, habitat: ctx.habitat, faction: ctx.faction });
    if(n.modelKey) f.modelKey = n.modelKey;   // REALM-WIRING §4 — carried to theaterUnitsFrom for render-model preference
    if(n.cr != null && f.cr == null) f.cr = n.cr;
    if(ctx.factionId) f.factionId = ctx.factionId;
    f.victimClass = ctx.victimClass || (ctx.factionId ? "hostile" : "monster");
    if(behavior) f.behavior = behavior;
    // R8a — the same cmStampFoeStory helper cmResolveFoe calls (REALM-STORY-WIRING §1 / MONSTER-STORY-
    // WIRING §1-3 / ANOMALY LAW §2b / REALM-TRAITS-APPLY §1-2): realm/desc/realmRole/bossSlot/displaced/
    // doing(behavior||activity)/spawnDisposition/nonHostile + the traits-override apply (C1: lands on
    // foe.override, NOT foe.traits — see cmStampFoeStory's own doc comment).
    cmStampFoeStory(f, { realm: n.realm, desc: n.desc, realmRole: n.realmRole, bossSlot: n.bossSlot,
      displaced: n.displaced, behavior: behavior, activity: n.activity,
      spawnDisposition: n.spawnDisposition, nonHostile: n.nonHostile, traits: n.traits });
    return f;
  });
}

/* §1 THE FLANK RULE (BATTLEMAP.md §0/§1, LOCKED): a melee attack gains advantage when >=1 non-
   incapacitated ALLY of the attacker occupies the TARGET's zone (band+lane). Symmetric — works for
   either side (the PC flanking a foe, or foes flanking the PC). PURE: `attacker`/`target` are the
   combat objects with .band/.lane; `allies` is the attacker's own side's roster (the caller passes
   combat.foes when attacker is a foe, or [pc] when the attacker is the PC — the PC has no allies
   tracked in GS.combat v1, so PC-side flanking is inert until companions occupy zones, a documented
   gap, not a bug). Returns true/false; never mutates. */
function cmFlanked(attacker, target, allies){
  if(!attacker || !target) return false;
  allies = allies || [];
  return allies.some(a =>
    a && a !== attacker && !a.down &&
    (a.band || "melee") === (target.band || "melee") &&
    (a.lane || "C") === (target.lane || "C"));
}

/* §1 AoE GEOMETRY (BATTLEMAP.md §1 "honest at last"): given a shape + origin zone {band,lane} (+ `dir`
   for a line/cone's facing — "deeper" = toward higher band index, "shallower" = toward lower; for a
   cone, `dir` also carries the LANE side it opens toward: "L"|"C"|"R"), returns the zone-key list
   ["band:lane", ...] the DM narrates as caught. PURE — a zone list, no mutation, no combatant lookup
   (the caller cross-refs combat.foes/pc against the returned keys).
     line  = one lane across N bands (origin's lane, every band from origin to the grid's far edge)
     burst = the origin zone + its 4 orthogonal neighbors (band±1 same lane, lane±1 same band)
     cone  = the origin zone + the two zones ONE BAND FARTHER, offset toward dir's lane (flares outward)
   Zones outside the room's actual grid are dropped (never invents past the rolled geometry). */
function cmZoneKey(band, lane){ return band + ":" + lane; }
function aoeZones(shape, origin, dir, grid){
  origin = origin || { band: "melee", lane: "C" };
  grid = grid || { bands: CM_BANDS.slice(), lanes: CM_LANES.slice() };
  const bands = grid.bands || CM_BANDS;
  const lanes = grid.lanes || CM_LANES;
  const inGrid = (b, l) => bands.indexOf(b) >= 0 && lanes.indexOf(l) >= 0;
  const bi = CM_BANDS.indexOf(origin.band || "melee");
  const li = CM_LANES.indexOf(origin.lane || "C");
  const out = [];
  const add = (b, l) => { if(inGrid(b, l)) out.push(cmZoneKey(b, l)); };
  if(shape === "line"){
    bands.forEach(b => add(b, origin.lane || "C"));
  } else if(shape === "burst"){
    add(origin.band, origin.lane || "C");
    if(bi > 0) add(CM_BANDS[bi - 1], origin.lane || "C");
    if(bi >= 0 && bi < CM_BANDS.length - 1) add(CM_BANDS[bi + 1], origin.lane || "C");
    if(li > 0) add(origin.band, CM_LANES[li - 1]);
    if(li >= 0 && li < CM_LANES.length - 1) add(origin.band, CM_LANES[li + 1]);
  } else if(shape === "cone"){
    // BATTLEMAP.md §1 EXACT wording: "cone = one zone [the origin] + the two zones flanking it one
    // band farther" — the flare is the two LANE-ADJACENT zones at the farther band, not a third
    // straight-ahead zone (a cone widens, it doesn't also reach dead center one band out).
    add(origin.band, origin.lane || "C");
    const farBandIdx = bi + (dir === "shallower" ? -1 : 1);
    const farBand = CM_BANDS[farBandIdx];
    if(farBand){
      if(li > 0) add(farBand, CM_LANES[li - 1]);
      if(li < CM_LANES.length - 1) add(farBand, CM_LANES[li + 1]);
      // an origin already at a lane edge (no li-1/li+1 neighbor) still needs the cone to reach
      // somewhere at the farther band — fall back to straight-ahead only when BOTH flanks are absent.
      if(li <= 0 && li >= CM_LANES.length - 1) add(farBand, origin.lane || "C");
    }
  }
  // de-dupe (burst/cone can revisit the origin zone through more than one branch above).
  return out.filter((k, i) => out.indexOf(k) === i);
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
    victimClass: f.victimClass || "monster", factionId: f.factionId || null, victimId: f.codexId || null,
    cr: f.cr!=null?f.cr:null, at: f.at!=null?f.at:null
  } }));
  return { encounter, kills };
}
