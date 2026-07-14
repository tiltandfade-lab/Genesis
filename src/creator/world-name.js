/* GENESIS MODULE — src/creator/world-name.js — TIYL-DEEPENING §1: rolled world/PC-name OPTIONS.
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   The found screen (bardo.js `t==="found"`) offered free-text-or-one-random-fallback for both the
   world name and the PC name. This module adds the THREE-ROLLED-OPTIONS surface docs/TIYL-DEEPENING.md
   §1 asks for: worldNameOptions() draws 3 names off the compiled `world-name-pattern` table (d20,
   Engine/03. _Tables/01. World Building/Place Generation/World Name Patterns.md), filling each
   pattern's «root»/«culture-root»/«noun»/«geography»/«adjective»/«suffix» slots from small closed
   word-lists this module owns (the table's own frontmatter: "the engine owns [these] alongside this
   table") + NAME_CULTURES' family banks for the culture-flavored slots. charNameOptions(species)
   draws 3 PC names blended species × NAME_CULTURES (REGIONS-NAMES.md §3's 70/30 rule, reusing
   regionBlendedName's fallback chain) — at the found screen there is no minted region yet (world-gen
   hasn't run), so this always takes the no-region fallback path region-culture code already defines:
   a uniform pick across all 12 culture banks stands in for "region assigns 2 of 12" pre-world.
   Both are NULL-SAFE: if the compiled table / NAME_CULTURES isn't loaded, each returns fewer (or zero)
   options and the existing single 🎲 reroll + free-text path still works untouched — free text always
   wins (bardoFound/bardoWake already just read the input's value; this module never touches that). */

/* ---- small closed word-lists the world-name-pattern table's frontmatter asks this module to own ---- */
const WNAME_NOUN=["Hollow","Bell","Gate","Ledger","Bridge","Well","Lantern","Mask","Anchor","Crown",
  "Ashes","Bones","Tide","Ember","Veil","Thorn","Hour","Salt","Smoke","Wick"];
const WNAME_GEOGRAPHY=["Downs","Reach","Vale","Marsh","Crossing","Ford","Barrow","Moor","Fen","Ridge",
  "Hollow","Strand","Mire","Watch","Gloom","Rest","Cross","Hold","Wend","Fall"];
const WNAME_ADJECTIVE=["Weeping","Broken","Quiet","Hollow","Silent","Grey","Rusted","Drowned","Forgotten",
  "Withered","Cold","Burning","Hidden","Bitter","Long","Old","Deep","Fraying","Restless","Salt-worn"];
const WNAME_SUFFIX=["holm","ford","-on-Marsh","stead","gate","reach","hollow","mere","wick","barrow"];

/* one culture-root (a family-name pick from a random NAME_CULTURES bank) — the pre-world fallback
   for REGIONS-NAMES.md §3's "region-first" rule (no region exists yet at the found screen). */
function wnameCultureRoot(){
  if(typeof NAME_CULTURES==="undefined")return null;
  const keys=Object.keys(NAME_CULTURES);if(!keys.length)return null;
  const bank=NAME_CULTURES[pick(keys)];
  const pool=(bank.family&&bank.family.length)?bank.family:(bank.male||bank.female||[]);
  return pool.length?pick(pool):null;
}
/* a bare root — reuses randomWorldName's own root syllables (roster.js) so an un-cultured pattern
   still reads in the house voice rather than inventing a third word-bank. */
function wnameRoot(){
  const A=["Ash","Mire","Salt","Grey","Rust","Bog","Iron","Cinder","Thorn","Fen","Gloam","Bram","Dross","Marrow","Soot","Wynd","Glass","Copper","Slate","Pale","Dusk","Harrow","Quill","Tide","Mox","Vael","Wick","Bran"];
  return pick(A);
}

/* fill one world-name-pattern row's pattern string (cells[0], e.g. "«root»'s «noun»") with the
   word-lists above. Unknown/unfilled tokens degrade to the literal token text (never throws). */
function wnameFillPattern(pattern){
  return (pattern||"").replace(/«([a-z-]+)»/g,(m,tok)=>{
    if(tok==="root")return wnameRoot();
    if(tok==="culture-root")return wnameCultureRoot()||wnameRoot();
    if(tok==="noun")return pick(WNAME_NOUN);
    if(tok==="geography")return pick(WNAME_GEOGRAPHY);
    if(tok==="adjective")return pick(WNAME_ADJECTIVE);
    if(tok==="suffix")return pick(WNAME_SUFFIX);
    return m;
  });
}

/* worldNameOptions(n=3) → up to n distinct rolled world names off the compiled world-name-pattern
   table. Falls back to randomWorldName() (roster.js, unchanged) when the table isn't compiled yet —
   never fewer than n names, never a throw. */
function worldNameOptions(n){
  n=n||3;const out=[];let guard=0;
  const haveTable=(typeof rollTable==="function");
  while(out.length<n && guard<n*8){
    guard++;
    let name=null;
    if(haveTable){
      const row=rollTable("world-name-pattern");
      if(row && row.cells && row.cells[0]) name=wnameFillPattern(row.cells[0]);
    }
    if(!name && typeof randomWorldName==="function") name=randomWorldName();
    if(name && out.indexOf(name)<0) out.push(name);
    else if(!haveTable && typeof randomWorldName!=="function") break;   // nothing to draw from at all
  }
  return out;
}

/* charNameOptions(species, n=3) → up to n distinct rolled PC names, species × culture-bank blended
   (REGIONS-NAMES.md §3's 70/30 rule; no region exists at the found screen, so this draws uniformly
   across all 12 culture banks in place of "the region's assigned 2 of 12"). Falls back to
   randomCharName(species) when NAME_CULTURES isn't loaded. */
function charNameOptions(species,n){
  n=n||3;const out=[];let guard=0;
  while(out.length<n && guard<n*8){
    guard++;
    const name=(typeof regionBlendedName==="function")
      ? regionBlendedName(null,species,(rollDie(2)===1?"female":"male"))
      : ((typeof randomCharName==="function")?randomCharName(species):null);
    if(name && out.indexOf(name)<0) out.push(name);
    else if(typeof regionBlendedName!=="function" && typeof randomCharName!=="function") break;
  }
  return out;
}
