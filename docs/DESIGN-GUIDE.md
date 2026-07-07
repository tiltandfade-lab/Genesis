# DESIGN-GUIDE.md — Genesis

**type:** design-guide · **status:** v1 (2026-07-01) · **owner:** Adam
**Sits above** `DESIGN.md` (the locked-decision registry) and `NEXT-STEPS.md` (the queue).
This doc holds the *dream*, the *look*, and the *ordered path* — the registry holds the rulings,
the queue holds the work. When they disagree, fix the drift in the same change (CLAUDE.md discipline).

## 0. How to use this guide

The dream, in Adam's words: **a dynamic, self-generating, fast fantasy game where no playthrough
is the same and the world is full of meaning, mystery, fun, wackiness, drama, and scary monsters** —
with a graphics engine eventually on top, a visual battle system first.

Three parts:
- **Part I — Game-feel pillars.** The experiential philosophy as *testable* principles. Every new
  system gets graded against these before it's specced.
- **Part II — Visual identity bible.** "Ivalice" codified so no future screen can come out
  "Claude" again.
- **Part III — Roadmap to the dream.** The ordered tracks from today's repo to the goal, each
  graded for handoff readiness.

### The execution rubric (the gate for every roadmap track)

A track spec is **Sonnet-ready** when a competent-but-unimaginative executor cannot make a
consequential choice. Grade against these six (plus the 7th for fix-work) before handing down;
frontier models spec, cheap models execute, Opus-tier reviews **and re-runs the gates** —
never trust a subagent's self-reported green:

1. **Zero latent decisions** — every fork resolved in the spec (incl. event-vs-param, exact payload shapes).
2. **Exact surface** — file paths, symbols, signatures, event shapes all named.
3. **Acceptance = command + expected number** — "`verify-x.mjs` ≥N/0-failed," never "tests pass."
4. **Explicit don't-touch list** — generated files, out-of-scope paths, minimal diffs.
5. **A worked before→after per changed site** — the single highest-leverage anti-ambiguity move.
6. **Enumerated edge cases with rulings.**
7. *(fix-work)* Every regression check shown **RED against un-fixed code** before it counts.
8. *(visual/tooling work)* **Blind-playable parity** — any visual surface names the equivalent
   text/query path for the same state and affordances. Graphics may clarify; they may not become
   the only way to play, inspect, or author.

---

## Part I — Game-feel pillars

Each pillar: the principle, what it forbids, and how you'd catch a violation.

### P1 · The script owns the truth
The deterministic layer is authoritative; the AI is the interpreter, never the source of truth.
For any feature ask **"can the script own this?"** before "let the AI handle it." Invention is
licensed — but captured (DM-CHARTER §8.5).
*Forbids:* AI-invented NPCs/interiors where a roller exists; AI-decided numbers; uncaptured invention.
*Test:* the playtest provenance report — mechanical-origin % should keep climbing (was ~20% → ~60-82% after codex grounding).

### P1b · Text is the primary interface
Genesis is a text-first RPG with visual lenses, not a graphics-first RPG with text fallback.
Blind-playable is a guiding product principle: every important state, route, creature, table,
choice, and consequence should be reachable through prose, structured text, or queryable data.
Maps, models, icons, and battle stages are valuable when they improve comprehension or trust in
the simulation; they are not allowed to become the only readable version of the game.
*Forbids:* visual-only navigation; map-only information; combat state that cannot be read without
the board; authoring tools whose meaning exists only in pixels.
*Test:* a screen-reader / text-only acceptance pass can play, inspect, and author the same material
with no loss of mechanical information.

### P2 · No two playthroughs alike
Emergence over authorship. Spice is **emergent, not engineered** — static band distributions, no
escalation dial; the world gets strange because strange outcomes *happened and persisted*.
The story is in the dice (over-roll, then synthesize).
*Forbids:* timers/dials that force intensity; hand-authored plot spines; reusing a "good" NPC across worlds.
*Test:* two fresh worlds from the same seed inputs should diverge visibly within one session.

### P3 · Fast
The player's *read* of the previous beat should absorb the wait for the next one. Lanes: triage
(built — Sonnet fast-lane / Opus deep), speculative prefetch of **assets, not narration**
(specced, unbuilt), and eventually an in-app DM seat.
*Forbids:* blocking the turn on work that could have been pre-rolled; frontier-priced execution of mechanical steps.
*Test:* fast-lane turns land while the player is still reading; deep-lane turns never exceed the read of a long beat. (Target numbers: set after prefetch P1 playtest.)

