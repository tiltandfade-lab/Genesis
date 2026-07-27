# TIYL batch roll — what minute zero is actually like

Twelve complete "This Is Your Life" character starts, rolled headlessly against the BUILT
engine (not the unbuilt TIYL-WEIGHTED-STARTS spec), to answer: what does the dice chain
actually put on the table at minute zero, and what would the visual layer need to show?

## 1. Method

**Script:** `/private/tmp/claude-501/-Users-adamstephenson-Desktop-Work-projects-Genesis/589ad7ff-ea0a-40c8-8fcd-90b141422348/scratchpad/tiyl-runner.mjs`
**Raw evidence (full, unedited roll output for all 12 starts):**
`/private/tmp/claude-501/-Users-adamstephenson-Desktop-Work-projects-Genesis/589ad7ff-ea0a-40c8-8fcd-90b141422348/scratchpad/tiyl-raw.json`

**Repro:**
```
cd /Users/adamstephenson/Desktop/Work/projects/Genesis/genesis
node /private/tmp/claude-501/-Users-adamstephenson-Desktop-Work-projects-Genesis/589ad7ff-ea0a-40c8-8fcd-90b141422348/scratchpad/tiyl-runner.mjs > out.json
```
(Real dice — `Math.random()`, no seeding. Each of the 12 runs boots a fresh `jsdom` window,
so re-running produces a *different* 12 starts; that's intentional — the deliverable is the
shape of the distribution, not a fixed replay.)

**What the runner drives, and why that's the real chain (not a stand-in):**

- Loads `manifest.json`'s real `loadOrder` + the compiled `tables.js` into `jsdom`, exactly
  the technique `dev/playtest-bridgeless.mjs` and `dev/verify-place-tiyl.mjs` already use to
  exercise production code headlessly (per `CLAUDE.md`'s own documented harness pattern).
- Character picks (species/class/background) → `cgRollScores()` → class skills/kit/spells,
  same calls `dev/playtest-bridgeless.mjs`'s `cmdInit` uses.
- **The full TIYL life chain** via `cgRollLife()` (`src/creator/life.js`) — the one-shot
  version of the same tables the guided bardo UI walks one beat at a time via
  `cgLifeStepRoll()`; same `CG`/`CG_BG`/`CG_CLASS` tables (`data/character-genesis.js`),
  same resolution logic (branch-picks, inline dice, life-event seeds). Not a shortcut around
  the mechanic — the pacing is the only thing skipped.
- **The bardo hometown beats** via `rollTable("place-master-setting")`,
  `rollTable("place-history")`, `rollTable("place-mythology")` — the exact compiled-table
  calls `bardoRollHometown()` makes (`src/creator/bardo.js:108-110`).
- **The world-genesis STAGES loop** (`master`/`smell`/`sound`/`arch`/`taboo`/`nearby`/`myth`/
  `faction`/`pressure`) via `lookup()` against `data/world-tables.js`'s `T` — the same rolls
  `bardoRollWorld()` fires for each `WORLDBEATS` entry.
- `bindWorld()` (`src/world/play.js`) then `cgBind()` (`src/creator/sheet.js`), which itself
  calls `rollEntry(w,c)` (`src/engine/world-gen.js`) — the why-here / on-what-foot / standing
  triplet, the opening-tension pressure pick, and the 5-slot opening bundle
  (enemies/friends/complications/things/places).

**Nothing in the chain failed headlessly.** All 12 runs completed end-to-end on the first
correctly-wired attempt. Two *harness* bugs surfaced and were fixed before the recorded
batch (both are runner plumbing, not engine gaps — noted for transparency, per this
project's "prove everything" rule):
1. `ALL_SKILLS` (needed for the Bard's "choose any" skill list) wasn't exposed from the
   `jsdom` window at first — `CLASS_SKILLS.Bard.from==="all"` threw. Fixed by adding it to
   the harness's `EXPOSE` list.
2. The first cut read `GS.CGEN.spawnWhere` *after* `cgBind()`, which sets `GS.CGEN=null` at
   its own end (`src/creator/sheet.js:75`) — threw on every run. Fixed by capturing
   `spawnWhere` before the `cgBind()` call.

**One incidental, code-confirmed finding surfaced while wiring the hometown roll:** the
compiled `place-master-setting` table's row text is `"Name: description"` (colon-separated,
confirmed by a targeted `grep` of `tables.js`, never a full Read) — **not** the
`"**Name** — description"` markdown-bold shape `dev/verify-place-tiyl.mjs`'s own `seedGS()`
mock assumes. That test's mock is a stand-in, not a golden fixture, so this isn't a failing
test — but it means anyone reading that harness for the real row format would be misled.
Flagged, not fixed (out of scope here).

## 2. The 12 rolled starts (verbatim, real dice)

Class/species spread: all 12 base classes hit once each; 9 of the game's 9 species used.
Full untruncated JSON for every field below (including every life-event's full seed payload
and the complete opening bundle) is in `tiyl-raw.json`; this section is a faithful, complete
transcription of the fields the brief asked for, condensed only in layout.

---

### Start 0 — Human Fighter, Soldier background — *Reynard Underwood*
- **Age:** 31–40. **Birthplace (d100=42):** "At home." **Family:** Mother and father.
  **Siblings:** None. **Lifestyle:** Modest. **Childhood home:** A large house.
  **Childhood memory:** "Everyone knew my name, and I had friends everywhere."
- **Why this path:** "War was the weather of my childhood; fighting is simply what I know."
  · **Why this class:** "A monster took someone from me, and I learned to take monsters apart."
- **Life events (5 — age band "31–40" rolls 1d6 events; 5 fell within range):**
  1. Tragedy (d100=4): "A family member or close friend died. (cause of death: An accident,
     unrelated)" → seeds an NPC, "A loved one, lost — now dead — an accident, unrelated."
  2. Tragedy (d100=8): "You were jailed for a crime you didn't commit — 6 years of hard labor."
  3. Worked your old trade (d100=57): +6 gp.
  4. Made a fast friend (d100=41): "a dwarf artisan or guild member, friendly to you, alive
     and well."
  5. Fell in love or were wed (d100=21): "an elf artisan or guild member, friendly to you,
     alive but doing poorly."
- **Hometown / Master Setting roll (d100=87, band Strange):** **The Shimmering Maw** — "A
  village suspended by massive chains over a crater of fused, multicolored glass."
  **History (d100=7, Grounded):** "The last dry ground before the marsh — everyone stops to
  gather themselves before crossing." **Myth (d100=81, Textured):** "The Dreaming Family" (a
  prophetic-dreamer family whose current nine-year-old dreamer has started lying, and the
  town is quietly navigating by invented dreams that keep coming true).
