#!/usr/bin/env python3
"""Genesis dev tool — merge desc-writing batches into dev/model-qa/realm-bestiary-draft.json.

Context: docs/REALM-ENRICHMENT-WRITING.md's desc pass (Unit W3) produced one JSON batch per
realm — each batch is `{"realm": <id>, "entries": [{"name", "desc", "traits"?}, ...]}` — written
to a scratchpad directory by parallel writing agents. This script folds those batches back into
the single source-of-truth draft (dev/model-qa/realm-bestiary-draft.json), setting `desc` (and
`traits` when present) on the matching creature.

Matching is by (realm, exact creature name) — EXACT string equality only, never fuzzy/normalized.
A batch entry whose name doesn't exactly match a creature already in that realm in the draft is
an error, not a skip: it usually means a typo, a renamed creature, or a batch that drifted from
the draft it was generated against. This script always fails loudly on that rather than silently
dropping content.

Only files that match the expected batch shape (`dict` with `realm` + `entries` list of dicts with
a `name` string) are treated as batches. Any `*.json` file in the input directory that does NOT
match that shape is also a hard error (never silently skipped) — this repo's scratch dirs have
been observed to accumulate leftover pre-desc source dumps (e.g. `*-source.json`, `*-draft.json`,
`*-raw.json`, `*-src.json`) alongside the real batches; rather than guess which files are which,
this script demands every `*.json` in the directory be a well-formed batch, or that the caller
clean the directory first.

Usage:
  python3 dev/model-qa/merge-desc-batches.py <batches-dir> [--draft <path>]

Writes dev/model-qa/realm-bestiary-draft.json in place (default), preserving the `_review` entry
and per-realm/per-creature key order aside from the added `desc`/`traits`.

Exit 0 = clean merge. Exit 1 = any problem (malformed file, unmatched entry, duplicate entry,
missing realm) — nothing is written in that case.
"""
import json
import os
import sys
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DRAFT = os.path.join(ROOT, "dev", "model-qa", "realm-bestiary-draft.json")


def is_batch_shape(obj):
    """True iff obj looks like a well-formed {"realm": str, "entries": [{"name": str, ...}]} batch."""
    if not isinstance(obj, dict):
        return False
    if not isinstance(obj.get("realm"), str) or not obj["realm"]:
        return False
    entries = obj.get("entries")
    if not isinstance(entries, list):
        return False
    for e in entries:
        if not isinstance(e, dict) or not isinstance(e.get("name"), str) or not e["name"]:
            return False
    return True


def load_batches(batches_dir):
    """Load every *.json in batches_dir. Returns (batches, malformed) where malformed is a list
    of (filename, reason) for files that are not well-formed batches."""
    paths = sorted(
        os.path.join(batches_dir, fn)
        for fn in os.listdir(batches_dir)
        if fn.endswith(".json")
    )
    if not paths:
        sys.stderr.write(f"merge-desc-batches: no *.json files found in {batches_dir}\n")
        sys.exit(1)

    batches = []
    malformed = []
    for p in paths:
        fn = os.path.basename(p)
        try:
            with open(p, encoding="utf-8") as f:
                obj = json.load(f, object_pairs_hook=OrderedDict)
        except (json.JSONDecodeError, OSError) as e:
            malformed.append((fn, f"could not parse as JSON: {e}"))
            continue
        if not is_batch_shape(obj):
            malformed.append((fn, "not a well-formed {realm, entries:[{name,...}]} batch shape "
                                   "(looks like a leftover source/draft/raw file, not a desc batch)"))
            continue
        batches.append((fn, obj))
    return batches, malformed


def load_draft(draft_path):
    with open(draft_path, encoding="utf-8") as f:
        data = json.load(f, object_pairs_hook=OrderedDict)
    return data


def main():
    args = sys.argv[1:]
    if not args:
        sys.stderr.write(__doc__)
        sys.exit(1)
    batches_dir = args[0]
    draft_path = DEFAULT_DRAFT
    if "--draft" in args:
        draft_path = args[args.index("--draft") + 1]

    if not os.path.isdir(batches_dir):
        sys.stderr.write(f"merge-desc-batches: not a directory: {batches_dir}\n")
        sys.exit(1)

    batches, malformed = load_batches(batches_dir)

    if malformed:
        sys.stderr.write(f"merge-desc-batches: {len(malformed)} malformed/non-batch file(s) in {batches_dir}:\n")
        for fn, reason in malformed:
            sys.stderr.write(f"  - {fn}: {reason}\n")
        sys.stderr.write("Refusing to merge. Remove/relocate these files (they are not desc batches) "
                          "and re-run.\n")
        sys.exit(1)

    draft = load_draft(draft_path)

    # realm -> {name -> creature dict} for O(1) exact lookups
    realm_creatures = {}
    for r in draft:
        if "realm" in r and "creatures" in r:
            realm_creatures[r["realm"]] = {c["name"]: c for c in r["creatures"]}

    unmatched = []       # (batch_file, realm, name) — entry has no matching draft creature
    unknown_realm = []    # (batch_file, realm) — realm not present in draft at all
    dup_in_batch = []     # (batch_file, realm, name) — same name appears twice within one batch
    updated = 0

    for fn, batch in batches:
        realm = batch["realm"]
        entries = batch["entries"]

        if realm not in realm_creatures:
            unknown_realm.append((fn, realm))
            continue

        seen_in_batch = set()
        creatures_by_name = realm_creatures[realm]

        for entry in entries:
            name = entry["name"]
            if name in seen_in_batch:
                dup_in_batch.append((fn, realm, name))
                continue
            seen_in_batch.add(name)

            creature = creatures_by_name.get(name)  # exact match only — no fuzzy matching
            if creature is None:
                unmatched.append((fn, realm, name))
                continue

            if "desc" in entry and entry["desc"]:
                creature["desc"] = entry["desc"]
                updated += 1
            if "traits" in entry and entry["traits"]:
                creature["traits"] = entry["traits"]

    problems = bool(unmatched or unknown_realm or dup_in_batch)
    if problems:
        if unknown_realm:
            sys.stderr.write(f"merge-desc-batches: {len(unknown_realm)} batch(es) reference a realm "
                              f"not present in the draft:\n")
            for fn, realm in unknown_realm:
                sys.stderr.write(f"  - {fn}: realm '{realm}'\n")
        if unmatched:
            sys.stderr.write(f"merge-desc-batches: {len(unmatched)} unmatched entry name(s) "
                              f"(no exact-match creature found in that realm in the draft):\n")
            for fn, realm, name in unmatched:
                sys.stderr.write(f"  - {fn}: {realm}/{name!r}\n")
        if dup_in_batch:
            sys.stderr.write(f"merge-desc-batches: {len(dup_in_batch)} duplicate entry name(s) "
                              f"within a single batch:\n")
            for fn, realm, name in dup_in_batch:
                sys.stderr.write(f"  - {fn}: {realm}/{name!r}\n")
        sys.stderr.write("Refusing to write. Fix the batch file(s) (exact-name match required, "
                          "no fuzzy matching) and re-run.\n")
        sys.exit(1)

    with open(draft_path, "w", encoding="utf-8") as f:
        json.dump(draft, f, ensure_ascii=False, indent=2)
        f.write("\n")

    total_creatures = sum(len(r["creatures"]) for r in draft if "creatures" in r)
    print(f"merge-desc-batches: merged {len(batches)} batch file(s) into {draft_path}")
    print(f"merge-desc-batches: set desc on {updated} creature(s) (of {total_creatures} total in draft)")


if __name__ == "__main__":
    main()
