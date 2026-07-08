#!/usr/bin/env python3
"""build/gen-dm-contract.py — regenerate dm-contract.json (repo root) — the ONE machine-readable
DM↔engine contract (docs/DM-CONTRACT-ARTIFACT.md). Every event type, its accepted payload fields,
its aliases, the source enum, the digest's top-level shape, and one worked example per event are
extracted from the DECLARED registries src/world/dm.js already owns — NEVER hand-copied, NEVER by
parsing/regexing applyEvent's body.

Also splices the `### Common event types` section of every DM seat prompt (PROMPT_TARGETS) between
the DM-CONTRACT:EVENTS markers, killing the prompt-teaches-a-wrong-field-name drift class at source.

Never hand-edit dm-contract.json or the spliced prompt regions — edit dm.js's registries (or this
generator's own tables) and re-run this.

Usage:
  python3 build/gen-dm-contract.py            # CHECK mode (default): report + nonzero exit on drift,
                                              #   writes nothing. Byte-compares the committed artifact
                                              #   + each existing prompt's spliced region.
  python3 build/gen-dm-contract.py --emit     # WRITE the artifact + splice the prompt regions.

Stdlib only. Same CLI convention as build/gen-table-registry.py.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DM_JS = ROOT / "src" / "world" / "dm.js"
ARTIFACT = ROOT / "dm-contract.json"

# --------------------------------------------------------------------------------------------------
# GENERATOR-HELD TABLES — each validated against the parsed source on every run (they cannot drift
# silently; §2 "Generator-held tables"). They live here, not in dm.js, to keep dm.js free of doc
# freight while staying gen-time-verified.
# --------------------------------------------------------------------------------------------------

# EXAMPLES — one worked payload per event type (§5, verbatim). CANONICAL field names only, never
# aliases (gen-time hard-fail 3 rejects an aliased key). Adding a DM_EVENT_TYPES member without an
# EXAMPLES entry is hard-fail 1; a zombie key here is hard-fail 2.
EXAMPLES = {
    "hp_changed": {"delta": -4},
    "death_save": {"d20": 14},
    "temp_hp": {"n": 5},
    "combat_start": {"foes": [{"name": "Wolf", "count": 2, "cr": "1/4"}], "scene": "moonlit tree line"},
    "combat_end": {"outcome": "resolved"},
    "attack": {"d20": 17, "targetAC": 13, "attackIndex": 0},
    "action": {"kind": "Dodge"},
    "opportunity_attack": {"foe": "f1"},
    "move_zone": {"who": "pc", "band": "Melee", "dash": False},
    "grapple": {"target": "f1", "d20": 12, "bonus": 5},
    "shove": {"target": "f1", "d20": 9, "bonus": 5, "intent": "prone"},
    "hazard_tick": {"kind": "fall", "feet": 20},
    "slot_spent": {"level": 1},
    "cast": {"spell": "Charm Person", "level": 1, "concentration": True},
    "concentration_start": {"spell": "Charm Person"},
    # HQ3-C5: cause:"ended" is the VOLUNTARY drop the seat actually emits — every other cause (recast/
    # damage/0-hp/duration/long-rest) is the engine's own auto-break, never DM-emitted.
    "concentration_broken": {"cause": "ended"},
    "resource_spent": {"key": "rage"},
    # HQ3-C1: the example teaches spendHitDice — a short rest heals ONLY by spending Hit Dice.
    "rest": {"kind": "short", "spendHitDice": 1},
    "item_changed": {"add": [{"name": "Dagger", "qty": 1}], "gold": -2},
    "item_split": {"itemId": "it-12", "qty": 5},
    "item_use": {"itemId": "it-7"},
    "charge_spend": {"itemId": "it-3", "n": 1},
    "charge_restore": {"itemId": "it-3"},
    "condition_add": {"target": "pc", "condition": "frightened", "ttl": {"rounds": 2}},
    "condition_remove": {"target": "pc", "condition": "frightened"},
    "item_rust_exposure": {"kind": "rain-combat"},
    "condition_expired": {"target": "pc", "condition": "frightened"},
    "round_tick": {"phase": "end", "round": 2},
    "foe_morale": {"foe": "f1", "trigger": "half-hp"},
    "foe_action": {"foe": "f1"},
    "equip": {"itemId": "it-2", "slot": "mainHand"},
    "unequip": {"slot": "offHand"},
    "set_grip": {"grip": "2h"},
    "attune": {"itemId": "it-9"},
    "unattune": {"itemId": "it-9"},
    "fact_canonized": {"what": "The harbor bell rings itself before a drowning."},
    "codex_add": {"kind": "npc", "name": "Maddan Strole", "fields": {"role": "netmender"}, "dm": {"wants": "the splinter"}},
    "codex_link": {"from": "npc:maddan-strole", "rel": "fears", "to": "faction:the-hooks"},
    "codex_update": {"id": "npc:maddan-strole", "dm": {"tell": "watches the fist not the face"}},
    "codex_reveal": {"id": "npc:maddan-strole"},
    "codex_contact": {"id": "npc:maddan-strole"},
    "social_check": {"target": "npc:maddan-strole", "skill": "Persuasion", "total": 18, "natural": 14, "lever": "debt"},
    "attitude_shift": {"target": "npc:maddan-strole", "to": 1, "cause": "returned the ledger"},
    "morale_check": {"creature": "f1", "trigger": "leader-down"},
    "parley_open": {"creature": "f1", "want": "food", "openingAttitude": -1},
    "insight_read": {"target": "npc:maddan-strole", "total": 16, "dc": 14},
    "discovery": {"what": "The Traitor's Tree", "makeNode": True},
    "clock_advanced": {"clockId": "the-hooks", "delta": 1},
    "clock_fired": {"clockId": "the-hooks", "forPlayer": False},
    "front_closed": {"ledgerId": "harbor-smugglers", "how": "records burned"},
    "encounter_resolved": {"foes": [{"cr": "1/4", "victimClass": "monster"}], "method": "stealth", "outcome": "bypassed"},
    "kill": {"victimClass": "monster", "cr": "1/2"},
    "claim_deed": {"deedRef": "led-88", "factionKey": "the-hooks", "weight": 2},
    "gift": {"target": "npc:maddan-strole", "what": "ironwood splinter", "weight": 1},
    "epithet_grant": {"text": "the Seam"},
    "mark_added": {"text": "a ruined left hand", "kind": "injury", "mechanical": "no two-handed somatic gestures"},
    "mark_removed": {"id": "mk-3f2a"},
    "hire": {"codexId": "npc:corran-vale", "role": "guide", "wage": 2},
    "dismiss": {"hirelingId": "h-1"},
    "tend_pet": {"target": "npc:ash-hound"},
    "companion_update": {"hirelingId": "h-1", "action": "levelSync", "pcLevel": 4},
    "recruit_creature": {"codexId": "npc:ash-hound", "role": "pet"},
    "choice_logged": {"weight": "major", "forecloses": ["the-hooks-truce"]},
    "inspiration_granted": {"pc": "Sella Voss", "reason": "honored the taboo at cost"},
    "inspiration_spend": {"on": "check", "d20b": 17},
    "check": {"kind": "skill", "key": "Stealth", "dc": 15, "d20": 11},
    "crit_outcome": {"natural": 20, "magnitude": 9, "tier": "amplified", "scope": "scene", "lenses": []},
    "stage_fx": {"verb": "lunge", "who": "f1", "note": "the wolf lunges the gap"},
    "adjudication": {"situation": "rope cut mid-climb", "ruling": "DEX save 12 or fall to the ledge", "precedentId": "adj-3"},
    "level_applied": {"pc": "Sella Voss", "from": 3, "to": 4},
    "prep_applied": {"frontiers": []},
    "prep_contact": {"nodeId": "n-14", "enter": True},
    "walk_advance": {"toSeg": 2},
    "walk_update": {"seg": 2, "overlay": {"effectDie": 8, "rolledFace": 3}},
    "walk_complete": {},
    "capture": {},
    "chase_start": {"npcId": "npc:rook", "terrain": "rooftops"},
    "chase_round": {"pursuerWon": True},
    "chase_yield": {"side": "quarry"},
    "downtime": {"intent": "work"},
    "distant_word": {},
    "shrine_omen": {},
    "xp_granted": {},
    # 2026-07-07 wave integrations — the three types the parallel waves added (TAROT-2 §3.3,
    # THEATER-NEXT TN-A, ITEM-LEGACY §2.1); shapes mirror each unit's own harness fixtures.
    "tarot_landed": {"via": "npc", "ref": "npc:corran-vale"},
    "terrain_change": {"op": "collapse", "zone": "B", "note": "the rotten balcony gives way"},
    "item_claimed": {"codexId": "item:the-pale-sabre", "by": {"kind": "faction", "ref": "faction:salt-guild", "name": "the Salt Guild"}, "lossState": "claimed-faction"},
    # TRANSITION-CONTRACT — the five first-class transition events (shapes = each case's harness fixture).
    "advance_clock": {"minutes": 90, "cause": "haggling until the lamps are lit"},
    "move_node": {"nodeId": "n-4", "travelMin": 25, "cause": "the drover's shortcut"},
    "start_walk": {"nodeId": "n-7"},
    "travel_start": {"toNodeId": "n-9", "travelMin": 240, "cause": "the coast road at first light"},
    "knockout": {"cause": "saps and a grain sack"},
    "open_shop": {"archetype": "provisioner", "name": "Brindle's", "tier": 2},
    "district_mint": {"nodeId": "n-2", "tier": 2},
    "building_approach": {"nodeId": "n-2", "buildingType": "tavern", "name": "The Gulls' Rest", "tier": 2},
    "building_contact": {"id": "bld-7"},
    "job_board_read": {"nodeId": "n-2", "tier": 2},
    "job_accept": {"postingId": "job-2"},
    # CROWNING-BASTION.md §7.B1.1 — the bastion claim (EITHER-gated: a closed front OR gold, Q5).
    "bastion_claim": {"nodeId": "n-4", "name": "Halewatch Keep", "note": "founded on the old signal tower"},
}

# VALUE_NOTES — the 9 original traps (§2) plus HQ3-C1/C3's rest nuance (2026-07-07). Keyed
# "<type>.<field>" (field must be in that event's accept list — validated) EXCEPT the two
# field-less "_payload" notes (whole-event semantics).
VALUE_NOTES = {
    "attitude_shift.to": "int -2..2 (Hostile -2 ... Helpful +2); strings hostile/unfriendly/neutral/indifferent/friendly/helpful accepted post-S1",
    "attitude_shift.target": "codex id from the digest (post-S1 `id` is an accepted alias)",
    "clock_advanced.clockId": "copy digest `powers[].clockId` / `fronts[].clockId` verbatim",
    "item_changed.removeIds": "instance ids, never names",
    "condition_add.condition": "the condition name — the field is `condition`, `cond` is not read",
    "check.d20": "the PLAYER's own open roll — the engine never rolls the player's dice",
    "codex_update.note": "APPENDS to dm.notes[] (DM-only)",
    "concentration_broken.cause": "use \"ended\" for a VOLUNTARY drop when the PC lets a spell go. Concentration also ends automatically: on a recast, at 0 HP, on a failed damage save, when its duration lapses (clock), and on a completed long rest — you don't emit those.",
    "distant_word._payload": "empty {} by design (anti-invention); a supplied text warns loud",
    "xp_granted._payload": "no-op by design — XP is the engine's job (DM-CHARTER §8.3b)",
    "rest.kind": "`short` heals ONLY by spending Hit Dice (payload.spendHitDice); `long` heals fully + regains floor(level/2) hit dice (min 1) — but a second long rest within 24 in-world hours of the last one grants NO recovery (restored:'no-benefit-24h'), narrate a restless night, not a refusal",
    "rest.spendHitDice": "how many Hit Dice to spend on a short rest — read the pool from pc.resources.hitDice {cur,max,die}; never request more than cur (an over-request clamps to what's left)",
}

# DIGEST_NOTES — one clause per digest key (keys must set-equal parsed DM_DIGEST_KEYS — validated).
# Written from the inline comments already in dmDigest (dm.js).
DIGEST_NOTES = {
    "worldId": "the persistent world id",
    "worldName": "the world's name",
    "clock": "day/min/band/exact time + session number + knowsTime",
    "location": "the current node's name",
    "setting": "the founding-turn scene bible (name/desc/smell/sound/arch/taboo/myth) — sent ONCE on the world-founding turn, null after",
    "pc": "the living PC's sheet slice — identity/scores/hp/ac/conditions/inventory/equipped/equippedWeapons",
    "powers": "faction clocks — clockId/faction/agenda/method/tags + filled/size",
    "fronts": "pressure clocks incl. dmOnly truths (truth/doom)",
    "recentLedger": "the last 6 ledger lines (type/day/min/text)",
    "gazetteer": "the last 8 gazetteer entries (type/name/desc)",
    "codex": "the here-and-now full codex set (bounded to scene size, not world size)",
    "codexRoster": "one-liner for every codex entity outside the here-set (pull full records on demand)",
    "minted": "the mint spotlight — ids the DM should look up in `codex` (guaranteed full-tier)",
    "revealed": "the revealed slow-drip keys the player now knows",
    "sessionLean": "the next-session LEAN + weave plan — a SOFT prior, never a mandate; null until a carryForward has fired",
    "tarot": "session draw, DM-only ({name,reversed,omen,mutator})",
    "activeWalk": "the active segment walk (WALK-CONSUMPTION) or null",
    "combat": "present only while GS.combat.active — foe HP coarse words, never numbers; null the common turn",
    "prepPending": "presence signals the DM loop to run the prep fan-out; absence is the all-clear",
    "levelUp": "a pending interpretive-pick span on the PC's sheet — awareness only, never invented values; null the common turn",
    "arrivalBrief": "the current node's unrevealed drift entries (dmOnly until narrated); null the common turn",
    "itemLegacy": "ITEM-LEGACY §5 slice — storied-item custody threads (lossState, holder, recovery hooks); null when no legacy-grade item is in play",
    "bastion": "CROWNING-BASTION.md §7.B1.8 — the world's bastion (name/nodeId/foundedDay/atNow/vault manifest); null when no bastion is claimed",
    "pendingSituation": "HQ3-C4 — a severe/interrupted rest-risk obligation the DM must honor THIS turn (kind/text/class/severe/interrupted/day/min); auto-clears once answered; null the common turn",
}

# PROMPT_TAUGHT — the types the prompt's §events section teaches (§2, PROVISIONAL default), in
# render order. Everything else stays engine/digest-driven or lives in docs.
PROMPT_TAUGHT = [
    "hp_changed", "temp_hp", "condition_add", "condition_remove", "check", "cast", "slot_spent",
    "concentration_broken", "rest", "item_changed", "equip", "attitude_shift", "social_check", "gift",
    "codex_add", "codex_update", "codex_link", "codex_reveal", "codex_contact", "discovery",
    "fact_canonized", "clock_advanced", "stage_fx", "combat_start", "combat_end",
    "mark_added", "mark_removed",
]

# PROMPT_TARGETS — the seat prompts whose §events section is a generated region. First = the live
# bridgeless-rig prompt (Sella/Rennick continuity); second = the future seat prompt (absent today:
# skipped with a printed note, edge E-4).
PROMPT_TARGETS = [
    "dev/playtest-saves/sella-shimmering-maw/DM-SEAT-PROMPT.md",
    "docs/SEAT-PROMPT.md",
]

MARKER_BEGIN = "<!-- DM-CONTRACT:EVENTS:BEGIN (generated by build/gen-dm-contract.py — do not hand-edit this region) -->"
MARKER_END = "<!-- DM-CONTRACT:EVENTS:END -->"


# --------------------------------------------------------------------------------------------------
# SOURCE PARSING — the three declared const literals (+ DM_DIGEST_KEYS). String-aware balanced scan;
# NEVER parses/regexes applyEvent's body (docs/DM-CONTRACT-ARTIFACT.md §2 "Extraction strategy").
# --------------------------------------------------------------------------------------------------

def die(msg):
    print("gen-dm-contract: ERROR — " + msg, file=sys.stderr)
    sys.exit(2)


def _find_decl(src, name):
    """Locate `const <name> = ` — exactly one occurrence (0 or 2+ ⇒ exit 2). Returns the offset of
    the first char after the `= `."""
    pat = re.compile(r"^const " + re.escape(name) + r"\s*=\s*", re.M)
    hits = list(pat.finditer(src))
    if len(hits) != 1:
        die("expected exactly one `const %s =` declaration, found %d" % (name, len(hits)))
    return hits[0].end()


def _balanced_scan(src, start):
    """From the opening bracket/brace at `start`, return the substring through its matching closer.
    String-AND-comment-aware: bracket depth ignores brackets inside "..."/'...' literals (honoring
    escapes) AND inside `//` line comments and `/* */` block comments — so an unbalanced bracket in a
    comment (e.g. the `distant_word` WAI note) can never corrupt the depth count (E-1 robustness)."""
    opener = src[start]
    closer = {"[": "]", "{": "}"}.get(opener)
    if closer is None:
        die("declaration does not open with [ or { at offset %d (saw %r)" % (start, opener))
    depth = 0
    i = start
    n = len(src)
    quote = None
    while i < n:
        c = src[i]
        if quote is not None:
            if c == "\\":
                i += 2
                continue
            if c == quote:
                quote = None
            i += 1
            continue
        # comments (outside strings) — skip their whole span, brackets inside don't count
        if c == "/" and i + 1 < n and src[i + 1] == "/":
            while i < n and src[i] != "\n":
                i += 1
            continue
        if c == "/" and i + 1 < n and src[i + 1] == "*":
            i += 2
            while i + 1 < n and not (src[i] == "*" and src[i + 1] == "/"):
                i += 1
            i += 2
            continue
        if c in ('"', "'"):
            quote = c
        elif c == opener:
            depth += 1
        elif c == closer:
            depth -= 1
            if depth == 0:
                return src[start:i + 1]
        i += 1
    die("unbalanced brackets scanning declaration from offset %d" % start)


def _strip_line_comments(text):
    """Strip `//` comments that fall OUTSIDE string literals (string-aware)."""
    out = []
    i = 0
    n = len(text)
    quote = None
    while i < n:
        c = text[i]
        if quote is not None:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(text[i + 1])
                i += 2
                continue
            if c == quote:
                quote = None
            i += 1
            continue
        if c in ('"', "'"):
            quote = c
            out.append(c)
            i += 1
            continue
        if c == "/" and i + 1 < n and text[i + 1] == "/":
            # skip to end of line
            while i < n and text[i] != "\n":
                i += 1
            continue
        out.append(c)
        i += 1
    return "".join(out)


def _quote_bare_keys(text):
    """Quote bare identifier keys: `{ foo:` / `, foo:` / `[ foo:` → `"foo":`, outside string literals
    only. Implemented with a string-aware single pass so we never touch key-like text inside a
    string value."""
    out = []
    i = 0
    n = len(text)
    quote = None
    key_re = re.compile(r"([A-Za-z_$][A-Za-z0-9_$]*)\s*:")
    while i < n:
        c = text[i]
        if quote is not None:
            out.append(c)
            if c == "\\" and i + 1 < n:
                out.append(text[i + 1])
                i += 2
                continue
            if c == quote:
                quote = None
            i += 1
            continue
        if c in ('"', "'"):
            quote = c
            out.append(c)
            i += 1
            continue
        if c in "{[,":
            out.append(c)
            i += 1
            # consume whitespace
            while i < n and text[i] in " \t\r\n":
                out.append(text[i])
                i += 1
            m = key_re.match(text, i)
            if m:
                out.append('"' + m.group(1) + '":')
                i = m.end()
            continue
        out.append(c)
        i += 1
    return "".join(out)


def _strip_trailing_commas(text):
    return re.sub(r",(\s*[}\]])", r"\1", text)


def _parse_literal(src, name):
    """Parse a declared JS const literal (array or object) into a Python value."""
    start = _find_decl(src, name)
    raw = _balanced_scan(src, start)
    t = _strip_line_comments(raw)
    t = _quote_bare_keys(t)
    t = _strip_trailing_commas(t)
    try:
        return json.loads(t)
    except json.JSONDecodeError as e:
        off = e.pos
        snippet = t[max(0, off - 100):off + 100]
        die("%s: could not json.loads the transformed literal at offset %d:\n  ...%s..."
            % (name, off, snippet.replace("\n", " ")))


# --------------------------------------------------------------------------------------------------
# BUILD THE ARTIFACT
# --------------------------------------------------------------------------------------------------

def build_contract():
    src = DM_JS.read_text(encoding="utf-8")
    types = _parse_literal(src, "DM_EVENT_TYPES")
    sources = _parse_literal(src, "DM_EVENT_SOURCES")
    fields = _parse_literal(src, "DM_EVENT_FIELDS")
    digest_keys = _parse_literal(src, "DM_DIGEST_KEYS")

    # ---- gen-time hard-fails (§2) ----
    # 6. duplicate types
    if len(set(types)) != len(types):
        seen, dupes = set(), []
        for t in types:
            if t in seen:
                dupes.append(t)
            seen.add(t)
        die("DM_EVENT_TYPES has duplicate entries: " + ", ".join(dupes))
    tset = set(types)

    # 4. every DM_EVENT_FIELDS key must be a DM_EVENT_TYPES member (mirrors the ROOT-B probe)
    stray = [k for k in fields if k not in tset]
    if stray:
        die("DM_EVENT_FIELDS keys not in DM_EVENT_TYPES: " + ", ".join(stray))

    # 1. every type must have an EXAMPLES entry
    missing_ex = [t for t in types if t not in EXAMPLES]
    if missing_ex:
        die("DM_EVENT_TYPES members missing from EXAMPLES (add EXAMPLES['<type>'] to "
            "build/gen-dm-contract.py): " + ", ".join(missing_ex))
    # 2. no zombie examples
    zombie = [t for t in EXAMPLES if t not in tset]
    if zombie:
        die("EXAMPLES keys not in DM_EVENT_TYPES (zombie example): " + ", ".join(zombie))

    # 5. alias/accept collision + 3. example key must be in accept (canonical only, aliases rejected)
    for t, spec in fields.items():
        accept = spec.get("accept", [])
        alias = spec.get("alias", {}) or {}
        acc_set = set(accept)
        for a in alias:
            if a in acc_set:
                die("alias/accept collision on %s: `%s` is both an alias and an accept field" % (t, a))
        for k in EXAMPLES[t]:
            if k not in acc_set:
                die("EXAMPLES[%r] key %r is not in that event's accept list (examples are canonical — "
                    "aliases are rejected here)" % (t, k))

    # 8. VALUE_NOTES key validation — "<type>.<field>", field must exist in accept (or be _payload)
    for key in VALUE_NOTES:
        t, _, fld = key.partition(".")
        if t not in tset:
            die("VALUE_NOTES key %r names an unknown event type" % key)
        if fld == "_payload":
            continue
        spec = fields.get(t)
        acc = set((spec or {}).get("accept", []))
        if fld not in acc:
            die("VALUE_NOTES[%r] field %r is not in %s's accept list" % (key, fld, t))

    # 8. DIGEST_NOTES keys must set-equal parsed DM_DIGEST_KEYS
    if set(DIGEST_NOTES) != set(digest_keys):
        only_notes = set(DIGEST_NOTES) - set(digest_keys)
        only_keys = set(digest_keys) - set(DIGEST_NOTES)
        die("DIGEST_NOTES keys must set-equal DM_DIGEST_KEYS. only-in-notes=%s only-in-keys=%s"
            % (sorted(only_notes), sorted(only_keys)))

    # PROMPT_TAUGHT sanity — every taught type must be a real type (not enforced by spec's numbered
    # hard-fails, but a taught type that isn't a real event is a generator bug worth catching)
    bad_taught = [t for t in PROMPT_TAUGHT if t not in tset]
    if bad_taught:
        die("PROMPT_TAUGHT names non-existent types: " + ", ".join(bad_taught))

    # ---- assemble events block ----
    events = {}
    passthrough = 0
    for t in types:
        spec = fields.get(t)
        vnotes = {}
        # collect valueNotes for this event (field-keyed; the two _payload notes keyed as _payload)
        for key, note in VALUE_NOTES.items():
            tt, _, fld = key.partition(".")
            if tt == t:
                vnotes[fld] = note
        ex = {"type": t, "payload": EXAMPLES[t]}
        if spec is None:
            # pass-through type — payload passes unjudged (dmFoldPayload returns it untouched)
            entry = {"fields": None, "aliases": {}, "example": ex}
            passthrough += 1
        else:
            entry = {
                "fields": list(spec.get("accept", [])),
                "aliases": dict(spec.get("alias", {}) or {}),
                "num": list(spec.get("num", [])),
                "example": ex,
            }
        if vnotes:
            entry["valueNotes"] = vnotes
        events[t] = entry

    contract = {
        "contractVersion": 1,
        "generatedBy": "build/gen-dm-contract.py",
        "sourceOfTruth": "src/world/dm.js",
        "eventSources": sources,
        "defaultSource": "declared",
        "envelope": {
            "required": {"type": "string (non-empty)"},
            "optional": {
                "payload": "object (non-array)",
                "source": "one of eventSources",
                "ledgerRefs": "array",
            },
            "note": "validateEvent (src/world/dm.js) — a well-formed event with an UNKNOWN type still "
                    "passes (unknownType flag; applyEvent no-ops it). Forward-compatible by design.",
        },
        "turnResponse": {
            "seatRequired": ["narration", "events"],
            "optional": ["rollRequest", "ask", "gen", "dmNotes", "turnId"],
            "note": "validateTurnResponse (dm.js) is NON-BLOCKING (applies what's valid); the seat's own "
                    "gate (seat.js SEAT_REQUIRED_KEYS) hard-requires narration+events.",
        },
        "unknownFieldPolicy": "kept + console.warn + one drift ledger line (kind:payload-drift) — never "
                              "dropped (dmFoldPayload, dm.js)",
        "unknownTypePolicy": "well-formed unknown types pass validateEvent and no-op in applyEvent "
                             "(forward-compatible)",
        "digest": {
            "topLevelKeys": list(digest_keys),
            "notes": {k: DIGEST_NOTES[k] for k in digest_keys},
        },
        "events": events,
    }

    counts = {
        "events": len(types),
        "fieldMapped": len(types) - passthrough,
        "passthrough": passthrough,
        "sources": len(sources),
        "digestKeys": len(digest_keys),
    }
    return contract, counts


def render_contract(contract):
    """Byte-deterministic: 2-space indent, sorted event keys, trailing newline."""
    # sort only the events sub-dict (top-level order is stable/authored above; json.dumps preserves
    # insertion order except we sort events per §2). Rebuild with events sorted.
    c = dict(contract)
    c["events"] = {k: contract["events"][k] for k in sorted(contract["events"])}
    return json.dumps(c, indent=2, ensure_ascii=False) + "\n"


# --------------------------------------------------------------------------------------------------
# PROMPT SECTION GENERATION (§4)
# --------------------------------------------------------------------------------------------------

def _payload_json(payload):
    """Compact JSON of an example payload (no spaces after separators, like the spec's after-line)."""
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":"))


