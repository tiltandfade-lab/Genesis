/* GENESIS MODULE — src/ui/theater-figures.js — P1' WHOLE-OBJECT REGISTRY (docs/P1-WIRING.md §2.3/§4
   Unit A step 2).

   PURE DATA + LOADER. Deliberately carries NO bare "three" import — every entry here is reached by
   dynamic import() at runtime (module path string + export name string), so this file itself never
   touches THREE/window/document and stays Node-importable for a plain ESM harness (dev/verify-
   theater-figures.mjs imports it directly, no jsdom/browser stub needed — mirrors dev/verify-model-
   parts.mjs's "zero DOM coupling" pattern for src/ui/theater-parts.js).

   R1 (docs/P1-WIRING.md §0.1): the creature modules stay authored IN PLACE under dev/model-qa/
   creatures/ — this file's registry `module` paths are relative to ITS OWN location (src/ui/), so
   "../../dev/model-qa/creatures/X.js" reaches them. The dev/model-qa/ authoring tree becomes a real
   runtime dependency of src/ui/ by this ruling; relocating the creature modules to src/ui/figures/
   is an OPTIONAL post-soak chore, not this unit (R1's own text).

   REGISTRY KEY VOCABULARY (§2.3):
     "class:<lowercase class>"   — PC/ally figures, keyed off theaterUnitsFrom's className stamp
     "<bestiary id>"             — foes, keyed off the EXACT bestiary id (== statId == recipe slug)
     "prop:<theater-data part name>" — walk-table props (theaterPropForText's `part` vocabulary)
     "light:<LIGHT_PROFILES key>"    — lighting props (prop-light.js; anchored in Unit B)

   Every entry: {module, fn, discR, opacity?, flameY?}. `module`/`fn` resolve the dynamic import;
   `discR` is the SAME base-disc radius the creature's own module bakes as its neutral disc (§1 size
   law: Small 0.32, Medium 0.42, big-Medium 0.48, Large 0.55, dragon 0.62, Huge 0.68) — read off
   dev/model-qa/sheets/INDEX.md's shipped size law + each bestiary entry's own `size` field, NOT
   re-derived from sizeScaleFor (D1: the whole-object path never applies sizeScaleFor at all — the
   module's own authored absolute size already encodes it). `opacity` mirrors the engine's own
   TRANSLUCENT_OPACITY precedent (theater-boot.js L1458, 0.45) for the incorporeal undead (wraith/
   shadow). `flameY` (lighting props only) is the world-space height of the prop's own flame/glow
   head in the prop's OWN geometry frame (read directly off dev/model-qa/creatures/prop-light.js's
   authored y-values), consumed by Unit B to source the live THREE.PointLight at the flame.

   NEAREST_SUB (R4): a STARTER table only — hand-drafted here, gated by the orchestrator at capture
   review, the full alias table riding Adam's evening ledger for taste amendments (§0.1). A bestiary
   slug absent from BOTH WHOLE_OBJECT_REGISTRY and NEAREST_SUB resolves to null (cuboid fallback,
   the auto-fallback chain figureFor already has — see docs/P1-WIRING.md §4 step 5). Every value here
   must point at a KEY THAT EXISTS in WHOLE_OBJECT_REGISTRY (validated by dev/verify-theater-figures.mjs
   check 1/3 — resolveWholeObject's own resolution-chain test). */

