---
type: canon
status: ACTIVE — stable decision ids over the chronological registries
created: 2026-07-22
updated: 2026-07-29
owner: docs/canon/README.md (precedence law)
---

# Decision Index — stable ids, current rulings, and supersession chains

`docs/DESIGN.md` remains the chronological locked-decision registry and the wave records remain
the semantic authority for their subjects — this index does not re-decide anything. It gives
each decision *family* a stable id, states the current ruling in one line, links the owning
source, and records implementation state and the supersession chain, so "where is the current
ruling?" is one lookup instead of an archaeology dig.

Wave-era decisions already have stable ids (`O/G/P/F` + wave number, e.g. `P6.5`, `F10.9g`);
this index references them at family level and does not rename them. Coverage of every
individual questionnaire id lives in [QUESTION-COVERAGE.md](QUESTION-COVERAGE.md).

**State vocabulary:** BUILT (in code, verified) · ACCEPTED (design-closed, unbuilt) · SPECCED
(spec exists, build not authorized/scheduled) · PROPOSED (awaiting Adam) · SUPERSEDED (chain
noted). Implementation states of wave rulings are UNAUDITED by default (ledger banner).

## A. Product identity and doctrines

| id | Current ruling | Source | State |
|---|---|---|---|
| GEN-PROD-1 | Genesis is a standalone single-player TTRPG video game; worlds persist forever; one active world, universe of many | DESIGN.md 2026-06-17/18 | BUILT |
| GEN-PROD-2 | The AI DM narrates, definitively; dice transparency ≠ silent DM | DESIGN.md 2026-06-18 | BUILT |
| GEN-PROD-3 | Anti-drift north star: deterministic state layer authoritative; AI interprets; "can the script own this?" | DESIGN.md §North star | BUILT (doctrine) |
| GEN-PROD-4 | TTRPG freedom + unbounded replayability over BG3-style authored geometric accuracy | Wave 1 §8.12.3 | ACCEPTED (law) |
| GEN-LAW-1 | SPEED doctrine: AI does only AI jobs; no model calls in mechanical loops | SPEED-DOCTRINE.md | BINDING |
| GEN-LAW-2 | TEXT-FIRST FOREVER: prose-only Genesis must always run | DREAM-HORIZON.md | BINDING |
| GEN-LAW-3 | BLIND-PLAYABLE FULLY: full screen-reader session is an acceptance gate | DREAM-HORIZON.md; DESIGN-GUIDE P1b | BINDING |
| GEN-LAW-4 | All art is placeholder by declaration; swap-cheap seams only | DESIGN-GUIDE §II.0b (2026-07-03) | BINDING |
| GEN-LAW-5 | Golden-beat preservation: retain/rewire/recompose/retire-with-replacement-proof | Wave 1 §8.11 | BINDING |
| GEN-LAW-6 | Validators preserve the thing's job — never satisfy one mechanically | CLAUDE.md (2026-07-07) | BINDING |
| GEN-LAW-7 | Tier 2 cap (levels 1-10); `LEVEL_CEILING` is the single un-cap point | TIER-SCOPE.md | BUILT |
| GEN-LAW-8 | Edit-source → compile-artifact; generated files never hand-edited | DESIGN.md 2026-06-18; CLAUDE.md | BUILT |
| GEN-LAW-9 | No-cash operating ceiling ~$200/month; paid anything is evidence-linked funding-gated | Wave 10 §11.110-112 | ACCEPTED (law) |
| GEN-PROD-5 | Workbench is an internal instrument now (Adam+agents+QA); player-facing creator surface = tracked feature goal, promoted via P11.1 seams on post-MVP evidence | wave-11 §19.4 founder ruling (2026-07-22, Q11-A B) | ACCEPTED |
| GEN-PROD-6 | Local-first, zero telemetry, explicit-export sharing only; opt-in diagnostics only ever as a future explicit founder decision through the existing consent seam | wave-12 §20.4 founder ruling (2026-07-22, Q12-A A) | ACCEPTED |
| GEN-PROD-7 | No-dark-patterns law: "i am not a data broker" — Genesis thrives without dark practices or patterns (no data brokering, manipulative retention/monetization, or consent traps); wraps and exceeds GEN-PROD-6 | wave-12 §20.6 founder ruling (2026-07-22/23, P12.8 sweep) | BINDING |

## B. World, state, and persistence

