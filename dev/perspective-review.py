#!/usr/bin/env python3
"""Perspective-survey review tool — pass/fail rulings on the 2026-07-10 sprite survey.

Serves the 99 uncommitted sheets (master + sprite-gen lane worktree) with the
survey's per-cell crops, lets Adam FAIL any sprite outright (or un-fail it), and
writes rulings to dev/model-qa/perspective-survey/rulings.json on every click.

    python3 dev/perspective-review.py   ->  http://127.0.0.1:5181/

Rulings shape: {"<sheet>|<pos>": {"ruling": "fail", "ts": ...}, ...}
Anything not present = pass. The regen-list builder subtracts fails from keeps.
"""
import json, os, time
from http.server import HTTPServer, BaseHTTPRequestHandler

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
LANE = os.path.join(ROOT, ".claude/worktrees/sprite-gen-refactor-magenta-951964")
SURVEY_DIR = os.path.join(ROOT, "dev/model-qa/perspective-survey")
RULINGS = os.path.join(SURVEY_DIR, "rulings.json")
PORT = 5181

def load(name):
    with open(os.path.join(SURVEY_DIR, name)) as f:
        return json.load(f)

def rulings():
    if os.path.exists(RULINGS):
        with open(RULINGS) as f:
            return json.load(f)
    return {}

