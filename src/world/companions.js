/* GENESIS MODULE — src/world/companions.js — HIRELINGS + THE ONE SIDEKICK (docs/COMPANIONS.md).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   Two tiers, both real economy sinks, both with death that stays dead (rebirth is PC-only, §0):
     - HIRELINGS — non-leveling specialists; wages; a loyalty clock; tactics-engine-driven in combat.
     - THE SIDEKICK — ONE slot; a Tasha's-model leveling companion (promoted from an existing codex NPC,
       CR<=1/2, + one sidekick class from data/sidekick-classes.js); player-driven in combat.

   w.companions = {sidekickId, hirelings:[{id,codexId,name,role,wage,loyalty,hiredDay,shares,statBase}]}
   — pure ledger/state math (mirrors world.reputation's "the engine owns the numbers" split); the DM only
   narrates §2's voice protocol (frontier prose, out of this unit's build scope — CLAUDE.md/G0). */

function companionsOf(w){
  if(!w.companions) w.companions = { sidekickId:null, hirelings:[] };
  if(!Array.isArray(w.companions.hirelings)) w.companions.hirelings = [];
  // MONSTER-PARLEY §2 (tier "pet"): a third, separate roster — non-leveling, no wages, tactics-
  // engine-driven like a hireling but a BOND with upkeep (neglect), not a payroll line. Kept off the
  // `hirelings` array on purpose so companionChargeWages' wage-charging loop never touches a pet.
  if(!Array.isArray(w.companions.pets)) w.companions.pets = [];
  return w.companions;
}

/* ============================================================================
   §1 — Hirelings: minting, wages, loyalty
   ============================================================================ */

const HIRELING_ROLE_WAGE = { porter:0.5, torchbearer:0.5, skilled:2, blade:2 };  // gp/day (porter/torchbearer = 1gp/2days = 0.5gp/day)
const LOYALTY_MIN = 0;
const LOYALTY_MAX = 6;
const LOYALTY_START = 3;
const LOYALTY_SIDEKICK_START = 5;

function companionClampLoyalty(n){ return Math.max(LOYALTY_MIN, Math.min(LOYALTY_MAX, Math.round(Number(n)||0))); }

/* HIRE — mints a hireling FROM AN EXISTING ROLLED CODEX NPC (docs/COMPANIONS.md §1: "always a ROLLED
   NPC ... never freehand"). codexId must resolve to a kind:"npc" record whose provenance is one of the
   MECHANICAL provenances (rolled/recontextualized/prep — CODEX_MECH_PROV, src/world/codex.js) — an
   authored/freehand NPC is refused (the mutation check BATCH2-GUARDRAILS/§5 names: "allow a freehand
   hire, harness fails"). Renown bias (§1 "the PC's renown valence with the hireling's faction (+/-1 bias
   at hire)") applies when repuFactionOf/repuOf resolve a faction for the NPC — null-safe no-op otherwise. */
