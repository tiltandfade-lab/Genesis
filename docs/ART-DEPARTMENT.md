---
type: style-canon
status: LAW — verbatim source, never paraphrase
created: 2026-07-15
sibling: docs/ART-DIRECTION-CANON.md (owns the faceted RESERVE register)
---

# ART DEPARTMENT — the pixel register's canonical home + regeneration runbook

**This is the single authoritative home for the LIVE pixel-sprite register.** It exists because
of Adam's ruling below; everything under it exists to make that ruling permanently true. Same
discipline as `docs/ART-DIRECTION-CANON.md`: the decision-capture rule applies here too — any
pixel-art-direction ruling made in any conversation is appended to this file (dated, in Adam's
words) and committed the same session it's made. If it isn't in this file, it doesn't exist.

## Adam's ruling (2026-07-15, verbatim)

From `docs/ART-DIRECTION-CANON.md` §"THE PIXEL CANON RULING", after the flip-verdict sheet review:

> "i think for now we stick with the pixel art style and just try to get the magenta crud
> cleaned up"

> "the other thing we need to do is make sure that sprites are the canon thing, the docs that
> helped us generate them need to be made a critical part of the art department of this game
> now. those docs should be easy to find, easy to regenerate sprites with with the exact same
> style per realm"

That second sentence is this file's job description. Everything below either points at the exact
doc/script that does the thing, or — where the pipeline doesn't yet reach all the way — says so
honestly instead of pretending.

## Adam's ruling (2026-07-16, verbatim) — the historical 4:5 finding + regen-v3 path

From the round-4 big-creature regen review:

> "the biggest ones should get their own sheet"

> "the 1x1 cell aspect ratio was giving us proportion problems, we had better proportions with 4:5 cell aspects"

> "did you use the format from model-qa/sprite-sheets/ … the fantasy realm has an explicit style"

Captured at the time; the blanket aspect clause is superseded by Adam's 2026-07-24
subject-dependent ruling below. The successful 4:5 character result remains evidence and the
round-4 files remain reproducibility records.

- **4:5 CELL-ASPECT FINDING (blanket rule RETIRED 2026-07-24).** The 1×1 square cell squashed
  character proportions; 4:5 fixed that batch. It is now the general character default, not a
  universal sprite aspect. The biggest creatures (gargantuan/titanic) still get their **OWN
  sheet**, but their cell aspect is selected and tested for their subject rather than inherited
  from the character result.
- **STYLE AUTHORITY (which style block a regen prompt quotes).** Regeneration prompts quote the
  explicit per-realm **`Style block:` line from `dev/model-qa/sprite-sheets/<realm>.md`** — NOT the
  `Style:` lines in `regen-v3/<realm>.md` (those read "clean crisp pixel art / naturalistic palette"
  and are the wrong voice). For fantasy the canonical block is *"…traditional Monster Manual fantasy
  illustration turned pixel-sprite, warm parchment-adjacent palette, painterly dithered shading,
  medium value contrast…"* plus that file's mechanical rules (orthographic side view; expressive
  mid-action pose — mid-lunge/cast/braced/snarling, never a T-pose; full body head-to-toe in-cell,
  no cropping; solid #FF00FF background).
- **Historical round-4 regen path (superseded for NEW production formatting 2026-07-24).**
  `build/gen-regenv3-bigboys.py` reworks the XL/titan regen into the proven regen-v3 sheet
  architecture with the two 2026-07-16 findings baked in. It reads the registry + overlay,
  size-bands the
  regen set, and emits `dev/model-qa/regen-v3/round4/fantasy-r4.md` + `fantasy-r4-manifest.json`
  (GENERATED — never hand-edit; adjust the overlay and re-run). Size→sheet map, all cells 4:5:
  **gargantuan/titanic (eff ≥ 24 ft) → solo (own sheet, 1024×1280) · huge → 1 row×2 (1600×1000) ·
  large → 2 rows×2 (1280×1600) · redo (<9 ft `verdict:fail`) → 4 rows×4 (1280×1600)**. It pulls the
  style block straight from `sprite-sheets/fantasy.md` so it cannot drift. Slugs are the originals,
  so slicing overwrites in place (same slice→defringe→unify→registry→review chain as Runbook A).
  Default scope = every Large+ monster + any smaller `verdict:fail`; `--fails-only` restricts to
  fails + low-res (<110 px) + the true titans. Do not use its fixed-ratio output for a new
  production packet; modernize it against `dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md` after
  the giant/titanic aspect tests rule exact ratios.

## Adam's ruling (2026-07-17, verbatim) — sprite-emote scope

> "ok, my only critique of the sprite editor is that we are most likely not using animation, but we will be adding sprite emotes for a few different emotions, this will mostly be reserved for bosses and PCs"

The Sprite Editor's identity workflow therefore manages discrete expression/emote variants, not
animation frames. Emote sets are exceptional content reserved primarily for bosses and player
characters; ordinary NPC sprites remain a single static standee unless separately licensed.

## Adam's ruling (2026-07-27, verbatim) — sprite-emote factory

> "on top of that a sprite-emote factory would also be nice, like if I could get you to just take any sprite and generate/proof/prove emote states for any monster/pc/npc sprite"

The build-time factory may accept any registered monster, player-character, or NPC sprite. This
expands candidate generation and proof coverage, not automatic runtime admission: the earlier
boss/PC priority remains the default content budget, while any other sprite can be separately
licensed after technical and visual review. Emotes remain discrete static states, never sprite
animation frames. The factory contract and its expansion roadmap live in `docs/ASSETFORGE.md`.

## Adam's ruling (2026-07-27, verbatim) — canonical emote pack and rear view

> "we probably need emotes like neutral, angry, happy, near death, resting, and facing the other direction"
>
> "as in viewed from behind"

The default factory pack is therefore `neutral`, `angry`, `happy`, `near-death`, `resting`, and
`rear-view`. Rear view means the same individual turned 180 degrees and genuinely viewed from
behind—not a horizontally mirrored front sprite. It is the one default state licensed to change
view direction; scale, ground line, projection, body identity, and physical equipment attachment
remain locked.

## Adam's ruling (2026-07-27, verbatim) — resting emote pose

> "resting should be more like a seated pose, think of ramza in the field blowing the grass"

Resting is a quiet seated field-rest pose: contemplative, momentarily unguarded, and visually
compressed. The reference supplies pose logic, not licensed scene content—do not add literal grass,
landscape, or another game's character design. Seated compression uses its own proof envelope
instead of being falsely rejected as scale drift; identity, ground contact, equipment, palette, and
play-scale review remain binding.

## Adam's ruling (2026-07-27, verbatim) — rear-view anatomy screen

> "his hand is a little weird in the rear view shot, make sure the process screens for that"

Every emote ingest must emit a mandatory state-by-state visual checklist. It explicitly screens
limb and hand anatomy, plausible grips/contact, equipment presence/attachment, silhouette
continuity, and play-scale read. Rear view additionally proves true back construction and rear
equipment attachment. These are visual-review gates, not fake pixel heuristics: any failure rejects
the candidate, any blank keeps review incomplete, and technical metrics cannot promote it.