| id | Current ruling | Source | State |
|---|---|---|---|
| GEN-WLD-1 | World State Ledger = single home for all change-over-time | DESIGN.md 2026-06-18 | BUILT |
| GEN-WLD-2 | Write-once canon; motivated lies layer over canon, never rewrite | DESIGN.md 2026-06-17 | BUILT |
| GEN-WLD-3 | Spatial model: node-graph cognition + lazy hex substrate; travel is scene-to-scene | SPATIAL-MODEL.md | BUILT |
| GEN-WLD-4 | Codex relational entity layer; engine rolls atoms, AI assigns meaning; codex written only via events | CODEX.md; DESIGN.md 2026-06-24 | BUILT |
| GEN-WLD-5 | Death loop: 49-day bardo, 14 Saga vision-rolls, successor creation, connected plane | DEATH-AND-REBIRTH.md | BUILT |
| GEN-WLD-6 | Forever-storage protection class (IndexedDB migration, IRONMAN saves) | FOREVER-STORAGE.md | BUILT |
| GEN-WLD-7 | Sparse structural persistence: one canonical record, typed refs/receipts, dedup payloads, separate narration, chunked storage, scoped retrieval; codec = Wave 12 measurement | Wave 6 §15.6 (G6.1) | ACCEPTED |
| GEN-WLD-8 | Active/site/cold are projections of one owner; idempotent handoffs | Wave 2 P2.12 | ACCEPTED |
| GEN-WLD-9 | Versioned commitment capsules preserve latent canon across engine/table versions | Wave 2 §10.11.17 | ACCEPTED |
| GEN-WLD-10 | Default permanence: persistent-until-repaired; scarring is the norm; compaction summarizes, never erases; per-realm decay flavor only through owners | wave-08 §17.4 founder ruling (2026-07-22, Q8-A B) | ACCEPTED |

## C. DM seat, events, and invention

| id | Current ruling | Source | State |
|---|---|---|---|
| GEN-DM-1 | DM Charter: one voice across lives; grim/severe/hilarious; open handoff; verbatim player dialogue; no NPC bleed | DM-CHARTER.md | BUILT (living) |
| GEN-DM-2 | Typed event contract; detected > declared; DM never invents a number | EVENT-CONTRACT.md | BUILT |
| GEN-DM-3 | Normalization once at the contract boundary (dmFoldPayload/DM_EVENT_FIELDS) | CLAUDE.md discipline | BUILT |
| GEN-DM-4 | DMClient seat abstraction; bridge first, API second; every DM feature codes to the seat | DESIGN-GUIDE T4; DM-SEAT.md | BUILT (bridge) / SPECCED (API) |
| GEN-DM-5 | Provider-neutral seat: any supported LLM, same facts/mechanics/refusals; Gemini = proving provider only | Wave 10 §11.83 | ACCEPTED |
| GEN-DM-6 | Engine-first resolution receipts; "Open intent, constrained outcome"; no narration of engine-rejected events | Wave 2 §10.11.25-26 | ACCEPTED |
| GEN-DM-7 | Transactional creative DM: SYNTHESIZE lane, C0-C4 matrix, valence-neutral, graduated counters, P0-P4 precedents; full semantic resolver = core vision | Wave 2 G2.1 (§10.G2.1.5-13) | ACCEPTED |
| GEN-DM-8 | DM dressing improvisation: prevalidated latent reserves; tiny allowlist until "the DM seat proves itself" (class-by-class conformance) | Wave 2 §10.11.2; Wave 5 P5.8/F5.8a | ACCEPTED / EVIDENCE-GATED |
| GEN-DM-9 | Private tiered DM deliberation sandbox; nothing canonical; benefit A/B-tested | Wave 2 G2.1-DM-SCRATCH | ACCEPTED / EVIDENCE-GATED |
| GEN-DM-10 | DM hand: MUST PLAY→…→LOCAL SPICE; service guarantees; deferral raises pressure | Wave 1 §8.10 | ACCEPTED (Wave 9 owns detail) |
| GEN-DM-11 | DM initiative default: forward-leaning weaver on a versioned campaign-profile surface; Adam: tune through gameplay later — the surface, not a reopen, is the tuning point | wave-09 §18.4 founder ruling (2026-07-22, Q9-A B) | ACCEPTED |
| GEN-DM-12 | New-player assistance default: reactive affordance help — capability summaries on request, never suggestions; no unprompted coaching; tutorial voice = tracked later register | wave-09 §18.4 founder ruling (2026-07-22, Q9-B B) | ACCEPTED |

