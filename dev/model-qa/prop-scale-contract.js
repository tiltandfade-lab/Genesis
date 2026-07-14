/* dev/model-qa/prop-scale-contract.js — THE PROP SCALE CONTRACT (feat/prop-scale-framework).

   THE authoritative single source for what real-world size every staged whole-object PROP (and
   the "light:" / "blank:" pieces that share the prop grammar) is supposed to read as. Promoted from
   prop-sheet.html's former inline PLAUSIBLE table (2026-07-08) after the scale audit found the
   systemic disc-uniformity failure: most base props were authored to fill the 0.84u base disc
   regardless of noun — well, crates, statue, grate, refuse and pool all staged ~3.4×3.4 ft. The
   disc is a BASE, not a size law. This file is the size law.

   UNITS — staged FEET under the sheet's human-yardstick calibration (docs/BLENDER-MODEL-SPEC.md §1,
   prop-sheet.html's FEET_PER_UNIT derivation):
     staged ft = authored u × WHOLE_OBJECT_SCALE(1.2) × realm-Size footprint multiplier
                 × FEET_PER_UNIT (6.0 / (1.475 × 1.2) ≈ 3.39)
     i.e. for a sizeless prop: 1 authored unit ≈ 4.07 staged ft; authored u ≈ target ft × 0.246.
     Realm-bespoke props staged by exactly ONE data/realm-props.js entry inherit that entry's Size
     multiplier (Small 0.55 / Medium 0.80 / Large 1.00 / Huge 1.60) — hit the target ft THROUGH it.

   ROW SHAPE — key → { targetFt, rationale }:
     targetFt.h      [min,max]  staged HEIGHT range in ft — every row claims height.
     targetFt.w      [min,max]  staged x-span range in ft — ONLY where the noun makes a width claim.
     targetFt.d      [min,max]  staged z-span range in ft — ONLY where the noun makes a depth claim.
     An absent w/d axis = no claim (a web can hug a wall or fill a corner; don't pretend the noun
     cares). Ranges are deliberately generous — outside a range means "wrong at a glance", not
     "off by taste". NOTE: the staged bbox includes the base disc, so a prop's measured w/d floor
     is its disc diameter (r 0.42 disc ⇒ ~3.4 ft) — ranges below account for that honestly.

   THIS IS A PRE-MODELING CHECKLIST, not just an audit table: before authoring/registering ANY new
   prop (probe-lib OR Blender/GLB), add its row here FIRST, derive authored units from targetFt,
   and only then build (docs/BLENDER-MODEL-SPEC.md §1b). prop-sheet.html imports this module and
   red-flags any staged cell outside its row — never widen a range to green a cell; fix the model
   (or report the cell honest-red if geometry can't reach the noun).

   Pure data ES module — no imports, browser+Node loadable. */

