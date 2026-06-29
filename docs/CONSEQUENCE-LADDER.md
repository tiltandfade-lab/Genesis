---
type: system-spec
status: specced (draft) — art = pilot consumer
created: 2026-06-29
related:
  - "[[SPICE-CURVE]]"
  - "[[DM-CHARTER]]"
  - "[[CODEX]]"
  - "[[EVENT-CONTRACT]]"
  - "[[REAUTHORING-RUBRIC]]"
  - "[[DESIGN]]"
---

# Genesis — The Consequence Ladder

*How a spice-graded roll earns **mechanical weight**: the rule that turns a flavor roll into an
optional, player-pulled thread that loops back into the story — without spawning a fractal of
infinite content. The promise `SPICE-CURVE` always made ("a spicy roll → a spicy outcome → written
to the Ledger"), finally given a model. **Art Depiction is the pilot consumer; the model is
corpus-wide.** Designed with Adam as lead designer, 2026-06-29.*

> **Build posture (MVP, per `[[feedback-genesis-mvp-depth-over-breadth]]`):** build the spine, defer
> the rich layers until live play proves them thin. Most rolls plant **nothing** — that's the point
> (*"sometimes a statue is just a statue"*). This is a depth pass on systems we already have (codex,
> fronts/clocks, the Ledger, the crit/Mythic-canon path), **not** a new parallel system.

---

## §1. The thesis — content grows on DEMAND, not SUPPLY

The anti-fractal answer is not "fewer tables." It is **what gets to become real content.**

- **Supply-side (the failure mode):** the dice mint a mystery, and nothing gates whether it ever
  pays off. This is *Lost*'s four-toed statue — intrigue with no demand-gate, orphaned forever.
- **Demand-side (the win):** a thread grows **only because the player keeps spending attention on
  it.** This is the *Critical Role* table-slogan — it became canon because the players invested.

So: **rolls supply cheap, inert *handles*; only player attention (or a deliberate DM bind) spends the
effort to grow one into a thread.** The branching factor is gated by a *finite* resource — player
interest — so the surface that becomes real content is self-limiting by construction. You can roll a
thousand handles and the world never fractals, because only the handful the player won't let go of
ever become threads. (Solo-game caveat: the group-slogan dynamic is weaker with one player + an AI
DM; we do our best — the AI plays the continuity, and we aim the system at honoring *the solo
player's own* fixations. `[[feedback-genesis-hard-and-dangerous]]`: keep the world deadly so the
boons this system grants actually matter.)

## §2. Two decoupled axes — `band` ≠ `legs`

The spice band and the story-potential are **different axes**, and conflating them misallocates
weight. (Proof: the **Textured** "Off-Hand Saint" is a richer faction-motif hook than the **Strange**
"Sea Indoors" — low image-strangeness, high story-potential, and vice-versa.)

- **`band`** — *image rarity* (Grounded → Mythic). What we already grade. Governs how *strange the
  thing looks*, and its **ceiling** of consequence.
- **`legs`** — *story-potential*, authored per row: **`dead-end` · `hook` · `thread-seed`** (+ the
  Mythic special `canon-shift`). **Consequence routes on `legs`, not band.** A `dead-end` plants
  nothing no matter how strange it looks.

Most rows are `dead-end` *on purpose* — the slot-machine fruit. This is also what dissolves the
storage tension (§5): we *want* most rolls inert.

## §3. The chain

A flavor roll that has `legs` runs a four-step chain:

1. **Image** — the authored table row (what the player perceives). *(The Art Depiction row.)*
2. **Effect / Meaning** — what it actually *is* and *does* (the "why"). Rolled on a pooled effect die
   **or** AI-generated on the fly (§8). Authored to the **Hungering Stone standard** (§8).
3. **Consequence** — what it does to the story, sized by `legs` (clamped at the `band` ceiling).
4. **Sink** — it must terminate in exactly one of three sinks (§4). **It may not spawn another
   consequence-roll.**

`legs` → consequence sizing:

| `legs` | plants | typical sink |
|---|---|---|
| `dead-end` | nothing (narrated, forgotten) | — |
| `hook` | a **handle** — a flagged, manipulable codex detail, inert until pulled | A |
| `thread-seed` | a **lead** (bind-first to a live thread, else a soft new one) — and a **front + clock** (the `band` sets how *intensely* it bends reality, not whether the clock exists) | C, else A; B for a closed payoff |
| `canon-shift` (Mythic) | a **Ledger-canon** world fact (may be retroactive) | (canon) |

## §4. The three sinks + the Diversion Rule (the anti-fractal law)

Every consequence resolves into **exactly one**:

- **(A) Handle** — flagged in the codex, **inert**. Waits to be pulled. (Most things.)
- **(B) Closed local event** — a *mechanical* action that resolves here / next-room and **ends** (the
  Elder-Scrolls self-contained diversion). Fires as a typed **`EVENT-CONTRACT`** event, not narration.
- **(C) Bind** — attaches to an **existing** main/side quest, front, or codex entry (reincorporation
  — the loop-back Adam wants by default).

**The Diversion Rule:** a consequence resolves to A, B, or C and **may not schedule another
consequence-roll** — *effects never beget effects.* A **new persistent thread** may open **only at
`legs: thread-seed`**, and it **must carry a clock** (a defined number of ticks to resolution = a
built-in end). The **`band` sets the clock's *intensity*, not its existence** — a Strange-band
thread-seed runs a Strange-intensity clock; a Volatile-band one strains reality. (So we **don't**
re-band a row to give it a clock; the clock comes from `legs`. Decoupling, kept honest.) Growth
happens through **salience and binding** (§7), never auto-spawn.
This is the rule that makes "infinite content" impossible: the only engine of growth is finite player
attention.

## §5. Codex entries are HANDLES, not facts — and storage is interaction-gated

**If an entry can't be manipulated to feed the story, it shouldn't exist.** ("No four-toed statue" —
don't canonize what you won't pay off.) Therefore:

- **`dead-end` rolls are narrated and forgotten — not stored.** The market scene, the founder's
  statue: atmosphere, no codex entry.
- **Storage is gated on *interaction*, not band.** When the player actually engages a thing
  (examines, asks, returns), it becomes a codex **handle** — *any band*. The dice never pre-decide
  what is eligible to matter; the **player** does. (This resolves the supply/demand contradiction:
  storage is demand-gated, like growth.)
- Handles stay bounded by the existing soft-pool eviction cap (`codexEvictSoft`), with one care:
  a handle the player has shown **salience** for (§7) is protected from eviction.

## §6. Surfacing & resolution — the player rolls the effect

The high-band tail is **not** gated behind a passive "did the player examine the wall" verb. The
funnel:

1. **The DM entices.** It is the DM's job to call attention to interesting art *cleverly* — make the
   player *want* to look (`DM-CHARTER §2`, §4 slow-drip). A bolded affordance, an angled ear, a wrong
   shadow.
2. **A Perception check gates the depth.** The deeper effect surfaces on a successful read.
3. **The player rolls the effect die — openly.** The effect roll is a **player** roll, not a DM roll
   (dice transparency, `DM-CHARTER §6`). The DM **creepily hints at the outcome and reveals it
   slowly** (the "Tell" column, §8) rather than dumping it.
4. **The outcome lands in its sink** (§4) and, if the player engaged, is captured to the codex (§5).

This makes the uncanny payoff land on the **player's own dice** — and keeps the rare, expensive
generation (§8) firing only where it earns its keep.

## §7. Salience & promotion — "when a player won't let go"

The demand-gate, made mechanical and anti-drift:

- A handle carries a **`salience`** signal. Prefer an **explicit, player-initiated** bump (the player
  pins / asks again / returns) over AI-inferred fixation — reproducible, and it keeps the AI out of
  mind-reading. (The AI *may* also notice and bump; see the Charter amendment, §8.5.)
- Crossing a threshold makes the handle **eligible for promotion**. The **script owns the weave-back**:
  **bind-first** into a live front / faction (the cleric's off-hand salute → adopted by a rising
  faction), else **roll-on-miss** a thread seeded by it (the success-payout-binding primitive). The
  DM flags interest; the engine decides *how* it recurs — never DM prose-fiat minting canon.
- Factions / NPCs gain a **`motif` slot** the promotion fills. We never author the slogan; we provide
  the slot, so an emergent player-fixation can become canon through the same circuitry.

### §7.1 — The session seam: the promotion tick (harvest → weave)

A real DM weaves between sessions: the loose threads that surfaced get carried into the next session's
prep, where some fade, some sustain, and some become the spine of the campaign. **The session boundary
is the promotion tick.**

- **End-session → HARVEST a carry-forward.** Collect the open handles + their **salience** + clock
  deltas + unresolved threads + the session's dominant **shape** (§7.2). **Salience is derived from
  logged interaction, not AI-inferred** — *did the player examine it? roll its effect die? return to
  it? lock it to canon?* Observable events, not mind-reading (this is what makes the "what the player
  cared about" signal trustworthy). Persisted on `w.carryForward`.
- **Start-session prep → WEAVE.** For each open thread, decide **trivialize / sustain / escalate**,
  **subordinate to the chosen next-session shape** (§7.2) — bind-first into a live front, else the AI
  invents the escalation and it's **captured to canon**. (`prepRecycleStale` is already the
  *trivialize* half; the seam adds *sustain / escalate*.)
- **Two promotion currents:** **engagement** (salience — the player pulled the thread) and **time**
  (a clock fires on its own — the world turns without the player, `DM-CHARTER §10.1`). A thread earns
  promotion through either.
- **Anti-drift:** the *decision* (trivialize/sustain/escalate + the shape) is mechanically scaffolded
  (§7.2); the *invention* (the specific escalation) is the AI's, captured to canon. Script owns
  whether & how much a thread grows; the AI owns the texture. (`§8.5` at the session seam.)
- *(Naming: this is the story-state carry-forward — distinct from `world/handoff.js`, which is the
  export-to-DM clipboard payload.)*

### §7.2 — The session-shape model (the "parameters of fun")

The escalate decision is **editorial, not a threshold or a roll**: a DM chooses what the next session
should *feel like* — a battle, an intrigue, a boon, a rest day — in service of the overall story, the
fun, and pacing variety. It's the "to be continued" at an episode's end: the player doesn't know what
comes next, but it should serve the throughline. We can't fully formalize "fun," but we can define the
**dramaturgical scaffold the AI exercises taste within** (and record the choice):

**Session-shape archetypes (the episode types):**
- **Battle** — combat-forward; a threat fires.
- **Conflict / Intrigue** — social/factional pressure, a confrontation, a heist, a negotiation.
- **Boon / Triumph** — a payoff session; the player reaps, a boon lands, a clock resolves their way.
- **Rest / Downtime** — low pressure; recovery, character beats, building, relationships.
- **Mystery / Revelation** — a thread deepens; a secret surfaces; investigation.
- **Turn** — a campaign-shaper; the shape of things changes (the egg hatches; a front escalates a tier).

**The selection heuristics (how the lean is *weighted* — the engine PROPOSES a soft prior, never a pick):**
1. **Contrast the last shape** — a *gentle* anti-monotony nudge. **Yields to revealed preference:** a
   player who keeps choosing battle gets battle — variety is a default, not an imposition (heuristic 0).
2. **Pay off the highest-salience open thread** — reward what the player actually invested in.
3. **Fire near-complete clocks** — promise-keeping; a clock at 5/6 wants to resolve. *(Clocks firing is
   the world keeping its promises — legitimate and deadly; the player still chooses how to respond. This
   is world-action, not the soft lean.)*
4. **Ladder toward the throughline** — escalations point at the campaign's bigger fronts, not noise.
5. **Respect tone-agency** (`Charter §9.1`) — propose, never force; the player may build a utopia.
6. **Keep it deadly** (`[[feedback-genesis-hard-and-dangerous]]`) — stakes stay real, so boons matter.
0. **Revealed preference dominates** — derived from what the player engages with / the shapes that
   actually emerge. A strong preference dampens #1 (no forced variety on someone who wants the same beat).

**The lean is a flavor, not a conveyor belt (the anti-railroad spine — Adam 2026-06-29).** The proposer
outputs a **weighted prior** (a `ranked` distribution), not a mandate. It asserts itself **only in a
vacuum** — when the player is drifting (the Charter `§10.2` in-media-res / `§10.1` forward-pressure
moment). The **override hierarchy is absolute: player intent → situation → lean.** A player charging
ahead sets their own shape; a 19-room dungeon *generates* battle regardless of the lean; the lean fills
the silence, never a push when the player has momentum. **It colors; it never conveys.** The engine
proposes; the DM leans (it can ignore it entirely); nothing is forced. The player never sees it. (`§8.5`
at the pacing layer: a soft scaffold, recorded — never a track.)

## §8. The effect die — a generation CONTRACT, not a pre-authored pool (revised 2026-06-29)

**The effect die is AI-generated, seeded to the specific object.** (Adam's call: a shared pool sands
off the specificity that *is* the value — the great moments, the dragon-egg, the demon-in-the-bottle,
are bespoke and unrepeatable; a generic pool can't match them, and the high-`legs` art that earns an
effect die is rare enough that authoring generic pools is wasted effort *and* worse content.) So the
reusable artifact is **the shape, not the content** — a contract the AI generates to:

- **The columns (the Hungering Stone v2 "True Nature" standard):** **Nature** (what it is + valence) ·
  **Player Use (Mechanic)** (a concrete thing the player can do) · **The "Tell"** (the slow-reveal) ·
  **Escalation Threshold** (the clock / where it goes).
- **The spice-curve (the demon-in-the-bottle range):** ordered 1→N from a **`dead-end` floor**
  ("sometimes a statue is just a statue"), through **manageable** middles, to a **rare
  campaign-changer** ceiling. The curve is mandated — the AI can't make everything explosive or
  everything flat.
- **The sink vocabulary:** each face resolves to a sink (`handle` / closed event / `bind` /
  thread-seed + clock), so the generated die plugs into the same machinery (§4).
- **Seeded:** by the specific object + room + world + PC + the **active threads** (bind-first bias —
  the high faces should prefer tying to a live front).
- **Captured:** the rolled outcome is written to the codex as canon (`DM-CHARTER §8.5`) — structured
  invention, frozen on the player's roll.

**When it's generated — both (Adam's call):**
- **Prep-time (primary).** When prep casts a notable artwork that's `hook`/`thread-seed`, the AI
  generates its bespoke die *during the prep cinematic*, seeded by the cast, and stores it on the
  codex entry (`source: {type:"effect-die"}`). At the table the player-roll is a clean lookup — no
  latency, already grounded in the world's threads. Rides the existing "prep casts the codex / the
  story is in the dice" over-roll model (`SESSION-PREP.md`).
