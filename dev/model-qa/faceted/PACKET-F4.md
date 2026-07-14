# PACKET-F4 — Combat VFX + decals rework (faceted hybrid, single-frame)

**Authority:** the faceted redesign thesis (PACKET-F1 §0) extended to effects, plus the class
index in `EFFECTS-DECALS-INDEX.md`. This is a **different asset class from figures** — read the
contract below, it supersedes the figure chroma/framing rules for this packet only.

**Adam's locked rulings (2026-07-13):**
- **VFX visual language = HYBRID** — a geometric faceted/low-poly core (triangulated shards,
  faceted crescents & rune-rings, crystalline frost, chunked debris) **plus** soft glow/smoke
  accents where the element demands it (fire, mist, holy light, void). Faceted where it can be;
  glow where hard faceting would look wrong. Must sit convincingly beside the F1–F3 faceted figures.
- **Single-frame stamps** — one PNG per effect, like the current `fx-*` assets. No sprite-sheets.

**Every output is a candidate (`runtimeAdmitted:false`).** Save VFX under
`dev/model-foundry/faceted-regeneration-production/fantasy-pilot/raw-effects/` and decals under
`.../raw-decals/`, `<name>-candidate-NNN.png`, per-slug numbering from 001, call id recorded,
per-lane provenance JSON. **Keep the existing asset names** so returns are drop-in replacements
(e.g. `fx-impact-slash-arc-candidate-001.png` → replaces `assets/dressing/fx-impact-slash-arc.png`).

## Background / key (technical — matches how VFX composite, NOT magenta figures)

- **Additive VFX** (energy, glow, sparks, magic, fire, holy, void — anything that reads as light):
  generate on **flat black #000000**, effect filling a centered square with generous padding. Black
  is luminance-keyed to alpha downstream (standard additive-FX cutout). Do not put pure black inside
  the bright effect core.
- **Opaque marks & decals** (blood, dirt/grime, scorch, rust, moss, wear, crack, cobweb, mud,
  ichor spatter): generate on **flat magenta #FF00FF chroma**, chroma-keyed like figures. Do not use
  magenta in the mark.
- No scene, no figure, no ground plane, no border/text/watermark. One effect per frame, centered.

## Step-E for effects (source reject gates — replaces the figure gates)

1. **Key purity:** background is the flat key (black or magenta per class), uniform, and the key
   colour does not bleed into the effect.
2. **Framing:** single centered effect, square, padded, no crop of the burst/splat.
3. **Style:** reads as HYBRID faceted+glow — has real triangulated/low-poly geometry, not a pure
   painterly smear, and not hard-faceted where it should glow. On-language with the figures.
4. **Correct element/read:** it depicts the named effect (a slash-arc reads as an edged weapon arc;
   frostburst reads as ice, not generic white; poisonbubble reads as toxic, etc.).
5. **No genre drift:** fantasy register — no sci-fi neon, no cartoon candy sparkle, no photoreal fire.

---

## LANE M — system VFX (genre-neutral combat core) — 24 effects · BLACK key

Compile each as: "one centered [effect], faceted-hybrid low-poly fantasy game VFX — triangulated
[geometry] core with soft [glow/smoke] accents, flat black #000000 background, additive read,
centered, padded, no scene/figure/text." Swap the bracket from the seed.

| name | depicts (faceted core / glow accent) |
|---|---|
| fx-impact-slash-arc | a thin edged crescent slash — faceted blade-arc shards / faint speed-glow |
| fx-impact-slash-heavy | a broad heavy cleave arc — chunky faceted arc / motion smear |
| fx-impact-pierce-glint | a thrust/pierce spark — sharp faceted glint star / thin glow |
| fx-impact-blunt-star | a blunt-hit burst — faceted impact-star shards / dust puff |
| fx-impact-crush-shatter | a crushing shatter — scattered faceted debris chunks / dust |
| fx-magic-castcircle | a casting rune-ring on the ground — low-poly faceted rune-ring / soft inner glow |
| fx-magic-sigilflash | a flaring spell sigil — faceted geometric glyph / bright glow flash |
| fx-magic-orbcharge | a gathering spell orb — faceted crystalline core / charge glow |
| fx-magic-bolthead | a bolt/projectile head — faceted arrow-shard / trailing glow |
| fx-magic-burstring | an expanding spell shockring — faceted ring shards / energy glow |
| fx-status-bloodspatter | a hit blood spray — faceted droplet shards / wet sheen (RED; note: opaque — see decals key note) |
| fx-status-healmotes | rising healing motes — faceted diamond motes / warm holy glow |
| fx-status-poisonbubble | toxic bubbling — faceted bubble facets / sickly green glow |
| fx-status-shieldshimmer | a ward shimmer — faceted hex-shield planes / translucent glow |
| fx-status-smokepuff | a smoke puff — minimal facet / mostly soft grey smoke (glow-leaning) |
| fx-status-sparkburst | a spark shower — faceted spark shards / bright glint |
| fx-status-stunstars | circling stun stars — faceted low-poly stars / soft glow |
| fx-env-splash | a water splash — faceted water shards / droplet glow |
| fx-env-dustkick | a ground dust kick — faceted grit chunks / soft dust haze |
| fx-env-frostburst | an ice burst — crystalline faceted frost shards / cold glow |
| fx-env-emberdrift | drifting embers — faceted ember bits / warm glow |
| fx-env-debriscloud | a debris cloud — faceted rubble chunks / dust haze |
| fx-env-rippleflash | a ground ripple/flash — faceted ring / soft flash |
| fx-env-shadowpool | a spreading shadow pool — faceted dark planes / smoky edge glow |

