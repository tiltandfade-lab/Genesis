# Genesis Model Waves — Proof Sheet Index (2026-07-03 → 07-04 overnight program)

Every figure/prop is a bespoke whole-object landmark module in `dev/model-qa/creatures/`,
rendered here through the byte-faithful engine-PS1 surface (`ps1-sheet.html`: Bayer dither +
vertex-snap 96 + 1/3-res, grain default-on, specular on metal/glass). Live sheets need the
repo served on :5176 → `http://127.0.0.1:5176/dev/model-qa/ps1-sheet.html?set=<key>`.

**Pipeline per wave:** Opus authoring executors with a closed headless-capture render loop →
batched (≤3-wide, machine-resource law) Haiku positioning review + Opus repair workflow →
director gate on the sheet. 82 total pieces; every one passed QA.

## Sheets

| Sheet | Set key | Contents |
|---|---|---|
| [classes.png](classes.png) | `classes` (default) | fighter, barbarian, **paladin** (F3: re-posed to an oath-guard — shield raised forward, hammer cocked at the shoulder, braced legs), **ranger** (F2: bow rebuilt = C-arc; **F3: re-posed to FULL DRAW** — bow arm extended, string drawn to the jaw), **rogue** (F2: re-posed to a sneaky crouch), monk, cleric, **druid** (F3: re-posed to a leaned-on-staff communing hunch), **wizard** (F3: re-posed to an incantation — canted staff, raised casting hand), sorcerer, warlock, bard |
| [races.png](races.png) | `races` | gnome, halfling, dwarf, dragonborn, tiefling, half-orc |
| [npcs.png](npcs.png) | `npcs` | commoner, guard, shopkeep, noble, cultist, bandit |
| [cr0.png](cr0.png) | `cr0` | giant rat, goblin, kobold, skeleton, zombie, wolf, giant bat, gray ooze, giant spider, **goblin-alt1** (F1: kept big-head original) |
| [cr1.png](cr1.png) | `cr1` | orc, gnoll, bugbear, ghoul, giant snake, harpy |
| [cr2.png](cr2.png) | `cr2` | ogre (Large), **owlbear** (F2: body rebuilt = bulky BG3 bear mass, shoulder hump, feather ruff, heavy forelimbs; head kept), minotaur, wight, gargoyle, werewolf |
| [cr5.png](cr5.png) | `cr5` | troll, hill giant (Huge), wraith, stone golem, **young dragon** |
| [icons.png](icons.png) | `icons` | mimic, animated armor, shadow, wyvern, fire elemental, earth elemental |
| [variants.png](variants.png) | `variants` | dire wolf, worg, hobgoblin, cult fanatic, giant wolf spider, veteran |
| [props.png](props.png) | `props` | pillar, broken pillar, brazier, statue, altar, well, archway+portcullis, containers, cart, table, throne, web mass, torch, candelabra, lantern post |
| [alts.png](alts.png) | `alts` | **rogue-alt1** (OG upright twin-dagger stance), **owlbear-alt1** (OG reared body) — F2 originals · **paladin-alt1** (OG parade-rest), **druid-alt1** (OG totem), **mage-alt1**=wizard (OG upright), **ranger-alt1** (F2 bow-at-rest) — F3 originals; each kept when its primary was re-posed (alt policy) |
| [dragon-beauty.png](dragon-beauty.png) | — | Blender EEVEE beauty render of the flagship dragon |

## Size law (as shipped)
Small ~0.95u / disc r0.32 · Medium ~1.45u / r0.42 · big-Medium r0.48 · Large ~2.1u / r0.55
· dragon r0.62 · Huge ~2.7u / r0.68. Prop scale referenced to the ~1.5u humanoid.

## F2 — Fix wave B (2026-07-04, `feat/polish-fix-b`)
Three pieces rebuilt against gathered web references (notes in `dev/model-qa/pose-refs.md`); RED-FIRST
before/after captures in `dev/model-qa/captures-fix-b/`; Haiku positioning review PASS on all three.
- **ranger** — bow rebuilt: the old angular `>` chevron replaced with a smooth C-arc stave (6-segment
  quadratic curve) + a STRAIGHT string chord, arrow nocked-ready and seated on the string.
- **rogue** — re-posed to a sneaky crouch (drop+forward-lean transform, deep-bent legs, daggers tucked
  close). Fixes the hip-sprout dagger bug. New primary; OG kept as `rogue-alt1`.
- **owlbear** — body rebuilt to a bulky BG3 bear mass (heavier/wider trunk, shoulder hump, feather ruff
  at the shoulder/neck seam, forelimbs heavier than hind). Head kept verbatim. New primary; OG kept as
  `owlbear-alt1`. (Shared `parts.js` buildHead/buildHood gained an optional `xform` for the rogue
  crouch — default identity, so the other 11 classes are byte-unchanged; classes sheet re-verified 12/12.)

## F3 — Pose-expressiveness wave (2026-07-04, `feat/pose-wave`)
Four STIFF class poses (upright, at-rest, weapon dead-vertical) re-posed into class-EXPRESSIVE stances
(POLISH-WAVE-1 §F3: "poses that express the class beat weapon-swap flexibility"). References gathered
via web search (notes in `dev/model-qa/pose-refs.md` §F3); RED-FIRST before/after captures in
`dev/model-qa/captures-pose/`; Haiku positioning review PASS on all four. No new geometry — each
re-pose is transforms on the already-authored part assembly (grip/limb/leg landmark moves + light
head-region hunch). No `src/`/`data/` touched; `check-manifest.py` RESULT: OK.
- **paladin** — OATH-GUARD ready stance: shield raised UP + FORWARD across the body to a guard, the
  warhammer COCKED back/up at the right shoulder ready to strike, a wider staggered braced stance
  (lead/shield leg forward). New primary; OG parade-rest kept as `paladin-alt1` (buildPaladinAlt1).
