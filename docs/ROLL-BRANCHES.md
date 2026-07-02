---
type: system-spec
status: specced 2026-07-01 — build-ready; lands with/right after DIGEST-DIET, before the ON-DEMAND-GEN run
created: 2026-07-01
related:
  - "[[DM-BRIDGE]]"
  - "[[DIGEST-DIET]]"
  - "[[SRD-MECHANIZATION]]"
  - "[[CRIT-MAGNITUDE]]"
  - "[[EVENT-CONTRACT]]"
---

# Roll Branches — the check resolves the moment the dice land

## §0. Why

Every skill check today costs **two full DM inferences**: turn A asks (`rollRequest`), turn B
narrates the result. Tonight's telemetry: median turn 58s — so every check adds ~a minute of
"the DM is considering" *after* the dice have already decided. But the DM knows the DC and the
stakes when it asks. Let it write the futures up front: `rollRequest` optionally carries
**pre-declared branches** (narration + pre-authorized events per outcome degree); the app resolves
**instantly and locally** when the player rolls. Zero second inference; the dice pay off the moment
they stop.

**Authorship is preserved — this is anti-drift-positive:** the DM authored every branch before the
roll; the script picks by margin (it already owns the margin ladder — `resolveCheck`,
SRD-MECHANIZATION §1); the DM can never nudge a result after seeing the dice, because it isn't
there. The player-rolls-openly contract is untouched.

## §1. The contract — `rollRequest.branches`

```jsonc
"rollRequest": {
  "skill": "Athletics", "ability": "str", "dc": 13, "dcHidden": true, "adv": null,
  "branches": {                                   // OPTIONAL — absent = today's two-turn flow
    "success":  { "narration": "…you haul yourself over the lip…", "events": [] },
    "nearMiss": { "narration": "…your fingers catch — barely; the ledge crumbles behind you…",
                  "events": [ { "type":"condition_add", "payload":{…}, "source":"declared" } ] },
    "fail":     { "narration": "…the wall sheds you; the fall bites.",
                  "events": [ { "type":"hp_changed", "payload":{"delta":-5}, "source":"declared" } ] }
  }
}
```

- **Degrees = the existing margin ladder** (`resolveCheck`, and Adam's degrees-of-failure rule:
  near-miss grace is TIGHT — miss by 1–2 = `nearMiss`, miss by 3+ = `fail`). `success` covers
  meet-or-beat. No new resolution math — the app calls the real `resolveCheck`.
- **`dc` must be present when `branches` is** (the app can't resolve without it); `dcHidden`
  still controls whether the player ever sees the number (they don't — they see the outcome).
- **Nat 20 / nat 1 ALWAYS falls through to the live two-turn flow** — crit/fumble magnitude
  (`CRIT-MAGNITUDE`) demands the second d20 and the DM's lens narration. Rare, and those beats
  *deserve* the inference. Branches are for the routine middle.
- **`rollRequest.dice` (damage/heal) never branches** — no DC, nothing to resolve against.
- Branch `events` are ordinary `EVENT-CONTRACT` envelopes, applied through the same `applyEvent`
  runtime, stamped `source:"branch"` in the ledger so provenance is auditable. The DM should keep
  them to immediate consequences (hp/conditions/clock ticks) — a branch is a beat, not a scene.

## §2. App-side resolution (`dmRollFor`, `src/world/dm.js`)

When the pending `rollRequest` has `branches` and the die is natural 2–19:

1. Roll exactly as today (adv/disadv pair, overlay theater, open math toast).
2. `resolveCheck(total, dc, …)` → degree → pick `success`/`nearMiss`/`fail` (a missing key falls
   back: `nearMiss`→`fail`'s branch if absent; if the needed branch is missing entirely, fall
   through to the live flow — never invent).
3. Render the branch narration in the feed **as the DM's voice**, streamed like any narration,
   with a small `⚄ resolved by the dice` marker on the entry.
4. `events.forEach(applyEvent)` (stamped `source:"branch"`), chips as normal, `saveU`, `postState`.
5. **No turn is posted.** `GS.dm.rollReq` clears; the player acts next as usual.
6. The **next** player turn carries `lastResolution:
   { turnId, skill, total, degree, branch:"nearMiss" }` in the envelope (and the branch narration
   is already in the dmlog the DM can see) — so the DM re-enters knowing exactly what happened.

Nat 20/1 (or no branches): today's behavior verbatim — roll rides the next turn, DM narrates live.

## §3. Runbook rules (frontier-tier prose; lands in `DM-BRIDGE.md` with the DIET/this build — ⚠ never mid-live-session)

- **Branch routine checks; keep dramatic ones live.** If the outcome would change what you'd
  narrate *beyond this beat* (a reveal, a death spiral, a front closing), don't branch — ask bare
  and take the live turn. If it's "does the climb/sneak/haggle beat land," branch it.
- Write branches in the same voice, 1–3 sentences each; put the cost in the narration AND the
  event (the hp_changed rule: say the number out loud).
- You still may not roll for the player, pick the branch, or revise a fired branch — the ledger
  shows `source:"branch"` and the wrap report counts them.
- Branch events are immediate consequences only; open a thread/scene in your NEXT live turn off
  `lastResolution`, not inside a branch.

## §4. Build plan

1. `applyResponse`: accept + persist `rollRequest.branches` (validate shape; a malformed branch
   set logs + strips to a bare rollRequest — never blocks the check).
2. `dmRollFor`: the §2 resolution path (reuse `resolveCheck`; crit fall-through; missing-branch
   fall-through).
3. Feed rendering: DM-voice entry + `⚄ resolved by the dice` marker; ledger stamps
   `source:"branch"`.
4. `sendTurn`: attach `lastResolution` (clears after riding one turn).
5. **Frontier-tier:** the §3 runbook prose + the contract block in `DM-BRIDGE.md`.
6. `dev/verify-roll-branches.mjs` + gates; `check-manifest`.

## §5. Verification (`dev/verify-roll-branches.mjs`)

1. Branched request + total ≥ DC → success narration in feed, 0 turns posted, events applied with
   `source:"branch"`.
2. Miss by 1–2 → `nearMiss`; miss by 3+ → `fail` (the TIGHT grace — mutation check: widen the
   ladder, harness fails).
3. Nat 20 and nat 1 → NO local resolve; roll rides the next turn (today's flow) even with branches
   present.
4. Missing `nearMiss` key → falls to `fail`; missing needed branch entirely → live flow.
5. Malformed branches (no dc / bad shape) → stripped to bare rollRequest, check still works.
6. Next `sendTurn` carries `lastResolution` once, then clears.
7. `rollRequest.dice` ignores branches. Regression: un-branched requests behave byte-identically
   to today (`verify-dm-events` sweep stays green).

## §6. Acceptance (felt)

- A session's check-heavy stretches feel *snappy* — dice settle, the world answers in the same
  breath; only crits and story-beats "go to the booth."
- Inference count per session drops visibly (the `dev/session-cost-report.py` from DIGEST-DIET
  counts branch-resolved checks vs live turns — expect a third or more of check turns to vanish).
- No branch ever reads as canned: if Adam can tell mid-play which outcomes were pre-written, the
  narration rules in §3 need tightening, not the mechanism.
