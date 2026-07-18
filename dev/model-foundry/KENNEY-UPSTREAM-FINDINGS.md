---
type: research
project: Genesis
status: FINDINGS — 2026-07-16
audience: Codex (planning the Kenney-mess fix) — self-contained; you do not need the originating chat
governed_by: KENNEY-SOCKET-WAVE.md (KS-1/KS-2/KS-3, ELEV-1), KENNEY-MESH-AUDIT.md
purpose: What Kenney's own repos/tooling and the packs' own conventions give us for free, so the fix builds on the kit's grammar instead of inventing one.
---

# Kenney upstream findings — report for the fix plan

**Task that produced this:** "Search Kenney's starter-kit repos, asset helpers, etc. — can any of it
get us further along on the Kenney mess?" This report answers that and hands you concrete numbers +
recommendations to fold into the plan. Everything here is reproducible; commands are in the appendix.

---

## TL;DR (the verdict)

> **Their code: no reuse. Their conventions: yes — and they de-risk the two riskiest lines of KS-1
> (the socket schema and the scale law).**

- Kenney assembles modular 3D pieces with **grid-cell + 90° rotation only — no per-object sockets.**
  So KS-1's `butt-join-{n/s/e/w}` schema is over-spec for *structural* pieces. Keep sockets for
  **mounts** (`hinge`, `top-surface`, `wall-mount`); let grid-cell + a 0–3 orientation index carry
  structural joins. This is not a departure from Adam's "adopt the kit's conventions" ruling — it
  **is** their convention.
- `canonicalScale` is **not a per-piece measurement project** — it's one clean constant per pack.
  Measured: **modular-dungeon-kit = 4.0 units/module**, **mini-dungeon = 2.0** (base floor 1.0).
- The dungeon kit **already ships the geometry** that KS-2 (doors), KS-3 (shells), and ELEV-1
  (elevation) are speccing. Those waves should **consume kit pieces, not synthesize geometry.**
- Every Kenney repo is **GDScript on Godot's GridMap** — nothing is web/three.js. Zero direct code
  reuse; what transfers is the grammar. The three.js analogue of their approach is `InstancedMesh`
  keyed by (piece, orientation).

---

## Context: what "further along" means (the lines this touches)

The fix touches four specced-but-unbuilt waves in `KENNEY-SOCKET-WAVE.md`:
- **KS-1** — donor adapter + socket schema + per-piece normalization to the 5-ft grid.
- **KS-2** — the door as a frame+leaf assembly on a `hinge` socket.
- **KS-3** — rolled room shells assembled from kit wall/floor modules.
- **ELEV-1** — rolled per-room elevation profiles (dais/sunken/terraced/chasm).

The findings below feed all four.

---

## Finding A — Kenney's own assembly method is grid+rotate, not sockets

Kenney's only modular-3D-*placement* starter kit is **Starter-Kit-City-Builder** (GDScript, Godot).
Its `builder.gd` assembles Kenney modular pieces with, verbatim:

```gdscript
# world hit → discrete cell (one-unit grid, snap by rounding)
var gridmap_position = Vector3(round(world_position.x), 0, round(world_position.z))

# orientation: 90° steps about Y only, read back as an orthogonal index
selector.rotate_y(deg_to_rad(90))
gridmap.get_orthogonal_index_from_basis(selector.basis)

# pieces are just an indexed array, cycled
index = wrap(index + 1, 0, structures.size())
```

Placement rides Godot's **GridMap + a dynamically-built MeshLibrary** (the README's "Dynamic
MeshLibrary creation"). [KayKit-Hexagons](https://github.com/KenneyNL/KayKit-Hexagons) is a second
example of the same "place modular kit models on a grid" pattern (hex variant).

**Implication for KS-1:** Kenney assembles walls/floors/corridors with *nothing but grid-cell + one
of four rotations*. There is **no per-object butt-join socket** in their pipeline — the "socket" for
a structural piece IS its cell plus which orientation it took. The kits are *authored* so snap+rotate
is sufficient. KS-1's `butt-join-{n/s/e/w}` nodes are therefore likely over-spec for structural
pieces; sockets earn their keep only for *mount* relationships a grid cell can't express — `hinge`
(door leaf), `top-surface` (decor on a table), `wall-mount` (torch/banner).

