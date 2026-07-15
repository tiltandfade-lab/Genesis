# PACKET-F13 — Realm animals: the wild, dungeon & domestic rosters (73 identities)

**Authority:** laws identical to PACKET-F1 — the **§0 ART-DIRECTION RULINGS** and chroma rule
apply verbatim; reread them before firing. Compile every sheet from
`FACETED-ART-REGENERATION-PRODUCTION-PLAN.md` §6.8 by copying an F1 Lane-1 prompt (use the 1B
guard-dog prompt as the base — these are all animals) and swapping the bracketed identity.

**What this packet is:** the three flavored animal rosters the walk deals from —
`wild-animal-*` (23), `dungeon-animal-*` (25), `domestic-animal-*` (25). **The slug IS the
identity seed** — each is a full descriptive sentence; render exactly what it says. The seed
column below only adds size, landmarks, and the verb.

## DISCIPLINE (identical across all F-packets; F1 audit lessons baked in)
1. **Filenames:** full slug incl. `spr-fantasy-` prefix; multi-cell sheets join their cell slugs — where joined names would be unwieldy (these slugs are sentences), use the animal keywords (e.g. `spr-fantasy-wild-animal-heron-lynx-kitten-candidate-001.png`) and record the exact full cell slugs in provenance. Candidates numbered **per-slug from 001** (never a lane-global counter — F1 lanes 3–5 collided).
2. **Provenance:** per-lane JSON at `fantasy-pilot/provenance/<packet>-<lane>-generation-calls.json` (packet prefix mandatory, e.g. `f8-lane-u-…` — bare lane names collide across packets) (file / callId / cells with FULL slugs). Never append to the shared AUDIT.md.
3. **Chroma:** flat uniform magenta **#FF00FF**; the chroma color must never appear IN a figure (F1 shipped a magenta-tinted shoe). No gradient, floor, shadow, or horizon.
4. **Crop:** generous padding — tails, ears, antlers, wingtips, hooves WELL inside the frame. Near-edge extremities were F1's most common defect.
5. **Cells:** exactly N figures in N equal vertical 4:8 cells, hard boundaries, no overlap, no shared props, varied poses — no two share a stance. Odd-remainder cells stay pure chroma.
6. **Props:** exactly ONE of each worn item (collar, cage, saddle) — F1 produced a doubled kite shield.
7. **Faces/finish:** grounded, weathered — no cartoon eyes, no candy saturation.
8. **§0 laws:** COMPACT forward-facing support — legs gather under the body, no wide side-sprawl (F1's spider failed exactly this); realistic dark-fantasy register with the stylized triangulated low-poly twist.
9. **No VFX in sources:** the glow-moss grazer's luminescence is faceted MATERIAL in the fur, never a glow plume.
10. Every output is a candidate — `runtimeAdmitted:false`; save to `fantasy-pilot/raw-figures/`; record every generation call id.
**Sheet economy (§0):** Large/Huge = 1 per sheet · Medium = 2 per sheet · Small/Tiny = 4 per sheet (2×2). Animals only — never sheet-share with NPCs.

**ANIMAL REGISTER (binding, per §6.8):** true species anatomy, true scale, ZERO
anthropomorphism. The language reference is the F1 scarred-feral-guard-dog anchor
(candidate-003): compact stalk, honest wear, an animal with a life behind it. Every one of these
slugs encodes a *personality of circumstance* — the render carries it through posture and
condition, never through a humanized face.

## RUN ORDER

Three lanes, disjoint, fire in parallel. Pack sheets by SIZE within each lane (Tiny/Small 4-up ·
Medium 2-up · Large solo). Suggested size tags are in the tables; the packer may regroup but
never crosses lanes on a sheet.

---

## LANE W — wild animals (23)

| slug (verbatim; sentence = seed) | size | landmarks — verb |
|---|---|---|
| spr-fantasy-wild-animal-a-badger-low-broad-digging-with-total-disregard-for-anything-nearby | S | claws mid-dig, thrown earth — verb: DIGS-THROUGH. |
| spr-fantasy-wild-animal-a-black-bear-foraging-unbothered-dangerous-only-if-pressed | M | head down in forage, heavy shoulder — verb: FORAGES. |
| spr-fantasy-wild-animal-a-bull-elk-antlers-full-grown-the-season-s-rut-making-it-reckless | L | full rack, steam-breath stance (no vapor VFX — posture only) — verb: CHALLENGES. |
| spr-fantasy-wild-animal-a-great-owl-silent-wingbeats-watches-more-than-it-hunts | S | wings furled, head turned full to viewer — verb: WATCHES. |
| spr-fantasy-wild-animal-a-heron-stalks-the-shallows-on-legs-too-thin-to-look-that-patient | S | one leg raised mid-step, spear-beak level — verb: STALKS-STILL. |
| spr-fantasy-wild-animal-a-lynx-kitten-spotted-coat-play-stalking-something-that-isn-t-there-yet | T | oversized paws, crouched pounce — awkward, not cute — verb: PLAY-STALKS. |
| spr-fantasy-wild-animal-a-mountain-goat-sure-footed-on-a-ledge-no-predator-bothers-to-follow | M | horn curl, planted downslope stance — verb: HOLDS-THE-LEDGE. |
| spr-fantasy-wild-animal-a-peregrine-falcon-stooping-mid-hunt-faster-than-anything-else-in-the-sky | T | wings swept tight in stoop (kept within compact silhouette) — verb: STOOPS. |
| spr-fantasy-wild-animal-a-red-fox-kit-curious-unafraid-too-young-to-know-better | T | ears too big, one paw lifted — verb: APPROACHES. |
| spr-fantasy-wild-animal-a-single-deer-from-the-herd-moves-with-the-herd-reads-the-wind-before-the-ranger-does | M | head up mid-alert, ears cupped — verb: READS-THE-WIND. |
| spr-fantasy-wild-animal-a-single-elk-grazes-the-tree-line-at-dawn-gone-before-full-light | L | grazing head low, haunches ready — verb: GRAZES-WARY. |
| spr-fantasy-wild-animal-a-single-goose-from-the-migrant-flock-passes-through-and-carries-news-of-where-it-s-been | S | travel-worn feathers, neck high — verb: PASSES-THROUGH. |
| spr-fantasy-wild-animal-a-single-vulture-from-the-carrion-flock-first-to-know-when-something-has-died-nearby | M | hunched bare neck, wings folded like a coat — verb: ATTENDS. |
| spr-fantasy-wild-animal-a-wild-boar-sow-tusks-lowered-protective-of-ground-she-doesn-t-even-own-yet | M | lowered tusks, bristled ridge — verb: WARNS-OFF. |
| spr-fantasy-wild-animal-a-wild-turkey-tom-displaying-loud-oblivious-to-anything-hunting-it | S | full fan display, chest out — verb: DISPLAYS. |
| spr-fantasy-wild-animal-ambush-lynx-solitary-patient-and-the-reason-the-trail-went-quiet | M | flattened crouch, tufted ears pinned — verb: WAITS-UNSEEN. |
| spr-fantasy-wild-animal-burrowing-badger-knows-what-the-earth-carries-underneath | S | earth-stained claws, nose down — verb: LISTENS-LOW. |
| spr-fantasy-wild-animal-half-wild-fringe-fox-drawn-to-the-edge-of-camps-curious-and-never-quite-trusting | S | one ear notched, weight shifted to flee — verb: LINGERS-AT-EDGE. |
| spr-fantasy-wild-animal-old-solitary-boar-scarred-wary-and-gives-ground-to-no-one | M | broken tusk, hide of old scars — verb: STANDS-GROUND. |
| spr-fantasy-wild-animal-river-otter-knows-the-water-s-moods-better-than-any-map | S | wet-sleek coat, mid-lope arch — verb: SLIPS-BETWEEN. |
| spr-fantasy-wild-animal-the-elder-of-the-wood-the-beast-every-other-animal-on-the-node-defers-to | L | a great stag or bear — packer's read of the realm — age-greyed, immense calm — verb: PRESIDES. |
| spr-fantasy-wild-animal-the-realm-beast-a-locally-distinct-wild-creature-one-animal-realm-appropriate | M | an invented-but-plausible fantasy-realm wild animal; grounded, no chimera excess — verb: BELONGS-HERE. |
| spr-fantasy-wild-animal-watcher-hawk-sees-the-whole-valley-from-height-and-forgets-nothing-it-circled | T | perched forward-lean, unblinking — verb: MARKS. |

## LANE D — dungeon animals (25)

The register here bends toward quiet horror: pale, adapted, abandoned. Condition tells the story.

| slug (verbatim; sentence = seed) | size | landmarks — verb |
|---|---|---|
| spr-fantasy-dungeon-animal-abandoned-mine-canary-a-small-bird-in-a-rusted-cage-somehow-still-alive-still-singing | T | rusted cage IS the figure's base object (one cage) — verb: SINGS-ANYWAY. |
| spr-fantasy-dungeon-animal-an-ordinary-animal-deliberately-unremarkable-domestic-or-wild-doesn-t-matter-its-presence-this-deep-is-the-signal-let-the-scene-decide-what-it-means | S | a plain cat/dog/goat — the wrongness is only WHERE it is — verb: SHOULDN'T-BE-HERE. |
| spr-fantasy-dungeon-animal-blind-cave-rat-pale-sightless-thrives-in-total-dark-first-sign-something-s-been-dug-through | T | skin-pale, sealed eyes, long whiskers — verb: FEELS-AHEAD. |
| spr-fantasy-dungeon-animal-blind-salamander-pale-slow-the-kind-of-thing-that-shouldn-t-have-a-reason-to-be-this-deep | T | translucent skin, faceted pallor — verb: CLINGS. |
| spr-fantasy-dungeon-animal-cave-adapted-spider-pale-eyeless-spins-webs-across-passages-nobody-s-walked-in-years | S | legs GATHERED (F1 spider lesson), eyeless head — verb: WAITS-IN-WEB. |
| spr-fantasy-dungeon-animal-cave-cricket-oversized-chirping-alone-in-the-dark-first-warning-of-the-swarm-nearby | T | oversized antennae, cocked leg — verb: CHIRPS-ALONE. |
| spr-fantasy-dungeon-animal-chained-beast-escaped-its-post-a-working-animal-that-slipped-its-old-restraint-still-wears-the-collar | M | dragging chain length, collar-worn fur — verb: DRAGS-THE-CHAIN. |
| spr-fantasy-dungeon-animal-deep-well-fish-stranded-flopping-in-a-puddle-far-from-any-real-water-source | T | mid-flop arch, gasping gill — verb: STRANDS. |
| spr-fantasy-dungeon-animal-echo-startled-bird-a-single-bird-trapped-in-the-upper-galleries-flies-at-every-footstep | T | wings half-burst open, feathers ragged — verb: STARTLES. |
| spr-fantasy-dungeon-animal-feral-falconry-bird-a-hawk-that-escaped-its-jesses-generations-ago-now-hunts-the-tunnels-vermin | S | frayed jess still on one leg — verb: HUNTS-THE-DARK. |
| spr-fantasy-dungeon-animal-feral-vermin-catcher-once-someone-s-ferret-or-terrier-now-lives-wild-in-the-tunnels-still-killing-rats-out-of-habit | S | matted coat, kill-ready crouch — verb: KILLS-FROM-HABIT. |
| spr-fantasy-dungeon-animal-glow-moss-grazer-a-small-rodent-whose-fur-has-picked-up-a-faint-luminescence-from-what-it-eats | T | luminescence as faceted fur MATERIAL, no glow VFX — verb: GRAZES-GLOWING. |
| spr-fantasy-dungeon-animal-half-tamed-thing-comes-to-a-lantern-s-light-never-a-hand-feeds-on-what-the-dungeon-leaves-behind | S | indeterminate small scavenger, reflective eyes — verb: KEEPS-DISTANCE. |
| spr-fantasy-dungeon-animal-lost-hunting-hound-a-noble-s-dog-that-wandered-too-far-in-and-never-found-the-way-back-out | M | fine collar gone filthy, ribs showing — verb: SEARCHES-STILL. |
| spr-fantasy-dungeon-animal-nest-robbing-crow-one-bird-that-s-learned-the-dungeon-s-side-passages-better-than-most-explorers | T | something small and stolen in beak — verb: ROBS. |
| spr-fantasy-dungeon-animal-scarred-guard-dog-gone-feral-once-trained-to-patrol-these-halls-now-answers-to-no-one | M | **COVERED — do not regenerate.** F1 anchor `spr-fantasy-scarred-feral-guard-dog` (candidate-003 ACCEPT) is this identity; admission maps the anchor's winner onto this legacy id. |
| spr-fantasy-dungeon-animal-sole-survivor-packhorse-the-last-of-a-caravan-s-animals-malnourished-still-saddled | L | rotted saddle straps, hip bones — verb: ENDURES. |
| spr-fantasy-dungeon-animal-starving-stray-a-cat-or-dog-that-followed-someone-in-and-got-left-behind | S | tucked tail, hollow flank — verb: FOLLOWS-HOPING. |
| spr-fantasy-dungeon-animal-trapped-messenger-pigeon-still-carries-a-note-no-one-living-will-ever-read | T | message tube on leg, dust-grey — verb: CARRIES-ON. |
| spr-fantasy-dungeon-animal-tunnel-adapted-snake-pale-scaled-sluggish-in-the-cold-strikes-only-when-cornered | S | coiled tight (§0), milky scales — verb: CONSERVES. |
| spr-fantasy-dungeon-animal-tunnel-bat-colony-straggler-a-single-bat-that-never-rejoined-the-swarm-clings-alone-near-a-cracked-vent | T | wings wrapped like a shroud — verb: CLINGS-ALONE. |
| spr-fantasy-dungeon-animal-tunnel-blind-mole-huge-clawed-forepaws-displaces-more-earth-than-it-should-be-able-to | S | outsized digging claws (diegetic — its whole life) — verb: DISPLACES. |
| spr-fantasy-dungeon-animal-unnervingly-large-lone-rat-alone-watching-doesn-t-scatter-like-the-others | S | too big, too still, watching — verb: DOESN'T-SCATTER. |
| spr-fantasy-dungeon-animal-wrong-place-goat-a-farm-animal-that-fell-through-a-sinkhole-and-somehow-survived-down-here | M | scraped knees, chewed everything — verb: SURVIVES-WRONG. |
| spr-fantasy-dungeon-animal-wrongly-still-lizard-motionless-so-long-it-s-mistaken-for-a-carving-until-it-isn-t | S | stone-grey stillness, one live eye — verb: ISN'T-A-CARVING. |

## LANE H — domestic animals (25)

Working-life register: kept animals with jobs, tempers, and owners. Honest tack and wear.

| slug (verbatim; sentence = seed) | size | landmarks — verb |
|---|---|---|
| spr-fantasy-domestic-animal-a-single-caged-ferret-kit-young-hyperactive-still-learning-the-vermin-catcher-s-trade | T | small travel cage, mid-wriggle — verb: LEARNS-THE-TRADE. |
| spr-fantasy-domestic-animal-a-single-caged-songbird-kept-for-the-sound-of-it-restless-behind-the-wire | T | wire cage, wings half-open — verb: SINGS-RESTLESS. |
| spr-fantasy-domestic-animal-a-single-donkey-stubborn-sure-footed-outlives-every-horse-on-the-property | M | worn pack-pad, planted legs — verb: REFUSES. |
| spr-fantasy-domestic-animal-a-single-duck-waddling-unbothered-first-to-notice-a-stranger-at-the-water-s-edge | T | mid-waddle, head cocked at viewer — verb: NOTICES-FIRST. |
| spr-fantasy-domestic-animal-a-single-goat-headstrong-climbs-what-it-shouldn-t-eats-what-it-shouldn-t | S | something half-eaten in mouth, hoof up on nothing — verb: SHOULDN'T-BUT-DOES. |
| spr-fantasy-domestic-animal-a-single-goose-from-the-flock-loud-territorial-first-to-mark-a-stranger | S | neck low in threat-arc, wings cocked — verb: MARKS-THE-STRANGER. |
| spr-fantasy-domestic-animal-a-single-hunting-hound-lean-nose-down-bred-for-the-chase-and-bored-without-it | M | lean frame, nose to ground — verb: NEEDS-THE-CHASE. |
| spr-fantasy-domestic-animal-a-single-kitten-too-young-to-have-earned-the-barn-cat-s-independence-yet | T | oversized ears, uncertain stance — awkward, not saccharine — verb: HASN'T-EARNED-IT. |
| spr-fantasy-domestic-animal-a-single-peacock-kept-for-show-screams-like-something-s-wrong-when-nothing-is | S | full train folded (compact), beak open mid-scream — verb: SCREAMS-AT-NOTHING. |
| spr-fantasy-domestic-animal-a-single-pig-smarter-than-it-s-given-credit-for-rooting-at-the-fence-line | M | mud-dark snout, clever small eye — verb: ROOTS-AT-THE-LINE. |
| spr-fantasy-domestic-animal-a-single-pony-smaller-and-calmer-than-the-war-mule-a-child-s-first-mount | M | child-sized saddle, patient stance — verb: STANDS-PATIENT. |
| spr-fantasy-domestic-animal-a-single-rabbit-twitchy-kept-for-the-table-or-kept-as-a-pet-never-sure-which | T | ears up, frozen mid-chew — verb: NEVER-SURE. |
| spr-fantasy-domestic-animal-a-single-sheep-from-the-herd-moves-with-the-others-and-its-lone-reluctance-to-follow-is-the-tell | M | half-turned against the flock's direction — verb: HESITATES. |
| spr-fantasy-domestic-animal-a-single-turkey-puffed-up-and-loud-more-guard-animal-than-anyone-admits | S | full puff, wattle forward — verb: GUARDS-LOUD. |
| spr-fantasy-domestic-animal-a-single-turtle-slow-kept-yard-animal-older-than-most-of-the-household | T | worn shell facets, deliberate step — verb: OUTLASTS. |
| spr-fantasy-domestic-animal-barn-cat-owns-the-place-tolerates-the-people-hunts-the-dark-corners | S | seated ownership posture, scarred ear — verb: OWNS-THE-BARN. |
| spr-fantasy-domestic-animal-bird-kept-close-a-single-hawk-carries-watches-and-remembers-a-face | S | jesses and hood-off alertness — verb: REMEMBERS-FACES. |
| spr-fantasy-domestic-animal-half-tamed-wild-thing-comes-to-the-window-never-the-hand-trusts-one-child-and-no-one-else | S | indeterminate small wild pet, poised between stay and flee — verb: TRUSTS-ONE. |
| spr-fantasy-domestic-animal-loyal-dog-bonded-to-one-person-reads-their-mood-before-they-do | M | head tilted in read, honest working coat — verb: READS-THE-MOOD. |
| spr-fantasy-domestic-animal-old-animal-past-its-working-years-half-blind-and-still-the-first-to-growl-at-the-wrong-thing | M | clouded eye, greyed muzzle, low growl posture — verb: STILL-GROWLS-FIRST. |
| spr-fantasy-domestic-animal-stray-belongs-to-no-one-and-everyone-the-street-s-own-alarm-bell | S | street-scruffy dog, head thrown to bark — verb: SOUNDS-THE-ALARM. |
| spr-fantasy-domestic-animal-the-realm-beast-the-realm-beast-a-locally-distinct-pet-one-animal-realm-appropriate | S | an invented-but-plausible fantasy-realm kept animal; grounded — verb: IS-KEPT. |
| spr-fantasy-domestic-animal-the-town-s-own-animal-the-one-everyone-knows-by-name-its-fate-is-the-town-s-mood-made-visible | M | a town-square dog/goat/cat, well-fed, collar of braided favors — verb: BELONGS-TO-EVERYONE. |
| spr-fantasy-domestic-animal-vermin-catcher-a-single-ferret-goes-gladly-where-people-won-t | T | sleek working ferret, mid-slink — verb: GOES-GLADLY. |
| spr-fantasy-domestic-animal-working-beast-a-single-ox-earns-its-feed-patient-and-spooks-true | L | yoke-worn shoulders, massive patience — verb: EARNS-ITS-FEED. |

---

## After the returns

Chroma removal → despill/dilation → bounds/anchor/scale → canonical isolated renders → blind
visual judge → integrated theater matrix → admission record or typed rejection (§9 Steps E–L).
Generation is never completion; nothing ships without `in-game-pass`; the legacy sprite stays the
fallback until admission.
