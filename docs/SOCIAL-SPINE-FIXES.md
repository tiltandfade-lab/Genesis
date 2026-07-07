---
type: system-spec
status: SPEC-LOCKED 2026-07-06 — build DEFERRED (freeze; executes post-Fable via Opus-orchestrated Sonnet executors)
consumer: Opus orchestrator + Sonnet executors; Adam skims anything marked PROVISIONAL
project: Genesis
units: S1 (BUG-17 attitude_shift contract repair) · S2 (BUG-18 social_check fiction-DC) · S3 (caster discoverability) · S5 (BUG-03 digest current HP)
queue: S1 → S2 serialized (same resolver case block) · S3 ∥ S5 parallel · independent of S4 (clock hotfix, separate spec if ruled)
---

# SOCIAL-SPINE-FIXES — the BUG-17/18 contract-repair cluster + caster discoverability + digest HP

Finalized from `docs/FABLE-WINDOW-2026-07-06.md` §Spec per Adam's 2026-07-06 rulings: freeze
lifted **for this cluster only** (contract FIXES to filed bugs, not new subsystems — DIRECTION §8's
"attitude/parley waits" refers to the new subsystem, not repairing the existing spine). CAL-1 seat
language blessed and included verbatim (§S1.6). Every code ref below re-verified against the tree
2026-07-06.

**Filed bugs this closes:** `docs/PLAYTEST-BUGS.md` BUG-17 (+ its `concentration_broken` minor +
its digest-visibility note), BUG-18, BUG-03, and the "caster discoverability" gap (the ✔-NOT-a-bug
entry: enforcement proven built, discoverability missing).

## §0 — Doctrine gates (all four units)

- **Inference cost: ZERO new model calls.** All changes are deterministic engine/digest/prompt-text
  work. Digest byte delta: ≤ 600 B/turn worst-case L10 full caster (S3, measured — §S3.5), ~25 B
  (S5 hp object), 0 B for martial PCs (sparse keys). Seat prompt (static system text, sent once per
  session bootstrap) grows ~900 B. No mechanical loop gains a model call (SPEED-DOCTRINE).
- **Blind-playable parity: no new visual surface.** Every changed surface is machine-facing (digest
  JSON, event contract, seat-prompt text) or already-prose (ledger `✦` lines, which ARE the prose
  twin and are unchanged in shape). No panel, no prose-twin obligation triggered. If an executor
  finds itself editing `src/world/render.js` or any UI file, it has left the spec — stop.
- **DM-agency invariants (must survive byte-for-byte):** never roll the player's dice; no coaching
  (`docs/DM-CHARTER.md` line 67 — "no 'you could cast X'" — is READ-ONLY for this whole spec);
  DM exerts will only through NPCs; engine owns nouns/numbers, DM owns verbs.
- **Margin grading stays TIGHT:** near-miss band is −1..−2 only; `resolveSocialCheck`'s §2.4 cost
  ladder (caught lie −2 · miss by 5+ −1 · flat miss 0) is untouched by every unit here.

### Don't-touch list (hard)

| Never edit | Why |
|---|---|
| `tables.json`, `tables.js`, `data/bestiary.js`, `data/realm-bestiary.js`, `data/class-progression.js`, `data/wiki.js`, `data/spells.js`, `data/items.js` | generated — spec generator edits only; none needed here |
| `src/engine/social.js` | the pure resolver stays **byte-identical** (S2 threads the DC in `dm.js`, not here — §S2.2) |
| `docs/DM-CHARTER.md` | line 67 no-coaching is load-bearing context for S3; read-only |
| `docs/DM-BRIDGE.md` | never touched mid-window (live-session doc); no edit needed |
| `DM-SEAT-PROMPT.md` line 82 (`condition_add {cond}`) | that is BUG-16's unit, not this cluster — leave the known-wrong line alone |
| `src/world/render.js`, any `src/ui/*` | no UI surface in scope |
| `dev/verify-social.mjs` | resolver untouched ⇒ its 97 assertions must stay exactly green with zero edits |

### Files this spec MAY touch (complete list — anything else is out of scope)

`src/world/dm.js` · `src/world/codex.js` · `src/engine/resources.js` · `manifest.json` (owns lists
only) · `dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md` (the production seat prompt —
the only live copy; `docs/SEAT-PROMPT.md` does not exist yet, it is the future frontier
distillation per `docs/DM-SEAT.md:69` — do NOT create it here) · `dev/playtest-bug-probes.mjs` ·
`dev/verify-digest-diet.mjs` · `docs/PLAYTEST-BUGS.md` (status lines only, at land time).

### Verified baselines (2026-07-06, pre-fix — the RED side of every gate)

```
node dev/playtest-bug-probes.mjs   → "5/16 caught bugs still reproduce."
                                     (● PRESENT: BUG-02, BUG-03, BUG-04, BUG-05, BUG-07)
node dev/verify-digest-diet.mjs    → "✅ PASS — 33 assertions passed, 0 failed"
node dev/verify-dm-events.mjs      → "36 passed, 0 failed"
node dev/verify-dm-seam.mjs        → "38 passed, 0 failed"
node dev/verify-social.mjs         → "SOCIAL Phase 1+2+3+4: 97 passed, 0 failed"
python3 build/check-manifest.py    → "RESULT: OK" (2 pre-existing layer WARNs are fine)
```

---

## §S1 — BUG-17: `attitude_shift` contract repair (field drift + value-type drift) + `concentration_broken {spell}` fold + CAL-1 seat line

### S1.1 The faults (code-verified)

