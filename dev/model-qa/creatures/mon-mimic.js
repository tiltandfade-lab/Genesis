/* dev/model-qa/creatures/mon-mimic.js — the MIMIC: the treasure chest that BITES.
   REBUILD 2026-07-08 (MODEL-FOUNDRY pass 1) — pose law applied: this used to sit at attention
   (lid cracked ~40°, four flat stubby feet, square to the disc). Now it's caught mid-SNAP: the
   lid is thrown all the way open into a fanged maw, the whole chest is pitched forward off its
   base as if lunging, and two clawed pseudopod arms are planted out front like forelimbs mid-
   pounce — bent at an elbow, hands slapped down on the floor ahead of the disc. Two small
   vestigial nub-feet at the back stay half-lifted (the push-off leg read). Palette + the dual
   read (furniture from behind, horror from the front) are preserved from the original.

   FEATURE CHECKLIST (what the tri budget buys):
     1. Chest body — wood-plank walls, brass bands + corner brackets, iron lock plate (furniture
        tell, mostly seen from the back/sides).
     2. THE MAW — lid thrown open to ~108° (past vertical), near-black wet throat + gum ridge.
     3. Two fang rows (pale bone needles, upper hangs off the lid underside, lower rises off the
        body rim) — the loud signature, palest value in the model so it reads first.
     4. Wet pink-red tongue lolling out through the gap between the rows.
     5. TWO forward-planted clawed pseudopod arms (shoulder→elbow→wrist, 3-clawed hand) reaching
        past the chest onto the floor — the lunge itself.
     6. Small half-lifted back nub-feet (push-off read) + base disc.

   POSE SENTENCE: the chest has thrown its lid wide into a fanged maw and pitched forward off its
   disc, two clawed arms slapped down ahead of it like forelimbs mid-pounce, tongue lolling
   between the tooth rows — the snap, not the ambush-wait.

   Whole-object grammar: one function, one geometry frame, no anchors. Imported by
   mon-mimic-probe.html + the proof sheet. */
import { THREE, V, ring, stitch, capFan, quad, tube, blob } from '../probe-lib.js';

