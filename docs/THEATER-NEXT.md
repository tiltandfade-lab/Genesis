---
type: system-spec
project: Genesis
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
created: 2026-07-06
author: Fable (verified against the live tree 2026-07-06; GPT-5.5 outside read §"Battle Visualizer Read" is the prompt, this doc is the law)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
related:
  - "[[BATTLE-THEATER]]"     # §5 promised terrain_change (T4) — this doc IS that unit, finally payload-exact
  - "[[EVENT-CONTRACT]]"     # gains the terrain_change row (Registry updates below)
  - "[[SPEED-DOCTRINE]]"     # inference cost of all three units: ZERO model calls
  - "[[DREAM-HORIZON]]"      # §0 TEXT-FIRST: the stage stays a lens; prose/ledger stay authoritative
  - "[[P1-WIRING]]"          # the async whole-object replay seam Unit C must not break
---

# THEATER-NEXT — terrain_change · screenshot gates · dirty-key setBoard/setUnits

Three units, spec-locked tonight, build deferred. Source prompt: `GPT-5.5-advice-for-Claude/README.md`
§"Battle Visualizer Read" (four bullets: terrain_change on the radar / screenshot gates / dirty keys /
keep the `stage_fx` whitelist narrow). The fourth bullet is a stance, not a unit — it is enforced
inside Unit A: **terrain ops are a second frozen vocabulary, NOT new animation verbs; `THEATER_VERBS`
and `STAGE_FX_VERBS` do not change by even one entry in this entire spec.**

## §0 Verified surface (all refs opened in the live tree 2026-07-06)

| surface | where | verified fact |
|---|---|---|
| `DM_EVENT_TYPES` | `src/world/dm.js:1218` | `"stage_fx"` present; **`terrain_change` ABSENT** — GPT's read is correct, BATTLE-THEATER §5 specs it but it was never built |
| `DM_EVENT_FIELDS` | `src/world/dm.js:1237` (map opens), `stage_fx` row at `:1302` | per-event accept/alias fold (ROOT-B); every key must be in `DM_EVENT_TYPES` (probe-enforced) |
| `stage_fx` applyEvent case | `src/world/dm.js:2987–3020` | validates verb against `window.Theater.verbs` else `STAGE_FX_VERBS` (`dm.js:31`); ledgers then forwards to `Theater.play`; unknown verb → `{ok:false, reason:"unknown-verb"}` |
| `theaterBoardFrom(segment, scene, opts)` | `src/engine/theater-data.js:693`, returns at `:904` | pure; tiles `{x,z,h,kind,tint,altTop,zone,material}`, kinds `floor/elevated/water/hazard`; props `{kind:"cover",zone,x,z,level,part?,partParams?}`; **no `scene.mods` consumption anywhere in the file** |
| `theaterZoneIndex(grid, zoneKey)` | `src/engine/theater-data.js:217` | zone-key → `{bandIdx,laneIdx}` or null (defensive) |
| `THEATER_STEP` | `src/engine/theater-data.js:17` | `const THEATER_STEP = 1.0;` — one world unit per height step (line 18+ is the trailing G9-tune comment) |
| scene mechanical fields | `src/engine/combat.js:753–812` | `scene.elevZones` (string[]), `scene.hazardZones` (`[{zone,kind,revealed}]`), `scene.zoneCover` (map), `cmStampElev(combat,c)` at `:786`, `cmZoneCover` at `:802` |
| `theaterStageSync` | `src/world/render.js:381` | every render while fighting: `theaterBoardFrom(cm.segment, cm.scene, {env,realms})` → `Theater.setBoard` (`:415–416`), `theaterUnitsFrom(cm)` → `Theater.setUnits` (`:418–420`) — a scene mutation is picked up on the next render with **zero new plumbing** |
| `combatDigest` scene slice | `src/world/dm.js:256` | `scene:{cover:Object.keys(...), hazards, exits}` — no terrain slice yet |
| `combatPanel` scene tags | `src/world/render.js` — fn opens `:1365`, tags `[].concat(...)` block `:1371–1375` | `⛊ cover / ☠ hazard / ⌖ exit` cmb-tag concat — the classic panel's prose-twin tag line |
| `setBoard` / `setUnits` | `src/ui/theater-boot.js` — `function setBoard` `:3369`, `function setUnits` `:3721` (`S.lastUnits = data` stamp at `:3724`) | full-rebuild every call (`clearGroup` × tile/prop/fx groups); `S.lastBoard`/`S.lastUnits` stamped for the P1′ async replay |
| P1′ async replay | `src/ui/theater-boot.js:4055–4056` | `if(S.lastBoard) setBoard(S.lastBoard); if(S.lastUnits) setUnits(S.lastUnits);` — an INTENTIONAL same-payload re-call Unit C must not dedupe away |
| public API + toggles | `src/ui/theater-boot.js:4066` (`window.Theater = {…}`); `pixelSkin` setter `:4087`, `wholeObject` setter `:4101` | `window.Theater = {mount, reattach, setBoard, setUnits, setTextures, rotate, zoom, retire, play, verbs, fxFromLedger}`; `Object.defineProperty(window.Theater, "pixelSkin", …)` and `…"wholeObject"…` accessor setters |
| screenshot rig | `dev/battle-gate/capture-stage.mjs` (+ `README.md`, `ACCEPTANCE.md`) | ALREADY EXISTS (round 0): real headless Chrome, real `genesis.html`, boots to a live fight, writes `round0/*.png` + `round0/metrics.json` (top-level keys verified: `generatedAt, notes, consoleErrors, explore, stageWaitFinal, angleUsed, theaterMounted, canvasConfirmedNonBlank, stage1440, stage1280, classic, bootReport`) |
| verifier baselines (run 2026-07-06, all green) | — | `verify-theater-data.mjs` **285**, `verify-theater-verbs.mjs` **84**, `verify-dm-seam.mjs` **38**, `verify-dm-events.mjs` **36**, `verify-battle-stage.mjs` **41** |

