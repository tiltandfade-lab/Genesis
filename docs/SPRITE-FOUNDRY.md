---
type: production-machinery-spec
status: SPECCED — IMAGEGEN FEASIBILITY PROVED; ASSETFORGE APPLICATION UNBUILT
created: 2026-07-31
owner: art-pipeline / Assetforge
related:
  - ASSETFORGE.md
  - ART-DEPARTMENT.md
  - ART-DIRECTION-CANON.md
  - PHYSICAL-TEXTURE-MODULE-STANDARD.md
  - OFFLINE-ART-FOUNDRY-RESEARCH.md
  - GOLDEN-SITE-PROCEDURAL-VIGNETTE-MASTER-PLAN.md
---

# Sprite Foundry — finite parts, generative descendants, and demand-built recipes

## 1. Decision

Genesis uses an **offline-first, provider-neutral Sprite Foundry**. Codex is the first operator.
The same typed jobs may later sit behind an Assetforge CLI, a local interface, a hosted queue, or
an explicitly opted-in runtime service. Provider generation is not part of ordinary play while
latency and cost make it unsuitable.

The foundry does **not** generate the Cartesian product of creature, body, pose, equipment,
culture, material, biome, faction, damage, dirt, and lighting. It generates and admits a finite
basis of reusable visual factors, then compiles only demanded combinations.

```text
naive corpus = bodies × poses × gear × cultures × materials × conditions × factions

Genesis basis = body families
              + silhouette-changing kit descendants
              + anchored equipment layers
              + palette/signifier channels
              + authored face modules
              + reusable condition masks
              + deterministic recipes
```

The possible appearances may multiply. The authored and generated source library should grow
approximately by addition. A compiled combination is a reproducible cache product, not a new
canonical art concept.

## 2. Scope and authority

The foundry may produce candidates for:

- PC, NPC, and creature descendants derived from an admitted donor;
- equipment, clothing, body-state, and presentation-pose treatments;
- reusable wall-face, floor-face, roof-face, trim, corner, end, and remainder modules;
- culture/faction signifiers such as banners, flags, paint, carvings, votives, and trophies;
- generic condition layers such as grime, wetness, algae, ivy, soot, repair, abrasion, and blood;
- shallow sprite-extrusion candidates and faced-prop treatments; and
- proof boards, normalized native assets, manifests, and receipts.

It does not own:

- game mechanics, item statistics, collision, cover, openings, support, or terrain topology;
- the sprite registry, material registry, palette algorithm, trim/decal compiler, atlas packer, or
  persistence system;
- WFC/parcels/plots or the Golden Site spatial compiler;
- taste approval or direct production admission; or
- runtime lighting, shadows, AO, or baked directional scene light.

Assetforge owns the job envelope, quarantine, orchestration, deterministic post-processing,
proof, receipt, and promotion boundary. Existing specialist systems remain the single owners of
their algorithms.

## 3. The anti-explosion law

### 3.1 Store meaning at the cheapest truthful layer

| Visual difference | Default representation | Generate a full descendant when... |
|---|---|---|
| Faction/culture color | protected palette mask or LUT | the culture changes construction, clothing silhouette, or authored iconography beyond recolor |
| Banner, flag, blood mark, crest | anchored signifier/decal module | it becomes a named hero object with unique shape or narrative identity |
| Dirt, algae, soot, wetness, ivy | causal condition mask; shallow geometry for silhouette-bearing growth | the state permanently changes silhouette or requires a specifically authored hero composition |
| Weapon or shield | socketed/anchored layer where the pose permits | grip, occlusion, stance, or body balance must change |
| Light/atmosphere | renderer/VFX | never merely to capture a lighting condition |
| Wall material | continuous physical-scale parent | bond, feature layout, damage, or cultural face design is genuinely different |
| Window, arch, niche, relief | authored `W5H5`, `W5H10`, trim, aperture, or geometry-bound module | a new reusable module family is actually absent |
| Armor/clothing | layer or kit token for compatible bodies/poses | silhouette, anatomy, or contact demands a semantic redraw/repose |
| Creature phenotype | palette/mask/small attachment within one morphology family | anatomy or silhouette crosses the family's declared bounds |
| Mechanical item variation | shared visual archetype | the difference matters visually at gameplay scale or is a named/significant object |

Do not spend a generative job on a difference the renderer, palette owner, material parent,
condition compiler, or anchored attachment can express more reliably.

### 3.2 Regenerate on significance, not possibility

A new generated source is justified when at least one of these is true:

1. the gameplay-scale silhouette changes materially;
2. equipment changes pose, grip, occlusion, anatomy, or ground contact;
3. the appearance carries named identity or recurring story importance;
4. no admitted module expresses a required cultural or construction grammar;
5. reuse-weighted demand clears the active production budget; or
6. a Golden proof names the missing factor as its smallest truthful art dependency.

Color alone, a stat difference, a different biome behind the subject, or a condition already
expressible by a generic mask is not enough.

### 3.3 Three kinds of stored result

- **Citizen source:** reviewed donor, kit descendant, attachment, module, mask, or material family.
  This is the small, curated basis.
- **Compiled derivative:** deterministic composition of citizens for a named recipe. It is
  content-addressed, rebuildable, evictable, and never hand-edited.
- **Instance parameters:** palette values, condition weights, signifier selection, age, wetness,
  seed, and other lightweight facts kept as data rather than images.

This distinction prevents a cache directory full of site-specific composites from becoming a
million-item art registry.

### 3.4 Illustrative cardinality

These are explanatory examples, not corpus quotas:

- four wall parents + twelve feature modules + ten signifiers + eight condition families are 34
  source factors but can describe `4 × 12 × 10 × 8 = 3,840` compatible face recipes before palette
  parameters, intensity, placement, corners, and trims;
- eight body/morphology donors + six silhouette kits + twelve attachments + eight palette families
  + six portrayed states are 40 source-factor families but describe as many as 27,648 theoretical
  recipes before compatibility filtering.

Genesis neither generates nor stores all theoretical recipes. The compatibility graph removes
nonsensical combinations, the demand census asks for a small observed subset, and the
content-addressed compiler builds or reuses only that subset. The numbers demonstrate the desired
shape: multiplicative expression from additive art inputs.

## 4. Representation ladder

The resolver tries these routes in order and stops at the first route that preserves the visual
obligation:

```text
R0 renderer/material parameter
 -> R1 palette or semantic-mask remap
 -> R2 reusable decal/trim/condition layer
 -> R3 socketed sprite or shallow-extruded attachment
 -> R4 deterministic composition of admitted factors
 -> R5 ImageGen descendant from admitted donor(s)
 -> R6 bespoke hero treatment
 -> truthful fallback / unresolved debt
```

`R5` and `R6` are selective production tools, not the default response to variety.

### 4.1 Character and creature stack

```text
admitted anatomy/identity donor
  + declared stance or equipment-licensed repose
  + silhouette kit descendant when needed
  + socketed weapon/shield/accessory when valid
  + palette and faction channels
  + condition/state masks
  + renderer-owned light, shadow, selection, and VFX
```

Many mechanically distinct swords may share one visible sword archetype. Common armor can be a
small family of light/medium/heavy silhouette kits rather than one sprite per inventory record.
Named artifacts, PCs, bosses, recurring NPCs, and visually transformative equipment earn bespoke
descendants first. Rare incidental combinations use the closest admitted family plus layers and
never block combat.

### 4.2 Architecture stack

```text
engine-owned wall/floor/roof geometry and sockets
  + continuous physical-scale material parent
  + authored W5H5/W5H10 feature module where needed
  + corner/end/remainder/trim grammar
  + culture or faction signifier
  + causal condition field or mask
  + real aperture/relief geometry when mechanics or silhouette require it
```

WFC selects compatible geometry and semantic sockets. It must not select a pre-baked image for
every culture × material × condition combination. A surface recipe fills those sockets from the
factor library, and a deterministic compiler may flatten a static stack into one runtime texture
or atlas entry when draw-call budgets require it.

Examples:

- the same masonry parent can receive a civic cornice, frontier wall cap, blood-painted claimant
  mark, or wet lower-wall condition without becoming four new base materials;
- the same `W5H10` arched-window module can inherit compatible stone palettes and condition masks;
- ivy is one reusable growth family rooted by receiver geometry, not one ivy image per wall;
- a biome affects condition probabilities and material-family eligibility, not the number of wall
  files by direct multiplication.

### 4.3 Terrain stack

Responsive terrain keeps world-projected parents and continuous condition fields over real
triangles. It does not receive one sprite per tile, angle, biome, and wetness state. Sparse tufts,
stones, roots, ledges, and hero features remain separate placed factors where their silhouettes
matter.

## 5. Donor descendants and licensed repose

