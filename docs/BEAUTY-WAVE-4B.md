# BEAUTY-WAVE-4B — MF-3b: WIRE HIT-STOP INTO THE PRODUCTION LEDGER

type: system-spec
status: SPECCED (Opus 4.8, 2026-07-11 — Adam authorized: "spec and orchestrate the mf-3b change."
Closes the WIRING LAW gap BW4 MF-3 left: the hit-stop/recoil/crit-response MECHANISM is built +
tested but dormant in play because the hp ledger event carries no attacker id and never routes a
crit to the crit-response verb. This unit threads those through — engine/contract + render dispatch
only; MF-3's mechanism (src/ui/theater-verbs.js + standee-verbs.js) is UNCHANGED.)

## The gap (verified against the current tree)

- `theaterFxFromLedger` (src/ui/theater-verbs.js, `case "hp"`) maps a damage event to
  `play("hurt",{who,magnitude,dropped})` — **no `attackerId`, no `crit`**.
- `play()` (src/ui/theater-boot.js ~7872) remaps `hurt → "hit-damage"` via
  `STANDEE_VERB_FOR_THEATER_VERB = {hurt:"hit-damage", down:"fall-death"}` (~7870). MF-3's hit-stop +
  recoil in standee-verbs.js (`runKeyframeVerb`, ~370-380) are gated on `opts.attackerId`; the crit
  white-flash + camera nudge are gated on `verbName === "hit-crit"`. None of these fire because
  neither `attackerId` nor a `hit-crit` dispatch ever reaches them.
- The hp ledger entry is written at dm.js:1911:
  `addLedger(w,"outcome",{kind:"hp",pc,delta,tempAbsorbed,from,to,max,dropped,source:src}, …)` —
  **`crit` is accepted into the payload (DM_EVENT_FIELDS.hp_changed, dm.js:1592) but never forwarded
  to this ledger entry; `attacker` is not accepted at all.**
- fall-death's 80ms hold IS already live (unconditional in vDown) — out of scope here.

## Decisions (locked — do not re-litigate)

1. **The attacker travels on the hp_changed event, not by cross-event correlation.** hp_changed
   gains an optional `attacker` payload field = the attacking unit's id (a foe `fid`, or `"pc"` when
   the PC is the source). Absent `attacker` ⇒ hit-stop/recoil simply don't fire (today's behavior,
   graceful — never a throw, never a guess).
2. **`crit` is already accepted** on hp_changed (dm.js:1592) — this unit only has to FORWARD it to
   the ledger entry and the render dispatch. Do not add a new crit field.
3. **Normalization at the contract boundary only** (CLAUDE.md law): `attacker` is added to
   `DM_EVENT_FIELDS.hp_changed.accept` — no per-handler coercion. `attacker` is an id passthrough
   (no `num:` tag).
4. **Render dispatch owns the hit-crit routing + recoil geometry**, not the ledger: `play()` maps a
   crit `hurt` to the `hit-crit` standee verb and computes `recoilDir` from the attacker's vs
   target's live world positions. The engine stays render-agnostic (it only forwards data).
5. **Scope = wiring only.** No change to MF-3's freeze/recoil/nudge math, no new event type, no new
   ledger kind, no DM-prompt/contract-doc change (whether the DM *sends* `attacker` on narrated hits
   is a separate follow-up; the mechanical combat emitters this unit wires are enough to prove it in
   play).

## Units of work (all in one branch — this is a single coherent wire-up)

### A. Contract — accept + forward `attacker` (+ forward `crit`)
- `DM_EVENT_FIELDS.hp_changed.accept` (dm.js:1592): add `"attacker"`. (Leave `num` unchanged.)
- The `hp_changed` handler (dm.js:1896-1912): add `attacker:p.attacker` AND `crit:p.crit` to the
  `addLedger(... {kind:"hp", …})` data object at :1911 (both flow to `theaterFxFromLedger`'s `d`).
  `crit` is already in `p` via the accept list; `attacker` now is too.

### B. Emit sites — stamp `attacker` where the source is known
- dm.js:2295 `applyEvent(w,{type:"hp_changed",payload:{delta:-res.damage,crit:res.crit},source:"detected"})`
  — this is a resolved attack against the PC (foe → PC). Add `attacker:<foe fid>` to the payload
  (grep the enclosing function for the acting foe's id; it is in scope at the resolve site). If the
  acting foe's id is genuinely not in scope there, leave it unset and note it — do NOT invent one.
- dm.js:2405 / 2414 (opportunity / hazard hp emits): stamp `attacker` only where a single attacker
  id is unambiguously in scope; otherwise leave unset (hazards have no attacker — correctly dormant).
- **PC → foe:** the foe's hurt reaction does NOT ride hp_changed (that event is PC-scoped,
  `livingSheet(w)`). Find where a foe's on-hit `play("hurt",{who:fid})` is dispatched (grep
  `play("hurt"` / `cmTheaterNotify` / the `attack`/`foe_action` ledger→fx path). At that site the
  attacker is the PC — pass `attackerId:"pc"` and `crit` through. If no such production dispatch
  exists yet (foe hurt is only played by the capture harness), record that as a finding and leave the
  foe-hurt path for a follow-up — do not fabricate a call site.

