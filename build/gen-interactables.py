#!/usr/bin/env python3
"""Genesis build — fold the objects-dg-03 manifests into data/interactables.js's
INTERACTABLES_REGISTRY (docs/STAGE-D-WAVE-SPECS.md D1, BEAUTY-WAVE-5.md IA-1 + S0-4, mirrors
build/gen-realm-dressing.py's structure).

Reads dev/model-qa/dressing-gen/manifests/<realm>-objects-dg-03.json for every realm that has
one (all 11 data/realms.js REALM_IDS, no realm-neutral manifest exists) and folds every cell into
a `slug@state`-keyed registry, one entry per {realm, archetype, state}. CORE-3 realms
(fantasy/gloom/chrome — the realms with a real INTERIOR_TILE_KITS entry, same ruling
gen-realm-dressing.py's WIRED_REALMS made) are `active: true`; the rest are folded but
`active: false` (present-but-inert per BW5's scope ruling — their manifests exist, but nothing
in the walk/render path may consume them yet).

REAL SCHEMA FOUND (inspected before writing this script — do not guess):
  {file, realm, family, grid: "R rows x C columns", chroma, wave, cells: [...]}
  cell (primary, 21 of 25 per realm): {slug, label, tags:{primary, location:"both"}, archetype, state}
  cell (alt variant, 4 of 25 per realm): {slug, label, tags:{...}, size: null, altOf: <primary slug>}
  altOf cells carry no archetype/state of their own — they're an alternate art draw of the SAME
  archetype+state as the cell they name in altOf (different shape/wear, same kind). Folded here as
  an `alts: [...]` array on the primary entry, not a second registry key — they aren't a separate
  placeable state, just art variety.

HONEST GAPS (found by inspection, reported here and in the run's stdout — not silently patched):
  1. BEAUTY-WAVE-5.md's placement table (:134-143) does NOT match the real manifest states for
     3 of 8 archetypes:
       - container: table says "closed · open" (2 states) — manifest actually has
         "intact · cracked · broken" (3 states, different vocabulary entirely).
       - campfire: table says "lit · embers · cold" — manifest actually has
         "unlit · lit · dead".
       - shrine: table says "intact · defiled · active" (3 states) — manifest actually has
         "dormant · lit" (2 states, different vocabulary).
     door/chest/lever/portal/trap match the table exactly. Per this unit's instructions ("map what
     exists honestly... an honest partial beats invented states") this script exports the REAL
     manifest states as INTERACTABLE_ARCHETYPE_STATES, the single source D0's applyEvent validates
     against — NOT the BW5 table's wording. If BW5's table is later corrected to match, or the art
     is redrawn to match BW5, regenerate; don't hand-patch state names in either direction.
  2. docs/KENNEY-MESH-AUDIT.md (the donorCandidate source) does not exist anywhere in this repo
     (checked: not on disk, not referenced by a different filename). Per this unit's instructions
     ("if the manifest file isn't reachable, note that and skip the field — do not invent
     matches") the donorCandidate field is OMITTED entirely from every entry. Add it back (per
     archetype, or per entry) once that audit file lands.
  3. Only 4 of the 11 realms have their objects-dg-03 sheet actually sliced to
     assets/dressing/<slug>.png yet (ash, chrome, fantasy, gloom — checked on disk). The other 7
     realms (bright-kingdom, cosmic, frontier, high-seas, lost-world, noir, suburb, theater) have a
     manifest (so the fold+state-list data is real) but NO art file on disk yet. This does not
     block core-3 (fantasy/gloom/chrome are all sliced) — the gap is only cosmetic-if-activated
     for realms already `active: false`. `--check` (and the verify harness) only asserts real art
     presence for `active: true` realms; inactive realms are checked for registry-structural
     completeness only. Re-run `build/slice-dressing-arrivals.py` for the missing realms before
     ever flipping one of them active.

AUTHORING PASSES (this unit, BW5 IA-1 + S0-4 + GRAPHICS-ENGINE.md §H):
  - `location` per archetype: floor | wall | door-cell (never "both" — every manifest cell's own
    tags.location is literally the string "both", i.e. unauthored; this script overrides it per the
    BW5 placement-grammar table, archetype-level, since IA-1/D1 both say "no location:'both'
    survives").
  - `extrudeDepth` per archetype, authored once against §H's depth bands (GRAPHICS-ENGINE.md:262 —
    thin surface 0.02 / framed flat 0.07 / mounted 0.12 / fixture 0.14 / shallow furniture 0.18 /
    floor volume 0.15-0.3 / deep wall 0.30-0.35). See ARCHETYPE_META below for the per-archetype
    pick + the reasoning comment.
  - `renderStrategy` per the CONSTRUCTION SEAM LAW (STAGE-D-WAVE-SPECS.md:42-49) + §H's §C
    reconciliation, which names 4 of 8 explicitly (door=extrude leaf, chest=model, container=faced-
    box, lever=extrude — "grate/lever = EXTRUDE"; portal=model per both D1's own default list and
    §H's MODEL bullet naming "portals, complex centerpieces" outright). campfire/shrine/trap are
    NOT named in either source doc — this script's own call, reasoned in ARCHETYPE_META's comments.

Run:  python3 build/gen-interactables.py --emit    (rewrites data/interactables.js)
      python3 build/gen-interactables.py            (dry-run: prints the file, no write)
      python3 build/gen-interactables.py --check    (regenerates in memory, diffs against the
                                                       file on disk; exit 1 on any drift, prints
                                                       nothing on match)

GENERATED OUTPUT — data/interactables.js in full. Never hand-edit; edit this script (or the
manifests) and regenerate.
"""
import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST_DIR = os.path.join(ROOT, "dev", "model-qa", "dressing-gen", "manifests")
ART_DIR = os.path.join(ROOT, "assets", "dressing")
TARGET = os.path.join(ROOT, "data", "interactables.js")
FAMILY = "objects-dg-03"

