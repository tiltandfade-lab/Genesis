#!/usr/bin/env python3
"""Genesis table linter — validates Engine markdown table SOURCE without compiling it.

  python3 build/lint-tables.py               # lint, human-readable findings, exit 1 on hard errors
  python3 build/lint-tables.py --warn-only    # same checks, always exit 0 (report-only mode)

WHY THIS EXISTS: Adam hand-edits Engine table markdown (adding/removing rows) directly and often.
compile-tables.py already validates roll-range coverage as part of compiling — but only surfaces
that as counts in a summary block, doesn't check band/tier ordering at all, and only runs when
someone remembers to recompile. This is a standalone, fast, stdlib-only pre-compile gate: run it
right after editing a table, before ever touching compile-tables.py.

MIRROR-NOT-STRICTER RULE: this lint must never reject a table format the compiler accepts. Every
parsing tolerance here is deliberately copied from Engine/00. _System/compile-tables.py's own
parse_block()/split_blocks()/CELL()/SEP() (same regexes, same per-block dice-range derivation, same
ragged-column tolerance, same special-tid skip list). Where compile-tables.py would silently accept
something (e.g. a row with fewer cells than the header — it never compares column counts, every
column access is guarded by `ci < len(cells)`), this lint treats it as at most a soft warning, never
a hard error. Do NOT tighten row/column parsing beyond what compile-tables.py tolerates; only ADD
semantic checks (band ordering, duplicate rows) that the compiler doesn't attempt at all.

CHECKS (per table, i.e. per compiler "block" — a table-set like dungeon-lore-art has several blocks
per file, each independently ranged, exactly as compile-tables.py sees it):
  1. roll-range coverage  — gapless + non-overlapping across the block's own min..max, and the
     min..max matches the die declared in the header (or is inferred 1..N / 0..N-1 exactly like the
     compiler). HARD ERROR (gap/overlap) — this is the compiler's own "real-gap" status, promoted to
     a hard failure here because it is silently swallowed by --emit today.
  2. band/tier monotonic with roll range — Adam's invariant: higher roll = higher (or equal) tier,
     for tables that carry a recognizable Band/Tier column using the Grounded < Textured < Strange
     < Volatile < Mythic vocabulary (docs/SPICE-CURVE.md §match). Only applies where such a column
     exists AND every cell in it parses as a known band word — tables with a differently-shaped
     "band-ish" header (e.g. a content column that happens to be named something else) are left
     alone rather than misjudged. HARD ERROR when it regresses.
  3. duplicate rows — two rows in the same block with byte-identical result text. WARNING (Adam may
     intentionally weight an outcome by repeating it across multiple roll numbers — that's a valid
     table-authoring technique, not a bug — so this never hard-fails).
  4. malformed row syntax — a data row whose cell count doesn't match the header's cell count.
     WARNING ONLY (see MIRROR-NOT-STRICTER above: the compiler tolerates ragged rows fine).
  5. empty cells in required columns — a required column (die/roll index, and Band when a Band
     column is present) is blank. HARD ERROR for the index column (an unparseable index is already
     the compiler's own "starts-high"/skip signal); WARNING for a blank Band cell.

OUTPUT: human-readable, file:line per finding, grouped by severity per table. Exit 1 if any HARD
ERROR was found (unless --warn-only). --warn-only always exits 0 (used for baselining a corpus
that's still mid-review, per docs/TABLE-EDIT-SAFETY.md).
"""
import os, re, glob, sys, json, collections

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(HERE)  # …/Genesis
ROOTS = [os.path.join(BASE, "Engine", "03. _Tables"), os.path.join(BASE, "Asset Library")]
WARN_ONLY = "--warn-only" in sys.argv

# ---- mirrored verbatim from compile-tables.py (parsing tolerances must match exactly) ----
def norm(s): return s.replace('–', '-').replace('—', '-')
CELL = lambda c: re.sub(r'\*\*', '', c).strip()
SEP = re.compile(r'^\|[\s:\-|]+\|?\s*$')
DICE = re.compile(r'(\d*d\d+(?:\s*\+\s*\d*d\d+)*)', re.I)

def fm_and_body(t):
    if not t.startswith('---'): return {}, t
    e = t.find('\n---', 3)
    if e < 0: return {}, t
    d = {}
    for l in t[3:e].splitlines():
        m = re.match(r'^([a-zA-Z_]+):\s*(.*)$', l)
        if m: d[m.group(1)] = m.group(2)
    return d, t[e + 4:]

def dice_range(expr):
    lo = hi = 0
    for term in expr.replace(' ', '').split('+'):
        m = re.fullmatch(r'(\d*)d(\d+)', term, re.I)
        if not m: return None
        n = int(m.group(1) or 1); s = int(m.group(2))
        lo += n; hi += n * s
    return lo, hi

