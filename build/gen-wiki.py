#!/usr/bin/env python3
"""Genesis build — generate data/wiki.js from docs/ARCHITECTURE.md.

The compile seam for the in-game Wiki (docs/REFERENCE-SHELF.md, "Registered app #2 — Wiki").
ARCHITECTURE.md is the hand-authored, human-readable index of every system; this script parses
it into data/wiki.js (owns WIKI_INDEX) for src/ui/ref-wiki.js to render. Edit-source→compile-
artifact: never hand-edit data/wiki.js — edit docs/ARCHITECTURE.md and re-run this.

THE PARSER CONTRACT (docs/REFERENCE-SHELF.md, "gen-wiki.py — the parser contract" — implemented
here EXACTLY; do not drift from this without updating both the spec and this header):

1. Layer = an `## ` heading that contains >=1 `### ` subsection carrying `**What it is.**` (this
   is what skips the preamble section and "The two spines & the through-line" — neither has a
   qualifying `###` under it). Layer label = the heading text with the trailing ` (…)`
   parenthetical stripped, e.g. "Engine layer (deterministic — rolls atoms, never narrates)" ->
   "Engine layer".
2. System = each `### ` heading under a qualifying `## ` layer. `system` = the full heading text.
   `slug` = lowercase, non-alphanumeric runs -> `-`, collapsed, trimmed of leading/trailing `-`.
3. Fields — punctuation lives INSIDE the bold marker:
   - `**What it is.**` / `**How it works.**` — value = the remainder of that line, plus any
     continuation lines, until the next `**`-prefixed line.
   - `**Lives in:**` — value runs up to the next `**Spec:**` marker, which may appear on the
     SAME line (inline, after `**Lives in:** ...`) or on the NEXT line — both forms occur in
     ARCHITECTURE.md and both must be handled. Split the collected text on commas, strip
     backticks and a trailing period from each piece -> `livesIn[]`.
   - `**Spec:**` — the remainder of that field (same-line remainder after `**Lives in:**`'s
     content, or its own line). Strip whitespace; a bare `—` (em dash) -> `null`.
4. HARD-FAIL (non-zero exit, message to stderr) if any `###` system is missing any of the four
   fields (whatItIs, howItWorks, livesIn, spec-field-presence — spec VALUE may legitimately be
   null via `—`, but the `**Spec:**` marker itself must be present), or if the number of parsed
   systems disagrees with the number of `###` headings found under qualifying layers.
   WARN (stderr, exit 0) if the footer line `*N systems indexed` does not match the parsed count.
5. Emit data/wiki.js: a generated-file header (including this exact compile command:
   `python3 build/gen-wiki.py`), then `const WIKI_INDEX = [{system,slug,layer,whatItIs,
   howItWorks,livesIn,spec}, ...]` in file (document) order. IDEMPOTENT — the same input must
   produce a byte-identical file across runs (no timestamps, no nondeterministic ordering).

Run: python3 build/gen-wiki.py
Then: python3 build/check-manifest.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_PATH = ROOT / "docs" / "ARCHITECTURE.md"
OUT_PATH = ROOT / "data" / "wiki.js"

FIELD_WHAT = "**What it is.**"
FIELD_HOW = "**How it works.**"
FIELD_LIVES = "**Lives in:**"
FIELD_SPEC = "**Spec:**"


def slugify(text):
    s = text.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = s.strip("-")
    s = re.sub(r"-{2,}", "-", s)
    return s


def strip_layer_label(heading_text):
    # strip a trailing " (…)" parenthetical, e.g. "Engine layer (deterministic — ...)" -> "Engine layer"
    return re.sub(r"\s*\([^)]*\)\s*$", "", heading_text).strip()


def clean_lives_in(raw):
    pieces = [p.strip() for p in raw.split(",")]
    out = []
    for p in pieces:
        if not p:
            continue
        p = p.strip()
        p = p.rstrip(".")   # trailing sentence period (may sit AFTER the closing backtick)
        p = p.strip("`")    # backticks around the path
        p = p.strip()
        if p:
            out.append(p)
    return out


def clean_spec(raw):
    v = raw.strip()
    if v == "—" or v == "-" or v == "":
        return None
    # a spec value may itself carry a trailing period from prose flow; specs are file paths, so
    # don't strip meaningful characters — just trim whitespace.
    return v


def parse(text):
    lines = text.split("\n")
    n = len(lines)

    # pass 1: find every "## " heading and every "### " heading with its line index and the
    # "## " layer it falls under.
    layer_headings = []  # (line_idx, heading_text)
    system_headings = []  # (line_idx, heading_text, layer_line_idx)
    current_layer_idx = None
    current_layer_text = None

    for i, line in enumerate(lines):
        if line.startswith("### "):
            system_headings.append((i, line[4:].strip(), current_layer_idx))
        elif line.startswith("## "):
            current_layer_idx = i
            current_layer_text = line[3:].strip()
            layer_headings.append((i, current_layer_text))

    # pass 2: a "## " layer QUALIFIES only if >=1 of its "### " children carries **What it is.**
    # somewhere before the next heading of level <= 2. Determine each system's body span first.
    heading_positions = sorted(set([h[0] for h in layer_headings] + [s[0] for s in system_headings] + [n]))

    def body_span(start_idx):
        # body runs from start_idx+1 up to (not including) the next heading line (## or ###) or EOF
        j = start_idx + 1
        while j < n and not (lines[j].startswith("## ") or lines[j].startswith("### ")):
            j += 1
        return start_idx + 1, j

    qualifying_layers = set()
    for sys_idx, _sys_text, layer_idx in system_headings:
        body_start, body_end = body_span(sys_idx)
        body_text = "\n".join(lines[body_start:body_end])
        if FIELD_WHAT in body_text and layer_idx is not None:
            qualifying_layers.add(layer_idx)

    layer_label_by_idx = {idx: strip_layer_label(text) for idx, text in layer_headings}

    entries = []
    errors = []
    total_system_headings_under_qualifying_layers = 0

    for sys_idx, sys_text, layer_idx in system_headings:
        if layer_idx is None or layer_idx not in qualifying_layers:
            continue
        total_system_headings_under_qualifying_layers += 1

        body_start, body_end = body_span(sys_idx)
        body_lines = lines[body_start:body_end]
        body_text = "\n".join(body_lines)

        system = sys_text
        slug = slugify(system)
        layer = layer_label_by_idx[layer_idx]

        # locate each field's start line within body_lines by marker prefix
        def find_marker_line(marker):
            for k, bl in enumerate(body_lines):
                if bl.lstrip().startswith(marker):
                    return k
            return None

        idx_what = find_marker_line(FIELD_WHAT)
        idx_how = find_marker_line(FIELD_HOW)
        idx_lives = find_marker_line(FIELD_LIVES)
        idx_spec_line = find_marker_line(FIELD_SPEC)  # may be None if Spec is same-line as Lives-in

        missing = []
        if idx_what is None:
            missing.append("What it is")
        if idx_how is None:
            missing.append("How it works")
        if idx_lives is None:
            missing.append("Lives in")
        # Spec must be present EITHER as its own marker line OR inline within the Lives-in line
        has_inline_spec = idx_lives is not None and FIELD_SPEC in body_lines[idx_lives]
        if idx_spec_line is None and not has_inline_spec:
            missing.append("Spec")

        if missing:
            errors.append(f"### {system}: missing field(s): {', '.join(missing)}")
            continue

        # --- What it is: from idx_what to (idx_how - 1) ---
        what_chunk = body_lines[idx_what:idx_how]
        what_chunk[0] = what_chunk[0].split(FIELD_WHAT, 1)[1]
        what_it_is = " ".join(x.strip() for x in what_chunk if x.strip()).strip()

        # --- How it works: from idx_how to (idx_lives - 1) ---
        how_chunk = body_lines[idx_how:idx_lives]
        how_chunk[0] = how_chunk[0].split(FIELD_HOW, 1)[1]
        how_it_works = " ".join(x.strip() for x in how_chunk if x.strip()).strip()

        # --- Lives in / Spec: two shapes ---
        if has_inline_spec:
            # same-line: "**Lives in:** `a.js`, `b.js`. **Spec:** docs/FOO.md"
            lives_line = body_lines[idx_lives]
            after_lives = lives_line.split(FIELD_LIVES, 1)[1]
            lives_raw, spec_raw = after_lives.split(FIELD_SPEC, 1)
            spec_chunk_lines = [spec_raw] + (body_lines[idx_lives + 1:] if idx_spec_line is None else [])
            spec_raw_full = spec_chunk_lines[0]
        else:
            # next-line: Lives-in spans idx_lives..idx_spec_line-1, Spec starts at idx_spec_line
            lives_chunk = body_lines[idx_lives:idx_spec_line]
            lives_chunk[0] = lives_chunk[0].split(FIELD_LIVES, 1)[1]
            lives_raw = " ".join(x.strip() for x in lives_chunk if x.strip())
            spec_line = body_lines[idx_spec_line]
            spec_raw_full = spec_line.split(FIELD_SPEC, 1)[1]

        lives_in = clean_lives_in(lives_raw)
        spec = clean_spec(spec_raw_full)

        entries.append({
            "system": system,
            "slug": slug,
            "layer": layer,
            "whatItIs": what_it_is,
            "howItWorks": how_it_works,
            "livesIn": lives_in,
            "spec": spec,
        })

    if errors:
        sys.stderr.write("gen-wiki.py: HARD-FAIL — malformed system entries:\n")
        for e in errors:
            sys.stderr.write(f"  - {e}\n")
        sys.exit(1)

    if len(entries) != total_system_headings_under_qualifying_layers:
        sys.stderr.write(
            f"gen-wiki.py: HARD-FAIL — parsed {len(entries)} entries but found "
            f"{total_system_headings_under_qualifying_layers} qualifying ### headings.\n"
        )
        sys.exit(1)

    # footer check: "*N systems indexed" — warn only, non-fatal
    footer_match = re.search(r"\*(\d+) systems indexed", text)
    if footer_match:
        footer_n = int(footer_match.group(1))
        if footer_n != len(entries):
            sys.stderr.write(
                f"gen-wiki.py: WARN — footer says {footer_n} systems indexed, parsed {len(entries)}.\n"
            )
    else:
        sys.stderr.write("gen-wiki.py: WARN — no '*N systems indexed' footer line found.\n")

    return entries


def render_js(entries):
    header = f"""/* GENESIS DATA — data/wiki.js — GENERATED, do not hand-edit.
   Source: docs/ARCHITECTURE.md. Compile: python3 build/gen-wiki.py
   Then: python3 build/check-manifest.py

   Owns: WIKI_INDEX — the in-game Wiki's index (src/ui/ref-wiki.js renders this;
   docs/REFERENCE-SHELF.md "Registered app #2 — Wiki"). Each entry:
   {{system, slug, layer, whatItIs, howItWorks, livesIn[], spec}}.
   Edit docs/ARCHITECTURE.md and re-run the compile command above — never hand-edit this file. */
"""
    body = "const WIKI_INDEX = " + json.dumps(entries, indent=2, ensure_ascii=False) + ";\n"
    return header + body


def main():
    if not SRC_PATH.exists():
        sys.stderr.write(f"gen-wiki.py: source not found: {SRC_PATH}\n")
        sys.exit(1)

    text = SRC_PATH.read_text(encoding="utf-8")
    entries = parse(text)

    out = render_js(entries)
    OUT_PATH.write_text(out, encoding="utf-8")
    print(f"gen-wiki.py: wrote {OUT_PATH.relative_to(ROOT)} — {len(entries)} systems.")


if __name__ == "__main__":
    main()
