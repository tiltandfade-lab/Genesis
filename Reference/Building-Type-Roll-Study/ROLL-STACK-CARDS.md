# Building Type Roll Study — live stack cards

date: 2026-07-26  
status: deterministic implementation evidence; no gate, adapter, or source row was changed

## Read this first

These are real rolls through the current full-app path. Each of the fourteen live
building kits has three retained samples. The harness searched deterministic seeds
until the unchanged raw d300 happened to land in Grounded, Textured, and
Strange/Volatile/Mythic bands. That search makes the current range inspectable; it
does **not** mean a live typed caller can request a compatible program or Spice band.

Every card exposes the actual layers:

```text
typed kit + realm label
  → one ungated atomic building-interior row
  → optional existing shop stock/economy delegation
  → independently rolled proprietor + ambient cast
  → contact (Tavern alone adds Distant Word/encounter)
```

The d300 band is the only building-interior Spice signal. The typed kit does not
currently bias it, and the returned interior payload does not expose the band except
through its source row reference. Source occupant, proprietor, and ambient cast are
not reconciled.

## Cross-realm isolation result

Each kit was also rolled three times under one identical seed, changing only realm.
In the current building core, all fourteen retained the exact same interior layout,
feature, occupant, and source ref across Frontier/Chrome/Gloom. Realm changes the kit
label; it does not transform the interior. The four shops also retained identical
stock under the mirror seed.

| type | Frontier | Chrome | Gloom | same interior |
|---|---|---|---|---|
| tavern | Tavern | Noodle Bar | The Diner | yes |
| temple | Temple | Street Shrine | White-Steeple Church | yes |
| guildhall | Guildhall | Union Hall | Grange Hall | yes |
| manor | Manor | Penthouse Suite | The Old Family Place | yes |
| garrison | Garrison | Precinct House | Sheriff's Office | yes |
| court | Court | Arbitration Floor | County Courtroom | yes |
| bathhouse | Bathhouse | Steam Den | Public Bathhouse | yes |
| gambling-den | Gambling Den | Basement Fight Pit | The Roadhouse | yes |
| warehouse | Warehouse | Container Stack | Self-Storage Lot | yes |
| dock-house | Dock-House | Loading Dock | Boathouse | yes |
| smithy | Smithy | Machine Shop | The Repair Shop | yes |
| apothecary | Apothecary | Unlicensed Clinic | Drugstore | yes |
| general | General Store | Corner Bodega | Main Street Grocery | yes |
| arcanist | Arcanist's Shop | Chip-and-Splice Stall | The Curiosity Shop | yes |

## Live kit cards

## tavern

- Function: drink, gossip, a room for the night — the town's living room
- Role hint: `tavern-keeper`
- Economy/hook lanes: `lodging` / `rumor`

### grounded — frontier — Tavern

- Receipt/seed: `BLD-TAVERN-GROUNDED` · `2502056449` · `building-interior#108`
- Interior band: **Grounded**
- Layout: Saddler's: front shop, workshop with sewing frames, a leather store.
- Notable feature: A saddle on a specialized frame — built for something other than a horse.
- Source occupant: A saddler who says she built to the specifications provided and didn't ask questions.
- Rolled proprietor: Eleanor — Herbalist or Apothecary
- Ambient cast: Elezia Barani — Baker or Cook; Benearte Valetoni — Laborer, Porter, or Dockhand; Benearte Barani — Mason or Carpenter
- Shop delegation: none
- Contact addition: Tavern Distant Word plus chance-gated encounter

### textured — chrome — Noodle Bar

- Receipt/seed: `BLD-TAVERN-TEXTURED` · `4013587671` · `building-interior#239`
- Interior band: **Textured**
- Layout: A perfumer's where a back consultation room has been sealed -- not locked, sealed, with the door frame plastered over.
- Notable feature: The outline of the door is visible; the plaster is recent.
- Source occupant: A perfumer who says the room was damaged in a fire, nothing was lost, and the replastering was cosmetic. She speaks without pausing.
- Rolled proprietor: Leatea Tavihiva — Miner or Excavator
- Ambient cast: Llewdoc Brancadan — Sellsword or Hired Gun; Caiwyn Dungorn — Bard or Traveling Player; Sybil Hartley — Laborer, Porter, or Dockhand
- Shop delegation: none
- Contact addition: Tavern Distant Word plus chance-gated encounter

### high-spice — gloom — The Diner

- Receipt/seed: `BLD-TAVERN-HIGH-SPICE` · `3535477538` · `building-interior#289`
- Interior band: **Volatile**
- Layout: A shrine where the altar room can only be entered by someone who has lost something and not recovered it.
- Notable feature: Those who enter describe a vast darkness on the other side of the altar. Some don't leave.
- Source occupant: A single priest who lost something decades ago and is able to come and go freely, and finds this a burden.
- Rolled proprietor: Hubert Crane — Servant or Maid
- Ambient cast: Vittoarte Ferlucci — Hunter, Fisher, or Trapper; Ermina — Preacher or Acolyte; John Brackett — Hunter, Fisher, or Trapper
- Shop delegation: none
- Contact addition: Tavern Distant Word plus chance-gated encounter

