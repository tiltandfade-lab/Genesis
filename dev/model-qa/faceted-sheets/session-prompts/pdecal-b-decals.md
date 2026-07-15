You are a decal-generation worker for the Genesis art program. Your batch: PARALLEL
SET B of the 9 shared decal families — same naturalistic (non-triangulated) contract as set A,
with one additional HARD RULE: **no circular footprints.** Set A rendered every family as a
centered round blob; set B exists to break that. Every mark in this batch must have a clearly
NON-CIRCULAR, directional or edge-following silhouette as described per asset. If a render
comes back round, radial, ring-shaped, or centered-symmetric, it is an automatic reject.

Rules:
1. For each asset IN ORDER: submit the DECAL CONTRACT below + the ANTI-CIRCULAR RULE + that
   asset's subject line, exactly as printed.
2. Create a fresh directory dev/model-qa/faceted-sheets/pdecalb-returns/ before the first call
   (STOP and report if it already contains files). Save each result IMMEDIATELY as
   pdecalb-returns/raw-decals/shared-<family>-decal-b-candidate-001.png.
3. After each save, RE-OPEN the file and verify: uniform #FF00FF background to the corners,
   mark fully inside the frame with margin, NO faceting/triangulation, and the silhouette is
   clearly non-circular (elongated, directional, edge-hugging, or angular per its subject).
   Round/radial → re-roll once, then mark FAILED. Never substitute.
4. Append one JSON row per call to pdecalb-returns/provenance/pdecalb-generation-calls.json:
   {"file": "...", "callId": "...", "family": "..."} — at save time.
5. No git commands. 6. Final report must match the directory exactly; overclaiming = fabrication.

=== DECAL CONTRACT (use in every call, verbatim) ===


> Render a single game decal source master: one naturalistic surface mark, centered on a
> perfectly flat solid magenta #FF00FF chroma-key background, square 1024x1024 canvas,
> strict TOP-DOWN plan projection (camera axis perpendicular to the ground surface), zero
> perspective, the mark fully inside the frame with generous margin on all sides.
>
> This is NOT a faceted asset. No triangulation, no polygonal planes, no low-poly geometry
> of any kind. The mark is a naturalistic organic surface stain: matte, with irregular
> natural edges and realistic spread behavior for its material. Adult horror register,
> muted desaturated palette — earth, bone, ash, rust, and shadow tones only; never bright
> or saturated. Believable physical behavior: liquids pool and trail with gravity and
> surface tension, growth creeps from crevices, burns feather outward, cracks propagate
> along stress lines.
>
> Render the mark alone on the ground plane it stains — but paint ONLY the mark itself:
> no underlying floor texture, no tiles, no stone pattern, no scene, no objects, no cast
> shadow, no lighting gradient, no text, no border, no watermark. The mark's own opacity
> and density variation carries all the detail; the runtime composites it onto surfaces.
>
> Avoid: faceting, triangulation, polygon planes, crystal or glass look, cartoon splat
> shapes, symmetric or stamped-looking marks, hard vector edges, glow, bloom, saturation,
> gloss, painterly brushstroke texture, any visible floor or surface material.


=== ANTI-CIRCULAR RULE (append to every call, verbatim) ===

> The mark's overall footprint must NOT be circular, oval-centered, radial, or symmetric.
> Compose it as a directional or edge-following event: elongated, streaked, fanned, cornered,
> or path-like, with a clear long axis or anchoring edge. Off-center composition is required —
> the mark's origin or anchor sits toward one side of the frame, and the mark travels or
> spreads away from it.

=== ASSETS, IN ORDER ===

--- ASSET shared-blood-decal-b ---

Subject: a directional blood event — a drag smear with a body-width trailing streak, or an arterial cast-off arc; long axis at least 3x the short axis, clearly directional, asymmetric, with flung satellite droplets along the travel line.

--- ASSET shared-water-decal-b ---

Subject: water that followed an edge — a runnel tracing along a wall line with seep spread to one side, or an elongated spill flowing downslope; strongly asymmetric, never a round puddle.

--- ASSET shared-grime-decal-b ---

Subject: a grime band — the dark accumulation line where floor meets wall, hugging one straight edge of the frame's implied geometry, dense at the seam and feathering inward; a linear strip, not a patch.

--- ASSET shared-wear-decal-b ---

Subject: a worn traffic path — a linear walking lane of erosion crossing the frame, direction-of-travel scuffing, denser at the center line; a corridor strip, never a spot.

--- ASSET shared-scorch-decal-b ---

Subject: a directional blast fan — scorch thrown from an off-center origin, fanning outward in one dominant direction like a flame jet hit the surface at an angle; hard char on the origin side, long feathered throw.

--- ASSET shared-crack-decal-b ---

Subject: a linear crack run — cracking that propagates across the frame from one edge toward another along a dominant stress line, with short side-branches; a traveling fracture, not a radial impact star.

--- ASSET shared-rust-decal-b ---

Subject: a rust streak run — oxidation bleeding DOWNWARD from a fixture point in long gravity streaks, stacked parallel runs of different lengths; strongly vertical, never a ring or halo.

--- ASSET shared-moss-decal-b ---

Subject: moss in a corner seam — growth wedged into an L-shaped crevice line, hugging two meeting edges and creeping unevenly outward from the seam; an angular colony, not a round tuft.

--- ASSET shared-cobweb-decal-b ---

Subject: a corner-anchored web — cobweb spanning a right-angle corner, triangular between its anchor strands, sagging with dust; explicitly angular geometry, torn on one side.

