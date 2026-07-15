---
type: consolidation-ledger
project: Genesis
packet: PACKET-F1
created: 2026-07-13
runtimeAdmitted: false
status: SOURCE-STAGED — no cleanup, slicing, compile, or runtime admission performed
---

# PACKET-F1 — Fantasy Faceted Figure Factory: consolidation & Step-E ledger

Post-generation reconciliation of lanes 1–6 (+ extruded) into the canonical pilot tree.
**Nothing here is admitted to runtime.** This ledger is for cleanup/slicing triage only.
No alpha-clean, no compile, no isolated/integrated QA, no admission was performed.

## What was consolidated (the F1 delta only)

Canonical target: worktree `Genesis-faceted-f1-consolidation`, branch
`codex/faceted-f1-consolidation`, forked from `master` (uncommitted staging).

| bucket | count | source |
| --- | --- | --- |
| `raw-figures/` figure candidates | 45 | lane1 (20) + lane2 (7) + lane3 (4) + lane4 (6) + lane5 (8) |
| `raw-sheets/` kit source sheets | 10 | lane6 F1 fill-in attempts (`fantasy-lane6-*`, candidate-001 + -002) |
| `contact-sheets/` | 3 | lane1 (2) + lane2 (1) |
| `provenance/` records | 7 | one per lane (lane3 reconstructed; see below) |

Every raw PNG was copied **verbatim** (filenames unchanged) to keep the call-id ↔ filename
mapping in provenance intact. Provenance carries `runtimeAdmitted:false` throughout.

## Verdict summary (Step E immediate source rejection)

Figures: **25 ACCEPT · 20 HOLD · 0 REJECT_SOURCE** (all 45 clear the hard source gates).
Kit sheets: **0 pass · 10 REJECT_SOURCE** (chroma gate, per lane6 self-report — see below).

"HOLD" = usable raw candidate that carries a caveat to resolve at slice/cleanup or by picking
a better sibling candidate; not a source rejection. "ACCEPT" = clean raw candidate.

### Lane 1 — anchor five (20 candidates; each identity has 4)

| candidate | verdict | reason |
| --- | --- | --- |
| bandit-enforcer-001 | HOLD | heavyset/paunchy — violates §0 rawboned silhouette (non-diegetic girth) |
| bandit-enforcer-002 | HOLD | thickset build — same §0 silhouette violation |
| bandit-enforcer-003 | **ACCEPT** | tall rangy rawboned; full kit; on-language |
| bandit-enforcer-004 | **ACCEPT** | best bandit; lanky, compact support (value read slightly murky) |
| feral-guard-dog-001 | HOLD | broad ¾ side stance (base-law) + boar-like dorsal ridge drifts off-noun |
| feral-guard-dog-002 | HOLD | spread stance + spiky ridge |
| feral-guard-dog-003 | **ACCEPT** | best dog; compact front stalk, all landmarks, no anthropomorphism |
| feral-guard-dog-004 | **ACCEPT** | compact, leaner; landmarks present |
| undead-knight-001 | HOLD | doubled/overlapping second kite shield artifact |
| undead-knight-002 | **ACCEPT** | best knight; clean split kite shield + all landmarks |
| undead-knight-003 | **ACCEPT** | clean single-shield read, full crop |
| undead-knight-004 | HOLD | same doubled-shield artifact as 001 |
| adult-black-dragon-001 | HOLD | wings raised/spread, not half-furled (base-law) |
| adult-black-dragon-002 | HOLD | wings wide + sprawling silhouette |
| adult-black-dragon-003 | HOLD | compact seat/tail good but wings still open |
| adult-black-dragon-004 | **ACCEPT** | only candidate with genuinely half-furled wings + compact coil |
| ornate-heraldic-shield-001 | HOLD | 3D relief (not flat front elevation) **+ GREEN chroma bleeding through empty gem socket** |
| ornate-heraldic-shield-002 | HOLD | raised relief/bevel — not a pure flat identity layer |
| ornate-heraldic-shield-003 | HOLD | flattest of the set but still relief; best shield candidate |
| ornate-heraldic-shield-004 | HOLD | strong dimensional bevels + baked lighting |

Anchor notes: shield set is **weak as a group** — none reads as the strict flat front-elevation
the prop contract (§7) demands; treat as style evidence, not prop-contract admission. Bandit
001/002 fail the §0 silhouette law, so only 003/004 are usable there.

### Lane 2 — undead wave (7 sheets)

