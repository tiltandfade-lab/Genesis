---
type: research-data-contract
project: Genesis
status: PROBE CONTRACT — R4 Codex chassis throughput probe only, not the production schema
created: 2026-07-31
serves: docs/research/CODEX-CHASSIS-THROUGHPUT-PROBE.md §Setup items 2-3
validator: dev/research/verify-chassis-gate.mjs
exemplar: dev/research/chassis/exemplar-watchhouse.json
---

# ChassisV0 — declarative chassis data shape (probe contract)

A **chassis** is one taste-reviewable parameterized building assembly, authored as plain JSON
data. The validator instantiates it mechanically (no model call, no renderer) and gates it.
This is the contract the R4 Codex lane authors against. It is deliberately smaller than the
production schema sketched in GOLDEN-SITE-SPATIAL-COMPILER-PLAN.md §5.2 — a probe contract,
not a replacement.

## Units and frame

- Grid law per `CLAY_STRUCTURE_KIT_CATALOG.gridLaw` (src/engine/clay-room.js): **1 cell = 5 ft
  = 1 world unit**; vertical quantum H = 2.5 ft = 0.5 wu; one storey = 4 H = 10 ft.
- Chassis-local cell frame: cells `(x, y)`, `x ∈ [0, w)`, `y ∈ [0, d)`.
- **Faces** reuse the socket registry's compass names (src/ui/theater-socket-algebra.js,
  `butt-join-n/e/s/w`; clay-room specimens prove `butt-join-s` ⇒ axis `{x:0, z:+1}`):
  `"n"` = the y=0 edge, `"s"` = the y=d−1 edge, `"e"` = the x=w−1 edge, `"w"` = the x=0 edge,
  plus `"top"` / `"bottom"` for bearing planes. Face lengths: n/s span `w` cells, e/w span `d`.
- Socket/attachment vocabulary reuses registered `SOCKET_TYPES` ids (`walk-surface`,
  `top-surface`, `terrain-join`, `open`) and join-class words (`bearing-plane`, `wall-face`,
  `run-end`, `declared-open`). No parallel vocabulary is introduced.

## Resolvable numbers (the whole parameter mechanism)

Any field marked *resolvable* is either a JSON number or one of exactly three object forms:

| form | meaning |
|---|---|
| `{"param": "name"}` | the current value of parameter `name` |
| `{"selectByParam": "name", "options": [v0, v1, …]}` | `options[value]`; the parameter must be an integer with `min: 0`, and `options.length` must cover `max + 1` |
| `{"sum": [r0, r1, …]}` | sum of resolvables (recursive) |

Nothing else. No expressions, no eval, no strings-as-math.

## Top-level shape

```jsonc
{
  "chassisVersion": "ChassisV0",
  "id": "chassis-…",                    // stable slug
  "family": "compact-watch-structures", // one of the probe's three named families
  "label": "…",
  "_source": { … },                     // provenance only; ignored by gates (any "_" key is)

  "parameters": [                       // 3+ meaningful parameters per the probe ask
    { "name": "familyVariant", "min": 0, "max": 2, "default": 0, "integer": true,
      "affects": ["footprint", "deckAttachment", "sitePlacement"] }
  ],

  "footprint": {                        // envelope, resolvable w/d
    "w": <resolvable>, "d": <resolvable>,
    "wRange": {"min": 4, "max": 6},     // declared legal envelope bounds
    "dRange": {"min": 4, "max": 6}
  },

  "storeys": [                          // ground up, index order
    { "id": "storey-0", "role": "guardroom",
      "enclosure": "enclosed" | "open-deck",
      "heightUnits": 2.25,              // world units, informational (gated only > 0)
      "plan": "footprint" }             // V0: every storey plan = the footprint rect
  ],

  "wallRuns": [
    { "id": "…", "storey": "storey-0", "face": "e",
      "span": "full" | {"from": <int>, "to": <int>},   // inclusive cell-edge slots on the face
      "class": "masonry-wall" | "masonry-parapet",     // must exist in supportClasses
      "thicknessUnits": 0.38,
      "supportedBy": ["foundation"],    // "foundation" | "roof-deck" | a storey id | a terrain bearing
      "openings": [ … ] }               // see below
  ],
  "declaredOpen": [                     // open-deck storeys only: deliberate absences
    { "storey": "storey-1", "face": "e", "span": "full" | {…},
      "socketType": "open",             // registry's declared-open type
      "reason": "defensive-overwatch-and-stair-arrival" }
  ],

  "roof": {
    "familyId": "flat-deck-parapet",    // this probe gates flat decks; pitched families later
    "covers": "top-enclosed-storey",    // or explicit [{x,y,w,d}] rects (resolvable numbers)
    "walkable": true,
    "thicknessUnits": 0.24,
    "supportedBy": ["storey-0-walls"]
  },

  "deckAttachment": {                   // 0..1 in V0; null when absent
    "id": "crown-deck", "kind": "crown-deck",
    "face": "n",                        // which footprint face it attaches along
    "alongOffset": <resolvable>,        // cells from that face's origin corner (may be negative)
    "w": <resolvable>, "d": <resolvable>,
    "lapRows": <resolvable>,            // rows overlapping the roof deck (bearing on it)
    "bearingH": <resolvable>,           // H units, informational
    "bearing": ["terrain-crown", "roof-deck"],  // every name must resolve (see support gate)
    "attachSocketType": "walk-surface",
    "externalAccess": true,             // site terrain may reach it; NOT counted for stair-reach
    "programRole": "lookout",
    "label": <resolvable-or-select-of-strings>   // select over strings is allowed for labels
  },

  "foundation": {
    "modes": ["negotiated-bearing-shelf", "shoulder-plinth"],
    "shelfH": <resolvable>,             // H units the site must negotiate (informational)
    "plinthTopUnits": 1.02,
    "apronWidthCells": 1,               // walkable ring the plinth offers around the footprint
    "apronFaces": ["n","e","s","w"],
    "terrainBearings": ["terrain-crown"],        // terrain names attachments may bear on
    "approach": { "face": "e", "provider": "site-grade", "external": true }
  },

  "stairs": [
    { "id": "…", "from": "ground" | "<storeyId>", "to": "<storeyId>",
      "face": "e",                      // face whose exterior it climbs along
      "widthCells": 1, "steps": 7,
      "supportMode": "grounded-solid" | "bearing-on-lower-structure",  // architectureAddStair's own two modes
      "supportedBy": ["foundation-apron"], "class": "stair-bearing" }
  ],

  "accessRecords": [                    // program access declarations (vignette-style edges)
    { "id": "guard-entry", "from": "exterior:road-apron", "to": "storey-0",
      "kind": "door-threshold", "via": "guard-door", "programRole": "operating-threshold" },
    { "id": "guard-crown-retreat", "from": "storey-1", "to": "exterior:crown",
      "kind": "deck-egress", "via": "crown-deck", "external": true, "programRole": "retreat" }
  ],

  "supportClasses": {                   // overhang allowance per class, cells
    "masonry-wall":    { "maxOverhangCells": 0 },
    "masonry-parapet": { "maxOverhangCells": 0 },
    "timber-deck":     { "maxOverhangCells": 0 },
    "stair-bearing":   { "maxOverhangCells": 0 }
  },

  "sitePlacement": {                    // OPTIONAL: how the site window anchors the chassis
    "anchorX": <resolvable>,            // resolved for legality across the sweep;
    "anchorY": <resolvable>             // no geometric gate beyond resolvability in V0
  },

  "obligations": {                      // the family contract, declared as data
    "operatingThreshold": { "exactly": 1 },
    "lookout":            { "min": 0, "max": 1 },
    "retreat":            { "min": 1 }
  },
  "declares": { "operatingThreshold": 1, "lookout": 1, "retreat": 1 }  // what THIS chassis claims
}
```

