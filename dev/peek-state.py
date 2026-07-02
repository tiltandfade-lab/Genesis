#!/usr/bin/env python3
"""dev/peek-state.py — scoped reads of .dm/state.json for the DM loop (docs/DIGEST-DIET.md §1).

The app POSTs a full `state.json` snapshot every turn (postState(), src/world/dm.js) so the DM
always has one read away from the whole world if the (now-lean) digest isn't enough. The DM must
NEVER raw-read state.json (a raw read is ~90k tokens — the runbook forbids it, docs/DM-BRIDGE.md).
This is the filtered-query alternative: small, targeted stdout, never the whole file.

Usage:
    python3 dev/peek-state.py codex <id>            one codex record, full shape
    python3 dev/peek-state.py codex --kind npc       every record of one kind, roster-shaped
    python3 dev/peek-state.py ledger -n 12           the last N ledger entries (default 12)
    python3 dev/peek-state.py walk                   the active walk's prep node (cursor/cast/segments)
    python3 dev/peek-state.py handoff                the prep bundle (stub — {} until PREP-AUTOPILOT unit 7 lands)

    --state <path>   read a different state.json (default .dm/state.json) — for test fixtures only.

Exit codes: 0 = printed something; 1 = state.json missing/unreadable; 2 = bad id/args.
"""
import json, os, sys, argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE_PATH = os.path.join(ROOT, ".dm", "state.json")


def load_state(path):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return None


def active_world(state):
    wid = state.get("activeWorldId")
    worlds = state.get("worlds") or {}
    if wid and wid in worlds:
        return worlds[wid]
    # postState() ships a single-world snapshot ({worlds:{[w.id]:w}}) — fall back to the only entry.
    if len(worlds) == 1:
        return next(iter(worlds.values()))
    return None


def cmd_codex(w, args):
    records = ((w.get("codex") or {}).get("records")) or {}
    if args.id:
        r = records.get(args.id)
        if r is None:
            print("no such codex record:", args.id, file=sys.stderr)
            return 2
        print(json.dumps(r, indent=2))
        return 0
    kind = args.kind
    out = [r for r in records.values() if not kind or r.get("kind") == kind]
    if not out:
        print("no codex records" + (" of kind " + kind if kind else ""), file=sys.stderr)
        return 2
    # roster-shaped (DIGEST-DIET §1's codexRoster line) — one-liners, not full records
    lines = [{"id": r.get("id"), "kind": r.get("kind"), "name": r.get("name"),
              "at": (r.get("status") or {}).get("at"), "known": bool((r.get("status") or {}).get("known"))}
             for r in out]
    print(json.dumps(lines, indent=2))
    return 0


def cmd_ledger(w, args):
    entries = w.get("ledger") or []
    n = max(1, args.n)
    print(json.dumps(entries[-n:], indent=2))
    return 0


def cmd_walk(w, args):
    prep = w.get("prep") or {}
    wid = prep.get("activeWalkId")
    if not wid:
        print("no active walk", file=sys.stderr)
        return 2
    pn = (prep.get("nodes") or {}).get(wid)
    if pn is None:
        print("active walk id set but no prep node found:", wid, file=sys.stderr)
        return 2
    print(json.dumps({"nodeId": wid, "node": pn}, indent=2))
    return 0


def cmd_handoff(w, args):
    # PREP-AUTOPILOT (G8): byte-equivalent to the RAW prep bundle object once that unit lands. Stubbed
    # here per BATCH-GUARDRAILS G2 ("the last lands in unit 7; stub it printing {} now").
    print(json.dumps({}))
    return 0


def main():
    ap = argparse.ArgumentParser(prog="peek-state.py", add_help=True)
    ap.add_argument("--state", default=STATE_PATH, help="path to a state.json fixture (default .dm/state.json)")
    sub = ap.add_subparsers(dest="cmd")

    p_codex = sub.add_parser("codex")
    p_codex.add_argument("id", nargs="?", default=None)
    p_codex.add_argument("--kind", default=None)

    p_ledger = sub.add_parser("ledger")
    p_ledger.add_argument("-n", type=int, default=12)

    sub.add_parser("walk")
    sub.add_parser("handoff")

    args = ap.parse_args()
    if not args.cmd:
        ap.print_help()
        return 2

    # `handoff` is stubbed ({} always) and deliberately doesn't need a live world — print before the
    # state/world load-or-fail gate below so it works even with no .dm/state.json yet.
    if args.cmd == "handoff":
        return cmd_handoff(None, args)

    state = load_state(args.state)
    if state is None:
        print("no state.json yet — the app posts one on the first turn", file=sys.stderr)
        return 1
    w = active_world(state)
    if w is None:
        print("no active world in state.json", file=sys.stderr)
        return 1

    if args.cmd == "codex":
        return cmd_codex(w, args)
    if args.cmd == "ledger":
        return cmd_ledger(w, args)
    if args.cmd == "walk":
        return cmd_walk(w, args)
    ap.print_help()
    return 2


if __name__ == "__main__":
    sys.exit(main())