- **World-origin Master Setting (the actual mechanical start — `T.master`, d100=71, cat
  Textured):** **Apex Station 4** — "Clockwork ruins reclaimed by a bioluminescent,
  aggressive jungle." **`bornWhere` = Apex Station 4** (note: this is a *different place*
  from the hometown roll above — see §3).
- **Entry triplet:** why = *sent or summoned*; foot = *nothing but what you carry*; standing
  = *owed a favor by them* (to The Ochre-Stained, the dominant power, martial-tied).
  **Opening tension:** "the dispossessed are organizing toward revolt" (internal; doom =
  "the town falls — taken, occupied, or made to kneel").
  **Bundle:** enemies = a gang's lieutenant testing whether you'll kneel (fresh, Grounded);
  friends = The Ochre-Stained (power) + tied to them (proximity); complications = the dead
  loved one + the dwarf friend (both `src:"past"`); things = a token of trust that opens one
  door, once; places = **The Miller's Leat**, **The Salt-Lick Flats** (both bare gazetteer
  names, no attached description — see §3).

### Start 1 — Elf Wizard, Sage background — *Del Withrethin*
- **Age:** 21–30. **Birthplace (d100=9):** "At home." **Family:** A single father or
  stepfather (a parent died). **Siblings:** 1d4+1 → 2, Younger. **Lifestyle:** Modest.
  **Childhood home:** A large house. **Memory:** "I had several friends and a mostly happy
  childhood."
- **Why this path:** "A mentor cracked open a door in my mind that I could never close
  again." · **Why this class:** "A learned relative decided I was clever enough to be worth
  the teaching."
- **Life events (4):**
  1. Tragedy (d100=7): "You were exiled from your community for a reason never told to you."
  2. Made a fast friend (d100=49): "a goliath artisan or guild member, friendly to you,
     missing or unknown."
  3. Fell in love (d100=28): "a human sailor, friendly to you, alive and quite successful."
  4. Good fortune (d100=14): "A hedge-mage gave you a scroll holding one small spell (a
     cantrip; DM's choice)."
- **Hometown (d100=50, Grounded):** **Rivenmoor Crossing** — "A peat-bog village that exists
  because the single dry causeway across the moor begins here and ends at the other side."
  **History (d100=17, Grounded):** "A fertile bottomland that simply fed too many people to
  leave." **Myth (d100=72, Textured):** "The Bone Tithe" (a miller buries one sack of flour
  every seventh harvest at the field's edge, unbroken for generations).
- **World-origin (d100=37, Grounded):** **The Pilgrim's Ascent** — "Stone switchbacks leading
  to a monastery carved into a cliffside." **`bornWhere` = The Pilgrim's Ascent.**
- **Entry triplet:** why = *recruited for this, specifically*; foot = *a shared enemy with
  someone local*; standing = *in their debt* (to The Ironwood Circle, dominant, tied to The
  Hearth-Watch by proximity). **Tension:** "a haunting or a curse no one will name has
  settled in" (internal; DM-only real = "an object that should have been destroyed"; doom =
  "displacement — the people scatter"). **Bundle places:** **The Tithe-Barn**, **The Wayward
  Shrine**.

### Start 2 — Dwarf Cleric, Acolyte background — *Yurgunn Ruby-Eye*
- **Age:** 21–30. **Birthplace (d100=5):** "At home." **Family:** A single mother or
  stepmother (a parent abandoned you). **Siblings:** None. **Lifestyle:** Modest.
  **Childhood home:** A mansion. **Memory:** "I had a few close friends and an ordinary
  childhood."
