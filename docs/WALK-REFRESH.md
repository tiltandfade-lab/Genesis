---
type: system-spec
status: specced 2026-07-01 late night — build-ready EXCEPT skin tables (5-band samples below await Adam's voice review). BUILDS AFTER the overnight batch (touches wild-walk/dungeon-walk, which feat/travel-walks edits; loot pieces depend on feat/economy-sinks + feat/on-demand-gen).
created: 2026-07-01
related:
  - "[[SESSION-PREP]]"
  - "[[TRAVEL-WALKS]]"
  - "[[COMBAT]]"
  - "[[LOOT-REMAP]]"
  - "[[ECONOMY-SINKS]]"
  - "[[SPICE-CURVE]]"
  - "[[SYNTHESIS-CONTRACT]]"
---

# Walk Refresh — live rosters, full-suite treasure, the rolled skin

## §0. The diagnosis + Adam's forks (2026-07-01 late)

The three walk generators render segments well — **the authored archetype/behavior craft is the
keeper**. What went stale is the CONCRETE NOUNS: each enemy archetype carries a frozen 3–4-name
"Suggested Stat Blocks" pool (`walkPickFromPool` on e.g. "Swarms, Giant Rats, Ghouls, Hyenas";
dungeon threat-identities same pattern via boss/mid/low pools) while `data/bestiary.js` holds
**510 statted entries** including Adam's 95 customs. Treasure: dungeon walks roll the merged
rarity tables (fresh), but urban/wilderness walks have NO loot lane (open L6), the Outlandish
d300 is unbanded (L4), and no plot-items/valuables surface in segments.

| Fork | Adam's call |
| --- | --- |
| Archetype→bestiary mapping | **Code-side registry v1** — zero surgery on the tables; migrate to an authorable DM-only Tags column in a later craft pass if wanted. **Authored rows stay verbatim; the suggested-stat-block pools become the guaranteed floor/seed, never deleted.** |
| Treasure scope | All three: **urban/wilderness share the dungeon loot suite** (closes L6; contextual framing — stash/lockbox in town, cache/remains in the wild) · **Outlandish L4 banding via Sonnet-drafted tags, PROVISIONAL** until Adam's pass (tagging only, zero rewrites — the standing rule on his hand-authored tables) · **plot-items + valuables into segments**. |
| Skin tables authorship | **5-band samples first** (the validated protocol): samples in §5 below → Adam's voice review → full d100 authoring follows the verdict. Voice-critical craft — not drafted wholesale. |
| Skin cadence | **Every walk, spice-gated** — always roll; the curve does the gating (Grounded = subtle weathering, the rare tail goes wild). No opt-in flag to remember. |

## §1. Live rosters — `resolveArchetypePool`

- **Bestiary tags (derived, in the generator):** extend `build/gen-bestiary.py` to emit per-entry
  `tags` — creature **type** (beast/undead/humanoid/fiend/elemental/… from the stat-block type
  line), **size**, and a best-effort **habitat** keyword heuristic (name/type cues; absent = no
  habitat filter — soft preference only, never a hard gate). CR already present. Regenerate
  `data/bestiary.js` (never hand-edit).
- **`WALK_ARCHETYPES` registry** (new, code-side — `data/` or `src/engine/`, follow module
  conventions): keyed by the archetype string as it appears in the tables (wilderness enemy
  categories + dungeon threat identities). Entry: `{ types:[], sizeMax?, crBand:(tier)=>({lo,hi}),
  habitatPref?, authoredFloorWeight:~0.35 }`.
- **`resolveArchetypePool(archetypeName, {tier, biome, slot})`**: candidates = bestiary filtered
  by registry tags + CR band (slot shifts the band: boss = top, low = bottom) **∪ the authored
  pool** (parsed from the row — the floor). Weighted pick; authored floor weight keeps the
  table's voice present; unknown archetype = authored pool only (today's behavior, graceful).
- Wire into `wwalkEncounter` + the dungeon `creatures` slot mapping (`dungeon-walk.js:165`) —
  replace `walkPickFromPool(pool)` with the resolver, authored pool passed as the floor.
- **Adam's 95 custom creatures enter rotation automatically** (they're indexed with CR) —
  a deliberate feature of this design, not a side effect.

## §2. Treasure refresh

1. **Loot lane for urban/wilderness walks** (closes L6): reuse `dwalkBudget`/`dwalkAssignLoot`/
   `dwalkLootSlot` verbatim, scaled by segCount as-is; env framing on the presentation only
   (urban `stash/lockbox/strongbox`, wilderness `cache/remains/grave-goods` — a small framing map,
   not new tables).
2. **Outlandish L4 banding (PROVISIONAL draft):** a DM-only `Band` tag per row of the d300
   (`utility / combat / high-power / reality-breaking`), drafted by Sonnet, `status: draft`
   callout, **Adam's pass before canon** — tagging only, rows untouched. Compiler carries the
   column (the Legs/Pool exact-header precedent). Script gates surfacing by level
   (utility L1+ · combat L3+ · high-power L6+ · reality-breaking L9+; constants, tunable).
