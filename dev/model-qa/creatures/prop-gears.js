/* dev/model-qa/creatures/prop-gears.js — the MECHANICAL GEAR CLUSTER: a dungeon machinery SET PIECE
   (whole-object prop). Not a creature — no eyes, no grip. One function, one geometry frame, no
   anchors. Replaces the cuboid gear-cluster part with a bespoke read: a knot of interlocking BRONZE
   COG-WHEELS — real toothed disc-gears meshing on iron axles, one BROKEN-TOOTH gear, the whole thing
   FROZEN with rust/verdigris. Old winch/clockwork wreckage jammed in the dungeon floor. Sits on the
   shared base disc (r=0.42).
   Tells:
     - 3 TOOTHED gear-wheels of different sizes, meshing (teeth interlocking at the contact points),
       set at different angles/heights on a small iron frame + axles
     - the biggest gear stands upright; a mid gear meshes into it at an angle; a small gear lies
       half-flat — so the read is a CLUSTER of cogs, not one wheel
     - one gear has BROKEN TEETH (a couple of teeth snapped off, a jagged gap) — the "broken-tooth" tell
     - BRONZE with green verdigris + rust on the iron axles/frame (the "frozen/rusted" tell); a snapped
       chain drooping off one gear
   VS-desaturated: aged bronze (warm, desaturated) + verdigris green + dark rust-iron.
   Scale reference: figures ~1.5u; the big gear ~0.8u tall. A chunky mid-height cluster.
   Imported by prop-gears-probe.html. */
import { THREE, V, quad, tube, ring, stitch, capFan } from '../probe-lib.js';

