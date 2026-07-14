/* dev/model-qa/creatures/prop-cart.js — the CART: a two-wheeled wooden hand-cart, tipped back onto
   its rest posts, pull-poles angled to the ground, a cargo mound on the bed. Whole-object grammar:
   one function, one geometry frame, no anchors. Set piece — a roadside/market obstacle and half-cover.
     • plank BED with visible side rails, tilted back (front end up)
     • two SPOKED wheels (outer ring + hub + 5 spoke tubes each), one per side
     • two PULL-POLES angled forward-down to the ground (the shafts a beast/person would pull)
     • two REST POSTS under the front, holding the tilt
     • a HAY / cargo mound (quad-pile) heaped on the bed
   VS-desaturated wood + dry-hay straw. Imported by prop-cart-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildCart(){
  /* ---------- PALETTE (VS desaturated cart wood + iron rim + dry hay) ---------- */
  const P = {
    wood:0x6a4a2c, woodDk:0x4e371f, woodDkr:0x372615, woodLt:0x835f39, plank:0x5c4126,
    rail:0x7a5735, railDk:0x543a20,
    wheel:0x5c4227, wheelDk:0x3c2b19, rim:0x413c34, rimDk:0x2b2823, hub:0x6f5030,
    hay:0x8a7c4a, hayDk:0x60562f, hayLt:0xa1915a,
    disc:0x3a352b, discTop:0x46402f,
  };

  /* ---------- LANDMARKS — the bed is a slab tilted about its REAR axle, front lifted. Author the bed
     corners in a tilted frame; wheels sit at the rear axle; poles + rest-posts reach the front. ----
     Convention: +z = FRONT (toward camera / where poles go), −z = REAR (axle + wheels). */
  const L = {
    bedHalfW:0.30,               // bed half-width (x) — wheels just outside this
    zRear:-0.28, zFront:0.30,    // bed rear/front z
    axleY:0.30,                  // rear axle height (wheel center) — the pivot
    bedRearY:0.40,               // bed sits above the axle at the rear
    bedFrontY:0.60,              // front lifted higher (the tilt)
    bedThick:0.05,
    wheelR:0.28, wheelHalfW:0.05,
  };

  /* ===== WHEELS — two spoked wheels at the rear axle, one each side (x = ±(bedHalfW+gap)). Each:
     an outer iron RIM (2-ring band around the tread), a wood felloe ring just inside, a HUB, and 5
     spoke tubes from hub to rim. Built in the x-normal plane (wheels roll in z). ===== */
  const wheel=(wx)=>{
    const cx=wx, cy=L.axleY, cz=L.zRear;
    const R=L.wheelR, hw=L.wheelHalfW, n=14;
    // TREAD band — a clean thin iron rim: outer ring near+far, plus a slightly-inset ring so the
    // band has a rounded tread edge (no doubled dark felloe blob). Wood-brown, not near-black.
    const near=[], far=[], nearI=[], farI=[];
    for(let i=0;i<n;i++){ const t=Math.PI/n + (i/n)*Math.PI*2, ct=Math.cos(t), st=Math.sin(t);
      near .push(V(cx-hw,      cy+st*R,       cz+ct*R));
      far  .push(V(cx+hw,      cy+st*R,       cz+ct*R));
      nearI.push(V(cx-hw*0.55, cy+st*R*0.90,  cz+ct*R*0.90));
      farI .push(V(cx+hw*0.55, cy+st*R*0.90,  cz+ct*R*0.90));
    }
    stitch([near,far], ()=>P.wheel);            // outer tread surface (wood-brown, reads as a tire not a gash)
    stitch([near,nearI], ()=>P.wheelDk);        // near face bevel in to felloe line
    stitch([farI,far], ()=>P.wheelDk);          // far face bevel
    // felloe FACE fills (near + far) — flat wood discs so the wheel reads as a solid disc, not a hole
    const hubN=V(cx-hw*0.55, cy, cz), hubF=V(cx+hw*0.55, cy, cz);
    capFan(nearI, hubN, P.wheelDk, true);
    capFan(farI,  hubF, P.wheelDk);
    // felloe disc faces (fill between felloe line and hub so it's not a hole) — near + far
    // HUB — a short fat tube along x through the center
    tube(V(cx-hw*1.5,cy,cz), V(cx+hw*1.5,cy,cz), 0.05,0.05, 8, P.hub, {capA:{hex:P.hub},capB:{hex:P.hub}});
    // 6 SPOKES on the near face — thin tubes hub→felloe
    const ns=6;
    for(let s=0;s<ns;s++){ const t=Math.PI/6 + (s/ns)*Math.PI*2, ct=Math.cos(t), st=Math.sin(t);
      const rimPt=V(cx-hw*0.55, cy+st*R*0.88, cz+ct*R*0.88);
      const hubPt=V(cx-hw*0.55, cy+st*0.05,   cz+ct*0.05);
      tube(hubPt, rimPt, 0.016,0.013, 4, P.wheel);
    }
  };
  wheel(-(L.bedHalfW+L.wheelHalfW+0.03));
  wheel( (L.bedHalfW+L.wheelHalfW+0.03));

  /* ===== BED — a tilted plank slab: 8 corners, front lifted. Top planks + underside + 4 rims.
     Then a raised side-RAIL along each long edge (the cart walls) + a low rail across the rear. ==== */
  const bw=L.bedHalfW;
  // corner: (sx=±1 width, end 'F'|'R', 'top'|'bot')
  const bedY=(end)=> end==='F'? L.bedFrontY : L.bedRearY;
  const bedZ=(end)=> end==='F'? L.zFront : L.zRear;
  const bp=(sx,end,lvl)=> V(sx*bw, bedY(end) + (lvl==='top'? 0 : -L.bedThick), bedZ(end));
  {
    // TOP surface (planks) — front-lifted
    quad(bp(-1,'R','top'), bp(1,'R','top'), bp(1,'F','top'), bp(-1,'F','top'), P.woodLt, 0.05);
    // UNDERSIDE
    quad(bp(1,'R','bot'), bp(-1,'R','bot'), bp(-1,'F','bot'), bp(1,'F','bot'), P.woodDkr, 0.03);
    // FRONT rim (the high lip)
    quad(bp(-1,'F','bot'), bp(1,'F','bot'), bp(1,'F','top'), bp(-1,'F','top'), P.wood, 0.04);
    // REAR rim
    quad(bp(1,'R','bot'), bp(-1,'R','bot'), bp(-1,'R','top'), bp(1,'R','top'), P.woodDk, 0.04);
    // LEFT + RIGHT rims
    quad(bp(-1,'R','bot'), bp(-1,'F','bot'), bp(-1,'F','top'), bp(-1,'R','top'), P.woodDk, 0.04);
    quad(bp(1,'F','bot'), bp(1,'R','bot'), bp(1,'R','top'), bp(1,'F','top'), P.woodDk, 0.04);

    /* plank seams — 2 lengthwise darker lines across the top (plank read) */
    for(const px of [-0.10, 0.10]){
      const a0=V(px-0.012, bedY('R'), bedZ('R')), a1=V(px+0.012, bedY('R'), bedZ('R'));
      const b0=V(px-0.012, bedY('F'), bedZ('F')), b1=V(px+0.012, bedY('F'), bedZ('F'));
      quad(a0.clone().add(V(0,0.003,0)), a1.clone().add(V(0,0.003,0)), b1.clone().add(V(0,0.003,0)), b0.clone().add(V(0,0.003,0)), P.plank, 0.02);
    }

    /* SIDE RAILS — a raised plank wall along each long edge (top of the cart sides). A thin tall
       slab standing above the bed on each side. */
    for(const sx of [-1,1]){
      const rH=0.14;
      const rTopR=V(sx*bw, bedY('R')+rH, bedZ('R')), rTopF=V(sx*bw, bedY('F')+rH, bedZ('F'));
      const rBotR=bp(sx,'R','top'), rBotF=bp(sx,'F','top');
      // outer face
      quad(rBotR, rBotF, rTopF, rTopR, sx<0?P.rail:P.railDk, 0.04);
      // top edge
      quad(rTopR, rTopF, V(sx*bw-sx*0.03, bedY('F')+rH, bedZ('F')), V(sx*bw-sx*0.03, bedY('R')+rH, bedZ('R')), P.rail, 0.03);
    }
    /* REAR low rail across the back */
    { const rH=0.10;
      quad(V(-bw,bedY('R'),bedZ('R')), V(bw,bedY('R'),bedZ('R')),
           V(bw,bedY('R')+rH,bedZ('R')), V(-bw,bedY('R')+rH,bedZ('R')), P.railDk, 0.03); }
  }

  /* ===== PULL-POLES — two shafts from the FRONT-underside of the bed, angled forward + DOWN to the
     ground (where a draft animal/person pulls). Long tapering tubes reaching to ~y=0.05 out front. */
  {
    for(const sx of [-1,1]){
      const root=V(sx*(bw-0.05), L.bedFrontY-0.04, L.zFront-0.02);
      const tip =V(sx*(bw-0.10), 0.06, L.zFront+0.52);           // out front, near the ground
      tube(root, tip, 0.030, 0.020, 6, P.wood, {capB:{hex:P.woodLt, lift:0.02}});
    }
    // a cross-bar (whippletree) joining the pole tips
    tube(V(-(bw-0.10),0.06,L.zFront+0.52), V((bw-0.10),0.06,L.zFront+0.52), 0.022,0.022, 6, P.woodDk, {capA:{hex:P.woodDk},capB:{hex:P.woodDk}});
  }

  /* ===== REST POSTS — two short legs under the FRONT, propping the tilt (why it doesn't roll away).
     Stubby vertical tubes from the front-underside down to the disc. ===== */
  {
    for(const sx of [-1,1]){
      const top=V(sx*(bw-0.06), L.bedFrontY-0.05, L.zFront-0.06);
      const foot=V(sx*(bw-0.06), 0.04, L.zFront-0.10);
      tube(top, foot, 0.032, 0.030, 6, P.woodDk, {capB:{hex:P.woodDkr, lift:0.01}});
    }
  }

  /* ===== HAY MOUND — a heaped straw pile on the bed, a quad-pile blob straddling the bed top, dry
     desaturated hay with lit straw dabs. Sits between the side rails, mounded above them. ===== */
  {
    const mx=0.0, mz=(L.zRear+L.zFront)/2 - 0.02, my=(bedY('R')+bedY('F'))/2 + 0.09;
    // FLATTER + smaller mound (ry small so it heaps low, not a boulder)
    const mound=blob(mx, my, mz, 0.245, 0.115, 0.205, P.hay, 9, 5);
    // rough it up HARD — irregular straw lumps in every direction (kills the smooth-ball read)
    mound.forEach((rg,k)=>{ rg.forEach((p,i)=>{
      const jx=((i*7+k*13)%5-2)*0.012, jy=((i*3+k*5)%4)*0.014, jz=((i*11+k*3)%5-2)*0.012;
      p.x+=jx; if(k>=1&&k<=4) p.y+=jy; p.z+=jz;
    }); });
    // hay-tone shading: darken the lower rings a touch (already P.hay); add lit straw streaks on top
    for(const [sx,sz] of [[-0.10,0.04],[0.08,-0.06],[0.0,0.10],[0.14,0.06]]){
      quad(V(mx+sx-0.03, my+0.14, mz+sz-0.04), V(mx+sx+0.03, my+0.14, mz+sz-0.04),
           V(mx+sx+0.02, my+0.20, mz+sz+0.03), V(mx+sx-0.02, my+0.20, mz+sz+0.03), P.hayLt, 0.05);
    }
    // straggly straw hanging over the rear rail
    for(const sx of [-0.14,0.0,0.12]){
      quad(V(mx+sx-0.03, bedY('R')+0.02, L.zRear+0.01), V(mx+sx+0.03, bedY('R')+0.02, L.zRear+0.01),
           V(mx+sx+0.02, bedY('R')+0.14, L.zRear-0.05), V(mx+sx-0.02, bedY('R')+0.14, L.zRear-0.05), P.hayDk, 0.05);
    }
  }

  /* base disc — Large piece (r=0.42). Wheels + rest-posts + pole-tips all touch down on it. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
