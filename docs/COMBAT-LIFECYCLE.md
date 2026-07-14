---
type: system-spec
project: Genesis
status: built
created: 2026-07-03
author: Fable (evaluation pass on the in-game battle + transitions)
depends: COMBAT.md · COMBAT-TRACKER.md · BATTLEMAP.md · MONSTER-TACTICS.md · EVENT-CONTRACT.md · DM-BRIDGE.md
---

# COMBAT-LIFECYCLE — the missing seam between the built combat stack and live play

## §0 The finding (why this spec exists)

Every layer of the battle stack is BUILT and unit-green (verify-combat 52/0, -tracker 31/0,
-battlemap 44/0, -combat-actions 38/0, -monster-tactics 47/0, -death-saves 33/0; G2 gauntlet
5,500 sims, 0 crash / 0 corrupt) — **and none of it is reachable in live play.** Verified 2026-07-03:

1. **`combatStart()` (`src/engine/combat.js:549`) has zero app callers.** It is PURE by design —
   "the caller stashes it in GS.combat" — but the only callers are dev harnesses
   (`grep -rn "combatStart(" src/ genesis.html data/` → no hits outside the engine file).
   No `applyEvent` case creates `GS.combat`. `grep -rn "combat_start" src/ docs/EVENT-CONTRACT.md`
   → **zero hits.**
2. **`combatOutcomeEvents()` (`src/engine/combat.js:741`) has zero app callers.** The
   transition-out builder (one `encounter_resolved` + one `kill` per downed foe) is never invoked;
   no `combat_end` event exists. XP, faction escalation, and the chase seam are unreachable from
   a real fight.
3. **The PC's `attack` event never damages the target.** `src/world/dm.js:788` resolves the swing
   and ledger-logs it, but `applyDamage(foe, …)` (`src/engine/combat.js:425`, the only place
   resist/immune/vuln and `foe.down` live) is called by **nothing** in `src/world/`. Even with
   `p.target` supplied, foe HP never moves through the event surface.
4. **`dmDigest()` has no combat block.** `docs/DM-BRIDGE.md:308` references
   `digest.combat.proposals[]` — that field is never built (`grep -n "proposals" src/world/dm.js`
   → only the `foe_action` internals). The DM cannot see round/foes/bands/morale even if
   `GS.combat` existed.
5. **Nothing increments `GS.combat.round`.** `round_tick` reads the round for condition TTLs but
   no code advances it.
6. **Consequences in play:** `foe_action`, `move_zone`, `opportunity_attack`, and fid-targeted
   `grapple`/`shove` all return `{ok:false,reason:"no-combat"}`; the combat panel
   (`src/world/render.js:943`) shows "No fight in progress." forever; the auto-open hook
   (`render.js:204`) never fires; `dmTriage`'s `combat-active` lane (`src/world/triage.js:36`)
   never trips (only the verb regex routes fights deep). The two shakedown runs never had a
   fight, so this was never felt.

**This spec is the orchestration seam only.** No engine edits, no new combat mechanics, no UI
redesign. Three new `applyEvent` cases + one `attack`-case patch + one digest block + one runbook
section + the prose twin. Everything else already exists.

---

## §1 `combat_start` — transition IN (new `applyEvent` case, `src/world/dm.js`)

**Payload** (declared; the DM emits it the moment violence opens):

```js
{ type:"combat_start", payload:{
    foes:[ { name:"Goblin", count:3, cr:0.25,        // name → bestiary resolve; cr = quick-stat hint
             factionId:"f-copper", codexId:"npc12",  // optional; thread through to the kill events
             role:"skirmisher" } ],                  // optional; lane placement hint (engine already reads it)
    objectiveRef:"front:2",                          // optional; gates combat XP (COMBAT.md — unchanged)
    segmentId:"seg-a3",                              // optional; seeds deterministic lane placement
    segment:{ id, dims, feature, hazard },           // optional; the rolled room → zone grid (BATTLEMAP §1)
    scene:{ cover?, hazards?, exits?, elevZones? }   // optional; tracker tags + elevation rule
} }
```

