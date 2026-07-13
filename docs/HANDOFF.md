---
type: session-handoff
project: Genesis
updated: 2026-07-11
---

# Genesis — Session Hand-off

## Graphics authority — read before the next visual unit

`docs/GRAPHICS-CONVERGENCE-CHARTER.md` is now the governing graphics doctrine. It locks the protected
walk/table core, defines the graphics engine as a provenance-preserving visual compiler, names the
eight capabilities required to reach the approved mockups, and supplies the C0-C8 convergence ladder.
Graphics work must preserve canonical cards and no-human production while taking the time required to
reach the visual target. Read it before this handoff's historical graphics queue, then read
`docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md` for evaluated tools and executable research gates.

## ⭐ Latest (2026-07-13, overnight) — GRAPHICS CONVERGENCE: wall-volumes wave + Phase 0/1/2 geometry [Claude Opus 4.8, orchestrated]

Codex researches, Claude orchestrates ([[project-genesis-graphics-convergence]]). The execution
spine is `docs/GRAPHICS-CONVERGENCE-PLAN.md` (composes the 3 research waves → phased waves on the
C0–C8 ladder). **Master tip after the run: `4da62a9d`.** Every
unit personally re-gated (harnesses re-run by me, captures READ, never self-report), landed `--no-ff`.

**Landed (all on master + pushed):**
- **Wall-volumes wave** — C4.1a wall volumes + Adam's Phase-0 octagon miter · C4.1b segment
  ray-occlusion · E0 physical practicals (glow-disc retired) · C4.1c floor+riser congruence.
- **Phase 0 instrumentation (dev-only)** — R0 pinned tool bootstrap (`dev/geometry-tools/`,
  `~/.genesis-geometry-tools`) · G0 52 ground-truth fixtures + injected-adapter harness
  (`dev/verify-geometry-fixtures.mjs`; row-101 sunken-collapse red-first) · R2 fast-check fuzz ·
  R3 webgl-lint/Spector diagnostics · R4 pixelmatch capture-regression · GP-1 GPU telemetry +
  material census.
- **Phase 1** — R1 four-path bakeoff → **ruling** (`dev/geometry-research/bakeoff/ruling.json`):
  floors = **polygon-clipping + Earcut**; walls = **clipper2-ts Strategy-A offset**; clipper2
  booleans + its CDT triangulator **rejected** (CDT silently returns wrong geometry, reproduced).
  Found a real production defect: per-segment outer-wall math gaps ~**0.31u at ordinary 90° corners**.
- **Phase 2 (behind `ROOM_SHELL_POLYGON_KERNEL = legacy|oss-compare|oss`, DEFAULT legacy/byte-identical)**
  — **G1 PolygonKernel** (`src/ui/geometry/polygon-kernel.js` + vendored earcut/polygon-clipping;
  fixes all 7 legacy floor defects, 0 regressions) · **G2 floor integration** (oss path unions +
  triangulates-with-holes via the kernel; row-101 recovers 3 tiers with a real hole; F08/F11 corrected).
- **G3 wall-runs LANDED (oss-compare)** — SOL's ruling (`docs/STAGE-G3-WALL-RUNS.md`): vendored
  clipper2-ts + the oss wall path offsets each aperture-delimited run (true joined miters, butt/square
  jambs, one run contour for stem/cap/footing/trim). Re-gate: corner gap **0.3111u → 0** at stem/cap/
  footing separately, **100% provenance, 0 unintended joins** (verify-wall-runs-oss 71/0); legacy
  byte-identical. **The bespoke miter is retained (default legacy) until Adam flips** — the retirement
  gate is met on the acceptance fixtures (not exhaustively fuzzed; capture framing was default room-fit,
  not the literal outside-low grazing angle — a follow-up to expose a capture camera-override seam).

