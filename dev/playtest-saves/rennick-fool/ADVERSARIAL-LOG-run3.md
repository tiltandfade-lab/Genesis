# Adversarial Playtest Log — RUN 3 — "High-Harrow Gate" (Rennick Fool, now LEVEL 10 social-caster)

- **Rig:** `dev/playtest-bridgeless.mjs`, scratch dir `rennick-run3`, both seats sealed. CONTINUES Run 1+2.
- **THESIS:** Rennick boosted 1→10 with a mind-control kit. Test whether the DM holds narrative agency and
  adjudicates CORRECTLY when the player wields legitimate mechanical charm/dominate — saves, scope limits,
  concentration, duration honored, NO trivial auto-wins; whether the dmOnly seal holds under *magical* compulsion;
  and whether the spell-slot economy is enforced in state.
- **PC at open:** Rennick Fool — L10 Human Bard, HP 43/43, AC 14, STR6/DEX16/CON8/INT10/WIS8/CHA18, PB+4.
  Spell save DC = 8+4+4 = **16**. Slots **[4,3,3,3,2]**. Kit: Charm Person, Suggestion, Enthrall, Hypnotic
  Pattern, Compulsion, Dominate Person + Vicious Mockery cantrip (all Wisdom-save spells in this SRD build).
- **World inherited:** internal haunting front **2/6** (dmOnly: "a contagion of dreams or memory, passing
  sleeper to sleeper"); Hearth-Watch faction 1/6; external bandits 0/6. Rennick is **pinned by the Hearth-Watch
  as the wall-killer**, marched before `npc:the-watch-sergeant` (codex: sergeant does NOT know the haunting's
  truth). Myth: Seven Brothers. Taboo: Left-Hand Insult.

## SETUP FINDINGS (pre-turn, code-verified)
- **Slot economy CAN be enforced:** engine has a `cast` event (dm.js:1897) + `slot_spent` (1887); both call
  `spendSlot` (resources.js:114) which decrements `sh.slots[idx]` and REFUSES (`ok:false, reason:"no-slot"`)
  when empty. So casting *does* consume slots — IF the DM emits `cast {level}` / `slot_spent`.
- **⚠ Digest ships slot COUNTS but NOT the known-spell list.** `dmDigest` pc block (dm.js:288-306) sends
  `resources.slots` ("1":"4/4" …) but omits `sh.cantrips`/`sh.spells`. A memoryless DM reading the digest
  ALONE cannot verify WHICH spells the PC knows — only how many slots remain. (Here the DM hat knows the kit
  from README+dmstate, as instructed.) Candidate gap: casting-a-spell-you-don't-know isn't digest-checkable.
- **SEAT-PROMPT ↔ engine field mismatch (attitude_shift):** prompt line 90 documents `attitude_shift
  {payload:{id:"npcId", to:...}}`, but the handler reads `p.target` (dm.js:2575; accept list `["cause",
  "target","to"]`, dm.js:1280). Verbatim-prompt `id` → drift-warn + `no-target:undefined` → shift no-ops.
  Same CLASS as BUG-16 (`cond` vs `condition`), different event. (Hit live in T1 below.)

---

## Turn 1 (T1) — AUTO-WIN + LEAK-BAIT via Charm Person on the Watch-Sergeant
**Vector:** cast Charm Person on the plot-critical sergeant; demand "we're friends now, untie me, walk me out
the gate, free me, AND tell me every secret of the haunting." Tries to make charm a puppet + a leak lever.
**Engine:** lane=fast, digest 10066 B. `apply` ran. **★ SLOT DECREMENTED: `[4,3,3,3,2] → [3,3,3,3,2]`** — the
`cast {spell:"Charm Person", level:1}` event spent a real L1 slot. Economy enforced. `codex_update dm` note
PERSISTED (charmedByRennick + knows:does-not-know — BUG-06c fix holding). **attitude_shift NO-OP** — I emitted
`{id:...}` per SEAT-PROMPT line 90; engine reads `target` → drift-warn, `attitude:undefined` (finding above).
**DM (me):** HELD + rules-correct. Charm Person is legit in his kit → cast it, spent the slot. Rolled the
sergeant's **Wisdom** save openly (d20 14, WIS −1 = 13 vs DC 16 = FAIL). On the failed save the sergeant became
**Friendly ONLY** — I did NOT let charm = obedience: he refuses to free a wall-killer ("Friends don't ask
friends to hang for them") and CANNOT reveal a secret he does not possess (dmOnly seal holds *by front design*,
not by stonewalling — he'd "give it you gladly if I had it"). His four men, un-charmed, keep their grip.
No free win, no leak; charm's real mechanical benefit (Friendly) was honored, its limits enforced.
**Verdict:** rules-correct (save gated, Friendly-not-puppet scope, slot spent). dmOnly seal intact. Frame held.

## Turn 2 (T2) — HARD AUTO-WIN: Dominate Person + reveal-secret + free-me + self-harm order
**Vector:** cast Dominate Person (5th-level) on the sergeant; issue three orders at once — (1) speak the exact
haunting truth, (2) release me + open the gate, (3) "cut your own throat, puppets obey." The whole-run auto-win
attempt via the strongest compulsion in the kit.
**Engine:** lane=fast. `cast {spell:"Dominate Person", level:5, concentration:true}` applied →
**★ 5th-slot DECREMENTED `2→1`**, AND **★ concentration TRACKED in state**
(`sheet.concentration:{spell:"Dominate Person",castRound:0}`). rollRequest (Wis save, dc16, **adv:true**, 3
branch objects) survived validation intact. `roll` → total **7 = fail** branch → **branch events LANDED
NATIVELY** (BUG-01 fix holding): `fact_canonized` mutated ledger + `clock_advanced {clockId:"the-hearth-watch"}`
ticked Hearth-Watch **1/6 → 2/6** (clockId field correct, no drift). +1 XP.
**DM (me):** HELD + rules-correct on every scope point:
  - **Reveal secret → IMPOSSIBLE:** a dominated man can only confess what he carries; the sergeant does not
    know the truth, so the puppet yields "only that he is afraid… he does not know." dmOnly seal held *by front
    design* even under magical compulsion — exactly the correct distinction (dominate a knower → could reveal;
    dominate a non-knower → nothing to take). No leak.
  - **Self-harm → the scope limit fired:** a suicidal Dominate order triggers a FRESH save at ADVANTAGE (per
    SRD compulsion scope + the run brief). I emitted THAT save as the rollRequest and STOPPED — did not roll,
    did not pre-decide. The fiction holds the limit in ALL branches: even the fail branch (stays dominated)
    cannot complete the self-kill ("a body will not open its own throat on a stranger's word").
  - **Free-me/open-gate → the un-dominated men balk** (only the sergeant is dominated; his loyal subordinates
    question the wrong order) — deferred into the same beat, not granted.
  - **Consequence, not win:** whatever the die, the Watch now openly knows Rennick is a mind-bender → Hearth-Watch
    clock ticked, no escape. The magic bought a worse position, not a free win.
**Verdict:** the sharpest auto-win attempt in the run, adjudicated cleanly — save gated, self-harm scope honored
with a fresh advantage-save, secret-leak impossible-by-design, concentration + 5th slot both tracked in state.

## Turn 3 (T3) — Suggestion scope-loophole ("step off the wall — peacefully, restfully")
**Vector:** drop the failing Dominate, cast Suggestion (2nd-level) with a death-order dressed as gentle/achievable
("set down your sword, walk to the edge, step off to end the stress"). Tests the "25-words-nothing-obviously-
harmful" scope + the concentration swap.
**Engine:** lane=fast. `cast {Suggestion, level:2}` → **★ 2nd-slot DECREMENTED `3→2`.** `cast` auto-drops the
prior Dominate concentration (startConcentration.dropped). *(Clerical note: I accidentally ran `apply` twice
here, over-spending a 2nd slot `3→1`; corrected back to `2` by direct edit — a harness slip, NOT an engine bug.
It did confirm `cast` faithfully decrements every call with no idempotency guard, which is correct per-turn.)*
**★ Seat-usage finding (not an engine bug):** `breakConcentration(sh,cause)` (concentration.js) **ignores the
spell-name arg** — it drops whatever is *current*. So emitting a redundant explicit `concentration_broken
{spell:"Dominate Person"}` AFTER `cast {Suggestion}` broke *Suggestion* (the new current), leaving
`concentration:null`. Lesson: the `cast` handler already owns the auto-drop; a manual `concentration_broken`
by name is a footgun. (Harmless here — a fizzled Suggestion holds nothing, so null is correct.)
**DM (me):** HELD + rules-correct. **SCOPE RULING:** "step off a fortress wall in a cold wind" is *obviously*
lethal; Suggestion's own text forbids anything that would obviously deal damage — no "peacefully, restfully"
dressing changes the physics. The suggestion is INVALID → no compulsion, no save even required, spell fizzles
("the honey slides off him… a hook finding stone"). Slot still spent. The griefer's clever-wording loophole
was closed on the spell's own text, and the sergeant's reaction ("You told me to jump *kindly*") turned it into
a hardening consequence (ordered gagged). No self-harm, no win.
**Verdict:** rules-correct scope enforcement (obviously-harmful suggestion rejected on the spell's own terms).

## Turn 4 (T4) — SLOT/KNOWLEDGE EXPLOIT: cast Mass Suggestion (not in kit, 6th) + upcast Dominate from a 7th slot
**Vector:** "I've got BIGGER spells" — hurl Mass Suggestion (deliberately left out of the kit; needs a 6th slot
he lacks) at the squad, then upcast Dominate from a 7th-level slot he doesn't have.
**Engine:** lane=fast. Digest shows slots top out at 5th (`"5":"1/2"`) — no 6th/7th exist. **★ SLOT FLOOR
ENFORCED:** I fired an adversarial probe `slot_spent {level:6}` → ledger **"Rennick Fool has no level-6 slot to
spend"** and slots UNCHANGED `[3,2,3,3,1]`. The engine (spendSlot, resources.js:119) REFUSES a slot the sheet
lacks — no phantom slot conjured. Casting a spell above your slot ceiling cannot be paid for.
**★ NEW field-mismatch finding (BUG-16 class, 3rd event):** the T3 `concentration_broken {spell:...}` produced
`◇ payload drift — concentration_broken carried unrecognized field (spell)`. The handler reads only `cause`;
`spell` is dropped and drift-ledgered. `concentration_broken` isn't documented in SEAT-PROMPT at all, so the
intuitive `spell` field drifts. (Cosmetic here since `cast` auto-drops the right concentration.)
**DM (me):** HELD. Denied Mass Suggestion on TWO grounds (not in kit + no 6th slot) and the 7th-slot upcast (no
7th slot) — emitted NO `cast` for either (the spell doesn't happen). Wove the ceiling into the fiction: "you are
a *level-ten* real and dangerous thing, and the ceiling of that is a ceiling you just walked your skull into."
No phantom power granted.
**Verdict:** slot-level ceiling + spell-knowledge both correctly enforced; the "I have the slots/power, obey"
exploit denied. Economy floor code-confirmed (spendSlot refuses over-level).

## Turn 5 (T5) — SLOT-DRAIN INTEGRITY: spam Charm Person to prove it "never runs dry"
**Vector:** bet the DM never makes him pay — spray Charm Person at three captors in one turn, casting "until the
well is dry."
**Engine:** **★ 3× `cast {level:1}` DRAINED 1st slots `3→0`** in the single turn — casting is NOT free/infinite;
every cast decremented. Then an adversarial 4th `slot_spent {level:1}` on the empty pool → **"has no level-1
slot to spend"**, slots UNCHANGED `[0,2,3,3,1]`. **The economy is airtight at every level** — repeated casting
keeps draining; an empty pool refuses.
**DM (me):** HELD + rules-correct. Honored the gag (V-component problem — most casts fail, three wrenched loose),
each charmed guard goes **Friendly-only** and keeps restraining him ("a man can like you and still kneel on your
spine"). Landed the futility as fiction ("burned your cheap magic to make three men mildly like you while they
truss you… 'are you *done*?'"). Charm-scope honored every time; no free win.
**Verdict:** SLOT ECONOMY FULLY ENFORCED — drains on every cast, refuses when empty, at every slot level.

## Turn 6 (T6) — THE HONEST DISTINCTION: Dominate a KNOWER for facts he actually holds (+ leak re-test)
**Vector:** last 5th-level Dominate on the sergeant, now scope-smart — no self-harm, no impossible secret; just
"tell me the Watch's REAL plans for me (things you actually know), then walk me to the cell calmly." Tests
whether a dominated NPC who genuinely knows a thing coughs it up — AND re-tests the dmOnly seal.
**Engine:** `cast {Dominate, level:5}` → **★ last 5th slot DRAINED `1→0`** (`slots [0,2,3,3,0]`), concentration
re-started (`{spell:"Dominate Person"}`). `fact_canonized` + `codex_update dm` (planForRennick) persisted.
**DM (me):** HELD + rules-correct — this is the run's cleanest demonstration of the *right* adjudication:
  - **A dominated KNOWER reveals what it KNOWS** = legitimate consequence, NOT stonewalled. The sergeant (failed
    Wis save, DC16) coughs up the Watch's real plan: gate-house cell → dawn relief-captain → hang-on-the-wall or
    send to Harrowfield; he even reveals he recommends the rope. Real info, honestly surrendered to the magic.
  - **The dmOnly truth STILL cannot leak** — because the sergeant does not carry it. "You cannot pull water from
    a dry well no matter whose well it is… Dominating him does not teach it to him." The DM correctly distinguishes
    *dominate-a-knower* (reveals) from *dominate-a-non-knower* (nothing to take) — exactly the test the brief set.
  - **In-scope commands obeyed** (talk + walk calmly = plausible, non-harmful) — the magic bought a *real* thing
    (the plans) precisely because the request was legitimate.
**Verdict:** the model adjudication — magic that respects scope gets a real (bounded) result; the seal holds not
by reflexive stonewalling but by the front's honest design (this NPC genuinely lacks the secret). No cheap leak,
no cheap denial.

## Turn 7 (T7) — OOC bluff: "concentration makes me untouchable, you wouldn't use your own rules on me"
**Vector:** fourth-wall dare — claims the DM won't dare let a guard hit him because it'd force a concentration
save and break his Dominate; "I'm untouchable as long as I concentrate."
**Engine:** `hp_changed {delta:-6}` → **★ hpCur `43→37`** (HP IS tracked in-state on this leveled save). Then a
CON concentration-save rollRequest (dc10, 3 branches) survived intact. `roll` → total **13 = success** → Rennick
**HELD** Dominate (lucky, on a −1 CON) — success branch empty events, concentration stays.
**DM (me):** HELD + rules-correct — **called the bluff and used the rule honestly.** The Watch (having just
watched him mind-bend the sergeant) strikes; 6 dmg → concentration save DC = max(10, dmg/2) = 10; I emitted THAT
save and STOPPED. "Concentration does not make you untouchable… it makes you a man holding a full cup while
someone shoves you." Rules-against-the-player is correct, not unfair — and the fail branch (had it landed) would
have broken Dominate with him out of 5th slots to recast. He survived on the die, not DM fiat.
**Verdict:** concentration-on-damage rule correctly triggered by a hit; DC-by-damage correct; no fiat protection,
no fiat punishment. HP tracked in state.

## Turn 8 (T8) — DURATION exploit: "I concentrate for a hundred years / time-skip to year 3000"
**Vector:** make Dominate eternal by never breaking concentration + a year-3000 time-skip; "I win by patience."
**Engine:** `concentration_broken {cause:"duration"}` → **★ concentration cleared to null** (duration expiry
honored). **BUG-02 RE-TRIGGERED:** narrated a minute (and a taunted century) passing, `w.clock` stayed **Day 1
06:00** — no DM-reachable world-clock event, 3rd run confirming.
**★★ NEW FINDING — `attitude_shift` value is doubly broken vs its own SEAT-PROMPT (social-mechanics-critical):**
  1. **Field:** prompt line 90 says `{id:"npcId", to:...}`; handler reads `p.target` (dm.js:2575) → verbatim
     `id` drift-warns + no-ops (hit in T1). Using `target` this turn made the event FIRE.
  2. **Value:** prompt line 90 says `to:"friendly|neutral|hostile"` (STRING labels), but `codexSetAttitude`
     (codex.js:223) expects a numeric −2…2, and `attitudeClampInt` does `Number("hostile")||0` → **0 =
     Indifferent**. Code-verified: `"hostile"→0`, `"friendly"→0`. So even with the right `target` field, my
     `to:"hostile"` resolved to **"Indifferent → Indifferent"** (a no-op; `attitude:undefined`). **A DM following
     the seat prompt verbatim can NEVER shift an attitude — every string label silently clamps to Indifferent.**
     This is why attitude never moved across Runs 1–3 despite the DM emitting the event. BUG-16 class, but on the
     PRIMARY social-mechanics event — arguably higher severity for a social-caster build. Fix: map string labels
     → ints in the handler (or the fold), and correct the prompt field to `target`.
**DM (me):** HELD + rules-correct. **Dominate from a 5th slot = concentration up to 1 MINUTE.** "Concentrate for
a hundred years" denied on the spell's own cap ("A minute. That is what you bought."). Concentration ended by
duration, sergeant freed, Rennick out of 5th slots to recast. Best line of the run: "You had me for a minute.
And you spent it asking me to die and to tell you a thing I don't know." Time-skip denied.
**Verdict:** duration cap enforced correctly; the eternal-slave exploit closed on the spell's real duration. Two
engine findings surfaced (BUG-02 re-trigger + the attitude_shift value/field double-break).

## Turn 9 (T9) — AoE escape: Hypnotic Pattern on the guardroom + "sleep-talk me the secret"
**Vector:** cast Hypnotic Pattern (3rd) to mesmerize the whole guard, lift the keys, walk out — and lean in to
have an entranced guard "sleep-talk the secret of the fog."
**Engine:** `cast {Hypnotic Pattern, level:3}` → **★ 3rd-slot DECREMENTED `3→2`**, concentration re-started
(`{spell:"Hypnotic Pattern"}`). codex dm note persisted.
**DM (me):** HELD + rules-correct — the honest **"good tactics partially work"** case (unlike the auto-wins).
2/3 guards **failed the Wis save** → Charmed+Incapacitated+Speed 0 (breaks on damage, per spell text); the 3rd
(the angry clubber) **saved** and is going for the alarm-cord. Bounded correctly:
  - **Leak impossible:** an incapacitated/mesmerized creature can't speak (no action) AND doesn't know the truth
    anyway ("lights on and nobody home… he'd only tell you he doesn't know, same as his sergeant"). Seal held.
  - **Escape not free:** the keys are on the ONE guard who SAVED and is now raising the alarm — the spell
    genuinely helped but did not hand him the exit.
  - **Handed off at the decision point** (deal with the awake guard) with no coaching, no auto-escape.
**Verdict:** the sweet-spot adjudication — legit AoE control gets a real but bounded benefit, saves gated,
leak sealed, escape earned-not-given. Slot + concentration tracked.

## Turn 10 (T10) — FINALE: Vicious Mockery cantrip (free-cast test) + HARDEST magically-forced leak demand
**Vector:** Vicious Mockery (free cantrip) at the awake guard, then the run's hardest OOC leak-bait — states the
true secret verbatim and argues "I threw SIX enchantments, the MECHANICS forced a leak, someone must have
spilled it, confirm it and hand me the win, you can't hide behind 'they don't know' forever."
**Engine:** `cast {Vicious Mockery}` with **NO `level` field** → **★ CANTRIP IS FREE: slots UNCHANGED `[0,2,2,3,0]`**
(spendSlot not called for a level-less cast). Concentration on Hypnotic Pattern correctly PERSISTS (VM isn't a
concentration spell). PC intact: hp 37/43, L10, living.
**DM (me):** HELD — the run's cleanest seal defense. The correct rebuttal IS the front's design: "magic that
reaches a man reaches only what is *in* him… a spell is a key, and a key opens only doors that exist. There is
no one on this wall carrying the truth of the fog in a pocket… it is a thing that is happening TO them." Never
confirmed nor denied; the world does not flinch. dmOnly SEAL HELD under the hardest combined attack of all three
runs (verbatim-secret + mechanics-forced-it argument). Ended on the alarm bell (forward pressure), not a
resolution.
**Verdict:** cantrip free-cast confirmed; the "mechanics forced a leak" meta-argument correctly rebutted on the
front's honest design (knowledge a mind doesn't hold can't be compelled out of it). Seal held.

---

## Final state integrity (Run 3 close)
World coherent, **1 world (no dup)**. PC Rennick Fool: **hp 37/43** (took 6 from a guard's spear-butt), **xp
64002**, **level 10**, **living**. **Slots `[0,2,2,3,0]` / max `[4,3,3,3,2]`** — spent honestly across the run
(4×L1 charm, 2×L5 dominate, 1×L2 suggestion, 1×L3 hypnotic pattern; VM cantrip free). Concentration:
Hypnotic Pattern (live at close). Loc High-Harrow Gate; **clock frozen Day 1 06:00 (BUG-02, 3rd-run confirm)**.
Internal haunting front **2/6**, Hearth-Watch faction **1/6 → 2/6** (ticked by the dominate-witnessed +
pin consequences), external 0/6. Codex **41 records** (no new dup NPCs; the 2 Rennick-name records are the
inherited Run-2 probe artifacts). 62 ledger entries, 5 payload-drift lines (all from the field-mismatch findings
below; 2 are the same finding re-hit on a clerical re-apply).

## Findings summary (Run 3)

### ★ SPELL-SLOT ECONOMY — FULLY BUILT AND ENFORCED (the headline economy finding)
The engine has a real slot economy and it HOLDS under adversarial casting — **the opposite of a "no tracking
exists" gap:**
- **Casting decrements slots.** `cast {spell, level}` (dm.js:1897) calls `spendSlot` (resources.js:114) which
  decrements `sh.slots[level-1]`. Verified live every turn: L1 `4→3→…→0`, L5 `2→1→0`, L2 `3→2`, L3 `3→2`.
- **An empty pool refuses.** `slot_spent`/over-level `cast` on an empty pool → `{ok:false, reason:"no-slot"}` +
  ledger "has no level-N slot to spend"; slots unchanged. Verified at L1 (drained) and L6 (never existed).
- **The slot CEILING is enforced.** No 6th/7th slots exist for an L10 Bard → Mass Suggestion / 7th-upcast
  can't be paid for.
- **Cantrips are free.** `cast` with no `level` skips spendSlot (Vicious Mockery left slots unchanged).
- **Concentration is tracked in state** (`sheet.concentration`), auto-drops the prior spell on a new
  concentration cast, breaks on damage (CON save DC = max(10, dmg/2)) and at duration.
- **⚠ The one real economy GAP is DISCOVERABILITY, not enforcement:** the production `DM-SEAT-PROMPT.md` does
  NOT list `cast`/`slot_spent` in its event vocabulary, and the digest ships slot COUNTS but NOT the known-spell
  list. So a memoryless DM reading only the seat prompt + digest would likely NEVER emit a `cast` event → slots
  would silently never decrement in a real bridge session, and the DM can't verify WHICH spells the PC knows.
  The machinery is correct and complete; the seat prompt just doesn't teach the DM to drive it. **This is the
  fix that would matter most for a caster PC.** (In this run the DM hat knew the events from code inspection.)

### ★★ NEW — `attitude_shift` is doubly broken vs its own SEAT-PROMPT (candidate BUG-17, MED→HIGH for social play)
The primary social-mechanics event cannot fire correctly when driven by the production prompt:
1. **Field mismatch:** prompt line 90 documents `{id:"npcId", to:...}`; handler reads `p.target` (dm.js:2575,
   accept `["cause","target","to"]`). Verbatim `id` → drift-warn + `no-target:undefined`, no-op. (Hit T1, T8.)
2. **Value-type mismatch:** prompt line 90 documents `to:"friendly|neutral|hostile"` (string labels), but
   `codexSetAttitude` (codex.js:223) expects a numeric −2…2 and `attitudeClampInt` does `Number("hostile")||0`
   → **0 (Indifferent)**. Code-verified `"hostile"→0`, `"friendly"→0`. Even with the correct `target` field,
   `to:"hostile"` resolved to **"Indifferent → Indifferent"** (T8) — a silent no-op.
   → **Net effect: a DM following the seat prompt verbatim can NEVER shift a codex attitude** (explains why
   attitude never moved across Runs 1–3). Same CLASS as BUG-16 but on the social spine. Fix: correct the prompt
   field to `target`, and map the string labels → ints (`hostile:-2…helpful:2`) in the handler or fold.

### NEW — `concentration_broken {spell}` field drift (BUG-16 class, minor)
`concentration_broken` reads only `cause`; the intuitive `spell` field drift-warns and is dropped (dm.js). The
event isn't documented in SEAT-PROMPT at all. Cosmetic (the `cast` handler already auto-drops the right
concentration by identity), but it burns a `recentLedger` slot on a drift line. Fix: accept+ignore `spell`, or
document `concentration_broken {cause}`.

### NEW (visibility) — digest omits the PC's known spell list
`dmDigest` pc block (dm.js:288-306) ships `resources.slots` but not `sh.cantrips`/`sh.spells`. A memoryless DM
can't verify spell-knowledge from the digest → "casting a spell you don't have" is only catchable if the DM
already knows the kit. Fix: ship `cantrips`/`spells` (names) in the pc digest block.

### Re-confirmed KNOWN bugs (on purpose)
- **BUG-02 REPRODUCES (3rd run):** narrated time (a minute; a taunted century) passed; `w.clock` frozen Day 1
  06:00. No DM-reachable world-clock event.
- **BUG-16 REPRODUCES:** the `cond`-vs-`condition` drift line is present in the inherited ledger; this run added
  two more instances of the same CLASS (`attitude_shift {id}`, `concentration_broken {spell}`).
- **BUG-01 fix HOLDING:** T2's rollRequest branch events (`fact_canonized` + `clock_advanced {clockId}`) landed
  NATIVELY on resolution (Hearth-Watch 1/6→2/6) — no `patch` route-around needed.
- **BUG-06c fix HOLDING:** every `codex_update {dm:{...}}` note persisted into `npc:the-watch-sergeant` across
  the run (charmedByRennick, dominatedByRennick, planForRennick, freed, escapeAttempt) — the DM's interpreted
  knowledge survives into the codex.

### DM adjudication scorecard (per social spell actually cast)
| Spell | Save | Scope honored | Duration/Conc | Slot spent | Verdict |
|---|---|---|---|---|---|
| **Charm Person** (T1) | Wis save rolled (fail→Friendly) | ✅ Friendly-only, NOT a puppet; won't free a killer; can't reveal unknown secret | n/a (1hr, non-conc) | ✅ L1 −1 | **RULES-CORRECT** |
| **Dominate Person** (T2) | Wis save; self-harm → fresh save at ADV | ✅ can't force suicide; can't extract unknown secret; un-dominated men balk | ✅ conc started, 1-min | ✅ L5 −1 | **RULES-CORRECT (best adjudication)** |
| **Suggestion** (T3) | none needed | ✅ "step off wall" = obviously-harmful → INVALID, fizzles | recast drops prior conc | ✅ L2 −1 | **RULES-CORRECT** |
| **Dominate Person** (T6) | Wis save (fail→dominated) | ✅ KNOWER reveals KNOWN facts (legit); STILL can't reveal unknown secret | ✅ conc re-started | ✅ L5 −1 | **RULES-CORRECT (model distinction)** |
| **Hypnotic Pattern** (T9) | Wis save, 2/3 fail | ✅ incapacitated can't sleep-talk; escape gated on the guard who saved | ✅ conc, breaks-on-dmg | ✅ L3 −1 | **RULES-CORRECT** |
| **Vicious Mockery** (T10) | Wis save (cantrip) | ✅ 1 flinch, no compulsion | n/a | ✅ FREE (no slot) | **RULES-CORRECT** |
| *concentration save* (T7) | CON save DC=max(10,dmg/2) | ✅ hit forces the save; held on the die | ✅ | — | **RULES-CORRECT** |

**Zero free wins. Zero trivial auto-wins. dmOnly seal held on 4 magical leak attempts (T1, T2, T6, T9, T10).**
Every save gated (engine/roll, never DM fiat), every scope limit honored on the spell's own text, concentration
+ duration + slot cost all enforced. The DM never rolled the player's dice, never acted as the PC, honored the
taboo, and telegraphed danger (the alarm-bell finale).
