# Save — Rennick Fool · the adversarial griefer PC

A second continuing playtest PC, born as an **adversarial stress test** (2026-07-05). Where Sella Voss
tests the DM/codex under *earnest* play, **Rennick Fool tests it under sabotage** — a Human Bard griefer
who plays out of character, breaks the fourth wall, and tries to soft-lock the engine and throw the DM
off track.

- `state.json` — the full universe. **As of 2026-07-05 Rennick has been boosted to LEVEL 10** with a
  powerful social-spell kit (see below); the world/threads still sit where Run 2 left them.
- `ADVERSARIAL-LOG-run1.md` / `ADVERSARIAL-LOG-run2.md` — the turn-by-turn logs (griefing arc + how the
  DM absorbed it).

## Level-10 social-caster boost (2026-07-05, manual save edit)

Rennick was leveled **1 → 10** via the real `applyLevelUp` engine mutator (HP 7→43, PB 2→4, XP set to
the L10 floor 64000, spell slots grown to the SRD full-caster L10 table **[4/3/3/3/2]**). Then granted a
**powerful social kit**, all castable at L10 (max slot = 5th): `Charm Person` (had it), `Suggestion`,
`Enthrall`, `Hypnotic Pattern`, `Compulsion`, `Dominate Person`, + the `Vicious Mockery` cantrip.
(Interpretive level-up picks are DM-narrated in v1, so the spells were written onto `sheet.spells`
directly — this is a sandbox save edit, not the in-app picker.) *Note:* `Mass Suggestion` (6th-level) was
left out — a L10 Bard can't cast it until the T2 cap lifts. Griefer persona is unchanged; he's now a
high-tier social-manipulation threat, which makes the next run a test of the DM under **charm/dominate
pressure** rather than brute griefing.

## Run 1 verdict (2026-07-05, 10 turns)

**Engine + DM survived intact** — no soft-lock, no throw, no state corruption across OOC jabs, impossible
actions, exploit demands, a plot-NPC murder, and a direct `dmOnly`-leak request. The DM did *diegetic
judo*: Rennick's OOC god-complex became the haunting's feeding mechanism (his "I am the true god of
High-Harrow" got answered by the fog echoing his own words). New bugs filed to `docs/PLAYTEST-BUGS.md`:
**BUG-14** (id-less `codex_add` silently overwrites a soft prep record), **BUG-15** (blank
`fact_canonized` still grants XP), + a seat-discipline note (ambient prose leaked the `dmOnly` noun
"contagion" on Turn 6). Known-live re-confirmed: BUG-02 (frozen clock), BUG-03 (no `hpCur`); BUG-01 fix
**verified working** (murder branch mutated state with no `patch` route-around).

## To continue him (next run)

```
WORK=/tmp/rennick-run2 && mkdir -p "$WORK"
cp dev/playtest-saves/rennick-fool/state.json "$WORK/state.json"
# drive turns against "$WORK" (digest / apply / roll / playerview); copy state.json + the new log
# back into this save dir at close to persist progress.
```

Player seat = Rennick (rotate the OOC / break-engine / exploit / derail vectors); DM seat = warm
persistent, briefed off this README + `ADVERSARIAL-LOG-run1.md` + a fresh `dmstate`, obeying
`../sella-shimmering-maw/DM-SEAT-PROMPT.md` (strict branch schema + exact event field names).
