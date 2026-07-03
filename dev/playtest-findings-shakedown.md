# SHAKEDOWN findings — 2026-07-03 (run 1: STOPPED turn 1)

Persona: reasonable · World: "Fraying Bell of Vael" · PC: Wymar Brackett (Human Fighter)
Scribe: dev/playtest-scribe-shakedown.jsonl · DM: sonnet agent, runbook-faithful · n=1 turn

## crash-tier

- **SD-001 — 🔧 first-turn blocker: loading overlays never dismiss after the opening applies.**
  Bridge log proves the full pipeline worked (POST /turn 200 → poll 204,204,200 → POST /state 200 —
  the response WAS fetched and applied), but "A new world enters the universe ✦" and "The DM is
  dreaming your arrival…" both stayed mounted and opaque. Screen solid black; game fully alive
  underneath (readable/usable via the accessibility tree). Every new player hits this on turn 1.
- **SD-002 — 🔧 the player's next action never POSTs.** Input cleared (a handler ran) but no
  second POST /turn ever reached the bridge and no turn file was minted — sendTurn either threw
  before the fetch or the submit path behind the stuck overlay is dead. May share a root cause
  with SD-001 (state left un-reset by the un-dismissed transition).

## review-tier

- **SD-003 — 📏 opening digest = 30.9KB (> the 15KB diet line).** It shipped the ENTIRE prep cast:
  24 codex records incl. dmOnly secrets for ~11 NPCs across all 3 unvisited prep locations.
  NEEDS ADAM'S RULING: intended first-contact full-ship (then the diet gate gets an opening-turn
  exemption) or a diet leak (then the opening should ship current-node cast + roster one-liners,
  prep handoff stays behind peek-state). DIGEST-DIET's two-tier rule reads as the latter.
- **SD-004 — 🔧 TIYL/codex species mismatch:** npc:eberk is a Dwarf; its tiylDesc says "a elf
  sailor" (binding bug + article grammar). TIYL desc generated without the rolled species.
- **SD-005 — 🔧 attitude ignores TIYL relationship:** npc:peter-coombe = "former friend, now
  hostile" (TIYL) but ships attitude 0/Indifferent. The attitude init never reads TIYL stance.
- **SD-006 — 🔧 runbook/environment drift:** DM-BRIDGE runbook tells the DM to service prepPending
  via Workflow({scriptPath:"dev/prep-fanout.workflow.js"}) — that harness doesn't exist in a DM
  session context; skipped silently. Fix the runbook line or ship the harness.
- **SD-007 — instrument note:** opening deep-lane turn 77.4s incl. DM bootstrap; lane stamp
  worked (deep/opus, reason new-place). n=1 — no burn verdicts.

## Run 2 additions (2026-07-03, world "Old Tide", 5 turns, burn-gate stop)

- **SD-008 — 🔧 prep name collisions:** `the-tide-that-stopped` + `the-tide-that-stopped-2` minted
  in one world's prep; same ornate-door-hinges item placed twice. Fix dispatched
  (fix/prep-name-collisions).
- **SD-009 — 📏 clock inert through conversation scenes:** DAY 1 · DAWN across a 5-turn
  queue-and-dialogue stretch. Known v1 gap (no time-advance event) — now with felt evidence;
  queue priority should rise.
- **SD-010 — 🎨 pending-turn indicator ambiguity:** the d20 flavor line under the input ("the
  moment turns, slow as deep water…") reads as decorative, not as "waiting for the DM." The real
  roll prompt (THE DM CALLS FOR A ROLL + button) is unambiguous; the *waiting* state needs an
  equally legible affordance.
- **SD-011 — 🎨 typed-but-unsent input can be orphaned** when a DM reply lands and re-renders the
  input area. Minor; "type-then-send" is safe, but a draft-preserving re-render would be kinder.
- **VALIDATED live:** digest diet (median 9,065B post-opening) · roll-branches (fail branch fired,
  zero second inference, miss-by-8 = full failure) · gen handshake (myria-wildheart mint + clean
  bind) · black-screen fix HELD at the exact run-1 death spot · lane stamps all correct.
- **Latency:** DM-side median 68.1s (gate fail >60s), player-perceived 35–68s — all loop tax,
  transport instant. Leg-3 evidence for DM-SEAT; recommend loop-era gate 120s, 60s stays the
  DM-SEAT target.

## Positive signal

- World + 36-step character creation ran clean end-to-end at real-player speed.
- The DM self-caught two invention-capture near-misses (uncaptured token, unearned alarm) —
  charter §8.5 prose is doing its job under pressure.
- **BLIND-PLAYABLE validated by accident:** with the screen 100% black, the game remained fully
  playable through the accessibility tree. The prose-mode surface survived a total visual failure.
