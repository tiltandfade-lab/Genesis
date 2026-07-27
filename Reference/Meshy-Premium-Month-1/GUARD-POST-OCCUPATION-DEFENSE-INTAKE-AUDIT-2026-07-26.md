# Guard Post Occupation and Defense Intake Audit — 2026-07-26

The untouched Meshy exports were routed to `source-archive/adjudicated/` on 2026-07-26.
Canonical cleaned outputs live in `processed/`; two useful gabion alternates live in
`processed/variants/`.

Two-angle review:

- `intake-previews/guard-post-occupation-defense-2026-07-26/guard-post-intake-gallery-1.png`
- `intake-previews/guard-post-occupation-defense-2026-07-26/guard-post-intake-gallery-2.png`

## Verdicts

| job | incoming export | result | geometry | verdict |
| --- | --- | --- | ---: | --- |
| M049-D | `Meshy_AI_Medieval_Notice_Board_0726205703_generate.glb` | `processed/M049-D-public-notice-and-signal-board-clean-v1.glb` | 728 tris / 25 closed parts | accept |
| M052-A | `Meshy_AI_Iron_Alarm_Bell_Timbe_0726210351_generate.glb` | `processed/M052-A-bell-or-gong-yoke-clean-v1.glb` | 758 tris / 21 closed parts | accept |
| M053-A | `Meshy_AI_Lectern_Inspection_St_0726210431_generate.glb` | `processed/M053-A-archive-lectern-and-scribe-station-clean-v1.glb` | 754 tris / 41 closed parts | accept |
| M054-A | `Meshy_AI_chevaux_de_frise_barr_0726210459_generate.glb` | `processed/M054-A-chevaux-de-frise-and-spike-barrier-clean-v1.glb` | 832 tris / 11 closed parts | accept |
| M055-A | `Meshy_AI_timber_barricade_lowp_0726210720_generate.glb` | `processed/M055-A-movable-timber-barricade-clean-v1.glb` | 832 tris / 16 closed parts | accept |
| M056-A | `Meshy_AI_Wattle_Fence_Screen_L_0726210636_generate.glb` | `processed/M056-A-wattle-and-woven-screen-clean-v1.glb` | 860 tris / 11 closed parts | accept |
| M057-A primary | `Meshy_AI_Gabion_Stone_Basket_L_0726211019_generate.glb` | `processed/M057-A-gabion-and-stone-basket-cluster-clean-v1.glb` | 828 tris / 43 closed parts | accept as canonical; cleanest containment inside frame |
| M057-A alternate 1 | `Meshy_AI_Gabion_Stone_Basket_L_0726210808_generate.glb` | `processed/variants/M057-A-gabion-stone-pack-alternate-1-clean-v1.glb` | 834 tris / 39 closed parts | retain; distinct packed-stone arrangement |
| M057-A alternate 2 | `Meshy_AI_Gabion_Stone_Basket_L_0726211210_generate.glb` | `processed/variants/M057-A-gabion-stone-pack-alternate-2-clean-v1.glb` | 842 tris / 48 closed parts | retain; distinct packed-stone arrangement |
| M058-A | `Meshy_AI_Timber_Holding_Cage_L_0726210916_generate.glb` | `processed/M058-A-holding-cage-or-animal-pen-module-clean-v1.glb` | 1,030 tris / 47 closed parts | accept |
| M062-B | `Meshy_AI_timber_brace_donor_cl_0726211055_generate.glb` | `processed/M062-B-timber-repair-and-brace-cluster-clean-v1.glb` | 676 tris / 10 closed parts | repaired and accepted |
| M064-B | `Meshy_AI_Military_Stores_Clust_0726211154_generate.glb` | `processed/M064-B-camp-kitchen-and-stores-cluster-clean-v1.glb` | 970 tris / 43 closed parts | repaired and accepted |

## Repair record

The standard conservative cleanup applied transforms, recalculated normals, stripped material,
image, UV, color, normal, and tangent payloads, and retained intentionally separate closed
construction parts.

`M062-B` arrived with eleven open boundary edges. One missing face was closed directly from the
untouched source, producing 676 triangles with zero boundary or non-manifold edges.

`M064-B` arrived with ten open boundary edges. Two missing faces were closed directly from the
untouched source, producing 970 triangles with zero boundary or non-manifold edges. A preliminary
welded derivative produced a non-manifold seam and was rejected; it did not replace the canonical
output.

All ten canonical outputs now have:

- zero boundary edges;
- zero non-manifold edges;
- zero materials;
- zero embedded images; and
- retained front/rear silhouettes matching their approved references.

Boundary-repair proof renders are in
`intake-previews/guard-post-occupation-defense-2026-07-26/repair-proofs/`.

## Batch result

All ten requested jobs pass. No regeneration is required. The three gabion results are useful
minor variants rather than redundant failures, so all three are retained with one canonical
primary.