## temple

- Function: worship, healing, the quiet weight of an old faith
- Role hint: `cleric-or-priest`
- Economy/hook lanes: `none` / `faith`

### grounded — frontier — Temple

- Receipt/seed: `BLD-TEMPLE-GROUNDED` · `745510844` · `building-interior#21`
- Interior band: **Grounded**
- Layout: Schoolroom with rows of desks, a master's dais, a locked cupboard.
- Notable feature: Slates with lessons half-erased, some of the marks not a student's handwriting.
- Source occupant: A schoolmaster correcting work alone after hours; he flinches when the door opens.
- Rolled proprietor: Hedstein Torvvik — Homesteader
- Ambient cast: Kanefer — Landed Gentry
- Shop delegation: none
- Contact addition: soft→hard lock only

### textured — chrome — Street Shrine

- Receipt/seed: `BLD-TEMPLE-TEXTURED` · `1057394248` · `building-interior#256`
- Interior band: **Textured**
- Layout: A physician's with a waiting room that has a clock stopped at the same time every morning -- wound and running all day, stopped by morning.
- Notable feature: The physician notes the time, winds it, and doesn't comment. The time is different each morning.
- Source occupant: A physician who says the clock is eccentric and he's used to it and it doesn't matter for his practice.
- Rolled proprietor: Siomhe Llangorn — Beggar or Urchin
- Ambient cast: Robert Frost — Physician or Midwife
- Shop delegation: none
- Contact addition: soft→hard lock only

### high-spice — gloom — White-Steeple Church

- Receipt/seed: `BLD-TEMPLE-HIGH-SPICE` · `2421537036` · `building-interior#285`
- Interior band: **Strange**
- Layout: A bathhouse where the hot room's temperature is always the temperature each bather needs -- one person may find it just warm enough, another standing next to them may sweat.
- Notable feature: No one who works here has ever noticed anything unusual about this. Only visitors ever remark on it.
- Source occupant: Attendants who are very patient with visitors who want to discuss the temperature.
- Rolled proprietor: Rosyar — Smuggler or Fence
- Ambient cast: Svenand Skadvik — Physician or Midwife
- Shop delegation: none
- Contact addition: soft→hard lock only

## guildhall

- Function: trade politics, dues, a guild's business done behind closed doors
- Role hint: `guildmaster`
- Economy/hook lanes: `faction` / `faction`

### grounded — frontier — Guildhall

- Receipt/seed: `BLD-GUILDHALL-GROUNDED` · `4004792769` · `building-interior#149`
- Interior band: **Grounded**
- Layout: Orphanage: entry hall, a large dormitory, a dining room, an office.
- Notable feature: Dormitory with twenty beds, nineteen children, and twenty sets of possessions.
- Source occupant: A warden who says the child is at lessons; but lessons finished hours ago.
- Rolled proprietor: Norman — Hunter, Fisher, or Trapper
- Ambient cast: Owaidric Morbrogan — Herbalist or Apothecary; Kaifetu Toamoana — Baker or Cook
- Shop delegation: none
- Contact addition: soft→hard lock only

### textured — chrome — Union Hall

- Receipt/seed: `BLD-GUILDHALL-TEXTURED` · `657162067` · `building-interior#246`
- Interior band: **Textured**
- Layout: A cartographer's with a proof archive that has more rolls of vellum than the room could physically hold if they were unrolled.
- Notable feature: The rolls are stacked correctly and are real; the math doesn't work.
- Source occupant: A cartographer who says the room expands to hold what it needs to hold and she has verified this repeatedly. She says it without drama.
- Rolled proprietor: Sukhgal Battur — Laborer, Porter, or Dockhand
- Ambient cast: Mormhe Trenoc — Town Guard or Constable
- Shop delegation: none
- Contact addition: soft→hard lock only

### high-spice — gloom — Grange Hall

- Receipt/seed: `BLD-GUILDHALL-HIGH-SPICE` · `270940879` · `building-interior#266`
- Interior band: **Strange**
- Layout: An apothecary where medicines labeled for one illness cure a different one.
- Notable feature: The substitution is consistent -- not random. The apothecary has mapped it over years. The map is privately useful.
- Source occupant: An apothecary who knows exactly what everything will actually do and is very good at her work.
- Rolled proprietor: Qadah Nafani — Hunter, Fisher, or Trapper
- Ambient cast: Lasira Alqari — Laborer, Porter, or Dockhand
- Shop delegation: none
- Contact addition: soft→hard lock only

## manor

- Function: a family's wealth made into walls; old claims, old grudges
- Role hint: `noble-or-steward`
- Economy/hook lanes: `none` / `intrigue`

### grounded — frontier — Manor