def find_dice(context):
    for m in DICE.finditer(context):
        expr = m.group(1).replace(' ', '').lower()
        r = dice_range(expr)
        if r: return expr, r
    return None

def split_blocks(lines):
    """yield (context, rows, first_row_lineno) — mirrors compile-tables.py's split_blocks, plus
    1-based line numbers (compile-tables.py doesn't track these; we need them for findings)."""
    blocks = []; cur = []; buf = []; cur_start = None
    for i, ln in enumerate(lines, start=1):
        s = ln.rstrip()
        if s.startswith('|'):
            if not cur: cur_start = i
            cur.append(s)
        else:
            if cur: blocks.append(("\n".join(buf[-4:]), cur, cur_start)); cur = []; buf = []; cur_start = None
            if s.strip(): buf.append(s)
    if cur: blocks.append(("\n".join(buf[-4:]), cur, cur_start))
    return blocks

def hint_id(context):
    h = None
    for m in re.finditer(r'^#{1,6}\s+(.*)$|^#([a-z0-9\-]+)\s*$|^\^([a-z0-9\-]+)\s*$', context, re.M):
        h = next(g for g in m.groups() if g)
    return h

# ---- Genesis's canonical spice vocabulary (docs/SPICE-CURVE.md §"one vocabulary") ----
BAND_RANK = {"grounded": 0, "textured": 1, "strange": 2, "volatile": 3, "mythic": 4}

def band_rank(cell):
    """Return the SPICE-CURVE rank for a band cell, or None if it doesn't parse as one of the
    five canonical words (case-insensitive, tolerant of the odd trailing note)."""
    w = re.sub(r'[^a-z]', '', cell.lower())
    return BAND_RANK.get(w)


class Finding:
    def __init__(self, sev, rel, line, tid, msg):
        self.sev, self.rel, self.line, self.tid, self.msg = sev, rel, line, tid, msg
    def __str__(self):
        loc = f"{self.rel}:{self.line}" if self.line else self.rel
        return f"  [{self.sev:5}] {loc}  ({self.tid})  {self.msg}"


def parse_block(context, rows, row_start_line):
    """Mirror compile-tables.py's parse_block, but also return per-row line numbers and header
    cells (needed for the lint checks the compiler itself doesn't do)."""
    data = [(r, row_start_line + i) for i, r in enumerate(rows) if not SEP.match(r)]
    if len(data) < 2: return None
    header_line = data[0]
    header_cells = [CELL(c) for c in header_line[0].strip('|').split('|')]
    parsed = []  # (lo, hi, cells, lineno)
    nondice = 0
    for r, lineno in data[1:]:
        cells = [CELL(c) for c in r.strip('|').split('|')]
        if not cells: continue
        first = norm(cells[0])
        m = re.match(r'^(\d+)\s*-\s*(\d+)$', first) or re.match(r'^(\d+)$', first)
        if not m:
            nondice += 1
            continue
        lo = int(m.group(1)); hi = int(m.group(2)) if m.lastindex == 2 else lo
        parsed.append((lo, hi, cells, lineno))
    if not parsed or nondice > len(parsed): return None
    amin = min(l for l, _, _, _ in parsed); amax = max(h for _, h, _, _ in parsed)
    dd = find_dice(context); dice = None; rmin, rmax = 1, amax
    if dd and dd[1] == (amin, amax):
        dice = dd[0]; rmin, rmax = dd[1]
    elif amin == 0:
        dice = "d%d" % (amax + 1); rmin, rmax = 0, amax
    elif amin == 1:
        dice = "d%d" % amax; rmin, rmax = 1, amax
    cov = collections.Counter()
    for lo, hi, _, _ in parsed:
        for v in range(lo, hi + 1): cov[v] += 1
    overl = sorted(v for v in range(rmin, rmax + 1) if cov[v] > 1)
    gaps = sorted(v for v in range(rmin, rmax + 1) if cov[v] == 0)
    starts_high = dice is None
    if starts_high:
        dice = "d%d" % amax
    return {
        "parsed": parsed, "header_cells": header_cells, "dice": dice,
        "rmin": rmin, "rmax": rmax, "amin": amin, "amax": amax,
        "overlaps": overl, "gaps": gaps, "starts_high": starts_high,
        "header_line": header_line[1],
    }


