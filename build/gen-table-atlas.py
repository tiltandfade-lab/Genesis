#!/usr/bin/env python3
"""build/gen-table-atlas.py — docs/TABLE-ATLAS.md unit U2: pre-join table-registry.json +
tables.json (+ data/table-usage.js, if present) into data/table-atlas.js (owns TABLE_ATLAS_DATA),
the per-table record the Table Atlas Reference-Shelf app renders.

Never hand-edit data/table-atlas.js — regenerate with this script after any registry/compile change.

The id join (docs/TABLE-ATLAS.md "The id join"): table-registry.json rows carry no `id` field.
This script derives the registry->compiled id EXACTLY the way compile-tables.py itself does (and
the way build/gen-table-usage-audit.py already does it) by importing compile-tables.py's own
internals — it does not re-implement slugification.

Usage: python3 build/gen-table-atlas.py
"""
import collections
import glob
import importlib.util
import io
import json
import os
import re
import sys
import contextlib

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)  # …/Genesis

# ---- import compile-tables.py internals (same pattern as gen-table-usage-audit.py) ----
_spec = importlib.util.spec_from_file_location(
    "ct", os.path.join(BASE, "Engine", "00. _System", "compile-tables.py")
)
ct = importlib.util.module_from_spec(_spec)
_argv = sys.argv
sys.argv = ["x"]  # avoid --emit triggering a write from inside the imported module
with contextlib.redirect_stdout(io.StringIO()):
    _spec.loader.exec_module(ct)
sys.argv = _argv

REGISTRY_PATH = os.path.join(BASE, "table-registry.json")
TABLES_JSON_PATH = os.path.join(BASE, "tables.json")
TABLE_USAGE_PATH = os.path.join(BASE, "data", "table-usage.js")
OUT_PATH = os.path.join(BASE, "data", "table-atlas.js")

CANONICAL_BANDS = ("Grounded", "Textured", "Strange", "Volatile", "Mythic")


def registry_id_for(path):
    """Derive the compiled table id for a table-registry.json row's `path`, using the compiler's
    OWN id derivation (fm['id'] for type:table; slugify(hint_id(context) or fm['id']) for
    type:table-set) — never re-implemented. Returns [] if the file can't be read/parsed, is an
    Archive/zz_ snapshot (compile-tables.py itself excludes these from tables.json — see its own
    `files=` glob filter — so a snapshot's id would otherwise falsely collide with its live
    counterpart's compiled id; verified 2026-07-07: 13 zz_Archive registry rows collide with a
    live table's id without this guard), or a LIST of ids for table-set files (one file can hold
    multiple sub-tables)."""
    if "/Archive" in path or "/zz_" in path:
        return []
    try:
        text = open(path, encoding="utf-8").read()
    except (FileNotFoundError, OSError):
        return []
    fm, body = ct.fm_and_body(text)
    if fm.get("type") not in ("table", "table-set"):
        return []
    out = []
    for context, rows in ct.split_blocks(body.splitlines()):
        parsed, info = ct.parse_block(context, rows)
        if info is None:
            continue
        if fm["type"] == "table":
            tid = fm["id"]
        else:
            tid = re.sub(r"[^a-z0-9]+", "-", (ct.hint_id(context) or fm["id"]).lower()).strip("-")
        out.append(tid)
    return out


def band_of(row):
    """docs/TABLE-ATLAS.md §Data sources item 2 — the canonical bandOf(row) derivation.
    Returns a list of band names this row counts toward (usually 0 or 1 entry; exactly 2 for the
    rare split-band cells like 'Strange-Volatile'). Never guesses — an un-banded row returns []."""
    band_field = row[2] if len(row) > 2 else ""
    if band_field:
        # split-band cells use an en/em dash or hyphen between two canonical names
        parts = re.split(r"[–—-]", band_field)
        parts = [p.strip() for p in parts if p.strip()]
        canon = [p for p in parts if p in CANONICAL_BANDS]
        if canon:
            return canon
        return ["__other__"]  # a Band-header value that isn't one of the 5 canonical names
    # no Band header value — fall back to the un-headered spice-table case: row[5][0]
    cells = row[5] if len(row) > 5 else None
    if cells and isinstance(cells, list) and cells:
        first = cells[0]
        if first in CANONICAL_BANDS:
            return [first]
    return []  # genuinely un-banded


def bands_histogram(rows):
    hist = {b: 0 for b in CANONICAL_BANDS}
    other = 0
    unbanded = 0
    for row in rows:
        bands = band_of(row)
        if not bands:
            unbanded += 1
        elif bands == ["__other__"]:
            other += 1
        else:
            for b in bands:
                hist[b] += 1
    hist["other"] = other
    hist["unbanded"] = unbanded
    return hist


