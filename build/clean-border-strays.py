#!/usr/bin/env python3
"""Clean border-clipped stray blobs out of already-cut sprites (the 2026-07-22 fantasy
bleed audit lane -- dev/_bleed-audit/fantasy_bleed_audit.json).

WHAT THE AUDIT FOUND vs WHAT THE PIXELS SAY: the audit brief presumed the 16 flagged
fantasy sprites carried magenta-key residue and/or resize (stretch/squash) artifacts.
Forensics on the flagged components says otherwise, on both counts:
  - every stray is fully opaque (mean alpha 255 -- a resize artifact would carry partial
    alpha) with hard pixel-art edges;
  - none is magenta-family (mean magenta excess min(r,b)-g is NEGATIVE on all 16;
    magenta-family pixel share ~0) -- so not keying residue either;
  - every stray is art-colored (browns/grays/tans matching sheet art), shape-coherent,
    and clipped against the image border.
That signature is the padded-bbox crop in build/slice-sprites.py's crop_transparent():
the crop rectangle is the assigned component's bbox + padding, so any OTHER content that
poked into that rectangle -- a neighboring cell's limb, or the subject's own detached
detail field (bubbles, floating rocks, sparkles) whose outer members sat past the bbox --
survives keying as a disconnected blob amputated mid-shape by the crop border. A blob cut
off by the border can never render as intended art, whichever cell it came from, so the
fix is the same for both classes: drop it from the finished sprite.

WHY THIS LAYER (post-cut mask), not a re-cut or a keying change: the strays carry no key
signature, so no defringe/tolerance change can touch them; and a re-cut from the source
sheet reproduces the same padded-bbox geometry (and would churn sprite dimensions the
sizing/anchor registry was measured against). Masking the finished sprite is the minimal
correct layer. slice-sprites.py (--single included) is untouched.

WHAT IS EXEMPT -- never altered:
  - SWARM sprites (slug contains "swarm-of-"): multiple disconnected blobs ARE the art;
    border-clipped members are the swarm fading out of frame, not damage.
  - interior detached elements (a galeb-duhr's intact floating rocks, a seahorse's intact
    bubbles, spell glows): the detector only fires on components CLIPPED against the image
    border -- fully-in-frame detached art never qualifies, whatever its size or color.

Detection (identical to the audit harness): opaque mask = alpha > 16, 8-connectivity
components; a stray = any non-largest component with area >= 20 px whose bbox comes
within 1 px of an image border. Cleaning = alpha -> 0 on the stray's own pixels (RGB kept,
matching the keying/defringe convention). The main component is never touched -- its pixel
count is asserted byte-identical pre/post, and everything outside the removed components
is asserted identical too ("never bulldoze art", same rails as clean-magenta-crud.py).

SAFETY RAILS:
  - never-bulldoze budget: if a sprite's total stray px exceeds STRAY_MAX_FRAC of its
    main-component px, it is skipped for eyes (listed in the report), not cleaned.
  - originals are archived additively to quarantine-pack/pre-border-strays/originals.zip
    before the first write (additive law, matches clean-magenta-crud.py).
  - idempotent: a second run detects nothing on cleaned files and writes nothing.

Emits dev/_bleed-audit/border_stray_fix.json (per-stray geometry + color forensics) and a
before/after contact sheet dev/_bleed-audit/border_stray_fix_contact.png (before = stray
tinted red, after = cleaned) for the mandatory human review.

Flags:
  --glob PATTERN   sprite filename glob within assets/sprites/ (default: spr-fantasy-*.png)
  --report-only    detect + report + contact sheet only; never writes a sprite or the zip.
  --verify         re-run detection and FAIL (exit 1) if any non-exempt sprite still has a
                   border-clipped stray. Never mutates.

Dependencies: Pillow + numpy + scipy (same set as build/clean-magenta-crud.py).
"""
import argparse
import glob as globmod
import json
import os
import sys
import zipfile

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SPRITES_DIR = os.path.join(REPO, "assets", "sprites")
AUDIT_DIR = os.path.join(REPO, "dev", "_bleed-audit")
REPORT_PATH = os.path.join(AUDIT_DIR, "border_stray_fix.json")
SHEET_PATH = os.path.join(AUDIT_DIR, "border_stray_fix_contact.png")
QUARANTINE_ZIP = os.path.join(REPO, "quarantine-pack", "pre-border-strays", "originals.zip")

