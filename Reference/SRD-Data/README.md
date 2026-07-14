---
type: srd-data-manifest
source: SRD_CC_v5.2.1 (Creative Commons, 2024 rules)
generated: 2026-06-18
---

# SRD 5.2.1 — Machine-Readable Data

Structured index of the **System Reference Document 5.2.1** (the 2024 D&D rules, CC-BY-4.0), parsed from `../SRD_CC_v5.2.1 (1).pdf` for the Genesis AI DM to query.

**Format is hybrid** (matching the `table-registry.json` + `.md` convention): canonical **JSON** for the high-frequency, queryable entities (spells, conditions, items, weapons/armor) + human-readable **markdown** for prose-heavy reference (core rules, classes, origins). Markdown files are faithful extractions — the DM reads them directly.

The Monster Manual is **not** here — monsters already live in `../../Asset Library/Monsters & Enemies/` (~379 files). This covers everything else in the SRD.

## Files

| File | What | Count |
|---|---|---|
| `spells.json` | Every spell: level, school, classes, casting time, range, components, duration, ritual/concentration flags, description, at-higher-levels / cantrip-upgrade scaling, embedded stat blocks, page | **339** spells (27 cantrips) |
| `spells-index.md` | Browsable spell table grouped by level (school, classes, CT, range, conc/ritual) | — |
| `conditions.json` | The 15 conditions (Blinded → Unconscious), full effect text | **15** |
| `rules-glossary.json` | Full Rules Glossary — every defined term, tagged by category (Condition / Action / Area of Effect / Hazard / Attitude / general) | **155** entries |
| `rules-glossary-index.md` | Glossary terms grouped by category | — |
| `magic-items.json` | Magic items A–Z: type, category, rarity, attunement, description, page | **258** items |
| `magic-items-index.md` | Browsable item table (type / rarity / attunement) | — |
| `equipment-weapons-armor.json` | Weapons (damage, properties, mastery, weight, cost) + armor (AC, strength, stealth, weight, cost) | 38 weapons, 13 armor |
| `equipment.md` | Full Equipment section — gear, tools, mounts, services, weapon properties & mastery definitions | — |
| `classes-species-backgrounds-feats.json` | Name index: 12 classes + subclasses, 9 species, 4 backgrounds, feats by category | — |
| `classes.md` | Full text of all 12 classes + subclasses + spell lists | — |
| `character-origins-feats.md` | Species, backgrounds, and feats (full text) | — |
| `character-creation.md` | Character creation rules | — |
| `core-rules.md` | "Playing the Game" — D20 tests, actions, combat, damage & healing | — |

## How the DM should use it

- **Mid-scene lookups** (a spell's effect, what a condition does, an item's rarity, a weapon's damage) → query the JSON. Each entity is one object with clean fields.
- **Reading a rule or class feature in full** → the markdown files.
- Every JSON entity carries a `page` field pointing back to the SRD PDF.

## Provenance & known edge cases

- Parsed programmatically from the SRD's **clean text layer** (`pdftotext` + `pdfplumber`, column-split + PDF stream-order to keep two-column reading order and floating "Higher-Level" callouts intact). Not vision-read — the SRD text layer is reliable (unlike the scanned MM/DMG/PHB).
- Spell count **339** derived from in-document meta-line delimiters (no duplicates; all fields populated). Cross-checked against class spell lists and key-spell spot-checks (Fireball, Counterspell, Wish, Acid Splash, etc.).
- **Faithful to source:** a few spells (Telekinesis, Greater Restoration, Guards & Wards, Control Weather, Creation) end in flattened tables or list items, or with the SRD's own clipped phrasing — these were verified against two independent extractors and grep; the missing text is not in the PDF, so nothing was fabricated.
- Items correctly **absent** because they are Product Identity (not in the CC SRD): Deck of Many Things, Toll the Dead, Word of Radiance, etc.
- A handful of small-caps subheadings in the markdown (all-lowercase ones like "Round Down") remain lightly spaced; content below them is intact.

## Regeneration

Parsers live in the session scratch (`/tmp/srdwork/`): `common.py` (extractor), `spells.py`, `glossary.py`, `magicitems.py`, `equipment.py`, `sections_md.py`. Not committed — re-derive from the PDF if needed.
