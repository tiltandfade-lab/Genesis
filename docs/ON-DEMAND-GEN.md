---
type: system-spec
status: specced — DEEP-RUN READY (2026-07-01, two design passes with Adam mid-playtest; build queued)
created: 2026-07-01
related:
  - "[[DESIGN]]"
  - "[[DM-BRIDGE]]"
  - "[[CODEX]]"
  - "[[CONSEQUENCE-LADDER]]"
  - "[[SPECULATIVE-PREFETCH]]"
  - "[[SYNTHESIS-CONTRACT]]"
  - "[[WALK-CONSUMPTION]]"
  - "[[EVENT-CONTRACT]]"
---

# On-Demand Generation — the noun supply chain

**The engine owns the nouns; the DM owns the verbs.** One deep run wires the whole noun supply
chain: the DM→engine generation handshake, the loot kind, the one-die-per-room cadence
(interiors AND walk segments), megatable names, the ambient NPC pool, and the Speculative-Prefetch
P1 deterministic reserve. Direction locked in `DESIGN.md` (2026-06-30 + the two 2026-07-01 blocks).
The non-d20 dice half (`rollRequest.dice` + free tray) is already BUILT.

**Executor note (read first):** this spec names symbols as found on 2026-07-01
(`codexAdd`/`codexDigest`/`codexEvictSoft`/`prepCastFrontier`/`startPrep`/`dmDigest`/
`applyResponse`/`seamHarvest`/`dwalkBudget`/`dwalkLootSlot`/`activeWalkDigest`). **Reconcile every
symbol against merged reality before coding** (the SHOP-UI §1 discipline); where walk-segment
symbols differ per environment (`pbundleSegCount`/`pbundleLegCount`/urban/wilderness leg shapes),
follow the real shapes, don't force the dungeon's.

## §0. Resolved design forks (Adam, 2026-07-01 — two passes)