ALPHA_THRESH = 16       # audit harness: opaque = alpha > 16
MIN_STRAY_PX = 20       # audit harness: components under this are ignored (noise lane)
BORDER_PAD = 1          # audit harness: bbox within 1 px of a border = clipped
STRAY_MAX_FRAC = 0.05   # never-bulldoze: total stray px must stay under 5% of main px
SWARM_MARKER = "swarm-of-"
S8 = np.ones((3, 3), dtype=int)  # 8-connectivity


def detect(arr):
    """Return (main_px, strays) for an RGBA array; each stray is a dict with a boolean
    'mask' plus geometry/color forensics. Criteria mirror the audit harness exactly."""
    H, W = arr.shape[:2]
    opaque = arr[..., 3] > ALPHA_THRESH
    lbl, n = ndimage.label(opaque, structure=S8)
    if n < 2:
        return int(opaque.sum()), []
    sizes = ndimage.sum(opaque, lbl, index=range(1, n + 1)).astype(int)
    main = 1 + int(sizes.argmax())
    objs = ndimage.find_objects(lbl)
    strays = []
    for c in range(1, n + 1):
        if c == main:
            continue
        area = int(sizes[c - 1])
        if area < MIN_STRAY_PX:
            continue
        sl = objs[c - 1]
        y0, y1 = sl[0].start, sl[0].stop
        x0, x1 = sl[1].start, sl[1].stop
        if not (x0 <= BORDER_PAD or y0 <= BORDER_PAD
                or x1 >= W - BORDER_PAD or y1 >= H - BORDER_PAD):
            continue
        mask = lbl == c
        rgb = arr[..., :3].astype(int)
        r, g, b = (rgb[..., i][mask] for i in range(3))
        strays.append({
            "mask": mask,
            "areaPx": area,
            "bbox": [int(x0), int(y0), int(x1), int(y1)],
            "borders": [nm for nm, cond in (("L", x0 <= BORDER_PAD), ("T", y0 <= BORDER_PAD),
                                            ("R", x1 >= W - BORDER_PAD),
                                            ("B", y1 >= H - BORDER_PAD)) if cond],
            "meanRGB": [round(float(v.mean()), 1) for v in (r, g, b)],
            "meanAlpha": round(float(arr[..., 3][mask].mean()), 1),
            "magentaExcessMean": round(float((np.minimum(r, b) - g).mean()), 1),
        })
    return int(sizes[main - 1]), strays