## Adam's ruling (2026-07-17, verbatim) — sprite retirement

> "i also need the ability to retire a sprite from the sprite editor"

The Sprite Editor must offer an explicit retirement workflow for live sprites. Retirement is a
separate, recorded lifecycle action—not a destructive replacement or a normal save—and should
preserve the asset identity and reason/reference needed to trace what replaced it.

## Adam's ruling (2026-07-23, verbatim) — reject the goblin's contradictory weapon read

> "i just realized how dumb that goblin sprite is, he's holding a sword and a bow"

The current Clayroom goblin sprite does not pass canonical standee review: its simultaneously-held
sword-and-bow loadout reads as one incoherent pose, not a deliberate equipment choice. Preserve the
asset until the governed sprite retirement/regeneration workflow replaces it, but do not use this
specific pose as a positive scale, silhouette, or equipment reference for future sprite generation.

## Adam's ruling (2026-07-18, verbatim) — runtime warp and DM-hand motion

> "there actually is another feature. i forgot that there IS animation, just not sprite animation. we have warp animation to the sprites to suggest combat and interactive actions, plus DM hand movement of pieces. I would like a workshop to be able to edit those animations or tweak them"

Genesis sprites remain static source images with discrete emote variants where licensed. Their
runtime movement register includes procedural sprite warps for combat/interaction verbs and DM-hand
piece movement. Those motion recipes are editable as deterministic runtime data through the Dev
Portal's Warp & Motion Workshop; they are not authored frame sequences or replacement sprite art.

## Adam's ruling (2026-07-24, verbatim) — preferred packet format + subject-dependent aspect

> "before we start producing sprites, let me drop to a lower codex model, but that means the
> sprite production sheet needs to be very explicit dev/model-qa/sprite-sheets has a great format
> for batch sprite production, if you can find any conflicting sprite sheet formatting
> instructions, please retire those and ensure that the formatting from these documents is the
> preferred formatting. that's nto to overwrite the standing dynamic aspect ratio for different
> things, make sure aspect ratio is considered for the subject of the sprite. characters are
> generally 4:5, giant and titanic should probably be 4:6 but we will determine those exact ratios
> through testing"

Captured as law:

- **PREFERRED PACKET FORMAT.** New production packets use the document grammar proven in
  `dev/model-qa/sprite-sheets/`: exact realm `Style block:` → complete shared mechanical block →
  named sheet sections → numbered row-major cells with explicit identity/pose cues. The executable
  contract and copy-ready template are `dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md`.
- **LOWER-MODEL EXPLICITNESS.** Every sheet states its subject class, body plan, size band, subject
  count, grid columns, grid rows, capacity, cell aspect, aspect status/reason, requested canvas,
  chroma key, camera, order, exact filename, inspection rules, and receipt. A worker never infers
  them from a previous sheet or an unlabeled `4×6`.
- **DYNAMIC ASPECT SURVIVES.** Aspect follows the subject's real silhouette and important
  extremities. Characters generally start at **4:5**. **4:6 for giant/titanic subjects is a
  PROVISIONAL TEST CANDIDATE**, not canonized as exact until comparative captures are ruled.
  Long quadrupeds, serpents, vehicles, wings, items, and dressing use their truthful declared
  aspect rather than a universal portrait cell.
- **GRID IS NOT ASPECT.** Grid is always recorded as `gridColumns` + `gridRows`; one cell is always
  recorded as `cellAspect W:H`. The proven 4-column × 6-row humanoid density does not mean a 4:6
  humanoid cell.
- **RETIRED CONFLICTS.** Fixed 6×6/36, fixed 5×5/25, fixed 1×4, universal square, universal 4:5,
  and universal 4:6 remain historical packet facts but have no authority over new production.
  Historical prompts and returned art remain intact for reproducibility.

---

## 1. The canon declaration

**The pixel sprite corpus (`assets/sprites/`, `artStyleVersion` v3) is THE live creature/NPC
standee register.** Per ART-DIRECTION-CANON.md's scoping: "the LIVE creature/NPC standee
register is the PIXEL corpus (`assets/sprites/`, the v3 generation) and its style authorities
(docs/SPRITE-GEN-V2.md, the CLEAN-SHAPES amendment, the realm master palettes, the per-realm
outline law) — consolidated into `docs/ART-DEPARTMENT.md`." The faceted corpus
(`assets/sprites-faceted/`) remains a **reserve**, re-admissible per-creature
(`FACETED_FLIP_ENABLED` is the one-flag revert; see DESIGN.md 2026-07-15 "PIXEL-FIRST" entry) —
it is governed by ART-DIRECTION-CANON.md, not this file.

### Live-corpus state (verified against disk 2026-07-15)

| realm | live in `assets/sprites/` | staged (not folded) in `dev/sprite-sheets/incoming/v3/<realm>/` |
|---|---:|---:|
| fantasy | **680** | 14 (round-3 backfill/true-forms, see §4) |
| pc | **216** | — |
| theater | 0 | 133 |
| frontier | 0 | 95 |
| high-seas | 0 | 85 |
| cosmic | 0 | 83 |
| chrome | 0 | 55 |
| bright-kingdom | 0 | 45 |
| suburb | 0 | 42 |
| ash | 0 | 32 |
| lost-world | 0 | 33 |
| noir | 0 | 17 |
| gloom | 0 | 16 |

Counts are exact file counts (`find assets/sprites -iname "spr-fantasy-*"` = 680,
`spr-pc-*` = 216; `find dev/sprite-sheets/incoming/v3/<realm> -type f` per row) — not carried
over from a stale report. **Only fantasy + pc are live.** The 10 staged realms exist as sliced,
named PNGs (`<realm>-<slug>.png`, no `spr-` prefix — the tell that a sprite hasn't been folded
yet) but are not in `assets/sprites/` and not renderable in game. They **do** already have
placeholder rows in `data/sprite-registry.js` — `v2-manifest.json` pre-joins the full roster
for all 12 realms + pc (§5), so a theater/frontier/etc. slug already exists there with
`status:"pending"` (no file on disk); folding a realm in flips `pending` → `cut`, it doesn't
create the entry. Folding one in is Runbook B (§7).

