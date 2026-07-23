---
type: gate-evidence
status: STAGE 0 COMPLETE 2026-07-23 — restore drill PASSED; Drive migration EXECUTED +
  verified (double cloud copies); GitHub push rides the clean close
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
- **W1 §8.14.1 item 6 — EXECUTED (Drive half) 2026-07-23, on Adam's authorization** ("the
  recovery needs to live completely on drive and not on my local machine at all"):
  - Drive home: `My Drive/Genesis-Recovery-2026-07-23/` — bundle (id `1Np7EaSM…`, cloud size
    5,309,908,436 = exact local match), zip (id `14f6w9Uw…`, cloud size 4,888,697,381 =
    exact local match), both manifests; **server-side duplicates of all four** (`*.copy2`)
    in the same folder — two full cloud copies of everything.
  - Verification basis: exact byte-size match via the Drive API + DriveFS transit checksums;
    the sha256s recorded above remain the restore-time integrity check (a future download
    failing them fails the drill loudly).
  - Local disposition: originals moved to the Trash (`~/.Trash/Genesis-recovery-2026-07-23-
    originals`) pending Adam emptying it; the sync-folder copies are dataless/auto-managed
    cloud placeholders. Zero durable local residue once the Trash is emptied.
  - The GitHub half (tag/branch push) rides the session's clean close.