**⭐ DECISION STATUS (updated 2026-07-13 after Adam's review + SOL/Codex code review):**
1. **negative-`sy`: APPROVED + LANDED** (`a2080059`) — `theater-boot.js:8896` is now
   `Number.isFinite(f.sy)`; signed finite heights survive floor-contact mapping + tier compilation.
   G0 stays red-first vs the retired predicate; R2's `geo-regression-be825c9cc76b` green. The
   independent-riser static/dynamic work still rides this seam (parked for Codex's riser research).
2. **Flip the geometry default `legacy` → `oss`: STILL HELD (Adam's call).** The two blockers found in
   code review are now FIXED + landed: (a) G3's inner cap lip triangular hole (`c6a3bbb7`,
   verify-wall-runs-oss 71→81→**92**, both lips); (b) the **acute-corner bevel contract** (`6a340793`)
   — acute corners now keep the Clipper2 bevel (gap 0 on stem/capIn/capOut/footing, 100% provenance)
   instead of discarding to the gapping legacy fallback; the fuzz acute check is red→green with a
   `miterOnly` negative control. **Remaining before the flip: a controlled outside-low visual capture
   sign-off + one stabilization hold (OSS §15).** Everything is still `oss-compare`; default untouched.

**Re-gate lesson banked (2026-07-13):** a geometry gate accepted two false-greens I should have
caught — a harness that measured only the OUTER cap lip (inner-lip hole survived) and "before/after"
captures that were different scene content, not one serialized board/outside-low. Now standard in
re-gating: verify a symmetric structure's BOTH sides, and confirm captures share scene+camera+light+crop
before trusting a visual delta.

**GPT 5.6 SOL** ruled the wall-miter question (adopted): the ~0.31u gap is a *real visible* defect
(caps don't hide it — cap/footing inherit the per-segment construction); design = aperture-delimited
runs (see G3 above). Also flagged the wrong "never a gap" comment at `theater-room-mesh.js:904` (G3 fixes it).

**Do next (pick up here):**
1. **Read `docs/GRAPHICS-CONVERGENCE-CHARTER.md` (governing) + `docs/GRAPHICS-CONVERGENCE-PLAN.md`
   (spine) + `docs/STAGE-G3-WALL-RUNS.md` (G3 design).** Make the two morning decisions above.
2. G1/G2/G3 are all LANDED (oss-compare, default legacy). Before flipping the default `legacy → oss`:
   optionally broaden G3's fuzz beyond the acceptance fixtures + shoot a proper outside-low grazing
   capture to eyeball the corner-gap closure; then flip + hold one stabilization wave (OSS §15).
3. Phase 3 (visual production, GP-2..4: path-traced oracle → materials/UV → distribution/atlas →
   oracle-driven raster upgrades) rides on the stable geometry. R5 prop-foundry + Codex's
   offline-art-foundry/EXTRUDED-SPRITE-PROP-LIBRARY feed it.
4. Everything below this block is the pre-convergence history.

## ⭐ Latest (2026-07-12, later) — STAGE C: REAL ROOM SHAPES — rooms stop being rectangles [Claude Opus 4.8, orchestrated]

GRAPHICS-NORTH-STAR Stage C (`docs/STAGE-C.md`) — consume the walk's rolled `areaType/dims/side` (which
`spatializePlan` was discarding) into real room geometry feeding the landed C4 room-shell compiler.
Four stacked units, each personally re-gated (harnesses + captures READ + loop gate on real dungeons),
landed `--no-ff`. **Master tip: `388a4c7b`.**

**What shipped (all on master + pushed):**
- **C1 size fidelity** — rooms honor the rolled `dims` (feet/5), not random 4–7. Behind `SPATIAL_SHAPES`.
- **C2 structural terrain** — `side` prose → dais/pit tiers → the compiler's riser render.
- **C3 real shapes** — `areaType` → octagon/rotunda/oval/L/T/cross/cave FLOOR cells + exits-from-polygon.
- **C3b clean geometry + root fix** (Adam's "half shapes" catch) — render-only: circle/ellipse pulled
  round (deviation ~15× better), octagon/L/cross chamfered to true 45° diagonal faces; PLUS the
  pre-existing `cellTriangleMap` dropped-cell bug fixed at root (nearest-triangle fallback, bare
  octagon 76/76 vs 74/76). Logical cell grid byte-identical across all shapes — **combat untouched**.
- **Codex sprite-strategy landed** (`74848a3a`, Adam-directed, verified green first) + **`AGENTS.md`**
  (Codex onboarding front door).

**Verification:** verify-stage-c-{size 25,terrain 49,shapes 88,c3b 43}/0, room-shell 32/0,
dungeon-interior 287/0, combat-cells 13/0, walkbind 20/0, spatialize 9/0, check-manifest OK; loop gate
5/5 per unit; captures READ (clean octagon diagonals, round rotunda, L notch).

**Do next (pick up here):**
1. **Read `docs/STAGE-C-ART-DIRECTION-REVIEW.md` before the next graphics wave.** Wave C's geometry is
   retained, but its bare-shell capture was not a frame-12/19 art gate. The review repairs canonical
   row-101 multi-patch terrain and makes Stage B sprite citizenship + semantic construction resolution
   prerequisites for integrated beauty. Immediate additions: C4.1 thick capped wall volumes with
   segment-level cutaways, then E0 physical light fixtures with the floating glow-disc path disabled.
2. **Sprite lane (Codex):** BUG-14 (slice debris — `slice-sprites.py` padding/merge) + BUG-15 (crusty
   in-engine resolution — needs higher-res ImageGen regen); the figurine-life-pass + map vision-quest
   (`docs/vision-quests/`) are Codex's queued directives.
3. Deferred Stage-C follow-ons: AO-gradient on non-rect floors (Stage E material concern), vertical
   stair two-slot connections, corridor-L-bend-through-notch edge case (`docs/STAGE-C.md` C3 notes).
4. Carry-overs still stand: MF-3b hit-stop wiring + MF-5 feel gate (walk-native/Stage-A blocks below).

## Latest (2026-07-12) — WALK-NATIVE BOUNDARY + STAGE A CLOSED: the composed camera is live [Claude Opus 4.8, orchestrated]

Codex reviewed the last A-wave and delivered the **walk-native amendment**
(`ui-sketches/mock-frames/vq-battle-scenes/WALK-NATIVE-DIORAMA-CONTRACT.md`): the walk is the content
spine; every graphics layer after the stored walk is a *projection* that may frame/light/occlude but
may never roll, reject, or rewrite a rolled field. Adam ruled **build that boundary first, then wire
A3.** Executed as `docs/WALK-NATIVE-A.md` — 4 background Sonnet executors, worktree-isolated, each
personally re-gated (captures READ, never self-report), landed `--no-ff`. Master tip: `00b775f8`.

**What shipped (all on master + pushed):**
- **WDV-1 `walkSceneFrom`** (`src/engine/walk-scene.js`) — the anti-drift boundary. Classifies every
  walk fact into visual roles with field provenance; wraps the card-dealer (never re-rolls);
  `trayFrom` stamps `board.walkScene`. Pure/no-RNG. 32/0 (3 checks red-first).
- **WDV-2 stamped provenance** — `walkPickStamped` + `segment.rollRefs` on graphics-critical tables;
  byte-additive (existing field shapes identical). 34/0.
- **A3 shot-compose** — **the composed camera is now live in production.** `setInteriorBoard` builds
  `shotPlanFrom`+`composeShot` and drives the composed camera behind `ITR_SHOT_COMPOSE` (focusRect
  fallback); scratch-`THREE.Camera` 2-arg projector; consumes `tray.walkScene`. Crops to the action
  cluster — medium standee 0.208 frame height (gate 0.18–0.25). Round-1 zoomed too wide → caught at
  the capture gate, corrected. 29/0.
- **A4 dynamic occlusion v2** — blockers from the live `ShotPlan.occlusionTargets`; per-instance
  ghost fade, named consts, tween + hysteresis. Fixed a tapered-column aliasing bug it found live.

**Verification:** check-manifest OK; walk-scene 32/0, stamped 34/0, shot-compose 29/0,
theater-shot 107/0, dungeon-interior 287/0, mf1 24/0, frustum 14/0, walk-card-projection 29/0,
bw2-1b(jsdom) 24/0; **integrated loop gate 5/5 clean, 0 breaks, fps 197–277**. Captures READ: A3
after-composed reads as a staged diorama; A4 on/off shows the pillar fade to reveal the standee.
Two pre-existing render-only reds (bloom/ghost pixel check; bw2-1b doorframe) verified pre-existing
on master, auto-skip in CI, follow-up filed.

**Do next (pick up here):**
1. **Adam: eyeball the Stage-A frames** — `dev/battle-gate/shot-compose/after-composed.png` (the
   composed diorama) + the A4 occlusion on/off + the loop contact sheet. Dial the named consts if
   wanted: `ITR_OCCLUSION_UPPER_OPACITY`/`STEM_HEIGHT_U`, the compose framing target.
2. **Codex's remaining walk-native units** (his recommendation, deferred): WDV-3 table visual
   metadata, WDV-4 overlay/state key unification, WDV-5 cross-env diorama gate.
3. **Stage B (sprite citizenship)** is the next GRAPHICS-NORTH-STAR wave — the standee contract
   (footX/Y, worldHeight, plinth/contact-shadow/shader), then Stage C (room-shell polygon rooms,
   the compiler is already landed) / D (stateful nouns) / E (material+light finish).
4. Carry-overs still stand: MF-3b hit-stop production wiring (Adam's event-shape call) + MF-5 feel
   gate. (The two pre-existing occlusion render-reds A4 surfaced are now FIXED + landed —
   `07d2f733`, ghost-bloom + doorframe classify; Stage-A diff reviewed clean.)

## Latest (2026-07-11) — BW4 MOTION & FEEL: 4 units landed; hit-stop wiring + play gate open [Claude Opus 4.8, orchestrated]

BEAUTY-WAVE-4 (docs/BEAUTY-WAVE-4.md) executed as 4 background Sonnet executors in isolated
worktrees, each personally re-gated on its branch tip and landed `--no-ff` to master (pushed).
MF-1 CAMERA TWEENS first (gating), then MF-2 SPAWN GRACE / MF-3 IMPACT FEEL / MF-4 TURN RHYTHM
in parallel off its tip. The dungeon's stills became footage: camera refits glide instead of
snap, minis fade+settle in and out instead of popping, the acting-ring slides between turns, the
round header dips, floaters land. Master tip after the wave: `fa27aff7` (+ this docs close).
Details + per-unit SHAs + all re-run gates in CHANGELOG 2026-07-11 (BW4).

**Two things are OPEN (both need Adam):**
1. **MF-3b — hit-stop production wiring (design call).** MF-3's hit-stop/recoil/crit-response are
   built + fully tested but DORMANT in real play. Production plays `hit-damage` (via the
   `{hurt:"hit-damage"}` remap in `theater-boot.js` `play()`), so base shake+flash fire — but the
   hit-stop freeze + directional recoil are gated on `opts.attackerId`, and crit-response needs a
   `hit-crit` verb, neither of which `theaterFxFromLedger`'s hp case emits. FIX = thread the
   attacker id (+ a crit flag) onto the hp ledger event so `play("hurt",{who})` carries
   `{attackerId, crit}`. That's an EVENT-CONTRACT addition at the `DM_EVENT_FIELDS` boundary —
   smaller than a strike/hurt remap, no double-fire risk — but it's your event-shape call, not an
   autonomous improvisation. fall-death's 80ms hold IS already live.
2. **MF-5 — the feel gate.** The interactive "does it feel like moving miniatures?" play session
   (you at the keyboard, 3 combat rounds) + the instrumented 10s turn-burst. Best done AFTER MF-3b
   so the burst can show the hit-stop centerpiece — shooting it now (a) misrepresents the wave and
   (b) fights a documented capture-tooling limit (screenshots don't reliably reflect mid-tween
   frames — loop-gate header line 211/678). Interim evidence already committed on the integrated
   tree: the loop-gate contact sheet + `dev/battle-gate/dungeon-loop/loop-01-camera-mid-tween.png`,
   plus the fake-clock harnesses that numerically prove every tween curve.

**Do next (pick up here):**
1. **Decide MF-3b** (event-shape: attacker id onto the hp ledger event), then wire it — that
   unblocks the felt hit-stop and makes the MF-5 burst worth shooting.
2. **MF-5 feel gate** — shoot the turn-burst + play 3 rounds; answer the one question.
3. Everything below (BW2/BW3 close carry-over) still stands.

## Latest (2026-07-11) — THE VISUAL CAMPAIGN: BW2+BW3 landed, engine converged on the mocks [Claude Fable]

Three waves in one sitting, all on master + pushed (tip 127d41d6 + the close). The dungeon
now renders as a photographed miniature diorama: crisp full-res (PS1 retired game-wide),
beat-composed camera, true-scale minis on dark kiltered plinths with soft shadow pools,
LIT SPRITES under THE BRIGHTNESS LAW (full-bright only in full white light), generated
masonry/wet-tile textures (grout = combat grid), torch cones with drifting motes, seam
foliage hiding the prism edges, furniture as cover (columns demoted), extrusion wall props,
tilt-shift DoF + emissive bloom + per-realm filmic grade. The closing frame:
dev/battle-gate/dungeon-loop/loop-02-room.png — hold it against
ui-sketches/mock-frames/mock-01-gloom-combat.png.

**Do next (pick up here):**
1. **BW4 MOTION & FEEL (docs/BEAUTY-WAVE-4.md, SPECCED + queued)** — camera tweens, spawn
   grace, hit-stop, turn rhythm; MF-5 gate = Adam PLAYS 3 rounds ("does it feel like moving
   miniatures?").
2. **Adam:** eyeball the closing frames + the deferred taste calls (camera-key shadow
   intensity; r2's 42 ΔE-flagged sprites) · run PACKET-03 (flat props, style-rider v2) ·
   GIT-LFS migration (URGENT — 79MB zips; runbook ready).
3. **Audio design night** (the biggest unmade polish lever — spec with Adam: sourcing/spend).
4. Singles queue: texture pop-in ready-gate · prose-twin audit (TEXT-FIRST law vs the new
   visual nouns) · trim GL-wiring · tier-2 silhouette extruder (BW2-5b, needed for PACKET-03
   fold) · gallery-pass harness side-effect fix · wall-hang axis 7b if it reproduces.
5. Then: ROOM-GRAMMAR build · UW1-4 · chrome/gloom creature sprites ride the codex rounds.

## Latest (2026-07-10 later night) — THE BEAUTY WAVE EXECUTED: 11 units + VP8 on master, pushed [Claude Fable, delegated verdict seat]

Adam handed Fable the taste verdicts and said "orchestrate this wave now." Everything landed on
master (`0c00ca1c`, pushed): perspective ~20° + clean world (VP0, confirmed on pixels), TRUE
SCALE everywhere (VP1/VP1b/VP1c — the real kaiju was a LEAK: `setInteriorBoard` never cleared
the tabletop unitGroup), real dressing art + 4 reclaimed gallery paintings (VP2/VP2b), ground
design + scene art direction (VP3/VP4, taste-gated card), battle UI off the stage (VP5), the
life pass w/ persistent battle decals (VP6, cap 12/room, child carve-out mechanical), contact
blobs (VP7), corpus unified r2 (hue-safe 48-color realm palettes; r1 REVERTED at the eyes gate
for hue murder — snake/ghost are now permanent regression fixtures), VP8 beauty shot + gap
caption. §G ruled: corpses forever · weather→UW1 on VP6's motes · blood grim incl. visuals.
NEW LOOP: MOCK-GEN (dev/model-qa/mock-gen/PACKET-01.md) — ChatGPT as our reference model, 8
target-frame prompts paste-ready for Adam's codex window; mocks propose, laws dispose.
Grid-snap (spritefusion) PROVEN unfit for our art — proof cards in the changelog entry.

**Verification:** check-manifest OK · interior 282/0 · dressing 379/0 · scene-direction 17/0 ·
vp6 49/0 · gallery 22/0 · vp1c 6/0 red-first · full sweep clean except pre-existing
table-usage-data · loop gate 5/5 re-shot + READ at every landing.

**Do next (pick up here):**
1. **Adam runs MOCK-GEN PACKET-01** (8 frames) → Fable reads → next-wave specs cite the mocks;
   VP8's triptych completes. **Adam eyeballs the beauty shots** (dev/battle-gate/beauty-shot/).
2. **The VP8 gap queue** (CAPTION.md): combat BEAT FRAMING (wire law 2c into the combat camera —
   the biggest visible win left), light-marker emissive art, gloom/chrome density tune.
3. **GIT-LFS migration is now URGENT** — GitHub warns on the two 79MB zips (runbook ready;
   needs Adam: $5 pack + force-push confirm).
4. **Blender lane un-parking** — Adam is learning to teach Claude modeling; sprite props showed
   which objects need true volume; 2D corpus = the ref library ([[project-genesis-mock-gen-loop]]).
5. UNIFICATION-WAVE (UW1-UW4) is next after the mocks inform it; chrome creature sprites +
   ash re-queue ride the codex rounds; r2's 42 ΔE-flagged sprites await Adam's eyes (report at
   dev/model-qa/unification-report.json).

## Latest (2026-07-10 evening) — WILDERMYTH GRAMMAR built end-to-end; loop gate 5/5 [Claude Fable]

Branch `claude/genesis-sprite-corpus-tags-edeaac` (pushed; master merge = Adam's call).
Adam ruled Wildermyth the graphics north star (docs/GRAPHICS-ENGINE.md; DF × Daggerfall ×
Wildermyth). The WHOLE presentation stack landed tonight: standee verbs (hit/death/guise
tweens wired to combat), dressing roll + card channel (placeholder textures, art-ready
against dev/model-qa/dressing-gen manifests), REALM_MATERIALS subtle textures (12 realms),
hemisphere+grade light rig, whisper fog, diorama skirt, cutaway walls, sprite purity,
standee tilt. FINALE GATE: 5/5 real rolled dungeons render with combat + verbs, zero
fixtures (contact sheet at dev/battle-gate/dungeon-loop/) — 2 wiring bugs caught+fixed.
Codex packets READY: regen-v3 round3 (incl. magenta-fails ×12) + DRESSING-GEN (50 sheets).

**Do next (pick up here):**
1. **THE BEAUTY WAVE is armed (docs/BEAUTY-WAVE.md, VP0-VP8) → then UNIFICATION-WAVE
   (docs/UNIFICATION-WAVE.md, UW1-UW4).** Art direction is CLOSED (13 rulings in DESIGN.md);
   everything ahead is execution. Start VP0 (Adam's two pixel-verdicts: perspective-vs-ortho,
   PSX-dither-on-vs-off) + VP1 (the kaiju piece-scale fix + registry sizing fold — mediums
   render giant today, contact sheet). Then VP1.5 corpus unification (palettes/texel/defringe,
   one batch), VP2/VP2b (dressing fold + gallery pass — art is HERE, item 2).
2. **DRESSING ART STARTED LANDING (2026-07-10 ~20:00)** — 25 dressing-gen sheets committed
   UNGATED on the branch (`ui-sketches/sprite-sheets/*-dg-*.png`): all 3 FLAGSHIP realms
   (fantasy/gloom/chrome) have flora+clutter+objects, plus effects core + all 12 accent
   sheets + ash. **Next session = VP2 + VP2b**: gate → CLEAN-SHAPES/defringe slice per the
   dressing-gen manifests → write assets/dressing/<slug>.png → extend REALM_DRESSING →
   re-shoot the loop gate (placeholders fall away). Then the Gallery Pass on any clipped
   arrivals. Codex still running regen-v3/round3 (magenta-fails etc.) in parallel.
3. Adam taste calls: AO default (recommend OFF), GRAPHICS-ENGINE §G (corpses persist?,
   weather, blood visuals), DUNGEON-GRAPH open items.
4. GIT-LFS migration at the quiet post-merge hour (runbook ready).
5. GUISE G1-G4 + NPC expression pass; puppet-tier posing law rides round-4 prompts.

## Latest (2026-07-10 afternoon) — corpus retro-tag + DUNGEON-GRAPH U1/U2/U4 + hardened codex packets [Claude Fable]

Branch `claude/genesis-sprite-corpus-tags-edeaac` (pushed; **merge to master = Adam's call**).
All 896 committed sprites carry casting-grade tags (`dev/model-qa/corpus-tags.json`) + true-scale
sizing (`corpus-sizing.json`, feet/5.5 — the overlay's old scale is a compressed render scale,
not comparable for large+). Ash painterly drift CONFIRMED in the 9 committed npc/kids/animal
sheets (mm sheets clean) → quarantined + re-queued; 13 label/art mismatches relabeled-to-art
(fantasy-npcs-2 was systemically misassigned), orphan roles re-queued. **DUNGEON-GRAPH is FULLY BUILT
(U1/U2/U3/U4)**: walk topologies → verified cell-grid floor plans with room roles,
depth=difficulty, SCALE DOMAINS (docs/DUNGEON-GRAPH.md; place-spatialize 9/9, place-semantics
26/26, walk-bind 20/20, fuzz/monkey clean). Laws ruled: TRUE-SCALE render, EXPRESSIVE CREATURE
(FFVI), ADDITIVE FOLD, NO-BLANK-SLOTS, BUG COROLLARY; docs/GUISE.md = universal sprite-swap
spec. Codex packets (rounds 2+3) hardened for the ~5PM window — `regen-v3/round3/RUN-NOTES.md`
is the paste order (recovery step 0 first). sprite-review gained the FLOOR-line setter
(click sprite → overlay `floor` → registry). docs/GIT-LFS-MIGRATION.md = ready runbook.

**Verification:** check-manifest OK; dungeon harnesses 9/26/27/20 + walk-consumption 37 +
combat-cells 13 + dm-events 70 all green; gauntlet fuzz 0 findings, monkey 0 aborted.
Known pre-existing red: `verify-table-usage-data.mjs` fails on master too (1 check) — not ours.

**Do next (pick up here):**
1. **Study-card RE-SHOT then Adam's taste gate** — U3 LANDED (volumetric prisms proven,
   4-draw-call budget, 27/27; orchestrator caught + fixed the U3↔U4 pn.spatial seam) but the
   card's fog variants render near-black and gloom is underexposed — recalibrate
   dev/battle-gate/capture-interior-study.mjs (fog density, gloom exposure, suppress the
   ambient toast) and re-shoot before Adam picks the finish. THEN the finale: battle scene
   in a real generated dungeon room at true scale + loop test.
2. Adam's ~5PM codex window → `regen-v3/round3/RUN-NOTES.md` (recovery first, then round-2
   remainder, then round-3); gate → slice → tag arrivals per the ADDITIVE FOLD LAW.
3. Registry sizing fold: corpus-sizing.json + v3-sizing.json + `floor` rulings →
   regenerate data/sprite-registry.js (never hand-edit); then Adam re-judges the "crusty
   mediums" in-engine (his ruling: no fails on resolution alone until seen in engine).
4. GIT-LFS migration at the first quiet post-merge moment (docs/GIT-LFS-MIGRATION.md;
   needs Adam: $5 LFS pack + force-push confirm).
5. GUISE G1-G4 + NPC expression pass ride together after sprite assignments settle.
6. Land the sprite lane (claude/sprite-gen-refactor-magenta, now fully committed) at the
   gen-wave sweep, per standing plan.

## Latest (2026-07-10) — SPRITE-GEN-V2: cleanup, perspective law, V3 wave gated (650 sprites), casting tags [Claude Fable]

The great sprite cleanup after the 2026-07-09 overnight codex blast. **State:** worktrees pruned 21→1
(only the sprite-gen lane remains, its 59 round-2 sheets still parked there); all 2,431 uncommitted
sprites surveyed per-cell by vision agents; Adam ruled the laws (now `docs/SPRITE-GEN-V2.md`): eye-level
perspective (front/side/¾ ok, high-angle/top-down quarantined), grid ladder by size (humanoids always
4x6), per-realm finish, chroma-key magenta/green, Armed Toons Law. Realm expansions authored + generated:
cosmic tarot arcana, frontier tribal (dignity register), suburb Amblin/Earthbound, gloom VHS horror,
bright-kingdom Zelda+Mario armed toons. Adam's codex sessions ran the V3 packets (143/161 sheets before
his usage limit); our gate passed 142/143 on style; **650 sprites sliced to transparent PNGs at
`dev/sprite-sheets/incoming/v3/` with sizing (`v3-sizing.json`) and full casting tags (`v3-tags.json`,
schema = `docs/SPRITE-TAGS.md`: binding/expression-variant/casting laws, castability tiers)**. 78
off-angle sprites shipped as a CC0 giveaway pack (Desktop zip). Verification: check-manifest OK (no
modules touched); gates were 11 vision agents + mechanical slicing, zero empty cells.

**Do next (pick up here):**
1. Adam's 3PM codex window → run `dev/model-qa/regen-v3/round2/` (cosmic-r2 15 sheets, gloom-r2 3,
   fixes-r2 9); then gate/slice/tag the returns same as this session.
2. Fold `v3-sizing.json` + `v3-tags.json` into `data/sprite-registry.js` (regenerate, never hand-edit) —
   includes heads-line-up calibration vs Adam's 32 protected scale rulings.
3. Retro-tag the committed corpus to the SPRITE-TAGS schema + check ash's committed sheets for the
   painterly drift Adam remembers (the lane's ash sheets passed clean).
4. NPC expression pass (expression-variant law wiring) once Adam settles sprite assignments.
5. Land the sprite lane (claude/sprite-gen-refactor-magenta) LAST per the gen-wave sweep plan.

## 2026-07-09 (late night) — PLACE-GEN built end-to-end: places are realm-true and render as dioramas [Claude Fable]

The whole PLACE-GEN wave landed on `claude/place-generation-a57dd2` (11 units, each a --no-ff merge,
each orchestrator-re-gated): Place Spine (24 archetypes) + Frontier/Chrome/Gloom skins (PROVISIONAL),
the generator + `placeForRealm`, the `rollPlace` realm swap with GRID-LAW cell dims, cast wiring,
breach leak (shared constant), kit/district relabels, **the tray node source (a minted place renders
as its diorama — screenshot-gated, the gloom diner reads)**, dressing map + prop census, TIYL origin
routing, the DM digest location line (one-derivation law), and combat zone grids derived from known
cells. GRID LAW registered in DESIGN.md; ARCHITECTURE.md updated (new Place Generation entry + tray
source kinds). Also: 4 vision-read book gathers (DMG14/24), 5 settlement tables upgraded to
Master-Setting grade, and `docs/PLACE-ASSET-QUEUE.md` (44 entries, 22 P1 — main finding: zero
architecture-shell props exist) with the sprite half in `dev/model-qa/sprite-sheets/setting-dressing.md`.

**Verification:** full verify sweep ZERO failures at close; combat byte-gate intact; fuzz 0 findings.

**Do next (pick up here):**
1. Adam red-pen: PLACE-ASSET-QUEUE + P1 wave go/no-go (the spend gate) · Place Spine rows + 3 skin
   labels · the 5 settlement tables.
2. Merge `claude/place-generation-a57dd2` → master (clean close paused at the confirm gate),
   regenerate tables.js/dm-contract at the merge per worktree law.
3. 8 backfill realm skins (craft lane) · interior-gen spec section (off the Appendix A gather) ·
   HOOK-WALKS terminus table when that spec locks.
4. Full Van Richten's still wanted (current file = subclasses excerpt) → Gloom domain-gen gather.


*Read this first in a new session. It orients you; the linked docs are the source of truth.*

## Latest (2026-07-09 sprite night — FANTASY REALM SLICED + REVIEW TOOL + AUTO-SCALE + XL REGEN LANE) [Claude Fable 5]

**T5 ran on FANTASY, not gloom** — Adam's first PNGs were the default realm (183 source sheets at
`ui-sketches/sprite-sheets/`). **896 production sprites cut** (510 fantasy monsters / 75 NPCs / 75
animals / 20 kids / 216 PCs), defringed (magenta-halo kill in the slicer), **corpus + sprites now
COMMITTED** (backup ruling — the standing "no git backup" risk is closed).

**What shipped (branch `claude/fantasy-sprite-slicing-fc3187`):**
- **Sprite review tool** — `python3 dev/sprite-review.py` → http://127.0.0.1:5179/ (CLAUDE.md
  commands table). Tags · 7-band imperial head-guide ladder (tiny 1′6″ → titanic 36′) + 6′ human
  silhouette · scale slider 0.1–8 · explicit Save Changes · pass/fail · `flagged ⚠` filter · writes
  the overlay directly · "regen registry" button. Adam's first sitting: **366 pass / 44 fail**.
- **Auto-scale pass** — 852 computed heads-line-up scales (SRD/zoology heights ÷ size plane), 410
  flagged for Adam; his rulings always win. Scale + fail-verdict are WIRED into the theater
  billboard path (height × scale; fails fall through to 3D) — verify-theater-sprites 12/0.
- **XL/titan/redo regen lane** — Adam's ruling: 9′+ creatures under-res at 25/sheet. 64 paste-ready
  generation blocks in `dev/sprite-manifests/XL-REGEN-PROMPTS.md` (24 titan solos ≥24′ · 39 XL 2×2
  sheets · 1 redo sheet of the 16 small fails), anti-magenta-artifact rider baked in;
  `xl-regen-manifest.json` keys ORIGINAL slugs so re-slices overwrite. `REJECTS.md` = the fail list.
- **Slicer honesty fix** — count-mismatch no longer writes misassigned sprites (quarantines under
  review/); proved live on the padded sheet 21.

**Verification (all at close):** check-manifest OK · theater-sprites 12/0 · sprite-registry 6/0 ·
sprite-pipeline all-pass.

**Do next (pick up here):**
1. **Adam generates the 64 XL/titan/redo sheets** (XL-REGEN-PROMPTS.md, paste-ready); slice each with
   `python3 build/slice-sprites.py <png> --manifest-v2 <sheetId> --manifest-path
   dev/sprite-manifests/xl-regen-manifest.json --review` → re-review (re-cut fails stay blocked
   until re-ruled) → regen registry.
2. Finish the fantasy review pass (486 unreviewed; the `flagged ⚠` filter is the priority queue —
   410 auto-scale flags).
3. Other realms' PNGs → same slice → auto-scale → review loop (the pattern is proven end-to-end).
4. `item` kind in the v2 parser/registry (13 fantasy item sheets + 571 item cells waiting).
5. Theater eyes-on A/B (billboards vs 3D on the stage) — the last unchecked T5 box; billboard
   square-plane aspect stretch noted in CHANGELOG Deferred.

---

## Latest (2026-07-09 late — REALM-KEY EXPANSION + SPRITE TRANSITION T1–T4) [Claude Fable 5]

**What shipped (branch `claude/npc-monster-realm-expansion-edb64a`, one --no-ff merge):**
the approved realm-key expansion roster (docs/REALM-KEY-EXPANSION-ROSTER.md) statted to MM standard —
**+168 creatures → 1,475 total, `gen-realm-bestiary --check` clean**, `data/realm-bestiary.js`
regenerated at close, all PROVISIONAL pending Adam's red-pen. Plus the **SPRITE-TRANSITION** decision
(LOCKED: creatures → ImageGen sprites; 3D keeps trays/architecture; docs/SPRITE-TRANSITION.md) built
through T4: sheet-manifest generator (181 sheets / 4,316 cells), slicer v2 (non-uniform-tolerant,
fail-loud), `data/sprite-registry.js` (4,316 entries, 100% monster join), theater billboard channel
(sprite-first `figureFor`, kill switch). Item sheets added from all 11 loot tables (571 objects).
docs/ASSET-SYNC.md records the request-on-demand asset posture.

**Verification (all run at close):** check-manifest OK · realm-wiring 78/0 · dm-events 70/0 ·
social 97/0 · theater-sprites 10/0 · sprite-registry 6/0 · sprite-pipeline all-pass.

**Do next (pick up here):**
1. **T5 gloom vertical slice** the moment Adam drops sheet PNGs in `dev/sprite-sheets/incoming/` —
   slice → registry regen → eyes-on A/B vs 3D in the theater → tagging pilot (vision scan →
   `dev/model-qa/sprite-tags-overlay.json` → Adam redline). Taste gate before mass slicing.
2. Adam's per-realm red-pen of the 168 new creatures (and the 4 slug-collision resolutions recorded
   in `dev/sprite-manifests/v2-manifest.json` `_collisions`).
3. Add the `item` kind to the v2 parser + registry so the 571 item sheets manifest/slice.
4. Spec the two faction clocks: Pink Cult pressure (suburb) + gloom demand ladder.
5. Hoverboard buff proposal (Adam's table, propose-first).

---

## Latest (2026-07-09 night — ANIMAL-SOCIAL U1–U6 landed; handing to Codex for the weekend) [Sonnet build → Opus re-gate/close]
## Latest (2026-07-09 late night — ANIMAL-SOCIAL-HQ review fix queue landed) [Fable orchestrate → Sonnet execute → Opus-level re-gate]

A `/code-review` of the U1–U6 wave found the wave's core defect class: **verify-green ≠ wired** —
realm skins, the ranger/druid bump, animal parley routing, and the predator witness scope all had
working plumbing that no production call site ever reached (harnesses passed by hand-feeding what
production never supplies). `docs/ANIMAL-SOCIAL-HQ.md` (locked spec, 7 units, THE WIRING LAW:
every new verify check drives a production entry point) → 6 Workflow-throttled Sonnet executors +
1 singleton, all worktree-isolated → orchestrator re-gated on the integrated tree → master
`c8f49ae` (HQ-1..6) + `90d49e5` (HQ-7 cleanup), pushed. Full detail in the CHANGELOG entry.

Integration also caught 4 nondeterministic/broken verify fixtures the executors couldn't see in
isolation (fixed as fixtures, never by weakening behavior; u3 soaked 30/30). New standing harness:
`dev/verify-animal-table-fingerprint.mjs` — it is SUPPOSED to go red under Adam's CRAFT-LANE row
pass; that red is a named re-sync task for `ANIMAL_ENV_WEIGHTS`/`ANIMAL_KNOWLEDGE_SCOPE`, not a
bug to green mechanically.

**Gates at close:** check-manifest OK (animal-knowledge-scope layer WARN resolved); u1–u6 +
fingerprint + dm-events 70/0 + gen 68/0 across repeated sweeps; fuzz-events 0; monkey 12/12,
0 aborted; dm-contract regenerated byte-identical; all diffs eyes-on.

**Adam's ledger — BOTH RULED same session (2026-07-09 late night):**
1. **Urban→rural tier-0 banding → populations are the answer.** Adam: settlement POPULATION
   estimates are the intended urban-development signal ("helps me a lot on tabletop when I am
   creating a map for a town"); the lodging-tier fallback stands until they exist. Registered
   into PLACE-GEN's scope (NEXT-STEPS 3b) — populations would drive `nodeEnvBand`, place-tier
   stock, and town-map presentation together.
2. **npc-life stamp → BUILT as HQ-8, landed same night** (spec section appended to
   `ANIMAL-SOCIAL-HQ.md`): six place-bound npc-life writers stamp `nodeId` (companion
   desertion/pet-wanders/sidekick-departure/sidekick-death, turn life-event, successor-thread);
   backstory/faction-turn/tell-refresh stay location-less by design. The bird's faces-sense
   ("a two-legged one came and went") is now live in production — red-first proven, u6 grew to
   49/49, all gates re-run green. Herd's `move-zone` movement-sense stays deferred (needs a real
   map-scale movement source, e.g. travel transitions — design question, not a stamp).

**Do next (pick up here):**
1. Adam's row-level taste pass on the CRAFT-LANE `wild-animal-kind` rows + realm-beast skins —
   now safe: the fingerprint harness converts row drift into a named re-sync task.
2. A live playtest to feel the wilderness social web (unchanged from the U1–U6 handoff — and now
   the realm skins, class bump, WIS-routing, and predator witness actually fire in it).
3. The rest of the 2026-07-09 build wave (NEXT-STEPS item 3), spec-lock first, as before.

## Previous (2026-07-09 night — ANIMAL-SOCIAL U1–U6 landed; handing to Codex for the weekend) [Sonnet build → Opus re-gate/close]

The full `docs/ANIMAL-SOCIAL.md` build (U1–U6) is **built, gated, and merged to master** — animals
are now a first-class social layer (a wilderness region = a settlement whose NPCs are Beasts; Speak
with Animals = a query API against world state). Per-unit detail is in the CHANGELOG entry. The
Opus re-gate caught + fixed a real contract-registry bug the build had self-reported green
(`animal_interview`/`animal_care` were added as `applyEvent` cases + `DM_EVENT_FIELDS` entries but
never registered in `DM_EVENT_TYPES`; `dm-contract.json` + `data/table-usage.js` were stale) — the
"never trust self-reported green" step earning its keep.

**Gates at close:** check-manifest OK; all six unit harnesses green; verify-dm-contract 115/115,
verify-dm-seam 47/0, verify-gen 68/0, verify-table-usage-data 7/0. Full 135-harness sweep clean
**except two failures that predate this branch and fail identically on master** —
verify-creature-determinism (7/1, a Math.random hit under `dev/model-qa/creatures/`) and
verify-digest-diet (58/1, the 50-record fixture at 12919 B, 919 B over its 12 KB budget). Neither
is animal-social's doing.

**Do next (Codex weekend / next session):**
1. **Adam's row-level taste pass** on the CRAFT-LANE `wild-animal-kind` d12 rows +
   `data/animal-realm-skins.js` realm-beast labels (direction is ruled; the rows are drafts).
2. **A live playtest** to feel the wilderness social web — does the DM run animal interviews from
   the witness packet, does pack-attitude propagate, does a befriended raven recur across sessions.
3. **The rest of the 2026-07-09 build wave** (`NEXT-STEPS.md` item 3): TIYL-WEIGHTED-STARTS →
   HOOK-WALKS → GLOOM-KEY → PLACE-GEN → CAMEO-CAST → SHIP-TRAVEL → REALM-HOOKS. **All still
   SPEC-not-locked** — each doc says "awaiting Adam's review"; lock the spec (resolve its open
   rulings) before executing, exactly as ANIMAL-SOCIAL was locked before this build.
4. Optionally, the two pre-existing sweep failures above if a session touches that surface.

**Also on master (2026-07-09, separate exploratory thread — Sonnet):** the
`dev/model-qa/sprite-sheets/` prompt sets — experimental ChatGPT image-gen prompts (NOT canon;
sprites stay retired in favor of the 3D foundry), per-realm coverage of monsters / 75 NPCs (with
explicit population diversity + realm-appropriate non-human minorities) / domestic+wild+dungeon
animals / kids / a full PC set. `NEXT-STEPS.md` was trimmed to the live queue (history →
`NEXT-STEPS-ARCHIVE.md`) + a lookup table added to `docs/README.md`.

---

> **Two sessions closed 2026-07-08 night, in parallel** (worktree-isolated per the new CLAUDE.md
> parallel-sessions protocol): the **NPC subsystem** wiring (this entry) and the **MODEL-FOUNDRY**
> modeling deep-dive (below). Both landed on master; two distinct "Do next" threads.

## Latest (2026-07-09 — THE MODEL FOUNDRY BATCH: ~185 bespoke models landed) [Claude Fable 5]

The batch modeling session ran the locked `docs/MODEL-FOUNDRY.md` process over the whole
VISUAL-ASSET-QUEUE in one sitting: **14 merges, ~185 bespoke bodies** — all 42 high-traffic rebuild
targets re-authored, gloom/high-seas/frontier/bright-kingdom/cosmic/suburb anchor waves, a cross-realm
catch-all (mage/helmed-horror/were-trio/canine ladder), a 52-alias repoint sweep, a pose-fix wave, and
a closing second-iteration pass on all 18 flagged models (0 reverts). Every foe in the game now
resolves to a real silhouette. Review page (Artifact) has every wave sheet.

**Process locked mid-session (Adam's rulings):** author-only production config — LOW-effort Sonnet
authors + mandatory hostile self-review, no critic pass (A/B-proven 2.2× faster at equal quality);
orchestrator mechanical gate stays (bake/floor/manifest/theater-figures/sheets + eyes-on); Adam
hand-picks from sheets → targeted fix waves (the second-pass pattern, which improved 18/18).
**Doctrine:** POSE-ANATOMY in ANATOMY-CANON (spine is the pose; elbows always bend; rigor-mortis
carve-out = mummy only). **Also landed:** NPC-COHERENCE-FIXES §1+§2 (background agent, red-first).

**Verification:** every wave — check-manifest OK, verify-theater-figures 40/40, verify-model-grammar
87/87, orchestrator re-baked every unit (floor gate [-0.01,0.08]), eyes-on every contact sheet
(`dev/model-qa/sheets/`). Scars codified into prompts: root-tree writers, dark-on-dark, floor clips,
backface-culled features, phantom self-reports; landing chains now hard-abort on wrong branch.

**Do next (pick up here):** (1) re-run the model coverage audit once Adam's realm re-keys land
(most new keys should map onto the 185-body roster — repoints, not authoring); (2) Adam's
sheet-scan → beautification queue (5 IMPROVED_WITH_DOUBT residuals flagged in the second-pass
reports); (3) the 14 prop models + NPC humanoid set (VISUAL-ASSET-QUEUE §props/§NPCs);
(4) frontier GLB step-6 wiring (unchanged, below).

## Latest (2026-07-09 overnight — THE DESIGN SESSION: realms re-keyed, 6 specs, craft expansions) [Claude Fable 5]

Adam's crafting review became a full design session, run as three background waves (15 units, all
orchestrator-gated, ~30 Adam rulings folded into every spec's RESOLVED section before merge).
**On master:** specs `ANIMAL-SOCIAL` · `TIYL-WEIGHTED-STARTS` · `HOOK-WALKS` · `GLOOM-KEY` ·
`SHIP-TRAVEL` · `PLACE-GEN` · `CAMEO-CAST` (+ `SHIP-RULES-GATHER`/saltmarsh index); craft: Child Saw
d100, Bright-Kingdom Zelda doers + Nintendo register, Suburb Earthbound/BTTF doers, and the CHROME /
COSMIC / LOST-WORLD re-keys (all craft PROVISIONAL pending Adam's row pass). `REALM-HOOKS` landed too (hooks join the spine/skins architecture; lethality law codified). Recompiled 383 tables; full NPC verify sweep green post-merge. Realm identities now:
frontier · chrome (Warriors×TMNT×RoboCop) · noir · ash · suburb (Earthbound/BTTF) · cosmic
(Egyptian/Hermetic/Enochian, tarot home) · theater · high-seas (+SHIP-TRAVEL) · lost-world (saurian
dominion, seeded Zeal) · gloom (the town that made a deal / Derry) · bright-kingdom (Nintendo-80s).

**Do next:** NEXT-STEPS top block — Adam gathers 8 books (morning), row-level taste passes, then the
Sonnet build wave over the spec backlog; models-lane handoff list registered there too.

## Latest (2026-07-08 night — NPC subsystem WIRED: coherence · partials · role-realms · presence) [Claude Code / Opus 4.8]

An autonomous engine-wiring run (Adam out of the loop, `genesis-orchestrate`) that turned the
2026-07-08 NPC craft specs into shipped engine code. **On master + pushed:** the **coherence dial**
(`rollNPC` atom-suppression by region temperature — most NPCs are legible archetypes, the weirdo is
rare; want/role/name/hook never gated), **partials** (`rollPartial` for children/animals + 4 tables),
**all 11 realm role skins** over the `NPC Role Spine` + `roleForRealm` realm-aware role step, the
**data-seam recompile** (383 tables live), and the **parallel-sessions protocol** in CLAUDE.md. Every
unit personally re-gated (never on executor self-report). Specs: `NPC-COHERENCE-DIAL.md`,
`NPC-PARTIALS.md`, `NPC-ROLE-REALMS.md`. Context: `[[project-genesis-craft-pass-2]]`.

**Verification:** check-manifest OK · verify-coherence-dial 51/0 · verify-partials 34/0 ·
verify-role-realms 30/30 (all red-first proven) · full sweep 0 fails · fuzz+monkey clean · the
fixture-sync that the full re-gate caught (verify-gen/prep-bundle) landed too.

**E-PRES presence-and-hooks — MERGED to master 2026-07-08 (Adam ruled: land without a playtest;
crafting continues).** Ambient population + hook discovery + 3-tier attention + the live if-ignored
rewire. Re-gated at merge on the now-live temperature signal: presence-hooks 61/0 (harness synced —
2f origin=sleepy x0.5, §3 de-flaked to N=1000), full NPC suite green. The spec's "retune in play"
(ambient density, discovery rates) still stands — tune during the next live session.

**Do next (pick up here — NPC lane):** ~~build the two queued fixes~~ **DONE — `NPC-COHERENCE-FIXES`
§1+§2 landed on master (merge `e28e928`, `fix/npc-coherence-queue`): questgivers wrinkled+ (functional
vs significant roleHints), `regionForNode` supplies the node's `.center` so fray-by-node temperature is
live. Re-gated 2026-07-08: coherence-fixes 19/0 · regions 32/0 · prep-bundle 56/0.** E-PRES is also
MERGED (above). (1) **Continue the table craft pass** (Adam's active lane — expect further architecture
shifts out of it). (2) Retune E-PRES density/discovery curves in the next live session. (3) Optional
craft: fold in the `feat/craft-kin-tension` kin rows; the animal realm-skin question (NPC-PARTIALS).

## Latest (2026-07-08 night — MODEL-FOUNDRY locked; batch modeling session is NEXT) [Opus 4.8 / Fable 5]

The modeling deep-dive (worktree `Genesis-modeling`, `feat/blender-fidelity-pass`, merged). The wolf
was the crucible: Blender-from-ref, weld+fill gap-close, a parametric `buildQuadruped` rig, a
subdivision ladder, and a Meshy AI-gen comparison all ran head-to-head, eyes-on, through the real
engine PS1 shader. Findings ledger: `docs/MODEL-LANE-TRIAGE.md`. Structure knowledge:
`docs/ANATOMY-CANON.md` (5 body families). Pilot: 5 bespoke cosmic creatures at the new budget
(`dev/model-qa/creatures/cosmic-set.js`, `SETS.cosmic`, sheets `cosmic-set-v{1,2}.png` — Shoggoth is
the benchmark; Creeper failed twice and is the evidence behind the silhouette/value laws).

**The outcome is `docs/MODEL-FOUNDRY.md` (LOCKED, Fable):** per-model process = Sonnet AUTHOR pass →
engine-PS1 render → Sonnet CRITIC pass (silhouette + essence only) → mechanical re-gate; tri bands
**1,000–2,000 (one safe band, Adam's ruling — tris only to fulfill the capture criteria, anatomy
chief among them; pose must be the high-expression moment, a law of its own)**; wave
dispatch = 8–12 background units in parallel, one realm per wave, orchestrator owns all registry
wiring. The 500-tri economy is retired. Blender lane + parametric rigs are PARKED; AI-gen is the
flagged future organic upgrade.

**Verification:** `check-manifest.py` OK; cosmic set bakes 5/5 clean; both cosmic sheets + the wolf
rigcmp sheet rendered through `ps1-capture.mjs` (the shipping shader). No `src/`/`data/` changes.

**Do next (pick up here):** start the **batch modeling session** — `/genesis-orchestrate` with
`docs/MODEL-FOUNDRY.md` as the locked spec. Wave order: VISUAL-ASSET-QUEUE top-down within realms,
stand-in-heaviest first (gloom → high-seas → frontier → bright-kingdom → cosmic), then the
original-roster revisit under the foundry laws (keep the signatures — the wolf keeps its open maw).
Creeper rework rides cosmic wave 1. Registry wiring per wave + `verify-theater-figures.mjs` +
`check-manifest.py` per merge.

## Latest (2026-07-08 later — VISUAL LAYER debugged + MODELING PIPELINE proven) [Claude Fable 5 / Opus 4.8]

The full-day visual/modeling marathon after the overnight tabletop build. Off Codex's diagnosis
(`GPT-5.5-advice-for-Claude/VISUAL-BUILD-DIAGNOSIS-2026-07-08.md`), then it grew into standing up the
whole figure-modeling program. **13 units landed to master, all gated + pushed.**

**What shipped.** (1) **Cuboids killed** — the non-combat standing tableau paints (the `theaterStageHtml`
host bug) and cast figures carry real render keys instead of archetype cuboids. (2) **The GLB seam is
LIVE + browser-proven** — Blender `.glb` models load in-engine through the PS1 shader (`vendor/three`
GLTFLoader + `figureFor` glb branch + `{glb,discR}` registry entries). (3) **Realm floors recolored** —
88 surfaces on real per-realm `baseTint` hexes, the **checkerboard is dead**, subtle grid only. (4)
**Props made scale-true** — `prop-scale-contract.js` is authoritative, everything resized (0 plausibility
flags), 12 orphan models registered, prop tables Waves 1–3 landed. (5) **The MODELING PIPELINE v2 is
LOCKED** (`docs/MODELING-PIPELINE.md`) and **proven across 4 realms**: noir, theater (+ your Sherman),
frontier, high-seas. (6) **theater + noir figures wired in-engine** (33 creatures repointed off stand-ins).

**The doctrine (locked, earned from real failures this session):** references FIRST · 2 taste-gated rounds ·
**the silhouette-IoU metric is a GUARDRAIL not a target** (chasing it shattered a figure) · **look with your
eyes on LIT renders before "done"** · kit grammar (shared torso + swap kits, ~5× fewer builds) · scale
contract before geometry. **Text-wave modeling PROVEN** (high-seas: ~17 min for kit+4 incl. wiring+gates,
through the real shader, quality holds) — the `MODEL-BLITZ-24H.md` scale-out plan rests on it.

**Verification:** check-manifest OK · verify-theater-figures 40 · verify-model-grammar 87 ·
verify-theater-data 329 · verify-realm-wiring 78 · tabletop-u1/u4/u6 + battle-stage + dressing all green ·
realm EXACT models 734→763 · lint-units 0 missing/0 dangling/0 discR gaps.

**Do next (pick up here):** (1) **the 16-wide text-wave throughput test** — Adam wants it before committing
the overnight blitz (a single text agent ≈ Blender per-clock; the win is parallelism, so measure it at
scale). (2) Then **run `docs/MODEL-BLITZ-24H.md`** — the full realm+prop flesh-out (Wave-0 ref scouts →
gated kits → variant fan-out ∥ Blender hero lane → integration close). (3) **Step-6 wire the frontier
GLBs** (`genesis-blender-mcp/out/frontier/final/*.glb` → `{glb,discR}` + repoint frontier realm-bestiary,
same pattern as the theater/noir wiring just merged). Figure GLBs live in `genesis-blender-mcp/out/<realm>/`.

## Latest (2026-07-08 — TABLETOP pre-alpha BUILT: 5 of 7 units on master, overnight unattended) [Claude Opus 4.8, boss]

Adam un-gated the tabletop build and scheduled an overnight unattended run; Fable planned + launched
Wave 1, then Opus took the boss seat at the model handoff and gated + landed the rest. **U1–U4 + U6
are on master** — the pre-alpha tabletop is real: a permanent center stage (`trayFrom` Standing
Table, U1), the 3-column shell + ARIA (U2), blank-piece fallback + ambient presence (U3), the cast
tableau + arrangement grammar (U4), and combat reconfigure/relax + tray persistence (U6). Five
`--no-ff` merges, all pushed (`22673a3`→`7bdf51f`→`c06350a`→`4bac31f`). Every unit personally
re-gated by Opus — never on executor self-report: check-manifest OK + the unit harness + the full
~120-file `dev/verify-*.mjs` sweep at zero RED each wave, byte-gate/combat parity intact throughout.

**Verification:** U1 45/45 · U2 28/28 · U3 46/46 · U4 17/17 · U6 32/32 (mount-once spy + §9.10 dedup
+ persistence) · gauntlet-fuzz 0 findings · gauntlet-monkey 0 harness-aborted · full sweep 0 RED.

**PARKED (needs Adam):** U5 (overlay lanes) + U7 (harness pack) on a genuine **corpse-channel design
fork** — U5 and U6 independently built incompatible corpse plumbing (U5 `board.corpses`/`statId`
refs that collide for same-type foes; U6 `castFrom` corpse-units/collision-safe `fid`). U6's landed
as canonical. U5's separable ambient-overlays rescope to a morning "U5′" rebased on U6; U7 runs after.
Branch `feat/tabletop-u5-overlays` (`f229cf8`) preserved + pushed.

**Do next (pick up here):** read **`docs/OVERNIGHT-REPORT-2026-07-08.md`** — it carries the full
morning checklist. In order: (1) **ratify the corpse channel** (keep U6's units-model — recommended —
or refactor to U5's board.corpses); (2) **U5′**: rebase U5's `overlaysFrom` + `prop:overlay-*` +
`prop-overlay-decals.js` + §9.4 sibling onto master, dropping its corpse/trace plumbing; (3) **run
U7** (harness pack) on the full U1–U6 tree; (4) **browser visual QA** (serve `localhost:5175`, walk
→ combat → revisit for corpses → collapse → screen-reader pass — jsdom can't judge the real renderer);
(5) rule the ES-module migration (still deferred). Architecture flags to weigh: `engine.theater-data`
L1→L4 upward calls; the PC-ref duplication.

## Latest (2026-07-07 night — TABLETOP-VISION: the visual end-state specced + hardened in the final Fable window) [Claude Fable 5, director's seat]

Adam's last Fable hours went to locking the graphics-engine destination: **`docs/TABLETOP-VISION.md`**
— the game as a **tabletop of miniatures** (three laws: table renders only what state can name /
miniature ontology / the invisible hand IS the DM), tray grammar (tray = scene object, pure
projection, combat reconfigures it), centerpiece law off the EXISTING feature/interactable rolls,
two-lane overlays, 9-class piece taxonomy from an 8-system commercial terrain census
(`docs/reference/TERRAIN-CENSUS-2026-07-07.md`), the V1–V6 layer map + 3-column shell, and the
**pre-alpha cut = V1+V2+shell**. The spec was **adversarially hardened twice** (Fable self-attack:
7 fixes; independent Opus skeptic: 4 survivors incl. the walk-RNG-isn't-seeded correction and the
aria-hidden/live-region trap) and carries Adam's rulings (co-location = meeples visible, digest
rises to match; corpses default-persist, no resurrection; DM-improvised staging = licensed
long-run lane). Adam exempted the SPEC from the §3.4 moratorium; the **BUILD still waits on §4
soak evidence** — then units U1–U7, **now SPEC-LOCKED per-unit in `docs/TABLETOP-UNITS.md`**
(exact seams, payload shapes, gates, mutation checks; key finding: combat stage-mode already
IS the end-state layout — the build un-gates it). Coherence swept same night:
DESIGN.md decision line, DESIGN-GUIDE T6 superseded-in-sequence, NEXT-STEPS item 6. Also: the
**craft worktree** for the parallel tables lane lives at `~/Desktop/Work/projects/Genesis-craft`
(branch `feat/craft-pass-2`; Codex edits, a steward session lands) — NOTE: Adam's uncommitted
NPC-Hook/advice edits exist only in the MAIN checkout's working tree, not that worktree.
⚠ HANDOFF itself is over its ≤3-entry diet (DIRECTION §7) — next clean-close trims below this
line into CHANGELOG.

**Do next (pick up here):** unchanged from the blocks below — Adam's craft queue + the GLM
bake-off + the live soak. The tabletop queue is sequenced BEHIND soak by design.

## Latest-1 (2026-07-07 evening — THE MARATHON + HQ3: played 110 turns, fixed everything they found) [Claude Fable 5]

While Adam was out (4h), two parallel Opus lanes played **11 sets / 110 turns** through the
bridgeless harness — Sella's campaign (now Day 6: legally dead, a Circle mole, holding the
Wren/Iron-Strap lever) and Rennick's full six-theme pressure rotation (charm/economy/time/combat/
injection/fuzzing — 16 hostile vectors, ZERO landed). Seat avg **4.96/5**. Everything: logs,
findings, the editorial (`dev/playtest-0707/MARATHON-REPORT.html`).

The 20 findings became **HQ3** (4 specs + HOTFIX-QUEUE-2026-07-07-MARATHON.md), Adam approved the
ledger defaults, and all **16 units were BUILT and landed the same evening** (3 Workflow waves,
11 executors, orchestrator re-gates — one real executor deviation caught at the B1 gate). The
game now has: hit-dice short rests, honest interrupted rests + a 24h gate, rest-risk obligations
in the digest, expiring+visible concentration, durable marks, stamped/budgeted codex notes,
win-gated encounter XP, a visible purse + affordability refusals, sane bundle weights, live-d20
branch grading, and persisted crit fall-throughs. Also: the scene-risk + realm-wiring CI flakes
are dead (forced-low baselines / the fifth seeded harness) — CI is green and quiet.

## Latest (2026-07-07 — THE 24-HOUR PRODUCTION RUN: the whole spec batch BUILT, the ending shipped) [Claude Fable 5, director's seat]

## Latest (2026-07-07, evening — CRAFT SESSION 1: NPC Hook → d200, Adam's hands) [Claude Fable 5, craft seat]

Adam's first craft-pass session under docs/CRAFT-PASS-RUNBOOK.md, run in a parallel worktree on
branch **`feat/craft-npc-situation`** (pushed, NOT merged — the orchestrator lands it when the
line is clear). NPC Hook re-authored row-by-row with Adam into the full situation anatomy and
expanded to **d200**: approved core landed (Grounded 1-35, Textured 61-85 with anchor fixes,
Strange core, Volatile/Mythic anchors, shadow-broker capstone at 200); **~100 rows are DRAFT FOR
ADAM'S REVIEW** — exact ranges in the table's preamble. Rulings that now bind the whole pass:
the band calibration (Volatile = escalating force ON the setting; Mythic = forever-change chain;
Twilight-Zone loops cap at Strange), the hook-anchor convention (every row is the rolled NPC's
problem), sins/monsters/silly threaded per band, 11 per-realm leaky-breach guarantee rows in
Volatile+, and the tuffle (gremlins row, needs the bestiary pair — orchestrator unit). Gates:
compile clean, lint 0 new errors, verify-table-lint 37/37, coverage 1-200.

**Do next (pick up here):** 1) Adam reviews the d200 draft rows; 2) NPC If Ignored + Want on the
same branch (the consequence/agency half — If Ignored becomes band-graded escalation ladders);
3) then the re-prioritized craft queue in NEXT-STEPS "Do next" item 1 (Problem trio → Travel →
place family). Orchestrator: land `feat/craft-npc-situation` (--no-ff) and queue the tuffle
bestiary pair + the other captured build units.

## Latest-1 (2026-07-07 — THE 24-HOUR PRODUCTION RUN: the whole spec batch BUILT, the ending shipped) [Claude Fable 5, director's seat]

Adam extended Fable 24h and said "start production." Result: **8 gated integration landings on
master, all pushed, CI green** — every unit of the 2026-07-06 spec batch is BUILT. Fable
orchestrated ~40 Sonnet/Opus executors (genesis-orchestrate discipline: worktree isolation,
Workflow throttle, personal re-gates, --no-ff), resolved every cross-wave conflict by hand, and
landed in order: **Wave-0 hotfixes H1-H10** → **wave 1b** (table lint gate, TAROT-2, theater-next,
bestiary dashboard) → **wave2a** (scene-risk, item-legacy, seat adapter) → **the contract spine**
(dm-contract.json @96 events + social fixes + the always-ticking clock + detected events) → **the
spicy world** (25/25/25/17/8 band-first layer, zero rows touched) → **Table Atlas** → **state-
hygiene eval** (GLM bake-off now scoreable) → **THE ENDING** (Crowning/Sundering/Bastion/heirloom —
a world can finish; retirement is state promotion, not deletion).

**Verification:** every landing = full 100+-harness sweep on the exact integration tree + fuzz
(500 calls/96 events/0 findings) + monkey (12/12 lives) + check-manifest (H9-hardened) + diff
reads. Playtest probes across the day: **5/16 reproducing → 1/31.** The dm-contract drift guard
caught one real integration drift (itemLegacy digest key) — the anti-drift keystone works.

**Do next (pick up here):**
1. **Adam's craft queue** (everything else is built): table rows against the LIVE linter
   (`build/lint-tables.py`; the worklist is `--warn-only`, the voice reference is
   `GPT-5.5-advice-for-Claude/ROW-ANATOMIES.md` — six-question row test + weak→playable pairs
   per family) · tarot Major card text · Legend-table rows (`data/crown-legend.js`
   PROVISIONAL) · FRAME-FIELD schema + Frontier/Noir rows skim · grit + NEAREST_SUB eyeballs.
2. **The GLM bake-off** — seat adapter + SEAT-PROMPT.md v1 + `dev/state-eval/` scorecards are all
   live; run providers against the 12 goldens (LATENCY LAW ≤15s is the launch gate).
3. **A live playtest** on the new world: spicy baseline + scene-risk telegraphs + ticking clock +
   item legacy + (if a world qualifies) the first Crowning. The DIRECTION soak doctrine applies.
4. **Small fixes:** founding-digest 32KB budget breach (codex prep dump — digest-diet bug, filed
   by state-eval) · seed the 3 flaky harnesses (plot-recurrence / detected-events / scene-risk) ·
   monkey watchdog-stalemate balance class (Lizardfolk Geomancer, Green Dragon Wyrmling).

## Latest (2026-07-05 later-6 — Adversarial playtest: Rennick Fool, 4 runs — DM seat proven un-gameable) [Claude Code]

**Docs/findings session — NO engine change** (standing freeze: harness/testing yes, building no). Committed
on `docs/adversarial-playtest-rennick`. Full detail: CHANGELOG 2026-07-05 (later-6).

A new continuing griefer PC, **Rennick Fool** (Human Bard), run through **four adversarial bridgeless
playtests** against the production DM seat (the sabotage counterpart to Sella's earnest play). Four assault
types across 40 turns: **griefer** (OOC/fourth-wall/soft-lock) → **saboteur** (tried to dismantle the plot;
the failed roll *fed* it) → **puppeteer** (leveled to L10, tried to auto-win with Dominate/Charm) →
**whiplash** (forced volatile dice + crit-magnitude spikes).

- **Verdict — the seat is robustly un-gameable:** the DM never broke character, rolled the player's dice,
  obeyed an illegal demand, or leaked a `dmOnly` truth. Mind-control was adjudicated rules-correctly (saves
  gated, scope/duration/concentration honored, zero free wins); crit-magnitude + degrees-of-failure both
  fired correctly under forced volatility; the **spell-slot economy proved fully built + enforced**; BUG-01's
  fix held across native branch landings. Every fault found is a quiet engine *contract seam*, never the
  narration.
- **New findings (filed to `docs/PLAYTEST-BUGS.md`, not fixed):** BUG-14/15/16/17/18 + CAL-1. **BUG-17+18
  triangulate the whole social-attitude spine** (attitude can't move / moves against the wrong DC) and the
  **caster-discoverability gap** (slot economy works but the seat prompt never teaches `cast`) is the
  highest-value caster fix. **CAL-1** = Adam's lethality ruling (a failed suicide-mind-control save should
  land/kill; don't narrate past a failed save). **⏸ PARKED:** whether to raise spice across the board.
- **New save:** `dev/playtest-saves/rennick-fool/` (tracked, Sella-precedent) — L10, HP 3/43,
  bound-to-the-fog; `state-pre-run4.json` archives the pre-forced-dice line if you want to keep it clean.

**Do next (pick up here):** the findings are on the ledger under the build freeze. When the freeze lifts,
the highest-leverage cluster is the **social-attitude spine + caster discoverability** (BUG-17/18 + the
`cast`/spell-list gap) — small contract fixes with outsized payoff. Hold **CAL-1's across-the-board spice
question** for a design talk with Adam before touching lethality dials. Otherwise the pre-freeze backlog
(BUG-02 clock hotfix, the breach soak, CI wiring) stands as it was.

## Latest (2026-07-05 later-5 — Run 2 (Sella) + Fable bug-class sweep + THE FIX: 13 bugs closed) [Claude Code]

**Committed on `fix/event-source-enum` (3 commits); NOT yet merged to master — held for the merge
confirmation.** Full detail: CHANGELOG 2026-07-05 (later-5). Two things this session: **continued the
Sella playtest (Run 2, 10 turns)** and then **fixed the entire event/codex contract bug-class** those
playtests surfaced.

- **Run 2 (Sella, 10 turns, no engine change):** T1–T6 the memoryless-DM-every-turn codex-survival
  stress test, T7+ a warm persistent DM (production pattern). **Verdict — the machine works:** an AI DM
  comes in cold and stays un-confused off the digest+codex+ledger; narrative coherence held. The one
  seam was the DM's *interpreted notes* not persisting (BUG-06c). Save advanced to Day 2 (Run-1 archived);
  she's now the Circle's list-walker holding real leverage (Rell's suspected Iron-Strap ledger; a mapped
  night-route to Batgal). **Turns 11–20 are a clean fresh-session pickup** — kit in the save dir.
- **The Fable sweep → THE FIX:** the visible bug (BUG-01) was the tip of a class. Fable adjudicated a
  2-executor sweep, found **BUG-09 (CRITICAL — the entire inventory panel + level-up button were dead
  code)** + BUG-10..13, distilled 3 roots. Then, on Adam's go, **fixed all of it** (Fable spec → Opus
  execute → Opus gate). **13 bugs closed:** BUG-01, 06a–d, 08, 09, 10, 11, 12, 13.
  - **Root A** — `DM_EVENT_SOURCES` allow-list in `validateEvent` (+player,+branch); one change revived
    roll-branches AND all 7 dead player buttons.
  - **Root B** — a `DM_EVENT_FIELDS` census + `dmFoldPayload` (alias-fold after validate; unknown keys
    warn+drift-ledger, never dropped); digest clock key `id→clockId`.
  - **Root C** — codex `id-collision` refusal (no more silent-merge over an established record),
    `codex_update {note}`→`dm.notes[]`, missing-id reason.
  - **Observability** (why the class was invisible): probes now assert real state mutation (`applyMutates`)
    + standing ROOT-A/ROOT-B drift guards; verify-roll-branches got applied-ok checks.
- **Verification (independently re-run):** check-manifest OK; all targeted probes flip to resolved,
  BUG-02/03/04/05/07 unchanged (BUG-07 WAI); every green harness stays green; the 5 pre-existing red
  harnesses proven identical to clean master via a worktree baseline — **zero new regressions.**

**Do next (pick up here):** (1) **Confirm the merge** — `git merge --no-ff fix/event-source-enum` to
master + push (or run `/code-review` on the branch diff first). (2) The **still-open originals** BUG-02
(clock tick — the hotfix candidate), BUG-03 (digest current-HP), BUG-04 (non-lethal KO), BUG-05 (travel
event) — each a separate root, some need a design talk. (3) **Run 2 turns 11–20** (fresh session; the
save + seat prompt are in `dev/playtest-saves/sella-shimmering-maw/`).

## Latest (2026-07-05 later-4 — bridgeless playtest rig + the bugs it caught) [Claude Code]

**Committed on `feat/bridgeless-playtest-rig`; master green (check-manifest OK; harness + 8/8 bug
probes run).** Full detail: CHANGELOG 2026-07-05 (later-4). Adam asked for a **headless, bridgeless**
playtest — a player rolls a char, plays a session, and gets the story from both sides of the screen.
Built the AUTOMATED-PLAYTEST Layer-1 loop with the transport removed: two sealed **Sonnet** seats
(Player + DM) played through the **real engine in jsdom**, **Opus** stayed clerk/analyst.

- **The session — "The Shimmering Maw":** a con artist, **Sella Voss**, in a village hung on chains
  over a glass crater; a stolen hit-list, a patient antagonist (Corran Vale), a botched seal, a
  bearings-and-bridge escape, near-death at 1 HP, capture, and a dusk table-flip that earns her the
  epithet **"the Seam."** 12 turns, 7 checks, a complete arc. Two-lens report shipped as an artifact.
- **What it was FOR (Adam):** validation, not building. **No engine code changed.** Everything the run
  surfaced is a *future fix*, logged in the new **`docs/PLAYTEST-BUGS.md`**.
- **The headline catch — BUG-01 (CRITICAL):** last session's DM-Seam `validateEvent` (later-3, tests
  green) **regressed ROLL-BRANCHES** — `resolveBranch` stamps branch events `source:"branch"`, which
  the validator rejects, so *every* pre-authored branch consequence (HP/clocks/codex/epithets) no-ops.
  Both suites missed it because `verify-roll-branches` checks the event's *label*, not that state
  mutated (the mutation-test gap). Plus 7 more: no clock-advance event (hotfix candidate — clock should
  always tick, ≥6s/round in combat), digest hides current HP, no non-lethal KO, `discovery makeNode`
  doesn't move the PC, event field-name mismatches, `distant_word` ignores DM text.
- **The rig (built, kept):** `dev/playtest-bridgeless.mjs` (the harness), `dev/playtest-bug-probes.mjs`
  (a deterministic probe per caught bug — the running regression suite; `node dev/playtest-bug-probes.mjs`),
  `docs/PLAYTEST-BUGS.md` (the ledger), and `dev/playtest-saves/sella-shimmering-maw/` (**Sella
  preserved** — she continues in run 2).
- **World-variety flag (FIX-A):** "The Shimmering Maw" rolled two sessions running; probe measured ~30
  distinct settings/60 rolls with a mild skew — widen the pool + build the bardo-reincarnation repeat.

### Do next (pick up here)
1. **Run 2 — continue Sella** (Adam is setting it up): boot a **fresh DM seat with no conversation
   memory** and run her world purely from the codex + digest — a direct test of **how well the DM's
   codex survives play**. Save at `dev/playtest-saves/sella-shimmering-maw/` (README has the load
   recipe); she's alive at 1 HP owing two guilds, mid a 3-day deadline.
2. **BUG-01 fix** (critical, cheap): let `validateEvent` accept `source:"branch"` (or restamp in
   `resolveBranch`), then extend `verify-roll-branches` to assert the branch *mutated state*. Probe
   BUG-01 should flip to resolved.
3. **BUG-02 clock hotfix** (Adam flagged as candidate): a DM-reachable clock-advance path — combat
   ≥6s/round, distance + hand-waves pass minutes.
4. The rest of `docs/PLAYTEST-BUGS.md` in severity order.

---

## (2026-07-05 later-3 — the DM seam: typed contracts + structured telemetry) [Claude Code]

**Committed on `feat/dm-seam`; master green (check-manifest OK + the full verify set below).** Full
detail: CHANGELOG 2026-07-05 (later-3). A talk-then-build session — Adam asked whether he has the
chops for an AI-engineer job/contract, we drafted **docs/POSITIONING.md** (Genesis as the case
study; the "factory is the career" thesis, co-authored with Fable), and then built the two
production-maturity moves that doc named first:

- **Typed contracts at the AI↔engine seam** (`src/world/dm.js`) — `validateEvent` /
  `validateTurnResponse` machine-check the DM's typed events + whole turn response against
  EVENT-CONTRACT.md before the engine trusts them; JSDoc `@typedef`s; the full 87-type
  `DM_EVENT_TYPES` vocabulary held in lockstep with `applyEvent`'s switch by a parity test.
  Forward-compatible (unknown-but-well-formed types pass; malformed envelopes no-op, never throw).
- **Structured telemetry on the DM seat** — `logDmTurn` writes one row per turn (latency, lane+model,
  payload bytes in/out, applied event types, mint count, an *estimated* token/$ cost off measured
  bytes) → `GS.dm.telemetry` ring buffer + the bridge's new `POST /telemetry` → `.dm/telemetry.jsonl`
  (the mailbox-path twin of `seat-costs.jsonl`). Cost/latency *discipline* is now cost/latency
  *evidence* — the substrate for the "one-DM-turn walkthrough" case-study artifact.
- **Verification:** verify-dm-seam **38/0** (incl. a red-first parity + load-bearing mutation check);
  regression verify-dm-events 36/0 · verify-roll-branches 29/0 · verify-digest-diet 33/0 ·
  verify-combat-lifecycle 52/0 · verify-bridge.py 43/0.

**Do next (pick up here):** the standing DIRECTION-doctrine prize is unchanged — **a live breach
playtest soak on the new stage** (P1′ figures + dressed rooms + initiative UI + chase loop, felt
together). The DM-seam telemetry now means that playtest *produces data* — real per-turn latency/cost
rows in `.dm/telemetry.jsonl` to read afterward. Two cheap follow-ons the POSITIONING roadmap ranks
next: **wire CI** (a GitHub Action running check-manifest + the verify-*.mjs on every push) and build
the **one-DM-turn walkthrough** artifact off a real telemetry row. Adam's ledger rulings (grit /
CHASE-BITE / NEAREST_SUB) still open.

