---
type: genericization-scan
phase: 1-detection
created: 2026-06-18
---

# Genesis — Genericization Scan (Phase 1: Detection)

Pure pattern scan over **435 files** (281 engine tables · 99 assets · 55 engine docs). Monster files scanned separately. **83 files** carry campaign/IP-specific tokens.

## Hits by category

| Category | Hits | Files | Where it lives / remediation |
|---|---|---|---|
| FR Places | 182 | 49 | Regional/atmospheric/faction tables. → swap for a generic place-name generator or neutral placeholders. |
| FR Factions | 38 | 10 | NPC Faction-Ties tables. → replace with generic faction archetypes (the faction generator you want to build). |
| FR Deities/Lords | 20 | 10 | Scattered oaths/threats. → generic pantheon or invented divine names. |
| FR Cultures (names) | 139 | 16 | NPC name-generator tables (the engine of the problem). → invented culture/name banks — the 'non-Anglo name cultures' build. |
| Campaign (Shifting Vale) | 76 | 27 | Cult/Arcane Order plot + specific adventures. → genericize templates; the Hungering Stone adventures are fully campaign-bound (consider excluding, not genericizing). |
| Celebrity analogs | 113 | 7 | Almost entirely the NPC All-Stars. → keep the personality writeups, strip/replace the '_Analog: <real person>_' labels with archetype tags. |
| Brand/Trademark | 17 | 12 | Stray 'D&D'/'WotC'/'Forgotten Realms' mentions in docs. → remove for any public release. |

## Swap-lists (distinct tokens, by frequency)

**FR Places:** Leilon×60, The Mere×38, Sword Coast×28, Neverwinter×17, Underdark×12, Waterdeep×12, Sword Mountains×9, Mere Of Dead Men×4, Triboar×1, Baldur'S Gate×1

**FR Factions:** Zhentarim×19, Harper×12, Emerald Enclave×6, Harpers×1

**FR Deities/Lords:** Lathander×6, Yeenoghu×5, Gruumsh×5, Lolth×2, Tymora×1, Selûne×1

**FR Cultures (names):** Chondathan×26, Illuskan×24, Tethyrian×22, Turami×14, Damaran×12, Rashemi×11, Shou×10, Mulan×10, Calishite×9, Netherese×1

**Campaign (Shifting Vale):** Arcane Order×26, Hungering Stone×15, Shifting Vale×12, Lord Vane×9, Low Tide×5, Black Serpent×5, Tectonic Fort×2, Goat'S Milk×1, Salt-Crow×1

**Celebrity analogs:** Analog:×106, Harrison Ford×1, Han Solo×1, Meryl Streep×1, Jason Momoa×1, Helena Bonham Carter×1, Nick Offerman×1, Ron Swanson×1

**Brand/Trademark:** Wizards Of The Coast×9, Forgotten Realms×7, Dungeons & Dragons×1

## Top files by hit count

