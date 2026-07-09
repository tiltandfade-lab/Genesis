---
type: system-spec
project: Genesis
status: SPEC — drafted by Fable 2026-07-08, awaiting Adam's review
created: 2026-07-08
origin: Adam — "I really want to reward people who use Speak with Animals… a ranger or druid that
  mostly plays the game by speaking with animals would be such a fun playthrough."
related:
  - "[[NPC-PARTIALS]]"
  - "[[NPC-PRESENCE-AND-HOOKS]]"
  - "[[SOCIAL]]"
  - "[[MONSTER-PARLEY]]"
  - "[[COMPANIONS]]"
---

# ANIMAL-SOCIAL — animals as a first-class social layer

## §0 The player this spec is for

A wood-elf ranger who never wants to see a city. She learns the valley the way other PCs learn a
tavern: the herd that won't graze the east meadow, the raven that trades shiny things for gossip,
the old half-blind dog at the mill that growled at the miller's new wife before anyone else knew
to. Her "social sessions" are with Beasts. Almost no game lets you play that archetype without
dragging you back to town; Genesis should let her stay out there and have a full game.

Speak with Animals (L1, ritual, Bard/Druid/Ranger/Warlock; Druids get it always-prepared with
Druidic) is the underused key. The SRD text is already a contract: *"a Beast can give you
information about nearby locations and monsters, including whatever it has perceived within the
past day"* — that is a **query API against world state**, and Genesis actually HAS the world state
to answer it. This spec mechanizes the lane so it's the engine's answer, not DM improv.

