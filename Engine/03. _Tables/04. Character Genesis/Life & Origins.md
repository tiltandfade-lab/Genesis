---
id: life-origins
type: table-set
domain: Character Genesis
status: source
table_class: Commitment
player_facing: reveal
voice_critical: false
---

# Life & Origins — Character Genesis biography chain (canonical)
> The **live, public-safe** biographical roll-chain for Genesis character creation (Layer 2 of `CHAR-CREATION.md`). Original prose, **IP-clean** — derived in structure from the open backstory-generator pattern, but re-voiced with all Wizards product-identity terms removed (no planes by name, no fey/fiend/aberration proper nouns, no named monsters, items, or spells). The XGE transcription that seeded the *structure* is kept only as heritage reference in `zz_Archive/` and is **not compiled**.
>
> **Edit-source layer:** `genesis.html` runs a mirrored inline copy (`CG`, `CG_BG`, `CG_CLASS`) until the Track B `tables.json` pipeline lands. Keep this file and the inline data in sync; never hand-edit a compiled artifact.
>
> **Choose-one sub-rolls** are written `{a | b | c}` — the engine rolls one option uniformly at roll time and bakes it into the prose (the same treatment as inline dice like `1d4`), so a row never leaves the player an ambiguous "or" menu to interpret.
>
> **Spice Curve (`SPICE-CURVE.md`):** intensity is honest per-table rarity — common rolls **Grounded**, rare tails climb **Textured → Strange → Volatile → Mythic**. Dice ranges are preserved so the weirdness sits where the rarity does. Each table is tagged with its **class** (Spark = flavor, capped low · Fork = direction, may reach Strange · Commitment = major consequence, may roll Volatile/Mythic) and a band note. Player rolls openly; the DM reveals through narration; backstory people/threads auto-seed the World State Ledger as canon.

---

## 1 · Origins

### Parents — Spark · Grounded
|d100|Parents|
|---|---|
|1–95|You know who your parents are, or were.|
|96–100|You never knew who your parents were.|

### Birthplace — Fork · Grounded→Mythic (96+ = the world tilts; 100 = Mythic)
|d100|Place|
|---|---|
|1–50|At home|
|51–55|In the home of a family friend|
|56–63|In a healer's or midwife's house|
|64–65|In a cart or wagon on the road|
|66–68|In a barn or outbuilding|
|69–70|In a cave|
|71–72|In an open field|
|73–74|Deep in a forest|
|75–77|In a temple or shrine|
|78|On a battlefield|
|79–80|In an alley or open street|
|81–82|In a tavern or inn|
|83–84|In a keep, tower, or great house|
|85|In a sewer or on a rubbish-heap|
|86–88|Among a people not your own|
|89–91|Aboard a boat or a ship|
|92–93|In a prison, or a secret society's hidden hall|
|94–95|In a scholar's laboratory|
|96|Somewhere the maps do not reach *(Strange)*|
|97|In a place of deep and living shadow *(Strange)*|
|98|Adrift in the space between places *(Volatile)*|
|99|In a country made of raw element *(Volatile)*|
|100|Somewhere no living thing should be born *(Mythic)*|

> On a 00 you may also mark a strange omen at the birth (a red moon, milk soured for a mile, midsummer ice, iron gone to silver).

### Number of Siblings — Spark (dwarf/elf: −2)
|d10|Siblings|
|---|---|
|1–2|None|
|3–4|1d3|
|5–6|1d4+1|
|7–8|1d6+2|
|9–10|1d8+3|

### Birth Order (2d6) — Spark
|2d6|Order|
|---|---|
|2|Twin, triplet or quadruplet|
|3–7|Older|
|8–12|Younger|

### Family (who raised you) — Spark · Grounded
|d100|Family|
|---|---|
|1|No one|
|2|An institution, such as a house for the mad|
|3|A temple|
|4–5|An orphanage|
|6–7|A guardian|
|8–15|An aunt, uncle, or both|
|16–25|A grandparent or grandparents|
|26–35|An adoptive family|
|36–55|A single father or stepfather|
|56–75|A single mother or stepmother|
|76–100|Mother and father|

