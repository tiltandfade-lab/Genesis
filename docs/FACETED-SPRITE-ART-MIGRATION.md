---
type: graphics-plan
project: Genesis
status: SPECCED 2026-07-12
audience: Claude/Codex graphics sessions
---

# Faceted Sprite Art Migration

## Decision

Genesis is migrating legacy sprite art to a mature faceted low-poly visual language. This is a
versioned art migration, not a destructive asset replacement and not a rewrite of the Walk, table,
registry, encounter, or fallback systems. Semantic IDs remain stable while visual payloads advance.

**Current production scope is Fantasy only.** Gloom, Chrome, and every other realm remain inventory
and reference data. Do not generate or admit their v4 replacements until the Fantasy pilot has passed
all isolated and integrated gates and Adam explicitly expands scope.

The visible goal is a coherent tabletop diorama: restrained adult silhouettes, readable polygonal
planes, deliberate material separation, limited realm palettes, and enough grit to avoid toy-like
plastic. Low poly describes construction and shape hierarchy; it does not mean crude, cute, or empty.

## Non-negotiable preservation contract

For every replacement, preserve:

- registry slug and semantic name;
- realm, kind, role, CR, type, and true scale;
- state-family identity and mechanical state names;
- source table and Walk references;
- footprint, ground/contact anchor, hinge, socket, and mount metadata where applicable;
- old runtime asset as a fallback until the replacement is admitted.

The migration may improve a silhouette or pose. It may not silently change what a roll means.

## Three source contracts

### A. Creature, NPC, and PC standees

The final runtime citizen is a lit standee, so the source image may use a controlled orthographic
front three-quarter figurine pose. Its facets are visible in the generated figurine art. Use mature
proportions, one signature silhouette idea, a neutral-ready stance, full-body framing, and a shared
ground line. Avoid lens perspective, top-down views, scenery, cast shadows, and inconsistent view
identity. Generate one identity family per call; a `1x4` strip may contain front, back, neutral-ready,
and one mechanically meaningful pose when all four preserve anatomy and equipment exactly.

### B. Shallow-extruded props

The source is construction input, not the final render. It must be a strict orthographic front
elevation with no visible top, side, underside, foreshortening, painted thickness, cast shadow, or
baked directional facet lighting. Generate exactly one prop per call. Real constrained triangulation,
relief offsets, bevels, side-shell materials, theater lights, and shadows create the low-poly read.
See `docs/EXTRUDED-SPRITE-PROP-LIBRARY.md`.

### C. Decals, FX, and crossed-card foliage

These remain purpose-built planes. Decals are top/front projections with no object volume. FX may use
true alpha and layered motion. Foliage cards may depict faceted clusters, but trunk, mount, collision,
and major branch volume belong to procedural geometry. Never route these through prop extrusion just
because a PNG exists.

## Versioned registry seam

Extend generated registry records from file-presence status to explicit art admission metadata:

```js
{
  slug: "spr-gloom-example",
  legacyAsset: "assets/sprites/spr-gloom-example.png",
  candidateAsset: "assets/sprites-v4/spr-gloom-example.png",
  artStyleVersion: "faceted-v4",
  sourceProjection: "ORTHO_THREE_QUARTER",
  generationRecipe: "figurine-v4.1",
  sourceSha256: "...",
  alphaSha256: "...",
  qaStatus: "pending|technical-pass|visual-pass|in-game-pass|rejected",
  runtimeAdmitted: false,
  rejectionReasons: []
}
```

Do not infer visual acceptance from file existence. The renderer resolves admitted candidate, then
legacy sprite, then the existing whole-object/cuboid fallback chain. A failed replacement therefore
cannot erase a functioning encounter citizen.

## Migration order

1. Lock one adult humanoid, one quadruped, one monster, one boss, and one wall-mounted prop anchor.
2. Prove chroma removal, edge dilation, foot/contact inference, true scale, and dark-room readability.
3. Regenerate the highest-frequency Fantasy encounter citizens first.
4. Complete state families together: doors, levers, portals, chests, and fires cannot mix styles.
5. Replace visually dominant PCs, bosses, large creatures, practical lights, and centerpieces.
6. Fill common mooks and environmental families by measured runtime frequency.
7. Expand creature/NPC migration beyond Fantasy only after the Fantasy style and QA pipeline survives
   integrated battle captures and Adam explicitly approves the next realm. Prop extrusion remains
   Fantasy-only during this pilot even though Gloom and Chrome remain future core candidates.

## Automated production loop

```text
registry census + runtime frequency
-> priority queue
-> one identity/asset generation call
-> deterministic slice and chroma removal
-> edge despill and RGB dilation
-> content bounds, anchor, scale, and component analysis
-> canonical isolated renders
-> independent visual judge
-> integrated theater matrix
-> admission record or typed rejection
-> legacy fallback retained
```

The generator and judge must be separate roles. The judge receives the render, contract, and target
anchor, but not the generator's confidence or hoped-for verdict.

## Gates

Reject a candidate for any of the following:

- childlike, chibi, glossy toy, or poster-illustration read;
- perspective drift, inconsistent camera, mismatched front/back identity, or cropped extremities;
- background contamination, fringe, detached debris, ambiguous ground support, or square shadow;
- unreadable silhouette at gameplay scale or facets reduced to arbitrary visual noise;
- incorrect semantic size, equipment, state, mount, footprint, or gameplay obstruction;
- feet floating/sinking, standee vanishing edge-on, alpha sorting artifacts, or implausible shadow;
- failure under bright/dark realm lighting, camera yaw, occlusion, and crowded encounter conditions.

`technical-pass` is never sufficient for runtime use. Admission requires `in-game-pass`.

## Tranche accounting

Run `python3 dev/model-foundry/gen_sprite_migration_census.py` to regenerate the machine-readable
census and summary. Track generation attempts, accepted assets, typed rejection reasons, and model
cost per admitted citizen. Never report a generated or sliced count as a visual completion count.
