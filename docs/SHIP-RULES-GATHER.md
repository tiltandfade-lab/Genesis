---
type: reference
status: gathered 2026-07-08
source: Ghosts of Saltmarsh (2019), Appendix A "Of Ships and the Sea", printed pp. 186-207
page-index: dev/model-qa/saltmarsh-page-index.json (_pdfOffset +1)
---

# Ship Rules Gather — Saltmarsh Appendix A

**What this is:** a faithful, vision-verified transcription of the SYSTEM content of
*Ghosts of Saltmarsh* Appendix A ("Of Ships and the Sea"). This is a gather, not a spec —
the raw numbers a future `SHIP-TRAVEL` spec will adapt. Per Adam, **these rules are to be
adapted and reused in the main Genesis world**, not treated as Saltmarsh-only content.
Adventure/flavor material (the eight chapters, Random Ships, Mysterious Islands, the three
Underwater Locations) is deliberately out of scope here — only the reusable ship + sea
mechanics are captured.

Every number below was vision-read (the scanned PDF's OCR text layer is unreliable per
house rule); printed page cites are in parentheses.

---

## 1. Ship stat-block anatomy (p. 186)

A ship can't act on its own — without crew effort it drifts, stops, or careens out of control.
A stat block has three parts: **basic statistics**, **components**, and **action options**.

- **Size** (p. 186): Large / Huge / Gargantuan, set by length *or* width, whichever is longer.
  A 20-ft-wide ship is Gargantuan regardless of length.
- **Space**: none unless the block specifies one; a ship that can't fit a space crashes.
- **Capacity**: creatures (crew + passengers) and cargo, in tons. Exceeding cargo capacity
  can stop the ship or prevent it leaving.
- **Travel Pace**: per-hour and per-day distance (see each ship below).
- **Ability Scores**: all six. STR = size/weight, DEX = handling, CON = durability/build.
  INT/WIS/CHA are always **0** (auto-fail any check/save using them).
- **Components**: **Hull** (base frame; ship is *wrecked* when hull hits 0), **Control**
  (steering, e.g. Helm), **Movement** (oars/sails, each with its own speed), **Weapon**
  (each siege weapon is a separate component). Each component has its own **AC** and **HP**;
  a component at 0 HP is destroyed/unusable. Ships have no Hit Dice.
- **Damage Threshold**: if present, a component ignores any hit that deals less than the
  threshold (superficial); it takes damage normally only when a single instance meets/exceeds it.
- **Immunities** (apply to all components unless noted): usually immune to **poison** and
  **psychic** damage, and to conditions **blinded, charmed, deafened, exhaustion, frightened,
  incapacitated, paralyzed, petrified, poisoned, prone, stunned, unconscious**.
- **Actions**: the block lists special actions; a ship *uses actions to move*. The **captain**
  chooses which actions to use; each action option can be used only once per turn.

---

## 2. Sample ships — key stats (pp. 187-195)

All stat-block numbers below are vision-verified.

### Galley (p. 187) — Gargantuan, 130 ft × 20 ft
- Capacity: 80 crew, 40 passengers; cargo 150 tons. **Travel pace 4 mph (96 mi/day).**
- STR 24 (+7), DEX 4 (−3), CON 20 (+5).
- **Actions:** 3 actions/turn (2 if fewer than 40 crew, 1 if fewer than 20; none if fewer
  than 3 crew). Options: Fire Ballistas, Fire Mangonels, Move (may use naval ram as part of move).
