---
type: runbook
project: Genesis
status: LOCKED 2026-07-08 (Fable) — the 24-hour full-flesh-out plan for all remaining realm figures +
  props. Modifies MODELING-PIPELINE.md with the SCALE-OUT method: parallel probe-lib text waves for
  the bulk (how the existing 346 were actually built), Blender serial lane for heroes only.
consumer: the orchestrator session that runs this (genesis-orchestrate pattern; Opus gates)
created: 2026-07-08
related:
  - "[[MODELING-PIPELINE]]"   # the per-figure process; this doc is its scale-out addendum
  - "[[REALM-MODEL-PLAN]]"    # per-realm kits + targets
  - "[[PROP-NOUN-LIBRARY]]"   # prop Wave 4 targets
  - "[[BLENDER-MODEL-SPEC]]"  # scale law, palettes, prop scale contract
---

# MODEL-BLITZ-24H — flesh out every realm + prop in one orchestrated day

## §0 The insight that makes this possible

The existing **346 models were built as parallel TEXT waves** (probe-lib JS geometry authored by
10–16 concurrent executors — an 82-piece roster landed in ONE commit), not through Blender. Blender
(serial socket, ~30 min per 4-figure set) is the NEW lane and it is the wrong tool for bulk. The
engine loads BOTH formats (`{module,fn}` probe-lib and `{glb,discR}` GLB — both live on master).

**Method split:**
- **BULK (≈90% of pieces): probe-lib text waves.** Rank-and-file kitbash variants — agents write
  `rlm-<realm>-kit.js` + thin variant modules as code, massively parallel, worktree-isolated.
- **HEROES (1–3 per realm): the Blender lane, serial.** Sherman-class sculptural pieces — ships,
  locomotives, war machines, apex monsters — where Blender's form-building proved superior today.

**Both lanes inherit today's pipeline law:** references FIRST (Wikimedia, distill NOTES.md, delete
images after) · taste-gate on LIT renders (the headless puppeteer sheet rig — proven today) · the
silhouette metric is a guardrail, never a target · coherence > distinctness > beauty · 2 rounds ·
scale contract BEFORE modeling (feet on paper before geometry) · kit grammar (shared torso + swap
kits).

## §1 Scope (what "fully fleshed out" means)

