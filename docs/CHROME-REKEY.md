# CHROME Re-Key — neon-slum megacity

**Status: DRAFT — awaiting Adam's taste pass.** Everything below lands PROVISIONAL. No recompiles
run; no generated artifacts touched. Branch `craft/chrome-rekey-draft`.

## The new key (Adam's ruling, 2026-07-08)

Re-key CHROME from generic hard-sci-fi to an **original blend of The Warriors × Ninja Turtles ×
RoboCop** — serial numbers filed off, the vibe never the trademarks:

- **Subway trains** thundering under everything; tunnels and platforms as arteries.
- **Street gangs with theatrical identities** — crews with colors, names, a claimed block.
- **Graffiti as language and territory** — a fresh tag over an old one is a legal document down here.
- **Mutants in the sewers and storm drains** — the heroes and horrors of the margins (splice/mutagen).
- **Corporate super-cops** — a badge that answers to a boardroom, distinct from the beat cop.
- **An ED-209-class enforcement mech** — the walking gun with a handler who speaks for it.

Fifth Element / Demolition Man are **dropped**. This was a **re-key, not a demolition**: most chrome
content "still fits a bit" (Adam) — constructs became enforcement mechs, gangers became crews,
splice-things became sewer mutants, rogue AIs became RoboCop-style corporate oversight minds. The
space-habitat framing (vacuum / airlock / zero-g / hull / station / off-world) is what got rewritten.

## What changed, per surface

### 1. `data/realms.js` — chrome entry (register + voice)  ✅ EDITED
- **register** → "Neon-slum megacity — subway thunder, turf sprayed in code, mutants in the storm
  drains, and a badge that answers to a boardroom."
- **voice** (4) → "a subway rattling the grates below" · "a fresh tag sprayed over an old one" · "the
  servo-whine of a corporate enforcer" · "gang colors that say this block is spoken for"
- **render block unchanged** (teal tint `#3ec8c0` reads as neon-city glow). `check-manifest.py` = OK.

### 2. `Realm Items - Chrome.md` (d50)  ✅ EDITED — full reflavor, mechanics frozen
Frames, ranks, DCs, bands, damage all **unchanged** — only flavor moved from space-habitat to
megacity, so die coverage (verified 1–50, no gaps) and band shares are preserved. Highlights:
- **Kept as-is (survived the key):** the enchanted ladder (Overclock Coil, Null-Static Cloak,
  Ghost-Read Visor, Debt-Ledger Chip, Split-Second Boots, Signal-Ghost Earpiece), both J3b signature
  anchors (**Lance Pistol**, **Falling-Star Visor** — verbatim mechanics), the Mythic root-credential
  d4, The Foreman's Override, The Last Cell, the surveillance drone, the "NON-STANDARD" flag visor.
- **Reflavored (space → street):** boot clamps → gecko climbing pads; boarding winch → rooftop
  grapnel; thruster pack → crowd-control launch harness; hull-foam → barricade-foam; deck plate →
  floor panel; zero-g tether → window-washer tether; worker badge folded into the subway token; the
  root-credential prose (world-engine → grid-mind, traffic mind → subway control mind).
- **New-key signature grounded items (Adam's ask):** row 12 **subway token** (opens more than
  turnstiles — folds the old ID-badge clearance mechanic in), row 5 **gang colors** (a real doer:
  advantage with the crew on their turf, disadvantage the moment rivals clock the patch), row 30
  **spray cans** (tag a held block → advantage on the next Intimidation/reputation check to press
  that turf; mark an unlosable route). The **riot-cop's smart baton** (row 34) and the sewer-workshop
  gadgets (multi-tool, service droid, fabricator resin) were already present and just re-keyed.

