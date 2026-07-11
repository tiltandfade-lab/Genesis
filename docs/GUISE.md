# GUISE — one entity, many faces (universal sprite-swap)

type: system-spec
status: SPEC (Adam ruling 2026-07-10 PM — scope ruled UNIVERSAL; build not yet authorized)

## The ruling

Anything guise-capable gets the mechanical ability to pose as anything it can pose as.
Not a dragon perk — a universal system, armed and ready for every case:

| class | examples | guise grammar |
|---|---|---|
| shape-shifters | lycanthropes, druids (wildshape), fae | forms swap at will/trigger; both forms are THE SAME entity |
| impostors | doppelgangers, hags, dragons in human guise | the guise is a mask; the reveal is a scene beat |
| object-guisers | mimics | one form isn't a creature at all (chest, door) — a PROP swap |
| passing | chrome synths ("synths are people too" — chrome-npc-03b r1c4) | the guise is social/political, may never drop |
| spell-driven | polymorph, true polymorph | temporary, externally imposed, reverts on conditions |

## Laws

1. **ONE ENTITY, MANY FORMS.** A guise-capable codex entity owns a `forms[]` set. Every
   form binds its own sprite (SPRITE-TAGS binding law extends: binding an NPC binds its
   ENTIRE form set — no form's sprite is ever cast onto someone else).
2. **THE REVEAL IS A BEAT, NOT A NEW NPC.** Swapping the active form never creates a
   codex entity; names, hooks, wants, and bonds persist across forms. (Same doctrine as
   names-immutable-once-revealed.)
3. **THE ENGINE OWNS THE SWAP.** Form changes are EVENTS through the contract boundary
   (a `guise_swap` event in the DM_EVENT_FIELDS registry — normalization there, never
   in handlers, per the standing law). The DM narrates the reveal; the script flips the
   sprite/statblock.
4. **STATS MAY TRAVEL WITH THE FORM.** Each form may carry its own `statFrame`
   (wildshape uses the beast statblock; the hag's crone and the hag fight differently).
   Combat reads the ACTIVE form's frame.
5. **CASTING SEES THROUGH GUISES.** The casting filter treats a guise-capable entity as
   one cast unit: assigning "village elder" to a hag's human form binds the hag,
   crone-form sprite included. A form without an available sprite is a gen-queue want
   (standard casting-miss law), not a blocker.

## Data shape (codex-side; sprite registry unchanged)

```
codexEntity.guise = {
  active: "human-elder",
  forms: [
    { formId:"human-elder", spriteSlug:"spr-…-elder", kind:"human",
      sizeBand:"medium", scaleVsHuman:1.0, statFrame:null },        // social form
    { formId:"crone",      spriteSlug:"spr-…-night-hag", kind:"hag",
      sizeBand:"medium", scaleVsHuman:1.1, statFrame:"night-hag" }, // true form
  ],
  revealState: "hidden" | "suspected" | "revealed",
  driver: "innate" | "spell" | "social",   // wildshape/lycanthropy | polymorph | synth-passing
}
```

`guise_swap` event: `{ npcId, toFormId, witnessed:bool }` — fold/normalize in
`dmFoldPayload` via DM_EVENT_FIELDS like every other event. Witnessed swaps set
`revealState:"revealed"` and log a codex beat; unwitnessed swaps don't.

## Render + true-scale interaction

The theater billboard swaps texture to the active form's sprite at the active form's
`scaleVsHuman` — a druid mid-fight becomes a bear at bear scale (TRUE-SCALE law), a
dragon's human guise walks door-height through human domains and its true form needs a
SCALE DOMAIN (DUNGEON-GRAPH law 2). Mimics swap between the prop channel and the
creature billboard channel.

## Build units (thin; ride existing seams — NOT yet authorized)

- **G1 codex forms + event.** `guise` field on codex records; `guise_swap` in
  DM_EVENT_FIELDS + fold; applyEvent handler flips `active`/`revealState`. Red-first:
  today a wildshaping druid needs a second NPC to change sprites (assert absurdity).
- **G2 casting integration.** Cast-unit = entity incl. forms; missing-form sprite logs
  a gen want. Rides the SPRITE-TAGS casting flow when it lands.
- **G3 theater swap.** Billboard texture+scale swap on `guise_swap` (theater already
  rebuilds billboards; this is a refresh call, not new render tech).
- **G4 DM-CHARTER line.** Reveal etiquette: the DM never announces the mechanic, only
  the fiction; motivated-lies-over-canon already covers a hag lying about what she is.

Dependencies: the registry sizing fold (scaleVsHuman live) for G3's scale swap;
DUNGEON-GRAPH U2 for dragon-scale domains. Natural build window: alongside the NPC
expression pass (expressionSet wiring) — both are sprite↔NPC identity plumbing.

## Open for Adam

1. Lycanthropy on PCs (player-side wildshape/curse) — same system or PC-sheet lane?
2. Does `suspected` do anything mechanical (insight DCs, tell tables) or stay pure DM fiction for v1?
3. Mimic prop-channel swap — worth a dedicated ambush beat in the dungeon semantics pass (U2 room role "mimic-baited treasure")?
