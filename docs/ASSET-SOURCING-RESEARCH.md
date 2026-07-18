---
type: research
project: Genesis
created: 2026-07-16
related:
  - "[[OFFLINE-ART-FOUNDRY-RESEARCH]]"   # the 3D/Kenney donor-grammar audit — this doc is its sibling
  - "[[ART-DEPARTMENT]]"                 # pixel-sprite register (self-generated art is canon)
  - "[[KENNEY-MESH-AUDIT]]"
---

# Asset Sourcing Research — Icons, UI, Fonts, Supplemental 3D

**Scope:** free, license-safe assets in the categories Genesis has **not** yet sourced, matched to the
existing stack (16 Kenney CC0 GLB kits; PSX textures from AmbientCG / PolyHaven / ScreamingBrainStudios;
self-generated pixel-art sprite canon). Audio was explicitly out of scope for this pass.

**License bar (Adam, 2026-07-16):** CC0 preferred; **CC-BY / OGA-BY acceptable if attribution is tracked
in a CREDITS file.** Reject: CC-BY-ND (no modify), CC-NC (no commercial), and anything more restrictive.
Treat CC-BY-SA as usable only if the asset ships **unmodified**. See §6 for the full license reference.

**Method:** 5-angle web research, licenses verified on the actual source pages where possible. Claims
flagged where a page couldn't be directly fetched (search-verified only) — re-check those before shipping.

---

## 0. The shortlist (verified, license-safe, style-fit)

| Need | Pick | License | Why |
|---|---|---|---|
| Animated **monsters/creatures** (GLB) | **Quaternius** | **CC0** | 50+ fully-animated monsters, animals, dinosaurs; glTF export; retargetable Universal Animation Library. Fills Kenney's biggest gap. |
| Animated **humanoid PCs/NPCs** (GLB) | **KayKit / Kay Lousberg** | **CC0** | Rigged adventurers + a free Character Animations pack (idle/walk/run/attack/death); glTF; matches Kenney low-poly look. |
| Fantasy **item/spell/ability icons** | **game-icons.net** | **CC-BY 3.0** | ~4,180 monochrome, recolorable SVG+PNG. The genre standard. Track per-author credit. |
| CC0 icon supplement | **comigo "CC0 Hand-drawn Fantasy Icon Pack"** + **Kenney Game/Board Game Icons** | **CC0** | 269 hand-drawn icons incl. 30+ skill icons & frames (comigo) + Kenney's CC0 sets. Zero attribution. |
| **UI frames / panels (9-slice)** | **Kenney Fantasy UI Borders** | **CC0** | Purpose-built for 9-slice RPG windows; PNG sprites + vector source. |
| **UI controls, cursors, input glyphs** | **Kenney UI Pack + RPG Expansion, Cursor Pack, Input Prompts** | **CC0** | PNG+SVG; Input Prompts covers keyboard/mouse/every controller. |
| HP/progress **bar fills** | **Buch "UI pieces" (OpenGameArt)** | **CC0** | Includes separate partial-fill bar sprites. |
| **Body/UI font** | **Alegreya** (Google Fonts) | **OFL** | Readable literary serif; embeddable/shippable. |
| **Display/title font** | **Cinzel** + **MedievalSharp** (Google Fonts) | **OFL** | Engraved-caps + medieval-manuscript flavor. |
| **Pixel font** | **Press Start 2P** (OFL) / **Kenney Fonts** (CC0) / **m5x7** (CC0) | OFL / CC0 | For the HD-2D pixel register. |

**Two-source core for 3D creatures: Quaternius + KayKit** — both CC0, both glTF, together covering
monsters *and* adventurers *with animations*. Build the animated-figure pipeline on these; treat
everything else as opportunistic long-tail.

---

## 1. Supplemental 3D models (the Kenney animation gap)

Kenney's kits are excellent environment/prop grammar but ship **almost no rigged/animated characters**.
These fill that gap.