A generative descendant is not required to preserve a paper-doll pose. Substantial gear should
change stance when a plausible body would need to carry, aim, brace, balance, or display it
differently. Repeating one pose across incompatible equipment reads cheaper than a controlled
repose.

The invariant is therefore **intentional pose continuity**, not pixel pose identity. Every job
declares one of:

- `PRESERVE`: expression, palette, or minor attachment should retain the donor pose;
- `ADAPT_TO_GEAR`: equipment may cause a bounded, plausible repose;
- `AUTHORED_ACTION`: a named action/state supplies the target pose;
- `TURNAROUND`: view direction changes under the rear-view/turnaround contract.

Even under repose, the candidate must preserve or explicitly account for:

- identity and body/morphology family;
- canonical physical height and tactical occupancy;
- declared view bearing and projection;
- foot/contact datum and support relationship;
- coherent anatomy, hands, grip, and equipment attachment;
- equipment function and load; and
- native-scale readability under the realm style block.

Unlicensed drift remains a rejection. Licensed repose is evaluated for plausibility and identity,
not punished merely for differing from the donor silhouette.

## 6. Demand planning and variant budget

### 6.1 Census before production

The foundry consumes real demand from Golden sites, ordinary venues, walk rolls, encounter rolls,
PC creation, bestiary rosters, and equipment families. Each demand records frequency, visual
importance, reuse reach, fallback quality, and whether it crosses the significance threshold.

Selection is a weighted set-cover problem: choose the smallest group of factors that covers the
largest high-value demand surface.

```text
priority = frequency × visibility × narrative_weight × cross_site_reuse
           × fallback_gap / (generation_cost + review_cost + runtime_cost + art_debt)
```

The formula is a planning explanation, not a frozen tuning constant. A budget receipt records the
actual scored fields and the human decision.

### 6.2 Admission budget

Each production wave declares limits for:

- provider jobs and estimated spend;
- generated bytes and atlas pages;
- review minutes and unresolved failures;
- runtime texture memory, batches, and layer count;
- new citizen sources versus rebuildable derivatives; and
- marginal demand coverage gained.

Stop generating when another source provides negligible coverage, when failures repeat for the
same structural reason, or when a generic factor is being multiplied into specific combinations.

### 6.3 Content-addressed reuse

Every recipe fingerprint includes schema/algorithm versions, input hashes, style authority,
physical pixel contract, pose intent, factor ids and versions, ordered masks, palette parameters,
prompt packet, provider receipt, and deterministic compiler settings.

```text
same fingerprint -> reuse the same quarantined/admitted result
changed lightweight parameter -> recompile without provider generation
changed semantic/silhouette demand -> consider a new generative job
```

Do not key a cache only by a friendly filename or prompt text.

## 7. Typed contracts

### 7.1 `FoundryDonorV1`

```json
{
  "schema": "FoundryDonorV1",
  "id": "spr-pc-vanguard-v001",
  "source": { "path": "<repo-relative>", "sha256": "<hex>", "licenseRef": "<id>" },
  "styleAuthority": "docs/ART-DEPARTMENT.md#<realm>",
  "physical": { "pixelsPerFoot": 32, "heightFeet": 6, "footY": 0.955357 },
  "projection": { "bearing": "camera-near-diagonal", "stanceFamily": "standing-ready" },
  "semanticMasks": ["primary-cloth", "secondary-cloth", "metal", "skin", "emblem"],
  "sockets": ["hand-main", "hand-off", "back", "head", "waist"],
  "admission": { "scope": "candidate-only", "approvedBy": null }
}
```

### 7.2 `VisualMutationRecipeV1`

```json
{
  "schema": "VisualMutationRecipeV1",
  "id": "vanguard-heavy-sentinel-v001",
  "targetKind": "character-descendant",
  "donorRefs": ["spr-pc-vanguard-v001"],
  "factors": [
    { "id": "kit-heavy-plate-v001", "representation": "BAKED_DESCENDANT" },
    { "id": "palette-guard-placeholder-v001", "representation": "PALETTE_REMAP" },
    { "id": "weapon-polearm-v001", "representation": "ANCHORED_LAYER" }
  ],
  "poseIntent": "ADAPT_TO_GEAR",
  "physicalContract": { "pixelsPerFoot": 32, "heightFeet": 6 },
  "fallback": "spr-guard-heavy-family-v001",
  "admissionScope": "candidate-only"
}
```

Allowed `representation` values are:

```text
RENDER_PARAMETER
PALETTE_REMAP
DECAL_OR_MASK
ANCHORED_LAYER
GEOMETRY_BINDING
DETERMINISTIC_COMPOSITE
BAKED_DESCENDANT
```

