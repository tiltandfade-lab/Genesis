# Lane 3 — Materials, pixel texture, palette, and surface history

Answers §5.4. Quantitative backbone: `local-analysis-plates/value-stats.json` (HSV value
percentiles + mean saturation, black-void excluded, thumbnail scale — small bright accents
do not move p98; method caveat recorded).

## 3.1 What environment surfaces ARE, per game (§5.4 Q1)

- **FFT:** pixel-authored tile textures on stepped geometry; painted detail carries almost
  everything (courses, moss, stains); no material response beyond baked shading.
- **TS (documented, primary):** hand-dotted textures applied to 3D polygons (Morimoto);
  "accurate HD-2D" = deformed pixel base art first, realistic effects built up (Asano).
  Real lighting response on top of dotted albedo; water is a live shader surface.
- **IC Enhanced (documented + observed):** redrawn painterly-pixel albedo on the original
  boards; sprites read as "subdivided" original pixels; a paper-grain texture overlays the
  whole frame (RPG Site, quoted in `local-captures/ic-notes.md` C7) — a deliberate
  handcrafted/tabletop cue on top of everything.
- **Genesis:** sprite-first material parents (approved at 1.65 m/tile) with MM-derived
  height/normal/ORM; procedural projection UVs; decal register ruled naturalistic.
  **Construction matches the TS order of operations by ruling** — pixel base, effects up.

## 3.2 Texel frequency vs cell and sprite (§5.4 Q2)

- FFT renders: 28 px/tile; sprite limbs ~2–4 px — texture and figure share one frequency.
- TS: environment dot density visibly coarser than sprite dots but same *family*
  (observed; exact ratio unmeasurable from captures — declared).
- IC: higher-frequency repaint, sprites subdivided to keep kinship (documented C7).
- Genesis: approved masonry at 1.65 m/tile ≈ FFT's brick-per-tile rhythm (CL-R4b receipt);
  sprites NearestFilter texels. The *approved bench* matches the corpus; the *terrain
  register* (clay) has no texture at all yet — the frequency question is unanswered
  in-engine outside the bench (honest status).

## 3.3 Material families per frame (§5.4 Q3)

Counted (plates panel 7 + frame reads): FFT cohort 3–5 · TS canal-night ~6 (cobble, cut
curb, brick, timber, water, foliage) · TS wheat terraces ~4 · IC waterway ~5 · Genesis
CL-F05 3–4 · Genesis targets 3–5. **Everyone lives in the 3–6 band.** The "few broad
material families" law in the Golden-Site grammar is corpus-normal, not a Genesis
austerity.

## 3.4 How adjacent materials separate (§5.4 Q4)

- FFT: hue+value blocks with hard tile borders; trim courses painted.
- TS: value + real roughness response (wet stone vs dry cobble reads by specular), plus
  geometry trim (curbs, edging stones) and painted transitions.
- IC: as FFT plus grade-driven depth separation.
- Genesis: parent swap + six semantic trim roles (proven in CL-F05); multiply-grid overlays
  read on top. **Aligned; Genesis's separation instrument (trim roles) is the corpus's
  main one.** Roughness-response separation becomes available exactly when materials leave
  the bench (ORM channels already exported).

## 3.5 Albedo vs lighting vs decals (§5.4 Q5)

Corpus split: FFT ≈ 90% albedo / 10% baked shade · TS ≈ albedo-dominant with real
light/atmosphere doing scene-state work · IC ≈ albedo + grade. Nobody's base art is weak
under the post (see 3.9). Genesis's current engine register inverts this: **lighting is
strong, albedo is absent** (clay) — the exact opposite imbalance; the fix direction is
unambiguous (materials pass, not more post).

## 3.6 Wear and history localization (§5.4 Q6)

Observed: TS grime sits at waterlines, moss at fountain feet, path-centers polished;
FFT paints moss at wall bases and stains under overhangs; IC repaints the same logic
denser. Nothing anywhere is uniform noise. **Genesis's ruled causal decay stack (water
flow, traffic, repair-as-overlay) is the systemic generalization of exactly what the
corpus hand-paints** — the study found no counterexample to the causal rule anywhere.

## 3.7 Usable value range (§5.4 Q7) — measured

| frame | p2 | p50 | p98 | satMean |
|---|---|---|---|---|
| FFT Grog (day) | 17 | 56 | **100** | 60 |
| FFT Orbonne (day) | 11 | 46 | **100** | 63 |
| FFT Zeakden (snow) | 20 | 77 | **100** | 26 |
| TS wheat terraces (day) | 13 | 62 | **91** | **78** |
| TS snow fortress | 9 | 69 | **91** | 48 |
| TS canal (night) | 8 | 26 | 71 | 53 |
| TS Wolffort deploy | 11 | 36 | 73 | 60 |
| IC waterway (4K) | 8 | 52 | 94 | 54 |
| IC Agrias gameplay | 8 | 43 | 85 | 41 |
| **GEN CL-F05 (day, engine)** | 9 | 41 | **71** | **20** |
| **GEN natural-surface (engine)** | 7 | 22 | **75** | 31 |
| **GEN target site-09** | 12 | 45 | **57** | **17** |
| **GEN target site-10** | 13 | 47 | **69** | 29 |