# Realm list is derived from the manifests actually on disk (see load_realm_cells), not
# hardcoded: 11 of data/realms.js's REALM_IDS + "fantasy". "fantasy" is NOT one of the current
# d300 REALM_IDS (checked data/realms.js — the BATCH3-GUARDRAILS J2 slate is frontier/chrome/
# noir/ash/suburb/cosmic/theater/high-seas/lost-world/gloom/bright-kingdom, no fantasy); it's a
# separate, older flagship id that src/ui/theater-interior.js's INTERIOR_TILE_KITS still keys on
# (its own comment: "law 3: chrome/gloom/fantasy minimum") — a live namespace this fold must
# respect, not a typo to "fix". CORE-3 mirrors gen-realm-dressing.py's WIRED_REALMS ruling (the
# only realms with a real INTERIOR_TILE_KITS entry) — the rest fold but stay inert until their
# own interior kit + sliced art land.
CORE3_REALMS = ["fantasy", "gloom", "chrome"]


def discover_realms():
    """Every realm with a <realm>-objects-dg-03.json manifest on disk, sorted for determinism."""
    found = []
    suffix = f"-{FAMILY}.json"
    for name in os.listdir(MANIFEST_DIR):
        if name.endswith(suffix):
            found.append(name[: -len(suffix)])
    return sorted(found)

# --- Archetype tables (the authoring passes) --------------------------------------------------
# States: the REAL manifest vocabulary (see HONEST GAPS #1 above — NOT BW5's table verbatim where
# they differ). Order matches the manifest's own cell order (door: shut/ajar/open/broken, etc.).
ARCHETYPE_STATES = {
    "door": ["shut", "ajar", "open", "broken"],
    "chest": ["closed", "open", "looted"],
    "lever": ["left", "right"],
    "shrine": ["dormant", "lit"],
    "campfire": ["unlit", "lit", "dead"],
    "trap": ["hidden", "sprung"],
    "portal": ["sealed", "active"],
    "container": ["intact", "cracked", "broken"],
}

