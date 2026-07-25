# Lane 5 — Touchstones (BG3 owlbear cave + Underdark; Diablo 1 darkness)

type: research-lane
date: 2026-07-24
status: COMPLETE, with a **declared narrowing** — no images
cross-references: `lane-1-cave-morphology.md` (light is islands, not gradients),
`lane-4-fft-cave-cohort.md` (LC-2 no ceiling, LC-10 one camera)

## Declared narrowing (read first)

The brief asks for image evidence. BG3 and Diablo screenshots are **copyrighted game
assets**, and the governing boundary in `docs/GOLDEN-SITES-CATALOG.md` permits them only as
"local comparison only, never redistributed, **never committed**." This study lives *in the
repo* — so downloading them into `contact/` would breach that boundary by construction.

Lane 5 is therefore built from **public written documentation** (community wikis, guides, and
open-source engine-port discussion) plus prior play knowledge, and it cites URLs instead of
pixels. Two source pages (`diablowiki.net`, `diablo.fandom.com`) refused automated fetch
(HTTP 403 / 402); their content is taken from indexed search summaries and is flagged
**second-hand** wherever it is load-bearing below.

## A — The BG3 Owlbear Nest, as documented

Facts, from bg3.wiki plus corroborating guides:

- The cave is **"a vaguely ring-shaped area, with a water stream dividing it approximately in
  two."**
- **Two entrances.** A main cave mouth that leads *downslope* to the nest; and a **rocky
  crevice found on a DC 5 Perception check, passable only by Small and Tiny creatures**,
  which emerges **on a rocky shelf above the den**.
- **Two floor-level routes** diverge from the main entrance: one descends and crosses the
  stream straight at the den; the other goes via a Selûne shrine (reached by climbing down a
  "cragged rock" face) and then climbs back up at the den **from the opposite side**.
- The **shelf** is above and west of the den's entrance, and it **divides narrowly in the
  middle — crossing requires a jump.**
- **Fissured stalactites hang from the shelf and can be shot down** as an environmental
  hazard.
- The prize (owlbear egg) sits **in the farthest corner of the den**, with a headless
  skeleton and a backpack beside it.
- The wiki records **no light sources**; the party's own light is it.
- Play guidance across guides: take the height, and the owlbear is forced to *jump up* to
  reach you.

### What this actually says about the deck

The banked ruling reads the owlbear cave as **"mouth daylight, nest floor with the prize, rim
ledge with its own route around."** Three of those four survive contact with the
documentation, and one does not:

| Banked element | Verdict | Evidence |
|---|---|---|
| nest floor with the prize | **HOLDS** | egg in the farthest corner of the den |
| a vertical advantage over the nest | **HOLDS** | the shelf; the owlbear must jump to reach it |
| carried light, not ambient | **HOLDS** | no light sources documented |
| "mouth daylight" | **UNEVIDENCED** | the documentation never treats daylight as a designed feature of this cave |
| "rim ledge with its own route around" | **WRONG SHAPE** | the *loop* is at floor level (two paths around the stream). The ledge is **discontinuous** — it splits, and crossing costs a jump |

And two elements the banked ruling does not have at all, which are doing real work:

- **The ledge's back door is a size-gated secret.** The small crevice (DC 5 Perception,
  Small/Tiny only) is simultaneously a bolt-hole, a perception reward, and a party-composition
  gate. This is the same noun Lane 2 found in the gopher drawing — a plugged/hidden secondary
  mouth — and here it is *the* access to the high ground.
- **The ceiling is a weapon.** Fissured stalactites are shootable. Under Lane 4's LC-2 ("no
  ceiling"), Genesis has nowhere to hang that. This is a direct collision between the FFT
  presentation grammar and the touchstone's best mechanic.

## B — The BG3 Underdark entrances, as documented

Five documented Act 1 ways into the same interior:

1. **Fall down the phase-spider pit** (Feather Fall to survive) — the pit posture, arrived at
   by mishap.
2. **Zhentarim hideout** — a secret cupboard in a cellar, then an illusory wall, then a hidden
   elevator: an adopted-void chain.
3. **Defiled Temple** — a rotating-platform puzzle solved under **a shaft of light from
   above**, then a lever, then descend.
4. **Auntie Ethel's teahouse** — a fireplace that opens, then an illusory wall behind a mask.
5. **Grymforge** — reachable only from inside.

**Finding: not one of the five is a walk-in mouth.** Every documented entrance to that
interior is concealed, vertical, mechanical, or internal. This is strong evidence for treating
**arrival posture as its own roll axis** rather than as a property of the cave — and it
matches Lane 1 (karst entrances are near-invisible) and Lane 3 (adits are found by their
drainage, run-ins read as grassy dishes) from the fiction side.

Entrance 3 is also notable for using **daylight from above as the puzzle's readable cue** —
a skylight doing gameplay work, not decoration. That is the same relation as `L1-05`/`L1-06`.

## C — Diablo 1 darkness

Two facts matter, and they are different in kind.

**1. Presentation: the light field is quantised and tile-indexed.** From the DevilutionX
source discussion (open-source, fetchable): Diablo's lighting uses **16 discrete light
levels** stored per tile in `dLight`; the modern per-pixel work in that project describes
generating isolines through those 16 levels precisely because the original is a **tile-level
step field**, not a smooth falloff. So the touchstone's actual look is *banded* light on a
grid — which is exactly the kind of thing Genesis's grid engine can express natively and
cheaply, and it converges with Lane 1's "light is islands with boundaries, not gradients."

**2. Mechanic: light radius is a two-way stat.** *(Second-hand — the two wiki pages refused
automated fetch; taken from indexed summaries and consistent with play memory.)* In Diablo 1
a larger light radius let the player see further **but also let monsters notice the player
sooner**; a smaller radius meant creeping closer unseen. Deeper dungeon levels are described
as progressively darker with correspondingly later monster reaction.

### What this says about the causal-light law

The banked law is a **diegetic-truth** rule: every light has an owner; uninhabited interiors
are dark; the carried light becomes the primary tool; how black renders is a taste card.
Everything in this lane supports the first three clauses.

But the touchstone Adam named is not primarily a *look* — in the original it is a **trade**.
The thing that made Diablo 1's dark feel like a decision rather than a mood is that carrying
more light cost you stealth. Genesis has a stealth/detection surface already (the
detected-first clock). If the causal-light law stays purely presentational, it will reproduce
Diablo 1's picture without Diablo 1's tension. That is the founder question this lane exists
to raise — and it is a **mechanics** question, so it is Adam's, not a taste card.

## Findings, condensed

1. The owlbear cave's loop is at **floor level**, not on the ledge.
2. The ledge is **discontinuous**, and the gap is a jump check.
3. The ledge's access is a **size-gated hidden crevice** — a bolt-hole doing triple duty.
4. **No daylight gradient is documented** as a feature of the owlbear cave; the "mouth
   daylight" half of the banked touchstone is the weakest part of it.
5. The prize sits at the **far corner of the far room** — depth, not centre.
6. The **ceiling is a destructible hazard** there; FFT's grammar has no ceiling to hang it on.
7. **All five** documented Underdark entrances are concealed, vertical, or mechanical.
8. One of them uses **a shaft of daylight as the gameplay cue** for a puzzle.
9. Diablo 1's darkness is a **16-step tile-indexed light field** — banded, grid-native.
10. Diablo 1's light radius **traded visibility for stealth**; the darkness was a decision,
    not only an atmosphere.
