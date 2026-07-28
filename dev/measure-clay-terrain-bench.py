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
TERRAIN_TOLERANCE = 18            # distance from the modal backdrop colour that counts as terrain
MIN_TERRAIN_PX = 400              # below this the "terrain region" is too small to measure honestly
LIT_MIN_TERRAIN_P50 = 45.0        # calibrated on cda3784c's genuinely lit renders (p50 65.9 / 86.0)
DARK_MAX_TERRAIN_P50 = 40.0       # the dark case must be dark WHERE THE TERRAIN IS
MIN_CONTENT_PCT = 2.0             # a frame with less than this much non-backdrop rendered nothing
MIN_EDGE_PCT = 1.5                # on the fixed 200x200 grid an empty region measures 0.00% and a
                                  # frame with modelled form measures 4.5-6% — a 3x margin either way
MIN_LUMA_SPREAD = 12.0            # p95-p05: a frame with no modelled form is luma-flat
WITNESS_MAX_GAP = 0.2             # world units between a standee's foot and the ground it stands on
DARK_MAX_P95_LUMA = 110.0         # the dark case must actually be dark, not merely labelled dark
VIEWPORT_CROP = (0.20, 0.05, 0.74, 0.98)   # the canvas column, excluding the docked side panels


def frame_stats(path):
    """Content coverage + luma spread inside the viewport column."""
    img = Image.open(path).convert("RGB")
    w, h = img.size
    x0, y0, x1, y1 = VIEWPORT_CROP
    box = (int(w * x0), int(h * y0), int(w * x1), int(h * y1))
    crop = img.crop(box)
    # FIXED sampling grid, not a //4 divide. Dividing a 1400px-wide crop by 4 leaves 350px of
    # smooth fog gradient whose neighbouring pixels differ by ~1 luma step each — enough of them
    # cross a 6-luma threshold to fake ~2% "edges" on a frame with nothing in it, which is how an
    # empty rectangle scored 2.06 against a 3.0 floor. Resampling to a fixed 200x200 collapses the
    # gradient (an empty region measures 0.00%) while modelled form still measures 4.5-6%.
    crop = crop.resize((200, 200))
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
    terrain_lumas = []
    for r, g, b in px:
        dist = abs(r - backdrop[0]) + abs(g - backdrop[1]) + abs(b - backdrop[2])
        if dist > BACKGROUND_TOLERANCE:
            content += 1
        luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
        lumas.append(luma)
        # THE TERRAIN'S OWN SCREEN REGION. Measuring luma over the whole frame let a black,
        # unlit field pass a "lit" check on the strength of the pale backdrop behind it: the
        # whole-frame p50 was 117 for a good render AND for a near-black one, identical to the
        # decimal. Everything that is not the modal backdrop colour is what was actually drawn.
        if dist > TERRAIN_TOLERANCE:
            terrain_lumas.append(luma)

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

    terrain_sorted = sorted(terrain_lumas)

    def tpct(p):
        if not terrain_sorted:
            return None
        return round(terrain_sorted[min(len(terrain_sorted) - 1, int(len(terrain_sorted) * p))], 2)

    return {
        "file": os.path.basename(path),
        "pixels": n,
        "backdrop": list(backdrop),
        "terrainPx": len(terrain_sorted),
        "terrainP05Luma": tpct(0.05),
        "terrainP50Luma": tpct(0.50),
        "terrainP95Luma": tpct(0.95),
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
            spread = f["p95Luma"] - f["p05Luma"]
            f["lumaSpread"] = round(spread, 2)
            if spread < MIN_LUMA_SPREAD:
                fail("%s: %s frame is luma-flat (p95-p05 = %.1f) — the terrain is unlit or "
                     "absent, whatever else is in the frame" % (label_of(cap), role, spread))
        if production and strategic:
            # A pair that is identical is not a pair — the strategic pitch never applied.
            same = abs(production["contentPct"] - strategic["contentPct"]) < 0.01 \
                and abs(production["meanLuma"] - strategic["meanLuma"]) < 0.01
            scene["cameraPairDistinct"] = not same
            if same:
                fail(cap["sceneId"] + ": production and strategic frames are identical "
                     "(the 72-degree pitch did not apply)")
        # --- the three capture-side defects, now measured on every set --------------------
        max_gap = terrain.get("witnessMaxGap")
        scene["witnessMaxGap"] = max_gap
        if max_gap is not None and max_gap > WITNESS_MAX_GAP:
            fail("%s: a witness is airborne (max gap %.3f > %.3f) — 0 refusals must also "
                 "mean 0 levitations" % (label_of(cap), max_gap, WITNESS_MAX_GAP))

        requested = terrain.get("requestedLightRecipe")
        if not requested:
            fail("%s: no light case declared for this scene — every bench scene must declare one"
                 % label_of(cap))
        applied = terrain.get("appliedLightRecipe")
        scene["requestedLightRecipe"] = requested
        scene["appliedLightRecipe"] = applied
        if requested and applied != requested:
            fail("%s: light recipe drift — requested %r, applied %r"
                 % (label_of(cap), requested, applied))
        if terrain.get("lightRecipeDrift"):
            fail("%s: the renderer reported light-recipe drift" % label_of(cap))

        # THE COUNTABLE FRAME CENSUS. "No figure in the frame except the bench's own witnesses",
        # and "no beam outside the piece that declared it", as numbers rather than as something a
        # reviewer has to catch in a 2x crop.
        census = terrain.get("frameCensus") or {}
        scene["frameCensus"] = census
        if not census:
            fail("%s: no frame census recorded" % label_of(cap))
        else:
            figures = census.get("witnessFigures", 0)
            foreign = census.get("foreignFigures", 0)
            placed = len(terrain.get("witnesses") or [])
            scene["figuresInScene"] = figures
            scene["foreignFigures"] = foreign
            if foreign:
                fail("%s: %d foreign figure(s) in frame — the bench may contain no figure except "
                     "its own witnesses" % (label_of(cap), foreign))
            if figures != placed:
                fail("%s: figures in scene (%d) != witnesses placed (%d)"
                     % (label_of(cap), figures, placed))
            stray = census.get("spansOutsideDeclaringBay", 0)
            scene["spansOutsideDeclaringBay"] = stray
            if stray:
                fail("%s: %d span beam(s) outside the piece that declared them — a beam floating "
                     "off the field" % (label_of(cap), stray))
            if census.get("terrainCells", 0) == 0:
                fail("%s: zero terrain cells in the frame census" % label_of(cap))

        host = terrain.get("hostSuppressed") or {}
        scene["hostSuppressed"] = host
        scene["foreignLightsNeutralized"] = len(terrain.get("foreignLightsNeutralized") or [])
        if not host:
            fail("%s: no host-chrome suppression recorded — room furniture may be in frame"
                 % label_of(cap))

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

    # LIT vs DARK, measured WHERE THE TERRAIN IS. The whole-frame version of this check passed a
    # near-black field on the strength of the backdrop behind it; these numbers come from the
    # terrain's own screen region and nothing else.
    lit_p50 = {}
    for sc in report["scenes"]:
        f = next((fr for fr in sc["frames"] if "settled-production" in fr["file"]), None)
        if not f:
            continue
        sc["terrainPx"] = f.get("terrainPx")
        sc["terrainP50Luma"] = f.get("terrainP50Luma")
        if not f.get("terrainPx") or f["terrainPx"] < MIN_TERRAIN_PX:
            fail("%s: terrain region is only %s px — nothing measurable was drawn"
                 % (sc.get("label") or sc["sceneId"], f.get("terrainPx")))
            continue
        declared = sc.get("appliedLightRecipe")
        if sc["sceneId"] == "dark":
            if f["terrainP50Luma"] > DARK_MAX_TERRAIN_P50:
                fail("dark: the terrain is not dark (terrain p50 %.1f > %.1f)"
                     % (f["terrainP50Luma"], DARK_MAX_TERRAIN_P50))
        else:
            lit_p50[sc.get("label") or sc["sceneId"]] = f["terrainP50Luma"]
            if f["terrainP50Luma"] < LIT_MIN_TERRAIN_P50:
                fail("%s: the terrain is UNLIT (terrain p50 %.1f < %.1f) — the frame's pale "
                     "backdrop is not illumination"
                     % (sc.get("label") or sc["sceneId"], f["terrainP50Luma"], LIT_MIN_TERRAIN_P50))
    report["litTerrainP50"] = lit_p50

    dark = next((s for s in report["scenes"] if s["sceneId"] == "dark"), None)
    if dark and lit_p50:
        dmax = dark.get("terrainP50Luma")
        lmin = min(lit_p50.values())
        if dmax is not None and dmax >= lmin:
            fail("dark: the dark terrain is not darker than the dimmest lit terrain "
                 "(%.1f vs %.1f)" % (dmax, lmin))

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
              "prodEdge=%5.2f%% stratEdge=%5.2f%% gap=%s light=%-6s fig=%s/%s stray=%s"
              % (s["capture"], s.get("label") or s["sceneId"], s["built"], s["fieldCount"],
                 s["cellMeshes"], s["standableCells"], s["witnesses"],
                 s["productionEdgePct"] or 0.0, s["strategicEdgePct"] or 0.0,
                 s.get("witnessMaxGap"), s.get("appliedLightRecipe") or "-",
                 s.get("figuresInScene"), s.get("foreignFigures"),
                 s.get("spansOutsideDeclaringBay")))
    print("  terrain-region p50 luma — lit: %s | dark: %s"
          % (", ".join("%s=%.1f" % (k.split("-", 1)[-1], v) for k, v in report.get("litTerrainP50", {}).items()),
             (next((s for s in report["scenes"] if s["sceneId"] == "dark"), {}) or {}).get("terrainP50Luma")))
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
