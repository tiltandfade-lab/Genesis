# Lane 8 — Production economy and the solo translation

Answers §5.9. Rule honored throughout: no staffing/budget inference from appearance —
production claims below are **documented** (named source) or declared unknown.

## 8.1 Documented production facts (the receipts)

| fact | source | class |
|---|---|---|
| TS maps had to "look good from all angles" because tactics needs 360° rotation | Asano, 4Gamer (NE translation; full text in `local-captures/sources/`) | developer statement |
| "It took a lot of resources to make the map observable from all sides"; map-EDGE treatment was an early, long design discussion | Arai, 4Gamer | developer statement |
| HD-2D "accurate" method: pixel-art base art first, realistic effects built up on top; photoreal-reduced-down rejected ("simply lowering the image quality") — Artdink chosen for this | Asano, 4Gamer | developer statement |
| Deformation line is deliberate: realistic proportions → smaller pixels → "illustration, not pixel art" | Asano, 4Gamer | developer statement |
| Camera-vs-dots balance was the named challenge; Artdink credited | Asano, Destructoid | developer statement |
| Only 4 protagonists received 8-direction sprites (schedule/cost); rest have fewer | Morimoto, ndw.jp | developer statement |
| Every added generic pose multiplies across the whole cast (costume-over-base workflow) | Morimoto, ndw.jp | developer statement |
| Most sprite animation outsourced (Hecatoncheir) under supervision | Morimoto, ndw.jp | developer statement |
| Environment textures hand-dotted by Artdink onto 3D polygons; HD-2D effects also Artdink | Morimoto, ndw.jp | developer statement |
| Sprite total: artist "can't remember — an enormous number" | Morimoto, ndw.jp | developer statement (no number exists) |
| FFT sprite sheets: 2 drawn facings mirrored to 4 | community sprite-sheet documentation | documented |
| FFT 1997 team discussed map/battle design constraints of the quarter-view | shmuplations Famitsu translation (agent-fetched; see SOURCE-LEDGER) | developer statement |
| Overall TS staffing/budget | — | **unknown; not inferred** |

## 8.2 Per-map authored work vs renderer multipliers (§5.9 Q1-2)

**Per-map authored (the model games):**
- FFT: every board is bespoke geometry+texture (121 shipped) — small enough that bespoke
  was affordable in 1997; zero reuse pressure visible between maps beyond texture families.
- TS: bespoke boards with hand-dotted texture work, camera-safe from all bearings + edge
  treatments (the Arai cost), plus per-scenario interaction wiring (Wolffort's packable
  market exists once).
- IC: full redraw of FFT's boards (a remaster-scale art pass).

**Renderer multipliers (paid once, apply everywhere):**
- TS/IC: lighting, DoF, grade, water, particles, fog — the "build it up" effects layer.
- Genesis already owns most of this class: lit sprites, tilt-shift DoF, selective bloom,
  per-realm grade, fog whisper (BW3 suite, measured 125–165 fps), contact/AO treatments,
  celestial profiles, torch recipes, camera-side omission, multiply grid.

