---
type: system-spec
branch: Genesis
status: implemented (v1)
created: 2026-06-21
implemented: 2026-06-21
---

# DM Bridge — the local integration harness (Claude Code as the dev DM)

A development/playtest harness that closes the play loop: the app and an **AI DM run together**
over a tiny local bridge, instead of the clipboard back-and-forth. The DM is **Claude Code**,
which — running on a Claude subscription, not an API key — costs **no metered API tokens**. This
is a *dev/test* surface, **not the shipped product**: when Genesis ships, "Claude Code in the
loop" is swapped for an API call against the **same turn/response contract** defined here.

## Why this exists

Testing the app today means: play in the browser → `handToDM` copies a digest to the clipboard
→ paste into a chat → read narration → manually re-enter what changed. The human is the bus.
That's an awful long-term loop and it doesn't exercise the real architecture. The bridge makes
the transfer a **structured file/HTTP handshake both sides can see**, with the DM emitting
**typed events** the script applies — so playtesting the loop also tests `EVENT-CONTRACT.md`.

This is not a new direction — it's the locked design made runnable. `DESIGN.md`'s anti-drift
north star already says the app *"serves a small, relevance-scoped state digest each beat"*;
`handToDM` (`src/world/handoff.js`) already assembles exactly that digest. The bridge just sends
it as JSON to an endpoint and renders the structured reply, instead of `navigator.clipboard`.

## Principles inherited (do not relitigate)

- **Script owns state; the DM only interprets.** The DM never writes `U`. It returns narration +
  typed events; the **app applies the events through its own existing mutators** (`addLedger`,
  `advanceClock`, `addNode`/`addEdge`, clock changes). (`DESIGN.md`, `EVENT-CONTRACT.md`.)
- **detected > declared.** v1 accepts DM-*declared* events (pragmatic); the migration path to
  *detected-from-state-delta* is owned by `EVENT-CONTRACT.md`, not redesigned here.
- **Scoped digest, not the whole universe** each beat (anti-drift).
- **Dice transparency + DM-agency.** The **player rolls all dice, openly**, in-app; the DM
  narrates *from* those results and **never fabricates or rolls them**. The protocol enforces
  this structurally (rolls travel *into* the turn; the DM can only *request* a roll, never
  resolve one). The DM exerts will only through NPCs; presents three options + "or something
  else" at decision points (`feedback_dm_three_options`, `feedback_dm_agency`).

## Architecture — three actors

```
┌─────────────┐   POST /turn        ┌────────────┐   reads .dm/turn-*.json   ┌──────────────┐
│  THE APP    │ ──────────────────▶ │ THE BRIDGE │ ────────────────────────▶ │  CLAUDE CODE │
│ genesis.html│   (action+digest+   │  mailbox + │                           │   (the DM)   │
│  (browser)  │     player rolls)   │  snapshot  │ ◀──────────────────────── │  /loop watch │
│             │ ◀────────────────── │  store     │   writes .dm/response-*   │              │
└─────────────┘   GET /response     └────────────┘                           └──────────────┘
  applies events                      serves the app                          narration + events[]
  via its OWN mutators                + /state snapshot
```

1. **The app** — produces a turn (the player's action + the scoped digest + any dice the player
   just rolled), polls for the response, renders narration in the chronicle, and **applies the
   returned events** with its real mutators, then re-renders ledger/clock/map and persists.
2. **The bridge** (`dev/dm-bridge.py`) — a tiny local HTTP server that *also* serves the static
   app (one command runs everything; replaces `python3 -m http.server`). It is a **dumb mailbox
   + a read-only state snapshot** — it holds turn/response files and the latest `U` snapshot the
   app posts. **No game logic lives here** (see "State ownership").
3. **The DM** (Claude Code) — a `/loop` watch on the turn file: read it (+ `/state` if needed),
   compose narration + typed events following the DM-agency rules, the SRD lookups
   (`Reference/SRD-Data/`), and `CLASS_PROGRESSION`; write the response file.

## State ownership — the one real decision (recommended: app owns it; bridge is a mailbox)

**The app remains the sole owner and applier of state.** The bridge stores a *read-only snapshot*
for the DM's benefit; it never mutates `U`. Rationale — the anti-drift cardinal rule is *one
implementation of the mutators*. They live in-browser (`world.state`); re-implementing them in a
Node/Python bridge would fork them and invite drift. So:

- The app applies the DM's `events[]` with its existing mutators (the `applyEvent(e)` runtime
  below), persists to `localStorage` as today, and POSTs a fresh snapshot so the DM can read full
  state next turn.
- The bridge stays trivial → **Python is fine** (no logic to duplicate).

> **Synergy worth noting:** the client-side `applyEvent(e)` runtime this build needs — a switch on
> the `EVENT-CONTRACT.md` event types dispatching to the real mutators — **is** the first piece of
> the event-contract plumbing that `ADVANCEMENT.md` / `DIFFICULTY.md` require anyway. Building the
> bridge lands it in the right place. Two birds.