function hireCompanion(w, o){
  o = o || {};
  const codexId = o.codexId;
  if(!codexId || typeof codexGet !== "function") return { ok:false, reason:"no-codex-id" };
  const rec = codexGet(w, codexId);
  // MONSTER-PARLEY §2 (tier "hireling"): an intelligent CREATURE that's earned Helpful is exactly as
  // hireable as a rolled NPC — recruit_creature's own +2-attitude gate does the friendship-earned
  // check BEFORE calling here, so this guard only needs to widen the SHAPE gate, not re-litigate it.
  if(!rec || (rec.kind !== "npc" && rec.kind !== "creature")) return { ok:false, reason:"not-an-npc" };
  if(typeof codexIsMechanical === "function" && !codexIsMechanical(rec))
    return { ok:false, reason:"not-rolled" };           // the freehand-hire guard (mutation check)
  const C = companionsOf(w);
  if(C.hirelings.some(h => h.codexId === codexId)) return { ok:false, reason:"already-hired" };
  const role = o.role || "porter";
  const wage = (typeof o.wage === "number") ? o.wage : (HIRELING_ROLE_WAGE[role] != null ? HIRELING_ROLE_WAGE[role] : HIRELING_ROLE_WAGE.porter);
  let bias = 0;
  if(typeof repuFactionOf === "function" && typeof repuOf === "function"){
    const fk = repuFactionOf(w, codexId);
    if(fk){ const r = repuOf(w).factions[fk]; if(r && typeof r.score === "number") bias = r.score > 0 ? 1 : (r.score < 0 ? -1 : 0); }
  }
  const h = {
    id: (typeof uid === "function") ? uid() : ("hire-" + Date.now()),
    codexId, name: rec.name, role, wage,
    loyalty: companionClampLoyalty(LOYALTY_START + bias),
    hiredDay: (typeof clockOf === "function") ? clockOf(w).day : 1,
    shares: o.shares || null, unpaidDays: 0,
  };
  C.hirelings.push(h);
  if(typeof codexUpdate === "function") codexUpdate(w, codexId, { status:{ at: w.currentNodeId||null } });
  if(typeof addLedger === "function")
    addLedger(w, "outcome", { kind:"hire", codexId, role, wage }, "✦ " + rec.name + " joins as " + role + " — " + wage + " gp/day.");
  return { ok:true, hireling:h };
}

/* DISMISS — releases a hireling (no death, no grief thread; a clean parting). Sidekick departure is a
   SEPARATE path (companionSidekickLeaves, §3 "loyalty 0 = they LEAVE") — dismiss never targets the slot. */
function dismissCompanion(w, hirelingId){
  const C = companionsOf(w);
  const i = C.hirelings.findIndex(h => h.id === hirelingId);
  if(i < 0) return { ok:false, reason:"not-found" };
  const h = C.hirelings.splice(i, 1)[0];
  if(typeof addLedger === "function")
    addLedger(w, "outcome", { kind:"dismiss", codexId:h.codexId, role:h.role }, "✦ " + h.name + " is let go.");
  return { ok:true, hireling:h };
}

/* WAGE CHARGING — called from the montage/downtime path (passTime, ECONOMY-SINKS-style: never blocks
   the rest; unpaid compounds loyalty, §1). Charges every hireling `wage * days` against the resting PC's
   gold; a shortfall pays what's available and marks the rest unpaid (loyalty penalty applies once per
   charge call, not per elapsed day — mirrors the lodging sink's single ledger line per rest). */
function companionChargeWages(w, days, pc){
  const C = companionsOf(w);
  if(!C.hirelings.length || !pc || !pc.sheet) return [];
  const out = [];
  C.hirelings.forEach(h => {
    const due = Math.round((h.wage||0) * (days||1) * 100) / 100;
    if(due <= 0) return;
    const have = pc.sheet.gold || 0;
    const charge = Math.min(have, due);
    const short = due - charge;
    if(charge > 0 && typeof applyEvent === "function")
      applyEvent(w, { type:"item_changed", payload:{ gold:-charge, note:"Wages — " + h.name + " (" + charge + " gp)." } });
    if(short > 0){
      h.unpaidDays = (h.unpaidDays||0) + 1;
      companionAdjustLoyalty(w, h, -1, "unpaid wages");
      // compounding: a SECOND consecutive unpaid charge costs an extra point (§1 "unpaid (-, and compounding)")
      if(h.unpaidDays >= 2) companionAdjustLoyalty(w, h, -1, "wages unpaid again");
    } else {
      h.unpaidDays = 0;
      companionAdjustLoyalty(w, h, 1, "paid on time");
    }
    if(typeof addLedger === "function")
      addLedger(w, "outcome", { kind:"wage", hirelingId:h.id, name:h.name, due, charged:charge, unpaid:short },
        short > 0 ? ("Wages — " + h.name + ": " + charge + " gp (" + short + " gp unpaid).") : ("Wages — " + h.name + ": " + charge + " gp."));
    out.push({ hirelingId:h.id, due, charged:charge, unpaid:short });
  });
  return out;
}

