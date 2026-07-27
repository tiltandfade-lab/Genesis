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

## EngagementLens selection and speakable-label ruling (Adam, 2026-07-20 — additive)

> "yea, it should collapse until a PC is selected, then it should appear and show who is in range for that character with a label under each character that way it will make it easier for the player to say to the DM I want to cast firebolt on goblin 2 or I want to charge in and bash gablin 1 in the face"

The EngagementLens is normally collapsed. Selecting a PC opens it as a derived action-and-targeting aid populated
from the authoritative SceneTray. Every displayed character receives a readable speakable label beneath the
figure, allowing natural-language references such as “Goblin 2” to resolve to the intended scene citizen. The
lens does not invent a second cast, position system, or combat authority. Exact pre-action range semantics and
generic-label lifecycle remain follow-up decisions in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.5.

## EngagementLens orientation and exact-tactics candidate (Adam, 2026-07-20 — additive)

> "though, since all the character UI stuff is on the left, the PC character should also be on the left and enemies to the right. I mean, we probably want both options to be available in reality. The player should be able to click fireball and click the target if the target is within range. I think we should probably also shwo the range of available movement FFT style when it is the PCs turn. and the player can then pick that movement. I prefer the XCOM UI over the FFT UI for this because it essentially allows you an auto dash if you decide to move into the 2nd tier of movement range
>
> i think in the FF6 Style visualizer it should probably also say the distance in ft from the PC.
>
> I know this is starting to get high resolution and complicated, but I am not sure a representational battlefield is going to cut it in this gaming market. I am completely open to feedback here and I also do not know the scale of work i am proposing with my design choices"

The selected PC belongs on the **left** of the EngagementLens, aligned conceptually with the left-side character
UI; enemy/target figures compose to the right. Lens labels should include their distance in feet from the PC.
Genesis should support both natural-language action declarations and direct tactical selection through one shared
validated action path. FFT-like reachable-cell display with an XCOM-like normal-move/second-tier-Dash distinction
is now the preferred exact-tactics candidate. Whether exact cells replace the current zone model as combat
authority remains an explicit Wave 10 decision in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.6; this ruling does
not itself authorize the substantially larger mechanics build.

## Exact-cell authority and explicit Dash-source ruling (Adam, 2026-07-20 — additive)

> "well, i do think it's probably worth it, i think battle will take forever if you have to clear every single position and move with the DM first, whereas most of this stuff can be done mechanically
>
> this is also probably worth looking for some github repos or existing tactical battle systems online to see if we can borrow, learn, or adopt any of the technology to our engine
>
> ok, BG3 handles it by letting you use your full movement action but then it forces you to select an action or bonus action to continue that movement, so the FFT movement blocks actually make sense again in that context."

Exact-cell combat is accepted as the intended release authority because routine position, movement, range, and
target legality should resolve mechanically instead of requiring a DM round trip for each cell. The BattleMat's
movement presentation must distinguish the currently spendable movement allowance from any extension requiring a
Dash-like source. Continuing past the normal allowance requires the player to select the Action, Bonus Action, or
other legal resource source explicitly; destination selection may not silently pay it. The exact visual treatment
of not-yet-purchased extended cells remains F10.1g in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.7.

## Locked movement-extension preview ruling (Adam, 2026-07-20 — additive)

> "yeah, option b is preferred to the BG3 model it is nice to see where you could end up with an extra movement, that way you don't waste your movement only to find out you were just short of being able to engage or get that treasure or item or whatever."

The BattleMat shows currently affordable movement cells as active and the cells unlockable by a currently legal
movement extension as a dim outlined or hatched locked region. The distinction cannot depend on color alone.
Selecting a locked destination previews its route and opens the legal payment-source chooser without moving or
spending. Destination presentation must also state whether the chosen payment leaves the Action, Bonus Action, or
other resource needed to engage, open, retrieve, activate, or otherwise use the destination affordance. Exact
mechanics and remaining follow-ups live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.8.

## Known-consequence-only movement warning ruling (Adam, 2026-07-20 — additive)

> "yes, option b is good"

Safe legal routes commit through the ordinary destination interaction without an extra modal. A route with a known
material consequence receives one concise pre-commit warning whose path markers and summary identify the trigger
cells without relying on color alone. The interface offers Continue/Choose Another Route rather than approval for
each cell. Hidden traps, unseen creatures, undiscovered hazards, and secret reaction choices remain invisible.
Exact consequence classes, input parity, costs, and undo follow-up live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.9.

## Bounded movement-undo ruling (Adam, 2026-07-20 — additive)

> "option B is good, the new FFT had that and it worked really well"

The BattleMat may offer Undo for a harmless committed movement segment, including restoration of its own movement
or Dash payment, only until the segment causes or is followed by an external consequence such as a roll, reaction,
hazard, reveal, other actor-state change, or committed action. Once sealed, the control explains why it is
unavailable. Preview remains freely cancelable; whole-turn rewind is not part of this ruling. Exact receipt,
memory, default-seal, and follow-up route-ranking rules live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.10.

## Resource-bounded safe-route ruling (Adam, 2026-07-20 — additive)

> "yes"

The BattleMat defaults to the safest known route within the movement budget the player has already authorized,
then to lower movement cost. A safer route requiring a new payment tier and a shorter route carrying known danger
appear as explicit alternatives rather than silently choosing Dash or exposure. Materially different consequence
types remain labelled choices rather than an unexplained aggregate risk score. Exact ranking, tie-break, cost, and
next label-lifecycle question live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.11.

## Monotonic local speakable-label ruling (Adam, 2026-07-20 — additive)

> "yeah option C of course"

Generic tactical labels remain stable within an encounter/continuous-site scope. Survivors are never renumbered,
retired numbers are never reused, hidden citizens receive handles only when revealed, and same-scope return or a
witnessed transformation preserves the handle without leaking hidden identity. Known proper names may replace the
display while the active generic alias remains usable. Generic combat numbers do not become permanent world names.
Exact lifecycle, save/replay, summon/split, cost, and later-callback follow-up rules live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.12.

## Rooted callback-label and player-joke ruling (Adam, 2026-07-20 — additive)

> "yeah of course, i mean the player might goof off and call them goblin 2 even after learning varka but that's the DM's problem"

A rooted unnamed citizen returning beyond a local tactical scope receives a stable viewpoint-safe callback
descriptor until a learned proper name becomes primary. Historical combat handles and established player
nicknames remain resolvable aliases without overwriting canonical identity. The engine identifies the referent;
the DM owns the social and narrative meaning of calling Varka `Goblin 2`. Ambiguity and secret-identity behavior
must never leak hidden canon. The completed label audit and returned Card J/K inspector question live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.13.

## Full scrollable board-object-card ruling (Adam, 2026-07-20 — additive)

> "no, i would rather see a board card that allows you to scroll within it's container to see the full description of the item. I think the right hand side should be for DM chat and narration exclusively."

The complete object inspector belongs inside the central SceneTray/BattleMat as a bounded card visibly linked to
the selected object. Identity, obvious state, and primary actions remain visible while the full known description
and secondary content scroll within the card's own container. The persistent right rail is reserved exclusively
for DM chat and narration; resolved object events may be narrated there, but structured inspector fields and
controls do not live there. Card K is rejected as the primary inspector home. Exact data, scroll, cost, and open
placement/persistence questions live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.14.

## Ephemeral smart-tooltip placement ruling (Adam, 2026-07-20 — additive)

> "the card should only be visible on click, and any click off hides the menu, it should smartly decide its own position based on the position of the item, the card should never run off the screen. it is essentially a smart tooltip with good card design."

Only clicking/activating an object opens its full scrollable board card; hover may highlight but does not open the
card. One card exists at a time, and any outside click dismisses it while inside scrolling and controls remain
interactive. Placement is automatic from the object's projected position and is constrained to the central
SceneTray safe rectangle so the card never runs offscreen or hides beneath UI chrome. There is no pinning, dragging,
or multiple-card desktop. Exact placement, focus, responsive, cost, and action-result follow-up rules live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.15.

## Receipt-driven board-animation and sound ruling (Adam, 2026-07-20 — additive)

> "B is good as long as we have board animation to make it clear that the PC piece moved, or the chest opened, or there was a sound for feedback"

An eligible object card remains open and refreshes after an inside action, but it cannot be the only feedback. A
committed receipt drives the PC standee along its exact path, performs the object's truthful governed state change,
and emits appropriate localized sound with visual/caption equivalents before or alongside DM narration. Mechanics
and board feedback do not wait for AI prose, and success feedback never precedes commitment. Refusal, transfer,
disappearance, accessibility, stale-response, and minimum-feedback-family questions live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.16.

## Tiered feedback-family target ruling (Adam, 2026-07-20 — additive)

> "C is a great place to aim for, later we can get more specific if we need to for certain things"

Receipt-driven feedback first uses a governed object/action-specific binding, then a reusable typed family, then a
truthful localized visual/sound/caption fallback, and finally a tracked presentation gap rather than false or
silent mechanics. Bespoke treatment may replace a fallback later without changing rules, receipt identity, save
state, timing, viewpoint, or accessibility. Exact families, cost, and the open minimum-proof question live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.17.

## Representative proof and interim EngagementLens-animation ruling (Adam, 2026-07-20 — additive)

> "yes, in the interrim we can think of things in terms of FF6 style battle in the bottom visualizer if that's easier to implement than on the 3d board"

The representative pre-alpha feedback spine is accepted. Interim expressive combat animation may use the
FF6-style bottom EngagementLens when cheaper than comparable 3D-board animation, but the lens remains a projection
of the same canonical receipt and never becomes a second combat authority. The exact board/lens responsibility
split, costs, examples, and open fallback question live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.18.

## Board-truth/EngagementLens-drama ruling (Adam, 2026-07-20 — additive)

> "B is great for that"

The BattleMat always shows the exact spatial, target/area, trigger, hazard, occupancy, object, custody, and minimum
result truth needed to understand a receipt. The bottom EngagementLens may provide richer interim sprite melee,
projectile, spell, reaction, damage, healing, and character-performance animation from the same receipt. A missing,
collapsed, disabled, or skipped lens never removes information or blocks play. Exact sequencing, duplication,
cost, and open auto-focus behavior live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.19.

## Active-character EngagementLens auto-follow ruling (Adam, 2026-07-20 — additive)

> "no, i kind of think it should be whoever the active character is. i think that's soething that will require playtesting, but let's go with option A for now"

In turn-based combat, the EngagementLens provisionally follows the canonical active turn character at activation
boundaries. Reactions and secondary effect sources animate within that tableau rather than recursively stealing
focus. This is a playtest-dependent default, not a proven final behavior; active-follow must be compared against
selected-PC-only focus, and an explicit disabled/accessibility/minimum-layout state still suppresses the lens
without losing board feedback. Exact focus, test, cost, and orientation follow-up rules live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.20.

## Stable EngagementLens faction-side ruling (Adam, 2026-07-20 — additive)

> "B is where it's at"

Party-controlled PCs and companions remain on the left of the EngagementLens and hostiles remain on the right.
The active turn citizen receives strong non-color-only emphasis wherever it stands; party actions travel left-to-
right, hostile actions right-to-left, and reactions originate from stable faction sides without stealing focus.
Exact directional-family cost and open manual-collapse/third-party questions live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.21.

## Encounter-scoped lens collapse and top-center initiative-ribbon ruling (Adam, 2026-07-20 — additive)

> "Option B is good enough for now.
>
> also i think we need an initiate order line. We can position it just like BG3 top center line, vertically centered on the line are the square portrait images (derived from big sprites) assuming there is a function smart enough to autocrop the sprites into portraits"

A deliberate manual EngagementLens collapse suppresses active-follow for the current encounter until explicitly
reopened; new combat restores the default unless a separate global/accessibility Lens Off preference is active.
The intended combat shell adds a thin top-center initiative/order line with square portrait images vertically
centered on it and derived from the canonical large sprites. Deterministic alpha/content-bound analysis,
silhouette-aware presets, whole-subject fallback, and reusable per-asset focus overrides keep the crop truthful
across humanoids and non-humanoids. The open question is whether those portraits present existing winner-first
side blocks or justify a separate per-creature initiative mechanics change; exact placement/crop/semantic costs and
F10.3k live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.22.

## Side-block initiative-ribbon ruling (Adam, 2026-07-20 — additive)

> "B is great"

The top-center portrait ribbon preserves side-based initiative. Portraits form winner-first party/hostile blocks;
the acting block and currently resolving citizen receive clear treatment without implying a fixed speed order
within either side. The accepted shell may later receive a per-creature initiative adapter without discarding its
portrait, label, layout, interaction, or accessibility work. Exact behavior and the open fixed-position/spent-state
question live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.23.

## Bonus-ordered faction-block initiative proposal (Adam, 2026-07-20 — additive)

