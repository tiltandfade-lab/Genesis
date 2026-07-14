#!/usr/bin/env python3
"""table-review.py — render a Genesis table + a review sidecar into the standard review page.

The craft-session review standard (docs/CRAFT-PASS-RUNBOOK.md): every table review session
produces one of these pages. The table markdown is the single source of row content (read
live, never duplicated); the sidecar JSON carries the per-row judgments (tier, note, tags,
mark). The script is family-agnostic — it reads the header row, so situation / item / place /
journey / rumor tables all render with their own column labels.

Usage:
  python3 dev/table-review.py "<table.md>" [--ratings docs/table-reviews/<id>.review.json]
                              [--out /path/page.html] [--set-size 50] [--title "..."]

Sidecar schema (all fields optional per row; unrated rows render greyed):
  { "meta": { "table": "...", "reviewed": "...", "open_note": "..." },
    "rows": { "<roll>": { "tier": "star|solid|ok|flag", "note": "...",
                          "tags": ["pride","silly",...], "mark": "re-anchored 07-08" } } }

Tags are free-vocabulary per table/category (pride, gluttony, silly, haunt, breach, ...).
Since Adam's 2026-07-08 ruling they are PART OF THE TABLE FORMAT — a `Tags` column in the
table markdown is the source of truth (this script reads it); sidecar `tags` act as
review-side overrides/additions for tables not yet retro-fitted.
"""
import argparse, html, json, os, re, sys

BANDS = ["grounded", "textured", "strange", "volatile", "mythic"]
TIER_META = {
    "star": ("★", "Exemplary"),
    "solid": ("✓", "Solid"),
    "ok": ("~", "Serviceable"),
    "flag": ("⚑", "Open item"),
    "unrated": ("·", "Unrated"),
}


def parse_frontmatter(text):
    fm = {}
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line and not line.startswith(" "):
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip()
    return fm


def parse_table(text):
    """First markdown table whose data rows start with an integer cell.
    Returns (headers, rows) where rows = list of (roll:int, [cells...])."""
    lines = text.splitlines()
    for i, line in enumerate(lines):
        s = line.strip()
        if not (s.startswith("|") and s.endswith("|")):
            continue
        headers = [c.strip() for c in s.strip("|").split("|")]
        if len(headers) < 2 or i + 2 >= len(lines):
            continue
        if not re.match(r"^\|[\s:|-]+\|$", lines[i + 1].strip()):
            continue
        rows, j = [], i + 2
        while j < len(lines):
            t = lines[j].strip()
            if not (t.startswith("|") and t.endswith("|")):
                break
            cells = [c.strip() for c in t.strip("|").split("|")]
            if cells and re.match(r"^\d+$", cells[0]):
                rows.append((int(cells[0]), cells[1:]))
            j += 1
        if rows:
            return headers[1:], rows
    sys.exit("ERROR: no roll-numbered markdown table found")


