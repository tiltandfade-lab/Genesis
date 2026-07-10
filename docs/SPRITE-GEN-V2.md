# SPRITE-GEN-V2 — regen wave guidelines (Adam's rulings, 2026-07-10)

type: system-spec

Captured from Adam's 2026-07-10 cleanup session so the regen wave doesn't drift.
The previous prompt blocks were good — **salvage, don't restart wholesale**.
Regen instructions below are DRAFT until Adam confirms them (§10).

## 1. Perspective law (RULED)

- **Compatible set: `front` + `side` + `three-quarter` — all at ground/eye level.**
  Eye-level is the actual law; the camera never tilts.
- **Incompatible: `high-angle`, `top-down`.** Quarantined, never mixed in.
- **Items locked to flat-icon** (no camera angle). 103/103 already conform.
- Swarms: **pile-style swarms are the standard** (a mounded mass at eye level);
  scattered/stacked-from-above swarm compositions are the defect class Adam failed.
- Off-angle sprites are never deleted — quarantine bin seeds a future experimental game.
- 2026-07-10 verdicts (Adam's 80 review fails folded in): **1,834/2,329 creatures usable
  (78%) + 100 items**; regen queue 417; off-angle quarantine 78.
  (`dev/model-qa/perspective-survey/final-verdicts.csv`)

## 2. Sheet grid ladder (RULED — cells per generated sheet, by creature size)

| tier | size band | grid | per sheet |
|---|---|---|---|
| T0 | titanic | 1x1 | 1 |
| T1 | gargantuan | 1x1 | 1 |
| T2 | huge | 2x1 | 2 |
| T3 | large | 2x2 | 4 |
| T4 | medium-large beasts | 3x3 | 9 |
| T5 | medium | 4x4 | 16 |
| T6 | small | 5x5 | 25 |
| T7 | tiny | 7x7 | 49 |
| T8 | tiniest of the tiny | 8x8 GRID (confirmed: grid, not pixel size) | 64 |

- **Humanoids: ALWAYS 4x6** (4 cols × 6 rows, 24/sheet) — proven more reliable on
  leg length. Cells taller than wide kill the short-leg squash.
- **Items and tiny creatures: square (1:1) CELL ASPECT is fine** (confirmed: cell
  aspect, not one-per-sheet).

## 3. Canvas aspect = direction hint (RULED)

The generator reads overall canvas aspect ratio as directional guidance per sprite.
Array sprites so cell aspect ≈ subject aspect: vertical subjects → portrait cells;
long quadrupeds/serpents/vehicles → landscape cells.

## 4. Style law (RULED 2026-07-10)

- **Every realm EXCEPT suburb and bright-kingdom: "pixelated but realistic"** —
  pixel-art grit, realistic proportions/materials. NOT painterly (ash's current
  defect), not cartoon/toy.
- Suburb + bright-kingdom keep their own stylized look, judged on internal consistency.
- **Finish law (RULED): per-realm.** Grim realms (theater, gloom, noir, ash, high-seas)
  = grimy dense-dithered finish; brighter realms (fantasy, frontier, lost-world, cosmic)
  may run cleaner/crisper. Coherence within realm, variety across. The 2026-07-10 sweep
  found the lane's -2 sheets cleaner than the codex -01 sheets — theater's three -2
  animal sheets broke realm entirely (circus-whimsy) and regen under theater grit.
- **Kid NPCs (RULED): realistic proportions like theater-kids** — kids are short people,
  same pixel-realistic law. The chibi cosmic-kids + high-seas-kids sheets regen.
- **Bright-kingdom content direction (RULED)**: pull from the **Zelda bestiary move**
  (D&D bestiary reinterpreted in-style — knights, fairies, rock guys, pig guys, skeletal
  wolves; cool before cute) + **Mario enemy grammar** (bold readable silhouette
  archetypes with one-glance threat identity). Menace ceiling: **fairy-tale grim** —
  Brothers Grimm register, toys with teeth, storybook-scary, in-realm. Note: Adam did
  NOT elect to preserve the sugary register — video-game vocabulary leads.
- **Cosmic arcana expansion (Adam 2026-07-10)**: cosmic wants more tarot — major and
  minor arcana as living in-realm characters, Rider-Waite iconography translated into
  the navy-gold cosmic language. 37 sprites added to the cosmic packet: 18 humanoid
  majors, boss-scale Wheel/Death/Tower + the four mounted Knights at large tier, and
  the 12 page/queen/king court. Family tag `arcana` in the manifests.
- **Frontier tribal expansion (Adam 2026-07-10)**: frontier needs native plains people
  on both sides of the line — 34 sprites added: 16 NPCs (elder, chief, medicine woman,
  scout, tracker, families), 12 medium enemies (war party, dog-soldier, shamans, spirit
  threats), 6 large (mounted raider, thunderbird, horned serpent, wendigo, water panther,
  spectral buffalo). Register: grounded and dignified, period plains-nations visual
  vocabulary, never caricature — the register line is baked into the prompts.
- **Suburb Amblin expansion (Adam 2026-07-10)**: suburb = Amblin/Earthbound/Stranger
  Things — kids-on-bikes NPCs + Spielberg neighborhood people with something off at the
  edges; enemy grammar = Earthbound absurd-hostile-mundane beside genuine
  Stranger-Things-grade creatures. 34 sprites added: 16 NPCs, 12 medium enemies
  (G-men, doppelganger neighbor, TV-head, milk-carton ghost), 6 large (petal-head
  stalker, possessed mower, water-tower thing, giant ant, UFO, topiary beast).
- **Gloom VHS-horror expansion (Adam 2026-07-10)**: gloom carries the 80s/90s
  creature-feature canon as homage archetypes in the realm's grim register (dead
  serious, never parody) — 34 sprites: 12 NPCs (final girl, occult librarian,
  video-store clerk who knows the rules, witch of the hollow), 16 medium monsters
  (pumpkin-headed vengeance demon, murderous cobbler-fae, hook-handed mirror legend
  with bees, hockey-mask drowned boy, razor-glove dream-stalker, pale-mask shape,
  puzzle-box ascetic, possessed doll, deadite, sewer clown, corn-cult preacher…),
  6 large (graboid, blob, possessed muscle car, head-splice crawler, gremlin
  swarm-ball, swamp shambler). One iconic accent color per creature over the
  desaturated base.
