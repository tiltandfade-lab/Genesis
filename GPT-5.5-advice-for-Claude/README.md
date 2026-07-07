# GPT-5.5 Advice for Claude

This folder is an outside architecture read from GPT-5.5 for Adam and Claude.

Treat this as review/advice, not a binding project law. The repo's existing docs, code, tests, and Adam's current direction remain the source of truth. The point of this note is to help Claude notice possible blind spots after working inside the Genesis rule corpus for a long time.

## Context

Adam clarified that the current DM bridge is intentionally a cheap proving harness: it lets the project test the AI-DM contract through Claude subscription usage before moving to premium per-token API spend. With that framing, the bridge is not the product architecture. The durable architecture is:

- the scoped digest
- the `TurnRequest` / `TurnResponse` contract
- typed `events[]`
- open player dice via `rollRequest`
- on-demand generation via `gen[]`
- deterministic state mutation in the browser
- provider choice handled at the eventual seat/proxy boundary

The current repo looks healthy for that stage. It is in the awkward but normal middle where a dev harness has proven enough that it is starting to resemble production infrastructure.

## Main Architecture Read

The strongest idea in Genesis is still: script owns reality, AI owns interpretation.

Keep pushing mechanics out of DM memory and into deterministic detection. Every event the app can infer from state is one less thing a model must remember to declare perfectly. This matters more than provider choice. Claude, DeepSeek, GLM, Anthropic, OpenAI, or a local model will all be better DMs if the game asks them to narrate and choose, not bookkeeping.

Suggested north-star distinction:

- Bridge/mailbox: dev relay, Claude Code loop, replay harness, cheap live testing.
- Seat/proxy: production adapter, provider keys, model routing, normalized streaming, cost logs.
- Shared contract: digest, `TurnResponse`, events, rolls, generated nouns.

The next maturation is not "replace the bridge." It is "make the harness/product boundary explicit enough that bridge assumptions do not leak into the production seat."

## Second Pass Synthesis

The deeper read after revisiting these notes: Genesis does not mainly need more content. It needs more shared contracts at the points where content becomes play. Most observed weak spots are not imagination failures; they are handoff failures between table result, AI narration, typed event, world state, and UI affordance.

The next architectural layer should be a small set of contracts that many systems share:

### 1. Transition Contract

Movement, time, walk-start, walk-completion, capture, knockout, death, and arrival should be first-class state transitions. Avoid relying on narration like "hours pass" or "we go there" unless it also emits the state event.

High-value events / wrappers to consider:

- `advance_clock { minutes, cause }`
- `move_node { nodeId, travelMin?, cause }`
- `start_walk { nodeId, kind }` as a player/UX-facing wrapper over the current `prep_contact`/`walkSetActive` path
- `hp_changed { delta, nonlethal:true }` or a dedicated `knockout` event for capture/subdual
- `travel_start` / `travel_arrive` if the existing travel-walk path needs a DM-reachable public surface

The clock is especially load-bearing. Difficulty, corpse decay, faction pressure, bardo gaps, rest risk, travel, and deadlines all become softer if time only moves through a few UI paths. The clock should always be ticking: combat rounds, travel, rests, montage, and DM-declared time jumps.

### 2. Scene Risk Contract

Difficulty, breaches, walk skins, nightmare rows, and spicy tables all want the same shape:

```js
{
  dangerBand,
  rewardBand,
  telegraph,
  escapeModes,
  pressureClock,
  deathStakes,
  promisedReward,
  persistentTrace
}
```

This is the fairness contract. A deadly scene is allowed, but it should carry a visible warning, at least one real exit, and a reward or consequence worth the risk. This could become frontmatter/table metadata, walk segment metadata, or a digest slice. The AI DM should not have to infer from prose alone whether a scene is "spooky" or "this can kill you."

### 3. Table Row Contract

The table-language advice can be generalized into one row test:

```text
What is visible now?
What can the player do?
What does it cost or threaten?
What can be gained?
What persists if ignored, used, broken, stolen, or survived?
Which typed event/state bucket would remember it?
```

Rows do not all need every field, but every runtime table should answer at least two of those questions. A row that answers only "what would be cool?" is still adventure-hook food.

Add `table_schema` or `row_contract` frontmatter over time. Then lint by family:

- `item`
- `situation`
- `place`
- `journey`
- `hazard`
- `social`
- `omen`
- `breach`

This is safer than trying to lint "vagueness" by words. The issue is missing function, not specific vocabulary.

### 4. Item Legacy Contract

The item instance model is a major unlock. Use it harder.

Strong items should have lifecycle fields, either directly or through codex linkage:

```js
{
  origin,
  claimant,
  lastSeen,
  lossState,
  recoveryHook,
  factionInterest,
  decayOrChargeRule
}
```

This makes brutal difficulty emotionally profitable. If the PC dies, their best item should not simply vanish or sit inert. It can be looted, damaged, auctioned, mythologized, used by an enemy, or recovered by a successor. That loop justifies more dangerous places and cooler rewards.

### 5. Tarot Receipt

Tarot already has a good session-start draw. The missing payoff is an end-of-session receipt: did the card actually land?

Consider storing a tiny telemetry record:

```js
tarotLanded: [
  { card, via:"walk-skin", ref },
  { card, via:"faction-clock", clockId },
  { card, via:"npc", codexId },
  { card, via:"loot", itemId }
]
```

The player does not need to see mechanics. But the system should know whether The Tower, The Moon, or Six of Coins actually changed play. This will make tarot tunable instead of merely flavorful.

### 6. Provider Eval Should Score State Hygiene

When comparing Claude bridge, DeepSeek, GLM, OpenAI, or any future seat, do not score only prose quality. Score state hygiene:

- required events present;
- no impossible events;
- clock moved when fiction says time passed;
- current location matches narration;
- codex updates survive;
- rolls are honored;
- danger was telegraphed before lethal commitment;
- rewards and losses persisted to the right owner.

This is the best anti-blinders tool. It gives Adam and Claude a way to say "that model felt vivid but leaked state" or "that model was plain but mechanically faithful."

### 7. Suggested Work Order

If choosing what to improve first:

1. First-class time/location transition events.
2. Table schemas for the highest-traffic runtime tables: NPC Hook, NPC knowledge/secrets, walk-related tables, breach/nightmare rows.
3. Danger/reward/telegraph metadata on walks and breaches.
4. Item legacy lifecycle for death/corpse/recovery loops.
5. Tarot visible frontispiece + end-of-session landing telemetry.
6. Provider replay/eval harness scored on state hygiene.

This ordering strengthens the center of the game before expanding edge content.

## Seat-Specific Notes

`src/world/seat.js` is written as though the browser sends provider-agnostic `{system, messages, lane, turnId}` and the bridge adapts provider dialect.

`dev/dm-bridge.py` currently behaves more like a pure OpenAI-compatible passthrough: it expects the browser request to already be the upstream chat-completions body, strips `turnId/lane`, and forwards the rest.

That is fine for a transitional harness, but before a real seat ships, choose one owner:

Recommended: make `/seat` the true adapter boundary.

Browser sends Genesis shape:

```json
{
  "turnId": "t-...",
  "lane": "fast",
  "system": "...",
  "messages": [{ "role": "user", "content": "..." }]
}
```

Bridge maps:

- lane -> model
- provider -> wire shape
- key injection
- provider-specific extras
- normalized SSE frames
- usage/cost logging

This keeps DeepSeek, GLM, Anthropic, OpenAI, and future providers behind one seam.

Also consider using `DM_EVENT_TYPES` directly for seat validation instead of regexing `applyEvent.toString()`. The regex derivation is clever, but the explicit registry already exists and is easier to reason about under refactor/minification.

