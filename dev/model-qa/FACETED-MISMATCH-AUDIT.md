# Faceted reserve — identity mismatch audit

**Date:** 2026-07-15 · **Branch:** `chore/faceted-mismatch-audit` · **Auditor:** Claude (manual visual review, no sub-agents)
**Scope:** all 252 `candidateAsset` slugs across `dev/model-qa/flip-verdict-sheets/sheet-01.png`…`sheet-21.png`
**Artifact:** `dev/model-qa/faceted-mismatch-audit.json` (per-slug verdict + cause + note, machine-readable)

Adam's prompt for this audit: *"a ton of mismatches. not sure how that happened."* This traces exactly how.

## Method

1. Read every sheet cell-by-cell (cropped to native per-cell resolution first, so nothing was lost to
   the vision pipeline's downscaling of the full 2568×2282 sheet) — legacy pixel art LEFT, faceted
   candidate RIGHT, judged against the legacy art and the caption name as the identity reference.
2. For every MISMATCH/DUBIOUS, looked up the slug in `dev/model-qa/faceted-cut-report.json`
   (`sourceFile` / `cellIndex` / `cellsProvenance`), checked whether **sibling cells in the same
   candidate file rendered correctly** (the single most useful diagnostic — a correct sibling proves
   the file wasn't globally miscut), and where that was inconclusive, opened the **raw candidate
   source PNG directly** (`dev/model-qa/faceted-sheets/*/raw-figures/*.png`) plus the round's
   `provenance/*-generation-calls.json` to read the true generation order.

## Headline totals

| Verdict | Count |
|---|---|
| MATCH | 206 |
| MISMATCH | 41 |
| DUBIOUS | 5 |
| **Total** | **252** |

| Cause | Count | What it means |
|---|---|---|
| **CUT-ORDER** (whole-file batch shift) | 26 | The registry's slug→file mapping is technically "correct" per its own metadata, but the **actual bytes on disk at that filename are the wrong generation batch's output** — a pipeline save-index bug, not a bad render. 22 of these are mechanically recoverable right now (the real art already exists on disk under a different slug's filename); 4 have no known recoverable file. |
| **GENERATION-MISROUTE** | 14 | The model (or the save pipeline) produced the wrong creature for this specific prompt slot, while sibling slots in the *same* candidate sheet rendered correctly. 4 of these are a confirmed **byte-identical duplicate-file** sub-case (see below) — the other 10 are isolated single-cell misses. |
| **QUALITY-FAILURE** | 1 | Identity is correct but the render is anatomically malformed (Half-Dragon). |
| **AMBIGUOUS** | 1 | Sibling evidence suggests a deliberate (if debatable) reinterpretation rather than a bug (Lantern-Sage). |
| **OTHER-UNKNOWN** | 4 | Genuine style-vs-error judgment calls, flagged DUBIOUS rather than ruled (Pixie ×2, Troglodyte, Yochlol). |

| Salvage bucket | Count |
|---|---|
| **Mechanically salvageable** (re-point `sourceFile`/`cellIndex`, no new art) | 22 |
| **Needs regeneration** (no recoverable art found on disk) | 18 |
| Needs regeneration — quality only, identity was right | 1 |
| Adam's call — reinterpretation, not obviously broken | 5 |

## The two root causes, in order of size

### 1. The r3a "off-by-one-batch" file-save bug — 26 slugs, 22 salvageable

`dev/model-qa/faceted-sheets/r3a-returns/provenance/r3a-generation-calls.json` records the *intended*
cells for each candidate file, in the order the batch was generated. Cross-checking that order against
what's actually painted onto the corresponding on-disk PNG reveals a clean, mechanical bug: **the file
saved under the filename for generation call `K` actually contains the real output of call `K-1`.**
Every subsequent file inherits the previous call's art, one slot late, all the way to the end of the
round.

Traced and confirmed by direct image inspection at four hand-offs:

| Filename (claims to be…) | Actually contains (call K−1's real art) |
|---|---|
| `giant-boar-candidate-001.png` | ape / axe-beak (bird) / badger / bat (call 16 — unregistered slugs, not in our 252) |
| `giant-crocodile-candidate-001.png` | **the real Giant Boar/Centipede/Constrictor-Snake/Crab** |
| `giant-frog-candidate-001.png` | **the real Giant Crocodile/Eagle/Elk/Fire-Beetle** |
| `giant-octopus-candidate-001.png` | **the real Giant Frog/Goat/Hyena/Lizard** |
| `giant-seahorse-candidate-001.png` | **the real Giant Octopus/Owl/Rat/Scorpion** |
| `giant-toad-candidate-001.png` | **the real Giant Seahorse/Shark/Spider/Squid** |
| `flameskull-candidate-001.png` | **the real Earth Elemental (cell0) + Fire Elemental (cell1)** — verified directly, a perfect boulder-body earth elemental and a perfect flame-body fire elemental sitting under the "flameskull" filename |

This means **20 Giant-animal slugs + Earth Elemental + Fire Elemental (22 total) can be fixed today
with zero new generation** — just re-point each slug's `sourceFile`/`cellIndex` in the cut pipeline to
where its real art is actually sitting. The tail end — **Giant Toad, Giant Vulture, Giant Wasp, Giant
Weasel** — is the one genuinely lost quartet: their real content would live in "call 23," which doesn't
exist in this round (the round ends at call 22). Those 4 need regeneration unless the art turns up in a
later round by chance.

### 2. The rqb duplicate-file bug — 4 slugs, all need regeneration

`spr-pc-dragonborn-rogue-candidate-001.png` is a **byte-for-byte MD5-identical duplicate** of
`spr-fantasy-domestic-animal-goat-goose-peacock-turkey-candidate-001.png` (confirmed via `md5`). Two
unrelated generation calls in `rqb-returns` — call 23 (the domestic/dungeon/wild-animal quartet, which
rendered correctly) and call 25 (the Dragonborn Rogue/Sorcerer/Wizard + Dwarf Barbarian quartet) —
ended up with the *same file on disk*. This is not the r3a off-by-one shift (call 24, in between, is a
distinct and correct file); it's an isolated pipeline dedup/overwrite bug. The real PC-class art was
either never saved separately or was overwritten by the duplicate — there's nothing to re-cut here, all
4 slugs need fresh generation:

- **Dragonborn Rogue** → shows a mountain goat
- **Dragonborn Sorcerer** → shows the rat/salamander/cricket trio
- **Dragonborn Wizard** → shows the lynx/falcon/fox trio
- **Dwarf Barbarian** → shows the black-bear + mountain-goat pair

### 3. Everything else — 11 isolated GENERATION-MISROUTE cases

These are one-off misses, each confirmed by a correctly-rendered sibling cell in the same candidate
file (proving the file wasn't globally miscut — only this one slot failed):

- **Arcanaloth** — jackal-headed robed scribe, no demonic traits at all. Sibling (Cambion) rendered
  correctly. Mitigating note: real D&D arcanaloths *are* canonically jackal-headed, so this may be
  lore-accurate but stylistically off-corpus.
- **Arch-hag** — an elegant regal woman, no hag ugliness/hunch/scale. Single-cell candidate, no sibling
  to diagnose against.
- **Barbed Devil** — a pale quadrupedal spiky beast, not the bipedal devil. Sibling (Bearded Devil, same
  file) is a *correctly* rendered horned devil with a glaive and the signature beard of hooked spikes —
  proof the file's other half rendered fine.
- **Deep-Brute** *and* **Deep-Brute Thonot** — both cells of this 2-cell candidate are wrong *and*
  mutually unrelated (a white ape/yeti and a purple-haired bone-totem shaman) — the whole file needs
  regeneration, not a re-cut.
- **Gilded Medusa** (slug `spr-fantasy-gorgon`) — a bronze bull-man, not a snake-haired woman. Its
  sibling (Greater Mimic) is correct. Suspicious: a *separate* file, `spr-fantasy-brazen-gorgon-candidate-001.png`,
  independently generated the same bull-monster concept for the similarly-named `spr-fantasy-brazen-gorgon`
  slug (which is the *correct* D&D "Gorgon" bull monster). Likely a prompt-text mixup between the two
  near-identical slug names.
- **Gray Ooze** — a crystalline tendril, no blob/drip characteristics. All 3 sibling gnoll cells in the
  same 4-cell file rendered correctly; only the tacked-on "ooze" 4th slot failed.
- **Grick Ancient** — a plain coiled snake, missing the signature tooth-ring maw. Sibling (Griffon) is
  correct.
- **Homunculus** — a bat-winged gargoyle/imp, no clay-construct traits. Both siblings (Awakened Shrub,
  Bandit Enforcer) are correct.
- **Lantern-Sage** — a literal hooded sage carrying a lantern, not the animate-object lantern-monster
  legacy establishes. All 3 siblings in this candidate (Archmage, Commoner, Mage) are correctly-rendered
  humanoid NPC casters, and Lantern-Sage's render fits that same cluster — this looks like a **deliberate
  name-literal reinterpretation** by the generation batch, not a technical failure. Flagged anyway since
  it changes the creature's *kind* (monster → NPC).
- **Ridden Wyvern** — a riderless quadruped horse-dragon, no rider, not wyvern-shaped. Sibling (Wyvern)
  is a correctly-rendered bipedal winged dragon.

### The 5 DUBIOUS (judgment calls, not clear pipeline defects)

- **Half-Dragon** — confirmed NOT a crop artifact (viewed raw source directly): the creature genuinely
  is a dragon-headed humanoid (correct identity) but severely malformed/elongated. Quality issue, not
  identity.
- **Pixie / Pixie Wonderbringer** — both consistently rendered as tall elegant adult fae rather than
  Tiny childlike pixies. Both correct siblings (Myconid Sprout, Sprite) in the same candidate confirm
  this is a deliberate style pass, not a swap — but it changes the Tiny-scale identity notably. Adam's
  call on whether that's acceptable.
- **Troglodyte** — pale/gaunt, no reptilian scale texture. Sibling (Vampire Spawn) is correct. Cave-pale
  is a defensible in-universe read but the species traits are genuinely absent.
- **Yochlol** — a tree-root/bark humanoid, not the usual ooze/spider-demon shapeshifter. Single-cell
  candidate, no sibling to diagnose against.

## Worst 10 examples (for a quick look)

1. **The entire Giant-animal family (24 slugs, sheets 07–08)** — every single "Giant X" sprite from Boar
   through Weasel shows a *different* Giant-animal's art, in a clean cascading off-by-one-batch pattern.
   The single most visually obvious mismatch cluster in the corpus.
2. **Dragonborn Rogue / Sorcerer / Wizard + Dwarf Barbarian (sheet 19)** — four player-facing character
   art slots showing farm animals and vermin instead of PCs. Byte-identical duplicate file, confirmed by
   MD5.
3. **Earth Elemental / Fire Elemental (sheet 06)** — an earth elemental that's actually a shattering
   crystal wraith, and a fire elemental that's actually a gray gargoyle-devil with zero fire coloring.
   The real art for both was hiding, confirmed, under the "flameskull" filename.
4. **Deep-Brute / Deep-Brute Thonot (sheet 05)** — a white yeti-ape and a bone-totem ghost shaman,
   neither reptilian, neither even resembling the other as name-variants should.
5. **Gilded Medusa / `spr-fantasy-gorgon` (sheet 09)** — a bronze bull-man standing in for what should
   be a snake-haired medusa woman, apparently cross-contaminated from the near-identically-named
   Brazen Gorgon slug.
6. **Homunculus (sheet 10)** — a fanged bat-winged gargoyle imp standing in for what should be a small
   clay/construct servant.
7. **Ridden Wyvern (sheet 15)** — a riderless quadruped horse-creature standing in for a rider-mounted
   wyvern; its own sibling cell (plain Wyvern) proves the generator could draw a correct wyvern in the
   very same image.
8. **Lantern-Sage (sheet 11)** — dropped the "animate lantern monster" identity entirely for a generic
   hooded sage NPC; the most defensible-but-still-flagged case in the set.
9. **Grick Ancient (sheet 09)** — a plain coiled snake standing in for the signature tooth-ring-maw
   grick.
10. **Barbed Devil (sheet 02)** — a pale spiky quadrupedal beast standing in for a bipedal horned devil,
    while its own sibling cell (Bearded Devil, same image) is a canonically accurate horned devil with a
    glaive and spike-beard.

## Repair recipe

**CUT-ORDER (26 slugs, 22 immediately actionable):** No new art generation. Re-point each affected
slug's `sourceFile` + `cellIndex` in the cut/candidate-assignment step to the file that actually holds
its real content (mapping given in the table above and in `faceted-mismatch-audit.json`), then re-run
the crop step for those slugs only. This is a mechanical fix — the pixels already exist and were
verified by direct inspection.

**GENERATION-MISROUTE (14 slugs, all need regeneration):** Re-run generation for these specific
prompts. For the 4 rqb duplicate-file PCs, treat as a fresh call (don't reuse cached output — that's
what caused the duplication). For Gilded Medusa specifically, re-verify the *prompt text* isn't
accidentally reusing the Brazen Gorgon prompt before regenerating, since that's the likely root cause
there.

**QUALITY-FAILURE (Half-Dragon):** Regenerate for anatomy quality; identity direction (dragon-headed
humanoid) was correct, keep that framing in the retry prompt.

**AMBIGUOUS / DUBIOUS (6 slugs):** Adam's call, not a pipeline fix — Lantern-Sage, Pixie ×2, Troglodyte,
and Yochlol all look like deliberate style choices in the generation batch rather than technical
failures. Decide whether the reinterpretation is acceptable or needs a re-prompt toward the legacy
identity.

## Estimated salvage

- **22 slugs (9% of the corpus) recoverable today with zero new generation** — a cut-pipeline fix only.
- **18 slugs need regeneration** with no salvageable art on disk.
- **1 slug (Half-Dragon)** needs a quality-only regeneration.
- **5 DUBIOUS slugs** are Adam's taste call, not a defect to fix.
- **206 of 252 slugs (82%)** are confirmed MATCH — the corpus's core is sound; the mismatches
  concentrate almost entirely in two mechanical pipeline bugs (r3a's batch-shift, rqb's duplicate-save)
  rather than being scattered randomly, which is good news for the fix's blast radius.
