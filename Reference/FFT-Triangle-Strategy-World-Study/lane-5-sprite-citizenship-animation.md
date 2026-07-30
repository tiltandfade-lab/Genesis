# Lane 5 — Sprite citizenship, animation, and readability

Answers §5.6. Primary sources this lane leans on: the ndw.jp Morimoto pixel-art interview
(fetched full-text to `local-captures/sources/_raw_ndw.txt`; Japanese, read directly),
the Octopath II Unreal interview (as already quoted in `docs/SPRITE-BILLBOARD-RESEARCH.md`),
the Destructoid Asano/Arai interview (fetched), the FFT five-angle corpus, Ivalice
Chronicles frames, and the Genesis CL-R2 sprite-citizenship captures.

## 5.1 How each game makes sprites belong

### FFT (original)
- **Observed:** environment and units share one palette register and one pixel density;
  units are slightly denser (smaller pixels-per-limb) than terrain texels but read as the
  same substance. No outline; anti-aliased edges into the scene. Shadows: simple dark
  ellipse blobs under units (documented gameplay; visible in gameplay frames).
- **Documented:** unit sprites are authored in front and back three-quarter poses and
  engine-mirrored for the opposite facings — the four-rotation camera never sees a face the
  sheet didn't draw.

### Triangle Strategy
- **Documented (Morimoto, primary):** characters are entirely hand-dotted; *environment
  textures are also hand-dotted* and applied to 3D polygons by Artdink — sprite and world
  share pixel DNA by construction. That is the single most load-bearing citizenship fact in
  the corpus: **the match is authored into the textures, not post-processed in.**
