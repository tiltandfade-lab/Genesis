# Human Fighter emote pilot v002 — rear-view anatomy rejection

V002 successfully corrected `resting` into the seated field-rest pose and passed all mechanical
gates, including the licensed-compression envelope (`0.756322` of standard state height).

Adam rejected the rear-view hand:

> "his hand is a little weird in the rear view shot, make sure the process screens for that"

The filled `visual-review.json` records `FAIL` for rear-view `anatomyAndHands` and
`equipmentGripAndContact`. Compiling it produces `visualIdentity: FAIL` and
`runtimeAdmission: REJECTED` even though the technical receipt remains green. V003 edits only that
cell and adds an explicit one-hand/one-wrist/plausible-hilt-grip correction. No v002 asset is
runtime-admitted.
