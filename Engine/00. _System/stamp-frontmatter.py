#!/usr/bin/env python3
"""Stamp lean YAML frontmatter across the Genesis table corpus.

Idempotent + additive: fills missing frontmatter, preserves existing fields,
never touches the table body (so monster custom d10 tables are safe).
Schema reference: Engine/01. _Templates/_Table Frontmatter Schema.md
Run:  python3 "Engine/00. _System/stamp-frontmatter.py"            # dry-run
      python3 "Engine/00. _System/stamp-frontmatter.py" --write    # apply
Derived (die/rows/spice) is intentionally NOT stored — the compiler derives it.
"""
import os,re,glob,sys,collections

HERE=os.path.dirname(os.path.abspath(__file__))
BASE=os.path.dirname(os.path.dirname(HERE))            # …/Genesis
ROOTS=[os.path.join(BASE,"Engine","03. _Tables"), os.path.join(BASE,"Asset Library")]
WRITE="--write" in sys.argv

sep_re=re.compile(r'^\|[\s:\-]+\|',re.M)
numrow_re=re.compile(r'^\|\s*\d+\s*[–\-|]')
blockid_re=re.compile(r'\^([a-z0-9][a-z0-9\-]*)\s*$',re.M)
tag_re=re.compile(r'^#([a-z0-9][a-z0-9\-]+)\s*$',re.M)
h3_re=re.compile(r'^#{2,3}\s+\S',re.M)
SPARK=re.compile(r'smell|sound|sensory|dressing|clutter|furnitur|\bart\b|atmospher|trinket|colou?r|material|lighting|weather|footing',re.I)
COMMIT=re.compile(r'loot|treasure|reward|doom|pressure|consequence|death|boon|traged|\bevent|quest|faction|mythic|becoming|curse|intrusion|portent|\blife\b',re.I)

def slug(s):
    s=re.sub(r'\.md$','',os.path.basename(s)).lstrip('*').strip()
    return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def domain_of(path):
    parts=os.path.dirname(os.path.relpath(path,BASE)).split('/')
    parts=[re.sub(r'^\d+\.\s*','',p) for p in parts]
    drop={'Engine','_Tables','Asset Library','03. _Tables'}
    parts=[p for p in parts if p and p not in drop and not p.startswith('zz_') and not p.startswith('_')]
    return ' / '.join(parts) if parts else 'Misc'
def name_bank(text):
    if len(sep_re.findall(text)) or len(h3_re.findall(text))<1: return False
    short=[l for l in text.splitlines() if l.strip() and not l.startswith('#') and len(l.strip())<40 and '|' not in l]
    return len(short)>=8
def classify(path,text):
    p=path.replace('\\','/'); base=os.path.basename(path)
    if '/_Stubs/' in p or base.startswith('*') or len(text.strip())<40: return 'stub'
    if '/Monsters & Enemies/' in p: return 'creature'
    if '/Adventures/' in p: return 'adventure'
    if '/Encounter Modules/' in p: return 'encounter'
    seps=len(sep_re.findall(text)); has_num=bool(numrow_re.search(text))
    if seps>=1 and has_num: return 'table-set' if seps>1 else 'table'
    if name_bank(text) and ('Sentient NPCs' in p or 'name' in base.lower()): return 'name-bank'
    if '/Factions/' in p: return 'faction'
    if 'Tarot Engine_MANUAL' in p or '/NPCs/' in p or base.startswith('_'): return 'manual'
    if seps>=1: return 'table-set' if seps>1 else 'table'
    return 'manual'
def first_anchor(text,path):
    a=blockid_re.findall(text)+tag_re.findall(text)
    return a[0] if a else slug(path)
def table_class(path):
    n=os.path.basename(path)+' '+domain_of(path)
    return 'Commitment' if COMMIT.search(n) else 'Spark' if SPARK.search(n) else 'Fork'
def parse_fm(text):
    if not text.startswith('---'): return {},text
    end=text.find('\n---',3)
    if end<0: return {},text
    fm={}
    for line in text[3:end].strip('\n').splitlines():
        m=re.match(r'^([a-zA-Z_]+):\s*(.*)$',line)
        if m: fm[m.group(1)]=m.group(2)
    if not fm: return {},text
    return fm,text[end+4:].lstrip('\n')
def build(path,text):
    existing,body=parse_fm(text); typ=classify(path,text)
    fm=collections.OrderedDict()
    fm['id']=existing.get('id') or (first_anchor(body if existing else text,path) if typ=='table' else slug(path))
    typ=existing.get('type') or typ   # type is sticky once set — keep re-runs idempotent
    fm['type']=typ
    fm['domain']=existing.get('domain') or domain_of(path)
    fm['status']=existing.get('status') or ('stub' if typ=='stub' else 'source')
    if typ in ('table','table-set'):
        fm['table_class']=existing.get('table_class') or table_class(path)
        fm['player_facing']=existing.get('player_facing') or 'reveal'
        fm['voice_critical']=existing.get('voice_critical') or ('true' if fm['table_class']=='Spark' else 'false')
    for k,v in existing.items():
        if k not in fm and k not in ('type','system','tags'): fm[k]=v
    return fm,body,typ,(len(existing)>0)
def render(fm):
    return '\n'.join(['---']+[f'{k}: {v}' for k,v in fm.items()]+['---'])

files=sorted(set(f for r in ROOTS for f in glob.glob(r+"/**/*.md",recursive=True) if '/Archive' not in f and '/zz_' not in f))
types=collections.Counter()
for f in files:
    text=open(f,encoding='utf-8').read()
    fm,body,typ,existed=build(f,text); types[typ]+=1
    if WRITE: open(f,'w',encoding='utf-8').write(render(fm)+'\n\n'+(body if existed else text.lstrip('\n')))
print(("WROTE" if WRITE else "DRY-RUN")+f"  files={len(files)}  types={dict(types)}")