> "so each character has an initiative bonus right? why not just let the characters go in the order of their initiative bonus? how much more difficult is that to calculate? we can still keep it as Faction chunked turns, but within that faction turns go in order of initiative. faction with highest average initiative bonus should go first unless narrative says otherwise"

The proposed ribbon order retains faction/chunk turns but gives them deterministic internal order: highest average
initiative-bonus block first, then highest individual bonus first inside that block, unless an established typed
narrative opening condition visibly overrides the calculation. The calculation is trivial; canonical actor state,
fallbacks, receipts, ties, reinforcement timing, and save/replay are the material integration work. Codex recommends
the hybrid; it remains under discussion at revised F10.3l in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.24.

## Deterministic bonus order with tie-only d20 ruling (Adam, 2026-07-20 — additive)

> "I just meant A, if necessary ties can be settled with d20 rolls"

Ordinary initiative is deterministic. Highest exact average-bonus faction/combat block acts first; members within
it act from highest individual bonus to lowest. Only exact equal block averages or individual bonuses trigger open
d20 tie-breaks, whose results are frozen for the encounter so the top-center portrait ribbon does not reshuffle
between rounds. Initiative Advantage/Disadvantage requires an explicit deterministic translation before this
becomes a complete rules contract; F10.3m and exact costs live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.25.

## Deterministic initiative Advantage/Disadvantage ruling (Adam, 2026-07-20 — additive)

> "A is good"

Net initiative Advantage adds a nonstacking `+3` to derived initiative priority; net Disadvantage subtracts `3`;
any amount of both cancels. The canonical sheet bonus remains unchanged, while portrait order and starting faction-
block averages consume the derived priority. Tie-only d20s stay unmodified to prevent double counting. The exact
accepted contract and open reinforcement-insertion question live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.26.

## Priority-position reinforcement insertion ruling (Adam, 2026-07-20 — additive)

> "A"

A revealed reinforcement joins its existing faction/combat block at its true derived-priority portrait position.
It may act in the current round only when its block and tier have not passed; otherwise it enters with an explicit
waiting marker and acts next round. Arrival never recalculates the block's frozen average/order, and no hidden
portrait or placeholder leaks before reveal. Exact receipts, scheduled/specific timing overrides, costs, and the
open new-faction question live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.27.

## New-faction priority insertion ruling (Adam, 2026-07-20 — additive)

> "A"

A newly revealed independent combat side receives its own frozen entry-average block and inserts by priority into
the remaining initiative future. If its rightful slot has passed, it waits until next round; existing blocks never
reorder retroactively. Political faction alone does not earn a block—current combat allegiance and independent
objectives do. Exact receipts, costs, and the open allegiance-transfer question live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.28.

## Immediate allegiance transfer with conserved activation ruling (Adam, 2026-07-20 — additive)

> "A"

When an allegiance-changing receipt commits, the same portrait moves immediately to its destination combat block
and all targeting/control/faction relations update, but its available/spent state follows it. Changing teams never
duplicates a turn. The transfer cue preserves identity and player-known cause without leaking hidden motive or
duration. Exact transaction boundaries, frozen-average behavior, costs, and the open narrative-override question
live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.29.

## Tiered typed narrative-opening authority ruling (Adam, 2026-07-20 — additive)

> "A"

Established narrative setup may affect initiative only through bounded trackable mechanics: priority conditions,
one already-declared/validated/triggered opening receipt, or a rare named scenario/system whole-block rule. Freeform
narration cannot simply place a faction first. The ribbon may show the honest known cause of an opening exception
without leaking secret provenance. Exact authority tiers, examples, costs, and the simultaneous-opening follow-up
live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.30.

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

## Mechanics-first pre-alpha physical-prop floor (Adam's ruling, 2026-07-20 — additive)

> "A"

This accepts Option A in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.37. The pre-alpha visual floor physically
integrates ground/elevation/traversal, boundaries/portals, tactical blocker/cover proxies, the common `FACED_BOX`
chest/container path, simple round containers/blockers, motivated practical lights, and simple mechanisms,
conditions, and hazards. Complex, handheld, small, or background nouns remain truthful marker/card/reserve
representations unless their canonical mechanics promote them into a physical family. Promotion preserves the same
object identity and uses honest primitive/composite geometry; it never invents collision from prose or requires a
bespoke 3D model merely because the AI DM invented the noun.

## Mode-specific invariant hybrid beauty floor (Adam's ruling, 2026-07-20 — additive)

> "B"

This accepts Option B in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.38. Every normal playable SceneTray must
preserve intentional composition, a clean high-resolution physical substrate, material and realm identity beyond
mere hue shifts, motivated light and controlled darkness, grounded crisp canonical pixel citizens, tactical and
semantic truth, a readable integrated shell, and composed truthful fallbacks. Expensive dressing and atmospheric
accents vary when semantically licensed; Card G's exact dungeon density is not a universal content quota. The
reference family remains mode-specific: the amended Cards G/H/L currently cover dungeon, selected action, and
large-field presentation, while integrated-shell town/social and wilderness/exploration references are still
required before Wave 10 closes.

## Governed overview/exploration/action camera ladder (Adam's ruling, 2026-07-20 — additive)

> "B"

This accepts Option B in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.39. The nearly top-down SceneTray camera uses
governed overview, room/exploration, and action/combat fits derived only from player-known canonical focus sets.
Bounded player pan, zoom, and rotation may override the starting fit, with immediate input and a one-step recenter;
programmatic refits may glide briefly and interruptibly. UI surfaces publish one safe rectangle and refit the same
scene without cropping required action evidence or forgetting the prior legal player-adjusted view. Full-board
overview is available, but it is not forced as the default scale for every action on a large field.

## Provisional single gentle-perspective SceneTray family (Adam's ruling, 2026-07-20 — additive)

> "B for now"

This provisionally accepts Option B in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.40. The working SceneTray uses
one stable, low-distortion gentle-perspective family, beginning from the existing roughly 20-degree FOV,
35-degree elevation, and 45-degree dimetric yaw. Governed focus changes target/distance rather than changing FOV;
exact cells and true world scale remain authoritative. Orthographic remains the mandatory same-state fallback: if
real captures show that perspective harms cell comprehension, sprite citizenship, picking, shadow truth, or the
accepted desktop/tablet gates without a material depth/composition gain, the release ruling returns to
orthographic rather than protecting the taste-card inference.

## Provisional restrained knowledge-and-attention ladder (Adam's ruling, 2026-07-20 — additive)

> "This is a real fork in the design. I guess Disco Elysium kind of had B, so we'll go B. it will require some playtesting though"

The SceneTray provisionally uses an `ambient -> noticed -> relevant -> active -> historical` attention ladder.
Ordinary scenery and interactables do not glow merely because an action exists. Noticed and relevant objects use
viewpoint-earned physical or sensory evidence; strong outlines, rings, labels, icons, paths, and area treatments are
reserved for active selection/targeting, urgency, player-invoked scan, or equivalent attention aid. Changed places
prefer physical state and plausible residue over permanent completion UI. Unknown secrets receive no affordance cue
beyond evidence the viewpoint has actually earned, and missing bespoke art uses a truthful marker/card/fallback
rather than suppressing a known interactable. This is explicitly playtest-dependent; the required clutter,
discoverability, secret-leakage, revisit, and equivalent-cue cases live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.42.

## Layered durable-history projection (Adam's ruling, 2026-07-20 — additive)

> "B"

The SceneTray keeps canonical history complete while mounting a bounded, layered physical projection. Current
mechanical/topological truth, identity-bearing objects, custody, protected evidence, promised callbacks, active
hazards, and meaningful scars remain distinct. Only genuinely interchangeable low-consequence residue may
coalesce into deterministic stain, debris, track, soot, or similar representative fields, with contributor history
and lawful remounting preserved. Lower visual detail may simplify presentation but never cleans, repairs, ages, or
forgets the world. Exact semantic protection, examples, costs, and the still-open lifecycle/evidence branches live
in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.43.

## Precision-honest historical remounting (Adam's ruling, 2026-07-20 — additive)

> "B"

When attention makes one coalesced or visually unmounted historical contributor relevant, the SceneTray restores
that same stable fact through the strongest representation its current state and original precision license. Exact
facts may remount at valid exact support; zone, relational, estimated, hidden, moved, covered, cleaned, repaired,
carried, or destroyed facts keep those truths rather than gaining convenient coordinates or returning to an old
position. One promoted contributor may temporarily split from its representative residue field and fold back later
without expanding all clutter. Missing art uses a truthful marker/card/fallback. Exact support validation,
examples, costs, and the still-open new-detail branch live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.46.

## Evidence-led focused inspection state (Adam's ruling, 2026-07-20 — additive)

> "B"

Searchable residue remains ordinary physical material until noticed or deliberately focused. The SceneTray does
not place universal magnifying-glass icons, hidden-capacity counts, progress bars, completion checks, or permanent
exhausted halos over rubble, ash, blood, tracks, shelves, or wreckage. The focused card/interaction may state which
known method was used, what this viewpoint learned, whether the same method is exhausted, and which stronger method
is currently known and legal; defocus returns the material to ordinary presentation. Player-invoked scan never
reveals unresolved slots, unknown methods, secret targets, or guaranteed contents. Exact inspection states, Gemini
phrasing, costs, and the still-open causal-reopening branch live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.48.

## Review-gated holder-aware card projection (Adam's ruling, 2026-07-20 — additive)

> "B but should be flagged as a feature that needs review"

The active SceneTray board, scan, focus, and actions show only acting-viewpoint plus applicable party-common
knowledge. The clicked ephemeral card may progressively disclose material source, holder, uncertainty, conflicting
claims, and human-earned private dramatic-irony perspective, but no unknown fact may produce a lock, blank tab,
portrait, `???`, unread count, layout reservation, focus change, scan change, disabled control, or animation. Human-
visible private content never enters an uninformed character's actions or narration. This direction is provisional:
the exact layout, perspective controls, disclosure depth, and transfer affordances require the mandatory visual/
interaction review and secret-leak/comprehension corpus in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.52.

## Causal-history card with expressive Gemini retelling (Adam's ruling, 2026-07-20 — additive)

> "B for now, as long as this doesn't result in dry storytelling"
>
> "B"

The clicked history card may lead with current truth, a compact deterministic causal spine, and expandable known
turning points/provenance rather than an exhaustive event log. Routine lifecycle and residue events may coalesce
into readable known summaries; attributed conflicts remain distinct; hidden history creates no blank entry or gap.
This structured card is not Gemini's required prose register. Gemini retells the same fact-locked spine with real
freedom over voice, cadence, imagery, emphasis, emotional framing, known motifs/callbacks, and length, while current
state, causality, custody, attribution, uncertainty, and viewpoint remain hard. The combined review rejects both
invented colorful history and dry receipt-dump narration. Exact hierarchy, narrative envelope, examples, costs,
and review corpus live in `PROCEDURAL-DUNGEON-DIRECTION.md` sections 11.52-11.54.

## Viewpoint-known physical custody and ownership projection (Adam's ruling, 2026-07-20 — additive)

> "Option B"

The SceneTray shows current possession/control and genuinely visible seals, crests, tags, wear, container context,
or restrictions as physical facts rather than one universal owner aura. The focused card separates holder/
custodian, operational controller, visible mark/apparent origin, attributed claimant, known title, and licensed use
only when material and viewpoint-earned. Pickup changes custody; gift, sale, loan, seizure, salvage, theft
resolution, faction law, or another owned event changes title/permission. A mark does not prove ownership, a claim
does not become truth, allegiance color never doubles as property color, and hidden ownership creates no badge,
field, ordering, or hint. Exact roles, examples, costs, and review cases live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.55.

## Dependency-preserving transactional cue scheduling (Adam's ruling, 2026-07-20 — additive)

> "B"

Committed receipt cues preserve hard causal order while genuinely simultaneous or independent consequences may
overlap and repeated homogeneous feedback may compress through explicit family law. The BattleMat always carries
the exact minimum movement, trigger, target/area, state, topology, hazard, condition, death, custody, and
transformation truth; EngagementLens, camera, particles, sound, captions, and Gemini prose may add drama but never
become the only record. Named/PC/topology/custody consequences cannot disappear into crowd compression. Pause,
speed, skip, reduced motion, collapsed lens, or terminal rebuild changes presentation only and must land on the
same committed state. Exact scheduler laws, examples, costs, and the open input-boundary question live in
`PROCEDURAL-DUNGEON-DIRECTION.md` section 11.57.

## Truth-complete decision boundaries during consequence playback (Adam's ruling, 2026-07-20 — additive)

> "B"