### Absent Parent — Spark (roll if parents known but family omits them)
|d4|Fate|
|---|---|
|1|A parent died (roll Cause of Death).|
|2|A parent was imprisoned, enslaved, or taken away.|
|3|A parent abandoned you.|
|4|A parent vanished to a fate unknown.|

### Family Lifestyle — Spark (modifier feeds Childhood Home)
|3d6|Lifestyle|
|---|---|
|3|Wretched (−40)|
|4–5|Squalid (−20)|
|6–8|Poor (−10)|
|9–12|Modest (+0)|
|13–15|Comfortable (+10)|
|16–17|Wealthy (+20)|
|18|Aristocratic (+40)|

### Childhood Home — Spark (apply Lifestyle modifier)
|d100 (mod)|Home|
|---|---|
|0 or lower|On the streets|
|1–20|A rundown shack|
|21–30|No permanent home|
|31–40|A camp or village in the wilderness|
|41–50|A room in a poor quarter|
|51–70|A small house|
|71–90|A large house|
|91–110|A mansion|
|111+|A palace or castle|

### Childhood Memories — Spark (+ Cha modifier)
|3d6 + Cha|Memory|
|---|---|
|≤3|I am still haunted by it — my peers treated me badly.|
|4–5|I spent most of it alone, with no close friends.|
|6–8|Others thought me strange, so I had few companions.|
|9–12|I had a few close friends and an ordinary childhood.|
|13–15|I had several friends and a mostly happy childhood.|
|16–17|I made friends easily and loved being among people.|
|18+|Everyone knew my name, and I had friends everywhere.|

---

## 2 · Personal Decisions (keyed to the chosen class & background)

**Background "I became…" (d6)** — keyed to the chosen background. The 4 SRD + 6 native + 9 standard-archetype packages and their d6 tables live in **`Genesis Backgrounds.md`** (all original prose, SRD-safe).

**Class Training "I became a ___ because…" (d6)** — Spark/Fork; mostly Grounded, with the inherently-uncanny classes (Sorcerer, Warlock, Barbarian) carrying honest Textured/Strange flavor.

### Barbarian
1. My fury kept my people alive when nothing else would.
2. The voices of those who came before named a task and would not be quiet.
3. Something took the reins of my body in a fight once, and I've fought to hold them since.
4. I went looking for myself in the wild and came back with a spirit at my shoulder. *(Textured)*
5. Lightning found me and let me live, and left a strength behind that isn't quite mine. *(Strange)*
6. The anger had to go somewhere, and a battle is a better place than a hearth.

### Bard
1. I taught myself the craft one cracked note at a time.
2. A master heard something in me and schooled me in the old ways.
3. I fell in with a circle of talkers and players and learned their secrets.
4. Someone has to keep the deeds of the dead alive; I chose to be that voice.
5. I won a place at one of the great halls of song and lore.
6. I picked up an instrument and my hands already knew the way.

### Cleric
1. Something on the far side of the veil named me its hand in the world. *(Textured)*
2. I saw too much cruelty to keep my head down, so I took up the work.
3. A sign came that I could not argue with, and I left everything to follow it.
4. A long journey of faith showed me what I was actually for.
5. I served my faith from behind a desk until the world out here called louder.
6. The power moves through me whether I understand it or not.

### Druid
1. I watched the green places die and joined those who fight for them.
2. After a disaster I found shelter among the keepers of the old ways.
3. Animals always trusted me, and I followed that gift to see where it led.
4. A friend among the circles changed how I saw the world, so I gave back to it.
5. I saw spirits no one else could and went to those who could teach me their tongue. *(Textured)*
6. Unnatural things sicken me, so I made myself a guardian of the natural order.

### Fighter
1. I wanted to be good with a blade, so I trained where they teach it best.
2. I served a knight, learned the work and the code, and made it my own.
3. A monster took someone from me, and I learned to take monsters apart.
4. I joined the ranks and learned to fight as one piece of a larger thing.
5. I grew up trading blows, and sharpened it on everyone who crossed me.
6. Any weapon you hand me, my hands seem to already understand.

