---
type: system-spec
project: Genesis
status: SPECCED 2026-07-03 — Phase A build-ready (UI-autonomy scope); Phase B = the style-probe session with Adam; Phase C = T6, gated on B
created: 2026-07-03
author: Fable (grounded in the live browser combat proof, 2026-07-03)
related:
  - "[[DESIGN-GUIDE]]"     # §II.0a style gate · T6 band-lane theater (locked, zero built)
  - "[[COMBAT-TRACKER]]"
  - "[[BATTLEMAP]]"
  - "[[BLOCKWRIGHT]]"
  - "[[COMBAT-LIFECYCLE]]"
  - "[[ASSET-PROMPTS]]"    # Batch 4 battle advance-buys (generated, banked, unwired)
---

# BATTLE-VISUALS — making the fight worth looking at

## §0 What the live proof showed (2026-07-03, first fight ever run in the browser)

The combat panel WORKS (lifecycle seam landed same day) but reads as three stacked prototypes,
not one battle theater. Observed live, Copper's Marsh clone, 2 goblins + wolf:

1. **The blockwright diorama is illegible.** Floating blue slabs + gold blocks on a grey field —
   no readable floor, no figure/ground, nothing a player could point at and say "that's the
   wolf." It currently *subtracts* clarity from the panel it crowns.
2. **The zone grid and the band lanes render the same state twice**, stacked — two full views of
   the same combatants (grid cards, then band-lane chips), with mostly-empty beige cards eating
   half the panel and cramped L/C/R headers.
3. **The good bones are real:** round/side header, cover + exit tags, foe chips with CR + coarse
   state words (fresh/bloodied/down — the no-foe-HP rule holding), the PC HP bar, and the prose
   twin (`role="status"`) narrating positions. The information layer is right; the presentation
   layer is triplicated and unthemed.
4. **The banked Batch-4 assets exist and are wired to nothing:**
   `assets/battle/` + `ui-sketches/ivalice-style/generated-070126/`: `battle-arena.png` (the
   band-lane proscenium stage frame), `battle-player-ring.png`, `battle-hostile-ring.png`
   (engraved token rings, empty centers by design).

**The governing constraint — DESIGN-GUIDE §II.0a:** the engraved style is PROVISIONAL; the
battle theater is *the* reason a low-poly FFT re-skin is under consideration. So: Phase A below
stays within UI-autonomy scope (composition/legibility/wiring — valuable under ANY skin, and the
skin stays swap-cheap); anything style-deepening waits for the Phase B probe session with Adam.

## §A Phase A — composition + legibility pass (UI autonomy; Sonnet-executable now)

**A1. One board, not three.** The zone grid (band×lane) becomes THE board; the redundant
band-lane chip strip below it is removed (its chips migrate INTO the grid cells). The diorama
moves behind a collapsed-by-default toggle ("⌗ diorama") until Phase B decides its fate — it
keeps rendering (verify-blockwright stays green; BLIND-PLAYABLE is untouched since the prose
twin, not the diorama, is the accessible surface).
- Grid cells: occupied cells carry the combatant chips (PC chip + ally chips + foe chips as
  today); empty cells collapse to a slim outline (no more beige card farm). Band labels
  (MELEE/NEAR/FAR/OUT) run down the left rail once; L/C/R across the top once.
- The whole grid sits on **`battle-arena.png`** (the banked proscenium) as the stage backdrop —
  asset already generated for exactly this (`ASSET-PROMPTS.md` Batch 4 §8). CSS background on
  the grid container; zero new assets.

**A2. Token rings.** Foe chips gain the **`battle-hostile-ring.png`** frame; the PC (and ally)
chips the **`battle-player-ring.png`** — the ring's empty center takes the existing chip
content (initial/name). Rings are `background-image` on the chip, so the de-skin cost stays
"swap a URL" (§II.0a discipline).

**A3. State legibility.**
- Foe state word gets color + weight: `fresh` quiet, `bloodied` ember-red (the existing HP-bar
  red), `down` struck-through + desaturated chip.
- The ACTIVE SIDE gets a pulse: the round header's "your side acts / the foes act" is currently
  text-only; add a subtle glow on the acting side's chips (CSS class flip off `cm.side` — no new
  state).
