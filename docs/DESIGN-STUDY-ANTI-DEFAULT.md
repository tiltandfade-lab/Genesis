# The anti-default design study — capture for Genesis

**Date:** 2026-07-30 · **Type:** study-capture · **Status:** rulings banked here, canon ports pending (see bottom) · **Owner:** Adam; full material lives in the Register project (`~/Desktop/Work/projects/Register`)

## What happened

Adam identified that AI-designed interfaces converge — "you can spot an AI-designed UI immediately" — and that the convergence is in **patterns, not selections**. The proof came from this repo: genesis.html and a stranger's game (Dungeons & Dynasties, bretticus82.itch.io) request `Cinzel:wght@500;600;700` character-for-character identically, both name EB Garamond, and both land on the same antique gold `#c9a24b` to the digit. Two studios that never met, one room. The lesson: there is no single "AI mode" — every one-line brief has its own attractor, and escaping one attractor's values just lands you on the neighboring attractor. Full evidence: `Register/census/2026-07-30-genesis-vs-dnd.md`.

A dedicated studio project, **Register**, now holds the escape machinery: a twelve-exhibit close-read corpus (Book of Kells → The Green Knight), a ten-law pattern library, a banned-tells ledger built from Adam's verdicts (11 tells so far), an approved-registers catalog, and a census tool (`Register/tools/design-census.sh`) that catches convergence in any stylesheet. Three rounds of taste cards proved the loop works: by round three Adam ruled "nothing is reading too AI in this set."

## The proven loop

Study real primary sources → design under committed constraints (nouns and numbers, never adjectives) → Adam's gate verdicts → verdicts written into law (tells + registers) → next round starts from the law. Iteration explores **across** artifacts (one committed voice per artifact — mixing voices inside one artifact was ruled "randomness cosplaying as humanity," tell T10).

## Genesis-binding rulings from the study

1. **Game paraphernalia is the confirmed design direction** for Genesis interface components — the UI as table objects (counter sheets, tags, pads, ledgers, posted notices), consistent with the photographed-tabletop doctrine. (Adam, set 02 review.)
2. **The letterpress broadside register is approved for in-world print ephemera** — job boards, wanted posters, news artifacts, posted notices. Spec: black ink dominant, mixed faces line by line, size jumps set by line length, second ink rationed to the one working word. See `Register/laws/APPROVED-REGISTERS.md` R1.
3. **Turn-order surface = the plinth voice, two states** (R3):
   - **Compact initiative bar:** small squares, sprite **face** centered, a little of the sprite escaping the top of the mask. **No red dot, no ordinals, no names/numbers at bar scale.** Active character/party sits **leftmost, slightly larger, less faded**; waiting units faded beside it; units that have acted **move to the right of the initiative order line**. Order and state are carried by position, size, and fade alone.
   - **Expanded hover card:** uniform dimensions for every creature (sized to the biggest), a containing rectangle holding figure + cast shadow + plate as one object, quiet letterspaced plate (steel, not brass), fixed plate lines (name / level / AC + move, labeled plainly).
   - Pixel sprites are the art layer (consistent with the sprite-register canon).
4. **Killed with cause:** FFT-lineage slate ("too clearly ripping from the Final Fantasy series" — tells ledger T11: homage inside recognition distance); punchboard counter; modern round token. **The ink-cut card register is reserved for a future non-Genesis project** (R2) — do not ship it on the combat HUD.
5. **Renders/mocks:** `Register/cards/turn-order-c-two-states.pdf` (current), plus the exploration decks alongside it.

## Parked Genesis lane: sprite face anchors + bar build

Adam ruled the crop technology must be **real face detection over the sprites**, not top-center estimates — and that this work is Genesis-repo work, paused until he opens a lane. Sketch ready to become a brief:

- Per-sprite face anchor via: alpha-silhouette figure bbox → row-width profile to find the head band (neck/shoulder expansion; fallback fraction for no-neck creatures) → weighted centroid of skin-tone + bright-eye pixels within the band (mass fallback) → emit `{fx, fy, headTop}` fractions.
- Verification is mandatory: a crosshair QA contact sheet over a stress sample (humanoids, beasts, tiny animals) before trusting anchors — estimates failed three consecutive times in the study; measurement worked.
- Anchors belong in the sprite registry data; the bar consumes them. `docs/ART-DEPARTMENT.md` is the authority for any sprite work; `dev/sprite-review.py` is the adjacent tooling. (Related: a misnamed sprite was found — the "human miller" file contains dragonborn art; a QA task was spun off separately.)

## Pointers (all material)

- Project: `~/Desktop/Work/projects/Register/` — `README.md` (charter + thesis), `laws/PATTERN-LIBRARY.md` (ten laws), `laws/TELLS.md` (banned tells, T1–T11), `laws/APPROVED-REGISTERS.md` (approved voices + kills), `corpus/fantasy-typography-field-guide.pdf` (the twelve-exhibit study), `cards/*.pdf` (taste cards and explorations), `tools/design-census.sh` (the convergence census).

## Pending canon ports (do in a Genesis session at the next canon pass — not done here to keep this a new-file-only capture)

- `docs/DESIGN-GUIDE.md`: paraphernalia direction + the turn-order two-state spec into the chrome/typography section.
- `docs/ART-DEPARTMENT.md`: chit face-crop usage of sprites + the anchor data requirement.
- `docs/DESIGN.md` decision registry: entries for rulings 1–4 above.
- `docs/NEXT-STEPS.md`: the face-anchor + initiative-bar lane, when Adam opens it.
