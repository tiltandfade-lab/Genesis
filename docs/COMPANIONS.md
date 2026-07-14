---
type: system-spec
status: specced 2026-07-01 night — build-ready EXCEPT the sidekick class data (vision-read extraction step, §3). Day-3 unit (composes with ECONOMY-SINKS, MONSTER-TACTICS, ON-DEMAND-GEN, REPUTATION, COMBAT-TRACKER).
created: 2026-07-01
related:
  - "[[MONSTER-TACTICS]]"
  - "[[ECONOMY-SINKS]]"
  - "[[ON-DEMAND-GEN]]"
  - "[[SOCIAL]]"
  - "[[COMBAT-TRACKER]]"
  - "[[DM-CHARTER]]"
---

# Companions — hirelings + the one sidekick

## §0. Adam's fork (2026-07-01): **hirelings + ONE sidekick slot**

Two tiers, both real economy sinks, both with death that stays dead (rebirth is PC-only):
- **Hirelings** — non-leveling specialists; wages; loyalty; **tactics-engine-driven** in combat.
- **The sidekick** — ONE slot; a Tasha's-model leveling companion; **player-driven** in combat;
  a bond, not a payroll line.

## §1. Hirelings

- **Minting:** always a ROLLED NPC (the ambient pool / gen handshake — never freehand; a
  hireling arrives with flaw/bond/fear/leverage/want like anyone). Hiring is a SOCIAL
  negotiation (the parley system prices it; leverage/gifts apply).
- **Roles + wages** (`data/economy.js` constants, charged at montage/downtime with lodging):
  `porter/torchbearer` 1 gp per 2 days · `skilled` (guide, smith, medic) 2 gp/day ·
  `blade` 2 gp/day + a share claim on loot (the DM negotiates the share — runbook).
- **Loyalty** — a 0–6 clock per hireling (start 3), moved by: paid on time (+) · unpaid (−, and
  compounding) · led into danger beyond the bargain (−) · gifts (+, `codex.gifts[]`) · the PC's
  renown valence with the hireling's faction (±1 bias at hire).
- **Loyalty consumes into MONSTER-TACTICS morale:** hireling morale rolls take `loyalty−3` as a
  modifier; loyalty 0 = desertion at the next safe moment (a `npc-life`-style ledger entry, a
  grievance that feeds Distant Word and REPUTATION — deserters TALK) · loyalty 6 = one
  heroic-stand pass (auto-pass one morale trigger, once).
- **Combat:** hireling turns run the tactics engine ally-side (propose → resolve like trash
  autoplay; open rolls in the feed). The player commands INTENT ("hold the door"), never the
  per-action minutiae — the script owns their moves, loyalty owns their nerve.

## §2. The DM address protocol (Adam's explicit ask — frontier prose, DM-CHARTER §3 addendum)

- **Second person ("you") is the PC. Only. Always.** Companions are named third person in every
  narration ("Vess drags the gate shut behind you").
- **The player OWNS companion actions; the DM OWNS companion voice.** Player declares what the
  sidekick/hireling does (their hands); the DM speaks their dialogue, reactions, and fear (their
  heart — an NPC with handles, per the codex model). The DM never decides a companion's ACTION
  in the player's stead except where loyalty/morale mechanics say the companion refuses — and
  then the dice said it, not the DM.
- **The player rolls the sidekick's dice, openly** — sidekick checks/attacks ride the same
  `rollRequest`/dice-tray machinery, labeled with the sidekick's name. Hireling dice are
  script-rolled (they're tactics-engine actors).

## §3. The sidekick (Tasha's model, IP-clean)

- **Creation = promotion:** the sidekick is a PROMOTED existing codex NPC (CR ≤ 1/2 stat base —
  `resolveCreature` provides it) + one sidekick class: **Warrior / Expert / Spellcaster**. The
  best moment in the system: the rolled stranger you kept talking to becomes the one who stays.
- **Leveling:** sidekick level = PC level (levels at the same rest-gate; its picks are
  DM-narrated v1, same as the PC's interpretive picks pre-picker).
- **Data extraction (build step, gotcha-bound):** the sidekick class progressions come from
  Tasha's in `Reference/` — **scanned book: VISION-READ the class tables, never trust the OCR
  text layer** (the standing MM/DMG/PHB rule). Emit `data/sidekick-classes.js` via a
  `build/gen-sidekicks.py` with a header stamp; **mechanics faithful, prose ORIGINAL** (the
  genericization discipline — re-voice every feature description; no Tasha's text verbatim).
- **Bond, not wage:** the sidekick uses the loyalty clock but starts at 5, is pay-immune, and
  moves on treatment/danger/gifts only. Loyalty 0 for a sidekick = they LEAVE (a full
  `npc-life` departure with a fallout thread — it should feel like a breakup, not a resignation).
- **Death is death.** No bardo (PC-only). A sidekick death mints a grief thread (WORLD-TURN
  fallout-capture machinery) and the codex record persists — recall will bring them back as
  memory, not miracle.

## §4. UI (Claude's lane; asset-light)

- **Sidebar party strip:** under the PC block — one compact row per companion (name, role glyph,
  mini HP bar for the SIDEKICK (player-side numbers are open), a loyalty pip row for hirelings
  (coarse: low/steady/true — never the number), conditions).
- **Combat tracker:** ally chips render in their band lanes next to the PC (sidekick with HP bar;
  hirelings with the state-word only). The no-foe-HP rule is untouched — ALLY numbers are the
  player's to see; only the sidekick's are exact.
- **Sheet tab:** the sidekick gets a mini-sheet subpanel (stats, class features from
  `data/sidekick-classes.js`, its equipment via the existing ITEMS instances).

## §5. Build + verify

1. `w.companions = {sidekickId, hirelings:[{codexId, role, wage, loyalty, hiredDay, shares}]}` +
hire/dismiss events (`hire`, `dismiss`, `companion_update`). 2. Wage charging in the montage/
downtime path (with lodging; unpaid compounds loyalty). 3. Loyalty→morale modifier + desertion +
heroic stand. 4. Sidekick promotion flow + `gen-sidekicks.py` (vision-read) + level-with-PC.
5. Party strip + tracker ally chips + mini-sheet. 6. Frontier prose: §2 protocol + hire-share
runbook. 7. `dev/verify-companions.mjs` (≥10/0): hire requires a rolled codex NPC (mutation
check: allow a freehand hire, harness fails) · wages charge + unpaid compounds · loyalty
modifies morale; 0 deserts w/ ledger+thread; 6 passes once · sidekick slot is singular (second
promotion refused) · sidekick levels with PC · death mints the grief thread, no rebirth ·
ally chips show sidekick HP but never hireling numbers · regression: combat/economy/social
suites unchanged.

## §6. Acceptance

You can hire spears, and they'll break if you spend them like arrows. And somewhere around
session three, a rolled stranger with a flaw you liked becomes the one who carries the torch —
until the day the dice, not the DM, decide they've had enough. Grief with a paper trail.
