#!/usr/bin/env python3
"""Genesis build — generate the v2 sprite-sheet manifest from dev/model-qa/sprite-sheets/*.md.

docs/SPRITE-TRANSITION.md T2. Companion to the original build/gen-sprite-manifests.py (which
plans sheets FROM data/bestiary.js for the retired 6x6/500-creature run) — this generator instead
PARSES the already-hand-authored ChatGPT batch-prompt files at dev/model-qa/sprite-sheets/*.md
(one file per realm, each a mix of Monster/NPC/Domestic animal/Wild animal/Dungeon animal/Kid/PC/
Expansion sections, 25-per-sheet in general, PC combos 25-per-sheet too, expansion sheets sized
to whatever the roster needed). Those files are the source of truth for THIS batch of art (they
already encode the exact per-cell name + pose cue Adam is pasting into ImageGen); this script's
only job is to turn them into one structured JSON contract the slicer + registry generator can
read mechanically, instead of everyone re-parsing markdown by eye.

Output: dev/sprite-manifests/v2-manifest.json — GENERATED, same discipline as tables.json: never
hand-edit, re-run this script after any dev/model-qa/sprite-sheets/*.md edit.

Shape (docs/SPRITE-TRANSITION.md "Shared data shapes"):
  { "sheets": [ { "id": "gloom-monsters-1", "realm": "gloom", "kind": "monster",
      "sourceFile": "dev/model-qa/sprite-sheets/gloom.md", "sourceSection": "Monster sheet 1/5",
      "expected": 25,
      "cells": [ { "n": 1, "name": "Grinning Poppet", "slug": "spr-gloom-grinning-poppet",
                   "cue": "..." } ] } ] }

Parsing rules:
  - One file per realm under dev/model-qa/sprite-sheets/, EXCEPT INDEX.md (a plain doc index,
    not a batch-prompt file — skipped).
  - realm = the filename stem, EXCEPT pc-characters.md -> realm "pc" (per spec).
  - A batch section is any `### <Kind> sheet <seq>` heading (`<Kind>` in Monster / NPC /
    Domestic animal / Wild animal / Dungeon animal / Kid / PC / Expansion; `<seq>` either
    "N/M" or "E<n>" — anything else after the seq token, e.g. a "(5x5 grid, 25 cells)" aside or
    an approval-pass note, is part of the heading text but not parsed further). The section body
    runs to the next `###`/`##` heading or EOF.
  - Cells are numbered-list lines `N. **bold**[ (—|--) cue]`: the bold span is the cell's
    `name` (some sections, e.g. the "diversity roster" NPC tail lines, fold the whole
    "role — flavor" phrase INSIDE the bold span with nothing after it — that's fine, the bold
    span is still the name, `cue` is just empty for those cells). Any text before the first
    numbered-list line, or after the last one before the next heading, is prose (style blocks /
    notes) and is skipped, not parsed as a cell.
  - Numbering must start at 1 with no gaps within a section -- fail loud otherwise (a renumber
    slip is exactly the kind of drift a human eyeballing a 25-item list would miss).
  - A section with zero cells is a fail-loud error (empty sheet).
  - slug = f"spr-{realm}-{kebab(name)}" (kebab: lowercase, diacritics stripped, everything
    that isn't [a-z0-9] collapsed to a single "-", no leading/trailing "-"). Slug collisions
    ACROSS THE WHOLE RUN fail loud (two cells resolving to the same slug would otherwise
    silently clobber one sprite file at slice time) -- both cell locations are reported, and the
    manifest is NOT written (a partial/wrong manifest is worse than none — Adam resolves the
    naming clash in the source .md and re-runs).

Run: python3 build/gen-sprite-sheet-manifests.py
Exit 0 + the file written on success; exit 1 with a stderr diagnosis on any parse-integrity
failure (empty sheet, numbering gap, unrecognized kind heading, slug collision). Parse totals
(sheets/cells per realm) print to stdout either way, so a collision failure still tells you how
much of the corpus is otherwise clean.
"""
import json
import os
import re
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "dev", "model-qa", "sprite-sheets")
OUT_DIR = os.path.join(ROOT, "dev", "sprite-manifests")
OUT_PATH = os.path.join(OUT_DIR, "v2-manifest.json")

