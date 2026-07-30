# Lane 2 — Geometry and environmental shape language

Answers §5.3. Anchored on the twelve-packet cohort (plates in
`local-analysis-plates/packets/`), the 121-map breadth corpus, IC comparison frames, TS
frames (corpus inventory), and the current Genesis captures.

## 2.1 Major silhouette masses per frame (§5.3 Q1)

Counted on the cohort (silhouette plates, panel 4):

| map | masses that carry the frame |
|---|---|
| Mandalia | 3 (two rock clusters + field swell) |
| Grog Hill | 3 (two shoulders + road cut) |
| Sweegy | 2 (wooded hill + floor) — pines are punctuation, not masses |
| Zirekile | 3 (two banks + bridge span) |
| Zeakden | 3 (fort block + snowfield + trench line) |
| Dorter | 4 (three building blocks + plaza slope) |
| Igros | 3 (wall/gate mass + causeway + forecourt) |
| Orbonne | 3 (church mass + lawn slope + terrace) |
| Goug | 3 (two roof stacks + street gully) |
| Book Storage | 3 (two shelf ranges + floor w/ breach) |
| Bervenia | 4 (street + two terrace stacks + tower) |
| Windmill Int | 2 (room shell + machine centerpiece) |

**2–4 everywhere.** The grammar-study hypothesis ("two to four meaningful masses") is
confirmed across an independent cohort and can graduate from hypothesis to calibrated rule
for the composition compiler's scorer.

## 2.2 Mass size relative to a cell (§5.3 Q2)

Measured against the 28 px/tile grid: dominant masses occupy **9–40+ cells of footprint**
(Grog's west shoulder ≈ 3×4; Igros's wall ≈ 10×2×tall; Orbonne's church ≈ 5×6). Meaningful
FFT terrain "ideas" are never single-cell; single-cell relief exists only as *steps within*
a mass. Genesis translation: the compiler should think in mass footprints of ≥6 cells and
treat 1-cell bumps as noise to reject (matches the anti-cell-noise rule already in
BATTLEMAP-TOWNTRAY §6 Pass 2).

## 2.3 Where geometry is real vs painted (§5.3 Q3)

- **FFT:** route/cover/height relations are ALWAYS real geometry (tiles have height; the
  h-unit is mechanical). Paint carries material identity + micro-detail (brick courses,
  grass tufts painted into tiles, water sparkle). The split is strict: nothing tactical is
  painted-only; nothing painted creates affordance. The one systematic illusion: vertical
  faces are often painted with detail (masonry courses) that has no geometric relief.
- **TS (documented + frames):** same split at higher fidelity — 3D polygon terrain with
  hand-dotted textures (Morimoto). Slopes exist as real geometry; roof tiers are real;
  water is a real plane with shader. Painted detail rides on real forms.
- **IC (frames):** identical geometry to FFT with repainted faces — the remaster did not
  re-model; it re-dressed. (Direct evidence in the Zeirchele and waterway frames: tile
  steps and bridge arcs unchanged from the five-angle originals.)
- **Genesis:** the same law is canon (geometry owns shape; sprite/material supplies
  surface; decals are strict-projection marks). CL-F05/CL-R4b already honor it.

## 2.4 Thickness (§5.3 Q4)

Observed across cohort + IC frames: FFT walls read **0.5–1 cell thick**; parapets ~0.25
cell; bridge decks ~0.25–0.5 cell of visible depth; stairs = full-cell treads with real
risers; roofs have visible eave depth (~0.2 cell). Nothing is paper. Genesis: prototype
wall = 0.32 u (≈1.6 ft) with crown law making thickness legible from above; doorway depth
0.32 u honest reveal. **Genesis's current walls are proportionally thinner than FFT's
typical masonry read**; the crown + stub laws compensate by showing the top face. Worth one
capture-side look at 0.4–0.5 u walls for fortress-grade masses (experiment candidate E-5;
proposal only).

## 2.5 Natural/constructed joins (§5.3 Q5)

The cohort's four join types, all causal:
1. **retaining** — masonry holds a terrain step (Grog, Yardow, Orbonne terrace);
2. **footing** — walls grow from rock shelves; foundations follow slope (Zaland, Zeakden);
3. **cut** — road/water slices through mass with dressed faces (Grog's rock cut, Goug);
4. **spill** — rubble/scree transitions at mass edges (Zirekile banks, ruins maps).
Genesis's terrain program names the same family (causal built breaks in the
natural-surface review; retaining curbs in CL-F05). The join vocabulary is aligned; what
the engine lacks is only breadth of realized cases (one retaining family so far).

## 2.6 Vertical-face breakup (§5.3 Q6)

FFT breaks tall faces with: course-line texture, inset door/window reveals, buttress steps,
banner drops, and moss/stain paint — never geometric greebling. TS adds real balconies,
timber frames, and eave shadows (frames). IC repaints courses at higher frequency.
**The economy lesson: faces are broken by *texture rhythm + a few real insets*, not by
geometry density.** Genesis's trim-role system (base course, cornice, jamb, coping) is
exactly this instrument and is already proven in CL-F05.

## 2.7 Camera-safe interiors and cutaways (§5.3 Q7)

- FFT: interiors are roofless dioramas (Book Storage, offices — walls but no ceilings);
  multi-story interiors shown by floor-swap, not cutaway. Some exterior maps suppress
  near-side architecture per bearing (MAP098-class, per prior study; not re-verified this
  pass).
- Matsuno/Ito (1997, primary): rotation exists partly to see behind buildings — the
  information function of rotation.
- TS: rotation + zoom carry the information function; interiors largely roofless or
  open-sided in battle frames.
- **Genesis:** fixed camera + compile-time camera-side omission + 1-ft stubs + latched
  staging + strategic-view-all-walls — the information function is solved *without*
  rotation, which is precisely the translation the 1997 quote demands. Verified working in
  CL-F05/CL-R4b captures.

## 2.8 Beveling and irregularity at gameplay scale (§5.3 Q8)

FFT tiles bevel only where terrain type demands (rounded earth, rock knuckles); masonry
stays crisp-edged. Silhouette irregularity comes from *plan-shape* (jagged map boundary,
stepped masses), not from jittered edges. TS keeps crisp architectural edges under painterly
texture; its organic terrain rounds more. Genesis's low-poly language (few large planes,
crisp edges, faceted rock) is inside the corpus register; the natural-surface default adds
the missing organic rounding for landform.

