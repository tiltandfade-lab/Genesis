---
type: session-handoff
project: Genesis
updated: 2026-07-03
---

# Genesis — Session Hand-off

*Read this first in a new session. It orients you; the linked docs are the source of truth.*

## ⭐ Latest (2026-07-03 (later 3) — COMBAT-LIFECYCLE SPECCED: the battle stack is UNREACHABLE in live play) [Fable]

**A Fable evaluation pass on the in-game battle + transitions found the load-bearing gap:** every
combat layer is built and unit-green, but **no fight can ever start in live play** — `combatStart()`
and `combatOutcomeEvents()` have zero app callers, there are no `combat_start`/`combat_end`
events, the PC's `attack` never damages its target foe, `dmDigest()` has no combat block (the
runbook's `digest.combat.proposals[]` was never built), and nothing advances `GS.combat.round`.
The tracker/battlemap/diorama/tactics stack renders "No fight in progress." forever. Neither
shakedown run had a fight, so this was never felt.

**The fix is SPECCED, Sonnet-ready: `docs/COMBAT-LIFECYCLE.md`** — the orchestration seam only
(3 new applyEvent cases + the attack-damage patch + digest.combat + the `foe_action p.action`
extension + prose twin + the "Running a fight" runbook section + an 11-check red-first harness).
9 decisions made in §9, doctrine-grounded; nothing awaits a ruling unless Adam objects.

**Do next (pick up here):**
1. **Execute `docs/COMBAT-LIFECYCLE.md`** (Sonnet on `feat/combat-lifecycle`, Opus review,
   re-gate the §7 sweep personally). This gates any playtest with a fight in it — run it BEFORE
   the persona rotation resumes, or every rotation fight runs theater-of-mind with the whole
   battle stack dark.
2. **Then resume the persona rotation** (rig proven, briefs staged, "Copper's Marsh" founded +
   cold — see the (later 2) entry below; budget pre-flight first).
3. Adam's open rulings + the small fix queue carry unchanged from (later 2): SD-003 ·
   ridden-wyvern stat lines · SD-009/010/011 · TIYL wiring (SD-004/005) · G2-1976 lethality gate
   (post-playtest tune).

## Previous (2026-07-03 (later 2) — POST-BATCH-3 HARDENING: gauntlet + shakedown + 4 fixes + THE LATENCY LAW) [Claude Code]

**The hardening arc between batch 3 and the persona rotation — the game is measurably sounder and
the test pyramid below Adam's live playtest now exists.** Full detail: `docs/CHANGELOG.md`
2026-07-03 (later 2); playtest findings: `dev/playtest-findings-shakedown.md` (SD-001..011).

**What shipped:** the Layer-0 gauntlet (G1–G8 + Monkey Session + applyEvent-fuzz, every canary
proven RED first; final sweep **81 harnesses / 0 failures**) · an automated shakedown playtest vs
the REAL bridge + DM stack (2 runs) that validated the whole bridge economy live (digest diet
9.0KB median · roll-branches zero-second-inference · gen mint+bind · lane stamps · BLIND-PLAYABLE
survived a total visual failure) · four live bugs found-and-fixed same-night with red-first checks
(saveU quota abort, 6 attackless bestiary creatures, the black-screen first-turn blocker, prep
name collisions) · **THE LATENCY LAW** (SPEED-DOCTRINE rule 7: no launch until routine turns ≤15s;
measured — the agent-loop round-trip tax is the slow part, not the model; two-call turn protocol
now in the runbook; DM-SEAT ~Sept 2026 is the launch-unlock).

**Verification:** all merges re-gated personally (never subagent-reported): manifest OK ·
verify-storage 35/0 · verify-wake-prep 54/0 · verify-combat 52/0 · verify-prep* green ·
verify-dm-events 36/0 · the 81/0 full sweep. G2 lethality gates PASS both classes.

**Do next (pick up here):**
1. **RESUME THE PERSONA ROTATION** — rig proven, two-call + low-effort briefs staged; run 1's
   world ("Copper's Marsh", Copper-Miners vs Hearth-Watch, casts pre-rolled) sits founded + cold.
   Bridge up (`python3 dev/dm-bridge.py`), clear `dev/.playtest-stop`, relaunch DM (Opus, low
   effort, two-call law) + player (Sonnet, low effort, reasonable persona) → then cautious /
   reckless / rules-lawyer / chaos, Critic per run, Fable Analyst over the batch. **Budget
   pre-flight first** (the overnight lesson: both agents died at the session token limit).
2. **Adam's open rulings:** SD-003 (opening digest full-ship vs lean) · ridden-wyvern stat lines
   (minimal edit proposed: swap the "(same as standard wyvern)" line for the SRD Bite+Sting,
   Rider block untouched).
3. Small fix queue: SD-009 (clock inert in conversation — the time-advance event, felt live now) ·
   SD-010 pending-indicator affordance · SD-011 draft-preserving re-render · TIYL species/attitude
   wiring (SD-004/005).
4. DM-SEAT build window ~Sept 2026 — until then, loop-rig efficiency work is the latency track.

## Previous (2026-07-03 (later) — gap-wiring CALLER seams landed: BATCH3-PLAN unit 1 CLOSED) [Claude Code]

**The five wave-2a tables that shipped compiled with no call site now FIRE in-app.** Batch 3 landed only
gap-wiring's PURE engine half (chaseInit/…/shrineOmenRoll, 29/0); this follow-up (branch
`feat/gap-wiring-callers`) lands the caller half BATCH3-PLAN unit 1's tracking line held OPEN.

**What shipped:** `world.dm`'s `applyEvent` gained five seams (`src/world/dm.js`) —
`chase_start`/`chase_round`/`chase_yield` drive a transient **`GS.chase`** gap clock (created/cleared by the
caller, mirroring `GS.combat`; payload `{targetFid|npcId, terrain}`; fires on a resolved morale-flee +
declared pursuit), plus `downtime` (fixed 6-intent vocab; seek-work→JOB-WALKS; gold via `item_changed`,
contact via the drift-contact path, rumor via `distant_word`), `distant_word` (a Distortion binds to a REAL
non-current-node ledger fact; the true fact rides `dmOnly` only), and `shrine_omen` (its `[the myth]` bound to
`w.seed.myth`). **festival + distant-word already fired** from `applyDriftEffect`'s `festival`/`rep` tags
(wiring-sweep-B) — this covered the three seams that had none plus a first-class `distant_word` event. `GS.chase`
added to `src/state.js`. New harness `dev/verify-gap-callers.mjs` asserts each table fires from its seam.

**Tarot re-check (the unit's second half):** every built Major mutator `op` resolves through `tarotMajorVector`
(`verify-gap-callers.mjs` §6). The Moon's `crackedLensBias` — the guardrail's licensed nearest-implementable ref
for "every Distant Word rolls two lenses" — **still stands**: `distantWordRoll` returns ONE lens with no
lens-count hook, so no natural "two lenses" backing exists; the substitution resolves cleanly. No change needed.

**Verification:** `check-manifest` RESULT: OK · **`verify-gap-callers` 24/0** (chase_start GS.chase mutation
guard shown RED→GREEN) · full sweep **69 harnesses 0 nonzero-exit** — zero regressions. Docs updated coherently
(CHANGELOG, EVENT-CONTRACT, BATCH3-PLAN unit 1 → CLOSED, gap-wiring.js + tarot.js header notes).

**PUSHED to origin** (Adam confirmed): merged `--no-ff` (merge `89dac30`) and `git push origin master`
(`92c67e5..89dac30`). Note: `origin/master` was already at the batch-3 tip (`92c67e5`) — batch 3 had in fact
been pushed; the prior "NOT pushed" handoff note was stale. The branch `feat/gap-wiring-callers` stays (it's
the active worktree HEAD, so not deletable in place) — safe to prune once the worktree is torn down.

**Do next (pick up here):**
1. **The pre-playtest gauntlet** (`docs/PRE-PLAYTEST-GAUNTLET.md`, SPECCED) → Layer-1 automated playtest →
   **Adam's live bridge playtest** — the chase/downtime/distant-word/shrine seams get FELT there (does the DM
   actually emit `chase_start` on a morale-flee, does a downtime week read well, does distant-word land as a
   real distorted rumor).
2. Adam skims: the hot-tail reband rows (PROVISIONAL), the realm d50 tables, the realm vocabulary.

## Latest (2026-07-03 — BATCH 3 LANDED: 16 units merged, 69 harnesses 0-failed) [Claude Code]

**The overnight batch-3 build is on master.** Two stacked lines (flake-fixes→gap-wiring→safety-guard→
touched-npcs→urban-fabric→job-walks→wiring-A→wiring-B→dm-eval→forever-guards, and
spice-reband→skin-grants→breach-core→breach-tables→outlandish-realms→realm-tables off the
gap-wiring tip) were integrated on a temp branch, the join resolved (Place Drift row-by-row merge
keeping BOTH the reband and the Effect column; manifest deps unioned; tables recompiled → 366),
and the **full gate sweep run on that exact tree BEFORE any master merge: check-manifest OK ·
69/69 harnesses 0-failed.** Then 16 `--no-ff` merges + the digest-diet cherry-pick replayed onto
master and the final tree verified **byte-identical** to the gated integration tree. Unit branches
deleted. Full unit-by-unit detail: `docs/CHANGELOG.md` 2026-07-03.

**J4 frontier prose landed** (docs/batch3-landed): DM-CHARTER **§8.3c Retcon Negotiation**
(IRONMAN ALWAYS — pre-consequence scope, never death, logged as `adjudication`) + **§9.3a the
prejudice line** (real-world slurs banned absolutely; fictional-peoples prejudice NPC-voiced only);
DM-BRIDGE breach registers (membrane/ambush/stageRules) + `gen interior opts.type`. The two
pre-playtest spec docs (`PRE-PLAYTEST-GAUNTLET.md`, `AUTOMATED-PLAYTEST.md`) are committed.

**PUSHED** — origin/master is at the batch-3 tip (`92c67e5`); the earlier "awaits Adam's go" note was stale.

**Do next (pick up here):**
1. **THE FORTNIGHT plan resumes** (push already done).
2. **The pre-playtest gauntlet** (`docs/PRE-PLAYTEST-GAUNTLET.md`, SPECCED — awaiting its Sonnet
   execution batch) → then the Layer-1 automated playtest → then **Adam's live bridge playtest.**
3. **gap-wiring's CALLER half — ☑ LANDED** (2026-07-03 later; see the ⭐ entry above). The five tables now
   fire in-app via the applyEvent seams + `applyDriftEffect`; BATCH3-PLAN unit 1's tracking line is CLOSED.
4. Adam skims: the new hot-tail reband rows (PROVISIONAL), the realm d50 tables, the realm vocabulary.

## Previous (2026-07-01 night — BATCH-1 ART WIRED · STYLE NOW PROVISIONAL) [Claude Code]

**Adam generated the whole `ASSET-PROMPTS.md` list; the isolation + shallow wiring landed — and the
big ruling: the engraved-Ivalice style is PROVISIONAL (`DESIGN-GUIDE.md §II.0a`).**

**What shipped (two merges: `e4a17d5`, `ce45149`):** 12 assets magenta-keyed/trimmed (raws preserved
in `ui-sketches/ivalice-style/generated-070126/`); seamless 1254² textures drop-in by filename; the
engraved **GENESIS wordmark** replaced the CSS-gradient title; the scene whisper became the **banner
plaque** (9-slice border-image, finials never stretch); feed speakers got the **You/DM medallions**
(sapphire compass / ruby sun); shop header got storefront + coin-purse. Banked-unwired: battle arena
+ rings, skull, door-arched, crossed-keys.

**THE RULING (§II.0a — gates all deep visual work):** Adam is weighing a **low-poly FFT/PS1 re-skin**
(the battle theater may render low-poly 3D and the UI should match). Do NOT push the engraved style
deeper — no new asset generation, no more screen ports — until **style probes** (2–3 candidate looks
on title + in-session; hybrid low-poly-scene-in-engraved-chrome is a live option) settle it. The skin
is swap-cheap by design (CSS vars + asset URLs only).

**Verification:** manifest OK · `verify-in-session-ui` 74/74 · `verify-shop-ui` 46/46 ·
`verify-dm-events` 36/36. (`verify-bridge` deliberately NOT run — a live playtest bridge was up on
5175 at close; it resets the `.dm` mailbox.)

**Do next (pick up here):**
1. **THE LIVE BRIDGE PLAYTEST** — still the standing checkpoint; a bridge was already running on
   5175 at close. Everything merged today gets felt in play.
2. **Style probes** (when Adam wants the re-skin discussion) — the gate on all deep visual work.
3. **T3 noun handshake** (talk-through first; open Q: DM-requested rolls — visible dice or behind the screen).
4. Abilities-tab layout (carried).

## Previous (2026-07-01 evening — PLAYTEST CHECKPOINT: SHOP UI + DICE THEATER + DE-CLAUDE PASS + DESIGN-GUIDE) [Claude Code]

**The "walk batch" — five labeled merges, all gates green, ready for a real playtest.** Session shape:
full repo/vision audit → Adam interview (4+4+4 rulings) → `docs/DESIGN-GUIDE.md` (pillars + Ivalice
visual bible + roadmap T0–T7) → autonomous build run while Adam walked.

**What shipped (each its own `--no-ff` merge):**
1. **De-Claude visual pass** — engraved rail icons from the ChatGPT Ivalice set (the visual CANON per
   Adam's ruling — "too Claude" was asset fidelity, not CSS), recropped textures, all px corner-radii →
   0 app-wide (verifier-enforced), purple retired. Sidebar **spell slots** under HP/AC (inline pip
   groups; Pact row steel).
2. **Shop UI** (`docs/SHOP-UI.md` BUILT) — Buy|Sell tabbed panel, confirm-on-plaque, **attitude-tinted
   prices** (±10%/rung, engine-owned `att` param), coin pool hidden w/ soft warnings, `open_shop` event +
   `w.shops` persistence + dev test-shop. **The money loop is clickable end-to-end.**
3. **Dice board overlay** (`docs/DICE-OVERLAY.md`) — polyhedral roll theater on every player-facing roll:
   CSS/SVG tumble, click-to-roll, engine-predetermined results, adv-pair dim, crit-magnitude stage-2
   drop, Ivalice engraved faces. Rides `dmRollFor`/`dmRollDice` — zero new roll paths.
4. **`docs/ASSET-PROMPTS.md`** — Adam's image-gen shopping list for the remaining T1 assets.
5. Plus (same day, separate sessions): `check-manifest.py` **163s → 0.2s**; docs index de-drift.

**Verification (re-run on merged master, not self-reported):** `check-manifest` OK ·
`verify-in-session-ui` 74/74 · `verify-shop-ui` 46/46 · `verify-economy` 43/43 unmodified ·
`verify-dm-events` 36/36 · every new check mutation-tested red→green · shop + dice + sidebar
live-walked in Chrome (screenshots in-session).

**Standing agreements (2026-07-01, in memory + DESIGN-GUIDE appendix):** UI-improvement calls are
Claude's to make autonomously (within the Ivalice bible); **every other tier is talked through with
Adam first.** Battle visuals = band-lane theater. Product = bridge now, pluggable DM seat later.

**Do next (pick up here):**
1. **THE LIVE BRIDGE PLAYTEST** — the checkpoint this batch built toward. Everything merged today
   (SRD tissue, items, economy+shop, new UI, dice theater) gets felt in real play; it also generates
   the tuning data the parked decisions await (advancement re-tune, lethality, prefetch numbers).
2. **T3 noun handshake** (talk-through first — one open Q: are DM-requested engine rolls visible dice
   or behind the screen?).
3. **Asset generation session** per `docs/ASSET-PROMPTS.md`, then I wire each batch.
4. Abilities-tab layout (open design Q, carried).

## Previous (2026-07-01 — IN-SESSION UI REDESIGN + ECONOMY SPINE LANDED) [Claude Code]

**Two units landed together in one clean close** (both frontier-spec → Sonnet-execute → Opus-review, both
`/code-review`-gated). This session ran as a **parallel multi-agent build**: Opus specced each, Sonnet
executed in the background (the UI in the main tree, economy in a git worktree), Opus reviewed.

**What shipped:**
1. **In-session UI redesign** (`docs/IN-SESSION-UI.md`) — the game view rebuilt to the Claude-Design mockup:
   full-bleed edge-to-edge (no more centered container/floating cards), squared corners, a persistent status
   sidebar (HP+temp/AC/condition·exhaustion·inspiration badges/clock/location), the **R3 framed-tab rail**
   (Character·Actions·Map·⚙Menu), tabbed slide-in panels (Sheet w/ collapsible saves·skills · Inventory ·
   History; Actions·Abilities·Spells; Map), a ⚙ Menu popover. Feed prose +18% with dynamic reading-measure
   padding. Dice UI is contextual-only (standing tray removed). The port was REV-2: the first pass matched
   the old skin instead of the mockup — corrected by pointing the executor at the design file itself
   (`_mockup-clean.html`) with a **visual side-by-side** as the acceptance gate. `verify-in-session-ui` 58/58.
2. **Economy v1 buy/sell engine spine** (`docs/ECONOMY.md`) — pure pricing + shop/merchant model + buy/sell
   transaction validators (`data/economy.js` + `src/engine/economy.js`) that emit the existing `item_changed`
   event. Prices off SRD `cost` + an authored rarity band; place-tier stock gating; merchant-coin saturation
   guard. UI-free by design (no `render.js` edits) so it ran parallel to the UI work. `verify-economy` 43/43.

**Verification:** `check-manifest` OK · `verify-in-session-ui` 58/58 · `verify-economy` 43/43 · full suite 0
regressions · the `/code-review` on the UI branch surfaced 7 minor findings, all fixed (`dd5bef2`) — no
crashes/wiring-losses/regressions (the structural port preserved every handler).

**Do next (pick up here):**
1. **The shop-UI panel** — SPECCED + queued (`docs/SHOP-UI.md`). It marries the two units just landed: a
   contextual buy/sell panel in the new panel system driving the economy engine's `previewBuy`/`previewSell`
   via `open_shop` + `w.shops`. This is the natural next unit; its §1 says to reconcile symbol names against
   the now-merged reality first.
2. **The Abilities-tab layout** — the one open design question: the mockup shows the Abilities tab but never
   renders its body; the build uses class-resource dot-trackers as a stand-in. Adam to weigh in.
3. **Economy fast-follows** — lodging/lifestyle sink (the "shelter has an owner" model, already decided),
   valuable-loot content (gem/art tables), then the shop-UI's `open_shop` DM-event wiring.
4. A **live Bridge playtest** to feel the new UI + the new d20 tissue in real play.

## Latest (2026-07-01 — SRD MECHANIZATION BUILT) — check spine · conditions · concentration · combat actions · death saves · exhaustion [Claude Code]

**The last d20 gaps closed.** Adam asked what SRD mechanics remained unwired; an audit found the engine's
combat/items/progression spine was ~65% of the SRD, the gaps clustered in the *connective d20 tissue* the DM
still freehanded (a save vs a DC, whether two concentration spells can run, what "blinded" actually does,
whether a PC at 0 HP lives). Specced (`docs/SRD-MECHANIZATION.md`, six subsystems, all decisions locked) and
built same day via the frontier-spec → Sonnet-execute → Opus-review pipeline. Branch `feat/srd-mechanization`.

**What shipped (6 subsystems):** §1 check/save spine (`resolveCheck` + a computed margin-ladder `degree` +
`spellSaveDC` + Heroic Inspiration + an `absurdity` magnitude) · §2 concentration + the full 339-spell
`data/spells.js` index + ritual casting · §3 conditions engine (effect table + auto-derived adv/dis +
structured `ttl` durations + `round_tick` expiry) · §4 death saves + temp HP + massive-damage instant death ·
§5 exhaustion (−2/level) + falling/fire/suffocation hazards · §6 combat actions (action economy, Extra Attack,
opportunity attacks, contested grapple/shove). New events across the board (`EVENT-CONTRACT.md` extended).

**The Opus review caught real gaps (not self-reported green):** the §6 combat-action layer was unit-green but
integration-incomplete — Dodge/Disengage set flags nothing consumed, and grapple ignored the foe's Strength.
All fixed + mutation-tested. Adam's calls folded in: keep nat-1-fails / nat-20-succeeds on everything (*fun
beats nerd*) with the `absurdity` magnitude scaling the spectacle; Extra Attack + opportunity attacks + full
spell scope all IN — deferred only monster-AI *tactics*, T3/T4 executors, multiclassing.

