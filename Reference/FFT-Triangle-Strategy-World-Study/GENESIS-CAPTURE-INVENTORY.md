# Genesis capture inventory — current-state audit (2026-07-29)

Mandated by `docs/FFT-TRIANGLE-STRATEGY-WORLD-STUDY-BRIEF.md` §8. Every row below was
**visually inspected by Fable during this study** (not carried over from a report). Worktree
survey run 2026-07-29 evening; commits verified with `git log` in each worktree.

## Worktree survey (state at audit time)

| worktree | branch | HEAD | terrain relevance |
|---|---|---|---|
| `genesis` (root) | `master` | `b72228b3` (2026-07-29 19:19, "merge: Golden Site vignette master program") | canonical integration line; holds ALL clay-capture history materialized (LFS smudged) |
| `Genesis-terrain` | `feat/terrain-fft-proof-suite` | `32b907ad` (2026-07-29 08:14, "feat(terrain): add FFT proof suite and quarter-turn review") | **active terrain lane** — newest committed FFT-proof fixtures |
| `Genesis-terrain-surface` | `feat/golden-vignette-wave0` | `b72228b3` (fresh branch off master post-merge) | vignette planning lane; its `cl-f10-natural-surface-review-v002` work (03da57c9, 36568ced) is folded into master |
| `Genesis-clayspec` | `docs/clayroom-terrain-materials` | `66fcd4ba` (2026-07-27) | docs lane (proof backlog, terrain program, ground materials) — no newer captures than root |
| `Genesis-sites` | `feat/golden-sites-campaign` | `af99980e` (2026-07-28 23:40, "Add compact Golden Site vignette targets") | this study's home; owns the scale-pass target art |
| `Genesis-fable-visual`, `Genesis-sockets`, `Genesis-tables`, `Genesis-wiring`, `Genesis-assetforge`, `Genesis-briefs` | various | various | no terrain captures newer than the above (verified by image-commit sweep since 2026-07-25) |

**LFS caveat found during audit:** `Genesis-terrain`'s older `dev/light-lab-shots/*` are
unsmudged LFS pointers (worktree created `GIT_LFS_SKIP_SMUDGE=1`); the same paths in the
root `genesis` worktree are real PNGs. All inspections below used materialized files.

## Selected captures (8 selected + 2 instructive rejections, 10 inspected)

### 1. FFT proof suite four-bearings sheet — SELECTED
- **path:** `/Users/adamstephenson/Desktop/Work/projects/Genesis/Genesis-terrain/dev/clay-captures/cl-f10-fft-proof-suite-v001/fft-proof-suite-and-four-bearings-labeled.png` (repo `dev/clay-captures/cl-f10-fft-proof-suite-v001/…`)
- **source state:** `feat/terrain-fft-proof-suite` @ `32b907ad`, committed 2026-07-29 08:14
- **fixture/mode:** four named terrain fixtures (reverse ridge · ravine crossing · terraced bluff + ruin · breached earthworks), clay register, view-0 plus quarter-turn ruin bearings (45/135/225/315°)
- **channels:** terrain formation, elevation banding, silhouette, fixed-camera bearings, standee scale reference, backdrop plate
- **current/stale:** CURRENT (newest committed terrain-lane evidence at audit time)
- **selected because:** the terrain lane's own FFT-comparison instrument; directly commensurable with the FFT cohort
- **can prove:** stepped elevation-band language exists; quarter-turn silhouette stability; ruin mass as vertical punctuation; standee-to-terrain scale
- **cannot prove:** material/texture quality (clay only), route legibility as a *material* band (view-0 here is pre-responsive-surface), lighting/mood

