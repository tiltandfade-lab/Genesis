#!/usr/bin/env python3
"""Crop canonical pack captures and compose the largest family contact sheets."""

from __future__ import annotations

import collections
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).parent / "contact-sheets"
PAGES = OUT / "pages"
FAMILIES = OUT / "families"
THUMBS = OUT / "thumbs"


def safe_name(text: str) -> str:
    return "".join(char if char.isalnum() or char in "-_" else "-" for char in text).strip("-")


def main() -> None:
    index = json.loads((OUT / "page-index.json").read_text())
    census = json.loads((Path(__file__).parent / "kenney-census.json").read_text())
    metadata = {(item["pack"], item["name"]): item for item in census["assets"]}
    THUMBS.mkdir(parents=True, exist_ok=True)
    family_assets = collections.defaultdict(list)
    for page in index["pages"]:
        source = Image.open(PAGES / page["filename"]).convert("RGB")
        for idx, entry in enumerate(page["entries"]):
            col, row = idx % 5, idx // 5
            crop = source.crop((col * 256, row * 250, col * 256 + 256, row * 250 + 250))
            thumb_path = THUMBS / page["pack"] / f"{Path(entry['name']).stem}.jpg"
            thumb_path.parent.mkdir(parents=True, exist_ok=True)
            crop.save(thumb_path, quality=88, optimize=True)
            asset = metadata[(page["pack"], entry["name"])]
            family_assets[(asset["pack"], asset["family"])].append((asset, crop))

    FAMILIES.mkdir(parents=True, exist_ok=True)
    groups = sorted(family_assets.items(), key=lambda item: (-len(item[1]), item[0]))
    manifest = []
    for (pack, family), assets in groups[:100]:
        cols = min(5, len(assets)); rows = math.ceil(len(assets) / cols)
        sheet = Image.new("RGB", (cols * 256, 42 + rows * 250), "#171619")
        draw = ImageDraw.Draw(sheet); draw.text((10, 12), f"{pack} / {family} ({len(assets)})", fill="#eee5d6")
        for idx, (_, thumb) in enumerate(assets):
            sheet.paste(thumb, ((idx % cols) * 256, 42 + (idx // cols) * 250))
        filename = f"{safe_name(pack)}--{safe_name(family)}.jpg"
        sheet.save(FAMILIES / filename, quality=88, optimize=True)
        manifest.append({"pack":pack, "family":family, "count":len(assets), "file":filename})
    (OUT / "family-index.json").write_text(json.dumps({"schema":"genesis.kenney-family-sheets.v1", "families":manifest}, indent=2) + "\n")
    print(json.dumps({"thumbs":sum(len(items) for items in family_assets.values()), "familySheets":len(manifest)}))


if __name__ == "__main__":
    main()