### 3. `NPC Role Skin - Chrome.md`  ✅ EDITED — 35-row spine intact, labels re-keyed
Same spine keys 1–35, same weights, same drop/add conventions. Wild-provider stays dropped (no
frontier behind a city wall). Re-skins: Delver → **storm-drain crawler / tunnel-rat** (sewer folk),
Enforcer → **beat cop** (distinct from the corp cop in Adds), Hauler → **subway-freight loader**,
Clothier → **colors-tailor** (gang colors). Adds re-keyed: Corp drone → **Corp cop**, Synth-minder →
**Enforcement-mech handler**, Habitat-warden → **Transit warden**; **added Corner journalist**
(stringer who films everything and sells to whoever's losing).

### 4. `data/realm-bestiary.js` — AUDIT ONLY (models lane owns edits)
Recommendations for the models-lane session; **not edited here.** The chrome bestiary is ~120
creatures across four families that mostly survive the key:

**KEEP (survive as-is — the key was practically built for them):**
- *Gangers / crews (The Warriors):* Chrome-Ganger Grunt/Boss/Lieutenant, Blackout Ganger, Cyber-Ganger
  Warlord, Gutter Splicer Pack, Patch-Kit Ganger, Junker Enforcer, Chrome Rustbelt Marauder,
  Downlink Runner. Read these as costumed crews with colors — perfect.
- *Enforcement mechs / corp cops (RoboCop / ED-209):* Corridor Turret, Riot-Frame Sentry, Patrol
  Drone Pair, Overclocked Enforcer, Riot Suppression Bot, Reprogrammed Bodyguard Unit, Hardpoint
  Sentry Golem, Warlord Chassis Prototype, Bonded Enforcer Colossus, Warhulk Prime Chassis,
  Line Walkers, Overwatch Turret, Sentinel Eyebot. The apex Cores/AIs (THE CENTRAL INTELLIGENCE,
  The Architect, Overmind Legion Core, The Quarantine Mind, Corrupted Oracle Mainframe,
  Recompiled Director) = corporate oversight minds gone RoboCop-villain. All keep.
- *Sewer mutants (Ninja Turtles):* the whole splice/hive line — Larval Splice-Bug, Splice-Grafted
  Brute, Nest-Mother Crawler, Wall-Crawler Splice, Cable-Snake Splice, Splice-Hound, Roach-Splice,
  Lab-Escape Chimera, Apex Splice Predator, Broodmind Xenomorph, Splice Cathedral, Splice Matriarch,
  Xeno Broodfather. These ARE the storm-drain mutants; keep, just steer flavor to sewer/mutagen.

**REFLAVOR (drop the outer-space framing; keep stat block):**
- *"Void"-named breach creatures* — Void Ingress, Void-Spawned Harvester, Voidfall Seed-Drone,
  Void-Drift Larva, Void-Bloom Drone Swarm. Re-key "void/vacuum/hull-latched" → **undercity-breach**
  (the breach mechanic is cross-realm; the hole can open in a subway wall as easily as a hull).
- *"Xeno / xenomorph" wording* → **splice-mutant / mutagen** so the sewer-mutant read is consistent
  (Xeno-Grafted Brute, Xeno-Fused Berserker Frame, Broodship Heart, Hive-Queen Splice).
- *Station/reactor/cargo-deck nouns* → subway/power-plant/tunnel nouns: Reactor-Bound Colossus,
  The Last Battery, Reactor-Core Wraith, Void-Spawned Harvester "cargo decks" → tunnel decks.
- *Signal/comms ghosts* (Signal-Ghost, Static-Choir Wraith, Ghost-Router AI, Malignant Firmware
  Ghost, Data-Wraith Collective) — keep; re-key "intercom/dead comms" → pirate-broadcast / transit-PA.

**REPLACE (weak fit / consider a fresh model to nail the key):**
- Nothing demands deletion. Two soft suggestions for the models lane: (a) the roster leans hard on
  drones/turrets — a **named ED-209-class enforcement-mech "boss"** (a single iconic street-corner
  walking gun) would anchor the RoboCop pillar better than the generic Chassis frames; (b) a
  **heroic/neutral sewer-mutant** archetype is absent (all splice-things are hostile) — the TMNT
  pillar implies at least one mutant that reads as an ally-in-the-margins, if the bestiary ever holds
  non-combat or parley-able entries.

## Open taste questions for Adam
1. **Wild-provider (role skin) stays dropped (0)?** A megacity has pigeon-catchers / drain-trappers —
   want a token weight there, or keep it clean-dropped as "no frontier"?
2. **Gang colors (item row 5) replaced the hard-shell equipment case.** OK to lose that utility row,
   or fold case-protection into another row and keep colors as an add elsewhere?
3. **Subway token (row 12) absorbed the worker-ID-badge mechanic.** Good fusion, or do you want the
   badge back as its own row and the token purely narrative?
4. **"Chrome" as the realm name** — does the label still land under the new key, or do you want a
   rename (e.g. "Grid," "The Sprawl," "Undercity")? Left as "Chrome" (id unchanged) pending your call.
5. **Bestiary:** want me to hand the two REPLACE suggestions (named enforcement-mech boss + an
   ally-mutant) to the models lane as VISUAL-ASSET-QUEUE targets, or hold?
6. **Signature anchors** Lance Pistol / Falling-Star Visor kept verbatim per J3b — confirm they still
   fit the street key (cohered-light sidearm + crash-recorder visor both read fine to me).

## Bestiary asks from Adam (2026-07-08, post-draft)
- **The bat gang** ("those baseball bat guys from The Warriors, so creepy") — a themed gang crew in
  matching face-paint and uniforms, silent, moving as one, bats up: mook squad + a lieutenant. Serial
  numbers filed off (no "Baseball Furies"). Models-lane target alongside the ED-209-class boss and
  the ally-mutant; the three together are the chrome wave's visual asks.

## RESOLVED — Adam's rulings (2026-07-08 night)
1. **The name stays CHROME** — "it still fits."
2. **Gang colors replacing the equipment case: LAW** — "gang colors is law in chrome world."
3. **Subway token / worker-badge fusion: approved.**
Bestiary asks (bat gang, ED-209-class boss, ally-mutant) stand for the models lane.