**The headline gap:** every reference *daylight* frame claims p98 ≥ 85 (FFT hits 100);
Genesis's daylight engine frames and even its target renders top out at 57–75 — Genesis
daylight currently peaks where TS's *night* peaks. Chroma tells the same story: reference
environments run satMean 41–78; Genesis environments run 17–31 (sprites alone run 65).
Part of this is deliberate register (adult grim, muted realms) and part is measurement
caveat (UI panels, neutral-gray backdrops in-frame) — but the absence of *any* near-white
highlight anchor in any Genesis frame is real, visible, and cheap to fix (sun-keyed
highlight headroom on materials + one white-anchor accent per scene), and it is exactly
what makes the corpus frames "pop" at thumbnail scale.

## 3.8 Saturation hierarchy (§5.4 Q8)

Same law in all three games, measured and observed: **units > focal accents (flowers,
banners, fire) > terrain > far context.** Genesis already obeys it (saturated sprites on
muted stages); what it lacks is the *middle* rung — saturated focal accents (the canal
frame's flower bed, Wolffort's awnings, FFT's banners). One accent family per scene is a
cheap composition multiplier and is already licensed by canon (narrative-emphasis
channel in the material recipe formula).

## 3.9 Does TS survive neutral light? (§5.4 Q9) — the ablation exists

The first-party Classic/Enhanced same-camera pairs (Orbonne gate, Zeirchele Falls) are a
shipped A/B: identical boards, camera, and composition; Classic ≈ near-neutral 1997
presentation. Classic remains composed and readable (it carried the game for 28 years);
Enhanced adds depth cues, softer grade, richer albedo. Conversely the Game8 deploy renders
(flat, guide-captured lighting) still read beautifully — **base art carries; post
amplifies. `SUPPORTED`: beauty is not post-carried in this corpus** (feeds H2/H6).

## 3.10 Surface rules Genesis can generate from facts (§5.4 Q10)

Measurable rules, each derivable from the charter's semantic recipe
(`material family + construction + culture + realm + age + condition + moisture + damage +
magic + emphasis`):

1. **Texel law:** environment texel rhythm within ±25% of the approved 1.65 m/tile band;
   sprites always ≥1 octave denser. (Verifiable per capture.)
2. **Family budget:** 3–6 broad families per scene; extras must enter as decals/trim, not
   new parents. (Countable.)
3. **Value ceiling claim:** daylight scenes must place ≥1 material face in the top value
   decile (sun-keyed); night scenes reserve the top decile for practicals/accents.
   (Histogram-checkable — the exact check the current frames fail.)
4. **Saturation ladder:** units > one licensed accent family > terrain > context, with
   realm palette bounds. (Measurable per band.)
5. **Causal wear only:** every wear/grime/moss decal binds to a source fact (water route,
   traffic field, age band) — no global grunge pass. (Receipt-checkable; already ruled.)
6. **Palette handshake:** terrain material ramps sample from the realm master palettes so
   sprites and ground share anchors. (Diffable against palette JSONs.)

## 3.11 Findings

```text
FINDING L3-1
Claim: Genesis's visible material gap is not post or geometry but the unclaimed top of the
       value range plus environment chroma — measured 15–43 p98-points below reference
       daylight frames, at roughly half the corpus's environment saturation.
Evidence: value-stats.json table above; frames cited per row.
Evidence class: direct frame (measured); register caveats recorded
Confidence: high (direction), medium (exact magnitudes — mixed frame content)
Genesis translation: add the value-ceiling and accent-family rules (3.10 #3–4) to the
       materials pass acceptance gates; zero new systems required.
Solo-cost class: renderer multiplier (acceptance rule + material tuning)
Decision status: research finding only
```

```text
FINDING L3-2
Claim: "Accurate HD-2D" construction order (pixel base first, effects build up) is
       documented by its originators and matches Genesis's sprite-first ruling; the
       corpus's beauty survives neutral light because the base art is strong.
Evidence: Asano 4Gamer; Morimoto ndw.jp; first-party Classic/Enhanced pairs; Game8 flat
          renders.
Evidence class: developer statement + direct frame
Confidence: high
Genesis translation: proceed with the materials-to-production pass exactly as ruled;
       reject any proposal that leads with post to compensate for clay.
Solo-cost class: reusable asset/system
Decision status: research finding only
```