/* LOYALTY — bounded adjustment (§1: 0-6 clock, start 3). `cause` is a free-text ledger note; deltas come
   from: paid on time (+1) / unpaid (-1, compounding) / danger beyond the bargain (-1, caller-declared) /
   a gift (+1, §1 "gifts (+, codex.gifts[])" — codex.gifts[] is NOT YET BUILT (docs/LOOSE-ENDS-070126.md
   §1, sequenced AFTER companions per BATCH2-GUARDRAILS H4) so this reads it defensively: present ->
   +1 per gift entry newer than the hireling's last-read watermark; absent -> the `gift` applyEvent case
   already exists (src/world/dm.js) and this function is the one a caller invokes directly on receipt. */
function companionAdjustLoyalty(w, hireling, delta, cause){
  if(!hireling) return null;
  const before = hireling.loyalty;
  hireling.loyalty = companionClampLoyalty((hireling.loyalty||0) + delta);
  if(hireling.loyalty !== before && typeof addLedger === "function")
    addLedger(w, "outcome", { kind:"loyalty", hirelingId:hireling.id, name:hireling.name, from:before, to:hireling.loyalty, cause },
      hireling.name + "'s loyalty " + (hireling.loyalty > before ? "rises" : "falls") + " (" + cause + ").");
  if(hireling.loyalty <= LOYALTY_MIN && before > LOYALTY_MIN) companionDesert(w, hireling);
  return hireling.loyalty;
}

/* a gift landing on a hireling's linked NPC (codex.gifts[]-shaped input, degrading gracefully if that
   array isn't populated yet — see the note above). Sidekicks are pay-immune (§3) but gift-movable, same
   call. */
function companionReceiveGift(w, companion, opts){
  opts = opts || {};
  return companionAdjustLoyalty(w, companion, 1, opts.what ? ("a gift: " + opts.what) : "a gift");
}

/* DANGER beyond the bargain — the caller (combat/encounter resolution, out of this unit's wiring scope
   per BATCH-GUARDRAILS: no drive-by edits to combat.js) declares this explicitly. */
function companionDangerBeyondBargain(w, companion, reason){
  return companionAdjustLoyalty(w, companion, -1, reason || "led into danger beyond the bargain");
}

/* DESERTION (loyalty 0) — an npc-life-style ledger entry + a grievance thread (deserters TALK, feeding
   Distant Word / REPUTATION per §1). Removes the hireling from the roster; the codex record persists
   (soft-pool eligible again). Mirrors turnMintSuccessorThread's shape (src/world/turn.js §4) without
   requiring a thread link (desertion isn't a death — no successor needed, just the grievance handle). */
function companionDesert(w, hireling){
  const C = companionsOf(w);
  const i = C.hirelings.findIndex(h => h.id === hireling.id);
  if(i >= 0) C.hirelings.splice(i, 1);
  if(typeof addLedger === "function")
    addLedger(w, "npc-life", { kind:"desertion", codexId:hireling.codexId, name:hireling.name, role:hireling.role },
      "◆ " + hireling.name + " deserts at the next safe moment — the bargain wasn't worth it.");
  if(typeof codexAdd === "function"){
    const id = (typeof prepCastId === "function") ? prepCastId(w, "thread", hireling.name + " — grievance")
      : ("thread:" + slug(hireling.name) + "-grievance-" + uid());
    const grief = codexAdd(w, { id, kind:"thread", provenance:"rolled",
      name: hireling.name + " — a grievance",
      fields:{ desc: hireling.name + " walked off the job, and the word is spreading.", codexId: hireling.codexId },
      dm:{ legs:"thread-seed", pool:"npc-life", inherits:null },
      status:{ known:false, soft:true, at: w.currentNodeId||null } });
    if(grief && typeof codexLink === "function") codexLink(w, grief.id, "part-of", hireling.codexId);
  }
  return true;
}

/* HEROIC STAND — loyalty 6 auto-passes ONE morale trigger, once (§1). Caller (the tactics-engine ally
   turn) checks this BEFORE rolling; consuming it clears the flag so it doesn't grant a second free pass
   without loyalty falling to 6 again. `hireling.heroicStandUsed` gates re-use at the same loyalty peak
   (falls-then-rises-to-6-again resets it naturally since the flag only gets set once per ascent — see
   companionAdjustLoyalty's caller contract: this function itself doesn't touch the flag on every tick,
   only companionConsumeHeroicStand does). */
