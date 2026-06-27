---
type: system-spec
branch: Genesis
status: draft
created: 2026-06-21
---

# Difficulty — How the World Calibrates & Answers Challenge

> **Scope (docs/TIER-SCOPE.md, 2026-06-26):** this version caps at **Tier 2 (L1–10)**; power bands top out at the T2 CR ceiling (`meta.crCeiling`). The mandatory **threat-signaling** is now wired for wilderness too (Phase D: every Enemy leg telegraphs danger via the sign-of-passage, fiction-only) — closing the gap where wilderness scaled/signaled nothing.

The world-facing half of advancement. Where `ADVANCEMENT.md` is the consequence *to the player*,
this is the behavior *of the world*: how hard things are, how the world reacts to exploitation,
and how it tells the player when they're in over their head. Consumes `EVENT-CONTRACT.md` events.

## Decisions (locked 2026-06-21)

- **Fixed by default, scaled by narrative exception.** A region has a fixed power identity. A
  town's guards are guards — forever. They do **not** become level-18 super-guards because the PC
  came back at level 12 with a Horn of Blasting. The player's power is real and permanent, and the
  world must honor it (this preserves the world-is-real / anti-drift thesis).
- **No global level-scaling.** Difficulty does not rubber-band to keep every fight winnable.
- **A region may carry a scaling/transformation vector** — but only when the fiction earns it
  (demonic corruption, a villain mechanically/genetically altering creatures). It's an explicit
  tagged exception with a narrative cause, not a global dial.
- **Murder-hobo is a playstyle, not a bug.** It's their world, solo. The system doesn't prevent
  it; it *detects* it and the world *answers*.

## Regional power bands

Each region/node carries (touches `SPATIAL-MODEL.md` — regions become power-bearing objects):

- `power_band` — the fixed baseline challenge identity (e.g. "frontier town: guards CR 1/8–1/2").
- `corruption_vector` *(optional)* — a narratively-justified transformation: `{cause, scale, of}`
  ("a rift's taint, +stat, of the local beasts"). The exception that lets you author danger zones
  without breaking the fixed default everywhere else.

CR is generally **balanced** to the expected challenge of a region — but balanced ≠ always-winnable.
Some regions are simply deadly for a low-level PC, and that's intended.

## Threat-signaling (the non-optional corollary)

If difficulty doesn't scale to keep you winning, the world **must telegraph danger** — otherwise
fatal situations are unfair gotchas instead of meaningful choices. This is the price of the
fixed-world freedom, and it's a feature: it makes *fleeing a decision*, not a punishment.

- The **Fragment oracle carries danger-fragments** ("these aren't soldiers — something moves wrong
  under their skin") so the player reads relative threat *before* committing.
- The DM owes an honest danger read. The player should be able to recognize: this is survivable /
  this is a fight to the death / this is a flee-or-die / there may be a clever way through.
- The three outs — **flee, fight (to glory or death), or find a miraculous way out** (social or
  environmental) — must all be *reachable*. The "miraculous out" is only real if the scene has
  objectified affordances to grab (exits, hazards, NPC motivations, faction levers). That ties to
  `COMBAT.md` scene objectification: the same terrain specs that define cover define escapes.

## Answering exploitation (murder-hobo & friends)

Detection rides machinery that already exists — the faction standing/clocks from `rollStartingState`:

1. **Typed kill events** carry `victimClass` (`monster | hostile | neutral | civilian | authority`)
   and an optional `factionId`. Only some classes feed escalation — killing a goblin ≠ killing a
   baker ≠ killing a guard.
2. Killing a faction's people **accelerates that faction's existing clock** against the PC
   (`clock_advanced`, detected). No new subsystem — it's the faction-clock spine already built.
3. Escalation is **discrete and named, not a continuous dial.** A region can muster only so much
   (its `power_band` × a ceiling); once exhausted it does **not** spawn scaling super-guards. It
   triggers an **authored named response** — a bounty, an inquisitor, a rival who hunts the PC
   across regions. You get a nemesis, not a wall. Far more fun, and it can't spiral into an
   unwinnable infinite-army arms race.
4. **Finite targets self-limit the grind.** A fixed region has a finite population; you run it dry,
   and then the consequence arrives. The world running out of bodies is the natural damper —
   no anti-grind *rule* required.

## Adjudication ladder

Script is the **default container**; the DM is the **exception handler**. The goal isn't 100%
coverage — it's making the script's coverage wide enough that DM calls are rare and consistent.
When the DM must rule on an undetermined situation, it emits an `adjudication` event and the ruling
is logged as canon precedent (see `EVENT-CONTRACT.md`), so the same situation resolves the same way
next time. The game doesn't have to be unbreakable — it has to be responsive.

## Worked examples (test fixtures)

1. **Level-12 PC blasts the town that wronged them.** Guards stay guards (`power_band` fixed). The
   PC wins easily — that's the point; their power is real. Consequence is *narrative/escalation*
   (the realm's authority responds with a named force), not stat-inflated guards.
2. **A forest touched by a rift.** `corruption_vector` set → its beasts are narratively stronger,
   signaled by danger-fragments at the tree line. A low-level PC who reads the signs can choose to
   leave. One who pushes in finds a genuine flee-or-die.
3. **Serial baker-murderer.** `kill{civilian}` ×N → town-watch clock fires → bounty hunter
   (named response) appears, not level-scaled guards. The PC has become a legendary mass murderer
   with a price on their head — exactly the playstyle, with teeth.

## Open questions

- The escalation **ceiling formula** per region (how much can a place muster before the named
  response, and what determines *which* named response).
- Where `power_band` / `corruption_vector` live in the spatial schema (`SPATIAL-MODEL.md` edit).
- How explicitly to surface threat level to the player — pure fiction (fragments only) vs an
  optional UI tell. Leaning fiction-only to preserve immersion; flagged.
