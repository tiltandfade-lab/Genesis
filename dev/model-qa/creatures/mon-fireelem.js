/* dev/model-qa/creatures/mon-fireelem.js — the FIRE ELEMENTAL: LIVING FLAME. Whole-object grammar:
   one function, one geometry frame, no anchors. Where every other Genesis figure obeys the
   VS-desaturated palette, THIS ONE is the sanctioned exception — it is built in real flame values
   (near-white core → yellow → orange → deep-red outer tongues) so it GLOWS against the void. No
   legs: a swirling tapered vortex-column flares onto the disc like a bonfire's heart, rises into a
   broad-shouldered torso suggestion, and throws two sweeping ARM-TONGUES that each fray into 2-3
   smaller flame-tip tubes. The head is a hooded flame-crest with two WHITE-HOT eye slits. A few
   detached ember flecks rise just off the shoulders (the magic-float exception, within a hand's
   width). Jitter 0 on the brightest core quads so they read clean and bright.
   Imported by mon-fireelem-probe.html + the proof sheet. */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildFireElemental(){
  /* ---------- PALETTE (THE EXCEPTION: real flame brightness, not desaturated) ---------- */
  const P = {
    white:0xfff4d8,     /* near-white heart — the hottest core */
    whiteHot:0xffffff,  /* the eye slits + brightest embers */
    yellow:0xffdd55,    /* inner flame body */
    yellowDk:0xf5b427,  /* yellow shading */
    orange:0xf2892c,    /* mid tongues */
    orangeDk:0xd9631a,  /* orange shading */
    red:0xb8331a,       /* deep-red outer tongue tips */
    redDk:0x8a2412,     /* darkest outer flame */
    disc:0x2e2622, discTop:0x3a2f26, discGlow:0x6e3a1e,   /* the disc catches a little firelight */
  };

  /* ---------- LANDMARKS — a rising vortex ~1.7u. No hips, no legs: the base is a broad flaring
     heart that pinches into a waist and blooms into a shoulder crown, then the head-crest. ---------- */
  const L = {
    baseY:0.05, heartY:0.34, waistY:0.72, chestY:1.02, shldY:1.24,
    crestY:1.42, tipY:1.70,
  };

  /* ===== VORTEX COLUMN — the swirling tapered body, hot core at the center. Built as a stack of
     rings that TWIST (each ring rotated a little more) so the loft reads as a spiralling flame,
     brightest at the base heart, cooling upward toward the crest. ===== */
  {
    const n = 10;
    /* value ladder is set PER-RING and also brightened on the FRONT arc (the vertices facing +z, the
       camera) so the near-white heart actually reads: outer/back stays orange→red, the lit belly
       glows white→yellow. front[] lists the front-facing vertex indices for an n=10 ring at phase π/n. */
    const bands = [
      {y:L.baseY,  rx:0.40, rz:0.36, back:P.orangeDk, front:P.orange,   tw:0.00, sc:0.0},  /* broad flaring foot */
      {y:0.18,     rx:0.34, rz:0.31, back:P.orange,   front:P.yellow,   tw:0.18, sc:0.03},
      {y:L.heartY, rx:0.30, rz:0.27, back:P.yellowDk, front:P.white,    tw:0.38, sc:0.04},  /* hot heart — white front */
      {y:0.52,     rx:0.235,rz:0.215,back:P.yellow,   front:P.white,    tw:0.60, sc:0.05},
      {y:L.waistY, rx:0.185,rz:0.170,back:P.yellow,   front:P.whiteHot, tw:0.85, sc:0.05},  /* white-hot waist */
      {y:0.88,     rx:0.24, rz:0.215,back:P.yellowDk, front:P.white,    tw:1.05, sc:0.05},
      {y:L.chestY, rx:0.285,rz:0.235,back:P.orange,   front:P.yellow,   tw:1.22, sc:0.06},  /* broadening chest */
      {y:L.shldY,  rx:0.30, rz:0.235,back:P.orangeDk, front:P.yellowDk, tw:1.34, sc:0.06},  /* broad shoulders */
      {y:L.crestY, rx:0.155,rz:0.140,back:P.redDk,    front:P.orange,   tw:1.44, sc:0.04},  /* pinch to crest */
    ];
    const rings = bands.map(b=>{
      const rg = ring(V(0,b.y,0), V(0,1,0), b.rx, b.rz, n, Math.PI/n + b.tw);
      rg.forEach((p,i)=>{ p.x += Math.sin(i*1.3 + b.tw*3)*b.sc; p.z += Math.cos(i*1.7 + b.tw*3)*b.sc; });
      return rg;
    });
    /* front-facing quads (those whose center faces +z) get the bright `front` hex; the rest `back`.
       We test each quad's average z sign after the twist to decide. */
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        const a=rings[b][i], c=rings[b][i2], d=rings[b+1][i2], e=rings[b+1][i];
        const zc = (a.z+c.z+d.z+e.z)/4, xc=(a.x+c.x+d.x+e.x)/4;
        const lit = zc > -0.02 && Math.abs(xc) < (bands[b].rx*0.85);   /* the belly facing camera */
        quad(a, c, d, e, lit ? bands[b].front : bands[b].back, 0.05);
      }
    }
    capFan(rings[0], V(0,L.baseY-0.02,0), P.orangeDk, true);
  }

  /* ===== FRONT CORE FLAME — a slim WHITE-HOT tongue riding PROUD on the front (+z) of the belly, so
     the near-white heart reads unmistakably against the yellow body. A thin flame licking upward,
     white at the root cooling to yellow at its tip. Jitter 0 (brightest quads stay clean). ===== */
  {
    const zc = 0.26;   /* proud of the belly front plane */
    const flame = (x, y0, y1, w0, w1, z0, z1, hex0, hex1)=>{
      quad(V(x-w0, y0, z0), V(x+w0, y0, z0), V(x+w1, y1, z1), V(x-w1, y1, z1), hex0, 0.0);
      if(hex1) quad(V(x-w1, y1, z1), V(x+w1, y1, z1), V(x, y1+0.10, z1-0.03), V(x, y1+0.10, z1-0.03), hex1, 0.0);
    };
    /* three stacked bright plates up the belly centerline */
    flame(0.0, L.heartY-0.04, L.waistY, 0.16, 0.11, zc-0.02, zc, P.whiteHot, null);
    flame(0.0, L.waistY,      0.94,     0.11, 0.13, zc, zc-0.01, P.white,    null);
    flame(0.0, 0.94,          L.chestY, 0.13, 0.09, zc-0.01, zc-0.03, P.white, P.yellow);
    /* a tiny bright core dot at the very heart */
    quad(V(-0.06, L.heartY, zc+0.01), V(0.06, L.heartY, zc+0.01),
         V(0.05, L.heartY+0.10, zc), V(-0.05, L.heartY+0.10, zc), P.whiteHot, 0.0);
  }

  /* ===== HEAD-CREST — a hooded flame crown pinching to a tapering tip, with two WHITE-HOT eye
     slits set into the front. Not a face — a suggestion of one in the fire. ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.crestY,      rx:0.155,rz:0.140, hex:P.orange},
      {y:L.crestY+0.10, rx:0.150,rz:0.128, hex:P.yellow},   /* hood swell */
      {y:L.crestY+0.20, rx:0.115,rz:0.100, hex:P.yellow},
      {y:1.60,          rx:0.070,rz:0.058, hex:P.orange},   /* narrowing to the tip */
    ];
    const rings=bands.map(b=>ring(V(0,b.y,0.01), V(0,1,0), b.rx, b.rz, n, ph));
    /* lean the crest back a touch (a flame swept by its own draft) */
    rings[2].forEach(p=>p.z-=0.02); rings[3].forEach(p=>p.z-=0.05);
    stitch(rings, b=>bands[b].hex);
    capFan(rings[3], V(0.0, L.tipY, -0.06), P.red);   /* the topmost red flame tip */
    /* two WHITE-HOT eye slits set into DARK recessed sockets so they read as burning eyes, not
       stray bright bits. Socket = deep-red carved hollow; slit = clean white-hot quad proud of it. */
    for(const s of [-1,1]){
      const ex=s*0.058, ey=L.crestY+0.075, ez=0.150;
      quad(V(ex-0.030,ey-0.020,ez-0.03), V(ex+0.030,ey-0.020,ez-0.03),
           V(ex+0.026,ey+0.040,ez-0.05), V(ex-0.026,ey+0.040,ez-0.05), P.redDk, 0.0);   /* dark socket */
      quad(V(ex-0.013,ey-0.004,ez), V(ex+0.013,ey-0.004,ez),
           V(ex+0.010,ey+0.026,ez-0.02), V(ex-0.010,ey+0.026,ez-0.02), P.whiteHot, 0.0); /* slit */
    }
  }

  /* ===== ARM-TONGUES — two sweeping curved tapering tubes thrown out from the shoulders, each
     FRAYING at its end into 2-3 smaller flame-tip tubes (yellow root → orange → deep-red tips).
     Curved by a mid control point so they read as flame LICKING outward and up, not stiff arms. ===== */
  {
    const armTongue = (sign)=>{
      const S  = V(sign*0.26, L.shldY-0.02, 0.04);                 /* shoulder root */
      const M  = V(sign*0.52, L.chestY+0.06, 0.10);                /* swept out + slightly up */
      const T  = V(sign*0.60, L.shldY+0.10, 0.02);                 /* curling back up (a flame's crook) */
      /* two segments give the curve; taper from broad yellow root to a thin orange wrist */
      tube(S, M, 0.13, 0.085, 8, P.yellow,   {capA:{hex:P.yellowDk}});
      tube(M, T, 0.085,0.055, 8, P.orange);
      /* FRAY — 3 smaller flame-tip tubes bursting from the wrist T, spread in a fan, red-tipped */
      const frays = [
        {dir:V(sign*0.35, 0.85, 0.10), len:0.34, r:0.052},   /* the tall central lick */
        {dir:V(sign*0.75, 0.55,-0.05), len:0.27, r:0.044},   /* outer lick */
        {dir:V(sign*0.05, 0.70, 0.45), len:0.24, r:0.040},   /* forward lick */
      ];
      for(const f of frays){
        const d = f.dir.clone().normalize();
        const mid = T.clone().addScaledVector(d, f.len*0.5);
        const end = T.clone().addScaledVector(d, f.len);
        tube(T, mid, f.r, f.r*0.72, 6, P.orange);
        tube(mid, end, f.r*0.72, 0.012, 6, P.red, {capB:{hex:P.redDk, lift:0.015}});
      }
    };
    armTongue(-1);
    armTongue( 1);
  }

  /* ===== SHOULDER LICKS — a couple of small flame tongues rising straight off the shoulders/crown
     to break the silhouette and sell "roaring", deep-red at the tips. ===== */
  {
    const lick = (x,y,z, dir, len, r)=>{
      const d=dir.clone().normalize();
      const mid=V(x,y,z).addScaledVector(d, len*0.5), end=V(x,y,z).addScaledVector(d, len);
      tube(V(x,y,z), mid, r, r*0.7, 6, P.orange);
      tube(mid, end, r*0.7, 0.010, 6, P.red, {capB:{hex:P.redDk, lift:0.012}});
    };
    lick(-0.12, L.shldY+0.06, 0.06, V(-0.2,1,0.15), 0.30, 0.055);
    lick( 0.14, L.chestY+0.10, 0.04, V(0.15,1,0.2), 0.26, 0.048);
    lick( 0.02, L.shldY+0.10,-0.10, V(0.0,1,-0.3),  0.22, 0.042);
  }

  /* ===== EMBER FLECKS — a few tiny BRIGHT quads rising just off the shoulders (within a hand's
     width — the sanctioned magic-float exception). White-hot + yellow, jitter 0 so they pop. ===== */
  {
    /* small teardrop sparks — narrow + short so they read as embers, not paper scraps */
    const ember = (x,y,z,r,hex)=>quad(
      V(x-r,y,z), V(x+r,y,z), V(x+r*0.3,y+r*2.4,z-r*0.3), V(x-r*0.3,y+r*2.4,z-r*0.3), hex, 0.0);
    ember(-0.31, L.shldY+0.16, 0.10, 0.014, P.yellow);
    ember( 0.34, L.chestY+0.22, 0.06, 0.013, P.orange);
    ember( 0.12, L.shldY+0.26,-0.06, 0.011, P.yellow);
    ember(-0.20, L.crestY+0.10, 0.12, 0.010, P.orange);
  }

  /* ---------- BASE DISC (r=0.48). The flame-foot flares over it; a warm glow rim where the fire
     meets the stone. ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
    /* a firelit inner glow ring on the disc top where the flame sits */
    const g1=ring(V(0,0.060,0), V(0,1,0), 0.40, 0.38, 12, Math.PI/12);
    const g2=ring(V(0,0.062,0), V(0,1,0), 0.26, 0.24, 12, Math.PI/12);
    stitch([g1,g2], ()=>P.discGlow);
  }
}