## D. Combat, crits, and tactics

| id | Current ruling | Source | State | Chain |
|---|---|---|---|---|
| GEN-CBT-1 | Script owns numbers, DM owns decisions; side-based initiative; theater-of-mind zones | COMBAT.md; DESIGN.md 2026-06-21 | BUILT | current runtime |
| GEN-CBT-2 | 12-zone band/lane battlemap | BATTLEMAP.md | BUILT | → demotes to derived fallback at GEN-CBT-3 cutover |
| GEN-CBT-3 | Exact-cell SpatialPlan combat authority on the BattleMat; explicit Dash source; bounded undo; route warnings | Wave 10 §11.6-11.11 (F10.1e-j) | ACCEPTED | supersedes GEN-CBT-2 at Wave-12-authorized cutover; Wave 7 specifies tactical laws |
| GEN-CBT-4 | EngagementLens mandatory; receipt-derived; never a second authority; deterministic block initiative + ±3 edges + BG3-style ribbon | Wave 10 §11.19-11.33 | ACCEPTED | |
| GEN-CBT-5 | Crit Magnitude: nat20/1 → magnitude die → lens cascade | CRIT-MAGNITUDE.md | BUILT | → recalibrated by GEN-CBT-6 |
| GEN-CBT-6 | Crit recalibration: surfaced-spotlight eligibility, no crit fishing, 15/3/1/1 ladder, only 20/20 mutates world, d3+2 lenses, inverted nat-1 mirror, Mythic/Worldbreaker profiles, TerminalDisposition | Wave 2 §10.11.28-50 | ACCEPTED — doc/impl amendment deliberately pending | supersedes GEN-CBT-5's ladder + `obliterated`; CRIT-MAGNITUDE.md remains the built behavior until authorized amendment |
| GEN-CBT-7 | Degrees of failure: margin-graded outcomes; tight near-miss grace | memory-canonized ruling; DIFFICULTY.md | BUILT | |
| GEN-CBT-8 | No reactive scaling; fixed regional power bands; telegraphed danger | DIFFICULTY.md; Wave 1 §8.11 | BUILT (doctrine) | |
| GEN-CBT-9 | Enemy acumen default: doctrine/INT-tiered competence on a centralized versioned control surface; flavor-first/ruthless-optimal stay selectable profiles later | wave-07 §16.4 founder ruling (2026-07-22, Q7-A B) | ACCEPTED | |

## E. Content, tables, and spice

| id | Current ruling | Source | State | Chain |
|---|---|---|---|---|
| GEN-TBL-1 | Markdown tables = source of truth; compiler validates; frontmatter stamped corpus-wide | DESIGN.md 2026-06-18/19 | BUILT | |
| GEN-TBL-2 | Spice Curve: five-band honest static rarity; emergent, not engineered | SPICE-CURVE.md | BUILT | §1 distribution → GEN-TBL-3 |
| GEN-TBL-3 | SPICE-RAISE: tier-weighted band-first rolling as play distribution | SPICE-RAISE.md (2026-07-06) | SPECCED (adopted stance; build deferred) | supersedes SPICE-CURVE §1 share law |
| GEN-TBL-4 | Consequence Ladder: band ≠ legs; demand-not-supply; Diversion Rule | CONSEQUENCE-LADDER.md | SPECCED (pilot BUILT) | |
| GEN-TBL-5 | Spice non-cascade: no downward ceiling, no upward averaging; causal Spice graph | Wave 1 §8.17 | ACCEPTED | |
| GEN-TBL-6 | The dungeon d200 decomposes; composites survive as named recipes; provenance retained | Wave 1 §8.14 | ACCEPTED (audit not yet authorized) | supersedes d200-as-architecture (runtime keeps it until cutover) |
| GEN-TBL-7 | Loot: doers vs pointers; rarity-axis remap; catalog availability never creates world inventory | LOOT-REMAP.md; codex-roll doctrine; Wave 2 P2.16 | BUILT + ACCEPTED extension | |

## F. Visual layer and art

