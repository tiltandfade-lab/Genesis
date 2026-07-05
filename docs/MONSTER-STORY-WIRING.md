---
type: system-spec
project: Genesis
status: SPECCED 2026-07-04 — regular (non-realm) monsters join the story layer: habitat/behavior
  as selection+narration factors, codex minting, threat-bound quest hooks, custom flavor d10s
  surfaced. Adam's direction: "behavior and natural setting of the monsters is a factor; flavor
  tables relevantly wired." Overlaps the pending WANT-HOOK ruling — §4 is its down-payment, not
  its replacement. Sonnet-executable.
created: 2026-07-04
related:
  - "[[REALM-STORY-WIRING]]"
  - "[[CODEX]]"
  - "[[SESSION-PREP]]"
  - "[[MONSTER-TACTICS]]"
---

# MONSTER-STORY-WIRING — the ogre gets remembered too

## §0 The gap (ground-truthed 2026-07-04)

Realm creatures now mint codex records, flow desc through the digest, and recur. REGULAR monsters
— the 510-entry bestiary — remain combat filler: the mint threshold (`dm.js:946`) requires
`realmRole`/`realm`, so no SRD foe ever mints; `rollQuestHook` (quest-hook.js) is creature-blind;
the wilderness `behavior` roll (wild-walk.js:47, col 3 of `wilderness-enemy-category`) survives
only inside a text string; and the rich per-creature story data ALREADY IN `data/bestiary.js` —
`habitat` (all 510, vocab: ruins/cave/forest/hill/grassland/deeplands/urban/swamp/planar/mountain/
coast/desert/sea/any/arctic/sky/elemental), `activity` (all 510), `factionFit` (all 510),
`treasure` (all 510), and Adam's 104 hand-authored `customTables` d10s — is read by NOTHING in
the story layer.

## §1 Habitat — natural setting as a selection factor + a story signal