---

## Finding B — the pilot packs are already grid-uniform (measured, not guessed)

I read the GLB POSITION-accessor bounds directly for the two master-resident STRUCTURAL packs (the
KS-1 pilot set). Selected rows — full run in the appendix:

**kenney-modular-dungeon-kit → clean 4.0-unit module.** Every base tile is a multiple of 4:

| piece | footprint XZ | module multiple |
| --- | --- | --- |
| corridor, template-floor, template-wall, template-corner | 4.0 × 4.0 | 1× |
| template-detail, template-wall-half | 2.0 | ½× |
| corridor-wide, template-floor-big | 8.0 | 2× |
| room-small (+variation) | 12.0 | 3× |
| room-large (+variation) | 20.0 | 5× |
| room-wide | 20.0 × 12.0 | 5×3 |

Wall height is uniform ≈ **5.233** across the pack (consistent ceiling line). Pieces that are NOT
clean multiples are exactly the interactables: `gate*` = 5.2/4.4 wide × 2.0 deep aperture,
`stairs` = 4.4 × 8.4, `stairs-wide` = 8.4 — i.e. the PART_DONOR / KS-2-assembly set.

**kenney-mini-dungeon → 2.0-unit module** for props/walls; base `floor` tile = **1.0**.

**Implication:** `canonicalScale` is one clean divide per pack (`dungeon ÷ 4.0 → 5-ft cell`,
`mini ÷ 2.0`), not a measurement project. KS-1's rule "measure not guess; a piece that can't map to
the grid is PART_DONOR" is correct — and now has its numbers. The gate to write is simply: *is the
footprint a clean multiple of the pack module? → DIRECT; else → PART_DONOR.*

---

## Finding C — the dungeon kit already ships the vocabulary later waves are speccing

Piece names are the contract. From the on-disk file list:

- **KS-2 (door = assembly):** `gate`, `gate-door`, `gate-door-window`, `gate-metal-bars` are already
  frame+leaf pieces at a 2.0-deep aperture. The frame/leaf split KS-2 wants exists; the only new
  thing is the `hinge` socket on the frame.
- **KS-3 (kit shells):** `template-floor`, `template-wall`, `template-wall-corner`,
  `template-wall-half`, `template-wall-top`, `template-corner`, and the full `corridor-*` family
  (`-corner/-end/-intersection/-junction/-transition`, plus `-wide` variants) are the butt-join tile
  set for rect rooms + corridors. Pre-baked `room-small/-large/-wide` (+`-variation`) give
  whole-room shells for the common cases *without tiling at all*.
- **ELEV-1 (rolled elevation):** `template-floor-layer-raised`, `template-floor-layer-hole`,
  `template-wall-stairs`, `stairs`, `stairs-wide` are the dais / pit / split-level / tier pieces —
  the kit's own answer to ELEV-1's dais/sunken/terraced/chasm rows. ELEV-1b's "kit pieces at tier
  boundaries" already has its parts on disk.

---

## Finding D — repo inventory + why there's no code reuse

`github.com/KenneyNL` (14 repos). Relevance-ranked:

| repo | lang | relevance |
| --- | --- | --- |
| **Starter-Kit-City-Builder** | GDScript | grid-snap/rotate/MeshLibrary pattern (Finding A) — conventions only |
| **KayKit-Hexagons** | GDScript | 2nd "modular kit models on a grid" example (hex, not our square grid) |
| Starter-Kit-3D-Platformer / FPS / Racing / Match-3 | GDScript | not modular-placement; low relevance |
| Starter-Kit-Basic-Scene | — | minimal Godot scene scaffold; n/a |
| Godot-SplashScreens, Adobe-Alternatives, misc | — | unrelated |