Consequential input reopens when every material fact needed for the next choice has become readable through the
BattleMat, card, caption, or governed static/reduced-motion equivalent—not when every flourish ends and not while
the board still depicts stale truth. Camera/accessibility/speed/pause/skip/catch-up controls, safe review, and
composer drafting may remain available while required cues resolve. One pending intent must look uncommitted,
editable, and cancelable; it cannot spend, leak unseen terminal state, or silently fire after revalidation. Particle
decay, camera settle, sound reverb, lens flourish, and expressive Gemini prose may continue after the decision
boundary only when they do not conceal cells, targets, labels, cards, or new feedback. Exact states, examples,
costs, and the open interruption-recovery question live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.58.

## Boundary-safe visual recovery after interrupted consequences (Adam's ruling, 2026-07-20 — additive)

> "B"

Pause may preserve an in-memory frame, but skip, background return, save/load, refresh, crash recovery, or scene
transition must not depend on exact particles, camera/audio subframes, or unfinished Gemini wording. A lossy return
rebuilds exact current BattleMat/card truth, realizes every still-owed material change through governed static or
reduced-motion equivalents, and gives missed consequences an ordered readable summary before consequential input
reopens. Obsolete flourishes cancel cleanly; no stale half-state, replayed mechanics, duplicate damage, invisible
off-screen cue, or auto-fired draft is acceptable. Exact recovery laws, examples, costs, and the open acknowledgment
question live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.59.

## Nonblocking consequence brief and bounded change traces (Adam's ruling, 2026-07-20 — additive)

> "B"

At a decision boundary, material changes appear through exact current board/card truth plus one compact, causal
`What changed` brief—not a modal receipt for every event and not transient board pulses alone. Immediate
choice-changing facts stay anchored while input reopens; supporting source/result detail expands on demand; bounded
recent-change treatments may persist through the next choice and then recede into the same inspectable history.
Generic `OK` clicks are not required. Explicit confirmation is reserved for a materially altered pending action.
Hidden consequences create no badge, blank row, count, or suggestive visual gap, and Gemini prose may dramatize but
never replace the structured lane. Exact acknowledgment laws, examples, costs, and the open trace-lifecycle question
live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.60.

## Gemini-led consequence prose; BattleMat event proof before added information layers (Adam's ruling, 2026-07-21 — additive; supersedes the automatic brief target above)

> "I think for now, we run it in gemini. I thnk i need proof that actual events can even be rendered in the battle map before I start thinking about adding information layers to it. Everything is still clean with the DM screen, plus the DM can write it into prose. I think getting a dump of all this mechanical meta info without a rewrite pass is just going to take the player out of the fiction of the game and make them wonder what the hell "ward spent" means"

For the current proof target, the persistent right rail remains clean DM chat/narration plus the composer. Gemini
rewrites fact-locked committed consequences into natural scene prose; player-facing output does not expose raw
receipt fields or phrases such as `ward spent`. The BattleMat must first prove that actual canonical events and
their current physical results can be rendered truthfully—movement, hit/fall/state, object state, topology, hazard,
drop/custody—before Genesis adds an automatic `What changed` board brief, anchored consequence labels, or another
information layer. The generated DM-led mockup is closest only **without** its structured `OUTCOME` block; the
board-brief and map-callout mockups remain proof-gated exploration rather than accepted UI. The established
click-invoked smart-tooltip object inspector remains a separate requested interaction surface, not an automatic
consequence notification. Exact supersession, examples, proof corpus, costs, and the open Gemini-failure fallback
live in `PROCEDURAL-DUNGEON-DIRECTION.md` section 11.61.

## Fiction-first minimum-language fallback in the DM rail (Adam's ruling, 2026-07-21 — additive)

> "Yeah, B sounds more ideal"

Gemini remains the normal visible author of committed consequences. Every material receipt family also owns a
tested, viewpoint-safe minimum fictional clause. If Gemini is late, unavailable, interrupted, or fails its factual
anchors, Genesis presents that natural-language clause in the same DM conversation rail rather than blocking
indefinitely, exposing raw mechanic fields, or opening another information surface. Once the fallback carries the
beat, later Gemini prose continues forward without repeating or replacing it. The clause library is a minimum
player-language contract, not a second voice target; exact behavior, costs, examples, and the open actionable-
explicitness question live in `procedural-dungeon-direction/wave-10/05-consequence-presentation.md` section 11.62.

## Viewpoint-known actionable meaning remains inside fiction-first consequence prose (Adam's ruling, 2026-07-21 — additive)

> "B is fine"

Minimum consequence prose leads with the perceivable physical event and may state the smallest material actionable
meaning the active viewpoint has actually earned. Known one-use exhaustion, blocked passage, lost concentration,
dropped custody, or another immediate consequence may be expressed in ordinary scene language; unresolved recharge,
duration, source, owner, motive, witness, or future response remains uncertain or absent. Gemini/fallback prose does
not expose engine vocabulary or duplicate exact jobs already owned by established HP/status, initiative, route,
custody, selection, action, or click-invoked inspection surfaces. Exact epistemic rules, examples, costs, audit, and
the open attention-arbitration question live in
`procedural-dungeon-direction/wave-10/05-consequence-presentation.md` section 11.63.

## Automatic material-event direction first; player-owned focus remains the later target (Adam's ruling, 2026-07-21 — additive)

> "let's start with A and aim for B later"

The pre-alpha consequence target automatically grants governed focus requests for material causal groups: board/
camera framing, accepted active-citizen EngagementLens behavior, shared sound emphasis, and current Gemini narration
may direct attention through the committed beat. One fireball or lift crash earns one readable causal fit, not a
camera tour of every legal sibling; cosmetic/repeated cues do not independently seize focus. Automatic direction
may suspend interaction but cannot erase, edit, submit, spend, or lose player drafts, pending intent, inspection,
selection authority, or scroll state, and it restores/revalidates safe state afterward. Focus requests remain a
typed policy seam so the later target can add player-owned interaction leases, idle-only bounded framing, deferral,
and recenter ownership without rewriting receipt/cue semantics. A-versus-B comparison remains a mandatory playtest,
and starting with A does not protect it as the final behavior. Exact constraints, costs, examples, proof corpus, and
the pending P10.8 closure question live in
`procedural-dungeon-direction/wave-10/05-consequence-presentation.md` section 11.64.

## Prototype/MVP scaffolds before mature graphics features (Adam's ruling, 2026-07-21 — additive)

> "That's actually probably somethign we need to revisit with some earlier decisions, because we have recorded many decisions as the direction but not a phased plan to get there. I think in a lot of cases ddoing the simpler thing first, and using that as scaffolding to the more complex thing later is probably a good plan for a lot of this, especially with the robustness of the graphics engine. A lot of the tracking and simming is writing heavy right? that's not as big of an obstacle.
>
> I think we might want to review some of the decisions, you can use your judgement, where a decision might push pre-alpha out much further, but there is an interrim solution that will still get us our game, albeit in a more rudimentary form. We really have to think it terms of prototype and MVP rather than strictly ideal version of the game. So I think from now on that should be our framework (first this, with this as the feature goal) or (this feature goal cannot wait and is a critical part of the pre-alpha build)"

Visual direction must now distinguish the honest first playable scaffold from the accepted mature feature goal. The
graphics engine first proves actual canonical physical events, current board truth, and robust fallbacks at gameplay
scale; richer camera governance, materials, cue choreography, attention/history projection, smart placement, and
other expensive visual systems are phased behind named evidence unless their underlying authority seam cannot wait.
Canonical ids, receipts, viewpoint law, event/history truth, renderer non-ownership, and deterministic adapter seams
remain early foundations so later visual promotion extends rather than replaces the prototype. The cross-wave laws
and first-pass classifications live in
`procedural-dungeon-direction/PHASING-FRAMEWORK.md` and the three wave `PHASING-AUDIT.md` files.

## EngagementLens is mandatory in the playable pre-alpha battle system (Adam's ruling, 2026-07-21 — additive)

> "ok, if it's a borderline cut we include it for the MVP, anything else that was too drastic? we definitely have to have the engagement lens for pre-alpha because that IS the pre-alpha battle system"

A narrower engineering proof may temporarily exercise BattleMat event rendering without every pre-alpha
presentation layer, but that proof is not the playable MVP. The pre-alpha battle system pairs exact tactical/spatial
truth on the BattleMat with a mandatory receipt-derived EngagementLens that performs the active combatants and
material combat beat. Its first breadth may be small—one complete representative combat family with truthful
generic lens staging for the other MVP combat verbs—but the lens itself is not optional polish. Any genuinely
borderline visual behavior stays in the MVP and is narrowed rather than cut. The playable visual floor likewise
requires legible event performances and coherent tabletop citizenship, not terminal state snaps or a debug-looking
board. Exact phasing corrections live in
`procedural-dungeon-direction/wave-10/05-consequence-presentation.md` section 11.66 and the revised
`procedural-dungeon-direction/wave-10/PHASING-AUDIT.md`.

## One small retained clay room before multi-room and relational visual proof (Adam's ruling, 2026-07-21 — additive)

> "ok, one more reframe. I think since we are basically thinking of things as MVP -> ideal feature we probably need to think about the implementation process as we go along. correct me if I am wrong and if this will be easier after all the decisions have been made, but I just want to make sure this implementation plan is organized and features don't get left behind in big design waves. I think I would rather do smaller wave passes, or organize several smaller wave passes in fable, rather than doing these big 8 wave total engine redesigns. In fable we discussed using the clay rooms as proof, and you and I discussed using 12 different clay rooms as proof, however I do think we need to start with a single relatively small clay room as proof, then stage up to multi-room to stage the simulation effects, and continue to stage up to the more complex relational simulations"

Visual and implementation proof begins with one deterministic, relatively small retained clay room rather than a
simultaneous multi-room or twelve-site engine batch. Separate passes first prove room truth/projection,
movement/route, object/hazard/custody, the mandatory BattleMat-plus-EngagementLens battle spine, combat breadth,
interruption/recovery, and DM consequence language. The retained corpus then stages upward to multi-room causality,
a small operating site, relational simulation, and incremental golden sites. A Fable work period may organize
several ready small passes, but each keeps one primary acceptance question, its own visual/executable evidence,
coherent landing, and rollback point. Passed fixtures remain regression and capture specimens. The accepted twelve
golden sites remain the eventual representative portfolio, not the first implementation batch. Exact cross-wave
process and traceability live in
`procedural-dungeon-direction/CLAY-PROOF-LADDER.md` and
`procedural-dungeon-direction/FEATURE-PROMOTION-LEDGER.md`.

### Acceptance of the phased visual-proof ladder (Adam, 2026-07-21)

> "sounds great, let's move forward"

The three-horizon visual phasing, mandatory EngagementLens MVP ruling, one-small-room-first Clay Pass ladder,
multi-room/site/relational staging, incremental twelve-site portfolio, and feature-promotion traceability above are
accepted. This acceptance fixes the visual production structure; exact implementation remains unauthorized until
its later build gate.

### Phased P10.8 visual-consequence closure (Adam, 2026-07-21)

> "yes"

Adam explicitly closed P10.8 on the phased basis recorded in
`procedural-dungeon-direction/wave-10/05-consequence-presentation.md` sections 11.68-11.69: core events require
legible performance; the mandatory EngagementLens stages every material combat beat; the first presenter may remain
serial over retained dependencies; recovery and fiction-first consequence language are MVP obligations; automatic
focus A begins over a seam that retains player-owned B; and automatic consequence briefs remain evidence-gated.
This closure does not authorize implementation or close Wave 10.

### Transactional visual continuity across scene adapters (Adam, 2026-07-21)

> "B for sure"

Map, town/social, wilderness/exploration, dungeon, battle, and aftermath adapters preserve one scene through a
typed, idempotent SceneLineage handoff rather than independent rebuilds or one universal live geometry. The handoff
preserves canonical identity, cast and role continuity, object/custody state, damage, traces, hazards, viewpoint
knowledge, honestly owned spatial anchors, pending obligations, consequence position, and safe presentation state.
The outgoing adapter yields and the incoming adapter validates before projection. A simple crossfade or reframe is
sufficient for the playable MVP; transition animation is not canonical. Seamless morphs, richer camera memory,
simultaneous split-view presentation, and broad adapter-specific polish remain feature goals. The first retained
visual proof is one room crossing exploration -> BattleMat plus EngagementLens -> damaged aftermath without reset.

### Provenance-bearing spatial precision across visual modes (Adam, 2026-07-21)

> "B for sure"

Spatial claims retain an honest visual and canonical precision tier: exact cell/footprint, anchored local relation,
zone/region/route, or unresolved/reserve. A BattleMat transition may increase precision only through a legal,
provenance-bearing placement receipt. Unresolved citizens remain unresolved or in reserve rather than receiving
false visible certainty. When the exact board compacts into exploration, town, travel, or aftermath, every
choice-changing relation and consequence survives while meaningless cell detail may become a coarser truthful fact.
The compaction records what changed precision and why. A broken threshold, burning stall, dropped pack beside an
injured merchant, blocked exit, or eastward flight cannot disappear merely because the grid closes; an irrelevant
cell number need not become permanent world clutter.