def load_table_usage():
    if not os.path.isfile(TABLE_USAGE_PATH):
        return {}
    text = open(TABLE_USAGE_PATH, encoding="utf-8").read()
    m = re.search(r"const TABLE_USAGE\s*=\s*(\{.*\});\s*$", text, re.S)
    if not m:
        return {}
    return json.loads(m.group(1))


def main():
    registry = json.load(open(REGISTRY_PATH, encoding="utf-8"))
    tables_json = json.load(open(TABLES_JSON_PATH, encoding="utf-8"))
    compiled_keys = {
        k for k, v in tables_json.items() if isinstance(v, dict) and "rows" in v
    }
    table_usage = load_table_usage()

    atlas = {}
    unresolved = []

    for entry in registry.get("tables", []):
        path = entry.get("path")
        candidate_ids = registry_id_for(path) if path else []
        resolved_id = None
        for cid in candidate_ids:
            if cid in compiled_keys:
                resolved_id = cid
                break
        if resolved_id is None:
            # never silently drop a registry row (docs/TABLE-ATLAS.md edge case 2)
            fallback_id = candidate_ids[0] if candidate_ids else (
                re.sub(r"[^a-z0-9]+", "-", entry.get("name", "unknown").lower()).strip("-")
            )
            atlas[fallback_id] = {
                "id": fallback_id,
                "name": entry.get("name"),
                "category": entry.get("category"),
                "sub": entry.get("sub"),
                "die": entry.get("die"),
                "rows": entry.get("rows"),
                "status": entry.get("status"),
                "path": path,
                "domain": None,
                "tableClass": None,
                "playerFacing": None,
                "bands": {b: 0 for b in CANONICAL_BANDS} | {"other": 0, "unbanded": 0},
                "wiring": "UNMAPPED",
                "consumers": {"code": [], "procedure": [], "chain": []},
            }
            unresolved.append(fallback_id)
            continue

        meta = tables_json[resolved_id]
        usage = table_usage.get(resolved_id, {})
        atlas[resolved_id] = {
            "id": resolved_id,
            "name": entry.get("name"),
            "category": entry.get("category"),
            "sub": entry.get("sub"),
            "die": entry.get("die"),
            "rows": entry.get("rows"),
            "status": entry.get("status"),
            "path": path,
            "domain": meta.get("domain"),
            "tableClass": meta.get("class"),
            "playerFacing": meta.get("player_facing"),
            "bands": bands_histogram(meta.get("rows", [])),
            "wiring": usage.get("cls", "UNMAPPED"),
            "consumers": usage.get("consumers", {"code": [], "procedure": [], "chain": []}),
        }

    # edge case 3: a table in tables.json but not in the registry — surface it under "Unsorted",
    # never hidden.
    registry_resolved_ids = set(atlas.keys())
    for tid in sorted(compiled_keys - registry_resolved_ids):
        meta = tables_json[tid]
        usage = table_usage.get(tid, {})
        atlas[tid] = {
            "id": tid,
            "name": tid,
            "category": "Unsorted",
            "sub": None,
            "die": meta.get("die"),
            "rows": len(meta.get("rows", [])),
            "status": "active",
            "path": None,
            "domain": meta.get("domain"),
            "tableClass": meta.get("class"),
            "playerFacing": meta.get("player_facing"),
            "bands": bands_histogram(meta.get("rows", [])),
            "wiring": usage.get("cls", "UNMAPPED"),
            "consumers": usage.get("consumers", {"code": [], "procedure": [], "chain": []}),
        }

    lines = [
        "/* GENERATED — do not hand-edit. Regenerate: python3 build/gen-table-atlas.py",
        "   Source: table-registry.json + tables.json + data/table-usage.js (if present).",
        "   Owns TABLE_ATLAS_DATA: docs/TABLE-ATLAS.md §\"TABLE_ATLAS_DATA per-table record shape\".",
        "   rollCount is intentionally NOT baked in here — the app looks it up live from",
        "   ROLL_COUNTS[id] at render time so counts stay current without a regen. */",
        "const TABLE_ATLAS_DATA = " + json.dumps(atlas, indent=2, sort_keys=True, ensure_ascii=False) + ";",
        "",
    ]
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"wrote data/table-atlas.js ({len(atlas)} entries)")
    active_count = registry.get("counts", {}).get("active")
    print(f"registry active-table count: {active_count}")
    if unresolved:
        print(f"UNMAPPED (id failed to resolve): {len(unresolved)} — {unresolved[:8]}")


if __name__ == "__main__":
    main()