**None are three.js / web.** Genesis is HTML + three.js; every Kenney repo rides Godot's GridMap in
GDScript. So there is **zero direct code reuse** — what transfers is the *grammar*
(cell+orientation-index assembly, uniform-module authoring, frame/leaf doors, layer pieces for
elevation), not a library. There is no Kenney-published three.js loader or asset-helper. The
three.js-native equivalent of their dynamic MeshLibrary is `InstancedMesh` keyed by
(piece, material-recipe, orientation).

---

## Recommendations to fold into the fix plan

1. **Narrow the socket schema to mounts.** Sockets = `hinge`, `top-surface`, `wall-mount` only.
   Structural joins ride grid-cell + a 0–3 orientation index (Kenney's `orthogonal_index`), not
   `butt-join-*` nodes. Less metadata to stamp, less to verify, and it matches the kit's real grammar.
2. **Treat `canonicalScale` as a per-pack constant.** dungeon = 4.0, mini = 2.0 (floor 1.0). The
   admission gate is "clean multiple of the pack module → DIRECT; else → PART_DONOR."
3. **Prefer the kit's pre-baked shells for common rooms** (`room-small/-large/-wide`, `corridor-*`);
   reserve tile-from-`template-*` assembly for odd Stage-C shapes. Less join-seam surface for KS-3.
4. **KS-2 and ELEV-1 consume existing kit pieces, not synthesized geometry** — `gate`/leaf for doors,
   `template-floor-layer-*` / `stairs*` for elevation. The specs already lean this way; the pieces exist.
5. **Runtime placement primitive = three.js `InstancedMesh` per (piece, material-recipe)** — the
   web-native analogue of Godot's dynamic MeshLibrary — so a 5×3-module room is instanced tiles, not
   dozens of draw calls.

---

## What I did NOT do / open questions for Codex

- **No spec or code was changed.** `KENNEY-SOCKET-WAVE.md` is untouched (Adam asked to hold the
  socket-narrowing note until this plan is read). If you adopt Recommendation 1, that spec's KS-1
  socket list and `dev/verify-kenney-adapter.mjs`'s "sockets present+typed on every admitted piece"
  gate both need to change together.
- **Not re-litigating locked design.** Grid law, edit-source→compile-artifact, propose-and-archive
  for authored table content all stand.
- **Open question:** the mini-dungeon `floor` tile is 1.0 while its props are 2.0 — decide whether the
  pack module is 2.0 with a 1.0 floor sub-tile, or the floor defines the module. (Doesn't block the
  dungeon-kit pilot; dungeon-kit is cleanly 4.0 throughout.)

---

## Appendix — reproduction

Repo inventory + assembly code (public):
- https://github.com/KenneyNL?tab=repositories
- https://github.com/KenneyNL/Starter-Kit-City-Builder (see `scripts/builder.gd`)
- https://kenney.nl/assets/modular-dungeon-kit · https://kenney.nl/starter-kits

Module-size measurement (run from repo root) — reads GLB POSITION-accessor min/max, no deps:

```bash
python3 - <<'PY'
import struct, json, glob, os
def bounds(p):
    d=open(p,'rb').read(); _,_,L=struct.unpack('<III',d[:12]); off=12; J=None
    while off<L:
        cl,ct=struct.unpack('<II',d[off:off+8]); c=d[off+8:off+8+cl]
        if ct==0x4E4F534A: J=json.loads(c); 
        off+=8+cl
    mn=[1e9]*3; mx=[-1e9]*3
    for a in J.get('accessors',[]):
        if a.get('type')=='VEC3' and len(a.get('min',[]))==3:
            for i in range(3): mn[i]=min(mn[i],a['min'][i]); mx[i]=max(mx[i],a['max'][i])
    return [round(mx[i]-mn[i],3) for i in range(3)]
for pack in ('kenney-modular-dungeon-kit','kenney-mini-dungeon'):
    print('====',pack); 
    for p in sorted(glob.glob(f'assets/models/{pack}/*.glb')):
        print(f'{os.path.basename(p):32s}', bounds(p))
PY
```
