#!/usr/bin/env python3
"""Genesis table compiler — markdown source -> tables.json (the artifact the engine runs).
NON-DESTRUCTIVE: reads source markdown, writes ONLY tables.json. Never edits source.
  python3 "Engine/00. _System/compile-tables.py"          # validate (report only)
  python3 "Engine/00. _System/compile-tables.py" --emit   # validate + write tables.json

Derives each table's roll method from the body (lean schema) and validates coverage.
DICE-AWARE: a heading like "(2d20)", "(3d6)", "(d12 + d8)" declares a bell-curve / mixed
roll. The declaration only "wins" if its min..max matches the table's actual row range
(so a "2d4 items" QUANTITY note can't mislabel a flat d100 index). Flat tables -> dN.
Row out = [lo,hi,band,text,fragment-slot]; per-table {dice,die,class,...}.
See Engine/01. _Templates/_Table Frontmatter Schema.md + SPICE-CURVE.md.
"""
import os,re,glob,sys,json,collections
HERE=os.path.dirname(os.path.abspath(__file__))
BASE=os.path.dirname(os.path.dirname(HERE))   # …/Genesis
ROOTS=[os.path.join(BASE,"Engine","03. _Tables"), os.path.join(BASE,"Asset Library")]
EMIT="--emit" in sys.argv

def norm(s): return s.replace('–','-').replace('—','-')
CELL=lambda c: re.sub(r'\*\*','',c).strip()
SEP=re.compile(r'^\|[\s:\-|]+\|?\s*$')
DICE=re.compile(r'(\d*d\d+(?:\s*\+\s*\d*d\d+)*)', re.I)

def fm_and_body(t):
    if not t.startswith('---'): return {},t
    e=t.find('\n---',3)
    if e<0: return {},t
    d={}
    for l in t[3:e].splitlines():
        m=re.match(r'^([a-zA-Z_]+):\s*(.*)$',l)
        if m: d[m.group(1)]=m.group(2)
    return d,t[e+4:]

def dice_range(expr):
    """min,max for an NdM(+KdL...) expression. N defaults to 1."""
    lo=hi=0
    for term in expr.replace(' ','').split('+'):
        m=re.fullmatch(r'(\d*)d(\d+)',term,re.I)
        if not m: return None
        n=int(m.group(1) or 1); s=int(m.group(2))
        lo+=n; hi+=n*s
    return lo,hi

def find_dice(context):
    """return (normalized_expr,(min,max)) for the first dice expr in the heading/preamble, else None."""
    for m in DICE.finditer(context):
        expr=m.group(1).replace(' ','').lower()
        r=dice_range(expr)
        if r: return expr,r
    return None

def split_blocks(lines):
    """yield (context, rows): context = up to 4 non-empty non-pipe lines preceding each pipe-table block."""
    blocks=[]; cur=[]; buf=[]
    for ln in lines:
        s=ln.rstrip()
        if s.startswith('|'): cur.append(s)
        else:
            if cur: blocks.append(("\n".join(buf[-4:]),cur)); cur=[]; buf=[]
            if s.strip(): buf.append(s)
    if cur: blocks.append(("\n".join(buf[-4:]),cur))
    return blocks

def hint_id(context):
    h=None
    for m in re.finditer(r'^#{1,6}\s+(.*)$|^#([a-z0-9\-]+)\s*$|^\^([a-z0-9\-]+)\s*$',context,re.M):
        h=next(g for g in m.groups() if g)
    return h

