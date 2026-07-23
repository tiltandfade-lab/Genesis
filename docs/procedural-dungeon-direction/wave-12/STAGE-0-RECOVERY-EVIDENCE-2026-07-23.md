---
type: gate-evidence
status: STAGE 0 EXECUTED 2026-07-23 — restore drill PASSED; external upload (W1 §8.14.1
  item 6) awaiting Adam's authorization
created: 2026-07-23
owner: wave-12 P12.12 checklist, box 3 (recovery package) / source law W1 §8.14.1
---

# Stage 0 — Recovery Package Evidence (2026-07-23)

The mandatory pre-implementation recovery gate of W1 §8.14.1, executed as the first box of
the Q12-B checklist (P12.12). Arrival standard per FEATURE-PRIORITIZATION §2: **the drill
passed, not the artifacts existing.**

## 1. The recovery point

- **Tag:** `pre-redesign-2026-07-23` (annotated, immutable) at master
  **`6ed2473d2da9cb5c84dc2769a5d366ba6caa1fae`** — the merge that closed the twelve-wave
  design program; GitHub CI run 29980398639 green on that commit.
- Tag message records purpose + SHA + CI run. Local only until item 6 fires (below).

## 2. The package (all at `~/Desktop/Work/projects/Genesis-recovery-2026-07-23/`)

| Artifact | Size | sha256 |
|---|---|---|
| `genesis-all-refs-2026-07-23.bundle` — portable git bundle, **all refs** (`git bundle verify`: "records a complete history") | 4.9 GB | `fddaddf911b85fa25103c4ed7c896a3c63c038a62a4d7ade2ba3c5b2022c6a05` |
| `genesis-tree-pre-redesign-2026-07-23.zip` — materialized working tree at the tag, LFS payloads real | 4.6 GB | `fcc983503fbf0e435bdecf69f8e5f693f2a73742b4e73c8b55d2c79e139e2582` |
| `lfs-manifest-sha256.txt` — `git lfs ls-files -l` at the tag: 8,089 entries, oid = sha256 per asset | 1.0 MB | (self-checksumming: each line carries the asset's sha256) |
| `tree-manifest-sizes.txt` — all 14,094 tracked files with byte sizes | 890 KB | — |

**LFS completeness at the tag: verified.** Full checkout of the tag smudged all 8,089 LFS
files; `git lfs ls-files` reported **0 non-materialized** entries; a pointer-file scan of the
materialized tree found none. (The bundle, per its nature, carries pointers only — the zip
carries the payloads; full-history LFS payloads additionally live on origin's GitHub LFS
storage.)

**Representative saves/seeds ride inside the archive** (tracked fixtures):
`dev/fixtures/saves/vintage-1.json`, `dev/playtest-saves/rennick-fool/state.json` (+
pre-run4 state and adversarial logs), `dev/playtest-saves/sella-shimmering-maw/`,
`dev/ci-seed-rng.cjs`, `dev/geometry-research/fuzz/seed-ledger.json`.

## 3. The restore drill (PASSED, 2026-07-23 ~10:30)

Restore = from the **zip archive alone** into a scratch directory (not from git):

1. Unzipped `genesis-tree-pre-redesign-2026-07-23.zip` → **14,094 files** extracted, exactly
   matching the tree manifest count.
2. `python3 build/check-manifest.py` inside the restored tree → **RESULT: OK** (the four
   pre-existing layer WARNs only, identical to the live repo's known state).
3. Served the restored tree (`python3 -m http.server 5176`) and loaded
   `genesis.html` in a browser: title screen rendered fully, **zero console errors**.
4. **Behavior, not just files:** clicked "Begin a New Genesis" → the character-creation
   flow advanced to the species chronicle (Dragonborn/Dwarf/Elf/Gnome cards rendering from
   the restored data modules), still zero console errors. Proof captures live in the
   2026-07-23 gate-session transcript (title screen + creator screen screenshots).
5. Cleanup: drill server stopped, scratch extract removed. The drill is re-runnable forever
   from the two archives + this transcript.

## 4. Honest gaps (stated, not hidden)

- **Adam's live browser worlds** (localStorage/IndexedDB in his Chrome profile at
  `127.0.0.1:5175`) are not in any git artifact and are NOT covered by this package. The
  tracked playtest saves above are the representative stand-ins. An explicit export of live
  worlds is available as a follow-up if Adam wants it in the package.
- **Ignored/untracked surfaces** (Reference PDFs — copyrighted, re-obtainable; `.dm/`
  mailbox scratch; `node_modules/`; OS cruft) are outside the package by design.
- **W1 §8.14.1 item 6 — external backup — is NOT yet executed:** pushing the tag to origin
  and uploading the package to Google Drive are external pushes/uploads that the source law
  reserves for Adam's explicit authorization at this gate. Both are one command away.