function companionHeroicStandAvailable(hireling){
  return !!hireling && hireling.loyalty >= LOYALTY_MAX && !hireling.heroicStandUsed;
}
function companionConsumeHeroicStand(hireling){
  if(!companionHeroicStandAvailable(hireling)) return false;
  hireling.heroicStandUsed = true;
  return true;
}
/* loyalty falling off 6 re-arms the once-per-peak pass (so climbing back to 6 later grants it again). */
function companionRearmHeroicStand(hireling){
  if(hireling && hireling.loyalty < LOYALTY_MAX) hireling.heroicStandUsed = false;
}

/* ============================================================================
   MONSTER-PARLEY §2 — the "pet" tier: Beasts + INT-low creatures at CR<=2, recruited at Helpful.
   Non-leveling, tactics-engine-driven like a hireling; NO wages; a BOND with upkeep, not a payroll
   line — loyalty ticks down on neglect and down HARD if harmed-by-kind (the PC hurts its species).
   Stats = its bestiary chassis + applied traits, verbatim (o.statBase, the caller's resolveCreature
   result for that exact creature) — a pet wolf IS that wolf, never a generic reskin.
   ============================================================================ */
const PET_CR_MAX = 2;

/* MINT a pet from an already-Helpful creature codex record (recruit_creature's own +2 gate runs
   BEFORE this is called — this function only enforces the SHAPE (creature kind) + the CR<=2 ceiling,
   mirroring promoteSidekick's own cr-too-high refusal shape). */
function mintPetCompanion(w, o){
  o = o || {};
  const codexId = o.codexId;
  if(!codexId || typeof codexGet !== "function") return { ok:false, reason:"no-codex-id" };
  const rec = codexGet(w, codexId);
  if(!rec || rec.kind !== "creature") return { ok:false, reason:"not-a-creature" };
  const C = companionsOf(w);
  if(C.pets.some(x => x.codexId === codexId)) return { ok:false, reason:"already-pet" };
  const cr = (o.statBase && o.statBase.cr != null) ? o.statBase.cr : (rec.fields && rec.fields.cr != null ? rec.fields.cr : null);
  if(cr != null && cr > PET_CR_MAX) return { ok:false, reason:"cr-too-high" };
  const pet = {
    id: (typeof uid === "function") ? uid() : ("pet-" + Date.now()),
    codexId, name: rec.name, statBase: o.statBase || null,
    loyalty: companionClampLoyalty(LOYALTY_START),
    boundDay: (typeof clockOf === "function") ? clockOf(w).day : 1,
  };
  C.pets.push(pet);
  if(typeof addLedger === "function")
    addLedger(w, "outcome", { kind:"pet", codexId, name:rec.name }, "✦ " + rec.name + " stays close — a bond, not a bargain.");
  return { ok:true, pet };
}

/* NEGLECT — rides the existing downtime/passTime loyalty hooks (§2 "a pet_neglect check rides the
   existing downtime/passTime loyalty hooks — fed/tended = stable"). `tended` (caller-declared: the PC
   spent a beat feeding/tending it this rest) holds loyalty steady; UNTENDED ticks down one. Mirrors
   companionAdjustLoyalty's own auto-desert-at-0 shape but pets never desert via companionDesert (that
   fn's grievance-thread voice is a hireling's, not a pet's) — a pet at loyalty 0 simply wanders off. */
function companionPetNeglectTick(w, pet, tended){
  if(!pet) return null;
  if(tended) return pet.loyalty;
  const before = pet.loyalty;
  pet.loyalty = companionClampLoyalty((pet.loyalty||0) - 1);
  if(pet.loyalty !== before && typeof addLedger === "function")
    addLedger(w, "outcome", { kind:"pet-loyalty", codexId:pet.codexId, name:pet.name, from:before, to:pet.loyalty, cause:"neglect" },
      pet.name + "'s trust wavers — neglected.");
  if(pet.loyalty <= LOYALTY_MIN && before > LOYALTY_MIN) companionPetWanders(w, pet);
  return pet.loyalty;
}