- **Documented (Morimoto):** sprites sit under scene lighting — lighting shading applies to
  the dots, enough that pure white reads overexposed and palettes were adjusted around it.
  Original dots still carry painted shadows. (This nuances Octopath II's "flat sheets of
  paper" framing: by TS, sprite pixels demonstrably participate in scene light/grade.)
- **Documented (Morimoto):** the full-rotation camera forced 8-direction turnaround checks —
  and **only four protagonists (Serenoa, Roland, Frederica, Benedict) received 8-direction
  graphics; everyone else has fewer, for schedule/cost reasons.** The camera's sprite bill
  was real and was *paid selectively even by Square Enix.*
- **Documented (Morimoto):** animation economics — base poses are drawn once, then each
  character's costume is redrawn over the base: every added generic pose multiplies across
  the cast; most animation was outsourced (Hecatoncheir) under supervision; class-change
  adds a costume variant per character; the hawk's quarter-view angles were "very difficult."
- **Documented (Asano, Destructoid):** balancing free camera movement against "characters
  created by dots" was the named development challenge, credited to Artdink.

### Ivalice Chronicles (Enhanced)
- **Observed (frames):** redrawn sprites keep original proportions and pose vocabulary with
  cleaner edges and richer ramps; environment albedo redrawn to a painterly register that
  keeps texel-scale kinship with the sprites; unit shadows remain simple; DoF and grade
  wash sprites *with* the scene (they do not float).

### Genesis (current)
- **Observed (CL-R2/CL-R4b captures):** static pixel standees on shallow rounded-strip
  bases; Lambert-lit with emissive readability floor; alpha-tested silhouette cast shadows
  (sprite plane is sole caster); multiply contact shadows; camera-facing fill light
  (shadowless) for face readability; selection = emissive base sidewall; presentation scale
  1–30 ft with true-scale check; size ladder holds bug→kraken in one frame.
- **Canon:** eye-level sprite perspective law; per-realm palettes (32–48 colors) + outline
  law; CLEAN-SHAPES (judged at 50% zoom); single static standee per figure, emotes reserved
  for bosses/PCs; warp/DM-hand motion instead of frame animation.

## 5.2 The direction-count ladder (the money table)

| game | drawn facings per unit | camera regime | who pays |
|---|---|---|---|
| FFT | 2 drawn (front/back ¾), mirrored to 4 | 4 fixed yaws, 2 zooms | modest sheet cost per unit, paid once in 1997 |
| Triangle Strategy | 8 for four protagonists; fewer for the rest | free-ish rotation + top view + zoom | large; explicitly rationed by the developer |
| Ivalice Chronicles | as FFT (re-drawn) | as FFT | remaster redraw cost |
| **Genesis** | **1 static standee** (+licensed emotes) | **one fixed production yaw** | near-zero marginal per figure — 896 sprites already live |

**Finding L5-1 (high confidence, documented + observed):** sprite-direction cost scales
with camera freedom, superlinearly once rotation is free. Genesis's fixed camera plus
single-facing standees is not a compromise TS avoided — it is the same rationing decision
TS made (four characters deep), taken to the solo-viable limit. The billboard tilt-back rig
means the one facing always reads correctly, which is precisely what FFT's mirroring and
TS's 8-direction sets spend art to achieve.

## 5.3 What grounds feet

- FFT: blob shadow + tile snap. TS: contact shading + tile snap (observed in frames).
  IC: as FFT with softer blob.
- Genesis: base strip + linked soft contact shadow (multiply, extends past support) + cast
  silhouette shadow + oriented-box base separation. **Observed:** in CL-R2 dark production,
  feet-ground contact reads at contact-sheet scale. This is already at-or-past the model
  games' grounding vocabulary; the remaining gap is not grounding but **environmental
  keying** (below).

## 5.4 Where Genesis actually trails (the honest audit)

1. **Shared pixel DNA with the floor.** TS's citizenship is authored: dotted environment
   textures. Genesis's CL-R4b/CL-R5 masonry parents are MM-derived from sprite-first albedo
   — the right instinct, already ruled (SPRITE-FIRST MATERIAL AUTHORING) — but only two
   parents are approved and no terrain material is production-routed yet. The clay terrain
   register (monochrome) currently hosts crisp sprites on un-pixel ground: the mismatch the
   pixel-canon materials pass exists to close.
2. **Palette handshake.** TS adjusts sprite palettes for the lit context (the white-pixel
   lesson). Genesis quantizes sprites to realm palettes but terrain materials do not yet
   share those ramps; the realm-grade post pass approximates the handshake from the other
   end. Worth one experiment (E-3 in synthesis): sample terrain material ramps from the
   realm palette JSONs.
3. **Animation presence.** TS spends heavily here (outsourced studio + supervision).
   Genesis's canon answer (warps, DM-hand movement, receipt-driven board animation) is the
   correct solo translation; the CL-R2 captures show statics reading as "placed minis,"
   which the tabletop frame legitimizes. **Do not import frame animation** — it is the
   single most cast-multiplying cost in the entire corpus (Morimoto's "one more generic
   pose" groan is the receipt).

## 5.5 Answers to §5.6's ten questions, compressed

1. Scale/density/palette matched by authoring (TS) or shared register (FFT); Genesis via
   sprite-first materials (partial) + realm palettes + NearestFilter texel law.
2. Scene lighting on sprites: TS yes (documented); FFT n/a (baked register); IC yes (grade/
   DoF); Genesis yes (Lambert + emissive floor + grade) — validated ahead of documented
   shipped baseline.
3. Feet grounding: blob/contact/tile-snap everywhere; Genesis adds base strip + silhouette
   cast shadow.
4. Directions: 2-mirrored-to-4 (FFT) · 8-for-four-else-fewer (TS, documented) · 1 (Genesis).
5. Rotation handling: FFT mirrors; TS rations; Genesis's fixed camera removes the category.
6. Anti-disappearance: FFT/TS separate units by value + palette temperature against ground
   (observed); Genesis: outline law per realm + camera fill + emissive floor; snow/fire
   realms untested (no snow environment exists — declared gap).
7. Sprite bakes identity/pose/shadow-side; renderer adds light response, grade, contact,
   cast shadow (all four games agree on this split; TS pushes more into the renderer).
8. Animation contribution: high in TS (and priced accordingly); FFT modest (walk/attack
   loops); Genesis: motion lives in warps/receipts — polish target is *event legibility*,
   not idle life.
9. Essential vs flourish: essential = facing changes, attack/hit beats, death removal;
   flourish = idle sway, cats (TS's literal outsourced cats).
10. Genesis retention: crisp statics + base/contact/cast grounding + realm palette + one
    fixed camera already produce belonging in the strongest captures; the remaining lift is
    material-side (shared pixel DNA), not sprite-side.

## 5.6 Findings

```text
FINDING L5-2
Claim: TS's sprite/world unity is authored (hand-dotted environment textures on 3D), not an
       effect; the post stack refines an already-matched pair.
Evidence: Morimoto interview (primary, full text in local-captures/sources/_raw_ndw.txt)
Evidence class: developer statement
Confidence: high
Genesis translation: the sprite-first material law is the same move; finishing the
       materials pass (routing approved parents + realm-palette ramps to terrain) is the
       highest-leverage citizenship work left — not a new sprite treatment.
Solo-cost class: reusable asset/system (per material family, amortized)
Decision status: research finding only
```

```text
FINDING L5-3
Claim: Free camera rotation is the sprite-cost multiplier; even TS rationed it to four
       8-direction characters.
Evidence: Morimoto (primary); Asano (primary); FFT mirroring structure (documented)
Evidence class: developer statement + documented
Confidence: high
Genesis translation: the fixed-camera ruling already banks this saving (~8x facing art
       avoided per figure across 896 live sprites); H5 SUPPORTED from this lane.
Solo-cost class: cost avoided
Decision status: research finding only
```