### 7.3 `FoundryCandidateReceiptV1`

The receipt records:

- recipe and fingerprint;
- all source/output hashes and provider call metadata;
- raw, keyed, normalized, native, atlas, and proof paths;
- physical scale, subject bounds, baseline/contact, alpha, forbidden chroma, and palette metrics;
- pose-intent verdict plus identity/anatomy/equipment visual checklist;
- factor reuse, newly generated factor count, and covered demand ids;
- cost, latency, review status, fallback, and explicit admission state; and
- redistributability/provenance fields without pretending to replace legal review.

### 7.4 `VariantBudgetV1`

```json
{
  "schema": "VariantBudgetV1",
  "scope": "golden-wave-2-guard-post",
  "limits": {
    "providerJobs": 12,
    "newCitizenSources": 8,
    "runtimeLayersPerSurface": 4,
    "reviewMinutes": 180
  },
  "demandRefs": ["<stable-demand-id>"],
  "stopConditions": [
    "marginal-coverage-below-threshold",
    "repeat-structural-failure",
    "existing-factor-can-express-demand"
  ]
}
```

Numbers above illustrate the schema; each active wave must choose and receipt its own budget.

## 8. Current Codex-operated runbook

Until an interface earns its way into the toolchain:

1. Select admitted or candidate donors and record hashes, licenses, dimensions, realm style, and
   intended factor roles.
2. Classify every requested difference through the representation ladder. Remove palette,
   condition, lighting, and simple attachment work from the generative prompt where possible.
3. Declare pose intent, physical scale, contact datum, view bearing, identity locks, allowed
   changes, negative controls, and fallback.
4. Prepare logical integer enlargements only as model references; do not mistake them for native
   output.
5. Generate into quarantine on flat key color or another extraction-safe background. Record the
   exact prompt packet and provider result.
6. Key and defringe aggressively; reject foreign sheet fragments, clipped cells, edge contact,
   visible magenta-family contamination, or accidental scenery.
7. Deterministically normalize to the 32 px/ft physical contract, binary alpha where required,
   declared palette budget, correct foot/contact anchor, and safe canvas padding.
8. Review at native pixels, gameplay scale, governed beauty scale, grayscale where relevant, and
   with the actual receiver/body/site. A macro crop cannot rescue a failure at play scale.
9. Emit proof board and receipt. Keep the candidate out of live asset directories until explicit
   admission.
10. Add a failure to the negative-control lineage when it teaches a reusable rejection rule.

The first local feasibility experiment (workspace artifact, not a citizen) is
`artifacts/sprite-foundry-imagegen-v001/receipt.json`, with its comparison at
`artifacts/sprite-foundry-imagegen-v001/native/imagegen-donor-equipment-contact-sheet.png`. It
produced three recognizable equipped descendants, each normalized to a 192-pixel six-foot subject,
hard alpha, at most 64 visible colors, and zero visible magenta-family pixels. It also proved that
provider output does not inherently obey Genesis's native logical pixel dimensions, palette,
alpha, registration, or pose contract; deterministic normalization and review remain mandatory.

## 9. Wall and decal foundry application

The first architectural implementation should operate on roles, not flattened combinations:

1. select or author one continuous parent at the physical construction scale;
2. identify missing `W5H5`/`W5H10`, corner, end, remainder, trim, and aperture roles;
3. generate only those reusable missing roles with neutral or declared semantic masks;
4. extract conditions/signifiers as independent assets unless inseparable from the authored form;
5. validate edge phase, course datum, sockets, clean alpha, four-bearing read, and actual receiver
   fit;
6. compile demanded stacks deterministically for the site/atlas; and
7. preserve sources and recipes so another culture, palette, or condition can reuse the form.

Useful ImageGen jobs include:

- alternate wall-feature panels sharing one construction rhythm;
- compatible corner/cap/end families;
- neutral-relief masks for arches, niches, panels, carvings, and damaged areas;
- reusable icon/signifier sheets with protected recolor channels;
- receiver-independent grime, algae, ivy, soot, paint, crack, and repair masks;
- window, shutter, grille, door-leaf, and shallow-aperture face candidates; and
- small coordinated prop/decal families derived from one cultural design board.

A useful specific asset may still be admitted when it is beautiful and demanded. The constraint is
to limit specific production, not to reject specificity categorically.

## 10. Interface and provider bridge

A future interface should be a thin client over the same jobs:

