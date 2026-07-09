---
type: scratch
status: experimental
created: 2026-07-09
realm: gloom
---

# Sprite Batch Prompts — Gloom (the town that made a deal / Derry)

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the Gloom realm bestiary (119 monsters) plus a
themed NPC roster (43 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). muted desaturated palette — sickly yellow streetlight against blue-grey dusk, soft grain/dither texture, one unnervingly saturated warm accent color per figure (the wrongness marker), otherwise low-contrast murky background.

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (119 total, 5 sheets)

### Monster sheet 1/5

1. **Threshold Rat** — Vermin omen fleeing whatever else lives here
2. **Guttered Wick** — Drifting corpse-light that steals your shadow
3. **Grinning Poppet** — The haunted doll that creeps when unwatched
4. **Pallid Newcomer** — Fresh-buried neighbor still walking its route
5. **Bone-Rattle Skeleton** — Reassembled grave-bones, a cult's patient tool
6. **Zealous Initiate** — Robed true-believer running the ritual anyway
7. **Static Reflection** — Mirror-double, one second behind, draining you
8. **Rot-Handed Ghoul** — Grave-eater whose bite paralyzes the mourner
9. **Moonshackled Cur** — Half-turned wolf-thing running with the pack
10. **Household Poltergeist** — Decades-long tantrum that throws the furniture
11. **Cellar Warden** — The cult's own guard now opening the door
12. **Full-Moon Shepherd** — The neighbor who wears a wolf's face at midnight
13. **Hollow-Robed Zealot** — Self-mummified elder still preaching to no one
14. **Possessed Vessel** — A person worn like a coat, blinking wrong
15. **The Slow Reflection** — Ghost one second behind, plotting to catch up
16. **Grief-Fed Banshee** — Wailing widow owed a wake that never came
17. **Coven Matriarch** — Coven matriarch trading in stolen sleep and souls
18. **Marrow Revenant** — Undead thing that only wants its killer, unerringly
19. **Candlewax Doppelganger** — Melting face that copies whoever stares longest
20. **Congregation Made Flesh** — A coven's dozen bodies fused into one prayer
21. **Warden of the Cellar Door** — Vampire bound to the door that's never shut
22. **Bell-Tolling Revenant** — Bell-tower revenant tolling once per debt owed
23. **The Second Face in the Glass** — Elder vampire kingpin living inside the mirrors
24. **The Uninvited** — Ancient thing that only ever needs one knock
25. **The Possession at the Root** — A congregation's willing vessels burned to one shape

### Monster sheet 2/5

1. **Crawlspace Widow** — Attic spider that drops on sleepers
2. **Threadbare Scarecrow** — Straw effigy that walks after moonrise
3. **Ashen Widow's Cat** — Unblinking cat that tracks the dead
4. **Gutter Wraith** — Drowned grudge haunting the storm drains
5. **Wick-Eyed Changeling Child** — Cradle-swapped child with a widening smile
6. **Tallow Ghoul** — Candle-vigil ghoul dripping rendered fat
7. **Splintered Marionette** — Self-cut puppet bowing to an empty house
8. **Bog-Sunk Revenant** — Peat-bog hanged man risen with the noose
9. **Pox-Marked Thrall** — Plague villager thralled to a whisper
10. **Feral Barn Bat-Swarm** — Bell-triggered swarm pouring from the rafters
11. **Rope-Burned Suicide** — Hanging-tree haunt re-living its last minute
12. **Hollow Nursemaid** — Lullaby-humming absence in the nursery wall
13. **Cur of the Black Barn** — Loyal farm dog that starved and rose wrong
14. **Rat-King Knot** — Tail-fused rats forming one furious knot
15. **Choir-Loft Poltergeist** — Organist's fury slamming hymnals and bellropes
16. **Gravecloth Zombie** — Shroud-stitched exhumee lurching by grave-light
17. **Fen Ghoul** — Crypt-nesting ghoul with silt-slick claws
18. **Beast of the Full Moon Runt** — Freshly bitten victim terrified of itself
19. **Wax-Sealed Familiar** — Coven crow with a beak sewn shut
20. **Sackcloth Effigy** — Hair-stitched poppet animated by a pinned name
21. **Ossuary Skitterling** — Severed charnel-wall hand scrabbling homeward
22. **Lantern-Jawed Corpse Candle** — Grave-light that feeds on following mourners
23. **Widow's Veil Shade** — Mirror-shed silhouette that grieves at funerals
24. **Feasting Cellar Grub** — Pale centipede fattened on deeper offerings
25. **Rusalka's Drowned Bride** — Jilted drowned bride walking out dripping

