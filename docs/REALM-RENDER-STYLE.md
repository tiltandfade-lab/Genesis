---
type: design-proposal
project: Genesis
status: PROPOSAL 2026-07-04 — Adam raised "alter how each realm is rendered: saturation, palette, shape styles". Design for his ruling before build.
created: 2026-07-04
related:
  - "[[BREACH]]"
  - "[[OUTLANDISH-REALMS]]"
  - "[[BATTLE-THEATER]]"
  - "[[REALM-SURFACES-DRAFT]]"
---

# Realm render style — each breach realm looks distinct, not just populated differently

## §0 The idea (Adam, 2026-07-04)

Right now every board renders through one PSX look with a per-ENV palette (dungeon/urban/wilderness/
breach). A breach into the **noir** realm and one into **bright-kingdom** currently look the same
except for content. They shouldn't. Each realm should carry its own **render treatment** — a color
grade + shape register — so the moment you breach in, the *look* tells you where you are. This keys
off the SAME active-realm seam the realm monsters (`dwalkEncounter` realm-filter) and realm surfaces
need: `w.realm` / the breach's `realms:[]`.

## §1 The dimensions (cheap, no postprocess pass)

The engine deliberately runs no postprocess chain (SCALING.md / BATTLE-THEATER.md). So the grade is
applied at the **material + palette + light** level, not as a screen-space pass — a per-realm
`REALM_RENDER_PROFILE` consumed where colors are already resolved (theaterPaletteFor, figure/tile
material color, `board.light`). Four dimensions:

1. **Saturation** (`sat`, ~0.4–1.5×) — multiply the chroma of every resolved color (tiles, figures,
   light) toward/away from grey. Frontier dusty-desaturated; noir near-monochrome; bright-kingdom
   super-saturated; ash bleached; cosmic pushed into unnatural chroma.
2. **Palette tint** (`tint` hex + `tintAmt` ~0–0.35) — shift the whole scene toward one hue (the
   realm's signature cast): noir cold blue-grey; frontier amber-sepia; gloom sickly green-black;
   chrome cyan-steel; high-seas storm-teal; bright-kingdom warm primary.
3. **Value/contrast** (`contrast` ~0.8–1.4) — noir crushes to hard blacks + hot speculars; suburb
   flattens to a faded-photograph mid-tone (80s home-video); cosmic lifts blacks into a glow.
4. **Shape register** (`shape`) — the fuzziest; the low-poly equivalent of an art style:
   - `psxGrit` (default) · `hardEdge` (noir: crush + stronger dither) · `softFade` (suburb: gentler
     dither, faded) · `warp` (cosmic: stronger vertex-snap jitter — geometry visibly wrong) ·
     `chunky` (bright-kingdom: rounder/bolder, thicker read) · `worn` (ash/frontier: extra grain).
   Implemented via the existing PSX knobs already per-material (dither amplitude, vertex-snap grid)
   flipped per realm — no new render tech, just per-realm constants.

## §2 Proposed per-realm profiles (starting point — Adam tunes)

| Realm | sat | tint | contrast | shape | The read |
|---|---|---|---|---|---|
| `frontier` | 0.75 | amber-sepia | 1.05 | worn | sun-bleached, dust-hazed spaghetti-western |
| `chrome` | 0.85 | cyan-steel | 1.15 | hardEdge | cold, clean, fluorescent-sterile |
| `noir` | 0.45 | cold blue-grey | 1.35 | hardEdge | near-monochrome, rain-hard shadow, hot key-light |
| `ash` | 0.60 | bleached ochre | 1.10 | worn | faded, irradiated, sun-scoured |
| `suburb` | 0.90 | warm faded | 0.85 | softFade | 1980s faded-photo / home-video warmth |
| `cosmic` | 1.25 | unnatural violet-green | 0.90 | warp | wrong chroma, lifted blacks, geometry that jitters |
| `theater` | 0.65 | mud-khaki | 1.10 | worn | muddy, gas-hazed, colorless war |
| `high-seas` | 0.85 | storm-teal | 1.10 | psxGrit | salt-damp, overcast sea-light |
| `lost-world` | 1.00 | warm ochre-gold | 1.05 | psxGrit | sun-baked antiquity, deep jungle green |
| `gloom` | 0.55 | sickly green-black | 1.25 | hardEdge | candle-dark, cold, wrong |
| `bright-kingdom` | 1.45 | warm primary | 1.15 | chunky | super-saturated toybox, teeth under candy |

(realm-neutral / non-breach = the current default profile, unchanged.)

## §3 Where it plugs in (the seam)

- **Active realm resolver:** a single `realmRenderProfile(w)` reading the live breach realm
  (`w.realm.name` when marooned, or the current breach's `realms[0]`) → a profile object, default
  when not in a breach. ONE source of truth, shared with the realm-surface and realm-monster
  selectors (all three are "what realm am I in?").
- **Color grade:** a pure `gradeColor(hex, profile)` (saturation × tint-mix × contrast) applied at
  the 3 color funnels that already exist — `theaterPaletteFor` output (tiles), `figureMaterialFor` /
  the whole-object material base (figures), and `board.light` tint. Deterministic, no per-frame cost
  beyond the material build already happening.
- **Shape register:** per-realm PSX constants (dither amplitude, vertex-snap grid, an outline flag)
  selected off the profile at mount, feeding the knobs `applyPsxShaderTweaks` already reads.

## §4 Build plan (once Adam rules the profiles)
1. `data/realms.js` (or a sibling): add the 11 `render` profiles above.
2. `realmRenderProfile(w)` resolver + `gradeColor()` pure helper (+ jsdom test).
3. Thread the grade through the 3 color funnels + the PSX knobs through mount.
4. Render the SAME fixture board under all 11 profiles (a review sheet) — the visual gate.

## §5 For Adam — the calls
1. **Do we build this?** It's the biggest single lever on "each realm feels different." Recommended yes.
2. **Tune the §2 table** — saturation/tint/contrast per realm are taste; the table is a first guess.
3. **Shape register scope** — start with just sat/tint/contrast (concrete, safe), add `shape`
   (warp/chunky/hardEdge) as a fast-follow? Or all four at once?
4. This depends on the **active-realm seam** — which the realm-monster filter (`dwalkEncounter`) and
   realm-surfaces also need. Building that seam once unlocks all three realm systems.

## Note — suburb theme lock (Adam, 2026-07-04)
`suburb` is locked to **1980s suburban Americana** (the Amblin/E.T.-era grounded-mundane-turned-wrong
register — bikes, cul-de-sacs, strip malls, VHS, latchkey kids). Its bestiary + its render profile
(warm faded-photo, softFade) both serve that. Genericized, never a specific franchise.