// -------- PCs: keyed "class:<lowercase class>" — all 12 SRD base classes (ps1-sheet SETS.classes) --------
const WHOLE_OBJECT_REGISTRY = {
  "class:fighter":   { module: "../../dev/model-qa/creatures/humanoid.js",     fn: "buildHumanoid",  discR: 0.42 },
  "class:barbarian": { module: "../../dev/model-qa/creatures/barbarian.js",    fn: "buildBarbarian", discR: 0.42 },
  "class:paladin":   { module: "../../dev/model-qa/creatures/paladin.js",      fn: "buildPaladin",   discR: 0.42 },
  "class:ranger":    { module: "../../dev/model-qa/creatures/ranger.js",       fn: "buildRanger",    discR: 0.42 },
  "class:rogue":     { module: "../../dev/model-qa/creatures/rogue.js",        fn: "buildRogue",     discR: 0.42 },
  "class:monk":      { module: "../../dev/model-qa/creatures/monk.js",         fn: "buildMonk",      discR: 0.42 },
  "class:cleric":    { module: "../../dev/model-qa/creatures/cleric_fable.js", fn: "buildCleric",    discR: 0.42 },
  "class:druid":     { module: "../../dev/model-qa/creatures/druid.js",        fn: "buildDruid",     discR: 0.42 },
  "class:wizard":    { module: "../../dev/model-qa/creatures/mage.js",         fn: "buildMage",      discR: 0.42 },
  "class:sorcerer":  { module: "../../dev/model-qa/creatures/sorcerer.js",     fn: "buildSorcerer",  discR: 0.42 },
  "class:warlock":   { module: "../../dev/model-qa/creatures/warlock.js",      fn: "buildWarlock",   discR: 0.42 },
  "class:bard":      { module: "../../dev/model-qa/creatures/bard.js",         fn: "buildBard",      discR: 0.42 },

  // -------- bestiary: keyed by the EXACT bestiary id (data/bestiary.js) — every mon-/npc-/var-
  // builder whose bestiary slug exists as a real id (validated by the harness, §7.1 check 1) --------
  "wolf":                { module: "../../dev/model-qa/creatures/mon-wolf.js",     fn: "buildWolf",         discR: 0.42 },
  "giant-rat":           { module: "../../dev/model-qa/creatures/mon-rat.js",      fn: "buildGiantRat",     discR: 0.32 },
  "goblin-warrior":       { module: "../../dev/model-qa/creatures/mon-goblin.js",  fn: "buildGoblin",       discR: 0.32 },
  "kobold":              { module: "../../dev/model-qa/creatures/mon-kobold.js",   fn: "buildKobold",       discR: 0.32 },
  "skeleton":            { module: "../../dev/model-qa/creatures/mon-skeleton.js", fn: "buildSkeleton",     discR: 0.42 },
  "zombie":              { module: "../../dev/model-qa/creatures/mon-zombie.js",   fn: "buildZombie",       discR: 0.42 },
  "giant-bat":           { module: "../../dev/model-qa/creatures/mon-bat.js",      fn: "buildGiantBat",     discR: 0.55 },
  "gray-ooze":           { module: "../../dev/model-qa/creatures/mon-ooze.js",     fn: "buildOoze",         discR: 0.42, opacity: 0.78 },
  "giant-spider":        { module: "../../dev/model-qa/creatures/spider.js",      fn: "buildSpider",       discR: 0.55 },
  "orc-warrior":         { module: "../../dev/model-qa/creatures/mon-orc.js",      fn: "buildOrc",          discR: 0.42 },
  "gnoll-warrior":       { module: "../../dev/model-qa/creatures/mon-gnoll.js",    fn: "buildGnoll",        discR: 0.42 },
  "bugbear-warrior":     { module: "../../dev/model-qa/creatures/mon-bugbear.js", fn: "buildBugbear",      discR: 0.42 },
  "ghoul":               { module: "../../dev/model-qa/creatures/mon-ghoul.js",    fn: "buildGhoul",        discR: 0.42 },
  "giant-constrictor-snake": { module: "../../dev/model-qa/creatures/mon-snake.js", fn: "buildGiantSnake",  discR: 0.68 },
  "harpy":               { module: "../../dev/model-qa/creatures/mon-harpy.js",    fn: "buildHarpy",        discR: 0.42 },
  "ogre":                { module: "../../dev/model-qa/creatures/mon-ogre.js",     fn: "buildOgre",         discR: 0.55 },
  "owlbear":             { module: "../../dev/model-qa/creatures/mon-owlbear.js",  fn: "buildOwlbear",      discR: 0.55 },
  "minotaur-of-the-horned-king": { module: "../../dev/model-qa/creatures/mon-minotaur.js", fn: "buildMinotaur", discR: 0.55 },
  "wight":               { module: "../../dev/model-qa/creatures/mon-wight.js",    fn: "buildWight",        discR: 0.42 },
  "gargoyle":            { module: "../../dev/model-qa/creatures/mon-gargoyle.js", fn: "buildGargoyle",     discR: 0.42 },
  "werewolf":            { module: "../../dev/model-qa/creatures/mon-werewolf.js", fn: "buildWerewolf",     discR: 0.42 },
  "troll":               { module: "../../dev/model-qa/creatures/mon-troll.js",    fn: "buildTroll",        discR: 0.55 },
  "hill-giant":          { module: "../../dev/model-qa/creatures/mon-giant.js",    fn: "buildHillGiant",    discR: 0.68 },
  "wraith":              { module: "../../dev/model-qa/creatures/mon-wraith.js",   fn: "buildWraith",       discR: 0.42, opacity: 0.45 },
  "stone-golem":         { module: "../../dev/model-qa/creatures/mon-golem.js",    fn: "buildGolem",        discR: 0.55 },
  "young-red-dragon":    { module: "../../dev/model-qa/creatures/mon-dragon.js",   fn: "buildYoungDragon",  discR: 0.62 },
  "mimic":               { module: "../../dev/model-qa/creatures/mon-mimic.js",    fn: "buildMimic",        discR: 0.42 },
  "animated-armor":      { module: "../../dev/model-qa/creatures/mon-armor.js",    fn: "buildAnimatedArmor", discR: 0.42 },
  "shadow":              { module: "../../dev/model-qa/creatures/mon-shadow.js",   fn: "buildShadow",       discR: 0.42, opacity: 0.45 },
  "fire-elemental":      { module: "../../dev/model-qa/creatures/mon-fireelem.js", fn: "buildFireElemental", discR: 0.55 },
  "earth-elemental":     { module: "../../dev/model-qa/creatures/mon-earthelem.js", fn: "buildEarthElemental", discR: 0.55 },
  "wyvern":              { module: "../../dev/model-qa/creatures/mon-wyvern.js",   fn: "buildWyvern",       discR: 0.55 },
  "dire-wolf":           { module: "../../dev/model-qa/creatures/var-direwolf.js", fn: "buildDireWolf",     discR: 0.55 },
  "worg":                { module: "../../dev/model-qa/creatures/var-worg.js",     fn: "buildWorg",         discR: 0.55 },
  "hobgoblin-soldier":   { module: "../../dev/model-qa/creatures/var-hobgoblin.js", fn: "buildHobgoblin",   discR: 0.42 },
  "cultist-fanatic":     { module: "../../dev/model-qa/creatures/var-fanatic.js",  fn: "buildCultFanatic",  discR: 0.42 },
  "giant-wolf-spider":   { module: "../../dev/model-qa/creatures/var-wolfspider.js", fn: "buildWolfSpider", discR: 0.42 },
  "warrior-veteran":     { module: "../../dev/model-qa/creatures/var-veteran.js",  fn: "buildVeteran",      discR: 0.42 },
  "commoner":            { module: "../../dev/model-qa/creatures/npc-commoner.js", fn: "buildCommoner",     discR: 0.42 },
  "guard":               { module: "../../dev/model-qa/creatures/npc-guard.js",    fn: "buildGuard",        discR: 0.42 },
  // NOTE: npc-shopkeep.js (buildShopkeep) has NO matching data/bestiary.js id — no foe/ally can ever
  // stamp a "shopkeeper" statId/recipeSlug, so it is deliberately NOT registered here (§2.3's
  // bestiary-keyed vocabulary is "the EXACT bestiary id" — there is no id to key against). It stays
  // available as an authored module for a future NPC-shape seam outside this unit's scope (§6).
  "noble":               { module: "../../dev/model-qa/creatures/npc-noble.js",   fn: "buildNoble",         discR: 0.42 },
  "cultist":             { module: "../../dev/model-qa/creatures/npc-cultist.js", fn: "buildCultist",       discR: 0.42 },
  "bandit":              { module: "../../dev/model-qa/creatures/npc-bandit.js", fn: "buildBandit",         discR: 0.42 },

  // -------- props: keyed "prop:<theater-data part name>" (src/engine/theater-data.js's
  // THEATER_PROP_KEYWORD_RULES vocabulary — see that file's own rule list for every `part` string) -----
  "prop:statue-figure": { module: "../../dev/model-qa/creatures/prop-statue.js", fn: "buildStatue",       discR: 0.42 },
  "prop:pillar-intact": { module: "../../dev/model-qa/creatures/prop-pillar.js", fn: "buildPillar",       discR: 0.42 },
  "prop:pillar-broken": { module: "../../dev/model-qa/creatures/prop-pillar.js", fn: "buildPillarBroken", discR: 0.42 },
  "prop:table-slab":    { module: "../../dev/model-qa/creatures/prop-table.js",  fn: "buildTable",        discR: 0.42 },
  "prop:throne-seat":   { module: "../../dev/model-qa/creatures/prop-throne.js", fn: "buildThrone",       discR: 0.42 },
  "prop:arch-frame":    { module: "../../dev/model-qa/creatures/prop-arch.js",   fn: "buildArchway",      discR: 0.42 },
  "prop:web-mass":      { module: "../../dev/model-qa/creatures/prop-web.js",    fn: "buildWebMass",      discR: 0.42 },
  "prop:well-shaft":    { module: "../../dev/model-qa/creatures/prop-well.js",   fn: "buildWell",         discR: 0.42 },
  "prop:crate":         { module: "../../dev/model-qa/creatures/prop-container.js", fn: "buildContainers", discR: 0.42 },
  "prop:cart":          { module: "../../dev/model-qa/creatures/prop-cart.js",   fn: "buildCart",         discR: 0.42 },
  "prop:shrine-block":  { module: "../../dev/model-qa/creatures/prop-altar.js",  fn: "buildAltar",        discR: 0.42 },
  // candelabra/brazier retarget (§4 Unit A step 7) — the THEATER_PROP_KEYWORD_RULES entry for
  // candelabra/brazier-stand/torch-sconce currently stamps a pillar-broken {scale:0.3,taper:true}
  // STAND-IN (theater-data.js has no bespoke "candelabra" part key of its own); this registry entry
  // lets setBoard route that SAME rule's part string at the real lighting-prop builder instead of
  // the pillar stand-in once Unit A step 7 retargets the rule (kept here so the registry already
  // carries the mapping the retarget will point at).
  "prop:candelabra":    { module: "../../dev/model-qa/creatures/prop-light.js",  fn: "buildCandelabra",   discR: 0.42 },

  // -------- lighting props: keyed "light:<LIGHT_PROFILES key>" (theater-boot.js's LIGHT_PROFILES
  // table) — Unit B anchors the rolled per-room light profile's point light at these. flameY read
  // directly off prop-light.js's own authored geometry (torch flame apex ~1.52-1.66u across its
  // layered tuft; lantern glow core center ~1.18u; candelabra center-candle tuft apex ~1.15u). -----
  "light:torchlit":  { module: "../../dev/model-qa/creatures/prop-light.js", fn: "buildTorch",       discR: 0.42, flameY: 1.4 },
  "light:lamplit":   { module: "../../dev/model-qa/creatures/prop-light.js", fn: "buildLanternPost", discR: 0.42, flameY: 1.18 },
  "light:lavalit":   { module: "../../dev/model-qa/creatures/prop-light.js", fn: "buildTorch",       discR: 0.42, flameY: 1.4 },
  "light:magic-glow":{ module: "../../dev/model-qa/creatures/prop-light.js", fn: "buildCandelabra",  discR: 0.42, flameY: 1.15 }
};

