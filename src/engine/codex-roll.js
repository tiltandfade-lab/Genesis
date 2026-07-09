/* GENESIS MODULE — src/engine/codex-roll.js — the CODEX rollers (Phases 2+5; docs/CODEX.md §2, §5).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The engine mints the ATOMS; the AI assigns meaning + wires links. rollNPC()/rollPlace()/rollItem()/
   rollBuildingInterior() chain the already-compiled tables (via rollTable from engine.compiled) into a
   record-shaped payload ready for codexAdd — `rolled` (raw dice verbatim), a player-safe `fields`
   glance-read, and DM-only `dm` levers. Items carry a `source` pointer (§8b), not a duplicated definition.
   They DO NOT write the world: prep/the DM emit codex_add events.
   Reads CHAR_NAMES (data.names) + pick (engine.core) + rollTable (engine.compiled) at call-time.
   BATCH3-PLAN unit 8 (docs/BREACH.md §2d): rollNPC also carries the breach-touched rider
   (NPC_BREACH_TOUCH/touchedNpcChance/rollNpcBreachTouch) — fray-scaled via engine.region's
   frayLevel (optional call-time dep, null-safe). */

/* map a rolled race string → a CHAR_NAMES species pool (best-effort; falls back to Human). */
function npcSpeciesFromRace(raceText){
  const s=(raceText||"").toLowerCase();
  if(/dwarf/.test(s))return"Dwarf";
  if(/half-orc|\borc\b/.test(s))return"Orc";
  if(/half-elf|\belf|underdark|drow/.test(s))return"Elf";
  if(/halfling/.test(s))return"Halfling";
  if(/gnome/.test(s))return"Gnome";
  if(/dragonborn|draconic/.test(s))return"Dragonborn";
  if(/tiefling|infernal/.test(s))return"Tiefling";
  if(/goliath/.test(s))return"Goliath";
  return"Human";
}
/* a provisional name from a species pool — the DM name-confirms; here only so the record has an id.
   ON-DEMAND-GEN §3: `gender` ("female"|"male") picks the gendered pool when non-empty, falling back
   to the union `first` pool (species with no gendered bank, or a caller that omits gender). */
function npcRolledName(species,gender){
  const p=(typeof CHAR_NAMES!=="undefined"&&CHAR_NAMES[species])||(typeof CHAR_NAMES!=="undefined"&&CHAR_NAMES.Human)||{first:["Stranger"],last:[]};
  const pool=(gender && p[gender] && p[gender].length) ? p[gender] : p.first;
  const f=pick(pool);
  return (p.last&&p.last.length&&Math.random()<0.8)?f+" "+pick(p.last):f;
}
/* a place's name + desc live in one cell: "The Bog-Iron Camp: A collection of mud-caked tents …". */
function placeNameDesc(text){
  const i=(text||"").indexOf(":");
  if(i>0)return {name:text.slice(0,i).trim(), desc:text.slice(i+1).trim()};
  return {name:null, desc:text||""};
}

/* ============================================================================
   BREACH-TOUCHED NPCs (BATCH3-PLAN unit 8; docs/BREACH.md §2d "Breach-touched NPCs" +
   BATCH3-GUARDRAILS J1/J2) — a rare RIDER on rollNPC, not a corpus rewrite. A small hand-authored
   d12 touch table (PROVISIONAL — Adam spot-check pending, same posture as any new authored
   vocabulary landing outside the compiled-tables pipeline): survivor of one · lost someone into
   one · came back wrong · quietly collects outlandish trinkets · prophesies the thinning · once
   traded with something through a flicker · etc. Composes FREE with what already exists — no new
   mechanism required: Distant Word's Mythic rows (Engine/03. _Tables/03. Session Mechanics/
   Distant Word.md, row 100) already carry breach rumor; TIYL's "slipped"/"doorway" supernatural
   rows (Life & Origins.md, the War & Tragedies table rows 91–95/96–00) retroactively ARE
   breach-touched backstories — this rider is content-linked to both by cross-reference, not by
   any new call site into either table. */
const NPC_BREACH_TOUCH=[
  "A survivor of one — they came out the other side of a thinny once, and don't talk about which world.",
  "Lost someone into one — a person they loved walked into a wrongness and the door sealed behind them.",
  "Came back wrong — whatever crossed back wearing their face mostly answers to their old name.",
  "Quietly collects outlandish trinkets — small impossible objects, never explained, never sold.",
  "Prophesies the thinning — insists the rim is creeping inward, and keeps a rough count of the signs.",
  "Once traded with something through a flicker — a hand reached through, an exchange was made, and they will not say what they gave up.",
  "Keeps a door-charm that does nothing anyone can test, and refuses to travel without it.",
  "Was briefly somewhere that isn't anywhere — hours passed for them that never happened here.",
  "Recognizes the smell before a breach opens — ozone-and-loam, they call it, and they're always right.",
  "Married someone from the other side of a stable door — the marriage is real; the paperwork isn't.",
  "Carries a wound that heals wrong — a scar shaped like a place, not a wound.",
  "Was the one who found the last stable door and told no one where."
];
/* touchedNpcChance(fray) → the fray-scaled trigger probability (BATCH3-PLAN unit 8: "~2% → ~8%
   rim-ward"). fray is engine.region's frayLevel(q,r) ∈ [0,1] (0 = world origin, 1 = FRAY_D hexes
   out); linear interpolation floor 2% / ceiling 8%. fray undefined/non-numeric → the floor (2%),
   never higher — a caller with no region context never over-rolls the rider. */
function touchedNpcChance(fray){
  const f=(typeof fray==="number" && fray>=0) ? Math.min(1,fray) : 0;
  return 0.02 + 0.06*f;
}
/* rollNpcBreachTouch(fray) → null (the common case) or {text, index} if the fray-scaled d100 clears
   the touch threshold. Pure + side-effect-free; callers decide whether/how to attach the result. */
function rollNpcBreachTouch(fray){
  const chance=touchedNpcChance(fray);
  const roll=(typeof Math.random==="function")?Math.random():0.5;
  if(roll>=chance) return null;
  const idx=(typeof rollDie==="function") ? (rollDie(NPC_BREACH_TOUCH.length)-1)
    : Math.floor(Math.random()*NPC_BREACH_TOUCH.length);
  return { text:NPC_BREACH_TOUCH[idx], index:idx };
}

/* ============================================================================
   NPC-COHERENCE-DIAL (docs/NPC-COHERENCE-DIAL.md) — a rollNPC generation MODE gating which
   IDENTITY/LEVER atoms fire (quirk, manner, flawSecret, bond, fear, leverage, motivation), by region
   temperature (fray), with roleHint/walkOn/explicit-coherence overrides. THE LAW: this simplifies the
   PERSON, never the SITUATION — race, role, name, want, and the hook are never gated; want fires at
   EVERY tier (a person without a want is just a job title). The hook is NOT a rollNPC atom (it's a
   prep/scene-layer roll off npc-hook) — structurally untouched here, per spec.
   ============================================================================ */
