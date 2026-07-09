---
type: scratch
status: experimental
created: 2026-07-09
realm: theater
---

# Sprite Batch Prompts — Theater (war, any war, unnamed/unflagged (per eraLens))

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the Theater realm bestiary (118 monsters) plus a
themed NPC roster (43 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): desaturated olive-and-khaki palette, heavy dither for smoke/haze, hard directional light like a flare or muzzle-flash, worn canvas/leather gear textures, avoid any real-world flag, insignia, or named-conflict iconography (content-safety — keep it era-neutral).

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (118 total, 5 sheets)

### Monster sheet 1/5

1. **Line Infantry Shade** — Rank-and-file trench ghost, holds the line by rote
2. **Wire-Cutter Scout** — Silent night-crawler who counts sentries for something
3. **Whistle-Blown Runner** — Message-runner forever mid-sprint toward the whistle
4. **Duckboard Vermin Swarm** — Fearless rat-swarm that owns the trench floor at night
5. **Mustard Wraith** — Drifting toxic gas-cloud that hunts low ground blind
6. **Barbed Kill-Zone Tangle** — Living wire-tangle that snags then reels men in
7. **Musket-Line Regular** — Volley-fire rifleman lost in permanent powder smoke
8. **Longship Raider** — Beach-charging raider screaming a nameless war-cry
9. **Jungle Ambusher** — Silent canopy-and-mud ambusher, gone before you see him
10. **Siege-Line Sapper** — Tunnel-digger laying the charge that breaches the wall
11. **Barbed-Wire Horror** — Wire-impaled corpse that never fell, still reaching
12. **The Unkillable Sergeant** — NCO who won't stay dead, keeps ordering the charge
13. **Hedgerow Tank-Killer** — Bocage ambusher waiting to drop a war-machine cold
14. **Longship Warlord** — Giant raider-chief armored in three lines' worth of plate
15. **Trench Ghast** — No-man's-land feeder that mimics the whistle to lure prey
16. **Jungle Beast-Handler** — Handler who marches a chained horror as a living breacher
17. **Iron Crawler War-Machine** — Treaded armored hull grinding across the wire alone
18. **Legion Standard-Breaker** — Flag-devoted killer who believes in nothing but the fight
19. **Musket-Line Cavalry Officer** — Officer charging cannon-fire on horseback for the order alone
20. **The Line That Held** — Animate trench-line that simply refuses to yield ground
21. **Longship Draugr-Captain** — Drowned captain still commanding his dead crew ashore
22. **Jungle War-Engine** — Feral jungle war-machine still firing a stale coordinate
23. **Legion Praetor-Revenant** — Dead commander who still drills a legion by discipline alone
24. **The Whistle** — The sound of the order itself, given bone and rank
25. **No-Man's Bloom** — War-soaked ground grown into a thorned, remembering forest

### Monster sheet 2/5

1. **Trench Rat Cloud** — Carrion rats swarming abandoned trenches and packs
2. **Conscript Straggler** — Green conscript, flinches and breaks under fire
3. **Wire-Snagged Corpse** — Barbed-wire corpse still lurching toward the line
4. **Powder Monkey Cutthroat** — Small shipboard runner, finishes off fallen boarders
5. **Musket Skirmisher** — Loose-order skirmisher, fires and vanishes into smoke
6. **Longship Thrall** — Chained oarsman turned axe-fighter at the beachhead
7. **Jungle Leech-Thing** — Canopy leech-creature that drops and drains blood
8. **Siege Camp Looter** — Corpse-looter trailing behind the siege lines
9. **Shell-Shocked Wanderer** — Shell-shocked survivor wandering, immune to fear
10. **Gas-Mask Sentry** — Masked sentry holding post through gas alarms
11. **Draft-Horse Casualty** — Dead draft horse still hauling its rotted harness
12. **Cavalry Lancer** — Mounted lancer charging ahead of modern fire
13. **Musket-Line Drummer Boy** — Drummer keeping march step, breaking his death shatters morale
14. **No-Man's-Land Crawler** — Battlefield ghoul scavenging the unburied at night
15. **Jungle Ambush Sniper** — Canopy-lashed sniper waiting days for one shot
16. **Longship Shieldmaiden** — Flank shield-wall fighter screaming the ship's name
17. **Trench Wire Golem** — Salvaged-armor construct patrolling the wire on its own
18. **Musket Volley Ghost** — Volley-killed rank of soldiers standing in smoke
19. **Jungle War-Dog** — Scent-trained war-dog running point on patrol
20. **Siege Sapper's Mole** — Tunneling beast bred to dig under siege walls
21. **Mustard Fog Sprite** — Living gas-cloud that hunts by coughing sounds
22. **Longship Berserker** — Beach-landing berserker numb to wounds mid-charge
23. **Colonial Trench Medic** — Under-fire medic, priority target to break morale
24. **Jungle Pit-Trap Warden** — Guerrilla warden herding patrols into staked pits
25. **Duckboard Trench Fiend** — Mud-spawned fiend climbing up through duckboards

### Monster sheet 3/5

