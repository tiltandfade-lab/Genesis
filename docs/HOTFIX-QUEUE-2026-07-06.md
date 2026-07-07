---
type: system-spec
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors
---

# HOTFIX-QUEUE — 2026-07-06 deep-review fix spec

Source: the four-agent deep review of the 2026-07-01→06 wave diff (findings re-verified against
master at spec time, 2026-07-06 late evening). Ten independent executor units H1–H10 in priority
order, plus a PLAUSIBLE tail that needs a confirming probe before any fix is authored.

**Orchestration rules (apply to every unit):**
- One branch per unit, `fix/<slug>` as named in each unit header. Units are independent — any
  subset can land in any order EXCEPT H7 note (latent until DM-SEAT unit 4; must land before that
  track ships).
- `python3 build/check-manifest.py` exits 0 after ANY module edit (H1 adds an owned symbol —
  manifest edit is in-scope for that unit only).
- **RED-FIRST**: every new regression check must be demonstrated failing against un-fixed code
  (stash the fix, run, capture the red line, unstash) before it counts. Assert the VALUE moved,
  never just a label/ok-flag (the BUG-01 lesson).
- Harness runs: `node dev/verify-<x>.mjs` (jsdom home `~/.genesis-jsdom`; the harnesses resolve it
  themselves via `JSDOM_HOME`/default). Baseline pass counts below were captured green on
  2026-07-06 — "expected" = baseline + the unit's new checks, 0 failed, exit 0.
- Global don't-touch: `tables.js`/`tables.json`/`data/class-progression.js`/`data/spells-slim.js`
  (generated), `Engine/` markdown, `docs/DM-BRIDGE.md`, anything under `dev/playtest-saves/`
  EXCEPT the one file H8 names, no ES-module conversions, no renames.

| unit | slug | size | files |
|---|---|---|---|
| H1 | fix/idb-destroy-world | M | src/world/store.js, src/world/play.js, manifest.json, dev/verify-idb-hydration.mjs |
| H2 | fix/shared-material-obliterate-flee | S | src/ui/theater-verbs.js, dev/verify-theater-verbs.mjs |
| H3 | fix/event-number-coercion | M | src/world/dm.js, src/engine/combat.js, dev/verify-roll-branches.mjs, dev/verify-dm-seam.mjs |
| H4 | fix/gs-combat-reset-on-enter | S (one-line-class) | src/world/play.js, dev/verify-combat-lifecycle.mjs |
| H5 | fix/seat-origin-guard | S | dev/dm-bridge.py, dev/verify-bridge.py |
| H6 | fix/verify-mutation-asserts | M | 7 dev/verify-*.mjs files |
| H7 | fix/seat-conversation-state | M | src/world/seat.js, dev/verify-seat.mjs |
| H8 | docs/event-contract-repair | M (doc) | docs/EVENT-CONTRACT.md, dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md |
| H9 | fix/check-manifest-blindspots | S-M | build/check-manifest.py |
| H10 | fix/theater-cache-dispose | S | src/ui/theater-boot.js, dev/verify-theater-verbs.mjs |

---

## H1 — destroyWorld must delete the IDB row + cancel the pending debounced save

**Bug (verified):** `destroyWorld` (src/world/play.js:420-427) deletes `U.worlds[id]` + `saveU`
only. `storeHydrateFromIDB` (src/world/store.js:213-223) runs every boot and adopts ANY IDB
`worlds` row missing from `U.worlds` — store.js has no worlds-row delete anywhere. Typed-DESTROY
worlds resurrect on next boot ("Recovered N world(s) from deep storage"). Aggravator: a pending
debounced save timer (`_storeSaveTimers`, store.js:110-123, `STORE_DEBOUNCE_MS` = 250, store.js:39)
is never cleared by destroyWorld, so an in-flight `saveWorld` can re-`put` the row up to 250ms
AFTER destruction.

### Changes

**1. src/world/store.js — add the delete API, directly below `storeHydrateFromIDB` (after line 223):**

```js
/* storeDeleteWorld — the destroy-side twin of saveWorld (destroyWorld is the ONLY caller).
   Clears any pending debounced save FIRST (a queued put must never outlive the row), then
   deletes the IDB row. NULL-SAFE like everything here: no IDB -> {ok:false,reason:"no-idb"}
   (the LS copy is already gone via saveU — a plain degrade, not a failure). */
function storeDeleteWorld(id){
  if(!id) return Promise.resolve({ ok:false, reason:"no-id" });
  storeClearWorldTimer(id);
  if(!storeAvailable()) return Promise.resolve({ ok:false, reason:"no-idb" });
  return storeTx("worlds", "readwrite", store=>store.delete(id));
}
```

Signature: `storeDeleteWorld(id: string) → Promise<{ok:boolean, reason?:string}>` — the exact
return shape `storeTx` already produces (see `storeWriteWorldNow`, store.js:124-129 for the
pattern being mirrored).

**2. src/world/play.js — call it inside the confirmed branch of destroyWorld.**

Before (play.js:420-427):
```js
function destroyWorld(id){
  const w=U.worlds[id];if(!w)return;
  if(prompt(`Destroying "${w.name}" erases it and everything in it, forever. Type DESTROY to confirm.`)==="DESTROY"){
    delete U.worlds[id];
    if(U.activeWorldId===id)U.activeWorldId=Object.keys(U.worlds)[0]||null;
    saveU(U);toast(`${w.name} is unmade.`);renderShelf();showTab('universe');
  }
}
```
After:
```js
function destroyWorld(id){
  const w=U.worlds[id];if(!w)return;
  if(prompt(`Destroying "${w.name}" erases it and everything in it, forever. Type DESTROY to confirm.`)==="DESTROY"){
    delete U.worlds[id];
    if(U.activeWorldId===id)U.activeWorldId=Object.keys(U.worlds)[0]||null;
    // forever-store twin (HOTFIX-QUEUE-2026-07-06 H1): kill the IDB row + any pending debounced
    // put, or storeHydrateFromIDB resurrects the world on the next boot. Fire-and-forget — the
    // UI never waits on IDB (same posture as saveWorld's own debounce).
    if(typeof storeDeleteWorld==="function") storeDeleteWorld(id);
    saveU(U);toast(`${w.name} is unmade.`);renderShelf();showTab('universe');
  }
}
```

**3. manifest.json:** add `"storeDeleteWorld"` to the `world.store` module's `owns` array
(alphabetically it sits fine right after `storeClearWorldTimer`; order within `owns` is not
checked — append is acceptable).

### Edge cases (ruled)
- **No IDB present** (old browser / jsdom without shim): `storeDeleteWorld` resolves
  `{ok:false,reason:"no-idb"}` — silent, no toast (mirrors storeWriteWorldNow's no-idb posture,
  store.js:130-134).
- **Row never existed in IDB** (world created + destroyed inside one debounce window): IDB
  `delete` on a missing key succeeds — `{ok:true}` — fine.
- **Destroy the ACTIVE world mid-session:** out of scope — destroyWorld is only reachable from the
  menu, and the existing activeWorldId fallback already handles it. Do not add session teardown here.
