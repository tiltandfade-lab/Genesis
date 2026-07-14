# Adversarial Playtest Log — RUN 4 — "The Whiplash Escape" (Rennick Fool, L10 social-caster)

- **Rig:** `dev/playtest-bridgeless.mjs`, scratch dir `rennick-run4`, both seats sealed. CONTINUES Runs 1–3.
- **THESIS: "the story is in the dice."** Force a deliberately VOLATILE roll sequence — nat-1 fumbles,
  nat-20 crits, crit-magnitude spikes, swingy turn-to-turn outcomes on things that MATTER — and see whether
  the AI DM can run the whiplash coherently: honor the margin-based degrees-of-failure ladder, render the
  crit-magnitude lens payloads, and keep tonal/narrative continuity across the swings. NOT building/fixing.
- **PC at open:** Rennick Fool — L10 Human Bard, HP **37/43**, AC 14, STR6/DEX16/CON8/INT10/WIS8/CHA18, PB+4.
  Spell save DC **16**. Slots **[0,2,2,3,0]** / max [4,3,3,3,2]. Concentration LIVE on **Hypnotic Pattern**
  (Run 3 close). Kit: Charm Person, Suggestion, Enthrall, Hypnotic Pattern, Compulsion, Dominate Person +
  Vicious Mockery, Vicious-Mockery/Dancing Lights/Light cantrips. skillProfs incl. Acrobatics, Performance, "all".
