# PACKET-F1 — Fantasy Faceted Figure Factory: parallel Codex lanes

**Authority:** `docs/FACETED-SPRITE-ART-MIGRATION.md` (SPECCED 2026-07-12, banked on
`codex/extruded-prop-pilot`) + `dev/model-foundry/FACETED-ART-REGENERATION-PRODUCTION-PLAN.md`
(same branch — §6.8 figure master prompt, §6.9 QA, §7 prop prompt, §9 per-sheet sequence).
This packet COMPILES those laws into paste-ready parallel lanes; it authors no new law.

**Scope lock:** FANTASY ONLY. One identity per generation call. Every output is a *candidate*
(`runtimeAdmitted:false`) — generation never implies admission. Save returns under
`dev/model-foundry/faceted-regeneration-production/fantasy-pilot/raw-figures/` with the
established `<slug>-candidate-NNN.png` naming, and record the generation call id per Step A.

**Chroma rule (§7.1):** flat uniform **magenta #FF00FF** background for figures, unless the
identity canonically contains magenta/pink — then use **green #00FF00**. Never both. The chroma
color must not appear anywhere in the figure. No gradient, floor, horizon, or lighting variation.

---

## RUN ORDER (the gate the migration plan requires)

1. **Fire Lane 1 (ANCHORS) + Lane 6 (state-family kits) first — they can run in parallel.**
2. **2-minute eyeball rule:** when Lane 1 returns, hold the five anchors together at a glance.
   If they read as ONE language (mature, large-faceted, serious — not toy/chibi/MMO), fire
   Lanes 2–5 in the same sitting, all in parallel.
3. If any anchor reads off-language, STOP — do not fire Lanes 2–5; bring the sheet back for a
   master-prompt recalibration instead. Wasted candidates are cheap; a wrong language locked in
   across 80 identities is not.

Lanes 2–5 are mutually disjoint (no shared slugs) — safe to run simultaneously in separate
Codex windows.

---

## LANE 1 — THE ANCHOR FIVE (run each prompt TWICE → 2 candidates per identity)

### 1A — humanoid anchor: bandit enforcer

```text
Use case: stylized-concept
Asset type: Genesis MONSTER standee source art

Primary request: Create exactly one full-body bandit enforcer. Canonical facts: Medium humanoid,
adult human, heavy build gone slightly to seed, hired muscle for a road gang, studded leather over
a padded jack, iron-shod club and a knife at the belt, knuckles scarred, nose long-broken.
Personality/behavior verb: LOOMS. Signature silhouette feature: the club resting across one
shoulder, head tilted down toward the viewer. Preserve these exact identity landmarks: studded
leather, iron-shod club, broken nose.

Visual language: mature, restrained, frightening where canonically appropriate, large-faceted
polygonal Dungeons & Dragons fantasy. Use fewer, larger, anatomy- and construction-aligned
triangular planes. Use smaller facets only around face, eyes, joints, and critical equipment
landmarks. Believable weight, wear, materials, and adult visual seriousness. This is not World of
Warcraft, an MMO promotional render, a mobile game, a collectible toy, or a cartoon mascot.

Pose/expression: a controlled orthographic front-three-quarter figurine pose expressing LOOMS
through center of gravity, spine, head angle, gaze, limbs, and negative space. Combat behavior:
intimidation before violence; he wants you to back down. Support region: both boots planted wide.
Keep the pose mechanically usable as a standee.

Projection/framing: orthographic front-three-quarter, no lens distortion, full body and every
extremity visible, shared ground line, generous padding, no crop. No scenery, floor plane, cast
shadow, contact shadow, atmosphere, spell effect, unrelated prop, text, border, label, or watermark.

Geometry ownership: the source owns identity, silhouette, polygonal material/albedo regions, wear,
expression, and pose. Runtime geometry owns the plinth, thin side shell, contact shadow, scene
light, and directional highlights. Do not paint a base or shadow into the source.

Backdrop: perfectly flat solid magenta #FF00FF chroma-key background, completely uniform with no
gradient, texture, reflection, floor, horizon, or lighting variation. Do not use magenta in the
figure. Crisp separated edges.

Avoid: fake pixel art, voxel art, micro-triangulation, cracked-glass pattern, random polygon noise,
chibi proportions, cute mascot treatment, rubber anatomy, inflated muscles, oversized shoulders,
oversized hands/boots/weapons/teeth, candy saturation, glossy plastic, friendly monster grin,
generic hero pose, theme-park fantasy, sanitized horror, cosplay cleanliness, baked rim light, and
poster scene.
```

