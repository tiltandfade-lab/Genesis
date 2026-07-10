#!/usr/bin/env python3
"""Genesis build — generate the XL/titan/large/redo regen sheets (2026-07-09, Adam's ruling:
"creatures 9' and up need to be regened at 2x on sheets with less sprites — 4 per sheet
for the big ones, and the real badass titanic ones get their own sheet"; extended same day:
"the large creatures 5-8 ft need a 3x3 sprite pass to boost the resolution").

Reads data/sprite-registry.js + the review overlay + the v2 manifest (for cues) and emits:

  dev/sprite-manifests/XL-REGEN-PROMPTS.md      paste-ready generation prompts, one block/sheet
  dev/sprite-manifests/xl-regen-manifest.json   v2-shaped manifest the slicer reads via
                                                --manifest-path (slugs are the ORIGINAL slugs,
                                                so slicing OVERWRITES the low-res sprite)

Tiers (effective height = overlay scale x 6ft x SRD size-plane multiplier):
  TITAN  >= 24 ft            -> one creature per sheet (full-frame, max detail)
  XL     9 - 24 ft           -> 2x2 sheets, 4 creatures each (~2.5x cell resolution)
  LARGE  5 - 8 ft            -> 3x3 sheets, 9 creatures each (~1.7x cell resolution vs 5x5)
  REDO   verdict:fail < 9 ft -> standard 5x5 sheets (art was rejected, size was fine)

LARGE and REDO both cover sub-9ft creatures but are mutually exclusive: a failed-verdict
sprite in the 5-8 ft band still goes to REDO (art was rejected, not resolution), while LARGE
only picks up pass-verdict (or unruled) sprites in that band that TITAN/XL/REDO didn't
already claim. Unlike REDO, LARGE resamples art the reviewer already approved — the resulting
slice is NEW art and needs a fresh pass through the review tool, same as XL/TITAN.

Slice a returned PNG with:
  python3 build/slice-sprites.py <png> --manifest-v2 <sheetId> \
      --manifest-path dev/sprite-manifests/xl-regen-manifest.json --review

Both outputs are GENERATED — never hand-edit; re-run this script (rulings live in the
overlay, heights in overlay scales).
"""

import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY_JS = os.path.join(ROOT, "data", "sprite-registry.js")
OVERLAY = os.path.join(ROOT, "dev", "model-qa", "sprite-tags-overlay.json")
V2_MANIFEST = os.path.join(ROOT, "dev", "sprite-manifests", "v2-manifest.json")
STYLE_SOURCE = os.path.join(ROOT, "dev", "model-qa", "sprite-sheets", "fantasy.md")
OUT_MD = os.path.join(ROOT, "dev", "sprite-manifests", "XL-REGEN-PROMPTS.md")
OUT_MANIFEST = os.path.join(ROOT, "dev", "sprite-manifests", "xl-regen-manifest.json")

REALM = "fantasy"
LARGE_MIN_FT = 5
XL_MIN_FT = 9
TITAN_MIN_FT = 24
LARGE_PER_SHEET = 9
XL_PER_SHEET = 4
REDO_PER_SHEET = 25
SIZE_PLANE = {"tiny": 0.5, "small": 1, "medium": 1, "large": 2, "huge": 3, "gargantuan": 4}

# The anti-artifact rider (2026-07-09: "a lot failed because of too much magenta artifact")
CLEAN_KEY_RULES = (
    "Solid flat magenta (#FF00FF) is the BACKGROUND ONLY: absolutely no magenta or pink "
    "cast, glow, rim-light, halo, or reflection on the creature itself; no magenta bleed "
    "into wing membranes, fur, or translucent parts; crisp hard silhouette edges against "
    "the background (no soft anti-aliased fade into the magenta)."
)


def load_registry():
    script = (
        'const fs=require("fs");'
        f'const src=fs.readFileSync({json.dumps(REGISTRY_JS)},"utf8");'
        'eval(src.replace(/const SPRITE_REGISTRY=/,"globalThis.R="));'
        "process.stdout.write(JSON.stringify(globalThis.R));"
    )
    out = subprocess.run(["node", "-e", script], capture_output=True, text=True, cwd=ROOT)
    if out.returncode != 0:
        raise SystemExit(f"node failed to parse registry: {out.stderr[:400]}")
    return json.loads(out.stdout)


def style_block():
    with open(STYLE_SOURCE, encoding="utf-8") as f:
        for line in f:
            m = re.match(r"Style block: (.+)", line.strip())
            if m:
                return m.group(1)
    raise SystemExit(f"no 'Style block:' line found in {STYLE_SOURCE}")