### One-PC bounded deployment with formation-bound companions (Adam, 2026-07-21)

> "We want something like XCOM or FFT where you have placement but it is bounded to a zone. This brings us to a major decision about PC control. Let's assume for pre-alpha this is a single player game based around a single PC, everyone else is an ally/sidekick and the allies and sidekicks act independently of the main PC, which of course is it's own set of problems. But placement should be bounded to where those characters are at the start of battle, let's say generally these sidekicks and allies just hang around with the PC in a set formation, for the MVP I think that's fair behavior. Later on we can consider truly independent behavior like rogues wandering off in markets and stealing things etc. for now those things can be purely narrative and aren't exactly bound to spatial truth during non-combat scenes."

The pre-alpha has one player-owned main PC. Allies and sidekicks remain canonically present with that PC through a
coarse set formation outside combat and act independently once combat begins. Combat placement is bounded to a
deployment zone derived from the party's established location and approach, rather than allowing free placement
anywhere on the BattleMat. Noncombat prose may color a companion as wandering nearby, but cannot create exact
spatial truth, detach the companion, change custody, or affect battle placement unless a validated canonical event
promotes that behavior. Truly independent noncombat companion activity remains a later feature goal. Exact allied
combat behavior and the player's breadth of initial formation control remain open questions rather than hidden
assumptions in this visual ruling.

### Automatic formation deployment first; bounded party placement as the goal (Adam, 2026-07-21)

> "Let's say C for pre-alpha, and B as the goal"

For pre-alpha, the deterministic formation resolver places the whole party, including the main PC, within the legal
approach-bounded deployment zone. There is no initial placement interaction, no free teleport across the BattleMat,
and no reroll on reload. The explicit feature goal adds player placement of the main PC followed by optional
rearrangement of allies/sidekicks within the same formation-legal, viewpoint-safe candidate cells. After commitment,
allies still act independently. The later player control is an additive edit/preview layer over the retained
automatic placement receipt, not a different geometry or combat authority.

### Simple fiction-first transition before a restrained diegetic continuity beat (Adam, 2026-07-22)

> "yes A->B is the way to go"

Pre-alpha preserves orientation and stable scene identities through a simple crossfade or reframe into the
BattleMat plus one short fact-locked Gemini/fallback bridge. Established landmarks, visible citizens, damage,
objects, and the automatic party deployment remain visually continuous without category labels, migration arrows,
badges, or a mechanical transition card. After truthful BattleMat events and stable identities are proven, the
visual feature goal adds a restrained landmark-to-placement continuity beat: one or two anchors hold while the board
resolves, persistent citizens and objects settle into committed cells, and the camera rests on the first actionable
composition. The structured mechanical continuity summary remains evidence-gated and has no automatic entitlement.

### No independently advancing split-party presentation in pre-alpha (Adam, 2026-07-22)

> "should we even allow party splitting in a pre-alpha? that seems like an advanced feature, even the first BG games didn't allow it. I think that is something totally worth limiting in scope"

Pre-alpha presents one advancing party scene. Companions may participate as `inside`, `at portal`, or `adjacent`
without receiving continuous independent noncombat coordinates or a second scene view. Actors may be physically
divided by exact terrain on the same BattleMat while one encounter clock and consequence order remain active; that
does not create an offscreen branch. Pre-alpha has no voluntary split command, companion errand view, independently
advancing child scene, view switching, split screen, or branch-reconciliation presentation. Parent/child
SceneLineages remain an eventual feature goal. This limitation preserves canonical companion identity, party
membership, participation, location, condition, and custody seams so later split play can extend the game without
making its high architecture and visual cost part of the first playable proof.

### Cold companion absence first; same-scene autonomy before split-party views (Adam, 2026-07-22)

> "B
>
> i do think that eventually I would like for the companions to be able to act on their own within the scene I think i would rather implement that before party splitting. That way if I am in a market scene the rogue could wander off and get into trouble if he wanted. This could be toggleable in settings, but it could make for interesting gameplay. Though we probably would need to define limits on the actions of the \"rogue\" PC"

A forcibly separated pre-alpha companion becomes a canonical but self-inert cold record: their identity, known or
exact location, holder/custody, condition, inventory, viewpoint knowledge, and separation cause persist; externally
owned site/world events may still affect them; they remount as the same citizen when the main-PC scene reaches or
retrieves them. They receive no independent scene, action, discovery, or Gemini-authored advancement.

Before any split-party presentation is built, the feature path adds toggleable companion autonomy **inside the one
currently active scene**. A rogue companion may visibly leave formation, move elsewhere in a market, and undertake a
bounded characterful action capable of causing trouble while the same scene, clock, cast, objects, and consequences
remain mounted. The behavior must obey validated actions, viewpoint truth, an explicit player setting, and still-
open action limits. It cannot silently become offscreen branch simulation. Exact risk and intervention rulings remain
open rather than being invented by this canon entry.

### Readable bounded companion attempts; governed same-scene camera; bounded town fabric (Adam, 2026-07-22)

> "10.9f B
> 10.9f.1 B
> 10.9f.2 B
> 10.9g Let's discuss this one further
> 10.9h B with a scoped version of C on the horizon"

An autonomous companion's perceptible same-scene action receives a readable intention/attempt beat without turning
every action into an approval prompt. Intervention appears only when the main PC's viewpoint, attention, time, reach,
and the action's actual interruptibility permit it; an unseen act does not reveal itself through a warning badge.
The action may earn one governed causal camera reframe, widen, or focus request and an easy return/recenter path. It
does not create a second viewport, hard-cut repeatedly away from the main PC, or require a mechanical alert card.

Pre-alpha town presentation uses bounded canonical district/venue fabric: a compact market or district may remain
mounted through social play, companion movement, conflict, battle, and damaged aftermath while preserving the same
cast, objects, thresholds, and consequences. The later visual goal may connect selected town slices more
continuously and populate them more richly, but it does not require seamless rendering or simulation of every
street, building, and resident.

### Coherent low-resolution biome world that visibly frays outward (Adam, 2026-07-22)

> "10.9g.5 B, we also need to come up with a better biome distribution system, basically a low res world map from the start that allows us to increase resolution as we play but with more realistic biome arrangements, because just randomly scattering the biomes is kind of stupid, however it does make sense towards the fray as the world kind of devolves into more chaos. So we can actually start with a pretty small cohesive, rational world map based on real biome patterns, and that can auto-generate outward more randomly to represent the fraying edges of the world where spice gets spicier and loot gets lootier and danger gets dangerer"

The ordinary inhabited map begins as a small, visually coherent low-resolution world: connected ranges, drainage,
coasts, rain shadows, climate bands, and believable biome provinces establish a rational regional silhouette before
local resolution exists. Approaching or playing in a region increases detail without moving or contradicting known
geography. Outward toward the Fray, rational adjacency and large-scale pattern increasingly distort; biome borders,
terrain sequence, color rhythm, and regional silhouettes may become stranger in controlled correlation with higher
Spice, richer loot opportunity, and greater danger. Independent biome confetti is a far-Fray visual symptom, not the
normal world-map language.

### Existing animal card first; transport enrichment later (Adam, 2026-07-22)

> "5. A at first, B later. Like we'll have to think about horses and wagons as it's own module of expansion and integration. I don't know why we would need to have every mount and vehicle begin as a full sim at any point. I mean horses should have personalities and a basic animal NPC card, we already have that sketched out in the docs somewhere. Make sure you find that and it doesn't get duplicated or overwritten"

A horse that appears in play is first an existing animal citizen, not a transport-stat panel or a new visual card
family. Its retained animal card owns the readable kind, hook-bearing tell, need, name, attitude/care, home or
territory, and later recurring personality. The earliest travel presentation need only communicate truthful access
and whether the party can ride or drive it; the selected DM-seat model may carry the remaining fiction while the
mechanical seam is small. A later horse/wagon module may progressively expose capacity, load, custody or hire, condition, feed,
stabling, injury, and repair when those distinctions become playable. No visual target requires every mount or
vehicle to become a full independent simulation, and no transport UI may duplicate or overwrite the existing animal
identity/card.

### Grid-owned travel projection; bespoke per-choice imagery is a later optional module (Adam, 2026-07-22)

> "ok, i have some feedback on those images already, because generally everything should be built on our grid system. that looks like a bespoke graphic, not a procedurally generated scene basic on a real grid and a real roll. Now these screens can be built from nodes, or vector art overlaying some biome art that we generate for background images, but we aren't going to be able to generate bespoke imagery per travel choice by pre-alpha. that might be it's own module later once image gen or if image gen becomes cheaper and faster"

Pre-alpha wilderness and route-choice scenes are projections of real rolls through Genesis's shared spatial
systems. The primary visual path uses reusable square-grid biome cells, elevation/depression, route and crossing
cells, blockers, simple physical props or truthful markers, and canonical pixel citizens. A coarser screen may use
canonical nodes/edges or vector routes over reusable generated biome art, but painted relationships cannot pretend
to be mechanical geometry. No segment, fork, or player choice requires bespoke generated imagery.

Per-choice or runtime image generation is a separately gated later presentation module only if cost, latency,
determinism, rights, safety, continuity, offline behavior, and provider availability become practical. It may enrich
retained grid/node truth but cannot invent collision, replace canonical routes, or become the only map. The first
two scenic travel mockups generated on 2026-07-22 are rejected as pre-alpha implementation targets. The corrected
visible-grid versions remain discussion evidence rather than accepted captures.

### Provider-neutral DM seat; no Gemini-exclusive shell branding (Adam, 2026-07-22)

> "A as long is gemini is bound to as many mechanics as we have implemented and it knows how to use them, then we are ok with this. Gemini does a great job already in the raw chat with only a couple of PDFs as reference. Just remember it's not gemini exclusively. The DM seat is for any LLM the user wants. I think ultimately we are going to sell the game with a built in LLM like Llama, and offer either premium DMs at a data rate or monthly charge, or just open it up to gamers to put their own LLM API key in there and pay whatever they want for whichever they want."

The persistent right rail presents the **DM seat**, not a Gemini-branded product surface. Every supported bundled,
local, hosted, premium, or player-keyed model consumes the same viewpoint-safe facts, implemented mechanics and
available actions, tool/event contracts, and narration constraints. The active provider may be exposed in an
appropriate settings/account surface, but changing providers does not create a different world, mechanic, or main
shell relationship. Built-in, metered/subscription, and bring-your-own-key packaging remain product candidates;
their exact vendors, labels, rates, and controls are not canonized by a visual mockup.

### Real-roll bounded town projection and same-venue battle continuity (Adam, 2026-07-22)

> "B is correct across the board"

This accepts the five town rulings recorded at Wave 10 section 11.85. The first town view is not a bespoke venue
illustration or one continuously rendered city. A compact canonical district graph mounts reusable urban square-
grid or truthful node/vector scenes from real rolls. Streets, markets, taverns, shops, gates, and courtyards reuse
floor, threshold, elevation, blocker, prop, marker, and pixel-citizen families; reusable background art may dress
the projection but cannot claim mechanical geometry.

When social or exploration play becomes combat, BattleMat remounts the **same venue**. Established citizens,
thresholds, stalls, doors, objects, custody, knowledge, and companion participation cannot be replaced by a generic
arena. Bodies, damage, fire, dropped goods, flight, relationships, and obligations remain in that venue afterward.
Moving between venues first uses a short Urban Walk or honest direct threshold; known-safe presentation may compact,
but canonical time and due changes still occur. Offscreen town activity is receipt-driven rather than a visual claim
that every street and citizen remains continuously simulated.

### Real-roll map backgrounds belong to the Golden Site projection (Adam, 2026-07-25)

> "also makes me think we need to do a pass on background images and background styles
> for the maps based on real rolls at some point"

> "no better time than now, makes perfect sense with our golden sites"

A finished Golden Site should not float in a generic presentation void when retained
world, place, adjacency, material, terrain, elevation, light, weather, history, or
current-state rolls establish a visible world around it. Those facts project outward
from the canonical playfield into an honest context apron and background field.

The playable grid remains mechanical truth. Reusable background images, context cards,
procedural support geometry, atmosphere, and far-field plates may express rolled
context, but they cannot invent routes, actors, interactables, destinations, state, or
knowledge. Pre-alpha does not require bespoke or runtime-generated imagery per seed.
The full source, realization, fallback, receipt, and proof contract lives in
`GOLDEN-SITE-WORLD-CONTEXT-PROJECTION.md`.

### Promoted town citizens; semantic remount; dormant companion-roaming hooks (Adam, 2026-07-22)

