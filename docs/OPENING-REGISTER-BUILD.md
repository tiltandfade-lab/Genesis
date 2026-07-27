---
type: build-spec
status: SPECCED
unit: feat/opening-register
base: fix/tiyl-entry-wiring (fa7a6fdb)
design-authority: "docs/TIYL-START-DIVERSITY.md (RULED — all four §6 questions answered by Adam 2026-07-27)"
---

# OPENING-REGISTER-BUILD — the build unit for TIYL-START-DIVERSITY

Design rationale lives in `docs/TIYL-START-DIVERSITY.md`; this file is the executable unit.
Decisions are RULED — do not re-litigate: weights 25/25/30/15/5 locked; no player lean;
WRONG rows realm-honest archetypes only; MYTHIC rows may permanently mark the world.

## §1 Files and anchors (verified against fa7a6fdb)

1. **`data/starting-state.js`** — the live inline source (classic script global, no logic).
   Add to the `SS` const, directly after `eStanding` (the last entry-triplet table):
   - `eRegister` — d100 band table.
   - `eNowMedias` — d12 IN-MEDIAS-RES situation table.
   - `eNowWrong` — d12 WRONG situation table.
   - `eNowMythic` — d6 MYTHIC cold-open table.
   Row shape matches the EB convention `[lo,hi,text,band]` where `band` is the player-facing
   juice tag; `eRegister` rows are `[lo,hi,key]` with keys `"settled"|"edge"|"medias"|"wrong"|"mythic"`
   and bounds exactly `1–25 / 26–50 / 51–80 / 81–95 / 96–100`.