- **ARMED TOONS LAW (Adam 2026-07-10)**: cute realms carry real weapons — "how is a
  balloon animal gonna get you? even in Roger Rabbit the weasels had guns." Bright-kingdom
  threats are visibly armed: weasel gunmen, hammer-throwing turtle-soldier brothers,
  pig-soldiers with spears/bows, armed toys (nutcracker sabers, teddy-bear axes,
  needle-sword balloon dogs). A portion of even the pet roster carries menace.
- Style-within-realm sweep ran 2026-07-10 (`style-sweep.json`): 6 whole-sheet fails
  (2 chibi kids sheets, 3 theater -2 circus sheets, cosmic-domestic-2 cute-drift),
  37 outlier cells on passing sheets. Ash's lane sheets are NOT painterly (they conform);
  Adam's painterly impression likely points at the older committed ash corpus — check
  before regen-ing ash.

## 5. Palette law

Sprites still self-contain in cramped palettes. Keep the SPRITE-PALETTE color-richness
law (already folded into all regen tiers on the sprite lane) in every prompt block —
chrome hyper-neon, gloom/noir exempt-dark, everything else colorful-within-realm.

## 6. Lighting law

Neutral/ambient base. **Rim lighting is fine** — welcome in realms it suits.
Flag/regen only strong DIRECTIONAL light with cast shadows (bakes a light direction
that clashes on the tabletop). **2026-07-10 sweep verdict: lighting is a NON-ISSUE** —
zero directional violations across all 99 sheets; the corpus sits in flat/ambient/rim.

## 7. Chroma-key law (RULED: key intelligently)

