# EFFECTS & DECALS — index + PROPOSED faceted-rework contract

**Purpose:** (1) fix the "combat VFX aren't indexed well" problem — enumerate what exists and
where; (2) propose (NOT enact) the art contract for reworking VFX + decals into the new faceted
style. **The style rulings below are PROPOSALS awaiting Adam** — like §0 for figures, the VFX
language must be locked by Adam before any generation lane fires. Wrong-language locked across ~56
VFX is expensive; wasted candidates are cheap.

---

## Where they live (the index)

- **Combat/system VFX:** `assets/dressing/fx-*.png` — **120 files**, scattered by genre theme
  (that scatter is why they read as "not indexed"). Single-frame PNGs today (no sprite-sheets).
- **Decals:** `assets/decals/{source,shared,angled-flagged}/*.png` — **9 families** × set-2/3/4
  variants, each present as a clean `source` master, a `shared` render, and an `angled-flagged`
  variant for perspective surfaces.
- **Battle UI (not VFX):** `assets/battle/{arena,player-ring,hostile-ring}.png` — leave as-is.
- **Icons (not VFX):** `assets/icons/*` — UI glyphs; separate concern.

## In-scope for the fantasy rework

### A. System VFX — genre-neutral, used by every combat (~24)
| class | files (`fx-<class>-<name>`) | reads as |
|---|---|---|
| impact | blunt-star · crush-shatter · pierce-glint · slash-arc · slash-heavy | weapon hits |
| magic | bolthead · burstring · castcircle · orbcharge · sigilflash | spellcasting |
| status | bloodspatter · healmotes · poisonbubble · shieldshimmer · smokepuff · sparkburst · stunstars | conditions/procs |
| env | debriscloud · dustkick · emberdrift · frostburst · rippleflash · shadowpool · splash | terrain/ambient |

### B. Fantasy-flavored VFX — the fantasy realm's themed set (~32, 8 each)
- `fx-fantasy-*` — emberrune, featherdrift, frostshard, holyglow(+alt), leafburst(+alt), mossbloom
- `fx-ash-*` — volcanic/decay: ashcloud, basaltcrack, embergout(+alt), rustflake, toxicburst(+alt), biolumeflash
- `fx-gloom-*` — undead/grave: bonedust, graveglow, ichorspatter(+alt), mournvapor, witherpulse, vhstear(+alt)
- `fx-cosmic-*` — arcane/void: constellationburst(+alt), nebulaflash, sandveil(+alt), scarabswirl, sigilbloom, voidrip

### C. Decals — surface damage/decay (9 families)
`blood` · `water` · `grime` (dirt) · `wear` (scuff) · `scorch` · `crack` · `rust` · `moss` · `cobweb`
— exactly Adam's "scuff marks, blood, water, dirt, decay" list. Rework each as a `source` master;
the `shared` + `angled-flagged` variants are derived downstream.

### Out of scope for the FANTASY pass (other genre realms — flag only)
`fx-{suburb,noir,chrome,frontier,th,hs,lw,bk}-*` (~64 files) — cyberpunk/noir/western/etc. skins.
Rework only if/when those realms get the faceted treatment.

---

## PROPOSED contract (needs Adam's ruling before it becomes a packet)

VFX/decals are a **different asset class from figures** and can't use the figure contract:

1. **Background = transparent alpha PNG, NOT magenta chroma.** VFX composite over the live scene;
   there's no cutout step. (Decals likewise: alpha, so they multiply/overlay onto surfaces.)
2. **Framing:**
   - System + fantasy VFX: single centered burst/particle on transparent ground, square frame,
     generous padding, no figure, no scene.
   - env VFX: same, but ground-oriented (splash/dustkick read from a low angle).
   - Decals: flat **top-down splat**, alpha, no perspective (the `angled-flagged` variant supplies
     perspective later), tileable-ish edges.
3. **OPEN — VFX visual language (Adam's call, the §0-equivalent for effects):**
   - **(A) Faceted/geometric** — triangulated shards, faceted crescents, low-poly rune-rings; matches
     the figure redesign literally. Strong style unity. Risk: smoke/mist/glow resist hard faceting.
   - **(B) Painterly energy** — soft glows, volumetric smoke, gradient bursts; reads as energy, not
     geometry. Risk: drifts from the faceted thesis.
   - **(C) Hybrid** — faceted geometric core (shards, rune-rings, crystal frost) + soft glow/smoke
     accents where the element demands it. Most flexible; recommended default.
4. **OPEN — single-frame vs animated:** current assets are single PNGs. Keep single-frame "stamp"
   VFX (cheap, matches today), or move to sprite-sheet sequences (richer, much larger generation +
   pipeline scope)?

Once Adam locks #3 and #4, this becomes **PACKET-F4 (effects)** + a decal sub-lane, structured like
F1–F3 (lanes by class, per-slug candidates, provenance, Step-E — but Step-E gates alpha/framing/
style instead of chroma).
