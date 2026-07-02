#!/usr/bin/env python3
"""dev/session-cost-report.py — the DIGEST-DIET §4b measuring instrument.

Read-only over .dm/ + state.json (extends the 2026-07-01 live-session ad-hoc audit that produced
DIGEST-DIET.md's §0 numbers). Reports, for the CURRENT mailbox:

  - per-turn payload bytes BY DIGEST BLOCK (compact JSON, not the on-disk pretty-print — see the
    dm.js sendTurn comment: 63,331-vs-48,540 was an indent-vs-compact mismatch, not a real gap)
  - latency percentiles (from dmlog's `latencyMs`, stamped in applyResponse)
  - lane distribution (fast vs deep) — joined turn-*.json.lane against dmlog via the `turnId` DIGEST-
    DIET stamped onto both sides (older sessions predating the fix show as "unjoined")
  - narration lengths (word count of each dmlog "dm" entry)
  - turn classification (check-resolve / dice-only / shop-adjacent / travel / freeform) — a cheap
    heuristic over the player action text + whether rolls rode the turn; answers "which turns needed
    a DM at all" (a large mechanical share is the trigger to spec auto-resolve classes — a decision
    gate for Adam, not a build item here).

Safe during live play: never touches the mailbox (no writes, no /reset). Run any time:
    python3 dev/session-cost-report.py
    python3 dev/session-cost-report.py --state /path/to/other/state.json
"""
import argparse
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DM_DIR = os.path.join(ROOT, ".dm")

DIGEST_BLOCKS = ["clock", "location", "setting", "pc", "powers", "fronts", "recentLedger",
                 "gazetteer", "codex", "codexRoster", "minted", "revealed", "sessionLean", "activeWalk"]

TRAVEL_RE = re.compile(r"\b(travel|walk|go|head|ride|march|journey)\b", re.I)
SHOP_RE = re.compile(r"\b(buy|sell|shop|barter|purchase|haggle|vendor|merchant)\b", re.I)
CHECK_RE = re.compile(r"\bi roll\b", re.I)      # dmRollFor/dmRollDice's synthesized action text


def load_json(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return None


def compact_len(v):
    return len(json.dumps(v)) if v is not None else 0


def classify_turn(action, rolls):
    txt = action or ""
    if rolls:
        return "dice-only" if CHECK_RE.search(txt) else "check-resolve"
    if SHOP_RE.search(txt):
        return "shop-adjacent"
    if TRAVEL_RE.search(txt):
        return "travel"
    return "freeform"


def percentile(sorted_vals, pct):
    if not sorted_vals:
        return None
    k = (len(sorted_vals) - 1) * (pct / 100.0)
    lo, hi = int(k), min(int(k) + 1, len(sorted_vals) - 1)
    if lo == hi:
        return sorted_vals[lo]
    frac = k - lo
    return sorted_vals[lo] + (sorted_vals[hi] - sorted_vals[lo]) * frac


def active_world(state):
    if not state:
        return None
    wid = state.get("activeWorldId")
    worlds = state.get("worlds") or {}
    if wid and wid in worlds:
        return worlds[wid]
    if len(worlds) == 1:
        return next(iter(worlds.values()))
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--state", default=os.path.join(DM_DIR, "state.json"))
    ap.add_argument("--dm-dir", default=DM_DIR)
    args = ap.parse_args()

    turn_files = sorted(glob.glob(os.path.join(args.dm_dir, "turn-*.json")))
    turns = {}
    for tp in turn_files:
        d = load_json(tp)
        if not d:
            continue
        tid = d.get("turnId") or os.path.basename(tp)[len("turn-"):-len(".json")]
        turns[tid] = d

    print("=== Genesis session cost report — dev/session-cost-report.py ===")
    print("turns found:", len(turns), "in", args.dm_dir)

    # --- per-turn payload bytes by digest block ---
    if turns:
        totals = {b: 0 for b in DIGEST_BLOCKS}
        envelope_total = 0
        digest_total = 0
        n = 0
        for d in turns.values():
            dig = d.get("digest") or {}
            n += 1
            envelope_total += compact_len({k: v for k, v in d.items() if k != "digest"})
            digest_total += compact_len(dig)
            for b in DIGEST_BLOCKS:
                totals[b] += compact_len(dig.get(b))
        print("\n-- payload bytes (compact JSON, avg per turn) --")
        print(f"  envelope (outside digest): {envelope_total // n} B")
        print(f"  digest total:              {digest_total // n} B")
        for b in DIGEST_BLOCKS:
            avg = totals[b] // n
            if avg:
                print(f"    {b:<14} {avg} B")

    # --- dmlog-derived: latency / lane / narration length / classification ---
    state = load_json(args.state)
    w = active_world(state)
    dmlog = (w or {}).get("dmlog") or []
    latencies = sorted(e["latencyMs"] for e in dmlog if e.get("role") == "dm" and isinstance(e.get("latencyMs"), (int, float)))
    if latencies:
        print("\n-- latency (ms), from dmlog.latencyMs --")
        print(f"  n={len(latencies)}  median={percentile(latencies,50):.0f}  p90={percentile(latencies,90):.0f}  max={max(latencies):.0f}")
    else:
        print("\n-- latency: no dmlog latencyMs samples --")

    # lane distribution: join dmlog's player-turn turnId -> turn-*.json.lane
    lane_counts = {}
    unjoined = 0
    player_lines = [e for e in dmlog if e.get("role") == "player"]
    for e in player_lines:
        tid = e.get("turnId")
        d = turns.get(tid) if tid else None
        if d is None:
            unjoined += 1
            continue
        lane = d.get("lane") or "unknown"
        lane_counts[lane] = lane_counts.get(lane, 0) + 1
    if player_lines:
        print("\n-- lane distribution (dmlog turnId <-> turn-*.json.lane) --")
        for lane, n in sorted(lane_counts.items()):
            print(f"  {lane:<8} {n}")
        if unjoined:
            print(f"  unjoined  {unjoined}  (no turnId on the dmlog entry — pre-DIGEST-DIET session, or turn file missing)")

    # narration lengths
    dm_lines = [e for e in dmlog if e.get("role") == "dm"]
    if dm_lines:
        lens = sorted(len((e.get("text") or "").split()) for e in dm_lines)
        print("\n-- narration length (words) --")
        print(f"  n={len(lens)}  median={percentile(lens,50):.0f}  p90={percentile(lens,90):.0f}  max={max(lens)}")

    # turn classification (over the turn-*.json action/rolls — the mechanical source, not dmlog prose)
    if turns:
        classes = {}
        for d in turns.values():
            classes[classify_turn(d.get("action"), d.get("rolls"))] = classes.get(classify_turn(d.get("action"), d.get("rolls")), 0) + 1
        print("\n-- turn classification (which turns needed a DM at all) --")
        for c, n in sorted(classes.items(), key=lambda kv: -kv[1]):
            print(f"  {c:<14} {n}")

    print()
    return 0


if __name__ == "__main__":
    sys.exit(main())
