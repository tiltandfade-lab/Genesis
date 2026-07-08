---
type: system-spec
project: Genesis
status: LOCKED 2026-07-08 (Fable) — the per-model authoring process + batch dispatch design for the
  1k–15k-tri bestiary build-out. Supersedes the 500-tri economy and the parametric-rig detour.
  Distilled from the 2026-07-08 wolf deep-dive + cosmic-set pilot (v1→v2, 5 creatures, 2 engine gates).
created: 2026-07-08
related:
  - "[[ANATOMY-CANON]]"        # per-family structure truths — pass-1 input for organic bodies
  - "[[MODEL-LANE-TRIAGE]]"    # the session findings this operationalizes
  - "[[MODELING-PIPELINE]]"    # v2 (Blender-era); this doc replaces its per-figure loop for the JS lane
  - "[[VISUAL-ASSET-QUEUE]]"   # the frequency-ranked backlog the queues consume
  - "[[REALM-MODEL-PLAN]]"     # per-realm cuts + palettes
---

# MODEL-FOUNDRY — the process for every bestiary model (1k–15k tris, JS lane)

**Purpose.** One repeatable per-model process, executable by Sonnet in parallel background queues,
that spends triangles on **expression** and gates on **silhouette + essence** — so hundreds of models
can run in tandem and the 1000+ bestiary (plus the original-roster revisit) completes without
per-model micromanagement. Fidelity stays low enough that the eventual AI-DM can model on the fly;
DLSS/upscluster is someone else's problem later.

## The laws (violating any of these is a gate failure)

1. **Tris are points of expression.** The budget must be spent on *countable features* — eyes,
   tentacles, shards, folds, teeth, straps, fur clumps. **Subdividing/smoothing to hit a number is
   banned.** A model that hits its band with padding fails; a model *under* band whose features all
   read passes.
2. **Silhouette is the first read.** The signature must change the *outline*, and the outline must
   survive the engine grade (1/3-res + dither + vertex-snap + dark void). Squint test: name the
   creature from the black shape alone.
3. **Value contrast or it doesn't exist.** Dark-on-dark vanishes in-engine (the Creeper failed twice
   proving this). Every model needs ≥1 high-value zone, and the signature feature should carry it.
   Minimum feature size ~0.04u — thinner elements (0.01u seams, needle blades) dissolve at 1/3-res.
4. **Essence over anatomy.** One LOUD exaggerated signature per creature, taken from its bestiary
   `summary`/`flavor` line ("one exaggerated feature makes the species"). [[ANATOMY-CANON]] serves
   the read — it never sands character off (the wolf lesson: open maw > correct muzzle).
5. **Gate in the real engine.** Acceptance renders come from `ps1-sheet.html` + `ps1-capture.mjs`
   (the byte-faithful shipping shader). Probe/Blender renders are working lenses only.

## Tri bands (by size × role — bands, not targets; land anywhere inside)

| class | band | e.g. |
|---|---|---|
| Small mook | 800–2k | whelp, mite, wisp |
| Medium standard | 1.5k–4k | cultist, netcaster, creeper |
| Large / elite | 3k–8k | apex beasts, shrine-horrors |
| Huge / boss | 6k–15k | dragons, avatars, apex-uniques |

## The per-model process (two Sonnet passes + a mechanical gate)

Each queue item is **self-contained**: the bestiary entry (name/size/CR/summary/flavor/realm palette),
the tri band, the laws above, the probe-lib API cheatsheet, the [[ANATOMY-CANON]] family section if
organic, output path + verify commands.

**Pass 1 — AUTHOR (Sonnet, effort med).** Write `dev/model-qa/creatures/rlm-<realm>-<slug>.js` in the
whole-object grammar (one exported build fn, probe-lib primitives, spine +z, ground y=0). Feature
checklist derived from the flavor line BEFORE geometry: list the 3–6 features the budget buys, then
build them. Then: `node` bake-check (builds clean, tri count in band, bbox sane).

**Pass 2 — CRITIC (Sonnet, effort med-high, fresh context).** Input = the pass-1 engine render (the
capture harness renders per-cell PNGs) + the laws. Two questions only: **(a) Silhouette** — does the
outline name the creature at a squint? does anything vanish into the void? **(b) Essence** — is the
signature LOUD, does the value ladder put light where the feature is? The critic edits the same file
(targeted param/geometry fixes, not rewrites) and re-renders. One critic round is standard; a second
only if round 1 changed the silhouette itself.

**Gate — mechanical + spot-check (the orchestrator, never the executor).** Per wave: re-run bake-check
on every file (never trust self-reported green), capture the wave contact sheet, and eyes-on sample
≥3 models/wave + every model whose critic flagged doubt. `check-manifest.py` + `verify-theater-figures.mjs`
after registry wiring. Red models go back on the queue with the gate note attached — no in-line rescue.

## Batch dispatch (the tandem-queues design)

- **Unit** = one creature (author→bake→render→critic→re-render). ~10–20 min of executor time.
- **Wave** = 8–12 units in parallel background agents (Workflow tool), one realm per wave so the
  palette/register stays coherent. Waves chain: gate wave N while wave N+1 authors.
- **Registry wiring is per-wave, additive, orchestrator-owned:** WHOLE_OBJECT_REGISTRY entries +
  NEAREST_SUB repoints in one commit per wave, `--no-ff` merged after gates. Executors never touch
  the registry or ps1-sheet SETS (merge-conflict surface); they only add their own creature file.
- **Sheets are the audit trail:** every wave leaves `dev/model-qa/sheets/rlm-<realm>-wave<N>.png`.
- **Order:** VISUAL-ASSET-QUEUE top-down within each realm; stand-in-heaviest realms first
  (gloom 66% → high-seas 62% → frontier 56% → bright-kingdom 56% → cosmic 54%), then the
  original-roster revisit (wolf and friends re-authored under these laws, signatures kept).

## Evidence base (why these rules)

Cosmic pilot (this session): Shoggoth (1834t, 17 authored eyes) = the benchmark — passed on sight.
Creeper failed twice — v1 dark prisms read as "a triangle", v2 thin dark blades vanished → laws 2+3.
Mite's gaze-eye smeared → the 0.04u feature floor. Wolf saga: subdivision ladder proved smoothing ≠
expression (law 1); the correct-but-bland rig vs the open-maw original proved law 4; every Blender
kitbash/remesh route lost to JS lofting at this scale → the JS lane is the production lane
(Blender/AI-gen remain future upgrade paths — [[MODEL-LANE-TRIAGE]]).
