---
type: canon
status: ACTIVE — the product/scope contract
created: 2026-07-22
owner: docs/canon/README.md (precedence law)
---

# Product Scope — what Genesis is, what ships first, and what is only promised

Every claim here carries its source. Where two accepted sources differ, the conflict is recorded
and precedence applied — nothing is blended. Where no authority resolves a scope question, it is
marked **OPEN-ADAM** and listed in [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md).

## 1. What Genesis is

**A standalone single-player TTRPG video game.** The player rolls a world into being; an AI DM
narrates; worlds persist forever in the browser and accumulate into a universe. Built on the
Arcana Engine but its own product. (`docs/DESIGN.md` §Vision; CLAUDE.md.)

The dream, in Adam's words: "a dynamic, self-generating, fast fantasy game where no playthrough
is the same and the world is full of meaning, mystery, fun, wackiness, drama, and scary monsters"
— with a graphics engine eventually on top, a visual battle system first.
(`docs/DESIGN-GUIDE.md` §0.)

**Why it exists (the north star):** AI drifts over long campaigns. Genesis is the architectural
answer — the deterministic state layer is authoritative; the AI is the interpreter, never the
source of truth. (`docs/DESIGN.md` §North star.)

**Three binding doctrines** (`docs/DREAM-HORIZON.md`; memory-canonized 2026-07-02):
1. **SPEED** — AI does only what only AI can do; no model call in mechanical loops.
2. **TEXT-FIRST FOREVER** — a prose-only Genesis must always run; event-sourced state IS the
   game; visuals are an optional lens.
3. **BLIND-PLAYABLE FULLY** — acceptance includes a full session via screen reader; every visual
   surface has a prose twin.

**The product-fidelity law:** "Prefer TTRPG freedom and effectively unbounded replayability over
Baldur's Gate 3-style authored geometric accuracy. Genesis can afford the former and cannot
afford the latter." (Wave 1 §8.12.3.)

## 2. The intended player experience and core loop

One player, one main PC, in a persistent world with real danger. The loop: **roll a world →
incarnate through the bardo → explore/talk/fight through walks and bounded places → consequences
persist in the ledger/codex → die expected deaths → return through the bardo into the same,
now-older world.** (`docs/DESIGN.md` locked decisions 2026-06-17/21; `docs/NEW-GAME-FLOW.md`;
`docs/DEATH-AND-REBIRTH.md`.)

The seven experience pillars grade every system: script-owns-truth · no-two-playthroughs-alike ·
fast · meaning & mystery · hard & dangerous · grim/severe/hilarious · depth over breadth.
(`docs/DESIGN-GUIDE.md` Part I.) Tone-agency is sacred; the DM Charter is the narrator
constitution (`docs/DM-CHARTER.md`).

**Authority split:** the player rolls their own dice openly and owns their PC's actions
absolutely; the engine owns every number and noun; the DM (any provider in the neutral seat)
owns verbs, meaning, and narration — and exerts will only through NPCs. (`docs/DM-CHARTER.md`;
`docs/EVENT-CONTRACT.md`; Wave 2 G2.1.)

## 3. Supported content breadth (current rulings)

- **Rules:** stock D&D 5.5e/SRD 5.2.1 as much as possible; bends are reactive and logged.
  (`docs/DESIGN.md` 2026-06-17.)
- **Levels:** Tier 2 cap — levels 1-10 built and playable; T3/T4 authored-but-inert behind
  `LEVEL_CEILING`. (`docs/TIER-SCOPE.md`.)
- **Realms:** the frozen 11-realm slate with locked identities and per-realm skins.
  (`docs/OUTLANDISH-REALMS.md`; 2026-07-09 realm re-key session.)
- **Content engine:** ~380+ compiled tables, 510-creature bestiary + ~1,307-entry realm draft,
  ~2,000-sprite sized corpus with height provenance, 175-item SRD gear index, full L1-20
  class-progression data (L11-20 inert). (generated-artifact registries; census.)
- **Figure register:** pixel sprites are the canon creature/NPC register (Adam 2026-07-15,
  `docs/ART-DEPARTMENT.md`); the faceted register is the RESERVE (`docs/ART-DIRECTION-CANON.md`);
  all art remains placeholder-by-declaration behind swap-cheap seams (`docs/DESIGN-GUIDE.md`
  §II.0b).

## 4. The three scope tiers — never conflated

The phasing law (`docs/procedural-dungeon-direction/PHASING-FRAMEWORK.md`) fixes three horizons.
Everywhere in the corpus these words mean exactly this, and a document claiming one tier never
silently claims another:

### 4a. The no-cash Mac proof (current tier)

Everything currently planned runs on Adam's existing Intel MacBook Pro plus the committed
~$200/month Claude/Codex spend — zero new recurring cost. It proves: canonical mechanics, exact
BattleMat tactics in one retained clay room, the mandatory EngagementLens, provider-neutral DM
interaction with fictional fallback, persistence/recovery, and a bounded accessibility trace at
a truthful low presentation tier. (Wave 10 §11.110-11.112; Clay stages C1A-C1K.)

