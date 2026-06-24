/* GENESIS MODULE — src/engine/codex-roll.js — the CODEX rollers (Phase 2; docs/CODEX.md §2).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The engine mints the ATOMS; the AI assigns meaning + wires links. rollNPC()/rollPlace() chain the
   already-compiled NPC/place tables (via rollTable from engine.compiled) into a record-shaped payload
   ready for codexAdd — `rolled` (raw dice verbatim), a player-safe `fields` glance-read, and DM-only
   `dm` levers (secret/fear/bond/want). They DO NOT write the world: prep/the DM emit codex_add events.
   Reads CHAR_NAMES (data.names) + pick (engine.core) + rollTable (engine.compiled) at call-time. */

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
/* a provisional name from a species pool — the DM name-confirms; here only so the record has an id. */
function npcRolledName(species){
  const p=(typeof CHAR_NAMES!=="undefined"&&CHAR_NAMES[species])||(typeof CHAR_NAMES!=="undefined"&&CHAR_NAMES.Human)||{first:["Stranger"],last:[]};
  const f=pick(p.first);
  return (p.last&&p.last.length&&Math.random()<0.8)?f+" "+pick(p.last):f;
}
/* a place's name + desc live in one cell: "The Bog-Iron Camp: A collection of mud-caked tents …". */
function placeNameDesc(text){
  const i=(text||"").indexOf(":");
  if(i>0)return {name:text.slice(0,i).trim(), desc:text.slice(i+1).trim()};
  return {name:null, desc:text||""};
}

/* rollNPC(opts) → a record-add payload for a statted, motivated NPC the DM only has to name+connect.
   opts: {name?, roleHint?}. roleHint is recorded for the AI (flat d100 role table isn't biasable yet). */
function rollNPC(opts){
  opts=opts||{};
  const race=rollTable("npc-race-weighted");
  const role=rollTable("npc-role");
  const quirk=rollTable("npc-visual-quirk");
  const mann=rollTable("npc-mannerisms");
  const flaw=rollTable("npc-flaws-secrets");   // d300 — what they hide / their fatal weakness
  const bond=rollTable("npc-bonds");           // d300 — what they protect (the lever)
  const fear=rollTable("npc-fear");
  const lever=rollTable("npc-leverage");
  const want=rollTable("npc-want");
  const moti=rollTable("npc-immediate-motivation"); // d300 — what they're doing when first noticed
  const tx=r=>r?r.text:null;
  const species=npcSpeciesFromRace(tx(race));
  const name=opts.name||npcRolledName(species);
  return {
    kind:"npc", name, provenance:"rolled",
    rolled:{ race:tx(race), role:tx(role), quirk:tx(quirk), mannerism:tx(mann),
      flawSecret:tx(flaw), bond:tx(bond), fear:tx(fear), leverage:tx(lever),
      want:tx(want), motivation:tx(moti), roleHint:opts.roleHint||null },
    fields:{ species, role:tx(role),
      demeanor:[tx(quirk),tx(mann)].filter(Boolean).join("; ")||null },
    dm:{ secret:tx(flaw), fear:tx(fear), bond:tx(bond),
      leverage:tx(lever), want:tx(want), motivation:tx(moti) }
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
  return {
    kind:"location", name, provenance:"rolled",
    rolled:{ setting:setting?setting.text:null, trait:traitText, calamity,
      secret:secretText, history:hist?hist.text:null },
    fields:{ desc:nd.desc||null, trait:traitText, calamity },
    dm:{ secret:secretText, secretBand:sc[0]||(secret?secret.band:null), history:hist?hist.text:null }
  };
}
