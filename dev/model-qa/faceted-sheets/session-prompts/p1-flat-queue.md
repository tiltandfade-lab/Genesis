You are a prop-generation worker for the Genesis faceted art program. Your batch:
P1 — the 32-asset flat-prop regeneration queue (fantasy), prompts verbatim from flat-prop-regeneration-queue.json. Everything you need is pasted below — this prompt is the complete, authoritative
source. You have image generation; use it for every asset. ONE ASSET PER CALL — never
batch multiple subjects into one image.

Rules:
1. For each asset IN ORDER: submit its full prompt text exactly as printed (VERBATIM LAW —
   do not reword, trim, or summarize). Fill nothing in; each prompt is complete.
2. Create a fresh directory dev/model-qa/faceted-sheets/p1props-returns/ before the first
   call (STOP and report if it already contains files). Save each result IMMEDIATELY as
   p1props-returns/raw-props/<asset-id>-candidate-001.png using the asset id printed above
   its prompt.
3. After each save, RE-OPEN the file and verify: single centered object, uniform #FF00FF
   background to the corners, nothing touching the image edge, flat front elevation (no
   perspective), mature faceted register (no cute/toy proportions). Fail → re-roll once,
   then mark FAILED. Never substitute or rename to fill a slot.
4. Append one JSON row per call to p1props-returns/provenance/p1props-generation-calls.json:
   {"file": "...", "callId": "...", "assetId": "..."} — at save time.
5. No git commands. Files + provenance are the whole deliverable.
6. Final report must match the directory exactly: attempted, saved, FAILED (with reasons),
   full filename list. Overclaiming is treated as fabrication.

=== ASSETS, IN ORDER ===

--- ASSET flat-001 (Book) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Book
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-002 (Case, Map or Scroll) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Case, Map or Scroll
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-003 (Hunting Trap) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Hunting Trap
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-004 (Map) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Map
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-005 (Shield) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Shield
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-006 (Spell Scroll (Cantrip)) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Spell Scroll (Cantrip)
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-007 (Spell Scroll (Level 1)) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Spell Scroll (Level 1)
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-008 (Animated Shield) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Animated Shield
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-009 (Arrow-Catching Shield) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Arrow-Catching Shield
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-010 (Luck Blade) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Luck Blade
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-011 (Sentinel Shield) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Sentinel Shield
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-012 (Shield of Missile Attraction) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Shield of Missile Attraction
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-013 (Shield of the Cavalier) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Shield of the Cavalier
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-014 (Shield, +1, +2, or +3) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Shield, +1, +2, or +3
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-015 (Spell Scroll) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Spell Scroll
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-016 (Spellguard Shield) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: Spellguard Shield
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-017 (door, shut state — banded oak plank door) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: door, shut state — banded oak plank door
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-018 (door, ajar state — banded oak plank door) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: door, ajar state — banded oak plank door
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-019 (door, open state — banded oak plank door) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: door, open state — banded oak plank door
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-020 (door, broken state — banded oak plank door) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: door, broken state — banded oak plank door
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-021 (lever, left state — in the realm's own material language) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: lever, left state — in the realm's own material language
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-022 (lever, right state — in the realm's own material language) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: lever, right state — in the realm's own material language
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-023 (trap, hidden state — in the realm's own material language) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: trap, hidden state — in the realm's own material language
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-024 (trap, sprung state — in the realm's own material language) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: trap, sprung state — in the realm's own material language
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-025 (ALT of 'door, shut state — banded oak plank door' — different shape/growth/wear, same kind) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: ALT of 'door, shut state — banded oak plank door' — different shape/growth/wear, same kind
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-026 (ALT of 'door, ajar state — banded oak plank door' — different shape/growth/wear, same kind) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: ALT of 'door, ajar state — banded oak plank door' — different shape/growth/wear, same kind
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-027 (ALT of 'door, open state — banded oak plank door' — different shape/growth/wear, same kind) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: ALT of 'door, open state — banded oak plank door' — different shape/growth/wear, same kind
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-028 (ALT of 'door, broken state — banded oak plank door' — different shape/growth/wear, same kind) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: ALT of 'door, broken state — banded oak plank door' — different shape/growth/wear, same kind
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-029 (fantasy painting 1) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: fantasy painting 1
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-030 (fantasy painting 2) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: fantasy painting 2
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-031 (fantasy painting 3) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: fantasy painting 3
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET flat-032 (fantasy painting 4) ---

Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: fantasy painting 4
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

