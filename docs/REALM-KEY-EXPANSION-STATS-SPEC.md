---
type: build-spec
status: "SPEC-LOCKED 2026-07-09 — Adam approved the concept roster + authorized the stat wave ('yeah let's do that'); ready for the orchestrated Sonnet build"
branch: claude/npc-monster-realm-expansion-edb64a
created: 2026-07-09
canonical: true
related:
  - "[[REALM-KEY-EXPANSION-ROSTER]]"   # the approved concept source
  - "[[REALM-BESTIARY-DRAFT]]"         # the format precedent (1,307 entries)
  - "dev/model-qa/realm-bestiary-draft.json"  # the SOURCE OF TRUTH being appended to
  - "build/gen-realm-bestiary.py"      # the compile + --check gate
  - "[[GLOOM-KEY]]"
  - "[[CHROME-REKEY]]"
---

# REALM-KEY-EXPANSION stat wave — spec ~160 approved creatures to MM standard

Take every creature in `docs/REALM-KEY-EXPANSION-ROSTER.md` (Adam-approved 2026-07-09, mirrored
as the `Expansion sheet E1/E2` sections of `dev/model-qa/sprite-sheets/<realm>.md`) to the full
Monster-Manual standard of the existing 1,307-entry draft: chassis-framed stats, narrative
elements, and a banded d-flavor table each. **Append-only** into
`dev/model-qa/realm-bestiary-draft.json`; never touch existing entries.

## 1. Output contract (per creature — ALL fields required; matches the existing 1,307 exactly)

```json
{
  "name": "...", "role": "mook|elite|high|apex", "cr": <number>,
  "type": "<5e creature type>", "size": "Tiny|Small|Medium|Large|Huge|Gargantuan",
  "frame": "<existing BESTIARY key — the stat chassis>",
  "model": "<existing chassis slug, or rlm-<kebab-name> for net-new 3D>",
  "flavor": "1–2 sentences, realm voice", "summary": "one line, action-oriented (doubles as sprite pose cue)",
  "desc": "3–5 sentences of table-read prose",
  "traits": { "note": "one mechanical-texture note the DM can act on" },
  "flavorTable": { "die": "d8|d10", "mode": "variant", "rows": [ {"n":1,"band":"Grounded","text":"..."}, ... ] },
  "treasure": "none|incidental|hoard", "habitat": ["..."], "activity": ["two present-tense behaviors, seen-from-outside"]
}
```

- **Frame = the stat block.** Pick the closest CR-appropriate chassis from `data/bestiary.js`
  (510 keys); `--check` fails on a frame that doesn't resolve. Custom attack/trait text goes in
  `traits.note` / flavorTable rows — the frame owns the numbers (edit-source discipline: we do
  not hand-roll stat math).
- **flavorTable bands** — CORRECTED at build time (2026-07-09): the real `gen-realm-bestiary.py`
  contract is **universal d8 / exactly 8 rows** (1–5 Grounded, 6 Textured, 7 Strange, row 8 ∈
  {Volatile, **Mythic**}), `treasure` ∈ none|individual|hoard, `habitat` from the frozen 17-value
  vocab. The spec's original d10/`incidental` invention was wrong against the validator — the
  artifacts were mechanically transformed to conform (validator preserved, not weakened). Mythic
  row 8 ONLY on `(M)`-flagged entries; Volatile = active escalating force, Mythic = forever.
- **role↔CR banding** (match the existing distribution): mook ≤1 · elite 2–4 · high 5–8 ·
  apex 9+. `(B)` roster entries land high/apex; `(M)` entries are apex with a Mythic row.
- **Recruitables/social entries** (`(R)`/`(S)`) still get full entries — the frame covers the
  "if it comes to blows" case; the `traits.note` names the parley/recruit lever (social-attitude
  system hooks by name, no invented mechanics).