| id | Current ruling | Source | State | Chain |
|---|---|---|---|---|
| GEN-VIS-1 | Pixel sprites = canon figure register; per-realm style law quoted verbatim | ART-DEPARTMENT.md (Adam 2026-07-15) | BUILT (live corpus) | supersedes creature-3D lane (SPRITE-TRANSITION 07-09 lock) |
| GEN-VIS-2 | Faceted register = RESERVE; prop/decal/kit contracts | ART-DIRECTION-CANON.md | BUILT (reserve) | |
| GEN-VIS-3 | Graphics Convergence Charter governs all graphics work; protected walk/table core; measured convergence to approved mocks | GRAPHICS-CONVERGENCE-CHARTER.md | BINDING | |
| GEN-VIS-4 | Walk-native boundary: graphics PROJECT the walk (walkSceneFrom); dioramas are provenanced projections | WALK-NATIVE-A.md; WALK-CARD-DEALING.md | BUILT (boundary) | |
| GEN-VIS-5 | Release-direction candidate: PreAlpha BattleMat + EngagementLens; hybrid 3D substrate + pixel citizens; theater = feature-flagged laboratory | Wave 10 P10.1/F10.1c | ACCEPTED | supersedes TABLETOP-VISION sequence + DESIGN-GUIDE T6 as destination; final release selection reserved for Adam (P10.12) |
| GEN-VIS-6 | One fixed production camera family (~20°/35°/45° provisional); no player rotation; governed focus/cutaway | Wave 3 §12.13 | ACCEPTED | supersedes W10 F10.6g rotation clause |
| GEN-VIS-7 | Beauty floor is invariant; visual downgrade reduces generator complexity, never lighting/materials/sprites/beauty; 3D engine not deleted | Wave 10 P10.5; QUESTIONNAIRE §promotion | ACCEPTED | |
| GEN-VIS-8 | No-clone law: procedural culture constitutions + material variation; never one sprite per modification | Wave 3 §12.2/§12.8 | ACCEPTED | |
| GEN-VIS-9 | Reversible asset lifecycle: semantic slots, deterministic fallbacks, offline-total, provenance/rights quarantine | Wave 10 P10.11 | ACCEPTED | |
| GEN-VIS-10 | Brightness law + 9 visual-campaign laws; PS1 retired game-wide | visual-campaign rulings 2026-07-10/11 | BUILT | |

## G. The procedural-dungeon program (route)

The program's decisions live in the wave records; this index routes rather than duplicates.