## LANE N — fantasy-themed VFX (the realm's flavor set) — 32 effects · BLACK key

Same compile shape, per-theme flavor. (`-alt` variants = a second take of the same effect.)

- **fx-fantasy-**: emberrune (glowing rune ember) · featherdrift (falling feathers) · frostshard
  (ice shard spray) · holyglow (+alt) (radiant blessing) · leafburst (+alt) (nature leaf scatter) ·
  mossbloom (spreading moss growth)
- **fx-ash-** (volcanic/decay): ashcloud · basaltcrack (glowing lava crack) · embergout (+alt)
  (fire gout) · rustflake (flaking rust) · toxicburst (+alt) (toxic spray) · biolumeflash (eerie
  bioluminescence)
- **fx-gloom-** (undead/grave): bonedust · graveglow (necrotic glow) · ichorspatter (+alt) (dark
  ichor — opaque, magenta key) · mournvapor (grave mist) · witherpulse (decay pulse) · vhstear
  (+alt) (spectral tear/glitch — keep subtle, low-poly)
- **fx-cosmic-** (arcane/void): constellationburst (+alt) (star-point burst) · nebulaflash ·
  sandveil (+alt) (drifting sand veil) · scarabswirl (swirling motes) · sigilbloom (blooming glyph)
  · voidrip (a torn void slit — faceted dark planes + edge glow)

## LANE O — decals (surface damage/decay) — 9 families · MAGENTA key

Flat **top-down splat**, magenta chroma, no perspective (the `angled-flagged` variant is derived
downstream), soft-but-defined edges, faceted-hybrid where sensible (cracks are literally faceted;
blood/water read as organic splats with subtle facet structure). Generate a `source` master per
family; keep the family name.

| family | depicts |
|---|---|
| shared-blood-decal | blood spatter/pool — organic splat, faceted droplet edges |
| shared-water-decal | water pool/splash mark — translucent, faceted ripple edge |
| shared-grime-decal | dirt/grime smear — grounded muck |
| shared-wear-decal | scuff/wear scratches — worn-surface abrasion |
| shared-scorch-decal | scorch/burn mark — charred blast, faceted crack center |
| shared-crack-decal | surface cracks — literal faceted fracture lines |
| shared-rust-decal | rust bloom — flaking oxidized stain |
| shared-moss-decal | moss growth — organic green spread |
| shared-cobweb-decal | cobweb — fine faceted web geometry |

> Decals currently ship as `-set-2/3/4` (multiple variants per family) plus `source` / `shared` /
> `angled-flagged` renders. This lane authors the **`source` master** only; the set variants and the
> angle-flagged/RGBA derivations are a downstream step, not separate generations.

---

## After the returns

Consolidate like F1: into the pilot tree with per-lane provenance + a Step-E ledger, but gate on
the effects Step-E above (key purity / framing / hybrid style / correct read) instead of the figure
chroma gate. Admission still requires in-game compositing check — a VFX that looks great on black
but muddies over a lit scene is not admitted. Legacy `fx-*` / decals stay the fallback until admitted.

## Still parked

Other-genre VFX (`fx-{suburb,noir,chrome,frontier,th,hs,lw,bk}-*`, ~64) — only if those realms get
the faceted pass. The 216 `spr-pc-*` PC variants and the descriptive realm-animal/kid NPC sets
remain their own future packets.
