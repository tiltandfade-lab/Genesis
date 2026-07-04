# POLISH-WAVE-1 — model roster fixes, re-poses, race×class starter set, NPC variants

```
type: system-spec
status: SPECCED (locked 2026-07-04, Adam's master-sheet review — decisions his, verbatim-derived)
consumer: Opus authoring executors + Haiku positioning review, orchestrator gates
```

## Laws that bind every unit here

- Every piece is a whole-object landmark module in `dev/model-qa/creatures/` (one function, one
  frame, held items first) — same conventions as the shipped 82.
- QA gate: headless capture through `dev/model-qa/ps1-sheet.html` (byte-faithful engine PSX pass),
  then Haiku positioning review (grips/ground/intersections/facing), then orchestrator gate.
  Serve the repo on YOUR assigned port (per executor prompt) — never assume 5176 is free.
- The house eye standard (REFERENCE-DIRECTION, RULED): two small dark quads flanking the nose
  ridge, proud of the bulged face plane. No ring-column eye bands.
- Size law as shipped (INDEX.md): Small ~0.95u/r0.32 · Medium ~1.45u/r0.42 · big-Medium r0.48 ·
  Large ~2.1u/r0.55 · Huge ~2.7u/r0.68.
- **Alt policy (Adam, 2026-07-04):** when a piece Adam called good/pretty-good is re-posed or
  re-headed, the NEW figure becomes primary and the original is KEPT as an alt variant
  (`<name>-alt1.js`, registered in the sheet sets so both render). EXCEPTION — pieces Adam ruled
  BROKEN are replaced outright, no alt kept: **mimic** (tongue) and **gnome** (head/eyes).
- Update `dev/model-qa/sheets/INDEX.md` and re-render affected sheet PNGs at unit close.
- Textures stay generated (grain pass + palette), never painted assets.

## F1 — Fix wave A (broken + head passes)

Adam's per-piece rulings, execute exactly:

1. **mimic** — BROKEN. Tongue currently exits under the bottom teeth row; it must emerge BETWEEN
   the two teeth rows. Replace the model; do not keep the old one as an alt.
2. **gnome** — BROKEN. Head is enormous and the eyes sit on the nose itself. Shrink the head
   (target: clearly larger-than-human-ratio but not balloon — compare halfling, which passed),
   re-seat eyes per the eye standard (flanking the nose ridge, never on it). Replace outright.
3. **giant rat** — head re-pass. The ambiguous circle shapes (failed ears) go; ears must read as
   ears (small pointed/rounded quads atop the skull). Also fixes the logged snout-over-disc
   backlog item in the same pass. Body stays.
4. **goblin** — head slightly smaller. New primary; KEEP the big-head original as `goblin-alt1`.
5. **dragonborn** — dial the snout in: it currently reads as an og-Baldur's-Gate kobold. Shorter,
   deeper muzzle; consult dragonborn head references (web) before editing. Also fix the logged
   belt-knife specular catch.
6. **gray ooze** — the engulfed skull STAYS (Adam likes it). Palette nudge toward grey per the
   standing backlog (reads slate-blue at board light).
7. Remaining standing backlog items, same wave: giant snake strike-neck overhang (would tip a
   physical mini — pull the mass over the disc), harpy wing thinness at board distance,
   barbarian chest patch + rear axe-grip, warlock grimoire knife-read at hero angle, wyvern
   haunch lumpiness.

## F2 — Fix wave B (references required — gather via web search BEFORE modeling)

1. **ranger** — the bow itself reads `>`-shaped (angular chevron). A strung longbow is a single
   C-arc bending toward the string. Find and vision-read a longbow reference image first; rebuild
   the bow as a smooth C-curve (3–4 segment arc is fine at this poly budget), string as a straight
   chord.
2. **rogue** — re-pose sneaky using the existing modular parts: low crouch, forward lean, dagger
   held close/reversed but NOT reading as sprouting from the hip (the logged hero-angle bug —
   fix it in the same pass). New primary, keep OG as `rogue-alt1`.
3. **owlbear** — head is good, body is odd. Reference the BG3 owlbear (web/vision): bulky
   bear mass, high shoulder hump, feather ruff transitioning at the shoulders, forelimbs heavier
   than hind. Rebuild torso/limbs, keep the head. New primary, keep OG as `owlbear-alt1`.

## F3 — Pose-expressiveness wave (classes first, then any stiff roster piece)

Adam's ruling: poses that EXPRESS the class beat weapon-swap flexibility. If a swappable-weapon
grip is what forced a neutral pose, make pose-variant models per weapon instead — geometry is
already authored; a re-pose is joint/transform edits on the existing part assembly (cheap, ~min
per figure), and the re-mint-on-equip presentation is a separate queued sweep.

- Gather pose references FIRST (web search: FFT/Tactics Ogre idle stances, BG3 class idles,
  miniature action poses per class). Record findings as text notes in
  `dev/model-qa/pose-refs.md` (pose description + source URL per class); vision-read, don't
  download.
- Every re-posed figure that Adam rated good/pretty-good: new primary + OG kept as alt.
- Priority order: the 12 classes, then cr1/cr5 stand-outs if cycles remain.

## F4 — Race×class bespoke starter set (Adam's call 2026-07-04: ~18 bespoke, not swap channels)

Three per built race, iconic combos first:

| race | classes |
|---|---|
| dwarf | fighter, cleric, ranger |
| gnome | wizard, rogue, bard |
| halfling | rogue, bard, monk |
| half-orc | barbarian, fighter, druid |
| tiefling | warlock, sorcerer, rogue |
| dragonborn | paladin, sorcerer, fighter |

Each inherits the FIXED race head/proportions (post-F1 gnome, post-F1 dragonborn snout) and the
class kit/pose language from F3. Naming: `<race>-<class>.js`. New sheet set key `racecls` added
to ps1-sheet + INDEX.md.

## F5 — NPC variant wave (crawl first, then build)

1. CRAWL: read the walk rosters/tables that actually put people on screen (urban walk enemy
   composition + category tables in `src/engine/walk.js`, NPC atoms, prep cast usage) and rank
   which NPC SHAPES actually appear in play.
2. Build the top recurring shapes not yet modeled. If the tables don't distinguish shapes
   beyond the built six, default set: laborer/dockhand, innkeep, priest/acolyte, beggar,
   merchant/caravaneer, watch-captain (armored authority read distinct from `guard`), elder,
   hunter/trapper. Cap at 8.

## Out of scope (all queued elsewhere)

PSX res change (chore/grit-compare unit, Adam gates) · P1′ engine wiring (own spec) · weapon-swap
re-mint presentation (next sweep, Adam bundles) · env model waves (own manifest) · micro-props
(docs/MICRO-PROPS.md, spec-only today) · down-state/tipped-figure check (queued behind P1′).

## Verification (every unit)

1. ⊗ RED-FIRST per piece: capture the CURRENT sheet render of the piece before editing (the
   "before" image is the red state — file it in the unit's capture dir).
2. Headless re-render of every touched sheet; Haiku positioning review verdicts recorded.
3. `python3 build/check-manifest.py` — creatures/*.js are dev-side (not app modules), but run it
   anyway if ANY `src/` or `data/` file was touched; must end RESULT: OK.
4. INDEX.md updated (contents lists + alt registrations + backlog items cleared/moved).
5. Report format: branch + SHAs, per-piece before/after capture paths, review verdicts, deviations.
