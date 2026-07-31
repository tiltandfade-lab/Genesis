# Golden Vignette architecture-ruling audit

type: implementation-evidence
status: READ-ONLY POST-RULING OVERLAY
generated: 2026-07-30
source: `golden-vignette-wave1-corpus.jsonl.gz`
audit: `golden-vignette-architecture-ruling-audit/1`

## Result

The retained 12,718-request Wave-1 corpus remains byte-identical at
`539476547e65f56c7d506effc1b292502843d0162b28f93139fc5ac7fc32ce9e`. This audit adds a one-to-one read-only overlay; it changes
zero request dispositions and contains zero Golden Site runtime ids.

The old adapter was strong at host/materialization classification but could not express the new
architecture rulings: the original corpus has no natural-frequency scale owners. The overlay finds
7,505 architecture-bearing requests,
763 body/scale-relative demands, and
1,247 local construction demands.

Most importantly, 627 scale-coded requests remain
`DECORATE_LOCAL`. Scale demand therefore cannot be used as a hidden site-promotion rule.

## Battle-space demand

| Mode or resolution | Rows | Corpus |
|---|---:|---:|
| NOT_ARCHITECTURE_BEARING | 5,213 | 40.989% |
| EXTERIOR_ARCHITECTURAL_PRECINCT | 3,895 | 30.626% |
| DEDICATED_INTERIOR | 3,597 | 28.283% |
| UNRESOLVED_MODE | 13 | 0.102% |

There are 0 safely inferred hybrids. This is deliberate:
the corpus has no retained causal exposure evidence strong enough to turn a ruin, collapsed object,
or open urban fabric into a hybrid interior/exterior battle space. Hybrid remains legal only when a
source names the breach, missing roof, collapse, or other exposing cause.

## Institutional-scale demand

| Scale class | Rows | Corpus |
|---|---:|---:|
| NONE | 5,213 | 40.989% |
| CIVIC | 4,242 | 33.354% |
| MONUMENTAL | 1,386 | 10.898% |
| ELITE | 801 | 6.298% |
| DOMESTIC | 772 | 6.07% |
| FRONTIER | 202 | 1.588% |
| MEGAINTERIOR | 102 | 0.802% |

`DOMESTIC` does not mean poor styling, and `FRONTIER` does not mean crude styling. These classes
govern program breadth, proportion, construction, and continuation. Condition remains a separate
transform.

## Highest proof demands

| Proof demand | Rows | Corpus |
|---|---:|---:|
| STRICT_MODULAR_ASSEMBLY_CLEARANCE | 7,505 | 59.011% |
| EXTERIOR_PRECINCT_COMPOSITION | 3,895 | 30.626% |
| DEDICATED_INTERIOR_COMPOSITION | 3,597 | 28.283% |
| LUXURY_AND_WONDER_AT_SCALE | 2,187 | 17.196% |
| LOCAL_CONSTRUCTION_WITHOUT_SITE_PROMOTION | 1,247 | 9.805% |
| PURE_CAVERN_WITHOUT_LAIR_IMPLICATION | 810 | 6.369% |
| BODY_RELATIVE_SCALE_AND_CLEARANCE | 763 | 5.999% |
| PRISON_ASYLUM_PROGRAM_DISCRIMINATOR | 219 | 1.722% |
| MEGAINTERIOR_WITHOUT_EXTERIOR_VISIBILITY | 102 | 0.802% |

This census recommends the next proof sequence:

1. an urban exterior architectural precinct combining terrain and architecture;
2. a human monumental dedicated interior whose exterior is not visible;
3. a megainterior/body-relative window with explicit builder-versus-current-occupant evidence;
4. a linked fortress exterior and dedicated interior, retained as two windows rather than an
   unjustified hybrid; and
5. a local oversized feature that remains `DECORATE_LOCAL` while modifying terrain, clearance,
   camera composition, and interaction scale.

## Questionable patterns retained for resolution

- **Prison / Asylum:** 219 rows remain `UNRESOLVED`. Both can license
  dedicated institutional interiors, but their operating models, care/custody circuits, responsible
  roles, access, and visual storytelling are not interchangeable. The upstream table needs an
  explicit program discriminator before either host can materialize.
- **Pure cavern:** 810 rows remain natural-cavern demands, not lairs.
  A lair needs explicit occupant shaping, claim, nest, body-scaled mouth, and bolt-hole evidence.
- **Megastructure:** 64 rows need original-builder,
  original-occupant, current-occupant, and body-envelope discrimination. None are labeled
  `GIANT_LEGACY` from size alone.
- **Hybrid:** zero rows are promoted because they are ruined. Ruin is physical condition, not
  operating state or battle-space posture.

## Scale-coded local examples

| Case | Disposition | Primary type | Feature |
|---|---|---|---|
| `natural:wilderness:0008` | DECORATE_LOCAL | 40' x 60' Figure-Eight | Colossal Statue (Head): Half-buried giant face. |
| `natural:wilderness:0013` | DECORATE_LOCAL | 40' x 100' S-Curve (20' wide) | Gargantuan Eggshells: Leathery shards the size of carts. |
| `natural:wilderness:0014` | DECORATE_LOCAL | 30' x 50' Crescent Moon | Giant Anchor: Rusted iron hook the size of a house. |
| `natural:wilderness:0015` | DECORATE_LOCAL | 20' x 50' Parallel Tunnels | Fossilized Tree: Giant tree turned entirely to stone. |
| `natural:wilderness:0026` | DECORATE_LOCAL | 60' x 90' Figure-Eight | Mushroom Ring: A perfect circle of giant toadstools. |
| `natural:wilderness:0039` | DECORATE_LOCAL | 50' Diameter Circle | Colossal Statue (Head): Half-buried giant face. |
| `natural:wilderness:0041` | DECORATE_LOCAL | 80' x 80' Cross-Junction (30' wide) | Beast Statue: Massive stone lion, hound, or dragon. |
| `natural:wilderness:0042` | DECORATE_LOCAL | 20' x 50' Parallel Tunnels | Giant Spear: A 30-foot long iron weapon impaled in the dirt. |

## Invariants

- one overlay row per source case: **PASS**
- disposition mutations: **0**
- Golden Site ids in runtime overlay: **0**
- pure-cavern → lair leaks: **0**
- hybrids without explicit cause: **0**
- inferred giant-legacy claims: **0**

## Artifact use

The gzip JSONL overlay is diagnostic input for proof selection and future adapter design. It is not
a second roller, a production runtime registry, or permission to hard-code these inferred classes.
Production adoption requires the walk adapter to carry explicit program, battle-space, builder,
occupant, body-envelope, and causal-exposure facts at the request boundary.
