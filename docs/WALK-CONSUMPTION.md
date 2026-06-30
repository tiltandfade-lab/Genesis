---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-30
related:
  - "[[SESSION-PREP]]"
  - "[[SYNTHESIS-CONTRACT]]"
  - "[[CONSEQUENCE-LADDER]]"
  - "[[DM-CHARTER]]"
  - "[[SPATIAL-MODEL]]"
  - "[[EVENT-CONTRACT]]"
  - "[[CODEX]]"
  - "[[DESIGN]]"
---

# WALK-CONSUMPTION — making the DM run the walks it's handed (and capture as re-entry)

## 0. The problem (grounded in the code)

Session-Prep already **generates** walks. `startPrep()` ([src/world/prep.js](../src/world/prep.js))
fires every session (auto, on wake — [src/world/play.js:100](../src/world/play.js),
[play.js:200](../src/world/play.js)), calls `assemblePrepBundle()`
([src/engine/prep-bundle.js](../src/engine/prep-bundle.js)) which rolls **three** full walks
(urban / dungeon / wilderness), binds a quest hook + a soft codex cast to each, and pins each to a
soft "rumored frontier" node on the map. That half is **built and verified**
(`dev/verify-prep.mjs`, `dev/verify-prep-bundle.mjs`).

The walk reaches the DM exactly **once**, as the `⎘ Prep handoff` string at session start
(`prepHandoff()`, [prep.js:131](../src/world/prep.js)). It is **never re-surfaced.** The per-turn
payload `dmDigest()` ([src/world/dm.js:29](../src/world/dm.js)) carries setting, PC, factions,
fronts, ledger, gazetteer, codex, and a soft `sessionLean` — **but no walk, no prep, no active
frontier.** So by turn ~3 the DM is narrating from a digest that does not know a walk exists, and it
drifts to freehand. There is also **no walk-provenance** anywhere (only `codexProvenanceReport()`,
[src/world/codex.js:249](../src/world/codex.js)), so the wrap can't even report whether a walk was
used. And walk length is **flat** — `pbundlePlan()` hardcodes urban 5 / dungeon 4 / wild 4 legs
regardless of level ([prep-bundle.js:42](../src/engine/prep-bundle.js)).

**Root cause: the digest is walk-blind.** The walks aren't orphaned code — the DM is structurally
made to forget them. This spec is the fix, and capture-as-re-entry falls out of it as the first
consumer.

### Design principles this honors

- **Engine owns the nouns; DM owns the verbs** ([[project-genesis-engine-owns-nouns]]). The walk
  (topology, segments, encounters, cast) is rolled; the DM only narrates, reskins, and decides
  meaning. The cursor is script-owned state, not DM memory.
- **Anti-drift over invention** ([[feedback-prioritize-antidrift-mechanization]]). The whole point
  is to stop the DM inventing space it was already handed.
- **Diversion folds back into existing legs** (CONSEQUENCE-LADDER §8.5 Diversion Rule). Capture is
  not a new branch — it's another entrance into the walk already in play.
- **Soft prior, never a railroad.** The active walk rides in the digest with the *same* framing as
  `sessionLean`: player intent → situation → walk. The DM may leave the walk at any time; the cursor
  just tracks where the party is, it does not steer them.

---

## 1. Unit of work & build order

One branch: `feat/walk-consumption`. Five steps, built in this order (A is the spine everything else
hangs on; D is trivial and independent; C makes A *visible*, i.e. it's verification; B and E are
consumers):

| # | Step | One-liner | Depends on |
|---|---|---|---|
| **A** | Active-walk in the digest + cursor | The DM stops forgetting the walk until it's walked | — |
| **D** | Stage-scaled walk length | Shorter walks early game, longer late game | — |
| **C** | Walk provenance + wrap report | You can finally *see* which segments ran | A |
| **B** | Advance / reskin on walk-complete | Walk walked → route to the next prepped walk, reskinned | A, C |
| **E** | Capture as re-entry | Capture drops the PC into a holding segment of the active walk | A |

### Shared data model (added once, used by all five)

`prepOf(w)` ([prep.js:13](../src/world/prep.js)) gains two fields; each prep node `P.nodes[id]`
gains a cursor. **Nothing here is hand-authored** — all of it is script-written/-read.