- Damage flashes: when a chip's underlying HP state changes between renders, flash the chip
  (one CSS animation keyed on a `data-state` change). Detected in `combatPanel` by diffing the
  previous render's state map held on `GS.cmbLastStates` (transient, GS-owned per the state
  rule).
- Conditions keep their badges; cap visible badges at 3 + "+n" overflow.

**A4. The dice overlay joins the fight.** Attack/save rolls in combat already route through
`dmRollFor`/`dmRollDice` (DICE-OVERLAY) — ensure the combat panel doesn't obscure the overlay
(z-order audit) and the roll result lands as a feed chip AND the chip flash (A3) in the same
beat. No new roll paths (the overlay's own law).

**A5. Prose parity (binding).** Every A1–A4 change keeps `cmbProseSummary` the complete
equivalent: side pulse → "the foes act" (already present), damage flash → the state word change
is already in the summary, ring/backdrop → decorative (no prose needed). Acceptance: the
lifecycle harness's §11 checks still pass byte-for-byte; a screen-reader pass of one full fight
stays coherent.

**A6. Acceptance (per the design-mockup-port lesson: VISUAL side-by-side, not prose claims).**
Build a fixture page state (the proof fight: 2 goblins + wolf, one bloodied, PC at half HP,
round 2, foes' side) and capture before/after screenshots of: fresh fight · mid-fight bloodied ·
a downed foe · fight end (panel restored). The executor attaches all four pairs; the gate is
Adam (or the orchestrator) eyeballing them, plus `verify-combat-tracker`/`verify-battlemap`
green with assertions updated ONLY where the spec above changes structure (grid absorbs chips,
diorama behind toggle — update those checks deliberately, red-first, never silently).

## §B Phase B — the style probes — **RESOLVED FOR THE BATTLE SCENE (Adam, 2026-07-03)**

**Ruling: low-poly 3D, FFT grammar, three.js, pre-built packs — see `docs/BATTLE-THEATER.md`**
(which supersedes §C below and takes the diorama's slot; Phase A's diorama-toggle item becomes
"the theater replaces the diorama slot at T1"). The UI-chrome half of §II.0a stays open;
engraved chrome remains shipped. The probe session as originally framed below is retained for
the record only:

The §II.0a ruling, executed at last, using the battle theater as the arena (it was always the
motivating surface). Three probes of the SAME frozen fight state (the A6 fixture), each a
static full-panel mock (image or HTML — no engine work):

1. **Engraved chrome** — Phase A's board pushed to finish: engraved plaques, the arena backdrop,
   token rings, Ivalice palette. (Cheapest: it's Phase A + polish.)
2. **Low-poly diorama promoted to hero** — blockwright grown up: the board IS the 3D stage
   (bigger canvas, camera angle per BLOCKWRIGHT's fixed isometric, band depth = stage depth),
   chips demoted to a thin status strip. FFT/PS1 fantasy.
3. **Hybrid** — low-poly stage inside engraved chrome (the sketch §II.0a names as a live option).

Adam picks; the ruling unlocks §C and retro-actively styles Phase A (which was built skin-cheap
for exactly this). **Do not generate new art assets before the ruling** (§II.0a's own law).

## §C Phase C — T6 band-lane theater (the graphics-engine milestone; spec AFTER §B)

Locked direction (DESIGN-GUIDE T6): visualize the four range bands as stage lanes; creatures as
tokens/models; movement = lane transitions; the walk's rolled nouns become stage props. The §B
ruling decides the renderer (CSS-3D blockwright scaled up vs canvas/WebGL — SCALING.md's
trigger). Write `docs/BATTLE-THEATER.md` then, not now — this file deliberately stops at the
gate so no theater work front-runs the style ruling.

## Decisions (flag only to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | Grid absorbs lanes; diorama behind a toggle until §B | live proof: triplicated views; §II.0a: don't deepen a provisional style |
| 2 | Wire the 3 banked battle assets in Phase A | they were advance-bought for this; wiring is URL-swap-cheap, not style-deepening |
| 3 | No new asset generation until the §B ruling | §II.0a verbatim |
| 4 | Prose twin parity is an acceptance gate, not a nice-to-have | BLIND-PLAYABLE doctrine |
| 5 | Visual side-by-side screenshots are the Phase A gate | the REV-1/REV-2 mockup-port lesson |