New pure helper `monsterHabitatFit(statIdOrName, setting)` (src/engine/walk-archetypes.js — it
already owns pool resolution):
- `setting` = `{env: "wilderness"|"dungeon"|"urban", biome?: string}`. Map:
  `BIOME_HABITAT = { forest:["forest"], hills:["hill","grassland"], mountains:["mountain","sky"],
  swamp:["swamp"], desert:["desert"], plains:["grassland","hill"], coast:["coast","sea"],
  arctic:["arctic"], jungle:["forest","swamp"], river:["coast","swamp"] }` (fuzzy-key on the
  rolled biome word, lowercase substring match; unknown biome → no filter). Dungeon →
  `["cave","ruins","deeplands"]`; urban → `["urban"]`. `habitat` containing `"any"`, or the
  creature unresolvable in BESTIARY → always fits (never punish the threat tables' names).
- **Selection (light touch):** in the three encounter builders, AFTER the existing pick, if the
  picked creature does NOT fit: re-pick ONCE from the same pool preferring a fitter (boss slot
  always; low/mid slots only when `Math.random()<0.5` — ecology bends, doesn't dictate). If the
  re-pick still misfits, KEEP it and stamp `displaced:true` on the creature spec — a misfit
  monster is a STORY FACT (something drove it here), not an error. Exact sites:
  dungeon-walk.js `dwalkEncounter` (the non-realm branch, ~:367), walk.js `walkEncounter`
  (~:270 fallback path), wild-walk.js `wwalkEncounter` (~:71). Realm branches untouched
  (realms override ecology by design).
- **Digest:** the walk-digest creature preview (dm.js `activeWalkDigest`, the `creatures` map
  landed by REALM-STORY-WIRING) and `combatDigest` foes gain `displaced:true` when stamped —
  one boolean, DIGEST-DIET safe. DM-BRIDGE.md one-liner: "displaced = this creature does not
  belong here; narrating WHY is yours."

## §2 Behavior + activity — what it's DOING when found

- **Wilderness:** carry the already-rolled `behavior` (wild-walk.js:47) as its own field on the
  encounter creature spec(s) (`behavior: behavior||null`) so it survives into the digest preview
  and combat (thread through `combatFromEncounter` like desc — combat.js:696–705 pattern).
- **Dungeon/urban:** no behavior roll exists; stamp `activity` from the resolved bestiary entry
  (`BESTIARY[id].activity`, first non-"any" value, else null) onto the creature spec the same
  way. No new tables — the field is authored data.
- **Digest:** preview entries gain `doing: behavior||activity||null` (ONE short string).

## §3 Codex — regular significant foes mint too

Extend `codexMintSignificantFoes` (dm.js:942):
- Threshold gains a non-realm leg: `|| f.bossSlot === true || (f.cr != null && f.cr >= 3)`.
  Stamp `bossSlot:true` on boss-slot creature specs in all three builders (the realm branch
  already implies significance via realmRole). CR≥3 ≈ a Tier-2 set-piece foe; mooks still never
  mint.
- Minted fields gain the bestiary story data: `fields.habitat` (array), `fields.activity`,
  `fields.factionFit`, `fields.treasure`, `fields.displaced` — straight from
  `BESTIARY[f.statId]` (null-safe).
- **Custom flavor tables (Adam's 104 d10s — the "relevantly wired" mandate):** at FIRST mint of
  a creature whose `BESTIARY[statId].customTables` exists, roll ONE row from EACH of its tables
  (they're `{heading, die, rows}` markdown-row arrays — parse the rolled row's cells verbatim)
  and store on the record: `dm.flavor = [{table: heading, roll: n, text: <row verbatim>}]`.
  Rolled ONCE, canon forever (the codex record IS the individual — a re-encountered Animated
  Armor still follows the same Last Order). The ENGINE rolls the row; the DM interprets it —
  the tables' content stays un-mechanized (the data/bestiary.js header's law: carried verbatim,
  never engine-executed). `combatDigest` surfaces `flavor` ONCE per foe name (same
  once-per-name discipline as desc) on the foe's FIRST combat only (`fields.seenCount===1`).

## §4 Quest hooks — the threat becomes the story's subject (WANT-HOOK down-payment)

`rollQuestHook(opts)` (quest-hook.js) gains `opts.threat` — the destination walk's rolled threat
object (prep-bundle.js already carries `walk.threat` per env, :165 — thread it at the call
site). When present and resolvable:
- Resolve the threat's boss-pool creature (`threat.boss` first name that resolves in BESTIARY,
  else `threat.id` itself) → `tb`.
- Add a `threatBinding` block to the returned hook (ADDITIVE — every existing field unchanged):
  `{ creature: tb.name, statId: tb.id, habitat: tb.habitat, doing: <first non-any activity>,
  angle: <derived> }` where `angle` is script-derived, first match wins:
  `tb.treasure !== "none"` → `"plunder"` (its hoard is the macguffin's guard) ·
  `tb.factionFit.length` → `"faction"` (name the factionFit archetype — someone employs/fears
  it) · else → `"menace"` (it must be dealt with).
- The DM contract line (SESSION-PREP/SYNTHESIS docs + DM-BRIDGE.md, one sentence each): when
  `threatBinding` exists, the hook's pitch SHOULD name the creature and its angle — the quest
  that leads to the wolf-den mentions wolves. Synthesis may still override (soft prior, like
  everything in prep).
- OUT OF SCOPE: new hook tables, the WANT-HOOK generator itself (Adam's pending ruling — this
  block is designed to become one of its axes, not to preempt it), job-board integration.

## §5 Build + verify

1. One unit, branch `feat/monster-story-wiring` off master. Files: walk-archetypes.js,
   dungeon-walk.js, walk.js, wild-walk.js, combat.js (behavior/doing carry), dm.js (mint +
   digest), quest-hook.js, prep-bundle.js (threat threading), DM-BRIDGE.md, docs one-liners.
   check-manifest OK.
2. New harness `dev/verify-monster-story.mjs` (jsdom, copy verify-realm-wiring's bootstrap):
   habitat fit logic (forest biome prefers forest-capable; a forced misfit stamps `displaced`);
   boss-slot mint (a CR-4 non-realm boss mints kind:"creature" with habitat/factionFit fields;
   a CR-1 mook does not); customTables flavor rolled once + identical on re-mint (canon-lock);
   wilderness behavior survives to the foe object; quest hook with opts.threat carries
   threatBinding with a valid angle; hook without opts.threat → byte-identical legacy shape
   (regression). MUTATION (red-first): break the habitat filter → misfits never re-pick AND
   never stamp displaced → fail; break the flavor canon-lock (re-roll each mint) → fail.
3. Regression: verify-realm-wiring 63/0 · verify-dm-events · verify-combat · verify-walk ·
   verify-prep-bundle all green; gauntlet-fuzz + monkey (dm.js applyEvent surface touched).

## §6 Decisions (flag to veto)

| # | Decision | Ground |
|---|---|---|
| 1 | Misfit = re-pick-once then `displaced` story flag, never a hard filter | ecology bends; a displaced monster is a hook, not a bug; threat tables stay honored |
| 2 | Boss-slot or CR≥3 mints; mooks never | codex = handles not a zoo; Tier-2 set-piece bar |
| 3 | Custom d10s rolled once at mint, verbatim, engine never interprets | Adam's tables stay his; Fragment-oracle pattern; canon-lock = recurrence has teeth |
| 4 | threatBinding is additive + soft; angle from treasure/factionFit | anti-drift (script owns the connection); WANT-HOOK ruling can absorb it later |
| 5 | activity/behavior = one `doing` string in digests | DIGEST-DIET |
