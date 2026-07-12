#!/usr/bin/env python3
"""Genesis build — regenerate src/engine/place-dressing.js's REALM_DRESSING block from the real
dressing-gen manifests at dev/model-qa/dressing-gen/manifests/<realm>-{flora-dg-01,clutter-dg-02,
objects-dg-03}.json.

BEAUTY-WAVE VP2 (docs/BEAUTY-WAVE.md §VP2): the pre-fold REALM_DRESSING was a hand-authored
~6-entry STUB per realm (art didn't exist yet). Now that dressing-gen art has landed for chrome/
gloom/fantasy (the 3 realms with an INTERIOR_TILE_KITS entry — src/ui/theater-interior.js; a realm
with no interior kit has no interior dressing pass, so extending REALM_DRESSING for realms without
a kit would be dead data), this script folds EVERY cell from those 3 realms' flora+clutter manifest
families (NOT objects — see FAMILIES below) into the full roster — one Object.freeze({...}) entry
per manifest cell, carrying:
    slug      — the manifest cell's own slug (the real assets/dressing/<slug>.png filename stem)
    primary   — the manifest cell's tags.primary (focal|floor|wall-hang|blocker|setPiece — the
                SAME vocabulary dressPlan already switches on, verbatim, no remapping)
    size      — the manifest cell's own `size` (small|medium|large)
    renderStrategy — derived geometry contract: billboard, extruded-card, or full-3d-prop
    lightAffine (only when true) — this script's OWN classification (the manifest carries no
                "light" primary tag), not a corpus field: entries with primary in
                {focal,wall-hang,setPiece} whose slug+label contains a light-fixture word (lantern/
                lamp/light/candle/torch/glow/neon) are tagged so dpPlaceRoom can co-locate them with
                a room's real PointLight seeds — mirrors the hand-authored stub's own picks
                (chrome-flora-lightpod, gloom-clutter-lanternrust, fantasy-clutter-lanternhook were
                ALL tagged true despite two of them being "broken/rusted" fixtures — the tag is a
                VISUAL "looks like a light source" read, not a functional-state one).

Effects-core (effects-core-dg-01/02) and ash flora/clutter/objects are also folded to assets/
dressing/ by build/slice-dressing-arrivals.py (art-ready), but are NOT added to REALM_DRESSING:
effects-core isn't a per-realm roster (it's the VP6 hit-effect card channel), and ash has no
INTERIOR_TILE_KITS entry yet — extending its roster here would be inert until an ash interior kit
exists (dressingRosterFor falls back to DRESSING_DEFAULT_REALM for any realmId without its own key).

Run:  python3 build/gen-realm-dressing.py --emit    (rewrites the block in place)
      python3 build/gen-realm-dressing.py            (dry-run: prints the block, no write)

GENERATED OUTPUT — the REALM_DRESSING block between the BEGIN/END markers in
src/engine/place-dressing.js. Never hand-edit that block; edit the manifests (or this script's
lightAffine heuristic) and regenerate.
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_DIR = os.path.join(ROOT, "dev", "model-qa", "dressing-gen", "manifests")
TARGET = os.path.join(ROOT, "src", "engine", "place-dressing.js")

# only realms with a real INTERIOR_TILE_KITS entry (src/ui/theater-interior.js) get a folded
# roster — see docstring. Keep in sync with that file's INTERIOR_TILE_KITS keys.
WIRED_REALMS = ["chrome", "gloom", "fantasy"]
# objects-dg-03 is DELIBERATELY EXCLUDED from the REALM_DRESSING fold (2026-07-10, this unit):
# its cells are stateful INTERACTABLES (archetype+state — door shut/ajar/open/broken, chest
# closed/open/looted, lever left/right, trap hidden/sprung, portal sealed/active, ...), not
# `{primary,size}` decorative cards — they carry no `size` field at all, and dressPlan has no
# state-selection logic (which door state renders, and when it flips) to consume them correctly.
# Folding them into REALM_DRESSING as inert setPiece cards (defaulting size + ignoring `state`)
# would silently render the WRONG state forever (e.g. always "shut" doors). The art IS sliced to
# assets/dressing/<slug>.png by build/slice-dressing-arrivals.py (art-ready), but wiring an
# interactable-object state channel is a separate, out-of-scope unit — see this run's report.
FAMILIES = ["flora-dg-01", "clutter-dg-02"]
# BEAUTY-WAVE VP2b (GALLERY PASS): reclaimed bottom-clipped sprites, framed as wall-hang
# painting cards by build/gen-gallery-paintings.py into <realm>-painting-dg.json. Loaded
# separately from FAMILIES (its manifest filename doesn't follow the -dgNN suffix convention)
# so a realm with zero gallery keepers just has no such file yet — load_realm_cells's existing
# missing-manifest WARNING already tolerates that, same as any other family.
PAINTING_FAMILY = "painting-dg"

LIGHT_WORDS = ("lantern", "lamp", "light", "candle", "torch", "glow", "neon")
LIGHT_ELIGIBLE_PRIMARY = {"focal", "wall-hang", "setPiece"}

BEGIN = "// GENERATED:REALM_DRESSING:BEGIN — python3 build/gen-realm-dressing.py --emit"
END = "// GENERATED:REALM_DRESSING:END"


def is_light_affine(cell):
    if cell["tags"]["primary"] not in LIGHT_ELIGIBLE_PRIMARY:
        return False
    haystack = (cell["slug"] + " " + cell.get("label", "")).lower()
    return any(w in haystack for w in LIGHT_WORDS)


def render_strategy(cell):
    primary = cell["tags"]["primary"]
    if primary == "wall-hang":
        return "extruded-card"
    if primary == "blocker":
        return "full-3d-prop"
    return "billboard"


def load_realm_cells(realm):
    cells = []
    for fam in FAMILIES + [PAINTING_FAMILY]:
        path = os.path.join(MANIFEST_DIR, f"{realm}-{fam}.json")
        if not os.path.exists(path):
            print(f"WARNING: {realm}-{fam}.json not found — skipping (partial roster)", file=sys.stderr)
            continue
        with open(path) as f:
            manifest = json.load(f)
        cells.extend(manifest["cells"])
    return cells


def js_entry(cell):
    parts = [f'slug: "{cell["slug"]}"', f'primary: "{cell["tags"]["primary"]}"', f'size: "{cell["size"]}"', f'renderStrategy: "{render_strategy(cell)}"']
    if is_light_affine(cell):
        parts.append("lightAffine: true")
    # BEAUTY-WAVE VP2b provenance: painting cards (from build/gen-gallery-paintings.py) carry
    # paintingOf so the DM/codex knows whose portrait hangs on the wall.
    if cell.get("paintingOf"):
        parts.append(f'paintingOf: "{cell["paintingOf"]}"')
    return "    Object.freeze({ " + ", ".join(parts) + " }),"


def build_block():
    lines = [BEGIN]
    lines.append("const REALM_DRESSING = Object.freeze({")
    for realm in WIRED_REALMS:
        cells = load_realm_cells(realm)
        lines.append(f"  {realm}: Object.freeze([")
        for cell in cells:
            lines.append(js_entry(cell))
        lines.append("  ]),")
    lines.append("});")
    lines.append(END)
    return "\n".join(lines), {r: len(load_realm_cells(r)) for r in WIRED_REALMS}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--emit", action="store_true", help="rewrite src/engine/place-dressing.js in place")
    args = ap.parse_args()

    block, counts = build_block()
    print(f"Roster sizes: {counts}")

    if not args.emit:
        print("\n--- dry run (pass --emit to write) ---\n")
        print(block)
        return

    with open(TARGET) as f:
        src = f.read()

    pattern = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END), re.DOTALL)
    if BEGIN in src and END in src:
        new_src = pattern.sub(block, src, count=1)
    else:
        # first run: replace the hand-authored stub declaration (from "const REALM_DRESSING ="
        # through its closing "});") with the generated block.
        stub_pattern = re.compile(r"const REALM_DRESSING = Object\.freeze\(\{.*?\n\}\);", re.DOTALL)
        if not stub_pattern.search(src):
            print("ERROR: could not find the hand-authored REALM_DRESSING stub to replace.", file=sys.stderr)
            sys.exit(1)
        new_src = stub_pattern.sub(block, src, count=1)

    with open(TARGET, "w") as f:
        f.write(new_src)
    print(f"OK: wrote generated REALM_DRESSING block to {TARGET}")


if __name__ == "__main__":
    main()
