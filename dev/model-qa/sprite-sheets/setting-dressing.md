---
type: scratch
status: experimental
created: 2026-07-09
realm: cross-realm (setting dressing, place-gen lane)
---

# Sprite Batch Prompts — Setting Dressing (Part 2, PLACE-ASSET-QUEUE)

**Not canon** (see `sprite-sheet-prompts.md`'s shared template/discipline — same mechanical
grammar as the realm creature/item sheets, adapted below for flat/pictorial content). This file
translates Part 2 of `docs/PLACE-ASSET-QUEUE.md` — signs, banners/flags, paintings/posters/
notices, window glows, graffiti tags, and FX sprites — into batch prompts, one sheet per the
queue's own **Sheet plan** groupings. Names, realm tags, size classes, priorities, and briefs are
pulled verbatim from that table; this file does not invent entries beyond it.

Per SPRITE-TRANSITION: the 3D engine owns architectural/organic-solid content; flat/pictorial
content is a sprite's job, billboarded on the PS1 stage. Size classes (relative to the base-disc
convention, PLACE-ASSET-QUEUE Part 2 preamble): `small` = sign/notice scale, `medium` = banner/
poster scale, `large` = hanging-shingle/mural scale, `fx` = animated-feel overlay sprite, larger
and often semi-transparent.

