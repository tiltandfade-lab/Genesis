---
type: review-notes
status: Adam's second PROVISIONAL-table review pass (2026-07-03) — the realm-item tables + the Note-column sweep. BINDING inputs to the realm-table craft unit. UNCOMMITTED until clean-close (graphics session live in the same tree).
created: 2026-07-03
---

# Adam Review 2 — realm items: the Note-column ruling + hook direction law

Follows the ADAM-REVIEW-1 §3 protocol: Adam dumps, Fable scans/classifies, verdicts land
here, batch plans absorb. PROVISIONAL flags come off only when a pass is logged.

## §0. The sweep (what was measured)

Fable ran a 3-agent classification over all 11 realm-item tables (~550 rows) + a wiring
trace. Note-column taxonomy: A mechanical · B inspectable · C omniscient lore (unknowable
from the object) · D hook-claim (asserts a live quest state) · E DM-voice aside.

- **~38% of rows carry a C sentence** (Chrome/Frontier ~26% → Ash 44%, Noir/Gloom/Suburb ~46–48%).
- **Positional, not random:** Grounded rows (1–12, 28–33) are disciplined A/B in every
  realm; the enchanted/signature block (~rows 37–48) runs 80–100% C-dominant.
- **Template-deep tic:** "Every [owner] who's held it…" ~29× · "Nobody's ever…" ~47× ·
  "last three owners / outlived N owners" ~15×. Five near-verbatim cross-realm clones
  (one noun swapped): compass HS37/LW37 · rosary HS38/LW38 · truth-ledger HS47/Noir47 ·
  shears LW42/Suburb43 · stealth-boots Gloom39/LW39/Noir42.
- **Hook-claims (~30 rows): only 4 mechanically backed** — and 3 of those are the same
  structural slot (row 48 Volatile signature) + 1 Mythic (LW r27).
- **Wiring:** tables compile (Note survives as `cells[4]`, but also merges into the
  player-visible `row[3]` text) — **no draw function exists yet.** The epistemics seam is
  still unwritten.

## §1. THE HOOK DIRECTION LAW (Adam's ruling)

**Default direction: the QUEST points at the ITEM.** The hook architecture must be able
to APPLY adventure significance to any item in the game (the Fallout junk-retrieval
pattern — an NPC wants ten empty bottles; the bottles are just bottles). Items do NOT
ship with adventure baked in — unless the mechanics and wires are baked in WITH it.

**Item-points-at-quest is the rare, considered direction** — reserved for a handful of
select items that could seed genuinely interesting quests, and only with supporting
architecture: backed mechanics + a captured thread (codex origin-tag on mint, the same
RESURFACE machinery as walk-Mythic Plot Items). Never as floating prose.

**Build implication (engine-ownable, anti-drift):** a WANT-HOOK generator — script rolls
wanter (ambient pool / codex NPC) + want (item class/count off `data/items.js` + realm
tables) + reward; points at existing item defs. Confers significance on dumb objects
without touching their rows. Slots into JOB-WALKS / the board. → queue as a spec-first
unit; NOT part of the table rewrite itself.

## §2. The Note-column register ruling

1. **Notes drop to A/B register** — mechanics + inspectable detail. What the core SRD
   does; provenance is the world's job, not the item's.
2. **C (omniscient lore) is cut or converted to inspectable.** The sanctioned way to keep
   mystery = Lost-World r34's pattern: provenance as EVIDENCE IN THE OBJECT ("the
   handwriting suggests the ritual was left incomplete deliberately") — the player can
   find it, the DM doesn't have to know it.
3. **No templates. Unique means unique.** The three formulas (§0) are banned
   constructions; the 5 clone pairs get re-authored per-realm. Related-and-collectible
   SETS (the Outlandish figurines model) are fine when intentional — that's a set, not a tic.
4. **Quality bar: Gemini's Outlandish d300 = the calibration standard** ("really
   understood the assignment"). The current realm tables are "okish." The interesting-
   mechanic register is the target (e.g. the gloves that keep a plant alive through a
   drought). Re-author toward that, not toward atmospheric wallpaper.
5. **D (hook-claims): stripped everywhere EXCEPT the storied-item slots (§3),** where
   they must be backed.

## §3. THE PLOT-ITEM SPLIT (Adam's ruling, 2026-07-03 — supersedes the earlier
## storied-slot-budget draft of this section)

Ruled during the 5-band sample review: **"an item that DOES something is loot; an item
that POINTS somewhere is a plot item."** A split between plot items and the loot tables
is warranted:

- **The realm d50s hold DOERS only** — complete, self-contained mechanics. No row may
  bill the DM for a quest.
- **POINTERS (maps, files, charts, matchbooks, sealed orders — "adventure food") extract
  to a separate per-realm PLOT-ITEM category** — real, specific quest items minting
  through the EXISTING Plot Item machinery (codex origin-tags / RESURFACE, the walk-Mythic
  top-band doctrine). That table is its own unit, specced after the loot re-author;
  extracted pointer concepts park in `REALM-PLOT-ITEMS-PARKED.md` meanwhile.
- **Mythic r27 stays in-table only when the item ITSELF does the thing** (seed vault
  greens the wasteland, parish bell returns one dead, hymn closes a breach). Document-y
  Mythics (the case file) are plot items and move out.

### §3b. Authoring coherence laws (from the same pass)

1. **Wired-physics only.** Mechanics may reference the 7 breach physics tags
   (`techWorks/magicDim/lowGrav/timeSlip/huntRules/stageRules/dreamRules`,
   src/engine/breach.js BREACH_PHYSICS_VOCAB), core SRD machinery, or real engine
   entities (breach-touched/realm-tagged, faction clocks, chase, rests). No mechanic may
   imply an unwired system (the irradiated-ground catch).
