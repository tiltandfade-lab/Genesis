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
  // -------- POLISH TAIL-WAVE bespoke additions (2026-07-04 QA review) --------
  "swarm-of-rats":       { module: "../../dev/model-qa/creatures/mon-ratswarm.js", fn: "buildRatSwarm",     discR: 0.42 },
  "giant-lizard":        { module: "../../dev/model-qa/creatures/mon-lizard.js",   fn: "buildGiantLizard",  discR: 0.55 },
  "ice-mephit":          { module: "../../dev/model-qa/creatures/mon-icemephit.js",fn: "buildIceMephit",    discR: 0.32 },
  "blind-deep-stalker":  { module: "../../dev/model-qa/creatures/mon-deepstalker.js", fn: "buildDeepStalker", discR: 0.42 },
  "needle-blight":       { module: "../../dev/model-qa/creatures/mon-needleblight.js", fn: "buildNeedleBlight", discR: 0.42 },
  "flaming-skeleton":    { module: "../../dev/model-qa/creatures/mon-skeleton.js", fn: "buildFlamingSkeleton", discR: 0.42 },
  "warhorse":            { module: "../../dev/model-qa/creatures/mon-horse.js",    fn: "buildHorse",        discR: 0.55 },
  "warhorse-skeleton":   { module: "../../dev/model-qa/creatures/mon-horse.js",    fn: "buildWarhorseSkeleton", discR: 0.55 },
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
  "light:magic-glow":{ module: "../../dev/model-qa/creatures/prop-light.js", fn: "buildCandelabra",  discR: 0.42, flameY: 1.15 },

  // ═══ CREATURE-MODELS-P2 Wave 1 (docs/CREATURE-MODELS-P2.md §5) — 4 net-new monstrosity models,
  //     keyed by exact bestiary id; a direct key wins over any NEAREST_SUB alias below. ═══
  "manticore":   { module: "../../dev/model-qa/creatures/mon-manticore.js",  fn: "buildManticore",  discR: 0.55 },
  "bulette":     { module: "../../dev/model-qa/creatures/mon-bulette.js",    fn: "buildBulette",    discR: 0.55 },
  "hook-horror": { module: "../../dev/model-qa/creatures/mon-hookhorror.js", fn: "buildHookHorror", discR: 0.55 },
  "purple-worm": { module: "../../dev/model-qa/creatures/mon-purpleworm.js", fn: "buildPurpleWorm", discR: 0.72 },

  // ═══ CREATURE-MODELS-P2 Waves 2-5 (docs/CREATURE-MODELS-P2.md §5) — the 62 remaining net-new
  //     monsters that finish the bestiary (monstrosity/aberration/fiend/celestial). ═══
  "chimera": { module: "../../dev/model-qa/creatures/mon-chimera.js", fn: "buildChimera", discR: 0.55 },
  "hydra": { module: "../../dev/model-qa/creatures/mon-hydra.js", fn: "buildHydra", discR: 0.68 },
  "kraken": { module: "../../dev/model-qa/creatures/mon-kraken.js", fn: "buildKraken", discR: 0.72 },
  "umber-hulk": { module: "../../dev/model-qa/creatures/mon-umberhulk.js", fn: "buildUmberHulk", discR: 0.55 },
  "displacer-beast": { module: "../../dev/model-qa/creatures/mon-displacerbeast.js", fn: "buildDisplacerBeast", discR: 0.55 },
  "behir": { module: "../../dev/model-qa/creatures/mon-behir.js", fn: "buildBehir", discR: 0.68 },
  "abominable-yeti": { module: "../../dev/model-qa/creatures/mon-abominableyeti.js", fn: "buildAbominableYeti", discR: 0.68 },
  "yeti": { module: "../../dev/model-qa/creatures/mon-yeti.js", fn: "buildYeti", discR: 0.55 },
  "ankheg": { module: "../../dev/model-qa/creatures/mon-ankheg.js", fn: "buildAnkheg", discR: 0.55 },
  "axe-beak": { module: "../../dev/model-qa/creatures/mon-axebeak.js", fn: "buildAxeBeak", discR: 0.55 },
  "giant-axe-beak": { module: "../../dev/model-qa/creatures/mon-giantaxebeak.js", fn: "buildGiantAxeBeak", discR: 0.68 },
  "carrion-crawler": { module: "../../dev/model-qa/creatures/mon-carrioncrawler.js", fn: "buildCarrionCrawler", discR: 0.55 },
  "remorhaz": { module: "../../dev/model-qa/creatures/mon-remorhaz.js", fn: "buildRemorhaz", discR: 0.68 },
  "drider": { module: "../../dev/model-qa/creatures/mon-drider.js", fn: "buildDrider", discR: 0.55 },
  "merrow": { module: "../../dev/model-qa/creatures/mon-merrow.js", fn: "buildMerrow", discR: 0.55 },
  "yuan-ti-abomination": { module: "../../dev/model-qa/creatures/mon-yuanti.js", fn: "buildYuanTiAbomination", discR: 0.55 },
  "tarrasque": { module: "../../dev/model-qa/creatures/mon-tarrasque.js", fn: "buildTarrasque", discR: 0.72 },
  "blue-chaos-frog": { module: "../../dev/model-qa/creatures/mon-chaosfrog-blue.js", fn: "buildBlueChaosFrog", discR: 0.55 },
  "green-chaos-frog": { module: "../../dev/model-qa/creatures/mon-chaosfrog-green.js", fn: "buildGreenChaosFrog", discR: 0.55 },
  "red-chaos-frog": { module: "../../dev/model-qa/creatures/mon-chaosfrog-red.js", fn: "buildRedChaosFrog", discR: 0.55 },
  "gray-chaos-frog": { module: "../../dev/model-qa/creatures/mon-chaosfrog-gray.js", fn: "buildGrayChaosFrog", discR: 0.42 },
  "death-chaos-frog": { module: "../../dev/model-qa/creatures/mon-chaosfrog-death.js", fn: "buildDeathChaosFrog", discR: 0.42 },
  "fish-folk": { module: "../../dev/model-qa/creatures/mon-fishfolk.js", fn: "buildFishFolk", discR: 0.42 },
  "fish-folk-monitor": { module: "../../dev/model-qa/creatures/mon-fishfolk-monitor.js", fn: "buildFishFolkMonitor", discR: 0.42 },
  "fish-folk-whip": { module: "../../dev/model-qa/creatures/mon-fishfolk-whip.js", fn: "buildFishFolkWhip", discR: 0.42 },
  "mind-thief": { module: "../../dev/model-qa/creatures/mon-mindthief.js", fn: "buildMindThief", discR: 0.42 },
  "mind-thief-arcanist": { module: "../../dev/model-qa/creatures/mon-mindthief-arcanist.js", fn: "buildMindThiefArcanist", discR: 0.42 },
  "void-monk-monk": { module: "../../dev/model-qa/creatures/mon-voidmonk-monk.js", fn: "buildVoidMonkMonk", discR: 0.42 },
  "void-monk-psion": { module: "../../dev/model-qa/creatures/mon-voidmonk-psion.js", fn: "buildVoidMonkPsion", discR: 0.42 },
  "void-monk-zerth": { module: "../../dev/model-qa/creatures/mon-voidmonk-zerth.js", fn: "buildVoidMonkZerth", discR: 0.42 },
  "grick": { module: "../../dev/model-qa/creatures/mon-grick.js", fn: "buildGrick", discR: 0.42 },
  "grick-ancient": { module: "../../dev/model-qa/creatures/mon-grick-ancient.js", fn: "buildGrickAncient", discR: 0.55 },
  "grell": { module: "../../dev/model-qa/creatures/mon-grell.js", fn: "buildGrell", discR: 0.42 },
  "roper": { module: "../../dev/model-qa/creatures/mon-roper.js", fn: "buildRoper", discR: 0.55 },
  "otyugh": { module: "../../dev/model-qa/creatures/mon-otyugh.js", fn: "buildOtyugh", discR: 0.55 },
  "cloaker": { module: "../../dev/model-qa/creatures/mon-cloaker.js", fn: "buildCloaker", discR: 0.55 },
  "eye-tyrant": { module: "../../dev/model-qa/creatures/mon-eyetyrant.js", fn: "buildEyeTyrant", discR: 0.55 },
  "elder-deep-thing": { module: "../../dev/model-qa/creatures/mon-elderdeepthing.js", fn: "buildElderDeepThing", discR: 0.55 },
  "astral-raider-dracomancer": { module: "../../dev/model-qa/creatures/mon-astralraider.js", fn: "buildAstralRaiderDracomancer", discR: 0.42 },
  "erinyes": { module: "../../dev/model-qa/creatures/mon-erinyes.js", fn: "buildErinyes", discR: 0.42 },
  "succubus": { module: "../../dev/model-qa/creatures/mon-succubus.js", fn: "buildSuccubus", discR: 0.42 },
  "incubus": { module: "../../dev/model-qa/creatures/mon-incubus.js", fn: "buildIncubus", discR: 0.42 },
  "cambion": { module: "../../dev/model-qa/creatures/mon-cambion.js", fn: "buildCambion", discR: 0.42 },
  "barbed-devil": { module: "../../dev/model-qa/creatures/mon-barbeddevil.js", fn: "buildBarbedDevil", discR: 0.42 },
  "chain-devil": { module: "../../dev/model-qa/creatures/mon-chaindevil.js", fn: "buildChainDevil", discR: 0.42 },
  "lemure": { module: "../../dev/model-qa/creatures/mon-lemure.js", fn: "buildLemure", discR: 0.42 },
  "manes-vaporspawn": { module: "../../dev/model-qa/creatures/mon-manes.js", fn: "buildManesVaporspawn", discR: 0.42 },
  "mezzoloth": { module: "../../dev/model-qa/creatures/mon-mezzoloth.js", fn: "buildMezzoloth", discR: 0.42 },
  "arcanaloth": { module: "../../dev/model-qa/creatures/mon-arcanaloth.js", fn: "buildArcanaloth", discR: 0.42 },
  "ultroloth": { module: "../../dev/model-qa/creatures/mon-ultroloth.js", fn: "buildUltroloth", discR: 0.42 },
  "yochlol": { module: "../../dev/model-qa/creatures/mon-yochlol.js", fn: "buildYochlol", discR: 0.42 },
  "night-hag": { module: "../../dev/model-qa/creatures/mon-nighthag.js", fn: "buildNightHag", discR: 0.42 },
  "rakshasa": { module: "../../dev/model-qa/creatures/mon-rakshasa.js", fn: "buildRakshasa", discR: 0.42 },
  "deva": { module: "../../dev/model-qa/creatures/mon-deva.js", fn: "buildDeva", discR: 0.42 },
  "planetar": { module: "../../dev/model-qa/creatures/mon-planetar.js", fn: "buildPlanetar", discR: 0.55 },
  "solar": { module: "../../dev/model-qa/creatures/mon-solar.js", fn: "buildSolar", discR: 0.55 },
  "empyrean": { module: "../../dev/model-qa/creatures/mon-empyrean.js", fn: "buildEmpyrean", discR: 0.68 },
  "empyrean-iota": { module: "../../dev/model-qa/creatures/mon-empyrean-iota.js", fn: "buildEmpyreanIota", discR: 0.42 },
  "sphinx-of-lore": { module: "../../dev/model-qa/creatures/mon-sphinx-lore.js", fn: "buildSphinxOfLore", discR: 0.55 },
  "sphinx-of-secrets": { module: "../../dev/model-qa/creatures/mon-sphinx-secrets.js", fn: "buildSphinxOfSecrets", discR: 0.55 },
  "sphinx-of-valor": { module: "../../dev/model-qa/creatures/mon-sphinx-valor.js", fn: "buildSphinxOfValor", discR: 0.55 },
  "unicorn": { module: "../../dev/model-qa/creatures/mon-unicorn.js", fn: "buildUnicorn", discR: 0.55 },


  // ═══ REALM-MODELS wave p3-lost-world (lost-world realm, 54 net-new creatures) — whole-object
  //     models keyed by their own slug; realm-bestiary-draft.json model field points here. ═══
  "rlm-sickle-toed-ambush-runner": { module: "../../dev/model-qa/creatures/rlm-sickle-toed-ambush-runner.js", fn: "buildSickleToedAmbushRunner", discR: 0.42 },
  "rlm-loose-jointed-tomb-archer": { module: "../../dev/model-qa/creatures/rlm-loose-jointed-tomb-archer.js", fn: "buildLooseJointedTombArcher", discR: 0.42 },
  "rlm-dune-coiled-fang-serpent": { module: "../../dev/model-qa/creatures/rlm-dune-coiled-fang-serpent.js", fn: "buildDuneCoiledFangSerpent", discR: 0.42 },
  "rlm-constrictor-of-the-choked-aqueduct": { module: "../../dev/model-qa/creatures/rlm-constrictor-of-the-choked-aqueduct.js", fn: "buildConstrictorOfTheChokedAqueduct", discR: 0.55 },
  "rlm-dead-tongue-initiate": { module: "../../dev/model-qa/creatures/rlm-dead-tongue-initiate.js", fn: "buildDeadTongueInitiate", discR: 0.42 },
  "rlm-idol-cracked-jackal": { module: "../../dev/model-qa/creatures/rlm-idol-cracked-jackal.js", fn: "buildIdolCrackedJackal", discR: 0.32 },
  "rlm-grave-wasp-nest-cluster": { module: "../../dev/model-qa/creatures/rlm-grave-wasp-nest-cluster.js", fn: "buildGraveWaspNestCluster", discR: 0.42 },
  "rlm-chittering-reliquary-swarm": { module: "../../dev/model-qa/creatures/rlm-chittering-reliquary-swarm.js", fn: "buildChitteringReliquarySwarm", discR: 0.42 },
  "rlm-rope-fanged-pit-viper": { module: "../../dev/model-qa/creatures/rlm-rope-fanged-pit-viper.js", fn: "buildRopeFangedPitViper", discR: 0.32 },
  "rlm-choke-vine-ambusher": { module: "../../dev/model-qa/creatures/rlm-choke-vine-ambusher.js", fn: "buildChokeVineAmbusher", discR: 0.42 },
  "rlm-spore-choked-idol-fungus": { module: "../../dev/model-qa/creatures/rlm-spore-choked-idol-fungus.js", fn: "buildSporeChokedIdolFungus", discR: 0.42 },
  "rlm-broken-fang-wererat-tomb-rat": { module: "../../dev/model-qa/creatures/rlm-broken-fang-wererat-tomb-rat.js", fn: "buildBrokenFangWereratTombRat", discR: 0.42 },
  "rlm-stalking-sand-ambusher": { module: "../../dev/model-qa/creatures/rlm-stalking-sand-ambusher.js", fn: "buildStalkingSandAmbusher", discR: 0.55 },
  "rlm-petrifying-serpent-crowned-guardian": { module: "../../dev/model-qa/creatures/rlm-petrifying-serpent-crowned-guardian.js", fn: "buildPetrifyingSerpentCrownedGuardian", discR: 0.42 },
  "rlm-vulture-headed-carrion-priest": { module: "../../dev/model-qa/creatures/rlm-vulture-headed-carrion-priest.js", fn: "buildVultureHeadedCarrionPriest", discR: 0.42 },
  "rlm-blazing-ember-skull-oracle": { module: "../../dev/model-qa/creatures/rlm-blazing-ember-skull-oracle.js", fn: "buildBlazingEmberSkullOracle", discR: 0.32 },
  "rlm-vault-sworn-ettin-doorkeeper": { module: "../../dev/model-qa/creatures/rlm-vault-sworn-ettin-doorkeeper.js", fn: "buildVaultSwornEttinDoorkeeper", discR: 0.55 },
  "rlm-weretiger-jungle-stalker": { module: "../../dev/model-qa/creatures/rlm-weretiger-jungle-stalker.js", fn: "buildWeretigerJungleStalker", discR: 0.42 },
  "rlm-ash-grey-ochre-seep": { module: "../../dev/model-qa/creatures/rlm-ash-grey-ochre-seep.js", fn: "buildAshGreyOchreSeep", discR: 0.55 },
  "rlm-hollow-coffer-gelatinous-vault": { module: "../../dev/model-qa/creatures/rlm-hollow-coffer-gelatinous-vault.js", fn: "buildHollowCofferGelatinousVault", discR: 0.55 },
  "rlm-chain-bound-barrow-ghast": { module: "../../dev/model-qa/creatures/rlm-chain-bound-barrow-ghast.js", fn: "buildChainBoundBarrowGhast", discR: 0.42 },
  "rlm-bandaged-falconry-ghast": { module: "../../dev/model-qa/creatures/rlm-bandaged-falconry-ghast.js", fn: "buildBandagedFalconryGhast", discR: 0.42 },
  "rlm-toppled-minotaur-skeleton-guard": { module: "../../dev/model-qa/creatures/rlm-toppled-minotaur-skeleton-guard.js", fn: "buildToppledMinotaurSkeletonGuard", discR: 0.55 },
  "rlm-grave-silk-poltergeist": { module: "../../dev/model-qa/creatures/rlm-grave-silk-poltergeist.js", fn: "buildGraveSilkPoltergeist", discR: 0.42 },
  "rlm-zombie-herd-elephant-carrier": { module: "../../dev/model-qa/creatures/rlm-zombie-herd-elephant-carrier.js", fn: "buildZombieHerdElephantCarrier", discR: 0.55 },
  "rlm-snake-cult-priest-of-the-hollow-coil": { module: "../../dev/model-qa/creatures/rlm-snake-cult-priest-of-the-hollow-coil.js", fn: "buildSnakeCultPriestOfTheHollowCoil", discR: 0.42 },
  "rlm-sacrificial-blind-prophet": { module: "../../dev/model-qa/creatures/rlm-sacrificial-blind-prophet.js", fn: "buildSacrificialBlindProphet", discR: 0.42 },
  "rlm-wrapped-gladiator-of-the-sun-pit": { module: "../../dev/model-qa/creatures/rlm-wrapped-gladiator-of-the-sun-pit.js", fn: "buildWrappedGladiatorOfTheSunPit", discR: 0.42 },
  "rlm-shambling-garden-overgrowth": { module: "../../dev/model-qa/creatures/rlm-shambling-garden-overgrowth.js", fn: "buildShamblingGardenOvergrowth", discR: 0.55 },
  "rlm-ashen-vampire-spawn-handmaiden": { module: "../../dev/model-qa/creatures/rlm-ashen-vampire-spawn-handmaiden.js", fn: "buildAshenVampireSpawnHandmaiden", discR: 0.42 },
  "rlm-wight-lord-of-the-processional-guard": { module: "../../dev/model-qa/creatures/rlm-wight-lord-of-the-processional-guard.js", fn: "buildWightLordOfTheProcessionalGuard", discR: 0.42 },
  "rlm-storm-song-satyr-revelmaster-of-ruins": { module: "../../dev/model-qa/creatures/rlm-storm-song-satyr-revelmaster-of-ruins.js", fn: "buildStormSongSatyrRevelmasterOfRuins", discR: 0.42 },
  "rlm-hollow-throated-vrock-carrion-caller": { module: "../../dev/model-qa/creatures/rlm-hollow-throated-vrock-carrion-caller.js", fn: "buildHollowThroatedVrockCarrionCaller", discR: 0.55 },
  "rlm-serpent-sworn-lamia-of-the-oasis-court": { module: "../../dev/model-qa/creatures/rlm-serpent-sworn-lamia-of-the-oasis-court.js", fn: "buildSerpentSwornLamiaOfTheOasisCourt", discR: 0.55 },
  "rlm-basalt-skinned-gorgon-of-the-sun-gate": { module: "../../dev/model-qa/creatures/rlm-basalt-skinned-gorgon-of-the-sun-gate.js", fn: "buildBasaltSkinnedGorgonOfTheSunGate", discR: 0.55 },
  "rlm-petrified-roc-of-the-high-terraces": { module: "../../dev/model-qa/creatures/rlm-petrified-roc-of-the-high-terraces.js", fn: "buildPetrifiedRocOfTheHighTerraces", discR: 0.72 },
  "rlm-efreeti-bound-to-the-eternal-forge-idol": { module: "../../dev/model-qa/creatures/rlm-efreeti-bound-to-the-eternal-forge-idol.js", fn: "buildEfreetiBoundToTheEternalForgeIdol", discR: 0.55 },
  "rlm-cyclops-oracle-of-the-buried-eye": { module: "../../dev/model-qa/creatures/rlm-cyclops-oracle-of-the-buried-eye.js", fn: "buildCyclopsOracleOfTheBuriedEye", discR: 0.68 },
  "rlm-marble-veined-storm-giant-excavator": { module: "../../dev/model-qa/creatures/rlm-marble-veined-storm-giant-excavator.js", fn: "buildMarbleVeinedStormGiantExcavator", discR: 0.68 },
  "rlm-death-cultist-herald-of-the-buried-sun": { module: "../../dev/model-qa/creatures/rlm-death-cultist-herald-of-the-buried-sun.js", fn: "buildDeathCultistHeraldOfTheBuriedSun", discR: 0.42 },
  "rlm-archpriest-of-the-dead-liturgy": { module: "../../dev/model-qa/creatures/rlm-archpriest-of-the-dead-liturgy.js", fn: "buildArchpriestOfTheDeadLiturgy", discR: 0.42 },
  "rlm-bone-crowned-death-knight-of-the-ziggurat": { module: "../../dev/model-qa/creatures/rlm-bone-crowned-death-knight-of-the-ziggurat.js", fn: "buildBoneCrownedDeathKnightOfTheZiggurat", discR: 0.42 },
  "rlm-vault-sealed-naga-of-the-bone-archive": { module: "../../dev/model-qa/creatures/rlm-vault-sealed-naga-of-the-bone-archive.js", fn: "buildVaultSealedNagaOfTheBoneArchive", discR: 0.55 },
  "rlm-the-undying-ape-colossus-of-the-sacred-grove": { module: "../../dev/model-qa/creatures/rlm-the-undying-ape-colossus-of-the-sacred-grove.js", fn: "buildTheUndyingApeColossusOfTheSacredGrove", discR: 0.72 },
  "rlm-dragon-turtle-of-the-drowned-necropolis": { module: "../../dev/model-qa/creatures/rlm-dragon-turtle-of-the-drowned-necropolis.js", fn: "buildDragonTurtleOfTheDrownedNecropolis", discR: 0.72 },
  "rlm-the-first-priest-king-undying": { module: "../../dev/model-qa/creatures/rlm-the-first-priest-king-undying.js", fn: "buildTheFirstPriestKingUndying", discR: 0.32 },
  "rlm-emperor-wyrm-of-the-sunken-ziggurat": { module: "../../dev/model-qa/creatures/rlm-emperor-wyrm-of-the-sunken-ziggurat.js", fn: "buildEmperorWyrmOfTheSunkenZiggurat", discR: 0.72 },
  "rlm-the-sphinx-warden": { module: "../../dev/model-qa/creatures/rlm-the-sphinx-warden.js", fn: "buildTheSphinxWarden", discR: 0.55 },
  "rlm-anubiss-jackal-priest": { module: "../../dev/model-qa/creatures/rlm-anubiss-jackal-priest.js", fn: "buildAnubissJackalPriest", discR: 0.42 },
  "rlm-gilgameshs-shade": { module: "../../dev/model-qa/creatures/rlm-gilgameshs-shade.js", fn: "buildGilgameshsShade", discR: 0.42 },
  "rlm-humbaba": { module: "../../dev/model-qa/creatures/rlm-humbaba.js", fn: "buildHumbaba", discR: 0.68 },
  "rlm-grendel": { module: "../../dev/model-qa/creatures/rlm-grendel.js", fn: "buildGrendel", discR: 0.55 },
  "rlm-grendels-mother": { module: "../../dev/model-qa/creatures/rlm-grendels-mother.js", fn: "buildGrendelsMother", discR: 0.55 },
  "rlm-raptor-pack-hunter": { module: "../../dev/model-qa/creatures/rlm-raptor-pack-hunter.js", fn: "buildRaptorPackHunter", discR: 0.42 },

  // ═══ REALM-MODELS wave p3-ash (ash realm, 50 net-new creatures) — whole-object
  //     models keyed by their own slug; realm-bestiary-draft.json model field points here. ═══
  "barrens-jackal": { module: "../../dev/model-qa/creatures/rlm-barrens-jackal.js", fn: "buildBarrensJackal", discR: 0.42 },
  "fallout-toad": { module: "../../dev/model-qa/creatures/rlm-fallout-toad.js", fn: "buildFalloutToad", discR: 0.42 },
  "wasteland-scrapper": { module: "../../dev/model-qa/creatures/rlm-wasteland-scrapper.js", fn: "buildWastelandScrapper", discR: 0.42 },
  "ration-raider": { module: "../../dev/model-qa/creatures/rlm-ration-raider.js", fn: "buildRationRaider", discR: 0.42 },
  "wire-fanged-cur": { module: "../../dev/model-qa/creatures/rlm-wire-fanged-cur.js", fn: "buildWireFangedCur", discR: 0.42 },
  "blister-skin-drifter": { module: "../../dev/model-qa/creatures/rlm-blister-skin-drifter.js", fn: "buildBlisterSkinDrifter", discR: 0.42 },
  "chem-slick-viper": { module: "../../dev/model-qa/creatures/rlm-chem-slick-viper.js", fn: "buildChemSlickViper", discR: 0.42 },
  "grit-locust-cloud": { module: "../../dev/model-qa/creatures/rlm-grit-locust-cloud.js", fn: "buildGritLocustCloud", discR: 0.42 },
  "tanker-ganger": { module: "../../dev/model-qa/creatures/rlm-tanker-ganger.js", fn: "buildTankerGanger", discR: 0.42 },
  "corroded-watcher": { module: "../../dev/model-qa/creatures/rlm-corroded-watcher.js", fn: "buildCorrodedWatcher", discR: 0.42 },
  "static-touched-vermin": { module: "../../dev/model-qa/creatures/rlm-static-touched-vermin.js", fn: "buildStaticTouchedVermin", discR: 0.32 },
  "wreck-diver": { module: "../../dev/model-qa/creatures/rlm-wreck-diver.js", fn: "buildWreckDiver", discR: 0.42 },
  "fuel-cult-bruiser": { module: "../../dev/model-qa/creatures/rlm-fuel-cult-bruiser.js", fn: "buildFuelCultBruiser", discR: 0.42 },
  "ash-widow-broodmother": { module: "../../dev/model-qa/creatures/rlm-ash-widow-broodmother.js", fn: "buildAshWidowBroodmother", discR: 0.55 },
  "warlords-duelist": { module: "../../dev/model-qa/creatures/rlm-warlords-duelist.js", fn: "buildWarlordsDuelist", discR: 0.42 },
  "bloat-ghast-preacher": { module: "../../dev/model-qa/creatures/rlm-bloat-ghast-preacher.js", fn: "buildBloatGhastPreacher", discR: 0.42 },
  "convoy-breaker": { module: "../../dev/model-qa/creatures/rlm-convoy-breaker.js", fn: "buildConvoyBreaker", discR: 0.42 },
  "warp-chitin-stalker": { module: "../../dev/model-qa/creatures/rlm-warp-chitin-stalker.js", fn: "buildWarpChitinStalker", discR: 0.42 },
  "rig-mounted-turret-hound": { module: "../../dev/model-qa/creatures/rlm-rig-mounted-turret-hound.js", fn: "buildRigMountedTurretHound", discR: 0.42 },
  "fume-choked-ettin": { module: "../../dev/model-qa/creatures/rlm-fume-choked-ettin.js", fn: "buildFumeChokedEttin", discR: 0.55 },
  "vault-sealed-revenant": { module: "../../dev/model-qa/creatures/rlm-vault-sealed-revenant.js", fn: "buildVaultSealedRevenant", discR: 0.42 },
  "warband-chieftain": { module: "../../dev/model-qa/creatures/rlm-warband-chieftain.js", fn: "buildWarbandChieftain", discR: 0.42 },
  "molten-vat-ooze": { module: "../../dev/model-qa/creatures/rlm-molten-vat-ooze.js", fn: "buildMoltenVatOoze", discR: 0.55 },
  "piston-arm-enforcer": { module: "../../dev/model-qa/creatures/rlm-piston-arm-enforcer.js", fn: "buildPistonArmEnforcer", discR: 0.42 },
  "ashborn-wyrmling-mutant": { module: "../../dev/model-qa/creatures/rlm-ashborn-wyrmling-mutant.js", fn: "buildAshbornWyrmlingMutant", discR: 0.55 },
  "bomb-cult-high-priest": { module: "../../dev/model-qa/creatures/rlm-bomb-cult-high-priest.js", fn: "buildBombCultHighPriest", discR: 0.42 },
  "furnace-bound-salamander": { module: "../../dev/model-qa/creatures/rlm-furnace-bound-salamander.js", fn: "buildFurnaceBoundSalamander", discR: 0.55 },
  "diesel-pit-fighter": { module: "../../dev/model-qa/creatures/rlm-diesel-pit-fighter.js", fn: "buildDieselPitFighter", discR: 0.42 },
  "junk-titan-enforcer": { module: "../../dev/model-qa/creatures/rlm-junk-titan-enforcer.js", fn: "buildJunkTitanEnforcer", discR: 0.55 },
  "toxin-blood-oni-raider": { module: "../../dev/model-qa/creatures/rlm-toxin-blood-oni-raider.js", fn: "buildToxinBloodOniRaider", discR: 0.55 },
  "scrap-hound-alpha": { module: "../../dev/model-qa/creatures/rlm-scrap-hound-alpha.js", fn: "buildScrapHoundAlpha", discR: 0.42 },
  "warlords-bodyguard": { module: "../../dev/model-qa/creatures/rlm-warlords-bodyguard.js", fn: "buildWarlordsBodyguard", discR: 0.42 },
  "contagion-ghast-broodkeeper": { module: "../../dev/model-qa/creatures/rlm-contagion-ghast-broodkeeper.js", fn: "buildContagionGhastBroodkeeper", discR: 0.42 },
  "detonation-engineer": { module: "../../dev/model-qa/creatures/rlm-detonation-engineer.js", fn: "buildDetonationEngineer", discR: 0.42 },
  "iron-convoy-behemoth": { module: "../../dev/model-qa/creatures/rlm-iron-convoy-behemoth.js", fn: "buildIronConvoyBehemoth", discR: 0.68 },
  "cinderfall-vampire-warlord": { module: "../../dev/model-qa/creatures/rlm-cinderfall-vampire-warlord.js", fn: "buildCinderfallVampireWarlord", discR: 0.42 },
  "bunker-bred-nightmare-steed": { module: "../../dev/model-qa/creatures/rlm-bunker-bred-nightmare-steed.js", fn: "buildBunkerBredNightmareSteed", discR: 0.55 },
  "grand-warlords-champion": { module: "../../dev/model-qa/creatures/rlm-grand-warlords-champion.js", fn: "buildGrandWarlordsChampion", discR: 0.42 },
  "vaultbreaker-behemoth": { module: "../../dev/model-qa/creatures/rlm-vaultbreaker-behemoth.js", fn: "buildVaultbreakerBehemoth", discR: 0.68 },
  "deathwatch-cult-oracle": { module: "../../dev/model-qa/creatures/rlm-deathwatch-cult-oracle.js", fn: "buildDeathwatchCultOracle", discR: 0.42 },
  "blightborn-roc": { module: "../../dev/model-qa/creatures/rlm-blightborn-roc.js", fn: "buildBlightbornRoc", discR: 0.72 },
  "devouring-junkyard-kraken": { module: "../../dev/model-qa/creatures/rlm-devouring-junkyard-kraken.js", fn: "buildDevouringJunkyardKraken", discR: 0.68 },
  "the-countdown-keeper": { module: "../../dev/model-qa/creatures/rlm-the-countdown-keeper.js", fn: "buildTheCountdownKeeper", discR: 0.42 },
  "the-warlord-ascendant": { module: "../../dev/model-qa/creatures/rlm-the-warlord-ascendant.js", fn: "buildTheWarlordAscendant", discR: 0.42 },
  "the-fallout-titan": { module: "../../dev/model-qa/creatures/rlm-the-fallout-titan.js", fn: "buildTheFalloutTitan", discR: 0.72 },
  "the-last-detonation": { module: "../../dev/model-qa/creatures/rlm-the-last-detonation.js", fn: "buildTheLastDetonation", discR: 0.72 },
  "chem-baron": { module: "../../dev/model-qa/creatures/rlm-chem-baron.js", fn: "buildChemBaron", discR: 0.42 },
  "the-sermon-bearer": { module: "../../dev/model-qa/creatures/rlm-the-sermon-bearer.js", fn: "buildTheSermonBearer", discR: 0.42 },
  "deadmans-warlord": { module: "../../dev/model-qa/creatures/rlm-deadmans-warlord.js", fn: "buildDeadmansWarlord", discR: 0.42 },
  "the-foundry-made-flesh": { module: "../../dev/model-qa/creatures/rlm-the-foundry-made-flesh.js", fn: "buildTheFoundryMadeFlesh", discR: 0.72 },

  // ═══ REALM-MODELS wave p3-theater (theater-of-war realm cluster: jungle/musket/longship/trench/
  //     siege bands, 39 net-new creatures) — whole-object models keyed by their own slug;
  //     realm-bestiary-draft.json model field points here. ═══
  "rlm-barbed-kill-zone-tangle": { module: "../../dev/model-qa/creatures/rlm-barbed-kill-zone-tangle.js", fn: "buildBarbedKillZoneTangle", discR: 0.42 },
  "rlm-musket-skirmisher": { module: "../../dev/model-qa/creatures/rlm-musket-skirmisher.js", fn: "buildMusketSkirmisher", discR: 0.42 },
  "rlm-longship-thrall": { module: "../../dev/model-qa/creatures/rlm-longship-thrall.js", fn: "buildLongshipThrall", discR: 0.42 },
  "rlm-jungle-leech-thing": { module: "../../dev/model-qa/creatures/rlm-jungle-leech-thing.js", fn: "buildJungleLeechThing", discR: 0.32 },
  "rlm-shell-shocked-wanderer": { module: "../../dev/model-qa/creatures/rlm-shell-shocked-wanderer.js", fn: "buildShellShockedWanderer", discR: 0.42 },
  "rlm-musket-line-drummer-boy": { module: "../../dev/model-qa/creatures/rlm-musket-line-drummer-boy.js", fn: "buildMusketLineDrummerBoy", discR: 0.32 },
  "rlm-musket-volley-ghost": { module: "../../dev/model-qa/creatures/rlm-musket-volley-ghost.js", fn: "buildMusketVolleyGhost", discR: 0.42 },
  "rlm-jungle-war-dog": { module: "../../dev/model-qa/creatures/rlm-jungle-war-dog.js", fn: "buildJungleWarDog", discR: 0.42 },
  "rlm-mustard-fog-sprite": { module: "../../dev/model-qa/creatures/rlm-mustard-fog-sprite.js", fn: "buildMustardFogSprite", discR: 0.42 },
  "rlm-longship-berserker": { module: "../../dev/model-qa/creatures/rlm-longship-berserker.js", fn: "buildLongshipBerserker", discR: 0.42 },
  "rlm-colonial-trench-medic": { module: "../../dev/model-qa/creatures/rlm-colonial-trench-medic.js", fn: "buildColonialTrenchMedic", discR: 0.42 },
  "rlm-jungle-pit-trap-warden": { module: "../../dev/model-qa/creatures/rlm-jungle-pit-trap-warden.js", fn: "buildJunglePitTrapWarden", discR: 0.42 },
  "rlm-longship-skald-reaver": { module: "../../dev/model-qa/creatures/rlm-longship-skald-reaver.js", fn: "buildLongshipSkaldReaver", discR: 0.42 },
  "rlm-field-gun-battery": { module: "../../dev/model-qa/creatures/rlm-field-gun-battery.js", fn: "buildFieldGunBattery", discR: 0.55 },
  "rlm-jungle-beast-cage-handler": { module: "../../dev/model-qa/creatures/rlm-jungle-beast-cage-handler.js", fn: "buildJungleBeastCageHandler", discR: 0.42 },
  "rlm-gas-cloud-horror": { module: "../../dev/model-qa/creatures/rlm-gas-cloud-horror.js", fn: "buildGasCloudHorror", discR: 0.55 },
  "rlm-siege-tower-crew": { module: "../../dev/model-qa/creatures/rlm-siege-tower-crew.js", fn: "buildSiegeTowerCrew", discR: 0.68 },
  "rlm-jungle-war-elephant-driver": { module: "../../dev/model-qa/creatures/rlm-jungle-war-elephant-driver.js", fn: "buildJungleWarElephantDriver", discR: 0.68 },
  "rlm-trench-flame-lance-team": { module: "../../dev/model-qa/creatures/rlm-trench-flame-lance-team.js", fn: "buildTrenchFlameLanceTeam", discR: 0.42 },
  "rlm-musket-line-grenadier": { module: "../../dev/model-qa/creatures/rlm-musket-line-grenadier.js", fn: "buildMusketLineGrenadier", discR: 0.42 },
  "rlm-siege-ballista-crew": { module: "../../dev/model-qa/creatures/rlm-siege-ballista-crew.js", fn: "buildSiegeBallistaCrew", discR: 0.55 },
  "rlm-jungle-tiger-rider-scout": { module: "../../dev/model-qa/creatures/rlm-jungle-tiger-rider-scout.js", fn: "buildJungleTigerRiderScout", discR: 0.55 },
  "rlm-trench-officers-ghost-whistle": { module: "../../dev/model-qa/creatures/rlm-trench-officers-ghost-whistle.js", fn: "buildTrenchOfficersGhostWhistle", discR: 0.42 },
  "rlm-musket-line-field-marshals-honor-guard": { module: "../../dev/model-qa/creatures/rlm-musket-line-field-marshals-honor-guard.js", fn: "buildMusketLineFieldMarshalsHonorGuard", discR: 0.42 },
  "rlm-cavalry-death-rider": { module: "../../dev/model-qa/creatures/rlm-cavalry-death-rider.js", fn: "buildCavalryDeathRider", discR: 0.55 },
  "rlm-longship-berserker-kings-champion": { module: "../../dev/model-qa/creatures/rlm-longship-berserker-kings-champion.js", fn: "buildLongshipBerserkerKingsChampion", discR: 0.42 },
  "rlm-jungle-ambush-war-priest": { module: "../../dev/model-qa/creatures/rlm-jungle-ambush-war-priest.js", fn: "buildJungleAmbushWarPriest", discR: 0.42 },
  "rlm-siege-line-trebuchet-golem": { module: "../../dev/model-qa/creatures/rlm-siege-line-trebuchet-golem.js", fn: "buildSiegeLineTrebuchetGolem", discR: 0.68 },
  "rlm-musket-line-cannon-golem": { module: "../../dev/model-qa/creatures/rlm-musket-line-cannon-golem.js", fn: "buildMusketLineCannonGolem", discR: 0.55 },
  "rlm-trench-wraith-of-the-wire": { module: "../../dev/model-qa/creatures/rlm-trench-wraith-of-the-wire.js", fn: "buildTrenchWraithOfTheWire", discR: 0.55 },
  "rlm-jungle-colossus-beast": { module: "../../dev/model-qa/creatures/rlm-jungle-colossus-beast.js", fn: "buildJungleColossusBeast", discR: 0.68 },
  "rlm-trench-butcher-golem": { module: "../../dev/model-qa/creatures/rlm-trench-butcher-golem.js", fn: "buildTrenchButcherGolem", discR: 0.55 },
  "rlm-musket-line-ghost-regiment": { module: "../../dev/model-qa/creatures/rlm-musket-line-ghost-regiment.js", fn: "buildMusketLineGhostRegiment", discR: 0.55 },
  "rlm-siege-wall-breaker-titan": { module: "../../dev/model-qa/creatures/rlm-siege-wall-breaker-titan.js", fn: "buildSiegeWallBreakerTitan", discR: 0.68 },
  "rlm-trench-legion-revenant-colonel": { module: "../../dev/model-qa/creatures/rlm-trench-legion-revenant-colonel.js", fn: "buildTrenchLegionRevenantColonel", discR: 0.42 },
  "rlm-longship-storm-caller-reaver": { module: "../../dev/model-qa/creatures/rlm-longship-storm-caller-reaver.js", fn: "buildLongshipStormCallerReaver", discR: 0.55 },
  "rlm-musket-line-field-marshal-revenant": { module: "../../dev/model-qa/creatures/rlm-musket-line-field-marshal-revenant.js", fn: "buildMusketLineFieldMarshalRevenant", discR: 0.42 },
  "rlm-trench-colossus-of-bone-and-wire": { module: "../../dev/model-qa/creatures/rlm-trench-colossus-of-bone-and-wire.js", fn: "buildTrenchColossusOfBoneAndWire", discR: 0.68 },
  "rlm-the-ironclad-reaver-queen": { module: "../../dev/model-qa/creatures/rlm-the-ironclad-reaver-queen.js", fn: "buildTheIroncladReaverQueen", discR: 0.68 },
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
  // small vermin -> giant rat (swarm-of-rats REMOVED 2026-07-04: it now has a BESPOKE swarm module —
  // subbing it to giant-rat made it read as one big rat, Adam's QA complaint)
  "giant-fire-beetle": "giant-rat", "weasel": "giant-rat",
  // goblinoid family -> goblin-warrior (small greenskin)
  "goblin-minion": "goblin-warrior", "goblin-cutter-minion": "goblin-warrior",
  "goblin-boss": "goblin-warrior", "goblin-hexer": "goblin-warrior",
  // kobold family
  "kobold-inventor": "kobold", "winged-kobold-urd": "kobold",
  // undead-shambler family -> skeleton / zombie. (flaming-skeleton + warhorse-skeleton PROMOTED to
  // direct bespoke registry entries 2026-07-04: flaming-skeleton = the ember variant; warhorse-skeleton
  // = a skeletal HORSE, NOT the humanoid skeleton — Adam's QA correction of the old alias.)
  "skeleton-archer": "skeleton", "skeleton-warrior": "skeleton", "minotaur-skeleton": "skeleton",
  "zombie-plague-carrier": "zombie", "ogre-zombie": "zombie", "eye-tyrant-zombie": "zombie",
  // horse family -> warhorse (the flesh horse). draft/riding horses share its silhouette
  "riding-horse": "warhorse", "draft-horse": "warhorse", "giant-seahorse": "warhorse",
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
  "guard-captain": "guard", "berserker": "warrior-veteran", "berserker-commander": "warrior-veteran",
  // ── BESTIARY-COVERAGE alias batch (2026-07-04, docs/BESTIARY-COVERAGE.md §6): 35 CR≤10
  //    creatures judged not worth even a variant — nearest-body aliases, zero modeling. Targets
  //    verified to exist as bespoke bodies at land time. (3 more — will-o-wisp→ghost, piranha→
  //    hunter-shark, lantern-sage→sprite — wait on unbuilt bodies from the wave plan.)
  "flameskull": "skeleton", "crawling-claw": "giant-spider", "drowned-husk": "zombie",
  "cat": "giant-rat", "mastiff": "wolf", "giant-hyena": "worg", "mule": "warhorse", "pony": "warhorse",
  "bog-twisted-giant-rat": "giant-rat", "mire-creeper": "giant-bat",
  "gibbering-mouther": "gray-ooze", "secret-eye": "gray-ooze", "brain-crawler": "giant-spider",
  "darkmantle": "giant-bat", "piercer": "gray-ooze", "basilisk": "giant-lizard", "lizard": "giant-lizard",
  "crab": "giant-spider", "seahorse": "giant-rat", "ochre-jelly": "gray-ooze",
  "animated-rug-of-smothering": "gray-ooze", "animated-flying-sword": "mimic",
  "invisible-stalker": "fire-elemental", "water-weird": "giant-constrictor-snake", "clawed-drowner": "ghoul",
  "hell-hound": "wolf", "nightmare": "warhorse", "larva": "zombie",
  "tough": "bandit", "warrior-infantry": "guard", "vampire-familiar": "noble",
  "guilt-stained-vagrant": "commoner", "helmed-horror": "animated-armor",
  "sphinx-of-wonder": "young-red-dragon", "awakened-shrub": "needle-blight",
  // ═══ COVERAGE EXPANSION 2026-07-04 (dev/model-qa/creature-coverage-audit.mjs): silhouette-
  //     family aliases lifting live-combat model coverage 32% -> 87% with ZERO new geometry.
  //     Each is a heuristic silhouette guess (type+size+name), gated at taste review — a wrong
  //     family is a one-line edit; every alias beats the cuboid fallback. Targets are all
  //     existing bespoke registry keys (verify-theater-figures.mjs check 1/3). ═══
  // -> young-red-dragon (31)
  "adult-blue-dragon": "young-red-dragon", "adult-brass-dragon": "young-red-dragon", "adult-bronze-dragon": "young-red-dragon",
  "adult-copper-dragon": "young-red-dragon", "adult-green-dragon": "young-red-dragon", "adult-red-dragon": "young-red-dragon",
  "adult-silver-dragon": "young-red-dragon", "adult-white-dragon": "young-red-dragon", "ancient-blue-dragon": "young-red-dragon",
  "ancient-brass-dragon": "young-red-dragon", "ancient-bronze-dragon": "young-red-dragon", "ancient-copper-dragon": "young-red-dragon",
  "ancient-green-dragon": "young-red-dragon", "ancient-red-dragon": "young-red-dragon", "ancient-silver-dragon": "young-red-dragon",
  "ancient-white-dragon": "young-red-dragon", "blue-dragon-wyrmling": "young-red-dragon", "brass-dragon-wyrmling": "young-red-dragon",
  "bronze-dragon-wyrmling": "young-red-dragon", "copper-dragon-wyrmling": "young-red-dragon", "dracolich": "young-red-dragon",
  "dragon-turtle": "young-red-dragon", "faerie-dragon": "young-red-dragon", "faerie-dragon-youth": "young-red-dragon",
  "gold-dragon-roster-5e-2024-mechanics": "young-red-dragon", "green-dragon-wyrmling": "young-red-dragon", "half-dragon": "young-red-dragon",
  "pseudodragon": "young-red-dragon", "red-dragon-wyrmling": "young-red-dragon", "silver-dragon-wyrmling": "young-red-dragon",
  "white-dragon-wyrmling": "young-red-dragon",
  // -> owlbear (23)
  "archelon": "owlbear", "bearded-devil": "owlbear", "black-bear": "owlbear",
  "brown-bear": "owlbear", "camel": "owlbear", "elephant": "owlbear",
  "giant-ape": "owlbear", "giant-goat": "owlbear", "giant-octopus": "owlbear",
  "giant-scorpion": "owlbear", "giant-shark": "owlbear", "giant-squid": "owlbear",
  "giant-toad": "owlbear", "hippopotamus": "owlbear", "hunter-shark": "owlbear",
  "killer-whale": "owlbear", "lion": "owlbear", "mammoth": "owlbear",
  "polar-bear": "owlbear", "rhinoceros": "owlbear", "saber-toothed-tiger": "owlbear",
  "tiger": "owlbear", "werebear": "owlbear",
  // -> giant-rat (20)
  "baboon": "giant-rat", "badger": "giant-rat", "frog": "giant-rat",
  "giant-centipede": "giant-rat", "giant-weasel": "giant-rat", "octopus": "giant-rat",
  "piranha": "giant-rat", "pirate": "giant-rat", "pirate-admiral": "giant-rat",
  "pirate-captain": "giant-rat", "rat": "giant-rat", "scorpion": "giant-rat",
  "swarm-of-crawling-claws": "giant-rat", "swarm-of-dretches": "giant-rat", "swarm-of-larvae": "giant-rat",
  "swarm-of-lemures": "giant-rat", "swarm-of-piranhas": "giant-rat", "triceratops": "giant-rat",
  "wererat": "giant-rat", "yuan-ti-infiltrator": "giant-rat",
  // -> cultist (19)
  "arch-hag": "cultist", "archdruid": "cultist", "archmage": "cultist",
  "archpriest": "cultist", "bullywug-bog-sage-mud-lord": "cultist", "centaur-trooper": "cultist",
  "centaur-warden": "cultist", "cultist-roster-base-2024-stat-blocks": "cultist", "druid-circle-warden": "cultist",
  "dryad": "cultist", "fish-folk-archpriest": "cultist", "green-hag": "cultist",
  "mage": "cultist", "priest": "cultist", "priest-acolyte": "cultist",
  "sahuagin-priest": "cultist", "satyr": "cultist", "satyr-revelmaster": "cultist",
  "sea-hag": "cultist",
  // -> giant-lizard (18)
  "allosaurus": "giant-lizard", "ankylosaurus": "giant-lizard", "bulette-pup": "giant-lizard",
  "deep-brute": "giant-lizard", "deep-brute-thonot": "giant-lizard", "doppelganger": "giant-lizard",
  "lizardfolk-geomancer": "giant-lizard", "lizardfolk-sovereign": "giant-lizard", "medusa": "giant-lizard",
  "plesiosaurus": "giant-lizard", "rust-monster": "giant-lizard", "thri-kreen-marauder": "giant-lizard",
  "thri-kreen-psion": "giant-lizard", "troglodyte": "giant-lizard", "tyrannosaurus-rex": "giant-lizard",
  "yuan-ti-malison-type-1": "giant-lizard", "yuan-ti-malison-type-2": "giant-lizard", "yuan-ti-malison-type-3": "giant-lizard",
  // -> earth-elemental (16)
  "air-elemental": "earth-elemental", "azer-pyromancer": "earth-elemental", "azer-sentinel": "earth-elemental",
  "dao": "earth-elemental", "djinni": "earth-elemental", "efreeti": "earth-elemental",
  "elemental-cataclysm": "earth-elemental", "galeb-duhr": "earth-elemental", "magmin": "earth-elemental",
  "marid": "earth-elemental", "merfolk-skirmisher": "earth-elemental", "merfolk-wavebender": "earth-elemental",
  "salamander": "earth-elemental", "salamander-inferno-master": "earth-elemental", "water-elemental": "earth-elemental",
  "xorn": "earth-elemental",
  // -> warrior-veteran (15)
  "assassin": "warrior-veteran", "astral-raider-knight": "warrior-veteran", "astral-raider-warrior": "warrior-veteran",
  "bullywug-warrior": "warrior-veteran", "gladiator": "warrior-veteran", "knight": "warrior-veteran",
  "performer": "warrior-veteran", "performer-legend": "warrior-veteran", "performer-maestro": "warrior-veteran",
  "questing-knight": "warrior-veteran", "sahuagin-warrior": "warrior-veteran", "scout": "warrior-veteran",
  "spy": "warrior-veteran", "spy-master": "warrior-veteran", "tough-boss": "warrior-veteran",
  // -> needle-blight (14)
  "awakened-tree": "needle-blight", "gas-spore-fungus": "needle-blight", "gulthias-blight": "needle-blight",
  "myconid-adult": "needle-blight", "myconid-sovereign": "needle-blight", "myconid-sprout": "needle-blight",
  "shambling-mound": "needle-blight", "shrieker-fungus": "needle-blight", "treant": "needle-blight",
  "tree-blight": "needle-blight", "twig-blight": "needle-blight", "vine-blight": "needle-blight",
  "violet-fungus": "needle-blight", "violet-fungus-necrohulk": "needle-blight",
  // -> ogre (14)
  "balor": "ogre", "bone-devil": "ogre", "chasme": "ogre",
  "glabrezu": "ogre", "hezrou": "ogre", "horned-devil": "ogre",
  "ice-devil": "ogre", "lamia": "ogre", "marilith": "ogre",
  "nalfeshnee": "ogre", "nycaloth": "ogre", "oni": "ogre",
  "pit-fiend": "ogre", "sahuagin-baron": "ogre",
  // -> ice-mephit (14)
  "dretch": "ice-mephit", "dust-mephit": "ice-mephit", "homunculus": "ice-mephit",
  "imp": "ice-mephit", "lantern-sage": "ice-mephit", "magma-mephit": "ice-mephit",
  "manes": "ice-mephit", "pixie": "ice-mephit", "pixie-wonderbringer": "ice-mephit",
  "quasit": "ice-mephit", "smoke-mephit": "ice-mephit", "spined-devil": "ice-mephit",
  "sprite": "ice-mephit", "steam-mephit": "ice-mephit",
  // -> harpy (12)
  "aarakocra-aeromancer": "harpy", "aarakocra-skirmisher": "harpy", "blood-hawk": "harpy",
  "cockatrice": "harpy", "cockatrice-regent": "harpy", "eagle": "harpy",
  "hawk": "harpy", "owl": "harpy", "raven": "harpy",
  "scarecrow": "harpy", "swarm-of-ravens": "harpy", "vulture": "harpy",
  // -> wyvern (11)
  "crocodile": "wyvern", "giant-crocodile": "wyvern", "giant-eagle": "wyvern",
  "giant-owl": "wyvern", "giant-vulture": "wyvern", "griffon": "wyvern",
  "hippogriff": "wyvern", "peryton": "wyvern", "pteranodon": "wyvern",
  "roc": "wyvern", "vrock": "wyvern",
  // -> wolf (10)
  "ape": "wolf", "death-dog": "wolf", "giant-badger": "wolf",
  "giant-crab": "wolf", "giant-frog": "wolf", "giant-wasp": "wolf",
  "goat": "wolf", "jackalwere": "wolf", "panther": "wolf",
  "reef-shark": "wolf",
  // -> hill-giant (9)
  "cloud-giant": "hill-giant", "cyclops-oracle": "hill-giant", "cyclops-sentry": "hill-giant",
  "ettin": "hill-giant", "fire-giant": "hill-giant", "fomorian": "hill-giant",
  "frost-giant": "hill-giant", "stone-giant": "hill-giant", "storm-giant": "hill-giant",
  // -> warhorse (7)
  "boar": "warhorse", "deer": "warhorse", "elk": "warhorse",
  "giant-boar": "warhorse", "giant-elk": "warhorse", "pegasus": "warhorse",
  "wereboar": "warhorse",
  // -> wight (7)
  "death-knight": "wight", "death-knight-aspirant": "wight", "graveyard-revenant": "wight",
  "haunting-revenant": "wight", "mummy": "wight", "mummy-lord": "wight",
  "undead-eye-tyrant": "wight",
  // -> skeleton (7)
  "demilich": "skeleton", "lich": "skeleton", "vampire": "skeleton",
  "vampire-nightbringer": "skeleton", "vampire-spawn": "skeleton", "vampire-umbral-lord": "skeleton",
  "will-o-wisp": "skeleton",
  // -> shadow (6)
  "banshee": "shadow", "ghost": "shadow", "juvenile-shadow-dragon": "shadow",
  "poltergeist": "shadow", "shadow-dragon": "shadow", "specter": "shadow",
  // -> giant-constrictor-snake (6)
  "bone-naga": "giant-constrictor-snake", "couatl": "giant-constrictor-snake", "guardian-naga": "giant-constrictor-snake",
  "salamander-fire-snake": "giant-constrictor-snake", "spirit-naga": "giant-constrictor-snake", "swarm-of-venomous-snakes": "giant-constrictor-snake",
  // -> stone-golem (6)
  "brazen-gorgon": "stone-golem", "clay-golem": "stone-golem", "colossus": "stone-golem",
  "flesh-golem": "stone-golem", "gorgon": "stone-golem", "iron-golem": "stone-golem",
  // -> giant-bat (4)
  "bat": "giant-bat", "stirge": "giant-bat", "swarm-of-insects": "giant-bat",
  "swarm-of-stirges": "giant-bat",
  // -> animated-armor (3)
  "clockwork-law-construct-duodrone": "animated-armor", "clockwork-law-construct-monodrone": "animated-armor", "clockwork-law-construct-tridrone": "animated-armor",
  // -> ghoul (3)
  "ghast": "ghoul", "ghast-base": "ghoul", "ghast-gravecaller-spellstitched-elite": "ghoul",
  // -> gray-ooze (2)
  "blob-of-annihilation": "gray-ooze", "gelatinous-cube": "gray-ooze",
  // -> giant-spider (1)
  "ettercap": "giant-spider",
  // -> commoner (1)
  "myconid-spore-servant": "commoner",
  // -> werewolf (1)
  "weretiger": "werewolf",

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