| Hits | File | Categories |
|---|---|---|
| 173 | `Asset Library/NPCs/_NPC Quick All-Stars.md` | FR Places, FR Factions, FR Cultures (names), Celebrity analogs, Brand/Trademark |
| 89 | `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Race Weighted.md` | FR Places, FR Cultures (names), Brand/Trademark |
| 41 | `Engine/03. _Tables/02. Social/Sentient NPCs/NPC If Ignored Regional Effects.md` | FR Places, FR Factions, FR Deities/Lords |
| 39 | `Engine/03. _Tables/01. World Building/Atmospheric & Sensory/Art Depiction.md` | FR Places, FR Factions, FR Deities/Lords, FR Cultures (names) |
| 27 | `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Faction Ties.md` | FR Places, FR Factions, FR Deities/Lords |
| 23 | `Engine/03. _Tables/02. Social/Sentient NPCs/NPC Personality Trait.md` | FR Places, FR Factions, FR Deities/Lords, FR Cultures (names), Campaign (Shifting Vale) |
| 11 | `Asset Library/Adventures/The Hungering Stone v2.md` | Campaign (Shifting Vale), Brand/Trademark |
| 11 | `Asset Library/Adventures/The Hungering Stone.md` | Campaign (Shifting Vale) |
| 11 | `Asset Library/Adventures/Templates/One Player Starting Adventure.md` | FR Places, Campaign (Shifting Vale) |
| 8 | `Engine/00. _System/Cosmological Framework.md` | Campaign (Shifting Vale) |
| 7 | `Asset Library/NPCs/Guard_Honorable Stability.md` | FR Places, FR Cultures (names) |
| 7 | `Asset Library/NPCs/Herbalist_Cult Vector.md` | FR Places, FR Cultures (names), Celebrity analogs |
| 6 | `Asset Library/NPCs/Cult_High Priest.md` | FR Places, FR Cultures (names), Campaign (Shifting Vale), Celebrity analogs |
| 5 | `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Threat Identity.md` | FR Places, FR Deities/Lords |
| 5 | `Asset Library/NPCs/Arcane Order_Field Leader.md` | Campaign (Shifting Vale), Celebrity analogs |
| 5 | `Asset Library/NPCs/Grieving Believer_Cult Vector.md` | FR Places |
| 5 | `Asset Library/Encounter Modules/Urban/01. Low/Damp Blocked Thoroughfare Art Dispute.md` | FR Places, FR Factions, Campaign (Shifting Vale) |
| 4 | `Engine/03. _Tables/03. Session Mechanics/Dungeons/Dungeon Threat Identity T2.md` | FR Places, FR Deities/Lords |
| 4 | `Asset Library/DMG-MM Resource Strategy.md` | FR Places |
| 4 | `Asset Library/NPCs/Arcane Order_Field Scholar.md` | Campaign (Shifting Vale), Celebrity analogs |
| 4 | `Asset Library/NPCs/Councilwoman_Compromised.md` | FR Places, FR Cultures (names), Celebrity analogs |
| 4 | `Engine/00. _System/World Layer Constitution.md` | FR Places, Campaign (Shifting Vale) |

## Monster bucket (separate 'later' set)

**23/374** monster files use D&D Product-Identity creature names (Beholder, Mind Flayer, Githyanki, Slaad, Modron, Yuan-ti, etc.). These need *renaming/reskinning* for public release — a distinct effort from the table genericization, deferred per your call.

## Recommended order (destructive pass, per your approval)

1. **NPC name banks** (`NPC Race Weighted`, `NPC Names`, All-Stars surnames) — the FR-culture tokens; build invented name cultures. Highest leverage (139 hits, the generator core).
2. **NPC All-Stars analog labels** — strip the 7-file, 107-hit celebrity layer; keep the personalities.
3. **Place + faction tables** — wire to generic place/faction-name generators (your 'branch off core D&D' goal).
4. **Campaign-bound assets** — genericize templates; exclude the fully-Leilon adventures.
5. **Brand mentions** — trivial cleanup, last.
6. **Monsters** — separate reskin pass, later.


---

## SRD Cross-Check (added 2026-06-18)

Anything present in **SRD 5.2.1** is CC-BY-4.0 licensed → **keep it, it survives the wipe.** Cross-checked every flagged token against the full SRD text.

### Reprieved (SAFE — in the SRD, do NOT wipe)

- **Underdark** — in the SRD; keep all uses.
- **Shou** (name culture) — in the SRD; keep.

### Confirmed wipe targets (NOT in the SRD)

- **FR Places:** Baldur's Gate, Leilon, Mere of Dead Men, Neverwinter, Sword Coast, Sword Mountains, the Mere, Triboar, Waterdeep
- **FR Factions:** Emerald Enclave, Harper, Harpers, Zhentarim
- **FR Deities/Lords:** Gruumsh, lathander, Lolth, Selûne, Tymora, Yeenoghu
- **FR Cultures (names):** Calishite, Chondathan, Damaran, Illuskan, Mulan, Netherese, Rashemi, Tethyrian, Turami
- **Campaign (Shifting Vale):** Arcane Order, black serpent, Goat's milk, Hungering Stone, Lord Vane, Low Tide, Salt-Crow, Shifting Vale, Tectonic Fort
- **Brand/Trademark:** Dungeons & Dragons, Forgotten Realms, Wizards of the Coast