### P4 · Meaning & mystery
The slow drip is everything. Handles, not walls — every locked door implies a key somewhere.
Consequences chain to sinks (dead-end / hook / thread-seed / canon-shift); captured inventions
re-enter play. Morrowind-style keyword affordances, open handoffs.
*Forbids:* lore dumps; coaching the player; hooks on every mundane object (reserve for Strange+).
*Test:* the Diversion Rule holds — any thread can be walked away from and the world doesn't sulk; threads left warm re-fire later from the codex.

### P5 · Hard & dangerous
Brutal but fair; death is expected (and rebirth is built). The world contains things larger than
the player but never ambushes unfairly — lethality is telegraphed, and tells are skill opportunities.
Boons matter *because* danger is real.
*Forbids:* rescaling regions to the player; near-miss grace wider than −1/−2; safety-tuning by default.
*Test:* pressure-test every player-favoring system against "too safe?" before it lands.

### P6 · Grim, severe, hilarious
One narrator voice across lives: cinematic narration crossed with gleeful trickery — humor is
non-negotiable, wackiness is licensed (and captured, per P1). But **tone-agency is sacred**: the
player steers; grimdark and rainbow utopia are both honored.
*Forbids:* tonal railroading; joke-punishing; sanding the weird off high-band rolls.
*Test:* the 5-band-samples-per-table protocol — high bands should read EXPLOSIVE, not safe.

### P7 · Depth over breadth
Deepen what exists before adding systems. Don't recreate a magic version of the real world where
everything has a table and a quest. One loop closed beats three loops opened.
*Forbids:* new currencies before the money loop closes; T3/T4 wiring; speculative subsystems.
*Test:* every NEXT-STEPS addition names the existing loop it deepens or closes.

### Pillar scorecard (2026-07-01 audit)

| Pillar | Grade | The gap |
|---|---|---|
| P1 script-owns-truth | **A−** | On-demand generation decided-not-built: rollers exist, live play can't reach them (DM→engine roll handshake unwired) |
| P2 no-two-alike | **A** | Strongest pillar. Saga oracle still unbuilt; synthesis reskin partial |
| P3 fast | **C** | Weakest pillar. Prefetch P1–P3 specced, zero built; only triage lanes live |
| P4 meaning/mystery | **B** | Spine built; captured-invention re-entry lifecycle under-specced |
| P5 hard/dangerous | **B+** | Mechanics green; lethality tuning + monster tactics deferred; escalation ceiling formula open |
| P6 grim/severe/hilarious | **B+** | Charter locked; voice-critical table re-authoring pass still queued |
| P7 depth-over-breadth | **A** | Discipline holding; economy correctly sequenced behind ITEMS |

---

## Part II — Visual identity bible ("Ivalice")

### II.0a ⚠ STYLE COMMITMENT IS PROVISIONAL (Adam, 2026-07-01 evening)

Adam is **not certain he's committed to the engraved-Ivalice look.** He's weighing a **low-poly
fantasy re-skin** (FFT/PS1-era) — motivated by the battle theater likely rendering low-poly 3D, and
the UI wanting to match it. Ruling: the wired batch stands, but **do not push this style deeper**
(no further engraved asset generation, no porting more screens to it) **until a re-skin exploration
happens** — style probes of 2–3 candidate looks on the title + in-session screens, then a decision
recorded here. The architecture keeps this cheap: all skin lives in CSS vars + asset URLs; nothing
structural binds to the style. Everything below in Part II describes the *current* (provisional) skin.

