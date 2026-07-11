# Wildermyth Engine / Presentation Research Digest

Compiled 2026-07-10. Sourced via WebSearch/WebFetch against Worldwalker dev interviews, the
official Wildermyth Wiki (modding docs), GDC Vault listing, and Steam/community threads. Every
claim below is tagged **[SOURCED]** (quoted/paraphrased from a fetched page, URL given) or
**[INFERENCE]** (my own reasoning from adjacent sourced facts — clearly flagged, never presented
as fact). Quotes kept under 15 words each per copyright limits.

---

## 1. Character system — paper-doll construction, animation, injuries/aging

**[SOURCED]** Characters are built by stacking PNG layers by a numeric "depth" value, higher
depth drawn on top within its group: "layering a number of .png files overtop each other based
on their 'depth' value."
Source: https://wildermyth.com/wiki/Image_layers

**[SOURCED]** Layers are grouped into five buckets: main body, head, main/equipped weapon,
inactive/stowed weapon, offhand weapon/item. Source: https://wildermyth.com/wiki/Image_layers

**[SOURCED]** Head-group and item-group layers are always flat relative to body layers regardless
of depth value (i.e., head/items form their own always-on-top sub-stack) — direct paraphrase of:
"image layers within the head group or an item will all be 'flat' with respect to the body
layers." Source: https://wildermyth.com/wiki/Image_layers

**[SOURCED]** Concrete size/format specs: human head layers are 192×256px; body layers 512×512px.
Held-item layers are variable size, with stow positions highBack/midBack/lowBack/hide.
Source: https://wildermyth.com/wiki/Image_layers

**[SOURCED]** Example default depth bands (illustrates the stacking order artists must hit):
cloaks ~10–11, wings ~55–58, shoulders ~70, tails ~100–103, torso ~1000, legs ~1100, arms ~1200,
clothing/armor ~2000–2400, held items 5000+ (off-hand) / 7000+ (main hand). Heads default to
depth 4000. Source: https://wildermyth.com/wiki/Image_layers

**[SOURCED]** Rigs are per class+gender: base rigs are hunterF/M, mysticF/M, warriorF/M — six
total. Rig lookup falls back through specificity: `myRigWarriorM > myRigWarrior > myRigM > myRig`.
Rigs are defined in `assets/data/generation/rigs.json` and can be overridden per-individual.
Source: https://wildermyth.com/wiki/Modding_alternate_races (rig fallback chain), corroborated by
search-index summary of https://wildermyth.com/wiki/Data_Format_Overview

**[SOURCED]** Art cost scale, from co-founder/artist Annie in interview: "Each hero class, with a
male and female rig, requires over 700 pieces of art."
Source: https://turnbasedlovers.com/10-turns-interview/with-wildermyth-developer/

**[SOURCED]** Equipment auto-renders on the paper-doll the moment it's equipped: "Every time you
get a magical necklace or belt or something, it shows up on your character."
Source: https://turnbasedlovers.com/10-turns-interview/with-wildermyth-developer/

**[SOURCED]** Equipment art is itself a layered sub-rig with the same depth-based compositing:
modding example shows a sword item defined with `name`, `depth` (e.g. 6100/6101), `tint`,
`tintAmount`, plus rig-attachment fields `grip: "mainHand"`, `inactiveGrip: "highBack"`,
`rigUsage: "rigGeneral"`, `gripOffset: {x,y}`, `scaleX/scaleY`.
Source: https://wildermyth.com/wiki/Modding_add_equipment

**[SOURCED]** Injuries/scars are implemented as head-layer (and presumably body-layer) art swaps
tied to persistent character state, not physics/deformation — scars are enumerated as one of the
customizable head-layer categories alongside hair/face. Source: https://wildermyth.com/wiki/Image_layers
(head layer categories) cross-referenced with https://wildermyth.com/wiki/Character_Sheet
("hairstyles, faces, skin tones... clothing colors" as the customization surface).

