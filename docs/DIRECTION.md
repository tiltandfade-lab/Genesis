---
type: direction
status: STANDING — the project director's trajectory doc (Adam granted Fable the seat 2026-07-03). Supersedes NEXT-STEPS ordering where they disagree; fix the drift in the same change. Adam holds every taste, content, and spend ruling. Amended 2026-07-03 late — reconciled with the concurrent session's close (CHANGELOG later 7: G5 rounds 1–2 done live with Adam; the 9 blessed realms merged; combat_start opened in real DM hands).
created: 2026-07-03
related:
  - "[[DESIGN-GUIDE]]"
  - "[[DREAM-HORIZON]]"
  - "[[SPEED-DOCTRINE]]"
  - "[[DM-SEAT]]"
  - "[[MODEL-GRAMMAR]]"
  - "[[HANDOFF]]"
---

# DIRECTION — the 2026-07-03 reshape

## §1 The read (condition vs. the stated goals)

| Dimension | State | Evidence |
|---|---|---|
| Mechanical spine | **~done for v1** | 99 modules · 84 harnesses · manifest OK · core rules engine a remarkably compact ~2.7K LOC riding ~80K generated data |
| Playability (the product) | **NOT met — the gate** | Latency law ≤15s unmet (rot1 turns: 30–65s routine, 90–170s deep — loop tax); seat units 1–3 BUILT, unit 4 (SEAT-PROMPT) unstarted; no key yet |
| Play evidence | **thin** | 2 automated shakedowns + rot1-attempt2 (10 turns, healthy, strong prose, zero errors) + 1 live fight. Total felt-play ≈ hours, vs ~90 systems built |
| Content quality | **uneven** | T7 craft pass unstarted; 38 provisional files + 634 dup-row warnings + 33 mythic proposals awaiting Adam |
| Visual lens | **exploded, unfinished** | Theater+grammar G1→G4 in 2 days (~5.3K hand-written LOC — ~2× the entire core engine); G5 + §7b QA + rev-2 verdict open |
| Doctrines | **sound, validated** | TEXT-FIRST survived a total visual failure in shakedown; SPEED-DOCTRINE measured into existence; BLIND-PLAYABLE has its acceptance gate defined |

**Verdict: engine-rich, play-poor.** Nothing important is missing. The game the docs
describe substantially exists and is verified — what doesn't exist yet is the *product
experience*: a seat that answers in ≤15s at ~$1/hr, and tens of hours of felt play
tuning what's already built. Adam named it exactly: the seat is when this becomes a
real game. The seat is 3/5 built; the remaining critical path is days, not weeks.

## §2 The diagnosis (what "over-expanded" actually means)

The last 48h were supply-driven, not demand-driven: 91 docs (65 missing from the index),
a theater whose hand-written code is twice the core engine, mythic proposals + dream-weaving
+ lighting + dead-state landing while the seat's last unit and the play cadence waited.
Every unit individually excellent; the portfolio unbalanced. **The correction is portfolio
discipline, not architecture** — the constitution (script owns truth · AI does AI jobs ·
text-first) is right and proven.

## §3 The reshape (five standing moves)

1. **THE PLAYABILITY GATE is the only north star until met:** seat live · routine turns
   ≤15s measured across a real hour · ~$1/hr measured · combat included. Every unit of
   work ranks by contribution to it.
2. **The renderer gets a decency gate, not a lease renewal** (§4). Today, then freeze.
3. **Soak before build:** after the seat, 10 sessions before any new subsystem —
   rotation runs 2–5 ON the seat (they become the seat's soak + cost telemetry),
   then Adam live sessions, then ONE full screen-reader session (the BLIND-PLAYABLE
   acceptance gate). Session friction drives all subsequent build order.
4. **Spec moratorium until soak-5.** No new spec docs (SEAT-PROMPT.md exempt — it's a
   game artifact, not a spec). T7 reshapes demand-driven: re-author the tables play
   actually FIRES first (session logs supply the fire-list), not corpus-order.
5. **The Adam ledger replaces ambient carries** (§6). Nothing waits on Adam invisibly;
   everything waiting on him is batched, named, and scheduled.

## §4 The renderer ruling (today, 2026-07-03)

> **Amended 2026-07-03 (later 9) — model-authoring pivot.** The floating / 90°-wrong / detached
> parts that (a)'s G5 hand-override session was fighting are an ANCHOR-GRAMMAR bug, not a
> recipe-tuning gap: a whole-object probe (each creature = one landmark table, no anchor resolver,
> no stat→look derivation) killed the bug class *by construction* on both a biped and a spider
> (`dev/model-qa/`; CHANGELOG later 9). So (a)/(b)'s "tune G5 recipes" MEANS is superseded — creature
> bodies now author whole-object and execute through the `genesis-blender-mcp` GLB pipeline (Adam:
> "make the move over to Blender"). The gate's INTENT stands (blind-readable at ~100px, prose-twin
> parity, one unembarrassing live fight); the authoring path moved off the anchor grammar. See
> [[project-genesis-whole-object-models]].

