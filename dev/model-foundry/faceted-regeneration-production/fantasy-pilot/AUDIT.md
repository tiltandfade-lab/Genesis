# Fantasy Faceted Regeneration Pilot Audit

Status: raw generation candidates only. No cropped component, compiled mesh, visual QA pass, in-engine pass,
or runtime admission is implied by this folder.

Production source of truth:

- `dev/model-foundry/FACETED-ART-REGENERATION-PRODUCTION-PLAN.md`

Standing audit rules:

- Reject or regenerate any sheet with true perspective, visible top/side planes where a front elevation was
  required, style drift away from mature large-faceted Fantasy, component overlap, labels/text, or scene/shadow
  contamination.
- Flag, do not discard, any visually useful sprite that fails as part of its requested kit.
- A kit must pass component fit. A good frame and a good leaf are not a door kit unless the leaf fits the
  frame aperture at the same authored scale and shape.
- Generation sheet positions are disposable. Cropping and deterministic assembly own all placement.
- `runtimeAdmitted` remains false for every candidate here.

## Raw Sheets

Alpha cleanup pass:

- Green-key removal was run with the shared `imagegen` chroma helper into `alpha-sheets/`.
- Spot-check found no obvious green halo or destroyed aperture at sheet scale.
- Alpha output remains a technical cleanup artifact only; component crop QA is still required.

### `raw-sheets/fantasy-switch-kit-sheet-001.png`

Source: built-in image generation call `call_ctYRLxYwwDLXnFqguUEyrK8z`.

Requested components:

- switch base plate
- lever arm
- axle collar
- inactive indicator gem

Audit verdict: candidate for cleanup/cropping.

Alpha sheet: `alpha-sheets/fantasy-switch-kit-sheet-001-alpha.png`

Notes:

- Strong mature Fantasy identity and large triangulation.
- Components are isolated and separable.
- Base and lever are not preassembled.
- No obvious true camera perspective; bevel/relief cues read as front-face material language.
- Needs crop QA around holes and green-key apertures before alpha cleanup.

### `raw-sheets/fantasy-door-kit-arched-mismatch-audit-001.png`

Source: built-in image generation call `call_TobI1qI2q03xe6cVR8JrmmEn`.

Requested components:

- empty ornate door frame
- matching door leaf

Audit verdict: salvage only; fails as a matched door kit.

Alpha sheet: `alpha-sheets/fantasy-door-kit-arched-mismatch-audit-001-alpha.png`

Notes:

- Strong visual quality and useful individual components.
- Door leaf does not fit the frame aperture: arch/frame proportions and leaf silhouette do not mate.
- Keep as audit/salvage input for possible independent arched-frame or ornate-leaf reuse.
- Do not compile as a shut/ajar/open state family.

### `raw-sheets/fantasy-door-kit-rectangular-candidate-002.png`

Source: built-in image generation call `call_PoPVjSQtDU0PsSIwLOwDx4Sb`.

Requested components:

- empty rectangular banded-oak door frame
- matching rectangular banded-oak door leaf

Audit verdict: stronger door-kit candidate; needs fit measurement after alpha cleanup.

Alpha sheet: `alpha-sheets/fantasy-door-kit-rectangular-candidate-002-alpha.png`

Notes:

- Rectangular aperture and rectangular leaf are much closer to a valid deterministic kit.
- Same broad material family and scale language.
- No obvious true perspective; front relief is acceptable candidate source art.
- Leaf may be slightly too wide/tall depending on crop bounds, so exact fit remains unproven.
- Runtime still owns hinge axis, thickness, side shell, and shut/ajar/open transforms.

### `raw-sheets/fantasy-wall-trap-flatprops-sheet-001.png`

Source: built-in image generation call `call_nu2Z9tKpzo4gqdiOPG4Jnjca`.

Requested components:

- ornate wall shield/relief
- painted dragon tablet/portrait
- floor trap pressure plate frame
- separate trap trigger plate or blade/hazard insert

Audit verdict: partial candidate; likely split into wall props plus trap salvage.

Alpha sheet: `alpha-sheets/fantasy-wall-trap-flatprops-sheet-001-alpha.png`

Notes:

- Wall shield/relief and dragon tablet are strong front-elevation wall candidates.
- Dragon tablet includes a posed dragon image, but it is inside a flat framed panel and can function as a
  painted/relief wall citizen.
- Trap frame is usable as a top-down or near-top-down floor plate candidate.
- Trap insert returned as a raised spiked hazard plate rather than a simple pressure trigger. Treat it as a
  hazard component candidate, not proof of the requested trigger insert.
- Needs stricter floor/top projection review before trap compilation.

### `raw-sheets/fantasy-container-practical-audit-001.png`

Source: built-in image generation call `call_GvYbraxRyAXkfVpCDoGQhDiL`.

Requested components:

- chest front face
- matching chest side face
- wall sconce fixture without flame
- flame/crystal emissive insert

Audit verdict: salvage only for container kit; partial candidate for practical light.

Alpha sheet: `alpha-sheets/fantasy-container-practical-audit-001-alpha.png`

Notes:

- Chest front face is useful as a faced-box front panel.
- The requested chest side face drifted into a separate arched front/door-like panel, so this fails as a
  coordinated faced-box chest kit.
- Sconce fixture and crystal insert are promising practical-light components.
- Sconce fixture has some volumetric bowl cues; route through `MODEL_RECIPE` or shallow fixture assembly rather
  than naive contour extrusion if crop QA confirms depth ambiguity.
- No runtime light or glow-disc behavior is admitted from this sheet.

### `raw-sheets/fantasy-chest-facedbox-audit-002.png`

Source: built-in image generation call `call_QUE5iO25hMx6UR31cVX4QcGj`.

Requested components:

- chest front face panel
- chest left side face panel
- chest right side face panel
- chest lid/top face panel

Audit verdict: partial candidate; salvage/audit for faced-box construction, not a complete admitted kit.

Alpha sheet: `alpha-sheets/fantasy-chest-facedbox-audit-002-alpha.png`

Notes:

- Strong mature Fantasy material/style match.
- Front panel and lid/top-like wide panel are useful candidates.
- The side panels still read too much like alternate front panels because they include ring hardware and similar
  frontal trim language.
- Do not use as a fully coordinated faced-box kit until side/top panel identity is corrected or authored
  procedurally.
- No true three-quarter chest was generated, which is progress over the prior container sheet.

### `raw-sheets/fantasy-floor-trap-kit-candidate-002.png`

Source: built-in image generation call `call_CCZtuUkwf5Q9aFSJMdKzCrqC`.

Requested components:

- rectangular trap floor frame with empty central aperture
- matching flat pressure plate insert
- retracted blade/spike hazard insert
- extended blade/spike hazard insert

Audit verdict: candidate for cleanup/cropping and deterministic trap assembly.

Alpha sheet: `alpha-sheets/fantasy-floor-trap-kit-candidate-002-alpha.png`

Notes:

- Stronger top-down floor projection than the prior trap attempt.
- Frame, flat plate, retracted insert, and extended insert are mechanically legible.
- The state relationship is promising: retracted and extended inserts can be engine-swapped within the same floor
  frame footprint.
- Needs crop fit measurement to confirm the pressure plate and hazard inserts align with the frame aperture.
- Keep mounted as floor/top projection only.

### `raw-sheets/fantasy-practical-light-audit-002.png`

Source: built-in image generation call `call_RvPDvTQBLrAu4kuyK2BzARPI`.

Requested components:

- empty wall sconce backplate/bracket
- separate candle/flame insert
- lantern cage/body with no glow
- faceted amber crystal/bulb insert

Audit verdict: salvage/partial candidate; not a perfect four-component practical kit.

Alpha sheet: `alpha-sheets/fantasy-practical-light-audit-002-alpha.png`

Notes:

- Sconce backplate and lantern body have strong physical fixture identity.
- Candle/flame came preassembled with a small holder, so treat it as a compact candle insert candidate rather than
  a pure flame-only component.
- Crystal insert is useful, but includes a small mount collar; still acceptable as an emitter subcomponent if the
  recipe owns `emitterLocal`.
- Lantern body has some implied volume cues and should route through `MODEL_RECIPE` or fixture assembly, not naive
  contour extrusion.
- No glow-disc behavior is represented or admitted.

