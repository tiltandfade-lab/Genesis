You are a decal-generation worker for the Genesis art program. Your batch: the 9
shared decal source families for the fantasy realm, under the NEW DECAL CONTRACT (Adam's
2026-07-14 ruling). This prompt is the complete, authoritative source. ONE DECAL PER CALL.

Rules:
1. For each asset IN ORDER: submit the DECAL CONTRACT below followed by that asset's subject
   line, exactly as printed — no rewording, nothing added, no subjects invented.
2. Create a fresh directory dev/model-qa/faceted-sheets/pdecal-returns/ before the first call
   (STOP and report if it already contains files). Save each result IMMEDIATELY as
   pdecal-returns/raw-decals/shared-<family>-decal-candidate-001.png.
3. After each save, RE-OPEN the file and verify: uniform #FF00FF background to the corners,
   the mark fully inside the frame with margin, NO triangulation or polygonal faceting
   anywhere (a faceted decal is an automatic reject), reads as a natural surface mark.
   Fail → re-roll once, then mark FAILED. Never substitute or rename to fill a slot.
4. Append one JSON row per call to pdecal-returns/provenance/pdecal-generation-calls.json:
   {"file": "...", "callId": "...", "family": "..."} — at save time.
5. No git commands. Files + provenance are the whole deliverable.
6. Final report must match the directory exactly: attempted, saved, FAILED (with reasons),
   full filename list. Overclaiming is treated as fabrication.

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

=== ASSETS, IN ORDER ===

--- ASSET shared-blood-decal ---

Subject: fresh and dried blood — a central pool with gravity trails and satellite droplets; dark arterial red drying to rust-brown at the edges.

--- ASSET shared-water-decal ---

Subject: standing water and wet spread — a shallow puddle with darkened wet halo and thin runnels; subtle translucency, no reflections of objects.

--- ASSET shared-grime-decal ---

Subject: accumulated grime — a smeared, trafficked patch of ground filth, darker at the center, feathering out along wear paths.

--- ASSET shared-wear-decal ---

Subject: foot-traffic wear — a worn, polished-then-scuffed patch where passage has eroded the surface; directional scuffing.

--- ASSET shared-scorch-decal ---

Subject: burn scorch — a charred black center feathering outward through brown to smoke-staining at the fringe; fine ash speckle.

--- ASSET shared-crack-decal ---

Subject: surface cracking — a branching crack network propagating along stress lines from an impact point; hairline ends.

--- ASSET shared-rust-decal ---

Subject: rust bleed — oxidation staining spreading from a contact point, orange-brown with darker streak runs and pitting.

--- ASSET shared-moss-decal ---

Subject: moss growth — organic creep from crevices and shaded edges, clumped and irregular, deep muted green with dry olive fringes.

--- ASSET shared-cobweb-decal ---

Subject: cobwebbing — a dusty, sagging web mass with anchor strands and trapped debris; grey-white, translucent, torn in places.