const COHERENCE_TIERS=["archetype","wrinkled","layered","tangled"];
// mix per region-temperature band (Adam-approved 2026-07-08); each row sums to 100.
const COHERENCE_CURVE={
  sleepy:   { archetype:70, wrinkled:24, layered:5,  tangled:1  },
  ordinary: { archetype:58, wrinkled:30, layered:10, tangled:2  },   // default when no region is passed
  uneasy:   { archetype:45, wrinkled:33, layered:17, tangled:5  },
  strained: { archetype:32, wrinkled:33, layered:25, tangled:10 },
  breached: { archetype:18, wrinkled:30, layered:32, tangled:20 }
};
// the identity/lever atoms the dial gates — race/role/name/want/hook are OUT OF SCOPE (THE LAW).
const COHERENCE_GATED_ATOMS=["quirk","manner","flawSecret","bond","fear","leverage","motivation"];
// wrinkled/layered draw their lever(s) from this 4-item pool; `motivation` is reserved for Tangled
// alone (the "what they're doing when first noticed" atom only earns its keep on the fully-tangled
// read) — the spec's implementation table names {flaw,bond,fear,leverage} explicitly for Wrinkled and
// leaves Layered's "2-3 levers" pool unnamed; this file resolves that gap by reusing the same 4-item
// pool for both, keeping motivation Tangled-exclusive. Documented as an implementation-fill, not a
// re-litigation of a locked decision.
const COHERENCE_LEVER_POOL=["flawSecret","bond","fear","leverage"];
// NPC-COHERENCE-FIXES.md §1 (Adam, 2026-07-08): roleHint -> forced Archetype was only ever meant for
// FUNCTIONAL/transactional NPCs (the jailer, the shopkeeper, the employer behind a desk) where the DM
// asked for "just give me the clean role." Everything else — questgiver chief among them — is a
// SIGNIFICANT hint: the hook-bearer the player digs into, who must never be flattened to a lever-less
// shell. Only this named set still forces the clean archetype delivery.
const COHERENCE_FUNCTIONAL_HINTS=new Set(["jailer","employer","captive","proprietor","guard","shopkeep","clerk"]);

/* fray ([0,1] from engine.region's frayLevel, or null/undefined when no region is passed) -> a
   temperature-band key into COHERENCE_CURVE. Non-numeric/negative -> "ordinary" (the documented
   default when no region context exists). Bands per the spec's pickCoherence step 4. */
function coherenceTemperature(fray){
  if(typeof fray!=="number"||!(fray>=0)) return "ordinary";
  const f=Math.min(1,fray);
  if(f<0.15) return "sleepy";
  if(f<0.4)  return "ordinary";
  if(f<0.65) return "uneasy";
  if(f<0.85) return "strained";
  return "breached";
}
/* weighted-pick ONE tier from a COHERENCE_CURVE row via cumulative d100 against the weights (spec's
   "weighted-pick the tier from that row... cumulative d100 against the weights"). Falls through to
   the last tier only as a float-rounding guard — the row's weights always sum to 100. */
function pickCoherenceTier(row){
  const roll=(typeof rollDie==="function")?rollDie(100):(Math.floor(Math.random()*100)+1);
  let acc=0;
  for(const tier of COHERENCE_TIERS){
    acc+=row[tier]||0;
    if(roll<=acc) return tier;
  }
  return COHERENCE_TIERS[COHERENCE_TIERS.length-1];
}
/* pickCoherence(opts) — the tier-selection algorithm, per NPC-COHERENCE-FIXES.md §1:
     1. opts.coherence (DM hard override) set -> use it verbatim.
     2. else opts.walkOn -> 'archetype' (never reconcile weird atoms for a 10-second character).
     3. else opts.roleHint present AND in COHERENCE_FUNCTIONAL_HINTS -> 'archetype' (a transactional
        role — jailer/shopkeep/employer/etc — context already named the role; deliver it clean).
     4. else derive the region temperature from opts.region's fray (frayLevel(center.q,center.r); no
        region/no frayLevel loaded -> null -> Ordinary) and weighted-pick a tier off that curve row.
        A SIGNIFICANT roleHint (anything not in the functional set, incl. "questgiver" — the hook-bearer
        the player digs into) clamps the rolled tier UP to at least 'wrinkled': never a bare archetype,
        always at least one lever the player can pull.
   Pure — reads opts only, no world/render/GS access (engine layer stays pure). */
function pickCoherence(opts){
  opts=opts||{};
  if(opts.coherence && COHERENCE_TIERS.indexOf(opts.coherence)>=0) return opts.coherence;
  if(opts.walkOn) return "archetype";
  if(opts.roleHint && COHERENCE_FUNCTIONAL_HINTS.has(opts.roleHint)) return "archetype";
  const center=opts.region&&opts.region.center;
  const fray=(center && typeof frayLevel==="function") ? frayLevel(center.q, center.r) : null;
  const rolled=pickCoherenceTier(COHERENCE_CURVE[coherenceTemperature(fray)]);
  const coherenceFloor=opts.roleHint ? "wrinkled" : null;   // significant hint (e.g. questgiver) -> floor
  if(coherenceFloor && COHERENCE_TIERS.indexOf(rolled)<COHERENCE_TIERS.indexOf(coherenceFloor)) return coherenceFloor;
  return rolled;
}
/* pick n DISTINCT entries from a small array (Fisher-Yates-lite; pools here are 2-4 items, so a
   splice-based draw is plenty cheap). */
function coherencePickN(arr,n){
  const pool=arr.slice(), out=[];
  n=Math.min(n,pool.length);
  for(let i=0;i<n;i++){
    const idx=(typeof rollDie==="function") ? (rollDie(pool.length)-1) : Math.floor(Math.random()*pool.length);
    out.push(pool.splice(idx,1)[0]);
  }
  return out;
}
/* coherenceAtomGate(tier) -> {quirk,manner,flawSecret,bond,fear,leverage,motivation} booleans — which
   of the 7 gated atoms are ALLOWED to fire this roll, per the spec's "Atom firing per tier" table:
     Archetype — optionally ONE of {quirk, manner}; the rest suppressed. "Optionally" = a roll for
       whether the single grace-note fires at all (a clean archetype can be pure — role-implied, no
       grace-note); when it fires, quirk vs manner is a coinflip. 65% fire-rate is this file's filled-in
       constant (the spec sets the shape, not the exact rate) — errs toward "usually reads with one
       human touch" per the worked example ("Captain Alder... honest to a fault").
     Wrinkled — ONE of {flaw,bond,fear,leverage} (always) + manner (always); quirk/motivation suppressed.
     Layered — 2-3 of {flaw,bond,fear,leverage} (coinflip 2 vs 3) + quirk (always) + manner (always);
       motivation suppressed (Tangled-exclusive, see COHERENCE_LEVER_POOL comment above).
     Tangled — every gated atom fires (today's pre-dial default — unchanged). */