### 2. Natural-surface review labeled sheet (connected vs naked) — SELECTED
- **path:** `/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/dev/clay-captures/cl-f10-natural-surface-review-v002/connected-vs-naked-labeled.png`
- **source state:** merged to `master` @ `b72228b3` (authored on `03da57c9` 2026-07-29 18:36, "fix: default terrain features to responsive surface")
- **fixture/mode:** same four fixtures, **responsive/connected surface DEFAULT** vs explicit naked-box control
- **channels:** terrain formation (continuous folded surface), route-as-material band (dirt path), sparse rock/vegetation dressing, hard-construction contrast, A/B honesty control
- **current/stale:** CURRENT — this is the newest statement of default terrain behavior in the whole repo
- **selected because:** proves the engine's current default is continuous folded cell-spanning landform with causal hard breaks — the exact language the scale-pass prompt contract demands — and keeps the honest stepped control beside it
- **can prove:** connected natural surface is default; route band reads as material not geometry noise; construction sits ON terrain deliberately
- **cannot prove:** production materials (still monochrome clay + tint), atmosphere, context bands beyond the backdrop plate

### 3. CL-F05 trimmed structures, settled PBR — SELECTED
- **path:** `/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/dev/clay-captures/cl-r5-trimmed-structures-v005/cl-r5-pbr-02-settled.png`
- **source state:** master (CL-R5 lane, committed 2026-07-27; Adam-approved fixture per HANDOFF)
- **fixture/mode:** CL-F05 twin trimmed rooms (institutional fine-brick vs upland rough-block), production renderer, sun/day, PBR
- **channels:** constructed geometry (walls/doorways/stairs/platform/curb), material families + semantic trim roles, camera-side wall omission with 1-ft stubs, cast shadow/AO, docked-studio shell
- **current/stale:** CURRENT (retained production-renderer fixture)
- **selected because:** strongest existing constructed-architecture + material evidence; the culture-swap twin is the study's material-separation exhibit
- **can prove:** two approved masonry parents render with correct scale/trim routing; complete architectural assembly reads; omission grammar works
- **cannot prove:** terrain integration (rooms sit on a flat tray), dressing/prop language, atmosphere/post (neutral day only)

### 4. CL-R4b two-material + multiply-grid final — SELECTED
- **path:** `/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/dev/clay-captures/cl-r4b-two-material-grid-v001/cl-r4b-final-02-settled.png`
- **source state:** master (committed 2026-07-26; both parents Adam-approved 2026-07-27)
- **fixture/mode:** CL-F04 matched bays, fine ashlar vs rough-hewn block, PBR, goblin standee, surface-clipped multiply grid (receipt: 16 tops, 602 strips)
- **channels:** materials, texel scale (1.65 m/tile physical scale stated in-shell), tactical grid legibility on textured floors, sprite-in-scene
- **current/stale:** CURRENT
- **selected because:** the study's texel-frequency and grid-legibility anchor — the only capture stating physical material scale in-frame
- **can prove:** approved material scale vs cell vs standee; multiply grid reads on texture; matched-bay comparison discipline exists
- **cannot prove:** whole-scene composition value (it is a sampler bench, not a site)

### 5. CL-R2 sprite-citizenship size-spectrum, dark production — SELECTED
- **path:** `/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/dev/clay-captures/cl-r2-sprite-citizenship/05-dark-production.png`
- **source state:** master (CL-R2, 2026-07-24/25 rulings baked)
- **fixture/mode:** size ladder bug→pixie→PC→skeleton→wraith→shambling mound→kraken on clay tray, dark lighting, one selected standee
- **channels:** sprite lighting response, contact shadows, selection emissive base, presentation scale (1–30 ft), silhouette at play distance
- **current/stale:** CURRENT for the standee register (sprites are static canon)
- **selected because:** the citizenship exhibit — every lane-5 claim about Genesis standees can point here
- **can prove:** sprites darken with scene, ground contact reads, size ladder holds, selection glow is diegetic-adjacent
- **cannot prove:** sprite behavior amid real architecture/terrain (tray is bare), outline/palette against busy environments

### 6. CL-F09 FFT hillside proof, clean production — SELECTED
- **path:** `/Users/adamstephenson/Desktop/Work/projects/Genesis/Genesis-terrain/dev/clay-captures/cl-f09-fft-hillside-v001/11-fft-hillside-proof-04-clean-production.png`
- **source state:** `feat/terrain-fft-proof-suite` (committed 2026-07-28 23:35, "prove FFT hillside and switchback")
- **fixture/mode:** hillside with switchback dirt route, retaining cuts, rock micro-clusters, one standee, subtle surface grid
- **channels:** terrain formation + route interlock (the Grog-Hill-grammar test), composed diorama edge/skirt
- **current/stale:** CURRENT
- **selected because:** the engine's most direct answer to the FFT through-road/shoulder grammar to date
- **can prove:** switchback route embeds in landform; retaining reads as causal break; edge is composed not eroded
- **cannot prove:** material identity (monotone), architecture anchoring (no built mass), quiet-ground contrast under materials

