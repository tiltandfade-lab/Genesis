#!/usr/bin/env python3
"""Generate SPRITE-INDEX.md for the fantasy faceted regeneration program.
Machine-verifies: every disk sprite maps to exactly one packet (or RETIRE/alias)."""
import re, subprocess, sys
from pathlib import Path

MAIN = Path('/Volumes/Genesis/Genesis')
CW = Path('/Volumes/Genesis/Genesis-faceted-f1-consolidation')
QA = CW / 'dev/model-qa/faceted'
S = Path('/private/tmp/claude-501/-Volumes-Genesis/2af2dc4c-fc22-4ed7-9948-42a8dbbfdc18/scratchpad')

disk = set((MAIN/'assets/sprites').glob('*.png'))
disk = sorted(p.stem for p in disk)

# F1 anchor slugs are prose-only in the packet; declared explicitly.
F1_ANCHORS = ['spr-fantasy-bandit-enforcer','spr-fantasy-scarred-feral-guard-dog',
              'spr-fantasy-undead-knight','spr-fantasy-adult-black-dragon',
              'spr-fantasy-ornate-heraldic-shield']
# Legacy ids covered by an F1 anchor under a different slug (admission-time mapping):
ALIAS_COVERED = {
 'spr-fantasy-dungeon-animal-scarred-guard-dog-gone-feral-once-trained-to-patrol-these-halls-now-answers-to-no-one':
   'F1 anchor spr-fantasy-scarred-feral-guard-dog',
}
RETIRE = {
 'spr-fantasy-gold-dragon-roster-5e-2024-mechanics':'replaced by PACKET-F5 gold family (4 individual sprites)',
 'spr-fantasy-the-cultist-roster-base-2024-stat-blocks':'individuals regenerated in PACKET-F1 lane 4 + F4-era cultist set',
}
GRID_RE = re.compile(r'spr-pc-[a-z]+-[a-z]+-(?:fe)?male')
TOKEN = re.compile(r'spr-(?:fantasy|pc)-[a-z0-9][a-z0-9-]*')
JUNK = {'spr-fantasy-giant','spr-fantasy-kid','spr-fantasy','spr-pc','spr-fantasy-wolf-winter-wolf-candidate-001',
        'spr-fantasy-dwarf-ranger-female-candidate-001','spr-pc-dwarf-ranger-female-candidate-001',
        'spr-pc-ancestry-class-sex','spr-fantasy-bandit-enforcer-candidate-001'}

packets = {}
srcs = {'F1': MAIN/'dev/model-qa/faceted/PACKET-F1.md'}
for n in range(2,16): srcs[f'F{n}'] = QA/f'PACKET-F{n}.md'
for name,path in srcs.items():
    if not path.exists(): print(f'!! missing {path}', file=sys.stderr); continue
    txt = path.read_text()
    toks = set(t.rstrip('-') for t in TOKEN.findall(txt)) - JUNK
    toks = {t for t in toks if not re.search(r'-candidate(-\d+)?$', t)}
    packets[name] = toks
packets['F1'] |= set(F1_ANCHORS)
# F15 is a grid: expand programmatically (the packet defines it mechanically)
anc = ['dragonborn','dwarf','elf','gnome','goliath','halfling','human','orc','tiefling']
cls = ['barbarian','bard','cleric','druid','fighter','monk','paladin','ranger','rogue','sorcerer','warlock','wizard']
packets['F15'] = {f'spr-pc-{a}-{c}-{s}' for a in anc for c in cls for s in ('female','male')}

# assignment map (first packet wins; FORCE overrides; report double-assignments as warnings)
FORCE = {'spr-fantasy-young-black-dragon':'F5'}  # F2's erratum note mentions it; F5 owns it
assign, dupes = {}, []
order = [f'F{n}' for n in range(1,16)]
for pk in order:
    for t in packets.get(pk,()):
        if t in FORCE: continue
        if t in assign: dupes.append((t, assign[t], pk))
        else: assign[t] = pk
assign.update(FORCE)

missing = [d for d in disk if d not in assign and d not in RETIRE and d not in ALIAS_COVERED]
extras  = sorted(t for t in assign if t not in set(disk))
print(f'disk={len(disk)} assigned={len(assign)} dupes={len(dupes)} unassigned_disk={len(missing)}')
if dupes:
    print('DUPES (slug, first, also-in):')
    for d in dupes[:40]: print('  ',*d)
if missing: print('UNASSIGNED DISK SPRITES:'); [print('  ',m) for m in missing]
print(f'net-new identities (in packets, no legacy sprite): {len(extras)}')
for e in extras: print('   NEW', e, '->', assign[e])

if dupes: print('(dupes above are prose cross-references; first/forced packet owns)')
if missing:
    print('\n!! NOT writing index — unassigned sprites above.'); sys.exit(1)

