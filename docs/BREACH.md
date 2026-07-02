---
type: system-spec
status: specced 2026-07-02 morning — batch-3 unit (with SKIN-GRANTS); NEW tables gated on Adam's §5 sample review
created: 2026-07-02
related:
  - "[[SKIN-GRANTS]]"
  - "[[WALK-REFRESH]]"
  - "[[REGIONS-NAMES]]"
  - "[[LOOT-REMAP]]"
  - "[[SPICE-CURVE]]"
  - "[[DM-CHARTER]]"
---

# The Breach & The Nightmare — the bell-curve skin, and where the world gets thin

## §0. Adam's forks (2026-07-02)

| Fork | Call |
| --- | --- |
| Fiction register | **Archetypal silhouettes, never named** — "a hunting preserve where something invisible collects trophies"; the shape lands for anyone who knows, ships clean, and it's the Dark Tower's own move. IP-scrub discipline holds corpus-wide. |
| Entry | **Both, by band:** ordinary breach rows ANNOUNCE — a visible membrane/wrongness at a threshold the player may decline (declining falls back to a normal d100 skin). The rarest tier may AMBUSH mid-walk: a segment simply opens elsewhere (the inescapable-holodeck episode). Choice usually; violation rarely. |
| Persistence | **Rolled: d6 → 1–4 seals behind you · 5 UNSTABLE (a return trip is a gamble — the door flickers) · 6 STABLE — the thinny becomes MAP CANON** (a write-once weird door on the node graph, revisitable; legends grow around it). |
| Distribution | **The skin roll becomes 2d10 (bell) + fray shift.** Center mass (4–18, ~94%) → the lane's authored d100 skin table exactly as today. LOW tail (2–3, ~3%) → **the Nightmare table** (this world, distilled). HIGH tail (19–20, ~3%) → **the Breach table** (another world entirely). `frayMod` (+0 below FRAY_1 · +1 to FRAY_2 · +2 beyond) pushes the result AWAY from center in whichever direction it already leans — the rim widens BOTH tails. The compiler already handles bell dice. |

**The two unifications (why this is one system, not a bolt-on):**
1. **The fraying rim IS the thinny** — breach/nightmare odds scale with `frayLevel`; reality is
   most itself near home and thinnest at the edges. Players can learn this and chase or flee it.
2. **Breaches are where Outlandish loot is NATIVE** — inside a breach the L4 level-gate relaxes;
   the reality-breaking items diegetically COME from here ("it fell through, same as the places
   do"). Breach walks = the risk/reward apex.

## §1. Anatomy of a breach row (per-lane tables — dungeon/urban/wilderness each get their own d20)

`Band | The Silhouette (name + 2–3 sentence world) | Motif kit (extreme — same machinery as
SKIN-GRANTS §1b, wilder palette/tints/threat-reskins) | Physics (closed vocab, ≤2:` `techWorks ·
magicDim · lowGrav · timeSlip · huntRules · stageRules` `) | Grants | Entry (threshold / ambush)`

- Contents still roll from OUR tables — recontextualized to the limit (the multiplication
  principle at maximum). `physics` adds at most two mechanical lenses the script owns (techWorks:
  outlandish gate open + tech items function; magicDim: spell DCs +2, slots feel expensive;
  huntRules: the walk's apex threat stalks BETWEEN segments — a moving clock; stageRules: the
  world insists on a genre and NPCs correct you toward your "part").
- The breach's apex threat = a bestiary reskin (the DMG-reskin sketch, finally earning its
  place); its loot lane includes Outlandish draws.