- Receipt/seed: `BLD-MANOR-GROUNDED` · `3155790133` · `building-interior#48`
- Interior band: **Grounded**
- Layout: Letter-writing shop: front bench, two small privacy booths, a letter archive.
- Notable feature: An uncollected letter in the archive dated three years ago, unsealed.
- Source occupant: A letter-writer who has read it and is very quiet about what it says.
- Rolled proprietor: Kamravan Mehdoust — Wheelwright or Ostler
- Ambient cast: Dannad High-hill — Hidden Zealot
- Shop delegation: none
- Contact addition: soft→hard lock only

### textured — chrome — Penthouse Suite

- Receipt/seed: `BLD-MANOR-TEXTURED` · `3177622960` · `building-interior#235`
- Interior band: **Textured**
- Layout: A private hospital with a recovery room that has two doors -- one that leads to the corridor, and one that leads to the same corridor but three feet to the right.
- Notable feature: Both doors open normally. The three feet of corridor between them is, from outside, a solid wall.
- Source occupant: A nurse who says patients use the right door when they're recovering and the left door to transfer rooms; she doesn't say why that works.
- Rolled proprietor: Xoyaotl Cemmani — Laborer, Porter, or Dockhand
- Ambient cast: Iseru — Sellsword or Hired Gun
- Shop delegation: none
- Contact addition: soft→hard lock only

### high-spice — gloom — The Old Family Place

- Receipt/seed: `BLD-MANOR-HIGH-SPICE` · `2402582060` · `building-interior#297`
- Interior band: **Volatile**
- Layout: A great hall where the portraits on the walls track visitors with their painted eyes, and the painted subjects occasionally speak -- quietly, only on topics they would have known in life.
- Notable feature: Two portraits are in an ongoing argument that has been audible since the estate changed hands.
- Source occupant: A steward who has started seating dinner guests away from those two portraits after an incident.
- Rolled proprietor: Coatzin Huitmani — Servant or Maid
- Ambient cast: John Marsh — Tailor or Weaver; Mixtteca Huithuaca — Crafter or Artisan
- Shop delegation: none
- Contact addition: soft→hard lock only

## garrison

- Function: watch, order, the town's sanctioned violence, filed in triplicate
- Role hint: `watch-captain`
- Economy/hook lanes: `none` / `law`

### grounded — frontier — Garrison

- Receipt/seed: `BLD-GARRISON-GROUNDED` · `331723040` · `building-interior#170`
- Interior band: **Grounded**
- Layout: Mast-maker's (inland city, specialty trade): workshop, a timber-selection room, a yard.
- Notable feature: A mast under construction to a length that no local ship requires.
- Source occupant: A mast-maker who says the commission specifies dimensions and that's his job.
- Rolled proprietor: Oppah Scheppen — Tailor or Weaver
- Ambient cast: Cuautli Necalli — Land Baron or Trade Magnate
- Shop delegation: none
- Contact addition: soft→hard lock only

### textured — chrome — Precinct House

- Receipt/seed: `BLD-GARRISON-TEXTURED` · `3965704084` · `building-interior#249`
- Interior band: **Textured**
- Layout: An apothecary's with a cold room that has been cold for twenty years with no ice supply and no apparent mechanism.
- Notable feature: The cold room keeps products at a consistent temperature. The apothecary tested it with a thermometer.
- Source occupant: An apothecary who says she's had three independent assessments and all of them ultimately shrugged.
- Rolled proprietor: Perrin Tealeaf — Herbalist or Apothecary
- Ambient cast: Ardvash Roshfard — Merchant or Trader
- Shop delegation: none
- Contact addition: soft→hard lock only

### high-spice — gloom — Sheriff's Office

- Receipt/seed: `BLD-GARRISON-HIGH-SPICE` · `710149522` · `building-interior#259`
- Interior band: **Strange**
- Layout: A hallway longer than the building is wide from the street.
- Notable feature: Every clock in the house stopped at the same minute.
- Source occupant: A child who answers the question you were about to ask.
- Rolled proprietor: Katut — Crafter or Artisan
- Ambient cast: Valfrid Einheim — Town Guard or Constable; Emmeline — Town Boss
- Shop delegation: none
- Contact addition: soft→hard lock only

## court

- Function: judgment, record, the place disputes go to become official
- Role hint: `magistrate`
- Economy/hook lanes: `none` / `law`

### grounded — frontier — Court

- Receipt/seed: `BLD-COURT-GROUNDED` · `1507325384` · `building-interior#167`
- Interior band: **Grounded**
- Layout: Public notary's hall: waiting room, notary's desk, two witness-chair rooms.
- Notable feature: A witnessed document on the desk where both witnesses signed with the same name.
- Source occupant: A notary who says she noticed but the law allows it if the full name is given.
- Rolled proprietor: Vadania — Herbalist or Apothecary
- Ambient cast: Yafan Hadin — Miner or Excavator
- Shop delegation: none
- Contact addition: soft→hard lock only

### textured — chrome — Arbitration Floor