def parse_block(context,rows):
    """return (parsed, info|None). info={dice,die,lo,hi,status,note}. None if not a dice table."""
    data=[r for r in rows if not SEP.match(r)]
    if len(data)<2: return [],None
    parsed=[]; nondice=0
    for r in data[1:]:
        cells=[CELL(c) for c in r.strip('|').split('|')]
        if not cells: continue
        first=norm(cells[0])
        m=re.match(r'^(\d+)\s*-\s*(\d+)$',first) or re.match(r'^(\d+)$',first)
        if not m: nondice+=1; continue
        lo=int(m.group(1)); hi=int(m.group(2)) if m.lastindex==2 else lo
        parsed.append((lo,hi,cells))
    if not parsed or nondice>len(parsed): return [],None
    amin=min(l for l,_,_ in parsed); amax=max(h for _,h,_ in parsed)
    # determine roll method
    dd=find_dice(context); dice=None; rmin,rmax=1,amax
    if dd and dd[1]==(amin,amax):           # declared dice confirmed by the row range
        dice=dd[0]; rmin,rmax=dd[1]
    elif amin==0:                            # 00-based d100 (0–99 / 00=100)
        dice="d%d"%(amax+1); rmin,rmax=0,amax
    elif amin==1:                            # flat dN
        dice="d%d"%amax; rmin,rmax=1,amax
    # else: ambiguous (starts high, no matching declaration)
    cov=collections.Counter()
    for lo,hi,_ in parsed:
        for v in range(lo,hi+1): cov[v]+=1
    overl=[v for v in range(rmin,rmax+1) if cov[v]>1]
    gaps=[v for v in range(rmin,rmax+1) if cov[v]==0]
    if dice is None:                         # couldn't establish a roll method
        status,note="starts-high","starts at %d, no matching dice decl (missing %s)"%(amin,[v for v in range(1,amin)][:4])
        dice="d%d"%amax
    elif overl: status,note="real-gap","overlaps:%d (e.g.%s)"%(len(overl),overl[:5])
    elif gaps: status,note="real-gap","gaps:%d in %s..%s (e.g.%s)"%(len(gaps),rmin,rmax,gaps[:5])
    else: status,note="clean",""
    ndice=sum(int(n or 1) for n,_ in re.findall(r'(\d*)d(\d+)',dice or ""))
    bell = ndice>1   # bell/mixed only when more than one die is summed
    return parsed,{"dice":dice,"die":amax,"lo":amin,"hi":amax,"status":status,"note":note,"bell":bool(bell)}