| Fork | Call |
| --- | --- |
| Dice visibility | **Behind the screen.** Generation rolls are plumbing — no board overlay. One feed chip ("⚙ the world provides — <kind> rolled"), no atoms shown. Player dice keep the theater. |
| Turn shape | **Strict player↔DM alternation.** `gen[]` rides the DM's normal response; the app rolls instantly; atoms reach the DM **next turn** (the codex already rides every digest — §2). No auto-continuation half-turn: the sanctioned background lane is Speculative Prefetch (assets never narration; unused recycles). Bridge-era same-beat shortcut: `dev/roll-noun.mjs` (§9). |
| v1 kinds | **`npc` · `interior` · `item` · `loot`** (loot promoted to v1 — Adam's call, pass 2). `place` reserved for prep/frontier machinery. |
| Naming | **Roller-minted by race, immutable once revealed.** `build/gen-names.py` regenerates `data/names.js` from the NPC Name Megatable (race × gender/age + clan/family/virtue pools) + a 1d2 gender roll in `rollNPC`. DM name-in-a-bind OK via `opts.name` — always matched with real rolled atoms. No renames after reveal (guard, §3). |
| Primary path | **Rolled, always:** reserve → ambient pool → gen handshake → freehand only in a bind (back-filled same session). Measured via the session provenance slice (§8), not code-enforced. |
| Room-die cadence | **One significant d8–d20 per room — interiors AND walk segments** (the Hungering-Stone dragon-egg standard). Generated to the `CONSEQUENCE-LADDER §8` contract in the Stage-2 synthesis pass (prep-time primary); interiors get theirs on mint. Player-rolled OPEN; one roll per room, ever (§4). |
| P1 bundled | **Yes** — the deterministic reserve (SPECULATIVE-PREFETCH P1) ships in this run; it's the ambient pool generalized (§7). |

Mechanical calls (made by Claude; flag to Adam only if they bite): no app-side inference of
building entry — interior gen is DM-initiated; **gen capped at 4 per response** (overflow logs +
no-ops); unknown `kind` logs + no-ops (forward-compatible, same posture as `applyEvent`); the
reserve lives **outside** the codex (§7) so `codexDigest` never ships un-fictional records; soft-cap
raised for the pool (§6).

## §1. The contract — `gen[]` on TurnResponse

TurnResponse (`DM-BRIDGE.md`) gains one optional field:

```jsonc
"gen": [
  { "kind": "npc",      "opts": { "roleHint": "captor", "name": null } },
  { "kind": "interior", "opts": { "name": "the gran's house", "kind": "home" } },
  { "kind": "item",     "opts": { "lock": true } },
  { "kind": "loot",     "opts": { "rarity": "uncommon" } }        // or { "tier": 2 } → budget-priced slot
]
```

Applied in `applyResponse` (`src/world/dm.js`) **after** `events[]`, in array order, max 4:

1. Draw from the P1 reserve if a matching pre-rolled payload exists (§7), else fire the roller
   live — behind the screen, no dice overlay, either way.
2. Mint a **soft** codex record (`provenance:"rolled"`, `status.at` = current node where sensible)
   exactly as `prepCastFrontier` mints — evictable, `lockOnContact` on player contact (`CODEX §8b`).
3. Push one feed chip: `⚙ the world provides — <kind> rolled`.
4. Queue `{id, kind, name, genRef:turnId}` on `w.dm.mintQueue`.

Roller mapping: `npc`→`rollNPC(opts)` · `interior`→`rollBuildingInterior(opts)` ·
`item`→`rollItem(opts)` · `loot`→**new `rollLoot(opts)`** (§5). `opts` passes through verbatim.

## §2. The return path — `digest.minted[]` is a SPOTLIGHT, not a data channel

**Sequencing (2026-07-01 pass 3): `DIGEST-DIET.md` builds FIRST.** The digest's codex block
becomes two-tier (here-and-now full records + a name-only roster); minted records are always in
the full tier (`w.dm.mintQueue` is part of the here-and-now set by contract — DIET §1.3), so
minted atoms still reach the DM automatically without re-shipping the world. `dmDigest()` adds only:

```jsonc
"minted": [ { "id": "npc:brindle-hask", "kind": "npc", "name": "Brindle Hask", "genRef": "t-…" } ]
```

— drained from `w.dm.mintQueue` (persisted; survives reload), **cleared only when the DM's next
response arrives** (so a crashed turn doesn't eat the spotlight). The DM looks the ids up in
`digest.codex` and narrates from the levers. Free bonus (already built): every NPC record arrives
with attitude defaults (`codexGetAttitude` lazy-init) — the parley system needs nothing here.

## §3. Names — `build/gen-names.py` + the freeze guard

- **`build/gen-names.py`** (pattern of `gen-spells-slim.py`): reads
  `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Name Megatable.md` (packed two-column d100
  sub-tables: Elf child/female/male/family · Human female/male · Dwarf f/m/clan · Half-Orc f/m ·
  Gnome f/m/clan · Halfling f/m/family · Dragonborn f/m/clan · Fiend-Blooded f/m/virtue) and
  regenerates **`data/names.js`**. Shape stays backward-compatible: keep `first`/`last` (union
  pools — `roster.js:randomCharName` keeps working untouched), add `female`/`male`(/`child` where
  the source has it) gendered pools. Header-stamp it generated; never hand-edit.
- **`rollNPC`** gains a `1d2` gender roll (Quick NPC Generator 2.0 pattern): pick from the gendered
  pool when present, fall back to `first`. Record the gender in `rolled`.
- **Compile hygiene:** the megatable's sub-tables compiled into `tables.json` MANGLED (packed
  columns → bogus d50 rows like "Adrie — 51-52 — Keyleth"). Stamp the megatable frontmatter
  `type: name-bank` so `compile-tables.py` skips it (it already skips non-dice types), and
  recompile — an Oracle roll must not surface garbage rows.
- **Name-freeze guard:** `codexUpdate` (`src/world/codex.js`) rejects a `name` change when
  `status.known` is true (revealed = spoken = frozen). Pre-reveal renames stay legal.

## §4. The room die — one significant d8–d20 per room, corpus-wide

Adam's cadence (2026-07-01): *one d8→d20 roll per room that determines something significant
there* — the dragon egg in the Hungering Stone. The machinery is the `CONSEQUENCE-LADDER §8`
effect-die contract (True-Nature 4 columns · spice-curved 1→N with a mandated **dead-end floor**
("sometimes a room is just a room") and a rare campaign-changer ceiling · sink vocabulary · seeded
by object+room+world+PC+threads · captured on the roll).

**Interiors (on mint):** every `interior` gen mints with `dm.needsEffectDie: true` (the flag the
prep art path already uses). The DM generates the room's bespoke die seeded by the rolled
`layout`/`feature`/`inside`, captures via `codex_update {dm:{effectDie}}`
(`clResolveStoredEffect` reads it).

**Walk segments (at prep — the §8 primary path):** every segment of every prepped walk carries an
`effectDie` slot, generated in the **same Stage-2 synthesis pass** that already reskins every
segment (marginal cost — one pass, small tables out; ~6 segs × 3 walks). Storage: the die rides
the **existing per-segment reskin overlay** (`P.overlays`, applied by `applyPrep`) as
`overlay.effectDie = { die:"d12", faces:[{lo,hi,nature,use,tell,sink}…], rolled:null }`.
`activeWalkDigest` surfaces it **only on the `"here"` segment** (ahead segments stay veiled).

**Rolling (both surfaces):** the **player rolls it, OPEN** (dice transparency — generation hides,
the significant die is theater), via the existing `rollRequest.dice` prompt when they engage the
significant thing. **One roll per room, ever:** the DM captures the face
(`walk_update`-style overlay write for segments — reuse whatever event `applyPrep` uses, or
`codex_update` for interiors) and a re-visit narrates the canon face, never re-rolls. The DM never
rolls it and never picks the face.

**`SYNTHESIS-CONTRACT.md` addendum (frontier-tier prose, §11 step 8):** Stage 2 must emit the
per-segment dice to the §8 contract — die size scales with the segment's band (Grounded → d8,
Strange+ → d12/d20), dead-end floor mandatory, high faces bind-first to live fronts.

