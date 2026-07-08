/* GENESIS MODULE — src/engine/theater-data.js — BATTLE-THEATER T1 (docs/BATTLE-THEATER.md §1/§7).
   Classic <script>, shared global scope. Registered in manifest.json; validated by check-manifest.py.

   PURE DATA LAYER for the three.js battle stage. Turns the existing zone-grid combat state into two
   plain-object shapes the GL boot module (src/ui/theater-boot.js) consumes and never has to derive
   itself — "one derivation, three views: the same zone grid drives the theater, the 2D tracker grid,
   and cmbProseSummary — they can never disagree" (§1). Every function here is a pure read: takes a
   segment/combat/scene snapshot, returns a fresh object, never mutates its inputs, never touches
   GS/w/U, never calls rollDie or any RNG (placement determinism is inherited from cmZoneGrid/
   cmPlaceFoeLane's own seeded math — this layer only re-projects zone/lane coordinates it is handed).
   Headless-testable by construction (dev/verify-theater-data.mjs, jsdom, no GL). */

/* §1 tile-grid shape constants. Each band×lane zone is a 3x3 tile patch (BATTLE-THEATER.md §1's
   FFT mapping: "board IS the zone grid extruded — bands = depth rows, lanes = columns"). Tile units
   are abstract grid cells (1 tile = 1 unit); the GL layer scales to world space. */
const THEATER_PATCH = 3;             // tiles per zone edge (3x3 patch)
const THEATER_STEP = 1.0;            // one discrete height increment (§1 rule 1: half-unit steps in
                                      // the FFT sense; G9 tune 2 doubled the WORLD-unit value from 0.5
                                      // -> 1.0 so a raise/sink is unmistakable at the ~35° camera —
                                      // was reading as barely-there at the old value)

/* T1.5 PSX GRIT PASS (docs/BATTLE-THEATER.md ruling extended 2026-07-03 by Adam: "gritty PS1 —
   Vagrant Story surface feel, FFT board grammar; kill the clean/cartoon read"). ENV -> palette
   table, pure data so it stays jsdom-testable (dev/verify-theater-data.mjs) with zero GL coupling.
   Each palette is a DESATURATED earth pairing: oxblood/steel/bone/moss mood, low saturation, ONE
   accent color per env (never more — that's what keeps it grim instead of colorful). Fields:
     top / side       — the tile column's default floor top/side pair (§1 rule 2's top!=side trick)
     altTop           — a second top tone for the checker alternation (rule 2 again, "stronger
                         top-face checker alternation... the FFT reference's legibility trick")
     water            — sunk/hazard-water tint (theaterHazardVariant's water branch reads this)
     scorch           — burn/scorch-mark tint (terrain_change's future "burn" op, T4; also used here
                         as the non-water/pit hazard tint so a caltrops-style hazard reads in-palette)
     prop             — cover/prop column tint (rocks, rubble, crates — replaces the old flat brown)
     voidTint         — the GL void background for this env (near-black, palette-tinted, not pure
                         0x000000 — keeps every env's void a hair different so a screenshot can tell
                         dungeon void from breach void even with nothing else on screen)
     accent           — the ONE saturated color this env is allowed, reserved for HAZARD tiles
                         (scorch/lava-style alarm reads); never spent on plain floor or elevation
     elevTint         — the elevated-patch tint (G9 tune 2): a lightened variant of this env's
                         stone `top`, NOT `accent` — elevation must read as height, not danger */
/* G9 TUNE 1 (docs/PRE-PLAYTEST-GAUNTLET.md §10b): orchestrator verdict was "mood right, legibility
   overshot into murk" — tile TOP colors lifted ~+35% luminance (HSL-lightness scale, dungeon was the
   worst offender at lum 0.257) and `altTop` pushed FURTHER from `top` (was a ~0.03 luminance delta —
   invisible after dither; now ~0.12-0.17, a real checkerboard) so the checker is plainly visible at a
   glance. `side` colors are UNCHANGED — they were already the dark half of the top/side contrast
   mechanism (FFT rule 2) and this tune only touches the top face.
   `elevTint` (NEW field, G9 tune 2): the elevated-patch color. Previously elevated tiles borrowed
   `accent` (dungeon's is oxblood #7a2e28 — reads as a hazard/alarm, not a height cue). `elevTint` is
   a lightened variant of THIS env's (post-tune) stone `top` (~+45% HSL lightness) so a raised patch
   reads as "brighter ground, same family" — height, not danger. `accent` stays reserved for actual
   hazards (scorch/lava/the one saturated color a hazard is allowed to spend). */
const THEATER_ENV_PALETTE = {
  dungeon: {
    top: "#64564c", side: "#241f1a", altTop: "#3e352f",
    water: "#28414a", scorch: "#3a2418", prop: "#332b24",
    voidTint: "#0a0807", accent: "#7a2e28", // oxblood — hazards only
    elevTint: "#917d6e" // lightened stone top — elevation reads as height, not alarm
  },
  urban: {
    top: "#7c7467", side: "#2c2822", altTop: "#4d4840",
    water: "#31474f", scorch: "#3f2c1c", prop: "#413c34",
    voidTint: "#09090a", accent: "#6e6558", // bone/dust — hazards only
    elevTint: "#ada79c"
  },
  wilderness: {
    top: "#595d3e", side: "#22241a", altTop: "#373a26",
    water: "#274a45", scorch: "#3a2a16", prop: "#38361f",
    voidTint: "#07090a", accent: "#4d5a34", // moss — hazards only
    elevTint: "#81875a"
  },
  breach: {
    top: "#564c55", side: "#1e181c", altTop: "#352f35",
    water: "#2a3350", scorch: "#421f2c", prop: "#312a34",
    voidTint: "#0a0610", accent: "#5a3a5e", // bruised violet — the "wrongness" accent, hazards only
    elevTint: "#7d6e7b"
  }
};
const THEATER_DEFAULT_ENV = "dungeon";

/* env key -> its palette, defaulting cleanly on an unknown/absent key (never throws, never returns
   undefined — every caller can treat this as total). */
function theaterPaletteFor(env){
  return THEATER_ENV_PALETTE[env] || THEATER_ENV_PALETTE[THEATER_DEFAULT_ENV];
}

/* ============================================================================
   BATTLE-THEATER LIGHTING (docs/BATTLE-THEATER.md follow-up, Adam 2026-07-03: "we need some in-game
   lighting on the board — is that something the walk rolls? if not, it should be... some rooms as
   dark as the battlemap is now but others torchlight, lava light, glowing light, magic light, spell
   light"). §1 of that ruling: THE LIGHT BECOMES A ROLLED WALK FACT — a compact, in-code per-env light
   table (deliberately NOT the Engine markdown table corpus — this is a small mechanical fact table,
   same tier as CAPTURE_HOLDING_TAGS in src/world/capture.js, not prose-graded content), rolled at the
   SAME seam a segment is minted (walk.js/dungeon-walk.js/wild-walk.js) and seeded off the segment's own
   id the same way cmSeedHash seeds lane placement — re-entering a room reproduces the same light.

   Table shape: { weights:[...], profiles:[...] } — a parallel-array weighted table (not an object map)
   so `theaterRollLightProfile` can do a single cumulative-weight walk, same idiom walkWeighted (walk.js)
   already uses elsewhere in this codebase. Profile keys are the vocabulary theater-boot.js's
   LIGHT_PROFILES table renders (kept in sync by convention/comment, same one-way classic/ES-module
   boundary discipline as ENV_VOID_TINT/THEATER_ENV_PALETTE already establish for that file). */
const THEATER_LIGHT_TABLE = {
  dungeon: {
    weights:  [3, 2, 1, 1, 1],
    profiles: ["dark", "dark", "torchlit", "fungal-glow", "magic-glow"]
  },
  urban: {
    weights:  [2, 3, 2, 1],
    profiles: ["dark", "lamplit", "torchlit", "magic-glow"]
  },
  wilderness: {
    weights:  [3, 3, 2, 1, 1],
    profiles: ["daylit", "daylit", "moonlit", "overcast", "torchlit"]
  },
  breach: {
    weights:  [2, 2, 2, 2, 1],
    profiles: ["dark", "magic-glow", "fungal-glow", "lavalit", "voidlit"]
  }
};
const THEATER_DEFAULT_LIGHT = "dark";

/* deterministic seeded pick — same string-hash discipline as engine.combat's cmSeedHash (that file
   loads AFTER walk.js/dungeon-walk.js/wild-walk.js in manifest order, so this is a small local copy
   rather than a forward dependency; kept byte-identical to cmSeedHash's own algorithm by convention).
   Never throws on an empty/non-string seed (empty string still hashes to a stable 0). */