**Seam behavior (in order):**

1. Guards: `typeof combatStart!=="function"` → `{ok:false,reason:"combat-unavailable"}`;
   `GS.combat && GS.combat.active` → `{ok:false,reason:"combat-already-active"}` (ONE fight at a
   time, exactly the `GS.chase` pattern); `livingSheet(w)` required → `no-pc`.
2. Expand `count:N` foe entries into N individual specs **before** calling the engine (the engine
   fids them f1..fn in order).
3. Build the pc arg from the living sheet: `{ name:t.c.name, mods:t.sh.mods, ac:t.sh.ac,
   hp:t.sh.hp, hpCur:t.sh.hpCur }` (the engine reads `mods.dex` for initiative).
4. `GS.combat = combatStart({pc, foes, objectiveRef, segment, segmentId, scene})`.
5. Ledger prose line (this IS the blind-playable transition-in twin — see §6):
   `⚔ Combat — <n> foes: <name (band)>, … <You/the foes> won initiative.` via `addLedger(w,"outcome",…)`.
6. `renderWorld()` — the existing auto-open hook (`render.js:204`) does the panel switch; do NOT
   add a second switch.
7. Return `{ok:true, combat:{round:1, first:GS.combat.first, foes:[{fid,name,band,lane}]}}` so the
   bridge response carries the fids the DM will target.

**Deliberately OUT of v1** (each gets one header-comment line at the case, nothing more):
breach-physics fold-in (`breachApplyPhysicsToCombat` stays report-only per `breach.js:244` —
defer until a physics accessor exists); surprise rounds (DM narrates ambush via the existing
`advantage` params); multi-PC sides.

## §2 The `attack` case applies its damage (patch, `src/world/dm.js:788`)

After `res` resolves and `res.hit && res.damage>0 && targetFoe`:

1. `const dmg = applyDamage(targetFoe, res.damage, res.damageType)` — pass the weapon's damage
   type if `pcAttack`'s result carries one, else `undefined` (typeless: full damage; the engine
   handles resist/immune/vuln when typed).
2. Extend the ledger line with the foe's coarse state via the existing `cmFoeStateWord(f)`
   (`render.js`): `" — Goblin is bloodied." / " — Goblin is down."` Never numeric foe HP (the
   no-foe-HP rule).
3. Then run the §3b auto-end detection.

`p.target` absent (theater-of-mind swing, the pre-existing contract) → behavior unchanged,
byte-for-byte. This keeps every existing verify-combat/-tracker assertion intact.

## §3 `combat_end` — transition OUT (new `applyEvent` case + a detected trigger)

### §3a Declared

```js
{ type:"combat_end", payload:{
    outcome:"resolved"|"fled"|"surrender"|"negotiated"|"pc-dead"|"aborted",
    method:"combat"|"stealth"|"social"|"environmental"|"avoided"   // optional, default "combat"
} }
```

Seam behavior:
1. Guard: no `GS.combat` → `{ok:false,reason:"no-combat"}`.
2. `const ev = combatOutcomeEvents(GS.combat, {outcome, method})` (`combat.js:741` — already
   prices only DOWNED foes; fled/surrendered foes pay nothing, by design).
3. `applyEvent(w, ev.encounter)` then each `applyEvent(w, k)` for `ev.kills` — XP grant
   (`dm.js:1692`) and faction escalation ride the existing cases untouched. Emit these **even on
   `pc-dead`** (downed foes died; escalation is real; `grantXp` to a dead PC is a harmless no-op).
4. Ledger close line (the prose twin): `⚔ The fight ends — <outcome phrase>. <n> foes down<, m fled>.`
5. `GS.combat = null`. `renderWorld()` — the existing `render.js:206` prevPanel restore handles
   the panel teardown; do not add UI code.
6. Return `{ok:true, outcome, downed:n, xpEvents:…}`.

### §3b Detected (the anti-drift half — the script owns "the fight is over")