### C. Render — consume `attacker` + `crit`
- `theaterFxFromLedger` `case "hp"` (src/ui/theater-verbs.js): pass through →
  `{ verb:"hurt", opts:{ who, magnitude, dropped, attackerId:d.attacker, crit:!!d.crit } }`.
- `play()` (src/ui/theater-boot.js ~7872) + `STANDEE_VERB_FOR_THEATER_VERB`:
  - When `verb==="hurt"` and `opts.crit`, dispatch the **`hit-crit`** standee verb instead of
    `hit-damage` (so MF-3's crit white-flash + single-bounce nudge fire).
  - Thread `opts.attackerId` through to the standee verb (hit-stop + recoil already consume it).
  - Compute `opts.recoilDir` (unit vector target←attacker) from `findUnit(attackerId).position` vs
    `findUnit(who).position` when both resolve; omit it when the attacker doesn't resolve (recoil
    then falls back to MF-3's un-biased shake — never a throw).
  - 3D-figure path (non-sprite `vHurt`): thread `attackerId`/`recoilFrom` the same way (MF-3 built
    `vHurt`'s opt-in recoil + attacker hit-stop).

## Verification — `dev/verify-mf3b-hitstop-wiring.mjs` (jsdom, applyEvent-level + render dispatch)

Copy the applyEvent-harness convention from an existing `dev/verify-*` that drives `applyEvent`
(e.g. verify-dm-events / a combat verify). RED-FIRST on the ⊗ checks (stub the wiring off → prove
the assertion fails at base, then on → green).

1. ⊗ **Contract fold:** `applyEvent(w,{type:"hp_changed",payload:{delta:-6,attacker:"foe-1",crit:true},source:"detected"})`
   → the emitted hp ledger entry carries `attacker:"foe-1"` and `crit:true`. Prove RED at base
   (accept-list lacks `attacker`; ledger entry lacks both) then GREEN.
2. ⊗ **Render dispatch — attacker present:** feed that ledger entry through `theaterFxFromLedger` →
   assert `opts.attackerId==="foe-1"` and `opts.crit===true`; assert `play()` selects the `hit-crit`
   standee verb (not `hit-damage`) for a sprite unit. RED-first (base passes neither).
3. **Dispatch — attacker absent:** an hp event with NO `attacker` → `opts.attackerId` is undefined
   and the dispatch is `hit-damage` (dormant/today's behavior — no throw). Assert graceful.
4. **Recoil geometry:** with attacker + target at known world cells, assert `recoilDir` points
   target-away-from-attacker (sign per a known vector); with an unresolvable attacker, assert
   `recoilDir` is omitted and no throw.
5. **Live hit-stop end-to-end (real Chrome or the MF-3 fake-clock harness path):** an hp_changed with
   `attacker` mounts a hit-stop that freezes attacker+target tweens while a control tween keeps
   ticking (reuse verify-mf3-impact-feel's freeze assertion — this proves the wire actually reaches
   the mechanism, per the WIRING LAW: the check drives the PRODUCTION entry point `applyEvent`, not
   `triggerHitStop` directly).
6. **Regression:** `verify-mf3-impact-feel` 47/0 (mechanism untouched), `verify-theater-verbs` 100/0,
   `verify-standee-verbs` 71/0, and any combat/dm-event harness that exercises `hp_changed`
   (`node dev/gauntlet-fuzz-events.mjs` for hostile hp_changed payloads incl. a bogus `attacker`
   type; `node dev/gauntlet-monkey.mjs` 0 harness-aborted). `python3 build/check-manifest.py` OK.

## Out of scope
DM-prompt/SEAT changes to make the narrated DM *send* `attacker` on hp_changed; MF-5's burst + play
gate; any change to MF-3's freeze/recoil/nudge amplitudes or the fall-death hold.
