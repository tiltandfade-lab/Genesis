# Genesis Model Waves — Proof Sheet Index (2026-07-03 → 07-04 overnight program)

Every figure/prop is a bespoke whole-object landmark module in `dev/model-qa/creatures/`,
rendered here through the byte-faithful engine-PS1 surface (`ps1-sheet.html`: Bayer dither +
vertex-snap 96 + 1/3-res, grain default-on, specular on metal/glass). Live sheets need the
repo served on :5176 → `http://127.0.0.1:5176/dev/model-qa/ps1-sheet.html?set=<key>`.

**Pipeline per wave:** Opus authoring executors with a closed headless-capture render loop →
batched (≤3-wide, machine-resource law) Haiku positioning review + Opus repair workflow →
director gate on the sheet. 82 total pieces; every one passed QA.

**Eye-removal pass (2026-07-04 evening):** Adam reversed the house eye standard — "across the
board the eyes are in the wrong place so just get rid of them." All sheets above were
re-rendered eyeless (75 creature modules + the shared `parts.js` `buildHead`, covering ~79
figures total). Closed-helm visor slits (paladin) and large monster feature-eyes (owlbear,
spider) are unaffected — see `dev/model-qa/REFERENCE-DIRECTION.md`'s dated reversal block for
the full rule and the kept/skipped list. Before/after spot-captures in
`dev/model-qa/captures-eyeless/`.

## Sheets

