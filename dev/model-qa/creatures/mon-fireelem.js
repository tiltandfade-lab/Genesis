/* dev/model-qa/creatures/mon-fireelem.js — the FIRE ELEMENTAL (REBUILD), authored under
   docs/MODEL-FOUNDRY.md's 1,000-2,000 tri band (foundry pilot, rebuild-w4 cell 2). ELEMENTAL
   family, Large, CR 5, realm core. Preserves the ORIGINAL palette intent and named signature
   (the layered flame-tongue ladder: near-white core -> yellow -> orange -> deep-red edges) but
   replaces the geometry: the whole body is thrown into a forward-upward SURGE rather than
   standing as a vertical column, so FIRE reads distinct from earth (mass, planted) and water
   (a rolling wave) by its motion — fire is the element that visibly RISES and LEAPS.

   FEATURE CHECKLIST (baked at 682 tris — UNDER the 1,000-2,000 band; left there rather than
   padded per law 1, since every added ring/segment above was a genuine feature — a fray, a
   lick, an ember — not a smoothing pass. Flagging for the orchestrator's gate call.):
     1. ELEMENTAL rising vortex torso — no legs, a swirling tapered flame-skirt "foot" that
        pinches to a waist and blooms into a shoulder crown, EVERY ring leaned progressively
        forward+up the taller it gets, so the whole column reads as a body caught mid-leap
        rather than a planted bonfire.
     2. SIGNATURE — the layered flame-tongue value ladder (near-white core -> yellow -> orange
        -> deep-red outer edges) carried up the vortex AND onto both arm-tongues, the CORE
        riding the lit front face as the high-value zone (law 3/4).
     3. The whipped-high arm — one flame arm thrown up and back over the crest, fraying into
        three long trailing tongues that sweep BEHIND the head (the flare's leading edge).
     4. The counter-swept low arm — the second arm trails low and back on the opposite side,
        a shorter frayed lick, reading as the drag/wake of the surge (asymmetry sells motion).
     5. Head-crest — a hooded flame crown swept hard backward by its own draft, two white-hot
        eye slits in dark recessed sockets.
     6. Breaking embers — a scatter of bright teardrop flecks strung out ALONG the arm-tongues'
        motion arc (not just hovering at the shoulder), reading as sparks shedding off the surge.

   POSE SENTENCE: the whole body is mid-surge, leaning up-and-forward off the base disc as if
   leaping off the ground, one arm whipped high overhead trailing three long flame tongues back
   past the crest, the other arm swept low and back as the counter-drag, embers breaking free
   and scattering along the whip's arc — the flare, not a standing bonfire.

   Whole-object grammar: one function, one geometry frame, no anchors. Spine +z (front), up +y,
   ground y=0. Imported by ps1-sheet.html (SETS['rebuild-w4'], cell 2, fn buildFireElemental). */
import { THREE, V, quad, tube, stack, ring, stitch, capFan } from '../probe-lib.js';