| id | Family | Owner | State |
|---|---|---|---|
| GEN-PDG-1 | Program method: tile/slot room compiler; function-first rooms; engine owns structure and decoration; wave closure protocol | FOUNDATION.md; DESIGN.md 2026-07-18 | ACCEPTED |
| GEN-PDG-2 | Waves 1-6 + 10 semantics | wave-01…wave-06, wave-10 records + phasing audits | CLOSED (design only) |
| GEN-PDG-3 | Cross-wave phasing law; Clay Proof Ladder; Feature-Promotion Ledger | PHASING-FRAMEWORK.md; CLAY-PROOF-LADDER.md; FEATURE-PROMOTION-LEDGER.md | ACCEPTED |
| GEN-PDG-4 | First implementation priority: mechanics → BattleMat+EngagementLens → provider-neutral seat → persistence/recovery, one retained room | Wave 10 §11.81; ladder law 11 | ACCEPTED |
| GEN-PDG-5 | Implementation hold: no build authorized before Wave 12's gate | IMPLEMENTATION-HOLD.md | ACTIVE |
| GEN-PDG-6 | Waves 7-9/11-12 dispositions: **ALL CLOSED** at the 2026-07-22/23 founder-review session (W7 §16.7 · W8 §17.7 · W9 §18.7 · W11 §19.7 · W12 §20.7) with founder Batch-1 rulings, sweep riders (hand floor, harness-first, no-plot-armor, three-tier worlds, visual-engine priority, never-brick), and 10 tracked follow-ups (F7.1-3, F8.1-2, F9.1-3, F11.1, F12.1). **The design program is complete; build stays gated on Q12-B** | wave-07…wave-12 records | CLOSED (design only) |
| GEN-PDG-7 | Recovery-package gate: tagged, verified, LFS-complete recovery point + bundle + Drive archive is the first gate of any implementation plan | Wave 1 §8.14.1/.3 | ACCEPTED (Wave 12 owns) |
| GEN-PDG-8 | Golden Sites are a provenance-backed acceptance portfolio, not twelve runtime site types; host programs, cross-host transforms, scale/relationship cases, and substrate/ownership cases compose through one story→semantic→spatial→projection path | DESIGN.md 2026-07-26; GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md | ACCEPTED FOUNDATION; build routes through GEN-PDG-11/12 |
| GEN-PDG-9 | Site 8 is the `LayeredControl` cross-host transform; persistent competing claims decide canon, semantic capacity decides spatial expression, and map growth requires prelicensed overflow | DESIGN.md 2026-07-26; GOLDEN-SITE-ONTOLOGY-ENGINE-MARRIAGE.md | ACCEPTED FOUNDATION; build routes through GEN-PDG-12 |
| GEN-PDG-10 | Tavern is an ordinary venue/host program routed through Site 2/4/10 contexts and Site 3/8 transforms; `VENUE-TAVERN-01` is a retained Golden Venue fixture, not Site 13 | DESIGN.md 2026-07-26; TAVERN-VENUE-ROUTING-BRIEF.md | ACCEPTED (live story path; spatial proof open) |
| GEN-PDG-11 | Terrain synthesis and building/site construction are two stages of one Procedural Vignette Synthesizer sharing request, macro plan, support/elevation, tactics, assets, receipts, and projections; a second terrain/town/building engine is forbidden | ART-DIRECTION-CANON.md 2026-07-29; GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md | BINDING / WAVE-GATED BUILD |
| GEN-PDG-12 | The Golden Site master program is the next several-week execution owner; Wave 0 is authorized now, later waves enter only through their gates, and every wave includes appropriate walk-demand, game-flow, PC/enemy battle, visual, asset, and determinism evidence | GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md | FOUNDER-AUTHORIZED PROGRAM |
| GEN-PDG-13 | Waves 1–2 integrate through versioned `VignetteRequest`, `VignettePlan`, `SemanticAssetDemand`, and `SynthesisReceipt` boundaries; natural terrain is a connected responsive field, constructed form records its join, and random tile slopes/zipper seams/global height caps are rejection controls | GOLDEN-SITE-VIGNETTE-CONTRACTS.md; DESIGN.md 2026-07-29 | WAVE-0 FROZEN / BINDING |
| GEN-PDG-14 | Gate W0 passed with open-work ownership, retained Tavern/Guard selectors, checked-in unseeded census before-state, Wave-1 observatory brief, and green pre-change walk/game/combat/save/terrain/Clayroom baselines; Wave 1 is authorized next | GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md; intel/golden-vignette-wave0-baseline.md | PASS / WAVE 1 NEXT |
| GEN-PDG-15 | Gate W1 passed with a deterministic 12,718-row read-only corpus, eight adapters, six-way dispositions, complete source treatment, proxy-only role demand, stable Tavern/Guard selectors, and green retained production gates; combined `Prison / Asylum` demand remains explicitly unresolved; Wave 2 is authorized next | GOLDEN-SITE-WAVE-1-OBSERVATORY-BRIEF.md; intel/golden-vignette-wave1-verification.md | PASS / WAVE 2 NEXT |

## H. Operations and infrastructure

| id | Current ruling | Source | State |
|---|---|---|---|
| GEN-OPS-1 | Git workflow: never commit to master; type/slug branches; --no-ff merges; worktree-per-session | CLAUDE.md (2026-06-21/07-08) | BINDING |
| GEN-OPS-2 | Fast checkpoint ≠ final clean close; two commit modes | CLAUDE.md (2026-07-19) | BINDING |
| GEN-OPS-3 | LFS live (2026-07-18); no new worktrees without GIT_LFS_SKIP_SMUDGE; heavy assets fetch-on-demand | DESIGN.md infra note; ASSET-SYNC.md | BUILT |
| GEN-OPS-4 | Doc auto-archive caps (CHANGELOG 25 / NEXT-STEPS 4 blocks); token discipline; Read-denies on generated files | CLAUDE.md (2026-07-09) | BINDING |
| GEN-OPS-5 | Play/Dev port split; blessed play branch | RELEASE-CHANNEL.md | BUILT |
| GEN-OPS-6 | jsdom-only CI; dep-aware auto-skip harnesses; drift harnesses gate by regeneration | CI posture (2026-07-19) | BUILT |

## Reopen law

Any entry reopens only through its owning source's protocol: wave rulings via the explicit
reopen-with-contradiction law; DESIGN.md decisions via a new dated block that names what it
supersedes; doctrines only by Adam explicitly. An index entry is never itself the instrument of
change — it records one.
