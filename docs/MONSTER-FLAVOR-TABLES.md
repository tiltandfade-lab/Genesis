---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — Adam's ruling: EVERY monster gets a narrative desc + at least one
  spice-graded d8 flavor table (behavioral variant OR story hook) + its own treasure/habitat/
  activity story fields. Covers BOTH corpora: the 1307 realm creatures and the 510-entry regular
  bestiary. Sonnet-executable per unit; prose is voice-bearing → style rules + review gate.
created: 2026-07-04
related:
  - "[[REALM-ENRICHMENT-WRITING]]"
  - "[[MONSTER-STORY-WIRING]]"
  - "[[REALM-TRAITS-APPLY]]"
  - "[[SPICE-CURVE]]"
---

# MONSTER-FLAVOR-TABLES — every monster is an individual with a table behind it

## §0 The ruling (Adam, 2026-07-04)

"Each monster needs a narrative description, and ideally each monster will get at least one d8
flavor table that decides either a behavioral variant or a story hook. Spice curve engaged. Also
each one needs all of the info like the type of treasure they'll carry and the environments."

State: realm descs are in flight (Phase 2); the 510 regular bestiary has treasure/habitat/
activity/factionFit at 100% but NO desc and only 104 hand-authored custom tables (Adam's d10s —
UNTOUCHED by this spec, they are his). Realm creatures have no own treasure/habitat/activity
(they inherit the frame's, which is wrong fiction — a chrome drone doesn't carry a wolf's
nothing).

## §1 The d8 flavor table (both corpora — the authoring contract)

Per creature, ONE table: `flavorTable: { die:"d8", mode:"variant"|"hook", rows:[{n, band, text}] }`.