files=sorted(set(f for r in ROOTS for f in glob.glob(r+"/**/*.md",recursive=True) if '/Archive' not in f and '/zz_' not in f))
clean=0; real=[]; chk=[]; special=[]; nodice=[]; bell=[]; out={}; total=0
for f in files:
    fm,body=fm_and_body(open(f,encoding='utf-8').read())
    if fm.get('type') not in ('table','table-set'): continue
    seen=False
    for context,rows in split_blocks(body.splitlines()):
        parsed,info=parse_block(context,rows)
        if info is None: continue
        seen=True; total+=1
        tid=fm['id'] if fm['type']=='table' else re.sub(r'[^a-z0-9]+','-',(hint_id(context) or fm['id']).lower()).strip('-')
        st=info['status']
        if tid.startswith('dungeon-lore') or 'modifier' in tid: st="special"
        rel=os.path.relpath(f,BASE)
        if st=="clean": clean+=1
        elif st=="real-gap": real.append((rel,tid,info['dice'],info['note']))
        elif st=="starts-high": chk.append((rel,tid,info['dice'],info['note']))
        else: special.append(tid)
        if info['bell'] and st=="clean": bell.append((tid,info['dice']))
        if EMIT:
            band_col=legs_col=arch_col=grants_col=motif_col=None
            # SKIN-GRANTS.md §1/§1b: scope Grants/Motif header detection to the three Walk Skin tables
            # ONLY (by tid) — `Motif` alone collides with dungeon-art-motif/urban-art-motif, which
            # legitimately have their own unrelated "Motif" content column (the art motif's NAME, not
            # a DM-only tag). A bare `h.strip()=='motif'` match against every table silently shifted
            # those two tables' columns (caught by comparing tables.json against the last commit
            # before landing this change) — scoping by tid is the fix, mirroring the `dungeon-lore`/
            # `modifier` tid special-case just above.
            is_walk_skin = tid.startswith('walk-skin-')
            hdrs=[x for x in rows if not SEP.match(x)]
            if hdrs:
                for ci,h in enumerate(CELL(c).lower() for c in hdrs[0].strip('|').split('|')):
                    if 'band' in h: band_col=ci
                    elif h.strip()=='legs': legs_col=ci          # exact: avoid "archetype"/content collisions
                    elif h.strip()=='pool': arch_col=ci          # `Pool` = effect-pool (archetype) routing
                    elif is_walk_skin and h.strip()=='grants': grants_col=ci   # SKIN-GRANTS.md §1 — DM-only grant tokens
                    elif is_walk_skin and h.strip()=='motif': motif_col=ci     # SKIN-GRANTS.md §1b — DM-only motif kit key
            # DM-only Consequence-Ladder tags (CONSEQUENCE-LADDER.md): `Legs` (story-potential) and
            # `Archetype` (effect-pool routing) are excluded from the narration text + structured
            # cols, and emitted as row[6]/row[7] ONLY when the table carries them (untagged tables
            # stay byte-identical — no bloat). `ci != None` is always True, so the None case no-ops.
            # SKIN-GRANTS.md §1/§1b: `Grants`/`Motif` are the same kind of DM-only tag column —
            # excluded from narration text + row[5] cols, emitted as row[8]/row[9] ONLY when present
            # (untagged tables — every table except the three Walk Skin ones today — stay byte-identical).
            tag_cols = legs_col is not None or arch_col is not None
            skin_cols = grants_col is not None or motif_col is not None
            exclude={0,band_col,legs_col,arch_col,grants_col,motif_col}
            erows=[]
            for lo,hi,cells in parsed:
                band=cells[band_col] if (band_col is not None and band_col<len(cells)) else ""
                txt=" — ".join(c for ci,c in enumerate(cells) if ci not in exclude and c)
                # row[5] = the raw content columns (everything but the die/index col0 + DM-only tags),
                # in source order — so a multi-column table (segment walk: Type|Desc|Transition;
                # encounter: Name|Roster|Tactic) keeps its structure. txt (row[3]) stays the merged
                # form for back-compat.
                cols=[c for ci,c in enumerate(cells) if ci!=0 and ci!=legs_col and ci!=arch_col and ci!=grants_col and ci!=motif_col]
                row=[lo,hi,band,txt,None,cols]
                if tag_cols or skin_cols:
                    legs=cells[legs_col] if (legs_col is not None and legs_col<len(cells)) else ""
                    arch=cells[arch_col] if (arch_col is not None and arch_col<len(cells)) else ""
                    row+=[legs,arch]
                if skin_cols:
                    grants=cells[grants_col] if (grants_col is not None and grants_col<len(cells)) else ""
                    motif=cells[motif_col] if (motif_col is not None and motif_col<len(cells)) else ""
                    row+=[grants,motif]
                erows.append(row)
            out[tid]={"dice":info['dice'],"die":info['die'],"bell":info['bell'],"class":fm.get('table_class',""),
                      "player_facing":fm.get('player_facing',""),"voice_critical":fm.get('voice_critical','')=="true",
                      "domain":fm.get('domain',""),"rows":erows}
    if fm.get('type') in('table','table-set') and not seen:
        nodice.append(os.path.relpath(f,BASE))

print(f"{'EMIT' if EMIT else 'REPORT'} — dice tables: {total} | clean: {clean} | bell/mixed (confirmed): {len(bell)} | REAL bugs: {len(real)} | starts-high(check): {len(chk)} | special(skip): {len(special)} | lookup-matrices: {len(nodice)}")
print(f"\nREAL coverage bugs ({len(real)}):")
for rel,tid,dice,n in real: print(f"  {dice:<8} {n:<40} {tid}  [{rel}]")
print(f"\nstarts-high — check intent ({len(chk)}):")
for rel,tid,dice,n in chk: print(f"  {dice:<8} {n:<48} {tid}")
print(f"\nconfirmed bell/mixed tables ({len(bell)}): "+", ".join(f"{t}({d})" for t,d in bell[:40])+(" …" if len(bell)>40 else ""))
print(f"\nspecial (skipped): {special}")
print(f"\nlookup-matrices / no dice block ({len(nodice)}):")
for rel in nodice[:40]: print("   ",rel)
if EMIT:
    payload=json.dumps(out,ensure_ascii=False)
    json.dump(out,open(os.path.join(BASE,'tables.json'),'w'),ensure_ascii=False,indent=0)
    # tables.js: a window global, loadable via <script src> from a file:// page (fetch() is blocked there)
    open(os.path.join(BASE,'tables.js'),'w',encoding='utf-8').write(
        "/* GENERATED by compile-tables.py — do not hand-edit. Source: Engine/03._Tables + Asset Library .md tables. */\n"
        "window.GENESIS_TABLES="+payload+";\n")
    print(f"\nemitted tables.json + tables.js: {len(out)} tables")