/* neglect-tick every bound pet at once (the rest-gate call site's convenience wrapper — mirrors
   companionChargeWages' per-hireling loop shape). tendedIds: codexIds the player explicitly tended
   (the harness/direct-call channel — kept for test convenience). The GAME channel is `tend_pet`
   (dm.js applyEvent), which stamps `pet.tendedDay`; a pet counts as tended here if EITHER channel
   says so: tendedIds has its codexId, OR its tendedDay is within 1 day of the current clock day
   (so a tend on day N still holds steady through the neglect tick landing on day N or N+1). */
function companionTickAllPets(w, tendedIds){
  const C = companionsOf(w);
  const tended = new Set(tendedIds || []);
  const day = (typeof clockOf === "function") ? clockOf(w).day : null;
  C.pets.slice().forEach(pet => {
    const byDay = (pet.tendedDay != null && day != null && (day - pet.tendedDay) <= 1);
    companionPetNeglectTick(w, pet, tended.has(pet.codexId) || byDay);
  });
}

/* HARMED-BY-KIND — loyalty drops HARD (§2: "DOWN HARD if the PC harms its kind") when the PC harms a
   creature of the SAME bestiary chassis/type as a bound pet. `kindKey` is whatever the caller used to
   identify the harmed creature's kind (a BESTIARY statId or a fields.type — matched against the pet's
   own statBase.id / rec.fields.type, loosely, since callers may only have one or the other on hand). */
function companionPetHarmedByKind(w, kindKey){
  if(!kindKey) return [];
  const C = companionsOf(w);
  const hit = [];
  C.pets.forEach(pet => {
    const rec = (typeof codexGet === "function") ? codexGet(w, pet.codexId) : null;
    const petKind = (pet.statBase && pet.statBase.id) || (rec && rec.fields && rec.fields.type) || null;
    if(petKind && String(petKind).toLowerCase() === String(kindKey).toLowerCase()){
      const before = pet.loyalty;
      pet.loyalty = companionClampLoyalty((pet.loyalty||0) - 2);   // hard drop — double the ordinary neglect tick
      if(typeof addLedger === "function")
        addLedger(w, "outcome", { kind:"pet-loyalty", codexId:pet.codexId, name:pet.name, from:before, to:pet.loyalty, cause:"harmed its kind" },
          pet.name + "'s trust breaks — you hurt one of its own.");
      if(pet.loyalty <= LOYALTY_MIN && before > LOYALTY_MIN) companionPetWanders(w, pet);
      hit.push(pet.codexId);
    }
  });
  return hit;
}

/* a pet at loyalty 0 wanders off — quiet, no grievance thread (that's a hireling's voice, §2 keeps
   pets a bond-with-upkeep, not a payroll desertion). Removes it from the roster; the codex record
   persists (recall-eligible, same as any other creature). */
function companionPetWanders(w, pet){
  const C = companionsOf(w);
  const i = C.pets.findIndex(x => x.id === pet.id);
  if(i >= 0) C.pets.splice(i, 1);
  if(typeof addLedger === "function")
    addLedger(w, "npc-life", { kind:"pet-wanders", codexId:pet.codexId, name:pet.name }, "◆ " + pet.name + " wanders off — the bond wasn't tended.");
  return true;
}

/* MORALE MODIFIER — loyalty feeds a hireling's morale save as `loyalty-3` (§1: loyalty 3 is neutral/0,
   the clock's starting value). Wraps monster-tactics.js's rollMorale primitives WITHOUT editing that
   file (BATCH-GUARDRAILS G0 "no drive-by refactors") — duplicates its DC-lookup call shape, adds the
   loyalty bonus as resolveSaveCheck's `bonus` term. `statBase` is a resolveCreature(...) stat block
   (CR<=1/2 promoted or the hireling's own combat stats where tracked); a hireling with no statBase
   auto-passes (never blocks the ally-side tactics loop on missing data). */
