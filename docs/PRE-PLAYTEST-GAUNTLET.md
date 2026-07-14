---
type: system-spec
project: Genesis
status: SPECCED — awaiting Sonnet execution batch
updated: 2026-07-02
---

# PRE-PLAYTEST GAUNTLET — automated bug sweep before the live bridge playtest

**Purpose.** Hammer down the obvious errors *before* Adam's long playtest by simulating everything
simulatable: combat at every CR, level-ups at every level × class, companion states, every
non-conversation UI state, save/load at every depth. The existing 60+ `dev/verify-*.mjs` harnesses
are unit/feature-level; this gauntlet is the missing **integration/simulation layer** that drives
the real app through full flows.

---

## §0 Execution model — a detection LOOP, not a spec/code/review pipeline

This gauntlet is **not** "spec → build → review → done." It is a **detection loop with an
escalating judgment ladder**: generate signal as cheaply as possible, escalate it through a ladder
where the model tier climbs as the signal gets more distilled, act on it, re-verify, and **loop
until the signal goes quiet.** Building the harnesses (below) is a one-time cost at the bottom of
the ladder — it is not the shape of the activity. This is the same shape as the live playtest
(`docs/AUTOMATED-PLAYTEST.md`); the role ladder is deliberately symmetric.

**The role ladder (bottom = cheapest/most mechanical, top = Fable):**

1. **Generate** — harnesses G1–G7 run. *No model.* Cheap, high-volume, deterministic.
2. **Capture** — the report writer emits `gauntlet-report.json` (§2). No judgment.
3. **Triager — Opus** — first-pass over the findings: severity-sort, dedup, drop false positives,
   tag `collisionZone`. Mirrors the playtest's **Critic** rung.