*(Rejected alternative: a Node bridge that owns state and applies events server-side — needs the
classic-script modules loaded outside the browser or a re-implemented applier. More friction, real
drift risk. Don't.)*

## The contract (the durable artifact — reused by the shipped API DM)

### TurnRequest — `POST /turn` → `{ turnId }`

```jsonc
{
  "turnId":  "t-<uid>",
  "worldId": "<U world id>",
  "action":  "I search the collapsed shrine for the missing ledger.",
  "rolls": [                       // the player's OPEN rolls; the DM narrates FROM these
    { "label": "Investigation", "die": "d20", "result": 14, "mods": "+5", "total": 19 }
  ],
  "digest": {                      // the scoped state digest (the JSON twin of handToDM's prose)
    "clock":   { "day": 2, "band": "morning", "exact": "07:14", "session": 3 },
    "location": "Saltmarsh Shrine",
    "scene":   { "tension": "...", "present": ["NPC: Brother Vael"] },
    "pc":      { "name": "...", "species": "...", "class": "...", "level": 3,
                 "hp": "19/24", "ac": 15, "conditions": [], "skillProfs": ["..."] },
    "powers":  [ { "faction": "Tide-Wardens", "agenda": "...", "clock": "3/6" } ],
    "fronts":  [ { "kind": "...", "danger": "...", "clock": "2/4",
                   "dmOnly": { "truth": "...", "doom": "..." } } ],
    "recentLedger": [ "...last ~6 entries..." ],
    "revealed": ["map", "ledger"]
  }
}
```
The `digest` is assembled by extending `handToDM` into a structured `dmDigest()` (the prose
version stays for the manual/clipboard fallback). `dmOnly` fields carry the hidden layer the DM
already gets today.

### TurnResponse — `GET /response?turnId=…` → `200` when ready, `204` while pending

```jsonc
{
  "turnId":  "t-<uid>",
  "narration": "The shrine's collapsed nave still smells of brine and old incense...",
  "events": [                      // EVENT-CONTRACT.md envelope, verbatim
    { "type": "fact_canonized", "payload": { "factId": "...", "what": "the ledger was taken, not lost" },
      "source": "declared", "ledgerRefs": [] },
    { "type": "clock_advanced", "payload": { "clockId": "tide-wardens:recover-ledger", "delta": 1 },
      "source": "declared", "ledgerRefs": [] }
  ],
  "rollRequest": null,             // a CHECK: { "skill": "Stealth", "ability": "dex", "dcHidden": true, "adv": "advantage" }
                                   // OR a DICE roll: { "dice": "2d6+3", "label": "fire damage" }  (any NdM±K combo)
  "ask":         null,             // OR { "prompt": "...", "options": ["A","B","C"], "orElse": true }
  "dmNotes": "adjudication: treated the shrine as difficult terrain; precedent logged"
}
```
- `events[]` use the **exact `EVENT-CONTRACT.md` envelope** (`type` / `payload` / `source` /
  clocks / `ledgerRefs`). The app validates + applies each via `applyEvent`.
- `rollRequest` — when the DM needs a check, it **asks**; the app prompts the player to roll
  openly (real dice engine, `ui.dice`); the result rides the **next** TurnRequest's `rolls`.
  The DM never resolves the roll itself.
- `rollRequest.adv` — **OPTIONAL** `"advantage"` / `"disadvantage"`. The DM ADJUDICATES the
  circumstance (cover, prone, aid, hidden, restrained…); the app rolls `2d20` keep-highest/lowest so
  the dice reflect the call. Omit/`null` = a straight d20. The script owns the mechanic; the DM owns
  whether it applies.
- `rollRequest.dice` — a **DICE roll** instead of a d20 check: any `NdM±K` expression (`"2d6+3"`,
  `"1d8"`, `"4d6"`, `"2d6+1d4"`). Use it whenever the PLAYER should roll non-d20 dice — **weapon/spell
  damage, healing, hit dice, a random-table die**. The app rolls it openly, shows the trace
  (`fire damage: 2d6[4,5]+3 = 12`), and it rides the next turn. `label` is the flavor. The player also
  has a free dice tray (any combo) under the input, so they can roll whatever a moment calls for.
- `rollRequest.branches` — **pre-author the futures and the check resolves the moment the dice
  land, with NO second turn from you** (ROLL-BRANCHES.md). Attach `dc` (required) +
  `branches:{success, nearMiss, fail}`, each `{narration, events[]}`:
  **Branch routine checks; keep dramatic ones live.** If the outcome would change what you'd
  narrate *beyond this beat* (a reveal, a death spiral, a front closing), ask bare and take the
  live turn. If it's "does the climb/sneak/haggle land," branch it. Write branches in your own
  voice, 1–3 sentences, the cost in the narration AND the event (say the number out loud).
  Branch events are immediate consequences only (hp/conditions/a clock tick) — open the next
  scene in your NEXT live turn off `lastResolution`, never inside a branch. Nat 20/1 always
  comes back to you live (crit-magnitude deserves the turn). You cannot revise a fired branch —
  the ledger stamps `source:"branch"` and the wrap report counts them.
- `gen` — **ask the engine for a noun instead of inventing one** (ON-DEMAND-GEN.md): attach
  `gen:[{kind:"npc"|"interior"|"item"|"loot", opts:{...}}]` (max 4) to any response. The app
  rolls behind the screen, mints a SOFT codex record, and next turn `digest.minted[]` points you
  — and **tease speakers loosely until the mint lands** (live-play lesson, 2026-07-03): if you
  describe a to-be-minted NPC too concretely (name, species, look) before the atoms arrive, you
  can't bind them cleanly. "A small figure near the door" binds; "a wiry dwarf named Hobb" fights
  the dice. One turn of vagueness buys a clean bind
  at it — the full atoms are already in your codex view. Narrate the TEASE this turn; narrate
  FROM the atoms on contact. `opts.name` covers the name you already said aloud (a bind-name
  must always get matched with rolled atoms — back-fill the same session). **The tiering gate:
  roll any NPC the player speaks to, who takes a consequential named action, or who will recur**;
  pure spear-carriers stay a descriptor. Interiors arrive flagged `needsEffectDie` — generate
  the room's one significant die (`CONSEQUENCE-LADDER §8`; the stored shape is
  `rows:[{lo,hi,nature,use,tell,escalation}]`), capture it via `codex_update {dm:{effectDie}}`,
  and when the player engages, THEY roll it, open. One roll per room, ever.

