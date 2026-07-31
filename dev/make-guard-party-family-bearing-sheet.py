#!/usr/bin/env python3
"""Assemble and validate the three-seed, four-bearing Guard Post cast proof."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_ROOT = ROOT / "artifacts/golden-site-1-sprites-v001"
OUTPUT_ROOT = ARTIFACT_ROOT / "family-bearing-proof-v2"
OUTPUT = OUTPUT_ROOT / "guard-post-family-three-seeds-four-bearings.png"
ROWS = [
    ("Hero seed 19", ARTIFACT_ROOT / "four-bearings-v2"),
    ("Mutation seed 101", OUTPUT_ROOT / "seed-101"),
    ("Mutation seed 202", OUTPUT_ROOT / "seed-202"),
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidate = Path(
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
        if bold
        else "/System/Library/Fonts/Supplemental/Arial.ttf"
    )
    return ImageFont.truetype(str(candidate), size) if candidate.exists() else ImageFont.load_default()


def capture_paths(root: Path, turn: int) -> tuple[Path, Path]:
    prefix = f"16-gv-w2-guard-post-day-q{turn}"
    return (
        root / f"turn-{turn}" / f"{prefix}-04c-beauty-closeup.png",
        root / f"turn-{turn}" / f"{prefix}-receipt.json",
    )


def validate_receipt(path: Path) -> dict:
    receipt = json.loads(path.read_text())
    terrain = receipt["clean"]["terrain"]
    proof = terrain["worldPixelDensityProof"]
    witnesses = [row for row in terrain["witnesses"] if row.get("densityProof")]
    checks = {
        "built": receipt["claim"] == "built",
        "zeroConsoleErrors": len(receipt["consoleErrors"]) == 0,
        "zeroFailedResponses": len(receipt["failedResponses"]) == 0,
        "proofDeclaresEight": proof and proof["actorCount"] == 8,
        "eightPlaced": len(witnesses) == 8,
        "fourPerSide": (
            len([row for row in witnesses if row["side"] == "pc"]) == 4
            and len([row for row in witnesses if row["side"] == "guard"]) == 4
        ),
        "allExact32": all(row["pixelsPerFoot"] == 32 for row in witnesses),
        "allExtruded": all(row["standeeExtrusion"] for row in witnesses),
        "zeroWitnessFailures": len(terrain["witnessFailures"]) == 0,
        "noMechanicalEffect": proof and proof["mechanicalEffect"] == "none",
    }
    failed = [name for name, passed in checks.items() if not passed]
    if failed:
        raise RuntimeError(f"{path}: failed {', '.join(failed)}")
    return {
        "path": str(path.relative_to(ROOT)),
        "seed": terrain["seed"],
        "planRef": proof["planRef"],
        "mechanicsRef": proof["mechanicsRef"],
        "checks": checks,
    }


def main() -> None:
    cards: list[tuple[str, int, Image.Image]] = []
    receipts = []
    for row_label, root in ROWS:
        for turn in range(4):
            image_path, receipt_path = capture_paths(root, turn)
            cards.append((row_label, turn, Image.open(image_path).convert("RGB")))
            receipts.append(validate_receipt(receipt_path))

    card_w, card_h = 610, 630
    header_h, row_label_w = 112, 190
    canvas = Image.new(
        "RGB",
        (row_label_w + card_w * 4, header_h + card_h * 3),
        "#171713",
    )
    draw = ImageDraw.Draw(canvas)
    draw.text(
        (28, 20),
        "Golden Site 1 Family · 32 px/ft Cast",
        fill="#f1e7d6",
        font=font(31, bold=True),
    )
    draw.text(
        (28, 65),
        "three deterministic Guard Posts · four quarter-turn bearings · eight clean standees",
        fill="#c99d4d",
        font=font(17),
    )
    for index, (row_label, turn, image) in enumerate(cards):
        row, col = index // 4, index % 4
        left = row_label_w + col * card_w
        top = header_h + row * card_h
        if col == 0:
            draw.multiline_text(
                (20, top + 54),
                row_label.replace(" ", "\n", 1),
                fill="#f1e7d6",
                spacing=8,
                font=font(20, bold=True),
            )
        draw.rectangle(
            (left + 8, top + 8, left + card_w - 8, top + card_h - 8),
            fill="#24241f",
            outline="#716756",
            width=2,
        )
        draw.text(
            (left + 24, top + 20),
            f"Q{turn} · {turn * 90}°",
            fill="#f1e7d6",
            font=font(19, bold=True),
        )
        available_w, available_h = card_w - 34, card_h - 78
        scale = min(available_w / image.width, available_h / image.height)
        preview = image.resize(
            (round(image.width * scale), round(image.height * scale)),
            Image.Resampling.LANCZOS,
        )
        canvas.paste(
            preview,
            (
                left + (card_w - preview.width) // 2,
                top + 58 + (available_h - preview.height) // 2,
            ),
        )
    canvas.save(OUTPUT)
    audit = {
        "schema": "GuardPostFamilyPartyBearingProofV1",
        "status": "TECHNICAL_VISUAL_PROOF_NOT_ART_APPROVAL",
        "seeds": [19, 101, 202],
        "bearings": [0, 1, 2, 3],
        "captureCount": len(receipts),
        "receipts": receipts,
        "hardChecks": {
            "twelveCaptures": len(receipts) == 12,
            "threeDistinctPlans": len({row["planRef"] for row in receipts}) == 3,
            "threeDistinctMechanics": len({row["mechanicsRef"] for row in receipts}) == 3,
            "bearingInvariantWithinSeed": all(
                len({row[key] for row in receipts[start : start + 4]}) == 1
                for start in (0, 4, 8)
                for key in ("planRef", "mechanicsRef")
            ),
        },
        "contactSheet": str(OUTPUT.relative_to(ROOT)),
    }
    if not all(audit["hardChecks"].values()):
        raise RuntimeError(f"family bearing audit failed: {audit['hardChecks']}")
    (OUTPUT_ROOT / "guard-post-family-bearing-audit.json").write_text(
        json.dumps(audit, indent=2) + "\n"
    )
    print(json.dumps(audit["hardChecks"], indent=2))
    print(OUTPUT)


if __name__ == "__main__":
    main()
