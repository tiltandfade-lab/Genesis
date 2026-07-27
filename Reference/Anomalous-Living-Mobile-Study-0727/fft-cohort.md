STATUS: DRAFT — PENDING CODEX ADVERSARIAL REVIEW (2026-07-27 campaign)

# FFT COHORT — the substrate-anomaly board grammar

type: research-lane
date: 2026-07-27
lane: 3 of 3 (breadth sweep · image lane · FFT cohort)
site: 12 — anomalous / living / mobile
corpus: `genesis/Reference/FFT-Guard-Post-Study/study-archive/maps/five-angle/`
(121 map ids × 5 views = 605 GIFs, read **in place** — nothing copied, nothing committed,
no contact sheet derived)

## Binding boundary restated

This is comparative map morphology and grammar induction, per the FFT BOUNDARY in
`docs/GOLDEN-SITES-CATALOG.md`. No FFT layout is reproduced, transcribed, or converted.
The output is **relations**, several of them stated as anti-rules precisely so nobody
mistakes them for a map. No FFT mesh, texture, map, or screenshot is or becomes a Genesis
asset.

## Method and honest sampling

The map-id → name table is in-repo at `study-archive/tools/heretic/src/map.c` (lines
115–248); the Lair Study already verified those ids empirically against rendered content,
so this lane treats the table as established rather than re-deriving it.

Candidates were selected by asking the substrate question of every name in the table —
*"is the ground here a made thing, a moving thing, a missing thing, or a liquid thing?"* —
and then **eight maps were actually opened and read**: 55, 64, 69, 70, 71, 103, 106, 114.
Views read were the isometric `_1` for all eight plus the orthographic plan `_0` for 55.

**This is a small sample and it is stated as small.** 8 of 121 ids. It was not exhaustive
by design: the classification question here is narrow (does any FFT map put a
living/moving/wrong substrate under the player?) and the eight cover every naming candidate
for it. A wider sweep could still turn up a ninth case; nothing below should be read as
"FFT contains exactly N."

## What was read

| id | name | what the render actually shows |
|---:|---|---|
| 55 | Graveyard of Airships | A wrecked hull as the entire playfield: a lens/almond footprint of planked deck, cambered like a keel, ringed by a raised green-copper gunwale, with three snapped masts leaning out of it and cordage hanging off the rim. **The hull floats in nothing** — no terrain apron, no ground plane, no horizon. |
| 64 | In Front of Bethla Garrison's Sluice | A masonry sluice structure with **two liquid fields at different levels** flanking it — one pale/still, one open — and stepped stone banks between. The control structure is the map's spine; the liquid is half the footprint. |
| 69 | Murond Death City | A ruined walled plaza with a tower mass at the back, rubble scattered on a flat court, arcaded walls left and right. Ordinary masonry ruin on ordinary ground. |
| 70 | Nelveska Temple | Stacked stone blocks and standing columns on a grassy shelf. Ordinary ruin on ordinary ground. |
| 71 | Dolbodar Swamp | **Braided ground**: narrow winding dry ridges threading between wide shallow-water fields, reed clumps marking the shallows. The dry line *is* the tactical design. |
| 103 | Windmill Shed | A stone windmill with sailed arms on a rock spur, ordinary grass and rock underfoot. |
| 106 | DELTA (Deep Dungeon) | **A plate archipelago**: mossy floor plates of varying height suspended over pure void, connected only where their corners touch. The map is defined by what was *removed*. |
| 114 | END (Deep Dungeon) | **A rim**: a horseshoe of tall striated golden rock enclosing a central open void, with a stepped inner ledge. The hole is the middle of the map, not its edge. |

## The five findings

### 1. FFT never moves a tile. Not once.

Across every candidate — including the two most "mobile" names in the corpus (Graveyard of
Airships, Windmill Shed) — the substrate is **static map geometry**. The windmill's sails
are the moving object, and they are furniture on a hill; the airship hull is a wreck, and
it is at rest. FFT's board grammar expresses motion, life, and wrongness entirely through
**shape, skin, and adjacency**, never through a tile that changes.

This is the single most important result for Site 12, and it is a *permission*, not a
limitation: the board-grammar authority says **do not animate the floor — build the
consequences of motion into static shape plus committed state.**

