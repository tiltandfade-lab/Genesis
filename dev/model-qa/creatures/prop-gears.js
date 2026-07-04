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
