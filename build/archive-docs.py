#!/usr/bin/env python3
"""archive-docs.py — roll old entries out of the living docs into their archives.

THE RULE (adopted 2026-07-09, Adam's ruling — token discipline for session-start reads):
  * docs/CHANGELOG.md keeps the newest KEEP_CHANGELOG dated `## ` entries; everything older
    rolls into docs/CHANGELOG-ARCHIVE.md (global newest-first order preserved across both files).
  * docs/NEXT-STEPS.md keeps at most KEEP_DO_NEXT `## Do next (...)` blocks; older ones roll
    into docs/NEXT-STEPS-ARCHIVE.md. Only `## Do next` blocks are candidates — the standing
    plan sections (tracks/layers/loot/etc.) are never touched. Blocks are aged by the date
    parsed from their heading; a block with no parseable date is left alone (conservative:
    this script must never archive something it can't prove is old).

Run modes (same convention as build/gen-dm-contract.py):
  python3 build/archive-docs.py            dry-run report (what would move, no writes)
  python3 build/archive-docs.py --emit     perform the roll
  python3 build/archive-docs.py --check    exit 1 if either file is over its cap (close-ritual gate)

Archives are append-only history — never hand-edit them, never add new entries there directly.
"""
import re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KEEP_CHANGELOG = 25   # newest entries kept in docs/CHANGELOG.md
KEEP_DO_NEXT = 4      # newest `## Do next` blocks kept in docs/NEXT-STEPS.md (one per active lane)

CHANGELOG = ROOT / "docs/CHANGELOG.md"
CHANGELOG_ARCHIVE = ROOT / "docs/CHANGELOG-ARCHIVE.md"
NEXT_STEPS = ROOT / "docs/NEXT-STEPS.md"
NEXT_STEPS_ARCHIVE = ROOT / "docs/NEXT-STEPS-ARCHIVE.md"

CHANGELOG_ARCHIVE_HEADER = """---
type: changelog-archive
branch: Genesis
status: historical
created: 2026-07-09
related:
  - "[[CHANGELOG]]"
---

# Genesis — Changelog Archive

Older entries rolled out of `CHANGELOG.md` by `build/archive-docs.py` to keep the live file cheap
to load every session (the live file keeps the newest entries; see the script for the cap).
Newest-first, same as the live file — the two files read as one continuous history, live file
first. Read-only record: never hand-edit, never add entries here directly.

"""

DATE_RE = re.compile(r"\((\d{4}-\d{2}-\d{2})")


def split_blocks(text):
    """Split at top-level `## ` headings -> (preamble, [block, ...]); blocks keep their text verbatim."""
    lines = text.splitlines(keepends=True)
    idxs = [i for i, ln in enumerate(lines) if ln.startswith("## ")]
    if not idxs:
        return text, []
    preamble = "".join(lines[: idxs[0]])
    blocks = []
    for n, i in enumerate(idxs):
        j = idxs[n + 1] if n + 1 < len(idxs) else len(lines)
        blocks.append("".join(lines[i:j]))
    return preamble, blocks


def insert_into_archive(archive_path, header, overflow_blocks):
    """Insert overflow (newer than anything already archived) before the archive's first entry."""
    if archive_path.exists():
        text = archive_path.read_text(encoding="utf-8")
    else:
        text = header
    pre, blocks = split_blocks(text)
    return pre + "".join(overflow_blocks) + "".join(blocks)


def roll_changelog(emit):
    text = CHANGELOG.read_text(encoding="utf-8")
    pre, blocks = split_blocks(text)
    over = len(blocks) - KEEP_CHANGELOG
    if over <= 0:
        print(f"CHANGELOG.md: {len(blocks)} entries (cap {KEEP_CHANGELOG}) — nothing to roll")
        return 0
    keep, overflow = blocks[:KEEP_CHANGELOG], blocks[KEEP_CHANGELOG:]
    print(f"CHANGELOG.md: {len(blocks)} entries (cap {KEEP_CHANGELOG}) — rolling {over} to CHANGELOG-ARCHIVE.md")
    if emit:
        CHANGELOG_ARCHIVE.write_text(
            insert_into_archive(CHANGELOG_ARCHIVE, CHANGELOG_ARCHIVE_HEADER, overflow), encoding="utf-8")
        CHANGELOG.write_text(pre + "".join(keep), encoding="utf-8")
    return over


def roll_next_steps(emit):
    text = NEXT_STEPS.read_text(encoding="utf-8")
    pre, blocks = split_blocks(text)
    dated = []   # (date, order-in-file, index) for Do-next blocks with a parseable date
    for i, b in enumerate(blocks):
        heading = b.splitlines()[0]
        if not heading.startswith("## Do next"):
            continue
        m = DATE_RE.search(heading)
        if not m:
            print(f"NEXT-STEPS.md: undated Do-next block left alone: {heading.strip()}")
            continue
        dated.append((m.group(1), i))
    over = len(dated) - KEEP_DO_NEXT
    if over <= 0:
        print(f"NEXT-STEPS.md: {len(dated)} dated Do-next blocks (cap {KEEP_DO_NEXT}) — nothing to roll")
        return 0
    # oldest first: by date, then by position (LOWER in the file = older, per the append-at-top habit
    # of the main queue; ties beyond that are all same-day lanes and stay put unless still over cap)
    oldest = sorted(dated, key=lambda t: (t[0], -t[1]))[:over]
    move_idx = {i for _, i in oldest}
    print(f"NEXT-STEPS.md: {len(dated)} dated Do-next blocks (cap {KEEP_DO_NEXT}) — rolling {over}:")
    for i in sorted(move_idx):
        print("  →", blocks[i].splitlines()[0].strip())
    if emit:
        overflow = [blocks[i] for i in sorted(move_idx)]
        keep = [b for i, b in enumerate(blocks) if i not in move_idx]
        NEXT_STEPS_ARCHIVE.write_text(
            insert_into_archive(NEXT_STEPS_ARCHIVE, "", overflow), encoding="utf-8")
        NEXT_STEPS.write_text(pre + "".join(keep), encoding="utf-8")
    return over


def main():
    emit = "--emit" in sys.argv
    checking = "--check" in sys.argv
    over = roll_changelog(emit) + roll_next_steps(emit)
    if checking and over > 0:
        print(f"OVER CAP: {over} entries need archiving — run: python3 build/archive-docs.py --emit")
        sys.exit(1)
    if not emit and not checking and over > 0:
        print("(dry run — nothing written; use --emit to perform the roll)")
    print("RESULT: OK")


if __name__ == "__main__":
    main()
