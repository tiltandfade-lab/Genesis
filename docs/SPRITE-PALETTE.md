---
type: system-spec
project: Genesis
status: SPECCED 2026-07-09 — Adam's ruling: sheets read monotone/duotone game-wide ("it's depressing"); richer broader palette everywhere EXCEPT gloom + noir (restraint stays); chrome = hyper-neon everywhere; realm animals are copy-pasted across realms — branch out realm-true. New gen wave: another set of sheets per realm per category + new animal sheets.
created: 2026-07-09
related:
  - "[[SPRITE-RESCUE]]"      # rides the same session branch; lands with the same wave
  - "[[SPRITE-TRANSITION]]"  # the prompt lane + v2 manifest contract this extends
---

# SPRITE-PALETTE — color-richness law + realm-true fauna

**Measured (2026-07-09 palette scan of all 241 source sheets, magenta bg excluded, 12 hue
bins chroma-weighted; max entropy 3.58):** most realms sit at hue-entropy 1.6–2.4 with the
top-2 hues owning 60–83% of chromatic pixels — duotone. Chrome: saturation 0.43, 15%
chromatic pixels (barely above noir's 9.6%) — the OPPOSITE of its hyper-neon identity.
Worst: frontier (1.61 ent / 0.83 top-2), ash (1.82 / 0.76). Eyes-on confirmed
(chrome-mm-01 = gunmetal + pinpoint red; frontier-mm-01 = wall-to-wall sepia).

**Decisions (locked — Adam 2026-07-09):**

- P1 — **Game-wide richness**: reds, oranges, purples, cyans — a broader palette everywhere.
  Realms stay palette-LIMITED (identity survives) but liberal WITHIN the realm: base duo may
  dominate a figure, never a whole sheet.
- P2 — **Gloom + noir are exempt.** Their restraint is the design. No richness push there;
  their files get only the anti-key clause (P5) and their animal sheets (F-series).
- P3 — **Chrome is hyper-neon everywhere**: every figure carries emissive color — neon cyan,
  electric lime, acid orange, laser red, ultraviolet — on lights, visors, hair, tubing,
  signage-glow. Dark chassis allowed as the canvas, never the whole read.
- P4 — **Numeric targets are advisory, not a hard gate** (validators preserve the thing's
  job): default realms hueEnt ≥ 2.6, top-2 share ≤ 0.55, chromatic ≥ 25%; chrome ≥ 2.9 /
  ≤ 0.45 / ≥ 35%. `dev/scan-palette.py` reports; Adam's eye rules.
- P5 — **Anti-key clause (every realm, gloom/noir included):** NO hot magenta / neon pink
  anywhere on a figure — anything #FF00FF-adjacent fights the chroma key (the SPRITE-RESCUE
  leak class). Purples/violets/UV-blue are fine; hot pink accents must go desaturated or
  shift violet.
- P6 — **Realm-true fauna**: the domestic/wild/dungeon animal rosters are currently the SAME
  base species list reskinned per realm (verbatim-duplicate cells in the registry). Each
  realm gets a SECOND sheet per animal kind with 25 all-new realm-native species — no
  repeats of the base set, no repeats across kinds within the realm. Realm logic decides
  the fauna (chrome: gene-mod/robotic/feral-urban; lost-world: dinosaur/megafauna; high-seas:
  pelagic/shore/ship life; ash: mutant/rad-adapted; bright-kingdom: heraldic/blessed;
  cosmic: void-adapted; suburb: raccoon/possum/coyote/HOA-pet tier; frontier: prairie/butte;
  theater: stage-prop and greasepaint beasts; gloom: graveyard/moor; noir: alley/harbor;
  fantasy: deeper-cut MM-adjacent naturals).
