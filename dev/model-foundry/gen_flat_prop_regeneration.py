#!/usr/bin/env python3
"""Create the one-asset-per-call orthographic regeneration queue for extrusion sources."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).parent / "prop-source-manifest.json"
OUT_JSON = Path(__file__).parent / "flat-prop-regeneration-queue.json"
OUT_MD = Path(__file__).parent / "FLAT-PROP-REGENERATION-QUEUE.md"
PILOT_REALMS = {"fantasy"}


def prompt_for(entry: dict) -> str:
    subject = entry.get("description") or entry.get("name") or entry.get("slug")
    key = "#ff00ff" if entry["realm"] == "fantasy" else "#00ff00"
    return f"""Use case: stylized-concept
Asset type: source sprite for deterministic shallow 3D extrusion
Subject: {subject}
Realm art direction: {entry['realm']}
Projection: strict flat orthographic front elevation. Camera axis exactly perpendicular to the object's broad face. Zero perspective and zero foreshortening. Show no top face, side face, underside, floor, or horizon.
Composition: exactly one complete object, centered, upright in its authored mount orientation, generous even padding, no detached particles or secondary objects.
Geometry readability: a crisp closed outer silhouette suitable for contour tracing. Interior holes may be shown only when physically real. Do not fake thickness, bevel, or a three-quarter view in the painting; the geometry compiler adds depth later.
Lighting: nearly unlit/albedo presentation with very soft frontal illumination only. No cast shadow, contact shadow, rim light, bloom, reflection, ambient scene light, or directional shading that implies depth.
Backdrop: perfectly uniform solid {key} chroma key. No gradient, texture, floor plane, vignette, or key color inside the object.
Style: mature faceted low-poly tabletop-diorama prop. Strong adult silhouette, restrained palette, crisp polygonal albedo regions, tactile material wear, no cute or toy-like proportions. Material identity comes from color and surface marks rather than perspective or painted illumination. The runtime mesh will provide the final visible triangulation and lighting.
Avoid: isometric, three-quarter, oblique, tilted camera, visible thickness, visible top, visible side, painterly directional shading, baked specular highlights, fake normal-map lighting, dramatic lighting, scene dressing, text, watermark, frame crop."""


def main() -> None:
    source = json.loads(SOURCE.read_text())
    entries = [
        item for item in source["entries"]
        if item["constructionClass"] == "EXTRUDE"
        and item.get("extrusionEligibility") == "REGENERATE_FLAT"
        and item["realm"] in PILOT_REALMS
    ]
    queue = []
    for index, item in enumerate(entries, 1):
        queue.append({
            "queueId": f"flat-{index:03d}", "sourceId": item["id"], "realm": item["realm"],
            "name": item.get("name"), "sourceReferenceArt": item.get("art"),
            "referenceUse": "semantic/material reference only; do not preserve its perspective",
            "outputProjection": "FLAT_ORTHOGRAPHIC", "status": "QUEUED",
            "prompt": prompt_for(item),
            "qa": {
                "singleComponent": None, "flatProjection": None, "noVisibleTop": None,
                "noVisibleSide": None, "uniformKey": None, "edgeDespill": None,
            },
        })
    OUT_JSON.write_text(json.dumps({
        "schema": "genesis.flat-prop-regeneration-queue.v1", "pilotRealms": sorted(PILOT_REALMS),
        "deferredRealms": [realm for realm in source["coreRealms"] if realm not in PILOT_REALMS],
        "generationUnit": "ONE_ASSET_PER_MODEL_CALL", "artStyle": "MATURE_FACETED_LOW_POLY",
        "count": len(queue), "assets": queue,
    }, indent=2) + "\n")
    realm_counts = {realm: sum(item["realm"] == realm for item in queue) for realm in sorted(PILOT_REALMS)}
    OUT_MD.write_text(
        "# Flat prop regeneration queue\n\n"
        "**Pilot scope: Fantasy only. Gloom and Chrome are deferred until the Fantasy proof is accepted.**\n\n"
        "Legacy perspective sprites are reference art only. They cannot be extruded directly. "
        "Every queued source is regenerated in a separate model call, chroma-keyed, despilled, "
        "and projection-reviewed before its manifest may say `FLAT_ORTHOGRAPHIC_QA_PASS`.\n\n"
        f"Queued: **{len(queue)}** ({', '.join(f'{realm}: {count}' for realm, count in realm_counts.items())}).\n\n"
        "The machine-readable prompts and per-asset QA records live in "
        "`flat-prop-regeneration-queue.json`. Do not combine them into sprite sheets during "
        "generation; contact sheets are a review output only.\n"
    )
    print(json.dumps({"queued": len(queue), "byRealm": realm_counts}, indent=2))


if __name__ == "__main__":
    main()