> 1. B
> 2. B
> 3. B
> 4. B
> 5. B

This accepts the visual implications of F10.9h.6-h.10. A town arrival is the destination projection of the same
journey, not a fresh establishing illustration. Materially encountered people retain stable visual identity;
unengaged population may remain pooled or compact rather than becoming permanent simulated extras. A returning
venue reconstructs its meaningful actors, objects, thresholds, damage, hazards, access, and custody while
disposable exact placement may remount from truthful anchors. It neither freezes every incidental cell forever nor
rerolls away visible consequences.

Pre-alpha companions remain formation-bound outside combat. Town grids nevertheless retain same-scene zones,
thresholds, party anchors, and action/attention hooks for the later C4D roaming feature; those dormant hooks do not
visually imply that offscreen companion activity is already simulated. The retained town proof must visibly cover
arrival, Urban Walk, market interaction, the same market becoming BattleMat combat, material aftermath, and a
leave/return remount.

### FFT-grade shared BattleMap/TownTray composition is high priority (Adam, 2026-07-22)

> "ok these are high priority items and need to be analyzed in depth to be implemented into the procedural engine, if we can find a way to build maps nearing the quality of the FFT standard maps then we have ourselves a money printer.
>
> this is the battle map module, but also can be any town tray model as well, and i think with the automatic UV unwrapping that we should have implemented, we should be able to determine what shape sprites need to be generated for each surface/angle type in the game"

FFT-standard **composition quality** is a high-priority target for Genesis's own procedurally generated maps:
coherent elevation masses, typed and visible height connections, strong landmarks, readable primary approaches,
meaningful optional opportunities where the real roll supports them, shaped negative space, sparse structural
dressing, and tactically honest four-view composition. This is a quality reference, not authority to copy an FFT
map, asset, texture, code path, or exact arrangement.

BattleMap, SceneTray, and TownTray share one grid/surface composition compiler. A market, street, tavern,
wilderness pocket, and dungeon chamber may use different recipes, but they retain the same region, route,
connector, reservation, provenance, surface-frame, and rendering contracts. A town venue promoted to combat is the
same venue, not a replacement arena.

Generated architecture derives its final surface shape and orientation from real geometry. Reusable visual inputs
are compact canonical surface families—horizontal panels, vertical faces, risers, slope planes, run strips,
corners, stair/bridge/roof components, strict top/front decals, and named mount faces—rotated, repeated, clipped,
and assembled by the engine. Do not generate one bespoke image per map, compass direction, or camera angle.

The technical audit corrects the UV premise without changing the visual goal: current production room shells use
deterministic world-aligned and perimeter/height UV projection, while general automatic unwrap remains an unlanded
offline foundry lane. Procedural projection stays the primary contract for generated floors, walls, risers, roofs,
cliffs, and disposable mass. Offline automatic unwrap is reserved for reusable complex assets or baked chassis
that actually require it; no live map waits on runtime unwrapping.

### Trim-sheet creation and implementation must be designed (Adam, 2026-07-22)

> "I also just learned about trimsheets, that is something we need to figure out how to create and implement"

Trim sheets are now an explicit visual-engine design requirement inside the shared BattleMap/TownTray surface
module. Genesis must determine a reproducible creation pipeline and a procedural geometry/UV/material implementation
contract rather than treating trim as an isolated hand-authored decoration. No exact sheet layout, material
authority, profile depth, channel set, runtime repeat method, or proof placement is canonized by this statement;
those generated choices were opened in `TRIM-SHEET-PIPELINE.md` and Wave 10 section 11.91 and resolved below.

### Accepted trim-sheet scaffold and feature goal (Adam, 2026-07-22)

> "your recs are fine"

This accepts the recommended Option B choices T10.1-T10.5. Genesis first proves one manifest-driven horizontal
multi-band sheet over real generated architecture. Architecture material or a compatible material family chooses
the visual variant; realm grade/tint is secondary. Source strips may be generated or authored independently, but a
deterministic packer owns exact sheet slots, gutters, fold variants, aligned channels, hashes, provenance, and
reports. Do not ask image generation to own the final production atlas layout.

The first runtime projection uses full-width horizontal bands, clamped sampling, and repeat-boundary run
segmentation. A custom sub-rectangle repeat shader is a later measured optimization, not the visual prerequisite.
Geometry owns the trim's physical profile, silhouette, corners, endpoints, existence, and occlusion relationship;
the texture sheet owns reusable surface detail and declared material scale. Missing exact art falls back through a
compatible plain band, geometry-only profile tinted from the canonical base material, or truthful untrimmed
architecture—never a contradictory realm-matched material.

C1H remains the clay composition gate. C1I separately proves one material family, one stable sheet layout, named
base-course/cornice/cap-or-nosing/curb-or-retaining roles, diagnostic-before-beauty mapping, correct scale and
repeat, corner/endpoint/occlusion behavior, four-yaw readability, and unchanged tactics. Broader material families,
profile sweeps, roof/beam/frame/bridge/town roles, normal/ORM channels, dedicated junction art, and measured shader/
batching optimization remain the accepted feature goal rather than disappearing from the plan.

### Final bounded-town continuity tells (Adam, 2026-07-22)

> "B across the board"

This accepts the visual implications of F10.9h.11-h.15. A pursuit crossing a market alley, gate, yard, or district
edge remains the same event: the same actors, wounds, carried objects, pursuers, time, and visible consequences
remount in the destination rather than becoming a generic replacement encounter. Only the active venue must be
shown at exact resolution; presentation must not imply that every possible street remains continuously rendered.

Public violence and theft may become visible civic consequences only through canonical witnesses, evidence,
identifiable property, local authority, factions, and clocks. The DM prose may dramatize that response but cannot
visually conjure guard knowledge or a universal crime meter that the world did not earn.

Horses, wagons, draft teams, and cargo remain visibly anchored where custody/access truth places them—a gate, yard,
stable/holder, or with the party. Do not put a wagon inside an incompatible venue or teleport transport between
shots. Closed shops, barred gates, curfews, market days, fires, quarantines, appointments, and faction control must
alter the visible/available threshold state when canonical clocks and conditions require it; prose alone cannot
make a closed threshold look open.

Town departure and return are symmetric scene-lineage projections. The legal gate, dock, or road, current party and
transport condition, damage, promoted citizens, access, witness knowledge, clocks, and unresolved consequences
survive semantic compaction and later remount. The presentation neither rerolls the town into a fresh illustration
nor claims that incidental exact placement stayed live throughout the absence.

### No cloned dungeons; generated identity art plus procedural surface variation (Adam, 2026-07-22)

> "there should never ever be a cloned dungeon with the way our system works, if we determine we need more sprites and trimsheets to assign to culture types then we generate those, we are fully embracing generative AI art in this project to cover our niche needs, though we might want to consider other solutions that don't require a new sprite for every single modification. I watched a guy yesterday making materials in substance designer and he had these substance mutators that he could call and get clean variations on whatever materials he wanted. he said he greated a graph that could update the materials and he also used normal map generation get get his materials even further. he also said he used smart materials in substance painter that allowed for grime to collect around corners, color variations to happen whenever he wanted etc...so we are using sprites as our main source of art, but there must be layers we can add to the sprites to get a lot further with a robust base of art right?"

Genesis must not obtain variety by cloning a finished dungeon or by requiring a newly generated image for every
surface modification. Generative AI art is an accepted production source for missing culture-, material-,
component-, trim-, prop-, and identity-specific visual needs. It is complemented by deterministic transforms,
parameterized material families, declared companion channels, trim/component assembly, geometry-aware masks, and
source-backed decals or overlays. Generated or procedural variation never becomes authority to change a canonical
noun, material, culture, history, condition, or mechanical shape.

The pixel-art figure/creature corpus remains the principal identity and silhouette layer. Normal, roughness,
height, palette, material-id, wear, condition, emissive, decal, and similar companion channels may deepen that art
when their creation and use pass sprite-scale visual review. An inferred normal map is a candidate projection, not
automatically ground-truth geometry; painted lighting must not become false relief, halos, or pillow shading.

### Broad eventual mechanical citizenship with explicit delivery tiers (Adam, 2026-07-22)

> "ideally everything has SOME kind of mechanical existence eventually, like every column should be destructible by the right amount of force. we need to tier out what is MVP and what is the dream here"

The ideal physical world gives every meaningful structural citizen a generic material, footprint/volume,
attachment/support relation, condition, and compatible force/state response before adding bespoke mechanics.
Prototype and playable-MVP proofs may expose only a narrow interaction family, but they must retain the stable
identity and promotion seam needed to add broader destruction and structural response later. Surface pixels,
shader grain, grime flecks, and similar subordinate detail need not become independent simulated objects; their
owning canonical surface or structure carries their truth.

### Provenance-first scale domains and narratively licensed mismatch (Adam, 2026-07-22)

> "i think we had a sketch of how this works written down, please search for that. in rare cases the big thing ends up in a small room and becomes a point of narration, but in most cases big things shouldn't exist in small rooms, and if big things are canon to the area, then big rooms should be canon to the area unless the origin of the space is different than that of the current inhabitants, colonies etc..."

This reaffirms the existing builder-first, inhabitant-shaped, natural-selection, and repurposed-mismatch scale law
in `procedural-dungeon-direction/FOUNDATION.md`. Large current inhabitants normally require a compatible connected
scale domain. A large creature in incompatible architecture is exceptional and must remain a causally licensed,
mechanically honest fact that the DM seat can recognize and narrate, not a routine renderer overlap or global room
inflation.

### Layered decay, repair, and material-history research is mandatory (Adam, 2026-07-22)

> "we need to come up with solutions this wether it is normal maps, decals, substance design or what...i do not know all of the potential solutions here so i need your help researching and educating me"

Wave 3 must compare structural mutation, material-family parameters, geometry-derived masks, normal/roughness/
height channels, decals, trim/component variants, and generated exact art as distinct tools. History must remain
source-backed and readable: the visual stack cannot apply indiscriminate ruin noise, imply damage or repair that
did not occur, or substitute cosmetic wear for canonical structural state.

### Material Maker becomes the no-cash procedural-material research lane (Adam, 2026-07-22)

> "oh man, material maker is exactly the tech I was looking for, so go ahead and acquire that, and derive any research you need from the adobe docs because that will be serving us well going forward."

Material Maker 1.7 was acquired as a locally installed, signed universal macOS application outside the Genesis
repository. It is the preferred no-cash application for learning and prototyping the offline procedural-material
foundry. Its parameter, randomness/seed, subgraph, PBR export, custom-output, and command-line batch-export
contracts are relevant to Genesis. Adobe Substance Designer/Painter documentation remains an authorized research
source for mature graph-instance, exposed-parameter, baked mesh-map, Smart Material, decal, and automation patterns.

Neither application becomes runtime authority or a required player dependency. Material graphs produce admitted,
versioned visual payloads and metadata; canonical material, culture, history, geometry, and mechanical state remain
owned by Genesis. A future funded Substance-class lane may replace or complement the authoring tool without
rewriting those owners.

### Material Maker pinned at 1.3; headless compile PROVEN; the SUBTLE-TEXTURE split (2026-07-23, folded from docs/MATERIAL-LANE.md)

- **Correction to the section above:** 1.7 is GONE. The gate machine (Iris Plus 645) cannot run
  Godot-4-based apps — MM 1.7 crashes in every renderer (shader-compiler ceiling, not fixable by
  flags); Adam deleted the 1.7 app 2026-07-23. **Adam's machine is the gate on the game** (his
  ruling): everything must run here; beauty shots may come from a higher-end sandbox.
- **Pinned executable (adoption doctrine satisfied):** Material Maker **1.3** at
  `/Applications/Material Maker 1.3.app`, binary sha256 prefix `597b199fae597c4f`.
- **Headless compile contract PASSED:** `material_maker --export-material --target
  "Godot/Godot 4 ORM" -o <outdir> <graph>.ptex` runs windowless on the gate machine; exports are
  deterministic (byte-identical across runs, sha256-verified). `.ptex` graphs are JSON text —
  agents author them directly; the GUI is for Adam's taste passes only. MM remains an **offline
  compiler**, never runtime authority (evidence: MATERIAL-LANE §1c).
- **SUBTLE-TEXTURE law split (MATERIAL-LANE §1e):** the *principle* KEEPS — low-contrast,
  readable-at-glance, never noisy, never photographic; the stage stays quiet so the standees stay
  the stars — and becomes the taste-card review bar. The *implementation clause* (64px boot-time
  procedural CanvasTextures, grain 0.07–0.12) is SUPERSEDED by admitted MM output; the painters
  remain the canonical fallback for any surface without an admitted material.
