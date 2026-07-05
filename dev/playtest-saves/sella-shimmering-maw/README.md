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

**The point of run 2 (Adam):** boot a *fresh* DM seat with NO conversation memory and let it run
Sella purely from the codex + digest — a direct test of **how well the DM's codex survives play**.
Where she stands: alive at 1 HP, owing both the Ironwood Circle and the Iron-Strap Guild, holding a
3-day deadline to carry Corran's hit-list to the ten still breathing and carry Maddan's word back.
Open threads: Batgal unfound; the Sunn house; the Traitor's Tree still unvisited; the Shared Sleep
taboo still unexplained.

Known engine bugs active during play + the harness that caught them: `docs/PLAYTEST-BUGS.md`,
`dev/playtest-bug-probes.mjs`.