### Monk
1. A quiet order took me in and taught the first forms of a long discipline.
2. I went looking for a deeper understanding of where I fit in the world.
3. I sheltered in a strange far house and learned to stand against the dark there. *(Textured)*
4. Grief drove me to those who study the mind, and I stayed to learn.
5. I felt a power coiled in me and sought the ones who could call it out. *(Textured)*
6. I was wild and aimless until discipline gave me a shape worth holding.

### Paladin
1. Something radiant stood before me and named a sacred task. *(Textured)*
2. An ancestor left an oath unfinished, and it falls to me to keep it.
3. The world is dark enough that I chose to be a light held against it.
4. I served as a squire and learned enough to swear an oath of my own.
5. I cannot leave wickedness alone; I am driven to find it and end it.
6. My faith hardened into a vow, and the vow made me its blade.

### Ranger
1. I found my purpose hunting the things that prey at the edge of the maps.
2. I always had a quiet way with beasts, a word and a touch that calmed them.
3. A restlessness in me needs the road, and the work gives it one.
4. I made myself the first line between the settlements and the dark beyond.
5. A weathered tracker took me on and taught me the wild's hidden grammar.
6. I scouted for an army and learned my trade blazing trails ahead of it.

### Rogue
1. I'm quick of hand and wit, and I bent both toward getting by.
2. A thief wronged me, so I learned their craft well enough to beat them at it.
3. An old hand saw promise in me and slipped me a few useful tricks.
4. My luck always ran a little hot, so I built a living on top of it.
5. I ran with a crew who taught me to get what I want by guile, not force.
6. I cannot resist a shine or a full purse — so long as taking it won't get me killed.

### Sorcerer
1. At my birth the milk soured and the iron went strange — an omen, they said. *(Strange)*
2. A terrible shock woke the power in me, and I've fought to leash it since. *(Textured)*
3. No one would speak of my bloodline, until the blood started speaking for itself. *(Textured)*
4. A friend in danger, and I lashed out with a force I didn't know I held. *(Textured)*
5. Someone saw the strangeness in me and taught me to hold its reins.
6. I walked out of a fire unburned but not unchanged, and the changes are still coming. *(Strange)*

### Warlock
1. In a forbidden place, something not of this world offered me a bargain. *(Strange)*
2. I opened the wrong book and the thing inside it became my patron. *(Strange)*
3. I stepped through a door that shouldn't have been there and into a pact. *(Strange)*
4. In my worst hour I prayed to anything listening, and something answered. *(Textured)*
5. My patron came to me in dreams and named the price of power. *(Textured)*
6. An ancestor struck a bargain, and the other party came to collect on me.

### Wizard
1. An old mage chose me out of a row of hopefuls for an apprenticeship.
2. Lost and small, I was found by a hedge-mage who taught me the first words.
3. I clawed my way into an academy of magic on nothing but want and will.
4. A learned relative decided I was clever enough to be worth the teaching.
5. I found a spellbook where it had no business being and had to know it all. *(Textured)*
6. I showed the gift young, and the moment I could, I left to grow it.

---

## 3 · Life Events — Commitment (the chain that can reach the high bands)

### Life Events by Age (d100 → age band + # of events)
|d100|Age|Events|
|---|---|---|
|01–20|20 or younger|1|
|21–59|21–30|1d4|
|60–69|31–40|1d6|
|70–89|41–50|1d8|
|90–99|51–60|1d10|
|00|61 or older|1d12|

### Life Events (d100) — Grounded body, Strange tail
|d100|Event|Band|
|---|---|---|
|01–10|You suffered a tragedy → Tragedies|Grounded–Textured|
|11–20|A bit of good fortune found you → Boons|Grounded|
|21–30|You fell in love or were wed *(seed: a love)*|Grounded|
|31–40|You made an enemy of a wanderer like yourself *(seed: enemy)*|Textured|
|41–50|You made a fast friend of a wanderer like yourself *(seed: friend)*|Grounded|
|51–70|You worked a while at your old trade (+2d6 gp)|Grounded|
|71–75|You met someone who mattered *(seed: NPC)*|Grounded|
|76–80|You went out on an adventure → Adventures|Textured|
|81–85|Something with no ordinary explanation → Supernatural|Strange–Volatile|
|86–90|You fought in a battle → War|Textured|
|91–95|You committed a crime, or were blamed → Crime + Punishment|Textured|
|96–99|You brushed up against magic → Arcane|Strange|
|00|Something truly strange happened → Weird Stuff|Strange–Mythic|

