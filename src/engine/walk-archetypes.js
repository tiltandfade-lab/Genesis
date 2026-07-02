/* GENESIS MODULE — src/engine/walk-archetypes.js — live rosters for the walk-rollers (docs/WALK-REFRESH.md §1)
   Classic <script> (shared global scope). Registered in manifest.json; validated by build/check-manifest.py.
   MUST load after data/bestiary.js (BESTIARY/BESTIARY_BY_CR) + src/engine/walk.js (walkRnd/walkPickFromPool).

   THE DIAGNOSIS (WALK-REFRESH §0): the three walk generators kept threat/enemy archetypes to a frozen
   3-4-name authored "Suggested Stat Blocks" pool (walkPickFromPool) while data/bestiary.js holds 510
   statted entries (incl. Adam's 95 customs). Adam's fork: CODE-SIDE registry v1, zero table surgery —
   authored rows stay verbatim; the pools become the guaranteed FLOOR, never deleted.

   WALK_ARCHETYPES keys by the archetype string AS IT APPEARS IN THE TABLES: the wilderness enemy
   CATEGORY name (col 1 of wilderness-enemy-category) and the dungeon/urban THREAT-IDENTITY id (col 1
   of *-threat-identity-t1/t2). Coverage is best-effort — an archetype absent from this registry falls
   back to authored-pool-only (today's behavior, graceful; the spec's explicit "unknown archetype" case).
   Entry shape: { types:[bestiary tag strings], sizeMax?, crBand:(tier)=>({lo,hi}), habitatPref?,
   authoredFloorWeight:~0.35 }. */

const WALK_ARCHETYPE_FLOOR_WEIGHT = 0.35;

// tier: 1|2 (T1/T2 per TIER-SCOPE.md). slot: "boss"|"mid"|"low"|null (unslotted wilderness pulls).
function warchCrBand(tier, slot){
  const t2 = tier===2;
  if(slot==="boss") return t2 ? {lo:5, hi:10} : {lo:2, hi:5};
  if(slot==="mid")  return t2 ? {lo:2, hi:6}  : {lo:0.5, hi:3};
  if(slot==="low")  return t2 ? {lo:0.125, hi:3} : {lo:0, hi:1};
  return t2 ? {lo:0.125, hi:6} : {lo:0, hi:3};                 // unslotted (wilderness single-pull)
}