- P7 — This wave EDITS the prompt lane only (dev/model-qa/sprite-sheets/*.md). Generation
  stays Adam's/the gen session's paste job; slicing stays SPRITE-RESCUE's pipeline. The
  palette law rides the existing "another set per category" regen (same rosters, recolored
  under the law) — do NOT invent new monster/NPC rosters in this wave.

## Unit P-A — palette law into every realm file

**Files:** every `dev/model-qa/sprite-sheets/<realm>.md` (incl. pc-characters.md; skip
INDEX.md, setting-dressing.md).

Insert ONE fenced-prose block titled `**Palette law (2026-07-09)** — SPRITE-PALETTE P1–P5`
immediately after the realm's shared style block, written in the realm file's own voice:
(1) the realm's base palette named and KEPT; (2) a named accent menu of 4–6 hue families
drawn to fit the realm identity (frontier: turquoise-sky, oxide-red, sun-gold, sage;
ash: rust-orange, chem-green, warning-yellow, cyanotic blue; etc.); (3) the sheet-level
rule: across any 25-cell sheet, at least 4 hue families must be represented by deliberate
accents, no two adjacent cells reading as the same duo; (4) chrome only: P3's
neon-everywhere language; (5) P5 anti-key sentence verbatim in every file; (6) gloom/noir:
ONLY P5 + a one-line "restraint is the design — no richness push (P2)" marker.

## Unit P-B — realm-true fauna sheets

**Files:** the 12 realm files with animal sections (ash, bright-kingdom, chrome, cosmic,
fantasy, frontier, gloom, high-seas, lost-world, noir, suburb, theater).

Per realm, per kind (Domestic / Wild / Dungeon animal): retitle the existing section
`### <Kind> sheet 1/1` → `1/2` and ADD a new `### <Kind> sheet 2/2` section, 25 cells,
following build/gen-sprite-sheet-manifests.py's contract EXACTLY (numbered `N. **Name** —
cue` lines starting at 1, no gaps; the bold span is the name; slug = spr-<realm>-<kebab>).
Species per P6: realm-native, no repeats of the base roster, no repeats across the realm's
kinds, names distinct enough that kebab-slugs can't collide with ANY existing slug in
dev/sprite-manifests/v2-manifest.json (check the realm's slug list before finalizing —
a collision aborts the whole manifest regen). Cues stay one line, mechanically visual
(what the animal is doing / how it reads), no invented lore. Each new section restates the
sheet's shared mechanical instructions the way the existing animal sections do, INCLUDING
the palette law reference.

## Unit P-C — palette report tool

**File:** new `dev/scan-palette.py`. Port of the 2026-07-09 audit scan: per sheet PNG
(dir arg, default `ui-sketches/sprite-sheets/`), magenta-bg-excluded, thumbnail 256,
HSV, 12 chroma-weighted hue bins → mean saturation, hue entropy, top-2 share, chromatic%;
per-realm aggregate table; `--targets` prints P4's advisory thresholds beside each realm
with a ✓/✗ (chrome's stricter row; gloom/noir marked EXEMPT). Pure stdlib + PIL. Exit 0
always (advisory — P4).

## Verification

1. `python3 build/gen-sprite-sheet-manifests.py` exits 0 after all P-B edits (the parser IS
   the gate: numbering, kinds, slug collisions all fail loud). Cell-count delta = exactly
   +25 × 3 kinds × 12 realms = +900 pending cells.
2. `python3 dev/scan-palette.py --targets` runs green against the CURRENT corpus (it will
   show ✗ everywhere — that's the honest baseline, not a failure; the new gen wave is what
   turns it ✓).
3. Every realm file diff shows exactly one palette-law block + (realm files only) three
   retitled + three new sections; no roster edits outside the animal sections.
4. Orchestrator reads 3 realm files' new sections end-to-end (taste pass) before landing.

## OUT of scope

- Generating/slicing the new sheets (Adam's paste wave; SPRITE-RESCUE's slicer).
- Touching monster/NPC/kid/PC rosters (P7).
- Hard-gating on P4 numbers.
- The folder refactor (lands at the same sweep point; these files move with it).