- Receipt/seed: `BLD-COURT-TEXTURED` · `2701913093` · `building-interior#214`
- Interior band: **Textured**
- Layout: A tailor's with a mirror in the fitting room that shows the room with more people in it than are present.
- Notable feature: The extra figures are always behind the customer, cut off at the shoulder.
- Source occupant: A tailor who says it's an old mirror and a trick of the glass and he keeps meaning to replace it.
- Rolled proprietor: Valna Xiloscient — Hunter, Fisher, or Trapper
- Ambient cast: Nadah — Prospector
- Shop delegation: none
- Contact addition: soft→hard lock only

### high-spice — gloom — County Courtroom

- Receipt/seed: `BLD-COURT-HIGH-SPICE` · `1292725745` · `building-interior#281`
- Interior band: **Strange**
- Layout: A wealthy home where two rooms cannot be seen from the same vantage point -- occupants of one room are invisible to occupants of the other, from any angle.
- Notable feature: The rooms share a wall. Knocking on the wall is audible in both rooms.
- Source occupant: A household that uses this to give family members privacy; they've arranged everything around the limitation.
- Rolled proprietor: Beafina Barlucci — Baker or Cook
- Ambient cast: Safa — Homesteader
- Shop delegation: none
- Contact addition: soft→hard lock only

## bathhouse

- Function: steam, gossip undressed of rank, a rare truce between strangers
- Role hint: `bath-keeper`
- Economy/hook lanes: `none` / `rumor`

### grounded — frontier — Bathhouse

- Receipt/seed: `BLD-BATHHOUSE-GROUNDED` · `1210375956` · `building-interior#83`
- Interior band: **Grounded**
- Layout: Tinker's cottage: front room as workshop, living room behind, a cellar for supplies.
- Notable feature: A collection of small repaired items no one has retrieved — some quite old.
- Source occupant: A tinker who says she doesn't throw things away because eventually someone always comes.
- Rolled proprietor: Caithne Galgorn — Crafter or Artisan
- Ambient cast: Rayad Dadin — Company / railroad agent
- Shop delegation: none
- Contact addition: soft→hard lock only

### textured — chrome — Steam Den

- Receipt/seed: `BLD-BATHHOUSE-TEXTURED` · `3721337481` · `building-interior#256`
- Interior band: **Textured**
- Layout: A physician's with a waiting room that has a clock stopped at the same time every morning -- wound and running all day, stopped by morning.
- Notable feature: The physician notes the time, winds it, and doesn't comment. The time is different each morning.
- Source occupant: A physician who says the clock is eccentric and he's used to it and it doesn't matter for his practice.
- Rolled proprietor: Citchil Cempoca — Hunter, Fisher, or Trapper
- Ambient cast: Itzcatl Coatlan — Merchant or Trader
- Shop delegation: none
- Contact addition: soft→hard lock only

### high-spice — gloom — Public Bathhouse

- Receipt/seed: `BLD-BATHHOUSE-HIGH-SPICE` · `1380412728` · `building-interior#297`
- Interior band: **Volatile**
- Layout: A great hall where the portraits on the walls track visitors with their painted eyes, and the painted subjects occasionally speak -- quietly, only on topics they would have known in life.
- Notable feature: Two portraits are in an ongoing argument that has been audible since the estate changed hands.
- Source occupant: A steward who has started seating dinner guests away from those two portraits after an incident.
- Rolled proprietor: Soveliss Caerdonel — Miner or Excavator
- Ambient cast: Setihotep — Crafter or Artisan
- Shop delegation: none
- Contact addition: soft→hard lock only

## gambling-den

- Function: dice, cards, debts that outlive the hand that lost them
- Role hint: `den-runner`
- Economy/hook lanes: `faction` / `debt`

### grounded — frontier — Gambling Den

- Receipt/seed: `BLD-GAMBLING-DEN-GROUNDED` · `3420698490` · `building-interior#169`
- Interior band: **Grounded**
- Layout: Wool-dyer's: a large vat room, a color-mixing room, a sample collection.
- Notable feature: A sample of a color that doesn't reproduce -- the dye formula is incomplete and no one knows why.
- Source occupant: A dyer who's been trying to reverse-engineer the formula from the sample for two years.
- Rolled proprietor: Faraz Zahim — Foreign Settler or Drifter
- Ambient cast: Rakir — Reluctant Officeholder; Llewdoc Dungan — Town Guard or Constable
- Shop delegation: none
- Contact addition: soft→hard lock only

### textured — chrome — Basement Fight Pit

- Receipt/seed: `BLD-GAMBLING-DEN-TEXTURED` · `1991543971` · `building-interior#213`
- Interior band: **Textured**
- Layout: A gaoler's house with a room in the basement that has a door with no lock -- the door simply won't open.
- Notable feature: When knocked, the room sounds full. When opened (it eventually opens), it is empty.
- Source occupant: A gaoler who says it was always like that and he uses it for storage, and gestures at the empty room.
- Rolled proprietor: Oyuzaya — Herbalist or Apothecary
- Ambient cast: Morain — Miner or Excavator
- Shop delegation: none
- Contact addition: soft→hard lock only

