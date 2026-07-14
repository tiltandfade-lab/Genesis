/* dev/model-qa/creatures/prop-web.js — the CORNER WEB: giant-spider territory. Whole-object grammar:
   one function, one geometry frame, no anchors. A vertical set piece implying a wall corner draped
   in a stretched funnel web, with a wrapped victim cocoon hanging in it.
     • two thin dark ANCHOR POSTS (~1.6u) implying the two edges of a wall corner
     • a stretched FUNNEL WEB spun between them — pale grey strand tubes: radial spokes fanning from a
       deep back corner, crossed by 2-3 concentric connecting rings that SAG under their own weight
     • one wrapped COCOON bundle (~0.5u pale mummy-wrap blob) hanging LOW in the web
   VS-desaturated: near-black posts, ghost-pale silk. Reads at board distance as a web, not sticks.
   Imported by prop-web-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildWebMass(){
  /* ---------- PALETTE (VS desaturated — dark timber posts, ghost silk, dead-pale wrap) ---------- */
  const P = {
    post:0x2a2620, postDk:0x1c1915, postLt:0x3a352b,
    silk:0xb9b7ad, silkDk:0x8b897f, silkHi:0xd2d0c6,   // pale grey strand (lit / shadowed / bright)
    wrap:0xc3bda8, wrapDk:0x928c78, wrapLt:0xd8d2bc,    // dead pale cocoon mummy-wrap
    bind:0x7a745f,                                       // the tighter silk binding rings on the cocoon
    disc:0x2f2b24, discTop:0x3a352b,                     // darker disc — lair floor
  };

  /* ---------- LANDMARKS — the corner is at back (−x,−z). Two posts rise there forming the corner:
     one running along −x (left wall edge), one along −z (right wall edge). The web fills the gap
     between them, its apex deep in the corner, sagging toward the open front. ---------- */
  const L = {
    // A WALL CORNER: two NEAR-VERTICAL posts standing at the two back edges of the corner. They do
    // NOT meet at the top (that read as an A-frame). Left post runs along the −x wall; right post
    // along the −z wall; both plant deep at back and rise straight. The web fills the open corner.
    leftX:-0.30, leftZ:-0.30,        // left post — back-left, the −z-wall edge
    rightX:-0.30, rightZ:0.24,       // right post — the −x-wall edge, forward along z
    postTop:1.60,                    // ~1.6u tall posts
    apex:V(-0.28,1.30,-0.28),        // web apex — high in the deep corner (behind, up)
  };

  /* ===== ANCHOR POSTS — two dark near-vertical timbers standing at the two back wall-edges of the
     corner. Straight up (a tiny outward lean), NOT converging — so they read as the two edges of a
     room corner, the web strung across the gap between them and the deep corner behind. ===== */
  {
    // LEFT post (the deep back-left corner edge) — straight up
    tube(V(L.leftX, 0.05, L.leftZ), V(L.leftX-0.03, L.postTop, L.leftZ-0.03),
         0.055, 0.040, 6, P.post, {capB:{hex:P.postLt, lift:0.02}, capA:{hex:P.postDk}});
    // RIGHT post (the wall edge running toward the camera) — straight up
    tube(V(L.rightX, 0.05, L.rightZ), V(L.rightX-0.03, L.postTop, L.rightZ+0.03),
         0.055, 0.040, 6, P.post, {capB:{hex:P.postLt, lift:0.02}, capA:{hex:P.postDk}});
    // a faint dark corner-shadow wall hint between them (a tall thin recessed quad deep at back)
    quad(V(L.leftX-0.02,0.05,L.leftZ), V(L.rightX-0.02,0.05,L.rightZ),
         V(L.rightX-0.05,L.postTop,L.rightZ), V(L.leftX-0.05,L.postTop,L.leftZ), P.postDk, 0.03);
  }

  /* ===== THE FUNNEL WEB — the money read. A fan of pale strand tubes from the deep corner APEX out
     to a spread of rim points across the open mouth of the corner, crossed by concentric rings that
     SAG (dip in y) between neighbouring spokes. Thin tubes so they read as silk lines, not beams. ===
     Rim points: an arc sweeping from high on the left post, across the open front, to high on the
     right post — the outer edge of the funnel. */
  const apex=L.apex;
  const RIM=[];
  {
    // 7 rim anchor points fanning around the funnel mouth (left-post-high → front-mid → right-post-high),
    // dropping lower toward the center-front (the funnel opens downward + outward).
    const specs=[
      V(-0.30, 1.48, -0.30),   // high on the LEFT (deep) post
      V(-0.30, 1.05, -0.30),   // left post, lower
      V( 0.06, 0.86, -0.10),   // spanning OUT into the room, low
      V( 0.20, 0.70,  0.00),   // front-center, reaching farthest into the room (funnel mouth bottom)
      V( 0.08, 0.86,  0.18),   // toward the right post, out into the room
      V(-0.30, 1.05,  0.24),   // right post, lower
      V(-0.30, 1.48,  0.24),   // high on the RIGHT (forward) post
    ];
    specs.forEach(p=>RIM.push(p));
  }
  const nS=RIM.length;

  // RADIAL SPOKES — apex → each rim point. Thin pale tubes.
  for(let i=0;i<nS;i++){
    tube(apex, RIM[i], 0.010, 0.007, 4, i%2? P.silk : P.silkDk);
  }

  // CONNECTING RINGS — 3 concentric loops at t = 0.42 / 0.68 / 0.92 along each spoke, joining
  // neighbour to neighbour. Each segment SAGS: pull its midpoint down in y (catenary droop).
  const ringT=[0.42, 0.68, 0.92];
  for(let r=0;r<ringT.length;r++){
    const t=ringT[r];
    const sag=0.05 + r*0.055;                 // outer rings sag more
    for(let i=0;i<nS-1;i++){                    // open funnel — don't close last→first
      const a=apex.clone().lerp(RIM[i],   t);
      const b=apex.clone().lerp(RIM[i+1], t);
      const mid=a.clone().lerp(b,0.5); mid.y -= sag;   // droop the midpoint
      // two short tubes a→mid→b make a visibly sagging strand
      tube(a, mid, 0.008, 0.008, 4, P.silkHi);
      tube(mid, b, 0.008, 0.008, 4, P.silkHi);
    }
  }

  // a few loose GOSSAMER strands trailing from the outer rim down toward the disc (tattered edge)
  for(const i of [1,3,5]){
    const from=RIM[i];
    const to=V(from.x*0.7, 0.08, from.z*0.7 + 0.05);
    const mid=from.clone().lerp(to,0.5); mid.x += 0.03; mid.y -= 0.04;
    tube(from, mid, 0.006, 0.005, 4, P.silkDk);
    tube(mid, to, 0.005, 0.004, 4, P.silkDk);
  }

  /* ===== THE COCOON — a wrapped bundle hanging LOW in the web, slung from two spokes. A pale
     mummy-wrap blob, tapered at both ends (a spindle), with darker binding rings cinching it, and
     two suspension strands up to the web. Hangs around the front-center-low of the funnel. ===== */
  {
    const cx=0.10, cy=0.46, cz=0.02;                     // low, hanging in the funnel mouth (out in the room)
    // spindle body — a blob squashed long on Y (hangs vertically), tapered ends
    const body=blob(cx, cy, cz, 0.115, 0.24, 0.11, P.wrap, 8, 6);
    // taper the top + bottom rings inward to spindle points
    body.forEach((rg,k)=>{
      const t=k/6;
      const taper = (t<0.2||t>0.8)? 0.55 : 1.0;          // pinch the ends
      rg.forEach(p=>{ p.x=cx+(p.x-cx)*taper; p.z=cz+(p.z-cz)*taper; });
    });
    // BINDING RINGS — 3 darker cinched silk bands across the cocoon (the wrap read)
    for(const by of [cy-0.10, cy, cy+0.10]){
      const a=ring(V(cx,by-0.012,cz), V(0,1,0), 0.108, 0.104, 8, Math.PI/8);
      const b=ring(V(cx,by+0.012,cz), V(0,1,0), 0.108, 0.104, 8, Math.PI/8);
      stitch([a,b], ()=>P.bind);
    }
    // a lit wrap highlight down the front
    quad(V(cx-0.03,cy-0.14,cz+0.11), V(cx+0.03,cy-0.14,cz+0.11),
         V(cx+0.025,cy+0.14,cz+0.10), V(cx-0.025,cy+0.14,cz+0.10), P.wrapLt, 0.04);
    // SUSPENSION strands — two pale lines from the cocoon top up into the web spokes
    const topPt=V(cx, cy+0.24, cz);
    tube(topPt, apex.clone().lerp(RIM[2],0.55), 0.007,0.006, 4, P.silkHi);
    tube(topPt, apex.clone().lerp(RIM[4],0.55), 0.007,0.006, 4, P.silkHi);
  }

  /* base disc — Large piece (r=0.42). Post feet touch down; darker lair-floor tone. */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.42, 0.42, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.40, 0.40, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
