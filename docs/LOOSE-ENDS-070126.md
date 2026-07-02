---
type: system-spec
status: specced 2026-07-01 late night — two small build-ready items closing known open loops
created: 2026-07-01
related:
  - "[[SOCIAL]]"
  - "[[DESIGN]]"
  - "[[WALK-REFRESH]]"
---

# Loose Ends (2026-07-01) — social gifts wiring + Outlandish intrusion hooks

## §1. SOCIAL loose ends (from `SOCIAL.md`'s open list)

- **`codex.gifts[]`** — the gift flag the social spec left unbuilt: an NPC record gains
  `gifts:[{what, day, from}]` written by a small `gift` event (or `codex_update` sugar); a
  standing gift grants the leverage tag the social DC ladder already prices (`applyLeverage`
  consumes it — reconcile the exact lever key). Given = remembered: gifts persist, surface in
  `codexDigest`, and decay only by DM story action, never silently.
- **Tool/DC/charm digest wiring** — the XGtE tool-uses + charm/blessing references the social
  build authored but never surfaced: attach the relevant tool-use options + any held
  charms/blessings to the PC block of the digest (name + one-line effect, by key from the
  compiled tables) so the DM prices checks with them in view instead of from memory.
- Verify: gift → leverage applies in `socialDC` path (mutation check: drop the lever, harness
  fails) · digest carries tools/charms only when held · regression `verify-social` 97/97.

## §2. Outlandish diegetic intrusion (the 2026-06-28 decision, now specced thin)

Source of truth: the `DESIGN.md` decision block (2026-06-28). The build shape:
- **Diegetic reskin at surface-time:** when an Outlandish item surfaces (post-WALK-REFRESH L4
  gating), the DM receives it with a `dm.intrusion` note: present it IN-WORLD (the Mini-Nuke is
  "a sealed brass sun the size of a skull, humming a warning in no language"); the item's real
  mechanics ride `data/items.js`/the row unchanged. Never say the anachronism's name until the
  player has earned it.
- **The intrusion IS a hook:** each surfaced reality-breaking/high-power Outlandish item mints a
  companion thread handle (where did it fall from; who else tracks it) — reuse the
  CONSEQUENCE-LADDER thread-seed sink, spice-gated (utility/combat band items intrude quietly, no
  thread).
- Frontier prose: one DM-BRIDGE runbook paragraph (the presentation register above).
- Verify: reality-breaking surface mints a thread handle; utility doesn't (mutation check on the
  band gate) · the item's mechanical row is untouched by the reskin.