def esc(s):
    return html.escape(s, quote=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("table")
    ap.add_argument("--ratings", default=None)
    ap.add_argument("--out", default=None)
    ap.add_argument("--set-size", type=int, default=50)
    ap.add_argument("--title", default=None)
    a = ap.parse_args()

    text = open(a.table, encoding="utf-8").read()
    fm = parse_frontmatter(text)
    headers, rows = parse_table(text)

    sidecar = {"meta": {}, "rows": {}}
    if a.ratings:
        sidecar = json.load(open(a.ratings, encoding="utf-8"))
    ratings = sidecar.get("rows", {})

    table_name = a.title or fm.get("id", os.path.basename(a.table).replace(".md", ""))
    title = a.title or f"{table_name} d{len(rows)} — Review"
    band_idx = next((k for k, h in enumerate(headers) if h.lower() == "band"), None)
    tags_idx = next((k for k, h in enumerate(headers) if h.lower() == "tags"), None)
    lead_idx = next(k for k in range(len(headers)) if k not in (band_idx, tags_idx))

    def row_tags(n, cells):
        """Tags column in the table (in-format since 2026-07-08) merged with sidecar overrides."""
        tt = []
        if tags_idx is not None and tags_idx < len(cells) and cells[tags_idx]:
            tt = [t.strip() for t in cells[tags_idx].split(",") if t.strip()]
        for t in ratings.get(str(n), {}).get("tags", []):
            if t not in tt:
                tt.append(t)
        return tt

    counts = {t: 0 for t in TIER_META}
    tags_count, changed = {}, 0
    for n, cells in rows:
        e = ratings.get(str(n), {})
        counts[e.get("tier", "unrated")] += 1
        if e.get("mark"):
            changed += 1
        for t in row_tags(n, cells):
            tags_count[t] = tags_count.get(t, 0) + 1

    def row_html(n, cells):
        e = ratings.get(str(n), {})
        tier = e.get("tier", "unrated")
        glyph, label = TIER_META[tier]
        band = cells[band_idx] if band_idx is not None and band_idx < len(cells) else ""
        bcls = band.lower() if band.lower() in BANDS else "none"
        rtags = row_tags(n, cells)
        parts = [f'<article class="row tier-{tier}" data-tier="{tier}" '
                 f'data-changed="{1 if e.get("mark") else 0}" '
                 f'data-tags="{esc(",".join(rtags))}" id="r{n}">',
                 '<header class="rowhead">', f'<span class="roll">{n:03d}</span>']
        if band:
            parts.append(f'<span class="band band-{bcls}">{esc(band)}</span>')
        parts.append(f'<span class="tier tier-badge-{tier}" title="{label}">{glyph} {label}</span>')
        if e.get("mark"):
            cls = "mark mark-new" if "new" in e["mark"].lower() else "mark"
            parts.append(f'<span class="{cls}">{esc(e["mark"])}</span>')
        for t in rtags:
            parts.append(f'<span class="tag">{esc(t)}</span>')
        parts.append("</header>")
        parts.append(f'<p class="hook">{esc(cells[lead_idx]) if lead_idx < len(cells) else ""}</p>')
        parts.append('<div class="cells">')
        for k, h in enumerate(headers):
            if k in (band_idx, lead_idx, tags_idx) or k >= len(cells) or not cells[k]:
                continue
            parts.append(f'<p><span class="lbl">{esc(h)}</span>{esc(cells[k])}</p>')
        parts.append("</div>")
        if e.get("note"):
            parts.append(f'<p class="note"><span class="lbl">Assessment</span>{esc(e["note"])}</p>')
        parts.append("</article>")
        return "".join(parts)

    sets_html, nav_sets = "", ""
    for i in range(0, len(rows), a.set_size):
        chunk = rows[i : i + a.set_size]
        lo, hi = chunk[0][0], chunk[-1][0]
        sid = f"set{i // a.set_size + 1}"
        nav_sets += f'<a href="#{sid}">{lo:03d}&ndash;{hi:03d}</a>'
        stars = sum(1 for n, _ in chunk if ratings.get(str(n), {}).get("tier") == "star")
        flags = sum(1 for n, _ in chunk if ratings.get(str(n), {}).get("tier") == "flag")
        sets_html += (f'<section class="set" id="{sid}"><h2>Rolls {lo:03d}&ndash;{hi:03d} '
                      f'<span class="setmeta">{stars} exemplary &middot; {flags} open</span></h2>'
                      + "".join(row_html(n, c) for n, c in chunk) + "</section>")

    tag_opts = "".join(f'<option value="{esc(t)}">{esc(t)} ({c})</option>'
                       for t, c in sorted(tags_count.items()))
    stat_bits = "".join(
        f'<span class="stat"><b>{counts[t]}</b><span>{TIER_META[t][0]} {TIER_META[t][1].lower()}</span></span>'
        for t in TIER_META if counts[t])
    if changed:
        stat_bits += f'<span class="stat"><b>{changed}</b><span>changed this pass</span></span>'
    meta = sidecar.get("meta", {})
    sub_bits = [esc(meta.get("reviewed", "generated from the live table markdown"))]
    legend = (f'<p class="legend"><b>Open items:</b> {esc(meta["open_note"])}</p>'
              if meta.get("open_note") else "")
    fam = fm.get("table_family", "")
    contract = fm.get("row_contract", "")
    fam_line = f'{esc(fam)} family &middot; row_contract: {esc(contract)} &middot; ' if fam else ""

    page = ('<title>' + esc(title) + '</title>\n<style>\n'
':root { --bg:#EDE7DA; --surface:#F7F3EA; --ink:#2A241C; --muted:#6E6353; --line:#D8CFBD;\n'
'  --accent:#7E2D26; --gold:#8F6C14; --red:#A8352C;\n'
'  --b-grounded:#7A6A52; --b-textured:#4E7A5A; --b-strange:#6B4FA0; --b-volatile:#B0522A;\n'
'  --b-mythic:#A67F1E; --b-none:#8B8375; --chipbg:rgba(0,0,0,.045); }\n'
'@media (prefers-color-scheme: dark) { :root {\n'
'  --bg:#191612; --surface:#211D17; --ink:#E8DFCE; --muted:#9C8F7A; --line:#3A332A;\n'
'  --accent:#C4574A; --gold:#D4B45A; --red:#D96A5B;\n'
'  --b-grounded:#A79274; --b-textured:#7FAE8C; --b-strange:#A58BD6; --b-volatile:#D98B60;\n'
'  --b-mythic:#D4B45A; --b-none:#7E766A; --chipbg:rgba(255,255,255,.06); } }\n'
':root[data-theme="dark"] {\n'
'  --bg:#191612; --surface:#211D17; --ink:#E8DFCE; --muted:#9C8F7A; --line:#3A332A;\n'
'  --accent:#C4574A; --gold:#D4B45A; --red:#D96A5B;\n'
'  --b-grounded:#A79274; --b-textured:#7FAE8C; --b-strange:#A58BD6; --b-volatile:#D98B60;\n'
'  --b-mythic:#D4B45A; --b-none:#7E766A; --chipbg:rgba(255,255,255,.06); }\n'
':root[data-theme="light"] {\n'
'  --bg:#EDE7DA; --surface:#F7F3EA; --ink:#2A241C; --muted:#6E6353; --line:#D8CFBD;\n'
'  --accent:#7E2D26; --gold:#8F6C14; --red:#A8352C;\n'
'  --b-grounded:#7A6A52; --b-textured:#4E7A5A; --b-strange:#6B4FA0; --b-volatile:#B0522A;\n'
'  --b-mythic:#A67F1E; --b-none:#8B8375; --chipbg:rgba(0,0,0,.045); }\n'
'* { box-sizing:border-box; }\n'
'body { background:var(--bg); color:var(--ink); margin:0;\n'
'  font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;\n'
'  line-height:1.55; font-size:16px; }\n'
'.wrap { max-width:900px; margin:0 auto; padding:2.5rem 1.25rem 6rem; }\n'
'h1 { font-size:1.9rem; margin:0 0 .3rem; letter-spacing:-.01em; text-wrap:balance; }\n'
'.sub { color:var(--muted); margin:0 0 1.5rem; max-width:70ch; }\n'
'.statrow { display:flex; flex-wrap:wrap; gap:.6rem 1.6rem; padding:1rem 1.2rem;\n'
'  background:var(--surface); border:1px solid var(--line); border-radius:6px;\n'
'  margin-bottom:1rem; font-variant-numeric:tabular-nums; }\n'
'.stat b { font-size:1.25rem; margin-right:.35rem; }\n'
'.stat span { color:var(--muted); font-size:.85rem; text-transform:uppercase;\n'
'  letter-spacing:.06em; font-family:ui-monospace,"SF Mono",Menlo,monospace; }\n'
'nav { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line);\n'
'  display:flex; flex-wrap:wrap; align-items:center; gap:.4rem; padding:.6rem 0; margin-bottom:1.5rem; }\n'
'nav a, nav button, nav select { font-family:ui-monospace,"SF Mono",Menlo,monospace; font-size:.8rem;\n'
'  color:var(--ink); background:var(--chipbg); border:1px solid var(--line); border-radius:4px;\n'
'  padding:.3rem .65rem; text-decoration:none; cursor:pointer; }\n'
'nav a:hover, nav button:hover { border-color:var(--muted); }\n'
'nav button[aria-pressed="true"] { background:var(--ink); color:var(--bg); border-color:var(--ink); }\n'
'nav .gap { flex:1; }\n'
':focus-visible { outline:2px solid var(--accent); outline-offset:2px; }\n'
'.set h2 { font-size:1.25rem; border-bottom:2px solid var(--ink); padding-bottom:.35rem; margin:2.4rem 0 1rem; }\n'
'.setmeta { float:right; font-size:.75rem; color:var(--muted); padding-top:.45rem;\n'
'  font-family:ui-monospace,"SF Mono",Menlo,monospace; text-transform:uppercase; letter-spacing:.06em; }\n'
'.row { background:var(--surface); border:1px solid var(--line); border-radius:6px;\n'
'  padding:1rem 1.15rem; margin-bottom:.8rem; }\n'
'.row.hidden { display:none; }\n'
'.rowhead { display:flex; flex-wrap:wrap; align-items:center; gap:.55rem; margin-bottom:.5rem; }\n'
'.roll { font-family:ui-monospace,"SF Mono",Menlo,monospace; font-weight:700; font-size:1rem;\n'
'  font-variant-numeric:tabular-nums; }\n'
'.band, .tier { font-family:ui-monospace,"SF Mono",Menlo,monospace; font-size:.72rem;\n'
'  text-transform:uppercase; letter-spacing:.08em; padding:.15rem .5rem; border-radius:3px; }\n'
'.band { color:var(--bg); }\n'
'.band-grounded { background:var(--b-grounded); } .band-textured { background:var(--b-textured); }\n'
'.band-strange { background:var(--b-strange); } .band-volatile { background:var(--b-volatile); }\n'
'.band-mythic { background:var(--b-mythic); } .band-none { background:var(--b-none); }\n'
'.tier { border:1px solid var(--line); }\n'
'.tier-badge-star { color:var(--gold); border-color:var(--gold); font-weight:700; }\n'
'.tier-badge-solid { color:var(--ink); }\n'
'.tier-badge-ok { color:var(--muted); border-style:dashed; }\n'
'.tier-badge-flag { color:var(--bg); background:var(--red); border-color:var(--red); font-weight:700; }\n'
'.tier-badge-unrated { color:var(--muted); border-style:dotted; }\n'
'.mark { font-family:ui-monospace,"SF Mono",Menlo,monospace; font-size:.68rem; color:var(--muted);\n'
'  border:1px dashed var(--line); border-radius:3px; padding:.12rem .45rem; }\n'
'.mark-new { color:var(--accent); border-color:var(--accent); }\n'
'.tag { font-family:ui-monospace,"SF Mono",Menlo,monospace; font-size:.68rem; color:var(--muted);\n'
'  background:var(--chipbg); border-radius:3px; padding:.12rem .45rem; }\n'
'.hook { margin:.2rem 0 .6rem; font-size:1.02rem; }\n'
'.cells p { margin:.35rem 0; font-size:.92rem; }\n'
'.lbl { display:block; font-family:ui-monospace,"SF Mono",Menlo,monospace; font-size:.66rem;\n'
'  text-transform:uppercase; letter-spacing:.1em; color:var(--muted); margin-bottom:.1rem; }\n'
'.note { margin:.7rem 0 0; padding:.5rem .75rem; border-left:3px solid var(--gold);\n'
'  background:var(--chipbg); font-style:italic; font-size:.92rem; border-radius:0 4px 4px 0; }\n'
'.tier-flag .note { border-left-color:var(--red); }\n'
'.tier-ok .note { border-left-color:var(--muted); }\n'
'.legend { font-size:.85rem; color:var(--muted); max-width:70ch; margin-bottom:.5rem; }\n'
'</style>\n'
f'<div class="wrap">\n<h1>{esc(title)}</h1>\n'
f'<p class="sub">{fam_line}{" &middot; ".join(sub_bits)} &middot; {len(rows)} rows, sets of {a.set_size}. '
'Contents read live from the table markdown; ratings, notes, and tags from the review sidecar.</p>\n'
f'<div class="statrow">{stat_bits}</div>\n{legend}\n<nav>\n{nav_sets}\n<span class="gap"></span>\n'
'<button data-f="all" aria-pressed="true">All</button>\n'
'<button data-f="star" aria-pressed="false">&#9733;</button>\n'
'<button data-f="ok" aria-pressed="false">~</button>\n'
'<button data-f="flag" aria-pressed="false">&#9873; Open</button>\n'
+ ('<button data-f="changed" aria-pressed="false">Changed</button>\n' if changed else "")
+ (f'<select id="tagsel" aria-label="Filter by tag"><option value="">tag&hellip;</option>{tag_opts}</select>\n'
   if tags_count else "")
+ f'</nav>\n{sets_html}\n</div>\n'
'<script>\n'
'function applyFilter(f, tag) {\n'
'  document.querySelectorAll(".row").forEach(function(r) {\n'
'    var show = true;\n'
'    if (tag) show = ("," + r.dataset.tags + ",").indexOf("," + tag + ",") >= 0;\n'
'    else if (f === "changed") show = r.dataset.changed === "1";\n'
'    else if (f !== "all") show = r.dataset.tier === f;\n'
'    r.classList.toggle("hidden", !show);\n'
'  });\n'
'}\n'
'document.querySelectorAll("nav button").forEach(function(b) {\n'
'  b.addEventListener("click", function() {\n'
'    document.querySelectorAll("nav button").forEach(function(x) { x.setAttribute("aria-pressed","false"); });\n'
'    b.setAttribute("aria-pressed","true");\n'
'    var sel = document.getElementById("tagsel"); if (sel) sel.value = "";\n'
'    applyFilter(b.dataset.f, "");\n'
'  });\n'
'});\n'
'var sel = document.getElementById("tagsel");\n'
'if (sel) sel.addEventListener("change", function() {\n'
'  document.querySelectorAll("nav button").forEach(function(x) { x.setAttribute("aria-pressed","false"); });\n'
'  applyFilter("all", sel.value);\n'
'});\n'
'</script>')

    out = a.out or os.path.join(os.path.dirname(a.table),
                                f"{table_name}-review.html")
    open(out, "w", encoding="utf-8").write(page)
    print(f"OK — {len(rows)} rows | tiers: " +
          ", ".join(f"{t}:{c}" for t, c in counts.items() if c) +
          f" | tags: {len(tags_count)} | out: {out}")


if __name__ == "__main__":
    main()
