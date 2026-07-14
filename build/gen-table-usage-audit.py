import os, re, json, glob, collections, importlib.util, tempfile

BASE = os.getcwd()
# import compiler internals
spec = importlib.util.spec_from_file_location("ct", os.path.join(BASE,"Engine","00. _System","compile-tables.py"))
ct = importlib.util.module_from_spec(spec)
import sys; _argv=sys.argv; sys.argv=["x"]  # avoid EMIT
import io, contextlib
with contextlib.redirect_stdout(io.StringIO()):
    spec.loader.exec_module(ct)
sys.argv=_argv

# rebuild id -> source file using compiler's exact derivation
id2file = {}
files = sorted(set(f for r in ct.ROOTS for f in glob.glob(r+"/**/*.md",recursive=True) if '/Archive' not in f and '/zz_' not in f))
for f in files:
    fm, body = ct.fm_and_body(open(f,encoding='utf-8').read())
    if fm.get('type') not in ('table','table-set'): continue
    for context, rows in ct.split_blocks(body.splitlines()):
        parsed, info = ct.parse_block(context, rows)
        if info is None: continue
        if fm['type']=='table': tid=fm['id']
        else: tid=re.sub(r'[^a-z0-9]+','-',(ct.hint_id(context) or fm['id']).lower()).strip('-')
        id2file[tid]=os.path.relpath(f,BASE)

TABLES = {k:v for k,v in json.load(open(os.path.join(BASE,"tables.json"))).items() if isinstance(v,dict) and "rows" in v}
missing = [k for k in TABLES if k not in id2file]
print("compiled tables:",len(TABLES),"| mapped to file:",len(id2file),"| still unmapped:",len(missing), missing[:8])

# file -> ids
file2ids=collections.defaultdict(list)
for tid,rel in id2file.items():
    if tid in TABLES: file2ids[rel].append(tid)

# corpora
def read(root,exts):
    o={}
    for dp,dn,fn in os.walk(root):
        if 'zz_Archive' in dp or '/Archive' in dp: continue
        for f in fn:
            if f.endswith(exts):
                p=os.path.join(dp,f)
                try:o[p]=open(p,encoding='utf-8',errors='ignore').read()
                except:pass
    return o
procs=read(os.path.join(BASE,"Engine","02. _Procedures"),(".md",))
code={}
for r in ["src","data"]:
    if os.path.isdir(os.path.join(BASE,r)): code.update(read(os.path.join(BASE,r),(".js",)))
# TABLE-ATLAS.md unit U0: data/table-usage.js is THIS script's own generated output — it is a
# machine dump of every table id/base/consumer string, so once it exists it self-matches on the
# next run (every table id appears as a JSON key inside it), corrupting the wiring classification
# with false WIRED hits attributed to "table-usage.js" and breaking idempotency. Exclude it from
# the code corpus it would otherwise pollute (verified red: without this line, a second run flips
# most ORACLE-ONLY/PROCEDURE/CHAINED tables to WIRED via a spurious self-reference).
_SELF_GENERATED=os.path.join(BASE,"data","table-usage.js")
code.pop(_SELF_GENERATED,None)
gh=os.path.join(BASE,"genesis.html")
if os.path.isfile(gh): code[gh]=open(gh,encoding='utf-8',errors='ignore').read()
tablesmd=read(os.path.join(BASE,"Engine","03. _Tables"),(".md",))
tablesmd.update(read(os.path.join(BASE,"Asset Library"),(".md",)))

# for each source FILE, is its basename referenced anywhere (else than itself)?
def basename(rel): return os.path.splitext(os.path.basename(rel))[0]

def file_refs(rel):
    base=basename(rel)
    abspath=os.path.join(BASE,rel)
    # match [[base  OR plain base occurrence
    rx=re.compile(re.escape(base),re.I)
    hits={"procedure":set(),"code":set(),"chain":set()}
    for corp,bucket in [(procs,"procedure"),(code,"code")]:
        for fp,txt in corp.items():
            if rx.search(txt): hits[bucket].add(os.path.basename(fp))
    for fp,txt in tablesmd.items():
        if os.path.abspath(fp)==os.path.abspath(abspath): continue
        if re.search(r'\[\[\s*'+re.escape(base),txt,re.I): hits["chain"].add(os.path.basename(fp))
    return hits