### Monster sheet 3/5

1. **Fanged Chorister** — Hymn-voiced ghoul luring the faithful closer
2. **Marrow Beetle Swarm** — Grave-beetle carpet that strips corpses clean
3. **Bell-Jar Wraith** — Failed experiment reaching for its notes
4. **Attic-Bound Revenant** — Locked-away relative still pacing six feet
5. **Coven Apprentice** — Hedge-witch initiate half in love with the dark
6. **Reliquary Ghast** — Stolen saint's corpse gone hungry in vestments
7. **Ossified Bell-Ringer** — Skeleton still ringing an unheard dusk bell
8. **Charnel-Yard Skeleton Archer** — Crossbow skeleton still holding its cemetery post
9. **Full-Moon Enforcer** — Pack lieutenant hiding claws until convenient
10. **Steeple Bloodkin** — Choirmaster vampire leading hymns with stitched smile
11. **The Weeping Bride** — Jilted ghost bride whose scream shatters glass
12. **Warden of the Drowning Pool** — Cursed executioner guarding the drowning pool
13. **Hollow-Throated Ghast Priest** — Defrocked cleric who joined his flock's feast
14. **Coven Hexweaver** — Coven's youngest sister, bargains cruelly
15. **The Mirror-Bound Twin** — Face-stealing reflection waiting in every mirror
16. **Rite-Scarred Zealot Captain** — Ritual leader scarred with a forbidden name
17. **Charnel-House Ogre Zombie** — Gravedigger's corpse raised by his own rite
18. **The Second Groom** — Jilted suitor presiding over an eternal reception
19. **Loomstitch Doppelganger** — Face-thief impersonating the beloved village elder
20. **Gallows Wraith Captain** — Hanged highwayman commanding lesser gibbet-spirits
21. **Vestry Revenant** — Swollen sexton digging until his killer's found
22. **Cellar-Bound Bulette Grub** — Burrowing horror surfacing through open graves
23. **Coven Matron's Cauldron-Kin** — Second matriarch trading in nightmares, not curses
24. **Blood-Thrall Chevalier** — Centuries-loyal knight thrall, still starving
25. **Ashfall Mummy Curate** — Punished elder mummified alive, still shepherding

### Monster sheet 4/5

1. **Marrow-Bound Wererat Broker** — Sewer relic-fixer who bites debtors
2. **Widow-Maker Banshee Elder** — Generations-old wail that claims every husband
3. **Coffin-Nail Wight Sergeant** — Buried captain drilling reanimated ranks by night
4. **Blood-Drunk Vampire Familiar Knight** — Turned squire guarding the coffin, hunting by dusk
5. **Seance Circle Medium** — Parlor medium who opened a door she can't close
6. **Effigy-Bound Flesh Golem** — Resurrectionist's patchwork sewn from village corpses
7. **The Uninherited Heir** — Disinherited ghost rewriting the will in blood
8. **Coven Familiar Alpha** — Coven-bound wolf whose howl carries a curse
9. **Rot-Crowned Spirit Naga** — Serpentine grave-idol worshipped as a saint
10. **The Chained Confessor** — Fused inquisition victims forced to confess
11. **Blood-Countess's First Spawn** — Ancient childe groomed to replace the matriarch
12. **Church-Broken Death Knight** — Crusader who slaughtered his flock, guards its grave
13. **The Cellar Door's Real Keeper** — Generation-fed tunneling horror mistaken for legend
14. **Matriarch of the Full Moon Pack** — Alpha whose bite founds a whole bloodline
15. **The Archivist of Screams** — Librarian who became the sum of every scream
16. **Blightmother's Chosen Vessel** — Cult conduit to something old beneath the church
17. **The Reflection That Escaped** — Mirror-escaped vampire hunting its former family
18. **Wax Cathedral Sentinel** — Vigil-wax colossus animated by a century of grief
19. **The Possessed Cardinal** — Church official possessed, sermons not his own
20. **Gravebound Necrohulk** — Mass grave grown into a fungal flesh horror
21. **The Hollow Cardinal Enthroned** — Mummified saint-king ruling a dead congregation
22. **The Bloodline's First Sin** — Founding ancestor enforcing the house's damning pact
23. **The Rite Given Flesh** — Century-long ritual completed as living flesh
24. **Grand Matriarch of the Blood Court** — Vampire queen who transcended into lichdom
25. **The Everlasting Congregation** — Entire drowned parish fused into one singing mass

