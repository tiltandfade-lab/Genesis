#!/usr/bin/env python3
"""Prepare sprite-first MM graphs for B05 makeshift materials."""
from __future__ import annotations
import hashlib, importlib.util, json
from pathlib import Path
HERE=Path(__file__).resolve().parent; ROOT=HERE.parent.parent
SRC=HERE/"source-sprites/b05-makeshift-v001"; GUIDES=HERE/"depth-guides/b05-makeshift-mm-v001"; GRAPHS=HERE/"graphs/b05-makeshift-mm-v001"; MANIFEST=HERE/"manifests/b05-makeshift-mm-v001.source.json"
spec=importlib.util.spec_from_file_location("helpers",HERE/"prepare-b01-fast-lane-mm.py"); helpers=importlib.util.module_from_spec(spec); spec.loader.exec_module(helpers)
MATERIALS=(
{"id":"makeshift-mud-daub","label":"Mud daub","source":"makeshift-mud-daub-selected-v001.png","guide_mode":"broad_luminance","guide_radius":8,"guide_contrast":.65,"graph_blur":3,"normal":.19,"ao":.11,"roughness":.90,"depth_scale":.010,"intent":"Broad hand-applied daub patches gain shallow relief."},
{"id":"makeshift-wattle","label":"Wattle","source":"makeshift-wattle-selected-v001.png","guide_mode":"dark_seam_residual","guide_radius":10,"guide_contrast":1.0,"graph_blur":2,"normal":.22,"ao":.19,"roughness":.82,"depth_scale":.016,"intent":"Over-under weave separates without embossing bark grain."},
{"id":"makeshift-stretched-hide","label":"Stretched hide","source":"makeshift-stretched-hide-selected-v001.png","guide_mode":"dark_seam_residual","guide_radius":16,"guide_contrast":1.0,"graph_blur":2,"normal":.18,"ao":.15,"roughness":.76,"depth_scale":.011,"intent":"Panel seams and lashings gain restrained depth."},
{"id":"makeshift-bone-tusk-stakes","label":"Bone / tusk stakes","source":"makeshift-bone-tusk-stakes-selected-v001.png","guide_mode":"dark_seam_residual","guide_radius":13,"guide_contrast":1.05,"graph_blur":2,"normal":.21,"ao":.18,"roughness":.78,"depth_scale":.015,"intent":"Shaft gaps and rail lashings separate at low relief."},
{"id":"makeshift-scavenged-plank","label":"Scavenged plank patchwork","source":"makeshift-scavenged-plank-selected-v001.png","guide_mode":"dark_seam_residual","guide_radius":14,"guide_contrast":1.0,"graph_blur":2,"normal":.19,"ao":.17,"roughness":.76,"depth_scale":.013,"intent":"Patchwork joints lift; painted grain stays flat."},
{"id":"makeshift-swamp-moss-thatch","label":"Swamp-moss thatch","source":"makeshift-swamp-moss-thatch-selected-v001.png","guide_mode":"dark_seam_residual","guide_radius":10,"guide_contrast":1.0,"graph_blur":2,"normal":.23,"ao":.20,"roughness":.88,"depth_scale":.018,"intent":"Course underlaps gain depth while moss color remains construction albedo."})
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 GUIDES.mkdir(parents=True,exist_ok=True); GRAPHS.mkdir(parents=True,exist_ok=True); entries=[]
 for m in MATERIALS:
  s=SRC/m["source"]; g=GUIDES/f"{m['id']}-height-guide-v001.png"; p=GRAPHS/f"b05-{m['id']}-v001.ptex"
  helpers.height_guide(s,m).save(g); payload=helpers.graph(m,s,g); payload["label"]=f"B05 makeshift / {m['label']} / sprite-first MM v001"; p.write_text(json.dumps(payload,indent=2)+"\n")
  entries.append({**m,"fixture":"wall","source":str(s.relative_to(ROOT)),"sourceSha256":sha(s),"heightGuide":str(g.relative_to(ROOT)),"heightGuideSha256":sha(g),"graph":str(p.relative_to(ROOT)),"graphSha256":sha(p)})
 MANIFEST.parent.mkdir(parents=True,exist_ok=True); MANIFEST.write_text(json.dumps({"schemaVersion":1,"checkpoint":"B05-makeshift-sprite-first-MM-v001","workflow":"accepted makeshift sprite -> subject-aware height guide -> MM","sourceGateReceipt":"dev/material-lane/proofs/b05-makeshift-v001/b05-makeshift-selected-source-receipt-v001.json","materials":entries},indent=2)+"\n")
 print("Prepared 6 B05 graphs.")
if __name__=="__main__": main()