function companionMoraleRoll(w, hireling, statBase, o){
  o = o || {};
  if(companionHeroicStandAvailable(hireling)){
    companionConsumeHeroicStand(hireling);
    return { held:true, autoPass:true, heroicStand:true, natural:null, total:null, dc:null, disposition:null, rout:false };
  }
  if(!statBase || typeof moraleDCFor !== "function") return { held:true, autoPass:true, natural:null, total:null, dc:null, disposition:null, rout:false };
  const dc = moraleDCFor(statBase);
  if(dc == null) return { held:true, autoPass:true, natural:null, total:null, dc:null, disposition:null, rout:false };
  const loyaltyMod = (hireling ? companionClampLoyalty(hireling.loyalty) : LOYALTY_START) - LOYALTY_START;
  const wisMod = (statBase.abilities && statBase.abilities.wis && typeof statBase.abilities.wis.mod === "number") ? statBase.abilities.wis.mod : 0;
  const proficient = !!(statBase.saves && typeof statBase.saves.wis === "number");
  const proficiency = proficient ? (statBase.saves.wis - wisMod) : 0;
  const res = (typeof resolveSaveCheck === "function")
    ? resolveSaveCheck({ mods:{ wis: wisMod }, saveProfs: proficient ? ["wis"] : [], profBonus: proficiency }, "wis", dc, { d20:o.d20, bonus: loyaltyMod })
    : { total: wisMod + loyaltyMod + rollDie(20), natural:0, success:true, dc };
  if(res.success) return { held:true, autoPass:false, natural:res.natural, total:res.total, dc, disposition:null, rout:false };
  const d6 = (o.dispositionRoll != null) ? o.dispositionRoll : rollDie(6);
  const disposition = (d6 <= 3) ? "flee" : (d6 <= 5) ? "surrender" : "rout-panic";
  return { held:false, autoPass:false, natural:res.natural, total:res.total, dc, disposition, rout:disposition==="rout-panic", d6 };
}

/* ============================================================================
   §3 — The sidekick: promotion, leveling, bond
   ============================================================================ */

/* PROMOTE — creation = promotion of an EXISTING codex NPC (§3). Refuses: no codex record, non-npc kind,
   a CR above 1/2 (resolveCreature's stat base must exist AND cr<=0.5 — the "second promotion refused"
   contract also lives here: a SINGULAR slot, w.companions.sidekickId already set -> refused). className
   must be one of SIDEKICK_CLASSES' three keys. */
const SIDEKICK_CR_MAX = 0.5;
function promoteSidekick(w, o){
  o = o || {};
  const C = companionsOf(w);
  if(C.sidekickId) return { ok:false, reason:"slot-occupied" };
  const codexId = o.codexId;
  if(!codexId || typeof codexGet !== "function") return { ok:false, reason:"no-codex-id" };
  const rec = codexGet(w, codexId);
  // MONSTER-PARLEY §2 (tier "sidekick"): Tasha's rules-as-written — ANY type (incl. Beast) at
  // CR<=1/2 can be promoted, monster or NPC alike. The CR gate below (unchanged) is what actually
  // enforces "sidekick-worthy"; this only widens the shape gate to admit a creature record.
  if(!rec || (rec.kind !== "npc" && rec.kind !== "creature")) return { ok:false, reason:"not-an-npc" };
  const className = o.className;
  if(typeof SIDEKICK_CLASSES === "undefined" || !SIDEKICK_CLASSES[className])
    return { ok:false, reason:"bad-class" };
  const statBase = (typeof resolveCreature === "function") ? resolveCreature(rec.name, { cr: o.cr != null ? o.cr : SIDEKICK_CR_MAX }) : null;
  const cr = statBase && statBase.cr != null ? statBase.cr : (o.cr != null ? o.cr : null);
  if(cr != null && cr > SIDEKICK_CR_MAX) return { ok:false, reason:"cr-too-high" };
  const pcLevel = (typeof livingSheet === "function") ? ((livingSheet(w)||{}).sh||{}).level || 1 : 1;
  const level = Math.max(1, Math.min((typeof LEVEL_CEILING !== "undefined") ? LEVEL_CEILING : 10, pcLevel));
  C.sidekickId = codexId;
  C.sidekick = {
    codexId, className, level,
    loyalty: LOYALTY_SIDEKICK_START,
    statBase: statBase || null,
    role: o.role || (className === "Spellcaster" ? (o.spellcasterRole || "Mage") : null),
  };
  if(typeof codexReveal === "function") codexReveal(w, codexId);
  if(typeof addLedger === "function")
    addLedger(w, "outcome", { kind:"promote-sidekick", codexId, className, level }, "✦ " + rec.name + " becomes your sidekick — " + className + ".");
  return { ok:true, sidekick:C.sidekick };
}

