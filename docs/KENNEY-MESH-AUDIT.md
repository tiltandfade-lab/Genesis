---
type: build-plan
project: Genesis
status: IN PROGRESS 2026-07-12
created: 2026-07-12
related:
  - "[[OFFLINE-ART-FOUNDRY-RESEARCH]]"
  - "[[EXTRUDED-SPRITE-PROP-LIBRARY]]"
  - "[[GRAPHICS-CONVERGENCE-PLAN]]"
---

# KENNEY MESH AUDIT

## Scope

This lane lands and audits the 13 CC0 donor packs researched in
`OFFLINE-ART-FOUNDRY-RESEARCH.md`. It does not register them with the game or alter theater code.

The complete GLB source corpus lives under `assets/models/kenney-<pack>/`. Full packs are retained
as a local vocabulary reserve. `dev/model-foundry/kenney-admission-manifest.json` is a smaller,
pack-balanced review queue for the first normalization wave.

## Audit stages

1. Verify official archive and file provenance.
2. Parse every GLB and record geometry, topology, bounds, UV, axis, and hash data.
3. Derive semantic role, family, and modifier proposals from names.
4. Render every asset under a neutral canonical camera.
5. Build family contact sheets and inspect representative/high-priority families.
6. Select approximately 100-150 candidates across architecture, furniture, containers,
   mechanisms, practical lights, wilderness, tools, signs, and food.
7. Preserve all non-selected assets as source reserve; selection is not deletion.
8. Require normalization, sockets, Genesis materials, and canonical visual QA before runtime use.

## Outputs

- `dev/model-foundry/kenney-census.json`: complete machine census.
- `dev/model-foundry/kenney-admission-manifest.json`: first review queue.
- `dev/model-foundry/KENNEY-AUDIT-REPORT.md`: generated summary.
- `dev/model-foundry/contact-sheets/`: generated pack/family visual evidence.
- `assets/models/KENNEY-DONOR-CORPUS.md`: source, version, license, and archive hashes.

## Admission meanings

- `DIRECT_MODULATED`: use normalized whole geometry with mandatory Genesis treatment.
- `CHASSIS`: use as a stable volume carrying generated faces, motifs, or attachments.
- `PART_DONOR`: extract or mount a useful subassembly.
- `SOURCE_RESERVE`: retained but not queued for initial normalization.
- `BROKEN`: retained with diagnostic evidence; never silently discarded.

The candidate manifest uses only the first three classes. Everything else remains source reserve
until a scene request or gap-ledger pattern gives it a reason to be reviewed.

## Gates

- All 1,752 added GLBs load or have explicit failure records.
- Archive provenance and CC0 evidence remain reproducible.
- No NaN/inf geometry is admitted.
- Contact sheets cover every source asset.
- The candidate set is pack- and role-balanced rather than dominated by the largest pack.
- No runtime registry, manifest module, walk record, or narrative table changes.