PAGE = """<!doctype html><meta charset="utf-8"><title>Sprite Review — pass/fail</title>
<style>
body{background:#15181f;color:#e6e4dc;font:13px/1.4 ui-monospace,Menlo,monospace;margin:0;padding:14px}
h1{font-size:16px;margin:4px 0 2px}.sub{color:#9a9da6;font-size:12px;margin:0 0 10px}
.bar{position:sticky;top:0;background:#15181f;padding:8px 0;border-bottom:1px solid #333947;z-index:5;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.count{font-variant-numeric:tabular-nums}
button.f{background:#252a36;color:#e6e4dc;border:1px solid #333947;border-radius:4px;padding:3px 10px;cursor:pointer}
button.f.on{background:#4d84c4;border-color:#4d84c4;color:#fff}
h2{font-size:13px;color:#9a9da6;margin:20px 0 6px;text-transform:uppercase;letter-spacing:.08em}
.grid{display:flex;flex-wrap:wrap;gap:6px}
.cell{width:128px;background:#1d212b;border:2px solid #333947;border-radius:5px;padding:4px;cursor:pointer;position:relative}
.cell:hover{border-color:#6ba3e0}
.cell.fail{border-color:#d76666;opacity:.55}
.cell.fail::after{content:"FAIL";position:absolute;top:6px;right:6px;background:#d76666;color:#fff;font-size:10px;padding:1px 5px;border-radius:3px}
.th{width:120px;height:120px;background-size:var(--bw) var(--bh);background-position:var(--bx) var(--by);background-repeat:no-repeat;image-rendering:auto;border-radius:3px}
.lbl{font-size:10px;color:#9a9da6;margin-top:3px;height:26px;overflow:hidden}
.v{display:inline-block;padding:0 5px;border-radius:8px;font-size:9px;color:#fff;margin-right:4px}
</style>
<h1>Sprite Review — outright pass/fail</h1>
<p class="sub">Click a sprite to FAIL it (click again to restore). Every click saves to rulings.json instantly. Filter with the buttons.</p>
<div class="bar">
 <span class="count" id="counts"></span>
 <button class="f on" data-f="all">all</button>
 <button class="f" data-f="front">front</button>
 <button class="f" data-f="side">side</button>
 <button class="f" data-f="three-quarter">three-quarter</button>
 <button class="f" data-f="offangle">off-angle</button>
 <button class="f" data-f="failed">failed only</button>
</div>
<div id="app">loading…</div>
<script>
const VCOL={"front":"#3f9e38","side":"#4d84c4","three-quarter":"#c98f1a","high-angle":"#c55353","top-down":"#a05fc4","icon-flat":"#8a8f98","back":"#c46898","other":"#7a8578"};
let SURVEY, CROPS, RUL, FILTER="all";
async function boot(){
  [SURVEY,CROPS,RUL]=await Promise.all([fetch("/survey").then(r=>r.json()),fetch("/crops").then(r=>r.json()),fetch("/rulings").then(r=>r.json())]);
  render();
}
function keyOf(f,p){return f+"|"+p}
function render(){
  const app=document.getElementById("app");let html="";
  for(const s of SURVEY.sheets){
    const meta=CROPS.sheets[s.file]; if(!meta) continue;
    const cells=s.cells.filter(c=>meta.boxes[c.pos]).filter(c=>{
      const failed=RUL[keyOf(s.file,c.pos)];
      if(FILTER==="failed")return failed;
      if(FILTER==="offangle")return !["front","side","three-quarter","icon-flat"].includes(c.view);
      if(FILTER!=="all")return c.view===FILTER;
      return true;});
    if(!cells.length)continue;
    html+=`<h2>${s.file}</h2><div class="grid">`;
    for(const c of cells){
      const b=meta.boxes[c.pos];const bw=b[2]-b[0],bh=b[3]-b[1];
      const scale=Math.min(120/bw,120/bh);
      const k=keyOf(s.file,c.pos);
      html+=`<div class="cell ${RUL[k]?"fail":""}" data-k="${k}">
        <div class="th" style="background-image:url('/img/${meta.src}/${s.file}');--bw:${meta.w*scale}px;--bh:${meta.h*scale}px;--bx:${-b[0]*scale}px;--by:${-b[1]*scale}px"></div>
        <div class="lbl"><span class="v" style="background:${VCOL[c.view]||"#666"}">${c.view}</span>${c.pos} ${c.label||""}</div></div>`;
    }
    html+=`</div>`;
  }
  app.innerHTML=html;
  document.getElementById("counts").textContent=`${Object.keys(RUL).length} failed / ${SURVEY.sheets.reduce((a,s)=>a+s.cells.length,0)} total`;
}
document.addEventListener("click",async e=>{
  const cell=e.target.closest(".cell");
  if(cell){const k=cell.dataset.k;
    if(RUL[k])delete RUL[k];else RUL[k]={ruling:"fail",ts:Date.now()};
    await fetch("/ruling",{method:"POST",body:JSON.stringify({key:k,fail:!!RUL[k]})});
    cell.classList.toggle("fail");document.getElementById("counts").textContent=`${Object.keys(RUL).length} failed / ${SURVEY.sheets.reduce((a,s)=>a+s.cells.length,0)} total`;
    return;}
  const btn=e.target.closest("button.f");
  if(btn){document.querySelectorAll("button.f").forEach(b=>b.classList.remove("on"));btn.classList.add("on");FILTER=btn.dataset.f;render();}
});
boot();
</script>"""

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, body, ctype="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def do_GET(self):
        if self.path == "/":
            self._send(200, PAGE.encode(), "text/html; charset=utf-8")
        elif self.path == "/survey":
            self._send(200, json.dumps(load("survey-merged.json")).encode())
        elif self.path == "/crops":
            self._send(200, json.dumps(load("crops.json")).encode())
        elif self.path == "/rulings":
            self._send(200, json.dumps(rulings()).encode())
        elif self.path.startswith("/img/"):
            _, _, src, name = self.path.split("/", 3)
            base = LANE if src == "lane" else ROOT
            p = os.path.join(base, "ui-sketches/sprite-sheets", os.path.basename(name))
            if os.path.exists(p):
                with open(p, "rb") as f:
                    self._send(200, f.read(), "image/png")
            else:
                self._send(404, b"{}")
        else:
            self._send(404, b"{}")
    def do_POST(self):
        if self.path == "/ruling":
            n = int(self.headers.get("Content-Length", 0))
            req = json.loads(self.rfile.read(n))
            r = rulings()
            if req.get("fail"):
                r[req["key"]] = {"ruling": "fail", "ts": int(time.time())}
            else:
                r.pop(req["key"], None)
            with open(RULINGS, "w") as f:
                json.dump(r, f, indent=1)
            self._send(200, b'{"ok":true}')
        else:
            self._send(404, b"{}")

if __name__ == "__main__":
    print("perspective review -> http://127.0.0.1:%d/" % PORT)
    HTTPServer(("127.0.0.1", PORT), H).serve_forever()
