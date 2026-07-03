---
type: system-spec
status: BUILT 2026-07-03 — outlandish-realms unit (BATCH3-PLAN unit 5, BATCH3-GUARDRAILS.md J2's
  closure). PROVISIONAL — Adam skims the vocabulary + the d300 tag-pass distribution below.
created: 2026-07-03
related:
  - "[[BREACH]]"
  - "[[BATCH3-GUARDRAILS]]"
  - "[[ADAM-REVIEW-1]]"
  - "[[LOOT-REMAP]]"
---

# Outlandish Realms — the frozen vocabulary + the d300 tag pass

## §1. The founding slate (Adam, 2026-07-03 — FROZEN, do not add ids)

Exactly these 11 realm ids + `realm-neutral` (never gets its own table — stays in the d300 as
the cross-realm grab-bag). Frozen in `data/realms.js` (`REALMS`/`REALM_IDS`).

| Realm | Register |
| --- | --- |
| `frontier` | Western — dust, debt, and a line nobody enforces till somebody does. |
| `chrome` | Tech/sci-fi — clean hard surfaces, cheap miracles, a battery bar always dropping. |
| `noir` | Noir/modern-crime — everyone owes somebody, and the rain never checks your alibi. |
| `ash` | Post-apocalyptic — the world already ended once; everyone's still deciding what that means. |
| `suburb` | Sleep-stalker suburbia — cheerful lawns, a wrongness that keeps regular hours. |
| `cosmic` | Cosmic/weird — scale that doesn't fit in a sentence; the wonder that answers back. |
| `theater` | War, any war — never named, never flagged; shapes without nations (era-lens sub-table below). |
| `high-seas` | Age of sail — salt, debt-to-the-crew, a horizon that keeps its own counsel. |
| `lost-world` | Vanished civilizations & epic-fantasy antiquity — a wonder that outlived its builders. |
| `gloom` | Horror/occult — the dread that answers a knock; nothing here is a metaphor. |
| `bright-kingdom` | Toybox/anachronism/whimsical wonder — power-ups you EAT, teeth underneath the candy. |
| `realm-neutral` | No home realm — the d300's own cross-IP grab-bag register; never tabled separately. |

**THEATER's era-lens** (docs/BREACH.md §2c: "wars RHYME, never named: shapes without flags, and
real atrocity is never loot") — a d8-flavored sub-table, `theaterEraLens(id)`:
`trench · hedgerow · legion · musket · longship · jungle · siege`.

## §2. The d300 inventory scan — distribution (300/300 rows tagged, 0 unmappable)

Every row of `Dungeon Loot - Outlandish.md` (d300) was read and mapped onto the frozen slate
above — the scan MERGED onto Adam's declared ids per BATCH3-GUARDRAILS J2 ("scan-derived
categories map onto these; genuinely unmappable = flag, don't invent"). **Nothing was
unmappable** — every row found a home in the frozen vocabulary.

| Realm | Rows | % |
| --- | --- | --- |
| `realm-neutral` | 130 | 43% |
| `chrome` | 62 | 21% |
| `theater` | 32 | 11% |
| `noir` | 22 | 7% |
| `bright-kingdom` | 17 | 6% |
| `lost-world` | 16 | 5% |
| `cosmic` | 7 | 2% |
| `ash` | 5 | 2% |
| `gloom` | 5 | 2% |
| `high-seas` | 3 | 1% |
| `frontier` | 1 | <1% |
| `suburb` | 0 | 0% |

**Reading the shape (flagging, not inventing):** the d300 is a modern-pop-culture/history grab-
bag by original design (Pokémon/Star Wars/Marvel/history relics/gag junk-drawer items) — it was
never a Western table, so `frontier` lands thin (1 row: the Cowboy's Lasso) and `suburb` lands at
zero (the sleep-stalker-suburbia register genuinely has no analog in this specific 300-item pop-
culture corpus). This is not a scan defect: the realm's OWN d100 table (BATCH3-PLAN unit 6,
`realm-tables`, not yet landed) is where frontier/suburb carry their real weight — the d300 tag
pass's job was only to classify what's actually there, never to force-fit a thin category or
invent rows to fill it out. `chrome` (tech/sci-fi weapons, armor, gadgets — Star Wars/Halo/
Fallout/Terminator/Portal/etc.) and `theater` (the 55 History rows — muskets, gladii, WWI trench
knives) are the two deep veins in this particular corpus, exactly as its content would predict.