## (2026-07-05 later-2 — two code-review waves repaired + the Reference Shelf: Monster Manual & Wiki) [Claude Code]

**Everything committed + pushed to origin; working tree clean; master green (full verify sweep +
`check-manifest` OK).** Full detail: CHANGELOG 2026-07-05 (later-2). A large orchestrated session:

- **Two deep code-review waves, all repaired.** Wave 1 (the monster layer) fixed 5 units — the
  headline: two features (pet upkeep, creature-parley §1) were **dead code the verify harness
  masked** (it called them directly; nothing in-game did) — now wired at reachable paths; plus the
  flavor-first-fight gate, combat action-parse/traits-apply, and the render-profile mirror.
  Wave 2 was the **first-ever review of the ~9.4K-line battle-visual arc** (theater-boot/parts/
  figures/verbs) — fixed GPU-lifecycle bugs (shared-material corruption on hurt, undisposed texture
  cache, tween/FX surviving board swaps) + creature-builder determinism. All red-first, re-gated,
  landed.
- **The Reference Shelf shipped** (docs/REFERENCE-SHELF.md) — an expandable "Reference" section on
  the opening screen with two live apps: the **Monster Manual** (1817 creatures, lazy live-3D grid
  + detail viewer + alt-menu) and the **Wiki** (the design-doc wiki, compiled from
  **docs/ARCHITECTURE.md** — the new 51-system map of the whole machine — via `build/gen-wiki.py`).
  Built to expand: Props & Scenery is a future one-entry add.