def render_prompt_section(contract):
    """The generated `### Common event types` section body (between the markers, exclusive)."""
    events = contract["events"]
    lines = []
    lines.append(
        "### Common event types — EXACT payload field names (generated from dm-contract.json; unknown "
        "field names are KEPT but flagged as drift — they usually mean the engine ignored your intent, "
        "so use these names precisely)"
    )
    for t in PROMPT_TAUGHT:
        ev = events[t]
        flds = ev["fields"]
        aliases = ev.get("aliases", {})
        vnotes = ev.get("valueNotes", {})
        if flds is None:
            fields_frag = "fields: (none — empty payload by design)"
        elif len(flds) == 0:
            fields_frag = "fields: (none — empty payload by design)"
        else:
            fields_frag = "fields: " + ", ".join("`%s`" % f for f in flds)
        ex_frag = '`{"type":"%s","payload":%s}`' % (t, _payload_json(ev["example"]["payload"]))
        line = "- `%s` — %s — e.g. %s" % (t, fields_frag, ex_frag)
        if aliases:
            alias_frag = ", ".join("`%s`→`%s`" % (a, c) for a, c in aliases.items())
            line += " (aliases accepted: %s)" % alias_frag
        for fld, note in vnotes.items():
            if fld == "_payload":
                continue
            line += " — %s: %s" % (fld, note)
        lines.append(line)
    lines.append(
        "- Do NOT emit `xp_granted` — it is a no-op by design. XP is the engine's job; you narrate beats."
    )
    lines.append(
        "- Ids are never invented: copy `clockId` from the digest's `powers[]`/`fronts[]`, item ids "
        "from `pc.inventory[].id`, codex ids from `codex`/`codexRoster`."
    )
    lines.append(
        "- Every other event type in the engine's vocabulary also works (dm-contract.json is the full "
        "list); emit any event whose fields you know from this contract. If nothing mechanical "
        "happened, `events: []`. Never invent a die — emit a `rollRequest` instead."
    )
    return "\n".join(lines)


