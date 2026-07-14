---
type: system-spec
status: specced 2026-07-01 late night — region-identity + culture samples (§4–5) await Adam's review; layer mechanics build-ready. Day-2+ unit (composes with WALK-REFRESH + WORLD-TURN + TRAVEL-WALKS).
created: 2026-07-01
related:
  - "[[SPATIAL-MODEL]]"
  - "[[WALK-REFRESH]]"
  - "[[WORLD-TURN]]"
  - "[[TABLE-GAPS-070126]]"
---

# Regions & Names — the land gets identities; the people get cultures

## §0. Adam's forks (2026-07-01)

Region identity = **full roll-chain on first touch** (name + character + mechanical flavor
vector, write-once canon). Name cultures = **12 banks** (phonology-inspired originals,
Sonnet-drafted to brief, Adam spot-checks), likelihood tied to **race AND region** (blend).

## §1. The region layer (deterministic, lazy — the `terrainAt` trick, one level up)

- **Geometry:** coarse hash-seeded centers (`hash(seed, cellQ, cellR)` at ~9-hex spacing);
  every hex belongs to its nearest center. Zero storage, unbounded, stable — same discipline as
  the hex substrate (never in AI context, script-owned geography).
- **Identity on first touch:** the first time a node/walk lands in an untouched region, roll the
  new **`region-identity`** chain (samples §4): **name** + **one-line character** + the
  **flavor vector** — `{archetypeBias, skinBias, cultures:[2 of 12], econTilt, spiceTilt}`.
  Write-once canon (ledger `canon` + a codex `region` record — recall/Distant-Word fodder).
- **The connection Adam asked for — regions flavor ALL walks in the area,** through machinery
  that already exists after tonight: `archetypeBias` feeds `resolveArchetypePool` weights
  (barrow-country ups undead) · `skinBias` weights the walk-skin roll · the character line rides
  Stage-2 synthesis as a soft prior · `econTilt` nudges shop stock/lodging · urban, wilderness,
  AND dungeon walks at nodes in the region all inherit it.

## §2. The fraying rim gets teeth

`frayLevel(hex) = clamp(hexDist(origin)/FRAY_D)` (constants tunable):
- Walks beyond `FRAY_1`: spice FLOOR +1 band; beyond `FRAY_2`: Mythic ceiling unlocked by default.
- **External pressures anchor rim-ward:** new/escalating external fronts take a bearing toward
  the highest-fray direction — the doom has a geography ("it comes from the northwest").
- Distant Word's Volatile/Mythic rows preferentially cite rim-ward regions (the far away is the
  strange away). Region identities rolled beyond `FRAY_1` roll their character on the stranger
  sub-band.

> SPICE-RAISE (2026-07-06): `fraySpiceFloor` is retired — the fray floor/ceiling is now the tier weight tables (`baseline/fray1/fray2/rim`, `SPICE-RAISE.md` §2a). FRAY_1/FRAY_2/FRAY_D unchanged; they now also key `spiceTierAt`.

## §3. The 12 name cultures

Each: given-name banks (×gender) + a family/clan/epithet pattern, original phonology-inspired
coinages (world-agnostic; no real-world name lists verbatim). **Assignment:** each region's
identity roll assigns 2 of 12; an NPC minted in-region draws `region culture (70%) × species
flavor (30%)` — species banks (megatable) stay for the nonhuman timbre, blended not replaced.
`gen-names.py` grows into `gen-names.py --cultures` emitting `data/names-cultures.js`. TIYL +
world-genesis name options draw from the same banks (§6).

## §4. REGION-IDENTITY SAMPLES — FOR ADAM'S REVIEW

- **The Weeping Downs** — barrow-country that never dries; the dead are neighbors here, salt is courtesy, iron is rude. *(undead/ambusher+ · wet/mournful skins · cultures: Thornwald+Varnic · spice+)*
- **The Copperline** — mine-scarred hills where every stream runs verdigris; a deal is sacred, the water is not. *(construct/ooze+ · ruin/industry skins · econTilt+ · cultures: Ashkarn+Northreach)*
- **The Hush** — forest where sound arrives late, softened, or not at all; woodsmen sign, and nothing howls. *(ambusher+ · muffled/waiting skins · Strange floor+ · cultures: Thornwald+Long-Shore)*
- **The Shatterplain** — glass-flat waste of an old wound in the world; the mirages are honest, the maps lie. *(elemental/extraplanar+ · fray amplifier · cultures: Qadari+Steppewind)*
- **The Ledger Coast** — harbor towns run by tally-priests; debt is liturgy, arrival is confession. *(humanoid/faction+ · commerce/ritual skins · econTilt++ · cultures: Meridian+Sahelian)*

## §5. CULTURE BRIEFS + 3 SAMPLE NAMES EACH — FOR ADAM'S REVIEW

1. **Varnic** (Slavic-timbre): Mirosk, Zvena, Dralec 2. **Sahelian** (West-African-timbre):
Kembe, Asanou, Tiadou 3. **Qadari** (Arabic-timbre): Omran, Zafirah, Rushdan 4. **Long-Shore**
(East-Asian-timbre): Lien-Ma, Choru, Vanh 5. **Northreach** (Norse-timbre): Hedvar, Signy,
Ulfrun 6. **Meridian** (Romance-timbre): Serafina, Duarte, Calvino 7. **Steppewind**
(Steppe-timbre): Ochir, Sarnai, Batukh 8. **Cloudterrace** (Mesoamerican-timbre): Xochil,
Itzamal, Necalli 9. **Reedlands** (Nilotic-timbre): Neferu, Sobeki, Amunet 10. **Islefolk**
(Oceanic-timbre): Manaia, Kealo, Tavita 11. **Thornwald** (Celtic-timbre): Brannoc, Eithne,
Cadwal 12. **Ashkarn** (Persian-timbre): Roshan, Yasmeh, Farzad

## §6. This Is Your Life — directional (morning scout before speccing)

Adam's three asks, held for a seam-scout: (a) **more world-name options** (draw from the culture
banks + a world-name pattern table); (b) **presentation** — TIYL as the ritual it deserves (UI
lane); (c) **deeper prep wiring** — TIYL people/threads pre-cast with FULL `rollNPC` atoms and
seeded into the first session's walks/fronts (beyond today's entry-bundle harvest). Scout the
creator flow + `entrySeeds` first; spec after.

## §7. Build + verify

1. Region geometry + first-touch identity chain + codex/ledger writes. 2. Vector consumers
(archetype weights, skin bias, synthesis note, econTilt). 3. Fray constants + pressure bearing +
Distant-Word citation bias. 4. `gen-names.py --cultures` + the blend rule in `npcRolledName`.
5. Tables: `region-identity` post-§4 approval; culture banks post-§5. 6. `dev/verify-regions.mjs`:
same hex → same region forever (mutation check: break determinism, harness fails) · identity
rolls ONCE, write-once · vector actually shifts archetype weights · fray floors beyond thresholds ·
rim-ward pressure bearing · blended names draw region-first · regression: hexmap/walk suites green.
