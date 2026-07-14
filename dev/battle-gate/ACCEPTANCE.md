# Battle-UI acceptance (Adam's bar, 2026-07-03)
1. ARENA/BOARD — stage mode: theater canvas is the hero; .theater-stage-wrap honors its
   height budget; canvas non-blank, no letterbox/stretch (backing aspect == box aspect);
   the rendered board occupies the majority of the canvas, centered — "the battle map
   probably needs to be bigger, and in play it needs to be centered taking up the majority
   of the screen." Band rail (the distance-indicating arena) floats as a LAYER above the
   map and stays legible. Classic fallback: arena.png loads and covers the grid.
2. RIGHT RAIL READABLE — no clipped/overlapping text; clean wraps; comfortable measure
   (~28–45 chars/line); who/roll/latency lines don't collide; nothing hidden behind the
   composer; zero horizontal overflow. "The text should probably shrink a bit once it
   slides to the right and it needs less padding because nothing is visible."
3. COMPOSER — stage mode only: fits the rail on one row; textarea gets the clear majority
   of the width; send button compact ("the send button probably needs to shrink on that
   side") but still a comfortable tap target; classic/explore composer UNTOUCHED.
4. NO-SCROLL — the in-session page never scrolls at 1440×900 or 1280×800 (IN-SESSION-UI law).
5. NO REGRESSIONS — check-manifest OK after any module edit; verify-battle-stage.mjs,
   verify-combat-lifecycle.mjs, gauntlet-1-clicks.mjs green; classic fallback intact.
6. BLIND-PLAYABLE — the stage prose twin stays present and correct; ARIA intact.
7. IVALICE BIBLE — squared corners, engraved gold chrome, layers not boxes, no centered
   floating cards (docs/DESIGN-GUIDE.md §II).

---

## Round 0 pointers (where to find the evidence for each criterion)

This file states the bar verbatim, as instructed — it does not grade round 0 against it (that's the
orchestrator's job on the pixels + `round0/metrics.json`). For convenience, here's where each
criterion's evidence lives in this round's capture set:

1. **Arena/board** — `stage-1440.png` / `stage-1280.png` (visual) + `metrics.json`'s
   `stage1440.theaterStageWrap` (rect + `heightPctVh`), `stage1440.theaterStageCanvas` (`clientRect`,
   `backingWidth`/`backingHeight`, `clientAspect`/`backingAspect`/`aspectDelta`), `stage1440.bandRail`
   (row count + occupied count). Classic fallback: `classic-fallback.png` + `metrics.json`'s
   `classic.arenaHttpStatus` / `classic.cmbGridArenaRect`.
2. **Right rail readable** — `stage-right-rail.png` (visual) + `metrics.json`'s `stage1440.feedText`
   (computed font-size/line-height per element), `stage1440.feedTextRailWidth`,
   `stage1440.estCharsPerLine`, `stage1440.overflowingDescendants` (any horizontal overflow, by
   selector), `consoleErrors`.
3. **Composer** — `stage-composer.png` (visual) + `metrics.json`'s `stage1440.composer` (dm-input
   rect/margin, textarea rect/font-size, button rect/font-size/padding,
   `buttonWidthPctOfDmInput`, `fitsOneRow`, `clipped`).
4. **No-scroll** — `metrics.json`'s `stage1440.pageScroll` / `stage1280.pageScroll` /
   `explore.pageScroll` / `classic.pageScroll` (`scrollHeight` vs `innerHeight`, `equal`, `delta`).
5. **No regressions** — NOT covered by this harness (round 0 runs no product-code verify harnesses by
   design — it changes no product code). Run `python3 build/check-manifest.py` +
   `node dev/verify-battle-stage.mjs` + `node dev/verify-combat-lifecycle.mjs` +
   `node dev/gauntlet-1-clicks.mjs` separately before merging any fix that touches product code.
6. **Blind-playable** — `stage1440`'s captured DOM includes `.stage-prose`/`role=status`
   (see `dev/verify-battle-stage.mjs` checks 2g for the structural assertion); this harness's
   `metrics.json` does not re-assert ARIA structurally (screenshot-only round) — cross-check against
   that verify harness, not this one.
7. **Ivalice bible** — visual judgment call on the PNGs; no metric substitutes for eyeballing
   corners/chrome/layering.
