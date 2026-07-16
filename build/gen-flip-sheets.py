#!/usr/bin/env python3
"""build/gen-flip-sheets.py — Adam's per-creature flip-verdict contact sheets.

Adam's ruling: "i need to see a ton of side by sides to make that call" (the legacy-vs-faceted
sprite-art flip). Pure Python/PIL, zero engine involvement — reads data/sprite-registry.js as
TEXT (regex per line; never Read/eval/import the generated multi-MB module — see CLAUDE.md
token-discipline) and composites one paired side-by-side cell per registry entry that carries a
candidateAsset (252 slugs at authoring time: 192 with legacy art + 60 with none — the "faceted
fold-in" orphans, 39 of which are the pc/ slugs).

Per cell: legacy art LEFT, faceted candidate RIGHT, each alpha-composited onto a flat #333
panel (both corpora keep magenta RGB under alpha=0 — PIL's paste(mask=im) already ignores RGB
wherever alpha is 0, so the magenta never shows), each independently cropped to its own alpha
bbox and then scaled to a COMMON HEIGHT within the cell (art-relative — a style judgment, not a
scale judgment; worldHeight goes in the caption instead, never used to size the art). Entries
with no legacy art render the candidate alone with a "no legacy counterpart" tag in the legacy
slot — Adam still verdicts the art on those.

Output: dev/model-qa/flip-verdict-sheets/sheet-NN.png (3x4 = 12 cells/sheet, ordered by
kind then name then slug) + index.md (sheet -> slug listing).

Run: python3 build/gen-flip-sheets.py
"""
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY_PATH = os.path.join(REPO, "data", "sprite-registry.js")
OUT_DIR = os.path.join(REPO, "dev", "model-qa", "flip-verdict-sheets")
INDEX_PATH = os.path.join(OUT_DIR, "index.md")

# ---------------------------------------------------------------------------
# layout constants
# ---------------------------------------------------------------------------
COLS, ROWS = 3, 4
PER_SHEET = COLS * ROWS

PANEL_W = 400          # each of legacy/candidate half-panel
PANEL_GAP = 12          # gap + divider between the two half-panels
LABEL_H = 28            # "LEGACY" / "FACETED" header strip above each panel
IMG_H = 380             # image-area height inside each panel
TARGET_ART_H = 336      # common height the art is scaled to within IMG_H (art-relative)
BOTTOM_MARGIN = 22      # art sits this far above the panel floor (bottom-aligned "ground line")
CAPTION_H = 104         # name (up to 2 lines) + slug + size/height meta

CELL_W = PANEL_W * 2 + PANEL_GAP
CELL_H = LABEL_H + IMG_H + CAPTION_H
CELL_PAD = 16           # padding inside each cell's border
GRID_GAP = 26           # gap between cells
MARGIN = 40
TITLE_H = 76

SHEET_W = MARGIN * 2 + COLS * CELL_W + (COLS - 1) * GRID_GAP
SHEET_H = MARGIN * 2 + TITLE_H + ROWS * CELL_H + (ROWS - 1) * GRID_GAP

BG = (18, 18, 20)
CELL_BG = (30, 30, 33)
CELL_BORDER = (70, 70, 76)
PANEL_BG = (0x33, 0x33, 0x33)
PANEL_BORDER = (90, 90, 96)
LABEL_COL = (200, 200, 208)
NAME_COL = (240, 240, 244)
SLUG_COL = (140, 200, 255)
META_COL = (176, 176, 184)
TAG_COL = (255, 150, 90)
TITLE_COL = (232, 217, 176)
SUBTITLE_COL = (150, 150, 158)
NO_LEGACY_COL = (120, 120, 128)


def load_font(size, bold=False, mono=False):
    if mono:
        candidates = ["/System/Library/Fonts/Menlo.ttc"]
    else:
        candidates = [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
        ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()


FONT_TITLE = load_font(30, bold=True)
FONT_SUBTITLE = load_font(16)
FONT_LABEL = load_font(15, bold=True)
FONT_NAME = load_font(18, bold=True)
FONT_SLUG = load_font(12, mono=True)
FONT_META = load_font(13)
FONT_TAG = load_font(14, bold=True)


# ---------------------------------------------------------------------------
# registry parsing (text/regex only — never eval the generated module)
# ---------------------------------------------------------------------------
def unescape_js(s):
    s = s.replace('\\"', '"').replace("\\\\", "\\")
    s = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), s)
    return s