- **Delete FAILS against a present IDB:** do NOT route into `storeHandleWriteFailure` (that flow
  offers an export of a world we're destroying — nonsense). Resolve the storeTx result as-is;
  worst case is the pre-fix resurrection behavior, no new failure mode.

### Don't touch
`storeHydrateFromIDB` itself (its adopt-anything contract is CORRECT for the recovery case),
`migrateLStoIDB`, `saveU`, the prompt copy, `dev/fake-idb-shim.mjs`.

### Regression checks (add to dev/verify-idb-hydration.mjs — baseline **11 passed / 0 failed**)
Use the existing `newWin` + `idbPutWorld` + `flush` helpers and the fake-idb shim already in the file.
1. **RED probe (the headline):** boot a win with world `w-dx` in BOTH U and IDB; stub
   `win.prompt = () => "DESTROY"`; call `win.destroyWorld("w-dx")`; `await flush()`; then run
   `win.storeHydrateFromIDB()` → assert `adopted.length === 0` AND `U.worlds["w-dx"]` is still
   absent. *Red against un-fixed code: adopted === ["w-dx"] (the resurrection).*
2. **Debounce-timer cancel:** `saveWorld(w)` (debounced, NOT immediate), then `destroyWorld` in the
   same tick, then wait > 250ms (`await new Promise(r=>setTimeout(r,300))`); read the shim's
   `worlds` store → assert the row is NOT present. *Red pre-fix: the late put re-creates it.*
3. **No-idb null-safety:** `newWin({withIDB:false})` → `destroyWorld` completes, no throw, and
   `storeDeleteWorld("x")` resolves `{ok:false,reason:"no-idb"}`.
4. **Declined prompt:** `win.prompt = () => "no"` → IDB row untouched (delete is confirm-gated).

**Acceptance:** `node dev/verify-idb-hydration.mjs` → **15 passed, 0 failed**, exit 0.
`node dev/verify-storage.mjs` → **49 passed, 0 failed** (unchanged). `python3 build/check-manifest.py` → exit 0.

---

## H2 — vObliterate/vFlee: propagate the vHurt/vDown shared-material clone guard (W2-A)

**Bug (verified):** whole-object figures share ONE material set per opacity bucket
(`WHOLE_MATERIALS_CACHE`, src/ui/theater-boot.js:1013-1043, each material tagged
`userData.shared = true` at :1041). `vObliterate` (src/ui/theater-verbs.js:441-443 collect,
:443 `m.material.transparent = true`, :474 `m.material.opacity = …` tween) and `vFlee`
(:505-507 collect + `transparent = true`, :513 opacity tween) mutate those shared materials
directly — no clone guard, no restore. One crit-kill obliteration fades every co-sharing standing
figure and leaves the bucket's materials semi-transparent until a full `Theater.retire()`.
`vHurt` (:242-273) and `vDown` (:296-305) already carry the exact ruled fix.

### Changes (2 sites, same pattern each)

**Site A — vObliterate.** Replace the collect+mutate (current :441-443):
```js
  const meshes = [];
  obj.traverse((n) => { if(n.material) meshes.push(n); });
  meshes.forEach((m) => { m.material.transparent = true; });
```
with the vDown-shaped clone-and-swap (clone `map` BY REFERENCE, retag
`{shared:false, tweenClone:true}` — copy vDown :298-305 verbatim, then set
`m.material.transparent = true` on the now-safe material):
```js
  const meshes = [];
  obj.traverse((n) => { if(n.material) meshes.push(n); });
  // W2-A (HOTFIX-QUEUE-2026-07-06 H2): same clone-for-tween guard as vHurt/vDown — obliterate's
  // transparent+opacity fade must not corrupt a SHARED whole-object material bucket.
  meshes.forEach((m) => {
    if(m.material && m.material.userData && m.material.userData.shared){
      const clone = m.material.clone();
      clone.map = m.material.map; // copy the texture handle by reference, never clone it
      clone.userData = Object.assign({}, m.material.userData, { shared: false, tweenClone: true });
      m.material = clone;
    }
    m.material.transparent = true;
  });
```
The opacity write in the tween body (:474) and the debris handling are unchanged. In `onDone`
(:483-487) the figure ends `obj.visible = false` (terminal) — like vDown, the clone is
intentionally left on the hidden mesh; the next `setUnits()`/`clearGroup` rebuild drops it for GC
(`disposeMeshMaybeShared` disposes non-shared clones). No explicit dispose added.

**Site B — vFlee.** Same replacement at :505-507; opacity tween at :513 unchanged; `onDone`
(:514 `obj.visible = false`) terminal — same no-restore ruling as Site A.

### Edge cases (ruled)
- **Non-shared (cuboid/legacy) materials:** keep the plain direct-mutation path — the guard is
  the `userData.shared` check only, exactly as in vHurt/vDown.
- **`transparent = true` left on a non-shared material after flee:** pre-existing behavior for a
  terminally hidden mesh — out of scope, don't "fix".
- **A mesh with a material ARRAY:** whole-object figures use single materials per mesh
  (theater-boot's builders); vHurt/vDown already ignore the array case. Match them — no array
  handling.

### Don't touch
vHurt/vDown/vCast/vAbsurdity, `WHOLE_MATERIALS_CACHE`, `disposeMeshMaybeShared`, debris lifecycle,
`DEFAULT_DUR`.

### Regression checks (add to dev/verify-theater-verbs.mjs — baseline **84 passed / 0 failed**)
Follow the harness's existing shared-material fixtures for the vHurt W2-A checks (grep
`shared` in the file for the pattern: a mock material with `userData:{shared:true}` on two units).
1. **RED probe (obliterate):** two units sharing one material object; play `obliterate` on unit A;
   run the tween to completion → assert unit B's material `opacity === 1` and
   `transparent !== true` (i.e. the SHARED instance is untouched) and unit A's mesh material is a
   DIFFERENT object than unit B's (`!==`). *Red pre-fix: shared instance mutated, `===` holds.*
2. **Same pair for `flee`.**
3. **Clone retag:** after play, unit A's material `userData.tweenClone === true` and
   `userData.shared === false`.
4. **Non-shared path unchanged:** a solo unit with an unshared material still ends
   `visible === false` after each verb (no throw, no clone).

**Acceptance:** `node dev/verify-theater-verbs.mjs` → **≥90 passed, 0 failed**, exit 0
(84 baseline + ≥6 new). `python3 build/check-manifest.py` → exit 0.

---

## H3 — string-coercion batch on the hottest events (Number() + drift-warn)

**Bug (verified):** a DM emitting numeric payload fields as STRINGS hits silent wrong-math paths:
- `hp_changed` — src/world/dm.js:1425 `const delta=(typeof p.delta==="number")?p.delta:0;` →
  `{"delta":"-4"}` applies ZERO damage, no warn, no ledger line (`delta` IS accepted,
  DM_EVENT_FIELDS dm.js:1238, so dmFoldPayload's drift-warn sees nothing).
- `attack` — dm.js:1622 forwards `p.d20` uncoerced into `pcAttack → resolveAttack → cmRollD20`
  (src/engine/combat.js:61-67, `if(o.d20 != null) return o.d20;`) → `"18"` string-concats into
  totals (`"18" + 5 → "185"`, always hits) and disables the strict `nat === 20` crit check.
  Shared root: `resolveCheck` (src/engine/check.js:49-51, via the `check` event's opts at
  dm.js:2926) and every other cmRollD20 caller (opportunity_attack dm.js:1752, grapple/shove
  dm.js:1822/1835, foe_morale dm.js:2269).
- `death_save` — dm.js:1490 `resolveDeathSave(t.sh,p.d20)` (src/engine/death.js:52) — a string
  d20 breaks the `nat === 20` / `nat === 1` strict checks.
- `charge_restore` — dm.js:2131 `(typeof p.n==="number") ? … : max` → a string `n` silently
  FULL-REFILLS instead of restoring n.

**Template:** `insight_read`'s `Number(p.total)||0` (dm.js:2627) — plus, per this spec, a drift
ledger line when coercion actually had to repair a non-number.

### Changes

**1. src/world/dm.js — ONE helper, placed directly above `applyEvent`'s `switch` region (near
`dmFoldPayload`; exact placement: after the function that contains dm.js:1339's
`addLedger(w,"drift",{kind:"payload-drift",…})` so the ledger idiom is adjacent):**

```js
/* dmNum — coerce a payload field the handlers do MATH on (HOTFIX-QUEUE-2026-07-06 H3).
   null/undefined pass through as null (callers keep their own "absent" semantics — e.g. an
   absent d20 means "engine rolls"). A clean number passes silently. A coercible string
   ("-4", "18") is repaired to a number AND flagged: console.warn + ONE drift ledger line
   (kind:"payload-coercion") so vocabulary drift is loud, mirroring dmFoldPayload's
   payload-drift discipline. A non-coercible value returns null (caller's absent-path). */
function dmNum(w, type, key, v){
  if(v == null) return null;
  if(typeof v === "number") return (Number.isFinite(v) ? v : null);
  const n = Number(v);
  const ok = Number.isFinite(n);
  console.warn("[dm-seam] payload coercion — "+type+"."+key+" was "+(typeof v)+":", v);
  addLedger(w,"drift",{kind:"payload-coercion",type:type,key:key,raw:String(v),repaired:ok,source:"declared"},
    "⚠ payload drift — "+type+"."+key+" arrived as a "+(typeof v)+(ok?" (repaired)":" (dropped)")+".");
  return ok ? n : null;
}
```

**2. The four call sites — before → after:**

hp_changed (dm.js:1425):
```js
// before
const delta=(typeof p.delta==="number")?p.delta:0;
// after
const _d=dmNum(w,"hp_changed","delta",p.delta); const delta=(_d==null)?0:_d;
```

attack (dm.js:1622 — coerce ONCE above the pcAttack call, keep the call shape):
```js
// before ... d20:p.d20, ... magnitude:p.magnitude, ...
// after: insert above the const res= line:
p.d20=dmNum(w,"attack","d20",p.d20); p.targetAC=dmNum(w,"attack","targetAC",p.targetAC); p.magnitude=dmNum(w,"attack","magnitude",p.magnitude);
```
(`null` results keep the existing absent-semantics: engine rolls its own d20 / resolveAttack
rolls its own magnitude.)

check (dm.js:2926):
```js
// before
const opts={d20:p.d20,advantage:p.advantage,bonus:p.bonus,reroll:p.reroll};
// after
const opts={d20:dmNum(w,"check","d20",p.d20),advantage:p.advantage,bonus:dmNum(w,"check","bonus",p.bonus),reroll:dmNum(w,"check","reroll",p.reroll)};
```

death_save (dm.js:1490):
```js
// before
const r=resolveDeathSave(t.sh,p.d20);
// after
const r=resolveDeathSave(t.sh,dmNum(w,"death_save","d20",p.d20));
```

charge_restore (dm.js:2131):
```js
// before
ench.charges.cur=(typeof p.n==="number")?Math.min(max,cur+Math.max(0,Math.floor(p.n))):max;
// after
const _n=dmNum(w,"charge_restore","n",p.n);
ench.charges.cur=(_n!=null)?Math.min(max,cur+Math.max(0,Math.floor(_n))):max;
```

**3. src/engine/combat.js:63 — the engine-level safety net (no ledger; the engine has no world
handle). Covers every OTHER cmRollD20 caller (opportunity_attack/grapple/shove/foe_morale/
resolveCheck's own path) without touching each site:**
```js
// before
if(o.d20 != null) return o.d20;
// after — a non-finite/string d20 is repaired to a number, or falls through to a real roll
if(o.d20 != null){ const n = Number(o.d20); if(Number.isFinite(n)) return n; }
```

### Edge cases (ruled)
- `delta: null`/absent → 0 (unchanged pre-fix behavior for absent).
- `delta: "abc"` → null → 0, warned + ledgered `repaired:false`.
- `d20: "20"` on death_save → 20 → nat-20 revive path FIRES (the strict check now works).
- `n: "3"` on charge_restore → restores 3, NOT full refill; `n: null` → full refill (the
  documented omit-to-refill contract, unchanged).
- `dmNum` NEVER throws and never converts `""` to 0 silently — `Number("") === 0` is finite, so
  `""` repairs to 0 with the warn+ledger flag. Accepted (loud, not silent).
- Do NOT coerce inside `dmFoldPayload` globally — only the enumerated sites + the cmRollD20 net.
  (A blanket accept-list coercion is a bigger design change; out of scope tonight.)

### Don't touch
`resolveDeathSave`'s internals, `resolveCheck`'s internals beyond nothing (cmRollD20 covers it),
`DM_EVENT_FIELDS` accept lists, `insight_read` (already correct), docs (H8's job).

### Regression checks — RED-FIRST
Add to **dev/verify-roll-branches.mjs** (baseline **33/0**) or a new §block in
**dev/verify-dm-seam.mjs** (baseline **38/0**) — executor's pick of file, checks are fixed:
1. **THE red probe:** seed a PC at known hp H; `applyEvent(w,{type:"hp_changed",payload:{delta:"-4"}})`
   → assert `sheet.hpCur === H - 4` (the VALUE moved). *Red pre-fix: hpCur === H (zero applied).*
2. String heal: `{delta:"+3"}` (Number("+3")===3) raises hpCur by 3 (capped at max).
3. `applyEvent … {type:"attack",payload:{d20:"18",targetAC:10,…}}` with a stubbed equipped weapon →
   assert the resolved `res.total` is a NUMBER (`typeof === "number"`) and `< 100`. *Red pre-fix:
   "185"-style concat.*
4. death_save `{d20:"20"}` → assert `outcome === "revived"` and `hpCur === 1`. *Red pre-fix: falls
   through to the 10+ compare path ("20" >= 10 is true but nat!==20 → no revive).*
5. charge_restore `{itemId, n:"2"}` on an item at 3/10 → assert `charges.cur === 5`, NOT 10.
   *Red pre-fix: 10.*
6. Ledger assert: after probe 1, the last `w.ledger` entry with `kind:"payload-coercion"` exists,
   `type:"hp_changed"`, `key:"delta"`, `repaired:true`.
7. Clean-number silence: `{delta:-4}` (real number) produces NO payload-coercion ledger line.

**Acceptance:** the chosen harness → **baseline + 7 new, 0 failed** (roll-branches: **40/0**; or
dm-seam: **45/0**), exit 0. Plus unchanged greens: `node dev/verify-death-saves.mjs` → **33/0**,
`node dev/verify-combat.mjs` green, `node dev/verify-check.mjs` green. `check-manifest.py` exit 0.

---

## H4 — GS.combat / GS.chase reset on world entry

**Bug (verified):** `enterWorld` (src/world/play.js:100) resets only `GS.gamePanel`. `GS.combat`
is cleared only by `combat_end` (dm.js:1599), `GS.chase` only by chase end/yield (dm.js:3138,
3161). The ⚙ menu's "Return to your worlds" is reachable mid-fight → entering World B renders
World A's live fight, and combat events apply against World B's PC. `startSession`
(play.js:297-305) sets `U.activeWorldId` directly without passing through enterWorld, so BOTH
entry points need the reset.

### Changes

**1. src/world/play.js — add one shared reset helper directly above enterWorld (play.js:100):**
```js
/* HOTFIX-QUEUE-2026-07-06 H4: transient per-fight/per-chase state must never survive a world
   switch — a live World-A fight rendering (and eating events) inside World B. Mirrors
   combat_end's own teardown (dm.js: GS.combat=null + theater retire, src/world/render.js
   276-279's null-safe pattern). */
function gsResetWorldTransients(){
  GS.gamePanel=null; GS.combat=null; GS.chase=null; GS.cmbLastStates=null;
  if(GS.theaterMounted && typeof window!=="undefined" && window.Theater && typeof window.Theater.retire==="function"){
    try{ window.Theater.retire(); }catch(e){ /* best-effort */ }
  }
  GS.theaterMounted=false;
}
```

**2. Call it at both entry points — before → after:**

enterWorld (play.js:100):
```js
// before
function enterWorld(id){U.activeWorldId=id;saveU(U);GS.gamePanel=null;renderWorld();showTab('world');}
// after
function enterWorld(id){U.activeWorldId=id;saveU(U);gsResetWorldTransients();renderWorld();showTab('world');}
```

startSession (play.js:300):
```js
// before
GS.gamePanel=null;
// after
gsResetWorldTransients();
```

**3. manifest.json:** `gsResetWorldTransients` is a new top-level function in play.js — add it to
the `world.play` module's `owns` array ONLY if that module lists individual symbols (check the
entry; if it owns a wildcard, no edit). Run check-manifest to confirm.

### Edge cases (ruled)
- **Re-entering the SAME world mid-fight** (menu → worlds → same world): the fight is torn down
  too. Ruled ACCEPTABLE — leaving to the shelf mid-fight is already an abandon in fiction;
  cross-world corruption is the bug, per-world fight-suspend is not being built tonight.
- **GS.seat is NOT reset here** — that's H7's scope (its reset needs the summary/window semantics
  ruled there). No overlap: this unit touches exactly the four fields + theater above.
- **wakeIntoWorld** already runs after startSession's reset — its own `GS.gamePanel=null`
  (play.js:106) is redundant-but-harmless; leave it.

### Don't touch
`combat_end`/chase handlers in dm.js, `wakeIntoWorld`, `endSession`, render.js's prevPanel logic.

### Regression checks (add to dev/verify-combat-lifecycle.mjs — baseline **52/0**)
1. **RED probe:** start a combat in world A (`GS.combat` non-null), call `enterWorld("w-b")` →
   assert `GS.combat === null` AND `GS.chase === null` AND `GS.theaterMounted === false`.
   *Red pre-fix: GS.combat still holds world A's fight object.*
2. Same via `startSession("w-b")`.
3. Post-switch event isolation: after probe 1, `applyEvent(worldB,{type:"attack",…,target:"<world-A fid>"})`
   → `targetFoe` resolves null → no damage applied to any foe object from the old fight
   (assert the old foe's `hp` unchanged).

**Acceptance:** `node dev/verify-combat-lifecycle.mjs` → **55 passed, 0 failed**, exit 0.
`node dev/verify-in-session-ui.mjs` → **77/0** unchanged. `check-manifest.py` exit 0.

---

## H5 — /seat origin guard on dm-bridge.py (stop the open key-burning proxy)

**Bug (verified):** `_do_seat` (dev/dm-bridge.py:267-320) is a key-injecting passthrough that
answers with `Access-Control-Allow-Origin: *` (:298, and :319 on the error path), and `do_OPTIONS`
(:168-172) grants `*` + `Content-Type` for every route. Any webpage open in the browser can POST
chat-completions to `127.0.0.1:5175/seat` and burn `SEAT_API_KEY` quota. The file's own threat
comment (:58-64) acknowledges the class for tid; `/seat` got no guard.

**Fix shape (ruled — Origin pinning, no token plumbing):** the bridge SERVES the app, so the
legitimate /seat caller is always same-origin (`http://127.0.0.1:PORT` or `http://localhost:PORT`).
Browsers send an `Origin` header on every POST (including same-origin). Reject any other origin;
allow ABSENT Origin (curl / verify harnesses / non-browser tools).

### Changes (dev/dm-bridge.py only)

**1. Module scope, next to `_safe_tid` (:62-64):**
```python
# /seat is a KEY-INJECTING proxy — it must only serve the app the bridge itself hosts.
# Browsers always send Origin on POST; same-origin is 127.0.0.1/localhost on our PORT.
# An ABSENT Origin (curl, harnesses) is allowed — the guard targets cross-origin webpages.
_SEAT_ALLOWED_ORIGINS = {"http://127.0.0.1:%d" % PORT, "http://localhost:%d" % PORT}
def _seat_origin_ok(origin):
    return (not origin) or (origin in _SEAT_ALLOWED_ORIGINS)
```

**2. Top of `_do_seat` (before the SEAT_BASE_URL check at :268):**
```python
        origin = self.headers.get("Origin")
        if not _seat_origin_ok(origin):
            return self._json(403, {"error": "seat: cross-origin denied"})
```

**3. Remove the `Access-Control-Allow-Origin: *` header from BOTH _do_seat response paths**
(:298 success stream, :319 error relay). Same-origin responses need no ACAO. Leave `_json`'s
global ACAO (:150) alone — the 403 itself may carry it; a readable denial leaks nothing.

**4. `do_OPTIONS` (:168-172): carve /seat out of the blanket preflight grant** — if
`urlparse(self.path).path == "/seat"`, respond 204 WITHOUT any `Access-Control-*` headers;
every other route keeps the existing `*` grant (the mailbox routes are the loop-DM's surface and
already tid-guarded).

### Edge cases (ruled)
- `GENESIS_PORT` override (:41): the allowlist derives from `PORT` — covered automatically.
- A same-origin app fetch: Origin `http://127.0.0.1:5175` ∈ allowlist → passes; response without
  ACAO is fine same-origin.
- `null` Origin (sandboxed iframe / file://): the string `"null"` is NOT in the allowlist →
  403. Correct — the app never runs file:// (CLAUDE.md).
- Non-browser POST (verify-bridge.py, curl): no Origin header → allowed, unchanged workflows.
- Do NOT guard the mailbox/telemetry/reset routes — out of scope; their exposure is the
  documented tid-validated class.

### Don't touch
The pricing table, telemetry, mailbox routes, `_safe_tid`, upstream forwarding logic, seat.js
(zero app-side changes — same-origin fetch needs nothing).

### Regression checks — extend **dev/verify-bridge.py** (transport+contract harness)
1. **RED probe:** POST /seat with header `Origin: http://evil.example` (SEAT env unset is fine —
   the guard must fire BEFORE the 503 config check) → expect **403**. *Red pre-fix: 503
   "seat not configured" (i.e. the request was processed).*
2. POST /seat with `Origin: http://127.0.0.1:<PORT>` → expect **503** (config check reached) when
   SEAT env unset.
3. POST /seat with NO Origin → **503** (allowed through the guard).
4. OPTIONS /seat → response contains NO `Access-Control-Allow-Origin` header.
5. OPTIONS /turn → still contains `Access-Control-Allow-Origin: *` (mailbox unchanged).

**Acceptance:** `python3 dev/verify-bridge.py` → all existing checks green + the 5 new ones, 0
failed, exit 0 (print-count style per that file's convention). **NEVER run it against a live
playtest bridge** (it resets the .dm mailbox — standing gotcha).

---

## H6 — verify-harness mutation-assert hardening (the BUG-01 class)

**Bug (verified):** label-only asserts that stay green when the VALUE regresses. Per-file,
per-line strengthening list (all line refs re-verified 2026-07-06). For each item: add the
strengthened assert alongside (never replacing) the existing check unless marked REPLACE, and
demonstrate each new assert RED by the listed mutation (apply mutation → run → red → revert).

**1. dev/verify-roll-branches.mjs:88-115** (baseline 33/0) — the branch checks assert
`source:"branch"` / `lastResolution.branch` / `res.ok` but never read the sheet. Fixture deltas
are 0/−1/−5 (:68-70). ADD: capture `hpBefore` per scenario; after `dmRollFor` assert
`sheet.hpCur === hpBefore` (success, delta 0), `hpBefore - 1` (nearMiss), `hpBefore - 5` (fail).
*Red-mutation: stub hp_changed's applyHpDelta call to a no-op.* (+3 checks)

**2. dev/verify-items.mjs:419-424** (baseline 123/0) — the +1-weapon check asserts
bonus/baseName/magicBonus but never the DIE. ADD: `__mDmg.dmg[0].die === 8 && __mDmg.dmg[0].n === 1
&& __mDmg.dmg[0].type === "slashing"` ("right label, wrong die" now fails). Similarly at
:256-269 ADD one die assert on `__posMain` (`dmg[0].die === 6`, Scimitar) — (+2 checks).

**3. dev/verify-items.mjs render blocks :377-384, :504-509, :659-664** — substring asserts sit
inside `if (html)` guards: a throw sets `html` undefined and the inner checks SKIP silently
(only the "doesn't throw" check fires). REPLACE each `if (html) { … }` with unconditional
`check(name, !!html && html.includes(...))` forms (guard folded INTO each assert), and ADD one
differential re-render per block: mutate the fixture (e.g. condition removed / charges 7→3 /
grip toggled) → re-render → assert the HTML CHANGED where expected (`html2.includes("3/10")` and
`!html2.includes("7/10")`). (+3 differential checks; the unconditional rewrite keeps counts).

**4. dev/verify-combat-lifecycle.mjs:296** (baseline 52/0) — 9d asserts `Array.isArray(r.expired)`
only. ADD: tick rounds until the poisoned ttl lapses and assert the condition actually LEFT
`foe.conditions` (`!foe.conditions.some(c=>c.cond==="poisoned")`) and that `r.expired` NAMES it.
*Red-mutation: comment the splice/filter in the expiry path.* (+2 checks)

**5. dev/verify-dm-events.mjs:158-171** (baseline 36/0) — codex link/reveal/update verified via
rendered panel text only. ADD record-level asserts against `cw.codex.records`: the link EDGE
exists on the sabarra record (rel `located-in` → `location:saltmarsh-shrine`), `known === true`
after reveal, and `status.at === "location:saltmarsh-shrine"` after update. (+3 checks)

**6. dev/verify-in-session-ui.mjs:284** (baseline 77/0) — `/Reveal all/.test(html) || true` cannot
fail. REPLACE with a state-forked pair: with `w.revealed` not-all-set assert
`/Reveal all/.test(html)`; then set all reveals and assert the button is gone. (+1 net check)

**7. dev/verify-monster-parley.mjs:454-459, 465-469** (baseline 82/0) — the 12d inner checks sit
inside `if (neutralRec)` / `if (friendlyRec)` and silently skip on a null mint (the existence
check one line above partially covers 12d only). Hoist: replace the guards with unconditional
checks using optional access (`neutralRec && att.value === 0` style) so a null mint FAILS the
attitude/bond checks too, and ADD the missing existence check for `friendlyRec` (12d has one,
the friendly block doesn't). (+1 check, rest strengthened in place)

**House pattern to copy:** verify-monster-parley.mjs §9 MUTATION GUARD blocks (:296-330).

### Don't touch
Any src/ or data/ file (this unit is harness-only); the fixtures' semantics; passing checks'
names (append, don't rename — the ledgered baselines reference them).

**Acceptance (all green, exit 0):** roll-branches **36/0** · items **≥128/0** · combat-lifecycle
**54/0** · dm-events **39/0** · in-session-ui **78/0** · monster-parley **83/0**. Each NEW check's
red-mutation demonstrated and noted in the unit's commit message (mutation → red line quoted).

---

## H7 — seat.js conversation-state repairs (4 sub-fixes)

**Status note:** LATENT — currently unreachable (docs/SEAT-PROMPT.md doesn't exist; seatBoot
degrades and seatToggleTransport refuses, src/world/seat.js:45-48). **MUST land before the
DM-SEAT track's unit 4 (SEAT-PROMPT.md) ships** — the orchestrator sequences that.

All in src/world/seat.js (baseline: `node dev/verify-seat.mjs` → **35/0**).

### 7a — cross-world/session bleed: GS.seat never resets
**Verified:** `GS.seat` (seat.js:72-75) is never reset by enterWorld/startSession/endSession
(play.js touches no seat state). World B's first seat turn replays World A's window+summary;
`bootstrapped` survives endSession so session 2+ never re-sends the bootstrap block.

**Fix:** add to seat.js:
```js
/* Reset the per-session conversation state (window/summary/bootstrapped/stream) — keeps the
   fetched prompt (promptText/promptTried: per-BOOT, not per-session; byte-identical anyway). */
function seatResetSession(){
  const s = seatState();
  s.window = []; s.summary = null; s.bootstrapped = false;
  s.streamText = null; s.streaming = false;
}
```
Call sites (3): inside H4's `gsResetWorldTransients()` in play.js — append
`if(typeof seatResetSession==="function") seatResetSession();` (if H4 already landed, this is a
one-line addition there; if not, add typeof-guarded calls in enterWorld + startSession directly) —
and in `endSession` (play.js:306-319, after `w.sessionLive=false`). Register `seatResetSession`
in manifest `world.seat` owns.

### 7b — double payload: the turn rides twice
**Verified:** seatSend pushes the user payload into the window (seat.js:364) BEFORE
`seatAssembleMessages` (:156-167) replays the window AND appends the payload again (:165) — every
request ends `user:<payload>, user:<payload>`.

**Fix (ruled):** assemble FIRST from the pre-push window, push AFTER. Before → after (seat.js:362-365):
```js
// before
  return seatBoot().then(() => {
    if(!seatReady()) throw new Error("seat prompt unavailable");
    seatWindowPush("user", JSON.stringify(turnPayload));
    return seatPostAndStream(seatAssembleMessages(w, turnPayload), seatLane, turnId);
  })
// after
  let assembled = null;
  return seatBoot().then(() => {
    if(!seatReady()) throw new Error("seat prompt unavailable");
    assembled = seatAssembleMessages(w, turnPayload);   // window WITHOUT this turn; payload appended by assemble
    seatWindowPush("user", JSON.stringify(turnPayload)); // window now carries it for FUTURE turns
    return seatPostAndStream(assembled, seatLane, turnId);
  })
```

### 7c — failed turn pollutes / retry loses bootstrap
**Verified:** the catch (:372-375) never pops the pre-pushed user turn nor restores
`bootstrapped`; the parse-retry path re-assembles at :367 AFTER `bootstrapped` was consumed at
:161, dropping the bootstrap from the corrective retry (and re-appending the payload a third time).

**Fix (rides on 7b's `assembled`):**
- :367 — reuse the SAME assembled object, never re-assemble:
  `return seatResolveResponse(raw, turnId, assembled, seatLane);` (seatResolveResponse already
  passes `assembled` verbatim into the retry POST — with 7b that retry now carries the bootstrap
  and exactly one payload).
- catch (:372-375) — unwind the state the failed turn consumed:
```js
  }).catch(e => {
    const s = seatState();
    const lastU = s.window[s.window.length-1];
    if(lastU && lastU.role === "user" && lastU.content === JSON.stringify(turnPayload)) s.window.pop();
    seatBridgeDown(e);
    throw e;
  });
```
  `bootstrapped` restore: capture `const wasBootstrapped = seatState().bootstrapped;` BEFORE the
  assemble in 7b; in the catch, `if(!wasBootstrapped) s.bootstrapped = false;` (a failed FIRST
  turn re-sends the bootstrap next attempt; a failed later turn leaves it true — correct).

### 7d — toggle leaks summary
**Verified:** seatToggleTransport (:55-57) clears `window` + `bootstrapped` but not `s.summary` —
a transport round-trip resurrects stale summarized history.

**Fix:** replace the two-line reset (:56-57) with `seatResetSession()` (7a's helper — it clears
summary too).

### Edge cases (ruled)
- A reload mid-session: GS is transient — window/summary/bootstrapped already vanish; unchanged.
- seatResetSession must NOT clear `promptText`/`promptTried`/`_bootPromise` (prompt is per-boot,
  byte-identical by contract §2).
- The stutter envelope path (second parse fail) is a RESOLVED turn — the window keeps the user
  turn and gains the stutter narration via the normal seatWindowPush("assistant", …); no unwind.

### Don't touch
seatReadSSE/seatConsumeSSELine (the SSE reader), seatValidate/vocabulary, dm.js's applyResponse,
the mailbox path, DM-BRIDGE.md.

### Regression checks (add to dev/verify-seat.mjs — baseline **35/0**)
1. **RED (7b):** stub fetch to capture the POSTed body; send one turn → assert the LAST message is
   the payload and the SECOND-to-last is NOT an identical user payload (count occurrences of the
   exact payload string in `body.messages` === 1). *Red pre-fix: 2.*
2. **RED (7a):** send a turn in world A, then simulate endSession + a new session → capture the
   next POST → assert `messages[0].content` starts with the bootstrap (prep handoff/SESSION
   OPENING DIGEST) again and contains NO world-A window turns. *Red pre-fix: bootstrapped stayed
   true + old window replayed.*
3. **RED (7c-retry):** force first response unparseable on turn 1 → assert the retry POST's
   messages still include the bootstrap block and exactly one payload + the corrective
   instruction. *Red pre-fix: no bootstrap on the retry.*
4. **RED (7c-catch):** make fetch reject → after the catch, assert `seatState().window.length`
   returned to its pre-send value and (for a first turn) `bootstrapped === false`.
5. **RED (7d):** seed `s.summary = "STALE"`; toggle transport off→on → `s.summary === null`.

**Acceptance:** `node dev/verify-seat.mjs` → **40 passed, 0 failed**, exit 0.
`check-manifest.py` exit 0 (new owned symbol registered).

---

## H8 — EVENT-CONTRACT.md doc repair (interim; superseded by DM-CONTRACT-ARTIFACT)

**Supersession note:** the DM-CONTRACT-ARTIFACT spec (drafted tonight, docs/DM-CONTRACT-ARTIFACT.md)
makes a GENERATED contract artifact the permanent fix for this drift class — this unit is the
interim manual repair AND the feedstock audit for that generator. If DM-CONTRACT-ARTIFACT has
already landed when this unit executes, SKIP the table additions (verify the generator emitted
them instead) and execute only items 2–3 below.

**Verified:** docs/EVENT-CONTRACT.md documents 64 of the 87 `case "…"` event kinds
src/world/dm.js's applyEvent implements. All 23 below grep-confirmed absent (backtick-quoted,
2026-07-06):

- social family (5): `social_check`, `attitude_shift`, `morale_check`, `parley_open`, `insight_read`
- companions (5): `hire`, `dismiss`, `tend_pet`, `companion_update`, `recruit_creature`
- codex (3): `codex_link`, `codex_reveal`, `codex_contact`
- urban/jobs (5): `district_mint`, `building_approach`, `building_contact`, `job_board_read`, `job_accept`
- singles (5): `claim_deed`, `prep_applied`, `prep_contact`, `walk_update`, `xp_granted`

### Changes
1. **Add one table row per missing kind** in the matching section of EVENT-CONTRACT.md (same
   4-column shape as the existing rows: kind | payload | who declares | behavior+source refs).
   Payload shapes come from `DM_EVENT_FIELDS` (dm.js:1237+) accept lists + the handler's own
   reads — READ each handler; never invent a field. `xp_granted` documents as an explicit NO-OP
   (DM-CHARTER §8.3b — script owns the number).
2. **Alias scoping fix (EVENT-CONTRACT.md:129-131):** the "Payload aliases" prose lists
   `to→target` among the general examples, but `to→target` is defined ONLY on `gift`
   (dm.js:1291) — a plausible origin of the BUG-17 drift. Reword the example list to scope each
   alias to its event (`text→what` (epithet_grant), `to→target` (gift ONLY), `id/faction→clockId`
   (clock family)).
3. **Live seat prompt correction:** dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md:81
   states "THERE IS NO `note` FIELD — a bare note string is dropped" — FALSE since BUG-06c:
   `codexUpdate` appends `patch.note` into `r.dm.notes[]` (src/world/codex.js:153-156). Rewrite
   the bolded sentence to: `note` is accepted as a DM-only append (`dm.notes[]`, never
   player-visible); prefer structured `dm:{}` keys for facts you'll query later.

### Edge cases / rulings
- Do NOT add the 23 kinds to `DM_EVENT_FIELDS` accept lists (code change, different unit — the
  whole-payload-pass handlers are intentionally unjudged, dm.js:1233-1236).
- Any handler found mid-audit whose behavior contradicts an EXISTING doc row: note it in the
  commit message for the DM-CONTRACT-ARTIFACT generator; do not silently rewrite semantics.

### Don't touch
dm.js (zero code), any other playtest-save file, DM-BRIDGE.md, SEAT-PROMPT drafting.

### Acceptance (doc unit — audit commands + numbers)
- `for k in social_check attitude_shift morale_check parley_open insight_read hire dismiss tend_pet companion_update recruit_creature codex_link codex_reveal codex_contact district_mint building_approach building_contact job_board_read job_accept claim_deed prep_applied prep_contact walk_update xp_granted; do grep -c "\`$k\`" docs/EVENT-CONTRACT.md; done`
  → **23 lines, every one ≥ 1** (pre-fix: all 0).
- `grep -c "THERE IS NO" dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md` → **0**.
- No verify harness gates docs; `check-manifest.py` exit 0 (nothing should have touched modules).

---

## H9 — check-manifest.py blind spots

**Verified against build/check-manifest.py:** (a) orphan .js only WARNs (:53-55 append to
`warns`; exit :123 is `1 if errors else 0`) while CLAUDE.md claims it "fails on orphans";
(b) loadOrder SEQUENCE is never compared to actual tag order (:73-84 check membership only);
(c) ES-module tag order unchecked (ref-bestiary's "must load after theater-boot" is
comment-enforced only); (d) the tag regexes (:71-72) are attribute-order-sensitive
(`<script type="module" src=` matches only that exact order); (e) `defs_in` counts declarations
inside comments/strings (`_DEF_RE` scans raw text).

### Changes (all in build/check-manifest.py)
1. **(a)** move unregistered-file appends from `warns` to `errors` (:53-55). Exemption set:
   keep a small `KNOWN_UNREGISTERED = set()` beside the existing `known={"tables.js"}` idiom for
   future intentional orphans (empty today — if the run then fails on a REAL current orphan,
   registering that file in manifest.json is in-scope for this unit).
2. **(b)** after the membership loops, compare sequences: filter `classic_tags` to entries present
   in `lo`, then `if [t for t in classic_tags if t in set(lo)] != lo: errors.append("loadOrder
   SEQUENCE differs from <script> tag order: manifest says …, html says …")` (print both lists).
3. **(c)** support an optional per-module `"mustFollow": ["<path>", …]` key on `type:"module"`
   manifest entries: for each, both paths' tag positions in the raw html (`html.find` on the
   src=) must satisfy follower > followee, else error. Then ADD
   `"mustFollow": ["src/ui/theater-boot.js"]` to the `ui.ref-bestiary` manifest entry (mechanizes
   the comment).
4. **(d)** replace the two regexes (:71-72) with attribute-order-tolerant forms:
   `re.findall(r'<script\b[^>]*\bsrc="([^"]+\.js)"[^>]*>', html)` for ALL tags, and classify
   module vs classic by `re.search(r'type="module"', tag)` on the full tag text (use
   `re.finditer` capturing the whole tag).
5. **(e)** strip comments before def-scanning: in `_text`'s consumer `_defset`, scan
   `re.sub(r'/\*[\s\S]*?\*/|(^|[^:])//.*', r'\1', text)` instead of raw text (string-literal
   false positives accepted + noted in a comment — a full JS lexer is out of scope).

### Edge cases (ruled)
- (b) module-type tags are EXCLUDED from the sequence compare (they're not in loadOrder by design).
- (e) the `//`-strip must not eat protocol strings (`http://…`) — the `(^|[^:])` guard above; add
  a self-test comment noting it.
- The script must still pass on the CURRENT tree after each sub-fix (run it between steps; if (a)
  or (b) exposes a real pre-existing violation, FIX the manifest/html accordingly within this unit
  and note it in the commit).

### Don't touch
manifest.json beyond `ui.ref-bestiary.mustFollow` + any real orphan registration (a) forces;
genesis.html unless (b) exposes a real ordering drift (then fix loadOrder to match reality, not
the html).

### Regression checks (RED-FIRST, self-contained — no harness file exists for this tool)
Demonstrate each in a scratch copy (scratchpad dir), commands + expected in the commit message:
1. Create `src/world/__orphan_probe.js` → run → **exit 1** with an "unregistered file" ERROR
   (pre-fix: exit 0, warn only). Delete probe.
2. Swap two adjacent loadOrder entries in a scratch manifest → **exit 1** sequence error.
3. In a scratch genesis.html, move the ref-bestiary module tag ABOVE theater-boot's → **exit 1**.
4. Reorder attributes on one script tag (`<script src="…" defer type="module">` style) → still
   detected (no missing-tag false error).
5. Add `// function bogusOwnedSymbol` comment to a module that owns a real symbol; declare that
   symbol nowhere else → pre-fix `defs_in` would count a `const bogusOwnedSymbol` comment as a
   definition; post-fix a commented-out "definition" of an owned symbol in ANOTHER file no longer
   trips DRIFT. (Probe: comment `// const saveWorld = x` into src/world/dm.js in the scratch copy
   → pre-fix: DRIFT error; post-fix: clean.)

**Acceptance:** `python3 build/check-manifest.py` on the REAL tree → **exit 0, 0 errors** (warns
allowed only for the layer-direction check that is already warn-mode). All 5 probes behave as
listed.

---

## H10 — theater cache disposal asymmetries

**Verified:** `retire()` (src/ui/theater-boot.js:4020-4040) disposes the whole-object caches
(`disposeWholeObjectCaches`) + pixel-skin cache, but: `FLOOR_TEXTURE_CACHE`
(theater-boot.js:702-721, CanvasTextures) is never evicted/disposed; `BASE_DISC_MAT_CACHE`
(:2370-2378) and `GROUNDING_BLOB_GEO_CACHE` (:2395-2399) same gap (small key spaces — still leak
across mount/retire cycles since module-scope maps outlive S). `S.textures` (TextureLoader
results, :3030-3040) is dropped by `S = createTheaterState()` without `.dispose()` — inert today
(nothing calls `setTextures` yet; grep confirms genesis.html:1351 only documents it) but wrong the
day textures-psx ships. The retire call site in the game is src/world/render.js:276-279.

### Changes (src/ui/theater-boot.js only)
1. Add a dispose helper next to each cache (or one combined `disposeAuxCaches()` placed beside
   `disposeWholeObjectCaches`, matching its D7 comment style):
```js
function disposeAuxCaches(){
  FLOOR_TEXTURE_CACHE.forEach(tex => { if(tex && tex.dispose) tex.dispose(); });
  FLOOR_TEXTURE_CACHE.clear();
  Object.keys(BASE_DISC_MAT_CACHE).forEach(k => { BASE_DISC_MAT_CACHE[k].dispose(); delete BASE_DISC_MAT_CACHE[k]; });
  Object.keys(GROUNDING_BLOB_GEO_CACHE).forEach(k => { GROUNDING_BLOB_GEO_CACHE[k].dispose(); delete GROUNDING_BLOB_GEO_CACHE[k]; });
}
```
   (FLOOR_TEXTURE_CACHE stores `null` on build failure — the `tex &&` guard covers it.)
2. In `retire()`, call `disposeAuxCaches();` on the line after `disposeWholeObjectCaches();`
   (:4033), and above the renderer dispose add:
```js
  if(S.textures){ Object.keys(S.textures).forEach(k => { const t = S.textures[k]; if(t && t !== "pending" && t.dispose) t.dispose(); }); }
```
   ("pending" sentinel per :3035 — never call dispose on it.)

### Edge cases (ruled)
- Mid-life eviction is NOT being added (key spaces are small; retire-time disposal is the whole
  fix — matches the review's read).
- Materials in BASE_DISC_MAT_CACHE may still be referenced by meshes in groups cleared EARLIER in
  retire() (clearGroup runs first at :4026-4030) — order above preserves that; do not move the
  call before the clearGroups.
- A texture whose loader callback lands AFTER retire (`S.textures[key] = nearestify(tex)` writes
  into the OLD S object): pre-existing benign race — out of scope, note only.

### Don't touch
`disposeWholeObjectCaches`/`disposePixelSkinCache` internals, `wholeObjectMaterialsFor`,
`setTextures`, render.js.

### Regression checks (add to dev/verify-theater-verbs.mjs, or verify-theater-data.mjs if the
mount harness lives there — whichever already mounts a real Theater; baseline theater-verbs **84/0**)
1. **RED probe:** mount → force a floor texture build (call `buildFloorCanvasTexture("stone",
   "#334455", 1)` via the module handle the harness already reaches) → retire() → assert
   `FLOOR_TEXTURE_CACHE.size === 0` and the captured texture's `dispose` was called (wrap/spy or
   check `tex.image`-released proxy the shim exposes; a call-count spy on `tex.dispose` is
   simplest). *Red pre-fix: size ≥ 1, dispose never called.*
2. Same-shape asserts for one BASE_DISC material and one GROUNDING blob geometry.
3. Remount after retire still renders (cache rebuild works — the existing mount checks re-run
   green after a retire+mount cycle).

**Acceptance:** `node dev/verify-theater-verbs.mjs` → **baseline+H2's checks + 3 more, 0 failed**
(if H2 landed first: **≥93/0**), exit 0. `check-manifest.py` exit 0.

---

## PLAUSIBLE — needs a confirming probe BEFORE any fix is specced (do not build from this section)

**P1 — turn.js merge-outcome derefs `rival.clock` unguarded.** src/world/turn.js `case "merge"`
(:268-272): `rivals.reduce((a,b)=>((a.clock.filled/a.clock.size)<=(b.clock.filled/b.clock.size)?a:b))`
— siblings guard `f.clock && …` (:48, :53); a legacy clock-less faction would TypeError the whole
`worldTurn`. Also `case "advance"` :242 `f.clock.filled=f.clock.size;` is a dead write
(immediately overwritten by `f.clock={size:6,filled:0}` at :245) — cosmetic.
**Confirming probe (spec'd):** in dev/verify-world-turn.mjs (baseline **45/0**), seed
`w.factions` with one clock-less faction (`{name:"Old House", tags:[]}` — no `clock` key) + one
full-clock faction, force `outcome:"merge"` (stub the roll), run `turnFactionOutcome` → CONFIRMED
if it throws TypeError. If confirmed: fix = filter `rivals` to `x.clock` holders (mirroring :48)
+ delete the :242 dead write; acceptance verify-world-turn **47/0** with the probe kept as the
regression check. If it does NOT throw (e.g. factions always mint clocks at every creation path),
record the probe green and close as NOT-A-BUG.

**P2 — cmApplyTraits additive actions are never mechanically usable (may be WAI).**
src/engine/combat.js:196-198 PASS 2 pushes additive trait actions as `kind:"other"` without
`cmParseActionText`; monster-tactics.js (review cite :231 — re-verify) selects melee/ranged only,
so an authored ADDITIVE attack never fires mechanically. **Needs Adam's ruling first** — additive
entries may be intentionally narrative-only. **Confirming probe:** feed a traits entry whose text
carries clean attack mechanics ("+5 to hit, 1d8 slashing") through cmApplyTraits, then ask
monster-tactics for an action pick → if the additive attack is never selectable AND Adam rules
additive-should-fight, fix = run `cmParseActionText` in PASS 2 (kind from the parse, cap logic
unchanged). Present probe result + the one-line question in the next ledger batch; do NOT fix
ahead of the ruling.

**P3 (cosmetic pair, fold into any nearby unit or a `chore/` sweep):**
- src/ui/dice.js:112 — stage2 plate renders `spec.resultLine+"  ·  "+spec.stage2.resultLine`
  unguarded → literal "undefined · …" when `spec.resultLine` is falsy (the :106 stage-1 call IS
  guarded). Fix shape: `(spec.resultLine ? spec.resultLine+"  ·  " : "") + spec.stage2.resultLine`.
- build/gen-spells-slim.py:61 emits a header claiming "defines window.SPELLS_SLIM" but :63 emits a
  top-level `const SPELLS_SLIM` (not a window property in classic scripts). Fix the HEADER STRING
  in the generator, then `python3 build/gen-spells-slim.py` to regenerate data/spells-slim.js
  (never hand-edit the artifact).

---

## Registry updates (one-line edits Fable applies to shared docs when this spec locks)

- **docs/HANDOFF.md** ("what's next" region): add — `HOTFIX-QUEUE-2026-07-06.md SPEC-LOCKED (10
  units, review findings from the 07-01→06 wave diff); build deferred to post-Fable
  Opus-orchestrated Sonnet executors; H7 must precede DM-SEAT unit 4.`
- **docs/NEXT-STEPS.md** ("Do next" list): add — `Execute docs/HOTFIX-QUEUE-2026-07-06.md H1→H10
  (genesis-orchestrate; independent units, priority order; H1/H2 first — live-data-loss +
  visual-corruption class).`
- **docs/PLAYTEST-BUGS.md** (running regression list): add — `2026-07-06 deep review: destroyed
  worlds resurrect from IDB (H1) · obliterate/flee corrupt shared whole-object materials (H2) ·
  string payloads zero out hp_changed/attack/charge_restore (H3) · GS.combat/GS.chase bleed across
  world switch (H4) — all specced in docs/HOTFIX-QUEUE-2026-07-06.md; harness label-only asserts
  hardened by H6 (BUG-01 class).`
- **docs/EVENT-CONTRACT.md**: no edit now — H8 owns it; DM-CONTRACT-ARTIFACT.md supersedes as the
  permanent generator.
