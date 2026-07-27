---
type: system-spec
status: "RULED — drafted by Fable 2026-07-26; all four §6 founder questions answered by Adam 2026-07-27; BUILD AUTHORIZED (decisive-answers law)"
owner: creator lane (bardo / char-genesis / entry bridge)
siblings:
  - "[[TIYL-WEIGHTED-STARTS]]"   # unreviewed sibling — moves WHERE the start leans; this spec moves HOW HOT it opens
  - "[[NEW-GAME-FLOW]]"
  - "[[SPICE-CURVE]]"            # the rarity ladder this spec deliberately bends for one moment
  - "[[SETTLED-LIFE-SITES-PROGRAM]]"  # Genesis-briefs lane — owns what a "hometown" scene can even show
evidence: "docs/intel/tiyl-starts.md (12-start batch, 2026-07-26), docs/intel/walk-census.md"
---

# TIYL-START-DIVERSITY — the Opening Register

> **Adam's brief (2026-07-26, verbatim intent).** "If almost every TIYL has you starting in a
> town, we really need to do something about that because I think sometimes we should be
> starting people off in some absolutely wild high tension or just bizarre scenarios. The
> hometown start is fine SOMETIMES but not most of the time."
>
> **The one law carried over from every start spec:** weights, not locks. Every opening stays
> reachable by every class, species, and background. The dice lean; they never railroad.

## §1 The problem, measured

The 2026-07-26 batch roll (12 complete starts, every class, real dice — `docs/intel/tiyl-starts.md`)
found the openings the current chain produces are a monoculture:

- **12 of 12 starts opened in a settlement.** Zero open-road, zero wilderness, zero mid-journey.
- **11 of 12 were calm arrivals.** The `eFoot` (d12) vocabulary is entirely composed of
  quiet-arrival rows — "nothing but what you carry," "a room already paid for," "an old
  acquaintance in town." There is no row that opens mid-event.
- **Spice at minute zero ran Grounded 9 / Textured 3.** The rarity ladder is behaving exactly as
  designed (SPICE-CURVE) — which is the point: the opening inherits ambient rarity, so the wild
  opening effectively never happens.

Nothing here is a table bug. The system is doing what it was built to do; what it was built to
do is now ruled wrong for minute zero specifically.

## §2 The design — one new roll, upstream of the entry triplet

Add an **Opening Register** roll — a single d100, rolled once per new character, before
`rollEntry()` builds the why/foot/standing triplet. The register decides how hot and how strange
minute zero is. Everything downstream (the triplet, the tension pick, the DM's opening
narration contract) reads the register band.

