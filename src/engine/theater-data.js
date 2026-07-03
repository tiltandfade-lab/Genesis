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
  [/candelabra|brazier.?stand|torch.?sconce/i, { part: "pillar-broken", params: { scale: 0.3, taper: true } }],
  // --- class (c): fountain/basin/font/cistern (large-scale only — small decorative basins stay on
  //     shrine-block per the audit's class-(b) mapping, checked further down) ---
  [/fountain|cistern|\btrough\b|\bfont\b|magical font/i, { part: "basin-block", params: {} }],
  // --- class (c): web / webbing mass ---
  // \bweb\b (not a bare "web" prefix-match) — "cobweb"/"webbed" false-positive otherwise. "webbing"/
  // "web-canopy" are still explicit alternatives since \bweb\b alone wouldn't catch those compounds.
  [/\bweb\b|webbing|web-canopy|cocoon|egg-sac/i, { part: "web-mass", params: {} }],
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
  // --- class (b): grate/drain (raised/broken variant only) -> rubble-scatter, flat footprint ---
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
    { part: "pillar-broken", params: { intact: false } }]
  // class (e)#2/#5/#6/#8/#9 (whole-room set pieces, maze/labyrinth segments, buildings-within-the-
  // walk, weather-scale phenomena, mundane-furniture Strange-band curiosities) are DELIBERATELY not
  // listed: the report's own resolution for each is "not a prop at all" (env-FX overlay, a
  // terrain_change map-layout flag, out of MODEL-GRAMMAR's scope entirely, or "route through the
  // EXISTING furniture-adjacent parts at normal scale" — which the table-slab/shrine-block/crate
  // rules above already cover without a bespoke entry).
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

/* the room-wide feature text pool: segment.feature.name + segment.feature.flavor (dungeon-walk.js's/
   wild-walk.js's own `feature:{name,flavor}` shape — a room-wide field, not per-zone, so this is
   computed ONCE per theaterBoardFrom call and reused for every zone rather than re-derived per zone). */
function theaterSegmentFeatureText(segment){
  const f = (segment && segment.feature) || null;
  if(!f) return "";
  return [f.name, f.flavor].filter(Boolean).join(" ");
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
   hazard patch still reads as one solid warning color, not diluted by alternation). */
function theaterBoardFrom(segment, scene, opts){
  scene = scene || {};
  opts = opts || {};
  const env = opts.env || THEATER_DEFAULT_ENV;
  const palette = theaterPaletteFor(env);
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

  const tiles = [];
  const props = [];
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
          const faceTint = altTop ? palette.altTop : tint;
          tiles.push({ x: wx, z: wz, h, kind, tint: faceTint, altTop, zone: zoneKey });
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
        const propHint = theaterPropForText(zoneCoverText) || theaterPropForText(zoneHazardKind) || theaterPropForText(featureText);
        const propEntry = {
          kind: "cover", zone: zoneKey,
          x: origin.x + (THEATER_PATCH - 1) / 2, z: origin.z + (THEATER_PATCH - 1) / 2,
          level: coverZones[zoneKey] === true ? "half" : coverZones[zoneKey]
        };
        if(propHint){
          propEntry.part = propHint.part;
          propEntry.partParams = propHint.params || {};
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

  return {
    tiles, props, env, light,
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
   anchors. Light = no armor module (leather-channel skin read only, matches §4 rule 4's own
   AC<=12-band "none" case); Medium = chest-plate; Heavy = the full chest-plate+pauldrons+
   helm-crest set (mirrors §4 rule 4's own AC18+ full-plate read, reapplied here off the SRD
   category string instead of a derived AC number). */
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
    if(partName) modules.push({ part: partName, anchor: "mainHand" });
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
        recipeSlug: a.statId || null, pcRecipe, conditionMods: theaterConditionModsFrom(a)
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
      {
        down: !!f.down, fled: !!f.fled, obliterated: !!f.obliterated,
        weapon: theaterWeaponForFoe(f.name, f.actions),
        recipeSlug: f.statId || null, conditionMods: theaterConditionModsFrom(f)
      }));
  });

  return { units };
}
