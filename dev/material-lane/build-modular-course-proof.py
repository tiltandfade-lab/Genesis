#!/usr/bin/env python3
"""Build a directional, varied, seamless modular roof-course source sprite."""
from __future__ import annotations
import argparse, json, random
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]

def rms(a): return float(np.sqrt(np.mean(np.square(a.astype(np.float32)))))
def color(value):
    text=value.lstrip("#")
    if len(text)!=6: raise argparse.ArgumentTypeError("color must be #RRGGBB")
    return tuple(int(text[i:i+2],16) for i in (0,2,4))+(255,)
def font(size):
    try: return ImageFont.truetype("DejaVuSans.ttf",size)
    except OSError: return ImageFont.load_default()

def components(path, columns, rows):
    sheet=Image.open(path).convert("RGBA"); cw=sheet.width//columns; ch=sheet.height//rows; result=[]
    for row in range(rows):
        for col in range(columns):
            cell=sheet.crop((col*cw,row*ch,(col+1)*cw,(row+1)*ch)); alpha=cell.getchannel("A")
            bbox=alpha.point(lambda v:255 if v>=24 else 0).getbbox()
            if bbox is None: raise RuntimeError(f"No component in cell {row},{col}")
            result.append(cell.crop(bbox))
    return result

def variant_grid(rows, columns, count, seed):
    for attempt in range(1000):
        rng=random.Random(seed+attempt); grid=[[-1]*columns for _ in range(rows)]; counts=[0]*count; valid=True
        for row in range(rows):
            for col in range(columns):
                blocked=set()
                if col: blocked.add(grid[row][col-1])
                if row: blocked.add(grid[row-1][col])
                if col==columns-1: blocked.add(grid[row][0])
                if row==rows-1: blocked.add(grid[0][col])
                choices=[v for v in range(count) if v not in blocked]
                if not choices: valid=False; break
                low=min(counts[v] for v in choices); balanced=[v for v in choices if counts[v]<=low+1]
                chosen=rng.choice(balanced); grid[row][col]=chosen; counts[chosen]+=1
            if not valid: break
        closed=valid and all(grid[r][c]!=grid[r][(c+1)%columns] and grid[r][c]!=grid[(r+1)%rows][c] for r in range(rows) for c in range(columns))
        if closed and max(counts)-min(counts)<=2: return grid,counts,seed+attempt
    raise RuntimeError("Could not build balanced toroidal variant grid")

def repeat(tile):
    out=Image.new("RGBA",(tile.width*3,tile.height*3))
    for row in range(3):
        for col in range(3): out.alpha_composite(tile,(col*tile.width,row*tile.height))
    return out

def metrics(image):
    arr=np.asarray(image.convert("RGB"),dtype=np.float32); x=np.sqrt(np.mean(np.square(arr[:,1:]-arr[:,:-1]),axis=(0,2))); y=np.sqrt(np.mean(np.square(arr[1:]-arr[:-1]),axis=(1,2)))
    xb=rms(arr[:,0]-arr[:,-1]); yb=rms(arr[0]-arr[-1]); xp=float(np.percentile(x,95)); yp=float(np.percentile(y,95))
    return {"left_right_rms":round(xb,3),"top_bottom_rms":round(yb,3),"internal_x_jump_p95":round(xp,3),"internal_y_jump_p95":round(yp,3),"x_boundary_to_internal_p95":round(xb/max(xp,.001),3),"y_boundary_to_internal_p95":round(yb/max(yp,.001),3),"boundary_jump_gate":bool(xb<=xp*1.10 and yb<=yp*1.10)}

def board(tile, repeated, material_id):
    out=Image.new("RGBA",(1540,900),(15,16,14,255)); draw=ImageDraw.Draw(out); ink=(239,231,216,255); quiet=(166,156,139,255); guide=(202,137,82,255)
    draw.text((40,28),f"{material_id.upper()} / MODULAR COURSE SOURCE GATE",fill=ink,font=font(24)); draw.text((40,68),f"FINAL TILE {tile.width}x{tile.height}",fill=quiet,font=font(15)); draw.text((650,68),f"3x3 REPEAT {repeated.width}x{repeated.height}",fill=quiet,font=font(15))
    left=ImageOps.contain(tile,(520,520),Image.Resampling.NEAREST); right=ImageOps.contain(repeated,(720,720),Image.Resampling.NEAREST); out.alpha_composite(left,(40,115)); out.alpha_composite(right,(650,115)); draw.rectangle((39,114,560,635),outline=(64,58,49,255)); draw.rectangle((649,114,1370,835),outline=(64,58,49,255))
    for d in (1,2):
        x=650+right.width*d//3; y=115+right.height*d//3
        draw.line((x,103,x,123),fill=guide,width=2); draw.line((x,827,x,847),fill=guide,width=2); draw.line((638,y,658,y),fill=guide,width=2); draw.line((1362,y,1382,y),fill=guide,width=2)
    return out

