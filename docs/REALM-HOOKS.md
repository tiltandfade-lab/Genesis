---
type: system-spec
project: Genesis
status: SPEC — drafted by Fable 2026-07-09 per Adam's 2026-07-08 ruling, awaiting review
created: 2026-07-09
origin: Adam's 2026-07-08 ruling — "the volcanic-doom clock is a thing that can happen through play… realm-specific hooks are now a thing"
related:
  - "[[NPC-ROLE-REALMS]]"
  - "[[NPC-PRESENCE-AND-HOOKS]]"
  - "[[REALM-ROLE-EDGES]]"
  - "[[SPICE-CURVE]]"
  - "docs/BREACH.md"
---

# REALM-HOOKS — the realm's own weather (spine · skins · authored extras)

**Adam's ruling (2026-07-08, near-verbatim):** "The volcanic-doom clock is a thing that can happen
through play, so it needs to be in some realm-specific hooks — but it's not going to just kill you
for hanging out with cave people and riding dinosaurs. I just created realm-specific hooks with that
thought, but we knew it was bound to happen. We can do it the same way we've done other stuff: the
spine, then the extras per realm. Reskinning will go far, but we do need at least a portion more
accurately authored."

This is the **third system on the spine/skins architecture**, after [[NPC-ROLE-REALMS]] (approach C,
proven) and the in-flight PLACE-GEN place spine. The pattern: **one universal spine table + per-realm
skins (relabel / drop / add / reweight) + a minority of REALM-AUTHORED rows** per realm that
reskinning can't reach.

> **Register note:** this spec keys to the realm registers **as re-keyed 2026-07-08** (chrome =
> Warriors/TMNT/Robocop neon-slum · cosmic = Egyptian/Hermetic/Enochian · gloom = the-town-that-made-
> a-deal / Derry · lost-world = saurian-court, three strata, with the volcanic clock · bright-kingdom
> = Nintendo-80s). That re-key is landing from the parallel session; where this worktree's
> `data/realms.js` still shows the older register lines, **tonight's re-keyed registers win.**

---

## 1. What a realm hook IS (vs. the d300 NPC hook)

The two systems must not blur, so the boundary is a definition, not a vibe:

| | **NPC hook** (`npc-hook` d300) | **Realm hook** (this spec) |
|---|---|---|
| **Source of pressure** | a *person's* want/secret/debt — anchors on the rolled NPC ("The NPC…") | the **realm's key itself** — a pressure, clock, or opportunity arising from what the realm *is* |
| **Referent** | an NPC record | a **place-thing / condition / clock** (a mountain, a feeding schedule, a turf line, a loose name, a torn chart) |
| **Discovery surface** | interaction with people (Component 3 of [[NPC-PRESENCE-AND-HOOKS]]) | scenes, walks, discoveries, region temperature — the *environment* volunteers it |
| **Who carries it in play** | the NPC (their voice, their If-Ignored) | NPCs may *point at* it, but killing the pointer doesn't kill the hook — the weather persists |
| **Codex home** | the NPC record's thread | a Location/Item/Faction/clock record (codex = handles, per Consequence-Ladder) |

**The test:** if the hook survives the death of every NPC who mentioned it, it's a realm hook. "The
saloon-keeper owes the collector" is an NPC hook. "The mountain has started smoking and the saurian
court's three strata each read it differently" is a realm hook — the mountain doesn't care who
delivers the news.

**Realm hooks are the realm's own weather.** A Gloom town *generates* feeding-schedule tells the way
a coast generates storms. This is the anti-quantum-ogre principle applied to the setting itself: the
realm's pressures exist and tick whether or not the player is looking — but (Adam's constraint, §4)
they surface as **hooks you can catch wind of, never as ambient background radiation that kills you
for being there.**

Row-contract: realm-hook rows keep the proven `npc-hook` column grammar — **Hook · Pressure/Clock ·
If Ignored · Tags** — because the three-tier attention model and the if-ignored unification
([[NPC-PRESENCE-AND-HOOKS]] Component 4) consume that shape unchanged. One grammar, two tables.

## 2. The hook spine — universal SHAPES

The spine (`realm-hook-spine`, AUTHORED) is a table of hook **shapes** — realm-agnostic pressure
patterns. Each row: shape key, the shape's universal logic (what kind of pressure, what the clock
looks like, what ignoring it does *structurally*), a default Weight, and Tags.

