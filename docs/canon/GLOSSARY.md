---
type: canon
status: ACTIVE — binding definitions for genuinely overloaded terms
created: 2026-07-22
owner: docs/canon/README.md (precedence law)
---

# Glossary — terms whose misuse could create two systems

This is not a vocabulary list. Every entry here is a term that has been used (or could be used)
in two conflicting senses somewhere in the corpus, where picking the wrong sense would corrupt
scope, duplicate an authority, or silently downgrade a promise. Each entry gives the binding
sense and the source that owns it. Terms with a single obvious meaning are deliberately absent.

## State, truth, and knowledge

- **canon** — a committed world fact owned by the engine's state layer. Write-once: later events
  layer over it; nothing silently rewrites it. NOT the same as "text in a canon-titled document"
  (see *style canon*) and NOT the same as a `canonical: true` frontmatter flag on a spec (that
  flag marks the document's registry role, not world truth). Source: `docs/DESIGN.md` §Truth &
  lies (2026-06-17); Wave 1 §8.20.
- **commitment** — the moment a generated possibility becomes canon. Three-tier frontier: seeded
  canon → deterministic latent structure (versioned commitment capsules) → contact/observation
  locks. Topology commits eagerly ("mathematical truth before exploration"); fine detail commits
  at approach time deterministically. Source: Wave 1 §8.20; Wave 2 §10.11.17.
- **owner** — the single system holding authoritative current state for a fact family. Every fact
  has exactly one owner; everything else (projections, adapters, digests, renderers, DM prose) is
  a derived view. "Owner" never means "the doc where it was decided" (that is the *canonical
  source* in [DECISION-INDEX.md](DECISION-INDEX.md)). Source: Wave 2 P2.12; [SYSTEM-OWNERSHIP.md](SYSTEM-OWNERSHIP.md).
- **receipt** — the canonical, idempotent, provenance-bearing record a mechanic commits *before*
  any presentation layer may act. Presentation consumes receipts; it never mutates them, and
  prose is never itself a receipt. Source: Wave 10 §11.16; Wave 2 §10.11.25.
- **knowledge scopes** — dm-only canon / character-private / party-shared / public-established.
  Distinct from truth (canon) and from belief (claims may be false). Source: Wave 1 §8.15.
- **SceneFact** — a promoted scene-level fact in the `SceneFactGraph`, which is "an active causal
  index and transaction surface, never a duplicate owner." Promotion ladder T0 ambient → T1
  pinned referent → T2 active fact → T3 durable projection; lifecycle live→cooled→folded→dormant
  →reactivated→terminal. "Moving on may cool or fold a fact, but may not erase it from the
  world." Source: Wave 2 §10.G2.1.1-.3.
- **TerminalDisposition** — the typed record of how a noun ends (life/continuity, remains,
  location, inventory, recovery, evidence, identity). Replaces the `obliterated` boolean as world
  authority; `obliterated` survives only as a compatibility projection. Source: Wave 2 §10.11.50.

## Body, cast, and depth (Wave 6 family)

- **BodyForm** — the one versioned rules-facing profile an entity's active form supplies: size
  category (a D&D *combat-control footprint*, not anatomy), support footprint, posture volumes,
  height band, reach, mass/load class, movement modes, object-use, long-body/swarm shape,
  equipment envelope. Relates combat-control space to anatomical/render height without inventing
  capability. Source: Wave 6 §15.2/§15.4.
- **CastRoster** — the *player-contact* cast: a sparse stable identity spine plus typed references
  to canonical owners, created only by direct material player interaction. Never a duplicated
  person object; never "every world actor." Pre-contact continuity actors are compact canonical
  exceptions *outside* CastRoster. Source: Wave 6 §15.4-15.6.
- **cohort / latent** — cohort: anonymous untouched multiplicity kept as a group record ("Guard 5
  is only Guard 5"). Latent: unmaterialized possibility entirely outside the semantic ladder.
  Source: Wave 6 §15.4/§15.6.
- **Stub → Working → Developed** — the semantic-depth ladder: how much detail a noun has *earned*
  (monotonic; compaction reduces projection, never unlearns material fact). Orthogonal to both
  axes below. Budget envelopes ≈0.3-1 KB / 1-4 KB / several-tens KB — measurement targets, not
  schema promises. Source: Wave 6 §15.6 (G6.1).
- **active / site / cold** — the activation/projection axis: how a noun is currently represented
  (mounted-exact / aggregated at site scope / cold record). One canonical owner; these are
  projections and handoffs, never three copies. Source: Wave 2 P2.12; Wave 6 §15.6.
- **exact / anchored / zone / unresolved** — the spatial-precision axis, with provenance-bearing
  placement and compaction receipts. Precision may simplify, never falsify. Orthogonal to depth
  and activation. Source: Wave 10 F10.9b; Wave 6 §15.6.
- **waiting-party state** — the exact, self-inert record companions hold at their last legal
  anchor during a PC-only crossing. Not split-party play; nothing advances it except the main
  PC's SceneLineage or an externally owned receipt. Source: Wave 6 §15.4 (P6.5); Wave 10 §11.76.

## Scenes, projection, and presentation

- **SceneTray** — the renderer-neutral scene contract every mode adapter satisfies. A projection
  surface; never a semantic owner. Source: Wave 10 P10.0.
- **SceneLineage** — the typed, idempotent handoff bundle that carries one scene's identity, cast,
  custody, damage, knowledge, obligations, and consequence cursor across mode changes
  (exploration → battle → aftermath, travel, town). Source: Wave 10 §11.70.
- **BattleMat** — the authoritative exact-cell tactical board (cells, elevation, occupancy, cover,
  LOS, areas). Owns spatial truth. Source: Wave 10 §11.1/§11.7.
- **EngagementLens** — the derived, receipt-consuming combat-performance layer. Mandatory in
  pre-alpha ("it is the pre-alpha battle system") but it "cannot independently decide movement,
  reach, cover, line of sight, damage, or object state." Never a second combat authority.
  Source: Wave 10 §11.19, phasing audit.
- **renderer / projection** — any view (BattleMat, lens, cards, text, DM prose, map) derived from
  canonical state. "The renderer never becomes the source of a fact." A projection may reduce
  precision honestly; it may not invent, drop, or decide. Source: FOUNDATION.md §3; Wave 10 P10.2.
- **provider-neutral DM seat** — the DM chair any supported LLM can occupy; every model receives
  the same viewpoint-safe facts, mechanics, schemas, and refusal contracts. "Gemini" in Wave 10
  parts 01-06 names the *current proving provider*, not the product boundary (corrected §11.83).
  Source: Wave 10 §11.83; `docs/DM-SEAT.md`.

## Program, phasing, and evidence

- **design wave** — a semantic questionnaire unit (Waves 1-12). Decides meaning, never build
  size: "design waves do not become implementation waves." Source: PHASING-FRAMEWORK.md law 13.
- **CLOSED (wave)** — Adam explicitly accepted the complete audited bank. Closure records design
  disposition and traceability **only** — no implementation, evidence, dependency admission, CI,
  or release claim. A later contradiction reopens a wave explicitly, never silently. Source:
  QUESTIONNAIRE.md closure gate; Wave 6 §15.8.
- **proof prototype** — the smallest instrumented slice proving one uncertain architecture or
  event family. "Proof is not product": passing it never redefines the MVP downward. Source:
  PHASING-FRAMEWORK.md.
- **playable MVP (pre-alpha)** — the narrow-but-recognizable Genesis loop, containing every
  critical *and borderline* behavior ("if it's a borderline cut we include it for the MVP") at
  narrowed breadth. Source: PHASING-FRAMEWORK.md; Wave 10 §11.66.
- **feature goal** — the accepted mature destination, retained with a named seam, owner, and
  promotion trigger in the Feature-Promotion Ledger. Never an anonymous "later." Source:
  PHASING-FRAMEWORK.md; FEATURE-PROMOTION-LEDGER.md laws.
- **promotion** — movement proof→MVP or MVP→goal after *named evidence* fires. Recorded in the
  ledger; a score or technical green never silently promotes (or retires) anything. Source:
  CLAY-PROOF-LADDER.md vocabulary; Wave 10 P10.12.
- **no-cash Mac proof** — the current evidence regime: everything runs on Adam's existing Intel
  MacBook Pro plus the committed ~$200/month Claude/Codex spend, zero new recurring cost. It
  proves mechanics, exact tactics, provider-neutral DM interaction, persistence, and a bounded
  accessibility trace at a truthful low tier — it is **not** a release-hardware minimum, a beauty
  ceiling, a support claim, or the game. Source: Wave 10 §11.110-11.112.
- **Clay fixture / Clay Pass / Clay stage** — retained deterministic scenario / one small vertical
  implementation unit with one primary risk / a dependency-ordered group of passes. Pass ids
  (C1A…C5) resolve through the Clay Proof Ladder. Source: CLAY-PROOF-LADDER.md.
- **golden site** — one of the twelve named Wave 2 acceptance sites (with eight adversarial
  transition traces): the accumulated product-evidence corpus, never a first build batch and
  never a checklist that manufactures shapes. Source: Wave 2 P2.20; Wave 3 §12.13.
- **golden beat** — a loved *play experience* the redesign must preserve, independent of its
  current mechanism ("Preserve the golden beat, not necessarily the mechanism"). Distinct from
  golden site. Source: Wave 1 §8.11.
- **front door** — two scopes, deliberately distinct: `docs/canon/README.md` is the whole-game
  canonical front door; `docs/PROCEDURAL-DUNGEON-DIRECTION.md` remains the dungeon-*program*
  front door beneath it. Source: this canon set; DOCUMENT-MAP routing.

## Rolls, intensity, and consequence

- **Spice band vs. legs** — band = image-rarity/intensity ceiling (Grounded…Mythic, honest static
  rarity); legs = story potential (dead-end/hook/thread-seed/canon-shift), authored per row. They
  do not correlate and neither implies the other. Source: `docs/SPICE-CURVE.md`;
  `docs/CONSEQUENCE-LADDER.md`.
- **Spice non-cascade laws** — "No downward ceiling" (a parent's band does not cap independently
  rolled descendants) and "no upward averaging" (a child's band does not recolor ancestors).
  Attention deepens detail; it never raises a band. Source: Wave 1 §8.17.
- **Mythic vs. Worldbreaker** — two persisted Crit-reach *profiles* (how far a 20/20 or 1/1 may
  spend its lenses): scene/story-rooted permanence (default) vs. campaign/systemic reach
  (opt-in). A reach envelope, not a frequency or honesty toggle; snapshotted per CheckContract,
  never retroactive. Source: Wave 2 §10.11.42-43.
- **walk** — the rolled segment-chain journey (dungeon/urban/wilderness). The walk segment stays
  canonical; dioramas/trays are field-provenanced projections of it. Distinct from a *bounded
  place* (compiled navigable site) which a walk may enter. Source: `docs/WALK-CARD-DEALING.md`;
  Wave 1 §8.6.

## Documents and registry vocabulary

- **style canon** — verbatim art-direction law (`docs/ART-DEPARTMENT.md` pixel register;
  `docs/ART-DIRECTION-CANON.md` faceted RESERVE register). Quote, never paraphrase. A *style*
  authority — not world canon, not a mechanics owner.
- **`canonical: true` (frontmatter)** — a document-registry flag meaning "this file is the
  registry copy of its subject." It does not make content world-canon, built, or evidence. When a
  flagged doc conflicts with a later accepted wave ruling, the precedence law in
  [README.md](README.md) decides.
- **implementation evidence** — what current code actually does (e.g. `docs/ARCHITECTURE.md`,
  audits, playtest reports). Evidence informs design and proves seams; it never becomes design
  authority by existing. Source: FABLE prompt operating boundary 6; census classifications in
  [DOCUMENT-MAP.md](DOCUMENT-MAP.md).
