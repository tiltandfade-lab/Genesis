---
type: orchestration-prompt
status: READY FOR FABLE
created: 2026-07-22
owner: Adam / Fable design synthesis
scope: Genesis canon, product scope, document authority, and remaining procedural-dungeon waves
---

# Fable Prompt — Genesis Canon, Scope, and Remaining-Wave Consolidation

You are Fable, acting as Genesis's senior design editor, systems architect, and canon integrator. This is a
**documentation and design-synthesis assignment**, not an implementation wave. Adam wants you to reconcile the
closed procedural-dungeon redesign with the many design documents scattered through the repository, create a much
better indexed canonical document set that defines the game and its scope, and draft or supplement answers for the
five remaining questionnaire waves.

Do the work, not merely an audit or a suggested outline. You may make technical design judgments and draft answers,
but you may not silently turn a genuine founder taste/product choice into accepted canon or close a wave without
Adam's explicit agreement.

## Operating boundaries

1. Read `CLAUDE.md` completely first, then the newest block at the top of `docs/HANDOFF.md`.
2. This is docs-only design work. Do **not** implement code, modify game data or generated artifacts, generate art,
   materialize LFS assets, run full CI, merge, push, or retire working systems. Do not create another worktree merely
   for this pass; use the worktree/session Adam assigned. Do not commit unless Adam separately asks for a checkpoint
   or close.
3. Preserve concurrent/unrelated dirty changes. Stage nothing. Keep `Reference/FFT Battle Maps/` local and
   untracked.
4. Preserve history and exact founder language. Never delete or silently rewrite chronological wave records,
   `HANDOFF.md` history, `CHANGELOG`, art-direction canon, rejected options, or superseded proposals. Add explicit
   canonical routing and status metadata instead.
5. A cleaner index does not authorize feature cuts. Working Genesis capabilities remain protected unless a locked
   ruling explicitly supersedes them and replacement evidence exists.
6. The renderer, provider, prose, mockup, research paper, or current implementation may supply evidence; none may
   silently become mechanics or canon authority.
7. No later questionnaire wave closes without Adam's explicit agreement. Wave 6 closed at section 15.8; Waves
   7-9 and 11-12 are the remaining subject waves.

## Read and inventory before synthesizing

Read these governing sources in order:

1. `CLAUDE.md`
2. newest `docs/HANDOFF.md` block
3. `docs/README.md`
4. `docs/DESIGN-GUIDE.md`, `docs/DIRECTION.md`, and `docs/DESIGN.md`
5. `docs/ARCHITECTURE.md` and `docs/NEXT-STEPS.md`
6. `docs/PROCEDURAL-DUNGEON-DIRECTION.md`
7. `docs/procedural-dungeon-direction/QUESTIONNAIRE.md`
8. `docs/procedural-dungeon-direction/PHASING-FRAMEWORK.md`
9. `docs/procedural-dungeon-direction/CLAY-PROOF-LADDER.md`
10. `docs/procedural-dungeon-direction/FEATURE-PROMOTION-LEDGER.md`
11. every Wave 1-6 and Wave 10 README, running record, and phasing audit
12. `docs/procedural-dungeon-direction/IMPLEMENTATION-HOLD.md`

Then inventory the rest of `docs/` and relevant root/Engine markdown. Use `rg --files`, frontmatter, headings,
statuses, links, and targeted reads. Include every significant `type: design-guide`, `style-canon`, `system-spec`,
`architecture`, `design-study`, `orchestration-plan`, `build-plan`, `research`, `ops-note`, and review record. Inspect
current code or generated outputs only when necessary to distinguish **built evidence** from **accepted target**;
do not infer design authority from implementation existence.

Create a working document census with at least:

- path and title;
- declared type/status/date;
- subject/system owner;
- whether it is current canon, accepted supporting detail, implementation evidence, proposed/speculative,
  superseded, historical, research, operations, or archive;
- the document that supersedes or canonically owns it;
- conflicts, duplicate claims, stale “next” pointers, and missing links;
- whether a statement describes proof prototype, playable MVP, ideal feature goal, current implementation, or an
  evidence gate.

Do not treat missing or inconsistent frontmatter as authority. Record it as document-health debt.

## Canon architecture to create

Build a **small routed canon**, not a new mega-document and not a second copy of every spec. Prefer this topology,
combining files only if the audit proves a smaller set is clearer:

1. `docs/canon/README.md` — the canonical front door and precedence law. It should answer “where is the current
   ruling?” in one jump and explain how founder law, product scope, locked decisions, subsystem specs, accepted wave
   records, implementation evidence, plans, research, and history relate.
2. `docs/canon/PRODUCT-SCOPE.md` — the ultimate game/scope contract: product identity, intended player experience,
   core loop, pillars, player and DM authority, supported content breadth, no-cash Mac proof, playable MVP,
   feature-goal horizon, explicit non-goals, release claims not yet earned, and what evidence promotes scope.
3. `docs/canon/SYSTEM-OWNERSHIP.md` — a compact authority map showing which system owns canonical facts, events,
   projections, persistence, presentation, provider input, and recovery. Name collisions and forbidden parallel
   authorities.
4. `docs/canon/DECISION-INDEX.md` — stable decision ids and short current rulings with canonical owner links,
   original acceptance sources, phase, implementation/evidence state, reopen trigger, and supersession chain.
   Link to detailed specs; do not paste their full prose.
5. `docs/canon/QUESTION-COVERAGE.md` — every P/G/generated question across all twelve waves mapped to `LOCKED`,
   `INHERITED`, `FABLE-PROPOSED`, `EVIDENCE-GATED`, `OPEN-ADAM`, or `DEFERRED`, with the exact source/owner.
6. `docs/canon/OPEN-QUESTIONS.md` — only unresolved material decisions, grouped into batches of at most ten easy
   questions. Technical measurements and later proof gates must not masquerade as founder questions.
7. `docs/canon/GLOSSARY.md` — only terms whose inconsistent use could create two systems or corrupt scope: canon,
   commitment, SceneFact, owner, receipt, SceneLineage, BodyForm, CastRoster, Stub/Working/Developed, active/site/
   cold, exact/anchored/zone/unresolved, proof, playable MVP, feature goal, promotion, renderer/projection, and other
   genuinely overloaded Genesis terms found by the audit.
8. `docs/canon/DOCUMENT-MAP.md` — the durable topic-to-canonical-source routing table plus the document census and
   supersession map. This is where scattered historical/spec/research files remain discoverable without competing
   as current truth.

Update `docs/README.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/NEXT-STEPS.md`, and
`docs/PROCEDURAL-DUNGEON-DIRECTION.md` only as needed to route readers into this canon. Preserve their valuable
earlier text. If one of them remains a canonical registry, say exactly which information it owns; otherwise mark it
as a chronological or compatibility surface and link to the new owner. Do not create two “ultimate” registries.

Every normative claim in the new canon must have a source link. If two accepted sources differ, record the conflict
and apply explicit precedence; never blend them into vague prose. If no authority resolves it, mark `OPEN-ADAM`.

## Remaining questionnaire work

The remaining bank is exactly:

- Wave 7 — Tactical Affordances and Encounter Reshaping: P7.1-P7.12 + G7.1-G7.2
- Wave 8 — Mutable and Destructible Environments: P8.1-P8.12 + G8.1-G8.2
- Wave 9 — DM Strategic Cards and Environmental Authority: P9.1-P9.12 + G9.1-G9.2
- Wave 11 — Workbench, Clay Corpus, and Teaching Loop: P11.1-P11.12 + G11.1-G11.2
- Wave 12 — Migration, Persistence, Acceptance Gates, and Build Order: P12.1-P12.12 + G12.1-G12.2

That is seventy preserved top-level questions before generated follow-ups. Do not turn them into seventy repeated
taste questions. For every question:

1. Recover all answers already entailed by closed Waves 1-6/10, founder rulings, SRD/D&D rules, or another current
   canonical spec. Mark these `INHERITED`; do not ceremonially re-ask them.
2. When the remaining choice is an architecture, schema, indexing, testing, migration, deterministic-resolution,
   performance-measurement, or provider-conformance default with no founder taste fork, draft the best Fable answer
   and mark it `FABLE-PROPOSED`. Explain why, costs, risks, and what evidence may change it.
3. When the question cannot be answered honestly before a retained proof or measurement, specify the experiment,
   metric, competing thresholds, interim truthful behavior, and owner. Mark it `EVIDENCE-GATED`; do not invent a
   number.