### Monster sheet 5/5

1. **the Bloodless Bride** — shuffling grave-bride, drawn to warmth and mourning
2. **Renfield's Kin** — insect-eating thrall serving something undead
3. **the Carrion Wolf** — grave-fed wolf edging toward the curse
4. **Fog-Walker** — fog-bound phantom hound, harmless in clear air
5. **the Somnambulist** — a townsperson's cruel second self, out after dark
6. **Ashen Handmaiden** — loyal ghost-servant, stuck in a burned house's routine
7. **Innsmouth Hollow-Kin** — gill-marked villager with an unspoken tide-hunger
8. **the Wolf-Cursed** — the classic moon-bound curse, mid-transformation
9. **the Steward of the House** — eloquent, grieving, stitched-together giant
10. **Lady of the Blood Countess's Line** — patient, affectionate centuries-old blood-drinker
11. **the Riderless Terror** — headless rider hunting a replacement skull, every autumn
12. **the Unseen Guest** — invisible chemist, tracked by breath and footprints
13. **the Portrait's Truth** — ageless beauty whose hidden portrait holds the rot
14. **the Baba Yaga** — chicken-legged hut-witch who judges before she helps
15. **the Gorgon's Daughter** — gaze-cursed gorgon, curating a garden of statues
16. **the Opera-House Phantom** — masked genius-architect ruling from beneath the stage
17. **the Impaler-Count** — ancient, courtly count who owns the road home
18. **the Woeful Cry** — keening death-omen spirit; herald, not killer
19. **the House That Remembers** — a haunted manor that rearranges itself to relive its dead

---

## NPC batches (75 total, 3 sheets)

**Population diversity (binding):** vary skin tone, ethnicity, hair texture, build, and age across the full roster below — a sheet where every face reads as the same ethnicity is a failure, not a style choice, regardless of realm. This realm's population also includes a small visibly-touched minority consistent with the town's supernatural undercurrent (see the final entries below) — it must read as a minority tell, not the norm, alongside an ethnically varied ordinary majority.

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). muted desaturated palette — sickly yellow streetlight against blue-grey dusk, soft grain/dither texture, one unnervingly saturated warm accent color per figure (the wrongness marker), otherwise low-contrast murky background.

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/3

1. **Tenant farmer** — Tied to the land and its seasons; the base everyone eats from.
2. **Trapper** — Reads the wild and brings in what the settled can't.
3. **Corpse-cart driver** — Moves the heavy things; sees everything, is asked nothing.
4. **Gravedigger** — Works the dark and the tight places; patient underground.
5. **Manor servant** — Invisible to the powerful, and so hears every secret.
6. **Outcast beggar** — Has nothing, so knows the streets better than anyone.
7. **Ward-carver** — Their tools carry their whole history.
8. **Iron-ward smith** — Calloused hands; deals in practical defense.
9. **Baker** — Up before dawn; holds the neighborhood's gossip.
10. **Mason** — Reads every structure out of habit; knows what's load-bearing.
11. **Shroud-sewer** — Notices the cut and quality of everyone's clothes.
12. **Traveling peddler** — Information-rich, truth-poor.
13. **Innkeeper** — Controls the space, not the people in it.
14. **Hedge-witch** — Smells of bitterroot; knows what heals and what doesn't.
15. **Village physician** — Trusted, and overburdened by it.
16. **Ward-keeper** — Maintains the ritual, not the doctrine.
17. **Village constable** — Authority-adjacent, with limited real power.
18. **Paid exorcist** — Loyalty bought with coin, and cynical about it.
19. **Crossroads warden** — Wary of the road; values a good pair of boots.
20. **Body-snatcher** — Desperate or cruel; lives outside the law.
21. **Cursed-relic runner** — Hides the cargo; speaks only in euphemism.
22. **Grave-goods thief** — Eyes every coin-pouch; avoids every eye.
23. **Secret cultist** — Fanatical devotion behind a mundane face.
24. **Cult recruiter** — Charisma aimed at the desperate; sells belonging.
25. **The newcomer who stayed** — Chose to stay here; the reasons stay unclear.

