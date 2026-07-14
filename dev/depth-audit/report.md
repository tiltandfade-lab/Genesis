# P3-1b — GP-4a depth-state defect audit (diagnostic)

**Spec:** `docs/PHASE-3-WAVE-1-SPECS.md` §P3-1b · **Classification law:** `docs/GRAPHICS-PRODUCTION-RESEARCH-WAVE.md` §7.1
**Harness:** `dev/audit-depth-state.mjs` → re-run with `NODE_PATH="$HOME/.genesis-jsdom/node_modules" node dev/audit-depth-state.mjs`
**Raw dump:** `dev/depth-audit/depth-state.json` (per-material depth-state, all four yaws)
**This is diagnostic ONLY — no engine/render source was changed.** Input to the later P3-3 GP-4b fix wave.

## Scene / method

- Fixture: the same dressed multi-room scene GP-1's `dev/verify-transparent-material-contract.mjs`
  uses — row-101 Grand Octagon hub + 2 neighbor chambers, `lightProfile="lamplit"`, `realmId="gloom"`,
  `env="dungeon"` — proven to exercise all three §7.1 transparency classes in one live mount. Two
  Skeleton standees + a fighter/skeleton pair placed at a room-edge cell, with a matching real
  `GS.combat` player/primaryThreat so `theater-boot.js`'s C4.1b wall-upper occlusion pass actually has
  ShotPlan subjects to protect (absent that, every upper segment reads full/opaque and the fade never
  fires — `theater-boot.js:9106-9107`).
- Kernel: **oss** (`window.Theater._setRoomShellPolygonKernel("oss")`), product camera, `shotCompose`
  left at its product default (ON, so a real `S.lastShotPlan` exists).
- Four fixed yaws via `window.Theater.rotate()` (advances `S.rotationStep` by 1 mod 4 — the
  `rotationStep*90° + CAM_YAW_OFFSET_DEG` yaw law) + `setInteriorVariant({})` to force the same board
  to rebuild at the new rotationStep (so the wall-upper occlusion classify pass re-runs each yaw).
  Captures: `yaw-0.png`, `yaw-90.png`, `yaw-180.png`, `yaw-270.png` (all under `dev/depth-audit/`).
- Renderer: headless Chrome ANGLE (SwiftShader-class software GL). Material depth-state is read off the
  live scene graph via the existing `window.Theater._graphicsResearchContextForTest` seam and
  classified per §7.1 — nothing is mutated.

## Material census (identical across all four yaws)

| class | count | depth-state (representative) | verdict |
|---|---|---|---|
| opaque | 18 | depthWrite=true, depthTest=true, NormalBlending | correct (out of scope) |
| alpha-tested-cutout | 6 | alphaTest=0.5, **depthWrite=true**, NormalBlending | correct per §7.1 (cutouts keep ordinary depth writing) — includes the paired `MeshDepthMaterial` customDepth |
| additive-fx | 4 | AdditiveBlending, **depthWrite=false**, depthTest=true, opacity 0.55 | correct per §7.1 (additive FX keeps depthWrite=false) |
| normal-alpha-solid | 31 | see below | 30 = wall-upper (latent, see below); 1 = contact-shadow disc, depthWrite=false, correct |

Console errors during capture: 3 × `404 (File not found)` — pre-existing missing-asset fetches
unrelated to depth state (also present in the sibling GP-1 harness); no page/runtime error.

## PROVEN depth-state defect table (visible + reproducible at the four yaws)

**EMPTY — zero proven defects at yaw 0 / 90 / 180 / 270.**

| artifact | class | is_depth_state_defect | material/pass (file:line) | repro (yaw + what to look for) |
|---|---|---|---|---|
| *(none)* | — | — | — | — |

