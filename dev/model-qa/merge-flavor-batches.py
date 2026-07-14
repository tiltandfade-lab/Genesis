#!/usr/bin/env python3
"""Genesis dev tool — merge Phase-2b flavor/story batches into realm-bestiary-draft.json.

docs/MONSTER-FLAVOR-TABLES.md §2 + docs/REALM-ENRICHMENT-WRITING.md §3.2. The Phase-2b authoring
wave produced, per realm (chunked), sidecar files each shaped
  {"realm": <id>, "entries": [{"name", "treasure", "habitat", "activity", "traits", "flavorTable"}, ...]}
This script folds those five additive fields onto the matching creature in the single source-of-truth
draft (dev/model-qa/realm-bestiary-draft.json).

RECONCILIATION (the production wave spilled across multiple chunk generations under different dir/
file names). This script is deliberately fail-loud:
  * Matching is by (realm, exact creature name) — EXACT equality, never fuzzy.
  * A creature already carrying a COMMITTED `traits` in the draft (a prior review-gated session,
    184 rows at the time of writing) keeps that committed `traits` — the authored sidecar's traits
    is NOT allowed to overwrite it (canon precedence). Its four story fields are still folded.
  * If two accepted sidecar entries author the SAME (realm, name) with DIFFERING content, that's a
    hard collision → error (the caller must pick one generation). Byte-identical duplicates are fine.
  * After the fold, EVERY one of the draft's creatures must carry all five target fields (traits +
    the four story fields) unless --allow-partial. A single uncovered creature is an error.
  * treasure/habitat vocab and the d8 flavorTable shape are re-validated here too (defence in depth;
    build/gen-realm-bestiary.py --check is the authoritative gate).

Usage:
  python3 dev/model-qa/merge-flavor-batches.py <dir> [<dir> ...] [--draft <path>] [--allow-partial]

Every *.json under each <dir> (recursively) that matches the batch shape is consumed; any *.json
that is NOT a well-formed {realm, entries:[{name,...}]} batch is a hard error (clean the dir first).
Nothing is written unless the whole reconciliation is clean.
"""
import json, os, sys
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DRAFT = os.path.join(ROOT, "dev", "model-qa", "realm-bestiary-draft.json")

HABITAT_VOCAB = {"any", "arctic", "cave", "coast", "deeplands", "desert", "elemental", "forest",
                 "grassland", "hill", "mountain", "planar", "ruins", "sea", "sky", "swamp", "urban"}
TREASURE_VOCAB = {"none", "individual", "hoard"}
LOW_BANDS = {1: "Grounded", 2: "Grounded", 3: "Grounded", 4: "Grounded", 5: "Grounded",
             6: "Textured", 7: "Strange"}
ROW8_BANDS = ("Volatile", "Mythic")
STORY_FIELDS = ("treasure", "habitat", "activity")
TARGET_FIELDS = ("traits", "flavorTable", "treasure", "habitat", "activity")


def is_batch_shape(obj):
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


def find_batches(dirs):
    paths = []
    for d in dirs:
        for root, _sub, files in os.walk(d):
            for fn in files:
                if fn.endswith(".json"):
                    paths.append(os.path.join(root, fn))
    batches, malformed = [], []
    for p in sorted(paths):
        try:
            with open(p, encoding="utf-8") as f:
                obj = json.load(f, object_pairs_hook=OrderedDict)
        except (json.JSONDecodeError, OSError) as e:
            malformed.append((p, f"could not parse: {e}"))
            continue
        if not is_batch_shape(obj):
            malformed.append((p, "not a {realm, entries:[{name,...}]} batch"))
            continue
        batches.append((p, obj))
    return batches, malformed


def validate_entry(realm, e):
    problems = []
    where = f"{realm}/{e.get('name')}"
    if e.get("treasure") not in TREASURE_VOCAB:
        problems.append(f"{where}: treasure {e.get('treasure')!r} invalid")
    hab = e.get("habitat")
    if not isinstance(hab, list) or not hab or any(h not in HABITAT_VOCAB for h in hab):
        problems.append(f"{where}: habitat {hab!r} invalid")
    act = e.get("activity")
    if not isinstance(act, list) or not (1 <= len(act) <= 2) or any(not isinstance(a, str) or not a.strip() for a in act):
        problems.append(f"{where}: activity {act!r} invalid")
    tr = e.get("traits")
    if not isinstance(tr, dict) or not isinstance(tr.get("actions"), list) or not tr["actions"]:
        problems.append(f"{where}: traits missing actions")
    else:
        for a in tr["actions"]:
            if not isinstance(a, dict) or not a.get("name") or not a.get("text"):
                problems.append(f"{where}: malformed traits action")
                break
    ft = e.get("flavorTable")
    if not isinstance(ft, dict):
        problems.append(f"{where}: flavorTable missing")
    else:
        if ft.get("die") != "d8":
            problems.append(f"{where}: flavorTable.die != d8")
        if ft.get("mode") not in ("variant", "hook"):
            problems.append(f"{where}: flavorTable.mode invalid")
        rows = ft.get("rows")
        if not isinstance(rows, list) or len(rows) != 8:
            problems.append(f"{where}: flavorTable.rows != 8")
        else:
            seen = set()
            apex = str(e.get("role") or "").lower() == "apex"
            for row in rows:
                n, band, text = row.get("n"), row.get("band"), row.get("text")
                if n not in range(1, 9):
                    problems.append(f"{where}: row n {n!r}"); continue
                seen.add(n)
                if not text or not str(text).strip():
                    problems.append(f"{where}: row {n} no text")
                if n <= 7 and band != LOW_BANDS[n]:
                    problems.append(f"{where}: row {n} band {band!r} != {LOW_BANDS[n]}")
                if n == 8:
                    if band not in ROW8_BANDS:
                        problems.append(f"{where}: row 8 band {band!r}")
                    if band == "Mythic" and not apex:
                        problems.append(f"{where}: row 8 Mythic on non-apex")
            if seen != set(range(1, 9)):
                problems.append(f"{where}: rows n coverage {sorted(seen)}")
    return problems


