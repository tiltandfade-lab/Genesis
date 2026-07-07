# Genesis — The Spice Curve (spec v0.2, draft)

*The intensity-grading system for Genesis. Unifies scattered tier vocabulary into one named ladder. Spice is **emergent**, not engineered. Revised 2026-06-18. Proposed home: `Playtest Sandbox/Genesis/SPICE-CURVE.md`.*

*Related: `SPICE-RAISE.md` — §1's static distribution SUPERSEDED 2026-07-06 (tier-weighted band-first rolling; see §1 below).*

---

## What this fixes

Genesis already grades results by intensity — every table row in `genesis.html` carries a tier (`Grounded` / `Less-Grounded` / `Strange`, column index 2), weighted so higher rolls are stranger. The problems were only that the **vocabulary is inconsistent** across artifacts (tarot says "Insane"; the Web doc says "Volatile and Mythic"; the Constitution has a separate "Escalation Curve"). This spec gives the curve one vocabulary — and nails down that spice flavors the world *organically*, never on a timer.

---

## 1. The band ladder (intensity axis)

Five canonical bands. This vocabulary supersedes all prior tier names.

| Band | Feel | Old names it replaces |
|---|---|---|
| **1 · Grounded** | mundane, true to genre | Grounded |
| **2 · Textured** | a wrinkle, slightly off | "Less-Grounded" |
| **3 · Strange** | uncanny; the world tilts | "Strange" / tarot "Insane" (low) |
| **4 · Volatile** | reality strains; consequences escalate | Web doc "Volatile"; tarot "Insane" (high) |
| **5 · Mythic** | reality breaks; world-marking | Web doc "Mythic"; Critical-Magnitude double-crit |

**Play-time distribution is tier-weighted — SUPERSEDED here 2026-07-06, see `SPICE-RAISE.md`:**
the engine picks a BAND from the region tier's weights (baseline 25/25/25/17/8 → rim 0/5/25/45/25),
then a row within it. A table's row layout is now a COVERAGE guarantee (every band present,
ceiling honest), not the play distribution. §4's class ceilings still bind (band-first steps DOWN
to the table's hottest band).

---

## 2. Spice is EMERGENT — no engineered escalation  (locked 2026-06-18)

An earlier draft proposed a `spiceTemp` that rose with world age/pressure and bent the curve toward strangeness. **Cut.** That's a pressure cooker that railroads tone.

The decided model:
- Band distribution is **static** per table — a spicy result is simply a rare roll, honestly weighted.
- Spice becomes part of the world **emergently**: a spicy *roll* → a spicy *outcome* → the outcome is written to the **World State Ledger** → that change is now a permanent feature of the world. The world grows richer or stranger only because strange things actually happened and persist — never because a timer forces it.
- **No tonal railroad.** The engine never pushes toward catastrophe or darkness. If the players convert every monster to a friend and build a rainbow utopia, the engine lets them. The world reacts honestly to dice **and** to player choices, in *both* directions. Player tone-agency is sacred.

So Spice = (a) honest rarity grading on rolls + (b) outcomes that persist via the ledger. There is no separate escalation engine, no `spiceTemp`, no world-age input.

---

## 3. Two axes, not one: Spice × Scope

Keep intensity and blast-radius separate.
- **Spice (this ladder)** — *how weird* the result is.
- **Scope** — *how far it reaches*: Local / Regional / Planar / Cosmic (from the Constitution's Escalation Curve). A weird thing in one room (Strange + Local) is not a continent splitting (Mythic + Cosmic).

The **Critical-Magnitude system** (nat 1/20 → second d20) is the one *spike* mechanism — a single roll can momentarily reach high on both axes. That's the honest-dice exception, not a trend. **Full rule now specced: `CRIT-MAGNITUDE.md`** (locked 2026-06-23 — the second d20 scales Standard→Amplified→Mythic = Local→Regional→Planar/Cosmic; 20/20 and 1/1 are mirror Mythic ends written to the Ledger as canon).

---

## 4. Table classes (how much spice a table may roll)

Reuse the Constitution's Table Discipline as a *spice ceiling*:
- **Spark tables** (flavor) — capped low; rarely exceed Textured.
- **Fork tables** (direction) — may reach Strange.
- **Commitment tables** (major consequence) — the only ones allowed to roll Volatile/Mythic.

A smell table can't roll a reality-break.

---

## 5. Player-facing: celebrate intensity, hide content

Two layers, and they are NOT in conflict:
- **Content stays hidden** — the player sees a *fragment*, not the table row. The AI DM reveals the actual result through narration.
- **Intensity is celebrated** — a spicy roll fires a playful exclamation + animation keyed to the band. Anticipation, not spoiler: the player knows the dice ran hot, they just don't yet know *what* it means.

Placeholder band → juice mapping (tunable):

| Band | Exclamation | Animation feel |
|---|---|---|
| Grounded | — | none |
| Textured | a small chime / "hm." | subtle shimmer |
| Strange | "Bizarre…" | glitchy wobble |
| Volatile | "Otherworldly!" | color-bleed pulse |
| Mythic | "SPICY!!" | screen-shake / reality-buckle |

So the band drives **juice** (player-facing); the row content drives **narration** (DM-mediated). You can know a roll was Mythic without knowing what it summoned.

---

## 6. genesis.html integration (build-ready)

- **Data:** the tier column (idx 2) already exists — migrate the 3-value vocab to the 5-band ladder; tag each table with a class (Spark/Fork/Commitment) for its ceiling.
- **Roll function:** keep it simple — static band thresholds per table + class → pick a band → pick a row within it. 100% client-side, free, no API. **No temperature variable.**
- **Emergence:** when a roll lands in a high band and produces a consequential outcome, that outcome is written to the **World State Ledger** as a persistent world feature. That — not a dial — is how spice accumulates.
- **Critical Magnitude:** on nat 1/20, run the second-d20 spike.

---

## 7. Open decisions
1. ~~Static vs dynamic~~ → **RESOLVED: emergent/static, no temperature engine (2026-06-18).**
2. ~~Exact band thresholds per table class~~ → **RESOLVED 2026-07-06: SPICE-RAISE tier weights.**
3. Whether Volatile/Mythic are always-on-but-rare, or the Web doc's **paid-tier** unlock ("full Spice Curve").

---

## Note on sequencing
Spice no longer depends on the world clock. It's just grading + the ledger recording outcomes. The World Clock + World State Ledger remain the next foundational build — but for *their own* reasons (drift, reincorporation, faction clocks), not to drive spice.
