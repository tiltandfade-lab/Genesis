# Connective Parts Intake Audit — 2026-07-26

## Result

The twenty requested jobs produced eighteen represented concepts. `CP005` (T-junction) and `CP014`
(shed verge) did not return.

- 12 whole-model donors accepted after cleanup;
- 1 useful decomposition-only donor (`CP010`);
- 5 whole-model results rejected or superseded by cheaper assembly recipes;
- 7 accepted candidates received conservative topology repair;
- all accepted donors contain zero embedded images, materials, UV layers, boundary edges, and
  non-manifold edges;
- the former `incoming/` staging directory is empty and has been removed.

Accepted lightweight donors live in `processed/connective-parts/`. Rejected cleaned probes live in
`processed/rejected/connective-parts/`. The stepped-foundation donor lives in
`processed/decomposition-only/connective-parts/`.

All twelve accepted connective donors later received conservative structural planarity correction.
Their `clean-v2` files supersede `clean-v1` for new integration work; triangle counts, loose-part
structure, closed boundaries, and non-manifold status remain unchanged. See
`STRUCTURAL-PLANARITY-PASS-2026-07-26.md` for the proof gallery and validation record.

## Material and texture ruling

The Meshy texture exports did not provide useful semantic material slots. They generally contained
one baked material and four embedded images wrapped around low-poly geometry. The apparent material
division was painted color, not a reusable wood/stone/metal/infill segmentation contract.

The cleaned donors therefore retain geometry and loose-part separation but remove Meshy materials,
images, UVs, colors, normals, and tangents. Genesis should assign its own channels after semantic
decomposition:

- `structurePrimary`
- `structureSecondary`
- `masonry`
- `infill`
- `metal`
- `roofSkin`
- `repair`

Eighteen connective texture wrappers (about 351 MiB) and the earlier repaired organic texture source
(about 20 MiB) were deleted after their lightweight geometry and proof renders were preserved.

## Per-job verdicts

| job | result | cleaned geometry | verdict |
| --- | --- | ---: | --- |
| CP001 | wall end cap | 514 tris / 4 closed parts | accept |
| CP002 | inline joint | 568 tris / 6 closed parts | repaired and accepted |
| CP003 | outer corner | 652 tris / 11 closed parts | repaired and accepted |
| CP004 | inner corner | 852 tris / 26 closed parts | accept |
| CP005 | T-junction | no return | regenerate only if CP006 cannot be pruned into the T recipe |
| CP006 | cross junction | 790 tris / 17 closed parts | repaired and accepted |
| CP007 | door frame | 826 tris / 11 parts, major members open | reject as a whole model; assemble from accepted beams/posts or procedural wall construction |
| CP008 | window frame | 890 tris / 8 closed parts | accept |
| CP009 | level foundation plinth | 1,218 tris / 28 closed parts | accept |
| CP010 | stepped foundation | 1,438 tris / 32 parts, one bad block | decomposition-only; rebuild the transition from its good blocks or from CP009 |
| CP011 | wall-top cutaway cap | 946 tris / 18 closed parts | accept |
| CP012 | structural corner pier | 1,084 tris / 7 closed parts | repaired and accepted |
| CP013 | shed eave | 960 tris / 82 closed parts | one malformed sliver removed; accepted |
| CP014 | shed verge | no return | assemble from CP013 rafters/fascia or regenerate later |
| CP015 | roof-bearing plate | 870 tris / 9 closed parts | accept |
| CP016 | repeating gable ridge | 1,550 tris / 20 closed parts | four malformed slivers removed; accepted |
| CP017 | ridge end cap | 1,031 tris / 38 parts, many open | reject whole; derive a cap recipe from CP016 |
| CP018 | lower stair landing | 1,149 tris / 18 parts, most open | reject whole; procedural stair geometry remains cheaper and safer |
| CP019 | upper stair landing | 424,766-triangle reconstruction | reject; mirror or terminate the procedural CP018 concept |
| CP020 | repaired corner | 266,692-triangle reconstruction | reject; assemble from CP003 plus M062-B brace and engine-owned straps |

## Decomposition value

### Highest-value universal donors

- **CP001:** terminal post, short beam, cap, and foot. This is the smallest useful wall-end grammar.
- **CP002:** straight opposing beams, central post, cap, and layered foot. Pruning one arm produces a
  simpler one-sided join.
- **CP003:** corner core, perpendicular beams, brace, cap, and foot. This is the base for intact,
  reinforced, repaired, and breached corner recipes.
- **CP006:** four beam arms around one post. Arm masking yields cross, T, elbow, inline, and terminal
  junction recipes without requiring five unrelated meshes.
- **CP009:** fitted stone blocks, footing course, body course, and top course. Blocks can be repeated,
  shortened, stepped, damaged, or culturally re-materialed.
- **CP013:** roof panels, individual tile-like plates, rafter tails, fascia, and edge closures. It is
  more valuable as a roof-edge parts bin than as one fixed roof object.
- **CP015:** notched bearing plate plus three brackets. Bracket count and spacing can be procedural.
- **CP016:** ridge cap, roof rows, end closures, rafters, and A-frame structure. It can supply ridge,
  ridge end, roof patch, partial collapse, and exposed-frame states.

### Useful composed modules

- **CP004:** inner-corner closure where light sealing and infill ownership matter.
- **CP008:** window opening frame; jambs, lintel, sill, and pegs can be independently materialed.
- **CP011:** cutaway wall body with a guaranteed closed crown.
- **CP012:** stone-footed pier for corners, roof supports, gate supports, and elevated platforms.

## Recommended engine use

Do not register every island as an unrelated catalog prop. Register semantic recipes that instance
the useful parts:

1. choose a junction topology;
2. select or suppress beam arms;
3. apply scale and wall thickness;
4. assign semantic material channels from culture and realm context;
5. apply intact, repaired, damaged, breached, or abandoned state modifiers;
6. add engine-owned fasteners, decals, rope, chain, effects, collision, and sockets.

This batch is most valuable as a construction vocabulary. The engine should own combination and
state; Meshy should own only the chunky donor silhouettes.

## Intake cleanup

Raw non-textured donors now live under:

- `source-archive/adjudicated/`
- `source-archive/variants/`
- `source-archive/rejected/`
- `source-archive/organic/`
- `source-archive/connective-parts/geometry-source/`

The old source ledger was preserved at `source-archive/ledgers/SOURCE-LEDGER-v1.json`. No GLB or
texture remains in `incoming/`; the directory itself was removed so the next upload begins with a
visibly clean intake queue.