## Outside The Seat

Clear improvements outside the AI-DM seat:

1. Move more declared events to detected events.
   Combat end, condition expiry, concentration breakage, rest costs, inventory/shop transactions, walk completion, and known combat consequences are all strong candidates where possible.

2. Create a compact runtime contract artifact.
   The docs are rich, but the runtime model wants a terse machine-facing source: event types, payload schemas, accepted aliases, digest shape, and examples. A generated `dm-contract.json` or similar would reduce prompt drift and help tests/providers share one truth.

3. Build replay/eval around real turns.
   Golden turn fixtures should assert: acceptable event types, no forbidden reveals, required HP/resource events present, roll discipline preserved, and narration separately scored. This is how to compare Claude bridge vs DeepSeek vs GLM without relying only on vibes.

4. Keep digest pressure high.
   Context diet is architecture here, not optimization. Keep section-level byte/token budget reports so the digest does not slowly accrete until the seat becomes expensive and fuzzy.

5. Prefer UI-first deterministic workflows when possible.
   Shops, inventory, rest, level-up, companion management, travel choice, and combat actions can increasingly be direct UI/mechanics flows. Let the DM interpret consequences and inhabit the world.

## Battle Visualizer Read

The battle visualizer is stronger than it may look from the outside. The important architecture is:

- `src/engine/theater-data.js` is pure data projection from combat/scene state to board and unit objects.
- `src/ui/theater-boot.js` is the sealed Three.js/WebGL boundary.
- `src/ui/theater-verbs.js` owns the animation vocabulary.
- `src/world/render.js` decides when the stage layout activates and pushes board/unit data.
- `src/world/dm.js` forwards event semantics through `cmTheaterNotify` and `stage_fx`.

Good instincts already present:

- WebGL is optional and cleanly degraded.
- Stage mode waits for a successful `Theater.mount`, so no blank black stage becomes load-bearing.
- The same combat zone grid drives prose, tracker, and 3D board.
- Animation verbs are additive, not hidden mechanics.
- `stage_fx` gives the DM an expressive visual hand without adding rules logic.

Potential improvements:

- Keep `terrain_change` on the radar. `docs/BATTLE-THEATER.md` specs it, but the current event list appears to have `stage_fx`, not a full terrain mutation event. Destructible/modifiable terrain is one of the biggest D&D-battle affordances that would make the stage feel alive.
- Continue treating the stage as a lens, not the game. The accessible prose/summary should remain authoritative.
- Add browser screenshot gates when changing camera, CSS layout, or figure scale. jsdom tests already cover layout seams, but the highest-risk regressions here are visual: blank canvas, cramped board, unreadable units, overlay collision.
- Watch repeated `setBoard`/`setUnits` costs. Rebuilding is fine now, but if larger fights appear, add cheap dirty keys so render passes do not rebuild unchanged GL state.
- The `stage_fx` verb whitelist is good. Keep it narrow and visible rather than letting the DM invent arbitrary animation words.

## Bestiary Manual Read

The bestiary is architecturally valuable beyond being a reference app. It is also a QA surface for the whole creature/model system.

Good instincts already present:

- It reuses live game data (`BESTIARY`, `REALM_BESTIARY`, `MONSTER_FLAVOR`) rather than copying it.
- It reuses the battle figure path via `window.Theater.refFigure`.
- It handles both regular and realm corpora in one normalized `manualEntries()` adapter.
- It exposes stable IDs for Adam's edit requests.
- The grid uses a shared offscreen renderer with 2D blits, avoiding the browser WebGL context limit.
- Detail view uses one dedicated renderer instead of one context per card.

Potential improvements:

- Treat the bestiary manual as a standing coverage dashboard. The model-tier counts are highly useful: registered whole-object vs recipe vs cuboid. Surface those counts prominently.
- Add filters for "needs desc", "needs flavor table", "cuboid fallback", and "realm frame missing/weak" if they are not already fully ergonomic.
- Add an "edit target" copy bundle per creature: id, corpus, modelKey, source file/generator source, and field path. Adam can dictate precise changes; Claude can route them to the right source without hunting.
- For realm entries, be extra loud that stats come from `frame` while flavor/model come from the realm row. This is a common place for future agents to edit the generated artifact or conflate chassis with skin.
- Keep the manual read-only until the source/generator edit path is absolutely explicit. Inline editing would be powerful, but dangerous before source ownership is airtight.

## Authoring Tool Horizon

The Monster Manual and Wiki establish a pattern worth extending: read-only reference instruments
that show live compiled game data, expose source provenance, and give Adam a copyable edit target
without forcing him to scan raw source files.

The next high-value companion is a **Table Atlas**: a Reference Shelf app beside Monster Manual/Wiki,
read-only in v1, over the full table corpus. It should be sortable by spice/Band tier and navigable
by category, table family, source path, and wiring status.
It should answer two questions raw markdown cannot answer quickly:

- what is this table wired to?
- how often does it actually fire in play?

Use the existing artifacts first: `table-registry.json`, `tables.json`, and the table usage audit.
If the usage audit remains markdown-only, split its generator output into a machine-readable
artifact before building the app. Any connection counts as wiring. For frequency, count total rolls
per table from test sessions; Fable can choose the telemetry storage seam as long as the count exists.

Keep it read-only at first. Editor mode should wait until the app can write only to approved source
markdown, regenerate compiled artifacts, run table lint, and show a diff before apply. The dream
endpoint is true in-browser writability, not merely patch export.

The broader dev-tool suite is sketched in `docs/FABLE-DEV-TOOLS.md`: Table Atlas first, then an NPC
Library, Town Builder, and Building Builder. The shared doctrine is the same as the bestiary: live
data, visible provenance, source-safe edits later.

## Files Worth Checking First

Battle visualizer:

- `docs/BATTLE-THEATER.md`
- `src/engine/theater-data.js`
- `src/ui/theater-boot.js`
- `src/ui/theater-verbs.js`
- `src/ui/theater-figures.js`
- `src/world/render.js`
- `dev/verify-battle-stage.mjs`
- `dev/verify-theater-data.mjs`
- `dev/verify-theater-verbs.mjs`

Bestiary:

- `docs/BESTIARY-MANUAL.md`
- `src/ui/ref-bestiary.js`
- `data/bestiary.js` (generated, do not hand edit)
- `data/realm-bestiary.js` (generated, do not hand edit)
- `data/monster-flavor.js`
- `src/ui/theater-figures.js`
- `dev/model-qa/creature-coverage-report.md`

DM architecture:

- `docs/DM-BRIDGE.md`
- `docs/DM-SEAT.md`
- `docs/EVENT-CONTRACT.md`
- `docs/DM-CHARTER.md`
- `src/world/dm.js`
- `src/world/seat.js`
- `src/world/triage.js`
- `dev/dm-bridge.py`

## Spice Curve Update

Adam's latest playtest read should supersede the older conservative spice posture.

The repo's early spice doctrine was calibrated for a younger engine: keep the world mostly stable, make the weird rare, and protect coherence from AI over-invention. That was reasonable then. The current engine is stronger now: ledger, typed events, prep bundles, regions, breaches, battle surfaces, codex state, and digest discipline give the AI DM enough structure to carry a hotter world without dissolving into mush.

Recommended new stance:

- Baseline Genesis should start at "spicy world," not "stable world."
- Grounded should remain present, but it should mean concrete human pressure, scarcity, law, debt, weather, injury, jealousy, and material stakes, never filler.
- Fray should raise both the floor and the tail weight. The rim should become genuinely bizarre.
- Mythic should be rare near home, plausible in high-spice/fray regions, and normal enough at the outer rim that the player learns the map has a reality gradient.
- Keep the Spice Ruler as a band-labeling discipline, but do not use it as distribution cowardice.
- Give the AI DM explicit license to invent connective weirdness, provided durable consequences are captured into typed events, codex, ledger, map state, or other script-owned structures.

