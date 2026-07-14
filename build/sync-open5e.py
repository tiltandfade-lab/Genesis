#!/usr/bin/env python3
"""Genesis build — Open5e `srd-2024` cross-check VALIDATOR (read-only).

Despite the module name (mirrors the wave-spec unit name, W0-c), this script is a
validator/reporter, NEVER a writer. It cross-checks the hand-curated
`Reference/SRD-Data/spells.json` (the file `build/gen-spells.py:26` reads as its source of truth)
against Open5e's `srd-2024` document (CC-BY-4.0), filtering STRICTLY to
`document.key == "srd-2024"`.

It NEVER writes to Reference/SRD-Data/ — per CLAUDE.md, that's Adam's hand-curated source of
truth; a validator reports drift, it does not resolve it.

Usage:
    python3 build/sync-open5e.py            # report only, exit 0 unless network unreachable
    python3 build/sync-open5e.py --check    # exit 0 iff join complete AND no field diffs

If the Open5e API is unreachable, this degrades cleanly: prints a clear message and exits
non-zero WITHOUT touching any file or fabricating a comparison.
"""
import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "Reference", "SRD-Data", "spells.json")
REPORT_OUT = os.path.join(ROOT, "dev", "open5e-crosscheck-report.json")

API_BASE = "https://api.open5e.com/v2/spells/"
DOCUMENT_KEY = "srd-2024"
EXPECTED_COUNT = 339

# Field set pinned by the spec (docs/PHASE-3-WAVE-1-SPECS.md, W0-c) — the only fields --check
# gates on.
FIELD_KEYS = ["level", "school", "casting_time", "range", "duration", "concentration", "ritual"]

REQUEST_TIMEOUT_S = 15


def norm_name(name):
    """Mirror build/gen-spells.py's norm_name — fold curly quote, collapse ws, trim, lowercase."""
    return re.sub(r"\s+", " ", str(name or "").replace("’", "'")).strip().lower()


def norm_str(s):
    """Loose string normalization for field-diff comparisons — case/whitespace only."""
    return re.sub(r"\s+", " ", str(s or "")).strip().lower()


def load_local_spells():
    with open(SRC, "r", encoding="utf-8") as f:
        data = json.load(f)
    by_name = {}
    for rec in data:
        by_name[norm_name(rec.get("name"))] = rec
    return by_name


def fetch_open5e():
    """Paginate the Open5e v2 spells endpoint filtered to document__key=srd-2024.

    Returns a dict keyed by normalized spell name, or raises on any network/parse failure —
    callers must catch and degrade cleanly (no partial/fabricated comparison).
    """
    by_name = {}
    url = "{}?document__key={}&limit=100".format(API_BASE, DOCUMENT_KEY)
    seen_pages = 0
    while url:
        req = urllib.request.Request(url, headers={"User-Agent": "genesis-sync-open5e/1.0"})
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT_S) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        seen_pages += 1
        for rec in payload.get("results", []):
            doc = rec.get("document") or {}
            if doc.get("key") != DOCUMENT_KEY:
                continue  # strict filter — never let a non-srd-2024 record leak into the join
            by_name[norm_name(rec.get("name"))] = rec
        url = payload.get("next")
        if seen_pages > 50:  # sanity guard against a runaway pagination loop
            raise RuntimeError("Open5e pagination exceeded 50 pages — aborting")
    return by_name


def open5e_field(rec, key):
    if key == "school":
        return (rec.get("school") or {}).get("name")
    if key == "range":
        # Local SRD-Data range is a display string ("90 feet"); Open5e's `range_text` is the
        # equivalent display string (its `range` field is a bare int with no unit).
        return rec.get("range_text")
    return rec.get(key)


def local_field(rec, key):
    if key == "casting_time":
        return rec.get("castingTime")
    return rec.get(key)


def fields_equal(key, local_val, open5e_val):
    if key in ("concentration", "ritual"):
        return bool(local_val) == bool(open5e_val)
    if key == "level":
        return int(local_val or 0) == int(open5e_val or 0)
    return norm_str(local_val) == norm_str(open5e_val)


def build_report(local_by_name, open5e_by_name):
    local_names = set(local_by_name)
    open5e_names = set(open5e_by_name)
    joined_names = sorted(local_names & open5e_names)
    only_local = sorted(local_names - open5e_names)
    only_open5e = sorted(open5e_names - local_names)

    per_spell_diffs = {}
    for name in joined_names:
        local_rec = local_by_name[name]
        open5e_rec = open5e_by_name[name]
        diffs = {}
        for key in FIELD_KEYS:
            lv = local_field(local_rec, key)
            ov = open5e_field(open5e_rec, key)
            if not fields_equal(key, lv, ov):
                diffs[key] = {"local": lv, "open5e": ov}
        if diffs:
            per_spell_diffs[local_rec.get("name")] = diffs

    return {
        "document_key": DOCUMENT_KEY,
        "expected_count": EXPECTED_COUNT,
        "local_count": len(local_names),
        "open5e_count": len(open5e_names),
        "joined_count": len(joined_names),
        "only_in_local": [local_by_name[n].get("name") for n in only_local],
        "only_in_open5e": [open5e_by_name[n].get("name") for n in only_open5e],
        "field_diffs": per_spell_diffs,
    }


def print_report(report):
    print("Open5e srd-2024 cross-check")
    print("  local spells (Reference/SRD-Data/spells.json): {}".format(report["local_count"]))
    print("  open5e srd-2024 spells:                        {}".format(report["open5e_count"]))
    print("  joined by name:                                {}/{}".format(
        report["joined_count"], EXPECTED_COUNT))
    if report["only_in_local"]:
        print("  only in local ({}): {}".format(
            len(report["only_in_local"]), ", ".join(report["only_in_local"])))
    else:
        print("  only in local (0): (none)")
    if report["only_in_open5e"]:
        print("  only in open5e ({}): {}".format(
            len(report["only_in_open5e"]), ", ".join(report["only_in_open5e"])))
    else:
        print("  only in open5e (0): (none)")
    diffs = report["field_diffs"]
    if diffs:
        print("  field diffs ({} spells, fields={}):".format(len(diffs), ",".join(FIELD_KEYS)))
        for name in sorted(diffs):
            for key, vals in diffs[name].items():
                print("    - {} :: {} :: local={!r} open5e={!r}".format(
                    name, key, vals["local"], vals["open5e"]))
    else:
        print("  field diffs (0): (none)")


def join_complete(report):
    return (report["joined_count"] == EXPECTED_COUNT
            and not report["only_in_local"]
            and not report["only_in_open5e"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true",
                         help="exit 0 iff join complete AND no pinned-field diffs, else 1")
    args = parser.parse_args()

    local_by_name = load_local_spells()

    try:
        open5e_by_name = fetch_open5e()
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError,
            json.JSONDecodeError, RuntimeError) as exc:
        print("Open5e source unreachable — validator ran zero comparisons ({}: {})".format(
            type(exc).__name__, exc), file=sys.stderr)
        print("Open5e source unreachable — validator ran zero comparisons")
        return 1

    report = build_report(local_by_name, open5e_by_name)
    print_report(report)

    try:
        os.makedirs(os.path.dirname(REPORT_OUT), exist_ok=True)
        with open(REPORT_OUT, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, sort_keys=True)
            f.write("\n")
        print("  report written: {}".format(os.path.relpath(REPORT_OUT, ROOT)))
    except OSError as exc:
        print("  (warning) could not write report file: {}".format(exc), file=sys.stderr)

    if args.check:
        ok = join_complete(report) and not report["field_diffs"]
        return 0 if ok else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
