# DIEGETIC-LIGHT — light & sight, take 2 (darkness is gameplay)

type: system-spec
status: SPECCED (Opus 4.8, 2026-07-11 — from Adam's ruling on the BW4 env-rolls gallery. Adam
steered both forks: **F1 = remove the cone behind a reversible flag**; scope = **the whole wave now +
re-shoot**. Grounded against the current tree; execute exactly.)

## The doctrine (Adam, 2026-07-11)
Lights are **diegetic** (a visible in-world source — torch, lamp, lava, sun). Ambient is **only
enough to make out figures**; beyond a source's reach it's **dark**, and darkness is a gameplay
element (it's what makes light spells / torches / lamps worth carrying). **Shadows react to the
diegetic sources, not the ambient/fill.** The warm-key look already landing stays; the MODEL under it
changes. Full ruling: memory `feedback-genesis-diegetic-lighting`.

## Current state (grounded)
- `LIGHT_PROFILES` (theater-boot.js:4655) — each profile = one low `ambient` (0.3–0.55) + `points`
  (diegetic-positioned PointLights, intensity 7–22). `applyLightProfile` (~4740) mounts them.
- The **visible cone** — `interiorBuildLightCone(light,height)` (~6196), a camera-facing gradient
  billboard apexed at the flame/lamp; mounted per light (~6277-6288), stored `t.cone`.
- **Shadows** — a single **camera-key** shadow-casting DirectionalLight (BW2-4b item 2, ~4791-4828,
  `ITR_CAMERA_KEY_INTENSITY`), aimed from the camera. NOT from the diegetic point.
- **Occlusion** — a **cutaway** (drop camera-side pillars/walls to a knee height:
  `itrPillarCutawayMask` ~7613, wall cutaway ~7569) driven by `occlusionCameraPos` (~7409). Walls +
  pillars are `InstancedMesh` (U3: ≤1 draw call/kind), so it drops instances by height rather than
  fading them.

## FORKS (RESOLVED by Adam 2026-07-11)
- **F1 — the visible cone → REMOVE (behind a reversible flag).** Kill the god-ray cone; keep only the
  emissive flame/glow marker at the source + the point light's real falloff. Gate defaults to
  no-cone; the flag is one-line reversible if the re-shoot looks bare. (See L-1.)
- **F2 — ambient floor → drop it, then tune from the re-shoot.** Drop each profile's ambient ~30–40%
  and let the diegetic point be the read; RE-SHOOT and let Adam dial the exact floor from the image.
  Bright profiles are the exception (L-4). This is why every taste value below ships reversible.

## Units

### L-1 — KILL/GATE THE CONE (F1)
Gate `interiorBuildLightCone`'s mount behind a flag (default: no cone). Keep the emissive flame/glow
marker at the source (that IS the diegetic "where light comes from"). Verify: cone-mesh count 0 with
flag off; the BW3-4 cone regression harness (`dev/verify-bw3-4-light-shafts.mjs`) updated (red-first)
to the gated shape, not deleted.

### L-2 — DIEGETIC SHADOWS
Shadows cast **from the diegetic point-light position**, not the camera-key. Retire/​reduce the
camera-key shadow DirectionalLight; enable shadow-casting on the profile's primary point light (or a
shadow-caster co-located with it). Shadows then fall *away from the torch/lamp*, moving as the source
does. Verify: a fixture with a known point position asserts shadow direction points source→figure→away
(not camera→figure); shadowMap stays enabled on interior boards.

### L-3 — AMBIENT FLOOR + REAL FALLOFF (F2)
Tune `LIGHT_PROFILES` ambient down to a readability floor; ensure point `distance`/`decay` produce
genuine darkness at room edges (darkness as element). Verify: a mid-room figure stays legible (a
luminance sample above a floor at the figure), a far corner falls below it (darkness is real).

### L-4 — BRIGHT-REALM HEMISPHERE (fixes daylit lost-world)
daylit / overcast / moonlit get a `HemisphereLight` (sky/ground) so a sunlit realm reads BRIGHT — the
sun is ITS diegetic source. These profiles stop using the dim single-point dungeon model. Verify:
daylit lost-world's mean frame luminance is well above a torchlit crypt's (the inversion Adam caught
is gone); a re-shoot of the env-rolls gallery confirms.

### S-1 — OCCLUSION FADE (separate code path; can run in parallel with L-*)
Occluders (walls AND pillars) between camera and ANY figure go **translucent** rather than being
cut to a knee. Because the geometry is `InstancedMesh`, this needs a per-instance alpha path (a
per-instance opacity attribute + a small shader tweak, or a separate translucent overlay pass for the
occluding instances) — heavier than the current instance-drop cutaway; scope it as its own unit.
Keep a cutaway fallback for anything the fade can't reach. Verify: a figure behind a column/wall from
the camera stays visible (a luminance/silhouette sample at the figure's screen rect proves it reads
through the faded occluder); non-occluding geometry stays fully opaque.

## Order + vehicles
S-1 is independent (occlusion path) → its own executor. L-1..L-4 all touch the light rig
(`applyLightProfile` / `LIGHT_PROFILES` / the cone + shadow builders) → ONE executor as a coherent
lighting-model change (parallel light-rig edits would just merge-conflict). After both land: RE-SHOOT
`dev/battle-gate/capture-env-rolls.mjs` and put the gallery in front of Adam (mocks-propose-laws-
dispose). Everything reversible (cone flag, ambient numbers) so Adam tunes from the image.

## Out of scope
The volumetric/god-ray aesthetic as a per-realm option (parked); exterior/overworld lighting; any
change to the sprite art or the warm-key grade Adam approved.