**RULING (Adam, 2026-07-03): ALL ART IS PLACEHOLDER — §II.0b.** Every visual asset in the game
today — procedural geometry, CC0 packs, CC0 textures, AI-generated sprites, the engraved chrome —
is **placeholder by declaration**, however good any of it looks. The aspiration ladder, in Adam's
words: (a) **real game artists** if the game can ever afford them; (b) if the tech matures so
everything can be **dynamically rendered in-game**, that's the future instead; (c) the dream is
the mix — **a real artist directing dynamic generation** to serve a supremely dynamic world
generator. Engineering consequence (already the standing discipline, now doctrine): nothing may
bind deeply to any specific asset — all art enters through swap-cheap seams (CSS vars, asset URLs,
the theater's model/texture/sprite manifests), so any rung of the ladder can replace the current
art without touching a system. Mark asset-adjacent specs and ATTRIBUTION files `placeholder-tier`.

**PARTIAL RULING (Adam, 2026-07-03): the BATTLE SCENE is decided — low-poly 3D, FFT grammar,
three.js, pre-built CC0 packs** (`docs/BATTLE-THEATER.md`; reference frames reviewed in-session:
rectangular tile-column heightfields, discrete height steps, occasional simple incline polygons).
Blockwright pivots to scenery/spell-FX idiom + the theater's procedural fallback figures. The UI
CHROME question stays open: engraved remains the shipped skin (the de-facto hybrid — low-poly scene
inside engraved chrome — is the current state), still probe-gated for any deeper engraved investment.
T6 status: IN BUILD.

### II.0 Provenance ruling (2026-07-01, Adam)

Two mockup lineages exist. **The ChatGPT Ivalice mockups + PNG asset library
(`ui-sketches/ivalice-style/`) are the canon *visual* direction.** The Claude HTML mockup
(`ui-sketches/claude-design-revamp-070126/_mockup-clean.html`) is the canon *layout/structure*
reference (three-zone in-session shell) — its rendering is an approximation, not the target.

**The "too Claude" diagnosis:** the build is CSS-spec-compliant but *asset-starved* — low-res
textures, engraved graphics replaced by Unicode glyphs and flat CSS, typography carrying AI
defaults. **De-Claude = asset fidelity, not more CSS.** Layouts stay; surfaces get real.

### II.1 Palette (locked, from build + mockups)

| Role | Token | Hex |
|---|---|---|
| Ground (stone) | `--stone` / `--stone-2` | `#2c261d` / `#211c15` |
| Parchment | `--parch` / `--parch-2` / `--parch-3` | `#efe6cf` / `#e6d9ba` / `#f7f1de` |
| Ink | `--ink` / `--ink-dim` / `--bone` | `#3c3120` / `#7c6a4c` / `#2b2314` |
| Gold | `--gold` / `--gold-soft` / `--gold-leaf` | `#b58f3c` / `#8a6a24` / `#c9a24b` |
| Edge | `--edge` | `#c3a45c` |
| Steel (rolls/links/keywords-canon) | `--steel` | `#2f6d96` |
| Blood (danger/keywords-threat) | `--blood` | `#a8432c` |
| Gem accents (ornament only) | — | sapphire blue + ruby red, as in the asset jewels |

**Banned:** purple/violet anywhere in product UI (`--strange:#8a5aa0` is legacy — retire or
confine to internal band-debug views). No hue outside the table without a ruling here.

### II.2 Typography

- **Display:** Cinzel (500/600/700). Headings, plaques, buttons — always letter-spaced small-caps style.
- **Body:** EB Garamond (400/500/600). Narration *italic-leaning serif* as in the mockups.
- **Keywords in narration:** bolded affordances; canon-entities in `--steel`, threats in `--blood` (matches mockup usage).
- **The title-screen "GENESIS" and plaque headers are ART, not CSS text** — engraved-gold rendered assets (see II.4). CSS gold-gradient text is the "AI touch" to eliminate.
- Rule: no system-ui/Inter/sans anywhere player-visible.

### II.3 Surface & ornament language

- **Stage metaphor:** dark tooled-stone ground; parchment panels sit on it like documents on a table. Panels get torn/deckled edges (image-borders, not box-shadow alone) at hero scale; crisp hairline gold frames at component scale.
- **Squared corners** in-session (border-radius:0) — everywhere else too, once ported. The rounded-11px legacy on pre-session screens is scheduled for death (T1).
- **Ornament set:** jeweled divider (─ ◆ ─ with sapphire), corner flourishes, plaque banners (dark slate bar + gold frame + gem finials) for scene headers, compass medallions for speaker attribution (YOU/DM), illuminated frame for the active/selected card (as in the Soul-Forging "Human" card).
- **Depth is engraved, not dropped:** inset bevels and embossing over drop shadows.

### II.4 Iconography & the asset library

- **A 30-icon engraved-gold set already exists, sliced and labeled:** `ui-sketches/ivalice-style/assets-iso/extracted/` (book-arcane, helm, compass, scales, book-open, sun, backpack, sword-shield, banner, quill, d20, wand, tome, potion, anvil, hand, council, speech, pin, hourglass, campfire, heart, shield, medallion, key, eye, boot, paw, crown, temple) + decor sheets, hex tile art, micro-icons.
- **Wiring reality (audit 2026-07-01):** `assets/` ships 10 of these icons + 4 corner borders + 3 textures, but `genesis.html` references **only the corners, parchment.jpg, and stone.jpg**. Nothing else is wired. This is the single cheapest de-Claude lever.
- Rule: **no Unicode glyph where an engraved icon exists.** Rail, tabs, badges, event chips, inventory rows all draw from the set. Gaps in the set → generate in the same style (pipeline below), don't substitute.
- **Asset pipeline (already proven):** generate on magenta flat → `assets-iso/extract.py` + `slice-grid.py` → individual PNGs → copy into `assets/icons|borders|textures/` → reference from CSS/render. Textures must be shipped at ≥2× display resolution.

### II.5 Component patterns (canon, from mockups)

- **Scene header:** plaque banner — location name · sun-glyph · Day N · watch (the "Ashenford Crossing | Day 3 · Dusk" pattern).
- **Feed:** compass-medallion speaker marks, generous line-height Garamond, keyword affordances, jeweled dividers between beats. No chat bubbles.
- **Action plaques (RECONCILIATION RULING NEEDED):** the mockups show three suggested-action plaques + "…or something else." This **conflicts with DM-CHARTER §3 open-handoff (no 3-option menus, default OFF)**. Ruling recorded here when Adam makes it; until then, plaques are reserved for *player-initiated* standing verbs (Travel, Rest, Powers), never DM suggestions. *(leaning: keep Charter, repurpose the widget)*
- **Right panel:** framed portrait slot (portrait generation = future graphics item, open), stat cards with colored underline bars, iconized skills/inventory rows.
- **Selection state:** illuminated parchment + gem-finial frame (not a colored outline).

### II.6 Scope

The bible applies to **every player-visible surface**: title, universe, bardo, creator, roster,
in-session, shop (unbuilt — must be born Ivalice), and the future battle theater. The current
in-session view is the *closest* to canon; pre-session screens are the *farthest* and get ported
in T1, not incrementally.

---

## Part III — Roadmap to the dream

Sequencing logic: **stabilize → beautify → close the money loop → wire the nouns → get fast →
clean the layers → then the battle theater** (the graphics-engine trigger). Craft/content runs
as a parallel lane throughout. Depth over breadth: no track opens until its dependency closes.

| # | Track | Status today | Pillars | Rubric-readiness |
|---|---|---|---|---|
| T0 | Housekeeping | ☑ DONE 2026-07-01 (gate 0.2s, docs synced, branches merged) | — | landed |
| T1 | De-Claude visual pass | ◐ wiring half DONE 2026-07-01 (icons/textures/squaring); asset-gen list = ASSET-PROMPTS.md | P6 | asset gaps = Adam+image-gen |
| T2 | Economy + Shop UI | ☑ BUILT 2026-07-01 (engine + panel + attitude tint; dice overlay rode along) | P7, P4 | landed |
| T3 | On-demand generation handshake | decided 2026-06-30, unbuilt | P1, P2 | needs spec (payload shapes) |
| T4 | Speed: prefetch + DM seat | specced (P1 buildable now) | P3 | P1 near-ready; P2/P3 need bridge spec; seat needs interface spec |
| T5 | Pre-graphics hygiene | 22 layer warnings, render.js 859 lines | — | Sonnet-ready (mechanical) |
| T6 | Battle theater (band-lane) | **locked 2026-07-01**; zero built | P5 + graphics | needs full spec (the big one) |
| T7 | Meaning & craft lane | re-authoring plan exists; Saga oracle unbuilt | P4, P6 | re-authoring = Adam's hands; Saga = needs spec |

### T0 · Housekeeping (do immediately)
1. **`check-manifest.py` is 2m43s** (145s CPU; the 632-symbol ownership scan across 8.9MB incl.
   generated data). A per-edit gate must be seconds — single-pass scan / precompiled patterns /
   exempt generated `data/*.js` from symbol-grep. Acceptance: same 65-module OK output, <5s.
2. **Docs sync:** ECONOMY, SHOP-UI, IN-SESSION-UI, DESIGN-GUIDE into `docs/README.md` index;
   HANDOFF's "next tracks" updated (UI pass is *in progress on feat/in-session-ui*, not future).
3. **Merge `feat/in-session-ui`** after verify (`verify-in-session-ui.mjs` + check-manifest).
4. Retire `--strange` purple var from product paths.

### T1 · De-Claude visual pass
Wire the existing library (icons/borders/textures already in `assets/` or one copy away), replace
CSS-gold headers with engraved art, port pre-session screens (title → universe → bardo → creator →
roster) to the bible, ship ≥2× textures. Asset gaps (title art at res, rail icons for
Actions/Map/Menu, plaque frames as 9-slice) get generated via the proven magenta-flat pipeline.
*Adam's call per screen batch: layout stays, only surfaces change.*

### T2 · Economy + Shop UI
As specced: `previewBuy`/`previewSell` pure validators → `item_changed`; place-tier stock; merchant
coin saturation. Shop UI is born-Ivalice (contextual panel, `open_shop` event). Blocked only on T0.3.

### T3 · On-demand generation handshake (engine owns the nouns)
① ambient NPC pool at inhabited nodes → ② `rollBuildingInterior` on building entry → ③ the generic
DM→engine "request a roll" bridge handshake (generation mirror of `rollRequest`; also the seam the
pluggable DM seat will use). Spec must lock payload shapes (rubric #1/#2).

### T4 · Speed (the C-grade pillar) + the DM seat
- Prefetch **P1** (deterministic reserve — pre-rolled atoms, no LLM) is buildable now.
- **P2/P3** (idle-window asset compile over the bridge; draw-on-match) after P1 playtest sets pool/eviction numbers.
- **DM seat (locked 2026-07-01):** Genesis eventually ships with a built-in AI **or an empty seat
  any AI can occupy.** Therefore: one `DMClient` interface (digest in → typed events + prose out),
  bridge as the first implementation, API client as the second. Every future DM-touching feature
  codes against the seat, not the bridge.

### T5 · Pre-graphics hygiene
Fix the 22 upward layer calls (mostly `world.render` → L4 verbs; invert via events/callbacks),
flip check-manifest layer check warn→hard-error, split `render.js` (scene / panels / chrome).
This is the cheap insurance that makes T6's ES-module + bundler migration boring.

### T6 · Battle theater — the graphics-engine milestone
**Locked (2026-07-01): band-lane theater.** Visualize the four existing range bands
(Melee/Near/Far/Out) as staged lanes with tokens, turn presentation, and animation — **no
coordinates invented**; the symbolic-space thesis holds. Rides the built combat engine + SRD layer.
Sequence within the track:
1. **Combat tracker panel** (DOM, in the current shell) — initiative, HP/conditions, band strip.
   Proves the data contract cheaply.
2. **Scene objectification fast-follow** — cover/hazards/exits as structured objects (walk/dungeon
   generators already carry the prose); these become the theater's stage props.
3. **The theater itself** — canvas/WebGL layer. This is the trigger (per SCALING.md) for:
   ES-module migration + bundler + rebinding the 59 inline handlers via event delegation, done
   together in one pass. Hex tile art from the asset library becomes ground texture.
4. Later dials: per-creature initiative, monster tactics ("Fable upgrades"), portraits.

### T7 · Meaning & craft lane (parallel, Adam-led)
The re-authoring sweep (every row up-to-par + EXPLOSIVE high-band twists), voice-critical tables,
Saga oracle (death-vision payoff), synthesis reskin completion, session shapes. This lane is where
*meaning, mystery, wackiness* live — it never blocks and is never blocked.

### Standing don'ts
No T3/T4 tier wiring (LEVEL_CEILING stays the un-cap point) · no grid/coordinate combat · no new
currencies before the money loop closes · no hand-editing generated files · no new mutable state
outside `GS` · no DM-suggestion menus in UI (Charter §3).

---

## Appendix — Interview log (2026-07-01)

Locked with Adam this session:
1. **"Too Claude" =** asset fidelity gap, not layout: ChatGPT Ivalice mockups are the visual canon; textures low-res; graphics unimplemented; typography carries AI defaults.
2. **Battle visuals = band-lane theater** (no coordinates).
3. **Design guide = all three parts** (pillars + visual bible + roadmap), this document.
4. **Product posture = playable over the bridge now; eventually ships with built-in AI or an empty DM seat** → the `DMClient` interface is load-bearing architecture.

Later same day (evening additions): shop rulings ×4 (tabbed panel · confirm-on-plaque ·
attitude-tinted prices · coin-pool hidden) · dice overlay rulings ×4 (CSS/SVG · every player-facing
roll · click-to-roll · Ivalice engraved) · **style commitment downgraded to PROVISIONAL** (§II.0a —
low-poly FFT re-skin under consideration; no deeper engraved investment until probes).

Open decisions queue (for future rulings, gathered from the audit):
**THE SKIN (§II.0a — blocks deep visual work):** engraved-Ivalice vs low-poly-FFT vs hybrid (low-poly
battle scene inside engraved chrome) — decide via style probes. ·
action-plaques vs open-handoff reconciliation (II.5) · attunement-conflict UX at the 4th item ·
capture-loop branching & disposition lethality · NPC honesty-curve distribution + Tell table ·
travel encounter pacing rate · escalation ceiling formula · threat-level UI (fiction-only?) ·
milestone level-override (leaning no) · prefetch pool cap/eviction/persistence · portrait
generation (future graphics item).
