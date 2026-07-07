---
type: design-proposal
project: Genesis
status: RULED 2026-07-07 — Adam ruled ALL SIX questions at the production session (Q1 AMEND TIER-SCOPE — the Crowning is real, plateau stays default · Q2 YES crowning retires the PC to U.souls · Q3 YES the Sundering ships in v1 · Q4 external-front-always in v1, realm Doom rosters = craft-pass expansion · Q5 EITHER-gate claim price, closed front OR tier-scaled gold · Q6 one bastion per WORLD). §7 units C1/C2/B1/B2 now spec-lock; builds queue behind TRANSITION-CONTRACT + ITEM-LEGACY per the stated deps
consumer: spec-lock conversion (Opus), then Sonnet executors; Adam authors the Legend-table rows at his craft pass
created: 2026-07-06
related:
  - "[[DEATH-AND-REBIRTH]]"
  - "[[ITEM-LEGACY]]"
  - "[[TIER-SCOPE]]"
  - "[[PARKING]]"
  - "[[DREAM-HORIZON]]"
  - "[[DESIGN-GUIDE]]"
  - "[[SPICE-RAISE]]"
---

# THE CROWNING & THE BASTION — how a world ends well, and what it leaves behind

**One sentence:** the Crowning is the earned ENDING Genesis is missing — kill the world's
Impending Doom at the tier cap and the world is not deleted but *promoted into legend*, feeding
the connected plane forever — and the Bastion is the thin formal layer over the already-working
stronghold-and-stash truth, the vault a crowned world hands to every soul that comes after.

---

## §1. The emotional thesis — the bookend

Death & Rebirth answered "what happens when the CHARACTER ends?" with the best answer in the
genre: the world doesn't blink. It drifts 0–49 days, the Saga rolls, your corpse cools where you
fell, and a stranger wakes on the far side of the plane (`docs/DEATH-AND-REBIRTH.md` — all seven
build steps landed 2026-06-21). Death is expected, not punished.

But Genesis has never answered "what happens when the WORLD is done?" Today there are exactly two
exits: the plateau (`docs/TIER-SCOPE.md` — hit level 10, keep playing at full T2 power, forever)
and the guillotine (`destroyWorld`, `src/world/play.js:420–427` — type DESTROY, `delete
U.worlds[id]`, "X is unmade"). One is an ending that never arrives; the other is an ending that
erases. Neither is *finishing*. A player who spends forty sessions unwinding a world's buried
truth and finally breaks its Doom deserves something better than "the clock keeps running" — and
something infinitely better than a confirm-prompt that vaporizes the evidence.

**The Crowning makes "worlds persist forever" and "a world can end well" the same fact.**
Retirement is not deletion — it is a *state promotion*. A crowned world stays on the shelf, stays
walkable, stays canon. What changes is its RELATIONSHIP to the universe: its story is sealed as a
legend object, and that legend starts leaking outward — into Distant Word rumor in other regions,
into successor origins, into the vault a new soul suits up from. The shelf already promises it:
*"It will persist here forever — across sessions, across characters — until you choose to destroy
it"* (`src/world/render.js:1800`). The Crowning is that promise growing a third clause: *…or
until you finish it, and it starts persisting FOR you.*

What a finished world should FEEL like: the last page of a book you get to keep on the shelf,
spine out, in a library your next character is born inside. Death & Rebirth is the loop; the
Crowning is the loop's exit that doesn't break the loop. The bardo says "your life echoes." The
Crowning says "your WORLD echoes." Same machinery, one altitude up.

**This amends a standing ruling, flagged honestly:** TIER-SCOPE (locked 2026-06-26) says reaching
level 10 is "plateau & continue … not a retirement ceremony." That ruling was made when the only
imaginable ceremony was a credits screen. This proposal keeps the plateau as the DEFAULT — nobody
is ever forced to crown; the un-crowned level-10 sandbox life stays fully supported — and adds
the ceremony as an *earned, opt-in, dangerous* exit. Adam must explicitly re-rule the TIER-SCOPE
sentence (Q1 below) or this whole doc stays parked.