/* LEVEL WITH THE PC (§3: "sidekick level = PC level (levels at the same rest-gate)"). Call from the same
   rest-gate site that calls applyLevelChoices for the PC (frontier-narrated picks; this only advances the
   number, mirroring level_applied's mechanical-recompute posture). Clamped to LEVEL_CEILING same as the
   PC. */
function companionSidekickLevelWith(w, pcLevel){
  const C = companionsOf(w);
  if(!C.sidekickId || !C.sidekick) return null;
  const ceiling = (typeof LEVEL_CEILING !== "undefined") ? LEVEL_CEILING : 10;
  const to = Math.max(C.sidekick.level||1, Math.min(ceiling, pcLevel|0));
  if(to === C.sidekick.level) return C.sidekick;
  const from = C.sidekick.level;
  C.sidekick.level = to;
  if(typeof addLedger === "function")
    addLedger(w, "outcome", { kind:"sidekick-level", from, to }, "✦ Your sidekick grows to level " + to + ".");
  return C.sidekick;
}

/* the sidekick's class-progression row at its current level (data/sidekick-classes.js), null-safe if the
   data file hasn't loaded (never crashes the sheet render). */
function sidekickClassRow(sidekick){
  if(!sidekick || typeof SIDEKICK_CLASSES === "undefined") return null;
  const cls = SIDEKICK_CLASSES[sidekick.className];
  if(!cls) return null;
  return (cls.levels && cls.levels[String(sidekick.level||1)]) || null;
}

/* BOND, not wage (§3): the sidekick's loyalty starts at 5, is pay-immune (never appears in
   companionChargeWages — it only iterates w.companions.hirelings, which the sidekick is NOT part of),
   and moves on treatment/danger/gifts only. Loyalty 0 = departure (full npc-life-style breakup, not a
   desertion ledger entry — deliberately separate voice from a hireling walking off a payroll job). */
function companionSidekickAdjustLoyalty(w, delta, cause){
  const C = companionsOf(w);
  if(!C.sidekickId || !C.sidekick) return null;
  const before = C.sidekick.loyalty;
  C.sidekick.loyalty = companionClampLoyalty((C.sidekick.loyalty||0) + delta);
  if(C.sidekick.loyalty !== before && typeof addLedger === "function")
    addLedger(w, "outcome", { kind:"sidekick-loyalty", from:before, to:C.sidekick.loyalty, cause },
      "Your sidekick's trust " + (C.sidekick.loyalty > before ? "grows" : "wavers") + " (" + cause + ").");
  if(C.sidekick.loyalty <= LOYALTY_MIN && before > LOYALTY_MIN) companionSidekickLeaves(w);
  return C.sidekick.loyalty;
}

function companionSidekickLeaves(w){
  const C = companionsOf(w);
  if(!C.sidekickId) return false;
  const codexId = C.sidekickId, name = (typeof codexGet === "function" && codexGet(w, codexId)) ? codexGet(w, codexId).name : "your sidekick";
  if(typeof addLedger === "function")
    addLedger(w, "npc-life", { kind:"sidekick-departure", codexId }, "◆ " + name + " leaves — it should feel like a breakup, not a resignation.");
  if(typeof codexAdd === "function"){
    const id = (typeof prepCastId === "function") ? prepCastId(w, "thread", name + " — departed")
      : ("thread:" + slug(name) + "-departed-" + uid());
    const thread = codexAdd(w, { id, kind:"thread", provenance:"rolled",
      name: name + " — what's left unsaid",
      fields:{ desc: "They had had enough, and the door is open behind them.", codexId },
      dm:{ legs:"thread-seed", pool:"npc-life", inherits:null },
      status:{ known:false, soft:true, at: w.currentNodeId||null } });
    if(thread && typeof codexLink === "function") codexLink(w, thread.id, "part-of", codexId);
  }
  w.companions.sidekickId = null;
  w.companions.sidekick = null;
  return true;
}