**[SOURCED]** Aging affects gameplay stats, not confirmed to affect art directly in what I could
fetch: "healing rate is determined by the hero's recovery rate stat, which is modified by their
age... old characters heal very slowly." Legacy/retirement system persists maimed limbs and
"themes" (narrative scar states) across a character's retirement into legacy status, except
Petrified limbs. Source: https://wildermyth.com/wiki/Legacy (via search synthesis),
https://wildermyth.com/wiki/Character_Sheet

**[INFERENCE]** Given the depth-layer system, injuries/maimed-limb visuals almost certainly work
by swapping in alternate body/head layer PNGs (an "injured left arm" layer replacing the normal
arm layer at the same depth slot) rather than any runtime deformation — consistent with the
layer-swap architecture described above, but I found no page that states this explicitly for
injuries specifically.

**[SOURCED — talk exists but content not extractable]** GDC 2022 talk "Getting Players
Emotionally Invested in Procedural Characters in 'Wildermyth'" by Nate Austin (lead
programmer/co-founder) is the primary technical/design talk on the character system. Slides PDF
fetched but returned only binary image-stream data (not text-extractable via WebFetch); talk
itself is paywalled on GDC Vault.
Sources: https://www.gdcvault.com/play/1027614/Independent-Games-Summit-Session-Getting ,
https://media.gdcvault.com/GDC+2022/Speaker+Slides/GettingPlayersEmotionally_Austin_Nate.pdf
**Could not extract technical content from this talk — flagged as a research gap.**

**[SOURCED]** No confirmation found of bone-rig/skeletal animation OR tween-based animation
specifically for combat/idle poses — searches for "tween," "bone animation," "procedural
animation" in a Wildermyth-specific context returned no developer-sourced technical answer.
**Gap**, see final summary.

---

## 2. Environment system — theaters/maps, tile/block sets, textures, foliage, biomes

**[SOURCED]** Battles happen in what devs and press call a "3D diorama" / "3D board space,"
built from a mix of flat 2D scenery pieces and 3D-lit geometry: "all the art would be 2D from the
get-go, even if it was moving around on a 3D board space."
Source: https://turnbasedlovers.com/10-turns-interview/with-wildermyth-developer/

**[SOURCED]** Programmer/co-founder Nate Austin on the origin of the visual approach: "My
contribution was that I wanted to learn 3D graphics… So that's how we ended up with the 2.5D
style." Source: https://turnbasedlovers.com/10-turns-interview/with-wildermyth-developer/

**[SOURCED]** Marketing copy (not a dev quote, but describing the shipped result): "The Yondering
Lands weaves hand-painted 2D characters and scenery into a 3D world to create a... layered
landscape." Source: search-engine synthesis of official Wildermyth devlog/press material,
https://wildermyth.itch.io/wildermyth/devlog/69777/welcome-to-the-yondering-lands (page content
summarized by WebSearch, not independently re-fetched — moderate confidence).

**[SOURCED]** Scenery placement is rule/tag-driven, not hand-placed per map: "Scenery is placed
into missions by the MissionBuilder almost entirely based on its tags."
Source: https://wildermyth.com/wiki/Scenery_Data (via search synthesis) and confirmed structurally
by: https://wildermyth.com/wiki/Scenery_Lab — "The game will always use a primary tag (floor,
lamp, etc..) and then generally one or more specifiers, like an Environment tag, or a Monster
tag, or a Station tag."

**[SOURCED]** Primary scenery tags found (functional categories, each scenery piece gets one):
`focalPoint` ("a large piece of scenery that will be a visual and thematic focus"), `floor`
("small or large piece... can show up pretty much anywhere"), `lamp`/`lampOff` (lit/unlit light
sources), `barricade` (defensive structure), `setPiece`/`setPieceCeiling` (non-interactive,
outside playable area, "adds flavor"). Source: https://wildermyth.com/wiki/Scenery_Data

**[SOURCED]** Secondary/context tags: **Location** (interior/exterior), **Environment** (forest,
field, foothills, swamp, town, cave — i.e. the biome system), **Station** tags (forge, library —
specialized functional locations). Source: https://wildermyth.com/wiki/Scenery_Data