export function buildMimic(){
  /* ---------- PALETTE (VS desaturated wood + brass, then the WET shock inside) — unchanged ---------- */
  const P = {
    wood:0x6a4a2c, woodDk:0x4e371f, woodDkr:0x372615,     // oak chest planks — mid, shadow, deepest
    woodLt:0x835f39, plank:0x5c4126,                       // lit plank face; groove line
    brass:0xa8823c, brassDk:0x77592a, brassLt:0xc6a256,    // banding + corner brackets (tarnished)
    iron:0x4a453e, ironDk:0x2f2c27,                        // lock plate + nailheads
    gum:0x7c3b3e, gumDk:0x5a2a2d,                          // dark red gum-flesh lining the maw
    fang:0xd8cdb0, fangDk:0xa79c82,                        // pale bone needle fangs (the signature)
    tongue:0xb85668, tongueDk:0x8f3f50, tongueLt:0xd07a88, // wet pink-red tongue
    maw:0x1c0f10,                                          // near-black wet throat behind the teeth
    limb:0x8a6444, limbDk:0x6b4a30, claw:0xd8cdb0,          // pseudopod arms (LIGHTENED off wood so they hold value against the void — the wave-2 lesson) + pale claw tips
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — the box body + hinge, in a local pre-tilt frame ---------- */
  const L = {
    x:0.34,                    // chest half-width (x)
    zF:0.24, zB:-0.24,         // front / back face z (pre-tilt)
    baseY0:0.10, baseY1:0.52,  // base box bottom / top rim
    lidAng:108*Math.PI/180,    // THROWN WIDE — past vertical, the full snap (was 72°)
  };
  const bx=L.x, y0=L.baseY0, y1=L.baseY1, zf=L.zF, zb=L.zB;

  /* ---------- FORWARD PITCH — the whole body/lid/mouth assembly tilts forward off the disc,
     pivoting about the base-bottom center. Front-bottom edge dips (but stays >0), back-bottom
     edge lifts — the "lunging off its base" read. Everything body-attached is wrapped through
     T()/TV() so it tilts as one rigid piece; the disc and the new pseudopod arms are NOT tilted
     (the arms are independently posed reaching to the floor; the disc is the ground plane). ---- */
  const tiltA = 10*Math.PI/180;
  const piv = { y:y0, z:0 };
  const T = (v)=>{
    const dy=v.y-piv.y, dz=v.z-piv.z;
    return V(v.x, piv.y + dy*Math.cos(tiltA) - dz*Math.sin(tiltA),
                   piv.z + dy*Math.sin(tiltA) + dz*Math.cos(tiltA));
  };
  const TV = (x,y,z)=> T(V(x,y,z));
  const bc = (sx,y,sz)=> TV(sx*bx, y, sz>0?zf:zb);   // tilted box-corner helper

  /* ===== BASE BOX — the chest body (tilted). Explicit corner quads: 5 outer faces (top gapes). */
  {
    quad(bc(-1,y0,1), bc(1,y0,1), bc(1,y1,1), bc(-1,y1,1), P.wood, 0.05);      // FRONT (+z)
    quad(bc(1,y0,-1), bc(-1,y0,-1), bc(-1,y1,-1), bc(1,y1,-1), P.woodDk, 0.05); // BACK (furniture tell)
    quad(bc(-1,y0,-1), bc(-1,y0,1), bc(-1,y1,1), bc(-1,y1,-1), P.woodDk, 0.05); // LEFT
    quad(bc(1,y0,1), bc(1,y0,-1), bc(1,y1,-1), bc(1,y1,1), P.woodDk, 0.05);     // RIGHT
    quad(bc(-1,y0,-1), bc(1,y0,-1), bc(1,y0,1), bc(-1,y0,1), P.woodDkr, 0.03);  // BOTTOM

    /* plank grooves */
    for(const gy of [y0+0.14, y0+0.28]){
      quad(TV(-bx,gy-0.012,zf+0.002), TV(bx,gy-0.012,zf+0.002), TV(bx,gy+0.012,zf+0.002), TV(-bx,gy+0.012,zf+0.002), P.plank, 0.02);
      quad(TV(bx,gy-0.012,zb-0.002), TV(-bx,gy-0.012,zb-0.002), TV(-bx,gy+0.012,zb-0.002), TV(bx,gy+0.012,zb-0.002), P.woodDkr, 0.02);
    }

    /* brass bands (front + back straps) */
    for(const bxpos of [-0.16, 0.16]){
      quad(TV(bxpos-0.028,y0,zf+0.004), TV(bxpos+0.028,y0,zf+0.004),
           TV(bxpos+0.028,y1,zf+0.004), TV(bxpos-0.028,y1,zf+0.004), P.brass, 0.03);
      quad(TV(bxpos+0.028,y0,zb-0.004), TV(bxpos-0.028,y0,zb-0.004),
           TV(bxpos-0.028,y1,zb-0.004), TV(bxpos+0.028,y1,zb-0.004), P.brassDk, 0.03);
    }

    /* corner brackets */
    for(const sx of [-1,1]){
      quad(TV(sx*bx-sx*0.04,y0,zf+0.005), TV(sx*bx,y0,zf+0.005), TV(sx*bx,y1,zf+0.005), TV(sx*bx-sx*0.04,y1,zf+0.005), P.brassDk, 0.03);
      quad(TV(sx*bx+0.004,y0,zf), TV(sx*bx+0.004,y0,zf-0.05), TV(sx*bx+0.004,y1,zf-0.05), TV(sx*bx+0.004,y1,zf), P.brassDk, 0.03);
      quad(TV(sx*bx,y0,zb-0.005), TV(sx*bx-sx*0.04,y0,zb-0.005), TV(sx*bx-sx*0.04,y1,zb-0.005), TV(sx*bx,y1,zb-0.005), P.brassDk, 0.03);
    }

    /* lock plate + keyhole + nailheads */
    quad(TV(-0.075,y0+0.05,zf+0.006), TV(0.075,y0+0.05,zf+0.006),
         TV(0.075,y0+0.22,zf+0.006), TV(-0.075,y0+0.22,zf+0.006), P.iron, 0.02);
    quad(TV(-0.070,y0+0.055,zf+0.008), TV(0.070,y0+0.055,zf+0.008),
         TV(0.070,y0+0.215,zf+0.008), TV(-0.070,y0+0.215,zf+0.008), P.ironDk, 0.0);
    quad(TV(-0.012,y0+0.10,zf+0.010), TV(0.012,y0+0.10,zf+0.010),
         TV(0.010,y0+0.155,zf+0.010), TV(-0.010,y0+0.155,zf+0.010), 0x120d09, 0.0);
    quad(TV(-0.016,y0+0.145,zf+0.011), TV(0.016,y0+0.145,zf+0.011),
         TV(0.014,y0+0.175,zf+0.011), TV(-0.014,y0+0.175,zf+0.011), P.brassLt, 0.0);
    for(const nx of [-0.058,0.058]) for(const ny of [y0+0.065, y0+0.205]){
      quad(TV(nx-0.012,ny-0.012,zf+0.009), TV(nx+0.012,ny-0.012,zf+0.009),
           TV(nx+0.012,ny+0.012,zf+0.009), TV(nx-0.012,ny+0.012,zf+0.009), P.brassLt, 0.02);
    }
  }

  /* ===== THE MAW — the open top of the box is the lower jaw; inner walls are dark wet throat. == */
  {
    const rimY=y1, floorY=y0+0.12, inset=0.06;
    quad(bc(-1,rimY,1), bc(1,rimY,1), TV(bx,rimY-0.02,zf-0.02), TV(-bx,rimY-0.02,zf-0.02), P.brassDk, 0.03);
    const fL=-bx+inset, fR=bx-inset, fF=zf-inset, fB=zb+inset;
    quad(TV(-bx,rimY,zf), TV(bx,rimY,zf), TV(fR,floorY,fF), TV(fL,floorY,fF), P.maw, 0.02);
    quad(TV(bx,rimY,zb), TV(-bx,rimY,zb), TV(fL,floorY,fB), TV(fR,floorY,fB), P.woodDkr, 0.02);
    quad(TV(-bx,rimY,zb), TV(-bx,rimY,zf), TV(fL,floorY,fF), TV(fL,floorY,fB), P.maw, 0.02);
    quad(TV(bx,rimY,zf), TV(bx,rimY,zb), TV(fR,floorY,fB), TV(fR,floorY,fF), P.maw, 0.02);
    quad(TV(fL,floorY,fB), TV(fR,floorY,fB), TV(fR,floorY,fF), TV(fL,floorY,fF), P.gumDk, 0.02);
    quad(TV(-bx+0.03,rimY-0.01,zf-0.03), TV(bx-0.03,rimY-0.01,zf-0.03),
         TV(bx-0.05,rimY-0.06,zf-0.09), TV(-bx+0.05,rimY-0.06,zf-0.09), P.gum, 0.03);
  }

  /* ===== BOTTOM FANG ROW — pale needle fangs rising off the front rim, tilted with the body. == */
  {
    const gy=y1-0.02, gz=zf-0.05;
    const nF=7;
    for(let i=0;i<nF;i++){
      const t=(i/(nF-1))*2-1;
      const fx=t*(bx-0.06);
      const h=0.10 + Math.cos(t*1.3)*0.03;
      const tip=TV(fx*0.9, gy+h, gz-0.03);
      const w=0.026;
      const b0=TV(fx-w,gy,gz+0.012), b1=TV(fx+w,gy,gz+0.012), b2=TV(fx+w*0.7,gy,gz-0.028), b3=TV(fx-w*0.7,gy,gz-0.028);
      quad(b0,b1,tip,tip, P.fang, 0.04);
      quad(b1,b2,tip,tip, P.fangDk, 0.04);
      quad(b2,b3,tip,tip, P.fangDk, 0.05);
      quad(b3,b0,tip,tip, P.fang, 0.04);
    }
  }

  /* ===== THE LID — hinged at the back-top edge, thrown open to L.lidAng (108°, past vertical: a
     true wide-open snap, not a crack). Build the lid flat in a local frame, rotate about the
     hinge, THEN apply the body tilt T() on top so it swings with the rest of the assembly. ===== */
  const hingeY=y1, hingeZ=zb;
  const lidDepth=(zf-zb);
  const lidThick=0.06;
  const ang=L.lidAng;
  const rot=(y,z)=>{
    const dy=y-hingeY, dz=z-hingeZ;
    const ny=hingeY + dy*Math.cos(ang) + dz*Math.sin(ang);
    const nz=hingeZ - dy*Math.sin(ang) + dz*Math.cos(ang);
    return [ny,nz];
  };
  const lp=(sx, along, up)=>{
    const z0=hingeZ + along*lidDepth;
    const y0v=hingeY + up*lidThick;
    const [ny,nz]=rot(y0v,z0);
    return T(V(sx*bx, ny, nz));
  };
  {
    quad(lp(-1,0,1), lp(1,0,1), lp(1,1,1), lp(-1,1,1), P.woodLt, 0.05);   // lid top (furniture from behind)
    quad(lp(1,0,0), lp(-1,0,0), lp(-1,1,0), lp(1,1,0), P.gumDk, 0.03);   // lid underside (wet)
    quad(lp(-1,1,0), lp(-1,1,1), lp(1,1,1), lp(1,1,0), P.woodDk, 0.04);  // front edge
    quad(lp(1,0,0), lp(1,0,1), lp(-1,0,1), lp(-1,0,0), P.woodDkr, 0.03); // back edge (hinge)
    quad(lp(-1,0,0), lp(-1,0,1), lp(-1,1,1), lp(-1,1,0), P.woodDk, 0.04);
    quad(lp(1,1,0), lp(1,1,1), lp(1,0,1), lp(1,0,0), P.woodDk, 0.04);

    for(const bxpos of [-0.16,0.16]){
      const c00=lp((bxpos-0.028)/bx,0,1.02), c01=lp((bxpos+0.028)/bx,0,1.02);
      const c10=lp((bxpos-0.028)/bx,1,1.02), c11=lp((bxpos+0.028)/bx,1,1.02);
      quad(c00,c01,c11,c10, P.brass, 0.03);
    }
    { const c00=lp(-0.06/bx,0.86,1.04), c01=lp(0.06/bx,0.86,1.04), c10=lp(-0.06/bx,1.0,1.10), c11=lp(0.06/bx,1.0,1.10);
      quad(c00,c01,c11,c10, P.brassLt, 0.02); }

    /* TOP FANG ROW — hangs off the lid underside front edge (the mate to the bottom row). */
    const nT=7;
    for(let i=0;i<nT;i++){
      const t=(i/(nT-1))*2-1;
      const along=0.82;
      const rootC=lp(t*(bx-0.06)/bx, along, 0.0);
      const w=0.026;
      const b0=lp((t*(bx-0.06)-w)/bx, along-0.04, 0.0);
      const b1=lp((t*(bx-0.06)+w)/bx, along-0.04, 0.0);
      const b2=lp((t*(bx-0.06)+w*0.7)/bx, along+0.04, 0.0);
      const b3=lp((t*(bx-0.06)-w*0.7)/bx, along+0.04, 0.0);
      const h=0.10 + Math.cos(t*1.3)*0.03;
      const tip=V(rootC.x*0.92, rootC.y - h, rootC.z + 0.02);
      quad(b1,b0,tip,tip, P.fang, 0.04);
      quad(b2,b1,tip,tip, P.fangDk, 0.04);
      quad(b3,b2,tip,tip, P.fangDk, 0.05);
      quad(b0,b3,tip,tip, P.fang, 0.04);
    }
    { const g0=lp((-bx+0.03)/bx,0.78,0.02), g1=lp((bx-0.03)/bx,0.78,0.02),
            g2=lp((bx-0.05)/bx,0.9,0.02), g3=lp((-bx+0.05)/bx,0.9,0.02);
      quad(g0,g1,g2,g3, P.gum, 0.03); }
  }

  /* ===== THE TONGUE — roots deep in the tilted throat, climbs, crests in the gap between the two
     fang rows, lolls forward over the lip. Spine points run through T() so it tilts with the body. */
  {
    const spine=[
      TV(0.02, y0+0.15, zf-0.15),
      TV(0.01, y0+0.34, zf-0.10),
      TV(0.0,  y1+0.02, zf-0.06),
      TV(-0.005,y1+0.09, zf-0.03),
      TV(-0.01,y1+0.06, zf+0.06),
      TV(-0.02,y1-0.06, zf+0.16),
      TV(-0.03,y0+0.34, zf+0.19),
      TV(-0.02,y0+0.30, zf+0.17),
      TV(0.0,  y0+0.14, zf+0.12),
    ];
    const wid=[0.056,0.058,0.052,0.050,0.058,0.072,0.066,0.052,0.026];
    const th =[0.026,0.028,0.024,0.024,0.028,0.034,0.030,0.024,0.012];
    const rings=[];
    for(let i=0;i<spine.length;i++){
      const a=spine[Math.max(0,i-1)], b=spine[Math.min(spine.length-1,i+1)];
      const axis=new THREE.Vector3().subVectors(b,a).normalize();
      rings.push(ring(spine[i], axis, wid[i], th[i], 8, Math.PI/8));
    }
    stitch(rings, (bnd,i)=> P.tongue);
    capFan(rings.at(-1), spine.at(-1).clone().add(V(0,-0.02,0.01)), P.tongueDk);
    for(let i=0;i<spine.length-1;i++){
      const a=spine[i], b=spine[i+1];
      quad(a.clone().add(V(-0.012,0.02,0)), a.clone().add(V(0.012,0.02,0)),
           b.clone().add(V(0.012,0.02,0)), b.clone().add(V(-0.012,0.02,0)), P.tongueDk, 0.03);
    }
    const dab=(p,r)=>quad(p.clone().add(V(-r,0.03,-r)), p.clone().add(V(r,0.03,-r)),
                          p.clone().add(V(r,0.03,r)), p.clone().add(V(-r,0.03,r)), P.tongueLt, 0.02);
    dab(spine[3],0.026); dab(spine[4],0.024); dab(spine[6],0.018);
  }

  /* ===== TWO PSEUDOPOD ARMS — planted forward like forelimbs mid-pounce. Shoulder roots at the
     tilted front-bottom edge of the chest, elbow bends up+out, forearm reaches down to a clawed
     hand slapped flat on the floor ahead of the disc. NOT run through T() — posed independently,
     end-anchored to the ground (min.y respected explicitly). ===== */
  {
    const arm=(sx)=>{
      const S = TV(sx*(bx-0.05), y0+0.05, zf-0.02);          // shoulder — chest attachment
      const E = V(sx*(bx+0.16), 0.22, zf+0.10);               // elbow — flared WIDE past the box's own
                                                                // silhouette so both arms stay legible at
                                                                // any yaw (one arm hiding behind the box
                                                                // was the round-1 miss — pass-1 self-fix)
      const H = V(sx*(bx+0.10), 0.035, zf+0.36);              // wrist/hand — planted ahead on the floor
      tube(S,E, 0.062,0.048, 6, P.limb, {});                  // upper arm
      tube(E,H, 0.048,0.052, 6, P.limbDk, {});                // forearm
      // flattened knuckle pad
      quad(H.clone().add(V(-0.06,0.02,-0.06)), H.clone().add(V(0.06,0.02,-0.06)),
           H.clone().add(V(0.06,0.015,0.05)), H.clone().add(V(-0.06,0.015,0.05)), P.limb, 0.03);
      // 3 pale claws splayed forward off the hand (the loud value-contrast bit on the limb)
      for(const cx of [-0.045,0,0.045]){
        const base=H.clone().add(V(cx,0.02,0.05));
        const tip=H.clone().add(V(cx*1.3,-0.005,0.15));
        const w=0.018;
        const b0=base.clone().add(V(-w,0.012,0)), b1=base.clone().add(V(w,0.012,0));
        quad(b0,b1,tip,tip, P.claw, 0.04);
      }
    };
    arm(-1); arm(1);
  }

  /* ===== BACK NUB-FEET — small, half-lifted vestigial pseudopods under the back corners (the
     push-off leg read; the body has pitched forward off them mid-pounce). ===== */
  {
    const nub=(fx)=>{
      const c=TV(fx, y0-0.06, zb+0.04);
      const rings=blob(c.x, Math.max(c.y,0.03), c.z, 0.06, 0.05, 0.065, P.limb, 6, 3);
      rings.forEach((rg,k)=>{ if(k<=1) rg.forEach(p=>{ if(p.y<0.02) p.y=0.012; }); });
    };
    nub(-bx+0.08); nub(bx-0.08);
  }

  /* base disc — Large piece (r=0.44). Ground plane; arms plant past its front edge. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.44, 0.44, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.42, 0.42, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