- **9 remaining realms** (noir ✓, theater ✓ done today): frontier*, high-seas, chrome, suburb,
  cosmic, lost-world, ash, bright-kingdom, gloom. Per REALM-MODEL-PLAN: one kit (~11–13 parts) +
  variants ≈ **~30–55 figures/realm retired from stand-ins**; kitbash total ≈ **~110–130 authored
  builds** across all realms. (*frontier's Blender wave may land before the blitz — fold it in.)
- **The 42 core-bestiary alias targets** (VISUAL-ASSET-QUEUE) — most fall out of the realm kits
  automatically (warrior-veteran, skeleton, cultist, bandit ARE realm-kit subjects); the pure-beast
  tail (giant-rat, wolf, owlbear-class bodies) is its own small wave.
- **Props Wave 4** (PROP-NOUN-LIBRARY): chair · bed · fence · market stall · shelf first, then the
  remaining blank-block families (~14 models) + the flagged realm net-news. All against
  prop-scale-contract.js rows authored BEFORE modeling.
- **NPC humanoid set** (Adam's ruling): villager, merchant, elder, laborer, priest, innkeep, child —
  extends theaterNpcModelFor's best-candidate map.
- **Wiring**: every new piece registered (registry + NEAREST_SUB repoints + realm-bestiary `model`
  repoints via the draft-JSON→regen path) + per-realm in-engine proof sheets.

## §2 The wave structure (orchestrated, genesis-orchestrate discipline)

**Wave 0 — Reference scouts (9 parallel agents, ~1h).** One per realm: pull Wikimedia refs for that
realm's kit subjects + heroes, VIEW them, write `out/<realm>/refs/NOTES.md` + confirm the realm
palette against the grade (BLENDER-MODEL-SPEC §4.2), delete images. Output: 9 NOTES.md — the entire
blitz models from these.

**Wave 1 — Kits (9 parallel agents, ~2h).** One per realm, worktree each: author
`rlm-<realm>-kit.js` (torso + heads + kit units + overlay channel, probe-lib DSL, scale-contract
sizes) + 3–4 proof variants + a LIT proof sheet (headless puppeteer rig). GATE: Opus eyeballs each
realm sheet (coherence/scale/palette), kills or passes the kit before variants fan out. This gate is
the quality choke-point — nothing fans out on a bad kit.

**Wave 2 — Variant fan-out (parallel per realm × batches, ~4–6h).** Each passed kit spawns its
variant files (thin: kit + ≤3 mutations + ≤1 prop each) in batches of ~8–10 per agent. Every batch
ships its own LIT sheet. Registry entries + NEAREST_SUB/realm-bestiary repoints ride WITH each batch
(the wiring is part of the unit, not an afterthought).

**Wave 3 — Props + NPCs + beast tail (parallel with Wave 2).** Prop Wave 4 against the scale
contract; the NPC set; the pure-beast alias targets. Same proof-sheet discipline.

**Hero lane (serial Blender, runs alongside ALL waves, ~30 min/piece).** One agent at a time on the
socket: per realm's 1–3 heroes (high-seas ship, frontier iron-horse*, chrome AI-core, lost-world
apex saurian, gloom hearse…). Wired via the GLB seam per piece. ~12–18 heroes fit the window.
(Stretch option if throughput demands: multiple GUI Blender instances on distinct ports — the addon
is GUI-only; do NOT attempt background-mode bpy with the socket addon, it has no main-thread tick.)

**Wave 4 — Integration close (~2h).** Full-tree gates (check-manifest · verify-theater-figures ·
verify-model-grammar · verify-theater-data · lint-units.py fresh report) + per-realm in-engine
render proof + staged `--no-ff` merges + push + CHANGELOG/HANDOFF. lint-units.py's model-wiring
section is the completeness check: **alias counts should collapse realm-by-realm** (the objective
"fully fleshed out" measure — target: every realm's alias % under ~15%, from 17–66% today).

## §3 Taste-gating at scale (Adam cannot eyeball 130 figures one at a time)

- Adam reviews **9 realm sheets** (each: kit + all variants + heroes on one LIT proof sheet, dims
  captions on), not individual figures. Flags land as targeted round-3s on named figures only.
- Opus gates every wave personally (never executor self-reports — the standing law) and runs the
  guardrail IoU per realm (flag pairs >0.65 for the sheet review; never reshape to the number).
- Placeholder-coherent is the bar (§II.0b). "Bugs fixed, ships as placeholder" ends a figure's
  budget; beauty passes are deferred to the future artist lane.

## §4 Risks / honest caveats

- **Probe-lib bulk ≠ Blender-hero quality.** The DSL builds chunky band-stacks; it will not match
  the Sherman's sculptural read. That's ACCEPTABLE for rank-and-file minis (tin-soldier form
  language: 2–3 value masses + one silhouette flare) and it's how all 346 existing pieces look —
  visual consistency actually favors it. Heroes carry the wow.
- **The refs→text seam is unproven at scale** (today's ref wins were Blender-lane). Wave 1's gate
  exists precisely to catch it early — if kits come back generic despite NOTES.md, tighten the
  prompts (quote the notes INTO the variant specs) before fanning out.
- **Fixture/harness churn**: registry growth is additive (safe), but realm-bestiary repoints touch
  generated data — every batch regenerates via the draft-JSON path and re-runs the gates; no
  hand-edited artifacts.
- **~24h is aggressive**: if the window slips, the wave order IS the priority order — kits before
  variants, urgent realms (frontier/high-seas) before gloom, props Wave 4 before the beast tail.

## §5 Launch checklist (for the session that runs this)

1. Confirm today's three in-flight lanes landed (frontier Blender wave · theater/noir GLB wiring ·
   prop tables W2+3) — fold, don't duplicate.
2. `git status` clean-ish on master; all agents in WORKTREES (the collision lesson); Blender GUI up
   on :9876 for the hero lane.
3. Fire Wave 0. Gate. Fire Wave 1. Gate per kit. Fan Wave 2/3 + hero lane. Close with Wave 4.
4. Morning report: per-realm before/after alias %, the 9 sheets, heroes lineup, anything parked.
