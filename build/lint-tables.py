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
BASELINE_PATH = os.path.join(BASE, "build", "lint-baseline.json")
WARN_ONLY = "--warn-only" in sys.argv
NO_BASELINE = "--no-baseline" in sys.argv
UPDATE_BASELINE = "--update-baseline" in sys.argv
VERBOSE = "--verbose" in sys.argv

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
    def __init__(self, sev, rel, line, tid, msg, check="", span=""):
        self.sev, self.rel, self.line, self.tid, self.msg = sev, rel, line, tid, msg
        self.check, self.span = check, span
    @property
    def fingerprint(self):
        return f"{self.rel}|{self.tid}|{self.check}|{self.span}"
    def __str__(self):
        loc = f"{self.rel}:{self.line}" if self.line else self.rel
        baselined = " (baselined)" if getattr(self, "_baselined", False) else ""
        sev = f"{self.sev}*" if getattr(self, "_baselined", False) else self.sev
        check_tag = f" [{self.check}]" if self.check else ""
        return f"  [{sev:5}] {loc}  ({self.tid}){check_tag}  {self.msg}{baselined}"


# docs/TABLE-ROW-CONTRACT.md §2/§5.3 — role → accepted header spellings (lowercased, **-stripped,
# whitespace-collapsed, EXACT cell match; NOT substring, except the existing 'band' rule).
# Extending a synonym list is allowed; narrowing one is a spec change.
ROLE_SYNONYMS = {
 "band":   ["band"],   # matched by the existing substring rule ('band' in h), kept as-is
 "seen":   ["seen now","hook","complication","result","event","situation","building","outcome",
            "obstacle","obstacle type / creature",'the obstacle / "lock"',
            'the obstacle / "lock" (barrier)',"job offered (in the npc's voice)","core want",
            "leverage point","useful knowledge or secret","the secret"],
 "wants":  ["wants","core want","want"],
 "pressure":["pressure/clock","pressure","clock","urgency","play effect",
            "narrative & tactical impact","solving the problem (checks)","complication"],
 "payoff": ["leverage/payoff","payoff","leverage","reward","potential reward / outcome",
            "immediate payoff"],
 "ignored":["if ignored","ignored","outcome"],
 "object": ["object","item","the object","trinket","object sitting on a table, shelf, or bar"],
 "frame":  ["frame"],
 "use":    ["use/ranks","ranks","use","uses","effect"],
 "tell":   ["tell"],
 "ripple": ["dm ripple","ripple","note"],
 "place":  ["place","layout (connected spaces)","result","hidden mistake"],
 "now":    ["what is happening now","now","who / what is inside","description","what it touches"],
 "handle": ["player handle","handle","notable feature"],
 "beat":   ["beat","complication","complication type","result","encounter profile"],
 "cost":   ["immediate check/cost","check/cost","cost","immediate consequence",
            "narrative & tactical impact","tactical behavior / benefit"],
 "lens":   ["environmental lens","env lens","lens","environmental tell",
            "env lens (wild / dungeon / urban)","signs of presence"],
 "trace":  ["persistent trace","trace"],
 "claim":  ["claim","rumor / intel","clue / secret","word","shrine or omen"],
 "evidence":["concrete evidence","evidence","check required","detail",
            "lens (how the telling garbles the bound fact)"],
 "benefits":["who benefits","benefits","kind"],
 "tonight":["what happens tonight","tonight","myth/taboo binding","immediate payoff"],
}
FAMILY_ROLES = {
 "situation": {"required": ["band","seen","pressure","ignored"], "recommended": ["wants","payoff"]},
 "item":      {"required": ["band","object","frame","use"],      "recommended": ["tell","ripple"]},
 "place":     {"required": ["band","place","now","pressure"],    "recommended": ["handle","ignored"]},
 "journey":   {"required": ["band","beat","lens"],               "recommended": ["cost","trace"]},
 "rumor":     {"required": ["band","claim","evidence"],          "recommended": ["benefits","tonight"]},
}
FAMILY_ALIASES = {"npc":"situation","social":"situation","hook":"rumor","omen":"rumor",
                  "walk":"journey","hazard":"journey","breach":"journey"}