Suggested distribution target:

```text
Baseline / spicy world: 25 Grounded / 25 Textured / 25 Strange / 17 Volatile / 8 Mythic
Fray 1:                  10 Grounded / 20 Textured / 35 Strange / 25 Volatile / 10 Mythic
Fray 2:                   0 Grounded / 10 Textured / 35 Strange / 35 Volatile / 20 Mythic
Outer rim / deep breach:  0 Grounded /  0-5 Textured / 25 Strange / 45 Volatile / 25-30 Mythic
```

This is not a call for random nonsense. It is a call to make wonder, danger, and reality strain part of the core reward loop. The player goes outward because the world becomes more interesting per mile.

## Table Language Audit

The most supervised tables are strong because they have a row contract, not just better prose. Use them as style models:

- Realm item tables use `Band | Item | Frame | Ranks | Note`.
- Walk skin tables use `Band | Skin | What it touches | Grants | Motif`.
- Chase complications use `Band | Complication | Env lens`.
- Plot Item and Plot Lock are strong because they always answer what it is, why it matters, and what it opens, proves, or unlocks.

The weak tables are mostly weak because they are single-column abstractions. `NPC Hook` is the clearest example: "needs protection", "someone is following them", "needs leverage", and "something terrible is coming" are useful categories, but they leave the DM to invent the concrete person, object, pressure, cost, and immediate scene. That is hook-food, not play-food.

Recommended table schemas for the rewrite pass:

- Situation/NPC table: `Band | Seen Now | Wants | Pressure/Clock | Leverage/Payoff | If Ignored`
- Item table: `Band | Object | Frame | Use/Ranks | Tell | DM Ripple`
- Place table: `Band | Place | What Is Happening Now | Local Pressure | Player Handle | If Ignored`
- Journey/walk table: `Band | Beat | Immediate Check/Cost | Environmental Lens | Persistent Trace`
- Rumor/hook table: `Band | Claim | Concrete Evidence | Who Benefits | What Happens Tonight`

Keep some plain, grounded rows, but make them plain in-world, not generic in authoring. "A violent creditor demands payment tonight" is better than "they have money trouble" because it has a clock, a person, and a scene. The rewrite rule should be: every row either gives the DM a usable object, a visible situation, a decision, a cost, or a persistent consequence.

Format issues to clean while rewriting:

- Some older files still encode the old 66/20/9/4/1 worldview. With the new spice-floor stance, update descriptions so they do not keep re-teaching conservative distributions.
- Tables marked Fork but containing Volatile/Mythic share-holder rows, like Chase Complications, need their wording reconciled. Either cap the table honestly or let the hot rows be live.
- Add light linting for table shape: required columns by table family, malformed headings, band coverage, and empty/mechanically inert columns. Do not make a naive "ban vague words" linter; words like "someone" can be fine inside a concrete row.

Walk wiring note: the runtime does have a real active-walk path. `prep_contact` calls `lockOnContact`, which calls `walkSetActive`; the DM digest then carries the current segment every turn and asks for `walk_advance` / `walk_complete` events. The likely improvement is UX/procedure: make choosing a rumored frontier visibly trigger the contact/start-walk handshake so the player does not depend on the DM remembering to emit the right event.

## Tarot Authoring Advice

The tarot system is real backend/session machinery, not just a design stub. `data/tarot.js` defines the 78-card deck; `src/engine/tarot.js` draws one card at session start, stores `w.tarot`, derives a session vector, and feeds prep/walk/threat/social/economy nudges. The player currently sees only a log-line omen; card art is deferred and every `assetKey` is null.

Current tarot strengths:

- One draw per session is the right cadence.
- "Card shown, meaning veiled" is a strong reveal policy.
- Minors are systemic, which keeps maintenance sane.
- Majors are authored, which is where the craft belongs.
- The verifier already guards deck shape, no-draw inertness, player/DM separation, and roller integration.

Major Arcana advice:

The Major layer is technically safe but too many cards collapse onto the same few generic knobs. In the current authored set, `archetypeWeight` appears far more often than any bespoke-feeling session behavior. That means cards can differ poetically while landing similarly in play.

For the next supervised pass, do not ask for "better tarot flavor" in general. Ask for a stricter Major schema:

```js
{
  name,
  polarity,
  omen,        // 6-12 words, player-facing
  op,          // script-known operation
  params,      // small typed payload
  dmNote,      // concrete session instruction
  visibleTell, // what the player notices early
  payoff       // how it can visibly land by session end
}
```

Each Major should have:

- one unique table-facing behavior, not only a multiplier;
- one visible omen/tell the player can notice early;
- one durable consequence path through ledger, clock, codex, map, walk, faction, item, or NPC attitude;
- upright/reversed meaning "direct/outward" vs "blocked/inward/crooked/stalled," not simply good/bad.

Useful new ops to consider before regenerating Majors:

- `spotlightThread`: bias prep, walk, and recall toward a specific existing thread.
- `surfaceHiddenFact`: reveal a real hidden `dm` field through a scene.
- `markOmenTarget`: tag one NPC/place/item as the card's carrier for the session.
- `twistReward`: alter the reward shape: treasure, cursed bargain, social access, map truth.
- `pressureFaction`: advance or expose a faction behavior keyed to the card.
- `alterWalkTexture`: apply a concrete session-wide walk motif.
- `offerBargain`: create a typed bargain choice, never forced.
- `echoPast`: bring one saga/life/backstory element into prep.
- `openDoor`: make one blocked path, clue, or contact unusually available.
- `closeDoor`: make one easy route unavailable while pointing to a stranger route.

The strongest current anchors are The Tower and Death: session-scale, consequential, easy to explain, hard to ignore. The Fool and Temperance should not remain blanks unless the desired effect is "this card does little." The Moon should become a flagship weirdness card with visible distortion, not only an invisible lens tweak. The Sun should expose things: inventories, lies, wounds, faction motives, magic, hidden doors, and social costs.

Minor Arcana advice:

Keep minors systemic. Do not hand-author 112 bespoke mechanical effects unless the project wants a maintenance swamp. Minors should be the session weather; Majors should be strange engines.

The current suit mapping is good, but the omen language would benefit from a supervised pass:

- Swords: conflict, pursuit, injury, law, hard truth, force. Not always combat; include legal threats, social knives, ambushes, and hard choices.
- Cups: relationships, memory, longing, betrayal, hospitality, grief. Surface people, reunions, invitations, emotional debts, and leverage.
- Coins: material reality, debt, trade, hunger, tools, property. Affect stock, loot, scarcity, tolls, repair, wages, and ownership.
- Wands: invention, magic, ambition, travel, weirdness, ignition. Push spice, breaches, experiments, discoveries, visions, and movement.

Use a repeatable rank grammar:

```text
Ace: seed / first sign
Two: choice / tension
Three: collaboration / expansion
Four: stability / enclosure
Five: conflict / loss
Six: passage / recovery
Seven: test / temptation
Eight: motion / pressure
Nine: accumulation / strain
Ten: culmination / burden
Page: message / novice / curiosity
Knight: pursuit / momentum / recklessness
Queen: mastery through perception
King: mastery through authority
```

Reversals should not be flatly "bad upright." Prefer:

```text
upright = outward, available, visible, flowing
reversed = inward, blocked, corrupted, misdirected
```

Optional metadata worth adding to minors, even if script use comes later:

```js
tone: "threat" | "offer" | "loss" | "reveal" | "pressure",
handle: "person" | "place" | "item" | "clock" | "cost",
```