function coherenceAtomGate(tier){
  const fire={}; COHERENCE_GATED_ATOMS.forEach(k=>fire[k]=false);
  if(tier==="tangled"){ COHERENCE_GATED_ATOMS.forEach(k=>fire[k]=true); return fire; }
  if(tier==="archetype"){
    const fires=((typeof rollDie==="function")?rollDie(100):(Math.floor(Math.random()*100)+1))<=65;
    if(fires){ const g=(typeof pick==="function")?pick(["quirk","manner"]):(Math.random()<0.5?"quirk":"manner"); fire[g]=true; }
    return fire;
  }
  if(tier==="wrinkled"){
    fire.manner=true;
    const g=(typeof pick==="function")?pick(COHERENCE_LEVER_POOL):COHERENCE_LEVER_POOL[Math.floor(Math.random()*COHERENCE_LEVER_POOL.length)];
    fire[g]=true;
    return fire;
  }
  if(tier==="layered"){
    fire.quirk=true; fire.manner=true;
    const n=(((typeof rollDie==="function")?rollDie(2):(Math.random()<0.5?1:2))===1)?2:3;
    coherencePickN(COHERENCE_LEVER_POOL,n).forEach(g=>fire[g]=true);
    return fire;
  }
  return fire; // defensive fail-safe (pickCoherence only ever returns a COHERENCE_TIERS member)
}

/* ============================================================================
   NPC-PRESENCE-AND-HOOKS.md Component 2 — sceneTemperature(region, realm) is the SHARED temperature
   read the ambient-count multiplier (world.prep's prepCastAmbientScene) and the hook-discovery curve
   (dm.js's codex_contact seam) both key off, per the doc: "Realm character is a temperature input,
   not just fray... mayhem realms run hot... set a FLOOR." Reuses coherenceTemperature's own fray->band
   ladder verbatim as the base read (same region.center/frayLevel convention rollNPC/pickCoherence
   already use — region.center is a THIN/opt-in field: regionForNode's real return carries no .center
   today, same latent gap the already-merged coherence dial has; a null/absent center degrades to
   "ordinary", never a crash).
   MAYHEM_REALM_IDS: REALM_IDS (data/realms.js) has exactly 11 ids and NO literal "toon" — the doc's
   "Toon/Theater-class" naming is illustrative. `theater` is named directly; `bright-kingdom`
   ("Toybox/anachronism/whimsical wonder... teeth underneath the candy") is this codebase's closest
   Toon-analog. A documented substitution, not an invented 12th realm.
   `realm` is an ALREADY-RESOLVED realm id string (or null/undefined) — resolving "what realm is live
   right now" (w.realm.active/activeRealmsFor) is a world-layer job; this function stays pure, reading
   only its own args (region.realm kept as a parity fallback with rollNPC's own read, even though no
   real regionForNode call site populates it today — see rollNPC's own header comment on the same gap). */
const MAYHEM_REALM_IDS=["theater","bright-kingdom"];
const TEMP_LADDER=["sleepy","ordinary","uneasy","strained","breached"];
function sceneTemperature(region, realm){
  const center=region&&region.center;
  const fray=(center && typeof frayLevel==="function") ? frayLevel(center.q, center.r) : null;
  let band=coherenceTemperature(fray);
  const realmId=realm||(region&&region.realm)||null;
  if(realmId && MAYHEM_REALM_IDS.indexOf(realmId)>=0){
    // a FLOOR, not an override — mayhem realms never read cooler than "strained", but a fray-hot
    // breach inside one can still climb to "breached" (the floor only lifts the bottom).
    const floorIdx=TEMP_LADDER.indexOf("strained"), bandIdx=TEMP_LADDER.indexOf(band);
    if(bandIdx<floorIdx) band=TEMP_LADDER[floorIdx];
  }
  return band;
}

/* rollNPC(opts) → a record-add payload for a statted, motivated NPC the DM only has to name+connect.
   opts: {name?, roleHint?, region?, realm?, species?, coherence?, walkOn?, hybridRealm?}. roleHint is
   recorded for the AI (the role roll itself isn't biasable yet). REGIONS-NAMES.md §3: opts.region (a
   w.regions[] record) blends region-culture names (70%) with species-flavor names (30%, the existing
   npcRolledName path) via regionBlendedName — omit opts.region (every existing caller does today) and
   this is byte-identical to before.
   BREACH §2d rider: opts.region.center.{q,r} (when present) feeds engine.region's frayLevel to
   fray-scale the touched-NPC chance (~2% at origin → ~8% at the rim); no region/no frayLevel
   function loaded → floor chance, degrading gracefully like every other region-vector consumer in
   this codebase (regionEconBump/regionClampTier precedent). NULL-SAFE + additive: `dm.breachTouch`
   is present ONLY on the rare roll that clears the threshold — every other payload is byte-identical
   to before this rider existed. breachTouch stays its own fray-scaled roll, independent of coherence
   (NPC-COHERENCE-DIAL.md invariants).
   SD-004 fix: opts.species (a canonical CHAR_NAMES species string, e.g. "Dwarf") pins fields.species
   + the name pool to a species the CALLER already committed to elsewhere (e.g. a TIYL-rolled person
   whose species is already baked into the prose) instead of independently re-rolling npc-race-weighted
   and risking a mismatch. rolled.race still carries the actual table roll (unaffected — it's flavor
   text on the `rolled` atom, not the binding field) so this is additive, not a behavior change for
   every existing caller that omits opts.species.
   NPC-COHERENCE-DIAL.md: opts.coherence ('archetype'|'wrinkled'|'layered'|'tangled', DM hard override)
   / opts.walkOn (bool, force archetype) additively opt into the coherence mode via pickCoherence();
   opts.roleHint (already a caller convention) also forces archetype when no explicit coherence is
   given. Suppressed identity/lever atoms are `null` in both `rolled` and `dm` — payload SHAPE is
   unchanged (every key still present), only the value. want/role/name/race are NEVER suppressed.
   NPC-ROLE-REALMS.md "Engine wiring": role is realm-aware (data/npc-role-skins.js's roleForRealm),
   keyed on opts.region?.realm ‖ opts.realm, defaulting to 'frontier' (no realm context -> the old
   frontier-coast distribution, migration parity). Role is NEVER coherence-gated (fires every tier,
   same invariant as want) — it was never in COHERENCE_GATED_ATOMS and stays out of it here. rolled.
   role/fields.role keep their old shape (a label string); rolled.archetypeKey/rolled.roleNote are
   new, additive fields. Hybridization (the "Fallout pocket" — a leaky-breach realm's edge-shapes
   washing up in the home realm): opts.hybridRealm is an ADDITIVE, explicit opt-in (no existing
   caller passes it, so every current call site's role pool is byte-identical to before this rider).
   When present + fray>0, a fray-scaled MINORITY of picks (p=min(0.35, fray*ROLE_HYBRID_K), never
   above 35%) draw from opts.hybridRealm's ADDS-ONLY pool (roleForRealm(...,{addsOnly:true})) instead
   of the home realm — never the whole breached skin, just its realm-unique edge roles. Automatically
   RESOLVING the live breach-target realm (from w.realm.active / a region's leak state) is left to the
   E-PRES ambient-population wiring per NPC-ROLE-REALMS.md §Hybridization "Guard: minority only... the
   world stays legibly its own realm" — this unit builds the mechanism + the opt-in seam, not the
   auto-detection. */
