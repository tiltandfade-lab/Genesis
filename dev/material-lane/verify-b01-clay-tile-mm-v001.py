#!/usr/bin/env python3
import hashlib,json
from pathlib import Path
import numpy as np
from PIL import Image
H=Path(__file__).resolve().parent;R=H.parent.parent;mm=json.loads((H/"manifests/b01-clay-tile-mm-v001.source.json").read_text());runs=[H/"exports/b01-clay-tile-mm-v001/run-a",H/"exports/b01-clay-tile-mm-v001/run-b"];stem="b01-roof-clay-tile-v001";n={k:f"{stem}_{v}.png" for k,v in {"a":"albedo","h":"heightmap","n":"normal","o":"orm"}.items()};sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
for f in n.values():
    if sha(runs[0]/f)!=sha(runs[1]/f):raise RuntimeError(f"nondeterministic {f}")
s=np.asarray(Image.open(R/mm["source"]).convert("RGB"),float);a=np.asarray(Image.open(runs[0]/n["a"]).convert("RGB"),float);h=np.asarray(Image.open(runs[0]/n["h"]).convert("L"),float);normal=np.asarray(Image.open(runs[0]/n["n"]).convert("RGB"),float);orm=np.asarray(Image.open(runs[0]/n["o"]).convert("RGB"),float);mae=float(abs(s-a).mean());corr=float(np.corrcoef(s.reshape(-1),a.reshape(-1))[0,1]);rough=round(mm["materialTreatment"]["roughness"]*255);passed=mae<3 and corr>.99 and h.std()>1 and max(normal[:,:,0].std(),normal[:,:,1].std())>.35 and orm[:,:,2].max()==0 and abs(orm[:,:,1].mean()-rough)<=1;report={"schemaVersion":1,"assetId":mm["assetId"],"result":"PASS" if passed else "FAIL","sourceIdentity":{"meanAbsoluteError":round(mae,4),"pixelCorrelation":round(corr,4)},"depth":{"heightStdDev":round(float(h.std()),4),"normalStdDevRgb":[round(float(v),4) for v in normal.std(axis=(0,1))]},"orm":{"expectedRoughnessByte":rough,"metallicMaxByte":int(orm[:,:,2].max())}};(H/"receipts/b01-clay-tile-mm-v001-verification.json").write_text(json.dumps(report,indent=2)+"\n");print(f"{report['result']}: clay MM depth test")
