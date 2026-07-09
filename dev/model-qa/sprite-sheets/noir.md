---
type: scratch
status: experimental
created: 2026-07-09
realm: noir
---

# Sprite Batch Prompts — Noir (modern crime, everyone owes somebody)

**Not canon** (see `sprite-sheet-prompts.md` for the full disclaimer + shared template). This
file batches EVERY creature in the Noir realm bestiary (117 monsters) plus a
themed NPC roster (42 roles, drawn from the game's own NPC Role Spine + this realm's
skin/adds) into 25-per-sheet ChatGPT prompts. Names + flavor are pulled verbatim from the live
game data (`dev/model-qa/realm-bestiary-draft.json` for monsters, `data/npc-role-skins.js` for
NPCs) — not hand-invented.

Style block (same for every sheet in this realm): high-contrast black-and-white-leaning palette with one desaturated color accent (neon-sign red or venetian-blind amber), hard rim lighting like a streetlamp through blinds, long dramatic shadow shapes, trench-coat silhouettes.

Shared mechanical instructions (same as the master template): 5×5 grid, 25 cells, one distinct
static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive, mid-action pose that captures its essence**
— mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand.

---

## Monster batches (117 total, 5 sheets)

### Monster sheet 1/5

1. **Corner Tail** — street lookout, sells information both ways
2. **Torpedo** — blunt muscle, sent to collect by force
3. **Warehouse Vermin Swarm** — bold dock rats, tip off a hidden stash
4. **Wet-Ledger Runner** — bagman running bribes, never writes a route
5. **Beat Cop on the Take** — dirty beat cop, rent paid by someone else
6. **Overdose Husk** — junkie revenant, drags down the next fix
7. **Made Enforcer** — made-man muscle, loyal past all sense
8. **Rooftop Shadow** — stalking rooftop shade, preys on lone walkers
9. **Wireman** — double-agent snitch, feeds both sides
10. **Loan Shark's Bruiser** — debt collector, second visit is the beating
11. **the Fixer** — the man who cleans up messes and paper trails
12. **the Femme Fatale** — seductive manipulator, lies feel like truth
13. **The Unsolved (Cold-Case Revenant)** — restless ghost of a buried murder case
14. **The Canary** — lounge singer secretly informing on the mob
15. **Torch** — arsonist-for-hire, loves the fires too much
16. **The Family's Animal (Wiseguy Werewolf)** — mob enforcer who turns feral on full moons
17. **The Dirty Detective** — corrupt detective burying his own cases
18. **the Underboss** — day-to-day operator, ambitious heir apparent
19. **The Bench Owns You (Corrupt Judge)** — bribed judge who sells verdicts outright
20. **Sewer Hitman (The Contract Nobody Signed)** — faceless hired killer moving through the sewers
21. **The Don (Crime Boss)** — waterfront crime boss, three words end lives
22. **The Silent Assassin** — unerring silent killer, no prints, no words
23. **The Family's War Machine (Armored Motorcade)** — armored driverless car, built to smash blockades
24. **The Vampire Kingpin (Old Money, Older Blood)** — ancient vampire, owns the city's every debt
25. **The Case That Isn't Closed (City-Ghost of the Unsolved)** — undying intelligence of every unsolved murder

### Monster sheet 2/5

