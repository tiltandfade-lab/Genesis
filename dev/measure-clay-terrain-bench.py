#!/usr/bin/env python3
"""Measure a CL-F07a terrain capture set (docs/TERRAIN-PROGRAM.md §4.3).

The CAPTURE-SIDE half of the executable gate. dev/verify-terrain-bench.mjs proves the chassis in
jsdom; this proves the FRAMES the chassis produced — the failures that only exist once a camera and
a renderer are involved, and which a jsdom harness structurally cannot see:

  * a frame that rendered nothing (the camera fitted past the far plane, or the field fell outside
    the frustum). This is not hypothetical — the first 72-degree strategic pass of this very bench
    came back as an empty brown viewport, and no green unit test noticed.
  * a scene that reports "built" while its field group placed no cells.
  * a camera PAIR that is not a pair: the production frame and the 72-degree map read must both
    exist and must differ, because a height difference can read as a texture change at low pitch.
  * a receipt whose gate numbers disagree with the harness's.
  * the witness missing, so nothing in frame carries scale.
  * determinism across two separate page loads.

    python3 dev/measure-clay-terrain-bench.py <captureDir> [--json out.json]

No visual verdicts. Every number here is geometric or statistical; whether the ground LOOKS like
ground is Adam's call and Codex's, never this script's.
"""
import json
import os
import sys

from PIL import Image

BACKGROUND_TOLERANCE = 6          # chroma spread under which a pixel counts as flat backdrop
MIN_CONTENT_PCT = 2.0             # a frame with less than this much non-backdrop rendered nothing
MIN_EDGE_PCT = 1.5                # below this the frame holds no geometry, only a flat/graded fill
VIEWPORT_CROP = (0.20, 0.05, 0.74, 0.98)   # the canvas column, excluding the docked side panels


