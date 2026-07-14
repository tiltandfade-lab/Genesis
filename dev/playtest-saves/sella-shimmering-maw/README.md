# Save — Sella Voss · The Shimmering Maw

Persistent state from the first bridgeless playtest (2026-07-05). **Continue Sella here.**

- `state.json` — the full universe at session close: the world (chained glass-crater village), Sella
  Voss "the Seam" (Human Rogue/Charlatan, L1, **1/9 HP**, XP 102), all 41 codex records, the ledger,
  and the complete turn-by-turn transcript (`dmlog`). Load it with the harness's `--dir`.
- `dm-view-at-close.json` — the DM-side board at close (factions/fronts/clocks/codex/ledger).
- `report.html` — the two-lens session report.

## To continue her (next playtest)

```
WORK=/tmp/sella-run2 && mkdir -p "$WORK"
cp dev/playtest-saves/sella-shimmering-maw/state.json "$WORK/state.json"
# then drive turns against "$WORK" (digest / apply / roll / playerview) as usual;
# copy back to the save dir at session close to persist progress.
```

## Run 2 played — 2026-07-05 (10 turns, Day 1 → Day 2 midday)

`state.json` is now the **Run-2 continuation** (Day 2, Coalstack Row, **9/9 HP**, XP 115, 5 places).
Run-1's close is archived at `state-run1-close.json`. Turn-by-turn log: `RUN2-LOG.md`.

**Method + verdict:** T1–T6 ran the memoryless-DM-every-turn stress test (Adam's directive); T7+
switched to a warm persistent DM (production pattern). **Codex-survival verdict:** engine atoms survive
cold-swaps and narrative coherence held remarkably well — the one seam is **BUG-06c** (the DM's
interpreted `codex_update {note}` is silently dropped; must write `dm`/`fields`). New bugs filed to
`docs/PLAYTEST-BUGS.md`: BUG-06c/06d, BUG-08, and F-07 (warm-DM NPC-id collision). BUG-01 re-confirmed
live (branch events still dropped → re-landed via `patch`).

**Where Sella stands (Day 2 midday):** full HP; errand #1 of Corran's ten DELIVERED (chandler **Oskin
Rell** "reminded"); she's learned Corran's real game — the reminders are the opening moves of the
**Ironwood Circle seizing the oil-well at the Throat** (kept by an unnamed **tallywoman**). Private cards:
Rell's hidden floorboard (a suspected ledger of a second buyer — she suspects **Maddan/Iron-Strap**),
and a covert night-route mapped to **Dessa's loft** (Miller's Leat) where **Batgal** hides (door open once
"earned" — she left the boy a message). Watcher **"Fenn"** (Circle) still escorts her. **Owed next:**
Batgal tonight; the second name comes Day 3 (her last). Open threads: the **Traitor's Tree** unvisited;
the **Shared Sleep / east-facing** taboo now tied to the Throat (workers never face it), reason undripped;
the Sunn house.

### To continue (turns 11–20) — fresh session
Point the harness `--dir` at this save dir. Player seat = Sella (cautious/cunning charlatan); DM seat =
warm persistent, briefed off `RUN2-LOG.md` + a fresh `dmstate`. Carry forward the seat prompt from the
run scratch — it teaches the STRICT branch schema + exact event field names that keep roll-branches and
codex persistence working.

---

### Original Run-2 framing (kept for reference)
**The point of run 2 (Adam):** boot a *fresh* DM seat with NO conversation memory and let it run
Sella purely from the codex + digest — a direct test of **how well the DM's codex survives play**.
Open threads (as of Run-1 close): Batgal unfound; the Sunn house; the Traitor's Tree still unvisited;
the Shared Sleep taboo still unexplained.

Known engine bugs active during play + the harness that caught them: `docs/PLAYTEST-BUGS.md`,
`dev/playtest-bug-probes.mjs`.
