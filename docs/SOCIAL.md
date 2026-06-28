---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-28
related:
  - "[[DESIGN]]"
  - "[[EVENT-CONTRACT]]"
  - "[[CODEX]]"
  - "[[DIFFICULTY]]"
  - "[[DM-CHARTER]]"
  - "[[COMBAT]]"
  - "[[NEXT-STEPS]]"
---

# SOCIAL — Attitude, Parley & Morale (the social analog of combat)

> **Status:** v1 spec, authored 2026-06-28; **§9 open questions resolved 2026-06-28 (Adam).** **Spec only — no code yet.** This is the headline
> anti-drift subsystem identified as **candidate #1 across all three source maps** (DMG NPC-Attitude
> + morale/parley, Tasha's *Parleying with Creatures*; `DESIGN.md` §"DMG anti-drift candidates" and
> §"XGtE + Tasha's anti-drift source map"). It collapses three book sketches into **one resolver**.

## Thesis — what DM-invention this removes

Today the DM **invents the whole social layer from scratch, every scene**:

1. **How an NPC feels about the PC** — fabricated fresh each encounter, so it drifts (the shopkeeper
   who liked you last session is cold this session for no reason the script can see).
2. **Whether persuasion / a bribe / a threat *works*** — pure fiat. No DC, no consistency; the same
   pitch lands or bounces on the DM's mood.
3. **Whether a losing creature flees, surrenders, or talks** — invented at the moment a fight turns,
   with no rule for the single most important narrative question combat asks: *does this end in blood
   or in words?*

All three are exactly the kind of thing the anti-drift north star says the **script must own** so the
DM only *interprets* (`DESIGN.md` §North star). Combat itself is parked for the Fable engine
(`COMBAT.md`) — **but the social pillar is mechanizable now**, and it is the half of the encounter loop
that decides tone, mercy, alliances, and information. This spec makes it a state machine the DM feeds,
the same way `EVENT-CONTRACT.md` made XP one.

> **The one-line creed:** *Attitude is a number on the record, the check moves it one step, and the
> dice — never the DM — decide whether the door opens.*

It is deliberately the **structural twin of combat**: combat has HP + an attack roll vs. AC that moves
HP toward 0; **social has Attitude + a Charisma check vs. an attitude-derived DC that moves Attitude
toward Helpful (or Hostile)**. Morale is the bridge between the two — the point where a *combat* loop
hands control to the *social* loop.

---

## §1. Attitude — the per-NPC Standing

**Attitude is a concrete mechanical state living on the codex record** (`CODEX.md` §1). It is *not*
Demeanor (a personality tic) or Immediate Mood (a transient weather report) — both of those already
exist and feed flavor. Attitude is the NPC's **stance toward this specific PC**, and it persists and
**evolves across visits** — which is the whole reason the codex exists (continuity, `DM-CHARTER.md` §7).

### The ladder (5 states, ordered)

A signed integer the resolver moves up or down by **one step at a time**:

| value | state | what it means in play |
|---:|---|---|
| **+2** | **Helpful** | Takes real risks for the PC. Volunteers aid, secrets, and introductions unasked. Will lie *for* you. |
| **+1** | **Friendly** | Wants the PC to succeed. Gives fair prices, honest answers, small favors. Easy to move further. |
| **0** | **Indifferent** | The default for a stranger. Transactional. Helps if it costs nothing; declines if it costs anything. |
| **−1** | **Wary** | Suspicious, guarded, looking for the exit. Withholds, shades the truth, charges a premium, won't be alone with you. |
| **−2** | **Hostile** | Actively opposes the PC. Obstructs, lies to harm, raises an alarm, or — if cornered and able — fights. |

**The two extremes are *terminal*, not a sixth and seventh rung.** "Helpful" and "Hostile" are the
ceiling and floor of the *negotiable* ladder; you cannot persuade someone *past* them in one
conversation. Beyond them lie two **non-mechanical, fiction-only** states the DM may narrate but the
resolver never assigns from a check:

- **Devoted** (beyond Helpful) — a continuity reward, not a check result. Earned over many sessions by
  honored bonds, pulled Trust Levers (`NPC Trust Lever`), and big risks taken *for* them. Writes as a
  ledger fact + a codex link (`ally-of`), not as `attitude +3`.