REMEMBERS_ENUM = {"codex","ledger","clock","faction","item","map","walk","none"}

TABLE_CLASS_CEILING = {"Spark": 1, "Fork": 2, "Commitment": 4}  # SPICE-CURVE §4 ranks (BAND_RANK)


def load_baseline():
    """Return the set of known-ERROR fingerprints from build/lint-baseline.json, or the empty
    set if the file is absent. Malformed JSON is treated as absent (fail-closed) but emits its
    own ERROR finding (check id 'baseline-corrupt') via the caller."""
    try:
        with open(BASELINE_PATH, encoding="utf-8") as f:
            data = json.load(f)
        return set(data.get("errors", [])), None
    except FileNotFoundError:
        return set(), None
    except Exception as e:
        return set(), str(e)


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
        findings.append(Finding("ERROR", rel, None, "?", f"unreadable file: {e}",
                                 check="unreadable-file"))
        return
    fm, body = fm_and_body(text)
    if fm.get('type') not in ('table', 'table-set'):
        return
    fm_lines = text[:text.find('\n---', 3) + 4].count('\n') if text.startswith('---') else 0
    lines = body.splitlines()
    seen_any = False

    # ---- CHECK 10b `stale-distribution` (docs/TABLE-ROW-CONTRACT.md §5.4) — file-level, every
    # table/table-set file: preamble/body re-teaching the pre-2026-07-06 conservative distribution.
    if re.search(r"66[\s>*]*Grounded", text, re.I):
        findings.append(Finding("WARN", rel, None, fm.get('id', '?'),
            "re-teaches the pre-2026-07-06 conservative distribution; reword during the "
            "spice re-band / craft pass", check="stale-distribution", span="66"))

    # ---- CHECK 10a `class-mismatch` (§5.4) — file-level, every table/table-set file with a
    # recognizable Band column with cleanly-parsing canonical band words: does the body's max
    # band rank exceed the table_class ceiling?
    table_class = fm.get('table_class', '')
    ceiling = TABLE_CLASS_CEILING.get(table_class)
    if ceiling is not None:
        max_rank = None
        for context, rows, row_start_line in split_blocks(lines):
            info10a = parse_block(context, rows, (fm_lines + row_start_line) if row_start_line else None)
            if info10a is None:
                continue
            band_col10a = None
            for ci, h in enumerate(info10a["header_cells"]):
                if 'band' in h.lower():
                    band_col10a = ci
                    break
            if band_col10a is None:
                continue
            ranks = []
            unparseable10a = False
            for lo, hi, cells, lineno in info10a["parsed"]:
                if band_col10a >= len(cells) or not cells[band_col10a].strip():
                    continue
                r = band_rank(cells[band_col10a])
                if r is None:
                    unparseable10a = True
                    break
                ranks.append(r)
            if unparseable10a or not ranks:
                continue
            block_max = max(ranks)
            if max_rank is None or block_max > max_rank:
                max_rank = block_max
        if max_rank is not None and max_rank > ceiling:
            rank_to_word = {v: k.capitalize() for k, v in BAND_RANK.items()}
            body_band = rank_to_word[max_rank]
            needed = next((cls for cls, c in TABLE_CLASS_CEILING.items() if c >= max_rank), "Commitment")
            findings.append(Finding("WARN", rel, None, fm.get('id', '?'),
                f"body reaches {body_band}; promote table_class to {needed}, never delete or "
                f"narrate-down rows (TABLE-ROW-CONTRACT.md §7)",
                check="class-mismatch", span=body_band))

    # ---- CHECKs 6/7/8/9 (§5.4) — only when the file's frontmatter carries `table_family` ----
    raw_family = fm.get('table_family')
    if raw_family:
        family = FAMILY_ALIASES.get(raw_family.strip(), raw_family.strip())
        row_contract = fm.get('row_contract', 'draft').strip() or 'draft'
        remembers_raw = fm.get('remembers', '')
        remembers_tokens = [t.strip() for t in remembers_raw.split(',') if t.strip()]

        # CHECK 6 `family-unknown` — hard ERROR always (typo'd tag is a spec bug).
        bad_family = family not in FAMILY_ROLES
        bad_contract = fm.get('row_contract') is not None and row_contract not in ('draft', 'enforced')
        bad_remembers = any(t not in REMEMBERS_ENUM for t in remembers_tokens)
        if bad_family or bad_contract or bad_remembers:
            reasons = []
            if bad_family:
                reasons.append(f"table_family {raw_family!r} not in accepted values "
                                f"({', '.join(sorted(FAMILY_ROLES))})")
            if bad_contract:
                reasons.append(f"row_contract {fm.get('row_contract')!r} not one of draft/enforced")
            if bad_remembers:
                bad_tokens = [t for t in remembers_tokens if t not in REMEMBERS_ENUM]
                reasons.append(f"remembers token(s) {bad_tokens} not in accepted values "
                                f"({', '.join(sorted(REMEMBERS_ENUM))})")
            findings.append(Finding("ERROR", rel, None, fm.get('id', '?'),
                "; ".join(reasons), check="family-unknown", span=raw_family))
        else:
            required = FAMILY_ROLES[family]["required"]
            recommended = FAMILY_ROLES[family]["recommended"]
            saw_any_block = False
            for context, rows, row_start_line in split_blocks(lines):
                info_f = parse_block(context, rows, (fm_lines + row_start_line) if row_start_line else None)
                if info_f is None:
                    continue
                saw_any_block = True
                tid_f = fm['id'] if fm['type'] == 'table' else re.sub(
                    r'[^a-z0-9]+', '-', (hint_id(context) or fm['id']).lower()).strip('-')

                # ---- role matching (§5.3 algorithm): walk required-then-recommended roles in
                # order, scan header columns left->right skipping col0 and claimed columns.
                header_norm = [re.sub(r'\s+', ' ', h.lower()).strip() for h in info_f["header_cells"]]
                claimed = {}  # role -> column index
                claimed_cols = set()
                for role in required + recommended:
                    found_ci = None
                    if role == "band":
                        for ci, h in enumerate(header_norm):
                            if ci == 0 or ci in claimed_cols:
                                continue
                            if 'band' in h:
                                found_ci = ci
                                break
                    else:
                        syns = ROLE_SYNONYMS.get(role, [])
                        for ci, h in enumerate(header_norm):
                            if ci == 0 or ci in claimed_cols:
                                continue
                            if h in syns:
                                found_ci = ci
                                break
                    if found_ci is not None:
                        claimed[role] = found_ci
                        claimed_cols.add(found_ci)

                # CHECK 7 `family-missing` — each REQUIRED role with no claimed column.
                for role in required:
                    if role not in claimed:
                        sev = "ERROR" if row_contract == "enforced" else "WARN"
                        findings.append(Finding(sev, rel, info_f["header_line"], tid_f,
                            f"family '{family}' missing required role '{role}' "
                            f"(schema: {' | '.join(['Band'] + [r.capitalize() for r in required[1:]] if required[0]=='band' else [r.capitalize() for r in required])}) "
                            f"— TABLE-ROW-CONTRACT.md §2",
                            check="family-missing", span=role))

                # RECOMMENDED-role gaps — --verbose only, never counted/gated.
                if VERBOSE:
                    for role in recommended:
                        if role not in claimed:
                            findings.append(Finding("WARN", rel, info_f["header_line"], tid_f,
                                f"family '{family}' missing recommended role '{role}'",
                                check="family-missing-recommended", span=role))

                # CHECK 9 `inert-column` — for each CLAIMED role column (excluding band) in a
                # block with >=10 data rows: if >=90% of its cells are empty -> WARN.
                nrows = len(info_f["parsed"])
                if nrows >= 10:
                    for role, ci in claimed.items():
                        if role == "band":
                            continue
                        empty_n = 0
                        for lo, hi, cells, lineno in info_f["parsed"]:
                            if ci >= len(cells) or not cells[ci].strip():
                                empty_n += 1
                        if empty_n / nrows >= 0.90:
                            findings.append(Finding("WARN", rel, info_f["header_line"], tid_f,
                                f"column claimed for role '{role}' is >=90% empty across "
                                f"{nrows} rows — looks decorative, not functional",
                                check="inert-column", span=role))

            # CHECK 8 `family-nondice` — family-tagged file where NO block parses as a dice table.
            if not saw_any_block:
                findings.append(Finding("WARN", rel, None, fm.get('id', '?'),
                    f"table_family '{raw_family}' declared but no dice block found in this file "
                    f"— family checks skipped", check="family-nondice", span=raw_family))

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
                    f"{' …' if len(info['overlaps']) > 8 else ''}",
                    check="coverage-overlap", span=",".join(str(v) for v in info["overlaps"][:3])))
            if info["gaps"]:
                findings.append(Finding("ERROR", rel, info["header_line"], tid,
                    f"gap in roll-range coverage ({info['dice']} {info['rmin']}-{info['rmax']}): "
                    f"missing {info['gaps'][:8]}{' …' if len(info['gaps']) > 8 else ''}",
                    check="coverage-gap", span=",".join(str(v) for v in info["gaps"][:3])))
            if info["starts_high"]:
                # mirrors compile-tables.py's "starts-high" — ambiguous, not necessarily wrong
                # (could be a legitimate un-declared bell table). Soft warning, matches compiler tone.
                findings.append(Finding("WARN", rel, info["header_line"], tid,
                    f"table starts at {info['amin']}, no matching (NdM) heading declaration — "
                    f"add a dice heading if this is a bell/mixed table, per compile-tables.py",
                    check="starts-high", span=str(info["amin"])))

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
                            check_id = "band-dip" if sev == "ERROR" else "band-reset"
                            band_span = f"{run[0][0]}-{run[-1][0]}" if len(run) > 1 else f"{run[0][0]}"
                            findings.append(Finding(sev, rel, run[0][3], tid,
                                f"band regression, {kind}: {span} drop below the roll-{peak_lo} "
                                f"peak of '{peak_raw}' (rank {peak_rank}) — higher roll should be "
                                f">= tier, per Adam's spice invariant (docs/SPICE-CURVE.md)",
                                check=check_id, span=band_span))
                            run = []
                        peak_rank, peak_lo, peak_raw = r, lo, raw
                if run:
                    sev = "WARN" if len(run) >= DIP_RUN_THRESHOLD else "ERROR"
                    span = f"rolls {run[0][0]}-{run[-1][0]}" if len(run) > 1 else f"roll {run[0][0]}"
                    kind = "sustained reset (possible intentional multi-wave table)" if sev == "WARN" \
                        else "isolated dip (likely an authoring slip)"
                    check_id = "band-dip" if sev == "ERROR" else "band-reset"
                    band_span = f"{run[0][0]}-{run[-1][0]}" if len(run) > 1 else f"{run[0][0]}"
                    findings.append(Finding(sev, rel, run[0][3], tid,
                        f"band regression, {kind}: {span} drop below the roll-{peak_lo} peak of "
                        f"'{peak_raw}' (rank {peak_rank}) — higher roll should be >= tier, per "
                        f"Adam's spice invariant (docs/SPICE-CURVE.md)",
                        check=check_id, span=band_span))

        # ---- CHECK 5: empty cells in required columns ----
        for lo, hi, cells, lineno in info["parsed"]:
            if band_col is not None and band_col < len(cells) and not cells[band_col].strip():
                findings.append(Finding("WARN", rel, lineno, tid,
                    f"empty Band cell on roll {lo}", check="empty-band", span=str(lo)))

        # ---- CHECK 4: malformed row syntax (column count mismatch vs header) ----
        # WARNING ONLY — compile-tables.py never compares column counts (every access is
        # `ci < len(cells)` guarded), so a ragged row compiles fine. Still worth flagging: it's
        # usually an authoring slip (a missing "|" cell) even when it happens to be harmless.
        nheader = len(info["header_cells"])
        for lo, hi, cells, lineno in info["parsed"]:
            if len(cells) != nheader:
                findings.append(Finding("WARN", rel, lineno, tid,
                    f"row has {len(cells)} cells, header has {nheader} (roll {lo})",
                    check="ragged-row", span=str(lo)))

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
                    f"{content[:70]!r}", check="dup-row", span=str(lo)))
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

    # ---- baseline ratchet (docs/TABLE-ROW-CONTRACT.md §5.6) ----
    baseline, baseline_err = (set(), None) if NO_BASELINE else load_baseline()
    if baseline_err is not None:
        findings.append(Finding("ERROR", "build/lint-baseline.json", None, "?",
            f"baseline file malformed JSON ({baseline_err}) — treating as absent (fail-closed)",
            check="baseline-corrupt"))
        errors = [x for x in findings if x.sev == "ERROR"]

    if UPDATE_BASELINE:
        new_baseline = {
            "version": 1,
            "generated": __import__("datetime").date.today().isoformat(),
            "note": "Known pre-existing hard ERRORs. Lint fails only on ERRORs NOT listed here. "
                    "Regenerate deliberately with --update-baseline; shrinking this file is "
                    "progress, growing it needs a reason in the commit message.",
            "errors": sorted(x.fingerprint for x in errors),
        }
        with open(BASELINE_PATH, "w", encoding="utf-8") as f:
            json.dump(new_baseline, f, indent=2)
            f.write("\n")
        print(f"--update-baseline: wrote {len(new_baseline['errors'])} fingerprint(s) to "
              f"{os.path.relpath(BASELINE_PATH, BASE)}:")
        for fp in new_baseline["errors"]:
            print(f"  {fp}")
        sys.exit(0)

    for x in errors:
        x._baselined = x.fingerprint in baseline
    new_errors = [x for x in errors if not x._baselined]
    baselined_errors = [x for x in errors if x._baselined]

    # stale-baseline: a baseline entry matching no current finding.
    current_fps = {x.fingerprint for x in errors}
    stale = sorted(fp for fp in baseline if fp not in current_fps)
    for fp in stale:
        findings.append(Finding("WARN", "build/lint-baseline.json", None, "?",
            f"baseline entry no longer fires — run --update-baseline: {fp}",
            check="stale-baseline", span=fp))
    # RECOMMENDED-role gaps (family-missing-recommended) are --verbose-only reporting and are
    # NEVER counted in the summary line or the gate, per TABLE-ROW-CONTRACT.md §5.4 CHECK 7.
    VERBOSE_ONLY_CHECKS = {"family-missing-recommended"}
    warns = [x for x in findings if x.sev == "WARN" and x.check not in VERBOSE_ONLY_CHECKS]
    verbose_extra = [x for x in findings if x.sev == "WARN" and x.check in VERBOSE_ONLY_CHECKS]

    mode = "WARN-ONLY" if WARN_ONLY else "LINT"
    print(f"{mode} — files scanned: {len(files)} | tables/blocks checked: {tables_seen} | "
          f"errors: {len(errors)} (new: {len(new_errors)}, baselined: {len(baselined_errors)}) | "
          f"warnings: {len(warns)}")

    if errors:
        print(f"\nHARD ERRORS ({len(errors)}):")
        for x in errors:
            print(x)
    shown = warns + verbose_extra if VERBOSE else warns
    if shown:
        print(f"\nWARNINGS ({len(shown)}):")
        for x in shown:
            print(x)
    if not errors and not shown:
        print("\nclean — no findings.")

    if new_errors and not WARN_ONLY:
        print(f"\nFAIL — {len(new_errors)} new hard error(s) (not in baseline). Fix the source "
              f"markdown, or re-run with --warn-only to see findings without failing the gate.")
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
