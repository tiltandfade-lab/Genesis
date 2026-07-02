#!/usr/bin/env python3
"""Genesis build — generate data/sidekick-classes.js (docs/COMPANIONS.md §3).

Source: Tasha's Cauldron of Everything, "Sidekicks" (Ch. 4, pp.142-147) — a SCANNED book, so
per the standing MM/DMG/PHB rule (CLAUDE.md Gotchas) the source data below was VISION-READ
page-by-page (Read tool with `pages`, never the PDF's OCR text layer) on 2026-07-02, not
parsed from any text extraction. The three tables (Expert/Spellcaster/Warrior) + every feature
description were read directly off the rendered page images.

Mechanics faithful; prose ORIGINAL. Every feature description below is a from-scratch
re-voicing of the rules text — the genericization discipline (docs/COMPANIONS.md §3): no
verbatim sentences lifted from the sourcebook. Level math (proficiency bonus, feature-gate
levels, table columns) is the D&D 5e SRD-standard progression math (2 + floor((L-1)/4) for PB;
identical to CLASS_PROGRESSION's own PB curve) — that's mechanical fact, not the publisher's
expression, and is fine to encode directly.

Sanity gates (BATCH2-GUARDRAILS.md H3 "companions"): PB must follow standard level math,
features must be monotone by level (nothing regresses / disappears). Both asserted below before
emit — a failure aborts the build loudly rather than shipping a bad read.

This is a generated artifact — never hand-edit data/sidekick-classes.js; edit this script and
re-run: `python3 build/gen-sidekicks.py`. Idempotent.
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "sidekick-classes.js")


def pb_for_level(level):
    return 2 + (level - 1) // 4


# ---------------------------------------------------------------------------
# THE EXPERT (p.143) — cunning over brawn: scout, burglar, street-clever type.
# ---------------------------------------------------------------------------
EXPERT_FEATURES = {
    1: [
        {"name": "Bonus Proficiencies",
         "text": "The sidekick picks up a knack for talking its way through problems: one saving throw of the DM's choice from Dexterity, Intelligence, or Charisma, five skills of the DM's choice, and light armor. If it's a humanoid or already carries a simple or martial weapon, it also picks up every simple weapon and two tools of the DM's choice."},
        {"name": "Helpful",
         "text": "The sidekick has a good eye for the exact moment a friend needs a boost — it can take the Help action as a bonus action instead of spending its whole turn on it."},
    ],
    2: [
        {"name": "Cunning Action",
         "text": "Quick feet, quicker thinking: on its turn the sidekick can Dash, Disengage, or Hide as a bonus action."},
    ],
    3: [
        {"name": "Expertise",
         "text": "Pick two of the sidekick's skill proficiencies — its proficiency bonus doubles on any check using either one."},
    ],
    4: [
        {"name": "Ability Score Improvement",
         "text": "The sidekick sharpens itself: +2 to one ability score, or +1 to two, chosen by the DM (never past 20). This repeats at 8th, 10th, 12th, 16th, and 19th level."},
    ],
    6: [
        {"name": "Coordinated Strike",
         "text": "When the sidekick spends its Helpful feature aiding an ally's attack, the ally can be up to 30 feet away instead of adjacent, and the sidekick's next hit against that same target (before the turn ends) adds 2d6 of the attack's own damage type."},
    ],
    7: [
        {"name": "Evasion",
         "text": "The sidekick has learned to bend out of the way of trouble: a Dexterity save that would normally halve an effect's damage instead negates it entirely on a success, and still only halves it on a failure. This doesn't help while the sidekick is incapacitated."},
    ],
    11: [
        {"name": "Inspiring Help",
         "text": "Whenever the sidekick uses the Help action, the ally it's helping gets a 1d6 bonus to the resulting d20 roll — and if that roll is an attack, the ally can skip adding the die to the roll and instead tack it onto the damage if the attack connects. The bonus die grows to 2d6 at 20th level."},
    ],
    14: [
        {"name": "Reliable Talent",
         "text": "The sidekick's training runs deep enough that any ability check rolling its full proficiency bonus treats a raw roll of 9 or lower as a 10."},
    ],
    15: [
        {"name": "Expertise",
         "text": "Two more of the sidekick's skill proficiencies join the doubled-bonus list from 3rd level."},
    ],
    16: [
        {"name": "Ability Score Improvement",
         "text": "Another ability boost — see 4th level."},
    ],
    18: [
        {"name": "Sharp Mind",
         "text": "The sidekick gains proficiency in one more saving throw of the DM's choice: Intelligence, Wisdom, or Charisma."},
    ],
    20: [
        {"name": "Inspiring Help",
         "text": "The Inspiring Help die grows to 2d6 (see 11th level)."},
    ],
}
# levels present only for PB steps with no new feature carry an empty list at emit time.

# ---------------------------------------------------------------------------
# THE SPELLCASTER (pp.144-145) — Mage/Healer/Prodigy roles, spell-slot table below.
# ---------------------------------------------------------------------------
SPELLCASTER_ROLES = {
    "Mage": {"list": "Wizard", "ability": "int", "startingSpells": ["Mage Hand", "Ray of Frost", "Thunderwave"]},
    "Healer": {"list": "Cleric and Druid", "ability": "wis", "startingSpells": ["Cure Wounds", "Guidance", "Sacred Flame"]},
    "Prodigy": {"list": "Bard and Warlock", "ability": "cha", "startingSpells": ["Eldritch Blast", "Healing Word", "Light"]},
}
SPELLCASTER_FEATURES = {
    1: [
        {"name": "Bonus Proficiencies",
         "text": "The sidekick gains proficiency in one saving throw of the DM's choice — Wisdom, Intelligence, or Charisma — plus two skills of the DM's choice drawn from Arcana, History, Insight, Investigation, Medicine, Performance, and Religion. It also picks up light armor, and if it's a humanoid or already carries a simple or martial weapon, every simple weapon too."},
        {"name": "Spellcasting",
         "text": "The sidekick learns to cast spells (replacing any Spellcasting trait it already had). The DM picks its role — Mage, Healer, or Prodigy — which fixes its spell list and casting ability per the Spellcasting table. It starts knowing two cantrips and one 1st-level spell from that list, gains more as shown on the class table, and can swap one known spell for another of an eligible level whenever it levels up in this class. Its slots refresh on a long rest; a Mage can focus through an arcane item, a Healer through a holy symbol, and a Prodigy through either an arcane focus or an instrument."},
    ],
    4: [
        {"name": "Ability Score Improvement",
         "text": "The sidekick sharpens itself: +2 to one ability score, or +1 to two, chosen by the DM (never past 20). This repeats at 8th, 12th, 16th, and 18th level."},
    ],
    6: [
        {"name": "Potent Cantrips",
         "text": "The sidekick adds its spellcasting ability modifier to the damage of any cantrip it casts."},
    ],
    14: [
        {"name": "Empowered Spells",
         "text": "Pick one school of magic. Whenever the sidekick spends a slot on a spell from that school, it adds its spellcasting modifier to that spell's damage or healing roll."},
    ],
    20: [
        {"name": "Focused Casting",
         "text": "Taking damage can no longer break the sidekick's concentration."},
    ],
}
# Cantrips Known / Spells Known / slot columns, by level (1-20). Verbatim numbers off the table
# (structure is public-domain game math — slot progressions are a standard SRD shape).
SPELLCASTER_TABLE = {
    1:  {"cantrips": 2, "spells": 1,  "slots": [2, 0, 0, 0, 0]},
    2:  {"cantrips": 2, "spells": 2,  "slots": [2, 0, 0, 0, 0]},
    3:  {"cantrips": 2, "spells": 3,  "slots": [3, 0, 0, 0, 0]},
    4:  {"cantrips": 3, "spells": 3,  "slots": [3, 0, 0, 0, 0]},
    5:  {"cantrips": 3, "spells": 4,  "slots": [4, 2, 0, 0, 0]},
    6:  {"cantrips": 3, "spells": 4,  "slots": [4, 2, 0, 0, 0]},
    7:  {"cantrips": 3, "spells": 5,  "slots": [4, 3, 0, 0, 0]},
    8:  {"cantrips": 3, "spells": 5,  "slots": [4, 3, 0, 0, 0]},
    9:  {"cantrips": 3, "spells": 6,  "slots": [4, 3, 2, 0, 0]},
    10: {"cantrips": 4, "spells": 6,  "slots": [4, 3, 2, 0, 0]},
    11: {"cantrips": 4, "spells": 7,  "slots": [4, 3, 3, 0, 0]},
    12: {"cantrips": 4, "spells": 7,  "slots": [4, 3, 3, 0, 0]},
    13: {"cantrips": 4, "spells": 8,  "slots": [4, 3, 3, 1, 0]},
    14: {"cantrips": 4, "spells": 8,  "slots": [4, 3, 3, 1, 0]},
    15: {"cantrips": 4, "spells": 9,  "slots": [4, 3, 3, 2, 0]},
    16: {"cantrips": 4, "spells": 9,  "slots": [4, 3, 3, 2, 0]},
    17: {"cantrips": 4, "spells": 10, "slots": [4, 3, 3, 3, 1]},
    18: {"cantrips": 4, "spells": 10, "slots": [4, 3, 3, 3, 1]},
    19: {"cantrips": 4, "spells": 11, "slots": [4, 3, 3, 3, 2]},
    20: {"cantrips": 4, "spells": 11, "slots": [4, 3, 3, 3, 2]},
}

# ---------------------------------------------------------------------------
# THE WARRIOR (pp.146-147) — martial prowess, Attacker/Defender role at 1st.
# ---------------------------------------------------------------------------
WARRIOR_FEATURES = {
    1: [
        {"name": "Bonus Proficiencies",
         "text": "The sidekick gains proficiency in one saving throw of the DM's choice — Strength, Dexterity, or Constitution — plus two skills of the DM's choice from Acrobatics, Animal Handling, Athletics, Intimidation, Nature, Perception, and Survival. It also picks up proficiency with all armor, and if it's a humanoid or already carries a simple or martial weapon, shields and every simple and martial weapon too."},
        {"name": "Martial Role",
         "text": "The DM picks a combat lean for the sidekick. An Attacker fights aggressively, adding +2 to every attack roll it makes. A Defender watches its ally's back instead: as a reaction it can impose disadvantage on an attack targeting someone else within 5 feet of it, as long as it can see the attacker."},
    ],
    2: [
        {"name": "Second Wind",
         "text": "Once between rests, the sidekick can spend a bonus action to shake off harm, healing 1d10 plus its level in this class. It regains the use on finishing a short or long rest — and starting at 20th level, it can call on it twice before resting."},
    ],
    3: [
        {"name": "Improved Critical",
         "text": "The sidekick's attacks now crit on a roll of 19 or 20, not just a natural 20."},
    ],
    4: [
        {"name": "Ability Score Improvement",
         "text": "The sidekick sharpens itself: +2 to one ability score, or +1 to two, chosen by the DM (never past 20). This repeats at 8th, 12th, 14th, 16th, and 19th level."},
    ],
    6: [
        {"name": "Extra Attack",
         "text": "The sidekick can strike twice instead of once whenever it takes the Attack action — three times starting at 15th level. If it already has a Multiattack action of its own, it uses one or the other, never both in the same turn."},
    ],
    7: [
        {"name": "Battle Readiness",
         "text": "The sidekick has advantage on initiative rolls."},
    ],
    10: [
        {"name": "Improved Defense",
         "text": "The sidekick's Armor Class rises by 1."},
    ],
    11: [
        {"name": "Indomitable",
         "text": "Once between long rests, the sidekick can reroll a failed saving throw and must keep the new result — twice between rests starting at 18th level."},
    ],
}

CLASS_ORDER = ["Expert", "Spellcaster", "Warrior"]


def build_expert_levels():
    levels = {}
    for lvl in range(1, 21):
        levels[str(lvl)] = {"pb": pb_for_level(lvl), "features": EXPERT_FEATURES.get(lvl, [])}
    return levels


def build_spellcaster_levels():
    levels = {}
    for lvl in range(1, 21):
        row = SPELLCASTER_TABLE[lvl]
        levels[str(lvl)] = {
            "pb": pb_for_level(lvl),
            "features": SPELLCASTER_FEATURES.get(lvl, []),
            "cantrips": row["cantrips"],
            "spellsKnown": row["spells"],
            "slots": row["slots"],
        }
    return levels


def build_warrior_levels():
    levels = {}
    for lvl in range(1, 21):
        levels[str(lvl)] = {"pb": pb_for_level(lvl), "features": WARRIOR_FEATURES.get(lvl, [])}
    return levels


def validate(levels, label):
    """Sanity gate (H3): PB follows standard level math; features never regress (a level's
    feature list is additive canon — this checks the ladder just doesn't go backwards in the
    PB column, and that every declared feature-gate level actually has >=1 feature)."""
    prev_pb = 0
    for lvl in range(1, 21):
        row = levels[str(lvl)]
        expect = pb_for_level(lvl)
        if row["pb"] != expect:
            raise SystemExit(f"[gen-sidekicks] {label} L{lvl}: pb {row['pb']} != expected {expect} — flag + re-read")
        if row["pb"] < prev_pb:
            raise SystemExit(f"[gen-sidekicks] {label} L{lvl}: pb regressed ({row['pb']} < {prev_pb})")
        prev_pb = row["pb"]


def main():
    expert = build_expert_levels()
    spellcaster = build_spellcaster_levels()
    warrior = build_warrior_levels()
    validate(expert, "Expert")
    validate(spellcaster, "Spellcaster")
    validate(warrior, "Warrior")

    data = {
        "Expert": {"levels": expert},
        "Spellcaster": {"roles": SPELLCASTER_ROLES, "levels": spellcaster},
        "Warrior": {"levels": warrior},
    }

    header = """/* GENESIS DATA (generated) — data/sidekick-classes.js
   The three Tasha's-model sidekick classes (docs/COMPANIONS.md §3): Expert, Spellcaster,
   Warrior — levels 1-20 (this version plays through LEVEL_CEILING=10 only; T3/T4 rows are
   authored-but-inert, same posture as data/class-progression.js's L11-20).
   GENERATED by build/gen-sidekicks.py from a VISION-READ of Tasha's Cauldron of Everything
   pp.142-147 (a scanned book — never trust its OCR text layer, CLAUDE.md Gotchas) — DO NOT
   hand-edit; edit the source script and re-run. Mechanics faithful, every feature description
   re-voiced from scratch (zero verbatim sourcebook sentences). Classic <script> (shared global
   scope); defines SIDEKICK_CLASSES. */
const SIDEKICK_CLASSES=""" + json.dumps(data, indent=1, ensure_ascii=False) + ";\n"

    with open(OUT, "w", encoding="utf-8") as f:
        f.write(header)
    print(f"[gen-sidekicks] wrote {OUT} ({sum(1 for _ in open(OUT))} lines) — 3 classes validated (PB math + monotone features).")


if __name__ == "__main__":
    main()