const WALK_ARCHETYPES = {
  // ─── wilderness-enemy-category (col 1) ─────────────────────────────────────
  "Opportunistic Scavengers":  { types:["undead","beast","monstrosity"], habitatPref:null },
  "Territorial Ambushers":     { types:["beast","monstrosity"] },
  "The Brute / Apex Predator": { types:["beast","monstrosity","giant"], sizeMax:"huge" },
  "Hunting Pack":              { types:["beast","monstrosity"] },
  "Mindless Horde":            { types:["undead","ooze","construct"] },
  "Desperate Humanoids":       { types:["humanoid"], habitatPref:"urban" },
  "Rival Adventurers / Elite Patrol": { types:["humanoid"] },
  "Extraplanar / Magical Threat": { types:["fiend","elemental","celestial","aberration"], habitatPref:"planar" },

  // ─── dungeon-threat-identity-t1/t2 (col 1) ─────────────────────────────────
  "Risen Dead":            { types:["undead"], habitatPref:"undead" },
  "Shadow Court":          { types:["undead","fey"], habitatPref:"undead" },
  "Necromancer's Workshop":{ types:["undead","humanoid"], habitatPref:"undead" },
  "Bandit Stronghold":     { types:["humanoid"], habitatPref:"urban" },
  "Goblin Warrens":        { types:["humanoid","fey"] },
  "Cultist Shrine":        { types:["humanoid","fiend"], habitatPref:"planar" },
  "Spider Nest":           { types:["monstrosity","beast"] },
  "Beast Den":             { types:["beast"] },
  "Construct Watch":       { types:["construct"] },
  "Gnoll Warband":         { types:["humanoid","fiend"] },
  "Orc Raid Camp":         { types:["humanoid"] },
  "Ooze Outbreak":         { types:["ooze"] },
  "Lizardfolk Warren":     { types:["humanoid"], habitatPref:"swamp" },
  "Fey Trespass":          { types:["fey"] },
  "Fungal Bloom":          { types:["plant"] },
  "Lycanthrope Pack":      { types:["humanoid","monstrosity"], habitatPref:"forest" },
  "Planar Seepage":        { types:["elemental","fiend","aberration"], habitatPref:"planar" },
  "Earth Bound":           { types:["elemental","construct"] },
  "Dragon Lair":           { types:["dragon"], sizeMax:"gargantuan" },
  "Thieves' Guild":        { types:["humanoid"], habitatPref:"urban" },
  "Hag Domain":            { types:["fey","monstrosity"], habitatPref:"swamp" },
  "Vampire Domain":        { types:["undead"], habitatPref:"undead" },
  "Aberrant Nest":         { types:["aberration"], habitatPref:"underdark" },
  "Deep-Elf Outpost":      { types:["humanoid"], habitatPref:"underdark" },
  "Serpent Pit":           { types:["monstrosity","beast"] },
  "Giant Colony":          { types:["giant"], sizeMax:"gargantuan" },
  "Fire Cult":             { types:["humanoid","elemental"] },
  "Deeplands Hunters":     { types:["monstrosity","aberration"], habitatPref:"underdark" },
  "Demon Infestation":     { types:["fiend"], habitatPref:"planar" },
  "Shadow Breach":         { types:["undead","fiend"], habitatPref:"planar" },
  "Elder Deep-Thing's Reach": { types:["aberration"], habitatPref:"underdark" },
  "Devil Pact":            { types:["fiend"], habitatPref:"planar" },

  // ─── urban-threat-identity-t1/t2 (col 1) — humanoid-heavy by nature of the environment ───────────
  "Street Gang":           { types:["humanoid"], habitatPref:"urban" },
  "Smuggler Ring":         { types:["humanoid"], habitatPref:"urban" },
  "Corrupt Guard":         { types:["humanoid"], habitatPref:"urban" },
  "City Watch Turncoat":   { types:["humanoid"], habitatPref:"urban" },
  "Noble House Agent":     { types:["humanoid"], habitatPref:"urban" },
  "Religious Fanatic Sect":{ types:["humanoid"], habitatPref:"urban" },
  "Heretical Inquisitor Cell": { types:["humanoid"], habitatPref:"urban" },
  "Shadow Cult":           { types:["humanoid","undead"], habitatPref:"urban" },
  "Rogue Wizard Ring":     { types:["humanoid"], habitatPref:"urban" },
  "Arcane Smugglers":      { types:["humanoid"], habitatPref:"urban" },
  "Alchemist Cabal":       { types:["humanoid"], habitatPref:"urban" },
  "Necromancer Cells":     { types:["humanoid","undead"], habitatPref:"urban" },
  "Grave Robber Gang":     { types:["humanoid","undead"], habitatPref:"urban" },
  "Restless Haunting":     { types:["undead"], habitatPref:"undead" },
  "Wererat Warren":        { types:["humanoid","monstrosity"], habitatPref:"urban" },
  "Sewer Creature Nest":   { types:["monstrosity","ooze","beast"], habitatPref:"underdark" },
  "Doppelganger Ring":     { types:["monstrosity"], habitatPref:"urban" },
  "Mimic Hoard":           { types:["monstrosity"] },
  "Awakened Animal Cult":  { types:["beast"], habitatPref:"urban" },
  "Foreign Spy Network":   { types:["humanoid"], habitatPref:"urban" },
  "Rival Guild":           { types:["humanoid"], habitatPref:"urban" },
  "Con Artist Operation":  { types:["humanoid"], habitatPref:"urban" },
  "Blackmailer Ring":      { types:["humanoid"], habitatPref:"urban" },
  "Slaver Syndicate":      { types:["humanoid"], habitatPref:"urban" },
  "Imp Summoning Pact":    { types:["fiend"], habitatPref:"planar" },
  "Quasit Infiltrator":    { types:["fiend"], habitatPref:"planar" },
  "Fey Incursion":         { types:["fey"] },
  "Shadow Creature Lair":  { types:["undead","fey"], habitatPref:"undead" },
  "Cloaked Cult of the Old God": { types:["humanoid","aberration"], habitatPref:"urban" },
  "Shadow Thieves Guild":  { types:["humanoid"], habitatPref:"urban" },
  "Assassin's Syndicate":  { types:["humanoid"], habitatPref:"urban" },
  "Smuggling Cartel":      { types:["humanoid"], habitatPref:"urban" },
  "Slave Ring Network":    { types:["humanoid"], habitatPref:"urban" },
  "Dockside Enforcers":    { types:["humanoid"], habitatPref:"urban" },
  "Extortion Racket":      { types:["humanoid"], habitatPref:"urban" },
  "Tomb Robber Syndicate": { types:["humanoid","undead"], habitatPref:"urban" },
  "Black Market Fence Network": { types:["humanoid"], habitatPref:"urban" },
  "Arena Fight Pit Lords": { types:["humanoid"], habitatPref:"urban" },
  "Mercenary Company":     { types:["humanoid"], habitatPref:"urban" },
  "Rogue Military Unit":   { types:["humanoid"], habitatPref:"urban" },
  "Coup Plotters":         { types:["humanoid"], habitatPref:"urban" },
  "War Profiteer Cartel":  { types:["humanoid"], habitatPref:"urban" },
  "Noble House Private Army": { types:["humanoid"], habitatPref:"urban" },
  "Foreign Embassy Black Ops": { types:["humanoid"], habitatPref:"urban" },
  "Revolutionary Cell":    { types:["humanoid"], habitatPref:"urban" },
  "Tyranny's Secret Police": { types:["humanoid"], habitatPref:"urban" },
  "Devil-Pact Church":     { types:["fiend","humanoid"], habitatPref:"planar" },
  "Undead Congregation":   { types:["undead"], habitatPref:"undead" },
  "Vampire Spawn Nest":    { types:["undead"], habitatPref:"undead" },
  "Ghost Court":           { types:["undead"], habitatPref:"undead" },
  "Wight-Led Militia":     { types:["undead","humanoid"], habitatPref:"undead" },
  "Necromancer Academy":   { types:["undead","humanoid"], habitatPref:"undead" },
  "Shadow Fell Bleed":     { types:["undead","fiend"], habitatPref:"planar" },
  "Rogue Wizard Cabal":    { types:["humanoid"], habitatPref:"urban" },
  "Golem Workshop":        { types:["construct"] },
  "Enchantment Ring":      { types:["humanoid"], habitatPref:"urban" },
  "Magical Weapons Dealers": { types:["humanoid"], habitatPref:"urban" },
  "Doppelganger Network":  { types:["monstrosity"], habitatPref:"urban" },
  "Werewolf Pack":         { types:["humanoid","monstrosity"], habitatPref:"forest" },
  "Changeling Infiltrators": { types:["humanoid"], habitatPref:"urban" },
  "Devil Agent Network":   { types:["fiend"], habitatPref:"planar" },
  "Fey Court in the City": { types:["fey"] },
  "Elemental Cult":        { types:["elemental","humanoid"] },
  "Yuan-ti Infiltrators":  { types:["humanoid","monstrosity"] },
  "Mind-Thief Agents":     { types:["aberration"] },
  "Hag Coven (Sewers)":    { types:["fey","monstrosity"], habitatPref:"underdark" },
  "Eye-Tyrant Crime Lord": { types:["aberration"], sizeMax:"large" },
  "Aberrations Beneath":   { types:["aberration"], habitatPref:"underdark" },
  "Ooze Infestation":      { types:["ooze"] },
  "Cult of the Forgotten God": { types:["humanoid","aberration"], habitatPref:"urban" },
  "Lamia's Court":         { types:["monstrosity"] },
  "Shade Enclave":         { types:["undead"], habitatPref:"undead" },
  "Demon Summoning Ring":  { types:["fiend"], habitatPref:"planar" },
  "Chaos-Frog Chaos Cult": { types:["humanoid","monstrosity"] },
  "Dragon Cult":           { types:["humanoid","dragon"] },
  "Goliath Stronghold":    { types:["giant","humanoid"] },
  "Gray Dwarf Slave Trade":{ types:["humanoid"], habitatPref:"underdark" },
  "Gnoll Raiding Band":    { types:["humanoid","fiend"] },
  "Lich's Undead Army":    { types:["undead"], habitatPref:"undead" },
};