### high-spice — gloom — The Roadhouse

- Receipt/seed: `BLD-GAMBLING-DEN-HIGH-SPICE` · `3602676890` · `building-interior#281`
- Interior band: **Strange**
- Layout: A wealthy home where two rooms cannot be seen from the same vantage point -- occupants of one room are invisible to occupants of the other, from any angle.
- Notable feature: The rooms share a wall. Knocking on the wall is audible in both rooms.
- Source occupant: A household that uses this to give family members privacy; they've arranged everything around the limitation.
- Rolled proprietor: Itzcatl — Laborer, Porter, or Dockhand
- Ambient cast: Ermina Bell — Hunter, Fisher, or Trapper; Mialee Galanodel — Hunter, Fisher, or Trapper
- Shop delegation: none
- Contact addition: soft→hard lock only

## warehouse

- Function: crates stacked to the rafters; whatever's inside is somebody's whole margin
- Role hint: `warehouse-foreman`
- Economy/hook lanes: `goods` / `smuggling`

### grounded — frontier — Warehouse

- Receipt/seed: `BLD-WAREHOUSE-GROUNDED` · `2889261495` · `building-interior#59`
- Interior band: **Grounded**
- Layout: Tradesman's cottage with a workshop attached: living room, kitchen, workshop through an internal door.
- Notable feature: The workshop floor swept clean, tools arranged, a half-finished piece covered with a cloth.
- Source occupant: The tradesman's spouse, who says he went out this morning and that's all she knows.
- Rolled proprietor: Marcello Valeoni — Preacher or Acolyte
- Ambient cast: Lucrebella — Company / railroad agent
- Shop delegation: none
- Contact addition: soft→hard lock only

### textured — chrome — Container Stack

- Receipt/seed: `BLD-WAREHOUSE-TEXTURED` · `1326227954` · `building-interior#222`
- Interior band: **Textured**
- Layout: A temple with a secondary shrine room that doesn't appear to have any exterior wall -- it's surrounded on all sides by interior space.
- Notable feature: The shrine inside has no deity associated with the temple -- a different faith's image, much older.
- Source occupant: A priest who says it was here when they built around it and the two faiths have an arrangement.
- Rolled proprietor: Nafirah Hahari — Cutpurse or Burglar
- Ambient cast: Quarion Iranapha — Tailor or Weaver
- Shop delegation: none
- Contact addition: soft→hard lock only

### high-spice — gloom — Self-Storage Lot

- Receipt/seed: `BLD-WAREHOUSE-HIGH-SPICE` · `3123442443` · `building-interior#300`
- Interior band: **Mythic**
- Layout: Beyond the threshold is a space the size of a cathedral nave, floored with soil, roofed with the underside of the night sky -- stars visible, but wrong stars in the wrong season.
- Notable feature: A tree grows from the floor to the ceiling, old past any natural reckoning, and one door is set into its trunk.
- Source occupant: In the roots, something that was once a person, woven into the wood, speaking in a voice like growth rings, answering any question put to it with absolute truth -- about things that haven't happened yet.
- Rolled proprietor: Daayeh Roshdoust — Hunter, Fisher, or Trapper
- Ambient cast: Mary Hedley — Smuggler or Fence; Reynard Marsh — Farmer or Grower
- Shop delegation: none
- Contact addition: soft→hard lock only

## dock-house

- Function: harbor business, tide-tables, cargo manifests that don't always match the hold
- Role hint: `harbormaster`
- Economy/hook lanes: `goods` / `smuggling`

### grounded — frontier — Dock-House

- Receipt/seed: `BLD-DOCK-HOUSE-GROUNDED` · `3672417` · `building-interior#27`
- Interior band: **Grounded**
- Layout: Moneylender's office: a waiting bench, a screened interview room, a locked strong room.
- Notable feature: Rows of small wax seals by the desk, each bearing a different crest.
- Source occupant: A moneylender who knows why you're here before you say it.
- Rolled proprietor: Naraz — Town Guard or Constable
- Ambient cast: Nedda — Hunter, Fisher, or Trapper; Branwal Cadgan — Hidden Zealot; Haraz Bahari — Herbalist or Apothecary; Qadah — Baker or Cook; Dazan Bazadeh — Farmer or Grower; Giselle Rooke — Hidden Zealot
- Shop delegation: none
- Contact addition: soft→hard lock only

### textured — chrome — Loading Dock

- Receipt/seed: `BLD-DOCK-HOUSE-TEXTURED` · `1060960202` · `building-interior#236`
- Interior band: **Textured**
- Layout: A pawnbroker's with a display room whose walls are shelved floor to ceiling -- but the visible shelves from outside don't account for the height.
- Notable feature: One shelf row, near the top, appears to be inside the ceiling if viewed from outside the building.
- Source occupant: A pawnbroker who says the building settled and the survey was wrong to begin with.
- Rolled proprietor: Emma Crane — Marshal / lawman
- Ambient cast: Bjorolf Ravngard — Foreign Settler or Drifter; Aelar Ilphelkiir — Servant or Maid; Baterdene Chuluuerdene — Crafter or Artisan
- Shop delegation: none
- Contact addition: soft→hard lock only