1. **Machine-Gun Nest Crew** — Two-man gun crew that ends charges outright
2. **Storm-Trooper Breach Squad** — Fast breach specialists clearing trench sections
3. **Longship Skald-Reaver** — Singing raider whose saga-verses embolden the crew
4. **Jungle Pit Viper Ambush** — Treeline ambush snake striking bunched patrols
5. **Cavalry Saber Charge** — Full-gallop saber cavalry betting on the first pass
6. **Field Gun Battery** — Cannon crew fighting as one machine past death
7. **The Wire-Cutter Colossus** — Wire-clipping walker built to open assault lanes
8. **Longship Hull-Breaker** — Raiding-crew brute thrown at hulls and gates
9. **Jungle Beast-Cage Handler** — Handler releasing caged war-beasts on the ambush horn
10. **Gas Cloud Horror** — Sentient, undissipated gas barrage with a will
11. **Trench Raid Bayonet Line** — Silent bayonet line going over the top on the whistle
12. **Musket-Line Artillery Sergeant** — Voice-correcting gun sergeant walking under fire
13. **Siege Tower Crew** — Rolling siege tower crewed under falling arrows
14. **Longship War-Wolf Handler** — Raider running a leashed wolf-pack ahead of the men
15. **Jungle War-Elephant Driver** — Barded war-elephant carrying its driver into chaos
16. **Trench Flame-Lance Team** — Flame-tank team clearing bunkers in one breath
17. **Deserter-Thing** — Executed deserter risen wrong, hunting its executioners
18. **Musket-Line Grenadier** — Fearless grenadier carrying door-opening black powder
19. **Longship Ghost Fleet Crewman** — Century-dead rower still believing the raid continues
20. **Siege Ballista Crew** — Gate-punching war-machine crewed around the clock
21. **Jungle Tiger-Rider Scout** — Trained big-cat rider scouting the canopy trails
22. **Trench Officer's Ghost-Whistle** — Dead officer whose whistle still calls the charge
23. **Musket-Line Field Marshal's Honor Guard** — Standard-guard sworn to die before it falls
24. **Cavalry Death-Rider** — Dead cavalry officer and horse still mid-charge
25. **Longship Berserker-King's Champion** — Bare-chested prow-fighter daring the shore to resist

### Monster sheet 4/5

1. **Jungle Ambush War-Priest** — Ritual-blessing war-priest wading into the ambush
2. **Siege-Line Trebuchet Golem** — Self-aiming trebuchet that no longer waits for orders
3. **Musket-Line Cannon Golem** — Walking field-gun chassis built to replace dead crews
4. **Trench Wraith of the Wire** — Company-wide death-wraith hunting by muzzle-flash memory
5. **Longship Draugr-Fleet Captain** — Drowned fleet-captain whose sunk ships still answer
6. **Jungle Colossus-Beast** — Tamed prehistoric survivor used as a living ram
7. **Trench Butcher Golem** — Close-quarters clearing machine built for the unstomachable work
8. **Musket-Line Ghost Regiment** — Regiment lost in one charge, still marching in formation
9. **Siege Wall-Breaker Titan** — Ram-wielding siege titan that doesn't stop swinging
10. **Longship Sea-Wyrm Figurehead** — Cursed living figurehead diving from fog onto ships
11. **Jungle War-Machine of Rusted Vines** — Root-swallowed ancient war-engine, still fully armed
12. **The Field Marshal's Undying Aide** — Undying aide delivering the same dead order nightly
13. **Trench Legion Revenant Colonel** — War-denying revenant rallying every nearby corpse
14. **Longship Storm-Caller Reaver** — Storm-bargaining reaver whose weather still owes him
15. **Jungle Chimera-Beast of War** — Warlord-bred chimera leading otherwise unsurvivable charges
16. **Musket-Line Field Marshal-Revenant** — Century-dead marshal still finishing his last order
17. **Trench Colossus of Bone and Wire** — Self-built ossuary titan from an unnamed battle's dead
18. **No-Man's-Land Warlord's Ghost** — General's ghost eternally watching his own fatal order
19. **The Ironclad Reaver-Queen** — Ship-hull-and-captain war-machine that never comes ashore
20. **Legion Undying Praetorian Host** — Never-broken honor-guard formation, undying for centuries
21. **The Gas-King of the Salient** — Sentient gas-cloud amalgam that owns the salient's ground
22. **The Siege That Never Lifted** — Fused siege-line horror still failing to take the city
23. **The Trench Ghost** — shell-shocked revenant infantryman on eternal patrol
24. **The Legion Wall** — lone shield-and-spear legionary, drilled to a fault
25. **The Musket Line** — standing volley-drill musketeer, drilled past reason

### Monster sheet 5/5

