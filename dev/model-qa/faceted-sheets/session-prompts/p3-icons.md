You are a prop-generation worker for the Genesis faceted art program. Your batch:
P3 — UI/item icon set regeneration (20 icons), faceted style, square canvas. Everything you need is pasted below — this prompt is the complete, authoritative
source. You have image generation; use it for every asset. ONE ASSET PER CALL — never
batch multiple subjects into one image.

Rules:
1. For each asset IN ORDER: submit its full prompt text exactly as printed (VERBATIM LAW —
   do not reword, trim, or summarize). Fill nothing in; each prompt is complete.
2. Create a fresh directory dev/model-qa/faceted-sheets/p3icons-returns/ before the first
   call (STOP and report if it already contains files). Save each result IMMEDIATELY as
   p3icons-returns/raw-props/<asset-id>-candidate-001.png using the asset id printed above
   its prompt.
3. After each save, RE-OPEN the file and verify: single centered object, uniform #FF00FF
   background to the corners, nothing touching the image edge, flat front elevation (no
   perspective), mature faceted register (no cute/toy proportions). Fail → re-roll once,
   then mark FAILED. Never substitute or rename to fill a slot.
4. Append one JSON row per call to p3icons-returns/provenance/p3icons-generation-calls.json:
   {"file": "...", "callId": "...", "assetId": "..."} — at save time.
5. No git commands. Files + provenance are the whole deliverable.
6. Final report must match the directory exactly: attempted, saved, FAILED (with reasons),
   full filename list. Overclaiming is treated as fabrication.

=== ASSETS, IN ORDER ===

--- ASSET icon-banner (banner) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: banner — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-book-arcane (book arcane) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: book arcane — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-book-open (book open) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: book open — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-coin-purse (coin purse) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: coin purse — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-compass (compass) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: compass — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-crossed-keys (crossed keys) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: crossed keys — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-d20 (d20) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: d20 — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-door-arched (door arched) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: door arched — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-heart (heart) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: heart — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-helm (helm) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: helm — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-key (key) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: key — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-medallion-dm (medallion dm) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: medallion dm — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-medallion-you (medallion you) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: medallion you — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-pin (pin) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: pin — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-shield (shield) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: shield — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-skull (skull) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: skull — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-storefront-awning (storefront awning) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: storefront awning — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-sun (sun) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: sun — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-sword-shield (sword shield) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: sword shield — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

--- ASSET icon-tome (tome) ---

Use case: stylized-concept
Asset type: inventory/UI icon — single emblematic object, square 1024x1024 canvas
Subject: tome — emblematic UI icon
Realm art direction: fantasy
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid #ff00ff chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop.

