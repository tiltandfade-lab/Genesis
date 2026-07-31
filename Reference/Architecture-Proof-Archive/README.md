# Architecture proof archive

type: retained-visual-evidence
created: 2026-07-30
status: RETAINED — additive vocabulary and diagnostic history
runtime authority: none
engine authority: `src/engine/architecture-forms.js`

This compact archive preserves the labeled architecture proof sequence independently
of the much larger disposable capture directory. It exists because a form can fail one
projection while remaining excellent vocabulary for another.

The small and dollhouse-like AF-01–AF-16 forms remain available for:

- battle windows where their scale and program are appropriate;
- TownTray/overworld settlement icons;
- neighborhood, estate, compound, campus, and fortress overview maps;
- procedural district massing and frontage rhythm; and
- visual grammar/reference when a larger dedicated interior is compiled separately.

They are not overwritten by AF-17–AF-21 or by later precinct proofs. The engine-owned
role registry is `ARCHITECTURE_FORM_PROJECTION_ROLES`.

Rejected machinery is retained differently. Its named failure and replacement live in
`ARCHITECTURE_REJECTED_MACHINERY_REGISTRY`; its before-state remains visible in these
sheets, targeted comparison images, validators, and git history. Every such record is
`diagnostic-negative-control` with `productionSelectable:false`. That prevents a useful
negative control from becoming a live generator default.

The full local capture history remains under `artifacts/architecture-clayroom/` while
the worktree is active. This directory is the deliberately small, source-controlled
retention set that survives cleanup.

## Retained sheets

| File | Retained value |
|---|---|
| `architecture-form-ladder-round-01-labeled.png` | first eight-form baseline |
| `architecture-form-ladder-round-02-labeled.png` | first repair pass |
| `architecture-form-ladder-round-03-labeled.png` | admitted compact-form family |
| `watchtower-four-bearings-round-03-labeled.png` | quarter-turn proof |
| `architecture-form-ladder-round-04-variants-labeled.png` | bounded mutations |
| `architecture-form-ladder-round-05-suite-02-labeled.png` | AF-09–AF-16 programs |
| `architecture-form-ladder-round-06-growth-labeled.png` | room/storey growth |
| `architecture-growth-before-after-round-06-labeled.png` | canonical/growth comparison |
| `architecture-form-ladder-round-07-monumental-labeled.png` | monumental human scale |
| `af21-stair-seam-before-after-labeled.png` | rejected connector platform versus direct supported seam |

`manifest.json` records immutable hashes for the archive copies.