- **Why this path:** "One sermon cracked me open like a nut, and I poured myself into the
  work after." · **Why this class:** "Something on the far side of the veil named me its
  hand in the world."
- **Life events (3):** met someone important (d100=72: "a human criminal, friendly to you,
  alive and well"); made a fast friend (d100=48: "a halfling laborer... alive and quite
  successful"); fell in love (d100=26: "a halfling farmer or herder... alive but doing
  poorly").
- **Hometown (d100=55, Grounded):** **The Quarantine Port** — "A harbor where incoming ships
  must anchor offshore for forty days before any cargo or passenger touches land."
  **History (d100=24, Grounded):** "A border customs post, grown fat on the duties both
  realms charge." **Myth (d100=37, Grounded):** "The Second Moon Night" (moon-doubling births
  every generation; "moon-got" a civic boast/slur).
- **World-origin (d100=25, Grounded):** **The Cobbled Tannery** — "A district of brine and
  leather built over natural sea caves." **`bornWhere` = The Cobbled Tannery.**
- **Entry triplet:** why = *carrying something to deliver*; foot = *a patron's eye already on
  you*; standing = *in their debt* (to The Navigator's Lodge, dominant; sworn member of The
  Hearth-Watch). **Tension:** "a blood-feud between families or quarters is turning open."
  **Bundle places:** **The Miller's Leat**, **The Charcoal Burner's Ring**.

### Start 3 — Halfling Rogue, Criminal background — *Sam Elderberry*
- **Age:** 41–50 (7 life events rolled). **Birthplace (d100=83):** "In a keep, tower, or
  great house." **Family:** A single mother or stepmother (abandoned). **Siblings:** None.
  **Lifestyle:** Modest. **Childhood home:** A small house. **Memory:** "an ordinary
  childhood."
- **Why this path:** "I fell in with a bad crowd and turned out to have a talent for their
  work." · **Why this class:** "I ran with a crew who taught me to get what I want by guile,
  not force."
- **Life events (7):** good fortune ×2 (a temple owes you healing; a life-debt companion —
  "a human exile, hermit, or refugee"); fought in a battle ("You survived, but the nights
  bring it back in nightmares" → seeds a permanent `mark`); worked your old trade ×3 (+6/+8/+2
  gp); made a fast friend ("a goliath artisan... indifferent to you"); met someone important
  ("a dwarf artisan... alive and quite successful").
