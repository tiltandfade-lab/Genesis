---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-23
related:
  - "[[SESSION-PREP]]"
  - "[[DM-CHARTER]]"
  - "[[EVENT-CONTRACT]]"
  - "[[DESIGN]]"
---

# Genesis — The Synthesis-Pass Contract (spec v1)

The synthesis pass is the **only interpretive step in prep** — where *"the story is in the dice"*
(SESSION-PREP §0) stops being a slogan and becomes a runnable contract. The walk-rollers produce an
**over-rolled** pile (cheap, rich, generic, incoherent); the synthesis pass reads that pile + the
ledger and returns a **coherent, world-skinned, soft-canon bundle**. Authored from Adam's design call
(2026-06-23): **multi-environment · staged · overlay + briefing**.

## 1. The pipeline

```
rollers (#1)  →  prep-bundle assembler  →  Stage 1: HARVEST  →  Stage 2: RESKIN (per env)  →  assembled bundle → ledger (soft)
 (dice)          (deterministic, built)      (1 LLM call)         (1 LLM call per env)         (#3, future)
```

- **Assembler (built — `src/engine/prep-bundle.js`):** fires the multi-environment walk rollers
  (`rollUrbanWalk`/`rollDungeonWalk`/`rollWildernessWalk`), binds a **quest hook** to each
  (`rollQuestHook`, `src/engine/quest-hook.js`), and gathers **ledger context** from the live world.
  Pure dice + state-read, no LLM. `prepBundleSummary()` gives the cheap Stage-1 view.
  MONSTER-STORY-WIRING §4: when the destination walk carries a resolvable threat, the hook gains a
  `threatBinding` ({creature,statId,habitat,doing,angle}) — when present, the hook's pitch SHOULD
  name the creature and its angle (the quest that leads to the wolf-den mentions wolves); synthesis
  may still override, same soft-prior posture as everything else in prep.
- **Stage 1 — Harvest** (`Engine/00. _System/AI Prompts/synthesis-harvest.md`): one cheap call over
  the *summary*. Finds the throughline **latent in the rolls**, names the dramatic question, marks the
  spine, binds the hooks, seeds the cast, writes the reskin brief. Does **not** reskin or delete.
- **Stage 2 — Reskin** (`synthesis-reskin.md`): one call **per environment** (parallelizable). Takes
  the full walk + Stage-1 harvest + ledger entities → a **roll-keyed overlay**: each segment gets a
  *role* (spine/texture/skip) + a *reskin* + *ties* + a *reveal plan*, plus a short DM briefing and
  any **soft** new canon.
- **Final assembly:** the env overlays + a top-level briefing → written to the ledger as soft canon
  (the ledger plumbing is build #3, not yet wired).

## 2. Why staged

Stage 1 sees everything and sets cross-environment coherence **once**, cheaply (summaries only).
Stage 2 only *localizes*, guided by Stage 1 — so a big multi-environment bundle never blows up a single
call, and the per-env reskins can run in parallel over the DM Bridge.

## 3. The cardinal rule — overlay, not rewrite

Stage 2 output is **keyed to each segment by `ref`**. The rolled mechanical content (DCs, creatures,
loot, transitions, the finale boss) stays exactly as rolled; synthesis adds only the **skin** and the
**role**. This makes *honor-the-rolls* **structural, not instructed** — the die is always visible under
the fiction (also serving Charter dice-transparency). "Pruning" is `role:skip`, **never deletion**, so
the walk's node-graph (the sub-map) stays intact for build #5.

## 4. I/O schemas

- **Input** — `prep-bundle/v1` (assembler output): `{ ledger:{pcLocation,tier,factions[],pressures[],
  dripTargets[],canon[],frontier}, environments:[{kind,walk,hook}], meta }`. Stage 1 consumes the
  `prep-bundle-summary/v1` reduction of it.
- **Stage 1 output** — `synthesis-harvest/v1`: `{ dramaticQuestion, throughline, spineByEnv,
  hookBindings[], castSeeds[], dripSeeded[], reskinBrief }`.
- **Stage 2 output** — `synthesis-overlay/v1` (one per env): `{ env, briefing, segments:[{ref,role,
  reskin,ties[],revealPlan:{fragment,dmHeld}}], newCanon[] }`.

### Stage-2 addendum — the per-segment effect die (ON-DEMAND-GEN §4, added 2026-07-02)

Every segment's overlay entry MAY (and for the finale + any hook/thread-seed segment, MUST)
carry an **`effectDie`** — the room's one significant die, generated to the
`CONSEQUENCE-LADDER §8` contract in this same pass:

```jsonc
"effectDie": { "die": "d12",
  "rows": [ { "lo":1, "hi":4, "nature":"…", "use":"…", "tell":"…", "escalation":"…" }, … ] }
```

**Shape note (merged reality):** the runtime reader is `clResolveStoredEffect`, which consumes
`rows` with `{lo,hi,nature,use,tell,escalation}` — use THESE field names, never `faces`/`sink`.
Die size scales with the segment's band (Grounded → d8 · Textured/Strange → d10–d12 ·
Volatile/Mythic → d20). The **dead-end floor is mandatory** (the low rows are "sometimes a room
is just a room"); high rows bind-first to live fronts. The player rolls it OPEN when they engage
the significant thing; one roll per room, ever — the captured face is canon on re-visits
(capture rides `walk_update {seg, overlay:{effectDie:{rolledFace:n}}}`).

**When a walk carries a rolled SKIN (`walk.skin`, WALK-REFRESH §3): honor it** — Stage-2 reskins
color *within* the rolled lens, never replace it.

(Field-level detail lives in the two prompt files — the single source of the contract.)

## 5. Discipline (baked into both prompts)

Honor the rolls maximally · invent only for fun/connection · patch canon before inventing · never
contradict `canon[]` · **DM has final say** (editorial, not authorial) · over-reveal discipline
(Fragment veil) · everything produced is **soft until contact** (Charter §8.4) · serve FUN.

## 6. Build status

- **Built (2026-06-23):** the deterministic half — `prep-bundle.js` (assembler + summary) +
  `quest-hook.js` (hook roller), wired + headless-verified (`dev/verify-prep-bundle.mjs`). The two
  staged prompt templates + I/O schemas authored (`AI Prompts/synthesis-{harvest,reskin}.md`).
- **Not built / the play-time step:** the LLM synthesis itself runs over the **DM Bridge** — feed an
  assembled bundle to the Stage-1 prompt, then each env to Stage-2. Verification there is qualitative
  (is the throughline honest? do the reskins hold?). The known tune item: whether Stage-1 harvest is
  good enough on *summaries* alone, or needs more segment text fed in.
- **Downstream (future):** #3 soft-canon ledger-write of the overlays; #5 walk→node-graph binding;
  #6 a fuller orchestrator (plausibility-from-frontier; firing the NPC/Place depth rollers too).
- **Improvement candidates:** the Quest tables (`quest-*`) and NPC-hook tables are v1 — flagged for a
  pass (Adam: "I'm sure they need to be improved upon").
