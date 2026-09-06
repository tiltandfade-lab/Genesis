---
type: system-spec
status: implemented v1; extended by beat-digest/v1 on 2026-08-04
created: 2026-07-01
related:
  - "[[DM-BRIDGE]]"
  - "[[CODEX]]"
  - "[[WALK-CONSUMPTION]]"
  - "[[ON-DEMAND-GEN]]"
  - "[[SPECULATIVE-PREFETCH]]"
---

# Digest Diet — stop re-shipping the world every turn

## §0. The evidence (live session, 2026-07-01, 16 turns)

Measured from `.dm/turn-*.json`: each turn posted ~63 KB (~16k tokens); the digest was 48.5 KB of
that; **the `codex` block was 42.9 KB — byte-identical across all 16 turns** (88% of the digest,
re-serialized unchanged every time ≈ ~180k input tokens of duplicate bytes). The DM `/loop` is one
long conversation, so turn N re-reads all prior turns — with multi-minute turn gaps the prompt
cache (5-min TTL) is cold, making the session cost roughly **quadratic in turn count** (~2M input
tokens tonight, mostly a static world snapshot). `sessionLean` re-shipped its rule prose every
turn; the runbook has the DM re-loading charter/SRD material per turn.

**Root cause:** the digest was designed *complete-every-turn* so the DM could be stateless
(`handToDM`'s JSON twin), but the loop DM is stateful — we pay for statelessness AND statefulness.
Mechanization made the *output* cheaper and drift-proof; the bill is input transport. The fix is
the retrieval-layer principle already in `NEXT-STEPS` (SRD-Data: fetch-by-key, never bulk-load),
applied to the digest itself.

## §1. Scope the codex block — here-and-now full, everything else a roster line

`codexDigest(w)` → `codexDigest(w, opts)` producing two tiers:

- **`codex` (full records)** — only the *here-and-now set*:
  1. records with `status.at` = the current node (or at a node of the active walk),
  2. the active walk's cast (`pn.cast` ids),
  3. everything in `w.dm.mintQueue` (the ON-DEMAND-GEN spotlight — minted records are always full),
  4. records **touched since the last acknowledged turn** (§2 delta).
  Full shape unchanged (fields + dm + links + attitude).
- **`codexRoster` (one-liners)** — every other record as
  `{id, kind, name, at, known}` — enough for the DM to remember it exists and pull it on demand.
  No `fields`/`dm`/links.

Bounded: the here-set tracks scene size (~5–10 KB) regardless of world size; the roster grows
~40 bytes/record instead of ~1.4 KB.

**On-demand pull:** the full store is already one read away — the app `postState()`s `state.json`
(370 KB) every turn. New tiny **`dev/peek-state.py`**: `codex <id>` / `codex --kind npc` /
`ledger -n 12` / `walk` — filtered JSON to stdout so the DM **never raw-reads `state.json`**
(a raw read ≈ 90k tokens; the runbook forbids it).

## §2. Delta — ship only what changed

- Records gain **`touchedSeq`** (monotonic, same counter as mint `seq`), bumped by `codexAdd`,
  `codexUpdate`, `codexContact`, `codexLink` (both endpoints), `codexSetAttitude`/`codexSetTerrified`.
- `w.dm.digestAckSeq`: set in `applyResponse` to the max `touchedSeq` that rode the turn being
  answered (the DM demonstrably saw it). Persisted; survives reload.
- The here-and-now set (§1.4) = records with `touchedSeq > digestAckSeq`. A crashed/unanswered turn
  never advances the watermark, so nothing is lost.

## §3. Send-once statics

- **`setting`** (393 B but every turn) → prep handoff + world-founding turn only; drop from the
  per-turn digest. The DM holds tone in-conversation; a loop restart re-reads it via bootstrap (§4).
- **`sessionLean.rule`** (the ~700-byte override-hierarchy prose) → replace per-turn with
  `rule:"lean-for-lulls; player→situation→lean (see handoff)"`; the full prose lives in the prep
  handoff + `DM-BRIDGE.md`. The lean/weave data stays per-turn (it's small and load-bearing).
- **`activeWalk`** — keep it EVERY turn (the WALK-CONSUMPTION lesson stands: out of digest = out of
  mind) but slim the steady-state: cursor + the `"here"` segment (gist+reskin+effectDie when built)
  + `{num,label,state}` stubs for the rest. Full segment detail rides on walk start / promotion /
  `needsReskin` — the moments the DM actually plans from.
- **Audit the turn envelope:** tonight's turns carried ~14.8 KB *outside* the digest
  (`63,331 − 48,540`) — find it (`sendTurn`'s object is small; suspect rolls/log stowaways or
  duplicated fields) and cut anything redundant.

## §4. DM-loop hygiene (runbook — ⚠ `DM-BRIDGE.md` edits land with the build, never mid-live-session)

- **Bootstrap once per loop session:** on loop start, orient via `dev/peek-state.py` (scoped
  queries), the prep handoff, and the charter/rules — ONCE. Per turn, read only the (now-lean)
  turn file. Kill the per-turn SRD/charter re-loads; pull SRD records by key only when a spell/
  monster actually comes up.
- **Compaction guidance:** restart/compact the loop conversation every ~15 turns; the lean digest
  + bootstrap makes a restart cheap (this is what the fat digest was accidentally insuring against).
- **Narration budget:** the TurnRequest now carries a hard `narrationBudget`: routine fast
  **60 target / 75 max**, pre-resolved mechanics **50 / 70**, deep **110 / 160**. Output tokens are
  generation time; a beat that needs more must be routed deep rather than silently overrunning fast.
- Keep the fast-lane discipline (leg 1): `dmTriage` already routes routine beats to Sonnet — the
  diet multiplies with it, not instead of it.

## §4b. The measuring instrument — `dev/session-cost-report.py`

One read-only script over `.dm/` + `state.json` (extends tonight's ad-hoc audit), reporting per
session: **per-turn payload bytes by digest block** (the §0 table, reproducible) · **latency
percentiles** (from the dmlog `latencyMs` — tonight: median 58s / max 247s) · **lane distribution**
(fast vs deep from the turn stamps — tonight's join failed; make turnIds line up) · **narration
lengths** · **turn classification** (check-resolve / dice-only / shop-adjacent / travel / freeform).
The classification answers "which turns needed a DM at all" — if a large share prove mechanical,
that's the trigger to spec auto-resolve classes (a DECISION GATE for Adam, not a build item here).
Safe during live play (read-only, never touches the mailbox).

## §5. Non-goals

- No bridge/endpoint changes; no new events. `postState` unchanged.
- No player-facing changes of any kind.
- Not P2 prefetch (that ADDS background LLM spend; P1-only stands, per ON-DEMAND-GEN §7).
- The legacy `gazetteer` block (854 B) stays for now — subsumed later when the codex fully owns it.

## §6. Build plan (Sonnet-executable except the runbook prose)

1. `touchedSeq` bumps in `src/world/codex.js` (§2) + `digestAckSeq` in `applyResponse`.
2. `codexDigest` scope+roster split (§1) + `dmDigest` wiring (`codex`/`codexRoster`, slim
   `sessionLean`, drop `setting` per-turn, slim `activeWalk` steady-state) (§3).
3. `dev/peek-state.py` (§1).
4. Turn-envelope audit (§3 last bullet).
5. `dev/session-cost-report.py` (§4b) — the instrument; also fix the turn-stamp↔dmlog turnId join
   so lane distribution is measurable.
6. **Frontier-tier prose:** `DM-BRIDGE.md` — the two-tier codex contract, peek-state protocol,
   bootstrap-once + compaction runbook, never-raw-read rule, narration budget (§4).
7. `dev/verify-digest-diet.mjs` + gates (§7). `check-manifest` after module edits.

## §7. Verification

1. A record at another node appears in `codexRoster` only; at the current node → full `codex`.
2. `codexUpdate` on a far record → it rides full next digest (delta); unanswered turn → watermark
   holds; answered → drops back to roster.
3. `w.dm.mintQueue` members always full (the ON-DEMAND-GEN §2 contract).
4. `setting` absent per-turn, present in the founding/handoff payload; `sessionLean.rule` is the
   stub; `activeWalk` carries the current segment plus actionable detail for its immediate graph
   exits, while farther-ahead and behind segments remain stubs. This is the minimum a memoryless DM
   needs to narrate crossing a boundary without inventing the arriving room.
5. **Size regression guard:** a fixture world with 50 codex records + an active walk → digest
   < 12 KB (tonight's equivalent: 48.5 KB). This assertion is the spec's whole point — keep it.
6. `peek-state.py codex <id>` returns one record; `--kind npc` filters; bad id exits nonzero.
7. Attitude/terrified writes bump `touchedSeq` (mutation check: remove one bump, harness fails).
8. Full regression sweep (30+ harnesses, 0 failed — `verify-dm-events`/`verify-walk-consumption`/
   `verify-seam` especially: they consume `dmDigest`) + `check-manifest` OK. Re-run gates yourself.

## §8. Acceptance

- Next live session: per-turn payload ~3–4k tokens (vs ~16k tonight); the codex block no longer
  appears N times identical in `.dm/` (`python3 - <<'EOF'` size-audit from tonight is the measuring
  stick — keep it as a one-liner in the runbook).
- The DM still narrates from atoms (scoped digest never starves the current scene) and still tracks
  the walk (`here` always present).
- Session cost drops roughly an order of magnitude before model-routing savings.

## §9. 2026-08-04 extension — beat-shaped ordinary turns

The v1 diet made the complete world digest lean enough to bootstrap and inspect. It did not make
that complete snapshot the right ordinary turn packet. `src/world/dm-digest.js` now projects
`beat-digest/v1` from the full `dmDigest()` without taking ownership of any game rule or state:

- every turn selects exactly one deterministic view: `scene`, `inventory`, `combat`, `travel`, or
  `social`;
- current PC/scene, the hottest story pressure, and newest continuity consequence remain invariant;
- view-specific state rides only when relevant, while a named off-scene Codex noun is retrieved
  before projection. `actionCodexIds` records identities actually named now; `continuityCodexIds`
  carries a bounded two-turn anaphoric bridge and cannot refresh itself indefinitely;
- `retrieval.omitted` makes absence explicit: omitted canon remains authoritative and is not a
  license to invent or contradict it;
- ordinary scene/social/inventory/travel fixtures are structurally fitted to a 3 KiB target;
  load-bearing live combat truth may exceed the target rather than be silently discarded;
- full `dmDigest()` remains the compatibility, session-bootstrap, and debug surface.

The projector now also keeps bounded inventory truth in a composite inventory+social action, treats
`pouch`, `satchel`, `bag`, and `belongings` as inventory vocabulary, and excludes unrelated legacy
transfers unless the action explicitly asks about loss, theft, confiscation, recovery, or legacy.
Exact `Where is <item> now?` custody questions bypass the model; consequential clauses remain open.

A combat-shaped action before `combat_start` is a hybrid beat, not permission to erase its scene:
the combat-capable PC slice rides alongside the active walk's current segment and graph-reachable
exits. Once combat is actually live, the combat tracker remains the sole tactical scene packet.
Current-segment resolution overlays and immediate graph-exit previews survive fitting. Complex live
transition/critical packets may exceed the 3 KiB ordinary target rather than hide those truths. The
95-turn Brineglass soak measured 52 model-shaped packets at 5,185 bytes average, 8,542-byte p95, and
8,759-byte maximum. Those measurements are an explicit compaction target, not permission to truncate.

The completed-walk pass also closed two identity gaps. A combat-shaped spell action remains a hybrid
walk packet until combat actually exists, and an explicitly retrieved place carries its verified
`mapNodeId` so the DM can request real movement without guessing between Codex and map namespaces.
Authored finale/reward detail and actual graph totals remain protected through the final transition.

`dev/verify-beat-digest.mjs` holds the 55-case size, relevance, knowledge, retrieval, continuity,
composite-action, immediate-walk-preview, determinism, authority, compatibility, and real-turn
integration proof. The replay corpus and live Brineglass repair soak remain zero-provider gates;
provider selection stays downstream of them.