| candidate | cells | verdict | reason |
| --- | --- | --- | --- |
| skeleton + skeleton-warrior -001 | 2/2 | **ACCEPT** | distinct footman vs. drilled soldier, varied poses |
| skeleton-archer + flaming-skeleton -001 | 2/2 | HOLD | flame reads as a **VFX plume overspraying the silhouette** — cutout-pollution risk (§6 effect-forward) |
| zombie + zombie-plague-carrier -001 | 2/2 | **ACCEPT** | minor: plague carrier's hands not clearly rag-wrapped |
| minotaur-skeleton -001 | 1/1 | **ACCEPT** | sheared horn present; compact |
| warhorse-skeleton -001 | 1/1 | **ACCEPT** | barding straps on bone; rearing, in-frame |
| ogre-zombie -001 | 1/1 | **ACCEPT** | grey corpse dragging splintered club |
| eye-tyrant-zombie -001 | 1/1 | HOLD | trailing eye-stalks crowd/clip the bottom edge (tight crop) |

### Lane 3 — goblinoid + kobold (4 sheets)

| candidate | cells | verdict | reason |
| --- | --- | --- | --- |
| goblin-warrior+minion+hexer+cutter -020 | 4/4 | **ACCEPT** | clean 2×2, all landmarks, no cute drift |
| goblin-boss+kobold+urd -021 | 3+empty/3+empty | **ACCEPT** | correct remainder (4th cell empty chroma); boss breadth is diegetically permitted |
| hobgoblin-soldier+captain -022 | 2/2 | **ACCEPT** | crop caution — tower-shield/longsword tips near bottom edge (intact) |
| hobgoblin-iron-shadow -023 | 1/1 | **ACCEPT** | lean disciplined; feet intact |

No cuteness/chibi drift anywhere in lane 3 — the top risk for goblins/kobolds — judged clean.

### Lane 4 — bandit + cultist (6 sheets)

| candidate | cells | verdict | reason |
| --- | --- | --- | --- |
| bandit + desperate-bandit -020 | 2/2 | **ACCEPT** | grounded, rawboned |
| bandit-captain + deceiver -021 | 2/2 | HOLD | saber tip near lower-left edge + faces drift mildly BG3-glamour |
| bandit-courier + crime-lord -022 | 2/2 | **ACCEPT** | crime-lord reads as **diegetic weight, not caricature** (§0 exception correct) |
| cultist + fanatic -023 | 2/2 | HOLD | robed cultist's left shoe reads **magenta-tinted — possible chroma bleed into figure**; verify |
| death-cultist + fiend-cultist -024 | 2/2 | **ACCEPT** | censer, sinew seams, wrong-arm all present |
| elemental + aberrant-cultist -025 | 2/2 | **ACCEPT** | opposed hems; extra hand-joints; eye-sigils |

### Lane 5 — guards, faces + beasts (8 sheets)

| candidate | cells | verdict | reason |
| --- | --- | --- | --- |
| guard + guard-captain -020 | 2/2 | **ACCEPT** | halberd/ledger contrast clean |
| road-guard-elf + dwarf-captain -021 | 2/2 | **ACCEPT** | longbow + worn axe-haft |
| dragonborn-temple + enforcer -022 | 2/2 | HOLD | glaive tip crowds left edge + temple-guard armor glossy (watch MMO-glamour) |
| orc-caravan-guard + blacksmith -023 | 2/2 | **ACCEPT** | blacksmith = **trade-built diegetic mass, not caricature** (§0 flag adjudicated) |
| orc-healer -024 | 1/1 | **ACCEPT** | herb satchel, careful hands |
| giant-wolf-spider -025 | 1/1 | HOLD | **legs splay OUTWARD and crowd L/R edges — §0 base-law broad-base violation**; regen for a tighter legs-under-body crouch |
| shield-guardian -026 | 1/1 | HOLD | feet close to bottom crop edge (tight, not cut) |
| guardian-naga -027 | 1/1 | **ACCEPT** | coils stacked tight (base-law satisfied) |

Lane-5 flags resolved: spider base too broad (HOLD/regen), shield-guardian feet tight (HOLD),
blacksmith mass reads diegetic (ACCEPT).

### Lane 6 — state-family kit sheets (10 sheets) — ALL REJECT_SOURCE