- XP/reward apex: nightmare + breach walks pay a `×NIGHTMARE_XP`/`×BREACH_XP` premium
  (init 1.5 — danger pays; ADVANCEMENT-RETUNE's E(L) units).

## §2. The Nightmare tables (per lane, d20) — this world, distilled

Not another world: THIS one with the dial pinned. Density `+`, threat tier `+`, dread motif kits,
reward premium. The dungeon-est dungeon; the city at its cruelest; the wild at its most
indifferent. Same grants machinery (nightmares keep promises too).

## §2b. Frequency & integrity (worked 2026-07-02 with Adam; samples APPROVED same morning)

**Frequency:** at ~2 walked walks/session — home: ~1 tail event per 8 sessions (3–4 per L1→10
arc) · mid-rim (+1): ~1 per 4 · deep rim (+2): 1 walk in 5. The shift pushes 2d10 results away
from center-11 by `frayMod`; tails widen symmetrically, the center never gains. Tunables:
`BREACH_TAIL` (19), `NIGHTMARE_TAIL` (3), `FRAY_SHIFT` map. Tarot Majors may add ±1 outward for
a session via the existing mutator vocabulary (composition, not new machinery).

**The no-break invariants (verify-enforced):**
1. **Reskin, never restat** — breach/nightmare threats are `resolveArchetypePool` picks at the
   SAME tier CR bands as any walk, wearing the kit's reskin verb. CR→XP, attack resolution,
   morale: untouched.
2. **Lenses are bounded to existing mechanics** — `magicDim` = DC +2 (disclosed at the
   membrane); `huntRules` = a stalking clock, its attack a normal statted fight with ambush
   advantage; `lowGrav` = +1 zone-step BOTH sides; `stageRules`/`timeSlip` = narrative +
   social-DC lenses only. **No lens ever touches HP, damage dice, AC, or XP pricing** (mutation
   check: let one, harness fails).
3. **Nightmare = the deadly end of EXISTING budgets** (density +1, top-of-band CR), telegraphed
   by the entrance — retreat is always an informed option.
4. **The economy's liquidation firewall is already built:** merchant coin pools cap payouts;
   most Outlandish items are unpriceable — carried wonders ≠ gold inflation. **Reality-breaking
   band surfaces ONLY from the breach finale/apex slot** (mutation check).
5. **Premiums in E(L) units** (`×1.5` init), trash-decay guard live — stable-thinny re-walks
   re-roll full danger while repeat-kill XP decays; farming costs more blood than it pays.
6. **Death in a breach routes through the bardo as normal** (the rebirth plane is connected by
   design — nothing forks).

## §3. Wiring

1. `rollWalkSkin` → the 2d10 bell + `frayMod` + tail dispatch (center → existing d100 tables
   untouched).
2. Breach entry: threshold rows mint the membrane as segment-0 presentation (declinable — decline
   re-rolls a center skin); ambush rows fire at a mid-walk segment boundary (`walk_advance` into
   it reveals the crossing). **Ambush-tier structure: the FINALE is the way out** — the walk's
   finale segment IS the door home (the inescapable-episode shape; abandoning an ambush breach
   means finding the finale anyway, or a bardo exit). Threshold breaches exit back through their
   membrane. Persistence d6 on walk completion; a stable door writes a map node/edge flag
   (write-once, like every route).
3. `physics` lenses (closed vocab, script-owned executors — ≤15 lines each).
4. Outlandish relaxation inside breach walks; premium multipliers.
5. Frontier prose: DM register for narrating a membrane (dread + honest signposting; the Charter's
   honor-the-cool-danger rule), the ambush reveal, and stageRules voice.
6. `dev/verify-breach.mjs` (≥10/0): bell shares over 10k rolls (~94/3/3 ±1%) · frayMod widens
   both tails, never the center (mutation check: shift center-ward, harness fails) · decline
   falls back to a center skin · ambush only from ambush-flagged rows · stable-door writes
   map canon once · Outlandish gate open ONLY inside a breach (mutation check) · physics lenses
   apply/remove cleanly at walk end · premiums pay · regression: walk + skin suites unchanged.

## §2c. Return semantics, marooning, realms & the reskin boundary (Adam, 2026-07-02 mid-morning)

- **Sealing never strands — it seals BEHIND you.** The breach is walk-scoped: the membrane is
  the boundary; exiting the walk IS crossing home; the persistence roll happens AT exit.
  "Sealed" = you can't go back (the district becomes an unverifiable story). Ambush-tier exits
  via the finale (§3.2).
- **Marooned rows (v1, RARE — max one row per breach table):** `exit:"chained"` — the way home
  is **1d2 more rolled walks inside the realm** (find the counterpart thinny). The
  lost-between-worlds episode, bounded by walk machinery: it ends deterministically and cannot
  eat the campaign. The chained walks keep the realm's motif/physics/realm-filtered loot.
- **THE RESKIN BOUNDARY (hard rule): the world reskins; the KIT does not.** The PC's spells,
  abilities, sheet, and all resolution mechanics stay D&D everywhere — the fish-out-of-water
  contrast is the fun. In-realm shops/parley/combat run the SAME engines. Realm currency is
  narration-only (the wallet stays gp). Outlandish spell categories = licensed future, not v1.
- **Outlandish REALMS (the missing axis — batch-3 prep):** ① an **inventory scan of the d300**
  derives the realm vocabulary from its actual contents (~6–8 expected: frontier/western ·
  tech/sci-fi · noir/modern · post-apocalyptic · toybox/anachronism · cosmic/weird ·
  realm-neutral); ② a `Realm` tag column pass (tagging never rewriting; Adam skims); ③ a small
  set of **realm-native originals** authored per realm (cool magic-effect items that belong
  there — not pop references). Breach rows carry `realms:[...]`; all in-breach outlandish draws
  filter by realm — Django-world yields six-guns and cursed silver, never the Super Scope.
- **The guarantee:** every breach walk plants **≥1** realm-filtered outlandish item via a rolled
  CHANNEL — `hoard · social carrier (offered/wagered/carried) · secret · apex trophy` — the
  encounter is promised; the doorway varies. (Verify: guarantee always lands; channel
  distribution roughly even; realm filter never violated — mutation check.)
- **Breach-only sourcing (Adam's call):** the reality-breaking band surfaces ONLY inside
  breaches — its diegetic homeland — with ONE exception: the already-licensed Mythic
  anachronism-intrusion rolls (a thing that FELL through, LOOSE-ENDS §2). Normal-world dungeons
  keep utility/combat bands per the L4 level gates (mutation check: a reality-breaker in a
  normal walk's loot, harness fails).

## §2d. The ripple — how far the breach reaches into the corpus (Adam, 2026-07-02 late morning)

**CONTENT SAFETY (hard rule, compile-guarded + DM-CHARTER addendum at batch-3 prose landing):**
real-world slurs — racial, ethnic, or otherwise — are BANNED absolutely: never in tables, never
in DM output, no "period-accurate" defense in any realm. LICENSED: fictional prejudice between
fictional peoples, when it serves the narrative, voiced by NPCs only, never celebrated by the
narration. Django-realm menace comes from fictional cruelty, not borrowed real wounds.

- **DEEP realm kits (~25 items/realm, Adam's call):** per realm ≈ 12 mundane (FRAME-MAPPED:
  revolver=hand-crossbow frame, chainsaw=greataxe+loud+fuel, kevlar=armor frame — mechanics
  faithful, presentation realm) + 8 enchanted variants (+1 laser pistol = the enhancement system
  in chrome) + 4 signature wonders + the realm's CONSUMABLES (cells/cartridges/fuel).
  **The take-home governor: realm weapons run on realm consumables, scarce-to-nonexistent
  outside their homeland** — the carried-out laser pistol is real and slowly becoming a relic.
  Ammo scarcity balances what no ban could. Authoring: frames locked mechanically
  (Sonnet-safe), names/flavor to realm register (PROVISIONAL, Adam skims). ~175 items total —
  its own batch-3 unit.
- **Breach-touched NPCs (fray-scaled ~2% → ~8% rim-ward):** a rare RIDER on `rollNPC`, not a
  corpus rewrite — a small d12 touch table (survivor of one · lost someone into one · came back
  wrong · quietly collects outlandish trinkets · prophesies the thinning · once traded with
  something through a flicker…). Composes with what exists: Distant Word's Mythic rows carry
  breach rumor; TIYL's "slipped"/"doorway" supernatural rows retroactively ARE breach-touched
  backstories, free.
- **Marooned town-rolling is FREE (the reskin boundary pays off):** while a realm is active,
  ALL generators run as themselves under the realm motif — the tavern engine produces the
  saloon, the shop engine the general store on the same economy math, settlements/walks roll
  normally and present through the lens. Westworld's town IS the town tables wearing the realm.
- **Wandering (nested breaches while marooned): re-target freely, homecoming GUARANTEED** —
  the skin bell keeps rolling in-realm; a nested breach re-routes the journey through a third
  world, a fourth — but the marooned debt stays the ORIGINAL 1d2 walks, and the final walk's
  finale is ALWAYS home. Dark Tower wandering on a leash; the campaign spine survives (mutation
  check: extend the debt on a nested breach, harness fails).
- **"The Interior" (the mind-breach — one Mythic ambush row, all three tables):** the realm is
  a salience-picked KNOWN codex NPC's mind. Segments = their memories (built from their rolled
  atoms + ledger history); the apex = their `dm.flawSecret`; exit reveals their full levers via
  `codex_update` + permanently shifts the relationship (attitude event). The one breach built
  entirely from the world's own accumulated data — maximum payoff, zero invention.

## §2e. Audit repairs (2026-07-02 midday hole-hunt — all BINDING)

1. **Marooned × prep:** while `w.realm` is active, `startPrep` stages ONLY the remaining chained
   walk(s), realm-motif'd; frontier promotion SUSPENDS until homecoming (mutation check: a
   home-world frontier staged mid-maroon, harness fails).
2. **Digest visibility:** `activeWalk.realm = {name, physics:[], motif}` rides every turn while
   breached — the DM always knows where it is and what the rules are.
3. **SUPERSEDE clause:** this spec's breach-only sourcing for the reality-breaking band REPLACES
   WALK-REFRESH §2.2's "reality-breaking L9+" gate (the L4 gates stay for utility/combat/
   high-power in normal walks). One rule, no executor coin-flips.