*Registry hygiene note, found while verifying the above:* the registry's `status:"cut"` count
for fantasy+pc combined is currently **956** (701 fantasy + 255 pc), not 896 — 60 of those
slugs have no matching file on disk right now (spot-checked: mostly PC class/species combos and
a handful of fantasy slugs with compound-merged names like
`spr-fantasy-red-dragon-wyrmling-white-dragon-wyrmling`, consistent with the "Relabel-to-art"
step of §10b renaming/merging a slug after the registry's last regen). `status:"cut"` is a
snapshot taken at generation time, not a live disk check — it goes stale the moment a file is
renamed or removed afterward. Disk truth (the 680/216 table above) is what actually renders;
the registry should be regenerated (`python3 build/gen-sprite-registry.py`, §6 step 8) before
trusting its `cut` count for anything precise.

---

## 2. The style law index

| law | lives in | load-bearing clause |
|---|---|---|
| Perspective (eye-level only) | SPRITE-GEN-V2.md §1 | quoted §3 below |
| Grid ladder (cells per sheet by size) | SPRITE-GEN-V2.md §2 | quoted §3 below |
| Style + CLEAN-SHAPES + per-realm finish | SPRITE-GEN-V2.md §4 | quoted §3 below |
| Palette richness (pre-VP1.5) | SPRITE-GEN-V2.md §5 | quoted §3 below |
| Chroma-key (magenta/green) | SPRITE-GEN-V2.md §7 | quoted §3 below |
| Regen prompt clause order | SPRITE-GEN-V2.md §10 | Runbook A, §6 |
| Additive-fold law (how art arrives) | SPRITE-GEN-V2.md §10b | Runbook B, §7 |
| Realm master palettes (32-48 colors) | BEAUTY-WAVE.md VP1.5 | quoted §3 below |
| Outline law (per-realm) | BEAUTY-WAVE.md "OUTLINE LAW" | quoted §3 below |
| Palette DATA (generated) | `dev/model-qa/realm-palettes/<realm>.json` ×13 | generated by `build/gen-realm-palettes.py` — never hand-edit |
| Style-ref anchor images | `dev/model-qa/regen-v3/style-refs/<realm>-style-ref.png` ×12 | pc has none — aliases fantasy, see §4 |
| Sprite casting/tag schema | `docs/SPRITE-TAGS.md` | binding law for slug metadata, layered on top of the manifest join key |
| Packet format + subject-dependent cell aspect + biggest-own-sheet | this file, "Adam's ruling (2026-07-24)" + `dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md` | explicit format; character 4:5 default; giant/titanic 4:6 provisional |
| Regen-prompt style block (per realm) | `dev/model-qa/sprite-sheets/<realm>.md` `Style block:` line | the canonical style a regen prompt quotes — NOT `regen-v3/<realm>.md`'s `Style:` lines |
| Historical big-creature regen generator | `build/gen-regenv3-bigboys.py` → `regen-v3/round4/fantasy-r4.md` | reproduces the 2026-07-16 packet; biggest-own-sheet finding retained, fixed 4:5 formatting retired |

---

## 3. The load-bearing clauses, quoted verbatim

### Perspective law (SPRITE-GEN-V2.md §1)

> **Compatible set: `front` + `side` + `three-quarter` — all at ground/eye level.**
> Eye-level is the actual law; the camera never tilts.
>
> **Incompatible: `high-angle`, `top-down`.** Quarantined, never mixed in.

### Grid-density ladder + subject-dependent aspect (SPRITE-GEN-V2.md §2-3)

`gridColumns × gridRows` below describes sheet density, never cell aspect.

| tier | size band | gridColumns × gridRows | per sheet |
|---|---|---|---|
| T0 | titanic | 1x1 | 1 |
| T1 | gargantuan | 1x1 | 1 |
| T2 | huge | 2x1 | 2 |
| T3 | large | 2x2 | 4 |
| T4 | medium-large beasts | 3x3 | 9 |
| T5 | medium | 4x4 | 16 |
| T6 | small | 5x5 | 25 |
| T7 | tiny | 7x7 | 49 |
| T8 | tiniest of the tiny | 8x8 GRID | 64 |

> **Character density option: `gridColumns: 4`, `gridRows: 6`** (24/sheet) — proven more
> reliable than the older crowded character batches when combined with portrait cells.

**Current aspect law (Adam 2026-07-24):** aspect is subject-dependent. Characters generally use
`cellAspect: 4:5`. Giant/titanic subjects keep their own sheet and begin with a **provisional**
`cellAspect: 4:6` test candidate; exact ratios wait for comparative captures. Long or wide subjects
use declared landscape cells. Square remains legal for genuinely square subjects. See the explicit
decision and packet schema in `dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md`.

### Style law + CLEAN-SHAPES + per-realm finish (SPRITE-GEN-V2.md §4)

> **Every realm EXCEPT suburb and bright-kingdom: "pixelated but realistic"** —
> pixel-art grit, realistic proportions/materials. NOT painterly (ash's current
> defect), not cartoon/toy.

> **CLEAN-SHAPES AMENDMENT (Adam 2026-07-10 night — the beauty review):** clean value
> shapes FIRST, grit as seasoning. Dither confined to shadow regions and edges — never
> mid-tones; large flat value planes carry the form; silhouette-first. Every sheet is
> JUDGED AT 50% ZOOM (play distance) — grit that reads as noise at half size fails.
> Grim realms keep more seasoning than bright ones; nobody dithers mid-tones.

> **Finish law (RULED): per-realm.** Grim realms (theater, gloom, noir, ash, high-seas)
> = grimy dense-dithered finish; brighter realms (fantasy, frontier, lost-world, cosmic)
> may run cleaner/crisper. Coherence within realm, variety across.

> **ARMED TOONS LAW (Adam 2026-07-10)**: cute realms carry real weapons — "how is a
> balloon animal gonna get you? even in Roger Rabbit the weasels had guns." Bright-kingdom
> threats are visibly armed.

Kid NPCs: **"realistic proportions like theater-kids** — kids are short people, same
pixel-realistic law." Bright-kingdom content direction: **"the Zelda bestiary move"** (D&D
bestiary reinterpreted in-style, cool before cute) + **"Mario enemy grammar"** (bold readable
silhouette archetypes), menace ceiling **fairy-tale grim**.

### Palette richness law, pre-VP1.5 (SPRITE-GEN-V2.md §5)

> Sprites still self-contain in cramped palettes. Keep the SPRITE-PALETTE color-richness
> law (already folded into all regen tiers on the sprite lane) in every prompt block —
> chrome hyper-neon, gloom/noir exempt-dark, everything else colorful-within-realm.

### Chroma-key law (SPRITE-GEN-V2.md §7)

> Default **magenta**; **pure green** where magenta occurs in the art (chrome, suburb,
> magenta-heavy monster sets). Green-heavy realms (lost-world jungle, bright-kingdom)
> stay magenta. **Mechanized per sheet**: run scan-palette on the realm's reference art;
> key = whichever of magenta/green is rarest. No hand-choosing.

### Realm master palettes (BEAUTY-WAVE.md VP1.5, ruling #2/#3/#7)

> **REALM MASTER PALETTES:** derive a fixed 32-48 color palette per realm — seeded from
> the realm's style-ref PNG + kit/grade colors (k-means over the style ref, then hand
> room for skin/metal ramps; emit `dev/model-qa/realm-palettes/<realm>.json`, a
> GENERATED artifact with a build script). Every sprite quantizes to its realm's
> palette at slice time (nearest-color, alpha untouched, NO dithering added).

