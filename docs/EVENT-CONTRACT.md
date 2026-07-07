---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-21
---

# Event Contract — the DM ↔ Script Interface

The spine of advancement, difficulty, and combat. This doc defines the **only** way game
events become state. The other three specs (`ADVANCEMENT.md`, `DIFFICULTY.md`, `COMBAT.md`)
reference the event types defined *here* rather than restating them — that's what keeps the
four docs from drifting against each other.

## Thesis

Genesis exists because AI DMs drift over long play. The fix is the same one used for world
state: **the script owns state; the AI only interprets.** Applied to advancement, that means
the DM never invents a number. It **reports what happened as a typed event**, and the script
computes the consequence (XP, escalation, leveling) from the rules. XP becomes a state machine
the DM feeds — not a value it improvises.

## Core principle: detected > declared

Every event carries a `source`:

- **`detected`** — the script derived the event from an observed change in world state (a
  faction clock hit max; a front's status flipped; a write-once fact landed). The DM didn't
  have to report it; the script *saw* it. **Prefer this.** It is the tightest container —
  the DM can't forget it, inflate it, or fake it.
- **`declared`** — the DM reported something the script can't yet observe (a clever social
  resolution, a meaningful choice with no mechanical footprint). The fallback. Every declared
  event is a candidate to promote to detected later by giving the script a state hook for it.
- **`player`** — a direct player UI action on their own sheet (inventory equip/stow/grip/
  attune/use; the level-up claim). Not a DM assertion at all — the player's own hand.
- **`branch`** — a pre-declared roll-branch resolved app-side (`resolveBranch`, ROLL-BRANCHES
  §2): the DM declared the consequence sets before the roll; the dice picked which one applied.

**Design pressure, always:** move events from declared → detected. The more advancement is
driven by observed state deltas, the less the DM can drift.

## Event envelope

```
{
  type:    <event type, below>,
  payload: { ...type-specific fields },
  source:  "detected" | "declared" | "player" | "branch",
  sessionClock, worldClock,        // the two existing counters
  ledgerRefs: [ ...affected ledger ids ]
}
```

The script validates each event against this contract, applies it (ledger write + any XP /
difficulty consequence), and returns a **state delta the DM must honor in narration**. The DM
does not get to contradict the returned state — that is the anti-drift guarantee.

## Event taxonomy (v1)

