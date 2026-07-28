#!/usr/bin/env python3
"""Measure a CL-F07a terrain capture set (docs/TERRAIN-PROGRAM.md §4.3).

The CAPTURE-SIDE half of the executable gate. dev/verify-terrain-bench.mjs proves the chassis in
jsdom; this proves the FRAMES the chassis produced — the failures that only exist once a camera and
a renderer are involved, and which a jsdom harness structurally cannot see:

  * a frame that rendered nothing (the camera fitted past the far plane, or the field fell outside
    the frustum). This is not hypothetical — the first 72-degree strategic pass of this very bench
    came back as an empty brown viewport, and no green unit test noticed.
  * a frame that rendered only PART of its field. Round 4: the 24x24 sheet shipped three fix rounds
    with half its cells clipped away, and every existing number agreed with the surviving half.
    Every declared cell top is now projected through the camera that frame was taken at and the
    frame is sampled there, so a rendered footprint is compared to a declared extent rather than
    merely being asked whether it is non-empty.
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
import math
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

# ─── THE PIXEL-COVERAGE GATE (CL-F07a round 4) ────────────────────────────────────────────────
# Every gate before this one could see WHETHER something rendered. None could see whether ALL of it
# rendered. The 24x24 sheet shipped three fix rounds with half its cells clipped away by a stale far
# plane while every number in the receipt — cells 564, census 564, edge density, terrain luma — was
# correct, because all of them are satisfied by the half that survived.
#
# So: project EVERY declared cell's top-centre through the camera the frame was actually taken at,
# and sample the frame there. A declared cell that lands on backdrop was declared and not drawn.
# Half-missing is now exactly as countable as all-missing.
COVERAGE_MIN_PCT = 99.0            # per scene, per gated frame, of provably-visible cells
COVERAGE_FRAMED_MIN_PCT = 99.0     # the frame must also CONTAIN the field it claims to show
COVERAGE_PLATE_TOLERANCE = 12      # |dR|+|dG|+|dB| between the frame and its backdrop plate.
                                   # Two renders of the same pose agree to the bit where nothing
                                   # changed, so this is noise slack, not a tuning knob. Drawn
                                   # terrain measures tens to hundreds away from its own plate;
                                   # the measured distribution is reported per frame.
COVERAGE_MARCH_STEP = 0.2          # world units along the view ray for the self-occlusion walk
COVERAGE_MARCH_EPS = 0.03          # slack so a cell's own rim never occludes itself
COVERAGE_MARCH_START = 0.55        # start past the source cell's own half-width
# The frames the coverage gate reads: (probe key carrying THAT frame's camera, frame tag, plate).
# The strategic frame is a different pose and needs its own plate; the settled and clean production
# frames share a pose and a canvas rect (verified in every receipt) and so share one plate.
COVERAGE_FRAMES = (
    ("settled", "02-settled-production", "production"),
    ("strategic", "03-settled-strategic", "strategic"),
    ("clean", "04-clean-production", "production"),
)


def _m4_apply(e, v):
    """4x4 (three.js column-major .elements) times a vec4."""
    x, y, z, w = v
    return (
        e[0] * x + e[4] * y + e[8] * z + e[12] * w,
        e[1] * x + e[5] * y + e[9] * z + e[13] * w,
        e[2] * x + e[6] * y + e[10] * z + e[14] * w,
        e[3] * x + e[7] * y + e[11] * z + e[15] * w,
    )


def project_to_frame(proj, point):
    """World point -> (device px, device py, depth along the view axis), or None if behind camera.

    Uses the renderer's OWN two matrices as recorded at probe time. Nothing here reconstructs a
    projection from fov/aspect: a check that re-derives the camera is checking its own arithmetic,
    not the picture.
    """
    rect = proj.get("canvasRect")
    if not rect:
        return None
    view = _m4_apply(proj["viewMatrix"], (point[0], point[1], point[2], 1.0))
    clip = _m4_apply(proj["projectionMatrix"], view)
    if clip[3] <= 1e-9:
        return None
    ndc_x, ndc_y = clip[0] / clip[3], clip[1] / clip[3]
    dpr = proj.get("devicePixelRatio") or 1
    px = (rect["x"] + (ndc_x * 0.5 + 0.5) * rect["width"]) * dpr
    py = (rect["y"] + (0.5 - ndc_y * 0.5) * rect["height"]) * dpr
    return px, py, -view[2]


def _self_occlusion(tops, min_x, min_z, camera):
    """Which declared cells can SEE the camera over the field's own heightfield.

    Honest, not assumed: march the ray from each cell's top-centre toward the camera and stop at the
    first sample that lies inside another column. Volumes (thicket / trunk field / fog) are not
    marched — they are themselves rendered content, so a cell hidden behind one still samples a
    non-backdrop pixel; missing them can only leave a cell IN the denominator, never take one out.
    """
    max_x = min_x + (max(k[0] for k in tops) + 1) if tops else min_x
    max_z = min_z + (max(k[1] for k in tops) + 1) if tops else min_z
    out = {}
    cx0, cy0, cz0 = camera
    for key, (wx, wy, wz) in tops.items():
        dx, dy, dz = cx0 - wx, cy0 - wy, cz0 - wz
        length = math.sqrt(dx * dx + dy * dy + dz * dz) or 1.0
        dx, dy, dz = dx / length, dy / length, dz / length
        t = COVERAGE_MARCH_START
        blocked = False
        while t < length:
            qx, qy, qz = wx + dx * t, wy + dy * t, wz + dz * t
            if qx < min_x or qx > max_x or qz < min_z or qz > max_z:
                break
            hit = tops.get((int(math.floor(qx - min_x)), int(math.floor(qz - min_z))))
            if hit is not None and qy < hit[1] - COVERAGE_MARCH_EPS:
                blocked = True
                break
            t += COVERAGE_MARCH_STEP
        out[key] = not blocked
    return out


def _canvas_box(img, proj):
    """The canvas's own rectangle inside the screenshot, in device pixels."""
    rect = proj["canvasRect"]
    dpr = proj.get("devicePixelRatio") or 1
    return (max(0, int(rect["x"] * dpr)), max(0, int(rect["y"] * dpr)),
            min(img.size[0], int((rect["x"] + rect["width"]) * dpr)),
            min(img.size[1], int((rect["y"] + rect["height"]) * dpr)))