def splice_prompt(text, section_body):
    """Rewrite ONLY the bytes between the markers. Returns (new_text, had_markers). Markers are matched
    line-anchored, tolerating a trailing \\r. Raises via die() if a target exists but lacks markers."""
    begin_re = re.compile(r"^" + re.escape(MARKER_BEGIN) + r"\r?$", re.M)
    end_re = re.compile(r"^" + re.escape(MARKER_END) + r"\r?$", re.M)
    b = begin_re.search(text)
    e = end_re.search(text)
    if not b or not e or e.start() < b.end():
        return None, False
    new_region = MARKER_BEGIN + "\n" + section_body + "\n" + MARKER_END
    return text[:b.start()] + new_region + text[e.end():], True


# --------------------------------------------------------------------------------------------------
# MODES
# --------------------------------------------------------------------------------------------------

def main():
    emit = "--emit" in sys.argv
    contract, counts = build_contract()
    rendered = render_contract(contract)
    section_body = render_prompt_section(contract)

    if not emit:
        # CHECK mode — byte-compare artifact + each existing prompt's spliced region.
        ok = True
        if not ARTIFACT.exists():
            print("dm-contract.json missing")
            sys.exit(1)
        current = ARTIFACT.read_text(encoding="utf-8")
        if current != rendered:
            print("dm-contract.json DRIFT — committed artifact does not match regenerated output.")
            _print_diff(current, rendered, "dm-contract.json")
            ok = False
        for rel in PROMPT_TARGETS:
            p = ROOT / rel
            if not p.exists():
                continue
            text = p.read_text(encoding="utf-8")
            new_text, had = splice_prompt(text, section_body)
            if not had:
                print("PROMPT DRIFT — %s exists but lacks the DM-CONTRACT:EVENTS markers." % rel)
                ok = False
                continue
            if new_text != text:
                print("PROMPT DRIFT — %s spliced region does not match regenerated section." % rel)
                _print_diff(text, new_text, rel)
                ok = False
        if not ok:
            sys.exit(1)
        print("dm-contract: clean (%d events)" % counts["events"])
        sys.exit(0)

    # EMIT mode — hard-fail 7 (target exists but no markers) BEFORE writing anything.
    for rel in PROMPT_TARGETS:
        p = ROOT / rel
        if not p.exists():
            continue
        text = p.read_text(encoding="utf-8")
        _, had = splice_prompt(text, section_body)
        if not had:
            die("%s exists but lacks the DM-CONTRACT:EVENTS splice markers. Add these two lines around "
                "the `### Common event types` section:\n  %s\n  %s" % (rel, MARKER_BEGIN, MARKER_END))

    ARTIFACT.write_text(rendered, encoding="utf-8")

    spliced, skipped = 0, 0
    for rel in PROMPT_TARGETS:
        p = ROOT / rel
        if not p.exists():
            print("skipped (absent): %s" % rel)
            skipped += 1
            continue
        text = p.read_text(encoding="utf-8")
        new_text, had = splice_prompt(text, section_body)
        if new_text != text:
            p.write_text(new_text, encoding="utf-8")
        spliced += 1

    print("dm-contract.json: %d events (%d field-mapped, %d pass-through), %d sources, %d digest keys; "
          "prompts spliced: %d, skipped-absent: %d"
          % (counts["events"], counts["fieldMapped"], counts["passthrough"], counts["sources"],
             counts["digestKeys"], spliced, skipped))
    sys.exit(0)


def _print_diff(a, b, label):
    import difflib
    diff = list(difflib.unified_diff(a.splitlines(), b.splitlines(),
                                     fromfile=label + " (committed)", tofile=label + " (regenerated)",
                                     lineterm=""))
    for line in diff[:60]:
        print("  " + line)
    if len(diff) > 60:
        print("  ... (%d more diff lines)" % (len(diff) - 60))


if __name__ == "__main__":
    main()