let ROLE_HYBRID_K=0.5; // fray=1 -> p=0.5, clamped by the 0.35 cap below; fray=0.7 is where the cap first binds
// (let, not const: PLACE-GEN §5 unit 5's shared-constant mutation-test guard redefines this at
// runtime in dev/verify-place-leak.mjs to prove the place leak reads the SAME live binding as the
// NPC leak rather than a forked/duplicated number — no production caller reassigns it.)
function rollNPC(opts){
  opts=opts||{};
  const coherence=pickCoherence(opts);
  const gate=coherenceAtomGate(coherence);
  const race=rollTable("npc-race-weighted");
  const center=opts.region&&opts.region.center;
  const fray=(center && typeof frayLevel==="function") ? frayLevel(center.q, center.r) : 0;
  const realmId=(opts.region&&opts.region.realm)||opts.realm||"frontier";
  let roleRoll=null;
  if(opts.hybridRealm && fray>0 && typeof roleForRealm==="function"){
    const p=Math.min(0.35, fray*ROLE_HYBRID_K);
    const hRoll=(typeof Math.random==="function")?Math.random():0.5;
    if(hRoll<p) roleRoll=roleForRealm(opts.hybridRealm, null, {addsOnly:true});
  }
  // PLACE-GEN.md §5 unit 3: opts.roleClass ("any" ‖ absent == unfiltered, matches the spine's Cast
  // vocabulary) filters the home-realm role draw to that NPC spine Tags class — a FILTERED-POOL pick
  // (roleForRealm's own opts.filterCls, data/npc-role-skins.js), not a retry loop, so a place's
  // anchor NPC reliably lands on-class even when that class is a thin minority of the realm's
  // weighted pool. Never dangles: roleForRealm itself falls through to the unfiltered pool when the
  // requested class has zero candidates in this realm's skin — a place ALWAYS mints an anchor NPC.
  if(!roleRoll && opts.roleClass && opts.roleClass!=="any" && typeof roleForRealm==="function"){
    roleRoll=roleForRealm(realmId, null, {filterCls:opts.roleClass});
  }
  if(!roleRoll) roleRoll=(typeof roleForRealm==="function")?roleForRealm(realmId):null;
  const quirk=gate.quirk?rollTable("npc-visual-quirk"):null;
  const mann=gate.manner?rollTable("npc-mannerisms"):null;
  const flaw=gate.flawSecret?rollTable("npc-flaws-secrets"):null;   // d300 — what they hide / their fatal weakness
  const bond=gate.bond?rollTable("npc-bonds"):null;                 // d300 — what they protect (the lever)
  const fear=gate.fear?rollTable("npc-fear"):null;
  const lever=gate.leverage?rollTable("npc-leverage"):null;
  const want=rollTable("npc-want");   // ALWAYS fires, at every tier (NPC-COHERENCE-DIAL.md invariant)
  const moti=gate.motivation?rollTable("npc-immediate-motivation"):null; // d300 — what they're doing when first noticed
  const tx=r=>r?r.text:null;
  // roleForRealm missing (data module didn't load) -> the pre-NPC-ROLE-REALMS flat table, never a hole.
  const roleLabel=roleRoll?roleRoll.label:tx(rollTable("npc-role"));
  const roleNote=roleRoll?roleRoll.note:null;
  const roleArchetypeKey=roleRoll?roleRoll.archetypeKey:null;
  // PLACE-GEN.md §5 unit 3: additive — the NPC spine Tags class this role actually landed on, so a
  // caller that asked for opts.roleClass can verify the filter held (or that the never-dangle fallback
  // fired). Every existing caller ignores this field; payload shape for them is unchanged otherwise.
  const roleCls=roleRoll?roleRoll.cls:null;
  const species=opts.species||npcSpeciesFromRace(tx(race));
  // ON-DEMAND-GEN §3 (Quick NPC Generator 2.0 pattern): 1d2 gender roll picks the gendered name pool.
  const gender=(typeof rollDie==="function"?rollDie(2):(Math.random()<0.5?1:2))===1?"female":"male";
  const name=opts.name || ((typeof regionBlendedName==="function")
    ? regionBlendedName(opts.region, species, gender) : npcRolledName(species,gender));
  const payload={
    kind:"npc", name, provenance:"rolled",
    rolled:{ race:tx(race), role:roleLabel, quirk:tx(quirk), mannerism:tx(mann),
      flawSecret:tx(flaw), bond:tx(bond), fear:tx(fear), leverage:tx(lever),
      want:tx(want), motivation:tx(moti), roleHint:opts.roleHint||null, gender, coherence,
      archetypeKey:roleArchetypeKey, roleNote:roleNote, roleCls:roleCls },
    fields:{ species, role:roleLabel,
      demeanor:[tx(quirk),tx(mann)].filter(Boolean).join("; ")||null },
    dm:{ secret:tx(flaw), fear:tx(fear), bond:tx(bond),
      leverage:tx(lever), want:tx(want), motivation:tx(moti) }
  };
  const touch=rollNpcBreachTouch(fray);
  if(touch) payload.dm.breachTouch=touch.text;   // DM-only lever, same tier as secret/fear/bond/leverage/want
  return payload;
}

/* ============================================================================
   NPC-PARTIALS (docs/NPC-PARTIALS.md "Engine build step") — rollPartial(kind, opts) is a
   lightweight sibling to rollNPC for children/animals: real presence, their own small stuff,
   and it NEVER fires the adult lever stack (want-2d50/leverage/fear/flawSecret/bond/motivation).
   kind: 'child' | 'animal'. Coherence hard-defaults to 'archetype' on every partial — a partial
   never rolls the NPC-COHERENCE-DIAL band; it's legible by definition (spec: "a child is legible
   by default... the hook, when it fires, is the interest, not a complex inner life").
   Data path: child-want/child-saw/animal-kind/animal-tell are compiled into window.GENESIS_TABLES
   (2026-07-08 recompile) — reachable directly via rollTable(id), same as every other table in
   this file; no new gen script needed.
   Deviations from the doc's code sketch, adapted to REAL helpers already in this codebase (per
   the executor brief — never invent a helper that doesn't exist):
     - no rng01() anywhere in this codebase; the hook-carrier draw uses Math.random() directly,
       same defensive style rollNpcBreachTouch (above) already uses.
     - no childName(opts) helper exists; a child still needs a real provisional name (the DM
       name-confirms, same as rollNPC's comment says), so this reuses rollNPC's own name chain
       verbatim: regionBlendedName(opts.region,species,gender) falling back to npcRolledName.
     - want.tagline isn't a real field on a rollTable() row (compiled shape carries no `tagline`);
       the cracks-adult tag lives in cells[1] (rollTable's cells=[contentText, tagString] for these
       tables), so cracksAdult tests want.cells[1] instead. */
