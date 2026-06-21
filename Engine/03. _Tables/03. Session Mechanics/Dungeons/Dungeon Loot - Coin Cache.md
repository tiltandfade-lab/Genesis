---
id: dungeon-loot-coin-cache
type: table
domain: Session Mechanics / Dungeons
status: source
table_class: Fork
player_facing: reveal
voice_critical: false
---

> [!info] Reference Table — Coin by Tier and Depth
> This table is used by the generator to assign coin to rooms that don't hold a magic item budget slot. Values are computed at generation time based on tier and BFS depth. The generator reads this table as a reference; actual coin amounts are computed inline using the Depth Category column.
>
> **Depth Categories:** Shallow = BFS depth 1. Mid = BFS depth 2–3. Deep = BFS depth 4+. Boss = Finale room.

| **Depth Category** | **T1 Coin** | **T2 Coin** |
| ------------------ | ----------- | ----------- |
| Shallow | 2d6 × 10 cp, or 1d6 sp | 2d6 sp, or 1d6 gp |
| Mid | 1d6 sp + 1d4 gp | 2d6 × 5 gp |
| Deep | 2d6 gp | 2d6 × 10 gp |
| Boss | 2d6 × 5 gp + 1 gem (10 gp) | 2d6 × 50 gp + 1d4 gems (50 gp each) |
^dungeon-loot-coin-cache