**The proof is never mislabeled as the game.** It is not a release-hardware minimum, not a
beauty ceiling, not a support or usability claim, and not a replacement product for the working
engine. (PHASING-FRAMEWORK "proof is not product"; FABLE prompt preservation audit.)

### 4b. The playable pre-alpha/MVP

A narrow but *recognizable* Genesis loop, playable for enjoyment — every critical and borderline
behavior present at narrowed breadth. Its accepted composition (Wave 10 phasing audit,
"Recommended Wave 10 pre-alpha slice" + pre-alpha-critical table):

- the shared shell: left rail · central SceneTray/BattleMat · persistent provider-neutral right
  DM conversation;
- a party moving through exact cells with material route agency; validated object interaction;
  attack/damage/condition; door/topology change; a revealed hazard; custody transfer; exact
  terminal-state recovery after interruption;
- the **mandatory EngagementLens** staging every material combat beat (one bespoke family,
  truthful generic staging for the rest);
- deterministic initiative (plain but complete), speakable stable labels, viewpoint-safe secrecy;
- the coherent tabletop visual floor — existing sprites/lighting/materials retained; "cheap
  assets do not license a debug-looking game";
- fiction-first DM-seat fallback for every material receipt family; keyboard/mouse input; the
  bounded accessibility equivalence suite;
- the first implementation priority behind all of it: **canonical mechanics → BattleMat +
  EngagementLens → provider-neutral DM-seat/fallback → persistence/recovery, in one retained
  clay room, before module breadth** (ledger law 7; CLAY-PROOF-LADDER law 11).

Post-core pre-alpha modules (accepted, separately gated): bounded travel (C2H-C2L), bounded town
(C2M), cold companion separation (C2G), waiting-party crossings (C2N).

**The existing walk/table game remains playable throughout.** The MVP floor is not a removal
list; working Genesis capabilities are protected unless a locked ruling supersedes them with
replacement evidence. (PHASING-FRAMEWORK law 9; FABLE prompt boundary 5.)

### 4c. The feature-goal horizon

The accepted mature destinations — tracked, never forgotten, never silently promised: the
twelve-golden-site/eight-trace portfolio; richer material/culture breadth (procedural culture
constitutions, trim-sheet families, no-clone law); player-placed deployment (C2E); diegetic
transition beats (C2F); same-scene companion autonomy (C4D) then transactional split-party;
horse/wagon transport depth (C4F); voice input; device/tier matrix beyond the Mac; funded human
accessibility evidence; the semantic-invention platform slices; workbench/teaching loop; mod/
sharing ecosystems. Every one has a ledger row with a named seam, owner, and promotion trigger
(`docs/procedural-dungeon-direction/FEATURE-PROMOTION-LEDGER.md`).

## 5. Explicit non-goals and unearned claims

**Non-goals (ruled):** no authored plot spines or tonal railroads (`docs/DESIGN-GUIDE.md` P2/P6);
no global level-scaling or reactive difficulty (`docs/DIFFICULTY.md`; Wave 2 G2.1); no BG3-style
authored geometric fidelity (Wave 1 §8.12.3); no continuous per-NPC world simulation (Wave 2
§10.1); no bespoke per-choice generated imagery in pre-alpha travel/town (Wave 10 §11.83); no
full mount/vehicle simulation as a goal (Wave 10 §11.80); no multiplayer/VTT/UGC exploration in
this scope (DIRECTION §8 freeze, unrevoked on this point); no T3/T4 wiring (`docs/TIER-SCOPE.md`);
pre-alpha has no voluntary split-party play (Wave 10 §11.75).

**Claims Genesis has NOT yet earned (must not appear in any release language):** broad device
support; validated blind/low-vision usability (funding-gated compensated research); provider
cost/latency at scale; "the twelve sites pass" (portfolio incomplete); release-renderer selection
(reserved for Adam at the P10.12 bakeoff); any implementation claim from Waves 1-6/10 closures —
closure records design disposition only. (Wave 10 P10.10/P10.12; ledger "UNAUDITED" banner;
IMPLEMENTATION-HOLD.)

**Beyond-tech-demo ambition (accepted, bounded):** when the accumulated twelve-site corpus
passes, that demonstrates "a system-backed vertical slice/pre-alpha beyond a tech demo" —
explicitly not release readiness. (Wave 3 §12.13.)

## 6. What evidence promotes scope

Scope moves only on named evidence, per the promotion laws: a Clay Pass proving a seam (proof →
MVP); integrated playable traces + retained captures + Adam's explicit taste acceptance on real
gameplay-scale captures (MVP → goal); funded milestones for anything with recurring cost; and
Adam's reserved final selections (release tray, release claims, product breadth). A score,
technical green, or agent judgment never promotes, retires, or ships anything by itself.
(PHASING-FRAMEWORK; FEATURE-PROMOTION-LEDGER laws; Wave 10 §11.116/§11.122.)

## 7. Scope questions that remain Adam's

Routed to [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md): release-tray selection (after the P10.12
bakeoff evidence exists); release claims/wording at first public exposure; funding triggers'
priority order; mod/sharing policy depth (Waves 11-12 will surface it); and the Wave 12 build
authorization itself — the only gate that can turn any of this scope into a build.