SKIP_FILES = {"INDEX.md"}

# filename stem -> realm override (spec: "pc-characters.md -> realm pc; fantasy.md -> realm
# fantasy" -- fantasy needs no override, only pc-characters does).
REALM_OVERRIDE = {
    "pc-characters": "pc",
}

# heading "### <Kind words> sheet <seq>..." -> kind enum value + its plural (for the sheet id).
KIND_MAP = {
    "monster": ("monster", "monsters"),
    "npc": ("npc", "npcs"),
    "domestic animal": ("domestic-animal", "domestic-animals"),
    "wild animal": ("wild-animal", "wild-animals"),
    "dungeon animal": ("dungeon-animal", "dungeon-animals"),
    "kid": ("kid", "kids"),
    "pc": ("pc", "pcs"),
    "expansion": ("expansion", "expansions"),
}

HEADING_RE = re.compile(r'^###\s+(.*?)\s+sheet\s+(\S+)', re.IGNORECASE)
# `N. **name**` optionally followed by ` — cue` / ` -- cue` (both separators appear in the
# corpus -- gloom.md etc. use an em dash, pc-characters.md uses a double-hyphen).
CELL_RE = re.compile(r'^(\d+)\.\s+\*\*(.+?)\*\*\s*(?:—|--)?\s*(.*)$')


class ParseError(Exception):
    pass


def kebab(name):
    """lowercase, strip diacritics, collapse anything non [a-z0-9] into single hyphens,
    trim leading/trailing hyphens."""
    normalized = unicodedata.normalize("NFKD", name)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    lowered = ascii_only.lower()
    collapsed = re.sub(r'[^a-z0-9]+', '-', lowered)
    return collapsed.strip('-')


def seq_token(raw):
    """'1/5' -> '1'; 'E1' / 'e1' -> 'e1'; anything else -> a slug-safe lowercase token."""
    m = re.match(r'^(\d+)/\d+$', raw)
    if m:
        return m.group(1)
    m = re.match(r'^[Ee](\d+)$', raw)
    if m:
        return f"e{m.group(1)}"
    return re.sub(r'[^a-z0-9]+', '-', raw.lower()).strip('-')


def parse_file(path, realm):
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()

    # Locate every heading line + its body span (next heading or EOF).
    heading_idxs = [i for i, l in enumerate(lines) if l.startswith("### ") or l.startswith("## ")]
    sheets = []
    rel_path = os.path.relpath(path, ROOT)

    for pos, idx in enumerate(heading_idxs):
        line = lines[idx]
        if not line.startswith("### "):
            continue  # a "## X batches (...)" section-summary line, not a sheet heading
        m = HEADING_RE.match(line.strip())
        if not m:
            raise ParseError(f"{rel_path}:{idx+1}: unrecognized sheet heading shape: {line.strip()!r}")
        kind_words = m.group(1).strip().lower()
        if kind_words not in KIND_MAP:
            raise ParseError(
                f"{rel_path}:{idx+1}: unrecognized sheet kind {m.group(1)!r} "
                f"(known: {sorted(KIND_MAP)})"
            )
        kind, kind_plural = KIND_MAP[kind_words]
        seq = seq_token(m.group(2))
        section_end = heading_idxs[pos + 1] if pos + 1 < len(heading_idxs) else len(lines)
        body = lines[idx + 1:section_end]

        cells = []
        expected_n = 0
        for bl_idx, bline in enumerate(body):
            stripped = bline.strip()
            if not stripped:
                continue
            cm = CELL_RE.match(stripped)
            if not cm:
                continue  # prose line (style block / note) -- not a numbered cell
            n = int(cm.group(1))
            name = cm.group(2).strip()
            cue = cm.group(3).strip()
            expected_n += 1
            if n != expected_n:
                raise ParseError(
                    f"{rel_path}:{idx+1+bl_idx+1}: numbered list gap/out-of-order in "
                    f"'{line.strip()}' -- expected cell {expected_n}, found {n}"
                )
            cells.append({"n": n, "name": name, "slug": None, "cue": cue})

        if not cells:
            raise ParseError(f"{rel_path}:{idx+1}: empty sheet -- '{line.strip()}' has no numbered cells")

        sheet_id = f"{realm}-{kind_plural}-{seq}"
        for cell in cells:
            cell["slug"] = f"spr-{realm}-{kebab(cell['name'])}"

        sheets.append({
            "id": sheet_id,
            "realm": realm,
            "kind": kind,
            "sourceFile": rel_path,
            "sourceSection": line.strip()[4:],  # strip the leading "### "
            "expected": len(cells),
            "cells": cells,
        })
    return sheets