Default **magenta**; **pure green** where magenta occurs in the art (chrome, suburb,
magenta-heavy monster sets). Green-heavy realms (lost-world jungle, bright-kingdom)
stay magenta. **Mechanized per sheet**: run scan-palette on the realm's reference art;
key = whichever of magenta/green is rarest. No hand-choosing.

## 8. Bestiary indexing requirement (NEW 2026-07-10)

> Tag depth upgraded same day: see **docs/SPRITE-TAGS.md** — the casting-grade schema
> (binding law, expression-variant law, castability tiers, DM surprise-play casting flow).
> The manifest slugs below remain the join key; SPRITE-TAGS enriches on top of them.

The ecology has expanded (animals + NPCs + enemies). Every gen sheet must carry enough
metadata that sprites are mechanically indexable into bestiary entries:

- Sheet manifest JSON generated WITH the prompt (before the image comes back):
  per cell — `slug`, `label`, `realm`, `family` (npc/kid/monster/wild/domestic/dungeon/item),
  `sizeBand` (ladder tier), `role/kit hints` for NPCs, `bestiaryId` when it maps to an
  existing statblock, `new:true` when it's a novel creature needing an entry.
- Slugs are the join key: sprite-registry ↔ bestiary ↔ tables. A sprite with no slug
  in a manifest never gets committed.

## 9. Review gates (true final counts)

1. Perspective (eye-level law) 2. Proportion (no short-leg humanoids)
3. Resolution-for-size (ladder) 4. Style-within-realm 5. **Adam outright-FAIL** —
review tool `python3 dev/perspective-review.py` → :5181, writes rulings.json.

Under-res policy: majors regen at their correct tier; **minor under-res mediums also
regen when they additionally border a style-coherence flag** (Adam 2026-07-10) —
one defect tolerable, two means regen.

## 10. THE REGEN INSTRUCTION BLOCK (awaiting Adam's final confirmation)

Every regen prompt is assembled from these clauses, in this order:

1. **Subject block** — realm, family, the cell roster (slugs + labels from the sheet
   manifest, §8), each subject's size band.
2. **Grid clause** — humanoids: 4x6 portrait canvas. Beasts: ladder tier grid (§2),
   canvas aspect chosen to favor the subjects (§3): portrait for vertical subjects,
   landscape for long ones. Items/tiny: square cells.
3. **Perspective clause** — "ground-level/eye-level camera only; front, side, or
   three-quarter views; never high-angle, never top-down; feet on an implied flat
   ground line, no floor plane." **BUG COROLLARY (Adam 2026-07-10 PM — the recurring
   defect):** for insects/bugs/tiny creatures the clause must be spelled out —
   worm's-eye ground camera at the creature's OWN eye level, side/three-quarter
   PROFILE, "as if photographed by another bug beside it"; generators otherwise
   default to looking down at small things. If the back reads more than the side,
   the angle is wrong.
4. **Proportion clause** — "realistic proportions; adult humanoids with legs ~half of
   total height; children as realistically-proportioned kids, not chibi."
5. **Style clause** — "pixelated but realistic" + the realm's finish (grimy-dithered
   for theater/gloom/noir/ash/high-seas; cleaner-crisp allowed for fantasy/frontier/
   lost-world/cosmic) + realm identity line (chrome hyper-neon, cosmic navy-gold, etc.).
   Suburb/bright-kingdom: their own stylized register (bright-kingdom per §4 direction).
6. **Expression clause (EXPANDED 2026-07-10 PM — the FFVI standard)** — "readable
   facial expression on every character at cell resolution; expressive faces are a
   requirement, not decoration. Every CREATURE sells its power and tells its story in
   one silhouette: pose mid-intent (snarl, coiled to strike, mid-cast, hackles up) and
   signature effects where they characterize — drool, sparks, smoke, ember glow,
   dripping venom, crackling energy. No mannequin stillness, no neutral museum poses
   (constructs/uncanny subjects may be still ON PURPOSE, and it should read as
   intentional). Touchstone: FFVI-era spritework — maximum character per sprite."
7. **Palette clause** — the SPRITE-PALETTE richness law for the realm (§5).
8. **Swarm clause** (when applicable) — "swarms as a mounded pile at eye level, not
   scattered/stacked from above."
