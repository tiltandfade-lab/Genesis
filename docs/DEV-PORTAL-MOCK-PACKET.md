---
type: mock-gen-packet
project: Genesis
status: READY — Adam pastes this into a Codex window; mocks come back as reference frames
created: 2026-07-17 (night)
law: MOCKS PROPOSE, LAWS DISPOSE (the standing MOCK-GEN rule) — returned mocks are reference
  only; the portal build follows docs/DEV-PORTAL.md and the repo's laws, taking from the mocks
  whatever earns its place.
---

# DEV-PORTAL MOCK PACKET — for Adam's Codex window

Copy everything below the line into Codex. Ask it to render each frame as a wide 16:10 PNG
UI mockup. **Generate 2–3 distinct concepts per frame** (more if a frame sparks); label every
return `portal-mock-<frame##>-<concept-letter>.png`.

---

## The product you are mocking

**The Genesis Dev Portal** — the internal editor suite for a solo-RPG video game built by one
person. The only user is the game's art director. One home page links every editor. Every
editor shows a LIVE 3D engine viewport (the current proving scene is a clay-grey 5×5 dungeon
room built from Kenney kit modules, viewed from a fixed 28° camera) with a control rail beside
it, and every editor ends in one primary action: **SAVE / LOCK IN** — which freezes the current
numbers as project law.

**Aesthetic brief:** a serious game-dev tool, not a game menu. Think the restraint of Blender's
inspector crossed with a clean web dashboard: dark UI, high-contrast numerals, generous
viewport, controls that read at a glance. The game's dark-fantasy identity may whisper in
accents (parchment tones, a rune, an ember highlight) but never costume the tool. Desktop only.
Precision is the personality: every slider shows its exact number; every object shows its
anchor; the SAVE button states what it will lock.

## The frames

1. **Portal Home** — a launcher page: cards for each editor (Object Workbench, Sprite Editor,
   Lighting Lab, Extrusion Lab, Decal Lab, Time-of-Day, Shot Tuner, Provenance Inspector), a
   fixture picker (Clay Room / The Ivory Pit / saved worlds), and a "recent locks" feed showing
   the last saved constants with timestamps.
2. **Object-Alignment Workbench** — the clay room viewport with a door leaf selected and
   glowing; a rail showing anchor-relative controls (depth in wall, side lap, height, sill),
   live numeric readouts, arrow-key hint, a doorway-dolly toggle, and SAVE LOCK. Show a
   "request list" drawer of objects queued for tweaking.
3. **Lighting Lab** — a fixture room; a list of light objects (torch, sconce, brazier); per-light
   sliders (intensity, color, range, height, falloff) with light-cone gizmos in the viewport;
   a before/after split toggle.
4. **Sprite Editor** — a sprite sheet grid; one sprite enlarged with a floor-line overlay and
   feet-height ruler; horizontal/vertical alignment nudges; legacy-vs-new compare toggle.
5. **Extrusion Lab** — the money frame: a flat pixel-art sprite on the left, its extruded
   3D piece on the right catching directional light on beveled sides; sliders for thickness,
   bevel width/angle, contour smoothing, side-shell tone, back-face mode (mirrored/authored);
   a yaw dial to preview composed angles; SAVE RECIPE.
6. **Decal Lab** — a stone floor plane scattered with decals (blood splat, eldritch circle,
   moss); per-noun size-band dials (min–max feet), free-rotation and overlap toggles; a
   "roll preview" button that re-scatters at rolled sizes.
7. **Time-of-Day Scrubber** — a timeline scrub bar across the bottom (dawn→noon→dusk→night),
   the sun/moon arc drawn above the room, a keyframe table drawer, the room re-lighting live.
8. **Shot Tuner** — the room viewport with framing-target overlays and occlusion-fade sliders;
   camera pitch shown LOCKED at 28° (a padlock on it).
9. **Provenance Inspector** — an object clicked in the viewport; a chain panel unrolls:
   walk fact → table roll → chosen sprite → extrusion recipe (with version) → anchor
   derivation. Read-only styling; each link jumps to its source.
10. **Wildcard: the shell** — your best overall concept for the portal's navigation frame
    (how the viewport, rail, fixture picker, and page nav cohere). Break any layout
    assumption from frames 1–9 if you have a stronger idea.

## Constraints the mocks must respect

- The engine viewport is the hero on every editor page; controls never crowd it.
- Exact numbers visible everywhere a value can change.
- One primary action per page: SAVE / LOCK IN.
- No mobile layouts, no marketing polish, no fake game HUD.