### NPC sheet 2/3

1. **Hermit at the tree-line** — Known of, rarely seen.
2. **Acting elder** — Filling in for someone absent; borrowed authority.
3. **The one the village answers to** — Power without a title.
4. **Reluctant keeper** — Unqualified, unwilling, or both — and in the role anyway.
5. **Manor gentry** — Wealthy, bored, insulated from real consequence.
6. **Mill-owner** — Sees every interaction as a transaction.
7. **Occult researcher** — Hoards the secret knowledge; sees others as material.
8. **The stranger who came the night it started** — Their very presence is the notable thing.
9. **Cunning-folk / exorcist** — Deals with the thing that answered; charges in debts you don't want to owe.
10. **The marked** — Carries a doom they never asked for; people cross the street.
11. **Sin-eater** — Keeps the dead down — or takes on what they left behind.
12. **Occult collector** — Hoards the objects that shouldn't be kept. One of them is awake.
13. **Kin-of-the-afflicted** — Holds the household together directly over the cellar door.
14. **Taboo-elder** — Enforces the old rule everyone half-forgot — the one that keeps It out.
15. **Medium** — Takes messages from the wrong side of the door, and charges dearly for it.
16. **The last witness** — Saw what took the others; no one believes them yet, and time is short.
17. **Reliquary-keeper** — Guards the bones, or the object, that must never once be moved.
18. **Doomed-line heir** — The family the curse has been patient with, for generations.
19. **Pallid-touched shopkeeper — the minority tell: unnaturally still, unnaturally pale, everyone pretends not to notice**
20. **Dark-skinned town doctor — one of the few who still asks real questions**
21. **Grave-cool hand — a handshake that runs a few degrees too cold, otherwise ordinary**
22. **Elderly matriarch, untouched — the town's actual moral center, and she knows what's wrong**
23. **Newcomer family — recently arrived, don't yet know what the town is**
24. **Multi-ethnic congregation regular — attends every service, asks no questions**
25. **Night-shift diner cook — sees everyone who's out too late, says nothing**

---

### NPC sheet 3/3

1. **Dark-skinned funeral-home apprentice — young, unbothered by a job that unsettles everyone else**
2. **Elderly untouched schoolteacher — the town's last honest source of information**
3. **Broad-shouldered gravedigger — knows exactly how many graves the cemetery is quietly short**
4. **Young pallid-touched altar boy — minority tell, doesn't yet understand what it means**
5. **Grey-haired diner owner — serves the same regulars every night, never asks why they're out so late**
6. **One-eyed pawnshop keeper — buys things people shouldn't be selling**
7. **Freckled paperboy, still ordinary — delivers to houses that don't answer anymore**
8. **Heavyset town mechanic — the only one who'll drive out past the old mill after dark**
9. **Dark-skinned church organist — plays every Sunday, has stopped asking who's really listening**
10. **Pale, sleepless night-shift nurse — sees things at the hospital she doesn't log**
11. **Short, sharp-eyed antique dealer — every item has a story he won't finish telling**
12. **Elderly grave-cool caretaker — minority tell, tends the cemetery like it's still growing**
13. **Sunburnt farmhand — one of the few who works the fields at the town's edge without fear**
14. **Mixed-heritage librarian — untouched, keeps the town records more complete than anyone realizes**
15. **Lean, twitchy insomniac motel clerk — checks guests in, never checks them out on the books**
16. **Stout diner cook, dark-skinned — feeds the night shift, forgets faces on purpose**
17. **Grey-haired retired sheriff — knows which cases were never really closed**
18. **Young twin siblings — one seems fine, the other hasn't been right since the fair**
19. **Broad, pallid-touched mill worker — minority tell, still shows up to a mill that shouldn't run**
20. **Elderly blind fortune-teller at the county fair — charges a dollar, means every word**
21. **Dark-skinned, heavily scarred volunteer firefighter — has seen what the fires actually are**
22. **Small, quick-handed pickpocket kid — the only honest thief in a town full of worse secrets**
23. **Weathered groundskeeper at the old estate — won't say what's in the locked wing**
24. **Touched hospice nurse — minority tell, gentle with the dying, unnervingly calm about it**
25. **Tall, gaunt town accountant — untouched, the only books in town that actually balance**

