/* dev/model-qa/creatures/rlm-siege-tower-crew.js — Siege Tower Crew (theater, siege lens, Huge,
   CR 5). A rolling wooden siege tower crewed by fighters at its top: a tall timber tower on four
   heavy wheels, ladder-braced frame, a hide-covered battering ram head low at the front, and two
   crewmen visible at the parapet top (the dominant silhouette is the TOWER — crew read as small
   figures crewing it, not the other way around). Whole-object grammar: one merged frame, no
   anchors. VS-desaturated weathered timber + dull iron banding + drab crew cloth. NO eye quads.
   Huge disc r=0.68. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildSiegeTowerCrew(){
  const P = {
    wood:0x5a4632, woodDk:0x3a2c1e, woodLt:0x715a3e,
    iron:0x3e4042, ironDk:0x262828,
    hide:0x4a3c2c, hideDk:0x2e2418,
    cloth:0x54563e, clothDk:0x363826,
    skin:0x8f7a63, skinDk:0x655241,
    wheel:0x3e3020, wheelDk:0x241a10,
    disc:0x453d2e, discTop:0x554c37,
  };

  /* ---------- TOWER FRAME — four corner timber posts rising to a parapet top, ladder-braced. ---------- */
  const H = 1.55; // tower height
  const posts = [[-0.30,-0.24],[0.30,-0.24],[-0.30,0.24],[0.30,0.24]];
  for(const [x,z] of posts){
    tube(V(x,0.10,z), V(x,H,z), 0.048, 0.040, 6, P.wood, {capB:{hex:P.woodDk, lift:0.02}});
  }
  // horizontal cross-braces at several heights
  for(const y of [0.40,0.80,1.20]){
    quad(V(-0.30,y-0.02,-0.24), V(0.30,y-0.02,-0.24), V(0.30,y+0.02,-0.24), V(-0.30,y+0.02,-0.24), P.woodDk, 0.05);
    quad(V(-0.30,y-0.02,0.24), V(0.30,y-0.02,0.24), V(0.30,y+0.02,0.24), V(-0.30,y+0.02,0.24), P.woodDk, 0.05);
    quad(V(-0.30,y-0.02,-0.24), V(-0.30,y-0.02,0.24), V(-0.30,y+0.02,0.24), V(-0.30,y+0.02,-0.24), P.wood, 0.05);
    quad(V(0.30,y-0.02,-0.24), V(0.30,y-0.02,0.24), V(0.30,y+0.02,0.24), V(0.30,y+0.02,-0.24), P.wood, 0.05);
  }
  // diagonal ladder braces on the front face
  for(let i=0;i<3;i++){
    const y0=0.10+i*0.48, y1=y0+0.44;
    quad(V(-0.28,y0,0.245), V(-0.24,y0,0.245), V(0.26,y1,0.245), V(0.22,y1,0.245), P.woodLt, 0.06);
  }
  // iron banding reinforcing the base
  ring(V(0,0.30,0), V(0,1,0), 0.31, 0.25, 4, Math.PI/4).forEach((p,i,arr)=>{
    const p2=arr[(i+1)%arr.length];
    quad(p,p2,V(p2.x,p2.y+0.05,p2.z),V(p.x,p.y+0.05,p.z), P.iron, 0.05);
  });

  /* ---------- PARAPET TOP — a boxed fighting platform with two crewmen visible above the rail. ---------- */
  quad(V(-0.32,H,-0.26), V(0.32,H,-0.26), V(0.32,H,0.26), V(-0.32,H,0.26), P.woodDk, 0.05);
  for(const [x,z] of posts){
    quad(V(x-0.03,H,z), V(x+0.03,H,z), V(x+0.03,H+0.16,z), V(x-0.03,H+0.16,z), P.wood, 0.05);
  }
  // rail
  for(const z of [-0.26,0.26]) quad(V(-0.32,H+0.14,z), V(0.32,H+0.14,z), V(0.32,H+0.17,z), V(-0.32,H+0.17,z), P.woodDk, 0.05);

  /* crew figure helper — simplified torso+head, cloth uniform, hollow socket shading only */
  const crewFig=(cx,cz,facing)=>{
    const baseY=H+0.05;
    const n=7, ph=Math.PI/n;
    const bands=[{y:baseY,rx:0.075,hex:P.clothDk},{y:baseY+0.12,rx:0.080,hex:P.cloth},{y:baseY+0.22,rx:0.070,hex:P.cloth}];
    const rings=bands.map(b=>ring(V(cx,b.y,cz),V(0,1,0),b.rx,b.rx*0.85,n,ph));
    stitch(rings, b=>bands[b].hex);
    const hb=ring(V(cx,baseY+0.26,cz),V(0,1,0),0.052,0.050,n,ph);
    const ht=ring(V(cx,baseY+0.38,cz),V(0,1,0),0.042,0.040,n,ph);
    stitch([hb,ht], ()=>P.skin);
    capFan(ht, V(cx,baseY+0.41,cz), P.skinDk);
    const fz = facing>0?1:-1;
    quad(V(cx-0.036,baseY+0.29,cz+fz*0.04), V(cx-0.008,baseY+0.29,cz+fz*0.044),
         V(cx-0.012,baseY+0.32,cz+fz*0.038), V(cx-0.032,baseY+0.32,cz+fz*0.036), P.skinDk, 0.05);
  };
  crewFig(-0.14, 0.0, 1);
  crewFig(0.16, -0.06, 1);

  /* ---------- BATTERING RAM HEAD — hide-covered ram slung low at the front of the tower. ---------- */
  {
    const ra=V(0,0.36,0.26), rb=V(0,0.34,0.58);
    tube(ra,rb,0.075,0.062,8,P.hide,{capB:{hex:P.hideDk,lift:0.02}});
    // suspension chains from the frame
    tube(V(-0.10,0.70,0.24), V(-0.03,0.40,0.32), 0.014,0.010,4,P.iron);
    tube(V(0.10,0.70,0.24), V(0.03,0.40,0.32), 0.014,0.010,4,P.iron);
  }

  /* ---------- WHEELS — four heavy iron-rimmed wheels at the base. ---------- */
  {
    const wheel=(cx,cz)=>{
      const rim=ring(V(cx,0.16,cz), V(1,0,0), 0.16, 0.16, 10);
      capFan(rim, V(cx,0.16,cz), P.wheel, cx>0);
      for(let i=0;i<6;i++){
        const t=(i/6)*Math.PI*2;
        const ey=0.16+Math.sin(t)*0.13, ez=cz+Math.cos(t)*0.13;
        tube(V(cx,0.16,cz), V(cx,ey,ez), 0.016,0.010,4,P.wheelDk);
      }
    };
    wheel(-0.30,-0.24); wheel(0.30,-0.24); wheel(-0.30,0.24); wheel(0.30,0.24);
  }

  /* ---------- base disc (Huge: r=0.68) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.68, 0.68, 20);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.66, 0.66, 20);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
