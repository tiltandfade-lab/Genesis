#!/usr/bin/env python3
"""Corpus Intensity Map — the navigation surface for the re-authoring sweep.

Reads the compiled tables.json and scores EVERY table for the two axes Adam cares about:
  - QUALITY FLOOR: copy-paste inflation (fake-large tables), ungraded rows.
  - EXPLOSIVE CEILING: does the table reach its permitted spice ceiling, or is it flat?

Emits docs/CORPUS-INTENSITY-MAP.md. Deterministic; re-run after any table edit:
    python3 build/corpus-intensity-map.py
"""
import json, os, re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TABLES = os.path.join(ROOT, "tables.json")
OUT = os.path.join(ROOT, "docs", "CORPUS-INTENSITY-MAP.md")

BANDS = ["Grounded", "Textured", "Strange", "Volatile", "Mythic"]
BAND_IX = {b: i for i, b in enumerate(BANDS)}
CEILING = {"Spark": 1, "Fork": 2, "Commitment": 4}  # max band a class may legitimately place

def kind_of(slug, domain):
    s = slug.lower()
    if re.search(r"names?$", s) or s.endswith("-names") or "name" in s and "megatable" in s:
        return "NAMES"
    if any(k in s for k in ["dungeon-loot", "furnishing", "utensil", "clothing", "trinket",
                            "odors", "air-current", "general-features", "general-description",
                            "religious-articles", "container-contents", "personal-items"]):
        return "CATALOG"
    if any(k in s for k in ["composition", "encounter-type", "threat-profile", "topology",
                            "area-type", "district-type", "door-state", "door-type", "exit-state",
                            "secret-payoff-size", "secret-reveal-type", "reinforcements", "footing",
                            "scene-frame", "approach", "waypoint", "hub", "path", "lead", "inner",
                            "surface", "threshold", "opening", "excursion", "escalation",
                            "loot-composition", "loot-empty", "empty-result", "route-type",
                            "biome-type", "destination-type", "event-type"]):
        return "MECHANICAL"
    return "CONTENT"

def score(slug, t):
    rows = t.get("rows") or []
    n = len(rows)
    cls = t.get("class") or "?"
    ceil = CEILING.get(cls)
    bands = [str(r[2]).strip() if len(r) > 2 and r[2] else "" for r in rows]
    texts = [str(r[3]).strip() if len(r) > 3 and r[3] is not None else "" for r in rows]
    graded = [b for b in bands if b in BAND_IX]
    counts = [sum(1 for b in bands if b == B) for B in BANDS]
    ungraded = sum(1 for b in bands if b not in BAND_IX)
    top = max((BAND_IX[b] for b in graded), default=-1)
    distinct = len(set(texts)) if texts else 0
    distinct_frac = (distinct / n) if n else 0
    kind = kind_of(slug, t.get("domain", ""))

    flags = []
    # FLAT: a CONTENT table that never reaches its class ceiling (has explosive headroom).
    if kind == "CONTENT" and ceil is not None and graded and top < ceil:
        flags.append("FLAT")        # ← the core explosive-pass target
    # NOCEIL: graded but top band is only Grounded/Textured regardless of class.
    if kind == "CONTENT" and graded and top <= 1 and (ceil is None or ceil > 1):
        if "FLAT" not in flags:
            flags.append("FLAT")
    # UNGRADED: mostly missing band column — can't even judge spice.
    if kind == "CONTENT" and n and (ungraded / n) > 0.5:
        flags.append("UNGRADED")
    # DUPED: copy-paste-inflated fake-large table (structural, not flavor).
    if n >= 12 and distinct_frac < 0.6:
        flags.append("DUPED")
    # THIN: small die in a CONTENT domain that usually wants more range.
    if kind == "CONTENT" and n <= 20:
        flags.append("THIN")
    # BAR: a reaches-ceiling, graded, distinct CONTENT table — a study exemplar.
    if (kind == "CONTENT" and ceil is not None and top >= ceil
            and distinct_frac > 0.9 and not any(f in flags for f in ("FLAT", "UNGRADED", "DUPED"))):
        flags.append("★BAR")

    return {
        "slug": slug, "kind": kind, "die": t.get("die"), "n": n, "cls": cls, "ceil": ceil,
        "top": top, "counts": counts, "ungraded": ungraded, "distinct_frac": distinct_frac,
        "vc": bool(t.get("voice_critical")), "pf": t.get("player_facing"),
        "domain": t.get("domain", "?"), "flags": flags,
    }

def band_label(ix):
    return BANDS[ix] if ix >= 0 else "—"