**Verification:** `check-manifest` OK (64 modules) · **full suite green — 30 harnesses, 0 failed** (new: check
41, conditions 43, concentration 30, combat-actions 38, death-saves 33, hazards 30; zero regressions incl.
walk 2807, items 123, social 97, dm-events 36) · 3 review-fix guards mutation-tested red→green.

**Do next (pick up here):** the SRD is now near-fully mechanized. The natural next tracks —
1. **The UI design pass — ☑ LANDED 2026-07-01** (`feat/in-session-ui`, merged; see the ⭐ entry above). The
   three-zone concept — a persistent status sidebar (HP/AC/conditions/exhaustion/inspiration badges + clock),
   the narration feed as the full-height hero, a slim tabbed rail + slide-in panels — built and merged
   (`0e09128` + the REV-2 mockup-fidelity port `d126dfa` + review follow-ups), spec in `docs/IN-SESSION-UI.md`.
   The new mechanics want surfaces; this gave them theirs.
2. A **live combat-tracker UI** to drive the new `action`/`check`/`attack`/`opportunity_attack`/`grapple` events
   turn-by-turn (reachable but headless today).
3. The **ECONOMY buy/sell spine — ☑ LANDED 2026-07-01** (`feat/economy-spine`, merged; `docs/ECONOMY.md`).
4. A **live Bridge playtest** to feel the new d20 tissue (concentration breaking, conditions, death saves, the
   absurdity spikes) in real play — the only thing a verifier can't judge.

## Latest (2026-07-01 — ITEMS Part II code-review fixes) — charge aliasing, worn +AC, heal fallback [Claude Code]

**Post-build Opus code-review of the Part II commit, fixes executed by Sonnet, reviewed by Opus.** This was
also a live test of the frontier-spec → Sonnet-execute → Opus-review pipeline (see the auto-memory
`feedback-spec-rubric-sonnet-handoff`). Three findings, all fixed with mutation-tested regression checks.

**What shipped (`fix/items-part2-review-followups`):**
- **Charge aliasing (HIGH/blocker).** `enchOf` shallow-copied the catalog overlay, so a magic instance's
  nested `charges` shared a reference with `MAGIC_ITEMS_BY_NAME` — spending charges on a migrated/attuned
  item poisoned every sibling **and the global catalog** for the session. Fixed: `enchOf` deep-copies
  (`JSON.parse(JSON.stringify(md.ench))`, `src/engine/combat.js`).
- **Worn +AC items never wired (MEDIUM).** `cmSheetAC` ignored non-armor/offHand instances, so attuning a
  Ring/Cloak of Protection changed AC by 0 (and the ledger misreported it). Fixed: `cmSheetAC` folds
  `enchActive().acBonus + .bonus` over worn, attunement-gated instances outside those two slots.
- **Potion-heal fallback (LOW/defensive).** Fell back to flat bonus when `cmRollDamage` absent; now uses the
  dice average `n×⌊(die+1)/2⌋+bonus` (`src/world/dm.js`). Never fires in the full app.

**Verification:** `check-manifest` OK (57 modules) · `verify-items.mjs` **123/123** (was 117; +6 checks) ·
verify-combat 51/0 · verify-dm-events 36/0. Each fix guard was mutation-tested (fix off → red → on → green).

**Do next (pick up here):** unchanged from the Part II build below — the ITEMS system is complete and clean.
The natural next tracks remain the **economy buy/sell spine** (now fully unblocked — prices + mutators exist)
and the **pre-Fable combat runtime** (the `attack` path shipped in Part II but isn't yet driven by a live
tracker UI). See `NEXT-STEPS.md` "Do next."

## Latest (2026-07-01 — ITEMS Part II BUILT) — congruence + potions + charges + attack path + UI + grip + encumbrance + attunement [Claude Code]

**The entire ITEMS Part II shipped in one session.** Adam asked where magic-vs-standard items landed
(answer: congruence, recommended the night before) and flagged three things to clean up: the invented
`frozen`/`waterlogged` conditions, the half-baked potion scope, and the two Part-I carryovers. He confirmed
congruence (store charges; the item library becomes a real catalog by design) and said "build all of these,"
then "build the flagged items that remain before we clean close." So all of it landed.

**What shipped:**
- **Congruent magic-item model (`ITEMS.md` §E).** One instance shape: base type off `ITEMS_BY_NAME` via
  `inst.base` + a per-copy `inst.ench` overlay (`bonus`/`damageRider`/`acBonus`/`charges`/`attunement`/
  `rarity`) + optional `inst.codexId`. `MAGIC_ITEMS_BY_NAME` (261 items, generated from `magic-items.json`).
  `cmEquippedDamage`/`cmEquippedAC`/`defaultEquip` honor the overlay; helpers `magicDef`/`enchOf`/
  `enchActive`/`baseDef`/`attunedCount`.
- **All 27 potions mechanized (Decision 2)** — `item_use`: heal tiers numeric in-engine, everything else a
  structured `buff` the DM honors. **Charges** — `charge_spend`/`charge_restore` + long-rest refill.
- **Live attack path** — `pcAttack`→`resolveAttack` via a new `attack` event.
- **Interactive inventory UI** — new module `src/world/inventory.js`; Equip/Use/Grip/Attune buttons + badges.
- **Versatile grip (Dec 1)** — `versatile{n,die}` + `sheet.equipped.grip` (default 2h when off-hand free) +
  `set_grip`. **Encumbrance (Dec 4)** — `carryState` (soft STR×15→Speed 5, hard STR×30) + `item_changed`
  hard-cap refusal. **Attunement cap** — `attune`/`unattune` enforce SRD max-3; overlay dormant until attuned.
- **Conditions trimmed** — `frozen`/`waterlogged` cut, `rusted` parked.