- **Quaternius** ([quaternius.com](https://quaternius.com/)) — **CC0** (verified: pack pages link the
  CC0 1.0 deed, e.g. [Ultimate Monsters](https://quaternius.com/packs/ultimatemonsters.html)). Formats
  per pack: FBX / OBJ / Blend / **glTF**. Animated packs confirmed live: **Ultimate Monsters** (50
  animated — attack/death/run/walk), **Cute/Animated Monster Packs**, **Easy Enemy Pack** (bee, snake,
  rat, spider, frog), **RPG Character Pack** (6 rigged fantasy classes), **Ultimate Animated Character /
  Animal Packs**, **Animated Dinosaur/Zombie/Alien/Robot Packs**, and **Universal Animation Library 1&2**
  (retargetable humanoid animation sets — apply one animation set across many characters). Caveat: some
  newer "Source"-tier kits are Patreon-gated (paid); the base packs above are free + CC0. Not every pack
  is animated — check the per-pack "Animated" marker.
- **KayKit / Kay Lousberg** ([kaylousberg.itch.io](https://kaylousberg.itch.io/kaykit-adventurers),
  [kaylousberg.com](https://kaylousberg.com/)) — **CC0** (itch tags CC0 1.0; page: "Free for personal and
  commercial use, no attribution required"). Formats: **.FBX / .glTF**. Rigged + animated low-poly
  **Adventurers** (5 characters + weapons), a separate free **Character Animations** pack (idle, hit,
  death, walk, run, jump, melee — built for retargeting), and a **Skeletons** pack. Visual style is a
  clean match for Kenney. Strong second pillar for humanoid PCs/NPCs. (Non-binding soft request: don't
  resell unmodified copies — not a legal restriction under CC0.)
- **Poly Pizza** ([poly.pizza](https://poly.pizza/)) — aggregator, **mixed CC0 / CC-BY per model** (each
  listing states its own license; verified a Quaternius mirror reading "Public Domain (CC0)"). Successor
  to Google Poly; hosts ~2,300 migrated Poly models + originals, FBX + glTF, no login. Useful as a single
  search/download point across creators (incl. much of Quaternius) — **but check each model's license and
  rig status individually.**
- **Poly Haven models** ([polyhaven.com/license](https://polyhaven.com/license)) — **CC0**, but the whole
  library is deliberately **photoreal / high-poly PBR** (4k–8k textures). **Poor fit** for the low-poly
  look and near-zero rigged characters. Keep it as a **texture/material** source (you already use it),
  not a character/creature source.
- **OpenGameArt 3D** — hosts CC0 and CC-BY glTF/OBJ, but per-submission licensing and wildly inconsistent
  quality/rigging. No reliable global "3D + CC0 + glTF" filter; lean on curated collections
  ([cc0 low-poly 3D](https://opengameart.org/content/cc0-assets-3d-low-poly)). Long-tail supplement only.
- **Sketchfab** — has a [downloadable CC0/CC-BY license filter](https://sketchfab.com/features/gltf) and
  glTF export, **but two flags:** (1) the **"Editorial Uses Only"** license class is barred from
  commercial use and easy to mistake for a CC license — never ship an Editorial model; (2) Epic is folding
  Sketchfab into **Fab**; the Store closed Oct 2024 and download availability is migrating/uncertain
  through 2025. Verify current availability before building any pipeline on it. Treat as unstable.

**Provides animations (walk/attack/idle):** Quaternius ✓, KayKit ✓, Sketchfab (per-model — verify).
**Static/props only:** Poly Haven, most OpenGameArt, much of Poly Pizza.

---

## 2. Item / spell / ability icons

- **game-icons.net** — **CC-BY 3.0** ([about](https://game-icons.net/about.html),
  [faq](https://game-icons.net/faq.html)). ~**4,180** monochrome silhouette icons, **SVG + PNG**, built to
  be recolored/inverted (studio export up to 512px, multiple fg/bg variants). Descends from Lorc's RPG
  icon set. **One license across the set, but attribution is per-author** — credit the specific artists
  whose icons you use (Delapouite, Lorc, Skoll, Caro Asercion, sbed, …), not a generic line. Suggested
  format: *"Icons made by {author}, available on game-icons.net (CC-BY 3.0)."* No endorsement/"must not
  imply" clause found. **This is the core icon source for the game.**
- **comigo "CC0 Hand-drawn Fantasy Icon Pack"** ([comigo.itch.io/fantasy-icons-ink](https://comigo.itch.io/fantasy-icons-ink))
  — **CC0**. 269 icons (black PNG, white PNG, scalable SVG): UI, weapons/armor, food, nature, weather,
  map tiles, **30+ skill icons**, plus matching frames. Best zero-attribution supplement.
- **Kenney icon sets** — **CC0**: [Board Game Icons](https://kenney.nl/assets/board-game-icons) (250),
  [Game Icons](https://kenney.nl/assets/game-icons) (105, B/W + spritesheet + vector), Game Icons
  Expansion (~60). PNG-centric; verify vector availability per pack.
- **7Soul RPG icons** — **split license, mind the fork.** The **older free sets** (the 496-icon pixel
  pack) are **CC0** on OpenGameArt (artist relicensed from CC-BY to public domain:
  [496 Pixel Art Icons](https://opengameart.org/content/496-pixel-art-icons-for-medievalfantasy-rpg)) —
  fine. The **paid itch "1700+ icons" pack** is **CC-BY-ND** ([7soul.itch.io](https://7soul.itch.io/7souls-rpg-graphics-pack-1-icons))
  — **ND forbids recolor/modify → reject.** Use the OGA CC0 sets only.
- **Lorc "700+ RPG Icons"** ([OGA](https://opengameart.org/content/700-rpg-icons)) — **CC-BY 3.0**
  (attribute "Lorc"). Same source family as game-icons.net; attribute per whichever host you pull from.

---

## 3. UI kits (frames, panels, buttons, cursors, input glyphs)

**Kenney (all CC0, all verified on kenney.nl):**
- **Fantasy UI Borders** ([link](https://kenney.nl/assets/fantasy-ui-borders)) — 140 files, **built for
  9-slice** fantasy/RPG windows; 130+ PNG sprites + tilesheets + vector source. **Top pick for panels.**
- **UI Pack** (430) + **UI Pack – RPG Expansion** (85) — buttons/panels/sliders, RPG-flavored expansion.
- **Cursor Pack** (180, PNG+SVG), **Input Prompts** (1,500, PNG+SVG — keyboard/mouse + every controller;
  Kenney: "no attribution required"), **Game Icons** (105).

**OpenGameArt:**
- **Buch "UI pieces"** ([link](https://opengameart.org/content/ui-pieces)) — **CC0**; HUD pieces on
  Dawnbringer's 16-color palette, **includes separate bar-fill sprites** for partial HP/progress bars.
- **RPG GUI construction kit v1.0** (Lamoot) ([link](https://opengameart.org/content/rpg-gui-construction-kit-v10))
  — **CC-BY 3.0** (attribute "Matjaž Lamut"), GIMP source, lego-like composable widgets. Fine under the
  CC-BY bar.
- Search-verified only (re-check the license page before use): **Golden UI**, **Free Fantasy Game GUI**
  (pzUH), the **RPG UI Elements CC0** curator collection.

**Input glyphs:** **Xelu's Free Controller & Keyboard Prompts**
([OGA](https://opengameart.org/content/free-keyboard-and-controllers-prompts-pack)) — **CC0**, 500+
glyphs, community-standard style; strong alternative/supplement to Kenney Input Prompts.

**itch.io UI — traps (do NOT assume "free" = CC0):**
- **Crusenho "GUI Essential"** = **CC-BY-ND 4.0** → no recolor/modify → **reject.** ("Complete UI
  Essential Pack" is CC-BY 4.0 = OK with credit; different pack, check which one.)
- **Penzilla "Basic GUI Bundle"** = **proprietary "royalty-free" license** (ships a StandardLicense.pdf),
  **not** CC0/CC-BY — no redistribution/modification rights. Read the PDF; treat as closed.
- **Veyroa Fantasy RPG UI** = paid. **Quintino Pixels** UI = license reportedly changed post-publication
  — verify live. Only integrate an itch pack after reading its actual License field.

---

## 4. Fonts

**Anchor: SIL Open Font License (OFL)** — explicitly permits **embedding in and shipping with a commercial
game**, bundling, redistribution, and self-hosted `@font-face` ([OFL-FAQ](https://openfontlicense.org/ofl-faq/)).
Two rules only: (1) can't sell the font *by itself*; (2) if you *modify* a font with a **Reserved Font
Name**, rename it. No on-screen credit required (the license text must travel with the font file).

**Genesis-specific:** the game runs in-browser and **persists offline** → fonts must be **bundled/
self-hosted** (WOFF2 in the repo), **not** loaded from Google's CDN (a CDN dep breaks first offline load).
Self-hosting is explicitly OFL/Apache-sanctioned. Use `font-display: swap`, subset to Latin via
`unicode-range`, and set CORS headers if served cross-origin.
([Google Fonts FAQ](https://developers.google.com/fonts/faq), [web.dev fonts](https://web.dev/articles/font-best-practices))

**Google Fonts picks (all OFL, verified to exist, all commercial-embeddable):**
- **Alegreya** — literary serif, body/reading text.
- **Cinzel** — engraved Roman caps, titles/headers.
- **IM Fell English** — old-book serif, lore/flavor text.
- **MedievalSharp** — medieval-manuscript display, titles/accents.
- **Uncial Antiqua**, **Metamorphous** — fantasy display alternates.
- **Grenze Gotisch** — true blackletter. **Readability flag:** titles/single words only ("Genesis"),
  never body/stat blocks/numerals.

**Pixel fonts (HD-2D register):**
- **Press Start 2P** — Google Fonts, **OFL**, 8-bit arcade.
- **Kenney Fonts** ([link](https://kenney.nl/assets/kenney-fonts)) — **CC0** pack of UI/pixel faces.
- **m5x7** (Daniel Linssen) — itch asset-license field = **CC0**. **Flag: m6x11** (same author) has **no
  CC0 field and reads "free to use *with* attribution"** — treat as attribution-required, not CC0; check
  its bundled license.txt before relying on it.

---

## 5. What NOT to re-research / already covered

- **Kenney 3D kits** and the donor-grammar strategy → `OFFLINE-ART-FOUNDRY-RESEARCH.md` (13-pack CC0
  audit). Kenney is a *grammar*, not the visual identity.
- **PSX/PBR textures** → AmbientCG, PolyHaven, ScreamingBrainStudios already landed under
  `assets/textures-psx/` (all CC0).
- **Character sprites** → self-generated pixel-art is the **canon** (`ART-DEPARTMENT.md`); external sprite
  packs are a fallback, not the goal.

---

## 6. License reference & the traps

**Safe under Adam's bar (CC0 preferred, CC-BY OK with credit):**
- **CC0 1.0** — public-domain dedication; no attribution, commercial/modify/redistribute all OK. Gold
  standard. Edge cases: does **not** waive patent/trademark; "as-is," and it only binds *if the uploader
  actually owned the work* (residual trust risk — log source + date anyway).
  ([legalcode](https://creativecommons.org/publicdomain/zero/1.0/legalcode.en))
- **CC-BY 4.0 / 3.0** — attribution required. Provide **TASL**: **T**itle, **A**uthor, **S**ource (link),
  **L**icense (name + link). 4.0 makes title optional and lets attribution live on a separate credits
  page (a CREDITS file / in-game credits screen satisfies it).
  ([TASL](https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution))
- **OGA-BY 3.0/4.0** — OpenGameArt's own attribution license; functionally CC-BY, and §8(g) explicitly
  lets you treat/relicense it as CC-BY of the matching version. Attribute like CC-BY.
  ([legalcode](https://static.opengameart.org/OGA-BY-3.0.txt))
- **SIL OFL** — fonts; embed/ship/bundle OK; rename on modification only if a Reserved Font Name is set.

**Reject (or use only with care):**
- **CC-BY-SA** — ShareAlike attaches only to *adaptations*, **not** to mere aggregation, so it does **not**
  force your game code or other assets to become SA. But a *modified* SA asset must stay SA. Safe **only if
  shipped unmodified**; otherwise avoid to keep zero share-alike surface.
  ([SA interpretation](https://wiki.creativecommons.org/wiki/ShareAlike_interpretation))
- **CC-BY-ND** — no derivatives. Game production (resize into atlas, recolor, re-rig, spritesheet) is
  exactly the derivative gray zone → **reject** unless used completely unaltered.
- **CC-NC** — no commercial use → **hard reject** for a monetized game.
- **GPL/LGPL art** — copyleft designed for *code linking*; art loaded as runtime data is generally "mere
  interoperation," but the theory is community consensus, not settled law, and gets murky if bundled with
  GPL code. **Higher risk** → avoid for a proprietary game unless truly standalone data.

**Platform traps:**
- **Sketchfab "Editorial Uses Only"** = no commercial use, ever — regardless of $0 price. Also Sketchfab
  now layers **AI-training restrictions** on top of otherwise-standard licenses.
  ([licenses](https://sketchfab.com/licenses))
- **itch.io defaults to All Rights Reserved** when a creator leaves the license blank — "free to download"
  ≠ "free to use." Always read the explicit License field.
- **"Free for personal use, pay for commercial"** freemium licenses (common on font/asset sites) are not
  CC — look for the commercial-terms page.
- **Unity/Unreal Asset Store** = proprietary EULAs, not open — no standalone redistribution; irrelevant to
  Genesis but worth knowing.
- **AI-training clauses** are appearing at the **platform-terms** level (not in base CC licenses) circa
  2025–26 — check platform ToS separately.

### CREDITS.md — per-asset record (start this file now, append as you admit assets)

```
Asset:          <filename / in-repo path or description>
Title:          <work's stated title, if any>
Author:         <name / attribution party exactly as the licensor specifies>
Source URL:     <direct link to the original listing/download page>
License:        <exact license + version, e.g. CC0 1.0 / CC-BY 3.0 / OGA-BY 3.0 / OFL-1.1>
License URL:    <link to the legalcode/deed>
Date obtained:  <YYYY-MM-DD — your evidence if the source later changes license or vanishes>
Modifications:  <none / recolored / resized / repacked into atlas / re-rigged / …>
```

CC0 assets need no credit legally, but still log **source + date obtained** — it's your proof against the
"was it really CC0?" risk and costs nothing. This mirrors the provenance discipline the engine already
keeps on admitted meshes (`sourcePack`/`sourcePage`/version in `OFFLINE-ART-FOUNDRY-RESEARCH.md`) — a
CREDITS.md is the same idea for icons/UI/fonts/supplemental-3D.

---

## Source-confidence notes

- **Directly page-verified:** Quaternius CC0 + glTF; KayKit CC0; Poly Haven CC0 (and photoreal scope);
  game-icons.net CC-BY 3.0 + count; comigo CC0 pack; all cited Kenney packs CC0; Buch/Lamoot OGA
  licenses; 7Soul license fork; OFL embedding rules; every Google Fonts pick's existence + OFL;
  Sketchfab Editorial + Fab migration; itch default-ARR; CC0/CC-BY/SA/ND/NC/OGA-BY legal text.
- **Search-verified only (re-check before shipping):** Golden UI, Free Fantasy Game GUI, several itch UI
  packs (etahoshi, Quintino, PlayPug, ZSS), some Kenney pack formats (SVG vs PNG), m6x11's exact license.
- **Flagged conflicts:** 7Soul (free CC0 sets vs paid CC-BY-ND pack); m5x7 (CC0) vs m6x11 (attribution);
  Crusenho "Complete" (CC-BY) vs "GUI Essential" (CC-BY-ND); "free" ≠ "CC0" across itch generally.