### 1B — quadruped anchor: scarred feral guard dog

```text
Use case: stylized-concept
Asset type: Genesis ANIMAL standee source art

Primary request: Create exactly one full-body scarred guard dog gone feral. Canonical facts:
Medium beast, adult mastiff-line dog, once patrol-trained and now answering to no one, ribs
starting to show, one torn ear, old rope collar rotted to a frayed ring, hackles permanently
half-raised. Species locomotion: quadruped stalk, weight low over the forequarters. Personality/
behavior verb: STALKS. Signature silhouette feature: the lowered head below the shoulder line,
hackles up. Preserve these exact identity landmarks: torn ear, frayed rope collar, visible ribs.

Visual language: mature, restrained, frightening where canonically appropriate, large-faceted
polygonal Dungeons & Dragons fantasy. Use fewer, larger, anatomy- and construction-aligned
triangular planes. Use smaller facets only around the face, eyes, joints, and the collar. True
canine anatomy — no anthropomorphism. Believable weight, wear, and adult visual seriousness. This
is not a cartoon mascot, a toy, or a friendly pet illustration.

Pose/expression: a controlled orthographic front-three-quarter figurine pose expressing STALKS —
one forepaw mid-step, head low, gaze locked on the viewer. All four paws' support region compact.
Keep the pose mechanically usable as a standee.

Projection/framing: orthographic front-three-quarter, no lens distortion, full body and every
extremity visible, shared ground line, generous padding, no crop. No scenery, floor plane, cast
shadow, contact shadow, atmosphere, unrelated prop, text, border, label, or watermark.

Geometry ownership: the source owns identity, silhouette, polygonal material/albedo regions, wear,
expression, and pose. Runtime geometry owns the plinth, thin side shell, contact shadow, scene
light, and directional highlights. Do not paint a base or shadow into the source.

Backdrop: perfectly flat solid magenta #FF00FF chroma-key background, completely uniform. Do not
use magenta in the figure. Crisp separated edges.

Avoid: fake pixel art, voxel art, micro-triangulation, random polygon noise, chibi proportions,
cute mascot treatment, rubber anatomy, candy saturation, glossy plastic, friendly grin, baked rim
light, and poster scene.
```

### 1C — monster anchor: undead knight

