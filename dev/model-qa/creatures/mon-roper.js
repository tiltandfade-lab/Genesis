/* dev/model-qa/creatures/mon-roper.js — the ROPER (bespoke STALAGMITE-CREATURE, Large aberration).
   The bestiary roper masquerades as a cave stalagmite until it strikes with grasping tendrils. The
   read: a tall rough ROCKY COLUMN (cave-pillar silhouette, craggy/mottled grey-brown stone) with a
   vertical MAW SLIT near the top, a dark eye-recess pit, and several long thin TENDRILS reaching out
   from around the upper column (no limbs, no face — this is a monster pretending to be terrain).
   Whole-object grammar: one function, one merged geometry frame, no anchors. VS-desaturated stone
   palette, mottled/craggy — never candy. NO eye quads (a dark socket recess only). Rear/rise stays
   in +y over the base disc footprint (r=0.55) rather than sprawling past it.
   Imported by mon-roper-probe.html + the proof sheet. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildRoper(){
  /* ---------- PALETTE (VS desaturated; mottled grey-brown cave stone) ---------- */
  const P = {
    stone:0x6b6357, stoneDk:0x4a453b, stoneLt:0x827a6a,       // craggy rock body
    mottleA:0x5c5648, mottleB:0x76705f,                        // dorsal mottle patches
    crag:0x3c3830,                                             // deep crevice shadow
    maw:0x1c1a16, mawDk:0x100f0c,                              // dark vertical maw slit
    tooth:0x8f8779,                                            // pale stubby teeth ringing the maw
    socket:0x18160f,                                           // dark eye-recess (no eye quad — a pit)
    tendril:0x565040, tendrilDk:0x3a352a, tendrilTip:0x2a271f, // grasping tendrils, darkening to tip
    disc:0x453f34, discTop:0x524c3f,
  };

  /* ---------- LANDMARKS — the column spine runs straight up (+y), craggy taper top to bottom. ---------- */
  const S = {
    base:  V(0, 0.06,  0.00),
    low:   V(0, 0.34,  0.01),
    mid:   V(0, 0.74, -0.01),
    upMid: V(0, 1.10,  0.02),
    neck:  V(0, 1.42, -0.01),
    crown: V(0, 1.62,  0.01),
  };

  /* ---------- BODY — the rocky column, one vertical loft, mottled + craggy shading per band. ---------- */
  tube(S.base,  S.low,   0.34, 0.315, 9, P.stone,   {phase:Math.PI/9, capA:{hex:P.stoneDk, lift:0.02}});
  tube(S.low,   S.mid,   0.315,0.275, 9, P.mottleA, {phase:Math.PI/9});
  tube(S.mid,   S.upMid, 0.275,0.225, 9, P.stone,   {phase:Math.PI/9});
  tube(S.upMid, S.neck,  0.225,0.175, 9, P.mottleB, {phase:Math.PI/9});
  tube(S.neck,  S.crown, 0.175,0.130, 9, P.stoneDk, {phase:Math.PI/9, capB:{hex:P.stoneDk, lift:0.015}});

  /* CRAGGY CREVICES — a scatter of dark diagonal crack quads down the flanks, the stalagmite read. */
  {
    const cracks = [
      [0.14,0.20,-0.02, 0.10,0.56, 0.02],
      [-0.16,0.30, 0.05,-0.09,0.70,-0.01],
      [0.19,0.62,-0.10, 0.13,1.02,-0.06],
      [-0.13,0.90, 0.08,-0.06,1.28, 0.04],
      [0.11,1.16,-0.05, 0.06,1.44,-0.02],
    ];
    for(const [x0,y0,z0,x1,y1,z1] of cracks){
      const a=V(x0,y0,z0), b=V(x1,y1,z1);
      const w=0.03;
      quad(V(a.x-w,a.y,a.z), V(a.x+w,a.y,a.z), V(b.x+w*0.5,b.y,b.z), V(b.x-w*0.5,b.y,b.z), P.crag, 0.06);
    }
  }

  /* ---------- MAW — a vertical slit near the top of the column, ringed with pale stubby teeth. ---------- */
  {
    const mc = V(0, 1.30, 0.20);   // maw center, on the +z face near the top
    const h=0.30, w=0.075;
    const t0=V(mc.x, mc.y-h, mc.z-0.02), t1=V(mc.x, mc.y+h, mc.z-0.02);
    quad(V(t0.x-w,t0.y,t0.z), V(t0.x+w,t0.y,t0.z), V(t1.x+w*0.6,t1.y,t1.z), V(t1.x-w*0.6,t1.y,t1.z), P.mawDk, 0.04);
    quad(V(t0.x-w*0.55,t0.y,t0.z+0.03), V(t0.x+w*0.55,t0.y,t0.z+0.03),
         V(t1.x+w*0.35,t1.y,t1.z+0.03), V(t1.x-w*0.35,t1.y,t1.z+0.03), P.maw, 0.05);
    // stubby teeth — small pale tetra-nubs along both edges of the slit
    const nT=6;
    for(let i=0;i<nT;i++){
      const f = i/(nT-1);
      const y = t0.y + (t1.y-t0.y)*f;
      const ww = w*(1-Math.abs(f-0.5)*0.6);
      for(const s of [-1,1]){
        const rb = V(mc.x + s*ww, y-0.03, mc.z+0.01);
        const rt = V(mc.x + s*ww*0.4, y+0.03, mc.z+0.045);
        tube(rb, rt, 0.018, 0.004, 4, P.tooth, {capB:{hex:P.tooth, lift:0.003}});
      }
    }
  }

  /* ---------- EYE RECESS — a single dark socket pit above the maw, shape not paint (no eye quad). ---------- */
  {
    const ec = V(0.09, 1.50, 0.15);
    const rim = ring(ec, V(0,0,1), 0.055, 0.055, 8, Math.PI/8);
    const back = ring(V(ec.x, ec.y, ec.z-0.05), V(0,0,1), 0.028, 0.028, 8, Math.PI/8);
    stitch([rim, back], ()=>P.socket);
    capFan(back, V(ec.x, ec.y, ec.z-0.07), P.socket);
  }

  /* ---------- TENDRILS — several long thin grasping limbs reaching out from the upper column,
     rooted around the neck/crown, curling outward+forward like feelers hunting for prey. ---------- */
  {
    const roots = [
      {root:V( 0.16,1.16, 0.10), dir:V( 1.0, 0.15, 0.35), len:1.05},
      {root:V(-0.16,1.10, 0.06), dir:V(-1.0, 0.10, 0.25), len:1.00},
      {root:V( 0.10,1.34,-0.14), dir:V( 0.55,0.30,-1.0),  len:0.95},
      {root:V(-0.10,1.30,-0.16), dir:V(-0.55,0.25,-1.0),  len:0.90},
      {root:V( 0.02,1.50, 0.06), dir:V( 0.20,0.55, 0.55), len:0.85},
    ];
    for(const {root, dir, len} of roots){
      const d = new THREE.Vector3(dir.x, dir.y, dir.z).normalize();
      const p0 = root;
      const p1 = V(p0.x + d.x*len*0.42, p0.y + d.y*len*0.42 + len*0.10, p0.z + d.z*len*0.42);
      const p2 = V(p0.x + d.x*len*0.78, p0.y + d.y*len*0.78 - len*0.02, p0.z + d.z*len*0.78);
      const p3 = V(p0.x + d.x*len*1.00, p0.y + d.y*len*1.00 - len*0.10, p0.z + d.z*len*1.00);
      tube(p0, p1, 0.052, 0.036, 6, P.tendril,    {capA:{hex:P.stoneDk}});
      tube(p1, p2, 0.036, 0.020, 6, P.tendrilDk);
      tube(p2, p3, 0.020, 0.006, 6, P.tendrilTip, {capB:{hex:P.tendrilTip, lift:0.004}});
    }
  }

  /* ---------- base disc (Large: r=0.55) ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.55, 0.55, 18);
    const r2=ring(V(0,0.050,0), V(0,1,0), 0.53, 0.53, 18);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.053,0), P.discTop);
  }
}