function rollPartial(kind, opts){
  opts=opts||{};
  const tx=r=>r?(r.cells?r.cells[0]:r.text):null;   // single-content-col tables: cells=[content,tags]
  if(kind==="child"){
    const want=rollTable("child-want");   // the child's ONE want — never the adult want-2d50 stack
    // hook-carrier: children CARRY hooks at a scaled rate (default 0.5; opts.hookRate overrides,
    // straight-through 0..1 — 1 always carries, 0 never does; Adam's Amblin-realm bump is an open Q).
    const rate=(opts.hookRate!=null)?opts.hookRate:0.5;
    const roll=(typeof Math.random==="function")?Math.random():0.5;
    const carries=roll<rate;
    const saw=carries?rollTable("child-saw"):null;
    const tags=(want&&want.cells&&want.cells[1])||"";
    const species=opts.species||"Human";
    const gender=(typeof rollDie==="function"?rollDie(2):(Math.random()<0.5?1:2))===1?"female":"male";
    const name=opts.name||((typeof regionBlendedName==="function")
      ? regionBlendedName(opts.region,species,gender) : npcRolledName(species,gender));
    return { kind:"partial", partialKind:"child", coherence:"archetype",
      name,
      fields:{ role:"child", want:tx(want) },
      dm:{ want:tx(want), saw:saw?tx(saw):null, cracksAdult:/cracks-adult/.test(tags) } };
  }
  // animal: kind + a tell that POINTS AT a nearby hook (breadcrumb, not a thread) — not a moral
  // agent, no want/lever stack at all; just kind + tell + a need.
  // ANIMAL-SOCIAL.md §1/§6 U1: opts.env picks the table + weight profile (wilderness draws from
  // wild-animal-kind entirely; rural/village/city/dungeon reweight the domestic animal-kind pool).
  // No opts.env -> unweighted flat animal-kind (today's behavior, unchanged — no regression for
  // existing callers).
  const ak=rollAnimalKind(opts.env), tell=rollTable("animal-tell");
  const realmId=opts.realm||(opts.region&&opts.region.realm)||null;
  const akTags=(ak&&ak.cells&&ak.cells[1])||"";
  let animalKindText=tx(ak);
  if(/realm-skin/.test(akTags) && typeof animalRealmSkin==="function"){
    const skinKind=(opts.env==="wilderness")?"wild":"domestic";
    const skinned=animalRealmSkin(skinKind, realmId);
    if(skinned) animalKindText=skinned;
  }
  const wildDefault=(opts.env==="wilderness")?-1:0;   // ANIMAL-SOCIAL §3: wild draws default attitude -1
  let attitude=/\bwild\b|\bwary\b/.test(akTags)?-1:wildDefault;
  // ANIMAL-SOCIAL §3/§6 U3: Ranger/Druid opening-attitude-one-step-better (flat, script-owned — no DM
  // judgment). opts.pcClass is optional; absent -> attitude unchanged (no regression for callers that
  // don't know the acting PC's class, e.g. a scene-typed ambient draw with no single "asker").
  if(typeof animalOpeningStep==="function") attitude=animalOpeningStep(attitude, opts.pcClass);
  // ANIMAL-SOCIAL.md §4/§6 U5: row 12 ("the town's own animal" / "the elder of the wood") is tagged
  // `landmark` on both animal-kind and wild-animal-kind — the caller (prepCastEnvAnimals/
  // prepCastAmbientScene) reads this flag to mint it as an ALREADY-promoted, named codex record from
  // the start (§4), never as a disposable ambient draw. Pure derivation off the row's own tags —
  // never guesses which row minted.
  const landmark=/landmark/.test(akTags);
  // ANIMAL-SOCIAL.md §5/§6 U6 — the wild-animal-kind row number, stamped ONLY on wilderness draws
  // (a row IS a stable identity; ak.total is the 1-indexed d12 face for a straight d12 table —
  // verified against the compiled wild-animal-kind rows, row[0]===row[1]===row number). Domestic
  // (non-wilderness) draws never carry this field — animal-knowledge-scope.js's scope table is keyed
  // to wild-animal-kind rows only, per the spec's §5 breakdown. Read back by
  // animalKnowledgeScopeFor(rec) (data/animal-knowledge-scope.js) at witness-assembly time, never
  // re-derived from animalKindText (which may already be realm-skinned and no longer match the row's
  // own label).
  const wildKindRow=(opts.env==="wilderness" && ak && typeof ak.total==="number") ? ak.total : undefined;
  // ANIMAL-SOCIAL.md §5/§6 U6 — pack-tag: wild-animal-kind rows carry a loose-faction tag
  // (pack/flock/solitary/parliament, see the table's own Tags column) — pack-tagged animals share
  // attitude within a node (§5 "befriend the pack leader, befriend the pack"); solitaries don't.
  // Flat regex off the row's own tags, same posture as `landmark`/`wildDefault` above — never a
  // second heuristic. Domestic (non-wilderness) draws are never pack-tagged (animal-kind carries no
  // pack/flock/solitary tags at all today).
  const packTag=/\bpack\b|\bflock\b/.test(akTags);
  return { kind:"partial", partialKind:"animal", coherence:"archetype",
    name:opts.name||null,
    fields:{ role:"animal", animalKind:animalKindText, care:0 },
    dm:{ tell:tx(tell), need:(typeof pick==="function")?pick(["hungry","guarding","lost","loyal"]):"hungry",
      attitude, landmark, wildKindRow, packTag } };
}

/* ANIMAL_ENV_WEIGHTS (docs/ANIMAL-SOCIAL.md §1/§6 U1) — 5 environment bands -> row-weight vectors
   over animal-kind's 12 rows (index 0 = row 1 ... index 11 = row 12). Numbers are engine
   implementation-fill (per the spec: "the shape... is the law", not the exact weights) — the shape
   enforced here: rural/village overweight herd/working-beast/fowl (rows 2/5/6), city suppresses
   them hard toward stray/vermin/cat (rows 3/4/8), dungeon collapses to almost nothing (wary/
   half-tamed + the realm-beast only). 'wilderness' is NOT applied to animal-kind — wilderness
   draws rollTable('wild-animal-kind') wholesale (its own weight vector, over that table's 12
   rows) per the spec ("wilderness ... gets one new crafted table"), so the 'wilderness' key here
   weights *that* table, not animal-kind. */
