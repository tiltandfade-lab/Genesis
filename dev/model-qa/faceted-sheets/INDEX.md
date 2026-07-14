---
type: faceted-batch-index
status: fireable
created: 2026-07-14
regenerated: 2026-07-14 (worktree failure wiped the first doc set; r3a/r3b returns harvested first)
program: faceted-regeneration
---

# Faceted Sheets — next-batch index (post-audit architecture)

One shared template, one style block, numbered batch lists with one-line cues — the per-realm
sprite-sheet-doc architecture (`../sprite-sheets/INDEX.md`) carried over to the faceted program
after the F2–F15 lane format let sessions reinterpret, misroute, and fabricate returns.

Shared contract: [`SHEET-TEMPLATE.md`](SHEET-TEMPLATE.md) — includes the 2026-07-14 STYLE GATES
(realistic horror dark-fantasy, elongated naturalistic proportions, hard negatives against
chibi/WoW/Torchlight/candy saturation). Paste it first in every call, then the sheet section.

## Harvest so far (round 1 of this batch, before the worktree failure)

`r3a-returns/` (23 sheets, 55 identities) + `r3b-returns/` (1 sheet) — banked to
`/Volumes/Genesis/faceted-harvest-2026-07-14/` as the safety copy. NOTE: these were generated
with the PRE-gate template — QA them against the tone gates before admission.

## Fireable docs

- [`refire-r3.md`](refire-r3.md) — **R3 menagerie REMAINDER**: 49 identities / 22 sheets.
- [`refire-r7.md`](refire-r7.md) — **R7 fiends & celestials**: 28 identities / 16 sheets.
- [`refire-r8.md`](refire-r8.md) — **R8 aberrations & monstrosities**: 45 identities / 30 sheets.
- [`refire-r9.md`](refire-r9.md) — **R9 beasts**: 53 identities / 33 sheets.
- [`redo-quality.md`](redo-quality.md) — **RQ**: 174 identities / 69 sheets (QA failures +
  the F4/F8 misroutes; F4 effects use the effects contract, not the magenta block).

## Ready-to-paste Codex session prompts (`session-prompts/`)

1. `session-1-r3c.md` — R3 remainder (22 sheets, batch dir `r3c-returns/`)
2. `session-2-r7-r8.md` — R7 + R8 (46 sheets, `r7r8-returns/`)
3. `session-3-r9.md` — R9 (33 sheets, `r9-returns/`)
4. `session-4-rqa.md` — RQ 01–35 incl. all fx sheets (`rqa-returns/`)
5. `session-5-rqb.md` — RQ 36–69 (`rqb-returns/`)

Each is fully self-contained (rules + gated paste block + sheet sections). Sessions write files
only — no git. Audit after each session: diff its returns dir against the prompt's sheet list.

Per-file QA reasons for the re-dos: [`qa-ledger.json`](qa-ledger.json) (510 files reviewed).

## Separate tracks (not in this batch)

Props/items P-series (32-prop queue + lane6 rerun + dressing + icons) · floors/textures T-series
(procedural-vs-textured decision first) · F10/F11/F7/F3 salvage commits (disk-only troves).