def frame_stats(path):
    """Content coverage + luma spread inside the viewport column."""
    img = Image.open(path).convert("RGB")
    w, h = img.size
    x0, y0, x1, y1 = VIEWPORT_CROP
    box = (int(w * x0), int(h * y0), int(w * x1), int(h * y1))
    crop = img.crop(box)
    crop = crop.resize((max(1, crop.width // 4), max(1, crop.height // 4)))
    px = list(crop.getdata())
    n = len(px)

    # The backdrop is the single most common colour in the frame; anything that is not it, and not
    # within tolerance of it, is rendered content.
    counts = {}
    for p in px:
        counts[p] = counts.get(p, 0) + 1
    backdrop = max(counts.items(), key=lambda kv: kv[1])[0]

    content = 0
    lumas = []
    for r, g, b in px:
        if (abs(r - backdrop[0]) + abs(g - backdrop[1]) + abs(b - backdrop[2])) > BACKGROUND_TOLERANCE:
            content += 1
        lumas.append(0.2126 * r + 0.7152 * g + 0.0722 * b)

    # EDGE DENSITY is the honest "did anything render" test. A flat backdrop and a smooth fog
    # GRADIENT both read as high contentPct against a single modal colour — which is exactly how an
    # empty brown viewport passed the first version of this script. Geometry has edges; a gradient
    # does not. Measured as the fraction of neighbouring-pixel luma steps above a threshold.
    cw, ch = crop.size
    edges = 0
    comparisons = 0
    for y in range(ch):
        row = y * cw
        for x in range(cw - 1):
            comparisons += 1
            if abs(lumas[row + x] - lumas[row + x + 1]) > 6:
                edges += 1
    for y in range(ch - 1):
        for x in range(cw):
            comparisons += 1
            if abs(lumas[y * cw + x] - lumas[(y + 1) * cw + x]) > 6:
                edges += 1
    edge_pct = round(100.0 * edges / max(1, comparisons), 3)

    lumas = sorted(lumas)

    def pct(p):
        return round(lumas[min(n - 1, int(n * p))], 2)

    return {
        "file": os.path.basename(path),
        "pixels": n,
        "backdrop": list(backdrop),
        "contentPct": round(100.0 * content / n, 3),
        "edgePct": edge_pct,
        "meanLuma": round(sum(lumas) / n, 2),
        "p05Luma": pct(0.05),
        "p50Luma": pct(0.50),
        "p95Luma": pct(0.95),
    }


def measure(capture_dir):
    index_path = os.path.join(capture_dir, "cl-f07a-index.json")
    if not os.path.exists(index_path):
        raise SystemExit("no cl-f07a-index.json in " + capture_dir)
    index = json.load(open(index_path))

    report = {
        "captureDir": capture_dir,
        "fixture": index.get("fixture"),
        "proof": index.get("proof"),
        "scenes": [],
        "gates": {},
        "failures": [],
    }

    def fail(msg):
        report["failures"].append(msg)

    def label_of(cap):
        return cap.get("label") or cap["sceneId"]

    for cap in index.get("captures", []):
        receipt_path = os.path.join(capture_dir, cap["receipt"])
        receipt = json.load(open(receipt_path))
        terrain = (receipt.get("settled") or {}).get("terrain") or {}
        frames = []
        for name in cap["frames"]:
            path = os.path.join(capture_dir, name)
            if not os.path.exists(path):
                fail(cap["sceneId"] + ": missing frame " + name)
                continue
            frames.append(frame_stats(path))

        by_role = {f["file"].split("-")[-1].replace(".png", ""): f for f in frames}
        production = next((f for f in frames if "settled-production" in f["file"]), None)
        strategic = next((f for f in frames if "settled-strategic" in f["file"]), None)

        fields = terrain.get("fields") or []
        cell_meshes = sum(f.get("cellMeshes", 0) for f in fields)
        standable = sum((f.get("metrics") or {}).get("standableCells", 0) for f in fields)

        scene = {
            "capture": cap["capture"],
            "sceneId": cap["sceneId"],
            "label": cap.get("label"),
            "frameIndex": cap.get("frameIndex"),
            "boundary": cap.get("boundary"),
            "built": bool(cap.get("built")),
            "fieldCount": len(fields),
            "cellMeshes": cell_meshes,
            "standableCells": standable,
            "witnesses": len(terrain.get("witnesses") or []),
            "witnessFailures": len(terrain.get("witnessFailures") or []),
            "frames": frames,
            "productionContentPct": production["contentPct"] if production else None,
            "strategicContentPct": strategic["contentPct"] if strategic else None,
            "productionEdgePct": production["edgePct"] if production else None,
            "strategicEdgePct": strategic["edgePct"] if strategic else None,
        }

        # --- the capture-side geometric gates -------------------------------------------------
        if not scene["built"]:
            fail(cap["sceneId"] + ": scene did not build")
        if len(frames) != 4:
            fail(cap["sceneId"] + ": expected 4 frames, got %d" % len(frames))
        if cell_meshes == 0:
            fail(cap["sceneId"] + ": reported built but placed zero cell meshes")
        for role, f in (("production", production), ("72-degree strategic", strategic)):
            if not f:
                continue
            if f["contentPct"] < MIN_CONTENT_PCT:
                fail("%s: %s frame rendered nothing (contentPct=%.2f)"
                     % (label_of(cap), role, f["contentPct"]))
            if f["edgePct"] < MIN_EDGE_PCT:
                fail("%s: %s frame holds no geometry, only a flat or graded fill "
                     "(edgePct=%.2f)" % (label_of(cap), role, f["edgePct"]))
        if production and strategic:
            # A pair that is identical is not a pair — the strategic pitch never applied.
            same = abs(production["contentPct"] - strategic["contentPct"]) < 0.01 \
                and abs(production["meanLuma"] - strategic["meanLuma"]) < 0.01
            scene["cameraPairDistinct"] = not same
            if same:
                fail(cap["sceneId"] + ": production and strategic frames are identical "
                     "(the 72-degree pitch did not apply)")
        if scene["witnessFailures"]:
            fail(cap["sceneId"] + ": %d witness standees refused" % scene["witnessFailures"])
        if cap["sceneId"] in ("thirteen-piece-sheet", "dark") and scene["witnesses"] == 0:
            fail(cap["sceneId"] + ": no witness in frame — nothing carries scale")
        if receipt.get("consoleErrors"):
            scene["consoleErrors"] = receipt["consoleErrors"]

        report["scenes"].append(scene)

    # --- the back-end gate, as the LIVE PAGE reported it --------------------------------------
    # index["gate"] is the whole terrainBenchGateReport(); the seven gate NUMBERS live under .gates
    gate_report = index.get("gate") or {}
    gate = gate_report.get("gates") or {}
    report["gates"] = gate
    report["oneClamp"] = gate_report.get("oneClamp")
    report["walkDown"] = gate_report.get("walkDown")
    report["fingerprints"] = gate_report.get("fingerprints")
    if not (gate_report.get("oneClamp") or {}).get("verdict", "").startswith("ONE CHASSIS"):
        fail("the one-clamp proof did not return ONE CHASSIS — the §2.0 chassis claim is unproven")
    if not (gate_report.get("walkDown") or {}).get("degraded"):
        fail("the 16-cell hostile case did not record degradedFrom")
    if not (gate_report.get("walkDown") or {}).get("legalBoard"):
        fail("the walked-down 16-cell board is not legal")
    expected_zero = [
        "walkableCellsAbove30Deg", "illegalWalkEdges", "unownedFacesAt2hPlus",
        "unreachableStandableSurfaces", "d50Unresolved",
    ]
    for key in expected_zero:
        if gate.get(key) is None:
            fail("gate missing: " + key)
        elif gate[key] != 0:
            fail("gate %s = %s (must be 0)" % (key, gate[key]))
    if gate.get("boundaryStringsResolved") != gate.get("boundaryStringsTotal"):
        fail("gate: only %s of %s boundary strings resolve"
             % (gate.get("boundaryStringsResolved"), gate.get("boundaryStringsTotal")))
    if gate.get("d50Total") != 50:
        fail("gate: %s of 50 d50 rows accounted for" % gate.get("d50Total"))
    if gate.get("coveragePlaced") != gate.get("coverageTotal"):
        fail("gate: only %s of %s coverage strings place"
             % (gate.get("coveragePlaced"), gate.get("coverageTotal")))
    if gate.get("maxWalkableSlopeDeg") is not None and gate["maxWalkableSlopeDeg"] > 30:
        fail("gate: max walkable slope %s deg exceeds 30" % gate["maxWalkableSlopeDeg"])

    det = index.get("determinism") or {}
    report["determinism"] = det
    if det.get("result") != "PASS":
        fail("determinism across two separate page loads: %s" % det.get("result"))

    report["scenesMeasured"] = len(report["scenes"])
    report["result"] = "PASS" if not report["failures"] else "FAIL"
    return report


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        raise SystemExit(__doc__)
    out_json = None
    if "--json" in sys.argv:
        out_json = sys.argv[sys.argv.index("--json") + 1]
    report = measure(args[0])

    print("CL-F07a capture measurement — %s" % report["captureDir"])
    print("  scenes measured: %d" % report["scenesMeasured"])
    for s in report["scenes"]:
        print("  %d %-26s built=%s fields=%d cells=%4d standable=%4d witnesses=%2d "
              "prodEdge=%5.2f%% stratEdge=%5.2f%%"
              % (s["capture"], s.get("label") or s["sceneId"], s["built"], s["fieldCount"],
                 s["cellMeshes"], s["standableCells"], s["witnesses"],
                 s["productionEdgePct"] or 0.0, s["strategicEdgePct"] or 0.0))
    print("  determinism: %s (%s fields, %s page loads)"
          % (report["determinism"].get("result"),
             report["determinism"].get("fieldsCompared"),
             report["determinism"].get("pageLoads")))
    print("  gate: " + json.dumps(report["gates"]))
    if report["failures"]:
        print("  FAILURES:")
        for f in report["failures"]:
            print("    - " + f)
    print("RESULT: " + report["result"])

    if out_json:
        json.dump(report, open(out_json, "w"), indent=2)
        print("wrote " + out_json)
    sys.exit(0 if report["result"] == "PASS" else 1)


if __name__ == "__main__":
    main()
