---
type: system-spec
project: Genesis
status: SPEC — Adam's architecture ruling 2026-07-08, drafted by Fable, awaiting review
created: 2026-07-08
origin: Adam — "If I engage the hidden sword in the marsh, that should create a walk that ends
  in the marsh — and that's pretty much how ALL the NPC-initiated quests should run. The walk
  should be relative in length to the reward at the end of it."
related:
  - "[[JOB-WALKS]]"
  - "[[TRAVEL-WALKS]]"
  - "[[NPC-PRESENCE-AND-HOOKS]]"
  - "[[ANIMAL-SOCIAL]]"
  - "[[SPATIAL-MODEL]]"
  - "[[LOOT-REMAP]]"
  - "docs/ON-DEMAND-GEN.md"
---

# HOOK-WALKS — engaging a place-thing hook mints the walk that ends at it

## §0 The law (Adam's ruling, 2026-07-08, near-verbatim)

> "If I engage the hidden sword in the marsh, that should create a walk that ends in the marsh —
> and that's pretty much how ALL the NPC-initiated quests should run. The walk should be relative
> in length to the reward at the end of it."

**When the player ENGAGES a hook whose referent is a PLACE-THING** — the kid's sword in the creek,
the animal's dug-up spot, the NPC's rumor of the sunken chapel, a secret-geography row — **the
engine mints a walk that TERMINATES at the referent.** The hook is a promise; the walk is the
promise's price. The referent does not spawn in the player's lap and it does not float ambiguously
"somewhere" for the DM to improvise — the engine owns the distance, the danger, and the arrival,
exactly as it already does for jobs and travel.

This is the JOB-WALKS pattern generalized: `jobWalkAccept` (src/world/job-walks.js:158) already
proves the whole chain — accept → mint destination node → roll a real walk via the env-appropriate
roller → `walk.kind` tag → prep-slot storage → `walkSetActive` → a `kind:` branch in
`walkComplete` pays out. Hook-walks are the same machinery with a different payload at the end:
**the referent instead of a paycheck.** Reuse, don't fork.

### What counts as a place-thing hook (routing gate)

A hook routes into this system iff its referent is a *thing at a place that is not here* —
detectable mechanically as: the hook/tell record carries (or the DM binds, per the existing
`animal-tell` pointer contract) a `referent` whose `status.at` is unset-or-elsewhere, or whose row
family is secret-geography/cache/lair. Hooks whose referent is a person *in this scene*, a social
situation, or an abstract want stay in the existing presence-and-hooks attention machinery
(NPC-PRESENCE-AND-HOOKS Component 4) untouched — not everything is a fetch-quest, and the
three-tier attention model remains the default consequence engine.

## §1 Reward-scaled length — the script owns the price

**The walk's length derives from the reward's band. The DM never eyeballs it.**

Two reward axes already exist; both feed one mapping:

- **Item band** (LOOT-REMAP rarity axis): common / uncommon / rare / very-rare (T2 cap).
- **Spice band** (narrative-weight referents — a revelation, a breach-thing, a secret place):
  Grounded / Strange / Volatile / Mythic.

**`HOOK_WALK_LENGTH`** (engine constant, `XP_TUNE`-posture — provisional until felt):

| reward band | segments | threat | notes |
| --- | --- | --- | --- |
| trinket / common / Grounded | 1 | tier | one scene out; the creek IS nearby |
| uncommon / Strange | 1d2+1 (2–3) | tier | a real errand |
| rare / Volatile | 1d3+2 (3–5) | tier+0–1 | a trek with teeth |
| very-rare / Mythic-chain entry | 1d4+3 (4–7) | tier+1 | an expedition; road danger is the price |

Where a referent carries both axes, **the higher band wins.** Segment counts ride the same
budget/encounter machinery every walk already uses (`rollWildernessWalk` legCount /
`rollDungeonWalk` segCount + `dwalkBudget` / `rollUrbanWalk`) — hook-walks add **no new encounter
math**, only the segment-count-from-band mapping and the referent bound to the finale segment
(the `objectiveRef` pattern jobs already use, so the finale's combat XP bonus fires for guarded
referents for free).

