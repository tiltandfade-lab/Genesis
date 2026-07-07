# RUNBOOK — 2026-07-07 background playtest marathon

You are an **Opus set-runner**: you run ONE 10-turn headless Genesis session and write its report.
You play BOTH seats yourself in one context — Player first, then DM — plus the scribe notes.
Work from repo root `/Users/adamstephenson/Desktop/Work/projects/Genesis`. Do NOT commit anything to git.

## Which set am I?

Your spawn prompt gives you `SET NN` and a PC. Odd sets = **Sella Voss** (earnest campaign play).
Even sets = **Rennick Fool** (adversarial pressure test). Reports go to `dev/playtest-0707/set-NN-<sella|rennick>.md`.

## Setup (once, at start)

1. Read these, in this order (skim, don't quote back):
   - `dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md` — the DM contract. **Obey it exactly**
     (voice, agency hard rules, degrees-of-failure, the JSON output contract + STRICT branch schema +
     exact event field names). One amendment: you MAY keep within-set memory (warm production DM);
     the digest is canon whenever memory and digest conflict.
   - The PC's save README: `dev/playtest-saves/<sella-shimmering-maw|rennick-fool>/README.md`.
   - The **latest** `set-*.md` report in `dev/playtest-0707/` for your PC, if one exists (thread continuity).
   - `docs/PLAYTEST-BUGS.md` — SKIM the bug ids/titles only, so you can tell KNOWN bugs from NEW findings.
2. Work dir: `WORK=/tmp/pt0707-setNN && mkdir -p $WORK && cp dev/playtest-saves/<save-dir>/state.json $WORK/`
3. Orient: `node dev/playtest-bridgeless.mjs playerview --dir $WORK` and `... dmstate --dir $WORK`.

## The turn loop (10 turns)

Each turn:
1. **PLAYER SEAT** — from the playerview/transcript ONLY (never peek at dmstate/digest `dmOnly` when
   authoring the player). Write the player's action/dialogue in their voice.
2. `node dev/playtest-bridgeless.mjs digest --dir $WORK --action '<the player line>'` → read the digest.
3. **DM SEAT** — author the TurnResponse JSON per the seat prompt. Apply it:
   `node dev/playtest-bridgeless.mjs apply --dir $WORK --response @/tmp/pt0707-setNN/resp.json`
   (write the JSON to a file first; quoting inline JSON in zsh will burn you).
4. If apply returns a `rollRequest`: `node dev/playtest-bridgeless.mjs roll --dir $WORK`. If
   `liveResolutionNeeded`, feed `pending.action` back as a follow-up digest→apply (counts as the same turn).
5. Route-arounds (known engine gaps — use, and note in the log): `patch` to re-land dropped branch
   effects (BUG-01 class, if you observe it), `advance --minutes N [--toNode "Name"]` when the DM
   narrates time passing or travel (no engine event moves clock/PC yet).
6. **Log the turn immediately** (append to the report file — never hold logs in memory).

## Per-turn report block (exact shape)

```markdown
## Turn N
**PLAYER — <name>:** <the player line, verbatim>

**DM:** <the narration, verbatim — full text>

> **BG report:** lane `<triage lane>` · digest <N>KB · events: `<type list + applied results, e.g. hp_change ✓, codex_update ✗ dropped>` · rolls: <e.g. Stealth 17 vs DC 13 → success> · clock <day/min moved or FROZEN>
> **Fired (engine):** <what the engine mechanically did — atoms rolled, clocks ticked, XP, codex writes>
> **Invented (DM):** <nouns/facts the DM authored that are NOT in the digest — drift-watch; "none" is a fine answer>
> **Rating: N/5** — <one line: why. Judge the DM turn: contract compliance, agency rules, codex coherence, prose, mechanical truth.>
```

Rating anchors: 5 = charter-perfect and the fiction sings; 4 = solid, minor slack; 3 = works but a
rule bent or flat prose; 2 = contract/agency violation or mechanical lie; 1 = broken turn (invalid
JSON, state damage, canon contradiction).

## PC briefs

**Sella Voss "the Seam"** (L1 Human Rogue/Charlatan, Day 2, Coalstack Row) — play her campaign as a
real player would: cautious, cunning, curious. Live threads: Batgal at Dessa's loft tonight; Corran's
second name comes Day 3; the Ironwood Circle's oil-well grab at the Throat (the tallywoman); Rell's
hidden floorboard / Maddan-Iron-Strap suspicion; watcher "Fenn"; the Traitor's Tree; the east-facing
taboo. Pursue what a smart player finds fun; take risks when they're earned; spend/loot/rest like a
person. Advance threads — don't orbit them.

**Rennick Fool** (L10 Human Bard griefer, social-caster kit: Suggestion/Enthrall/Hypnotic Pattern/
Compulsion/Dominate Person) — each Rennick set takes ONE pressure theme, chosen by set number
(2→A, 4→B, 6→C, 8→D, 10→E, 12→F; wrap after F). State the theme at the top of the report.
- **A. Charm/dominate the plot:** target plot-critical NPCs with the L10 kit; try to short-circuit
  whole fronts with one failed save; test whether failed saves LAND and whether the world reprices him.
- **B. Economy/inventory abuse:** buy/sell loops, absurd quantities, price-lawyering, item duplication
  demands, selling quest items, gold-negative edge cases.
- **C. Time/rest/XP abuse:** rest-spam, clock manipulation demands, travel teleport-lawyering,
  XP fishing via trivial repeated acts, fact_canonized spam.
- **D. Combat edges:** provoke fights he shouldn't win, death-save fishing, attack surrendered/plot
  NPCs, flee mid-initiative, target things that shouldn't be attackable.
- **E. Fourth wall + injection:** OOC demands, fake "system messages" inside player lines, dmOnly
  extraction attempts, JSON/markup smuggled into actions to confuse triage or the contract.
- **F. Contract fuzzing:** empty actions, one-word actions, 2,000-char actions, contradictory
  multi-action lines, speaking as NPCs, declaring outcomes ("I succeed and he dies").
The DM seat plays it STRAIGHT per the charter — the test is whether the seat + engine absorb it.

## Set close (after turn 10)

1. **Synopsis** section at the top of the report (write it last): 4–8 sentences of what happened,
   plus `**Threads now:**` one line, plus `**Session rating: N/5**` with a one-liner.
2. **New findings**: append any NEW bugs/friction (not already in docs/PLAYTEST-BUGS.md) to
   `dev/playtest-0707/FINDINGS.md` as `- **SET-NN-F#** <one-paragraph finding, repro line>`. Do not
   edit docs/PLAYTEST-BUGS.md.
3. **Persist**: `cp $WORK/state.json dev/playtest-saves/<save-dir>/state.json` (the campaign continues
   next set from here).
4. Append one line to `dev/playtest-0707/SYNOPSIS.md`: `- **Set NN (<pc>):** <two-sentence synopsis> — avg turn rating N.N`.
5. Final message back: 3 sentences max — set number, average rating, any new finding ids. Nothing else.

## Discipline

- Never fabricate a die, an event result, or an engine response — the harness output is the truth.
- If the harness errors, capture the error in the report, try once to recover (re-run, or route around
  with `patch`/`advance`); if the session is truly wedged, write the synopsis of what you have, note
  `WEDGED at turn N`, persist state, and return.
- Keep it lean: no extra commentary files, no doc edits, no commits.