```text
local UI / Codex / batch planner
  -> validate typed job
  -> provider adapter queue (server-held credentials)
  -> quarantined raw return
  -> deterministic local compiler and verifier
  -> review gallery and receipt
  -> explicit promotion
```

Provider adapters are replaceable. No provider-specific response becomes a canonical schema.
Credentials never ship in a pack, enter a prompt packet, or appear in a receipt.

The interface should first expose job authoring, budget preview, source/recipe search, proof
comparison, rejection reasons, and promotion status. It should not begin as a freeform “make me
anything” box; typed factor roles are what make results reusable.

## 11. Runtime policy

The normal shipped game uses studio-prebaked citizens and deterministic local composition. It does
not require a player to fund generation and never blocks map creation, character creation, or
combat on a provider call.

If runtime generation later becomes viable, it remains an optional capability with:

- explicit opt-in and visible price estimate before dispatch;
- user- or studio-funded credits with a hard spend cap;
- asynchronous jobs, cancellation, retries, and no hidden loop;
- content-addressed shared/local caching where rights permit;
- a complete admitted fallback for every job;
- provider-independent recipes and migration; and
- moderation, provenance, privacy, and age-appropriate controls appropriate to distribution.

Until those gates pass, dynamic world variety comes from factor composition, procedural placement,
palette/material parameters, and causal condition fields—not paid per-player generation.

## 12. Packaging and giving the machinery away

Package the foundry as a portable tool, not as Adam's private corpus:

```text
sprite-foundry/
  README.md
  LICENSE
  THIRD_PARTY_NOTICES.md
  schemas/
  prompts/
  adapters/
  compilers/
  validators/
  examples/
  fixtures/positive/
  fixtures/negative/
  proof-boards/
```

The distributable package should contain:

- versioned schemas and a machine-readable compatibility range;
- provider adapters with no credentials;
- deterministic keying, normalization, palette, anchor, composition, and receipt tools;
- small positive and negative fixtures plus expected hashes where deterministic;
- example jobs that use redistributable donors;
- a quick-start Codex prompt/runbook and ordinary CLI path;
- semantic-versioned releases, changelog, checksums, and migration notes; and
- separate declarations for tool-code license, donor/reference license, and generated-output
  provenance. Ambiguous assets stay out until rights are reviewed.

This can later become a Codex skill/plugin and a graphical Assetforge application without changing
the recipe contract. The CLI/data boundary must exist first so the interface does not become the
only executable specification.

## 13. Rejections and negative controls

Reject or reroute:

- pre-generating the complete permutation matrix;
- making a full sprite because only a palette or faction color changed;
- baking biome, culture, condition, and material into every wall module;
- baking directional scene light, brick shadows, or receiver texture into a generic overlay;
- allowing WFC to choose visual files without semantic/module sockets;
- accepting ImageGen output directly into production;
- losing physical scale, contact, anatomy, grip, equipment function, or view bearing during repose;
- forcing every substantial outfit into the same donor pose;
- retaining foreign sprite fragments, soft resampling, clipped silhouettes, or magenta residue;
- minting a new citizen for every deterministic compiled derivative;
- a cache key that omits source hashes, versions, or ordered factors; or
- any player-facing provider charge without explicit opt-in, estimate, cap, and fallback.

## 14. Delivery ladder

| Stage | Deliverable | Gate |
|---|---|---|
| **SF-0** | ImageGen donor/equipment feasibility experiment | **Complete as experimental evidence; not admission** |
| **SF-1** | schemas, validator, budget receipt, Codex job packet | one character and one wall job reject deliberate bad inputs |
| **SF-2** | character/creature descendant Assetforge CLI | three donor families; preserve/adapt/action pose intents; native-scale engine proof |
| **SF-3** | wall/decal/module application | one parent supports feature, culture, and condition recombination without source multiplication |
| **SF-4** | demand census and weighted coverage planner | Golden/walk/encounter demands choose a bounded basis and truthful fallbacks |
| **SF-5** | read-only local gallery/interface | can author jobs, compare proofs, and inspect receipts; cannot silently promote |
| **SF-6** | distributable package | clean install, redistributable fixtures, no keys/private assets, repeatable verification |
| **SF-R** | optional runtime bridge | separately authorized only after cost, latency, fallback, privacy, and spend-control gates pass |

Wave 2 may consume only the smallest Sprite Foundry slice named by its Guard Post/Tavern demand.
The foundry does not replace the active Golden spatial compiler order or license broad speculative
asset production.