3. **Plot-items into Discovery segments:** spice-gated chance (Strange+ discovery rows) that the
   discovery IS a `rollItem` macguffin — minted as the walk's item cast is today, engine-owned.
4. **Valuables into finales:** the finale loot slot may attach a `dungeon-loot-valuables` roll
   (rides ECONOMY-SINKS §B wiring; depends on that unit landing).

## §3. The walk skin — one rolled lens per walk

- New tables (post-review, §5 first): `Walk Skin — Wilderness` / `— Dungeon` / `— Urban`
  (d100, Commitment-class, spice-graded to the standard curve `1–66 · 67–86 · 87–95 · 96–99 ·
  100`). Each row: **Band | Skin | What it touches** (the lens + 1–2 concrete manifestations).
  (SUPERSEDED 2026-07-06: play distribution is now SPICE-RAISE's tier weights; the authored layout
  survives as coverage.)
- **`rollWalkSkin(envKind)`** at walk assembly in all three rollers **and travel walks**
  (TRAVEL-WALKS journeys get flavor with no Stage-2 pass). Stored `walk.skin={text, band, ref}`;
  prefixes the briefing; surfaced in `activeWalkDigest`.
- **Constrains Stage-2 (anti-drift):** the synthesis reskin must honor the rolled skin — the DM
  colors *within* the lens instead of inventing one. One line in `SYNTHESIS-CONTRACT.md`
  (frontier-tier prose, rides the batch's prose landing).
- **Graceful until authored:** if the skin table isn't compiled yet, `skin=null` and nothing
  changes — the wiring ships now, the skins activate when Adam's tables land.

## §4. Build plan (day-2 unit — after the overnight batch merges)

1. `gen-bestiary.py` tags + regenerate (§1). 2. `WALK_ARCHETYPES` + `resolveArchetypePool` +
wire both walk rollers (§1). 3. Loot lane for urban/wilderness + framing map (§2.1).
4. Outlandish `Band` tag draft + compiler carry + level gate (§2.2 — PROVISIONAL).
5. Plot-item discovery chance + finale valuable (§2.3–4). 6. `rollWalkSkin` wiring, null-safe
(§3). 7. Frontier prose: the SYNTHESIS-CONTRACT skin line. 8. `dev/verify-walk-refresh.mjs`:
resolver honors CR band per tier/slot + authored floor always reachable (mutation check: empty
the registry entry, authored pool still serves) · urban/wilderness walks carry loot ·
level-gate hides reality-breaking at L1 and admits it at L9 · skin null-safe + stored + in
digest · regression: walk shapes byte-compatible for consumers (`verify-walk-consumption`,
`verify-prep-bundle`, `verify-combat` all green).

## §5. Walk-skin 5-band samples — FOR ADAM'S VOICE REVIEW (the gate on §3's tables)

**Wilderness**
- *Grounded* — **Late-season rot.** Every deadfall is soft, every ford swollen; the trail knows it's October. (Footing rolls where there was footing; smells of wet bark and mushroom.)
- *Textured* — **A hunting culture passed through.** Blazes cut chest-high, drying racks, a shrine of stacked antlers — someone claims this ground and counts what crosses it.
- *Strange* — **The birdsong is wrong.** Every call is answered a half-second late, from the wrong direction, one octave low. Nothing else seems to notice.
- *Volatile* — **The canopy is burning, slowly, miles off.** Ash falls like gray snow; everything alive is moving the same direction you are, and none of it is fighting each other yet.
- *Mythic* — **The forest remembers being an ocean.** Fish-shadows school between the trunks at dusk; drowned bells toll from under the roots; things surface.

**Dungeon**
- *Grounded* — **Water got in decades ago.** Rust-bloom on every hinge, doors swollen shut, the deep smell of wet stone. What iron remains is not to be trusted.
- *Textured* — **Looted already — in a hurry.** Toppled shelves, slit sacks, a single boot. Whatever they were running from may still be why it's quiet.
- *Strange* — **Every carved face has been chiseled off.** Recently. The dust of the work still hangs in the torchlight, and the chisel is nowhere.
- *Volatile* — **The complex is waking up.** Gears turn behind the walls; sconces relight one corridor ahead of you; doors close politely behind.
- *Mythic* — **Time pools in the deep rooms.** Torches burn backward toward their lighting; your footprints arrive before you do; the deepest room is earlier than the door.

**Urban**
- *Grounded* — **Market-day crush.** Carts locked axle-to-axle, tempers short, watchmen bored, pickpockets fat. Everything takes twice as long and costs a little more.
- *Textured* — **The quarter is in mourning.** Black cloth on every door, bells at intervals, business conducted in whispers — and nobody will say for whom.
- *Strange* — **Every stray dog is watching the same second-storey window.** They rotate shifts.
- *Volatile* — **Curfew fell an hour ago.** Streets empty, lamplighters armed, every knock answered through the door. Being outside is itself the crime.
- *Mythic* — **The district's reflection runs a day ahead.** Windows show tomorrow's street; some people check them like almanacs; the glazier is very rich and very afraid.

**Review protocol:** mark each keep / redirect / kill, note the voice corrections, and the full
d100 authoring (per environment) follows the verdict — that authoring session is the §3 gate.
