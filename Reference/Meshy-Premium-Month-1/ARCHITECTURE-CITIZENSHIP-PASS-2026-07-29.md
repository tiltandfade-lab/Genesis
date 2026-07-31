# Architecture Citizenship Pass — 2026-07-29

The CL-F09 architecture form ladder audited generated Meshy geometry beyond the existing 15-member
runtime pack. Four high-value architecture donors were inspected in neutral clay and through
topology reports.

| job | geometry | topology | ruling |
|---|---:|---|---|
| `M025-A` hand windlass | 988 tris / 31 islands | closed manifold | accepted |
| `M047-A` market-stall chassis | 2,044 tris / 83 islands | closed manifold; LOD compiler reduces it | accepted |
| `M075-A` beacon/fire basket | 924 tris / 29 islands | closed manifold | accepted |
| `M024-A` counterweighted road barrier | 986 tris / 8 islands | 112 open boundary edges | hold for repair |

The accepted three received transform-safe, material-free `clean-v1` donors in `processed/`, typed
runtime citizenship metadata, Genesis material ownership, mounting/interaction sockets, and three
local LODs. Their runtime slugs are:

- `hand-windlass`
- `market-stall-chassis`
- `beacon-signal-fire-basket`

`M024-A` was not forced through admission. Boundary fill reduced 112 open edges to 16 but did not
produce closed manifold parts. Dropping the five open islands removed the boom, upright, and braces,
destroying the asset's purpose. The accepted runtime behavior remains the engine-owned checkpoint
assembly; the intact source remains a named promotion candidate.