1. **Field drift.** `DM-SEAT-PROMPT.md:90` documents `{id, to}`; the accept list
   `src/world/dm.js:1280` is `attitude_shift: { accept:["cause","target","to"] }` (no `id`, no
   alias) and the handler (`dm.js:2573-2582`) reads `p.target` → a verbatim-per-prompt event
   payload-drifts `id` away and no-ops with `{ok:false, reason:"no-target:?"}`.
2. **Value-type drift.** The prompt says `to:"friendly|neutral|hostile"` (strings); the handler
   passes `p.to` raw to `codexSetAttitude` (`src/world/codex.js:223-233`) whose
   `attitudeClampInt` (`codex.js:195`) does `Math.round(Number(n)||0)` — `Number("hostile")||0
   → 0`, so even a correctly-fielded string lands "Indifferent," silently.
3. **Minor, same class:** `concentration_broken` accept list (`dm.js:1253`) is `{accept:["cause"]}`;
   a natural DM `{spell:"Hold Person"}` burns a drift-warn + a `recentLedger` slot. The handler
   (`dm.js:1938-1953`) breaks the *actual* active concentration regardless — `spell` is advisory.

### S1.2 Change 1 — `attitudeParse` in `src/world/codex.js` (new symbol, beside the ladder)

Insert directly after `attitudeLabel` (`codex.js:196`):

```js
/* SOCIAL-SPINE-FIXES §S1 — parse a DM-supplied attitude VALUE. Raw ints and numeric strings pass
   through (rounded; the caller's codexSetAttitude applies the per-NPC floor/ceiling clamps); label
   strings map via the ladder + the seat-prompt synonyms (case/whitespace-insensitive). Unknown →
   null — the caller refuses LOUD, never a silent 0 (the Number("hostile")||0 fault, BUG-17). */
const ATTITUDE_WORDS={ hostile:-2, unfriendly:-1, wary:-1, neutral:0, indifferent:0, friendly:1, helpful:2 };
function attitudeParse(v){
  if(typeof v==="number" && isFinite(v)) return Math.round(v);
  if(typeof v==="string"){
    const s=v.trim().toLowerCase();
    if(s!=="" && isFinite(Number(s))) return Math.round(Number(s));
    if(ATTITUDE_WORDS[s]!=null) return ATTITUDE_WORDS[s];
  }
  return null;
}
```