### `raw-sheets/fantasy-portable-items-sheet-003.png`

Source: built-in image generation call `call_RE0IuTaHBKw0rMMKFk6zfho1`.

Requested components:

- ornate dungeon key
- ritual dagger
- sealed parchment scroll/tag
- coin/medallion relief

Audit verdict: candidate for cleanup/cropping.

Alpha sheet: `alpha-sheets/fantasy-portable-items-sheet-003-alpha.png`

Notes:

- Strong Fantasy item identity without falling back into fake pixel art or generic UI icon simplicity.
- Key and dagger read as usable strict-profile shallow extrusion inputs.
- Scroll and medallion read as front-elevation shallow props/reliefs.
- No obvious true perspective; crop QA still needs to verify holes in the key and medallion survive component
  slicing.

### `raw-sheets/fantasy-wall-banner-sign-audit-003.png`

Source: built-in image generation call `call_1M9zyOARujrZbLWrQjZwcvZc`.

Requested components:

- torn heraldic banner cloth
- separate iron banner rod/bracket
- warning signboard with non-readable marks
- barred window/grate insert

Audit verdict: partial candidate; banner kit fails component separation.

Alpha sheet: `alpha-sheets/fantasy-wall-banner-sign-audit-003-alpha.png`

Notes:

- Signboard and grate are strong front-elevation wall candidates.
- Banner visually fits the mature faceted target, but it came preassembled onto a rod despite the requested split.
- Rod/bracket is useful, but not a clean independent banner hardware component because the banner cell already
  includes rod hardware.
- Keep for salvage/review; do not use as proof of a reusable banner cloth plus bracket kit.

## Figure Anchors

Figure sheets follow `FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` section 6. They are standee source
art candidates only. Runtime plinth, side shell, contact shadow, scale, and admission remain separate.

### `raw-figures/fantasy-monster-hobgoblin-captain-audit-001.png`

Source: built-in image generation call `call_80dwGd6h0qrhtfkI4ijT9ogr`.

Category: monster.

Audit verdict: visual candidate with proportion caution.

Alpha figure: `alpha-figures/fantasy-monster-hobgoblin-captain-audit-001-alpha.png`

Notes:

- Strong personality-bearing ready pose; reads as commanding and dangerous.
- Mature faceted treatment is good, and the shield/sword are mechanically readable.
- Caution: shoulder/armor mass drifts somewhat toward oversized fantasy silhouette. Keep for review, but do not
  treat as final monster-standard proof without gameplay-scale check.
- No cute mascot drift or friendly expression.

### `raw-figures/fantasy-npc-dungeon-archivist-candidate-001.png`

Source: built-in image generation call `call_ANo9iI1TkStWjmLAlsHOu6B7`.

Category: adult NPC.

Audit verdict: candidate.

Alpha figure: `alpha-figures/fantasy-npc-dungeon-archivist-candidate-001-alpha.png`

Notes:

- Strong grounded social role: older archivist, ledger, keys, worn practical clothing.
- Restrained noncombat pose and adult proportions.
- Good large-faceted material separation across face, cloth, leather, and metal objects.
- Needs foot anchor/scale metadata before any in-game review.

### `raw-figures/fantasy-child-dungeon-messenger-candidate-001.png`

Source: built-in image generation call `call_2lBOfnDMxuWTwaqpbwwZIiPT`.

Category: child.

Audit verdict: candidate.

Alpha figure: `alpha-figures/fantasy-child-dungeon-messenger-candidate-001-alpha.png`

Notes:

- Reads as a preteen child rather than a miniature adult or chibi mascot.
- Clothing, satchel, note case, and worried/brave expression fit the requested role.
- Nonsexual, practical presentation; no glamour or action-hero drift.
- Needs true-height metadata and gameplay-scale review.

### `raw-figures/fantasy-animal-dungeon-wolfhound-candidate-001.png`

Source: built-in image generation call `call_k9ACw5y6XcezOAxdmZXwVNmS`.

Category: animal/natural beast.

Audit verdict: candidate.

Alpha figure: `alpha-figures/fantasy-animal-dungeon-wolfhound-candidate-001-alpha.png`

Notes:

- Strong canine anatomy, long-legged guard posture, clear support region.
- Expressive without anthropomorphic or mascot drift.
- Mature large-faceted treatment works well on fur masses and scars.
- Wide silhouette likely needs one-asset review density and careful standee footprint metadata.

### `raw-figures/fantasy-pc-half-elf-ranger-candidate-001.png`

Source: built-in image generation call `call_nYSciV4Cmaz5YOAnt7KUbELj`.

Category: PC.

Audit verdict: candidate.

Alpha figure: `alpha-figures/fantasy-pc-half-elf-ranger-candidate-001-alpha.png`

Notes:

- Strong neutral-ready PC identity with readable half-elf ears, cloak, bow, quiver, armor, sword, and buckler.
- Avoids oversized weapons and superhero attack pose.
- Mature faceted treatment and controlled palette fit the target.
- Needs player-locked identity metadata before this can represent any real PC; current use is a style/technical
  anchor only.

### `raw-figures/fantasy-boss-black-dragon-candidate-001.png`

Source: built-in image generation call `call_QqyoBSwXcPyLGjtZ2BEow1R2`.

Category: boss / large monster.

Audit verdict: candidate; one-per-review density required.

Alpha figure: `alpha-figures/fantasy-boss-black-dragon-candidate-001-alpha.png`

Notes:

- Strong frightening dragon read with patient predatory posture rather than friendly poster roar.
- Large silhouette, wing/tail width, and dark material response require close inspection and gameplay-scale
  readability testing.
- Anatomy and support region are clear enough for standee metadata work.
- Use as a boss/centerpiece candidate only; do not pack densely on a review sheet.

### `raw-figures/fantasy-monster-undead-knight-candidate-001.png`

Source: built-in image generation call `call_pzkfavEyWvjadV3JzMtxVcrg`.

Category: monster.

Audit verdict: candidate with crop-margin caution.

Alpha figure: `alpha-figures/fantasy-monster-undead-knight-candidate-001-alpha.png`

Notes:

- Strong undead horror through stillness, damaged armor, skull/helm read, and lowered sword.
- Mature faceted metal and cloth treatment; no comic skeleton drift.
- Tall composition approaches canvas margins, so crop QA must confirm sword/feet are preserved with padding.
- Good ordinary monster personality anchor.

### `raw-sheets/fantasy-shrine-portal-components-audit-004.png`

Source: built-in image generation call `call_mZOdnAWdOdrdrpLFJNBmZbf7`.

Requested components:

- carved stone altar front relief panel
- round rune disk insert
- broken shrine backplate
- inactive portal arch keystone/crown ornament

Audit verdict: partial candidate.

Alpha sheet: `alpha-sheets/fantasy-shrine-portal-components-audit-004-alpha.png`

Notes:

- Relief panel, rune disk, and portal crown ornament are strong front-elevation candidates.
- Broken shrine backplate has some depth/perspective ambiguity and should route to audit/salvage unless crop QA
  proves it can function as a flat wall/backplate source.
- Good mature Fantasy identity and large-faceted material language.
- No active glowing portal behavior is represented or admitted.

## Calibration and Replacement Intake

Legacy pixelated sprites copied into `legacy-archive/assets-sprites/` are backups for exact matched
replacement candidates. Active `assets/sprites/` files have not been overwritten in this pass because
the generated sheets still need slicing, per-sprite metadata, QA, and admission.

### `raw-figures/fantasy-npc-midwife-innkeeper-calibration-002.png`

Source: built-in image generation call `call_BupUDGk6XkBaqm9xt3o6dmXU`.

Category: adult NPC 2-up sheet.

Audit verdict: calibration target / candidate.

Alpha figure sheet: `alpha-figures/fantasy-npc-midwife-innkeeper-calibration-002-alpha.png`

Legacy backups:

- `legacy-archive/assets-sprites/spr-fantasy-human-midwife-elderly-delivered-half-the-village-remembers-all-of-it.png`
- `legacy-archive/assets-sprites/spr-fantasy-halfling-innkeeper-knows-every-traveler-s-business-before-they-ve-unpacked.png`

Notes:

- Adam approved this as the current best triangulation target: broad readable planes, clear mature style,
  good body/role distinction, and no fake pixel read.