Per `provenance/lane6-state-family-kits-report.json` (self-reported Step-E, **not independently
re-verified in this pass**): 5 kit families (banded-oak-door, wall-lever, painted-dragon-tablet,
torn-war-banner, floor-trap-plate) × 2 attempts, all `REJECT_SOURCE` on the chroma gate —
non-uniform green borders (115–154 sampled colours vs. uniform #00FF00), plus per-family issues
(door arch frame/leaf mismatch, lever grid-line contamination, banner rod/pole, floor-plate reads
as extruded tile not flat decal). **0 admitted.** No kit source is cleanup-ready; the known
arched-door reject that seeded this lane remains unresolved.

## Reconciliation findings (collisions / mismatches / gaps)

1. **Duplicate candidate NUMBERS across lanes 3/4/5.** Each lane numbered independently from 020:
   lane3 = 020–023, lane4 = 020–025, lane5 = 020–027. Numbers 020–023 exist in all three lanes;
   024–025 in lanes 4 & 5. Filenames do **not** collide (distinct slugs), so the flat
   `raw-figures/` merge is safe — but the bare `candidate-NNN` id is **not** pilot-unique. Any
   downstream index keyed on candidate number must also key on slug/lane.
2. **Naming-convention drift.** Lanes 1 & 2 use the packet's `spr-fantasy-` slug prefix; lanes
   3/4/5 dropped it (`fantasy-`), as did the pre-F1 base batch. Files were left verbatim to
   preserve provenance mapping — **a rename pass is deferred to Adam** (renaming now would desync
   the call-id tables that reference current names).
3. **Sheet-slug vs per-identity slug.** Returns are per-SHEET combined slugs
   (`...-goblin-warrior-minion-hexer-cutter-...`) as the master template intends (one call per
   sheet); the per-cell identity→slug mapping lives in each lane's provenance. Not a defect.
4. **Heterogeneous / missing provenance.** Formats vary: md table (lane1), md prose (lane4),
   json (lane5/6). **Lane 3 authored no standalone provenance** — it appended records to the
   shared base `AUDIT.md`. Reconstructed here as `provenance/lane3-generation-ledger.md` (call
   ids verbatim). Lane 1 has two ledgers: the original + a `-rerun-2026-07-13` that supersedes
   candidates 001–002 for §0 style (all four kept as candidates).
5. **Lane 6 scope.** The packet scopes lane 6 as FILL-IN ONLY for K1's rejected arched-door;
   lane 6 instead regenerated all 5 kit families (10 attempts) and transparently self-rejected
   every one. Over-generation vs. scope, but no bad source was carried forward.
6. **Extruded worktree contributes nothing to F1.** `Genesis-extruded-props`
   (`codex/extruded-prop-pilot`) holds candidates 015–019 (owlbear, pirate/yuanti, domestic
   animals, orc-roles, kid-variety) — a **different pilot**, not PACKET-F1 figures, and **no kit
   fills landed there**. Excluded from this consolidation. (Kit fills are in lane 6.)
7. **Pre-F1 base batch NOT merged.** The lane base commit `7c63c462` carries a prior wave — 36
   `fantasy-*` figures + 11 alpha-passed kit/prop sheets — with the older non-`spr` naming. It is
   not part of PACKET-F1 and is **not** on `master`, so it was excluded per "copy only the
   intended" instruction. Flag for Adam: decide separately whether that older corpus belongs in
   the canonical tree.
8. **Two chroma-in-figure flags to verify before cleanup:** shield-anchor-001 (green through the
   empty gem socket) and lane4 cultist-fanatic-023 (magenta-tinted left shoe on the robed
   cultist). Both are "chroma colour appears in the figure" risks that cutout tooling would smear.

## Recommended next actions (NOT taken — awaiting Adam)

- Pick the single best sibling per lane-1 anchor identity for the language-lock: bandit-004,
  dog-003, knight-002, dragon-004; shield has no clean flat-elevation candidate (all HOLD).
- Regen-list (source-level, before any slicing): giant-wolf-spider-025 (tighter base),
  the flaming-skeleton cell (de-VFX the flame), and the full heraldic-shield set (true flat
  front elevation). The lane-6 kit families all need a clean-chroma regen.
- Verify the two chroma-in-figure flags (#8) at pixel level.
- Decide: rename lanes 3/4/5 to `spr-fantasy-` + renumber to a pilot-global candidate sequence;
  fold or drop the pre-F1 base batch (#7).
- Only after Adam's go: alpha-clean → despill → bounds/anchor/scale → isolated renders → blind
  judge → integrated matrix → admission (§9 Steps E–L). None of that is started.
