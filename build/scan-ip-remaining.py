#!/usr/bin/env python3
"""Read-only census of REMAINING IP across the corpus (post creature-scrub), by category.

Defines "the rest of the deck" to clear. Excludes Reference/ (copyrighted source) + zz_Archive/.
Reports per-category token counts + the files carrying them. Applies nothing.
"""
import os, re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CATS = {
  "FR Places": ["Leilon","Neverwinter","Waterdeep","Waterdhavian","Luskan","Mirabar","Triboar","Phandalin",
                "Port Llast","Baldur's Gate","Sword Coast","Sword Mountains","Mere of Dead Men","Icewind Dale",
                "Candlekeep","Cormyr","Sembia","Calimshan","Chult","Faerun","Faerûn","Toril","Menzoberranzan","Neverwinter Wood"],
  "FR Factions": ["Zhentarim","Harpers","Harper","Emerald Enclave","Lords' Alliance","Red Wizards","Flaming Fist"],
  "FR Deities": ["Lathander","Yeenoghu","Gruumsh","Lolth","Tymora","Selune","Selûne","Vecna","Tempus","Lurue",
                 "Mystra","Bhaal","Myrkul","Kelemvor","Tiamat","Bahamut","Asmodeus","Umberlee","Mielikki","Silvanus","the Weave","Mythal"],
  "FR Cultures": ["Chondathan","Illuskan","Tethyrian","Turami","Damaran","Rashemi","Shou","Mulan","Calishite","Netherese"],
  "Campaign (Shifting Vale)": ["Arcane Order","Hungering Stone","Shifting Vale","Lord Vane","Low Tide","Black Serpent",
                 "Salt-Crow","Tectonic Fort","Leilonnar"],
  "Brand": ["Wizards of the Coast","Forgotten Realms","Dungeons & Dragons","WotC"],
  "Celebrity analog labels": [r"Analog:"],
  "FR lore proper-nouns (Art Depiction etc.)": ["Lathlaeril","Everhorde","Evermeet","Gauntlgrym","Phalorm",
                 "Ahghairon","Ruardh","Netheril","Illefarn","Aelinthaldaar","Iniarv","Voaraghamanthar","Ascalhorn","Uthtower"],
}

SKIP = ("zz_Archive","Archive","/Reference/",".git")
ROOTS = [os.path.join(ROOT,"Engine","03. _Tables"), os.path.join(ROOT,"Asset Library")]

def files():
    seen=set()
    for r in ROOTS:
        for dp,dn,fn in os.walk(r):
            if any(s in dp for s in SKIP): continue
            for f in fn:
                if f.endswith(".md"):
                    p=os.path.join(dp,f)
                    if p not in seen: seen.add(p); yield p

per_cat=defaultdict(int)
per_cat_files=defaultdict(set)
per_token=defaultdict(int)
file_cat=defaultdict(lambda: defaultdict(int))
pats={cat:[(t,re.compile((t if t.endswith(":") else r"\b"+re.escape(t)+r"\b"),re.I)) for t in toks] for cat,toks in CATS.items()}

for p in files():
    try: txt=open(p,encoding="utf-8",errors="ignore").read()
    except: continue
    rel=os.path.relpath(p,ROOT)
    for cat,tl in pats.items():
        c=0
        for t,pat in tl:
            n=len(pat.findall(txt))
            if n: per_token[(cat,t)]+=n; c+=n
        if c: per_cat[cat]+=c; per_cat_files[cat].add(rel); file_cat[rel][cat]+=c

print("="*78); print("REMAINING IP CENSUS (post creature-scrub; excl. Reference/ + zz_Archive/)"); print("="*78)
print(f"\n{sum(per_cat.values())} total hits across {len(set().union(*per_cat_files.values()) if per_cat_files else set())} files\n")
for cat in CATS:
    if not per_cat[cat]:
        print(f"  {cat:42s}  CLEAR (0)"); continue
    toks=sorted([(t,per_token[(cat,t)]) for t,_ in pats[cat] if per_token[(cat,t)]],key=lambda x:-x[1])
    ts=", ".join(f"{t}×{n}" for t,n in toks[:8])
    print(f"  {cat:42s}  {per_cat[cat]:>4} hits / {len(per_cat_files[cat])} files  · {ts}")

print("\nTOP FILES (most remaining IP)")
ranked=sorted(file_cat.items(),key=lambda kv:-sum(kv[1].values()))
for rel,cats in ranked[:20]:
    print(f"  {sum(cats.values()):>4}  {rel}  [{', '.join(sorted(cats))}]")