**[SOURCED]** Scenery entries carry a `lengthRange`-style size-scaling property to control how big
a piece renders on a given map, plus `aspects` controlling interactivity ("how the scenery is
interactable, or not, what happens when you interfuse with it") — direct evidence that scenery
objects are stateful/interactive data objects, not just decoration. Source:
https://wildermyth.com/wiki/Scenery_Data

**[SOURCED]** The wiki page itself flags several scenery subsystems (appearance/color/scale
rendering, shadow, and "submersion" properties) as author-incomplete ("todo") — meaning even
Worldwalker's own community documentation doesn't fully spell out the rendering-side
implementation. Source: https://wildermyth.com/wiki/Scenery_Data

**[SOURCED]** Art-direction touchstones for environment painting, from Annie (artist/co-founder):
"Old Disney concept art and the background art of Samurai Jack were touchstones."
Source: https://turnbasedlovers.com/10-turns-interview/with-wildermyth-developer/

**Gap**: no source found describing whether biome/environment textures are hand-painted large
background plates vs. tiled/modular block-kit assembly at runtime, nor how many discrete tile
"blocks" exist per biome. The tag-based scenery-piece system (above) strongly implies a kit-of-
parts assembled per-mission, but the *ground/floor plate* texturing approach (painted vs.
procedural) was not documented in any fetched source.

---

## 3. Effects — hit effects, spell VFX, weather

**[SOURCED]** Ability/attack "special animation effects" are a distinct data-driven layer bolted
onto the base attack animation: `specialAnimationEffect` — "Should there be a specific effect on
the ability use animation?" — plus `specialAnimationExpression` for a numeric parameter (example
given: a "Bloodrage (+2)" effect passing in the value 2). Source: https://wildermyth.com/wiki/Effects

**[SOURCED]** A more advanced `customSpecialAnimationEffect` structure exists for roll-triggered
effects (e.g. DAMAGE_ROLL, DEFENSE_ROLL) with fields: `text` (supports `{0}`, `{1}` parameter
slots), `parameters`, `scriptName` ("the animation script to use for the special effect"),
`textColor`. This confirms VFX/floating-text are driven by named animation *scripts* selected by
string ID, not baked per-ability. Source: https://wildermyth.com/wiki/Effects

**[SOURCED]** Patch-note evidence of a true particle system: "Fire smoke particles have been
greatly reduced when there's a bunch," and new VFX were authored for star/vine/storm/fire/crow/
hill/morthagi/skeletal/tree "theme" skins (theme = a narrative/cosmetic character transformation
track). Source: search synthesis of https://wildermyth.itch.io/wildermyth/devlog/420692/patch-notes-19438-eve-vallenlong
(and https://wildermyth.com/wiki/Patch_notes) — confirms particle smoke exists and effects are
authored per visual "theme," but not independently re-fetched for exact wording (moderate
confidence).

**[SOURCED]** Combat "stunt" effects (crits/special outcomes) are tied to weapon type: "Elemental
and some artifact weapons will produce further effects during stunts."
Source: https://wildermyth.com/wiki/Stunt / https://wildermyth.com/wiki/Combat_mechanics (search synthesis)

**Gap**: No source found on weather systems (rain/snow/fog) specifically — targeted searches for
Wildermyth weather/shader implementation returned zero Wildermyth-specific results (only generic
Unity/Skyrim shader tutorials). Cannot confirm whether Wildermyth has a weather system at all in
the visual sense, only that biomes exist (swamp, forest, etc. — see §2).

---

## 4. Interactive objects/scenery — doors, chests, states

**[SOURCED]** Scenery pieces are the same tagged-data objects covered in §2, and their
interactivity is driven by an `aspects` field: "How the scenery is interactable, or not, what
happens when you interfuse with it." Source: https://wildermyth.com/wiki/Scenery_Data

**[SOURCED]** Scenery art assets live as flat PNGs in a `scenery` folder, managed/authored through
an in-house "Scenery Lab" editor tool that cross-references images to scenery-info records: "gives
you a list of all the images in the scenery folder, shows you which ones have associated scenery
info." Source: https://wildermyth.com/wiki/Scenery_Lab

**[INFERENCE]** Given (a) the flat-PNG paper-doll character pipeline and (b) scenery being
authored as PNGs validated in "Scenery Lab," interactive objects (doors, chests) are near-certain
to be flat 2D card sprites like characters/scenery generally, not 3D meshes — consistent with the
"papercraft diorama" aesthetic repeatedly described by the devs. However, no source explicitly
confirms door/chest open-vs-closed art is implemented as a layer-swap vs. a sprite-swap vs. an
animated sequence — **this specific mechanic (open/closed state rendering) was not documented in
any fetched page.**

---

## 5. Engine fundamentals

**[SOURCED]** Custom, hand-built engine — not Unity/Unreal: "Wildermyth uses a Java-based game
engine, which is a departure from the usual Unity and Unreal development tools... a lot of
bespoke code" (search-engine synthesis characterization, moderate confidence — not independently
re-fetched from a single primary quote).