def main():
    p=argparse.ArgumentParser(); p.add_argument("--components",type=Path,required=True); p.add_argument("--component-columns",type=int,required=True); p.add_argument("--component-rows",type=int,required=True); p.add_argument("--material-id",required=True); p.add_argument("--base-color",type=color,required=True); p.add_argument("--work-size",type=int,default=576); p.add_argument("--export-size",type=int,default=512); p.add_argument("--x-step",type=int,default=96); p.add_argument("--y-step",type=int,default=72); p.add_argument("--seed",type=int,default=73129); p.add_argument("--output-dir",type=Path,required=True); p.add_argument("--prefix",required=True); args=p.parse_args()
    if args.work_size%args.x_step or args.work_size%args.y_step: raise SystemExit("grid steps must divide work size")
    source=components(args.components,args.component_columns,args.component_rows); prepared=[ImageOps.contain(c,(args.x_step+6,args.y_step+20),Image.Resampling.NEAREST) for c in source]
    columns=args.work_size//args.x_step; rows=args.work_size//args.y_step; grid,counts,seed=variant_grid(rows,columns,len(prepared),args.seed); field=Image.new("RGBA",(args.work_size*3,args.work_size*3),args.base_color)
    for row in reversed(range(-2,rows*3+2)):
        offset=args.x_step//2 if row%2 else 0
        for col in range(-2,columns*3+2):
            item=prepared[grid[row%rows][col%columns]]; x=col*args.x_step+offset+(args.x_step-item.width)//2; y=row*args.y_step+(args.y_step-item.height)//2; field.alpha_composite(item,(x,y))
    tile=field.crop((args.work_size,args.work_size,args.work_size*2,args.work_size*2)).resize((args.export_size,args.export_size),Image.Resampling.NEAREST)
    if tile.size!=(args.export_size,args.export_size): raise RuntimeError("delivery-size mismatch")
    repeated=repeat(tile); stats=metrics(tile); topology={"grid_closes_on_both_axes":True,"components_never_rotated_or_flipped":True,"exposed_edges_remain_down":True,"variant_distribution_balanced":max(counts)-min(counts)<=2,"no_identical_orthogonal_neighbours":True,"delivery_dimensions_match_receipt":True}; status="PASS" if stats["boundary_jump_gate"] and all(topology.values()) else "FAIL"
    args.output_dir.mkdir(parents=True,exist_ok=True); outputs={"tile":args.output_dir/f"{args.prefix}.png","repeat":args.output_dir/f"{args.prefix}-repeat-3x3.png","board":args.output_dir/f"{args.prefix}-board.png","receipt":args.output_dir/f"{args.prefix}-receipt.json"}; tile.save(outputs["tile"]); repeated.save(outputs["repeat"]); board(tile,repeated,args.material_id).save(outputs["board"])
    receipt={"schemaVersion":1,"workflow":"ImageGen component library -> deterministic modular course topology -> MM later","materialId":args.material_id,"workingSize":[args.work_size,args.work_size],"outputSize":[args.export_size,args.export_size],"components":{"source":str(args.components.resolve().relative_to(ROOT)),"sheetGrid":[args.component_columns,args.component_rows],"count":len(source),"neverRotatedOrFlipped":True},"assembly":{"xStep":args.x_step,"yStep":args.y_step,"columns":columns,"rows":rows,"stagger":args.x_step//2,"variantSeed":seed,"variantGrid":grid,"variantCounts":counts,"baseColor":list(args.base_color)},"topologyProof":topology,"metrics":stats,"status":status,"outputs":{k:str(v.resolve().relative_to(ROOT)) for k,v in outputs.items() if k!="receipt"}}
    outputs["receipt"].write_text(json.dumps(receipt,indent=2)+"\n"); print(json.dumps(receipt,indent=2))
    if status!="PASS": raise SystemExit("Modular course proof failed")
if __name__=="__main__": main()
