---
type: audit
status: synthesized 2026-07-02 midday from the 3-scout deep scan (census / overlaps / mechanization), false positives corrected by hand-verification. Feeds batch-3 units 10–11.
created: 2026-07-02
---

# The Wiring Map — what's connected, what's waiting, what collides

## §0. Corrected headline

The literal-id census said 29% wired; hand-verification of dynamic-id patterns (the loot map,
the urban-segment label→id map, walk-skin construction, the SS/EB inline mirrors, qhookPick)
puts TRUE coverage ≈ **50%**. The scan's real verdict stands: **the corpus is coherent — the gap
is wiring, not missing content.** ~1,400+ rows of true orphans map cleanly onto seams that now
exist.

## §A. Corrected record (census false positives — these ARE wired)

dungeon-loot suite (via `dwalkLootSlot`'s map + valuables + outlandish) · all 23
`urban-segment-*` (walk.js label map — the "richest lane" fires) · `walk-skin-*` (null-safe,
live since wave 1) · the Starting-State/opening-bundle suites (inline `SS`/`EB` mirrors) ·
`quest-*` ×5 (`quest-hook.js`) · char-genesis (static traversal, by design).

## §B. TRUE orphans — the ranked wire-in queue (table → seam → effort)

**Wave A (batch-3 unit 10 — high value, trivial/small) — REVISED per Adam 2026-07-02 pm:**
1. `npc-job-board` (300) → **PROMOTED to its own spec: `docs/JOB-WALKS.md`** — tier-scaled
   postings that GENERATE 1–3 segment walks ("infinite quests"); the plain wiring is superseded.
2. `urban-rumor-intel` (100) + `urban-catalyst` (200) → **SEED DISPATCH (revised):** these run
   at SESSION PREP + the TIYL opening to seed adventures (not walk ambience) — catalyst = the
   ignition a prep hook can bind, rumor-intel = the Distant-Word voice lane. **Adam's rider:
   adventures must NOT always start in a city — seed anchors roll their environment; ≥1
   non-urban live seed per prep; a TIYL thread may open in the middle of nowhere**
   (JOB-WALKS §4 carries the rule + verify). `urban-background-event` stays the walk-ambience
   lane (the trio's dispatch map, settled).
3. `travel-landmark`/`-scene`/`-complication` (52) → travel-walk segment lanes — **with an
   up-to-par gate:** run the intensity-map check on all three during wiring; thin/flat rows get
   the PROVISIONAL expansion treatment before they fire. *trivial + craft-check*
4. `urban-rest-complications` (20) → **REST-RISK (rethought per Adam):** sleep is a resource
   with risk, scaled by SECURITY CLASS — tiered inn (rare, Grounded-weighted) < rough camp <
   wilderness camp < dungeon rest (likeliest). A Volatile+ complication can INTERRUPT the long
   rest (the SRD interruption rules exist — the benefit is threatened, not just flavored).
   Composes with lodging (paid beds are SAFER — the sink buys real security, mechanically) and
   the camp-cooking lane. Fix + expand the 20-row table to d100 en route (PROVISIONAL).
5. `tavern-encounters` (19) → the tavern kit's ambient lane. *trivial*
6. `creature-parley-wants` → the SOCIAL parley path (a surrendering foe WANTS something — feeds
   the morale `parley` outcome). *small*
7. `monster-behavior-if-hunted` → `huntRules` + chases (the hunted's rolled behavior). *small*
8. `npc-if-ignored` + `-regional-effects` (200) → World-Turn escalation: a dropped
   thread's NPC rolls what they DO about being ignored. *small — and pure Adam.*
9. `urban-interactable-object` + `wilderness-interactable-object` (600) → the walk object lane
   (the dungeon d300 sibling is already wired — same slot, two more environments). *trivial*
10. `region-encounter` (20) → regional walk bias — **fix its malformed header first** (the known
    compile flag). *trivial+fix*

**Wave B (batch-3 unit 11 — richness/reconcile):**
11. `puzzle-type/-mechanism/-solution-path/-failsafe` (4 tables!) → a puzzle chain on dungeon
    Problem/Lock segments — the DMG-mechanization candidate, already authored. *medium*
12. `urban-catalyst` (200) + `urban-background-event` (300) + `urban-spectacle` (100) → the
    dispatch map the overlap scout demanded: catalyst = plot ignition (prep hooks / drift
    Volatile+), background-event = walk ambience lane, spectacle = district/festival surface.
    *medium*
13. `urban-environment-skin` (100) → the DISTRICT skin (URBAN-FABRIC §2) — the collision
    resolved by jurisdiction: walk-skin owns the walk, environment-skin owns the district. *small*
14. `place-mythology`/`-nearby`/`-race-relations`/`-relevancy`/`-ruler-status` (~450) →
    **sandbox/starting-scenario tools (Adam confirms original intent):** wire into world-genesis
    depth + region identity + district character — WITH a dedupe pass first (check crossover vs
    the Starting-State suite + `Region Identity`; bundle-or-retire overlapping rows rather than
    wiring duplicates). *small + dedupe*
15. `supernatural-blessing`/`-charm` → the reward-currency lane (the Tasha's-charms candidate —
    boons with mechanical teeth, granted via consequence sinks). *medium*
16. `wilderness-active-magic` (200) + wilderness art suite → wilderness walk lanes (magic-zone +
    art parity with urban/dungeon). *small*
17. `dungeon-loot-junk` (300) + `trinket-table` + `d100 furnishings/sundries` → the EMPTY-result
    lane (empty rooms yield texture, not nothing) + camp/downtime flavor. *small*
18. `camp-cooking-complications` + `cuisine-effects` → travel-walk camp beats / downtime. *trivial*
19. `urban-boss` (100) + Urban Boss v1.0 → faction-threat apex machinery (walk finales at
    faction-bound urban walks). *medium*
20. Door/exit state suites → dungeon segment dressing lane. *trivial*

**RECONCILES (must resolve during wiring, not new content):**
- `morale-outcome` (authored table) vs monster-tactics' built d6 disposition — wire the AUTHORED
  table as the disposition roll (richer), keep the built triggers. Check at batch-2 review.
- `mythic-failure/success-lenses` vs the built crit-magnitude lens oracle — verify whether crit
  reads them inline; if parallel, converge on the tables.
- Legacy `travel-*` overflow (biome/destination/route beyond the three wired above) — superseded
  by travel walks; archive with the pre-collapse set.

## §C. Hygiene (rides unit 11)

Regenerate `table-registry.json/.md` from compiled reality (L7, long overdue — confirmed stale).
Stub dispositions: `Minor Arcana Mapping` → satisfied by the built tarot minors (retire or point
at data/tarot.js) · music suite (Source/Style/Theme) → author later as tavern-kit flavor
(flagged, not batch 3) · government types → URBAN-FABRIC district character inputs · `Dungeon
Choice Prompt`/`Scene Tones` → Adam's call at next craft session. Fix `region-encounter`'s
missing header row.

## §D. Domain scoreboard (post-correction, approximate)

NPC ~60% wired (best) · urban ~55% (segments were never dark) · wilderness ~45% · dungeon ~50%
(loot was never dark) · world-building ~40% (place-* depth is the gap) · session-mechanics
mixed (the new gap tables await gap-wiring). After waves A+B: **~85% of CONTENT tables live**,
the rest deliberately DM-side or awaiting craft.