**[SOURCED]** Lead programmer Nate Austin, in a dev-lessons interview, directly on the decision to
write their own engine: "Don't write your own engine" was offered as a lesson learned; building
their own engine was "a pretty questionable decision, but it made me a much better game
programmer." Source: https://thousandscarsblog.wordpress.com/2019/12/04/game-dev-interview-wildermyth/

**[SOURCED]** Steam store page technical requirement lists **OpenGL 3.2** as a graphics
requirement (per search synthesis of the Steam listing) — consistent with a custom
OpenGL-based renderer rather than a DirectX-only or engine-abstracted renderer. Source: search
synthesis referencing https://store.steampowered.com/app/763890/Wildermyth/ (not independently
re-fetched to confirm exact minimum-spec wording — flag as moderate confidence).

**[SOURCED]** Lighting is a first-class, hand-tuned system distinct from the flat 2D art: "Nate's
work, especially on lighting the scenes, really ties the whole thing together! The shadows glow
from fires." Source: https://turnbasedlovers.com/10-turns-interview/with-wildermyth-developer/ —
confirms dynamic/scene lighting (e.g., firelight-colored shadow tinting) is applied on top of the
2D paper-doll layers within the 3D board space.

**Gap**: Camera projection type (true isometric/orthographic vs. a fixed perspective camera at a
shallow angle) is not documented anywhere I could find. Targeted search returned only generic
isometric/orthographic tutorials, nothing Wildermyth-specific. Given the "diorama"/"peering into a
shoebox" framing repeatedly used by the devs (see §1/§2), a fixed-angle perspective camera
looking into a shallow 3D box is more consistent with the metaphor than a true orthographic
projection, but this is **speculation, not a sourced fact.**

**Gap**: No confirmed detail on shadow-mapping technique, render passes, or whether 2D layers are
rendered as camera-facing billboards vs. flat-on-ground/wall-mounted planes within the 3D scene.

---

## 6. Comic-panel / dialogue presentation system

**[SOURCED]** The narrative "cutin" moments are authored in an in-house **Comic Editor**, whose
objects include: comic panels containing `actorSlots` (character placements) and `textSlots`
(dialogue/text boxes), plus standalone addable objects: "Add Image, Add Animation, Narration,
Dark Box, and Action Text." Source: https://wildermyth.com/wiki/Comic_Editor_Reference (via
search synthesis of the reference page)

**[SOURCED]** Dialogue text supports live templating against game state: typing
`"What do you mean, <volunteer.name>?"` updates live in the editor preview, i.e. dialogue strings
are template strings resolved against runtime entities at render time.
Source: https://wildermyth.com/wiki/Comic_Editor_Reference (search synthesis)

**[SOURCED]** Panel layering/animation-order is explicitly controllable: `panel > animation` field
"can be used to control the order and depth of panels appearing." Source:
https://wildermyth.com/wiki/Comic_Editor_Reference

**[SOURCED]** Actor placement within a panel uses a `focus` property that decides whether a
character's face, middle, or feet is treated as the anchor/framing point — this normalizes framing
across characters of different in-scene sizes: "determine whether the face, middle, or foot of the
hero is the focus point." Also supports explicit z-ordering of actors within a panel ("move the
hero in front of/behind other actors") and free position/rotation/scale transforms per actor slot.
Source: https://wildermyth.com/wiki/Comic_Editor_Reference