## §5. The `loot` kind — reuse the dungeon-walk chain

The budget machinery already exists in JS (`src/engine/dungeon-walk.js`): `dwalkBudget(segCount,
t2)` → rarity counts, `dwalkLootSlot(rarity)` → `dungeon-loot-*` compiled-table roll, `dwalkCoin`.
New **`rollLoot(opts)`** in `codex-roll.js`:

- `opts.rarity` (`"common"|"uncommon"|"rare"|"very-rare"`) → one `dwalkLootSlot` roll + `dwalkCoin`.
- `opts.tier` (no rarity) → draw one slot from `dwalkBudget`'s deck for that tier (single-slot
  pricing; a hoard = multiple gen entries, deliberately).
- Returns a codex `item` record payload: `kind:"item"`, `source:{type:"loot", ref:"<table>#<row>"}`,
  rolled text verbatim, `fields:{object}` / `dm:{why:"loot", coin}` — the §8b pointer pattern
  (codex holds the instance + relationships; `data/items.js` holds mechanics where the name
  resolves). **Pickup stays the existing flow:** the DM fires `item_changed` to move it into
  inventory + `codex_contact` locks the record; gen-minting never touches the sheet directly.

## §6. The ambient pool — inhabited locations always have rolled handles

New `prepCastAmbient(w, nodeId)` (`src/world/prep.js`): mints a small soft `rollNPC` pool —
**3 NPCs** — `status.at` the node, `provenance:"rolled"`. Fired from:
- `startPrep` for the **current node** when it's inhabited (type/tag check against the node — the
  start town always qualifies), before frontiers are cast;
- world founding (`bindWorld`/`cgBind` seam) for the **start town** once.

Pool members are ordinary soft records: `codexEvictSoft` may take untouched ones (raise the cap by
the pool size so ambient + frontier casts + gen mints coexist — keep hard/known/linked sacred);
`prepRecycleStale` recontextualizes last session's untouched leftovers. No chip — the prep
cinematic covers it. Interiors are **not** pre-cast (the handshake is the lazy path — Adam's
"notable interiors, lazily" resolves to on-demand).

## §7. P1 — the deterministic reserve (SPECULATIVE-PREFETCH P1, bundled)

The reserve holds **pre-rolled roller payloads, not codex records** — outside the codex, so
`codexDigest` never ships entities that aren't in the fiction yet, and an unused reserve entry has
zero meaning to recycle (it never existed).