After **any** event that can change a foe's `down`/`fled`/`surrendered` state (§2's attack patch,
`foe_action` self-damage paths, `foe_morale` flee/surrender/rout application), check: every foe
`down || fled || surrendered`. **All down** → auto-`applyEvent(w,{type:"combat_end",
source:"detected",payload:{outcome:"resolved"}})`, unchanged. **All resolved but ≥1 merely
`fled`/`surrendered`** (CHASE-CONTRACT-FIX.md, 2026-07-04 — the solo-foe-flee race, findings
#1/#2) → do **NOT** auto-fire. Set `GS.combat.resolvable = {outcome:"fled", since:
GS.combat.round}` (idempotent; disposed for free when `GS.combat=null` at `combat_end`) and
surface it via `digest.combat.resolvable` (§4). The foe stays live in `GS.combat` until the DM
declares `chase_start` and/or `combat_end` per §3a/§3d — script owns detection, DM owns the end
decision. Implement as one small helper (`cmMaybeAutoEnd(w)`) called from those three sites — not
a render-time check.

### §3c PC death teardown

Where the death pipeline flips the PC to `dead` (the 3-fails / massive-damage path in
`src/engine/death.js` + the fate/rebirth entry in `src/world/fate.js` — executor: locate the ONE
place `status:"dead"` is committed in world state), add a defensive
`if(GS.combat) applyEvent(w,{type:"combat_end",source:"detected",payload:{outcome:"pc-dead"}})`.
The bardo must never open with a live tracker behind it.

### §3d Chase handoff (order matters — runbook + one harness check)

On a morale flee the player pursues: the DM emits `chase_start` **before** `combat_end` (the
`chase_start` case validates the quarry against the live `GS.combat` foe fid, `dm.js:1931`;
`chaseInit` copies only the fid string, so `GS.chase` survives the combat teardown). Harness
check §7.6 proves the survival. CHASE-CONTRACT-FIX.md (2026-07-04) closed the ordering hole this
contract had for the single most common trigger — a **solo** foe breaking morale and fleeing:
§3b no longer auto-fires `combat_end` while any foe is merely fled/surrendered (only when ALL are
down), so the foe named in `targetFid` is still live in `GS.combat` when `chase_start` runs and
resolves its real name. `chase_start` also carries a defensive fallback (finding #2): if
`targetFid` resolves nothing and exactly one foe on record is `fled`, it names that foe rather
than degrading to the generic "the quarry" label.

### §3e Round advance (closing finding #5)

In the `round_tick` case (`dm.js:1321`): when `phase==="end"` and `GS.combat && GS.combat.active`,
set `GS.combat.round = round+1` and `GS.combat.side = GS.combat.first` (a new round opens with the
initiative winner). The existing TTL sweep runs first, against the closing round — unchanged.

## §4 `digest.combat` (patch `dmDigest()`, `src/world/dm.js:119`)

Present **only** while `GS.combat && GS.combat.active` (zero bytes otherwise — the digest diet
stands, median 9.0KB; this block must stay ≤ ~1KB typical):

```js
combat:{
  round, side, first,
  // resolvable (CHASE-CONTRACT-FIX.md): KEY OMITTED unless GS.combat.resolvable is set (every foe
  // fled/surrendered but not all down) — the DM's cue to declare chase_start and/or combat_end.
  resolvable: "all foes fled/surrendered — declare combat_end, or chase_start first if pursued",
  pc:{ band, lane, hp: hpCur+"/"+hp, conditions:[names] },      // PC numbers are open
  foes:[{ fid, name, cr, band, lane,
          state: cmFoeStateWord(f),                              // "healthy"|"bloodied"|"down" — never numbers
          fled:!!f.fled, surrendered:!!f.surrendered,
          autoplay: autoplayEligible(f),
          conditions:[names] }],
  scene:{ cover:Object.keys(cover||{}), hazards, exits },
  proposals: liveFoes.filter(f=>!autoplayEligible(f))
                     .map(f=>({fid:f.fid, ...proposeTactic(f,GS.combat)}))  // advisory (MORALE stays binding)
}
```

No stat blocks in the digest — the prep handoff already carries every walk creature's block
(`DM-BRIDGE.md:528`); the DM keeps them in-conversation.

## §5 `foe_action` extension — the DM-chosen swing for non-trash foes

Today `foe_action` (`dm.js:1387`) hard-rejects non-autoplay foes (`autoplayEligible`: ≤CR1, no
custom tables, no leader, `monster-tactics.js:214`) — so a CR 3 named foe's swing has **no event
at all** and the DM would have to roll its d20 freehand (an anti-drift violation: the script owns
the numbers).

Extend: when `p.action` (an action name or index from the foe's stat block) is supplied,
**bypass the eligibility gate only** — resolve THAT action via the existing
`resolveFoeTurn(foe, GS.combat, {ac})` machinery (or its underlying `resolveAttack` path if
`resolveFoeTurn` insists on proposing). The DM owns the VERB choice (reads `digest.combat.proposals`,
picks per the creature's custom d10 / fiction); the script owns every die. Without `p.action`,
behavior is byte-identical (`not-autoplay-eligible`).

## §6 The prose twin (BLIND-PLAYABLE — binding doctrine)

The feed IS the battle's prose surface; every seam above ships its ledger line (§1.5, §2.2, §3a.4,
morale/foe-turn lines already exist). Two additions:

1. **`cmbProseSummary(cm)`** (`src/world/render.js`, beside `combatPanel`): one plain-language
   positional paragraph — `"Round 3 — the foes act. Two goblins press you in Melee; the wolf
   circles Near, bloodied; the archer holds Far behind half cover. You are bloodied and
   concentrating on Bless."` Rendered as the first block of the combat panel body (normal visible
   text — it serves sighted players too), inside a `role="status" aria-live="polite"` container so
   a screen reader announces the state each re-render.