4. **Realm ammo = the built charge system** (ITEMS Part II): realm tech items are charge items;
   realm consumables (cells/cartridges/fuel) are their recharge path — scarce outside the realm.
   No new machinery.
5. **Rust exemption:** `tech`-tagged frames never rust (DURABILITY-TRIO's metal rule excludes
   them) — charge decay is already their mortality.
6. **The Interior's assembly rule:** `interiorWalk(npcId)` = a standard rolled topology where
   each segment BINDS ONE ATOM of the NPC (bond · fear · want · motivation · a ledger event
   naming them — in salience order); the apex binds `dm.flawSecret`. Exit: `codex_update`
   reveals the levers + an attitude event. Concrete; zero invention.
7. **Guarantee fallback:** the social-carrier channel binds to a rolled Social segment when one
   exists, else falls back to the hoard channel — the guarantee never dangles.
8. **`xpReport` gains a breach/nightmare bucket** so the premium is tunable from evidence.
9. **The safety guard is a real gate:** extend the existing scrub-guard pattern
   (`build/` scripts) with a denylist check that FAILS the compile — maintained as a small
   separate list file, real slurs only.

## §4. Table authoring plan

Six small tables (3 Breach d20 + 3 Nightmare d20), **samples §5 first** — this is the most
voice-critical authoring in the corpus. A batch-3-prep **corpus scan** derives the final motif-kit
list from what the skin/breach rows actually need (Adam: "the kits are as wild as they come").