**Classification method:** each row's Origin + Effect text was read (not just the Origin label —
"Reality"/"History" span many realms by actual flavor), then matched to the closest frozen
register. Ambiguous multi-fit rows (e.g. Captain America's Shield: WWII-legend AND vibranium-tech)
were filed to the STRONGEST single signal (cosmic/mythic-legend register, not chrome) per the
spice-ruler's own "when two bands argue, file DOWN/to the clearer read" spirit.

## §3. What changed in the source table (diff-audited, byte-untouched otherwise)

`Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Loot - Outlandish.md` gained TWO new
DM-only trailing columns this unit (the pre-existing `Band` column landed in batch-2):

1. **`Realm`** — every one of 300 rows, one value from the frozen vocabulary above (or
   `realm-neutral`). This is the ONE column the tag-pass gate (BATCH3-GUARDRAILS J1) measures —
   diff-audited: every Item/Origin/Effect/Band cell is byte-identical to its pre-pass value
   (`dev/verify-outlandish-realms.mjs` §2/§3).
2. **`Ranks`** — a SEPARATE addition (ADAM-REVIEW-1 §2's locked Item-Rank ruling; BATCH3-
   GUARDRAILS J2: "the outlandish-realms unit adds ladders to the d300's high-power +
   reality-breaking rows"). Every `high-power` row (49) and every `reality-breaking` row (4)
   carries a 2–4 rung ladder (`Rn(Lm) effect`); reality-breaking rungs floor at **L9 exactly, no
   exceptions** (all 4: Flux Capacitor, Iron Man's Arc Reactor, The DeLorean, The Infinity
   Gauntlet). `utility`/`combat` rows carry no ladder this pass (flat, per ADAM-REVIEW-1's own
   scoping — a future craft pass may add 2-rung ladders to standout utility/combat rows).

Both columns are trailing (never leading), so every existing reader of the compiled table's
`name/origin/effect` columns is unaffected — verified live against `src/engine/dungeon-walk.js`'s
`dwalkOutlandish` reader, the one function that actually consumes this table today.

## §4. The sourcing SUPERSEDE (docs/BREACH.md §2e.3 — wired this unit)

**Before this unit:** `dwalkOutlandishAllowed(level)` opened `reality-breaking` at **any** L9+
walk, breach or not — a live violation of BREACH.md §2e.3's "reality-breaking surfaces ONLY
inside breaches" rule (the mutation check named there: "a reality-breaker in a normal walk's
loot, harness fails").

**After this unit:** `dwalkOutlandishAllowed(level, inBreach)` takes a second, load-bearing
argument. `reality-breaking` is EXCLUDED from the allowed-list at every level UNLESS
`inBreach===true` — the level number alone can never open it anymore. The ONE exception BREACH.md
names (the already-licensed LOOSE-ENDS §2 anachronism-intrusion mechanism) IS this exact function
— a caller that wants that grandfathered path reaches it only by explicitly passing
`inBreach:true` from a live breach walk (never by level alone). `dwalkOutlandish(level, opts)`
also now supports `opts.realms` — an in-breach draw filters to the active breach's realm list
(realm-neutral rows always stay eligible, matching data/realms.js's own framing of that id as the
permanent cross-realm grab-bag).

**Verified (`dev/verify-outlandish-realms.mjs` §5/§5b/§6):** L1–L20 normal-walk allowed-lists
never include reality-breaking (20 assertions); the L9 floor still holds in-breach; a MUTATION
check reconstructs the OLD (pre-supersede) gate inline and confirms it WOULD have leaked
reality-breaking at L9 with no breach flag — shown RED — before confirming the real, fixed
function excludes it again — RESTORED GREEN; 200 in-breach realm-filtered draws never return an
off-realm item.

## §5. The ≥1-per-breach guarantee (docs/BREACH.md §2c/§2e.7 — wired this unit)

`breachLootGuarantee(level, realms, segments)` in `src/engine/breach.js` — every breach walk gets
**at least one** realm-filtered Outlandish item, via a rolled CHANNEL:

- Flat d4 roll over `hoard · social · secret · apex` (`breachLootChannelRoll`) — the ENCOUNTER is
  promised; the DOORWAY (channel) varies, matching BREACH.md's own framing.
- **The fallback rule (BATCH3-GUARDRAILS J2 §7):** if the roll lands `social` but the walk carries
  no Social segment to bind it to (`breachHasSocialSegment`), it falls back to `hoard` — the
  guarantee never dangles on a channel with nowhere to land.
- The item itself draws via `dwalkOutlandish(level, {inBreach:true, realms})` — this is the ONE
  call site (besides the grandfathered anachronism-intrusion path) that legitimately opens
  reality-breaking, per §4 above.

**Verified:** 400 rolls with a Social segment present surface `social` at least once and never
report an invalid channel; 400 rolls with NO Social segment NEVER report `social` (100% fallback
to hoard); every roll resolves a non-null item when the table's compiled.

## §6. What this unit did NOT build (flagged, not guessed — BATCH-GUARDRAILS G9)

- **No live call site wires `breachLootGuarantee`/`dwalkOutlandish` into an actual walk-assembly
  flow yet.** Per LOOT-REMAP.md's own long-standing status note, the Outlandish d300 has **no
  in-game roller today** — `dwalkOutlandish` has zero call sites outside this unit's own new
  code + the `item_changed` event applier's `spec.outlandish` consumer (`src/world/dm.js`). This
  unit fixes the GATE math (the supersede) and builds the GUARANTEE executor as pure, tested
  functions ready for the breach-tables walk-assembly seam (a later unit, per BATCH3-PLAN) to
  call at loot-resolution time. Wiring the actual call site (deciding WHICH segment/finale plants
  the guaranteed item) is follow-up work, flagged here rather than guessed.
- The per-realm d100 TABLES (BATCH3-PLAN unit 6, `realm-tables`) are a separate, larger unit —
  this unit only froze the vocabulary they'll key into and seeded the realm tag on the legacy
  d300 (division of labor per BATCH3-GUARDRAILS J2: "breaches roll the realm table; anachronism-
  intrusions roll the legacy d300").