- **On-the-fly (fallback).** When a curious player digs into something prep didn't flesh out, the same
  contract generates it live, then captures (the bind-first → roll-on-miss path).

**The Watcher pool stays as the few-shot EXEMPLAR + fallback** (`watcher-effect-pool` — it proved the
shape/curve and seeds the AI's generation). **The other six pools are NOT authored.** `CL_POOLS` keeps
the archetype registry (it routes the *kind* to generate), but most entries resolve to AI-generation,
not a table. (This is leaner — depth over breadth — and the spine already supports it: `clResolveEffect`
returns `null` for an un-pooled archetype, which is the "generate + capture" path, promoted from
fallback to primary.)

## §9. Storage model — hybrid (i)+(ii), held loosely

Per Adam (2026-06-29), the implementation is a **hybrid**:
- **(i)** DM-only **`legs` + archetype** tags on the table (a small, backward-compatible compiler
  addition to carry them), **plus**
- **(ii)** **AI-generated-then-captured** effects for the premium path (§8).

**Adam determines the per-table model — and adherence is deliberately *not* strict.** A rigid
one-shape-fits-all schema would **force parallelism** (every table contorted into the same columns)
and bury the craft. The Hungering-Stone 4-column shape is the **standard to reach for, not a
straitjacket**; a table may carry fewer columns, a different effect die, or none, where that serves it
better. The model is a guide; the table's quality wins ties.

## §10. Modularity (build once, reuse corpus-wide)

- **The ladder is generic** — `legs → sink`, knowing nothing about art.
- **`archetype`/kind is a pluggable registry**, not a hard-coded list — new sub-hook kinds register
  without editing the engine; each declares how it resolves (what it binds to / rolls on-miss).
- **One shared resolution primitive** — `latent → (player attention | clock) → bind-first →
  roll-on-miss` — reused by every consumer. Art is the first; a Strange *sound*, a *smell*, a dungeon
  *secret*, a future system all call the same resolver with their own `(legs, archetype, seed)`.
- **Rides existing machinery** — fronts/clocks (Starting-State), codex, the `crit`/Mythic→Ledger path,
  `EVENT-CONTRACT`. Minimal new code; that's the whole point and the MVP discipline.

## §11. Art Depiction — the pilot wiring (MVP)

- **Art is a property of a *notable* location, not a per-room roll.** When the codex mints a place
  that plausibly commissions art (civic hall, temple, manor, guildhouse, tavern, shrine, named ruin,
  the town), it gets a *chance* of **0–2 notable pieces**. Corridors/ordinary rooms get nothing.
- **Paintings only for MVP.** `Art Medium.md` + `Art Condition.md` are **deferred** enrichment
  (medium defaults to painting/mural; normalize the few sculpture/carving verbs in the table to the
  painting family). Other mediums (sculpture, tapestry, mosaic) are post-MVP.
- **The high tail is tagged `legs` + `Pool` (DM-only columns), BUILT 2026-06-29** — compiled clean,
  tags carried as `row[6]/[7]`, narration text uncontaminated. No re-banding for mechanical truth:
  *Census Completes* **stays Strange** (its image is uncanny-but-explicable); its clock comes from
  `legs: thread-seed`, not a band bump (per §4 — clock gates on `legs`, band sets intensity).
- **Scope guard (Adam):** we are *not* at scope creep — that begins at "now sculpture, now furniture,
  now wallpaper." Hold the line at paintings until the pilot proves the chain.

## §12. MVP slice vs. deferred (re-scoped 2026-06-29)

- **BUILT:** the pure resolver spine (`engine.consequence`: `consequenceFor` / `clResolveEffect` /
  `clBindFirst`) · the compiler carrying `Legs`/`Pool` · the Art Depiction tags · the **Watcher
  exemplar pool** · `verify-consequence` 30/30.
- **Build now (the seam + the contract):** the **session seam** (`endSession` harvest → `w.carryForward`
  → `startPrep` weave: trivialize/sustain/escalate, §7.1) · the **session-shape proposer** (§7.2) ·
  **interaction-derived salience** · the **effect-die generation contract** (prep-time primary +
  on-the-fly fallback, §8) reading a codex-stored die or generating one · bind-first into existing
  threads.
- **NOT building:** the other six effect pools (replaced by the §8 generation contract; Watcher stays
  as exemplar) · mechanical sink **B** beyond events the engine already does (don't write checks the
  engine can't cash — "spawn the PC's fears" needs structured fear-data + an encounter injector we
  lack) · the faction `motif` slot · cross-world dormant-clock management.

## §13. Open questions / next build steps

1. ☑ **Compiler** carries `Legs`/`Pool` (exact-header match). ☑ **Resolver spine** (`engine.consequence`).
2. **The session seam (next):** `endSession` harvests `w.carryForward` (open handles + interaction-
   salience + clock deltas + lastShape); the **shape proposer** ranks the next-session shape (§7.2);
   `startPrep` weaves (trivialize/sustain/escalate). Generalizes the success-payout-binding open item.
3. **Effect-die generation contract** — prep-time generation + capture to a codex `effect-die` source;
   `clResolveEffect` reads it; on-the-fly fallback.
4. **Wiring:** the notable-place art hook (0–2 pieces) on codex place-generation; the carry-forward +
   shape into the DM digest (`dmDigest`/`handToDM`) so the DM weaves to the proposed shape.
5. **Open design Q (flagged, not blocking):** does the shape proposer's pick feed the DM as a *strong
   recommendation* it can override, or as a *constraint*? (Leaning recommendation — `§9.1` tone-agency.)
5. **Then:** carry the `legs × archetype` standard into the next re-authoring targets (the
   Atmospheric & Sensory feeders), now with the ladder as the corpus-wide rule.
