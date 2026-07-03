---
id: faction-outcome
type: table
domain: Social / Factions
status: source
table_class: Fork
player_facing: plumbing
voice_critical: false
---

#faction-outcome
> **PROVISIONAL — Sonnet draft, mechanical register (WORLD-TURN §3).** Rolled when a faction's
> agenda clock FIRES — `turnFactionOutcome` (`src/world/turn.js`) reads `roll.cells[0]`, so the
> **Outcome** column's first word is the literal machine key the switch matches on:
> `advance | setback | splinter | merge | takeover | collapse`. Low voice-criticality — this is
> plumbing, not a reveal roll; the Detail column is a one-line register note for the ledger
> sentence the code already writes, not additional narration to inject. d20, six outcomes weighted
> toward the two reversible ones (advance/setback) with the identity-changing outcomes
> (splinter/merge/takeover/collapse) sharing the tail.

| d20 | Outcome | Detail |
|---|---|---|
| 1 | advance | The agenda is achieved outright; the clock maxes and a new agenda is rolled — identity persists, ambition doesn't stand still. |
| 2 | advance | Achieved by increments that finally added up; nobody can point to the one deciding day. |
| 3 | advance | Achieved faster than the faction itself expected — the new agenda catches its own leadership flat-footed. |
| 4 | advance | Achieved at real cost, spent and paid; the win is real, the faction is leaner for it. |
| 5 | advance | Achieved through someone else's mistake more than the faction's own skill — it takes the win anyway. |
| 6 | setback | Blocked at the last step; the clock resets and the method hardens toward whatever's left to try. |
| 7 | setback | Undone by its own overreach; the retreat is orderly, the ambition undimmed. |
| 8 | setback | A key agent is lost — captured, bought, or simply gone — and the clock resets while a replacement is found. |
| 9 | setback | Publicly embarrassed rather than truly beaten; the clock resets, the pride is the real casualty. |
| 10 | setback | Outmaneuvered by a rival who wasn't even trying for this; the clock resets, and someone new gets noticed. |
| 11 | setback | A resource the plan depended on dries up, is seized, or simply stops arriving; the clock resets while it's replaced. |
| 12 | splinter | A faction within the faction finally walks: a rival mints off the parent's own tables, and the parent loses a tag it can't spare. |
| 13 | splinter | The break is generational — the old guard keeps the name, the new blood takes half the membership and a fresh agenda. |
| 14 | merge | The faction absorbs its weakest rival outright — tags and people folded in, the balance of power visibly shifted. |
| 15 | merge | A merger brokered as an alliance in public becomes an absorption in practice within a season. |
| 16 | takeover | Internal succession turns hostile; the dominant flag moves to new hands, and the faction's methods start to show it. |
| 17 | takeover | An outside patron's money finally buys the controlling voice; the flag moves, the name doesn't. |
| 18 | collapse | The faction folds — funding gone, leadership scattered, the agenda abandoned; it becomes historical, its record kept as recall fodder. |
| 19 | collapse | A single, public catastrophe ends it in one stroke; former members disperse into whatever's hiring. |
| 20 | collapse | It doesn't die so much as get absorbed into the ordinary background of the place — no funeral, just fewer and fewer people still using the name. |
^faction-outcome
