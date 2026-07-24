#!/usr/bin/env python3
"""HISTORICAL Genesis build — reproduce ROUND-4 regen-v3 "big boys" (Adam 2026-07-16).

Do not use this generator's fixed layouts or blanket 4:5 cells to plan new production. The
successful "biggest creatures get their own sheet" finding remains current; new packet format
and subject-based cell aspect live in dev/model-qa/sprite-sheets/PRODUCTION-FORMAT.md. Character
cells generally begin at 4:5. Giant/titanic 4:6 is a provisional test candidate, not yet locked.

Reworks the XL/titan regen into the PROVEN regen-v3 per-realm sheet architecture, with
Adam's two corrections:
  - the biggest creatures get their OWN sheet (one cell),
  - every sprite cell is 4:5 PORTRAIT (taller than wide) — the 1x1 square cell squashed
    proportions; 4:5 fixed it.

Size-bands the fantasy big-creature regen set and emits size-matched sheets, all with
4:5 cells:
  Gargantuan / eff>=24ft (titanic)  -> SOLO      1 cell   canvas 1024x1280
  Huge                              -> 1 row x 2 (two 4:5) canvas 1600x1000
  Large                             -> 2 rows x 2 (four 4:5) canvas 1280x1600
  <9ft verdict:fail (redo)          -> 4 rows x 4 (4:5 cells) canvas 1280x1600 (16/sheet)

Outputs (GENERATED — never hand-edit; re-run this script; rulings live in the overlay):
  dev/model-qa/regen-v3/round4/fantasy-r4.md            paste-ready packet, one block/sheet
  dev/model-qa/regen-v3/round4/fantasy-r4-manifest.json v2-shaped, slugs are ORIGINAL slugs
                                                        so slicing OVERWRITES in place

Selection (default): every Large/Huge/Gargantuan fantasy monster (the proportion fix applies
to the whole big tier), plus any smaller creature carrying verdict:fail (redo lane).
Pass --fails-only to restrict to verdict:fail + low-res (min-dim < 110px) creatures.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REG = os.path.join(ROOT, "data", "sprite-registry.js")
OVERLAY = os.path.join(ROOT, "dev", "model-qa", "sprite-tags-overlay.json")
V2 = os.path.join(ROOT, "dev", "sprite-manifests", "v2-manifest.json")
STYLE_SOURCE = os.path.join(ROOT, "dev", "model-qa", "sprite-sheets", "fantasy.md")
SPRITES = os.path.join(ROOT, "assets", "sprites")
OUT_MD = os.path.join(ROOT, "dev", "model-qa", "regen-v3", "round4", "fantasy-r4.md")
OUT_MANIFEST = os.path.join(ROOT, "dev", "model-qa", "regen-v3", "round4", "fantasy-r4-manifest.json")

SIZE_PLANE = {"tiny": 0.5, "small": 1, "medium": 1, "large": 2, "huge": 3, "gargantuan": 4}
FAILS_ONLY = "--fails-only" in sys.argv

def load_style_block():
    """The EXPLICIT fantasy style — verbatim from model-qa/sprite-sheets/fantasy.md."""
    for line in open(STYLE_SOURCE, encoding="utf-8"):
        m = re.match(r"Style block:\s*(.+)", line.strip())
        if m:
            return m.group(1).strip()
    raise SystemExit(f"no 'Style block:' line in {STYLE_SOURCE}")


STYLE_BLOCK = load_style_block()

# Mechanical rules verbatim from sprite-sheets/fantasy.md, MINUS the fixed "5x5 / 25 cells /
# consistent scale across all 25" grid line (Adam's 4:5 size-banding replaces that per-sheet).
MECH = (
    "one distinct static character per cell (not a repeat, not an animation frame), uniform "
    "cell size, solid magenta (#FF00FF) background (no transparency, no other background "
    "elements), orthographic side view, each character fully visible from head to toe within "
    "its cell — no cropping at the top, bottom, or sides, the complete body must fit inside "
    "the cell boundary. Every character in an expressive, mid-action pose that captures its "
    "essence — mid-lunge, mid-cast, braced, snarling — never a neutral T-pose or idle stand. "
    "The magenta is the BACKGROUND ONLY: absolutely no magenta or pink cast, glow, rim-light, "
    "halo, aura, or atmospheric haze on or between the creatures; no magenta/purple murk in the "
    "gaps of a swarm; crisp hard silhouette edges against the background, no soft fade into the "
    "magenta."
)
SWARM_LINE = ("Swarm subjects: render as a mounded pile / clustered mass of creatures seen from "
              "eye level, never scattered as if viewed from above.")


def parse_registry():
    src = open(REG, encoding="utf-8").read()
    out = {}
    for m in re.finditer(r'"(spr-fantasy-[a-z0-9\-]+)":\s*\{([^{}]*)\}', src):
        b = m.group(2)
        def g(k, cast=str):
            mm = re.search(rf'{k}:\s*("?)([^",}}]*)\1', b)
            if not mm or mm.group(2) in ("null", ""):
                return None
            return cast(mm.group(2)) if cast is not str else mm.group(2)
        out[m.group(1)] = dict(name=g("name"), kind=g("kind"), size=g("size"),
                               cr=g("cr", float), status=g("status"))
    return out


def min_dim(slug):
    p = os.path.join(SPRITES, slug + ".png")
    if not os.path.exists(p):
        return 9999
    from PIL import Image
    w, h = Image.open(p).size
    return min(w, h)


def main():
    reg = parse_registry()
    overlay = json.load(open(OVERLAY, encoding="utf-8"))
    v2 = json.load(open(V2, encoding="utf-8"))
    cues = {c["slug"]: c.get("cue", "") for s in v2["sheets"] for c in s["cells"]}

    def eff_ft(slug, e):
        sc = (overlay.get(slug) or {}).get("scale") or 1
        return sc * 6 * SIZE_PLANE.get((e["size"] or "medium").lower(), 1)

    def verdict(slug):
        return (overlay.get(slug) or {}).get("verdict")

    mons = {k: v for k, v in reg.items()
            if v["kind"] == "monster" and v["status"] == "cut" and v["size"]}

    solo, huge, large, redo = [], [], [], []
    for slug, e in mons.items():
        sz = e["size"].lower()
        ft = eff_ft(slug, e)
        failed = verdict(slug) == "fail"
        big = sz in ("large", "huge", "gargantuan")
        if FAILS_ONLY and not (failed or min_dim(slug) < 110):
            if not (sz == "gargantuan" or ft >= 24):  # always keep the true titans
                continue
        if sz == "gargantuan" or ft >= 24:
            solo.append((slug, e, ft))
        elif sz == "huge":
            huge.append((slug, e, ft))
        elif sz == "large":
            large.append((slug, e, ft))
        elif failed:
            redo.append((slug, e, ft))
    for lst in (solo, huge, large, redo):
        lst.sort(key=lambda x: -x[2])

    sheets = []          # for the manifest
    md = []

    def subj(n, slug, e):
        cue = cues.get(slug) or f"{e['size']} creature"
        return f"{n}. **{e['name']}** — {cue}"

    def emit(title, filename, grid, canvas, cells, swarm=False, note=""):
        md.append(f"## `{filename}` — {len(cells)} sprite(s), {grid} (4:5 cells){note}\n\n```\n")
        cols = int(re.search(r"x (\d+)", grid).group(1)) if "x" in grid else len(cells)
        rows = int(re.search(r"(\d+) row", grid).group(1))
        slots = rows * cols
        # Authoritative fantasy style FIRST (verbatim), then the grid fused with the mechanical rules.
        md.append(STYLE_BLOCK + "\n")
        if slots > 1:
            grid_line = (f"Sprite sheet: a {grid} grid of {len(cells)} individual game "
                         f"sprites in 4:5 PORTRAIT cells (each cell taller than wide), "
                         f"consistent scale within the sheet, {MECH} Canvas: {canvas}.\n")
        else:
            grid_line = (f"A single game sprite centered in one 4:5 PORTRAIT cell (taller than "
                         f"wide), {MECH} Canvas: {canvas}.\n")
        md.append(grid_line)
        if slots > len(cells):
            md.append(f"The last {slots-len(cells)} cell(s) of the grid stay empty (pure background).\n")
        if swarm:
            md.append(SWARM_LINE + "\n")
        md.append("Subjects, one per cell, left to right then top to bottom:\n")
        for i, (slug, e, ft) in enumerate(cells, 1):
            md.append(subj(i, slug, e) + "\n")
        md.append("```\n")
        md.append("<!-- replaces: " + " · ".join(
            f"{i}={slug}" for i, (slug, e, ft) in enumerate(cells, 1)) + " -->\n\n")
        sheets.append({"id": filename[:-4], "realm": "fantasy", "kind": "monster",
                       "grid": grid, "chroma": "#FF00FF", "round": 4,
                       "expected": len(cells),
                       "cells": [{"n": i, "slug": slug, "name": e["name"], "size": e["size"]}
                                 for i, (slug, e, ft) in enumerate(cells, 1)]})

    def chunk(lst, k):
        return [lst[i:i+k] for i in range(0, len(lst), k)]

    md.insert(0,
        "# REGEN-V3 round-4 packet — fantasy big-boys (4:5 cells)\n\n"
        "GENERATED by build/gen-regenv3-bigboys.py — never hand-edit; adjust the overlay "
        "(scales/verdicts) and re-run. Same architecture as the round-3 packets that landed "
        "solid results.\n\n"
        "**Cell-aspect law (Adam 2026-07-16):** every sprite cell is 4:5 PORTRAIT (taller "
        "than wide) — the 1×1 square cell squashed proportions. The biggest creatures "
        "get their OWN sheet.\n\n"
        "Codex agent: work every sheet IN ORDER. Generate the EXACT prompt, save the PNG at "
        "`ui-sketches/sprite-sheets/<filename>`, check count/camera/proportions, regen once "
        "if wrong, never edit other files. Each cell's `replaces` slug is OVERWRITTEN on slice.\n\n"
        f"**{len(solo)} solo (own sheet) · {len(huge)} huge (2/sheet) · "
        f"{len(large)} large (4/sheet) · {len(redo)} redo (16/sheet)** "
        f"— {len(solo)+ (len(huge)+1)//2 + (len(large)+3)//4 + (len(redo)+15)//16} sheets total.\n\n")

    n = 0
    for (slug, e, ft) in solo:
        n += 1
        swarm = "swarm" in slug
        emit("solo", f"fantasy-solo-v3-r4-{n:02d}.png", "1 row x 1 column", "1024x1280",
             [(slug, e, ft)], swarm=swarm, note=f" — {e['name']} ({e['size']}, own sheet)")
    n = 0
    for grp in chunk(huge, 2):
        n += 1
        emit("huge", f"fantasy-huge-v3-r4-{n:02d}.png", "1 row x 2 columns", "1600x1000",
             grp, swarm=any("swarm" in s for s, _, _ in grp))
    n = 0
    for grp in chunk(large, 4):
        n += 1
        emit("large", f"fantasy-large-v3-r4-{n:02d}.png", "2 rows x 2 columns", "1280x1600",
             grp, swarm=any("swarm" in s for s, _, _ in grp))
    n = 0
    for grp in chunk(redo, 16):
        n += 1
        emit("redo", f"fantasy-redo-v3-r4-{n:02d}.png", "4 rows x 4 columns", "1280x1600",
             grp, swarm=any("swarm" in s for s, _, _ in grp))

    os.makedirs(os.path.dirname(OUT_MD), exist_ok=True)
    open(OUT_MD, "w", encoding="utf-8").write("".join(md))
    json.dump({"sheets": sheets}, open(OUT_MANIFEST, "w", encoding="utf-8"), indent=1)
    total = len(solo) + len(huge) + len(large) + len(redo)
    print(f"wrote {OUT_MD}")
    print(f"wrote {OUT_MANIFEST}")
    print(f"{total} creatures → {len(sheets)} sheets "
          f"(solo {len(solo)}, huge {len(huge)}, large {len(large)}, redo {len(redo)})")


if __name__ == "__main__":
    main()