This would help the AI DM turn omen poetry into session guidance without making every minor a bespoke mechanical branch.

## Difficulty And Itemization Advice

Genesis can support higher brutality than ordinary SRD play because death is not a campaign failure. The rebirth loop makes death a world event: the character dies, the world persists, time passes, the corpse and loot remain or decay, and the successor enters a changed world. That means difficulty can be tuned around risk, recovery, and inheritance pressure rather than around protecting one continuous protagonist.

Do not solve this with global level scaling. The existing `DIFFICULTY.md` instinct is right: fixed regions, no rubber-band guards, and danger must be telegraphed. Brutality should come from signaled places and choices, not invisible math.

Recommended stance:

- Keep SRD rules as the baseline physics.
- Add Genesis danger layers on top: wounds, morale pressure, item loss, corpse recovery, environmental clocks, faction consequences, and breach/fray escalation.
- Let some areas be genuinely too dangerous for a low-level PC.
- Always telegraph danger before commitment: bodies, rumors, monster signs, impossible weather, faction warnings, map scars, survivor testimony.
- Make fleeing, bargaining, stealth, sacrifice, and clever environmental play real exits.
- A one-shot unwarned trap is still a bug, not difficulty.

Difficulty should be a reward ladder:

```text
Safe / local:       ordinary SRD danger, modest loot, world texture
Risky / frontier:   stronger enemies, harsher clocks, better tools and faction access
Deadly / fray:      real death odds, unusual magic, named loot, permanent world changes
Breach / nightmare: brutal odds, reality-warped items, rare materials, unique relics
Deep breach:        "you may not come back" danger, campaign-defining treasure
```

This unlocks better itemization. If a sword, charm, map, relic, mount, or armor piece can be lost on death and recovered only through play, then items can be stronger, weirder, and more emotionally valuable. The item is not just a stat stick; it is a future corpse-recovery quest, faction prize, auction rumor, enemy upgrade, or legend.

Good itemization loops:

- Dangerous place -> better loot -> player takes risk voluntarily.
- Death with loot -> corpse persists -> successor can recover, lose, or discover who claimed it.
- Enemy loots corpse -> old item reappears as an antagonist's tool.
- Breach treasure -> powerful but context-bearing; it attracts clocks, factions, decay, or reality attention.
- Consumables and charges matter more when difficulty is high and recovery is uncertain.

Add explicit danger/reward tags rather than one hidden "difficulty" number:

```js
dangerBand: "safe" | "risky" | "deadly" | "nightmare" | "mythic",
rewardBand: "ordinary" | "good" | "rare" | "strange" | "legendary",
telegraph: "rumor" | "corpse" | "sign" | "scout" | "map" | "survivor",
escapeModes: ["flee", "bargain", "stealth", "environment", "sacrifice"],
deathStakes: "loot-risk" | "corpse-hard-to-recover" | "bardo-only" | "world-shift",
```

Use these tags in prep, walk generation, breach generation, and DM digest. The AI DM should see not only "this is dangerous" but why it is dangerous, what the player saw before committing, what escape modes exist, and what reward justifies the risk.

Avoid bland difficulty like "+2 AC, +20 HP." Prefer:

- smarter enemy composition;
- terrain that changes priorities;
- pursuit and retreat pressure;
- scarce rests and costly recovery;
- visible enemy tells and weaknesses;
- equipment stress, rust, charges, ammunition, light, encumbrance;
- faction clocks that make delay hurt;
- enemies who use the player's lost gear.

The strongest direction is "brutal but fair, generous but losable." Let the game hand out cooler toys because the world is allowed to take them back, remember who took them, and make the recovery story better than the original pickup.

## Final Bias

Genesis should keep becoming less dependent on a brilliant DM model remembering everything, and more dependent on a narrow, testable, replayable conversation between a model and a deterministic game.

The model can be poetic. The app should be stubborn.
