#!/usr/bin/env python3
"""Build a Fantasy-only B-treatment gallery from the existing ornate icon corpus."""

from __future__ import annotations

import json
from pathlib import Path

import build_faceted_extrusion_proof as extrusion

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).parent / "faceted-extrusion-gallery"
OUT.mkdir(parents=True, exist_ok=True)

ASSETS = [
    ("shield", "Shield", "assets/icons/shield.png"),
    ("key", "Key", "assets/icons/key.png"),
    ("book-arcane", "Arcane book", "assets/icons/book-arcane.png"),
    ("banner", "Ceremonial banner", "assets/icons/banner.png"),
    ("medallion", "DM medallion", "assets/icons/medallion-dm.png"),
    ("door", "Arched door", "assets/icons/door-arched.png"),
    ("helm", "Ceremonial helm", "assets/icons/helm.png"),
    ("compass", "Star compass", "assets/icons/compass.png"),
    ("tome", "Tome", "assets/icons/tome.png"),
]


def main() -> None:
    original_boundary = extrusion.BOUNDARY.copy()
    records = []
    for slug, label, relative_source in ASSETS:
        source = ROOT / relative_source
        cleaned = extrusion.clean_chroma_texture(source, OUT / f"{slug}-source.png")
        extrusion.BOUNDARY = extrusion.boundary_for_texture(cleaned)
        output, stats = extrusion.build_variant(cleaned, "faceted", f"gallery-{slug}")
        records.append({
            "id": slug, "label": label, "source": relative_source,
            "output": output.relative_to(ROOT).as_posix(), "style": "B: existing ornate art + faceted extrusion",
            **stats,
        })
    extrusion.BOUNDARY = original_boundary
    report = {
        "schema": "genesis.faceted-extrusion-gallery.v1", "realm": "fantasy",
        "verdict": "QA_PENDING", "runtimeAdmittedCount": 0,
        "intent": "Sample the B treatment across ornate Fantasy silhouettes before any regeneration wave.",
        "assets": records,
    }
    (OUT / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"assets": len(records), "faces": {record["id"]: record["faces"] for record in records}}, indent=2))


if __name__ == "__main__":
    main()