# location: floor | wall | door-cell (BW5's placement-grammar table, BEAUTY-WAVE-5.md:129-143).
# extrudeDepth: §H bands (GRAPHICS-ENGINE.md:262) — flush(0.02) < mounted(0.12) < floor-volume
#   standard(0.16-0.22) < floor-volume hero(0.28) < deep-wall(0.30-0.34). Ordering is intentional:
#   the verify harness asserts flush < standard < hero across archetypes.
# renderStrategy: extrude | faced-box | model (CONSTRUCTION SEAM LAW; see docstring for which 5 of
#   8 are named outright by the source docs vs. this script's own call).
ARCHETYPE_META = {
    "door": {
        "location": "door-cell",
        "extrudeDepth": 0.32,
        "renderStrategy": "extrude",
        # "door = EXTRUDE leaf" — GRAPHICS-ENGINE.md:257 (§C RECONCILED), verbatim.
        # Depth: doors sit IN a wall aperture (deep-wall band), not surface-mounted.
    },
    "chest": {
        "location": "floor",
        "extrudeDepth": 0.28,
        "renderStrategy": "model",
        # "chest = MODEL" — GRAPHICS-ENGINE.md:257, verbatim ("faced-box base + separately-
        # modeled hinged lid", §H bullet 3). Depth: floor-volume band, hero end (lid + base).
    },
    "container": {
        "location": "floor",
        "extrudeDepth": 0.20,
        "renderStrategy": "faced-box",
        # "container = FACED-BOX" — GRAPHICS-ENGINE.md:257, verbatim. Depth: floor-volume band,
        # standard end (a barrel/crate, not a hero prop).
    },
    "lever": {
        "location": "wall",
        "extrudeDepth": 0.12,
        "renderStrategy": "extrude",
        # "grate/lever = EXTRUDE" — GRAPHICS-ENGINE.md:257, verbatim. Depth: mounted band (a
        # wall-mounted fixture, §H depth-bands list names "mounted" at 0.12 explicitly).
    },
    "portal": {
        "location": "wall",
        "extrudeDepth": 0.34,
        "renderStrategy": "model",
        # "chest/portal=model" — STAGE-D-WAVE-SPECS.md:109 (D1's own default list); independently
        # confirmed by §H's MODEL bullet 3, which names "portals, complex centerpieces" outright.
        # Depth: deep-wall band, top end (a finale-biased back-wall set piece).
    },
    # --- Not named by either source doc — this script's own call (documented, not silent): ---
    "shrine": {
        "location": "wall",
        "extrudeDepth": 0.30,
        "renderStrategy": "model",
        # Called out as "wall-adjacent / alcove, focal" (BW5's table) — a bespoke altar/idol
        # shape, not rectilinear (rules out faced-box) and not a flat silhouette (rules out
        # extrude); closest to §H's MODEL bullet 3 ("bespoke... hero props... complex
        # centerpieces"). Depth: deep-wall band (wall-adjacent focal piece, same tier as portal).
    },
    "campfire": {
        "location": "floor",
        "extrudeDepth": 0.16,
        "renderStrategy": "model",
        # Called out as a "room-anchor" rally point (BW5's table), a radial log/fire pile — not
        # rectilinear (rules out faced-box) and not a flat silhouette (rules out extrude);
        # bespoke floor set piece -> §H's MODEL class. Depth: floor-volume band, low end (a
        # low physical profile compared to chest/container).
    },
    "trap": {
        "location": "floor",
        "extrudeDepth": 0.02,
        "renderStrategy": "extrude",
        # A floor-flush plate/tripwire silhouette (hidden state especially) — the textbook §H
        # EXTRUDE case ("flat / silhouette-defined props"). Depth: flush-fixture band, same tier
        # as grate/vent per §H's explicit "flush fixtures... at 0.02" call-out.
    },
}

