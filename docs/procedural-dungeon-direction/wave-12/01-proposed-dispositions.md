---
type: design-study
status: CLOSED — 2026-07-23 at §20.7 (founder-review session; sweep §20.6; NO BUILD AUTHORIZED — Q12-B reserved)
wave: 12
part: 01
legacy_sections: "20"
source: "[[PROCEDURAL-DUNGEON-DIRECTION]]"
---

# Wave 12 running record — proposed dispositions (section 20)

Question wording preserved verbatim from `../QUESTIONNAIRE.md`. Labels and phasing fields as in
the Wave 7 record. Standing constraint restated: this pass may consolidate visibility; it may
not authorize a build (FABLE prompt; IMPLEMENTATION-HOLD).

## 20.1 Inherited law recovered before any new question

Wave 12 does not re-ask: one sparse canonical record per noun with typed references, current
truth plus typed receipts, content-addressed deduplication, narration stored separately and
never the recovery authority, chunked incremental persistence in IndexedDB-class storage with
atomic migrations, and relevance-scoped retrieval — with the exact codec deliberately reserved
for this wave's measurement (W6 §15.6); Stub/Working/Developed byte envelopes as measurement
budgets (G6.1); one canonical owner with idempotent active/site/cold handoffs (P2.12);
versioned commitment capsules — new generator behavior applies only to new commitments; old
commitments migrate explicitly with provenance (W2 §10.11.17); "Wave 12 must prove old-save
expansion across table/compiler updates, migration chains, mod removal, save/capsule growth,
and corruption recovery" (W2 §10.11.17); typed events as the only mutation path with
detected>declared (EVENT-CONTRACT); recovery rebuilds exact terminal state from the receipt
cursor and never replays mechanics (W10 F10.8c/C1F); IRONMAN-always saves, protection-class
storage, and the retcon-negotiation escape valve (FOREVER-STORAGE); world export/import
(DURABILITY-TRIO); versioned atomic asset migration, rollback, rights quarantine, offline-total
fallback, and separable shipped/local/save ownership (P10.11); frozen same-state evidence
envelopes, hard vetoes then transparent comparison, funded human evidence for external claims,
and Adam's reserved release selection (P10.12); deterministic/batch/human acceptance layers
(P2.20); reproducibility — replay from seeds/inputs for deterministic stages, AI-authored
semantic outputs stored as committed canon (capsules; SYNTHESIZE persistence; "nondeterministic
re-generation is not historical truth" follows directly); the recovery-package gate as the
first gate of any implementation plan (W1 §8.14.1); the golden-beat crosswalk-with-executable-
proof requirement before replacement (W1 §8.11); the cutover law (built systems keep running
until authorized replacement with proof); play/dev release channels; and the no-cash ceiling.

## 20.2 Proposed dispositions

### P12.1 — canonical save boundary
> "Which world, site, graph, room, actor, item, relationship, recipe, resource, clock, card,
> fact, event, knowledge, visual-binding, and provenance state must be saved exactly; what may
> be derived, compacted, cached, or regenerated?"

**Disposition: FABLE-PROPOSED (composition of closed law).**
Save exactly: canonical sparse records (all owners' current truth) · typed receipts/events ·
commitment capsules (latent promises) · knowledge/belief/claims per scope · provenance (table
id/row/band/modifiers/seed; rules-version pins) · TerminalDispositions · SceneLineage cursors ·
hand/deck canonical inputs (owner receipts; the hand itself is a rebuildable projection, F9.1)
· visual-binding *refs* (never payloads) · WHY-records/certifications (W11).
Derive/regenerate freely: projections (trays, boards, digests, maps-as-rendered), mounted
geometry, caches, previews, batch reports. Store separately, non-authoritative: narration/
transcripts (archive lane). Never store: hidden-candidate exploration, provider scratchpads
(G2.1-DM-SCRATCH ephemerality).
Phase: PRE-ALPHA CRITICAL (this boundary is what C1F/C2D already exercise). Seam: the
boundary list versioned with the save schema. Clay: C1F; C2D; C3B. Owner: this record composing
W6/W2/W10 law.

### P12.2 — event, snapshot, and reconciliation model
> "Which changes require durable events, when are snapshots taken, how are detected/declarative
> transactions made idempotent, and how does load/recovery reconcile stale or partially written
> state without duplicating or dropping consequences?"

**Disposition: INHERITED + FABLE-PROPOSED mechanics.** Inherited: every canonical mutation is a
typed receipt with an id (idempotency key); recovery = receipt cursor + terminal rebuild, no
mechanic replay; fail-closed to last-known-good (W2 crisis-provenance law).
Proposal: **chunk snapshots + receipt log** — each owner chunk (per P12.5's chunking) persists
a current-truth snapshot plus its recent receipt tail; a write is atomic per chunk; cross-chunk
transactions use a two-phase receipt (prepared→committed) so a crash between chunks reconciles
deterministically on load (prepared-without-commit rolls back; committed re-applies
idempotently). Snapshot cadence is a measured dial, not doctrine.
Phase: PRE-ALPHA CRITICAL (the seam), cadence EVIDENCE-GATED. Clay: C1F interruption trace +
C3B. Owner: this record.

### P12.3 — schema/table/recipe migration
> "How do versioned schemas, generated tables, effect primitives, semantic recipes, custom
> precedents, renderer contracts, and balance corrections migrate old worlds while preserving
> the rule version that governed historical outcomes?"

**Disposition: INHERITED.** Capsule law answers it: historical outcomes keep the rule-version
pins that governed them; new behavior applies to new commitments; old latent commitments
migrate explicitly, deterministically, provenance-preserved; asset/renderer contracts migrate
atomically with rollback (P10.11); balance corrections are new-version behavior, never
retroactive rewrites. FABLE-PROPOSED thin addition: a **migration registry** — every schema/
table/primitive version bump registers its migrator + an old-save expansion fixture, and the
W2-mandated proof list (table/compiler updates, migration chains, mod removal, capsule growth,
corruption recovery) becomes a standing gate family (P12.9). Phase: MVP (registry from the
first schema version onward). Owner: W2 §10.11.17 + this record.

### P12.4 — dependency loss and replacement
> "What happens when a mod, asset pack, model, custom pattern, primitive, table row, realm
> skin, or external service is missing, retired, quarantined, incompatible, or removed; which
> deterministic fallbacks preserve canon and which worlds must stop honestly?"

**Disposition: INHERITED.** P10.11 owns asset/binding loss (deterministic admitted→legacy→
construction→marker fallbacks; offline-total; quarantine); P2.18's ordered-preservation ladder
generalizes: preserve canon → alternate realization → credible degraded state → honest stop
("no prose patch may pretend an impossible site works" becomes "no fallback may pretend a
missing dependency didn't matter"); provider loss falls to the fiction-first fallback clauses
(never a blocked game); custom precedents (P2+/P3) that lose their pattern quarantine to P0/P1
world-local behavior (fiction never depended on the shared pattern). Worlds stop honestly only
when *canonical truth itself* is unrecoverable — and FOREVER-STORAGE's escape valve governs the
negotiation. Owner: closed sources; no new decision.

### P12.5 — lazy state and context compaction (with G12.1)
> P12.5: "Under G12.1, what facts, recipes, transitions, motifs, causal edges, obligations,
> and provenance survive cold storage and DM-context compaction; what summaries are safe; and
> what must reactivate before play can legally consume it?"
> G12.1: "What canonical facts, selected recipes, source versions, event receipts, cast
> transitions, motif provenance, and causal edges must survive save/load, code/table
> evolution, context compaction, mod removal, and lazy reactivation—and what may be safely
> summarized or regenerated?"

**Disposition: INHERITED.** The compaction constitution is closed: folded-never-erased
(G2.1 lifecycle); conservative obligation-licensed compaction (F10.9m.1); touched/named/unique/
damaged/promised/callback-eligible facts stay exact while safe multiplicity compacts (P2.12);
reactivation applies due events atomically before consumption (P2.12); DM-context compaction is
relevance-scoping, never truth-scoping (G6.1 — summaries are safe only for what receipts can
rebuild); motif provenance and causal edges are receipts, so they survive by P12.1's boundary.
Wave 12 adds only the storage realization (chunking per owner/site/world — already the W6
direction). Owner: closed sources.

### P12.6 — seeds, models, and reproducibility
> "Which generation and resolution stages must replay exactly from seeds/inputs, which
> AI-authored semantic outputs must be stored as committed canon, and how are provider/model
> changes tested without pretending nondeterministic re-generation is historical truth?"

**Disposition: INHERITED.** Deterministic stages (rolls, compilation, propagation ticks,
catch-up) replay exactly from seeds/inputs within their pinned versions (capsules); AI-authored
semantics (SYNTHESIZE outputs, DM interpretations that became canon) are stored as committed
values — canon is never re-generated (W2 §10.11.17 explicitly: explicit facts stored as
values); provider/model changes are tested via the state-hygiene eval + provider-conformance
gates (P10.12's provider-control law; the seat contract), and a swapped provider inherits the
same receipts (F9.1). One operational note (FABLE-PROPOSED, thin): seeded-RNG streams are not
stable across runtimes — harnesses must assert on outcomes/receipts, never on fixed iteration
counts over RNG streams (the 2026-07-19 CI lesson, promoted from ops memory to a standing
reproducibility rule). Owner: closed sources + this note.

### P12.7 — rollback, quarantine, and repair
> "How do corrupt saves, unsafe recipes, broken migrations, bad generated assets,
> contradictory state, failed deployment, and certification mistakes recover through backups,
> transactions, repair tools, migrations, feature flags, or quarantine without destructive
> reset?"

**Disposition: INHERITED + FABLE-PROPOSED repair ladder.** Inherited: IRONMAN + protection-
class backups (FOREVER-STORAGE); atomic migrations with rollback (P10.11); quarantine states
(assets, precedents, autonomy outputs — P10.11/G2.1-CERT/P11.11); feature flags (theater
precedent); play/dev channel separation; the retcon-negotiation escape valve as the last
player-facing resort.
Proposal — the **repair ladder**, ordered like P2.18: transactional rollback (chunk/receipt) →
migration re-run from registry → repair tools operating *through receipts* (never raw state
surgery) → quarantine the offending dependency and fall back deterministically → restore from
protection-class backup → negotiated retcon (escape valve) → honest stop. Destructive reset is
never an automated step. Phase: MVP (ladder enforced in tooling). Owner: this record composing
closed law.

### P12.8 — privacy, portability, and sharing
> "How can players inspect, export, import, duplicate, archive, delete, and share
> worlds/profile patterns while private motifs, personal data, licensed assets, product
> telemetry, and cross-world candidates obey consent, provenance, and isolation boundaries?"

**Disposition: INHERITED skeleton + OPEN-ADAM posture (Q12-A).** Inherited: export/import/
archive built (DURABILITY-TRIO); worlds are origin-local browser data ("the world is the save
file"); private/profile-local vs shippable separation (G2.1-CERT; G9.1); rights/provenance on
assets (P10.11); player-controlled privacy settings (P10.10). Deletion: explicit destroy is
already the only unmaking (DESIGN 2026-06-17). The *posture* — telemetry default, sharing
surface, cross-world candidate consent UX — is a product promise and therefore Adam's (Q12-A).
Proposal as recommended default: **local-first, zero telemetry without explicit opt-in, share
only through explicit export artifacts, cross-world learning per the already-ruled private-
toolbox opt-in.** Owner: closed sources + Q12-A.

### P12.9 — executable acceptance gates (with G12.2)
> P12.9: "Under G12.2, what unit/property/integration/replay/performance/visual/accessibility/
> security/IP/manual gates and golden sessions must pass for each system, wave, build slice,
> migration, and release; which failures block versus warn?"
> G12.2: "What deterministic, IP-clean golden-session trace proves that Genesis can reproduce
> causal generosity across a long cooperative crisis while remaining exact about identities,
> locations, dice, resources, durations, object states, knowledge boundaries, and lasting
> consequences?"

**Disposition: INHERITED layers + FABLE-PROPOSED gate matrix + the flagship trace.**
Inherited: three proof layers with human-judgment cap (P2.20); veto-then-compare evidence law
and funded-human-evidence rule (P10.12); the existing CI posture (jsdom sweep, drift-by-
regeneration, dep-aware skips); blind-playable acceptance session (GEN-LAW-3); ledger update
rhythm (proof→PROVED→MVP recorded).
Proposal: the **gate matrix** — every Clay Pass declares {unit/property fixtures, integration
trace, replay determinism, budget measurement, capture set, accessibility equivalence, rights
audit} with block-vs-warn typed per gate (truth/recovery/legality/leak gates BLOCK; polish/
beauty/perf-target gates WARN until their milestone); migrations always carry their expansion
fixture (P12.3); releases additionally carry P10.12's full portfolio + Adam's selection.
**F12-G (the flagship):** one deterministic, IP-clean golden session — a long cooperative
crisis in original-IP content exercising cast continuity, custody, durations, dice, knowledge
boundaries, callbacks, and lasting consequences end-to-end — built from the state-hygiene
harness + P11.7 continuity assertions; it is the G12.2 answer and the standing regression
spine. Phase: matrix = MVP discipline; flagship = grown with the soak corpus. Owner: this
record over P2.20/P10.12.

### P12.10 — dependency graph and build slices
> "In what order do semantic owners, schemas, compiler, spatial systems, domain adapters,
> renderer, workbench, certification, and migration land; what vertical slices deliver felt
> player value; and which best-case capabilities remain explicit deferred gaps rather than
> hidden scope cuts?"

**Disposition: FABLE-PROPOSED (visibility only — authorization stays Q12-B).**
The order is already substantially accepted; this consolidates it in one place:
0. **Recovery-package gate** (W1 §8.14.1) — before any implementation.
1. **The connected spine** in one retained clay room: C1A→C1B→C1C→C1D (canonical mechanics →
   BattleMat + EngagementLens → seat/fallback → persistence/recovery), then C1E-C1G hardening.
2. **F8.1 breakable door** (first mutation spine) between C1C and C2C.
3. **Composition/surface quality:** C1H, then C1I; furnishing C1J/C1K.
4. **Multi-room causality + first handoff:** C2A-C2D (with C2B consuming the W9 card-registry
   shape; C2C the propagation home).
5. **Post-core modules, separately gated:** travel C2H-C2L; town C2M; separation C2G/C2N;
   secrets C2O.
6. **Site/relational simulation:** C3A-C3C, C4A-C4C (strategy draws, invention conformance,
   crisis ledger); C4D+ feature goals per ledger.
7. **Portfolio growth:** C5 accumulation by uncovered risk toward the twelve sites, workbench
   tooling (W11) growing alongside from stage 1.
Best-case capabilities stay explicit ledger gaps (every DEFERRED/goal row) — no hidden cuts by
construction. Felt-player-value slices: the C1D room fight is the first; C2D the second; C2M
the third. This ordering binds nobody until Q12-B fires; it exists so the authorization
decision is a reading, not a reconstruction.
Owner: ladder/ledger + this consolidation.

### P12.11 — legacy disposition and deployment
> "Which current walk/table/renderer/bridge/state systems are retained, rewired, recomposed,
> feature-flagged, archived, or retired with replacement proof; how are branches, staged
> rollout, local data, observability, rollback, and clean-close responsibilities handled?"

**Disposition: INHERITED.** The golden-beat law owns retention classes with executable proof
before any retirement (W1 §8.11); the cutover law (canon SYSTEM-OWNERSHIP §5) keeps built
systems running until authorized replacement; the 3D theater is feature-flagged, not deleted
(W10); branch/merge/worktree/clean-close discipline is CLAUDE.md law; channels are
RELEASE-CHANNEL; observability = receipts + harnesses. FABLE-PROPOSED thin addition: at build
time each affected legacy system gets one **disposition row** (retain/rewire/recompose/flag/
archive/retire-with-proof + its proof fixture) in the build plan — the Wave 1 classification
made mandatory paperwork. Owner: closed sources.

### P12.12 — final design and build authorization gate
> "Have all inherited contradictions, deferrals, budgets, risks, IP/privacy/security
> obligations, acceptance evidence, production costs, and unresolved choices been made
> explicit; which exact slice is authorized; and what would require reopening a wave before
> implementation?"

**Disposition: OPEN-ADAM by design (Q12-B) — deliberately not answerable in this pass.**
What this pass contributes is the gate's checklist, now visible: every wave's dispositions
accepted (7-9/11-12 currently PROPOSED) · the OPEN-ADAM batch resolved · the recovery-package
gate executed · the gate matrix (P12.9) defined for slice 1 · budgets within the no-cash
ceiling · rights/privacy posture chosen (Q12-A) · the ledger showing no ownerless goal · and
the named reopen triggers (any contradiction with a closed wave reopens that wave explicitly
first). Authorization, when it comes, names one exact slice (the P12.10 spine's step 1) — never
"the redesign." Owner: Adam, at the gate.

## 20.3 Generated follow-up

### F12.1 — storage-engine bakeoff fixture (the codec measurement W6 reserved)
The reserved codec/storage decision needs its instrument. **FABLE-PROPOSED:** one retained
fixture that writes/reads/migrates a synthetic long-world (10k stubs / 1k working / 100
developed records + receipt tails, per the G6.1 envelopes) across candidate configurations
(IndexedDB chunking variants; JSON vs CBOR-class encoding; gzip/Brotli-class compression),
measuring size, write/read latency on the Mac target, migration time, and corruption-recovery
behavior — vetoes first (atomicity, recovery), then transparent comparison (P10.12 pattern).
The winner becomes the pinned codec via one ADR row here. EVIDENCE-GATED by construction; no
founder taste involved. Clay home: alongside C3B.

## 20.4 Founder questions

### Q12-A — privacy, telemetry, and sharing posture (OPEN-ADAM)
The product promise wrapping P12.8's machinery:
- **A. Local-first, zero telemetry, explicit-export sharing only (recommended).** Matches "the
  world is the save file," the no-cash posture, and the private-toolbox opt-in law. Costs:
  no ambient usage data to tune from — tuning relies on soaks and opt-in reports.
- **B. Local-first + opt-in anonymous telemetry.** Same defaults, plus a consent-gated
  diagnostics channel. Slightly better tuning data; adds a consent surface and a promise to
  keep.
- **C. Cloud-sync-first.** Out of character for the current product and cost posture; listed
  for completeness only.
Recommendation: **A** now; B remains a clean later addition because the consent seam already
exists in P10.10's settings law.

### Q12-B — the build authorization itself (OPEN-ADAM; reserved)
Not asked now. It becomes askable when its checklist (P12.12) is green; this pass's only claim
is that the checklist is now written down in one place.

#### Founder ruling — 2026-07-22 (Adam, Batch 1)

**Q12-A: A.** Adam's answer, verbatim: "A." The product promise is local-first, zero
telemetry, explicit-export sharing only — matching "the world is the save file," the no-cash
posture, and the private-toolbox opt-in law. Opt-in diagnostics (option B) is not adopted; it
remains a clean *future* founder decision through the existing consent seam (P10.10 settings
law), never a default. **Q12-A is LOCKED.** P12.8's machinery disposition still awaits the
Wave 12 sweep. **Q12-B is untouched by this ruling and stays reserved** until its P12.12
checklist is green.

## 20.5 Coverage and authority audit (proposed)

All 14 bank questions dispositioned; 1 generated follow-up (F12.1); 2 founder items (Q12-A
now-answerable, Q12-B deliberately reserved). Authority: Wave 12 owns the save boundary,
reconciliation mechanics, migration registry, repair ladder, gate matrix, and build-order
consolidation — beneath every closed wave's semantics and the evidence laws it inherits. No
contradiction with closed waves found while drafting; the codec reservation is honored (F12.1
measures; nothing pinned today). **No closure is claimed; no build is authorized.**

## 20.6 Wave 12 sweep — 2026-07-22/23 founder review (Adam)

Adam swept the thirteen items (P12.1-P12.12 + F12.1) in the plain-language founder review.
Verbatim rulings and their dispositions:

1. **P12.1 — ACCEPTED, with the three-tier worlds rider bound here.** "this sounds good."
   → Per the Wave 11 sweep rider (wave-11 §19.6 item 4), every world record carries its tier
   — **live · test · experimental** — as part of the canonical save boundary, and tiers
   cannot leak into one another (the preview-sandbox flag generalized).
2. **P12.2 — ACCEPTED.** "i hope so!"
3. **P12.3 — ACCEPTED.** "this is the idea, hopefully that will always be the case."
4. **P12.4 — ACCEPTED with founder priority emphasis.** "this is essential, i am already
   starting to lose sleep thinking about a vase not loading and crashing the game." → The
   never-brick guarantee is recorded as essential-tier: a missing anything degrades honestly
   and can never crash or block a world.
5. **P12.5 — ACCEPTED.** "yeah, we might have to find a clever way to compress this
   information, but this is how it is." → The clever-compression question is exactly what
   the F12.1 bakeoff instrument measures; no taste decision pends.
6. **P12.6 — ACCEPTED.** "that sounds right."
7. **P12.7 — ACCEPTED (delegated).** "i'll take your word for it."
8. **P12.8 — ACCEPTED, with a founder product-ethics law recorded verbatim:** "yes, i am
   not a data broker. if at all possible i would like to make this game thrive without any
   dark practices or patterns." → Recorded as the **no-dark-patterns law**: Genesis ships
   without dark practices or patterns — no data brokering, no manipulative retention or
   monetization mechanics, no consent-shaped traps. Indexed as GEN-PROD-7; it wraps and
   exceeds the Q12-A local-first/zero-telemetry posture.
9. **P12.9 — ACCEPTED.** "yes."
10. **P12.10 — ACCEPTED.** "ok." (Visibility only; authorization stays Q12-B.)
11. **P12.11 — ACCEPTED.** "thats right."
12. **P12.12 — ACCEPTED as reserved.** "excellent." (Q12-B stays reserved until its
    checklist is green.)
13. **F12.1 — ACCEPTED.** "yes."

## 20.7 Wave 12 closure — 2026-07-23 (Adam) + session-final rulings

**Closure.** Adam explicitly closed Wave 12: verbatim, **"A close it."** The closure takes
the sweep at §20.6 (all thirteen items ruled, with the three-tier worlds rider bound at
P12.1, the never-brick priority emphasis, and the GEN-PROD-7 no-dark-patterns law), the two
founder items at §20.4 (Q12-A ruled A; Q12-B deliberately reserved, untouched by this
closure), and the phasing audit as presented. Wave 12 is **CLOSED on its recorded phased
basis** — and by this wave's own law, its closure authorizes nothing: the implementation
hold stands; Q12-B remains the single reserved gate, its checklist now visible at P12.12.
**With this closure, all twelve waves of the procedural-dungeon design program are
design-closed.** Reopening any subject requires an explicit named contradiction.

**Ship travel (MODULE-PHASING gap 1) — deferral CONFIRMED, promoted to a phased feature.**
Verbatim: "B let's put it in the features and give it a prototype -> ideal sketch. we do
want it." → Deferred from v1 MVP stands; the module-phasing row now carries a full
prototype→MVP→ideal sketch drawn from the existing SHIP-TRAVEL spec (mobile-home-node
thesis), with its seams (node machinery, passTime tick, codex cast, economy sinks — all
BUILT) and a named promotion act (Adam's SHIP-TRAVEL spec review at the expansion window).

**DOCS-INDEX tooling (DI-1/2/3) — DEFERRED with a re-scope precondition.** Verbatim: "the
docs tooling is deferred a little bit, but we will eventually need almost all of them, we
just need to see what has changed from that plan, but there are solid tools in that mix
that will still be very valuable." → Stays queued; execution at a later ops window must
begin with a re-scope pass verifying what has changed since the 2026-07-22 spec.

**Realm introduction order — founder leaning recorded (new subject, not a closure).**
Verbatim: "one other thing that we didn't discuss is when the other realms get introduced
and which realms get introduced. I think from a standpoint of pure ease of transition, the
Lost World is actually a fairly easy move to make since so many of the assets can be shared
between the wilderness and dungeon textures, i don't have to figure out how to build the
suburbs, or cars, or stuff like that right." → Recorded as a leaning, not a lock: **Lost
World leads the second-realm candidates on asset-transition economics** (wilderness/dungeon
texture sharing; no modern kit to build). The decision itself is reserved to Adam at
expansion planning — carried in canon OPEN-QUESTIONS Batch 2.

## 20.8 P12.12 checklist greening — 2026-07-23 (Fable gate session; mechanical, authorizes nothing)

Executed per `docs/procedural-dungeon-direction/FABLE-Q12B-GATE-SESSION-PROMPT.md`. Every box
of the P12.12 checklist, with evidence; this section makes Q12-B *askable* — it does not fire
it. Adam's ruling, when it comes, gets its own dated section.

1. **Every wave's dispositions accepted — GREEN.** Waves 1-6/10 closed in their records;
   W7 §16.7 · W8 §17.7 · W9 §18.7 · W11 §19.7 · W12 §20.7 (2026-07-22/23 founder review).
   QUESTION-COVERAGE: "The single reserved item is Q12-B (P12.12)."
2. **The OPEN-ADAM batch resolved — GREEN.** Founder Batch 1 discharged (Q7-A B · Q8-A B ·
   Q9-A B · Q9-B B · Q11-A B · Q12-A A, LOCKED) + GEN-PROD-7 no-dark-patterns law. Canon
   OPEN-QUESTIONS Batch 2 holds only future-window decisions (e.g. realm order at expansion
   planning); none gates the slice.
3. **Recovery-package gate executed — GREEN; the restore drill PASSED.** Tag
   `pre-redesign-2026-07-23` at `6ed2473d`; verified all-refs bundle (sha256 `fddaddf9…`);
   LFS-complete materialized zip (sha256 `fcc98350…`, 8,089/8,089 LFS payloads real);
   manifests; drill = archive-only restore → check-manifest OK → served → title screen +
   creator flow live, zero console errors. Full evidence:
   `STAGE-0-RECOVERY-EVIDENCE-2026-07-23.md`. Outstanding by law: W1 §8.14.1 item 6
   (tag push + Drive upload) awaits Adam's explicit authorization.
4. **Slice-1 gate matrix defined — GREEN.** `SLICE-1-GATE-MATRIX.md`: per-pass C1A→C1G
   gates typed BLOCK/WARN under P12.9's typing law, standing gates, founder riders,
   migration rider.
5. **Budgets within the no-cash ceiling — GREEN.** The slice's marginal cost is $0 in
   services (local compute, existing subscriptions/CI); GEN-LAW-9 untouched (matrix §6).
6. **Rights/privacy posture chosen — GREEN.** Q12-A LOCKED at A (local-first, zero
   telemetry, explicit-export sharing); GEN-PROD-7 binds above it.
7. **No ownerless goal — GREEN.** Ledger sweep 2026-07-23: 61/61 rows carry a named
   destination + trigger. Single flag inspected and kept as-is: F7.2's em-dash MVP-gate cell
   is the honest non-applicability disposition of a deferred founder vision (its goal,
   trigger, and owner are all named in the row) — not mechanically patched, per the
   validator law.
8. **Reopen triggers named — GREEN.** Any build-reality contradiction with a closed wave
   reopens that wave explicitly (named contradiction, dated section) before code lands on
   that subject (matrix §7).

**Erratum recorded (label gloss, no reopen):** P12.10 step 1's parenthetical compresses the
DM seat and save/recovery into the "C1C/C1D" labels; the ladder — the pass-id authority —
holds the seat at C1G and save/recovery at C1F. The slice Q12-B names is therefore Stage 1 =
C1A→C1G (the six FEATURE-PRIORITIZATION §3 features); the four glossed systems are all in
it. Details: SLICE-1-GATE-MATRIX §1.

## 20.9 Q12-B FIRED — 2026-07-23 (Adam; the implementation hold lifts for Stage 1 ONLY)

With the §20.8 checklist green, the gate was presented in plain English with eight
pre-implementation calls (each with a stated default, per the assumption law). **Adam answered
all eight decisively in one message; under his standing decisive-answers doctrine ("when Adam
resolves every open spec question concretely in one message, that's the build signal"), this
fires Q12-B.** His answers, verbatim:

> 1. yes, that's fine. how is it lit? i mean we already have a decent lighting system, I
>    don't see why we would downgrade that just to meet some arbitrary "ugly." What I do want
>    to see is the clay room running at full resolution of my macbook. lets get two lights at
>    two dif temps on opposing sides of the room and a low intensity ambient light
> 2. This is a decent cast
> 3. yes, sonnet in the bridge is fine
> 4. yes
> 5. yes
> 6. yes
> 7. yes
> 8. yes

**The authorized slice (and nothing else):** Stage 1 of FEATURE-PRIORITIZATION §3 — the
connected spine in one retained clay room, ladder passes C1A→C1G, the six Stage-1 features,
ending at the felt milestone (Adam plays the C1D room fight, saves, quits, reloads, and it is
all still true). C1H+ / C2+ / all other stages remain under the implementation hold.

**Founder riders recorded from the firing message:**
- **The clay-lighting rider (P12.12-R1):** clay ≠ downgraded lighting. The clay room renders
  through the existing production lighting system at the MacBook's full native resolution,
  staged with two lights at two different color temperatures on opposing sides of the room
  plus one low-intensity ambient light. "Ugly" licenses grey untextured forms — never a
  degraded renderer.
- **Fixture cast confirmed:** 5×5 clay room · one door · one crate · duel = human guard vs
  goblin · mixed-size pair = goblin + ogre (all SRD).
- **DM seat for slice-1 tests + milestone: Sonnet in the bridge**; fallback paths exercised
  synthetically.
- Placement (dev-flagged beside the live game), no migration of Adam's existing browser
  worlds, minimal open-dice surface, the three-checkpoint review cadence, and the bridge-run
  milestone — all confirmed at their defaults.
- **Front-end/back-end gate split (P12.12-R2, from this session):** Claude owns the back-end
  gate with machine-measurable pass receipts; **Adam is the front-end gate** — Claude never
  declares a visual "on"; capture packets carry only countable claims; Adam-approved captures
  become machine-diffed goldens. Encoded in `.claude/skills/genesis-clay-pass/SKILL.md`.

**Still open (not blocking the build):** W1 §8.14.1 item 6 — pushing the recovery tag/branch
to GitHub and uploading the recovery archives to Google Drive await Adam's explicit word;
until then every artifact stays local.