---

## §2. What exists (verified against the tree, 2026-07-06)

Every hook this design stands on is already built. Nothing here requires new architecture.

| fact | where |
|---|---|
| The Impending Doom is real state: every pressure front carries `doom` (rolled from `SS.doom`), a hidden `real` truth, and a `clock:{size:6,filled:0}` | `rollPressure`, `src/engine/world-gen.js:15–23` |
| The doom is DM-only by contract — digest ships `dmOnly:{truth, doom}` per front; the handoff prints "if its clock fills: …" | `src/world/dm.js:319–321`; `src/world/handoff.js:32` |
| Fronts CLOSE today: `front_closed` sets `p.closed=true`, writes an outcome ledger line, grants uncapped stake XP, prices a reputation deed | `src/world/dm.js:2693–2705`; `grantXp` at `:860` |
| Clocks advance/fire as first-class events (`clock_advanced` / `clock_fired`) | `src/world/dm.js:1285–1286, 2649` |
| The level cap: `LEVEL_CEILING = 10`, clamped in `levelForXp`; bundle carries `tierCap:2` | `src/engine/advancement.js:13`; `src/engine/prep-bundle.js` |
| The ledger IS the flight recorder — `addLedger` everywhere; the Chronicle renders it via `chronicleLine` | `src/world/durability.js:275` |
| The Saga ranker already distills "what mattered" from the ledger | `computeSaga`, `src/world/saga.js:16` |
| The connected plane: worlds are regions with coords, distance, farthest-region lookup; successors spawn plane-wide | `regionRingPos/placeRegion/regionDistance/farthestRegion`, `src/world/state.js:128–150`; `spawnSuccessorOnPlane`, `src/world/fate.js:75` |
| Corpse + stash persistence: death mints `c.corpse` with items/gold/decay context; recoverable by any later PC | `killCharacter`, `src/world/fate.js:9`; `corpseStatus/claimCorpse`, `src/world/rebirth.js:170,184` |
| Wandering Souls are a universe-level portable roster (`U.souls`) | `src/world/state.js:209–224` |
| Distant Word binds distortion rows to REAL cross-node facts — the rumor pipe exists | `distantWordRoll`, `src/world/gap-wiring.js:154` |
| Item lifecycle fields (`r.legacy`: origin/claimant/lastSeen/lossState/hooks/snapshot) spec-locked tonight; **`lossState:"cached"` is explicitly reserved as the Bastion seam and REFUSED in v1** (`{ok:false, reason:"bastion-parked"}`) | `docs/ITEM-LEGACY.md` §1.1, §7.3 |
| Epithets are a built reward surface (`repuGrantEpithet`, `epithet_grant` event) | `src/world/reputation.js:111`; `src/world/dm.js:1292` |
| The bardo ritual UI pattern (modal, roll-revealed, fragments, prose-first) | `openBardo/closeBardo`, `src/world/fate.js:37,66` |
| The Bastion v0 works EMERGENTLY: persistent world + corpse/stash-at-a-location + `claimCorpse` already gives cross-character inheritance-by-geography | `docs/PARKING.md:13–18` |
| `destroyWorld` today does NOT bank souls — it just deletes (the D&R "bank on world-destroy" line is aspiration, not wiring) | `src/world/play.js:420–427` vs `docs/DEATH-AND-REBIRTH.md` "What persists" table |

That last row is a live gap this design closes from the right direction: instead of patching the
guillotine, build the ending players should actually reach.

---

## §3. The Crowning — v1, the minimal complete ritual

### §3.1 The Doom-front (naming what already exists)

Every world already rolls internal + external pressure fronts at genesis, each with a hidden
`real` truth and a `doom`. **v1 designates the EXTERNAL front as the world's Impending Doom** —
the doom with a geography, "it comes from the outside" (`src/engine/world-gen.js:10` comment
already frames it exactly that way). No new roll, no new table: the Doom-front is a *flag*
(`p.isDoom=true` set at `rollStartingState` time on the external front), and the DM digest's
existing `dmOnly.doom` line becomes the campaign's spine instead of merely its weather.