The **live** generator is `build/gen-realm-palettes.py`, which superseded the r1 version cited
above — its own docstring (verified) states the amendment: derivation is k-means over the
**union** of the style-ref PNG *and* a sampled histogram of the realm's own cut-sprite corpus
(coverage anchor, so hue families the style-ref under-represents — e.g. fantasy's green
constrictor snake — still get a palette slot), plus a **CHROMA-KEY FORBID** (no palette entry
within RGB-distance 60 of `#FF00FF`/`#00FF00`). Run with no flags: `python3
build/gen-realm-palettes.py`.

### Outline law (BEAUTY-WAVE.md "OUTLINE LAW", ruling #5)

> One outline treatment per realm, no mixing. Flagship defaults (Adam may red-pen):
> **fantasy** = selective dark-umber outline (outer silhouette only) · **gloom** = full
> 1px near-black outline (the VHS-horror cel look) · **chrome** = NO line; neon rim-edge
> carries the silhouette. Others drafted in `realm-palettes/<realm>.json` (`outline:` field)
> and applied when their expansion ships.

Verified against the live data: `fantasy.json` → `"outline": "selective-dark-umber"`,
`gloom.json` → `"outline": "full-near-black"`, `chrome.json` → `"outline": "none"`. The other 9
realm JSONs (+ `pc.json`) all currently read `"outline": "tbd"` — see §9.

---

## 4. Per-realm style table

The table preserves touchstone lines from `dev/model-qa/regen-v3/<realm>.md`'s historical
`Setting:` headers and identifies the packets used for the last completed regen wave. They are
evidence, not the current prompt-style source. New production quotes the exact `Style block:` from
`dev/model-qa/sprite-sheets/<realm>.md`, which also remains the roster/join-key source for
`dev/sprite-manifests/v2-manifest.json` (§5).

| realm | touchstone (Setting) | palette JSON | outline | status | regen-v3 packet | original roster prompts |
|---|---|---|---|---|---|---|
| fantasy | "classic high-fantasy realm — naturalist medieval world." | `realm-palettes/fantasy.json` | selective-dark-umber | **LIVE** (680) | `regen-v3/fantasy.md` + `regen-v3/round3/fantasy-r3.md` (backfill/true-forms) | `sprite-sheets/fantasy.md` + `sprite-manifests/XL-REGEN-PROMPTS.md` (XL/titan, fantasy-only, §6) |
| pc | (aliases fantasy — no style-ref of its own; `STYLE_REF_ALIAS = {"pc": "fantasy"}` in `gen-realm-palettes.py`) | `realm-palettes/pc.json` | tbd | **LIVE** (216) | — | `sprite-sheets/pc-characters.md` ("matches the `fantasy.md` default-world style so PCs and monsters share one visual language") |
| theater | "endless-war theater realm — WWI trench grime, mud, rust, gas-haze, war-torn cloth." | `realm-palettes/theater.json` | tbd | staged (133) | `regen-v3/theater.md` | `sprite-sheets/theater.md` |
| frontier | "wild-west frontier — sun-bleached earth tones, period costume, weathered wood and leather." | `realm-palettes/frontier.json` | tbd | staged (95) | `regen-v3/frontier.md` | `sprite-sheets/frontier.md` |
| high-seas | "drowned age-of-sail realm — brine, barnacle crust, kelp rot, weathered rope and teal spectral glow." | `realm-palettes/high-seas.json` | tbd | staged (85) | `regen-v3/high-seas.md` | `sprite-sheets/high-seas.md` |
| cosmic | "midnight cosmic-Egyptian realm — deep navy bodies traced with gold constellation sigils, eldritch star-flesh." | `realm-palettes/cosmic.json` | tbd | staged (83) | `regen-v3/cosmic.md` + `round2/cosmic-r2.md` (15 sheets, **never arrived**) + `round3/cosmic-r3.md` (1 sheet, corrective redo) | `sprite-sheets/cosmic.md` |
| chrome | "neon-cyberpunk chrome city — gunmetal machines and street-level cyberpunk figures with hyper-neon emissive accents." | `realm-palettes/chrome.json` | **none** (neon rim-edge) | staged (55) | `regen-v3/chrome.md` | `sprite-sheets/chrome.md` |
| bright-kingdom | "bright toy kingdom rebuilt in Nintendo-era video-game vocabulary — the Zelda move… Mario-grammar… fairy-tale grim underneath… Roger Rabbit rules: even the weasels carry guns." | `realm-palettes/bright-kingdom.json` | tbd | staged (45) | `regen-v3/bright-kingdom.md` | `sprite-sheets/bright-kingdom.md` |
| suburb | "uncanny modern suburbia — groomed surfaces hiding menace." | `realm-palettes/suburb.json` | tbd | staged (42) | `regen-v3/suburb.md` | `sprite-sheets/suburb.md` |
| ash | "volcanic ash wasteland — basalt hide, ember cracks, rust, toxic biolume." | `realm-palettes/ash.json` | tbd | staged (32) | `regen-v3/ash.md` + `round3/ash-r3.md` (7 sheets, painterly-ash replacement) | `sprite-sheets/ash.md` |
| lost-world | "prehistoric lost-world jungle — dinosaurs and primeval fauna." | `realm-palettes/lost-world.json` | tbd | staged (33) | `regen-v3/lost-world.md` | `sprite-sheets/lost-world.md` |
| noir | "rain-slick noir port city — sepia and soot, streetlamp monochrome." | `realm-palettes/noir.json` | tbd | staged (17) | `regen-v3/noir.md` | `sprite-sheets/noir.md` |
| gloom | "funerary gloom realm — desaturated mourning tones, bone, wilt." | `realm-palettes/gloom.json` | **full-near-black** | staged (16) | `regen-v3/gloom.md` + `round2/gloom-r2.md` (3 sheets, **never arrived**) | `sprite-sheets/gloom.md` |

