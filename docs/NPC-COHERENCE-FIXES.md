---
type: system-spec
project: Genesis
status: SPECCED — Adam ruled 2026-07-08 (post autonomous engine-wiring run); two fixes to the merged coherence/temperature system
created: 2026-07-08
related:
  - "[[NPC-COHERENCE-DIAL]]"
  - "[[NPC-ROLE-REALMS]]"
  - "[[NPC-PRESENCE-AND-HOOKS]]"
  - "[[SPATIAL-MODEL]]"
---

# NPC-COHERENCE-FIXES — two corrections to the shipped coherence/temperature layer

Both land on `master` (the coherence dial + role-realms are already merged); the parked
`feat/npc-presence-hooks` (E-PRES) rebases on top. One branch each, gated like any unit.

---

## §1 — Questgivers must NOT be forced to Archetype (Adam, 2026-07-08)

### The finding
`pickCoherence` (src/engine/codex-roll.js) step 3 forces **any** `opts.roleHint` → `'archetype'`.
That flattens the **questgiver** — the significant NPC the whole hook hangs on — into a clean,
lever-less shell (null flaw/bond/fear/leverage/motivation). **Adam's ruling: a questgiver should
never be forced into an archetype.** The hook-bearer is exactly the person the player digs into;
they must be allowed real depth.

The `roleHint → archetype` flattening was only ever meant for **functional/transactional** NPCs —
the jailer, the shopkeeper, the employer behind a desk — where the DM asked for "just give me the
clean role." Questgiver was mis-bucketed with them.

### The fix
Split roleHints into **functional** (force Archetype — deliver clean) vs **significant** (never
force; they earn depth):

- `COHERENCE_FUNCTIONAL_HINTS = { "jailer", "employer", "captive", "proprietor", "guard",
  "shopkeep", "clerk" }` — the transactional set. These keep today's `roleHint → archetype` force.
- **Everything else, incl. `"questgiver"`, is significant** → does NOT force archetype.
  - Recommended: a significant hint rolls the coherence band **with a floor of `'wrinkled'`** (never
    a bare archetype — the hook-bearer always carries at least one lever the player can pull), and
    can climb to layered/tangled on the region-temperature roll like any ambient NPC.
  - `pickCoherence` change: replace step 3 (`opts.roleHint → 'archetype'`) with:
    `if (opts.roleHint && COHERENCE_FUNCTIONAL_HINTS.has(opts.roleHint)) return 'archetype';`
    then fall through to the band roll; for significant hints, clamp the rolled tier UP to at least
    `'wrinkled'` (a `coherenceFloor` param, default null; significant hints pass `'wrinkled'`).
  - `walkOn` and explicit `opts.coherence` overrides are unchanged and still win first.

**Floor is Adam's tuning call:** questgivers could instead be floored at `'layered'` (reliably rich)
or roll the band freely with no floor (most still archetype in calm regions). Spec ships `'wrinkled'`
as the default; retune in play.

### Fallout to reconcile
- **`src/engine/prep-bundle.js:95`** — the questgiver cast call `rollNPC({roleHint:"questgiver", region})`
  now yields a wrinkled+ NPC (it has a lever again). No caller change needed; just verify.
- **`dev/verify-prep-bundle.mjs`** — the autonomous run softened its cast assertion to `rolled.want`
  (because questgivers had become archetype). With this fix, tighten it back toward "cast NPCs carry
  at least one DM lever" — but assert **"≥1 of {flawSecret,bond,fear,leverage}"**, NOT specifically
  `flawSecret` (wrinkled fires ONE of the four, not always the secret). Red-first: prove a bare
  archetype would fail it, then the wrinkled questgiver passes.
- **[[NPC-PRESENCE-AND-HOOKS]] design flag CLOSED:** this is the answer to "should hook-bearers be
  enriched past archetype." Yes — significant/hook-bearing NPCs are wrinkled+; ambient stubs stay
  archetype. The THE-LAW framing still holds (interest also lives in the scene hook), but the
  hook-bearer is no longer flattened.

