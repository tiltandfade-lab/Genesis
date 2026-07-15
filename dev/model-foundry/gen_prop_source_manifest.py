#!/usr/bin/env python3
"""Compile the three-core-realm prop source inventory and cross-realm exception queue."""

from __future__ import annotations

import argparse
import collections
import hashlib
import json
import re
from pathlib import Path

CORE_REALMS = ("fantasy", "gloom", "chrome")
ALL_REALMS = (
    "ash", "bright-kingdom", "chrome", "cosmic", "fantasy", "frontier", "gloom",
    "high-seas", "lost-world", "noir", "suburb", "theater",
)

FACED_BOX = {"bed", "bench", "cabinet", "chest", "container", "crate", "barrel", "box", "table", "shelf", "counter", "pew", "sarcophagus"}
LATHE = {"urn", "bottle", "jar", "bowl", "cup", "goblet", "bell", "vial", "flask", "candle"}
SWEEP = {"rope", "chain", "pipe", "cord", "branch", "horn", "cable", "whip", "net"}
EXTRUDE = {"door", "lever", "sign", "painting", "portrait", "shield", "key", "grate", "screen", "relief", "banner", "plaque", "wreath", "veil", "tablet", "blade", "map", "scroll", "book", "trap", "window", "panel", "seal"}
MODEL = {"campfire", "portal", "shrine", "fountain", "tree", "machine", "cart", "wagon", "chair"}
EXCEPTION_WORDS = {"sign", "banner", "rope", "chain", "grate", "lever", "key", "shield", "door", "plaque", "screen", "lantern", "torch", "barrel", "crate", "urn", "bridge"}


def words(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower().replace("’", "'")))


def classify(text: str) -> tuple[str, str]:
    tokens = words(text)
    if tokens & FACED_BOX:
        return "FACED_BOX", "chassis+generated-faces"
    if tokens & LATHE:
        return "MODEL", "lathe"
    if tokens & SWEEP:
        return "MODEL", "sweep"
    if tokens & EXTRUDE:
        return "EXTRUDE", "contour-extrusion"
    if tokens & MODEL:
        return "MODEL", "hybrid-or-donor"
    return "MODEL", "unresolved-review"


def projection_contract(construction: str, has_art: bool) -> dict:
    if construction != "EXTRUDE":
        return {"sourceProjection": "NOT_APPLICABLE", "extrusionEligibility": "NOT_EXTRUSION"}
    if has_art:
        return {
            "sourceProjection": "LEGACY_PERSPECTIVE_UNVERIFIED",
            "extrusionEligibility": "REGENERATE_FLAT",
        }
    return {"sourceProjection": "MISSING", "extrusionEligibility": "REGENERATE_FLAT"}


def item_entries(root: Path, realm: str) -> list[dict]:
    source = root / "dev" / "model-qa" / "sprite-sheets" / f"{realm}.md"
    text = source.read_text()
    marker = "## Item batches"
    if marker not in text:
        return []
    section = text.split(marker, 1)[1]
    entries = []
    pattern = re.compile(r"^\d+\. \*\*(.+?)\*\* \[([^\]]+)\](?:\s+[—-]\s+(.+))?$")
    variant_pattern = re.compile(r"^\d+\. \*\*(.+?)\*\*$")
    item_lines = [line for line in section.splitlines() if re.match(r"^\d+\. ", line)]
    for index, line in enumerate(item_lines, start=1):
        match = pattern.match(line)
        variant = variant_pattern.match(line)
        if not match and not variant:
            continue
        name = (match.group(1) if match else variant.group(1)).strip()
        band = match.group(2).strip() if match else "variant"
        description = (match.group(3) or name).strip() if match else name
        construction, operator = classify(name + " " + description)
        entries.append({
            "id": f"{realm}:item:{index}", "realm": realm, "kind": "item", "name": name,
            "description": description, "band": band, "sourceRef": f"{source.as_posix()}:item:{index}",
            "constructionClass": construction, "operator": operator, "status": "prompt-only",
            "productionScope": "CORE",
            **projection_contract(construction, False),
        })
    return entries