4. When materially different choices would change the player's experience, tone, agency, difficulty, DM character,
   privacy/product promise, mod policy, or release scope, mark it `OPEN-ADAM` and present easy A/B/C options with
   concrete dungeon and provider-neutral DM-seat examples, costs, no-cash Mac proof, playable MVP, ideal goal, and
   your recommendation.
5. If earlier canon deliberately defers breadth, retain the exact seam, destination, and promotion trigger and mark
   it `DEFERRED`; “later” by itself is not an owner.
6. Add a generated `F7.x`, `F8.x`, `F9.x`, `F11.x`, or `F12.x` follow-up only for a material uncovered fork. Do not
   manufacture follow-ups for symmetry or volume.

Create a folder/README/running proposed-disposition record/phasing audit for each remaining wave, preserving the
question wording from the master questionnaire. These are `OPEN` or `PROPOSED`, never `CLOSED`, until Adam agrees.
Process in dependency order 7 -> 8 -> 9 -> 11 -> 12, but use cross-wave references so later persistence/tooling
needs can expose an earlier missing seam. Wave 12 may consolidate an implementation plan only after all upstream
`OPEN-ADAM` decisions are visible; it may not authorize a build during this pass.

For every proposed ruling retain:

- plain-English outcome;
- one concrete dungeon example;
- one provider-neutral DM-seat example;
- cost across implementation, authoring/content, runtime/provider, persistence/migration, maintenance, and QA;
- phase class;
- proof prototype;
- playable MVP;
- feature goal;
- non-negotiable seam;
- promotion/reopen evidence;
- known debt and truthful fallback;
- first Clay Pass and integrated MVP gate;
- canonical owner and conflicting/superseded sources.

At the end, reduce all genuine founder decisions to the smallest possible numbered review packet, in dependency
order and batches of no more than ten. Do not ask Adam to approve technical details wholesale merely because Fable
wrote them. Conversely, do not leave an objective technical default as fake indecision.

## Scope and preservation audit

Before declaring this pass ready for Adam, prove the following:

- The existing roughly 2,000-sprite sized corpus, registry height provenance, live true-scale paths, renderer
  research, accepted mock targets, walk/table content, and useful current mechanics remain protected as assets and
  implementation evidence. A narrow proof slice is not a replacement product.
- The no-cash Mac proof, playable MVP, and ideal feature goal are visibly different everywhere; the proof is never
  mislabeled as the game.
- Product scope says what Genesis **is**, what the first playable build must feel like, what it explicitly does not
  promise yet, and which ideals remain tracked rather than forgotten.
- Every accepted ideal has a current seam, named owner, proof/MVP destination, and promotion trigger in the Feature-
  Promotion Ledger.
- Every current system has one canonical owner; projections and adapters do not duplicate truth.
- Every design document has a clear status and canonical route. Historical material remains linkable.
- Every questionnaire id maps to a disposition; no question disappears through summarization.
- Every `OPEN-ADAM` item is genuinely material. Every technical/evidence item has a responsible proposed default or
  test rather than vague deferral.
- Wave 6 remains closed; Waves 7-9/11-12 remain open/proposed pending Adam's explicit closures.
- No implementation, build authorization, asset admission, dependency choice, release claim, or human-usability
  claim was smuggled into the organization pass.

## Verification and handoff

Run proportional documentation checks only:

- `git diff --check` on every changed tracked file;
- verify all new relative links and all questionnaire ids;
- search for stale “current wave,” “answers pending,” duplicate authority, and conflicting open/closed statuses;
- report the docs-only changed paths and any unrelated dirty paths you preserved;
- leave `FULL CI PENDING` for the later final/evening close.

Your final handoff to Adam should lead with:

1. the new canon topology and the single canonical front door;
2. the resulting playable-MVP scope in a short paragraph;
3. the most consequential conflicts or stale documents you reconciled;
4. counts by `LOCKED`, `INHERITED`, `FABLE-PROPOSED`, `EVIDENCE-GATED`, `OPEN-ADAM`, and `DEFERRED`;
5. the first numbered founder-review batch;
6. explicit confirmation that no code/build/merge/push/full CI occurred.

Do not call the pass complete because the files are tidier. It is complete when a new agent can identify the current
product scope, authoritative owner, accepted ruling, phase, implementation/evidence status, historical source, and
remaining question for any major Genesis system without resolving contradictory prose by guesswork.
