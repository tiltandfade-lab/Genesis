/* GENESIS MODULE — src/engine/codex-roll.js — the CODEX rollers (Phases 2+5; docs/CODEX.md §2, §5).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The engine mints the ATOMS; the AI assigns meaning + wires links. rollNPC()/rollPlace()/rollItem()/
   rollBuildingInterior() chain the already-compiled tables (via rollTable from engine.compiled) into a
   record-shaped payload ready for codexAdd — `rolled` (raw dice verbatim), a player-safe `fields`
   glance-read, and DM-only `dm` levers. Items carry a `source` pointer (§8b), not a duplicated definition.
   They DO NOT write the world: prep/the DM emit codex_add events.
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

/* rollItem(opts) → a record-add payload for a SPECIFIC plot-object (the macguffin a quest turns on).
   opts: {name?, lock?}. lock=true also rolls the plot-lock companion (what's sealed + where the key is).
   Items are POINTERS (§8b): the record carries `source:{type:"plot",ref:"plot-item#<row>"}` + the rolled
   text; the codex holds the instance + relationships, not a duplicated definition. */
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
  return {
    kind:"item", name, provenance:"rolled",
    source:{ type:"plot", ref: it?("plot-item#"+it.total):null },
    rolled:{ object, why, opens, lock },
    fields:{ object, opens },                      // player-safe once known: what it is + what it does
    dm:{ why, opens, lock }                        // the DM holds why-it-matters + the lock/key location
  };
}

/* rollBuildingInterior(opts) → a record-add payload for the inside of a building the players enter
   (connected spaces + a feature + who/what's inside). Fills the "the gran's house had nothing to roll"
   gap. opts: {name?, kind?}. kind biases the caller's framing (home/shrine/warehouse). */
function rollBuildingInterior(opts){
  opts=opts||{};
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
