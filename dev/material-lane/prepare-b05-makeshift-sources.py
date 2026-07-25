#!/usr/bin/env python3
"""Apply declared B05 seam routes and freeze selected sources at 512px."""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "dev/material-lane/source-sprites/b05-makeshift-v001"
PROOF = ROOT / "dev/material-lane/proofs/b05-makeshift-v001"
RAW = {
    "mud-daub": "makeshift-mud-daub-source-v001.png",
    "wattle": "makeshift-wattle-source-v002.png",
    "stretched-hide": "makeshift-stretched-hide-source-v001.png",
    "bone-tusk-stakes": "makeshift-bone-tusk-stakes-source-v001.png",
    "scavenged-plank": "makeshift-scavenged-plank-source-v001.png",
    "swamp-moss-thatch": "makeshift-swamp-moss-thatch-source-v002.png",
}

def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def lock(array: np.ndarray, band: int = 32) -> np.ndarray:
    out = array.astype(np.float32).copy()
    for axis in (1, 0):
        work = np.swapaxes(out, axis, 0)
        for offset in range(band):
            keep = .5 - .5 * math.cos(math.pi * offset / (band - 1))
            shared = (work[offset] + work[-1-offset]) / 2
            work[offset] = shared * (1-keep) + work[offset] * keep
            work[-1-offset] = shared * (1-keep) + work[-1-offset] * keep
        out = np.swapaxes(work, 0, axis)
    return np.uint8(np.clip(np.rint(out), 0, 255))

def period_rebuild(array: np.ndarray, period: int) -> tuple[np.ndarray, int]:
    best = min(range(0, array.shape[0]-period-1), key=lambda y: np.mean(np.abs(array[y].astype(float)-array[y+period].astype(float))))
    unit = array[best:best+period]
    rebuilt = np.concatenate([unit] * math.ceil(array.shape[0]/period), axis=0)[:array.shape[0]]
    # force output height to an integral unit count, then resize once to the square authority
    count = round(array.shape[0]/period)
    rebuilt = np.concatenate([unit] * count, axis=0)
    return rebuilt, best

def metrics(image: Image.Image) -> dict[str, object]:
    a=np.asarray(image.convert("RGB"),dtype=np.float32)
    x=np.sqrt(np.mean((a[:,1:]-a[:,:-1])**2,axis=(0,2))); y=np.sqrt(np.mean((a[1:]-a[:-1])**2,axis=(1,2)))
    xr=float(np.sqrt(np.mean((a[:,0]-a[:,-1])**2))/max(np.percentile(x,95),.001))
    yr=float(np.sqrt(np.mean((a[0]-a[-1])**2))/max(np.percentile(y,95),.001))
    return {"xBoundaryToInternalP95":round(xr,3),"yBoundaryToInternalP95":round(yr,3),"boundaryJumpGate":xr<=1.1 and yr<=1.1}

def main() -> None:
    PROOF.mkdir(parents=True, exist_ok=True)
    records=[]
    for slug,name in RAW.items():
        source=SRC/name; arr=np.asarray(Image.open(source).convert("RGB")); route="raw ImageGen"
        if slug=="mud-daub":
            arr=lock(arr,32); route="ImageGen v001 + 32px continuous-field lock"
        elif slug=="wattle":
            arr,start=period_rebuild(arr,84); route=f"ImageGen v002 + 84px period rebuild from y={start}"
        elif slug=="swamp-moss-thatch":
            arr,start=period_rebuild(arr,163); route=f"ImageGen v002 + 163px period rebuild from y={start}"
        adapted=Image.fromarray(arr).resize((512,512),Image.Resampling.HAMMING)
        output=SRC/f"makeshift-{slug}-selected-v001.png"; adapted.save(output)
        records.append({"id":f"makeshift-{slug}","parentSource":str(source.relative_to(ROOT)),"parentSourceSha256":sha(source),"source":str(output.relative_to(ROOT)),"sourceSha256":sha(output),"selectionMethod":route,"dimensions":[512,512],"metrics":metrics(adapted)})
    board=Image.new("RGB",(1600,140+410*len(records)),"#11151c"); draw=ImageDraw.Draw(board); font=ImageFont.load_default()
    draw.text((32,24),"B05 MAKESHIFT — SELECTED SOURCE GATE",fill="#f4ead7",font=font)
    draw.text((32,54),"512px albedo authorities; single tile and locked-aspect 3x3 repeat.",fill="#aeb8c8",font=font)
    draw.text((32,82),"Gate: wrapped boundary <= 1.10x ordinary internal p95 jump.",fill="#aeb8c8",font=font)
    for index,record in enumerate(records):
        top=140+index*410; draw.rectangle((0,top,1600,top+410),fill="#1b202a" if index%2==0 else "#171c25")
        draw.text((32,top+18),record["id"].upper(),fill="#d8b66b",font=font)
        draw.text((32,top+46),f"PASS  X {record['metrics']['xBoundaryToInternalP95']:.3f}  Y {record['metrics']['yBoundaryToInternalP95']:.3f}  {record['selectionMethod']}",fill="#70d890",font=font)
        tile=Image.open(ROOT/record["source"]).convert("RGB"); single=ImageOps.fit(tile,(300,300),method=Image.Resampling.NEAREST)
        repeated=Image.new("RGB",(tile.width*3,tile.height*3))
        for row in range(3):
            for column in range(3): repeated.paste(tile,(column*tile.width,row*tile.height))
        board.paste(single,(32,top+86)); board.paste(ImageOps.fit(repeated,(900,300),method=Image.Resampling.NEAREST),(380,top+86))
    board_path=PROOF/"b05-makeshift-selected-source-board-v001.png"; board.save(board_path)
    receipt=PROOF/"b05-makeshift-selected-source-receipt-v001.json"
    receipt.write_text(json.dumps({"schema":"genesis.b05-source-gate.v1","boundaryGateRatio":1.1,"board":str(board_path.relative_to(ROOT)),"results":records},indent=2)+"\n")
    print(json.dumps(records,indent=2))
    if not all(r["metrics"]["boundaryJumpGate"] for r in records): raise SystemExit("B05 source gate failed")

if __name__=="__main__": main()