filecls={}
for rel in file2ids:
    h=file_refs(rel)
    if h["code"]: c="WIRED"
    elif h["procedure"]: c="PROCEDURE"
    elif h["chain"]: c="CHAINED"
    else: c="ORACLE-ONLY"
    filecls[rel]={"cls":c,"hits":{k:sorted(v) for k,v in h.items()}}

# rows per table inherit file class
rows=[]
for tid,meta in TABLES.items():
    rel=id2file.get(tid)
    fc=filecls.get(rel,{"cls":"UNMAPPED","hits":{}})
    rows.append({"id":tid,"file":rel,"base":basename(rel) if rel else None,
                 "domain":meta.get("domain","—"),"die":meta.get("dice") or "d"+str(meta.get("die")),
                 "n":len(meta.get("rows",[])),"cls":fc["cls"],"hits":fc["hits"]})
_dump=os.path.join(tempfile.gettempdir(),"audit_final.json")   # portable temp (was a hardcoded /tmp path)
with open(_dump,"w",encoding="utf-8") as _f: json.dump({"rows":rows,"filecls":filecls,"file2ids":file2ids},_f)

cnt=collections.Counter(r["cls"] for r in rows)
print("by table:",dict(cnt))
# orphan FILES (not tables) — dedup
orphan_files=sorted([rel for rel,fc in filecls.items() if fc["cls"]=="ORACLE-ONLY"])
print("\nORACLE-ONLY source FILES:",len(orphan_files))
bydom=collections.defaultdict(list)
for rel in orphan_files:
    dom=TABLES[file2ids[rel][0]].get("domain","—")
    bydom[dom].append((basename(rel),len(file2ids[rel])))
for dom in sorted(bydom):
    print(f"\n[{dom}]")
    for b,n in sorted(bydom[dom]): print(f"   - {b}"+(f"  ({n} sub-tables)" if n>1 else ""))