function theaterLightSeedHash(s){
  s = String(s || "");
  let h = 0;
  for(let i = 0; i < s.length; i++){ h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}

/* env -> a deterministic weighted profile pick, seeded off `seedKey` (a segment id, "roomId:lightRoll"
   style key, or any stable string the caller controls — same discipline BATTLEMAP's cmPlaceFoeLane
   uses: re-rolling with the SAME seed always returns the SAME profile, so re-entering a room never
   flickers to a different light). Unknown/absent env falls back to the dungeon table (never throws,
   never returns undefined). */
function theaterRollLightProfile(env, seedKey){
  const table = THEATER_LIGHT_TABLE[env] || THEATER_LIGHT_TABLE[THEATER_DEFAULT_ENV];
  const weights = table.weights, profiles = table.profiles;
  const total = weights.reduce((a, b) => a + b, 0);
  if(total <= 0) return THEATER_DEFAULT_LIGHT;
  const h = theaterLightSeedHash(seedKey) % total;
  let r = h;
  for(let i = 0; i < weights.length; i++){
    r -= weights[i];
    if(r < 0) return profiles[i];
  }
  return profiles[profiles.length - 1];
}

/* free-text (a segment's feature/hazard/description text) -> a light-profile override, or null when no
   keyword hits (the caller keeps the rolled default — "DERIVE overrides from existing segment features
   by keyword... beats the rolled default"). Ordered most-specific-word-first, same discipline
   THEATER_PROP_KEYWORD_RULES already establishes in this file; first match wins. A room whose text
   explicitly names a light source (a brazier, a lava flow, glowing fungus) should read that way
   regardless of what the dice said — the DM/table-authored fiction outranks the ambient roll. */
const THEATER_LIGHT_KEYWORD_RULES = [
  [/\blava\b|magma|molten/i, "lavalit"],
  [/\bmoon(light|lit)?\b/i, "moonlit"],
  [/sun(light|lit)?\b|daylight/i, "daylit"],
  [/overcast|grey sky|gray sky|cloud-choked/i, "overcast"],
  [/\blamp(light|lit)?\b|street.?lamp|lantern.?post/i, "lamplit"],
  [/\bbrazier\b|\btorch(es|light|lit)?\b|sconce/i, "torchlit"],
  [/fungal|glowing fungus|mushroom.*glow|bioluminescen/i, "fungal-glow"],
  [/void.?light|null.?glow|absence of light/i, "voidlit"],
  [/\bglow(ing)?\b|\bluminous\b|magic(al)? light|spell.?light|arcane glow/i, "magic-glow"],
  [/pitch.?black|\bunlit\b|no light|utter darkness/i, "dark"]
];
function theaterLightOverrideFromText(text){
  const t = String(text || "");
  if(!t) return null;
  for(let i = 0; i < THEATER_LIGHT_KEYWORD_RULES.length; i++){
    if(THEATER_LIGHT_KEYWORD_RULES[i][0].test(t)) return THEATER_LIGHT_KEYWORD_RULES[i][1];
  }
  return null;
}

/* the public per-segment roll: env + a seed key + the segment's own free text pool (feature/hazard/
   description — whatever the caller has) -> {profile, rolled, overridden}. `rolled` is always the pure
   dice result (kept so the fact survives even when a keyword overrides the RENDERED profile — useful
   for a future "what did the dice actually say" audit); `profile` is what actually renders/narrates:
   the keyword override when one hits, else the roll. Pure + total; never throws on missing args. */
function theaterRollLight(env, seedKey, text){
  const rolled = theaterRollLightProfile(env, seedKey);
  const override = theaterLightOverrideFromText(text);
  return { profile: override || rolled, rolled, overridden: !!override };
}

/* band index -> depth row (0 = nearest the void's front edge, increasing with CM_BANDS order so
   "melee" sits at row 0 and "out" sits furthest back — mirrors the existing melee-outward convention
   the rest of combat.js uses). lane index -> column, using whatever lane subset cmZoneGrid produced
   (already centered/clamped there — this layer never re-derives lane centering). */
function theaterZoneOrigin(bandIdx, laneIdx){
  return { x: laneIdx * THEATER_PATCH, z: bandIdx * THEATER_PATCH };
}

/* a hazard's free-text `kind` -> a sink amount (0 = no sink, just a tint) + a tint override, read off
   the env's own palette (T1.5: no more hardcoded tints — every hazard color is now palette-derived,
   so a dungeon water tile and a wilderness water tile read as the SAME env's palette family, not a
   universal blue). No fixed hazard vocabulary exists upstream (kind is DM-narrated free text,
   src/world/dm.js's hazardTick consumers) so this is a best-effort keyword read, not a registry:
   water/flood-ish words sink+tint to the palette's water color, pit/hole/chasm-ish words sink+tint
   near-black (always near-black regardless of env — a hole reads as void everywhere), anything else
   just tints to the palette's scorch color (a marked-but-solid hazard tile) without sinking. Never
   throws on a missing/empty kind or palette. */
function theaterHazardVariant(kind, palette){
  const p = palette || theaterPaletteFor();
  const k = String(kind || "").toLowerCase();
  if(/water|flood|swamp|bog/.test(k)) return { sink: 1, tint: p.water };
  if(/pit|hole|chasm|collapse|sink/.test(k)) return { sink: 1, tint: "#1a1712" };
  return { sink: 0, tint: p.scorch };
}

/* zone key "band:lane" -> {bandIdx, laneIdx} against a given grid's own band/lane order. Returns null
   for a zone key that isn't actually in this grid (defensive — a stale elevZone/hazardZone entry from
   a since-shrunk room never crashes the derivation, it's just skipped). */
function theaterZoneIndex(grid, zoneKey){
  if(!grid || !zoneKey) return null;
  const parts = String(zoneKey).split(":");
  if(parts.length !== 2) return null;
  const bandIdx = (grid.bands || []).indexOf(parts[0]);
  const laneIdx = (grid.lanes || []).indexOf(parts[1]);
  if(bandIdx < 0 || laneIdx < 0) return null;
  return { bandIdx, laneIdx };
}

/* MODEL-GRAMMAR G4 (docs/MODEL-GRAMMAR.md §4's own "walk-feature props derive the same way" line;
   dev/model-coverage-report.md class-(b)+(c) prop lines) — walk-feature/hazard TEXT -> a PROP PART
   RECIPE, so a rolled room's feature/hazard nouns render as the actual noun (a cart, a shrine, a
   statue) instead of theater-boot.js's generic flat cover column. Pure keyword scan (curated list,
   NOT NLP, matching §4 rule 5's own "curated list, not NLP" discipline for creature names) over
   whatever free text a zone carries: `segment.feature.name`/`.flavor` (room-wide — dungeon-walk.js's/
   wild-walk.js's own `feature:{name,flavor}` shape is per-SEGMENT, not per-zone, so every zone in a
   room shares the same feature text), `scene.cover[zoneKey]` when it's a narrated string (not the
   bare `true` sentinel), and `hazardByZone[zoneKey].kind` (the hazard's own free-text kind).
   Precedence: first matching rule wins (ordered most-specific-noun first, matching gen-model-recipes.
   py's NAME_RULES convention) — a zone whose hazard kind names a specific prop noun (e.g. "a
   collapsed cart blocks the passage") gets that prop's recipe; a zone with no keyword hit at all
   falls through to `null`, and theaterBoardFrom's existing generic "kind:cover" prop stays exactly
   as it always has (§4b's own "never worse than today" discipline, reapplied to props). Class-(e)
   architecture-scale cases (docs/model-coverage-report.md's numbered list) get their own named cheap
   resolutions per that report — a bridge/portcullis/well/labyrinth entry maps to the SAME small prop
   cluster the report proposes rather than a bespoke model. Class-(d) atmospherics (mist, smells,
   sounds, temperature, ground stains, etc.) are INTENTIONALLY absent from this table — the report's
   own verdict is "tint/FX default, no geometry" for those, so a class-(d) keyword hit here would be a
   spec violation; anything not listed just falls through to the generic prop, which is correct for
   both "genuinely unknown" and "correctly atmosphere-only" text alike. */
const THEATER_PROP_KEYWORD_RULES = [
  // --- class (a)/(b): barrel/keg/cask family -> crate, round variant ---
  // \b word-boundaries on the short/ambiguous nouns (urn/jar/vat) — without them "urn" false-
  // -positives inside "overtURNed" and "vat" inside a longer word; longer distinctive nouns
  // (barrel/hogshead/cauldron/cistern-lip) don't need the guard but keep it for consistency.
  [/\bbarrel\b|\bkeg\b|\bcask\b|\bhogshead\b|\burn\b|\bjar\b|\bvat\b|\bcauldron\b|\bcistern-lip\b/i,
    { part: "crate", params: { round: true } }],
  // \b guards on sack/bag — bare "sack" false-positives inside "ransack"/"ransacked".
  [/\bsack\b|\bbag\b|sandbag|spilled-sacks/i, { part: "crate", params: { soft: true, scale: 0.6 } }],
  // --- class (c): statue/idol/monument — checked BEFORE the generic pillar/obelisk rule below so a
  //     "statue" hit never gets swallowed by the broader standing-stone family. ---
  [/statue|idol|monument|colossus|effigy/i, { part: "statue-figure", params: { pose: "standing" } }],
  // --- class (c): table/bench/counter/workbench. \btable\b is REQUIRED (not just stylistic) — bare
  //     "table" false-positives inside "constable"/"vegetable"/"unstable". ---
  [/\btable\b|\bbench\b|\bcounter\b|workbench|trestle|anvil-block|grindstone/i, { part: "table-slab", params: {} }],
  // --- class (c): throne (checked before table-slab's own broader family so a throne reads distinct) ---
  [/throne|pillory|stocks\b/i, { part: "throne-seat", params: {} }],
  // --- class (c): chain/manacle/shackle. \bchain\b avoids swallowing "chainmail" via the different
  //     negative-lookahead this rule used to rely on — a plain boundary is simpler and equally correct
  //     since "chainmail" has no space/hyphen before "mail" to separate at anyway. ---
  [/\bchain(?:s)?\b|manacle|shackle|portcullis-chain/i, { part: "chain-drape", params: {} }],
  // --- class (c): cage (hanging or floor) — gibbet is BOTH a cage AND a chain read; cage-frame wins
  //     since it's the more specific/recognizable silhouette (the report's own "pairs with chain-
  //     drape for gibbets" note — one prop entry still reads as "a gibbet" at this budget). ---
  [/\bcage\b|gibbet|birdcage/i, { part: "cage-frame", params: { cheap: true } }],
  // --- class (b): standing stone / obelisk / pillar (intact unless the text also says broken/toppled) ---
  [/obelisk|standing.?stone|menhir|monolith|\bcolumn\b|\bpillar\b|support.?pillar|totem.?pole/i,
    (text) => ({ part: "pillar-broken", params: { intact: !/broken|crumbl|shatter|toppl/i.test(text) } })],
  // P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §4 Unit A step 7): RETARGETED off its old
  // `pillar-broken {scale:0.3,taper:true}` stand-in (a scaled-down broken-pillar approximation, from
  // before any bespoke lighting-prop model existed) to its own distinct `part` string, "candelabra" —
  // now that a real candelabra builder exists (dev/model-qa/creatures/prop-light.js's buildCandelabra,
  // registered in src/ui/theater-figures.js as "prop:candelabra"), this rule's own text (candelabra/
  // brazier-stand/torch-sconce) should render as an actual candelabra, not a scaled pillar silhouette
  // — and needs a part string DISTINCT from the standing-stone rule above (which also emits
  // "pillar-broken", disambiguated there by its own `intact` param — a genuinely different semantic
  // this rule must not collide with). No `scale`/`taper` params needed now: the whole-object model
  // bakes its own correct size. A theater-boot.js build with no whole-object registry entry for
  // "prop:candelabra" (the gate off, or the registry not yet extended) falls through to the generic
  // flat prop-box (§9 Decision 6's "never worse than today," reapplied — setBoard's own fallback path
  // for an unresolved `part` string is untouched).
  [/candelabra|brazier.?stand|torch.?sconce/i, { part: "candelabra", params: {} }],
  // --- class (c): fountain/basin/font/cistern (large-scale only — small decorative basins stay on
  //     shrine-block per the audit's class-(b) mapping, checked further down) ---
  [/fountain|cistern|\btrough\b|\bfont\b|magical font/i, { part: "basin-block", params: {} }],
  // --- class (c): web / webbing mass ---
  // \bweb\b (not a bare "web" prefix-match) — "cobweb"/"webbed" false-positive otherwise. "webbing"/
  // "web-canopy" are still explicit alternatives since \bweb\b alone wouldn't catch those compounds.
  [/\bweb\b|webbing|web-canopy|cocoon|egg-sac/i, { part: "web-mass", params: {} }],
  // --- ENV WAVE D (docs/ENV-WAVES.md): portcullis-gate — the bare IRON GATE (rusted/wedged/bent/warped),
  //     distinct from the full masonry archway. No separate "gate" part exists, so it resolves to the same
  //     arch-frame family the archway uses; its P1' geometry-source swap is the dedicated
  //     dev/model-qa/creatures/prop-portcullis.js (the bare-grille read that "pairs with the built
  //     archway"). Placed ABOVE the generic archway rule so the portcullis spellings are explicit and
  //     carry their own damage-state text, even though both currently return arch-frame. ---
  [/iron portcullis|portcullis.?gate|rusted portcullis|wedged portcullis|\bportcullis\b/i,
    { part: "arch-frame", params: {} }],
  // --- class (c): archway/gate (portcullis pairs arch-frame + chain-drape per the report; the single
  //     prop entry this function returns picks arch-frame — the chain read comes from the "chain"
  //     rule above firing separately if the text ALSO names chains) ---
  [/archway|\barch\b|portcullis|triumphal arch|rock arch|freestanding door.?frame/i,
    { part: "arch-frame", params: {} }],
  // --- class (c): sarcophagus/coffin/bier ---
  [/sarcophagus|coffin|stone bier/i, { part: "coffin-slab", params: {} }],
  // --- class (c): vine/bramble/briar/thorn tangle ---
  [/bramble|briar|razorvine|thorny|hanging vines?|tangled roots?/i, { part: "vine-tangle", params: {} }],
  // --- class (c): mushroom/fungal colony ---
  [/mushroom|fungal bloom|puffball|glowing fungus|fungus colony/i, { part: "mushroom-cluster", params: {} }],
  // --- class (c): well / deep shaft (a RAISED/deep grate reads as this; a flush grate is class (d),
  //     handled by falling through to no match at all) ---
  [/\bwell\b|sinkhole|mine shaft|deep drain/i, { part: "well-shaft", params: {} }],
  // --- ENV WAVE D (docs/ENV-WAVES.md): bone-wall — undead architecture, a wall of skulls + long-bone
  //     lattice. No dedicated "wall" part exists; the honest closest existing family is rubble-scatter's
  //     BONE channel (the P1' geometry-source swap is dev/model-qa/creatures/prop-bonewall.js). Placed
  //     ABOVE the scree/gravel rule below because "bone-wall ... screen" would otherwise stale-match
  //     `scree` inside the word "screen" and lose the bone channel — this rule must win. ---
  [/bone.?wall|skull.?mortared|bone.?lattice|ossuary wall/i, { part: "rubble-scatter", params: { channel: "bone", scale: 0.9 } }],
  // --- class (b): grate/drain (raised/broken variant only) -> rubble-scatter, flat footprint ---
  //     ENV WAVE D: the "raised drainage-grate" (open shaft + iron bars) is one of this wave's pieces;
  //     its P1' geometry-source swap is dev/model-qa/creatures/prop-grate.js. The mapping is unchanged
  //     (rubble-scatter flat) — the bespoke swap upgrades the read at the same part name. ---
  [/grate|drain.?cover|sewer.?grate/i, { part: "rubble-scatter", params: { flat: true, scale: 0.4 } }],
  [/scree|gravel.?patch|loose.?stone|caltrops.?field/i, { part: "rubble-scatter", params: { scale: 0.5 } }],
  [/bone.?pile|skull.?pyramid|calcified.?bones/i, { part: "rubble-scatter", params: { channel: "bone" } }],
  // --- class (c): ladder/scaffolding ---
  [/ladder|scaffolding|siege-tower ladder/i, { part: "ladder-rungs", params: {} }],
  // --- class (c): furnace/forge/kiln ---
  [/furnace|\bforge\b|\bkiln\b|glassblower/i, { part: "furnace-block", params: {} }],
  // --- class (c): gears/clockwork/winch ---
  [/\bgears?\b|clockwork|winch drum|eldritch machinery/i, { part: "gear-cluster", params: {} }],
  // --- class (c): tent/pavilion/canopy/lean-to ---
  [/pavilion|lean-to|hunting blind|tent canopy|silk pavilion/i, { part: "tent-canopy", params: {} }],
  // --- class (c): bell/gong ---
  [/\bbell\b|\bgong\b|alarm bell/i, { part: "bell-mass", params: {} }],
  // --- class (b): banner/signpost/notice-board family ---
  [/signpost|notice.?board|hitching.?post|warning.?post|weathervane|standing sundial/i,
    { part: "banner-pole", params: {} }],
  [/tapestry|curtain|beaded.?curtain|hanging hides|silk.?pavilion.*wall/i,
    { part: "banner-pole", params: { wide: true, drape: true } }],
  // --- class (a)/(b): shrine/offering/dais/plinth/altar family (also covers small decorative
  //     basins) — "shrine" itself is included even though class (a) already names shrine-block as
  //     covered, same reasoning as the cart rule above: a narrated feature string naming a shrine in
  //     passing still needs an actual keyword hit to resolve, not just an existing-part footnote. ---
  [/\bshrine\b|offering.?table|sacrificial.?stone|\bdais\b|\bplinth\b|pedestal|\baltar\b/i,
    { part: "shrine-block", params: {} }],
  [/\bbathtub\b|\bcradle\b|small basin|decorative basin/i, { part: "shrine-block", params: { scale: 0.6 } }],
  // --- class (a)/(b): cart/wagon/carriage family (params only — reuses the existing `cart` part;
  //     "cart" itself is included here even though class (a) already covers it — a DM/table-rolled
  //     feature string naming a cart in passing, e.g. "a collapsed cart," still needs a keyword hit
  //     to carry its damage-state text into cart's own tilt/covered params, not just resolve the bare
  //     part with defaults) ---
  [/\bcart\b|\bwagon\b|carriage|palanquin|sedan.?chair|handcart|wheelbarrow|small siege.?engine/i,
    (text) => ({ part: "cart", params: { covered: /covered/i.test(text), tilt: /overturned|broken|collapsed|shattered/i.test(text) ? 25 : 0 } })],
  // --- class (b): dead/bare tree family ---
  [/gibbet.?tree|hollow log|fossilized tree|petrified tree|deadfall log/i,
    (text) => ({ part: "tree-bare", params: { channel: /stone|glass|ice/i.test(text) ? "crystal" : "skin" } })],
  // --- class (e)#7: portcullis/iron gate mechanism (checked after the plain archway rule above so a
  //     text naming BOTH "gate" and "chain" still resolves to the arch — this entry only fires for a
  //     bare "iron gate" with no arch/archway word, a narrower net than the arch rule) ---
  [/iron gate/i, { part: "arch-frame", params: {} }],
  // --- class (e)#3: multi-statue gardens / colossal ruin fragments — one oversized statue-figure
  //     instance stands in for the cluster (report: "spawn 2-4 statue-figure instances at oversized
  //     scale... cheap and reuses class (c) part #1"); this function returns ONE prop entry per zone,
  //     so "oversized scale" is the cheap single-entry approximation of that cluster. ---
  [/statuary garden|giant hand|giant skull|giant ribcage|colossal ruin/i,
    { part: "statue-figure", params: { pose: "broken", scale: 1.8 } }],
  // --- class (e)#4: wrecked ship/airship/siege engine hulks -> cart at max scale (report's own
  //     resolution; the rubble-scatter debris field the report also names is a SEPARATE prop entry a
  //     caller can add at the same zone if it wants both — this function only ever returns one). ---
  [/wrecked ship|airship wreck|shipwreck|siege engine hulk/i,
    { part: "cart", params: { scale: 1.6 } }],
  // --- class (e)#1: bridges (collapsed/rope/stone span/natural arch over a gap) -> a pillar-broken
  //     anchor-point read (the report's own resolution: "a pillar-broken pair at the two anchor
  //     points... if a visual is wanted at all" — the mechanical terrain_change traversal check is
  //     what actually matters; this is just the optional visual half). ---
  [/collapsed bridge|rope bridge|stone span|natural arch.*gap/i,
    { part: "pillar-broken", params: { intact: false } }],
  // class (e)#2/#5/#6/#8/#9 (whole-room set pieces, maze/labyrinth segments, buildings-within-the-
  // walk, weather-scale phenomena, mundane-furniture Strange-band curiosities) are DELIBERATELY not
  // listed: the report's own resolution for each is "not a prop at all" (env-FX overlay, a
  // terrain_change map-layout flag, out of MODEL-GRAMMAR's scope entirely, or "route through the
  // EXISTING furniture-adjacent parts at normal scale" — which the table-slab/shrine-block/crate
  // rules above already cover without a bespoke entry).

  // --- DRESSING-WIRING.md §"Behavior" 3: the dungeon/urban/wilderness Set Dressing tables' nouns
  //     with NO keyword-rule match, mapped onto EXISTING parts only (no new prop models — that's the
  //     env waves' job). Appended at the END of the array (never reordered/edited above) so nothing
  //     already matching an earlier rule can be shadowed. Plural/compound forms the dressing corpus
  //     actually uses (crates/sacks, not just the singular already covered above) get their own
  //     word-boundary-guarded alternation rather than loosening the existing barrel/sack rule, which
  //     stays byte-identical for every other table that already depends on its exact behavior. ---
  // crate(s)/box(es) stack — the existing barrel/sack rule doesn't cover the bare word "crate" or
  // plural "crates"/"sacks" (its \bsack\b guard doesn't span the trailing "s").
  [/\bcrates?\b|\bsacks\b/i, { part: "crate", params: {} }],
  // plank/board bridging a gap — reads as the same flat-surface silhouette as table-slab.
  [/wooden plank|\bplank\b.*(?:gap|dip|bridge)|floorboard|loose board/i, { part: "table-slab", params: {} }],
  // cookpot/pot/kettle left over a fire or on the ground — small vessel, same family as the barrel/
  // urn rule but for the bare "pot"/"cookpot"/"kettle" nouns the existing \bvat\b/\burn\b list misses.
  [/\bcookpot\b|\bkettle\b|iron pot\b|rusty pot\b/i, { part: "crate", params: { round: true, scale: 0.5 } }],
  // lantern (hand-carried or hung, not a wall sconce/torch — those are class-(d) light-only per the
  // report) — reads as a small pillar-adjacent silhouette, the cheapest existing read for a hung light.
  [/\blantern\b/i, { part: "pillar-broken", params: { scale: 0.25, taper: true, intact: true } }],
  // skull(s)/bones arranged as dressing (not the already-covered bone-pile/skull-pyramid CLUSTER
  // phrasing above) — same rubble-scatter bone channel, singular/small-group case.
  [/\bskulls?\b|\bbones\b|ribcage/i, { part: "rubble-scatter", params: { channel: "bone", scale: 0.4 } }],
  // banner/pennant hanging or planted (distinct from the tapestry/curtain WIDE-drape rule above —
  // a bare banner reads as the narrower pole-mounted silhouette).
  [/\bbanner\b|\bpennant\b/i, { part: "banner-pole", params: {} }],
  // mirror (hand or wall mirror, shard or whole) — flat reflective slab, same family as table-slab.
  [/\bmirror\b/i, { part: "table-slab", params: { scale: 0.3 } }],
  // small stone basin/font/trough NOT already caught by the large-scale fountain/cistern rule above
  // (that rule requires fountain/cistern/trough/font keywords too, but "stone basin" alone falls
  // through when none of those exact words appear) — same basin-block part, smaller scale.
  [/\bbasin\b/i, { part: "basin-block", params: { scale: 0.6 } }],
  // chest/coffer/trunk (storage furniture, distinct from the coffin/sarcophagus slab rule above).
  [/\bchest\b|\bcoffer\b|\btrunk\b/i, { part: "crate", params: { scale: 0.7 } }],
  // anchor (ship's anchor, half-buried) — reads as the same broken-pillar silhouette used for bridge
  // anchor-points above.
  [/\banchor\b/i, { part: "pillar-broken", params: { intact: false, scale: 0.8 } }],

  // --- ENV WAVE D (docs/ENV-WAVES.md §Wave D) — the remaining dungeon-feature nouns whose keyword
  //     entry is "part of the piece." Appended at the END so nothing already matching an earlier rule
  //     is shadowed (bone-wall + portcullis are placed higher up, ABOVE their stale matches, per their
  //     own comments). Each maps onto an EXISTING part family (no new PARTS keys — verify-model-parts's
  //     61-part inventory stays exact); the bespoke whole-object module named in each comment is that
  //     part's P1' geometry-source swap. Nouns whose CURRENT rule already resolves correctly
  //     (sarcophagus->coffin-slab, hanging-cage->cage-frame, wall-manacles->chain-drape,
  //     gear-cluster->gear-cluster, inscribed-obelisk->pillar-broken, drainage-grate->rubble-scatter)
  //     are documented at those existing rules above and need no duplicate here. ---
  // refuse-pile / crumbled-masonry — a heaped mound of broken masonry + dungeon rot. Reads as the same
  // rubble-scatter family; the bespoke read (dev/model-qa/creatures/prop-refuse.js) upgrades it at P1'.
  // Currently fell through to null (generic cover) — this gives it the right rubble family.
  [/refuse.?pile|crumbled.?masonry|rubble.?heap|debris.?pile|midden/i, { part: "rubble-scatter", params: { scale: 0.9 } }],
  // stagnant-pool — a still basin of fouled water. Nearest existing family is basin-block (a water
  // basin); the bespoke disc+rim read is dev/model-qa/creatures/prop-pool.js (QA-gated: it read as a
  // POOL, not a rug, at the game camera — kept as geometry, not demoted to env-FX). Was null before.
  [/stagnant.?pool|fouled.?pool|algae.?pool|still.?water|scum.?pond/i, { part: "basin-block", params: {} }],
];

/* text (any free-text blob — feature name+flavor, a cover tag, a hazard kind) -> a prop part
   recipe {part, params} or null (no keyword hit -> caller keeps its existing generic-cover
   fallback). First rule to match wins (ordered most-specific-noun-first above); a rule's second
   tuple slot is either a plain {part,params} object or a `(text) => {part,params}` function for the
   handful of rules whose params depend on which synonym/qualifier actually matched (intact vs.
   broken, covered vs. open, stone vs. mundane). Never throws on empty/non-string text. */
function theaterPropForText(text){
  const t = String(text || "");
  if(!t) return null;
  for(let i = 0; i < THEATER_PROP_KEYWORD_RULES.length; i++){
    const rx = THEATER_PROP_KEYWORD_RULES[i][0];
    if(rx.test(t)){
      const spec = THEATER_PROP_KEYWORD_RULES[i][1];
      return typeof spec === "function" ? spec(t) : spec;
    }
  }
  return null;
}

/* REALM-PROPS-WIRING.md §2 — the realm-filtered prop select: text -> a matching REALM_PROPS entry
   (or null on no hit), keyed off `realms` (the SAME activeRealmsFor(skin,w) value threaded through
   opts.realms elsewhere in this file — theaterFloorSurfaceInfo's own realm seam). Unlike
   theaterRealmSurfacePick (which always resolves SOMETHING via a seeded fallback pick — every room
   needs a floor), this function is keyword-match-ONLY: a segment whose feature/cover/hazard text
   doesn't name any of its realm's own props returns null and the caller falls through to the
   existing generic THEATER_PROP_KEYWORD_RULES scan (§2's "no match -> the existing generic rules"),
   never forcing an unrelated realm prop onto a zone with no textual reason to have one. Word-scan
   discipline mirrors theaterRealmSurfacePick: each candidate prop's own significant words (name +
   summary, filtered to length>3) are checked against the lowercased text pool; first prop in
   realmPropsFor's own return order to match wins (that order is realm-list-then-crossRealm-all per
   the generator's realmPropsFor, a stable but not content-graded order — ties are rare since most
   prop names are distinct nouns). Returns null (not just a falsy part) on an empty/absent `realms`,
   an unloaded REALM_PROPS, or no textual match — never throws. */
function theaterRealmPropForText(text, realms){
  if(typeof realmPropsFor !== "function") return null;
  const pool = realmPropsFor(realms);
  if(!pool.length) return null;
  const t = String(text || "").toLowerCase();
  if(!t) return null;
  for(let i = 0; i < pool.length; i++){
    const p = pool[i];
    const needle = (p.name + " " + p.summary).toLowerCase();
    const words = needle.split(/[^a-z0-9]+/).filter(w => w.length > 3);
    if(words.some(w => t.includes(w))) return p;
  }
  return null;
}

/* the room-wide feature text pool: segment.feature.name + segment.feature.flavor (dungeon-walk.js's/
   wild-walk.js's own `feature:{name,flavor}` shape — a room-wide field, not per-zone, so this is
   computed ONCE per theaterBoardFrom call and reused for every zone rather than re-derived per zone).
   DRESSING-WIRING.md §"Behavior" 2: segment.dressing.text (dungeon-walk.js's/wild-walk.js's/walk.js's
   own `dressing:{text,condition}` roll, same room-wide/not-per-zone shape as feature) joins the SAME
   pool — appended after feature text so a feature-text keyword hit still wins ties (theaterPropForText
   returns the FIRST rule match; feature is the richer/more room-defining roll, dressing is the smaller
   object/prop-level one, so feature keeps first-look priority when both name a prop-bearing noun). */
function theaterSegmentFeatureText(segment){
  const f = (segment && segment.feature) || null;
  const d = (segment && segment.dressing) || null;
  return [f && f.name, f && f.flavor, d && d.text].filter(Boolean).join(" ");
}

/* FLOOR-TEXTURES.md §2 — theaterFloorMaterial(segment, env): the floor a fight sits on reflects the
   rolled terrain. A DERIVED render fact (like tile.kind/tile.tint already are), NOT a new rolled
   canon table — no segment-builder edits, no compile pipeline, no walk-verifier risk (§4/§6 decision
   1). Returns one of the 12 §1 material keys via precedence: (1) keyword scan over whatever rolled
   free text this segment/env pool carries, (2) a wilderness biome map when no keyword hit, (3) a
   seeded env-default pick (dungeon/urban) when no keyword hit, (4) an absolute per-env fallback.
   Pure + total; never throws on a partial/missing segment. */

/* §2 rule 1's keyword table, ordered most-specific-first (first match wins) — same discipline as
   THEATER_PROP_KEYWORD_RULES/THEATER_LIGHT_KEYWORD_RULES above in this file. */
const THEATER_FLOOR_KEYWORD_RULES = [
  // net-new realm-surface bases FIRST (specific words that would otherwise be caught by a generic
  // rule below, e.g. "wet asphalt" -> the mud rule's \bwet\b). First match wins.
  [/asphalt|blacktop|tarmac|crosswalk/i, "asphalt"],
  [/grat(e|es|ed|ing)|catwalk|walkway|perforated metal/i, "grating"],
  [/\bvoid\b|starfield|star-flecked|astral floor|cosmic floor|non-euclid/i, "void-floor"],
  [/rope|matting|netting|woven mat/i, "rope-matting"],
  [/candy|gumdrop|sugar|confection|licorice|frosting/i, "candy-tile"],
  [/flagstone|flagging|paved|paving|tiled floor|mosaic|tessell/i, "flagstone"],
  [/cobble/i, "cobble"],
  [/plank|\bboard\b|timber|wood floor/i, "plank"],
  [/\bsand\b|dune|salt flat|hardpan/i, "sand"],
  [/snow|\bice\b|frost|frozen|glaci/i, "snow-ice"],
  [/\bmud\b|\bbog\b|marsh|mire|silt|\bwet\b/i, "mud"],
  [/moss|turf|grass|reed|ivy/i, "grass"],
  [/leaf|needle|petal|loam|litter/i, "leaf-litter"],
  [/slate|shale|scree|pebble|shell|gravel|rubble|coral/i, "scree"],
  [/\bash\b|dust|soot|cinder/i, "ash"],
  [/bedrock|cavern|\bcave\b|rough stone|raw stone/i, "cave-rock"],
  [/dirt|clay|earth|packed/i, "cracked-earth"]
];

/* §2 rule 2 — wilderness biome -> default material when no keyword hit. */
const THEATER_FLOOR_BIOME_MAP = {
  Grassland: "grass", Forest: "leaf-litter", Jungle: "leaf-litter",
  Desert: "sand", Coastal: "sand", Arctic: "snow-ice",
  Mountain: "scree", Hill: "cracked-earth", Swamp: "mud", Underdark: "cave-rock"
};

/* §2 rule 3 — seeded env-default pools (dungeon/urban only; wilderness/breach never reach this rule,
   see theaterFloorMaterial below) so two rooms in the same env still differ instead of every unmarked
   room reading identically. Seeded off segment.id via the file's existing local string-hash idiom
   (theaterLightSeedHash) — same "small local copy, not a forward dependency" discipline as that
   function's own header comment. */
const THEATER_FLOOR_ENV_POOL = {
  dungeon: ["flagstone", "flagstone", "cobble", "cracked-earth", "cave-rock", "ash"],
  urban: ["cobble", "cobble", "flagstone", "cracked-earth", "plank"]
};

/* §2 rule 4 — absolute fallback per env, used when even the seeded pool has nothing (unknown env). */
const THEATER_FLOOR_ENV_FALLBACK = {
  dungeon: "flagstone", urban: "cobble", wilderness: "cracked-earth", breach: "cave-rock"
};

/* REALM-SURFACES-WIRING.md §3 — the select seam. env -> which `where` bucket of a realm's surface
   list applies: dungeon/urban are "interior spaces, mostly" (a breach room reads as an indoor set),
   wilderness/breach are "exterior/open" — matches the spec's own "interior for dungeon/urban
   interiors, exterior for wilderness/open" line. `any`-tagged surfaces are eligible everywhere
   (folded into both buckets below, never excluded either way). */
const THEATER_FLOOR_REALM_WHERE_FOR_ENV = { dungeon: "interior", urban: "interior", wilderness: "exterior", breach: "exterior" };

/* tint helper (§3 decision 2 — "one color funnel for surfaces now + render-grade later"): a tiny pure
   function so REALM-RENDER-STYLE's future gradeColor can share this exact seam rather than each
   inventing its own hex math. theater-data.js is the GL-free pure layer (theater-boot.js's ES-module
   boundary is one-way — it consumes this file's output, never the reverse), so this can't reach into
   theater-boot.js's FLOOR_MATERIAL_BASE table itself; it hands back the realm surface's own free-text
   tint description VERBATIM (the caller/GL layer decides how — or whether — to mix it into a hex).
   Today this is effectively a passthrough; kept as a real named function (not inlined) so
   REALM-RENDER-STYLE's future canvas-build hook has exactly one seam to extend once it lands. */
function theaterApplySurfaceTint(tintText){
  return tintText || null;
}

/* REALM-SURFACES-WIRING.md §3 — pick one of a realm's 8 surfaces for this segment: keyword match
   against the surface's own name/summary text first (first match, in table order, wins — same
   "keyword beats seeded default" precedence every other THEATER_*_KEYWORD_RULES table in this file
   uses), else a deterministic seeded pick from the `where`-filtered list. Returns null when
   REALM_SURFACES isn't loaded, the realm has no entry, or the where-filter empties the list (caller
   falls back to the normal 12/17-material path — never a dangling floor). */
function theaterRealmSurfacePick(realmId, whereBucket, seedKey, textPool){
  if(typeof REALM_SURFACES === "undefined") return null;
  const all = REALM_SURFACES[realmId];
  if(!all || !all.length) return null;
  const eligible = all.filter(s => s.where === whereBucket || s.where === "any");
  const pool = eligible.length ? eligible : all; // never over-narrow a realm's own 8 to empty
  if(!pool.length) return null;

  const text = String(textPool || "").toLowerCase();
  for(let i = 0; i < pool.length; i++){
    const s = pool[i];
    const needle = (s.name + " " + s.summary).toLowerCase();
    // reuse the surface's own significant words (name, minus filler) as the keyword scan — a surface
    // like "Saloon Boards" matches segment text naming "saloon" or "boards", same first-hit-wins
    // discipline as THEATER_FLOOR_KEYWORD_RULES above.
    const words = needle.split(/[^a-z0-9]+/).filter(w => w.length > 3);
    if(words.some(w => text.includes(w))) return s;
  }
  const h = theaterLightSeedHash(seedKey) % pool.length;
  return pool[h];
}

/* the §2 rule1/free-text pool shared by theaterFloorMaterial + theaterFloorSurfaceInfo (split out so
   both derivations scan the identical text — a realm-surface keyword match and the generic-material
   keyword match must never disagree about what a segment's text says). */
function theaterFloorTextPool(seg){
  const footing = seg.footing;
  const footingText = (footing && typeof footing === "object") ? footing.text : footing;
  const dressingText = (seg.dressing && typeof seg.dressing === "object") ? seg.dressing.text : "";
  return [
    footingText, seg.biomeDesc,
    seg.areaType, seg.scene, seg.sensory, theaterSegmentFeatureText(seg),
    seg.description, dressingText
  ].filter(Boolean).join(" ");
}

/* REALM-SURFACES-WIRING.md §3 — the richer sibling of theaterFloorMaterial: same precedence, but
   returns the FULL pick {material, tint, surfaceName} rather than a bare material key, for callers
   that want the realm surface's own name/tint (the render board's floor + the walk digest's dressing
   line, both consumers named in §3). `surfaceName`/`tint` are null when opts.realms is empty/absent
   or the realm-surface layer isn't loaded — a plain generic-material pick carries no surface name
   (nothing DM-narratable beyond what theaterFloorMaterial already returns). Never throws. */
function theaterFloorSurfaceInfo(segment, env, opts){
  const seg = segment || {};
  opts = opts || {};
  const pool = theaterFloorTextPool(seg);

  if(Array.isArray(opts.realms) && opts.realms.length){
    const seedKey = (seg.id || seg.num || "") + ":floor";
    // U2 (REVIEW-FIXES-0705.md T2): opts.boardRealm is theaterBoardFrom's ONE seeded per-room realm
    // pick, threaded in so the floor surface and the render grade always agree on which realm a mixed
    // room is "in" (the bug: floor picked its own realm by seeded hash while the grade used realms[0]).
    // Falls back to this function's own seeded pick when no boardRealm is passed (a caller that hits
    // this function directly — e.g. a narrow test harness — keeps its exact pre-unit behavior).
    const primaryRealm = opts.boardRealm || opts.realms[theaterLightSeedHash(seedKey + ":realm") % opts.realms.length];
    const whereBucket = THEATER_FLOOR_REALM_WHERE_FOR_ENV[env] || "interior";
    const picked = theaterRealmSurfacePick(primaryRealm, whereBucket, seedKey, pool);
    if(picked){
      return { material: picked.base, tint: theaterApplySurfaceTint(picked.tint), surfaceName: picked.name };
    }
  }
  return { material: theaterFloorMaterial(seg, env), tint: null, surfaceName: null };
}

function theaterFloorMaterial(segment, env){
  const seg = segment || {};
  // §2 rule 1's pooled free text, per env — wilderness draws on footing/biomeDesc, dungeon on
  // areaType/scene/sensory/feature-text, urban on description/dressing.text. `segment.footing` is a
  // plain rolled string in this codebase (wild-walk.js's walkPick) but the spec also names a possible
  // `.text` sub-field defensively — both are folded in so neither shape is missed.
  const pool = theaterFloorTextPool(seg);

  for(let i = 0; i < THEATER_FLOOR_KEYWORD_RULES.length; i++){
    if(THEATER_FLOOR_KEYWORD_RULES[i][0].test(pool)) return THEATER_FLOOR_KEYWORD_RULES[i][1];
  }

  if(env === "wilderness"){
    const biomeHit = THEATER_FLOOR_BIOME_MAP[seg.biome];
    if(biomeHit) return biomeHit;
  } else {
    const pickPool = THEATER_FLOOR_ENV_POOL[env];
    if(pickPool && pickPool.length){
      const seedKey = (seg.id || seg.num || "") + ":floor";
      const h = theaterLightSeedHash(seedKey) % pickPool.length;
      return pickPool[h];
    }
  }

  return THEATER_FLOOR_ENV_FALLBACK[env] || THEATER_FLOOR_ENV_FALLBACK[THEATER_DEFAULT_ENV];
}

/* TABLETOP-UNITS.md §U1 — the render-profile stamping shared by theaterBoardBuild (a real room) and
   theaterIdleBoardFrom (the empty standing table): resolves boardRealm's sat/tint/tintAmt/contrast
   via realmRenderProfile and re-stamps `tint` as the GL-ready NUMBER theater-boot.js's gradeColorLocal
   needs (a string "#rrggbb" tint silently coerced to grey there — REALM-RENDER-STYLE.md §3/§4's own
   "stamp > sync-by-convention" fix, T1). Factored out of theaterBoardFrom's body verbatim (byte-
   identical for every existing caller) so the idle table agrees with a real room on how a resolved
   realm becomes a render grade, instead of duplicating the coercion in two places. */
function theaterStampRenderProfile(boardRealm){
  const rawRenderProfile = (typeof realmRenderProfile === "function")
    ? realmRenderProfile(boardRealm ? [boardRealm] : [])
    : null;
  return rawRenderProfile ? {
    sat: rawRenderProfile.sat,
    tint: (typeof rawRenderProfile.tint === "number")
      ? rawRenderProfile.tint
      : (typeof rawRenderProfile.tint === "string" && rawRenderProfile.tint
        ? parseInt(rawRenderProfile.tint.replace("#", ""), 16)
        : null),
    tintAmt: rawRenderProfile.tintAmt,
    contrast: rawRenderProfile.contrast
  } : null;
}

/* TABLETOP-UNITS.md §U1 — the empty standing table: no rolled room, so tiles/props stay EMPTY
   (TABLETOP-VISION.md §1 "empty table under realm light when nothing is staged") — everything else
   (the render grade, the grid shape) reuses the exact same helpers a real room does, so the idle
   table and a walked room always agree on how a realm's light/grade resolve. `realms` (an array of
   active realm ids, or empty/absent) is a pure INPUT here — there is no room id to seed a pick
   against, so `realms[0]` (deterministic, not Math.random) is the ONE resolved realm; the same
   realms list always yields the same idle board (§9.1 purity). `light` still rolls through
   theaterRollLight (a fixed "idle:<env>" seed key — there's no segment to carry a stamped light, so
   this is the graceful seeded-fallback path every real room's light derivation already has). Never
   throws on a missing/empty env or realms (theaterPaletteFor/theaterRollLight are both total). */
function theaterIdleBoardFrom(env, realms){
  env = env || THEATER_DEFAULT_ENV;
  const realmList = Array.isArray(realms) ? realms : [];
  const boardRealm = realmList.length ? realmList[0] : null;
  const renderProfile = theaterStampRenderProfile(boardRealm);
  const grid = (typeof cmZoneGrid === "function")
    ? cmZoneGrid(undefined)
    : { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"], bandCount: 4, laneCount: 3 };
  const light = theaterRollLight(env, "idle:" + env, "");
  return {
    tiles: [], props: [], env, light, floorMaterial: null,
    surfaceName: null, surfaceTint: null,
    realms: realmList.length ? realmList : undefined,
    realmId: boardRealm,
    renderProfile: renderProfile,
    grid: { bands: grid.bands, lanes: grid.lanes, bandCount: grid.bandCount, laneCount: grid.laneCount }
  };
}

/* TABLETOP-UNITS.md §U1 — trayFrom(source, scene, opts): the Standing Table generalization of
   theaterBoardFrom. source.kind selects the origin:
     {kind:"segment", segment}  — an active walk's here-segment (all three envs) — routes through
                                  the SAME room derivation theaterBoardFrom has always used.
     {kind:"interior", record}  — a minted interior codex record — read the identical defensive way a
                                  partial/narrow-harness segment already is (an absent dims/feature/
                                  dressing/light falls through theaterBoardBuild's own total-function
                                  defaults, never a throw); no render.js caller wires this kind yet
                                  (a later unit's job) but the shape contract holds today.
     {kind:"idle", env, realms} — the empty table (theaterIdleBoardFrom).
   Same return shape in every branch (below, unchanged) — this is the ONE seam TABLETOP-VISION's
   tray/idle/combat callers all read through. Pure: the same (source,scene,opts) snapshot always
   yields an identical board (§9.1). */
function trayFrom(source, scene, opts){
  source = source || {};
  opts = opts || {};
  if(source.kind === "idle"){
    const env = source.env || opts.env;
    const realms = source.realms || opts.realms;
    return theaterIdleBoardFrom(env, realms);
  }
  const segment = source.kind === "interior" ? source.record : source.segment;
  return theaterBoardBuild(segment, scene, opts);
}

/* theaterBoardFrom is now a ONE-LINE WRAPPER over trayFrom — every existing combat caller
   (theaterStageSync in src/world/render.js, dev/verify-battle-stage.mjs's stub harness, etc.) keeps
   calling this exact name/signature and gets a board BYTE-IDENTICAL to before this unit (the combat
   byte-gate, dev/verify-tabletop-u1.mjs check 1 against dev/fixtures/tabletop-u1-board.json, proves
   it — trayFrom's "segment" branch below calls theaterBoardBuild with these exact same arguments). */
function theaterBoardFrom(segment, scene, opts){
  return trayFrom({ kind: "segment", segment: segment }, scene, opts);
}

/* §1 THE BOARD: segment (rolled room, carries .dims) + scene ({elevZones,hazards,hazardZones,cover,
   zoneCover,exits}) + opts ({env}) -> {tiles:[{x,z,h,kind,tint,altTop,zone}], grid:{bands,lanes,
   bandCount,laneCount}, props:[...], env}. Reuses cmZoneGrid (engine.combat, same file loads earlier
   in manifest) for the grid derivation — never re-implements the dims parse. Absent cmZoneGrid
   (module not loaded, e.g. a narrow test harness) degrades to the same full-4x3 default cmZoneGrid
   itself falls back to, so this function never throws on a partial load.
   T1.5: opts.env (default THEATER_DEFAULT_ENV, "dungeon") selects the palette (theaterPaletteFor) —
   every tint below now reads off that palette instead of a hardcoded literal. Each tile also carries
   `altTop` (bool): a checkerboard flag ((tileX+tileZ) parity, computed in WORLD tile coordinates so
   the pattern is continuous across zone boundaries, not just within one zone's 3x3 patch) the GL
   layer uses to alternate between the palette's `top`/`altTop` colors on plain floor tiles — §1 rule
   2's "stronger top-face checker alternation... the FFT reference's legibility trick". Hazard/
   elevated/water tiles keep their own single tint (the checker only applies to plain floor, so a
   hazard patch still reads as one solid warning color, not diluted by alternation).
   TABLETOP-UNITS.md §U1: renamed from theaterBoardFrom (now a wrapper over trayFrom, above) — body
   UNCHANGED, so every combat caller sees a byte-identical board. */
function theaterBoardBuild(segment, scene, opts){
  scene = scene || {};
  opts = opts || {};
  const env = opts.env || THEATER_DEFAULT_ENV;
  const palette = theaterPaletteFor(env);
  // U2 (REVIEW-FIXES-0705.md T2): resolve the room's realm ONCE — the SAME seeded pick
  // theaterFloorSurfaceInfo used to make independently (opts.realms[hash(seedKey+":realm") %
  // realms.length]) — so the floor surface AND the render grade agree on which realm a multi-realm
  // room is "in". `boardRealm` is null when opts.realms is empty/absent (no realm active).
  const boardRealmSeedKey = (segment && (segment.id || segment.num) || "") + ":floor";
  const boardRealm = (Array.isArray(opts.realms) && opts.realms.length)
    ? opts.realms[theaterLightSeedHash(boardRealmSeedKey + ":realm") % opts.realms.length]
    : null;
  // REALM-RENDER-STYLE.md §3/§4: realmRenderProfile resolves the ONE shared render profile
  // (sat/tint/tintAmt/contrast) for boardRealm (NOT realms[0] — that was T2's bug: a mixed room's
  // floor and grade could disagree). Absent boardRealm (or data/realms.js not loaded, e.g. a narrow
  // test harness) -> realmRenderProfile's own total-function fallback (REALM_RENDER_DEFAULT:
  // sat1/tintAmt0/contrast1) — every gradeColor call below then resolves to its input unchanged, so a
  // non-realm room's tile tints are BYTE-IDENTICAL to before this unit (the regression law §4 names
  // for "no realms").
  // Stamp a GL-ready profile: the tint travels as a STRING in data/realms.js's REALMS table
  // ("#c88a3c") but the GL layer's gradeColorLocal (src/ui/theater-boot.js) needs a NUMBER — the
  // mirror's own hexToRGB silently coerced any non-number tint to grey (0x808080), which is exactly
  // how the lava-red bright-kingdom incident happened (T1). Convert ONCE (theaterStampRenderProfile,
  // above — TABLETOP-UNITS.md §U1 factored this out so the idle table agrees byte-for-byte) so every
  // consumer (this file's own gradeColor calls below, and the GL layer via the stamped
  // board.renderProfile) reads the identical numeric shape. A tint that's already a number passes
  // through; a null/absent tint (REALM_RENDER_DEFAULT carries one, but a defensive guard costs
  // nothing) stays null.
  const renderProfile = theaterStampRenderProfile(boardRealm);
  // pure per-tint grade: gradeColor (data/realms.js) returns a numeric 0xrrggbb; re-stringified to
  // "#rrggbb" so every downstream consumer (theater-boot.js's colorFor/THREE.Color, the floor-canvas
  // cache key) keeps reading the exact "#rrggbb" string shape tile.tint has always carried — a purely
  // additive color-VALUE change, never a shape change. Cached per input hex (a handful of distinct
  // palette tints per room) so this loop never re-derives the same grade twice.
  const gradeCache = {};
  const gradeTint = (hex) => {
    if(typeof gradeColor !== "function" || !renderProfile) return hex;
    if(gradeCache[hex] !== undefined) return gradeCache[hex];
    const graded = gradeColor(hex, renderProfile);
    const out = "#" + graded.toString(16).padStart(6, "0");
    gradeCache[hex] = out;
    return out;
  };
  const grid = (typeof cmZoneGrid === "function")
    ? cmZoneGrid(segment && segment.dims)
    : { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"], bandCount: 4, laneCount: 3 };
  const bands = grid.bands || [];
  const lanes = grid.lanes || [];

  // elevZones: array of "band:lane" strings (cmZoneElev's own shape) -> the set of zones raised one step.
  const elevSet = {};
  (scene.elevZones || []).forEach(zk => { elevSet[zk] = true; });

  // hazardZones: [{zone:"band:lane", kind, revealed}]. Theater renders a hazard tint/sink regardless of
  // the player-visibility gate (cmHazardVisible) — the theater is the DM's/screen's board, not the
  // player-facing DOM (BATTLEMAP.md's "hidden from the player DOM" rule lives in render.js, untouched
  // by this file). Free-standing scene.hazards (a flat array, no zone attached) are folded in only when
  // an entry names/derives a zone key; unzoned hazard notes are skipped (nothing to place them at).
  const hazardByZone = {};
  (scene.hazardZones || []).forEach(hz => {
    if(!hz || !hz.zone) return;
    hazardByZone[hz.zone] = hz;
  });

  // cover sources: scene.zoneCover ({"band:lane":"half"|"three-quarters"|"full"}) is the mechanical
  // cover-level map (engine.combat's cmZoneCover reads it); scene.cover is the older/looser tag map
  // (render.js's combatPanel just lists its keys). Both are keyed by zone string when they carry one —
  // union them into one prop-zone set so a cover marker from either source gets a prop column, without
  // guessing at a cover LEVEL for scene.cover's looser keys (those just get a generic cover prop).
  const coverZones = {};
  Object.keys(scene.zoneCover || {}).forEach(zk => { coverZones[zk] = scene.zoneCover[zk]; });
  Object.keys(scene.cover || {}).forEach(zk => { if(!(zk in coverZones)) coverZones[zk] = true; });
  // scene.cover's own value carries the DM's narrated cover TEXT when it's a string (e.g. "an
  // overturned cart" rather than the bare `true` sentinel) — kept as a separate lookup (not folded
  // into coverZones above, which only ever wants a level/true) purely for the keyword-derivation
  // step below.
  const coverText = scene.cover || {};
  // MODEL-GRAMMAR G4: the room-wide feature text pool, computed once and reused per zone (§4's
  // "walk-feature props derive the same way" — segment.feature is a per-SEGMENT field, not per-zone).
  const featureText = theaterSegmentFeatureText(segment);
  // FLOOR-TEXTURES.md §2: computed ONCE per room (same "room-wide, not per-zone" discipline as
  // featureText above) and stamped on FLOOR/ELEVATED tiles only below — hazard/water tiles keep
  // their existing scorch/water tint path untouched.
  // REALM-SURFACES-WIRING.md §3: opts.realms (threaded from the SAME activeRealmsFor(skin,w) value
  // the encounter path uses — src/world/dm.js's combat_start stamps it onto segment.realms) swaps the
  // generic 12/17-material derivation for the active realm's own 8-surface vocabulary. Absent/empty
  // opts.realms -> theaterFloorSurfaceInfo falls straight through to theaterFloorMaterial, byte-
  // identical to pre-unit behavior (§3's "No realms → byte-identical today's behavior" regression law).
  // U2: pass this function's own already-resolved boardRealm through opts so
  // theaterFloorSurfaceInfo picks the SAME realm the render grade above resolved (T2's fix) instead
  // of re-deriving its own independent seeded pick.
  const surfaceInfo = theaterFloorSurfaceInfo(segment, env, Object.assign({}, opts, { boardRealm: boardRealm }));
  const floorMaterial = surfaceInfo.material;

  let tiles = [];
  let props = [];
  for(let bi = 0; bi < bands.length; bi++){
    for(let li = 0; li < lanes.length; li++){
      const zoneKey = bands[bi] + ":" + lanes[li];
      const origin = theaterZoneOrigin(bi, li);
      const elevated = !!elevSet[zoneKey];
      const hz = hazardByZone[zoneKey];
      const variant = hz ? theaterHazardVariant(hz.kind, palette) : null;
      const baseH = elevated ? THEATER_STEP : 0;
      // sink is relative to the FLOOR (0), not clamped there — a water/pit patch reads as visibly
      // BELOW the surrounding floor tiles (the whole legibility point of a sunk tile). An elevated
      // zone that's also hazarded (an edge case no fixture currently exercises) still nets negative
      // if the sink outweighs the raise, which is the honest reading of "this patch is now a hole."
      const h = variant ? (baseH - variant.sink * THEATER_STEP) : baseH;
      const kind = variant ? (variant.sink ? "water" : "hazard") : (elevated ? "elevated" : "floor");
      // G9 tune 2: elevated tiles use `elevTint` (a lightened stone-top variant), NOT `accent` — accent
      // is the env's one saturated hazard color (oxblood/etc.), which read as an alarm on a plain raised
      // patch. A hazard tile still uses its own variant.tint (unaffected by this change).
      const tint = variant ? variant.tint : (elevated ? palette.elevTint : palette.top);
      for(let tx = 0; tx < THEATER_PATCH; tx++){
        for(let tz = 0; tz < THEATER_PATCH; tz++){
          const wx = origin.x + tx, wz = origin.z + tz;
          // checker alternation is WORLD-coordinate parity (continuous across zone seams), and only
          // applies to plain, unmarked floor — a hazard/elevated tile stays one solid warning color
          // so the checker never competes with the "something is different here" signal.
          const altTop = (kind === "floor") && (((wx + wz) % 2) !== 0);
          const faceTint = gradeTint(altTop ? palette.altTop : tint);
          const material = (kind === "floor" || kind === "elevated") ? floorMaterial : null;
          tiles.push({ x: wx, z: wz, h, kind, tint: faceTint, altTop, zone: zoneKey, material });
        }
      }
      if(zoneKey in coverZones){
        // MODEL-GRAMMAR G4: try to derive a specific prop NOUN for this zone before falling back to
        // the generic "kind:cover" column theater-boot.js has always rendered (a flat undifferentiated
        // box — see that file's setBoard). Precedence, most-zone-specific text first: this zone's own
        // narrated cover text (scene.cover[zoneKey] as a STRING, not the bare `true` sentinel) -> this
        // zone's hazard kind (a zone can be both cover AND hazard-tinted, e.g. "burning wreckage") ->
        // the room-wide feature text (segment.feature — least specific, but still real DM/table text).
        // First keyword hit across that ordered pool wins; no hit at all -> `propHint` stays null and
        // the exact pre-G4 generic prop entry is pushed below, unchanged (§9 Decision 6's "never worse
        // than today" discipline, reapplied to props).
        const zoneCoverText = typeof coverText[zoneKey] === "string" ? coverText[zoneKey] : "";
        const zoneHazardKind = (hz && hz.kind) || "";
        // REALM-PROPS-WIRING.md §2: when the walk skin carries active realms (opts.realms, the SAME
        // activeRealmsFor(skin,w) seam theaterFloorSurfaceInfo already consumes), the realm-filtered
        // prop pool is consulted FIRST, over the SAME ordered text pool (cover text -> hazard kind ->
        // room-wide feature text) the generic rules use below — "the realm register should win inside
        // a breach" (§5 decision 3). No opts.realms (or no keyword hit against that realm's own prop
        // names/summaries) falls straight through to the existing generic theaterPropForText chain,
        // byte-identical to pre-unit behavior (regression law: no realms -> byte-identical).
        const realmPropHit = (Array.isArray(opts.realms) && opts.realms.length)
          ? (theaterRealmPropForText(zoneCoverText, opts.realms) ||
             theaterRealmPropForText(zoneHazardKind, opts.realms) ||
             theaterRealmPropForText(featureText, opts.realms))
          : null;
        const propHint = realmPropHit
          ? { part: realmPropHit.part, params: realmPropHit.partParams || {} }
          : (theaterPropForText(zoneCoverText) || theaterPropForText(zoneHazardKind) || theaterPropForText(featureText));
        const propEntry = {
          kind: "cover", zone: zoneKey,
          x: origin.x + (THEATER_PATCH - 1) / 2, z: origin.z + (THEATER_PATCH - 1) / 2,
          level: coverZones[zoneKey] === true ? "half" : coverZones[zoneKey]
        };
        if(propHint && propHint.part){
          propEntry.part = propHint.part;
          propEntry.partParams = propHint.params || {};
        }
        // REALM-PROPS-WIRING.md §3: stamp the realm prop's own name + Size (when one resolved) so the
        // §3 footprint pass (theater-boot.js's prop mount) can read the size without re-deriving it,
        // and so the prop's real name rides the prose twin (blind-playable, §2's own closing line).
        // Absent on every non-realm-prop entry (regression-safe — a caller ignoring these two fields
        // sees the exact pre-unit prop entry shape).
        if(realmPropHit){
          propEntry.realmPropName = realmPropHit.name;
          propEntry.size = realmPropHit.size;
        }
        props.push(propEntry);
      }
    }
  }

  // LIGHTING (Adam 2026-07-03 ruling, §1/§2): board.light — the ONE place the GL layer (theater-boot.js)
  // learns which LIGHT_PROFILES entry to apply, mirroring how `env` already threads the void/palette
  // choice through this same return shape. Precedence: a pre-stamped `segment.light` (the walk-roller's
  // OWN seeded roll — walk.js/dungeon-walk.js/wild-walk.js stamp this at the segment-minting seam, see
  // those files) always wins when present — this function never re-rolls a fact the walk already
  // settled, matching §1's "roll it where segments are rolled" (this layer only RE-PROJECTS it, same
  // discipline as this file's header comment: "never calls rollDie or any RNG"). A segment with no
  // pre-stamped light (an older snapshot, a hand-authored preview fixture, a narrow test harness) falls
  // back to a fresh theaterRollLight call, seeded off the same segment id cmPlaceFoeLane/cmSeedHash
  // already use for placement determinism — so even the fallback path reproduces identically for the
  // same segment id, never Math.random. The feature-text keyword override is re-checked here regardless
  // of which path won the base roll (a DM-narrated brazier/lava/glow word in the segment's OWN feature
  // text always beats a stamped-but-generic roll, same "feature keyword beats the rolled default" rule
  // §1 states) — theaterLightOverrideFromText is idempotent (a text with no keyword hit returns null and
  // changes nothing), so re-applying it over an already-overridden stamped value is always safe.
  const stampedLight = segment && segment.light;
  const seedKey = (segment && (segment.id || segment.num)) || "";
  const baseLight = stampedLight ? { profile: stampedLight.profile, rolled: stampedLight.rolled, overridden: !!stampedLight.overridden }
    : theaterRollLight(env, seedKey, featureText);
  const textOverride = theaterLightOverrideFromText(featureText);
  const light = textOverride
    ? { profile: textOverride, rolled: baseLight.rolled, overridden: true }
    : baseLight;

  // THEATER-NEXT §1.3 — scene.mods (terrain_change replay). Mods are read, never written; the same
  // (segment, scene, opts) triple always yields a byte-identical board (TD-10). Iterate in array
  // order (append order = replay order = deterministic). A mod whose zone doesn't resolve against
  // THIS grid (theaterZoneIndex returns null) is skipped, never thrown — same defensive law as the
  // elevZones/hazardZones reads above.
  (scene.mods || []).forEach(mod => {
    if(!mod || !theaterZoneIndex({ bands, lanes }, mod.zone)) return;
    if(mod.op === "break"){
      const zIdx = theaterZoneIndex({ bands, lanes }, mod.zone);
      const origin = theaterZoneOrigin(zIdx.bandIdx, zIdx.laneIdx);
      props = props.filter(pr => pr.zone !== mod.zone);
      props.push({
        kind: "cover", zone: mod.zone,
        x: origin.x + (THEATER_PATCH - 1) / 2, z: origin.z + (THEATER_PATCH - 1) / 2,
        level: null, part: "rubble-scatter", partParams: { scale: 0.9 }
      });
    } else if(mod.op === "burn"){
      tiles.forEach(t => {
        if(t.zone === mod.zone && t.kind !== "water"){
          t.kind = "scorch"; t.tint = gradeTint(palette.scorch); t.altTop = false; t.material = null;
        }
      });
    } else if(mod.op === "collapse"){
      if(mod.sunk === true){
        tiles.forEach(t => { if(t.zone === mod.zone) t.h = Math.max(t.h - THEATER_STEP, -THEATER_STEP); });
        const zIdx = theaterZoneIndex({ bands, lanes }, mod.zone);
        const origin = theaterZoneOrigin(zIdx.bandIdx, zIdx.laneIdx);
        props = props.filter(pr => pr.zone !== mod.zone);
        props.push({
          kind: "cover", zone: mod.zone,
          x: origin.x + (THEATER_PATCH - 1) / 2, z: origin.z + (THEATER_PATCH - 1) / 2,
          level: null, part: "rubble-scatter", partParams: { scale: 0.6 }
        });
      }
      // sunk:false (an elevated zone collapsing back to ground) — base derivation already renders it
      // (the elevZones removal), no additional tile change here.
    } else if(mod.op === "hole"){
      tiles = tiles.filter(t => t.zone !== mod.zone);
      props = props.filter(pr => pr.zone !== mod.zone);
    }
    // flood/raise: no tile change — the base derivation (hazardByZone/elevSet, above) already
    // rendered both from cm.scene.hazardZones/elevZones directly.
  });

  return {
    tiles, props, env, light, floorMaterial,
    // REALM-SURFACES-WIRING.md §3: null on every non-realm room (regression-safe — a caller that
    // ignores these two fields sees an unchanged board shape); a named surface + its prose tint when
    // opts.realms picked one. Room-wide (matches floorMaterial's own "one per room" scope).
    surfaceName: surfaceInfo.surfaceName, surfaceTint: surfaceInfo.tint,
    // REALM-RENDER-STYLE.md §3/§4: opts.realms passed straight through (undefined on a non-realm room,
    // same null-safe shape realms/surfaceName/surfaceTint already keep) so the GL layer (theater-boot.js
    // setBoard) can resolve the SAME render profile this function used for tile tints, to grade the
    // void background + light colors it owns (this pure layer has no GL/THREE concept of either).
    realms: opts.realms,
    // U2: the ONE seeded realm this room resolved to (null on a non-realm room) — stamped so a
    // caller/test can confirm the floor surface and the render grade agree on which realm a
    // multi-realm room is "in" (T2's regression check).
    realmId: boardRealm,
    // ...and the RESOLVED profile itself, stamped so the GL layer consumes THIS object instead of
    // re-deriving from its mirrored table (the mirror drifted within hours — Adam's lava-red
    // bright-kingdom was the mirror's stale value. Stamp > sync-by-convention). tint is a NUMBER
    // (or null) here — see renderProfile derivation above (T1's fix).
    renderProfile: renderProfile,
    grid: { bands, lanes, bandCount: grid.bandCount, laneCount: grid.laneCount }
  };
}

/* §1 archetype mapping: bestiary creatureType (data/bestiary.js tags.type, resolved onto the combat
   foe as .creatureType by cmFoeFrom) x size -> a composed-cuboid fallback archetype key. Small lookup
   table, deliberately coarse (BATTLE-THEATER.md §3: "12 archetype entries cover the 510-entry
   bestiary" is the pack-mapping's budget). PASS 2 (2026-07-03, "get the shapes covered"): grows the
   fallback tier from 5 buckets to 9 — biped/quadruped/flyer/serpent/swarm/giant/ooze/arachnid/
   amorphous-horror — so the remaining bestiary shapes (giants, oozes, spider-monstrosities,
   tentacled aberrations) stop reading as generic bipeds. Type wins first; a few overrides layer on
   top of the base type->archetype table:
     - giants: `giant` type always buckets giant. A huge/gargantuan creature of an otherwise-biped
       type (humanoid/fiend/celestial/undead/construct/fey) ALSO buckets giant — a huge fiend/undead/
       construct reads as a hulking brute, not a human-proportioned figure. Excluded: aberration (it
       has its own amorphous-horror bucket regardless of size) and any name matching THEATER_QUAD_WORD_RX,
       which routes to quadruped INSTEAD (not just "skip giant, fall through to biped") — a huge
       CELESTIAL ELK or fey DIRE WORG are real bestiary rows that are animal-shaped despite their
       generically-biped-mapped type tag; the size-override's false-positive guard corrects the shape,
       not just the giant bucket.
     - arachnid: a NAME-keyword override (spider/arachnid/tarantula) that fires regardless of type,
       because the bestiary's real spider rows are tagged beast/monstrosity, not a dedicated type —
       Giant Spider/Giant Wolf Spider/Spider (beast) and Phase Spider (monstrosity) all need the
       low-wide-plus-legs read a generic quadruped bucket can't give them.
     - ooze: `ooze` type -> its own low-wide-blob archetype (previously bucketed quadruped, which put
       a black pudding on four legs — wrong silhouette entirely).
     - amorphous-horror: `aberration` type (after the arachnid name-keyword override has first claim)
       -> asymmetric mass + tentacles, the aberration-specific read a biped bucket flattened away.
   Untyped/unknown types default biped (humanoids, the modal case). */
const THEATER_ARCHETYPE_BY_TYPE = {
  humanoid: "biped", fiend: "biped", celestial: "biped",
  undead: "biped", construct: "biped", fey: "biped",
  beast: "quadruped", monstrosity: "quadruped", dragon: "quadruped",
  plant: "quadruped", elemental: "quadruped",
  giant: "giant", ooze: "ooze", aberration: "amorphous-horror",
  swarm: "swarm"
};
// biped-mapped types eligible for the "huge/gargantuan -> giant" size override (aberration is
// excluded — it already has its own amorphous-horror bucket independent of size).
const THEATER_GIANT_SIZE_TYPES = { humanoid: 1, fiend: 1, celestial: 1, undead: 1, construct: 1, fey: 1 };
const THEATER_GIANT_SIZES = { huge: 1, gargantuan: 1 };
// name-keyword guard against the size-override's real false positives (a huge celestial elk / fey
// dire worg are animal-shaped, not humanoid brutes — both are actual bestiary rows this excludes).
const THEATER_QUAD_WORD_RX = /\b(elk|worg|wolf|horse|bear|stag|hound|steed|boar|lion|tiger|panther|hyena|dog)\b/i;
// name-keyword override for spider-shaped bestiary rows tagged beast/monstrosity (no dedicated type).
const THEATER_ARACHNID_WORD_RX = /spider|arachnid|tarantula/i;

function theaterArchetypeFor(creatureType, size, name){
  const t = String(creatureType || "").toLowerCase();
  const s = String(size || "").toLowerCase();
  const n = String(name || "");
  if(/swarm/.test(t)) return "swarm";
  if(THEATER_ARACHNID_WORD_RX.test(n)) return "arachnid";
  if(t === "giant") return "giant";
  if(THEATER_GIANT_SIZE_TYPES[t] && THEATER_GIANT_SIZES[s]){
    // the size override's own false-positive guard: an animal-shaped name (elk/worg/wolf/...) on an
    // otherwise-biped-mapped type (a mistagged celestial/fey critter, e.g. Giant Elk/Dire Worg) routes
    // straight to quadruped instead of falling through to that type's generic biped default below —
    // the guard isn't just "skip the giant bucket," it's "this row is actually animal-shaped."
    if(THEATER_QUAD_WORD_RX.test(n)) return "quadruped";
    return "giant";
  }
  if(THEATER_ARCHETYPE_BY_TYPE[t]) return THEATER_ARCHETYPE_BY_TYPE[t];
  return "biped";
}

/* ============================================================================
   MODEL-GRAMMAR G2 §4b — the shape-hint resolver (the mogwai clause). "Nothing that
   exists is ever shapeless, and the part menu never gates DM invention" (Adam 2026-07-03).
   When the DM introduces an original off-bestiary creature (gen handshake / codex_add), it
   may attach a `shape` hint: {base, size, modules:[{part,anchor,params?}], channels:{},
   stance?} — picked from the CLOSED part vocabulary (data/model-recipes.js's generated
   PART_NAMES snapshot of src/ui/theater-parts.js's own PARTS registry keys, read here as a
   plain global so this classic-script file never imports the ES-module part library
   directly — the classic/module boundary stays one-way, per CLAUDE.md's architecture note).
   The DM owns the MEANING; the script owns the PARTS (parts ARE the nouns) — so this
   resolver VALIDATES every name rather than trusting freeform input: an unknown part name
   drops to nearest-known (a module with no valid part is simply omitted — §4b's own "unknown
   attachment -> omitted"; an unknown BASE body falls back to "torso-biped", the modal
   archetypes-2 default, matching Decision 6's "never worse than today"), and every drop is
   recorded in the returned `gaps[]` array — the caller (codex.js's codexAdd, the sole state
   owner) is responsible for actually writing each gap to the `shape-gaps` ledger line (this
   file stays a PURE data layer per its own header: zero GS/w/U/ledger writes of its own).
   PURE + total: never throws on a missing/malformed hint (returns the pure fallback shape),
   ANCHOR_NAMES is inlined here (not read off theater-parts.js's own export, for the same
   one-way classic/module boundary reason PART_NAMES is a generated snapshot rather than a
   live import) — kept byte-identical to that file's §2 frozen list by convention+comment. */
const THEATER_SHAPE_ANCHOR_NAMES = ["mainHand", "offHand", "back", "head", "shoulders", "base", "mount"];
const THEATER_SHAPE_FALLBACK_BASE = "torso-biped";       // the archetypes-2 modal default (Decision 6)
const THEATER_SHAPE_VALID_SIZES = { tiny: 1, small: 1, medium: 1, large: 1, huge: 1, gargantuan: 1 };

/* the real part vocabulary — data/model-recipes.js (G2's generator) snapshots
   src/ui/theater-parts.js's PARTS registry keys into a global PART_NAMES array at generation
   time specifically so this file can validate against it without an ES-module import. Absent
   (module not loaded / a narrow test harness) degrades to an empty vocabulary — every name
   then counts as unknown/gapped rather than throwing, same total-function discipline the
   rest of this file already uses for a missing cmZoneGrid/cmSeedHash. */
function theaterPartVocabulary(){
  return (typeof PART_NAMES !== "undefined" && Array.isArray(PART_NAMES)) ? PART_NAMES : [];
}

function resolveShapeHint(shape){
  const vocab = theaterPartVocabulary();
  const knownPart = (name) => vocab.indexOf(name) >= 0;
  const gaps = [];
  const hint = shape || {};

  // BASE: an unknown/missing base body drops to the archetypes-2 fallback — logged as a gap
  // (the doc's own "nearest-known drops with a shape-gaps ledger line" — a body has no real
  // "nearest" part to interpolate toward besides the universal fallback, so base drops go
  // straight to torso-biped rather than attempting a body-to-body similarity guess).
  let base = hint.base;
  if(!base || !knownPart(base)){
    if(base) gaps.push({ kind: "base", requested: base, resolved: THEATER_SHAPE_FALLBACK_BASE });
    base = THEATER_SHAPE_FALLBACK_BASE;
  }

  // SIZE: free-text but constrained to the SRD size vocabulary (matches bestiary tags.size) —
  // an unrecognized size string is dropped (not gap-logged; size isn't a part-vocabulary
  // concern) and defaults "medium", the bestiary's own modal size.
  const size = (hint.size && THEATER_SHAPE_VALID_SIZES[String(hint.size).toLowerCase()])
    ? String(hint.size).toLowerCase() : "medium";

  // MODULES: each {part, anchor, params?} entry is validated independently — an unknown part
  // is DROPPED (§4b: "unknown attachment -> omitted"), not substituted, since a module (unlike
  // a body) has no single universal nearest-equivalent; an unrecognized anchor name on an
  // otherwise-known part is also dropped (the module would never resolve to a real transform).
  // Both cases push one gaps[] entry each so the growth signal captures WHAT was asked for.
  const modules = [];
  (Array.isArray(hint.modules) ? hint.modules : []).forEach((m) => {
    if(!m || !m.part){
      return; // a malformed module entry (no part name at all) is silently dropped, no gap —
              // nothing to log a "nearest-known" against; this is authoring noise, not a real ask.
    }
    if(!knownPart(m.part)){
      gaps.push({ kind: "module", requested: m.part, anchor: m.anchor || null, resolved: null });
      return;
    }
    const anchor = (m.anchor && THEATER_SHAPE_ANCHOR_NAMES.indexOf(m.anchor) >= 0) ? m.anchor : null;
    if(!anchor){
      gaps.push({ kind: "anchor", requested: m.anchor || null, part: m.part, resolved: null });
      return;
    }
    modules.push({ part: m.part, anchor, params: m.params || undefined });
  });

  // CHANNELS: passed through as-is (§5: semantic slot names, never validated against a fixed
  // palette here — the theater's palette stack resolves an unknown channel name to its own
  // default tint at render time, same discipline theater-boot.js's renderPartInto already uses
  // for an unrecognized channel key). Always an object, never undefined.
  const channels = (hint.channels && typeof hint.channels === "object") ? Object.assign({}, hint.channels) : {};

  const stance = hint.stance || null;

  return {
    resolved: { base, size, modules, channels, stance },
    gaps,
    hadHint: !!(shape && (shape.base || (shape.modules && shape.modules.length)))
  };
}

/* deterministic within-zone offset for the Nth occupant of a shared zone — same discipline as
   combat.js's cmSeedHash-driven cmPlaceFoeLane (never Math.random, so two calls over the same
   combat produce identical offsets). Spreads occupants across the zone's inner 3x3 patch on a small
   fixed ring so multiple units sharing one band:lane don't stack exactly on the zone center.

   THEATER-ZOOM-SPREAD (G9 crowd note: "5 foes in one band overlap into a blob"): the ring's radii
   widened from the original 0.5/0.7 pair to 0.85/1.05 — the old 0.7 radius put two adjacent ring
   slots only 0.7 tiles apart (center-to-ring) or 0.99-1.4 apart (ring-to-ring), close enough that two
   FIGURE_SCALE=1.5 fallback figures (theater-boot.js) visually intersect. The zone's own 3x3 patch has
   a half-width of 1.0 tile-index-wise ((THEATER_PATCH-1)/2 = 1) — TILE_SIZE=1 world unit per tile and
   TILE_GAP=0.04 (theater-boot.js) put the patch's outer edge at ~1.48 world units from center, so 1.05
   still sits inside the zone's own footprint with a hair of margin, never spilling onto a neighboring
   zone's tiles. */
const THEATER_OFFSET_RING = [
  { dx: 0, dz: 0 }, { dx: 1.05, dz: 0 }, { dx: -1.05, dz: 0 },
  { dx: 0, dz: 1.05 }, { dx: 0, dz: -1.05 }, { dx: 0.85, dz: 0.85 },
  { dx: -0.85, dz: 0.85 }, { dx: 0.85, dz: -0.85 }, { dx: -0.85, dz: -0.85 }
];
// LANE-SPILL: when a zone hosts more occupants than the base ring comfortably seats without any
// occupant landing exactly on another zone's would-be center (>2 sharing one zone — the base ring's
// first 2 non-center slots, dx:+-1.05 dz:0, are the widest-spaced pair; a 3rd+ occupant starts
// reusing slots that sit closer to an already-placed one), every slot's offset is scaled OUTWARD
// toward the zone's free edges by SPILL_SCALE — still deterministic (a pure function of occupant
// count, no extra randomness), still bounded well inside the patch's own footprint (SPILL_SCALE's
// max keeps 1.05*SPILL_SCALE_MAX under the ~1.48 world-unit patch-edge distance noted above).
const THEATER_SPILL_THRESHOLD = 2;  // occupant count above which lane-spill starts scaling offsets out
const THEATER_SPILL_SCALE_STEP = 0.12; // outward scale added per occupant past the threshold
const THEATER_SPILL_SCALE_MAX = 1.35;  // caps the outward scale so a crowded zone never spills tiles
function theaterSpillScaleFor(occupantCount){
  if(occupantCount <= THEATER_SPILL_THRESHOLD) return 1;
  const extra = occupantCount - THEATER_SPILL_THRESHOLD;
  return Math.min(THEATER_SPILL_SCALE_MAX, 1 + extra * THEATER_SPILL_SCALE_STEP);
}
function theaterWithinZoneOffset(seedKey, occupantIdx, occupantCount){
  const scale = theaterSpillScaleFor(occupantCount || 0);
  if(occupantIdx <= 0) return { dx: 0, dz: 0 }; // the first occupant always holds the zone's true center
  const h = (typeof cmSeedHash === "function") ? cmSeedHash(seedKey + ":" + occupantIdx) : occupantIdx;
  const base = THEATER_OFFSET_RING[1 + (h % (THEATER_OFFSET_RING.length - 1))];
  return { dx: base.dx * scale, dz: base.dz * scale };
}

/* §3 CLASS SILHOUETTES (PC/ally figures only — Adam 2026-07-03: "read the PC's class... silhouette
   variant"). Coarse 4-bucket read off the sheet's class string (data/srd-creator.js's 12 base-class
   names, e.g. "Fighter"/"Wizard"/"Rogue"; the creator always writes the canonical capitalized name,
   src/creator/roster.js's own display reads the same field raw) -> a stance/silhouette family the GL
   builder composes differently:
     martial  — broad stance, sword-slab or axe-wedge sidearm (Fighter/Barbarian/Monk)
     ranger   — lean/crouched stance, bow or dagger pair (Ranger/Rogue)
     caster   — flared robe-skirt lower body, staff+tip (Wizard/Sorcerer/Warlock/Druid/Bard)
     cleric   — shield slab + mace (Cleric/Paladin)
   An unrecognized/absent class name defaults "martial" (the modal no-caster, no-shield read — never
   throws/undefined). Case-insensitive so a lowercase or oddly-cased sheet value still resolves. */
const THEATER_CLASS_SILHOUETTE = {
  fighter: "martial", barbarian: "martial", monk: "martial",
  ranger: "ranger", rogue: "ranger",
  wizard: "caster", sorcerer: "caster", warlock: "caster", druid: "caster", bard: "caster",
  cleric: "cleric", paladin: "cleric"
};
function theaterClassSilhouetteFor(className){
  const c = String(className || "").toLowerCase();
  return THEATER_CLASS_SILHOUETTE[c] || "martial";
}

/* §3 WEAPON SHAPES. PC/ally figures get their weapon off the class silhouette (silhouette->weapon,
   deterministic, no bestiary text to scan); foe bipeds get theirs off a NAME/ACTION-TEXT keyword scan
   (Adam: "foe bipeds with obvious weapon words in their name/actions... get the matching slab") since
   foes have no class field — actions carries the bestiary's real attack names (cmFoeFrom's
   `actions: entry.actions || []`, each `{name, ...}`), which is where most weapon words actually live
   (e.g. "Bandit Enforcer" -> action "Mace"; the creature's own NAME rarely names its weapon). Order
   matters (first match wins): a stat block sometimes carries multiple weapon-word actions (a
   shortsword+crossbow bandit) — earliest-listed action is treated as the primary/drawn weapon, matching
   reading order top-to-bottom the way a stat block lists its actions. "none" -> the archetype's own
   builder decides (a bare fist/claw figure, no weapon slab added). */
const THEATER_CLASS_WEAPON = { martial: "sword", ranger: "bow", caster: "staff", cleric: "mace" };
function theaterWeaponForClass(silhouette){
  return THEATER_CLASS_WEAPON[silhouette] || "none";
}
// NOTE: no leading \b on the word itself — real bestiary action names are compound ("Shortsword",
// "Greataxe", "Longbow", "Greatclub") with the size/quality prefix glued directly onto the weapon
// word (no boundary between "Short" and "sword"), so a leading \b would silently never match the
// most common real rows. A trailing \b still guards against matching inside an unrelated longer word.
const THEATER_WEAPON_WORD_RX = [
  ["bow", /(cross)?bow\b/i],
  ["axe", /axe\b/i],
  ["spear", /\b(spear|pike|lance|trident|halberd|glaive)\b/i],
  ["staff", /\b(staff|quarterstaff|wand|rod)\b/i],
  ["dagger", /\b(dagger|dirk|knife)\b/i],
  ["mace", /(mace|club|hammer|flail|morningstar)\b/i],
  ["sword", /sword\b|\b(blade|rapier|scimitar|saber|falchion)\b/i]
];
function theaterWeaponForFoe(name, actions){
  const haystacks = [String(name || "")].concat(
    (actions || []).map(a => (a && a.name) || "")
  );
  for(const hay of haystacks){
    for(const [key, rx] of THEATER_WEAPON_WORD_RX){
      if(rx.test(hay)) return key;
    }
  }
  return "none";
}

/* ============================================================================
   MODEL-GRAMMAR G3 §2 — THE LOADOUT MIRROR (docs/MODEL-GRAMMAR.md §2, §9 Decision 5: "the anchor
   contract IS the equip-slot system with geometry"). PC/ally figures stop being class-silhouette
   archetypes and become a small recipe DERIVED LIVE from the sheet — read-only, zero new
   bookkeeping: `sheet.equipped.mainHand/offHand` resolve through the EXISTING ITEMS layer
   (data/items.js's ITEMS_BY_NAME, the same index engine.combat's cmEquippedDamage/cmEquippedAC
   already read) to a G1 weapon/shield part at the right §2 anchor; the equipped armor's `category`
   (light/medium/heavy — NOT raw AC, per the spec) picks an armor module set; a caster class always
   keeps `robe-skirt` regardless of what's in mainHand (the class silhouette rule, unchanged from
   PASS 2's theaterClassSilhouetteFor). This produces the SAME recipe shape buildFigureFromRecipe
   (theater-boot.js §6) already knows how to render — a PC recipe is just data, exactly like a
   bestiary recipe; theater-boot.js needs zero new rendering code, only a new call site (G3 step 1).

   PURE + total: reads `sheet` defensively (a bare {} degrades to unarmed/unarmored, never throws)
   and never mutates it; `itemDef`/`ITEMS_BY_NAME` are read via typeof guards (engine.combat loads
   BEFORE this file in manifest order so they're normally present, but a narrow test harness that
   loads this file alone must still degrade cleanly rather than ReferenceError). */

/* weapon NAME/properties -> a G1 weapon-part key, one bucket per §1's silhouette-first weapon
   vocabulary (sword-slab/axe-wedge/bow-arcs/spear-pole/staff-tipped/dagger-slabs/club-mass — no
   shield-slab here, a shield is a KIND not a weapon-word match, handled separately below). Reuses
   the exact keyword/precedence discipline THEATER_WEAPON_WORD_RX already established for foes (a
   PC's equipped weapon has a real item NAME to scan, same as a foe's action name) rather than
   inventing a second classification scheme — one weapon-word table for the whole file. */
function theaterWeaponPartForItemName(name){
  const hay = String(name || "");
  for(const [key, rx] of THEATER_WEAPON_WORD_RX){
    if(rx.test(hay)) return key;
  }
  return null;
}
const THEATER_WEAPON_PART_KEY = {
  sword: "sword-slab", axe: "axe-wedge", bow: "bow-arcs", staff: "staff-tipped",
  spear: "spear-pole", mace: "club-mass", dagger: "dagger-slabs"
};

/* armor `category` (data/items.js's ITEMS_BY_NAME string, e.g. "Light Armor"/"Medium Armor"/
   "Heavy Armor" — the SRD's own band, not a raw AC number per the spec's explicit "armor class
   band (the equipped armor's type, not raw AC)") -> a set of G1 armor module parts at their
   anchors. Light = a pauldrons module on a leather channel (a light shoulder-read, distinct from
   the bare leather-channel skin `none` gives); Medium = chest-plate; Heavy = the full
   chest-plate+pauldrons+helm-crest set (mirrors §4 rule 4's own AC18+ full-plate read, reapplied
   here off the SRD category string instead of a derived AC number). `none` (unarmored/unresolved)
   is the actual no-armor-module band. */
function theaterArmorBandFor(category){
  const c = String(category || "").toLowerCase();
  if(c.indexOf("heavy") >= 0) return "heavy";
  if(c.indexOf("medium") >= 0) return "medium";
  if(c.indexOf("light") >= 0) return "light";
  return "none";
}
const THEATER_ARMOR_BAND_MODULES = {
  none: [],
  light: [ { part: "pauldrons", anchor: "shoulders", channel: "leather" } ],
  medium: [ { part: "chest-plate", anchor: "shoulders" } ],
  heavy: [
    { part: "chest-plate", anchor: "shoulders" },
    { part: "pauldrons", anchor: "shoulders" },
    { part: "helm-crest", anchor: "head" }
  ]
};

/* item id -> its inventory instance -> its base ITEMS_BY_NAME def, the SAME resolution chain
   cmEquippedDamage/cmEquippedAC already use (baseDef reads inst.base||inst.name through itemDef).
   Defensive: any missing link (no id, no matching instance, unindexed item) returns null rather
   than throwing — an equip slot with nothing usable in it just contributes no module, same as an
   empty slot. */
function theaterItemDefFor(itemId, inventory){
  if(!itemId) return null;
  const inst = (inventory || []).find(it => it && it.id === itemId);
  if(!inst) return null;
  if(typeof baseDef === "function") return baseDef(inst);
  // narrow-harness fallback: engine.combat's baseDef isn't loaded — resolve directly off
  // ITEMS_BY_NAME using the same inst.base||inst.name convention baseDef itself uses.
  const key = inst.base || inst.name;
  return (typeof ITEMS_BY_NAME !== "undefined" && key) ? (ITEMS_BY_NAME[String(key).toLowerCase()] || null) : null;
}

/* CARRY STATES (L14/L15): is this weapon item def a true HEAVY TWO-HANDED melee (back-mount carry)?
   Reads the item's own `properties` array (ITEMS data): "Two-Handed" + "Heavy" both present, AND NOT
   "Versatile" (a versatile weapon wielded 2H stays held-fist per Adam's ruling). Also accepts a bare
   greatsword/greataxe/maul NAME as a belt-and-suspenders fallback for an item whose properties array
   is thin. Pure, total; never throws on a missing/absent def or properties. Returns false for ranged/
   thrown weapons even if 2H (a longbow is bow-held, never back-mounted — the render-side weaponCarryFor
   only ever promotes a held-fist blade/blunt, so a heavy flag on a bow is inert anyway, but this keeps
   the PC-mirror signal honest at the source too). */
function theaterItemIsHeavy2H(def){
  if(!def) return false;
  const name = String(def.name || "");
  const props = Array.isArray(def.properties) ? def.properties.map(p => String(p).toLowerCase()) : [];
  const isVersatile = props.indexOf("versatile") >= 0;
  if(isVersatile) return false;
  const twoHanded = props.indexOf("two-handed") >= 0;
  const heavy = props.indexOf("heavy") >= 0;
  if(twoHanded && heavy) return true;
  // name fallback (thin/absent properties): a great*/maul melee name reads heavy 2H.
  return /\bgreat(sword|axe|club|maul)?\b|\bmaul\b/i.test(name) && !/bow|sling|dart|javelin|crossbow/i.test(name);
}

/* §2 THE LOADOUT MIRROR — pcRecipeFrom(sheet, cls) — sheet: {equipped:{mainHand,offHand,armor},
   inventory:[...]} (a PC/ally sheet-shaped object; ANY sheet-shaped object works, not just the
   living PC's — an ally with its own equipped/inventory mirrors identically), cls: the class NAME
   string (sheet.class upstream — passed separately so a caller that already resolved a silhouette
   doesn't need to re-derive it). Returns a recipe object in the EXACT §3 shape
   buildFigureFromRecipe already consumes: {base, size, modules:[{part,anchor,params?}], channels,
   poseSeed}. Always torso-biped (the only body PC/ally figures ever use — no bestiary size/type
   swap for the player's own side); size always "medium" (sheet-driven figures don't carry a size
   field the way bestiary rows do — medium is the SRD default for a PC race in this version's
   scope). */
function pcRecipeFrom(sheet, cls){
  sheet = sheet || {};
  const equipped = sheet.equipped || {};
  const inventory = sheet.inventory || [];
  const silhouette = theaterClassSilhouetteFor(cls);
  const isCaster = silhouette === "caster";
  const modules = [];

  // MAIN HAND: a caster ALWAYS keeps robe-skirt for its lower-body read (§2/§9 Decision 5, "caster
  // class keeps robe-skirt") but still shows whatever's actually in their hand (a caster wielding a
  // dagger reads dagger-slabs at mainHand — the class rule governs silhouette/lower-body, not the
  // weapon read, which stays a pure equipment mirror regardless of class).
  const mainDef = theaterItemDefFor(equipped.mainHand, inventory);
  if(mainDef && mainDef.kind === "weapon"){
    const weaponKey = theaterWeaponPartForItemName(mainDef.name);
    const partName = weaponKey && THEATER_WEAPON_PART_KEY[weaponKey];
    if(partName){
      // CARRY STATES (L14/L15): the PC-mirror reads the item's OWN two-handed/heavy property (ITEMS
      // data, not a name guess) to flag a true heavy 2H weapon for the back-mount carry. A greatsword/
      // greataxe/maul carries "Heavy"+"Two-Handed" (and no "Versatile"); a versatile weapon wielded
      // two-handed stays held-fist per the ruling, so a "Versatile" property SUPPRESSES the heavy flag
      // even when Two-Handed is also listed. theater-boot.js's weaponCarryFor reads params.heavy.
      const mod = { part: partName, anchor: "mainHand" };
      if(theaterItemIsHeavy2H(mainDef)) mod.params = { heavy: true };
      modules.push(mod);
    }
  }
  // unarmed (no mainHand item, or an unindexed/non-weapon item) -> no weapon module, matching the
  // spec's explicit "unarmed -> no weapon module" fixture case.

  // OFF HAND: a shield resolves to shield-slab at offHand regardless of class (a caster with a
  // shield still shows it — the robe-skirt rule only ever governs the LEG read, never the hands).
  const offDef = theaterItemDefFor(equipped.offHand, inventory);
  if(offDef && offDef.kind === "shield"){
    modules.push({ part: "shield-slab", anchor: "offHand" });
  } else if(offDef && offDef.kind === "weapon"){
    // dual-wielding (a second Light weapon in the off hand, docs/ITEMS.md's base two-weapon rule) —
    // mirror it too, same weapon-word resolution as the main hand.
    const offWeaponKey = theaterWeaponPartForItemName(offDef.name);
    const offPartName = offWeaponKey && THEATER_WEAPON_PART_KEY[offWeaponKey];
    if(offPartName) modules.push({ part: offPartName, anchor: "offHand" });
  }

  // ARMOR: the equipped armor's SRD category band (light/medium/heavy — never raw AC, per spec)
  // adds its module set. A caster with light/no armor keeps robe-skirt as their only lower-body
  // read (no pelvis/leg conflict — buildFigureFromRecipe always draws the torso-biped core, which
  // already omits legs for a caster the same way theater-boot.js's buildBiped does today; robe-skirt
  // itself is asserted below, independent of armor).
  const armorDef = theaterItemDefFor(equipped.armor, inventory);
  const armorBand = armorDef ? theaterArmorBandFor(armorDef.category) : "none";
  THEATER_ARMOR_BAND_MODULES[armorBand].forEach(m => modules.push({ part: m.part, anchor: m.anchor }));

  // CASTER SILHOUETTE: always attach robe-skirt at `base` regardless of weapon/armor findings
  // above (§2's own "caster class keeps robe-skirt" — unconditional, the one silhouette override
  // that survives the live-state mirror). robe-skirt's own §1 geometry supplies the flared
  // lower-body read theater-boot.js's buildBiped caster branch already draws for the archetype
  // fallback; mirroring it into the recipe keeps a caster PC's figure consistent whether or not a
  // recipe-driven path is active.
  if(isCaster) modules.push({ part: "robe-skirt", anchor: "base" });

  return {
    base: "torso-biped",
    size: "medium",
    modules,
    channels: { skin: "skin-green-grey", armor: armorBand === "none" ? "leather" : "armor", accent: "none" },
    poseSeed: (sheet.name || cls || "pc")
  };
}

/* ============================================================================
   MODEL-GRAMMAR G3 §2 — CONDITIONS AS MODULES (both the PC and foes). Reads OFF THE SAME shape
   the digest already reads (dm.js's condNames -> condition-name strings, engine.conditions'
   condName normalizing either a bare string or a {condition,ttl,appliedRound} entry) — no new
   condition bookkeeping, this is a pure re-read of `holder.conditions` through the existing
   condName normalizer. A condition with no visual opinion here (blinded/charmed/etc.) contributes
   nothing — conditionMods is additive, never a hard gate on which conditions are "real" (the
   CONDITIONS mechanical table in engine.conditions is untouched and unconsulted; this is a purely
   COSMETIC reading of the same names). Returns an array (never null/undefined) so a caller can
   always safely spread/iterate it:
     prone      -> {kind:"rotation", axis:"z", angle: ~80° in radians} — theater-boot.js applies
                   this as the figure's base rotation (distinct from the EXISTING down-flag 90°
                   topple pose — prone-as-condition and down-as-HP-zero are two different signals
                   that happen to read similarly; this unit only emits the mod, boot.js's existing
                   `if(u.down)` branch is untouched, so a prone-but-not-down unit gets its own
                   independent ~80° tip without being mistaken for the terminal down pose).
     burning    -> {kind:"attach", part:"ember-flecks", anchor:"shoulders"} — an FX attachment
                   module, same shape a recipe module already uses, anchored at `shoulders` (a
                   visible, unobstructed anchor every body part exports per §2's full anchor set).
                   "burning" is DM-narrated free text (no formal SRD condition of that name, same
                   status theaterHazardVariant's kind-keyword read already has) — matched by a
                   loose keyword scan (burn/fire/ablaze/flame) so a DM's varied phrasing still
                   resolves, mirroring THEATER_WEAPON_WORD_RX's own keyword-list discipline.
     restrained -> {kind:"attach", part:"shield-slab", anchor:"base", tint:"restrain-band"} — a
                   binding-band box at the figure's base anchor. Reuses shield-slab (a flat slab
                   box, the closest existing §1 part to a "binding band" read) rather than adding a
                   new part — the growth-surface discipline (§4b) says a genuinely new visual need
                   earns a real new part through the normal pipeline; a placeholder-tier binding
                   read from an existing slab is honest reuse, not a gap.
   ============================================================================ */
const THEATER_BURNING_WORD_RX = /burn|fire|ablaze|flame|ignit/i;
function theaterConditionModsFrom(holder){
  const names = (holder && holder.conditions || []).map(c =>
    (typeof condName === "function") ? condName(c) : (typeof c === "string" ? c : (c && c.condition) || null)
  ).filter(Boolean);
  const mods = [];
  names.forEach(n => {
    const name = String(n).toLowerCase();
    if(name === "prone"){
      mods.push({ kind: "rotation", axis: "z", angle: (80 * Math.PI) / 180, condition: "prone" });
    } else if(name === "restrained"){
      mods.push({ kind: "attach", part: "shield-slab", anchor: "base", tint: "restrain-band", condition: "restrained" });
    } else if(THEATER_BURNING_WORD_RX.test(name)){
      mods.push({ kind: "attach", part: "ember-flecks", anchor: "shoulders", condition: name });
    }
  });
  return mods;
}

/* §1 THE UNITS: a live `combat` object (GS.combat shape from combatStart — .grid, .pc, .foes[],
   .pcRef) -> units[] {id, kind, archetype, x, z, down, fled, obliterated, silhouette?, weapon}. Reads
   the SAME grid the board was built from (combat.grid, set once by combatStart) so unit coordinates
   line up with theaterBoardFrom's tile origins with no re-derivation. Occupancy counting (for the
   within-zone offset) is done by a single pass keyed on "band:lane" — first occupant of a zone gets
   the center, subsequent occupants fan out on THEATER_OFFSET_RING, in encounter order (pc first, then
   foes in their existing array order) so the result is stable across two calls on the same combat object.

   DEAD-STATE (2026-07-03, Adam's ruling — "there needs to be a dead state unless they were obliterated
   by a crit or a spell or the environment or any other thing that would vaporize them"): `down` is the
   DEFAULT terminal state (HP<=0, applyDamage's own set — combat.js never splices a downed combatant out
   of foes[]/allies[], so a corpse simply keeps flowing through this function on every setUnits refresh,
   same as any other unit — theater-boot.js is the one that renders it as a persistent toppled/desaturated
   corpse rather than removing it). `obliterated` is a SEPARATE, rarer flag (never set by applyDamage
   itself — see src/world/dm.js's crit_outcome/attack/hazard_tick call sites for where it gets stamped)
   that theater-boot.js's setUnits reads to render the EXCEPTION: no figure at all, a burst+sink FX, and
   a scorch tile marker instead. A unit can carry `down` without `obliterated` (the corpse case) but
   never the reverse in practice (an obliterated unit is also down by definition — HP<=0) — this function
   doesn't enforce that relationship, it just passes both flags through unchanged, exactly like `down`/
   `fled` already are; the render-time meaning lives entirely in theater-boot.js.

   PASS 2 additions (silhouette/weapon, §3): PC/allies carry `silhouette` (theaterClassSilhouetteFor
   off pcRef.class / a.class) and `weapon` derived FROM that silhouette (theaterWeaponForClass) — a
   class always implies a signature weapon read, no bestiary text to scan for the player's own side.
   Foes carry no `silhouette` (undefined; the archetype alone drives their build) and `weapon` derived
   from a name/action-text keyword scan (theaterWeaponForFoe) — "none" when no weapon word is found,
   which the GL builder reads as "no weapon slab, archetype's bare-limb read only." */
function theaterUnitsFrom(combat){
  if(!combat) return { units: [] };
  const grid = combat.grid || { bands: ["melee", "near", "far", "out"], lanes: ["L", "C", "R"] };
  // LANE-SPILL needs each zone's TOTAL occupant count before any unit is placed (theaterSpillScaleFor
  // reads the whole-zone count, not a running tally) — a quick pre-pass over pc/allies/foes' own
  // band/lane fields (the same fields unitFor resolves a zone key from below) tallies zoneCounts up
  // front, independent of unitFor's per-call incremental occIdx bookkeeping (unchanged, still needed
  // for "which ring slot is THIS occupant").
  const zoneKeyFor = (band, lane) => (band || grid.bands[0]) + ":" + (lane || grid.lanes[0]);
  const zoneCounts = {};
  const tallyZone = (band, lane) => {
    const zk = zoneKeyFor(band, lane);
    zoneCounts[zk] = (zoneCounts[zk] || 0) + 1;
  };
  if(combat.pc) tallyZone(combat.pc.band, combat.pc.lane);
  ((combat.allies) || []).forEach(a => tallyZone(a.band || (combat.pc && combat.pc.band), a.lane || (combat.pc && combat.pc.lane)));
  (combat.foes || []).forEach(f => tallyZone(f.band, f.lane));

  const seenPerZone = {};
  const occupantIndex = (zoneKey) => {
    const n = seenPerZone[zoneKey] || 0;
    seenPerZone[zoneKey] = n + 1;
    return n;
  };
  const unitFor = (id, kind, archetype, band, lane, flags) => {
    const bandIdx = grid.bands.indexOf(band);
    const laneIdx = grid.lanes.indexOf(lane);
    const safeB = bandIdx >= 0 ? bandIdx : 0;
    const safeL = laneIdx >= 0 ? laneIdx : 0;
    const zoneKey = zoneKeyFor(band, lane);
    const origin = theaterZoneOrigin(safeB, safeL);
    const center = (THEATER_PATCH - 1) / 2;
    const occIdx = occupantIndex(zoneKey);
    const off = theaterWithinZoneOffset(zoneKey, occIdx, zoneCounts[zoneKey]);
    return Object.assign({
      id, kind, archetype,
      x: origin.x + center + off.dx, z: origin.z + center + off.dz
    }, flags || {});
  };

  const units = [];
  if(combat.pc){
    const pcRef = combat.pcRef || {};
    const silhouette = theaterClassSilhouetteFor(pcRef.class);
    // MODEL-GRAMMAR G3 §2 — THE LOADOUT MIRROR: a pcRef carrying `equipped` (sheet.equipped, the
    // same shape cmEquippedDamage/cmEquippedAC already read) derives a live pcRecipe via
    // pcRecipeFrom; theater-boot.js's figureFor prefers pcRecipe over the archetype/silhouette
    // fallback exactly the way it already prefers a bestiary recipeSlug for foes (§9 Decision 6:
    // never worse than today — a pcRef with no `equipped` field yet, e.g. an older combat snapshot
    // or a narrow test fixture, simply gets pcRecipe:null and falls through unchanged to the
    // existing silhouette/weapon archetype build).
    const pcRecipe = pcRef.equipped ? pcRecipeFrom(pcRef, pcRef.class) : null;
    units.push(unitFor("pc", "pc", theaterArchetypeFor(pcRef.creatureType || "humanoid", null),
      combat.pc.band, combat.pc.lane,
      {
        down: !!combat.pc.down, fled: false, obliterated: !!combat.pc.obliterated,
        silhouette, weapon: theaterWeaponForClass(silhouette),
        pcRecipe,
        // P1' WHOLE-OBJECT WIRING (docs/P1-WIRING.md §2.4): the class-roster resolution key —
        // lowercased pcRef.class, or null when absent (an older snapshot / narrow test fixture with
        // no class field). theater-boot.js's figureFor resolves "class:<className>" through the
        // whole-object registry BEFORE the pcRecipe/bestiary-recipe/archetype chain below (the
        // roster-supersession clause); a null className here is a harmless no-op for that lookup.
        className: pcRef.class ? String(pcRef.class).toLowerCase() : null,
        // MODEL-GRAMMAR G3 §2 conditions-as-modules: the PC's conditions live on the CHARACTER
        // (t.c.conditions, conditionHolder's convention — see dm.js's dmDigest/condNames), not the
        // sheet. dm.js's combat_start threads the CHARACTER object itself as pcRef.conditionsRef
        // (not a snapshotted array — engine.conditions' removeCondition reassigns holder.conditions
        // to a new array, so a captured array reference would go stale the first time a condition
        // lifts mid-fight; reading through the live object avoids that). Falls back to pcRef itself
        // (harmless no-op read of a likely-absent .conditions) for an older snapshot / narrow test
        // fixture that never set conditionsRef.
        conditionMods: theaterConditionModsFrom(pcRef.conditionsRef || pcRef)
      }));
  }
  ((combat.allies) || []).forEach((a, i) => {
    const silhouette = theaterClassSilhouetteFor(a.class);
    // an ally may carry ITS OWN equipped/inventory (a full sheet-backed companion) — same mirror,
    // same null-safe fallthrough as the PC branch above when equipped is absent (a bestiary-backed
    // ally with no sheet just keeps its statId->recipeSlug read, untouched by this unit).
    const pcRecipe = a.equipped ? pcRecipeFrom(a, a.class) : null;
    units.push(unitFor(a.id || ("ally" + (i + 1)), "ally", theaterArchetypeFor(a.creatureType, a.size, a.name),
      a.band || (combat.pc && combat.pc.band), a.lane || (combat.pc && combat.pc.lane),
      // MODEL-GRAMMAR G2: a bestiary-backed ally (a companion/sidekick resolved via resolveCreature,
      // which stamps statId — src/engine/combat.js's cmFoeFrom) carries the SAME statId->recipeSlug
      // read the foe branch below uses; an ally with no statId (a pure PC-sheet companion) gets
      // recipeSlug:null, which theater-boot.js's recipeFor treats as "no recipe" and falls through to
      // the class-silhouette archetype figure exactly as it did before this unit existed.
      {
        down: !!a.down, fled: !!a.fled, obliterated: !!a.obliterated,
        silhouette, weapon: theaterWeaponForClass(silhouette),
        recipeSlug: a.statId || null, pcRecipe, conditionMods: theaterConditionModsFrom(a),
        // P1' WHOLE-OBJECT WIRING (§2.4): same class-roster key as the PC branch above — an ally
        // with no class field (a pure bestiary-backed companion) gets null, falling through to its
        // recipeSlug/archetype build unchanged.
        className: a.class ? String(a.class).toLowerCase() : null
      }));
  });
  (combat.foes || []).forEach((f, i) => {
    units.push(unitFor(f.fid || ("f" + (i + 1)), "foe", theaterArchetypeFor(f.creatureType, f.size, f.name),
      f.band, f.lane,
      // MODEL-GRAMMAR G2: f.statId is the bestiary id cmFoeFrom stamped when this foe resolved off a
      // real BESTIARY entry (src/engine/combat.js) — the SAME key data/model-recipes.js's generator
      // used as its recipe slug (one bestiary id, one recipe, no separate mapping table to drift). A
      // quick-stats/statless walk-on foe (statId:null) simply gets recipeSlug:null, which
      // theater-boot.js's recipeFor/figureFor chain treats as "no recipe" — falls straight through to
      // today's archetype fallback, never a broken lookup.
      // MODEL-GRAMMAR G3 §2: foes carry conditionMods too (f.conditions is the existing shape combat
      // foes already use — see removeCondition/tickConditions call sites in dm.js).
      // REALM-WIRING §4: a realm-reskinned foe (src/engine/combat.js's combatFromEncounter, §4) carries
      // its OWN render model at f.modelKey (REALM_BESTIARY's `model` field) — preferred over f.statId
      // here so a realm creature can render as its own model independent of its stat chassis (frame).
      // resolveWholeObject/figureFor's existing precedence chain (class -> recipeSlug -> archetype
      // cuboid) is untouched; a `net-new: ...` modelKey (no whole-object module built yet) simply
      // fails resolveWholeObject's lookup and falls through to the cuboid fallback, same as any other
      // unresolvable slug — graceful, no special-casing needed here. A non-realm foe has no modelKey
      // (undefined), so `f.modelKey || f.statId || null` is byte-identical to today's `f.statId || null`.
      {
        down: !!f.down, fled: !!f.fled, obliterated: !!f.obliterated,
        weapon: theaterWeaponForFoe(f.name, f.actions),
        recipeSlug: f.modelKey || f.statId || null, conditionMods: theaterConditionModsFrom(f)
      }));
  });

  return { units };
}

/* ============================================================================
   TABLETOP-UNITS.md §U4 — CAST TABLEAU + ARRANGEMENT GRAMMAR (TABLETOP-VISION.md §3).
   Figures OUTSIDE combat: PC (+companions) + contacted here-NPCs (painted) + soft ambients
   (blank, per §U3) placed on the standing tray by a MECHANICAL arrangement archetype — no DM/
   model call anywhere in this file (SPEED). Combat is untouched: theaterUnitsFrom above stays
   the combat path; a future integration point (U6) swaps the unit SOURCE on combat_start/end,
   this file doesn't gate that switch.

   castFrom(w, source) -> units[] (same shape theaterUnitsFrom emits: {id,kind,archetype,x,z,
   silhouette?,className?,pcRecipe?,...}) gathers the cast from exactly the sources the spec
   names, then hands them to arrangeTableau for placement:
     - PC:            a local pc-ref derivation off w.characters (SAME shape src/world/dm.js's
                      combat_start assembles — {name,class,mods,ac,hp,hpCur,equipped,inventory,
                      conditionsRef} — deliberately NOT calling dm.js's livingSheet(), which
                      would be a same-direction-as-existing-warns but avoidable L1->L4 call;
                      this file already knows the shape, so it re-derives it locally instead).
     - companions:    prepEligibleCompanionCreatures(w) (prep.js:107-114) — codex creature
                      records at attitude>=1 the party travels with.
     - contacted npcs: codexHereNowIds(w,{atNodeId:source.hereNodeId}) rule 1 (the "at the
                      current node" rule, which already excludes untouched ambients) filtered
                      to kind:"npc" — these are the PAINTED figures.
     - soft ambients: codexAmbientPresenceFor(w, source.hereNodeId) — U3's shared co-location
                      derivation (the SAME function dm.js's digest calls, by reference) — its
                      `count` becomes that many blank:figure meeples. No individual record ref
                      per blank (the aggregate IS the digest-side presence line per §U3; a blank
                      meeple is anonymous by design until contact promotes it into the contacted-
                      npc source above on a later call).
   source = { hereNodeId, walking, shopOpen } — the three flags the arrangement rule below reads.
   All cross-module reads are call-time + typeof-guarded (this file's existing convention for
   cmZoneGrid/realmRenderProfile/etc.) — an absent w/records/companion helper degrades to an
   empty list, never a throw. PURE: no GS/w/U writes (§9.9); the same (w,source) snapshot always
   yields an identical unit list (§9.1) since nothing here rolls/reads the clock or Math.random. */
function theaterCastPcRefFrom(w){
  const chars = (w && w.characters) || [];
  const living = chars.filter(c => c && c.status === "living").slice(-1)[0];
  if(!living || !living.sheet) return null;
  const sh = living.sheet;
  return {
    name: living.name, class: sh.class, mods: sh.mods, ac: sh.ac, hp: sh.hp, hpCur: sh.hpCur,
    equipped: sh.equipped || null, inventory: sh.inventory || [], conditionsRef: living
  };
}

function castFrom(w, source){
  source = source || {};
  const hereNodeId = source.hereNodeId != null ? source.hereNodeId : null;
  const units = [];

  // PC (§U4: "PC via existing pc ref") — front-of-tray always, arrangeTableau stamps x/z.
  const pcRef = theaterCastPcRefFrom(w);
  if(pcRef){
    const silhouette = theaterClassSilhouetteFor(pcRef.class);
    const pcRecipe = pcRef.equipped ? pcRecipeFrom(pcRef, pcRef.class) : null;
    units.push({
      id: "pc", kind: "pc", archetype: theaterArchetypeFor("humanoid", null, null),
      x: 0, z: 0, silhouette, weapon: theaterWeaponForClass(silhouette), pcRecipe,
      className: pcRef.class ? String(pcRef.class).toLowerCase() : null,
      conditionMods: theaterConditionModsFrom(pcRef.conditionsRef || pcRef)
    });
  }

  // Companions — prepEligibleCompanionCreatures(w) (prep.js:107-114): codex creature records
  // the party travels with (attitude>=1). Read call-time/typeof-guarded — prep.js loads AFTER
  // this file in loadOrder, classic-script globals resolve fine at call time regardless.
  const companions = (typeof prepEligibleCompanionCreatures === "function") ? (prepEligibleCompanionCreatures(w) || []) : [];
  companions.forEach(r => {
    const archetype = theaterArchetypeFor((r.fields && r.fields.type) || null, (r.fields && r.fields.size) || null, r.name);
    units.push({ id: "ally:" + r.id, kind: "ally", archetype, x: 0, z: 0, ref: r.id, conditionMods: [] });
  });

  // Contacted here-NPCs (painted) — codexHereNowIds rule 1: records "at" hereNodeId, already
  // excluding untouched ambients (codex.js:415) — this IS the painted-vs-blank line (§U3).
  const contactedNpcs = [];
  if(typeof codexHereNowIds === "function" && typeof codexOf === "function"){
    const C = codexOf(w);
    const hereIds = codexHereNowIds(w, { atNodeId: hereNodeId });
    hereIds.forEach(id => {
      const r = C.records && C.records[id];
      if(r && r.kind === "npc") contactedNpcs.push(r);
    });
  }
  contactedNpcs.forEach(r => {
    const attitude = (typeof codexGetAttitude === "function") ? codexGetAttitude(w, r.id) : null;
    units.push({
      id: "npc:" + r.id, kind: "npc", archetype: theaterArchetypeFor(null, null, r.name),
      x: 0, z: 0, ref: r.id, attitude: attitude ? attitude.value : 0, conditionMods: []
    });
  });

  // Soft ambients (blank) — U3's shared derivation, called by REFERENCE (the same function
  // src/world/dm.js's digest calls) so the tray and the digest never drift apart on count.
  const ambient = (typeof codexAmbientPresenceFor === "function") ? codexAmbientPresenceFor(w, hereNodeId) : null;
  const ambientCount = ambient ? ambient.count : 0;
  for(let i = 0; i < ambientCount; i++){
    units.push({
      id: "ambient:" + (i + 1), kind: "ambient", archetype: "biped", x: 0, z: 0,
      blank: true, pieceKey: "blank:figure", conditionMods: []
    });
  }

  // Arrangement selection — MECHANICAL, no DM/model call (§U4 locked rule, priority-ordered):
  //   shop open -> shopfront; >1 contacted NPC -> ring; exactly 1 -> facing-pair;
  //   walking -> march; else -> vignette.
  let arrangement;
  if(source.shopOpen) arrangement = "shopfront";
  else if(contactedNpcs.length > 1) arrangement = "ring";
  else if(contactedNpcs.length === 1) arrangement = "facing-pair";
  else if(source.walking) arrangement = "march";
  else arrangement = "vignette";

  return arrangeTableau(units, arrangement);
}

/* THE ATTITUDE -> PLACEMENT TABLE (§U4 locked rule): "hostile = far + square-on, friendly =
   near + angled" — ONE numeric table, no per-NPC logic. Keyed by the codex attitude.value band
   (-2 hostile .. +2 helpful, src/world/codex.js's ATTITUDE_MIN/MAX). `dist` = distance from the
   PC/ring-center; `angle` (radians) = an additive facing nudge — 0 is square-on (facing the PC
   dead-on), a larger value reads as more "angled" (turned partly aside, less confrontational).
   theaterAttitudePlacementFor is TOTAL (never throws/undefined) — an out-of-table value (or a
   deliberately pruned table row, the §U4 mutation check) falls to the neutral default, which is
   NOT the hostile row's distance — this is what makes the mutation check bite: delete the "-2"
   row and a hostile NPC silently reads as neutral-distance instead of far. */
const THEATER_ATTITUDE_PLACEMENT = {
  "-2": { dist: 3.0, angle: 0 },      // hostile: far, square-on
  "-1": { dist: 2.5, angle: 0.15 },   // unfriendly/wary
  "0":  { dist: 2.0, angle: 0.3 },    // neutral/indifferent
  "1":  { dist: 1.5, angle: 0.45 },   // friendly
  "2":  { dist: 1.0, angle: 0.6 }     // helpful: near, angled
};
const THEATER_ATTITUDE_PLACEMENT_DEFAULT = { dist: 2.0, angle: 0.3 };
function theaterAttitudePlacementFor(value){
  const key = String(Math.max(-2, Math.min(2, Math.round(value || 0))));
  return THEATER_ATTITUDE_PLACEMENT[key] || THEATER_ATTITUDE_PLACEMENT_DEFAULT;
}

/* arrangeTableau(units, arrangement) -> units[] — PURE, stamps x/z (+ band/slot, additive
   layout metadata) onto a fresh copy of each unit; never mutates its input array/objects.
   arrangement in "facing-pair"|"ring"|"march"|"shopfront"|"vignette" (§U4 locked). Attitude
   (npc units only, via theaterAttitudePlacementFor) drives distance+facing inside facing-pair/
   ring ONLY, per the locked rule — the other three arrangements never read .attitude. */
function arrangeTableau(units, arrangement){
  const list = (units || []).map(u => Object.assign({}, u));
  const byKind = k => list.filter(u => u.kind === k);
  const pc = byKind("pc")[0] || null;
  const allies = byKind("ally");
  const npcs = byKind("npc");
  const ambients = byKind("ambient");

  const place = (u, x, z, band, slot) => { u.x = x; u.z = z; u.band = band; if(slot != null) u.slot = slot; };
  const spreadX = (n, i, step) => (i - (Math.max(n, 1) - 1) / 2) * step;

  if(arrangement === "shopfront"){
    // shop open -> the vendor row (contacted NPCs = the shopkeep/patrons already spoken to) sits
    // at the counter (z:0, "shopfront" slots, 1-based); ambients (unengaged browsers) hang back;
    // the PC stands closest to the viewer, front-center, browsing the counter from the front.
    if(pc) place(pc, 0, 2, "front-center");
    npcs.forEach((u, i) => place(u, spreadX(npcs.length, i, 1.4), 0, "shopfront", i + 1));
    allies.forEach((u, i) => place(u, spreadX(allies.length, i, 1.2), 1.4, "flank", i + 1));
    ambients.forEach((u, i) => place(u, spreadX(ambients.length, i, 1.2), -2, "back", i + 1));
  } else if(arrangement === "ring"){
    // >1 contacted NPC in conversation scope: the PC holds center, each NPC takes an even radial
    // slot around it — attitude nudges that NPC's own radius/facing (never anyone else's).
    if(pc) place(pc, 0, 0, "center");
    const n = npcs.length || 1;
    npcs.forEach((u, i) => {
      const pl = theaterAttitudePlacementFor(u.attitude);
      const angle = (i / n) * Math.PI * 2 + pl.angle;
      place(u, Math.sin(angle) * pl.dist, Math.cos(angle) * pl.dist, "ring", i + 1);
    });
    allies.forEach((u, i) => place(u, spreadX(allies.length, i, 1.0), -1.2, "flank", i + 1));
    ambients.forEach((u, i) => place(u, spreadX(ambients.length, i, 1.2), -2.4, "back", i + 1));
  } else if(arrangement === "facing-pair"){
    // exactly 1 contacted NPC: a direct face-off, attitude sets how far/angled they stand.
    if(pc) place(pc, 0, 0, "front-center");
    npcs.forEach(u => {
      const pl = theaterAttitudePlacementFor(u.attitude);
      place(u, Math.sin(pl.angle) * pl.dist, Math.cos(pl.angle) * pl.dist, "facing", 1);
    });
    allies.forEach((u, i) => place(u, spreadX(allies.length, i, 1.0), -1.0, "flank", i + 1));
    ambients.forEach((u, i) => place(u, spreadX(ambients.length, i, 1.2), -2.0, "back", i + 1));
  } else if(arrangement === "march"){
    // walking: single file, PC leads, companions/npcs/ambients trail in that order.
    if(pc) place(pc, 0, 0, "lead");
    let i = 0;
    allies.forEach(u => { i++; place(u, 0, -i * 1.2, "file", i); });
    npcs.forEach(u => { i++; place(u, 0, -i * 1.2, "file", i); });
    ambients.forEach(u => { i++; place(u, 0, -i * 1.2, "file", i); });
  } else {
    // vignette (default/fallback): a loose scattered group around the PC.
    if(pc) place(pc, 0, 0, "center");
    const rest = allies.concat(npcs, ambients);
    const n = rest.length || 1;
    rest.forEach((u, i) => {
      const angle = (i / n) * Math.PI * 2;
      place(u, Math.sin(angle) * 1.6, Math.cos(angle) * 1.6, "loose", i + 1);
    });
  }
  return list;
}