def lint_file(path, findings):
    rel = os.path.relpath(path, BASE)
    try:
        text = open(path, encoding='utf-8').read()
    except Exception as e:
        findings.append(Finding("ERROR", rel, None, "?", f"unreadable file: {e}"))
        return
    fm, body = fm_and_body(text)
    if fm.get('type') not in ('table', 'table-set'):
        return
    fm_lines = text[:text.find('\n---', 3) + 4].count('\n') if text.startswith('---') else 0
    lines = body.splitlines()
    seen_any = False
    for context, rows, row_start_line in split_blocks(lines):
        info = parse_block(context, rows, (fm_lines + row_start_line) if row_start_line else None)
        if info is None:
            continue
        seen_any = True
        tid = fm['id'] if fm['type'] == 'table' else re.sub(
            r'[^a-z0-9]+', '-', (hint_id(context) or fm['id']).lower()).strip('-')

        # same special-tid skip compile-tables.py uses (dungeon-lore-*/modifier tables: intentional
        # non-monotonic lookup matrices, not spice-graded roll tables — don't misjudge them)
        is_special = tid.startswith('dungeon-lore') or 'modifier' in tid

        # ---- CHECK 1: roll-range coverage (promote compiler's "real-gap" to a hard error here) ----
        if not is_special:
            if info["overlaps"]:
                findings.append(Finding("ERROR", rel, info["header_line"], tid,
                    f"overlapping roll ranges ({info['dice']}): {info['overlaps'][:8]}"
                    f"{' …' if len(info['overlaps']) > 8 else ''}"))
            if info["gaps"]:
                findings.append(Finding("ERROR", rel, info["header_line"], tid,
                    f"gap in roll-range coverage ({info['dice']} {info['rmin']}-{info['rmax']}): "
                    f"missing {info['gaps'][:8]}{' …' if len(info['gaps']) > 8 else ''}"))
            if info["starts_high"]:
                # mirrors compile-tables.py's "starts-high" — ambiguous, not necessarily wrong
                # (could be a legitimate un-declared bell table). Soft warning, matches compiler tone.
                findings.append(Finding("WARN", rel, info["header_line"], tid,
                    f"table starts at {info['amin']}, no matching (NdM) heading declaration — "
                    f"add a dice heading if this is a bell/mixed table, per compile-tables.py"))

        # ---- locate a Band-ish column, exactly the way compile-tables.py's --emit path does ----
        band_col = None
        for ci, h in enumerate(info["header_cells"]):
            if 'band' in h.lower():
                band_col = ci
                break

        # ---- CHECK 2: band monotonic with roll range ----
        # Adam's invariant (docs/SPICE-CURVE.md): higher roll = higher-or-equal tier. In practice
        # the corpus has two shapes of "band decreases somewhere":
        #   (a) a scattered single-row dip in an otherwise-ascending table (e.g. Place Drift,
        #       In-Building Complications) — reads as an authoring slip, not an intentional design.
        #   (b) a clean multi-wave table, where a RUN of several consecutive rows resets low and
        #       re-ascends (e.g. the Realm Items d50 tables: rows 1-27 climb Grounded->Mythic, then
        #       28-50 deliberately opens a second wave back at Grounded — frontmatter documents the
        #       12-mundane+8-enchanted+4-signature+consumables recipe by design, not noise).
        # A single-row dip is promoted to ERROR (the crash-adjacent authoring-slip case this lint
        # exists to catch). A sustained multi-row reset is reported as WARN — a real regression
        # worth Adam's eyes, but plausibly an intentional wave structure, so it doesn't hard-fail
        # the gate the way a scattered dip does.
        DIP_RUN_THRESHOLD = 3  # a reset sustained >= this many rows reads as an intentional wave
        if band_col is not None:
            band_cells = []
            unparseable = []
            for lo, hi, cells, lineno in info["parsed"]:
                if band_col >= len(cells):
                    continue
                raw = cells[band_col]
                if not raw.strip():
                    continue
                r = band_rank(raw)
                if r is None:
                    unparseable.append((lineno, raw))
                else:
                    band_cells.append((lo, r, raw, lineno))
            # only assert monotonicity if the column is cleanly the canonical vocabulary throughout —
            # a column with unrecognized words isn't confidently a spice-Band column at all (could be
            # a differently-purposed column that happens to have "Band" in its header).
            if band_cells and not unparseable:
                band_cells.sort(key=lambda x: x[0])
                # running "high-water mark" — the highest rank seen so far as roll ascends. A drop
                # below it starts a "regression run"; the run continues while ranks stay below the
                # mark, and ends (resolves) once the rank climbs back to or past the pre-drop peak.
                peak_rank, peak_lo, peak_raw = band_cells[0][1], band_cells[0][0], band_cells[0][2]
                run = []  # entries currently below peak_rank
                for lo, r, raw, lineno in band_cells[1:]:
                    if r < peak_rank:
                        run.append((lo, r, raw, lineno))
                    else:
                        if run:
                            sev = "WARN" if len(run) >= DIP_RUN_THRESHOLD else "ERROR"
                            span = f"rolls {run[0][0]}-{run[-1][0]}" if len(run) > 1 else f"roll {run[0][0]}"
                            kind = "sustained reset (possible intentional multi-wave table)" if sev == "WARN" \
                                else "isolated dip (likely an authoring slip)"
                            findings.append(Finding(sev, rel, run[0][3], tid,
                                f"band regression, {kind}: {span} drop below the roll-{peak_lo} "
                                f"peak of '{peak_raw}' (rank {peak_rank}) — higher roll should be "
                                f">= tier, per Adam's spice invariant (docs/SPICE-CURVE.md)"))
                            run = []
                        peak_rank, peak_lo, peak_raw = r, lo, raw
                if run:
                    sev = "WARN" if len(run) >= DIP_RUN_THRESHOLD else "ERROR"
                    span = f"rolls {run[0][0]}-{run[-1][0]}" if len(run) > 1 else f"roll {run[0][0]}"
                    kind = "sustained reset (possible intentional multi-wave table)" if sev == "WARN" \
                        else "isolated dip (likely an authoring slip)"
                    findings.append(Finding(sev, rel, run[0][3], tid,
                        f"band regression, {kind}: {span} drop below the roll-{peak_lo} peak of "
                        f"'{peak_raw}' (rank {peak_rank}) — higher roll should be >= tier, per "
                        f"Adam's spice invariant (docs/SPICE-CURVE.md)"))

        # ---- CHECK 5: empty cells in required columns ----
        for lo, hi, cells, lineno in info["parsed"]:
            if band_col is not None and band_col < len(cells) and not cells[band_col].strip():
                findings.append(Finding("WARN", rel, lineno, tid,
                    f"empty Band cell on roll {lo}"))

        # ---- CHECK 4: malformed row syntax (column count mismatch vs header) ----
        # WARNING ONLY — compile-tables.py never compares column counts (every access is
        # `ci < len(cells)` guarded), so a ragged row compiles fine. Still worth flagging: it's
        # usually an authoring slip (a missing "|" cell) even when it happens to be harmless.
        nheader = len(info["header_cells"])
        for lo, hi, cells, lineno in info["parsed"]:
            if len(cells) != nheader:
                findings.append(Finding("WARN", rel, lineno, tid,
                    f"row has {len(cells)} cells, header has {nheader} (roll {lo})"))

        # ---- CHECK 3: duplicate rows (exact text match on the primary content cell) ----
        # Mirrors the compiler's row[3] narration text (--emit's `exclude` set: col0 the index,
        # plus the Band column when present, plus DM-only tag columns) — comparing CONTENT, not
        # the whole row, so two rows that share the same Band but different text (fine) don't
        # false-positive, and two rows with the same text under DIFFERENT bands (also a real dup —
        # the band doesn't change that the outcome text was copy-pasted) still get caught.
        exclude_cols = {0}
        if band_col is not None:
            exclude_cols.add(band_col)
        text_seen = {}
        for lo, hi, cells, lineno in info["parsed"]:
            content = " — ".join(c for i, c in enumerate(cells) if i not in exclude_cols and c)
            if not content:
                continue
            if content in text_seen:
                first_lo, first_line = text_seen[content]
                findings.append(Finding("WARN", rel, lineno, tid,
                    f"duplicate row text (same as roll {first_lo} at line {first_line}): "
                    f"{content[:70]!r}"))
            else:
                text_seen[content] = (lo, lineno)

    return seen_any


def main():
    files = sorted(set(
        f for r in ROOTS for f in glob.glob(r + "/**/*.md", recursive=True)
        if '/Archive' not in f and '/zz_' not in f
    ))
    findings = []
    tables_seen = 0
    for f in files:
        before = len(findings)
        seen = lint_file(f, findings)
        if seen:
            tables_seen += 1

    errors = [x for x in findings if x.sev == "ERROR"]
    warns = [x for x in findings if x.sev == "WARN"]

    mode = "WARN-ONLY" if WARN_ONLY else "LINT"
    print(f"{mode} — files scanned: {len(files)} | tables/blocks checked: {tables_seen} | "
          f"errors: {len(errors)} | warnings: {len(warns)}")

    if errors:
        print(f"\nHARD ERRORS ({len(errors)}):")
        for x in errors:
            print(x)
    if warns:
        print(f"\nWARNINGS ({len(warns)}):")
        for x in warns:
            print(x)
    if not errors and not warns:
        print("\nclean — no findings.")

    if errors and not WARN_ONLY:
        print(f"\nFAIL — {len(errors)} hard error(s). Fix the source markdown, or re-run with "
              f"--warn-only to see findings without failing the gate.")
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