2. The round flip (§3e) adds a short ledger line: `— Round 4; <you act / the foes act>.`

Acceptance stays the doctrine's: the fight must be fully followable from the feed + panel prose
with the screen off.

## §7 Verification — `dev/verify-combat-lifecycle.mjs` (new, jsdom over the real `genesis.html`)

Every check RED-FIRST (prove it fails before the seam lands). Mutation checks marked ⊗.

1. `combat_start` → `GS.combat` exists; foes bestiary-resolved with fid/band/lane; `count:3`
   expands to 3 fids; `GS.gamePanel==="combat"` after `renderWorld()`; the ledger carries the ⚔
   prose line. ⊗ (remove the case → red)
2. Second `combat_start` while active → `{ok:false,reason:"combat-already-active"}`.
3. `attack` with `p.target` + a hit → foe `hp` drops, `down` flips at 0; a resistant foe
   (pick one from the bestiary with `resist`) takes half typed damage; ledger line carries the
   coarse state word, never a foe HP number. ⊗
4. Downing the LAST foe auto-emits `combat_end`: PC XP increases (encounter_resolved), a
   `factionId` foe advances that faction's clock (kill → clock_advanced), `GS.combat===null`,
   `GS.gamePanel` restored to the pre-fight panel. ⊗ (disable `cmMaybeAutoEnd` → red)
5. Declared `combat_end {outcome:"fled"}` → fled foes price **zero** XP.
6. `chase_start` (targeting a live fid) then `combat_end` → `GS.chase.active` still true after
   teardown.
7. `foe_action` on a CR≥2 foe: without `p.action` → `not-autoplay-eligible` (unchanged); with
   `p.action` → resolved attack, PC `hp_changed` on a hit. ⊗
8. `dmDigest().combat` present mid-fight with `proposals[]` for non-autoplay foes; **absent**
   after `combat_end`; serialized block < 2KB in the 3-foe fixture. ⊗
9. `round_tick {phase:"end"}` → `GS.combat.round` incremented, side reset to `first`; condition
   TTLs still expire (existing behavior intact).
