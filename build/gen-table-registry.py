#!/usr/bin/env python3
"""build/gen-table-registry.py — regenerate table-registry.json + table-registry.md from
CURRENT compiled reality (WIRING-MAP.md §C hygiene: "regenerate table-registry.json/.md from
compiled reality (L7, long overdue — confirmed stale)"). Never hand-edit the two output files —
edit the Engine markdown source (which also drives compile-tables.py --emit), then re-run this.

Walks Engine/03. _Tables/**/*.md, reads each file's frontmatter (id/status) + first H1-ish table
header for its name, cross-references row counts against the COMPILED tables.json (the single
source of truth for "how many rows actually compiled"), and emits the same schema
table-registry.json/.md already carry (generated/source/counts/byCategory/tables[]).

Usage: python3 build/gen-table-registry.py --emit   (report-only without --emit, matching
compile-tables.py's own convention)
"""
import json, re, sys, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TABLES_DIR = ROOT / "Engine" / "03. _Tables"
TABLES_JSON = ROOT / "tables.json"

def read_frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    fm = {}
    if m:
        for line in m.group(1).split("\n"):
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip()
    return fm

def dice_of(die_str):
    if not die_str:
        return None
    m = re.match(r"^d?(\d+)$", die_str.strip(), re.I)
    return int(m.group(1)) if m else None

def main():
    emit = "--emit" in sys.argv
    tables_compiled = json.loads(TABLES_JSON.read_text())

    entries = []
    counts = {"active": 0, "archived": 0, "stub": 0}
    by_cat = {}

    md_files = sorted(TABLES_DIR.rglob("*.md"))
    for f in md_files:
        text = f.read_text(encoding="utf-8", errors="replace")
        fm = read_frontmatter(text)
        tid = fm.get("id")
        status_raw = fm.get("status", "")
        # normalize to the registry's 3-way status vocabulary
        if "archiv" in status_raw or "zz_Archive" in str(f) or "Archive" in str(f):
            status = "archive"
        elif status_raw == "stub" or "_Stubs" in str(f):
            status = "stub"
        else:
            status = "active"
        counts[status] = counts.get(status, 0) + 1

        rel = f.relative_to(ROOT)
        parts = rel.parts  # ('Engine','03. _Tables', category, sub?, file.md)
        category = parts[2] if len(parts) > 2 else "Unsorted"
        sub = parts[3] if len(parts) > 4 else None

        compiled = tables_compiled.get(tid) if tid else None
        rows = len(compiled["rows"]) if compiled else 0
        die = dice_of(compiled["dice"]) if compiled else None

        entries.append({
            "name": f.stem,
            "category": category,
            **({"sub": sub} if sub else {}),
            "die": die,
            "rows": rows,
            "status": status,
            "path": str(rel).replace("\\", "/"),
        })
        if status == "active":
            by_cat[category] = by_cat.get(category, 0) + 1

    active_rows = sum(e["rows"] for e in entries if e["status"] == "active")
    out = {
        "generated": datetime.date.today().isoformat(),
        "source": "Engine/03. _Tables  (Genesis-owned clean engine)",
        "counts": {
            "files": len(entries),
            "active": counts.get("active", 0),
            "archived": counts.get("archive", 0),
            "stub": counts.get("stub", 0),
            "activeRows": active_rows,
        },
        "byCategory": by_cat,
        "tables": entries,
    }

    print(f"REPORT — files: {out['counts']['files']} | active: {out['counts']['active']} "
          f"| archived: {out['counts']['archived']} | stub: {out['counts']['stub']} "
          f"| activeRows: {out['counts']['activeRows']}")

    if not emit:
        return

    (ROOT / "table-registry.json").write_text(json.dumps(out, indent=1) + "\n", encoding="utf-8")

    # markdown rendering — grouped by category > sub, active tables only (matches the existing file's shape)
    lines = ["# Genesis Engine — Table Registry (regenerated)", "",
             f"*Auto-generated {out['generated']} off the clean Genesis engine (`Engine/03. _Tables`).*", "",
             f"**Active:** {out['counts']['active']} tables / {out['counts']['activeRows']:,} rows "
             f"· **Archived:** {out['counts']['archived']} · **Stubbed (empty, to fill):** {out['counts']['stub']}",
             ""]
    active = [e for e in entries if e["status"] == "active"]
    cats = sorted(set(e["category"] for e in active))
    for cat in cats:
        cat_entries = [e for e in active if e["category"] == cat]
        lines.append(f"\n## {cat} — {len(cat_entries)} active\n")
        subs = sorted(set(e.get("sub") or "" for e in cat_entries))
        for sub in subs:
            sub_entries = sorted([e for e in cat_entries if (e.get("sub") or "") == sub], key=lambda e: e["name"])
            if sub:
                lines.append(f"\n**{sub}**\n")
            for e in sub_entries:
                die_label = f"d{e['die']}" if e["die"] else "?"
                lines.append(f"- {e['name']} ({die_label}, {e['rows']} rows)")
    (ROOT / "table-registry.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("emitted table-registry.json + table-registry.md")

if __name__ == "__main__":
    main()