- Confirms 2 NPCs per sheet is acceptable when figures remain large enough for review.
- Innkeeper is a good example of fat/stout urban NPC body type used as identity, not comedy.

### `raw-figures/fantasy-goblin-family-lanky-audit-002.png`

Source: built-in image generation call `call_i35yOCnekLrM2Vs65JceqCT6`.

Category: goblin-family monsters 2-up sheet.

Audit verdict: candidate with facet-density drift warning.

Alpha figure sheet: `alpha-figures/fantasy-goblin-family-lanky-audit-002-alpha.png`

Legacy backups:

- `legacy-archive/assets-sprites/spr-fantasy-goblin-cutter-minion.png`
- `legacy-archive/assets-sprites/spr-fantasy-goblin-boss.png`

Notes:

- Lankier, more useful goblin proportions than the earlier hobgoblin-like direction.
- Front-biased poses are more functional for 1x1 bases.
- Adam flagged slight drift toward triangulation that is too regular/fine in places. Keep, but prompts
  should push broader, more irregular planes going forward.

### `raw-figures/fantasy-npc-brewer-towncrier-candidate-003.png`

Source: built-in image generation call `call_9z9YtY7YFDN7nGCTSncDZ6Ev`.

Category: adult NPC 2-up sheet.

Audit verdict: candidate with crop-margin caution.

Alpha figure sheet: `alpha-figures/fantasy-npc-brewer-towncrier-candidate-003-alpha.png`

Legacy backups:

- `legacy-archive/assets-sprites/spr-fantasy-dwarven-brewer-the-tavern-s-actual-reason-for-existing.png`
- `legacy-archive/assets-sprites/spr-fantasy-human-town-crier-human-announces-news-rumor-and-the-occasional-lie-for-coin.png`

Notes:

- Good proof of body-shape variety: stout urban brewer plus tall lean town crier.
- Taller 4:8-like framing helps non-halfling proportions.
- Sheet is close to canvas edges; slicing/crop QA must confirm all feet, hat, hands, bell, and papers have
  enough margin.
- Mask scan: sliceable by declared left/right half first, then alpha-crop. No comfortable full-height chroma
  gutter; treat as usable but brittle.

### `raw-figures/fantasy-undead-skeleton-zombie-audit-003.png`

Source: built-in image generation call `call_OEZLCyzpO4E6ZP3fH20qaazY`.

Category: compact monster 2-up sheet.

Audit verdict: visual candidate, slicing warning.

Alpha figure sheet: `alpha-figures/fantasy-undead-skeleton-zombie-audit-003-alpha.png`

Legacy backups:

- `legacy-archive/assets-sprites/spr-fantasy-skeleton-warrior.png`
- `legacy-archive/assets-sprites/spr-fantasy-zombie-plague-carrier.png`

Notes:

- Strong front-biased 1x1-base monster direction.
- Horror read is mature and functional.
- Figures are too close for comfortable slicing; future two-up prompts must demand wider chroma gutters and
  larger outer margins.
- Mask scan: still sliceable by declared left/right half first, then alpha-crop. The masks meet the center
  boundary with no spare gutter, so do not use this spacing as the production standard.

### `raw-figures/fantasy-npc-magistrate-herbalist-candidate-004.png`

Source: built-in image generation call `call_hc6yMYdafIJnfdlvISONFIOk`.

Category: adult NPC 2-up sheet.

Audit verdict: candidate.

Alpha figure sheet: `alpha-figures/fantasy-npc-magistrate-herbalist-candidate-004-alpha.png`

Notes:

- Strong correction toward racial/ancestry diversity: dark-skinned human magistrate and older orc/half-orc
  herbalist in ordinary respected civic/trade roles.
- Much better spacing/gutter for slicing.
- Minor note: some robe areas still trend toward finer triangulation; acceptable candidate, but future prompts
  should continue pushing broader irregular planes.
- Mask scan: good 73px full-height chroma gutter between figures; preferred two-up spacing pattern.

### `raw-figures/fantasy-bandit-enforcer-desperate-candidate-005.png`

Source: built-in image generation call `call_sqxehaEy8zp9grvctDoF9QdW`.

Slugs: `spr-fantasy-bandit-enforcer`, `spr-fantasy-desperate-bandit`.

Audit verdict: candidate.