Tonight's rulings that bind here: script owns the number (terrain mutation is deterministic state, DM
only declares the cause); DM exerts will only through the scene, never the player's piece (a `hole`
never moves or damages the PC — that stays `move_zone`/`hazard_tick`, DM-adjudicated); BLIND-PLAYABLE
(every board change ships a ledger prose line + a classic-panel tag); SPEED doctrine (zero model calls
in all three units).

---

## §1 Unit TN-A — `terrain_change` (BATTLE-THEATER §5's T4, payload-exact)

### 1.1 The event (exact shapes — no executor choices)

**Type:** `terrain_change`. **Payload:** `{ op, zone, note? }`.

- `op` — one of the frozen six: `"break" | "burn" | "flood" | "collapse" | "raise" | "hole"`.
  Declared as a new module const in `src/world/dm.js`, placed **directly below `STAGE_FX_VERBS`
  (dm.js:31)** with the same kept-in-sync-by-comment discipline:
  ```js
  const TERRAIN_OPS = ["break","burn","flood","collapse","raise","hole"];
  ```
  This is the whitelist stance preserved: terrain ops are a second narrow vocabulary. **No entry is
  added to `THEATER_VERBS` (src/ui/theater-verbs.js:101) or `STAGE_FX_VERBS` (dm.js:31); no
  `Theater.play` call, no `cmTheaterNotify` call, no auto-FX.** The board tile change itself is the
  visual; a DM wanting spectacle pairs an explicit `stage_fx` (already whitelisted) in the same turn.
- `zone` — a `"band:lane"` key that must exist in the live fight's grid (`GS.combat.grid`).
  **Zone-scoped only. The `tiles` addressing option BATTLE-THEATER §5 left open (`{op, zone|tiles}`)
  is REJECTED** — per-tile coordinates invite DM coordinate-invention; the engine owns nouns, and the
  zone is the noun every other combat event already speaks.
- `note` — optional free text; becomes the ledger line when present (same contract as `stage_fx`'s
  `note`, dm.js:3008).

**Registration (three edits, all in `src/world/dm.js`):**
1. `DM_EVENT_TYPES` (dm.js:1218): insert `"terrain_change"` **immediately after `"stage_fx"`**.
2. `DM_EVENT_FIELDS` (after the `stage_fx` row at dm.js:1302):
   `terrain_change: { accept:["note","op","zone"], alias:{ at:"zone", kind:"op" } },`
3. New `case "terrain_change":` in `applyEvent`, placed **immediately after the `stage_fx` case's
   closing brace (dm.js:3020)**.

`dev/verify-dm-seam.mjs`'s existing parity probe (list ⇄ switch-cases, red-first by construction)
makes it impossible to land 1 without 3 or vice versa — no new parity check needed; the seam harness
must simply stay at **38 passed, 0 failed**.

### 1.2 Handler semantics (the exact case body contract)

Guard order, first failure returns and nothing mutates, nothing ledgers:

1. `if(!GS.combat || !GS.combat.active) return {ok:false, reason:"no-combat"};`
2. `if(!p.op || TERRAIN_OPS.indexOf(p.op) < 0) return {ok:false, reason:"unknown-op"};`
3. Zone validation: split `p.zone` on `":"`; both halves must index into `GS.combat.grid.bands` /
   `GS.combat.grid.lanes` (fall back to `CM_BANDS`/`CM_LANES` when `cm.grid` absent, exactly the
   `grid = cm.grid || {bands:CM_BANDS.slice(), lanes:CM_LANES.slice()}` defaulting `applyEvent`
   already uses at dm.js:1789 — `CM_BANDS`/`CM_LANES` are in scope in dm.js because
   `src/engine/combat.js:14–15` loads before `src/world/dm.js`). Fail → `{ok:false, reason:"bad-zone"}`.
4. Holed-zone lockout: if `(cm.scene.mods||[])` already contains an entry with `op==="hole"` and the
   same `zone` → `{ok:false, reason:"zone-holed"}` (any op, including a second `hole` — a voided
   patch is terminally voided for this fight).
5. Cap: `if((cm.scene.mods||[]).length >= 24) return {ok:false, reason:"mods-cap"};` (24 = 2× the
   max zone count; runaway-DM protection).

Then, per op (ensure `cm.scene` exists — `combat_start` already builds it; ensure `cm.scene.mods`
is an array before push):