### high-spice — gloom — Boathouse

- Receipt/seed: `BLD-DOCK-HOUSE-HIGH-SPICE` · `4151014895` · `building-interior#269`
- Interior band: **Strange**
- Layout: A kitchen where food cooked in it feeds hunger in the wrong direction -- eating fills a hunger you didn't know you had, and leaves the ordinary hunger.
- Notable feature: Eaters report feeling satisfied in a way that isn't about food. Some return daily.
- Source occupant: A cook who knows what the kitchen does and considers it a gift and a responsibility.
- Rolled proprietor: Stenrik Storberg — Wheelwright or Ostler
- Ambient cast: Ulfvald Fjeldottir — Farmer or Grower; Ivargard Vindrun — Prospector; Altnai Ganerdene — Blacksmith or Farrier; Aritsetseg — Caravan Guard or Outrider; Battur Chuluujargal — Town Guard or Constable; Dorjbaatar Baterdene — Town Boss; Thoradis Storberg — Town Guard or Constable; Temkhan Chuluugan — Hunter, Fisher, or Trapper
- Shop delegation: none
- Contact addition: soft→hard lock only

## smithy

- Function: the forge-heat, the ring of hammer on steel, edges made and mended
- Role hint: `smith`
- Economy/hook lanes: `shop` / `commerce`

### grounded — frontier — Smithy

- Receipt/seed: `BLD-SMITHY-GROUNDED` · `2378519678` · `building-interior#187`
- Interior band: **Grounded**
- Layout: Apothecary's charitable dispensary (poor quarter): a counter room, a stock room, a physician's visiting room.
- Notable feature: A medicine prepared to a prescription signed by a physician who died last winter.
- Source occupant: An assistant who says the prescription was renewable and it was signed before he died.
- Rolled proprietor: Narabold Dorjgal — Blacksmith or Farrier
- Ambient cast: Ochir Dorjgan — Hunter, Fisher, or Trapper; Iseankhu Khatepu — Hunter, Fisher, or Trapper
- Shop delegation: smith · Sun Blade ×1; Chain Mail ×2; Sword of Life Stealing ×2; Trident of Fish Command ×2; Light Hammer ×2
- Contact addition: soft→hard lock only

### textured — chrome — Machine Shop

- Receipt/seed: `BLD-SMITHY-TEXTURED` · `3906533191` · `building-interior#223`
- Interior band: **Textured**
- Layout: A printer's where the proofing room is at the basement level but has a window with an unobstructed view of the street.
- Notable feature: The street outside the window is at pavement level -- which is three feet above the room's floor.
- Source occupant: A printer who says the window was there first and the pavement was raised and it's very useful for watching feet.
- Rolled proprietor: Moeia Lelehiva — Baker or Cook
- Ambient cast: Theren Berevan — Caravan Guard or Outrider
- Shop delegation: smith · Mace of Smiting ×1; Lance ×2; Greatsword ×3; Plate Armor ×3; Scimitar ×1
- Contact addition: soft→hard lock only

### high-spice — gloom — The Repair Shop

- Receipt/seed: `BLD-SMITHY-HIGH-SPICE` · `337931532` · `building-interior#271`
- Interior band: **Strange**
- Layout: A locksmith's where every lock in the display will open to any key, including keys that don't match.
- Notable feature: The lock's own key also works. As does a bent nail. As does a finger. But only in this building.
- Source occupant: A locksmith who sells the locks as demonstration models and notes the caveat. They sell well.
- Rolled proprietor: Qazan Suyani — Town Guard or Constable
- Ambient cast: Aoiwyn Tregorn — Merchant or Trader
- Shop delegation: smith · Glamoured Studded Leather ×1; Splint Armor ×2; Flame Tongue ×2; Studded Leather Armor ×1; Mace ×3
- Contact addition: soft→hard lock only

## apothecary

- Function: dried herbs, tinctures, a cure or a poison depending who's asking
- Role hint: `apothecary`
- Economy/hook lanes: `shop` / `commerce`

### grounded — frontier — Apothecary

- Receipt/seed: `BLD-APOTHECARY-GROUNDED` · `3246674199` · `building-interior#109`
- Interior band: **Grounded**
- Layout: Dice-maker's (niche): workshop, a small showroom, a quality-control room with test surfaces.
- Notable feature: A set of dice in the quality room that don't total to standard faces.
- Source occupant: A dice-maker who says those aren't for sale.
- Rolled proprietor: Aline Carrow — Laborer, Porter, or Dockhand
- Ambient cast: Svenand Ulfdottir — Blacksmith or Farrier; Thormund Bjarfjord — Miner or Excavator
- Shop delegation: apothecary · Potion of Healing ×5; Lantern, Bullseye ×3; Poison, Basic ×1; Potion of Diminution ×3; Potion of Water Breathing ×2
- Contact addition: soft→hard lock only