## §5. SAMPLES — FOR ADAM'S REVIEW (2 breach + 2 nightmare per lane)

**Dungeon Breach**
- *(threshold)* **The Preserve** — a humid garden under a false sky, trails mown to invite; polished trophies hang at intervals, arranged by kill difficulty. Something invisible keeps score, and your entrance was scored. `huntRules · motif: trophy-garden`
- *(ambush)* **The Vessel** — past the fourth door the stone becomes seamless humming metal; doors iris; the long-dead crew all wear one uniform, and something still updates the manifest. `techWorks · motif: dead-ship`
**Dungeon Nightmare**
- **The Hunger Below** — every room is faintly mouth-shaped and the architecture swallows: doors behind you digest shut. The loot is bait. It has always been bait.
- **The Museum of You** — the dungeon has prepared exhibits: your campfire, recreated; your dead, wax-faithful; the final case is empty, labeled, and exactly your size.

**Urban Breach**
- *(threshold)* **The Rain Quarter** — a district where it is always night, always raining, and every light is a colored sign for something illegal; everyone owes somebody, and newcomers' debts get assigned. Guns here, not wands. `techWorks · motif: neon-rain`
- *(ambush)* **The Anniversary Town** — cheerful streets rehearsing a festival for a date that hasn't happened yet. You are in their photographs already, smiling, wearing clothes you don't own yet. `timeSlip · motif: clocktower`
**Urban Nightmare**
- **The Procession** — the city's funeral never ends; shops serve mourners between stations of the route. The coffin is open, empty, and the procession is patient about filling it.
- **The Curfew That Loves You** — at dusk every door opens FOR you, every table is set FOR you, every bed turned down FOR you. The city insists you stay. The city has kept others.

**Wilderness Breach**
- *(threshold)* **The Black Shore** — black sand to the horizon, a field of roses inland, and a tower on the skyline no matter which direction you face. Distances here are promises, not measurements. `magicDim · motif: black-shore`
- *(ambush)* **The Fallen Field** — a mile of furrowed scorched earth ending in a half-buried metal colossus; its ribs are rooms, its heart still ticks warm. Scavenger camps keep a respectful ring. `techWorks · motif: dead-ship · grants: hoard, relic`
**Wilderness Nightmare**
- **The Silence** — nothing here has made a sound in years: no wind, no bird, your own footfalls arriving muffled and late. The first true sound you make will be a beacon, and you will make one.
- **The Kindness of the Wood** — the forest keeps helping: fruit at hand-height, springs at thirst, clearings at dusk. It is fattening something's larder, and the trail behind you is closing politely.