**What already exists (ground-truthed 2026-07-08):**
- `rollPartial('animal')` (`src/engine/codex-roll.js` ~355) mints kind + tell + need — no lever stack.
- `animal-kind` d12 (row 11 = held realm-reskin slot, row 12 = the town's own animal) and
  `animal-tell` d20 (the living-detector pointer atom) are compiled and live.
- Ambient partials mint only via `SCENE_PARTIALS` (`src/world/prep.js` ~125) — four **settlement
  interior buckets** (shrine/shop/tavern/market). Wilderness mints zero animals. That's the gap.
- The attitude/parley resolver (`src/engine/social.js`, SOCIAL.md ladder −2…+2) and the creature
  bridge (MONSTER-PARLEY: Beasts roll **WIS/Animal Handling**, Anomaly Law, pet/hireling/sidekick
  tiers) are BUILT. This spec does not invent a second social system — it routes ambient animals
  onto the existing ladder with animal-shaped levers.

Division of labor, per DM-CHARTER: the engine owns the nouns (which animal, what it perceived,
whether the check moves attitude); the DM owns meaning and voice (what a dog's account *sounds*
like); the DM never decides the PC's actions and never rolls the player's dice.

---

## §1 Environment banding — where animals actually live

### The axis

Five environment bands, orthogonal to realm:

| band | density feel | composition center of gravity |
| --- | --- | --- |
| **wilderness** | animal-RICH — animals ARE the population | wild kinds: territory-holders, flocks, watchers |
| **rural** | working animals everywhere | herd, working beast, fowl, dog |
| **village** | domestic mix underfoot | dog, cat, fowl, the town's own animal |
| **city** | thin, opportunist | stray, vermin-catcher, kept bird, cart-beast |
| **dungeon** | near-zero, and each one is a signal | vermin-catcher gone feral, the half-tamed thing, the animal that shouldn't be down here |

Realm reskins layer ON TOP, exactly as today: the band picks the ecological slot, row 11 / the
in-place reskin note picks the realm face (Chrome's stray is a scavenging drone; Bright-Kingdom's
raven is a shade too clever).

### Shape decision: weighted pools over one universal d12 — plus ONE new wild table

Three candidate shapes:

1. *One table with an environment column* — rejected. Animal Kind is a crafted d12 where each row
   is one face of one die ("a row IS a stable identity"); bolting a 5-band eligibility matrix onto
   12 rows either bloats every row or turns rolls into reroll-until-legal loops.
2. *Per-environment tables ×5* — rejected. Four of the five bands share most of their kinds; five
   near-duplicate crafted tables is a maintenance lie (the craft-pass burden quintuples for ~20%
   real divergence).
3. **Weighted pools over shared rows — RECOMMENDED.** Keep `animal-kind` d12 untouched as the
   *domestic/settlement spine*. Add an engine-side weight profile per band
   (`ANIMAL_ENV_WEIGHTS`) that maps band → row-weight vector, same posture as
   `AMBIENT_SCENE_TEMP_MULT` (engine owns the numbers, doc owns the shape). A city draw
   overweights rows 4/8/7, a rural draw overweights 2/5/6, dungeon collapses to rows 8/10 + the
   realm-beast.

   The one place re-weighting is NOT enough is wilderness — a wolf, a heron, an elk herd, a badger
   sett are not re-weighted barn cats. So wilderness gets **one new crafted table**,
   `wild-animal-kind` (d12, mirrors Animal Kind's format: row 11 = realm-reskin slot, row 12 =
   "the elder of the wood" — the wilderness analog of the town's own animal, the beast every other
   animal defers to). One new table, not five; the domestic spine stays a single source of truth.

### Frequency wiring

Extend the existing prep machinery rather than adding a parallel system:

- `SCENE_PARTIALS` keeps its four interior buckets, unchanged.
- New `ENV_PARTIALS` at the node level (prep-time, beside `prepCastAmbient`):
  `{ wilderness:{animal:0.9, draws:3}, rural:{animal:0.7, draws:2}, village:{animal:0.5, draws:2},
  city:{animal:0.25, draws:2}, dungeon:{animal:0.08, draws:1} }` — per-draw gated chance, same
  draw grammar as SCENE_PARTIALS (a miss ends the draws). Numbers are engine implementation-fill;
  the shape (wilderness ≈ always, dungeon ≈ almost never and always meaningful) is the law.
- `rollPartial('animal', {env})` picks the table (`wild-animal-kind` for wilderness, weighted
  `animal-kind` otherwise). Node env already exists (`P.nodes[..].env` carries
  `wilderness`/urban/dungeon; rural/village derive from settlement tier — smallest settlements
  read rural, mid read village, large read city).

---

## §2 Speak with Animals — tells become answers

### The inversion

Without the spell, an animal's tell is a breadcrumb the DM narrates and the player decodes.
**With the spell, the animal becomes an interviewable witness** — the tell stops being atmosphere
and becomes a question the player can just ask: *"why won't you go in the cellar?"*

### What an animal knows (the witness packet — engine-owned)

Deterministic rule: **the interview reveals the referents of things the engine already rolled.**
Nothing is invented at ask-time. When a Speak with Animals interview opens against an animal
record, the engine assembles a `witness` packet into the DM digest from live state:

1. **Its tell's referent.** The tell was rolled at mint; the DM bound it to a nearby hook/secret
   (the existing pointer contract in `animal-tell`). The interview surfaces that binding —
   `witness.tell = { text, boundTo: <codex ref or hook ref> }`. The animal now *says* (in animal
   terms) what it was only *signaling* before.
2. **Perception window — the SRD's "past day."** Events within the last in-world day whose
   location matches the animal's `status.at` (or adjacent node for rangers of kind: bird), drawn
   from the event log: combat here, deaths, arrivals, a codex NPC whose record moved through.
   `witness.seen = [...]`, each entry tagged with the sensory channel (smell/sound/sight).
3. **Locations and monsters nearby** (SRD floor): the node's known exits, any creature codex
   records with `status.at` in this or adjacent nodes. The animal is a free, diegetic scouting
   report — this is the reward lane. A ranger who interviews the raven gets real map/threat
   intel the fighter has to bleed for.

### The significance-blind law (binding)

An animal reports **sense-data, never meaning**. The engine enforces this by construction — the
witness packet carries facts, not conclusions — and the DM enforces it in voice:

- A dog's account of a murder is **a smell, a sound, and a shoe** — "the loud-hurt smell, the
  man-who-feeds-me shouting, then the not-moving." Never "I witnessed the miller kill his wife."
- No names (animals know people as smells/roles: *the-one-who-feeds*, *the-hurt-hand-man*), no
  motives, no dates, no abstractions, nothing outside its senses, nothing older than the SRD
  window except **place-memory** (§5 — standing facts about its own territory: the bad water, the
  place-we-don't-go — which is exactly what "information about nearby locations" licenses).
- The DM translates the packet into animal-voice and *may not add facts to it*. If the player
  asks something outside the packet, the honest answer is animal indifference ("little to say
  about topics that don't pertain to survival or companionship" — SRD, verbatim, already the
  perfect tone note).

### Willingness gates the interview, not the truth

The spell grants comprehension, not cooperation (SRD: Influence actions apply). The witness
packet is assembled regardless; **attitude decides how much of it the animal volunteers**:
Hostile/Unfriendly → nothing or the minimum, and an Animal Handling check (the existing social
resolver, §3) is how you open it up. Wary animals don't lie — they withhold. (Animals never run
the NPC Honesty table; an animal is incapable of a motivated lie. That's a feature: befriended
animals are the one *fully reliable* information channel in a game whose NPCs lie.)

---

## §3 Animal attitude & parley — kindness is the currency

**Reuse, don't rebuild.** Ambient partial animals join the existing ladder exactly the way
MONSTER-PARLEY put creatures on it:

- Animal partial records take an `attitude` field (default 0 for domestic kinds, −1 for
  `wild`/`wary`-tagged rows and all `wild-animal-kind` draws). Same −2…+2 ladder, same
  `SOCIAL_DC_BY_ATTITUDE`, same one-step-per-check law.
- **The check is WIS (Animal Handling)** — already the MONSTER-PARLEY rule for Beasts; extend the
  `socialCheckAbilityFor(rec)` guard to `partialKind:"animal"`.
- **Levers are care, not coin.** In place of the adult gold/leverage/fear stack, an animal's
  levers derive from its rolled `need` (already on the record: hungry/guarding/lost/loyal):
  hungry → **feeding** (auto-lever: sharing rations = advantage on the check, a consumable sink),
  lost → **guiding/returning it**, guarding → **respecting the threshold** (approach wrong and
  the check is at disadvantage), loyal → **through its person**. Plus one universal lever:
  **patience** — repeat visits. Each *revisit* with kind treatment grants one fresh check;
  attitude persistence across visits is the codex doing its job.
- **Class-native advantage (the reward lane, script-owned):** Rangers and Druids treat every
  animal's opening attitude as one step better, and Speak with Animals active grants advantage on
  Animal Handling checks against the target (you can *negotiate*). Both are flat mechanical
  rules — no DM judgment call, no drift.
- **Ceiling discipline:** ordinary checks clamp at +1 (Friendly), mirroring the Anomaly Law's
  grind ceiling. +2 (Helpful — the befriended-ally gate, §4) is reachable ONLY by the sustained-
  care track: a script-owned counter (`fields.care`) that ticks on fed/tended/defended events
  across **3+ distinct visits**. Friendship with a wild thing is earned in time, not rolled in a
  minute — and the counter, not the DM's mood, decides.

Intimidation against animals exists (you can scare off a dog) but overshoot → the existing
Terrified state and the animal's kind remembers: all animals of that node take −1 opening toward
this PC (the farm dogs talk). Cruelty is priced.

---

## §4 Persistent animal NPCs — the named recurring animal

- Any animal the player engages twice, names, or raises past +0 gets **promoted from ambient to a
  full codex record** (drop `dm.ambient`, keep the partial stack) — it recurs via prep like any
  cast NPC, at its territory/home node. Row 12 ("the town's own animal") and wild row 12 ("the
  elder of the wood") mint as named codex records from the start.
- **Befriended ally (attitude +2 via the care track):** the animal becomes a light
  **social/informational ally**, NOT a stat-block pet — it greets the PC, volunteers its full
  witness packet without checks, will *lead* the PC to things it knows (a soft-recall-style
  guided walk to the tell's referent), and its tell re-rolls when the world turns (a befriended
  animal is a standing sensor on its node). It does not fight, take orders in combat, or travel
  with the party.
- **Full companion mechanics are DEFERRED — and already have a home.** If Adam wants the ally to
  graduate into a travelling pet, that is MONSTER-PARLEY's pet tier and the Anomaly Law's
  bondEligible gate, not new machinery here. This spec deliberately stops at "ally who lives in
  the world"; no backdoor around the difficult-af companion doctrine.
- Death is real and graphic per the NPC-PARTIALS tone ruling — animals are no exception to the
  brutality, and the befriended raven's death is exactly the blade-taking-up moment.

---

## §5 The wilderness social web — how the wood becomes a town

The design move: **a wilderness region is a settlement whose NPCs are animals.** Reuse the town's
social grammar (cast, territories, knowledge, hooks) with animal semantics — mechanized as tables
and per-node state, never DM improv.

- **Territory = residence.** Each wilderness node's ENV_PARTIALS cast includes one
  **territory-holder** (the wild-kind who "owns" the node — the codex `status.at` anchor, the one
  who gets promoted first). Crossing a territory is a social scene the same way entering a shop
  is: the holder's attitude and need ARE the encounter.
- **Knowledge scopes by kind — what the herd knows vs what the raven knows.** A small crafted
  mapping table, `animal-knowledge-scope` (keyed by wild-kind row, not rolled): *herd* = movement,
  weather, what spooked them and from which direction; *raven/bird* = faces, shiny objects,
  carrion, everything within a day's flight (the adjacent-node reach in §2); *predator* = who
  else hunts here, what the prey do differently lately; *burrower* = underground — voids, water,
  what the earth carries. The witness-packet assembler filters `witness.seen` through the scope:
  interviewing the right KIND for the question is the player's skill expression.
- **Loose animal factions:** wild-kind rows carry faction-ish tags (flock/pack/solitary/
  parliament); pack-tagged animals share attitude within a node (befriend the pack leader,
  befriend the pack; wrong one, all of them), solitaries don't. One rule, big texture.
- **Seasonal/temporal knowledge:** place-memory (§2) includes the node's standing wilderness
  facts (the walk system's biome + any rolled node hooks) plus season-keyed entries — the ford
  that floods, when the pass closes, where the elk winter. This is the walk/travel layer paying
  social dividends: the ranger who interviews her way through a region travels it with
  soft-recall-grade knowledge others don't get.
- **Social sessions, structurally:** wilderness nodes get the same guaranteed-scene-hook law as
  interiors (`ensureSceneHook` over the node's animal pool — the hook rides the territory-holder's
  tell). An all-wilderness session then has the full loop: arrive → meet the holder → parley
  (care levers) → interview (witness packet) → the tell points at the region's live hook → act →
  the web remembers. That IS a social session; nobody went to town.

---

## §6 Engine build units (Sonnet-executable)

Each unit: branch per house rules, `check-manifest.py` after module edits, red-first test in the
jsdom harness (load real `genesis.html`, assert before building until it fails for the right
reason). Never trust self-reported green.

**U1 — `wild-animal-kind` table + weighted pools.** Author `Engine/03. _Tables/02. Social/
Sentient NPCs/Wild Animal Kind.md` (d12, format-identical to Animal Kind: row 11 realm-skin slot,
row 12 elder-of-the-wood; tags in-format; exempt from situation family) — CRAFT-LANE: rows are
drafts for Adam's pass. Recompile tables. Add `ANIMAL_ENV_WEIGHTS` (5 bands → row-weight vectors)
+ `rollPartial('animal', {env})` table/weight selection in codex-roll.js.
*Accept:* `rollTable('wild-animal-kind')` returns rows; `rollPartial('animal',{env:'wilderness'})`
draws from wild table; `{env:'city'}` over 200 trials never yields herd/working-beast rows more
than weights allow. *Red-first:* assert env option changes the draw distribution — fails today
(option ignored).

**U2 — ENV_PARTIALS node-level animal population.** In prep.js beside SCENE_PARTIALS: the §1
frequency map; `prepCastAmbient` (node-level path) draws animals per the node's env band;
settlement-tier → rural/village/city derivation; wilderness territory-holder = first draw, minted
non-ambient (named-record candidate). SCENE_PARTIALS byte-identical.
*Accept:* prep on a wilderness node mints ≥1 animal with high probability (seeded trials);
dungeon nodes almost never; existing prep tests green. *Red-first:* wilderness node mints 0
animals today.

**U3 — animals on the attitude ladder.** Attitude field on animal partials (defaults per §3);
`socialCheckAbilityFor` covers `partialKind:"animal"` → WIS/Animal Handling; care levers derived
from `need` (`animalLevers(rec)`, pure, mirror of `creatureLevers`); ranger/druid opening-step
bonus + SwA-advantage flags; +1 grind clamp; `fields.care` counter + the 3-visit Helpful gate
ticking off feed/tend events.
*Accept:* social_check vs an animal uses Animal Handling; attitude persists across prep revisits;
care<3-visits can never yield +2 regardless of rolls (fuzz 500 checks). *Red-first:*
`codexSetAttitude` on a partial record — document current behavior, then gate.

**U4 — the witness packet (Speak with Animals lane).** `animalWitness(w, rec)` (pure, engine):
assembles `{tell:{text,boundTo}, seen:[...last-day events at/adjacent per scope], nearby:
{exits, creatures}, placeMemory:[...]}` from event log + codex + node state; surfaces in the DM
digest when an interview opens (SwA active or DM marks the channel open); attitude gates volunteered
depth per §3. Sensory-channel tags on `seen` entries. No invention at ask-time — packet contents
must be reproducible from state.
*Accept:* same world state → identical packet (determinism test); packet never contains NPC names
(role/smell handles only); events older than 1 in-world day excluded (except placeMemory).
*Red-first:* digest for an animal interview today carries only kind+tell+need.

**U5 — promotion + befriended ally.** Twice-engaged/named/+0-crossed ambient animals promote to
persistent codex records; +2 ally behavior flags (`dm.ally:true` → auto-volunteer packet, lead-to-
referent via the soft-recall walk seam, tell re-roll on world turn); cruelty memory (node-wide −1
opening after Terrified overshoot). NO companion minting — assert `recruit_creature` still rejects
partials (the MONSTER-PARLEY gate is the only door).
*Accept:* promoted animal recurs at its node across sessions; ally packet needs no check; partial
records cannot enter the companions list. *Red-first:* ambient animals are currently pool-recycled,
not persistent.

**U6 — knowledge scopes + the wilderness web.** `animal-knowledge-scope` mapping (data, keyed by
wild-kind row); packet `seen`-filter by scope; pack-tag shared attitude; season/place-memory
entries from walk biome + node hooks; `ensureSceneHook` extended over wilderness animal pools
(hook rides the territory-holder tell).
*Accept:* raven-scope packet includes adjacent-node events, herd-scope doesn't; pack attitude
shift propagates within node only; wilderness node always has ≥1 hook after prep. *Red-first:*
scope filter absent — all kinds currently see identical packets (once U4 lands).

Order: U1 → U2 → (U3 ∥ U4) → U5 → U6. Register in DESIGN.md/NEXT-STEPS at land time (shared-doc
serialization rule).

---

## Adam's rulings needed

1. **Realm-skin tables for animals** — the NPC-PARTIALS open question, now load-bearing twice
   (domestic row 11 + wild row 11). Full per-realm skin tables like roles, or keep the in-place
   reskin note? Recommendation: in-place note until the wilderness web is felt in a playtest.
2. **`wild-animal-kind` rows** are craft-lane — U1 drafts them, Adam's pass makes them his.
3. **The Helpful gate tuning** — 3 distinct visits is the proposed floor; taste call (too fast
   cheapens it, too slow kills the fantasy in a short campaign).
4. **Does the uncanny leak in?** Wild row 12 / tell row 20 flirt with the breach. Should
   high-band worlds let interviewed animals report breach-tagged perceptions ("the thing with no
   smell") as a spice-band-gated packet entry? (Cheap to add in U4; pure fuel per the
   band-calibration ruling.)

## RESOLVED — Adam's rulings (2026-07-08 night)
1. **Animal realm skins: the spine/skin/extras treatment** (overrides the in-place-note recommendation) — Animal Kind gets per-realm skins like roles, "it can allow for some spectacular additions per realm." U1 grows accordingly.
2. **Helpful gate = 3 distinct care visits as the GENERAL gate**, but bypassable: *animal friendship*-class spells and strong Charisma results can shortcut it for the classes built for it.
3. **Breach-tagged perceptions: YES, spice-band-gated** — interviewed animals in high-band worlds may report the thing with no smell.
4. Befriended-guide walk discount: kept.