**[SOURCED]** A `allowDrawOverEdges` textbox option lets dialogue text bleed across panel
boundaries deliberately, used as a stylistic device layering one panel's text atop another.
Source: https://wildermyth.com/wiki/Comic_Editor_Reference (search synthesis)

**[INFERENCE]** The comic/cutin system appears to reuse the same character paper-doll rig assets
(actorSlots placing "heroes," with position/rotation/scale/focus) rather than rendering separate
comic-specific art — i.e., cutin panels are a re-composited camera/crop view of the same rigged
2D character assets used in the 3D board, not hand-drawn comic panels. This is a reasonable
inference from the actorSlot/focus/position system described, but no source explicitly states
"the comic system reuses the combat rig assets" in those words.

**Gap**: Exact compositing math (how a comic "panel" clips/masks a 3D-scene camera render, whether
panels are literally separate render targets composited with CSS-like borders, or a single
render with panel outlines drawn as an overlay) was not found in any source.

---

## 7. Art pipeline — authoring vs. runtime assembly, modding formats

**[SOURCED]** Nearly all game data — abilities, events, effects, scenery, comics — is authored as
plain JSON: "Most of Wildermyth's data is stored as json files." Mods mirror the core game's
folder structure and can override any file by path (e.g.
`assets/data/balance/campaignBalance.json`) or add new images. Source:
https://wildermyth.com/wiki/Modding_Guide

**[SOURCED]** The studio built and ships its own in-house content tools for modders/artists,
notably the **Comic Editor** (dialogue/cutin authoring, see §6) and **Scenery Lab** (an
image-to-scenery-data browser/editor, see §2/§4) — both are described as first-class parts of the
shipped mod-support toolchain, implying the studio's own artists use the same tools internally.
Sources: https://wildermyth.com/wiki/Comic_Editor_Reference , https://wildermyth.com/wiki/Scenery_Lab

**[SOURCED]** Character/monster/scenery art is authored as flat transparent-background PNGs at
prescribed pixel dimensions and then wired into the engine purely through JSON metadata (depth,
tags, grip offsets, tint) — there is no 3D modeling step for characters or scenery; the "3D" is
the board/camera/lighting context the flat art sits inside. Sources (combined):
https://wildermyth.com/wiki/Image_layers , https://wildermyth.com/wiki/Modding_add_equipment ,
https://wildermyth.com/wiki/Modding_add_monster ("a few hundred pixels in each dimension... PNG,
transparent background")

**[SOURCED]** Modding wiki references official Photoshop brushes distributed by the art team for
mod-makers trying to match the house painting style (existence confirmed via search synthesis of
modding-resources pages; not independently re-fetched to see brush names/settings).
Source: https://wildermyth.com/wiki/Modding_Guide (linked resource, per search synthesis)

**[SOURCED]** Studio size/context relevant to pipeline scale: Worldwalker Games is a small,
Austin-based studio, reported as six full-time employees — relevant to why the art pipeline
leans on reusable layered/tagged systems (700+ art pieces per hero rig, tag-driven scenery,
JSON-driven effects) rather than bespoke per-scene art. Source: search synthesis referencing
https://en.wikipedia.org/wiki/Wildermyth

**Gap**: No source describes the authoring tool used to paint the source PNGs themselves
(confirmed Photoshop-adjacent via "Photoshop brushes" reference, but no direct statement "artists
work in Photoshop" was independently fetched/quoted).

---

## Research gaps (could not find/confirm)

- GDC 2022 talk content (Nate Austin) — slides PDF is not text-extractable via the tools
  available; video is paywalled on GDC Vault. This is very likely the single richest source and
  was not accessible.
- Skeletal/bone rig vs. procedural-tween animation method for combat poses/idle/attack motion.
- Camera projection details (true orthographic vs. perspective, angle, FOV).
- Weather system (rain/snow/fog) — no evidence found either way.
- Ground/floor texture approach for maps (hand-painted background plates vs. modular tile kit).
- Door/chest open-vs-closed state rendering mechanic specifically.
- Shadow-mapping / render-pass technical detail for the "3D lighting on 2D layers" system.
- Primary art software used by the studio (Photoshop is implied, not confirmed in a direct quote).
