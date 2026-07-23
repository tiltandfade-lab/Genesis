---
type: build-plan
status: SPECCED 2026-07-22 — DEFERRED at the 2026-07-23 founder review (wave-12 §20.7).
  Adam, verbatim: "the docs tooling is deferred a little bit, but we will eventually need
  almost all of them, we just need to see what has changed from that plan, but there are
  solid tools in that mix that will still be very valuable." Execution at a later ops window
  MUST begin with a re-scope pass verifying what has changed since this spec.
owner: build tooling lane (not game code; no game-system implementation involved)
related:
  - "[[canon/DOCUMENT-MAP]]"
  - "[[canon/README]]"
---

# DOCS-INDEX TOOLING — mechanize the document census so it cannot rot

Adam's ruling (2026-07-22): the routed-canon + grep retrieval architecture stands; the upgrade
is mechanization, per the repo's own edit-source → compile-artifact + validator pattern. Two
small Sonnet-executable units. Neither touches game code, game data, or the dungeon program's
implementation hold.

## DI-1 — `build/gen-docs-index.py` → `docs-index.json`

Compile a machine-readable index from every design-relevant markdown file's frontmatter
(scope: `docs/**/*.md`, root `README.md`/`AGENTS.md`/`CLAUDE.md`/`table-registry.md`,
`Engine/00. _System/*.md`, `Engine/02. _Procedures/*.md`; exclude archives' bodies but index
their headers; never read generated data files).

Per file emit: `path, title, type, status, date/updated, class` (the DOCUMENT-MAP census
vocabulary), `owner/supersededBy, canonicalClaims[] (authority slugs the doc claims),
topics[] (optional frontmatter), generated (bool), sizeBytes, headings[] (h1/h2 anchors)`.
Files with missing/unparseable frontmatter emit `class: "unindexed"` + a `debt` flag — the
artifact records the gap, it never invents metadata (validators preserve the thing's job).

- Output at repo root `docs-index.json` (sibling of `table-registry.md`; same committed-but-
  generated class — never hand-edited; regenerate after doc edits).
- Stamp with generator + timestamp + source-file count, like every other compiled artifact.
- The DOCUMENT-MAP census sections (§2-5) become *seeded from* this artifact at the next
  regeneration pass; DOCUMENT-MAP keeps hand-curated §1 routing, §6 supersession chains, and
  §7 debt commentary (generated table + curated overlays — no second truth store).

Acceptance: `python3 build/gen-docs-index.py --emit` produces valid JSON covering ≥ the census
file count (~290); a `--check` mode exits nonzero on any drift between the artifact and
current frontmatter; runs < 5s.

## DI-2 — `build/check-docs.py` — the docs linter (run beside check-manifest)

Gates, each with a clear plain-language failure message:

1. **Frontmatter presence + vocabulary** — every in-scope doc has `type` and `status`;
   `status` begins with one of the controlled tokens (`ACTIVE, LIVING, LOCKED, BINDING, BUILT,
   SPECCED, PROPOSED, DRAFT, OPEN, CLOSED, DEFERRED, PARKED, SUPERSEDED, HISTORICAL, ARCHIVE,
   GENERATED, RESEARCH, REFERENCE, OPS`; free text may follow the token). Existing violations
   enter a committed baseline file (the table-lint pattern) so the gate is green on day one
   and only *new* debt fails; baseline entries burn down in the cleanup sweep (unit DI-3).
2. **Link resolution** — every relative markdown link in `docs/**` resolves to a real file.
3. **Supersession integrity** — every `supersededBy`/`owner` pointer resolves; a doc marked
   SUPERSEDED must carry the pointer.
4. **Single-authority claims** — an authority slug (e.g. `canonical-front-door`,
   `pixel-register-home`, `decision-registry`, declared via a `claims:` frontmatter list on
   the few docs that own one) may be claimed by exactly one non-superseded doc. Two claimants
   = hard failure. This turns the census's duplicate-authority findings into a build gate.
5. **Census sync** — `docs-index.json` is current (delegates to DI-1 `--check`).

Acceptance: `python3 build/check-docs.py` green on the post-cleanup tree; seeded RED tests
prove each gate fires (a missing-frontmatter fixture, a dead link, a double claim); < 5s;
wired into the verify sweep the same way check-manifest is (jsdom-free, CI-safe).

## DI-3 — the one-time cleanup sweep (rides DI-2's baseline)

Burn down the DOCUMENT-MAP §7 stale-status register: flip the "built but says draft/deferred"
cohort (ADVANCEMENT, DIFFICULTY, EVENT-CONTRACT, SOCIAL, DEATH-AND-REBIRTH, the HQ3/hotfix
specs, NPC-coherence cluster, GIT-LFS-MIGRATION, OVERNIGHT-TABLETOP, JOB-WALKS, PLAY-LENS,
REALM-WIRING, REFERENCE-SHELF, KENNEY-MESH-AUDIT…), resolve the header-vs-RESOLVED
contradictions (CHROME/COSMIC/LOST-WORLD re-keys, HOOK-WALKS, SHIP-TRAVEL,
TIYL-WEIGHTED-STARTS, PLACE-GEN), archive FABLE-WINDOW-2026-07-06 per its own mandate, and fix
the two dead pointers (Engine urban-redirect stub; NPC-ROLE-REALMS table-registry path).
Status-only edits — no body prose changes without a per-doc note. Propose-and-confirm for any
doc where built-state is uncertain; the census row is the evidence pointer.

## Sequencing + guardrails

DI-1 → DI-2 → DI-3, one branch each or one `chore/docs-index` branch, normal --no-ff lands.
Queue position: **after Adam's founder Batch 1 / wave sweep**, so the cleanup encodes whatever
statuses those rulings change. Don't-touch: generated data files, Engine table bodies, wave
chronological records (their statuses are governed by the closure protocol, not the linter —
the linter treats `docs/procedural-dungeon-direction/wave-*/` statuses as read-only facts).
Optional later extension (not in scope): a `phase:` frontmatter field validated against
[canon/MODULE-PHASING.md](canon/MODULE-PHASING.md) once that register settles.