export function buildFireElemental(){
  /* ---------- PALETTE (preserved: the sanctioned exception — real flame brightness, not the
     VS-desaturated house palette, so it GLOWS against the void). ---------- */
  /* R2 SELF-CORRECTION (post r1 engine render): r1's near-white core sampled far too dark
     in-engine (max ~148/255, <0.1% of non-void pixels over 140) — the value-contrast law 3
     zone didn't actually read. Lifted the whole hot end of the ladder several steps brighter
     (white/whiteHot/yellow pushed toward pure white/near-white) so the core survives the
     shader's ambient dimming and dithering; cooler tiers (orange/red) left alone so the ladder
     itself still reads as a gradient, not a flat wash. */
  const P = {
    white:0xffffff,     /* near-white heart — reserved for the SLIM front-core flame + eye
                            highlights only (small elements; fine if ambient-only dims them) */
    whiteHot:0xffffff,  /* the eye slits + brightest embers */
    gold:0xffd54a,      /* R2 CRITIC FIX: large-area torso-band "hot" fill. Pure white on big
                            quads reads as flat neutral GRAY under this shader's ambient-heavy
                            (0.32 ambient / 0.72+0.22 directional) lighting whenever a face isn't
                            strongly key-lit — measured in-engine: (148,148,148), reading as
                            STONE, not fire (the exact earth-elemental collision this creature
                            must avoid). A warm gold keeps its hue even at ambient-only levels. */
    yellow:0xffe066,    /* inner flame body — pushed more saturated so ambient-only dimming still
                            reads gold, not muddy khaki (measured (122,94,23) before the fix) */
    yellowDk:0xffc94d,  /* yellow shading, lifted */
    orange:0xff9a3d,    /* mid tongues — brighter/more saturated */
    orangeDk:0xd9631a,  /* orange shading */
    red:0xd6421f,       /* deep-red outer tongue tips — brighter; r1/r2 render sampled near-void
                            (97,3,0) at the frayed tips (thin dark-red = law-3 dark-on-dark) */
    redDk:0xa8321a,     /* darkest outer flame, lifted off the void floor */
    disc:0x2e2622, discTop:0x3a2f26, discGlow:0x6e3a1e,   /* the disc catches a little firelight */
  };

  /* ---------- LANDMARKS — a surging vortex ~1.75u tall. No hips, no legs: a flaring foot
     pinches to a waist and blooms into a shoulder crown, then the crest. LEAN grows with height
     (the surge) — each band's center is pushed +z (forward) and slightly +x as y increases. ---------- */
  const L = {
    baseY:0.05, heartY:0.34, waistY:0.70, chestY:0.98, shldY:1.20,
    crestY:1.38, tipY:1.66,
  };
  const lean = (y)=>{ const t = Math.max(0, y - L.baseY) / (L.tipY - L.baseY); return { dz: t*t*0.34, dx: t*0.08 }; };

  /* ===== VORTEX COLUMN — swirling tapered body, hot core at center, leaning into the surge. ===== */
  {
    const n = 10;
    const bands = [
      {y:L.baseY,  rx:0.40, rz:0.36, back:P.orangeDk, front:P.orange,   tw:0.00, sc:0.0},
      {y:0.18,     rx:0.34, rz:0.31, back:P.orange,   front:P.yellow,   tw:0.18, sc:0.03},
      {y:L.heartY, rx:0.30, rz:0.27, back:P.yellowDk, front:P.gold,     tw:0.38, sc:0.04},  /* hot heart */
      {y:0.52,     rx:0.225,rz:0.205,back:P.yellow,   front:P.gold,     tw:0.60, sc:0.05},
      {y:L.waistY, rx:0.175,rz:0.160,back:P.yellow,   front:P.gold,     tw:0.86, sc:0.05},  /* gold-hot waist */
      {y:0.85,     rx:0.225,rz:0.205,back:P.yellowDk, front:P.gold,     tw:1.06, sc:0.05},
      {y:L.chestY, rx:0.27, rz:0.225,back:P.orange,   front:P.yellow,   tw:1.24, sc:0.06},
      {y:L.shldY,  rx:0.285,rz:0.225,back:P.orangeDk, front:P.yellowDk, tw:1.36, sc:0.06},
      {y:L.crestY, rx:0.150,rz:0.135,back:P.redDk,    front:P.orange,   tw:1.46, sc:0.04},
    ];
    const rings = bands.map(b=>{
      const lz = lean(b.y);
      const rg = ring(V(lz.dx, b.y, lz.dz), V(0,1,0), b.rx, b.rz, n, Math.PI/n + b.tw);
      rg.forEach((p,i)=>{ p.x += Math.sin(i*1.3 + b.tw*3)*b.sc; p.z += Math.cos(i*1.7 + b.tw*3)*b.sc; });
      return rg;
    });
    for(let b=0;b<rings.length-1;b++){
      for(let i=0;i<n;i++){
        const i2=(i+1)%n;
        const a=rings[b][i], c=rings[b][i2], d=rings[b+1][i2], e=rings[b+1][i];
        const zc = (a.z+c.z+d.z+e.z)/4, xc=(a.x+c.x+d.x+e.x)/4;
        const lit = (zc - lean(bands[b].y).dz) > -0.02 && Math.abs(xc - lean(bands[b].y).dx) < (bands[b].rx*0.85);
        quad(a, c, d, e, lit ? bands[b].front : bands[b].back, 0.05);
      }
    }
    capFan(rings[0], V(0,L.baseY-0.02,0), P.orangeDk, true);
  }

  /* ===== FRONT CORE FLAME — slim WHITE-HOT tongue riding proud on the lit front of the belly,
     following the same forward lean so the near-white heart still reads dead-center of the
     surge's lit face. Jitter 0 (brightest quads stay clean). ===== */
  {
    const flame = (x, y0, y1, w0, w1, zoff0, zoff1, hex0, hex1)=>{
      const l0=lean(y0), l1=lean(y1);
      const z0 = l0.dz+zoff0, z1 = l1.dz+zoff1, x0=x+l0.dx, x1=x+l1.dx;
      quad(V(x0-w0, y0, z0), V(x0+w0, y0, z0), V(x1+w1, y1, z1), V(x1-w1, y1, z1), hex0, 0.0);
      if(hex1) quad(V(x1-w1, y1, z1), V(x1+w1, y1, z1), V(x1, y1+0.10, z1-0.03), V(x1, y1+0.10, z1-0.03), hex1, 0.0);
    };
    /* R2 CRITIC FIX: this panel spans nearly the whole torso height (heartY-0.04 to chestY) — not
       actually "slim" — so painting it P.whiteHot/P.white was the single biggest offender behind
       the flat-gray torso patch (isolated, measured (122,122,122) in the r2 render, unmoved by
       the vortex-band gold fix above because this is a separate quad set). Switched to P.gold so
       the panel keeps its warm hue under ambient-only shading instead of flattening to stone-gray. */
    flame(0.0, L.heartY-0.04, L.waistY, 0.19, 0.14, 0.24, 0.26, P.gold, null);
    flame(0.0, L.waistY,      0.90,     0.14, 0.16, 0.26, 0.25, P.gold,    null);
    flame(0.0, 0.90,          L.chestY, 0.16, 0.11, 0.25, 0.22, P.gold, P.yellow);
    const lh = lean(L.heartY);
    quad(V(lh.dx-0.06, L.heartY, lh.dz+0.25), V(lh.dx+0.06, L.heartY, lh.dz+0.25),
         V(lh.dx+0.05, L.heartY+0.10, lh.dz+0.24), V(lh.dx-0.05, L.heartY+0.10, lh.dz+0.24), P.whiteHot, 0.0);
  }

  /* ===== HEAD-CREST — hooded flame crown swept hard backward by the surge's own draft (the
     lean carries through), two WHITE-HOT eye slits set into dark recessed sockets. ===== */
  {
    const n=8, ph=Math.PI/n;
    const bands=[
      {y:L.crestY,      rx:0.150,rz:0.135, hex:P.orange, sweep:0.00},
      {y:L.crestY+0.09, rx:0.145,rz:0.122, hex:P.yellow, sweep:0.03},
      {y:L.crestY+0.18, rx:0.110,rz:0.094, hex:P.yellow, sweep:0.08},
      {y:1.56,          rx:0.062,rz:0.050, hex:P.orange, sweep:0.16},
    ];
    const rings=bands.map(b=>{
      const lz=lean(b.y);
      return ring(V(lz.dx, b.y, lz.dz - b.sweep), V(0,1,0), b.rx, b.rz, n, ph);
    });
    stitch(rings, b=>bands[b].hex);
    const ltip = lean(L.tipY);
    capFan(rings[3], V(ltip.dx+0.02, L.tipY, ltip.dz-0.22), P.red);
    const lc = lean(L.crestY);
    for(const s of [-1,1]){
      const ex=lc.dx+s*0.055, ey=L.crestY+0.065, ez=lc.dz+0.145;
      quad(V(ex-0.028,ey-0.020,ez-0.03), V(ex+0.028,ey-0.020,ez-0.03),
           V(ex+0.024,ey+0.038,ez-0.05), V(ex-0.024,ey+0.038,ez-0.05), P.redDk, 0.0);
      quad(V(ex-0.012,ey-0.004,ez), V(ex+0.012,ey-0.004,ez),
           V(ex+0.009,ey+0.024,ez-0.02), V(ex-0.009,ey+0.024,ez-0.02), P.whiteHot, 0.0);
    }
  }

  /* ===== THE WHIPPED-HIGH ARM — the flare's leading edge: thrown up and BACK over the crest,
     fraying into three long trailing flame tongues that sweep past the head (law 5: the highest-
     expression stroke in the pose). Rooted on the RIGHT shoulder. ===== */
  {
    const ls = lean(L.shldY);
    const S = V(0.24+ls.dx, L.shldY-0.02, ls.dz+0.02);
    const M = V(0.30+ls.dx, L.shldY+0.42, ls.dz-0.20);
    const T = V(0.18+ls.dx, L.crestY+0.30, ls.dz-0.46);       /* whipped up past the crest */
    tube(S, M, 0.135, 0.095, 8, P.yellow, {capA:{hex:P.yellowDk}});
    tube(M, T, 0.095, 0.058, 8, P.orange);
    const frays = [
      {dir:V(-0.10, 0.55, -1.00), len:0.52, r:0.050},   /* long central trail, streaming back */
      {dir:V( 0.35, 0.30, -0.80), len:0.42, r:0.042},   /* outer trail */
      {dir:V(-0.45, 0.10, -0.55), len:0.34, r:0.036},   /* short inner lick */
    ];
    for(const f of frays){
      const d = f.dir.clone().normalize();
      const mid = T.clone().addScaledVector(d, f.len*0.5);
      const end = T.clone().addScaledVector(d, f.len);
      tube(T, mid, f.r, f.r*0.68, 6, P.orange);
      /* R2 CRITIC FIX: tip radius was 0.011 (0.022u diameter) — under the 0.04u minimum-feature
         floor (law 3), and the r1/r2 render confirms it dissolving toward the void at the tips.
         Floor-clamped to 0.022 radius (0.044u diameter). */
      tube(mid, end, f.r*0.68, 0.022, 6, P.red, {capB:{hex:P.redDk, lift:0.015}});
    }
  }

  /* ===== THE COUNTER-SWEPT LOW ARM — the surge's drag/wake on the opposite side: shorter,
     trailing low and back, a single frayed lick (asymmetry vs. the whipped-high arm sells the
     motion — this is NOT a mirrored pose). Rooted on the LEFT shoulder. ===== */
  {
    const ls = lean(L.chestY);
    /* R2 CRITIC FIX: original S/M/T (x -0.26/-0.44/-0.40, z +0.02/-0.18/-0.34) trailed the arm
       onto the far/back-left of the body — directly AWAY from the gate camera (yaw 45, standing
       at +x/+z) — so it rendered fully occluded behind the torso (verified: zero trace in the
       r1/r2 capture's lower-body region). Swung wider in -x (clears the torso's rx~0.27-0.40
       silhouette) and pulled the z trail in (dz+0.08/-0.02/-0.10 instead of +0.02/-0.18/-0.34)
       so it stays inside the camera-visible frontal hemisphere while still reading low/back
       relative to the whipped-high arm — the asymmetry now actually reaches the render. */
    const S = V(-0.32+ls.dx, L.chestY+0.02, ls.dz+0.08);
    const M = V(-0.58+ls.dx, L.heartY+0.08, ls.dz-0.02);
    const T = V(-0.60+ls.dx, L.baseY+0.16, ls.dz-0.10);       /* trailing low and out to the side */
    tube(S, M, 0.115, 0.075, 8, P.orange, {capA:{hex:P.orangeDk}});
    tube(M, T, 0.075, 0.045, 8, P.red);
    const frays = [
      {dir:V(-0.55, -0.30, -0.55), len:0.30, r:0.038},
      {dir:V(-0.25, -0.55, -0.35), len:0.24, r:0.032},
      {dir:V(-0.40, -0.75, -0.05), len:0.20, r:0.028},   /* third, shorter downward drag lick */
    ];
    for(const f of frays){
      const d = f.dir.clone().normalize();
      const mid = T.clone().addScaledVector(d, f.len*0.5);
      const end = T.clone().addScaledVector(d, f.len);
      tube(T, mid, f.r, f.r*0.68, 6, P.orangeDk);
      /* R2 CRITIC FIX: tip radius floor-clamped 0.010 -> 0.022 (see high-arm note above). */
      tube(mid, end, f.r*0.68, 0.022, 6, P.redDk, {capB:{hex:P.redDk, lift:0.012}});
    }
  }

  /* ===== SHOULDER LICKS — small tongues off the crown/shoulders to break the silhouette and
     sell "roaring" from the body itself, not just the arms. ===== */
  {
    const lick = (x,y,z, dir, len, r, hex0, hex1)=>{
      const d=dir.clone().normalize();
      const mid=V(x,y,z).addScaledVector(d, len*0.5), end=V(x,y,z).addScaledVector(d, len);
      tube(V(x,y,z), mid, r, r*0.7, 6, hex0);
      /* R2 CRITIC FIX: tip radius floor-clamped 0.010 -> 0.022 (0.04u minimum-feature law). */
      tube(mid, end, r*0.7, 0.022, 6, hex1, {capB:{hex:P.redDk, lift:0.012}});
    };
    const lc = lean(L.shldY);
    lick(-0.10+lc.dx, L.shldY+0.05, lc.dz+0.05, V(-0.25,0.9,-0.35), 0.26, 0.05, P.orange, P.red);
    lick( 0.02+lc.dx, L.crestY-0.02, lc.dz-0.02, V(0.10,0.9,-0.45), 0.24, 0.045, P.orange, P.red);
    lick( 0.20+lc.dx, L.chestY+0.02, lc.dz+0.10, V(0.30,1.0,-0.20), 0.20, 0.040, P.orange, P.red);
  }

  /* ===== EMBER FLECKS — bright teardrop sparks strung out ALONG the whipped-arm's trailing
     arc (not just hovering at the shoulder) so the surge visibly SHEDS fire, plus a couple off
     the low arm's wake. Jitter 0 so they stay clean and pop. ===== */
  {
    const ember = (x,y,z,r,hex)=>quad(
      V(x-r,y,z), V(x+r,y,z), V(x+r*0.3,y+r*2.4,z-r*0.3), V(x-r*0.3,y+r*2.4,z-r*0.3), hex, 0.0);
    /* strung along the whipped-high arm's arc, trailing back past the head */
    ember( 0.40, L.crestY+0.44, -0.30, 0.015, P.whiteHot);
    ember( 0.10, L.crestY+0.58, -0.58, 0.013, P.yellow);
    ember(-0.18, L.crestY+0.40, -0.78, 0.012, P.orange);
    ember( 0.30, L.shldY+0.30, -0.10, 0.012, P.yellow);
    ember( 0.46, L.crestY+0.20, -0.06, 0.011, P.orange);
    /* a couple off the low arm's wake and the crest, sparser */
    ember(-0.46, L.heartY+0.06, -0.28, 0.011, P.orange);
    ember(-0.14, L.crestY+0.10, -0.34, 0.010, P.yellow);
    ember(-0.52, L.baseY+0.34, -0.44, 0.010, P.orange);
  }

  /* ---------- BASE DISC (r=0.48). The flame-foot flares over it; a warm glow rim where the
     fire meets the stone. Unchanged from the original — the surge is entirely upper-body. ---------- */
  {
    const r1=ring(V(0,0.002,0), V(0,1,0), 0.48, 0.48, 16);
    const r2=ring(V(0,0.055,0), V(0,1,0), 0.46, 0.46, 16);
    stitch([r1,r2], ()=>P.disc);
    capFan(r2, V(0,0.058,0), P.discTop);
    const g1=ring(V(0,0.060,0), V(0,1,0), 0.40, 0.38, 12, Math.PI/12);
    const g2=ring(V(0,0.062,0), V(0,1,0), 0.26, 0.24, 12, Math.PI/12);
    stitch([g1,g2], ()=>P.discGlow);
  }
}