- Hull AC 15, HP 500 (damage threshold 20). Helm AC 16, HP 50 (destroyed helm = can't turn).
- Movement — Oars: AC 12, HP 100 (−5 ft speed per 25 damage), speed 30 ft (needs ≥40 crew).
  Sails: AC 12, HP 100 (−10 ft per 25 damage), speed 35 ft; 15 ft into wind; 50 ft with wind.
- Weapons — **Ballistas (4):** AC 15, HP 50 ea, +6 to hit, range 120/480, **16 (3d10) piercing**.
  **Mangonels (2):** AC 15, HP 100 ea, +5 to hit, range 200/800 (can't hit within 60 ft),
  **27 (5d10) bludgeoning**. **Naval Ram:** AC 20, HP 100 (threshold 10); grants the galley
  advantage on crash saves and shunts crash damage to the ram instead of the ship.
- Crew example: crew of 80; captain (bandit captain), 5 officers (scouts), 42 sailors
  (commoners), 12 siege engineers (guards), 20 guards.

### Keelboat (p. 188) — Gargantuan, 60 ft × 20 ft
- Capacity: 3 crew, 4 passengers; cargo 0.5 tons. **Travel pace 3 mph (72 mi/day).**
- STR 16 (+3), DEX 7 (−2), CON 13 (+1). Actions: 2 (1 if only 1 crew; none if no crew).
- Hull AC 15, HP 100 (threshold 10). Helm AC 12, HP 50. Oars: AC 12 HP 100 (−5/25), 20 ft.
  Sails: AC 12 HP 100 (−5/20), 25 ft; 15 into wind; 35 with wind. Ballista: AC 15 HP 50,
  +6, 120/480, 16 (3d10) piercing (combat-fitted only). Crewed by a single bandit captain.

### Longship (p. 190) — Gargantuan, 70 ft × 20 ft
- Capacity: 40 crew, 100 passengers; cargo 10 tons. **Travel pace 5 mph (120 mi/day).**
- STR 20 (+5), DEX 6 (−2), CON 17 (+3). Action: Move only (oars or sails).
- Hull AC 15, HP 300 (threshold 15). Helm AC 16, HP 50. Oars: AC 12 HP 100 (−5/25), 20 ft
  (needs ≥20 crew). Sails: AC 12 HP 100 (−10/25), 45 ft; 15 into wind; 60 with wind.
- Crew example: 40 — captain (berserker), 5 officers (berserkers), 34 sailors (commoners).

### Rowboat (p. 190) — Large, 10 ft × 5 ft
- Capacity: 2 crew, 2 passengers; cargo 0.25 tons. **Travel pace 3 mph (24 mi/day).**
- STR 11 (0), DEX 8 (−1), CON 11 (0). Action: Move (oars). Hull AC 11, HP 50. Oars: AC 12,
  HP 25, 15 ft. Weighs 100 lb; no decks/crew; can be carried. Without oars speed is 0.

### Sailing Ship (p. 192) — Gargantuan, 100 ft × 20 ft
- Capacity: 30 crew, 20 passengers; cargo 100 tons. **Travel pace 5 mph (120 mi/day).**
- STR 20 (+5), DEX 7 (−2), CON 17 (+3). Actions: 3 (2 if <20 crew, 1 if <10; none if <3).
  Options: Fire Ballista, Fire Mangonel, Move (sails).
- Hull AC 15, HP 300 (threshold 15). Helm AC 18, HP 50. Sails: AC 12 HP 100 (−5/25),
  50 ft; 15 into wind; 60 with wind. Ballista: AC 15 HP 50, +6, 120/480, 16 (3d10) piercing.
  Mangonel: AC 15 HP 100, +5, 200/800, 27 (5d10) bludgeoning.

### Warship (p. 194) — Gargantuan, 100 ft × 20 ft
- Capacity: 40 crew, 60 passengers; cargo 200 tons. **Travel pace 4 mph (96 mi/day).**
- STR 20 (+5), DEX 4 (−3), CON 20 (+5). Actions: 3 (2 if <20 crew, 1 if <10; none if <3).
  Options: Fire Ballistas, Fire Mangonels, Move (oars or sails, may use naval ram in move).
- Hull AC 15, HP 500 (threshold 20). Helm AC 18, HP 50. Oars: AC 12 HP 100 (−5/25), 20 ft
  (needs ≥20 crew). Sails: AC 12 HP 100 (−10/25), 35 ft; 15 into wind; 50 with wind.
- Weapons — **Ballistas (2):** AC 15 HP 50 ea, +6, 120/480, 16 (3d10) piercing.
  **Mangonels (2):** AC 15 HP 100 ea, +5, 200/800, 27 (5d10) bludgeoning.
  **Naval Ram:** AC 20 HP 100 (threshold 10); advantage on crash saves, crash damage to ram.
- Sailing-ship/warship crew example (p. 191): captain (bandit captain), 4 officers (nobles),
  25 sailors (commoners); a warship adds 40 soldiers (guards), 8 siege engineers (guards),
  1 priest (surgeon).

**Quick comparison (travel pace):** Longship & Sailing Ship = fastest at 5 mph / 120 mi-day;
Galley & Warship 4 mph / 96 mi-day; Keelboat 3 mph / 72 mi-day; Rowboat 3 mph / 24 mi-day.

---

## 3. Officers and crew (pp. 194-196)

Only the **captain** role is mandatory for a ship to function; a ship needs a single person
to issue orders or it risks chaos in a crisis. Six officer roles, each keyed to an ability +
proficiencies (p. 194-196):

| Officer | Wants high | Proficiencies |
|---|---|---|
| Captain | INT & CHA | water vehicles, Intimidation, Persuasion |
| First Mate | CHA | Intimidation, Persuasion |
| Bosun (boatswain) | STR | carpenter's tools, Athletics |
| Quartermaster | WIS | navigator's tools, Nature |
| Surgeon | INT | herbalism kit, Medicine |
| Cook | CON | brewer's supplies, cook's utensils |

**Crew quality score** (p. 196): a crew's skill/experience/morale/health as one number.
Starts at **+4**, ranges **−10 to +10**. Rises with morale/good care/leadership; falls with
casualties, hardship, poor health. Used as the modifier on crew group-check d20 rolls and
as ship initiative modifier.

- **Loyalty & Quality (optional, p. 196):** convert a quality score to an individual's loyalty
  by adding 10 (DMG optional loyalty rule).
- **Mutiny (p. 196):** once/day, if quality < 0 the captain makes a CHA (Intimidation or
  Persuasion) check modified by the quality score. Total 1-9 → quality −1. Total ≤0 → **crew
  mutinies** (hostile; may kill/imprison/throw overboard officers). Cowing the mutiny with
  violence/bribes/rewards ends it and raises quality by 1d4.
- **Shore Leave (p. 196):** if quality ≤ 3, each day spent in port raises quality by 1.

---

## 4. Superior ship upgrades (pp. 196-198)

Cost: **15,000 gp + 1d4 weeks of work**, ship must stay in port; leaving restarts the work
(but the gp isn't paid twice). Categories & slot limits:

- **Hull upgrades** (one): Churning Hull, Death Vessel, Frost-Locked Hull, Living Vessel,
  Reinforced Hull (doubles hull HP max), Vigilant Watch. (p. 196-197)
- **Movement upgrades** (one per movement type): Clockwork Oars, Ever-Full Sails,
  Defiant Sails, Dragon Sails (+3 AC + damage resistance by dragon color — table p. 197),
  Screaming Sails, Scything Oars. (p. 197)
- **Weapon upgrades** (one, or two if one is Arcane Artillery): Arcane Artillery (+2 attack/
  damage, magical), Concussive Rounds, Explosive Rounds (+2d6 fire), Grasping Rounds. (p. 197)
- **Figurehead upgrades** (one): Guardian, Red Dragon, Storm Giant. (pp. 197-198)
- **Miscellaneous upgrades** (any number, each once): Bones of Endless Toil, Smuggler's Banner,
  Taskmaster's Drums. (p. 198)

---

## 5. Ships in combat (pp. 198-199)

- **Initiative (p. 198):** the ship rolls initiative using its **DEX**, modified by the crew's
  **quality score**. On its turn the captain decides which actions to use.
- **Special officer actions (p. 198):** during an encounter the **captain, first mate, and
  bosun** each get two options —
  - **Take Aim:** as an action, direct fire for one weapon within 10 ft of the officer; that
    weapon has advantage on its next attack before the end of the ship's next turn.
  - **Full Speed Ahead:** as an action on deck, roll 1d6 × 5 and add that to the ship's speed
    until the end of its next turn (bonuses don't stack — take the higher).
- **Crew in combat (p. 198):** don't track individual sailors; assume crew is split evenly
  among the top two decks. **Crew casualties** reduce the number of actions a ship can take —
  killing crew is a valid tactic. Area spells: roll 1d6 per spell level (or track exactly) to
  see how many crew are caught.
- **Crashing a ship (p. 199):** a ship crashes when it moves into a creature/object's space
  (avoided automatically if that thing is ≥2 sizes smaller). On a crash the ship makes a
  **DC 10 CON save**; on a failure it takes hull damage by *its own size* (Crash Damage table)
  and stops if the obstacle is one size smaller or larger. A creature struck makes a **DEX save
  DC 10 + ship's STR mod**, taking the crash damage (half on success).

**Crash Damage (bludgeoning), by ship size (p. 199):**

| Size | Damage |
|---|---|
| Small | 1d6 |
| Medium | 1d10 |
| Large | 4d10 |
| Huge | 8d10 |
| Gargantuan | 16d10 |

---

## 6. Travel at sea (pp. 199-200)

Rules for voyages of an hour or more, building on PHB/DMG travel.

- **Travel Pace (p. 199):** ships move at the speed in their stat block; **they can't choose
  to go faster** (only slower). If a movement component is damaged: for every **−10 ft of
  speed, reduce travel pace by 1 mph and 24 mi/day.**
- **Activity while traveling (p. 199):** party pace doesn't affect these. Anyone: **Draw a Map**
  (captain, no check, helps recover if lost), **Forage** (WIS/Survival check). Role-restricted:
  **Raise Morale** (first mate only — once/24 hr, if quality ≤ 3, DC 15 CHA/Persuasion → +1
  quality); **Navigate** (quartermaster only — WIS/Survival vs. becoming lost).
- **Noticing Threats (p. 200):** use the PCs' passive Perception, or the crew's passive
  Perception = **10 + quality score**.
- **Repair (bosun only, p. 200):** at end of day, STR check w/ carpenter's tools; DC 15+ →
  each damaged component regains **1d6 + quality score** HP (min 1). A non-hull component that
  was at 0 HP becomes functional again.
- **Stealth (captain only, p. 200):** only when weather restricts visibility (e.g. heavy fog);
  ship makes a DEX check + quality score to hide.

---

## 7. Hazards procedure (pp. 200-202)

Sea travel is innately dangerous. Hazards are resolved with a **special group check**: the
hazard's entry says which officers may contribute; the non-officer crew make **one** d20 roll
modified by quality. Group-check rules (p. 200): only the captain can make a captain's check,
no one can aid an officer's check. Hazards yield **four outcome tiers** — Total Success (all
rolls succeed), Success, Failure, Total Failure (all rolls fail).

**Determining hazards (p. 200):** at the **start of each day** roll a **d20**; on a **20** the
ship faces a hazard. Then:

**Hazard Type (d20):** 1-3 Crew conflict · 4-6 Fire · 7-9 Fog · 10-12 Infestation · 13-20 Storm.

**Hazard DC (d20):** 1-9 → DC 10 · 10-17 → DC 15 · 18-19 → DC 20 · 20 → DC 25.

Each hazard type has its own contributing officers, its own DC descriptor table, and its own
results table (all pp. 200-202):

- **Crew Conflict (p. 200):** officers Captain, First Mate, Cook. DC descriptors: 10 minor
  scuffle/petty theft · 15 brawl/theft of valuable · 20 large brawl w/ injuries · 25 murder /
  serious brawl. Results: Total Success +1 quality 1d4 days & ends · Success ends · Failure −1
  quality · Total Failure −1 quality **and crew immediately mutinies**.
- **Fire (p. 201):** officers Captain, First Mate, Bosun, Surgeon (group check = 5 min work).
  DC: 10 oil-lantern · 15 campfire/multiple · 20 bonfire, may spread · 25 flammable-cargo hold.
  Results scale up to hull + 1d3 components taking **6d6 fire** and the fire continuing / −1
  quality on Total Failure.
- **Fog (p. 201):** officers Captain, Quartermaster. DC: 10 light · 15 moderate · 20 heavy ·
  25 very heavy. Results: slows ship to half pace on Failure; Total Failure also sends it in a
  random direction.
- **Infestation (p. 202):** officers Captain, First Mate, Surgeon, Cook. DC: 10 common cold ·
  15 stomach ailment/flu · 20 contagious flu/spoiled food · 25 lethal plague. Failure −1
  quality; Total Failure also forces half speed that day.
- **Storm (p. 202):** officers Captain, First Mate, Bosun, Quartermaster. DC: 10 heavy gale ·
  15 strong storm · 20 typical hurricane · 25 overwhelming hurricane. Failure: each component
  takes **4d10 bludgeoning**, −1 quality, half speed. Total Failure: **10d10** per component,
  −2 quality, **10% of crew washed overboard/lost**, random direction.

---

## 8. Ocean environs — hazard menu (pp. 202-206)

Environmental features, each with its own numbers (system-relevant highlights):

- **Blue Holes (p. 202-203):** circular sinkholes, diameter & depth 1d10×100 ft; "Hiding in
  Blue Holes" d10 table of occupants/treasure.
- **Coral Reefs (p. 203):** forced movement onto reef = **1d6 slashing per 5 ft** pushed.
- **Currents (p. 203):** tidal (within 50 mi of shore, <300 ft deep) speed 1d6 mph; deep-ocean
  1d4−1 mph. Add current speed when moving with it, subtract against; fighting a current = half
  pace + CON save each hour (DC 10 + miles/hour of current) or −1 quality / 1 exhaustion.
  Submerged non-swimmers get pulled 1d4×5 ft/round.
- **Depth (p. 203):** illumination zones — **Sunlight** 0-650 ft, **Twilight** 650-1,000 ft,
  **Midnight** below 1,000 ft. Pressure/temperature worsen with depth; optional **Objects and
  Water Pressure** destructive-depth table (glass/crystal/ice 100 ft, wood/bone 500, stone
  1,000, iron/steel 1,500, mithral 2,000, adamantine 2,500).
- **Eldritch Mist (p. 204):** d6 → Ghost Fog / Shadowfell Fog / Wild Magic Fog. **Mist
  Thickness** d10 (light/moderate/heavy/very heavy) with a heavily-obscured-distance table
  (30/20/10/5 ft).
- **Kelp Forests (p. 204):** difficult terrain, heavily obscured beyond 10 ft.
- **Kraken's Grave (p. 205):** DC 14 DEX (Stealth) to avoid a lightning-tendril (10/3d6
  lightning + DC 14 CON or blinded).
- **Lure Lights (p. 205):** DC 14 WIS save or charmed 24 hr; AC 17, HP 100.
- **Magical Storms (p. 205):** on a magical storm, d8 school (abjuration…transmutation) each
  with a distinct effect (teleport, air elementals, disadvantage, crew casualties, etc.).
- **Sandbars (p. 205-206):** passive Perception 12 to spot; DC by depth (10 deep / 15 moderate
  / 20 shallow); a stuck ship uses an action + STR check (bonus = quality) vs. the DC.
- **Sapping Snow (p. 206):** DC 15 CON or 10 (3d6) necrotic + HP-max reduction until long rest.
- **Shipwrecks (p. 206):** d10 "Shipwreck Contents" table of monsters/treasure.
- **Whirlpools (p. 206):** **Whirlpool Rank** table — Rank 1 diam 22 ft / vel 5 / DC 5;
  Rank 2 55 ft / 15 / 10; Rank 3 110 ft / 25 / 15; Rank 4 165 ft / 35 / 20. Depth = half
  diameter. Creatures make STR (Athletics) vs. rank DC; vessels caught in a whirlpool wider
  than their length run the hazard group check to escape.

---

## 9. Encounters at sea (p. 207)

- **Random encounter procedure (p. 207):** each day of a voyage, in addition to the hazard
  roll, roll a **d20**; on **19-20** the ship has a random encounter (a day can carry both a
  hazard and an encounter).
- **Open Water Encounters (Levels 1-4)** d100 table (p. 207): quippers, dolphins, giant
  octopus, killer whales, merfolk, giant crabs, reef/hunter/giant sharks, sahuagin (various),
  koalinth, harpies, sea hags, plesiosaurus, young bronze dragon, and **76-00 "a ship
  (generated at random)"** — the hook into the Random Ships tables (p. 208, out of scope here).
  Higher-level open-water tables continue past p. 207.

---

## Adaptation notes for the future SHIP-TRAVEL spec

- The **quality score** (−10..+10, start +4) is the spine of the whole subsystem — it is the
  crew's single stat and the modifier on every group check, initiative, passive Perception, and
  mutiny check. Genesis already has a crew/NPC quality analog worth reconciling before adopting.
- The **daily loop** is clean and script-ownable: start-of-day d20 for hazard (20 = hazard),
  d20 for encounter (19-20), then a group check resolved to one of four tiers. This maps well
  onto Genesis's engine-rolls-atoms / DM-owns-meaning split.
- **Ship-as-multiple-components** (hull/control/movement/weapon, each with AC/HP/threshold) is
  heavier than Genesis's current single-object model — decide whether to keep component
  granularity or collapse to hull + a movement stat for v1.
- Numbers to lift near-verbatim if adapting: travel paces, crash-damage-by-size, whirlpool rank
  table, hazard type/DC tables, upgrade cost (15,000 gp / 1d4 wk).