```text
Use case: stylized-concept
Asset type: Genesis MONSTER standee source art

Primary request: Create exactly one full-body undead knight. Canonical facts: Medium undead,
skeletal warrior in the full plate it died in, armor dented and rust-bitten at every joint, tabard
reduced to a few stiff scorched strips, longsword notched, kite shield split but carried. Horror
mechanism: it still keeps drill-ground posture — the discipline outlived the man. Personality/
behavior verb: HOLDS THE LINE. Signature silhouette feature: the split kite shield locked at
guard, sword low in second position. Preserve these exact identity landmarks: dented full plate,
split kite shield, scorched tabard strips.

Visual language: mature, restrained, frightening where canonically appropriate, large-faceted
polygonal Dungeons & Dragons fantasy. Use fewer, larger, anatomy- and construction-aligned
triangular planes. Use smaller facets only around the skull, eye sockets, joints, and armor
junctions. Believable weight, wear, materials, and adult visual seriousness. This is not World of
Warcraft, an MMO promotional render, a mobile game, a collectible toy, or a cartoon mascot.

Pose/expression: a controlled orthographic front-three-quarter figurine pose expressing HOLDS THE
LINE — weight centered, shield presented, utterly still. Support region: both sabatons planted at
shoulder width. Keep the pose mechanically usable as a standee.

Projection/framing: orthographic front-three-quarter, no lens distortion, full body and every
extremity visible, shared ground line, generous padding, no crop. No scenery, floor plane, cast
shadow, contact shadow, atmosphere, spell effect, unrelated prop, text, border, label, or watermark.

Geometry ownership: the source owns identity, silhouette, polygonal material/albedo regions, wear,
expression, and pose. Runtime geometry owns the plinth, thin side shell, contact shadow, scene
light, and directional highlights. Do not paint a base or shadow into the source.

Backdrop: perfectly flat solid magenta #FF00FF chroma-key background, completely uniform. Do not
use magenta in the figure. Crisp separated edges.

Avoid: fake pixel art, voxel art, micro-triangulation, cracked-glass pattern, random polygon
noise, chibi proportions, cute mascot treatment, rubber anatomy, inflated muscles, oversized
shoulders, oversized hands/boots/weapons/teeth, candy saturation, glossy plastic, friendly monster
grin, generic hero pose, theme-park fantasy, sanitized horror, cosplay cleanliness, baked rim
light, and poster scene.
```

### 1D — boss anchor: black dragon

```text
Use case: stylized-concept
Asset type: Genesis MONSTER standee source art

Primary request: Create exactly one full-body adult black dragon. Canonical facts: Huge dragon,
acid-breathing swamp apex predator, horns sweeping forward framing a skull-like face, scales
glossy-black going acid-etched grey at the jaw and throat, wings half-furled, tail coiled around
the support region. Combat behavior: cruel ambusher — it plays with drowning prey. Horror
mechanism: the skull face reads as already dead. Personality/behavior verb: COILS. Signature
silhouette feature: the forward-swept horns over a lowered, level head. Preserve these exact
identity landmarks: forward-swept horns, skull-like face, acid-etched jaw.

Visual language: mature, restrained, frightening where canonically appropriate, large-faceted
polygonal Dungeons & Dragons fantasy. Use fewer, larger, anatomy- and construction-aligned
triangular planes across the body and wing membranes. Use smaller facets only around the face,
eyes, horn bases, claws, and jaw. Believable mass and wet-swamp wear. This is not World of
Warcraft, an MMO promotional render, a collectible toy, or a cartoon mascot.

Pose/expression: a controlled orthographic front-three-quarter figurine pose expressing COILS —
weight gathered over the haunches, head low and level, wings half-furled, tail wrapped tight to
keep the silhouette compact around the support region. Keep the pose mechanically usable as a
standee.

Projection/framing: orthographic front-three-quarter, no lens distortion, full body and every
extremity visible including wingtips and tail, shared ground line, generous padding, no crop. Use
4:8 framing if needed for the wing height. No scenery, floor plane, cast shadow, contact shadow,
water, atmosphere, spell effect, text, border, label, or watermark.

Geometry ownership: the source owns identity, silhouette, polygonal material/albedo regions, wear,
expression, and pose. Runtime geometry owns the plinth, thin side shell, contact shadow, scene
light, and directional highlights. Do not paint a base or shadow into the source.

Backdrop: perfectly flat solid magenta #FF00FF chroma-key background, completely uniform. Do not
use magenta in the figure. Crisp separated edges.

Avoid: fake pixel art, voxel art, micro-triangulation, cracked-glass pattern, random polygon
noise, chibi proportions, cute mascot treatment, rubber anatomy, inflated muscles, oversized
teeth, candy saturation, glossy plastic, friendly monster grin, theme-park fantasy, sanitized
horror, baked rim light, and poster scene.
```

### 1E — wall-prop anchor: ornate heraldic shield (contract B — prop prompt, §7)

