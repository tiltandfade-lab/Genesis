# MICRO-PROPS — the interactable-object model wave (SPEC ONLY — execution not scheduled)

```
type: system-spec
status: SPECCED (2026-07-04; Adam: "go ahead and spec out the micro-prop wave"; execution is
QUEUED BEHIND the env waves — do not build from this doc until the director schedules it)
```

## Source

The per-room/per-leg interactable-object tables (dungeon-interactable-object d100 rolls every
dungeon room, `src/engine/dungeon-walk.js` ~414–418; wilderness equivalent per leg,
`src/engine/wild-walk.js` ~134–156). These nouns are what the player's hands touch — levers,
chains, grates — and today they render as nothing or a generic block.

## The wave (12 modules, variants absorb the rest of the d100)

| module | absorbs | notes |
|---|---|---|
| lever-set | lever-bar, pull-chain, crank-handle, valve-wheel | wall/floor mount variants |
| winch-drum | winch, counterweight-pulley, rope-coil on drum | rotation-implying silhouette |
| trapdoor-ring | trapdoor-ring, hinged/sliding grate, vent-cover | floor-flush + ring proud |
| rope-kit | rope-coil, rope-ladder, grappling-hook | hangs or coils |
| tool-set | crowbar, hammer-and-wedge, shovel-head, spikes/pitons | leaned/scattered cluster |
| bucket-and-trough | bucket, trough, basin | water-adjacent |
| cistern-lid | cistern-lid, small-sluice-gate, pipe-spout | pairs with drainage grate (env wave) |
| sconce-and-stub | sconce, candle-stub, oil-flask | micro light sources; feed room lighting |
| bell-line | bell-on-string, coil-of-wire, tripwire | thin geometry — verify PSX legibility |
| door-hardware | door-bar, door-wedge, hinge-pin, bolt-slide, chain-lock | mounts on arch/door props |
| pressure-plate | pressure-plate, turning-tile, carved-dial-disc | floor-flush, edge-highlight |
| hanging-softs | curtain/tapestry, hanging-net, rug-or-mat | cloth channel; drape language |

## Laws

- Scale: micro props sit 0.10–0.50u, referenced to the ~1.5u humanoid; floor-flush pieces must
  still read at game camera (edge highlight or 0.02u proudness, test at board distance).
- Placement: micro props attach NEAR their parent feature's zone (interactable rolls are
  room-scoped, not zone-scoped — placement rule: same zone as the room's feature prop when one
  exists, else a wall-adjacent edge tile). Render only at zoom levels ≥1 if board-distance
  legibility fails the Haiku review (clutter guard — decide per module at QA, record verdicts).
- Same seam as everything else: `THEATER_PROP_KEYWORD_RULES` entries mapping the d100 noun text
  → module + params. Same QA pipeline (ps1-sheet capture → positioning review → gate).
- PSX legibility is the design constraint: anything thinner than ~2 final-res pixels (wire,
  string, tripwire) gets a cheat-thickness or a ground-shadow quad — verify at CURRENT res
  (1/3); do not assume the grit bump lands.

## Verification (when scheduled)

Per-module before/after captures; a dedicated `micro` sheet set in ps1-sheet + INDEX.md;
keyword-rule coverage test extending `dev/verify-dressing.mjs`'s theater-pickup pattern
(fixture room with interactable noun → mapped module in board output).
