---
type: report
project: Genesis
status: MORNING REPORT — the overnight tabletop build, night of 2026-07-07 → 08
boss: Opus (Fable planned + launched Wave 1, then handed off at model switch)
runbook: docs/OVERNIGHT-TABLETOP-2026-07-07.md
spec: docs/TABLETOP-UNITS.md · gates: TABLETOP-VISION.md §9
created: 2026-07-08
---

# OVERNIGHT-TABLETOP — morning report

## TL;DR

**5 of 7 units landed on master, all gated and pushed. The pre-alpha tabletop is real.**
U1 (Standing Table), U2 (3-column shell + ARIA), U3 (blank pieces + ambient presence),
U4 (cast tableau) and U6 (combat reconfigure/relax + tray persistence) are on master.
**U5 (overlay lanes) and U7 (harness pack) are PARKED** — not failures, a genuine design
fork that's yours to rule on (below). No combat regression ever landed; the byte-gate held
every wave. Master went `571dd02 → 4bac31f` across five pushes.

## What landed (merge SHAs, each personally re-gated by Opus — not executor self-reports)

| wave | unit | merge | gate highlights |
|---|---|---|---|
| 1 | U1 trayFrom + Standing Table · U2 shell + ARIA | `22673a3` | byte-gate/combat parity fixture-proven; integration crash caught + fixed (see below); U1 45/45, U2 28/28, full sweep 0 RED |
| 2 | U3 blank pieces + ambient presence | `7bdf51f` | dm-contract.json regenerates zero-drift; codex exclusion untouched; shared-derivation call-identity spy; 46/46 |
| 3 | U4 cast tableau + arrangement | `c06350a` | attitude-table mutation proof; §9.1 purity; combat path untouched; 17/17 |
| 4 (partial) | U6 combat reconfigure/relax + persistence | `4bac31f` | mount-once spy (mount called ONCE across walk→combat→relax); §9.10 dedup; byte-gate 45/45; gauntlets clean; 32/32 |

Every landing: check-manifest OK + the unit harness + the full ~120-file `dev/verify-*.mjs`
sweep at zero RED, re-run by me on the branch/integration tree, then `--no-ff` + push +
worktree cleanup.

## The one thing that needs YOU: the corpse-channel design fork (why U5 + U7 are parked)

Wave 4 ran U5 ∥ U6 in parallel. The spec split had U5 *own* the corpse trace-write and U6
*code against its shape* — but in isolation **both executors built a complete, incompatible
corpse-plumbing model**:

- **U6 (LANDED, now canonical):** a downed foe becomes a `kind:"corpse"` **unit** produced by
  `castFrom`; refs keyed on `fid` with a **collision-safe suffix** (`#2`,`#3`) so a second
  fight in the same room accumulates instead of silently deduping; trace-write is the extracted
  `theaterCombatEndTraces` (dm.js). U6's harness proves the full walk→combat→relax→revisit flow,
  mount-once, and serialize/reload persistence (32/32). It also **fixed two real things U4 left**:
  `castFrom` was never actually wired into `theaterStageSync` (the standing tableau showed no
  figures), and a genuine cross-fight `fid` collision bug.
- **U5 (PARKED, branch `feat/tabletop-u5-overlays` @ `f229cf8`, pushed):** corpses as a new
  `board.corpses` array; refs keyed on `statId` — which **collides for same-type foes** (three
  goblins → one `statId` → one corpse), a real defect U6's model avoids. Different render channel
  (board vs units), different trace shape on the source object.

Taking both would double-write on combat_end and double-stage corpses. **I did not hand-merge a
third design unattended** — the choice (corpses = board props or units?) has real renderer
implications and is yours. I landed the more-correct, self-consistent, more-complete one (U6) and
parked U5.

**U5's separable, uncontested value is its ambient overlays** — `overlaysFrom` staging flat
decals (crack-web / standing-water / moss-patch / drag-marks) off `dressing.condition` only,
with the §9.4 atmo-sibling discipline (atmo prose stages nothing). That is *independent* of the
corpse plumbing and should land. **U7 (harness pack) is parked because its own spec requires "the
integration tree of U1–U6"** — it belongs after U5′ lands.

## Your morning checklist

1. **Rule the corpse channel.** U6's units-model is landed + canonical. Options: (a) keep it as-is
   (recommended — it's correct, tested, and avoids the same-type-foe collision); (b) if you prefer
   U5's `board.corpses`, that's a refactor, not a bug-fix. Either way, ratify so U5′ + U7 can proceed.
2. **U5′ rescope + land** (a short follow-up, spec is 90% done): rebase U5's `overlaysFrom` +
   `prop:overlay-*` registry + `dev/model-qa/creatures/prop-overlay-decals.js` + the §9.4 sibling
   harness onto current master, **dropping** U5's corpse/trace plumbing (dm.js write, `board.corpses`,
   `corpseUnitsFrom`, its `render.js` `segment.overlay` change — all superseded by U6). Then run U7.
3. **Visual QA in a real browser** (no harness can judge a silhouette — this is the whole point of
   the pre-alpha): serve `localhost:5175`, start a session, walk a segment (standing tableau should
   show PC + any figures), enter combat (lanes), win, walk back (corpses should be toppled where they
   fell — this exercises U6's trace read against the REAL renderer, which jsdom stubs), collapse the
   stage (classic layout), and a screen-reader pass per BLIND-PLAYABLE (feed is `role="log"`, stage
   `aria-hidden`, prose twin lives outside the hidden subtree).
4. **Skim the Opus-review diffs** flagged by the spec: U1 (the trayFrom refactor), U6 (combat
   reconfigure) — both read clean to me, but they're the two HIGH-effort units.
5. **ES-module migration ruling** (Fable's deferral, still open): the spec wanted it with U1/U2;
   I held it — a mid-run file-structure migration would have invalidated the `file:line` anchors
   U3–U6 depend on, unattended. U3–U6 didn't need it. Your call whether it rides with U5′/U7 or later.

## Architecture flags surfaced during gating (not blockers — design-review items)

- **L1→L4 layering:** `engine.theater-data` now calls up into `world.prep`
  (`prepEligibleCompanionCreatures`, spec-named) and reads `world.codex`. WARN-level (RESULT: OK,
  see SCALING.md), but the dependency *direction* is worth a look — theater-data is a view-model
  that reads world state; maybe it's misclassified as engine-L1, or the cast should be passed in.
- **PC-ref duplication:** U4's `theaterCastPcRefFrom` mirrors dm.js's PC-ref construction to avoid
  *more* L1→L4 coupling. Low drift risk; consider a shared builder or accept it.

## Provenance / discipline notes

- Wave 1 caught the value of the gate: both U1+U2 self-reported green, but the integration tree
  crashed U2's harness — U1 severed the combat→stage trigger, stranding U2's stale stage-entry.
  I proved the *product* correct first (the shell renders), then landed a single-point, red-first
  integration fix (`stubTheater` sets `theaterMounted`). No assertion weakened.
- U4 honestly reported it couldn't finish its own full sweep (44/123); I ran it to completion (0 RED)
  before merging — the disk-is-truth discipline earning its keep.
- Generated artifacts verified regenerated, not hand-edited (dm-contract.json zero-drift).
- All parked work is pushed to origin (`feat/tabletop-u5-overlays`) — nothing lives only locally.

## Where the queue stands

- **Done + on master:** U1, U2, U3, U4, U6.
- **Parked, pushed, memo above:** U5 (rescope to overlays-only → U5′), U7 (run after U5′).
- **Still deferred (pre-existing):** ES-module migration; V3+ asset packs, V4/V5/V6 (post-pre-alpha).