- **mode** — author's pick per creature, whichever the concept feeds better: `variant` = eight
  behavioral/physical variants of THIS creature (what's different about this one); `hook` = eight
  story situations this creature arrives carrying (what it drags into the scene). One table, one
  mode — never a mixed grab-bag.
- **Spice mapping (d8 → the curve, flag-to-veto):** r1–5 `Grounded` · r6 `Textured` · r7
  `Strange` · r8 `Volatile` — except creatures with role/realmRole `apex`, whose r8 is `Mythic`.
  Proportions honor the curve's shape at d8 resolution; the engine's band clamp (§4) supplies
  the rarity the flat die can't.
- **Hook-law discipline (ADAM-REVIEW-2, binding):** a `hook` row is a DOER — playable pressure
  in the scene (a want, a wound, a cargo, a pursuer ARRIVING WITH the creature), never
  omniscient lore, never an unbacked quest pointer, never an undefined referent. Variant rows
  change behavior/appearance/tactics — never stats (traits own mechanics).
- **Register:** realm creatures write in their realm's voice (data/realms.js registers);
  bestiary creatures write in the game's core grim-fantasy voice. Original prose throughout;
  6–20 words per row (table rows, not paragraphs).
- **MM grounding (Adam, 2026-07-04 — regular-bestiary corpus only):** for every monster with a
  Monster Manual entry, the author consults `Reference/D&D 5e - Monster Manual 2024.pdf` as the
  QUALITY REFERENCE — its behavioral/ecological identity, iconic reads, and lair habits inform
  the desc and the table's angles. Two hard laws: (1) **VISION-READ ONLY** — the scanned PDFs'
  text layer is broken (CLAUDE.md gotcha); read pages as images via a page-index
  (`dev/model-qa/mm-page-index.json`, built once). (2) **REFERENCE, NEVER COPY** — no MM
  sentences, no MM table rows, no MM-specific proper nouns that aren't SRD; the MM tells you
  WHO the monster is, the prose stays original and IP-clean (same discipline as the SRD-chassis
  stat law). Monsters absent from the MM (Adam's customs) ground on their own source files.

## §2 Data — realm corpus (1307)

Extend the Phase-2b authoring shape in `dev/model-qa/realm-bestiary-draft.json` per creature:
`flavorTable` (§1) + the story fields the frame can't honestly supply:
- `treasure`: the bestiary vocab (`none | individual | hoard`) — what THIS creature carries,
  by its own fiction (the drone carries salvage-grade parts → individual; the swarm carries
  nothing).
- `habitat`: array from the existing 17-value vocab (ruins/cave/forest/…), read as "where this
  realm creature nests when its realm bleeds through" — drives the displaced/fit logic
  (MONSTER-STORY-WIRING §1) inside breaches too.
- `activity`: 1–2 short "what it's doing when found" strings (the `doing` digest line).
`build/gen-realm-bestiary.py` emits all four fields (additive; `--check` validates: die=8, 8
rows, bands from the §1 mapping, mode present, treasure/habitat vocab valid).

## §3 Data — regular bestiary corpus (510)

Adam's Asset Library monster files are HIS — this layer is a parallel generated sidecar, source
files untouched:
- Source: `dev/model-qa/monster-flavor.json` — `{ "<bestiary-id>": { desc, flavorTable } }` for
  ALL 510 ids (desc: the same 2–4 sentence narratable rules as REALM-ENRICHMENT-WRITING §3.1;
  treasure/habitat/activity already live in bestiary.js — NOT duplicated here).
- Generator: `build/gen-monster-flavor.py` → `data/monster-flavor.js` (`MONSTER_FLAVOR`,
  classic script; manifest + genesis.html registered after data/bestiary.js). `--check`
  validates: every key ∈ BESTIARY ids, 510/510 coverage, §1 row rules.
- **The 104 custom-d10 creatures still get a d8** (the d10s are richer cousins, rolled
  alongside — never replaced, never edited).

## §4 Engine — one roll, canon-locked, spice-clamped

Extends the codex-mint flavor block (MONSTER-STORY-WIRING §3's `dm.flavor` — same seam, same
canon-lock law):
- At FIRST mint of a creature, roll its `flavorTable` (realm: from REALM_BESTIARY entry;
  regular: `MONSTER_FLAVOR[statId]`) and store `dm.flavor` alongside any custom-d10 rolls:
  `{table:"flavor-d8", mode, roll:n, band, text}`. Rolled once — the individual's truth forever.
- **The spice clamp ("spice curve engaged"):** the roll's CEILING follows the live context band
  — outside Strange+ contexts (`walkIsStrangePlus()`-family signal / breach state at the mint
  site), a raw 7–8 re-rolls d6 (the table's quiet rows); Strange+ contexts open r7; Volatile+/
  breach opens r8. Soft-until-contact for flavor: quiet worlds meet quiet monsters; the deep
  weird earns the top rows. (Flag-to-veto: this is the mechanism that makes a flat d8 honor the
  1%-Mythic law.)
- Digest: the rolled row rides `combatDigest`'s first-instance block (with desc/traitNote —
  once per foe name, DIGEST-DIET).
- Non-minting mooks: no roll, no loss — flavor tables describe individuals worth remembering.

## §5 Build + verify

Units (dependency order): **F1** gen-monster-flavor generator + manifest seam (buildable
before prose; empty-tolerant `--check --allow-partial` during authoring) · **F2** the 510-desc +
510-table authoring wave (per-type batches ~10 agents, review-gated like Phase 2's desc lane) ·
**F3** realm flavorTable + treasure/habitat/activity authoring (rides Phase 2b with traits) ·
**F4** the engine roll+clamp (stacked behind MONSTER-STORY-WIRING + REALM-TRAITS-APPLY — same
dm.js/combat.js seams).
Harness (extend verify-monster-story.mjs): d8 rolled once + identical on re-mint; clamp: a
Grounded-context mint never stores band Strange+ (500-roll distribution); apex r8=Mythic
honored; MUTATION red-first: remove the clamp → Volatile rows appear in Grounded mints → fail.
check-manifest after every module/data edit; full regression sweep before land.

## §6 Decisions (flag to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | d8 spice mapping r1–5/6/7/8 = G/T/S/V (apex r8 Mythic) | curve shape at d8 resolution; clamp supplies rarity |
| 2 | Spice clamp at mint-time, band-ceiling reroll | flat d8 alone would break the 1%-Mythic law; soft-until-contact |
| 3 | Regular-bestiary layer is a generated sidecar | Adam's monster files are his; edit-source→compile discipline |
| 4 | Custom d10s coexist, never replaced | his tables are his — the d8 is additive |
| 5 | Variant XOR hook per table | a mixed table serves neither; mode tells the DM what the roll means |
| 6 | Realm creatures get OWN treasure/habitat/activity | frame inheritance is wrong fiction; fields drive existing story wiring |