- **Gloom child entries** (corn congregation, bad seed, good son's shadow): children carve-out is
  BINDING — every such entry's `traits.note` must name its non-graphic defeat-out; no flavorTable
  row may depict graphic harm to or by a child.
- **Dedupe:** before authoring, grep the realm's existing block for near-identical concepts
  (chrome's mutant vigilantes, ash's ghoul lane, suburb's HOA rows are the known hot zones — the
  roster was already deduped against them; keep it that way). Intra-realm exact-name dupes fail `--check`.

## 2. Exclusions (not creatures — do NOT stat)

Suburb **kid-built ship** (prop/hook → REALM-PROPS lane), ash **ember-stone reliquary** (plot
item → doer/pointer lane), suburb **high-school/diner/prom** (PLACE-GEN hand-off). Everything
else in the roster gets an entry, including animate objects (jealous car, driverless diesel,
gardener's topiary — Construct/Object frames exist).

## 3. Unit queue (8 units; U1–U7 independent → run parallel; U0 is frontier-lane)

| Unit | Realm | ~Count | Executor | Notes |
|---|---|--:|---|---|
| U0 | cross-realm weird dozen | 12 | **Fable/Opus (frontier)** | The mechanics-bearing entries: Collector ×3 forms (one identity, shared `traits` contract), name-eater (unaddressable), 23rd card + kill-screen (Mythic), continue-screen attendant (death-rebirth seam), gremlin cute/turned pair (realm-bleed), dream-stalker (system hook), Pink Cult priest + First Kindled (faction-clock anchors). Author LAST-of-wave so realm voice from U1–U7 is in context. |
| U1 | chrome | 25−0 | Sonnet | Salamander brothers share a family `traits` motif but are 3 distinct entries. |
| U2 | gloom | 25−3 | Sonnet | Collector forms deferred to U0; demand-ladder rungs are ordinary entries here (the clock is spec'd elsewhere). |
| U3 | suburb | 45−4 | Sonnet | Minus ship + gremlin pair + continue-screen… (gremlins are U0); Traveling Five may be 1 group entry + leader, executor's call, ≥3 entries. |
| U4 | lost-world | 20 | Sonnet | Caste ladder must read as one court (shared voice); Zeal entries get `habitat: ["seeded"]`-style gating note in traits. |
| U5 | ash | 18−2 | Sonnet | Minus reliquary + First Kindled (U0). Cindermarked entries reference the cult, not a statted stone. |
| U6 | cosmic | 15−3 | Sonnet | Minus 23rd card + name-eater (U0); arcana-walkers share a "the card is the creature" desc convention. |
| U7 | bright-kingdom | 25−2 | Sonnet | Minus kill-screen + continue-screen attendant (U0). NPC-weirdness entries: `treasure: "none"` default, parley levers mandatory. |

Executor effort: **medium** (spec execution). U0 = high. Batch size ≤10 creatures per agent call
with 3 exemplar entries from that realm's existing block pasted into the prompt.

## 4. Gates (per unit — orchestrator runs these personally; never trust self-reported green)

1. `python3 build/gen-realm-bestiary.py --check` → exit 0 (frames resolve, fields present, no dup names).
2. **Red-first proof:** before the unit lands, the check must have been observed FAILING on a
   deliberately broken fixture entry (bad frame key) then passing after removal — proves the gate bites.
3. Band audit (script or eye): every flavorTable is band-ordered, ≤1 Mythic row per creature,
   Mythic present ONLY on `(M)` roster entries.
4. Role/CR banding conforms to §1; count of appended entries matches the unit's roster count.
5. Gloom unit only: children-carve-out audit on every kid entry (defeat-out named, no graphic rows).
6. Spot-read 3 entries per unit against realm voice (`data/realms.js` register) — voice drift = bounce.

## 5. Landing protocol

- All work on this branch (`claude/npc-monster-realm-expansion-edb64a`); JSON appends are
  per-realm-block so units can't collide.
- **Do NOT regenerate `data/realm-bestiary.js` on the branch** (generated-artifact rule) —
  regenerate at the master merge: `python3 build/gen-realm-bestiary.py && python3 build/check-manifest.py
  && node dev/verify-realm-wiring.mjs`.
- After the wave: one summary table (name/realm/role/CR/frame) posted for Adam's per-realm skim;
  entries are PROVISIONAL until his red-pen, same as the original 1,307.
- Net-new `model:` slugs are **SPRITE asks, not foundry asks** (amended 2026-07-09 per
  docs/SPRITE-TRANSITION.md — the entries already sit on the expansion sprite sheets).

## 6. Cost envelope (estimate, agreed 2026-07-09)

~160 entries · Sonnet batches + critic pass + U0 frontier-authored ≈ 2–4M tokens ≈ $10–25;
one overnight wave; Adam's red-pen time is the binding constraint.
