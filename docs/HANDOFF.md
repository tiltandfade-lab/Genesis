---
type: session-handoff
project: Genesis
updated: 2026-07-04
---

# Genesis — Session Hand-off

*Read this first in a new session. It orients you; the linked docs are the source of truth.*

## ⭐ Latest (2026-07-05 — THE MONSTER PRODUCTION WAVE: described, storied, modeled, recruitable) [Fable]

**Everything landed + pushed (origin current at the close); final sweep 94/0; ~30 merges from
~120 background agents overnight.** Full detail: CHANGELOG 2026-07-05. The headline: every monster
in the game is now an individual — **1307 realm creatures** (desc on all; net-new model queue
EMPTY: 229 creature + 8 prop whole-object models landed across 7 judged waves) and **510 regular
monsters** (original desc + spice-graded d8 flavor table each, MM-2024 vision-grounded). The story
layer reaches them all: habitat/behavior/displaced flow to the DM digest, significant foes mint
codex records (custom-d10 rolls canon-locked at first mint), quest hooks name the destination's
actual threat, traits apply live in combat (cmApplyTraits, divergence licensed within CR budget),
and MONSTER-PARLEY + THE ANOMALY LAW make recruitment real but difficult af (grind clamps at
Friendly; bondEligible only via nat-20 / decisive lever / 3% friendly spawn; pet/hireling/sidekick
tiers). Reference layer: all five books have committed vision-verified page indexes
(dev/model-qa/*-page-index.json — see CLAUDE.md gotcha).

**Adam's open ledger:** ① **Phase 2b go/no-go** (realm traits at his 100% ruling + realm d8
tables + own treasure/habitat/activity for 1307 — ~2.5× the 510-corpus token spend; specs locked,
machinery proven, launches on his word — TOKEN-LEAN until Mon-eve refresh) ② REALM-RENDER-STYLE
tune ③ PACING-DIALS §3 (octane/lethality/drip + player-type presets — his "high octane" thread)
④ prop size→footprint veto row (REALM-PROPS-WIRING §3) ⑤ 11 `_review` flags in
realm-bestiary-draft.json ⑥ deep /code-review (+ ultra if wanted) Monday post-refresh.

**Do next:** (1) Adam's ledger above; (2) Phase 2b when authorized; (3) **a live playtest in a
breach** — realm creatures with descs + models + story wiring + parley have never been FELT
together (the soak DIRECTION calls for); (4) the flavor-d8 engine roll at mint
(MONSTER-FLAVOR-TABLES §4 F4 — small unit, stacks clean now); (5) the standing seat program.

## Latest (2026-07-04 later-3 — the REALM arc: 100% models, floors, figure AO, realm content + wiring) [Opus]

**Everything landed + pushed; master green (check-manifest OK · verify-theater-data 165/0 ·
verify-theater-figures 38/0 · verify-realm-wiring 20/0); working tree carries only dev tooling (this
close commits it).** A very large session that took the battle theater from "models exist" to "each
breach realm is a populated, floored, wired place."

**What shipped (all on master):**
- **Model coverage 32% → 100%** — 280 silhouette aliases + **66 net-new bespoke monsters**
  (docs/CREATURE-MODELS-P2.md; 56 via a Workflow fan-out). No cuboid fallbacks left.
- **17 procedural floor materials** (docs/FLOOR-TEXTURES.md) derived from rolled terrain + **baked
  figure AO** (on the models, per Adam's correction).
- **Realm content at scale (approach C, text-first, IP-clean):** bestiary **1092 creatures** (~100/
  realm) + a **legal familiar-icons batch** (219; PD source-versions + archetypes, source-tagged) +
  **88 surfaces** + **308 props** (cross-realm tagged). Docs: REALM-BESTIARY-{DRAFT,SCAN,ICONS},
  REALM-SURFACES-DRAFT, REALM-PROPS-DRAFT. **suburb LOCKED to 1980s Americana.**
- **The active-realm WIRING seam** (docs/REALM-WIRING.md) — breaches spawn the realm's creatures
  (filter + 18% adjacent leak); frame=stats/modelKey=render/name=realm; `data/realm-bestiary.js`. This
  seam also carries surface-select + the render grade.
- Proposals awaiting Adam: **REALM-RENDER-STYLE.md** (per-realm sat/tint/contrast/shape). Dream:
  **DREAM-HORIZON §H∞ "The Private Cut."**

**Do next (pick up here — Adam: "finish modeling, writing, and speccing the realm enrichment"):**
1. **MODELING** — the net-new geometry queue: **207 net-new creature models + 31 net-new prop
   models** (net-new floor bases already done). Build via the proven Workflow fan-out (spec pattern =
   CREATURE-MODELS-P2), gate visual wave sheets, land. Dedupe the cross-realm-`all` props first (build
   once, share) to shrink the 31.
2. **WRITING + STAT/DESCRIPTION pass** — review/reshape the drafts (BESTIARY-SCAN = fast read), fold
   the icons batch in, regenerate `data/realm-bestiary.js`; **then author per-creature stats +
   narratable descriptions** (curated off the SRD chassis — OGL-clean; original prose `desc`).
3. **STORY WIRING** — fold the realm creatures into the narrative layer: a breach foe mints/attaches a
   **codex** entry, and its `desc`/name/realm flows through `dwalkEncounter` → encounter → DM digest so
   the DM narrates the REALM creature (not the generic chassis) and it can recur/tie to factions.
4. **SPECCING** — Adam's ruling on **REALM-RENDER-STYLE** → spec the grade; **surface-select wiring**
   on the `activeRealmsFor` seam; the **prop-sizing render pass** (size → zone occupancy); **urban/
   wilderness creature-wiring** (dungeon done).

## Latest (2026-07-04 late — live-QA arc: roster complete, eyes gone, texture ruled out) [Opus]

**Everything landed + pushed; final sweep 92/92 harnesses + manifest OK; working tree clean.** This
arc executed Adam's live QA-review rulings on top of the delegation batch. The **race×class matrix
is complete** — all 72 combos, eyeless, D-bow rangers, 72-cell sheet re-rendered. The **eye standard
was REVERSED** — humanoid eye dots stripped corpus-wide (feature-eyes/sockets/visor-slits kept). The
**bestiary tail wave** fixed Adam's nine QA complaints (rat-swarm→6 mice, real lizard/mephit/stalker/
blight, flaming skeleton, horse + skeletal warhorse, table proportion, ranger D-bow). **Flame glow**
now additive (reads as light), **scale 1.2**, **bolder gold rim**. The **bestiary coverage manifest**
(docs/BESTIARY-COVERAGE.md) maps all 381 uncovered creatures → ~16 real new bodies + variants +
aliases (35 aliases landed); the build waves await Adam's §2 new-body gate. **CHASE-SOFT-RECALL** and
**DRESSING-ATMOSPHERE** built; **CHASE-BITE** drafted for Adam's pick. The **ChatGPT painted-texture
experiment was RULED A CLEAR FAIL** — generated grain stays the tier; never touched the live renderer.

**Adam's open ledger (waiting on him):** grit pick (held at 1/3; zoom4x crops in
dev/model-qa/grit-compare/) · CHASE-BITE design pick (docs/CHASE-BITE.md) · the bestiary NEW-BODY
gate (docs/BESTIARY-COVERAGE.md §2 — which of ~16 bodies build) · NEAREST_SUB alias taste ·
wilderness dressing-mega craft pass (PROVISIONAL) · the flagged model nits (half-orc-fighter facing,
beggar crutch, snake CoG, harpy edge-on wing).

**Do next (pick up here):** (1) Adam's ledger above; (2) bestiary build waves once the new-body gate
lands (docs/BESTIARY-COVERAGE.md §4 — wave 1 = stocky-quadruped + bird + amphibian, highest leverage);
(3) env waves W+U (docs/ENV-WAVES.md, 17 deferred); (4) CHASE-BITE build once picked; (5) **a live
playtest on the new stage** — P1′ figures + dressed rooms + initiative UI + the chase loop have never
been FELT together in real play (the soak the DIRECTION doctrine calls for).


## Older sessions

The full session-by-session history lives in `docs/CHANGELOG.md`. Standing rule (DIRECTION §7):
HANDOFF holds at most 3 entries — newest replaces oldest; history migrates to CHANGELOG.

Pre-CHANGELOG standing notes preserved here (no CHANGELOG counterpart — durable operational
knowledge, not a dated session entry):
- `genesis.html` runs on INLINE data, not the compiled registry — wiring it onto `tables.json` is
  the still-open Track B hook.
- bash `rm` was blocked in an earlier Cowork mount (used `mcp__cowork__allow_cowork_file_delete`);
  may not apply to the current Claude Code environment.
- The `genesis` skill (installed) handles orientation + hands Vale/playtest triggers to
  `arcana-playtest`; Adam's Claude-app project instructions may still need a pointer update if they
  ever named Shifting Vale instead of Genesis.
- Loot tables are remapped (`LOOT-REMAP.md`) — don't treat the old "Tier" table or whimsical
  "Legendary" as live; SRD additions in the rarity tables are pointer-format rows (curated rows
  first, verbatim).