def tinted(arr, stray_masks):
    """Composite RGBA over a checker bg; tint stray pixels red (for the contact sheet)."""
    ch = ((np.indices(arr.shape[:2]).sum(axis=0) // 8) % 2) * 30 + 55
    bg = np.dstack([ch, ch, ch]).astype(float)
    al = arr[..., 3:4].astype(float) / 255.0
    comp = arr[..., :3].astype(float) * al + bg * (1 - al)
    for m in stray_masks:
        comp[m] = comp[m] * 0.25 + np.array([255.0, 30.0, 30.0]) * 0.75
    return Image.fromarray(comp.astype(np.uint8))


def build_contact_sheet(rows, out_path):
    """One row per touched/skipped sprite: label, BEFORE (strays tinted red), AFTER."""
    if not rows:
        return
    cell, label_h, pad = 200, 16, 6
    sheet = Image.new("RGB", (pad + 2 * (cell + pad), pad + len(rows) * (cell + label_h + pad)),
                      (40, 40, 40))
    draw = ImageDraw.Draw(sheet)
    for i, row in enumerate(rows):
        y0 = pad + i * (cell + label_h + pad)
        before = tinted(row["before"], [s["mask"] for s in row["strays"]])
        after = tinted(row["after"], []) if row["after"] is not None else before
        for j, im in enumerate((before, after)):
            scale = min(cell / im.width, cell / im.height)
            im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))),
                           Image.NEAREST)
            x0 = pad + j * (cell + pad)
            sheet.paste(im, (x0 + (cell - im.width) // 2, y0 + label_h + (cell - im.height) // 2))
        draw.text((pad, y0), row["label"][:110], fill=(230, 230, 230))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    sheet.save(out_path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--glob", default="spr-fantasy-*.png",
                    help="sprite filename glob within assets/sprites/")
    ap.add_argument("--report-only", action="store_true",
                    help="detect + report only; never writes sprites or the zip")
    ap.add_argument("--verify", action="store_true",
                    help="fail if any non-exempt sprite still has a border-clipped stray")
    args = ap.parse_args()
    write_files = not (args.report_only or args.verify)

    paths = sorted(globmod.glob(os.path.join(SPRITES_DIR, args.glob)))
    if not paths:
        print(f"ERROR: no sprites match {args.glob} in assets/sprites/", file=sys.stderr)
        sys.exit(1)
    print(f"scanning {len(paths)} sprites ({args.glob})")

    entries, sheet_rows, cleaned, exempt_swarms, skipped_for_eyes = [], [], [], [], []
    to_write = {}  # path -> (orig_bytes, final_arr)

    for path in paths:
        slug = os.path.basename(path)[:-4]
        arr = np.array(Image.open(path).convert("RGBA"))
        main_px, strays = detect(arr)
        if not strays:
            continue
        entry = {
            "slug": slug, "mainPx": main_px,
            "strayPxTotal": sum(s["areaPx"] for s in strays),
            "strays": [{k: v for k, v in s.items() if k != "mask"} for s in strays],
        }
        if SWARM_MARKER in slug:
            entry["action"] = "exempt-swarm"
            exempt_swarms.append(slug)
            entries.append(entry)
            continue
        if entry["strayPxTotal"] > STRAY_MAX_FRAC * main_px:
            entry["action"] = "skipped-for-eyes"
            entry["reason"] = (f"stray px {entry['strayPxTotal']} exceeds "
                              f"{STRAY_MAX_FRAC:.0%} of main px {main_px}")
            skipped_for_eyes.append(slug)
            entries.append(entry)
            sheet_rows.append({"label": f"{slug}  SKIPPED FOR EYES", "before": arr,
                               "after": None, "strays": strays})
            continue

        final = arr.copy()
        union = np.zeros(arr.shape[:2], dtype=bool)
        for s in strays:
            union |= s["mask"]
        final[..., 3][union] = 0

        # rails: main component untouched, nothing outside the stray masks moved
        main_after, strays_after = detect(final)
        assert main_after == main_px, f"{slug}: main component changed ({main_px}->{main_after})"
        assert np.array_equal(arr[~union], final[~union]), f"{slug}: pixels outside strays changed"
        entry["action"] = "cleaned"
        entry["mainPxAfter"] = main_after
        entry["straysAfter"] = len(strays_after)
        entries.append(entry)
        cleaned.append(slug)
        to_write[path] = final
        sheet_rows.append({
            "label": f"{slug}  -{entry['strayPxTotal']}px x{len(strays)}",
            "before": arr, "after": final, "strays": strays,
        })

    if args.verify:
        bad = [e["slug"] for e in entries if e["action"] != "exempt-swarm"]
        print(f"VERIFY: {len(bad)} non-exempt sprite(s) with border-clipped strays"
              + (f": {bad}" if bad else "") )
        print(f"  exempt swarms still multi-blob (expected): {exempt_swarms}")
        sys.exit(1 if bad else 0)

    if write_files and to_write:
        os.makedirs(os.path.dirname(QUARANTINE_ZIP), exist_ok=True)
        zmode = "a" if os.path.exists(QUARANTINE_ZIP) else "w"
        with zipfile.ZipFile(QUARANTINE_ZIP, zmode, zipfile.ZIP_DEFLATED) as z:
            existing = set(z.namelist()) if zmode == "a" else set()
            for path in to_write:
                arcname = os.path.basename(path)
                if arcname not in existing:
                    z.write(path, arcname)
        for path, final in to_write.items():
            Image.fromarray(final).save(path)
        print(f"OK: cleaned {len(to_write)} sprites in place, originals -> "
              f"{os.path.relpath(QUARANTINE_ZIP, REPO)}")

    build_contact_sheet(sheet_rows, SHEET_PATH)
    report = {
        "glob": args.glob,
        "scanned": len(paths),
        "flagged": len(entries),
        "cleaned": sorted(cleaned),
        "exemptSwarms": sorted(exempt_swarms),
        "skippedForEyes": sorted(skipped_for_eyes),
        "reportOnly": bool(args.report_only),
        "sprites": entries,
    }
    os.makedirs(AUDIT_DIR, exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=1)
    print(f"OK: report -> {os.path.relpath(REPORT_PATH, REPO)}")
    print(f"  flagged {len(entries)}: cleaned {len(cleaned)}, exempt swarms "
          f"{len(exempt_swarms)}, skipped-for-eyes {len(skipped_for_eyes)}")
    if sheet_rows:
        print(f"  before/after contact sheet -> {os.path.relpath(SHEET_PATH, REPO)}")


if __name__ == "__main__":
    main()