/* ── the BESTIARY-side pool builder ──────────────────────────────────────────
   Filters BESTIARY entries by the registry entry's types/sizeMax/habitatPref + a CR band; habitatPref
   is a SOFT preference (narrows only if it leaves ≥3 candidates, per §1 "never a hard gate"). */
function warchSizeRank(s){ return {"tiny":0,"small":1,"medium":2,"large":3,"huge":4,"gargantuan":5}[String(s||"").toLowerCase()]; }
function warchBestiaryPool(entry, tier, slot){
  if(typeof BESTIARY==="undefined" || !entry) return [];
  const band=warchCrBand(tier, slot), sizeCap=entry.sizeMax?warchSizeRank(entry.sizeMax):null;
  let pool=Object.values(BESTIARY).filter(m=>{
    const tags=m.tags||{};
    if(m.cr==null || m.cr<band.lo || m.cr>band.hi) return false;
    if(entry.types && entry.types.length && (!tags.type || entry.types.indexOf(tags.type)<0)) return false;
    if(sizeCap!=null){ const r=warchSizeRank(tags.size); if(r!=null && r>sizeCap) return false; }
    return true;
  });
  if(entry.habitatPref){
    const narrowed=pool.filter(m=>(m.tags||{}).habitat===entry.habitatPref);
    if(narrowed.length>=3) pool=narrowed;                 // soft preference — only narrows if it still leaves choices
  }
  return pool;
}