def main():
    d = json.load(open(TABLES))
    scored = [score(k, v) for k, v in d.items()]
    by_domain = defaultdict(list)
    for s in scored:
        by_domain[s["domain"]].append(s)

    # priority within a domain: CONTENT first, then voice_critical, then FLAT/UNGRADED, then name
    def pri(s):
        return (
            0 if s["kind"] == "CONTENT" else 1,
            0 if s["vc"] else 1,
            0 if ("FLAT" in s["flags"] or "UNGRADED" in s["flags"]) else 1,
            s["slug"],
        )

    total = len(scored)
    kinds = defaultdict(int)
    flagct = defaultdict(int)
    for s in scored:
        kinds[s["kind"]] += 1
        for f in s["flags"]:
            flagct[f] += 1

    L = []
    L.append("---")
    L.append("type: generated-map")
    L.append("status: regenerate-after-table-edits")
    L.append("generator: build/corpus-intensity-map.py")
    L.append("---\n")
    L.append("# Genesis — Corpus Intensity Map")
    L.append("\n*Generated from `tables.json` by `build/corpus-intensity-map.py`. The navigation surface "
             "for the re-authoring sweep: every table scored on the two axes — does it reach its spice "
             "**ceiling** (explosive headroom), and is its **floor** clean (no copy-paste / ungraded rows). "
             "Re-run after edits. Read alongside `REAUTHORING-RUBRIC.md` (the standard) and "
             "`REAUTHORING-SWEEP-PLAN.md` (the prep/wiring).*\n")

    L.append("## Legend\n")
    L.append("- **Kind** — `CONTENT` = flavor table (the explosive-pass targets) · `MECHANICAL` = "
             "router/dispatcher · `CATALOG` = loot/furnishing lookups · `NAMES` = name banks.")
    L.append("- **class→ceiling** — Spark→Textured · Fork→Strange · Commitment→Mythic. The ceiling is the "
             "highest band the table may *legitimately* place.")
    L.append("- **top** — the highest band actually present in the rows. If `top` < ceiling, the table has "
             "**unused explosive headroom**.")
    L.append("- **bands** — row counts `G/T/S/V/M` (+ `u`=ungraded rows lacking a band).")
    L.append("- **bands G/T/S/V/M** — row-LAYOUT shares (authoring coverage). Play distribution is "
             "tier-weighted band-first rolling per docs/SPICE-RAISE.md.")
    L.append("- **dist%** — distinct row-text fraction; low = copy-paste-inflated (a fake-large table).")
    L.append("- **vc** — `voice_critical` (feeds the player-facing Fragment directly).")
    L.append("- **Flags** — `FLAT` never reaches its ceiling (the prime explosive target) · `UNGRADED` no "
             "band column · `DUPED` copy-paste-inflated · `THIN` ≤20 rows · `★BAR` already at the bar "
             "(study these for *what makes them great*).\n")

    L.append("## Summary\n")
    L.append(f"- **{total} tables.** Kinds: " +
             " · ".join(f"{k} {kinds[k]}" for k in ("CONTENT", "MECHANICAL", "CATALOG", "NAMES") if kinds[k]))
    L.append(f"- **Flag counts (CONTENT-weighted):** ★BAR {flagct['★BAR']} · FLAT {flagct['FLAT']} · "
             f"UNGRADED {flagct['UNGRADED']} · DUPED {flagct['DUPED']} · THIN {flagct['THIN']}")
    content = [s for s in scored if s["kind"] == "CONTENT"]
    reach = sum(1 for s in content if s["ceil"] is not None and s["top"] >= s["ceil"])
    graded_content = [s for s in content if (s["counts"][0]+s["counts"][1]+s["counts"][2]+s["counts"][3]+s["counts"][4]) > 0 and (s["ungraded"]/max(s["n"],1)) <= 0.5]
    ungraded_content = len(content) - len(graded_content)
    L.append(f"- **Explosive-ceiling health (the heart of the sweep):** of {len(content)} CONTENT tables — "
             f"**{flagct['★BAR']} are graded AND already at their ceiling (the ★BAR study set: read these for "
             f"*what makes them great*)**; ~{len(graded_content)-reach if len(graded_content)>=reach else 0} are "
             f"graded but FLAT (reach below ceiling); and **{ungraded_content} are UNGRADED — no band column at "
             f"all, so spice is unrecorded.** The ungraded set is the bulk of the work: each needs an honest band "
             "grade PLUS an authored explosive tail where its class permits. (FLAT is rare only because most "
             "tables were never graded in the first place — UNGRADED *is* the latent FLAT population.)")
    L.append(f"- **Structural floor problems:** {flagct['DUPED']} DUPED (copy-paste-inflated fake-large "
             f"tables — a die-collapse, not authoring) · {flagct['THIN']} THIN (≤20 rows).\n")

    L.append("## Tables by domain\n")
    for dom in sorted(by_domain):
        items = sorted(by_domain[dom], key=pri)
        L.append(f"### {dom}\n")
        L.append("| table | kind | die | rows | class→ceiling | top | bands G/T/S/V/M (u) | dist% | vc | flags |")
        L.append("|---|---|---|---|---|---|---|---|---|---|")
        for s in items:
            cls_ceil = f"{s['cls']}→{band_label(s['ceil']) if s['ceil'] is not None else '?'}"
            c = s["counts"]
            bandstr = f"{c[0]}/{c[1]}/{c[2]}/{c[3]}/{c[4]}" + (f" (u{s['ungraded']})" if s["ungraded"] else "")
            fl = " ".join(s["flags"])
            vc = "✓" if s["vc"] else ""
            L.append(f"| `{s['slug']}` | {s['kind']} | {s['die']} | {s['n']} | {cls_ceil} | "
                     f"{band_label(s['top'])} | {bandstr} | {int(s['distinct_frac']*100)}% | {vc} | {fl} |")
        L.append("")

    open(OUT, "w").write("\n".join(L))
    print(f"Wrote {OUT}")
    print(f"{total} tables · CONTENT {kinds['CONTENT']} · FLAT {flagct['FLAT']} · "
          f"UNGRADED {flagct['UNGRADED']} · DUPED {flagct['DUPED']} · ★BAR {flagct['★BAR']}")

if __name__ == "__main__":
    main()