def check_collisions(all_sheets):
    seen = {}
    collisions = []
    for sheet in all_sheets:
        for cell in sheet["cells"]:
            slug = cell["slug"]
            loc = f"{sheet['id']}#{cell['n']} ({cell['name']!r})"
            if slug in seen:
                collisions.append((slug, seen[slug], loc))
            else:
                seen[slug] = loc
    return collisions


def main():
    if not os.path.isdir(SRC_DIR):
        print(f"ERROR: source dir not found: {SRC_DIR}", file=sys.stderr)
        sys.exit(1)

    files = sorted(f for f in os.listdir(SRC_DIR) if f.endswith(".md") and f not in SKIP_FILES)
    if not files:
        print(f"ERROR: no .md files found in {SRC_DIR}", file=sys.stderr)
        sys.exit(1)

    all_sheets = []
    try:
        for fname in files:
            stem = fname[:-3]
            realm = REALM_OVERRIDE.get(stem, stem)
            path = os.path.join(SRC_DIR, fname)
            sheets = parse_file(path, realm)
            all_sheets.extend(sheets)
    except ParseError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)

    # Report parse totals regardless of what the collision check below finds — a collision
    # failure is a content-integrity problem, not a parse failure, and Adam still wants to see
    # how much of the corpus parsed cleanly to judge the blast radius.
    total_cells = sum(len(s["cells"]) for s in all_sheets)
    by_realm = {}
    for s in all_sheets:
        by_realm.setdefault(s["realm"], {"sheets": 0, "cells": 0})
        by_realm[s["realm"]]["sheets"] += 1
        by_realm[s["realm"]]["cells"] += len(s["cells"])
    print(f"Parsed {len(all_sheets)} sheets / {total_cells} cells from {len(files)} source files")
    for realm in sorted(by_realm):
        stats = by_realm[realm]
        print(f"  {realm}: {stats['sheets']} sheets, {stats['cells']} cells")

    collisions = check_collisions(all_sheets)
    if collisions:
        print(
            f"ERROR: {len(collisions)} slug collision(s) detected -- two cells resolved to the "
            "same slug (manifest NOT written; fix the source .md naming clash and re-run):",
            file=sys.stderr,
        )
        for slug, first_loc, second_loc in collisions:
            print(f"  {slug}: first seen at {first_loc}, collides with {second_loc}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = {
        "_generated_by": "build/gen-sprite-sheet-manifests.py",
        "_source": "dev/model-qa/sprite-sheets/*.md",
        "_note": "GENERATED — do not hand-edit; re-run the generator.",
        "sheets": all_sheets,
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Wrote {len(all_sheets)} sheets / {total_cells} cells to {os.path.relpath(OUT_PATH, ROOT)}")


if __name__ == "__main__":
    main()