### textured — chrome — Unlicensed Clinic

- Receipt/seed: `BLD-APOTHECARY-TEXTURED` · `2216014264` · `building-interior#223`
- Interior band: **Textured**
- Layout: A printer's where the proofing room is at the basement level but has a window with an unobstructed view of the street.
- Notable feature: The street outside the window is at pavement level -- which is three feet above the room's floor.
- Source occupant: A printer who says the window was there first and the pavement was raised and it's very useful for watching feet.
- Rolled proprietor: Seraphina Stoutman — Herbalist or Apothecary
- Ambient cast: Baterdene Zolgal — Physician or Midwife
- Shop delegation: apothecary · Potion of Healing ×3; Spyglass ×2; Ram, Portable ×3; Holy Water ×2; Potion of Gaseous Form ×3
- Contact addition: soft→hard lock only

### high-spice — gloom — Drugstore

- Receipt/seed: `BLD-APOTHECARY-HIGH-SPICE` · `2456181772` · `building-interior#289`
- Interior band: **Volatile**
- Layout: A shrine where the altar room can only be entered by someone who has lost something and not recovered it.
- Notable feature: Those who enter describe a vast darkness on the other side of the altar. Some don't leave.
- Source occupant: A single priest who lost something decades ago and is able to come and go freely, and finds this a burden.
- Rolled proprietor: Parbahar Roshyar — Circuit judge
- Ambient cast: Dutino Barlucci — Homesteader
- Shop delegation: apothecary · Potion of Healing ×2; Small Knife ×1; Caltrops ×2; Spellbook ×2; Potion of Gaseous Form ×1
- Contact addition: soft→hard lock only

## general

- Function: rope, rations, nails — the unglamorous stuff a party actually runs out of
- Role hint: `shopkeeper`
- Economy/hook lanes: `shop` / `commerce`

### grounded — frontier — General Store

- Receipt/seed: `BLD-GENERAL-GROUNDED` · `2475143041` · `building-interior#134`
- Interior band: **Grounded**
- Layout: Damp-ground-floor room beneath a wealthier residence: a single room, a servant's cot, a coal store.
- Notable feature: A hole in the wall between this room and the one above, neatly made and covered with cloth.
- Source occupant: A servant who says she doesn't know about the hole and seems very tired.
- Rolled proprietor: Lucrefina Verone — Merchant or Trader
- Ambient cast: Adelaide Fenwick — Farmer or Grower
- Shop delegation: general · Thieves’ Tools ×1; Lantern, Hooded ×2; Alchemist’s Fire ×2; Candle ×2; Soap ×2
- Contact addition: soft→hard lock only

### textured — chrome — Corner Bodega

- Receipt/seed: `BLD-GENERAL-TEXTURED` · `3902786168` · `building-interior#251`
- Interior band: **Textured**
- Layout: A merchant's warehouse with a sealed loft that requires going outside and up an external stair, then back in via a roof hatch.
- Notable feature: The loft contains a table, two chairs, and correspondence addressed to neither the merchant nor any known associate.
- Source occupant: A warehouse manager who says the loft was in use when the merchant took the lease and the correspondence was there.
- Rolled proprietor: Dannad Hilltopple — Smuggler or Fence
- Ambient cast: Nalral Daerdahk — Farmer or Grower
- Shop delegation: general · Glassblower’s Tools ×2; Bedroll ×3; Poison, Basic ×1; Healer’s Kit ×2; Ink ×2
- Contact addition: soft→hard lock only

### high-spice — gloom — Main Street Grocery

- Receipt/seed: `BLD-GENERAL-HIGH-SPICE` · `503982460` · `building-interior#294`
- Interior band: **Volatile**
- Layout: A warehouse where the inventory physically resists being removed -- items can be moved within the building but not taken through the doors.
- Notable feature: A very large amount of extremely valuable cargo is inside. Buyers are waiting. No one has found a solution.
- Source occupant: A warehouse factor who is professionally controlled about this and is on his third specialist.
- Rolled proprietor: Shayad Zazadeh — Bandit or Road-agent
- Ambient cast: Dayad Rushqari — Town Boss
- Shop delegation: general · Druidic Focus (sprig Of Mistletoe) ×3; Tinker’s Tools ×3; Sealing Wax ×2; Pot, Iron ×1; Spyglass ×2
- Contact addition: soft→hard lock only

## arcanist

- Function: components, scrolls, a proprietor who prices curiosity by the ounce
- Role hint: `arcanist`
- Economy/hook lanes: `shop` / `commerce`

### grounded — frontier — Arcanist's Shop