Alpha figure sheet: `alpha-figures/fantasy-bandit-enforcer-desperate-candidate-005-alpha.png`

Notes: Good compact base-functional bandit pair, strong gutter, useful body/skin-tone contrast, weapons close.

### `raw-figures/fantasy-orc-blacksmith-dragonborn-guard-unusable-005.png`

Source: built-in image generation call `call_VBenvt1HZZizSbsnMRyOe1dS`.

Slugs: `spr-fantasy-orcish-caravan-blacksmith-orc-repairs-wagon-wheels-faster-than-anyone-in-three-towns`,
`spr-fantasy-dragonborn-temple-guard-devout-literal-minded-takes-the-oath-seriously`.

Audit verdict: mixed; orc blacksmith unusable as replacement, dragonborn guard salvage/candidate.

Alpha figure sheet: `alpha-figures/fantasy-orc-blacksmith-dragonborn-guard-unusable-005-alpha.png`

Notes:

- Orc blacksmith includes a cropped wagon wheel/set-dressing artifact attached near the figure; fail as a clean
  sprite replacement.
- Dragonborn guard remains usable/salvageable if sliced independently.
- This sheet is retained for audit and possible dragonborn extraction only.

### `raw-figures/fantasy-elf-roadguard-dwarf-captain-candidate-005.png`

Source: built-in image generation call `call_E8J4do7UEjdMbpp0vdJuKuqH`.

Slugs: `spr-fantasy-road-guard-elf`,
`spr-fantasy-dwarven-town-guard-captain-elderly-dwarf-decades-on-the-wall-trusted-by-everyone`.

Audit verdict: candidate.

Alpha figure sheet: `alpha-figures/fantasy-elf-roadguard-dwarf-captain-candidate-005-alpha.png`

Notes: Strong ancestry/body diversity, clean guard roles, good slicing space, compact weapons.

### `raw-figures/fantasy-hobgoblin-soldier-ironshadow-candidate-005.png`

Source: built-in image generation call `call_UzmRGZSTMPdvTrXnadJqOcd0`.

Slugs: `spr-fantasy-hobgoblin-soldier`, `spr-fantasy-hobgoblin-iron-shadow`.

Audit verdict: candidate.

Alpha figure sheet: `alpha-figures/fantasy-hobgoblin-soldier-ironshadow-candidate-005-alpha.png`

Notes: Good front-biased compact monster poses, especially the lean iron shadow. Soldier is less lanky but still
functional and not MMO-bulky.

### `raw-figures/fantasy-orc-healer-dragonborn-enforcer-candidate-006.png`

Source: built-in image generation call `call_ndPhEDtz2CuT7mGbf4NRlHjQ`.

Slugs: `spr-fantasy-orcish-healer-gentle-hands-a-reputation-people-are-slow-to-trust`,
`spr-fantasy-enforcer-dragonborn`.

Audit verdict: candidate.

Alpha figure sheet: `alpha-figures/fantasy-orc-healer-dragonborn-enforcer-candidate-006-alpha.png`

Notes: Corrects gaze variety with direct healer gaze and sideways enforcer suspicion. No cropped extra props.

### `raw-figures/fantasy-medusa-doppelganger-audit-006.png`

Source: built-in image generation call `call_wRv5smb9VyEhP1dbSUzLzJgt`.

Slugs: `spr-fantasy-medusa`, `spr-fantasy-doppelganger`.

Audit verdict: candidate/audit.

Alpha figure sheet: `alpha-figures/fantasy-medusa-doppelganger-audit-006-alpha.png`

Notes:

- Strong monster personality: menacing/regal medusa and charming-uncanny doppelganger.
- Medusa trends slightly glamour-forward; keep for review rather than automatic acceptance.

### `raw-figures/fantasy-eye-tyrant-mouther-candidate-006.png`

Source: built-in image generation call `call_BouX6ykAUX8vlFCOZ0aYRSOZ`.

Slugs: `spr-fantasy-undead-eye-tyrant`, `spr-fantasy-gibbering-mouther`.

Audit verdict: candidate.

Alpha figure sheet: `alpha-figures/fantasy-eye-tyrant-mouther-candidate-006-alpha.png`

