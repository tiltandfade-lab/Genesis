---
type: system-spec
status: "SPEC — Adam locked the throughline 2026-07-08; tables craft-lane, engine unit pending"
branch: docs/gloom-key-spec
created: 2026-07-08
canonical: true
related:
  - "[[DESIGN]]"
  - "[[CONSEQUENCE-LADDER]]"
  - "[[REALM-ROLE-EDGES]]"
  - "Engine/03. _Tables/05. Realms/Realm Items - Gloom.md"
  - "Engine/03. _Tables/02. Social/Sentient NPCs/NPC Role Skin - Gloom.md"
  - "data/realms.js"
---

# GLOOM-KEY — the town that made a deal

**Adam's ruling, 2026-07-08 (LOCKED):** Gloom's throughline is **"the town that made a deal."
It's essentially Derry, Maine.** The town prospers — or merely survives — because of an old
arrangement nobody alive agreed to; the monster is the **payment coming due on a schedule**.

## 1. The Key (prose)

Five commitments, each with a rationale:

1. **The deal precedes the player and the townsfolk.** Nobody alive signed it. The founders did,
   or the town's oldest family did, or the town simply *grew on top of* something and inherited
   the lease. This is what separates gloom from a monster-of-the-week: the horror is
   **contractual**, and the town is on the paying side. *Rationale:* a deal creates stakes the
   engine can own (a clock, a ledger of payments, named beneficiaries) instead of free-floating
   dread the DM must improvise.

2. **Evil is DOMESTIC, not invasive.** The threat has an **address** — the house on the corner,
   the drain on Neibolt, the garage, the kennel, the room 217. It doesn't arrive; it *resides*.
   The adults collectively **don't-look-at-it**: complicity is the town's load-bearing wall, and
   the NPC social layer must show the not-looking (see §3 tells). *Rationale:* domestic evil
   makes every codex NPC a suspect witness and every ordinary building a potential dungeon —
   depth from what already exists, no new content class (MVP: depth over breadth).

3. **The geography of safety is INVERTED.** Wilderness is fine — the woods are just woods, the
   fields are honest. **HOME is the dungeon.** The cellar, the kennel, the guest room, the
   cul-de-sac after curfew. Dungeon-generation weighting for gloom towns should prefer
   *interiors and domestic structures* over caves/ruins. *Rationale:* this is gloom's single
   sharpest mechanical differentiator from every other realm, and it's a **weighting change**,
   not new machinery.