### Tragedies (d12) — Grounded–Textured
1–2 A family member or close friend died *(roll Cause of Death; seed: lost loved one)* · 3 A friendship soured; that person is hostile to you now *(seed)* · 4 You lost everything in a disaster and started over · 5 Jailed 1d6 years for a crime you didn't commit · 6 War ground your home to ruin · 7 A lover vanished without a trace; you've searched since *(seed: thread + person)* · 8 Famine took a sibling or family member *(seed)* · 9 You shamed your family; they're cold to you now · 10 Exiled for a reason never told you · 11 A relationship ended {in bitterness | in peace} · 12 A partner, or hoped-for one, died *(seed)*

### Boons (d10) — Grounded
1 A hedge-mage gave you a scroll of one small spell · 2 A commoner owes you a life-debt and travels with you *(seed: companion)* · 3 A riding horse · 4 +1d20 gp · 5 A relative's simple weapon of your choice · 6 +1 trinket · 7 A temple owes you one full healing · 8 {A healing draught | A flask of acid} · 9 A treasure map · 10 A stipend (comfortable life, 1d20 years)

### Adventures (d100) — Textured (several leave a carried mark)
01–10 You nearly died — scars, missing {an ear | 1d3 fingers | 1d4 toes} *(mark)* · 11–20 A grievous wound still pains you *(mark)* · 21–30 Wounded, recovered fully · 31–40 A sickness left {a cough | pockmarks | early-gray hair} *(mark)* · 41–50 Poisoned — next save vs. poison has disadvantage *(mark)* · 51–60 Lost something dear (−1 trinket) · 61–70 Fear took you; you fled and left companions to their fate · 71–80 Learned much — next check or save has advantage · 81–90 +2d6 gp · 91–99 +1d20+50 gp · 00 A common magic item (DM's choice)

### Arcane (d10) — Strange
1 A spell charmed or frightened you · 2 A spell wounded you · 3 You watched a powerful spell cast up close · 4 You drank a strange potion · 5 You found a scroll and cast its spell · 6 Swept up in teleportation magic · 7 Invisible for a time · 8 Saw through an illusion · 9 Watched a creature called up from nothing · 10 A fortune-teller read your fate (the DM holds a portent)

### Supernatural (d100) — Strange–Volatile
1–5 A being of the wild-beyond bound you in service 1d6 years before you escaped · 6–10 You glimpsed a thing of the lower dark and fled · 11–15 A tempter of the lower dark made you an offer (DC 10 Wis or shift one step toward evil, +1d20+50 gp) · 16–20 Woke miles from home, no memory of how · 21–30 Stood in a holy place, felt the divine · 31–40 An omen — a red star falling, a face in the frost · 41–50 Escaped certain death; you believe a god turned it aside · 51–60 A small miracle · 61–70 An empty house, found haunted · 71–75 Briefly ridden by something not of flesh — {of light | of the dark | of the wild | of element | of the unquiet dead} · 76–80 You saw a ghost · 81–85 You saw a corpse-eater at its meal · 86–90 A voice from beyond warned you in dreams *(thread)* · 91–95 You slipped for a moment into the wild-beyond or shadow-country *(Volatile)* · 96–00 A doorway you believe opens onto another world *(thread, Volatile)*

### War (d12) — Textured
1 Struck down, left for dead; woke remembering nothing · 2–3 Badly hurt, still scarred *(mark)* · 4 Fled to live, the shame stayed · 5–7 Minor wounds, healed clean · 8–9 Survived, but the nights bring it back *(mark)* · 10–11 Unscathed, though many you knew were lost · 12 Borne so well you're remembered as a hero

### Crime (d8) & Punishment (d12)
**Crime:** Murder · Theft · Burglary · Assault · Smuggling · Kidnapping · Extortion · Forgery.
**Punishment:** 1–3 cleared · 4–6 guilty in fact, acquitted · 7–8 nearly caught, fled, wanted *(thread)* · 9–12 caught and convicted — {1d4 years jailed | 1d4 years at the oar | 1d4 years at hard labor | you escaped before sentencing}.

### Weird Stuff (d12) — Strange–Mythic
1 Turned to a toad 1d4 weeks · 2 Turned to stone until freed · 3 A wicked old being held you in thrall 1d6 years · 4 A great wyrm kept you 1d4 months until adventurers killed it *(Volatile)* · 5 Cruel things took you to the deep places below as a slave until you escaped · 6 Served a powerful adventurer as a hireling, recently left *(seed: NPC)* · 7 Lost your mind 1d6 years; a tic lingers *(mark)* · 8 A lover was secretly something far stranger than they seemed · 9 A cult nearly sacrificed you; you fear they'll return *(thread, Volatile)* · 10 You met a being of terrible power and lived *(Volatile)* · 11 Swallowed by a great fish, a month in its gut · 12 A being of terrible power granted you a single wish — squandered on something foolish *(Mythic)*

---

## 4 · Supplemental (called by other rows, or rolled on demand)

- **Alignment** (3d6): 3 chaotic evil/neutral · 4–5 lawful evil · 6–8 neutral evil · 9–12 neutral · 13–15 neutral good · 16–17 lawful good/neutral · 18 chaotic good/neutral.
- **Cause of Death** (d12): 1 unknown · 2 murdered · 3 killed in battle · 4 an accident of their trade · 5 an accident, unrelated · 6–7 natural causes · 8 seemingly by their own hand · 9 torn apart by beast or disaster · 10 devoured by a monster · 11 executed or tortured · 12 something too strange to name.
- **Calling** (d100, the NPC's vocation): 1–5 scholar · 6–10 wanderer (roll Kind & calling again) · 11 aristocrat · 12–26 artisan/guild · 27–31 criminal · 32–36 entertainer · 37–38 exile/hermit/refugee · 39–43 explorer/wanderer · 44–55 farmer/herder · 56–60 hunter/trapper · 61–75 laborer · 76–80 merchant · 81–85 politician · 86–90 priest · 91–95 sailor · 96–00 soldier.
- **Adventuring Class** (d100): Barbarian 1–7 · Bard 8–14 · Cleric 15–29 · Druid 30–36 · Fighter 37–52 · Monk 53–58 · Paladin 59–64 · Ranger 65–70 · Rogue 71–84 · Sorcerer 85–89 · Warlock 90–94 · Wizard 95–00.
- **Kind** (d100, replaces the IP "Race" table with the SRD species): human 1–40 · dwarf 41–50 · elf 51–60 · halfling 61–70 · orc 71–78 · gnome 79–84 · dragonborn 85–90 · goliath 91–95 · fiend-blooded 96–99 · of an uncommon kind 00.
- **Attitude** (3d4): 3–4 hostile · 5–10 friendly · 11–12 indifferent.
- **Status** (3d6): 3 dead *(roll Cause of Death)* · 4–5 missing/unknown · 6–8 alive but poorly · 9–12 alive and well · 13–15 alive and successful · 16–17 alive and infamous · 18 alive and famous.

---

## Seeding map (which rows write the Ledger)
Same as the runtime: **people →** `npc-life`/`canon` + a gazetteer NPC (enemy / friend / important met / lost or dead loved one / life-debt companion / former employer / now-hostile former friend / vanished lover). **threads →** `canon` open thread (wanted for a crime / searching for a vanished lover / a known doorway to elsewhere / a cult that may return / a dream-warning). **marks →** noted on the sheet, not the Ledger (lingering injury, poison-save disadvantage, cowardice, a portent). All write-once, tagged to the originating soul.
