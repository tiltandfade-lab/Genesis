# Guard Post 32 px/ft Cast — ImageGen Provenance

Status: `GOLDEN_SITE_DENSITY_PROOF_CANDIDATE`

Generation mode: built-in Codex ImageGen raster generation.

These sheets prove a world-pixel-density and standee-extrusion workflow. They are not automatic
citizenship or final character-art approval.

## PC party source

Generated source:

`/Users/adamstephenson/.codex/generated_images/019faaf3-baac-7d52-8e36-c32325b743c5/call_N1V0dMBWUmTtPcVu0gTBTQRe.png`

Repository copy:

`assets/sprites-golden/guard-post-v001/source/pc-party-magenta-source.png`

Prompt intent used:

> Create one reusable four-character adventuring-party source sheet in rich authored tactical
> 2.5D pixel art: a sword-and-shield vanguard, staff-bearing caster, bow scout, and
> healer/support. Show four isolated, complete, full-body silhouettes at a consistent Medium
> physical scale. Preserve every weapon and item. Use a flat #ff00ff chroma background with no
> floor, cast shadows, bases, text, emblems, or overlapping figures. Favor readable FFT/TS-like
> value grouping, restrained material highlights, visible pixel clusters, and reusable neutral
> fantasy designs rather than portrait-specific staging.

## Guard detachment source

Generated source:

`/Users/adamstephenson/.codex/generated_images/019faaf3-baac-7d52-8e36-c32325b743c5/call_pBNlf9qry1IroV6fuTfnGYn9.png`

Repository copy:

`assets/sprites-golden/guard-post-v001/source/guard-detachment-magenta-source.png`

Prompt intent used:

> Create one reusable four-character guard-detachment source sheet in rich authored tactical
> 2.5D pixel art: a polearm-and-shield captain, crossbow lookout, heavy spear-and-tall-shield
> guard, and signal runner with horn. Show four isolated, complete, full-body silhouettes at a
> consistent Medium physical scale. Use a coherent neutral guard culture with muted red cloth as
> a recolorable placeholder and no canonical emblem. Use a flat #ff00ff chroma background with no
> floor, cast shadows, bases, text, or overlapping figures. Preserve complete equipment and favor
> readable FFT/TS-like value grouping and visible pixel clusters.

## Packaging

- Chroma was removed into the two `*-alpha.png` source sheets.
- `dev/package-guard-post-32ppf-parties.py` isolates connected actor silhouettes rather than
  trusting source-sheet columns.
- The authored head-to-feet axis is resampled to `round(worldHeightFeet × 32)` with nearest
  sampling. Equipment expands the padded canvas and never shrinks the body scale.
- Packaging fails on partial alpha, visible magenta contamination, lost connected equipment,
  foreign-component contamination, or less than six transparent pixels at any canvas edge.
- Runtime placement remains opt-in and has `mechanicalEffect: none`.