def frame_coverage(path, plate_path, terrain, proj):
    """Declared extent vs rendered footprint, in pixels, for one frame.

    'Drawn' is decided against the frame's own BACKDROP PLATE — the identical render with the bench
    hidden — not against a modal colour. The modal-colour version of this test inverted itself the
    moment the field filled the frame (the ground became the most common colour and every flat cell
    read as 'nothing'), and it could not survive the backdrop's vignette gradient, which spans 55
    luma corner to centre.
    """
    if not proj or not proj.get("canvasRect") or not proj.get("projectionMatrix"):
        return {"measured": False, "reason": "no camera projection recorded for this frame"}
    fields = terrain.get("fields") or []
    if not any(f.get("declaredCellTops") for f in fields):
        return {"measured": False, "reason": "receipt carries no declared cell tops"}
    if not plate_path or not os.path.exists(plate_path):
        return {"measured": False, "reason": "no backdrop plate banked for this pose"}
    img = Image.open(path).convert("RGB")
    plate = Image.open(plate_path).convert("RGB")
    if plate.size != img.size:
        return {"measured": False, "reason": "backdrop plate is a different size from the frame"}
    W, H = img.size
    px = img.load()
    qx_plate = plate.load()
    box = _canvas_box(img, proj)
    bounds = {b["id"]: b for b in (terrain.get("fieldWorldBounds") or [])}
    camera = proj.get("position") or [0, 0, 0]

    declared = 0
    out_of_frame = 0
    occluded = 0
    visible = 0
    covered = 0
    misses = []
    depths_missing = []
    depths_covered = []
    dists = []
    for field in fields:
        rows = field.get("declaredCellTops") or []
        if not rows:
            continue
        tops = {(r[0], r[1]): (r[2], r[3], r[4]) for r in rows}
        b = bounds.get(field.get("id")) or {}
        min_x = b.get("minX", min(r[2] for r in rows) - 0.5)
        min_z = b.get("minZ", min(r[4] for r in rows) - 0.5)
        seen = _self_occlusion(tops, min_x, min_z, camera)
        for r in rows:
            declared += 1
            key = (r[0], r[1])
            shot = project_to_frame(proj, (r[2], r[3], r[4]))
            if shot is None:
                out_of_frame += 1
                continue
            sx, sy, depth = shot
            if not (box[0] <= sx < box[2] and box[1] <= sy < box[3]):
                out_of_frame += 1
                continue
            if not seen.get(key, True):
                occluded += 1
                continue
            visible += 1
            # majority of a 3x3 patch, so a cell is never judged on one edge pixel
            hits, dist_here = 0, 0
            ix, iy = int(round(sx)), int(round(sy))
            for oy in (-1, 0, 1):
                for ox in (-1, 0, 1):
                    qx, qy = min(W - 1, max(0, ix + ox)), min(H - 1, max(0, iy + oy))
                    c, e = px[qx, qy], qx_plate[qx, qy]
                    d = abs(c[0] - e[0]) + abs(c[1] - e[1]) + abs(c[2] - e[2])
                    dist_here = max(dist_here, d)
                    if d > COVERAGE_PLATE_TOLERANCE:
                        hits += 1
            dists.append(dist_here)
            if hits >= 5:
                covered += 1
                depths_covered.append(depth)
            else:
                depths_missing.append(depth)
                if len(misses) < 8:
                    misses.append({"field": field.get("id"), "cell": [r[0], r[1]],
                                   "world": [r[2], r[3], r[4]], "px": [round(sx, 1), round(sy, 1)],
                                   "depthFromCamera": round(depth, 3),
                                   "maxPlateDistance": dist_here})
    result = {
        "measured": True,
        "declaredCells": declared,
        "outOfFrame": out_of_frame,
        "selfOccluded": occluded,
        "visibleCells": visible,
        "coveredCells": covered,
        "coveragePct": round(100.0 * covered / visible, 3) if visible else 0.0,
        "framedPct": round(100.0 * (declared - out_of_frame) / declared, 3) if declared else 0.0,
        "missingCells": visible - covered,
        "missingSample": misses,
        "plate": os.path.basename(plate_path),
        # the separation the verdict rests on: how far a sampled cell sits from its own plate
        "plateDistanceP05": sorted(dists)[int(len(dists) * 0.05)] if dists else None,
        "plateDistanceP50": sorted(dists)[int(len(dists) * 0.50)] if dists else None,
        "cameraFar": proj.get("far"),
        "cameraNear": proj.get("near"),
        "clayZoom": proj.get("clayZoom"),
    }
    # The far plane names itself: if what is missing is exactly what is deeper than `far`, the frame
    # is telling you which number cut it. Kept as a REPORTED diagnosis, never as an excuse.
    if depths_missing:
        result["missingDepthRange"] = [round(min(depths_missing), 3), round(max(depths_missing), 3)]
        result["coveredDepthRange"] = ([round(min(depths_covered), 3), round(max(depths_covered), 3)]
                                       if depths_covered else None)
        far = proj.get("far")
        if far:
            beyond = sum(1 for d in depths_missing if d > far)
            result["missingBeyondFarPlane"] = beyond
            result["missingBeyondFarPlanePct"] = round(100.0 * beyond / len(depths_missing), 2)
    return result


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
        # --- THE PIXEL-COVERAGE GATE: declared extent vs rendered footprint ------------------
        # Run on every gated frame of every set, not only on the one that was reported broken —
        # the kidney scenes could have been losing cells inside their designed-irregular outlines
        # with nobody counting, and "roughly half" must be as countable as "all".
        coverage = {}
        plates = cap.get("backdropPlates") or receipt.get("backdropPlates") or {}
        for probe_key, frame_tag, plate_key in COVERAGE_FRAMES:
            name = next((n for n in cap["frames"] if frame_tag in n), None)
            if not name:
                continue
            path = os.path.join(capture_dir, name)
            if not os.path.exists(path):
                continue
            probe = receipt.get(probe_key) or {}
            probe_terrain = probe.get("terrain") or {}
            plate_name = plates.get(plate_key)
            plate_path = os.path.join(capture_dir, plate_name) if plate_name else None
            cov = frame_coverage(path, plate_path, probe_terrain,
                                 probe_terrain.get("cameraProjection"))
            coverage[probe_key] = cov
            if not cov.get("measured"):
                fail("%s: %s frame cannot be coverage-checked (%s) — a frame whose camera was not "
                     "recorded cannot be compared to the extent it claims to show"
                     % (label_of(cap), probe_key, cov.get("reason")))
                continue
            if cov["framedPct"] < COVERAGE_FRAMED_MIN_PCT:
                fail("%s: %s frame FRAMES only %.1f%% of the declared field (%d of %d cells project "
                     "outside the canvas) — the camera fit crops the proof"
                     % (label_of(cap), probe_key, cov["framedPct"], cov["outOfFrame"],
                        cov["declaredCells"]))
            if cov["coveragePct"] < COVERAGE_MIN_PCT:
                extra = ""
                if cov.get("missingBeyondFarPlanePct") is not None:
                    extra = (" · %.0f%% of the missing cells lie beyond the camera's far plane "
                             "(far=%.2f, missing depth %s)"
                             % (cov["missingBeyondFarPlanePct"], cov.get("cameraFar") or 0,
                                cov.get("missingDepthRange")))
                fail("%s: %s frame DREW only %.2f%% of its visible declared cells (%d of %d; %d "
                     "declared cells landed on backdrop)%s"
                     % (label_of(cap), probe_key, cov["coveragePct"], cov["coveredCells"],
                        cov["visibleCells"], cov["missingCells"], extra))
        scene["coverage"] = coverage
        prod_cov = coverage.get("clean") or coverage.get("settled") or {}
        scene["coveragePct"] = prod_cov.get("coveragePct")
        scene["coverageMissing"] = prod_cov.get("missingCells")

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
    print("  pixel coverage — declared cell tops projected through each frame's own camera:")
    for s in report["scenes"]:
        cov = s.get("coverage") or {}
        cells = []
        for key in ("settled", "strategic", "clean"):
            c = cov.get(key)
            if not c or not c.get("measured"):
                cells.append("%s=n/a" % key)
                continue
            cells.append("%s=%6.2f%% (%d/%d vis, %d framed-out)"
                         % (key, c["coveragePct"], c["coveredCells"], c["visibleCells"],
                            c["outOfFrame"]))
        print("    %-26s %s" % (s.get("label") or s["sceneId"], "  ".join(cells)))
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