| op | mechanical mutation (script owns the number) | mods entry pushed |
|---|---|---|
| `break` | `delete cm.scene.zoneCover[p.zone]; delete cm.scene.cover[p.zone];` (cover destroyed — `cmZoneCover` at combat.js:802 stops granting the bonus **immediately**) | `{op:"break", zone, note, round}` |
| `burn` | none (visual scar only; damage stays `hazard_tick`, DM-adjudicated) | `{op:"burn", zone, note, round}` |
| `flood` | **replace** any existing `cm.scene.hazardZones` entry at that zone (filter it out), then push `{zone:p.zone, kind:(p.note || "flood water"), revealed:true}` — base board derivation (theater-data.js:757–766 + `theaterHazardVariant` `/water|flood/` branch at :209) then renders the sink+water tint with no theater edit at all | `{op:"flood", zone, note, round}` |
| `collapse` | if `p.zone` is in `cm.scene.elevZones`: remove it, then restamp `.elev` on every combatant (`cmStampElev(cm, cm.pc)`, each of `cm.allies`, each of `cm.foes` — guard `typeof cmStampElev==="function"`); the mods entry records `sunk:false`, no hazard marker (a lowering, not a break). Else (ground zone): **[PROVISIONAL — HOTFIX-QUEUE-2026-07-07 HQ2-3, pending Adam's final skim]** replace any existing `cm.scene.hazardZones` entry at that zone (filter it out), then push `{zone:p.zone, kind:(p.note || "broken ground"), revealed:true}` — same filter-then-push shape as `flood`/`hole`, a passive scene fact the DM adjudicates via `hazard_tick` (the engine still never auto-moves or auto-damages, per §1's DM-agency law); the mods entry records `sunk:true` and the board sinks it (§1.3). **`sunk` is stamped at event time** so replay is deterministic regardless of later elevZones churn | `{op:"collapse", zone, note, round, sunk:<bool>}` |
| `raise` | if `p.zone` already in `cm.scene.elevZones` → `{ok:false, reason:"already-elevated"}` (no stacking; the engine only models one step). Else push the zone onto `cm.scene.elevZones` + the same full `cmStampElev` restamp as collapse. Base derivation (theater-data.js:753–755, :807) renders the raise; **the mods entry is audit/prose-only — §1.3 applies NO tile change for `raise`** (the no-double-raise law) | `{op:"raise", zone, note, round}` |
| `hole` | same hazard replace-then-push as `flood`, with `kind:(p.note || "open pit")` (matches `theaterHazardVariant`'s `/pit|hole/` branch — mechanically a marked pit even where the theater never mounts) | `{op:"hole", zone, note, round}` |

`round` = `cm.round || 1`. `note` = `p.note || null`.

Then the ledger line (the prose twin — BLIND-PLAYABLE), exactly the `stage_fx` pattern:

```js
const line = p.note || TERRAIN_PROSE[p.op](p.zone);
addLedger(w, "outcome",
  {kind:"terrain", op:p.op, zone:p.zone, note:p.note||null, source:src},
  "✦ " + line + ".");
return {ok:true, op:p.op, zone:p.zone};
```

`TERRAIN_PROSE` — a const beside `TERRAIN_OPS`, one line per op (**PROVISIONAL — Adam may re-voice;
these are the locked defaults, build with them as-is**):

| op | default line (zone interpolated) |
|---|---|
| break | `The cover at ${zone} breaks apart — rubble now, not shelter` |
| burn | `Fire scars the ground at ${zone}` |
| flood | `Water floods ${zone} — the footing turns treacherous` |
| collapse | `The ground at ${zone} gives way and drops` |
| raise | `The ground at ${zone} heaves upward` |
| hole | `A hole tears open at ${zone} — nothing below but the void` |

**No direct Theater call anywhere in the case.** The next `renderWorld()` (which ends every DM turn)
runs `theaterStageSync` (render.js:374→381), which rebuilds the board from the mutated
`cm.scene` — state-driven, deterministic, jsdom-safe by construction.

### 1.3 Board replay — `scene.mods` consumption in `theaterBoardFrom`

`src/engine/theater-data.js` — one inline block inside `theaterBoardFrom`, inserted **after the
`light` derivation and immediately before the `return {` at :904**. No signature change (`scene` is
already a parameter; mods ride in as `scene.mods`). Change `const tiles = []` / `const props = []`
(:798–799) to `let` (hole filters reassign them).

Iterate `(scene.mods || [])` **in array order** (append order = replay order = deterministic):

- Resolve the mod's zone via the already-built `bands`/`lanes` (skip the mod when
  `theaterZoneIndex({bands,lanes}, mod.zone)` returns null — a stale key never throws, same
  defensive law as :214–225).
- `break`: `props = props.filter(pr => pr.zone !== mod.zone)`, then push
  `{kind:"cover", zone:mod.zone, x:origin.x+(THEATER_PATCH-1)/2, z:origin.z+(THEATER_PATCH-1)/2, level:null, part:"rubble-scatter", partParams:{scale:0.9}}`
  (`origin` = `theaterZoneOrigin(bandIdx, laneIdx)`). Riding the existing `kind:"cover"` prop path
  means theater-boot's proven prop mount renders it with zero GL edits (`rubble-scatter` is a live
  registered part — theater-data.js:324/:329/:331 already emit it).
- `burn`: for each tile with `t.zone === mod.zone` and `t.kind !== "water"`:
  `t.kind = "scorch"; t.tint = gradeTint(palette.scorch); t.altTop = false; t.material = null;`
  (`gradeTint`/`palette` are in scope at the insertion point — :738–746, :697).
- `flood` / `raise`: **no tile change** (base derivation already rendered both — see §1.2 table).
- `collapse`: if `mod.sunk === true`, each zone tile `t.h = Math.max(t.h - THEATER_STEP, -THEATER_STEP)`
  (clamp: a twice-collapsed ground patch stays at −1 step). Both sunk values: push the same rubble
  prop as `break` but `partParams:{scale:0.6}` (**scale values PROVISIONAL** — 0.9 wreck / 0.6
  slump; build as-is).
