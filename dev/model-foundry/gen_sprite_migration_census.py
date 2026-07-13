#!/usr/bin/env python3
"""Inventory current sprite/dressing coverage for the faceted-v4 migration."""

from __future__ import annotations

import collections
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "dev/sprite-manifests/v2-manifest.json"
OUT = Path(__file__).parent / "sprite-migration-census.json"
SUMMARY = Path(__file__).parent / "SPRITE-MIGRATION-CENSUS.md"
CORE = {"fantasy", "gloom", "chrome"}


def main() -> None:
    manifest = json.loads(MANIFEST.read_text())
    rows = []
    for sheet in manifest["sheets"]:
        for cell in sheet["cells"]:
            slug = cell["slug"]
            legacy = ROOT / "assets/sprites" / f"{slug}.png"
            rows.append({
                "slug": slug, "name": cell["name"], "realm": sheet["realm"],
                "kind": sheet["kind"], "sheet": sheet["id"], "cell": cell["n"],
                "legacyAsset": legacy.relative_to(ROOT).as_posix() if legacy.exists() else None,
                "legacyPresent": legacy.exists(), "targetStyle": "faceted-v4",
                "migrationStatus": "LEGACY_PRESENT" if legacy.exists() else "MISSING",
                "runtimeAdmittedV4": False,
            })
    by_realm = collections.Counter(row["realm"] for row in rows)
    cut_by_realm = collections.Counter(row["realm"] for row in rows if row["legacyPresent"])
    dressing = []
    for path in sorted((ROOT / "assets/dressing").glob("*.png")):
        realm = path.stem.split("-", 1)[0]
        dressing.append({
            "asset": path.relative_to(ROOT).as_posix(), "realm": realm,
            "coreScope": realm in CORE, "migrationStatus": "LEGACY_UNREVIEWED",
            "runtimeAdmittedV4": False,
        })
    report = {
        "schema": "genesis.sprite-migration-census.v1", "targetStyle": "faceted-v4",
        "registryEntries": len(rows), "legacyRegistryAssetsPresent": sum(r["legacyPresent"] for r in rows),
        "runtimeAdmittedV4": 0, "countsByRealm": dict(sorted(by_realm.items())),
        "legacyPresentByRealm": dict(sorted(cut_by_realm.items())),
        "dressingAssets": len(dressing), "coreDressingAssets": sum(d["coreScope"] for d in dressing),
        "sprites": rows, "dressing": dressing,
    }
    OUT.write_text(json.dumps(report, indent=2) + "\n")
    core_registry = sum(count for realm, count in by_realm.items() if realm in CORE)
    core_legacy = sum(count for realm, count in cut_by_realm.items() if realm in CORE)
    SUMMARY.write_text(
        "# Sprite migration census\n\n"
        f"Target style: **faceted-v4**. Runtime-admitted v4 assets: **0**.\n\n"
        f"Registry citizens: **{len(rows)}**; legacy PNGs present: **{sum(r['legacyPresent'] for r in rows)}**. "
        f"Three-core registry citizens: **{core_registry}**; legacy present: **{core_legacy}**.\n\n"
        f"Dressing PNGs: **{len(dressing)}**; Fantasy/Gloom/Chrome dressing PNGs: "
        f"**{sum(d['coreScope'] for d in dressing)}**.\n\n"
        "Counts are inventory, not acceptance. See `sprite-migration-census.json` for stable slugs, "
        "legacy presence, realms, kinds, sheets, and cells.\n"
    )
    print(json.dumps({key: report[key] for key in (
        "registryEntries", "legacyRegistryAssetsPresent", "runtimeAdmittedV4",
        "dressingAssets", "coreDressingAssets",
    )}, indent=2))


if __name__ == "__main__":
    main()
