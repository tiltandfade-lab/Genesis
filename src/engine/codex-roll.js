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
/* pickCoherence(opts) — the tier-selection algorithm, exactly as specced:
     1. opts.coherence (DM hard override) set -> use it verbatim.
     2. else opts.walkOn -> 'archetype' (never reconcile weird atoms for a 10-second character).
     3. else opts.roleHint present -> 'archetype' (context already named the role; deliver it clean).
     4. else derive the region temperature from opts.region's fray (frayLevel(center.q,center.r); no
        region/no frayLevel loaded -> null -> Ordinary) and weighted-pick a tier off that curve row.
   Pure — reads opts only, no world/render/GS access (engine layer stays pure). */
function pickCoherence(opts){
  opts=opts||{};
  if(opts.coherence && COHERENCE_TIERS.indexOf(opts.coherence)>=0) return opts.coherence;
  if(opts.walkOn) return "archetype";
  if(opts.roleHint) return "archetype";
  const center=opts.region&&opts.region.center;
  const fray=(center && typeof frayLevel==="function") ? frayLevel(center.q, center.r) : null;
  return pickCoherenceTier(COHERENCE_CURVE[coherenceTemperature(fray)]);
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

/* rollNPC(opts) → a record-add payload for a statted, motivated NPC the DM only has to name+connect.
   opts: {name?, roleHint?, region?, species?, coherence?, walkOn?}. roleHint is recorded for the AI
   (flat d100 role table isn't biasable yet). REGIONS-NAMES.md §3: opts.region (a w.regions[] record)
   blends region-culture names (70%) with species-flavor names (30%, the existing npcRolledName path)
   via regionBlendedName — omit opts.region (every existing caller does today) and this is
   byte-identical to before.
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
   unchanged (every key still present), only the value. want/role/name/race are NEVER suppressed. */
function rollNPC(opts){
  opts=opts||{};
  const coherence=pickCoherence(opts);
  const gate=coherenceAtomGate(coherence);
  const race=rollTable("npc-race-weighted");
  const role=rollTable("npc-role");
  const quirk=gate.quirk?rollTable("npc-visual-quirk"):null;
  const mann=gate.manner?rollTable("npc-mannerisms"):null;
  const flaw=gate.flawSecret?rollTable("npc-flaws-secrets"):null;   // d300 — what they hide / their fatal weakness
  const bond=gate.bond?rollTable("npc-bonds"):null;                 // d300 — what they protect (the lever)
  const fear=gate.fear?rollTable("npc-fear"):null;
  const lever=gate.leverage?rollTable("npc-leverage"):null;
  const want=rollTable("npc-want");   // ALWAYS fires, at every tier (NPC-COHERENCE-DIAL.md invariant)
  const moti=gate.motivation?rollTable("npc-immediate-motivation"):null; // d300 — what they're doing when first noticed
  const tx=r=>r?r.text:null;
  const species=opts.species||npcSpeciesFromRace(tx(race));
  // ON-DEMAND-GEN §3 (Quick NPC Generator 2.0 pattern): 1d2 gender roll picks the gendered name pool.
  const gender=(typeof rollDie==="function"?rollDie(2):(Math.random()<0.5?1:2))===1?"female":"male";
  const name=opts.name || ((typeof regionBlendedName==="function")
    ? regionBlendedName(opts.region, species, gender) : npcRolledName(species,gender));
  const payload={
    kind:"npc", name, provenance:"rolled",
    rolled:{ race:tx(race), role:tx(role), quirk:tx(quirk), mannerism:tx(mann),
      flawSecret:tx(flaw), bond:tx(bond), fear:tx(fear), leverage:tx(lever),
      want:tx(want), motivation:tx(moti), roleHint:opts.roleHint||null, gender, coherence },
    fields:{ species, role:tx(role),
      demeanor:[tx(quirk),tx(mann)].filter(Boolean).join("; ")||null },
    dm:{ secret:tx(flaw), fear:tx(fear), bond:tx(bond),
      leverage:tx(lever), want:tx(want), motivation:tx(moti) }
  };
  const center=opts.region&&opts.region.center;
  const fray=(center && typeof frayLevel==="function") ? frayLevel(center.q, center.r) : 0;
  const touch=rollNpcBreachTouch(fray);
  if(touch) payload.dm.breachTouch=touch.text;   // DM-only lever, same tier as secret/fear/bond/leverage/want
  return payload;
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

/* rollPlace(opts) → a record-add payload for a named location with a defining trait + a hidden truth.
   opts: {name?, depth?}. depth=true also rolls place-history. */
function rollPlace(opts){
  opts=opts||{};
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
  const name=opts.name||nd.name||"Unnamed Place";
  const payload={
    kind:"location", name, provenance:"rolled",
    rolled:{ setting:setting?setting.text:null, trait:traitText, calamity,
      secret:secretText, history:hist?hist.text:null },
    fields:{ desc:nd.desc||null, trait:traitText, calamity },
    dm:{ secret:secretText, secretBand:sc[0]||(secret?secret.band:null), history:hist?hist.text:null }
  };
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