The word map deliberately covers BOTH vocabularies: the seat prompt's
(`hostile/unfriendly/neutral/friendly/helpful`, Adam's locked mapping −2/−1/0/1/2) AND the engine's
own ladder labels (`ATTITUDE_STATES`, `codex.js:194`: Hostile/Wary/Indifferent/Friendly/Helpful) —
a DM echoing the engine's ledger vocabulary back must also land.

**`manifest.json`:** append `"ATTITUDE_WORDS"` and `"attitudeParse"` to the `world.codex` module's
`owns` array (the entry whose `path` is `src/world/codex.js`; its owns list currently has 40
entries incl. `attitudeClampInt`/`attitudeLabel` at manifest.json:798-799). Then
`python3 build/check-manifest.py` → `RESULT: OK`.

### S1.3 Change 2 — accept-list + handler in `src/world/dm.js`

**Site A — accept list, `dm.js:1280` (before → after):**

```js
// BEFORE
  attitude_shift:    { accept:["cause","target","to"] },
// AFTER  (Root-B alias-fold pattern — same mechanism as clock_advanced's id→clockId at dm.js:1285)
  attitude_shift:    { accept:["cause","target","to"], alias:{ id:"target", npc:"target" } },
```

(`npc:"target"` rides along for free — same fold, closes the third obvious natural-language key.
`dmFoldPayload` (`dm.js:1325-1343`) already implements canonical-wins-when-both-present; no
handler-side dual-read needed.)

**Site B — handler, `dm.js:2573-2582` (before → after; only the marked lines change):**

```js
// BEFORE (dm.js:2576-2577)
      if(p.to==null) return {ok:false,reason:"no-target-attitude"};   // a shift with no destination is malformed — don't echo a no-op canon line
      const r=codexSetAttitude(w,p.target,p.to,p.cause||"shift",clockOf(w).day);

// AFTER
      if(p.to==null) return {ok:false,reason:"no-target-attitude"};   // a shift with no destination is malformed — don't echo a no-op canon line
      const toInt=(typeof attitudeParse==="function")?attitudeParse(p.to):p.to;   // §S1: strings→ints; raw ints pass
      if(toInt==null) return {ok:false,reason:"bad-attitude:"+p.to};              // unknown word refuses LOUD, never silent-0
      const r=codexSetAttitude(w,p.target,toInt,p.cause||"shift",clockOf(w).day);
```

Everything else in the case (the `codexGetAttitude` guard, ledger line, return shape) is unchanged.
Per-NPC `floor`/`ceiling` clamps are respected automatically — `codexSetAttitude` clamps at
`codex.js:226-228`; do NOT re-clamp in the handler.

**Site C — `concentration_broken` accept list, `dm.js:1253` (before → after):**

```js
// BEFORE
  concentration_broken:{ accept:["cause"] },
// AFTER  — `spell` is ACCEPTED-ADVISORY: the handler keeps reading only p.cause (breakConcentration
// breaks whatever is actually held, dm.js:1941); accepting the key just stops the false drift-warn.
  concentration_broken:{ accept:["cause","spell"] },
```

No handler change for Site C.

### S1.4 Change 3 — seat-prompt alignment, `dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md`

Replace **line 90** exactly:

```md
<!-- BEFORE -->
- `attitude_shift` `{payload:{id:"npcId", to:"friendly|neutral|hostile"}}`.
<!-- AFTER -->
- `attitude_shift` `{payload:{target:"npc:<codex-id>", to:"hostile|unfriendly|neutral|friendly|helpful", cause:"why"}}` — absolute set; words map onto the −2…+2 ladder (raw ints also accepted; `id` accepted as an alias for `target`). Per-NPC floor/ceiling clamps still apply — the ledger line shows where it actually landed.
```

### S1.5 (blessed, CAL-1) — seat-prompt guidance line

Append this as a new bullet at the END of the `## Danger & honesty` section (after the current
line 34 "…gentle forward pressure.", before the blank line preceding `## Degrees of failure` at
line 36). Exact text, Adam-blessed 2026-07-06:

```md
- **A failed save LANDS.** A failed save against a compulsion, charm, or harmful order LANDS — the
  save is the mercy, not the narration after it. Narrate the consequence — lethally when that is
  the order — and never re-litigate a failed save with a second, fictional out ("the body refuses"
  is a violation, not mercy).
```

### S1.6 Edge cases (ruled)

| Input | Ruling |
|---|---|
| `to:"HOSTILE "` (case/space) | trim+lowercase → −2 |
| `to:"-2"` / `to:"1"` (numeric string) | parses to the int |
| `to:7` / `to:-9` | passes parse; `codexSetAttitude` clamps to per-NPC ceiling/floor (which are themselves clamped to ±2) |
| `to:"ally"` (unknown word) | `{ok:false, reason:"bad-attitude:ally"}` — loud refusal, NO attitude write, NO canon ledger line |
| both `id` and `target` present | canonical `target` wins, `id` consumed silently (dmFoldPayload contract, verified at dm.js:1332) |
| target has `ceiling:-1`, `to:"helpful"` | writes −1 (clamp), ledger shows the clamped landing |
| `to:"wary"` / `to:"indifferent"` (engine's own labels) | −1 / 0 — both vocabularies accepted (§S1.2) |
| target id unknown | unchanged: `{ok:false, reason:"no-target:<id>"}` |
| `terrified` flag | untouched — `attitude_shift` never reads/writes it (that's `social_check`/`codexSetTerrified` territory) |

### S1.7 RED-FIRST regression — new `BUG-17` probe in `dev/playtest-bug-probes.mjs`

Add one probe block (same `boot()`/`seedWorld()`/`applyMutates()` pattern as BUG-11/BUG-12),
inserted after the BUG-08 block and before the ROOT-B guard. **All three legs are
MUTATION asserts — the value must MOVE, not the label (the BUG-01 lesson):**

```js
// ---------------------------------------------------------------------------
// BUG-17 (HIGH) — attitude_shift doubly broken vs its own seat prompt: (a) prompt field
// `id` vs handler `target`; (b) string attitudes Number()-coerce to 0. Fixed: id→target
// alias + attitudeParse word map. Legs: verbatim-prompt payload MOVES the value; clamps
// hold; concentration_broken {spell} no longer burns a drift ledger line.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  // leg 1 — the exact per-prompt payload must MOVE status.attitude.value 0 → -2
  const rec = win.codexAdd(w, { kind: "npc", name: "Watch-Sergeant Brann" });
  const m = applyMutates(win, w,
    { type: "attitude_shift", source: "declared", payload: { id: rec.id, to: "hostile", cause: "dominated in public" } },
    () => (rec.status.attitude && rec.status.attitude.value) || 0);
  const moved = m.pass && rec.status.attitude && rec.status.attitude.value === -2;
  // leg 2 — per-NPC clamp respected: ceiling -1 NPC asked to "helpful" lands at -1, floor -1 holds "hostile" at -1
  const rec2 = win.codexAdd(w, { kind: "npc", name: "Sworn Enemy" });
  win.codexAttitudeOpen(w, rec2.id, -1, { floor: -1, ceiling: -1 });
  win.applyEvent(w, { type: "attitude_shift", source: "declared", payload: { target: rec2.id, to: "helpful" } });
  const clamped = rec2.status.attitude.value === -1;
  // leg 3 — concentration_broken {spell} is accepted-advisory: no payload-drift ledger line
  win.applyEvent(w, { type: "concentration_start", source: "declared", payload: { spell: "Hold Person" } });
  const cb = win.applyEvent(w, { type: "concentration_broken", source: "declared", payload: { spell: "Hold Person", cause: "damage" } });
  const spellDrift = win.ledgerOf(w).some(e => e.type === "drift" && e.data && e.data.type === "concentration_broken" && (e.data.keys || []).indexOf("spell") >= 0);
  probe("BUG-17", "attitude_shift dead to its own seat prompt (id vs target; string→Number→0); concentration_broken {spell} drifts",
    !moved || !clamped || !(cb && cb.broken) || spellDrift,
    `verbatim {id,to:"hostile"} -> ${JSON.stringify(m.res)} value=${rec.status.attitude && rec.status.attitude.value}; clamp=${rec2.status.attitude.value}; conc=${JSON.stringify(cb)} spellDrift=${spellDrift}`);
}
```

**RED proof (run BEFORE any S1 code change):** probe prints `● PRESENT` and the totals line reads
`6/17 caught bugs still reproduce.` — leg 1 no-ops (`{"ok":false,"reason":"no-target:?"}`, value
stays 0) and leg 3 shows `spellDrift=true`.
**GREEN proof (after S1):** `○ resolved`, value line shows `-2`, `clamp=-1`, `spellDrift=false`.

### S1.8 Acceptance (S1 alone)

```
node dev/playtest-bug-probes.mjs   → BUG-17 line "○ resolved"; totals "5/17 caught bugs still reproduce."
node dev/verify-social.mjs         → "SOCIAL Phase 1+2+3+4: 97 passed, 0 failed"   (file unedited)
node dev/verify-dm-events.mjs      → "36 passed, 0 failed"
node dev/verify-dm-seam.mjs        → "38 passed, 0 failed"
python3 build/check-manifest.py    → "RESULT: OK"
grep -c 'alias:{ id:"target"' src/world/dm.js          → 1
grep -c 'A failed save LANDS' dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md → 1
```

---

## §S2 — BUG-18: `social_check` fiction-DC threading (serialize AFTER S1 — same `case` region of dm.js)

### S2.1 The fault (code-verified)

The resolver call at `dm.js:2507` is `applyLeverage(socialDC(a.value), levers)` — the roll total is
graded against the ENGINE's internal attitude ladder (`src/engine/social.js:15`:
`{-2:25, -1:20, 0:15, 1:10, 2:null}`), decoupled from the DC the DM narrated. A Friendly NPC is
always DC 10 regardless of the fiction (Run 4 T6: narrated near-miss 18 vs DC 20 → engine graded
18 vs 10 → promoted Friendly→Helpful "ask granted", contradicting the narrated die). The accept
list `dm.js:1279` has no `dc` field, so even a well-meaning DM cannot thread it (payload-drift).
Note `docs/SOCIAL.md:343` has documented `dc` in the `social_check` payload all along — this unit
makes the code honor its own spec.

### S2.2 The fix — optional `dc` threading in `src/world/dm.js` ONLY (`src/engine/social.js` byte-identical)

**Site A — accept list, `dm.js:1279` (before → after):**

```js
// BEFORE
  social_check:      { accept:["caughtLie","cause","lever","levers","natural","overshoot","skill","target","total"] },
// AFTER
  social_check:      { accept:["caughtLie","cause","dc","lever","levers","natural","overshoot","skill","target","total"] },
```

**Site B — the resolver call, `dm.js:2507` (before → after):**

```js
// BEFORE
      const lev=applyLeverage(socialDC(a.value), levers);
// AFTER — §S2 FICTION-DC THREADING (BUG-18): when the DM supplies the DC it narrated, that DC is
// FINAL for grading — no leverage re-pricing on top (the narrated DC already priced the scene;
// re-discounting is how 18-vs-20 promoted a sergeant, Run 4 T6). Declared/derived DECISIVE levers
// still auto-shift (the lever IS the answer — independent of any DC, social.js §2.1). Terminal
// attitude (+2 → socialDC null) still wins over everything. Absent/garbled dc → the internal
// ladder exactly as before.
      const baseDC=socialDC(a.value);
      const fdc=(p.dc!=null && isFinite(Number(p.dc)))
        ? Math.max(SOCIAL_DC_FLOOR, Math.min(SOCIAL_DC_CEIL, Math.round(Number(p.dc)))) : null;
      const lev=(fdc!=null && baseDC!=null)
        ? { dc:fdc, autoShift:levers.some(l=>l&&typeof l==="object"&&!!l.decisive), mod:0, dcSource:"dm" }
        : applyLeverage(baseDC, levers);
```

**Site C — ledger provenance (the `addLedger` data object at `dm.js:2549-2553`):** inside the
`Object.assign({...}, …)` payload, extend the existing sparse-key tail with the DC's provenance —
after the `leversDerivedKeys.length?{leversDerived:leversDerivedKeys}:null` argument, add one more
Object.assign argument: `lev.dcSource?{dcSource:lev.dcSource}:null`. (Sparse-key convention: absent
on the engine-DC path, `"dm"` on the fiction path — playtest ledgers can now tell which DC graded a
shift.) The return object at `dm.js:2571` is unchanged (it already carries `dc:lev.dc`).

Everything downstream — `resolveSocialCheck` margins (near-miss TIGHT), the creature grind-ceiling
(ANOMALY LAW §2b.1, dm.js:2529-2534), terrified, bondEligible stamps, reputation pricing — is
**unchanged and must stay byte-identical.** The U4 creature-lever auto-merge (dm.js:2501-2506)
also stays as-is: on the fiction-DC path the merged levers no longer price the DC, but they still
feed the `autoShift` scan and the `leversDerived` ledger visibility.

### S2.3 Seat-prompt rule — document `social_check`, forbid the narrated-miss emit

The production seat prompt never documents `social_check` (verified — only `attitude_shift`
appears). Insert these two bullets immediately BEFORE the `attitude_shift` bullet (currently
line 90, becomes adjacent after S1's rewrite):

```md
- `social_check` `{payload:{target:"npc:<codex-id>", skill:"persuasion|deception|intimidation", total:<the PC's OPEN roll total>, dc:<the SAME dc you set in the rollRequest>, lever:"want|fear|leverage|trustLever"}}` — emit ONLY after the player's open social roll has resolved, and ALWAYS carry the same `dc` you narrated; the engine grades total-vs-dc by tight margin and commits the attitude shift itself.
- **Never emit `social_check` on a beat you narrated as a refusal/miss** — and never emit `attitude_shift` alongside a `social_check` for the same beat (the check already commits the shift; doubling it double-moves).
```

### S2.4 Edge cases (ruled)

| Input | Ruling |
|---|---|
| `dc` absent | exact current behavior: `applyLeverage(socialDC(...), levers)` — internal ladder + lever pricing (back-compat is a probe leg) |
| `dc:"hard"` / `dc:NaN` | non-finite → treated as absent (fallback path); no refusal, no drift (key is accepted) |
| `dc:2` / `dc:99` | clamped to the standard ladder bounds 5..30 (`SOCIAL_DC_FLOOR`/`SOCIAL_DC_CEIL`, social.js:16-17) |
| `dc:20` + a decisive lever `{type:"want",decisive:true}` | autoShift wins — no roll grading (the lever IS the answer; DC-independent) |
| `dc:20` on a Helpful (+2) target | terminal wins — `baseDC==null` → the existing already-max path; the fiction DC is irrelevant with no rung to climb |
| `dc:20` + non-decisive levers | levers do NOT re-price the DM's DC (`mod:0`) — they remain ledger-visible via `leversDerived` only |
| `dc` on a `kind:"creature"` target | grind ceiling (+1 cap without nat-20) applies after grading, unchanged |
| `total` absent | unchanged (`Number(input.total)||0` in the resolver) |

### S2.5 RED-FIRST regression — new `BUG-18` probe in `dev/playtest-bug-probes.mjs`

Insert directly after the BUG-17 probe block:

```js
// ---------------------------------------------------------------------------
// BUG-18 (MED) — social_check grades vs the ENGINE's internal socialDC, not the DM's
// narrated DC: 18 vs a narrated DC 20 promoted a Friendly NPC to Helpful. Fixed: optional
// payload.dc is FINAL for grading. Leg 2 guards back-compat: no dc → internal ladder still
// promotes (the value MOVES) exactly as today.
// ---------------------------------------------------------------------------
{
  const win = boot(); const w = seedWorld(win);
  // leg 1 — narrated near-miss must NOT promote: Friendly(+1), total 18, dc 20
  const rec = win.codexAdd(w, { kind: "npc", name: "Sergeant Ashvane" });
  win.codexAttitudeOpen(w, rec.id, 1);
  const r1 = win.applyEvent(w, { type: "social_check", source: "declared",
    payload: { target: rec.id, skill: "persuasion", total: 18, dc: 20 } });
  const held = rec.status.attitude.value === 1 && !!r1 && r1.granted === false;
  const noDrift = !win.ledgerOf(w).some(e => e.type === "drift" && e.data && e.data.type === "social_check");
  // leg 2 — back-compat MUTATION assert: same total, no dc → internal DC 10 → value MOVES 1→2
  const rec2 = win.codexAdd(w, { kind: "npc", name: "Warm Broker" });
  win.codexAttitudeOpen(w, rec2.id, 1);
  const m2 = applyMutates(win, w,
    { type: "social_check", source: "declared", payload: { target: rec2.id, skill: "persuasion", total: 18 } },
    () => rec2.status.attitude.value);
  const legacyMoves = m2.pass && rec2.status.attitude.value === 2;
  probe("BUG-18", "social_check re-grades the total vs the engine's internal DC, not the DM's narrated dc",
    !held || !noDrift || !legacyMoves,
    `dc:20 total:18 -> ${JSON.stringify(r1)} value=${rec.status.attitude.value} noDrift=${noDrift}; no-dc control -> ${JSON.stringify(m2.res)} value=${rec2.status.attitude.value}`);
}
```

**RED proof (before S2, after S1):** `● PRESENT` — leg 1 promotes (`value=2`, `granted:true`) and
`noDrift=false` (the `dc` key drifts); totals `6/18 caught bugs still reproduce.`
**GREEN proof (after S2):** `○ resolved` — leg 1 `value=1, granted:false, noDrift=true`; leg 2
control still moves 1→2. Totals `5/18` (with S3/S5 not yet landed) or per §Queue below.

### S2.6 Acceptance (S2, on top of S1)

```
node dev/playtest-bug-probes.mjs   → BUG-17 AND BUG-18 "○ resolved"; totals "5/18 caught bugs still reproduce."
node dev/verify-social.mjs         → "SOCIAL Phase 1+2+3+4: 97 passed, 0 failed"   (file byte-identical)
git diff --stat src/engine/social.js → empty (no output)
node dev/verify-dm-events.mjs      → "36 passed, 0 failed"
node dev/verify-dm-seam.mjs        → "38 passed, 0 failed"
grep -c '"dc"' src/world/dm.js     → note: use  grep -n 'accept:\["caughtLie","cause","dc"' src/world/dm.js  → exactly 1 hit
```

---

## §S3 — Caster discoverability (NOT a bug — enforcement proven built; the gap is visibility)

### S3.1 The gap (code-verified)

- The digest pc block (`dm.js:288-313`) ships `resources` via `resourceDigest`
  (`src/engine/resources.js:163-173`) — slot COUNTS (`slots:{1:"2/4",…}`, pact, pools) but never
  the known-spell lists; the sheet's `sh.cantrips` / `sh.spells` (+ `sh.featCantrips` /
  `sh.featSpells`, minted at `src/creator/sheet.js:39-40,53` and grown by
  `src/creator/levelup.js:306-312`) are never serialized. A memoryless DM cannot verify spell
  knowledge before adjudicating a cast.
- The seat prompt's event vocabulary documents neither `cast` nor `slot_spent` — so a
  prompt-faithful DM never emits `cast` and the (fully built, Run-3-verified) slot economy
  (`cast` handler `dm.js:1897-1924`; `slot_spent` `dm.js:1887-1895`; `spendSlot`
  `resources.js:114-120`) silently never fires.

### S3.2 Change 1 — `spellDigest` in `src/engine/resources.js` (new read-side view, beside `resourceDigest`)

Insert directly after `resourceDigest` (after `resources.js:173`):

```js
/* SOCIAL-SPINE-FIXES §S3 — known-spell NAME lists for dmDigest (caster discoverability). Names
   only, deduped across the creator's class lists and feat picks (bardo.js:157 concatenates the
   same way for the sheet display). SPARSE: null for martials / empty lists — the digest spreads
   {} and ships zero bytes. Mechanics (slots/DCs/spell text) deliberately excluded — the DM
   verifies KNOWLEDGE here and reads costs from resources.slots; it never needs the spell body. */
function spellDigest(sh){
  if(!sh) return null;
  const cat=(a,b)=>{ const out=[]; (a||[]).concat(b||[]).forEach(n=>{ if(n && out.indexOf(n)<0) out.push(n); }); return out; };
  const c=cat(sh.cantrips, sh.featCantrips), s=cat(sh.spells, sh.featSpells);
  const out={};
  if(c.length) out.cantrips=c;
  if(s.length) out.spells=s;
  return (out.cantrips||out.spells)?out:null;
}
```

**`manifest.json`:** append `"spellDigest"` to the `engine.resources` module's `owns` array
(path `src/engine/resources.js`, currently 12 entries). `check-manifest.py` → `RESULT: OK`.

### S3.3 Change 2 — the digest rider in `src/world/dm.js`

In the pc block, insert after the `toolsCharms` entry (`dm.js:312`), before the closing
`} : null,` (before → after of the block tail):

```js
// BEFORE (dm.js:310-313)
      // LOOSE-ENDS §1: tool/DC/charm digest wiring — null when the sheet holds none (the common case
      // today; no toolProfs/charms/blessings data source exists yet, see socialToolCharmDigest).
      toolsCharms:(sh&&typeof socialToolCharmDigest==="function")?socialToolCharmDigest(sh):null
    } : null,

// AFTER
      // LOOSE-ENDS §1: tool/DC/charm digest wiring — null when the sheet holds none (the common case
      // today; no toolProfs/charms/blessings data source exists yet, see socialToolCharmDigest).
      toolsCharms:(sh&&typeof socialToolCharmDigest==="function")?socialToolCharmDigest(sh):null,
      // SOCIAL-SPINE-FIXES §S3 — caster discoverability: known-spell NAME lists (cantrips/spells),
      // deduped w/ feat picks, sparse-key (martials ship NOTHING). Byte budget ≤600 B worst-case
      // L10 full caster, guarded in dev/verify-digest-diet.mjs. Names ride EVERY turn (like marks —
      // small, and the DM must verify knowledge before adjudicating any cast).
      ...((sh&&typeof spellDigest==="function")?(spellDigest(sh)||{}):{})
    } : null,
```

### S3.4 Change 3 — seat-prompt `cast`/`slot_spent` contract + slot-refusal semantics

Append these bullets to the `### Common event types` list in
`dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md`, immediately BEFORE the closing
"Do NOT emit `xp_granted`" bullet (currently line 91). Exact text:

```md
- `cast` `{payload:{spell:"Sleep", level:1}}` — REQUIRED whenever the PC declares a cast. Omit `level` for a cantrip (free). Add `ritual:true` for a ritual casting (engine adds 10 minutes and spends NO slot). The engine spends the slot for a leveled cast — do NOT also emit `slot_spent` for the same cast (that double-spends). Concentration is tracked automatically.
- `slot_spent` `{payload:{level:2}}` — ONLY for a slot burned with no spell resolved (a ruled trade/sacrifice); a normal cast never needs it.
- **Slot refusal is the digest's call, not yours:** `pc.resources.slots` is the truth. A level showing `0/N` cannot pay a cast of that level — narrate the refusal in the fiction (the reach for nothing); never hand-wave a free cast, and never invent remaining slots. `pc.cantrips`/`pc.spells` are the PC's KNOWN spells — a spell not on those lists cannot be cast at all.
- **These events RECORD the player's declared casts — they never license suggesting one.** The no-coaching rule stands: never propose a spell, ever ("you could cast X" is forbidden). Answer "what spells do I have" plainly from `pc.cantrips`/`pc.spells` if asked — that's information, not steering.
```

(`DM-CHARTER.md` line 67 is untouched — the last bullet restates it inside the prompt; recording ≠
coaching.)

### S3.5 Byte budget (measured, locked)

Worst-case L10 full caster ≈ 4 cantrips + 14 known spells ≈ 18 quoted names + 2 keys ≈ **~480 B**;
budget locked at **≤ 600 B** added to the serialized pc block. Martial: **0 B** (sparse keys —
`spellDigest` returns null, the spread ships nothing). Guarded by assertion, not prose (§S3.6).
The digest-diet 12 KB ceiling assertion (verify-digest-diet.mjs:241) must stay green untouched.

### S3.6 RED-FIRST regression — 3 new assertions in `dev/verify-digest-diet.mjs`

Append a new block before the file's summary print, using the file's own `freshWorld()` /
`U_stub_activeWorld()` / `A.*` / `ok()` helpers (same pattern as the §7.5 size-guard block at
verify-digest-diet.mjs:210-243):

```js
/* ===================== §S3 — caster discoverability (SOCIAL-SPINE-FIXES) ===================== */
{
  const w = freshWorld(); U_stub_activeWorld(w);
  const sh = w.characters[w.characters.length-1].sheet;
  // martial baseline — sparse keys AND the byte floor for the delta measurement
  delete sh.cantrips; delete sh.spells; delete sh.featCantrips; delete sh.featSpells;
  let d = A.dmDigest();
  const martialBytes = Buffer.byteLength(JSON.stringify(d.pc), "utf8");
  ok(d.pc.cantrips===undefined && d.pc.spells===undefined,
    "martial PC ships NO cantrips/spells keys (sparse-key — zero overhead)");
  // worst-case L10 full caster (4 cantrips + 14 spells; feat pick duplicates one cantrip → dedupe)
  sh.cantrips=["Vicious Mockery","Mage Hand","Minor Illusion","Prestidigitation"];
  sh.featCantrips=["Mage Hand"];
  sh.spells=["Charm Person","Healing Word","Sleep","Detect Magic","Invisibility","Suggestion",
    "Hypnotic Pattern","Fear","Dimension Door","Greater Invisibility","Dominate Person",
    "Hold Monster","Mass Suggestion","Otto's Irresistible Dance"];
  d = A.dmDigest();
  ok(Array.isArray(d.pc.cantrips) && d.pc.cantrips.length===4
     && Array.isArray(d.pc.spells) && d.pc.spells.length===14,
    "caster PC: cantrips+spells NAME lists ride digest.pc, deduped against feat picks (4+14)");
  const casterBytes = Buffer.byteLength(JSON.stringify(d.pc), "utf8");
  ok(casterBytes>martialBytes && (casterBytes-martialBytes)<=600,
    `spell-list rider costs >0 and <=600 B on a worst-case L10 full caster (measured ${casterBytes-martialBytes} B)`);
}
```

**RED proof (before S3 code):** assertions 2 and 3 fail (no lists ride; byte delta 0 fails the
`>martialBytes` half) while assertion 1 passes trivially → summary reads **`34 passed, 2 failed`**
(33 existing + the sparse-key assertion).
**GREEN proof (after S3):** `"✅ PASS — 36 assertions passed, 0 failed"`.

### S3.7 Edge cases (ruled)

| Case | Ruling |
|---|---|
| martial / empty lists | `spellDigest` → null → spread `{}` → NO keys (never `cantrips:[]`) |
| feat-pick duplicate name | deduped, first occurrence kept (order: class list then feat list) |
| level-up-grown spells (`levelup.js:310-312` pushes into `sh.spells`) | picked up automatically — same arrays |
| spell names with apostrophes ("Otto's…") | plain JSON strings; no escaping work needed |
| `sh` null (no living PC) | pc block is already null-guarded (`pc: cur ? {…} : null`) — spread never evaluated without `sh` |
| founding turn (setting/life riders present) | lists ride anyway — knowledge must be visible from turn 1 |
| ally/companion sheets | out of scope — pc block only (companions have no digest sheet today) |

### S3.8 Acceptance (S3)

```
node dev/verify-digest-diet.mjs    → "✅ PASS — 36 assertions passed, 0 failed"
node dev/playtest-bug-probes.mjs   → totals unchanged by S3 (no new probe id; BUG-17's visibility note is closed by the digest assertions above)
python3 build/check-manifest.py    → "RESULT: OK"
grep -c "spellDigest" src/engine/resources.js  → 2   (definition + comment)   · grep -c "spellDigest" src/world/dm.js → 2 (guard + call)
grep -c 'REQUIRED whenever the PC declares a cast' dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md → 1
```

---

## §S5 — BUG-03: digest current/max HP (tiny; parallel with S3)

### S5.1 The fault (code-verified)

`dm.js:291` ships `hp:sh?sh.hp:null` — the sheet's `sh.hp` is MAX HP; current is `sh.hpCur`
(`resources.js:104-110`). The DM narrates combat blind to wounds (Run 4: pc.hp read 43 while the
PC sat at 8). `resourceDigest` does ship `hp:{cur,max}` inside `pc.resources`
(resources.js:166) — but the headline `pc.hp` field contradicts it, and the headline is what a
memoryless DM reads. Ruling: the headline field becomes the truth-shaped object; the
`resources.hp` twin stays (both are computed from the same sheet at build time — no drift channel).

### S5.2 The fix — `dm.js:291` (before → after)

```js
// BEFORE
      level:(sh&&sh.level)||1, hp:sh?sh.hp:null, ac:sh?sh.ac:null, profBonus:sh?sh.profBonus:null,
// AFTER — §S5 (BUG-03): hp is {cur,max} (+temp only when held); hpCur==null (pre-ensureResources
// sheet) reads as full — same convention as applyHpDelta (resources.js:106).
      level:(sh&&sh.level)||1,
      hp:sh?Object.assign({cur:(sh.hpCur!=null?sh.hpCur:sh.hp), max:(sh.hp||0)},(sh.tempHp>0?{temp:sh.tempHp}:{})):null,
      ac:sh?sh.ac:null, profBonus:sh?sh.profBonus:null,
```

Consumers checked: the only reader of `dmDigest().pc.hp` outside the model payload is the BUG-03
probe (rewritten below). `src/world/render.js:1357` reads the **combat** digest's `cm.pc.hpCur`
(a different builder, `combatDigest` at dm.js:195) — untouched. `src/world/seat.js:118,343` just
`JSON.stringify(dmDigest())` — shape-agnostic.

### S5.3 RED-FIRST regression — rewrite the existing BUG-03 probe (mutation assert)

Replace the BUG-03 probe body (`dev/playtest-bug-probes.mjs:174-181`) — the current probe asserts
the OLD broken shape (`dg.pc.hp === 9`); the new one asserts the value structure AND that cur
tracks a wound:

```js
{
  const win = boot(); const w = seedWorld(win);
  w.characters[0].sheet.hpCur = 1;   // badly hurt
  w.characters[0].sheet.tempHp = 3;  // and shielded — temp must surface too
  const dg = win.dmDigest();
  const hp = dg && dg.pc && dg.pc.hp;
  const showsCurrent = !!(hp && typeof hp === "object" && hp.cur === 1 && hp.max === 9 && hp.temp === 3);
  probe("BUG-03", "digest reports MAX hp, never hpCur (DM narrates combat blind to PC wounds)",
    !showsCurrent, `hpCur=1 tempHp=3 -> digest.pc.hp=${JSON.stringify(hp)}`);
}
```

**RED proof:** with the rewritten probe against unfixed code → `● PRESENT`
(`digest.pc.hp=9`, an int). **GREEN proof:** `○ resolved` (`{"cur":1,"max":9,"temp":3}`).

### S5.4 Edge cases (ruled)

| Case | Ruling |
|---|---|
| `hpCur` null (sheet never touched by resources) | reads as full: `cur === max` (the applyHpDelta convention) |
| `tempHp` 0 / absent | no `temp` key (sparse) |
| dead/limbo PC (no living char) | `pc:null` — unchanged upstream guard |
| digest-diet 12 KB ceiling | +~25 B; verify-digest-diet's 33 base assertions untouched by S5 |

### S5.5 Acceptance (S5)

```
node dev/playtest-bug-probes.mjs   → BUG-03 "○ resolved"
node dev/verify-digest-diet.mjs    → green (33 base / 36 after S3 — S5 changes no count)
```

---

## §Queue, gating, and the combined final state

- **Order:** S1 → S2 (both edit the `social_check`/`attitude_shift` case region of
  `src/world/dm.js` and the same seat-prompt section — serialize on one branch or two stacked
  branches; NEVER parallel worktrees on dm.js). S3 ∥ S5 may run parallel to each other but both
  also touch `dm.js`'s pc block — S3 and S5 edit DIFFERENT lines (312 vs 291); if the orchestrator
  wants zero merge friction, run S1→S2→S5→S3 serially; all four are small.
- **Branch naming:** `fix/social-spine-s1-attitude-shift`, `fix/social-spine-s2-fiction-dc`,
  `fix/caster-discoverability-s3`, `fix/digest-hp-s5` (or one `fix/social-spine-cluster` branch
  serial — orchestrator's call; merges are `--no-ff` per CLAUDE.md).
- **Per-unit gate (orchestrator re-runs personally — never trust executor-reported green):** the
  unit's RED proof shown first (probe/assertions failing against pre-fix code), then the unit's
  acceptance block, then the standing sweep:
  `python3 build/check-manifest.py` → `RESULT: OK` · `node dev/verify-social.mjs` → 97/0 ·
  `node dev/verify-dm-events.mjs` → 36/0 · `node dev/verify-dm-seam.mjs` → 38/0.
- **Combined final state (all four landed):**

```
node dev/playtest-bug-probes.mjs   → "4/18 caught bugs still reproduce."
                                     (● PRESENT remaining: BUG-02, BUG-04, BUG-05, BUG-07-by-design;
                                      ○ resolved now includes BUG-03, BUG-17, BUG-18)
node dev/verify-digest-diet.mjs    → "✅ PASS — 36 assertions passed, 0 failed"
node dev/verify-social.mjs         → "SOCIAL Phase 1+2+3+4: 97 passed, 0 failed"
node dev/verify-dm-events.mjs      → "36 passed, 0 failed"
node dev/verify-dm-seam.mjs        → "38 passed, 0 failed"
python3 build/check-manifest.py    → "RESULT: OK"
git diff master --stat -- src/engine/social.js data/ tables.js tables.json → empty
```

  (If the separately-ruled S4 clock hotfix also lands the same night, BUG-02 flips and the totals
  line reads `3/18` — that unit is NOT this spec.)
- **At land time**, update `docs/PLAYTEST-BUGS.md`: BUG-17, BUG-18, BUG-03 entries get a
  `**FIXED 2026-07-XX — branch <name>; probe flipped ○ resolved.**` first line (the BUG-09 entry
  at line 281 is the format precedent); the caster-discoverability ✔-entry gets
  `**CLOSED — SOCIAL-SPINE-FIXES S3.**`

## PROVISIONAL flags for Adam (recommended defaults locked in above; skim-level)

1. **§S1.2 word map includes `wary`/`indifferent`** (the engine's own ladder labels) beyond Adam's
   five blessed words. Recommended KEEP — a DM echoing the engine's ledger vocabulary must land.
2. **§S2.2 "fiction DC is final — no leverage re-pricing"**: levers still auto-shift when decisive
   but never discount a DM-supplied DC. Recommended KEEP (re-discounting recreates BUG-18 through
   the side door); flag because it makes want/fear levers advisory-only on fiction-DC checks.
3. **§S5.1 keeping the `resources.hp` twin** alongside the new `pc.hp` object (~30 B duplication)
   rather than removing it from `resourceDigest`. Recommended KEEP (removing it risks unrelated
   consumers; both derive from the same sheet at build time).

## Registry updates (Fable applies; this spec does not)

- `docs/DESIGN.md` (decision registry) — add: `2026-07-06 · SOCIAL-SPINE-FIXES locked (S1 attitude_shift alias+word-map repair, S2 social_check fiction-DC-final threading, S3 caster discoverability digest lists ≤600B + cast/slot_spent seat contract, S5 digest hp {cur,max}); CAL-1 seat line blessed ("a failed save LANDS — the save is the mercy"); fiction DC never re-priced by levers. → docs/SOCIAL-SPINE-FIXES.md`
- `docs/NEXT-STEPS.md` — add to the build queue: `SOCIAL-SPINE-FIXES S1→S2 then S3∥S5 (spec-locked 2026-07-06, build deferred post-freeze; Sonnet-sized, ~half-day total)` and mark the PLAYTEST-BUGS BUG-17/18/03 items as "specced → SOCIAL-SPINE-FIXES.md".
- `docs/README.md` (docs index) — add under system specs: `SOCIAL-SPINE-FIXES.md — type: system-spec — the BUG-17/18/03 + caster-discoverability contract-repair cluster (attitude/social DC/cast visibility/digest HP).`
- `docs/PLAYTEST-BUGS.md` — BUG-17, BUG-18, BUG-03 and the caster-discoverability entry each get a one-line `SPECCED → docs/SOCIAL-SPINE-FIXES.md (2026-07-06)` note now; FIXED lines only at land time (§Queue).
- `docs/SOCIAL.md` §"events" table (line 343) — after S2 lands, annotate the `social_check` row: `dc` now honored end-to-end (was spec-only).
- `docs/FABLE-WINDOW-2026-07-06.md` §Spec S1/S2/S3/S5 — superseded by this file (the runbook expires after the window anyway).