## 2.9 Modularity evidence (§5.3 Q9)

Visible reuse across the 121-map corpus: stair blocks, parapet runs, door/gate frames,
crate/barrel props, tree sprites, roof modules, fence posts recur across towns; terrain
tilesets recur across wilderness maps of a region. Bespoke: hero landmarks (Orbonne's
church, Riovanes' roofline, the Colliery machinery, Bervenia's towers). **Ratio read:
routine construction is modular; identity is bespoke.** Genesis mirrors this as kit
components + hero MODEL_RECIPE/Meshy donors — same split, already ruled.

## 2.10 PS1 constraints vs durable choices (§5.3 Q10)

| feature | 1997 constraint? | durable art direction? |
|---|---|---|
| small boards | partly (60fps cursor UI — Matsuno, primary) | YES — pacing + diorama legibility (Ito's miniature garden) |
| few broad masses | partly (poly budget) | YES — readability; TS keeps it at 100× the budget |
| painted face detail | yes (texture budget) | YES in register — TS/IC still paint detail rather than model it |
| black void edge | yes (nothing to render beyond) | NO — superseded by TS/IC's context fields; the one place FFT should not be imitated (lane 6) |
| blob shadows | yes | NO — modern grounding (contact+cast) is strictly better and Genesis has it |
| roofless interiors | partly | YES — the diorama read requires open tops; Genesis's omission grammar extends it |

## 2.11 Genesis geometry translation table (§ lane deliverable)

| corpus pattern | Genesis owner (existing) | status |
|---|---|---|
| 2–4 mass composition | TacticalCompositionPlan Pass 1/2 | specced, unbuilt (C1H gate) |
| mass ≥6-cell footprints, no cell noise | Pass 2 scorer | specced |
| causal joins (retain/foot/cut/spill) | terrain program + trim system | partially proven (CL-F05, natural-surface) |
| texture-rhythm face breakup + insets | trim roles + material parents | proven at bench scale |
| roofless/omitted camera-side interiors | compile-time omission + stubs + crown | proven in clay |
| modular routine + bespoke identity | kits + Meshy donor lane | ruled, in production |
| real-geometry affordances only | mechanics-first prop floor | ruled |
| plan-shape irregular board edges | composed-edge grammar (grammar study §8) | specced; visible in scale-pass targets |

## 2.12 Findings

```text
FINDING L2-1
Claim: The 2–4 broad-mass rule holds across an independent 12-map cohort and can be
       promoted from hypothesis to compiler scoring rule.
Evidence: silhouette plates, all 12 packets (paths in CORPUS-INVENTORY)
Evidence class: direct frame (measured/counted)
Confidence: high
Genesis translation: encode as Pass-2 soft goal (2–4 masses, dominant+supporting ranked)
       with licensed-symmetry exceptions.
Solo-cost class: renderer multiplier (compiler rule)
Decision status: research finding only
```

```text
FINDING L2-2
Claim: FFT's board size was constrained by 60fps cursor UI (documented), then kept as
       diorama aesthetics (documented) — it is not an accident to outgrow but a discipline
       that survived a 100× budget increase into TS.
Evidence: Matsuno + Sakaguchi + Ito, 1997 Famitsu (shmuplations translation, local copy)
Evidence class: developer statement
Confidence: high
Genesis translation: the vignette ruling stands on the same two legs (pacing + diorama
       legibility); H7 SUPPORTED from this lane.
Solo-cost class: n/a (doctrine)
Decision status: research finding only
```