- **Hometown (d100=8, Grounded):** **Old Oak Wharf** — "A river trading post built entirely
  from the timber of a single gargantuan fallen tree." **History (d100=4, Grounded):** "A
  bridge over the one fordable narrows for fifty miles, and the town is the toll." **Myth
  (d100=40, Grounded):** "The Glutton's Bell" (a bell now rung once at every funeral, a
  dead magistrate's "last course").
- **World-origin (d100=81, Textured):** **The Dorsal Market** — "A trading hub upon the
  spine of a gargantuan, slow-flying sky-whale." **`bornWhere` = The Dorsal Market.**
- **Entry triplet:** why = *carrying something to deliver*; foot = *a patron's eye already on
  you*; standing = *a stranger, unknown and unproven* (to The Tithe-Keepers). **Tension:** "a
  guild or cartel is tightening its grip on a vital trade." **Bundle places:** **The
  Salt-Lick Flats**, **The Weeping Quarry**.

### Start 4 — Tiefling Warlock, Hermit background — *Cimer Love*
- **Age:** 21–30. **Birthplace (d100=81):** "In a tavern or inn." **Family:** An adoptive
  family (a parent died). **Siblings:** None. **Lifestyle:** Poor. **Childhood home:** "On
  the streets." **Memory:** "a mostly happy childhood."
- **Why this path:** "I lost everyone and everything; going it alone was all that was left."
  · **Why this class:** "In my worst hour I prayed to anything listening, and something
  answered."
- **Life events (2):** made an enemy (d100=39: "a human laborer, friendly to you, alive but
  doing poorly"); tragedy (d100=9: "War ground your home community into ruin").
- **Hometown (d100=48, Grounded):** **Fishgut Alley** — "A processing quarter built on
  reclaimed foreshore where the catch is gutted, salted, and barreled before it can rot."
  **History (d100=69, Textured):** "Settled as a penal colony; half the founding names are
  still spoken with a flinch." **Myth (d100=11, Grounded):** "The Debt-Stone" (a crossroads
  marker; welchers' names are scratched into it overnight by "parties unknown").
- **World-origin (d100=41, Grounded):** **The Drowned Port** — "A coastal town where half
  the streets flood at high tide." **`bornWhere` = The Drowned Port.**
- **Entry triplet:** why = *stranded — the road or your luck ran out*; foot = *a skill the
  town badly needs right now*; standing = *in their debt* (to The Crier's Circle, dominant;
  tied to The Bog-Iron Consortium, itself at open war with the dominant power). **Tension:**
  "the town itself is slowly becoming something else" (DM-real: "a hive or chorus, the
  people becoming one mind"). **Bundle places:** **The Signal Cairn**, **The Copper-Roof
  Gatehouse**.

### Start 5 — Orc Barbarian, Outlander background — *Resh Bloodtusk*
- **Age:** 20 or younger. **Birthplace (d100=46):** "At home." **Family:** Mother and
  father. **Siblings:** None. **Lifestyle:** Modest. **Childhood home:** A mansion.
  **Memory:** "an ordinary childhood."
- **Why this path:** "I learned what hunts in the dark beyond the fences, and swore to stand
  against it." · **Why this class:** "My fury kept my people alive when nothing else would."
- **Life events (1):** made an enemy (d100=38: "a human farmer or herder, friendly to you,
  alive but doing poorly").
- **Hometown (d100=2, Grounded):** **High-Harrow Gate** — "A crumbling grey-stone
  fortification guarding a mist-shrouded mountain pass." **History (d100=99, Volatile):**
  "Settled to contain a thing the founders couldn't kill; the town is the lid, and the lid
  is loosening." **Myth (d100=20, Grounded):** "The Bargain Ferry" (a ferryman who charges
  what each passenger can least afford to lose).
- **World-origin (d100=39, Grounded):** **Wind-Break Village** — "A settlement in the lee of
  a massive ancient wall of unknown origin." **`bornWhere` = Wind-Break Village.**
- **Entry triplet:** why = *sent or summoned*; foot = **"a room already paid for"** (the one
  run in this batch with an explicit interior — an inn/lodging room); standing = *wanted by
  them for something specific* (The Charcoal Syndicate, dominant; tied to The Crier's
  Circle). **Tension:** "a haunting or a curse no one will name has settled in" (DM-real: "a
  contagion of dreams or memory, passing sleeper to sleeper"). **Bundle places:** **The
  Wayward Shrine**, **The Weeping Quarry**.

### Start 6 — Gnome Bard, Entertainer background — *Nissa*
- **Age:** 21–30. **Birthplace (d100=46):** "At home." **Family:** A single father or
  stepfather (a parent died). **Siblings:** 1d4+1 → 4, Older. **Lifestyle:** Poor.
  **Childhood home:** A room in a poor quarter. **Memory:** "an ordinary childhood."
- **Why this path:** "My family sang for their supper, and I was born already knowing the
  chorus." · **Why this class:** "A master heard something in me and schooled me in the old
  ways."
- **Life events (2):** fought in a battle (d100=90: "You were struck down and left for dead;
  you woke hours later remembering nothing"); worked your old trade (+7 gp).
- **Hometown (d100=39, Grounded):** **The Shrine-Village of Anker's Cross** — "A hamlet that
  exists only to serve the pilgrims passing through to a greater shrine farther up the
  road." **History (d100=86, Textured):** "A wrecking village that once lured ships onto the
  rocks for their cargo — respectable now, and touchy about it." **Myth (d100=68,
  Textured):** "The Borrowed Year" (a founder's river-bargain; the water rises to a marker
  stone every year, exactly).
- **World-origin (d100=68, Textured):** **The Shimmering Maw** — "A village suspended by
  chains over a crater of fused, multicolored glass." **`bornWhere` = The Shimmering Maw.**
  (Note: this is the SAME named settlement Start 0 rolled as its *hometown* flavor — two
  unrelated worlds independently drawing the same 100-row table; see §3.)
- **Entry triplet:** why = *for refuge — lying low, or starting over*; foot = *an old
  acquaintance or contact in town*; standing = *watched, or marked* (The Iron-Strap Guild,
  dominant, tied). **Tension:** "a rival settlement's ambitions are pressing inward"
  (external). **Bundle places:** **The Tanner's Reach**, **The Salt-Lick Flats**.

### Start 7 — Goliath Paladin, Noble background — *Manneo Skywatcher*
- **Age:** 41–50. **Birthplace (d100=67):** "In a barn or outbuilding." **Family:** Mother
  and father. **Siblings:** 1d3 → 3, Older. **Lifestyle:** Squalid. **Childhood home:** A
  rundown shack. **Memory:** "I made friends easily and loved being among people."
- **Why this path:** "My house was disgraced, and I mean to scrub the stain off our name." ·
  **Why this class:** "I served as a squire and learned enough to swear an oath of my own."
- **Life events (1):** "Something happened to you that had no ordinary explanation" (d100=85:
  "You stood in a holy place and felt the presence of the divine").
- **Hometown (d100=82, Textured):** **Deadseason Port** — "A port that runs at full capacity
  six months a year and is half-abandoned the other six, with a permanent argument about who
  is responsible for the town during the off-season." **History (d100=47, Grounded):**
  "Refugees from a war stopped one hard winter and never found a reason good enough to
  leave." **Myth (d100=93, Strange):** "The Star-Sown Field" (comet-dust herbs in a shrinking
  300-ft ellipse that die if transplanted an inch beyond it).
- **World-origin (d100=40, Grounded):** **The Drowned Port** — "A coastal town where half the
  streets flood at high tide." **`bornWhere` = The Drowned Port** (same settlement as Start
  4, a different world).
- **Entry triplet:** why = *carrying something to deliver*; foot = *nothing but what you
  carry*; standing = *owed a favor by them* (a sworn member of The Orchard-Wardens,
  dominant). **Tension:** "the town itself is slowly becoming something else" (DM-real: "a
  wound still spreading from something that already happened here"). **Bundle places:** **The
  Floating Paving Stones**, **The Weeping Quarry**.

### Start 8 — Dragonborn Sorcerer, Charlatan background — *Gilkass Shestendeliath*
- **Age:** 21–30. **Birthplace (d100=31):** "At home." **Family:** A single father or
  stepfather (abandoned). **Siblings:** None. **Lifestyle:** Poor. **Childhood home:** A
  rundown shack. **Memory:** "an ordinary childhood."
- **Why this path:** "Poverty frightened me more than dishonesty, so I chose the dishonesty."
  · **Why this class:** "At my birth the milk soured and the iron went strange — an omen,
  they said."
- **Life events (2):** good fortune (d100=14: "An apothecary gifted you a flask of acid");
  met someone important (d100=71: "a halfling soldier, friendly to you, alive and well").
- **Hometown (d100=74, Textured):** **Bridgetax** — "A river-town founded by the men who
  collected the toll, whose descendants now own every business in the valley and still
  collect, though the original charter expired a century ago." **History (d100=15,
  Grounded):** "A stand of old timber worth the cutting, and a mill built to cut it." **Myth
  (d100=46, Grounded):** "The Tanner's Curse."
- **World-origin (d100=2, Grounded):** **The Bog-Iron Camp** — "Mud-caked tents surrounding a
  shallow, rust-colored peat mine." **`bornWhere` = The Bog-Iron Camp.**
- **Entry triplet:** why = *carrying something to deliver*; foot = *nothing but what you
  carry*; standing = *a stranger, unknown and unproven* (The Star-Seekers, dominant; a sworn
  member of The Glass-Singers, who are at open war with the dominant power). **Tension:** "a
  sickness is spreading through the poorer quarters." **Bundle places:** **The Witch-Hazel
  Copse**, **The Floating Paving Stones**.

### Start 9 — Human Druid, Folk Hero background — *Hubert Hedley*
- **Age:** 41–50. **Birthplace (d100=59):** "In a healer's or midwife's house." **Family:** A
  single father or stepfather (vanished to a fate unknown). **Siblings:** 1d6+2 → 6, "Twin,
  triplet or quadruplet." **Lifestyle:** Poor. **Childhood home:** A small house. **Memory:**
  "I spent most of it alone, with no close friends."
- **Why this path:** "When the moment came for someone to stand up, I found it was me." ·
  **Why this class:** "A friend among the circles changed how I saw the world, so I gave
  back to it."
- **Life events (3):** made an enemy ×2 ("a human sailor... alive and infamous"; "a human
  artisan or guild member... alive but doing poorly"); "something happened... no ordinary
  explanation" (d100=85: "You escaped certain death and believe a god's hand turned it
  aside").
- **Hometown (d100=57, Grounded):** **The Potters' Quarter** — "A riverside district of clay
  banks and smoking kilns, its lanes ankle-deep in red slip and its exports stacked on every
  wharf." **History (d100=93, Strange):** "A town that appears on no map drawn from outside,
  only on maps drawn from within." **Myth (d100=52, Grounded):** "The Seven Brothers"
  (mountain peaks as quarreling brothers turned to stone; inheritance disputes go to
  mandatory arbitration).
- **World-origin (d100=40, Grounded):** **The Drowned Port** (third occurrence of this
  settlement across the batch). **`bornWhere` = The Drowned Port.**
- **Entry triplet:** why = *sent or summoned*; foot = *nothing but what you carry*; standing
  = *in their debt* (tied to The Hearth-Watch, dominant). **Tension:** "a blood-feud between
  families or quarters is turning open" (DM-real: "a hive or chorus, the people becoming one
  mind"). **Bundle places:** **The Wayward Shrine**, **The Rust-Creek Smelter**.

### Start 10 — Elf Ranger, Sailor background — *Adran Ofandrus*
- **Age:** 41–50 (6 life events). **Birthplace (d100=38):** "At home." **Family:** A
  grandparent or grandparents (a parent imprisoned/enslaved/taken). **Siblings:** None.
  **Lifestyle:** Modest. **Childhood home:** A rundown shack. **Memory:** "I spent most of it
  alone, with no close friends."
- **Why this path:** "A relative who lived by the tide took me out to learn the water." ·
  **Why this class:** "I made myself the first line between the settlements and the dark
  beyond."
- **Life events (6):** made an enemy ×3 (a human entertainer; an elf entertainer; a gnome
  farmer/herder — all "friendly to you," oddly, despite being enemies); good fortune (a
  life-debt companion, "a human farmer or herder"); brushed against magic (d100=96: "You
  watched a powerful spell cast up close"); fell in love ("a dwarf priest, friendly to you,
  alive and well").
- **Hometown (d100=73, Textured):** **The Lien-Holders' Market** — "A prosperous trading town
  whose entire economy runs on debt instruments — no coin changes hands, only promissory
  notes, and the clerks who validate them run everything." **History (d100=59, Grounded):**
  "A garrison town that outlived its war and learned to farm." **Myth (d100=76, Textured):**
  "The Agreed Silence" (a maintained north road nobody asks about, billed under "the
  arrangement").
- **World-origin (d100=25, Grounded):** **The Cobbled Tannery** (matches Start 2's
  settlement). **`bornWhere` = The Cobbled Tannery.**
- **Entry triplet:** why = *carrying something to deliver*; foot = *a lead or rumor only you
  hold*; standing = *owed a favor by them* (The Gentry's Guard, dominant; **no** faction
  proximity tie rolled this time — `relationship: "none"`). **Tension:** "a blood-feud
  between families or quarters is turning open." **Bundle places:** **The Witch-Hazel
  Copse**, **The Low-Tide Graveyard**.

### Start 11 — Halfling Monk, Urchin background — *Blossom*
- **Age:** 21–30. **Birthplace (d100=64):** "In a cart or wagon on the road." **Family:** A
  grandparent or grandparents (vanished to a fate unknown). **Siblings:** None. **Lifestyle:**
  Modest. **Childhood home:** A rundown shack. **Memory:** "Others thought me strange, so I
  had few companions."
- **Why this path:** "A thief gathered up the orphans, and we earned our keep with light
  fingers." · **Why this class:** "I went looking for a deeper understanding of where I fit
  in the world."
- **Life events (3):** made an enemy (d100=34: "an elf farmer or herder... alive and quite
  successful"); crime (d100=92: "Smuggling — You did it (or helped), but were found not
  guilty anyway"); worked your old trade (+11 gp).
- **Hometown (d100=79, Textured):** **The Garrison-Wife Town** — "A settlement of dependents
  and camp-followers that outlasted the army it followed, now governing itself with a
  military rank structure that has no military left to justify it." **History (d100=66,
  Grounded):** "A granary-and-windmill that became the safest place to store a hard year's
  grain." **Myth (d100=10, Grounded):** "The Drowned Bells."
- **World-origin (d100=1, Grounded):** **The Bog-Iron Camp** (matches Start 8's settlement).
  **`bornWhere` = The Bog-Iron Camp.**
- **Entry triplet:** why = *for work and coin*; foot = *a shared enemy with someone local*;
  standing = *owed a favor by them* (a sworn member of The Gravity-Movers; The Navigator's
  Lodge dominant). **Tension:** "the border of the world is thinning here; something is
  coming through" (external; DM-real: "the land of the dead... scattered bleed-points with no
  center"). **Bundle places:** **The Rust-Creek Smelter**, **The Drover's Rest**.

---

## 3. What's actually on the table at minute zero

### 3.0 A load-bearing mechanical finding first

**The "hometown" the bardo asks the player to roll and the actual place the character wakes
up in (`bornWhere`) are two independent d100 draws against the same underlying "Master
Setting" content — and in this batch they never once matched (0/12).** Compare, e.g., Start
0: hometown = *The Shimmering Maw* (a village suspended over a glass crater) vs. `bornWhere`
= *Apex Station 4* (clockwork ruins in a jungle) — two contradictory answers to "where does
this story start," both presented to the player as canon (`bindWorld()` writes BOTH into the
ledger: `"Hometown: <ht_setting> · Origin: <ht_history> · Myth: <ht_myth>"` as one ledger
line, and separately `"<name> was rolled into being at <world.seed.master.name>."`). Code
locations: `src/creator/bardo.js:14` (`{t:"hometown",...,id:"place-master-setting"}`) vs.
`data/world-tables.js:10` (`T.master`, rolled by the separate `WORLDBEATS`/`STAGES` "master"
beat) vs. `src/world/play.js:47` (`bindWorld()` uses `GS.SEED.master.name`, the WORLD beat,
never the hometown beat, as the origin/`bornWhere`). This is a real, reproducible property of
the built code, not a one-off — it held across all 12 independent worlds.

**A second, smaller wiring gap in the same neighborhood:** `data/world-tables.js`'s `nearby`
table (the "Place Nearby" d100 that seeds the two `gazetteer` Places every world starts with)
carries a real description per row (e.g. row 1: *"The Tithe-Barn" — "A timber grain-store of
the local Lord, guarded by nervous militia."*), but `rollEntry()`'s bundle-building step
(`src/engine/world-gen.js:106`) only forwards `g.name`, dropping `g.desc` before it ever
reaches the entry bundle: `add("places",g.name,"place")`. Confirmed 12/12 — every "places"
bundle entry in every run above is a bare proper noun with zero attached description (compare
"The Miller's Leat" against its own gazetteer record, which *does* carry the militia-grain-store
line — it's just never read at this call site). One consequence: the richer, spice-graded
`EB.places` fallback table (`data/starting-state.js`) — the one with actual prop-bearing rows
like *"the inn or flophouse where everyone's business passes"* or *"a burned, shuttered, or
condemned place no one explains"* — never fires in this slot in practice, because the
`nearby` triad always seeds 2 gazetteer Places before `rollEntry` runs its "still-empty slot"
fallback (`src/engine/world-gen.js:109`). Confirmed 12/12 — every single "places" bundle entry
across the batch is `src:"place"` (gazetteer), never `src:"fresh"` (`EB.places`). The rich
table is reachable code, but effectively dead in this call path.

### 3.1 The opening-scene distribution

Using the mechanical start (`bornWhere` / `worldOriginMasterSetting`, since that's what
`cgBind()` actually anchors the PC to) plus the entry triplet's `foot` (the strongest
interior/exterior signal — see below):

| bornWhere (× count) | site register | interior/exterior |
|---|---|---|
| The Drowned Port (×3) | flooding coastal port-town street | exterior (arrival) |
| The Cobbled Tannery (×2) | industrial trade district over sea caves | exterior (arrival, ×1 watched) |
| The Bog-Iron Camp (×2) | mud-tent camp beside a peat mine | exterior (arrival) |
| Apex Station 4 (×1) | ruined installation reclaimed by jungle | exterior (arrival) |
| The Pilgrim's Ascent (×1) | mountain switchbacks to a cliffside monastery | exterior (road) |
| The Dorsal Market (×1) | market atop a living sky-whale | exterior (public, watched) |
| Wind-Break Village (×1) | village beside an ancient wall | **interior** (a paid-for room) |
| The Shimmering Maw (×1) | village suspended over a glass crater | exterior (meeting a contact) |

**Every single one of the 12 rolls produced a *settlement* of some kind — none produced open
road/wilderness with no settlement at all**, even though the underlying tables clearly support
that (`eWhyHere` has "just passing through," `eFoot` "nothing but what you carry" pairs
naturally with an unsettled/roadside opening). With n=12 against a d100 table this is
plausibly sample-size luck rather than a structural bias — flagged, not proven; a larger
batch would settle it.

**Interior vs. exterior is decided almost entirely by `eFoot` (d12), and it lands exterior
by a wide margin:** of the 12 rolls, only 1 (`"a room already paid for"`, Start 5) is
unambiguously an interior. One more (`"an old acquaintance or contact in town"`, Start 6) most
plausibly resolves to an interior (that person's home or shop) but doesn't say so outright.
The other 10 read as exterior/public: `"nothing but what you carry"` (×4 — an empty-handed
arrival, road/gate/dock), `"a patron's eye already on you"` (×2 — implies public visibility),
`"a shared enemy with someone local"` (×2), `"a lead or rumor only you hold"` (×1), `"a skill
the town badly needs right now"` (×1).

**Meanwhile the *life* chain — birthplace + childhood home, i.e. the retrospective, not the
"right now" — points overwhelmingly at ordinary domestic interiors:** birthplace was "At
home" in 7 of 12 rolls (58%), and childhood home varied across mansion/large house/small
house/rundown shack/room-in-a-poor-quarter/on-the-streets — every single one of those is a
domestic interior register. **The single most common PLACE the whole chain implies, across
both halves, is an ordinary home — and it is the one register the entry triplet's own
vocabulary never stages as the actual opening scene** (no `eFoot` row is "at your family's
home"; the closest is "a room already paid for," which reads as a rented room, not a
household).

`why`/`foot`/`standing` full tallies (n=12): why → carrying-something-to-deliver 5,
sent-or-summoned 3, recruited 1, stranded 1, refuge 1, work-and-coin 1. foot → nothing-but-
what-you-carry 4, shared-enemy 2, patron's-eye 2, room-already-paid-for 1, old-acquaintance 1,
lead-or-rumor 1, skill-town-needs 1. standing → owed-a-favor 4, in-their-debt 4, stranger 2,
wanted 1, watched-or-marked 1. Spice bands: hometown rolls were Grounded 7 / Textured 4 /
Strange 1; world-origin rolls were Grounded 9 / Textured 3 — the openings the dice actually
produce are mostly plain, occasionally odd, rarely outright weird, which matches the
documented SPICE-CURVE rarity intent.

### 3.2 Mapping against the twelve golden sites

Per the task brief, this reads only `docs/GOLDEN-SITES-CATALOG.md`'s "## The twelve golden
sites" section and its status table (not the individual 1,100-line site briefs that follow
it). Named and gated there: **1 Guard Post** (PASS/PASS/PASS/OPEN), **2 Camp/Service**
(PASS/PARTIAL/PARTIAL/OPEN), **4 Monastery/Commune** (PASS/PARTIAL/PARTIAL/OPEN), **5
Mine/Workshop** (PARTIAL/PARTIAL/PARTIAL/OPEN), **7 Natural Lair** (PASS/PASS/PASS/OPEN), **10
Urban Institution** (PARTIAL/PARTIAL/PARTIAL/OPEN). **Sites 3, 6, 8, 9, 11, 12 are OPEN across
every gate** — the status table states plainly they haven't entered the depth-law pipeline at
all, and the section doesn't name what they are (site 3 is noted only as "retained but
deliberately late/last"). None of the twelve — including the six with real research/rulings
behind them — is CLAY-PROVED yet; all read OPEN at that gate.

Mapping the 8 unique `bornWhere` results (12 rolls, some repeats) against that list:

| bornWhere | nearest golden site | fit |
|---|---|---|
| The Pilgrim's Ascent (monastery on a cliff) | **4 Monastery/Commune** | direct — the description names a monastery outright |
| The Bog-Iron Camp (tents + peat mine) | **2 Camp/Service** + **5 Mine/Workshop** | direct, and doubly so — a tent camp beside a mine is close to a literal composite of two researched sites |
| The Cobbled Tannery (trade district over sea caves) | **10 Urban Institution** (district/market register) partially; the sea-cave half echoes **7 Natural Lair**'s cave grammar | partial / composite no single site covers |
| The Dorsal Market (market on a sky-whale) | **10 Urban Institution** (function only — a market) | partial — the physical conceit (living-creature architecture) has no precedent in any of the twelve |
| The Drowned Port (flooding coastal town, ×3 — the single most-rolled result) | none | **gap** — no golden site is a working waterfront/port town |
| Wind-Break Village + its interior ("a room already paid for") | none for the interior; the ancient-wall exterior distantly echoes Guard Post's fortification register | **gap** — no golden site is an inn/rented-room interior |
| The Shimmering Maw (chain-suspended glass-crater village) | none | **gap** — pure spectacle/wonder register, no precedent |
| Apex Station 4 (jungle-reclaimed ruin) | thematically closest to the unresearched site 3 (dormant/ruin register, per incidental mentions elsewhere in the catalog) | **gap** — site 3 has no name, brief, or research yet |

**Weighted by the 12 actual rolls: 6 of 12 starts (50% — Drowned Port ×3, Shimmering Maw,
Wind-Break Village's interior, Apex Station) land on a scene none of the twelve golden sites
touches at all.** 2 of 12 (Bog-Iron Camp ×2, 17%) get a clean double match against two
already-researched sites. The remaining 4 (Tannery ×2, Dorsal Market ×1, Pilgrim's Ascent ×1,
33%) are partial-to-direct matches, one of them (Pilgrim's Ascent) clean.

**The headline gap, independent of any single roll:** *domestic/lodging interior* — a home, a
rented inn room — is the single most-implied PLACE across the whole chain (58% of
birthplaces, the childhood-home table's entire register, and the one explicit interior
`eFoot` result), and it is not one of the twelve golden sites, named or unnamed. Port/
waterfront towns (25% of this batch's actual starts) are a close second gap. Prison (Start
0's "6 years of hard labor," a `tragedies` row) brushes the unresearched site 6 if that is
indeed the prison site (inferred from incidental context in the catalog, not confirmed in the
read section) but nothing is built there either way.

## 4. Representation options (proposals for the founder — not a recommendation)

Three credible approaches surfaced by this batch. Each is presented with what it would
demand from generation; none is favored here.

**A. A dedicated "origin scene" treatment (a 13th, purpose-built site type).**
Author a flexible composite structure/material kit expressly for minute zero — a settlement-
street/threshold default, plus an interior variant keyed off `eFoot==="a room already paid
for"` (or off the life chain's birthplace/childhood-home result, if the game ever wants the
*literal* birthplace rendered instead of the arrival point). Demands: the full guard-post-
grade pipeline (research → founder rulings → brief → clay-proof) for a new site, same as any
of the twelve; a rule for which of `bornWhere` vs. the hometown roll (see §3.0) it actually
renders, since today they disagree 12/12; and it directly collides with Adam's framing that
the twelve golden sites "define the entire game's MVP" — a 13th site grows that scope rather
than filling it.

**B. Reuse/adapt an existing golden site by nearest-neighbor mapping + realm/culture
dressing.** Route each rolled opening to whichever of the twelve it most resembles — Camp/
Service for tent starts, Mine/Workshop for mines, Monastery/Commune for the one direct hit,
Urban Institution for market/district starts — and, for the ~50% with no honest match (port
towns, spectacle villages, ruins, lodging interiors), fall back to the nearest built site
anyway (most often Urban Institution or Camp/Service) with realm-appropriate dressing
(the pointer mechanism `mintOriginPlaceThread()` already threads — `dm.itemsPool`/
`dm.dressing` per realm, confirmed live in `src/world/play.js:127-135`). Demands: a
selection function keyed off `bornWhere`'s text/category, nothing new to build immediately.
Trade-off: roughly half the rolled scenes get a visibly wrong container — a flooding port
street staged inside a civic market-hall's silhouette says something the prose doesn't.

**C. Text-first cold open; defer the tabletop scene to the first golden-site-covered
destination.** Keep minute zero prose-only — the DM narrates the fragment-oracle version of
`bornWhere`/`ht_setting`/the entry triplet exactly as TIYL already does today, with no
diorama rendered — and only cut to a rendered scene once play steers the party to a location
one of the twelve sites actually covers (a guard post, a camp, a monastery). This matches
the project's own TEXT-FIRST-FOREVER doctrine and asks for zero new geometry. Demands: a rule
for how long the DM may go without owing a rendered scene, and an explicit signal in the DM's
prompt/contract that a bare cold open is intentional design, not a missing asset. Trade-off:
sidesteps the task's own framing ("what would have to be on the table right now") rather than
answering it, and risks the opening always reading thinner than everything that follows it.