| type | payload | usual source | consumed by |
|---|---|---|---|
| `front_closed` | `{ledgerId, frontId?, factionId?, how?}` (aliases `clockId/id→ledgerId`) | detected (ledger status flip) | ADVANCEMENT (XP), DIFFICULTY |
| `clock_fired` | `{clockId, factionId, forPlayer}` (aliases `id/faction→clockId`) | detected (clock → max) | ADVANCEMENT, DIFFICULTY |
| `clock_advanced` | `{clockId, delta}` (aliases `id/faction→clockId`, `by→delta`; ids come from the digest's `powers[].clockId` / `fronts[].clockId`) | detected | DIFFICULTY (escalation) |
| `fact_canonized` | `{what, factId?}` (alias `text→what`) | detected (write-once fact) | ADVANCEMENT (discovery) |
| `discovery` | `{what, makeNode?, nodeId?, reveal?:{factions,pressures}, enter?, travelMin?}` (alias `name→what`) | detected (new node / lazy-history reveal) | ADVANCEMENT. TRANSITION-CONTRACT.md §3.3 (BUG-05): `enter:true` also relocates the PC to the discovered node via `pcMoveTo` (default 60min approach, or `travelMin` if supplied) — UNLESS a walk is already active, in which case the node still mints but the move is skipped (`{moved:false,reason:"walk-active"}`) |
| `codex_add` | the `codexAdd` rec contract `{kind, name, id?, rolled?, fields?, dm?, links?, status?, provenance?, source?, shape?, origin?, ledgerRefs?}` | declared/detected (mint/merge a record) | CODEX — **ROOT-C**: an id-less mint whose derived id lands on an ESTABLISHED record (known or hard) is REFUSED `{ok:false, reason:"id-collision", existing:{…}}` (never silently merged); soft+unknown records still merge; a content-bearing merge onto an established record drift-ledgers |
| `codex_update` | `{id, name?, fields?, dm?, status?, shape?, note?}` | declared (revise interpreted fields/status) | CODEX — `note` APPENDS to `dm.notes[]` (DM-only, accumulates); a missing id ⇒ `{ok:false, reason:"no-record:<id>"}` |
| `codex_link` | `{from, rel, to}` | declared (DM, the scene reveals a typed relationship) | CODEX — `codexLink(w, from, rel, to)`, a wikilink edge (`allied\|owes\|fears\|kin\|employs\|…`) between two existing codex ids; refuses `{ok:false,reason:"codex-unavailable"}` if the codex layer isn't loaded |
| `codex_reveal` | `{id}` | declared (DM, slow-drip: the player now knows OF this entity) | CODEX — `codexReveal(w,p.id)` + `reveal(w,'gaz')`; refuses `{ok:false,reason:"codex-unavailable"}` if unavailable |
| `codex_contact` | `{id}` | declared (DM, the player TOUCHED it — met/re-engaged in the fiction) | CODEX — `codexContact(w,p.id)` locks the record to canon forever (§8b); ledgers a `codex-contact` canon line; returns `{ok:!!r}` |
| `social_check` | `{target, skill, total, natural?, dc?, cause?, lever?, levers?, caughtLie?, overshoot?}` | declared (the PC's open social roll — skill + total + visible levers) | SOCIAL.md §5 — `resolveSocialCheck` prices the DC from the target's CURRENT attitude (`socialDC`+`applyLeverage`) and COMPUTES the shift (never DM-inflated); commits via `codexSetAttitude`/`codexSetTerrified`; ANOMALY LAW §2b clamps ordinary creature-attitude gains at +1 (Friendly) unless `natural===20` (the bond-eligible anomaly); prices REPUTATION renown on a decisive (ceiling/floor/terrified) outcome; refuses `{ok:false,reason:"no-target:<id>"}` on an unknown target |
| `attitude_shift` | `{target, to, cause?}` | declared (a story-beat/group-cascade shift) or detected | SOCIAL.md — an ABSOLUTE set via `codexSetAttitude(w,p.target,p.to,...)` (not a delta); `to` omitted ⇒ `{ok:false,reason:"no-target-attitude"}` (malformed, no ledger echo) |
| `morale_check` | `{creature?, trigger?, dc?, save, mods?, outcome?}` | declared (the DM rolls the creature's Wis save in the open) | SOCIAL.md — `resolveMorale({save,dc})` verdicts held/broke; on broke, `outcome` supplies the DM's declared Morale Outcome route (flee/surrender/parley); `dc` defaults from `moraleDC(trigger,mods)` |
| `parley_open` | `{target\|npc\|creature, openingAttitude?, floor?, ceiling?, want?}` | declared (DM opens the §2 parley loop on a creature/NPC) | SOCIAL.md/MONSTER-PARLEY — `codexAttitudeOpen` stamps the opening attitude ONCE (REPUTATION §3 nudges it by faction renown first); `want` defaults from a live `GS.combat` foe's stashed `parleyWant` (a broke-to-surrender morale check) when omitted; refuses `{ok:false,reason:"no-target:<id>"}` |
| `insight_read` | `{target, total, dc?, guarded?, masking?, mentalMods?, bestMentalMod?}` | declared (the PLAYER's open Insight roll) | SOCIAL.md §6 — the player's roll vs. the (hidden) scaled `insightReadDC`; on success, `codexMarkAttitudeRead` reveals the target's CURRENT attitude; refuses `{ok:false,reason:"no-target:<id>"}` |
| `gift` | `{target, what?, from?, given?, weight?, factionKey?, regionId?, at?, witnessed?, day?, deedRef?}` (aliases `to→target`, `item→what`) | declared (the PC gives an NPC something) | REPUTATION renown + codex gift-memory |
| `epithet_grant` | `{text}` (alias `epithet→text`) | declared (an earned by-name) | REPUTATION — stamps the PC's epithet |
| `hire` | whole-payload-pass — fields per `hireCompanion` (`src/world/companions.js`): `{codexId, role?, wage?, shares?}` | declared (DM, mints a hireling off an existing rolled codex NPC) | COMPANIONS.md §1 — `hireCompanion(w,p)`; whole payload forwarded unjudged (not in `DM_EVENT_FIELDS`) |
| `dismiss` | `{hirelingId}` | declared (DM, release a hireling — no death, no grief thread) | COMPANIONS.md — `dismissCompanion(w,p.hirelingId)` |
| `tend_pet` | `{target}` | declared (DM judges WHEN the tend beat lands, DM-CHARTER §8.3b) | MONSTER-PARLEY §2 — stamps `pet.tendedDay`; a rest-gate neglect tick within 1 day of `tendedDay` holds loyalty steady; refuses `{ok:false,reason:"no-pet:<id>"}` |
| `companion_update` | `{hirelingId?, delta?, cause?}` OR `{action:"promote-sidekick"\|"sidekick-level"\|"sidekick-loyalty"\|"sidekick-death", pcLevel?, delta?, cause?}` | declared (DM, a loyalty nudge or sidekick promotion/level) | COMPANIONS.md §1/§3 — default path nudges a hireling's loyalty (`companionAdjustLoyalty`); `action` routes to `promoteSidekick`/`companionSidekickLevelWith`/`companionSidekickAdjustLoyalty`/`companionSidekickDies` |
| `recruit_creature` | `{codexId, tier?:hireling\|pet\|sidekick, statBase?, className?, cr?, role?, wage?, shares?, wageNote?}` | declared (DM, the ladder's top rung) | MONSTER-PARLEY §2 / ANOMALY LAW §2b — SCRIPT-OWNED absolute gate: `kind:"creature"`, attitude `===+2` (Helpful), active, AND `rec.fields.bondEligible===true` (stamped only by the nat-20/decisive-lever/friendly-spawn anomaly channels in `social_check`); refuses `"not-a-creature"`/`"not-active"`/`"not-helpful"`/`"no-bond"` — no partial credit, no DM override; `tier` routes to `mintPetCompanion`/`promoteSidekick`/`hireCompanion` |
| `encounter_resolved` | `{foes:[{cr,victimClass}], method, objectiveRef?, outcome}` | declared→detected | ADVANCEMENT, DIFFICULTY |
| `kill` | `{victimClass, factionId?}` | declared (until combat engine emits it) | DIFFICULTY (escalation) |
| `choice_logged` | `{weight:minor\|major, forecloses:[...]}` | declared | ADVANCEMENT |
| `claim_deed` | `{weight?, factionKey?, regionId?, deedRef?\|ledgerRef?}` | declared (DM, the §2 CLAIM verb — the player announces authorship of a deed already on record) | REPUTATION §2 — `repuClaimDeed(w,{...})`; `ledgerRef` is the accepted alias-in-practice for `deedRef` (the handler reads `p.ledgerRef\|\|p.deedRef`) |
| `xp_granted` | `{}` — **NO-OP by design** | N/A — never DM-declared | DM-CHARTER §8.3b: XP is DETECTED from the priced beat-events (`front_closed`/`clock_fired`/`choice_logged`/`encounter_resolved`), never granted directly. A raw `xp_granted` is ignored (`console.warn` + `{ok:false, reason:"xp-not-dm-granted"}`) so the door closed in the 2026-06-28 rebalance can't reopen |
| `inspiration_granted` | `{pc, reason}` | declared (DM judgment) | sets `sh.inspiration=true` (SRD-MECHANIZATION §1 — a mechanized spend-to-reroll token, not just play-quality) |
| `check` | `{kind:skill\|save\|ability, key, dc, d20, advantage?, bonus?}` | declared (the player's open roll) | `resolveCheck`/`resolveSkillCheck`/`resolveSaveCheck`/`resolveAbilityCheck` (SRD-MECHANIZATION §1) — returns `{total,natural,success,margin,degree}`, the DIFFICULTY margin ladder as a COMPUTED value |
| `inspiration_spend` | `{on:check\|attack\|save, o, d20b}` | declared (spend the flag, reroll) | reruns the original resolver with the new d20 (`d20b`), clears `sh.inspiration` |
| `cast` | `{spell, level?, ritual?, concentration?}` | declared (player casts) | (§2) the marker that owns concentration + ritual: auto-drops any prior concentration on a recast, spends a slot UNLESS ritual (ritual adds 10 min instead) |
| `concentration_start` | `{spell}` | declared/detected (usually rides `cast`) | `startConcentration` — sets `sh.concentration`, auto-drops any prior |
| `concentration_broken` | `{cause}` | detected (failed damage-save / 0-HP / incapacitating condition) or declared (DM drop) | `breakConcentration` + lifts any §3 condition tagged `{ttl:{concentration:casterId}}` |
| `condition_add` | `{itemId, condition}` OR `{target:"pc"\|fid, condition, ttl?, n?}` | declared | **widened (§3)**: an `itemId` tags one inventory instance (`ITEM_CONDITIONS`); a `target` tags a creature/the PC with a §3 condition + a structured `ttl` (`{rounds}\|{untilSave}\|{endOfNextTurn}\|{concentration:casterId}\|{indefinite}`) — EXCEPT `condition:"exhaustion"`, which routes to `addExhaustion` (§5, its own 0–6 counter, not the §3 table); `n` sets how many levels (default 1) |
| `condition_remove` | `{itemId, condition}` OR `{target, condition}` | declared | untags it (either holder kind) |
| `condition_expired` | `{target, condition}` | detected (a `ttl` counter lapsed) | lifts the condition — the DM narrates the lift without deciding when |
| `round_tick` | `{round?, phase?:start\|end}` | detected (a turn boundary) | (§3) `tickConditions` for every live holder (the PC + every `GS.combat` foe) — advances `{rounds}`/`{endOfNextTurn}` counters and AUTO-emits `condition_expired` per lapse; the container the DM can't forget to close. COMBAT-LIFECYCLE.md §3e: on `phase:"end"` while `GS.combat.active`, ALSO advances `GS.combat.round` (+1) and resets `GS.combat.side` to the initiative winner — the TTL sweep runs first, against the closing round |
| `death_save` | `{d20}` | declared (the player's open roll, each round dying) | `resolveDeathSave` (§4): 10+ success, nat20 revive+1hp+clear, nat1=2 fails; 3 succ→stable, 3 fail→dead (→ Death & Rebirth) |
| `temp_hp` | `{n}` | declared (a grant — Aid/False Life/etc.) | `grantTempHp` (§4): takes the HIGHER of current-vs-new (never stacks) |
| `action` | `{kind, target?, dir?, ally?, trigger?}` | declared (a standard action) | `standardAction` (§6): Dodge/Disengage/Dash/Help/Ready/Hide/Search/Study/Utilize — spends the Action budget + applies the real mechanical effect |
| `opportunity_attack` | `{foe, d20?}` | detected (an undefended Melee-leave) | resolves the named foe's swing (engine-rolled unless `d20` supplied) against the PC, applies damage |
| `grapple` | `{target, d20, bonus?, defenderD20?}` | declared (the PC's open Athletics roll) | `resolveGrapple` (§6): CONTESTED vs the target's higher of Athletics/Acrobatics, tie favors the defender |
| `shove` | `{target, d20, bonus?, defenderD20?, intent?:prone\|push}` | declared | `resolveShove` — same contest shape; `intent` names the declared outcome on success |
| `combat_start` | `{foes:[{name,count?,cr?,factionId?,codexId?,role?}], objectiveRef?, segmentId?, segment?, scene?}` | declared (DM, the moment violence opens) | COMBAT-LIFECYCLE.md §1 — `combatStart()` into `GS.combat` (ONE fight at a time, mirrors `GS.chase`); `count:N` foe specs expand to N individual fids BEFORE the engine call; the pc arg builds off the living sheet; returns `{combat:{round,first,foes:[{fid,...}]}}` so the DM can target fids |
| `combat_end` | `{outcome:resolved\|fled\|surrender\|negotiated\|pc-dead\|aborted, method?}` | DETECTED (the last live foe drops — `cmMaybeAutoEnd`, fired off the `attack` case, `foe_action`'s self-damage paths, and `foe_morale`'s flee/surrender/rout application) or declared (every other outcome) | COMBAT-LIFECYCLE.md §3 — `combatOutcomeEvents()` prices only DOWNED foes (fled/surrendered foes pay zero XP); emits one `encounter_resolved` + one `kill` per downed foe (even on `pc-dead` — escalation is real, XP to a dead PC no-ops harmlessly); `GS.combat=null`. A live `GS.combat` also tears down defensively the moment the PC dies (§3c, `killCharacter`) so the bardo never opens behind a live tracker. On a morale-flee pursuit, emit `chase_start` BEFORE this event — `chaseInit` copies only the fid string, so `GS.chase` survives the teardown (§3d) |
| `foe_action` | `{foe, action?}` | declared (DM) | MONSTER-TACTICS §3 — `foe.action` absent: autoplay only (CR<=`AUTOPLAY_CR_MAX`, no custom table, not the leader) via `resolveFoeTurn`, else `not-autoplay-eligible` (unchanged contract). COMBAT-LIFECYCLE.md §5: `action` present (a name or 0-based index into the foe's stat-block actions) BYPASSES the eligibility gate and resolves THAT action via `resolveAttack` directly — the DM picks the verb (reading `digest.combat.proposals`), the script still rolls every die |
| `hazard_tick` | `{kind:fall\|on-fire\|suffocating\|drowning, feet?, holdRounds?, roundsHeld?}` | declared/detected | (§5) `resolveFall`/`hazardTick` — falling rolls the SRD bludgeoning formula; on-fire reuses ITEMS.md §D's Burning rate; suffocating/drowning run the hold-breath-then-drop timer |
| `crit_outcome` | `{natural, magnitude, tier, scope, lenses:[{row,lens,detail,placeHandoff}], cascade, placeHandoff, mythSeed?}` | declared (DM, from the `rollCritMagnitude` payload) | CRIT-MAGNITUDE (Mythic→Ledger canon, amplified→outcome) |
| `level_applied` | `{pc, from, to}` | detected (threshold + rest gate) | ADVANCEMENT |
| `prep_applied` | whole-payload-pass — the synthesis result `applyPrep` consumes (`src/world/prep.js`) | declared (DM's session-prep synthesis pass) | SESSION-PREP — `applyPrep(w,p)` enriches the soft frontiers; whole payload forwarded unjudged (not in `DM_EVENT_FIELDS`) |
| `prep_contact` | `{nodeId, enter?}` | declared (DM, the player enters a rumored frontier) | SESSION-PREP — `lockOnContact(w,p.nodeId)` locks the frontier to canon; `enter:true` now moves via `pcMoveTo` (TRANSITION-CONTRACT.md §3.4) — the soft edge's `travelMin` if >0, else 60 (soft edges mint with `travelMin:0` today, so this resolves to 60) |
| `adjudication` | `{situation, ruling, precedentId}` | declared | precedent ledger |
| `hp_changed` | `{delta, crit?, meleeAdjacent?, nonlethal?}` | declared (damage `<0` / heal `>0`) | resources (clamp 0..maxHP). TRANSITION-CONTRACT.md §3.7 (BUG-04): `nonlethal:true` on a drop to (or already at) 0 KOs (`applyKnockout`) INSTEAD of entering the death-save ladder — UNLESS the PC was already actively dying (non-lethal damage can't convert dying→stable, E16). Lethal damage on an already KO-stable PC clears the KO and re-enters the auto-fail ladder (E17 — the mercy was the non-lethal choice). `nonlethal` with `delta>0` is ignored (E24, ordinary heal) |
| `attack` | `{d20, targetAC, slot?, cover?, advantage?, crit?, attackIndex?}` | declared (player's open roll) | resolves the PC's EQUIPPED-weapon swing (pcAttack→resolveAttack: base+magic damage, ability+prof+magic to-hit); `null` weapon → DM resolves manually. `attackIndex` (§6, Extra Attack) is the 0-based Nth swing this Action — `attacksPerAction(sh)` (CLASS_PROGRESSION-derived) gates how many are legal |
| `slot_spent` | `{level}` | declared (UI/direct) — folded when it rides a `cast {level}` in the same response (DETECTED-EVENTS.md DE-3: `dmFoldSlotSpends`, applies as a no-op ledger line rather than double-spending) | resources (Vancian, falls back to pact) |
| `resource_spent` | `{key, n?}` | declared | resources (Rage / Bardic Inspiration / Channel Divinity / Focus / Sorcery Points / Action Surge) |
| `rest` | `{kind: short\|long}` | declared (or `passTime` UI) — costs/riders detected via `restRiders` (DETECTED-EVENTS.md DE-1: lodging, camp-cooking, wages, pet tick, rest-risk, charge refill, exhaustion, level-up claim — unified across both callers) | resources (restore slots + HP + per-rest pools) |
| `item_changed` | `{removeAll?, removeIds?:[id], add?:[{name,qty?,base?,ench?,bonus?,codexId?}], gold?:delta, force?, note?, takenBy?:{kind:npc\|creature\|faction, ref?, name?}}` | declared | the living PC's `sheet.inventory`/`sheet.gold`; `add` mints the congruent overlay (base/ench/codex — §E) and is REFUSED if it would breach the STR×30 hard cap (`force:true` overrides — Dec 4). **ITEM-LEGACY §2.2**: a removed legacy-grade instance with a `codexId` folds a detected `item_claimed` — `takenBy` (kind npc/creature/faction) → `claimed-<kind>`, else the removal is a DROP (`lossState:"dropped"`); a re-granted storied item whose record says it left overlay-restores its ench/base from `instSnapshot` and returns to `held` |
| `item_split` | `{itemId, qty}` | declared | splits `qty` off a stackable instance into a new instance (its own id) |
| `item_use` | `{itemId, roll?}` | declared (player drinks/applies a consumable) | fires the consumable effect (heal numeric / buff structured / harm) + consumes one; `roll` supplies the player's own heal roll |
| `charge_spend` | `{itemId, n?}` | declared (activate a charged magic item) | spends N (default 1) off `inst.ench.charges.cur` |
| `charge_restore` | `{itemId, n?}` | declared | restores N charges, or refills to max if `n` omitted (long rest auto-refills) |
| `condition_add` | `{itemId, condition}` | declared | tags one inventory instance (`condition` ∈ `ITEM_CONDITIONS`, `data/items.js`) |
| `condition_remove` | `{itemId, condition}` | declared | untags it |
| `item_rust_exposure` | `{itemId?, kind: rain-combat\|submersion\|acid}` | declared (rain-combat/acid — no weather/hazard signal exists yet to detect them); submersion ALSO has a detected path (`walkComplete` off a travel walk's rolled "water" leg) that calls `applyRustExposure` directly, bypassing this event | docs/DURABILITY-TRIO.md §2 — a mundane metal instance (`itemId` omitted = every carried instance) rusts: first qualifying exposure sets `rusting` (a TELL — NOT in `ITEM_CONDITIONS`, written directly to `inst.conditions`, never worse without a second exposure), a second un-maintained exposure upgrades to `rusted` (`ITEM_CONDITIONS`' parked entry, docs/ITEMS.md §D — now wired: weapon damage die steps down one size, armor/shield −1 AC). Any rest auto-clears it (`rustMaintainAll`, from `passTime`) |
| `item_claimed` | `{codexId, by:{kind:pc\|npc\|creature\|faction\|corpse\|none, ref?, name?}, lossState:<LEGACY_LOSS_STATES>, at?, factionInterest?, note?}` (aliases `id/item→codexId`) | detected (death/claim/scavenge/`item_changed` fold) or declared (off-screen custody: an NPC sells it to a faction, the DM casts the unknown holder, destruction) | **ITEM-LEGACY §2.1** — the single custody-transition event; writes `r.legacy` on the CODEX item record (`legacyStamp`), never the instance. Refuses `{ok:false,reason:"no-item-record:<id>"}` (missing/non-item), `"bad-loss-state:<x>"` (not in `LEGACY_LOSS_STATES`), `"bastion-parked"` (`lossState:"cached"` — the parked-Bastion seam, §7.3). A re-declared identical claim → `{ok:true,unchanged:true}` (no ledger line). Transition out of `held` to a non-PC holder mints a recovery-hook thread; return to a PC's hand resolves it; `destroyed` → claimant none + hook resolved + record persists (legend) |
| `equip` | `{itemId, slot: mainHand\|offHand\|armor}` | declared | `sheet.equipped[slot] = itemId` (clears whatever was there) |
| `unequip` | `{slot}` | declared | `sheet.equipped[slot] = null` |
| `set_grip` | `{grip: 1h\|2h}` | declared (Versatile wield choice) | `sheet.equipped.grip`; 2h needs a free off-hand (Dec 1) |
| `attune` | `{itemId}` | declared | binds a magic item; enforces the SRD max-3 cap (its ench is dormant until attuned) |
| `unattune` | `{itemId}` | declared | releases attunement (frees a slot) |
| `walk_advance` | `{toSeg, nodeId?}` | declared (DM, party clears a segment) | WALK-CONSUMPTION (moves the active-walk cursor; `nodeId` defaults to the active walk) |
| `walk_update` | `{seg, overlay, nodeId?}` | declared (DM, captures a segment's room-die) | ON-DEMAND-GEN §4 — `walkUpdateSegment(w,p.seg,p.overlay,p.nodeId)`; `overlay` carries the rolled `{effectDie, rolledFace}` for that segment |
| `walk_complete` | `{nodeId?, abandoned?}` | declared (DM, finale resolved / walk left) | WALK-CONSUMPTION (finalize provenance + promote/reskin the next frontier) |
| `capture` | `{captorFactionId?, disposition?, holdingSeg?, leverId?}` | declared (DM, on subdual) | WALK-CONSUMPTION §6 (re-entry into a holding segment; all fields script-filled if omitted) |
| `open_shop` | `{shopId?, codexId?, tier?, archetype?, nodeId?, name?}` | declared (DM, on entering a shop / talking to a merchant) or the dev "Open test shop" affordance | docs/SHOP-UI.md §2b — reopens a known `w.shops[shopId]` (depleted coin/stock persist) or mints one via `makeShop`, links `codexId` if given, sets `GS.activeShopId`/`GS.gamePanel='shop'` |
| `district_mint` | `{nodeId?, tier?}` | declared (DM, mints this node's districts on first entry) | URBAN-FABRIC.md §2 — `mintDistricts(w, nodeId\|\|w.currentNodeId, {tier})`; idempotent (safe to re-fire on a node already minted) |
| `building_approach` | `{buildingType, nodeId?, name?, tier?}` | declared (DM, a typed building comes into view) | URBAN-FABRIC.md §1/§3 — `buildingApproach` mints the building SOFT (unlocked until contact); ledgers an approach line; returns `{id, proprietorId, shopId?}` |
| `building_contact` | `{id}` | declared (DM, the player TOUCHES the building) | URBAN-FABRIC.md §3/§4 — `buildingContact(w,p.id)` locks it to canon + surfaces its tavern/interior; ledgers a canon `building-contact` line |
| `job_board_read` | `{nodeId?, tier?}` | declared (DM, the player reads a notice board) | JOB-WALKS.md §1 — `jobBoardRead(w,{nodeId,tier})` returns 2-3 tier-scaled postings; read-only, no mint |
| `job_accept` | `{postingId}` | declared (DM, the player accepts a posting) | JOB-WALKS.md §2 — `jobWalkAccept(w,p.postingId)` mints a real 1-3 segment walk off the accepted posting |
| `chase_start` | `{targetFid \| npcId, terrain?}` | declared (DM, on a resolved morale-flee + declared pursuit) | GAP-WIRING §1 — `chaseInit` into `GS.chase` (the transient gap clock, one at a time like `GS.combat`); the quarry is a live `GS.combat` foe fid XOR a codex npc id |
| `chase_round` | `{pursuerWon}` | declared (DM, `pursuerWon` from an already-resolved opposed check) | GAP-WIRING §1 — `chaseRound(GS.chase)`: shifts the gap, FIRES one `chase-complications` roll, ends at contact (gap 0) / away (gap = gapSize×2) and clears `GS.chase` |
| `chase_yield` | `{side: pursuer\|quarry}` | declared (DM, either side breaks off) | GAP-WIRING §1 — `chaseYield` to the matching outcome + clears `GS.chase` |
| `downtime` | `{intent: work\|carouse\|research\|train\|lie-low\|seek-work, tier?}` | declared (DM, a spent montage week) | GAP-WIRING §3 — ONE `downtime-ledger` roll; gold rides the SAME `item_changed` mutator, a fresh face the SAME drift-contact path, a rumor the `distant_word` binder; `seek-work` routes to JOB-WALKS (postings, no payout); an invented intent → `bad-intent` |
| `distant_word` | `{}` | declared (DM, word of a far place drifts in) or detected (a `downtime` rumor) | GAP-WIRING §2 — `distantWordRoll`: a Distortion row binds to a REAL non-current-node ledger fact (never invented); the player hears the distorted `text`, the true fact rides `dmOnly` only |
| `shrine_omen` | `{}` | declared (DM, dressing a shrine/omen) | GAP-WIRING §5 — `shrineOmenRoll`: its `` `[the myth]` `` placeholder binds to the world's OWN `w.seed.myth` (a myth-less world leaves it, flagged not fabricated) |
| `stage_fx` | `{verb, who?, from?, to?, note?}` | declared (DM, an improvised beat the fixed events don't carry — the grappling-hook swing, BATTLE-THEATER.md §4) | BATTLE-THEATER.md §4 — validates `verb` against the verb library's own exported list (`window.Theater.verbs`, falling back to a kept-in-sync local constant pre-mount/headless); an unknown verb is REJECTED `{ok:false,reason:"unknown-verb"}` before anything is ledgered. On a known verb: ledgers a prose line (the twin — `note` if supplied, else a generated fallback) and forwards to `window.Theater?.play(verb,{who,from,to})` — null-safe, best-effort, never breaks the ledger write (headless/jsdom/no-WebGL always no-ops cleanly here). The EXISTING combat events (`attack`/`foe_action`/`move_zone`/`foe_morale`/`crit_outcome`/`combat_end`) get their own animation for free with NO new fields, via `cmTheaterNotify(kind,data)` (src/world/render.js) at each ledger site → `theaterFxFromLedger` (src/ui/theater-verbs.js) → `Theater.play` |
| `advance_clock` | `{minutes \| hours \| days, cause?}` (alias `mins/min→minutes`) | declared (DM, the ONE hand-wave time lever — TRANSITION-CONTRACT.md §3.1) | Refuses `<1`/non-numeric minutes (the clock is monotonic) and while `GS.combat.active` (rounds own combat time); clamps to `TRANS_CLOCK_MAX_MIN` (10080, one week) with `clamped:true` surfaced; fires ONE `worldTurn(w,"montage")` when the clamped minutes ≥1440; runs `koCheckWake` after; writes a `transition`/`dm-clock` ledger line |
| `move_node` | `{nodeId, travelMin?, cause?}` (alias `to/node/id→nodeId`) | declared (DM, a narrative jump — no walk, no encounters) | TRANSITION-CONTRACT.md §3.2 — refuses an unknown node (never mints — that's `discovery`'s job), the current node, or mid-walk; routes through the shared `pcMoveTo` (edge `travelMin` else 60) |
| `start_walk` | `{nodeId, enter?}` (alias `id/node→nodeId`) | player (the map's "Set out" button, `startWalkTo`) or declared (DM) | TRANSITION-CONTRACT.md §3.5 — pure delegation to `prep_contact{nodeId,enter:true by default}`; refuses a non-prepped node (`no-prepped-walk:<id>`); idempotent on an already-locked frontier (E11) |
| `travel_start` | `{toNodeId, travelMin?, cause?}` (alias `nodeId/to/dest→toNodeId`) | declared (DM, "play the road" — as opposed to `move_node`'s narrative jump) | TRANSITION-CONTRACT.md §3.6 — `travelDepart` (shared with `explore()`'s Place branch): refuses an unknown node, the current node, or mid-walk; an existing edge's `travelMin` (DM override honored) or a fresh `rollRoute()` (DM's `travelMin` overrides + `leagues` is RECOMPUTED, never the random seed); mints the wilderness walk or degrades to instant-arrival if the walk engine is unavailable. **No `travel_arrive` event — arrival is `walk_complete` on the resulting `kind:"travel"` walk.** |
| `knockout` | `{cause?}` | declared (DM, a no-damage-math KO — sap, sleep, narrative subdual) | TRANSITION-CONTRACT.md §3.7 (BUG-04) — one implementation (`applyKnockout`) shared with `hp_changed{nonlethal:true}`'s 0-HP branch: sets `hpCur=0`, clears any death-save tracker, stamps `sh.ko={stable,cause,at,wakeDay,wakeMin}` (SRD 1d4h wake), pushes `"unconscious"`. Refuses `already-dying` (an active death-save tracker) or `no-pc`. Never touches `killCharacter`/the bardo (E26) |

### Payload aliases & drift-warn

`DM_EVENT_FIELDS` (src/world/dm.js) is the single declarative accepted-fields + alias map, folded
ONCE in `applyEvent` (`dmFoldPayload`) immediately after `validateEvent` — before the switch, never
per-case. For each mapped event: an ALIAS key is rewritten to its canonical field — scoped PER EVENT,
never a general vocabulary (`text→what` on `fact_canonized` only; `to→target` on `gift` ONLY — it is
NOT a general "to means target" alias, e.g. `attitude_shift` has no `to` alias, its `to` field IS
canonical; `id`/`faction`→`clockId` on the clock family only) — with the **canonical field winning**
when both are present.
Any key that is neither accepted nor aliased still **applies** (never dropped — the fold can't break a
working handler), but emits a `console.warn` + **one `drift` ledger line** (`kind:"payload-drift"`,
carrying the event `type` and the unrecognized `keys`) so a DM's vocabulary drift becomes loud instead
of a silent no-op. Event types NOT in the map (and unknown types) pass through unjudged — the
whole-payload-pass handlers (hire/capture/downtime/…) and forward-compatible types stay untouched.
Every key in the map is a member of `DM_EVENT_TYPES` (the ROOT-B probe enforces the subset). The digest
teaches the canonical clock key: `powers[].clockId` / `fronts[].clockId` (renamed from `id`), so a DM
copying the digest's own key into any clock-family event lands it.

**The ITEMS events (`docs/ITEMS.md`, the type/instance split — built 2026-06-30).**
`sheet.inventory` entries are instances (`{id,name,qty?,conditions:[]}`); `name` resolves against
`ITEMS_BY_NAME` (`data/items.js`, generated) for objective facts (damage/AC/weight/cost/properties) —
the bestiary pattern reapplied to gear. `item_changed` is the **one** event that touches gear/coin —
confiscation, loot, buy/sell, a consumed item. `removeAll` strips the whole inventory (a searched/bound
prisoner); `removeIds` targets specific instances **by id, never by name** (a flat string can't
disambiguate two of the same item or target "the cursed one" specifically); `add` mints new instances
(used both for loot *and* for returning confiscated gear — removed items are recoverable because the
ledger records exactly what left); `gold` is a signed delta, clamped at 0. `item_split` divides a
stackable instance (e.g. "drop 5 of 20 arrows") without merging it back on a later `add` — two same-
name instances may legitimately coexist with different `conditions`. `equip`/`unequip` use **named
slots** (`mainHand`/`offHand`/`armor`), not a single pointer, because two-weapon fighting needs two
weapons equipped at once. All logged to the ledger (kind `inventory`/`inventory-split`/`item-condition`/
`equip`) so state is always reconstructable from history. (Capture's confiscation, WALK-CONSUMPTION §6,
currently moves gear via `codex_update` rather than this event — a candidate to reconcile later.)

The **walk events** (docs/WALK-CONSUMPTION.md) are forward-compatible no-ops when prep/capture is unavailable.
`walk_advance`/`walk_complete` are script-bookkeeping over the active walk the DM is handed in `digest.activeWalk`
every turn (the DM owns *when* the beat lands; the script owns the cursor + provenance). `capture` lands a
subdued PC inside the walk already in motion — captor (most-advanced hostile faction), cell (a holding segment
of the active walk, reused or minted), and lever (a pre-cast NPC) come from LIVE state; only the disposition /
confiscation / opening are new dice. The disposition opens a real, **fireable** front-clock — a capture that
can't go wrong is a free vacation (DM hard/dangerous discipline).

The **gap-wiring caller events** (docs/TABLE-GAPS-070126.md §1–5, added 2026-07-03) close BATCH3-PLAN unit 1's
OPEN tracking line: the five wave-2a tables now fire from real call sites. `chase_start`/`chase_round`/
`chase_yield` drive the transient `GS.chase` gap clock (created/cleared by the caller, exactly as `GS.combat`
is — `gap-wiring.js`'s functions stay pure); `downtime`, `distant_word`, and `shrine_omen` are one-shot roll
seams. **Two of the five tables already had seams from later batch-3 units and are NOT new events:**
`festival-and-holy-days` fires from `applyDriftEffect`'s `festival` tag (a Textured+ Place-Drift row chains to
`festivalRoll`, `world.wiring-b`), and `distant-word` ALSO fires from that dispatcher's `rep` tag — the
`distant_word` event above is its first-class DM seam in addition. All degrade null-safe (a `{ok:false}`/no-op,
never a fabricated result) when a table isn't compiled.

The resource events mutate the **current** layer of the living PC's sheet through `src/engine/resources.js`
(the deterministic owner of the consumable economy) — maxes derive from `CLASS_PROGRESSION`, never hand-entered.
`rest` recovery: `long` = full reset; `short` = pact slots + short-rest pools (Channel Divinity, Focus, Action
Surge) + 1 Rage (HP via Hit Dice and Vancian slots are unchanged on a short rest). `resource_spent.key` accepts
friendly aliases (`rage`, `bardic`, `ki`, `sorcery`, …). `passTime('short')`→short rest, `passTime('dawn'|'montage')`→long.

`method` ∈ `combat | stealth | social | environmental | avoided`.
`victimClass` ∈ `monster | hostile | neutral | civilian | authority` — the axis that lets
DIFFICULTY tell a goblin-slayer from a baker-murderer (see `DIFFICULTY.md`).

## Meaningful choice = a recorded state fork

A `choice_logged(major)` is only real if it **forecloses** something — took path A, so front B
now drifts. Meaningfulness is an *opportunity cost the ledger can see*, not the DM's sense of
drama. This is the route to promoting `choice_logged` from declared → detected: when the script
can see that selecting A advanced one clock and abandoned another, it detects the fork itself.

## Adjudication becomes precedent

When the DM hits a situation the script can't determine, it makes a call and emits an
`adjudication` event. The ruling is **written to the ledger as canon**. Next time the same
situation arises, the script surfaces the precedent and the DM rules consistently. The container
tightens over a campaign without every case being authored up front — the responsive-world
thesis applied to the rules themselves. The game doesn't have to be unbreakable; it has to be
*consistent and responsive*.

## Worked examples (these double as test fixtures)

1. **Stealth past 3 goblins guarding nothing.**
   `encounter_resolved {foes:[CR1/4 ×3, monster], method:"stealth", objectiveRef:null}`
   → 0 combat XP (no objective tied), small `discovery` credit if it revealed the area. No
   escalation (victimClass monster, no faction).

2. **Kill a town guard mid-robbery.**
   `kill {victimClass:"authority", factionId:"townwatch"}`
   → no XP by itself; `clock_advanced` on the town-watch front against the PC (detected). Repeat
   → eventually `clock_fired` → DIFFICULTY spawns a named response.

3. **Close the "smugglers choke the harbor" front by burning their ledger-house.**
   `front_closed {ledgerId:"harbor-smugglers", how:"destroyed records"}` (detected)
   → ADVANCEMENT pays the front's award + a combat bonus *only if* a fight was part of it.

## Open questions

- Exact JSON field names once the runtime ledger schema is fixed.
- Which `declared` events get state hooks first (priority order for the declared→detected migration).
- Whether `inspiration_granted` needs a cap enforced by the script (likely yes — see `ADVANCEMENT.md`).
