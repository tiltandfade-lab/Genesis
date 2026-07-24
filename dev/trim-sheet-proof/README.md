# Genesis trim-sheet proof V001

This proof packs the three shipped realm trim strips into the same
`architecture-core-v1` layout and maps all six semantic roles onto real
three.js geometry:

- plain fallback
- base course
- cornice
- coping
- nosing
- curb

The material and diagnostic captures use identical geometry. The diagnostic
sheet makes slot selection, repeat boundaries, odd run lengths, and L-corner
phase continuity visible.

## Run the proof

```sh
python3 dev/trim-sheet-proof/build-trim-sheets.py
node dev/trim-sheet-proof/capture-trim-sheet-proof.mjs
node dev/trim-sheet-proof/verify-trim-sheet-proof.mjs
```

Serve the repository root and open
`dev/trim-sheet-proof/trim-sheet-proof.html` to switch live between the
material sheets and UV diagnostic.

## Scope boundary

V001 proves the atlas contract and projection method using real shipped
Genesis art. The six role bands are deterministic crops and grades of each
realm's existing single trim strip. Production sheets should retain the same
manifest coordinates while replacing those derived bands with independently
authored role art.
