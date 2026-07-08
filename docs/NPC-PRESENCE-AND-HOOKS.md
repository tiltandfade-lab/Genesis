---
type: system-spec
project: Genesis
status: BUILD-READY SPEC — AWAITING ENGINE BUILD (not craft-lane; src/ work across codex-roll.js, prep, wiring-a.js)
created: 2026-07-08
origin: Adam design session 2026-07-08 (coherence finding → hook density → if-ignored unification)
related:
  - "[[NPC-COHERENCE-DIAL]]"
  - "[[SPICE-CURVE]]"
  - "[[project-genesis-codex]]"
  - "docs/ON-DEMAND-GEN.md"
---

# NPC-PRESENCE-AND-HOOKS — the consequence-spectrum simulation

## The thesis (Adam, 2026-07-08)

Reality feels like reality because **things in every direction are at different stages of a
consequence arc** — some just starting, some mid-crisis, some resolving, some long over and leaving
aftermath. With a finite hook corpus (`npc-hook` d300, graduated) but the player meeting those hooks
at **every point along their start→finish**, the lived experience is effectively **infinite from a
finite table**. That spectrum — not more content — is the payoff of an AI-overseen simulation, and
the thing games could not really do before now. The **anti-quantum-ogre principle**: the world moves
whether or not the player is looking; it does *not* wait to exist until observed.

This subsystem is four components that produce that feel: **(1) coherence dial · (2) ambient
population · (3) hook discovery · (4) the three-tier attention model + if-ignored unification.**

---

## Component 1 — Coherence dial

Full spec: **[[NPC-COHERENCE-DIAL]]** (build-ready). Summary: most generated NPCs are legible
**archetypes** (role + name + want), a minority the full atom-stack weirdo, mix riding region
temperature; **want always fires; the hook is never gated by coherence.** Ambient NPCs (Component 2)
are Archetype by default (walk-on override).

## Component 2 — Ambient population (fill the room)

On scene mint, populate the scene with ambient NPCs so a room is never empty. **Lazy**: mint stubs
(name + role + want, Archetype coherence); flesh only on interaction.

Count = **scene-type base × realm/temperature multiplier**:

| Scene | ambient base |
|---|---|
| Shrine / lonely place | 1d2 |
| Shop / small interior | 1d3 |
| Tavern / hall | 2d4 |
| Market / plaza / dock | 3d6 |

**Realm character is a temperature input, not just fray** (Adam): mayhem realms (Toon/Theater-class)
run hot on the dial by their nature — they set a **floor** on the temperature that the ambient-count
multiplier, the discovery curve, and the coherence dial all read. Toon Town's market is shoulder to
shoulder; a sleepy hamlet's is sparse.

## Component 3 — Hook discovery (Skyrim-in-a-tavern)

1. **Every scene guarantees ≥1 hook** — the scene's anchor/significant NPC draws an `npc-hook` at
   mint. Nobody enters an empty room; the incurious player always has something.
2. **On interaction, roll discovery** against the **temperature curve** — success ⇒ draw a d300
   `npc-hook` **on-demand** and attach it (immutable once revealed, per ON-DEMAND-GEN). Failure ⇒ the
   NPC is texture; their one want carries the beat.