def field_str(body, name):
    m = re.search(rf'{name}:(null|"((?:[^"\\]|\\.)*)")', body)
    if not m:
        raise ValueError(f"field {name!r} not found")
    if m.group(1) == "null":
        return None
    return unescape_js(m.group(2))


def field_num(body, name):
    m = re.search(rf'{name}:(null|-?[0-9]+(?:\.[0-9]+)?)', body)
    if not m:
        raise ValueError(f"field {name!r} not found")
    if m.group(1) == "null":
        return None
    return float(m.group(1))


def parse_registry(path):
    entries = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            m = re.match(r'^"(spr-[a-z0-9-]+)":\s*\{(.*)\},?$', line)
            if not m:
                continue
            slug, body = m.group(1), m.group(2)
            if 'candidateAsset:"' not in body:
                continue  # only registry entries admitted to the faceted flip
            entries.append({
                "slug": slug,
                "realm": field_str(body, "realm"),
                "kind": field_str(body, "kind"),
                "name": field_str(body, "name"),
                "size": field_str(body, "size"),
                "worldHeight": field_num(body, "worldHeight"),
                "heightSource": field_str(body, "heightSource"),
                "legacyAsset": field_str(body, "legacyAsset"),
                "candidateAsset": field_str(body, "candidateAsset"),
            })
    return entries


# ---------------------------------------------------------------------------
# image helpers
# ---------------------------------------------------------------------------
def alpha_bbox_and_sum(im):
    """Returns (bbox, alpha_sum) for an RGBA image. bbox is None + sum==0 iff fully transparent."""
    alpha = im.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        return None, 0
    # cheap non-zero confirmation (bbox already guarantees at least one non-zero pixel)
    hist = alpha.histogram()
    alpha_sum = sum(i * c for i, c in enumerate(hist))
    return bbox, alpha_sum


def load_cropped(path, pad=3):
    """Open an RGBA sprite, crop to its alpha bbox (+pad, clamped). Returns (cropped_img, alpha_sum)
    or (None, 0) if the source is fully transparent (alpha-guard hit)."""
    im = Image.open(path).convert("RGBA")
    bbox, alpha_sum = alpha_bbox_and_sum(im)
    if bbox is None:
        return None, 0
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad)
    y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad)
    y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1)), alpha_sum