10. PC driven to `dead` mid-fight → `GS.combat===null` (the §3c teardown), rebirth flow reachable.
11. `cmbProseSummary` output contains round, side, each live foe's name+band+state word.

**Regression sweep (must stay 0-failed):** verify-combat · verify-combat-tracker ·
verify-battlemap · verify-combat-actions · verify-monster-tactics · verify-death-saves ·
verify-dm-events · verify-triage · verify-gap-callers · the full harness sweep ·
`python3 build/check-manifest.py` (no new modules expected; `manifest.json` untouched unless the
executor splits a helper file — don't).

**Docs to update in the same change (coherence discipline):** `EVENT-CONTRACT.md` (add
`combat_start`/`combat_end` rows + the `foe_action p.action` note + the `round_tick` round-advance
note); `DM-BRIDGE.md` (new **"Running a fight"** runbook section — §8 below); `COMBAT.md` +
`COMBAT-TRACKER.md` status lines; `NEXT-STEPS.md`; this file → `status: built`.

## §8 The runbook section (write into `docs/DM-BRIDGE.md` — content, verbatim intent)

**Running a fight.** When violence opens: emit `combat_start` with foes named from the active
walk segment's creatures / the prep cast / the codex (supply `cr` for anything not
bestiary-resolvable, `factionId`/`codexId` where known, the segment for the zone grid). Read the
returned fids. Each round: the player side first if they won initiative — request open rolls,
emit `attack` (always with `p.target`), `action`, `move_zone`; then the foe side — emit
`foe_action` bare for every autoplay foe (the script plays them), and for named/leader foes read
`digest.combat.proposals`, choose the action in-fiction, emit `foe_action` with `p.action` (the
script rolls; you never roll a die). Morale checkpoints per MONSTER-TACTICS (first blood, half
strength, leader down): emit `morale_check` — **the verdict is binding**. Close each full round
with `round_tick {phase:"end"}`. The fight ends itself when the last foe drops (detected
`combat_end`); for flee/surrender/negotiated ends emit `combat_end` yourself — and if the player
pursues a fleeing foe, emit `chase_start` **before** `combat_end`. `GS.combat` is transient: a
mid-fight reload drops the tracker — resume theater-of-mind and re-declare `combat_start` with
the survivors if the fight still matters.

## §9 Decisions made in this spec (doctrine-grounded; flag = needs Adam only if he objects)

| # | Decision | Ground |
|---|---|---|
| 1 | Lifecycle is event-shaped (`combat_start`/`combat_end` through `applyEvent`), not a side-channel | EVENT-CONTRACT thesis: events are the only way state moves |
| 2 | One fight at a time; second start rejected | `GS.chase` precedent |
| 3 | `combat_end` is DETECTED when the last foe drops; declared for every other outcome | detected > declared doctrine |
| 4 | Foe HP is coarse (`healthy/bloodied/down`) in ledger + digest; PC numbers open | no-foe-HP rule, dice transparency |
| 5 | `foe_action p.action` lets the DM pick the verb for non-trash foes; script still owns all dice | engine owns nouns/numbers, DM owns verbs |
| 6 | Kills + encounter_resolved emit even on `pc-dead` | escalation is real; XP no-ops harmlessly |
| 7 | XP objective-gate untouched | COMBAT.md "don't tune twice" — retune after live playtests |
| 8 | Breach physics, surprise rounds, multi-PC sides: OUT of v1 | scope discipline; each is one comment line |
| 9 | Mid-fight reload drops the fight (GS is transient by design); runbook owns the recovery | TEXT-FIRST/event-sourcing: the ledger already tells the story |

**Execution note (the standing pipeline):** Sonnet executes this spec on branch
`feat/combat-lifecycle`; Opus reviews the diff (`/code-review`); never trust self-reported green —
re-run the §7 sweep on the merged tree. The G2 lethality finding (G2-1976: L1 Fighter vs CR10
winRate above the 0.10 gate) is a separate tuning item and deliberately NOT part of this seam.
