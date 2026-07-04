/* dev/model-qa/creatures/mon-earthelem.js — the EARTH ELEMENTAL: a WALKING LANDSLIDE. Whole-object
   grammar: one function, one geometry frame, no anchors. The golem's WILD cousin — where the golem
   is FITTED MASONRY (square-cut blocks, clean seams), the earth elemental is a hulking headless-read
   mass of clustered ROUND BOULDERS: an enormous back/shoulder boulder pair, two massive
   knuckle-dragging boulder arms planted on the disc (it leans gorilla-like), a low jutting brow-ledge
   with two deep-set amber ember eyes (its only feature), and NO legs — the lower body is a skirt of
   smaller rocks dragging on the disc. Uneven natural stone (grey-brown mix, one mossy patch, pale
   chipped edges). The read: the hillside got up. ~1.8u tall.
   Imported by mon-earthelem-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan, blob } from '../probe-lib.js';

export function buildEarthElemental(){
  /* ---------- PALETTE (uneven natural rock — grey-brown mix, VS-desaturated + earthy) ---------- */
  const P = {
    rockA:0x6a6258,   /* pale grey-brown boulder */
    rockB:0x554d43,   /* mid brown boulder */
    rockC:0x484036,   /* darker brown boulder */
    rockD:0x726a5c,   /* lightest lit rock */
    shadow:0x322c25,  /* deep crevice shadow between boulders */
    chip:0x9c8f7b,    /* pale chipped/broken stone edge */
    moss:0x6e7d43, mossDk:0x515e30,   /* the one mossy patch — brighter so it reads against the rock */
    eye:0xd08a2a, eyeCore:0xf0b048,   /* deep-set amber ember eyes */
    disc:0x3a352b, discTop:0x46402f,
  };

  /* a rounded BOULDER — a stacked-ring lump (like blob) but deliberately lumpy: each ring gets a
     per-vertex jitter so no boulder is a clean sphere. Draws straight into the frame. */
  function boulder(cx, cy, cz, rx, ry, rz, hex, lump = 0.10, n = 8, bands = 5, seed = 1){
    let s = seed >>> 0;
    const rnd = ()=>{ s = (s*1664525 + 1013904223) >>> 0; return (s>>>8)/16777216; };
    const rings = [];
    for(let k=0;k<=bands;k++){
      const t=k/bands, ang=t*Math.PI, yy=cy + ry*(-Math.cos(ang)), rr=Math.sin(ang);
      const rg = ring(V(cx,yy,cz), V(0,1,0), rx*rr+0.0001, rz*rr+0.0001, n, Math.PI/n);
      rg.forEach(p=>{ p.x += (rnd()*2-1)*lump*rr; p.y += (rnd()*2-1)*lump*0.4; p.z += (rnd()*2-1)*lump*rr; });
      rings.push(rg);
    }
    stitch(rings, ()=>hex);
    return rings;
  }

  /* ---------- LANDMARKS — a hunched gorilla-leaning mass ~1.8u tall, NO head sits above the
     shoulders (headless read): the brow-ledge is set into the front of the shoulder mass. ---------- */
  const L = {
    backY:1.30, shoulderX:0.42, browY:1.02,
  };

  /* ===== CORE MASS — the hunched barrel body, a big lumpy central boulder mass the limbs cluster
     onto. Broad low core rising to the humped back. ===== */
  boulder(0.0, 0.85, -0.02, 0.42, 0.52, 0.40, P.rockB, 0.10, 9, 6, 11);
  /* a darker lower belly lump sagging toward the disc */
  boulder(0.0, 0.42, 0.06, 0.40, 0.30, 0.36, P.rockC, 0.09, 8, 4, 23);

  /* ===== BACK / SHOULDER BOULDER PAIR — the enormous humped mass over the shoulders, the dominant
     silhouette. Two big rounded boulders side by side, riding high and back (the "the hillside got
     up" hump). Distinct lightness so the pair reads as two rocks, not one dome. ===== */
  boulder(-0.24, L.backY, -0.10, 0.34, 0.36, 0.34, P.rockA, 0.11, 8, 5, 5);
  boulder( 0.26, L.backY-0.03, -0.08, 0.36, 0.38, 0.35, P.rockD, 0.11, 8, 5, 41);
  /* a crevice-shadow wedge between the two back boulders so the pair reads distinctly */
  quad(V(-0.02, L.backY+0.22, 0.10), V(0.02, L.backY+0.22, 0.10),
       V(0.03, L.backY-0.30, 0.02), V(-0.03, L.backY-0.30, 0.02), P.shadow, 0.04);

  /* ===== BROW-LEDGE + EYES — a low jutting rock brow set into the FRONT of the shoulder mass (the
     head is not a separate lump — the face is IN the boulders). A dark undercut socket band with two
     deep-set amber ember eyes. This is the ONLY feature. ===== */
  {
    const bz = 0.34;   /* front plane of the brow */
    /* the jutting brow-ledge — a flattened wedge boulder overhanging the eyes */
    const bl = boulder(0.0, L.browY+0.14, 0.20, 0.30, 0.13, 0.22, P.rockA, 0.06, 8, 3, 77);
    bl.forEach(rg=>rg.forEach(p=>{ if(p.z>0.30) p.y += 0.02; }));   /* tip the front lip down (overhang) */
    /* the deep-shadow socket band UNDER the ledge (recessed dark) */
    quad(V(-0.26, L.browY+0.02, bz-0.02), V(0.26, L.browY+0.02, bz-0.02),
         V(0.24, L.browY-0.10, bz-0.06), V(-0.24, L.browY-0.10, bz-0.06), P.shadow, 0.03);
    /* two deep-set amber ember eyes — authored at a SHARED fixed y (ey) so they read dead-level, each
       set in a dark recessed socket with a hot core. Proud on +z so the amber catches the light. */
    const ey = L.browY - 0.02;      /* single shared eye height — no per-eye drift */
    for(const s of [-1,1]){
      const ex=s*0.13, ez=bz+0.005;
      quad(V(ex-0.058,ey-0.032,ez-0.03), V(ex+0.058,ey-0.032,ez-0.03),
           V(ex+0.052,ey+0.030,ez-0.06), V(ex-0.052,ey+0.030,ez-0.06), P.shadow, 0.0);    /* socket */
      quad(V(ex-0.034,ey-0.020,ez), V(ex+0.034,ey-0.020,ez),
           V(ex+0.032,ey+0.022,ez-0.02), V(ex-0.032,ey+0.022,ez-0.02), P.eye, 0.0);        /* amber */
      quad(V(ex-0.015,ey-0.007,ez+0.008), V(ex+0.015,ey-0.007,ez+0.008),
           V(ex+0.014,ey+0.011,ez+0.003), V(ex-0.014,ey+0.011,ez+0.003), P.eyeCore, 0.0);  /* hot core */
    }
  }

  /* ===== BOULDER ARMS — two MASSIVE knuckle-dragging arms of stacked round boulders, planted on
     the disc (it leans gorilla-like on them). Each: a big shoulder boulder → a forearm boulder →
     a huge rounded knuckle-boulder resting ON the disc. Held wide and forward. ===== */
  {
    const arm=(sign, seed)=>{
      const sx = sign*L.shoulderX;
      /* shoulder boulder (high, out to the side) */
      boulder(sx+sign*0.10, 1.02, 0.06, 0.26, 0.26, 0.25, P.rockC, 0.10, 8, 4, seed);
      /* forearm boulder (dropping down and forward toward the ground) */
      boulder(sx+sign*0.16, 0.58, 0.20, 0.24, 0.28, 0.24, P.rockB, 0.10, 8, 4, seed+7);
      /* a connecting mid lump so the arm reads continuous, not two floating rocks */
      boulder(sx+sign*0.13, 0.80, 0.13, 0.20, 0.20, 0.20, P.rockA, 0.08, 8, 3, seed+13);
      /* the huge KNUCKLE boulder resting on the disc (the gorilla plant) — flattened at the bottom */
      const kb = boulder(sx+sign*0.20, 0.24, 0.30, 0.28, 0.24, 0.26, P.rockD, 0.10, 9, 5, seed+21);
      kb.forEach((rg,k)=>{ if(k<=1) rg.forEach(p=>{ if(p.y<0.06) p.y=0.02; }); });   /* flatten onto disc */
      /* 3 rounded knuckle bumps on the front-top of the fist */
      for(const kx of [-0.12,0,0.12]){
        boulder(sx+sign*0.20+kx, 0.34, 0.48, 0.075, 0.065, 0.070, P.rockA, 0.04, 6, 3, seed+31+kx*100|0);
      }
    };
    arm(-1, 101);
    arm( 1, 211);
  }

  /* ===== LOWER SKIRT — NO legs: a ring of smaller rocks dragging on the disc under the core mass,
     so the body ends in a rubble skirt rather than feet. Uneven sizes/tones around the base. ===== */
  {
    const skirt = [
      {a:  0.30, r:0.30, sz:0.16, hex:P.rockC, sd:1},
      {a:  1.10, r:0.30, sz:0.13, hex:P.rockB, sd:2},
      {a:  1.90, r:0.28, sz:0.15, hex:P.rockA, sd:3},
      {a:  2.70, r:0.30, sz:0.12, hex:P.rockC, sd:4},
      {a:  3.30, r:0.32, sz:0.17, hex:P.rockB, sd:5},   /* the back-drag pile (biggest) */
      {a:  4.00, r:0.30, sz:0.14, hex:P.rockD, sd:6},
      {a:  4.90, r:0.28, sz:0.13, hex:P.rockA, sd:7},
      {a:  5.60, r:0.30, sz:0.15, hex:P.rockC, sd:8},
    ];
    for(const s of skirt){
      const x=Math.cos(s.a)*s.r, z=Math.sin(s.a)*s.r - 0.02;
      const b = boulder(x, s.sz*0.55, z, s.sz, s.sz*0.85, s.sz, s.hex, 0.05, 7, 3, s.sd*17+3);
      b.forEach((rg,k)=>{ if(k<=1) rg.forEach(p=>{ if(p.y<0.05) p.y=0.015; }); });   /* sit on the disc */
    }
  }

  /* ===== SURFACE DETAIL — the one mossy patch (top of the left back boulder), a few pale chipped
     edges, and a couple crevice cracks. Sells "natural weathered rock", not carved. ===== */
  {
    /* MOSS patch — a soft green cluster draped over the crown of the RIGHT back boulder, tipped
       toward the camera (up + front) so it clearly reads. A cap-like patch of a few overlapping
       green quads following the boulder's rounded top. */
    const moss=(x,y,z,r,hex)=>quad(V(x-r,y,z-r*0.5), V(x+r,y,z-r*0.5),
                                   V(x+r*0.8,y+r*0.35,z+r), V(x-r*0.8,y+r*0.35,z+r), hex, 0.06);
    moss( 0.20, L.backY-0.02, 0.30, 0.17, P.moss);     /* main patch, front-facing crown of right shoulder */
    moss( 0.30, L.backY-0.08, 0.32, 0.12, P.mossDk);   /* darker drip down the front face */
    moss( 0.10, L.backY-0.04, 0.32, 0.11, P.moss);     /* spreading toward center */
    moss( 0.24, L.backY-0.16, 0.34, 0.09, P.mossDk);   /* trailing lower */

    /* pale CHIPPED edges — flat bright facets where rock sheared off */
    const chip=(x,y,z,r)=>quad(V(x-r,y+r,z), V(x+r,y+r*0.4,z), V(x+r*0.6,y-r,z+r*0.3), V(x-r*0.6,y-r*0.6,z+r*0.3), P.chip, 0.05);
    chip( 0.44, L.backY+0.02, 0.12, 0.10);   /* right back boulder shear */
    chip( 0.40, 0.30, 0.34, 0.09);           /* right knuckle chip */
    chip(-0.42, 0.32, 0.30, 0.08);           /* left knuckle chip */
    chip( 0.10, 0.66, 0.30, 0.07);           /* belly chip */

    /* dark CREVICE cracks running down the front core (deep shadow lines) */
    const crack=(x0,y0,x1,y1,z,w)=>quad(V(x0-w,y0,z), V(x0+w,y0,z), V(x1+w,y1,z), V(x1-w,y1,z), P.shadow, 0.02);
    crack(-0.10, 0.90, -0.04, 0.50, 0.34, 0.015);
    crack( 0.14, 0.78,  0.20, 0.40, 0.32, 0.015);
  }

  /* ---------- BASE DISC (r=0.48). The rubble skirt + knuckle boulders sit ON it. ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
  }
}