**Genesis's structural advantage:** its boards are *compiled, not authored* — the entire
per-map column converts to per-FAMILY costs (material parents, trim sheets, kit components,
context plates). The corpus's bespoke-per-map economics never applies; the risk inverts
into coherence (making compiled output read as composed — lane 9's subject).

## 8.3 What depends on 360° coverage (§5.9 Q4) — the avoided bill

Documented TS costs Genesis's fixed camera deletes outright:
1. all-bearing map beauty (Arai's "a lot of resources");
2. map-edge treatment × four bearings (Arai's early-development debate);
3. 8-direction sprite sets (Morimoto's ration);
4. camera-safe occlusion/readability QA per bearing;
5. hidden-face modeling/texturing.
Genesis retains: one production bearing + optional strategic top view (all walls render
there — already ruled), plus diagnostic yaws that need no beauty. **This is the study's
largest single economy finding and it is already banked by canon (W3 §12.13).**

## 8.4 Buckets (§5.9 Q8-10)

### MUST HAVE (already ruled or existing; keep investing)
- sprite-first material authoring → route approved parents into production scenes
- few-broad-masses composition compiler (TacticalCompositionPlan) — the FFT lesson as code
- fixed-camera + omission grammar (built, clay-proven)
- post suite + grade (built) · practical-light recipes (built)
- mutation channels 1–3 (decal / attachment / instance material override) — the wedge

### HIGH LEVERAGE (cheap relative to visible return)
- context apron + far-field plates (Band 1/3 of the ruled projection contract) — TS's
  worldfulness at plate cost, no acreage
- realm-palette handshake between terrain materials and sprites (one build script pass)
- trim-sheet breadth on the proven six-role pipeline (per-culture variants)
- value-hierarchy targets per scene (grayscale-test gate in capture review)

### EXPENSIVE / LATER
- structural-state families (mutation channel 4) beyond doors/braces — after the battle spine
- companion channels for sprites (normal maps) — after materials pass; test on 3–5 sprites
- context Band 2 (mid-field settlement fabric geometry) — after Band 1/3 prove the read
- EngagementLens expressive animation breadth (canon: mandatory for pre-alpha battle, but
  breadth = one representative family first)

### DECLINE (admired, and refused with reasons)
1. **Free camera rotation** — the corpus's single biggest cost driver (Arai/Morimoto
   receipts); fixed camera already ruled. Do not reopen for beauty reasons.
2. **Per-figure frame animation** (walk/idle/attack cycles across the cast) — Morimoto's
   cast-multiplication groan; Genesis's warp/receipt motion + emote exceptions stand.
3. **8-direction (or any multi-facing) sprite sets** — even TS rationed to four characters.
4. **Bespoke per-map hand-dotted texture passes** (TS's per-board Artdink work) — replaced
   by material families + trim + decals; a compiled game cannot afford per-board artists
   and doesn't need them.
5. **Hand-authored one-off interaction set-pieces** (the packable market as bespoke script)
   — Genesis gets the same read systemically via mutation channels + rolled facts.
6. **Photoreal-reduced environments** — rejected by the HD-2D originators themselves
   ("maybe this would have been better left clean"); conflicts with the pixel canon.

## 8.5 The five-item highest-return solo stack (§5.9 Q8)

1. **Materials-to-production pass** (route approved parents + realm-palette ramps onto
   terrain/architecture in one rolled scene) — converts the biggest current gap (clay) into
   the TS-authored-unity effect using systems already proven.
2. **Composition compiler first rung (C1H)** — broad masses / primary spine / typed
   connectors / quiet-ground reservations; the FFT grammar as a solver, proven on one real
   roll.
3. **Context Band 1+3** (portal/support apron + one far plate family + graded void
   fallback) — worldfulness without acreage at plate cost.
4. **Mutation channels 1–3 minimum vocabulary** with per-instance binding + receipts —
   the wedge nobody else has; visible persistence from day one.
5. **Value/grade discipline gate** (grayscale-test + practical-ownership check folded into
   the capture packet ritual) — the zero-asset habit that keeps 1–4 composed.

## 8.6 Where the saved labor goes instead (§5.9 Q10)

Spend the camera/animation/bespoke-board savings on: (1) the mutation vocabulary and its
receipts; (2) per-culture material/trim variants (procedural culture constitution);
(3) DM-seat consequence language (fiction-first fallback clauses); (4) linked-window
frontier continuity (the large-site illusion); (5) playtest iterations of the movement
doctrine — the game's actual distinctiveness, none of which any competitor's art budget
buys.

## 8.7 Findings

```text
FINDING L8-1
Claim: The two most expensive things in the HD-2D tactics corpus — all-bearing map beauty
       and multi-facing sprite sets — are costs Genesis has already declined by ruling, not
       costs it still needs to find a way to pay.
Evidence: Arai ("a lot of resources… all sides"), Morimoto (4-of-cast 8-direction ration),
          W3 §12.13 fixed camera, single-standee canon.
Evidence class: developer statement + canon record
Confidence: high
Genesis translation: treat the fixed camera as a funded budget line: every proposal that
       sneaks rotation or extra facings back in is spending the exact money TS says it
       spent.
Solo-cost class: cost avoided (structural)
Decision status: research finding only
```

```text
FINDING L8-2
Claim: "Accurate HD-2D" is defined by its originators as pixel base + effects built up —
       the same order of operations as Genesis's sprite-first material ruling.
Evidence: Asano 4Gamer (Artdink selection story).
Evidence class: developer statement
Confidence: high
Genesis translation: Adam's 2026-07-24 sprite-first override is independently confirmed by
       the people who invented the register; the materials pass should proceed exactly as
       ruled, and photoreal-first shortcuts should be rejected on this record.
Solo-cost class: renderer multiplier (order of operations, not new spend)
Decision status: research finding only
```