/* NEAREST-SUB (R4): starter table only. Each key is a bestiary id NOT covered above; each value MUST
   be a key that DOES resolve above (validated by dev/verify-theater-figures.mjs). Hand-drafted by
   silhouette-family resemblance ("like we do in real life" — MODEL-GRAMMAR §P1' ruling) — flagged
   below for the director's ledger (the full alias table is Adam's evening taste pass, §0.1 R4). A
   bestiary id absent from BOTH this table and the registry above falls through to the cuboid
   fallback, never a broken lookup (figureFor's existing chain). */
const NEAREST_SUB = {
  // canine/wolf-silhouette family -> wolf
  "winter-wolf": "wolf", "jackal": "wolf", "hyena": "wolf", "blink-dog": "wolf",
  // small vermin -> giant rat
  "giant-fire-beetle": "giant-rat", "swarm-of-rats": "giant-rat", "weasel": "giant-rat",
  // goblinoid family -> goblin-warrior (small greenskin)
  "goblin-minion": "goblin-warrior", "goblin-cutter-minion": "goblin-warrior",
  "goblin-boss": "goblin-warrior", "goblin-hexer": "goblin-warrior",
  // kobold family
  "kobold-inventor": "kobold", "winged-kobold-urd": "kobold",
  // undead-shambler family -> skeleton / zombie
  "skeleton-archer": "skeleton", "skeleton-warrior": "skeleton", "flaming-skeleton": "skeleton",
  "warhorse-skeleton": "skeleton", "minotaur-skeleton": "skeleton",
  "zombie-plague-carrier": "zombie", "ogre-zombie": "zombie", "eye-tyrant-zombie": "zombie",
  // flyer family -> giant bat
  "flying-snake": "giant-bat", "swarm-of-bats": "giant-bat",
  // ooze family
  "psychic-gray-ooze": "gray-ooze", "black-pudding": "gray-ooze",
  // arachnid family -> giant spider
  "phase-spider": "giant-spider", "spider": "giant-spider",
  // orc/gnoll/bugbear warband
  "orc-berserker": "orc-warrior", "orc-blind-prophet": "orc-warrior", "bandit-enforcer": "orc-warrior",
  "gnoll-pack-lord": "gnoll-warrior", "gnoll-fang-of-the-beast": "gnoll-warrior", "gnoll-demoniac": "gnoll-warrior",
  "bugbear-stalker": "bugbear-warrior", "bugbear-stalker-strangler": "bugbear-warrior",
  // ghoul family
  "lacedon-sodden-ghoul": "ghoul",
  // serpent family
  "constrictor-snake": "giant-constrictor-snake", "giant-venomous-snake": "giant-constrictor-snake",
  "venomous-snake": "giant-constrictor-snake",
  // harpy family
  "harpy-matriarch": "harpy",
  // ogre/troll/giant bulk family
  "half-ogre-ogrillon": "ogre", "ogre-howdah": "ogre", "troll-limb": "troll", "troll-amalgam": "troll",
  // owlbear/minotaur
  "primeval-owlbear": "owlbear", "owlbear-cub": "owlbear",
  // undead-commander family -> wight
  "wight-lord": "wight",
  // shapeshifter -> werewolf
  // (no additional werewolf variants in the current bestiary corpus)
  // dragon wave -> young red dragon stands in for every young/adult chromatic silhouette family
  "young-black-dragon": "young-red-dragon", "young-blue-dragon": "young-red-dragon",
  "young-brass-dragon": "young-red-dragon", "young-bronze-dragon": "young-red-dragon",
  "young-copper-dragon": "young-red-dragon", "young-green-dragon": "young-red-dragon",
  "young-silver-dragon": "young-red-dragon", "young-white-dragon": "young-red-dragon",
  "black-dragon-wyrmling": "young-red-dragon", "adult-black-dragon": "young-red-dragon", "ancient-black-dragon": "young-red-dragon",
  // mimic/construct family
  "greater-mimic": "mimic", "shield-guardian": "animated-armor",
  // incorporeal family -> wraith / shadow
  "greater-shadow": "shadow", "swamp-shadow": "shadow",
  // elemental family
  // (fire/earth elementals map 1:1 above; no additional variants in-corpus today)
  // wyvern family
  "ridden-wyvern": "wyvern",
  // wolf-adjacent variants -> dire-wolf/worg
  "dire-worg": "worg",
  // hobgoblin command chain -> hobgoblin-soldier
  "hobgoblin-captain": "hobgoblin-soldier", "hobgoblin-iron-shadow": "hobgoblin-soldier",
  // cultist/bandit civilian-warband family
  "death-cultist": "cultist-fanatic", "aberrant-cultist": "cultist-fanatic", "elemental-cultist": "cultist-fanatic",
  "fiend-cultist": "cultist-fanatic",
  "bandit-courier": "bandit", "bandit-captain": "bandit", "bandit-deceiver": "bandit",
  "bandit-crime-lord": "bandit", "desperate-bandit": "bandit",
  // spider variants -> giant wolf spider
  // (giant-wolf-spider maps 1:1 above)
  // veteran/guard command chain
  "guard-captain": "guard", "berserker": "warrior-veteran", "berserker-commander": "warrior-veteran"
};

