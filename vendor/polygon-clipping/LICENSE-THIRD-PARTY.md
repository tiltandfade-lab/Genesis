# Third-party code inlined in polygon-clipping.js

`polygon-clipping@0.15.7`'s own official build (`dist/polygon-clipping.umd.js`, the artifact vendored
verbatim in this directory as `polygon-clipping.js` — see `README-GENESIS.md`) statically bundles its
two runtime dependencies at publish time. Their code is physically present inside `polygon-clipping.js`
(the splay-tree implementation and the `orient2d` robust-predicate routine), so both licenses are
reproduced here in full per `docs/GEOMETRY-OSS-INTEGRATION.md` §14 ("preserve the upstream license
beside the vendored source").

## splaytree (MIT)

`polygon-clipping.js` inlines splaytree's `Tree`/`Node`/splay-rotation implementation (visible as the
`@license MIT` / `@preserve` comment block near the top of the file, which rollup's build preserved).

Bundled at `splaytree` **v3.1.2** per that preserved comment (polygon-clipping's own `package.json`
declares a `"splaytree": "^3.1.0"` dependency range; v3.1.2 is the exact version its own build resolved
and inlined, per the comment header).

```
The MIT License (MIT)

Copyright (c) Alexander Milevski <info@w8r.name>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

Repository: https://github.com/w8r/splay-tree

## robust-predicates (Unlicense) — `orient2d`

`polygon-clipping.js` also inlines the `orient2d`/`orient2dadapt` adaptive-precision orientation
predicate (the `epsilon`/`splitter`/`resulterrbound`/`ccwerrbound*` constants and the
`orient2dadapt`/`orient2d` functions in the file, ported from Jonathan Shewchuk's robust predicates —
this is the same algorithm family as the standalone `robust-predicates` npm package pinned in
`dev/geometry-tools/pins.json` for a *different* purpose (R1's rejected `orientXZ` spike, see that
package's own `geometryCandidates.robust-predicates` entry and
`dev/geometry-research/bakeoff/ruling.json`'s rejection note). polygon-clipping's own build inlines its
own copy of this routine directly rather than importing the npm package at runtime — Genesis's kernel
never calls it directly; it is purely an internal implementation detail of polygon-clipping's own
sweep-line boolean algorithm (`Segment.compare`'s orientation math).

```
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
```

Repository: https://github.com/mourner/robust-predicates (the standalone npm package pinned at
`robust-predicates@3.0.3` in `dev/geometry-tools/pins.json`; polygon-clipping's own `package.json`
declares `"robust-predicates": "^3.0.2"`).

## Also present: a small TypeScript `__generator` helper

The file also carries a `/*! Copyright (c) Microsoft Corporation... Apache License, Version 2.0 */`
comment block above a `__generator` helper function — this is TypeScript's standard compiled-output
helper for `function*`/`yield` generators (emitted by `tsc` when targeting a runtime without native
generator support), part of polygon-clipping's own build output, not a separate dependency Genesis
needs to track. Preserved as-is in `polygon-clipping.js` (the comment survived rollup's build
unmodified, same as the splaytree notice above).