9. **Chroma clause** — background = the sheet's scan-palette-chosen key (§7),
   solid, filling every non-subject pixel; no background props or floors.

Queue assembly rules: regen queue v3 = 575 sprites (310 under-res + 158 style +
80 Adam fails + 27 short-leg), grouped realm × family × ladder tier; under-res
sprites regen at their CORRECT tier; the 548 minor-under-res keeps stay live and
re-tier opportunistically in later waves. Quarantine (78) exports to its own folder
with manifest, never deleted.

## 10b. THE ADDITIVE FOLD LAW (Adam 2026-07-10 — how regen arrivals enter the corpus)

Regeneration is ADDITIVE, never destructive. Every arriving sheet goes through the same
fold, and nothing good is ever lost to a regen:

1. **Gate** — vision agent judges the arrival against the realm style-ref + its manifest
   (style, grid/roster, perspective, static cells) AND against the art it replaces:
   every gate records **betterThanOld**. A regen that is mechanically clean but loses
   detail/dynamism/menace vs the old art is a CONTENT REGRESSION → **reject**: old art
   stays live, the sheet goes back on the queue with a corrective line (see
   cosmic-large-v3-09, round 2).
2. **Slice** — only passing sheets are cut (chroma key → bbox-trim transparent PNGs,
   chroma kept under alpha); pxHeight re-measured into the sizing file.
3. **Tag** — mood/pose/qaFlags refreshed on the re-cut sprites; identity tags carry over.
4. **Relabel-to-art** — when the generated art doesn't match its rostered subject, the
   display noun follows the ART (overlay `name` override → regenerate the registry;
   mechanical stats keep flowing from the manifest join). The orphaned ROLE is not
   deleted — it goes to the next regen pass as a backfill cell. Labels never lie about
   the art; wants never die, they re-queue.
5. Quarantined art (off-angle, painterly) is never deleted — it exports to
   `dev/model-qa/quarantine-pack/<bin>/` with a manifest and ships as a Desktop zip.

## 10c. THE NO-BLANK-SLOTS LAW (Adam 2026-07-10)

A generation is paid for whether the grid is full or not — **every grid slot carries a
subject**. When a sheet's roster doesn't fill its ladder grid, the empty slots are
filled with **bonus ALT cells**: ancestry/sex alts of roster NPCs, coat/color alts of
animals and monsters, palette variants of high-use roles. Alts are marked in the sheet
manifest (`altOf` + `reason:"alt-bonus"`) so they index like everything else (§8).
Alts of the same subject share style and silhouette DNA but are NOT expression variants
(SPRITE-TAGS law 2) — they are different individuals wearing the same role.

## 11. Still open

1. Adam's final confirmation of §10.
2. ~~Committed-corpus style check (esp. ash)~~ **DONE 2026-07-10**: drift confirmed —
   the 5 ash-mm sheets conform; the 9 npc/kids/domesticated sheets are strongly
   painterly → quarantined (`dev/model-qa/quarantine-pack/painterly-ash/`, Desktop zip)
   and re-queued as **round 3** (`dev/model-qa/regen-v3/round3/`: ash restyle 7 sheets,
   fantasy backfill+true-forms 2, cosmic-large-09 redo 1 — all with §10c alt fills).
3. Round-2 remains partially outstanding: cosmic-r2 (15 sheets) + gloom-r2 (3) never
   arrived; of fixes-r2 only 5 sheets landed (4 folded, cosmic-large-v3-09 rejected
   per §10b).

## 12. Survey artifacts

`dev/model-qa/perspective-survey/`: survey-merged.json (2,431 cells),
final-verdicts.csv (per-sprite verdict incl. Adam's fails), resolution-audit.csv,
shortleg-flags.csv, rulings.json, quarantine-offangle.csv, contact sheets A/B/Q.
Blast radius: 41 codex sheets uncommitted on master root; 58 round-2 sheets
uncommitted in the sprite-gen lane worktree. Commit only post-cull.