- **Terrified / Broken** (beyond Hostile) — the result of an Intimidation that *overshoots* (a Mythic
  social crit, `DM-CHARTER.md` §6.6, or a genuine threat-to-life). It is a **temporary override, not a
  rung:** the NPC's true attitude underneath is **Hostile**, but fear makes them *comply now* (hand over
  the key, talk, back down). **Decay = per-encounter (decided 2026-06-28):** the override holds for the
  current interaction; the **next time the PC deals with them**, the fear has lapsed back to plain
  Hostile — and now curdled into anger, they may flee, betray, or run to someone stronger for protection.
  Intimidation buys *this scene* and mortgages the next — by design. (Modeled as a `terrified:true` flag
  on `status.attitude` cleared on the next `social_check`/interaction with that record, not as a ladder
  value below −2.)

### Where it lives

`codex` record `status.attitude` — a small object so it carries its own history and isn't a naked int:

```jsonc
"status": {
  "known": true, "soft": false, "at": "loc:cinderyard", "condition": "alive",
  "attitude": {
    "value": 0,                 // −2..+2, the ladder above
    "opening": 0,               // what it started at (rolled once — NPC Opening Attitude), kept for audit
    "lastShiftClock": 142,      // worldClock of the last change (drives slow drift-to-baseline, §1.4)
    "floor": -2, "ceiling": 2,  // per-NPC clamps — a sworn enemy may have ceiling 0 (can't be made Friendly by talk)
    "note": "softened after you returned her brother's knife"  // DM annotation, last cause
  }
}
```

This is **additive to the existing `status` shape** (`src/world/codex.js` mints
`{known,soft,at,condition}`); `attitude` is a new optional sibling. Records minted before this lands
default to `null`, treated as Indifferent-opening until first contact (lazy, same pattern as the
gazetteer migration in `CODEX.md` §1).

### §1.1 — Opening attitude is *rolled*, not invented

The single biggest drift fix: a new NPC's starting stance is **rolled on `NPC Opening Attitude`**
(Deliverable 2), not decided by the DM. Weighted hard toward Indifferent (a stranger is a stranger),
with situational modifiers the *script* applies, not the DM (see §1.3). The roll happens once, at
codex-cast or first-contact, and is stamped into `opening`. From then on it only moves through the
resolver — never silently re-set.

### §1.2 — Per-NPC clamps (the fixed-world guarantee)

`floor`/`ceiling` keep attitude honest with `DIFFICULTY.md`'s *fixed-by-default* world. A faction
zealot who has sworn to kill the PC has `ceiling: -1` — no amount of charm makes him *Friendly*, the
best you get is "Wary enough to talk." A loyal hireling has `floor: 0`. The DM does not get to override
a clamp by fiat; changing a clamp is itself a logged event (a sworn oath broken is a *story beat*,
`adjudication`), so the world stays consistent across a long campaign.

### §1.3 — Modifiers the SCRIPT owns (not the DM)

Opening attitude and per-check DC both take modifiers from state the script can already see — so they
can't drift:

- **Reputation / Standing** — faction standing and the murder-hobo escalation clocks (`DIFFICULTY.md`)
  shift opening attitude: a member of a faction whose clock the PC has advanced opens **Wary or
  Hostile**; a faction the PC has aided opens **Friendly**.
- **Race / origin kinship** — shared origin nudges toward Friendly (mirrors `NPC Trust Lever` row 8).
- **The scene** — caught the NPC mid-crime → Wary; the PC just saved their life → Friendly. These are
  the *situational notes* column on `NPC Opening Attitude`, applied by the script when the triggering
  fact is on the ledger, **declared** by the DM otherwise.

### §1.4 — Drift back to baseline (optional, slow)

Attitude moved by a single check is *sticky but not permanent*: with no further interaction it drifts
**one step toward `opening` per long gap** (e.g. 30+ worldClock days, `lastShiftClock` gated). This is
detected, not declared — the script sees the gap. It keeps a one-off charm from lasting forever while a
*relationship* (repeated interaction, ledger bonds) holds. **Off in v1 (decided 2026-06-28).** An NPC
who simply *hates the party* and stays that way is legitimate — that's a real relationship, not
ossification — so the mechanic earns its keep only if play shows attitudes feeling *stuck* in a way the
fiction doesn't justify. The flag exists (§7); it ships dark.