def canon_key(e):
    """A comparable snapshot of the five target fields for collision detection."""
    return json.dumps({k: e.get(k) for k in TARGET_FIELDS}, sort_keys=True, ensure_ascii=False)


def main():
    args = sys.argv[1:]
    draft_path = DEFAULT_DRAFT
    allow_partial = "--allow-partial" in args
    if "--draft" in args:
        i = args.index("--draft"); draft_path = args[i + 1]
        args = args[:i] + args[i + 2:]
    dirs = [a for a in args if not a.startswith("--")]
    if not dirs:
        sys.stderr.write(__doc__); sys.exit(1)

    batches, malformed = find_batches(dirs)
    if malformed:
        sys.stderr.write(f"merge-flavor-batches: {len(malformed)} non-batch file(s):\n")
        for p, r in malformed:
            sys.stderr.write(f"  - {p}: {r}\n")
        sys.exit(1)

    draft = json.load(open(draft_path, encoding="utf-8"), object_pairs_hook=OrderedDict)
    realm_creatures = {}
    for r in draft:
        if "realm" in r and "creatures" in r:
            realm_creatures[r["realm"]] = {c["name"]: c for c in r["creatures"]}

    # role lookup (for apex-Mythic validation) straight from the draft
    role_of = {}
    for r in draft:
        if "creatures" in r:
            for c in r["creatures"]:
                role_of[(r["realm"], c["name"])] = c.get("role")

    accepted = {}      # (realm, name) -> entry
    collisions = []    # (realm, name, fileA, fileB)
    unmatched = []     # (file, realm, name)
    unknown_realm = [] # (file, realm)
    shape_problems = []

    for path, batch in batches:
        realm = batch["realm"]
        if realm not in realm_creatures:
            unknown_realm.append((path, realm)); continue
        for e in batch["entries"]:
            name = e["name"]
            if name not in realm_creatures[realm]:
                unmatched.append((path, realm, name)); continue
            e.setdefault("role", role_of.get((realm, name)))
            probs = validate_entry(realm, e)
            if probs:
                shape_problems.extend(probs); continue
            key = (realm, name)
            if key in accepted:
                if canon_key(accepted[key][1]) != canon_key(e):
                    collisions.append((realm, name, accepted[key][0], path))
                # byte-identical duplicate -> keep first, silent
            else:
                accepted[key] = (path, e)

    problems = bool(unknown_realm or unmatched or collisions or shape_problems)
    if problems:
        if unknown_realm:
            sys.stderr.write(f"unknown realm in {len(unknown_realm)} batch(es):\n")
            for p, r in unknown_realm: sys.stderr.write(f"  - {p}: {r}\n")
        if unmatched:
            sys.stderr.write(f"{len(unmatched)} unmatched entry name(s):\n")
            for p, r, n in unmatched[:40]: sys.stderr.write(f"  - {p}: {r}/{n!r}\n")
        if collisions:
            sys.stderr.write(f"{len(collisions)} conflicting duplicate(s) (differing content for same name):\n")
            for r, n, a, b in collisions[:40]: sys.stderr.write(f"  - {r}/{n!r}: {a} vs {b}\n")
        if shape_problems:
            sys.stderr.write(f"{len(shape_problems)} shape problem(s):\n")
            for p in shape_problems[:40]: sys.stderr.write(f"  - {p}\n")
        sys.stderr.write("Refusing to write.\n")
        sys.exit(1)

    # apply — committed traits win; four story fields + flavorTable always fold
    committed_traits_kept = 0
    applied = 0
    for (realm, name), (_path, e) in accepted.items():
        c = realm_creatures[realm][name]
        for f in ("flavorTable", "treasure", "habitat", "activity"):
            c[f] = e[f]
        if c.get("traits"):
            committed_traits_kept += 1     # keep the pre-existing committed traits (canon precedence)
        else:
            c["traits"] = e["traits"]
        applied += 1

    # coverage check
    uncovered = []
    for r in draft:
        if "creatures" not in r: continue
        for c in r["creatures"]:
            miss = [f for f in TARGET_FIELDS if not c.get(f)]
            if miss:
                uncovered.append((r["realm"], c["name"], miss))
    if uncovered and not allow_partial:
        sys.stderr.write(f"coverage: {len(uncovered)} creature(s) missing target field(s) "
                         f"(--allow-partial to skip):\n")
        for realm, name, miss in uncovered[:40]:
            sys.stderr.write(f"  - {realm}/{name!r}: missing {miss}\n")
        sys.stderr.write("Refusing to write.\n")
        sys.exit(1)

    with open(draft_path, "w", encoding="utf-8") as f:
        json.dump(draft, f, ensure_ascii=False, indent=2); f.write("\n")

    total = sum(len(r["creatures"]) for r in draft if "creatures" in r)
    print(f"merge-flavor-batches: applied {applied} entr(ies) across {len(batches)} batch file(s).")
    print(f"  committed traits preserved (not overwritten): {committed_traits_kept}")
    print(f"  draft total creatures: {total}; uncovered after merge: {len(uncovered)}")


if __name__ == "__main__":
    main()
