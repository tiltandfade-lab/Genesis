#!/usr/bin/env python3
"""Audit Kenney's current 3D catalog and optionally stage a Genesis-relevant shortlist in scratch.

The script never writes production assets. It captures official source URLs, page-declared CC0 state,
archive license evidence, format counts, and GLB inventories for later art-direction review.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import time
import urllib.request
import zipfile
from pathlib import Path


CATALOG_PAGES = [
    "https://kenney.nl/assets/category:3D",
    "https://kenney.nl/assets/category:3D/page:2",
    "https://kenney.nl/assets/category:3D/page:3",
    "https://kenney.nl/assets/category:3D/page:4",
]
SHORTLIST = {
    "modular-cave-kit": "procedural cave walls, openings, elevation and irregular-room grammar",
    "fantasy-town-kit": "medieval urban walls, roofs, doors, windows and building modulation",
    "castle-kit": "fortification, towers, battlements, gates and vertical construction",
    "survival-kit": "camp, wilderness, tools and improvised encounter props",
    "furniture-kit": "interior furnishing vocabulary and readable low-poly proportions",
    "building-kit": "modular structural parts and attachment grammar",
    "brick-kit": "small construction primitives for procedural recombination",
    "nature-kit": "trees, rocks, plants and wilderness silhouette grammar",
    "pirate-kit": "ropes, barrels, docks, ships and timber fortification vocabulary",
    "food-kit": "table dressing, provisions, loot and domestic scene specificity",
    "factory-kit": "chrome/industrial machinery, pipes and modular production-space grammar",
    "retro-fantasy-kit": "extremely simple fantasy silhouettes suitable for recipe extraction",
    "city-kit-industrial": "industrial urban structures and large-scale chrome realm vocabulary",
}


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "Genesis-offline-art-research/1.0"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return response.read()


def text(url: str) -> str:
    return fetch(url).decode("utf-8", errors="replace")


def detail_for(slug: str) -> dict:
    url = f"https://kenney.nl/assets/{slug}"
    page = text(url)
    title = re.search(r"<h1[^>]*>(.*?)</h1>", page, re.S)
    file_count = re.search(r"<td class='title text-muted'>Files</td>\s*<td>(\d+)×</td>", page, re.S)
    direct = re.search(r"id='donate-text' href='([^']+\.zip)'", page)
    versions = re.findall(r"<span class='type[^']*[^>]*>([^<]+)</span>", page)
    tags = re.findall(r"/assets/tag:([^']+)' class='tag'", page)
    return {
        "slug": slug,
        "title": html.unescape(re.sub(r"<[^>]+>", "", title.group(1)).strip()) if title else slug,
        "pageUrl": url,
        "declaredFiles": int(file_count.group(1)) if file_count else None,
        "declaredCc0": "Creative Commons CC0" in page,
        "downloadUrl": html.unescape(direct.group(1)) if direct else None,
        "latestVersion": versions[0].strip() if versions else None,
        "tags": sorted(set(tags)),
        "shortlistReason": SHORTLIST.get(slug),
    }


def archive_audit(pack: dict, out_dir: Path) -> dict:
    slug, url = pack["slug"], pack["downloadUrl"]
    zip_dir = out_dir / "zips"; zip_dir.mkdir(parents=True, exist_ok=True)
    archive_path = zip_dir / f"{slug}.zip"
    if not archive_path.exists():
        archive_path.write_bytes(fetch(url))
    extract_dir = out_dir / "glb" / slug; extract_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(archive_path) as archive:
        names = archive.namelist()
        glbs = [n for n in names if n.lower().endswith(".glb") and not n.endswith("/")]
        objs = [n for n in names if n.lower().endswith(".obj") and not n.endswith("/")]
        fbxs = [n for n in names if n.lower().endswith(".fbx") and not n.endswith("/")]
        license_names = [n for n in names if "license" in Path(n).name.lower()]
        license_text = "\n".join(archive.read(n).decode("utf-8", errors="replace") for n in license_names)
        for name in glbs:
            destination = extract_dir / Path(name).name
            if not destination.exists():
                destination.write_bytes(archive.read(name))
    return {
        "archiveBytes": archive_path.stat().st_size,
        "archiveSha256": __import__("hashlib").sha256(archive_path.read_bytes()).hexdigest(),
        "glbCount": len(glbs), "objCount": len(objs), "fbxCount": len(fbxs),
        "licenseFiles": license_names,
        "archiveLicenseMentionsCc0": "CC0" in license_text or "Creative Commons Zero" in license_text,
        "glbNames": sorted(Path(n).name for n in glbs),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out-dir", type=Path, default=Path("/private/tmp/genesis-offline-art-results/kenney"))
    parser.add_argument("--download-shortlist", action="store_true")
    args = parser.parse_args(); args.out_dir.mkdir(parents=True, exist_ok=True)

    slugs = []
    for page_url in CATALOG_PAGES:
        page = text(page_url)
        slugs.extend(re.findall(r"<h2><a href='https://kenney\.nl/assets/([^']+)'", page))
    slugs = sorted(set(slugs))

    packs = []
    for index, slug in enumerate(slugs):
        pack = detail_for(slug)
        if args.download_shortlist and slug in SHORTLIST and pack["downloadUrl"]:
            pack["archive"] = archive_audit(pack, args.out_dir)
        packs.append(pack)
        if index + 1 < len(slugs):
            time.sleep(0.04)

    report = {
        "schema": "genesis.kenney-catalog-audit.v1",
        "catalogPages": CATALOG_PAGES,
        "catalog3dPackCount": len(packs),
        "locallyPresentSlugs": ["graveyard-kit", "mini-dungeon", "modular-dungeon-kit"],
        "localCoverageFraction": round(3 / max(len(packs), 1), 5),
        "shortlist": sorted(SHORTLIST),
        "shortlistDownloaded": bool(args.download_shortlist),
        "packs": packs,
    }
    (args.out_dir / "catalog.json").write_text(json.dumps(report, indent=2) + "\n")
    summary = {
        "catalog3dPackCount": len(packs),
        "localCoverageFraction": report["localCoverageFraction"],
        "shortlistFound": sum(1 for p in packs if p["slug"] in SHORTLIST),
        "shortlistDownloaded": sum(1 for p in packs if "archive" in p),
        "shortlistGlbs": sum(p.get("archive", {}).get("glbCount", 0) for p in packs),
        "shortlistArchiveBytes": sum(p.get("archive", {}).get("archiveBytes", 0) for p in packs),
        "allDownloadedArchivesDeclareCc0": all(
            p["declaredCc0"] and p.get("archive", {}).get("archiveLicenseMentionsCc0", False)
            for p in packs if "archive" in p
        ),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