def main():
    reg = load_registry()
    overlay = json.load(open(OVERLAY, encoding="utf-8"))
    v2 = json.load(open(V2_MANIFEST, encoding="utf-8"))
    cues = {c["slug"]: c.get("cue", "") for s in v2["sheets"] for c in s["cells"]}
    style = style_block()

    def eff_ft(slug, e):
        sc = (overlay.get(slug) or {}).get("scale") or 1
        return sc * 6 * SIZE_PLANE.get((e["size"] or "medium").lower(), 1)

    cut = {k: v for k, v in reg.items()
           if v["status"] == "cut" and v["realm"] == REALM and v["kind"] == "monster"}
    titans, xl, large, redo = [], [], [], []
    for slug, e in sorted(cut.items(), key=lambda kv: -eff_ft(kv[0], kv[1])):
        ft = eff_ft(slug, e)
        failed = (overlay.get(slug) or {}).get("verdict") == "fail"
        if ft >= TITAN_MIN_FT:
            titans.append((slug, e, ft))
        elif ft >= XL_MIN_FT:
            xl.append((slug, e, ft))
        elif ft >= LARGE_MIN_FT and not failed:
            large.append((slug, e, ft))
        elif failed:
            redo.append((slug, e, ft))

    sheets = []
    md = [
        "# XL / titan / large / redo regen prompts — GENERATED by build/gen-xl-regen-sheets.py\n\n",
        "Never hand-edit; adjust the overlay (scales/verdicts) and re-run. Paste one fenced\n"
        "block per generation. Drop each returned PNG anywhere and slice with:\n\n"
        "    python3 build/slice-sprites.py <png> --manifest-v2 <sheetId> \\\n"
        "        --manifest-path dev/sprite-manifests/xl-regen-manifest.json --review\n\n"
        "Slices OVERWRITE the original sprite slug. A re-cut slug that still carries\n"
        "verdict:fail stays blocked in the theater until re-ruled in the review tool.\n"
        "Large/XL slices replace previously APPROVED art with brand-new art too — those\n"
        "slugs need a fresh pass through the review tool even though they already carried\n"
        "verdict:pass; a resolution regen is not the same art as what was ruled on.\n\n"
        f"**{len(titans)} titan solos · {len(xl)} XL creatures "
        f"({(len(xl)+XL_PER_SHEET-1)//XL_PER_SHEET} sheets of {XL_PER_SHEET}) · "
        f"{len(large)} large creatures "
        f"({(len(large)+LARGE_PER_SHEET-1)//LARGE_PER_SHEET if large else 0} sheets of {LARGE_PER_SHEET}) · "
        f"{len(redo)} redo creatures**\n\n",
    ]

    def cell_line(n, slug, e, ft):
        cue = cues.get(slug, "")
        return f"{n}. **{e['name']}** — {cue} — stands ~{round(ft)} ft tall\n"

    md.append("## Titan solos (one creature per image — full frame, maximum detail)\n\n")
    for slug, e, ft in titans:
        sid = f"{REALM}-titan-{slug.replace('spr-' + REALM + '-', '')}"
        sheets.append({"id": sid, "realm": REALM, "kind": "monster",
                       "sourceFile": os.path.relpath(OUT_MD, ROOT),
                       "sourceSection": f"Titan solo — {e['name']}",
                       "expected": 1,
                       "cells": [{"n": 1, "name": e["name"], "slug": slug,
                                  "cue": cues.get(slug, "")}]})
        md.append(f"### {sid}\n\n```\n"
                  f"ONE single creature, centered, filling most of the frame, maximum detail. "
                  f"{style} {CLEAN_KEY_RULES}\n\n"
                  f"{cell_line(1, slug, e, ft)}```\n\n")

    md.append(f"## XL sheets (2x2 grid, {XL_PER_SHEET} creatures, each rendered LARGE — "
              "~2x the detail of a standard 5x5 sheet)\n\n")
    for i in range(0, len(xl), XL_PER_SHEET):
        chunk = xl[i:i + XL_PER_SHEET]
        sid = f"{REALM}-xl-{i // XL_PER_SHEET + 1}"
        sheets.append({"id": sid, "realm": REALM, "kind": "monster",
                       "sourceFile": os.path.relpath(OUT_MD, ROOT),
                       "sourceSection": f"XL sheet {i // XL_PER_SHEET + 1}",
                       "expected": len(chunk),
                       "cells": [{"n": n + 1, "name": e["name"], "slug": slug,
                                  "cue": cues.get(slug, "")}
                                 for n, (slug, e, ft) in enumerate(chunk)]})
        md.append(f"### {sid}\n\n```\n"
                  f"2x2 grid, {len(chunk)} cells, one distinct creature per cell, uniform cell "
                  f"size, each creature rendered LARGE — filling its cell, roughly double the "
                  f"detail of a small sprite. Consistent scale across cells. {style} "
                  f"{CLEAN_KEY_RULES}\n\n"
                  + "".join(cell_line(n + 1, slug, e, ft) for n, (slug, e, ft) in enumerate(chunk))
                  + "```\n\n")

    if large:
        md.append(f"## Large 3x3 sheets (5-8 ft) ({LARGE_PER_SHEET} creatures, each rendered "
                  "LARGE — ~1.7x the detail of a standard 5x5 sheet)\n\n")
        for i in range(0, len(large), LARGE_PER_SHEET):
            chunk = large[i:i + LARGE_PER_SHEET]
            sid = f"{REALM}-large-{i // LARGE_PER_SHEET + 1}"
            sheets.append({"id": sid, "realm": REALM, "kind": "monster",
                           "sourceFile": os.path.relpath(OUT_MD, ROOT),
                           "sourceSection": f"Large sheet {i // LARGE_PER_SHEET + 1}",
                           "expected": len(chunk),
                           "cells": [{"n": n + 1, "name": e["name"], "slug": slug,
                                      "cue": cues.get(slug, "")}
                                     for n, (slug, e, ft) in enumerate(chunk)]})
            md.append(f"### {sid}\n\n```\n"
                      f"3x3 grid, {len(chunk)} distinct creatures, one distinct creature per "
                      f"cell, uniform cell size, each creature rendered LARGE — filling its "
                      f"cell, roughly 1.7x the detail of a small sprite. Consistent scale "
                      f"across cells. {style} {CLEAN_KEY_RULES}\n\n"
                      + "".join(cell_line(n + 1, slug, e, ft) for n, (slug, e, ft) in enumerate(chunk))
                      + "```\n\n")

    if redo:
        md.append("## Redo sheets (standard size — art rejected in review, size was fine)\n\n")
        for i in range(0, len(redo), REDO_PER_SHEET):
            chunk = redo[i:i + REDO_PER_SHEET]
            sid = f"{REALM}-redo-{i // REDO_PER_SHEET + 1}"
            side = 5 if len(chunk) > 16 else 4 if len(chunk) > 9 else 3 if len(chunk) > 4 else 2
            sheets.append({"id": sid, "realm": REALM, "kind": "monster",
                           "sourceFile": os.path.relpath(OUT_MD, ROOT),
                           "sourceSection": f"Redo sheet {i // REDO_PER_SHEET + 1}",
                           "expected": len(chunk),
                           "cells": [{"n": n + 1, "name": e["name"], "slug": slug,
                                      "cue": cues.get(slug, "")}
                                     for n, (slug, e, ft) in enumerate(chunk)]})
            md.append(f"### {sid}\n\n```\n"
                      f"{side}x{side} grid, {len(chunk)} cells (row-major from the top-left; "
                      f"leave any unused trailing cells as plain flat magenta), one distinct "
                      f"creature per cell, uniform cell size, consistent scale. {style} "
                      f"{CLEAN_KEY_RULES}\n\n"
                      + "".join(cell_line(n + 1, slug, e, ft) for n, (slug, e, ft) in enumerate(chunk))
                      + "```\n\n")

    with open(OUT_MD, "w", encoding="utf-8") as f:
        f.write("".join(md))
    with open(OUT_MANIFEST, "w", encoding="utf-8") as f:
        json.dump({"sheets": sheets}, f, indent=1, ensure_ascii=False)
    print(f"wrote {OUT_MD}")
    print(f"wrote {OUT_MANIFEST} ({len(sheets)} sheets: {len(titans)} titan, "
          f"{(len(xl)+XL_PER_SHEET-1)//XL_PER_SHEET} XL, "
          f"{(len(large)+LARGE_PER_SHEET-1)//LARGE_PER_SHEET if large else 0} large, "
          f"{(len(redo)+REDO_PER_SHEET-1)//REDO_PER_SHEET if redo else 0} redo)")
    print(f"population: {len(titans)} titan slugs, {len(xl)} XL slugs, "
          f"{len(large)} large slugs, {len(redo)} redo slugs")


if __name__ == "__main__":
    main()
