# Extruded prop visual review

**Verdict: FAIL. Runtime-admitted assets: 0.**

This verdict is intentionally independent from technical compilation. A mesh can be finite,
watertight, correctly wound, serialized to GLB, and reloadable while still being unusable art.

## Capture history

The first proof contact sheet failed completely as visual evidence. Its upper field was mostly
blank, several sprites retained opaque magenta key color, detached source-sheet debris became
floating geometry, and the extrusions read as rough slabs. That image must never be cited as a
successful result.

The second proof removes the dominant key-color background and isolates the largest physical
component. It demonstrates that painted faces and side-shell geometry can be separated, but it is
still only a technical prototype. It has not passed independent visual QA and is not representative
of the target diorama quality.

## Blocking defects

1. Remove semi-transparent magenta edge spill without erasing intentional realm color.
2. Add a controlled bevel or chamfer so silhouettes catch light instead of reading as cut foam.
3. Assign semantic mount transforms: traps and grates lie on floors; doors bind to apertures;
   plaques, signs, screens, and levers bind to walls; portable props stand or hang by authored rules.
4. Replace one-color side shells with material-family recipes and edge-aware color sampling.
5. Validate state families against one shared origin, footprint, hinge, socket set, and scale.
6. Test canonical camera angles, contact shadows, occlusion, and practical lighting in the actual
   theater renderer rather than only in the isolated viewer.
7. Reject or reroute source art whose silhouette, disconnected components, or semantic volume is
   unsuitable for shallow extrusion.
8. Replace the coplanar front cap with the specified mature faceted relief mesh. The current flat
   cap and plain shell do not represent the accepted art direction.

The largest blocker precedes all seven: many legacy sprites were painted in three-quarter or
isometric perspective. Extruding that image adds physical depth behind an already foreshortened
depiction, creating irreparable double perspective. Those sprites are now reference art only and
are queued for one-at-a-time flat orthographic regeneration.

## Admission rule

Do not copy these GLBs into the runtime manifest. Admission requires all source, geometry, visual,
state-family, mount/contact, performance, and in-game render gates in
`docs/EXTRUDED-SPRITE-PROP-LIBRARY.md`. Until then, `technicalStatus: COMPILED` means only that the
compiler produced inspectable evidence.
