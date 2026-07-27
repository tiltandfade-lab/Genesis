# Genesis Engine-Owned Procedural Asset Kit

Status: implemented and browser-verified, 2026-07-27.

## Plain-English purpose

Not every useful object should consume a Meshy model. Many objects are systems of repeated parts:
wheels, axles, hinges, rope, chain, cargo sockets, flames, signs, and damaged-state additions.
Genesis now builds those parts itself.

This gives the procedural site engine a shared box of construction pieces. A cart, gate, winch,
fixture, barricade, mine mechanism, or abandoned camp can reuse the same geometry while changing:

- dimensions;
- attachment points;
- regional wood, stone, iron, cloth, and ceramic;
- cultural presentation;
- cargo;
- condition;
- emitted light and effects.

Meshy remains valuable for complicated authored silhouettes. It no longer needs to generate every
wheel, hinge, hook, rope, bracket, or state variation.

## Runtime owner

`src/ui/theater-procedural-kit.js` is a standalone ES module loaded by `genesis.html` after
`src/ui/theater-donor.js`. It reuses the donor adapter's regional material resolver so generated
parts and imported donors respond to the same narrative material context.

The module republishes its public API as:

```js
window.TheaterProceduralKit
```

## Generated catalog

### Standardized mechanical parts

- wheel
- axle
- handle
- crank
- hinge
- latch
- hook
- bracket
- spike
- foot
- pulley
- bearing block
- clamp
- collar
- coupler
- eyelet
- cleat
- pin
- rung
- cap
- gear
- sprocket
- ratchet
- pawl
- winch drum
- spool
- roller
- chain guide
- fairlead
- shackle
- swivel
- tensioner
- buckle
- strap loop
- corner plate
- gusset
- anchor plate
- wedge
- runner
- socket cup

Every part carries named sockets appropriate to its use. Wheels carry axle sockets; axles carry
wheel and chassis sockets; hinges expose fixed, moving, and axis ownership; hooks expose suspension
and load sockets. The first ten received a second modeling pass with clearer fasteners, collars,
grips, iron tires, hinge knuckles, and mounting hardware. The second ten fill recurring connection
gaps for hoists, shafts, rope handling, ladders, posts, gates, and repair assemblies.

The next twenty extend the same runtime system rather than forming a separate prop collection:

- power transfer: gear, sprocket, ratchet, pawl, winch drum, spool, and roller;
- rope and chain routing: chain guide, fairlead, shackle, swivel, and tensioner;
- fastening: buckle and strap loop;
- structural reinforcement: corner plate, gusset, and anchor plate;
- ground/contact adaptation: wedge, runner, and socket cup.

All forty also belong to a runtime functional catalog. A procedural site recipe does not need to
know every model name. It may request `power-transfer`, `rope-routing`, `reinforcement`,
`ground-contact`, `closure`, `hoist`, `cargo`, or another catalog use and receive a deterministic
compatible part. This is the production consumption seam; the galleries are only demonstrations.

### Engine paths

- rope
- chain

Both accept a caller-owned point path. Rope generates a low-sided tube along that path. Chain
generates alternating low-poly links. Start and end sockets are always retained.

### Effects

- flame
- ember
- magical emission
- smoke

Effects are generated geometry or particles with deterministic animation. They expose a tick hook
through the shared kit and may include small local lights. No effect owns gameplay damage, duration,
fuel, spell rules, or visibility mechanics.

### Containers and cargo

- crate
- barrel
- sack
- jar
- basket
- configurable cargo rack

The cargo rack exposes indexed cargo sockets. Containers expose floor and contents sockets. The
same container can therefore occupy a wagon, shelf, camp rack, mine cart, market stall, hoist, or
warehouse recipe without becoming a new model.

### Surface media

- sign
- paper
- banner
- decal

These are generated physical surfaces with deterministic marks. Callers may supply a short label,
colors, dimensions, and seed. Text and symbols remain presentation; narrative truth stays in the
scene and Codex records.

### Composable state recipes

- intact
- repaired
- damaged
- breached
- open
- closed
- occupied
- abandoned

These eight names remain as compatibility presets, but they are not one flat state axis. The runtime
now stores three independent dimensions:

- `condition`: intact, repaired, damaged, breached, or abandoned;
- `access`: neutral, open, or closed;
- `occupancy`: vacant or occupied.

This permits honest combinations such as `repaired + open + occupied` or
`damaged + closed + vacant`. Recipes always begin by restoring remembered base transforms. They
then use strong geometry and silhouette changes:

- `repaired` adds large crossed sister planks, metal patch plates, and visible lashing;
- `damaged` sags the closure, removes one member, and adds a fallen beam and splinters;
- `breached` creates a central negative-space opening with broken stubs and a rubble fan;
- `open` rotates the declared closure approximately 90 degrees around its real hinge pivot;
- `closed` adds an outside crossbar, brackets, and padlock;
- `occupied` clusters two or three containers at sockets and adds a restrained activity light;
- `abandoned` sags the closure, dulls materials, adds overgrowth, loose paper, and slack rope.

The state recipe is visual. Mechanical passability, cover, inventory, occupation, and interaction
truth continue to belong to the gameplay engine.

### Readability law

A gameplay state must read before its label. Material tint and tiny surface details are supporting
signals, never the primary difference.

Each non-neutral preset must change at least two of:

- outer silhouette or major pose;
- negative space;
- missing or displaced structural members;
- large repair/damage dressing;
- object clustering that implies active use;
- ground evidence such as rubble, fallen members, or overgrowth.

This follows established environment-language guidance: preserve silhouettes, buffer important
signals, and express history through object arrangement and environmental reaction rather than
requiring exposition. References:

- [What Happened Here? Environmental Storytelling — GDC](https://www.gdcvault.com/play/1012696/What-Happened-Here-Environmental)
- [Defining Environment Language for Video Games](https://80.lv/articles/defining-environment-language-for-video-games)
- [Environment Art — The Level Design Book](https://book.leveldesignbook.com/process/env-art)

## Semantic material channels

Generated geometry uses:

- `structurePrimary`
- `structureSecondary`
- `masonry`
- `metal`
- `cloth`
- `paper`
- `cargo`
- `repair`
- `growth`
- `emission`

The geometry stores the channel; the current scene resolves its actual material. The same wheel or
barricade can therefore become pine, oak, ironwood, driftwood, rotwood, creosote-treated pine,
wrought iron, rusted iron, granite, sandstone, slate, canvas, wool, or earthenware without changing
the mesh.

## Public API

```js
const kit = window.TheaterProceduralKit;

const wheel = kit.createPart("wheel", {
  radius: 0.34,
  contextText: "fresh-cut local pine",
  seedKey: "guard-post:wagon:wheel"
});

const selectedForMineHoist = kit.createPartForUse("power-transfer", {
  seedKey: "mine:main-hoist:drive",
  contextText: "soot-black creosote over raw pine"
});

const ropeHardwareChoices = kit.partKindsForUse("rope-routing");

const rope = kit.createPath("rope", [
  [0, 1, 0],
  [0.5, 1.1, 0],
  [0.5, 0.2, 0]
], {
  radius: 0.018,
  seedKey: "mine-hoist:rope"
});

const rack = kit.createCargoSocketRack({ slots: 3 });
const crate = kit.createContainer("crate");
kit.attachAtSocket(rack, crate, "cargo", 0);
kit.applyState(rack, "repaired");

const barrier = kit.createBarrier();
kit.applyStateRecipe(barrier, {
  condition: "repaired",
  access: "open",
  occupancy: "occupied"
});

function frame(time, delta) {
  kit.tick(scene, time, delta);
}
```

## Proof and verification

Interactive pages:

- `/dev/model-foundry/procedural-asset-kit.html`
- `/dev/model-foundry/procedural-asset-state-gallery.html`
- `/dev/model-foundry/procedural-connective-parts-gallery.html`

Static proofs:

- `dev/model-foundry/procedural-asset-kit-proof.png`
- `dev/model-foundry/procedural-asset-state-recipes-proof.png`
- `dev/model-foundry/procedural-connective-parts-proof.png`

Verification:

```text
node dev/verify-procedural-asset-kit.mjs
```

The verifier boots the real browser module and confirms:

- 60 displayed foundry objects;
- 40 mechanical part types;
- 2 path types;
- 4 live effect types;
- 4 surface types;
- 5 container types;
- all 8 states, including an automated state-cycle test;
- all 10 material channels;
- all three state axes and their eight compatibility mappings;
- required large visual signifiers for repaired, damaged, breached, closed, occupied, and abandoned;
- a closure rotation large enough to read as open;
- all forty parts with non-empty geometry and at least two useful sockets;
- targeted mesh-island checks for gears, sprockets, ratchets, chain guides, fairleads, shackles,
  and tensioners so small hardware cannot float free of its core or frame;
- deterministic functional-use selection from the forty-entry runtime catalog;
- the production `genesis.html` module mount and manifest-owned integration symbols;
- non-empty geometry;
- semantic channel ownership;
- the public browser bridge;
- a bounded proof-scene triangle budget;
- all three proof screenshots.

## Production boundary

Use this kit when variation comes primarily from dimensions, repetition, attachment, material,
cargo, condition, or effects.

Use a donor model when the object's value comes primarily from a difficult authored silhouette,
complex biological construction, sculpture, culturally distinctive carving, or machinery that
cannot be described cleanly as reusable modules.