1. **Alley Snitch** — small-time informant, trades names for cash
2. **Numbers Runner** — betting-slip courier, knows the safe hours
3. **Pier Rat** — dock kid fencing stripped copper fast
4. **Streetlamp Tail** — low-rent tail, reports habits not crimes
5. **Precinct Mole** — records clerk selling case photographs uptown
6. **Broke-Nose Bouncer** — speakeasy bouncer, guards the address itself
7. **Getaway Kid** — teenage wheelman, engine always idling
8. **Fence's Errand Boy** — moves hot jewelry ahead of the wire
9. **Sewer Grifter Ghoul** — dead con man still working an angle
10. **Payroll Skimmer** — union rep skimming every payroll envelope
11. **Hollow-Eyed Patrolman** — dead cop still walking his old beat
12. **Speakeasy Torpedo** — speakeasy doorman, admits by tip or fist
13. **Pawnshop Ghost** — haunts a shop of desperate final pawns
14. **Second-Story Man** — cat burglar, works only the upper floors
15. **Rumrunner** — bootlegger, paid in product and silence
16. **Wharf Enforcer** — dock enforcer, breaks fingers over shortfalls
17. **Undertaker's Accomplice** — funeral director doubling as disposal service
18. **Rooftop Sniper** — rooftop rifleman, watches drops from towers
19. **Loan Shark's Bookkeeper** — loan-shark accountant, keeps two ledgers straight
20. **Betrayed Partner Wraith** — murdered PI haunting his own agency
21. **Dockside Werebeast** — low-level runner cursed with the wererat bite
22. **Blackmail Photographer** — blackmail photographer, sells negatives to both
23. **Arson Squad Torch-for-Hire** — junior arsonist, still loves the smell
24. **Junkyard Dog (Loyal Muscle)** — childhood muscle, would die before talking
25. **Crooked Bail Bondsman** — bail bondsman, springs soldiers for favors

### Monster sheet 3/5