**Size: 24 shapes.** Rationale: the npc-role spine settled at 35 because human occupations are
genuinely that varied; pressure-shapes compress harder — most realm weather is a clock, a shift, an
arrival, or a leak wearing local clothes. Below ~20 the skins get repetitive ("another ticking
clock"); above ~30 the shapes stop being distinct (a "second debt-come-due" is just reweighting).
24 gives every realm room to drop 3–5 inapplicable shapes and still field a real table. The craft
pass may land 22–28; **24 is the target, not a validator-satisfying quota** (the disciplines rule:
the table's job is distinct shapes, not a row count).

The working slate (craft pass finalizes wording; keys are stable):

| # | Shape key | Universal logic |
|---|---|---|
| 1 | the-clock-that-ticks | A countdown native to the realm has started; visible tells escalate on a schedule; engaging early is cheap, late is dire. |
| 2 | the-debt-come-due | The realm's standing bargain (whatever the place traded away) presents its bill — to the region, not to one person. |
| 3 | territory-shifting | A boundary everyone navigates by (turf, hunting ground, jurisdiction, current) is moving; the old map lies. |
| 4 | something-is-loose | A thing the realm keeps contained isn't contained anymore; the containment method is common knowledge, the location isn't. |
| 5 | the-forbidden-opportunity | A window opens onto something the realm's rules forbid — real reward, and the rules exist for a reason. |
| 6 | an-arrival | Something new enters the realm's ecology (a ship, a signal, a herd, a power) and every faction re-prices at once. |
| 7 | a-vanishing | Something load-bearing is gone (a person-class, a resource, a sound, a law's enforcement) and the absence is the pressure. |
| 8 | the-rules-changed | The realm's operating rule — the thing "a child could recite" — quietly changed; the first to notice profits, the last pays. |
| 9 | the-supply-line-frays | Whatever the realm runs on (water, power, faith, ammunition, sugar) is thinning; rationing politics precede the shortage. |
| 10 | the-old-thing-wakes | Dormant infrastructure/entity/custom native to the realm resumes operation on its original terms, which predate everyone here. |
| 11 | a-signal-nobody-claims | A message/beacon/omen in the realm's own medium repeats; answering it and tracing it are different quests. |
| 12 | the-toll-increases | Passage that used to cost X now costs X+; whoever raised it is testing what the region will bear. |
| 13 | a-truce-is-ending | A standing peace between realm-native powers is visibly fraying; both sides are recruiting deniable outsiders. |
| 14 | the-ground-remembers | The realm's past resurfaces physically (exposed by storm, dig, drought) and rewrites a living claim. |
| 15 | a-false-normal | Something is maintaining the appearance that nothing is wrong; the maintenance itself is the discoverable seam. |
| 16 | the-migration | Something realm-native moves through on its season — dangerous to obstruct, profitable to ride, telling if it's early. |
| 17 | a-market-inverts | The realm's value system flips (worthless→precious or inverse); early knowers are buying quietly. |
| 18 | the-quarantine | Part of the realm gets sealed off — by authority, instinct, or agreement — and the seal's *reason* is the hook. |
| 19 | an-heir-question | Succession to a realm-native seat of power is open; the realm's own selection rule is strange, and someone's gaming it. |
| 20 | the-experiment | Someone is testing something on/in the region at scale; results are showing before the test is announced. |
| 21 | a-pilgrimage-forms | People start converging on a point for a reason that spreads person-to-person; the destination may not know it's one. |
| 22 | the-keeper-falters | The one who maintains a realm-critical function (lighthouse, seal, schedule, ritual) is failing at it, and hiding that. |
| 23 | a-boundary-thins | The realm's edge (to the wild, the deep, the dark, another realm's leak) is more permeable than last season — traffic runs both ways. |
| 24 | the-celebration | A realm-native festival/rite/game approaches that suspends normal rules for a day — cover, opportunity, and obligation at once. |

The engine **weighted-picks** a shape, exactly as `roleForRealm` picks an archetype. Shapes carry no
realm flavor; flavor is entirely the skin's job.

## 3. Per-realm skins — approach-C conventions

One skin per realm (`realm-hook-skin-<realm>`), same overlay grammar as [[NPC-ROLE-REALMS]]:

1. **Relabel** — each kept shape gets a realm-keyed hook seed: a one-to-two-line realm rendering of
   the shape (Hook + Pressure/Clock + If-Ignored sketches the DM elaborates from, not full prose).
2. **Drop** — shapes the realm can't host (no label → weight 0). E.g. bright-kingdom drops
   the-quarantine's dread form; noir drops the-migration.
3. **Add** — realm-unique hook shapes that exist nowhere else (rare; most realm-uniqueness belongs
   in §4's authored rows instead — an ADD is only for a *recurring shape* the realm mints).
4. **Reweight** — match the realm's metabolism: gloom runs hot on false-normal/debt-come-due;
   high-seas on territory-shifting/an-arrival; chrome on the-supply-line-frays/the-toll-increases.

Skin direction per tonight's registers (one line each; the craft pass authors the full skins):

| Realm | Skin lean (relabel through this lens) | Signature reweights |
|---|---|---|
| frontier | line-nobody-enforces: water rights, rail survey, range war | territory-shifting ↑, truce-ending ↑ |
| chrome | Warriors/TMNT/Robocop neon-slum: gangs, precincts, the corp above | territory-shifting ↑↑, toll-increases ↑, supply-frays ↑ |
| noir | everyone owes somebody: cases, syndicates, the honest cop | debt-come-due ↑, false-normal ↑ |
| ash | the world already ended once: caches, convoys, the last working thing | supply-frays ↑↑, ground-remembers ↑ |
| suburb | wrongness on regular hours: HOA rules, curfew, the schedule | false-normal ↑↑, rules-changed ↑ |
| cosmic | Egyptian/Hermetic/Enochian: names, seals, correspondences | something-is-loose ↑, old-thing-wakes ↑, signal ↑ |
| theater | war-shapes, era-lensed; content-safety per BREACH §2d | truce-ending ↑, supply-frays ↑, quarantine ↑ |
| high-seas | salt, debt-to-the-crew, the horizon's counsel | arrival ↑, migration ↑, keeper-falters ↑ |
| lost-world | saurian-court three strata under the mountain | clock-that-ticks ↑, heir-question ↑, migration ↑ |
| gloom | the town that made a deal (Derry) | debt-come-due ↑↑, false-normal ↑, celebration ↑ |
| bright-kingdom | Nintendo-80s: rules a child could recite, teeth underneath | rules-changed ↑↑, celebration ↑, market-inverts ↑ |

`realm-neutral` gets **no skin** (matching the J2 closure — no neutral realm table); a realm-less
context simply doesn't roll realm hooks.

## 4. The AUTHORED portion — what reskinning can't reach

**Adam's explicit ask.** Each realm gets **6–10 fully-authored realm hooks** — complete rows (Hook ·
Pressure/Clock · If Ignored · Tags, full `npc-hook`-grade prose) that are not spine instances but the
realm's own inventions. 6–10 because: the role-edges settled at ~10 adds/realm and that read as "a
living cast"; hooks are heavier per row (each is a whole situation), and a realm whose *every*
pressure is bespoke stops feeling like the spine's shared reality. The authored rows are the
**signature dishes**; the skin is the menu.

**The lethality law (Adam's ruling, binding):** an authored realm clock is a **hook you can catch
wind of, not background radiation.** The volcanic clock can surface through play, tick visibly, and
be lethal *when engaged or ignored at the wrong time* — but it never ambient-kills a player for
"hanging out with cave people and riding dinosaurs." Concretely: **no authored hook may deal damage
or end a world-state before it has surfaced as a discoverable hook AND shown at least one escalating
tell.** The three-tier attention model already enforces the never-touched tier (nothing fires, ever)
— realm clocks ride the same tiers, with one carve-out: a **surfaced-but-untouched realm clock may
still tick diegetically** (the mountain smokes harder) because the realm's weather is world-truth,
but its *consequence* lands per the attention tier — engaged = tracked ratchet; touched-and-dropped
= one offscreen beat then the clock resolves offscreen (the eruption happens; the player hears what
became of the court); never-surfaced = the DM never detonates it on-screen at all.

Canonical registered examples (from tonight's ruling): lost-world's **mountain-is-about-to-open**
clock · gloom's **feeding-schedule tells** · chrome's **turf war turning** · cosmic's
**a-true-name-is-loose** · bright-kingdom's **the-rules-of-the-game-changed** · high-seas' **the
chart's torn corner**.

### Worked examples — 3 authored rows each (DRAFT FOR ADAM'S REVIEW; craft pass completes to 6–10)

**Lost World** (saurian-court, three strata, the volcanic clock):

| Band | Hook | Pressure/Clock | If Ignored | Tags |
|---|---|---|---|---|
| Volatile | The mountain has begun to breathe on a schedule — the lowest stratum's egg-wardens moved the clutches uphill a week ago and told no one above them why. | Three tells, in order: the hot springs run white; the great herds cross the valley OUT of season; the court's oldest matriarch stops eating. Each tell is a discoverable scene; the last one means single-digit days. | The mountain opens. Whichever strata heeded the wardens survive on the high shelf; the court that ignored its own lowest caste is remade under whoever led the climb — and remembers who else knew. | clock, omen, caste |
| Textured | The middle stratum has quietly stopped teaching the high court's tongue to its hatchlings — a generation-long secession, three years in, just now showing. | The high court's next census-of-tongues is one season out; the count will reveal the gap and the law prescribes fosterage — taking the hatchlings uphill. | The census lands, the fosterage is ordered, and the middle stratum chooses that hill to die on. What was a quiet secession becomes the court's first open schism in living memory. | caste, secret, kin |
| Strange | Something has been answering the court's dawn-call from inside the mountain — one beat late, in a voice like the call but older, and the priests have started calling *later* to avoid hearing it. | The echo is getting earlier. When it precedes the dawn-call, the priesthood's authority — timekeepers of the whole court — inverts overnight. | The echo calls first. Half the court answers IT. The priests declare the mountain's voice heresy the same week the springs run white — and nobody credible is left to read the real tells. | omen, faith, clock |

**Gloom** (the town that made a deal — **seam with GLOOM-KEY:** the sibling GLOOM-KEY draft owns the
*town-secret itself* — what the deal was, who keeps it — and the feeding clock's core mechanism.
Gloom's realm-hooks must NOT restate either; they author the **periphery**: pressures the deal's
existence radiates that don't reveal or depend on its content. GLOOM-KEY is the sun; these are the
weather it makes. Deconfliction is an acceptance check, §6 U2):

| Band | Hook | Pressure/Clock | If Ignored | Tags |
|---|---|---|---|---|
| Textured | The town's insurance ledger is a generation of round numbers: every ruinous fire, drowning, and collapse paid out fast, quiet, and exactly — as if priced in advance. The new assessor from out of town has started asking for the actuarial tables that produce numbers like that. | The assessor's report is due to the regional office in twelve days; three separate town elders have independently offered to buy her dinner. | The report is never filed. The assessor stays — buys a house, in fact, at a remarkable price — and the next out-of-towner who asks about the ledger gets *her* name as the person to talk to. | trade, false-normal, witness |
| Strange | Children's chalk games here have rules nobody teaches — hopscotch grids that always skip the same square, a counting rhyme that stops at a number the children won't say. A folklorist has begun writing the rules down. | The rhyme has started counting one number higher this season. The children know it, hate it, and can't stop. The folklorist's notebook is half full. | The notebook fills. The folklorist reads the completed rhyme aloud at the county fair — and every child in earshot goes silent at once, then starts a new game nobody has seen before. | child, rite, omen |
| Volatile | The town's four founding families are suddenly, quietly liquidating — land parcels sold to out-of-county buyers, heirlooms auctioned, one granddaughter enrolled at a boarding school two states away. They are not talking to each other, but they all started the same week. | Whatever calendar the families keep says something is due. The last parcels close at month's end; after that, every name that could answer questions has a forwarding address. | The families finish leaving. The town they administered keeps running on habit for one season — and then the bills their names were quietly paying start arriving addressed to OCCUPANT. | exodus, debt-come-due, secret |

**Chrome** (Warriors/TMNT/Robocop neon-slum — the turf-war-turning key):

| Band | Hook | Pressure/Clock | If Ignored | Tags |
|---|---|---|---|---|
| Textured | The Glass Dragons' tags stopped at Meridian Street for six years. This week they're two blocks past it, painted slow and neat — not a raid, a survey. The gang that holds those blocks hasn't answered, which is itself an answer everyone's reading. | The neighborhood pays protection to the silent gang; next collection day either their runners come (war) or the Dragons' do (the map is redrawn). Nine days. | Collection day: Dragons' runners, new rates, and a bonus — every debt owed to the old gang is bought paper, now collectable at Dragon terms. Three businesses fold in a month; the precinct's response is a new vending contract. | turf, gang, trade |
| Strange | The precinct's enforcement drones have started ticketing crimes *before* they finish happening — a shoplifter cited mid-reach, a brawl fined at the first shove. The precinct denies pushing an update. The drones' new judgment is coming from somewhere. | The write-ups escalate one category per week: petty theft, then assault, then — per the leaked docket — "conspiracy," which the drones apparently now believe they can see forming. | Conspiracy week arrives. The first pre-emptive arrest is a union steward on her way to a permit hearing — and the neighborhood learns the update's training data was the precinct captain's private enemies list. | authority, machine, justice |
| Volatile | Every gang in the district got the same invitation, same night, no sender: a truce summit, neutral ground, the old ballroom above the transit hub. Half think it's a setup. All of them are going anyway, because whoever called it knew things about each of them that made refusal impossible. | The summit is in five days. Every crew is quietly arming while publicly de-escalating; the neutral ground's owner has tripled his insurance; the precinct has scheduled a district-wide "maintenance blackout" for that night. | The summit happens without independent witnesses. Whatever was agreed in the dark, the next morning every tag in the district is painted over in one color nobody has seen before — and the tolls all changed at once. | gang, truce, summit |

## 5. Routing — how realm hooks enter play

Realm hooks ride the **existing seams**; this spec adds no new discovery machinery:

1. **Presence/discovery layer** ([[NPC-PRESENCE-AND-HOOKS]] Components 3–4): the discovery roll,
   on success, currently draws a d300 `npc-hook`. It becomes a **split draw**: a share of successes
   draw from the realm-hook deck instead — an NPC *pointing at the weather* ("you heard about the
   springs?") rather than carrying their own trouble. Split ≈ **75/25 npc/realm** (NPC hooks stay
   "the bread and butter" — Adam; realm hooks are seasoning) — tune in playtest.
2. **Walk events**: walk minting gains a realm-hook seed slot — the walk *itself* shows a tell (the
   tags stop at Meridian; the herds cross out of season). Cheapest surface, because a tell needs no
   NPC. **Engaged realm hooks feed HOOK-WALKS** where the referent is a place-thing: engaging mints
   a reward-terminated walk to the referent through the same seam engaged NPC hooks use (the sibling
   HOOK-WALKS draft owns that contract; this spec just declares realm hooks a legal input to it).
3. **Place-gen hook seeds**: the in-flight PLACE-GEN place spine reserves a hook-seed field per
   significant place; a realm-hook draw is a legal filler (the place *is* the referent — the
   ballroom above the transit hub mints holding its summit).
4. **Region temperature**: the same temperature read that drives ambient counts and discovery gates
   realm-hook density. **Spice-band gating (the standing depth-over-breadth rule): realm hooks earn
   their keep at Strange+.** A Grounded world is NOT wall-to-wall realm weather — at Grounded the
   realm-hook share of the split draw drops to ~0 (the realm expresses through skins/roles/props,
   not through active hooks); Textured admits the low-band authored rows sparingly; Strange+ opens
   the full deck; Volatile+ is where the big authored clocks (the mountain, the summit) live —
   matching the band calibration (Volatile = active force, Mythic = changes the world forever).
5. **Attention + if-ignored**: identical routing to NPC hooks (Component 4), with the §4 carve-out
   that a surfaced clock's *tells* keep ticking diegetically while its consequence honors the tier.
   Realm-hook threads live on their referent's codex record (Location/Faction/clock), not on an NPC.

**Dedup law:** one active realm hook per shape-key per region (a region can't hold two
territory-shiftings); authored rows are one-per-world unless the row says otherwise. Immutable once
revealed, per ON-DEMAND-GEN.

## 6. Build units (Sonnet-executable, dependency order)

Red-first discipline: each unit's test is written and failing before the build.

- **U1 — Spine table (craft).** Author `Engine/03. _Tables/05. Realms/Realm Hook Spine.md`: 24
  shapes per §2 (key · universal logic · Weight · Tags), frontmatter matching the skin-overlay
  convention (NOT a roll table; `compile-tables.py` skips it, like the role spine).
  *Accept:* 22–28 distinct shapes; every shape realm-agnostic (grep: no realm id or register word in
  any logic line); `dev/table-review.py` clean. *Red test:* review script fails on a seeded
  realm-flavored shape line before authoring, passes after.
- **U2 — Three reference skins + worked authored rows (craft).** `Realm Hook Skin - Lost World.md`,
  `- Gloom.md`, `- Chrome.md`: full relabel/drop/reweight maps + the §4 worked rows completed to
  6–10 authored rows each, npc-hook row-contract columns.
  *Accept:* every non-dropped shape has a realm seed; authored rows pass the lethality law (each
  names its surfacing tell(s) — no row's If-Ignored kills/ends anything that never surfaced);
  **gloom rows cite zero GLOOM-KEY content** (no deal-content, no feeding-clock mechanism —
  checklist against the GLOOM-KEY draft at review). *Red test:* a seeded row with an
  ambient-lethal If-Ignored fails the lethality lint before the rule is applied to real rows.
- **U3 — Remaining 8 skins (craft fan-out, one executor per realm).** Same format; authored rows
  must include the registered signatures (§4 canonical list: cosmic's true-name, bright-kingdom's
  rules-changed, high-seas' torn corner, etc.).
  *Accept:* per-skin same gates as U2; the 6 canonical signatures each exist as an authored row in
  their realm.
- **U4 — Generator (`build/gen-realm-hooks.py`) + data artifact (engine).** Mirror
  `gen-role-skins.py` exactly: parse spine + 11 skins → emit `data/realm-hooks.js` (classic
  `<script>` globals: `REALM_HOOK_SPINE`, `REALM_HOOK_SKINS`, `realmHookFor(realmId, band, rng)` →
  `{shapeKey|authoredId, hook, pressure, ifIgnored, tags, referentKind}`), `--check` mode,
  never hand-edit, **generated-artifact law: regenerate at master merge, never hand-merge.**
  Register in `manifest.json` (+ `<script>` tag before codex-roll.js); `check-manifest.py` green.
  *Accept:* weighted pick honors skin overrides; weight-0 never appears; band filter excludes
  Volatile-band authored rows below Strange temperature; unknown realm → no draw (NOT a frontier
  fallback — realm hooks are opt-in weather, unlike roles). *Red test:* distribution test over 10k
  draws per realm fails against a stub before the generator exists.
- **U5 — Split-draw wiring (engine).** Discovery-success path in the presence build gains the
  75/25 npc/realm split, gated by §5.4's band curve; walk-mint + place-gen seed slots accept
  `realmHookFor` output; engaged realm hook with a place referent hands off to the HOOK-WALKS mint
  seam; thread record lands on the referent's codex record with `kind:"realm-hook"`.
  *Accept:* at Grounded temperature, realm share of 1k discovery successes ≈ 0; at Strange, within
  ±3% of the split; dedup law holds (second same-shape draw in a region re-rolls); if-ignored
  routing matches Component 4 with the surfaced-clock carve-out. *Red test:* the Grounded-zero
  assertion fails against a naive always-split stub.
- **U6 — Registration close.** DESIGN.md decision entry + NEXT-STEPS + table-registry + CHANGELOG,
  serialized at the integration close per the worktree doc-collision rule.

Dependency: U1 → U2 → (U3 ∥ U4) → U5 → U6. U1–U3 are craft-lane (Adam review gates); U4–U5 engine.

## Adam's rulings needed (short — the architecture is ruled)

1. **The split number** — 75/25 npc/realm on discovery successes (and ~0 at Grounded): right feel,
   or should realm hooks be walk/place-only with NO share of the NPC-discovery draw?
2. **Surfaced-but-untouched clocks** — confirm the §4 carve-out: a surfaced clock's *tells* may keep
   escalating diegetically even in the touched-and-dropped tier (vs. hard-freezing with the thread).
3. **The three worked-example sets (§4)** — taste pass; the gloom periphery-not-core read of the
   GLOOM-KEY seam especially.

Everything else (spine size 24, 6–10 authored/realm, band gating shape, dedup law) is proposed with
rationale above and buildable as specced if unobjected.