### 7. Two-tray reference (scale-pass source pointer) — SELECTED as STALE-BASELINE
- **path:** `/Users/adamstephenson/Desktop/Work/projects/Genesis/Genesis-sites/Reference/Golden-Site-Ideal-Art/scale-pass-2026-07-28/source-references/current-terrain-engine-two-tray-reference.png`
- **source state:** `feat/golden-sites-campaign` @ `af99980e` (committed 2026-07-28 23:40)
- **fixture/mode:** two small terrain trays, folded gray terrain, standees; 537×721 px
- **current/stale:** **STALE as "current engine"** — superseded within ~19 hours by cl-f10-natural-surface-review-v002 (dirt route band, responsive-surface default, richer breaks). Kept as the checked-in pointer the brief names, correctly re-graded.
- **selected because:** the brief explicitly requires grading this pointer rather than assuming it
- **can prove:** what the scale-pass generations used as their terrain reference
- **cannot prove:** today's default terrain behavior (it predates the responsive-surface default)

### 8. CL-F07c dark-grade G4 settled production — SELECTED
- **path:** `/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/dev/clay-captures/cl-f07c-terrain-r2-v001/dark-grade-g4/07-dark-02-settled-production.png`
- **source state:** master (committed 2026-07-28 18:35, "Adam's seven R2 rulings — the sprite matches its base")
- **fixture/mode:** terrain bench under darkest grade tier G4, overhang trees with ember accents, backdrop plate, live Clayroom shell showing Move 30 ft filled / Dash +30 ft hollow query (range 76 cells, dash-only 116)
- **channels:** grade/value range, dark-scene readability, vegetation overhang treatment, movement-UI truth, backdrop-plate band
- **current/stale:** CURRENT
- **selected because:** the value-floor stress case — lane 4's "where do blacks stop" question needs exactly this frame; also proves the exact-cell move/dash query is live in the Clayroom
- **can prove:** G4 grade crushes terrain toward silhouette against a light plate; ember accents survive; movement query wired
- **cannot prove:** that G4 preserves Adam's "make out forms in the dark" requirement — on this frame interior forms are near-unreadable (recorded as a finding, not hidden)

### 9. Backdrop-plate-only diagnostic — REJECTED (instructive)
- **path:** `…/cl-f07c-terrain-r2-v001/dark-grade-g4/07-dark-06-production-backdrop-plate.png`
- **why rejected:** frame contains only the plate + probe wireframe; cannot prove any terrain claim. Kept in the ledger as the example of a capture that would *falsely* fail the engine if graded as "current terrain quality."

### 10. Light-lab dim-interior production frame — REJECTED as STALE DIAGNOSTIC
- **path:** `/Users/adamstephenson/Desktop/Work/projects/Genesis/genesis/dev/light-lab-shots/03-dim-interior-floor-production.png`
- **source state:** master (light-lab bank, 2026-07-26 era)
- **why rejected:** a lighting-floor diagnostic inside the in-game shell (Ash-Plaza, mostly crushed-black floor). It documents the shell (left rail · stage · DM rail) and the light-lab process, but grading current terrain from it would repeat exactly the stale-frame mistake the brief bans.

## Staleness rules applied

1. Anything predating the 2026-07-28/29 cl-f09/cl-f10 family is **stale for terrain-formation claims** (the responsive-surface default landed 2026-07-29 18:36).
2. Anything on a bare tray is **inadmissible for composition claims** (bench ≠ site).
3. Clay-register frames are **inadmissible for material claims**; CL-R4b/CL-R5 own those.
4. The in-game shell's dungeon frames (light-lab era) are **diagnostic history**, not current quality.
5. Golden-Site ideal-art renders are **targets, not captures** — they appear in the corpus inventory as the Genesis *target* column, never as engine evidence.