2. **Cross-breach compatible.** R1 works anywhere; realm-conditional effects ride only as
   bonus rungs.
3. **No undefined referents.** "Something answers" is banned; name what answers or cut the row.
4. **Mechanical coherence.** Every mechanic must physically work as written (the
   no-camera-scout catch).
5. **Volatile slots = items whose possession is live danger.** "Happening RIGHT NOW"
   event rows are the Walk Breach/Nightmare lane's job, not loot.
6. **Pressure over plot.** Items may turn up heat self-contained (the noir police radio
   standard); they may not require a quest built around them.
7. **Agency over destiny.** Where prose promised fate, give the player the verb (you
   inscribe the bullet's name yourself).
8. **Register:** mechanics are the payload; pop-culture recognizable-but-unbranded in
   realm tables (the d300 keeps the named-brand lane); one joke row per table is licensed
   (the figurine precedent). Fable authors; not delegated.

## §4. The epistemics seam (pre-ruled at the wiring point)

When the realm-item draw function gets written: **Item cell → player-facing fields; Note
cell → DM digest only.** The compiled merged-text (`row[3]`) must NOT be the player
surface for these tables. (Matches the `rollLoot` fields/dm split pattern,
src/engine/codex-roll.js.) With §2 applied the Note is mostly mechanics anyway — but the
seam ruling stands regardless.

## §5. What this absorbs into

- **Realm-table re-author unit** (the 11 d50s): apply §2 + §3; dedupe clones; Gemini bar.
  Voice-critical → samples-first protocol if agent-drafted; Adam reviews before full pass.
- **WANT-HOOK spec** (§1) — new unit, spec-first, talked through with Adam before build.
- **Draw-function wiring** (§4) — rides whatever unit wires realm-item draws (BREACH §2d).
- PROVISIONAL flags on the 11 realm tables STAY ON until the re-authored versions pass
  Adam's skim.

## §3c. The frame doctrine (Adam's ruling, 2026-07-03 — the "can I wear the trail map?" catch)

Frames have two tiers. **Tier 1 — visible equipment (the BG3 slots):** body armor/clothing,
boots, gloves/gauntlets, headwear, weapons (+shields). These MUST ride true frames — they're
wearable/wieldable, and eventually renderable on a model. **Tier 2 — everything else is
pocket inventory:** it needs a plausible chassis for weight/price only and does NOT attach to
the body. Map truer mundane defs where the match is one-glance obvious (rope→rope, caps→
firearm bullets); don't over-polish trinkets; a residual `robe` on a pebble is tolerable
because the durable fix is code-side: **a future equip-layer guard** — only tier-1 def classes
are body-slot equippable, period. (Queued as a small unit; rides whatever next touches the
equip path. Until then the exposure is cosmetic, not mechanical.) The 2026-07-03 frame-audit
sweep applied this across all 11 realm tables; charge-consumable frames (fusion cells,
Long-Nines) were flagged-not-changed pending a `rustImmune` load-bearing check.

## §7. The corpus audit (2026-07-03, post-re-author) — rework candidates beyond the realm tables

Two background agents swept the wired corpus through the §3 doer/pointer lens (both
directions: vague-where-hooks-belong AND hooks-that-don't-cash). Full reports in the session;
the durable findings:

**Standard-setters (copy from, don't touch):** Plot Item (~95% cashable Opens/Proves — the
schema the realm plot-item tables clone) · Plot Lock (~98%) · NPC Job Board · Place-Secret ·
Distant Word's Distortion architecture (rows bind real ledger facts at roll time — the model
capture pattern) · Place Drift + Downtime Ledger's Effect/Payout-hook columns.

**Cleared as intentional openness (do NOT rework):** Walk Skin ×3 (under-specification IS the
lens contract) · Walk Breach ×3 (the offstage-presence register is Adam's own approved voice;
grants + physics tags carry mechanics) · Chase Complications (has its own anti-invention
clauses).

**The rework program (ranked, pending Adam's ruling):**
- **A. Full re-authors:** 1. Urban Rumor Intel (~50% vague; unwired campaign-scale
  mega-reveals; superseded by Distant Word's binding architecture — rebuild through it or
  retire). 2. Dungeon Revelation rows 1–74 (one-line vibes below the rows-75–100 mechanical
  standard; LOAD-BEARING: Myth Seeds' affinity columns index into the vague half). 3. NPC Hook
  (~10 marsh/harbor setting-locked dead rows + an undefined-"something" final decade).
- **B. Fold into the WANT-HOOK spec:** the legacy quest-scaffold d20s (Macguffin, Destination,
  Complication, Urgency — 30–55% cashable). They are hand-sketches of that generator's axes;
  rebuild as its dials, not as standalone content.
- **C. Structural tag-pass:** NPC Life Event — the only drift-family table with NO capture
  column; add Place Drift's Effect column + bind its 8 undefined-referent rows.
  Dungeon Loot – Valuables — ~10 Textured pointer rows get the §3 extraction; folds into
  Adam's already-pending craft pass (status: draft).
- **D. One surgical batch (~30 rows total):** Distant Word 9 costume-Color rows (bind or
  deflate) · Shrine & Omen ~10 urgent-omen rows (bind to faction clocks/outcomes) · Festival
  5 promise-withholding rows (supply payload or end before the promise) · Truth vs False r18/r20
  (mint the carrier) · 4 single-row sharpens (Walk Nightmare Dungeon r2, Wilderness r6,
  In-Building r15/r28).

## §6. Session-collision note

Logged from a session running parallel to the graphics/model session (2026-07-03). This
file is intentionally uncommitted — no branch ops, no module edits, no compile runs from
this session. Commit at the next clean-close.