### Opening record

```jsonc
{ "id": "guard-door", "kind": "door",   // door | gate | observation-window | window | hatch
  "station": <resolvable>,              // first cell-edge slot it occupies on the face (0-based)
  "widthCells": <resolvable>,
  "clearance": { "widthUnits": 1.25, "heightUnits": 1.75, "sillUnits": 0 },
  "access": "walk" | "none",
  "observation": true|false }
```

Camera cutaway apertures (`kind: "cutaway-opening"`, AF-03's `guard-open-front`) are
presentation machinery and are **not chassis data** — do not author them.

## Mechanical gates (what the validator enforces, in order)

Gate names are stable; failure messages name the gate and the offending element.

1. **shape** — required fields present and typed; unknown storey/face refs; every
   `{"param"}` reference names a declared parameter. Abort on failure.
2. **parameter-legality** — per parameter: `min ≤ default ≤ max`, `min ≤ max`, integer flag
   honored, `affects` non-empty, parameter referenced at least once (an unused parameter is
   dishonest variety), every `selectByParam` options list covers the parameter's range.
3. **closed-wall-loops** — per storey: *enclosed* ⇒ wall-run spans tile every perimeter
   edge slot exactly once (no gap, no double wall). *open-deck* ⇒ every slot is either a
   parapet-class wall or a `declaredOpen` span; undeclared gaps fail.
4. **roof-coverage** — resolved roof cells ⊇ every cell of the topmost *enclosed* storey.
5. **opening-placement** — every opening sits on an exterior face within the face's slot
   range; positive clearance; walk-access openings require an exterior walkable approach
   (a foundation apron on that face, or a stair/attachment landing) and a walkable interior.
6. **program-obligations** — `declares` sits inside `obligations`; then the instantiation
   must match `declares` exactly, counted by fixed validator rules:
   *operatingThreshold* = walk-access openings of kind door/gate;
   *lookout* = deckAttachments (plus open-deck storeys) tagged `programRole: "lookout"`;
   *retreat* = accessRecords tagged `programRole: "retreat"` whose `via` element exists.
7. **stair-reach** — reachability over: ground ↔ storey via walk door/gate on an
   apron-served face; storey ↔ storey (or ground) via stairs. Deck attachments are
   external-dependent and do **not** count. Every storey must be reachable from ground.
8. **support** — every wall run, roof, stair, and attachment names supports that resolve
   (a storey's walls, the foundation, a declared terrain bearing, or another element);
   structure-on-structure footprints may not overhang their support beyond the element's
   `supportClasses` allowance, measured in cells.
9. **parameter-sweep** — every parameter at min / mid / max (integers rounded, deduped):
   full cross product when ≤ 27 combos, else axis-at-a-time around defaults. Every
   instantiation must pass gates 3–8. Failures name the combo and the inner gate.

## Verdict contract

`node dev/research/verify-chassis-gate.mjs <chassis.json>` — run all gates, print each
named check PASS/FAIL with messages, exit 0 iff all pass.

`node dev/research/verify-chassis-gate.mjs --suite` — run the exemplar (must PASS) plus
every fixture in `dev/research/chassis/negative/` (each carries
`"_expect": {"verdict": "FAIL", "check": "<gate>"}` and must fail **that named gate**).
Exit 0 iff every expectation holds. This is the red-first proof the Teeth Law requires:
the suite is the enforcing check that the gates actually bite.