### Test / acceptance
1. `rollNPC({roleHint:"questgiver", region})` over N: **0%** land at `'archetype'`; ≥ wrinkled always;
   every one carries ≥1 of {flawSecret,bond,fear,leverage}. ⊗ RED-FIRST (stub the old force-archetype, watch it fail).
2. `rollNPC({roleHint:"jailer"})` still forces archetype (functional set intact).
3. `walkOn` / explicit `opts.coherence` still override (regression).
4. `verify-prep-bundle` cast assertion tightened + green; `verify-coherence-dial` still green.

---

## §2 — `regionForNode` never supplies `.center` → fray-by-node temperature is inert (live-path bug)

### The finding
`rollNPC` (and E-PRES's `sceneTemperature`, and role-realms hybridization) read
`opts.region.center.{q,r}` and call `frayLevel(center.q, center.r)` to derive region temperature.
But **`regionForNode(w, nodeId)` (src/engine/region.js:239) returns a region record with top-level
`.q`/`.r` (coarse region-CELL coordinates, `regionRingPos`) and NO `.center`.** So
`opts.region.center` is always `undefined` → `fray` is always `0`/null → temperature is **always
"ordinary"** on the live path. The coherence dial's region variation, the role-realms breach-leak
hybridization, and E-PRES's ambient-density/discovery curves are all **inert except the realm floor**
(mayhem realms). This is a pre-existing gap the autonomous run surfaced (shared by all three merged/
parked consumers — one fix lights up all three).

### The fix
Populate the node's **fray-relevant hex position** on the region record so the existing
`center.{q,r}` reads resolve. The fray gradient is keyed on the node's axial hex distance from origin
— `src/world/render.js:32` already computes exactly this: `worldToAxial(node.x, node.y)` → `hexDist`.

- In `regionForNode(w, nodeId)`: look up the node (`w.map.nodes[nodeId]`), compute
  `const ax = worldToAxial(node.x, node.y)`, and attach **`region.center = { q: ax.q, r: ax.r }`**
  (the node-position axial coords `frayLevel` expects — NOT the region-cell `region.q/.r`, which stay
  as they are for `regionDistance`). Null-safe: no node / no coords → omit `center` (consumers already
  treat missing center as fray 0, today's behavior — never throws).
- Confirm `frayLevel`'s expected argument space matches `worldToAxial` output (same axial frame
  render.js uses for `_frayStart`). If `frayLevel` wants raw distance vs axial q/r, adapt the call,
  but keep the node-position semantics (rim = high fray).

**Do NOT** change the three consumers — they already read `region.center.{q,r}` correctly; this is
purely the missing producer.

### Test / acceptance
1. `regionForNode(w, originNodeId).center` is a `{q,r}` at/near origin → `frayLevel` ≈ low →
   `coherenceTemperature` = sleepy/ordinary.
2. `regionForNode(w, rimNodeId).center` → high fray → uneasy/strained/breached. ⊗ RED-FIRST
   (before the fix, both return no center → both "ordinary"; prove the rim case is stuck, then fix).
3. Downstream now VARIES by node: `rollNPC` at a rim node mints demonstrably more tangled NPCs than at
   origin; `sceneTemperature` (E-PRES) denser at the rim; role-realms hybridization leak-rate rises
   with node fray. One integration test per consumer.
4. Full sweep + `verify-coherence-dial` + `verify-role-realms` stay green (the change is additive;
   calm/origin nodes keep today's "ordinary" behavior — no regression for existing fixtures that use
   origin-ish regions).

### Why it matters
This is the single wire that makes the whole "the world's people fray with its reality" thesis
actually fire in play — right now a breach quarter and a sleepy hamlet mint identical NPC mixes
unless the realm floor differs. Cheap fix, large payoff; do it before tuning any of the temperature
curves by feel (you'd be tuning against a dead signal otherwise).