| Sheet | Set key | Contents |
|---|---|---|
| [classes.png](classes.png) | `classes` (default) | fighter, barbarian, **paladin** (F3: re-posed to an oath-guard — shield raised forward, hammer cocked at the shoulder, braced legs), **ranger** (**TAIL 2026-07-04: PRIMARY swapped back to the D-BOW AT REST** — curved stave + straight tip-to-tip string chord + nocked arrow, per Adam's "must read as a D" ruling; the F3 full-draw is now the alt), **rogue** (F2: re-posed to a sneaky crouch), monk, cleric, **druid** (F3: re-posed to a leaned-on-staff communing hunch), **wizard** (F3: re-posed to an incantation — canted staff, raised casting hand), sorcerer, warlock, bard |
| [races.png](races.png) | `races` | gnome, halfling, dwarf, dragonborn, tiefling, half-orc |
| [racecls.png](racecls.png) | `racecls` | **RACE×CLASS bespoke starter set (F4)** — the STARTER 18 (dwarf {fighter, cleric, ranger} · gnome {wizard, rogue, bard} · halfling {rogue, bard, monk} · half-orc {barbarian, fighter, druid} · tiefling {warlock, sorcerer, rogue} · dragonborn {paladin, sorcerer, fighter}) **plus F4-COMPLETE wave B (the BIG-RACE remainders, executor B): the 27 that finish half-orc / tiefling / dragonborn** — half-orc {paladin, ranger, rogue, monk, cleric, wizard, sorcerer, warlock, bard} · tiefling {fighter, barbarian, paladin, ranger, monk, cleric, druid, wizard, bard} · dragonborn {barbarian, ranger, rogue, monk, cleric, druid, wizard, warlock, bard}. (Executor A appends the dwarf/gnome/halfling remainders in its own region — together they complete the 72-cell matrix.) Each = the FIXED race head/proportions/skin (EYELESS per the 2026-07-04 reversal) + the class kit/pose, as one bespoke `<race>-<class>.js` module. |
| [cr0.png](cr0.png) | `cr0` | giant rat, goblin, kobold, skeleton, zombie, wolf, giant bat, gray ooze, giant spider, **goblin-alt1** (F1: kept big-head original) |

| [npcs.png](npcs.png) | `npcs` | commoner, guard, shopkeep, noble, cultist, bandit · **+F5 variants (2026-07-04):** laborer, watch-captain, priest, innkeep, beggar, hunter, caravaneer, elder |
| [cr0.png](cr0.png) | `cr0` | giant rat, goblin, kobold, skeleton, zombie, wolf, giant bat, gray ooze, giant spider |
| [cr1.png](cr1.png) | `cr1` | orc, gnoll, bugbear, ghoul, giant snake, harpy |
| [cr2.png](cr2.png) | `cr2` | ogre (Large), **owlbear** (F2: body rebuilt = bulky BG3 bear mass, shoulder hump, feather ruff, heavy forelimbs; head kept), minotaur, wight, gargoyle, werewolf |
| [cr5.png](cr5.png) | `cr5` | troll, hill giant (Huge), wraith, stone golem, **young dragon** |
| [icons.png](icons.png) | `icons` | mimic, animated armor, shadow, wyvern, fire elemental, earth elemental |
| [variants.png](variants.png) | `variants` | dire wolf, worg, hobgoblin, cult fanatic, giant wolf spider, veteran |
| [props.png](props.png) | `props` | pillar, broken pillar, brazier, statue, altar, well, archway+portcullis, containers, cart, table, throne, web mass, torch, candelabra, lantern post |
| [envd.png](envd.png) | `envd` | **ENV WAVE D — Dungeon** (10 pieces, 11 builders): portcullis gate, bone-wall, drainage grate, sarcophagus (effigy lid askew), hanging cage (gibbet), refuse pile + crumbled masonry, wall manacles + chains, gear cluster (bronze/broken-tooth), inscribed obelisk + floating-monolith variant, stagnant pool (disc+rim) |
| [alts.png](alts.png) | `alts` | **rogue-alt1** (OG upright twin-dagger stance), **owlbear-alt1** (OG reared body) — F2 originals · **paladin-alt1** (OG parade-rest), **druid-alt1** (OG totem), **mage-alt1**=wizard (OG upright) — F3 originals · **ranger-alt1** (**TAIL 2026-07-04: now the FULL-DRAW pose** — swapped: the D-bow-at-rest is the primary ranger, full-draw is the alt); each kept when its primary was re-posed (alt policy) |
| [tail.png](tail.png) | `tail` | **POLISH TAIL-WAVE (2026-07-04, Adam's live QA-review feedback)** — 14 cells: **rat swarm** (bespoke swarm, 6 small mice+tails on a Medium disc — no longer subbed to the giant rat), **giant lizard** (bespoke Large sprawling monitor quadruped), **ice mephit** (bespoke Small winged ice-imp, glow-tagged frost rime), **deep stalker** (blind-deep-stalker; bespoke predatory eyeless aberration w/ bone cudgel — replaces the cuboid/blob), **needle blight** (bespoke twisted plant-humanoid, bristling needle clusters — replaces the "ugly" read), **wolf** (MOUTH PASS — muzzle/jaw rebuilt closed + eyes removed), **skeleton** (base, eyes = anatomical sockets kept), **flaming skeleton** (bespoke ember variant of the skeleton, glow-tagged flame accents), **giant rat** (eyes removed), **horse** (bespoke Large horse — the roster had none), **warhorse skeleton** (skeletal-HORSE variant reusing the horse silhouette — Adam confirmed it's a bone horse, not a mounted skeleton), **ranger** (D-bow at rest), **ranger-alt1** (full draw), **table** (proportion pass — bench raised, table lowered) |
| [dragon-beauty.png](dragon-beauty.png) | — | Blender EEVEE beauty render of the flagship dragon |

## Size law (as shipped)
Small ~0.95u / disc r0.32 · Medium ~1.45u / r0.42 · big-Medium r0.48 · Large ~2.1u / r0.55
· dragon r0.62 · Huge ~2.7u / r0.68. Prop scale referenced to the ~1.5u humanoid.

## F2 — Fix wave B (2026-07-04, `feat/polish-fix-b`)
Three pieces rebuilt against gathered web references (notes in `dev/model-qa/pose-refs.md`); RED-FIRST
before/after captures in `dev/model-qa/captures-fix-b/`; Haiku positioning review PASS on all three.
- **ranger** — bow rebuilt: the old angular `>` chevron replaced with a smooth C-arc stave (6-segment
  quadratic curve) + a STRAIGHT string chord, arrow nocked-ready and seated on the string.
- **rogue** — re-posed to a sneaky crouch (drop+forward-lean transform, deep-bent legs, daggers tucked
  close). Fixes the hip-sprout dagger bug. New primary; OG kept as `rogue-alt1`.
- **owlbear** — body rebuilt to a bulky BG3 bear mass (heavier/wider trunk, shoulder hump, feather ruff
  at the shoulder/neck seam, forelimbs heavier than hind). Head kept verbatim. New primary; OG kept as
  `owlbear-alt1`. (Shared `parts.js` buildHead/buildHood gained an optional `xform` for the rogue
  crouch — default identity, so the other 11 classes are byte-unchanged; classes sheet re-verified 12/12.)

## F3 — Pose-expressiveness wave (2026-07-04, `feat/pose-wave`)
Four STIFF class poses (upright, at-rest, weapon dead-vertical) re-posed into class-EXPRESSIVE stances
(POLISH-WAVE-1 §F3: "poses that express the class beat weapon-swap flexibility"). References gathered
via web search (notes in `dev/model-qa/pose-refs.md` §F3); RED-FIRST before/after captures in
`dev/model-qa/captures-pose/`; Haiku positioning review PASS on all four. No new geometry — each
re-pose is transforms on the already-authored part assembly (grip/limb/leg landmark moves + light
head-region hunch). No `src/`/`data/` touched; `check-manifest.py` RESULT: OK.
- **paladin** — OATH-GUARD ready stance: shield raised UP + FORWARD across the body to a guard, the
  warhammer COCKED back/up at the right shoulder ready to strike, a wider staggered braced stance
  (lead/shield leg forward). New primary; OG parade-rest kept as `paladin-alt1` (buildPaladinAlt1).
- **druid** — LEANED-ON-STAFF communing hunch: the gnarled staff RAKED to a clear diagonal lean
  (base planted wide, top angled in over the body, grip riding high), the head/cowl/antlers TIPPED
  FORWARD in a weathered-elder hunch, a subtle weight-shifted leg stagger. New primary; OG totem kept
  as `druid-alt1` (buildDruidAlt1).
- **wizard** — INCANTATION stance: the orb-staff CANTED forward (orb leading), the FREE hand RAISED
  up-and-forward in an open casting gesture (spread finger nubs), the head/hat tipped forward. Orb
  stays ON the staff (no new floater — sorcerer keeps that). New primary; OG upright kept as
  `mage-alt1` (buildMageAlt1).
- **ranger** — FULL-DRAW aiming stance: the F2 C-arc bow held out front in the extended bow arm, the
  STRING drawn back to a deep V (top-nock → anchor at the jaw → bottom-nock), the draw arm pulled back
  with the elbow up, the arrow riding forward through the grip down-range, open staggered feet. The F2
  bow geometry is reused verbatim; only the draw + arms + legs re-pose. New primary; the F2 bow-at-rest
  ranger kept as `ranger-alt1` (buildRangerAlt1).
- Left as-is (already class-expressive at RED-FIRST): barbarian, rogue, monk, sorcerer, warlock, bard,
  fighter (braced guard), cleric (mace-up ready). cr1/cr5 stand-outs deferred (no cycles remained).

## ENV WAVE D — Dungeon (2026-07-04, `feat/env-wave-d`)
10 bespoke whole-object dungeon props (11 builders — obelisk ships grounded + floating variants),
replacing the generic-cover / wrong-part / cuboid reads for the highest-value unbuilt `dungeon-feature`
(d150) nouns. RED-FIRST before/after captures in `dev/model-qa/captures-env-d/`; each piece renders
through the byte-faithful engine-PS1 surface; board-distance legibility reviewed at the game camera.

Every piece carries a `THEATER_PROP_KEYWORD_RULES` entry (`src/engine/theater-data.js`) so the rolled
noun resolves to the right EXISTING part family (no new `PARTS` keys — the 61-part inventory stays
exact; each bespoke module is that part's **P1' geometry-source swap**, same pattern as the shipped 82):

| piece | file · builder | keyword → part | notes |
|---|---|---|---|
| portcullis gate | `prop-portcullis.js` · buildPortcullis | `portcullis` → `arch-frame` (rule placed ABOVE the archway rule) | bare rusted/wedged iron grille in a stone socket; distinct from the full masonry arch |
| bone-wall | `prop-bonewall.js` · buildBoneWall | `bone-wall`/`skull-mortared`/`bone-lattice` → `rubble-scatter` (channel:bone) — placed ABOVE the `scree` rule so "screen" no longer stale-matches | skulls mortared in courses + crossed-long-bone lattice + ragged crest |
| drainage grate | `prop-grate.js` · buildGrate | `grate`/`drain-cover` → `rubble-scatter` (flat) | raised stone kerb + iron bars over a dark shaft + muck blockage |
| sarcophagus | `prop-sarcophagus.js` · buildSarcophagus | `sarcophagus`/`coffin` → `coffin-slab` | tapered chest + effigy lid shoved askew exposing the dark interior |
| hanging cage | `prop-hangingcage.js` · buildHangingCage | `cage`/`gibbet` → `cage-frame` | swaying bulging gibbet on a wall-bracket chain + bones inside (silhouette piece) |
| refuse pile | `prop-refuse.js` · buildRefuse | `refuse-pile`/`crumbled-masonry` → `rubble-scatter` (was `null`) | tumbled broken masonry + column drum + broken pot/plank/bones (replaces the cuboid scatter) |
| wall manacles | `prop-manacles.js` · buildManacles | `manacle`/`chain` → `chain-drape` | coursed wall + two wrist cuffs + drooping rusted chains + a leg-iron |
| gear cluster | `prop-gears.js` · buildGears | `gears`/`clockwork` → `gear-cluster` | 3 meshing toothed BRONZE cogs, one broken-tooth, verdigris/rust, snapped chain (replaces the cuboid) |
| inscribed obelisk | `prop-obelisk.js` · buildObelisk | `obelisk`/`monolith` → `pillar-broken` (intact) | dark basalt shaft + pyramidion + an emissive rune CHANNEL (the differentiator vs the plain pillar) |
| floating monolith | `prop-obelisk.js` · buildObeliskFloat | (same `monolith` rule) | the float variant param: shaft hovers, no base, arcane under-glow halo pooled on the disc |
| stagnant pool | `prop-pool.js` · buildPool | `stagnant-pool`/`fouled-pool`/`algae-pool` → `basin-block` (was `null`) | **QA VERDICT: built as flat water disc + raised stone rim; reviewed at the game camera it reads as a POOL (rim lip + ripple rings + algae scum), NOT a rug — KEPT AS GEOMETRY, not demoted to env-FX.** (Edge-on it thins, inherent to any floor feature; the board camera is dimetric, so this is acceptable.) |

Board-distance review verdicts (game camera): all 11 PASS. Two pieces took an in-wave repair pass —
**sarcophagus** (chest palette lifted a step + effigy relief raised/shaded so it reads as a recumbent
figure, not a flat jumble) and **refuse pile** (big block split into two askew broken chunks + fresh-
break facets so it reads as a tumbled heap, not a clean cube stack). Coverage proof: all 21 noun-spelling
variants resolve to the correct part; the shipwreck→cart ordering test is undisturbed.

## F4 — Race×class bespoke starter set (2026-07-04, `feat/racecls-starter`)
Adam's locked call (POLISH-WAVE-1 §F4): **18 BESPOKE race×class figures**, three per built race, iconic
combos first — NOT swap channels. Each is one whole-object `<race>-<class>.js` module = the FIXED race
head/proportions/skin (post-F1 gnome + post-F1 dragonborn snout inherited verbatim) grafted with the
class kit + F3 pose language. New sheet set key `racecls` (18 cells). Small races follow the size law
(gnome ~0.95u / halfling ~1.0u); dwarf is squat-Medium (race-dwarf proportions). The rogue combos reuse
the shared `parts.js` `buildDagger`; every other kit is authored inline from `probe-lib` primitives.
- **dwarf** — fighter (raised sword + pauldron + helm), cleric (raised flanged mace + round shield +
  tabard-cross + gold circlet), ranger (braced C-arc longbow + back quiver + hood). Beard + domed helm
  inherited from race-dwarf.
- **gnome** — wizard (robe + pointed drooping hat + orb-staff + casting hand), rogue (sneaky crouch +
  twin daggers + hood), bard (feathered cap + lute + doublet). Oversized head + wedge EARS inherited
  (the critical race-read: must not read as a short human — Haiku: "race-read excellent").
- **halfling** — rogue (crouch + twin daggers), bard (lute + doublet), monk (gi + red sash +
  quarterstaff + horse-stance). Curly hair-cap + BARE oversized feet inherited (the icon).
- **half-orc** — barbarian (two-handed great-axe + bare green chest + fur pelt), fighter (raised sword +
  pauldron + tunic-over-mail), druid (gnarled leaned staff + antler headdress + hide mantle + bone
  charms). Gray-green skin + tusk nubs + jutting brow inherited.
- **tiefling** — warlock (grimoire on forearm + claw hand + amulet + layered robe), sorcerer (flame wisp
  off palm + high-collar coat + lunge), rogue (crouch + twin daggers). Backswept horns + goatee +
  spade-tail inherited.
- **dragonborn** — paladin (tower shield + cocked warhammer + plate cuirass + tabard + oath-guard),
  sorcerer (flame wisp + coat + lunge — draconic-bloodline flavour-perfect), fighter (raised sword +
  tunic-over-scale). Reptilian muzzle head (post-F1 blunt snout) + horn stubs + thick tail + rust
  scales inherited.
- **Verification**: RED-FIRST base race + base class reference-frame captures per combo filed in
  `dev/model-qa/captures-racecls/refs/` (6 base races + 12 base classes = every combo's two parents);
  per-piece 3-angle captures in `dev/model-qa/captures-racecls/`; full sheet `sheets/racecls.png`;
  batched (≤3-wide) Haiku positioning review with a NAMED race-read check per piece — **18/18 PASS**
  (2 PASS-WITH-NIT, both reviewer misreads of intended features: dwarf-cleric's raised mace head read
  as a "loose back axe" — no back axe exists; dragonborn-sorcerer's floating wisp read as "loose" — the
  wisp floating off the palm IS the sorcerer signature). Every figure passed the race-read named check.
  `check-manifest.py` RESULT: OK (dev-side modules only; no `src/`/`data/` touched).

## TAIL WAVE — Adam's live QA-review feedback (2026-07-04 evening, branch `feat/tail-wave`)
Ten items from Adam's master-sheet QA review, plus a director bow addition. RED-FIRST before/after
captures in `dev/model-qa/captures-tail/`; full sheet `sheets/tail.png`; batched (≤3-wide) Haiku
positioning review — **12/12 render-checked PASS / PASS-WITH-NIT** (nits: ice-mephit legs a touch
spindly; deep-stalker head slightly blobby at the game angle; flaming-skeleton flames read amber in
the dev sheet — they render brighter in-engine via the "glow" channel). `check-manifest.py` RESULT:
OK; `node dev/verify-theater-figures.mjs` 38/38 (registry integrity validates every new bestiary key).

- **rat-swarm** — bespoke `mon-ratswarm.js` (buildRatSwarm): 6 small mouse-shaped bodies + simple
  tails scattered on a Medium disc (varied facing/size). REMOVED the `swarm-of-rats → giant-rat`
  NEAREST_SUB alias (it read as one big rat) and registered the bespoke module directly.
- **giant-lizard** — bespoke `mon-lizard.js` (buildGiantLizard): Large low-slung sprawling monitor
  quadruped, splayed legs, long heavy tail, wide jaw + forked tongue. New `giant-lizard` registry key.
- **ice-mephit** — bespoke `mon-icemephit.js` (buildIceMephit): Small winged ice-imp, ice-blue palette,
  membranous wings, horns; frost-rime/fang/horn-tip accents on the "glow" channel (setChannels).
- **blind-deep-stalker** — bespoke `mon-deepstalker.js` (buildDeepStalker): a proper predatory
  silhouette (was cuboid/blob — no registry entry) — hunched eyeless aberration, wide fanged maw,
  grasping clawed arms, bone cudgel. New `blind-deep-stalker` registry key.
- **needle-blight** — bespoke `mon-needleblight.js` (buildNeedleBlight): a twisted bark plant-humanoid,
  bristling green needle clusters (crown/shoulders/back/forearms), knot-hole face, root feet, branch
  arms. Bark on the "wood" channel. Reads as a PLANT. New `needle-blight` registry key.
- **wolf mouth pass** — `mon-wolf.js`: the old wide-gape dangling lower jaw rebuilt to a mostly-closed
  muzzle + short tucked jaw + thin mouth line + compact bared fangs. Eyes removed.
- **flaming skeleton** — `mon-skeleton.js` parameterized (`buildSkeleton({flaming})` + `buildFlamingSkeleton`):
  the same skeleton silhouette scorched ember + glow-tagged flame accents (crown/shoulders/ribs + socket
  ember pips). Base `buildSkeleton()` is byte-unchanged (opts default {}). New `flaming-skeleton`
  registry key; removed the old `flaming-skeleton → skeleton` NEAREST_SUB alias.
- **horse + warhorse-skeleton** — bespoke `mon-horse.js` (`buildHorse` / `buildWarhorseSkeleton` via a
  shared `horseFigure(mode)`): a Large horse (the roster had none) + a skeletal-HORSE variant reusing
  the silhouette. FIXED the `warhorse-skeleton → skeleton` (humanoid) NEAREST_SUB alias — it's now a
  direct bespoke skeletal-horse key. Added `warhorse` key + `riding-horse`/`draft-horse`/`giant-seahorse`
  → warhorse subs.
- **prop-table proportion** — `prop-table.js`: table top lowered (underside 0.72→0.56) + bench seat
  raised (0.34→0.36) → a believable ~0.65 bench:table ratio (was towering-table over a tiny bench).
- **rat eye removal** — `mon-rat.js`: eye quads removed (per the reversed eye ruling).
- **ranger D-bow (director addition)** — PRIMARY swapped to the D-bow-at-rest (curved stave + STRAIGHT
  tip-to-tip string chord, endpoints EXACTLY coincident with the stave-tip nocks + nocked arrow; bow
  yaw raised 26°→52° + belly deepened so the D reads at the game camera); the F3 full-draw is now
  `ranger-alt1` (its V-string ends made exactly coincident with the stave tips too). Eyes removed from
  both ranger files.

### EYE RULING (2026-07-04, Adam): "across the board the eyes are in the wrong place — get rid of them."
This wave authored NO eye quads on any new piece and removed the painted eye/eyeGlow quads from the
files it touched (wolf, giant rat, ranger, ranger-alt1). **Deviation (flagged for Adam):** the skeleton
+ warhorse-skeleton keep their DARK EYE SOCKETS — these are anatomical hollow sockets (the skull's
defining structure, `P.socket`/`P.hollow` voids), NOT painted eye dots "in the wrong place"; removing
them would break the skull read. The flaming skeleton adds two small glow-tagged ember pips INSIDE
those sockets (the burning-eye read), not painted face eyes.

## F4 COMPLETE — wave B: BIG-RACE remainders (2026-07-04, `feat/racecls-complete-b`)
Adam greenlit completing the race×class matrix. Executor B's half = the **27 BIG-RACE remainder combos**
that finish the half-orc / tiefling / dragonborn matrices (each race's other 9 classes); executor A adds
the dwarf/gnome/halfling remainders in parallel. Same whole-object grammar as the starter 18 — each is one
bespoke `<race>-<class>.js` module = the FIXED race head/proportions/skin/markers grafted with the class
kit + F3 pose language. **EYELESS per the 2026-07-04 reversal** (no eye quads authored; the landed starter
18 predate the reversal and still carry them — a queued eyeless re-pass covers those). Every figure faces
`+z` front (the one known nit from the landed half-orc-fighter — back-to-camera — was avoided). Ranger
combos: the bow is a strung **D** — a single curved C-arc stave + a STRAIGHT string chord connecting at
BOTH tips, drawn to a deep V at full draw. All kits authored INLINE from `probe-lib` primitives (no shared
cross-module helpers; rogue daggers inlined too).
- **half-orc (9)** — paladin (tower kite shield + cocked warhammer + green tabard + pauldrons, bare head so
  tusks/brow read), ranger (full-draw C-arc longbow + back quiver + hood), rogue (sneaky crouch + twin
  daggers + hood), monk (quarterstaff + gi + red sash + horse-stance + bare feet), cleric (mitre + flanged
  mace + round shield + tabard-cross), wizard (robe + pointed hat + orb-staff + casting hand), sorcerer
  (flame wisp off palm + coat + lunge), warlock (open grimoire on forearm + claw hand + glow amulet + robe),
  bard (lute + feathered cap + doublet + half-cape). Gray-green skin + tusk nubs + jutting brow inherited.
- **tiefling (9)** — fighter (raised sword + pauldron), barbarian (great-axe + bare mauve chest + fur pelt),
  paladin (tower shield + cocked warhammer, helmless so horns crown), ranger (full-draw C-arc bow + quiver),
  monk (quarterstaff + gi + red sash), cleric (mace + shield + tabard-cross, mitre dropped for horns), druid
  (gnarled leaned staff + hide/leaf mantle, antlers dropped for horns), wizard (robe + pointed hat over the
  horns + orb-staff), bard (lute + feathered cap between the horns + half-cape). Backswept horns + goatee +
  spade-tail inherited.
- **dragonborn (9)** — barbarian (great-axe + bare rust-scale chest + fur pelt), ranger (full-draw C-arc bow
  + quiver), rogue (crouch + twin daggers), monk (quarterstaff + gi + red sash + scaled bare feet), cleric
  (mace + shield + tabard-cross, mitre dropped for horns), druid (gnarled leaned staff + hide/leaf mantle,
  antlers dropped for horns), wizard (robe + pointed hat clearing the horns + orb-staff), warlock (open
  grimoire + claw hand + glow amulet + robe), bard (lute + feathered cap + half-cape). Reptilian muzzle head
  (post-F1 blunt snout) + horn stubs + thick tail + rust scales inherited.
- **Verification**: per-piece 3-angle (game/front/side) captures in `dev/model-qa/captures-racecls3/`; full
  sheet re-rendered to `sheets/racecls.png` (**45 of 45 cells** in executor B's tree = the starter 18 + these
  27; the tree lacks executor A's dwarf/gnome/halfling remainders, added on merge → 72). Node contract sweep
  (resetGeom/build/getBuffers per module): **27/27 well-formed** (POS%9===0, POS===COL, CHAN===tris, tri
  count 564–1202 in [120,2600], bbox min.y within [-0.010, 0.002]). Vision review with the NAMED race-read
  check per piece: **27/27 PASS** — every figure passes the race-read (half-orc gray-green + tusks/brow;
  tiefling horns + mauve skin + spade tail; dragonborn muzzle + horn stubs + thick tail + rust scales). Two
  PASS-WITH-NIT: **half-orc-ranger** and **tiefling-ranger** read dark/edge-on at the game 45° angle — intrinsic
  to the full-draw side-facing archer stance (the bow D reads clean at front/side; identical to the approved
  base ranger; dragonborn-ranger reads fine at game angle because the thick tail fills the silhouette).
  `node dev/verify-theater-figures.mjs` → 38 passed / 0 failed; `check-manifest.py` RESULT: OK (dev-side
  modules only; no `src/`/`data/` touched).

## Polish backlog (logged at director gates; none blocking placeholder use)
### F1 — Fix wave A (branch feat/polish-fix-a, 2026-07-04) — CLEARED
- ✅ **mimic** (BROKEN) — tongue now emerges BETWEEN the two fang rows (threads up through the gap,
  crests, lolls forward). Replaced outright, no alt. (Haiku re-review: PASS)
- ✅ **gnome** (BROKEN) — head shrunk from a balloon to a larger-than-human ratio (0.40u→0.27u head,
  radii −28%), nose push halved, eyes re-seated WIDE flanking the nose ridge per the eye standard.
  Replaced outright, no alt. (Haiku: GOOD)
- ✅ **giant rat** — the ambiguous flat ear-discs replaced with UPRIGHT rounded ears on a lift-stub
  (clear of the skull); snout pulled back over the (r0.32→0.35) disc. (Haiku re-review: PASS)
- ✅ **goblin** — head slightly smaller (radii −10%, crown/top lowered ~0.03u); big-head original KEPT
  as `mon-goblin-alt1.js` (buildGoblinAlt1), registered in the cr0 sheet set. (Haiku: both ACCEPTABLE)
- ✅ **dragonborn** — muzzle dialed IN per refs (blunt DEEP dragon snout, shortened ~0.084u, deeper
  cross-section — no longer the kobold snout); belt-knife brass pommel → matte leather (specular
  catch killed). (Haiku: muzzle reads blunt-dragon, PASS)
- ✅ **gray ooze** — palette de-blued to NEUTRAL grey (red channel raised to meet g/b at each value);
  engulfed skull STAYS. (Haiku re-review: GOOD)
- ✅ **wyvern haunch** — thigh rebuilt as ONE continuous 12-sided lofted drumstick (was a fat tube +
  overlapping low-res blob = lumpy). (Haiku re-review: PASS)
- ✅ **warlock grimoire** — pages enlarged + laid nearly flat (broad parchment spread up toward the
  camera) + cover block thickened; reads as an OPEN BOOK, not a knife edge-on. (Haiku re-review: PASS)
- ✅ **barbarian chest patch** — the bright P.skinLt chest BAND (the pale-chip source) replaced with
  even mid-skin + symmetric dark pec creases; grain-off capture confirms no geometry chip (residual
  faint speck is the global grain-atlas texel-dirt, not the authored patch). Rear/both axe-grips
  given knuckle nubs + thumb wraps so the fists read as closed grips.

### F1 — reduced but still open (polish, non-blocking; NOT broken)
- giant snake strike-neck: head pulled from clearly-past-the-rim to over disc-CENTER, anchored by the
  heavy coil; Haiku still flags high-CoG tip risk (intrinsic to a raised coiled-strike pose). Reduced.
- harpy wings: gained a solid membrane sail base + deeper/back-raked feathers; the forward wing now
  reads as a feathered sail, but the wing that goes edge-on to the fixed dimetric camera still reads
  thin (a spread-wide wing will always present one edge-on). Reduced, not fully eliminated.

### Other roster polish
- ~~rogue reverse-grip dagger reads as sprouting from the hip at hero angle only~~ — FIXED in F2 (re-pose)

- gray ooze reads slate-blue at board light — palette nudge toward grey
- giant rat snout slightly overhangs its disc edge
- dragonborn belt-knife catches too much light against rust scales
- giant snake strike-neck overhangs the disc (a physical mini would tip)
- harpy wings read thin at board distance despite full close-up feathering
- barbarian: softened chest patch reads as pale chip; rear axe-grip soft at hero angle
- warlock grimoire flirts with knife-read edge-on at the hero angle
- rogue reverse-grip dagger reads as sprouting from the hip at hero angle only
- wyvern haunch mass slightly lumpy at the game angle
- (F5) watch-captain: across-body pommel-rest reads slightly high at the elbow (hand contact now clean)
- (F5) elder: full grey-hair dome reads a touch large/forward at the pure game angle (bald-topped
  fringe intended; distinctness vs. upright noble is unambiguous in every view)
- (F5) beggar: lean-crutch is geometrically clear of the torso in z, but its silhouette OVERLAPS the
  left shoulder in the 35° three-quarter turnaround only (not the ~45° game angle) — angle-dependent
  overlap, not a true clip; deferred (moving it further forward would distort the supplicant pose)

## Next (per REFERENCE-DIRECTION §P1′)
1. Engine wiring: whole-object builders → BufferGeometry + material channels → figureMaterialFor
   → the shipped PSX pass (cuboids demote to fallback); lighting props anchor the rolled
   per-room light profiles.
2. `creatureId → builder` registry seam; palette-key material channels.
3. Down-state (tipped-piece) read check across the roster.
