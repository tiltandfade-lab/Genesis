---
type: style-canon
status: LAW — verbatim source, never paraphrase
created: 2026-07-14
sources: dev/model-qa/faceted/PACKET-F1.md (§0 laws + Lane 1 master prompts), compiled from
  dev/model-foundry/FACETED-ART-REGENERATION-PRODUCTION-PLAN.md §6.8 (codex/extruded-prop-pilot)
---

# ART DIRECTION CANON — Adam's original art direction, verbatim (MASTER COPY)

**This is the single authoritative home.** Deep authority: `docs/FACETED-ART-REGENERATION-
PRODUCTION-PLAN.md` (§3 visual language, §4 construction routing + kits, §5 projections,
§6.8 figure master prompt, §7 prop master prompt, §8 state families, §9 production sequence).
Batch mechanics: `docs/FACETED-SHEET-TEMPLATE.md`. Both Claude (via CLAUDE.md) and Codex (via
AGENTS.md) are required to treat these files as LAW.

**DECISION-CAPTURE RULE (Adam, 2026-07-14):** any art-direction ruling made in ANY
conversation — Claude or Codex — is appended to this file (dated, in Adam's words) and
committed in the same session it was made. If it is not in this file, it does not exist;
a chat transcript is not a storage medium. Generation prompts are built FROM this file by
quoting, never by paraphrase — restating in different words is the drift vector that caused
the wide-bases, WoW-proportions, and oversimplified-props regressions of 2026-07-13/14.

**Why this file exists:** every sprite wave since F1 has drifted because each new template
PARAPHRASED this language instead of quoting it. Paraphrase mutates; quotes don't. Any future
batch template, session prompt, packet, or QA rubric MUST copy the blocks below verbatim.
Editing this file requires Adam's explicit sign-off; nothing else in the program may restate
these rules in different words.

**Proven results:** the F2–F15 run's admit-grade harvest (278 files) was generated under this
exact language. The 2026-07-14 round-2 drift (wide bases, WoW proportions) happened under a
paraphrase of it.

---

## The five style laws (PACKET-F1 §0, verbatim)

1. **Silhouette law.** Wide VARIETY of silhouettes across a wave — but the house bias is
   **lanky**: longer limbs, rawboned frames, weight carried in posture not bulk. Girth is
   **diegetic, never default**: a heavy body must belong to a life that could actually produce
   one — nobility, faction bosses, chefs, innkeepers, moneylenders. (This is a style law about
   world-logic, not body avoidance — when the situation supports it, commit to it fully.)
2. **Base law.** Creatures and animals build on a **compact, generally forward-facing support
   region** — never a wide sprawling stance. Tails wrap tight, wings furl, legs gather. The
   figure must sit a standee base without the silhouette fighting it.
3. **Style zone.** Adult register, always. **Realistic fantasy horror with a stylized
   triangulated low-poly twist.** NOT World of Warcraft styling; NOT Baldur's Gate 3 cinematic
   glamour. The exemplar corpus: the approved anchor returns +
   `faceted-extrusion-proof/fantasy-shield-v4.png` on `codex/extruded-prop-pilot`.
4. **Expression law.** Varied expression AND pose across every wave — no two figures on a sheet
   share a stance; tension and personality over pantomime.
5. **Sheet-economy law.** Large/Huge creatures = **1 per sheet** · Medium = **2 per sheet** ·
   Small/Tiny = **4 per sheet**. Every figure cell is a **vertical 4:8 frame**. Same category
   and register per sheet (never mix beasts with NPCs, monsters with children). Odd remainders
   ride alone rather than cross categories.

## The master-prompt language (PACKET-F1 Lane 1 / plan §6.8, verbatim)

These paragraphs go into every generation call exactly as written (only the per-subject facts
and the cell mechanics change):

> Visual language: mature, restrained, frightening where canonically appropriate — realistic
> dark-fantasy horror with a stylized triangulated low-poly twist. Large-faceted polygonal
> Dungeons & Dragons fantasy. Use fewer, larger, anatomy- and construction-aligned
> triangular planes. Use smaller facets only around face, eyes, joints, and critical equipment
> landmarks. Believable weight, wear, materials, and adult visual seriousness. This is not World
> of Warcraft, not Baldur's Gate 3 cinematic glamour, not an MMO promotional render, a mobile
> game, a collectible toy, or a cartoon mascot.

> Pose/expression: a controlled orthographic front-three-quarter figurine pose expressing [THE
> SUBJECT'S VERB] through center of gravity, spine, head angle, gaze, limbs, and negative space.
> Support region: compact, feet/paws gathered, facing forward. Keep the pose mechanically usable
> as a standee.

> Projection/framing: orthographic front-three-quarter, no lens distortion, VERTICAL 4:8 frame,
> full body and every extremity visible, shared ground line, generous padding, no crop. No
> scenery, floor plane, cast shadow, contact shadow, atmosphere, spell effect, unrelated prop,
> text, border, label, or watermark.

> Geometry ownership: the source owns identity, silhouette, polygonal material/albedo regions,
> wear, expression, and pose. Runtime geometry owns the plinth, thin side shell, contact shadow,
> scene light, and directional highlights. Do not paint a base or shadow into the source.

> Backdrop: perfectly flat solid magenta #FF00FF chroma-key background, completely uniform with
> no gradient, texture, reflection, floor, horizon, or lighting variation. Do not use magenta in
> the figure. Crisp separated edges.

> Avoid: fake pixel art, voxel art, micro-triangulation, cracked-glass pattern, random polygon
> noise, chibi proportions, cute mascot treatment, rubber anatomy, inflated muscles, oversized
> shoulders, oversized hands/boots/weapons/teeth, candy saturation, glossy plastic, friendly
> monster grin, generic hero pose, theme-park fantasy, sanitized horror, cosplay cleanliness,
> baked rim light, and poster scene.

## QA-derived anatomy addendum (2026-07-14 audit — additive, does not restate the above)

> Anatomy is strict: exactly one tail with exactly one tip on any tailed creature — no forked,
> mirrored, doubled, or floating tail segments; correct limb counts (wyverns are BIPEDAL — two
> legs plus wings; no fifth leg, no third wing); tails and wings connect to the body at one
> continuous, plausible joint.

## Decal exemption (Adam's ruling, 2026-07-14 — additive)

Triangulated faceting applies to FIGURES, PROPS, and EFFECTS. It does NOT apply to decals.
Decals (blood, water, grime, wear, scorch, crack, rust, moss, cobweb — flat surface marks) are
rendered as **naturalistic organic surface marks**: matte, irregular natural edges, realistic
stain/spread behavior for the material (blood pools and trails, moss creeps from crevices,
scorch feathers outward, cracks propagate along stress lines). Same adult horror register and
muted palette as the canon; NO triangulation, NO polygonal planes, NO faceted geometry of any
kind on a decal. Magenta-key, strict top or front projection per the decal contract.

## THE PIXEL CANON RULING (Adam, 2026-07-15 — additive; scopes the figure register above)

Adam's words, verbatim, after the flip-verdict sheet review:

> "i think for now we stick with the pixel art style and just try to get the magenta crud
> cleaned up"

> "the other thing we need to do is make sure that sprites are the canon thing, the docs that
> helped us generate them need to be made a critical part of the art department of this game
> now. those docs should be easy to find, easy to regenerate sprites with with the exact same
> style per realm"

**Scope of this ruling:** the LIVE creature/NPC standee register is the PIXEL corpus
(`assets/sprites/`, the v3 generation) and its style authorities (docs/SPRITE-GEN-V2.md, the
CLEAN-SHAPES amendment, the realm master palettes, the per-realm outline law) — consolidated
into **`docs/ART-DEPARTMENT.md`**, the pixel register's own canonical home and regeneration
runbook, a SIBLING of this file under the same quote-never-paraphrase discipline. The faceted
figure register above remains LAW for the faceted RESERVE corpus (re-admissible per creature)
and for any future faceted regeneration; the prop/decal/fx/tile lanes are untouched by this
ruling (their registers pend their own verdicts). The decision-capture rule continues to apply
to BOTH files: figure-art rulings land here or in ART-DEPARTMENT.md the session they are made.

## UI-icon delivery ruling (Adam, 2026-07-17 — additive)

> "make sure any icons you create for the mock ups get generated the a chroma keyed sprite sheet of FF00FF so claude can isolate and apply the icon to the UI"

Reusable icons created for mockups must therefore be delivered as a separate sprite sheet on a
perfectly flat `#FF00FF` chroma-key background, with isolated cells and no baked UI panel or
shadow. Screenshot-local incidental glyphs remain part of their rendered mockup and are not
treated as extractable icon assets.

## Interim visual-engine preservation ruling (Adam, 2026-07-18 — additive)

> "what i don't want to lose is the lovely lighting we have developed, we may have to make smaller sprites per monster but we can still use the ones we have for a lot, i still want to get the normal maps and general environment beauty in the system if that's possible. i mean if all we get is a top down estimation of the room that's cool but you would have to talk me through it"

Any interim visualizer proposal therefore has to be judged as a continuation of the established
lighting, normal-map, sprite, and environmental-beauty work—not as permission to replace it with an
unlit diagram. The exact interim layout remains a design-wave decision.

## Pre-alpha BattleMat and taste-card ruling (Adam, 2026-07-20 — additive)

> "P10.1 we will do some taste cards here, this will be a deep dive"

> "P10.2 ok here is where I am willing to come up with an interrim solution making use of sprites vs integrated objects into the scene. Ideally yes eventually obviously we want our rooms to look like XCOM and BG3 and Octopath Traveler, but until then...let's thing of things in terms of a gridded battlemat with elevated squares and depressed squares that indicate elevation, and blocks and cylinders that represent walls and columns that can be used as cover. If we can just get this 3D grid alone looking good, forget about rendering the objects for now. However, I do want the things in the scene to be represented by something....maybe a dot you can hover over with sprites of the object? we have these sprites built, we could make use of them. So we have the battlemap idea as our central scene. Optionally and potentially, we have our big sprites they are almost like final fantasy sprites, so what if we just made a very simple side view engagement scene? it might get complicated with more players, but we could potentially cycle through players and chance the side view of the battle zones? im sure what i am imagining is not clear, but literally imagine FF6 battle system. the selected PC is on the right, the enemies that are engaged with him are on the left at varying zones. melee is right in the PC sprite's face, ranged is a bit further away. Elevation could also be represented just by a little block that the sprite sits on. Let me know if this is nonsense or far fetched. combining the two views might prove difficult. though one could be more horizontal (the ff6 style battle) and the battle map style is more widescreen."

> "P10.4 I would say we stick with a nearly top-down view but this should be determined by taste cards"

> "p10.5 deep dive with taste cards"

> "p10.6deep dive and hinges on decisions made about prop representation in the interrim...pre alpha visual engine"

This ruling makes the nearly top-down 3D grid, elevation blocks/depressions, wall/cover blocks, columns, canonical
sprites, and hover-revealed object representation the first pre-alpha taste target. The side-view engagement scene
is explored as a derived companion lens, not presumed accepted as a second authoritative combat view. The four
first-round taste cards are recorded in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.1. Their generated layouts,
combatants, text, and UI details remain discussion evidence rather than canon.

## Full in-session shell and chest ruling (Adam, 2026-07-20 — additive)

> "i think chests would be easy enough to actually render on the map, it's just a rectangular cube with the sprite texture applied to each face."

> "and ok, these screens work as isolated screens, but what about with the actual UI for the rest of the game? we are going Disco Elysium over BG1&2 so, chat to the right, easily legible, in a transparent bg container so the type should be able to be visible even on large battle maps, maybe it gets a 15% transparency or something like that. and icons on the left for character info, and we don't want character info taking up the whole screen when the tab is selected, let's assume this is a desktop game or a horizontal tablet game. so that aspect ratio should be designed for."

Wave 10 visual evaluation must therefore use the complete in-session shell rather than isolated renderer frames.
The working target is left icon rail, central scene, persistent readable translucent chat on the right, and compact
information drawers that preserve the scene. Chests route to cheap textured box geometry before marker fallback.
Taste Cards E/F and the still-open responsive/layout questions are recorded in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.2. Their invented content and exact proportions remain noncanonical.

## High-resolution hybrid-renderer correction (Adam, 2026-07-20 — additive)

> "now can you show me a full suite of taste cards with UI integrated? I like this idea, what are some potential variations? also your render is full pixelart, but our engine is 3d with a pixel art layer on top, remember the lights with the cast shadows, the drop shadows and the normal maps? can you render some using as much f our actual assets as possible"

> "we never actually implemented the normal maps, so can you go ahead and simulate those? also we are running at a higher resolution than most of those tests"

The Wave 10 target is therefore not a globally pixel-art frame. The physical scene remains a clean,
high-resolution 3D diorama/battlemat: volumetric floors, walls, elevation, columns, cover blocks, stateful cheap
geometry, visible practical lights, and real cast shadows. Canonical pixel art is mounted into that scene as the
actor/object/texture layer, with crisp texels, physical shells or plinths where needed, alpha-respecting cast
shadows, and separate compact contact/drop shadows.

Normal maps are **not an implemented Genesis win**. `MATERIAL-IDENTITY.md` is a `SPECCED-WITH-SPIKE` proposal.
Wave 10 Cards G-L deliberately simulate modest normal-mapped relief so Adam can judge the intended material
future, but neither the cards nor older renderer captures are build evidence. Likewise, older lower-resolution QA
captures may establish composition, geometry, light, shadow, and asset provenance; they do not set the release
resolution target. Cards G-L are asset-informed high-resolution concept renders, not deterministic screenshots or
pixel-perfect reproductions of the referenced assets. Their ruling and links live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.3.

## Hybrid suite accepted as the working visual goal (Adam, 2026-07-20 — additive)

> "i think these are good enough to establish a working goal. we are actually somewhat close to this correct? we were just in the middle of rebuilding our actual map generating rolls, that was part of this design questionnaire right?"

Cards G-L now establish the working Wave 10 visual family. This accepts their common target—high-resolution 3D
substrate, crisp pixel-art citizens, integrated left rail/central tray/right conversation, compact secondary
surfaces, and scalable battlefield composition—without canonizing their generated prose, exact dungeon, icon art,
ratios, typography, individual geometry, or unresolved interaction behavior. They are a convergence goal and
comparison corpus, not final acceptance captures or permission to implement.

## Prop canon (plan §3/§4/§7 on codex/extruded-prop-pilot — verbatim pointers, Adam 2026-07-14)

Props and dressing are governed by three verbatim authorities on `codex/extruded-prop-pilot`
(`dev/model-foundry/FACETED-ART-REGENERATION-PRODUCTION-PLAN.md`); prompts must fill, never
shorten, the §7 master prop prompt ("Do not shorten it"):

1. **§4 construction-class routing** — every prop is classified before generation:
   EXTRUDE (flat things that become 3D by sprite extrusion: shield, plaque, sign, tablet,
   door leaf, blade, key) · LAYERED_EXTRUDE · FACED_BOX (chest/crate) · LATHE (urn, barrel) ·
   SWEEP (rope, chain) · MODEL_RECIPE (furniture, tree, rubble, trap mechanism) · DECAL · FX.
   When uncertain between EXTRUDE and a volumetric class, choose the volumetric class.
2. **§4.1 component-kit contract** — an object with moving, swappable, repeating, or
   independently deep parts is an assembly kit: the image model supplies ISOLATED component
   art, NEVER preassembled; the engine assembles and owns every state (door shut/ajar/open
   reuse one leaf sprite; lever left/right are deterministic rotations; pivots are metadata,
   never painted marks). Do not split fixed ornament; the goal is useful reuse, not maximum
   fragmentation.
3. **§7 master prop prompt** — the only legal prop generation prompt; runners replace only
   the bracketed fields. Its style paragraph ("mature, restrained, high-tier polygonal
   fantasy art… fewer, larger, deliberate triangular planes… Avoid cute, toy-like, glossy,
   generic starter-tier art… generic mobile-game loot") plus §3.2's facet scale law are the
   anti-WoW / anti-oversimplification gates for props. The 2026-07-14 prop drift happened
   because the pilot's queue JSON *shortened* §7 — shortening is the drift vector.