export const PROP_SCALE_CONTRACT = {
  /* ── the 12 base props (P1′ wave) ─────────────────────────────────────────────── */
  'prop:statue-figure': { targetFt: { h: [5, 13] },
    rationale: 'life-size to twice-life figure on a plinth; under 5ft reads as a bust, not a statue' },
  'prop:pillar-intact': { targetFt: { h: [7, 20] },
    rationale: 'a load-bearing column must clear head height with room — taller than any door' },
  'prop:pillar-broken': { targetFt: { h: [2, 10] },
    rationale: 'a sheared stump: anywhere from knee-high rubble base to a half-standing column' },
  'prop:table-slab': { targetFt: { h: [2, 4], w: [2.5, 8], d: [3, 10] },
    rationale: 'work/feast table: waist-high top, a surface you could lay a body or a map across' },
  'prop:throne-seat': { targetFt: { h: [4, 9] },
    rationale: 'high-backed seat of power — the back must rise well past a seated figure' },
  'prop:arch-frame': { targetFt: { h: [7, 20], w: [4, 15] },
    rationale: 'a walk-through masonry span: opening clears a standing figure, width spans a passage' },
  'prop:web-mass': { targetFt: { h: [3, 12] },
    rationale: 'a giant-spider web choking a corner or passage; footprint unclaimed (wall vs corner)' },
  'prop:well-shaft': { targetFt: { h: [4, 8], w: [4, 8], d: [4, 8] },
    rationale: 'village well: waist-high rim + windlass frame overhead; the mouth is 4ft+ across — anything narrower is a manhole' },
  'prop:crate': { targetFt: { h: [1.5, 4], w: [2, 6] },
    rationale: 'a crate or stacked cluster: chest-high at most, man-portable boxes' },
  'prop:cart': { targetFt: { h: [3, 6], d: [5, 10] },
    rationale: 'a hand/draft cart: bed + wheels must out-span a crate lengthwise' },
  'prop:shrine-block': { targetFt: { h: [2.5, 5] },
    rationale: 'a kneeling-height altar block — offerings placed on it while standing' },
  'prop:candelabra': { targetFt: { h: [4, 7] },
    rationale: 'floor candelabra: candle crowns at or above eye level' },

  /* ── the 12 env-wave props (prop-registration pass 2026-07-08) ────────────────── */
  'prop:brazier': { targetFt: { h: [2.5, 5.5] },
    rationale: 'a coal bowl on legs, tended while standing — waist to chest height' },
  'prop:portcullis': { targetFt: { h: [8, 16], w: [6, 16] },
    rationale: 'a gate spans a GATEWAY, not a doorway: taller than an arch opening, wide enough to bar wagons' },
  'prop:bone-wall': { targetFt: { h: [5, 12] },
    rationale: 'an ossuary wall mass — it blocks line of sight over a standing figure' },
  'prop:grate': { targetFt: { h: [0, 1.5], w: [2, 6] },
    rationale: 'a floor drainage grate: flat, but broad enough to read as a hazard/egress' },
  'prop:coffin-slab': { targetFt: { h: [2.5, 4.5], d: [6, 9] },
    rationale: 'a sarcophagus must hold a body lengthwise — 6ft+ of interior plus stone' },
  'prop:cage-frame': { targetFt: { h: [5, 12] },
    rationale: 'a hanging cage holds a person: occupant height plus frame and chain' },
  'prop:rubble-scatter': { targetFt: { h: [1, 5] },
    rationale: 'collapsed masonry: shin-high scatter up to a man-high heap' },
  'prop:chain-drape': { targetFt: { h: [3, 7] },
    rationale: 'wall manacles/chains hang at prisoner height' },
  'prop:gear-cluster': { targetFt: { h: [2, 10] },
    rationale: 'exposed mechanism: from a floor gearbox to a wall of machinery' },
  'prop:obelisk': { targetFt: { h: [8, 20] },
    rationale: 'an inscribed monument — it must dwarf the reader' },
  'prop:floating-monolith': { targetFt: { h: [8, 25] },
    rationale: 'the obelisk\'s uncanny sibling; hover gap included in the read' },
  'prop:basin-block': { targetFt: { h: [0, 1], w: [4, 15], d: [4, 15] },
    rationale: 'a sunken pool with a kerb: low lip, but the water body is 4ft+ across — 3.4ft is a puddle' },

  /* ── the 8 realm-bespoke props (REALM-MODELS-P3; staged through their realm Size) ── */
  'prop:sentry-turret-mount': { targetFt: { h: [2.5, 8] },
    rationale: 'a hardpoint pedestal + armature: crouch-height mount up to full turret mast' },
  'prop:conveyor-spur': { targetFt: { h: [2, 5], d: [6, 16] },
    rationale: 'an industrial belt run: hip-height line that visibly RUNS somewhere' },
  'prop:holo-pillar-ad': { targetFt: { h: [6, 15] },
    rationale: 'a floor-to-ceiling projector column — the ad panel must loom over street traffic' },
  'prop:blast-shutter-frame': { targetFt: { h: [8, 20], w: [8, 24] },
    rationale: 'a vehicle-rated bulkhead door frame — it seals a bay, not a corridor' },
  'prop:shroud-draped-loom': { targetFt: { h: [4, 8] },
    rationale: 'a standing loom under a dust shroud: worked sitting/standing, taller than its weaver\'s waist' },
  'prop:sin-eaters-bowl-stand': { targetFt: { h: [2.5, 5] },
    rationale: 'the ritual bowl presents at waist/chest height — the sin-eater eats standing over it' },
  'prop:charnel-pit': { targetFt: { h: [0, 4], w: [6, 16], d: [6, 16] },
    rationale: 'a mass grave pit: broad excavation with a low spoil rim — bodies, plural' },
  'prop:whispering-curtain-row': { targetFt: { h: [6, 12], w: [5, 20] },
    rationale: 'a ROW of hung panels spans more than one drape; the hems brush the floor from above head height' },

  /* ── lighting props (share the prop grammar + staging chain) ──────────────────── */
  'light:torchlit': { targetFt: { h: [4, 8] },
    rationale: 'a wall/stand torch burns at head height — carried-flame scale' },
  'light:lamplit': { targetFt: { h: [6, 12] },
    rationale: 'a street/post lamp lights from above head height' },
  'light:lavalit': { targetFt: { h: [4, 8] },
    rationale: 'shares buildTorch: a vent/flame source at figure scale' },
  'light:magic-glow': { targetFt: { h: [4, 7] },
    rationale: 'shares buildCandelabra: an arcane light source at candelabra scale' },

  /* ── blank fallbacks (the floor of the resolve chain, TABLETOP-UNITS §U3) ─────── */
  'blank:figure': { targetFt: { h: [4.5, 6.5] },
    rationale: 'the anonymous meeple IS the yardstick — it must stage at human height' },
  'blank:prop': { targetFt: { h: [1, 4] },
    rationale: 'a deliberately generic marker block — smaller than any named set piece' },
};