Notes: Good proof that broad/round monsters should keep their true shape. Expressive, frightening, separable,
and not forced into humanoid verticality.

### `raw-figures/fantasy-clockmaker-tavernowner-candidate-007.png`

Source: built-in image generation call `call_ioagANwLlQOY0dIlaTP4rcnd`.

Slugs: `spr-fantasy-gnomish-clockmaker-gnome-every-clock-in-town-keeps-slightly-different-time-on-purpose`,
`spr-fantasy-tiefling-tavern-owner-tiefling-runs-the-friendliest-bar-in-a-town-that-fears-her-kind`.

Audit verdict: candidate.

Alpha figure sheet: `alpha-figures/fantasy-clockmaker-tavernowner-candidate-007-alpha.png`

Notes: Strong civic NPC sheet with good gaze variety, ancestry/body diversity, and no set dressing. Clockmaker
uses downward tool focus; tavern owner uses direct guarded welcome.

### `raw-figures/fantasy-apprentice-warningchild-candidate-007.png`

Source: built-in image generation call `call_O1tAF5ComkBdGiepqc4KNemj`.

Slugs: `spr-fantasy-human-midwife-s-apprentice-human-dark-skinned-learning-the-trade-from-her-mother`,
`spr-fantasy-kid-wants-warn-someone-and-not-one-adult-will-slow-down-long-enough-to-hear-it`.

Audit verdict: candidate.

Alpha figure sheet: `alpha-figures/fantasy-apprentice-warningchild-candidate-007-alpha.png`

Notes: Good child/adolescent treatment without chibi or miniature-adult drift. Strong emotional variation.

### `raw-figures/fantasy-guarddog-wolfpup-candidate-007.png`

Source: built-in image generation call `call_AlncUzMwwbTMcDfaztl9G2Z0`.

Slugs: `spr-fantasy-dungeon-animal-scarred-guard-dog-gone-feral-once-trained-to-patrol-these-halls-now-answers-to-no-one`,
`spr-fantasy-wild-animal-a-lone-timber-wolf-pup-not-yet-part-of-any-pack-still-learning-to-hunt`.

Audit verdict: candidate.

Alpha figure sheet: `alpha-figures/fantasy-guarddog-wolfpup-candidate-007-alpha.png`

Notes: Usable animal pair with real canine shape and behavior. Naturally wider than humanoid standees, but not
gratuitously side-sprawled.
### `raw-figures/fantasy-cultist-fanatic-candidate-008.png`

Source: built-in image generation call `call_7iEY5ClWL44J45X3g4CFCauj`.

Requested sprites:

- `spr-fantasy-cultist`
- `spr-fantasy-cultist-fanatic`

Audit verdict: candidate.

Alpha sheet: `alpha-figures/fantasy-cultist-fanatic-candidate-008-alpha.png`

Notes:

- Strong adult dark-fantasy cult identity; direct gaze variety is better than prior off-camera NPC drift.
- Robe interiors include some finer dark facets, but face/robe silhouette planes remain broad enough for the
  current style target.
- Exact legacy sprites archived when present.

### `raw-figures/fantasy-priest-noble-candidate-008.png`

Source: built-in image generation call `call_Cx1pYw0h5dpduLLAAB5AsBeJ`.

Requested sprites:

- `spr-fantasy-priest`
- `spr-fantasy-noble`

Audit verdict: candidate.

Alpha sheet: `alpha-figures/fantasy-priest-noble-candidate-008-alpha.png`

Notes:

- Good ancestry diversity, varied gaze, and mature court/cleric tone.
- Wide gutter and full-body framing are suitable for later slicing.
- Exact legacy sprites archived when present.

### `raw-figures/fantasy-bandit-captain-crimelord-candidate-009.png`

Source: built-in image generation call `call_bdclhaDU5IrEAvGKlSmd10LD`.

Requested sprites:

- `spr-fantasy-bandit-captain`
- `spr-fantasy-bandit-crime-lord`

Audit verdict: candidate with width caution.

Alpha sheet: `alpha-figures/fantasy-bandit-captain-crimelord-candidate-009-alpha.png`

Notes:

- Strong leadership contrast and body-shape variety; crime lord correctly occupies the urban stout-body lane.
- Captain's command arm widens the silhouette; keep for character, but measure base fit before final slicing.
- No cropped foreign props detected.

