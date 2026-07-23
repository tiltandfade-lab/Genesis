---
type: canon
status: ACTIVE — the canonical front door and precedence law
created: 2026-07-22
owner: Adam (content) / maintained in the same change as any canon-affecting decision
---

# Genesis Canon — the front door

**Purpose: answer "where is the current ruling?" in one jump.** This folder is a small routed
canon — an index-and-law layer over the real sources. It duplicates no spec, rewrites no
history, and decides nothing by itself: every normative claim in these files carries a link to
the source that made it. If a canon file and its source ever disagree, the source wins and the
canon file gets fixed.

## The canon files

| File | It answers |
|---|---|
| [PRODUCT-SCOPE.md](PRODUCT-SCOPE.md) | What is Genesis? What ships first? What is only promised? (proof ≠ MVP ≠ goal) |
| [MODULE-PHASING.md](MODULE-PHASING.md) | Proof / playable MVP / ideal goal per game module (Adam's 2026-07-22 per-module ruling; dungeon-program families route to the Feature-Promotion Ledger) |
| [SYSTEM-OWNERSHIP.md](SYSTEM-OWNERSHIP.md) | Which system owns which truth; forbidden parallel authorities; cutover law |
| [DECISION-INDEX.md](DECISION-INDEX.md) | Stable ids over every locked decision family; state + supersession chains |
| [QUESTION-COVERAGE.md](QUESTION-COVERAGE.md) | Every questionnaire id → disposition + owner (all twelve waves) |
| [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) | Only the genuinely-Adam decisions, batched ≤10 |
| [GLOSSARY.md](GLOSSARY.md) | Binding senses for overloaded terms |
| [DOCUMENT-MAP.md](DOCUMENT-MAP.md) | Topic routing + full document census + supersession map + health debt |
| this README | The precedence law below |

**New agent reading order:** CLAUDE.md (operating contract) → docs/HANDOFF.md newest block
(current state) → this folder (current truth) → the specific spec/wave record you're working.

## The precedence law

When sources appear to conflict, resolve in this order — and record the conflict in
DOCUMENT-MAP §7 rather than blending prose:

1. **Adam's explicit rulings and binding doctrines** (DM authority splits, SPEED/TEXT-FIRST/
   BLIND-PLAYABLE, art-canon LAW files, tone rulings). Only Adam amends these.
2. **Closed wave records** (Waves 1-6, 10) on their subjects — the *newest* explicit ruling
   wins within a subject (e.g. W3 §12.13's fixed camera supersedes W10 F10.6g's rotation
   clause), and a later contradiction reopens a wave explicitly, never silently.
3. **`docs/DESIGN.md` dated blocks** — the chronological locked-decision registry. A newer
   block that names what it supersedes wins over an older one.
4. **Accepted system specs** (`type: system-spec` and style canon) within their declared scope.
5. **Implementation evidence** (`docs/ARCHITECTURE.md`, audits, reports) — proves what exists;
   never becomes design authority by existing. A built system that contradicts accepted design
   keeps running under the cutover law (SYSTEM-OWNERSHIP §5) — evidence and target are both
   true, at different tiers, and must be labeled as such.
6. **Plans, research, proposals, historical and superseded documents** — context and options,
   never current truth. Research (R1/R2 etc.) may supply evidence; "none may silently become
   mechanics or canon authority."

Two standing structural rules beneath the order: **status tiers never blur** (a design closure
is not a build; a proof is not the MVP; the MVP is not the goal — PHASING-FRAMEWORK law), and
**one owner per fact** (a second registry, second resolver, or prose-owned noun is a bug —
SYSTEM-OWNERSHIP §4).

## Relationship to the neighbors

- **CLAUDE.md** — the *operating* contract (how to work in the repo). It routes here for design
  truth; nothing here overrides its disciplines.
- **docs/HANDOFF.md / CHANGELOG.md / NEXT-STEPS.md** — chronological operations surfaces: what
  happened, what's next. Never truth registries.
- **docs/DESIGN.md** — remains the chronological decision registry (precedence tier 3);
  DECISION-INDEX is its stable-id lens, not a replacement.
- **docs/PROCEDURAL-DUNGEON-DIRECTION.md** — remains the dungeon *program's* front door (wave
  index, ladder, ledger). This folder is the *whole-game* front door above it. Two doors, two
  scopes, no rivalry (GLOSSARY: "front door").
- **docs/README.md** — the docs folder's navigation index; it routes to both doors.

## Change discipline

Canon files update **in the same change** as the decision they index (the CLAUDE.md coherence
rule). A canon edit is never itself a ruling: it must cite the block/section/ruling that
happened elsewhere. Wave records stay append-only chronological authority; DESIGN.md gains
dated blocks; doctrines change only by Adam. When a document's status/authority changes, route
it in DOCUMENT-MAP (§6/§7) — do not delete or rewrite the document.

*Provenance of this folder: created 2026-07-22 by the Fable canon-and-scope pass
(`../procedural-dungeon-direction/FABLE-CANON-AND-SCOPE-REFACTOR-PROMPT.md`), authorized in
DESIGN.md's 2026-07-22 block. The pass proposed, and Adam's review disposes.*