- `hole`: `tiles = tiles.filter(t => t.zone !== mod.zone); props = props.filter(pr => pr.zone !== mod.zone);`
  — the void shows through (BATTLE-THEATER §5's "the space-time hole comes free with the void
  background"). A unit standing there floats over void until the DM adjudicates
  (`move_zone`/`hazard_tick`) — the engine NEVER auto-moves or auto-damages a combatant (DM-agency).

Purity is preserved: mods are read, never written, and the same `(segment, scene, opts)` triple
always yields a byte-identical board (TD-10 below asserts it).

### 1.4 Digest + prose-twin surfaces (two one-line edits)

1. `combatDigest` scene slice (`src/world/dm.js:256`) becomes:
   ```js
   scene:{ cover:Object.keys(scene.cover||{}), hazards:scene.hazards||[], exits:scene.exits||[],
           ...( (scene.mods&&scene.mods.length) ? { terrain: scene.mods.slice(-3).map(m=>m.op+"@"+m.zone) } : {} ) },
   ```
   Last 3 only, key omitted when empty — digest-diet law (same posture as `resolvable` at :210).
2. `combatPanel` tags concat (`src/world/render.js:1370–1374`): add a fourth `.concat` source:
   `((scene.mods)||[]).map(m=>`⌇ ${m.op} ${m.zone}`)` — the classic panel (and screen reader, via the
   existing tag markup) names every standing terrain change. The stage-mode prose twin needs no edit:
   the ledger line already lands in the feed (`role="status"` surfaces are untouched), and
   `cmbProseSummary` (render.js:1325) stays byte-identical.

### 1.5 Edge cases (enumerated, ruled)

| # | case | ruling |
|---|---|---|
| E1 | event outside combat | `{ok:false, reason:"no-combat"}`; no ledger |
| E2 | op not in `TERRAIN_OPS` | `{ok:false, reason:"unknown-op"}`; no ledger — the vocabulary is closed, exactly like `stage_fx`'s unknown-verb rejection |
| E3 | zone absent from the live grid (e.g. `"out:C"` in a 2-band room) | `{ok:false, reason:"bad-zone"}` |
| E4 | `raise` on an already-elevated zone | `{ok:false, reason:"already-elevated"}`; elevZones untouched |
| E5 | `flood`/`hole` on a zone with an existing hazard | REPLACE the entry (filter + push) — `hazardByZone` is last-wins anyway (theater-data.js:762–766); `ok:true` |
| E6 | any op on a previously-holed zone | `{ok:false, reason:"zone-holed"}` — void is terminal for the fight |
| E7 | second `collapse` on the same ground zone | allowed (`ok:true`, new mods entry, new ledger line — further crumbling is legitimate fiction); board clamp holds h at −1 step; the hazard marker is filter-then-push (last-wins), so still exactly one entry for that zone |
| E8 | 25th mod | `{ok:false, reason:"mods-cap"}`; `mods.length` stays 24 |
| E9 | headless/jsdom/no-WebGL | scene mutates + ledger writes normally; the board is a lens (TEXT-FIRST) — nothing in the case touches `window.Theater` |
| E10 | combat ends / new fight | `GS.combat` is transient (state law) — mods die with the fight; a fresh `combat_start` starts clean. Nothing persists to `U`/`w` except the ledger lines, which are the story record and SHOULD persist |
| E11 | stale mods entry after a mid-fight grid change (never happens today — grid is fixed at `combat_start`) | board-side `theaterZoneIndex` null-skip makes it a no-op, never a throw |

### 1.6 Worked example (before → after, the flood case)

Fixture: default 4×3 grid fight, PC at `melee:C`.

Before: `cm.scene = { elevZones:[], hazardZones:[], zoneCover:{"near:C":"half"}, cover:{}, exits:[] }` —
board = 108 tiles (12 zones × 9), 1 cover prop, digest scene = `{cover:[],hazards:[],exits:[]}`.

Event: `{type:"terrain_change", source:"declared", payload:{op:"flood", zone:"near:C", note:"the cistern wall lets go"}}`

After:
- `cm.scene.hazardZones = [{zone:"near:C", kind:"the cistern wall lets go", revealed:true}]`
- `cm.scene.mods = [{op:"flood", zone:"near:C", note:"the cistern wall lets go", round:1}]`
- `cm.scene.zoneCover` **unchanged** (flood doesn't break cover; the DM sends `break` too if the fiction says so)
- ledger tail: `✦ the cistern wall lets go.`
- next board: the 9 `near:C` tiles read `kind:"water"`, `h:-1`, water tint (all via the untouched base derivation); tile count still 108
- digest scene gains `terrain:["flood@near:C"]`; classic panel gains tag `⌇ flood near:C`
- return `{ok:true, op:"flood", zone:"near:C"}`

### 1.7 Regression checks — RED-FIRST, mutation-asserted (the BUG-01 law)

Every check below is written first, run against the UN-FIXED tree, and its failure output captured in
the unit's notes before the fix lands. Every assertion moves a **value**, never just a label.

**`dev/verify-theater-data.mjs` — append block TD (10 checks). Baseline 285 → acceptance:
`node dev/verify-theater-data.mjs` prints exactly `295 passed, 0 failed`.**
All TD fixtures first build a mods-free CONTROL board from the same segment/scene and diff against it
(never hardcode 108 — the harness's grid derivation must stay authoritative).

- TD-1 `hole` removes the zone's tiles: `board.tiles.length === control.tiles.length - 9` (RED on
  un-fixed code: lengths equal — mods ignored).
- TD-2 `hole` removes the zone's props: control scene has `zoneCover:{"melee:C":"half"}` → control
  props length 1; holed board props length 0.
- TD-3 `burn` moves the tint: every `near:L` tile's `tint` `!== ` its control counterpart's tint AND
  `===` the graded `palette.scorch` value (compute expected via the same grade path — assert both
  moved-from and moved-to).
- TD-4 `burn` flags: zone tiles all `kind==="scorch"`, `altTop===false`, `material===null`.
- TD-5 `collapse {sunk:true}` moves height: all 9 `far:R` tiles `h === -1` where control `h === 0`.
- TD-6 clamp: two `collapse {sunk:true}` mods on the same zone → still `h === -1` on all 9.
- TD-7 `break` swaps prop: zone's control cover prop gone; exactly one board prop at the zone with
  `part==="rubble-scatter"` and `partParams.scale===0.9`.
- TD-8 no-double-raise: a lone `{op:"raise"}` mod (zone NOT in `scene.elevZones` — the stamped-at-
  event-time contract) leaves the board byte-identical to control (`JSON.stringify` equality).
- TD-9 stale zone: `{op:"burn", zone:"out:Z"}` → no throw, board equals control.
- TD-10 determinism: two `theaterBoardFrom` calls with the same 3-mod scene →
  `JSON.stringify(a) === JSON.stringify(b)`.

**`dev/verify-dm-events.mjs` — append block DE (13 checks). Baseline 36 → acceptance:
`node dev/verify-dm-events.mjs` prints exactly `49 passed, 0 failed`.**
(jsdom, real `genesis.html`, real `applyEvent` — the harness's existing combat_start fixture path.)

- DE-1 pre-combat event → `ok:false`, `reason:"no-combat"`, ledger length UNMOVED.
- DE-2 `op:"melt"` → `ok:false "unknown-op"`, ledger length UNMOVED (RED on un-fixed code: the
  unknown-type path returns the forward-compatible no-op shape instead, and ledger/`scene` differ).
- DE-3 `zone:"out:Q"` → `ok:false "bad-zone"`.
- DE-4 `flood` → `hazardZones.length` 0→1; entry deep-equals `{zone,kind,revealed:true}`.
- DE-5 `flood` ledger: length +1 and the new line's text contains the note verbatim.
- DE-6 `raise` → `elevZones.length` 0→1, member equals the zone.
- DE-7 `raise` restamps: PC standing at the raised zone has `cm.pc.elev` moved `false→true` (the
  mutation assertion — a build that edits elevZones but skips `cmStampElev` fails HERE).
- DE-8 `raise` again same zone → `ok:false "already-elevated"`, `elevZones.length` still 1.
- DE-9 `break` → `scene.zoneCover["near:C"]` moved `"half"→undefined` AND `mods[0].op==="break"`.
- DE-10 `collapse` on an elevated zone → `elevZones.length` 1→0, mods entry `sunk===false`, and the
  previously-elevated PC's `.elev` moved `true→false`.
- DE-10a (HOTFIX HQ2-3) `collapse` on a ground zone → `hazardZones` gains an entry for that zone
  (`kind` = the note or `"broken ground"`, `revealed:true`) — RED pre-fix (pure no-op).
- DE-10b elevated-zone `collapse` (DE-10) still has NO hazard entry — the elevated branch is untouched.
- DE-10c second `collapse` on the same ground zone → still exactly one hazard entry for that zone
  (filter-then-push, last-wins), `ok:true`.
- DE-11 `hole` then `burn` same zone → first `ok:true` (hazard entry present), second
  `ok:false "zone-holed"`, `mods.length` still 1 hole-entry deep for that zone.
- DE-12 cap: prefill 24 mods → 25th returns `ok:false "mods-cap"`, `mods.length===24`.
- DE-13 digest: after flood + raise, `combatDigest(w).scene.terrain` deep-equals
  `["flood@near:C","raise@far:L"]` (order = append order).

**`dev/verify-battle-stage.mjs` — append 1 check. Baseline 41 → acceptance:
`node dev/verify-battle-stage.mjs` prints exactly `42 passed, 0 failed`.**

- BS-1 prose twin: after a `flood` event, `combatPanel(w,cur)` markup contains the literal
  `⌇ flood near:C` (RED on un-fixed code: absent).

**`dev/verify-dm-seam.mjs` — no new checks; must stay `38 passed, 0 failed`** (its existing parity +
ROOT-B probes are the type-list/switch/fields tripwire).

Post-edit: `python3 build/check-manifest.py` exits 0 (no new files in this unit; dm.js /
theater-data.js / render.js are already registered).

---

## §2 Unit TN-B — screenshot gates (the visual-regression tripwire)

The rig already exists and is proven: `dev/battle-gate/capture-stage.mjs` (real Chrome, real app,
real fight, `round0/*.png` + `round0/metrics.json`). What's missing is (a) a machine gate over the
metrics so a blank canvas / scroll / overflow regression fails a COMMAND, not an eyeball, and (b) a
binding policy for WHEN the capture is mandatory. This unit adds both. **No product code changes in
this unit — `dev/` only.**

### 2.1 New file: `dev/battle-gate/assert-metrics.mjs`

Reads `dev/battle-gate/round0/metrics.json` (freshly produced — see 2.3 step order), prints one
`✓/✗` line per assert in the harness's house style, ends with `N passed, M failed`, exits 1 on any
failure. **A missing/renamed key is a FAILURE, never a skip** (the metrics writer in
`capture-stage.mjs` is the authoritative key source; if it drifts, the gate must scream, not shrug).

The 10 asserts (key paths per `dev/battle-gate/README.md`'s round-0 pointer table, verified against
the committed `metrics.json`):

| # | assert | catches |
|---|---|---|
| M-1 | `theaterMounted === true` | theater silently failing to mount |
| M-2 | `canvasConfirmedNonBlank === true` | the blank-black-canvas class (the rig's element-screenshot luminance probe — see README's `preserveDrawingBuffer` gotcha; never loosen this by sampling the live canvas) |
| M-3 | `stage1440.theaterStageCanvas.aspectDelta <= 0.02` | letterbox/stretch (backing vs client aspect) |
| M-4..M-7 | `stage1440.pageScroll.equal === true`, same for `stage1280`, `explore`, `classic` | the IN-SESSION-UI no-scroll law at both sizes + both modes |
| M-8 | `stage1440.overflowingDescendants.length === 0` | right-rail horizontal overflow / clipped text |
| M-9 | `consoleErrors.length === 0` | any runtime error either mode |
| M-10 | `classic.arenaHttpStatus.status === 200` (the committed `metrics.json` writes `arenaHttpStatus` as an OBJECT `{status, ok}`, not a bare integer — assert the nested `.status`, and treat a non-object / missing `.status` as a FAILURE) | classic-fallback arena art 404 |

Acceptance (Unit B alone): `node dev/battle-gate/assert-metrics.mjs` prints `10 passed, 0 failed`,
exit 0. RED-FIRST demonstration: run it against a doctored copy of `metrics.json` with
`canvasConfirmedNonBlank` flipped to `false` and one `pageScroll.equal` flipped — expect
`8 passed, 2 failed`, exit 1 (capture the output in the unit notes).

### 2.2 The mandatory-gate policy (binding on every future theater unit)

The capture + assert pair is **MANDATORY before merge** for any branch whose diff touches ANY of:

- `src/ui/theater-boot.js` (any edit — camera, fit, zoom, materials, mount, CSS-adjacent constants)
- `src/ui/theater-figures.js`, `src/ui/theater-parts.js` (figure/prop geometry or scale)
- `src/ui/theater-verbs.js` (verb timing/endstates are visual)
- `src/engine/theater-data.js` — only when the diff touches `THEATER_ENV_PALETTE`, `THEATER_STEP`,
  `THEATER_PATCH`, or tile/prop emission (a pure keyword-table row addition is exempt)
- `src/world/render.js` — only `theaterStageSync`, `cmbStageOverlay`, `combatPanel`, or stage-layout
  markup
- `genesis.html` — any CSS rule matching `.theater-*`, `.stage-*`, `.cmb-*`

Gate = run, in order: `node dev/battle-gate/capture-stage.mjs` then
`node dev/battle-gate/assert-metrics.mjs` (green), **then the orchestrator (never the executor)
vision-reads `round0/stage-1440.png`, `round0/stage-1280.png`, `round0/classic-fallback.png`**
against this 4-item eyeball checklist (the metrics can't see composition):

1. board centered, occupying the majority of the canvas (ACCEPTANCE.md #1);
2. every unit figure distinguishable at 1440 (silhouettes not merged into blobs);
3. overlay chips/band-rail not covering the board center;
4. Ivalice chrome intact (squared corners, engraved gold, layers-not-boxes).

Never trust the executor's self-reported green (the handoff-seam law): the orchestrator re-runs both
commands itself. PNGs stay uncommitted (large, environment-dependent); the recorded evidence is the
`assert-metrics` output line + the orchestrator's checklist verdict pasted into the merge commit body.

### 2.3 Edge cases

| # | case | ruling |
|---|---|---|
| B-E1 | capture run while a live bridge session is up | already solved by the rig (port discipline, never 5175/5178) — policy inherits it; still never run during a live playtest (the mailbox law) |
| B-E2 | headless WebGL flake (ANGLE) | rig's own swiftshader retry handles it; if BOTH attempts blank, that IS a failure — never rerun-until-green more than the rig's built-in single retry |
| B-E3 | `metrics.json` from a stale prior run | `assert-metrics` first asserts `generatedAt` parses to within the last 30 minutes → else `✗ stale-metrics` (this is inside M-count? NO — it is a pre-flight guard printed before M-1; a stale file short-circuits to `0 passed, 1 failed`) |
| B-E4 | diff touches a trigger file but is comment-only | still gated — cheap to run, and "comment-only" claims are exactly how visual regressions sneak |

### 2.4 Worked example (before → after)

Before: a figure-scale tweak in `theater-figures.js` merges on jsdom-green alone; the board renders
units 40% too large, overlapping chips — nobody notices until a live session.
After: the same branch cannot merge without `capture-stage` + `assert-metrics` (`10 passed`) + the
orchestrator's eyeball pass on `stage-1440.png`, where item 2/3 of the checklist catches it in
seconds. Blind-playable parity: this unit is dev-tooling only — no player-facing surface, no prose
twin owed; the prose surfaces it protects (`.stage-prose`, ledger feed) are asserted structurally by
`verify-battle-stage.mjs` already (README §6 cross-ref).

---

## §3 Unit TN-C — dirty-key `setBoard`/`setUnits` (skip unchanged GL rebuilds)

**Queue law: TN-B must land first** — TN-C's acceptance runs through the battle-gate rig.

### 3.1 The key (LOCKED: full-payload stringify — nothing cleverer)

`theaterBoardFrom`/`theaterUnitsFrom` are pure and their payloads are plain JSON-safe objects
(verified shapes, §0). Therefore the correct-by-construction dirty key is
`JSON.stringify(payload)` — ~10–30 KB per call, computed once per `renderWorld` (render-on-demand;
there is no per-frame loop to pollute — theater-boot.js:16–17). **Hand-rolled per-field keys are
REJECTED** (they re-derive what stringify already proves, and every missed field is a stale-board
bug); anything beyond this is the premature optimization GPT's bullet warns against.

### 3.2 Exact edits — all in `src/ui/theater-boot.js`

1. State (the `S` literal at :2443, beside `lastBoard: null, lastUnits: null`): add
   `boardKey: null, unitsKey: null,`.
2. `setBoard(data)` (:3369) — insert after the existing `if(!S.mounted || !data) return;`:
   ```js
   const dirtyKey = JSON.stringify(data);
   if(dirtyKey === S.boardKey) return;   // dirty-key skip: identical payload, GL state already current
   S.boardKey = dirtyKey;
   ```
   (before `drainTweens` — a skipped call must not drain tweens either; nothing changed.)
3. `setUnits(data)` (`function setUnits` at :3721) — same three lines against `S.unitsKey`, inserted
   after its own `if(!S.mounted || !data) return;` guard.
4. **Invalidation sites (every one explicit — miss one and the board goes stale):**
   - `mount()` on success and `retire()`: `S.boardKey = null; S.unitsKey = null;`
   - `play()` (the verb entry point): first line `S.boardKey = null; S.unitsKey = null;` — any
     animation may leave transforms displaced (knockback's slide, absurdity's tile flicker); the
     null forces the next sync to rebuild, which is EXACTLY today's behavior on any turn containing
     an animation. The skip only ever fires on animation-free turns — the common prose-turn case,
     which is the whole win.
   - the `pixelSkin` setter (`Object.defineProperty(window.Theater, "pixelSkin", …)` at :4087) and
     `wholeObject` setter (:4101): null both keys (skin/registry
     flips change rendering without changing payload — their doc contract "the next setUnits()
     re-render picks it up" now REQUIRES the null to stay true).
   - `setTextures()`: null `S.boardKey` (its contract tints tiles on the next setBoard — :47).
   - **the P1′ async whole-object replay (:4055–4056): immediately before the two re-calls, null
     both keys.** THIS IS THE ONE THAT BREAKS SILENTLY IF MISSED — the replay intentionally re-sends
     `S.lastBoard`/`S.lastUnits` verbatim, and a dirty-skip there means async-loaded models never
     appear (C-E1).
   - `reattach()`: NO invalidation (canvas re-parent, GL intact — a rebuild there would be the exact
     waste this unit removes).
5. Instrumentation (acceptance needs moved values, not labels): module-scope counters surfaced as
   ```js
   window.Theater.stats = { boardBuilds:0, unitBuilds:0, boardSkips:0, unitSkips:0 };
   ```
   incremented at the top of each rebuild path and inside each skip-return. Read-only diagnostics —
   nothing in product code reads them.

### 3.3 Rig extension + acceptance

- `dev/battle-gate/capture-stage.mjs`: after the fight is live and screenshotted, drive **three
  additional no-op renders** (`page.evaluate(() => renderWorld())` ×3 — no state change between
  them), then record `page.evaluate(() => window.Theater.stats)` into `metrics.json` as top-level
  `rebuildStats`.
- `dev/battle-gate/assert-metrics.mjs` grows 4 asserts (M-11..M-14):
  `rebuildStats.boardBuilds >= 1`, `rebuildStats.boardSkips >= 3`, `rebuildStats.unitBuilds >= 1`,
  `rebuildStats.unitSkips >= 3` — builds moved off zero AND skips moved off zero: the value-moved
  proof that both paths exist and fire.
- **Acceptance:** `node dev/battle-gate/capture-stage.mjs && node dev/battle-gate/assert-metrics.mjs`
  prints `14 passed, 0 failed`, exit 0. RED-FIRST: run the grown `assert-metrics` against a capture
  from the UN-FIXED boot file — `rebuildStats` is absent → `10 passed, 4 failed` (missing key =
  failure), captured in the unit notes.
- Plus the standing suite untouched: `verify-battle-stage.mjs` `42 passed` (post-TN-A number),
  `verify-theater-verbs.mjs` `84 passed`, `check-manifest.py` exit 0, and the orchestrator eyeball
  pass (§2.2) on the fresh PNGs — this unit edits theater-boot.js, so the gate is mandatory by its
  own policy.

### 3.4 Edge cases

| # | case | ruling |
|---|---|---|
| C-E1 | async whole-object replay deduped away | prevented by the :4055 null (3.2.4); the M-11..14 capture also exercises the real async path since the fight's own first render triggers model loads |
| C-E2 | verb leaves a figure displaced, next payload identical | `play()` nulls both keys — next sync rebuilds; behavior identical to today |
| C-E3 | TN-A terrain mod between renders | `scene.mods`/`hazardZones`/`elevZones` change the `theaterBoardFrom` output → different stringify → rebuild. No coupling code needed; the key is derived from the payload, so any state that matters is in it by construction |
| C-E4 | key comparison cost | one stringify + one string compare per render pass; render is on-demand (no rAF loop) — declared acceptable, no caching/hashing layer permitted |
| C-E5 | `setBoard(null)` / pre-mount call | existing guard returns before the key logic — unchanged |
| C-E6 | zoom()/rotate() | untouched — they operate on camera, not groups, and never consult the keys |

### 3.5 Worked example (before → after, the code site)

Before (`theater-boot.js:3369`):
```js
function setBoard(data){
  if(!S.mounted || !data) return;
  drainTweens(S);
```
After:
```js
function setBoard(data){
  if(!S.mounted || !data) return;
  const dirtyKey = JSON.stringify(data);
  if(dirtyKey === S.boardKey){ window.Theater.stats.boardSkips++; return; }
  S.boardKey = dirtyKey;
  window.Theater.stats.boardBuilds++;
  drainTweens(S);
```
Observable delta: a 10-turn all-prose stretch mid-fight previously rebuilt 108 tile meshes + all
figures 10×; now 1× + 9 skips (`rebuildStats` proves it). Blind-playable parity: zero player-facing
surface change — same pixels, fewer rebuilds; prose surfaces untouched.

---

## §4 Queue, don't-touch, cost

**Build order:** TN-A ∥ TN-B (independent; parallel executors fine) → TN-C (needs TN-B's rig).
Branches: `feat/theater-terrain-change`, `chore/battle-gate-asserts`, `feat/theater-dirty-keys` —
one `--no-ff` merge each, orchestrator re-gates every unit personally.

**Don't-touch (hard):** generated files — `tables.json`, `tables.js`, `data/bestiary.js`,
`data/realm-bestiary.js`, `data/class-progression.js`, `data/wiki.js` (generator-owned; spec
generator edits only — this spec needs none). Also out of bounds for these units:
`src/ui/theater-verbs.js` verb LIST (`THEATER_VERBS` frozen), `STAGE_FX_VERBS` (dm.js:31),
`vendor/three/`, `dev/dm-bridge.py`, anything under `.dm/`, `docs/DM-BRIDGE.md` mid-live-session,
and `cmbProseSummary` (explicitly unchanged, §1.4). No manifest additions (no new product modules;
the two new/edited `dev/` files are outside the manifest by convention — verify `check-manifest.py`
still exits 0).

**Inference cost (SPEED doctrine declaration):** all three units — **zero** model calls added.
`terrain_change` rides the existing DM turn (one more event type in the same response, ~40 bytes);
the digest grows ≤ ~60 bytes only while mods exist (last-3 slice). Units B/C are dev-rig/perf only.

**Executor sizing:** TN-A = M (one dm.js case + one theater-data block + 24 checks across 3
harnesses). TN-B = S (one new dev script + policy text). TN-C = S (guarded three-line insertions +
7 invalidation sites + rig extension).

**PROVISIONAL (Adam skims):** the six `TERRAIN_PROSE` default lines (§1.2); rubble
`partParams.scale` 0.9/0.6 (§1.3); the §2.2 eyeball-checklist wording. Locked defaults are
build-ready as written — none blocks execution.

---

## Registry updates

Fable applies these one-liners in the same change that lands each unit (this doc's executor does NOT):

- `docs/DESIGN.md` (decision registry): add — "2026-07-06 THEATER-NEXT locked: `terrain_change`
  zone-scoped 6-op vocabulary (no new stage verbs); battle-gate screenshot gate mandatory for
  theater-touching diffs; setBoard/setUnits dirty-key skip (full-stringify, play() invalidates).
  Spec: docs/THEATER-NEXT.md."
- `docs/NEXT-STEPS.md`: add the three units (TN-A ∥ TN-B → TN-C) to the post-freeze build queue,
  each with its acceptance command + number from the acceptance blocks above — TN-A per §1.7
  (`node dev/verify-theater-data.mjs` → `295 passed`, `node dev/verify-dm-events.mjs` → `49 passed`,
  `node dev/verify-battle-stage.mjs` → `42 passed`), TN-B per §2.1
  (`node dev/battle-gate/assert-metrics.mjs` → `10 passed`), TN-C per §3.3
  (`node dev/battle-gate/capture-stage.mjs && node dev/battle-gate/assert-metrics.mjs` → `14 passed`).
- `docs/README.md` (docs index): add `THEATER-NEXT.md` under `type: system-spec` — "battle theater
  next steps: terrain_change / screenshot gates / dirty keys".
- `docs/BATTLE-THEATER.md`: §5 gains "SPECCED payload-exact in [[THEATER-NEXT]] (supersedes this
  section's sketch — zone-only, no `tiles` addressing)"; §7's T4 row points at TN-A; add one §7
  line — "visual gate: dev/battle-gate capture+assert is mandatory per THEATER-NEXT §2.2."
- `docs/EVENT-CONTRACT.md`: add the `terrain_change {op, zone, note?}` row (accept/alias per §1.1;
  aliases `at→zone`, `kind→op`) beside `stage_fx`.
- DM prompt surfaces: `grep -rn "stage_fx" docs/` and add `terrain_change` beside every listing hit
  (DM-BRIDGE runbook's fight section gains BATTLE-THEATER §5's promised line: "when the fiction
  breaks the field, say so with `terrain_change`").
- `dev/battle-gate/README.md`: append a "standing gate" section pointing at THEATER-NEXT §2
  (assert-metrics + trigger list + eyeball checklist).