- **PSX residue inventory recorded as legacy (MATERIAL-LANE §1f):** `psxEnabled`/`PSX_RES_SCALE`
  escape hatch, `assets/textures-psx/` naming, the `antialias:false` rationale — steer by no
  longer. NOT residue: NearestFilter on sprite/albedo texels and the TEXEL DENSITY LAW (pixel
  canon, kept).
- **The gate:** no material touches the engine until its taste card is PASS-ruled by Adam
  (MATERIAL-LANE §2); Stage-B wiring rides the visual-proof track (clay room → guard's post).

### Procedural culture identity should precede optional authored culture packs (Adam, 2026-07-22)

> "is there any way to procedurally create a culture's visual identity and store that in play and make sure if that culture is canon to the site that it is visually represented in some way? rather than relying on authorship of culture packs? like we CAN create sprites and materials with culture packs in mind, but if the engine can derive culture procedurally then that is actually more inline with the overall vision of the engine"

Wave 3 must treat an authored culture pack as optional enrichment or a cached compiled product, not the canonical
source of a culture's appearance. When a fictional culture becomes canon, Genesis should be able to commit a stable,
seeded, versioned visual constitution derived from its causal world facts and bounded variation. Sites then receive
typed culture-imprint obligations according to relationship and era—builder, operator/patron, occupant/colony,
conqueror, repairer, trader/influence, hidden/erased, or another explicit role—so culture is neither omitted nor
allowed to overwrite unrelated provenance.

The minimum procedural representation must survive missing bespoke art through consistent material/palette,
geometry/rhythm, motif/trim, repair/maintenance, dressing/symbol, or other declared channels. Exact generated
sprites, materials, trim sheets, decals, glyphs, clothing, and components may deepen the same constitution. A new
site changes composition and history; it does not reroll the culture. A later cultural evolution becomes a new
dated episode whose descendants and older sites retain provenance.

### Spatial attachments resolve through TTRPG action authority, not renderer physics (Adam, 2026-07-22)

> "b is good, just make sure it's not all physics and DC are the determining factors on wether or not that axe holds that rope, but yes that should be a possible action"

Embedding an axe, tying a rope, and using it as an anchor is a legal candidate action. Genesis does not require a
general rigid-body simulation to decide it. Material, existing condition, angle/depth, leverage, tool suitability,
rope/load, character capability, declared approach, magic, time, and consequences inform the certified action,
check/DC when applicable, and outcome profile. The committed receipt then records whether and how the attachment
holds, its limits, and its failure consequences; physics/rendering consumes that result and never invents success.

### Procedural cultural visual constitution accepted across all ten follow-ups (Adam, 2026-07-22)

> "1. B
> 2. B
> 3. B
> 4. B
> 5. B
> 6. B
> 7. B
> 8. B
> 9. B
> 10. B"

This accepts the complete Wave 3 section 12.7 prototype-to-ideal cultural-visual pipeline. A stable procedural
visual constitution owns a culture's identity; causal world facts plus bounded rolls create it; several invariants
make it learnable without a single repeated emblem; typed relationship/epoch/visibility imprints guarantee honest
site representation; mixed cultures retain chronological layers; bounded procedural glyph/shape grammar precedes
exact generated art; admitted micro-packs compile and cache as needs arise; player recognition remains
knowledge-governed; cultural change creates dated episodes rather than rewriting old work; and truthful procedural
fallback must represent a materially present culture when exact art is missing.

The accepted prototype creates and persists one constitution, then proves the same recognizable culture in one
builder site and one later-occupied site without cloned composition. The playable MVP expands to several cultures,
mixed lineage, admitted micro-packs, deterministic remount, and knowledge-safe recognition. The ideal retains
evolution, schism, diaspora, colonization, trade diffusion, hybrid schools, broad generated expression, automated
foundry output, player-earned recognition, and funded review.

### One fixed production camera replaces four-yaw gameplay (Adam, 2026-07-22)

> "we don't actually have to have the 4 yaw gameplay, we could design all levels around a fixed camera if that helps us solve geometry, camera, lighting, and prop problems"
>
> "2. B"

Genesis uses one stable fixed production yaw, pitch, and projection family rather than four player-selectable
gameplay yaws or a different chosen yaw for every site. Fixed does not mean frozen framing: governed overview,
room/exploration, and action/combat focus; pan and zoom; immediate direct input; interruptible refits; safe-
rectangle response; recentering; and truthful cutaway/ghosting remain. Player rotation is not part of the accepted
prototype or playable-MVP camera direction.

The provisional visual family remains the accepted gentle low-distortion perspective starting point, with the
controlled same-state orthographic fallback if capture evidence shows that perspective harms board truth, sprite
citizenship, picking, lighting/shadow behavior, performance, or accessibility. Exact camera constants remain
capture-tuned; arbitrary orbit, per-mode projection changes, and per-site camera personalities are not implied.

Procedural composition and noncanonical dressing should be judged through the production view. The camera may
select among otherwise legal candidates and govern presentation, but it cannot alter canonical topology, routes,
connectors, line of sight, scale, history, material state, or world orientation where that is meaningful. Required
information blocked by foreground architecture or props is repaired with governed framing, cutaway/ghosting,
semantic overlays, or reusable placement/composition rules—not contradictory narration or view-conditioned
mechanics.

Four-yaw gameplay beauty and acceptance are superseded. Optional nonproduction diagnostic views may still expose
malformed geometry, false adjacency, or fragile composition, but they do not restore player rotation or require
production-quality unseen backsides. The fixed camera is intended to concentrate quality in geometry composition,
lighting, prop orientation, sprite presentation, and a single consistently authored Genesis view.

## Clayroom reset redlines (Adam, 2026-07-23 — additive; verbatim)

Given while reviewing the live C1A Clayroom at `genesis.html?clayroom=1`. Recorded here per this
file's own DECISION-CAPTURE RULE; the owning specification that discharges them is
`CLAYROOM-RESET-LADDER.md` (rung noted after each).

> "The clay room in it's current state sucks."

> "It seems to have basic dungeon floor glued to it"

> "it doesn't seem to have any ability to have my two temp lighting system in it."

> "the sprite is back to an overexposed undersaturated crappy looking piece of paper that has been
> through the washing machine."

> "I know for sure I still want the lighting lab and i want to be able to basically adjust the
> default settings for every type of light that could be rolled in the game"

> "i still want the vertical and horizontal baseline editor added to the sprite sheet"

Discharge routing: dungeon-floor inheritance → **CL-R0** (BUILT 2026-07-23; the diagnostic-clay
surface is now a versioned recipe re-applied from one `setInteriorBoard` lifecycle hook, so no
asynchronous rebuild can restore site material). Two-temperature rig not editable → **CL-R1**
(generalize the tunable light recipe to a bounded `lights[]` and admit the opposing pair as a named
test recipe; do not leave it as Clayroom-only hardcoded state). Washed-out sprite → **CL-R1 then
CL-R2**, diagnosed causally across colour-space tagging, texture sampling, tone mapping, light
energy, material response, and compositing — **never** an arbitrary saturation slider; colour space,
alpha mode, and authored sprite saturation are invariants, not taste sliders. Lighting Lab as the
editor for every rolled light family's defaults → **CL-R1 / Lighting Lab 2.0**, editing *recipes and
defaults* through structured validated lock data, never arbitrary scene patches. Vertical/horizontal
baseline editor → the narrowly-scoped Sprite Editor crosshair delta (`footX`/`footY`); the existing
`dev/sprite-review.py` tool is **extended, never replaced**.

## Guard Post low-poly construction language and the narrative-furnishing boundary (Adam, 2026-07-23 — additive; verbatim)

> "ok, well remember we are expressing these things in the very low poly language of the FFT map
> construction. So can you make that translation?"

> "for now, we are going to keep the majority of furnishings narrative, the DM can talk about them,
> they can affect the scene and the world, but they are essentially imaginary until we can prove the
> architectural soundness and tactical juiciness of the scene itself"

The Guard Post — and the golden sites generally — is not a miniature realistic building made from
hundreds of small modelled parts. It is a legible tactical diorama: a few broad terrain masses, a
road that is real geometry, continuous architectural runs, deep readable openings, and a handful of
large silhouette pieces. The material system supplies construction rhythm and age; it does not
pretend to be geometry. This is a translation of FFT's economical map language into Genesis's own
procedural construction grammar — **not** a copied FFT map, mesh, texture, palette, or arrangement.

The furnishing boundary is a boundary, not a deferral of quality: furnishing facts may remain
DM-visible and world-persistent without physical models until the architecture and tactical scene
are proven. **But if a furnishing changes collision, cover, sight, support, practical-light position,
or exact interaction reach, it must receive the smallest truthful physical proxy — invisible tactical
furniture is not permitted.** Detail routing lives in `GOLDEN-SITES-CATALOG.md`.

## Material authoring is Material Maker 1.3, and every material is a seed (Adam, 2026-07-23 — additive; verbatim)

> "can you also spec out how the materials would be made in material maker? i have that working now
> and that is what we will be using for our material design. i could only get v1.3 working on this
> mac book, so that's what we are stuck with."

> "we want to save, re-use, and modify anything we make in MM, so we don't just use and throw away,
> every material should be considered a fertile seed for a future mutated version of that same
> material"

Material authoring is pinned to **Material Maker 1.3** — the version that runs on the target
MacBook. Nothing may depend on nodes or project behaviour introduced in 1.4–1.7. Every material is
authored as a saved, reusable, **versioned seed graph** with an explicit mutation lineage: named
configurations, child graphs, and new families are the three permitted mutation levels, and each
carries provenance back to its parent. No throwaway one-off texture batches. The owning pipeline
document is `MATERIAL-LANE.md`; the Guard Post's own parent-seed roster and trim-strip sources route
from `GOLDEN-SITES-CATALOG.md`.

## CL-R0 packet review — walls, door, sprite (Adam, 2026-07-23 — additive; verbatim)

> "also now seems like the walls are in the way again, though it's hard to tell at that zoom level"

> "even from what i can see of the door i can already see it looks more like a popsicle than a door"

> "sprite looks awful, i thought we had sprite citizenship nailed down like 10 days ago what happened,
> not it just looks flat and sickly"

All three confirmed against the banked `role-id` capture, not taken on faith. **Walls:** the near
walls render at full height and eat the bottom third of the frame; the room reads as a pit rather
than a diorama. **Door:** the frame is two thin flat planks and a cap with no reveal depth, standing
taller than the wall — it violates the construction law that openings have depth, and wiring a leaf
into it would not fix it. **Sprite:** root cause found — `spriteTextureFor()` never tagged the loaded
PNG's colour space while every sibling texture path does, so sRGB bytes were treated as linear and
gamma-encoded a second time on output (pale, chroma-collapsed). Not a regression: the sprite render
path never tagged it; what was proven earlier was the art, the registry, and the review tool, which
displays raw PNGs through the browser's own correct pipeline. Fixed and proven by A/B capture with
lighting held constant. Disposition and evidence: `CLAYROOM-RESET-LADDER.md` findings 4-6.

## Camera-side wall omission — the FFT wall grammar (Adam, 2026-07-23 — RULED FOR TEST; verbatim)

> "alright, we need to change wall modeling behavior in general. we have settled on a fixed camera
> for the game I believe, with maybe an optional toggle for a top down strategic view, either of
> those allows for us to just not render walls that are blocking the field of play, look at the
> final fantasy tactics maps if you need a reference for how they handled walls. now we might render
> a situation where there is an enclosed space held shut by a door, but honestly i think as soon as
> the door opens, in most cases the wall blocking the floor from the camera should disappear. can
> you think of edge cases where this doesnt work?"

Claude surveyed the edge cases (information/epistemics, re-concealment, mechanics readability,
wall-mounted content, sight-without-passage openings, structural masses, multi-story, L-shape
non-occluding walls, the strategic view, shared walls at C2A); Adam accepted the resulting shape:

> "yes, that sounds good enough to test."

**Status: RULED FOR TEST — direction locked for the test tranche; final law lands with clay
evidence.** The accepted test shape, binding for that tranche:

1. **Omission is compile-time, not render-time.** Under the fixed production camera (W3 §12.13),
   "camera-side" is a static fact of the layout: a wall segment whose face is camera-facing AND
   occludes staged floor builds NO upper volume. Deterministic, part of the board data and its
   receipt — not a per-frame fade. The sight-line fade machinery remains only for dynamic
   piece-occlusion (a pillar between camera and a figure).
2. **The trigger is STAGING, latched — not raw door state.** A sealed space renders sealed; its
   concealing walls come down when the space becomes staged play space (party enters / engagement
   spills through the threshold), and once staged they stay down until the space leaves play. A
   door slamming shut mid-scene never re-conceals actors. Sight through a cracked door reveals the
   doorway's own sight-cone, not the whole room.
3. **The stem stays.** A removed wall keeps its low stem/curb as the footprint truth-marker —
   removed walls still block movement, LOS, and cover, and the player must be able to count that.
   Zero-trace removal only at composed map edges with void beyond (the FFT map-edge grammar).
4. **Carve-outs:** structural/terrain masses (retaining walls, cliff faces, risers) are never
   omitted; sight-granting apertures (slits, deep windows, portcullises, bars) never trigger
   removal — sight is not passage; the top-down strategic view renders ALL walls (it is the
   map-reading mode; suppression is keyed per camera mode on the governed camera ladder).
5. **Placement prefers visible walls.** Since visibility is compile-time known, meaningful
   wall-mounted content (levers, sconces, observation faces) biases to camera-visible walls at
   placement time — a solver constraint, never a renderer patch.

Deferred with named owners: multi-story building cutaway (no enterable multi-story interior is
rolled yet); shared-wall staging across adjacent revealed rooms (C2A); the strategic-view toggle
itself (camera-ladder mode work). TEETH: the enforcing checks land with the CL-R3a wall tranche
(`CLAYROOM-RESET-LADDER.md`); the staged/latch trigger's executable test lands with C1B's door
state machine. This ruling supersedes the render-time camera-side upper fade
(`wallUpperCameraSideBlockingSet`) for the fixed camera once the test passes, and moots the
open clay-fixture shell-default question (near walls that occlude staged floor are simply not
built as uppers at all).

### Wall-omission test ACCEPTED on the capture packet (Adam, 2026-07-23 — additive; verbatim)

> "and yes, the omission looks best"

Ruled on the 2026-07-23 evening packet's A/B row (omit vs fade vs instanced,
`dev/clay-captures/cl-r3a/`). The camera-side wall-omission ruling above passes its clay test:
omission is the accepted wall treatment for the fixed production camera. Game-wide promotion
(flipping production dungeons from the render-time fade to compile-time omission) still rides its
own production-scene capture packet before the default moves outside the clay fixture — the clay
room proved the mechanism; a rolled multi-room dungeon frame proves the product.