1. **The Longship Raider** — axe-and-round-shield sea raider, stranded in the war
2. **The Jungle Scout** — camo-draped recon scout gone half-feral in the green
3. **The Siege Sapper** — tunnel-digging siege engineer, still mining toward a wall
4. **The Berserker** — battle-trance warrior who fights past fear and flesh
5. **The Draugr Captain** — mound-risen undead officer still holding a dead line
6. **The Machine-Gun Nest** — fused gun-and-gunner emplacement, animate and traversing
7. **The Storm-Trooper Cadre** — grenade-and-trench-knife shock infantryman
8. **The Valkyrie** — battlefield psychopomp choosing which dead the war keeps
9. **The Iron Cavalry** — armor-plated war-beast standing in for every era's tank
10. **The Siege Tower** — animate siege-tower, self-propelled toward the wall
11. **The Trench Wight** — revenant trench-officer still blowing the whistle to advance
12. **The War Elephant** — armored siege-beast that shrugs off volleys and keeps coming
13. **The Gorgon Standard** — gorgon-faced standard-bearer, a banner that petrifies stares
14. **The Flying Squadron** — aerial strafing beast standing in for the first air war
15. **The Ironclad Leviathan** — gargantuan warship-beast that dominates the theater's horizon
16. **The War-Wyrm** — chained siege-dragon deployed like a living artillery piece
17. **The Death Knight of No Nation** — undead commander claimed by every faction, loyal to none
18. **The Siege of the World** — war given a body, wearing every era's uniform at once


---

## NPC batches (43 total, 2 sheets)

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`)
plus this realm's exclusive `adds`. These are civilian/social-layer sprites, not combat monsters
— pose direction should read as **a characteristic action for the role** (the smith mid-hammer,
the informant mid-glance-over-shoulder) rather than combat aggression, unless the role is itself
a security/enforcer type.

### NPC sheet 1/2

1. **Requisitioned farmer or Forager** — Tied to the land and its seasons; the base everyone eats from.
2. **Scout or Skirmisher** — Reads the wild and brings in what the settled can't.
3. **Ammunition-bearer or Baggage-train hand** — Moves the heavy things; sees everything, is asked nothing.
4. **Sapper or Trench-digger** — Works the dark and the tight places; patient underground.
5. **Officer's orderly / batman** — Invisible to the powerful, and so hears every secret.
6. **Refugee or Straggler** — Has nothing, so knows the streets better than anyone.
7. **Field-artificer or Smith's mate** — Their tools carry their whole history.
8. **Armorer** — Calloused hands; deals in practical defense.
9. **Cook or Mess-hand** — Up before dawn; holds the neighborhood's gossip.
10. **Field engineer or Bridge-layer** — Reads every structure out of habit; knows what's load-bearing.
11. **Kit-mender or Tent-wright** — Notices the cut and quality of everyone's clothes.
12. **Farrier or Wainwright of the train** — Keeps the means of travel and trade running; eyes on the weather.
13. **Sutler (camp merchant)** — Information-rich, truth-poor.
14. **Canteen-keeper or Billet-master** — Controls the space, not the people in it.
15. **Camp bonesetter or Herb-woman** — Smells of bitterroot; knows what heals and what doesn't.
16. **Surgeon (the rear hospital)** — Trusted, and overburdened by it.
17. **Chaplain** — Maintains the ritual, not the doctrine.
18. **Camp entertainer** — Craves the attention; hides the true feeling under it.
19. **Provost-sergeant or Military police** — Authority-adjacent, with limited real power.
20. **Mercenary or Free-company soldier** — Loyalty bought with coin, and cynical about it.
21. **Picket or Sentry** — Wary of the road; values a good pair of boots.
22. **Marauder or Deserter-turned-brigand** — Desperate or cruel; lives outside the law.
23. **Contraband-runner or Blockade-runner** — Hides the cargo; speaks only in euphemism.
24. **Looter or Camp-thief** — Eyes every coin-pouch; avoids every eye.
25. **Zealot-soldier or Fifth-columnist** — Fanatical devotion behind a mundane face.

### NPC sheet 2/2

1. **Press-gang or Recruiting sergeant** — Charisma aimed at the desperate; sells belonging.
2. **Foreign auxiliary from afar** — Chose to stay here; the reasons stay unclear.
3. **Shell-shocked hermit behind the lines** — Known of, rarely seen.
4. **Field-promoted corporal (borrowed command)** — Filling in for someone absent; borrowed authority.
5. **Trench boss or Camp strongman** — Power without a title.
6. **Conscript who should never have been called** — Unqualified, unwilling, or both — and in the role anyway.
7. **Well-connected staff cornet** — Wealthy, bored, insulated from real consequence.
8. **War contractor** — Sees every interaction as a transaction.
9. **Cryptographer or War-alchemist** — Hoards the secret knowledge; sees others as material.
10. **The one no uniform explains** — Their very presence is the notable thing.
11. **Officer** — Orders the line held; loved or hated, and rarely wrong about both.
12. **Field-medic** — Patches what the line breaks; ran out of the good supplies weeks ago.
13. **Quartermaster** — Controls what everyone needs, and skims what nobody counts.
14. **Runner** — Carries the message under fire; knows what the officers won't say aloud.
15. **Deserter** — Walked away from the line; now every uniform is a threat.
16. **War-orphan / camp-follower** — The war's dependents; survive in its margins, move when it moves.
17. **The captured** — Belongs to no side now — and is leverage to every side.
18. **Veteran, missing a piece** — Came home from a war no one names, and it followed them back.