Historical `regen-v3/<realm>.md` `Style:`/`Palette:` lines remain useful evidence (e.g. fantasy:
*"clean crisp pixel art with realistic materials… Palette: naturalistic palette, species-true
colors."*; theater: *"dense grimy dithered pixel art… Palette: narrow mud-olive palette with drab
military tones."*). Do not substitute that shorter boilerplate for the current exact realm
`Style block:` in `sprite-sheets/<realm>.md`.

---

## 5. Provenance chain (how a live sprite traces back to its prompt)

Verified intact for fantasy + pc, the two live realms:

1. `dev/model-qa/sprite-sheets/<realm>.md` — the hand-authored ChatGPT batch-prompt source
   (per-cell name + pose cue).
2. `build/gen-sprite-sheet-manifests.py` parses those `.md` files → `dev/sprite-manifests/
   v2-manifest.json` (`{"sheets": [{"id","realm","kind","sourceFile","expected","cells":
   [{"n","name","slug","cue"}]}]}` — **already covers all 12 realms + pc** with `spr-<realm>-*`
   slugs; this is the mechanical join key waiting to receive art, not just a fantasy artifact).
3. `dev/model-qa/regen-v3/manifests/*.json` (174 files, one per regen-wave sheet) carry the
   **replaces** pointer back to the original sheet+cell being corrected (e.g.
   `"replaces": "theater-mm-01.png|r4c5"`) — this is how a regenerated sprite still resolves to
   its canonical slug and stat-block join.
4. `dev/model-qa/corpus-sizing.json` (keyed by slug, 896 entries) and `dev/sprite-sheets/
   incoming/v3/v3-sizing.json` (keyed by `realm/label`, 650 entries — exactly the sum of the 10
   staged-realm + fantasy-backfill counts in §1) carry `feet`/`scaleVsHuman`/`sheet`/`cell(Index)`
   per sprite, joined via the manifest's `replaces` field.
5. `build/gen-sprite-registry.py` joins the manifest against `dev/model-qa/realm-bestiary-draft.
   json` + the `dev/model-qa/sprite-tags-overlay.json` redline overlay → `data/sprite-registry.js`
   (never hand-edited). `status:"cut"` iff `assets/sprites/<slug>.png` exists on disk at
   generation time — this is the mechanical definition of "live."

---

## 6. RUNBOOK A — regenerate a creature/sheet in-style (an already-live realm)

Ordered steps, commands verified against the actual scripts on this branch (`--help` output and
source read, not assumed):

1. **Locate/confirm the manifest entry.** The slug already exists in `dev/sprite-manifests/
   v2-manifest.json` if the creature is part of a realm's original roster (re-run `python3
   build/gen-sprite-sheet-manifests.py` after any edit to `dev/model-qa/sprite-sheets/<realm>.md`
   — no flags, it reads the whole `sprite-sheets/` directory and rewrites the manifest). A wholly
   new creature needs a new numbered cell added to the realm's `.md` file first (the parser fails
   loud on numbering gaps).
2. **Assemble the prompt, quoting §3/§4 verbatim** — never paraphrase. Format the packet exactly
   per `dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md`. Per SPRITE-GEN-V2.md §10,
   in this clause order: (1) subject block — slugs/labels/size bands from the manifest, (2) grid
   clause — explicit `gridColumns`, `gridRows`, `cellAspect`, aspect status/reason, and requested
   canvas chosen for the subject under §2-3, (3) perspective clause (quoted above; bug/tiny-creature
   corollary: worm's-eye ground camera, side/three-quarter profile, "as if photographed by another
   bug beside it"), (4) proportion clause, (5) style clause — quote the realm's exact
   `Style block:` from `dev/model-qa/sprite-sheets/<realm>.md`, then add any applicable ruled
   finish/outline clause from this file without paraphrasing (§4 table is historical evidence),
   (6) expression
   clause (the FFVI standard, SPRITE-GEN-V2.md §10 clause 6), (7) palette clause (§3), (8) swarm
   clause if applicable, (9) chroma clause — the sheet's scan-palette-chosen key (§3 chroma-key
   law).
3. **Generate** — paste into ImageGen (Adam or a Codex session); save the raw returned sheet PNG
   at `ui-sketches/sprite-sheets/<filename>` under the exact filename the prompt specified (per
   `dev/model-qa/regen-v3/INDEX.md`'s instructions to the generating agent).
4. **Slice:**
   ```
   python3 build/slice-sprites.py <sheet.png> --manifest-v2 <sheetId> \
       --manifest-path dev/sprite-manifests/v2-manifest.json \
       --expect <N> --tolerance 60 --padding 4 --review
   ```
   (flags verified against `build/slice-sprites.py --help`: `--expect` overrides the expected
   creature count for partial sheets, `--tolerance` is the magenta key-out tolerance in RGB
   distance — 0-441, default 60 — `--padding` is transparent-padding pixels around each crop,
   default 4, `--review` always writes the contact-sheet HTML even on a clean run so a
   mis-assignment can be caught by eye). On a component-count mismatch the script honestly fails
   — writes a quarantine dir + review sheet + exits nonzero rather than guessing an assignment;
   this is a human-resolves-by-hand step (re-key tolerance / `--expect` override / a targeted
   `--single SLUG` crop), not a bug to route around.
5. **Defringe** (if the slice step's inline defringe wasn't run, or backfilling older cuts):
   ```
   python3 build/slice-sprites.py --defringe-dir <dir>
   ```
   (halo-erode + edge-despill in place, per-PNG; `build/slice-sprites.py`'s own `defringe()` is
   the shared implementation `build/unify-corpus.py` re-imports rather than re-writing).
6. **[Corpus unification]** — for a sprite landing directly into the live realm, run the corpus
   pass so it quantizes to the realm's master palette and conforms texel density (BEAUTY-WAVE.md
   VP1.5, §2 above — a mechanical batch pass, not a manual per-sprite Photoshop pass):
   ```
   python3 build/unify-corpus.py            # overwrites assets/sprites/*.png in place
   python3 build/unify-corpus.py --report-only   # inspect dev/model-qa/unification-report.json first
   ```
   This is registry-driven (parses every `status:"cut"` entry in `data/sprite-registry.js`), so
   run it *after* the registry knows about the new sprite (step 8), or accept it reprocesses only
   what's already `"cut"` and re-run once more after folding.
7. **Sizing:** `feet`/`scaleVsHuman` come from `dev/model-qa/corpus-sizing.json` (slug-keyed) —
   Adam's review-tool rulings (step 9 below) are the source of truth; the registry fold reads
   this file, it is never hand-typed into the registry.
8. **Registry regen:**
   ```
   python3 build/gen-sprite-registry.py           # writes data/sprite-registry.js
   python3 build/gen-sprite-registry.py --check    # validate only — confirms every slug matches
                                                     # ^spr-, no slug collisions, join coverage
   ```
   Default manifest is `dev/sprite-manifests/v2-manifest.json` (`DEFAULT_MANIFEST` in the script
   — override with `--manifest <path>` only for a non-standard source). Do **not** pass
   `--admit-faceted`: per the 2026-07-15 PIXEL-FIRST ruling the pixel corpus is canonical and the
   registry should stay all-legacy.
9. **Review gates (SPRITE-GEN-V2.md §9):** `python3 dev/perspective-review.py` → :5181 (perspective/
   proportion/resolution/style-within-realm/Adam-outright-fail, writes `rulings.json`) then
   `python3 dev/sprite-review.py` → :5179 (tags · heights · pass/fail overlay; its "regen registry"
   button in the UI POSTs to `/api/regen`, which runs `build/gen-sprite-registry.py` again so
   review rulings fold into `data/sprite-registry.js` without a manual re-run).

### The fantasy-only XL/titan paths (historical formatting)

> **Both fixed-format generators are historical for NEW production.** The original XL path was
> superseded in 2026-07-16 by `build/gen-regenv3-bigboys.py`; that round-4 generator itself still
> hard-codes the now-retired universal 4:5 assumption. Preserve both for reproducibility, but route
> any new big-creature packet through `PRODUCTION-FORMAT.md` and the 4:6 provisional comparison
> until Adam rules exact giant/titanic ratios.


Adam's ruling (quoted in `build/gen-xl-regen-sheets.py`'s docstring, 2026-07-09): *"creatures 9'
and up need to be regened at 2x on sheets with less sprites — 4 per sheet for the big ones, and
the real badass titanic ones get their own sheet."* Run:
```
python3 build/gen-xl-regen-sheets.py
```
No flags. Reads `data/sprite-registry.js` + the review overlay + `v2-manifest.json`, emits
`dev/sprite-manifests/XL-REGEN-PROMPTS.md` (paste-ready prompts, one block/sheet) and
`dev/sprite-manifests/xl-regen-manifest.json` (a proper `{"sheets":[...]}` v2-shaped manifest —
slugs are the *original* slugs, so slicing **overwrites** the low-res sprite in place). Slice a
returned sheet with the same `slice-sprites.py --manifest-v2 <id> --manifest-path
dev/sprite-manifests/xl-regen-manifest.json --review` pattern as step 4. **This script is
hardcoded `REALM = "fantasy"`** — there is no equivalent XL path for the other 11 realms yet
(see §9).

---

## 7. RUNBOOK B — fold a staged realm into the live corpus

The 10 staged realms (§1) already cleared SPRITE-GEN-V2.md §10b's **Gate** and **Slice** steps —
individual per-creature PNGs exist at `dev/sprite-sheets/incoming/v3/<realm>/<realm>-<slug>.png`.
What's missing is everything after that, quoted from §10b where it applies, extended honestly
where it doesn't (§10b describes folding a *replacement* sprite into an *already-live* realm —
bringing a whole new realm live for the first time needs a few steps §10b never had to name):

1. **Tag** (§10b step 3, quoted): *"mood/pose/qaFlags refreshed on the re-cut sprites; identity
   tags carry over."* Cross-reference `dev/model-qa/regen-v3/manifests/<sheetId>.json` for each
   staged file's `label`/`family`/`sizeBand`/`replaces` provenance.
2. **Rename to `spr-` and resolve the manifest join.** The staged filenames
   (`<realm>-<slug>.png`, no `spr-` prefix) are the tell that a sprite hasn't been folded —
   `gen-sprite-registry.py --check` hard-requires **every slug to match `^spr-`**. Use each
   file's `replaces` provenance pointer to resolve which `v2-manifest.json` cell (already `spr-
   <realm>-<slug>` for all 12 realms, per §5) it fulfills, and copy/rename it to
   `assets/sprites/spr-<realm>-<slug>.png`. A regen-v3 subject with no `replaces` (a genuinely new
   creature, not a replacement) needs a fresh numbered cell minted in `dev/model-qa/sprite-sheets/
   <realm>.md` first, then a `v2-manifest.json` regen (Runbook A step 1), so it has a `spr-`
   slug to land under.
3. **Palette conformance.** Today the realm's palette JSON is **style-ref-only** for all 10
   staged realms — verified live: `python3 build/gen-realm-palettes.py`'s own run log reports
   `"0 corpus px sampled"` for every one of them ("no cut sprites in registry for this realm
   yet"), versus fantasy's 11,828 and pc's 10,357. Once real files land in `assets/sprites/`,
   **re-run `build/gen-realm-palettes.py`** so the palette folds in the corpus histogram (its own
   r2 law — a style-ref-only palette under-represents hue families the actual corpus paints,
   the documented fantasy-constrictor-snake failure mode), then run `build/unify-corpus.py` to
   quantize/defringe/texel-normalize the newly-landed sprites (same pass the live 896 went
   through, see §8's verification). `unify-corpus.py` has no `--realm` scope flag — it reprocesses
   every `status:"cut"` registry entry each run; this is safe/idempotent for the already-conformed
   fantasy+pc sprites (a color already in the palette quantizes to itself) but means folding one
   realm re-touches all live realms' files each time — acceptable today at 2-realm scale, worth a
   `--realm` flag before a third realm lands.
4. **Registry join.** `python3 build/gen-sprite-registry.py` — once the renamed files exist under
   `assets/sprites/`, the registry's `status:"cut"` check (file-exists on disk) flips them live
   automatically; no separate "mark live" step exists or is needed.
5. **Review pass.** Same two gates as Runbook A step 9 (`dev/perspective-review.py` :5181, then
   `dev/sprite-review.py` :5179) — SPRITE-GEN-V2.md §9's five review gates apply identically to a
   newly-folded realm; nothing about "first time live" exempts a sheet from Adam's outright-fail
   gate.
6. **Outline law.** If the realm's `outline` field is still `"tbd"` (9 of the 10 staged realms,
   §9), that's an Adam ruling this runbook cannot supply — pick a value in
   `realm-palettes/<realm>.json`'s `outline:` field per BEAUTY-WAVE.md's OUTLINE LAW before
   calling the realm's finish complete.

---

## 8. Verify one thing: was `build/unify-corpus.py` ever run on the live 896?

**Answer: CONFORMED.** `build/unify-corpus.py` (the r2 version) was run on the entire live corpus
— not a subset, not a dry run.

Evidence:
- `quarantine-pack/pre-unification/originals-r2.zip` exists (82,889,430 bytes, timestamp
  2026-07-10 22:34). `archive_originals()` in `unify-corpus.py` only runs when `--report-only` is
  **not** passed, and it runs *before* any PNG gets overwritten (`assert n > 0, "quarantine
  archive is empty — refusing to overwrite"`) — its existence is direct proof of a real
  (non-dry-run) execution.
- `dev/model-qa/unification-report.json` exists, same timestamp (2026-07-10 22:34), and reports
  processing **896 sprites** — a realm breakdown of exactly `{fantasy: 680, pc: 216}`, i.e. the
  *entire* current live corpus, no partial run. 42 sprites ΔE-flagged (quality-loss gate, mean
  CIEDE2000 > 8.0), 32 hue-shift-flagged; both named regression fixtures pass
  (`spr-fantasy-constrictor-snake` hue-shift 7.7° < the 30° gate; `spr-fantasy-ghost` has zero
  forbidden-zone/magenta-adjacent pixels).
- **My own spot-check** (not the script's self-report): sampled 3 live sprites — two fantasy
  (`spr-fantasy-awakened-shrub`, `spr-fantasy-baboon`) and one pc
  (`spr-pc-dragonborn-paladin-female`) — and measured what fraction of each sprite's opaque pixels
  are colors present in its realm's palette JSON. **Result: 100.0% for all three** (18,351/18,351,
  20,489/20,489, 17,177/17,177 opaque pixels respectively). Combined with the report's nonzero
  per-sprite ΔE values (the quantization measurably *changed* colors — these sprites weren't
  already-conformant by luck), this independently confirms the palette-quantize pass actually ran
  and actually landed on every sampled sprite, not just that the script printed success.

Conclusion for the record: the live pixel corpus (fantasy + pc, 896/896 sprites) is fully
palette-conformed. The 10 staged realms are **not** — their palette JSONs are still style-ref-only
(§7 step 3), which is the mechanical reason they can't just be copied into `assets/sprites/` as-is.

---

## 9. The honest gap list

| gap | detail | unblocked by |
|---|---|---|
| Outline law `tbd` × 9 realms (+ pc) | ash, bright-kingdom, cosmic, frontier, high-seas, lost-world, noir, suburb, theater all read `"outline": "tbd"` in their palette JSON; `pc.json` too (it aliases fantasy's *style-ref* but was never given its own outline ruling) | **Adam** — a taste call, one line each in BEAUTY-WAVE.md's OUTLINE LAW + the JSON field |
| SPRITE-GEN-V2.md §10 "awaiting Adam's final confirmation" | The regen prompt clause-order block (quoted in Runbook A step 2) is still marked draft in its own source doc (§11 "Still open: 1. Adam's final confirmation of §10") | **Adam** |
| pc has no style-ref of its own | `STYLE_REF_ALIAS = {"pc": "fantasy"}` in `gen-realm-palettes.py`; pc's palette derives from fantasy's style-ref + pc's own corpus histogram — a deliberate fallback, not a bug, but never separately ruled on | **Adam**, if a distinct PC visual identity is ever wanted |
| Round-2/3 regen outstanding | cosmic-r2 (15 sheets) and gloom-r2 (3 sheets) "never arrived" per SPRITE-GEN-V2.md §11 — the prompt packets exist (`regen-v3/round2/cosmic-r2.md`, `gloom-r2.md`) but no returned art was ever saved; ash was re-queued as round-3 after its committed corpus proved painterly-drifted | **mechanical** — re-run the existing packets through ImageGen; no new ruling needed |
| Non-fantasy XL prompt files missing | `build/gen-xl-regen-sheets.py` is hardcoded `REALM = "fantasy"` (verified: no `--realm` flag, `REALM` is a module constant) — creatures 9ft+ in the 10 staged/parked realms have no titan/XL 2x regen path at all | **mechanical** — generalize the script to take a realm argument |
| Fixed-aspect big-creature generator is historical | `build/gen-regenv3-bigboys.py` reproduces the 2026-07-16 all-4:5 packet and cannot express the 2026-07-24 subject-dependent/provisional giant-titanic aspect ruling | **mechanical after taste evidence** — modernize it against `sprite-sheets/PRODUCTION-FORMAT.md` once comparative captures lock exact ratios |
| MC-1 magenta-crud cleanup | Named in DESIGN.md's 2026-07-15 PIXEL-FIRST entry ("MC-1 magenta-crud cleanup fires on the live pixel corpus") as the follow-up to Adam's "get the magenta crud cleaned up" ruling — **not yet run**: no matching entry in CHANGELOG.md or NEXT-STEPS.md as of this doc | **mechanical** — ruled, queued, not yet executed |
| Staged realms aren't palette-conformed | See §7 step 3 — all 10 staged realms' palette JSONs report 0 corpus pixels sampled; `unify-corpus.py` has never touched them because they're not registry-`"cut"` yet | **mechanical**, sequenced after Runbook B's rename/join steps |
| `unify-corpus.py` has no per-realm scope | Reprocesses every `status:"cut"` entry each run — fine at 2 live realms, will re-touch fantasy+pc's already-conformed files every time a 3rd realm folds in | **mechanical** — add a `--realm` filter before the first realm-fold lands |
| dev/model-qa/regen-v3/manifests/*.json aren't slicer-consumable | Verified: these 174 per-sheet files (the regen wave's planning/provenance format — `label`/`family`/`sizeBand`/`replaces`, no `"n"` field, no `{"sheets":[...]}` wrapper) don't match what `slice-sprites.py --manifest-v2`/`--manifest-path` expects; no script in `build/` or `dev/` consumes them directly (`grep -rl gridClass` across `build/`+`dev/` finds none). The staged realms' individual PNGs already exist, so slicing evidently happened by some ad hoc/manual process each session — there's no committed, re-runnable "slice a regen-v3 sheet" command today | **mechanical** — write a small adapter that wraps a `regen-v3/manifests/<id>.json` file into the `{"sheets":[{id,...,cells:[{n,...}]}]}` shape `slice-sprites.py` needs |

---

## 10. Findability

Cross-linked from `docs/README.md`'s index and `docs/HANDOFF.md`'s graphics-authority block.
The preferred batch-packet contract is
`dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md`; the realm packet index links it first. Per
Adam's ruling, this file and its style/format authorities should never require archaeology to
find again.

---

## 11. CL-R2 standee base and scale rulings (verbatim, Adam, 2026-07-24)

> yes, agreed if you could make that pass that would be so much better. also, i am not certain we
> need circular bases anymore. as long as the character calculates as that 5x5 base (or higher or
> smaller depending on the creature) i would rather have a natural looking standee base like the
> ones that you rendered in the latest mock ups for the dev tool interface. think about how the
> standee is going to fit on a staircase right. like one stair is probably going to be 1/3 of a 5x5
> stair case, so the standee depth should probably be a match for stair depth. i think if we can
> reconcile that match then most of our standee problems should be solved

> we do need to see the biggest creature alongside the average human size creatures and then some
> small creatures and make some decisions about the scaling spectrum. we may have to cap big and
> small creatures, and that's ok, also some of the big creatures might just be too wide, if so we
> can flag those for re-genning as taller more upright sprites

The CL-R2 candidate keeps the tactical footprint separate from the visible support, uses a shallow
rounded strip whose Medium depth is exactly one third of a cell, and preserves canonical size data.
The 1–30-foot presentation scale is now the working default; true scale remains one click away as an
honest size-spectrum check, and a genuinely gigantic encounter still requires architecture scaled
to contain it.

---

## 12. CL-R2 follow-up: physical separation, readable sprites, and selection (verbatim, Adam, 2026-07-24)

> ok, first, i should be able to zoom in further. second the drop shadows do not seem to line up
> with the bases, third collision between bases shouldn't be allowed, i think a forced slight
> relocation should happen, just like pieces on a board that can't ever full occupy the same space.
> i actually like the true scale, but i am willing to compromise a bit, it looks like you limited
> the sprite to 20ft tall, but i think a kraken should actually be a gigantic creature and if you
> ever encounter it you need to be in a situation where the environment is scaled to actually
> encounter it. maybe 30 ft is better. also the drop shadows are essentially invisible on the
> pieces that it is aligned with, which kind of defeats the purpose, i would also like to see the
> rim or outer face of the piece light up and actually cast a little glow when that piece is
> selected. also, im not sure how you got the mock up pieces to be lit so well, but maybe just
> relying on ambient and room lighting alone isn't quite sufficient for the sprites, they might
> need their own light cast from the camera itself that doesn't cast shadows, that has a falloff
> that gently lights the sprite's face, because in dark environments everything looks rusty and
> cruddy and not great

Selection clarification:

> oh, for the slection light i just meant the actual vertical face of the base of the piece to like
> up, like a glow ring, does that make sense?

Implemented reading: governed zoom now reaches roughly 8.3× closer; visible support rectangles use
deterministic oriented-box separation without changing their tactical cells; each soft contact
shadow is linked to its standee, follows relocation/yaw, and extends visibly past the support; the
camera-side fill affects sprite faces only and casts no shadow; and selection lights only the
base's shallow vertical sidewall, never the character card or the base top.

Environment-shadow clarification:

> ok, something we don't have is like an environment material, im not sure that we need it
> necessarily, but we do need enough ambient light that i can make out the stairs in the shadow,
> even if it's just slightly, right now all shadow is exactly the same value, which i appreciate as
> a photographer, but i do need to be able to make out some level of forms in the dark

Implemented reading: no new environment material yet. A very low, shadowless hemisphere floor
supplies sky/ground bounce, so upward treads, vertical risers, and wall turns retain slightly
different dark values. Direct-light shadows remain strong; the floor only prevents every un-keyed
face from collapsing to the same black.

---

## 13. CL-R2 grounding and selected-base emission follow-up (verbatim, Adam, 2026-07-25)

> that's great, is there any way we can get the contact shadows to actually be darker than the
> shadow value in the shadows? with a multiply effect? is there any way i can get the selected base
> piece to emit a tiny amount of light?

Implemented candidate reading: the soft contact texture now uses an opaque-white identity rim and
gray radial multiplier through true multiply blending. It darkens the floor after ambient,
diegetic light, and cast-shadow value have resolved, so contact remains visibly below an
already-shadowed surface rather than introducing one replacement black value.

Presentation-scale and cast-shadow correction:

> hmm, maybe the presentation scale is the way to go since that's as big as the bases ever really
> get, also i just realized the cast shadows are just rectangles? wack, how much extra does it cost
> to cast the silhouette of the actual sprite? the daylight and moon cast shadows just look wrong,
> just some odd floating rectangle behind the sprite? what is that, not even close

Implemented reading: 1–30 feet is the default presentation view; true scale remains the canonical
size check. The rectangle came from the standee's full backing shell entering the shadow map. The
shell remains visible edge-on but is now non-casting. The sprite plane is the sole caster, with the
same alpha-tested texture used by both depth shadows (directional/spot) and distance shadows
(point). This removes one redundant caster, so silhouette shadows cost the same or slightly less
than the rejected rectangle.

Selected-base emission clarification:

> so with the base face halo light, the light is still coming from a light source at the center of
> the base, but i want the light to be coming from the blue material itself, like a little neon glow
> under the selected piece does that make sense?

Implemented reading: there is no center PointLight. The vertical sidewall is the visible emissive
source, paired with one shadowless additive spill shaped to the support's own rounded-strip
footprint and seated immediately beneath it. The opaque base hides the spill's center, leaving only
a soft cyan feather outside the blue material; selection handoff hides the previous spill before the
new base emits.

---

## 14. Golden Site 1 sharpness, shadow/AO, and extrusion resumption (verbatim, Adam, 2026-07-30)

> "i need to pause briefly so i can go home, some notes on the resumption, i think one of the assetforge tools broke the renderer slightly. I think the sprite citizenship crushed the sharpness we had operating before, now the sprites are soft and everything is soft, we were running nearest neighbor as our scaling method, so we need to lump that in with our goal. also for our test NPC, the shadows are wrong the AO is wrong, we should try the sprite extrusion on the standee to get a true 3d sprite standee in the environment as well. If we can get an beauty render from this goal then we are doing pretty well.
>
> for now pause and prepare to resume when i give you the word"

Resume contract: audit the Assetforge/citizenship texture path against the former nearest-neighbor
renderer contract; restore play-scale sprite and frame sharpness without manufacturing detail;
correct the test NPC's cast-shadow and AO/contact read; and run a governed sprite-extrusion proof
as a true 3D standee before calling the Golden Site beauty render successful.

---

## 15. Golden Site direction-defining authority (verbatim, Adam, 2026-07-30)

> "you do have authorization to edit almost any art directives at this point to achieve this goal so don't feel overly constrained, obviously try to work within the rulings, but we are still early enough in production that this is a diretion defining excersize and we can re-direct every aspect of production to achieve the goal"

Department reading: the current rulings are the best known production defaults, not a ceiling on
the Golden Site experiment. Material families, asset routes, lighting, composition, rendering,
citizenship, and procedural art rules may be redirected when the governed frame demonstrates that
the change advances the TS/FFT-family target. Preserve the old evidence and name the superseded
default; build successful changes into reusable systems. Mechanics, tactical legality,
determinism, and ownership boundaries remain protected unless separately ruled.

---

## 16. Diorama tray-edge closure (verbatim, Adam, 2026-07-30)

> "oh, just one general styling rule i was wanting is the edges of the diorama, instead of just floating and being a single plan of ground with nothing underneath it, i was hoping that the highest elevation would have an edge plan that renders down to the ground plane, making the entire diorama look like it could fit into a flat tray. does that make sense?"

Implemented reading: the perimeter is a vertical cut from the actual rendered boundary silhouette
to one common flat datum below the field minimum. The highest edge therefore owns the deepest
visible sidewall, and the diorama reads as a solid mass that could sit inside a physical tray.
Interior relief is unchanged. The closure changes no tactical height, contact, path, collision, or
fingerprint and receives its own subordinate sprite-derived cut-face material role.

---

## 17. Generic condition-overlay contract (verbatim correction, Adam, 2026-07-30)

> "you built brick shadows into the algae sprite, but that makes the algae sprite less useful,
> wouldn't it be more useful to find a better way to blend a generic algae sprite into it's parent
> surface?"

Department reading: yes. A condition asset supplies color and coverage alpha; the receiving parent
keeps construction pattern, normals, ORM, scale, and lighting. Never bake one wall's bond or shadows
into reusable algae. Placement is still semantic and causal—the Guard Post's overlay derives from
the drain outfall, downhill channel, polygon junctions, age, maintenance, and cleaner repaired
coping.

The later Whiteholm correction makes the required scale hierarchy explicit. “Edge-biased” means
edge-origin, not edge-confined: lower-wall grime may form a broad irregular band, seam moss must
form readable unequal islands, and ivy may become a large silhouette-bearing corner mass. One
relevant cluster must be visible in the gameplay frame without relying on a macro crop.

Projection follows the receiver. Planar architecture uses receiver-local decals. Responsive
terrain uses one engine-authored mesh-conformal condition field, sampled continuously across shared
terrain vertices and driven by downhill flow, concavity, exposure, substrate, and maintenance.
Large ivy uses shallow/crossed extrusion or equivalent contact-rooted geometry. Keep centered
unrelated face stickers, one-decal-per-tile terrain, coupled overlays, and repetitive failures in
the rejection lineage rather than overwriting them.