const ANIMAL_ENV_WEIGHTS = {
  //          1:dog 2:workingbeast 3:cat 4:stray 5:fowl 6:herd 7:bird 8:vermin 9:old 10:halftamed 11:realmbeast 12:townanimal
  rural:      [2,    6,             1,    1,      4,     6,     1,    1,       1,    0.5,          0.5,          0.5],
  village:    [4,    1,             3,    2,      3,     1,     2,    2,       2,    1,            1,            1],
  city:       [2,    0.2,           2,    5,      0.5,   0.2,   2,    3,       1,    0.5,          1,            1],
  dungeon:    [0,    0,             0,    0.5,    0,     0,     0,    2,       0,    3,            2,            0],
  // wild-animal-kind rows (row 11 realm-skin, row 12 elder-of-the-wood are rarer/landmark draws):
  wilderness: [1,    1,             1,    1,      1,     1,     1,    1,       1,    1,            1,            0.5],
};

/* weightedTableRow(id, weights) — like rollTableAtBand's within-row-range pattern (engine.compiled),
   but picks the row by an explicit weight vector instead of a spice band. weights[i] corresponds to
   the table's (i+1)th row (1-indexed d12 rows map 1:1 to array position here — every animal-kind /
   wild-animal-kind row IS exactly one face of the die, never a multi-row band). Falls back to a
   flat rollTable(id) when the table is missing or weights don't match the row count (defensive —
   never throws on a malformed vector).
   HQ-6 (docs/ANIMAL-SOCIAL-HQ.md D8) — the row/weight coupling this function leans on is fragile:
   ANIMAL_ENV_WEIGHTS is a positional 12-vector authored against TODAY's animal-kind/wild-animal-kind
   row order/count, and Adam's craft pass on those tables WILL rewrite them. When the length check
   above fails (table exists but row count no longer matches the weight vector), warn LOUDLY once
   per table id per session instead of silently reverting to a flat roll forever — truth over green;
   whoever re-syncs the maps should do so eyes-open, not discover the silent fallback months later. */
const __animalWeightMismatchWarned = new Set();
function weightedTableRow(id, weights){
  const t=(typeof CT==="function")?CT()[id]:null;
  if(!t || !Array.isArray(weights) || weights.length!==t.rows.length){
    if(t && !__animalWeightMismatchWarned.has(id)){
      __animalWeightMismatchWarned.add(id);
      console.warn("[animal-env] weight/row count mismatch for "+id+" — env weighting DISABLED (flat roll)");
    }
    return rollTable(id);
  }
  const total=weights.reduce((a,b)=>a+b,0);
  if(total<=0) return rollTable(id);
  let roll=Math.random()*total, idx=0;
  for(let i=0;i<weights.length;i++){ roll-=weights[i]; if(roll<=0){ idx=i; break; } idx=i; }
  const row=t.rows[idx];
  const total2=row[0]+Math.floor(Math.random()*(row[1]-row[0]+1));
  const dice=t.dice||("d"+t.die);
  if(typeof tallyTableRoll==="function") tallyTableRoll(id);
  return {id,dice,total:total2,band:row[2],text:row[3],fragment:row[4],cells:row[5]||null,
          legs:row[6]||"",pool:row[7]||"",grants:row[8]||"",motif:row[9]||""};
}

/* rollAnimalKind(env) — table + weight-profile selection for rollPartial('animal',{env}).
   wilderness -> wild-animal-kind, weighted by ANIMAL_ENV_WEIGHTS.wilderness.
   rural/village/city/dungeon -> animal-kind, weighted by that band's vector.
   no env / unrecognized env -> flat unweighted rollTable('animal-kind') (today's behavior). */
function rollAnimalKind(env){
  if(env==="wilderness") return weightedTableRow("wild-animal-kind", ANIMAL_ENV_WEIGHTS.wilderness);
  if(env && ANIMAL_ENV_WEIGHTS[env]) return weightedTableRow("animal-kind", ANIMAL_ENV_WEIGHTS[env]);
  return rollTable("animal-kind");
}

/* rollItem(opts) → a record-add payload for a SPECIFIC plot-object (the macguffin a quest turns on).
   opts: {name?, lock?}. lock=true also rolls the plot-lock companion (what's sealed + where the key is).
   Items are POINTERS (§8b): the record carries `source:{type:"plot",ref:"plot-item#<row>"}` + the rolled
   text; the codex holds the instance + relationships, not a duplicated definition.
   PLOT-ITEM-RECURRENCE (dev/top-band-uniqueness-report.md class-(iii) #53/#54): plot-item and plot-lock
   are d300 tables whose top 3 rows (298-300, band "Mythic") are bare, singular, world-defining macguffins
   — "the original brass key," "a name written on a strip of lead… yours." A row IS a stable identity (the
   same face of the same die), so a Mythic fire stamps `origin:"plot-item:<row>"` on the payload — the
   mint-time seam (genApply in src/world/dm.js) uses this to recognize "this exact legendary thing already
   exists in this world" and hand back the existing record instead of minting a byte-identical duplicate.
   Non-Mythic rows (the other 297/300 faces) get no origin tag — ordinary macguffins recur freely, by
   design; only the singular top-band rows need canon-aware recurrence. */
function rollItem(opts){
  opts=opts||{};
  const it=rollTable("plot-item");               // cells: [Band, Object, Why It Matters, Opens/Proves]
  const ic=(it&&it.cells)||[];
  const object=ic[1]||(it?it.text:null), why=ic[2]||null, opens=ic[3]||null;
  let lock=null;
  if(opts.lock){
    const lk=rollTable("plot-lock"); const lc=(lk&&lk.cells)||[];   // cells: [Band, Sealed, Key Kept]
    if(lk) lock={ sealed:lc[1]||lk.text||null, keyKept:lc[2]||null, ref:"plot-lock#"+lk.total };
  }
  const name=opts.name||object||"a significant object";
  const origin=(it && it.band==="Mythic") ? ("plot-item:"+it.total) : null;
  return {
    kind:"item", name, provenance:"rolled",
    source:{ type:"plot", ref: it?("plot-item#"+it.total):null },
    origin,                                        // stable row-origin tag — only set on a Mythic fire
    rolled:{ object, why, opens, lock },
    fields:{ object, opens },                      // player-safe once known: what it is + what it does
    dm:{ why, opens, lock }                        // the DM holds why-it-matters + the lock/key location
  };
}