## THE KINDERGARTEN DOOR — ornament retired, prototype dimensions fixed (Adam, 2026-07-23 — additive; verbatim)

> "ok, i have centered the door but seriously what the hell is the door. THE DOOR IS JUST AN
> EXTRUDED RECTANGLE. you have all this extra crap behind it and on top of it like it has some kind
> of ceremonial hat. it's an extruded rectangle that sits in a doorway, i gave you a diagram of what
> a doorway was earlier. this is unbelievably frustrating"

> "right, the dressing is on the doorway, not the door and for the purposes of getting a freaking
> working prototype going, lets just focus on the bare minimum kindergarten version of door.
> rectangle hole with rectangle door. also average door dimensions are 36" wide by 80" tall. we will
> definitely need more doors than that in this game but prototype door can be those dimensions"

Binding consequences, applied production-wide the same session:

- **The door is one hinged extruded rectangle. The doorway is a rectangle hole in the wall.**
  Dressing, when it ever returns, belongs to the DOORWAY, never the door — and none of it exists in
  the prototype. DELETED: the jamb posts, the header prism, both arch corbel steps (BW2-5/D4d), and
  the wall-thickness reveal slabs. What remains at a door cell is plain wall shaped around the hole:
  two full-height side pieces and one band above the opening, wall-coloured, wall-scaled.
- **Prototype door dimensions: 36" × 80"** = 0.6 × 1.3333 world units (GRID LAW, 1 u = 5 ft = 60 in),
  in a 0.61 × 1.35 opening. More door types arrive later through D14's typed catalog; the prototype
  is exactly this one.
- The darkness card (the beyond-the-door void mask) sizes to the OPENING and sits past the outer
  wall face — with the leaf closed it is fully hidden.
- Teeth: `dev/verify-clay-room.mjs` check 27 (executed through the real compile chain);
  `verify-ks2-door-assembly` and `verify-dungeon-interior` rewritten red-first to the new grammar
  (their real properties — axis shape, squeeze-narrower-and-lower — preserved on the new pieces).

## THE DOOR / DOOR-FRAME SPLIT — the definition, and the lane handoff (Adam, 2026-07-23 — additive; verbatim)

> "you still just have the idea of 'door' wrong. the door and door frame are two separate objects,
> the door frame should generally be constructed as a piece of the wall, and the door is an object
> that goes in the hole in the wall but i am handing this job to codex since fable can't seem to
> understand what a door is."

The binding definition, stated once and owned here:

1. **The door frame is WALL.** It is constructed as a piece of the wall — same body, same plane,
   same thickness, continuous with it. It is not an applied assembly, not proud of the wall face,
   not a separate-looking object. (The 2026-07-23 builds repeatedly failed this: ornament first,
   then infill pieces standing proud of the wall body at a different plane.)
2. **The door is a separate OBJECT** — the 36"×80" hinged extruded rectangle (the kindergarten
   ruling above) — that goes IN the hole in the wall. Two objects, two jobs; only the door is an
   object.

**LANE HANDOFF: the door/doorway geometry job belongs to CODEX** (the independent visual-acceptance
owner per AGENTS.md). Claude's lane retains what already works around it: the mount/tuner slice
(DEV-PORTAL §6.1), the record/board data derivation, the harnesses, and the capture rig. Codex brief:
`docs/CODEX-DOOR-BRIEF.md`.

## THE FLUSH-FACE DOOR + CLEAN WALL SOCKET (Adam, 2026-07-23 — additive; verbatim)

> "Seems like the doorframe construction is dirty, there are fragments of geometry shooting out the
> back, looks like there is bits in the door too, where i put the door is where it should sit, with
> the front nearly flush with the front face of the wall. still not sure why you and claude both
> want to just the door out, it makes no sense. are you centering the center of the door to the front
> face of the wall or something? why would you do that?"

Binding consequences:

- “Flush” governs the door's **front face**, never its centre plane. For the 0.32-deep prototype,
  the accepted default is 0.14 into the wall from the boundary, leaving the face only 0.02 proud.
- The doorway remains wall construction, but subdividing it may not duplicate the complete wall
  assembly per piece. One owner supplies one cap; jambs/lintel expose only the faces that bound the
  aperture or terminate the wall. No overlapping caps, feet, hidden end plates, trim, or fragments
  may occupy the hole or project behind it.

## THE SCENE-TRAY WALL CROWN (Adam, 2026-07-24 — additive; verbatim)

> "ok, the easiest solution for the stray geometry is to actually render the top of the walls,
> you're only rendering the vertical faces but not the top horizontal face that would give it the
> full \"scene tray\" or tabletop module feel"

Binding consequences:

- Every visible wall volume, doorway wall segment, and retained cutaway stem exposes a closed,
  horizontal top surface. A vertical shell without its crown is incomplete construction.
- The crown is part of the wall body, not trim or ornament. It gives the room the solid
  scene-tray/tabletop-module silhouette and visually resolves the wall's thickness.
- Its triangles must be front-facing from the governed camera above: geometric winding and the
  stored +Y normal must agree. A nominal top face that back-face culling erases does not satisfy
  this rule.

## CLAYROOM LIGHT OWNERSHIP + LOCAL BULB STATE (Adam, 2026-07-24 — additive; verbatim)

> "Fix lighting changing during unrelated animations.
> - Currently, firing an animation can temporarily change the bulb/light settings and make the room
> look different.
> - Instrument the actual light objects and materials before, during, and after door/camera
> animations to identify the root cause.
> - Door, camera, fade, and board-rebuild animations must not modify or reinitialize the authored
> lighting state.
> - Do not conceal the issue with forced per-frame resets."

> "Give each lightbulb an explicit local state.
> - Default state: steady.
> - Optional state: flickering.
> - Flicker must be per-light, not a global effect applied to every bulb.
> - A steady bulb must remain visually and photometrically steady.
> - When a bulb is flickering, its visible brightness/emissive appearance and its actual emitted
> light intensity must follow the same flicker sample on the same frame.
> - Prefer a deterministic seeded flicker pattern so captures and tests are reproducible."

Binding consequences:

- Light state belongs to each practical record. Missing/ordinary production state resolves to
  `steady`; `flickering` is an explicit per-light opt-in with its own seed and amplitude.
- One normalized deterministic sample multiplies both the real `PointLight.intensity` and the
  visible emitter material's emissive intensity on that tick. A steady sibling is never touched.
- Geometry-only board rebuilds and door/camera/fade animations preserve authored ambient, rig,
  practical objects, emitter materials, scheduler state, and values when the lighting identity is
  unchanged. Reinitializing them and then forcing values back every frame does not satisfy the law.
- Diagnostic proof reads the actual production objects/materials before, during, and after the
  governed animations, including their stable identities and normalized mesh/light parity.

## CLAYROOM HUMAN SCALE, SIMPLE CRATE, AND DOCKED STUDIO (Adam, 2026-07-24 — additive; verbatim)

> "it looks more like a museum artifact display podium for a statue. except it's too tall. also i
> think in general the vertical sizing of things is off in this room. let's default to 10 ft walls,
> and have everything sized for humans for now.
>
> if it's a crate, a simple 6 sided box will do. crate doesn't need extra geometry, it just needs a
> good sprite texture mapping with a little bit of nromal mapping
>
> also, i notice the trim on the corners is a little crusty, there's some polygon overlapping"

> "for materials we will want to be able to use the same material editor, though we will need to do
> a material creation pass soon and apply all the MM mappings to them"

> "yes, only existing, approved production stuff. we might need to refine how that is defined. I
> think the sprites should be good. I set all of the character sprites to be approved but i dont
> think that decision has been merged with master or made canon yet, even though it is"

> "session only be default for sure"

> "future rolls"

> "we'll go with the safest model"

After reviewing the three deliberately different generated workbench concepts, Adam selected the
first:

> "i actually prefer 1"

Binding consequences:

- **Human-room default:** ordinary interior walls are 10 feet high = 2 world units under GRID LAW.
  Door, fixture, furniture, sprite, and camera scale are judged against humans in that room; special
  scale domains must be explicit rather than leaking into the default.
- **Crate:** one human-scale six-sided box, not a stacked lid/body assembly or display podium. Its
  production FACED_BOX maps admitted side and top tiles onto the one box. A normal channel may be
  attached only through the admitted shared Material Editor / MM mapping pass; inferred or fabricated
  normal data is not canon.
- **Clean wall joins:** adjoining wall/trim volumes may not emit overlapping internal end faces.
  Door/open/riser boundaries retain exposed closures; wall-to-wall miters do not.
- **Concept 1 / Docked Studio is the Clayroom workbench layout:** persistent approved-production
  Catalog and live Scene rail on the left, the production room dominant in the center viewport, and
  a dedicated Inspector rail on the right. The inspector may undock by dragging its title and has an
  obvious dock/reset action.
- **Approved production content only.** The Catalog must never use demonstration-only objects to
  prove an editor feature. All existing character sprites are approved production inputs for this
  catalog; registry/provenance remains authoritative for their identities and measurements.
- **Safest edit scope:** object movement/tuning defaults to `INSTANCE · SESSION ONLY`. `STATE` is an
  explicit named-state path. `SOCKET` and `DEFAULT` are visibly separate and protected; Clayroom
  movement cannot silently rewrite a production socket. A promoted default overwrite applies to
  **future rolls**, never retroactively to the current placed instance.
- Sprite selection links to the existing Sprite Editor with that sprite active. Material selection
  uses the same shared Material Editor; the forthcoming material-creation pass admits and applies
  the MM mappings rather than duplicating a Clayroom-only material tool.

Selected concept receipt:
`dev/clay-captures/workbench-concepts/concept-1-docked-studio.png`.

## CLAYROOM FULL MOVEMENT-LAB SCALE (Adam, 2026-07-24 — binding)

> "we likely need to expand the clayroom to full test movement. 5x5 doesn't really test the full movement grid highlight with the dash secondary highlight"

The retained Clayroom movement fixture must be large enough to display an ordinary 30-foot movement region and a
materially distinct second 30-foot Dash extension at the same time. The original 5×5 C1A room remains historical
proof provenance, but it is not an adequate C1B movement fixture. The live retained fixture is therefore 15×15
cells under the existing 1-cell-equals-5-feet law.

The primary Move region is a filled highlight. The Dash-only extension is a hollow outlined/hatched region whose
locked-secondary meaning remains legible without color. Both regions, the selected route, movement cost, portal
state, and final position must project engine query/receipt answers; the Clayroom renderer may not calculate a
second path or movement rule.

## CLAYROOM FANTASY-TORCH REACH (Adam, 2026-07-24 — binding; verbatim)

> "i think the torch room brightness is about right, but unless we want torches everywhere, we
> might want to extend the range of the torch 2x, make sure it still has a smooth falloff and casts
> shadows"

Binding consequences:

- The accepted close-to-flame brightness stays fixed. Doubling reach is not permission to double
  source intensity or flatten the room into uniform orange fill.