- **`w.prefetch = { reserve: { npc:[], interior:[], item:[], loot:[] } }`** — persisted on the
  world (reload keeps it). Cap: **2 per kind**.
- **Top-up** in the idle window: after `applyResponse` completes (player is reading), fill each
  kind to cap by firing the rollers. Also top up after a draw. Synchronous JS is fine (rollers are
  instant); if it ever needs deferring, `requestIdleCallback` — but don't build that until felt.
- **Draw:** §1 step 1 pops a matching payload (loot only when `opts` match the reserved slot's
  rarity — else roll live). `opts.name` overrides the reserved name at mint.
- Eviction: cap-bounded FIFO; no TTL in v1.

This is the whole of P1 — no LLM, no bridge change. P2/P3 (idle-window LLM compile,
`anticipate[]` targeting) stay in `SPECULATIVE-PREFETCH.md`, not this run.

## §8. Tiering gate + the session provenance slice

**Gate (DM behavior, documented not enforced):** roll any NPC the player speaks to, who takes a
consequential named action, or who will recur; spear-carriers stay a descriptor. A freehand-named
NPC that crosses the gate gets a back-fill `gen` (with `opts.name`) the same session. Lives in
`DM-BRIDGE.md` (§11 step 8) + one standing line in the digest.

**Measurement:** `seamHarvest` (`src/world/seam.js`) gains `sessionProvenance` — records minted
**this session** (`seq` watermark captured at `beginSession`/`startPrep`) bucketed by provenance
(`rolled`/`prep`/`recontextualized` = mechanical vs `declared`/`authored` = freehand), plus the
ratio. Rides the existing wrap report next to `walkProvenance` — the instrument that answers "is
the rolled path actually primary."

## §9. `dev/roll-noun.mjs` — the bridge-era same-beat shortcut

jsdom script (pattern of `dev/verify-dm-events.mjs`): loads the real compiled tables + real
`codex-roll.js`, prints one roller payload as JSON.

```
node dev/roll-noun.mjs npc --role captor --name "Vess"
node dev/roll-noun.mjs interior --kind home
node dev/roll-noun.mjs item --lock
node dev/roll-noun.mjs loot --rarity uncommon
```

The DM loop runs it **mid-composition** when it needs atoms in the *same* beat, then emits
`codex_add` with the payload **verbatim** (`provenance:"rolled"`, atoms unedited) in that turn's
events. Read-only; never touches `.dm/` — safe during a live session.

## §10. Non-goals / deferred

- No `place` kind (frontier machinery owns places). No app-side building-entry inference.
- No visible generation dice; no renames after reveal; no auto-continuation half-turn.
- P2/P3 prefetch (LLM compile, `anticipate[]`, telemetry) — `SPECULATIVE-PREFETCH.md`.
- Compile-parser support for packed name columns (bypassed via `type: name-bank`, §3).
- Reserve TTL/smart-targeting; per-location persistent ambient pools (session-cast only).
- Monster/creature gen (`resolveCreature` already covers combat; the DMG-reskin sketch is its own
  track).

## §11. Build plan (ordered; Sonnet-executable except step 8)

0. **Reconcile symbols** against merged reality (executor note, top). Then, in order:
1. **`rollLoot`** (`src/engine/codex-roll.js`) — §5. Depends only on `dungeon-walk.js` helpers
   (call-time deps → `manifest.json`).
2. **Gen loop in `applyResponse`** (`src/world/dm.js`) — §1 (draw-or-roll, soft mint, chip,
   `w.dm.mintQueue`, cap 4, unknown-kind no-op) + `dm.needsEffectDie` on interior mints (§4).
3. **`digest.minted` spotlight** in `dmDigest()` — §2 (clear-on-next-response semantics).
4. **Name work** — `build/gen-names.py` → regenerate `data/names.js`; `rollNPC` gender roll;
   megatable `type: name-bank` stamp + recompile tables (§3); `codexUpdate` name-freeze guard.
