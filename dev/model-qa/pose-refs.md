# pose-refs.md — expressive-pose idiom notes (POLISH-WAVE-1)

The F3 pose-expressiveness wave (the 12 classes) is the primary owner of this file — it lands its
per-class idle-stance references here (pose description + source URL, vision-read not downloaded).
That wave had not run when F5 (NPC variants) executed, so this file was created by F5 to carry the
**expressive-pose rule as applied to the NPC shape wave**. The rule (Adam, 2026-07-04): *a pose that
EXPRESSES the role beats a neutral swappable-weapon grip.* Every F5 NPC is posed to read its role at
board distance — the held prop is authored first and the body derives to it.

## F5 NPC-variant poses (built 2026-07-04, `npcs` sheet set)

Each is a whole-object module in `creatures/npc-<shape>.js`; the pose is the distinctness carrier
(the named review check is that each reads as ITSELF next to the built six —
commoner/guard/shopkeep/noble/cultist/bandit).

| shape | expressive pose (prop authored first) | reads-distinct-from |
|---|---|---|
| **laborer** | heavy CRATE shouldered high on the right, braced wide load-bearing stance, bare forearm bracing the underside, sweat-rag brow | commoner (who carries a small sack low, mild stoop) |
| **watch-captain** | plate + big angular pauldrons + plumed sallet; gauntlet resting/curled over a sheathed-sword pommel across the body; parade-rest | **guard** (drab quilted gambeson, kettle-brim, spear butt-on-ground) — the NAMED check |
| **priest** | holy-symbol staff raised in one hand (sun-disc medallion facing the viewer), other palm open in blessing, open tonsured face, bright stole | **cultist** (deep hood face-shadow, downward dagger, dark robe) — the NAMED check |
| **innkeep** | rotund apron-belly, foamy TANKARD hoisted, serving rag over the other forearm, jolly straddle | shopkeep (lean trader behind a stall) |
| **beggar** | deepest hunch in the cast, BEGGING BOWL cupped in both hands out front, crutch-stick propped outboard, knees folded | every standing civilian (smallest, most collapsed silhouette) |
| **hunter** | fur shoulder mantle, broad felt hat, C-curved shortBOW held loose, quiver on the back, low tracking lean | bandit (who crouches to menace; hunter leans to read ground) |
| **caravaneer** | big backpack/bindle hump on the back, wide travel hat, walking STAFF planted forward, mid-stride, coin-pouches | shopkeep (static) — caravaneer is mobile + laden, going somewhere |
| **elder** | bent age-hunch, leans his WEIGHT two-handed onto a gnarled staff, long grey beard + hair, shawl | **noble** (upright chin-high, cane held tip-to-ground as status ornament) |

Idiom source (applied, not per-piece-cited pending the F3 web-reference pass): FFT/Tactics-Ogre
role-legible idle silhouettes + BG3 crowd-NPC read — the pose alone should name the role before the
palette or props resolve.