1. **Corner Pharmacist (Under-the-Counter)** — pharmacist selling fixings out the back
2. **Skid Row Ghoul-Pack Runner** — undead errand-runner preying on skid row
3. **Motorcade Gunner** — running-board gunman guarding the boss's car
4. **Cathouse Madam's Muscle** — brothel muscle, keeps trouble quiet not fatal
5. **The Interrogator** — basement interrogator, patience outlasts any nerve
6. **The Widow-Maker (Serial Insurance Killer)** — serial black-widow killer, three funerals deep
7. **The Chop-Shop King** — chop-shop boss, six-hour car-to-cash turnaround
8. **The Blackmailer** — blackmailer with a file on the council
9. **The Wharf Boss's Widow** — widow who's crueler than the husband was
10. **The Torch's Rival (Ice Man)** — drowning specialist, cold where Torch is hot
11. **The Cathouse Vampire** — seductive predator working the high-end house
12. **The Coroner on the Payroll** — corrupt coroner, signs whatever pays best
13. **The Getaway Ghost** — dead wheelman still driving his last job
14. **The Pit Boss (Casino Enforcer)** — casino floor boss, settles cheats out back
15. **Wiseguy Wererat Crew Boss** — sewer-route smuggling boss, feral under moons
16. **The Nightclub Sorcerer (House Mage)** — club mage rigging luck at every table
17. **The Contract Killer's Handler** — arranges hits, never pulls a trigger himself
18. **Deep-Water Enforcer (Smuggler's Ghoul-Kin)** — drowned smuggler guarding sunken contraband crates
19. **The Family Consigliere** — mob lawyer, knows the law's every angle
20. **The Bent Coroner's Ghoul Ward** — morgue-basement horror from unburied bodies
21. **The Sweatshop Overseer** — sweatshop boss behind a legitimate front
22. **The Assassin's Apprentice** — assassin-in-training, already outpacing the teacher
23. **The Precinct Captain (Owned Outright)** — precinct captain, signs every cover-up personally
24. **The Ferryman (River Body-Disposal)** — boat captain who disposes of bodies offshore
25. **The Kingpin's Bodyguard (Silent Type)** — never-photographed bodyguard, always two steps back

### Monster sheet 4/5

1. **The Corrupt Warden** — prison warden selling luxury to the family
2. **The Nightclub's Second Vampire** — rival seductress, hungrier and more reckless
3. **The Wharf Sea-Witch (Waterfront Fixer)** — waterfront fixer, knows what washes up first
4. **The Underboss's Enforcer Pack Leader** — underboss's muscle chief, barely hides the stripes
5. **The Crime Scene Cleaner** — scene cleaner, erases murders in ninety minutes
6. **The Mayor's Handler** — unelected fixer who runs city hall's decisions
7. **The Old Money Enforcer** — forty-year enforcer, protected by high names
8. **The Precinct's Own Ghost Detective** — dead detective, solving his buried case louder
9. **The Vampire Kingpin's First Lieutenant** — vampire's daylight proxy, runs business he can't
10. **The Sewer Hitman's Mentor** — veteran hitman who trained the whole waterfront
11. **The Family's Freighter (Armored Smuggling Ship)** — rigged smuggling ship, hull shrugs off gunfire
12. **The City's Corrupt Commissioner** — commissioner who legislated the rackets' survival
13. **The Bench's Ghost (Wrongful-Execution Revenant)** — wrongly-executed man, death didn't settle it
14. **The Nightclub Owner (Dhampir Front-Man)** — half-vampire heir, hunts from his own club
15. **The Kingpin's Rival (Old Blood, New Money)** — self-made rival, wants the old families' turf
16. **The Kingpin's Enforcer Elite (Death Knight of the Docks)** — undead debt collector, rose to keep collecting
17. **The Family's Assassin-Twins** — twin killers splitting mark and witness work
18. **The Fallen DA (Ultimate Corruption)** — soul-sold DA, nothing human left underneath
19. **The Judge's Devil (Contract Behind the Bench)** — devil holding the judge's real signed contract
20. **The City's Silent Partner (Shadow Financier)** — shadow financier laundering money through society
21. **The Godmother (Matriarch of the Family)** — true power behind the Don, unseen matriarch
22. **The Frame Job (Living Conspiracy)** — self-aware conspiracy of false evidence, alive
23. **The Executioner's Debt (Mummified Hangman)** — mummified hangman, still working an endless backlog
24. **The Vampire Kingpin's Ancient Rival** — ancient undead rival, predates the city's charter
25. **The Last Honest Cop, Corrupted (Apex Fall)** — the last honest cop, broken and remade undying

### Monster sheet 5/5

1. **the Chiseler** — petty street grifter, first line of noir muscle
2. **the Torpedo** — low-level muscle for hire, leans on debtors
3. **the Wire Man** — bent patrolman feeding tips to the rackets
4. **the Wheelman** — getaway driver, mobile support in a chase
5. **the Shakedown Man** — protection-racket collector, bigger and blunter
6. **the Cigarette Girl** — club-floor informant, trades gossip for coin
7. **the Enforcer** — crime lord's blunt-instrument muscle
8. **the Dirty Cop** — corrupt detective, badge as much as bribe
9. **the Torch** — arsonist-for-hire, insurance jobs and cleanup
10. **the Coroner's Friend** — bought-off examiner, falsifies causes of death
11. **the Consigliere** — family strategist, plans the violence others do
12. **the Torpedo Boss** — veteran hitman, disguises every kill
13. **the Ghoul in the Icebox** — grave-risen enforcer kept on ice by the mob
14. **the Torch Singer's Ghost** — murdered singer's ghost haunting her old club
15. **the Assassin** — mercenary killer with no fixed allegiance
16. **Count Marlowe** — centuries-old crime lord, Dracula lineage reskinned
17. **the Crime Lord's Bride** — elder vampire consort, true power behind the throne

---

## NPC batches (42 total, 2 sheets)

Shared mechanical instructions (restated for this section, NPC-appropriate): 5x5 grid, 25 cells, one distinct static character per cell (not a repeat, not an animation frame), uniform cell size, solid magenta (#FF00FF) background (no transparency, no other background elements), consistent scale across all 25, orthographic side view, each character fully visible from head to toe within its cell — no cropping at the top, bottom, or sides, the complete body must fit inside the cell boundary. **Every character in an expressive pose characteristic of their role** — mid-task, mid-gesture, caught doing the thing that defines them (the smith mid-hammer-swing, the informant glancing over a shoulder, the merchant mid-haggle, the healer mid-bandage) — never a neutral T-pose or idle stand, and never combat aggression unless the role is itself a security/enforcer type. **No scene props, furniture, tools-as-set-dressing, or background objects of any kind** — no benches, stalls, counters, carts, weapons racks, signage, etc.; only the character itself (small hand-held items that are part of the character's own body/outfit, like a held tool mid-use, are fine — freestanding set pieces are not) isolated against the plain magenta background.

Roles are the realm's reskin of the universal 35-archetype NPC spine (per `NPC-ROLE-REALMS.md`) plus this realm's exclusive `adds`.

### NPC sheet 1/2

1. **Longshoreman or Teamster** — Moves the heavy things; sees everything, is asked nothing.
2. **Sandhog or Sewer-man** — Works the dark and the tight places; patient underground.
3. **Hotel bellhop or Charwoman** — Invisible to the powerful, and so hears every secret.
4. **Vagrant or Flophouse tenant** — Has nothing, so knows the streets better than anyone.
5. **Machinist or Repairman** — Their tools carry their whole history.
6. **Gunsmith or Locksmith** — Calloused hands; deals in practical defense.
7. **Diner cook or Lunch-counter man** — Up before dawn; holds the neighborhood's gossip.
8. **Construction hand or Building super** — Reads every structure out of habit; knows what's load-bearing.
9. **Tailor or Seamstress** — Notices the cut and quality of everyone's clothes.
10. **Pawnbroker or Wholesaler** — Information-rich, truth-poor.
11. **Barkeep or Club owner** — Controls the space, not the people in it.
12. **Chemist or Pharmacist** — Smells of bitterroot; knows what heals and what doesn't.
13. **Back-alley doctor or Nurse** — Trusted, and overburdened by it.
14. **Parish priest** — Maintains the ritual, not the doctrine.
15. **Nightclub act or Emcee** — Craves the attention; hides the true feeling under it.
16. **Beat cop or Precinct detective** — Authority-adjacent, with limited real power.
17. **Triggerman or Leg-breaker** — Loyalty bought with coin, and cynical about it.
18. **Bodyguard or Wheelman** — Wary of the road; values a good pair of boots.
19. **Stick-up man or Heist crew** — Desperate or cruel; lives outside the law.
20. **Bootlegger or Runner** — Hides the cargo; speaks only in euphemism.
21. **Second-story man or Grifter** — Eyes every coin-pouch; avoids every eye.
22. **True-believer behind a clerk's face** — Fanatical devotion behind a mundane face.
23. **Union organizer or Outfit recruiter** — Charisma aimed at the desperate; sells belonging.
24. **Immigrant newcomer or Out-of-towner** — Chose to stay here; the reasons stay unclear.
25. **Shut-in** — Known of, rarely seen.

### NPC sheet 2/2

1. **Acting captain or Understudy** — Filling in for someone absent; borrowed authority.
2. **Ward boss or Neighborhood fixer** — Power without a title.
3. **In-over-their-head appointee** — Unqualified, unwilling, or both — and in the role anyway.
4. **Society heir or Kept socialite** — Wealthy, bored, insulated from real consequence.
5. **Shipping or real-estate magnate** — Sees every interaction as a transaction.
6. **Occult collector or Alienist** — Hoards the secret knowledge; sees others as material.
7. **The stranger in the good suit** — Their very presence is the notable thing.
8. **Private eye** — Takes the case nobody else will, for money they'll probably never see.
9. **Fatale** — The reason the case exists; wants the one thing you can't hand over.
10. **Crooked D.A. / captain** — The law, for sale, with a smile and a firm handshake.
11. **Stool-pigeon** — Sells whispers; terrified of the morning the buyer decides they're done.
12. **Torch singer** — The club fixture who sees exactly who meets whom after midnight.
13. **Honest beat cop** — The one clean badge on the force, and it's killing their career.
14. **Mob accountant** — Makes the problems and the receipts disappear, in that order.
15. **Widow with a policy** — Grieving, insured, and lying about exactly one thing.
16. **Newshound** — Chases the story past the point where it's safe to print.
17. **Numbers-runner** — The block's small-time bank, and owes upward every single week.

