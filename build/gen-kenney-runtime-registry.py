#!/usr/bin/env python3
"""Generate the fail-closed Kenney runtime registry from calibrated normalized indexes.

KGR-5 admits exactly the ten named pilot assets.  The calibration sidecar and normalized v2
indexes must agree on source hash, recipe identity, QA state, footprint, and mount metadata; stale
or non-runtime records stop generation instead of entering production lookup.

Run: python3 build/gen-kenney-runtime-registry.py [--check]
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CALIBRATION = ROOT / "dev/model-foundry/kenney-calibration.json"
RULES = ROOT / "dev/model-foundry/kenney-visual-rules.json"
OUTPUT = ROOT / "data/kenney-runtime-registry.js"

PILOTS = {
    "kenney-retro-fantasy-kit/detail-barrel": "barrel",
    "kenney-pirate-kit/crate": "crate",
    "kenney-pirate-kit/chest": "chest",
    "kenney-furniture-kit/tableRound": "table",
    "kenney-furniture-kit/benchCushionLow": "bench",
    "kenney-furniture-kit/chair": "chair",
    "kenney-furniture-kit/lampWall": "lamp-wall",
    "kenney-furniture-kit/lampRoundFloor": "lamp-floor",
    "kenney-fantasy-town-kit/lantern": "lantern",
    "kenney-factory-kit/lever-double": "lever",
}


def canonical(value: object) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def fail(message: str) -> None:
    raise SystemExit(f"gen-kenney-runtime-registry: {message}")


def build_registry() -> tuple[dict, str, list]:
    calibration = load_json(CALIBRATION)
    rules_doc = load_json(RULES)
    if calibration.get("schema") != "genesis.kenney-calibration.v1":
        fail("calibration schema mismatch")
    if rules_doc.get("schema") != "genesis.kenney-visual-rules.v1":
        fail("visual-rules schema mismatch")

    records = calibration.get("assets") or {}
    approved = {asset_id for asset_id, record in records.items()
                if record.get("qaStatus") == "approved-runtime"}
    if approved != set(PILOTS):
        missing = sorted(set(PILOTS) - approved)
        extra = sorted(approved - set(PILOTS))
        fail(f"approved-runtime set must be the exact ten pilots; missing={missing} extra={extra}")

    assets = {}
    for asset_id, family in PILOTS.items():
        pack, slug = asset_id.split("/", 1)
        record = records.get(asset_id)
        if not record or record.get("qaStatus") != "approved-runtime":
            fail(f"non-runtime pilot {asset_id}")
        index_path = ROOT / "assets/models-normalized" / pack / "index.json"
        index = load_json(index_path)
        if index.get("schema") != "genesis.donor-index.v2" or index.get("pack") != pack:
            fail(f"invalid normalized index {index_path.relative_to(ROOT)}")
        entry = (index.get("assets") or {}).get(slug)
        if not entry or entry.get("assetId") != asset_id:
            fail(f"normalized pilot missing: {asset_id}")
        if entry.get("qaStatus") != "approved-runtime":
            fail(f"normalized pilot is not approved-runtime: {asset_id}")
        if entry.get("sourceSha256") != record.get("sourceSha256"):
            fail(f"stale source hash: {asset_id}")
        footprint = ((entry.get("bounds") or {}).get("footprint"))
        if not footprint:
            fail(f"missing transformed footprint: {asset_id}")
        sockets = entry.get("sockets") or []
        if len(sockets) != 1 or sockets[0].get("type") not in ("floor-mount", "wall-mount"):
            fail(f"pilot must have exactly one reviewed floor/wall mount: {asset_id}")
        assets[asset_id] = {
            "assetId": asset_id,
            "pack": pack,
            "slug": slug,
            "family": family,
            "category": entry.get("category"),
            "qaStatus": entry.get("qaStatus"),
            "sourceSha256": entry.get("sourceSha256"),
            "recipeHash": entry.get("recipeHash"),
            "footprint": footprint,
            "sockets": sockets,
        }

    registry_hash = hashlib.sha256(canonical(assets).encode("utf-8")).hexdigest()
    return assets, registry_hash, rules_doc.get("rules") or []


def render() -> str:
    assets, registry_hash, rules = build_registry()
    assets_json = json.dumps(assets, indent=2, sort_keys=True, ensure_ascii=False)
    rules_json = json.dumps(rules, indent=2, ensure_ascii=False)
    return f'''/* GENESIS DATA (generated) — data/kenney-runtime-registry.js
   KGR-5 runtime admission registry. Generated only by build/gen-kenney-runtime-registry.py from
   source-hash-bound approved-runtime calibration records and normalized donor-index v2 metadata.
   Never hand-edit. */
const KENNEY_RUNTIME_REGISTRY_SCHEMA = "genesis.kenney-runtime-registry.v1";
const KENNEY_RUNTIME_REGISTRY_HASH = "{registry_hash}";
const KENNEY_RUNTIME_ASSETS = Object.freeze({assets_json});
const KENNEY_VISUAL_RULES = Object.freeze({rules_json});
'''


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    text = render()
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != text:
            fail("generated registry is stale; run without --check")
        print("kenney runtime registry: OK (10 assets)")
        return 0
    OUTPUT.write_text(text, encoding="utf-8")
    print(f"wrote {OUTPUT.relative_to(ROOT)} (10 assets)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
