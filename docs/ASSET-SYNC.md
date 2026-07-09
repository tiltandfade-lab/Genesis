---
type: ops-note
status: "ADOPTED 2026-07-09 — Adam's ruling: 3D model data is request-on-demand, never auto-pulled"
created: 2026-07-09
related:
  - "[[SPRITE-TRANSITION]]"
---

# ASSET-SYNC — heavy assets are fetch-on-demand, not auto-pulled

**The ruling (Adam, 2026-07-09):** syncing the repo must NOT drag the 3D model data down with
it; anyone (or any machine/session) that needs it requests it explicitly.

**How git actually behaves:** a normal clone/pull downloads ALL history, binaries included —
"on demand" is not the default. The supported mechanism is **partial clone + sparse-checkout**,
configured per clone. Existing full clones already have the blobs (nothing to gain retroactively
without a history rewrite, which we are NOT doing — total tracked 3D is only ~32MB of GLBs, so
LFS migration is not worth breaking every clone over).

## The lean-clone recipe (new machines / lean sessions)

```bash
git clone --filter=blob:none git@github.com:<origin>/Genesis.git
cd Genesis
git sparse-checkout set --no-cone '/*' '!assets/models' '!dev/model-qa/sheets' \
    '!dev/model-qa/renders' '!dev/model-qa/creatures'
```

- `--filter=blob:none` = download NO file contents up front; blobs are fetched lazily, only
  when a checkout actually materializes them. Excluded paths are never materialized → never
  downloaded. This is the request-on-demand model.
- **To request the 3D data later:** `git sparse-checkout add assets/models dev/model-qa/creatures`
  — git fetches exactly those blobs, then. That's the whole "request" ceremony.
- Needs network on first touch of any lazily-fetched file — a lean clone is not fully
  offline-capable until the paths it uses have been materialized once.

## What's excluded from git entirely (already in .gitignore — the sprite era's real weight)

- `dev/sprite-sheets/incoming/*.png` — Adam's raw generated sheets (large, regenerable).
- `assets/sprites/*.png` — the cut sprites.
- PDFs (large + copyrighted).

**⚠ Consequence — the sprite corpus has NO git backup.** Sheets + cut sprites live only on the
machine that made them. Until a dedicated store exists (options: un-ignore + LFS on a narrow
path, a sibling assets repo, or plain cloud-drive sync of `assets/sprites/`), Adam's generation
sessions are the only copy: **keep the raw sheet PNGs** (they're the re-cuttable source) in a
synced folder outside the repo. Decision deliberately deferred to the T5 vertical slice.

## Standing rules

1. Never commit new binary model/render/sheet data without checking this doc's posture first —
   default is ignored or excluded, not tracked.
2. Existing tracked GLBs/JS builders stay tracked (fallback tier per SPRITE-TRANSITION §3;
   history rewrite rejected as disproportionate at ~32MB).
3. QA render/capture PNG batches under `dev/model-qa/` are the repo's real binary weight —
   prefer scratchpad/artifact output for future QA passes; commit only what a doc references.