"Decent" = all five by end of today's session:
- **(a)** G5 hand-override session — **rounds 1–2 DONE live with Adam (concurrent session,
  07-03); remaining: Row B, the beasts** (wolf/spider/swarm/ooze/ghost/dragon lineup —
  fixture staging recipe in that session's transcript);
- **(b)** §7b blind-recognition loop RUN (specced, never yet run) — top-100 CR-weighted
  creatures pass at ~100px (3-attempt cap; misses logged to the G5 queue, not looped forever);
- **(c)** Adam's rev-2 "layers-not-boxes" + battle-stage UI verdict — **Adam wants ORGANIC
  combat shots first**, which (d) produces (G9 r2 left no critical nits);
- **(d)** one live fight rendered end-to-end in battle-stage mode without embarrassment —
  rot1-attempt2 proved `combat_start` opens in real DM hands (Stealth-fail margin
  consequence, 3 foes, stilt-hut zone) but rounds never ran; the fight itself is unfelt;
- **(e)** prose-twin parity intact (the BLIND-PLAYABLE tax stays paid).

**PASS → FIDELITY FREEZE:** bugfix + §7b regressions only. No new parts, verbs, FX,
lighting features, or stage modes. Next theater investment only post-soak, by friction
evidence. (All art is placeholder by doctrine §II.0b — polish spent now is spent twice.)
**FAIL → park at tracker + prose.** The theater is a lens; the game launches without it.

## §5 The critical path (this week)

1. **`docs/SEAT-PROMPT.md`** — frontier distillation (Fable-gated; draft in flight
   2026-07-03, background). Charter voice + mechanical contract, ≤12k tokens, two
   fixture exchanges, cache-stable prefix.
2. **`seat-replay.py` + the dm-eval voice gate vs real GLM** — needs **Adam's z.ai key**
   (the one hard external dependency).
3. **The live seat hour, combat included** → the latency law measured end-to-end at last.
4. Rotation runs 2–5 on the seat; `session-cost-report.py --seat` after each (SPEED rule 6).
5. Adam live sessions + the screen-reader acceptance session. Soak friction ledger opens.

Engineering ledger (Fable-owned; seeds the soak friction list, never blocks the path):
foe-hazard damage path missing (dead-state follow-on) · prepPending unserviced under loop
DMs (SD-006 — resolves with the seat; more evidence the seat is the product) · stale-locked
worktree `agent-af33f67…` (dead PID; manual cleanup someday).

## §6 The Adam ledger (batched; nothing carries ambiently)

- **Batch A — taste (today, inside the renderer session):** G5 Row B beast overrides ·
  the rev-2 + battle-stage UI verdict (off the organic combat shots §4d produces) ·
  keep/kill the theater-verbs demo gif.
- **Batch B — tables (~1h, this week):** the 38 provisional files · 634 duplicate-row
  warnings · In-Building Complications (linter opt-out vs re-sort) · valuables table.
- **Batch C — mythic (~15m):** ~~the 9 applied realms~~ MERGED 07-03 (`46bcd62`,
  Adam-approved verbatim). Remaining: rule the Frame-field schema (per-variant Frames
  split into Item text vs one-Frame-per-row) so Frontier + Noir can re-propose.
- **Batch D — rulings (~30m):** SD-003 · SD-009/010/011 · ridden-wyvern · TIYL wiring ·
  the d500 NPC-trait expansion + NPC pools/slots follow-through (recurrence-as-thread
  approved in principle; needs the concrete go) · Place-Gen template-slot proposals
  (drafting promised, not yet done). (G2-1976 lethality deliberately WAITS for soak data.)
- **Spend:** create the z.ai key (gates §5.2; ~$1/hr at measured payloads).

## §7 Hygiene orders (issued 2026-07-03, background execution, Fable re-gates)

Commit the rot1-attempt2 playtest logs + demo gif as artifacts · delete the sprite
`_ping.txt` · prune the 35 merged `worktree-agent-*` branches AND their worktrees ·
land `claude/elegant-lamport`'s verify-digest-diet fix, inspect/kill the other two
scratch branches · regenerate `docs/README.md` (index all 91 docs) · NEXT-STEPS →
forward-only · HANDOFF diet: ⭐ + 2 previous entries max, history lives in CHANGELOG
(**standing rule: HANDOFF holds ≤3 entries**). Never touch: `playtest/complaints`,
`feat/realm-mythic-pools` (awaits Batch C), master directly.

## §8 Frozen until soak-5 evidence

No new subsystems (attitude/parley waits) · no T3/T4 wiring · no mythic-weave build
(H3 stays parked) · no VTT/multiplayer/UGC exploration · no theater features beyond §4
· no new spec docs · no prefetch P2/P3 spend (P1 only if soak shows read-gap pain).

## §9 The ship-gate (v1 definition of done — proposed, awaiting Adam's blessing)

Seat live at ≤15s routine, measured across a real hour · cost ≤$2/session measured ·
10-session soak complete with every P1 friction fixed · the blind-playable acceptance
session passed · the Adam ledger empty (resolved or explicitly parked) · fired-tables
craft round 1 done. **Then** launch talk. Until these six are green, "what should we
build next?" has a standing answer: whichever of them is red.