**The inverse guard (binding, verify-enforced):** the mapping is clamped both ways —
- a **Mythic/very-rare referent can never be ≤2 segments away** (min 4). If the story demands the
  Mythic thing be *close*, that's a breach event, not a hook-walk — different system, on purpose.
- a **trinket can never cost a dungeon** (max 1 segment for the bottom band). A kid's lost toy is
  one scene, not an odyssey — or the DM shouldn't have routed it here at all.

Danger scales *with* length via threat tier as tabled; no separate danger dial (band ≠ legs
elsewhere in the corpus, but here the walk-length die IS the band's one mechanical expression —
the Consequence-Ladder's demand-not-supply discipline).

## §2 Source routing — who feeds this, and through what seam

Sources (all existing or in-flight systems; this spec adds the routing, not the content):

| source | referent shape | where it lives today |
| --- | --- | --- |
| NPC hooks (d300, `ensureSceneHook` / discovery draws) | rumor/secret-place rows | NPC-PRESENCE-AND-HOOKS C3; `src/world/prep.js` |
| kid partials — "the kid who saw the thing" | the thing, at the place it was seen | NPC-PARTIALS |
| animal tells → witness packets | `witness.tell.boundTo` — the tell's referent; place-memory entries | ANIMAL-SOCIAL §2 (unmerged sibling) |
| NPC want/leverage levers | the thing the want points at, when it's a place-thing | craft-pass-2 tables |
| codex rumors / secret-geography rows | a place record with `status.soft`, unvisited | CODEX |

**The seam is the gen[] handshake** (ON-DEMAND-GEN §1) — the existing DM→engine generation
channel. New kind: **`hookwalk`**:

```jsonc
"gen": [ { "kind": "hookwalk", "opts": {
  "referentId": "item:the-marsh-sword",   // codex id of the promised thing (minted first if needed)
  "hookRef": "npc:brindle-hask#hook",     // provenance — which hook was engaged
  "band": "rare",                          // item rarity OR spice band; engine maps to length
  "env": "wilderness"                      // urban | wilderness | dungeon (tell/row-inferred)
} } ]
```

Applied in `applyResponse` after events, same as other kinds: fires **`hookWalkMint(w, opts)`**
(new, `src/world/` beside job-walks) which does the `jobWalkAccept` dance — mint/locate the
destination node, roll the env-appropriate walk at `HOOK_WALK_LENGTH[band]` segments,
`walk.kind="hook"`, bind `referentId` to the finale, store in `P.nodes`, `walkSetActive`, ledger
line, feed chip. `dmTriage` needs no new lane — engaging a hook is already deep-lane shaped, and
the gen ride-along costs nothing.

Why DM-initiated rather than auto-fired on `codex_contact`: "engage" is a judgment call (the
touched-&-kept threshold, NPC-PRESENCE-AND-HOOKS C4) that the DM already makes; the engine
enforces everything downstream of that call. Same division as everywhere: DM owns the verb
(engaged), engine owns the nouns (where, how far, how dangerous, what's there).

## §3 Lifecycle

- **Minted when ENGAGED, not when heard.** Hearing the rumor / seeing the tell costs the world
  nothing (no node, no walk, no littering — same lazy discipline as ambient stubs). Only the
  touched-&-kept commitment mints. A discovered-but-dropped place-hook follows the ordinary
  one-shot if-ignored path (someone else finds the sword; the ledger says so, diegetically).
- **The reward is canon once minted; the path is not until walked.** On mint, the referent gets a
  codex record (`provenance:"rolled"`, soft until contact) — the sword in the marsh now *exists*
  and cannot quantum-tunnel away. The walk's segments stay veiled ahead-of-here as all walks do;
  un-walked segments of an abandoned hook-walk are not canon and may be re-rolled (the road's
  events are never canon — TRAVEL-WALKS §2 precedent).
- **Abandonment:** `{abandoned:true}` = turn back (TRAVEL-WALKS semantics): party returns to
  origin conceptually, clock keeps walked segments, ledger notes it. The referent record
  PERSISTS (canon), the prep slot persists with the cursor.
- **Re-engage: RESUME, recommended.** Walked segments are canon (you've seen that road); the
  cursor picks up where it stopped, but staleness applies — on re-engage after ≥1 world-turn,
  re-roll the *un-walked* segments (the world moved; the anti-quantum-ogre principle) and let
  the if-ignored ratchet on the hook thread raise the threat of the re-rolled remainder by one
  step per staleness window. Re-minting from scratch would erase canon (the segments walked) and
  double-charge the player; resume-with-decay keeps both truths — your progress is real AND the
  world didn't wait. *(Flagged for Adam, §7.)*
- **Completion:** the `walkComplete` `kind:"hook"` branch (beside the `kind:"job"` branch in
  `src/world/prep.js`) surfaces the referent — `codex_contact` locks it; pickup is the ordinary
  `item_changed` flow (ON-DEMAND-GEN §5 posture; the engine never touches the sheet directly for
  items). Non-item referents (a place, a revelation) lock their codex record and the hook thread
  closes resolved.

## §4 The parked alternative — branch-node-on-existing-walk (documented, NOT adopted)

Adam considered the inverse: when a hook fires while a walk is already active (or about to be),
spawn the referent as an **optional branch node** grafted onto that walk — a side-path off segment
3, take it or not. He leaned away: **"the math there is less clear and that creates missed
opportunities and backtracking."** Unpacked:

- *Unclear math:* the reward-scaled-length law (§1) has no clean expression when the referent
  rides someone else's walk — the branch's cost is whatever segment it happens to hang off, so a
  Mythic reward could end up one detour from the road, violating the inverse guard by accident.
- *Missed opportunities:* an un-taken branch is a visible hole — the game manufacturing regret
  about content it chose to place, versus the engaged-mint model where nothing exists until the
  player commits.
- *Backtracking:* branches invite "finish the walk, then walk back to segment 3," which the
  node-graph/walk grammar handles poorly (walks are consumed forward).

**Parked, not killed.** What would revive it: a genuinely *incidental* discovery class — things
stumbled over mid-walk that were never promised (the effect-die's discovery faces, a wilderness
segment's discovery type), where "optional, right here, small" is the honest shape and
reward-scaling doesn't apply because the reward is capped small. If revived, it returns as a
**secondary pattern for trinket-band incidental finds only**, never for engaged hooks — the two
patterns would then partition cleanly by band.

## §5 Wilderness-walk accommodation (Adam's flag)

Adam: "we might need to modify the wilderness walk to accommodate this system." What it needs:

1. **A terminating referent.** `rollWildernessWalk` today ends where the legs run out; it needs an
   `opts.referent` that binds the finale leg — the finale's discovery/objective slot carries the
   referent instead of a rolled discovery, and its sensory/sign-of-passage atoms should point AT
   it (you smell the marsh before you reach the sword). Mirror of the dungeon walk's
   objectiveRef finale binding; small extension, not a fork.
2. **Tracking, not dungeon-crawling.** A wilderness hook-walk's segments should read as a
   *pursuit gradient*: each leg's existing `sign-of-passage` / `survival` atoms are re-aimed at
   the referent (the trail warms leg by leg). Implementation: when `kind:"hook"`, thread a
   `trailOf: referentId` opt through `wwalkEncounter` so sign-of-passage rolls bias toward the
   referent's kind (tracks, spoor, the animal's dug earth). One biased table-pick, not new tables.
3. **Animal-tell referents resolve to wilderness places.** ANIMAL-SOCIAL's witness packet names
   the destination: `witness.tell.boundTo` and place-memory entries ("the place-we-don't-go") ARE
   hook-walk seeds — the interview is the engagement surface, and a befriended ally's
   lead-to-referent guided walk (ANIMAL-SOCIAL §4) is *this walk* with the ally as escort
   (soft-recall seam), possibly at −1 segment (the guide is the reward of the friendship).
4. **Biome honesty.** The referent's node pins to real hex terrain (SPATIAL-MODEL): legBiomes
   sample the origin→referent hex line as travel walks do (`travelLegBiomes`) — the marsh sword's
   walk actually crosses toward marsh.

## §6 Build units (Sonnet-executable; branch per house rules; red-first in the jsdom harness)

**U1 — `HOOK_WALK_LENGTH` + band mapping.** Engine constant (beside `XP_TUNE`): band → segment
die + threat mod, both clamps. Pure fn `hookWalkLength(band)`.
*Accept:* 500 draws per band land inside the table's bounds; "mythic" never <4; "common" always 1.
*Red-first:* fn absent.

**U2 — `hookWalkMint(w, opts)`** (`src/world/job-walks.js` sibling or same module). The
`jobWalkAccept` dance with: referent codex mint/lookup (soft, canon), destination node
(`addNode` + `rollRoute`/`addEdge` off-city, per env), env-appropriate roller at
`hookWalkLength(band)` segments, `walk.kind="hook"`, `referentId` on the finale +
`objectiveRef`, `P.nodes` slot `kind:"hook"` (cursor, originNodeId), `walkSetActive`, ledger +
chip. `check-manifest.py` after.
*Accept:* mint → active walk, correct segment count, referent record exists + soft, finale
carries referentId; no clobber of existing prep slots (the job-walks:188 collision lesson —
always `addNode`).
*Red-first:* no such function; a place-hook engagement today produces no walk.

**U3 — `gen[]` kind `hookwalk`.** Register in the `applyResponse` gen loop (ON-DEMAND-GEN §1
posture: unknown-kind no-op preserved, cap-4 shared). Routes to U2.
*Accept:* a TurnResponse with the §2 payload mints exactly one hook-walk + one chip; malformed
band → logged no-op.
*Red-first:* kind unknown today → no-op (assert, then build).

**U4 — `walkComplete` `kind:"hook"` branch** (`src/world/prep.js`, beside `kind:"job"`).
Surface referent (digest spotlight via `w.dm.mintQueue`), `codex_contact` lock on player contact,
thread resolved; NO direct sheet mutation (items go `item_changed`).
*Accept:* completing the walk puts the referent in the next digest; abandoning does not; job and
travel branches byte-identical (regression).
*Red-first:* completing a `kind:"hook"` walk today falls through to the wrong branch.

**U5 — abandon/resume + staleness decay.** Abandon = turn-back semantics; re-engage resumes
cursor; ≥1 world-turn stale → re-roll un-walked segments, threat +1 per staleness window
(reuse `ignoredRolls`).
*Accept:* walked segments identical across abandon/resume; un-walked segments differ after a
world turn; threat monotonically non-decreasing; referent record survives throughout.
*Red-first:* resume path absent.

**U6 — wilderness accommodation** (§5): `rollWildernessWalk` `opts.referent` finale binding +
`trailOf` sign-of-passage bias + `travelLegBiomes` toward the referent node.
*Accept:* finale leg carries the referent; sign-of-passage atoms on `kind:"hook"` walks
reference the trail bias over N trials; non-hook wilderness walks byte-identical.
*Red-first:* opts ignored today.

**U7 — ⚠ FRONTIER-TIER PROSE (not Sonnet):** DM-BRIDGE runbook — when to fire `hookwalk`
(the engage threshold, place-thing gate, band selection from the hook's row/reward), never
narrate arrival-at-referent without `walk_complete`, never teleport. Do NOT edit DM-BRIDGE.md
mid-live-session.

Order: U1 → U2 → U3/U4 (parallel) → U5 → U6 → U7. `dev/verify-hook-walks.mjs` covers U1–U6;
full regression sweep + check-manifest at land; register in DESIGN.md/NEXT-STEPS at merge time
(shared-doc serialization rule). Never trust self-reported green.

## §7 Adam's rulings needed

1. **Resume vs re-mint** on re-engagement — §3 recommends resume-with-staleness-decay; taste call.
2. **The length table's numbers** (§1) — provisional dice; felt-test in a live playtest before lock.
3. **Spice-band referents at the top:** should a Mythic hook-walk's finale be allowed to open a
   *chain* (Consequence-Ladder) rather than a thing — i.e., the walk ends at the first link, not
   the payoff? (Recommended yes; matches Mythic = forever-chain calibration.)
4. **The befriended-animal guide discount** (§5.3, −1 segment) — reward or exploit?
5. **Revival trigger for the parked branch pattern** (§4) — bless the "trinket-band incidental
   finds only" carve-out now, or leave fully parked?