- **druid** — LEANED-ON-STAFF communing hunch: the gnarled staff RAKED to a clear diagonal lean
  (base planted wide, top angled in over the body, grip riding high), the head/cowl/antlers TIPPED
  FORWARD in a weathered-elder hunch, a subtle weight-shifted leg stagger. New primary; OG totem kept
  as `druid-alt1` (buildDruidAlt1).
- **wizard** — INCANTATION stance: the orb-staff CANTED forward (orb leading), the FREE hand RAISED
  up-and-forward in an open casting gesture (spread finger nubs), the head/hat tipped forward. Orb
  stays ON the staff (no new floater — sorcerer keeps that). New primary; OG upright kept as
  `mage-alt1` (buildMageAlt1).
- **ranger** — FULL-DRAW aiming stance: the F2 C-arc bow held out front in the extended bow arm, the
  STRING drawn back to a deep V (top-nock → anchor at the jaw → bottom-nock), the draw arm pulled back
  with the elbow up, the arrow riding forward through the grip down-range, open staggered feet. The F2
  bow geometry is reused verbatim; only the draw + arms + legs re-pose. New primary; the F2 bow-at-rest
  ranger kept as `ranger-alt1` (buildRangerAlt1).
- Left as-is (already class-expressive at RED-FIRST): barbarian, rogue, monk, sorcerer, warlock, bard,
  fighter (braced guard), cleric (mace-up ready). cr1/cr5 stand-outs deferred (no cycles remained).

## Polish backlog (logged at director gates; none blocking placeholder use)
### F1 — Fix wave A (branch feat/polish-fix-a, 2026-07-04) — CLEARED
- ✅ **mimic** (BROKEN) — tongue now emerges BETWEEN the two fang rows (threads up through the gap,
  crests, lolls forward). Replaced outright, no alt. (Haiku re-review: PASS)
- ✅ **gnome** (BROKEN) — head shrunk from a balloon to a larger-than-human ratio (0.40u→0.27u head,
  radii −28%), nose push halved, eyes re-seated WIDE flanking the nose ridge per the eye standard.
  Replaced outright, no alt. (Haiku: GOOD)
- ✅ **giant rat** — the ambiguous flat ear-discs replaced with UPRIGHT rounded ears on a lift-stub
  (clear of the skull); snout pulled back over the (r0.32→0.35) disc. (Haiku re-review: PASS)
- ✅ **goblin** — head slightly smaller (radii −10%, crown/top lowered ~0.03u); big-head original KEPT
  as `mon-goblin-alt1.js` (buildGoblinAlt1), registered in the cr0 sheet set. (Haiku: both ACCEPTABLE)
- ✅ **dragonborn** — muzzle dialed IN per refs (blunt DEEP dragon snout, shortened ~0.084u, deeper
  cross-section — no longer the kobold snout); belt-knife brass pommel → matte leather (specular
  catch killed). (Haiku: muzzle reads blunt-dragon, PASS)
- ✅ **gray ooze** — palette de-blued to NEUTRAL grey (red channel raised to meet g/b at each value);
  engulfed skull STAYS. (Haiku re-review: GOOD)
- ✅ **wyvern haunch** — thigh rebuilt as ONE continuous 12-sided lofted drumstick (was a fat tube +
  overlapping low-res blob = lumpy). (Haiku re-review: PASS)
- ✅ **warlock grimoire** — pages enlarged + laid nearly flat (broad parchment spread up toward the
  camera) + cover block thickened; reads as an OPEN BOOK, not a knife edge-on. (Haiku re-review: PASS)
- ✅ **barbarian chest patch** — the bright P.skinLt chest BAND (the pale-chip source) replaced with
  even mid-skin + symmetric dark pec creases; grain-off capture confirms no geometry chip (residual
  faint speck is the global grain-atlas texel-dirt, not the authored patch). Rear/both axe-grips
  given knuckle nubs + thumb wraps so the fists read as closed grips.

### F1 — reduced but still open (polish, non-blocking; NOT broken)
- giant snake strike-neck: head pulled from clearly-past-the-rim to over disc-CENTER, anchored by the
  heavy coil; Haiku still flags high-CoG tip risk (intrinsic to a raised coiled-strike pose). Reduced.
- harpy wings: gained a solid membrane sail base + deeper/back-raked feathers; the forward wing now
  reads as a feathered sail, but the wing that goes edge-on to the fixed dimetric camera still reads
  thin (a spread-wide wing will always present one edge-on). Reduced, not fully eliminated.

### Other roster polish
- ~~rogue reverse-grip dagger reads as sprouting from the hip at hero angle only~~ — FIXED in F2 (re-pose)

## Next (per REFERENCE-DIRECTION §P1′)
1. Engine wiring: whole-object builders → BufferGeometry + material channels → figureMaterialFor
   → the shipped PSX pass (cuboids demote to fallback); lighting props anchor the rolled
   per-room light profiles.
2. `creatureId → builder` registry seam; palette-key material channels.
3. Down-state (tipped-piece) read check across the roster.