- **Two skills hardened** with THE STASH LAW (after a stash-spill scare Fable audited — no work
  lost); clean-close now sweeps ARCHITECTURE/Wiki so the map never drifts from the code.

**Verification:** full `dev/verify-*.mjs` sweep green; `check-manifest` OK; `gen-wiki` byte-
idempotent; every fix unit proved red-first before landing. Byte-verified each wave's master tree
against its gated integration branch.

**Do next (pick up here):** (1) **The breach playtest soak** — the DIRECTION-doctrine prize:
creatures described/modeled/storied/recruitable, the render bugs fixed, and now a Monster Manual +
Wiki to inspect it all. Everything finally exists to *feel* it together. (2) Adam's standing ledger:
PACING-DIALS build · NPC-KNOWLEDGE-GRADES build · REALM-RENDER-STYLE §2 tune by eye. (3) Wave-3
fast-follows: Wiki per-system detail pages · alt-model authoring · Props & Scenery (shelf app #3).
(4) Optional: eyeball the Monster Manual grid + a Wiki page in a browser (the sandbox couldn't serve
localhost this session — harness-verified only, visuals unread by eye).

## Latest (2026-07-05 later — the wave's follow-on: Phase 2b, parley, render grade, the recovered merge) [Fable]

**Everything committed + pushed to origin; working tree clean; final sweep 96 harnesses / 0 failed.**
Full detail: CHANGELOG 2026-07-05 (later). The monster layer is now COMPLETE end to end. Since the
earlier close today:

- **Phase 2b landed** — all **1307 realm creatures** carry `traits` + a spice-graded **d8 flavorTable**
  + their OWN `treasure`/`habitat`/`activity` (184 prior theater-session traits preserved). Generator
  extended + fail-loud merge; `--check` clean 1307/11.
- **F4 flavor-d8 roll at mint** — rolled once, canon-locked, spice-clamped (`verify-flavor-d8` 15/0).
- **cmApplyTraits recovered + re-merged** — the traits apply-seam merge had been lost on a stray branch;
  recovered from the object store. Traits now go live in combat (rename/replace actions, authored
  mechanics override chassis within CR budget). This birthed the skill's **checkout law**.
- **MONSTER-PARLEY + THE ANOMALY LAW** — creatures recruitable but "difficult af": grind clamps at
  Friendly, `bondEligible` only via nat-20 / decisive lever / 3% friendly spawn; pet/hireling/sidekick
  tiers; befriended creatures recur (`verify-monster-parley` 58/0).
- **Render-style grade v1** + the bright-kingdom candy fix + the **profile-stamp architecture** that
  killed the dual-table mirror trap (`verify-theater-data` 242/0). 12-swatch review sheet committed.
- **Spec locks (build-ready, unbuilt):** MONSTER-FLAVOR-TABLES, NPC-KNOWLEDGE-GRADES, PACING-DIALS.
- `genesis-orchestrate` skill hardened with the wave's scars.

**Adam's open ledger (pick up here):** ① **NPC-KNOWLEDGE-GRADES build** (specced, executor died to a
throttle — relaunch; the "no omniscient NPCs" system: signs→rumor→named, rolled witnesses) ②
**PACING-DIALS build** (the §5 mechanisms — hot-open law, pressure injector, dry-streak escalator,
quiet-streak license; player-facing picker BANKED, tune one standard difficulty first) ③ **deep
`/code-review`** over the wave's accumulated diff (Monday post-token-refresh; ultra is Adam-triggered)
④ REALM-RENDER-STYLE fine-tune by eye (§2 warm-brown middle band) ⑤ the 11 `_review` CR flags in the
draft JSON ⑥ figure baked-vertex-color grading (render v2).