**Style block (shared across all sheets in this file — replaces the creature sheets'
"mid-action pose" language per the queue's own sheet-plan note):** Flat graphic asset, front-on,
no perspective foreshortening — this is signage/print/overlay content, not a posed figure.
Pixel-art rendering (visible pixel grid, retro game-sprite look, NOT smooth painterly
illustration), soft grain/dither texture consistent with the realm's creature sheets. Solid
magenta (#FF00FF) background, no transparency baked in, no other background elements — magenta
is the keyed-out color. Readable as a small billboard element at table scale: bold silhouette,
one focal readable icon/detail, no fine text (illiteracy-safe convention — lettering is always a
squiggle-suggestion, never legible words, per the existing table-driven-naming discipline).

**Shared mechanical instructions:** one distinct static asset per cell (not a repeat, not an
animation frame), consistent relative scale *within* a size-class tier (a small notice stays
small in its cell, a large hanging shingle spans more of its cell) — sprites are non-uniform by
size class, unlike the creature sheets' single uniform scale. Every cell notes its size class,
priority, and (per the queue's Part 2 preamble) either its **mounting** (hanging / wall / pole —
for signs, banners, paintings, posters, notices, window glows, graffiti) or its **additive/
translucent intent** (for FX sprites — these composite over other art, so opacity/blend intent is
part of the spec, not the render).

---

## `signs-frontier` (12 cells)

Dresses the Frontier realm's authored places — the realm this queue's first wave targets
alongside Chrome and Gloom (PLACE-ASSET-QUEUE §"First wave").

1. **Hanging shingle — mug icon** [large, P1] — Mounting: hanging, bracket off a wall/post. Weathered wood-plank sign on a bracket, one carved/painted mug icon (Watering-hole trade mark) — no text (illiteracy-safe).
2. **Hanging shingle — hammer icon** [large, P1] — Mounting: hanging, bracket off a wall/post. Weathered wood-plank sign, one carved/painted hammer icon (Workshop trade mark) — no text.
3. **Hanging shingle — boot icon** [large, P1] — Mounting: hanging, bracket off a wall/post. Weathered wood-plank sign, one carved/painted boot icon (Market-stall trade mark) — no text.
4. **Hanging shingle — sack/grain icon** [large, P1] — Mounting: hanging, bracket off a wall/post. Weathered wood-plank sign, one carved/painted grain-sack icon (Market-stall trade mark, second variant) — no text.
5. **Painted board — general-store register, variant A** [large, P2] — Mounting: wall-mounted, flush plank. Whitewashed plank with hand-painted lettering-suggestion (squiggle-text, never real words) — the "General Store" register without literal text. Gathering-place use.
6. **Painted board — general-store register, variant B** [large, P2] — Mounting: wall-mounted, flush plank. Same whitewashed-plank language, a second squiggle-lettering layout for repeat-use variety.
7. **Painted board — seat-of-power notice register** [large, P2] — Mounting: wall-mounted, flush plank. Whitewashed plank, more formal squiggle-lettering block (civic register, not shopfront) — Seat-of-power use.
8. **Wanted poster** [small, P1] — Mounting: wall/post, tacked or nailed flat. Torn-edge paper, a rough painted-portrait sketch, no legible text — the fee/name are DM-narrated, never rendered. Hall-of-law, Gathering-place.
9. **Ancestor/ruler portrait — Frontier tint (oil-paint)** [medium, P2] — Mounting: wall, framed. Formal painted bust-portrait in a plain wood frame, oil-paint medium per the realm-appropriate tint note (frontier = oil-paint, vs. Chrome's holo-frame / Cosmic's fresco). Seat-of-power use.
10. **Warm lamplit window, variant A** [medium, P1] — Mounting: overlay onto a building-facade prop — does not stand alone. Rectangular soft-amber glow with a curtain-silhouette suggestion; Dwelling/Watering-hole exterior read.
11. **Warm lamplit window, variant B** [medium, P1] — Mounting: overlay onto a building-facade prop — does not stand alone. Same warm-glow language, a second curtain-silhouette layout for repeat-use variety along a street run.
12. **Fog wisp (ground-hugging)** [fx, P1] — Additive: translucent, low horizontal fog bank, sits at ground level in front of/behind figures — layers as a foreground/midground overlay, not a full-screen effect. Cross-realm-eligible (also serves Ash, Lost-World, Gloom barrens); included here for Frontier's Ruin/Boneyard-adjacent dressing.

---

## `signs-chrome` (14 cells)

Chrome realm — turf grammar, neon signage, corp branding.

1. **Neon marquee — lit, kanji-adjacent glyph** [large, P1] — Mounting: wall, mounted shopfront fixture. Buzzing tube-neon shop sign, one kanji-adjacent glyph or icon, full-brightness state. Watering-hole (noodle-bar), Vice-den.
2. **Neon marquee — half-dead tubes** [large, P1] — Mounting: wall, mounted shopfront fixture. Same buzzing tube-neon sign, half the tubes visibly dead/dark — the base "half flickered dead" read as a static state.
3. **Neon marquee — icon variant (mug/blade/other trade glyph)** [large, P1] — Mounting: wall, mounted shopfront fixture. Third neon-marquee glyph variant for shopfront-row repeat-use variety, full-brightness state.
4. **Corp branding placard** [medium, P2] — Mounting: wall, tower-lobby fixture. Backlit acrylic panel, corporate-clean, one logo-mark. Seat-of-power (tower lobby).
5. **Corp recruitment ad** [small, P1] — Mounting: wall, backlit panel (subway/Gathering-place). Glossy backlit panel, an idealized painted face, a slogan-suggestion squiggle — no legible text. Gathering-place, subway platform.
6. **Faction/turf banner — color family A** [large, P1] — Mounting: hanging, tied to a fence/rail. Spray-tagged cloth strip, gang-color field A, one crude icon.
7. **Faction/turf banner — color family B** [large, P1] — Mounting: hanging, tied to a fence/rail. Same spray-tagged cloth strip, gang-color field B, a different crude icon — turf-grammar variant.
8. **Faction/turf banner — color family C** [large, P1] — Mounting: hanging, tied to a fence/rail. Third gang-color field, third crude icon — rounds out the district-turf palette set.
9. **Turf claim tag — palette variant 1** [medium, P1] — Mounting: wall/fence surface overlay. Spray-paint glyph/tag, gang-color family 1 — needs 4-6 palette variants so rival turf reads as visually distinct without new geometry (this sheet carries the first 4).
10. **Turf claim tag — palette variant 2** [medium, P1] — Mounting: wall/fence surface overlay. Same tag glyph, gang-color family 2.
11. **Turf claim tag — palette variant 3** [medium, P1] — Mounting: wall/fence surface overlay. Same tag glyph, gang-color family 3.
12. **Turf claim tag — palette variant 4** [medium, P1] — Mounting: wall/fence surface overlay. Same tag glyph, gang-color family 4.
13. **Crossed-out rival tag** [medium, P2] — Mounting: wall/fence surface overlay, layered atop a claim-tag cell. The claim-tag variant with a spray-slash through it — the "this just changed hands" trace overlay (TABLETOP-VISION §5 trace lane).
14. **Steam vent puff** [fx, P1] — Additive: translucent, soft semi-transparent billowing puff, loops as a static "mid-puff" frame (no animation per the museum-restraint law — a still billboard, not a particle system). Works subway platform, standpipe.

---

## `signs-gloom` (13 cells)

Gloom realm — the town that made a deal; realty-sign wrongness tell, missing-child flyer (the
single most tonally load-bearing sprite in this queue, understated per the tone doctrine).

*(The queue's own sheet-plan line lists 11 named items and totals them as "12 cells" but the
window-glow "2 each" clause alone is 4 cells, not 2 — see Deviations. This sheet builds every
named item at its stated count: 13 cells, not 12.)*

1. **Realty sign (For Sale / Managed By)** [medium, P1] — Mounting: pole, yard-sign silhouette. Suburban yard-sign silhouette, the mundane-wrong tell — same sign on every building in town. Seat-of-power ("the realty office that owns the town").
2. **Missing-child flyer** [small, P1] — Mounting: wall/post, stapled flat. Photocopy-grain flyer stapled to a post, a school-photo-style face, curling at the edges — understated per the tone doctrine, never played for shock. Gathering-place, Commons.
3. **Painted board — suburb variant** [large, P2] — Mounting: wall-mounted, flush plank. Whitewashed plank, squiggle-lettering suggestion, suburb-register layout (distinct hand from the Frontier general-store variant).
4. **Warm lamplit window, variant A** [medium, P1] — Mounting: overlay onto a building-facade prop — does not stand alone. Rectangular soft-amber glow with a curtain-silhouette suggestion; Dwelling exterior read.
5. **Warm lamplit window, variant B** [medium, P1] — Mounting: overlay onto a building-facade prop — does not stand alone. Second curtain-silhouette layout, repeat-use variety.
6. **Flickering/dead window, variant A** [medium, P2] — Mounting: overlay onto a building-facade prop — does not stand alone. Irregular strobing glow, mid-flicker state — the single-house-wrong tell among lit ones. Dwelling, Hideout.
7. **Flickering/dead window, variant B** [medium, P2] — Mounting: overlay onto a building-facade prop — does not stand alone. Fully dark pane variant (companion state to the strobing one, same tell).
8. **Fog wisp (ground-hugging)** [fx, P1] — Additive: translucent, low horizontal fog bank at ground level, in front of/behind figures. Gloom-barrens use (shared build with `fx-cross-realm`; see that sheet — don't re-render, reuse).
9. **Candle/torch glow halo** [fx, P2] — Additive: translucent, soft radial warm-glow halo, layered behind an existing torch/candelabra prop — sells "lit" without a real light-emitter pass. Shrine, Boneyard (grave-torch).
10. **Steam vent puff — standpipe variant** [fx, P1] — Additive: translucent, soft billowing puff, static "mid-puff" frame. Standpipe use (shared build with `signs-chrome`'s steam-puff cell — same asset, different placement context).
11. **Court notice / decree board** [small, P2] — Mounting: pinned under a small awning, post-mounted. Pinned parchment/paper stack under a small awning, official-seal blob (no text). Hall-of-law reuse across realms.
12. **Rain streak overlay** [fx, P3] — Additive: translucent, diagonal streak-pattern, screen-space-feeling but billboarded at table depth per the existing overlay-lane convention. Gloom mood-variant use (shared build with `fx-cross-realm`).
13. **Ancestor/ruler portrait — Gloom tint (family-photo variant)** [medium, P2] — Mounting: wall, framed. Formal painted bust-portrait reframed as a Gloom "family photo" — same bust-portrait grammar, faded-photograph medium instead of oil/holo/fresco. Seat-of-power use.

---

## `fx-cross-realm` (8 cells)

FX sprites flagged "all"/cross-realm in the Part 2 table, built once and reused via tint across
realms — dedupe hard, one sheet instead of one per realm. `signs-chrome` and `signs-gloom` above
reference this sheet's steam-puff, fog-wisp, candle-glow, and rain-streak base assets rather than
re-rendering them; this sheet is their canonical build.

1. **Chimney/hearth smoke, warm-tint base** [fx, P2] — Additive: translucent, thin rising smoke wisp off a chimney/hearth point. Base tint for realms rendering their own hearths (Workshop forge, Dwelling) — "all" per the queue table.
2. **Chimney/hearth smoke, cool-tint variant** [fx, P2] — Additive: translucent, same rising-wisp read, a cooler grey-tint palette variant for realms wanting a less-warm hearth read.
3. **Steam vent puff, base build** [fx, P1] — Additive: translucent, soft semi-transparent billowing puff, static "mid-puff" frame — canonical build referenced by `signs-chrome` (subway platform, standpipe) and `signs-gloom` (standpipe).
4. **Neon flicker overlay** [fx, P3] — Additive: translucent, a dimmer/off variant of the neon-marquee sprite, swapped in on a slow timer — the "half the tubes are dead" read done as a texture swap, not a shader. Chrome signs (paired sprite state).
5. **Fog wisp, base build** [fx, P1] — Additive: translucent, low horizontal fog bank, ground level, in front of/behind figures — canonical build referenced by `signs-frontier`, `signs-gloom`. Ruin, Boneyard, Gloom barrens; also serves Ash, Lost-World.
6. **Fog wisp, thin palette variant** [fx, P1] — Additive: translucent, thinner/patchier density variant of the base fog-wisp, for lighter ground cover.
7. **Candle/torch glow halo, base build** [fx, P2] — Additive: translucent, soft radial warm-glow halo layered behind a torch/candelabra prop — canonical build referenced by `signs-gloom`. Shrine, Boneyard (grave-torch); "all" per the queue table.
8. **Rain streak overlay, base build** [fx, P3] — Additive: translucent, diagonal streak-pattern, screen-space-feeling, billboarded at table depth — canonical build referenced by `signs-gloom`. High-Seas, Gloom (mood variant).

---

## Deferred (per the queue's own sheet-plan note)

The remaining 8 backfill realms (Ash, Suburb, Noir, High-Seas, Lost-World, Cosmic,
Bright-Kingdom, Theater) get their sign/banner/portrait sheets authored alongside their
`Place Skin - <Realm>.md` craft pass — this file doesn't pre-author their content, matching the
queue's stated intent to avoid the breadth trap the spine itself was scoped to avoid. The lone
P2/P3 Part 2 entries not yet placed on a sheet above (**house/temple pennant** — Frontier,
Cosmic, medium, P2; **nautical signal flag string** — High-Seas, medium, P3; **corp branding
placard already covered above**) land with those backfill realms' skin passes, per the same note.

## Deviations

- **Paintings/posters/notices section total mismatch:** PLACE-ASSET-QUEUE's Part 3 count table
  states "Part 2 paintings/posters/notices | 2 | 2 | 0 | 4" but the section itself lists 5 entries
  (Wanted poster P1, Corp recruitment ad P1, Missing-child flyer P1, Ancestor/ruler portrait P2,
  Court notice/decree board P2 = 3 P1 + 2 P2 = 5). This is a pre-existing arithmetic discrepancy
  in the source document (Grand total 43 likely undercounts by 1 for the same reason) — not
  introduced here. All 5 entries are translated above; the count table itself was not corrected
  (out of scope for a translation pass — flagging per CLAUDE.md's "validators preserve the
  thing's job" discipline: don't silently paper over a source error).
- **`signs-gloom` cell count:** the sheet-plan line's parenthetical arithmetic ("window-glow
  warm/flickering (2 each)" = 4 cells, not the 2 the surrounding "12 cells" total implies) yields
  13 cells when every named item is built once. Built at 13, not forced down to 12 — see the note
  atop that sheet.
- Everything else follows the queue's Part 2 table and sheet-plan groupings verbatim; no entries
  beyond Part 2 were added.