/* resolveArchetypePool(archetypeName, {tier,biome,slot}) → a creature NAME STRING (byte-compatible
   with walkPickFromPool's return — walk.js/dungeon-walk.js/wild-walk.js just swap the call site).
   candidates = bestiary(registry-filtered) ∪ authoredPool (the floor); weighted pick keeps the
   authored pool's voice present at WALK_ARCHETYPE_FLOOR_WEIGHT even when the bestiary pool is large.
   Unknown archetype (not in WALK_ARCHETYPES) OR no bestiary matches → authored pool only (graceful,
   today's exact behavior — the spec's explicit fallback case). authoredPoolStr is the raw "A / B / C"
   cell text (already parsed by walkPickFromPool internally when this returns to a plain-pool caller). */
function resolveArchetypePool(archetypeName, opts, authoredPoolStr){
  opts=opts||{};
  const entry=WALK_ARCHETYPES[archetypeName];
  const authored=(authoredPoolStr||"").split(/\s*\/\s*/).map(s=>s.trim()).filter(Boolean);
  if(!entry || typeof BESTIARY==="undefined") return authored.length ? walkRnd(authored) : (authoredPoolStr||"[creature?]");
  const bestiaryPool=warchBestiaryPool(entry, opts.tier, opts.slot);
  if(!bestiaryPool.length) return authored.length ? walkRnd(authored) : (authoredPoolStr||"[creature?]");
  if(!authored.length) return walkRnd(bestiaryPool).name;
  // weighted pick: authored floor at WALK_ARCHETYPE_FLOOR_WEIGHT, the live bestiary pool splits the rest
  return (Math.random()<WALK_ARCHETYPE_FLOOR_WEIGHT) ? walkRnd(authored) : walkRnd(bestiaryPool).name;
}