- Receipt/seed: `BLD-ARCANIST-GROUNDED` · `2109328612` · `building-interior#133`
- Interior band: **Grounded**
- Layout: Counting house branch: public counter, a private transactions room, a strongroom.
- Notable feature: A receipt stamped but not filled in.
- Source occupant: A teller who says it's a draft form and they're normal; he's not convincing.
- Rolled proprietor: Emma Marsh — Baker or Cook
- Ambient cast: Manfred — Sellsword or Hired Gun; Gudhild — Farmer or Grower
- Shop delegation: arcanist · Arcane Focus (quarterstaff) ×2; Pot, Iron ×3; Iron Bands ×1; Lamp ×3; Pole ×2
- Contact addition: soft→hard lock only

### textured — chrome — Chip-and-Splice Stall

- Receipt/seed: `BLD-ARCANIST-TEXTURED` · `2529070144` · `building-interior#205`
- Interior band: **Textured**
- Layout: A shrine with an antechamber, a main chamber, and a back room that appears in no floor plan of the building.
- Notable feature: The back room's walls are covered in the same prayer, floor to ceiling, in different handwriting.
- Source occupant: An attendant who says worshippers add a line when their prayer is answered. He doesn't know how many there are.
- Rolled proprietor: Sarah Carrow — Wanted outlaw
- Ambient cast: Bjorvald — Physician or Midwife; Duarte Saloni — Beggar or Urchin
- Shop delegation: arcanist · Holy Water ×3; Bell ×2; Lantern, Bullseye ×2; Gem of Seeing ×2; Horn of Valhalla ×2
- Contact addition: soft→hard lock only

### high-spice — gloom — The Curiosity Shop

- Receipt/seed: `BLD-ARCANIST-HIGH-SPICE` · `95520570` · `building-interior#272`
- Interior band: **Strange**
- Layout: A tower room at the top of a house with no stair to it -- accessible only by a ladder that isn't there when you look for it.
- Notable feature: The room contains a bed, a desk, correspondence, and a window with a view of a street in a different city.
- Source occupant: No current occupant. The correspondence is dated this week.
- Rolled proprietor: Meni Nefernet — Wheelwright or Ostler
- Ambient cast: Nefesheri Khatepu — Farmer or Grower
- Shop delegation: arcanist · Chest ×3; Crowbar ×2; Chime of Opening ×3; Paper ×3; Oil ×3
- Contact addition: soft→hard lock only

## Prison / Custody — actual current boundary

`rollBuilding("prison")` returns:

```json
{"ok":false,"reason":"unknown-type"}
```

There is no live Prison building kit. The current nouns arrive through separate
surfaces:

### Live capture noun rolls

- `3320335945` — Held for ransom; a black-iron cell; they missed one thing — you still have it on you; opening: a sympathetic guard who hates this work
- `3270003088` — Execution pending; a root-cellar gaol; the captor's boss keeps your finest piece; opening: a tool they failed to take from you
- `3286780707` — Trade-bait / hostage; an oubliette beneath the floor; they missed one thing — you still have it on you; opening: a bar already loose in its setting

### Raw d300 custody rows reached through the untyped roller

- `building-interior#19` · **Grounded** — Gaol: guard room, four cells on one side, a debtors' pen at the end. Feature: A cell that is unlocked from the inside. Inside: A turnkey asleep, a prisoner awake, and someone in the shadows watching both.
- `building-interior#78` · **Grounded** — Magistrate's holding office attached to a gaol: intake room, records room, a single lockable interview room. Feature: A warrant on the desk signed and dated but the subject-name left blank. Inside: A clerk who says that's unusual but the magistrate signed it and that's not his affair.
- `building-interior#213` · **Textured** — A gaoler's house with a room in the basement that has a door with no lock -- the door simply won't open. Feature: When knocked, the room sounds full. When opened (it eventually opens), it is empty. Inside: A gaoler who says it was always like that and he uses it for storage, and gestures at the empty room.

### Live dungeon-area custody rows

- `dungeon-area-type#66` — Mid-Size Chamber; 20' x 30' rectangle; 10' x 10' cage built into the far wall; iron bars, door missing its lock mechanism.
- `dungeon-area-type#69` — Long Chamber; 20' x 40' rectangle; 10' x 10' attached holding cell at the far end; barred window in the door.
- `dungeon-area-type#150` — Prison Block; 30' x 50' rectangle; Ten 5' x 10' cells flanking the central hall; each has a barred door, most hanging open.

Urban Area Type also contains Suspended Cage `#160` and Prison Block `#165`,
but those rows are authored-unwired for `rollUrbanWalk`. Site 6's compiler is
specified but unbuilt. This is source breadth, not yet one layered prison roll.

## Verdict from the receipts

- The walks' flavor/Spice relationship is **not** currently reproduced by typed
  buildings.
- The atomic d300 contributes real variation and its own Spice ladder.
- Kit function, realm label, interior, proprietor, ambient cast, and—in Tavern's
  case—contact content stack mechanically, but mostly as independent draws.
- Shop kits have one genuinely reconciled layer: their inventory delegates to the
  correct existing economy archetype.
- The accepted family-chassis/program-layer work must be proven with a second after-state cohort
  using these exact receipts as the before-state baseline.

