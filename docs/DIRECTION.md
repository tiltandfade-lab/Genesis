---
type: direction
status: STANDING — the project director's trajectory doc (Adam granted Fable the seat 2026-07-03). Supersedes NEXT-STEPS ordering where they disagree; fix the drift in the same change. Adam holds every taste, content, and spend ruling. Amended 2026-07-03 late — reconciled with the concurrent session's close (CHANGELOG later 7: G5 rounds 1–2 done live with Adam; the 9 blessed realms merged; combat_start opened in real DM hands). Amended 2026-07-26 — the revenue & studio trajectory addendum appended at the end (commercial horizon only; build sequencing untouched).
created: 2026-07-03
related:
  - "[[DESIGN-GUIDE]]"
  - "[[DREAM-HORIZON]]"
  - "[[SPEED-DOCTRINE]]"
  - "[[DM-SEAT]]"
  - "[[MODEL-GRAMMAR]]"
  - "[[HANDOFF]]"
---

# DIRECTION — the 2026-07-03 reshape

> **Status banner (2026-07-22, Fable canon pass):** this reshape is a **historical trajectory
> snapshot**. Its portfolio diagnosis and doctrine validations stand, but its standing claims
> are superseded in practice by later founder-authorized programs: the graphics-convergence
> charter era (2026-07-12+), the sprite transition and pixel canon (07-09/07-15), and the
> procedural-dungeon wave program (07-18 → 07-22) — whose accepted first implementation
> priority (canonical mechanics → BattleMat + EngagementLens → provider-neutral DM seat →
> persistence/recovery) now owns build sequencing, behind Wave 12's authorization gate. The
> §3.4 spec-moratorium, §4 renderer gate, and "supersedes NEXT-STEPS ordering" claims should
> be read historically; current routing = `docs/canon/README.md`. The §9 ship-gate and §8
> freezes (multiplayer/VTT/UGC, T3/T4) remain live constraints where not explicitly superseded
> (see `canon/PRODUCT-SCOPE.md` §5). Preserved verbatim below; a fresh DIRECTION reshape is a
> candidate follow-up once the founder packet lands.

## §1 The read (condition vs. the stated goals)

| Dimension | State | Evidence |
|---|---|---|
| Mechanical spine | **~done for v1** | 99 modules · 84 harnesses · manifest OK · core rules engine a remarkably compact ~2.7K LOC riding ~80K generated data |
| Playability (the product) | **NOT met — the gate** | Latency law ≤15s unmet (rot1 turns: 30–65s routine, 90–170s deep — loop tax); seat units 1–3 BUILT, unit 4 (SEAT-PROMPT) unstarted; no key yet |
| Play evidence | **thin** | 2 automated shakedowns + rot1-attempt2 (10 turns, healthy, strong prose, zero errors) + 1 live fight. Total felt-play ≈ hours, vs ~90 systems built |
| Content quality | **uneven** | T7 craft pass unstarted; 38 provisional files + 634 dup-row warnings + 33 mythic proposals awaiting Adam |
| Visual lens | **exploded, unfinished** | Theater+grammar G1→G4 in 2 days (~5.3K hand-written LOC — ~2× the entire core engine); G5 + §7b QA + rev-2 verdict open |
| Doctrines | **sound, validated** | TEXT-FIRST survived a total visual failure in shakedown; SPEED-DOCTRINE measured into existence; BLIND-PLAYABLE has its acceptance gate defined |

**Verdict: engine-rich, play-poor.** Nothing important is missing. The game the docs
describe substantially exists and is verified — what doesn't exist yet is the *product
experience*: a seat that answers in ≤15s at ~$1/hr, and tens of hours of felt play
tuning what's already built. Adam named it exactly: the seat is when this becomes a
real game. The seat is 3/5 built; the remaining critical path is days, not weeks.

## §2 The diagnosis (what "over-expanded" actually means)

The last 48h were supply-driven, not demand-driven: 91 docs (65 missing from the index),
a theater whose hand-written code is twice the core engine, mythic proposals + dream-weaving
+ lighting + dead-state landing while the seat's last unit and the play cadence waited.
Every unit individually excellent; the portfolio unbalanced. **The correction is portfolio
discipline, not architecture** — the constitution (script owns truth · AI does AI jobs ·
text-first) is right and proven.