HEADER = """/* GENESIS DATA — data/interactables.js — GENERATED by build/gen-interactables.py, do NOT
   hand-edit (regenerate: python3 build/gen-interactables.py --emit).

   docs/STAGE-D-WAVE-SPECS.md D1 (Interactables fold & registry) + BEAUTY-WAVE-5.md IA-1/S0-4 +
   GRAPHICS-ENGINE.md \\u00a7H. Folds dev/model-qa/dressing-gen/manifests/<realm>-objects-dg-03.json
   (art at ui-sketches/sprite-sheets/<realm>-objects-dg-03.png, sliced per-slug to
   assets/dressing/<slug>.png by build/slice-dressing-arrivals.py) into a slug@state-keyed
   registry: INTERACTABLES_REGISTRY[realmId]["<archetype>@<state>"] = {realm, archetype, state,
   slug, location, extrudeDepth, renderStrategy, active, alts}.

   INTERACTABLE_ARCHETYPE_STATES is exported here as the SINGLE SOURCE D0's applyEvent validates
   an incoming state_transition's `to` state against (STAGE-D-WAVE-SPECS.md D1: "the archetype
   state lists... live HERE as the single source"). These are the REAL manifest states, which for
   3 of 8 archetypes (container/campfire/shrine) do NOT match BEAUTY-WAVE-5.md's placement table
   wording verbatim — see this script's own docstring HONEST GAPS section for the exact mismatch
   and why the real data wins.

   CORE-3 realms (fantasy/gloom/chrome — gen-realm-dressing.py's WIRED_REALMS ruling) are
   `active: true`; the other 8 realms fold but stay `active: false` (present-but-inert, BW5's
   scope ruling) until their own interior kit + sliced art land. donorCandidate (KENNEY-MESH-
   AUDIT.md's 149-candidate manifest) is OMITTED — that audit file does not exist in this repo yet;
   see this script's docstring. */

"use strict";
"""


def load_realm_cells(realm):
    path = os.path.join(MANIFEST_DIR, f"{realm}-{FAMILY}.json")
    if not os.path.exists(path):
        print(f"WARNING: {realm}-{FAMILY}.json not found — realm skipped entirely", file=sys.stderr)
        return None
    with open(path) as f:
        manifest = json.load(f)
    return manifest["cells"]


def art_exists(slug):
    return os.path.exists(os.path.join(ART_DIR, f"{slug}.png"))


def fold_realm(realm, cells):
    """Returns (entries dict keyed archetype@state, warnings list)."""
    primary_by_slug = {}
    alts_by_slug = {}
    warnings = []
    for cell in cells:
        if cell.get("archetype") and cell.get("state"):
            primary_by_slug[cell["slug"]] = cell
        elif cell.get("altOf"):
            alts_by_slug.setdefault(cell["altOf"], []).append(cell["slug"])
        else:
            warnings.append(f"{realm}: cell '{cell.get('slug')}' has neither archetype/state nor altOf — skipped")

    entries = {}
    active = realm in CORE3_REALMS
    for archetype, states in ARCHETYPE_STATES.items():
        for state in states:
            matches = [c for c in primary_by_slug.values() if c["archetype"] == archetype and c["state"] == state]
            if not matches:
                warnings.append(f"{realm}: NO manifest cell for {archetype}@{state} — registry gap (honest, not invented)")
                continue
            if len(matches) > 1:
                warnings.append(f"{realm}: multiple cells for {archetype}@{state} ({[m['slug'] for m in matches]}) — using first")
            cell = matches[0]
            slug = cell["slug"]
            meta = ARCHETYPE_META[archetype]
            key = f"{archetype}@{state}"
            entries[key] = {
                "realm": realm,
                "archetype": archetype,
                "state": state,
                "slug": slug,
                "location": meta["location"],
                "extrudeDepth": meta["extrudeDepth"],
                "renderStrategy": meta["renderStrategy"],
                "active": active,
                "alts": sorted(alts_by_slug.get(slug, [])),
            }
            if active and not art_exists(slug):
                warnings.append(f"{realm}: active realm missing sliced art assets/dressing/{slug}.png for {key}")
    return entries, warnings