/* rollLoot(opts) → a record-add payload for a single loot item (ON-DEMAND-GEN.md §5) — reuses the
   dungeon-walk budget/table chain rather than inventing a second loot system. opts.rarity ("common"|
   "uncommon"|"rare"|"very-rare") rolls that dungeon-loot-* table directly + coin; opts.tier (no rarity)
   draws ONE slot from dwalkBudget's per-tier deck (weighted by the same distribution a dungeon crawl
   uses — a hoard is multiple gen entries, deliberately, per §5). Pointer pattern (§8b): the codex record
   carries `source.ref` into the compiled table row + the rolled text verbatim; data/items.js holds
   mechanics where the name resolves. Does NOT write the world — the DM emits codex_add. */
function rollLoot(opts){
  opts=opts||{};
  // ECONOMY-SINKS §B — opts.kind:"valuable": one draw off the valuables table on demand (the DM can
  // hand the party a fenceable prize), bypassing the rarity/tier magic-item path entirely.
  if(opts.kind==="valuable"){
    const v=dwalkValuable();
    return {
      kind:"item", name:v.name, provenance:"rolled",
      source:{ type:"loot", ref:"dungeon-loot-valuables#"+v.name },
      rolled:{ value:v.value, note:v.note },
      fields:{ object:v.name, value:v.value },
      dm:{ why:"valuable", note:v.note }
    };
  }
  let rarity=opts.rarity||null;
  if(!rarity && opts.tier!=null){
    const budget=dwalkBudget(6, Math.min(2,opts.tier||1)>=2);   // segCount=6 is a mid-band single-slot draw — opts.tier only selects T1 vs T2 weighting
    const deck=[];
    for(let i=0;i<(budget.veryRare||0);i++) deck.push("very-rare");
    for(let i=0;i<(budget.rare||0);i++) deck.push("rare");
    for(let i=0;i<(budget.uncommon||0);i++) deck.push("uncommon");
    for(let i=0;i<(budget.common||0);i++) deck.push("common");
    rarity=deck.length?pick(deck):"common";
  }
  rarity=rarity||"common";
  const slot=dwalkLootSlot(rarity);
  const coin=dwalkCoin(Math.min(2,opts.tier||1)>=2, opts.depth||2, false);
  const name=(slot&&slot.name)||"a piece of loot";
  return {
    kind:"item", name, provenance:"rolled",
    source:{ type:"loot", ref: slot?(slot.rarity? (({"Very Rare":"dungeon-loot-very-rare","Rare":"dungeon-loot-rare","Uncommon":"dungeon-loot-uncommon","Common":"dungeon-loot-common"})[slot.rarity]+"#"+name) : null) : null },
    rolled:{ rarity: slot?slot.rarity:rarity, name: slot?slot.name:null, desc: slot?slot.desc:null, coin },
    fields:{ object:name, rarity: slot?slot.rarity:rarity },
    dm:{ why:"loot", coin }
  };
}

/* rollBuildingInterior(opts) → a record-add payload for the inside of a building the players enter
   (connected spaces + a feature + who/what's inside). Fills the "the gran's house had nothing to roll"
   gap. opts: {name?, kind?, type?}. kind biases the caller's framing (home/shrine/warehouse) — the
   legacy field, untouched. docs/URBAN-FABRIC.md §1 "gen kind:'interior' gains opts.type consuming
   the kit (NO new gen kind)": opts.type, when it matches a BUILDING_KIT_TYPES id, DELEGATES this
   call to rollBuilding(opts.type, opts) instead of the plain base roll — a typed building payload
   (kit/functionLine/proprietor framing folded into `rolled`/`dm`) rather than the generic interior.
   opts.type omitted, or not a known kit id -> byte-identical to the pre-existing base-roll behavior. */
function rollBuildingInterior(opts){
  opts=opts||{};
  if(opts.type && typeof BUILDING_KIT_TYPES!=="undefined" && BUILDING_KIT_TYPES.indexOf(opts.type)>=0
     && typeof rollBuilding==="function"){
    const rb=rollBuilding(opts.type, opts);
    if(rb.ok){
      return {
        kind:"location", name: opts.name||rb.name, provenance:"rolled",
        source:{ type:"building", ref: rb.interior?rb.interior.source.ref:null },
        rolled:{ layout: rb.interior?rb.interior.rolled.layout:null, feature: rb.interior?rb.interior.rolled.feature:null,
          inside: rb.interior?rb.interior.rolled.inside:null, kind:opts.kind||null,
          buildingType:opts.type, kit:rb.kit.label },
        fields:{ desc: rb.interior?rb.interior.fields.desc:null, feature: rb.interior?rb.interior.fields.feature:null,
          functionLine:rb.kit.functionLine },
        dm:{ inside: rb.interior?rb.interior.dm.inside:null, feature: rb.interior?rb.interior.dm.feature:null,
          kit:rb.kit.label, shopId: rb.shop?rb.shop.id:null }
      };
    }
  }
  const b=rollTable("building-interior");         // cells: [Band, Layout, Notable Feature, Who/What Inside]
  const bc=(b&&b.cells)||[];
  const layout=bc[1]||(b?b.text:null), feature=bc[2]||null, inside=bc[3]||null;
  const name=opts.name||"an interior";
  return {
    kind:"location", name, provenance:"rolled",
    source:{ type:"building", ref: b?("building-interior#"+b.total):null },
    rolled:{ layout, feature, inside, kind:opts.kind||null },
    fields:{ desc:layout, feature },               // player sees layout + feature on entry
    dm:{ inside, feature }                          // who/what's inside is the DM's to reveal
  };
}

/* rollDimsInCells(space) -> {w,d} — GRID LAW (docs/PLACE-GEN.md ADDENDUM §A): uniform-integer pick
   within PLACE_SPACE_CELLS[space]'s band, using rollDie (Math.random-backed, same rng discipline
   the rest of this file uses — no explicit seeded-rng threading here, matching roleForRealm's
   call-with-no-rng convention at this file's rollNPC call site). Defensive: an unknown/missing
   space (or a missing PLACE_SPACE_CELLS load) falls back to the "roomy" band's own shape so a
   place NEVER mints without dims once this path is reached. */
function rollDimsInCells(space){
  const bands=(typeof PLACE_SPACE_CELLS!=="undefined")?PLACE_SPACE_CELLS:null;
  const band=(bands&&bands[space])||(bands&&bands.roomy)||{wMin:3,wMax:4,dMin:3,dMax:4};
  const w=band.wMin+((typeof rollDie==="function")?rollDie(band.wMax-band.wMin+1)-1:0);
  const d=band.dMin+((typeof rollDie==="function")?rollDie(band.dMax-band.dMin+1)-1:0);
  return {w,d};
}