4. **Fixer — Sonnet** — fixes one triaged batch at a time, each on its own branch, each carrying a
   regression check shown RED against the un-fixed code (the mutation-test rubric, #7).
5. **Verifier — Fable** — deep pass: re-runs the repro of every `crash`/`corrupt` finding (never
   trust the report's prose), re-runs the gates red→green to confirm each fix actually holds, and
   reads the G2 CR-band lethality data against the "hard & dangerous" pillar. Mirrors the
   playtest's **Analyst** rung.
6. **Loop** — re-run the affected harness after each fix batch until clean. Hold `collisionZone`
   findings until the gap-wiring batch lands, then re-run and close or confirm them.

**Flood = root cause, not N bugs (the stop-investigate-retry reflex).** A harness spraying many
findings almost always has ONE cause, not many — e.g. G1 throwing 200 `ReferenceError`s means a
module failed to load, not that 200 handlers are dead. When a harness floods, STOP, find the root,
fix it, re-run — never grind a flood item-by-item. (Same reflex the playtest applies to a
token-burn spike.)

**Who does what:**
- **Sonnet** builds harnesses G1–G7 + the G8 stager, runs them, emits the report (§2), and later
  executes fix batches (rung 4). **Sonnet fixes nothing during the detection pass** — detection
  only; when blocked or ambiguous, stop and flag, never guess.
- **Opus** runs rung 3 (triage). **Fable** runs rung 5 (verify + tuning read). G8 screenshot
  *capture* is a cheap-vision job (see §10); only flagged frames escalate to a human.
- **Exit-code semantics (critical):** a harness exits **0 when it ran to completion** — findings
  are *data written to the report*, not test failures. Exit **1 only on harness defects** (boot
  failure, unhandled harness-code throw, report unwritable). "The game has bugs" ≠ "the harness
  is broken."
- **Canary discipline (rubric #7):** every harness supports `GAUNTLET_CANARY=1`, which injects one
  known defect (specified per-harness below) and MUST emit ≥1 finding + exit 1. Run the canary RED
  before trusting any green run. A detector that has never caught anything is not a detector.
- **Determinism:** before loading any module, install a seeded PRNG over `Math.random`
  (mulberry32; seed from `GAUNTLET_SEED` env var, default `20260702`). Every report records its
  seed; every finding's repro line includes it. Same seed → same run.

## §1 Ground rules / DON'T-TOUCH list

- **New files only**, under `dev/`: `dev/gauntlet-*.mjs`, `dev/fixtures/gauntlet-*`,
  `dev/gauntlet-report.json`, `dev/GAUNTLET-FINDINGS.md`. Nothing else changes.
- **Never edit:** anything under `src/`, `data/`, `manifest.json`, `genesis.html`, any generated
  file (`tables.js`/`tables.json`/`data/bestiary.js`/`data/class-progression.js`), any existing
  `dev/verify-*.mjs`, and the BATCH3 docs (`docs/BATCH3-*.md`).
- **Collision zone (a parallel session's gap-wiring batch owns these):** `src/world/gap-wiring.js`,
  `src/engine/combat.js`, `manifest.json`. Findings attributable to these files get
  `"collisionZone": true` in the report — flagged, never fixed, re-checked after that batch lands.
- **Never run `dev/verify-bridge.py` or touch `.dm/`** — a live playtest bridge may be up; it
  shares + resets the mailbox (standing gotcha).
- **Branch:** build on `feat/pre-playtest-gauntlet` cut from `master`. New-files-only guarantees a
  clean merge regardless of what gap-wiring lands. Final report runs happen on post-batch-3 master.
- **jsdom:** the harness boot pattern is **copy `dev/verify-dm-events.mjs`** — it loads the real
  `genesis.html` with all modules in document order. jsdom lives in a scratch dir
  (`~/.genesis-jsdom`; `npm i jsdom` there if absent).

## §2 The report contract

One machine-readable file `dev/gauntlet-report.json`, plus `dev/GAUNTLET-FINDINGS.md` generated
from it (human digest, grouped by severity). Every harness appends; the report accretes across
harness runs (keyed by harness id, latest run wins).

```json
{
  "run":   { "date": "2026-07-02", "seed": 20260702, "commit": "<git rev-parse --short HEAD>" },
  "harnesses": [
    { "id": "G2", "status": "completed", "invoked": 510, "skipped": 3, "findings": 7,
      "stats": { "crBands": [ { "level": 5, "cr": 3, "sims": 50, "winRate": 0.82,
                                "meanRounds": 6.1, "meanPcHpLost": 19.4 } ] } }
  ],
  "findings": [
    {
      "id": "G2-004",
      "harness": "G2",
      "severity": "corrupt",
      "title": "resolveCreature('rust monster') returns hp NaN",
      "symptom": "cmFoeFrom builds a foe with hp: NaN; first resolveAttack leaves foe.hp NaN forever — unkillable",
      "evidence": {
        "stack": "<full trace or null>",
        "stateSnapshot": "dev/fixtures/gauntlet-snap-G2-004.json",
        "repro": "GAUNTLET_SEED=20260702 node dev/gauntlet-2-combat.mjs --only='rust monster'"
      },
      "collisionZone": true
    }
  ]
}
```

**Severity ladder (fixed, use exactly these):**
- `crash` — uncaught throw, boot failure, infinite loop (watchdog trip).
- `corrupt` — state invariant broken: NaN/undefined persisted into `U`/sheet/foe, save→load loss,
  negative gold, hp > max after rest.
- `wrong` — mechanical result contradicts source data (slots ≠ `CLASS_PROGRESSION`, PB ≠
  `pbForLevel`, XP ≠ `crXp`).
- `ugly` — render defect: `undefined` / `NaN` / `[object Object]` in visible text, required panel
  empty, handler wired to a nonexistent function.
- `review` — suspicious, needs judgment (30-round stalemates, tuning outliers, quota projections).

**Global invariant set `INV` (checked wherever a spec section says "assert INV"):** active sheet
`hp` is a finite number ≤ `maxHp`; `gold` finite ≥ 0; `inventory` is an Array with no
null/undefined entries; world clock value never decreases; `JSON.stringify(U)` succeeds (no
cycles); rendered `document.body.innerHTML` contains none of the substrings `>undefined<`,
`>NaN<`, `[object Object]`.

**Watchdog:** every sim/flow loop carries a hard iteration cap (stated per harness); tripping it
is a `crash` finding, not a hang.

---

## §3 G1 — the click-everything sweep  (`dev/gauntlet-1-clicks.mjs`)

Wiring rot detector: every inline `onclick` in every reachable state, invoked, guarded.

**Procedure.** Boot the full app. For each of **3 state contexts** — (a) fresh boot, no world;
(b) a mid-session fixture world (build once in-harness: world rolled via the world-genesis path,
one PC created, saved as `dev/fixtures/gauntlet-world.json`, injected into localStorage);
(c) fixture world with a shop open (`GS.shop` set via the dev test-shop path) — do: for each tab
(iterate `showTab(id)` over every tab id present in the DOM's tab bar), render, then collect all
`[onclick]` elements, parse the handler source, and invoke it via
`window.eval("(function(event){" + src + "})")(fakeEvent)` in try/catch with a minimal
`fakeEvent = { target: el, preventDefault(){}, stopPropagation(){} }`.

**Rulings.**
- Stub `window.confirm = () => false` and `window.prompt = () => null` for **pass A** (nothing
  destructive fires); repeat as **pass B** with `confirm = () => true` against a throwaway copy of
  the fixture world (state restored from snapshot after each handler).
- Restore `U` + `GS` from a pre-handler snapshot after EVERY invocation (handlers must not
  contaminate each other).
- `ReferenceError: <fn> is not defined` in any context = `ugly` finding (wiring rot), always.
- Any other throw: finding only if it throws in **all applicable contexts**; a throw only where
  required state is absent → `review` with the context noted.

**Acceptance:** `node dev/gauntlet-1-clicks.mjs` → exit 0; report shows `contexts: 3`,
`handlersInvoked ≥ 150` unique handler sources (if fewer, that itself is a `review` finding —
the sweep missed states). **Canary:** `GAUNTLET_CANARY=1` injects
`<button onclick="gauntletNoSuchFn()">` into the DOM pre-sweep → must emit 1 `ugly` finding.

## §4 G2 — combat CR ladder  (`dev/gauntlet-2-combat.mjs`)

**(a) Resolve gauntlet — all 510 bestiary entries.** For every entry name in the bestiary index:
`resolveCreature(name)` → assert: returns an object; `hp` finite > 0; `ac` finite in 5–30; `cr`
defined. `cmFoeFrom(entry, name)` builds without throw. Its attack spec passes `cmRollDamage(spec,
false)` and `cmRollDamage(spec, true)` with finite results ≥ 0 (100 rolls each; NaN once =
`corrupt`). If the entry carries a custom d10 table, roll it 20× without throw. Then one full
exchange: `resolveAttack` foe→PC-fixture and `pcAttack(sh, …)` PC→foe, assert INV on both. Support
`--only='<name>'` for repro. Entries `resolveCreature` legitimately can't find are `skipped` with
the name listed (silent-cap rule: skips are counted, never hidden).

**(b) CR band sims.** PC fixtures: Fighter and Wizard L1 sheets (reuse the sheet-builder pattern
from `dev/verify-levelup.mjs`), leveled to **{1, 3, 5, 7, 10}** via `awardXp` +
`applyLevelUp` (equip the class kit; `defaultEquip` for slots). Opponents: `cmPickByCR(cr)` for
CR ∈ **{0, 1/4, 1/2, 1, 2, 3, 4, 5, 6, 8, 10}**. For every (class × level × CR) cell run **50
sims**: side-based alternation, PC uses `pcAttack` every round (Wizard: same — this measures the
engine's math, not tactics; note the limitation in the report), foe uses `resolveAttack`; fight
ends when either side's hp ≤ 0. **Watchdog 30 rounds** → `review` stalemate finding (cell noted).
Assert per sim: no throw, INV, hp values finite. Record per cell: winRate, meanRounds,
meanPcHpLost, pcDeaths.

**Rulings.** The stats table is **tuning data for Adam/Fable — explicitly NOT gated**, with two
directional sanity gates only: L10 vs CR0 winRate ≥ 0.95 and L1 vs CR10 winRate ≤ 0.10 (violation
= `wrong` — the math is inverted somewhere). XP check: on each PC win assert `crXp(cr)` returns a
finite positive number matching the SRD CR→XP row for that CR.

**Acceptance:** exit 0; `invoked = <bestiary count>` in part (a) (read the count from the loaded
index at runtime — do not hardcode 510); 5,500 sims completed in (b); stats table present.
**Canary:** monkeypatch one bestiary entry's hp to `"3d8+banana"` pre-run → ≥1 `corrupt` finding.

## §5 G3 — level-up walkthrough, 12 classes × L2–10  (`dev/gauntlet-3-levelup.mjs`)

For each of the 12 base classes: build an L1 sheet (same builder as G2b), then for L = 2..10:
`awardXp(sh, xpForLevel(L) - sh.xp)` → assert `pendingLevelUp(sh)` true → `applyLevelUp(sh, L)` →
assert: `sh.level === L`; PB = `pbForLevel(L)`; `maxHp` grew within the `hpGainPerLevel` bounds
for the class die; spell-slot rows equal `CLASS_PROGRESSION` for that class/level exactly
(casters), absent/zero for non-casters; features list contains every feature the progression
names for L. Then **render the level-up picker UI at every level** (drive the same render entry
`dev/verify-levelup-picker.mjs` drives) and assert: subclass choice appears at that class's
subclass level and no other; ASI/feat choice at 4 and 8; new-spell counts match the progression's
delta; INV text scan on the rendered panel.

**Ruling:** any mismatch vs `CLASS_PROGRESSION` = `wrong` (the data is generated — the bug is in
`applyLevelUp` or the picker, never "fix the data"). 108 (class, level) cells; report a
per-class ✓ grid. **Acceptance:** exit 0, 108/108 cells attempted, per-cell results in report.
**Canary:** monkeypatch `pbForLevel` to return 2 always → must emit `wrong` findings at L5+.

## §6 G4 — sidekick/companion states  (`dev/gauntlet-4-companions.mjs`)

With the fixture world + PC: `hireCompanion(w, {…})` (a hireling from the sidekick data path) →
`renderWorld()` → assert the sidebar/panel names the companion (INV scan). `promoteSidekick(w,
{…})` → assert `companionSidekickLevelWith(w, pcLevel)` tracks PC level at PC levels 1/5/10.
Wages: `companionChargeWages(w, 3, pc)` → gold decreases by the posted rate ×3, never below 0
(`corrupt` if negative). Loyalty ladder: `companionAdjustLoyalty` to both clamps
(`companionClampLoyalty` bounds hold). Combat presence: stage the combat tracker per
`dev/verify-combat-tracker.mjs`'s pattern with the companion present; companion hp → 0 → assert
the desertion/heroic-stand path (`companionHeroicStandAvailable` → `companionConsumeHeroicStand`,
else `companionDesert`) runs and the UI reflects it; `dismissCompanion` → panel clears. Assert INV
+ save/load round-trip (G6's helper) with a companion active.

**Acceptance:** exit 0, all staged states rendered, results per state in report.
**Canary:** monkeypatch `companionChargeWages` to skip the gold floor → `corrupt` finding.

## §7 G5 — the Monkey Session (full-flow, 12 classes)  (`dev/gauntlet-5-monkey.mjs`)

One scripted life per class, zero model calls, INV asserted **after every numbered step**:

1. New world via the world-genesis ritual path (the flow `dev/verify-dm-events.mjs`'s boot
   smoke-test exercises), then full bardo creation driving the real beats (crib the bardo driver
   from `dev/verify-creation-picks.mjs`), taking the "🎲 choose for me" path for every choice.
2. Enter the world; run one travel walk (the walk path `dev/verify-travel-walks.mjs` drives).
3. Force one encounter → full combat vs `cmPickByCR` at a level-appropriate CR (reuse G2b's fight
   loop) → on win, XP lands (`awardXp` fired by the resolution path, sheet xp increased).
4. Loot: `applyEvent(w, {type:"item_changed", …})` granting one weapon + coins; equip it
   (`applyEvent` `equip`); assert `cmSheetAC(sh)` and equipped damage stay finite.
5. Shop: open the dev test-shop; `buyItem` one affordable line (gold falls by the attitude-tinted
   price, stock decrements); `sellItem` one instance (gold rises, instance leaves inventory);
   attempt a buy costing more than current gold → refused via `buyRefusalMsg`, gold unchanged.
6. Rest (`applyEvent` `rest`): hp → maxHp, slots restored, **clock advanced**.
7. Level up when XP crosses a threshold (G3's per-level asserts at whatever level is reached).
8. Loop steps 2–7 until PC death occurs naturally; if still alive after **25 loop iterations**
   (watchdog), force death via `killCharacter(id)` and note `forcedDeath: true` in the report.
9. Death: death-save events if the path offers them → `openBardo(c)` → bardo passage renders
   (INV scan) → `spawnSuccessorOnPlane()` → new PC exists in the SAME world; ledger + codex
   survived; `closeBardo()`.
10. Save/load round-trip (G6 helper) on the final state.

**Acceptance:** exit 0; 12/12 classes ran all 10 steps (per-class step grid in the report; a class
that couldn't complete a step = finding at that step, remaining steps marked blocked — never
silently skipped). **Canary:** monkeypatch `awardXp` to set `sh.xp = NaN` → `corrupt` at step 3.

## §8 G6 — save/load round-trips at every depth  (`dev/gauntlet-6-persistence.mjs`)

Exports helper `roundTrip(label)` (G4/G5 import it): `saveU()` → capture the localStorage value →
boot a **fresh jsdom instance** with that value pre-injected → `loadU`/`migrateAll` → deep-compare
the two `U`s via normalized `JSON.stringify`. **Ruling on diffs:** byte-equal is the expectation;
any key that legitimately differs (migration stamps) goes in an explicit allowlist **in the
harness source with a comment justifying each** — an unexplained diff is a `corrupt` finding.

**Checkpoints:** fresh world · mid-bardo-creation · mid-combat (tracker active) · shop open ·
L5 PC with inventory+companion · dead PC in bardo · post-rebirth successor. (Stage via G5's flow,
pausing at each.)

**Also:** (a) load the committed fixture `dev/fixtures/gauntlet-world.json` through `migrateWorld`
→ no throw, INV; (b) **size audit** — serialized bytes at each checkpoint + a synthetic long world
(append 500 ledger entries + 200 codex records via the real append paths) → report bytes; if a
linear projection of 100 sessions exceeds **2.5 MB**, emit `review`; (c) **quota behavior** — stub
`localStorage.setItem` to throw `QuotaExceededError` once → `saveU()` must not corrupt in-memory
`U` and must surface *something* user-visible (toast/error); silent swallow = `corrupt` finding
(the "worlds persist forever" promise failing silently).

**Acceptance:** exit 0, 7/7 checkpoints compared, size table present.
**Canary:** drop one inventory instance from the reloaded `U` before compare → `corrupt`.

## §9 G7 — applyEvent fuzz  (`dev/gauntlet-7-event-fuzz.mjs`)

**Enumerate event types at runtime** by regexing `src/world/dm.js` for `case "([a-z_]+)"` inside
`applyEvent` (~40 today; auto-picks up batch-3 additions — never hardcode the list). For each
type, fire `applyEvent(w, e)` with each of **5 hostile payload families**: `{type}` only (empty) ·
every field `null` · every numeric field a string (`"abc"`) · ids that reference nothing
(`"no-such-id"`) · extremes (`1e9`, `-5`, `NaN`, 10k-char strings). Snapshot `w` (deep clone)
before each call.

**The contract (ruling):** a malformed event may **no-op, clamp, or log — it must never throw and
never leave corruption behind.** After each call assert: no uncaught throw (`crash`); INV holds;
no `NaN`/`undefined` newly persisted anywhere in `w` (walk the diff vs the snapshot — new NaN =
`corrupt`); `gold`/`hp` still finite. Also fire 20 fully-random events (seeded) with unknown
`type` values → must hit the forward-compatible no-op path.

**Acceptance:** exit 0; report shows `types × families` grid fully attempted (≈200 calls + 20
randoms). **Canary:** monkeypatch the `hp_changed` case to skip its number coercion → feeding
`{amount:"abc"}` must yield a `corrupt` finding.

## §10 G8 — visual state screenshot sweep  (cheap-vision-driven; human reviews only flags)

Screenshotting the UI and doing the first-pass "is anything visibly broken" scan is mechanical
vision work — **not** a Fable job. A cheap vision model captures and pre-triages; only *flagged*
frames escalate to a human, and the "does this look on-brand" call is Adam's anyway (the Ivalice
style is still provisional).

**Sonnet deliverable:** `dev/gauntlet-8-stage-states.js` — a browser-console-pasteable script
exposing `gauntletStage(n)` for n = each state: title/start · bardo mid-creation · in-session
default · level-up picker (caster + martial) · combat tracker mid-fight · shop Buy · shop Sell ·
dice overlay mid-roll · companion in sidebar · death saves · bardo passage · rebirth. Each stager
builds the state from the fixture world using the same calls G1–G7 use. No screenshots, no
judgment — staging only.

**Cheap-vision pass:** a cheap vision model serves the app, drives Chrome through
`gauntletStage(1..N)`, screenshots each state, and does the **gross-defect scan only** — overlapping
elements, empty required panels, text overflow/cutoff, and any visible `undefined`/`NaN`/`[object
Object]`. It appends `ugly`/`review` findings to the same report (same contract as §2) and produces
an annotated contact sheet, **flagging** which frames look wrong. It does not make aesthetic calls.

**Human then:** reviews only the flagged frames (plus the contact sheet at a glance) and rules on
anything aesthetic/on-brand. **Runs LAST, after the gap-wiring batch lands** (UI may shift under
it).

---

## §10b G9 — procedural visual CALIBRATION (the aesthetic-tuning loop G8 is not)

*Formalized 2026-07-03 from Adam's flag (the gap was named the day the Blockwright diorama landed
harness-green but aesthetically unseen; it had lived only in session notes since).* G8 is a
gross-defect scan and explicitly makes no aesthetic calls — G9 is the missing other half: **a
recurring Fable+Adam render-look-tune loop with authority to CHANGE the visual constants**, not
just flag them.

- **Scope:** every procedural visual surface — now the **battle theater** (`docs/BATTLE-THEATER.md`:
  board tint pairs, tile contrast, camera elevation, fallback-figure proportions, model-pack scale/
  tint mappings, FX primitives) plus whatever blockwright still renders (scenery/FX idiom).
- **The loop:** stage a canonical fight set (the G8 stager's combat states + the theater preview
  fixtures) → screenshot → judge **against reference** (the FFT frames from the 2026-07-03 ruling:
  tile-column heightfields, discrete steps, top/side contrast, void ground) → tune the constants
  directly → re-shoot → land as a normal unit. Screenshots ride the chat so Adam rules in-line.
- **Gate:** G9 runs before any playtest that SHOWS the theater/diorama to a player, and re-runs
  whenever a visual constant set changes hands (a pack lands, a kit is added, a palette shifts).
- **Precedent:** the first G9 pass ran 2026-07-03 (the battle-states screenshot session) — verdict
  "an old autechre video," which produced the BATTLE-THEATER ruling itself. That is the loop
  working; keep it.

---

## §11 Build order, run order, and the loop back through the ladder

- **Build order:** G1 → G5 → G2 → G3 → G6 → G4 → G7 → G8-stager (cheapest-per-bug first; G5
  depends on G6's `roundTrip` helper — build that helper first inside G6, flows after).
- **Full-report run:** on **post-batch-3 master** (re-run everything there even if built earlier;
  collision-zone findings from earlier runs get re-checked and closed or confirmed).
- **Definition of done (Sonnet, rungs 1–2):** all 7 harnesses exit 0 end-to-end on the run commit;
  every canary demonstrated RED (canary exit codes listed in the report); `dev/gauntlet-report.json`
  + `dev/GAUNTLET-FINDINGS.md` written; per-harness acceptance numbers met; zero edits outside the
  §1 allowlist (`git status` shows new `dev/` files only).
- **Then up the ladder (§0):** **Opus** triages (rung 3) → **Sonnet** fixes one batch at a time on
  its own branch, each with a RED-first regression check (rung 4) → **Fable** re-runs every
  `crash`/`corrupt` repro line and the gates red→green and reads the CR-band tuning data (rung 5) →
  **loop** the affected harness until clean; hold `collisionZone` findings until gap-wiring lands.
  G8's cheap-vision pass + human flag-review runs last. Only when the signal is quiet does Adam's
  live playtest (`docs/AUTOMATED-PLAYTEST.md` first, then hands-on) begin.
