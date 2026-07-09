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

Style block (same for every sheet in this realm): muted desaturated palette — sickly yellow streetlight against blue-grey dusk, soft grain/dither texture, one unnervingly saturated warm accent color per figure (the wrongness marker), otherwise low-contrast murky background.

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

## NPC batches (43 total, 2 sheets)

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/2

1. **Tenant farmer or Blight-farmer** — Tied to the land and its seasons; the base everyone eats from.
2. **Trapper or Woods-warden** — Reads the wild and brings in what the settled can't.
3. **Corpse-cart driver or Grave-hauler** — Moves the heavy things; sees everything, is asked nothing.
4. **Gravedigger or Crypt-digger** — Works the dark and the tight places; patient underground.
5. **Manor servant or House-maid** — Invisible to the powerful, and so hears every secret.
6. **Outcast beggar or the Forsaken** — Has nothing, so knows the streets better than anyone.
7. **Ward-carver or Charm-maker** — Their tools carry their whole history.
8. **Iron-ward smith** — Calloused hands; deals in practical defense.
9. **Baker or Miller** — Up before dawn; holds the neighborhood's gossip.
10. **Mason or Crypt-wright** — Reads every structure out of habit; knows what's load-bearing.
11. **Shroud-sewer or Seamstress** — Notices the cut and quality of everyone's clothes.
12. **Traveling peddler** — Information-rich, truth-poor.
13. **Innkeeper or Tavern-keeper** — Controls the space, not the people in it.
14. **Hedge-witch or Herb-woman** — Smells of bitterroot; knows what heals and what doesn't.
15. **Village physician or Midwife** — Trusted, and overburdened by it.
16. **Ward-keeper or Old-rite keeper** — Maintains the ritual, not the doctrine.
17. **Village constable** — Authority-adjacent, with limited real power.
18. **Paid exorcist or Hedge-mercenary** — Loyalty bought with coin, and cynical about it.
19. **Crossroads warden** — Wary of the road; values a good pair of boots.
20. **Body-snatcher** — Desperate or cruel; lives outside the law.
21. **Cursed-relic runner** — Hides the cargo; speaks only in euphemism.
22. **Grave-goods thief** — Eyes every coin-pouch; avoids every eye.
23. **Secret cultist** — Fanatical devotion behind a mundane face.
24. **Cult recruiter** — Charisma aimed at the desperate; sells belonging.
25. **The newcomer who stayed** — Chose to stay here; the reasons stay unclear.

### NPC sheet 2/2

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