### Monster reskin list — narrowed to 16 files (genuinely non-SRD)

Arcanaloth, Beholder, Death Tyrant, Githyanki, Githzerai, Kuo-toa, Mezzoloth, Mind Flayer, Modron, Nycaloth, Quaggoths, Slaad, Ultroloth, Umber Hulk, Yochlol, Yuan-ti

Everything else in the monster library is SRD/OGL-safe and survives. These 16 are the iconic Product-Identity creatures the SRD omits — rename/reskin for any public release.

---

## Phase 2 — Executed (2026-06-18)

**Destructive genericization applied: 69 files, 431 replacements.** FR places/factions/deities/cultures + all Shifting Vale campaign specifics → generic placeholder descriptors. Verified: 0 wipe-target tokens remain.

- **Kept (SRD-safe):** Underdark, Shou.
- **Kept (backend reference):** all celebrity `Analog:` labels in the NPC All-Stars (per Adam — not a legal issue as private/backend notes; revisit only at public-release packaging).
- **Untouched:** monster files (the 16-creature reskin is a separate later pass), `Reference/` source files, brand/trademark mentions (they live in backend reference/design docs, not game-facing output).

**Placeholder conventions used (to be replaced by real generators later):** FR cultures → regional labels (Chondathan→Heartlander, Illuskan→Northfolk, Tethyrian→Lowlander…); places → descriptors (Neverwinter→the river city, Sword Coast→frontier coast, Leilon→the frontier town); factions → generic names (Zhentarim→the Shadow Syndicate, Harpers→the Watchers); deities → domain/race epithets (Tymora→the luck goddess, Lolth→the spider goddess, Gruumsh→the orc war-god); campaign → generic (Shifting Vale→the Vale, Black Serpent→the Serpent Cult, Hungering Stone→the Devouring Relic).

**Next:** build the native name/faction/lore/place generators to replace these placeholders with invented content — the point where Genesis fully branches off core D&D.

---

## Phase 3 — Character genesis (2026-06-19)

The character-creation layer (`CHAR-CREATION.md`) brought in two non-SRD bodies of content; both genericized this pass:

- **Biography suite** — the Xanathar's "This Is Your Life" chain (used to seed structure) was **rewritten into original prose** as `Engine/03. _Tables/04. Character Genesis/Life & Origins.md` (+ the `genesis.html` inline `CG`/`CG_CLASS`). Wizards product-identity terms scrubbed: named planes (Feywild / Shadowfell / Astral / Ethereal / Inner / Outer) → generic ("the wild-beyond", "shadow-country", "the space between places", "a country of raw element"); fey/demon/devil/celestial/fiend → "being of the wild-beyond" / "thing of the lower dark" / "thing of light"; Underdark → "the deep places below"; named monsters (slaad, drow, kuo-toa, quaggoth, silver dragon, hag/satyr, archdevil/archfey/demon lord/titan) → generic descriptors; Spell Scroll → "a scroll"; Potion of Healing → "healing draught"; *Wish* → "a single wish"; the "Race" supplemental → "Kind" (the 9 SRD species). Dice ranges, branch logic, mods, and seeding **preserved**; intensity graded along the Spice-Curve bands. The XGE transcription is retained **heritage-only** in `04. Character Genesis/zz_Archive/` (not compiled, not mirrored). A **headless IP-scrub check** (`outputs/cg_harness.js`) guards against regressions.
- **Backgrounds** — the 9 standard archetypes (Charlatan … Urchin) were **rebuilt IP-clean**: original mechanical packages (SRD origin feats only) + original "I became…" prose, never copied from the PHB. With the 4 SRD + 6 Genesis-native, the sheet now offers **19** backgrounds.

**Result:** character genesis is public-release-clean. Remaining genericization work is the 16 Product-Identity **monsters** (Phase-1 list) and the placeholder→native-generator pass (Phase-2 next).