- The lore-native `torchlit` recipe's maximum reach doubles from 30 feet to 60 feet (6 to 12
  tabletop world units; authored `rangeM` 9.144 → 18.288).
- Its smooth physical falloff remains decay 2, and the real point light continues to cast shadows
  across the extended reach.
- The extended-range exception belongs to the reviewed fantasy torch. It does not silently widen
  moonlight, lava, diagnostic bulbs, or generic generated interior lights.

## CLAYROOM FANTASY-TORCH REACH, SECOND DOUBLING (Adam, 2026-07-24 — binding; verbatim)

After reviewing the first doubled-range capture:

> "it's still a little too restrained, let's double it one more time"

This supersedes only the preceding 60-foot maximum. The torch now reaches 120 feet (24 tabletop
world units; authored `rangeM` 36.576). Its already-accepted close brightness, decay-2 falloff,
shadow casting, and torch-only scope remain unchanged.

## CLAYROOM FANTASY-TORCH FALLOFF (Adam, 2026-07-24 — binding; verbatim)

After reviewing the 120-foot capture:

> "that's a little better, though i think the falloff needs to scale outward a bit"

The torch keeps its accepted source brightness, 120-foot maximum, and shadow casting. Its smooth
falloff broadens modestly from decay 2.0 to 1.75 so more of the useful gradient lives away from the
flame. This supersedes the preceding decay-2 value only; the torch-specific scope remains.

## CLAYROOM FANTASY-TORCH FALLOFF, SECOND OUTWARD STEP (Adam, 2026-07-24 — binding; verbatim)

After reviewing decay 1.75:

> "ah so close, lets just incrase that one more tie by the same factor"

Apply the same 0.25 outward step once more: decay 1.75 → 1.50. The accepted source brightness,
120-foot maximum, color, shadows, and torch-only scope remain unchanged.

## CLAYROOM OPEN-FLAME DANCE (Adam, 2026-07-24 — binding; verbatim)

> "ok, now a real flame sconce will dance a bit, with a slight modulation in directionality and
> intensity at random intervals, can i see some proof of that"

After reviewing the first stepped implementation:

> "what fps we running at here, that looked choppy af"

> "ok so fix that please"

Binding consequences:

- The reviewed open-flame torch is an explicit `flickering` practical even though ordinary generated
  practicals still default to `steady`. This does not authorize global flicker.
- It chooses deterministic, seeded intensity and direction targets at irregular intervals. The
  current authored recipe uses ±10% intensity, a 420 ms cadence with 55% interval variation, and a
  0.025-local-unit directional bound.
- The visible flame and real point-light origin remain co-located and move together inside that
  bound. This is a tiny flame-origin dance that changes highlights and cast shadows; it does not
  convert a wall sconce into a spotlight.
- Target changes must be interpolated continuously on `requestAnimationFrame` at the display refresh
  rate (normally 60 FPS), never presented as one-to-four hard jumps per second. Seeded target choice
  remains reproducible; the path between targets is smooth.

## CLAYROOM OPEN-FLAME CHECKPOINT (Adam, 2026-07-24 — additive; verbatim)

> "let's work on it, i think the sconce is looking good the flicker still needs work but its passable for now"

The current sconce and smooth flicker are accepted as passable for this CL-R1 checkpoint. Flicker
polish remains open; this is not permission to remove its deterministic proof or silently promote
the current motion as the final open-flame treatment.

## SPRITE-FIRST MATERIAL AUTHORING (Adam, 2026-07-24 — binding; verbatim)

> "alright switched to a lower model and immediately ran into problems. so fable may have decided
> that materials shouldn't be built sprite first, but I am overriding that immediately, sprites
> first, materials layered on those sprites second. i like the richness of character that the
> sprites give us. Just for science, can you generate 3 different sprites and then just do 3
> different materials so I can make this decision with some evidence?"

Binding consequences:

- A new base material begins as a Genesis surface sprite. That sprite establishes the color,
  construction character, painterly pixel treatment, and play-distance read.
- Material Maker is the second pass. It imports the approved sprite as albedo and derives or
  authors structural height, normal, AO, roughness, and related PBR channels on top. It may not
  replace the sprite with a procedurally invented albedo.
- Source-sprite and derived-material evidence must be shown together. The controlled comparison
  keeps albedo, geometry, camera, roughness, and light fixed and changes only the MM depth channels.
- Illustration grain, outlines, and painted shading are not automatically physical relief. If a
  direct luminance conversion embosses those marks, the depth graph must isolate broader
  construction structure while preserving the sprite.
- Required repeat axes are source-sprite acceptance gates. MM derivation does not launder a visible
  source seam into a production material.
## MESHY DONOR-MODEL REFERENCE LANE (Adam, 2026-07-25 — additive; verbatim)

> "ok, so your role in this would be to generate the reference images for meshy in the FFT low poly style we are looking for. I'll go for the premium promo package which means we get up to 300 models this month. go ahead and give me a definitive list, with descriptions and a reference image"

Binding consequences:

- Codex owns generation of the reference images supplied to Meshy for this lane. Meshy does not
  independently establish Genesis style, object identity, scale, construction, materials, or
  production acceptance.
- This is a **volumetric donor-model reference lane** under `MODEL_RECIPE`, not a replacement for
  `EXTRUDE`, `LAYERED_EXTRUDE`, `FACED_BOX`, `LATHE`, `SWEEP`, `DECAL`, or `FX`, and not permission
  to send an entire site, room, building, wall kit, roof kit, stair, floor, or terrain plan to Meshy.
- Meshy reference art and Meshy output are both source evidence. Runtime citizenship still requires
  deterministic scale, origin, collision, cover, sockets, materials, states, LODs, provenance,
  fixed-camera proof, and an engine-owned assembly recipe.
- The `§7 Master prop generation prompt` remains the unchanged law for sprite/component sheets.
  Meshy input is a distinct source class because volumetric reconstruction needs visible form. Its
  reference may therefore use a controlled orthographic front-three-quarter view or a named
  front/side/back/front-three-quarter multiview set. It still forbids perspective distortion,
  scenery, floor plane, cast shadow, contact shadow, atmosphere, labels, unrelated props, and baked
  directional light.
- Every Meshy reference prompt must quote the `§7` **Visual language**, **Geometry ownership**, and
  **Avoid** blocks verbatim. The source-description, component/separation intent, projection,
  backdrop, and composition fields may be filled for the volumetric donor. Do not paraphrase the
  quoted style language.
- Generated references should favor incredibly simple geometry, large deliberate planes, strong
  silhouettes, mechanically legible separable parts, and broad material regions. Additional
  geometry must earn itself through silhouette, articulation, shadow, collision, walkability,
  light-fixture ownership, or important multi-angle recognition.
- The first Premium month is budgeted as 75 high-reuse donor families with four intentional
  geometry/state variants each, totaling the available 300 model slots. The definitive list and
  production order live in `MESHY-PREMIUM-MONTH-1-MODEL-SLATE.md`; its exclusions preserve the
  cheaper procedural, extrusion, faced-box, sprite, shader, and narrative lanes.

## CLAYROOM LAYERED MOOD + TRAVERSABILITY GRID (Adam, 2026-07-26 — additive; verbatim)

> "how do we capture those mood lighting effects without obliterating natural sources? wouldn't dawn be even better with a nice mood lighting layered onto it? wouldn't the dungeon be even scarier?"

> "starting to look very good. i don't like the current state of the mood lighting, i don't think the sample imagegen visions are just an obvious single source of lighting, also the weird torch pixel blob gotta go
>
> something I am noticing that we will need is that the grid that is overlaid on the floor plane, should be overlaid across any flat or traversible surface"

Binding consequences:

- A room mood is a coloured environmental field layered around its natural or practical source.
  The source still owns its visible emitter, direction, brightest local cue, and defining shadow;
  the room field keeps the rest of the volume readable and may not collapse into one arbitrary
  invisible coloured bulb.
- The early visual targets are
  `ui-sketches/mock-frames/mock-01-chrome-combat.png`,
  `ui-sketches/mock-frames/mock-01-gloom-combat.png`, and
  `ui-sketches/mock-frames/mock-01-fantasy-explore.png`: broad coloured ambience/bounce establishes
  the room condition while practicals and effects act as local punctuation.
- A visible practical must retain a physical, readable emitter. Coarse square bloom or a detached
  pixel blob is not an acceptable substitute for flame or glow geometry.
- The tactical grid follows the support surface rather than remaining a decal on the base floor.
  It projects across floor tiers, terraces, landings, stair treads, walkable slopes, and accessible
  object/support tops; non-cell-sized tops are clipped to their actual support polygon and do not
  mint a fake 5-foot footprint.

## CLAYROOM TEXTURE HANDOFF + CONTACT TRUTH (Adam, 2026-07-26 — binding; verbatim)

> "ok first off, great job on everything but the mood lighting, you can put that aside for now, i think it's time to start moving on to texturing because i get the feeling this is gonna suck"

> "so i am not sure if we are doing this or not, but walls that cutaway or are there but don't render, i would prefer if they rendered a 1ft tall stub so i can get a feel for where the wall would actually be"

> "also, those stairs are floating in the test image"

> "i also see that the floor of the room doesn't sit flush with the walls that sit on top of it, the floor comes up a little shorter than the actual walls"

> "and i don't see the grid overlay on the floor in the structure"

Binding consequences:

- The current mood-lighting study is parked, neither approved nor deleted. Texture/material proof
  becomes the active next gate and begins with one parent at a time.
- A cutaway or upper-hidden wall retains an exact one-foot solid stub. The full wall remains
  mechanically true; only its upper rendering changes. Door and opening carve-outs remain honest.
- Architectural contact may not be implied by shadows or hidden by texture. Stairs begin on their
  actual support datum, floor substrates bear the full footprint of walls placed on them, and all
  joins must remain closed under cast shadows and AO.
- The tactical grid must be visibly legible on the final traversable-surface census, including
  structure floors and stair treads. A receipt-only grid that disappears at the review camera does
  not satisfy the ruling.

## CLAYROOM TWO-MATERIAL + VISIBLE GRID PROOF (Adam, 2026-07-26 — binding; verbatim)

> "on both of the sample images you provided there are clear examples of floors or walkable surface with no grid overlay
>
> yeah, the ashlar at that scale makes for a great brick, remember that scale for a white brick because it works perfectly
>
> let's go ahead and prove two materials simultaneously and make sure the grid reads even on top of the material, the grid might need a multiply blend mode applied to it to be visible on the textured floor, but i do want it visible."

Binding consequences:

- A grid census or geometry receipt is insufficient when the grid disappears in the final image.
  Every declared flat or traversable top must carry a surface-clipped overlay that remains readable
  at the governed review camera and resolution.
- The overlay darkens the material underneath via alpha-weighted multiply. It remains depth-tested,
  does not glow or bleach the albedo, and does not create a false support polygon beyond the real
  surface boundary.
- The current dressed-ashlar source scale is accepted and retained as the scale reference for a
  future white-brick parent. This ruling accepts scale, not the current palette and not production
  promotion.
- CL-F04 proves two exact source-authority material parents simultaneously in matched bays. Both
  bays use the same geometry, physical tile scale, UV phase law, camera, light, grid renderer, and
  comparison mode so the evidence changes material parent rather than scene composition.

## CLAYROOM COMPLETE TRIMMED STRUCTURES + PREVENTIVE INVARIANTS (Adam, 2026-07-27 — binding; verbatim)

> "yeah i think both of those materials look great, now i would like to see some structures built fully trimmed out, and with varying textures applied correctly"

> "those stairs make no sense, they're just plopped into the structure, half floating outside of the structure"

> "when you run into problems like this are you making sure they will never happen again or are you only correcting it in this singular instance?"

Binding consequences:

- Both CL-R4b masonry parents pass Adam's visual taste gate. Their use in the retained CL-F05
  composition proof is approved; broader production assignment remains an explicit routing step,
  not an inference from the taste verdict.
- A fully trimmed structure is a complete architectural assembly, not a texture sampler: supported
  floor, owned wall corners and endpoints, honest cutaway stubs, framed openings, base/cornice/cap
  hierarchy, and trim at elevation transitions and stair/curb boundaries must read together.
- Material variation must be semantically routed and reviewable. Matched structures swap approved
  body parents and culture-owned trim while keeping architecture, camera, light, and comparison
  mode fixed; six-colour role debug remains available over the exact same geometry.
- A visible correction is insufficient when the failure can recur. The relevant architectural
  relationship becomes a pre-mount invariant plus a negative regression: stairs and platforms stay
  inside inner wall bounds, rises remain equal, adjacent solids overlap at contact, the top tread
  meets its landing, a retaining curb yields the stair opening, and a doorway cannot intersect the
  raised platform. Illegal compositions reject loudly instead of rendering a curated exception.