## §3 The reshape (five standing moves)

1. **THE PLAYABILITY GATE is the only north star until met:** seat live · routine turns
   ≤15s measured across a real hour · ~$1/hr measured · combat included. Every unit of
   work ranks by contribution to it.
2. **The renderer gets a decency gate, not a lease renewal** (§4). Today, then freeze.
3. **Soak before build:** after the seat, 10 sessions before any new subsystem —
   rotation runs 2–5 ON the seat (they become the seat's soak + cost telemetry),
   then Adam live sessions, then ONE full screen-reader session (the BLIND-PLAYABLE
   acceptance gate). Session friction drives all subsequent build order.
4. **Spec moratorium until soak-5.** No new spec docs (SEAT-PROMPT.md exempt — it's a
   game artifact, not a spec). *(Amended 2026-07-07: Adam exempted `TABLETOP-VISION.md` —
   the visual end-state had to be specced inside the final Fable window so post-Fable
   executors can build it. Spec only; the §4 freeze still gates the BUILD on soak evidence.)*
   *(Amended 2026-07-07, late — BUILD UN-GATED for the tabletop pre-alpha: Adam verbally
   authorized an overnight unattended build of `docs/TABLETOP-UNITS.md` U1–U7 ("schedule a
   massive build session for the visuals … running fine on its own for the next several
   hours"). This supersedes the §4 soak-gate FOR U1–U7 ONLY — no other subsystem is un-gated.
   Result: U1–U4 + U6 landed to master overnight (`22673a3`→`4bac31f`); U5/U7 parked on a
   corpse-channel design fork — see `docs/OVERNIGHT-REPORT-2026-07-08.md`.)* T7 reshapes
   demand-driven: re-author the tables play
   actually FIRES first (session logs supply the fire-list), not corpus-order.
5. **The Adam ledger replaces ambient carries** (§6). Nothing waits on Adam invisibly;
   everything waiting on him is batched, named, and scheduled.

## §4 The renderer ruling (today, 2026-07-03)

> **Amended 2026-07-03 (later 9) — model-authoring pivot.** The floating / 90°-wrong / detached
> parts that (a)'s G5 hand-override session was fighting are an ANCHOR-GRAMMAR bug, not a
> recipe-tuning gap: a whole-object probe (each creature = one landmark table, no anchor resolver,
> no stat→look derivation) killed the bug class *by construction* on both a biped and a spider
> (`dev/model-qa/`; CHANGELOG later 9). So (a)/(b)'s "tune G5 recipes" MEANS is superseded — creature
> bodies now author whole-object and execute through the `genesis-blender-mcp` GLB pipeline (Adam:
> "make the move over to Blender"). The gate's INTENT stands (blind-readable at ~100px, prose-twin
> parity, one unembarrassing live fight); the authoring path moved off the anchor grammar. See
> [[project-genesis-whole-object-models]].

"Decent" = all five by end of today's session:
- **(a)** G5 hand-override session — **rounds 1–2 DONE live with Adam (concurrent session,
  07-03); remaining: Row B, the beasts** (wolf/spider/swarm/ooze/ghost/dragon lineup —
  fixture staging recipe in that session's transcript);
- **(b)** §7b blind-recognition loop RUN (specced, never yet run) — top-100 CR-weighted
  creatures pass at ~100px (3-attempt cap; misses logged to the G5 queue, not looped forever);
- **(c)** Adam's rev-2 "layers-not-boxes" + battle-stage UI verdict — **Adam wants ORGANIC
  combat shots first**, which (d) produces (G9 r2 left no critical nits);
- **(d)** one live fight rendered end-to-end in battle-stage mode without embarrassment —
  rot1-attempt2 proved `combat_start` opens in real DM hands (Stealth-fail margin
  consequence, 3 foes, stilt-hut zone) but rounds never ran; the fight itself is unfelt;
- **(e)** prose-twin parity intact (the BLIND-PLAYABLE tax stays paid).

**PASS → FIDELITY FREEZE:** bugfix + §7b regressions only. No new parts, verbs, FX,
lighting features, or stage modes. Next theater investment only post-soak, by friction
evidence. (All art is placeholder by doctrine §II.0b — polish spent now is spent twice.)
**FAIL → park at tracker + prose.** The theater is a lens; the game launches without it.

## §5 The critical path (this week)

1. **`docs/SEAT-PROMPT.md`** — frontier distillation (Fable-gated; draft in flight
   2026-07-03, background). Charter voice + mechanical contract, ≤12k tokens, two
   fixture exchanges, cache-stable prefix.
2. **`seat-replay.py` + the dm-eval voice gate vs real GLM** — needs **Adam's z.ai key**
   (the one hard external dependency).
3. **The live seat hour, combat included** → the latency law measured end-to-end at last.
4. Rotation runs 2–5 on the seat; `session-cost-report.py --seat` after each (SPEED rule 6).
5. Adam live sessions + the screen-reader acceptance session. Soak friction ledger opens.

Engineering ledger (Fable-owned; seeds the soak friction list, never blocks the path):
foe-hazard damage path missing (dead-state follow-on) · prepPending unserviced under loop
DMs (SD-006 — resolves with the seat; more evidence the seat is the product) · stale-locked
worktree `agent-af33f67…` (dead PID; manual cleanup someday).

## §6 The Adam ledger (batched; nothing carries ambiently)

- **Batch A — taste (today, inside the renderer session):** G5 Row B beast overrides ·
  the rev-2 + battle-stage UI verdict (off the organic combat shots §4d produces) ·
  keep/kill the theater-verbs demo gif.
- **Batch B — tables (~1h, this week):** the 38 provisional files · 634 duplicate-row
  warnings · In-Building Complications (linter opt-out vs re-sort) · valuables table.
- **Batch C — mythic (~15m):** ~~the 9 applied realms~~ MERGED 07-03 (`46bcd62`,
  Adam-approved verbatim). Remaining: rule the Frame-field schema (per-variant Frames
  split into Item text vs one-Frame-per-row) so Frontier + Noir can re-propose.
- **Batch D — rulings (~30m):** SD-003 · SD-009/010/011 · ridden-wyvern · TIYL wiring ·
  the d500 NPC-trait expansion + NPC pools/slots follow-through (recurrence-as-thread
  approved in principle; needs the concrete go) · Place-Gen template-slot proposals
  (drafting promised, not yet done). (G2-1976 lethality deliberately WAITS for soak data.)
- **Spend:** create the z.ai key (gates §5.2; ~$1/hr at measured payloads).

## §7 Hygiene orders (issued 2026-07-03, background execution, Fable re-gates)

Commit the rot1-attempt2 playtest logs + demo gif as artifacts · delete the sprite
`_ping.txt` · prune the 35 merged `worktree-agent-*` branches AND their worktrees ·
land `claude/elegant-lamport`'s verify-digest-diet fix, inspect/kill the other two
scratch branches · regenerate `docs/README.md` (index all 91 docs) · NEXT-STEPS →
forward-only · HANDOFF diet: ⭐ + 2 previous entries max, history lives in CHANGELOG
(**standing rule: HANDOFF holds ≤3 entries**). Never touch: `playtest/complaints`,
`feat/realm-mythic-pools` (awaits Batch C), master directly.

## §8 Frozen until soak-5 evidence

No new subsystems (attitude/parley waits) · no T3/T4 wiring · no mythic-weave build
(H3 stays parked) · no VTT/multiplayer/UGC exploration · no theater features beyond §4
· no new spec docs · no prefetch P2/P3 spend (P1 only if soak shows read-gap pain).

## §9 The ship-gate (v1 definition of done — proposed, awaiting Adam's blessing)

Seat live at ≤15s routine, measured across a real hour · cost ≤$2/session measured ·
10-session soak complete with every P1 friction fixed · the blind-playable acceptance
session passed · the Adam ledger empty (resolved or explicitly parked) · fired-tables
craft round 1 done. **Then** launch talk. Until these six are green, "what should we
build next?" has a standing answer: whichever of them is red.

---

# DIRECTION addendum — 2026-07-26: revenue & studio trajectory ("Living Miniatures")

> **Scope:** the commercial/portfolio horizon only — how Genesis-the-studio gets funded
> through the fall-2027 flagship launch. This section does NOT reorder build sequencing;
> `docs/canon/README.md` keeps that authority. Talked through with Adam 2026-07-26;
> Adam holds every spend/launch ruling as always.
>
> **REBUILT same day (07-26 late), under adversarial scrutiny at Adam's order.** §§A–F
> below stand as reference (the universe, the flywheel, the doctrines) but **the gated
> skeleton at the end supersedes them wherever they conflict** — in particular: the
> Sept–Oct sprint is re-scoped revenue-first (the December gap is verified real), all
> game revenue is de-weighted to median-case, the camera ruling is reopened, the
> publisher demoted, and every phase now carries an entry gate and a kill criterion.

## §A The money read

Game revenue is **2027 money**. Nothing between now and mid-2027 plans on it.
2026 runway = murals (now upgradeable with Blender/Meshy 3D wall mockups — a sellable
service improvement available immediately) + AI-engineering contract work (§F).
December 2026 cash = murals. Standing rule: any pre-2027 game income is a bonus, never a plan.

## §B The three-game universe (one brand: miniatures that come alive)

All spin-offs share Genesis's fiction — living miniatures on a photographed tabletop —
so each game advertises the next and assets flip between them.

1. **Micro-autobattler** (single-player PvE roguelike form — Astronarch/Despot's shape;
   explicitly NOT PvP autochess, which needs backend + live-ops). **The pipeline-learner,
   not the money-maker:** cheap enough to flop while it teaches the full Steam ceremony
   (store page, capsule, wishlists, Next Fest demo, launch discount, review/patch rhythm).
   Skinned as figurines fighting on a diorama table. Uses existing monsters/stats/loot +
   the combat engine (script already owns the numbers); no AI, no narration. ~$5–8.
   Target: early 2027, through the ENTIRE ceremony including a Next Fest.
   **Concept sketched:** `docs/AUTOBATTLER-CONCEPT.md` (2026-07-26, PARKED) — booster-
   collection economy, the earned-randomness monetization law, trigger grammar, art/
   animation laws, the UI-kit doctrine, v1 cut lines, open founder rulings.
2. **Game-shop sim** — **the revenue shot.** Hook no competitor has: the shop sells
   miniatures that come alive; customers buy figurines/terrain and build little game
   worlds in-store. Sprite→3D stock upgrades as an in-game progression that mirrors the
   real production pipeline. Genre is proven-hot (TCG Card Shop Simulator: solo dev, $13,
   ~2.9M copies; Supermarket Simulator: 2–5M owners) and flooded with copycats — the
   living-miniatures hook is the differentiation. The vertical slice doubles as a
   publisher pitch (sim publishers scout Next Fest; the publisher route = marketing +
   capital in one deal — cf. Despot's Game → tinyBuild). Target: Early Access mid-2027;
   its revenue funds the fall flagship push.
   **Concept sketched:** `docs/SHOP-SIM-CONCEPT.md` (2026-07-26, PARKED) — proven-spine/
   living-layer split, realms-as-product-lines, the counter pack-open moment, camera
   RULED dollhouse (Adam 07-26, Two Point lineage), the diorama-editor law (constrained
   kit; authored-scenes-into-the-procedural-pool flip), vertical-slice definition, v1 cut lines.
3. **Genesis flagship** — fall 2027, launching into an audience that has lived in the
   universe for a year. Later flip: the autobattler appears INSIDE the shop game as the
   game customers play.

**Tactics game (XCOM-like on the FFT grammar): explicitly game #4.** It's the closest
sibling to the flagship — which is exactly why it waits; it competes for the same systems
while they're still moving.

## §C The free text beta flywheel ("Genesis: Text Edition")

The DM-only text version ships **FREE, never paid** — badged as the flagship's living
beta (itch and/or a Steam Playtest attached to the flagship's store page), BYOK or
capped hosted turns.

- **Why not paid:** paid text AI-DM on Steam is a decayed shelf (AI Dungeon down to
  double-digit concurrents); category growth lives on web subscriptions (Friends &
  Fables 100k+ users, Old Greg's Tavern 225k+) — which validates DEMAND for the
  category while damning the paid-text-on-Steam form. Steam is visual; the real
  differentiator (mechanized dice, real tables, real persistence vs. prompt-wrappers)
  is invisible in a text screenshot. And paid AI narration before the model economics
  are solved = shipping a service with negative margins.
- **What free buys (the triple flywheel):**
  1. **Transcripts in the event-contract format = the training corpus** for the
     bundled/fine-tuned small DM — the cheap exit from the latency law and the thing
     that eventually makes every commercial version viable.
  2. **Demand data = the procedural coverage spec.** What players ask worlds to do is
     the edge-case list the procedural system must generate. Free scenario discovery,
     free QA, at population scale.
  3. **Community + wishlists** accruing on the flagship's page a year early.
- **Anti-spoil:** worlds persist into the full release — beta players' text-born worlds
  carry forward and get rendered in miniature. Early access deepens investment;
  persistence is the anti-spoiler.
- **Design note (when built):** a client-side text build leaks table data. Either roll
  server-side or accept a limited, curated beta slice. Interacts with the going-private
  plan — rule this before the beta ships.

## §D Marketing doctrine

The bottleneck is Adam's drive, not tooling — so the doctrine removes Adam from the loop
except for taste. Indie marketing = **hook + demo + cadence** (Backpack Battles: the
demo WAS the campaign — 9 months live, 38 patches, 19k CCU before launch → 640k copies
in month one). The hook is a design decision (§B owns it). The demo is a build artifact.
The cadence is factory work: Fable drafts devlogs/clip scripts/store copy, Codex cuts
footage; Adam's irreplaceable share ≈ 1 hour/week of taste calls. **No marketing
employee before revenue** — for game one the "marketing hire" is the factory, or a
publisher.

## §E The hire ladder (money-gated, contractors before employees)

1. Per-launch contractors: trailer editor, capsule artist.
2. **DM fine-tune specialist — a CONTRACT project, not an employee**, and only once the
   §C transcript corpus is real (the corpus is the job spec).
3. Leads for the shop/tactics games — only from shop-game revenue.
Employees exist after recurring revenue exists. Until then the factory is the staff.

## §F The Sept–Oct 2026 portfolio sprint (the runway lever)

Goal: a visible AI-engineering portfolio that converts to contract work — proof =
shipped artifacts + written process, not claims.

- **Piece 1 — the tile tool** (Codex's sprite→cut→seamless-tile mechanism) packaged
  public with a demo video. It's generic tooling, not moat. Free / suggested-donation:
  the tool is an ADVERTISEMENT for contract work; tool revenue is incidental. Its story
  is the sell: built independently from a real production need, in production use.
- **Piece 2 — the factory case study**: orchestration lanes, gate discipline,
  verification culture — extends `docs/POSITIONING.md` ("the factory is the career").
- **Piece 3 — the free text beta itself** as a live AI-product demo, when it exists.
- **The moat rule:** package generic tooling + process writeups. NEVER the tables, the
  materials look, or the procedural system — those go private, not on Patreon.
- **Channel truth:** a portfolio is necessary, not sufficient. Distribution = Show HN,
  X/LinkedIn gamedev+AI circles, and the mural-client small-business network. The
  mural-commission acquisition muscle transfers; "money comes easy after" is calibrated
  to "conversations convert much better after."
- Patreon/subscription: only once a content cadence + audience exist (earliest: after
  the pipeline-learner launch). Suggested-donation on the tile tool is the near-term form.

---

## THE GATED SKELETON (the 07-26 late rebuild — this supersedes §§A–F where they conflict)

Adam's order: rebuild under aggressive adversarial judgment, operate with that
perspective as the known obstacle, approach the dream optimistically — "nobody wins if
they don't try." The dream stays whole; the gates are how it survives contact.

### Standing laws

1. **MEDIAN LAW** — no game revenue is load-bearing until measured. Plan every phase on
   the median outcome (median Steam indie: low-thousands lifetime); ride any upside.
   Strike "funds the flagship" language until a real number exists.
2. **ONE-BODY LAW** — Adam's attention is the budgeted resource. One game in production
   at a time; serialization over parallelism; every phase declares its Adam-hours cap.
3. **SERVICE-BEFORE-SPECULATION** — when runway is short, service income (murals, AI
   contracts: booked work that pays on completion) outranks product speculation (games).
   This is the founder's own monetization law applied to the career: sell certainty,
   earn the randomness.
4. **GATE LAW** — no phase starts before its entry gate is met, however exciting; every
   phase carries a kill/park criterion decided BEFORE it begins.

### G0 — Runway (NOW → December; the driving fact)

**VERIFIED GAP (Adam 07-26): last mural booking mid-August; leads exist but nothing
concrete behind it.** Therefore Sept–Oct is a **revenue sprint first, portfolio second**:
close mural leads, land the first AI contract; the portfolio pieces (tile tool, factory
case study) are built as sales collateral FOR those conversations, not as ends in
themselves. **FOUNDER INPUT NEEDED: the December number** (need vs. banked) — the gap,
not enthusiasm, allocates the Sept–Oct hours. **KILL:** if by Oct 1 the gap isn't
closing, all spin-off/game work pauses for income work; games resume when runway holds.
(The flagship's seat critical path continues regardless — it is days of work and it IS
the G1 measurement.)

### G1 — DM economics: measure, don't assume (front of the program)

Demand is proven (Friends & Fables 100k+ users at $20–40/mo; Old Greg's Tavern 225k+) —
Adam: "that's all I need to continue." Unproven: **our cost per session.** The seat work
already on the build's critical path IS this measurement (≤15s routine, ~$1/hr target).
Worst case is not death: usage-priced play (session fees / monthly sub — Adam's named
fallback) turns DM cost into pass-through. **GATE OUT:** a measured $/session + latency
number a pricing model can be designed around. G2 then probes what players tolerate.

### G2 — Free text beta (FREE; the flywheel of §C)

**ENTRY:** playability gate met + G0 stable. Purpose per §C (transcripts = DM corpus +
procedural coverage spec; community + flagship wishlists) **plus now: the
willingness-to-pay probe** for session-fee/sub tolerance. **LAWS:** promise world
IMPORT into the flagship, never save-compatibility (the forever-tax); support burden
capped — if it eats more than a set weekly hour budget, freeze features, don't grow them.

### G3 — Pipeline-learner: the autobattler (`docs/AUTOBATTLER-CONCEPT.md`)

**ENTRY:** G0 green + flagship playability gate MET + a declared attention budget
(factory lanes + capped Adam hours/week). **PURPOSE:** learn the full Steam ceremony
end-to-end + seed the Living Miniatures brand. **REVENUE TARGET: none** — median
assumption low-thousands; anything more is upside. **KILL:** if it slips badly or
starves flagship soak, park it — the ceremony can be learned on something even smaller.

### G4 — The shop sim (`docs/SHOP-SIM-CONCEPT.md`): the upside shot, entered on evidence

**ENTRY:** autobattler SHIPPED + a real demand signal from G2/G3 (wishlist/demo
thresholds defined when G3 ships — numbers, not vibes). **CAMERA REOPENED** (Adam
07-26: "willing to consider first-person if it makes more sense for the purpose it
serves"): decided at slice start by a short dual blockout probe, judged on the slice's
purpose (revenue — the genre's proven winners are all first-person, plausibly causally)
with taste as tiebreak; the middle path is explicitly on the table — dollhouse spine +
first-person tactile zoom vignettes (pack-open, mini placement) to capture the genre's
dopamine without a full FP game. **KILL:** Next Fest demo underperforms its threshold →
re-scope or park; full production never enters on hope. **Publisher: opportunistic
only, never load-bearing** (industry funding fell ~$12B→$2.4B, 2021→2024; Adam wasn't
counting on one anyway).

### G5 — The flagship (fall 2027 = aim, not altar)

Launches on evidence — beta community + measured DM economics + soak — never on
calendar. The date moves before the quality bar does.

### Hires & the dream

Ladder per §E (contractors → fine-tune contract → leads), plus one law: **hires are
funded by measured recurring revenue, never projections.** The dream — the three-game
universe, the diorama-editor flywheel, the studio — stays whole. Gates are its armor,
not its cage.