**Do next:** (1) **a live playtest in a breach** — realm creatures with descs + models + traits +
flavor + story-wiring + parley have NEVER been felt together; this is the soak DIRECTION calls for,
and everything now exists for it. (2) Adam's ledger above. (3) The seat program (latency law).

**Session-close note (2026-07-05 later):** the session ran long + messy (a rate-limit storm mid-Phase-2b
that killed ~12 batches, and the lost-then-recovered merge). Both are landed clean now; the mess is
documented so it isn't mistaken for instability — the gates are green and the tree is coherent.

## Latest (2026-07-05 — THE MONSTER PRODUCTION WAVE: described, storied, modeled, recruitable) [Fable]

**Everything landed + pushed (origin current at the close); final sweep 94/0; ~30 merges from
~120 background agents overnight.** Full detail: CHANGELOG 2026-07-05. The headline: every monster
in the game is now an individual — **1307 realm creatures** (desc on all; net-new model queue
EMPTY: 229 creature + 8 prop whole-object models landed across 7 judged waves) and **510 regular
monsters** (original desc + spice-graded d8 flavor table each, MM-2024 vision-grounded). The story
layer reaches them all: habitat/behavior/displaced flow to the DM digest, significant foes mint
codex records (custom-d10 rolls canon-locked at first mint), quest hooks name the destination's
actual threat, traits apply live in combat (cmApplyTraits, divergence licensed within CR budget),
and MONSTER-PARLEY + THE ANOMALY LAW make recruitment real but difficult af (grind clamps at
Friendly; bondEligible only via nat-20 / decisive lever / 3% friendly spawn; pet/hireling/sidekick
tiers). Reference layer: all five books have committed vision-verified page indexes
(dev/model-qa/*-page-index.json — see CLAUDE.md gotcha).

**Adam's open ledger:** ① **Phase 2b go/no-go** (realm traits at his 100% ruling + realm d8
tables + own treasure/habitat/activity for 1307 — ~2.5× the 510-corpus token spend; specs locked,
machinery proven, launches on his word — TOKEN-LEAN until Mon-eve refresh) ② REALM-RENDER-STYLE
tune ③ PACING-DIALS §3 (octane/lethality/drip + player-type presets — his "high octane" thread)
④ prop size→footprint veto row (REALM-PROPS-WIRING §3) ⑤ 11 `_review` flags in
realm-bestiary-draft.json ⑥ deep /code-review (+ ultra if wanted) Monday post-refresh.

**Do next:** (1) Adam's ledger above; (2) Phase 2b when authorized; (3) **a live playtest in a
breach** — realm creatures with descs + models + story wiring + parley have never been FELT
together (the soak DIRECTION calls for); (4) the flavor-d8 engine roll at mint
(MONSTER-FLAVOR-TABLES §4 F4 — small unit, stacks clean now); (5) the standing seat program.

## Latest (2026-07-04 later-3 — the REALM arc: 100% models, floors, figure AO, realm content + wiring) [Opus]

**Everything landed + pushed; master green (check-manifest OK · verify-theater-data 165/0 ·
verify-theater-figures 38/0 · verify-realm-wiring 20/0); working tree carries only dev tooling (this
close commits it).** A very large session that took the battle theater from "models exist" to "each
breach realm is a populated, floored, wired place."

**What shipped (all on master):**
- **Model coverage 32% → 100%** — 280 silhouette aliases + **66 net-new bespoke monsters**
  (docs/CREATURE-MODELS-P2.md; 56 via a Workflow fan-out). No cuboid fallbacks left.
- **17 procedural floor materials** (docs/FLOOR-TEXTURES.md) derived from rolled terrain + **baked
  figure AO** (on the models, per Adam's correction).
- **Realm content at scale (approach C, text-first, IP-clean):** bestiary **1092 creatures** (~100/
  realm) + a **legal familiar-icons batch** (219; PD source-versions + archetypes, source-tagged) +
  **88 surfaces** + **308 props** (cross-realm tagged). Docs: REALM-BESTIARY-{DRAFT,SCAN,ICONS},
  REALM-SURFACES-DRAFT, REALM-PROPS-DRAFT. **suburb LOCKED to 1980s Americana.**
- **The active-realm WIRING seam** (docs/REALM-WIRING.md) — breaches spawn the realm's creatures
  (filter + 18% adjacent leak); frame=stats/modelKey=render/name=realm; `data/realm-bestiary.js`. This
  seam also carries surface-select + the render grade.
- Proposals awaiting Adam: **REALM-RENDER-STYLE.md** (per-realm sat/tint/contrast/shape). Dream:
  **DREAM-HORIZON §H∞ "The Private Cut."**

**Do next (pick up here — Adam: "finish modeling, writing, and speccing the realm enrichment"):**
1. **MODELING** — the net-new geometry queue: **207 net-new creature models + 31 net-new prop
   models** (net-new floor bases already done). Build via the proven Workflow fan-out (spec pattern =
   CREATURE-MODELS-P2), gate visual wave sheets, land. Dedupe the cross-realm-`all` props first (build
   once, share) to shrink the 31.
2. **WRITING + STAT/DESCRIPTION pass** — review/reshape the drafts (BESTIARY-SCAN = fast read), fold
   the icons batch in, regenerate `data/realm-bestiary.js`; **then author per-creature stats +
   narratable descriptions** (curated off the SRD chassis — OGL-clean; original prose `desc`).
3. **STORY WIRING** — fold the realm creatures into the narrative layer: a breach foe mints/attaches a
   **codex** entry, and its `desc`/name/realm flows through `dwalkEncounter` → encounter → DM digest so
   the DM narrates the REALM creature (not the generic chassis) and it can recur/tie to factions.
4. **SPECCING** — Adam's ruling on **REALM-RENDER-STYLE** → spec the grade; **surface-select wiring**
   on the `activeRealmsFor` seam; the **prop-sizing render pass** (size → zone occupancy); **urban/
   wilderness creature-wiring** (dungeon done).

## Older sessions

The full session-by-session history lives in `docs/CHANGELOG.md`. Standing rule (DIRECTION §7):
HANDOFF holds at most 3 entries — newest replaces oldest; history migrates to CHANGELOG.

Pre-CHANGELOG standing notes preserved here (no CHANGELOG counterpart — durable operational
knowledge, not a dated session entry):
- `genesis.html` runs on INLINE data, not the compiled registry — wiring it onto `tables.json` is
  the still-open Track B hook.
- bash `rm` was blocked in an earlier Cowork mount (used `mcp__cowork__allow_cowork_file_delete`);
  may not apply to the current Claude Code environment.
- The `genesis` skill (installed) handles orientation + hands Vale/playtest triggers to
  `arcana-playtest`; Adam's Claude-app project instructions may still need a pointer update if they
  ever named Shifting Vale instead of Genesis.
- Loot tables are remapped (`LOOT-REMAP.md`) — don't treat the old "Tier" table or whimsical
  "Legendary" as live; SRD additions in the rarity tables are pointer-format rows (curated rows
  first, verbatim).
