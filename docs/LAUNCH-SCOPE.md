---
type: system-spec
project: Genesis
status: FOUNDER-DIRECTION DRAFT 2026-07-31 — for Adam's line-by-line pass; nothing builds until ruled
created: 2026-07-31
owner: contained-launch program
serves:
  - the 2026-07-31 contained-launch direction (full record in session memory + this doc)
  - GOLDEN-SITE-SPATIAL-COMPILER-PLAN.md (all four 07-31 rulings inherited unchanged)
  - docs/TACTICAL-PROMISE-GATE.md
companion: docs/FICTION-ORACLE.md
---

# LAUNCH SCOPE — the contained game

## 0. The direction in one paragraph

One town above a persistent, never-ending dungeon. The town carries the full Genesis
fiction promise; the containment is a RESOLUTION RULE — battles resolve on dungeon maps.
A single PC (fighter / wizard / rogue, SRD-exact) descends; sidekicks, larger parties,
and other realms are ladder rungs, not launch. The container's premise is ROLLED per
world by the fiction oracle (companion spec). The dungeon phase is fully mechanized —
the DM is a summoned presence, not a resident narrator. Everything outside this scope
is ARCHIVED: kept in source, kept compiled-from (full profile), kept CI-green — and not
dealt.

## 1. Invariants (unchanged, restated so nobody relitigates them)