### 2. When the ground is a made object, the world is deleted around it.

Map 55 is the corpus's only case where the playfield is a manufactured artefact rather
than terrain, and its handling is absolute: the hull has **no apron at all**. No shoreline,
no dock, no ground plane, no sky mass. Compare every ordinary FFT map, which sits on a
black-sided terrain slab with painted context.

The grammar reads: **a vessel-substrate site owns its own silhouette, and the world reaches
it only through declared portals.** This is exactly the Uros edge (image `S12-A1`) — golden
mat straight into blue water, no beach — and exactly the boat-mill gangway (`S12-B1`).

### 3. Void is a first-class terrain type, and it comes in two postures.

- **106 DELTA — void as the field, plates as the exception.** The player crosses a
  discontinuous archipelago; every gap is a decision. This is the quaking-bog mat lobes
  (`S12-A4`) with the water replaced by nothing.
- **114 END — void as the centre, rim as the field.** A closed ring of ground around a
  hole. Circulation is forced circumferential; the two ends of the horseshoe are as far
  apart as the map allows despite being visually adjacent.

Both postures are directly reusable, and they answer different Genesis rolls: DELTA is the
bog/mat/plate case, END is the crater/maw case (`place-master-setting` 87 *The Shimmering
Maw* — a village suspended over a glass crater — is an END-posture site).

### 4. Liquid substrate is legal, costed, and shaped — it is never a wall.

Maps 64 and 71 both put large liquid fields inside the playable footprint, and in both the
liquid is **enterable**. 71's design is entirely the *shape of the dry line*: a braid of
narrow ridges whose corners are the chokepoints. 64 puts two liquid bodies at **different
levels** either side of a control structure, which makes the level itself the object of
play.

The rule this yields for Site 12's family E and A: **unreliable ground is passable at a
cost, and the site's design is the shape of the reliable path through it.** A bog that is
simply impassable is a wall with a texture.

### 5. Anti-evidence: FFT's two most "anomalous" names are ordinary ruins.

Murond Death City (69) and Nelveska Temple (70) are, in the fiction, the necropolis of a
dead god-machine and a temple housing an ancient construct. Rendered, both are conventional
masonry ruins on grass and flagstone. Their anomaly is entirely **narrative and dressing**;
no board relation carries it.

This is the cohort's most useful warning. **A site does not become Site 12 because its
story is strange.** If the substrate relation is unchanged, it is Site 3 (dormant/abandoned)
or Site 4/10 with a skin, and the honest classification is the cheaper one.

## Cohort → Genesis translation table

| FFT relation | Site 12 family it serves | Genesis expression (PROPOSED) |
|---|---|---|
| hull-as-playfield, no apron (55) | B vehicle/vessel | `SUBSTRATE-DECK`: the site's footprint is the object's own outline; context projects but never adds cells |
| plate archipelago over void (106) | A mat · D crust · F | `SUBSTRATE-PLATES`: discontinuous licensed ground with gap decisions; failure mode is *fall*, not *block* |
| rim around a central void (114) | D wrong ground · A crater sites | `SUBSTRATE-RIM`: circumferential circulation, the hole as objective and hazard both |
| braided dry line through liquid (71) | A mat · E cyclic | `SUBSTRATE-BRAID`: reliable path shaped through costed ground; chokepoints are ridge corners |
| two liquid levels across one control structure (64) | E cyclic | `SUBSTRATE-DATUM`: the level is the lever; one structure owns it; both states are the same map |
| moving mechanism as furniture, not floor (103) | B vehicle | motive machinery lives at a **seam** (cf. the boat-mill wheel between two hulls, `S12-B2`) — never under the walking deck |

## What this lane changed

The catalog's one-line Site 12 note — *"organic/impossible connectors; biggest skin buy"* —
survives contact only for family F. The cohort says the opposite for everything else:
**Site 12's buy is a small set of hard-edged footprint and void relations, and its skin is
the cheap part.** Four of the six shapes above (deck, plates, rim, braid) are *silhouette*
decisions made before any material is chosen, and three of them (plates, rim, braid) are
achievable by *subtracting* from terrain the engine already builds.