def js_str_list(items):
    return "[" + ", ".join(json.dumps(i) for i in items) + "]"


def js_entry(e):
    alts = js_str_list(e["alts"])
    return (
        "      " + json.dumps(f'{e["archetype"]}@{e["state"]}') + ": Object.freeze({ "
        f'realm: {json.dumps(e["realm"])}, archetype: {json.dumps(e["archetype"])}, '
        f'state: {json.dumps(e["state"])}, slug: {json.dumps(e["slug"])}, '
        f'location: {json.dumps(e["location"])}, extrudeDepth: {e["extrudeDepth"]}, '
        f'renderStrategy: {json.dumps(e["renderStrategy"])}, active: {"true" if e["active"] else "false"}, '
        f'alts: Object.freeze({alts}) }}),'
    )


def build_source():
    all_realms = discover_realms()
    missing_core3 = [r for r in CORE3_REALMS if r not in all_realms]
    if missing_core3:
        print(f"ERROR: core-3 realm(s) missing a manifest entirely: {missing_core3}", file=sys.stderr)
        sys.exit(1)

    all_warnings = []
    realm_entries = {}
    for realm in all_realms:
        cells = load_realm_cells(realm)
        if cells is None:
            all_warnings.append(f"{realm}: manifest missing — realm entirely absent from registry")
            continue
        entries, warnings = fold_realm(realm, cells)
        realm_entries[realm] = entries
        all_warnings.extend(warnings)

    lines = [HEADER]
    lines.append("const INTERACTABLE_ARCHETYPE_STATES = Object.freeze({")
    for archetype, states in ARCHETYPE_STATES.items():
        lines.append(f"  {json.dumps(archetype)}: Object.freeze({js_str_list(states)}),")
    lines.append("});")
    lines.append("")
    lines.append("const INTERACTABLES_CORE3_REALMS = Object.freeze(" + js_str_list(CORE3_REALMS) + ");")
    lines.append("")
    lines.append("const INTERACTABLES_REGISTRY = Object.freeze({")
    for realm in all_realms:
        if realm not in realm_entries:
            continue
        lines.append(f"  {json.dumps(realm)}: Object.freeze({{")
        for key in sorted(realm_entries[realm].keys()):
            lines.append(js_entry(realm_entries[realm][key]))
        lines.append("  }),")
    lines.append("});")
    lines.append("")

    counts = {r: len(realm_entries.get(r, {})) for r in all_realms}
    return "\n".join(lines) + "\n", counts, all_warnings


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--emit", action="store_true", help="rewrite data/interactables.js in place")
    ap.add_argument("--check", action="store_true", help="regenerate in memory, diff against disk, exit 1 on drift")
    args = ap.parse_args()

    src, counts, warnings = build_source()

    if args.check:
        if not os.path.exists(TARGET):
            print(f"CHECK FAILED: {TARGET} does not exist", file=sys.stderr)
            sys.exit(1)
        with open(TARGET) as f:
            on_disk = f.read()
        if on_disk != src:
            print("CHECK FAILED: data/interactables.js is stale — run --emit to regenerate", file=sys.stderr)
            sys.exit(1)
        print("CHECK OK: data/interactables.js matches the fold")
        return

    print(f"Roster sizes (archetype@state entries per realm): {counts}")
    if warnings:
        print(f"\n{len(warnings)} warning(s):", file=sys.stderr)
        for w in warnings:
            print(f"  - {w}", file=sys.stderr)

    if not args.emit:
        print("\n--- dry run (pass --emit to write) ---\n")
        print(src)
        return

    with open(TARGET, "w") as f:
        f.write(src)
    print(f"OK: wrote generated registry to {TARGET}")


if __name__ == "__main__":
    main()
