---
type: session-handoff
project: Genesis
status: AWAITING ADAM — present this verbatim at the next session open, then record answers per the decision-capture rule
created: 2026-07-17 (night)
context: Adam's night rulings are recorded (ART-DIRECTION-CANON.md "NIGHT RULINGS"; DESIGN.md 2026-07-17 night; KGR8-KENNEY-SHELL-REBUILD.md amendment header; KGR8-CODEX-ASSESSMENT.md adopted). These are the follow-up questions he asked to be re-prompted with. Nothing builds until he rules; then the 5x5 clay proving room begins.
---

# KGR-8 — the exact response Adam asked to be re-prompted with

Everything you ruled is now law on the lane — verbatim in [ART-DIRECTION-CANON.md](/Volumes/Genesis/Genesis-kgr4c/docs/ART-DIRECTION-CANON.md) under "THE NIGHT RULINGS," folded into [DESIGN.md](/Volumes/Genesis/Genesis-kgr4c/docs/DESIGN.md) and the [KGR-8 spec](/Volumes/Genesis/Genesis-kgr4c/docs/KGR8-KENNEY-SHELL-REBUILD.md), with the Codex assessment ported onto the integration branch (tip `2e51e7f5`). The prototype-proof law also went into my persistent memory so every future session starts already bound by it.

Now your questions back to me, answered straight:

**What is the Ivory Pit?** It's a real world the game itself rolled. When I built the acceptance rig last session, it booted the actual game — character creation, world roll, session prep, all production dice — and the world that came out was named "The Ivory Pit" by your own generators. Its dungeon walk is the room you've been looking at in every recent frame (the willow room). I saved the entire world to a file so we can re-render the *same* world after every engine change — that's how the before/after cards compare one identical room instead of two different rolls. It's just our test world; nothing special about it except that it's frozen.

**Where did the five-room fixture come from?** The Codex assessment proposed it — deterministic five-room and fourteen-room test dungeons, echoing the boards from your ChatGPT/ImageGen experiment. They don't exist yet. Under your new law they come *after* the single clay room proves, not before.

**Corridors — the easiest option:** short connectors, definitively. The kit's corridor grammar is literally made of short pieces (corridor, corner, end, junction), a 1–3 cell connector needs almost no coverage solving, and it kills the tunneling-through-rooms bug as a side effect. Long snake corridors are the *harder* path. So: short sealed connectors now, your corridor rollers (wide/trapped/narrow) as their own table lane later — that one's yours to author when we get there.

**The palette roller:** partially exists. Every walk already rolls a skin (flavor + intensity band), a realm, and per-segment light profiles — but nothing rolls a *structural* palette yet. Plan: derive the palette deterministically from the walk's existing rolled identity for now (no new dice), and when you want variety, you author a small palette table the walk rolls — that's table work, your domain.

**The sprite thing that caught light:** two threads, honestly. Sprites *do* respond to scene light today (that landed — they darken in corners, catch torch warmth). What was lost is the **extruded-prop pilot** — the shield test where the sprite became a thick piece whose beveled sides caught directional light. It was proven on a branch, then parked behind a taste-gate that never got scheduled. Your composed-standee ruling un-parks exactly that tech. And normal maps were specced for walls/floors (your 2026-07-11 ask), then "upgraded" into a bigger material system that never shipped. Both revive as test cards.

## Follow-ups — you told me not to assume, so I won't

**The proving room itself:**
1. Draft contents for the 5×5 clay card set: (a) clay kit-built shell + one 5ft door, (b) same shell + faint grid, (c) normal-map on/off/strong three-way, (d) decal samples at 3 sizes, (e) one wall relief, (f) one extruded environment sprite at a composed angle, (g) one extruded character at a composed angle with the mirrored back visible in a second shot, (h) one Kenney prop (barrel). Each its own card, then one dressed combined room. Anything missing, anything you'd cut?
2. The proving room is a hand-authored dev fixture, not a rolled walk — fine, since it's a proving ground and not gameplay evidence? (Rolled-walk acceptance stays the *final* gate per §15; the clay room is the *first* gate.)

**Fixed camera:** 3. "Fixed" = the current angle exactly as-is for now, and rooms get composed for it? Or do you want to hand-pick the locked angle from a short card (current angle ± a couple of pitch options) once the clay room exists — one decision, then frozen?

**The grid:** 4. Faint grid always-on during exploration, or subtle in exploration and stronger in combat? 5. Lines across the whole floor, or just edge ticks with lines appearing under measurement/movement?

**Decals:** 6. Size — should a decal noun carry a rolled size band (a blood splat rolls 1–3ft, an eldritch circle rolls 8–15ft), or fixed sensible sizes per noun class for now? 7. Can decals rotate freely (any angle) since they're flat on the floor, or snap to the grid's orientation? 8. May decals overlap each other and run under props, like real stains would?

**Characters:** 9. The mirrored back means text/asymmetric details flip (a sword swaps hands when seen from behind) — acceptable interim jank? 10. Who owns each piece's composed angle: deterministic staging (seeded per room, so it's stable) with combat overriding toward facing-the-enemy? Or should characters subtly rotate to face whoever they're interacting with?

**Normal maps:** 11. The three-way card (off / subtle / strong) decides intensity — but confirm the *scope*: walls and floors first, props later, characters never?

Answer whenever — nothing builds until you've ruled. Next session opens with the clay room, and its first card is the smallest thing that can possibly be judged: one kit-built room, one door, clay grey, your camera. That card either looks constructed on purpose or we stop and fix it *there*, in a 5×5 sandbox, instead of four units downstream.