```text
Use case: stylized-concept
Asset type: Genesis wall-mounted prop source art (shallow-extrusion front elevation)

Primary request: Create exactly one ornate heraldic wall shield. Canonical facts: a high-tier
ceremonial kite shield, ivory field with gold filigree scrollwork, deep blue cabochon gems at the
chief and boss, edges bruised by real use — one filigree run snapped, one gem socket empty. This
is an old noble artifact, not starter loot.

Visual language: mature large-faceted polygonal Dungeons & Dragons fantasy. Fewer, larger,
construction-aligned facets in the metalwork; smaller facets only at the gem settings and the
damage. Believable materials — old ivory, worked gold, stone-set glass. Not World of Warcraft
heraldry, not a game icon, not a toy.

Projection/framing: STRICT ORTHOGRAPHIC FRONT ELEVATION. No visible top, side, or underside
planes; no foreshortening; no painted thickness; no baked facet lighting; no cast shadow. Exactly
one prop, centered, generous padding, no crop. Real triangulation, bevels, side shell, and theater
lights are added by geometry later — the source is the flat front identity/material layer only.

Backdrop: perfectly flat solid green #00FF00 chroma-key background, completely uniform. Do not use
green in the prop. Crisp separated edges.

Avoid: perspective drift, scene contamination, text, border, watermark, painted highlights
pretending to be geometry, candy saturation, glossy plastic, generic red-and-blue starter-tier
game loot.
```

---

## MASTER TEMPLATE FOR LANES 2–5

Each lane below is a list of identities. For each identity, compile ONE call from
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8 (the same template Lane 1's prompts are
compiled from — copy any Lane-1 prompt and swap the bracketed content) using the lane table's
fields. One identity per call. Category insertion requirements (§6.8): monsters add combat
behavior + horror mechanism + support region; NPCs add social attitude + occupation + practical
carried objects + restrained noncombat pose; animals add locomotion + true scale + no
anthropomorphism; PCs add exact loadout + class cues + neutral-ready pose.

## LANE 2 — undead wave (monsters)

| slug | identity seed (fill §6.8 brackets from this) |
|---|---|
| spr-fantasy-skeleton | Medium undead, bare skeletal footman, rusted scraps of harness, shortsword+buckler — verb: SHAMBLES-TO-ORDER |
| spr-fantasy-skeleton-warrior | Medium undead, drilled skeletal soldier, matched kit better-kept than its flesh ever was — verb: ADVANCES |
| spr-fantasy-skeleton-archer | Medium undead, skeletal archer, quiver of mismatched scavenged arrows — verb: DRAWS |
| spr-fantasy-flaming-skeleton | Medium undead, skeleton wreathed in low blue-orange flame licking from the ribcage — verb: BURNS |
| spr-fantasy-minotaur-skeleton | Large undead, bull-skulled giant skeleton, one horn sheared — verb: CHARGES |
| spr-fantasy-warhorse-skeleton | Large undead, skeletal warhorse, barding straps still buckled to bone — verb: REARS |
| spr-fantasy-zombie | Medium undead, fresh-enough corpse, grave clothes, wrong-angle jaw — verb: LURCHES |
| spr-fantasy-zombie-plague-carrier | Medium undead, bloated weeping carrier, rag-wrapped hands — verb: SEEPS |
| spr-fantasy-ogre-zombie | Large undead, ogre corpse gone grey, dragging a splintered club — verb: DRAGS |
| spr-fantasy-eye-tyrant-zombie | Large undead aberration, rotting eye tyrant, dead stalks trailing, central eye clouded — verb: DRIFTS |

## LANE 3 — goblinoid + kobold wave (monsters)