/* rollPlace(opts) → a record-add payload for a named location with a defining trait + a hidden truth.
   opts: {name?, depth?, realm?, region?, archetypeBias?, hybridRealm?}.  depth=true also rolls
   place-history.
   PLACE-GEN §5 unit 2 (ADDENDUM §A step 1 + §4 prepCastFrontier realm rider): opts.realm ‖
   opts.region.realm ‖ 'frontier' — the SAME realm-resolution convention urban.js's
   buildingApproach/mintDistricts use (U6) — feeds placeForRealm(realmId, rng, {archetypeBias})
   (data/place-skins.js, PLACE-GEN §5 unit 1) to type/name/cast/dress the mint. Back-compat law:
   opts.realm absent → frontier skin, payload a STRICT SUPERSET of the pre-unit-2 shape (dev/
   verify-place-roll.mjs asserts field-presence against a golden captured pre-change).
   PLACE-GEN §5 unit 5 (breach leak, PLACE-GEN §4 "Breach-blending"): opts.hybridRealm is an
   ADDITIVE, explicit opt-in (no existing caller passes it — every current call site's archetype
   draw is byte-identical to before this rider). When present AND fray>0 (opts.region.center via
   frayLevel, same convention as rollNPC's hybridization rider above), a fray-scaled MINORITY of
   mints (p=min(0.35, fray*ROLE_HYBRID_K) — the SAME global shared constant as the NPC leak, not a
   forked number) draw their WHOLE archetype from opts.hybridRealm's skin (placeForRealm(hybridRealm,
   ...) — the entire breached skin: reskins + adds, deliberately broader than the NPC leak's
   addsOnly narrowing, per §4 "the frontier town with one Theater mess tent"). Everything else about
   the mint (name path, secret, region inputs) stays home-realm. On a leak hit the payload also
   carries the visual tell: dm.dressing.hybridProps=<hybridRealm> (additive; home props/surfaces
   pointers unchanged) and rolled.hybridRealm=<hybridRealm>. */
function rollPlace(opts){
  opts=opts||{};
  const realmId=opts.realm||(opts.region&&opts.region.realm)||"frontier";
  const setting=rollTable("place-master-setting");
  const nd=placeNameDesc(setting?setting.text:null);
  const trait=rollTable("place-traits");        // cells: [Band, Trait, Calamity]
  const tc=(trait&&trait.cells)||[];
  const traitText=tc[1]||(trait?trait.text:null);
  const calamity=tc[2]||null;                    // the visible trouble — player-observable
  const secret=rollTable("place-secret");        // cells: [Band, Hidden Mistake, Description] — DM-only
  const sc=(secret&&secret.cells)||[];
  const secretText=sc[2]||sc[1]||(secret?secret.text:null);
  const hist=opts.depth?rollTable("place-history"):null;
  // breach leak (§5 unit 5): minority cross-skin archetype draw, sharing the NPC leak constant.
  const center=opts.region&&opts.region.center;
  const fray=(center && typeof frayLevel==="function") ? frayLevel(center.q, center.r) : 0;
  let leakedRealm=null;
  if(opts.hybridRealm && fray>0){
    const p=Math.min(0.35, fray*ROLE_HYBRID_K);
    const hRoll=(typeof Math.random==="function")?Math.random():0.5;
    if(hRoll<p) leakedRealm=opts.hybridRealm;
  }
  const archeRealmId=leakedRealm||realmId;
  // the archetype draw (spine+skin) — type/label/scale/space/staff/cast for this mint. Null-safe:
  // an unloaded data seam (headless/lean context) leaves the pre-unit-2 behavior untouched.
  const arche=(typeof placeForRealm==="function")?placeForRealm(archeRealmId, null, {archetypeBias:opts.archetypeBias}):null;
  const skin=(typeof PLACE_SKINS!=="undefined")?(PLACE_SKINS[realmId]||PLACE_SKINS.frontier):null;
  // name: skin namePatterns (mundane-key realms) emit a DM-facing hint field ONLY (PLACE-GEN §3.2
  // scope fence — no token-filling machinery in v1); the actual name still always comes from
  // placeNameDesc, unchanged, so a no-skin/no-pattern realm's name path is byte-identical.
  let namePattern=null;
  if(skin && skin.namePatterns && skin.namePatterns.length){
    const idx=(typeof rollDie==="function")?rollDie(skin.namePatterns.length)-1:0;
    namePattern=skin.namePatterns[Math.max(0,Math.min(skin.namePatterns.length-1,idx))];
  }
  const name=opts.name||nd.name||"Unnamed Place";
  const typeLabel=arche?arche.label:null;
  const payload={
    kind:"location", name, provenance:"rolled",
    rolled:{ setting:setting?setting.text:null, trait:traitText, calamity,
      secret:secretText, history:hist?hist.text:null },
    fields:{ desc:nd.desc||null, trait:traitText, calamity },
    dm:{ secret:secretText, secretBand:sc[0]||(secret?secret.band:null), history:hist?hist.text:null }
  };
  if(arche){
    payload.rolled.archetypeKey=arche.archetypeKey;
    payload.rolled.archetypeLabel=arche.label;
    payload.rolled.archetypeNote=arche.note;
    payload.rolled.space=arche.space;
    payload.rolled.staff=arche.staff;
    payload.rolled.cast=arche.cast;
    payload.rolled.dims=rollDimsInCells(arche.space);
    if(namePattern) payload.rolled.namePattern=namePattern;
    payload.fields.type=typeLabel;
    payload.dm.itemsPool="realm-items-"+realmId;
    // pointer-only (PLACE-GEN §3.6) — resolution to actual REALM_PROPS/surfaces keys is unit 8's
    // job; this is the realm handle the dressing resolver reads later.
    payload.dm.dressing={ props:realmId, surfaces:realmId };
    if(leakedRealm){
      payload.rolled.hybridRealm=leakedRealm;
      payload.dm.dressing.hybridProps=leakedRealm;
    }
  }
  // CONSEQUENCE LADDER (docs/CONSEQUENCE-LADDER.md §11): a NOTABLE place (opt-in via opts.art — prep
  // passes it) carries 0–2 art pieces. The depiction text is player-facing flavor (fields.art); only
  // hook/thread-seed pieces become pull-able HANDLES (dm.artHandles), minted as their own codex records
  // by prepCastFrontier. dead-end art is narrate-and-forget — no handle ("no four-toed statue").
  if(opts.art){
    const pieces=rollPlaceArt();
    if(pieces.length){
      payload.fields.art=pieces.map(p=>p.text);
      const handles=pieces.filter(p=>p.legs && p.legs!=="dead-end");
      if(handles.length) payload.dm.artHandles=handles;
    }
  }
  return payload;
}

/* roll 0–2 art pieces from the player-facing art-depiction table (rollTable now exposes legs/pool).
   ~50% none · ~33% one · ~17% two — art is occasional, not on every surface. */
function rollPlaceArt(){
  const r=(typeof rollExpr==="function")?rollExpr("d6"):1;
  const n=(r<=3)?0:((r<=5)?1:2);
  const out=[];
  for(let i=0;i<n;i++){ const a=rollTable("art-depiction"); if(a) out.push({ text:a.text, band:a.band, legs:a.legs||"", pool:a.pool||"" }); }
  return out;
}