# ---- doc generation ----
def _gen_doc():
    import collections as _c
    DD={"rows":rows,"filecls":filecls,"file2ids":file2ids}
    def b(rel): return os.path.splitext(os.path.basename(rel))[0]
    def cp(fn): return re.sub(r'\s*v?\d+\.\d+\.md$|\.md$','',fn)
    frec={}
    for rel,fc in filecls.items():
        ids=file2ids[rel]; dom=TABLES[ids[0]].get("domain","—")
        subs=[(t,TABLES[t].get("dice") or "d"+str(TABLES[t].get("die")),len(TABLES[t].get("rows",[]))) for t in ids]
        h=fc["hits"]
        if fc["cls"]=="WIRED": trig="🔗 **wired in code** — "+", ".join(h.get("code",[]))
        elif fc["cls"]=="PROCEDURE": trig="▶ via "+", ".join(sorted(set(cp(x) for x in h.get("procedure",[]))))
        elif fc["cls"]=="CHAINED": trig="⛓ chained from "+", ".join(h.get("chain",[]))
        else: trig="⚠️ **Oracle-only — no auto trigger**"
        frec[rel]={"dom":dom,"cls":fc["cls"],"trig":trig,"subs":subs,"base":b(rel)}
    bydom=_c.defaultdict(list)
    for rel,r in frec.items(): bydom[r["dom"]].append(rel)
    CO={"WIRED":0,"PROCEDURE":1,"CHAINED":2,"ORACLE-ONLY":3}
    tc=_c.Counter(rr["cls"] for rr in rows); fc2=_c.Counter(filecls[r]["cls"] for r in filecls)
    o=["# Genesis — Table Usage Audit","",
       "*Generated snapshot — regenerate with `python3 build/gen-table-usage-audit.py` after wiring/table changes.*","",
       "**What this maps:** every compiled table (`tables.json`) → source file → what *triggers* it. The Oracle tab rolls **any** table manually, so \"trigger\" means an **automatic** call: a generator **procedure**, a **roll-chain**, or **wired code**. Tables with none are **Oracle-only** — authored but not in any flow (wire-up or retire candidates). *Caveat: two unwired tables that cross-link each other read as ⛓ chained.*","",
       f"**Totals:** {len(TABLES)} tables / {len(filecls)} files.  ",
       f"By table — ▶ procedure: **{tc['PROCEDURE']}** · ⛓ chained: **{tc['CHAINED']}** · 🔗 wired: **{tc['WIRED']}** · ⚠️ Oracle-only: **{tc['ORACLE-ONLY']}**.  ",
       f"⚠️ Oracle-only source files: **{fc2['ORACLE-ONLY']}** of {len(filecls)}.","","---","",
       "## ⚠️ Unused tables (Oracle-only) — the shortlist","",
       "Authored content not reached by any procedure, chain, or code. Click through to judge keep-and-wire vs. retire.",""]
    orph=_c.defaultdict(list)
    for rel,r in frec.items():
        if r["cls"]=="ORACLE-ONLY": orph[r["dom"]].append((rel,r))
    for dom in sorted(orph):
        o.append(f"### {dom}")
        for rel,r in sorted(orph[dom],key=lambda x:x[1]["base"]):
            n=len(r["subs"]); suf=f" — {n} sub-tables" if n>1 else f" — {r['subs'][0][1]}, {r['subs'][0][2]} rows"
            o.append(f"- [[{r['base']}]]{suf}")
        o.append("")
    o+=["---","","## Full catalog — every table & its trigger",""]
    for dom in sorted(bydom):
        o.append(f"### {dom}")
        for rel in sorted(bydom[dom],key=lambda rel:(CO[frec[rel]['cls']],frec[rel]['base'])):
            r=frec[rel]; n=len(r["subs"]); meta=f"{n} sub-tables" if n>1 else f"{r['subs'][0][1]}, {r['subs'][0][2]} rows"
            o.append(f"- [[{r['base']}]] — {r['trig']}  *({meta})*")
        o.append("")
    open(os.path.join(BASE,"docs","TABLE-USAGE-AUDIT.md"),"w",encoding="utf-8").write("\n".join(o))
    print("wrote docs/TABLE-USAGE-AUDIT.md")
_gen_doc()

# ---- machine-readable data emit (docs/TABLE-ATLAS.md unit U0) ----
def _gen_data():
    """Emit data/table-usage.js (owns TABLE_USAGE) — the machine twin of docs/TABLE-USAGE-AUDIT.md.
    Maps 1:1 onto the `rows`/`filecls` structures already computed above; no new derivation logic."""
    entries={}
    for r in rows:
        rel=r["file"]
        fc=filecls.get(rel,{"cls":"UNMAPPED","hits":{"code":[],"procedure":[],"chain":[]}})
        entries[r["id"]]={
            "file": rel,
            "base": r["base"],
            "domain": r["domain"],
            "cls": fc["cls"],
            "consumers": {
                "code": fc["hits"].get("code",[]),
                "procedure": fc["hits"].get("procedure",[]),
                "chain": fc["hits"].get("chain",[]),
            },
        }
    lines=[
        "/* GENERATED — do not hand-edit. Regenerate: python3 build/gen-table-usage-audit.py",
        "   Source: tables.json + Engine/{02._Procedures,03._Tables} + src/ + genesis.html scan.",
        "   Owns TABLE_USAGE: per-compiled-table wiring class + consumer lists (the machine twin of",
        "   docs/TABLE-USAGE-AUDIT.md). */",
        "const TABLE_USAGE = " + json.dumps(entries, indent=2, sort_keys=True, ensure_ascii=False) + ";",
        "",
    ]
    out_path=os.path.join(BASE,"data","table-usage.js")
    with open(out_path,"w",encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("wrote data/table-usage.js")
_gen_data()