```
w.prep = {
  session, bundle, overlays, harvest, nodes, debt,   // (existing)
  activeWalkId: null,        // (NEW) nodeId of the frontier currently being walked; null in town/between walks
  walkLog: [],               // (NEW) provenance: [{ walkId, env, topology, segCount, touched:[num], finaleReached:bool, session }]
}

P.nodes[nodeId] = {
  env, idx, soft, locked, hook, briefing?, segments?, cast?,   // (existing)
  cursor: {                  // (NEW) set by lockOnContact; advanced by walk_advance
    current: 1,              // segment num the party is in (segments are 1-indexed by `num`)
    touched: [1],            // every segment num the party has entered
    done: false,             // finale reached / walk exhausted
  }
}
```

Walk segment shape (from [walk.js](../src/engine/walk.js), read by `pbundleSummWalk`): each seg is
`{ id, num, label, exits, depth, isFinale?, segType|areaType|biome, encounter?, finale? }`. The
cursor keys off `num`.

---

## 2. Step A — Active-walk in the digest + cursor  ⟵ THE SPINE

### Goal
Every turn, the DM's digest carries the walk the party is currently on, with a cursor marking where
they are, **until the walk is walked out.** This is the literal fix for "the DM doesn't need to
forget the walk until it's been walked."

### Where it plugs in
- **State:** `prepOf()` default object gains `activeWalkId:null, walkLog:[]` ([prep.js:13](../src/world/prep.js)).
- **Set the active walk:** in `lockOnContact(w, nodeId)` ([prep.js:183](../src/world/prep.js)) —
  the moment a rumored frontier becomes real is the moment the party steps onto its walk. On a
  successful lock: `P.activeWalkId = nodeId` and initialize `pn.cursor = { current:1, touched:[1],
  done:false }` (entry is the topology's start node — `walk.segments.find(s=>s.depth===0)` or `num===1`).
- **Surface it:** new `activeWalkDigest(w)` in `src/world/dm.js`, called from `dmDigest()` and added
  as a new top-level field `activeWalk:` on the returned object (sibling to `sessionLean`).
- **Advance it:** new event `walk_advance` in `applyEvent` (see below).

### `activeWalkDigest(w)` — the payload
Returns `null` when `P.activeWalkId` is unset. Otherwise a **compact, reskinned** view (walks are
3–7 segments, so the whole thing is cheap to carry):

```js
function activeWalkDigest(w){
  const P = prepOf(w); const id = P.activeWalkId; if(!id) return null;
  const pn = P.nodes[id]; const walk = walkOfFrontier(w, id); if(!walk || !pn) return null;
  const ov = pn.segments || null;                      // the DM's reskin overlay (from applyPrep), if any
  const cur = pn.cursor || { current:1, touched:[1], done:false };
  return {
    nodeId: id,
    place: (mapOf(w).nodes[id]||{}).name || null,
    environment: walk.environment,
    topology: walk.topology || null,
    briefing: pn.briefing || null,                     // the DM's own Stage-2 throughline for this frontier
    cursor: { current: cur.current, touched: cur.touched, done: cur.done, total: walk.segCount },
    segments: walk.segments.map(s => ({
      num: s.num, label: s.label, isFinale: !!s.isFinale,
      gist: s.isFinale
        ? (s.finale && (s.finale.track||s.finale.revelation) || s.areaType || "arrival")
        : [s.segType||s.areaType||s.biome, s.encounter && s.encounter.type].filter(Boolean).join(" / "),
      reskin: ov ? (ov.find(o=>o.ref===("S"+s.num))||null) : null,   // roll-keyed reskin, never a rewrite
      state: cur.touched.includes(s.num) ? (s.num===cur.current ? "here" : "behind") : "ahead",
    })),
    cast: pn.cast || null,                             // the pre-cast NPCs/object for this frontier (codex ids)
    rule: "The walk the party is ON. Narrate the CURRENT segment; the rest is the road ahead/behind. "
        + "Honor the rolls (reskin by ref, never rewrite). A SOFT prior — player intent and the live "
        + "situation override it. You do not steer the party down it; you track where they are. When "
        + "the party clears a segment emit {type:'walk_advance', payload:{toSeg:N}}; at the finale "
        + "emit {type:'walk_complete'}.",
  };
}
```

Add to `dmDigest()` ([dm.js:34](../src/world/dm.js)) return object:
```js
    activeWalk: (typeof activeWalkDigest==="function") ? activeWalkDigest(w) : null,
```

### Event: `walk_advance`
New `case` in `applyEvent` ([dm.js, near the prep cases ~line 563](../src/world/dm.js)):
```
{ type:"walk_advance", payload:{ nodeId?, toSeg } }
```
- `nodeId` defaults to `P.activeWalkId`.
- Validate `toSeg` is a real segment num and reachable (`exits` of the current seg include it, OR
  allow any forward jump — topologies branch; be permissive, just record).
- `cur.current = toSeg`; push to `cur.touched` if absent.
- If the new segment `isFinale`, do **not** auto-complete — completion is its own beat (Step B);
  reaching the finale segment ≠ resolving it.
- Returns `{ok:true, current, touched}`. Forward-compatible no-op if prep/active walk is absent.

### Edge cases
- **No active walk** (party in town, between walks): `activeWalk:null`. Digest unchanged in shape.
- **Reload mid-walk:** `activeWalkId` + cursor live in `w.prep` (persisted via `saveU`), so a reload
  resumes the same walk. (Mirror the in-flight-turn persistence at [dm.js:85](../src/world/dm.js).)
- **Player leaves the walk** (walks off-map, abandons the dungeon): the DM emits `walk_complete` with
  `payload:{abandoned:true}` (Step B handles it) — the cursor doesn't trap them.
- **Soft→hard already done:** `lockOnContact` already flips the node and edges; just add the cursor
  init alongside the existing `codexContact` call.

### Verify (`dev/verify-walk-consumption.mjs`, new)
- After `startPrep` + `lockOnContact`, `prepOf(w).activeWalkId` is set and `dmDigest().activeWalk` is
  non-null with `cursor.current===1`, `cursor.total===walk.segCount`.
- `walk_advance` to seg 3 → digest cursor `current===3`, `touched` includes 1 and 3, seg 3 `state==="here"`.
- A second living world's digest with no contact → `activeWalk===null`.
- Reaching the finale seg via `walk_advance` does **not** set `done`.

### Done when
The DM, every turn, sees the current segment of the walk it's on, and the cursor advances as the
party moves — verified headless, and confirmed in a Bridge playtest that a multi-turn scene stays on
the rolled segments instead of drifting.

---

## 3. Step D — Stage-scaled walk length

### Goal
Shorter walks early game, longer late game. Currently flat (5/4/4). Length should track the living
PC's level within the Tier-2 cap.

### Where it plugs in
Only `pbundlePlan()` ([prep-bundle.js:42](../src/engine/prep-bundle.js)). Add a helper; keep tier
(content/threat band) exactly as-is — this changes *length* only. `rollUrbanWalk`/etc. already clamp
`segCount` to 2–30 ([walk.js:374](../src/engine/walk.js)), so every value below is valid.

### The curve
```js
// length scales with the living PC's level (Tier-2 cap = L10). Content/threat band stays tier-driven.
function pbundleSegCount(level){
  const L = Math.max(1, Math.min(pbundleLevelCeiling(), level||1));
  return Math.max(3, Math.min(7, 2 + Math.ceil(L/2)));   // L1–2:3  L3–4:4  L5–6:5  L7–8:6  L9–10:7
}
function pbundleLegCount(level){
  const L = Math.max(1, Math.min(pbundleLevelCeiling(), level||1));
  return Math.max(3, Math.min(5, 2 + Math.ceil(L/3)));   // L1–3:3  L4–6:4  L7–10:5
}
```

| Level | urban / dungeon `segCount` | wilderness `legCount` |
|---|---|---|
| 1–2 | 3 | 3 |
| 3–4 | 4 | 3 |
| 5–6 | 5 | 4 |
| 7–8 | 6 | 5 |
| 9–10 | 7 | 5 |

`pbundlePlan` reads the level the same way `pbundleLedger` already does (living PC's `sheet.level`,
[prep-bundle.js:30](../src/engine/prep-bundle.js)), falling back to 1 headless:
```js
function pbundlePlan(opts){
  if(opts.environments && opts.environments.length) return opts.environments;
  const t = Math.min(TIER_CAP, opts.tier||1);
  const pc = opts.world && (opts.world.characters||[]).filter(c=>c.status==="living").slice(-1)[0];
  const lvl = (pc && pc.sheet && pc.sheet.level) || opts.level || 1;
  return [
    { kind:"urban",      segCount: pbundleSegCount(lvl), tier:t },
    { kind:"dungeon",    segCount: pbundleSegCount(lvl), tier:t },
    { kind:"wilderness", legCount: pbundleLegCount(lvl), tier:t },
  ];
}
```

### Edge cases
- **Topology minimums:** some topologies need ≥3–4 segments (`WALK_TOPOLOGY_MIN_SEGS`,
  [walk.js](../src/engine/walk.js)); the existing `walkResolveTopology` fallback already downgrades a
  too-big topology for a small `segCount`, so L1's 3-seg walks just can't roll "The Fracture" (min 4).
  No new handling needed — note it in the verify.
- **No PC (headless/pre-creation):** falls back to level 1 → 3 segs. Matches today's lean default.

### Verify (extend `dev/verify-prep-bundle.mjs`)
- `assemblePrepBundle({level:1})` → urban/dungeon walks have `segCount===3`, wild `legCount===3`.
- `level:10` → `segCount===7`, `legCount===5`.
- Monotonic non-decreasing across `level` 1→10.
- A 3-seg walk never carries a topology whose min exceeds 3 (fallback held).

### Done when
Walk length rises with level on the documented curve, verified headless. (Tune the breakpoints in
playtest — they're provisional.)

---

## 4. Step C — Walk provenance + wrap report  ⟵ makes A visible

### Goal
Record which walk + segment each beat came from, and report at session-wrap which segments actually
ran. This is the instrument that proves Step A is working — it's the thing you've been missing in the
post-session wrap. Mirrors `codexProvenanceReport()` ([codex.js:249](../src/world/codex.js)).

### Where it plugs in
- **Stamp beats:** while `P.activeWalkId` is set, key beat-events get a walk stamp. Add a tiny
  `walkStamp(w)` helper returning `{walkId, seg}` (or `null`), and attach it in the `applyEvent`
  cases that already write ledger beats during a scene: `encounter_resolved` ([dm.js:477](../src/world/dm.js)),
  `discovery` ([dm.js:429](../src/world/dm.js)), `kill` ([dm.js:485](../src/world/dm.js)),
  `front_closed` ([dm.js:468](../src/world/dm.js)). Stamp goes on the ledger entry meta
  (`{...,walk:{id,seg}}`) — additive, ignored by everything that doesn't read it.
- **Per-walk log:** `walk_advance` and `walk_complete` maintain `P.walkLog` (one entry per walked
  frontier: env, topology, segCount, `touched[]`, `finaleReached`, session).
- **Report:** new `walkProvenanceReport(w)` in `src/world/seam.js` (it already owns the wrap):
  ```js
  function walkProvenanceReport(w){
    const P = prepOf(w); const log = P.walkLog || [];
    const planned = (P.bundle ? P.bundle.environments.length : 0);
    const walked  = log.length;
    const segs = log.reduce((a,l)=>({ touched:a.touched+(l.touched||[]).length, total:a.total+(l.segCount||0) }), {touched:0,total:0});
    return {
      session: P.session, planned, walked,                 // 3 rolled, e.g. 1 walked
      finales: log.filter(l=>l.finaleReached).length,
      segmentsTouched: segs.touched, segmentsRolled: segs.total,
      consumption: segs.total ? +(segs.touched/segs.total).toFixed(2) : 0,   // the anti-drift ratio
      walks: log.map(l=>({ env:l.env, topology:l.topology, ran:`${(l.touched||[]).length}/${l.segCount}`, finale:l.finaleReached })),
    };
  }
  ```
- **Wrap surface:** `seamHarvest()` ([seam.js](../src/world/seam.js)) attaches the report to the
  carry-forward; `endSession` writes a `session`-type ledger line, e.g.
  *"Walks: ran 4/4 of The Gauntlet (urban, finale reached); 2 frontiers went unwalked."*

### Edge cases
- **A walk never entered** (rumored, never contacted): counts toward `planned`, not `walked` — that's
  the signal a frontier was offered and declined (feeds `prepRecycleStale` next session, already built).
- **Abandoned walk:** `finaleReached:false`, partial `touched` — shows as "ran 2/5, abandoned."
- Stamp is **best-effort**: a beat outside any active walk simply carries no stamp. Never throws.

### Verify (extend `dev/verify-walk-consumption.mjs`)
- After a walk to the finale, `walkProvenanceReport(w)` shows `walked===1`, `finales===1`,
  `consumption` between 0 and 1, and `walks[0].ran` matches touched/total.
- A beat event during the walk leaves a `walk:{id,seg}` stamp on its ledger entry.
- Zero contact → `walked===0`, `planned===3`.

### Done when
The wrap reports walk consumption every session, and you can read off exactly which segments of which
topology the DM actually ran. (This is the acceptance test for the whole feature.)

---

## 5. Step B — Advance / reskin on walk-complete

### Goal
When a walk is walked out, the DM routes the party to the **next** prepped walk and **reskins** it to
where they now stand — instead of forgetting walks or generating fresh space. The bundle already holds
three rolled walks, so "the next walk" is in hand; this just promotes it.

### Where it plugs in
- **Event:** new `walk_complete` `case` in `applyEvent`.
  ```
  { type:"walk_complete", payload:{ nodeId?, abandoned?:bool } }
  ```
  The DM emits this when the finale beat lands (or the party abandons the walk). Script verifies and
  records — it does not decide *when* (DM owns the beat; script owns the bookkeeping — same contract
  as the XP firing ladder, DM-CHARTER §8.3b).
- **On `walk_complete`:**
  1. `nodeId` defaults to `P.activeWalkId`. Mark `pn.cursor.done = true`; finalize the `walkLog`
     entry (`finaleReached = !payload.abandoned`).
  2. `P.activeWalkId = null` (party is now between walks — in town / on the road).
  3. **Promote the next walk:** pick the next bundle environment **not yet walked and not abandoned**
     (`P.nodes` whose `cursor` is absent/!done). Prefer one whose `hook.leadsTo` plausibly chains from
     the just-finished frontier; else next by index. Bind it as a fresh **soft rumored frontier** from
     the *current* node (reuse the exact soft-node + soft-edge mechanism from `startPrep`,
     [prep.js:112-122](../src/world/prep.js)), and flag it `needsReskin:true`.
  4. Emit a `session`-type ledger beat: *"One road ends; another rumor sharpens — [next frontier]."*
- **Reskin:** the DM, seeing `needsReskin` on the new frontier in its next handoff/digest, re-runs the
  Stage-2 reskin (SYNTHESIS-CONTRACT) re-pointed at the party's new location, and applies it back via
  the existing `prep_applied` event ([dm.js:563](../src/world/dm.js)). No new reskin machinery — Step B
  just *re-points* `applyPrep`'s overlay at a new frontier. `applyPrep` clears `needsReskin` when it
  writes the overlay.

### Interaction with the session seam
`walk_complete` is **intra-session** — it chains walks *within* a play session and never ends it.
The session seam ([seam.js](../src/world/seam.js)) still owns the *between-session* boundary
(`endSession` harvest → next-session shape). A walk completed mid-session promotes the next walk now;
a walk left unwalked at session end is recycled by `prepRecycleStale` next session (already built).
These two layers don't collide: seam = sessions, walk_complete = walks.

### Edge cases
- **All three walks walked in one session** (rare, short walks at low level): `walk_complete` finds no
  next environment → leave `activeWalkId` null and log prep-debt (`logPrepDebt`, already built) so next
  session's prep over-covers. The DM is told "no further rumor is sharp yet."
- **Abandoned, then returned:** the frontier node persists (locked to canon on first contact); a return
  re-enters via `lockOnContact`'s `already:true` path — re-set `activeWalkId` and resume the cursor.
- **Reskin never applied** (DM forgets): the new frontier still works off its *raw* rolls (the overlay
  is enrichment, not a dependency, per `applyPrep` being optional) — degraded, not broken.

### Verify (extend `dev/verify-walk-consumption.mjs`)
- Walk to finale → `walk_complete` → `activeWalkId===null`, a new soft frontier exists from the current
  node with `needsReskin===true`, and `walkLog[0].finaleReached===true`.
- `prep_applied` with an overlay for that frontier clears `needsReskin` and writes the briefing.
- Abandon path: `walk_complete {abandoned:true}` → `finaleReached===false`, next frontier still promoted.
- All-walked path → no promotion, a prep-debt ledger entry is written.

### Done when
Finishing a walk hands the DM the next one, reskinned to the party's location, with no fresh-space
invention — verified headless and confirmed over a multi-walk Bridge session.

---

## 6. Step E — Capture as re-entry  ⟵ the first real consumer

### Goal
On capture/subdual, drop the PC into a **holding segment of the active walk** (not a new prison),
nominate a **pre-cast NPC** as the potential escape lever, and start a **disposition clock that can
actually run out.** This is the Hungering Stone loop generalized: capture is an edge back into space
already rolled, with a lever already standing in it.

### Why it's small now
Step A gave us the active walk + cursor in state. Capture is mostly *re-pointing the cursor* at a
holding-type segment and lighting a clock. Engine owns the nouns (captor, cell, lever, gear-location);
DM owns the verbs (the captor's real motive and lies, whether the lever helps or betrays).

### Where it plugs in
- **Event:** new `capture` `case` in `applyEvent`.
  ```
  { type:"capture", payload:{ captorFactionId?, disposition?, holdingSeg?, leverId? } }
  ```
  All payload fields optional — the script fills any the DM omits.
- **On `capture`:**
  1. **Captor** = `captorFactionId` if given, else the **most-advanced hostile faction** by clock
     (`w.factions` sorted by `clock.filled/clock.size`, rel hostile) — the script already knows who
     hates the PC. Falls back to the dominant faction.
  2. **Holding segment** = `holdingSeg` if given, else scan the active walk's `segments` for a
     holding-shaped node (`segType`/`areaType` matching a small `HOLDING_TAGS` set — cell, pit, hold,
     cage, vault, strongroom, oubliette). If none, **mint one** appended to the walk (a single node,
     not a new walk) and set it as the cursor target. Move the PC there (`currentNodeId`), `seeNode`.
  3. **Lever** = `leverId` if given, else nominate a **pre-cast soft NPC** at this frontier
     (`pn.cast.npcIds[…]`, [prep.js:99](../src/world/prep.js)). Mark it (codex `dm.role:"possible-lever"`)
     — the DM decides ally-or-betray. Do **not** decide it in script.
  4. **Disposition clock** = `disposition` (ransom / interrogation / labor / execution-pending /
     trade-bait), else rolled. Open a **front with a clock** (reuse the pressure/clock machinery —
     `clock_advanced`/`clock_fired`, [dm.js:443](../src/world/dm.js)) whose fuse length is set by the
     disposition (execution-pending short, ransom long). **This clock must be able to fire** — per
     [[feedback-genesis-hard-and-dangerous]], a capture that can't go wrong is a free vacation.
  5. **Gear** = confiscate: `codex_update` the PC's carried items to `status.at = strongroom/jailer`
     (a recovery hook), or mark held-on-person if the disposition is sloppy (a rolled "what they
     missed"). Set PC condition `"captured"`.
  6. Stamp it all into the `walkLog`/ledger as a beat (so Step C's provenance shows the capture loop).
- **Escape** is then ordinary play: the cursor sits on the holding segment; the party walks back out
  through the same topology, the lever is a cast NPC, the clock ticks. No prison subsystem.

### Engine-owns-nouns roll table (the only new authored content)
A compact `CAPTURE` roll-set in `src/world/` (script-owned, not hand-narrated). Nouns only:

| Sub-roll | Owns | Notes |
|---|---|---|
| **Disposition** | the clock | ransom · interrogation · labor/sale · execution-pending · trade-bait · trophy. Sets fuse length. |
| **Holding** | the cell noun | only used if the active walk has no holding-type segment to reuse. |
| **Confiscation** | gear recovery hook | on the jailer · in a strongroom · sold already · kept by the boss · *they missed one item*. |
| **The opening** | one escape vector | sympathetic guard · loose bar · shift-change · the lever NPC · a tool they missed. |

The captor, the cell-when-reused, and the lever NPC are **not rolled here** — they're pulled from
live state (faction clocks, active walk, pre-cast). Only the four sub-rolls above are new dice, and
they exist to seed a *handle*, not a scene. (Mirror the bestiary/loot pattern: small d-tables, verbatim.)

### Edge cases
- **Capture with no active walk** (taken in town, before any walk): mint a one-node holding "walk"
  and set it active — capture becomes its own minimal walk, fully consistent with Step A.
- **No hostile faction:** captor = dominant faction or a rolled generic (watch/press-gang).
- **No pre-cast NPC free:** roll a jailer NPC as the lever candidate (engine mint, [[project-genesis-engine-owns-nouns]]
  on-demand mint with the tiering gate).
- **PC escapes before the clock fires:** front closes (`front_closed`) — Step C logs the loop as run.
- **Clock fires:** the disposition resolves against the PC (execution attempt, sold off, ransom
  default) — a real, hard consequence. Tune severity by margin/disposition, not auto-lethal.

### Verify (`dev/verify-capture.mjs`, new)
- `capture` with a hostile-faction world → captor = the most-advanced hostile faction; PC condition
  `"captured"`; PC at a holding node that is a segment of the active walk (reused, not minted) when one
  exists.
- Holding mint path: active walk with no holding segment → exactly one node minted, cursor points at it.
- Lever is a pre-cast NPC id from `pn.cast.npcIds`; gear items moved to a recovery location.
- Disposition opens a front with a **finite, fireable** clock; `clock_fired` resolves the disposition.
- Capture with no active walk → a one-node holding walk is created and set active.

### Done when
A capture in play lands the PC inside the walk already in motion, beside a cast lever, under a ticking
disposition clock — no new prison, no freehand — verified headless and confirmed in a Bridge playtest
that reproduces the Hungering Stone shape from rolled handles.

---

## 7. Registration, gates, and rollout

- **Manifest:** register any new symbols in `manifest.json` `owns` (`activeWalkDigest`,
  `walkProvenanceReport`, `walkStamp`, `pbundleSegCount`, `pbundleLegCount`, the `CAPTURE` table and
  its roller, plus the new `applyEvent` types are owned by `dm.js` already). New `dev/verify-*.mjs`
  harnesses are dev-only (not loaded by `genesis.html`) — register per the existing verify-script
  convention. **Run `python3 build/check-manifest.py` after every module edit** (CLAUDE.md).
- **EVENT-CONTRACT:** add `walk_advance`, `walk_complete`, `capture` to [docs/EVENT-CONTRACT.md](EVENT-CONTRACT.md)
  with payload shapes; all three are forward-compatible no-ops when prep is unavailable (the
  `default` case already warns, [dm.js:579](../src/world/dm.js)).
- **DM-CHARTER / DM-BRIDGE:** the DM loop needs to be *told* to read `digest.activeWalk` and emit
  `walk_advance` / `walk_complete` (and `capture` on subdual). This is a prompt-contract change in the
  Bridge runbook ([docs/DM-BRIDGE.md](DM-BRIDGE.md)) — without it, Step A's data is present but unread.
  **This is the make-or-break wiring; ship it with Step A, not after.**
- **Docs coherence (CLAUDE.md discipline):** on landing, update `docs/SESSION-PREP.md` §8 (mark
  consumption built), `docs/CHANGELOG.md`, `docs/HANDOFF.md`, `docs/NEXT-STEPS.md`, and the Cowork
  auto-memory ([[project-genesis-session-prep]]) together.

## 8. Open questions (tune in playtest)
- **Cursor advance trust:** is `walk_advance` DM-emitted (current spec) reliable enough, or should the
  script infer advancement from `seeNode`/`discovery` beats? Start DM-emitted; measure drift.
- **Promotion plausibility (Step B):** how hard should "next walk chains from this frontier" try to be
  — geographic plausibility, or just thematic? Start index-order with a hook-`leadsTo` nudge.
- **Length curve breakpoints (Step D):** the 3→7 / 3→5 ramps are provisional; watch session length.
- **Disposition lethality (Step E):** how often should the clock actually fire vs. the party escape
  first? Pressure-test against "too safe?" ([[feedback-genesis-hard-and-dangerous]]).
- **Capture frequency:** capture should be *rare* and earned (a real failure state), not a common
  branch — gate the trigger so it doesn't become routine.