| Region / realm temperature | hook-on-interaction |
|---|---|
| Sleepy hamlet | ~30% |
| Ordinary town | ~50% (coin-flip; discovery stays earned) |
| Uneasy | ~65% |
| Strained | ~80% |
| Breached / mayhem realm (Toon, Theater) | ~95–100% (everyone's a scene) |

**Demand-driven**: hooks cost nothing until the player's curiosity spends them, so density scales
with the player, not the map. Curiosity is rewarded; it is never mandatory.

## Component 4 — The three-tier attention model + if-ignored unification

How a hook's **If Ignored** consequence fires depends on how much attention the player paid. The
label is a knowing paradox: "if-ignored" mostly bites what you *touched* and walked away from.

| Tier | Player did | If-Ignored behavior | Ledger |
|---|---|---|---|
| **Touched & kept** | engaged (accepted / acted / pressed a 2nd question) | **tracked thread**; fires the hook's **own** If-Ignored column, **ratcheting by `ignoredRolls`** over staleness windows | **player** ledger (it's theirs; they know) |
| **Touched & dropped** | discovered but did not engage | the hook's own If-Ignored fires **ONCE, offscreen**, then the thread **closes**; surfaces to the player only **diegetically** (a rumor, an aftermath, a body) | **DM** ledger only — never a player checklist |
| **Never touched** | ambient, never interacted | **nothing fires, ever** (Adam's constraint — there is already enough live drama in the touched set) | — |

**If-ignored unification** (replaces the current `turnIgnoredCheck` behavior of rolling a generic
table for everything):
- A **hooked** thread's if-ignored = **its own hook's If-Ignored column** (bespoke, situation-true;
  this resurrects the 300 hand-authored consequences that currently never fire).
- A **hookless** tracked thread's if-ignored = the generic `npc-if-ignored` d100 as **fallback**,
  and it must **escalate by `ignoredRolls`** (window 1 pulls the low band, window 3 the high band) —
  not the current flat re-roll, which can drift *milder* the longer you ignore.

**"Engage" threshold** — the touched-&-kept vs touched-&-dropped split. DM-judged, flagged on the
record when the player accepts / acts on / meaningfully pursues the hook (a second in-character
question counts; a passing glance does not). Reuse the attitude/parley engagement signal if one is
already exposed.

---

## Build units (engine — hand to the build session as one subsystem)

1. **Coherence dial** — per [[NPC-COHERENCE-DIAL]] (`rollNPC` mode + tier→atom-suppression). Ships first;
   Components 2–3 depend on Archetype-cheap ambient NPCs.
2. **Ambient population** — scene-mint hook: roll count (scene-type × temperature), mint Archetype
   stubs, flesh on interaction. Needs a scene/place "temperature" read = f(fray, realm archetype).
3. **Guaranteed scene hook** — the scene anchor draws `npc-hook` at mint (generalize `quest-hook.js`
   beyond quest-givers to "the significant NPC of the scene"). **Store the drawn hook — including its
   If-Ignored text — on the NPC/thread record** so the sweep (unit 5) can read it.
4. **Hook discovery on interaction** — discovery roll vs the temperature curve; on success draw +
   attach a d300 hook on-demand, immutable once revealed.
5. **Attention routing + if-ignored rewire** (`wiring-a.js turnIgnoredCheck`):
   - engaged → tracked; fire `thread.hook.ifIgnored` (bespoke) ratcheting by `ignoredRolls`; player ledger.
   - discovered-not-engaged → one-shot offscreen `thread.hook.ifIgnored` → DM ledger, then close.
   - never-interacted → no-op.
   - hookless tracked → generic `npc-if-ignored` fallback, ratcheting by `ignoredRolls`.

## Test / acceptance

- **Discovery distribution** — N interactions per temperature band land within ±3% of the curve.
- **Ambient counts** — scene-type × multiplier within tolerance; mayhem realm demonstrably denser.
- **Attention routing** — engaged ⇒ player ledger + ratcheting bespoke if-ignored; discovered-dropped
  ⇒ exactly ONE DM-ledger if-ignored then closed; never-interacted ⇒ zero ledger entries.
- **Unification** — a hooked thread's ignore beat matches its hook's If-Ignored text (not the generic
  table); hookless falls back and ratchets by count; never drifts milder over successive windows.
- **No flood** — a player who discovers K hooks and engages J: player ledger grows by ≤J tracked
  threads; DM ledger by ≤(K−J) one-shots; untouched ambient NPCs add nothing.
- **Cost** — ambient NPCs are lazy stubs until interaction; no pre-rolled hooks.

## Non-goals / deferrals

- Role→lever-content biasing (kept independent — the incongruity is the feature).
- Player-facing surfacing of DM-ledger one-shots except **diegetically** (no missed-quest log).
- Register in `docs/DESIGN.md` + `docs/NEXT-STEPS.md` at build time (deferred here to avoid
  colliding with the parallel graphics session on shared docs).