**Verification:** `check-manifest` OK (57 modules) · **`verify-items.mjs` 117/117** · zero regressions across
the full suite. Browser smoke-check not run (Preview MCP can't spawn the server in-session); render verified
headlessly (exact button/badge HTML asserted).

**Where ITEMS stands:** Part I **and** Part II are now **BUILT**. Nothing from the ITEMS spec remains open.

**Do next (pick up here):** ITEMS is complete — the natural next track is the **ECONOMY** buy/sell spine,
whose pricing dependency (`ITEMS_BY_NAME.cost` + now the magic `rarity`) is fully satisfied. Alternatively,
wire the `attack`/potion/attunement events into a live combat tracker UI (they're reachable but there's no
in-app combat surface yet), or spec the parked `rusted` hardcore corrosion track. See `NEXT-STEPS.md`.

## Latest (2026-06-30, night — ITEMS completeness + Part II spec) — index the rest + wiring/UI spec [Claude Code]

**An overnight autonomous run finishing the ITEMS track: land the AC fix, index the remaining gear, spec
what's left.** Three units landed to master tonight in sequence (all `--no-ff`, all reviewed + gated):
`fix/items-review-followups` (code-review fixes + **AC from worn armor**), then this
`feat/items-completeness-and-ui-spec`. Gates: `check-manifest` OK · **all 13 verifiers green** (verify-items
71, all others unchanged) · verify-bridge 29 · generator idempotent.

**What shipped this unit:**
- **The item index is ~complete (175 items).** Added the SRD Tools table (24) + a hand-authored supplement
  (foci by form, the 2024-dropped 2014 pack items, a distinct Spellbook). Pack/kit resolution ~99%.
- **Shared `itemDef`/`itemKey`** (`engine.combat`) folding the curly apostrophe — fixes a real runtime miss
  (`Thieves' Tools` was indexed but never resolved in-app) and dedups 4 open-coded lookups.
- **Generator hardened** (header-text section slices not line numbers; `(Varies)` tools; no `cost:0`).
- **`docs/ITEMS.md` Part II (SPEC, not built)** — the missing fields, the full wiring plan, and an
  **inventory UI overhaul** spec. **6 latent decisions are gathered for you in `ITEMS.md` §"Latent
  decisions"** (and in the morning summary) — they gate the medium/large wiring; the small items don't need them.

**Where ITEMS stands:** Part I (type/instance split, equip slots, events, `cmEquippedDamage`, **AC from
armor**, the full index) is **BUILT + on master**. Part II (Versatile 2H, live combat runtime, economy
buy/sell, consumables, condition effects, the inventory UI) is **specced; the 6 decisions are now RESOLVED**
(`ITEMS.md` §Decisions, 2026-07-01) — ready to build against.

### Do next (pick up here) — the decisions are made; build against them
**Adam's calls (`ITEMS.md` §Decisions):** ① two-handed grip is **explicit** (a `grip` flag + wield toggle,
not inference); ② **mechanize all SRD potions** (24, numeric effects in-engine, duration-buffs as structured
DM-honored buffs); ③ **item conditions are mechanical** — the elemental-effects map is authored in
`ITEMS.md` **§D** (on-fire = the SRD Burning state 1d4/turn, poisoned-coated = Basic Poison +1d4, etc.);
④ **encumbrance is ON** — canonical SRD (over STR×15 → Speed 5 ft; hard cap STR×30, "no barrelmancers");
⑤ magic items → **recommend congruence** (one unified item model, argued in `ITEMS.md` **§E**; *pending
Adam's confirm*); ⑥ withdrawn.
1. **Cheapest first (`ITEMS.md` §B.1–2, needs no further input): Versatile 2H + structured weapon
   props/range/slot** — pure generator + `cmEquippedDamage`; also emits the `versatile` field the explicit
   grip (①) needs. Closes the one known combat-damage gap.
2. **Then the decided features:** the **elemental-effects map** (§D — small, high anti-drift value),
   **encumbrance** (§4 — the weight total already exists; wire the speed penalty + the STR×30 pickup refusal),
   **potions** (§2 — a `consumable` field + `item_use` event), and the **inventory UI overhaul** (UI-P1 =
   the equipped loadout + equip/wield-toggle buttons).
3. **The economy buy/sell** spine is fully unblocked (real prices + the `item_changed` mutator). Congruence
   (⑤) lands when the first magic wearable needs to affect AC/attack — confirm the recommendation first.
4. Still standing from earlier: a **live Bridge session** to feel the fast-lane + the new inventory/AC in play.

## Latest (2026-06-30, night — ITEMS build) — Items: type/instance split, specced AND built same session [Claude Code]

**Adam answered all 5 open design questions from the ITEMS spec in one message, then said "go ahead" —
spec→build happened in one continuous session.** `docs/ITEMS.md` is now `status: built`, all four
phases. Branch `feat/items-type-instance-split`. Gates: `check-manifest` OK (56 modules) ·
**`verify-items.mjs` 42/42** (new) · zero regressions across 11 other full-app verifiers (599 checks,
0 failed: dm-events 36, triage 27, combat 51, bridge 29, levelup 90, advancement 35, wake-prep 47,
social 97, prep 43, codex 57, rebirth-flow 19).

- **The bestiary pattern, reapplied to gear.** `build/gen-items.py` + `data/items.js`: 134 real SRD
  items (38 weapons, 13 armor/shield, 78 gear, 5 ammo) parsed from `equipment-weapons-armor.json` +
  `equipment.md`'s actual tables — not hand-guessed. `ITEM_CONDITIONS` (8, fixed vocab).
  `PACK_EXPANSIONS` + `KIT_ITEM_EXPANSIONS` resolve every pack/kit item string to real individual
  line items (54/66 + most kit lines mechanically matched; the rest honestly stay flavor-only).
- **`sheet.inventory` is instances** (`{id,name,qty?,conditions:[]}`), not strings — `migrateWorld`
  backfills old saves; character creation mints real instances, expanding packs fully (no more one
  bundled "Explorer's Pack" — "they came in a bundle but they're their own things," Adam's framing).
- **`sheet.equipped = {mainHand,offHand,armor}`** — named slots, because dual-wield needs two weapons
  equipped at once; a single pointer (the spec's first draft) couldn't represent that.
- **5 new events** (`item_split`/`condition_add`/`condition_remove`/`equip`/`unequip`;
  `item_changed.remove`→`removeIds`, id-targeted not name-matched).
- **`cmEquippedDamage`** resolves the PC's real weapon damage (Finesse/ranged-aware), honoring the SRD
  **base** two-weapon-fighting rule (off-hand: no ability mod unless negative) — surfaced in
  `dmDigest.pc.equippedWeapons` every turn, since `resolveAttack` itself still has no live runtime
  path (combat stays theater-of-mind; this is ready for whenever that changes).
- **Render** shows real instances, weight vs. capacity (`STR×15`, informational), condition badges,
  equipped slots (read-only this pass — no click-to-equip button; wasn't one of the 5 asks).
- **Honestly flagged, not built:** the combat tracker UI, an interactive equip control, economy-track
  UI (the economy track's *dependency* on this work — prices + a mutator — is now satisfied, though).

### Do next (pick up here)
1. **A live Bridge session with combat** would be the real test — does `dmDigest.pc.equippedWeapons`
   actually help the DM narrate accurate weapon damage, and does the inventory/weight/conditions
   display read well in play?
2. The other two latency legs (prep-fanout apply-back, Speculative Prefetch P1) still stand.
3. The economy track (`NEXT-STEPS.md` ⭐ ECONOMY) can now build its buy/sell spine on real prices.

## Latest (2026-06-30, night — fast-lane playtest) — `item_changed`: the missing inventory event [Claude Code]

**The first live Bridge test of the fast-lane triage, and it found a real bug.** Two turns played (Crowfoot,
bound prisoner of the Ochre-Stained, resuming at dawn on the chain-stair out of The Shimmering Maw): turn 1
correctly deep-laned (`new-place`, composed on Opus); turn 2 correctly fast-laned (`default-fast`, composed by
a **Sonnet 5** subagent) — and Sonnet 5 held the Charter voice well. The fast-lane mechanism worked exactly as
designed. Mid-session, Adam caught that his confiscated gear was still showing in the Character panel — the
EVENT-CONTRACT had **no event that could touch inventory at all**, so last session's "stripped his weapons and
kit" narration never actually mutated state. Branch `fix/playtest-inventory-and-icon`. Gates: `check-manifest`
OK · **verify-dm-events 36/36** (+6 new).

- **`item_changed` added to `applyEvent`/`EVENT-CONTRACT.md`** — the one event for gear/coin: `removeAll`
  (strip everything), `remove:[name]` (case-insensitive), `add:[name]` (loot, or recovering confiscated gear —
  every removal is ledger-logged with exactly what left, so it can be restored precisely), `gold` (signed delta,
  clamped at 0). Reconciled Crowfoot's sheet live mid-playtest — verified `inventory:[]`, `gold:0` in the
  running app's `/state`. This also unblocks the buy/sell/loot economy track (`NEXT-STEPS.md`) for free.
- **Spells rail icon fixed** — was silently falling back to a bare glyph (missing `assets/icons/wand.png`);
  now uses `book-arcane.png`. A dedicated wand icon is queued polish.
- **Two-session collision, handled cleanly:** the bridge ran while a second session (`feat/walk-consumption`)
  had uncommitted edits to the same files. Per Adam's call: no further code edits until the other session
  finished, then the two playtest fixes were cleanly extracted (`git stash` → fresh branch off `master` →
  `stash pop`) — confirmed zero walk-consumption leakage in the diff.

### Do next (pick up here)
1. **More live-Bridge play is the real test of the lane boundary.** Two turns isn't enough signal — both were
   "resume" re-entries, no mid-scene routine action vs. a deep reveal, no combat. A longer session with real
   verbs (travel, a fight, a skill check, an NPC conversation) is what actually stress-tests where Sonnet 5
   can hold and where it can't. Watch `laneReasons` per turn.
2. **CLAUDE.md gotcha to add:** the DM Bridge needs `python3 dev/dm-bridge.py`, not the plain `http.server`
   from "Run it" — cost the start of this session a "bridge unreachable" confusion.
3. The other two latency legs (prep-fanout apply-back, Speculative Prefetch P1) still stand.

## Latest (2026-06-30, later) — WALK-CONSUMPTION built: the DM stops forgetting the rolled walk [Claude Code]

**Session-Prep rolls 3 full walks every session (since 2026-06-23) but they only reached the DM ONCE — the
`⎘ Prep handoff` at session start.** `dmDigest()` carried no walk, so by turn ~3 the DM forgot it existed and
narrated freehand; there was also no provenance, so nobody could tell whether a walk was used. Came out of a
conversation about Adam's Hungering-Stone capture loop (the party fell into Pip's holding chamber, beside an
NPC already spying who became the escape lever) — his framing: *"the DM doesn't need to forget the walk
until the walk has been walked."* Spec'd as 5 ordered steps (`docs/WALK-CONSUMPTION.md`) and built **same
session** on branch `feat/walk-consumption`. Gates: `check-manifest` OK (55 modules) ·
**verify-walk-consumption 37 · verify-capture 21 · verify-prep 43 · verify-prep-bundle 50 · verify-seam 29 ·
verify-dm-events 30 — 0 failed**; full 24-harness regression sweep clean.

- **Step A — `activeWalkDigest()` adds an `activeWalk` block to `dmDigest()` EVERY turn**, not just at prep:
  segments with a `here`/`behind`/`ahead` cursor, the DM's reskin overlay by ref, the pre-cast cast — framed
  as a SOFT prior identical to the existing `sessionLean` contract. `w.prep.activeWalkId` + a per-frontier
  `cursor` (`src/world/prep.js`); `lockOnContact` sets it on entry, resumes it on re-entry.
- **Step D — walk length now scales with the PC's level** (`pbundleSegCount`/`pbundleLegCount`): L1–2 → 3
  segments … L9–10 → 7 (wilderness 3→5 legs). Content/threat stays tier-driven; only length changes.
- **Step C — `walkProvenanceReport()` (mirrors `codexProvenanceReport`)** answers "are the rolled walks even
  being used": planned-vs-walked, segments touched/rolled, a consumption ratio, surfaced via `seamHarvest`.
- **Step B — `walk_complete` finalizes provenance, clears the active walk, and PROMOTES the next un-walked
  prepped frontier** — re-anchored + flagged `needsReskin`, no fresh-space invention (the bundle already
  holds 3 rolled walks).
- **Step E — `src/world/capture.js` (new): capture as re-entry.** A `capture` event drops a subdued PC into
  a holding segment of the **active walk** (reused or minted — never a new prison subsystem), nominates a
  **pre-cast NPC** as the possible lever (DM decides ally/betray), and opens a **fireable** disposition
  front-clock. Captor = the most faction-hostile clock (live state); only 4 small noun tables are new dice.
  Generalizes the Hungering-Stone loop off rolled handles instead of DM freehand.
- **`docs/DM-BRIDGE.md` wiring — the load-bearing piece.** New "Read `digest.activeWalk` every turn" +
  "Capture as re-entry" sections tell the DM loop to actually read the field and emit
  `walk_advance`/`walk_complete`/`capture`. Without this the digest addition would just sit unread.
- **Concurrent-edit care:** the working tree had an unrelated in-progress `item_changed` inventory event in
  `src/world/dm.js` and an icon swap in `src/world/render.js` from a parallel session. Isolated via a
  hunk-level patch applied to the index only (`git apply --cached`) so this commit carries *only*
  walk-consumption — the other session's uncommitted work is untouched in the working tree for them to
  commit separately.

### Do next (pick up here)
1. **A live Bridge playtest is the real test** — does the DM actually narrate from `activeWalk` instead of
   freehanding past it, does `walkProvenanceReport` show real consumption (not near-zero), does a capture
   land cleanly mid-walk with a workable lever. This is empirical; can only be judged in play.
2. Tune `pbundleSegCount`/`pbundleLegCount`'s level curve and the `CAPTURE_HOLDING_TAGS` detection regex by
   feel once played.
3. The fast-lane / on-demand-generation / combat tracks below still stand — unrelated, pick up independently.

## Latest (2026-06-30, night — fast-lane build) — HYBRID FAST-LANE TRIAGE built [Claude Code]

**The first leg of the latency story, built.** `DM-BRIDGE.md` §"Hybrid fast-lane" was a strategy doc; now the
model-routing decision is **mechanized + wired** — a script-owned classifier stamps each turn's lane so the DM
loop routes routine beats to a fast model (Sonnet 5) and memorable ones to Opus, without the DM re-deciding per
turn. Branch `feat/fast-lane-triage`. Gates: `check-manifest` OK (54 modules) · **verify-triage 27 · verify-dm-events
30 · verify-bridge 29 — 0 failed.**

- **`src/world/triage.js` (`dmTriage`) — a PURE, script-owned classifier** (anti-drift: the script owns the
  routing; the noun, not the verb). Returns `{lane,model,reasons[]}`. Default **fast** (sonnet); escalates to
  **deep** (opus) only on pre-compose signals: `new-place` (first contact, via the new `w.dm.lastNarratedNodeId`
  marker), `combat-active`/`combat-action`, `pc-downed`/`pc-bloodied`/`pc-condition`, `clock-due`, `no-living-pc`.
- **`sendTurn` stamps `lane`/`laneModel`/`laneReasons`** on every turn; the bridge stays a dumb mailbox.
- **The runbook (`DM-BRIDGE.md`) now OBEYS `turn.lane`** — `fast` → a `model: sonnet` subagent, `deep` → Opus.
  The override is **upgrade-only** (lift fast→deep for a Mythic crit / revelation the DM foresees mid-compose;
  never down). *Script owns the floor; the DM owns the ceiling.*
- **`/code-review` (high) folded in pre-merge** — fixed the first-contact-fast-laned bug (`lastNarratedNodeId`
  now advances only when the scene is delivered, not on a rollRequest-only turn), the combat-verb regex (multi-word
  casts in, idiom verbs out), a dead param, and the manifest `\u` churn. 1 finding (a layering-forced `livingSheet`
  dup) deferred to `refactor/world-gen-layer`.

### Do next (pick up here)
1. **A live Bridge session is the real test** — feel the lane boundary in play: does Sonnet 5 hold the fast-lane
   turns, and does the deep set sit right? Tune via `laneReasons` — wherever Sonnet 5 can hold a deep-lane beat,
   widen the fast lane. This empirical calibration is *what the build was for*.
2. **The other two latency legs still stand:** wire `prep-fanout` → `prep_applied` apply-back into the DM loop
   (deep prep becomes automatic), and build **Speculative Prefetch P1** (deterministic reserve — buildable now).
   With all three legs, the slow turns mostly disappear.
3. Combat: the live-Bridge combat playtest + the deferred advancement re-tune still stand (below).

## Latest (2026-06-30, night — addendum) — "ENGINE OWNS THE NOUNS" decision [Claude Code]

**A design decision from the same Bridge playtest as the hardening work below; docs-only.** Its two doc edits
were carried to master inside the `feat/playtest-hardening` merge (`dae677e`); this is the changelog/handoff
backfill (own branch `docs/engine-owns-nouns-coherence`). The dividing line the playtest drew: **the engine owns
scene NOUNS** (NPCs / places / interiors / plot-objects via the existing `rollNPC`/`rollPlace`/`rollItem`/
`rollBuildingInterior`); **the DM owns the VERBS + meaning** (threads / motives / narration). A DM-invented
*thread* (the vanished lover was a mage who tore a self-cast passage and fled) was the *right* kind of invention;
freehanded scene NPCs + the house interior were nouns that should have been rolled (a rolled NPC's
flaw/bond/fear/leverage/want = handles the player can push = doors, not walls). **Key finding — it's a WIRING gap,
not authoring:** the rollers all exist and are rich (incl. the d300 `building-interior`), but prep fires them at the
rumored frontiers only and live play / the Bridge can't reach them at all. Full block in `DESIGN.md`; build track in
`NEXT-STEPS.md`. Bridge v1 gaps also surfaced (`rollRequest`/`dmRollFor` is d20-only → the 2d8 heal was hand-rolled;
the DM can't reach generators over the Bridge) — both fold into the on-demand-generation handshake.

**Do next (pick up here):** the **On-demand generation** track in `NEXT-STEPS.md` — ① ambient NPC pool at inhabited /
start locations (cheapest, kills the acute gap), ② wire `rollBuildingInterior` on building-entry, ③ the DM→engine
"request a roll" handshake (also unblocks non-d20 dice over the Bridge), ④ the NPC tiering gate.

## Latest (2026-06-30, night) — PLAYTEST HARDENING: fog-of-war, spellbook, dice, latency + prefetch spec [Claude Code]

**A long live-Bridge playtest, fixing what surfaced turn by turn — then designing the latency endgame.**
Branch `feat/playtest-hardening`. All gates green: `check-manifest` OK (53 modules, 481 symbols) ·
**verify-bridge 29 · verify-dm-events 30 · verify-social 97 · verify-combat 51 · verify-prep 43 — 0 failed.**

**What shipped (all from one playtest):**
- **DM/player vision split (fog-of-war):** the **map** shows only known nodes (`seeNode`/`mapVisibleIds`);
  the **ledger → "Chronicle"** shows only player-witnessed entries (`ledgerPlayerVisible`) with a DM-view toggle.
- **Gazetteer + Codex merged** into one "Codex" panel; the freed rail slot now holds a new **Spells panel**
  (casters-only) with a **dotted slot tracker** (grows L1–L9) + hover-for-text cards, pulling class **and feat** spells.
- **Player dice for every die, not just d20** — `rollRequest.dice` prompts + a free dice tray (`rollDiceExpr`).
- **Advantage/disadvantage mechanized** (`dmRollFor` 2d20 kh/kl via `rollRequest.adv`); roll feed shows the
  full breakdown incl. **proficiency**; **feed event chips** surface HP/slot deltas (`−7 HP → 5/12`).
- **Latency:** `/response` long-poll (instant pickup) + scoped `postState` + an on-tone wait line; and the
  two strategy docs — the **Sonnet fast-lane** and the **deep prep fan-out** (`dev/prep-fanout.workflow.js`).
- **Calibration:** `DIFFICULTY.md` **margin ladder** (miss by 5 = real failure, wiggle room only at −1/−2);
  `DM-BRIDGE.md` "mechanics the DM MUST fire" (state HP + fire `hp_changed`/`slot_spent`).
- Fixes: stuck black wake-fade; sheet dropping feat spells; session-counter off-by-one; sibling/whisper rolls.
- **Spec'd, not built — `docs/SPECULATIVE-PREFETCH.md`** (draft): pre-load the next turn's *assets* (never
  narration) in the player's idle window; unused recycles. Decision block in `DESIGN.md`, entry in `NEXT-STEPS.md`.

### Do next (pick up here)
1. **The latency trio is the live priority** — Adam's biggest pain (a 104s turn). Order: ① confirm the DM
   session runs the **fast-lane** + invokes **`prep-fanout`** at session start (runbook in `DM-BRIDGE.md`);
   ② build **Speculative Prefetch P1** (deterministic reserve — no LLM/bridge change, buildable now).
2. **Wire `prep-fanout` → `prep_applied`** apply-back into the DM loop so deep prep is automatic.
3. Optional: enemy/NPC advantage as a visible roll chip (a small `npc_roll` event).
4. Combat: the live-Bridge combat playtest + the deferred advancement re-tune still stand (below).

---

## Latest (2026-06-30, evening) — COMBAT ENGINE: spec firmed + bestiary wired + resolver built [Claude Code]

**The combat track. Promoted `COMBAT.md` sketch→spec (two forks resolved with Adam), then built the MVP
spine.** Branch `feat/combat-engine` — **merged to master** (`8e7c2fb`). The fix for
*creature = dead name-string*: the bestiary is now a played system.

- **The two forks (Adam's calls):** ① **the automation split — *the script owns the numbers, the DM owns the
  decisions*** (engine owns stats/rolls/HP/conditions/bands/CR-XP/events; monster turn *choices* + narration
  stay DM-narrated in v1, like the level-up picks). Dice transparency holds — the player rolls their own d20
  open, the engine rolls the monsters'. ② **side-based initiative** (PC side vs enemy side — a legal 5.5
  variant for solo pace; per-creature is the Fable upgrade). Logged in `COMBAT.md` + `DESIGN.md`.
- **Layer 1 — the bestiary index (`data/bestiary.js`, generated by `build/gen-bestiary.py`):** parses the 374
  monster files → **510 stat-block entries** (multi-block files split), AC/HP/CR/abilities at **100%**, attacks
  ~99%. Handles three ability-line grammars + the SRD-2024 Unicode-minus + Adam's custom `**AC:**` single-block
  format. **Adam's hand-authored custom d-tables carried VERBATIM** (95 of them) as `customTables`, never
  mechanized. `BESTIARY_BY_CR` indexes ids by CR for the resolver fallback.
- **Layer 2 — the threat→stat-block resolver (`resolveCreature`):** bridges the walk layer's creature *names*
  (which come from the threat-identity tables, not the asset library) to real stats — exact/normalized name →
  CR-band fallback (filtered by role/habitat/factionFit) → DMG quick-stats benchmark. No walk-on is ever statless.
- **Layer 3 — the resolver (`src/engine/combat.js`, `engine.combat`):** PURE like `engine.social` (operates only
  on transient combat objects, never `w`/codex). Side-based initiative, attack/save/damage math (pre-rolled d20
  honored → the player's open roll; nat-1 miss / nat-20 crit-doubles-dice / cover AC / resist-immune-vuln), range-
  band movement, `combatStart` (builds `GS.combat`), `combatFromEncounter` (the walk→combat wire), `combatOutcomeEvents`.
- **Layer 4 — CR→XP (`CR_XP` in `advancement.js`):** standardized SRD CR→XP; `encounter_resolved` now prices from
  **real foe CR** (objective-gated still — the milestone re-tune is the deferred ⚑ open item, *don't tune twice*).
- **The escalation wire (`kill{factionId}` → detected `clock_advanced`):** closes the `DIFFICULTY.md` gap — killing
  a faction's person advances its grievance clock → `clock_fired` → an authored named response, never stat-scaled guards.
- **`/code-review` (high) folded in (pre-merge):** fixed 3 correctness + 4 robustness/cleanup findings — the
  **flee-and-bank exploit** (`combatOutcomeEvents` now prices XP from *defeated* foes only, not everyone faced);
  the **dead-end escalation** (a kill that fills a faction clock now emits `clock_fired` **once on the transition**,
  so the agenda comes due — and stops re-spamming on later kills); `crXp`/`CR_XP` **registered** in the manifest;
  the parser's `is_table_section` guard **widened** to the `**AC:**` form (was narrower than the parser → could
  silently drop a custom monster); the **Python↔JS slug rule aligned** (article-strip — the 6 `the-*` ids now
  resolve by direct name lookup, not just the fallback scan); dead `cmAbilityMod` removed; the d20/advantage
  copy-paste extracted to `cmRollD20`.
- **Verification:** `check-manifest` OK (53 modules) · **`verify-combat` 51/51** (new; +3 review-fix guards) ·
  **all 21 verifiers green, 0 failures** (`verify-dm-events` 28→30, +2 escalation guards; advancement/levelup/
  walk/social/etc. unchanged).

**Do next (pick up here):** a **live Bridge playtest** is the real validation — feel the DM driving combat over the
resolver (the script owns HP/bands/rolls, the DM narrates). Then the **defined fast-follows** (not MVP, in `COMBAT.md`):
the in-app combat tracker UI · auto-objectified terrain→cover from the walk specs · per-creature initiative · monster/
companion AI · death-save automation. And the ⚑ **advancement re-tune** (un-gate CR-XP into the primary spine + demote
the milestone economy) — deferred until a playtest feels real combat XP.

## (2026-06-30, later) — Whole-repo code review + fix sweep [Claude Code]

**A full code review of the entire repo (5 parallel subsystem agents + a cross-cutting scan), then fixed
every actionable finding.** Branch `fix/code-review-sweep`; correctness/security/drift hardening, **no new
systems** — clearing the deck before the combat track. Overall verdict: the repo is healthy (clean globals,
no debug leftovers, the DM-agency line held); findings clustered around one theme + a few independents.

- **The theme — HTML-escaping asymmetry (the headline fix).** The DM-feed + character-sheet render paths
  were scrupulously `escHtml`'d; sibling panels weren't. Escaped: player-typed character name (stored-XSS in
  the roster cards), faction/pressure/gazetteer fields (`renderPowers`/`gazPanel`), Oracle text + filter,
  bardo/sheet labels. The roll button now passes DM-supplied args as `JSON.stringify`'d literals (guards the
  `'`-in-onclick case `escHtml` can't). Behaviorally tested end-to-end.
- **Security — DM-bridge path traversal.** `turnId` (a filename component, reachable cross-origin via the
  `*` CORS routes) is now charset-validated → no arbitrary `.json` read/write outside `.dm/`.
- **Correctness:** `lookup()` missing-table guard (was a hard world-gen crash); `applyLeverage` terminal
  attitude (a maxed NPC was a trivially-passable DC 5); `spendResource` refuses an over-spend; `attitude_shift`
  rejects a missing `to`; `findClockTarget` exact-first/unambiguous-prefix (was first-hit mis-targeting).
- **Tooling + drift:** `check-manifest` owns-regex catches `class`; scrub script archives-before-overwrite;
  audit dump off hardcoded `/tmp`; `SEED` phantom-global note corrected; `let U`→`var U`; dup CSS removed.
- **Bonus:** found + fixed **two verifiers silently broken on master** (`verify-plane`/`verify-proximity` — a
  `STAGES` stub colliding with `creation-flow.js`). The suite is now *genuinely* all-green.
- **Verification:** `check-manifest` OK · **all 20 verifiers green, 0 failures** (incl. walk 2807, social 97,
  dm-events 29, levelup 90, and the two repaired harnesses).

**Do next (pick up here):** unchanged from the morning — **⭐ SPEC THE COMBAT SYSTEM** (see the prior Latest
below). The two items the review *deferred* (not blocking combat): a `refactor/world-gen-layer` pass (engine
modules `world-gen.js`/`hexmap.js` mutate `w` / call up a layer) and deepening `check-manifest`'s layer-check
to scan real call sites, not just declared `callTimeDeps`.

## Latest (2026-06-30) — Loose-end sweep: XP rebalance + firing discipline + git cleanup [Claude Code]

**Cleared the standing loose ends before opening the combat track.** Branch `fix/xp-rebalance-and-loose-ends`;
all gates green. The session was a "are there loose threads?" sweep that resolved three:

- **XP rebalance (the headline).** A second playtest *still* felt inflated — the PC leveled after nearly every
  dialog. Two-part fix: ① **`discovery`/`fact_canonized` 10 → 1** (cap held at 30/in-world-day) so a chatty day
  tops out at 30 XP = 1/10 of a level — clue-hunting and dice-wins are now flavour, not advancement; ② the
  deeper fix, **DM-CHARTER §8.3b** ("XP is detected, not declared: the firing ladder") — the DM was *mis-firing
  the milestone events on conversational beats*. The new clause splits labor (DM judges *when* a beat lands and
  emits the event; the script owns *the number* — no `xp_granted`, no DM-named amounts) and defines what
  legitimately counts as `front_closed` (an arc ends, not a scene) vs `clock_fired` vs `choice_logged{major}`.
- **`xp_granted` is now an explicit no-op guard** (`src/world/dm.js`) — surfaced, not silently dropped. The
  door the 2026-06-28 rebalance closed can't be re-opened.
- **Success-Payout Binding (thread #3) → SUBSUMED by the Consequence Ladder.** Yesterday's work already built
  the primitives it called for: prose-fiat banned by §8.5; **bind-first = `clBindFirst`**, **roll-on-miss =
  `clOnMissPlan`** (authorship = the effect-die generate-to-contract-then-capture pattern → no new event-node
  table needed); clocking answered by the Diversion Rule. **Scope locked social-first.** Only the mint+capture
  call-site remains (deferred to post-playtest).
- **Git debris pruned** — stale merged remote branch + stale local branch + leftover agent worktree all gone;
  tree back to `master` / `origin/master`, single worktree.
- **Verification:** `check-manifest` OK · `verify-advancement` 35/35 · `verify-dm-events` 29/29.

**Do next (pick up here):**
1. **⭐ SPEC THE COMBAT SYSTEM (the agreed next track).** A rudimentary SRD/DMG combat layer *before* Fable —
   abstract "one move away / two moves away" range bands over the walk-module terrain (`walk.js`/`dungeon-walk.js`/
   `wild-walk.js`), SRD action economy, and **standardized CR-XP as the eventual advancement spine** (it then
   demotes the milestone economy to a supplement and re-tunes `front_closed`/`clock_fired`/`choice` against real
   combat XP). **What exists:** 374 monsters with `cr:` frontmatter; the walk/terrain substrate. **What's missing:**
   the bestiary is 100% unwired (creature = dead name-string — no stat index, no CR→XP), and there's no resolver.
   Treat it like SOCIAL / the Consequence Ladder: spec first, then build.
2. **Resume the per-table re-authoring loop** (`REAUTHORING-RUBRIC.md`; off `CORPUS-INTENSITY-MAP.md`) on the
   `voice_critical` Atmospheric & Sensory feeders (Sounds/Smells/Architecture), applying `legs × Pool` — interleave
   whenever a craft session is wanted.
3. **A live Bridge playtest** — still the only way to judge the Consequence Ladder's AI-side effect-die generation
   + pacing lean, the new XP feel, and the social bind→on-miss path. (Three-session model: re-author · bridge-operate · complaint-catch.)

## Latest (2026-06-29) — The Consequence Ladder: re-authoring craft pass → a spice-band consequence system [Claude Code]

**The table re-authoring craft pass started — and the first table (Art Depiction) surfaced a whole system.**
Branch `feat/consequence-ladder`; everything verified, **not yet merged** (clean-close in progress). The arc:
re-author a table → notice spice bands should carry *mechanical story-weight* → design + build the Consequence
Ladder (spine + session seam + pacing model) → wire it.

- **`art-depiction` re-authored (the pilot):** Spark→**Commitment**, 100 **world-agnostic** archetypal rows
  (66/20/9/4/1). The single-world Forgotten-Realms lore-dump became portable archetypes the DM grounds onto the
  world's own rolled facts (folds the IP scrub into the craft rewrite). Low bands = ordinary art of grander
  subjects; **high bands = the art itself is wrong** (talking/enterable/self-editing). Original archived.
- **The Consequence Ladder (`docs/CONSEQUENCE-LADDER.md`)** — spice bands earn mechanical weight without
  fractaling. **Thesis: content grows on DEMAND, not supply.** `band ≠ legs` (band = image-rarity/ceiling; **`legs`**
  = story-potential, routes the consequence). Chain → 3 sinks (handle / closed event / bind) + the **Diversion
  Rule** (effects never beget effects; new thread only at `thread-seed`, always clocked). Codex entries are
  **handles** ("no four-toed statue"); storage is **interaction-gated**. The **effect die is a PLAYER roll**,
  **AI-generated to a contract** (not pooled), **prep-time + on-the-fly**, captured to canon.
- **The session seam + pacing model (§7.1–§7.2):** the session boundary is the **promotion tick** —
  `endSession` harvests a carry-forward (open handles + interaction-salience + clocks + last shape) + proposes
  the next-session **shape**; `beginSession` weaves (trivialize/sustain/escalate). The shape is a **soft lean,
  never a track** (override hierarchy player→situation→lean; preference dominates; lulls only — "colors, never
  conveys"). The six episode shapes + six heuristics are the **"parameters of fun"** scaffold.
- **DM Charter §8.5 (constitutional amendment): "Invention is licensed, but captured."** The AI may invent — the
  invention must land in the circuitry (codex/event/Ledger), never free prose-canon.
- **Built modules:** `engine.consequence` (pure resolver) + `world.seam` (carry-forward + pacing). Compiler
  carries DM-only `Legs`/`Pool`. Art hook on place-gen (0–2 pieces). Effect-die loop composes from `codex_update`.
- **Verification:** `check-manifest` OK · compile 0 bugs (348 tables) · **consequence 38 · seam 29 · codex 57 ·
  codex-roll 38 · prep 43 · prep-bundle 50 · dm-events 29 · social 97 · crit 25 · advancement 35** — all green.

**Do next (pick up here):**
1. **A live Bridge playtest** — the only thing left for the Ladder: the AI-side effect-die *generation* and the
   pacing *taste* can only be judged in play, not by a verifier. Feel the seam + the art hook + the lean.
2. **Resume the per-table re-authoring loop** (`REAUTHORING-RUBRIC.md`; pick off `CORPUS-INTENSITY-MAP.md`) on the
   `voice_critical` **Atmospheric & Sensory** feeders (Sounds/Smells/Architecture), now applying the **`legs × Pool`**
   standard corpus-wide — `art-depiction` is the worked exemplar.
3. Deferred (non-blocking): faction `motif` slot · mechanical sink-B beyond existing events · medium normalization.

## Latest (2026-06-28, evening) — Live-session fixes: XP rebalance + char-menu level-up + DM-agency rules [Claude Code]

**A live-playtest gripe session turned into three coherent fixes, all green, on branch
`feat/playtest-xp-and-agency`.**

- **XP economy rebalance (the headline).** A 19-fact social binge was paying **950 XP** → level 3 off two
  interactions. Root cause: `fact_canonized` paid a flat 50 and the DM fired it per *narrated detail* (dice
  rolls pay nothing — that part was fine). Fix, two-part: `discovery`/`fact_canonized` **50 → 10**, plus a
  **script-owned daily cap** `DISCOVERY_XP_PER_DAY = 30` enforced in `grantXp` (`src/world/dm.js`, state on
  `w.xpDiscovery`). Past the ceiling, discovery pays $0 — the DM can't inflate by being chatty. Resolved
  tension (`front_closed` 300 / `clock_fired` 200) is the uncapped level-driver, per `ADVANCEMENT.md`.
- **Char-menu XP + un-gated level-up.** `renderCharacterPanel` shows XP badge + progress bar + to-next line,
  and a **Level Up** button when earned (`claimLevelUp` in `src/creator/levelup.js` applies it immediately —
  leveling decoupled from rest, BG3-style; rest stays as a convenience trigger).
- **Two DM-CHARTER rules.** §3 *"Never act or speak AS the PC"* (the "Arke tells her" railroad — DM hands
  off at the threshold, never narrates undeclared PC speech/action even to summarize). §8.3a *`fact_canonized`
  is for canon, not narration* (reserve it for option-changing truths).
- **Verification:** `check-manifest` OK · `verify-advancement` 35/35 · `verify-levelup` 90/90 ·
  `verify-dm-events` 29/29.

**Do next (pick up here):**
1. **Decide the two carried-forward items:** (a) reset the current PC's XP/level (already L3 from old rates —
   forward-only fix); (b) the `xp_granted` event the DM emits is silently ignored (~400 XP intent dropped) —
   wire it through the daily cap *or* add a charter line that XP isn't the DM's to grant.
2. **Then: START THE CRAFT PASS** (the prior session's queued work — see below).

---

## Latest (2026-06-28, later) — Deck cleared + 3 playtest fixes; ready for the craft pass [Claude Code]

**Cleared the deck for the re-authoring craft pass + fixed three live playtest bugs. The craft pass itself
begins next session** (off `docs/CORPUS-INTENSITY-MAP.md` + `docs/REAUTHORING-RUBRIC.md`).

- **3 playtest bug-fixes (live on master):** ① wake cinematic stall (8s safety-net timeout so the loading
  screen never sticks when the bridge is up with no live DM); ② DM narration truncated at the first quote
  (`escHtml` didn't escape `"`, breaking the `data-full` streaming attribute); ③ DM stream now
  sticky-but-escapable (scrolling up reveals the full text + stops the typewriter, instead of being fought).
  Each: `verify-dm-events` 29/29.
- **UI + DM:** roll-the-dice buttons now use the schematic blue (`.btn.roll`, `--steel` + white text);
  `DM-CHARTER §3` gained a **naming-discipline** note (name a place to its TYPE + Capitalize it — a private
  residence is not a "the Red Lintel" tavern-sign; the engine doesn't name buildings, the DM does).
- **Deck cleared (the prep):** 374 monsters tagged with ecology frontmatter; 3 copy-paste tables collapsed
  losslessly; **IP scrub complete** — the table corpus + monster stat files are creature/deity/brand-clean
  (creature cluster + 15 stat renames, deities/demon-lords, 100 `_Analog:`→`_Archetype:`, FR places/
  factions/campaign; Shou + required SRD attribution kept). Re-runnable build scripts under `build/`.

**Do next (pick up here): START THE CRAFT PASS.** The loop is set (`REAUTHORING-RUBRIC.md` §"Per-table
working loop"): pick a table off the map → agree a strategy → Claude rewrites → Adam approves. **First
target: Art Depiction.md** (the one remaining IP item — it's a *craft* rewrite into invented epics, keeping
the motif), then the `voice_critical` Atmospheric & Sensory feeders after calibrating on a ★BAR exemplar.

## Latest (2026-06-28, later) — Re-authoring sweep: planning + corpus map/rubric [Claude Code]

**Planned the table re-authoring sweep and built the craft-pass tooling. Docs-only unit — no table source or
module changes.** `check-manifest.py` green.

- **The reframe (important):** "re-authoring" = a **hands-on whole-corpus craft pass** — Adam personally
  revisits tables, ensures every row is up to par + points at an intriguing outcome, and **seeds explosive
  high-band twists** throughout. The recontext / IP-strip / monster-wiring work is the **deck-clearing prep**,
  NOT the main event. (Saved to auto-memory.)
- **`docs/REAUTHORING-SWEEP-PLAN.md`** — the two-lane executable plan (Lane A autonomous-safe / Lane B
  propose-and-wait) from a 5-angle recontext workflow + a monster recon: recontext primitives, SRD lenses, the
  **creature IP scrub = the reskin mechanism**, and the **monster-into-game wiring** (the bestiary is **100%
  unwired** today — creature = a dead name-string via `walkPickFromPool`; `src/engine/` has no bestiary index).
- **`docs/CORPUS-INTENSITY-MAP.md`** (generated by `build/corpus-intensity-map.py`) — all **347 tables** scored;
  **~210 content tables are UNGRADED** (no band column), **27 are ★BAR** exemplars, **12 DUPED**. Re-run after edits.
- **`docs/REAUTHORING-RUBRIC.md`** — the floor + explosive-ceiling standard, benched on the corpus's own best
  rows, with the per-table working loop.

**Do next (pick up here):** the **deck-clearing** on a fresh branch (`feat/reauthoring-deck-clearing`),
starting with the **autonomous-safe** Lane-A work in an isolated **git worktree** so Adam can run a test
campaign on the main checkout undisturbed (don't touch `.dm/` during live play — see the bridge gotcha). The
destructive moves (consolidation merge/retire, creature scrub + stat-file renames, Art Depiction IP rewrite)
are **propose-and-wait** (Adam approves each; the creature IP→generic mapping needs his sign-off first). Then
the **whole-corpus craft pass** table-by-table off the map+rubric (loop: pick → agree strategy → I rewrite →
Adam approves). Suggested first craft target: the `voice_critical` Atmospheric & Sensory feeders, after
calibrating on a ★BAR table.

## Latest (2026-06-28, later) — SOCIAL Phases 3 + 4 (events + surfacing) + a `/code-review` fix pass [Claude Code]

**A `/code-review` of the merged SOCIAL Phases 1–2, then: fix the findings, wire Phase 3 (events), and Phase 4
(surfacing). SOCIAL is now end-to-end.** On `master`'s working tree (not yet committed). `check-manifest.py`
green · `dev/verify-social.mjs` **97/97** (was 68) · `verify-dm-events` 29/29 · `verify-codex` 57/57.

- **Phase 3 — the typed events** (`src/world/dm.js` `applyEvent`): `social_check`, `attitude_shift`,
  `morale_check`, `parley_open`. `social_check` is **declared** (open roll + skill + levers); the script
  prices the DC from current attitude and COMMITS the shift via `codexSetAttitude`/`codexSetTerrified` — the
  DM reports the dice, never the verdict (§5). The **detected** `kill{civilian}`+co-location → witness-hostility
  cascade fires off the new `codexWitnessesAt`. Faction group-cascade stays declared (§7 scope guard).
- **Phase 4 — surfacing:** `codexDigest` materializes each NPC's attitude (so the DM reads the stance, never
  guesses); the player-facing five-step **disposition tell** renders on the Codex panel only for an NPC the
  player has *read* — a new `insight_read` event prices the §6 scaled DC and flips `attitude.read`
  (`codexMarkAttitudeRead`); `codexPlayerView` gates the tell on `known && read`, value+label only.
- **5 review fixes** (each a verifier regression-guard): terror-clear no-op (was branding a never-scared NPC
  Hostile); sub-Indifferent cap → `wall`/refused (was `granted:true`); decisive-ANY-lever auto-shift (was
  `leverage`-only); `codexAdd` attitude deep-merge (was shallow-clobbering clamps); `engine.social` layer
  registered.
- **Do next:** **commit this working tree** (`feat/social-phase3-4` → `--no-ff` merge per the git workflow).
  SOCIAL's four phases are all built + verified. Optional follow-ups (not blocking): a live-play visual check of
  the disposition tell over the DM bridge; drift-to-baseline (§1.4, ships off); the detected faction-member
  group cascade (waits on the faction hook). Otherwise back to the **table re-authoring afternoon** off the prep doc.

---

## (2026-06-28) — ANTI-DRIFT PUSH: XGtE/Tasha → content + the SOCIAL subsystem (Phases 1–2) [Claude Code]

**A full build session. Adam added Xanathar's Guide + Tasha's Cauldron to `Reference/`; we mined them (+ the DMG)
for mechanizable content that replaces AI-DM invention, then built — including the headline social subsystem.** All
on branch **`feat/antidrift-content-gifts-tools`** — **everything verified, NOT yet merged to master** (Adam's call:
build first, merge later). `compile-tables.py` 0 bugs · `check-manifest.py` green · `dev/verify-social.mjs` 68/68.

**What shipped (this branch):**
- **⭐ SOCIAL subsystem (`docs/SOCIAL.md`) — the social analog of combat.** Spec approved; all 6 §9 open questions
  resolved with Adam. **Phase 1 (data model) + Phase 2 (resolver) BUILT.** Attitude is a 5-state per-NPC Standing on
  the codex record (`status.attitude`, writers/reader in `src/world/codex.js`); the pure resolver
  (`src/engine/social.js`: `socialDC`/`applyLeverage`/`resolveSocialCheck`/`moraleDC`/`resolveMorale`/`insightReadDC`)
  returns deltas only. Morale is **shippable before the combat engine**. **Next: Phase 3 (events through `applyEvent`)
  → Phase 4 (digest + UI tell).**
- **Reward currency:** `Supernatural Charms`/`Blessings` (rollable). **Backlog content:** Puzzle toolkit (w/ a solo
  Failsafe), Patron Archetype, Tool-Uses / DC-Ladder / Hazard-Severity / Walk-On-Quick-Stats references. The 3 SOCIAL
  tables (`NPC Opening Attitude`, `Creature Parley`, `Morale Outcome`).
- **Housekeeping:** stale band-vocab swept (`Less-Grounded`→`Textured`, 28 tables); two markdown/band bugs fixed.
- **Prep for next time:** `docs/TABLE-REAUTHORING-PREP.md` — a ready-for-session plan for an afternoon of flavor
  re-authoring (Adam's stated next focus): ~26 weak tables prioritized, 6 resolve-first decisions (each with a rec),
  an IP-scrub list, exemplars. **Key finding:** the old "Place Gen/Myth thin" audit is stale — weakness migrated to
  the Atmospheric/Architectural `voice_critical` Fragment feeders.

**Decisions logged:** the 6 SOCIAL §9 calls (DM's-call beast skill · drift-to-baseline off · scaled Insight DC ·
per-encounter terror · most-resistant group); `Dungeon Loot - Outlandish` keeps its cross-IP loot via **diegetic
reskin** + future **anachronism-intrusion hooks**.

**Do next (pick up here):** (1) **merge the branch** (`--no-ff`) if Adam approves, (2) **SOCIAL Phase 3** (the typed
events), or (3) the **table re-authoring afternoon** off the prep doc. See `NEXT-STEPS.md` bottom. **IP debt to track:**
the `Art Depiction` Forgotten-Realms lore-dump + the category-wide WotC creature/race terms (genericization scrub).

## (2026-06-27) — ECONOMY / MONEY design session — DESIGN ONLY, no code [Claude Code]

**A pure design conversation about game loops + currencies → a sourced, disciplined economy plan + a ranked
anti-drift mechanic backlog. No code touched; decision + sketch *records* only** (`DESIGN.md` + `NEXT-STEPS.md` + the
auto-memory updated together, per the anti-drift discipline). The arc:

- **Game loops + currency model.** A loop closes only when it pays out a currency. Genesis's *substrate* loops
  (session/advancement/death-rebirth/drift) already close (XP·level, Saga, clocks); *pursuit* loops (job board,
  bounty, allegiance) and *construction* loops (base-building) are latent for lack of a closing currency. Currencies
  = **plural, relational, felt-not-displayed** (no global score; held behind the screen, surfaced as fiction).
- **Money is THE priority currency** — the **hub** that buys *partial* access to the others (rumor=knowledge,
  bribe=standing) with a friction ceiling (deep truth / sworn bond / Saga never for sale). Knowledge/Standing/Heat/
  Holdings stay **sketches**.
- **Economy v1 = the buy + sell spine** (Adam's pick): wallet + buy/sell events · prices **derived from the loot
  rarity axis** · shop = merchant codex-NPC + location + inventory + buy/sell **UI** (menus are fine — the Charter §3
  no-menu rule is *narrative-only*) · **consumables/potions = the keystone sink** (cure for gold-death) · a **sell
  button** (merchants pay below value = saturation guard) so urban/wilderness treasure matters · light **place-tier**
  stock. The one loop to nail+balance: loot → buy gear+pots → consumables drain → need gold.
- **Sourcing — "build ON, not finish ON."** **SRD** = the mundane floor (coins, gear, consumables, food/lodging,
  **Lifestyle Expenses**, hirelings, spellcasting services *availability-gated by settlement size*, mounts) — mostly
  drop-in. **DMG (2024)** fills every gap: magic-item **rarity→value** (Common 100→Legendary 200,000), **gemstone/
  art/trade-goods** value tables (the valuable-loot fast-follow), **Adventure Rewards** (the faucet — T1/T2 hoard
  ~500→4,400 GP), **Treasure Themes**, and **Bastions** (the blueprint for the deferred Holdings expansion).
  *(DMG is copyrighted + git-ignored → mine/genericize, author IP-clean, never paste tables in. PDF is 144MB so the
  Read tool can't open it — render pages with PyMuPDF + vision-read; offset drifts ~+2 after the front-matter plates.)*
- **Lodging rule — "shelter has an owner" (DECIDED).** A long rest is never hard-gated, but a bed has an owner →
  **sleep rough** (free, exposed) / **town bed** (SRD inn price) / **host's favor** (spend standing = a codex flag).
  Lifestyle's teeth = a comfort/safety/social *differential*, not a gate; lodging is the most frequent sink + the
  **first concrete place Standing appears** (as a codex favor flag, not a subsystem).
- **DMG anti-drift mechanic candidates — SKETCHES (not decisions).** Priority lens (Adam): *anything that prevents
  drift + invention where it doesn't need to be is HIGH priority.* Ranked: **⭐ NPC Attitude + social-check
  resolution** (Friendly/Indifferent/Hostile + Cha checks that shift it — the social analog of combat; attitude IS
  per-NPC Standing; buildable now) → **morale/fight-or-flight/parley** → **DC-ladder + damage-by-severity** scaffolds
  → **creature-by-CR reskin** for statless walk-ons.

### ▶ Next (Adam's call still stands: the CONTENT QUALITY TRACK is the active build priority)
The economy + anti-drift mechanics are **planned, not built** — they're a backlog, not a redirect. The active build
order is unchanged (below): **table quality pass → subclass/feat/background re-authoring.** When the economy track is
picked up, the open v1 design calls are: the flat sell ratio · the consumable-sink drain mechanic · merchant/shop
codex wiring + the buy/sell UI shape · whether urban+wilderness get coin/loot faucets. The standout anti-drift system
to mechanize first is **NPC Attitude/social**. See `DESIGN.md` (2026-06-27 block) + `NEXT-STEPS.md` (ECONOMY + DMG
ANTI-DRIFT CANDIDATES blocks).

## ⭐ (2026-06-26, latest) — LEVEL-UP PICKER COMPLETED: subclass + feats + spell-swap [Claude Code]

**"Complete the level-up feature."** The picker now covers the whole level-up, not just spells/ASI. Still
on branch `feat/levelup-picker`. Three additions:

- **Subclass** — new generated data `data/subclass-progression.js` (`build/gen-subclass-progression.py`
  parses the SRD markdown; the SRD ships **one subclass per class**, all 12 extracted with per-level
  features). The picker REVEALS it ("✦ Your path: College of Lore") + its L3/L6/L10 features and records
  `sh.subclass` + `sh.subclassFeatures`. Deterministic (no choice) — a reveal, not a chooser.
- **Original general feats** — new `data/feats.js` (the SRD ships almost none, so these are Genesis-native,
  IP-clean: 5 full + 7 half feats). The ASI step is now an **ASI-_or_-feat** slot (the 2024 model) at L4/L8.
  `applyFeat` applies the mechanical grant (ability +1 / HP / AC / speed / save / skill) + records it;
  situational text is DM-adjudicated. **The feat set is a DRAFT — Adam to balance-tune.**
- **Spell swap** — optionally replace one known spell on level-up (2024 rule).
- Sheet now shows subclass `(College of Lore)` + Lv in the header, and feats / subclass features in the foot.
- **Verified:** `dev/verify-levelup.mjs` **87/87**; check-manifest OK (49 modules); no regressions. Live-
  verified end-to-end in Chrome — Bard 1→4 showed the subclass reveal + spells + the **Take a feat** path
  (Resolute → +1 CHA + CHA save proficiency) and recorded everything correctly.
- ⚠️ **Chrome caches `src/**/*.js`** — hard-refresh (Cmd+Shift+R) after pulling to run the new code.

## ⭐ (2026-06-26, later) — In-app LEVEL-UP CHOICE PICKER built [Claude Code]

**The one interactive gap leveling left open is closed.** Branch `feat/levelup-picker`. New module
**`src/creator/levelup.js`**: on the rest-gated level-up, after the mechanical recompute lands
(`level_applied` → `applyLevelUp`), `passTime` now calls **`openLevelUp`** → a modal picker for the
**interpretive** choices the engine can't decide — new **cantrips**, new **spells known**, and the **ASI
at L4/L8**.

- **Per-level deltas, not bardo reuse.** The creator bardo's `CLASS_CASTING` is L1-only; the picker
  computes `cantrips`/`spells`/`asiCount` deltas from `CLASS_PROGRESSION` (`levelUpPlan`) — so it's a real
  per-level build (it borrows only the bardo's spell-card visuals + `creatorSpells`/`showSpellTip`).
  Handles **multi-level jumps** (aggregates ASIs + spell deltas), the **Wizard spellbook vs prepared**
  split, and the **spellMaxLevel** gate (incl. the warlock pact path).
- **`applyLevelChoices` is the single mutator** — writes deduped spells, applies the ASI (+2 / +1+1, the
  20-cap), and ripples **HP(CON) / AC(DEX) / PP(WIS)** + any casting-stat-derived **pool max** (e.g. Bardic
  Inspiration). **Subclass + general feats stay DM-narrated** (flagged, never auto-applied); a "Decide with
  my DM" button defers cleanly, and **pure-feature levels** (Fighter Extra Attack) or **headless contexts**
  skip the modal — the prior DM-narrated default is preserved (`openLevelUp` returns false).
- **A level-up CAN'T be accidentally skipped (Adam's call — it's a big event).** A persistent marker
  **`sheet.choicesLevel`** (the level picks are finalized up to) lags `sheet.level` while picks are owed and
  is **saved with the world**. A glowing **re-open banner** shows in the world view and `renderWorld`
  **auto-opens** the picker, so a close/reload always re-surfaces it; only Confirm / "Decide with my DM"
  finalizes (a pure-feature span auto-finalizes). Live-verified end-to-end in-browser incl. the **reload**
  case (marker persisted in localStorage → picker auto-reopened).
- **/code-review (high) fixes folded in:** extracted the duplicated pool-grow loop into a shared
  `growPools(sh)` (engine.resources, called by `applyLevelUp` + the picker); aligned `luAsiHeadroom`'s
  missing-score baseline; dropped ~24 lines of manifest `\uXXXX` churn.
- **Verified:** `dev/verify-levelup.mjs` **62/62** (plan deltas, apply mutator, persistence lifecycle,
  open→auto→confirm/skip DOM flow); no regressions (advancement 35, dm-events 29, creation-picks 24,
  session 16); check-manifest OK (**46 modules**). Live-verified in Chrome.
  **NOTE for testing:** Chrome had cached the old `src/world/*.js` — **hard-refresh (Cmd+Shift+R)** to pick
  up the new render/play/dm/resources/advancement after pulling.

### ▶ Next — CONTENT QUALITY TRACK (Adam's call 2026-06-27; do these in order)
1. **⭐ Table quality + row-quantity refinement pass (FIRST).** A sweep across the generator/oracle tables
   for *quality* (voice, distinctness, causal coupling — the 5-band spice ladder) and *quantity* (thin
   tables promoted to full row counts). Prerequisite to the re-authoring pass below — the re-authored
   content leans on these tables. Use the established sample-review protocol (5-band samples → Adam's voice
   review → full authoring), per `docs/TABLE-USAGE-AUDIT.md` + the prior table-improvement passes.
2. **⭐ Subclass + feat + background re-authoring pass (AFTER #1).** Re-author for depth + balance:
   - **Subclasses** (`data/subclass-progression.js`) — currently the lone SRD subclass per class, extracted
     verbatim. Re-author IP-clean / give real options (more than one path per class).
   - **Feats** (`data/feats.js`) — currently a 12-feat DRAFT (5 full + 7 half). Balance-tune names + numbers,
     expand the set, and decide on Magic-Initiate-style feats (need a nested spell picker — deferred today).
   - **Backgrounds** (`data/species-backgrounds.js` / `Genesis Backgrounds.md`) — re-author pass for depth.
   *(Folds in the earlier "balance-tune draft general feats" item.)*

### ▶ Then — T1/T2 polish (none blocking)
3. **`wilderness-threat-identity-t1/-t2` tables** (sample-review authoring pass) → enrich the Enemy-leg roster/signals.
4. **CR 9–10 capstone density** — ~14 stat blocks for a satisfying T2 finale.
5. **A live Bridge playtest** to feel leveling + the (now-complete) level-up picker + crit/codex in play.

## ⭐ (2026-06-26) — SCOPED TO TIER 2: leveling 1→10 + cap + balance guards [Claude Code]

**Decision: this version caps at Tier 2 (levels 1–10); T3/T4 = future expansion.** Decision doc
**`docs/TIER-SCOPE.md`**. Shipped in 4 merges (Phases A–E). The headline: **characters can now level
1→10** (a PC was level-1-forever before).

- **Leveling spine** (`src/engine/advancement.js`): SRD XP thresholds (in-code canon; `levelForXp` clamps
  to `LEVEL_CEILING=10` = the cap's primary enforcement + single un-cap point), `xpForEvent` draft pricing
  (objective-gated combat), `awardXp`, `applyLevelUp` (re-derives + GROWS HP/proficiency/slots/pools — it
  must, since `ensureResources` only fills-missing). XP accrues via `grantXp` in `applyEvent`; `passTime`
  is the rest-gate. **Interpretive picks (spells/ASI/subclass) are DM-narrated in v1** — engine guarantees
  the numbers; the in-app level-up picker is a fast-follow.
- **Cap guards:** `TIER_CAP=2` + generator tier clamps; bundle `meta` carries `tierCap/levelCeiling/crCeiling`.
- **Wilderness:** now tier-aware + every Enemy leg signals danger (fiction-only) — DIFFICULTY.md gap closed.
- **Deferred (authored-but-inert, docs/TIER-SCOPE.md):** T3/T4 loot budgets + Legendary/Artifact (verify-
  guarded), Outlandish banding, CLASS_PROGRESSION L11–20, encounter-template T3/T4.
- **/code-review** caught + fixed: `applyLevelUp` was full-healing on level-up (free heal on a short rest).
- **Verified:** verify-advancement 35, verify-monster-density 13, verify-walk 2801, verify-dm-events 29,
  no regressions; check-manifest OK (45 modules).

### ▶ Next (queued T1/T2 polish — none blocking)
1. **`wilderness-threat-identity-t1/-t2` tables** — author via the sample-review protocol (5-band samples →
   Adam's voice review → full rows), then enrich the wilderness Enemy-leg roster/signals.
2. ☑ **In-app level-up choice picker** — BUILT 2026-06-26 (`src/creator/levelup.js`; see the Latest entry above).
3. **CR 9–10 capstone density** — ~14 stat blocks; author a few more for a satisfying T2 finale.
4. A **live Bridge playtest** to feel leveling + the crit/codex systems in play.

## ⭐ (2026-06-26) — CODEX track CLOSED: loose ends tied off + consistency review [Claude Code]

**The Codex is done.** Phase 6 (the UI panel) shipped 2026-06-25 (`548b54b`) alongside the
`codexProvenanceReport` ratio test + world-gen place grounding (`a02840a`); the live re-playtest flipped
the mechanical-vs-invented baseline **~20% → 60–82%** — the anti-drift loop is validated end-to-end. (NB:
the relocation entry below pre-dates that and listed Phase 6 as "next" — it's done.)

This session closed the two remaining follow-ups on branch **`feat/codex-loose-ends`**, after a
cross-system **consistency review** (architecture + style across Codex / Session-Prep / Death & Rebirth /
the event runtime — verdict: **coherent**; one drift, `rollVision` mutating despite the `roll*` prefix,
chipped as a `fireVision` rename):
- **Soft-pool eviction cap** — `codexEvictSoft(w,{cap,keepIds})` (`src/world/codex.js`, default
  `CODEX_SOFT_CAP=24`) + a monotonic mint `seq`; wired into `prepRecycleStale`. Ages out the oldest
  untouched soft records beyond the cap, keeping the freshest as the §8b reusable pool; hard/known/linked/
  bound are sacred. The soft pool — and the DM digest — now stays bounded independent of session count.
- **Prep item-casting** — `pbundleCast` rolls the macguffin via `rollItem`; `prepCastFrontier` mints +
  places it at the frontier location.
- **Verified:** check-manifest OK; `verify-codex` 57 / `verify-prep` 43 (new eviction + item assertions) /
  codex-roll 38 / prep-bundle 47 / session 16 / dm-events 28 — all green.

### ☑ Also this session — Critical-Magnitude engine WIRED (branch `feat/crit-magnitude`)
`CRIT-MAGNITUDE.md`'s two unbuilt pieces are now built (the lens oracle from 2026-06-23 is wired to live
rolls): (a) **`src/engine/crit.js`** `rollCritMagnitude(natural,{magnitude})` — pure roller: magnitude d20
→ band (`critBand`, success + inverted-failure ladders) → distinct lenses (`critDrawLenses`) from
`mythic-success/failure-lenses`, row-1 place lens routes to the Myth suite (rolls `myth-seeds`); atoms only.
(b) **`crit_outcome` event** in `applyEvent` — Mythic → Ledger canon, amplified → outcome. (c) **`dmRollFor`**
detects nat 20/1 → rolls the magnitude die openly and attaches the lens vector to the turn. `verify-crit.mjs`
23/23; check-manifest OK (44 modules). *In-play handshake render unverified here (no live Bridge) — eyeball
it at the next playtest.*

### ▶ Next (the build plan)
With the Codex closed and Crit-Magnitude wired, the open big track is **Advancement / leveling**
(`ADVANCEMENT.md`): `CLASS_PROGRESSION` (L1–20) + the XP curve (decided SRD-exact) exist — remaining is
(2) author the SRD XP thresholds as a compile-ready table → JSON, (3) event-contract XP plumbing (prefer
detected-from-state-delta over DM-declared), (4) the rest-gated level-up beat (reuse the bardo machinery).
Smaller: the `rollVision → fireVision` rename (chipped); a live re-playtest to feel crit-magnitude + the
codex in play.

---

## ⭐ (2026-06-25, late) — Project relocated + path strings swept [Claude Code]

**Genesis moved out of the Obsidian vault** to its own home at **`~/Desktop/Work/projects/Genesis`**
(`bf3818c` → `8bb6a93`); the `Shifting Vale` / `Playtest Sandbox` human-DM vaults are no longer siblings
(they live at `~/Desktop/D&D/Obsidian Files/`). A follow-up pass swept the stale `Obsidian Files/Genesis/`
path strings from the docs (`HANDOFF`/`README`/`DESIGN`) and the **genesis skill** (`SKILL.md` + plugin
`manifest.json`), and logged it all in `CHANGELOG.md`. Verified every referenced path resolves on disk.
Pure docs/config — no code touched, all suites still green. **The CODEX session below is the real build
work; this was housekeeping on top.**

---

## This session (2026-06-25) — CODEX Phases 2–5 built, reviewed, merged to master [Claude Code]

**The whole back half of the Codex shipped this morning** — `feat/codex-phase2` → 4 build commits + 1
review-fix commit → `--no-ff` **merged to `master`** and pushed (`b3eee9a`), branch deleted. The Codex is
the fix for the Saltrest "DM invented the whole cast" failure (see the §"headline finding" block below from
2026-06-24). **The anti-drift loop is now closed end-to-end: the engine rolls a cast, prep stages it as hard
data, the DM connects rather than invents.** Tree clean, **43 modules**, all suites green.

### What landed (newest first; full detail in `CHANGELOG.md` + `docs/CODEX.md`)
- **Phase 2 — the rollers** (`src/engine/codex-roll.js`): `rollNPC()`/`rollPlace()`/`rollItem()`/
  `rollBuildingInterior()` chain the compiled `npc-*`/`place-*`/`plot-item`/`plot-lock`/`building-interior`
  tables into **codexAdd-ready payloads** — `rolled` (raw dice verbatim) + player-safe `fields` + DM-only
  `dm` levers. Items are **pointers** (`source:{type,ref}` §8b). They return atoms, never write `w`.
- **Phase 3 — prep casts the codex** (`prep-bundle.js` `pbundleCast` + `prep.js` `prepCastFrontier`): each
  rumored frontier rolls a soft **location + 1–2 NPCs** (one questgiver); `startPrep` mints them as
  `provenance:"prep", soft:true`, binds the location to the frontier node (`node.codexId`) + places the NPCs
  (`status.at`); `lockOnContact` locks the location to canon on entry. Synthesis now **connects** a
  dice-dealt cast.
- **Phase 4 — the session frame** (`play.js` `startSession`/`endSession` + `render.js`): explicit **Start
  Session** (▶ button on every world card + in-world) → `beginSession` casts the codex → `wakeIntoWorld`
  cinematic → the DM opens the scene **once the cast is hard data**. **End Session** recycles unvisited soft
  prep + returns to the shelf. A "session live" badge.
- **Phase 5 — the missing table-sets:** three net-new **d300 Commitment** tables (198/60/27/12/3), authored
  via 3 parallel agents + compiled (**337 tables, 0 real bugs**): **`building-interior`** (the "gran's house
  had nothing to roll" fix), **`plot-item`** (specific objects, replaces abstract `quest-macguffin`),
  **`plot-lock`** (key/lock complement). Mythic rows rescaled to genuinely cosmic (Adam's review).
- **Pre-merge code review** (8 finder angles → 3 fixes): session-flag ordering, prep-cast id collisions
  (`prepCastId`), and a `status`-merge robustness fix. See `CHANGELOG.md` 2026-06-25.

### ▶ Next (the plan)
1. **Phase 6 — the Codex UI panel** (records grouped by kind + their links as clickable cross-refs,
   knowledge-gated like the other panels) — `docs/CODEX.md` §6. **Needs a browser** (preview is
   sandbox-blocked in the Claude-Code env here — run it locally).
2. **Soft-pool eviction cap** (review follow-up, design call) — the soft codex pool grows unbounded and
   `dmDigest` sends the whole codex each turn. Decide a prune/cap policy. `NEXT-STEPS.md` "Do next".
3. **Re-playtest over the Bridge** + run the script-side **`codexProvenanceReport`** ratio test against the
   ~20% mechanical Saltrest baseline (the codex's job is to flip that). Also **eyeball the Phase 4 shelf
   button + cinematic** in the browser — unverified here (sandbox).
4. *Easy follow-on:* prep **item-casting** in `pbundleCast` (the `rollItem` roller exists; prep doesn't
   auto-call it yet).

### Verifiers (all green this session)
`dev/verify-codex.mjs` 39 (Phase 1) · `verify-codex-roll.mjs` 38 (rollers) · `verify-prep-bundle.mjs` 47
(casting in the bundle) · `verify-prep.mjs` 36 (cast minted/bound/locked + id-collision guard) ·
`verify-session.mjs` 16 (the session frame) · `verify-dm-events.mjs` 21 · `check-manifest.py` OK (43 modules).

---

## Orientation (the 30-second version)
**Genesis is a standalone single-player TTRPG video game** — the player rolls a world into being, an **AI DM narrates**, and worlds persist forever in the browser. Built *on* the Arcana Engine but is **its own product**.

**Where to operate:** everything Genesis lives in **`~/Desktop/Work/projects/Genesis`** (relocated here from the Obsidian vault on 2026-06-25) — `genesis.html` (the game), `Engine/` (clean Genesis-owned Arcana Engine), `Asset Library/` (monsters + NPCs + factions + generators, Genesis-owned), and `Reference/` (the source PDFs + book indexes). **All design docs/specs now live in `docs/`** (reorg 2026-06-21) — see `docs/README.md` for the index; only the root `README.md` + `table-registry.md` stay at the repo root.
**What to ignore:** the `Shifting Vale/` and `Playtest Sandbox/` Arcana Engine copies — the human-DM system. Don't scan/edit them for Genesis work.

## ▶ Running Genesis (CHANGED 2026-06-20 — now modular, needs a server)
`genesis.html` is **no longer a single self-contained file** — it loads `data/*.js` + `src/*.js` modules, which `file://` cannot fetch. **Double-clicking `genesis.html` now shows a broken/empty page.** Run it over localhost:
- **Easiest:** double-click **`~/Desktop/Launchers/Open Genesis.command`** — starts the server (detached) + opens Chrome. Port **5175** (chosen to avoid 5173 Proposal Builder / 5174 Palette Buddy / 8000 Drawing Trainer).
- **Manual:** `cd "$HOME/Desktop/Work/projects/Genesis" && python3 -m http.server 5175 --bind 127.0.0.1` → open `http://127.0.0.1:5175/genesis.html`.
- Pre-modular single-file copy archived at `Archive/genesis_pre-modular_2026-06-20.html` if the old double-click behavior is ever needed.

## Architecture (modular — DE-MONOLITHING COMPLETE 2026-06-20/21 — read before editing code)
Genesis was de-monolithed from the one big `genesis.html`. **Module system = ordered classic `<script>` files that share global scope — NOT ES modules.** Why: the UI runs on inline `onclick="fn()"`, which needs functions global; ES modules would break every handler until events are rebound to `addEventListener` (deferred — rides in with the eventual graphics engine; see `SCALING.md`).
- **State: monolith 2047 → 449-line shell (HTML/CSS + init + a few consts), 1 → 29 modules** (27 from the de-monolith + 2 creator-data modules added 2026-06-21). All logic lives in `data/*`, `src/state.js`, `src/engine/*`, `src/world/*`, `src/ui/*`, `src/creator/*`.
- **`manifest.json` is the index/spine:** every module's `id` / `path` / `owns` (single-source-of-truth symbols) / `callTimeDeps` / `layer`. **Run `python3 build/check-manifest.py` after any module edit** — it fails on missing paths, duplicate ids, drift (a symbol defined twice), a manifest `loadOrder` entry **with no `<script>` tag in genesis.html** (added 2026-06-21 after that exact bug bit), and warns on layer-direction inversions + orphan files. `manifest.loadOrder` = the `<script>` tag order.
- **All transient mutable state lives in one container: `GS`** (`src/state.js`, `var GS` so inline handlers can reach it) — `GS.CGEN`/`GS.BARDO`/`GS.SEED`/`GS.CG_DRAG`/`GS.FATE_CTX`/`GS.ORC`. The persistent universe `U` keeps its own accessor layer in `world.state`. **New mutable state goes in `GS`.**
- **Verification tooling:** acorn (AST extraction/rename) + jsdom (run the real `genesis.html` headless, drive tabs/flows) — `npm i --no-save` in a scratch dir; reinstall per shell call.
- See `SCALING.md` (the architecture audit + the "when to migrate" answer) and memory `project_genesis_modularization`.

## ▶ Version control (NEW 2026-06-21 — read if you're in Claude Code)
The repo is now under **git** (local; no remote yet). The root **`CLAUDE.md`** is the operating contract — read it first; it has the run command, the architecture, the command table, and the disciplines.
- **Commit in logical units** with a clear message; the working tree was clean at handoff (`f9e5601`).
- **Before considering a change done:** run `python3 build/check-manifest.py` (after module edits) and a jsdom headless pass (load the real `genesis.html`, drive the flow). Recompile tables with `python3 "Engine/00. _System/compile-tables.py" --emit` if you touched Engine table markdown.
- **Tracked vs not:** source + docs + `tables.json`/`tables.js` + `Reference/SRD-Data/` are committed. **Ignored:** the scanned rulebook PDFs (large + copyrighted — never push), `Archive/`, `node_modules`, `.DS_Store`. `tables.json`/`tables.js` are committed *but generated* — never hand-edit; recompile.
- **Remote (2026-06-21):** private GitHub repo `origin` = **`tiltandfade-lab/Genesis`** (SSH). `master` tracks `origin/master` — `git push` after each `--no-ff` merge. (`tiltandfade-lab` is Adam's personal account; no `main` branch exists.)

## This session (2026-06-24 — latest) — First live playtest → UX/contract hardening + resource tracking + the CODEX (spec + Phase 1) [Claude Code]

**The first real DM-Bridge playtest happened** (world *Saltrest*, PC *Pendleton Perrybottom*, an Urchin
Bard) and doubled as a hardening pass. Many small merges; **tree clean, 42 modules, all suites green.**
Run the live DM on **Sonnet** next time (latency); the 30s/turn last night was the Claude-Code dev harness
(tools + file mailbox + Opus medium), not representative of the production API path.

### The headline finding → the CODEX
The DM (AI) **invented the entire cast** (Quill, Sabarra, Coll & Mire, the Cinderyard, Tinker's Stair, the
key) and then couldn't keep it straight (an NPC bled in from another character's world). Root cause,
confirmed by reading the code: **Session-Prep rolls the *stage* (environment walks + abstract hooks), not
the *players* — it mints zero NPCs/places/items — and there is no entity store** (NPCs lived as ledger
prose + flat gazetteer rows). Violates the anti-drift north star.
- **`docs/CODEX.md`** specced (+ refinements Adam approved): NPCs/Locations/Items/Factions become
  **relational records in `w.codex`** (Obsidian-wikilink model); the engine rolls the atoms, **the AI only
  assigns meaning + wires links**; a **recontextualization engine** (untouched soft entities are a reusable
  pool — preserve the rolled soul, reassign the role) means no wasted rolls; **touch = lock to canon
  forever** (never recontextualized/duplicated); the codex is the omniscient store, the player sees only a
  **sanitized knowledge-gated projection**. Decision rows in `DESIGN.md` (2026-06-24).
- **☑ CODEX Phase 1 BUILT** — `src/world/codex.js` (`world.codex`): the store + record shape + two-tier
  soft/hard lifecycle + `codexRecontextualize` (refuses on hard) + `codexSoftPool` + all-seeing
  `codexDigest` vs sanitized `codexPlayerView` + core link vocab + `ensureCodex` migration; `codex_*` events
  in `applyEvent`; `dmDigest` serves the codex slice. **`dev/verify-codex.mjs` 39/39.**

### ▶ Next (the plan, in `NEXT-STEPS.md` "Do next")
**☑ CODEX Phase 2 BUILT (2026-06-24)** — `src/engine/codex-roll.js`: `rollNPC()`/`rollPlace()` chain the
already-compiled `npc-*`/`place-*` tables (via `rollTable`) into `codexAdd`-ready payloads (`rolled`
verbatim + player-safe `fields` + DM-only `dm` levers); rollers mint atoms, don't write the world (prep/
the DM emit `codex_add`). `dev/verify-codex-roll.mjs` 27/27; check-manifest OK (43 modules). **Next:
Phase 3 BUILT (2026-06-24)** — prep now **casts the codex**: `assemblePrepBundle.pbundleCast` rolls a soft
location + 1–2 NPCs (one questgiver) per frontier; `startPrep` mints them as `provenance:"prep", soft:true`
records bound to the frontier node (location → `node.codexId`, NPCs placed via `status.at`); `lockOnContact`
locks the location to canon on entry. Summary carries a compact cast; synthesis now *connects* a dice-dealt
cast. **☑ Phase 4 BUILT (2026-06-24)** — the session frame: `startSession(id)`/`endSession()`
(`src/world/play.js`). Start enters the world → `beginSession` (casts the codex) → `wakeIntoWorld`
cinematic → DM opens the scene once the cast is hard data (idempotent on a live session, won't double-cast);
End clears `sessionLive`, writes a closing beat, recycles unvisited soft prep, returns to the shelf. UI: a
**▶ Start session** button on every world card + a session-aware Start/End control in-world + a "session
live" badge. `verify-session.mjs` 16/16; check-manifest OK (43 modules). *(Browser render sandbox-blocked
here — eyeball the shelf button + cinematic first thing at playtest.)* **☑ Phase 5 BUILT (2026-06-24)** —
the two missing table-sets as three net-new **d300 Commitment** tables (198/60/27/12/3, authored via 3
parallel agents, compiled → **337 tables**, 0 real bugs): **`building-interior`** (the "gran's house had
nothing to roll" fix), **`plot-item`** (specific objects, replaces abstract `quest-macguffin`), **`plot-lock`**
(key/lock complement). Mythic rescaled to cosmic (Adam's review). Wired `rollItem` (item-as-pointer §8b +
optional `lock`) + `rollBuildingInterior` in `codex-roll.js`; `verify-codex-roll.mjs` 38/38. **Next: Phase 6
— the Codex UI panel; then re-playtest over the Bridge + the mechanical-vs-invented ratio test**
(`codexProvenanceReport`; baseline Saltrest ≈ 20% mechanical / 80% invented). (Easy follow-on: prep
item-casting in `pbundleCast`.)
**Phase 5** = author the two MISSING table-sets (a building/interior generator; a specific plot-item/key
generator — `quest-macguffin` is only categories today). **Phase 6** = the Codex UI panel.

### Live-play hardening shipped this session (all merged)
- **Waking flow:** prep/loading cinematic → DM narration fades in; killed the raw entry **data-dump**;
  Session-Prep auto-fires on wake.
- **Chat surface:** word-by-word **streaming** with a caret, **read-from-top** then **sticky-bottom** scroll
  (not locked-bottom), **Enter** sends (Shift+Enter newline), compact scene-head, **hidden top breadcrumb
  bar**, `**bold**` rendering, fonts **+30%**.
- **Panels:** **knowledge-gating** (Powers/Gazetteer show only what the character knows — `render.initKnown`),
  toggle-to-collapse, **viewport-fit** (no full-page scroll), **full skill list with live modifiers**
  (`SKILL_ABILITY`).
- **Mechanics:** **consumable-resource tracking** (`src/engine/resources.js` — spell slots/HP/pools,
  engine-owned, rest-restore) + **roll-request persistence** & **in-flight-turn resume** across reloads.
- **DM Bridge:** these all live in the dev harness — see the process gotcha below.

### DM Charter — agency rules locked from playtest feedback (all in `DM-CHARTER.md` §3 + memory)
- **Verbatim player dialogue** — when the player speaks in character, quote it word-for-word; never rewrite.
- **Open handoffs, default OFF for option menus** — present the situation and stop; no "1/2/3" menus
  (Adam: "I'd rather make bad choices than pick your 3 great ones").
- **No tactical coaching** — never suggest the player's spell/skill/approach; answer direct rules questions
  plainly (information, not steering).
- **No NPC bleed** — only voice NPCs in the current world's digest; never carry one across PCs/worlds.

### Process gotcha (memory'd) + queued tasks
- **NEVER run `dev/verify-bridge.py` during a live playtest** — it shares + `/reset`s the `.dm/` mailbox and
  deletes pending turns (it ate a roll mid-session). Use the jsdom harnesses during play.
- **Spawned worktree tasks:** life-event sub-rolls ☑ done+merged; **"of your choice" creation picks**
  (instruments/tools/languages) — chip still open; resource follow-ups (rest-restore polish + a dedicated
  harness) — minor.

---

## This session (2026-06-23, session 3) — Session-Prep system END-TO-END + crit lens oracle + table audit [Claude Code]

**🎲 The AI-DM Session-Prep system is built end-to-end — Genesis is now PLAYTESTABLE over the Bridge.**
The whole arc landed this session: crit lens oracle → table audit → the three walk-rollers → the
synthesis contract → the prep state machine wired into the live world. ~10 `--no-ff` merges; tree clean.

### What got built (newest design first; full detail in `docs/SESSION-PREP.md` + `CHANGELOG.md`)
1. **Crit-Magnitude lens oracle** — `Mythic Success/Failure Lenses` (d12 each, `Session Mechanics/
   Consequences/`); each row a *vector*, AI fills content; the magnitude die also sets a **cascade count**.
   Resolves CRIT-MAGNITUDE §4's "missing middle" — the Myth suite did NOT need reworking.
2. **Table-usage audit** → `docs/TABLE-USAGE-AUDIT.md` (+ `build/gen-table-usage-audit.py`): 89/248 source
   files were Oracle-only — and those orphans turned out to be exactly the Session-Prep payload.
3. **Session-Prep system** — *"the story is in the dice"* (over-roll the cheap rollers → AI synthesis pass
   harvests the throughline latent in them). Generalizes DM-CHARTER §8.4 (soft-until-contact) to a heartbeat.
   - **Walk-rollers** (`src/engine/walk.js`/`dungeon-walk.js`/`wild-walk.js`) — ported from the Obsidian
     Urban v3.1 / Dungeon v4.2 generators (urban 16 topologies; dungeon 12 + depth-loot + Myth-affinity
     boss) + wilderness authored fresh (leg journey). Each → segments=nodes, transitions=edges.
   - **Synthesis contract** (`docs/SYNTHESIS-CONTRACT.md`) — `prep-bundle.js`/`quest-hook.js` assemble the
     multi-environment input; two staged prompts (`Engine/00. _System/AI Prompts/synthesis-{harvest,reskin}.md`)
     do Stage 1 harvest → Stage 2 roll-keyed overlay. **Cardinal rule: annotate the rolls, never rewrite.**
   - **Prep state** (`src/world/prep.js`) — `beginSession()` fires prep; each environment becomes a **soft
     "rumored frontier"** map node (dashed; soft edge = the quest hook). `⎘ Prep handoff` button exports the
     bundle; `prep_applied` enriches frontiers from synthesis; `prep_contact`/`lockOnContact` lock soft→hard
     on entry. Recycle unvisited frontiers; prep-debt.
4. **Compiler change (foundational):** `compile-tables.py` emits `row[5]` structured cells so multi-column
   prep tables keep their columns (`tables.json` was lossy). `rollTable().cells` added. Recompiled → 334 tables.
- **Verified headless:** `dev/verify-walk.mjs` (2667), `verify-prep-bundle.mjs` (32), `verify-prep.mjs` (22).
  `check-manifest` OK. **Browser render of soft frontiers UNVERIFIED** (preview server sandbox-blocked here)
  — eyeball it first thing at playtest.

### ▶ Next: THE PLAYTEST (Adam's call)
**Run a real prepped session over the DM Bridge** (`python3 dev/dm-bridge.py` + `/loop` per `docs/DM-BRIDGE.md`):
New session → frontiers stage on the map → **⎘ Prep handoff** → run `synthesis-harvest` then per-env
`synthesis-reskin` → apply via a `prep_applied` event → play; heading to a frontier fires `prep_contact`
and locks it. Watch for: (a) do soft frontiers render? (b) is the Stage-1 throughline honest on summaries
alone (the known tune item)? (c) do the reskins hold? Then the refinements: (#6) fuller orchestrator
(plausibility-from-frontier; NPC/Place depth rollers), and the `quest-*`/NPC-hook table improvement pass.

---

## This session (2026-06-23, session 2) — T2 Myth/Urban tables + Crit-Magnitude spec [Claude Code]

**Table-improvement pass T2 done — the 3-tier pass is now COMPLETE** (T1 Place Gen · T3 NPC atoms ·
T2 Myth/Urban). Committed on branch `feat/table-pass-t2-myth-urban`, `--no-ff` merged to `master`,
pushed to `origin`. Recompiled to **332 tables**, 0 real bugs.

### Three tables — content-only, **deliberately NOT wired** (rollable via the Oracle tab)
Authored via the 5-band-samples-first protocol (Adam reviewed voice before the full 100-row authoring);
all d100 Commitment, 66/20/9/4/1, every row unique.
- **`myth-costs`** d12→d100 (what a legend now demands / attracts / inflicts) and
  **`myth-becomes-geography`** d10→d100 (how a myth scars the land). Originals → `Mythic Events/zz_Archive/`.
- **`urban-pressure`** — NEW d100 oracle in `Session Mechanics/Pressure/`: single-roll **citywide
  ambient pressure** for slow urban play (what the freed `urban-encounters` slot was reserved for —
  built under a distinct `urban-pressure` id). Distinct from the `Urban Encounter v2.5` node generator.

### Crit-Magnitude system — SPECCED → `docs/CRIT-MAGNITUDE.md`
Adam's design call captured (formalizes the one-line `SPICE-CURVE` §3 stub): **nat 20 / nat 1 → a second
d20** (the *magnitude die*) scaling Standard → Amplified → **Mythic** (= Local → Regional →
Planar/Cosmic; lands on the Constitution's Escalation Curve rarity). **20/20** = permanent boon written
to the Ledger as canon (Adam's Light-of-Lathander shrine); **1/1** = mirror failure (humor by default,
dark + permanent at high stakes — the hell-portal/cult twin). Cross-reffed into `DESIGN.md` (decision
rows), `DM-CHARTER.md` §6, `SPICE-CURVE.md` §3.
- **The seam (important for the next task):** the crit system is the **generic engine** (any d20 action);
  the **Myth suite is one *situational* payload** (a place/deed becoming legend), NOT the universal
  mythic answer. The missing middle is a generic context-tagged mythic-outcome oracle.

### ▶ Next clean-session task (Adam's call)
Build the **generic context-tagged mythic-outcome oracle** — the middle layer between the crit engine and
its payloads (combat / social / exploration / place-deed contexts). It's what lets a 20/20 or 1/1 actually
reach for the Myth suite. Specced in `CRIT-MAGNITUDE.md` §4; everything stays **unwired** until then.
Also open from this session's review: two band-placement judgment calls (`myth-costs` 95, `myth-becomes-
geography` 89 — left as Strange, cheap to bump to Volatile) and wiring all three new tables into live play.

---

## Previous session (2026-06-23, session 1) — NPC atoms → d300 + tavern rename + Place Gen fixes [Claude Code]

Table-improvement pass continued: **Tier 3 (NPC atoms) built, Tier 1 (Place Gen) reviewed + fixed**,
plus a scope-correcting rename. All committed on branch `feat/table-pass-npc-atoms`, `--no-ff` merged to
`master`, pushed to `origin` (`a933f3e..b21f2a0`). Recompiled to **331 tables**; `check-manifest` OK.

### NPC atoms (T3) — four d300 tables via workflow
The DMG/2e **`NPC Hook Megatable`** (Immediate Motivation 50 / Side-Quest d8 / Bonds d10 / Flaws d12 —
flat boilerplate) is **retired** (→ `zz_Archive/`) and replaced with four **d300 Commitment** tables,
spice-graded 198/60/27/12/3, voice-calibrated to the 5-band ladder (Adam: *"spice curve on blast"* —
Mythic genuinely breaks reality):
- **`npc-immediate-motivation`** — what an NPC is doing the moment the party first notices them.
- **`npc-bonds`** — what they protect / strive for (the lever to move them).
- **`npc-flaws-secrets`** — what they hide / their fatal weakness.
- **`npc-job-board`** — a job offered, in the NPC's own voice.
- **Build method (reusable):** Workflow `npc-atoms-flesh-out` (36 agents) — overgenerate ~45% per
  band **with disjoint thematic lanes** so parallel agents diverge, then **dedup + trim to exact band
  counts in JS code** (not an agent). Generators ran on **Sonnet/low** (bulk prose w/ strong anchors =
  low decision-density → cheap + fast). Result returned as structured data; this Claude wrote the .md
  files. Hit exactly 300/table on first run.

### Cleanup folded into the same change (two latent bugs caught)
- **`npc-bond` / `npc-flaws` were first-person PLAYER tables** mislabeled with an `npc-` prefix (header
  literally read "Player Flaws", entries "I assume the worst…") → renamed **`pc-bond` / `pc-flaws`**
  (domain `Character Genesis / PC Traits`). Removes the `npc-bond` vs `npc-bonds` one-letter footgun.
- **Quick NPC Generator 2.0 had been feeding NPCs the first-person PC flaw table** (latent bug) →
  repointed to `npc-flaws-secrets` + `npc-bonds`. `NPC Honesty` prose cross-links repointed too.
- **`npc-secret`** (thin, 100) retired → `zz_Archive/` (superseded by `npc-flaws-secrets`).

### Tavern rename — `urban-encounters` → `tavern-encounters`
The d12+d8 `urban-encounters` (19 half-written, bar-overfit rows) was **always a tavern table**, not
the citywide tool (that's the `Urban Encounter v2.5` node generator). Renamed id → **`tavern-encounters`**
(file `Tavern Encounters.md`). **The freed `urban-encounters` slot is reserved** for a future citywide
random-PRESSURE oracle — a single-roll table for slow urban play when the party isn't closing on
anything. Not built yet — queued.

### Place Gen fixes (T1 review follow-up)
- **Place Traits row 20** was a near-dupe of row 67 (both "town atop an older settlement / furnished
  cellar") → rebuilt to a distinct **lighthouse/salvage** Grounded trait.
- **Place-Secret rows 1–20** were abstract category stubs ("Misjudged a Threat") → **concretized** to
  match the specific rows 21+. Verdict on the suite: the trait→calamity causal coupling is the bar.

### Aside — model-selection note (Adam's question)
For high-volume table *prose generation*, **Opus medium (or +Fast mode)** is the sweet spot; **reasoning
tier should track decision-density, not output volume** — bulk authoring with clear anchors runs fine on
a lower tier (this build's generators were Sonnet/low). Reserve high/max for design/debug.

---

## This session (2026-06-22) — Place Gen table pass + Hometown bardo wiring [Claude Code]

### Place Generation table pass (9 tables rebuilt via workflow)
All Place Generation tables promoted from range-batched / thin rows to full spice-graded d100s
(66/20/9/4/1 distribution, one row per number, Commitment ceiling). Workflow pattern is now
standard for multi-table parallel work. Branch `feat/table-pass-place-gen`.
- **Master Setting, Place History, Place Mythology, Place Nearby, Place Race Relations,
  Place Relevancy, Place Ruler Status** — all full d100, Band column retained, pre-spice originals
  archived in `zz_Archive/`.
- **Place Traits** — d20 (no Band, 2-col) → d100 (4-col: `| d100 | Band | Trait | Calamity |`).
  Calamity is always causally linked to the Trait. `table_class: Fork → Commitment`.
- **Place-Secret** — d20 → **d200** (the engine's first d200; `amax=200` in frontmatter,
  compile script auto-derives dice and distribution). ~32% monster tie-ins: dragons, aboleths,
  fae, vampires, liches, hags, mind flayers, beholders. 4-col `| d200 | Band | Hidden Mistake | Description |`.
- **Place Ruler Status row 93 (Strange):** dragon-on-a-technicality entry added per Adam's request.
- `tables.json` / `tables.js` recompiled — 332 clean tables, 0 real bugs.
- **⭐ Adam wants to review all Place Gen tables next session** before moving to T2/T3.

### Hometown Bardo Wiring
Three Track-B table rolls (place-master-setting → place-history → place-mythology) slot into the
bardo after Life and before the 9 world-genesis beats. First Track-B integration into the bardo
flow (previously all bardo beats used inline Track-A `T` data). Branch `feat/hometown-bardo`.
- **`data/creation-flow.js`** — 3 GUIDE entries added (`ht_setting`, `ht_history`, `ht_myth`).
- **`src/creator/bardo.js`** — `buildBardoSeq()` + `bardoSpine()` extended; `bardoRollHometown` /
  `bardoHometownReroll` / `htMarkdown` added; `bardoLog()` shows Hometown / Founded / Town Myth;
  `renderBardo()` handles `{t:"hometown"}` with die + fragment + reroll (shared reroll budget).
- **`src/world/play.js`** — `bindWorld()` seeds `world.seed.hometown` + writes a canon Ledger entry
  (markdown bold stripped for storage).
- **`manifest.json`** — new owns + `rollTable` call-time dep. `check-manifest` clean (34 modules).

---

## This session (2026-06-21 — latest) — Death & Rebirth loop (all 7 steps) + icon assets [Claude Code]
- **The whole Death & Rebirth loop is built** (spec: `DEATH-AND-REBIRTH.md`; design rows in `DESIGN.md`). On death: the world drifts weeks forward (**bardo gap**, 0–49d bell) + the faction web turns; **14 visions** dream the world's direction over the dead PC's **Saga** (their 7 most significant entities), surfaced to the player as Fragments; the **corpse** lingers + decays by context (recover its loot if you reach it in time); a **new soul** is born — possibly **sworn to a rival** of the dead PC's allies (class-weighted faction proximity) — in a **distant region of one shared plane**.
  - New modules: `src/world/saga.js` (`computeSaga`/`refreshSaga`), `src/world/rebirth.js` (`bardoGap`/`bardoVisions`/`runBardo` + corpse: `corpseStatus`/`corpsesAt`/`claimCorpse`). Reworked `src/world/fate.js` (death → bardo passage → successor; d20 spawn-back **retired**; `#fateModal`→`#bardoModal`). Plane in `world.state` (`regionRingPos`/`placeRegion`/`regionDistance`/`farthestRegion`) + `spawnSuccessorOnPlane`. Proximity in `world-gen.js` (`rollFactionProximity`/`factionKind`) + `data/srd-creator.js` (`METHOD_KIND`/`CLASS_FACTION_AFFINITY`).
  - **XP curve decided: SRD 5.2.1 exactly** (slow climb intended; death expected). **Plane migration is ADDITIVE** (supersedes the spec's bank-and-restart — nothing reset; `U.plane={version:3}`, v2 storage key kept).
  - **Draft content to refine later:** `VISION_OUTCOMES`, the corpse `CORPSE_CONTEXTS`, the faction affinity — all inline drafts, authorable into proper spice-graded tables.
  - **Verified:** `check-manifest` clean (34 modules); `dev/verify-saga.mjs` (45) · `verify-proximity.mjs` (12) · `verify-rebirth-flow.mjs` (19) · `verify-plane.mjs` (14); `dm-events` 21 (no regression). Browser preview couldn't run in this env (sandbox blocks http.server + :5175 held) — verified via full-app jsdom.
- **Ivalice icon assets isolated + wired.** Adam re-exported the asset sheets on **flat magenta**; `ui-sketches/ivalice-style/assets-iso/extract.py` (magenta chroma-key → scipy component isolation, 496 cutouts) + `slice-grid.py` (exact grid: **big-icons → 30 named**, micro-icons → 108) produce transparent PNGs (`extracted/` is git-ignored, regenerable). The 10 used icons live in `assets/icons/`; the in-world **rail + HP/AC badges now render real icons** (`gico()` in `render.js`, glyph fallback via `onerror`).
- **Deferred polish:** region-map SVG + coarse region-to-region travel; author the draft vision/affinity/corpse tables; wire more icons (panels/buttons/decor); the earlier reskin "still needs work" items.

## This session (2026-06-21 — earlier) — DM Bridge + chat-first UI + Ivalice reskin [Claude Code]
- **DM Bridge v1 (`DM-BRIDGE.md`) — the AI-DM loop is live.** `dev/dm-bridge.py` (stdlib mailbox + static server; replaces `-m http.server`). `src/world/dm.js` (`world.dm`): `dmDigest` (JSON twin of `handToDM`), `sendTurn`/`pollResponse`/`applyResponse`, and **`applyEvent(w,e)` — the EVENT-CONTRACT runtime** (a `switch` dispatching typed events to the real mutators; the DM never writes `U`). **This `applyEvent` IS the first piece of advancement's event plumbing — build on it.** Tests: `dev/verify-bridge.py` (29, transport+contract), `dev/verify-dm-events.mjs` (21, full-app jsdom: applyEvent + render). **Running a session:** `python3 dev/dm-bridge.py`, open the URL; a DM watches `.dm/` via `/loop` on **Sonnet** (or Claude hand-answers `.dm/turn-*.json`→`response-*.json`). App waits 5 min for a reply. NEVER `rm -rf .dm` while the bridge runs (it's hardened to re-`makedirs`, but still).
- **Chat-first World view (`NEW-GAME-FLOW §9`) — built.** The World view is the DM conversation centered, with a 6-icon left rail (Story/Character/Map/Ledger/Gazetteer/Powers) whose panels slide in beside the chat (Disco-Elysium two-pane); panels reveal per the Curve of Revelation. Waking cinematic: bardo fades to black → the DM's opening (`wakeIntoWorld` / `autoOpenScene`).
- **Live-playtest fixes:** full spell text in a viewport-clamped tooltip; skill/equipment/spell/choice blocks **gridded**; **one-click "Begin"** (cut the redundant threshold/soul gates); running "So far" list → right column + **life-event rolls itemized**; "This Is Your Life" **inline dice now rolled + gold banked** (`cgMakeEvent`/`cgResolveInlineDice`); DM-bridge poll timeout + resilient mailbox + hidden auto-opening turn.
- **Ivalice UI reskin — the whole app is now light parchment-on-stone** (FFT: Ivalice Chronicles look; from Adam's ChatGPT sketches + texture atlas in `ui-sketches/ivalice-style/`). Cinzel + EB Garamond; fixed top breadcrumb; parchment pages with real paper grain (`assets/textures/`); gold double-borders + steel-blue accent. All five concept surfaces reskinned (start / soul-forging / play / character / world-die) + shelf + map + ledger. **Still rough (Adam: "still needs work"):** corner filigree is approximated (no SVG art); fonts load online (bundle woff2 for offline); legacy manual-sheet + Oracle tabs got only the token-flip.
- **Git workflow live:** branch-per-task → verify → `--no-ff` merge → push to the **private GitHub remote** `origin` = `tiltandfade-lab/Genesis`. `master` is the line (no `main`). Everything above is merged + pushed.

## This session (2026-06-21) — `CLASS_PROGRESSION` (levels 1–20) built [first Claude Code session]
- **Built the advancement track's load-bearing step 1** (`ADVANCEMENT.md`): `data/class-progression.js` (generated) → `CLASS_PROGRESSION`, **12 classes × levels 1–20, 254 feature entries, ~144 KB**. Per level: `pb`, full-SRD-text `features[]`, caster `cantrips`/`prepared`/`slots` (full/half/pact) + Wizard `spellbook`, and class resource scalers (rage, sneak attack, sorcery points, etc.). Until now only L1 existed (`data/srd-creator.js`).
- **Generator `build/gen-class-progression.py` — parse-then-validate.** The SRD's per-level numeric grids *survived* OCR (space-separated rows, em-dash = empty), so it parses the real `classes.md` grids and **asserts parsed spell-slots against authored canonical full/half/pact matrices** (OCR corruption fails the build). Feature names + prose parse from the clean `### Level N:` headings. Ranger's grid was too OCR-scrambled → authored from the Paladin-validated half-caster canon. **Recurring features handled as canonical constants, not parsed** (the summary table is too OCR-corrupted — Fighter lost its level column): ASI 4/8/12/16 (+Fighter 6/14), the few class repeats (Bard/Rogue Expertise, Sorcerer Metamagic, Warlock higher Mystic Arcana), and Wizard's source-absent subclass levels (6/10/14).
- **Registered** `data.class-progression` (manifest + `<script>` + `check-manifest` LAYER). `check-manifest` clean — **30 modules, 215 owned symbols** (only the 6 known layer warns). **Verified 797/797 headless jsdom** (real `genesis.html`), incl. **L1 reconciliation with `srd-creator.js` `CLASS_CASTING`** (which surfaced + correctly models Wizard's spellbook-vs-prepared split). Committed `f9e5601`.
- **jsdom gotcha (memory'd):** classic-script top-level `const` are NOT on `window` (only `var`/functions) — read const globals in a harness via `dom.window.eval("NAME")`. See `project-genesis-class-progression` memory.
- **Out of scope (next):** subclass feature *content* (base classes only), the **XP threshold curve** (its own decision per `ADVANCEMENT.md`, to make before wiring leveling), and any leveling UI.

## This session (2026-06-21) — Git repo + `CLAUDE.md` (Claude Code readiness)
- **`git init` + first commits** (`6428d47` initial, `d7f4f76` track table artifacts). `.gitignore` excludes the copyrighted PDFs (~705M), `Archive/`, `node_modules`, `.DS_Store`; everything else tracked. Working tree clean.
- **Root `CLAUDE.md`** authored — the cross-surface contract Claude Code + the Cowork `genesis` skill both read.
- **Reversed the table-artifact ignore** — `tables.json`/`tables.js` are now tracked so a fresh checkout always runs (Oracle needs `tables.js`) and compile output is diff-able. Still generated.
- Memory: `project_genesis_git`.

## This session (2026-06-21 — docs) — Docs reorg + the combat/XP/advancement spec family
- **All design docs moved to `docs/`.** Root now holds only `README.md` + `table-registry.md`. References fixed in `README.md` and the comment/`desc` pointers across `genesis.html` / `src/world/state.js` / `src/state.js` / `src/engine/hexmap.js` / `build/check-manifest.py` / `manifest.json` (`X.md` → `docs/X.md`). No `[](file.md)` links existed, so sibling cross-refs stayed valid. `check-manifest` OK, manifest valid JSON. New `docs/README.md` index + `type:` taxonomy.
- **⚠ Adam's to-do (read-only here):** the **`genesis` skill** lists several docs by bare name in its "Source-of-truth docs" section — update them to the `docs/` path via **Settings → Capabilities**. Specifically: `HANDOFF.md`→`docs/HANDOFF.md`, `DESIGN.md`→`docs/DESIGN.md`, `NEXT-STEPS.md`→`docs/NEXT-STEPS.md`, `SPICE-CURVE.md`/`GAP-ANALYSIS.md`/`GENERICIZATION-SCAN.md`/`LOOT-REMAP.md` → `docs/…` (the `Reference/SRD-Data/README.md` line is a *different* README and does **not** change). Project instructions don't name doc filepaths, so they're fine.
- **Specced the engine's meat & potatoes (4 new `system-spec` docs):** `EVENT-CONTRACT.md` (the DM↔script typed-event interface; **detected > declared**; adjudication-as-precedent — the spine), `ADVANCEMENT.md` (ledger-spine XP, combat as a gated modifier, threshold leveling on a rest, creativity off the XP axis), `DIFFICULTY.md` (fixed-by-default power bands + narrative-exception scaling, mandatory threat-signaling, murder-hobo answered by named responses via faction clocks), `COMBAT.md` (theater-of-mind zone-band 5.5 engine, cover from terrain specs — sketch; engine deferred to Fable, event surface specced now). Five decision rows added to `DESIGN.md`.
- **Key design locks this session:** XP = resolved tension (one ledger economy, not two pools); combat XP gated to objectives; leveling by XP thresholds applied on a (short) rest; world is fixed-by-default with narrative-exception scaling + danger-telegraphing; murder-hobo is answered, not prevented.

## This session (2026-06-21 — later) — Guided creator COMPLETE: skills / equipment / spells / feat + multi-die
- **The bardo now walks every pick it used to auto-generate.** After scores, four new beats — **Skills → Kit → Spells → Feat** — each with a 🎲 "choose for me" shortcut (three-options ethos).
  - **Skills:** class skill choices (n-from-list), excluding any the background already grants (no-duplicate rule).
  - **Equipment:** starting-equipment A/B (Fighter C / all-gold) packages → `inventory` + `gold`.
  - **Spells (casters only):** cantrips + L1 by class counts, filtered from `SPELLS_SLIM`; non-casters pass gracefully; Paladin/Ranger (0 cantrips) handled.
  - **Feat:** the background's **origin feat** — Magic Initiate resolves 2 cantrips + 1 L1 spell (right ability); Skilled resolves 3 skills (excl. bg/class dupes); Alert/Savage Attacker confirm. `ORIGIN_FEATS` data. (No ASI at L1 — that's a level-4 general feat.)
- **Multi-die roll display** — `roll4d6breakdown()` keeps the four d6 + the dropped one; the bardo slots and the manual Sheet "YOUR ROLLS" strip render them (`miniDice()` + `.score-dice` CSS). Closes the named UX-backlog miss.
- **Data shipped as `<script>` globals, not fetched** — `data/srd-creator.js` (curated `CLASS_SKILLS`/`CLASS_KIT`/`CLASS_CASTING`/`ALL_SKILLS`/`ORIGIN_FEATS`) + `data/spells-slim.js` (generated by `build/gen-spells-slim.py` from `spells.json`; 84 spells, ~17 KB). Resolves the "inline vs localhost JSON" fork: `file://` can't `fetch()`, so `<script src>` it is (the `tables.js` constraint).
- **Picks land on the sheet** via shared `cgSheetExtras()` (used by `cgBind` + `soulFromCGEN`): `skillProfs` merges bg+class+feat; `classSkills`/`inventory`/`gold`/`kit`/`cantrips`/`spells`/`spellAbility` + `featSkills`/`featCantrips`/`featSpells`/`featSpellAbility` added. Manual Sheet punt line updated to point at the guided creator.
- **Verified:** 62/62 headless jsdom (real `genesis.html`, all scripts in document order — class auto-fill, feat cases incl. Magic Initiate + Skilled + no-choice, the 4d6 breakdown, all four render branches, Bard choose-any-3). `check-manifest` OK — **29 modules, 214 owned symbols**.
- **Character Creator focus (opened 2026-06-20) is now COMPLETE.**

## This session (2026-06-21 — earlier)
- **De-monolithing finished (passes 2–8).** Carved the data layer, the engine (`tables`/`world-gen`/`hexmap`/`compiled`), `world.state` + `world.render`, the UI (`oracle`/`chrome`/`dice`), the whole creator (`scores`/`life`/`sheet`/`bardo`/`roster`), and the app core (`world.play`/`fate`/`handoff`). `genesis.html` is now a 449-line shell; 27 modules; `check-manifest` clean. AST (acorn) for scattered carves, jsdom to verify each.
- **Scaling audit → `SCALING.md`.** Verdict: classic-script model scales fine for now; the real risk was global mutable state (now in `GS`); ES-modules migration should ride in **with the eventual graphics engine**, not before (the 59 inline handlers are the blocker). Render/state separation is already graphics-ready.
- **Two scaling guardrails:** the **`GS` state container** (~270 refs migrated), and a **layer-direction check** in `check-manifest` (warn-mode; flips to error once the 6 known inversions are cleaned). Plus the **HTML-tag check** (below).
- **Canon Wandering Souls** are now shipped source (`data/souls-canon.js` → `CANON_SOULS`, idempotently seeded by `world.state.seedCanonSouls`): **Robin, Brunn, Milo**. End-users' banked souls stay local; roster = union. (Replaced the one-off `ROBIN_SEED`.)
- **Pronoun picker** in creation (`data/pronouns.js`; they/she/he) → flows to the soul, the in-play character, and the **DM handoff** (`I am playing X (he / him) — …`). Default they/them.
- **Dice engine consolidated** → `src/ui/dice.js` (`dieRoll` + `diceSpice`); all four contexts (ritual/creation/fate) delegate to it. Shipped a first improvement: tumble-decay + settle-pop. Improve dice **here**.
- **Bugs fixed:** the Sheet's "Best for class" no-op (now a Best/As-rolled toggle); and a real one — `data/souls-canon.js` was in the manifest but had **no `<script>` tag**, so canon souls never actually seeded in-browser. Fixed + the new tag-check prevents recurrence.
- New/updated memory: `project_genesis_canon_souls`, `project_genesis_modularization`.

## Prior session (2026-06-20)
- **Fixed** the Layer-2 "Life" die — now shows the rolled number (was snapping back to the "d100" notation, breaking dice-transparency).
- **Setting (`T.master`) + Built Of (`T.arch`) regraded to the full 5-band Spice Curve**, both now d100. Setting widened in *register* (true city, opulent quarter, canal, lush farmland, festival town, frontier, spa, toll-gate) and extended into Volatile/Mythic (was capped at Strange). Built Of expanded 12→24 and blessed as the shared **Material oracle**. `FRAG.master`/`FRAG.arch` re-aligned (verified). Originals: `Archive/genesis-tables_pre-spice_2026-06-20.md`.
- **Wandering Souls roster** — rolled-but-not-played PCs bank into `U.souls` ("↯ Bank as a Wandering Soul" on the found screen; rendered on the universe shelf). **Robin Hartley** seeded as the first soul (portable record also at `Asset Library/Player Characters/Robin Hartley.md`). Default: bank rolled PCs unless Adam says "play this one out" (`feedback_genesis_bank_pcs`).
- **Race-based name generator** (🎲 "name the soul for me" on the found screen, per species).
- **Modularization pass 1** + manifest/consistency-check spine + the `Open Genesis.command` launcher (above).
- **DM new-player protocol:** at decision points present three concrete options + an explicit "or something else" (`feedback_dm_three_options`).
- New memories: `project_genesis_modularization`, `project_genesis_creator_focus`, `feedback_genesis_bank_pcs`, `feedback_dm_three_options`.
- **Deferred / owed (tracked in `NEXT-STEPS.md`):** continue the modular migration (data layer next: `world-tables.js` = T+FRAG); **Track B sync** — mirror the Setting/Built Of regrade into the Engine markdown source + recompile `tables.json`; wire the dungeon/urban/wilderness adventurer-surfacing rolls to draw from the Wandering Souls roster; then the **creator walkthrough** (class skills / A-B equipment / spells, via SRD-as-JSON over localhost).

## Read these (source of truth — don't re-derive)
- **`DESIGN.md`** — every locked decision. Read before proposing any design change. *(Now carries the **anti-drift north star**: the deterministic state layer is authoritative, the AI is only the interpreter — maximize what the script serves; see also `project_genesis_thesis` memory.)*
- **`SPATIAL-MODEL.md`** — geography (2026-06-19): node-graph **cognition** + lazy deterministic **hex substrate** (unbounded fraying plane, AI never holds the grid); travel = scene-to-scene **wilderness-encounter series**, not a hex-crawl.
- **`NEW-GAME-FLOW.md`** — ⭐ the live spec for the guided creation (the Bardo: soul→sheet→life→world, one choice/roll at a time) + §8 Curve of Revelation + §9 the chat-first interface. **Read this first for any UI / creation work — it's the most active design surface.**
- **`CHANGELOG.md`** — ⭐ running changelog, newest first (started 2026-06-21). **Add a dated entry every working session** (Added / Changed / Fixed / Deferred).
- **`SCALING.md`** — ⭐ the architecture/scaling audit (2026-06-21): the classic-script vs ES-modules call, the `GS` state discipline, the layer-check, and *when* to migrate (with the graphics engine). Read before any structural change or before adding a rendering/graphics layer.
- **`NEXT-STEPS.md`** — the ordered build plan; "Do next" at the bottom.
- **`SPICE-CURVE.md`** — the intensity-grading spec.
- **`GAP-ANALYSIS.md`** — what's missing and why.
- **`GENERICIZATION-SCAN.md`** — the IP/campaign scrub record (detection + SRD cross-check + what was wiped).
- **`Reference/_Index/`** — creature/section → page indexes for the 2024 MM, PHB, DMG.
- **`Reference/SRD-Data/`** — machine-readable SRD 5.2.1 (everything except monsters): `spells.json` (339), `conditions.json` (15) + `rules-glossary.json` (155), `magic-items.json` (258), `equipment-weapons-armor.json`, `classes-species-backgrounds-feats.json`, + faithful markdown for core rules / classes / origins / equipment. See its `README.md`. **This is the AI DM's rules-lookup layer.**
- **`LOOT-REMAP.md`** — the loot-system overhaul spec (D&D rarity axis + 4 tiers of play).
- Memory: `project_genesis`, `project_srd_data`, `project_dnd_books_reference`, `project_genesis_genericization`, `feedback_default_genesis_context`, `feedback_monster_custom_tables`, `feedback_read_vault_before_claims`, `feedback_dm_agency`, `feedback_vault_workflow`.
- **Skill:** the `genesis` skill is now installed — it auto-loads this context. (It hands Shifting-Vale / playtest triggers back to `arcana-playtest`.)

## What Genesis is (the locked shape — unchanged)
- **Loop:** roll a world skeleton → enter → explore (rolls new corners) / ask about the past (lazy history) → AI DM weaves it → everything persists. World = save file; worlds accumulate into a universe; only explicit destroy unmakes one.
- **AI DM narrates** (definitive). Player rolls openly (dice transparency, not a silent DM).
- **Fragment oracle (default):** player sees a 6–10 word sensory fragment; DM sees the real row, reveals via narration.
- **Spice = emergent.** 5-band ladder (Grounded→Textured→Strange→Volatile→Mythic) as honest per-table rarity; spicy roll → spicy outcome → written to the ledger. No time-escalation, **no tonal railroad**.
- **Time:** visible in-world clock, advances only via DM-declared transitions (travel/rest/montage). Two counters (session + in-world).
- **World State Ledger** = single home for ALL change-over-time info.
- **Map:** primitive node-graph (places=nodes, routes=weighted edges); spatial facts write-once canon.
- **Combat parked for Fable.** Stock 5.5e, bend reactively + log it.

## Current build state of `genesis.html` (as of 2026-06-19, end of the big session)
**The game now opens as a guided experience — read `NEW-GAME-FLOW.md` first for the creation/interface design; it's the live spec.**
- **Start screen:** app lands on a simple immersive `panel-start` (`renderStart`) — "GENESIS" + one line + **✦ Begin** → the guided creation; a quiet "↩ return to your worlds (N)" appears only if worlds exist. (Init = `showTab('start')`.)
- **THE BARDO — the guided New Game (spirit-guide, one choice/roll at a time).** A single `buildBardoSeq()` walks: **threshold → soul (wordless intro) → species → class → background** (guided choices with `TIP` tooltips) **→ scores** (4d6-drop-lowest, one ability at a time, then "Best for class" / "As they fell") **→ life** (ONE roll per sub-table — dynamic queue: parents·birthplace·siblings→birthOrder·family→absentParent·means·home·memory·why-bg·why-class·age→events×N) **→ world** (the 9 skeleton beats, **trouble last**) **→ found** (name the soul + the world, last) **→ "✦ Open your eyes."** `bardoFound` assembles **world then character** (`bindWorld`+`cgBind`). Each die shows its real notation (d100/4d6/d6) + tumble + spice "juice" (Bizarre/Otherworldly/SPICY); 3-reroll shared budget; a running log accretes the soul. Old `#panel-charge` menu bypassed (kept for fate/successor).
- **Curve of Revelation (anti-overwhelm):** first-timers wake into a MINIMAL world view; Powers/Map/Ledger/Gazetteer reveal on first relevance (travel→Map, transition→Ledger, montage→Powers) with a fading-guide line; learned panels persist (`U.revealed`); veterans (3rd world+ / "reveal all") wake fully open. **Diegetic clock:** player sees day + time-of-day band ("Day 2 · morning"); exact minute gated by `w.knowsTime` (timepiece/class hook); DM gets exact.
- **Interface v1 (chat-first, in progress):** top tabs → **left nav rail** (`.rail`: ✦ Universe · ◈ World · ⚅ Oracle); content in `.stagecol`; creation/bardo go immersive (rail hidden). **NOT yet done:** the World view as a chat/scene feed + Disco-Elysium column-slide (the substantive chat-first part — the next build).
- **Compiled tables:** `Engine/00. _System/compile-tables.py` parses the markdown corpus → `tables.json` + **`tables.js`** (a `window.GENESIS_TABLES` global; `file://` can't fetch, but `<script src>` loads). Dice-aware (flat dN, bell NdM, mixed d12+d8). `genesis.html` loads `tables.js`; the **Oracle tab** rolls any of the 328 compiled tables. **But the bardo/world rituals still run on INLINE table data** (`T`/`SS`/`EB`/`CG`/`FRAG`) — migrating the rituals onto the compiled layer is future work.
- **Fragments:** the world-genesis cards + pressures show the player a fragment (the `FRAG` veil, inline); the DM gets the real row via `handToDM`. The *compiled* tables.json fragment-slots are still null (broader Fragment batch = future).
- **World spine (Track A) live:** World State Ledger, visible clock + transitions, node-graph + hex map, localStorage (`genesis-universe-v2`), legacy-save migration.
- **Not built:** chat-centered world view + column-slide; change-over-time layer (faction clocks/drift/NPC life-events — ledger ready, char-genesis seeds it); compiled-table migration of the rituals; tarot; combat (parked for Fable).

## Monster library + reference (built this session)
- **`Asset Library/Monsters & Enemies/` ≈ 379 files / ~536 stat blocks** — effectively the full 2024 Monster Manual + SRD, all 2024-canon. Adam's ~66 originals were audited to 2024; the rest came from the **SRD** (clean programmatic parse) + **MM-vision subagents** for the ~50 non-SRD IP creatures. Dragons consolidated (one file per color, all ages + Adam's custom tables).
- **Adam's custom d10 flavor tables are SACRED** (see `feedback_monster_custom_tables`) — never overwrite; stat-fixes touch mechanics only.
- **`Reference/`** holds the scanned MM/DMG/PHB 2024 (broken OCR — vision-read stat blocks, never parse the text layer). The clean **SRD 5.2.1** lives in Adam's top-level **`Books/2024/`** (real text layer → parseable). Indexes in `Reference/_Index/`.

## What happened this session (2026-06-18)
- **Built Track A** (World State Ledger + clock + node-graph map) into `genesis.html`; verified in a headless harness; legacy-save migration added.
- **Brought the Asset Library into Genesis** (NPCs, Factions, Narrative Devices, generators, design-heritage docs) from Shifting Vale — Genesis-owned copies.
- **Monster library 66 → ~379:** audited stale monsters to 2024, SRD bulk import, MM-vision import of IP holdouts, dragon consolidation. (Fixed a parser-contamination bug — see gotchas.)
- **Built book indexes** (`Reference/_Index/`) and acquired the SRD.
- **Genericization:** detection scan + SRD cross-check + **destructive Phase-2 wipe** (69 files, FR/campaign specifics → generic placeholders; SRD-safe terms + celebrity analogs kept).
- **Indexed the full SRD 5.2.1 into `Reference/SRD-Data/`** (everything except monsters): 339 spells, 155 glossary entries (incl. 15 conditions), 258 magic items, 38 weapons + 13 armor — all as queryable JSON — plus faithful markdown for core rules, classes, character creation, origins/feats, equipment. Hybrid JSON+MD, programmatic parse of the SRD's clean text layer. This is the DM's rules-lookup layer (complements the monster library).
- **Loot system overhaul** (`LOOT-REMAP.md`): remapped onto D&D rarity + the 4 DMG tiers of play. Renamed the whimsical "Legendary" → `Dungeon Loot - Minor Wondrous`; built true `Legendary` (32 SRD) + `Artifact` tables; merged the 258 SRD items into the rarity tables (Common 31 / Uncommon 87 / Rare 101 / Very Rare 64 — 247/258 reachable, Adam's curated rows preserved); reconciled the entry layer (Budget drives rarity, Composition = presentation wrapper, Tier retired); extended Budget to T3/T4; `Treasure Generator` → v1.1. Originals archived. Also fixed a `magic-items.json` attunement-wrap bug (+40 items).
- **Locked the edit-source → compile-artifact architecture** (DESIGN): markdown tables = editable source; compiled JSON = generated build artifact; engine does mechanics, AI does interpretation; compile validates cross-references.
- **Fixed the default-context drift** (Adam noticed new sessions digging through Shifting Vale): added `feedback_default_genesis_context` + reframed memory; built and shipped the `genesis` skill. Adam still needs to update the **project instructions** in the Claude app (they're the root pull — they still name Shifting Vale and not Genesis).

## This session (2026-06-19) — Character Creation, built end-to-end
The `(a)/(b)/(c)` fork (NEXT-STEPS item 14) is **resolved and built.** Adam's call mid-build: use his Xanathar's **"This Is Your Life"** tables (he sent the wikidot transcription) as the biographical layer — which reframed the fork into **two interlocking layers**:
- **The Sheet** (mechanical `(c)` hybrid) — player chooses species/class/background, rolls scores **4d6 drop lowest** openly, engine computes the cheap derived numbers (HP/AC/mods/PB/passive Per/saves), heavy class-feature/gear/spell text stays a **`SRD-Data` pointer** the DM resolves at the table. *(Finding: class mechanics aren't queryable yet — they're prose in `classes.md`, not JSON — which is why pure-`(a)` auto-fill was heavier than it looked.)*
- **The Life** (biography) — the XGE "This Is Your Life" roll-chain (Origins → Personal Decisions → Life Events → Supplemental), **keyed to the chosen class+background**. Player rolls openly; the AI DM guides + weaves.

Both interlock; backstory people/threads **auto-seed the World State Ledger as write-once canon** (char-genesis *seeds the world* — feeds reincorporation / NPC-life-events / lie systems). The fate-d20 successor reuses the same ritual. Retired the flat `SPARK` for a derived headline.

**Shipped:** `CHAR-CREATION.md` (canonical spec), `Engine/03._Tables/04. Character Genesis/This Is Your Life.md` (XGE suite as markdown source) + `Genesis Backgrounds.md` (native backgrounds), `Engine/02._Procedures/Character Genesis Procedure v1.0.md`, the ritual in `genesis.html` (new `#panel-charge`, inline `CLASSES`/`SPECIES`/`BACKGROUNDS`/`CG`/`CG_BG`/`CG_CLASS` data + logic). Verified **34/34** in a headless harness (`outputs/cg_harness.js` — table coverage, derived numbers, score assignment + swap/reset, background integrity, 1500-run life-chain stress, seeding, handoff).

**Also 2026-06-19 (Adam's follow-ups):** (1) **drag / tap-to-reassign ability scores** — defaults to best-by-class, draggable cards, "↺ Best for class" reset, background +2/+1 stays pinned. (2) **Backgrounds → 19** — 4 SRD + 6 Genesis-native (Bog-Iron Digger, Glass-Singer, Hearth-Watch, Crier, River-Rat, Pilgrim) + 9 standard archetypes (Charlatan, Entertainer, Folk Hero, Guild Artisan, Hermit, Noble, Outlander, Sailor, Urchin) **rebuilt IP-clean** (own packages + own prose, SRD feats only). (3) **Genericized the whole biography suite** — rewrote the XGE "This Is Your Life" chain into original, IP-clean, spice-graded prose as `Life & Origins.md` (+ inline `CG`/`CG_CLASS`/`CG_BG`); scrubbed named planes / fey-fiend-celestial / Underdark / named monsters / Spell Scroll / Potion of Healing / Wish / the "Race" table; dice ranges + branch logic + seeding preserved; XGE archived heritage-only in `04. Character Genesis/zz_Archive/`. Character genesis is now **public-release-clean** (only the 16 PI monsters + placeholder→native-generator work remain in `GENERICIZATION-SCAN.md`). Verified **35/35** (adds a headless IP-scrub guard + 19-background check). Canonical source: `Life & Origins.md` + `Genesis Backgrounds.md`.

**⚠ IP flag (deferred, logged):** "This Is Your Life" is **Xanathar's, not SRD 5.2.1.** Fine for Adam's personal tool; genericize before any public release (same treatment as the PI monsters — see `GENERICIZATION-SCAN.md` + `CHAR-CREATION.md`).

## This session (2026-06-19) — the big build (after char-creation, above)
The session went from "validate the tables" all the way to "the game opens as a guided experience." In order:
1. **Table census + frontmatter:** stamped **lean YAML across all 754 files** (Engine/03._Tables + Asset Library incl. monsters); `id`/`type`/`domain`/`status` + (on tables) `table_class`/`player_facing`/`voice_critical`; die/rows/spice are DERIVED by the compiler, not stored. Enforcer `Engine/00. _System/stamp-frontmatter.py` (idempotent, additive); schema doc `Engine/01. _Templates/_Table Frontmatter Schema.md`. `table_class` reviewed → Commitment tightened 44→11.
2. **Compiler:** `Engine/00. _System/compile-tables.py` — validates coverage (dash-normalize, full-die), **dice-aware** (NdM/d12+d8 declared in heading, confirmed by row range), emits `tables.json` + `tables.js`. First run: 344 dice tables, 0 real coverage bugs. Fixed `region-encounter` missing header.
3. **Wired the game to the compiled tables** via `tables.js` + the **Oracle tab** (roll any of 328).
4. **Entry bridge** (the opening scenario) rebuilt — `rollEntry` assembles the 5-slot bundle; Option C fresh `EB` tables (`Starting State - Opening Bundle.md`, d100 spice-graded).
5. **Fragment veil** on the world-genesis cards + pressures (the `FRAG` map).
6. **Curve of Revelation** (progressive panel reveal + diegetic clock).
7. **THE BARDO**: built the guided New Game, then **reshaped it to `soul → sheet → life → world`**, one choice/roll at a time, no menus; **finer life = one roll per sub-table**; name moved to the end; dice show real notation.
8. **Interface v1**: left nav rail + start screen (fixed a `.stage` class-collision that blanked the screen → renamed to `.stagecol`).
9. **Content**: taboo + smell + sound expanded to d100 spice curves (rare unpleasant + uncanny tails).
Full detail in the `project_genesis` memory and `NEW-GAME-FLOW.md`.

## Next move
**⭐ Table-improvement pass — remaining work.** T1 (Place Gen) ☑ reviewed + fixed (2026-06-23). T3 (the
core NPC atoms) ☑ rebuilt to d300 (2026-06-23). **Still open:**
- **T2 — Myth content:** `Myth Costs`, `Myth Becomes Geography` (thin) → spice-graded rebuild, same
  workflow/5-band protocol.
- **Citywide urban-pressure table** — build the single-roll random-pressure oracle for the now-freed
  `urban-encounters` slot (distinct from the `Urban Encounter v2.5` node generator and from the renamed
  `tavern-encounters`).
- **Optional follow-on:** wire the new situational tables (`npc-immediate-motivation`, `npc-job-board`)
  into encounter-time flow — they're not in the static Quick NPC Generator (which now pulls role / visual
  / hook / talents / **flaws-secrets** / mannerisms / **bonds** / useful-knowledge / bonus-secret / ability).
- **Other NPC atoms** still thin if you want to keep going: Demeanor, Mood, Under Pressure, Talents, etc.

**DM Charter (v1 specced 2026-06-22):** write the DM's operating contract — ground rules + secret-information handling + **the slow drip of reveals** (Adam: *"the slow drip is everything in D&D"*). The DM-side rules are scattered today (Fragment veil, hidden truth layer, three-options, over-reveal discipline, threat-signaling); consolidate into a `DM-CHARTER.md` `system-spec` used by both the DM Bridge and the shipped DM. Full scope in `NEXT-STEPS.md` "Do next".

**The Death & Rebirth loop is COMPLETE** (all 7 steps — see latest-session block). The natural next moves: (1) **author the draft content** the loop ships with — the `VISION_OUTCOMES`, `CORPSE_CONTEXTS`, and faction-affinity drafts → proper spice-graded tables (Adam's domain); (2) **UI polish** — a region-map SVG + coarse region-to-region travel, and wiring more of the new Ivalice icons (panels/buttons/decor) beyond the rail + HP/AC; (3) **lane A — Advancement** (below) is still the big unbuilt mechanic and the XP curve is now decided (SRD-exact).

**(A) Advancement — the meat & potatoes.** Specs locked (`EVENT-CONTRACT.md` / `ADVANCEMENT.md` / `DIFFICULTY.md` / `COMBAT.md`). Step 1 (`CLASS_PROGRESSION`, levels 1–20) ☑ done. **The `applyEvent(w,e)` runtime in `src/world/dm.js` is now built — that's the event-contract spine; advancement plugs straight into it.** Do next:
  1. ☑ **XP threshold curve DECIDED — SRD 5.2.1 exactly** (no compression; slow climb intended given death-expected play). Remaining: author the SRD thresholds as a compile-ready markdown table → JSON.
  2. **Event-contract plumbing** — extend `applyEvent` so the relevant types (`front_closed` / `clock_fired` / `encounter_resolved` / `discovery` …) compute XP into a script-owned ledger; prefer *detected-from-state-delta* over declared.
  3. **Rest-gated level-up beat** — reuse the creator bardo machinery (`cgSheetExtras` + step renderers) to re-walk new spells / ASI / subclass against `CLASS_PROGRESSION` when a threshold is crossed on a rest.
  Combat award-values wait for the Fable engine; everything else is buildable now.

**Queued from the live playtest (smaller, high-value — see the `project-genesis-playtest-open-items` memory):**
- **Show the "This Is Your Life" backstory in the Character panel** — origins + life events; currently seeded to the world (`seedFromLife`) but not shown on the sheet.
- **Expand every range table to unique rows** (EXCEPT the CG life tables) for replay variety — preserve the Spice Curve bands + `FRAG` alignment, archive originals, recompile `tables.json`. Best as a workflow that drafts band-by-band.
- **Bench created worlds + PCs** — a reusable pool that *may* surface in future games (like Wandering Souls, but for worlds too).

**UI polish backlog (the reskin "still needs work"):** real SVG corner filigree; bundle the woff2 fonts for true offline; place the compass-rose motif (topbar/watermark); bespoke-reskin the legacy manual sheet + Oracle tabs; **DM over-reveal discipline** (don't surface DM-only lore in opening choices); text animations on DM narration.

**Other open threads (not blocking):** the broader **Fragment batch** (fill compiled `tables.json` fragment-slots); migrate bardo/world rituals onto the **compiled** tables (today inline `T`/`SS`/`EB`/`FRAG`); change-over-time layer (faction clocks/drift/NPC life-events off the live ledger); Wilderness Encounter Generator inline port.

### Backlog (other open moves, not this session)
- **Native generators** — name / faction / deity / culture / place, to replace genericization placeholders. *Where Genesis fully branches off core D&D.*
- **Track B data pipeline** — per-table frontmatter → `tables.json` → wire `genesis.html` off inline data → fragment batch. Unblocks Fragment + Spice.
- **Change-over-time layer** — faction clocks / drift / reincorporation / NPC life-events (hang off the live ledger + clock).
- **Loot follow-ups** — L3b (home the 5 rarity-spanning variants), L4 (band the Outlandish d300 by power + level-gate — the DeLorean fix), L7 (regenerate `table-registry`).
- **Monster reskin** — the ~16 non-SRD Product-Identity creatures (Beholder, Mind Flayer, Slaad, etc.) for public release.

## Gotchas
- `genesis.html` uses INLINE data, not the registry (wiring it = Track B).
- **Scanned MM/DMG/PHB have broken OCR** — vision-read stat blocks (320-DPI crops), never trust the text layer for numbers. The **SRD has a clean text layer** (parse it). When parsing SRD blocks, the type-detector must handle "Medium or Small <Type>", "Swarm of…", and lycanthrope types (detect block-start = any size-line followed by an "AC " line), or creatures get absorbed into neighbors.
- **bash `rm` is blocked in the mount** — use `mcp__cowork__allow_cowork_file_delete` first.
- **Read actual engine files before claiming a gap** — the engine keeps superseded versions; auditing a stale file produces false "missing" reports.
- DM-agency rules apply in play (`feedback_dm_agency`).
- **`genesis` skill now exists** (installed) — handles orientation + hands Vale/playtest triggers to `arcana-playtest`. The **project instructions** (Claude-app settings, not a file) still name Shifting Vale, not Genesis — Adam needs to update them; that's the remaining root pull toward the Vale.
- **Loot tables are remapped** (`LOOT-REMAP.md`) — don't treat the old "Tier" table or whimsical "Legendary" as live; the SRD additions in the rarity tables are pointer-format rows (rows 1–N are Adam's curated picks, verbatim).
- Minor cleanups outstanding: cosmetic heading-number collisions in grouped monster files; genericization placeholders are readable but not final names (generator work); a few all-lowercase small-caps subheadings in the SRD-Data markdown are lightly spaced.
