# ASSET-PROMPTS — the T1 image-generation shopping list

**type:** working-doc (asset pipeline) · **created:** 2026-07-01 · **for:** Adam's image-gen sessions
Deliverables for the remaining De-Claude visual work (DESIGN-GUIDE.md §III T1). Same pipeline that
produced the icon set: generate → magenta flat where noted → `ui-sketches/ivalice-style/assets-iso/`
slice scripts → `assets/`. Wire-up is code work I do after each batch lands.

## The style lock (prepend to every prompt)

> Ornate fantasy game-UI asset in the Ivalice style (Final Fantasy Tactics / FFXII menu art):
> engraved gold (#b58f3c–#c9a24b) on aged cream parchment (#efe6cf), deep tooled slate ground
> (#2c261d), sapphire and ruby gem accents, painterly texture with crisp edges, symmetrical,
> no modern elements, no lens flare, NO TEXT unless the prompt says otherwise.

## Batch 1 — the big visibility wins

1. **Engraved GENESIS title art** → `assets/title/genesis-wordmark.png`
   - ~2400×560, transparent background. The word **GENESIS** only.
   - Prompt: *…style lock… + "the single word GENESIS in massive engraved dimensional gold serif
     capitals (Trajan/Cinzel letterforms), beveled gilded faces with warm specular highlights and
     dark recesses, subtle hammered texture, letters only on a transparent background."*
   - Replaces the CSS-gradient `<h1>` on the title screen (the #1 remaining "AI touch").

2. **Scene-header plaque frame (9-slice)** → `assets/plaques/scene-banner.png`
   - ~1200×160, transparent bg, EMPTY center (text renders live over it).
   - Prompt: *…style lock… + "a long horizontal dark-slate banner plaque with an ornate engraved
     gold frame, pointed gem finials at the left and right ends (one sapphire, one ruby), empty
     center field, subtle brushed-stone texture inside the frame."*
   - Becomes the in-session scene header + the shop/panel headers (stretch the center slice).

3. **You / DM compass medallions (pair)** → `assets/icons/medallion-you.png`, `medallion-dm.png`
   - ~300×300 each on magenta flat (slice like the icon set).
   - Prompt: *…style lock… + "a small round engraved medallion token: [A] a bright compass-star
     with a sapphire center — the wayfarer's mark; [B] an eight-rayed dark sun with a ruby center —
     the storyteller's mark. Matched pair, same rim treatment."*
   - The feed's speaker marks (mockup: compass rosettes beside YOU/DM).

## Batch 2 — textures (generate at 2048², must TILE seamlessly)

4. **Parchment, seamless** → `assets/textures/parchment.jpg` — *"seamless tileable aged cream
   parchment texture, soft fiber mottling, NO tears, NO edge vignette, uniform lighting."*
5. **Dark tooled slate, seamless** → `assets/textures/stone.jpg` — *"seamless tileable dark
   charcoal-brown tooled stone, fine cracks, faint chisel marks, uniform lighting, no vignette."*
   (Current files are 336×468 mockup crops — serviceable, these are the real fix.)
6. **Blue tooled leather** → `assets/textures/leather-blue.jpg` — *"seamless deep night-blue
   leather with faint gold-tooled filigree, book-cover feel."* (Accent surface: modals, covers.)

## Batch 3 — icon-set gaps (magenta flat, 3–4 to a sheet, same rim/gem language as the 30)

7. **coin-purse** (shop/gold readouts) · **storefront-awning** (merchant/open_shop chip) ·
   **skull** (death saves / danger) · **door-arched** (building-interior entry, T3 noun handshake) ·
   **crossed-keys** (menu alternate, if the single key wears thin).
   - Prompt: *…style lock… + "engraved gold game icon of a [SUBJECT], carved-relief style with a
     single small gem accent, on a flat magenta (#FF00FF) background, centered, no shadow spill."*

## Batch 4 — battle theater advance-buys (T6 — generate whenever, wired later)

8. **Band-lane stage frame** — a wide shallow proscenium: dark stone floor strip with four subtle
   engraved lane divisions receding upward (Melee/Near/Far/Out), gold hairline separators.
   ~1600×500, transparent top. (The combat backdrop the tokens stand on.)
9. **Creature token ring (pair)** — engraved gold ring + a blood-rimmed hostile variant, ~300×300
   magenta flat, EMPTY center (creature glyph/initial renders inside).

## Handling notes

- Keep every source PNG in `ui-sketches/ivalice-style/` (git-kept sketch space); only sliced/final
  files enter `assets/`. Never overwrite a wired asset without keeping the old one until the swap
  commit lands.
- Textures: verify tiling by offsetting 50% in any editor before handing off.
- After each batch lands, say the word and I wire it (each wire-up is a small `feat/ui-*` branch
  with verifier + live-walk, same as the icon pass).