/* resolveWholeObject(key): exact registry hit -> NEAREST_SUB alias (one hop only, resolved back
   through the registry) -> null. Never throws on an unknown/falsy key. */
export function resolveWholeObject(key){
  if(!key) return null;
  if(WHOLE_OBJECT_REGISTRY[key]) return WHOLE_OBJECT_REGISTRY[key];
  const sub = NEAREST_SUB[key];
  if(sub && WHOLE_OBJECT_REGISTRY[sub]) return WHOLE_OBJECT_REGISTRY[sub];
  return null;
}

/* loadWholeObjectBuilders(onSettled): dynamic-imports every registry module ONCE (deduped by module
   path — several registry entries share one module, e.g. prop-pillar.js/prop-light.js's multiple
   exports), each import wrapped in its own catch so ONE broken module never rejects the whole batch
   (that entry's `build` simply never gets populated -> resolveWholeObject still returns the entry
   object, but the caller's own "builder not loaded" guard, docs/P1-WIRING.md §4 step 5, skips it and
   falls through to the cuboid fallback). Calls onSettled() exactly once, after every distinct module
   has settled (loaded or failed) — never awaits forever on a hung import since dynamic import()
   itself is the only async boundary here. Idempotent-safe to call more than once (each call re-walks
   the registry and re-populates `build` fields; harmless, just redundant work) — theater-boot.js's
   own module-scope call site (§4 step 8) only calls it once. */
export function loadWholeObjectBuilders(onSettled){
  const byModule = {};
  Object.keys(WHOLE_OBJECT_REGISTRY).forEach(function(key){
    const entry = WHOLE_OBJECT_REGISTRY[key];
    (byModule[entry.module] || (byModule[entry.module] = [])).push(entry);
  });
  const modulePaths = Object.keys(byModule);
  let remaining = modulePaths.length;
  if(remaining === 0){ if(typeof onSettled === "function") onSettled(); return; }
  const settleOne = function(){
    remaining--;
    if(remaining <= 0 && typeof onSettled === "function") onSettled();
  };
  modulePaths.forEach(function(path){
    import(/* @vite-ignore */ path).then(function(mod){
      byModule[path].forEach(function(entry){
        const fn = mod && mod[entry.fn];
        if(typeof fn === "function") entry.build = fn;
      });
      settleOne();
    }).catch(function(){
      // a broken/missing module: every entry sharing this path simply stays unresolved (no `build`
      // populated) — never rejects the batch, per M2's mutation-test contract (§7.1).
      settleOne();
    });
  });
}

// exported for the harness + theater-boot.js's own defensive introspection (never mutated externally).
export { WHOLE_OBJECT_REGISTRY, NEAREST_SUB };
