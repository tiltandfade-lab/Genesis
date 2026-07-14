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

## §7. SPEC-LOCK — the four build units (Sonnet-ready)

The six rulings (frontmatter) are DECIDED and baked below; do **not** re-open them. This section
replaces the old "path to spec-lock" with the executable spec, one sub-section per unit
(C1/C2/B1/B2), each graded against the 8-point DESIGN-GUIDE rubric (`docs/DESIGN-GUIDE.md:24-38`):
zero latent decisions · exact surfaces (paths/symbols/signatures/payloads) · worked before→after ·
enumerated edge rulings · RED-first mutation checks · acceptance commands + expected numbers ·
don't-touch lists · blind-playable parity.

**The six baked rulings** (never re-litigate):

- **Q1 — AMEND TIER-SCOPE.** The Crowning is real; the plateau stays the DEFAULT forever-mode; the
  Crowning is the opt-in earned exit. (TIER-SCOPE sentence amendment is a Fable registry edit, not
  an executor edit — §Registry updates.)
- **Q2 — YES, crowning retires the PC to `U.souls`.** The crown costs you the character.
- **Q3 — YES, the Sundering (dark twin) ships in v1.** One flag + the same testament pass.
- **Q4 — external-front-always in v1.** The EXTERNAL pressure front is THE Doom; realm-flavored Doom
  rosters are a later craft-pass expansion (out of this lock).
- **Q5 — EITHER-gate the bastion claim price:** a closed front on the books OR a tier-scaled gold
  price.
- **Q6 — one bastion per WORLD (max one).**

**Global inference-cost invariant (all four units):** ZERO new model calls. Every ritual roll is a
deterministic click-roll (`rollDie`/`rollTbl`); every state write is a typed event or a lazy
engine check at an existing site; the DM's crowning/founding narration rides the turn it would
have narrated anyway. Any executor edit that introduces a model call is out of contract.

**Global dependency ordering (binding):**

| unit | size | hard deps | may build when |
|---|---|---|---|
| **C1** — Doom-flag + eligibility | S | TRANSITION-CONTRACT built (the Doom clock must actually tick — BUG-02 fix) | after TRANSITION-CONTRACT lands |
| **C2** — ritual + legend state | M | **C1** | after C1 |
| **B1** — bastion claim + vault | M | **ITEM-LEGACY built** (the vault is its ninth `lossState`, `"cached"`) + TRANSITION-CONTRACT (`move_node` arrival) | after ITEM-LEGACY **and** TRANSITION-CONTRACT land |
| **B2** — New Game+ heirloom echo | S | **C2 + B1** | after both |

All four sit BEHIND tonight's spec-locked queue (SPICE-RAISE, TRANSITION-CONTRACT, ITEM-LEGACY)
and behind the freeze. C1/C2 and B1 are independent lanes once their deps land (a crowned world
needs no bastion; a bastion needs no crown) — only B2 joins them.

**Verified current-state anchors** (opened against the tree 2026-07-06/07; line numbers are
pre-build — the executor re-anchors by symbol if they drift, never guesses):

| symbol | site |
|---|---|
| `rollPressure(kind,w)` — builds a front `{kind,...,doom,clock:{size:6,filled:0},real,bearing}` (NO `isDoom`) | `src/engine/world-gen.js:15-23` |
| `rollStartingState(w)` — `w.pressures=[rollPressure("internal",w),rollPressure("external",w)]` | `src/engine/world-gen.js:24-36` |
| `LEVEL_CEILING = 10` | `src/engine/advancement.js:13` |
| `applyEvent(w,e)` switch; `p=dmFoldPayload(w,e)`, `src=e.source` | `src/world/dm.js:1412-1421` |
| `case "front_closed"` — sets `tgt.obj.closed=true` via `findClockTarget(w,p.ledgerId||p.frontId)` | `src/world/dm.js:2693-2707` |
| `case "clock_fired"` — `findClockTarget`, `tgt.clock.filled=tgt.clock.size`, `wasFull` guard | `src/world/dm.js:2669-2691` |
| `case "level_applied"` | `src/world/dm.js:3027-3043` |
| `findClockTarget(w,clockId)` — resolves faction/front/pc clock targets; `.kind==="front"` for pressures | `src/world/dm.js:808` |
| `livingSheet(w)` → `{c,sh}` \| null | `src/world/dm.js:824` |
| `DM_EVENT_TYPES` array | `src/world/dm.js:1218` |
| `DM_EVENT_FIELDS` accept-map | `src/world/dm.js:1237-1309` |
| `dmDigest()` — `fronts[]` slice with `dmOnly:{truth,doom}` | `src/world/dm.js:270`, fronts at `:318-322` |
| `repuGrantEpithet(w,text)` + `epithet_grant` handler | `src/world/reputation.js:111`; `src/world/dm.js:2801` |
| `computeSaga(w,c)` / `refreshSaga(w,c)` (`SAGA_MAX=7`) | `src/world/saga.js:16,62` |
| `openBardo(c)` / `renderBardoPassage` / `closeBardo` — the modal pattern | `src/world/fate.js:37,47,66` |
| `#bardoModal` / `#bardoBody` DOM + `.show` class | `src/world/fate.js:44,67` |
| `spawnSuccessorOnPlane` / `farthestRegion` / `regionDistance` | `src/world/fate.js:75`; `src/world/state.js:150,146` |
| `rosterSouls()` (inits + returns `U.souls`); `soulFromCGEN(name)` (record shape) | `src/creator/roster.js:18,20` |
| `distantWordFactPool(w)` (ledger-drawn) / `distantWordPick` / `distantWordRoll` | `src/world/gap-wiring.js:132,148,161` |
| `codexAdd(w,rec)` (`kind`,`origin` mint-once) | `src/world/codex.js:66` |
| `charHistoryBody(w,cur)` — the `iact` affordance row (where the crown banner + bastion links live) | `src/world/render.js:1602-1619` |
| `renderShelf()` — world-card markup (crowned tint/badge site) | `src/world/render.js:1774-1790` |
| `destroyWorld(id)` — deletes, does NOT bank souls | `src/world/play.js:420-427` |
| `applyVision(w,ent,val)` — moves FACTION clocks only; a front is NOT a faction | `src/world/rebirth.js:93-105` |
| ITEM-LEGACY `LEGACY_LOSS_STATES` (incl. `"cached"`), `item_claimed` handler, §7.3 `"cached"` refusal | `docs/ITEM-LEGACY.md` §3, §2.1, §7.3 |
| TRANSITION-CONTRACT `move_node` (writes `currentNodeId`, `worldTurn` drift on arrival), `advance_clock` | `docs/TRANSITION-CONTRACT.md` §3.1, §3 move_node |
| jsdom harness bootstrap to copy (manifest loadOrder eval, STUBS, `applyMutates`, `seedWorld`) | `dev/playtest-bug-probes.mjs:20-90` |

Manifest count today: **109 modules** (103 `.js` in `loadOrder`). If ITEM-LEGACY lands first it
becomes **110**; each new module below bumps it by one — the acceptance gate states the exact
expected count per unit.

---

### §7.C1 — Doom-front flag + crown eligibility (size S)

