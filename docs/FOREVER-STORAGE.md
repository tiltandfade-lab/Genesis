---
type: system-spec
status: specced 2026-07-02 — batch-3 unit 13 (forever-guards), LANDS BEFORE THE FORTNIGHT. Protection-class (freeze-compatible). RISK-REGISTER R9.
created: 2026-07-02
related:
  - "[[DURABILITY-TRIO]]"
  - "[[SPEED-DOCTRINE]]"
  - "[[RISK-REGISTER]]"
---

# Forever Storage — the promise needs a bigger vault

## §0. The math (measured, 2026-07-01 session data)

One played world ≈ 370KB serialized. Growth ≈ 75–150KB/session (dmlog prose dominates). `saveU`
stringifies the WHOLE universe synchronously on every applied event. localStorage ≈ 5MB/origin,
shared by ALL worlds — including every dead PC's world, kept forever by design.
**Wall 1 (weeks): main-thread jank** — multi-MB stringify per turn on slow hardware violates the
Speed Doctrine before the quota matters. **Wall 2 (months): QuotaExceededError** at ~40–60 total
sessions — currently UNCAUGHT → silent data loss mid-session. The fortnight alone burns ~20–25%
of the runway. Hence: this lands first.

## §1. IndexedDB, incremental

- DB `genesis` · stores: `worlds` (one record per world id) · `meta` (universe header, settings,
  reveal state) · `archive` (cold history, §2).
- **`saveU` → `saveWorld(w)`:** persist ONLY the changed world, async, debounced (~250ms
  trailing). The 370KB-per-event stringify dies; per-turn cost becomes one world's delta,
  off the hot path.
- **Migration (boot, once):** `genesis-universe-v2` found in localStorage → import world-by-world
  into IDB → verify read-back deep-equal → THEN write a pointer stub in localStorage
  (`{migrated:true, at}`) and keep the original LS blob untouched for one release as the
  belt-and-suspenders backup. `migrateWorld` runs on the way in (old shapes upgrade as always).
  Never delete the LS original in the same release that migrates it.
- **Quota safety net:** every write wrapped; on failure → in-app alert + an immediate export
  download offered (never lose silently). ⚙ Menu gains a **storage meter**
  (`navigator.storage.estimate()` — IDB quotas are GB-scale, so this is a dial, not a countdown).

## §2. History lifecycle — nothing lost, not everything hot

- The **mechanical ledger stays whole forever** (it's small and it IS the world's memory —
  recall/drift/reputation/chronicle all read it).
- **dmlog PROSE past the last `HOT_SESSIONS` (init 3)** moves to the `archive` store (still
  local, still exportable, viewable on demand from the Chronicle) — the hot world object stays
  lean, which also keeps the bridge's `postState` snapshot and future digests small.
  *(On-demand read BUILT 2026-07-02: the Character › History Chronicle carries an
  "Archived narration" vault expander — `renderArchiveVault`/`archiveVaultToggle`,
  `src/world/render.js` — closed by default, fetching `archiveReadForWorld` only when opened
  and painting the prose oldest-first; verify-storage §4.)*
- Export ("Export universe", DURABILITY-TRIO §1) includes archives; import restores them.

## §3. Game saves — LOCKED (Adam, 2026-07-02): IRONMAN, ALWAYS

**Automatic persistence IS the save system** — every event lands, always. Export/import =
backup and transport ONLY (of the universe as-it-is — never a time machine). **No checkpoint
slots, no restore, ever** — the player is forced to think about their moves; that's the game.

**The escape valve is diegetic: THE RETCON NEGOTIATION.** A player who needs an undo asks the
DM — a social contract moment, not a menu item. Protocol (runbook prose, lands with batch-3):
- Player-initiated, DM-adjudicated (editorial final say, as everywhere).
- Scope: a declared action walked back BEFORE its consequences cascade ("wait — I wouldn't have
  said that to the captain"). Never outcomes already rolled, never damage taken, **never death**
  (death's answer is the rebirth loop).
- **Retcons are CAPTURED, not silent:** the ledger logs an `adjudication` entry recording that a
  retcon occurred and what changed — the append-only never-silently-rewritten principle holds
  even for undo. History says "this was unsaid," it doesn't pretend nothing happened.
- The DM logs it as precedent (the existing adjudication machinery) so retcon generosity stays
  consistent across a campaign.

The conventional comforts that DO exist: the quota-safety export prompt + the periodic backup
nudge ("it's been 2 weeks — download a backup?").

## §4. Build + verify (inside unit 13 with the vintage harness + ATTRIBUTION)

1. IDB layer (`src/world/store.js`, classic-script; ~150 lines) + saveWorld/debounce + the
   migration boot path. 2. Quota wrap + meter + export-on-failure. 3. Archive lifecycle +
   Chronicle on-demand read *(read side BUILT 2026-07-02 — the vault expander, §2 note)*.
   4. Backup nudge. 5. `dev/verify-storage.mjs` (≥10/0, jsdom w/
   fake-indexeddb per existing harness conventions): LS→IDB migration round-trip deep-equal ·
   the LS original survives migration (mutation check: delete it, harness fails) · changed-world-
   only writes (spy: saving world A never rewrites world B) · debounce coalesces burst saves ·
   quota-failure path surfaces the export offer (mutation check: swallow the error, fails) ·
   archive moves prose past HOT_SESSIONS, ledger untouched · archived prose still renders on
   demand · vintage fixture #1 (today's format, frozen into `dev/fixtures/saves/`) loads clean ·
   full-sweep regression (saveU callers all still green).

## §5. Acceptance

A three-year world with two hundred sessions loads fast, saves in milliseconds, fits with room
for a hundred siblings, survives a quota surprise with an export in hand — and no one who plays
it ever thinks about any of this, which is the entire point of a vault.