4. **Gloom is the suburb's shadow.** Same streets, same cul-de-sacs, re-graded dark — Stranger
   Things / IT, the 80s street at 3 AM. **Gloom towns REUSE suburb assets and props via the
   render grade** (`data/realms.js` — gloom's profile: sat 0.55, tint #3a5c3e @ 0.26,
   contrast 1.25 vs suburb's sat 0.90, #d8a868 @ 0.15, contrast 0.85). A suburb prop set
   dressed under the gloom grade *is* the gloom set; bespoke gloom props are the exception
   (the monster, the deal-site). *Rationale:* the model foundry's suburb wave pays for two
   realms; the "same street, wrong hour" effect is the aesthetic POINT, not a budget hack.

5. **Cross-realm bleed sanctioned: the dark-timeline town** (Back-to-the-Future flavor — the
   alternate town where everything turned to detritus). A gloom bleed into suburb (or vice
   versa) may present as *the same town, but the deal was never paid* — prosperity replaced by
   detritus, the complicit adults replaced by the ruled-over. High-band fuel per the band
   calibration ruling (cross-realm bleed = high-band).

**Tone boundaries carried in:** graphic death is a feature (GoT ruling); **children are the
sole carve-out — kids can die, never graphically depicted**; animals get no exception.

## 2. THE TOWN-SECRET TABLE (d20 — rolled once at town mint, one per gloom town)

Draft status: **craft-lane** (rows below are the spec draft; Adam's craft pass graduates them).
Each row = **the secret** (what the deal was) · **payment schedule** (the clock archetype, §3)
· **the town's tell** (how complicity shows in play — surfaces in NPC digests) · tags in-format.

Serial numbers filed off Adam's named canon; blended where the blend is stronger.

| d20 | The secret | Payment schedule | The town's tell | Tags |
|---|---|---|---|---|
| 1 | The thing under the storm drains eats, and in exchange the town's ledgers always balance — no mill closure, no drought year, no outside investigation that ever sticks. The payments are children, taken in a season of them, once a generation. | Generational (~27 yr); currently DUE or within 1–2 ticks at mint. | Adults cannot hold a conversation about a missing child for more than three sentences before changing the subject — and the town has no memorial to any of them. | `deal:founding` `payer:children` `site:understructure` `clock:generational` |
| 2 | A car — one specific car, always garaged, always mint — loves its owner and kills for that love. The family that keeps it has never lost a business dispute, a lawsuit, or a rival. They've lost three sons, who each "moved away." | Anniversary (the purchase date); a death each year it's driven. | Nobody in town will accept a ride from that family, ever, and nobody will say why; the mechanic crosses himself and overcharges them double. | `deal:family` `payer:whoever-crosses-them` `site:garage` `clock:anniversary` |
| 3 | The town knows exactly who the wolf is. He's the reason no outsider predator, human or otherwise, has troubled the town in forty years — and a kid identified him first, and no adult believed the kid, because believing means naming him. | Lunar; one death or maiming per full moon he isn't fed livestock. | Livestock disappears from the SAME farm every month and that farmer never complains; the church congregation is largest, and quietest, the Sunday after a full moon. | `deal:tacit` `payer:strays-and-strangers` `site:a-respected-house` `clock:lunar` |
| 4 | Past the deadfall behind the oldest farms there's ground that returns what you plant. The founding families buried their dead there through two epidemics and a fire — the town *continued* because of it. What comes back pays the town's grief forward at interest. | Per-use (each burial mints a returned thing + advances the master clock). | The town's official cemetery is immaculate and half-empty; the funeral parlor asks, gently, whether you want "the arrangement," and drops it instantly if you look confused. | `deal:founding` `payer:the-bereaved` `site:past-the-deadfall` `clock:per-use` |
| 5 | The night the machines woke, the town made terms: the machines run the mill, the pumps, the generators — flawlessly, freely — and once a season the town leaves someone inside the mill overnight. | Seasonal (solstice/equinox). | The mill has no night shift on the schedule, yet its lights burn all night; every machine in town is suspiciously well-maintained and nobody employs a mechanic. | `deal:negotiated` `payer:by-lot` `site:the-mill` `clock:seasonal` |
| 6 | The doll has moved houses eleven times. Each family that keeps it a full year receives a windfall — an inheritance, a settlement, a recovery — and loses whichever member the doll was closest to. The town quietly manages the rotation. | Anniversary of each adoption (per-household year-clock). | There is a house-warming custom here: a wrapped gift, delivered by the previous family, that new arrivals are strongly urged to display and never open early. | `deal:circulating` `payer:host-family` `site:whichever-house` `clock:anniversary` |
| 7 | The good dog went rabid years ago and the family can't put him down — because the day he first bled, the sickness that was eating their daughter stopped. He's chained past the orchard. The sickness comes back when he's hungry. | Seasonal feeding; a missed feeding = the sickness picks a new child in town. | Every household donates meat scraps to "the farm collection" without being asked; children are taught a rhyme about never going past the orchard, and every adult can still recite it. | `deal:family` `payer:whatever-strays-close` `site:past-the-orchard` `clock:seasonal` |
| 8 | The grand house on the ridge wants a caretaker and keeps its guests. The town sends it one — a drunk, a debtor, a widower going wrong — every few years, and in exchange the house keeps everything the town would rather forget stored in its walls instead of in its streets. | Generational-short (~5 yr); the house advertises when it's hiring. | The town has no bad men. None. Every violent drunk, every abuser, every embezzler "took the caretaker job" — and the town speaks of the house with the tone reserved for a respected employer. | `deal:disposal` `payer:the-town's-worst` `site:the-grand-house` `clock:generational-short` |
| 9 | The father up at the ridge house is turning — the house is wearing him like a coat, and his family is snowed in with him half the year. The town's deal is older: as long as the house has a family to work on, it leaves the town alone. The town makes sure it always has a family. | Seasonal (the closing of the pass); each winter the house takes a family, each spring the town recruits the next. | The town's realtor is its most important citizen, and the listing for the ridge property — generous terms, isolated charm — never, ever comes down. | `deal:diversion` `payer:incomer-family` `site:the-ridge-house` `clock:seasonal` |
| 10 | The scarecrows work the fields. Really work them — the harvest has not failed in ninety years. The price is that anyone who dies within town limits must be given to the fields, stood up on a frame, and *nobody watches the fields at dawn*. | Per-death (each death advances it); a withheld body = a failed field AND a vacancy the scarecrows fill themselves. | Funerals here end at the church door; no local will walk a field's edge-row at first light, and the frames outnumber any harvest's need. | `deal:founding` `payer:the-dead` `site:the-fields` `clock:per-use` |
| 11 | The lake gives the town its dead back — dry, smiling, and load-bearing. Half the shops on Main Street are staffed by people who drowned. The deal: the town holds a Regatta every summer, and the lake keeps whoever wins. | Seasonal-annual (the Regatta); skipping it means the returned dead all walk back into the water — along with everyone they've touched that year. | The town is desperate for you to enter the Regatta — sign-up is free, the prize is absurd, and no local has entered in living memory. | `deal:exchange` `payer:the-champion` `site:the-lake` `clock:anniversary` |
| 12 | The telephone exchange still connects calls to the dead — three minutes, once per grief. The operator's family has run it for four generations. The charge isn't money: every call shortens someone's line in town by a day, and the operator chooses whose. | Per-use + a generational reckoning when the accumulated days total a full life. | Everyone in town has "made their call" and no one will admit it; the operator's family is untouchable — invited to every wedding, feared at every funeral. | `deal:service` `payer:diffuse-days` `site:the-exchange` `clock:per-use` |
| 13 | The town sleeps soundly because the thing in the boarding-house eats nightmares — and it has grown too large for nightmares alone. The deal renegotiated itself a decade ago; now, once a season, someone must sleep a night in Room 9 and dream for it directly. What walks out has stopped dreaming forever. | Seasonal. | Nobody in this town has bad dreams — say the word "nightmare" and watch the room go still; the boarding-house keeps Room 9 "under repair" on a permanent basis. | `deal:renegotiated` `payer:a-dreamer` `site:room-9` `clock:seasonal` |
| 14 | The orchard's fruit heals — a bite closes wounds, a preserve breaks a fever. The town's health is the envy of the county. Every tree was planted over a person, planted living, and the orchard signals when it wants another sapling started. | Generational-short (~7 yr), signalled by a blossom out of season. | The town cannery runs year-round but its labels name no orchard; the healthiest town in the county has the *largest* graveyard, and the graveyard is full of empty plots pre-purchased in strangers' names. | `deal:founding` `payer:the-planted` `site:the-orchard` `clock:generational-short` |
| 15 | The fire of '31 never went out. It lives banked in the furnace under the school, and while it's fed the town is fireproof — no house here has burned in ninety years. It is fed with what people love most: heirlooms, letters, instruments. Lately, objects have stopped being enough. | Seasonal feeding, escalating (the effect-pool ladder: objects → animals → the unthinkable rung the town is currently pretending isn't next). | There are no antiques in this town — no heirlooms, no old photos, no grandmother's ring — and every insurance policy in the county office lists fire coverage at a rate that makes the assessor laugh. | `deal:containment` `payer:what-you-love` `site:under-the-school` `clock:seasonal` |
| 16 | The founders drowned a preacher, and his congregation — the *real* first town — sleeps under the reservoir. The water tower version of the story is a lie. As long as the anniversary is kept with a full-town festival (games, lights, noise), the sleepers don't surface. The festival is the town's whole civic identity, and nobody remembers why it can't be missed. | Anniversary (the festival); each ill-kept festival lets one sleeper up. | The festival budget is sacrosanct — the town will fund it before the school; the reservoir has no swimming, no fishing, and no posted reason. | `deal:atonement` `payer:the-festival-itself` `site:the-reservoir` `clock:anniversary` |
| 17 | The barber's chair takes years off. Sit in it, and you leave younger — the barber banks the difference. The town's leading citizens have been its leading citizens for a very long time, and the barber's book of appointments is the town's true power structure. The years have to come from somewhere: the town's young people age strangely fast. | Per-use; a generational collapse tick when the ledger of banked years crosses a threshold. | The town's elders are suspiciously spry and its teenagers look tired in a way no one discusses; the barbershop takes appointment-only clients after dark. | `deal:vanity` `payer:the-young` `site:the-barbershop` `clock:per-use` |
| 18 | Something wears people home. It takes a townsperson for a while — days, weeks — walks in their skin, lives their life, and returns them with no memory and a gift: the mortgage paid, the diagnosis reversed. The town treats an "absence" as a windfall and has developed etiquette for not mentioning what your neighbor was like last month. | Seasonal (one wearing per season); refusing it a host = it keeps the current one. | The town's small talk is a minefield of never referencing anything anyone said or did more than a month ago; the pastor's sermons return, again and again, to forgiveness for "things done in absence." | `deal:tenancy` `payer:a-borrowed-life` `site:anyone's-skin` `clock:seasonal` |
| 19 | The mirror-house — the show home from the development that was never finished — holds the town's other selves. Deal: what happens in the mirror-house doesn't happen in town. Grief, violence, ruin — the town sends its worst moments there to happen to the reflections instead. The reflections have had enough. | Anniversary of the development's failure; each tick, one reflection swaps out and its original wakes up inside. **Dark-timeline bleed row** (§1.5) — the mirror-house interior is the detritus-town. | One street of the development is maintained — mowed, painted — though no one lives there and no one is ever seen doing the maintenance. | `deal:displacement` `payer:the-other-you` `site:the-show-home` `clock:anniversary` `bleed:dark-timeline` |
| 20 | **The compound secret:** the town has TWO deals, and they know about each other. The old one (roll again, 1–19, for what it is) kept the town alive; the new one was cut by the current generation to *pay off* the old one — and its interest is worse. The town's factions are, secretly, the two deals' respective service-priesthoods, and the player's arrival reads to both as either the final payment or the way out. | Both clocks run; they tick each other (a payment to one advances the other). | The town has two of everything — two churches, two diners, two hardware stores — and every citizen patronizes exactly one set, never mixing, with the fervor of the unconfessed. | `deal:compound` `payer:contested` `site:two-addresses` `clock:coupled` |

**Table conventions (for the craft-lane graduation):** Commitment-class, `remembers: codex` (the
secret mints codex entries: the site as Location, the payer-pattern as a Faction-shaped fact, the
tell as an NPC-digest hook). Row contract: secret · schedule · tell · tags, tags in-format per the
craft-pass-2 standard; run `dev/table-review.py` at graduation.

## 3. THE FEEDING-SCHEDULE CLOCK (mechanized)

**Thesis:** the schedule is the anti-drift core. The DM must never improvise *when* the monster
is due — **the script owns the number**; the DM owns what the due-date feels like.

- **Mint:** rolling the town secret at town mint creates `w.townSecrets[townId] =
  { rowIdx, clockKind, due, tick, fed, revealed: [] }` — a script-owned clock keyed to the
  existing day-clock (`clockOf(w).day`, `src/world/play.js` / `world.state`). `clockKind` comes
  from the row's `clock:` tag; the mint sets `due` accordingly:
  - `generational` — due in `d20+20` days at mint (the player arrives *near* the due season —
    Derry rule: you always arrive in the summer IT wakes; a 27-year clock with 26 quiet years is
    a table row that never plays).
  - `generational-short` / `seasonal` — due in `2d12` days; re-arms each payment.
  - `lunar` — every 28 days from a mint-rolled phase offset.
  - `anniversary` — a mint-rolled calendar day, `d30` days out.
  - `per-use` — no timer; advances on the triggering event (a burial, a call, a chair-sitting)
    plus a slow background drip (1 tick per `2d6` days — the deal collects even if the town
    abstains, which is *why* the town doesn't abstain).
  - `coupled` (row 20) — two clocks; feeding either adds `+d4` ticks to the other.
- **Advancing:** `passTime` integration only — the same seam the rest-gate uses. No new time
  machinery; the clock is read at every `passTime` and at session-begin (`play.js` already
  stamps day/time there).
- **What the player can learn (three-stage reveal, script-gated):**
  1. **The tell** (free, ambient) — the row's tell column seeds NPC digests from first contact
     (§5 U3). The town behaves wrong before anyone says why.
  2. **The schedule** (earned) — investigation/social successes against complicit NPCs or the
     site reveal `clockKind` + the approximate due date ("it happens every generation… and the
     kids have started seeing things"). Margin-based graded outcomes apply.
  3. **The terms** (deep) — the deal's actual text/history: what was traded, what would void it.
     Codex-recorded once revealed (write-once canon).
- **At each tick** (script emits, DM interprets):
  - `T-minus` warnings (due within 5 days): the engine raises pressure — the tell escalates in
    digests, the site's dungeon weighting activates (home-as-dungeon inversion §1.3).
  - `DUE`: the payment event fires as a Consequence-Ladder demand — **demand-not-supply**: the
    engine states *that payment is owed and the collection has begun*; the DM narrates the form
    using the row. If the player is entangled, it's a scene; if not, it's a town-changing offscreen
    fact (someone is taken — a named codex NPC where possible, so it costs something).
  - `MISSED/DEFIED` (player intervened, payment blocked): the deal escalates one rung on the
    row's implicit ladder (Hungering-Stone effect-pool standard — pre-authored escalation, not
    DM invention). Chain terminates per the Diversion Rule: handle / closed event / bind — a
    defied deal binds to the town's faction clocks, it does not fractal.
  - `SETTLED` (terms voided/paid off through play): the clock is destroyed, the town's prosperity
    prop is destroyed with it — the engine flips the town's economy/stock tier down one. The deal
    was *load-bearing*; killing it must cost the town visibly, or the throughline was a lie.
- **DM boundary:** the DM never invents a tick, never moves `due`, never decides the number of
  days. The DM may *spend* a tick early only via the standing event contract (a dmTriage event
  the fold validates), which is auditable in the ledger.

## 4. GLOOM ITEMS DIRECTION (for the later item-table pass — direction only, not the table)

The existing `Realm Items - Gloom.md` d50 (parish-gothic register) stays; the town-deal pass
**adds a strand, not a rewrite**. The signature mechanic Adam pointed at:

**BELIEF-WEAPONS — the inhaler they took IT out with.** Mundane kid-objects that harm the town's
monster *because the wielder believes they do*. The inhaler is battery acid if you believe it's
battery acid. Design law: the object is genuinely mundane (Grounded-band frame, no ranks in the
open); its power is **conditional and scripted**, never a DM mercy.

**Mechanization (doer whose damage scales with something the script owns):**
- A belief-weapon carries a `belief` block instead of ranks: `{ vs: "town-monster", die: d4,
  conviction: 0 }`. It is a doer — wired physics only, per ADAM-REVIEW-2 §3.
- **Conviction is the script-owned scaler** (the anti-drift move — belief is not a vibe the DM
  reads, it's a counter the engine keeps). Conviction increments on auditable events: witnessing
  the monster and surviving (+1), a revealed secret-stage (§3 reveal 2/3: +1 each), a
  **kid-partial present in the scene** (+1 while true — children believe harder, and gloom's
  monster obeys the believers' rules; hooks the partials spec's kid tables), a prior wound dealt
  BY a belief-weapon (+1, self-reinforcing: it worked, so it's true). Conviction caps at 4.
- Damage = `conviction × d4` **against the town's monster only**; against everything else it's
  the mundane object (0 or 1 improvised). A belief-weapon in an unbelieving adult's hand
  (conviction 0) does nothing — which is the horror text: the adults *can't* fight it.
- Attunement-by-conviction: at conviction 3+, the item counts attuned to its wielder — losing it
  mid-arc is a real cost (Item-Legacy hooks apply).

**Sketch — 6 belief-weapon concepts (craft-lane rows later):**
1. **The inhaler** — two puffs left. Sprayed at the monster: conviction×d4 acid; the monster
   recoils as from a caustic. (The canonical one; keep it nearly verbatim.)
2. **The slingshot with the silver earring** — the earring was Grandma's, melted down in a vise
   in Dad's garage. Counts as silvered vs the monster; a nat-20 with it at conviction 4 forces
   the monster's retreat-rung.
3. **The library card** — held up like a badge: the monster cannot lie to the bearer for one
   answer per scene (kids know libraries are where true things live).
4. **The birthday-candle stub** — lit, it cannot be extinguished by the monster or its weather;
   the monster cannot approach within the candle's light while the bearer sings. One relight per
   day. (Belief-weapon utility class, not damage.)
5. **The team jersey, signed** — worn: conviction also scales AC vs the monster's fear-shaped
   attacks (+1 per 2 conviction). You are on a team; it hunts the alone.
6. **The chalk** — a drawn door on any wall opens for one round at conviction 4, exiting anywhere
   the bearer has genuinely felt safe. Once per secret-arc. (The escape-hatch class — expensive,
   singular, kid-logic.)

**Silver the bike callback:** suburb's item table keeps THE BIKE lineage (bicycle-bell row 30 —
"neighborhood kids recognize the ring… and answer it"). Gloom's version is **the bike that
outruns the thing that keeps regular hours**: a Textured doer — while ridden flat-out by a
believer, the town's monster cannot close the last 10 ft; chase-resolvable flag auto-favors the
rider one band vs the town-monster only. Same frame as suburb's bike rows → the asset-reuse
principle (§1.4) extends to items: shared object, re-graded meaning.

## 5. ENGINE BUILD UNITS (numbered, Sonnet-executable; red-first tests per unit)

Pipeline per the spec-rubric doctrine: red test first, unit-gated, orchestrator re-gates.

- **U1 — Town-secret mint.** Compile the graduated d20 into the table pipeline
  (Engine markdown → `compile-tables.py`); wire a `rollTownSecret(w, townId)` in the codex-roll
  family that fires once at gloom-town mint, writes `w.townSecrets[townId]`, and mints the codex
  handles (site Location, tell hook). *Acceptance:* minting a gloom town populates
  `w.townSecrets` with a valid rowIdx + due date; minting twice does NOT reroll (write-once);
  non-gloom towns mint nothing. *Red-first:* jsdom test asserting `w.townSecrets[townId]`
  undefined pre-wire → defined + stable post-wire.
- **U2 — Feeding-schedule clock.** Implement the §3 clock kinds + tick emission inside the
  `passTime` seam; ledger entries for T-minus/DUE/MISSED/SETTLED; DM event `secret_tick_spend`
  registered in `DM_EVENT_FIELDS` (fold-normalized, never handler-coerced). *Acceptance:*
  advancing the day clock across `due` emits exactly one DUE ledger entry; MISSED escalates the
  rung counter; SETTLED destroys the clock and downgrades the town's stock tier. *Red-first:*
  clock-advance test across each of the 6 clockKinds, including the coupled row-20 cross-tick.
- **U3 — Complicity tells in NPC digests.** The active town secret's tell column joins the
  relevance-scoped digest for NPCs of that town (the digest already carries codex hooks);
  escalated form inside the T-minus window. *Acceptance:* a digest built in a gloom town with a
  minted secret contains the tell string; the same NPC in a non-gloom town does not; T-minus
  digests contain the escalated variant. *Red-first:* digest-content assertions both sides.
- **U4 — Home-as-dungeon weighting.** In gloom towns with a minted secret, interior/domestic
  structures weight up in dungeon-site selection and the secret's `site:` tag pins the
  deal-address as a rollable dungeon; wilderness segments weight down in threat. *Acceptance:*
  distribution test over N site rolls shows the inversion; the site address always exists as a
  codex Location. *Red-first:* statistical weighting test (seeded RNG).
- **U5 — Suburb-asset regrade reuse.** Theater layer: gloom towns resolve their prop/surface set
  through the suburb registry entries wherever gloom lacks a bespoke, with the gloom render
  profile applied via the existing `gradeColor`/`realmRenderProfile` seam. *Acceptance:* a gloom
  scene renders suburb props under gloom's grade with zero cuboid fallbacks; `modelPathReport`
  shows the reuse path; no suburb scene regression (byte-identical default-profile law holds).
  *Red-first:* verify-theater-figures extension asserting the fallback chain
  gloom-bespoke → suburb-asset → generic.
- **U6 — Belief-weapon doer class.** `belief` block on item instances; conviction counter in
  `GS`-adjacent world state (persistent per PC per secret-arc, so `U`-side); the auditable
  increment events; damage scaling vs the town-monster tag only. *Acceptance:* conviction 0 deals
  mundane damage, conviction 4 deals 4d4 vs the monster and mundane vs anything else; kid-partial
  presence toggles the +1 live. *Red-first:* combat-engine test with a tagged town-monster
  bestiary entry.
- **U7 — Dark-timeline bleed hook** (small): row 19 / cross-realm bleed registers the
  detritus-town as a breach flavor consuming the same town's node graph re-graded. Deferred-ok;
  spec'd here so the bleed tag isn't orphaned.

Ordering: U1 → U2 → U3/U4/U5 (parallel) → U6; U7 floats. Every unit: `check-manifest.py` green,
regenerated artifacts only at master merge.

## 6. Adam's rulings needed

1. **d20 vs d12** for the town-secret table — d20 drafted; cutting to d12 means choosing 8 rows
   to park (candidates: 12, 17 overlap the "per-use ledger" shape; 11/16 overlap "anniversary
   festival/water").
2. **Can one town hold two secrets?** Drafted answer: only via row 20 (the compound row) — twin
   secrets by roll collision are re-rolled. Confirm or open it up.
3. **How graphic does the payment get?** Standing law applied: graphic death is a feature; kids
   can die, **never graphically depicted** (row 1's takings happen at the Diversion-Rule
   distance — aftermath and absence, never the scene). Confirm this reading for DUE events that
   catch the player *present at* a child-payment.
4. **Arrival timing** — the "Derry rule" (§3 mint: player always arrives near the due window).
   Alternative: honest random timing with mostly-quiet towns. Drafted: Derry rule.
5. **SETTLED cost** — one stock-tier downgrade drafted as the prosperity cost of killing the
   deal. Too soft? (An option: also convert one town faction hostile — the deal's beneficiaries.)
6. **Conviction cap 4 / d4 die** for belief-weapons — numbers are placeholders pending a combat
   pass against the town-monster CR band.
