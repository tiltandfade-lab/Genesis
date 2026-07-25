---
type: system-spec
status: specced 2026-07-01 late night — build-ready EXCEPT the drift + life-event tables (5-band samples in §7 await Adam's voice review; faction-outcome table = PROVISIONAL draft OK). Builds AFTER the overnight batch + WALK-REFRESH (recall extends the gen handshake).
created: 2026-07-01
related:
  - "[[DESIGN]]"
  - "[[ON-DEMAND-GEN]]"
  - "[[CONSEQUENCE-LADDER]]"
  - "[[STARTING-STATE-MODELS]]"
  - "[[TRAVEL-WALKS]]"
  - "[[SPICE-CURVE]]"
---

# The World Turn — change-over-time, unified

## §0. What this is + Adam's forks (2026-07-01)

The last unbuilt pillar: worlds persist forever, but today they barely MOVE — the reincorporation
oracle, world drift between visits, NPC life-events, and real faction-turn effects (splinter/merge
are logged but never mutate) were four separate roadmap lines. They are ONE system: **the world
advances by script-rolled Turns at defined triggers, everything lands in the ledger, and the DM
narrates FROM rolled change — never invents it.** The ledger reserved `drift` and `npc-life` entry
types on day one; this spec finally uses them.

| Fork | Adam's call |
| --- | --- |
| Offscreen mortality | **Anyone can die offscreen — capture the fallout.** An offscreen death/vanishing of a thread-linked NPC auto-spawns a successor thread (who killed / what's left / who inherits). Hard-and-dangerous honored; threads transform, never silently vanish. |
| Drift dial | **Conservative curve, wide tail — but ROLLED CANON OVERRIDES THE CURVE.** Most revisits feel continuous; a season away feels like time passed. When prior rolls already promised instability (a near-full or fired clock bound to the place, a DM-held doom, a prior rolled outcome), the drift roll MANIFESTS that canon — escalation is mandatory, never dampened. What the dice established, stays. |
| Recall surfacing | **Both**: a DM-pulled `recall` kind on the gen handshake AND a one-candidate lull nudge in the digest (rides the sessionLean lull machinery; a whisper, never a mandate). |
| V1 scope | **All four subsystems, thin** — their value is feeding each other: a faction takeover IS drift IS a life-event IS recall fodder. |

## §1. Triggers (all script-side; no new DM events — the Turn runs in-app like `ssFactionTurn` does today)

- **T1 — long elapse:** `passTime("montage")` already ticks a faction turn + one pressure clock;
  the Turn deepens it (faction outcomes §3, life-event eligibility §4).
- **T2 — the session seam:** `seamHarvest`/`beginSession` weave (built) gains the Turn's
  since-last-session summary in `carryForward`.
- **T3 — revisit-after-absence (the core):** stamp `node.lastVisitDay` on every arrival/departure.
  On arrival at a known node, `elapsed = clock.day − lastVisitDay` → drift resolves **lazily,
  right then** (§2). Nothing simulates in the background — the anti-drift masterstroke is that
  the script rolls "what changed" only when someone is there to see it.

## §2. Drift on revisit — conservative curve, canon override

**Bands (default):** `<3 days` no roll · `3–13d` 1 roll, Grounded-weighted · `14–89d` 1–2 rolls,
normal curve · `90d+` 2–3 rolls, full curve live.

**The escalation override (Adam's rule):** if the node has (a) a bound front/faction clock ≥ ⅔
full, (b) a fired clock not yet manifested, (c) a DM-held doom targeting it, or (d) prior ledger
canon marking instability → **+1 roll and the spice floor rises to Textured; a FIRED clock's drift
roll doesn't re-decide the outcome — it manifests the already-rolled doom.** Drift may never
contradict or soften established canon (mutation-check target).

**Mechanics:** roll the new **`place-drift`** table (d100, Commitment-class, spice-graded — §7
samples gate the authoring; wiring ships null-safe like the walk skins). Each result → a ledger
**`drift`** entry + matching codex updates (`status.at`/`condition`/faction flag) + a gazetteer
note. **Digest:** arrival turns carry `arrivalBrief` (this node's unrevealed drift entries,
dmOnly until narrated) — the DM narrates the return FROM it.

## §3. Faction turns grow teeth

When an agenda clock **fires** (today: logged only): roll the new **`faction-outcome`** table
(d20, PROVISIONAL Sonnet draft acceptable — mechanical register, low voice-criticality):
`advance` (agenda achieved → permanent canon mark + re-roll a NEW agenda, identity persists) ·
`setback` (clock resets, method hardens) · `splinter` (mint a rival faction from the SS faction
tables, parent loses a tag) · `merge` (absorb the weakest rival; combined tags) · `takeover`
(dominant flag moves) · `collapse` (faction → historical; codex record persists as recall fodder).
**These MUTATE `w.factions` + the map/codex** — no more inert logs. All outcomes ledger as
`clock`+`outcome`, veiled from the player until discovered (the reveal arc as usual).

## §4. NPC life-events — known faces move through time

- **Eligible:** `status.known` NPC records only (soft NPCs recycle as today, no biography).
- **Trigger + rate (thin v1):** at T3 with `elapsed ≥ 14d` — ONE salience-weighted known NPC at
  that place rolls on **`npc-life-event`** (d100, spice-graded; §7 samples gate it): moved /
  prospered / ruined / married / ill / promoted / vanished / died / …strange fates in the tail.
  T1 months-long montages roll likewise.
- **Fallout capture (the mortality rule):** death/vanishing of a **thread-linked** NPC auto-mints
  a successor thread handle (rolled: cause-shape / what-remains / who-inherits) linked to the
  deceased's record — a `npc-life` ledger entry + a codex thread the recall oracle can surface.
  Nothing load-bearing disappears without leaving a door.

## §5. Recall — the reincorporation oracle (extends ON-DEMAND-GEN)

- **`gen` gains `kind:"recall"`** — the mirror of minting: `opts {kind?, tag?}` → a
  **salience-weighted draw over KNOWN/hard codex records + ledger canon** (weights: `seamSalienceOf`
  + recency decay + link degree + open-thread bonus; excludes entities present in the current
  scene). Returns the record ref + the WHY ("unresolved: the lover's passage") in `digest.minted`
  form (`genRef` marks it a recall, not a mint). Never returns soft/unknown records — recall
  surfaces the world the player has TOUCHED.
- **The lull nudge:** the digest's lean block gains `echo` — ONE candidate (`{id, name, why}`,
  ~80 bytes) present only when the lull machinery is active. Runbook register: "the world could
  rhyme here" — ignorable, never a mandate.
- **Runbook preference order (frontier prose):** recall → reserve/ambient pool → gen mint →
  freehand-in-a-bind. Prefer the world's own history to invention — the world starts rhyming
  with itself.

### §5a. The preference order governs ALL WALKS + the freshness valve (Adam rulings 2026-07-24, golden-sites session)

Three rulings, made while wiring golden-site inhabitants (the monastery was the test case;
the cascade serves all twelve sites — camp squatters, lair occupants, checkpoint garrisons):

1. **Scope extension:** the recall → pool → mint → freehand preference order applies to
   **every walk** — including the moment a site is first minted and its occupants rolled.
   "Who lives here" checks the ledger before touching the dice.
2. **The freshness valve:** a **guaranteed fresh roll every X walk segments** — the engine
   must skip the recall preference and mint new at least that often, "to prevent stale
   story beats and introduce fresh story elements" (Adam, verbatim intent). X is a tunable,
   playtest-calibrated like other numbers; the valve keeps remember-first from turning the
   world into a closed loop of its own reruns.
3. **Lock vs lean:** established WRITTEN facts LOCK the answer outright — if the ledger
   already names who is here, there is no roll. Regional canon (faction web, pressures)
   only LEANS the fresh roll's weighting — it tilts odds toward established powers but
   never forbids a surprise independent. Canon stays sacred; dice stay honest.

Spice interaction (no new law — SPICE-RAISE governs): site-occupant tables are
Commitment-class (full ladder ceiling), authored with all-band coverage; the play
distribution comes from the REGION's band weights (baseline 25/25/25/17/8 → rim), so the
same site table rolls mostly ordinary in the heartland and mostly wrong at the rim.
Teeth owed: a check proving site/walk rolls consult recall before minting, and that the
freshness valve actually fires every X segments.

### §5b. The walk-out montage (ADOPTED — Adam 2026-07-24, "a decent compromise")

Leaving an interior through known ground or a discovered exit is ONE declared montage
beat ("you make your way out — an hour passes"), with three binding strings:

1. **Only over known ground.** Montage-out covers rooms already walked or an exit
   already found — never unseen space. No teleporting past the unknown; FFT's full
   overworld hand-wave is explicitly NOT adopted (our space is persistent and honest).
2. **It costs real time.** The clock advances by the transition; the ledger logs the
   transit. The walk happened — the player just didn't click it.
3. **The world may interrupt.** If state says the way out isn't safe (alerted garrison,
   pursuit, drift, a collapse behind the party), the montage BREAKS into a scene. The
   drift-on-revisit machinery (§2) is the natural cash-in point: the montage is cheap by
   default, and the engine spends state changes when it holds them.

Composes with the golden-sites SHORT-EXIT GUARANTEE (every chain's far end offers a
short way out): the guarantee makes the exit CLOSE; the montage makes the walk to it
cost nothing when nothing changed. Teeth owed: montage-out refuses unknown ground
(countable), and interrupt fires when qualifying state exists.

## §6. Build plan (day-2/3 unit; after the batch + WALK-REFRESH)

1. `node.lastVisitDay` stamps + `worldTurn(w, trigger, ctx)` orchestrator (`src/world/`,
   pattern of `ssFactionTurn`, which it subsumes/extends).
2. Drift bands + escalation override + `drift` ledger writes + `arrivalBrief` digest block (§2).
3. Faction-outcome roll + the real mutations (§3) — reuse the SS faction tables for splinter
   minting.
4. Life-event roll + fallout thread capture (§4).
5. `recall` kind in the gen loop + the salience draw + the `echo` lull nudge (§5).
6. Frontier prose: the recall preference order + arrivalBrief/echo runbook register.
7. Tables: `place-drift` + `npc-life-event` **gated on §7 sample review**; `faction-outcome`
   provisional draft. All wiring null-safe until compiled.
8. `dev/verify-world-turn.mjs`: band counts per elapsed fixture · **escalation override forced by
   a ⅔ clock (mutation check: remove the override, harness fails)** · fired-doom drift manifests
   the doom verbatim (never re-rolls it) · splinter actually adds a faction / collapse removes +
   preserves the codex record · life-events touch only known NPCs · thread-linked death spawns the
   successor thread · recall never returns soft/unknown or scene-present records · `echo` appears
   only in lull states · full-sweep regression green.

## §7. 5-band samples — FOR ADAM'S VOICE REVIEW (gate on the two voice-critical tables)

**Place Drift**
- *Grounded* — **Prices crept.** The ferryman's rate is up two coppers and he blames the season; the inn repainted its door; someone you knew by face has moved on.
- *Textured* — **New colors at the gate.** A faction's mark flies where it didn't — small, official, freshly sewn. People say the word "arrangement" carefully.
- *Strange* — **The well changed its taste.** Sweetwater gone mineral-sharp overnight, and the oldest dogs won't drink it. A dowser was sent for; she left without her fee.
- *Strange* — **A street is gone.** Burned, or bought and razed — accounts differ and both camps are afraid of the same name. The gap smells of cold ash and lamp oil. (Reclassified 2026-07-03 from the original Volatile draft — per `docs/SPICE-RULER.md`, this is aftermath, not present-tense motion: the street burning would be Volatile, the burned street is Strange.)
- *Strange* — **The town has a second shadow at noon.** Everyone's, cast the wrong way, pointing at the same hill. The temple posts a rota so no one has to be alone when they check. (Reclassified 2026-07-03 from the original Mythic draft — per `docs/SPICE-RULER.md`, this is a permanent oddity the town has CONTAINED and accommodated (the rota), not permanence-and-remaking: Strange with tenure.)

**NPC Life-Event**
- *Grounded* — **Prospered, modestly.** A better stall, a second apprentice, a new coat. They remember what they owe you and mention it first.
- *Textured* — **Married into the rival house.** The wedding was quick and the dowry political; their old friends split over it, and they watch doors now.
- *Strange* — **Took ill in a way physicians argue about.** Fevers on the new moon, lucid otherwise; they've begun paying debts early and labeling shelves.
- *Volatile* — **Vanished between market days.** Room paid through the month, meal half-eaten, no note — and someone else asked after them first, by a name you didn't know they had.
- *Mythic* — **Died — and attends their own grave.** Seen at dusk, unaging, polite, refusing all questions. The priest has stopped charging the family for candles.

**Review protocol:** keep / redirect / kill per row + voice notes; full d100 authoring per table
follows the verdict. `faction-outcome` (mechanical register) doesn't need samples — provisional
draft with the build.