## Domestic animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). muted desaturated palette — sickly yellow streetlight against blue-grey dusk, soft grain/dither texture, one unnervingly saturated warm accent color per figure (the wrongness marker), otherwise low-contrast murky background.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic living pose** — alert, mid-stride, grooming, watching — never
stiff/taxidermied. **No scene props, furniture, pens, or background objects of any kind** — no
fences, feed troughs, leashes-as-set-dressing, etc.; the animal itself only, isolated against the
plain magenta background. Rendered in this realm's art style (see the style block above).

### Domestic animal sheet 1/1

1. **Domestic animal — Loyal dog — bonded to one person, reads their mood before they do.**
2. **Domestic animal — Working beast (a single ox) — earns its feed, patient, and spooks true.**
3. **Domestic animal — Barn cat — owns the place, tolerates the people, hunts the dark corners.**
4. **Domestic animal — Stray — belongs to no one and everyone; the street's own alarm bell.**
5. **Domestic animal — A single goose from the flock — loud, territorial, first to mark a stranger.**
6. **Domestic animal — A single sheep from the herd — moves with the others, and its lone reluctance to follow is the tell.**
7. **Domestic animal — Bird kept close (a single hawk) — carries, watches, and remembers a face.**
8. **Domestic animal — Vermin-catcher (a single ferret) — goes gladly where people won't.**
9. **Domestic animal — Old animal — past its working years, half-blind, and still the first to growl at the wrong thing.**
10. **Domestic animal — Half-tamed wild thing — comes to the window, never the hand; trusts one child and no one else.**
11. **Domestic animal — The realm-beast (a black dog that shows up at the worst moment and won't be chased off)**
12. **Domestic animal — The town's own animal — the one everyone knows by name; its fate is the town's mood made visible.**
13. **Domestic animal — A single rabbit — twitchy, kept for the table or kept as a pet, never sure which.**
14. **Domestic animal — A single pony — smaller and calmer than the war-mule, a child's first mount.**
15. **Domestic animal — A single duck — waddling, unbothered, first to notice a stranger at the water's edge.**
16. **Domestic animal — A single turkey — puffed up and loud, more guard animal than anyone admits.**
17. **Domestic animal — A single caged songbird — kept for the sound of it, restless behind the wire.**
18. **Domestic animal — A single turtle — slow-kept yard animal, older than most of the household.**
19. **Domestic animal — A single pig — smarter than it's given credit for, rooting at the fence line.**
20. **Domestic animal — A single goat — headstrong, climbs what it shouldn't, eats what it shouldn't.**
21. **Domestic animal — A single donkey — stubborn, sure-footed, outlives every horse on the property.**
22. **Domestic animal — A single peacock — kept for show, screams like something's wrong when nothing is.**
23. **Domestic animal — A single hunting hound — lean, nose-down, bred for the chase and bored without it.**
24. **Domestic animal — A single kitten — too young to have earned the barn cat's independence yet.**
25. **Domestic animal — A single caged ferret-kit — young, hyperactive, still learning the vermin-catcher's trade.**


---

## Wild animal batches (25 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale).
muted desaturated palette — sickly yellow streetlight against blue-grey dusk, soft grain/dither texture, one unnervingly saturated warm accent color per figure (the wrongness marker), otherwise low-contrast murky background.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic wild-living pose** — alert, stalking, grazing, mid-flight,
territorial — never stiff/taxidermied, never tame-looking (these are wilderness creatures, not
pets). **No scene props, furniture, dens, or background objects of any kind** — no burrows,
nests-as-set-dressing, foliage clusters, etc.; the animal itself only, isolated against the plain
magenta background. Sourced from the game's own `wild-animal-kind` table (`Engine/03. _Tables/02.
Social/Sentient NPCs/Wild Animal Kind.md`) plus additional single-animal variety to fill the
sheet; entry 11 (the realm-beast) uses this realm's real skin from `data/animal-realm-skins.js`.

### Wild animal sheet 1/1

1. **Wild animal — Territory wolf — holds a stretch of ground and knows every crossing of it**
2. **Wild animal — A single deer from the herd — moves with the herd, reads the wind before the ranger does**
3. **Wild animal — Watcher-hawk — sees the whole valley from height and forgets nothing it circled**
4. **Wild animal — River otter — knows the water's moods better than any map**
5. **Wild animal — Burrowing badger — knows what the earth carries underneath**
6. **Wild animal — Ambush lynx — solitary, patient, and the reason the trail went quiet**
7. **Wild animal — A single vulture from the carrion flock — first to know when something has died nearby**
8. **Wild animal — A single goose from the migrant flock — passes through and carries news of where it's been**
9. **Wild animal — Old solitary boar — scarred, wary, and gives ground to no one**
10. **Wild animal — Half-wild fringe fox — drawn to the edge of camps, curious and never quite trusting**
11. **Wild animal — The realm-beast (a pale stag glimpsed once at treeline, never twice from the same angle)**
12. **Wild animal — The elder of the wood — the beast every other animal on the node defers to**
13. **Wild animal — A single elk — grazes the tree line at dawn, gone before full light**
14. **Wild animal — A lone timber-wolf pup — not yet part of any pack, still learning to hunt**
15. **Wild animal — A red fox kit — curious, unafraid, too young to know better**
16. **Wild animal — A great owl — silent wingbeats, watches more than it hunts**
17. **Wild animal — A wild boar sow — tusks lowered, protective of ground she doesn't even own yet**
18. **Wild animal — A mountain goat — sure-footed on a ledge no predator bothers to follow**
19. **Wild animal — A black bear — foraging, unbothered, dangerous only if pressed**
20. **Wild animal — A heron — stalks the shallows on legs too thin to look that patient**
21. **Wild animal — A wild turkey tom — displaying, loud, oblivious to anything hunting it**
22. **Wild animal — A bull elk — antlers full-grown, the season's rut making it reckless**
23. **Wild animal — A badger — low, broad, digging with total disregard for anything nearby**
24. **Wild animal — A peregrine falcon — stooping mid-hunt, faster than anything else in the sky**
25. **Wild animal — A lynx kitten — spotted coat, play-stalking something that isn't there yet**

---

## Dungeon animal batches (25 total, 1 sheet)

**Lore note:** per `docs/ANIMAL-SOCIAL.md` §1, the dungeon environment band is animal-population
near-zero — "each one is a signal," not ambient wildlife. Every entry below is either a
domestic/wild animal that ended up somewhere it shouldn't be, or a creature that has adapted to
permanent dark — never a "generic cave critter."

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering
(visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale).
muted desaturated palette — sickly yellow streetlight against blue-grey dusk, soft grain/dither texture, one unnervingly saturated warm accent color per figure (the wrongness marker), otherwise low-contrast murky background.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each animal fully visible from head to toe within its cell — no cropping.
**Every animal in a characteristic pose for its situation** — wary, cornered, feral, startled,
adapted-to-dark — never a relaxed/domestic pose (even the lost pets down here read as changed by
the place). **No scene props, furniture, cages-as-set-dressing, or background objects of any
kind** — the animal itself only, isolated against the plain magenta background.

### Dungeon animal sheet 1/1

1. **Dungeon animal — Feral vermin-catcher — once someone's ferret or terrier, now lives wild in the tunnels, still killing rats out of habit**
2. **Dungeon animal — Blind cave rat — pale, sightless, thrives in total dark, first sign something's been dug through**
3. **Dungeon animal — Tunnel bat colony straggler — a single bat that never rejoined the swarm, clings alone near a cracked vent**
4. **Dungeon animal — Half-tamed thing — comes to a lantern's light, never a hand, feeds on what the dungeon leaves behind**
5. **Dungeon animal — Lost hunting hound — a noble's dog that wandered too far in and never found the way back out**
6. **Dungeon animal — Cave-adapted spider — pale, eyeless, spins webs across passages nobody's walked in years**
7. **Dungeon animal — Wrong-place goat — a farm animal that fell through a sinkhole and somehow survived down here**
8. **Dungeon animal — Glow-moss grazer — a small rodent whose fur has picked up a faint luminescence from what it eats**
9. **Dungeon animal — Echo-startled bird — a single bird trapped in the upper galleries, flies at every footstep**
10. **Dungeon animal — Scarred guard-dog gone feral — once trained to patrol these halls, now answers to no one**
11. **Dungeon animal — Blind salamander — pale, slow, the kind of thing that shouldn't have a reason to be this deep**
12. **Dungeon animal — Starving stray — a cat or dog that followed someone in and got left behind**
13. **Dungeon animal — Unnervingly large lone rat — alone, watching, doesn't scatter like the others**
14. **Dungeon animal — Tunnel-adapted snake — pale-scaled, sluggish in the cold, strikes only when cornered**
15. **Dungeon animal — Chained beast, escaped its post — a working animal that slipped its old restraint, still wears the collar**
16. **Dungeon animal — Nest-robbing crow — one bird that's learned the dungeon's side passages better than most explorers**
17. **Dungeon animal — Deep-well fish, stranded — flopping in a puddle far from any real water source**
18. **Dungeon animal — Sole survivor packhorse — the last of a caravan's animals, malnourished, still saddled**
19. **Dungeon animal — Cave cricket, oversized — chirping alone in the dark, first warning of the swarm nearby**
20. **Dungeon animal — Feral falconry bird — a hawk that escaped its jesses generations ago, now hunts the tunnels' vermin**
21. **Dungeon animal — Wrongly-still lizard — motionless so long it's mistaken for a carving, until it isn't**
22. **Dungeon animal — Abandoned mine canary — a small bird in a rusted cage, somehow still alive, still singing**
23. **Dungeon animal — Tunnel-blind mole — huge clawed forepaws, displaces more earth than it should be able to**
24. **Dungeon animal — Trapped messenger pigeon — still carries a note no one living will ever read**
25. **Dungeon animal — An ordinary animal, deliberately unremarkable — domestic or wild, doesn't matter; its presence this deep IS the signal, let the scene decide what it means**

---

## Kid batches (20 total, 1 sheet)

Style block (repeated here so this section is self-contained): Pixel-art sprite rendering (visible pixel grid, retro game-sprite look, NOT a smooth painterly illustration, NOT cartoony — proportions stay grounded and true-to-tone even rendered at pixel scale). muted desaturated palette — sickly yellow streetlight against blue-grey dusk, soft grain/dither texture, one unnervingly saturated warm accent color per figure (the wrongness marker), otherwise low-contrast murky background.

Shared mechanical instructions (restated for this section): 5x5 grid, uniform cell size, solid
magenta (#FF00FF) background (no transparency, no other background elements), consistent scale,
orthographic side view, each kid fully visible from head to toe within its cell — no cropping.
**Every kid in a candid, characterful pose** — mid-play, mid-chase, peeking around a corner,
caught in the act of the thing they want — never a neutral T-pose or idle stand, and never
combat/violent poses. **No scene props, furniture, or background objects of any kind** — no
toys-as-set-dressing, benches, carts, etc.; the child itself only, isolated against the plain
magenta background. Rendered in this realm's art style (see the style block above); ages read as
children, not teens or adults.

### Kid sheet 1/1

1. **Kid — wants: Find the dog that didn't come home.**
2. **Kid — wants: Put it back before anyone notices it was gone.**
3. **Kid — wants: Be believed by one grown-up — just one — about the thing they saw.**
4. **Kid — wants: Stay up late enough to catch the thing that comes at night.**
5. **Kid — wants: Get back what was taken from them — and it's the object the whole plot turns on.**
6. **Kid — wants: Keep the secret they swore to keep, even now that it's gone wrong.**
7. **Kid — wants: Win back the friend who stopped coming around.**
8. **Kid — wants: Prove they're not a baby by going where they're forbidden to go.**
9. **Kid — wants: Keep the pretty thing they found — which someone dangerous is tearing the town apart to recover.**
10. **Kid — wants: Feed the thing in the woods that's been kind to them.**
11. **Kid — wants: Not have to go home tonight.**
12. **Kid — wants: Find out what the grown-ups whisper about behind the shut door.**
13. **Kid — wants: Get their small hoard back from whoever confiscated it.**
14. **Kid — wants: Slip a message to the one person the family has forbidden them to see.**
15. **Kid — wants: Be chosen — for the errand, the team, the trust — for once.**
16. **Kid — wants: Keep the little one from finding out the bad thing that happened.**
17. **Kid — wants: Trade the strange coin they found for something they actually want.**
18. **Kid — wants: See the locked place opened, just once, just to know.**
19. **Kid — wants: Make their parent laugh the old way, the way from before.**
20. **Kid — wants: Warn someone — and not one adult will slow down long enough to hear it.**

