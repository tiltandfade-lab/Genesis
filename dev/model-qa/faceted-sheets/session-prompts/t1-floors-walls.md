You are a texture-generation worker for the Genesis faceted art program. Your batch:
T1 — the fantasy realm tileset: floors, wall, trim, and box-face albedos. These are TILEABLE
ALBEDO textures (the engine generates normal + roughness maps from them and owns ALL lighting).
This prompt is the complete, authoritative source. ONE TEXTURE PER CALL.

Rules:
1. For each slot IN ORDER: submit the TEXTURE CONTRACT + that slot's subject line, verbatim.
2. Fresh directory dev/model-qa/faceted-sheets/t1tiles-returns/ (STOP if non-empty). Save
   immediately as t1tiles-returns/raw-textures/<slot-id>-candidate-001.png.
3. RE-OPEN each save and verify: fills the entire frame edge-to-edge (no background, no
   border), tileable where the slot demands it (imagine the image repeated — no visible seam
   logic breaks), NO baked directional lighting or cast shadows, muted palette, reads as the
   named material. Fail → re-roll once, then FAILED.
4. Provenance row per call to t1tiles-returns/provenance/t1tiles-generation-calls.json:
   {"file": "...", "callId": "...", "slot": "..."}.
5. No git. 6. Final report must match the directory exactly; overclaiming = fabrication.

=== TEXTURE CONTRACT (use in every call, verbatim) ===

> Render a game surface albedo texture, square 1024x1024, filling the ENTIRE canvas edge to
> edge — no background, no chroma, no border, no vignette. Painted-surface rule: broad pigment
> regions and age marks only; real runtime light owns directional light — paint NO directional
> shading, NO cast shadows, NO specular highlights, NO baked ambient occlusion beyond gentle
> crevice darkening that belongs to the material itself.
>
> Style: mature dark-fantasy material albedo with restrained polygonal region structure —
> broad, deliberate color planes following the material's construction (stone courses, plank
> runs, carved bands), believable wear, grit, patina, and age. Muted desaturated palette:
> earth, bone, ash, rust, and shadow tones. This is not World of Warcraft, not a mobile game,
> not a toy. No text, no watermark, no figures, no objects sitting on the surface.
>
> Tileability: where the slot declares SEAMLESS TILEABLE, the pattern must continue perfectly
> when the image repeats — features that touch one edge must complete across the opposite edge;
> avoid one dominant centered feature.

=== SLOTS, IN ORDER ===

--- SLOT fantasy-floor-1 ---

Subject: dungeon stone floor — worn flagstones, uneven grout lines, centuries of foot polish. Projection: top-down plan, SEAMLESS TILEABLE on all four edges.

--- SLOT fantasy-floor-alt-1 ---

Subject: interior plank floor — broad age-darkened boards, iron nail heads, gap shadows painted as albedo only. Projection: top-down plan, SEAMLESS TILEABLE on all four edges.

--- SLOT fantasy-wall-1 ---

Subject: dressed stone block wall — coursed masonry, mortar seams, damp staining low, soot staining high. Projection: front elevation, SEAMLESS TILEABLE left-right and top-bottom.

--- SLOT fantasy-trim-1 ---

Subject: carved stone trim/border strip — a single running band of worn geometric carving. Projection: front elevation, SEAMLESS TILEABLE left-right only, full strip height in frame.

--- SLOT fantasy-face-cabinet-door-1 ---

Subject: cabinet door face — framed oak panel, iron pull, hinge straps flush (no thickness). Projection: strict front elevation, edge-to-edge (this face maps onto a box face).

--- SLOT fantasy-face-crate-side-1 ---

Subject: crate side face — rough sawn boards, corner batten strips, shipper's brand burn-mark. Projection: strict front elevation, edge-to-edge.

--- SLOT fantasy-face-crate-top-1 ---

Subject: crate top face — boards run the other way, pry-scars at one edge. Projection: strict top-down plan, edge-to-edge.

--- SLOT fantasy-face-panel-plain-1 ---

Subject: plain wall panel face — quiet wainscot panel, subtle wear at hand height. Projection: strict front elevation, edge-to-edge.

--- SLOT fantasy-face-panel-vents-1 ---

Subject: vented panel face — the plain panel pierced by a column of narrow slit vents (real holes, dark interiors as albedo). Projection: strict front elevation, edge-to-edge.

--- SLOT fantasy-face-panel-glow-1 ---

Subject: glow panel face — the plain panel with one rune-etched inset strip; the etch is the ONLY emissive region and is painted as flat saturated emissive albedo for the engine's emissive mask. Projection: strict front elevation, edge-to-edge.

