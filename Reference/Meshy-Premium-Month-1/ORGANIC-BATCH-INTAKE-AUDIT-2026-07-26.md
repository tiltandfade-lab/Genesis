# Organic Batch Intake Audit — 2026-07-26

Sources were routed out of the staging folder on 2026-07-26. Canonical and variant source donors
now live under `source-archive/organic/`; the rejected fungus donor lives under
`source-archive/organic/rejected/`. This audit distinguishes canonical candidates, useful minor
variants, cleanup candidates, and rejects.

Two-angle review gallery:
`intake-previews/organic-batch-intake-2026-07-26/organic-batch-two-angle-gallery-v1.png`

## Verdicts

| # | incoming file | geometry | verdict | proposed use |
| --- | --- | ---: | --- | --- |
| 01 | `Meshy_AI_Root_Arch_Burrow_Mout_0726141504_generate.glb` | 1,014 tris / 1 island | useful variant, not canonical | Retain as a tangled root-thicket or cluttered den-mouth blocker. Its interior growth makes the intended broad passage too ambiguous. |
| 02 | `Meshy_AI_twisted_root_arch_bur_0726141702_generate.glb` | 1,004 tris / 1 island | keeper variant | Retain as `M011-B` twisted-burrow alternate 1. Strong single-file opening and distinct upper loop. |
| 03 | `Meshy_AI_rotted_root_arch_burr_0726141752_generate.glb` | 930 tris / 1 island | canonical candidate | Best `M011-C` snapped/rotted arch. Clean breach, strong silhouette, and one connected mesh. |
| 04 | `Meshy_AI_twisted_root_arch_bur_0726141933_generate.glb` | 981 tris / 1 island | canonical candidate | Best primary `M011-B`. Cleaner main opening than #02; retain #02 as a legitimate sibling. |
| 05 | `Meshy_AI_RootTunnelRibCluster__0726142054_generate.glb` | source: 1,040 tris / 7 islands; repaired: 1,040 tris / 1 island | repaired canonical | Best primary `M012-A` parallel-rib silhouette. Voxel-union repair at resolution 160 preserves the silhouette while producing one closed manifold island. |
| 06 | `Meshy_AI_RootTunnelRibCluster__0726142133_generate.glb` | 1,008 tris / 1 island | canonical candidate | Strong primary `M012-B` tangled/asymmetric state. One connected mesh and meaningfully different route profile. |
| 07 | `Meshy_AI_RootTunnelRibCluster__0726142219_generate.glb` | 1,252 tris / 2 islands | keeper variant | Clean parallel-rib alternate. It does not communicate the requested broken state well enough for `M012-C`, but it is a useful taller/open sibling of `M012-A`. |
| 08 | `Meshy_AI_Woven_Nest_Substrate_0726142453_generate.glb` | 927 tris / 21 islands | canonical candidate | Strong `M018-A` woven nest. The islands correspond to deliberately separate woven members; retain unless collision or draw-call policy requires joining. |
| 09 | `Meshy_AI_mud_root_nest_bowl_lo_0726142627_generate.glb` | 867 tris / 7 islands | keeper variant | Organic, irregular shallow mud-root bowl. Retain as the roughest `M018-B` sibling. |
| 10 | `Meshy_AI_mud_root_nest_bowl_lo_0726142958_generate.glb` | 1,092 tris / 6 islands | canonical candidate | Best general-purpose `M018-B` mud-root bowl: readable basin, balanced rim, and useful medium depth. |
| 11 | `Meshy_AI_root_tunnel_arch_1200_0726143114_texture.glb` | source: 1,248 tris / 98 islands / 3 images; repaired: 1,248 tris / 2 islands / no images | repaired canonical | Best `M012-C`: complete rear rib, interrupted middle form, and chopped foreground stump. Conservative welding plus removal of materials, images, UVs, colors, and exported normals reduced the file from 20.8 MB to 15.7 KB without changing the silhouette. |
| 12 | `Meshy_AI_mud_root_nest_bowl_lo_0726143253_generate.glb` | 1,062 tris / 9 islands | keeper variant | Deep, steep-sided brood bowl. Less universal than #10 but sufficiently different to retain as a deep-socket `M018-B` variant. |
| 13 | `Meshy_AI_abandoned_collapsed_n_0726143320_generate.glb` | 882 tris / 9 islands | canonical candidate | Best primary `M018-C`. Clear collapsed oval silhouette with lower complexity. |
| 14 | `Meshy_AI_abandoned_collapsed_n_0726143501_generate.glb` | 1,301 tris / 26 islands | keeper variant | Denser collapsed-nest sibling. Retain for a more overgrown or recently abandoned state; do not substitute it for the lighter canonical candidate. |
| 15 | `Meshy_AI_shelf_fungus_cluster__0726143530_generate.glb` | 763 tris / 10 islands | reject | Reads as a jagged rubble or crystal pile from both sides. The shelf forms, harvested scars, deadwood core, and emission faces are not legible. Regenerate `M074-C`. |

## Family result

- `M011-A`: no clean canonical broad arch in this intake; #01 is reusable only after
  reclassification as a tangled blocker.
- `M011-B`: #04 primary, #02 legitimate minor variant.
- `M011-C`: #03 primary.
- `M012-A`: #05 repaired primary; #07 legitimate taller alternate.
- `M012-B`: #06 primary.
- `M012-C`: #11 repaired primary.
- `M018-A`: #08 primary.
- `M018-B`: #10 primary; #09 and #12 are useful shallow/rough and deep-bowl variants.
- `M018-C`: #13 primary; #14 legitimate dense alternate.
- `M074-C`: #15 rejected; regeneration required.

## Recommended next intake action

1. Canonicalize the remaining clear primary candidates and assign explicit variant filenames to the retained
   siblings.
2. Keep #01 only under a reclassified tangled-blocker identity.
3. Regenerate `M011-A` and `M074-C`; do not spend another generation on the other families yet.

## Completed repair proof

- `processed/M012-A-root-tunnel-rib-cluster-clean-v1.glb`: 1,040 triangles, 512 vertices, one
  watertight island, zero materials, zero images, 13,116 bytes.
- `processed/M012-C-root-tunnel-rib-cluster-clean-v1.glb`: 1,248 triangles, 624 vertices, two
  intentional closed islands, zero materials, zero images, 15,708 bytes.
- Final front and rear clay proofs are in
  `intake-previews/organic-batch-intake-2026-07-26/repair-proofs/`.