### `raw-figures/fantasy-bandit-courier-deceiver-candidate-009.png`

Source: built-in image generation call `call_vT9qve8If56ByQg5nYEXCmT3`.

Requested sprites:

- `spr-fantasy-bandit-courier`
- `spr-fantasy-bandit-deceiver`

Audit verdict: candidate.

Alpha sheet: `alpha-figures/fantasy-bandit-courier-deceiver-candidate-009-alpha.png`

Notes:

- Courier has useful downward/route-focused attention rather than repeated wistful off-camera gaze.
- Deceiver is theatrical but still adult-fantasy; no WoW/cute drift.

### `raw-figures/fantasy-skeleton-archer-flaming-audit-010.png`

Source: built-in image generation call `call_OA5riq9kk94AuoZ07LnpVy9Q`.

Requested sprites:

- `spr-fantasy-skeleton-archer`
- `spr-fantasy-flaming-skeleton`

Audit verdict: candidate with audit cautions.

Alpha sheet: `alpha-figures/fantasy-skeleton-archer-flaming-audit-010-alpha.png`

Notes:

- Flaming skeleton is strong and characterful.
- Archer bow still creates a wider silhouette than ideal for a 1x1 base; keep as candidate but prefer compact
  alt bows for runtime replacement.
- Flame wisps increase alpha-edge complexity; review after slicing.

### `raw-figures/fantasy-warhorse-minotaur-skeleton-audit-010.png`

Source: built-in image generation call `call_tJwV38F0xpXp6g4XofzAaTxY`.

Requested sprites:

- `spr-fantasy-warhorse-skeleton`
- `spr-fantasy-minotaur-skeleton`

Audit verdict: partial candidate.

Alpha sheet: `alpha-figures/fantasy-warhorse-minotaur-skeleton-audit-010-alpha.png`

Notes:

- Minotaur skeleton is excellent: frontal, vertical, horrific, and readable.
- Warhorse skeleton is useful but more side-view than the current base-fit preference; keep as a true-shape
  creature candidate or audit reference.

### `raw-figures/fantasy-goblin-minion-warrior-hexer-candidate-011.png`

Source: built-in image generation call `call_YvlVus1UfMvjd5Mt5JWCqzUg`.

Requested sprites:

- `spr-fantasy-goblin-minion`
- `spr-fantasy-goblin-warrior`
- `spr-fantasy-goblin-hexer`

Audit verdict: candidate.

Alpha sheet: `alpha-figures/fantasy-goblin-minion-warrior-hexer-candidate-011-alpha.png`

Notes:

- Better lanky/wiry goblin proportions than earlier stocky attempts.
- Three-up spacing is workable, with clear role silhouettes and expressive monster personality.

### `raw-figures/fantasy-lanky-skeleton-alts-candidate-011.png`

Source: built-in image generation call `call_KuxtFU5Hs9m22el6Cx9Z1Y4q`.

Requested sprites:

- lanky skeleton alt A
- lanky skeleton blade alt B
- lanky skeleton archer alt C
- lanky corpse-walker alt D

Audit verdict: strong alt candidate sheet.

Alpha sheet: `alpha-figures/fantasy-lanky-skeleton-alts-candidate-011-alpha.png`

Notes:

- Direct response to the lanky-skeleton request: tall, thin, compact, and front-readable.
- This is a better runtime replacement direction for ordinary skeleton variants than the wider bow/action poses.
- Alt sheet is not admitted; final slug binding still needs slicing and metadata review.

### `raw-figures/fantasy-merchant-sage-gutter-caution-012.png`

Source: built-in image generation call `call_4f5mtd72UvMwnjzH8Md5nyfR`.

Requested sprites:

- `spr-fantasy-merchant`
- `spr-fantasy-sage`

Audit verdict: candidate with gutter caution.

Alpha sheet: `alpha-figures/fantasy-merchant-sage-gutter-caution-012-alpha.png`

Notes:

- Excellent face character, ancestry diversity, and mature civilian tone.
- Generated as a tall vertical sheet with tighter inter-sprite spacing than requested; slice with caution or
  regenerate if automated segmentation is brittle.
