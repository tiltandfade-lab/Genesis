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