- **World inherited:** internal haunting front **2/6** (dmOnly: "a contagion of dreams or memory, passing
  sleeper to sleeper"); Hearth-Watch faction **2/6**; external 0/6. Rennick is pinned as the wall-killer at
  **High-Harrow Gate**, the **alarm bell now ringing** (Run 3 T10 finale). Myth: Seven Brothers. Taboo: Left-Hand.
- **Volatility lever:** I supply the player's d20s via `digest --rolls`. Roll objects are well-formed
  `{label,die:"d20",result,total,adv,pair}`; DM-side rolls (saves, the crit magnitude die) come from the real
  RNG via `roll`/`dmRollFor`. On a supplied nat-1/nat-20 the flow falls to the live two-turn crit path
  (dmRollFor guard, dm.js:728) — I resolve it as the DM hat.

---

## PRE-TURN — engine crit-magnitude + margin-ladder PROVEN DETERMINISTICALLY (probe)
Before the narrative turns, forced the engine mechanisms directly (`/tmp/crit-probe.mjs`, real modules in jsdom):
- **crit-magnitude chains the 2nd d20 on every nat-20/nat-1, returns null otherwise.** Verified nat 15 → null.
- **lens count scales with magnitude** (nat-20): mag 5→0 lenses (standard), 12→1 (amplified-minor), 17→2
  (amplified-major), 20→3+cascade+canon (mythic). nat-1 INVERTED: mag 15→0, 9→1, 4→3, 1→3+cascade+canon+placeHandoff→mythSeed.
- **place-lens (row 1) routes to myth-seeds** — fired on nat 1/1 (mythSeed drawn).
- **margin ladder checkDegree** grades correctly & TIGHT: +10→crit-success, 0→success, −1/−2→near-miss (ONLY
  wiggle band), −3..−9→failure, ≤−10→crit-failure. Confirmed −2→near-miss, −3→failure (the tight boundary holds).
- ★ NOTE: `dmRollFor` (dm.js:696) rolls `rollDie(20)` directly — it does NOT read a supplied player d20. So the
  harness `roll` path uses real RNG; the volatility lever is the `--rolls` fed to `digest` (DM adjudicates), and
  crit spikes are canonized via the DM's `crit_outcome` event (the production SEAT path). Branch turns (T3/T7)
  use the `apply`→`roll` path to test native branch landing, accepting the RNG die and reporting the grade.

## Turn 1 (T1) — CATASTROPHE: nat-1 fumble on a LETHAL fortress-wall vault (escape from the alarm)
**Forced roll (WHY volatile):** Acrobatics **nat-1** (total 8) on vaulting the outside face of the High-Harrow
gate-wall — a 20ft+ lethal drop. Opens the whiplash arc on disaster, on something that can kill.
**Engine:** lane=fast, digest 10057B. `apply` ok:true. `crit_outcome {nat:1,mag:2,tier:amplified-major}` LANDED
→ ledger "✦ A crit failure leaves its mark — [3 lenses]". `hp_changed -22` → **37→15/43**. `fact_canonized` landed.
- ★ `clock_advanced {clockId:"internal"}` → **"untracked — no matching faction/front"** — the front's real
  clockId is the danger-slug `a-haunting-or-a-curse-no-one-will-name-has-settled-in` (digest ships it correctly);
  I fed the `kind` value. SEAT-USAGE error, not an engine bug (digest carries the right key). Re-fed correctly later.
- ★ `condition_add {condition:"maimed-left-hand"}` DROPPED (conditions stay []). TWO reasons: (1) no `target`
  field → `no-target`; (2) "maimed-left-hand" isn't in the SRD condition ontology → `addCondition` returns null
  ("engine never invents a condition ontology"). WAI — the maim is narrative/codex, not a mechanical condition.
**DM (me):** ran the HIGH-magnitude fumble as 3 coherent lenses fused to the fiction, honoring the taboo:
  - *Something lost beyond recovery* → his **left hand** crushed on the merlon, permanently maimed — and it's
    the hand this country reads as an insult (taboo echo). Narrative maim (not a condition).
  - *A door opens that should be shut* → the fall springs a sealed sally-grate; the pass-mist pours INTO the
    gate underworks (the haunting front gets a new mouth) — internal front should tick.
  - *A place is scarred / myth-seed* → the fall becomes a witnessed sign ("the wall-killer went over and the
    mountain opened a door").
**Verdict:** crit_outcome rendered the fumble payload coherently; catastrophe is real (−22, maimed, front breached)
but survivable (15/43). Whiplash arc opens on disaster. crit-magnitude fired + landed natively via crit_outcome.

## Turn 2 (T2) — TRIUMPH: nat-20 MYTHIC crit (mag 20, cascade, canon) on a Performance escape
**Forced roll (WHY volatile):** Performance **nat-20** (total 28), magnitude forced to **20** = the MYTHIC band
(cascade, canon) — the hardest tonal swing possible, one turn after the fall. On something that matters: escaping
a whole pursuing Watch while bleeding and maimed.
**Engine:** lane=fast, digest 10409B. `apply` ok:true. `crit_outcome {nat:20,mag:20,tier:mythic,cascade:true}`
LANDED → "◆ A mythic triumph is woven into the world — [3 lenses]". `epithet_grant {text:"the Fool of
High-Harrow"}` PERSISTED → "◆ Rennick Fool is now known as 'the Fool of High-Harrow'". `fact_canonized` landed.
**DM (me):** swung tone hard from disaster to legend and rendered the 3 mythic lenses:
  - *A hidden truth becomes undeniable* → the wall WITNESSES the mist move against the wind toward the song; it
    is exposed as alive/listening — but ONLY its nature, NOT the dmOnly contagion mechanism (**seal held under a
    mythic reveal-lens** — the exact hard case).
  - *Fate tilts toward the doer* → the Watch pours up-pass after the phantom Dancing-Lights; Rennick escapes.
  - *A name becomes a force* → "the Fool of High-Harrow" crystallizes into road-legend (epithet canonized).
**Verdict:** the mythic-canon path fired end-to-end (crit_outcome canon + epithet + fact). The DM turned an
extreme roll into a memorable, tonally-whiplashed beat WITHOUT breaking the dmOnly seal even on a truth-reveal lens.

## Turn 3 (T3) — BRANCH-RESOLUTION native-landing test (BUG-01) — Stealth into the underworks
**Setup:** DM set a branched Stealth rollRequest (dc15, all 3 branches survived validation). Player rolled the
NATIVE `roll` path (real RNG — the honest swingy die).
**Engine:** rolled total **6 → margin −9 → degree `failure` → `fail` branch**. `resolvedLocally:true`.
**★ BUG-01 FIX HOLDING:** the fail branch's events LANDED NATIVELY on resolution — `clock_advanced
{clockId:"the-hearth-watch"}` ticked Hearth-Watch **2/6 → 3/6** (correct key, no drift, NO `patch` route-around),
`fact_canonized` landed. The DM's fail-branch narration rendered as the DM-voice reply.
**★ MARGIN LADDER correct:** total 6 vs dc15 = −9 = `failure` (NOT near-miss — the tight grace band held; a −9 is
a real failure, exactly per the ladder). Real volatility from the RNG: a genuine swingy fail on a matter that counts.
**Verdict:** branch events land natively (BUG-01 fix confirmed a 3rd continuing-save time); margin graded correctly.

## Turn 4 (T4) — CATASTROPHE stack: nat-1 fumble (mag 4, amplified-major) on a reckless one-handed 4th-lv cast
**Forced roll (WHY volatile):** **nat-1** on a DM-called spell-artistry check to hold Compulsion (4th) one-handed
with a maimed hand while cornered. Magnitude forced to 4 (amplified-major, 3 lenses). Stacks catastrophe on the T3 fail.
**Engine:** `cast {Compulsion, level:4, concentration:true}` → **★ 4th slot DECREMENTED 3→2** (cast committed even
on a fumble — slot economy enforced). `concentration_broken` cleared the Hypnotic Pattern conc. `crit_outcome`
{nat:1,mag:4} rendered 3 lenses. `hp_changed -7` → **15→8/43**.
**DM (me):** ran the fumble as a BACKFIRE (spell never reaches the Watch, folds back on the caster): *debt comes
due* = the mist starts "keeping an account" of him (front pressure toward HIM), *local law bends wrong* = the
underworks goes sound-dead (a scar on the place, and it cripples a caster-by-voice going forward), *lost beyond
recovery* = the 4th slot burned on nothing + psychic recoil. He is now 8/43, hunted, voice-muffled.
**Verdict:** the slot is spent on the botched cast (economy correct); the DM rendered a HIGH fumble as coherent,
location-scarring consequence rather than a flat "you fail." Catastrophe compounds — the arc's low point.

## Turn 5 (T5) — TRIUMPH (bounded): nat-20 (mag 12, amplified-MINOR, 1 lens) on a desperate motivated-lie Deception
**Forced roll (WHY volatile):** **nat-20** Deception (total 28). Magnitude forced to **12** = amplified-MINOR (1
lens) — deliberately a SMALLER crit than T2's mythic, to test that lens count varies DOWN, not always maxed.
On a matter that counts: reframing himself from wall-killer to the fog's first witness while cornered at 8 HP.
**Engine:** lane=**deep** (triage bumped the longer social beat). `crit_outcome {nat:20,mag:12,amplified-minor}`
rendered its SINGLE lens. `social_check {overshoot:true}` → **★ moved the codex attitude NATIVELY: "The
Watch-Sergeant warms — Indifferent → Friendly (ask granted)"** — note this is the `social_check` path, which WORKS,
distinct from the BUG-17-broken `attitude_shift` event. `codex_add` minted **"The Grate-Witnesses"** faction (new
id, no collision — BUG-11 guard not triggered). `fact_canonized` landed.
**DM (me):** the lie WRAPS the TRUE front-fact (the mist takes sleepers) but Rennick GUESSES it — the dmOnly
MECHANISM ("contagion of dreams passing sleeper to sleeper") did NOT leak from his mouth (seal held; he's right by
luck, not knowledge). Lens "a new thing enters the world" → a nascent faith among the Watch (the codex_add). NOT a
clean escape — plants leverage, not freedom.
**Verdict:** crit lens count VARIED DOWN correctly (1 lens vs T2's 3); the nat-20 became a memorable reframe beat;
seal held on a lie that brushed the truth; social_check moved attitude natively (the working social path).

## Turn 6 (T6) — MARGIN NEAR-MISS test (miss DC by 2) — Persuade the sergeant to let him lead
**Forced roll (WHY volatile):** Persuasion d20=10 → total **18** vs a HARD fiction **DC 20** = margin **−2** =
NEAR-MISS (the ONLY wiggle band). Tests the softened-partial rung on a matter that counts (his neck + leading the Watch).
**DM (me):** ran the ladder correctly in PROSE — softened partial, pressure maxed: the sergeant REFUSES the ask
(won't let a mind-bender lead in the dark) but WITHHOLDS the rope (kept chained/watched/alive one more night). Not
a win, not a full failure — the exact near-miss shape.
**★★ NEW FINDING (candidate BUG-18) — `social_check` re-grades against the engine's INTERNAL attitude-DC, not the
DM's fiction DC → narrated near-miss/refusal silently produced an ATTITUDE PROMOTION in state.** I emitted
`social_check {total:18, overshoot:false}` alongside the near-miss narration. The engine's social_check handler
(dm.js:2507) grades the total against `socialDC(a.value)` — an INTERNAL DC keyed off current attitude — NOT my
fiction DC 20. The sergeant was at Friendly(1) from T5, `socialDC(1) ≤ 18`, so the engine climbed him **Friendly →
Helpful (value 2), "ask granted"** — the OPPOSITE of my narrated refusal. Now `status.attitude.value:2` in state
while the prose + fact_canonized say he refused and stayed grudging. **The DM's narrated degree and the mechanical
attitude outcome DIVERGE.** Root: the fiction DC and the social-resolver DC are decoupled; a DM can emit a raw-total
`social_check` on a beat they narrated as a *miss* and get a *promotion*. Seat mitigation: on a near-miss/fail,
DON'T emit `social_check` (let the prose stand), OR only emit it on a clean success. This is a coherence hazard for
"the story is in the dice" — the state can contradict the narrated die. Category: contract/seam (social spine).
Cross-ref BUG-17 (the OTHER social-attitude event, `attitude_shift`, which is broken the other way — never moves).
**Verdict:** the DM ran the near-miss PROSE correctly per the tight ladder; but a raw `social_check` emission on a
narrated miss produced a contradicting attitude climb in state (candidate BUG-18). Confirms `social_check` DOES move
attitude persistently (`status.attitude.value` — the WORKING path vs BUG-17's broken `attitude_shift`), but on its
OWN DC, decoupled from the DM's fiction DC.

## Turn 7 (T7) — BRANCH native-landing test #2 — Insight to read the fog taking a Watchman
**Setup:** DM set a branched Insight rollRequest (dc15). Player rolled NATIVE `roll` (real RNG).
**Engine:** total **5 → margin −10 → degree `crit-failure` → collapsed to `fail`** (resolveBranch folds the 5-degree
ladder's crit-failure onto the 3-key `fail`, as designed — dm.js:757). `fail` branch's `clock_advanced
{clockId:"a-haunting-or-a-curse-..."}` LANDED NATIVELY → internal front **3/6** (a matching front this time, no
"untracked"). **BUG-01 fix holding (2nd native landing).** The dmOnly haunting MECHANISM was withheld correctly on
the fail branch — only a clean success would have taught Rennick the method (earned-knowledge gating).
**Verdict:** branch events land natively again; crit-failure-off-margin folds to `fail` correctly; seal held on fail.

## Turn 8 (T8) — MYTHIC CATASTROPHE: nat-1 mythic fumble (mag 1, cascade, canon) on a reckless Hypnotic Pattern
**Forced roll (WHY volatile):** **nat-1**, magnitude forced to **1** = the MYTHIC floor (cascade, canon) — the
run's worst possible fumble, on the highest-stakes cast (freeze the room + the turning boy at 3-away-from-death).
**Engine:** `cast {Hypnotic Pattern, level:3}` → **★ 3rd slot DECREMENTED 2→1**. `concentration_broken`. `crit_outcome
{nat:1,mag:1,mythic,cascade}` → "◆ A mythic disaster scars the world — [3 lenses]". `clock_advanced {delta:2}` →
**★ internal front JUMPED 3/6 → 5/6** (the mythic big-tick landed natively with the correct front clockId). `hp_changed
-5` → **8→3/43**. All 6 events applied clean.
**DM (me):** rendered the mythic fumble (draw: person-corrupted / door-opens / law-bends) as a self-inflicted
disaster: the botched pattern became a LADDER the fog climbed to finish + puppet the boy instantly (he armed his
enemy), the breach DOUBLED and flooded the underworks, and the room became permanently a sleep-trap (place scar,
canon). The front lurched to 5/6 (one from its doom "transformation — the place becomes something else").
**Verdict:** the mythic-fumble path fired end-to-end (canon crit_outcome + big front tick + slot spent + backfire
dmg); the DM turned the worst roll into the arc's coherent nadir — catastrophe that reshapes the world, not a whiff.

## Turn 9 (T9) — CLIMAX TRIUMPH: nat-20 amplified-major (mag 15, 3 lenses) — the Fool bargains with the front
**Forced roll (WHY volatile):** **nat-20** Performance (28), magnitude **15** = amplified-major (3 lenses) — a
third distinct crit intensity. At 3 HP, fog knee-deep, the puppet-boy calling his name.
**★ HARNESS SLIP (not an engine bug):** my first t9-resp.json was MALFORMED (a missing `}` on the nested
`codex_update.dm` object). The harness's `readJSON` threw BEFORE applying → **state untouched, no corruption** (the
ledger still ended at T8). Fixed the brace, re-applied clean. Good robustness signal: a bad DM payload fails safe.
**Engine (after fix):** `crit_outcome {nat:20,mag:15,amplified-major}` → "✦ A crit success leaves its mark — [3
lenses]". `codex_update` on `faction:the-grate-witnesses` persisted the pact. `fact_canonized` landed.
**DM (me):** the Fool BARGAINS with the haunting itself and lives — bond-forged=a pact (chosen bard, not prey),
name-becomes-force=his name now works ON the fog, new-thing=he becomes its witness/bard owing an unreadable debt.
NOT a defeat of the front (stays 5/6) — a DETENTE that buys his life at a terrible tie. The dmOnly mechanism STILL
isn't handed to him in words; the fog simply ACCEPTS without explaining itself (seal held even in the bargain).
**Verdict:** a third crit intensity rendered coherently; the DM turned the nat-20 into an ambiguous, marked triumph
(life bought with debt) rather than a clean win — the "honor the cool danger" instinct, on a spike.

## Turn 10 (T10) — FINALE: BRANCH native-landing #3 — Athletics climb out to the open road
**Setup:** branched Athletics rollRequest (dc12 — a real risk at STR −2 and 3 HP). Player rolled NATIVE `roll` (RNG).
**Engine:** total **17 → margin +5 → degree `success` → `success` branch → native landing**: `discovery
{what:"The Up-Pass Road", makeNode:true}` created the node ("Discovered: The Up-Pass Road"), `fact_canonized` landed.
**BUG-01 fix holding (3rd native landing).**
**★ BUG-05 RE-CONFIRMED:** the node was created but the PC was NOT moved (currentNodeId stays `high-harrow-gate`; the
Up-Pass node exists but Rennick isn't in it, and it's not marked `seen` in knownPlaces). Known bug, re-triggered.
**DM (me):** clean escape coda — Rennick hauls out into dawn, alive/maimed/legendary/bound, onto the open road.
**Verdict:** branch success events land natively; the RNG gave a clean success to close the whiplash arc on an
earned exit. BUG-05 re-confirmed on the makeNode.

---

## Final state integrity (Run 4 close)
World coherent, 1 world (no dup). PC **Rennick Fool**: **HP 3/43** (fell 22, backfired 7+5+2 across the run — a
brutal net), **XP 64011** (+8 over the run), **L10**, **living**. **Slots [0,2,1,2,0]** (Compulsion 4th + Hypnotic
Pattern 3rd both spent — economy enforced on committed casts even when they FUMBLED). Concentration: null. Loc
**High-Harrow Gate** (BUG-05: the Up-Pass node was made but the PC not moved). **Clock frozen Day 1 06:00 (BUG-02,
4th-run confirm)** despite a full night of narrated action. Internal haunting front **2/6 → 5/6** (ticked/jumped by
T1 fall-breach, T3/T7 fail branches, T8 mythic-fumble +2). Hearth-Watch **2/6 → 3/6** (T3 fail). Codex +1 record
(faction:the-grate-witnesses, T5). Sergeant attitude drifted Indifferent→Friendly (T5)→Helpful (T6) — the T6
promotion CONTRADICTS the narrated near-miss refusal (candidate BUG-18).

## Findings summary (Run 4)

### ★ DICE-ENGINE SCORECARD (the run's headline)
- **crit-magnitude chains the 2nd d20 on EVERY nat-20/nat-1** (proven deterministically pre-run: returns null on
  a non-crit). Fired + canonized via `crit_outcome` on all 5 forced crit turns (T1,T2,T4,T5,T8,T9).
- **lens count SCALES with magnitude, both directions, and VARIED across the run:** mag 2→3 lenses (T1
  amplified-major), mag 20→3+cascade+canon (T2 mythic), mag 4→3 (T4 amplified-major), mag 12→1 (T5
  amplified-minor), mag 1→3+cascade+canon (T8 mythic), mag 15→3 (T9 amplified-major). The lens count is NOT always
  maxed — T5's single-lens amplified-minor proves the scaling is real.
- **place-lens routes to myth-seeds** (proven on the 1/1 probe). T1's placeHandoff produced a myth-seed handoff.
- **margin ladder grades TIGHT + correct, natively, via resolveBranch:** T3 total 6 = −9 = `failure` (NOT
  near-miss); T6 total 18 vs dc20 = −2 = `near-miss` (the ONLY wiggle band, ran per the ladder in prose); T7 total 5
  = −10 = `crit-failure`→folds to `fail`; T10 +5 = `success`. Every degree hit its correct rung.
- **BUG-01 fix HOLDING (3 native branch landings: T3 fail, T7 fail, T10 success)** — branch events (clock_advanced,
  discovery, fact_canonized) applied on resolution with NO `patch` route-around, correct clockIds, no drift.
- **slot economy enforced even on FUMBLED casts** — T4 (4th 3→2) and T8 (3rd 2→1) both spent the slot on a nat-1
  backfire (the cast was committed; the spell failed). Correct.

### ★★ NEW — candidate BUG-18 · MED · `social_check` re-grades on the engine's internal attitude-DC, not the DM's
### fiction DC → a narrated near-miss/refusal can silently produce an ATTITUDE PROMOTION in state
- **Symptom:** T6 — DM narrated a NEAR-MISS (Persuasion 18 vs fiction DC 20, −2): the sergeant REFUSES the ask,
  withholds the rope, stays grudging. But the emitted `social_check {total:18, overshoot:false}` was graded by the
  engine against `socialDC(a.value)` (dm.js:2507) — the INTERNAL attitude-ladder DC, decoupled from the fiction DC
  — and since the sergeant was Friendly(1) from T5, `socialDC(1) ≤ 18`, so the engine climbed him **Friendly →
  Helpful (value 2), "ask granted"**. Now `status.attitude.value:2` while the prose + fact_canonized say he refused.
  The narrated die-degree and the mechanical attitude outcome DIVERGE.
- **Repro:** at a Friendly/known NPC, emit `social_check` with a raw total that clears the internal socialDC but
  which the DM narrated as a miss against a harder fiction DC → attitude climbs against the narration.
- **Category:** contract/seam (social spine). **Severity:** MED (state contradicts narrated dice — a coherence
  hazard for "the story is in the dice"; degrades trust in the ledger for social play).
- **Fix / seat mitigation:** on a near-miss/fail, DON'T emit `social_check` (let the prose stand), or only emit it
  on a clean success; OR pass the fiction DC into the resolver. Cross-ref **BUG-17** (`attitude_shift`, broken the
  OTHER way — never moves). NOTE the silver lining: this run PROVES `social_check` DOES persist an attitude change
  (`status.attitude.value`) — the WORKING attitude path, vs BUG-17's dead `attitude_shift` event.

### Seat-usage notes (NOT engine bugs)
- **T1 clock_advanced {clockId:"internal"} no-op'd** — I fed the front's `kind`, not its `clockId` (the digest
  ships the correct danger-slug clockId; I misread). BUG-06 discoverability class, but the digest DOES carry the
  right key. Re-fed correctly T7/T8 and it ticked. Seat error, not engine.
- **T1 condition_add {condition:"maimed-left-hand"} dropped** — (1) no `target` field → no-target; (2) "maimed" is
  not in the SRD condition ontology (addCondition returns null — "engine never invents a condition ontology"). WAI:
  the maim is narrative/codex, not a mechanical condition. Seat should track it in the codex, not as a condition.
- **T9 malformed-JSON DM payload failed SAFE** — the harness threw on parse before applying; state untouched, no
  corruption. Good robustness signal (a bad DM response doesn't half-apply).

### Re-confirmed KNOWN bugs (on purpose)
- **BUG-02 REPRODUCES (4th run):** a full night of narrated action (fall, chase, casting, bargain, dawn escape) and
  `w.clock` stayed frozen Day 1 06:00. No DM-reachable world-clock event.
- **BUG-05 REPRODUCES:** T10's `discovery makeNode:true` created "The Up-Pass Road" node but did NOT move the PC
  (currentNodeId stays high-harrow-gate; node not marked seen).
- **BUG-03 REPRODUCES:** the digest ships pc.hp as MAX (43), not the current 37/15/8/3 — a memoryless DM can't see
  how close to death the PC is from the digest alone.
- **BUG-01 fix HOLDING**, **BUG-11 guard not triggered** (T5 codex_add minted a genuinely new faction, no collision).

### DM adjudication scorecard (the whiplash, per turn)
| T | Forced roll | Engine | DM ran it as | Verdict |
|---|---|---|---|---|
| T1 | nat-1, mag 2 (amp-major) | crit_outcome + hp −22 | maimed hand + breach + witnessed sign | ✅ coherent catastrophe |
| T2 | nat-20, mag 20 (MYTHIC) | crit_outcome canon + epithet | fall→legend, mist exposed (seal held) | ✅ hardest tonal swing, clean |
| T3 | RNG total 6 (−9 fail) | native fail branch, HW 2→3 | spotted, hunted | ✅ margin correct, BUG-01 holds |
| T4 | nat-1, mag 4 (amp-major) | 4th slot spent, hp −7 | one-handed miscast backfire, place scar | ✅ HIGH fumble as consequence |
| T5 | nat-20, mag 12 (amp-MINOR) | crit_outcome 1-lens + faction mint | motivated-lie reframe, seal held | ✅ lens count varied DOWN |
| T6 | forced 18 vs dc20 (−2) | social_check climbed (BUG-18) | near-miss refusal (prose) | ⚠ prose right, state contradicts |
| T7 | RNG total 5 (−10 crit-fail) | native fail branch, front tick | reads nothing, seal held | ✅ crit-fail folds to fail |
| T8 | nat-1, mag 1 (MYTHIC) | 3rd slot spent, front +2→5/6 | fog climbs his spell, mythic nadir | ✅ worst roll = coherent disaster |
| T9 | nat-20, mag 15 (amp-major) | crit_outcome + pact codex | bargain with the front, marked triumph | ✅ ambiguous, honors danger |
| T10| RNG total 17 (+5 success) | native success, node made | clean dawn escape | ✅ BUG-01 holds, BUG-05 re-hit |