export function buildGears(){
  /* ---------- PALETTE (VS desaturated aged bronze + verdigris + rust-iron) ---------- */
  const P = {
    bronze:0x8a6f3a, bronzeDk:0x63501f, bronzeDkr:0x453718, bronzeLt:0xa88a4a, // cog bodies
    verd:0x5f7a5a, verdDk:0x435742,                                            // verdigris green corrosion
    iron:0x484a4d, ironDk:0x2c2d2f, ironLt:0x64676b,                           // axles / frame
    rust:0x664529, rustDk:0x462f1c,
    disc:0x3a352b, discTop:0x46402f,
  };

  /* GEAR helper: a toothed disc gear centered at c, facing `axis`, hub radius rHub, tooth-tip radius
     rTip, N teeth. Built as: two face rings (front/back) forming the rim + a rim band, then N tooth
     tabs sticking out. `skipTeeth` = array of tooth indices to omit (broken-tooth read). A hub cap +
     an axle-hole dark center. Colors from `body`. Returns the mesh center so callers can attach. */
  function gear(cx,cy,cz, axis, rHub, rTip, N, body, opts){
    opts = opts || {};
    const skip = opts.skipTeeth || [];
    const depth = opts.depth != null ? opts.depth : 0.06;
    const ax = axis.clone().normalize();
    const half = ax.clone().multiplyScalar(depth/2);
    const cF = V(cx+half.x, cy+half.y, cz+half.z);        // front face center
    const cB = V(cx-half.x, cy-half.y, cz-half.z);        // back face center
    const n = 14;
    const rimF = ring(cF, ax, rHub, rHub, n, 0);
    const rimB = ring(cB, ax, rHub, rHub, n, 0);
    // rim band (the wheel edge)
    stitch([rimF, rimB], (b,i)=> (i%2? body.mid : body.dk));
    // front + back faces (fan to center) with a dark axle hole (small inner ring capped dark)
    capFan(rimF, cF, body.lt);
    capFan(rimB, cB, body.dk, true);
    // dark axle hole on the front
    const holeF = ring(cF, ax, rHub*0.22, rHub*0.22, 8, 0);
    capFan(holeF, V(cF.x-half.x*0.3, cF.y-half.y*0.3, cF.z-half.z*0.3), P.ironDk);
    // TEETH — N tabs around the rim, each a small box from rHub out to rTip
    // build a local basis (u,v) in the gear plane
    const up = Math.abs(ax.y)>0.93 ? V(0,0,1):V(0,1,0);
    const u = new THREE.Vector3().crossVectors(up,ax).normalize();
    const v = new THREE.Vector3().crossVectors(ax,u).normalize();
    for(let t=0;t<N;t++){
      if(skip.includes(t)){
        // jagged broken stub instead of a full tooth (the broken-tooth tell)
        const ang=(t/N)*Math.PI*2;
        const dir=u.clone().multiplyScalar(Math.cos(ang)).add(v.clone().multiplyScalar(Math.sin(ang)));
        const base=V(cx+dir.x*rHub, cy+dir.y*rHub, cz+dir.z*rHub);
        const stub=V(cx+dir.x*(rHub+ (t%2?0.02:0.04)), cy+dir.y*(rHub+0.03), cz+dir.z*(rHub+0.02));
        tube(base, stub, 0.02, 0.006, 4, body.dk, {capB:{hex:body.lt}});
        continue;
      }
      const ang=(t/N)*Math.PI*2;
      const dir=u.clone().multiplyScalar(Math.cos(ang)).add(v.clone().multiplyScalar(Math.sin(ang))).normalize();
      const side=new THREE.Vector3().crossVectors(ax,dir).normalize();
      const w=rTip*0.12;                    // tooth half-width
      // 4 base corners at rHub, 4 tip corners at rTip, offset ± along `half` for depth
      const bc=(sw,sd)=> V(cx + dir.x*rHub + side.x*sw*w + half.x*sd,
                            cy + dir.y*rHub + side.y*sw*w + half.y*sd,
                            cz + dir.z*rHub + side.z*sw*w + half.z*sd);
      const tc=(sw,sd)=> V(cx + dir.x*rTip + side.x*sw*w*0.7 + half.x*sd,
                            cy + dir.y*rTip + side.y*sw*w*0.7 + half.y*sd,
                            cz + dir.z*rTip + side.z*sw*w*0.7 + half.z*sd);
      const b0=bc(-1,1),b1=bc(1,1),b2=bc(1,-1),b3=bc(-1,-1);
      const t0=tc(-1,1),t1=tc(1,1),t2=tc(1,-1),t3=tc(-1,-1);
      quad(t0,t1,b1,b0, body.lt,0.05);      // front slope
      quad(b3,b2,t2,t3, body.dk,0.05);      // back slope
      quad(t1,t2,b2,b1, body.mid,0.05);     // right side
      quad(b0,b3,t3,t0, body.mid,0.05);     // left side
      quad(t0,t3,t2,t1, body.lt,0.05);      // tooth tip
    }
    return V(cx,cy,cz);
  }

  const BRONZE = {lt:P.bronzeLt, mid:P.bronze, dk:P.bronzeDk};

  /* small iron BASE FRAME the gears mount on (a low bracket + two axle posts) */
  {
    // a low iron bed plate
    const y=0.09;
    quad(V(-0.22,y,-0.16),V(0.22,y,-0.16),V(0.22,y,0.18),V(-0.22,y,0.18), P.ironDk, 0.05);
    // two short axle posts
    tube(V(-0.10,0.06,0.02),V(-0.10,0.30,0.02), 0.03,0.028,6, P.iron, {capB:{hex:P.ironLt}});
    tube(V(0.14,0.06,-0.06),V(0.14,0.22,-0.06), 0.028,0.026,6, P.iron, {capB:{hex:P.ironLt}});
  }

  /* ===== THE GEARS — 3 cogs meshing. Big upright gear (facing +z, the reader), mid gear meshing
     into it from the side at an angle, small gear lying half-flat. ===== */
  // BIG gear — upright, facing the camera (+z axis), on the left post
  gear(-0.10, 0.44, 0.02, V(0,0,1), 0.20, 0.255, 12, BRONZE, {depth:0.07});
  // MID gear — meshing into the big one from the right, tilted (axis leaning), one BROKEN tooth cluster
  gear(0.16, 0.34, -0.02, V(0.35,0,1), 0.135, 0.185, 10, BRONZE, {depth:0.06, skipTeeth:[2,3]});
  // SMALL gear — lying half-flat (axis mostly +y, tilted), low front
  gear(0.02, 0.20, 0.16, V(0.2,1,0.3), 0.09, 0.13, 8,
       {lt:P.bronzeLt, mid:P.bronze, dk:P.bronzeDkr}, {depth:0.05});

  /* verdigris + rust washes: green corrosion streaks on the big gear face, rust on the axles */
  quad(V(-0.18,0.50,0.06),V(-0.10,0.52,0.06),V(-0.06,0.40,0.06),V(-0.14,0.38,0.06), P.verd, 0.07);
  quad(V(-0.02,0.42,0.06),V(0.04,0.40,0.06),V(0.02,0.30,0.06),V(-0.04,0.32,0.06), P.verdDk, 0.06);
  quad(V(0.13,0.28,-0.04),V(0.16,0.28,-0.04),V(0.16,0.12,-0.04),V(0.13,0.12,-0.04), P.rust, 0.06);

  /* a snapped CHAIN drooping off the mid gear (clockwork wreckage read) */
  {
    const a=V(0.28,0.34,0.02), b=V(0.34,0.14,0.10), c=V(0.30,0.08,0.16);
    tube(a,b,0.018,0.018,4, P.iron); tube(b,c,0.016,0.014,4, P.ironDk);
    for(const m of [a.clone().lerp(b,0.5)]) tube(V(m.x-0.02,m.y,m.z),V(m.x+0.02,m.y,m.z),0.01,0.01,4,P.rustDk);
  }

  /* base disc — shared style (r=0.42). Stone tones. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}

/* dev/model-qa/creatures/prop-gears.js — buildPowerJunction — the POWER JUNCTION: a Chrome-realm
   SET PIECE (whole-object prop). Not a creature — no eyes, no grip. One function, whole-object,
   no anchors. B5 of PLACE-PARTS-WAVE Wave B (prop:power-junction, footprint 1x1 cell).
   Feature checklist (what the ~260-tri budget buys):
     - a boxy STEEL HOUSING (~1.15u tall) standing on the shared base disc — the humming body
     - a WARNING-STRIPE base band (alternating pale/dark diagonal-feel stripes) — the value zone +
       signature: this is what the eye reads first, "stand back / high voltage"
     - a smaller VENTED CAP on top (louvre slats) the housing sits under
     - a CABLE-TANGLE of 4 drooping tube cables sagging off the top edges, uneven lengths, so the
       silhouette breaks up top like snarled wiring, not a clean box
     - one DULL INDICATOR LAMP on the front face, a worn amber-grey nub — the use-tell: it still runs
   Use sentence: a squat industrial junction box droning behind its stripe, cables sagging off a
   vented lid, one tired lamp still lit — it still runs.
   VS-desaturated palette: dark steel body + one pale warning-stripe tone + a dull warm lamp accent.
   Scale reference: figures ~1.5u; the housing top sits ~1.15u — a chest-high humming block.
   Imported by prop-gears-probe.html. */
export function buildPowerJunction(){
  const P = {
    steel:0x5a5d60, steelDk:0x3d3f42, steelDkr:0x2a2c2e, steelLt:0x74777a,   // housing body
    warnPale:0x9c9370, warnDk:0x37342a,                                       // warning-stripe band (pale/dark)
    vent:0x46484a, ventDk:0x2e3032,                                           // vented cap slats
    cable:0x242424, cableDk:0x161616,                                        // drooping cables
    lamp:0x8c7a4e, lampDk:0x5a4e33,                                          // dull indicator lamp
    disc:0x3a352b, discTop:0x46402f,
  };

  /* axis-aligned box, 3-tone shading (top lit, front/back mid+lit, sides split) — closed solid. */
  function box(x0,x1, y0,y1, z0,z1, top, mid, dk){
    const A=V(x0,y0,z0), B=V(x1,y0,z0), Cc=V(x1,y0,z1), D=V(x0,y0,z1);
    const E=V(x0,y1,z0), F=V(x1,y1,z0), G=V(x1,y1,z1), H=V(x0,y1,z1);
    quad(H,G,F,E, top, 0.04);
    quad(D,Cc,B,A, dk, 0.04);
    quad(D,H,E,A, mid, 0.04);
    quad(B,F,G,Cc, mid, 0.04);
    quad(A,E,F,B, dk, 0.04);
    quad(Cc,G,H,D, top, 0.04);
  }

  /* ===== 1) WARNING-STRIPE BASE BAND — alternating pale/dark stripes low on the housing, the
     value zone + signature. Built as thin proud diagonal-feel bands on all 4 faces so it reads
     from any angle. ===== */
  const BX0=-0.30, BX1=0.30, BZ0=-0.26, BZ1=0.26;
  const BAND_Y0 = 0.055, BAND_Y1 = 0.30;
  box(BX0,BX1, BAND_Y0,BAND_Y1, BZ0,BZ1, P.warnPale, P.warnDk, P.steelDkr);
  {
    // proud diagonal stripe strokes on the front (+z) and left (-x) faces — pale over dark base
    const zf = BZ1 + 0.003, xl = BX0 - 0.003;
    for(let i=0;i<4;i++){
      const t0 = i/4, t1=(i+0.55)/4;
      const y0f = BAND_Y0 + t0*(BAND_Y1-BAND_Y0), y1f = BAND_Y0 + t1*(BAND_Y1-BAND_Y0);
      quad(V(BX0+0.02,y0f,zf), V(BX1-0.02,y0f+0.02,zf), V(BX1-0.02,y1f+0.02,zf), V(BX0+0.02,y1f,zf), P.warnPale, 0.03);
    }
    for(let i=0;i<4;i++){
      const t0=i/4, t1=(i+0.55)/4;
      const y0f=BAND_Y0+t0*(BAND_Y1-BAND_Y0), y1f=BAND_Y0+t1*(BAND_Y1-BAND_Y0);
      quad(V(xl,y0f,BZ0+0.02), V(xl,y1f,BZ0+0.02), V(xl,y1f+0.02,BZ1-0.02), V(xl,y0f+0.02,BZ1-0.02), P.warnPale, 0.03);
    }
  }

  /* ===== 2) MAIN HOUSING — the steel body rising above the stripe band to the housing top. ===== */
  const HOUS_Y1 = 1.02;
  box(BX0,BX1, BAND_Y1,HOUS_Y1, BZ0,BZ1, P.steelLt, P.steel, P.steelDkr);
  // a seam ledge where the stripe band meets the housing (proud, dark)
  quad(V(BX0-0.01,BAND_Y1,BZ1+0.01),V(BX1+0.01,BAND_Y1,BZ1+0.01),V(BX1+0.01,BAND_Y1+0.02,BZ1+0.01),V(BX0-0.01,BAND_Y1+0.02,BZ1+0.01), P.steelDk, 0.02);

  /* ===== 3) VENTED CAP — a smaller lidded box on top, with louvre slats (thin proud dark bands) —
     the mechanical hum reads through the vent. ===== */
  const CX0=-0.24, CX1=0.24, CZ0=-0.20, CZ1=0.20;
  const CAP_Y1 = HOUS_Y1 + 0.13;
  box(CX0,CX1, HOUS_Y1,CAP_Y1, CZ0,CZ1, P.vent, P.vent, P.ventDk);
  for(let i=0;i<4;i++){
    const y = HOUS_Y1 + 0.02 + i*0.025;
    quad(V(CX0+0.02,y,CZ1+0.002), V(CX1-0.02,y,CZ1+0.002), V(CX1-0.02,y+0.012,CZ1+0.002), V(CX0+0.02,y+0.012,CZ1+0.002), P.ventDk, 0.02);
  }

  /* ===== 4) CABLE-TANGLE — 4 drooping tube cables sagging off the cap's top edges/corners, uneven
     lengths so the silhouette breaks up (not a clean box). Each cable >=0.04u radius (min feature
     floor). Routed via mid-span control points to fake a droop with straight tube segments. ===== */
  {
    const top = CAP_Y1 - 0.01;
    const anchors = [
      {a:V(CX0+0.05, top, CZ0+0.04), mid:V(CX0-0.16, top-0.16, CZ0-0.05), end:V(CX0-0.10, BAND_Y1+0.06, CZ0+0.10)},
      {a:V(CX1-0.05, top, CZ0+0.03), mid:V(CX1+0.14, top-0.20, CZ0-0.02), end:V(CX1+0.06, BAND_Y1+0.10, CZ0+0.14)},
      {a:V(0.02, top, CZ1-0.03), mid:V(0.10, top-0.24, CZ1+0.14), end:V(0.14, BAND_Y1+0.04, CZ1+0.08)},
      {a:V(-0.10, top, CZ1-0.02), mid:V(-0.20, top-0.14, CZ1+0.10), end:V(-0.24, HOUS_Y1-0.10, CZ1+0.06)},
    ];
    for(const c of anchors){
      tube(c.a, c.mid, 0.045, 0.042, 5, P.cable, {capA:{hex:P.cableDk}});
      tube(c.mid, c.end, 0.042, 0.048, 5, P.cableDk, {capB:{hex:P.cableDk}});
    }
  }

  /* ===== 5) DULL INDICATOR LAMP — a worn amber-grey nub on the housing front face, mid-height —
     the use-tell (it still runs). Squat disc proud of the face + a dark bezel ring behind it. ===== */
  {
    const cx=0.16, cy=(BAND_Y1+HOUS_Y1)/2, cz=BZ1;
    const bez = ring(V(cx,cy,cz+0.004), V(0,0,1), 0.055, 0.055, 10);
    capFan(bez, V(cx,cy,cz+0.006), P.lampDk);
    const lampR = ring(V(cx,cy,cz+0.012), V(0,0,1), 0.036, 0.036, 10);
    capFan(lampR, V(cx,cy,cz+0.020), P.lamp);
  }

  /* base disc — shared style (r=0.42). */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