Proposed bands and weights (**the weights are the founder's dial — see §6**):

| d100 | band | what minute zero is |
|---|---|---|
| 1–25 | **SETTLED** | Today's behavior, demoted to one band: ordinary business in an ordinary place. The hometown-interior scene lives here (childhood home, a paid room, a family table) — the "sometimes" Adam ruled fine. |
| 26–50 | **ARRIVAL WITH EDGE** | The current arrival triplet, but the world's tension is already present-tense: something is visibly wrong in this place *as you arrive*, and the opening tension (`pickTension`) is live, not latent. |
| 51–80 | **IN MEDIAS RES** | The opening is the middle of an event: mid-chase, ambush sprung, the building already burning, the flood already rising, standing over a body as voices approach, the caravan under attack, halfway up the cliff at night. A danger clock is running at turn zero. |
| 81–95 | **WRONG** | Bizarre, not (necessarily) violent: you wake at your own funeral; everyone in a town you've never seen knows your name; a mark appeared on you overnight; the town is silent at noon and every door stands open. High strangeness, player unhurt, questions armed. |
| 96–100 | **MYTHIC COLD OPEN** | World-grade strangeness at minute zero, rare and real. Per the band-calibration law, Mythic changes the world forever — a cold open at this band is allowed to mark the world permanently from turn one. |

Design properties, in order of importance:

1. **The register is situation, not fate.** It decides what is happening at minute zero — never
   the world's tone, the campaign's trajectory, or the player's response. Tone-agency stays
   sacred: a player who opens mid-ambush may still spend the next hundred sessions building a
   utopia. The band is written to the World State Ledger as an ordinary fact, not a standing dial.
2. **Weights, not locks — and leans compose.** Class/background leans apply through the same
   weighted-duplicate-array mechanism as `CLASS_FACTION_AFFINITY` (the codebase's canonical
   lean), exactly as TIYL-WEIGHTED-STARTS proposes for start *location*. The two specs compose:
   WEIGHTED-STARTS moves **where**, this spec moves **how hot**. A barbarian leans IN MEDIAS RES;
   a sage leans SETTLED; both can roll anything.
3. **The story is already in the dice — reuse it.** The TIYL life chain has usually rolled a
   tragedy, a boon, an enemy, a debt. IN MEDIAS RES and WRONG openings should draw their
   *material* from those rolled life events before inventing fresh content (the tragedy's
   author is the one chasing you; the funeral is for the sibling the chain gave you). This is
   the Session-Prep doctrine — over-roll, then synthesize — applied to minute zero, and it is
   what keeps a hot opening from feeling bolted on.
4. **Non-settlement openings become real.** IN MEDIAS RES and WRONG both carry road, wild,
   river, cliff, and mid-journey scene rows. This breaks the 12/12 settlement monoculture as a
   side effect of the register, without touching the hometown/starting-location semantics
   (fix/tiyl-entry-wiring owns those).
5. **One deliberate bend in the spice law, fenced.** The register's rarity curve is hotter than
   ambient spice on purpose — that is the entire point of the spec — but it is a **one-time
   authored moment**, spent at character birth. After turn zero the normal SPICE-CURVE rarity
   resumes everywhere. This must be stated in DESIGN.md when adopted so the register is never
   cited as precedent for a time-escalation dial (which stays banned).

## §3 What the entry triplet needs

The triplet survives; it gains band awareness:

- **`eWhyHere` / `eFoot` / `eStanding` stay the SETTLED/ARRIVAL tables.** They are good at what
  they do; what they lack is jurisdiction over hot openings.
- **Each hotter band gets its own small foot-equivalent table** ("what is true in this exact
  second"): IN-MEDIAS-RES rows are verbs mid-flight ("the rope is in your hands and fraying,"
  "the door behind you just gave"), WRONG rows are states ("you are dressed for a ceremony you
  don't remember," "your hands smell of smoke"). Authored as Engine markdown tables
  (edit-source → compile-artifact), spice-graded per row like every other table.
- **`pickTension` binding.** ARRIVAL-WITH-EDGE and above promote the opening tension from
  latent to present-tense; SETTLED keeps it latent as today.
- **The DM contract line.** The register band and its rolled row travel to the DM as nouns with
  the usual fragment-oracle presentation; the DM owns the verbs and the reveal, per the
  engine-owns-nouns law. A WRONG opening's *explanation* is DM territory (motivated-lies-over-
  canon applies); the register only guarantees the situation is real.

## §4 Build sketch (Track A first, wiring second)

1. **Tables:** new Engine markdown — `Opening Register` (d100, the band table) + one small
   band-keyed situation table per hot band. Compile via the normal pipeline.
2. **Wiring:** `rollEntry(w,c)` rolls the register first and stores it on `c.entry.register`;
   band conditions which foot-table is consulted and whether tension is promoted. The hometown/
   starting-location fields are read-only inputs here (that lane lands separately).
3. **Teeth (Teeth Law):** `dev/verify-opening-register.mjs` — headless census of ≥200 fresh
   entries asserting (a) every band appears, (b) observed shares sit within a tolerance window
   of the authored weights, (c) hot-band entries carry a live tension and a band situation row,
   (d) no fixed-position RNG assertions (streams diverge across node versions — assert shape,
   never sequence). The census machinery from 2026-07-26 (`walk-census.mjs`) is the pattern.
4. **Acceptance:** re-run the 12-start batch protocol from `docs/intel/tiyl-starts.md` against
   the built register; the deliverable is the same table with the monoculture visibly broken.

## §5 Explicitly out of scope

- Renaming/re-anchoring hometown vs starting location — owned by `fix/tiyl-entry-wiring`.
- Class-weighted start **locations** — owned by TIYL-WEIGHTED-STARTS (still awaiting review;
  adopting this spec neither requires nor blocks it).
- What a SETTLED opening can visually show (domestic interiors, the home settlement) — owned by
  the settled-life program in the Genesis-briefs lane; this spec only reserves the band.
- Any change to ambient spice, walk rarity, or post-opening play.

## §6 Founder decisions — ALL RULED by Adam, 2026-07-27

1. **The weights — RULED: locked as authored.** 25 / 25 / 30 / 15 / 5 ("weights are good").
   Remains the founder's dial; the gentler (35/25/25/10/5) and hotter (15/25/35/18/7) stocks
   stay documented as the one-row revision if live play ever argues for it.
2. **Player lean at world creation — RULED: no, for now.** Pure dice; the register is part of
   rolling a world into being. The safe/standard/feral lean stays a documented two-line weight
   swap, reopened only if Adam reopens it.
3. **Realm honesty of WRONG — RULED: realm-honest.** WRONG rows are authored as realm-adaptive
   archetypes (the DM instantiates them in the realm's own register); no genre-violating
   specifics in any row. WRONG means *this world* is wrong, never that the genre changed.
4. **MYTHIC's permanence — RULED: yes.** ("It's fine, it was gonna get changed at some point!
   Let the game be weird.") A 96–100 cold open may permanently mark the world from turn one;
   MYTHIC rows are authored with world-marking weight, per "Mythic changes the world forever."

With all four ruled in one message, the decisive-answers law applies: **this spec is
build-authorized** on the §4 sketch (tables → wiring → verify-opening-register teeth →
12-start acceptance re-run).
