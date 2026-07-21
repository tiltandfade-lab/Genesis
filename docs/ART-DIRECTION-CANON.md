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