2. **Engine markdown source** — per the file-header convention ("mirror of
   Engine/.../Starting State/*.md"; EB cites `Starting State - Opening Bundle.md`): author
   `Opening Register.md` in the SAME Engine folder the existing Starting State tables live in
   (find it with `ls "Engine/03. _Tables"` — do not guess the path; match the sibling files'
   table format exactly). The markdown is the editable source of record; the JS is the live
   mirror, same as every SS/EB table. Do NOT run the table compiler for this unit.
3. **`src/engine/world-gen.js` — `rollEntry(w,c)` (currently line 78).** Wiring, in ordered
   steps:
   a. FIRST LINE of the function body: roll the register — `const reg=rollTbl(SS.eRegister)`,
      band key = `reg.text` (rollTbl's text field carries the key column).
   b. Steps 1–5 (seeds, factions, proximity, tension, bundle) run UNCHANGED.
   c. Situation roll, after the bundle: `medias`→`rollTbl(SS.eNowMedias)`,
      `wrong`→`rollTbl(SS.eNowWrong)`, `mythic`→`rollTbl(SS.eNowMythic)`; `settled`/`edge`→none.
   d. `c.entry.register = {band:<key>, roll:reg.roll, situation: s?{text:s.text,juice:s.band}:null,
      live: band!=="settled"}` — exact shape; `live` is the tension-promotion flag
      (ARRIVAL-WITH-EDGE and hotter = the opening tension is present-tense).
   e. The existing `foot` roll stays for ALL bands (what's true of your situation in town);
      hot bands ADD the situation on top — they do not replace the triplet.
   f. The closing `addLedger(...,{kind:"entry",...})` line gains the band:
      `…arrives ${why}…` becomes `…` + (register.band!=="settled" ? ` Opening register:
      ${band}${situation?" — "+situation.text:""}.` : ``) appended to the existing string —
      keep the existing sentence intact, append only.
4. **Consumers.** `grep -rn "\.entry\b\|entry\.register\|renderOpening\|charHandoff" src/`
   and surface the register wherever the why/foot/standing triplet is already shown
   (`src/world/render.js` renderOpening, `src/world/handoff.js` charHandoff are the known
   two — there may be a third; trace, don't assume). Match each surface's EXISTING
   presentation convention for the triplet exactly (same visibility, same fragment/juice
   styling); a hot band shows its situation text with its juice tag the same way EB rows
   show theirs. Do not invent new UI.
5. **`docs/DESIGN.md`** — one dated entry: the four §6 rulings (with Adam's 2026-07-27
   answers), the fenced one-time spice-bend law (minute zero only, never a precedent for
   time-escalation), and the v1 scoping note (class-blind; leans arrive only if/when
   TIYL-WEIGHTED-STARTS is adopted). Match the entry format used by the fa7a6fdb entry.

## §2 Table content (author the rows; gold exemplars set the bar)

All rows are realm-adaptive archetypes — no proper nouns, no genre-specific technology, no
realm-violating imagery (RULED: realm-honest). Draw material shapes that the DM can bind to
the TIYL life events already rolled (the tragedy's author, the rolled enemy, the dead kin).

- **`eNowMedias` (d12, juice Textured except rows 11–12 Strange).** Verbs mid-flight, danger
  clock live. Gold exemplars (rows 1–2, use as written):
  1. "the rope is in your hands and fraying, and the shouting below is getting closer"
  2. "the building you woke in is on fire, and the door is not where it was last night"
  Remaining 10: a chase mid-stride (you are the quarry), an ambush already sprung, rising
  water, standing over a body as voices approach, a caravan under attack, a cliff ledge at
  night, a cell door left open, a riot igniting around you, a hunt where you are beating the
  bushes, a theft going wrong in your hands — one per row, same voice.
- **`eNowWrong` (d12, juice Strange).** States, not violence; player unhurt, questions armed.
  Gold exemplars:
  1. "you are dressed for a ceremony you don't remember, and everyone is waiting on you"
  2. "the town is silent at noon, and every door on the street stands open"
  Remaining 10 in the same register (funeral that is yours, strangers who all know your name,
  a mark that appeared overnight, the same face on different people, etc.).
- **`eNowMythic` (d6, juice Mythic).** World-grade, and each row is written so acting on it —
  or ignoring it — legitimately marks the world forever (RULED: permanence allowed; "let the
  game be weird"). Gold exemplar:
  1. "the sky has a seam in it tonight, and you are the only one looking up"
  Remaining 5: same weight, no two alike in kind (celestial, chthonic, temporal, communal,
  personal-apotheosis).

## §3 Out of scope (executors do not expand)

- Class/background weighting of the register (TIYL-WEIGHTED-STARTS is unadopted; v1 is a
  uniform d100).
- Any player-facing lean/dial (RULED no for now).
- Changes to ambient spice, walks, hometown/starting-location semantics, or the DM bridge
  prompt contract beyond surfacing the new entry fields.
- Rewording any existing eWhyHere/eFoot/eStanding row.

## §4 Verification (numbered; ⊗ = prove red first)

- **V1 ⊗** `dev/verify-opening-register.mjs` (new; copy the jsdom bootstrap from
  `dev/verify-tiyl-entry.mjs`, same repo conventions): 300-entry census over fresh
  world+character creations — (a) all five bands appear; (b) observed band shares within
  ±6 points of 25/25/30/15/5; (c) never assert fixed RNG positions (assert shape only).
  RED-FIRST: run the harness on the base commit BEFORE wiring — it must fail on
  "register absent"; record the red output in the report.
- **V2 ⊗** Same harness: `medias`/`wrong`/`mythic` entries always carry `situation` with the
  correct juice tag and `live:true`; `edge` carries `live:true` + `situation:null`; `settled`
  carries `live:false` + `situation:null`. RED-FIRST via V1's pre-wiring run.
- **V3** Ledger check: the entry ledger line for a hot-band character names the band and
  situation; a settled character's line is byte-identical in shape to pre-unit output.
- **V4** Legacy guard: a `c.entry` WITHOUT `register` (pre-unit save shape) renders through
  every consumer found in §1.4 without throwing — add the fixture to the harness.
- **V5** `python3 build/check-manifest.py` ends `RESULT: OK`; then the full sweep by exit
  code: `for f in dev/verify-*.mjs; do node "$f" >/dev/null 2>&1 || echo "❌ $f"; done`
  (bridge .py harnesses excluded; never run verify-bridge.py).
- **V6 acceptance** — rerun the 12-start batch protocol (adapt
  `/private/tmp/claude-501/-Users-adamstephenson-Desktop-Work-projects-Genesis/589ad7ff-ea0a-40c8-8fcd-90b141422348/scratchpad/tiyl-runner.mjs`
  into `dev/acceptance-opening-register.mjs`, 12 starts, all 12 classes): the deliverable is
  the same opening-scene table as `docs/intel/tiyl-starts.md` §3.1 with band + situation
  columns added — the monoculture must be visibly broken. Include the full table in the
  final report.

## §5 Branch

Work in THIS worktree (`Genesis-tiyl`) on `feat/opening-register` branched off
`fix/tiyl-entry-wiring` (stacked — the base commit is fa7a6fdb, which this unit's rollEntry
edits sit on top of). Commit on the branch; do NOT merge, do NOT push — the orchestrator
gates and lands.
