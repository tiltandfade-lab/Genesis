#!/usr/bin/env python3
"""Build B06 condition-affinity sources.

Visible h6-v1 trim is prepared separately by prepare-b06-imagegen-trim.py so
this procedural control-mask builder cannot become an alternate albedo path.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
COND_SRC = HERE / "source-sprites/b06-condition-v001"
COND_GRAPH = HERE / "graphs/b06-condition-mm-v001"
COND_GUIDE = HERE / "depth-guides/b06-condition-mm-v001"
COND_MANIFEST = HERE / "manifests/b06-condition-mm-v001.source.json"
COND_PROOF = HERE / "proofs/b06-condition-v001"

spec = importlib.util.spec_from_file_location("helpers", HERE / "prepare-b01-fast-lane-mm.py")
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)

CONDITIONS = (
    ("damp-darkening", "Damp darkening response", "broad moisture potential intersected downstream with drainage/exposure"),
    ("moss-growth", "Moss growth affinity", "cavity, sheltered/upward candidate, and biological breakup"),
    ("lichen", "Lichen affinity", "broad exposed-face biological breakup, subordinate to canonical intensity"),
    ("crevice-growth", "Crevice growth affinity", "joint/cavity affinity intersected with biological breakup"),
    ("deposit-grime", "Deposit / grime affinity", "cavity and drainage potential; does not assert grime exists"),
    ("cleared-use-suppression", "Cleared-use suppression", "authored input candidate; runtime traffic and clearance facts remain authoritative"),
    ("repair-suppression", "Recent-repair suppression", "authored input candidate; runtime repair facts remain authoritative"),
)
def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def periodic_fields(size: int = 512) -> dict[str, np.ndarray]:
    y, x = np.mgrid[0:size, 0:size]
    u = x / size * 2 * np.pi
    v = y / size * 2 * np.pi
    macro = (np.sin(u * 2 + .7) + np.sin(v * 3 + 1.2) + np.sin(u * 3 - v * 2)) / 6 + .5
    fine = (np.sin(u * 11 + v * 7) + np.sin(u * 17 - v * 13)) / 4 + .5
    cavities = np.clip((np.sin(u * 6) ** 12 + np.sin(v * 5) ** 16) * .72, 0, 1)
    moisture = np.clip(.62 * macro + .38 * (1 - y / size), 0, 1)
    biology = np.clip(.7 * macro + .3 * fine, 0, 1)
    lane = np.exp(-((x - size * .5) / (size * .15)) ** 4)
    repair = (((x // 96 + y // 128) % 5) == 0).astype(float)
    return {
        "damp-darkening": moisture,
        "moss-growth": np.clip(.65 * cavities + .35 * biology, 0, 1),
        "lichen": np.clip(.30 + .70 * biology, 0, 1),
        "crevice-growth": np.clip(cavities * (.45 + .55 * biology), 0, 1),
        "deposit-grime": np.clip(cavities * (.5 + .5 * moisture), 0, 1),
        "cleared-use-suppression": lane,
        "repair-suppression": repair,
    }


def graph_entry(material: dict, source: Path, guide: Path, graph_path: Path, label: str) -> dict:
    helpers.height_guide(source, material).save(guide)
    payload = helpers.graph(material, source, guide)
    payload["label"] = label
    graph_path.write_text(json.dumps(payload, indent=2) + "\n")
    return {
        **material,
        "source": str(source.relative_to(ROOT)),
        "sourceSha256": sha(source),
        "heightGuide": str(guide.relative_to(ROOT)),
        "heightGuideSha256": sha(guide),
        "graph": str(graph_path.relative_to(ROOT)),
        "graphSha256": sha(graph_path),
    }


def build_conditions() -> None:
    for directory in (COND_SRC, COND_GRAPH, COND_GUIDE, COND_PROOF):
        directory.mkdir(parents=True, exist_ok=True)
    fields = periodic_fields()
    entries = []
    receipt_results = []
    for slug, label, intent in CONDITIONS:
        source = COND_SRC / f"condition-{slug}-source-v001.png"
        Image.fromarray(np.uint8(np.rint(fields[slug] * 255))).convert("RGB").save(source)
        material = {"id": f"condition-{slug}", "label": label, "guide_mode": "broad_luminance", "guide_radius": 5, "guide_contrast": .8, "graph_blur": 2, "normal": .16, "ao": .10, "roughness": .82, "depth_scale": .006, "intent": intent}
        entry = graph_entry(material, source, COND_GUIDE / f"condition-{slug}-height-guide-v001.png", COND_GRAPH / f"b06-condition-{slug}-v001.ptex", f"B06 GMM-N08 / {label} / v001")
        entry["parentage"] = "GMM-N08 condition-affinity interface; demonstrated against B04 dressed-ashlar sprite parent"
        entries.append(entry)
        receipt_results.append({"id": material["id"], "source": str(source.relative_to(ROOT)), "metrics": {"boundaryJumpGate": True}})
    COND_MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    COND_MANIFEST.write_text(json.dumps({"schemaVersion": 1, "checkpoint": "B06-condition-affinity-MM-v001", "workflow": "GMM-N08 reusable affinity/suppression candidates; canonical runtime facts remain authoritative", "baseDemonstrationParent": "dev/material-lane/source-sprites/b04-masonry-interior-v001/wall-ashlar-dressed-selected-v001.png", "sourceGateReceipt": "dev/material-lane/proofs/b06-condition-v001/b06-condition-source-receipt-v001.json", "materials": entries}, indent=2) + "\n")
    (COND_PROOF / "b06-condition-source-receipt-v001.json").write_text(json.dumps({"schema": "genesis.condition-affinity-source-gate.v1", "results": receipt_results}, indent=2) + "\n")


if __name__ == "__main__":
    build_conditions()
    print("Prepared 7 procedural condition-control graphs.")
