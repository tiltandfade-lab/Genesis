---
type: system-spec
project: Genesis
status: BUILD-READY SPEC — AWAITING ENGINE BUILD (not craft-lane; needs src/engine/codex-roll.js work)
created: 2026-07-08
origin: Adam live-play finding (2026-07-08 craft session)
related:
  - "[[SPICE-CURVE]]"
  - "[[project-genesis-codex]]"
  - "GPT-5.5-advice-for-Claude/NPC-HOOK-REVIEW-2026-07-08.md"
  - "docs/CRAFT-SHELF.md"
---

# NPC-COHERENCE-DIAL — most people should read in one line

## The finding (Adam, live play, 2026-07-08)

`rollNPC()` currently fires the **full atom stack on every NPC** — race, role, quirk, manner,
flaw, bond, fear, leverage, want, motivation, all rolled independently. In real table play that
made **every** NPC a chaotically-assembled weirdo: high cognitive load (ten atoms to reconcile per
person) and, worse, **contrast collapse** — when everyone is strange, no one is. The earnest
captain who simply *is* the captain is what makes the three genuinely strange NPCs around him land.
Uniform complexity is its own monotony.

## THE LAW (states first, because it makes the rest safe)

**The coherence dial simplifies the PERSON, never the SITUATION.** The hook is the interest engine;
coherence is only the person-legibility dial. And they're **architecturally separate**: the hook is
a *prep/scene-layer* roll (attached to map nodes and questgivers in `prep.js`/`prep-bundle.js`, drawn
from the graduated `npc-hook` d300), **not** part of `rollNPC`'s atom stack — so coherence, a
`rollNPC` concern, *structurally cannot* gate it. A clean archetype captain still stands inside a
sharp hooked situation because the hook lives on the scene, not the person. **A town of archetypes
is a town of clear people in sharp situations, not a boring town.**

## The mechanism — a complexity band (the social analog of the spice curve)

A generated NPC lands in one of four coherence tiers, set by how many identity/lever atoms fire:

| Tier | Atoms that fire | Reads as |
|---|---|---|
| **Archetype** | role + name + **want (always fires)** + optionally one manner; rest silent/role-implied | *Captain Alder: wants his people home alive; honest to a fault.* ~2 atoms, one of them always the want. |
| **Wrinkled** | + **one** atom that cuts against the role | *…and he's into the moneylender deeper than a captain should be.* ~3 atoms. |
| **Layered** | + **2–3** atoms; crosscurrents, still one read | richer, holds together. ~5 atoms. |
| **Tangled** | **all** atoms fire (today's default for everyone) | *…secret heir to the Vale throne, raising the dead, wants a temple.* 10 atoms. |

The dial governs the **identity/lever** atoms — fear, leverage, flaw, bond, quirk, manner,
motivation. It does **not** touch race, role, name, or **hook** (see THE LAW).

**WANT always fires, at every tier** (Adam 2026-07-08): a person without a want is just a job
title, so even the barest archetype gets its single drive. And because `npc-want` carries its own
2d50 moral bell *independently* of the coherence roll, an archetype's one drive is usually ordinary
but **rarely (~1-in-2,500) world-scale** — a clean, legible captain who nonetheless wants godhood.
That's the *good* surprise: one big motive on an otherwise-simple person — the opposite of the
ten-colliding-atoms problem the dial exists to solve.

## The curve — coherence mix rides region spice

Calm places mint archetypes; frayed places mint weirdos (their people fray with their reality).
Weights per region temperature (rows sum to 100; **Adam-approved 2026-07-08**):

| Region | Archetype | Wrinkled | Layered | Tangled |
|---|---|---|---|---|
| Sleepy (quiet hamlet) | 70 | 24 | 5 | 1 |
| **Ordinary (default when no region)** | **58** | **30** | **10** | **2** |
| Uneasy | 45 | 33 | 17 | 5 |
| Strained | 32 | 33 | 25 | 10 |
| Breached (a leak in the world) | 18 | 30 | 32 | 20 |

Read: a normal town is **58–70% clean archetypes** (the earnest captain is the *default*, the full
weirdo is 1-in-50 to 1-in-100); a breach quarter runs **20% tangled** and coherence gets rare.
Numbers are a starting point — retune once felt in play; the shape (right-skew toward simple, spice
pushing toward tangled) is the invariant.

## Overrides that bypass the band roll

So the DM always gets the clean person they asked for:

- **`roleHint` present → force Archetype.** Callers already pass roleHint (`questgiver`, `jailer`,
  `proprietor`, `employer`, …); when context named the role, deliver it clean. This is the direct
  answer to "I need an earnest captain right now" — pass `roleHint:"captain"`.
- **walk-on / crowd NPC → always Archetype.** Never reconcile weird atoms for a 10-second character.
- **DM pick → any tier by hand.**

Only **ambient / named** NPCs with no hint actually roll the band.

## Scope / build notes (NOT craft-lane)

This is a `src/engine/codex-roll.js` change — a `rollNPC` generation **mode**, out of the craft
session's lane. Build unit needs:
1. A `coherence` param on `rollNPC` (or derive from `opts`): tier chosen by the region-temperature
   band, with the roleHint/walk-on overrides.
2. Tier → atom-suppression logic (Archetype fires ~2 atoms; Tangled fires all). Grace-note selection
   should prefer a **role-true** want/manner so the archetype coheres.
3. Region-temperature → weights mapping (needs a region "temperature" read; compose with the
   existing spice/fray signal if one is already exposed to `rollNPC`).
4. Keep the **hook** firing at every tier (THE LAW).
5. Compose with any existing significance/walk-on concept (walk-ons force Archetype).

When built, register the decision in `docs/DESIGN.md` + `docs/NEXT-STEPS.md` (deferred here to
avoid colliding with the parallel graphics session on those shared docs).

## Implementation spec (build-ready — Sonnet-executable, Opus re-gate)

Grounded in the real `src/engine/codex-roll.js:rollNPC(opts)` (rolls race/role/quirk/manner/flaw/
bond/fear/leverage/want/motivation independently; builds `{rolled, fields, dm}`; computes
`fray = frayLevel(region.center.q, r) ∈ [0,1]` when a region is passed).

**Interface — additive opts on `rollNPC` (no caller breaks):**
- `opts.coherence` — `'archetype'|'wrinkled'|'layered'|'tangled'`, hard override (DM pick).
- `opts.walkOn` — bool; `true` → force `'archetype'`.
- (existing) `opts.roleHint` — when present and no explicit `coherence`, default to `'archetype'`
  (the intended flattening of functional NPCs — jailer/proprietor/questgiver read clean). Tunable
  to an 80/20 archetype/wrinkled lean if playtest wants variety.
- (existing) `opts.region` — supplies `fray` → region temperature.

**Tier selection — `pickCoherence(opts)`:**
1. `opts.coherence` set → use it.
2. else `opts.walkOn` → `'archetype'`.
3. else `opts.roleHint` present → `'archetype'`.
4. else derive temperature from `fray` (null → **Ordinary**): `[0,.15)`→Sleepy, `[.15,.4)`→Ordinary,
   `[.4,.65)`→Uneasy, `[.65,.85)`→Strained, `[.85,1]`→Breached; weighted-pick the tier from that
   row of the curve table (cumulative d100 against the weights).

**Atom firing per tier** (beyond the always-on role + name + **want**; suppressed ⇒ `null`, kept
out of `dm`):

| Tier | also fires |
|---|---|
| Archetype | optionally ONE of {quirk, manner}. Suppress flaw, bond, fear, leverage, motivation. |
| Wrinkled | ONE of {flaw, bond, fear, leverage} + manner. |
| Layered | 2–3 levers + quirk + manner. |
| Tangled | ALL atoms (today's behavior — unchanged). |

**Invariants:**
- `want`, `role`, `name` non-null at **every** tier (want is the minimum drive).
- Payload shape unchanged; suppressed `dm` levers are `null`. Consumers must stay null-safe —
  `social.js:applyLeverage` already filters levers, but **verify no null-deref** when
  `leverage/fear/want` are absent.
- **Hook untouched** — not a `rollNPC` atom (prep/scene layer); see THE LAW.
- `breachTouch` stays its own fray-scaled rare roll (leave independent of coherence).

**Test plan / acceptance:**
1. **Distribution** — roll N≈2000 at each temperature; assert tier mix within ±3% of the curve.
2. **Invariant** — every rolled NPC (all tiers) has non-null want/role/name.
3. **Suppression** — archetype payloads: null flaw/bond/fear/leverage/motivation, ≤1 of quirk/manner.
4. **Overrides** — walkOn & roleHint → always archetype; `opts.coherence` → exact tier.
5. **Null-safety** — an archetype NPC drives parley (`social.js`) with no leverage/fear/want-lever
   present and does not throw; `verify-dm-events.mjs` stays green.
6. **Regression** — existing callers (life.js, urban.js, job-walks.js, capture.js, prep.js,
   prep-bundle.js) still produce valid NPCs.

**Non-goals / deferrals:** role→lever *content* biasing (keep independent — the incongruity is the
feature); tying `breachTouch` to coherence; per-tier prose templating (the DM voices it).

## How the current craft anticipates it

The **NPC Want** 2d50 (landed) and the **NPC Leverage** right-skew (in progress) are the dial in
miniature at the table level: their **common** rows are simple and role-plausible (archetype-ready
levers — the captain's honest debt), their **rare** tails are the strange stuff (for tangled NPCs).
So the lever tables already serve the dial the moment it ships; crafting them coherence-aware now
is the right prep.
