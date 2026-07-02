---
type: asset-session
status: ready — the copy-paste sheet for Adam's next ChatGPT image session (the §II.0a probe + the Blockwright north star). ~15 minutes total. Follows the ASSET-PROMPTS.md session pattern (generate → save raws to ui-sketches/ → Claude keys/trims/wires).
created: 2026-07-01
related:
  - "[[STYLE-PROBES]]"
  - "[[BLOCKWRIGHT]]"
  - "[[ASSET-PROMPTS]]"
---

# Probe Prompts — one short ChatGPT session settles the style gate

**Session rules (same as the batch-1 art session):** square/wide as noted · save every raw to
`ui-sketches/ivalice-style/probe-<date>/` untouched · no in-app wiring happens until the probe
verdict; these are DECISION artifacts. Generate 2 candidates per prompt max — this is a taste
test, not a library.

## P1 — Title hero (the hybrid's front door) · wide 16:9

> Low-poly PS1-era tactical-RPG diorama, screenshot style: a lone hooded traveler standing at a
> campfire on a small floating island of chunky angular terrain, night sky, a faint web of
> glowing points and lines (a node-graph constellation) above the horizon. STRICT low-poly:
> visible faceted triangles, flat shading, NO textures, NO outlines, muted painterly palette
> (deep blues, ember orange accent). Empty dark space at the top center for a logotype.
> No text, no UI, no characters' faces.

## P2 — Location vignette (sits inside the engraved door-arch frame) · portrait 3:4

> Low-poly flat-shaded diorama vignette of a small fantasy river-town at dusk seen from a road
> above: chunky geometric houses, angular water plane, tiny warm window lights. PS1
> tactics-game aesthetic — faceted triangles, NO textures, NO outlines, 4-color restrained
> palette. Composed to read inside an arched frame: strong central subject, dark simple
> corners. No text, no people.

## P3 — The Blockwright north star (REFERENCE ONLY — never shipped) · wide 16:9

> An isometric tactical combat diorama made ENTIRELY of plain untextured boxes, like painted
> wooden blocks: a 4×3 grid of flat square floor tiles, two or three tiles raised as ledges, a
> cluster of grey box-boulders, one stack of green boxes as a tree, a shallow translucent fog
> cube. Five small figures assembled from 3–6 cuboids each (one blue biped, one brown
> quadruped, three grey bipeds of different sizes). EXACTLY three brightness levels per box:
> light top, medium front, dark side. Flat colors only — NO textures, NO gradients, NO
> outlines, NO shadows on the ground, plain dark backdrop. Clean, toy-like, geometric.

## The verdict protocol (STYLE-PROBES §2, unchanged)

Composite P1/P2 over screenshots of the current UI (Claude does this part) · judge each screen
A/B against the wired incumbent: does the low-poly scene art make the engraved chrome look
RICHER (jewel-box) or MISMATCHED (two games)? · Either answer OPENS the gate. P3 is graded
separately and only on: "is THIS the diorama Blockwright should converge on?" — notes on it
tune `BW_TYPE_COLORS`/shade ratios, nothing else.

## Explicitly NOT this session

UI mockups (that's the Claude-Design lane, and the new panels are spec-locked) · any asset
batch beyond these 3 prompts (§II.0a: no investment past the probe until the verdict) · tarot
art (RWS is public domain — curation, not generation).