| slug | identity seed |
|---|---|
| spr-fantasy-goblin-warrior | Small humanoid, wiry goblin line-fighter, hide scraps, chipped spear — verb: DARTS |
| spr-fantasy-goblin-minion | Small humanoid, underfed goblin conscript, oversized hand-me-down helmet (worn honestly, not cute) — verb: COWERS-FORWARD |
| spr-fantasy-goblin-hexer | Small humanoid, goblin hexer, bone-fetish staff, painted warding eye — verb: CURSES |
| spr-fantasy-goblin-boss | Small humanoid, scar-heavy goblin boss, looted captain's cuirass cut down to fit — verb: COMMANDS |
| spr-fantasy-goblin-cutter-minion | Small humanoid, goblin cutter, two knives, no armor worth the name — verb: CIRCLES |
| spr-fantasy-hobgoblin-soldier | Medium humanoid, hobgoblin legionary, lamellar and tower shield, drill-perfect — verb: LOCKS-SHIELDS |
| spr-fantasy-hobgoblin-captain | Medium humanoid, hobgoblin captain, crested helm, longsword at rest-ready — verb: JUDGES |
| spr-fantasy-hobgoblin-iron-shadow | Medium humanoid, hobgoblin iron shadow, unarmored monk wraps, iron-grey discipline — verb: FLOWS |
| spr-fantasy-kobold | Small humanoid, kobold skirmisher, sling and scavenged buckler — verb: SCURRIES |
| spr-fantasy-winged-kobold-urd | Small humanoid, winged kobold, ragged bat wings half-spread, rock clutched — verb: STOOPS |

## LANE 4 — bandit + cultist wave (mixed monster/NPC register)

| slug | identity seed |
|---|---|
| spr-fantasy-bandit | Medium humanoid, road bandit, patched gambeson, hatchet+knife — verb: WAYLAYS |
| spr-fantasy-desperate-bandit | Medium humanoid, starving first-winter bandit, farm clothes, boar spear — verb: TREMBLES-READY |
| spr-fantasy-bandit-captain | Medium humanoid, bandit captain, stolen officer's coat, saber — verb: APPRAISES |
| spr-fantasy-bandit-deceiver | Medium humanoid, bandit deceiver, respectable traveler's clothes hiding wire and knife — verb: CHARMS |
| spr-fantasy-bandit-courier | Medium humanoid, bandit courier, riding leathers, satchel chained to wrist — verb: SLIPS-PAST |
| spr-fantasy-bandit-crime-lord | Medium humanoid, crime lord, quiet expensive tailoring, rings over scarred knuckles — verb: OWNS-THE-ROOM |
| spr-fantasy-cultist | Medium humanoid, robed cultist, sickle, brand hidden at the collarbone — verb: MURMURS |
| spr-fantasy-cultist-fanatic | Medium humanoid, fanatic, robes torn to the waist, ritual scarring, twin daggers — verb: ECSTATIC-LUNGES |
| spr-fantasy-death-cultist | Medium humanoid, death cultist, grave-dirt hems, censer of ash — verb: TOLLS |
| spr-fantasy-fiend-cultist | Medium humanoid, fiend cultist, robe seams stitched with sinew, one arm going wrong — verb: OFFERS |
| spr-fantasy-elemental-cultist | Medium humanoid, elemental cultist, robe hems singed/soaked in opposition — verb: CHANNELS |
| spr-fantasy-aberrant-cultist | Medium humanoid, aberrant cultist, too many joints in one hand, eye-sigil vestments — verb: LISTENS-TO-NOTHING |

## LANE 5 — guards, faces + beasts (NPC register + animals)