Text-first forever · blind-playable (prose twins) · DM agency rules · walk-native
boundary (graphics project the walk) · persistence (worlds remember forever) · SRD-exact
data · spice curve (now measured against each world's rolled premise) · edit-source →
compile-artifact · all four spatial-compiler rulings (constraint solver + chassis +
completion grammar; campaign dealing memory; Codex probe; battle-first tactical gate).

## 2. The scope manifest — the single un-cap point

One committed file, `data/launch-scope.js` (owns `LAUNCH_SCOPE`), read ONLY via its
accessor. The LEVEL_CEILING pattern applied to geography and content:

```text
LAUNCH_SCOPE = {
  environments: ["dungeon"],            // battle surface; town = fiction phase, always on
  walkDealing:  ["dungeon"],            // the dealer's whitelist
  classes:      ["fighter", "wizard", "rogue"],
  subclasses:   [],                     // none at launch
  realms:       ["fantasy"],            // the unreskinned baseline
  partySize:    1,                      // sidekick rung raises this
  overworld:    false,                  // node-map + travel surface inert
  tiyl:         "town-only",
  monsterRoster: "data/launch-roster.js" // curated allowlist (see §4d)
}
```

Widening any field IS the expansion mechanism. No other file may express scope.

## 3. Tag taxonomy for Engine table sources (YOUR keep/kill pass before any tag lands)

Small, boring, greppable. A table or row carries at most one scope tag; untagged = core.

- `scope: core` (default, no tag written) — in the contained compile.
- `scope: wide` — walks/surfaces outside the container (urban/wilderness/travel rows).
- `scope: realm:<name>` — realm-keyed content (skins, realm items); `realm:fantasy` is core.
- `scope: rung:<name>` — content waiting on a ladder rung (e.g. `rung:sidekicks`).

Rules: tags are annotations in the source markdown, never row deletions; your
hand-authored tables get tagged only by you or with your explicit per-table go; the
compiler treats unknown tags as errors (no silent new scopes).

## 4. The four mechanisms (all at existing chokepoints)

a. **Compile profile.** `compile-tables.py --scope=launch` reads the manifest + tags,
   emits the shipping `tables.json/js` containing core only. `--scope=full` (default
   for dev/harnesses) emits everything, as today. `verify-compile-fresh` learns which
   profile the committed artifact was built with.
b. **Walk dealer gate.** The dealer consults `LAUNCH_SCOPE.walkDealing`. Urban and
   wilderness rollers keep all code and all harnesses — starved, not severed.
c. **Creator filter.** Character creation offers `LAUNCH_SCOPE.classes` only;
   CLASS_PROGRESSION keeps all twelve classes untouched.
d. **Flag-gated non-row systems.** Inventory (each gets one gate, listed in the
   ledger): TIYL opener set → town starts only; overworld node-map + travel UI →
   hidden; travel/journey DM events → inert (contract entries remain, handlers
   unreachable); monster roster → curated allowlist file (selection from the 510,
   69% of which are already CR ≤ 5; curation method = open question §10.3).

## 5. Teeth (the ruling is real only when these exist — all red-first)

1. `dev/verify-launch-scope.mjs` — census gate: rolls ≥1,000 walks + creator passes +
   roster draws against the LAUNCH build; asserts 100% in-scope, zero leakage; proven
   red by un-tagging one wide row and watching it fail.
2. **Full-surface CI stays green** — the existing 246-harness suite keeps running
   against the FULL profile forever. Archive rot fails the build the day it happens.
   This property is non-negotiable and this spec's most important sentence.
3. Single-accessor grep — a wiring-style check: `LAUNCH_SCOPE` is read only via its
   accessor; any scattered `if (contained)` conditional fails.
4. `docs/ARCHIVE-LEDGER.md` — every scoped-out system, one line each: what, why, its
   re-entry condition, and the manifest field that re-admits it. The archive list IS
   the expansion map.

## 6. Dungeon structure — the two-layer law

- **FLOOR (strategic layer):** persistent multi-room crawl. Topology from a cyclic
  graph grammar (loops, lock-and-key, shortcut-home — per the method sweep's shipped
  precedent). The campaign dealing memory and premise fingerprints live here.
- **ROOM-CLUSTER (tactical layer):** the battle board, at FFT scale (corpus median
  ~120 cells) so the tactical-promise bands apply unmodified. Chassis, tactical
  skeleton, and the compiler waves live here.
- Room persistence: cleared/transformed rooms persist via the existing
  CONTINUE_EXISTING / TRANSFORM_EXISTING dispositions.
- Backtrack/restock pacing is a named open design question (§10.2) — not solved here.

## 7. DM-presence architecture (pointer — details get their own spec at build time)

Dungeon = engine-only, instant turns. DM summoned on data-declared triggers at ONE
boundary: spice threshold · parley/social contact · consequence-meaning rolls · premise
beats · town return. One batched DM pass per dealt floor (session-prep doctrine
generalized) carries voice at zero per-turn cost. Seat tiers: engine → small model →
frontier on spice spikes. Requires (separate spec, already on the build list):
deterministic monster AI + terrain→cover.

## 8. Depth passes on kept content

Tag to exclude · craft-pass to deepen · NEVER fork. Kept tables that are too thin for
a game living entirely in one town and one hole (dungeon room flavor, town NPC texture,
depth-band encounters) get additive craft passes in Adam's hands-on sense — the
spawn-audit's 111 additive rows are the precedent. Every depth lane gets its number
before it gets its worktree (pre-ship bar discipline).

## 9. Sequencing (coarse waves; each independently landable)

- **S0** — manifest + accessor + teeth 1–3 skeletons + ARCHIVE-LEDGER scaffold. No
  behavior change (full profile still ships) — pure plumbing, provable inert.
- **S1** — tag taxonomy ruled → the tagging pass over Engine sources (Adam-gated).
- **S2** — compile profile + dealer gate + creator filter + flag gates; launch build
  exists; verify-launch-scope goes red-first → green.
- **S3** — fiction oracle built (companion spec) and rolled at world-mint.
- **S4** — floor grammar (two-layer law) through the compiler program's ordinary waves.
- Depth passes and the roster curation run alongside from S1 on.

## 10. Non-goals and open founder questions

Non-goals: no deletion of anything; no party combat (sidekick rung); no multiplayer;
no realm portal-floors yet (future note stands); no monster-AI build inside this spec;
no old-save migration work (deprioritized by ruling — launch mints new worlds).

Open questions for your pass:
1. Manifest values §2 — confirm each field's launch value as written.
2. Restock/backtrack rule — who owns it: premise dice, depth bands, or a dedicated
   ruling later? (My lean: premise dice own the LOGIC, depth bands own the RATE.)
3. Monster roster curation — by CR band + sprite-ready status, or your hand pick over
   a candidate sheet? (My lean: I draft a candidate sheet, you keep/kill.)
4. Town scene lever-law (every scene must hold a lever) — enforce as a gate now, or
   defer until town content work begins?
5. The three-class hone — what does "honed" mean concretely per class? (Needs your
   taste before any class work is specced; deliberately NOT drafted here.)