The slow drip stays intact (P4): the player learns which front is THE Doom the way they learn
everything — fragments, portents, the drip. The flag is engine-state from day one; the
*revelation* is DM-paced.

### §3.2 Crown eligibility — detected, never declared

The engine detects eligibility; the DM cannot gift it and cannot withhold it (engine owns the
noun "this world can now end"; the DM owns the verbs of how the attempt plays). All three, checked
app-side after every `front_closed` / `level_applied` — zero model calls:

1. **The Doom-front is closed** — `p.isDoom && p.closed` via the existing `front_closed` handler
   (`src/world/dm.js:2693`), with `how` recorded (defeated / unraveled / bargained — the existing
   free-text `how` field; no new enum needed in v1).
2. **The PC stands at the ceiling** — `level >= LEVEL_CEILING` (`src/engine/advancement.js:13`).
   The crown is a TIER-2 CAPSTONE: you finish the world at the world's full weight, not before.
3. **The attempt was survived** — trivially true if you're alive to see the banner. If the
   Doom-fight kills you, the D&R loop runs unchanged and the world stays uncrownable until a
   successor re-closes the (re-opened, see §3.5) front. Death remains the other ending.

Eligibility surfaces as a prose banner + a Character-panel affordance ("⟡ The world can be
crowned"), twin to the existing `⚰ Recover effects` link pattern (`src/world/render.js:1608`).
Eligible ≠ automatic: crowning is a RITUAL the player initiates at the world's heart (the
Doom-front's ground zero, or the Bastion if claimed — taste, Q5).

### §3.3 The ritual itself — the mirror of world-genesis

The world was rolled into being click-by-click (`docs/NEW-GAME-FLOW.md`); it is rolled into
legend the same way. One modal in the `openBardo` mold (`src/world/fate.js:37` — repurposed-modal
precedent), player-clicked rolls, prose-first, ARIA-live like everything else. Three rolls + one
computed testament, all deterministic:

1. **The Legend roll** — how the plane will remember this world (a new small authored table,
   spice-graded, Adam's craft voice: "a golden age," "a warning told to children," "a name
   spoken only at sea"). One d-roll; the result is the crowned world's epithet-of-record.
2. **The Crown epithet** — the PC's capstone epithet via the EXISTING
   `repuGrantEpithet`/`epithet_grant` machinery (`src/world/reputation.js:111`) — the crown IS an
   epithet, mechanically. No new reward currency (anti-fractal).
3. **The Testament** — computed, not rolled: `computeSaga(w,c)` (`src/world/saga.js:16`) already
   ranks the 7 entities that mattered most. The crowned world's testament = its final Saga,
   written to the ledger as `canon`/`crowned` entries. The flight recorder closes its own book.
4. **The Succession roll** — ONE forward-looking roll: which testament entry becomes the world's
   standing legend-hook (the thing successors elsewhere can hear about / inherit from). Feeds §5.

Then the state write, additive and small:

```js
w.crowned = { day, by:{pcId,name,epithet}, legend, testament:[7 saga refs], how };
```

The crowned PC **retires to the roster** — banked into `U.souls` (`src/world/state.js:209`) as a
Wandering Soul with the crown on their record. This is the *proper* feeding of the souls pool
that world-destroy was supposed to do and never wired (play.js:420 just deletes). The crown costs
you the character: that is the trade that makes it an ending and not a trophy (P5 — pressure-
tested below). The world stays; the hero becomes portable legend.

### §3.4 What a crowned world IS afterward

- **Still on the shelf, still enterable.** Epilogue play is legal: roll a new soul into a crowned
  world and live in the aftermath (the Doom's absence is itself a world-state — power vacuums are
  content). Crowned is a *tint*, not a lock. Worlds persist forever; that pillar bends for
  nothing.
- **Its fronts do not respawn.** The Doom-front stays closed; `rollStartingState` never re-runs.
  A crowned world is post-campaign SANDBOX, permanently. New pressure can still drift in through
  the existing faction-turn machinery (`ssFactionTurn`) — quieter stakes, not zero stakes.
- **It becomes a Distant Word SOURCE for the whole plane.** `distantWordFactPool`
  (`src/world/gap-wiring.js:127`) today draws from the current world's ledger. Crowned worlds
  contribute their testament entries to a small universe-level pool (`U.legends`), so a PC in a
  fresh region can hear a distorted rumor of a world someone ELSE finished. The connected plane
  finally has cross-region gossip with a mechanical source. Zero model calls — same
  distortion-row binding, wider pool.
- **It seeds New Game+** — §5.

### §3.5 Hard & dangerous — the crown must be EARNED, and losable

Pressure-tested against "too safe?" three ways:

- **The Doom-fight is ceiling content.** The Doom-front's closure beat is CR-ceiling material
  (`crCeiling:10` already rides the bundle meta, `src/engine/prep-bundle.js`). No attrition
  crown: `front_closed how:"waited"` is not a thing the DM may emit for a Doom-front — the
  digest's doom line carries the standing instruction that the Doom closes only through
  confrontation with its `real` truth. CAL-1 lethality applies in full; the rescue-window rules
  (`docs/DEATH-AND-REBIRTH.md` §death moment) are the only net.
- **The ending can be LOST.** If the Doom-front's clock FILLS before it is closed (`clock_fired`
  on `p.isDoom`), the doom lands — and the world enters the dark twin state, **the Sundering**
  (Q4): same legend machinery, inverted valence. A sundered world also persists, also feeds the
  plane — as a cautionary legend ("the world where the tide won"). Its Doom-front seals as
  *fired*, uncrownable forever. Symmetry is the point: if a world can only end well, ending well
  means nothing. This costs almost nothing to build (one more flag + the same testament pass) and
  buys the whole stake structure.
- **Death at the threshold pays the ITEM-LEGACY toll.** Die in the Doom-fight and everything
  tonight's sibling spec built fires at maximum: your best items stamp `on-corpse` at the most
  dangerous node in the world, scavenge teeth apply, the recovery hooks mint (`ITEM-LEGACY`
  §4.1–4.4). The successor's road back to a crownable world routes THROUGH the ancestor's lost
  gear. The two systems interlock without a line of new code.

### §3.6 Doctrine compliance (the Crowning)

- **Engine owns nouns / DM owns verbs:** eligibility, rolls, testament, state write — all engine.
  The DM narrates the ceremony and voices the world's farewell; it decides nothing mechanical.
- **Inference cost: zero new model calls.** The ritual is click-rolls + computed saga; the DM's
  crowning narration rides the existing turn it would have narrated anyway. `U.legends` feeds
  existing deterministic pipes.
- **Blind-playable:** the ritual modal is the bardo pattern — prose-first, roll-revealed,
  keyboard-driven; its prose twin is itself (there is no visual-only surface). The shelf's
  crowned tint gets a text badge ("⟡ Crowned — Day N, by X"). Ledger lines carry everything.
- **Depth-over-breadth:** v1 is ONE table (Legend), ONE flag, ONE modal, ONE universe pool.
  Everything else reuses saga/reputation/souls/distant-word as-is.

---

## §4. The Bastion — v1, the thin promotion of what already works

### §4.1 The v0 truth, stated plainly

PARKING is right: the Bastion already exists emergently. A persistent world + a location + items
left there IS a stronghold-and-vault; `claimCorpse` already lets a successor walk to an
ancestor's body and suit up (`src/world/rebirth.js:184`). The 2024 DMG Bastion system
(facilities, hirelings, bastion turns, orders) is SOURCE MATERIAL for a later expansion — porting
it as a subsystem would violate depth-over-breadth and recreate "a magic version of the real
world where everything has a table." v1 formalizes exactly three things the emergent version
lacks: a NAME, a CLAIM, and a VAULT that doesn't decay.

### §4.2 v1 mechanics — claim, name, vault

**Claim.** One new event, `bastion_claim` (player/declared source), payload
`{nodeId, name, note?}`. Legality is engine-checked: the node must be known, currently safe (no
live combat, no unresolved threat overlay), and CLAIM-PRICED — a bastion is earned by deed or
coin, never free (P5): the handler requires EITHER a closed front on the books
(`w.pressures.some(p=>p.closed)`) OR a gold price (tier-scaled, the economy's missing
money-sink — `feedback: economy loops close on currencies`). Writes:

```js
w.bastion = { nodeId, name, foundedDay, foundedBy:{pcId,name}, vault:[] };
```

plus a codex location record (`codexAdd`, `src/world/codex.js:66`, `kind:"location"`,
`origin:"bastion"`) so the relational layer sees it, and one ledger `canon` line. ONE bastion per
world in v1 (Q6) — the claim is a decision, not a collection.

**Vault.** The Bastion unparks `lossState:"cached"` — the seam ITEM-LEGACY reserved tonight
(§1.1: *"the parked Bastion vault will own it"*; §7.3's refusal flips to a handler). Depositing a
legacy-grade item at the bastion emits `item_claimed {lossState:"cached", by:{kind:"faction"?
no — kind:"none"}, at:bastionNode}` — claimant becomes the bastion itself (add `"bastion"` to the
claimant-kind enum, one word). Vault items:

- **Do not decay and cannot be scavenged.** The vault is the anti-corpse: `corpseScavengeResolve`
  never touches it; `SCAVENGE_TEETH` has no bastion row. That safety is what the claim price buys.
- **Inherit across PCs by ACCESS, not by teleport.** A successor inherits the *right* (the
  bastion is theirs the moment they learn of it — a This-Is-Your-Life echo roll can seed the
  knowledge) but must TRAVEL there (respects geography; the plane's distances stay meaningful —
  the successor spawns far away by design, `spawnSuccessorOnPlane`, `src/world/fate.js:75`).
  Withdrawal is `item_claimed {lossState:"held"}` + the instSnapshot overlay-restore ITEM-LEGACY
  §2.2 already specced — the +1 sword comes out of the vault exactly as true as it went in.
- **Are the successor's opening move.** "Suit up from the ancestor's hoard" (Adam, 2026-07-02)
  becomes literally: wake in the bardo's aftermath, hear the fragment about the old hall, cross
  the plane, open the vault. The pilgrimage IS the tutorialized early game of a legacy run.

**Name & surface.** The bastion renders as prose on the existing location/character panels — a
titled paragraph (name, founder, day, vault manifest as a text list) + ledger lines per
deposit/withdrawal. **Prose twin: the bastion panel IS prose in v1** — there is no map badge or
visual until a later pass, and when one comes it ships with this paragraph as its twin (the
BLIND-PLAYABLE gate, `docs/DREAM-HORIZON.md` §0).

### §4.3 The expansion tier — sketched, NOT specced, NOT v1

For the post-v1 conversation only, in rough priority: **facilities** (2–3 slots, each a
deterministic downtime service — forge = repair/rust-reversal riding `item_rust_exposure`'s
existing machinery; archive = recall bonuses off the codex; shrine = the D&R bardo's
vision-count nudge); **staff** (hirelings parked at the bastion via the existing `hire` event);
**orders** (bastion turns riding `ssFactionTurn` cadence — the bastion acts while you adventure).
Each is demand-not-supply: build the one players actually ask for after living with v1. None of
this enters spec-lock now.

### §4.4 Doctrine compliance (the Bastion)

- **Engine owns nouns:** the claim check, the vault list, the no-decay rule — all script.
  The DM narrates the hall; it cannot invent vault contents (digest slice = the manifest).
- **Zero model calls:** claim/deposit/withdraw are typed events; the vault is a list.
- **Hard-and-dangerous pressure test:** the vault is safe but the ROAD isn't — inheritance
  requires crossing a plane that rolls SPICY baseline and hotter through the fray
  (`docs/SPICE-RAISE.md` §0 tier weights). And the bastion is a known address: a fired
  Doom-front's fallout (Sundering) or `factionInterest` on cached items (ITEM-LEGACY field,
  already specced) can make the hall a TARGET in the expansion tier. Safety has a perimeter,
  not a guarantee.
- **Depth-over-breadth:** v1 is one event, one world field, one claimant-kind word, one prose
  panel. The DMG port stays in the drawer.

---

## §5. The seam — where the ending and the vault are one system

This is why PARKING said "the vault and the ending are one conversation":

1. **A crowned world's vault = the New Game+ seed inventory.** When a NEW world is rolled and a
   crowned world exists on the plane, This-Is-Your-Life gains one low-probability origin echo:
   "an heirloom of a finished world" — the creator draws ONE item from a crowned bastion's vault
   (player picks the world; the die picks the item). The item arrives with its full `r.legacy`
   trail (origin, the crowned world's testament link) — the new PC is holding a sentence from a
   finished book. It MOVES (removed from the source vault, `item_claimed` both sides): the plane
   has one of each thing; legends migrate, they don't photocopy. Un-crowned worlds' vaults do NOT
   feed this — crossing regions at creation-time is the crown's exclusive dividend, which makes
   crowning *mechanically* generous, not just sentimentally.
2. **ITEM-LEGACY is the connective tissue.** `"cached"` (reserved tonight) is the vault verb;
   `instSnapshot` is what makes cross-PC, cross-world inheritance lossless; the recovery-hook
   thread pattern (`ITEM-LEGACY` §5) is reused verbatim for the heirloom's "where it came from"
   thread in the new world. No new lifecycle machinery — the Bastion is ITEM-LEGACY's ninth
   lossState finally switched on.
3. **The death-loop at one-Doom-kill-from-crowning is the game's sharpest moment.** PC dies with
   the Doom-front at 5/6 closed-adjacent: the bardo runs (`runBardo`,
   `src/world/rebirth.js:142`), and the wrathful visions can legally advance the Doom clock
   (`applyVision` already mutates faction clocks ±1). The world can SUNDER while you are dead.
   The 0–49 day gap becomes a held breath: wake, check the sky, learn whether the world you
   nearly finished still CAN be finished. That single interaction — built entirely from existing
   pieces — is the emotional argument for this whole proposal.
4. **The corpse and the vault answer each other.** Uncached gear dies with you (scavenge,
   decay, cold trails); cached gear waits forever. Every pre-Doom-fight session ends with a real
   decision at the bastion door: carry the blade into the dark, or leave it for whoever comes
   next. The player writes their own will. No system needs to prompt it; the geometry does.

---

## §6. Open taste questions — ONLY Adam can rule (6)

1. **Amend TIER-SCOPE's "not a retirement ceremony" line?** *Recommend YES* — keep the plateau as
   the default forever-mode, add the Crowning as the opt-in earned exit. The original ruling
   rejected a credits screen; this is a state promotion, which the ruling never considered.
   Without this re-rule, everything above stays parked.
2. **Does the crowned PC mandatorily retire to `U.souls`?** *Recommend YES.* The crown must cost
   the character or it's a trophy, not an ending (P5). The Wandering Souls roster finally gets
   its intended feed, and "play the epilogue" belongs to a NEW soul in the crowned world — which
   is better fiction anyway.
3. **Ship the Sundering (the dark twin) in v1?** *Recommend YES.* One flag + the same testament
   pass, and it's what makes the Crowning earnable rather than inevitable. A world that can only
   end well cannot end meaningfully. (This also finally gives `clock_fired` on the external front
   a world-scale consequence, which BUG-02's clock work makes reachable.)
4. **Doom-front designation: external-front-always, or Adam-authored per-realm?** *Recommend
   external-always for v1* (zero new tables, the geography framing already fits) — with the
   realm-flavored Doom roster listed as expansion material for the craft pass. Simple now,
   authorable later.
5. **Bastion claim price: deed-gated, gold-priced, or either?** *Recommend EITHER* (closed front
   OR tier-scaled gold) — deed-gating alone makes the bastion late-game-only and kills the
   "young PC founds a hall" fantasy; gold alone makes it a shop item. Either-gate keeps it earned
   by SOME currency and hands the economy its missing large sink.
6. **One bastion per world, or per plane?** *Recommend per WORLD (max one).* Per-plane-one is too
   scarce (punishes multi-world players); unlimited is clutter. Per-world keeps the claim a real
   decision and makes each world's legacy geography distinct — and the crowned-vault New Game+
   rule (§5.1) is what networks them.

---

## §7. Path to spec-lock (after Adam rules)

Once the six rulings land, this decomposes into four Sonnet-ready units on the standard rubric
(zero latent decisions / exact surfaces / RED-first harnesses / don't-touch lists — DESIGN-GUIDE
execution rubric):

- **Unit C1 — Doom-front flag + crown eligibility (S).** `p.isDoom` at `rollStartingState`;
  eligibility check after `front_closed`/`level_applied`; the banner affordance + prose twin.
  Harness: `dev/verify-crowning.mjs` RED-first (eligibility truth table, Sundering flag on
  `clock_fired`). Depends: TRANSITION-CONTRACT's clock work (the Doom clock must actually tick).
- **Unit C2 — the ritual + legend state (M).** The modal (bardo pattern), the Legend table
  (Adam authors the rows — PROVISIONAL vocabulary ships, his craft pass replaces), testament via
  `computeSaga`, `w.crowned`/`w.sundered` writes, souls banking, `U.legends` pool + the
  Distant Word pool widening. Depends: C1.
- **Unit B1 — bastion claim + vault (M).** `bastion_claim` event + handler; `"cached"` unpark in
  the `item_claimed` handler (flip ITEM-LEGACY §7.3's refusal); `"bastion"` claimant kind; the
  prose panel; deposit/withdraw affordances. Depends: **ITEM-LEGACY built first** (hard dep —
  the vault is its ninth lossState), TRANSITION-CONTRACT for arrival detection.
- **Unit B2 — the New Game+ heirloom echo (S).** The This-Is-Your-Life origin roll addition,
  crowned-vault draw, cross-world `item_claimed` pair, the heirloom thread. Depends: C2 + B1.
- **Explicitly NOT in the lock:** facilities/staff/orders (expansion, demand-driven), realm-
  flavored Doom rosters (craft pass), any bastion visual surface (rides the UI lane with its
  prose twin per the BLIND-PLAYABLE gate).

Sequencing note: all of this sits BEHIND tonight's spec-locked queue (SPICE-RAISE,
TRANSITION-CONTRACT, ITEM-LEGACY, etc.) and behind the freeze. Nothing here is fortnight work.

---

## Registry updates (Fable applies on Adam's ruling — this doc edits nothing shared)

- `docs/PARKING.md` — replace the Crowning entry's tail with: `→ full proposal drafted
  2026-07-06: docs/CROWNING-BASTION.md (AWAITS ADAM'S RULING — 6 questions; re-enters PARKING
  untouched if declined).` Append to the Bastion entry: `Proposal pairs it with the Crowning in
  docs/CROWNING-BASTION.md; v1 = claim/name/vault only (unparks ITEM-LEGACY's "cached" seam);
  facilities/staff/orders stay parked as the expansion tier.`
- `docs/NEXT-STEPS.md` — add under the deferred/post-freeze section: `☐ CROWNING-BASTION —
  proposal awaiting Adam's 6 rulings (docs/CROWNING-BASTION.md); on YES decomposes to units
  C1/C2/B1/B2 (deps: TRANSITION-CONTRACT, ITEM-LEGACY built first). Amends TIER-SCOPE's
  "plateau, not retirement ceremony" line if adopted.`
- `docs/README.md` (docs index) — add under design docs: `CROWNING-BASTION.md — the ending
  design: world-retirement ritual (Crowning/Sundering) + stronghold/legacy vault (Bastion)
  (type: design-proposal, PROPOSAL — awaits Adam).`
- `docs/TIER-SCOPE.md` — NO edit until Adam rules Q1; on YES, the "plateau & continue …not a
  retirement ceremony" sentence gains: `(amended 2026-07-XX: the plateau remains the default;
  the Crowning — docs/CROWNING-BASTION.md — is the opt-in earned exit.)`
- `docs/DESIGN.md` — no entry until a ruling exists (proposals don't enter the decision
  registry).