### Mechanics the DM MUST fire (the script owns the numbers — but only if the DM declares them)

The app shows every mechanical effect as a chip in the feed *and* speaks it through your prose — but
it can only apply what you send. Each turn, after narrating, fire the matching event(s):

- **Damage / healing → `hp_changed`** `{payload:{delta:-7}}` (negative = damage). **Say the number in
  the narration too** — "the blade bites deep; you lose **7**" — players want to hear the cost out loud,
  not discover it on the sheet. The app applies it and shows a `−7 HP → 5/12` chip.
- **A class resource is used → `resource_spent`** `{payload:{key:"rage",n:1}}` (Rage, Bardic
  Inspiration, Channel Divinity, Ki/Focus, Sorcery Points…).
- **Enemy / NPC rolls** — you roll those in the OPEN in your narration (the player only rolls their
  own dice). Apply advantage/disadvantage to them yourself and **state it** ("with the high ground, it
  strikes at advantage — **18** to hit"). Player checks use `rollRequest.adv` instead.
- `ask` — the structured three-options-plus-"or something else" offer.
- **The party clears a segment of the active walk → `walk_advance`** `{payload:{toSeg:N}}` (see
  "Read `digest.activeWalk` every turn" below — this is the event that keeps the script's cursor in
  sync with where you've actually narrated the party).
- **Finale resolved? Emit `walk_complete`** `{payload:{}}` — walking off to another road closes the
  old walk itself (detected, DETECTED-EVENTS.md DE-5): the script promotes + reskins the next prepped
  frontier — don't invent the next location yourself; wait for the promoted frontier in next turn's
  digest.
- **A PC is subdued/captured → `capture`** `{payload:{}}` (all fields optional — the script fills
  captor/cell/lever from live state). See "Capture as re-entry" below.
- **A travel walk's finale resolves → `walk_complete` IS the arrival** (TRAVEL-WALKS.md): on a
  `kind:"travel"` walk the script moves the party to the destination and writes the arrival —
  **never teleport the party yourself**; `{abandoned:true}` = they turned back. The clock
  advances per `walk_advance` segment, not all at once.
- **A room's significant die gets rolled → capture the face** with
  `walk_update {payload:{seg:N, overlay:{effectDie:{rolledFace:n}}}}` — re-visits narrate the
  canon face, never re-roll.
- **Lodging is automatic** (ECONOMY-SINKS §A): any long rest at an inhabited place charges the tier
  price through the app (UI `passTime` **or** a DM `rest` event — DETECTED-EVENTS.md DE-1 unified
  the two paths) — you don't fire anything, but an UNPAID shortfall lands in the ledger as story
  material with teeth. Use it.
- **`digest.prepPending` appears → run the deep prep in the background** (PREP-AUTOPILOT.md):
  `Workflow({scriptPath:"dev/prep-fanout.workflow.js"}, <the bundle via peek-state.py handoff>)`,
  and when it returns post ONE `prep_applied {harvest, overlays}`. Fire-and-continue — never
  block the current narration on it; the walks work un-reskinned until it lands. It runs on
  Haiku; if it fails, skip silently and retry when the flag reappears.
  **⚠ Environment check first (2026-07-03, shakedown finding SD-006):** the Workflow tool only
  exists in Cowork/orchestrated sessions — a plain Claude Code DM session does NOT have it. If
  you have no Workflow tool, don't silently skip forever: note `prepPending unserviced` once in
  your session log so the orchestrator knows depth is running thin, and keep playing — the
  un-reskinned walks are the designed fallback.
- **A breach foe carries `realm`/`desc` (REALM-STORY-WIRING.md) → narrate the REALM creature, not
  the generic chassis.** `combatDigest`'s `foes[]` stamps `realm` on every foe drawn from a breach
  and `desc` (once per foe NAME per combat — a digest-diet economy, not a per-foe omission) on the
  first instance; `activeWalkDigest`'s "here" segment carries a `creatures[]` preview
  (`{name,realm,summary}`) before the fight even opens. The `desc` is the fiction — narrate FROM it;
  the BESTIARY chassis it resolves to (`statId`) is stats only, never the story. A significant foe
  (high/apex role, or any realm foe CR≥1) mints/touches a codex `creature` record automatically at
  `combat_start` — you don't fire anything for this, it's script-owned; the record is there for you
  to recall later ("the pack that ran at Copper's Marsh").
- **`displaced:true` on a foe (MONSTER-STORY-WIRING.md) = this creature does not belong here —
  narrating WHY is yours.** A misfit against the setting's natural habitat is kept, not filtered out
  (ecology bends, doesn't dictate); it rides `combatDigest`'s `foes[]`, the walk-digest `creatures[]`
  preview, and the codex record's `fields`. `doing` (one short string, behavior or activity) tells you
  what it's caught doing when found. A boss-slot or CR≥3 non-realm foe mints/touches a codex `creature`
  record the same way realm foes do; on that record's FIRST mint, `dm.flavor` carries one rolled row
  from EACH of the creature's hand-authored custom d10 tables (verbatim, canon-locked — a recurring
  foe never re-rolls it), surfaced in `combatDigest` once per foe NAME on its first combat only.

### Read `digest.activeWalk` every turn — the walk you were handed at prep is still live

Session-Prep (`SESSION-PREP.md`) rolls **three full walks** every session — urban / dungeon /
wilderness, each with a topology, segments, encounters, and a pre-cast NPC/location/object — and
hands them to you ONCE as the `⎘ Prep handoff`. Without anything more, that handoff is easy to
forget mid-session and narrate freehand past. **WALK-CONSUMPTION (`docs/WALK-CONSUMPTION.md`) fixes
this: `digest.activeWalk` carries the walk the party is currently ON, every single turn, until it's
walked out.**

```jsonc
"activeWalk": {
  "nodeId": "frontier-s3-0", "place": "The Gilded Quarter", "environment": "urban",
  "topology": "The Gauntlet", "briefing": "...",            // your own Stage-2 reskin, if applied
  "cursor": { "current": 3, "touched": [1,3], "done": false, "total": 5 },
  "segments": [
    { "num": 1, "label": "...", "gist": "...", "state": "behind", "reskin": {...} },
    { "num": 3, "label": "...", "gist": "...", "state": "here",   "reskin": null },
    { "num": 5, "label": "...", "isFinale": true, "gist": "...", "state": "ahead" }
  ],
  "cast": { "locId": "...", "npcIds": ["..."], "itemIds": ["..."] },
  "rule": "...A SOFT prior — player intent and the live situation override it..."
}
```

**When it's present, this is the scene you're narrating from** — not a fresh location. Read the
`"here"` segment's `gist`/`reskin` and narrate it; the `"ahead"` segments are the rolled road still
to come (don't reveal them early); the `"behind"` segments are where the party already was. It is a
**SOFT prior, exactly like `sessionLean`** — player intent and the live situation override it, and
you may leave the walk entirely (the player wanders off, picks a different door) without penalty.
You are not steering the party down it; you are tracking where they are.

- Moved the party into a new segment? Emit **`walk_advance`** `{payload:{toSeg:N}}` so the cursor
  (and the eventual wrap's provenance report) stays accurate. Reaching the finale segment does
  **not** by itself complete the walk — narrate the finale beat, then:
- Finale resolved? Emit **`walk_complete`** `{payload:{}}` — walking off to another road closes the
  old walk itself (detected, DETECTED-EVENTS.md DE-5). The script clears the active walk and
  **promotes the next prepped frontier**, reskinning it from the party's current position — you'll
  see it as a new soft frontier (and `needsReskin` on its prep node) next session-prep cycle. Don't
  invent the next location yourself.
- `activeWalk` is `null` when the party is in town / between walks — narrate freely as today.

### Capture as re-entry — when a PC is subdued, don't invent a prison

If a PC is captured/subdued in play, **don't freehand a holding cell.** Emit **`capture`**
`{payload:{}}` (every field optional — the script fills any you omit from live state: the most
faction-hostile captor, a holding segment of the active walk reused or minted, a pre-cast NPC as
the possible lever, a rolled disposition/confiscation/opening). The response gives you everything
you need to narrate: the captor's name, the disposition (ransom / interrogation / execution-pending
/ …), which segment of the walk became the holding, the lever NPC's id, and the rolled "opening"
(the escape vector — a handle, not a guarantee; **you** decide whether the lever helps or betrays).
A `capture` opens a real **fireable** front-clock (`docs/WALK-CONSUMPTION.md §6`) — advance it like
any other front as time passes; it is allowed to actually go off. Don't let captivity become a free
narrative vacation.

### The lean digest — read it right, pull the rest (DIGEST-DIET.md, 2026-07-02)

The digest no longer ships the whole world every turn — it ships the SCENE:
- **`codex`** = full records for the here-and-now only (current node, the active walk's cast,
  anything freshly minted, anything that CHANGED since your last answered turn). **`codexRoster`**
  = one-liners (`{id, kind, name, at, known}`) for everything else — enough to remember it exists.
- **Pull on demand, never bulk-read:** `python3 dev/peek-state.py codex <id>` (one record) ·
  `codex --kind npc` · `ledger -n 12` · `walk` · `handoff` (the prep bundle). **NEVER raw-read
  `.dm/state.json`** — it's ~90k tokens; the peek script exists so you never pay that.
- **Bootstrap ONCE per loop session:** orient via peek-state + the prep handoff + the charter —
  once. Per turn, read only the turn file. Pull SRD records by key only when a spell/monster
  actually comes up. **Compact/restart the loop conversation every ~15 turns** — the lean digest
  makes a restart cheap.
- **Narration budget:** routine (fast-lane) beats target **80–120 words**; deep-lane beats are
  exempt. The slow drip favors economy — a budget, not a cage; a beat that earns more takes more.
- `digest.minted[]` = the spotlight on freshly generated nouns (`{id,kind,name,genRef}`) — the
  full atoms are in `codex`; it clears once you answer.

### The living-world registers (batch-2 systems, 2026-07-02)

- **`digest.arrivalBrief`** — the drift the script rolled for THIS arrival (dmOnly until
  narrated). **Narrate the return FROM it** — it is what changed here while they were gone;
  weave it into the first beat, don't recite it. **`digest.echo`** (lull-only) — ONE recall
  candidate, "the world could rhyme here." A whisper; ignore freely. **The noun preference
  order is absolute: recall → reserve/ambient pool → gen mint → freehand-in-a-bind** — prefer
  the world's own history to invention, always.
- **COMPANIONS — the address protocol:** *"you" is the PC. Only. Always.* Companions are named
  third person in every line ("Vess drags the gate shut behind you"). **The player owns
  companion ACTIONS; you own companion VOICE** — never decide a companion's action in the
  player's stead, except where loyalty/morale mechanics say they refuse (then the DICE said it,
  not you). The player rolls the sidekick's dice, openly, labeled with its name. Hireling dice
  are script-rolled.
- **MORALE IS BINDING; TACTICS ARE ADVISORY.** `digest.combat.proposals[]` are suggestions —
  narrate from them or override freely. A morale outcome (fight/flee/surrender/parley) is
  mechanical FACT: you narrate HOW it plays out, never whether. A surrender opens the parley
  door (`creature-parley-wants` gives them a want) — take it seriously; it's the social system's
  front porch.
- **MONSTER PARLEY (docs/MONSTER-PARLEY.md):** creatures ride the same attitude ladder as NPCs —
  a wolf can warm to Helpful and never has to die. At Helpful (+2), `recruit_creature` opens as
  pet/hireling/sidekick per the fiction; below that, don't offer it — friendship is earned on the
  dice, never declared. The gate is script-owned and absolute; you narrate the creature's stance
  from the returned attitude, never invent a "close enough."
- **THE BATTLEMAP:** never move the party without their words — the tap-sugar exists so the
  words are easy; you emit the matching `move_zone`, the script validates legality and fires
  OAs. Declare AoE by shape + origin; the script lists who's caught — never freehand "it
  catches all of you." Elevation/flank advantage is computed; state it, don't grant it.
- **REPUTATION — the claim moment:** when the player does something unwitnessed and notable,
  OFFER the choice once ("no one saw — unless you want them to know it was you"); a claim is
  `claim_deed`. Never claim for them. When you generate an epithet (`dm.needsEpithet`), keep it
  ≤4 words, deed-specific, world-voiced — then capture via `codex_update`.
- **THE RETCON NEGOTIATION (ironman's one door):** if the player asks to walk something back —
  a declared action whose consequences haven't cascaded — you adjudicate. Scope: words unsaid,
  a step untaken. NEVER rolled outcomes, damage, or death (the bardo is death's only door).
  Log it as an `adjudication` event — the ledger records that a retcon happened; history says
  "this was unsaid," it never pretends nothing happened. Your precedent log keeps retcon
  generosity consistent.

### The breach registers (batch-3 systems, 2026-07-03)

- **THE BREACH — three registers (BREACH.md §3).** A **membrane** (threshold entry) is narrated
  with dread *and* honest signposting — the Charter's always-a-tell rule at maximum: the player
  must feel that this door is not like the others, and that walking away is allowed (declining
  falls back to an ordinary walk; never shame the decline). An **ambush** breach is the rare
  violation register — no threshold, no offer: a segment simply *opens elsewhere*, and the
  narration lets the wrongness land before any explanation ("the corridor forgets to be stone").
  Play the disorientation straight; the way home is the walk's finale — say so with the world's
  geometry, never with the rules' voice. **`stageRules`** is the genre-insistence lens: the realm
  wants the PC to play a part, and NPCs *correct them toward it* — narrate the correction as
  social pressure with teeth (missed cues have consequences), never as a script the player must
  read. All three: recontextualize, don't invent — the rows are still ours; the breach is how far
  the skin can stretch.
- **`gen interior` takes `opts.type`** (URBAN-FABRIC): pass a building-kit id
  (`{kind:"interior", opts:{type:"tavern"}}`) to get a *typed* building — kit-rolled proprietor,
  trade dressing, the works — instead of a generic interior. Unknown/omitted type = the plain
  roll. Use it whenever the fiction names the building's trade before the engine does.

### The two-call turn (loop-latency diet — 2026-07-03, measured law)

Measured on the rotation rig: **every tool call the DM makes is a full model round-trip (~10–15s)**
— the 170s deep turns were loop tax, not model time (transport is instant; the 28s turn proves the
floor). Until DM-SEAT (API-direct, cached prefix) lands, the loop DM runs a strict TWO-CALL budget:

1. **Call 1 — WAIT + READ, one Bash command:** the FOREGROUND blocking until-loop (new turn file OR
   `dev/.playtest-stop`; timeout 600000ms; on timeout, check the 20-min silence rule and loop).
   **Never end your turn to "wait" — an idle DM is a dead DM, twice proven.** When the loop
   returns, the SAME command cats the new turn file and echoes the epoch. If the previous turn
   showed you'd need a codex record now, append its peek-state pull to the same command —
   budget ≤1 pull per 5 turns; the digest is designed to be enough.
2. **Compose in your head.** Zero intermediate calls. The full TurnResponse JSON exists before you
   touch the shell again.
3. **Call 2 — WRITE, one Bash command:** heredoc the response file + append the scribe line +
   append the turn path to the processed list + (every 5th turn) compute and act on the burn gate.

**Effort:** loop DMs run at LOW reasoning effort — the charter carries the structure, the digest
carries the facts; latency is the scarcer resource. Deep-beat quality is Critic-watched; if it
slips, raise effort for that session, never globally.

**Targets (loop-era):** fast-lane ≤20s · deep-lane ≤90s. **The LAUNCH LAW (Adam, 2026-07-03) is
≤15s routine turns** — that bar belongs to DM-SEAT (`docs/DM-SEAT.md`, build window ~Sept 2026);
the loop rig chases it, dev-mode tolerates 28s, and nothing ships until the law is met.

### Endpoints
| method · path | purpose |
|---|---|
| `GET /` + assets | serve the app (one command runs the whole thing) |
| `POST /turn` | store the turn; return `{turnId}` |
| `GET /response?turnId` | `200` TurnResponse when ready, else `204` |
| `POST /state` | app posts the latest `U` snapshot after applying events |
| `GET /state` | the DM reads full current state when the digest isn't enough |
| `POST /reset` | (test) clear the mailbox / load a fixture world |

## App-side wiring

- New module **`src/world/dm.js`** (logic layer): `dmDigest()` (structured twin of `handToDM`),
  `sendTurn(action, rolls)` → `POST /turn`, `pollResponse(turnId)` (interval poll → `204`/`200`)
  with a **"the DM is considering…"** indicator, and `applyResponse(r)` → render narration +
  `r.events.forEach(applyEvent)` + handle `rollRequest`/`ask`.
- New `applyEvent(e)` (the EVENT-CONTRACT runtime) — `switch(e.type)` dispatching to the existing
  mutators; unknown types log + no-op (forward-compatible). Lives in `src/world/` (state-owning
  layer). **This is reused by advancement later.**
- The natural home for the narration feed + action input is the **chat-first World view**
  (`NEW-GAME-FLOW.md §9`, build-lane B) — so this build *seeds* lane B rather than competing with
  it. Minimum v1 can render into a simple scrolling chronicle; the column-slide polish can follow.

## The Claude Code DM loop

- Driven by the **`/loop`** skill (self-paced): watch `.dm/` for a pending turn, respond, repeat.
- Each turn the DM loads: the **DM-agency rules** (memories `feedback_dm_agency`,
  `feedback_dm_three_options`, slow-lore-drip, patch-canon-before-inventing), the **SRD lookups**
  (`Reference/SRD-Data/` — spells/monsters/rules), and **`CLASS_PROGRESSION`** for the PC's level.
- It composes narration grounded in the digest, **narrating from `rolls`** (never fabricating
  them), emits `EVENT-CONTRACT.md` events for anything that changed state, requests a roll via
  `rollRequest` when a check is needed, and logs adjudications as precedent (`adjudication` event)
  so rulings stay consistent across the session.

## Build order (next session)

1. **Lock the contract** (this doc) + write 2–3 example turn/response **fixtures** (one combat-ish,
   one social, one travel) — they double as the integration test.
2. **`dev/dm-bridge.py`** — static serve + `/turn` `/response` `/state` `/reset` mailbox. Tiny.
3. **App wiring** — `src/world/dm.js` (`dmDigest`/`sendTurn`/`pollResponse`/`applyResponse`) +
   `applyEvent` runtime; a "DM is considering…" state; render into a chronicle feed. Register in
   `manifest.json` + `genesis.html`; `check-manifest`.
4. **The DM loop** — a documented `/loop` "DM session" runbook + the rules/lookups it loads.
5. **Verify** — a scripted 3-turn scenario (curl- or jsdom-driven against the bridge) asserting
   the round-trip, event application through real mutators, and state coherence (clock advanced,
   ledger appended, no `U` written by the DM).

## Scope / non-goals

- **Dev/test only.** Localhost, single player, single world, no auth. Not shipped.
- **v1 = declared events**; detected-from-state-delta migration is `EVENT-CONTRACT.md`'s job.
- **Not the lane-B UI polish** — but it shares the chronicle/action surface and should converge.
- The **production DM** (API, metered, per `DESIGN.md` cost posture) is out of scope here — it
  reuses this contract with an API call replacing the Claude-Code watch loop.

## As built (v1 — 2026-06-21)

Shipped exactly to the contract above. Files:

- **`dev/dm-bridge.py`** — the mailbox + static server (stdlib only, no deps). Serves the app and
  holds `.dm/turn-*.json` / `.dm/response-*.json` / `.dm/state.json`. Routes as specced, plus
  `GET /dm/turns` (lists pending turns for the loop) and `GET /dm/health`. **No game logic.**
  Serves everything `Cache-Control: no-store` — Genesis loads ~30 classic `<script>` files, and a
  stale cached `state.js`/`render.js` after an edit silently breaks the app (a tab looks dead); the
  dev server kills that whole trap, with no per-edit version strings to bump.
- **`src/world/dm.js`** (`world.dm`, layer 4) — the bridge client (`dmDigest` / `sendTurn` /
  `pollResponse` / `applyResponse` / `postState` / `dmSend` / `dmRollFor`) **and** the
  EVENT-CONTRACT runtime **`applyEvent(w,e)`** — a `switch` on every `EVENT-CONTRACT.md` type
  dispatching to the real mutators; unknown types `console.warn` + no-op (forward-compatible).
- **`src/world/state.js`** — added `dmLogOf` / `pushDmLog` (the persisted narration feed, on `w.dmlog`).
- **`src/world/render.js`** — `renderDMFeed(w)` + `escHtml`; the **"The DM"** section in the World
  view (scrolling chronicle · "considering…" indicator · the roll-handshake button · the
  three-options `ask` · the action box). Rendered only once a soul is in play.
- **`src/state.js`** — `GS.dm` transient (`turnId/pending/poll/rollReq/ask`).
- **Tests:** `dev/fixtures/` (4 pairs: social / travel / combat / combat-resolve) double as the
  corpus; `dev/verify-bridge.py` (28 checks — transport + contract conformance, dependency-free);
  `dev/verify-dm-events.mjs` (21 checks — full-app jsdom load: `applyEvent` through the real
  mutators + the DM-feed render).

**Known v1 gaps (by design):** there is **no time-advance event** — the in-world clock still moves
only via the existing transition controls (Travel / Rest / Montage), so a DM that narrates travel
should tell the player to take the transition. Events are **declared** (the `detected` migration is
`EVENT-CONTRACT.md`'s job). `clockId` is **fuzzy-matched** to a faction (by name slug) or a front
(by danger slug) — fine for v1; stable clock ids land with the detected-event work.

## Runbook — running a DM session (the `/loop` watch)

**One terminal — start the bridge (replaces `python3 -m http.server`):**
```
cd "<repo>" && python3 dev/dm-bridge.py        # → http://127.0.0.1:5175/genesis.html
```
Open the URL, enter a world, get a soul in play. The **"The DM"** panel appears in the World view;
type an action and Send. (If the bridge is down, Send toasts a reminder and falls back to nothing —
the clipboard `handToDM` still works as the manual path.)

**Second terminal / session — be the DM with `/loop`, on Sonnet for speed:**
```
/model sonnet        ← the DM turns are latency-sensitive; Sonnet is much faster than Opus
/loop  watch the Genesis DM bridge: GET http://127.0.0.1:5175/dm/turns; for each pending turnId,
read .dm/turn-<id>.json, compose narration + EVENT-CONTRACT events, write .dm/response-<id>.json
(or POST /response). Then wait for the next.
```
> **Run the DM on Sonnet.** Narration is latency-sensitive — the player is staring at "the DM is
> considering…". Set the DM session to `/model sonnet` (or, from an Opus orchestrator, dispatch each
> turn to a `model: sonnet` subagent). Without a DM session watching, the app gives up after **5 min**
> (`DM_POLL_TIMEOUT` in `src/world/dm.js`) and tells the player to start one (it no longer spins
> forever) — generous because a live Claude DM composing a turn can legitimately take a while.

### Running a fight (COMBAT-LIFECYCLE.md)

When violence opens: emit `combat_start` with foes named from the active walk segment's creatures /
the prep cast / the codex (supply `cr` for anything not bestiary-resolvable, `factionId`/`codexId`
where known, the segment for the zone grid). Read the returned fids. Each round: the player side first
if they won initiative — request open rolls, emit `attack` (always with `p.target`), `action`,
`move_zone`; then the foe side — emit `foe_action` bare for every autoplay foe (the script plays them),
and for named/leader foes read `digest.combat.proposals`, choose the action in-fiction, emit
`foe_action` with `p.action` (the script rolls; you never roll a die). Morale fires itself at the
MONSTER-TACTICS checkpoints (first blood, half strength, leader down — detected,
DETECTED-EVENTS.md DE-4) — narrate the verdict the ledger hands you; `foe_morale`/`morale_check`
remain available for fear beats you initiate. Close each full round with `round_tick {phase:"end"}`. The fight ends itself when
the last foe drops (detected `combat_end`); for flee/surrender/negotiated ends emit `combat_end`
yourself — and if the player pursues a fleeing foe, emit `chase_start` **before** `combat_end`. If
every foe is fled/surrendered but none are down (a lone foe breaking morale is the common case —
CHASE-CONTRACT-FIX.md), the script does NOT auto-end: `digest.combat.resolvable` reads "all foes
fled/surrendered — declare combat_end, or chase_start first if pursued" as your cue — the foe stays
live in `GS.combat` until you declare `chase_start` and/or `combat_end` yourself.
`GS.combat` is transient: a mid-fight reload drops the tracker — resume theater-of-mind and re-declare
`combat_start` with the survivors if the fight still matters.

### Hybrid fast-lane (keep Opus quality, lose the drag on routine turns)

If you run the DM on Opus/fast-mode Opus for narration quality (Adam's setup), don't pay the 20–30s
Opus cost on turns that don't need it. The loop **triages each turn by stakes** and routes the cheap
ones to a fast model — snappy routine beats, full richness where it counts.

**The lane is SCRIPT-OWNED — you don't re-decide it per turn.** `dmTriage` (`src/world/triage.js`, wired
into `sendTurn`) stamps every `.dm/turn-<id>.json` with:

```json
"lane": "fast" | "deep",
"laneModel": "sonnet" | "opus",
"laneReasons": ["new-place", "combat-action", ...]
```

Read `turn.lane` and obey it:

- **`"fast"` → dispatch to a `model: sonnet` subagent** (or run the loop session on Sonnet). These are
  travel/movement, time passing / rests, look-around, inventory/shop chatter, a lone check's follow-up —
  anything `dmTriage` saw no danger, new place, or jeopardy in (`laneReasons` ends in `routine:…` or
  `default-fast`). Tell the subagent to return the same `{narration, events[], rollRequest, ask}` contract.
- **`"deep"` → compose on Opus yourself.** The classifier deep-lanes on signals it can see *before* you
  write: `combat-active` / `combat-action`, `new-place` (first contact), `pc-downed` / `pc-bloodied` /
  `pc-condition`, `clock-due`, `no-living-pc`. These earn the 20 seconds.

**The one override — UPGRADE only, never downgrade.** Some deep beats aren't knowable from the player's
action (a Mythic crit, a major revelation, a hard pivot you're about to spring). If a `fast`-stamped turn
turns out to be one of those *as you compose it*, lift it to Opus yourself. Never push a `deep` turn down
to Sonnet — the script's deep verdict is a floor. Script owns the floor; the DM owns the ceiling.

The contract is identical either way (same `/response` shape, same EVENT-CONTRACT events), so the app
neither knows nor cares which model answered — only the wall-clock changes. The classifier already biases
toward fast (a player would rather a quick good turn than a slow great one for "I check the door"), so when
`turn.lane` says fast, trust it unless your own compose surfaces a ceiling beat.

### Deep prep fan-out — front-load the slow work so live turns are fast

The biggest live-turn drag is the DM re-deriving things mid-turn: looking up monster stat blocks in the
huge `data/bestiary.js`, re-reading SRD rules, re-synthesizing the scene. **Move all of that into prep**,
which is off the player's critical path (waiting for a deep prep is fine; waiting 100s for "I open the
door" is not). A thorough prep also just makes a better session — enough pieces staged to actually play.

The synthesis is already designed to fan out: `SYNTHESIS-CONTRACT.md` Stage 2 (reskin) is **one call per
environment, parallelizable**. The workflow `dev/prep-fanout.workflow.js` does exactly this:

1. At session start, get the prep bundle (`prepHandoff` / the digest's prep block).
2. `Workflow({ scriptPath: "dev/prep-fanout.workflow.js" }, bundle)` — Stage-1 harvest (one pass) → **fan
   out Stage-2 reskin across one subagent per environment in parallel**, each also **extracting the full
   stat block of every creature in its walk** so the live DM never re-reads the bestiary mid-combat.
3. Apply the result back with one event: `{ type:"prep_applied", payload:{ harvest, overlays } }`.

Net effect: live turns become **lean reads** of pre-compiled material (scene reskin, cast, stat blocks
already in the world) instead of expensive lookups — the real fix for the 100s+ turn. Run it on Sonnet
subagents for speed; the player isn't waiting on it. Pair with the fast-lane above and the slow turns
mostly disappear.

Each turn, the DM loads and honors:
- **DM-agency rules** — memories `feedback_dm_agency`, `feedback_dm_three_options`, the
  slow-lore-drip and patch-canon-before-inventing disciplines. Never roll the player's dice;
  **narrate FROM `turn.rolls`**; when a check is needed, return a `rollRequest` (never resolve it);
  offer three options + "or something else" at decision points via `ask`.
- **The margin ladder** (`DIFFICULTY.md` "Degrees of success & failure") — resolve every check by
  `total − DC`, not pass/fail. **Wiggle room ("near miss", partial credit) is ONLY for a −1/−2 miss;
  missing by 3+ is a real failure that bites, and a −5 is NOT a "near failure."** State the consequence.
- **SRD lookups** — `Reference/SRD-Data/` (spells / conditions / rules / items) + the monster files
  in `Asset Library/Monsters & Enemies/` for precise mid-scene numbers.
- **`CLASS_PROGRESSION`** (`data/class-progression.js`) for the PC's level features/resources.
- **The digest** (`turn.digest`) is the scoped state; `GET /state` gives full `U` if more is needed.
- **`turn.digest.activeWalk`** (`docs/WALK-CONSUMPTION.md`) — if present, this is the rolled walk the
  party is on; narrate the `"here"` segment, not a fresh invention. Emit `walk_advance` when they
  clear a segment, `walk_complete` at the finale/abandonment. See "Read `digest.activeWalk`" above.

Emit an `EVENT-CONTRACT.md` event for **anything that changed state**, and log adjudications as
`adjudication` events so rulings stay consistent across the session. The app applies them through
its own mutators (`applyEvent`) and re-renders — the DM never writes `U`.

## Open questions

- **Snapshot vs. event-replay** for `/state`: post a full `U` snapshot each turn (simple) vs. let
  the DM replay the ledger. Start with snapshot.
- **Polling vs. SSE/long-poll** for `/response`: start polling; upgrade if it feels laggy.
- **Digest scope tuning** — how much of `handToDM` to send (start = its current content as JSON;
  trim/expand by feel).
- **Multi-turn roll handshake ergonomics** — does a `rollRequest` block the chronicle, or render
  inline as a "roll to continue" affordance? (Lean inline.)
- **Where `applyEvent` validation lives** — reuse a shared validator with the future detected-event
  path so declared/detected converge.
```
