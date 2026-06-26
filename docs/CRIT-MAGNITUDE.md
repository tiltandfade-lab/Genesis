---
type: system-spec
branch: Genesis
status: locked
created: 2026-06-23
related:
  - "[[SPICE-CURVE]]"
  - "[[DM-CHARTER]]"
  - "[[DESIGN]]"
---

# Genesis — The Critical-Magnitude System (spec v1)

The honest-dice spike mechanism. SPICE-CURVE §3 named it in one line ("the Critical-Magnitude
system — nat 1/20 → second d20"); this spec is the full rule, authored from Adam's design call
(2026-06-23). It is the **one place** a single d20 action can momentarily reach the top of both the
Spice and Scope axes — the exception, not a trend.

## 1. The rule

A **natural 20** (critical success) or a **natural 1** (critical failure) on any d20 action roll
**demands a second d20** — the **magnitude die**. The first die sets the *direction* (triumph or
disaster); the second sets *how far it goes*. "How far" is **two axes at once**: how many distinct
things change (**count**), and how far each reaches (**intensity/scope** — Local → Regional →
Planar). The Lathander example (below) is not one outcome but a *cascade* — a shrine raised, a
bandit turned, a secret revealed, a bond formed — all from one act. The magnitude die governs the
size of that cascade.

| 1st | 2nd | Outcome | Lenses fire | Character |
|---|---|---|---|---|
| **20** | 1–10 | **Standard Critical Success** | — | The normal, generous crit ruling — they clearly and cleanly succeed. Apply the best standard interpretation. No lens roll. |
| **20** | 11–14 | **Amplified Success (minor)** | **1** | One [[Mythic Success Lenses\|lens]] fires; scope widens to Regional; may not be permanent. |
| **20** | 15–19 | **Amplified Success (major)** | **2–3** | A *cluster* of distinct lenses; mostly permanent. |
| **20** | **20** | **Mythic Success** | **full cascade (3+)** | A permanent, world-altering boon. Planar/cosmic. Wondrous, scarcely believable. Written to the Ledger as canon. |
| **1** | 11–20 | **Standard Critical Failure** | — | Humorous, tragic, or painful — but recoverable. *"Humor that is remembered."* No lens roll. |
| **1** | 7–10 | **Amplified Failure (minor)** | **1** | One [[Mythic Failure Lenses\|lens]] fires; the cost spreads locally. |
| **1** | 2–6 | **Amplified Failure (major)** | **2–3** | A *spreading catastrophe* of distinct lenses. |
| **1** | **1** | **Mythic Failure** | **full cascade (3+)** | The ultimate. Humor by default, **but in high-stakes situations things go as wrong as they possibly can** — incredibly dark, permanent. Written to the Ledger as canon. |

**The failure magnitude die runs inverted** — on a nat 1, *lower* is worse (1 is the floor of
catastrophe), mirroring how *higher* is better on a nat 20.

### 1.1 The lens roll & the cascade (Amplified + Mythic only)

When the band calls for lenses, roll the relevant table — `[[Mythic Success Lenses]]` (d12) or
`[[Mythic Failure Lenses]]` (d12). Each row is a **lens**: a *kind* of permanent change, not a
finished outcome. The DM fills the content to fit the exact fiction in front of them.

Three rules keep the cascade clean:

1. **Draw distinct lenses.** When 2+ fire, reroll duplicates. Two of the same lens is not "more
   kinds" — it is "more degree," and degree is already the *intensity* axis's job. Count = kinds;
   intensity = degree. Keep them separate.
2. **Weave for coherence.** The lenses must flow from *one act*, as the Lathander cascade does. If a
   rolled lens genuinely cannot cohere with the others and the fiction, the DM drops or rerolls it.
   The die says how many threads; the DM's craft is braiding them into one event.
3. **A lens may hand off to a payload.** In a cascade, the *"place is transformed / scarred"* lens
   routes into the Myth suite (Seed → Costs → Geography) while the other lenses resolve as straight
   rulings. That is the Myth suite in its correct place — one thread of the braid, never the whole.

The lens *tables* are deliberately small and **orthogonal** (12 distinct axes each). Variation comes
from **combination**, not row count: 12 orthogonal lenses drawn 2–3 at a time is dozens-to-hundreds
of distinct cascades, each AI-filled. A larger table would make near-duplicate lenses more likely to
fire together — and a cascade of two near-identical lenses falls flat. Orthogonality is what the
cascade mechanic requires.

The two **Mythic** ends are deliberate **mirrors**. The canonical examples (Adam):
- **20/20 — the Light of Lathander.** A cleric pleads with a bandit who meant to attack or extort
  the party, and double-crits. Radiant light shines down on the spot *permanently*; the light works
  the bandit's genuine repentance; he later returns to reveal everything he knows about the bandit
  operation; the townsfolk build and maintain a shrine around the enduring light.
- **1/1 — the dark twin.** Where a 20/20 might raise a shrine, a 1/1 in a high-stakes moment might
  tear the planes — a portal to a hell dimension opens at the spot, and a dark cult coalesces around
  it. The outcome need not take that exact shape; it is calibrated to **that magnitude**.

## 2. Tone of the magnitude

- **Success** skews **wondrous / triumphant** as it climbs.
- **Failure** skews **humorous by default** — and the humor should be *memorable*, the kind retold
  for sessions. **Exception: high stakes.** When the moment matters (a life on the line, a ritual at
  its hinge, a planar boundary already thin), a Mythic Failure goes **as dark and as permanent as the
  fiction allows.** The DM reads the stakes and chooses the register.
- The Mythic ends **mirror each other in kind**: if the world can hold a permanent shrine of light,
  it can hold a permanent wound of dark. Calibrate the 1/1 against what a 20/20 would have created in
  the same scene.

## 3. How it sits on the existing axes

This system is the **live realization** of two things already on the books:

- **SPICE-CURVE §3 — Spice × Scope.** The magnitude die spikes *both* axes at once. Standard →
  Amplified → Mythic maps to Local → Regional → Planar/Cosmic. This is the sanctioned spike; normal
  table rolls still grade spice *statically* (§2), never on a timer.
- **The Constitution's Escalation Curve** (90% Local / 9% Regional / 0.9% Planar / 0.09% Cosmic).
  A 20/20 or a 1/1 is ~0.25% of any crit-triggering roll, so Mythic crits arrive at roughly the
  Curve's intended rarity — the math already agrees with the target.

**Emergence (SPICE-CURVE §2):** a Mythic crit outcome is **written to the World State Ledger as
permanent canon** — the shrine, the hell-wound, the redeemed-then-returned NPC. The world grows
stranger because strange things actually happened and *persist*, never because a dial forced them.

## 4. The seam — generic engine vs. situational payload (the design distinction)

The crit-magnitude system is the **generic engine**: it fires on *any* d20 action — a sword swing,
a lockpick, a chase, a heist, a plea to a bandit.

The **Myth suite** (`Myth Seeds` → `Myth Costs` → `Myth Becomes Geography`) is **one downstream
payload**, not the universal answer. It only handles the case where a mythic outcome **mythologizes a
place or deed** — the bandit-shrine fits; a 20/20 *parry* does not. Adam's catch (2026-06-23):
*"some of these mythic tables are too specific to apply to a very situational double crit."* Exactly
— they are situational by design.

**The missing piece is now built (2026-06-23) — the lens oracle.** Rather than one universal
table *or* a context-tagged family of outcome tables, the answer is a pair of **lens** tables that
supply a *vector* (the kind of permanent change) and let the AI supply the *content* along it:
- `[[Mythic Success Lenses]]` and `[[Mythic Failure Lenses]]` (d12 each, in
  `Engine/03. _Tables/03. Session Mechanics/Consequences/`). A lens fires on *any* d20 action — a
  parry, a plea, a lockpick — because it names a dimension, not a scene. "A person is permanently
  changed" fits a parry (the humiliated duelist becomes a lifelong nemesis) as readily as the
  bandit's repentance.
- The **Myth suite is one lens's payload** — the `"a place is transformed / scarred"` row hands off
  to Seed → Costs → Geography. The suite needs no rework; it was only ever the place/deed branch.

**Engine wiring — ☑ BUILT 2026-06-26** (`src/engine/crit.js`): `rollCritMagnitude(natural,{magnitude})`
reads the band → lens count (`critBand`, success + inverted-failure ladders), draws distinct lenses
(`critDrawLenses`, reroll dupes), and routes the row-1 place lens to the Myth suite (rolls `myth-seeds`);
returns an atom payload only — never writes the world. The `crit_outcome` event (`applyEvent`, `world.dm`)
auto-writes a Mythic result to the Ledger as **canon** (amplified → `outcome`). `dmRollFor` detects a
nat 20/1 and rolls the magnitude die **openly**, attaching the lens vector to the turn so the DM narrates
*from* the dice. Verified `dev/verify-crit.mjs` 23/23.

## 5. DM-side conduct (Charter alignment)

- **Dice are open** (DM-CHARTER §6.1 dice transparency). The *player* rolls both the natural die and
  the magnitude die; the spike is never hidden — the player sees the dice run hot.
- **The DM narrates the outcome** (definitive) and **scales the magnitude to context and stakes**
  (§2 above). The magnitude die tells the DM *how big*; the DM's craft is *what shape*, true to the
  fiction in front of them.
- **Telegraph, then deliver** (DM-CHARTER §5 danger/fairness): a high-stakes Mythic Failure should
  land in a scene whose stakes were *already felt*, not ambushed.
- **State the rule clearly when asked** (DM-CHARTER §6/§10.7): a player who wants to know what the
  second d20 means gets a straight answer, in voice.

## 6. Build status

- **Spec:** locked 2026-06-23; **count×intensity curve + lens oracle added 2026-06-23** (this doc).
- **Lens tables:** BUILT 2026-06-23 — `Mythic Success Lenses` + `Mythic Failure Lenses` (d12 each,
  Session Mechanics / Consequences). Compiled into `tables.json`.
- **Rule of play:** usable now by a human/AI DM (it is a narration-and-ruling protocol; no engine code
  required to run it at the table / over the DM Bridge).
- **Engine wiring — ☑ BUILT 2026-06-26** (`feat/crit-magnitude`): `src/engine/crit.js`
  (`rollCritMagnitude`/`critBand`/`critDrawLenses` — magnitude die → band → distinct lenses → Myth-suite
  handoff, atoms only); the `crit_outcome` event in `applyEvent` (auto-Ledger canon for Mythic); and the
  `dmRollFor` nat-20/1 open-magnitude-die hook. `dev/verify-crit.mjs` 23/23; check-manifest OK (44 modules).
  *(In-play handshake render to eyeball at the next live Bridge session — headless-verified here.)*