def object_entries(root: Path, realm: str) -> list[dict]:
    source = root / "dev" / "model-qa" / "dressing-gen" / "manifests" / f"{realm}-objects-dg-03.json"
    data = json.loads(source.read_text())
    entries = []
    by_slug = {cell["slug"]: cell for cell in data["cells"]}
    for cell in data["cells"]:
        base = by_slug.get(cell.get("altOf"), {})
        archetype = cell.get("archetype", base.get("archetype", "unknown"))
        state = cell.get("state", base.get("state", "variant"))
        construction, operator = classify(archetype + " " + cell["label"])
        art = root / "assets" / "dressing" / f"{cell['slug']}.png"
        entries.append({
            "id": f"{realm}:object:{cell['slug']}", "realm": realm, "kind": "object",
            "name": cell["label"], "slug": cell["slug"], "archetype": archetype,
            "state": state, "altOf": cell.get("altOf"), "sourceRef": source.as_posix(),
            "art": art.relative_to(root).as_posix() if art.exists() else None,
            "artSha256": hashlib.sha256(art.read_bytes()).hexdigest() if art.exists() else None,
            "constructionClass": construction, "operator": operator,
            "status": "cut" if art.exists() else "missing-art", "productionScope": "CORE",
            **projection_contract(construction, art.exists()),
        })
    return entries


def dressing_entries(root: Path, realm: str) -> list[dict]:
    entries = []
    for art in sorted((root / "assets" / "dressing").glob(f"{realm}-*.png")):
        if "-obj-" in art.name:
            continue
        label = art.stem.replace("-", " ")
        construction, operator = classify(label)
        entries.append({
            "id": f"{realm}:dressing:{art.stem}", "realm": realm, "kind": "dressing",
            "name": label, "slug": art.stem, "sourceRef": art.relative_to(root).as_posix(),
            "art": art.relative_to(root).as_posix(), "artSha256": hashlib.sha256(art.read_bytes()).hexdigest(),
            "constructionClass": construction, "operator": operator, "status": "cut",
            "productionScope": "CORE",
            **projection_contract(construction, True),
        })
    return entries


def exception_entries(root: Path) -> list[dict]:
    entries = []
    for realm in ALL_REALMS:
        if realm in CORE_REALMS:
            continue
        for art in sorted((root / "assets" / "dressing").glob(f"{realm}-*.png")):
            tokens = words(art.stem)
            relevant = sorted(tokens & EXCEPTION_WORDS)
            if not relevant or art.stem.startswith("fx-"):
                continue
            construction, operator = classify(art.stem)
            entries.append({
                "id": f"{realm}:exception:{art.stem}", "realm": realm, "kind": "exception-candidate",
                "name": art.stem.replace("-", " "), "slug": art.stem,
                "sourceRef": art.relative_to(root).as_posix(), "art": art.relative_to(root).as_posix(),
                "artSha256": hashlib.sha256(art.read_bytes()).hexdigest(),
                "constructionClass": construction, "operator": operator,
                "relevance": relevant, "status": "exception-review", "productionScope": "EXCEPTION_ONLY",
                **projection_contract(construction, True),
            })
    return entries


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("."))
    parser.add_argument("--out", type=Path, default=Path("dev/model-foundry/prop-source-manifest.json"))
    args = parser.parse_args(); root = args.root.resolve()
    entries = []
    for realm in CORE_REALMS:
        entries.extend(item_entries(root, realm))
        entries.extend(object_entries(root, realm))
        entries.extend(dressing_entries(root, realm))
    exceptions = exception_entries(root)
    report = {
        "schema": "genesis.prop-source-manifest.v1",
        "coreRealms": list(CORE_REALMS),
        "otherRealmPolicy": "EXCEPTION_ONLY: no matrix expansion; admit only a concrete cross-realm semantic gap.",
        "entryCount": len(entries), "exceptionCandidateCount": len(exceptions),
        "countsByRealm": dict(collections.Counter(item["realm"] for item in entries)),
        "countsByKind": dict(collections.Counter(item["kind"] for item in entries)),
        "countsByConstruction": dict(collections.Counter(item["constructionClass"] for item in entries)),
        "extrusionProjectionPolicy": "Only FLAT_ORTHOGRAPHIC_QA_PASS may enter production extrusion.",
        "entries": entries, "exceptionCandidates": exceptions,
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({key: report[key] for key in ("entryCount", "exceptionCandidateCount", "countsByRealm", "countsByKind", "countsByConstruction")}, indent=2))


if __name__ == "__main__":
    main()
