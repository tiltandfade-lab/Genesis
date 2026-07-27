#!/usr/bin/env python3
"""Give adjudicated Meshy source files stable names without deleting any donor."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INCOMING = ROOT / "Reference/Meshy-Premium-Month-1/incoming"
LEDGER = INCOMING / "SOURCE-LEDGER.json"

MOVES = {
    "Meshy_AI_Medieval_Notice_Board_0726205703_generate.glb": "M049-D-public-notice-and-signal-board-smart-700.glb",
    "Meshy_AI_Iron_Alarm_Bell_Timbe_0726210351_generate.glb": "M052-A-bell-or-gong-yoke-smart-900.glb",
    "Meshy_AI_Lectern_Inspection_St_0726210431_generate.glb": "M053-A-archive-lectern-and-scribe-station-smart-800.glb",
    "Meshy_AI_chevaux_de_frise_barr_0726210459_generate.glb": "M054-A-chevaux-de-frise-and-spike-barrier-smart-800.glb",
    "Meshy_AI_timber_barricade_lowp_0726210720_generate.glb": "M055-A-movable-timber-barricade-smart-800.glb",
    "Meshy_AI_Wattle_Fence_Screen_L_0726210636_generate.glb": "M056-A-wattle-and-woven-screen-smart-800.glb",
    "Meshy_AI_Gabion_Stone_Basket_L_0726211019_generate.glb": "M057-A-gabion-and-stone-basket-cluster-smart-900.glb",
    "Meshy_AI_Timber_Holding_Cage_L_0726210916_generate.glb": "M058-A-holding-cage-or-animal-pen-module-smart-1200.glb",
    "Meshy_AI_timber_brace_donor_cl_0726211055_generate.glb": "M062-B-timber-repair-and-brace-cluster-smart-700.glb",
    "Meshy_AI_Military_Stores_Clust_0726211154_generate.glb": "M064-B-camp-kitchen-and-stores-cluster-smart-1000.glb",
    "Meshy_AI_Gabion_Stone_Basket_L_0726210808_generate.glb": "variants/M057-A-gabion-alternate-1-smart-900.glb",
    "Meshy_AI_Gabion_Stone_Basket_L_0726211210_generate.glb": "variants/M057-A-gabion-alternate-2-smart-900.glb",
    "M068-A-wall-flame-sconce-chunky-candidate-smart-600.glb": "variants/M068-A-wall-flame-sconce-chunky-candidate-smart-600.glb",
    "M005-A-wide-cave-mouth-with-reveal-noisy-attempt-smart-1200.glb": "rejected/M005-A-wide-cave-mouth-with-reveal-noisy-attempt-smart-1200.glb",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="perform the source-preserving moves")
    args = parser.parse_args()
    records = []
    problems = []

    for original, destination in MOVES.items():
        src, dst = INCOMING / original, INCOMING / destination
        if src.exists() and dst.exists() and src.resolve() != dst.resolve():
            problems.append(f"both source and destination exist: {original} -> {destination}")
            continue
        if src.exists() and args.apply and src != dst:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(dst))
        actual = dst if dst.exists() else src
        if not actual.exists():
            problems.append(f"missing source: {original}")
            continue
        records.append({
            "originalUploadName": original,
            "canonicalPath": actual.relative_to(ROOT).as_posix(),
            "disposition": destination.split("/", 1)[0] if "/" in destination else "canonical",
            "bytes": actual.stat().st_size,
            "sha256": sha256(actual),
        })

    if problems:
        print("\n".join(f"ERROR: {problem}" for problem in problems))
        return 1
    payload = {
        "schemaVersion": 1,
        "policy": "Source donors are renamed or classified, never deleted.",
        "records": sorted(records, key=lambda item: item["canonicalPath"]),
    }
    if args.apply:
        LEDGER.write_text(json.dumps(payload, indent=2) + "\n")
        print(f"wrote {LEDGER.relative_to(ROOT)} ({len(records)} records)")
    else:
        print(json.dumps(payload, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