/* DEATH IS DEATH (§3) — no bardo (PC-only, per docs/COMPANIONS.md §0/§3). Mints a grief thread (the
   same fallout-capture shape as turnMintSuccessorThread, src/world/turn.js §4) and the codex record
   persists (recall brings them back as memory, never miracle — no special-case needed: the codex record
   simply stays, condition:"dead", exactly like any other npc-life death). */
function companionSidekickDies(w, cause){
  const C = companionsOf(w);
  if(!C.sidekickId) return false;
  const codexId = C.sidekickId;
  const rec = (typeof codexGet === "function") ? codexGet(w, codexId) : null;
  const name = rec ? rec.name : "your sidekick";
  if(typeof codexUpdate === "function") codexUpdate(w, codexId, { status:{ condition:"dead" } });
  if(typeof addLedger === "function")
    addLedger(w, "npc-life", { kind:"sidekick-death", codexId, cause: cause||null }, "◆ " + name + " falls, and does not rise again.");
  if(typeof codexAdd === "function"){
    const id = (typeof prepCastId === "function") ? prepCastId(w, "thread", name + " — grief")
      : ("thread:" + slug(name) + "-grief-" + uid());
    const grief = codexAdd(w, { id, kind:"thread", provenance:"rolled",
      name: name + " — grief",
      fields:{ desc: "What " + name + " leaves behind: a death that wants to be carried, not solved.", npc:name, cause: cause||null },
      dm:{ legs:"thread-seed", pool:"npc-life", causeShape:"a death that wants to be carried, not solved", inherits:null },
      status:{ known:false, soft:true, at: rec && rec.status ? rec.status.at : (w.currentNodeId||null) } });
    if(grief && typeof codexLink === "function") codexLink(w, grief.id, "part-of", codexId);
  }
  w.companions.sidekickId = null;
  w.companions.sidekick = null;
  return true;
}

/* ============================================================================
   Party-strip / tracker read helpers (§4 UI — render.js consumes these, no state mutation here)
   ============================================================================ */

/* the coarse, never-the-number loyalty word for a hireling pip row (§4: "coarse: low/steady/true"). */
function companionLoyaltyWord(loyalty){
  const n = companionClampLoyalty(loyalty);
  if(n <= 1) return "low";
  if(n <= 4) return "steady";
  return "true";
}

/* the live roster for the sidebar party strip: sidekick first (if any) + every hireling, each with just
   what §4 says the strip may show (name/role/loyalty-word/conditions; sidekick also gets an HP readout —
   ally numbers are the player's to see; only the sidekick's are exact, per the no-foe-HP rule extended). */
function companionPartyStrip(w){
  const C = companionsOf(w);
  const rows = [];
  if(C.sidekickId && C.sidekick){
    const rec = (typeof codexGet === "function") ? codexGet(w, C.sidekickId) : null;
    rows.push({ kind:"sidekick", codexId:C.sidekickId, name: rec ? rec.name : "Sidekick",
      className:C.sidekick.className, level:C.sidekick.level,
      hp: C.sidekick.statBase ? C.sidekick.statBase.hp : null, maxHp: C.sidekick.statBase ? C.sidekick.statBase.maxHp : null,
      loyaltyWord: companionLoyaltyWord(C.sidekick.loyalty) });
  }
  C.hirelings.forEach(h => rows.push({ kind:"hireling", id:h.id, codexId:h.codexId, name:h.name, role:h.role,
    loyaltyWord: companionLoyaltyWord(h.loyalty) }));
  return rows;
}
