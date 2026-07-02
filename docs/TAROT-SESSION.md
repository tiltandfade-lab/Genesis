---
type: system-spec
status: specced 2026-07-01 late night — Majors samples (§4) await Adam's review; minors mapping build-ready. Day-2+ unit.
created: 2026-07-01
related:
  - "[[CONSEQUENCE-LADDER]]"
  - "[[WORLD-TURN]]"
  - "[[SPICE-CURVE]]"
  - "[[DM-CHARTER]]"
---

# The Session Draw — tarot as the session's mutator

## §0. Adam's forks (2026-07-01)

| Fork | Call |
| --- | --- |
| Mapping | **Hybrid.** The 22 Majors get bespoke authored mutators (×upright/reversed = 44 entries, samples-first §4); the 56 minors map mechanically by suit × rank × reversal. Craft where it counts, math where it scales. |
| Reveal | **Card shown, meaning veiled.** The RWS art renders at session start + a fragment-level omen line; the mechanical mutator is DM-side. The player reads the session through the card in hindsight (slow-drip). |

**Assets:** Rider-Waite-Smith is public domain (US 1909; PCS d.1951 → PD worldwide since 2022).
Bundle the 78 scans keyed per the batch-1 asset-isolation pattern (`ui-sketches/` raws preserved,
trimmed/keyed copies wired).

## §1. The core rule — the card mutates the ROLLERS, never the tables

No row anywhere changes. The draw yields a **session parameter vector** consumed by machinery that
(after tonight's specs) already exists:
- **Suit → domain weight:** Swords = threat/combat (archetype-pool + encounter-type weights up) ·
  Cups = social/NPC (ambient pool +1, attitude events likelier) · Coins = economy/loot (stock
  quality, valuables chance) · Wands = magic/strange (spice-tail weight on skins/drift).
- **Rank → intensity:** Ace…King scales the nudge (spice floor/ceiling shifts, clock-tick
  weights). Court cards additionally bias toward a PERSON as the vector (the domain arrives
  embodied — feeds recall/ambient casting).
- **Reversal → valence:** the domain arrives as trouble vs. opportunity (e.g., reversed Coins:
  the money is the problem — debts, gouging, a broke merchant).
- **Majors → the authored mutator** (§4): a bespoke, script-executable directive with named
  parameters — allowed to do things minors can't (touch clocks, threads, the fray).

## §2. Wiring

- **Draw at `beginSession`** (1 card, upright/reversed 50/50, true random). The vector becomes an
  INPUT to `seamProposeShape` (one lean system, not two competing ones — the card colors the
  proposal; the override hierarchy player→situation→lean is untouched).
- **Player surface:** the card art + its omen line (a FRAG-style 6–10 words per card — 78 to
  author in the fragment-batch lane) rendered as the session's frontispiece. No mechanics shown.
- **DM surface:** `digest.sessionLean.card = {name, reversed, omen, mutator}` — rides the existing
  lean block (post-DIET slim).
- **The mutator applies all session**, then dissolves at `endSession` (seamHarvest notes whether
  it visibly landed — telemetry for tuning the vectors).

## §3. Build plan + verify

1. Card data (`data/tarot.js`: 78 entries — name, asset key, suit/rank/major, omen, majors'
   mutator refs). 2. Draw + vector assembly + `seamProposeShape` input + digest block. 3. Roller
hooks: archetype-pool weight param, skin/drift spice nudge, stock/valuables param, ambient-pool
size param (each a small multiplier read, default 1.0 — zero behavior change without a draw).
4. Frontispiece render (asset-light chrome; the card IS the art). 5. Majors authoring post-§4
approval; minors = pure code. 6. `dev/verify-tarot.mjs`: vector math per suit×rank×reversal ·
defaults inert without a draw (mutation check: leak a nudge with no card, harness fails) · Majors
mutators parse + apply · omen renders, mechanics never in player DOM · seam integration doesn't
double-lean.

## §4. MAJORS SAMPLES — FOR ADAM'S REVIEW (5 of 22; the gate on Majors authoring)

- **The Tower (upright)** — *Omen: "Something long-standing has been leaning for years."* Mutator: the script advances the FULLEST clock to firing this session; the session opens with the crack, not the fall.
- **The Tower (reversed)** — *Omen: "The crack runs through your own floor."* Mutator: the breaking thing is the PC's — a bond, an asset, a standing; softer landing, longer debris (a thread mints from the wreckage).
- **The Moon (upright)** — *Omen: "Two roads tell two truths tonight."* Mutator: distortion doubles — every Distant Word this session rolls two lenses; ONE digest fact is flagged `possiblyFalse` (DM knows which; the script picked it).
- **Death (upright)** — *Omen: "An ending has been patient long enough."* Mutator: the script nominates the OLDEST open thread for closure; walks, drift, and recall all bias toward it — it ends this session, one way or the other.
- **The Sun (reversed)** — *Omen: "No shade anywhere today."* Mutator: everything is seen — stealth-type checks +2 DC, every Strange+ roll surfaces a secret (the script pulls one from a `dm` field), and NPCs notice what the party carries openly.

**Review protocol:** keep/redirect/kill + voice notes → the remaining 17×2 author to verdict
(Sonnet-to-voice, the approved five as anchors + few-shot).