def draw_panel(entry, side, alpha_guard_hits):
    """Builds one PANEL_W x IMG_H RGBA panel (legacy or candidate half) for a cell."""
    panel = Image.new("RGBA", (PANEL_W, IMG_H), PANEL_BG + (255,))
    path = entry["legacyAsset"] if side == "legacy" else entry["candidateAsset"]

    if path is None:
        draw = ImageDraw.Draw(panel)
        draw.text((PANEL_W // 2, IMG_H // 2), "no legacy\ncounterpart",
                   font=FONT_META, fill=NO_LEGACY_COL, anchor="mm", align="center")
        return panel

    cropped, alpha_sum = load_cropped(path)
    if cropped is None or alpha_sum == 0:
        alpha_guard_hits.append((entry["slug"], side, path))
        draw = ImageDraw.Draw(panel)
        draw.text((PANEL_W // 2, IMG_H // 2), "EMPTY / FULLY\nTRANSPARENT",
                   font=FONT_META, fill=(255, 90, 90), anchor="mm", align="center")
        return panel

    w, h = cropped.size
    scale = TARGET_ART_H / h
    new_w = max(1, round(w * scale))
    new_h = max(1, round(h * scale))
    resample = Image.LANCZOS if scale < 1 else Image.LANCZOS
    scaled = cropped.resize((new_w, new_h), resample)

    x = (PANEL_W - new_w) // 2
    y = IMG_H - BOTTOM_MARGIN - new_h
    panel.paste(scaled, (x, y), scaled)
    return panel


def wrap_to_width(draw, text, font, max_width, max_lines):
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        if draw.textlength(trial, font=font) <= max_width or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = w
            if len(lines) == max_lines - 1:
                break
    if cur:
        lines.append(cur)
    # anything left over after max_lines got dropped by the break above; ellipsize the last line
    if len(lines) > max_lines:
        lines = lines[:max_lines]
    consumed = len(" ".join(lines))
    if consumed < len(text) or len(lines) == max_lines and draw.textlength(lines[-1], font=font) > max_width:
        last = lines[-1]
        while draw.textlength(last + "…", font=font) > max_width and len(last) > 1:
            last = last[:-1].rstrip()
        lines[-1] = last + "…"
    return lines


def truncate_to_width(draw, text, font, max_width):
    if draw.textlength(text, font=font) <= max_width:
        return text
    t = text
    while draw.textlength(t + "…", font=font) > max_width and len(t) > 1:
        t = t[:-1].rstrip()
    return t + "…"


def build_cell(entry, alpha_guard_hits):
    cell = Image.new("RGB", (CELL_W, CELL_H), CELL_BG)
    draw = ImageDraw.Draw(cell)
    draw.rectangle([0, 0, CELL_W - 1, CELL_H - 1], outline=CELL_BORDER, width=1)

    # --- half-panel labels ---
    draw.text((PANEL_W // 2, 4), "LEGACY", font=FONT_LABEL, fill=LABEL_COL, anchor="mt")
    draw.text((PANEL_W + PANEL_GAP + PANEL_W // 2, 4), "FACETED", font=FONT_LABEL, fill=LABEL_COL, anchor="mt")

    legacy_panel = draw_panel(entry, "legacy", alpha_guard_hits)
    cand_panel = draw_panel(entry, "candidate", alpha_guard_hits)
    cell.paste(legacy_panel.convert("RGB"), (0, LABEL_H))
    cell.paste(cand_panel.convert("RGB"), (PANEL_W + PANEL_GAP, LABEL_H))
    draw.rectangle([0, LABEL_H, PANEL_W - 1, LABEL_H + IMG_H - 1], outline=PANEL_BORDER, width=1)
    draw.rectangle([PANEL_W + PANEL_GAP, LABEL_H, PANEL_W * 2 + PANEL_GAP - 1, LABEL_H + IMG_H - 1],
                    outline=PANEL_BORDER, width=1)

    if entry["legacyAsset"] is None:
        draw.text((PANEL_W // 2, LABEL_H + IMG_H // 2 + 24), "NO LEGACY COUNTERPART",
                   font=FONT_TAG, fill=TAG_COL, anchor="mm")

    # --- caption ---
    cap_x0 = CELL_PAD
    cap_w = CELL_W - CELL_PAD * 2
    cap_y = LABEL_H + IMG_H + 8

    name_lines = wrap_to_width(draw, entry["name"] or entry["slug"], FONT_NAME, cap_w, 2)
    ly = cap_y
    for line in name_lines:
        draw.text((cap_x0, ly), line, font=FONT_NAME, fill=NAME_COL)
        ly += 22

    slug_line = truncate_to_width(draw, entry["slug"], FONT_SLUG, cap_w)
    draw.text((cap_x0, ly), slug_line, font=FONT_SLUG, fill=SLUG_COL)
    ly += 18

    size_band = entry["size"] or "size: unknown"
    if entry["worldHeight"] is not None:
        h = entry["worldHeight"]
        h_txt = f"{h:g}′"
    else:
        h_txt = "height: n/a"
    meta = f"{size_band} · {h_txt} ({entry['heightSource'] or 'missing'})"
    meta = truncate_to_width(draw, meta, FONT_META, cap_w)
    draw.text((cap_x0, ly), meta, font=FONT_META, fill=META_COL)

    return cell


def build_sheet(sheet_idx, total_sheets, entries_chunk, alpha_guard_hits):
    sheet = Image.new("RGB", (SHEET_W, SHEET_H), BG)
    draw = ImageDraw.Draw(sheet)
    draw.text((MARGIN, MARGIN), f"FLIP VERDICT SHEET {sheet_idx:02d} / {total_sheets:02d}",
               font=FONT_TITLE, fill=TITLE_COL)
    draw.text((MARGIN, MARGIN + 36),
               "legacy (LEFT) vs faceted candidate (RIGHT) · art-relative common height · "
               f"{len(entries_chunk)} creatures on this sheet",
               font=FONT_SUBTITLE, fill=SUBTITLE_COL)

    grid_top = MARGIN + TITLE_H
    for i, entry in enumerate(entries_chunk):
        col = i % COLS
        row = i // COLS
        x = MARGIN + col * (CELL_W + GRID_GAP)
        y = grid_top + row * (CELL_H + GRID_GAP)
        cell = build_cell(entry, alpha_guard_hits)
        sheet.paste(cell, (x, y))

    return sheet


def main():
    entries = parse_registry(REGISTRY_PATH)
    n = len(entries)
    print(f"parsed {n} candidateAsset entries from {os.path.relpath(REGISTRY_PATH, REPO)}")

    # --- verification: every slug appears exactly once (no dupes from the parse itself) ---
    slugs = [e["slug"] for e in entries]
    assert len(slugs) == len(set(slugs)), "duplicate slug parsed from registry — refusing to emit"
    assert n == 252, f"expected 252 candidateAsset entries, parsed {n} — registry drift, investigate before emitting"

    orphan_count = sum(1 for e in entries if e["legacyAsset"] is None)
    print(f"  {n - orphan_count} with legacy art, {orphan_count} with no legacy counterpart")

    entries.sort(key=lambda e: (e["kind"] or "", (e["name"] or "").lower(), e["slug"]))

    os.makedirs(OUT_DIR, exist_ok=True)
    # clear any stale sheet-*.png from a previous run with a different sheet count
    for f in os.listdir(OUT_DIR):
        if re.match(r"^sheet-\d+\.png$", f):
            os.remove(os.path.join(OUT_DIR, f))

    total_sheets = (n + PER_SHEET - 1) // PER_SHEET
    alpha_guard_hits = []
    index_lines = [
        "# Flip-verdict contact sheets — index",
        "",
        "Generated by `build/gen-flip-sheets.py` from `data/sprite-registry.js` "
        f"({n} candidateAsset entries, {total_sheets} sheets × up to {PER_SHEET} creatures). "
        "Legacy art LEFT, faceted candidate RIGHT, ordered by kind then name. "
        "Never hand-edit — regenerate.",
        "",
    ]

    emitted_slugs = []
    for s in range(total_sheets):
        chunk = entries[s * PER_SHEET:(s + 1) * PER_SHEET]
        sheet_idx = s + 1
        sheet_img = build_sheet(sheet_idx, total_sheets, chunk, alpha_guard_hits)
        out_name = f"sheet-{sheet_idx:02d}.png"
        out_path = os.path.join(OUT_DIR, out_name)
        sheet_img.save(out_path)
        emitted_slugs.extend(e["slug"] for e in chunk)

        index_lines.append(f"## {out_name} ({len(chunk)} creatures)")
        index_lines.append("")
        for e in chunk:
            legacy_tag = "" if e["legacyAsset"] else " — no legacy counterpart"
            index_lines.append(f"- `{e['slug']}` — {e['name']}{legacy_tag}")
        index_lines.append("")
        print(f"wrote {out_path} ({sheet_img.size[0]}x{sheet_img.size[1]}), {len(chunk)} creatures")

    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        f.write("\n".join(index_lines).rstrip() + "\n")
    print(f"wrote {INDEX_PATH}")

    # --- final verification ---
    assert len(emitted_slugs) == n, f"emitted {len(emitted_slugs)} slugs, expected {n}"
    assert len(set(emitted_slugs)) == n, "a slug was emitted more than once across sheets"
    assert set(emitted_slugs) == set(slugs), "emitted slug set does not match parsed slug set"
    print(f"VERIFY: every candidateAsset slug appears exactly once across sheets — count={len(emitted_slugs)}")

    if alpha_guard_hits:
        print(f"ALPHA-GUARD: {len(alpha_guard_hits)} empty/fully-transparent source image(s) hit:")
        for slug, side, path in alpha_guard_hits:
            print(f"  ! {slug} [{side}] {path}")
    else:
        print("ALPHA-GUARD: 0 hits — no empty/fully-transparent source image among the 252")

    print(f"total sheets: {total_sheets}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
