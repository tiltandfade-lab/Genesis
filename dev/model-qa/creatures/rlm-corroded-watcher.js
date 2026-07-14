/* dev/model-qa/creatures/rlm-corroded-watcher.js — CORRODED WATCHER (ash realm, Medium, CR 1).
   Read: a camera-drone husk bolted onto a scavenged chassis — a boxy rusted lens-housing "head"
   riding a squat tripod-legged body cobbled from pipe and plate. Ash register: sun-bleached rust
   and dead paint, a dull lens-glass eye (not an eye-quad face — a flat glass disc set in a socket
   ring, read as a sensor not a face), antenna wire, patch-welded seams. Whole-object grammar: one
   function, one merged frame, no anchors. Base disc r=0.42 (Medium). */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildCorrodedWatcher(){
  /* ---------- PALETTE (VS-desaturated dead-rust + gunmetal, ash register) ---------- */
  const P = {
    rust:0x8a5a3a, rustDk:0x5c3a24, rustLt:0xa5734a,
    plate:0x565349, plateDk:0x3a3830, plateLt:0x6c6858,
    lens:0x384038, lensDk:0x1f241f, lensGlint:0x8c9a86,
    wire:0x201d18, bolt:0x2b2822,
    disc:0x453f34, discTop:0x534c3d,
  };

  /* ---------- LANDMARKS — a squat tripod chassis under a boxy lens-head, held low ---------- */
  const spY = 0.32;
  const S = {
    footHub: V(0, 0.08, 0),
    coreLo:  V(0, spY-0.06, 0),
    coreHi:  V(0, spY+0.14, 0),
    neck:    V(0, spY+0.22, 0.02),
    headB:   V(0, spY+0.30, 0.02),
  };

  /* ---------- CORE — a stubby riveted cylinder body, the "chassis torso" ---------- */
  tube(S.footHub, S.coreLo, 0.16, 0.20, 8, P.plateDk, {phase:Math.PI/8, capA:{hex:P.plateDk, lift:0.02}});
  tube(S.coreLo,  S.coreHi, 0.20, 0.165, 8, P.plate,   {phase:Math.PI/8});
  tube(S.coreHi,  S.neck,   0.165, 0.09, 8, P.rustDk,  {phase:Math.PI/8});
  /* patch-weld rust streaks down one flank */
  for(const s of [-1,1]) quad(V(s*0.16,spY+0.10,0.02), V(s*0.19,spY+0.10,-0.02), V(s*0.15,spY-0.10,0.02), V(s*0.12,spY-0.10,0.06), P.rust, 0.08);
  /* rivet dots ringing the core */
  {
    const n=6, rowY=spY+0.02;
    for(let i=0;i<n;i++){
      const t=(i/n)*Math.PI*2;
      const x=Math.cos(t)*0.185, z=Math.sin(t)*0.185;
      quad(V(x-0.012,rowY,z-0.012), V(x+0.012,rowY,z-0.012), V(x+0.010,rowY+0.02,z+0.010), V(x-0.010,rowY+0.02,z+0.010), P.bolt, 0.05);
    }
  }

  /* ---------- HEAD — a boxy lens-housing, flat-fronted, riding atop the neck ---------- */
  {
    const hy = S.headB.y;
    const half = 0.155, dep = 0.145, hh = 0.135;
    const fbl=V(-half,hy-hh,dep), fbr=V(half,hy-hh,dep), ftl=V(-half,hy+hh,dep), ftr=V(half,hy+hh,dep);
    const bbl=V(-half,hy-hh,-dep), bbr=V(half,hy-hh,-dep), btl=V(-half,hy+hh,-dep), btr=V(half,hy+hh,-dep);
    quad(fbl,fbr,ftr,ftl, P.plateLt, 0.05);              // front face (lens housing front)
    quad(bbr,bbl,btl,btr, P.plateDk, 0.05);               // back
    quad(bbl,fbl,ftl,btl, P.plate, 0.05);                 // left
    quad(fbr,bbr,btr,ftr, P.plate, 0.05);                 // right
    quad(ftl,ftr,btr,btl, P.plateDk, 0.05);               // top
    quad(bbl,bbr,fbr,fbl, P.plateDk, 0.05);                // bottom

    /* LENS — a flat glass disc set in a dark socket ring, centered on the front face. Reads as a
       sensor-eye, not a face-quad: a socket ring + darker inner disc + a small glint chip. */
    {
      const c = V(0, hy+0.01, dep+0.001);
      const outer = ring(c, V(0,0,1), 0.085, 0.085, 10, Math.PI/10);
      const inner = ring(V(c.x,c.y,c.z+0.012), V(0,0,1), 0.058, 0.058, 10, Math.PI/10);
      stitch([outer, inner], ()=>P.lensDk);
      capFan(inner, V(c.x,c.y,c.z+0.02), P.lens);
      quad(V(c.x+0.01,c.y+0.02,c.z+0.021), V(c.x+0.03,c.y+0.02,c.z+0.021),
           V(c.x+0.02,c.y+0.005,c.z+0.021), V(c.x,c.y+0.005,c.z+0.021), P.lensGlint, 0.05);
    }
    /* small rear antenna wire */
    tube(V(0,hy+hh-0.01,-dep+0.01), V(0.05,hy+hh+0.22,-dep-0.02), 0.012, 0.004, 4, P.wire, {capB:{hex:P.wire}});
  }

  /* ---------- TRIPOD LEGS — three splayed pipe-legs bolted under the chassis, cobbled scavenge --- */
  {
    const legAngles = [90, 210, 330];
    for(const deg of legAngles){
      const t = deg*Math.PI/180;
      const hip = V(Math.cos(t)*0.10, 0.10, Math.sin(t)*0.10);
      const knee = V(Math.cos(t)*0.28, 0.05, Math.sin(t)*0.28);
      const foot = V(Math.cos(t)*0.36, 0.02, Math.sin(t)*0.36);
      tube(hip, knee, 0.052, 0.040, 6, P.rust, {capA:{hex:P.rustDk}});
      tube(knee, foot, 0.040, 0.030, 6, P.rustDk, {capB:{hex:P.plateDk, lift:0.01}});
      /* flat scavenged foot-plate */
      quad(V(foot.x-0.045,0.012,foot.z-0.03), V(foot.x+0.045,0.012,foot.z-0.03),
           V(foot.x+0.04,0.008,foot.z+0.04), V(foot.x-0.04,0.008,foot.z+0.04), P.plateDk, 0.04);
    }
  }

  /* ---------- base disc (Medium: r=0.42) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.045,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.048,0), P.discTop);
  }
}