5. **`prepCastAmbient`** + founding/`startPrep` wiring + soft-cap raise (§6).
6. **P1 reserve** — `w.prefetch.reserve`, top-up hook in `applyResponse`, draw in step 2's loop (§7).
7. **Segment effect dice** — overlay slot + `activeWalkDigest` "here"-only surfacing + the
   captured-face write path (§4). *(The generation itself is Stage-2 DM behavior — step 8.)*
8. **⚠ FRONTIER-TIER PROSE (not Sonnet):** `DM-BRIDGE.md` (the `gen[]` contract + `digest.minted`
   + the tiering gate + back-fill rule + room-die rolling protocol, in the "Mechanics the DM MUST
   fire" register) and the `SYNTHESIS-CONTRACT.md` Stage-2 effect-die addendum (§4). The runbook
   language is load-bearing (the WALK-CONSUMPTION lesson: an undocumented digest field sits
   unread). **Do NOT edit `DM-BRIDGE.md` while a live session is running.**
9. **`dev/roll-noun.mjs`** (§9).
10. **Verify + gates** (§12); `python3 build/check-manifest.py` after every module edit; register
    new files (`build/gen-names.py` is build-side; `roll-noun.mjs` is dev-side — follow existing
    manifest conventions for what registers).

## §12. Verification

**New `dev/verify-gen.mjs`** (jsdom, real modules in document order), asserting at minimum:
1. A `gen:[{kind:"npc"}]` response mints exactly one soft codex NPC (`provenance:"rolled"`,
   `status.soft`, at current node) + one chip + queues the spotlight.
2. Next `dmDigest()` carries `minted[{id,kind,name,genRef}]`; it persists until a response arrives,
   then clears.
3. `opts.name` ("Vess") mints under that name with full rolled atoms.
4. `codex_contact` locks soft→hard; a subsequent `codex_update {name}` on the known record is
   REJECTED; pre-reveal rename succeeds.
5. `interior` mints carry `dm.needsEffectDie:true`; `codex_update {dm:{effectDie}}` round-trips;
   `clResolveStoredEffect` reads it.
6. `loot` with `rarity:"uncommon"` returns a `source.ref` into `dungeon-loot-uncommon` + coin;
   `tier` pricing draws from `dwalkBudget`'s deck.
7. 5 gens in one response → 4 minted + 1 logged no-op; unknown kind no-ops.
8. Reserve: top-up fills 2/kind after `applyResponse`; a draw pops + re-fills; reserve payloads
   never appear in `codexDigest`; reload keeps the reserve.
9. Ambient: `startPrep` at an inhabited node casts 3 soft NPCs there; eviction respects the raised
   cap + never takes hard/known/linked.
10. Segment overlay carries `effectDie`; `activeWalkDigest` shows it on `"here"` only; a captured
    face persists and is re-served, never re-rolled.
11. `seamHarvest().sessionProvenance` counts this-session mints by provenance and computes the
    ratio (a freehand `codex_add` moves it the other way).
12. `gen-names.py` output: every race×gender pool non-empty, no "51-52"-style range strings in any
    name, `roster.js:randomCharName` still works on the regenerated shape.

**Mutation checks (the rubric's 7th point — break each guard, watch the harness fail, restore):**
the name-freeze (4), the atoms-verbatim mint (1: mutate the payload before `codexAdd`, assert the
harness catches a `rolled` mismatch), the one-roll-per-room capture (10), the reserve/codex
separation (8).

**Regression gates:** full harness sweep (30+ verifiers, 0 failed — the standing bar) +
`check-manifest` OK. **Never trust the subagent's self-reported green — re-run the gates.**

## §13. Acceptance (the felt test, next live playtest)

- The DM never freehands a speaking/recurring NPC — it asks (or draws), teases, then narrates from
  levers; a bind-name gets back-filled the same session.
- A building entered = an interior minted + one significant room die the player eventually rolls
  open; a dungeon room's die lands the same way from prep.
- `digest.minted` visibly steers narration (the Ochre-Stained test: her `want`/`leverage` become
  the player's door).
- Loot the DM offers traces to a real `dungeon-loot-*` row, and pickup lands as `item_changed`.
- `sessionProvenance` shows rolled meaningfully dominant — the instrument, not a vibe.
- Turn latency does NOT rise (the reserve should make gen draws instant; watch the existing
  per-turn latency timer).