**Goal.** Flag the external front as the world's Impending Doom at genesis; detect crown
eligibility deterministically after every `front_closed`/`level_applied`; flag the Sundering when
the Doom clock fires; surface eligibility as a prose banner affordance. No ritual yet (that's C2) —
C1 stops at "the world knows it can be crowned (or has sundered)" and shows it.

**New module.** `src/engine/crowning.js` — classic `<script>`, shared global scope. Registered in
`manifest.json` (id `engine.crowning`, `type:"logic"`, `layer` = same as `engine.advancement`) and
a `<script>` tag in `genesis.html` **immediately after `src/engine/advancement.js`** in both
`loadOrder` and tag order (it reads `LEVEL_CEILING`). Run `python3 build/check-manifest.py` after
(expected `RESULT: OK`, **110 modules** if ITEM-LEGACY already landed, else **+1** over the base at
build time — the executor records the base and base+1).

**Owns (manifest `owns`, exhaustive):** `doomFront`, `crownEligible`, `CROWN_HOW_VERBS`.

**callTimeDeps:** `livingSheet`, `LEVEL_CEILING`, `addLedger`, `reveal`.

#### C1.1 — `p.isDoom` at genesis (worked before→after)

`isDoom` is a flag set on the EXTERNAL front, at `rollStartingState` time, not a new roll or table
(Q4 baked). Set it in `rollStartingState` (not inside `rollPressure`, so an internal front rolled
elsewhere never accidentally claims it, and so it reads as a world-assembly decision).

**Before** (`src/engine/world-gen.js:29`, verbatim):

```js
  w.pressures=[rollPressure("internal",w),rollPressure("external",w)];
```

**After:**

```js
  w.pressures=[rollPressure("internal",w),rollPressure("external",w)];
  // CROWNING §3.1/Q4 — the EXTERNAL front is the world's Impending Doom (a doom with a geography).
  // A flag, not a roll: the revelation is DM-paced (P4 slow drip), the flag is engine-state from day 1.
  (w.pressures.find(p=>p.kind==="external")||{}).isDoom=true;
```

Ruling: exactly one front carries `isDoom` per world (there is exactly one external front today).
If a future expansion rolls multiple external fronts, the FIRST external in array order is the
Doom — but that is out of this lock (Q4: external-always, single). Do not generalize now.

#### C1.2 — `doomFront(w)` + `crownEligible(w)` (exact contracts)

In `src/engine/crowning.js`:

```js
const CROWN_HOW_VERBS = ["defeated","unraveled","bargained"];   // free-text `how` vocabulary (§3.2);
    // PROVISIONAL prose only — the engine never validates `how` against this; it is documentation
    // for the DM's front_closed `how` field. "waited"/"ignored" are NOT crowning verbs (§3.5).

// the world's Impending Doom front (null if none / legacy save with no external front)
function doomFront(w){
  if(!w || !Array.isArray(w.pressures)) return null;
  return w.pressures.find(p=>p && p.isDoom) || null;
}

// Deterministic, zero model calls. Returns a structured verdict — never throws, never mutates.
//   { eligible:boolean, reasons:{doomClosed,atCeiling,alive}, doom:<front|null>, blocked:<string|null> }
function crownEligible(w){
  const doom = doomFront(w);
  const t = (typeof livingSheet==="function") ? livingSheet(w) : null;
  const alive = !!t;
  const atCeiling = alive && (t.sh.level||1) >= (typeof LEVEL_CEILING==="number"?LEVEL_CEILING:10);
  const doomClosed = !!(doom && doom.closed);
  const sundered = !!(w && w.sundered);       // a sundered world is uncrownable forever (§3.5)
  const crowned  = !!(w && w.crowned);        // already crowned — not re-eligible
  const eligible = doomClosed && atCeiling && alive && !sundered && !crowned;
  const blocked = sundered ? "sundered" : (crowned ? "crowned" : null);
  return { eligible, reasons:{ doomClosed, atCeiling, alive }, doom, blocked };
}
```

**Ruling — "the attempt was survived" (thesis §3.2 clause 3):** operationalized as `alive` (a
living sheet exists at the moment eligibility is read). If the Doom-fight kills the PC, no living
sheet → not eligible; the D&R loop runs; a successor must re-close the front. This needs no new
state — `livingSheet` already encodes it. There is NO separate "survived" flag.

**Ruling — no attrition crown (§3.5):** `crownEligible` keys off `doom.closed`, which
`front_closed` sets regardless of `how`. The "closes only through confrontation" rule is a
DM-CHARTER standing instruction carried in the digest doom line (C2 digest slice), NOT an engine
gate here — the engine cannot read intent. Do not add a `how`-enum check to `crownEligible`; a
mis-emitted `how:"waited"` on a Doom front is a DM-contract violation caught in review, not an
engine refusal. (This keeps C1 from re-litigating the free-text `how` field ITEM-LEGACY/EVENT
already treat as free text.)

#### C1.3 — Sundering flag on `clock_fired` (worked before→after)

When the Doom front's clock FILLS before it is closed, the world sunders. Hook the EXISTING
`clock_fired` handler (`src/world/dm.js:2669`). The handler already computes `wasFull` and resolves
`tgt` via `findClockTarget`; a front's `tgt.kind==="front"` and `tgt.obj` is the pressure object.

**Before** (`src/world/dm.js:2680-2681`, verbatim — the faction-outcome tail of `clock_fired`):

```js
      // WORLD-TURN §3: same faction-outcome roll as clock_advanced's fired transition (kept in sync).
      if(!wasFull && tgt && tgt.kind==="faction" && typeof turnFactionOutcome==="function") turnFactionOutcome(w, tgt.obj.name);
```

**After** (insert the Sundering write directly after that faction line, still inside the case):

```js
      // WORLD-TURN §3: same faction-outcome roll as clock_advanced's fired transition (kept in sync).
      if(!wasFull && tgt && tgt.kind==="faction" && typeof turnFactionOutcome==="function") turnFactionOutcome(w, tgt.obj.name);
      // CROWNING §3.5 — the Doom front's clock filling (a fresh transition, wasFull-guarded) SUNDERS
      // the world: the dark twin of the Crowning. Flag only in C1 (the testament pass rides C2's
      // crownWorld path via markSundered — see §7.C2). Uncrownable forever (crownEligible reads it).
      if(!wasFull && tgt && tgt.kind==="front" && tgt.obj && tgt.obj.isDoom && !w.sundered && !w.crowned){
        w.sundered = { day:(typeof clockOf==="function"?clockOf(w).day:null), frontId:p.clockId||null };
        addLedger(w,"canon",{kind:"sundered",frontId:p.clockId||null,day:w.sundered.day,source:src},
          "✧✦ The Doom came due. The world is sundered — its ending was lost.");
        if(typeof reveal==="function") reveal(w,'powers');
      }
```

Ruling: C1 writes only the FLAG `w.sundered = {day, frontId}` and the ledger line. The full
sundered-legend testament (the `computeSaga` pass + `U.legends` cautionary entry) is C2's
`markSundered` (§7.C2.5), gated behind C1 so the two ship coherently. A world can be sundered with
no legend object until C2 lands — the flag alone is enough to make it uncrownable, which is C1's
whole job.

**Ruling — the clock must actually reach full:** this is exactly why C1 depends on
TRANSITION-CONTRACT (BUG-02 — the clock never ticks today). Without it, `clock_fired` on the Doom
front is only ever DM-declared, never detected; with it, the front clock advances on real time and
can fire on its own. Do not build a Doom-specific timer — reuse the front clock TRANSITION-CONTRACT
makes live.

#### C1.4 — the eligibility banner (blind-playable prose affordance)

Surface eligibility in `charHistoryBody` (`src/world/render.js:1602`), twin to the existing
`⚰ Recover <name>'s effects` link in the same `iact` row (render.js:1614). No new visual — the
banner is a prose `<span class="iact">` (C2 wires its `onclick` to open the ritual; C1 renders it
INERT with a title, since the ritual modal is C2).

**Before** (`src/world/render.js:1611-1614`, the affordance row, verbatim):

```js
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px">
      <span class="iact" style="margin-left:0" onclick="handToDM()">✦ Hand to your DM</span>
      <span class="iact" onclick="killCharacter('${cur.id}')">They fall…</span>
      ${corpses.map(d=>`<span class="iact" onclick="recoverFallen('${d.id}')">⚰ Recover ${escHtml(d.name)}'s effects</span>`).join("")}</div>
```

**After** (add the crown affordance to the same row; `_ce` computed above the return):

```js
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px">
      <span class="iact" style="margin-left:0" onclick="handToDM()">✦ Hand to your DM</span>
      <span class="iact" onclick="killCharacter('${cur.id}')">They fall…</span>
      ${corpses.map(d=>`<span class="iact" onclick="recoverFallen('${d.id}')">⚰ Recover ${escHtml(d.name)}'s effects</span>`).join("")}
      ${(typeof crownEligible==="function" && crownEligible(w).eligible)?`<span class="iact" title="This world's Doom is broken and you stand at the ceiling — it can be crowned.">⟡ The world can be crowned</span>`:""}
      ${(w.crowned)?`<span class="iact" style="opacity:.7" title="Crowned — passed into legend.">⟡ Crowned — Day ${w.crowned.day}</span>`:""}
      ${(w.sundered)?`<span class="iact" style="opacity:.7" title="The Doom came due — this world is sundered.">✧✦ Sundered — Day ${w.sundered.day}</span>`:""}</div>
```

Ruling — C1 ships the `⟡ The world can be crowned` span WITHOUT an `onclick` (inert label +
`title`); C2's edit swaps in `onclick="openCrowning()"`. This keeps C1 independently shippable and
testable (the harness asserts the string appears, not that a modal opens). The crowned/sundered
badges are pure prose state read-outs — the BLIND-PLAYABLE twin is the text itself.

#### C1.5 — edge rulings (C1)

1. **Legacy save, no `isDoom` on any front** (world forged before this unit) → `doomFront` returns
   `null`; `crownEligible` returns `eligible:false, reasons.doomClosed:false`. No migration: a
   pre-spec world simply can't be crowned until re-forged. **Do NOT edit `migrateWorld`** to
   backfill `isDoom` — a running world's external front picking up a Doom mid-life would retro-cast
   its whole campaign; the flag is a genesis-time decision only. (Enumerated so no executor
   "helpfully" backfills it.)
2. **`front_closed` on a NON-Doom front** → `doom.closed` unaffected; `crownEligible` still false.
   Only the flagged external front's closure counts.
3. **PC below ceiling closes the Doom** → `atCeiling:false`; not eligible. Level to 10, then
   eligible (checked live every render — no event needed to "re-check"; `crownEligible` is a pure
   read).
4. **Doom clock fires the SAME beat it would close** → `clock_fired` sets `w.sundered`
   (wasFull-guarded, one-shot); a later `front_closed` on an already-sundered world sets
   `doom.closed=true` but `crownEligible` returns `blocked:"sundered"` (sundered wins — the world
   already ended, darkly). Order-independent by construction.
5. **Already-crowned world** (C2 has run) → `crownEligible` returns `eligible:false,
   blocked:"crowned"`; the banner shows the crowned badge instead. No double-crown.
6. **No living PC** (between death and successor) → `alive:false`; not eligible; banner absent.

#### C1.6 — acceptance (C1): `dev/verify-crowning.mjs`, RED-first, mutation-asserting

New harness `dev/verify-crowning.mjs`, jsdom boot copied from `dev/playtest-bug-probes.mjs:20-90`
(manifest loadOrder eval; **EXPOSE list adds `CROWN_HOW_VERBS`** — a top-level `const` does not
auto-attach to `window` under jsdom, same lesson as ITEM-LEGACY §8; `function`-declared
`doomFront`/`crownEligible`/`rollStartingState`/`applyEvent` are reachable as `win.<name>`
without EXPOSE). Add `<div id="bardoModal"><div id="bardoBody"></div></div>` to the boot DOM (C2
reuses this harness). Use the `applyMutates` guard (probes:74-81) for every event check — assert
the ok-flag AND that the watched slice's serialized value MOVED.

**RED-FIRST proof (run on the branch's first commit, before any engine edit):**

```
node dev/verify-crowning.mjs
✗ crowning: 2 passed, 9 failed
```

The 2 passes are the pre-existing baselines (B1–B2 below). The 9 failures prove absence:
`rollStartingState` sets no `isDoom` (RED), `crownEligible`/`doomFront` are `undefined` (RED),
`clock_fired` on the external front sets no `w.sundered` (RED). *(This RED line was reproduced
against the un-built tree during spec authoring — `C1 isDoom on external front → undefined (RED)`;
`C1 typeof crownEligible → undefined (RED)`.)*

**GREEN gate (after building):**

```
node dev/verify-crowning.mjs
✓ crowning: 11 passed, 0 failed
```

| # | check | mutation assertion |
|---|---|---|
| B1 | baseline: `rollStartingState` still produces `w.pressures.length===2`, one internal + one external | — |
| B2 | baseline: `crownEligible` never throws on a bare `{}` world → returns `{eligible:false}` | — |
| 3 | after `rollStartingState`, exactly one front has `isDoom===true` AND it is the external | isDoom appears on external |
| 4 | `CROWN_HOW_VERBS` length 3, includes `"defeated"` | — |
| 5 | `doomFront(w)` returns the external front; `null` on a world with no external | identity match |
| 6 | not eligible when Doom open (seed L10 PC, Doom NOT closed) → `eligible:false, reasons.doomClosed:false` | — |
| 7 | eligible when Doom closed AND L10 AND alive → `eligible:true` after setting `doom.closed=true` + `sh.level=10` | eligible moves false→true |
| 8 | not eligible when Doom closed but PC below ceiling → `atCeiling:false` | — |
| 9 | `applyMutates`: `clock_fired {clockId:<doom clock id>}` on the Doom front sets `w.sundered.day` (before undefined → after set) | `w.sundered` appears |
| 10 | sundered world → `crownEligible.blocked==="sundered"`, `eligible:false` even with Doom closed + L10 | eligible stays false |
| 11 | crowned-stub (`w.crowned={day:5}`) → `crownEligible.blocked==="crowned"`, banner string present in `charHistoryBody` render (assert the `⟡ Crowned` substring) | blocked value present |

**Regression gates (C1):**

| command | expected |
|---|---|
| `python3 build/check-manifest.py` | `RESULT: OK` — 110 modules (base+1; record the base) |
| `node dev/verify-crowning.mjs` | `✓ crowning: 11 passed, 0 failed` |
| `node dev/verify-dm-events.mjs` | 0 failed (count = branch base; `clock_fired` contract only WIDENED — the front branch is additive, no existing assertion loosened) |
| `node dev/playtest-bug-probes.mjs` | identical PRESENT/RESOLVED table to base (no probe flips) |

#### C1.7 — don't-touch (C1)

- Generated files (`tables.js/json`, `data/bestiary.js`, `data/realm-bestiary.js`,
  `data/class-progression.js`, `data/wiki.js`, `data/items.js`) — untouched; C1 needs no table.
- `migrateWorld` (`src/world/state.js:157`) — NO backfill of `isDoom` (§C1.5 edge 1).
- `rollPressure` — leave alone; the flag is set in `rollStartingState`, not per-pressure.
- The ritual/modal/legend — that's C2; C1's banner span is inert.
- `dev/dm-bridge.py`, `docs/DM-BRIDGE.md`, `.dm/` — never mid-anything.
- Adam's hand-authored tables — none touched.

---

### §7.C2 — the ritual + legend state (size M) · depends: C1

**Goal.** The player-initiated Crowning ceremony: a bardo-pattern modal with three click-rolls + a
computed testament; the `w.crowned` state write; the crowned PC banked to `U.souls` (Q2); the
`U.legends` universe pool + Distant Word widening (§3.4); and the Sundering's testament pass
(`markSundered`, wired from C1's flag). The Legend table ships PROVISIONAL (Adam authors the rows
at his craft pass).

**New module.** `src/world/crowning-ritual.js` — classic `<script>`, shared global scope.
Registered in `manifest.json` (id `world.crowning-ritual`, `type:"logic"`) + a `<script>` tag in
`genesis.html` **immediately after `src/world/fate.js`** in both `loadOrder` and tag order (it
reuses the bardo-modal DOM + `computeSaga` + souls). Run `check-manifest.py` after (expected
`RESULT: OK`, **+1** over the C1 tree).

**New data file.** `data/crown-legend.js` — classic `<script>`, the PROVISIONAL Legend table.
Registered in `manifest.json` (id `data.crown-legend`, `type:"data"`) + tag in `genesis.html` in
the `data/*.js` block (order-independent among data; before `world.crowning-ritual`). Owns
`CROWN_LEGEND`.

**`src/world/crowning-ritual.js` owns (manifest, exhaustive):** `openCrowning`, `renderCrowning`,
`crownRoll`, `crownWorld`, `crownRetireToSoul`, `markSundered`, `legendRecord`, `U_LEGENDS_CAP`.

**callTimeDeps:** `crownEligible`, `doomFront`, `computeSaga`, `repuGrantEpithet`, `rollTbl`,
`rollDie`, `addLedger`, `clockOf`, `saveU`, `activeWorld`, `rosterSouls`, `escHtml`, `reveal`,
`spawnSuccessorOnPlane`, `toast`, `renderWorld`, `SAGA_MAX`.

#### C2.1 — the Legend table (PROVISIONAL data)

`data/crown-legend.js`:

```js
/* GENESIS MODULE — data/crown-legend.js — the Crown Legend table (CROWNING §3.3, roll 1).
   PROVISIONAL vocabulary — Adam replaces these rows at his craft pass (the shape is locked; the
   prose is a placeholder). Spice-graded d8: how the plane will remember a crowned world.
   Classic <script>, shared global scope. */
const CROWN_LEGEND = [
  { band:"grounded", text:"a golden age — remembered plainly, and fondly" },
  { band:"grounded", text:"a hard peace, bought and kept" },
  { band:"notable",  text:"a name spoken with respect three regions over" },
  { band:"notable",  text:"the tale that ends the way the world should have ended" },
  { band:"strange",  text:"a warning told to children who will never see it" },
  { band:"strange",  text:"a song sung only at the tide-turn, in a tongue half-lost" },
  { band:"mythic",   text:"a legend the other worlds measure their own dooms against" },
  { band:"mythic",   text:"a light that still reaches worlds it never touched" },
];
```

Ruling: the roll is `rollTbl(CROWN_LEGEND)` if `rollTbl` accepts a raw array here, else
`CROWN_LEGEND[rollDie(CROWN_LEGEND.length)-1]` — the executor uses whichever matches `rollTbl`'s
signature at build time (grep `function rollTbl`; if it requires an `SS`-shaped `{rows/table}`
object, use the `rollDie` index form). The result object `{band,text}` is the crowned world's
epithet-of-record. This is the ONLY new table in the entire proposal (depth-over-breadth).

#### C2.2 — the ritual modal (bardo pattern)

`openCrowning()` mirrors `openBardo` (`src/world/fate.js:37`) — reuses `#bardoModal`/`#bardoBody`
+ `.show`, prose-first, click-revealed, ARIA-live (the modal already carries the live-region
attributes bardo uses). It does NOT roll on open; it renders the three roll buttons, each firing
`crownRoll(step)` which rolls one die, reveals its fragment, and enables the next. The final
button commits via `crownWorld()`.

```js
function openCrowning(){
  const w=activeWorld(); if(!w) return;
  const v=crownEligible(w);
  if(!v.eligible){ toast(v.blocked==="sundered"?"This world is sundered — it cannot be crowned."
    : v.blocked==="crowned"?"This world is already crowned." : "The world is not ready to be crowned."); return; }
  GS.CROWN={ step:0, legend:null, epithet:null, testament:null, succession:null };
  renderCrowning(w);
  document.getElementById("bardoModal").classList.add("show");
}
```

Ruling — GS.CROWN is transient ritual state (CLAUDE.md: new mutable state goes in GS). It never
persists; `crownWorld` reads it, writes `w.crowned`, then clears it. `renderCrowning` is the
step-by-step reveal (executor writes the HTML the same shape as `renderBardoPassage`,
fate.js:47 — a `<h3>The Crowning</h3>`, the gap/legend/epithet/testament reveals, and one primary
button per un-taken step; the final step's button is `onclick="crownWorld()"`). Blind-playable:
the modal IS its own prose twin (bardo precedent, §3.6).

#### C2.3 — the three rolls + the testament (exact)

`crownRoll(step)` resolves one deterministic roll into `GS.CROWN`:

- **step 1 — Legend:** `GS.CROWN.legend = <CROWN_LEGEND roll>` (§C2.1). One d8.
- **step 2 — Crown epithet:** the ritual sets `w.dm=w.dm||{}; w.dm.needsEpithet={deedRef:"crowning",
  day:clockOf(w).day};` then the DM's crowning narration emits the existing `epithet_grant` event
  (the epithet TEXT is DM-authored prose, same round-trip as every epithet — `repuGrantEpithet`,
  reputation.js:111). **Ruling:** the crown epithet is NOT rolled from a table — it is the DM's
  capstone naming, captured through the built `epithet_grant` machinery. `crownRoll(2)` only ARMS
  `needsEpithet` and records `GS.CROWN.epithet="(awaiting your DM's naming)"` as a placeholder;
  `crownWorld` reads the PC's `epithets[]` last entry if present, else stores the placeholder.
  (This keeps zero new reward currency — the crown IS an epithet, §3.3.)
- **step 3 — Succession:** `GS.CROWN.succession = <one testament entry index>` via
  `rollDie(testament.length)-1` over the computed testament (below) — which entry becomes the
  standing legend-hook successors can hear/inherit from (feeds B2 + Distant Word).

The **Testament is computed, not rolled:** `GS.CROWN.testament = computeSaga(w, <crowning PC>)`
(saga.js:16 — the top-7 entities). `crownRoll(3)` computes it (so the succession roll has a list to
pick from) if not already computed.

#### C2.4 — `crownWorld()` — the state write (worked before→after vs `destroyWorld`)

`crownWorld` is the additive, non-destructive answer to `destroyWorld` (play.js:420, which just
deletes + never banks souls — the live gap §2 named). It:

```js
function crownWorld(){
  const w=activeWorld(); if(!w) return;
  const v=crownEligible(w); if(!v.eligible){ toast("No longer eligible."); return; }
  const c=(w.characters||[]).filter(x=>x.status==="living").slice(-1)[0]; if(!c) return;
  const cr=GS.CROWN||{}; const day=(typeof clockOf==="function")?clockOf(w).day:null;
  const testament=(cr.testament&&cr.testament.length)?cr.testament:computeSaga(w,c);
  const epithetRec=(c.epithets&&c.epithets.length)?c.epithets[c.epithets.length-1]:null;
  const succIdx=(typeof cr.succession==="number")?cr.succession:0;
  const legend=cr.legend||{band:"grounded",text:"remembered"};
  const doom=doomFront(w);
  // 1) the additive world state write (§3.3)
  w.crowned = { day, by:{ pcId:c.id, name:c.name, epithet:epithetRec?epithetRec.text:null },
    legend, testament:testament.map(e=>({key:e.key,type:e.type,name:e.name})),
    succession:(testament[succIdx]?{key:testament[succIdx].key,name:testament[succIdx].name}:null),
    how:(doom&&doom.closedHow)||null };
  addLedger(w,"canon",{kind:"crowned",by:c.name,legend:legend.text,day},
    "⟡ "+c.name+" crowned "+w.name+" — "+legend.text+". The world passes into legend.");
  // 2) the crowned PC retires to the roster (Q2) — the souls feed destroyWorld never wired
  crownRetireToSoul(w,c);
  // 3) the universe legend pool + Distant Word widening (§3.4)
  legendRecord(w);
  GS.CROWN=null;
  if(typeof reveal==="function") reveal(w,'powers');
  saveU(U);
  document.getElementById("bardoModal").classList.remove("show");
  // 4) the crown costs the character — a NEW soul inherits the plane (epilogue play is a new PC, §3.4)
  if(typeof spawnSuccessorOnPlane==="function") spawnSuccessorOnPlane(); else if(typeof renderWorld==="function") renderWorld();
}
```

**`crownRetireToSoul(w,c)`** — banks the LIVING crowned character into `U.souls` (Q2). It mirrors
`soulFromCGEN`'s record shape (roster.js:20) but sources from the live character, not `GS.CGEN`,
and stamps the crown:

```js
function crownRetireToSoul(w,c){
  const roster=(typeof rosterSouls==="function")?rosterSouls():(U.souls=U.souls||[]);
  const sh=c.sheet||{};
  roster.push({ id:(typeof uid==="function"?uid():"soul-"+Date.now()), name:c.name,
    pronouns:c.pronouns||"they", bornAt:c.bornAt||Date.now(),
    sheet:JSON.parse(JSON.stringify(sh)),           // deep copy — the world char stays put (retired, not moved)
    life:c.life||null, headline:c.headline||c.spark||"",
    crowned:{ world:w.name, worldId:w.id, day:(w.crowned&&w.crowned.day)||null,
      legend:(w.crowned&&w.crowned.legend&&w.crowned.legend.text)||null,
      epithet:(w.crowned&&w.crowned.by&&w.crowned.by.epithet)||null } });
  c.status="crowned";   // the world character is retired IN PLACE (not deleted) — a new status value
  addLedger(w,"canon",{kind:"retired",char:c.id,name:c.name},
    "✧ "+c.name+" walks off into legend — a Wandering Soul now, the crown on their record.");
  return roster[roster.length-1];
}
```

**Ruling — `c.status="crowned"` is a NEW status value** (alongside `living`/`fallen`). The crowned
character is retired in place: it stays in `w.characters` (the world stays walkable, its history
intact) but is no longer `living`, so `livingSheet(w)` returns null → `crownEligible` false →
epilogue play requires a new soul (§3.4). Grep `status==="living"` / `status==="fallen"` — no
existing site treats an unknown status as living, so adding `"crowned"` is safe (a crowned char
simply isn't picked up by living/fallen filters; verify `corpsesAt` and the shelf `living`/`fallen`
counts, render.js:1778 — a crowned char counts as neither, which is correct). Do NOT repurpose
`"fallen"` (that would mint a corpse) or delete the character (that would lose the world's history).

#### C2.5 — `markSundered(w)` + `legendRecord(w)` — the shared legend pass

The Sundering (C1 flags `w.sundered`) gets the SAME testament pass, inverted valence (§3.5). C1's
`clock_fired` write flags it; C2 adds `markSundered` and calls it from C1's flag site via a
`typeof` guard so the two units compose without C1 re-editing.

**C2 edits C1's `clock_fired` Sundering block** (§C1.3) to add the testament pass:

**Before** (the C1 block, its last line):

```js
        if(typeof reveal==="function") reveal(w,'powers');
      }
```

**After:**

```js
        if(typeof reveal==="function") reveal(w,'powers');
        if(typeof markSundered==="function") markSundered(w);   // CROWNING §3.5 — the cautionary legend pass (C2)
      }
```

```js
function markSundered(w){
  if(!w||!w.sundered||w.sundered.legend) return;   // idempotent — one pass
  const c=(w.characters||[]).filter(x=>x.status==="living").slice(-1)[0]||(w.characters||[]).slice(-1)[0]||null;
  const testament=c?computeSaga(w,c):[];
  w.sundered.legend={ band:"dark", text:"the world where the Doom won" };
  w.sundered.testament=testament.map(e=>({key:e.key,type:e.type,name:e.name}));
  addLedger(w,"canon",{kind:"sundered-legend",day:w.sundered.day},
    "✧✦ The Sundering is sealed — a cautionary legend now, told against every world's Doom.");
  legendRecord(w);   // same universe-pool feed as the crown, inverted valence
}
```

**`legendRecord(w)` + `U.legends`** — a crowned OR sundered world contributes its testament to a
small universe-level pool so a PC in a fresh region can hear a distorted rumor of a world someone
ELSE finished (§3.4). Additive to `U`:

```js
const U_LEGENDS_CAP = 40;   // bound the pool (oldest evicted) — the plane remembers, but not infinitely
function legendRecord(w){
  U.legends=U.legends||[];
  const crowned=!!w.crowned, cw=crowned?w.crowned:w.sundered; if(!cw) return;
  U.legends.push({ worldId:w.id, worldName:w.name, kind:crowned?"crowned":"sundered",
    day:cw.day, legend:cw.legend?cw.legend.text:null,
    hook:cw.succession?cw.succession.name:(cw.testament&&cw.testament[0]?cw.testament[0].name:null),
    testament:(cw.testament||[]).slice(0, (typeof SAGA_MAX==="number"?SAGA_MAX:7)) });
  while(U.legends.length>U_LEGENDS_CAP) U.legends.shift();
}
```

(`SAGA_MAX` is the saga.js const — added to callTimeDeps + EXPOSE; testament is already capped at 7
by `computeSaga` regardless.)

#### C2.6 — Distant Word widening (§3.4)

`distantWordFactPool(w)` (gap-wiring.js:132) draws only from the CURRENT world's ledger. Widen it
to also surface OTHER worlds' legends. **Ruling — do NOT rewrite `distantWordFactPool`'s ledger
draw** (it binds distortion rows to verifiable cross-node facts, a load-bearing invariant). Instead
add legends as an ADDITIONAL, clearly-tagged source at the pick site:

**Before** (`src/world/gap-wiring.js:148-152`, `distantWordPick`, verbatim):

```js
function distantWordPick(w){
  const pool=distantWordFactPool(w);
  if(!pool.length) return null;
  return pool[rollDie(pool.length)-1];
}
```

**After:**

```js
function distantWordPick(w){
  const pool=distantWordFactPool(w);
  // CROWNING §3.4 — other worlds' crowned/sundered legends widen the rumor pool (cross-region gossip
  // with a mechanical source). Each legend enters as a synthetic pool entry the distortion row can bind
  // to; a legend from THIS world is excluded (it isn't "distant"). Zero model calls — a deterministic pick.
  const legends=(U.legends||[]).filter(L=>L.worldId!==w.id).map(L=>({
    id:"legend:"+L.worldId, type:"legend", day:L.day,
    text:(L.kind==="crowned"?"A distant world was crowned — "+ (L.legend||"remembered")
      :"A distant world was sundered — "+(L.legend||"the Doom won"))+(L.hook?(" (of "+L.hook+")"):""),
    data:{ nodeId:null, legend:true } }));
  const full=pool.concat(legends);
  if(!full.length) return null;
  return full[rollDie(full.length)-1];
}
```

Ruling — a legend entry carries `data.nodeId:null` and `data.legend:true`; `distantWordRoll`
(gap-wiring.js:161) already tolerates `fact.nodeId` being null (it reads `picked.data&&picked.data.nodeId`).
No change to `distantWordRoll` is needed. The legend text IS a real fact (a real crowned/sundered
world), so binding a Distortion row to it satisfies the "never invent canon" invariant — the
distortion is the TELLING, the crowning is the truth.

#### C2.7 — C2 wires the C1 banner live

Swap C1's inert crown span (§C1.4) to open the ritual:

**Before:** `<span class="iact" title="…">⟡ The world can be crowned</span>`
**After:** `<span class="iact" onclick="openCrowning()" title="…">⟡ The world can be crowned</span>`

And the crowned shelf badge (`renderShelf`, render.js:1782) — add a crowned tint/badge:

**Before** (`src/world/render.js:1782`, the `liveBadge` line):

```js
    const liveBadge=w.sessionLive?'<div class="badge" style="background:var(--gold,#c9a14a);color:#1a140c">session live</div>':(U.activeWorldId===id?'<div class="badge">active</div>':'');
```

**After** (add a crowned/sundered badge, prose-twinned):

```js
    const liveBadge=w.sessionLive?'<div class="badge" style="background:var(--gold,#c9a14a);color:#1a140c">session live</div>':(U.activeWorldId===id?'<div class="badge">active</div>':'');
    const crownBadge=w.crowned?'<div class="badge" title="Crowned — passed into legend.">⟡ Crowned</div>':(w.sundered?'<div class="badge" title="Sundered — the Doom came due.">✧✦ Sundered</div>':'');
```

and interpolate `${crownBadge}` into the card markup directly after `${liveBadge}` (render.js:1784).

#### C2.8 — edge rulings (C2)

1. **Crown initiated, PC dies mid-modal** (impossible via UI — the modal blocks play — but defend):
   `crownWorld` re-checks `crownEligible` and bails with a toast if no longer eligible. No partial
   crown.
2. **`epithet_grant` never arrives** (DM offline / player closes) → `w.crowned.by.epithet=null`;
   the crown still stands (the epithet is garnish, not a gate). The `needsEpithet` request stays
   armed for the DM's next turn per the existing epithet round-trip.
3. **Testament shorter than 7** (a short life) → `computeSaga` already pads/returns fewer; the
   succession roll picks over the actual length; `succession:null` if empty.
4. **A world both crowned AND sundered** — impossible: `crownEligible` returns false when
   `w.sundered` is set (blocked), and `markSundered` returns early if `w.crowned`. C1's flag write
   guards `!w.crowned`. Mutually exclusive by construction; assert it in the harness.
5. **`U.legends` from another world referenced after that world is destroyed** (`destroyWorld`) →
   the legend entry persists in `U.legends` (a legend outlives its world — that is the point). It
   carries `worldName` for prose; a broken `worldId` link is fine (Distant Word reads `text`, not
   the world). Ruling: `destroyWorld` does NOT prune `U.legends` (out of scope; a crowned world
   shouldn't be destroyed anyway — it's the shelf's keepsake).
6. **Retire-to-soul deep-copy** — `crownRetireToSoul` deep-copies the sheet so the roster soul and
   the retired world character don't alias (a later render mutating one must not bleed). Verified:
   `soulFromCGEN` builds a fresh record too.
7. **Sundering with no living PC** (the Doom fired while the PC lay dead in the bardo — the §5.3
   showcase) → `markSundered` falls back to the last character for the testament (`||slice(-1)`);
   the world sunders regardless. This is the emotional-argument case (§5.3) and it must not crash on
   a null living sheet.

#### C2.9 — acceptance (C2): extends `dev/verify-crowning.mjs`

Same harness (C1 created it). **EXPOSE adds `CROWN_LEGEND`, `U_LEGENDS_CAP`, `SAGA_MAX`.** The boot
DOM already has `#bardoModal`/`#bardoBody` (C1 added it). Stub `spawnSuccessorOnPlane` (it calls
`rollCharacter`/UI) so `crownWorld` runs headless without opening creation: add
`spawnSuccessorOnPlane` to the STUBS list. `win.prompt` unused here.

**RED-FIRST proof** (C2 checks added, C2 code absent):

```
node dev/verify-crowning.mjs
✗ crowning: 11 passed, 8 failed
```

The 11 C1 checks pass; the 8 new C2 checks fail (`crownWorld`/`crownRetireToSoul`/`markSundered`/
`CROWN_LEGEND` all `undefined`). *(RED reproduced during authoring: `C2 typeof crownWorld →
undefined (RED)`; `C2 typeof CROWN_LEGEND → undefined`.)*

**GREEN gate:**

```
node dev/verify-crowning.mjs
✓ crowning: 19 passed, 0 failed
```

The 8 new checks (12–19):

| # | check | mutation assertion |
|---|---|---|
| 12 | `CROWN_LEGEND` length 8, every row has `band`+`text` | — |
| 13 | `crownWorld` on an eligible world writes `w.crowned.by.pcId===c.id`, `w.crowned.legend.text` set, `w.crowned.testament.length<=7` | `w.crowned` appears (before undefined) |
| 14 | crowned PC banked: `U.souls` length +1, last soul `.crowned.world===w.name`, deep-copy (mutating soul.sheet doesn't touch `w.characters` sheet) | roster length moves |
| 15 | crowned char retired in place: `w.characters` still contains it, `status==="crowned"`, `livingSheet(w)` now null | status moves living→crowned |
| 16 | `crownEligible` false after crown (`blocked:"crowned"`) | eligible moves true→false |
| 17 | `legendRecord`: `U.legends` length +1, entry `kind:"crowned"`, `testament` present; cap holds (push 41, length stays 40) | pool grows, cap enforced |
| 18 | `markSundered` (call directly on a `w.sundered`-flagged world): `w.sundered.legend.text` set, `U.legends` +1 `kind:"sundered"`; idempotent (2nd call no-ops, length unchanged) | sundered.legend appears, idempotent |
| 19 | `distantWordPick` surfaces a foreign legend: seed `U.legends=[{worldId:"other",...}]`, empty ledger pool → pick returns the legend entry (`data.legend===true`); a legend with `worldId===w.id` is excluded | legend entry returned |

**Regression gates (C2):**

| command | expected |
|---|---|
| `python3 build/check-manifest.py` | `RESULT: OK` — C1-tree +2 (module + data file) |
| `node dev/verify-crowning.mjs` | `✓ crowning: 19 passed, 0 failed` |
| `node dev/verify-dm-events.mjs` | 0 failed (= base; no event contract loosened) |
| `node dev/verify-bardo-port.mjs` | 0 failed (the bardo modal reuse must not regress the bardo) |
| `node dev/playtest-bug-probes.mjs` | identical table to base |

#### C2.10 — don't-touch (C2)

- Generated files — untouched (`CROWN_LEGEND` is a NEW hand-authored data file, not a compiled
  table; it is Adam's craft-pass surface, so it is authored directly, NOT generated — the one
  exception is called out because it is authored source, like `data/souls-canon.js`).
- `destroyWorld` — leave it; the Crowning is the additive alternative, not a patch to the
  guillotine (§2). Do NOT make `destroyWorld` bank souls "to be consistent" — that's the exact
  aspiration this replaces; touching it is scope creep.
- `distantWordFactPool` / `distantWordRoll` — do NOT rewrite (§C2.6); only `distantWordPick` gains
  the legend concat.
- `computeSaga` / `refreshSaga` — read-only reuse; never modified.
- `migrateWorld` — no migration (crowned/sundered/legends are additive, lazily present).
- `repuGrantEpithet` — reused as-is; the crown epithet rides the built round-trip.
- Adam's `data/crown-legend.js` rows once he authors them — the executor ships the PROVISIONAL
  vocabulary; Adam's craft pass replaces the strings (never the shape).

---

### §7.B1 — bastion claim + vault (size M) · depends: ITEM-LEGACY built + TRANSITION-CONTRACT

**Goal.** Formalize the emergent Bastion (§4.1) with exactly three things it lacks: a NAME, a
CLAIM, and a VAULT that doesn't decay. One new event `bastion_claim`; one world field `w.bastion`;
the `"cached"` lossState unpark (flipping ITEM-LEGACY §7.3's refusal into a handler); the
`"bastion"` claimant kind; a prose panel + deposit/withdraw affordances. ONE bastion per world (Q6).
EITHER-gated claim price (Q5).

**Hard dependency note.** B1 MUST NOT be built before ITEM-LEGACY lands — the vault IS
ITEM-LEGACY's ninth `lossState` (`"cached"`), and the deposit/withdraw path emits `item_claimed`
(ITEM-LEGACY's event) with `instSnapshot` overlay-restore (ITEM-LEGACY §2.2). Building B1 first
would mean re-implementing ITEM-LEGACY, which is forbidden. The orchestrator gates this.

**No new module** — B1 is small enough to live across existing sites (the event handler in `dm.js`,
the state field, a render panel). *Ruling: do NOT create a `bastion.js` module for ~40 lines; the
claim handler is one `applyEvent` case, the panel is one render function folded into
`charHistoryBody`'s neighborhood. If the executor finds it exceeds ~60 lines, THEN a
`src/world/bastion.js` module (id `world.bastion`, after `world.item-legacy` in loadOrder) is
authorized — but default to no new module.*

#### B1.1 — the `bastion_claim` event (registry + payload)

Registry edits (exact):

- `DM_EVENT_TYPES` (`src/world/dm.js:1218`): insert `"bastion_claim"` immediately after
  `"open_shop"` (the other world-scale claim-of-place event).
- `DM_EVENT_FIELDS` (the accept-map block): add
  `bastion_claim: { accept:["nodeId","name","note","payGold"], alias:{ id:"nodeId" } },`

**Payload:**

```js
{ nodeId: string,          // the node to claim — REQUIRED; must be known/safe
  name: string,            // the bastion's name — REQUIRED (player/DM supplied)
  note?: string,           // a founding note (prose)
  payGold?: number }       // the gold-gate path (Q5); omitted when claiming by deed
```

**Source:** `player`/`declared` (this is a player decision — the DM may relay it). Not `detected`.

#### B1.2 — the claim handler (worked before→after, EITHER-gate baked)

New `case "bastion_claim"` in `applyEvent`, placed directly after `case "open_shop"`:

```js
    case "bastion_claim":{
      const t=livingSheet(w); if(!t) return {ok:false,reason:"no-pc"};
      if(w.bastion) return {ok:false,reason:"bastion-exists"};        // Q6 — one per world
      if(!p.nodeId || !p.name) return {ok:false,reason:"need-node-and-name"};
      const known=(typeof seenNode==="function")?seenNode(w,p.nodeId):true;   // node must be known
      if(!known) return {ok:false,reason:"unknown-node"};
      // safety: no live combat, no unresolved threat overlay at the node (a bastion is claimed in peace)
      if(GS.combat) return {ok:false,reason:"unsafe-combat"};
      // Q5 EITHER-gate: a closed front on the books OR a gold price (tier-scaled). Deed OR coin.
      const hasDeed=(w.pressures||[]).some(pr=>pr.closed);
      const price=bastionPrice(w);                                    // tier-scaled (§B1.3)
      let paid=false;
      if(!hasDeed){
        const gold=(t.sh.gold||0);
        if(gold<price) return {ok:false,reason:"cannot-afford:"+price};
        t.sh.gold=gold-price; paid=true;                             // spend the gold sink (economy's missing large sink)
      }
      w.bastion={ nodeId:p.nodeId, name:String(p.name).trim(), foundedDay:(clockOf(w).day),
        foundedBy:{pcId:t.c.id,name:t.c.name}, vault:[], note:p.note||null,
        claimedBy:hasDeed?"deed":"gold", pricePaid:paid?price:0 };
      // codex location record so the relational layer sees it (origin:"bastion")
      if(typeof codexAdd==="function") codexAdd(w,{ id:"location:bastion-"+slug(p.name), kind:"location",
        name:w.bastion.name, provenance:"declared", origin:"bastion",
        fields:{ nodeId:p.nodeId }, status:{known:true, at:p.nodeId} });
      addLedger(w,"canon",{kind:"bastion-claimed",name:w.bastion.name,nodeId:p.nodeId,by:t.c.name,via:w.bastion.claimedBy},
        "⌂ "+t.c.name+" claims "+w.bastion.name+" as a bastion"+(hasDeed?" (by deed)":" (for "+price+" gp)")+".");
      return {ok:true, bastion:{name:w.bastion.name,nodeId:p.nodeId,via:w.bastion.claimedBy}};
    }
```

**Ruling — the deed path takes precedence over gold** (if a front is closed, the claim is free — a
proven hero founds a hall by right). The gold gate only engages when there's no closed front yet
(the "young PC founds a hall" fantasy Q5 protects). `payGold` is the player's optional ACK that gold
will be spent; the handler spends `price` from the sheet when the deed path is unavailable and the
PC can afford it (it does NOT haggle on `payGold`'s value). If the executor finds
`seenNode`/`slug`/`GS.combat` named differently, re-anchor by grepping (`seenNode` is the
node-known predicate; `GS.combat` is the live tracker COMBAT-LIFECYCLE uses).

#### B1.3 — `bastionPrice(w)` — the tier-scaled gold sink

```js
function bastionPrice(w){
  const t=(typeof livingSheet==="function")?livingSheet(w):null;
  const lvl=(t&&t.sh&&t.sh.level)||1;
  // PROVISIONAL — the economy's missing large money-sink. Scales with tier so it stays "earned by
  // SOME currency" (Q5) without being a shop item. Adam may retune the base/curve; nothing else moves.
  return 250 * Math.max(1, Math.ceil(lvl/2));   // L1-2 → 250, L3-4 → 500, … L9-10 → 1250
}
```

*(PROVISIONAL — taste dial; the three integers are Adam's to retune, the shape is locked.)*

#### B1.4 — the vault: `"cached"` unpark (flip ITEM-LEGACY §7.3's refusal)

ITEM-LEGACY §7.3 ships `item_claimed{lossState:"cached"}` REFUSED (`{ok:false,
reason:"bastion-parked"}`). B1 flips that refusal into a real transition. **This edits
ITEM-LEGACY's `item_claimed` handler** (the case ITEM-LEGACY §2.1 built) — the one place B1 reaches
into a sibling spec's code, and only because ITEM-LEGACY explicitly reserved the seam for it.

**Before** (ITEM-LEGACY §7.3 / the `item_claimed` handler's cached branch — as ITEM-LEGACY ships
it, verbatim intent):

```js
    // §7.3 — "cached" is the Bastion seam, refused in v1
    if(p.lossState==="cached") return {ok:false, reason:"bastion-parked"};
```

**After:**

```js
    // CROWNING/BASTION §B1.4 — the Bastion unparks "cached": deposit into the world's vault.
    if(p.lossState==="cached"){
      if(!w.bastion) return {ok:false, reason:"no-bastion"};
      const r=codexGet(w,p.codexId); if(!r || r.kind!=="item") return {ok:false,reason:"no-item-record:"+p.codexId};
      // claimant becomes the bastion itself (new "bastion" claimant kind, §B1.5)
      legacyStamp(w, r, { claimant:{kind:"bastion", ref:w.bastion.nodeId, name:w.bastion.name},
        lossState:"cached", lastSeen:{nodeId:w.bastion.nodeId, day:clockOf(w).day} },
        "⌂ "+r.name+" is laid up in "+w.bastion.name+"'s vault — safe, and waiting.");
      if((w.bastion.vault||[]).indexOf(p.codexId)<0) w.bastion.vault.push(p.codexId);
      return {ok:true, codexId:r.id, lossState:"cached", cached:true, bastion:w.bastion.name};
    }
```

**Vault invariants** (§4.2):

- **No decay, no scavenge.** `corpseScavengeResolve` (ITEM-LEGACY §4.4) has no bastion path — a
  cached item is never on a corpse, so scavenge never sees it. `SCAVENGE_TEETH` gains no bastion
  row. The vault is the anti-corpse; its safety is what the claim price buys.
- **Withdrawal** is `item_changed add:[{name, codexId}]` — which ITEM-LEGACY §2.2 already
  overlay-restores from `instSnapshot` (the +1 sword comes out exactly as true as it went in) and
  emits `item_claimed{lossState:"held"}`. B1 adds ONE thing to withdrawal: when an
  `item_changed add` names a `codexId` currently in `w.bastion.vault`, splice it out of the vault
  array. Fold this into the `item_changed` handler's add loop (ITEM-LEGACY §2.2 site), guarded on
  `w.bastion`:

  ```js
  // §B1.4 — a cached item withdrawn from the vault leaves the vault list (ITEM-LEGACY overlay-restores it)
  if(w.bastion && inst.codexId){ const vi=(w.bastion.vault||[]).indexOf(inst.codexId);
    if(vi>=0) w.bastion.vault.splice(vi,1); }
  ```

#### B1.5 — the `"bastion"` claimant kind (one word)

ITEM-LEGACY's `r.legacy.claimant.kind` enum is
`"pc"|"npc"|"creature"|"faction"|"corpse"|"none"` (ITEM-LEGACY §1.1). B1 adds `"bastion"`. This is
a one-word widening of the claimant-kind vocabulary; `legacyStamp` (ITEM-LEGACY §3) writes
`claimant` whole, so no enum-validation code rejects it unless ITEM-LEGACY added a claimant-kind
guard. **Ruling:** if ITEM-LEGACY's handler validates claimant kind against a list, add `"bastion"`
to that list; if it does not (writes claimant freely), no edit needed beyond the deposit path
above. The executor greps ITEM-LEGACY's handler for a claimant-kind check and edits only if present.

#### B1.6 — arrival + inheritance-by-access (TRANSITION-CONTRACT dep)

The vault inherits across PCs by ACCESS, not teleport (§4.2): a successor gains the RIGHT to the
bastion but must TRAVEL there (geography stays meaningful — the successor spawns far,
`spawnSuccessorOnPlane`). B1's dependency on TRANSITION-CONTRACT is exactly this arrival detection:
`move_node` (TRANSITION-CONTRACT §3, writes `currentNodeId` + `worldTurn` drift on arrival) is how
"the successor reaches the bastion node" becomes a detected state the panel reads. B1 adds NO new
travel machinery — it reads `w.currentNodeId===w.bastion.nodeId` to know the PC is AT the bastion
(gating deposit/withdraw affordances to when you're standing in it).

**Ruling — the "right" is implicit, not a stored grant.** Any living PC in a world with a
`w.bastion` may use it once standing at its node; there is no per-PC ownership token. The
This-Is-Your-Life echo that "seeds the knowledge" of the old hall (§4.2) is a DM-narrated fragment
(the DM reads `w.bastion` from the digest slice §B1.8 and drops the rumor) — NOT an engine grant.
No new state for "who knows about the bastion."

#### B1.7 — the prose panel + affordances (blind-playable)

The bastion renders as prose in `charHistoryBody` (render.js:1602) — a titled paragraph (name,
founder, day, vault manifest as a text list) + deposit/withdraw `iact` links shown only when the PC
stands at the bastion node. **Ruling: the panel IS prose in v1** — no map badge/visual (§4.2);
when a visual comes later it ships with this paragraph as its twin (BLIND-PLAYABLE gate).

**After** (add to `charHistoryBody`'s return, after the affordance row, before the Chronicle
header — a new block):

```js
    ${w.bastion?`<div class="pn-h">⌂ ${escHtml(w.bastion.name)}</div>
      <div class="pn-body" style="font-size:15px">Founded Day ${w.bastion.foundedDay} by ${escHtml(w.bastion.foundedBy.name)}${w.bastion.note?` — ${escHtml(w.bastion.note)}`:""}.
      ${(w.bastion.vault&&w.bastion.vault.length)?`Vault: ${w.bastion.vault.map(id=>{const r=(typeof codexGet==="function")?codexGet(w,id):null;return escHtml(r?r.name:id);}).join(", ")}.`:"The vault stands empty."}
      ${(w.currentNodeId===w.bastion.nodeId)?`<div style="margin-top:6px"><span class="iact" onclick="bastionDepositPrompt()">⌂ Lay an item in the vault</span></div>`:`<div style="margin-top:6px;color:var(--ink-dim)">Travel to ${escHtml(w.bastion.name)} to use its vault.</div>`}</div>`:""}
```

Ruling — deposit is a player affordance (`bastionDepositPrompt()`, a thin UI helper that lists the
PC's legacy-grade items and emits `item_claimed{lossState:"cached", codexId}` for the chosen one).
Withdrawal is DM-side (`item_changed add`), so no withdraw button is needed in v1 (the player asks
the DM; the DM re-grants). `bastionDepositPrompt` is a small UI function (goes wherever
`recoverFallen` lives, `src/world/fate.js` neighborhood or render.js) — its body: gather
`sh.inventory.filter(legacyGrade)`, prompt the player to pick, emit the event, re-render. Keep it
under 15 lines; blind-playable because it's a keyboard-reachable list + prompt.

#### B1.8 — digest slice (the DM sees the bastion)

In `dmDigest()` (dm.js:270), add one key after `fronts` (or beside `itemLegacy` if ITEM-LEGACY's
slice is adjacent):

```js
    bastion:w.bastion?{ name:w.bastion.name, nodeId:w.bastion.nodeId, foundedDay:w.bastion.foundedDay,
      atNow:w.currentNodeId===w.bastion.nodeId,
      vault:(w.bastion.vault||[]).map(id=>{const r=(typeof codexGet==="function")?codexGet(w,id):null;return r?r.name:id;}) }:null,
```

`null` when no bastion (digest diet). ≤ ~80 B + vault names. The DM reads this to narrate the hall,
drop the "old hall" rumor to a successor, and know what's cached — never invents vault contents
(the manifest IS the truth).

#### B1.9 — edge rulings (B1)

1. **Claim a second bastion** → `{ok:false, reason:"bastion-exists"}` (Q6, one per world). The
   claim is a decision, not a collection.
2. **Claim with neither a closed front nor enough gold** → `{ok:false, reason:"cannot-afford:"+price}`.
   Deed OR coin; nothing is free.
3. **Claim during combat / at an unknown node** → refused (`unsafe-combat` / `unknown-node`). A
   bastion is claimed in peace, at a place you know.
4. **Deposit when no bastion exists** → `item_claimed{cached}` returns `{ok:false, reason:"no-bastion"}`
   (not `"bastion-parked"` — the seam is unparked; it now fails for a real reason).
5. **Deposit a non-legacy-grade item** → the affordance only lists legacy-grade items
   (`bastionDepositPrompt` filters); a raw declared `item_claimed{cached}` on a bare record still
   runs ITEM-LEGACY's ensure-defaulting (§7.2) then caches it — legal (the DM may cache an heirloom
   the gate would otherwise skip).
6. **Withdraw an item not in the vault** → the vault-splice guard (`vi>=0`) no-ops; the normal
   `item_changed add` overlay-restore still runs. Harmless.
7. **A cached item's world is crowned** → the vault becomes the New Game+ seed inventory (B2). The
   cached lossState persists through the crown (crowning doesn't touch items). B2 reads
   `w.bastion.vault` on a crowned world.
8. **Scavenge never touches cached** → a cached item is on no corpse; `corpseScavengeResolve`
   iterates `c.corpse.items`, never the vault. Asserted in the harness (deposit an item, kill the
   PC, scavenge — the cached item is untouched).
9. **Old saves** — additive; `w.bastion` absent → the panel/digest render null; no migration.

#### B1.10 — acceptance (B1): `dev/verify-bastion.mjs`, RED-first

New harness `dev/verify-bastion.mjs`, jsdom boot copied from probes:20-90. **It requires the
ITEM-LEGACY build present** (the vault emits `item_claimed`) — so the harness asserts up front that
`win.LEGACY_LOSS_STATES` and `win.applyEvent`'s `item_claimed` case exist, failing loudly if run on
a tree without ITEM-LEGACY (a build-order guard). EXPOSE adds nothing new beyond ITEM-LEGACY's list
(bastion symbols are `function`/`w`-field, not top-level const; `bastionPrice`/`bastionDepositPrompt`
are `function`-declared, reachable without EXPOSE). `win.prompt` stubbed to return a fixed pick for
`bastionDepositPrompt`.

**RED-FIRST proof** (harness ships first commit, before B1 engine edits, ON A TREE WITH
ITEM-LEGACY BUILT):

```
node dev/verify-bastion.mjs
✗ bastion: 2 passed, 11 failed
```

The 2 passes are baselines (ITEM-LEGACY's `cached` still REFUSED as `bastion-parked`, and a
mundane claim path absent). The 11 failures: `bastion_claim` not in `DM_EVENT_TYPES` (RED —
reproduced during authoring: `B1 DM_EVENT_TYPES has bastion_claim → no (RED)`), `w.bastion` never
set, `item_claimed{cached}` still refused, no digest slice.

**GREEN gate:**

```
node dev/verify-bastion.mjs
✓ bastion: 13 passed, 0 failed
```

| # | check | mutation assertion |
|---|---|---|
| B1 | baseline: ITEM-LEGACY present — `LEGACY_LOSS_STATES.indexOf("cached")>=0` | — |
| B2 | baseline: `item_claimed{cached}` WITHOUT a bastion → `{ok:false,reason:"no-bastion"}` (post-unpark; the refusal reason CHANGED from `bastion-parked`) | reason moved |
| 3 | `DM_EVENT_TYPES` has `"bastion_claim"`; FIELDS accept list matches §B1.1 | — |
| 4 | `applyMutates`: `bastion_claim` by DEED (a closed front) → `w.bastion` set, `claimedBy:"deed"`, gold unchanged | `w.bastion` appears |
| 5 | claim by GOLD (no closed front, `sh.gold≥price`) → `w.bastion` set, `claimedBy:"gold"`, `sh.gold` decremented by `bastionPrice` | gold moves down by price |
| 6 | claim with neither → `{ok:false,reason:/cannot-afford/}`, no `w.bastion` | state untouched |
| 7 | second claim → `{ok:false,reason:"bastion-exists"}` | unchanged |
| 8 | claim during `GS.combat` → `{ok:false,reason:"unsafe-combat"}` | unchanged |
| 9 | deposit: `item_claimed{cached, codexId}` with a bastion → record `lossState==="cached"`, `claimant.kind==="bastion"`, `codexId` in `w.bastion.vault` | lossState moves →cached, vault grows |
| 10 | withdraw: `item_changed add:[{name,codexId}]` on a cached item → ITEM-LEGACY overlay-restores ench, `codexId` spliced from `w.bastion.vault`, lossState→held | vault shrinks, ench present |
| 11 | scavenge never touches cached: deposit, `killCharacter`, `corpseScavengeResolve` → cached record still `lossState==="cached"` | cached lossState static |
| 12 | codex location record minted: `codexGet(w,"location:bastion-"+slug(name))` exists, `origin:"bastion"` | record exists |
| 13 | digest: `dmDigest().bastion` null before claim, `{name,vault:[...]}` after (2 checks) | slice appears |

**Regression gates (B1):**

| command | expected |
|---|---|
| `python3 build/check-manifest.py` | `RESULT: OK` — ITEM-LEGACY-tree +0 (no new module, default) or +1 (if `bastion.js` authorized) — record which |
| `node dev/verify-bastion.mjs` | `✓ bastion: 13 passed, 0 failed` |
| `node dev/verify-item-legacy.mjs` | `✓ item-legacy: 24 passed, 0 failed` — **the `"cached"` unpark must not regress ITEM-LEGACY's check #20** (which asserted the refusal). **Ruling: B1 UPDATES ITEM-LEGACY check #20** from "`cached`→refused `bastion-parked`" to "`cached` WITHOUT a bastion → refused `no-bastion`; WITH a bastion → caches." The executor edits `verify-item-legacy.mjs` check #20 as part of B1 and records the before/after expected line. This is the one sanctioned edit to a sibling harness, because B1 legitimately changes that behavior. |
| `node dev/verify-dm-events.mjs` | 0 failed (= base; `bastion_claim` is additive) |
| `node dev/playtest-bug-probes.mjs` | identical table to base |

#### B1.11 — don't-touch (B1)

- Generated files — untouched.
- **ITEM-LEGACY's core** — B1 touches EXACTLY: the `item_claimed` `cached` branch (unpark), the
  claimant-kind enum (add `"bastion"` if guarded), the `item_changed` add loop (vault-splice), and
  `verify-item-legacy.mjs` check #20 (behavior legitimately changed). NOTHING else in ITEM-LEGACY —
  not the scavenge, not the corpse stamp, not the digest slice.
- `corpseScavengeResolve` / `SCAVENGE_TEETH` — no bastion row (vault items are off-corpse by
  definition, §4.2). Do not add one.
- `destroyWorld` — leave it.
- The DMG bastion system (facilities/staff/orders) — stays in the drawer (§4.3); NOT this unit.
- `dev/dm-bridge.py`, `.dm/` — never mid-anything.
- Adam's tables — none touched (`bastionPrice` integers are PROVISIONAL, retune-only).

---

### §7.B2 — the New Game+ heirloom echo (size S) · depends: C2 + B1

**Goal.** The seam where the ending and the vault are one system (§5.1): when a NEW world is rolled
and a CROWNED world with a non-empty bastion vault exists on the plane, character creation gains one
low-probability origin echo — "an heirloom of a finished world" — drawing ONE item from a crowned
bastion's vault into the new PC's opening inventory, with its full `r.legacy` trail. The item MOVES
(removed from the source vault, `item_claimed` both sides): the plane has one of each thing.

**Hard dependency.** Needs C2 (`w.crowned` + the retired world) AND B1 (`w.bastion.vault` +
`"cached"` + the withdraw path). Build last.

**No new module** — B2 is a small additive step at the creation-bind seam.

#### B2.1 — the eligibility scan (which vaults feed)

Only CROWNED worlds' vaults feed (§5.1 — un-crowned vaults do NOT; crossing regions at creation is
the crown's exclusive dividend). A helper:

```js
// worlds that are crowned AND hold a non-empty bastion vault (excluding the world being born into)
function heirloomSourceWorlds(newWorldId){
  return Object.values(U.worlds||{}).filter(w=>w && w.id!==newWorldId
    && w.crowned && w.bastion && Array.isArray(w.bastion.vault) && w.bastion.vault.length>0);
}
```

Lives wherever B2's helpers live (a small `function` set near `cgBind`, `src/creator/sheet.js`, or a
tiny addition — no module).

#### B2.2 — the echo roll + draw (worked before→after at `cgBind`)

The echo hooks `cgBind` (`src/creator/sheet.js:74`) — after the character is fully bound + the Saga
seeded, before `saveU`/`wakeIntoWorld`. It is engine-owned (a `rollDie` gate + a deterministic
draw), NOT a biography event (the player picks the source world; the die picks the item, §5.1).

**Before** (`src/creator/sheet.js:72-74`, verbatim tail of `cgBind`):

```js
  refreshSaga(w,c); // seed the Saga (their significant entities) — grows through play, read at death
  logEvent(w,`<strong style="color:var(--bone)">${c.name}</strong> was rolled into being — ${c.headline}${GS.CGEN.spawnWhere?` — entering at ${GS.CGEN.spawnWhere}`:""}.`);
  saveU(U);GS.CGEN=null;wakeIntoWorld();   // §9: fade out of creation into the DM's opening words
```

**After:**

```js
  refreshSaga(w,c); // seed the Saga (their significant entities) — grows through play, read at death
  if(typeof heirloomEcho==="function") heirloomEcho(w,c);   // CROWNING/B2 §5.1 — a New Game+ heirloom of a finished world
  logEvent(w,`<strong style="color:var(--bone)">${c.name}</strong> was rolled into being — ${c.headline}${GS.CGEN.spawnWhere?` — entering at ${GS.CGEN.spawnWhere}`:""}.`);
  saveU(U);GS.CGEN=null;wakeIntoWorld();   // §9: fade out of creation into the DM's opening words
```

```js
const HEIRLOOM_ECHO_CHANCE = 3;   // rollDie(HEIRLOOM_ECHO_CHANCE)===1 ⇒ the echo fires (~1-in-3 when a
    // crowned vault exists). PROVISIONAL — Adam's taste dial; the crown's generosity (§5.1). If NO
    // crowned vault exists on the plane, the echo NEVER fires (guarded before the roll).
function heirloomEcho(w,c){
  const sources=heirloomSourceWorlds(w.id);
  if(!sources.length) return null;                         // no finished world to inherit from — no echo
  if(rollDie(HEIRLOOM_ECHO_CHANCE)!==1) return null;       // the low-probability gate
  // player picks the source world (a prompt in v1 — a small UI; blind-playable list); die picks the item
  const src=heirloomPickWorld(sources);                    // §B2.3 — defaults to the first if UI absent
  if(!src) return null;
  const vaultIds=src.bastion.vault.slice();
  const codexId=vaultIds[rollDie(vaultIds.length)-1];      // the die picks the item
  const r=(typeof codexGet==="function")?codexGet(src,codexId):null;
  if(!r || r.kind!=="item"){ return null; }
  // 1) mint the instance on the NEW PC from the source record's instSnapshot (the true item)
  const snap=(r.legacy&&r.legacy.instSnapshot)||{name:r.name};
  const inst={ id:uid(), name:snap.name, conditions:[], codexId:codexId,
    base:snap.base, ench:snap.ench?JSON.parse(JSON.stringify(snap.ench)):undefined, qty:snap.qty };
  Object.keys(inst).forEach(k=>inst[k]===undefined&&delete inst[k]);
  c.sheet.inventory=(c.sheet.inventory||[]).concat([inst]);
  // 2b) HOTFIX-QUEUE-2026-07-07 HQ2-7 — the DESTINATION-side twin: mint the item record in the NEW
  // world behind inst.codexId NOW (not lazily at death), carrying the crowned-heirloom origin + a
  // full r.legacy block (mirrors legacyEnsureRecord's shape by hand — origin.ref points at the
  // source world, which legacyEnsureRecord's originHow path can't do). See §B2.4 edge #6 (superseded).
  if(typeof codexAdd==="function" && !(typeof codexGet==="function" && codexGet(w,codexId))){
    const destRec=codexAdd(w,{ id:codexId, kind:"item", provenance:"rolled", name:r.name,
      fields:Object.assign({}, r.fields||{}), status:{known:true} });
    destRec.legacy={ origin:{ how:"heirloom", ref:src.id },
      claimant:{ kind:"pc", ref:c.id, name:c.name },
      lastSeen:{ nodeId:w.currentNodeId||null, day:(typeof clockOf==="function")?clockOf(w).day:0 },
      lossState:"held", recoveryHookId:null, factionInterest:null, decayRef:null, instSnapshot:snap };
  }
  // 2) it MOVES — leave the source vault, cross-world item_claimed pair (§5.1). `by.worldId` self-
  // documents the destination world (HQ2-7) — dm.js's item_claimed handler whitelists claimant to
  // kind/ref/name, so this lives on the event payload only, not a persisted codex field.
  applyEvent(src,{type:"item_claimed",source:"detected",payload:{codexId, lossState:"held",
    by:{kind:"pc",ref:c.id,worldId:w.id,name:c.name}, note:c.name+" carried it into a new world."}});   // out of the source
  // (the item_changed-add overlay path already spliced it from src.bastion.vault via B1.4;
  //  belt-and-braces: ensure it's gone)
  const vi=(src.bastion.vault||[]).indexOf(codexId); if(vi>=0) src.bastion.vault.splice(vi,1);
  // 3) the heirloom thread in the NEW world — where it came from (reuse ITEM-LEGACY's hook pattern)
  const tid="thread:heirloom-"+slug(r.name)+"-"+uid();
  if(typeof codexAdd==="function") codexAdd(w,{ id:tid, kind:"thread", provenance:"rolled",
    name:r.name+" — an heirloom of "+src.name,
    fields:{ desc:"Carried out of "+src.name+", a world someone finished. "+(src.crowned&&src.crowned.legend?src.crowned.legend.text:""), fromWorldId:src.id, itemName:r.name },
    dm:{ legs:"thread-seed", pool:"heirloom" }, status:{known:false, soft:true} });
  addLedger(w,"canon",{kind:"heirloom",item:r.name,fromWorld:src.name,char:c.id},
    "✧ "+c.name+" carries "+r.name+" — an heirloom of "+src.name+", a world that was crowned.");
  return {codexId, from:src.name};
}
```

**Ruling — cross-world custody is a `detected` `item_claimed` on the SOURCE world** (the item
leaves the crowned world's vault as `held`-by-the-new-PC, which is the honest "someone carried it
off" state), plus the fresh instance minted on the new PC in the NEW world. The plane holds ONE of
the thing — the source vault loses it. The new PC's codex has a fresh `thread` (where it came from),
NOT a copy of the source item record (the ITEMS.md pointers-not-copies discipline — the storied
record lives in its origin world; the new world gets a thread that references it). This is the
"holding a sentence from a finished book" (§5.1) without duplicating canon.

**Amended 2026-07-07 (HOTFIX-QUEUE HQ2-7) — the pair is now two-sided.** The paragraph above still
holds for the *thread*, but the *item record itself* is a pair, not a one-sided pointer: the
destination world mints its OWN codex item record behind the same `codexId` (step 2b), carrying
`legacy.origin:{how:"heirloom", ref:src.id}` and a copy of the `instSnapshot`. This is why B2.4 edge
#6 below is superseded — `codexGet(w,codexId)` now resolves from the moment the echo fires, not only
after the new PC dies. World-portable fields only (lossState/instSnapshot/origin) copy forward;
`decayRef`/`factionInterest` stay SOURCE-world-scoped and are never copied (they'd dangle the other
way — the heirloom gets a fresh start in its new world).

#### B2.3 — `heirloomPickWorld` (blind-playable pick)

In v1 the source-world pick is a small prompt/list (the player chooses WHICH finished world to draw
from — §5.1 "player picks the world"). Blind-playable: a keyboard-reachable list of crowned world
names. **Ruling:** if a UI-less/headless context (harness), default to `sources[0]`. Keep it a thin
helper (prompt with the crowned worlds' names + legends; return the chosen `w`). Under 12 lines.

#### B2.4 — edge rulings (B2)

1. **No crowned world on the plane** → `heirloomEcho` returns null before rolling; ordinary
   creation. The common case (early plane) costs nothing.
2. **Crowned world but empty vault** → not a source (`heirloomSourceWorlds` filters
   `vault.length>0`); no echo from it.
3. **Echo fires, source vault has 1 item** → that item is drawn and the vault empties; the source
   is no longer a heirloom source next time. Legends migrate, they don't photocopy (§5.1).
4. **Un-crowned world with a full vault** → NEVER a source (§5.1 — crowning is the exclusive
   dividend). Asserted in the harness (a bastion'd but un-crowned world does not feed).
5. **The drawn item's `instSnapshot` is missing** (a record cached before ITEM-LEGACY snapshotted)
   → fall back to `{name:r.name}` — a mundane instance of the right name. Rare; no crash.
6. **SUPERSEDED 2026-07-07 (HQ2-7) — see the amended ruling above.** ~~The new PC dies carrying the
   heirloom → the new PC's instance carries `codexId` pointing at the SOURCE world's record, but
   ITEM-LEGACY's `legacyEnsureRecord` mints a record in the CURRENT (new) world if that codexId
   isn't found there... So on the new PC's death a fresh legacy record is ensured in the new
   world.~~ This was the two-sided bug HQ2-7 fixed: the lazy re-mint used `originHow:"start"`,
   losing the crowned-heirloom provenance. Step 2b now mints the destination record at echo time
   (origin `"heirloom"`), so `legacyEnsureRecord`'s `!r.legacy` guard finds a record already present
   at death and never re-mints it. `dev/verify-heirloom.mjs` checks 9–10 cover this.
7. **Multiple crowned worlds** → the player picks which (`heirloomPickWorld`); only one item, one
   echo, per new PC.

#### B2.5 — acceptance (B2): `dev/verify-heirloom.mjs`, RED-first

New harness `dev/verify-heirloom.mjs`, jsdom boot copied from probes:20-90. Requires C2 + B1 built
(the harness seeds a crowned world with a bastion vault — needs `crownWorld`/`bastion_claim`/
`item_claimed{cached}` all present; asserts them up front as a build-order guard). **EXPOSE adds
`HEIRLOOM_ECHO_CHANCE`.** Stub `wakeIntoWorld`, `rollCharacter` (creation-UI). Stub `rollDie` to a
fixed sequence so the ~1-in-3 gate is deterministic (`rollDie` returns 1 to fire).

**RED-FIRST proof** (harness first, before B2's `cgBind` edit + `heirloomEcho`):

```
node dev/verify-heirloom.mjs
✗ heirloom: 2 passed, 6 failed
```

The 2 passes are baselines (a plain `cgBind` with no crowned world adds no heirloom; `heirloomEcho`
absent → ordinary inventory). The 6 failures: `heirloomEcho`/`heirloomSourceWorlds` `undefined`
(RED), no heirloom item on the new PC, the source vault unchanged after creation, no heirloom
thread.

**GREEN gate:**

```
node dev/verify-heirloom.mjs
✓ heirloom: 8 passed, 0 failed
```

| # | check | mutation assertion |
|---|---|---|
| B1 | baseline: no crowned world on plane → `heirloomEcho` returns null, new PC inventory length unchanged | — |
| B2 | baseline: un-crowned world with a full vault is NOT a source (`heirloomSourceWorlds` empty) | — |
| 3 | `HEIRLOOM_ECHO_CHANCE` defined; `heirloomSourceWorlds` returns the crowned+vault world only | source list correct |
| 4 | echo fires (rollDie stubbed →1): new PC gains ONE inventory item with `codexId` + `ench` from the source snapshot | inventory length +1, ench present |
| 5 | the item MOVED: source `w.bastion.vault` length −1, that codexId no longer in the source vault | vault shrinks |
| 6 | heirloom thread minted in the NEW world: a `kind:"thread"` record referencing `fromWorldId===src.id` | thread exists |
| 7 | cross-world `item_claimed` fired on the source (record `lossState` moved off `"cached"`) | lossState moved |
| 8 | echo does NOT fire when `rollDie` stubbed →2 (miss the gate): inventory unchanged, vault intact | no change |

**Regression gates (B2):**

| command | expected |
|---|---|
| `python3 build/check-manifest.py` | `RESULT: OK` — B1-tree +0 (no new module) |
| `node dev/verify-heirloom.mjs` | `✓ heirloom: 8 passed, 0 failed` |
| `node dev/verify-crowning.mjs` | `✓ crowning: 19 passed, 0 failed` (unchanged) |
| `node dev/verify-bastion.mjs` | `✓ bastion: 13 passed, 0 failed` (unchanged) |
| `node dev/verify-item-legacy.mjs` | `24 passed, 0 failed` (unchanged — B2 uses the withdraw path, doesn't alter it) |
| `node dev/playtest-bug-probes.mjs` | identical table to base |

#### B2.6 — don't-touch (B2)

- Generated files — untouched.
- The creation biography chain (`life.js` TIYL events) — B2 is NOT a biography event; it's an
  engine draw at the bind seam. Do NOT add an heirloom row to any `cgLookup` table.
- `soulFromCGEN` — the heirloom is on the world CHARACTER (`cgBind`), not the roster-bank path
  (banking a soul at creation is a different flow); leave `soulFromCGEN`/`bankSoul` alone.
- ITEM-LEGACY's withdraw/overlay path — reused as-is; B2 rides it, never edits it.
- Un-crowned worlds' vaults — must never feed the echo (§5.1). Do not "generalize" to all bastions.
- Adam's `HEIRLOOM_ECHO_CHANCE` integer — PROVISIONAL, retune-only.

---

### §7.z — packaging & the executor's per-unit checklist

Each unit is ONE branch, RED-first-commit-first:

| unit | branch | commit order |
|---|---|---|
| C1 | `feat/crowning-c1` | (1) `dev/verify-crowning.mjs` + RED output pasted in commit body (2/9) · (2) `src/engine/crowning.js` + manifest + tag · (3) the three edit sites (`world-gen.js`, `dm.js` clock_fired, `render.js` banner) |
| C2 | `feat/crowning-c2` | (1) C2 checks added to `dev/verify-crowning.mjs` + RED (11/8) · (2) `data/crown-legend.js` + `src/world/crowning-ritual.js` + manifest + tags · (3) the edit sites (`dm.js` clock_fired markSundered hook, `gap-wiring.js` pick, `render.js` banner-live + shelf badge) |
| B1 | `feat/bastion-b1` | (1) `dev/verify-bastion.mjs` + RED (2/11) · (2) the `bastion_claim` case + registry + `bastionPrice` + `w.bastion` + the `cached` unpark + `item_changed` vault-splice + panel + digest · (3) the ITEM-LEGACY check-#20 update in `verify-item-legacy.mjs` |
| B2 | `feat/heirloom-b2` | (1) `dev/verify-heirloom.mjs` + RED (2/6) · (2) `heirloomEcho`/`heirloomSourceWorlds`/`heirloomPickWorld` + the `cgBind` hook |

**Every unit, before "done":** (a) the RED line pasted from the un-built tree; (b) the GREEN gate
run and its exact line recorded; (c) `check-manifest.py` → `RESULT: OK` with the exact module count;
(d) the regression gates all at their base numbers; (e) never trust a self-reported green — Opus
re-runs every gate at review. Total new inference cost across all four units: **$0.00/session.**

**Explicitly NOT in the lock** (unchanged from the proposal): facilities/staff/orders (the DMG
bastion expansion, demand-driven — §4.3); realm-flavored Doom rosters (craft pass — Q4); any
bastion or crowning VISUAL surface beyond the prose panels/badges (rides the UI lane with its prose
twin per BLIND-PLAYABLE).

---

## Registry updates (Fable applies — RULED 2026-07-07; this doc edits nothing shared)

All six questions are RULED (frontmatter). The proposal is now a SPEC-LOCK; §7 holds the executable
build spec. Fable applies these registry edits at landing:

- `docs/PARKING.md` — replace the Crowning entry's tail with: `→ RULED 2026-07-07, spec-locked:
  docs/CROWNING-BASTION.md §7 (units C1/C2/B1/B2, build DEFERRED behind TRANSITION-CONTRACT +
  ITEM-LEGACY + the freeze).` Append to the Bastion entry: `RULED 2026-07-07 — paired with the
  Crowning in docs/CROWNING-BASTION.md §7.B1; v1 = claim/name/vault only (unparks ITEM-LEGACY's
  "cached" seam, Q5 either-gate, Q6 one-per-world); facilities/staff/orders stay parked as the
  expansion tier.`
- `docs/NEXT-STEPS.md` — add under the deferred/post-freeze section: `☐ CROWNING-BASTION —
  SPEC-LOCKED 2026-07-07 (docs/CROWNING-BASTION.md §7). Four units in dep order: C1 (Doom-flag +
  eligibility, S) → C2 (ritual + legend, M); B1 (bastion claim + vault, M) → B2 (heirloom echo, S).
  Deps: C1/B1 build AFTER TRANSITION-CONTRACT + ITEM-LEGACY land. RED-first harnesses:
  verify-crowning.mjs, verify-bastion.mjs, verify-heirloom.mjs. Amends TIER-SCOPE per Q1.`
- `docs/README.md` (docs index) — update the design entry to: `CROWNING-BASTION.md — the ending
  design: world-retirement ritual (Crowning/Sundering) + stronghold/legacy vault (Bastion)
  (type: design-proposal → SPEC-LOCKED 2026-07-07, build deferred).`
- `docs/TIER-SCOPE.md` — Q1 RULED YES: the "plateau & continue …not a retirement ceremony" sentence
  gains `(amended 2026-07-07: the plateau remains the default; the Crowning — docs/CROWNING-BASTION.md
  — is the opt-in earned exit.)`
- `docs/DESIGN.md` (decision registry) — add: `2026-07-07 — CROWNING-BASTION RULED (6 Qs): the
  Crowning is the earned world-ending (retire the PC to U.souls, promote the world into legend, feed
  U.legends + Distant Word); the Sundering is its dark twin (Doom clock fires → uncrownable); the
  Bastion v1 = claim/name/vault (either-gated, one per world), unparking ITEM-LEGACY's "cached"; New
  Game+ draws a heirloom from a crowned world's vault. Amends TIER-SCOPE's plateau line. Spec-lock:
  docs/CROWNING-BASTION.md §7 (build deferred behind TRANSITION-CONTRACT + ITEM-LEGACY + the freeze).`
- `docs/EVENT-CONTRACT.md` — no edit NOW (frozen); B1's executor adds the `bastion_claim` taxonomy
  row + the `"cached"` lossState transition note at build time (§7.B1 commit).