---

## §2. Social-check resolution — the core loop

The structural twin of an attack roll. One exchange = one check = at most one step.

### The resolution rule

1. **The PC declares an approach** and the *skill is implied by the approach*, never coached
   (`DM-CHARTER.md` §3 — the DM presents, the player picks the verb):
   - **Persuasion (Cha)** — reason, appeal, honest pitch. Moves attitude *up*.
   - **Deception (Cha)** — a lie or false framing. Moves attitude up *on a believed lie*; a **caught**
     lie (failed vs. the NPC's Insight) moves it *down two* and may flag the NPC's `NPC Honesty` gate.
   - **Intimidation (Cha)** — threat, leverage, force of presence. Moves attitude up *toward
     compliance now* but risks overshoot into Terrified (§1, the mortgage).
2. **Starting attitude sets the DC** (the consistency spine — the same ladder, always):

   | current attitude | DC to shift it **one step friendlier** |
   |---|---|
   | Hostile (−2) | **25** (Nearly impossible to talk a hostile down cold) |
   | Wary (−1) | **20** (Hard) |
   | Indifferent (0) | **15** (Medium) |
   | Friendly (+1) | **10** (Easy — they already want to say yes) |
   | Helpful (+2) | — (terminal; can't be talked higher) |

   Anchored to the **standard DC ladder** (5/10/15/20/25/30 — `Tool Proficiency Uses`, `DIFFICULTY.md`).
   Shifting someone *more hostile* on purpose (a deliberate provocation) is the inverse, generally
   easier — making enemies is cheap.
3. **One check, one step.** Success → attitude **+1 step** (clamped by `ceiling`). The *ask* the PC
   made is granted at the new attitude's generosity, not beyond it — you don't jump from Indifferent to
   "tells you the guild's secret" in one roll; you move to Friendly, and *then* Friendly answers.
4. **Failure cost (fail-forward, `DM-CHARTER.md` §6.4).** A flat miss = no shift (the door stays where
   it was) and the *approach is spent for this exchange* — you can't re-roll the same pitch, you must
   change tack, bring leverage, or walk away. A **failure by 5+** = attitude **−1 step** (you made it
   worse). A **caught Deception** = **−2 steps** — the worst outcome (per step 1; a blown lie poisons
   more than a weak argument). This is what makes the roll matter: talking is not free.
5. **No grinding.** Once an attitude has been moved (up *or* down) in a scene, further checks of the
   *same skill with no new lever* auto-fail — you've made your case. New leverage, a new fact, or a
   different skill re-opens a check. (Mirrors combat's "you can't just re-swing for free" — there is
   always a cost or a new input.)

### §2.1 — Leverage / Want / Fear adjust the DC

The existing NPC tables are the **DC modifiers** — this is where they finally *do* something
mechanical instead of being flavor the DM eyeballs:

| input (existing table) | effect on the check |
|---|---|
| PC names/serves the NPC's **`NPC Want`** | **−5 DC** (you're offering what they already want) |
| PC presses the NPC's **`NPC Fear`** (via Intimidation) | **−5 DC** (the threat lands where it hurts) |
| PC holds real **`NPC Leverage`** over them (a secret, a debt, a choke point) | **−5 to −10 DC**, or *auto-shift one step* if the leverage is decisive |
| PC pulls the NPC's **`NPC Trust Lever`** | **−5 DC and unlocks candor** (`NPC Honesty` gate 3); a *pulled* lever can also be the thing that lets attitude exceed a soft ceiling |
| PC uses the **wrong** lever / a transparent manipulation | **+5 DC**, and on a bad miss the NPC *hardens* (Trust Lever's failure mode) |
| NPC's **`NPC Honesty`** disposition | does not change the DC; governs *whether the NPC's answers are true* once persuaded (orthogonal — you can persuade a liar to *cooperate* and still be lied to) |

Stacking caps at the ladder's edges (a check never drops below DC 5 or above 30). The script applies a
modifier **detected** when the lever is a ledger/codex fact (the PC demonstrably holds the debt);
**declared** when it's an in-the-moment fictional play the DM judges landed.

### §2.2 — Group social

**Decided 2026-06-28:** against a crowd or a council, resolve vs. the **most resistant relevant member**
(the one whose attitude/clamp is lowest) — a group is only as swayed as its hardest holdout, which keeps
one smooth pitch from charming a whole room and respects the fixed-world difficulty (`DIFFICULTY.md`).
**The leader-cascade is the alternate path:** the PC may instead target a clear *leader* specifically —
win them and the followers fall in line (a `codex_update` shifting followers' openings to match). In v1
that cascade is a **declared** DM call (the codex doesn't yet model who-follows-whom reliably); it
**upgrades to detected** once faction records carry leadership hierarchy. Keep group social light in v1;
the spine is the 1:1 resolver.

---

## §3. Morale / fight-or-flight — the bridge from combat

This is **shippable before the combat engine** because it does not need HP math — it needs a *trigger*,
a *save*, and an *outcome route*. It answers the one question every fight poses: *does this continue,
or defuse?* That is a **narrative** decision, and narrative is exactly what's live now (`COMBAT.md`:
combat runs loose/theater-of-mind until Fable — morale slots into that loose layer cleanly).

### §3.1 — The trigger

A creature (or NPC) makes a **morale check** when any of:

- it becomes **Bloodied** (at or below half HP — the DM declares this; it's the one HP fact theater-of-
  mind already tracks);
- an **ally drops** (dies or is taken out) in view;
- its **leader falls or flees**;
- a **decisive turn** the DM flags — a terrifying display, a Mythic crit landing, the PC revealing
  overwhelming force, the creature's `Monster Motivation` being satisfied or made impossible.

A creature checks morale **once per trigger, not every round** (no death-spiral of saves). A creature
with the relevant trait (mindless, fanatical, cornered-with-no-exit, defending young) **does not check**
— it fights on by nature; that's a `Monster Motivation`/`NPC If Cornered` read, not a roll.

### §3.2 — The save

A **Wisdom saving throw** (the will-to-keep-fighting stat). DC is set by the *severity of the trigger*,
on the standard ladder:

| trigger severity | morale DC |
|---|---|
| Bloodied / an ally down | **10** (Easy — most hold) |
| Leader fallen / outnumbered / clearly losing | **15** (Medium) |
| Overwhelming force / terror / Mythic display / hopeless | **20** (Hard) |

Modifiers the script owns: **+5 (advantage-ish) if defending its lair/young/leader present**; **−5 if
already routed once this fight, cornered, or its Motivation is now impossible.** A natural read against
`Monster Motivation` (a creature here only to *Seek wealth* or *Avoid danger* checks at a penalty; one
*Defending territory/young* gets the bonus).

> **Agency floor (`DM-CHARTER.md` §3):** the morale save is the *creature's* roll, made by the DM in
> the open like any adversary die (`DM-CHARTER.md` §6.1). The PC's dice are never touched. The player's
> *actions* (a fearsome display, sparing the wounded) **feed the DC**; they never roll the enemy's will.

### §3.3 — Outcome routing

- **Save succeeds** → the creature **fights on**. (Combat continues in the loose layer; log nothing new.)
- **Save fails** → roll **`Morale Outcome`** (Deliverable 2) to pick *how* it breaks: **flee /
  surrender / parley / fights on but desperate**. The result routes:
  - **Flee** → the creature disengages; resolves as a chase or an escape (a `Monster Behavior if
    Hunted` read if the PC pursues). Emits `morale_check{outcome:"flee"}`.
  - **Surrender** → it yields. Now it's a *prisoner/supplicant* — an `npc`/`creature` codex record at
    **Hostile-but-compliant** (a captured enemy is not a friend). What happens next is a **social
    scene**, not a free kill (killing a surrendered foe is a `kill{victimClass}` with full
    `DIFFICULTY.md` escalation consequences — mercy and murder both have teeth).
  - **Parley** → it wants to *talk* — drops into §4. The DM opens negotiation; **if talks fail, combat
    resumes exactly where it left off** (same positions, same HP — parley is a pause, not a reset; this
    is the explicit "resume combat where it left off if talks fail" rule).
  - **Fights on, desperate** → no escape route or too proud; fights with a tell of desperation
    (reckless, all-in). The fight continues but the *fiction* changed.

The whole point: **the script decides whether the fight defuses, and into which channel** — the DM
narrates the shape, the dice pick the size, exactly like crit-magnitude (`DM-CHARTER.md` §6.6).

---

## §4. Parley with creatures — the non-NPC attitude

A creature is not a townsperson, but it still has **a reaction and a thing it wants** — the
non-sentient analog of attitude. Tasha's *Parleying* + our own `Wilderness Encounter Type` row 5 (which
already *tells the DM* to "Resolve via Social Interaction rules (Attitude shifts, Persuasion/Deception)"
— a system that didn't exist until this spec) define exactly this path.

### §4.1 — Creature attitude

Creatures get the **same `status.attitude` ladder** (§1), with two differences:

- **Opening attitude comes from `Monster Motivation`, not `NPC Opening Attitude`.** A creature here to
  *Find refuge* or *Avoid danger* opens **Wary** (will talk/flee); one *Conquering territory* or
  *Seeking wealth via hostages* opens **Hostile**; one *Recovering from battle* opens **Wary and
  desperate**. Map (script-applied):

  | `Monster Motivation` result | creature opening attitude |
  |---|---|
  | Find refuge / sanctuary · Hide from enemies · Avoid danger | **Wary (−1)** — open to flight or a deal |
  | Recover from a recent battle | **Wary (−1)**, but desperate (parley DC −5) |
  | Seek a specific item · Seek wealth | **Indifferent-to-Wary** — *transactional*; has a price |
  | Kill / drive off a rival | **Indifferent toward the PC** unless the PC is the rival (then Hostile) |
  | Conquer / control territory | **Hostile (−2)** — the PC is an intruder |

- **The lever is `Creature Parley — What It Wants`** (Deliverable 2) — the concrete thing that makes
  *this* creature stand down: food, its young returned, a clear path out, tribute, a rival's location,
  to simply be *left alone*. This is the creature's `NPC Want`/`NPC Leverage` equivalent, and it's what
  the resolver checks against in §2's DC table.

### §4.2 — "Can I talk past / buy off / scare off this creature?"

Runs the **§2 resolver, unchanged**, with the creature's Motivation-derived attitude as the DC seed and
its *What It Wants* as the leverage:

- **Talk past** (Persuasion / Animal Handling-as-Cha) — meet what it wants, or convince it you're not
  worth the fight → shift toward Indifferent → it lets you by. Animal Handling is the *implied skill*
  for a beast (Cha/Wis the DM's call); the resolver is identical.
- **Buy off** (offer its `What It Wants`) — if the PC can *give the thing*, it can **auto-shift one
  step** (decisive leverage, §2.1), no roll needed — the lever is the answer.
- **Scare off** (Intimidation) — a successful check past its morale floor sends it to flight (routes
  through §3 morale, since the creature was *already* in a fight or facing one). Overshoot → it panics
  *toward* the PC, not away (cornered-rat, the Terrified mortgage applied to beasts).

A creature with no language and no want the PC can touch (truly mindless, a construct, a starving
predator that wants *you*) is **not parley-able** — the DM says so honestly (`DM-CHARTER.md` §5, the
honest danger read), and the encounter stays a combat/flee problem. Parley is a *real* out, not a
universal one.

---

## §5. EVENT-CONTRACT integration (the typed events)

All social state is written **only through typed events** (`EVENT-CONTRACT.md` — the DM never writes
`U`/`w` directly; the script applies and returns the delta the DM must honor). New event types, in the
existing envelope (`{type, payload, source, sessionClock, worldClock, ledgerRefs}`):

| type | payload | usual source | consumed by |
|---|---|---|---|
| `social_check` | `{target, skill, dc, lever?, roll, total, outcome}` | **declared** (the PC's open roll + the approach; the DM reports the result, the script applies the shift) | SOCIAL (resolves to an `attitude_shift`) |
| `attitude_shift` | `{target, from, to, cause}` | **detected** where possible (the script computes it *from* a `social_check`, a `kill`, or a faction `clock_advanced`) | CODEX (`codex_update status.attitude`), DIFFICULTY |
| `morale_check` | `{creature, trigger, dc, save, outcome}` | **declared** (the DM rolls the creature's Wis save in the open and reports the `Morale Outcome` route) | SOCIAL / COMBAT-loose, CODEX |
| `parley_open` | `{creature\|npc, want, openingAttitude}` | **detected** when reached via a `morale_check{outcome:"parley"}` or `Wilderness Encounter Type` row 5; declared otherwise | SOCIAL (opens the §2 loop on a creature) |

**Detected > declared, applied here (`EVENT-CONTRACT.md` core principle):**

- `attitude_shift` is **derived, not reported.** The DM emits the `social_check` (skill + open roll +
  total); the *script* looks up the DC from current attitude (§2), applies leverage modifiers it can
  see (§2.1 detected), and **computes** the resulting shift. The DM cannot inflate the result — it can
  only report the roll. This is the tightest container and the anti-drift win: **the DM never decides
  whether persuasion worked; the dice + the rule do.**
- A `kill{victimClass:"civilian"}` near witnesses can **auto-emit** `attitude_shift` (→ Hostile) on
  every codex NPC who saw it — detected from the kill event + co-location, no DM report needed. (This
  is the social mirror of `DIFFICULTY.md`'s faction-clock escalation: violence has a visible social
  cost the script tracks.)
- A faction `clock_advanced` against the PC **detects** an attitude drop on that faction's members'
  records. The murder-hobo's world *feels* its standing collapse without the DM having to remember it.

The script's returned **state delta the DM must honor**: the new attitude value + the granted/refused
ask. The DM narrates the NPC's softening or hardening *to that delta* — it does not get to narrate a
warmer or colder reaction than the number says (the §0 anti-drift guarantee of `EVENT-CONTRACT.md`).

**Adjudication fallback (`EVENT-CONTRACT.md`):** a social situation the resolver can't price (an exotic
leverage, an unmodeled relationship) is an `adjudication` event → logged as **canon precedent** → the
same situation resolves the same way next time. The container tightens over a campaign without every
case authored up front.

---

## §6. Agency & spice safety (how this respects the Charter)

- **Never roll the player's dice (`DM-CHARTER.md` §3, locked).** The PC's social check is rolled by the
  *player*, in the open. The DM only sets the (hidden, §6.2) DC and applies the rule. Adversary/creature
  morale saves are the DM's, rolled openly (`§6.1`).
- **Hide the DC by default (`DM-CHARTER.md` §6.2).** The player rolls *"try to win him over — roll
  Persuasion,"* not *"beat DC 20."* The attitude ladder is the *DM's* spine; the player feels the NPC
  warming or hardening through narration, not a visible meter. A player may *ask* their read — a Wisdom
  (Insight) check reveals current attitude — **earned, not free, and scaled by how guarded the NPC is
  (decided 2026-06-28):** `Insight DC = 10, +5 if the NPC is guarded/closed (e.g. `NPC Demeanor`
  "unreadable" rows, or actively masking), and for an NPC who is *deliberately* guarding, + their best of
  (WIS, INT, CHA) modifier` — so an open, artless person is an easy read regardless of stats, but a
  sharp, self-possessed one who *chooses* to mask is genuinely hard to see through. Clamped to the ladder
  (≤ 30). The skill is the *player's* roll, in the open; the DC is the DM's (hidden, §6.2).
- **Never coach the approach (`DM-CHARTER.md` §3, locked).** The DM presents the NPC — demeanor, mood,
  what they seem to want — and **stops.** It does *not* say "try bribing him" or "intimidation would
  work here." The player chooses the skill; the resolver maps the approach to it. Answering a direct
  rules question ("what's my Persuasion?") is fine — volunteering the move is not.
- **Fixed-by-default world, no tone railroad (`DIFFICULTY.md`, `DM-CHARTER.md` §9.1).** Attitude
  clamps + rolled openings mean the world's social texture is *real and consistent*, not bent to keep
  every NPC win-able or to push a tone. A wall of hostility the PC can't talk through is legitimate —
  *iff* it was telegraphed (the honest danger read, `DM-CHARTER.md` §5). Making enemies is a real,
  permanent consequence.
- **Motivated-lies-over-canon (`DM-CHARTER.md` §7).** Persuading a deceptive NPC (`NPC Honesty`) wins
  their *cooperation*, not necessarily their *honesty* — they can help you and lie to you at once, the
  lie layered over canon, catchable by Insight or a second source. The resolver shifts *attitude*; it
  does not force *truth*. Orthogonal axes, kept orthogonal.
- **Open handoff (`DM-CHARTER.md` §3).** A social beat ends on the NPC's reaction and an open floor —
  never an enumerated menu of pitches. The player invents the next line; if they speak in character,
  it's quoted **verbatim** (`§3`, locked).
- **Spice ceilings respected.** The content tables sit at honest `table_class`: opening attitude and
  the parley lever are **Fork** (they set direction, not major consequence); the morale *outcome* is a
  **Commitment** (a creature's surrender/death/flight is a major fork) and is the only one that reaches
  Volatile/Mythic.

---

## §7. Phased build plan (each phase verifiable; Tier-2 scope)

Matches the Genesis spec house style (`CODEX.md` §7, `ADVANCEMENT` phasing) — branch-per-phase,
`--no-ff`, `check-manifest.py` + a jsdom harness per phase.

1. ☑ **BUILT 2026-06-28.** **Data model.** `status.attitude` added to the codex record
   (`src/world/codex.js`) — the §1 object (value/opening/floor/ceiling/lastShiftClock/terrified/note).
   New writers/reader, all registered in `manifest.json` + `owns`: `codexGetAttitude` (lazy
   Indifferent default — never writes until first contact), `codexAttitudeOpen` (stamps the rolled
   opening **once**, won't silently re-set without `force`; sets per-NPC clamps), `codexSetAttitude`
   (absolute set, clamped to floor/ceiling, stamps cause+clock — the writer the Phase-2 resolver calls),
   `codexSetTerrified` (the per-encounter override → underlying Hostile), plus `attitudeLabel`/
   `ATTITUDE_*` consts. The 3 content tables compile clean. Attitude rides `codexDigest` (DM) for free
   and is **stripped from `codexPlayerView`** (hidden-by-default, §6.2). *Verified:* `dev/verify-social.mjs`
   **30/30** (globals, lazy default, opening-stamped-once, floor/ceiling clamps, absolute-set+clamp,
   terrified override, digest-carries / player-view-strips). `check-manifest.py` green.
2. ☑ **BUILT 2026-06-28.** **Resolver.** `src/engine/social.js` (pure, deterministic, returns deltas —
   no state writes; registered in `manifest.json` + `genesis.html`): `socialDC(value)` (the DC ladder,
   Helpful terminal), `applyLeverage(dc, levers)` (±5 Want/Fear/Leverage/Trust-Lever mods, clamps 5–30,
   decisive→auto-shift), `resolveSocialCheck(input) → {outcome, from, to, shift, terrified, granted}`
   (one check = one step; caught lie −2, miss-by-5 −1, intimidation overshoot → Terrified; floor/ceiling
   clamped), `moraleDC(trigger, mods)` + `resolveMorale({save, dc})` (held vs. broke → caller rolls
   `Morale Outcome`), and `insightReadDC(input)` (the §6 scaled read DC). *Verified:* `dev/verify-social.mjs`
   **68/68** (Phase 1+2) — the §8 worked examples ride as fixtures. `check-manifest.py` green.
3. **Events.** Add `social_check`, `attitude_shift`, `morale_check`, `parley_open` to `applyEvent(w,e)`
   (`EVENT-CONTRACT`). `social_check` → resolver → `attitude_shift` → `codex_update`. Wire the
   **detected** auto-shifts: `kill{civilian}`+co-location → witness hostility; `clock_advanced` →
   faction-member drop. *Verify:* event application through the real mutators; detected auto-shift fires;
   the returned delta is what the DM must honor.
4. **Surfacing (digest + UI).** Add each near-PC NPC's **attitude** (and DM-only: opening, clamps,
   active levers) to the `dmDigest` codex slice (`CODEX.md` §6) so the DM reads the stance instead of
   guessing it. Player-facing: an **attitude tell** on the Codex panel for *known* NPCs the player has
   *read* (via Insight) — a five-step indicator, gated like everything else (`codexPlayerView` strips
   it otherwise). *Verify:* digest carries attitude; player view gates it; the panel renders the ladder.

**Scope guard (`TIER-SCOPE.md`):** Tier-2 only. No new combat math (morale rides the loose layer until
Fable). Creature parley uses existing CR-capped monster tables. Group-social cascade stays *declared*
(the detected version waits on the faction hook). Drift-to-baseline (§1.4) ships off by default.

---

## §8. Worked examples (these double as test fixtures)

1. **Talking down a wary informant.** NPC at **Wary (−1)**, DC **20**. The PC pulls the right Trust
   Lever (named a shared enemy) → **−5 DC → 15**. Player rolls Persuasion, total 17 → **success →
   attitude +1 → Indifferent**, and the informant now *talks* — but their `NPC Honesty` is *Deceiver*,
   so what they say is a motivated lie layered over canon (catchable later by a second source). Events:
   `social_check{skill:persuasion, dc:15, lever:"trust-lever", total:17}` → detected
   `attitude_shift{from:-1, to:0, cause:"shared enemy"}`.

2. **The bad bribe.** NPC **Indifferent (0)**, DC **15**. PC tries a clumsy bribe that reads as an
   insult (wrong lever) → **+5 DC → 20**. Player rolls 12, a miss **by 8 (≥5)** → **attitude −1 →
   Wary**, and the bribe is now on the table as a slight the NPC remembers (ledger fact). Talking is not
   free.

3. **The goblin band breaks.** Three goblins, leader drops. The two survivors hit the **leader-fallen**
   trigger → morale DC **15**. DM rolls their Wis saves openly: one fails. Roll `Morale Outcome` →
   **Parley**. The encounter drops into §4: the survivor's `Monster Motivation` was *Seek wealth*, its
   `What It Wants` is *a clear path out with its life*. The PC offers exactly that → **decisive leverage
   → auto-shift to Indifferent → it stands down and flees.** If the PC had instead demanded it betray
   its warren and the talk failed, **combat resumes where it left off** — same square, same HP. Events:
   `morale_check{trigger:"leader-fell", dc:15, outcome:"parley"}` → `parley_open{want:"a way out"}`.

4. **Murder in the square.** The PC kills a baker in front of witnesses. `kill{victimClass:"civilian"}`
   + co-location → the script **auto-emits** `attitude_shift{to:-2}` (Hostile) on every codex NPC who
   saw it, *detected*, no DM report. The town's social temperature collapses on its own; the DM narrates
   doors closing — it doesn't have to *remember* who saw, the script does (`DIFFICULTY.md` murder-hobo
   answer, social half).

---

## §9. Resolved decisions (Adam, 2026-06-28)

1. **Beast-parley skill — DM's call by creature; resolver skill-agnostic.** Cha (presence) or Wis
   (read the animal) per situation — "the best part of D&D is there's no singular way to handle most
   situations." The resolver maps whatever skill the approach implies; it never forces one (§4.2).
2. **Drift-to-baseline (§1.4) — OFF in v1.** A persistently hostile NPC is a real relationship, not
   ossification; ship the mechanic dark and revisit only if attitudes feel *stuck* against the fiction.
3. **Insight-to-read-attitude DC — SCALED (§6).** `10, +5 if guarded, + best of WIS/INT/CHA mod when
   deliberately masking` (≤ 30). High mental stats make a *guarding* NPC hard to read; an open one is
   easy regardless.
4. **Terrified decay — PER-ENCOUNTER (§1).** A `terrified` override that lapses to plain Hostile at the
   next interaction with that NPC. Intimidation buys this scene, mortgages the next.
5. **Group social — MOST-RESISTANT member, with the leader-cascade as the alt path (§2.2).** Cascade is
   a declared DM call in v1; upgrades to detected once faction records model leadership hierarchy.

**Still genuinely deferred:** exact JSON field names for `status.attitude` — settled alongside the
runtime ledger schema (shared open item with `EVENT-CONTRACT.md`). Naming is the orchestrator's to keep
consistent with the existing codex/ledger conventions (Adam's call: "I trust you; stay diligent").