Per the spec's own instruction ("an honest empty table beats invented findings"), this is stated
plainly: I could **not** reproduce a single visible transparency/depth-state artifact — no popping,
no z-fighting seam, no see-through wall failure, no incorrectly-occluded or clipped figure — in any of
the four captures. Concretely, verified by eye against each PNG:

- **Walls render solid.** Every camera-side and back wall reads as an opaque brick body with a clean
  dark cap where the upper band fades; no shimmer/z-fight at any wall/floor or wall/wall seam
  (`yaw-0.png`, `yaw-90.png` right wall, `yaw-90.png` top-center step-down notch).
- **Occlusion fade is clean.** At `yaw-180.png` / `yaw-270.png` the camera-side near wall is faded to
  ~0.08 opacity and you can see the floor + the skeleton **through** it — the figure behind the faded
  wall is fully visible and un-clipped (it is drawn in the opaque/alpha-tested pass *before* the
  transparent wall, so the fading wall never depth-culls it). This is the fade working, not a defect.
- **Additive FX are correct.** The small orange motes floating near the skeletons (e.g. mid-right of
  `yaw-0.png`, near the sword tip in `yaw-90.png`, top-left of `yaw-180.png`) are AdditiveBlending with
  `depthWrite=false` — they glow additively without a depth-write artifact.
- **Contact-shadow / base discs sit flush.** The dark ellipses under each standee show no z-fighting
  with the floor in any yaw.

## Latent condition — mechanically flagged, NOT visually reproduced (input for P3-3, not a proven defect)

The mechanical depth-state scan surfaces **one** genuine misconfiguration that matches the §7.1
"transparent without disabling depth writes" pattern but does **not** produce a visible artifact at
these four yaws — recorded here as honest input for the P3-3 GP-4b fixers to weigh, explicitly **not**
counted as a proven defect above:

- **Subject:** the 30 `room-shell-wall-upper` occlusion meshes (one cloned material per wall segment).
- **Material/pass:** `src/ui/theater-boot.js:9153-9154` (`const upperMat = wallMat.clone(); upperMat.transparent = true;`),
  opacity tweened by the occlusion engine at `theater-boot.js:9175` (`fadeEntry.materials = [upperMat]`).
- **State:** `transparent=true`, **`depthWrite=true`**, depthTest=true, NormalBlending → classified
  `normal-alpha-solid`. The material is created at opacity 1.0 (where depthWrite=true is *required* to
  occlude as a solid wall) and the occlusion fade only tweens **opacity**, never depthWrite — so it
  keeps depthWrite=true even mid-fade. Measured live: at yaw-90/180/270 **2** of the 30 wall-upper
  materials are actively at **opacity 0.08** while still writing depth (yaw-0: 0 faded, all at 1.0).
  See `depth-state.json` → `yaws[].depthState.suspect` (30 entries/yaw, all `room-shell-wall-upper`).
- **Why not a proven defect here:** the only things a depth-writing translucent wall could wrongly
  occlude are *other transparent* objects drawn behind it later in the transparent queue. At these four
  yaws nothing transparent sits behind a faded upper band in a revealing configuration (the figures are
  opaque-pass and draw first; the background behind a faded band is just the clear-color void), so the
  incorrect occlusion never becomes visible. It is a real trade-off for a material that transitions
  between opaque and translucent (three.js convention would toggle depthWrite with opacity, or use
  bounded render order / polygon offset), and a fair thing for P3-3 to consider — but it is **latent**,
  not a reproduced artifact, so it is deliberately kept out of the proven-defect table above.

## Bottom line

At the four fixed yaws, on the oss kernel, this scene has **zero proven visible depth-state defects**.
The three §7.1 transparency classes are correctly configured (cutouts keep depth writing; additive FX
disable it; the one contact-shadow normal-alpha disc disables it). The single mechanical flag — the
wall-upper occlusion material keeping `depthWrite=true` while fading — is a **latent** condition with no
reproducible visible symptom in these captures, handed to P3-3 as input rather than asserted as a fix
target here.