# ---- write index ----
out = []
out.append('''---
type: sprite-index
project: Genesis
scope: fantasy realm (incl. spr-pc) + combat VFX + decals
created: 2026-07-13
generated-by: gen-index.py (machine-verified against assets/sprites and the packet files)
---

# FANTASY SPRITE INDEX — the cohesive map

One row per asset family; every fantasy sprite on disk maps to exactly ONE packet (verified).
Status: **done** = F1 raw candidates generated & consolidated · **queued** = packet written,
awaiting generation · **retire** = legacy sheet replaced by individual sprites · **alias** =
covered by an F1 anchor under a different slug (admission maps the winner onto the legacy id).

## Program totals
''')
counts = {pk: sorted(t for t,p in assign.items() if p==pk) for pk in order}
total_named = sum(len(v) for v in counts.values())
out.append('| packet | scope | identities | status |')
out.append('|---|---|---|---|')
scope_names = {
 'F1':'Anchors + undead/goblinoid/bandit-cultist/guards-beasts pilot','F2':'Dragons (young/wyrmling core), wolves, orc civilians',
 'F3':'Menagerie: giants, devils, elementals, oozes, monster-folk, giant-beasts','F4':'Combat VFX + decals (fx-*/decal families — separate contract)',
 'F5':'Dragons complete: wyrmlings, adults, ancients, gold family, dragon-kin','F6':'Undead completion','F7':'Fiends & celestials',
 'F8':'Aberrations, monstrosities & deep things','F9':'Beasts: mundane menagerie, dinosaurs, mounts, swarms',
 'F10':'Nature & the strange: plants, fungi, fey, oozes, elementals, constructs','F11':'Humanoid stat-blocks & monster-folk',
 'F12':'Civilians & faction role-skins','F13':'Realm animals: wild / dungeon / domestic','F14':'Kid roster (20 wants)','F15':'PC roster grid (9×12×2)'}
status = {pk:('done (45 raw candidates, ledgered)' if pk=='F1' else 'queued') for pk in order}
status['F4'] = 'queued (contract locked: hybrid faceted+glow, single-frame)'
for pk in order:
    n = len(counts[pk]) + (65 if pk=='F4' else 0)  # F4 counts fx24+32 + 9 decals, tracked below
    out.append(f'| {pk} | {scope_names[pk]} | {len(counts[pk]) if pk!="F4" else "56 fx + 9 decal families"} | {status[pk]} |')
out.append(f'| RETIRE | legacy roster sheets | {len(RETIRE)} | retire on F5/F1 admission |')
out.append(f'| alias | legacy ids covered by F1 anchors | {len(ALIAS_COVERED)} | alias |')
out.append(f'\n**Named figure identities across packets: {total_named}** (of which {len(extras)} are net-new with no legacy sprite). Disk sprites accounted for: {len(disk)}/{len(disk)}.\n')

for pk in order:
    if pk=='F4':
        out.append('## F4 — combat VFX + decals (see PACKET-F4.md / EFFECTS-DECALS-INDEX.md)\n')
        out.append('- 24 system VFX (`fx-impact/magic/status/env-*`) + 32 fantasy-themed (`fx-fantasy/ash/gloom/cosmic-*`) — black-key hybrid faceted+glow, single-frame')
        out.append('- 9 decal families (`blood water grime wear scorch crack rust moss cobweb`) — magenta-key top-down source masters')
        out.append('- Out of scope: ~64 other-genre `fx-*` (suburb/noir/chrome/frontier/th/hs/lw/bk)\n')
        continue
    out.append(f'## {pk} — {scope_names[pk]} ({len(counts[pk])})\n')
    for t in counts[pk]:
        tag = ' **(NEW — no legacy sprite)**' if t in extras else ''
        out.append(f'- `{t}`{tag}')
    out.append('')
out.append('## Retired legacy sheets\n')
for k,v in RETIRE.items(): out.append(f'- `{k}` — {v}')
out.append('\n## Aliases (F1 anchor covers a legacy id)\n')
for k,v in ALIAS_COVERED.items(): out.append(f'- `{k}` ← {v}')
out.append('''
## Mechanical coverage notes (gap-hunt results, 2026-07-13)

- **Zero fantasy/PC sprites are referenced-but-missing** in `data/` + `src/` — every mechanical
  reference resolves to a disk sprite. Zero orphans on disk.
- All 510 `bestiary.js` entries are sprite-backed; the only "gaps" were 6 naming aliases
  (`the-` prefix: pseudodragon, faerie-dragon, needle/twig/vine-blight, cultist-roster) — noted,
  not real gaps.
- **Gold dragons** exist mechanically (wyrmling/young/adult/ancient inside the roster entry) with
  no individual sprites — PACKET-F5 authors them as NEW.
- The 11 other realms reference ~3,420 sprites that don't exist yet (chrome/suburb/bright/gloom/
  lost/ash/cosmic/theater/high/noir/frontier) — parked until those realms get the faceted pass.
''')
(QA/'SPRITE-INDEX.md').write_text('\n'.join(out))
print(f'\nwrote {QA}/SPRITE-INDEX.md ({len(out)} lines)')