| slug | identity seed |
|---|---|
| spr-fantasy-guard | Medium humanoid NPC, town guard, kettle helm, halberd grounded — verb: WATCHES |
| spr-fantasy-guard-captain | Medium humanoid NPC, guard captain, weathered breastplate, ledger under one arm — verb: ACCOUNTS |
| spr-fantasy-road-guard-elf | Medium humanoid NPC, elven road guard, longbow, oiled travel cloak — verb: MARKS-DISTANCE |
| spr-fantasy-dwarven-town-guard-captain-elderly-dwarf-decades-on-the-wall-trusted-by-everyone | Medium humanoid NPC, elderly dwarf captain, decades on the wall, worn-smooth axe haft — verb: STEADIES |
| spr-fantasy-dragonborn-temple-guard-devout-literal-minded-takes-the-oath-seriously | Medium humanoid NPC, dragonborn temple guard, polished votive scale, glaive — verb: BARS-THE-WAY |
| spr-fantasy-enforcer-dragonborn | Medium humanoid, dragonborn enforcer, knuckle-plated gauntlets — verb: CRACKS-KNUCKLES |
| spr-fantasy-orcish-caravan-guard-hired-muscle-with-a-reputation-for-actually-caring-about-the-cargo | Medium humanoid NPC, orc caravan guard, patched wagon-crew gear, cargo hook — verb: SHOULDERS |
| spr-fantasy-orcish-caravan-blacksmith-orc-repairs-wagon-wheels-faster-than-anyone-in-three-towns | Medium humanoid NPC, orc blacksmith, scorched apron, wheel-hammer — verb: SIZES-UP-THE-JOB |
| spr-fantasy-orcish-healer-gentle-hands-a-reputation-people-are-slow-to-trust | Medium humanoid NPC, orc healer, herb satchel, careful hands — verb: TENDS |
| spr-fantasy-giant-wolf-spider | Medium beast, giant wolf spider, low wide stance, eye cluster catching light — verb: FREEZES-THEN-RUSHES |
| spr-fantasy-shield-guardian | Large construct, shield guardian, rune-keyed slab body, amulet socket glowing faint — verb: INTERPOSES |
| spr-fantasy-guardian-naga | Large monstrosity, guardian naga, hooded serpent risen to speak, temple-jewelry verdigris — verb: WARNS |

## LANE 6 — state-family kits: FILL-IN ONLY (contract B, §4.1 — the resumed KIT LANE, P3-K)

> **2026-07-13 amendment (Adam's ruling: the kit lane runs separate from the figure lanes and is
> never preempted by them).** Eleven kit/prop source sheets ALREADY EXIST with alpha passes at
> `fantasy-pilot/raw-sheets/` on `codex/extruded-prop-pilot` — switch kit (4 parts), two door
> kits, floor-trap kit, wall-trap flat-props, shrine/portal components, chest, container,
> practical light, banner/sign, portables. **Do not regenerate those.** This lane's slots are the
> FILL-IN budget for what K1's crop/component-fit QA rejects — the arched-door frame/leaf
> mismatch is the one known reject today. Generate a slot below only when K1 rejects its sheet.

Compile from §7 (master prop prompt) + §4.1 kit contracts. GREEN #00FF00 chroma. Strict front
elevation, components isolated and separable, NEVER preassembled:

1. **Banded oak door kit** — empty ornate frame + matching leaf (closed identity), same authored
   scale so the leaf fits the frame aperture (§4.1 door kit).
2. **Wall lever kit** — base plate + lever arm + axle collar + indicator gem (§4.1 switch kit).
3. **Painted dragon tablet** — single wall-mounted shallow-relief portrait tablet, front elevation.
4. **Torn war banner** — single wall-hang, front elevation, heavy cloth reads by silhouette + facet.
5. **Floor trap plate** — single horizontal plate authored as a FLAT TOP-PROJECTION decal source
   (contract C — never an upright elevation).

> The chest and the practical-light fixture from the props handoff's 8-asset sample are NOT in
> this lane on purpose: faced-box containers and fixture geometry are procedural constructions
> (§4 routing), not extrusion sources. Do not generate PNGs for them.

---

## After the returns (the pipeline, unchanged)

Chroma removal → despill/dilation → bounds/anchor/scale analysis → canonical isolated renders →
blind visual judge → integrated theater matrix → admission record or typed rejection
(§9 Steps E–L). `technical-pass` is never sufficient; nothing ships without `in-game-pass`; the
legacy sprite stays the fallback until admission. Never report generated counts as completion.
